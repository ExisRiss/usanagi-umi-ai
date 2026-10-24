/* Tes batch panel-dari-bot, RPG Telegram, banner menu, dan bridge plugin WA. */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { freshDb, applyTestEnv, tempDir } from './helpers.mjs'
import * as panel from '../../lib/platform/panel-config.js'
import * as servers from '../../lib/platform/servers.js'
import * as rpg from '../../lib/platform/rpg.js'
import { sendBanner, bannerInfo, clearBannerCache, ensureBannerFile } from '../../lib/platform/telegram/banner.js'
import { waToHtml, runPluginOnTelegram } from '../../lib/platform/telegram/plugin-bridge.js'
import { buildCatalog, findItem, categories, pageOf, search, resolveCategory } from '../../lib/platform/telegram/catalog.js'
import { CommandRouter } from '../../lib/platform/telegram/router.js'
import { setPlatformDbForTests, platformDb } from '../../lib/platform/db.js'
import { createUnifiedStore, UNIFIED_RPG } from '../../lib/rpg/unified-store.js'

const OWNER = { userId: 'web:owner', platform: 'telegram', platformUserId: '100000001' }
const PTLC = 'ptlc_AbCdEfGhIjKlMnOpQrStUvWxYz012345'

function stubFetch(handler) {
  const original = globalThis.fetch
  globalThis.fetch = async (url, options) => handler(String(url), options)
  return () => { globalThis.fetch = original }
}

/* ───────────── panel config ───────────── */

test('panel: simpan bertahap, slot 1 hanya dibuat saat lengkap', async () => {
  await freshDb()
  applyTestEnv()

  const afterUrl = panel.savePanelConfig({ url: 'https://panel.contoh.id' }, OWNER)
  assert.equal(afterUrl.url, 'https://panel.contoh.id')
  assert.equal(afterUrl.configured, false)
  assert.equal(servers.getSlot(1).configured, false)

  const afterKey = panel.savePanelConfig({ clientKey: PTLC }, OWNER)
  assert.equal(afterKey.clientKeySet, true)
  assert.equal(afterKey.configured, false)

  const afterServer = panel.savePanelConfig({ serverId: 'd178bf71' }, OWNER)
  assert.equal(afterServer.configured, true)
  assert.equal(afterServer.managed, true)
  assert.equal(afterServer.slot, 1)
  assert.equal(servers.getSlot(1).credentialRef, servers.MANAGED_REF)
  assert.equal(servers.getSlot(1).configured, true)
})

test('panel: kunci tidak pernah dikembalikan utuh', async () => {
  await freshDb()
  applyTestEnv()
  panel.savePanelConfig({ url: 'https://panel.contoh.id', clientKey: PTLC, serverId: 'd178bf71' }, OWNER)
  const info = panel.describePanel()
  const serialized = JSON.stringify(info)
  assert.equal(serialized.includes(PTLC), false)
  assert.equal(info.clientKeyReadable, true)
  assert.match(info.clientKeyMasked, /^ptlc\*+/)

  // Yang tersimpan di database juga ciphertext, bukan plaintext.
  const row = platformDb().prepare("SELECT value FROM platform_meta WHERE key = 'panel.client_key'").get()
  assert.equal(String(row.value).includes(PTLC), false)
  assert.match(String(row.value), /^v1:/)
})

test('panel: hanya URL https tanpa path yang diterima', async () => {
  await freshDb()
  applyTestEnv()
  assert.equal(panel.isValidPanelUrl('https://panel.contoh.id'), true)
  assert.equal(panel.isValidPanelUrl('http://panel.contoh.id'), false)
  assert.equal(panel.isValidPanelUrl('https://panel.contoh.id/app'), false)
  assert.equal(panel.isValidPanelUrl('https://panel.contoh.id/?x=1'), false)
  assert.equal(panel.isValidPanelUrl('javascript:alert(1)'), false)
  assert.throws(() => panel.savePanelConfig({ clientKey: 'kunci-palsu' }, OWNER), /ptlc_/)
})

