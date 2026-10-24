// Task64: tombol Limit ON/OFF + default_limit -1 harus benar-benar mematikan
// pengecekan dan pemotongan limit di dispatcher nyata.
import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { getDb, cleanup } from './fixtures/realms-sqlite.mjs'
import { createUnifiedStore, UNIFIED_RPG } from '../lib/rpg/unified-store.js'
import { limitsEnabled, isUnlimitedUser } from '../lib/limit-mode.js'

global.__filename = url => fileURLToPath(url)
const { handler } = await import('../handler.js')
let serial = 0

function fixture(config = {}) {
  const id = ++serial
  const sender = `${700100000 + id}@s.whatsapp.net`
  const bot = `${800100000 + id}@s.whatsapp.net`
  const output = []
  global.owner = []; global.opts = {}; global.mods = []
  global.mainBot = { defaultPrefix: '/' }; global.jadibotPlatform = {}
  global.conn = { sendMessage: () => { throw Error('main socket must stay OFF') } }
  const store = createUnifiedStore({ db: getDb(), users: { [sender]: { registered: true, limit: 0, premiumTime: 0, money: 0, exp: 0 } }, links: [] })
  store.migrate(); globalThis[UNIFIED_RPG] = store
  global.db = { data: { users: store.users, chats: {}, stats: {}, settings: { [bot]: { public: true } }, blacklistUser: {} }, write: async () => {} }
  global.loadDatabase = async () => {}
  global.dfail = (reason, m) => m.reply('Denied: ' + reason)
  const conn = {
    user: { id: bot, jid: bot },
    botConfig: { type: 'jadibot', scope: 'limit-test-' + id, public: true, defaultPrefix: '/', defaultLimit: 50, registrationRequired: true, ...config },
    pushMessage: async () => {}, groupMetadata: async () => ({ participants: [] }), onWhatsApp: async () => [], readMessages: async () => [],
    sendMessage: async function (chat, body) { output.push({ chat, body }); return { key: { id: crypto.randomUUID() } } },
  }
  Object.defineProperty(conn, 'reply', { value: function (chat, text) { return this.sendMessage(chat, { text }) } })
  const proto = Object.defineProperty({}, 'reply', { value: function (text) { return this.conn.reply(this.chat, text) } })
  const message = (text = '/charge') => Object.assign(Object.create(proto), {
    conn, sender, chat: 'fixture@g.us', key: { id: crypto.randomUUID(), remoteJid: 'fixture@g.us' },
    message: { conversation: text }, text, mentionedJid: [], isGroup: true, pushName: 'Test',
  })
  global.plugins = {
    'main/charge.js': Object.assign(async m => m.reply('CHARGE OK'), { command: 'charge', help: ['charge'], tags: ['tools'], limit: 5 }),
  }
  const user = () => store.users[sender]
  return { conn, output, store, sender, message, user, run: async m => handler.call(conn, { messages: [m], type: 'notify' }), finish() { delete global.db; delete globalThis[UNIFIED_RPG] } }
}

test('limitsEnabled: default ON, tombol OFF dan default -1 mematikan', () => {
  assert.equal(limitsEnabled({ defaultLimit: 50 }), true)
  assert.equal(limitsEnabled({ defaultLimit: 50, limitEnabled: true }), true)
  assert.equal(limitsEnabled({ defaultLimit: 50, limitEnabled: false }), false)
  assert.equal(limitsEnabled({ defaultLimit: -1 }), false)
  assert.equal(isUnlimitedUser({ limit: 10 }, { limitEnabled: false }), true)
  assert.equal(isUnlimitedUser({ limit: -1 }, {}), true)
  assert.equal(isUnlimitedUser({ limit: 10 }, {}), false)
})

test('limit ON: perintah berlimit tetap ditolak saat limit habis', async () => {
  const f = fixture({ defaultLimit: 50 })
  try {
    await f.run(f.message())
    assert.equal(f.output.length, 1)
    assert.match(f.output[0].body.text, /Limit anda habis/)
    assert.equal(Number(f.user().limit), 0)
  } finally { f.finish() }
})

test('tombol Limit OFF: perintah berlimit jalan tanpa potong limit', async () => {
  const f = fixture({ defaultLimit: 50, limitEnabled: false })
  try {
    await f.run(f.message())
    assert.equal(f.output.length, 1)
    assert.equal(f.output[0].body.text, 'CHARGE OK')
    assert.doesNotMatch(f.output[0].body.text, /Limit terpakai/)
    assert.equal(Number(f.user().limit), 0)
  } finally { f.finish() }
})

test('default_limit -1 tetap unlimited walau pengguna lama masih punya limit 0', async () => {
  const f = fixture({ defaultLimit: -1 })
  try {
    await f.run(f.message())
    assert.equal(f.output.length, 1)
    assert.equal(f.output[0].body.text, 'CHARGE OK')
    assert.equal(Number(f.user().limit), 0)
  } finally { f.finish() }
})

test('limit ON dengan sisa cukup: limit terpotong sesuai biaya plugin', async () => {
  const f = fixture({ defaultLimit: 50 })
  try {
    global.db.data.users[f.sender].limit = 10
    await f.run(f.message())
    assert.ok(f.output.some(x => /CHARGE OK/.test(x.body.text)))
    assert.ok(f.output.some(x => /5 Limit terpakai/.test(x.body.text)))
    assert.equal(Number(f.user().limit), 5)
  } finally { f.finish() }
})

test.after(() => cleanup())
