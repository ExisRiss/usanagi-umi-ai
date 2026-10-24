/**
 * Pusat pelaporan error bot — log berkas + notifikasi Telegram.
 *
 * Tujuan (permintaan pemilik, 2026-10-20): "setiap ada error otomatis ngirim
 * pesan dan log error". Sebelumnya error hanya:
 *   1. tercetak ke console container (cepat tertimpa), dan
 *   2. dikirim ke halaman Feedback website kalau secret-nya diatur.
 * Kalau dua-duanya tidak terlihat, error hilang tanpa jejak.
 *
 * Sekarang setiap error yang layak dilaporkan:
 *   - ditulis ke `data/errors/YYYY-MM-DD.jsonl` (mode 600, append, rotasi 14 hari),
 *   - dikirim sebagai pesan singkat ke Telegram owner (dan grup arsip bila ada),
 *   - tetap diteruskan ke website lewat `reportPluginError()` (perilaku lama),
 *   - bisa dibaca ulang lewat `GET /api/platform-system/errors` atau `/errors`.
 *
 * Aturan yang dipegang:
 *   - Modul ini TIDAK PERNAH melempar; pemanggilnya adalah blok catch.
 *   - Kredensial dihapus sebelum ditulis/dikirim.
 *   - Error yang sama digabung (dedupe 10 menit) dan dibatasi 30/jam.
 */
import fs from 'node:fs'
import path from 'node:path'
import { reportPluginError, isUserFacingError, isTransientError } from './error-report.js'

const DEDUPE_WINDOW_MS = 10 * 60 * 1000
const MAX_PER_HOUR = 30
const KEEP_DAYS = 14
const SEND_TIMEOUT_MS = 8000

const seen = new Map()
const sentAt = []

let installed = false
let hooks = null

/** Lokasi folder log error. */
export function errorLogDir(cwd = process.cwd()) {
  const override = String(process.env.UMI_ERROR_LOG_DIR || '').trim()
  if (override) return path.resolve(override)
  return path.join(cwd, 'data', 'errors')
}

/** Bersihkan kredensial dari teks bebas. */
export function redactErrorText(value) {
  return String(value ?? '')
    .replace(/(?:gsk_|vcp_|ptl[ac]_|gh[pousr]_)[A-Za-z0-9_-]{12,}/g, '<redacted>')
    .replace(/sk-or-v1-[A-Za-z0-9_-]{12,}/g, '<redacted>')
    .replace(/github_pat_[A-Za-z0-9_]{12,}/g, '<redacted>')
    .replace(/eyJ[A-Za-z0-9_-]{40,}/g, '<redacted>')
    .replace(/\b\d{6,12}:[A-Za-z0-9_-]{30,}\b/g, '<redacted-token>')
    .replace(/\bndus=[^;\s]{10,}/gi, 'ndus=<redacted>')
    .replace(/\bAQ\.[A-Za-z0-9_-]{20,}/g, '<redacted-key>')
    .replace(/\bAIza[A-Za-z0-9_-]{20,}/g, '<redacted-key>')
}

function signatureOf(entry) {
  const message = redactErrorText(entry.error?.message || entry.error || entry.message || '').slice(0, 160)
  return `${entry.source || '?'}|${entry.plugin || '?'}|${entry.command || '?'}|${entry.error?.name || 'Error'}|${message}`
}

function due(signature) {
  const now = Date.now()
  const entry = seen.get(signature)
  if (!entry) {
    seen.set(signature, { first: now, count: 1, sentAt: 0 })
    return { count: 1, send: true }
  }
  entry.count += 1
  if (now - entry.sentAt >= DEDUPE_WINDOW_MS) return { count: entry.count, send: true }
  return { count: entry.count, send: false }
}

function withinQuota() {
  const cutoff = Date.now() - 60 * 60 * 1000
  while (sentAt.length && sentAt[0] < cutoff) sentAt.shift()
  return sentAt.length < MAX_PER_HOUR
}

function prune() {
  if (seen.size < 500) return
  const cutoff = Date.now() - 6 * 60 * 60 * 1000
  for (const [key, entry] of seen) {
    if (Math.max(entry.sentAt, entry.first) < cutoff) seen.delete(key)
  }
}

/** Apakah error ini layak dikirim sebagai notifikasi (bukan pesan petunjuk). */
export function shouldReport(error, options = {}) {
  if (options.force === true) return true
  if (isUserFacingError(error)) return false
  if (isTransientError(error)) return false
  return true
}

