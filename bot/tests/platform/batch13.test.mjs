/* Tes batch 13:
 *  1) nomor bot utama bebas + pairing, khusus owner;
 *  2) hubungkan bot Telegram ke bot WhatsApp milik user;
 *  3) setiap error → log berkas + notifikasi Telegram.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import http from 'node:http'
import { Readable } from 'node:stream'
import { freshDb, applyTestEnv, env, TEST_API_SECRET, tempDir, mockTelegram } from './helpers.mjs'
import { handlePlatformApi } from '../../lib/platform/api.js'
import { platformDb } from '../../lib/platform/db.js'
import { ensureUser } from '../../lib/platform/identity.js'
import { writeMainBotState } from '../../lib/main-bot-config.js'
import { can } from '../../lib/platform/roles.js'
import * as bots from '../../lib/platform/telegram/bots.js'
import {
  recordError, readRecentErrors, shouldReport, redactErrorText,
  installErrorHooks, resetErrorHubForTests, errorLogDir,
} from '../../lib/error-hub.js'

applyTestEnv()

/* ───────────────────────── harness API platform ───────────────────────── */

function makeReq({ method = 'GET', headers = {}, body = null } = {}) {
  const chunks = body === null ? [] : [Buffer.isBuffer(body) ? body : Buffer.from(JSON.stringify(body))]
  const req = Readable.from(chunks)
  req.method = method
  req.headers = headers
  req.url = '/'
  return req
}

function makeRes() {
  return {
    statusCode: 0, headers: {}, chunks: [], writableEnded: false,
    writeHead(status, headers = {}) { this.statusCode = status; this.headers = headers; return this },
    end(chunk) { if (chunk) this.chunks.push(Buffer.from(chunk)); this.writableEnded = true },
    write(chunk) { if (chunk) this.chunks.push(Buffer.from(chunk)) },
    pipe(stream) { stream.on('data', c => this.chunks.push(Buffer.from(c))); stream.on('end', () => { this.writableEnded = true }) },
    get body() { return Buffer.concat(this.chunks) },
    get json() { try { return JSON.parse(this.body.toString('utf8')) } catch { return null } },
  }
}

async function call(pathname, { method = 'GET', body = null, user = 'web:owner' } = {}) {
  const res = makeRes()
  const req = makeReq({
    method,
    headers: { 'x-platform-secret': TEST_API_SECRET, ...(user ? { 'x-platform-user-id': user } : {}) },
    body,
  })
  const url = new URL(`http://localhost${pathname}`)
  await handlePlatformApi(req, res, url.pathname, url.searchParams, env())
  return res
}

function seedUsers() {
  ensureUser({ id: 'web:owner', source: 'web', email: 'owner@uji.id', role: 'owner' })
  ensureUser({ id: 'web:user', source: 'web', email: 'user@uji.id', role: 'user' })
}

/** Folder kerja sementara: data/jadibot-platform.json + .main-bot.env terisolasi. */
function sandbox() {
  const dir = tempDir('umi-batch13-')
  fs.mkdirSync(path.join(dir, 'data'), { recursive: true })
  const previous = process.cwd()
  process.chdir(dir)
  process.env.UMI_MAIN_BOT_ENV_FILE = path.join(dir, '.main-bot.env')
  process.env.UMI_ERROR_LOG_DIR = path.join(dir, 'data', 'errors')
  return {
    dir,
    file: name => path.join(dir, name),
    restore() {
      process.chdir(previous)
      delete process.env.UMI_MAIN_BOT_ENV_FILE
      delete process.env.UMI_ERROR_LOG_DIR
    },
  }
}

function writeSessions(dir, sessions) {
  fs.writeFileSync(path.join(dir, 'data', 'jadibot-platform.json'), JSON.stringify({ sessions, backups: {} }))
}

/* ───────────────────────── 1. RBAC izin baru ───────────────────────── */

