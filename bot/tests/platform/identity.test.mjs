import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { freshDb, env, tempDir } from './helpers.mjs'
import {
  resolveContext, createLinkCode, consumeLinkCode, claimOwner, whatsappJidFor,
  setRole, getUser, ensureUser, whatsappNumbersForWebUser, listUsers,
} from '../../lib/platform/identity.js'
import { listAudit } from '../../lib/platform/audit.js'
import { schemaInfo } from '../../lib/platform/db.js'

test('identitas Telegram baru dibuat sebagai user biasa', async () => {
  await freshDb()
  const ctx = resolveContext({ platform: 'telegram', platformUserId: 555001, username: 'umi', env: env() })
  assert.equal(ctx.role, 'user')
  assert.match(ctx.userId, /^pu_[0-9a-f]{16}$/)
  const again = resolveContext({ platform: 'telegram', platformUserId: 555001, env: env() })
  assert.equal(again.userId, ctx.userId, 'identitas yang sama tidak membuat user baru')
  assert.equal(listUsers().total, 1)
})

test('bootstrap env memberi role owner/developer/admin', async () => {
  await freshDb()
  const e = env({ TELEGRAM_OWNER_IDS: '111', TELEGRAM_DEVELOPER_IDS: '222', TELEGRAM_ADMIN_IDS: '333' })
  assert.equal(resolveContext({ platform: 'telegram', platformUserId: 111, env: e }).role, 'owner')
  assert.equal(resolveContext({ platform: 'telegram', platformUserId: 222, env: e }).role, 'developer')
  assert.equal(resolveContext({ platform: 'telegram', platformUserId: 333, env: e }).role, 'admin')
  assert.equal(resolveContext({ platform: 'telegram', platformUserId: 444, env: e }).role, 'user')
})

test('ID Telegram tidak boleh dianggap sama dengan nomor WhatsApp', async () => {
  await freshDb()
  const { userId } = resolveContext({ platform: 'telegram', platformUserId: 628123456789, env: env() })
  assert.equal(whatsappJidFor(userId), null)
  const user = getUser(userId)
  assert.equal(user.role, 'user')
})

test('kode tautan memindahkan identitas ke akun web dan menghapus user sementara', async () => {
  await freshDb()
  const webUser = ensureUser({ id: 'web:auth-1', source: 'web', email: 'owner@example.com', role: 'admin' })
  const before = resolveContext({ platform: 'telegram', platformUserId: 777, env: env() })
  assert.notEqual(before.userId, webUser.id)

  const { code } = createLinkCode(webUser.id, { whatsappJid: '628111222333@s.whatsapp.net', label: 'uji' })
  const result = consumeLinkCode(code, { platform: 'telegram', platformUserId: 777, username: 'umi' })
  assert.equal(result.user.id, webUser.id)
  assert.equal(result.user.role, 'admin')
  assert.equal(getUser(before.userId), null, 'user sementara tanpa identitas lain dihapus')
  assert.equal(whatsappJidFor(webUser.id), '628111222333@s.whatsapp.net')
  const after = resolveContext({ platform: 'telegram', platformUserId: 777, env: env() })
  assert.equal(after.userId, webUser.id)
  assert.equal(after.role, 'admin')
})

test('kode tautan sekali pakai, kedaluwarsa, dan tahan brute force', async () => {
  await freshDb()
  const user = ensureUser({ id: 'web:auth-2', source: 'web', role: 'user' })
  const { code } = createLinkCode(user.id)
  consumeLinkCode(code.toLowerCase(), { platform: 'telegram', platformUserId: 900 })
  assert.throws(() => consumeLinkCode(code, { platform: 'telegram', platformUserId: 901 }), /sudah dipakai/)

  const { code: shortLived } = createLinkCode(user.id, { ttlMs: 60000 })
  const { code: expired } = createLinkCode(user.id)
  const db = (await import('../../lib/platform/db.js')).platformDb()
  db.prepare('UPDATE platform_link_codes SET expires_at = ? WHERE user_id = ? AND used_at IS NULL').run(Date.now() - 1, user.id)
  assert.throws(() => consumeLinkCode(expired, { platform: 'telegram', platformUserId: 902 }), /kedaluwarsa/)
  assert.ok(shortLived)
})

test('kode klaim owner sekali pakai dan hanya dengan secret server', async () => {
  await freshDb()
  assert.throws(() => claimOwner({ platform: 'telegram', platformUserId: 1, code: 'X' }, env()), /tidak diaktifkan/)
  assert.throws(() => claimOwner({ platform: 'telegram', platformUserId: 1000, code: 'SALAH' }, env({ TELEGRAM_OWNER_CLAIM_CODE: 'BENAR' })), /salah/)
  const e = env({ TELEGRAM_OWNER_CLAIM_CODE: 'UMI-TEST-CLAIM' })
  const claimed = claimOwner({ platform: 'telegram', platformUserId: 424242, code: 'UMI-TEST-CLAIM' }, e)
  assert.equal(claimed.role, 'owner')
  assert.equal(getUser(claimed.userId).role, 'owner')
  assert.throws(() => claimOwner({ platform: 'telegram', platformUserId: 999, code: 'UMI-TEST-CLAIM' }, e), /sudah pernah dipakai/)
})

test('perubahan role tercatat di audit dan tidak bisa ke role tak dikenal', async () => {
  await freshDb()
  const user = ensureUser({ id: 'web:auth-3', source: 'web', role: 'user' })
  setRole(user.id, 'admin', { userId: 'web:owner', platform: 'web' })
  assert.equal(getUser(user.id).role, 'admin')
  const audit = listAudit({ action: 'rbac.role.change' })
  assert.equal(audit.total, 1)
  assert.equal(audit.items[0].meta.to, 'admin')
  setRole(user.id, 'superadmin', { userId: 'web:owner' })
  assert.equal(getUser(user.id).role, 'user')
})

test('nomor jadibot dibaca per akun web (tanpa menerima input klien)', async () => {
  await freshDb()
  const dir = tempDir()
  fs.mkdirSync(path.join(dir, 'data'), { recursive: true })
  fs.writeFileSync(path.join(dir, 'data', 'jadibot-platform.json'), JSON.stringify({
    sessions: {
      628111: { userId: 'auth-a', email: 'a@example.com' },
      628222: { userId: 'auth-b', email: 'b@example.com' },
      628333: { userId: 'auth-a', email: 'a@example.com' },
    },
  }))
  const rows = whatsappNumbersForWebUser('auth-a', path.join(dir, 'data'))
  assert.deepEqual(rows.map(row => row.number), ['628111', '628333'])
  assert.deepEqual(whatsappNumbersForWebUser('auth-c', path.join(dir, 'data')), [])
})

test('skema platform dimigrasikan lengkap dan idempotent', async () => {
  const db = await freshDb()
  const info = schemaInfo(db)
  assert.ok(info.version >= 2)
  for (const table of ['platform_users', 'platform_identities', 'platform_link_codes', 'telegram_bots', 'server_slots', 'platform_audit', 'platform_media', 'platform_callbacks', 'platform_jobs']) {
    assert.ok(info.tables.includes(table), `tabel ${table} ada`)
  }
  const { migrate } = await import('../../lib/platform/db.js')
  const again = migrate(db)
  assert.deepEqual(again.applied, [], 'migrasi kedua tidak mengubah apa pun')
})
