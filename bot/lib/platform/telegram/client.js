/**
 * Klien Telegram Bot API.
 *
 * Aturan keamanan:
 *  - Token hanya dipakai di URL request, tidak pernah dilog.
 *  - Semua pesan error di-redact (`redact`) sebelum dilempar/dicatat.
 *  - Timeout selalu dipasang.
 */
import { redact } from '../secrets.js'

export const API_BASE = process.env.TELEGRAM_API_BASE || 'https://api.telegram.org'

export class TelegramError extends Error {
  constructor(message, { status = 502, code = null, retryAfter = null } = {}) {
    super(message)
    this.status = status
    this.code = code
    this.retryAfter = retryAfter
    this.name = 'TelegramError'
  }
}

export class TelegramClient {
  constructor(token, { base = API_BASE, timeout = 20000 } = {}) {
    const value = String(token || '').trim()
    if (!/^\d{5,}:[A-Za-z0-9_-]{20,}$/.test(value)) {
      throw new TelegramError('Format token bot Telegram tidak valid.', { status: 400, code: 'invalid_token_format' })
    }
    this.token = value
    this.base = base.replace(/\/+$/, '')
    this.timeout = timeout
  }

  async call(method, payload = {}, { timeout } = {}) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout || this.timeout)
    let response
    try {
      response = await fetch(`${this.base}/bot${this.token}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload ?? {}),
        signal: controller.signal,
      })
    } catch (error) {
      const message = error.name === 'AbortError'
        ? `Telegram tidak merespons (timeout ${timeout || this.timeout} ms).`
        : redact(`Gagal menghubungi Telegram: ${error.message}`, this.token)
      throw new TelegramError(message, { status: 504, code: 'network' })
    } finally {
      clearTimeout(timer)
    }
    let json = null
    try { json = await response.json() } catch {}
    if (!json) throw new TelegramError(`Respons Telegram tidak valid (HTTP ${response.status}).`, { status: 502 })
    if (!json.ok) {
      const detail = json.description || `HTTP ${response.status}`
      // Telegram membalas HTTP 200 dengan error_code di body; status HTTP saja
      // tidak cukup untuk membedakan token dicabut vs rate limit.
      const code = Number(json.error_code || response.status)
      throw new TelegramError(redact(detail, this.token), {
        status: code === 401 || code === 403 ? 401 : code === 429 ? 429 : 502,
        code: code || null,
        retryAfter: json.parameters?.retry_after || null,
      })
    }
    return json.result
  }

  getMe() { return this.call('getMe', {}, { timeout: 12000 }) }
  getWebhookInfo() { return this.call('getWebhookInfo') }
  setWebhook(url, { secretToken, maxConnections = 40, dropPendingUpdates = false } = {}) {
    return this.call('setWebhook', {
      url, max_connections: maxConnections, drop_pending_updates: dropPendingUpdates,
      ...(secretToken ? { secret_token: secretToken } : {}),
    })
  }
  deleteWebhook({ dropPendingUpdates = false } = {}) { return this.call('deleteWebhook', { drop_pending_updates: dropPendingUpdates }) }
  getUpdates({ offset, limit = 50, timeout = 25, allowedUpdates = null } = {}) {
    return this.call('getUpdates', {
      offset, limit, timeout,
      ...(allowedUpdates ? { allowed_updates: allowedUpdates } : {}),
    }, { timeout: (timeout + 12) * 1000 })
  }
  sendMessage(chatId, text, options = {}) {
    return this.call('sendMessage', { chat_id: chatId, text, parse_mode: options.parseMode ?? 'HTML', ...stripOptions(options) })
  }
  editMessageText(chatId, messageId, text, options = {}) {
    return this.call('editMessageText', { chat_id: chatId, message_id: messageId, text, parse_mode: options.parseMode ?? 'HTML', ...stripOptions(options) })
  }
  /** Ganti caption pesan media (menu banner) tanpa mengirim pesan baru. */
  editMessageCaption(chatId, messageId, caption, options = {}) {
    return this.call('editMessageCaption', { chat_id: chatId, message_id: messageId, caption, parse_mode: options.parseMode ?? 'HTML', ...stripOptions(options) })
  }
  deleteMessage(chatId, messageId) { return this.call('deleteMessage', { chat_id: chatId, message_id: messageId }) }
  answerCallbackQuery(id, options = {}) { return this.call('answerCallbackQuery', { callback_query_id: id, ...options }) }
  sendChatAction(chatId, action = 'typing') { return this.call('sendChatAction', { chat_id: chatId, action }) }
  /** Reaksi emoji (dipakai plugin WA yang memanggil `m.react`). */
  setMessageReaction(chatId, messageId, emoji) {
    return this.call('setMessageReaction', {
      chat_id: chatId,
      message_id: messageId,
      reaction: [{ type: 'emoji', emoji: String(emoji).slice(0, 2) }],
      is_big: false,
    })
  }
  getFile(fileId) { return this.call('getFile', { file_id: fileId }) }
  setMyCommands(commands) { return this.call('setMyCommands', { commands }) }

  /**
   * Unggah media (video/foto/dokumen) lewat multipart.
   * Bot API tidak menerima biner di JSON, jadi `call` JSON tidak bisa dipakai.
   */
  async upload(kind, chatId, buffer, { filename = 'file.bin', caption = '', mime = 'application/octet-stream', options = {}, timeout = 120000 } = {}) {
    const method = { video: 'sendVideo', photo: 'sendPhoto', document: 'sendDocument', animation: 'sendAnimation' }[kind]
    if (!method) throw new TelegramError(`Jenis unggahan tidak didukung: ${kind}`, { status: 400 })
    const form = new FormData()
    form.append('chat_id', String(chatId))
    form.append(kind === 'document' ? 'document' : kind, new Blob([buffer], { type: mime }), filename)
    if (caption) {
      form.append('caption', caption)
      form.append('parse_mode', options.parseMode ?? 'HTML')
    }
    if (options.reply_markup) form.append('reply_markup', JSON.stringify(options.reply_markup))
    if (options.supports_streaming) form.append('supports_streaming', 'true')
    if (options.width) form.append('width', String(options.width))
    if (options.height) form.append('height', String(options.height))
    if (options.duration) form.append('duration', String(options.duration))
    if (options.disable_notification) form.append('disable_notification', 'true')

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    let response
    try {
      response = await fetch(`${this.base}/bot${this.token}/${method}`, { method: 'POST', body: form, signal: controller.signal })
    } catch (error) {
      const message = error.name === 'AbortError'
        ? `Telegram tidak merespons saat unggah (timeout ${timeout} ms).`
        : redact(`Gagal mengunggah media: ${error.message}`, this.token)
      throw new TelegramError(message, { status: 504, code: 'network' })
    } finally {
      clearTimeout(timer)
    }
    let json = null
    try { json = await response.json() } catch {}
    if (!json) throw new TelegramError(`Respons Telegram tidak valid (HTTP ${response.status}).`, { status: 502 })
    if (!json.ok) {
      const detail = json.description || `HTTP ${response.status}`
      const code = Number(json.error_code || response.status)
      throw new TelegramError(redact(detail, this.token), {
        status: code === 401 || code === 403 ? 401 : code === 429 ? 429 : 502,
        code: code || null,
        retryAfter: json.parameters?.retry_after || null,
      })
    }
    return json.result
  }

  /** Kirim video memakai file_id yang sudah diunggah (tanpa unggah ulang). */
  sendVideo(chatId, video, options = {}) {
    const payload = { chat_id: chatId, ...(typeof video === 'string' ? { video } : {}), ...(options.caption ? { caption: options.caption, parse_mode: options.parseMode ?? 'HTML' } : {}) }
    if (typeof video !== 'string') throw new TelegramError('sendVideo hanya menerima file_id; pakai upload() untuk biner.', { status: 400 })
    if (options.reply_markup) payload.reply_markup = options.reply_markup
    if (options.supports_streaming) payload.supports_streaming = true
    return this.call('sendVideo', payload, { timeout: 60000 })
  }

  /** Stiker webp/gif via multipart (sendSticker), bukan dokumen biasa. */
  async sendStickerFile(chatId, buffer, { filename = 'sticker.webp', mime = 'image/webp' } = {}) {
    const form = new FormData()
    form.append('chat_id', String(chatId))
    form.append('sticker', new Blob([buffer], { type: mime }), filename)
    return this.callMultipart('sendSticker', form)
  }

  /** Panggil Bot API dengan body multipart (FormData). */
  async callMultipart(method, form, { timeout = 60000 } = {}) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)
    let response
    try {
      response = await fetch(`${this.base}/bot${this.token}/${method}`, { method: 'POST', body: form, signal: controller.signal })
    } catch (error) {
      const message = error.name === 'AbortError'
        ? `Telegram tidak merespons (timeout ${timeout} ms).`
        : redact(`Gagal menghubungi Telegram: ${error.message}`, this.token)
      throw new TelegramError(message, { status: 504, code: 'network' })
    } finally {
      clearTimeout(timer)
    }
    let json = null
    try { json = await response.json() } catch {}
    if (!json) throw new TelegramError(`Respons Telegram tidak valid (HTTP ${response.status}).`, { status: 502 })
    if (!json.ok) throw new TelegramError(json.description || `HTTP ${response.status}`, { status: Number(json.error_code || response.status), code: 'api' })
    return json.result
  }

  getChat(chatId) { return this.call('getChat', { chat_id: chatId }) }
  getChatAdministrators(chatId) { return this.call('getChatAdministrators', { chat_id: chatId }) }
  getChatMemberCount(chatId) { return this.call('getChatMemberCount', { chat_id: chatId }) }
  getChatMember(chatId, userId) { return this.call('getChatMember', { chat_id: chatId, user_id: userId }) }
  getUserProfilePhotos(userId, limit = 1) { return this.call('getUserProfilePhotos', { user_id: userId, limit }) }
  banChatMember(chatId, userId) { return this.call('banChatMember', { chat_id: chatId, user_id: userId }) }
  unbanChatMember(chatId, userId) { return this.call('unbanChatMember', { chat_id: chatId, user_id: userId }) }
  promoteChatMember(chatId, userId, rights = {}) { return this.call('promoteChatMember', { chat_id: chatId, user_id: userId, ...rights }) }
  restrictChatMember(chatId, userId, permissions = {}) { return this.call('restrictChatMember', { chat_id: chatId, user_id: userId, permissions }) }

  /** Unduh berkas Telegram (maks 20 MB dari Bot API). */
  async downloadFile(fileId, { maxBytes = 20 * 1024 * 1024 } = {}) {
    const file = await this.getFile(fileId)
    const size = Number(file.file_size || 0)
    if (size && size > maxBytes) {
      throw new TelegramError(`Berkas ${(size / 1048576).toFixed(1)} MB melebihi batas unduh Bot API.`, { status: 413, code: 'file_too_large' })
    }
    const url = `${this.base}/file/bot${this.token}/${file.file_path}`
    let response
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(60000) })
    } catch (error) {
      throw new TelegramError(redact(`Gagal mengunduh berkas: ${error.message}`, this.token), { status: 502 })
    }
    if (!response.ok) throw new TelegramError(`Gagal mengunduh berkas (HTTP ${response.status}).`, { status: 502 })
    const buffer = Buffer.from(await response.arrayBuffer())
    if (buffer.length > maxBytes) throw new TelegramError('Berkas melebihi batas.', { status: 413 })
    return { buffer, filePath: file.file_path }
  }
}

function stripOptions(options) {
  const out = {}
  for (const key of ['reply_markup', 'disable_web_page_preview', 'disable_notification', 'reply_to_message_id', 'protect_content']) {
    if (options[key] !== undefined) out[key] = options[key]
  }
  return out
}

export function isTelegramToken(value) {
  return /^\d{5,}:[A-Za-z0-9_-]{20,}$/.test(String(value || '').trim())
}
