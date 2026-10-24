/* Tes batch 7: stiker (brat), metadata grup, avatar, quoted, caption perintah,
 * dan navigasi halaman yang mengedit pesan yang sama (bukan kirim pesan baru). */
import test from 'node:test'
import assert from 'node:assert/strict'
import { freshDb, applyTestEnv } from './helpers.mjs'
import { makeMessage, runPluginOnTelegram, waToHtml } from '../../lib/platform/telegram/plugin-bridge.js'
import { sendCategory, withEditInPlace, registerCommands } from '../../lib/platform/telegram/commands.js'
import { CommandRouter } from '../../lib/platform/telegram/router.js'
import { resetCatalogCache } from '../../lib/platform/telegram/catalog.js'
import { createUnifiedStore, UNIFIED_RPG } from '../../lib/rpg/unified-store.js'

const TELEGRAM_USER = 100000001
const OWNER = {
  userId: 'web:owner', platformUserId: String(TELEGRAM_USER), chatId: TELEGRAM_USER,
  role: 'owner', username: 'owner', displayName: 'Owner',
}

function fakeClient(overrides = {}) {
  const calls = []
  const record = name => async (...args) => {
    calls.push({ name, args })
    return overrides[name] ? overrides[name](...args) : {}
  }
  return {
    calls,
    sendMessage: record('sendMessage'),
    sendPhoto: record('sendPhoto'),
    sendDocument: record('sendDocument'),
    sendVideo: record('sendVideo'),
    sendAudio: record('sendAudio'),
    sendVoice: record('sendVoice'),
    sendAnimation: record('sendAnimation'),
    sendStickerFile: record('sendStickerFile'),
    upload: record('upload'),
    editMessageText: record('editMessageText'),
    getChatAdministrators: record('getChatAdministrators'),
    getChatMemberCount: record('getChatMemberCount'),
    getUserProfilePhotos: record('getUserProfilePhotos'),
    downloadFile: record('downloadFile'),
    banChatMember: record('banChatMember'),
    unbanChatMember: record('unbanChatMember'),
    promoteChatMember: record('promoteChatMember'),
  }
}

function makeCtx(client, extra = {}) {
  const sent = []
  const edited = []
  const ctx = {
    ...OWNER,
    env: process.env,
    client,
    publicBaseUrl: 'https://api.contoh.id',
    messageId: 11,
    chatType: 'private',
    chatTitle: null,
    ...extra,
    send: async (text, options) => { sent.push({ text: String(text), options }); return { message_id: 100 + sent.length } },
    edit: async (messageId, text, options) => { edited.push({ messageId, text: String(text), options }); return { message_id: messageId } },
    answerCallback: async () => ({}),
    sendChatAction: async () => ({}),
    deleteMessage: async () => true,
    refreshIdentity() {},
    downloadFile: async () => ({ buffer: Buffer.from('media') }),
  }
  return { ctx, sent, edited }
}

const WEBP = Buffer.concat([
  Buffer.from('RIFF', 'ascii'),
  Buffer.from([0x24, 0x00, 0x00, 0x00]),
  Buffer.from('WEBPVP8 ', 'ascii'),
  Buffer.alloc(40, 1),
])
const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(40, 2),
])

/* ───────────── stiker ───────────── */

test('brat: buffer webp dikirim lewat sendSticker (multipart), bukan sendDocument', async () => {
  const client = fakeClient()
  const { ctx, sent } = makeCtx(client)
  const plugins = {
    'maker/brat.js': {
      command: ['brat'],
      handler: async (m, { conn, text, command }) => {
        if (!text) return m.reply('Masukin teks dong!')
        await conn.sendSticker(m.chat, WEBP, m, { packname: 'Umi', packpublish: 'Bot' })
      },
    },
  }
  const result = await runPluginOnTelegram(ctx, { name: 'brat', args: ['halo'], raw: '/brat halo' }, { plugins })
  assert.equal(result.handled, true)
  const sticker = client.calls.filter(call => call.name === 'sendStickerFile')
  assert.equal(sticker.length, 1, 'harus memakai sendStickerFile')
  assert.equal(client.calls.filter(call => call.name === 'sendDocument').length, 0)
  assert.equal(sticker[0].args[1].length, WEBP.length)
  assert.match(sticker[0].args[2].mime, /webp/)
  assert.equal(sent.length, 0, 'tidak boleh jatuh ke teks')
})

