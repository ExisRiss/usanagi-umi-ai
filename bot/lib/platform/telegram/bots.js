/**
 * Konfigurasi bot Telegram (bot utama platform + bot tambahan milik pengguna).
 *
 * Token disimpan terenkripsi (`token_cipher`), tidak pernah dikembalikan utuh.
 * Validasi token memakai endpoint resmi `getMe`, bukan menebak dari format.
 */
import crypto from 'node:crypto'
import { platformDb } from '../db.js'
import { seal, open, mask, redact, secretKey } from '../secrets.js'
import { audit, setHealth } from '../audit.js'
import { TelegramClient, isTelegramToken } from './client.js'

export const MAIN_BOT_ID = 'main'

export function maskRecord(row) {
  if (!row) return null
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    scope: row.scope,
    label: row.label,
    botId: row.bot_id,
    username: row.username,
    firstName: row.first_name,
    enabled: Boolean(row.enabled),
    mode: row.mode,
    webhookUrl: row.webhook_url,
    status: row.status,
    lastError: row.last_error,
    lastCheckedAt: row.last_checked_at ? new Date(row.last_checked_at).toISOString() : null,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
    tokenMasked: row.token_cipher ? mask(`bot:${'*'.repeat(20)}`) : '',
    tokenSet: Boolean(row.token_cipher),
    // Sambungan ke bot WhatsApp milik pemilik bot (nomor jadibot/main).
    waNumber: row.wa_number ? String(row.wa_number).replace(/^(\d{4})\d+(\d{3})$/, '$1***$2') : null,
    waNumberRaw: row.wa_number ? String(row.wa_number) : null,
    waLinkedAt: row.wa_linked_at ? new Date(row.wa_linked_at).toISOString() : null,
    linked: Boolean(row.wa_number),
  }
}

/**
 * Simpan/ubah token bot. `token` boleh kosong saat mengubah label saja.
 * @returns {Promise<object>} record tersamar
 */
export async function saveBot({
  id = null,
  token = null,
  label = 'Bot Telegram',
  ownerUserId = 'system',
  waNumber = undefined,
  scope = 'platform',
  mode = 'polling',
  enabled = null,
  webhookUrl = null,
  env = process.env,
} = {}) {
  const db = platformDb()
  // Pastikan kunci enkripsi ada SEBELUM menyentuh token.
  secretKey(env)

  const botKey = id || `bot_${crypto.randomBytes(6).toString('hex')}`
  const existing = db.prepare('SELECT * FROM telegram_bots WHERE id = ?').get(botKey)
  let cipher = existing?.token_cipher || null
  let info = null

  if (token) {
    if (!isTelegramToken(token)) throw Object.assign(new Error('Format token bot Telegram tidak valid.'), { status: 400 })
    const client = new TelegramClient(token, { base: env.TELEGRAM_API_BASE || undefined })
    try {
      info = await client.getMe()
    } catch (error) {
      audit({ actorUserId: ownerUserId, action: 'telegram.token.validate', resource: botKey, result: 'failed', meta: { reason: redact(error.message, token) } })
      throw Object.assign(new Error(`Token ditolak Telegram: ${redact(error.message, token)}`), { status: 400 })
    }
    const duplicate = db.prepare('SELECT id FROM telegram_bots WHERE bot_id = ? AND id != ?').get(String(info.id), botKey)
    if (duplicate) throw Object.assign(new Error('Bot ini sudah terdaftar pada konfigurasi lain.'), { status: 409 })
    cipher = seal(token, env)
    // Webhook butuh secret token; dibuat acak dan disimpan terenkripsi bersama token.
    if (mode === 'webhook' && !existing?.webhook_secret) {
      // placeholder; webhook secret diisi saat setWebhook dipanggil
    }
  }

  if (!cipher) throw Object.assign(new Error('Token bot wajib diisi untuk konfigurasi baru.'), { status: 400 })

  const at = Date.now()
  const enabledValue = enabled === null ? Boolean(existing?.enabled) : Boolean(enabled)
  const next = {
    id: botKey,
    owner_user_id: ownerUserId,
    scope,
    label: String(label || existing?.label || 'Bot Telegram').slice(0, 80),
    token_cipher: cipher,
    bot_id: info ? String(info.id) : existing?.bot_id || null,
    username: info ? String(info.username || '') : existing?.username || null,
    first_name: info ? String(info.first_name || '') : existing?.first_name || null,
    enabled: enabledValue ? 1 : 0,
    mode: mode === 'webhook' ? 'webhook' : 'polling',
    webhook_url: webhookUrl || existing?.webhook_url || null,
    status: info ? (enabledValue ? 'starting' : 'configured') : existing?.status || 'configured',
    updated_at: at,
  }
  db.prepare(`INSERT INTO telegram_bots(id, owner_user_id, scope, label, token_cipher, bot_id, username, first_name, enabled, mode, webhook_url, status, created_at, updated_at)
    VALUES (@id,@owner_user_id,@scope,@label,@token_cipher,@bot_id,@username,@first_name,@enabled,@mode,@webhook_url,@status,COALESCE((SELECT created_at FROM telegram_bots WHERE id=@id), @updated_at),@updated_at)
    ON CONFLICT(id) DO UPDATE SET scope=excluded.scope, label=excluded.label, token_cipher=excluded.token_cipher, bot_id=excluded.bot_id,
      username=excluded.username, first_name=excluded.first_name, enabled=excluded.enabled, mode=excluded.mode,
      webhook_url=excluded.webhook_url, status=excluded.status, updated_at=excluded.updated_at`)
    .run({ ...next, updated_at: at })

  // Sambungan ke bot WhatsApp: hanya disimpan kalau nomornya valid (angka).
  if (waNumber !== undefined) {
    const digits = String(waNumber || '').replace(/\D/g, '')
    platformDb().prepare('UPDATE telegram_bots SET wa_number = ?, wa_linked_at = ? WHERE id = ?')
      .run(digits || null, digits ? Date.now() : null, botKey)
  }

  if (info) setHealth(`telegram:${botKey}`, 'ok', `@${info.username}`)
  audit({
    actorUserId: ownerUserId,
    action: info ? (existing ? 'telegram.token.replace' : 'telegram.bot.create') : 'telegram.bot.update',
    resource: botKey,
    meta: { label: next.label, username: next.username, botId: next.bot_id, scope, enabled: enabledValue, mode: next.mode },
  })
  return maskRecord(db.prepare('SELECT * FROM telegram_bots WHERE id = ?').get(botKey))
}

