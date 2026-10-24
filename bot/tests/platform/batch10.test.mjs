/* Tes batch 10: kategori "dummy" Khusus WhatsApp + deteksi yang lebih ketat
 * (helper rich lewat berkas lain) + tombol/list WhatsApp yang diturunkan ke teks. */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { freshDb, applyTestEnv } from './helpers.mjs'
import {
  buildCatalog, categories, itemsOf, pageOf, resetCatalogCache, resolveCategory, findItem,
} from '../../lib/platform/telegram/catalog.js'
import { waOnlyInfo, resetWaOnlyCache } from '../../lib/platform/telegram/wa-only.js'
import { makeMessage, runPluginOnTelegram } from '../../lib/platform/telegram/plugin-bridge.js'
import { registerCommands } from '../../lib/platform/telegram/commands.js'
import { CommandRouter } from '../../lib/platform/telegram/router.js'

const RICH = `export default async function handler(m, { conn }) {
  await conn.relayMessage(m.chat, { botForwardedMessage: { message: { richResponseMessage: { messageType: 1 } } } }, {})
}
handler.command = /^(catur)$/i
handler.description = 'Catur interaktif'
`

const PLAIN = `export default async function handler(m) { await m.reply('halo') }
handler.command = /^(sapa)$/i
handler.description = 'Sapa balik'
`

const TABLE_HELPER = `import { sendTable } from '../lib/awang-table.js'
export default async function handler(m, { conn }) { await sendTable(conn, m.chat, 'Judul', [1]) }
handler.command = /^(tabelwa)$/i
`

const MATRIX = `import { Matrix } from './matrix-helper.js'
export default async function handler(m, { conn }) { await Matrix(conn, m.chat) }
handler.command = /^(matrix)$/i
`

const MATRIX_HELPER = `export const Matrix = async (conn, chat) => {
  await conn.relayMessage(chat, { botForwardedMessage: { message: { richResponseMessage: { messageType: 1 } } } }, {})
}
`

function root(files) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'umi-waonly-'))
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

function seed(plugins, pluginRoot) {
  globalThis.plugins = plugins
  globalThis.__umiPluginRoot = pluginRoot
  resetWaOnlyCache()
  resetCatalogCache()
}

function fakeCtx(extra = {}) {
  const sent = []
  return {
    sent,
    ctx: {
      userId: 'web:owner', platform: 'telegram', platformUserId: '100000001', chatId: 42,
      role: 'owner', username: 'owner', displayName: 'Owner', messageId: 1, chatType: 'private',
      env: process.env, client: {},
      send: async (text, options) => { sent.push({ text: String(text), options }); return { message_id: 1 } },
      edit: async (id, text, options) => { sent.push({ text: String(text), options }); return { message_id: id } },
      answerCallback: async () => ({}), sendChatAction: async () => ({}), deleteMessage: async () => true,
      refreshIdentity() {},
      ...extra,
    },
  }
}

test('deteksi: helper rich lewat berkas lain ikut tertangkap', () => {
  const dir = root({
    'game/matrix.js': MATRIX,
    'game/matrix-helper.js': MATRIX_HELPER,
    'main/tabel.js': TABLE_HELPER,
    'fun/sapa.js': PLAIN,
  })
  resetWaOnlyCache()
  assert.equal(waOnlyInfo('game/matrix.js', { root: dir }).waOnly, true, 'import transitif harus terdeteksi')
  assert.match(waOnlyInfo('main/tabel.js', { root: dir }).reason, /tabel|rich/i)
  assert.equal(waOnlyInfo('fun/sapa.js', { root: dir }).waOnly, false)
})

test('deteksi: AI yang punya fallback teks tidak dianggap khusus WhatsApp', () => {
  const dir = root({
    'ai/ai-uji.js': `import { UsanagiAIRich } from '../../lib/usanagi-ai-rich.js'
export default async function handler(m, { conn }) {
  try { await new UsanagiAIRich(conn, {}).send(m.chat) } catch { await m.reply('teks biasa') }
}
handler.command = /^(aiuji)$/i
`,
    'lib/usanagi-ai-rich.js': MATRIX_HELPER,
  })
  resetWaOnlyCache()
  assert.equal(waOnlyInfo('ai/ai-uji.js', { root: dir }).waOnly, false)
})

test('kategori dummy: fitur khusus WhatsApp tetap terlihat di halaman khusus', () => {
  const dir = root({ 'game/game-catur.js': RICH, 'fun/sapa.js': PLAIN })
  seed({ 'game/game-catur.js': handler('catur'), 'fun/sapa.js': handler('sapa') }, dir)
  const list = categories()
  const waonly = list.find(entry => entry.id === 'waonly')
  assert.ok(waonly, 'kategori Khusus WhatsApp harus ada')
  assert.equal(waonly.count, 1)
  assert.equal(waonly.label, 'Khusus WhatsApp')
  // Tapi tidak masuk kategori game.
  const game = list.find(entry => entry.id === 'game')
  assert.equal(game, undefined, 'game tidak boleh berisi plugin khusus WhatsApp saja')
  assert.equal(itemsOf('waonly').length, 1)
})

test('halaman Khusus WhatsApp: ada penjelasan cara pakai', () => {
  const dir = root({ 'game/game-catur.js': RICH })
  seed({ 'game/game-catur.js': handler('catur') }, dir)
  const view = pageOf('waonly', 1)
  assert.match(view.text, /KHUSUS WHATSAPP/)
  assert.match(view.text, /bot WhatsApp atau jadibot/i)
  assert.match(view.text, /catur/)
})

test('/menu wa-only bisa dipanggil sebagai kategori', () => {
  const dir = root({ 'game/game-catur.js': RICH })
  seed({ 'game/game-catur.js': handler('catur') }, dir)
  for (const word of ['waonly', 'wa-only', 'whatsapp']) {
    assert.equal(resolveCategory(word), 'waonly', `${word} harus dikenali`)
  }
})