test('stiker PNG dari plugin dikirim sebagai foto, bukan dokumen', async () => {
  const client = fakeClient()
  const { ctx } = makeCtx(client)
  const plugins = {
    'maker/stiker.js': {
      command: ['stikerpng'],
      handler: async (m, { conn }) => { await conn.sendSticker(m.chat, PNG, m) },
    },
  }
  await runPluginOnTelegram(ctx, { name: 'stikerpng', args: [] }, { plugins })
  const uploads = client.calls.filter(call => call.name === 'upload')
  assert.equal(uploads.length, 1)
  assert.equal(uploads[0].args[0], 'photo')
  assert.equal(client.calls.filter(call => call.name === 'sendStickerFile').length, 0)
  assert.equal(client.calls.filter(call => call.name === 'sendDocument').length, 0)
})

test('sendSticker default tanpa argumen teks tetap mengembalikan saran pemakaian', async () => {
  const client = fakeClient()
  const { ctx, sent } = makeCtx(client)
  const plugins = {
    'maker/brat.js': {
      command: ['brat'],
      handler: async (m, { text, conn }) => {
        if (!text) return m.reply('✨ Masukin teks dong!')
        await conn.sendSticker(m.chat, WEBP, m)
      },
    },
  }
  await runPluginOnTelegram(ctx, { name: 'brat', args: [], raw: '/brat' }, { plugins })
  assert.equal(client.calls.length, 0)
  assert.match(sent[0].text, /Masukin teks/)
})

/* ───────────── metadata grup & anggota ───────────── */

test('groupMetadata: admin nyata dari getChatAdministrators + jumlah anggota', async () => {
  const client = fakeClient({
    getChatAdministrators: async () => ([
      { status: 'creator', user: { id: 111, first_name: 'Boss' } },
      { status: 'administrator', user: { id: 222, first_name: 'Wakil', username: 'wakil' } },
    ]),
    getChatMemberCount: async () => 42,
  })
  const { ctx, sent } = makeCtx(client, { chatId: -100123456789, chatType: 'supergroup', chatTitle: 'Grup Uji' })
  const plugins = {
    'group/meta.js': {
      command: ['meta'],
      group: true,
      handler: async (m, { conn }) => {
        const meta = await conn.groupMetadata(m.chat)
        await m.reply(`${meta.subject}|${meta.size}|${meta.participants.map(p => p.admin).join(',')}`)
      },
    },
  }
  await runPluginOnTelegram(ctx, { name: 'meta', args: [] }, { plugins })
  // Perintah grup boleh dijalankan karena ctx.chatId negatif dan admin nyata diambil dari Bot API.
  const out = sent.at(-1)?.text || ''
  assert.match(out, /Grup Uji\|42\|superadmin,admin/)
})

test('groupMetadata di chat pribadi ditolak dengan pesan jelas', async () => {
  const client = fakeClient()
  const { ctx } = makeCtx(client)
  const plugins = {
    'group/meta.js': {
      command: ['meta'], group: true,
      handler: async (m, { conn }) => { await conn.groupMetadata(m.chat) },
    },
  }
  const result = await runPluginOnTelegram(ctx, { name: 'meta', args: [] }, { plugins })
  assert.equal(result.handled, true)
  assert.match(String(result.error || ''), /khusus grup/i)
})

test('groupSettingUpdate menjawab jujur fitur yang tidak ada di Telegram', async () => {
  const client = fakeClient()
  const { ctx } = makeCtx(client, { chatId: -100123456789, chatType: 'supergroup' })
  const plugins = {
    'group/set.js': {
      command: ['tutupgrup'], group: true,
      handler: async (m, { conn }) => {
        await conn.groupSettingUpdate(m.chat, 'announcement')
        await m.reply('berhasil')
      },
    },
  }
  const result = await runPluginOnTelegram(ctx, { name: 'tutupgrup', args: [] }, { plugins })
  assert.match(String(result.error || ''), /tidak tersedia/i)
})

