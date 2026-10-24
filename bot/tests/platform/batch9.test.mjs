/* Tes batch 9: fitur yang mustahil di Telegram (rich HTML interaktif, pairing WA)
 * disembunyikan dari menu Telegram dan dijawab jelas, tetapi tidak dihapus dari
 * repo sehingga bot WhatsApp & jadibot tetap memilikinya. */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { freshDb, applyTestEnv } from './helpers.mjs'
import { buildCatalog, resetCatalogCache, findItem } from '../../lib/platform/telegram/catalog.js'
import { waOnlyInfo, resetWaOnlyCache } from '../../lib/platform/telegram/wa-only.js'
import { runPluginOnTelegram } from '../../lib/platform/telegram/plugin-bridge.js'
import { registerCommands } from '../../lib/platform/telegram/commands.js'
import { CommandRouter } from '../../lib/platform/telegram/router.js'

const RICH = `export default async function handler(m, { conn }) {
  await conn.relayMessage(m.chat, { botForwardedMessage: { message: { richResponseMessage: { messageType: 1 } } } }, {})
}
handler.command = /^(catur)$/i
`

const PLAIN = `export default async function handler(m) { await m.reply('halo') }
handler.command = /^(sapa)$/i
`

const PAIRING = `export default async function handler() { await conn.requestPairingCode('628123') }
handler.command = /^(pairingwa)$/i
`

function makePluginRoot(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'umi-plugins-'))
  for (const [name, body] of Object.entries(files)) {
    const file = path.join(dir, name)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, body)
  }
  return dir
}

const handler = command => {
  const fn = async () => {}
  fn.command = Array.isArray(command) ? command : [command]
  return fn
}

test('wa-only: rich HTML interaktif terdeteksi sebagai khusus WhatsApp', () => {
  const root = makePluginRoot({ 'game/game-catur.js': RICH, 'fun/sapa.js': PLAIN, 'main/pair.js': PAIRING })
  resetWaOnlyCache()
  const chess = waOnlyInfo('game/game-catur.js', { root })
  assert.equal(chess.waOnly, true)
  assert.match(chess.reason, /rich HTML/i)
  assert.equal(waOnlyInfo('fun/sapa.js', { root }).waOnly, false)
  const pairing = waOnlyInfo('main/pair.js', { root })
  assert.equal(pairing.waOnly, true)
  assert.match(pairing.reason, /pairing/i)
})

test('wa-only: berkas tidak ditemukan tidak membuat fitur hilang', () => {
  resetWaOnlyCache()
  assert.deepEqual(waOnlyInfo('entah/tidak-ada.js', { root: '/tmp/kosong-tidak-ada' }), { waOnly: false, reason: null })
})

test('katalog: fitur khusus WhatsApp tidak tampil di menu Telegram', () => {
  process.env.UMI_TEST_PLUGIN_ROOT = makePluginRoot({ 'game/game-catur.js': RICH })
  const root = process.env.UMI_TEST_PLUGIN_ROOT
  globalThis.__umiPluginRoot = root
  globalThis.plugins = { 'game/game-catur.js': handler('catur'), 'fun/sapa.js': handler('sapa') }
  resetWaOnlyCache()
  resetCatalogCache()
  const built = buildCatalog(globalThis.plugins)
  assert.equal(built.items.some(item => item.command === 'catur'), false, 'catur tidak boleh muncul di menu')
  // Tetap terdaftar supaya bisa dijawab jelas kalau diketik.
  const chess = built.byCommand.get('catur')
  assert.ok(chess)
  assert.equal(chess.waOnly, true)
})

test('katalog: kalau nama perintah sama, yang didukung Telegram yang dipakai', () => {
  const root = makePluginRoot({ 'sticker/wa-brat.js': RICH })
  globalThis.__umiPluginRoot = root
  globalThis.plugins = {
    // urutan sengaja: versi WA-only lebih dulu
    'sticker/wa-brat.js': handler('brat'),
    'maker/brat.js': handler('brat'),
  }
  resetWaOnlyCache()
  resetCatalogCache()
  const built = buildCatalog(globalThis.plugins)
  assert.equal(built.byCommand.get('brat').waOnly, false, 'versi yang didukung Telegram harus menang')
})