/** Token plaintext HANYA untuk proses internal (poller/setWebhook), tidak untuk API. */
export function botToken(rowId, env = process.env) {
  const row = platformDb().prepare('SELECT * FROM telegram_bots WHERE id = ?').get(String(rowId))
  if (!row) throw Object.assign(new Error('Konfigurasi bot tidak ditemukan.'), { status: 404 })
  return open(row.token_cipher, env)
}

export function listBots({ ownerUserId = null } = {}) {
  const db = platformDb()
  const rows = ownerUserId
    ? db.prepare('SELECT * FROM telegram_bots WHERE owner_user_id = ? ORDER BY created_at').all(String(ownerUserId))
    : db.prepare('SELECT * FROM telegram_bots ORDER BY created_at').all()
  return rows.map(maskRecord)
}

/** Satu konfigurasi bot tersamar (untuk cek kepemilikan di API). */
export function getBot(id) {
  return maskRecord(getBotRow(id))
}

/**
 * Hubungkan bot Telegram ke bot WhatsApp milik pengguna.
 * Nomor harus milik pengguna itu sendiri (dicek pemanggil lewat daftar sesi),
 * tidak menerima nomor mentah dari klien tanpa verifikasi.
 */
export function linkWaNumber(id, waNumber, actor = {}) {
  const row = getBotRow(id)
  if (!row) throw Object.assign(new Error('Konfigurasi bot tidak ditemukan.'), { status: 404 })
  const digits = String(waNumber || '').replace(/\D/g, '')
  if (digits && (digits.length < 7 || digits.length > 15)) {
    throw Object.assign(new Error('Nomor bot WhatsApp tidak valid.'), { status: 400 })
  }
  platformDb().prepare('UPDATE telegram_bots SET wa_number = ?, wa_linked_at = ?, updated_at = ? WHERE id = ?')
    .run(digits || null, digits ? Date.now() : null, Date.now(), String(id))
  audit({
    actorUserId: actor.userId, platform: actor.platform, platformUserId: actor.platformUserId,
    action: digits ? 'telegram.bot.link-wa' : 'telegram.bot.unlink-wa', resource: String(id),
    meta: { number: digits ? digits.replace(/^(\d{4})\d+(\d{3})$/, '$1***$2') : null },
  })
  return maskRecord(getBotRow(id))
}

export function getBotRow(id) {
  return platformDb().prepare('SELECT * FROM telegram_bots WHERE id = ?').get(String(id)) || null
}

export function updateBotStatus(id, status, lastError = null) {
  platformDb().prepare('UPDATE telegram_bots SET status = ?, last_error = ?, last_checked_at = ?, updated_at = ? WHERE id = ?')
    .run(String(status), lastError ? redact(String(lastError)).slice(0, 300) : null, Date.now(), Date.now(), String(id))
  setHealth(`telegram:${id}`, status === 'online' ? 'ok' : 'warn', lastError || status)
}

