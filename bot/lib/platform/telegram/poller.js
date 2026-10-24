/**
 * Long-polling worker Telegram.
 *
 * Jaminan:
 *  - Satu worker per bot: map di memori + lock baris di database (status 'online').
 *  - Update diproses berurutan; `update_id` disimpan agar retry Telegram tidak
 *    mengeksekusi command dua kali (termasuk setelah restart).
 *  - Backoff eksponensial saat error jaringan/429; health status diperbarui.
 *  - Berhenti rapi (graceful) tanpa meninggalkan timer.
 */
import { TelegramClient } from './client.js'
import * as bots from './bots.js'
const { botToken, getBotRow, updateBotStatus } = bots
import { platformDb } from '../db.js'
import { audit, setHealth } from '../audit.js'
import { resolveContext } from '../identity.js'
import { redact } from '../secrets.js'
import { CommandRouter } from './router.js'
import { registerCommands, handleMediaMessage } from './commands.js'
import { recordChat } from '../chats.js'
import { sendBanner } from './banner.js'
import { runPluginOnTelegram } from './plugin-bridge.js'
import { recordError } from '../../error-hub.js'

const MAX_BACKOFF_MS = 60000
const BASE_BACKOFF_MS = 1000

function metaGet(key) {
  return platformDb().prepare('SELECT value FROM platform_meta WHERE key = ?').get(String(key))?.value || null
}

function metaSet(key, value) {
  platformDb().prepare('INSERT OR REPLACE INTO platform_meta(key, value) VALUES(?,?)').run(String(key), String(value))
}

export class TelegramAdapter {
  /**
   * @param {{botRowId:string, env?:object, router?:CommandRouter, logger?:console, baseUrl?:string}} options
   */
  constructor({ botRowId, env = process.env, router = null, logger = console, baseUrl = '' } = {}) {
    this.botRowId = String(botRowId)
    this.env = env
    this.logger = logger
    this.baseUrl = baseUrl
    this.router = router || new CommandRouter({ logger })
    this.client = null
    this.running = false
    this.stopped = false
    this.loopPromise = null
    this.info = null
    this.stats = { updates: 0, errors: 0, lastUpdateAt: null, startedAt: null, reconnect: 0 }
    this.backoff = BASE_BACKOFF_MS
  }

  get offsetKey() { return `telegram_offset:${this.botRowId}` }

  prepare() {
    const row = getBotRow(this.botRowId)
    if (!row) throw Object.assign(new Error('Konfigurasi bot tidak ditemukan.'), { status: 404 })
    if (!row.token_cipher) throw Object.assign(new Error('Token bot belum diatur.'), { status: 409 })
    this.row = row
    this.token = botToken(this.botRowId, this.env)
    this.client = new TelegramClient(this.token, { base: this.env.TELEGRAM_API_BASE || undefined })
    if (!this.router.commands.size) {
      registerCommands(this.router, { publicBaseUrl: this.baseUrl, logger: this.logger })
      this.router.onFreeText((ctx, message) => handleMediaMessage(ctx, message, { baseUrl: this.baseUrl }))
      // Perintah di luar router platform dijalankan plugin WhatsApp yang sama.
      this.router.onUnknownCommand((ctx, parsed) => runPluginOnTelegram(ctx, parsed))
    }
    globalThis.__umiTelegramBots = bots
    return this
  }

  async init() {
    if (!this.info) {
      this.info = await this.client.getMe()
      this.stats.startedAt = new Date().toISOString()
      platformDb().prepare('UPDATE telegram_bots SET bot_id=?, username=?, first_name=?, status=?, last_error=NULL, last_checked_at=?, updated_at=? WHERE id=?')
        .run(String(this.info.id), String(this.info.username || ''), String(this.info.first_name || ''), 'online', Date.now(), Date.now(), this.botRowId)
      setHealth(`telegram:${this.botRowId}`, 'ok', `@${this.info.username} · polling`)
      const commands = this.router.list().filter(item => item.scope !== 'hidden').map(item => ({ command: item.name, description: (item.description || item.name).slice(0, 120) }))
      await this.client.setMyCommands(commands).catch(error => this.logger.warn?.('[TELEGRAM] setMyCommands:', error.message))
    }
    return this.info
  }

