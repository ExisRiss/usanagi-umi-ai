/**
 * Jembatan plugin WhatsApp → Telegram.
 *
 * Tujuannya BUKAN sistem kedua: plugin yang sama (`global.plugins`, dimuat
 * `main.js`) dijalankan dengan `m`/`conn` bergaya WhatsApp yang diterjemahkan ke
 * Telegram. Jadi fitur baru yang ditambah di `plugins/**` otomatis ikut muncul
 * di Telegram tanpa menulis ulang.
 *
 * Identitas: `m.sender` = JID yang dipakai mesin RPG bersama
 * (`rpg.rpgJidFor`), sehingga plugin RPG menulis ke baris data yang SAMA
 * dengan bot WhatsApp — bukan database kedua.
 *
 * Fitur yang benar-benar mustahil di Telegram (metadata grup WhatsApp, admin
 * grup, stiker WA asli) melempar error jelas — bukan tombol palsu.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import { audit } from '../audit.js'
import { rpgJidFor } from '../rpg.js'
import { findItem, handlerOf } from './catalog.js'
import { storeMedia, mediaUrl } from '../media.js'
import { getBotRow } from './bots.js'
import { runWithBotConnection } from '../../bot-connection-context.js'
import { recordError } from '../../error-hub.js'

const COMMAND_TIMEOUT_MS = 45000
const MAX_TEXT = 3800

/** Perintah yang sudah ditangani platform (JANGAN dijalankan plugin). */
const PLATFORM_OWNED = new Set([
  'start', 'menu', 'allmenu', 'help', 'profile', 'status', 'jadibot', 'tourl', 'to-url',
  'server', 'saham', 'stock', 'rpg', 'panel', 'admin', 'reseller', 'link', 'unlink',
  'fitur', 'menu2', 'cari', 'kategori', 'health', 'files',
])

const ROLE_RANK = { owner: 0, developer: 1, admin: 2, reseller: 3, user: 4 }

/**
 * Ubah format WhatsApp (*tebal*, _miring_, `kode`) ke HTML Telegram.
 * Seluruh teks di-escape lebih dulu, jadi plugin tidak bisa menyuntik HTML.
 */