test('panel: test memakai endpoint nyata dan melaporkan akun', async () => {
  await freshDb()
  applyTestEnv()
  panel.savePanelConfig({ url: 'https://panel.contoh.id', clientKey: PTLC, serverId: 'd178bf71' }, OWNER)

  let seen = null
  const restore = stubFetch(async (url, options) => {
    seen = { url, auth: options?.headers?.Authorization }
    return { ok: true, status: 200, json: async () => ({ attributes: { username: 'umi', email: 'umi@contoh.id', root_admin: true } }) }
  })
  const result = await panel.testPanel()
  restore()
  assert.equal(result.ok, true)
  assert.equal(result.username, 'umi')
  assert.equal(seen.url, 'https://panel.contoh.id/api/client/account')
  assert.equal(seen.auth, `Bearer ${PTLC}`)
})

test('panel: hapus konfigurasi ikut membersihkan slot terkelola', async () => {
  await freshDb()
  applyTestEnv()
  panel.savePanelConfig({ url: 'https://panel.contoh.id', clientKey: PTLC, serverId: 'd178bf71' }, OWNER)
  assert.equal(servers.getSlot(1).configured, true)
  const info = panel.clearPanelConfig(OWNER)
  assert.equal(info.clientKeySet, false)
  assert.equal(servers.getSlot(1).configured, false)
  assert.equal(servers.listSlots().every(slot => slot.configured === false), true)
})

/* ───────────── RPG Telegram tanpa WhatsApp ───────────── */

test('rpg: pengguna Telegram punya identitas RPG stabil tanpa nomor WA', async () => {
  await freshDb()
  applyTestEnv()
  const first = rpg.rpgJidFor('telegram:999', '100000001')
  const second = rpg.rpgJidFor('telegram:999', '100000001')
  assert.equal(first.source, 'telegram')
  assert.equal(first.jid, second.jid, 'identitas harus stabil antar panggilan')
  assert.match(first.jid, /^\d{13}@s\.whatsapp\.net$/)
  assert.equal(rpg.isPseudoJid(first.jid), true)

  const other = rpg.rpgJidFor('telegram:1000', '100000002')
  assert.notEqual(other.jid.split('@')[0], first.jid.split('@')[0])
})

test('rpg: nomor WhatsApp tertaut tetap dipakai bila ada', async () => {
  await freshDb()
  applyTestEnv()
  platformDb().prepare(`INSERT INTO platform_identities(platform, platform_user_id, user_id, whatsapp_jid, linked_at)
    VALUES (?,?,?,?,?)`).run('whatsapp', '628123456789', 'telegram:999', '628123456789@s.whatsapp.net', Date.now())
  const identity = rpg.rpgJidFor('telegram:999', '100000001')
  assert.equal(identity.source, 'whatsapp')
  assert.equal(identity.jid, '628123456789@s.whatsapp.net')
})

/* ───────────── banner menu ───────────── */

test('banner: berkas tidak ada → tidak mengirim apa pun (bukan error)', async () => {
  await freshDb()
  const dir = tempDir('umi-banner-')
  const result = await sendBanner(
    { client: { sendVideo: async () => { throw new Error('tidak boleh dipanggil') }, upload: async () => { throw new Error('tidak boleh dipanggil') } }, chatId: 1, botId: 'main', env: { PLATFORM_BANNER_FILE: path.join(dir, 'hilang.mp4') } },
    { caption: 'menu' },
  )
  assert.equal(result.sent, false)
  assert.equal(result.reason, 'berkas-tidak-ada')
})