  buildContext(update) {
    const message = update.message || update.edited_message || update.callback_query?.message || null
    const from = update.callback_query?.from || message?.from || null
    if (!from) throw Object.assign(new Error('Update tanpa pengirim.'), { status: 400 })
    const chatId = update.callback_query?.message?.chat?.id ?? message?.chat?.id
    const identity = resolveContext({
      platform: 'telegram',
      platformUserId: from.id,
      username: from.username || null,
      displayName: [from.first_name, from.last_name].filter(Boolean).join(' ') || from.username || null,
      env: this.env,
    })
    const client = this.client
    const ctx = {
      platform: 'telegram',
      platformUserId: String(from.id),
      chatId,
      username: from.username || null,
      displayName: [from.first_name, from.last_name].filter(Boolean).join(' ') || from.username || null,
      userId: identity.userId,
      role: identity.role,
      identity: identity.identity,
      botId: this.botRowId,
      messageId: message?.message_id || null,
      // Pesan yang memuat tombol yang ditekan — dipakai untuk mengedit pesan
      // di tempat (ganti halaman tanpa mengirim pesan baru).
      callbackMessageId: update.callback_query?.message?.message_id || null,
      chatTitle: message?.chat?.title || null,
      chatType: message?.chat?.type || 'private',
      rawMessage: update.message || update.edited_message || null,
      client,
      env: this.env,
      publicBaseUrl: this.baseUrl,
      sendBanner: options => sendBanner({ ...ctx, client, env: this.env, botId: this.botRowId }, options),
      deleteMessage: () => client.deleteMessage(chatId, message?.message_id).then(() => true).catch(() => false),
      actor: { userId: identity.userId, platform: 'telegram', platformUserId: String(from.id) },
      send: (text, options = {}) => client.sendMessage(chatId, text, { ...options, disable_web_page_preview: true }),
      edit: (messageId, text, options = {}) => client.editMessageText(chatId, messageId, text, options),
      editCaption: (messageId, caption, options = {}) => client.editMessageCaption(chatId, messageId, caption, options),
      answerCallback: (options = {}) => client.answerCallbackQuery(update.callback_query?.id || '', options),
      sendChatAction: action => client.sendChatAction(chatId, action).catch(() => {}),
      downloadFile: (fileId, options) => client.downloadFile(fileId, options),
      refreshIdentity: () => {
        const next = resolveContext({ platform: 'telegram', platformUserId: from.id, username: from.username || null, env: this.env })
        ctx.userId = next.userId
        ctx.role = next.role
        ctx.identity = next.identity
        return next
      },
    }
    globalThis.__umiTelegramRole = ctx.role
    return ctx
  }

  /** Proses satu update. Tidak melempar: error dicatat dan dilaporkan. */
  async processUpdate(update) {
    const db = platformDb()
    // Catat chat (terutama grup) supaya arsip bisa dikirim ke grup yang benar.
    const chat = update.message?.chat || update.edited_message?.chat || update.callback_query?.message?.chat || null
    if (chat?.id) {
      try { recordChat(chat) } catch (error) { this.logger.warn?.('[TELEGRAM] gagal mencatat chat:', error.message) }
    }
    const inserted = db.prepare('INSERT OR IGNORE INTO telegram_updates(bot_id, update_id, seen_at) VALUES(?,?,?)')
      .run(this.botRowId, Number(update.update_id), Date.now())
    if (!inserted.changes) return { duplicate: true }
    const ctx = this.buildContext(update)
    try {
      const result = await this.router.handleUpdate(ctx, update)
      this.stats.updates += 1
      this.stats.lastUpdateAt = new Date().toISOString()
      return result
    } catch (error) {
      this.stats.errors += 1
      const message = redact(error.message || String(error), this.token)
      this.logger.error?.('[TELEGRAM] update gagal:', message)
      audit({ actorUserId: ctx.userId, platform: 'telegram', platformUserId: ctx.platformUserId, action: 'telegram.update.error', result: 'failed', meta: { error: message.slice(0, 200), updateId: update.update_id } })
      // Kirim ke pusat error: log berkas + notifikasi Telegram owner.
      recordError(error, {
        source: 'telegram.update',
        scope: `telegram:${this.info?.username || this.botRowId}`,
        chat: String(ctx.chatId || ''),
        isGroup: ctx.chatType ? ctx.chatType !== 'private' : false,
      }).catch(() => {})
      return { error: message }
    }
  }