/** Tulis satu baris JSON ke berkas harian (mode 600). */
function appendLog(record, cwd) {
  try {
    const dir = errorLogDir(cwd)
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 })
    const day = new Date().toISOString().slice(0, 10)
    const file = path.join(dir, `${day}.jsonl`)
    fs.appendFileSync(file, `${JSON.stringify(record)}\n`, { mode: 0o600 })
    try { fs.chmodSync(file, 0o600) } catch { }
    pruneOld(cwd)
    return file
  } catch (error) {
    console.warn('[ERROR-HUB] gagal menulis log:', error?.message || error)
    return null
  }
}

function pruneOld(cwd, keepDays = KEEP_DAYS) {
  try {
    const dir = errorLogDir(cwd)
    const cutoff = Date.now() - keepDays * 86400000
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.jsonl')) continue
      const stamp = Date.parse(file.replace('.jsonl', ''))
      if (Number.isFinite(stamp) && stamp < cutoff) fs.rmSync(path.join(dir, file), { force: true })
    }
  } catch { }
}

function apiBase(env = process.env) {
  return String(env.UMI_TELEGRAM_API_BASE || env.TELEGRAM_API_BASE || 'https://api.telegram.org').replace(/\/+$/, '')
}

function telegramTargets(env = process.env) {
  const token = String(env.TELEGRAM_BOT_TOKEN || '').trim()
  // Bentuk token BotFather: <id>:<35 karakter>. Batas bawah dilonggarkan
  // sedikit supaya token uji/mock lokal juga dianggap sah.
  if (!/^\d{6,12}:[A-Za-z0-9_-]{20,}$/.test(token)) return { token: '', chatIds: [] }
  const list = raw => String(raw || '').split(/[,\s]+/).map(item => item.replace(/[^\d-]/g, '')).filter(Boolean)
  const ownerIds = list(env.TELEGRAM_OWNER_IDS)
  const adminIds = list(env.TELEGRAM_ADMIN_IDS)
  const extra = list(env.UMI_ERROR_TELEGRAM_CHAT)
  // DM owner lebih dulu; grup arsip/backup hanya kalau diminta lewat env.
  const chatIds = [...new Set([...ownerIds, ...adminIds, ...extra])]
  return { token, chatIds }
}

function formatTelegramMessage(record, count) {
  const lines = [
    '🚨 <b>Error bot</b>',
    `<b>Sumber:</b> ${escapeHtml(record.source || '-')}`,
  ]
  if (record.plugin) lines.push(`<b>Plugin:</b> ${escapeHtml(record.plugin)}`)
  if (record.command) lines.push(`<b>Perintah:</b> ${escapeHtml(record.command)}`)
  if (record.scope) lines.push(`<b>Bot:</b> ${escapeHtml(record.scope)}`)
  if (record.chat) lines.push(`<b>Chat:</b> ${escapeHtml(record.chat)}`)
  lines.push(`<b>Pesan:</b> ${escapeHtml(record.message || '(kosong)').slice(0, 400)}`)
  if (count > 1) lines.push(`<b>Kejadian:</b> ${count}× sejak ${new Date(record.firstAt || record.at).toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })} WITA`)
  lines.push(`<b>Waktu:</b> ${new Date(record.at).toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })} WITA`)
  lines.push('', `<i>Log lengkap: /errors · berkas ${record.day}.jsonl</i>`)
  return lines.join('\n')
}

function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