test('banner: unggah sekali lalu pakai file_id (cache di database)', async () => {
  await freshDb()
  applyTestEnv()
  clearBannerCache('main')
  const dir = tempDir('umi-banner-')
  const file = path.join(dir, 'menu.mp4')
  fs.writeFileSync(file, Buffer.from('video-bytes'))

  let uploads = 0
  let cachedSends = 0
  const client = {
    upload: async () => { uploads += 1; return { message_id: 5, video: { file_id: 'FILEID-1' } } },
    sendVideo: async () => { cachedSends += 1; return { message_id: 6 } },
  }
  const ctx = { client, chatId: 42, botId: 'main', env: { PLATFORM_BANNER_FILE: file } }
  const first = await sendBanner(ctx, { caption: 'Menu' })
  assert.equal(first.sent, true)
  assert.equal(first.cached, false)
  assert.equal(uploads, 1)
  assert.equal(bannerInfo('main', ctx.env).fileId, 'FILEID-1')

  const second = await sendBanner(ctx, { caption: 'Menu lagi' })
  assert.equal(second.cached, true)
  assert.equal(uploads, 1, 'tidak boleh unggah ulang bila file_id sudah ada')
  assert.equal(cachedSends, 1)
})

/* ───────────── bridge plugin WhatsApp ───────────── */

