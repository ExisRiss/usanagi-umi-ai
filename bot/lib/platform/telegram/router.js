/**
 * Router command Telegram: parsing, RBAC, rate limit, tombol terikat pemilik.
 *
 * Prinsip:
 *  - Permission dicek di server dari role database (bukan dari teks command).
 *  - Callback inline keyboard memakai token acak yang terikat ke user pembuatnya,
 *    sekali pakai, dan kedaluwarsa — mencegah orang lain mengeksekusi aksi.
 *  - Semua error dicatat ke audit (tanpa rahasia) dan dibalas dengan pesan jelas.
 */
import crypto from 'node:crypto'
import { platformDb } from '../db.js'
import { audit } from '../audit.js'
import { can } from '../roles.js'
import { recordError } from '../../error-hub.js'

const CALLBACK_TTL_MS = 10 * 60 * 1000
// Navigasi menu tidak punya efek samping, jadi tombolnya boleh ditekan ulang
// selama belum kedaluwarsa. Aksi lain (trade, restart server, stop jadibot)
// tetap sekali pakai.
const REUSABLE_CALLBACKS = new Set(['menu.nav'])
const RATE_WINDOW_MS = 60 * 1000
const RATE_LIMITS = { default: 30, sensitive: 8, callback: 40 }

export class RateLimiter {
  constructor() {
    this.buckets = new Map()
  }

  check(key, limit) {
    const now = Date.now()
    const bucket = this.buckets.get(key) || []
    const fresh = bucket.filter(at => now - at < RATE_WINDOW_MS)
    if (fresh.length >= limit) {
      const retryAfter = Math.ceil((RATE_WINDOW_MS - (now - fresh[0])) / 1000)
      throw Object.assign(new Error(`Terlalu banyak permintaan. Coba lagi dalam ${retryAfter} detik.`), { status: 429, retryAfter })
    }
    fresh.push(now)
    this.buckets.set(key, fresh)
    if (this.buckets.size > 5000) {
      for (const [entry, list] of this.buckets) {
        if (!list.some(at => now - at < RATE_WINDOW_MS)) this.buckets.delete(entry)
      }
    }
  }
}

export function createCallback({ userId, platform, platformUserId, action, payload = null, ttlMs = CALLBACK_TTL_MS }) {
  const db = platformDb()
  const token = crypto.randomBytes(9).toString('base64url')
  const at = Date.now()
  db.prepare(`INSERT INTO platform_callbacks(token, user_id, platform, platform_user_id, action, payload, created_at, expires_at, used_at)
    VALUES (?,?,?,?,?,?,?,?,NULL)`).run(token, String(userId), platform, String(platformUserId), action, payload ? JSON.stringify(payload) : null, at, at + ttlMs)
  return token
}

export function consumeCallback(token, { userId, platform, platformUserId }) {
  const db = platformDb()
  const row = db.prepare('SELECT * FROM platform_callbacks WHERE token = ?').get(String(token || ''))
  if (!row) throw Object.assign(new Error('Tombol tidak dikenali. Kirim /menu lagi.'), { status: 404 })
  // Navigasi menu aman diulang: jangan tolak hanya karena pernah ditekan.
  const navigation = REUSABLE_CALLBACKS.has(row.action) || String(row.action).startsWith('menu.')
  if (row.used_at && !navigation) throw Object.assign(new Error('Tombol ini sudah dipakai. Kirim /menu lagi.'), { status: 409 })
  if (row.expires_at < Date.now()) throw Object.assign(new Error('Tombol sudah kedaluwarsa. Kirim /menu lagi.'), { status: 410 })
  if (String(row.user_id) !== String(userId) || String(row.platform_user_id) !== String(platformUserId) || row.platform !== platform) {
    audit({ actorUserId: userId, platform, platformUserId, action: 'telegram.callback.denied', resource: row.action, result: 'denied', meta: { owner: row.user_id } })
    throw Object.assign(new Error('Tombol ini milik pengguna lain.'), { status: 403 })
  }
  if (navigation) {
    return { action: row.action, payload: row.payload ? JSON.parse(row.payload) : null, reusable: true }
  }
  db.prepare('UPDATE platform_callbacks SET used_at = ? WHERE token = ?').run(Date.now(), row.token)
  return { action: row.action, payload: row.payload ? JSON.parse(row.payload) : null }
}