  async pollOnce({ timeout = 25 } = {}) {
    const offset = Number(metaGet(this.offsetKey) || 0)
    const updates = await this.client.getUpdates({ offset: offset || undefined, timeout, limit: 50 })
    if (!Array.isArray(updates) || !updates.length) return 0
    for (const update of updates) {
      await this.processUpdate(update)
      metaSet(this.offsetKey, Number(update.update_id) + 1)
    }
    this.backoff = BASE_BACKOFF_MS
    return updates.length
  }

  async start() {
    if (this.running) return this
    this.prepare()
    await this.init()
    this.running = true
    this.stopped = false
    this.loopPromise = this.loop()
    this.logger.log?.(`[TELEGRAM] @${this.info.username} polling aktif (bot ${this.botRowId}).`)
    audit({ actorUserId: this.row?.owner_user_id, platform: 'telegram', action: 'telegram.poller.start', resource: this.botRowId, meta: { username: this.info.username } })
    return this
  }

  async loop() {
    while (!this.stopped) {
      try {
        await this.pollOnce()
      } catch (error) {
        if (this.stopped) break
        this.stats.errors += 1
        this.stats.reconnect += 1
        const retryAfter = Number(error.retryAfter || 0) * 1000
        const wait = Math.min(MAX_BACKOFF_MS, retryAfter || this.backoff)
        const message = redact(error.message || String(error), this.token)
        this.logger.warn?.(`[TELEGRAM] polling error (${message}); coba lagi ${Math.round(wait / 1000)}s.`)
        updateBotStatus(this.botRowId, error.status === 401 ? 'revoked' : 'error', message)
        if (error.status === 401) {
          // Token dicabut = butuh tindakan manusia, jadi wajib sampai ke owner.
          recordError(error, {
            source: 'telegram.polling',
            scope: `telegram:${this.info?.username || this.botRowId}`,
            command: 'getUpdates',
            force: true,
          }).catch(() => {})
          break // token dicabut: berhenti, jangan spam
        }
        await sleep(wait)
        this.backoff = Math.min(MAX_BACKOFF_MS, Math.max(BASE_BACKOFF_MS, this.backoff * 2))
      }
    }
    this.running = false
  }

  async stop({ reason = 'manual' } = {}) {
    this.stopped = true
    this.running = false
    try { await Promise.race([this.loopPromise, sleep(4000)]) } catch {}
    if (this.botRowId) updateBotStatus(this.botRowId, 'offline', null)
    audit({ actorUserId: this.row?.owner_user_id, platform: 'telegram', action: 'telegram.poller.stop', resource: this.botRowId, meta: { reason } })
    return this
  }

  status() {
    const row = getBotRow(this.botRowId)
    return {
      botRowId: this.botRowId,
      username: this.info?.username || row?.username || null,
      botId: this.info?.id || row?.bot_id || null,
      enabled: Boolean(row?.enabled),
      mode: row?.mode || 'polling',
      running: this.running,
      status: row?.status || 'unknown',
      lastError: row?.last_error || null,
      stats: { ...this.stats },
      offset: Number(metaGet(this.offsetKey) || 0),
    }
  }
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, Math.max(0, Number(ms) || 0)))
}