test('izin: telegram.own untuk semua peran, mainbot.manage hanya owner', () => {
  for (const role of ['owner', 'developer', 'admin', 'reseller', 'user']) {
    assert.equal(can(role, 'telegram.own'), true, `role ${role} harus bisa punya bot sendiri`)
  }
  assert.equal(can('owner', 'mainbot.manage'), true)
  for (const role of ['developer', 'admin', 'reseller', 'user']) {
    assert.equal(can(role, 'mainbot.manage'), false, `role ${role} tidak boleh mengatur bot utama`)
  }
  // Fitur lama tidak boleh hilang.
  assert.equal(can('owner', 'telegram.manage'), true)
  assert.equal(can('developer', 'telegram.manage'), true)
  assert.equal(can('admin', 'telegram.status'), true)
})

/* ───────────────────────── 2. nomor bot utama ───────────────────────── */

test('bot utama: nomor biasa dinormalkan, disimpan, dan pairing dipicu', async () => {
  await freshDb(); seedUsers()
  const box = sandbox()
  const applied = []
  const previousApply = globalThis.applyMainPairingNumber
  // Tiruan perilaku asli di main.js: normalisasi → simpan ke .main-bot.env.
  globalThis.applyMainPairingNumber = number => {
    applied.push(number)
    writeMainBotState({ pairingNumber: number })
    return number
  }
  try {
    const res = await call('/main-bot/number', { method: 'POST', body: { number: '0812-3456-7890' } })
    assert.equal(res.statusCode, 200)
    assert.deepEqual(applied, ['6281234567890'], 'nomor 08… harus jadi 62… sebelum pairing')
    // Nomor tidak pernah dikirim utuh ke klien.
    assert.equal(JSON.stringify(res.json).includes('6281234567890'), false, 'nomor utuh tidak boleh bocor')
    assert.equal(res.json.pairing_number_masked, '6281***890')
    assert.equal(res.json.numberSet, true)
    // Tersimpan permanen dengan izin 600 dan terbaca lagi.
    const stateFile = box.file('.main-bot.env')
    assert.ok(fs.existsSync(stateFile))
    assert.equal(fs.statSync(stateFile).mode & 0o777, 0o600)
    const again = await call('/main-bot')
    assert.equal(again.statusCode, 200)
    assert.equal(again.json.pairing_number_set, true)
  } finally {
    globalThis.applyMainPairingNumber = previousApply
    box.restore()
  }
})

test('bot utama: nomor tidak valid ditolak, non-owner 403', async () => {
  await freshDb(); seedUsers()
  const box = sandbox()
  try {
    const short = await call('/main-bot/number', { method: 'POST', body: { number: '123' } })
    assert.equal(short.statusCode, 400)

    const userGet = await call('/main-bot', { user: 'web:user' })
    assert.equal(userGet.statusCode, 403, 'pengguna biasa tidak boleh melihat bot utama')

    const userPost = await call('/main-bot/number', { method: 'POST', body: { number: '628111222333' }, user: 'web:user' })
    assert.equal(userPost.statusCode, 403, 'pengguna biasa tidak boleh mengganti nomor bot utama')
  } finally { box.restore() }
})

test('bot utama: nomor yang dipakai sesi akun lain ditolak kecuali force', async () => {
  await freshDb(); seedUsers()
  const box = sandbox()
  try {
    writeSessions(box.dir, { 628999888777: { userId: 'web:user', connected: true } })
    const blocked = await call('/main-bot/number', { method: 'POST', body: { number: '628999888777' } })
    assert.equal(blocked.statusCode, 409)
    assert.equal(blocked.json.code, 'NUMBER_IN_USE')
  } finally { box.restore() }
})

/* ───────────────────── 3. bot Telegram ↔ bot WhatsApp ───────────────────── */