async function sendTelegram(record, count, env = process.env) {
  const { token, chatIds } = telegramTargets(env)
  if (!token || !chatIds.length) return { sent: 0, reason: 'tujuan Telegram belum diatur' }
  const text = formatTelegramMessage(record, count)
  let sent = 0
  for (const chatId of chatIds) {
    try {
      const res = await fetch(`${apiBase(env)}/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true }),
        signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      })
      if (res.ok) sent += 1
    } catch { }
  }
  return { sent }
}

/**
 * Catat satu error. Tidak pernah melempar.
 *
 * @param {Error|string|unknown} error
 * @param {object} context  { source, plugin, command, args, chat, scope, isGroup, user, force }
 * @returns {Promise<{logged:boolean, notified:number, count:number, reason?:string}>}
 */
export async function recordError(error, context = {}) {
  const empty = { logged: false, notified: 0, count: 0 }
  try {
    if (!shouldReport(error, context)) return { ...empty, reason: 'bukan error sistem' }

    const signature = signatureOf({ ...context, error })
    const { count, send } = due(signature)
    prune()
    const firstAt = seen.get(signature)?.first || Date.now()

    const record = {
      at: Date.now(),
      day: new Date().toISOString().slice(0, 10),
      firstAt,
      count,
      source: String(context.source || 'unknown'),
      plugin: context.plugin ? String(context.plugin) : null,
      command: context.command ? String(context.command).slice(0, 80) : null,
      args: Array.isArray(context.args) ? context.args.slice(0, 6).map(item => redactErrorText(item).slice(0, 80)) : [],
      chat: context.chat ? String(context.chat).slice(0, 80) : null,
      scope: context.scope ? String(context.scope).slice(0, 60) : null,
      isGroup: Boolean(context.isGroup),
      name: String(error?.name || (typeof error === 'string' ? 'String' : 'Error')),
      message: redactErrorText(error?.message || error || '').slice(0, 500),
      stack: redactErrorText(error?.stack || '').slice(0, 2000),
    }
    const file = appendLog(record, context.cwd)
    const shouldSend = send && (context.telegram === false ? false : withinQuota())
    let notified = 0
    if (shouldSend) {
      const result = await sendTelegram(record, count, context.env || process.env)
      notified = result.sent
      sentAt.push(Date.now())
      const entry = seen.get(signature)
      if (entry) entry.sentAt = Date.now()
      console.warn(`[ERROR-HUB] ${record.source}${record.plugin ? '/' + record.plugin : ''} · ${count}× · Telegram ${notified} chat${file ? ` · ${path.basename(file)}` : ''}`)
    }

    // Perilaku lama tetap: laporan plugin juga masuk halaman Feedback website.
    if (context.website !== false && context.plugin) {
      reportPluginError({
        error,
        plugin: context.plugin,
        command: context.command || '',
        prefix: context.prefix || '/',
        args: Array.isArray(context.args) ? context.args : [],
        sender: context.sender || '',
        chat: context.chat || '',
        scope: context.scope || '',
        isGroup: Boolean(context.isGroup),
      }).catch(() => { })
    }

    return { logged: Boolean(file), notified, count }
  } catch (failure) {
    console.warn('[ERROR-HUB] gagal mencatat:', failure?.message || failure)
    return { ...empty, reason: 'pencatatan gagal' }
  }
}

/** Baca log terbaru (dipakai API owner & perintah /errors). */
export function readRecentErrors({ limit = 20, day = null, cwd = process.cwd() } = {}) {
  const dir = errorLogDir(cwd)
  let files = []
  try { files = fs.readdirSync(dir).filter(file => file.endsWith('.jsonl')).sort().reverse() } catch { }
  if (day) files = files.filter(file => file.startsWith(day))
  const items = []
  for (const file of files) {
    let lines = []
    try { lines = fs.readFileSync(path.join(dir, file), 'utf8').trim().split('\n').filter(Boolean) } catch { }
    for (const line of lines.reverse()) {
      try {
        const row = JSON.parse(line)
        items.push({
          at: new Date(row.at).toISOString(),
          source: row.source, plugin: row.plugin, command: row.command,
          scope: row.scope, chat: row.chat, name: row.name, message: row.message, count: row.count,
        })
      } catch { }
      if (items.length >= limit) break
    }
    if (items.length >= limit) break
  }
  return { dir, files: files.slice(0, 7), items, limit }
}

/** Ringkasan untuk perintah /errors di WhatsApp/Telegram. */
export function errorSummaryText(limit = 8, cwd = process.cwd()) {
  const data = readRecentErrors({ limit, cwd })
  if (!data.items.length) return '✅ Tidak ada error tercatat.'
  const lines = [`🚨 *Error terakhir* (${data.items.length})`, '']
  data.items.forEach((item, index) => {
    const when = new Date(item.at).toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })
    lines.push(`${index + 1}. [${item.source}${item.plugin ? '/' + item.plugin : ''}] ${item.message || item.name}`)
    lines.push(`   ${when} WITA${item.count > 1 ? ` · ${item.count}×` : ''}`)
  })
  lines.push('', `📁 ${data.dir}`)
  return lines.join('\n')
}

/**
 * Pasang hook proses: unhandledRejection & uncaughtException.
 * Dipanggil sekali saat boot. Tidak mematikan proses (perilaku lama dipertahankan).
 */
export function installErrorHooks(options = {}) {
  if (installed) return { installed: true, already: true }
  installed = true
  hooks = {
    onUnhandled: (reason) => recordError(reason, { source: 'process.unhandledRejection', ...options }),
    onUncaught: (error) => recordError(error, { source: 'process.uncaughtException', ...options }),
    onWarning: null,
  }
  process.on('unhandledRejection', hooks.onUnhandled)
  process.on('uncaughtException', hooks.onUncaught)
  return { installed: true, already: false }
}

/** Untuk pengujian: lepas hook & reset status dedupe. */
export function resetErrorHubForTests() {
  if (hooks) {
    process.removeListener('unhandledRejection', hooks.onUnhandled)
    process.removeListener('uncaughtException', hooks.onUncaught)
  }
  hooks = null
  installed = false
  seen.clear()
  sentAt.length = 0
}

export default {
  recordError,
  readRecentErrors,
  errorSummaryText,
  installErrorHooks,
  shouldReport,
  redactErrorText,
  errorLogDir,
}