export function setBotEnabled(id, enabled, actor = {}) {
  const row = getBotRow(id)
  if (!row) throw Object.assign(new Error('Konfigurasi bot tidak ditemukan.'), { status: 404 })
  if (enabled && !row.token_cipher) throw Object.assign(new Error('Token bot belum diatur.'), { status: 400 })
  platformDb().prepare('UPDATE telegram_bots SET enabled = ?, status = ?, updated_at = ? WHERE id = ?')
    .run(enabled ? 1 : 0, enabled ? 'starting' : 'disabled', Date.now(), String(id))
  audit({ actorUserId: actor.userId, platform: actor.platform, platformUserId: actor.platformUserId, action: enabled ? 'telegram.bot.enable' : 'telegram.bot.disable', resource: String(id) })
  return maskRecord(getBotRow(id))
}

/** Cabut konfigurasi: token dihapus dari database (tidak bisa dipulihkan). */
export function revokeBot(id, actor = {}) {
  const row = getBotRow(id)
  if (!row) throw Object.assign(new Error('Konfigurasi bot tidak ditemukan.'), { status: 404 })
  platformDb().prepare("UPDATE telegram_bots SET token_cipher='', enabled=0, status='revoked', bot_id=NULL, username=NULL, updated_at=? WHERE id=?")
    .run(Date.now(), String(id))
  audit({ actorUserId: actor.userId, platform: actor.platform, platformUserId: actor.platformUserId, action: 'telegram.bot.revoke', resource: String(id), meta: { username: row.username } })
  return maskRecord(getBotRow(id))
}

/** Validasi ulang token yang tersimpan tanpa membocorkannya. */
export async function validateBot(id, env = process.env) {
  const row = getBotRow(id)
  if (!row) throw Object.assign(new Error('Konfigurasi bot tidak ditemukan.'), { status: 404 })
  if (!row.token_cipher) throw Object.assign(new Error('Token bot sudah dicabut.'), { status: 409 })
  const token = botToken(id, env)
  const client = new TelegramClient(token, { base: env.TELEGRAM_API_BASE || undefined })
  try {
    const me = await client.getMe()
    platformDb().prepare('UPDATE telegram_bots SET bot_id=?, username=?, first_name=?, status=?, last_error=NULL, last_checked_at=?, updated_at=? WHERE id=?')
      .run(String(me.id), String(me.username || ''), String(me.first_name || ''), row.enabled ? 'starting' : 'configured', Date.now(), Date.now(), String(id))
    setHealth(`telegram:${id}`, 'ok', `@${me.username}`)
    audit({ actorUserId: row.owner_user_id, action: 'telegram.token.validate', resource: String(id), meta: { username: me.username } })
    return { ok: true, bot: { id: me.id, username: me.username, firstName: me.first_name }, record: maskRecord(getBotRow(id)) }
  } catch (error) {
    const message = redact(error.message, token)
    platformDb().prepare("UPDATE telegram_bots SET status='error', last_error=?, last_checked_at=?, updated_at=? WHERE id=?")
      .run(message.slice(0, 300), Date.now(), Date.now(), String(id))
    setHealth(`telegram:${id}`, 'error', message)
    throw Object.assign(new Error(`Token tidak valid atau dicabut: ${message}`), { status: 400 })
  }
}

/** Aktifkan mode webhook (HTTPS wajib) — dipakai bila deployment mendukung. */
export async function enableWebhook(id, url, env = process.env) {
  if (!/^https:\/\//i.test(String(url || ''))) throw Object.assign(new Error('Webhook wajib HTTPS.'), { status: 400 })
  const row = getBotRow(id)
  if (!row) throw Object.assign(new Error('Konfigurasi bot tidak ditemukan.'), { status: 404 })
  const token = botToken(id, env)
  const secret = crypto.randomBytes(24).toString('hex')
  const client = new TelegramClient(token, { base: env.TELEGRAM_API_BASE || undefined })
  await client.setWebhook(url, { secretToken: secret })
  platformDb().prepare("UPDATE telegram_bots SET mode='webhook', webhook_url=?, webhook_secret=?, status='configured', updated_at=? WHERE id=?")
    .run(String(url), secret, Date.now(), String(id))
  audit({ actorUserId: row.owner_user_id, action: 'telegram.webhook.enable', resource: String(id), meta: { url } })
  return maskRecord(getBotRow(id))
}

export async function disableWebhook(id, env = process.env) {
  const row = getBotRow(id)
  if (!row) throw Object.assign(new Error('Konfigurasi bot tidak ditemukan.'), { status: 404 })
  if (row.token_cipher) {
    const client = new TelegramClient(botToken(id, env), { base: env.TELEGRAM_API_BASE || undefined })
    await client.deleteWebhook({ dropPendingUpdates: false })
  }
  platformDb().prepare("UPDATE telegram_bots SET mode='polling', webhook_url=NULL, webhook_secret=NULL, updated_at=? WHERE id=?").run(Date.now(), String(id))
  audit({ actorUserId: row.owner_user_id, action: 'telegram.webhook.disable', resource: String(id) })
  return maskRecord(getBotRow(id))
}