test('profilePictureUrl: avatar diunduh lalu dikembalikan sebagai URL media', async () => {
  await freshDb()
  applyTestEnv()
  const client = fakeClient({
    getUserProfilePhotos: async () => ({ photos: [[{ file_id: 'kecil', width: 64, height: 64 }, { file_id: 'besar', width: 640, height: 640 }]] }),
    downloadFile: async () => ({ buffer: PNG }),
  })
  const { ctx } = makeCtx(client)
  const plugins = {
    'group/pp.js': {
      command: ['pp'],
      handler: async (m, { conn }) => {
        const url = await conn.profilePictureUrl('999100000001@s.whatsapp.net', 'image')
        await m.reply(url)
      },
    },
  }
  const sent = []
  ctx.send = async text => { sent.push(String(text)); return { message_id: 1 } }
  await runPluginOnTelegram(ctx, { name: 'pp', args: [] }, { plugins })
  assert.equal(client.calls.filter(call => call.name === 'getUserProfilePhotos').length, 1)
  assert.match(sent.at(-1), /\/api\/platform-system\/media\/[^?]+\?/)
})

/* ───────────── quoted ───────────── */

test('m.quoted dibangun dari reply_to_message dan bisa download()', async () => {
  const client = fakeClient()
  const { ctx } = makeCtx(client)
  const message = {
    message_id: 77,
    text: '/ambil',
    reply_to_message: {
      message_id: 70,
      from: { id: 555000111 },
      caption: 'gambar lama',
      photo: [{ file_id: 'foto-kecil', width: 90, height: 90 }, { file_id: 'foto-besar', width: 900, height: 900 }],
    },
  }
  const m = makeMessage(ctx, message)
  assert.ok(m.quoted, 'm.quoted harus ada')
  assert.equal(m.quoted.text, 'gambar lama')
  assert.equal(m.quoted.isMedia, true)
  assert.equal(m.quoted.mtype, 'imageMessage')
  assert.equal(m.quoted.sender, '9990555000111@s.whatsapp.net')
  const buffer = await m.quoted.download()
  assert.equal(Buffer.from(buffer).toString(), 'media')
})

test('m.quoted null saat tidak membalas, download() menolak dengan jelas', async () => {
  const client = fakeClient()
  const { ctx } = makeCtx(client)
  const m = makeMessage(ctx, { message_id: 78, text: '/tanpa' })
  assert.equal(m.quoted, null)
  await assert.rejects(() => m.download(), /Tidak ada media/)
})

/* ───────────── router: caption sebagai perintah ───────────── */

test('caption foto diperlakukan sebagai perintah', async () => {
  await freshDb()
  applyTestEnv()
  const router = new CommandRouter({ logger: { error() {}, warn() {}, info() {} } })
  const seen = []
  router.register({ name: 'kirim', description: 'uji', handler: async (ctx, parsed) => { seen.push(parsed.text) } })
  const { ctx } = makeCtx(fakeClient())
  const result = await router.handleUpdate(ctx, {
    message: { message_id: 9, photo: [{ file_id: 'f', width: 8, height: 8 }], caption: '/kirim a b' },
  })
  assert.equal(result.handled, true, 'perintah dari caption harus dijalankan')
  assert.equal(seen[0], 'a b')
})

/* ───────────── navigasi halaman: edit pesan yang sama ───────────── */

function seedPlugins() {
  const plugins = {}
  for (let index = 1; index <= 30; index += 1) {
    plugins[`game/uji${index}.js`] = { command: [`ujigame${index}`], description: `game uji ${index}`, handler: async () => {} }
  }
  for (let index = 1; index <= 3; index += 1) {
    plugins[`fun/uji${index}.js`] = { command: [`ujifun${index}`], description: `fun uji ${index}`, handler: async () => {} }
  }
  globalThis.plugins = plugins
  resetCatalogCache()
  return plugins
}