export class CommandRouter {
  constructor({ limiter = new RateLimiter(), logger = console } = {}) {
    this.commands = new Map()
    this.callbackActions = new Map()
    this.limiter = limiter
    this.logger = logger
  }

  register(command) {
    if (!command?.name) throw new Error('Command tanpa nama')
    this.commands.set(command.name.toLowerCase(), { scope: 'user', sensitive: false, ...command })
    return this
  }

  registerCallback(action, handler) {
    this.callbackActions.set(action, handler)
    return this
  }

  list() {
    return [...this.commands.values()].map(item => ({
      name: item.name, description: item.description || '', permission: item.permission || null, scope: item.scope,
    }))
  }

  parse(text) {
    const raw = String(text || '').trim()
    // `/menu` (gaya Telegram) dan `.menu` (gaya bot WhatsApp) sama-sama diterima
    // supaya pengguna tidak perlu belajar dua sintaks.
    if (!/^[/.]\w/.test(raw)) return null
    const [head, ...rest] = raw.slice(1).split(/\s+/)
    const [name, ...argParts] = head.split('@')
    return { name: name.toLowerCase(), args: [...argParts.flatMap(part => part ? [part] : []), ...rest], text: rest.join(' ') }
  }

  /** Cek izin tanpa menjalankan handler (dipakai untuk menyusun menu). */
  allowed(ctx, commandName) {
    const command = this.commands.get(String(commandName).toLowerCase())
    if (!command) return false
    if (!command.permission) return true
    return can(ctx.role, command.permission)
  }

  async handleUpdate(ctx, update) {
    if (update.callback_query) return this.handleCallback(ctx, update.callback_query)
    const message = update.message || update.edited_message
    if (!message) return { ignored: true }
    // Foto/video yang dikirim dengan caption `/sticker` juga harus dianggap
    // perintah (bukan sekadar media), supaya fitur berbasis "kirim gambar".
    const parsed = this.parse(message.text || message.caption)
    if (!parsed) return this.handleFreeText(ctx, message)
    const command = this.commands.get(parsed.name)
    if (!command) {
      // Perintah tidak ada di router platform → coba plugin WhatsApp yang sama
      // (satu sumber fitur, dua antarmuka). Bila bridge tidak mengenalinya,
      // barulah balas "tidak dikenali".
      if (this.unknownHandler) {
        const result = await this.unknownHandler(ctx, parsed, message).catch(error => ({ handled: false, error }))
        if (result?.handled) return { handled: true, bridged: true, result }
      }
      await ctx.send('Perintah tidak dikenali. Ketik /menu untuk daftar perintah.')
      return { handled: false, unknown: parsed.name }
    }
    if (command.permission && !can(ctx.role, command.permission)) {
      audit({
        actorUserId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId,
        action: 'telegram.command.denied', resource: parsed.name, result: 'denied',
        meta: { role: ctx.role, required: command.permission },
      })
      await ctx.send('⛔ Akses ditolak.\nPeran Anda: <b>' + ctx.role + '</b>.\nPerintah ini butuh izin <code>' + command.permission + '</code>.')
      return { handled: false, denied: true }
    }
    try {
      this.limiter.check(`${ctx.userId}:${parsed.name}`, command.sensitive ? RATE_LIMITS.sensitive : RATE_LIMITS.default)
      const result = await command.handler(ctx, parsed, message)
      return { handled: true, result }
    } catch (error) {
      const status = Number(error?.status) || 500
      this.logger.error?.(`[TELEGRAM] /${parsed.name} gagal:`, error?.message)
      audit({
        actorUserId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId,
        action: `telegram.command.${parsed.name}`, result: 'failed',
        meta: { status, error: String(error?.message || error).slice(0, 200) },
      })
      // Kegagalan nyata (bukan rate limit) dikirim ke pusat error: log berkas +
      // notifikasi Telegram owner, dedupe 10 menit.
      if (status !== 429) {
        recordError(error, {
          source: 'telegram.command',
          command: parsed.name,
          args: parsed.args || [],
          scope: `telegram:${ctx.botId || ''}`,
          chat: String(ctx.chatId || ''),
          isGroup: ctx.chatType ? ctx.chatType !== 'private' : false,
        }).catch(() => {})
      }
      await ctx.send(status === 429
        ? `⏳ ${error.message}`
        : `❌ Perintah gagal.\n<code>${escapeHtml(String(error?.message || error).slice(0, 300))}</code>`)
      return { handled: false, error }
    }
  }