test('telegram bots: pengguna melihat bot miliknya sendiri beserta sesi WA-nya', async () => {
  await freshDb(); seedUsers()
  const box = sandbox()
  try {
    platformDb().prepare(`INSERT INTO telegram_bots(id, owner_user_id, scope, label, token_cipher, bot_id, username, enabled, mode, status, created_at, updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`).run('own1', 'web:user', 'user', 'Bot A', 'x', '111', 'bot_a', 0, 'polling', 'offline', Date.now(), Date.now())
    platformDb().prepare(`INSERT INTO telegram_bots(id, owner_user_id, scope, label, token_cipher, bot_id, username, enabled, mode, status, created_at, updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`).run('plat1', 'web:owner', 'platform', 'Bot Utama', 'y', '222', 'bot_utama', 1, 'polling', 'online', Date.now(), Date.now())
    writeSessions(box.dir, { 628111000111: { userId: 'web:user', connected: true } })

    const own = await call('/telegram/bots', { user: 'web:user' })
    assert.equal(own.statusCode, 200)
    assert.equal(own.json.scoped, 'own')
    assert.deepEqual(own.json.items.map(item => item.id), ['own1'], 'pengguna tidak boleh melihat bot akun lain')
    assert.equal(own.json.sessions.length, 1)
    assert.equal(own.json.sessions[0].number, '628111000111')
    assert.equal(own.json.sessions[0].masked, '6281***111')

    const all = await call('/telegram/bots', { user: 'web:owner' })
    assert.equal(all.json.scoped, 'all')
    assert.equal(all.json.items.length, 2)
  } finally { box.restore() }
})

test('telegram bots: pengguna tidak bisa mengaktifkan bot platform milik owner', async () => {
  await freshDb(); seedUsers()
  const box = sandbox()
  try {
    platformDb().prepare(`INSERT INTO telegram_bots(id, owner_user_id, scope, label, token_cipher, bot_id, username, enabled, mode, status, created_at, updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`).run('plat1', 'web:owner', 'platform', 'Bot Utama', 'y', '222', 'bot_utama', 0, 'polling', 'offline', Date.now(), Date.now())
    const res = await call('/telegram/bots/plat1/enable', { method: 'POST', user: 'web:user' })
    assert.equal(res.statusCode, 403)
    const notMine = await call('/telegram/bots/plat1/disable', { method: 'POST', user: 'web:user' })
    assert.equal(notMine.statusCode, 403)
  } finally { box.restore() }
})

test('telegram bots: link hanya menerima nomor bot WhatsApp milik akun itu', async () => {
  await freshDb(); seedUsers()
  const box = sandbox()
  try {
    platformDb().prepare(`INSERT INTO telegram_bots(id, owner_user_id, scope, label, token_cipher, bot_id, username, enabled, mode, status, created_at, updated_at)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`).run('own1', 'web:user', 'user', 'Bot A', 'x', '111', 'bot_a', 0, 'polling', 'offline', Date.now(), Date.now())
    writeSessions(box.dir, { 628111000111: { userId: 'web:user', connected: true } })

    const wrong = await call('/telegram/bots/own1/link', { method: 'POST', body: { number: '628000000000' }, user: 'web:user' })
    assert.equal(wrong.statusCode, 403)
    assert.equal(wrong.json.code, 'NOT_OWNER')

    const ok = await call('/telegram/bots/own1/link', { method: 'POST', body: { number: '628111000111' }, user: 'web:user' })
    assert.equal(ok.statusCode, 200)
    assert.equal(ok.json.bot.linked, true)
    assert.equal(ok.json.bot.waNumber, '6281***111')
    assert.equal(ok.json.bot.waNumberRaw, '628111000111')

    // Pemilik lain tidak boleh melepas tautan orang.
    const other = await call('/telegram/bots/own1/link', { method: 'POST', body: { number: '' }, user: 'web:user2' })
    assert.equal(other.statusCode, 403)

    const unlink = await call('/telegram/bots/own1/link', { method: 'POST', body: { number: '' }, user: 'web:user' })
    assert.equal(unlink.statusCode, 200)
    assert.equal(unlink.json.bot.linked, false)
  } finally { box.restore() }
})

