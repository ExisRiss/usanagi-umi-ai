import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { runBackup } from '../../lib/backup/pipeline.js'
import { createRestore, confirmRestore, cancelRestore, applyPendingRestore, mapArchivePath, getRestore } from '../../lib/backup/restore.js'
import { makeFixture, config } from './helpers.mjs'

async function sqliteRows(file) {
  const { default: Database } = await import('better-sqlite3')
  const db = new Database(file, { readonly: true, fileMustExist: true })
  try {
    return db.prepare('SELECT jid, name, coins FROM users ORDER BY jid').all()
  } finally {
    db.close()
  }
}

async function mutateDatabase(cfg) {
  const { default: Database } = await import('better-sqlite3')
  const db = new Database(cfg.sqlitePath)
  db.prepare('DELETE FROM users WHERE jid = ?').run('628111@s.whatsapp.net')
  db.prepare('UPDATE users SET coins = 1').run()
  db.close()
  fs.writeFileSync(cfg.databaseJson, JSON.stringify({ users: { rusak: true }, chats: ['baru'] }))
  fs.writeFileSync(path.join(cfg.sessionsDir, '628111', 'bot-config.json'), JSON.stringify({ ownerNumbers: ['999'], prefix: '#' }))
}

test('dry-run menampilkan rencana tanpa mengubah data', async () => {
  const { root } = await makeFixture()
  const cfg = config(root)
  const backup = await runBackup(cfg, { reason: 'test' })
  await mutateDatabase(cfg)
  const before = await sqliteRows(cfg.sqlitePath)
  const plan = await createRestore(cfg, { backupId: backup.id, dryRun: true, actor: 'test' })
  assert.equal(plan.dryRun, true)
  assert.ok(plan.files >= 3)
  assert.equal(plan.requiresRestart, true)
  const after = await sqliteRows(cfg.sqlitePath)
  assert.deepEqual(after, before, 'dry-run tidak boleh menyentuh database')
})

test('restore menolak kode konfirmasi yang salah', async () => {
  const { root } = await makeFixture()
  const cfg = config(root)
  const backup = await runBackup(cfg, { reason: 'test' })
  const plan = await createRestore(cfg, { backupId: backup.id, actor: 'test' })
  assert.equal(plan.status, 'pending_confirmation')
  await assert.rejects(() => confirmRestore(cfg, plan.id, { token: 'SALAH', actor: 'test' }), /Kode konfirmasi salah/)
  assert.equal(getRestore(cfg, plan.id).status, 'pending_confirmation')
})

test('restore penuh benar-benar mengembalikan data', async () => {
  const { root } = await makeFixture()
  const cfg = config(root)
  const original = await sqliteRows(cfg.sqlitePath)
  const backup = await runBackup(cfg, { reason: 'test' })
  await mutateDatabase(cfg)
  assert.notDeepEqual(await sqliteRows(cfg.sqlitePath), original)

  const plan = await createRestore(cfg, { backupId: backup.id, actor: 'test' })
  const done = await confirmRestore(cfg, plan.id, { token: plan.token, actor: 'test' })
  assert.equal(done.status, 'completed_pending_restart')
  assert.ok(done.result.pendingSqlite)
  assert.deepEqual(done.result.verification.mismatches, [])
  assert.equal(done.result.verification.sqliteCheck, 'ok')

  // Berkas non-database langsung pulih.
  assert.deepEqual(JSON.parse(fs.readFileSync(cfg.databaseJson, 'utf8')), { users: { a: 1 }, chats: [] })
  const sessionConfig = JSON.parse(fs.readFileSync(path.join(cfg.sessionsDir, '628111', 'bot-config.json'), 'utf8'))
  assert.deepEqual(sessionConfig.ownerNumbers, ['628111'])

  // Database aktif saat boot berikutnya.
  const applied = applyPendingRestore(cfg)
  assert.equal(applied.applied, true)
  assert.deepEqual(await sqliteRows(cfg.sqlitePath), original)
})

test('restore hanya file tidak butuh restart', async () => {
  const { root } = await makeFixture()
  const cfg = config(root)
  const backup = await runBackup(cfg, { reason: 'test' })
  fs.writeFileSync(path.join(cfg.sessionsDir, '628111', 'plugins', 'custom.js'), 'export default { rusak: true }')
  const plan = await createRestore(cfg, { backupId: backup.id, components: ['files'], actor: 'test' })
  assert.equal(plan.summary.requiresRestart, false)
  const done = await confirmRestore(cfg, plan.id, { token: plan.token, actor: 'test' })
  assert.equal(done.status, 'completed')
  assert.equal(fs.readFileSync(path.join(cfg.sessionsDir, '628111', 'plugins', 'custom.js'), 'utf8'), 'export default {}')
})

test('backup yang diubah ditolak sebelum ekstraksi', async () => {
  const { root } = await makeFixture()
  const cfg = config(root)
  const backup = await runBackup(cfg, { reason: 'test' })
  const file = path.resolve(cfg.root, backup.storagePath)
  const buffer = fs.readFileSync(file)
  buffer.writeUInt8(buffer[30] ^ 0xff, 30)
  fs.writeFileSync(file, buffer)
  await assert.rejects(() => createRestore(cfg, { backupId: backup.id, dryRun: true }), /Checksum arsip tidak cocok/)
})

test('restore bisa dibatalkan sebelum konfirmasi', async () => {
  const { root } = await makeFixture()
  const cfg = config(root)
  const backup = await runBackup(cfg, { reason: 'test' })
  const plan = await createRestore(cfg, { backupId: backup.id, actor: 'test' })
  const cancelled = await cancelRestore(cfg, plan.id, 'test')
  assert.equal(cancelled.status, 'cancelled')
  await assert.rejects(() => confirmRestore(cfg, plan.id, { token: plan.token }), /tidak bisa dikonfirmasi/)
})

test('pemetaan path menolak entri di luar struktur backup', () => {
  const cfg = config('/tmp/umi-restore-map')
  assert.throws(() => mapArchivePath(cfg, '../../etc/passwd'))
  assert.throws(() => mapArchivePath(cfg, 'unknown/file.txt'))
  assert.throws(() => mapArchivePath(cfg, 'config/sessions/abc/bot-config.json'))
  assert.equal(mapArchivePath(cfg, 'manifest.json').internal, true)
  const mapped = mapArchivePath(cfg, 'config/sessions/628111/bot-config.json')
  assert.ok(mapped.target.endsWith(path.join('sessions', 'jadibot', '628111', 'bot-config.json')))
})