test('bridge: perintah khusus WhatsApp dijawab jelas, handler tidak dijalankan', async () => {
  await freshDb()
  applyTestEnv()
  const root = makePluginRoot({ 'game/game-catur.js': RICH })
  globalThis.__umiPluginRoot = root
  let ran = false
  const catur = async () => { ran = true }
  catur.command = ['catur']
  globalThis.plugins = { 'game/game-catur.js': catur }
  resetWaOnlyCache()
  resetCatalogCache()
  const sent = []
  const ctx = {
    userId: 'web:owner', platform: 'telegram', platformUserId: '100000001', chatId: 42,
    role: 'owner', username: 'owner', displayName: 'Owner', messageId: 1, chatType: 'private',
    env: process.env, client: {},
    send: async text => { sent.push(String(text)); return { message_id: 1 } },
    answerCallback: async () => ({}), sendChatAction: async () => ({}), deleteMessage: async () => true,
    refreshIdentity() {},
  }
  const result = await runPluginOnTelegram(ctx, { name: 'catur', args: [] }, { plugins: globalThis.plugins })
  assert.equal(result.waOnly, true)
  assert.equal(ran, false, 'handler WhatsApp tidak boleh dijalankan')
  assert.match(sent.join(' '), /khusus WhatsApp/i)
  assert.match(sent.join(' '), /rich HTML/i)
})

test('menu Telegram tidak memuat perintah khusus WhatsApp', async () => {
  await freshDb()
  applyTestEnv()
  const root = makePluginRoot({ 'game/game-catur.js': RICH })
  globalThis.__umiPluginRoot = root
  globalThis.plugins = { 'game/game-catur.js': handler('catur'), 'fun/sapa.js': handler('sapa') }
  resetWaOnlyCache()
  resetCatalogCache()
  const router = new CommandRouter({ logger: { error() {}, warn() {}, info() {} } })
  registerCommands(router, { logger: { error() {}, warn() {}, info() {} } })
  const sent = []
  const ctx = {
    userId: 'web:owner', platform: 'telegram', platformUserId: '100000001', chatId: 42,
    role: 'owner', username: 'owner', displayName: 'Owner', messageId: 1, chatType: 'private',
    env: process.env, client: {},
    send: async (text, options) => { sent.push({ text: String(text), options }); return { message_id: 1 } },
    answerCallback: async () => ({}), sendChatAction: async () => ({}), deleteMessage: async () => true,
    refreshIdentity() {},
  }
  await router.commands.get('allmenu').handler(ctx, { name: 'allmenu', args: [], text: '' }, null)
  const all = sent.map(entry => entry.text).join('\n')
  assert.equal(/catur/i.test(all), false, 'catur tidak boleh muncul di allmenu')
  // Kategori game hanya berisi plugin yang didukung; `catur` tidak termasuk.
  const game = buildCatalog(globalThis.plugins).items.filter(item => item.command === 'catur')
  assert.equal(game.length, 0)
  const sapa = buildCatalog(globalThis.plugins).items.find(item => item.command === 'sapa')
  assert.ok(sapa, 'fitur yang didukung tetap tampil')
})

test('findItem tetap bisa menemukan perintah khusus WhatsApp untuk dijawab jelas', () => {
  const root = makePluginRoot({ 'game/game-catur.js': RICH })
  globalThis.__umiPluginRoot = root
  globalThis.plugins = { 'game/game-catur.js': handler('catur') }
  resetWaOnlyCache()
  resetCatalogCache()
  const item = findItem('catur')
  assert.ok(item)
  assert.equal(item.waOnly, true)
})