export function waToHtml(value) {
  let text = String(value ?? '')
  text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  text = text.replace(/```([\s\S]+?)```/g, (_, code) => `<pre>${code}</pre>`)
  text = text.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')
  text = text.replace(/\*([^*\n]{1,200})\*/g, '<b>$1</b>')
  text = text.replace(/_([^_\n]{1,200})_/g, '<i>$1</i>')
  text = text.replace(/`([^`\n]{1,200})`/g, '<code>$1</code>')
  return text.length > MAX_TEXT ? `${text.slice(0, MAX_TEXT)}…` : text
}

function sniffImage(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null
  if (buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp'
  if (buffer.subarray(0, 3).toString('ascii') === 'GIF') return 'image/gif'
  if (buffer[0] === 0x89 && buffer.subarray(1, 4).toString('ascii') === 'PNG') return 'image/png'
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return 'image/jpeg'
  return null
}

async function fetchMediaBuffer(url) {
  if (/^https?:\/\//i.test(url)) {
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) })
    if (!response.ok) throw new Error(`Media balas HTTP ${response.status}.`)
    return Buffer.from(await response.arrayBuffer())
  }
  if (fs.existsSync(url)) return fs.readFileSync(url)
  throw new Error('Berkas media tidak ditemukan.')
}

/**
 * API pembuat stiker (mis. brat) kadang mengembalikan PNG/JPEG. Telegram hanya
 * menerima WEBP untuk `sendSticker`, jadi konversi dulu bila `sharp` tersedia
 * (dependensi bot). Kalau tidak ada, pemanggil jatuh ke kirim sebagai foto —
 * fitur tetap jalan, hanya bukan stiker.
 */
async function toWebpSticker(buffer) {
  try {
    const { default: sharp } = await import('sharp')
    if (!sharp) return null
    return await sharp(buffer)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 92 })
      .toBuffer()
  } catch {
    return null
  }
}

async function sendStickerBuffer(ctx, buffer) {
  const mime = sniffImage(buffer)
  if (mime === 'image/webp' || mime === 'image/gif') {
    try {
      return await ctx.client.sendStickerFile(ctx.chatId, buffer, {
        filename: mime === 'image/gif' ? 'sticker.gif' : 'sticker.webp', mime,
      })
    } catch {}
  } else if (mime) {
    const webp = await toWebpSticker(buffer)
    if (webp) {
      try {
        return await ctx.client.sendStickerFile(ctx.chatId, webp, { filename: 'sticker.webp', mime: 'image/webp' })
      } catch {}
    }
    return sendMedia(ctx, 'photo', buffer, '')
  }
  return sendMedia(ctx, 'document', buffer, '', 'sticker.bin')
}

async function conn_sendStickerBuffer(ctx, buffer) {
  return sendStickerBuffer(ctx, buffer)
}

function senderJidFor(ctx) {
  return rpgJidFor(ctx.userId, ctx.platformUserId).jid
}

/* ─────────────────────────── pengiriman ─────────────────────────── */

async function sendMedia(ctx, kind, source, caption = '', filename = null) {
  const client = ctx.client
  if (!client) throw new Error('Klien Telegram tidak tersedia.')
  let buffer = null
  let name = filename
  const url = typeof source === 'string' ? source : source?.url
  if (Buffer.isBuffer(source)) buffer = source
  else if (url) {
    if (/^https?:\/\//i.test(url)) {
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) })
      if (!response.ok) throw new Error(`Media balas HTTP ${response.status}.`)
      buffer = Buffer.from(await response.arrayBuffer())
    } else {
      if (!fs.existsSync(url)) throw new Error('Berkas media tidak ditemukan.')
      buffer = fs.readFileSync(url)
    }
  }
  if (!buffer) throw new Error('Media tidak punya isi yang bisa dikirim.')
  if (buffer.length > 45 * 1024 * 1024) throw new Error('Media lebih dari 45 MB, Telegram menolak.')
  const ext = String(name || url || '').split('.').pop()?.toLowerCase() || ''
  const mime = kind === 'photo' ? 'image/jpeg'
    : kind === 'video' ? 'video/mp4'
    : /^audio|voice$/.test(kind) ? 'audio/mpeg'
    : ext === 'pdf' ? 'application/pdf'
    : ext === 'webp' ? 'image/webp'
    : 'application/octet-stream'
  return client.upload(kind === 'voice' ? 'document' : kind, ctx.chatId, buffer, {
    filename: name || `media.${ext || 'bin'}`,
    mime,
    caption,
  })
}

/**
 * Terima semua bentuk isi pesan Baileys yang dipakai plugin di repo ini.
 * Yang tidak mungkin (sticker WA, button native, viewOnce, dsb.) dijawab jelas.
 */
async function sendContent(ctx, content, options = {}) {
  if (content == null) return null
  if (typeof content === 'string' || typeof content === 'number') return ctx.send(waToHtml(content))
  if (Buffer.isBuffer(content.image) || Buffer.isBuffer(content.video) || Buffer.isBuffer(content.document)) {
    // buffer langsung
  }
  const caption = waToHtml(content.caption || content.text || '')
  if (content.react) {
    const emoji = String(content.react.text || content.react || '')
    if (ctx.messageId && emoji) await ctx.client?.setMessageReaction?.(ctx.chatId, ctx.messageId, emoji).catch(() => {})
    return null
  }
  if (content.delete) {
    if (ctx.messageId) await ctx.deleteMessage?.()
    return null
  }
  if (content.image) return sendMedia(ctx, 'photo', content.image, caption)
  if (content.video) return sendMedia(ctx, 'video', content.video, caption)
  if (content.document) return sendMedia(ctx, 'document', content.document, caption, content.fileName || content.filename)
  if (content.audio) return sendMedia(ctx, 'audio', content.audio, caption, content.fileName || 'audio.mp3')
  if (content.sticker || content.stickerPack) {
    throw new Error('Stiker WhatsApp tidak bisa dipakai di Telegram (format berbeda). Pakai /menu sticker versi gambar.')
  }
  if (content.text) return ctx.send(caption)
  if (content.buttons || content.templateButtons) {
    // Tombol native WhatsApp tidak punya padanan; teksnya tetap dikirim supaya
    // pengguna tidak kehilangan informasi.
    const body = content.text || content.caption || content.body || ''
    return ctx.send(waToHtml(body))
  }
  if (content.poll) {
    const question = content.poll.name || content.poll.question || 'Polling'
    const options_ = (content.poll.values || content.poll.options || []).map(String)
    return ctx.send(waToHtml(`${question}\n\n${options_.map((item, index) => `${index + 1}. ${item}`).join('\n')}`))
  }
  if (content.contacts) return ctx.send('<i>(kontak tidak bisa dikirim lewat jembatan Telegram)</i>')
  return ctx.send(waToHtml(JSON.stringify(content).slice(0, 400)))
}

/* ─────────────────────────── shim conn/m ─────────────────────────── */

/** JID semu platform (`999<telegramId>@s.whatsapp.net`) → id Telegram. */
function telegramIdFromJid(jid) {
  const digits = String(jid || '').replace(/\D/g, '')
  if (!digits) return null
  return digits.startsWith('999') && digits.length > 6 ? Number(digits.slice(3)) : Number(digits)
}

function isGroupChat(ctx) {
  return String(ctx.chatId || '').startsWith('-')
}

/** Metadata grup Telegram: admin (nyata) + jumlah anggota. */
async function groupMetadataFor(ctx, chat) {
  if (!isGroupChat(ctx)) throw new Error('Perintah ini khusus grup.')
  const chatId = chat || ctx.chatId
  const client = ctx.client
  const [admins, count] = await Promise.all([
    client.getChatAdministrators(chatId).catch(() => []),
    client.getChatMemberCount(chatId).catch(() => 0),
  ])
  const participants = (Array.isArray(admins) ? admins : []).map(entry => {
    const user = entry.user || {}
    return {
      id: `${999}${String(user.id).padStart(10, '0')}@s.whatsapp.net`,
      admin: entry.status === 'creator' ? 'superadmin' : 'admin',
      name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || String(user.id),
      telegramId: user.id,
    }
  })
  return {
    id: String(chatId),
    subject: ctx.chatTitle || 'Grup Telegram',
    participants,
    size: Number(count) || participants.length,
    announce: false,
    restrict: false,
  }
}

/** Aksi anggota grup: add/remove/promote/demote lewat Bot API. */
async function participantsUpdate(ctx, jids, action) {
  if (!isGroupChat(ctx)) throw new Error('Aksi ini hanya bisa di grup.')
  const client = ctx.client
  const ids = (Array.isArray(jids) ? jids : [jids]).map(telegramIdFromJid).filter(Boolean)
  if (!ids.length) throw new Error('Tidak ada anggota yang bisa diproses dari Telegram.')
  const results = []
  for (const id of ids) {
    try {
      if (action === 'remove') await client.banChatMember(ctx.chatId, id).then(() => client.unbanChatMember(ctx.chatId, id))
      else if (action === 'add') throw new Error('Menambahkan orang lain ke grup tidak bisa lewat bot Telegram.')
      else if (action === 'promote') await client.promoteChatMember(ctx.chatId, id, { can_manage_chat: true, can_delete_messages: true, can_invite_users: true })
      else if (action === 'demote') await client.promoteChatMember(ctx.chatId, id, { can_manage_chat: false, can_delete_messages: false, can_invite_users: false })
      else throw new Error(`Aksi grup tidak dikenal: ${action}`)
      results.push({ status: 'ok', id })
    } catch (error) {
      results.push({ status: String(error.message || error), id })
    }
  }
  return results
}

/** Pengaturan grup: Telegram tidak punya padanan 1:1 dengan WhatsApp. */
async function groupSettingUpdate(ctx, setting) {
  if (!isGroupChat(ctx)) throw new Error('Aksi ini hanya bisa di grup.')
  if (['announcement', 'not_announcement', 'locked', 'unlocked'].includes(String(setting))) {
    throw new Error('Mode "hanya admin yang bisa kirim" tidak tersedia untuk bot Telegram (butuh hak owner grup). Pakai pengaturan grup di aplikasi Telegram.')
  }
  throw new Error(`Pengaturan grup "${setting}" tidak dikenal.`)
}

const avatarCache = new Map()

/** Foto profil: diunduh, disimpan sebagai media bertanda tangan, kembalikan URL. */
async function profilePictureUrl(ctx, jid, type = 'image') {
  const id = telegramIdFromJid(jid)
  if (!id) throw new Error('Foto profil tidak tersedia untuk identitas ini.')
  const cacheKey = `${id}:${type}`
  const cached = avatarCache.get(cacheKey)
  if (cached && Date.now() - cached.at < 10 * 60 * 1000) return cached.url
  const photos = await ctx.client.getUserProfilePhotos(id, 1)
  const sizes = photos?.photos?.[0]
  if (!sizes?.length) throw new Error('Pengguna ini tidak punya foto profil atau menyembunyikannya.')
  const best = [...sizes].sort((a, b) => (b.width * b.height) - (a.width * a.height))[0]
  const { buffer } = await ctx.client.downloadFile(best.file_id, { maxBytes: 5 * 1024 * 1024 })
  const stored = storeMedia(buffer, {
    userId: ctx.userId, platform: 'telegram', name: 'avatar.jpg',
    ttlMs: 10 * 60 * 1000, actor: { platformUserId: ctx.platformUserId },
  })
  const url = mediaUrl(stored.id, { userId: ctx.userId, ttlMs: 10 * 60 * 1000 })
  avatarCache.set(cacheKey, { at: Date.now(), url })
  return url
}

/** Ubah payload tombol/list/carousel WhatsApp menjadi teks yang bisa dibaca. */
function flattenInteractive(body = {}) {
  const wrap = body.viewOnceMessage?.message || body.viewOnceMessageV2?.message || body.documentWithCaptionMessage?.message || body
  const interactive = wrap.interactiveMessage
  const buttons = wrap.buttonsMessage
  const list = wrap.listMessage
  const template = wrap.templateMessage?.hydratedTemplate || wrap.templateMessage?.hydratedFourRowTemplate
  const carousel = wrap.carouselMessage?.cards
  const lines = []
  const text = value => (typeof value === 'string' ? value : value?.text || value?.title || '')
  if (interactive) {
    if (interactive.header?.title) lines.push(`<b>${waToHtml(text(interactive.header.title))}</b>`)
    if (interactive.body?.text) lines.push(waToHtml(text(interactive.body.text)))
    if (interactive.footer?.text) lines.push(`<i>${waToHtml(text(interactive.footer.text))}</i>`)
    const params = interactive.nativeFlowMessage?.buttons || []
    const labels = params.map(entry => {
      try { return JSON.parse(entry.buttonParamsJson || '{}').title || null } catch { return null }
    }).filter(Boolean)
    if (labels.length) lines.push('', ...labels.map((label, index) => `${index + 1}. ${waToHtml(label)}`))
  } else if (buttons) {
    if (buttons.contentText) lines.push(waToHtml(buttons.contentText))
    if (buttons.headerText) lines.unshift(`<b>${waToHtml(buttons.headerText)}</b>`)
    if (buttons.footerText) lines.push(`<i>${waToHtml(buttons.footerText)}</i>`)
    const labels = (buttons.buttons || []).map(entry => entry.buttonText?.displayText).filter(Boolean)
    if (labels.length) lines.push('', ...labels.map((label, index) => `${index + 1}. ${waToHtml(label)}`))
  } else if (list) {
    if (list.title) lines.push(`<b>${waToHtml(list.title)}</b>`)
    if (list.description) lines.push(waToHtml(list.description))
    for (const section of list.sections || []) {
      if (section.title) lines.push('', `<b>${waToHtml(section.title)}</b>`)
      for (const row of section.rows || []) {
        lines.push(`• ${waToHtml(row.title || '')}${row.description ? ` — ${waToHtml(row.description)}` : ''}`)
      }
    }
  } else if (template) {
    if (template.title) lines.push(`<b>${waToHtml(template.title)}</b>`)
    if (template.body?.text) lines.push(waToHtml(template.body.text))
    const labels = (template.buttons || []).map(entry => entry.quickReplyButton?.displayText || entry.urlButton?.displayText || entry.callButton?.displayText).filter(Boolean)
    if (labels.length) lines.push('', ...labels.map((label, index) => `${index + 1}. ${waToHtml(label)}`))
  } else if (Array.isArray(carousel) && carousel.length) {
    carousel.forEach((card, index) => {
      const inner = card?.header?.title || card?.body?.text
      lines.push(`${index + 1}. ${waToHtml(String(inner || 'Kartu'))}`)
    })
  }
  const joined = lines.filter(Boolean).join('\n').trim()
  return joined || null
}

/** Bangun `m.quoted` dari pesan yang di-reply di Telegram. */
function quotedFrom(ctx, sender, raw = null) {
  const reply = (raw || ctx.rawMessage)?.reply_to_message
  if (!reply) return null
  const fromId = reply.from?.id
  const senderJid = fromId ? `999${String(fromId).padStart(10, '0')}@s.whatsapp.net` : sender
  const text = String(reply.text || reply.caption || '')
  const pick = value => (Array.isArray(value) ? value[value.length - 1] : value)
  let media = null
  let fileId = null
  if (reply.photo) {
    const photo = pick(reply.photo)
    fileId = photo?.file_id
    media = { mtype: 'imageMessage', mime: 'image/jpeg', width: photo?.width, height: photo?.height }
  } else if (reply.video) {
    fileId = reply.video.file_id
    media = { mtype: 'videoMessage', mime: reply.video.mime_type || 'video/mp4', seconds: reply.video.duration, width: reply.video.width, height: reply.video.height }
  } else if (reply.sticker) {
    fileId = reply.sticker.file_id
    media = { mtype: 'stickerMessage', mime: reply.sticker.mime_type || 'image/webp', isAnimated: Boolean(reply.sticker.is_animated || reply.sticker.is_video) }
  } else if (reply.document) {
    fileId = reply.document.file_id
    media = { mtype: 'documentMessage', mime: reply.document.mime_type || 'application/octet-stream', fileName: reply.document.file_name }
  } else if (reply.audio || reply.voice) {
    const audio = reply.audio || reply.voice
    fileId = audio.file_id
    media = { mtype: 'audioMessage', mime: audio.mime_type || 'audio/mpeg', seconds: audio.duration }
  }
  const message = {
    conversation: text,
    ...(media ? { [media.mtype]: { caption: text, mimetype: media.mime, fileLength: null, ...media } } : {}),
  }
  const quoted = {
    key: { remoteJid: sender, fromMe: false, id: String(reply.message_id || '') },
    id: String(reply.message_id || ''),
    chat: sender,
    sender: senderJid,
    message,
    mtype: media?.mtype || (text ? 'conversation' : 'unknown'),
    mimetype: media?.mime || (text ? 'text/plain' : undefined),
    fileName: media?.fileName,
    text,
    caption: text,
    isMedia: Boolean(media),
    isForwarded: Boolean(reply.forward_origin),
    fakeObj: null,
    vM: null,
    msg: message,
    download: async () => {
      if (!fileId) throw new Error('Pesan yang dibalas tidak berisi media.')
      const { buffer } = await ctx.downloadFile(fileId)
      return buffer
    },
  }
  return quoted
}

function makeConn(ctx, message, jid) {
  const send = (chat, content, options) => sendContent(ctx, content, options)
  const conn = {
    user: { jid, id: jid, name: 'Usanagi Umi (Telegram)' },
    ev: { on: () => {}, off: () => {} },
    reply: (chat, content, quoted, options) => sendContent(ctx, content, options),
    sendMessage: (chat, content, options) => sendContent(ctx, content, options),
    sendFile: (chat, content, quoted, options) => sendContent(ctx, content, options),
    relayMessage: (chat, message_) => {
      const body = message_?.message || message_ || {}
      // Rich HTML (papan game, tabel native) tidak ada padanannya. Lempar error
      // supaya plugin memakai fallback teksnya sendiri kalau punya (mis. AI).
      if (body.botForwardedMessage || body.richResponseMessage) {
        throw new Error('Pesan rich HTML WhatsApp tidak bisa ditampilkan di Telegram.')
      }
      const inner = body.imageMessage || body.videoMessage || body.documentMessage || body.extendedTextMessage || body.conversation
      if (typeof inner === 'string') return ctx.send(waToHtml(inner))
      if (inner?.caption) return ctx.send(waToHtml(inner.caption))
      if (inner?.text) return ctx.send(waToHtml(inner.text))
      // Tombol/list/carousel WhatsApp diturunkan jadi teks bernomor.
      const flattened = flattenInteractive(body)
      if (flattened) return ctx.send(flattened)
      return ctx.send('<i>(pesan ini tidak bisa ditampilkan di Telegram)</i>')
    },
    sendSticker: async (chat, content) => {
      // Plugin di repo ini memanggil `conn.sendSticker(chat, buffer, m, opts)`
      // dengan Buffer hasil API pembuat stiker (mis. /brat).
      const buffer = Buffer.isBuffer(content) ? content : null
      const url = buffer ? null : (content?.sticker?.url || content?.sticker || null)
      if (!buffer && !url) throw new Error('Stiker tidak punya sumber yang bisa dikirim.')
      if (buffer) return sendStickerBuffer(ctx, buffer)
      return conn_sendStickerBuffer(ctx, await fetchMediaBuffer(url), url)
    },
    sendAlbum: async (chat, medias) => {
      // Album (beberapa gambar sekaligus) dikirim berurutan — Telegram butuh
      // upload terpisah, dan isi tetap sama.
      const results = []
      for (const item of Array.isArray(medias) ? medias : []) {
        results.push(await sendContent(ctx, item))
      }
      return results
    },
    waUploadToServer: async () => ({ url: null }),
    getName: () => ctx.displayName || ctx.username || 'Pengguna',
    groupMetadata: async (chat) => groupMetadataFor(ctx, chat),
    groupParticipantsUpdate: async (chat, jids, action) => participantsUpdate(ctx, jids, action),
    groupSettingUpdate: async (chat, setting) => groupSettingUpdate(ctx, setting),
    profilePictureUrl: async (jid, type = 'image') => profilePictureUrl(ctx, jid, type),
    presenceSubscribe: async () => {},
    readMessages: async () => {},
    chatRead: async () => {},
    sendPresenceUpdate: async () => {},
  }
  // Cache per-koneksi yang dipakai plugin game (conn.skata, conn.hangman, ...).
  return new Proxy(conn, {
    get(target, prop) {
      if (prop in target) return target[prop]
      if (typeof prop === 'symbol') return undefined
      // Objek cache otomatis: plugin melakukan `conn.skata = conn.skata || {}`.
      return undefined
    },
  })
}

export function makeMessage(ctx, message, { jid = null } = {}) {
  const sender = jid || senderJidFor(ctx)
  const isGroup = String(ctx.chatId || '').startsWith('-')
  const m = {
    key: { remoteJid: sender, fromMe: false, id: String(message?.message_id || crypto.randomBytes(6).toString('hex')) },
    chat: sender,
    sender,
    fromMe: false,
    isGroup,
    isBaileys: false,
    text: String(message?.text || ''),
    pushName: ctx.displayName || ctx.username || 'Pengguna',
    name: ctx.displayName || ctx.username || 'Pengguna',
    mentionedJid: [],
    quoted: quotedFrom(ctx, sender, message),
    messageTimestamp: Math.floor(Date.now() / 1000),
    reply: (content, options) => sendContent(ctx, content, options),
    react: emoji => (ctx.client?.setMessageReaction?.(ctx.chatId, ctx.messageId, String(emoji || '')).catch(() => {})),
    download: async () => {
      const fileId = message?.document?.file_id || message?.video?.file_id || message?.photo?.at(-1)?.file_id || message?.audio?.file_id
      if (!fileId) throw new Error('Tidak ada media pada pesan ini.')
      return ctx.downloadFile(fileId)
    },
    getQuotedObj: async () => { throw new Error('Balasan (quoted) WhatsApp tidak tersedia di Telegram.') },
    copy: async () => {},
  }
  // `mentionedJid` sering ditulis plugin; jaga dengan defineProperty agar tidak
  // memicu setter aneh (pola yang dipakai bot WhatsApp).
  try {
    Object.defineProperty(m, 'mentionedJid', { value: [], writable: true, configurable: true, enumerable: true })
  } catch {}
  return m
}

/* ─────────────────────────── eksekusi ─────────────────────────── */

function deny(ctx, key, name, reason) {
  audit({
    actorUserId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId,
    action: 'telegram.plugin.denied', resource: name, result: 'denied', meta: { role: ctx.role, reason },
  })
  return ctx.send(`⛔ ${reason}`).then(() => ({ handled: true, plugin: key, denied: true }))
}

/**
 * Jalankan plugin WhatsApp di Telegram.
 * @returns {Promise<{handled:boolean, plugin?:string, error?:string}>}
 */
export async function runPluginOnTelegram(ctx, parsed, { plugins = globalThis.plugins } = {}) {
  const name = String(parsed?.name || '').toLowerCase()
  if (!name || PLATFORM_OWNED.has(name)) return { handled: false }
  const item = findItem(name, plugins)
  if (!item) return { handled: false }
  const plugin = plugins?.[item.key]
  const handler = handlerOf(plugin)
  if (!handler) return { handled: false }

  // Fitur yang mustahil di Telegram (rich HTML interaktif WhatsApp, pairing
  // sesi WA) tetap hidup di bot WhatsApp & jadibot — di sini dijawab jelas,
  // bukan dijalankan setengah jalan lalu gagal.
  if (item.waOnly) {
    audit({
      actorUserId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId,
      action: 'telegram.plugin.wa_only', resource: name, result: 'denied',
      meta: { plugin: item.key, reason: item.waReason || null },
    })
    const safe = value => String(value || '').replace(/[<>&]/g, '')
    await ctx.send([
      `⛔ <b>/${safe(name)}</b> khusus WhatsApp.`,
      item.waReason ? `Fitur ini ${safe(item.waReason)}, yang tidak bisa ditampilkan di Telegram.` : '',
      '',
      'Buka dari <b>bot WhatsApp</b> atau <b>jadibot WA</b> milikmu — fiturnya tetap ada di sana.',
    ].filter(Boolean).join('\n'))
    return { handled: true, plugin: item.key, waOnly: true }
  }

  const rank = ROLE_RANK[ctx.role] ?? 9
  if (plugin.owner && rank > 1) return deny(ctx, item.key, name, 'Fitur ini khusus owner/developer.')
  if (plugin.admin && rank > 2) return deny(ctx, item.key, name, 'Fitur ini khusus admin ke atas.')
  if (plugin.premium) return deny(ctx, item.key, name, 'Fitur premium belum tersedia untuk akun Telegram ini.')

  const jid = senderJidFor(ctx)
  const message = ctx.rawMessage || { message_id: ctx.messageId || null, text: `/${name} ${(parsed.args || []).join(' ')}`.trim() }
  const m = makeMessage(ctx, message, { jid })
  const conn = makeConn(ctx, message, jid)
  const options = {
    conn,
    m,
    text: (parsed.args || []).join(' '),
    args: parsed.args || [],
    usedPrefix: '/',
    command: name,
    prefix: '/',
    isOwner: rank <= 1,
    isROwner: ctx.role === 'owner',
    isAdmin: false,
    isBotAdmin: false,
    isPrems: rank <= 2,
    isCreator: ctx.role === 'owner',
    participants: [],
    groupMetadata: null,
    __telegram: true,
  }

  // Bot Telegram milik pengguna yang sudah dihubungkan ke bot WhatsApp-nya:
  // plugin yang memakai `global.conn` harus berjalan di socket WhatsApp itu,
  // bukan di bot utama. Tanpa socket hidup, tetap jalan di konteks Telegram.
  const linkedNumber = (() => {
    try { return getBotRow(ctx.botId)?.wa_number || null } catch { return null }
  })()
  const waConn = linkedNumber ? globalThis.jadibotConns?.get(linkedNumber) || null : null

  const started = Date.now()
  let timer = null
  try {
    await Promise.race([
      Promise.resolve(waConn ? runWithBotConnection(waConn, () => handler(m, options)) : handler(m, options)),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(Object.assign(new Error('Fitur tidak selesai dalam 45 detik.'), { timeout: true })), COMMAND_TIMEOUT_MS)
        timer.unref?.()
      }),
    ])
    audit({
      actorUserId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId,
      action: 'telegram.plugin.run', resource: name, meta: { plugin: item.key, ms: Date.now() - started },
    })
    return { handled: true, plugin: item.key }
  } catch (error) {
    const raw = String(error?.message || error || 'gagal')
    const waOnly = /WhatsApp|socket|Baileys|grup|group|whatsapp/i.test(raw)
    // Error nyata (bukan sekadar "fitur ini khusus WhatsApp") wajib sampai ke owner.
    if (!waOnly) {
      recordError(error, {
        source: 'telegram.plugin',
        plugin: item.key,
        command: name,
        args: parsed.args || [],
        scope: `telegram:${ctx.botId || ''}`,
        chat: String(ctx.chatId || ''),
        isGroup: ctx.chatType ? ctx.chatType !== 'telegram' && ctx.chatType !== 'private' : false,
      }).catch(() => {})
    }
    await ctx.send(waOnly
      ? `⚠️ <b>/${name}</b> butuh fitur WhatsApp yang tidak ada di Telegram.\nCoba dari bot WhatsApp.`
      : `❌ <b>/${name}</b> gagal.\n<code>${waToHtml(raw).slice(0, 300)}</code>`)
    audit({
      actorUserId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId,
      action: 'telegram.plugin.run', resource: name, result: 'failed',
      meta: { plugin: item.key, error: raw.slice(0, 200), waOnly },
    })
    return { handled: true, plugin: item.key, error: raw }
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/** Jalankan plugin RPG tertentu: dipakai `/rpg <perintah>`. */
export async function runRpgPlugin(ctx, name) {
  return runPluginOnTelegram(ctx, { name, args: [] })
}