test('bridge: format WhatsApp diubah ke HTML Telegram dengan aman', () => {
  assert.equal(waToHtml('*tebal* dan _miring_'), '<b>tebal</b> dan <i>miring</i>')
  assert.equal(waToHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;')
  assert.equal(waToHtml('kode `npm i`'), 'kode <code>npm i</code>')
})

test('katalog: perintah plugin dikenali (string, array, regex)', async () => {
  const plugins = {
    a: { command: 'halo', handler: async () => {}, tags: ['fun'] },
    b: { command: ['x', 'y'], handler: async () => {}, tags: ['tools'] },
    c: { command: /^tebak$/i, handler: async () => {} },
  }
  const built = buildCatalog(plugins)
  assert.equal(built.total, 3)
  assert.equal(built.byCommand.get('halo').key, 'a')
  assert.equal(built.byCommand.get('x').key, 'b')
  assert.equal(built.byCommand.get('tebak').key, 'c')
  assert.equal(findItem('y', plugins).key, 'b')
  assert.equal(findItem('tidakada', plugins), null)
})

test('katalog: kategori, halaman, dan pencarian memakai plugin nyata', async () => {
  const plugins = {
    'rpg/rpg-kerja': { command: 'kerja', help: ['kerja'], tags: ['rpg'], handler: async () => {} },
    'rpg/usanagi-fishing': { command: 'mancing', help: ['mancing'], tags: ['rpg'], handler: async () => {} },
    'game/game-slot': { command: 'slot', help: ['slot <taruhan>'], tags: ['game'], handler: async () => {} },
    'sticker/stickerly': { command: ['sticker', 'stiker'], help: ['sticker'], tags: ['sticker'], handler: async () => {} },
    'owner/set': { command: 'set', help: ['set <key> <value>'], tags: ['owner'], owner: true, handler: async () => {} },
  }
  const cats = categories(plugins)
  assert.deepEqual(cats.map(entry => entry.id), ['game', 'rpg', 'sticker', 'owner'])
  assert.equal(cats.find(entry => entry.id === 'rpg').count, 2)
  assert.equal(resolveCategory('stiker', plugins), 'sticker')
  assert.equal(resolveCategory('grup', plugins), 'group')
  assert.equal(resolveCategory('tidakada', plugins), null)
  const page = pageOf('rpg', 1, { plugins, size: 1 })
  assert.equal(page.pages, 2)
  assert.equal(page.total, 2)
  assert.match(page.text, /MENU RPG/)
  assert.equal(pageOf('rpg', 2, { plugins, size: 1 }).page, 2)
  assert.equal(search('manc', { plugins })[0].command, 'mancing')
})

test('bridge: plugin gagal dijelaskan, bukan mengarang hasil', async () => {
  await freshDb()
  applyTestEnv()
  const sent = []
  const ctx = {
    userId: 'telegram:999', platformUserId: '100000001', chatId: 9, role: 'user', messageId: 13,
    send: async text => { sent.push(text) },
  }
  globalThis.plugins = { rusak: { command: 'rusak', handler: async () => { throw new Error('Gagal ambil data upstream') } } }
  const result = await runPluginOnTelegram(ctx, { name: 'rusak', args: [] })
  assert.equal(result.handled, true)
  assert.match(sent.at(-1), /gagal/i)
  delete globalThis.plugins
})

test('bridge: plugin dijalankan di Telegram lewat conn/m yang sama', async () => {
  await freshDb()
  applyTestEnv()
  const sent = []
  const ctx = {
    userId: 'telegram:999', platformUserId: '100000001', chatId: 7, role: 'user',
    displayName: 'Uji', messageId: 11,
    send: async text => { sent.push(text); return { message_id: 99 } },
  }
  globalThis.plugins = {
    salam: {
      command: 'salam', tags: ['fun'],
      handler: async (m, { conn, text }) => { await conn.reply(m.chat, `Halo ${text} *dunia*`, m) },
    },
  }
  const result = await runPluginOnTelegram(ctx, { name: 'salam', args: ['kamu'] })
  assert.equal(result.handled, true)
  assert.equal(sent[0], 'Halo kamu <b>dunia</b>')
  delete globalThis.plugins
})

test('bridge: plugin owner ditolak untuk pengguna biasa, perintah platform tidak dibajak', async () => {
  await freshDb()
  applyTestEnv()
  const sent = []
  const ctx = {
    userId: 'telegram:1000', platformUserId: '1000', chatId: 8, role: 'user', messageId: 12,
    send: async text => { sent.push(text) },
  }
  globalThis.plugins = { rahasia: { command: 'rahasia', owner: true, handler: async () => {} } }
  const denied = await runPluginOnTelegram(ctx, { name: 'rahasia', args: [] })
  assert.equal(denied.denied, true)
  assert.match(sent[0], /khusus owner/)

  const platformOwned = await runPluginOnTelegram(ctx, { name: 'panel', args: [] })
  assert.equal(platformOwned.handled, false, 'perintah platform tidak boleh dijalankan sebagai plugin')
  delete globalThis.plugins
})



test('router: perintah gaya WhatsApp (.menu) juga diterima', () => {
  const router = new CommandRouter({ logger: { error() {}, warn() {} } })
  assert.deepEqual(router.parse('.menu'), { name: 'menu', args: [], text: '' })
  assert.deepEqual(router.parse('/saham beli UMI 2'), { name: 'saham', args: ['beli', 'UMI', '2'], text: 'beli UMI 2' })
  assert.equal(router.parse('halo semuanya'), null)
})

test('banner: unduh sekali dari URL lalu dipakai ulang dari disk', async () => {
  const dir = tempDir('umi-banner-dl-')
  const file = path.join(dir, 'nested', 'menu.mp4')
  let hits = 0
  const restore = stubFetch(async () => {
    hits += 1
    return {
      ok: true, status: 200,
      headers: { get: () => 'video/mp4' },
      arrayBuffer: async () => Buffer.from('isi-video'),
    }
  })
  const first = await ensureBannerFile({ PLATFORM_BANNER_FILE: file, PLATFORM_BANNER_URL: 'https://contoh.id/menu.mp4' })
  const second = await ensureBannerFile({ PLATFORM_BANNER_FILE: file, PLATFORM_BANNER_URL: 'https://contoh.id/menu.mp4' })
  restore()
  assert.equal(first.downloaded, true)
  assert.equal(second.downloaded, false)
  assert.equal(hits, 1, 'URL hanya diambil sekali')
  assert.equal(fs.readFileSync(file, 'utf8'), 'isi-video')
})

test('banner: bukan video ditolak, berkas tidak dibuat', async () => {
  const dir = tempDir('umi-banner-bad-')
  const file = path.join(dir, 'menu.mp4')
  const restore = stubFetch(async () => ({
    ok: true, status: 200,
    headers: { get: () => 'text/html' },
    arrayBuffer: async () => Buffer.from('<html>'),
  }))
  await assert.rejects(
    () => ensureBannerFile({ PLATFORM_BANNER_FILE: file, PLATFORM_BANNER_URL: 'https://contoh.id/x' }),
    /bukan video/,
  )
  restore()
  assert.equal(fs.existsSync(file), false)
})

/* ───────────── game RPG di Telegram (engine yang sama) ───────────── */

async function setupStore(users) {
  const db = await freshDb()
  const store = createUnifiedStore({ db, users: users || {}, links: [] })
  store.migrate()
  globalThis[UNIFIED_RPG] = store
  return { db, store }
}

test('rpg: profil Telegram dibuat di engine yang sama & idempoten', async () => {
  await setupStore()
  const identity = rpg.rpgJidFor('telegram:999', '100000001')
  const first = await rpg.ensureProfile(identity.jid, { idempotencyKey: 'init-1' })
  const second = await rpg.ensureProfile(identity.jid, { idempotencyKey: 'init-1' })
  assert.equal(first.created, true)
  assert.equal(second.created, false)
  const canonical = identity.jid.replace('@s.whatsapp.net', '')
  const row = platformDb().prepare('SELECT data FROM rpg_users WHERE jid = ?').get(canonical)
  assert.ok(row, 'baris rpg_users harus ada')
  assert.equal(rpg.profile(identity.jid).hasProfile, true)
})

test('rpg: kerja menambah koin nyata dan menghormati cooldown', async () => {
  await setupStore()
  const identity = rpg.rpgJidFor('telegram:999', '100000001')
  await rpg.ensureProfile(identity.jid, { idempotencyKey: 'init-2' })
  const before = rpg.profile(identity.jid).koin

  const first = await rpg.work(identity.jid, { idempotencyKey: 'work-a', now: Date.now() })
  assert.equal(first.ok, true)
  assert.ok(first.koin >= rpg.WORK.minKoin && first.koin <= rpg.WORK.maxKoin)
  assert.equal(rpg.profile(identity.jid).koin, before + first.koin)

  // Permintaan ganda dengan kunci sama tidak menambah koin dua kali.
  const duplicate = await rpg.work(identity.jid, { idempotencyKey: 'work-a', now: Date.now() })
  assert.equal(duplicate.reason, 'duplicate')

  // Permintaan baru dalam jendela cooldown ditolak.
  const cooling = await rpg.work(identity.jid, { idempotencyKey: 'work-b', now: Date.now() + 1000 })
  assert.equal(cooling.reason, 'cooldown')
  assert.ok(cooling.remainingMs > 0)
})

test('rpg: hadiah tebak angka sekali per ronde', async () => {
  await setupStore()
  const identity = rpg.rpgJidFor('telegram:999', '100000001')
  await rpg.ensureProfile(identity.jid, { idempotencyKey: 'init-3' })
  const first = await rpg.reward(identity.jid, { koin: 150, exp: 60, key: 'guess:1:abc' })
  const second = await rpg.reward(identity.jid, { koin: 150, exp: 60, key: 'guess:1:abc' })
  assert.equal(first.ok, true)
  assert.equal(second.ok, false)
  assert.equal(second.reason, 'duplicate')
  assert.equal(rpg.profile(identity.jid).koin, first.koin)
})

test('katalog: plugin berupa fungsi langsung (pola main.js) ikut terhitung', async () => {
  const fn = async () => {}
  fn.command = 'keren'
  fn.help = ['keren <teks>']
  fn.tags = ['fun']
  const plugins = { keren: fn, objek: { command: 'biasa', help: ['biasa'], tags: ['fun'], handler: async () => {} } }
  const built = buildCatalog(plugins)
  assert.equal(built.total, 2)
  assert.equal(built.byCommand.get('keren').key, 'keren')
  assert.equal(findItem('keren', plugins).command, 'keren')
})

test('katalog: plugin nonaktif (disabled) tidak muncul di menu', async () => {
  const plugins = {
    aktif: { command: 'aktif', handler: async () => {}, tags: ['fun'] },
    mati: { command: 'mati', handler: async () => {}, tags: ['fun'], disabled: true },
  }
  assert.equal(buildCatalog(plugins).total, 1)
  assert.equal(findItem('mati', plugins), null)
})