test('ganti halaman mengedit pesan callback, bukan mengirim pesan baru', async () => {
  await freshDb()
  applyTestEnv()
  const client = fakeClient()
  seedPlugins()
  const { ctx, sent, edited } = makeCtx(client, { callbackMessageId: 4242 })
  await sendCategory(ctx, 'game', 2)
  assert.equal(edited.length, 1, 'harus edit pesan lama')
  assert.equal(edited[0].messageId, 4242)
  assert.equal(sent.length, 0, 'tidak boleh ada pesan baru')
  const markup = JSON.stringify(edited[0].options?.reply_markup || {})
  assert.match(markup, /⬅️/)
})

test('fallback: kalau edit gagal (pesan terlalu lama), kirim pesan baru', async () => {
  await freshDb()
  applyTestEnv()
  const client = fakeClient()
  const { ctx, sent, edited } = makeCtx(client, { callbackMessageId: 4242 })
  seedPlugins()
  ctx.edit = async () => { throw new Error("Bad Request: message can't be edited") }
  await sendCategory(ctx, 'game', 2)
  assert.equal(sent.length, 1, 'harus kirim baru saat edit gagal')
  assert.match(sent[0].text, /MENU GAME|perintah/)
})

test('tanpa callbackMessageId (perintah biasa) tetap mengirim pesan baru', async () => {
  await freshDb()
  applyTestEnv()
  const client = fakeClient()
  seedPlugins()
  const { ctx, sent, edited } = makeCtx(client)
  await sendCategory(ctx, 'fun', 1)
  assert.equal(edited.length, 0)
  assert.equal(sent.length, 1)
})

test('navigasi menu lain (bukan kategori) juga mengedit pesan yang sama', async () => {
  const client = fakeClient()
  const { ctx, sent, edited } = makeCtx(client, { callbackMessageId: 999 })
  const navCtx = withEditInPlace(ctx)
  await navCtx.send('halaman profil')
  await navCtx.send('pesan tambahan')
  assert.equal(edited.length, 1, 'balasan pertama harus mengedit')
  assert.equal(edited[0].messageId, 999)
  assert.equal(sent.length, 1, 'hanya balasan kedua yang jadi pesan baru')
  assert.equal(sent[0].text, 'pesan tambahan')
})

test('withEditInPlace: tanpa callbackMessageId tetap mengirim pesan baru', async () => {
  const client = fakeClient()
  const { ctx, sent, edited } = makeCtx(client)
  const navCtx = withEditInPlace(ctx)
  await navCtx.send('halo')
  assert.equal(edited.length, 0)
  assert.equal(sent.length, 1)
})

test('/start: banner dikirim tanpa tombol, menu teks yang memegang tombol', async () => {
  await freshDb()
  applyTestEnv()
  seedPlugins()
  const router = new CommandRouter({ logger: { error() {}, warn() {}, info() {} } })
  registerCommands(router, { logger: { error() {}, warn() {}, info() {} } })
  const client = fakeClient()
  const { ctx, sent } = makeCtx(client)
  const bannerCalls = []
  ctx.sendBanner = async options => { bannerCalls.push(options); return { sent: true } }
  await router.commands.get('start').handler(ctx, { name: 'start', args: [], text: '' }, null)
  assert.equal(bannerCalls.length, 1)
  assert.equal(bannerCalls[0].replyMarkup, undefined, 'banner tidak boleh memegang tombol')
  assert.equal(sent.length, 1, 'menu teks tetap dikirim')
  assert.ok(sent[0].options?.reply_markup?.inline_keyboard?.length, 'tombol harus ada di pesan teks')
})

test('menu lama berbentuk video: edit teks gagal → caption yang diganti', async () => {
  await freshDb()
  applyTestEnv()
  const client = fakeClient()
  const { ctx, sent, edited } = makeCtx(client, { callbackMessageId: 555 })
  const captions = []
  ctx.edit = async () => { throw new Error('Bad Request: there is no text in the message to edit') }
  ctx.editCaption = async (messageId, text, options) => { captions.push({ messageId, text, options }); return { message_id: messageId } }
  const navCtx = withEditInPlace(ctx)
  await navCtx.send('Status singkat')
  assert.equal(captions.length, 1, 'caption harus diganti')
  assert.equal(captions[0].messageId, 555)
  assert.equal(sent.length, 0, 'tidak boleh kirim pesan baru')
})