test('telegram bots: kolom wa_number adalah migrasi aditif (tabel lama tetap jalan)', async () => {
  const db = await freshDb()
  const columns = db.prepare('PRAGMA table_info(telegram_bots)').all().map(row => row.name)
  assert.ok(columns.includes('wa_number'))
  assert.ok(columns.includes('wa_linked_at'))
  // Kolom lama tidak hilang.
  for (const name of ['token_cipher', 'owner_user_id', 'scope', 'enabled', 'mode', 'status']) {
    assert.ok(columns.includes(name), `kolom ${name} harus tetap ada`)
  }
})

/* ───────────────────────── 4. pusat error ───────────────────────── */

test('error: pesan untuk pengguna & gangguan sesaat tidak dilaporkan', () => {
  assert.equal(shouldReport('Format: /sticker <gambar>'), false)
  assert.equal(shouldReport(new Error('Format: /ttp <teks>')), false)
  const transient = new Error('Connection Closed')
  assert.equal(shouldReport(transient), false)
  const real = new Error('Cannot read properties of undefined (reading id)')
  assert.equal(shouldReport(real), true)
  assert.equal(shouldReport(transient, { force: true }), true)
})

test('error: kredensial dihapus dari teks log', () => {
  const text = redactErrorText('token=123456789:AAHfakefakefakefakefakefakefakefakefake ndus=abcdef1234567890 gsk_abcdefghijklmnop')
  assert.equal(text.includes('123456789:AAH'), false)
  assert.equal(text.includes('abcdef1234567890'), false)
  assert.equal(text.includes('gsk_abcdefghijklmnop'), false)
})

test('error: ditulis ke data/errors/*.jsonl dengan izin 600', async () => {
  await freshDb()
  const box = sandbox()
  resetErrorHubForTests()
  try {
    const result = await recordError(new Error('Gagal menghitung harga saham'), {
      source: 'plugin', plugin: 'saham.js', command: 'saham', telegram: false, website: false,
    })
    assert.equal(result.logged, true)
    const dir = errorLogDir()
    const files = fs.readdirSync(dir).filter(file => file.endsWith('.jsonl'))
    assert.equal(files.length, 1)
    assert.equal(fs.statSync(path.join(dir, files[0])).mode & 0o777, 0o600)
    const row = JSON.parse(fs.readFileSync(path.join(dir, files[0]), 'utf8').trim().split('\n').pop())
    assert.equal(row.plugin, 'saham.js')
    assert.equal(row.message, 'Gagal menghitung harga saham')
    assert.equal(row.source, 'plugin')

    const recent = readRecentErrors({ limit: 5 })
    assert.equal(recent.items.length, 1)
    assert.equal(recent.items[0].plugin, 'saham.js')
  } finally { box.restore(); resetErrorHubForTests() }
})