  async handleCallback(ctx, callback) {
    try {
      this.limiter.check(`cb:${ctx.userId}`, RATE_LIMITS.callback)
      const data = String(callback.data || '')
      if (!data.startsWith('cb:')) {
        await ctx.answerCallback({ text: 'Tombol tidak valid.' })
        return { handled: false }
      }
      const token = data.slice(3)
      const { action, payload } = consumeCallback(token, {
        userId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId,
      })
      let handler = this.callbackActions.get(action)
      let resolvedPayload = payload
      // Kompatibilitas pesan menu lama: tombol versi sebelumnya memakai aksi
      // menu.<view> (bukan menu.nav), jadi masih bisa diarahkan ke handler yang
      // sama agar tidak berakhir "Aksi tidak tersedia".
      if (!handler && action.startsWith('menu.')) {
        const fallback = this.callbackActions.get('menu.nav')
        if (fallback) {
          handler = fallback
          resolvedPayload = { ...(payload || {}), view: action.slice(5) }
        }
      }
      if (!handler) {
        this.logger.warn?.(`[TELEGRAM] callback tanpa handler: ${action}`)
        audit({ actorUserId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'telegram.callback.unhandled', resource: action, result: 'failed' })
        await ctx.answerCallback({ text: 'Aksi tidak tersedia.' })
        return { handled: false }
      }
      await ctx.answerCallback({ text: '' })
      await handler(ctx, resolvedPayload, callback)
      audit({ actorUserId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: `telegram.callback.${action}` })
      return { handled: true }
    } catch (error) {
      this.logger.error?.('[TELEGRAM] callback gagal:', error?.message)
      await ctx.answerCallback?.({ text: String(error?.message || 'Gagal').slice(0, 180), show_alert: false }).catch(() => {})
      return { handled: false, error }
    }
  }

  async handleFreeText(ctx, message) {
    // Media TANPA caption: diperlakukan sebagai upload to-URL. Media dengan
    // caption sudah ditangani sebagai perintah di `handleUpdate`.
    if (message.caption) return { ignored: true }
    const media = message.photo || message.video || message.document || message.audio
    if (media) {
      const handler = this.freeTextHandler
      if (handler) return handler(ctx, message).then(result => ({ handled: true, result }))
      return { ignored: true }
    }
    const text = String(message.text || '').trim()
    if (!text) return { ignored: true }
    if (/^(menu|start|halo|hai|hello)$/i.test(text)) {
      const menu = this.commands.get('menu')
      if (menu && this.allowed(ctx, 'menu')) return menu.handler(ctx, { name: 'menu', args: [], text: '' }, message).then(result => ({ handled: true, result }))
    }
    await ctx.send('Ketik /menu untuk daftar perintah, atau kirim foto/video untuk diubah menjadi tautan.')
    return { handled: false }
  }

  onFreeText(handler) {
    this.freeTextHandler = handler
    return this
  }

  /** Handler untuk perintah yang tidak terdaftar di platform (bridge plugin). */
  onUnknownCommand(handler) {
    this.unknownHandler = handler
    return this
  }
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function chunkLines(lines, size = 25) {
  const out = []
  for (let index = 0; index < lines.length; index += size) out.push(lines.slice(index, index + size))
  return out
}