test('menu memuat tombol Khusus WhatsApp bila ada fitur yang tidak didukung', async () => {
  await freshDb()
  applyTestEnv()
  const dir = root({ 'game/game-catur.js': RICH, 'fun/sapa.js': PLAIN })
  seed({ 'game/game-catur.js': handler('catur'), 'fun/sapa.js': handler('sapa') }, dir)
  const router = new CommandRouter({ logger: { error() {}, warn() {}, info() {} } })
  registerCommands(router, { logger: { error() {}, warn() {}, info() {} } })
  const { ctx, sent } = fakeCtx()
  await router.commands.get('menu').handler(ctx, { name: 'menu', args: [], text: '' }, null)
  const keyboards = JSON.stringify(sent.map(entry => entry.options?.reply_markup || {}))
  assert.match(keyboards, /Khusus WhatsApp/)
})

test('relayMessage: tombol/list WhatsApp diturunkan jadi teks bernomor', async () => {
  const sent = []
  const ctx = {
    userId: 'web:owner', platform: 'telegram', platformUserId: '100000001', chatId: 42,
    role: 'owner', username: 'owner', displayName: 'Owner', messageId: 1, chatType: 'private',
    env: process.env, client: { setMessageReaction: async () => ({}) },
    send: async text => { sent.push(String(text)); return { message_id: 1 } },
    answerCallback: async () => ({}), sendChatAction: async () => ({}), deleteMessage: async () => true,
    refreshIdentity() {}, downloadFile: async () => ({ buffer: Buffer.from('x') }),
  }
  const plugins = {
    'tools/tombol.js': {
      command: ['tombol'],
      handler: async (m, { conn }) => {
        await conn.relayMessage(m.chat, {
          buttonsMessage: {
            headerText: 'Pilih',
            contentText: 'Mau yang mana?',
            footerText: 'Usanagi',
            buttons: [{ buttonText: { displayText: 'Satu' } }, { buttonText: { displayText: 'Dua' } }],
          },
        }, {})
      },
    },
  }
  await runPluginOnTelegram(ctx, { name: 'tombol', args: [] }, { plugins })
  const text = sent.join('\n')
  assert.match(text, /Pilih/)
  assert.match(text, /Mau yang mana\?/)
  assert.match(text, /1\. Satu/)
  assert.match(text, /2\. Dua/)
})

test('relayMessage: pesan rich HTML melempar error supaya fallback plugin jalan', async () => {
  const sent = []
  const ctx = {
    userId: 'web:owner', platform: 'telegram', platformUserId: '100000001', chatId: 42,
    role: 'owner', username: 'owner', displayName: 'Owner', messageId: 1, chatType: 'private',
    env: process.env, client: { setMessageReaction: async () => ({}) },
    send: async text => { sent.push(String(text)); return { message_id: 1 } },
    answerCallback: async () => ({}), sendChatAction: async () => ({}), deleteMessage: async () => true,
    refreshIdentity() {}, downloadFile: async () => ({ buffer: Buffer.from('x') }),
  }
  const plugins = {
    'ai/ai-uji.js': {
      command: ['aiuji'],
      handler: async (m, { conn }) => {
        try {
          await conn.relayMessage(m.chat, { botForwardedMessage: { message: { richResponseMessage: {} } } }, {})
          await m.reply('rich berhasil')
        } catch {
          await m.reply('fallback teks')
        }
      },
    },
  }
  await runPluginOnTelegram(ctx, { name: 'aiuji', args: [] }, { plugins })
  assert.deepEqual(sent, ['fallback teks'])
})

test('m.quoted tetap bekerja setelah perubahan relayMessage', () => {
  const ctx = {
    userId: 'web:owner', platform: 'telegram', platformUserId: '100000001', chatId: 42,
    role: 'owner', username: 'owner', displayName: 'Owner', messageId: 1, chatType: 'private',
    env: process.env, client: {},
    send: async () => ({ message_id: 1 }), answerCallback: async () => ({}), sendChatAction: async () => ({}),
    deleteMessage: async () => true, refreshIdentity() {}, downloadFile: async () => ({ buffer: Buffer.from('m') }),
  }
  const m = makeMessage(ctx, {
    message_id: 2,
    text: '/x',
    reply_to_message: { message_id: 1, from: { id: 5 }, text: 'halo' },
  })
  assert.equal(m.quoted?.text, 'halo')
})

test('findItem perintah khusus WhatsApp tetap ada untuk dijawab jelas', () => {
  const dir = root({ 'game/game-catur.js': RICH })
  seed({ 'game/game-catur.js': handler('catur') }, dir)
  const item = findItem('catur')
  assert.ok(item?.waOnly)
  assert.equal(buildCatalog(globalThis.plugins).items.some(entry => entry.command === 'catur'), false)
})

test('nama perintah: alias plugin yang didukung menang atas nama utama WA-only', () => {
  const dir = root({ 'downloader/wa-instagram.js': RICH })
  seed({
    'downloader/wa-instagram.js': handler('ig'),
    'download/usanagi-instagram.js': handler(['instagram', 'ig']),
  }, dir)
  const item = findItem('ig')
  assert.equal(item.waOnly, false, '/ig harus memakai plugin yang bisa jalan di Telegram')
  assert.match(item.key, /usanagi-instagram/)
  // Nama yang HANYA dimiliki plugin WA-only tetap bisa dijawab jelas.
  const caturDir = root({ 'game/game-catur.js': RICH })
  seed({ 'game/game-catur.js': handler('catur') }, caturDir)
  assert.equal(findItem('catur').waOnly, true)
})