test('error: pesan Telegram terkirim ke owner, error sama digabung 10 menit', async () => {
  const mock = await mockTelegram()
  const box = sandbox()
  resetErrorHubForTests()
  const previousBase = process.env.UMI_TELEGRAM_API_BASE
  const previousToken = process.env.TELEGRAM_BOT_TOKEN
  const previousOwners = process.env.TELEGRAM_OWNER_IDS
  process.env.UMI_TELEGRAM_API_BASE = mock.base
  process.env.TELEGRAM_BOT_TOKEN = '123456:mock-token-abcdefghijklmnop'
  process.env.TELEGRAM_OWNER_IDS = '100000001,100000002'
  try {
    const first = await recordError(new Error('Kerusakan nyata saat render menu'), {
      source: 'plugin', plugin: 'menu.js', command: 'menu', website: false,
    })
    assert.equal(first.logged, true)
    assert.equal(first.notified, 2, 'harus mengirim ke dua owner')

    const sends = mock.state.sent
    assert.equal(sends.length, 2)
    const payload = sends[0]
    assert.equal(String(payload.chat_id), '100000001')
    assert.match(payload.text, /Error bot/)
    assert.match(payload.text, /menu\.js/)
    assert.match(payload.text, /Kerusakan nyata saat render menu/)

    // Kejadian kedua dalam jendela dedupe: tercatat, tidak dikirim ulang.
    const second = await recordError(new Error('Kerusakan nyata saat render menu'), {
      source: 'plugin', plugin: 'menu.js', command: 'menu', website: false,
    })
    assert.equal(second.notified, 0)
    assert.equal(second.count, 2)
    assert.equal(mock.state.sent.length, 2, 'dedupe: tidak ada kiriman kedua')
  } finally {
    box.restore()
    resetErrorHubForTests()
    await mock.close()
    if (previousBase === undefined) delete process.env.UMI_TELEGRAM_API_BASE
    else process.env.UMI_TELEGRAM_API_BASE = previousBase
    if (previousToken === undefined) delete process.env.TELEGRAM_BOT_TOKEN
    else process.env.TELEGRAM_BOT_TOKEN = previousToken
    if (previousOwners === undefined) delete process.env.TELEGRAM_OWNER_IDS
    else process.env.TELEGRAM_OWNER_IDS = previousOwners
  }
})

test('error: tanpa token Telegram tetap tercatat dan tidak melempar', async () => {
  const box = sandbox()
  resetErrorHubForTests()
  const previousToken = process.env.TELEGRAM_BOT_TOKEN
  const previousOwners = process.env.TELEGRAM_OWNER_IDS
  delete process.env.TELEGRAM_BOT_TOKEN
  delete process.env.TELEGRAM_OWNER_IDS
  try {
    const result = await recordError(new Error('Error tanpa tujuan notifikasi'), {
      source: 'process.unhandledRejection', telegram: true, website: false,
    })
    assert.equal(result.logged, true)
    assert.equal(result.notified, 0)
  } finally {
    box.restore()
    resetErrorHubForTests()
    if (previousToken === undefined) delete process.env.TELEGRAM_BOT_TOKEN
    else process.env.TELEGRAM_BOT_TOKEN = previousToken
    if (previousOwners === undefined) delete process.env.TELEGRAM_OWNER_IDS
    else process.env.TELEGRAM_OWNER_IDS = previousOwners
  }
})

test('error: hook proses terpasang sekali dan bisa dilepas', () => {
  resetErrorHubForTests()
  const before = process.listenerCount('uncaughtException')
  const first = installErrorHooks({ source: 'process.uncaughtException' })
  assert.equal(first.installed, true)
  assert.equal(first.already, false)
  const second = installErrorHooks()
  assert.equal(second.already, true)
  // Tidak menambah listener ganda.
  assert.equal(process.listenerCount('uncaughtException'), before + 1)
  resetErrorHubForTests()
  assert.equal(process.listenerCount('uncaughtException'), before)
})

test('error: endpoint owner /errors mengembalikan log terbaru', async () => {
  await freshDb(); seedUsers()
  const box = sandbox()
  resetErrorHubForTests()
  try {
    await recordError(new Error('Endpoint error uji'), { source: 'plugin', plugin: 'uji.js', telegram: false, website: false })
    const res = await call('/errors?limit=3', { user: 'web:owner' })
    assert.equal(res.statusCode, 200)
    assert.equal(res.json.items.length, 1)
    assert.equal(res.json.items[0].message, 'Endpoint error uji')

    const denied = await call('/errors', { user: 'web:user' })
    assert.equal(denied.statusCode, 403, 'log error bukan untuk pengguna biasa')
  } finally { box.restore(); resetErrorHubForTests() }
})
