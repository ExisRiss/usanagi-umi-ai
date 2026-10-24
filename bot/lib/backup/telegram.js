/*
 *
 * Bot Telegram administrasi backup.
 *
 * Memakai long polling (bukan webhook) supaya tidak perlu port publik atau
 * URL HTTPS khusus; cukup token bot dari @BotFather dan daftar ID admin.
 *
 * Otorisasi HANYA dari TELEGRAM_ADMIN_IDS (angka), bukan username.
 * Semua aksi tercatat di audit log. Tidak ada secret yang dikirim ke chat.
 */
import fs from 'node:fs'
import path from 'node:path'
import { backupConfig } from './config.js'
import { logEvent, readLogs, sanitize } from './log.js'
import { listBackups, readState, updateState } from './store.js'
import { collectServer, collectStatus } from './status.js'
import { runBackup, verifyBackup } from './pipeline.js'
import { createRestore, confirmRestore, cancelRestore, listRestores } from './restore.js'
import { configureScheduler, schedulerSnapshot } from './scheduler.js'
import { appendAudit } from './store.js'
import { sendDocument as uploadDocument } from './telegram-send.js'

const API = 'https://api.telegram.org'
const runtime = {
  polling: false,
  startedAt: null,
  username: null,
  lastError: null,
  lastUpdateAt: null,
  lastCommandAt: null,
  offset: 0,
  busy: false,
  loop: null,
  abort: null,
  commandsHandled: 0,
}

export function telegramSnapshot() {
  return {
    configured: Boolean(runtime.username) || runtime.polling,
    polling: runtime.polling,
    username: runtime.username,
    startedAt: runtime.startedAt,
    lastError: runtime.lastError,
    lastUpdateAt: runtime.lastUpdateAt,
    lastCommandAt: runtime.lastCommandAt,
    commandsHandled: runtime.commandsHandled,
  }
}

function stateFile(cfg) {
  return path.join(cfg.root, 'telegram-state.json')
}

function loadOffset(cfg) {
  try {
    const data = JSON.parse(fs.readFileSync(stateFile(cfg), 'utf8'))
    return Number(data.offset) || 0
  } catch {
    return 0
  }
}

function saveOffset(cfg, offset) {
  try {
    fs.writeFileSync(stateFile(cfg), JSON.stringify({ offset, updatedAt: new Date().toISOString() }), { mode: 0o600 })
  } catch {}
}

async function call(cfg, method, payload) {
  const response = await fetch(`${API}/bot${cfg.telegram.token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(45_000),
  })
  const data = await response.json().catch(() => ({}))
  if (!data.ok) throw new Error(`${method}: ${data.description || response.status}`)
  return data.result
}

export async function sendMessage(cfg, chatId, text, { keyboard, parseMode = 'HTML' } = {}) {
  if (!cfg.telegram.token) return null
  return call(cfg, 'sendMessage', {
    chat_id: chatId,
    text: String(text).slice(0, 4000),
    parse_mode: parseMode,
    disable_web_page_preview: true,
    ...(keyboard ? { reply_markup: keyboard } : {}),
  })
}

/**
 * Kirim dokumen ke chat/group memakai token bot administrasi backup.
 * Dipakai dashboard/console bila perlu mengirim arsip manual (Task83).
 */
export async function sendDocument(cfg, chatId, filePath, options = {}) {
  if (!cfg.telegram.token) return null
  return uploadDocument(cfg.telegram.token, chatId || cfg.telegram.chatId, filePath, options)
}

async function broadcast(cfg, text, keyboard) {
  const ids = cfg.telegram.adminIds
  for (const id of ids) {
    try {
      await sendMessage(cfg, id, text, { keyboard })
    } catch (error) {
      runtime.lastError = error.message
    }
  }
}

/** Notifikasi kejadian backup. Kegagalan selalu dikirim; sukses mengikuti setting. */
export async function notifyBackupEvent(cfg, event) {
  if (!cfg.telegram.token || !cfg.telegram.adminIds.length) return
  if (event.kind === 'backup-success') {
    if (!cfg.telegram.notifyOnSuccess) return
    const backup = event.backup || {}
    await broadcast(
      cfg,
      `✅ <b>Backup selesai</b>\n${backup.name || '-'}\n${formatBytes(backup.sizeBytes)} · ${Math.round((backup.durationMs || 0) / 1000)}s\nID: <code>${backup.id || '-'}</code>`
    )
    return
  }
  if (event.kind === 'backup-failed') {
    await broadcast(
      cfg,
      `❌ <b>Backup gagal</b>\n${sanitize(event.error && event.error.message)}\nWaktu: ${new Date().toISOString()}`
    )
  }
}

export function formatBytes(bytes) {
  const value = Number(bytes || 0)
  if (value < 1024) return `${value} B`
  if (value < 1048576) return `${(value / 1024).toFixed(1)} KB`
  if (value < 1073741824) return `${(value / 1048576).toFixed(2)} MB`
  return `${(value / 1073741824).toFixed(2)} GB`
}

function timeAgo(iso) {
  if (!iso) return '-'
  const diff = Date.now() - new Date(iso).getTime()
  if (!Number.isFinite(diff)) return '-'
  if (diff < 60_000) return `${Math.round(diff / 1000)}s lalu`
  if (diff < 3600_000) return `${Math.round(diff / 60_000)}m lalu`
  if (diff < 86400_000) return `${Math.round(diff / 3600_000)}j lalu`
  return `${Math.round(diff / 86400_000)}h lalu`
}

const HELP = [
  '<b>Perintah backup</b>',
  '/status — kesehatan sistem & jadwal',
  '/backup [database|config|files|full] — backup manual',
  '/backups [n] — daftar backup terakhir',
  '/verify &lt;id&gt; — verifikasi ulang arsip',
  '/restore &lt;id&gt; — rencana restore (butuh konfirmasi)',
  '/restores — riwayat restore',
  '/logs [n] — log terakhir (tanpa secret)',
  '/export — unduh index backup (JSON)',
  '/settings — lihat / ubah pengaturan',
  '/help — bantuan ini',
].join('\n')

async function statusText(cfg) {
  const status = await collectStatus(cfg)
  const scheduler = status.scheduler
  const backup = status.backups
  return [
    '<b>🛡 Status Backup</b>',
    `Worker: ${status.service.uptimeSeconds}s · RAM ${status.service.memoryMb} MB`,
    `Database: ${status.database.ok ? 'OK' : 'BERMASALAH'} (${status.database.sqlite.tables || 0} tabel)`,
    `Scheduler: ${scheduler.enabled ? 'AKTIF' : 'NONAKTIF'} · ${scheduler.intervalMinutes} menit`,
    `Berikutnya: ${scheduler.nextRunAt ? `${scheduler.nextRunAt} (${timeAgo(new Date(Date.now() + (new Date(scheduler.nextRunAt) - Date.now())).toISOString()).replace('lalu', 'lagi')})` : '-'}`,
    `Terakhir sukses: ${scheduler.lastSuccessAt || '-'} (${timeAgo(scheduler.lastSuccessAt)})`,
    `24 jam: ${backup.last24h.success} sukses, ${backup.last24h.failed} gagal, ${formatBytes(backup.last24h.bytes)}`,
    `Arsip: ${backup.total} · ${formatBytes(status.storage.usedBytes)} / ${formatBytes(status.storage.limitBytes)}`,
    `Disk sisa: ${status.storage.diskFreeBytes === null ? '-' : formatBytes(status.storage.diskFreeBytes)}`,
    `Eksternal: ${status.storage.external.ready ? (status.storage.external.ok ? `OK (${status.storage.external.backend})` : `GAGAL (${status.storage.external.detail})`) : 'belum aktif'}`,
    `Telegram: ${status.telegram.polling ? 'terhubung' : 'tidak aktif'}`,
  ].join('\n')
}

async function settingsText(cfg) {
  const state = readState(cfg)
  const scheduler = schedulerSnapshot(cfg)
  return [
    '<b>⚙️ Pengaturan backup</b>',
    `interval: ${scheduler.intervalMinutes} menit`,
    `scheduler: ${scheduler.enabled ? 'on' : 'off'}`,
    `retensi: ${cfg.retention.recent} terbaru · ${cfg.retention.daily} harian · ${cfg.retention.weekly} mingguan · ${cfg.retention.monthly} bulanan`,
    `batas penyimpanan: ${formatBytes(cfg.storageLimitBytes)}`,
    `storage eksternal: ${cfg.external.backend} (mode ${cfg.external.mode})`,
    `enkripsi: ${cfg.encryption.enabled ? 'aktif' : 'nonaktif'}`,
    `notifikasi sukses: ${cfg.telegram.notifyOnSuccess ? 'on' : 'off'}`,
    '',
    'Ubah:',
    '<code>/settings interval 10</code>',
    '<code>/settings enable|disable</code>',
    '<code>/settings notify on|off</code>',
    '<code>/settings external all|hourly|promoted</code>',
  ].join('\n')
}

function isAdmin(cfg, id) {
  return cfg.telegram.adminIds.includes(String(id))
}

async function handleCommand(cfg, message) {
  const chatId = message.chat.id
  const fromId = String(message.from && message.from.id ? message.from.id : '')
  const text = String(message.text || '').trim()
  if (!text.startsWith('/')) return
  const [rawCommand, ...args] = text.split(/\s+/)
  const command = rawCommand.replace(/@.*$/, '').toLowerCase()
  runtime.lastCommandAt = new Date().toISOString()
  runtime.commandsHandled += 1

  if (!isAdmin(cfg, fromId)) {
    logEvent(cfg, { level: 'warn', type: 'telegram', message: `Perintah dari ID tidak diizinkan: ${fromId}`, actor: fromId })
    await sendMessage(cfg, chatId, '⛔ ID Telegram kamu tidak terdaftar sebagai administrator backup.')
    return
  }

  switch (command) {
    case '/start':
      await sendMessage(cfg, chatId, `<b>Usanagi Backup Bot</b>\nBot ini mengelola backup server bot WhatsApp.\n\n${HELP}`)
      return
    case '/help':
      await sendMessage(cfg, chatId, HELP)
      return
    case '/status':
      await sendMessage(cfg, chatId, await statusText(cfg))
      return
    case '/backup': {
      const type = ['database', 'config', 'files', 'full'].includes(args[0]) ? args[0] : 'full'
      await sendMessage(cfg, chatId, `⏳ Backup <b>${type}</b> dimulai...`)
      try {
        const record = await runBackup(cfg, { type, reason: 'telegram', actor: `telegram:${fromId}` })
        await sendMessage(cfg, chatId, `✅ Selesai: <code>${record.id}</code>\n${formatBytes(record.sizeBytes)} · ${Math.round((record.durationMs || 0) / 1000)}s · verifikasi ${record.verifyStatus}`)
      } catch (error) {
        await sendMessage(cfg, chatId, `❌ ${sanitize(error.message)}`)
      }
      return
    }
    case '/backups': {
      const limit = Math.min(Math.max(Number(args[0]) || 8, 1), 20)
      const rows = listBackups(cfg, { limit }).items
      if (!rows.length) {
        await sendMessage(cfg, chatId, 'Belum ada backup.')
        return
      }
      const lines = rows.map(row => {
        const icon = row.status === 'completed' ? '✅' : row.status === 'failed' ? '❌' : '⏳'
        return `${icon} <code>${row.id}</code>\n   ${row.type} · ${formatBytes(row.sizeBytes)} · ${row.startedAt.slice(0, 16).replace('T', ' ')}Z`
      })
      await sendMessage(cfg, chatId, `<b>Backup terakhir</b>\n\n${lines.join('\n')}`)
      return
    }
    case '/verify': {
      if (!args[0]) return sendMessage(cfg, chatId, 'Format: /verify &lt;id&gt;')
      try {
        const result = await verifyBackup(cfg, args[0])
        await sendMessage(cfg, chatId, result.ok ? `✅ Verifikasi OK · ${result.entries} entri` : `❌ Verifikasi gagal: ${sanitize(result.error || 'checksum tidak cocok')}`)
      } catch (error) {
        await sendMessage(cfg, chatId, `❌ ${sanitize(error.message)}`)
      }
      return
    }
    case '/restore': {
      if (!args[0]) return sendMessage(cfg, chatId, 'Format: /restore &lt;id&gt;\nLihat /backups untuk daftar ID.')
      try {
        const plan = await createRestore(cfg, { backupId: args[0], actor: `telegram:${fromId}` })
        await sendMessage(
          cfg,
          chatId,
          [
            '<b>⚠️ Rencana restore</b>',
            `Backup: <code>${plan.backupId}</code>`,
            `Dibuat: ${plan.summary.backupCreatedAt}`,
            `Cakupan: ${plan.components.join(', ')}`,
            `Berkas: ${plan.summary.files} (${formatBytes(plan.summary.bytes)})`,
            `Akan menimpa: ${plan.summary.overwrites} berkas`,
            plan.summary.requiresRestart ? 'Database aktif setelah bot restart.' : 'Tanpa restart.',
            '',
            `Konfirmasi dalam 15 menit:`,
            `<code>/confirm ${plan.id} ${plan.token}</code>`,
            `Batal: <code>/cancel ${plan.id}</code>`,
          ].join('\n'),
          {
            keyboard: {
              inline_keyboard: [[
                { text: '✅ Restore sekarang', callback_data: `rs:confirm:${plan.id}:${plan.token}` },
                { text: '✖️ Batal', callback_data: `rs:cancel:${plan.id}` },
              ]],
            },
          }
        )
      } catch (error) {
        await sendMessage(cfg, chatId, `❌ ${sanitize(error.message)}`)
      }
      return
    }
    case '/confirm': {
      const [restoreId, token] = args
      if (!restoreId || !token) return sendMessage(cfg, chatId, 'Format: /confirm &lt;restoreId&gt; &lt;kode&gt;')
      try {
        await sendMessage(cfg, chatId, '⏳ Restore dijalankan...')
        const result = await confirmRestore(cfg, restoreId, { token, actor: `telegram:${fromId}` })
        await sendMessage(cfg, chatId, `✅ Restore ${result.status}: ${result.result ? result.result.applied.length : 0} berkas dipulihkan.`)
      } catch (error) {
        await sendMessage(cfg, chatId, `❌ ${sanitize(error.message)}`)
      }
      return
    }
    case '/cancel': {
      try {
        await cancelRestore(cfg, args[0], `telegram:${fromId}`)
        await sendMessage(cfg, chatId, '✅ Restore dibatalkan.')
      } catch (error) {
        await sendMessage(cfg, chatId, `❌ ${sanitize(error.message)}`)
      }
      return
    }
    case '/restores': {
      const rows = listRestores(cfg, { limit: 10 })
      if (!rows.length) return sendMessage(cfg, chatId, 'Belum ada restore.')
      await sendMessage(cfg, chatId, rows.map(row => `${row.status === 'completed' ? '✅' : row.status === 'failed' ? '❌' : '⏳'} <code>${row.id}</code> · ${row.backupId} · ${row.status}`).join('\n'))
      return
    }
    case '/logs': {
      const limit = Math.min(Math.max(Number(args[0]) || 10, 1), 25)
      const rows = readLogs(cfg, { limit })
      await sendMessage(cfg, chatId, rows.length
        ? rows.map(row => `${row.level === 'error' ? '❌' : row.level === 'warn' ? '⚠️' : '•'} ${row.at.slice(11, 19)} ${sanitize(row.message)}`).join('\n')
        : 'Belum ada log.')
      return
    }
    case '/export': {
      const index = listBackups(cfg, { limit: 200, sort: 'desc' })
      const payload = JSON.stringify({ exportedAt: new Date().toISOString(), total: index.total, items: index.items.map(row => ({ ...row, actor: undefined })) }, null, 2)
      const form = new FormData()
      form.append('chat_id', String(chatId))
      form.append('caption', `Export index backup (${index.total} arsip)`)
      form.append('document', new Blob([payload], { type: 'application/json' }), `backups-${new Date().toISOString().slice(0, 10)}.json`)
      const response = await fetch(`${API}/bot${cfg.telegram.token}/sendDocument`, { method: 'POST', body: form, signal: AbortSignal.timeout(60_000) })
      if (!response.ok) await sendMessage(cfg, chatId, `❌ Export gagal (HTTP ${response.status}).`)
      return
    }
    case '/settings': {
      const [key, value] = args
      if (!key) {
        await sendMessage(cfg, chatId, await settingsText(cfg))
        return
      }
      try {
        if (key === 'interval') {
          const result = await configureScheduler(cfg, { intervalMinutes: value })
          appendAudit(cfg, { actor: `telegram:${fromId}`, action: 'scheduler.interval', resource: String(value), meta: { intervalMinutes: result.intervalMinutes } })
          await sendMessage(cfg, chatId, `✅ Interval ${result.intervalMinutes} menit. Slot berikutnya ${result.nextRunAt}.`)
          return
        }
        if (key === 'enable' || key === 'disable') {
          const result = await configureScheduler(cfg, { enabled: key === 'enable' })
          appendAudit(cfg, { actor: `telegram:${fromId}`, action: `scheduler.${key}`, resource: 'scheduler' })
          await sendMessage(cfg, chatId, `✅ Scheduler ${result.enabled ? 'diaktifkan' : 'dinonaktifkan'}.`)
          return
        }
        if (key === 'notify') {
          const on = ['on', '1', 'true'].includes(String(value).toLowerCase())
          updateState(cfg, state => {
            state.settings.notifySuccess = on
            return state
          })
          process.env.TELEGRAM_NOTIFY_SUCCESS = on ? '1' : '0'
          cfg.telegram.notifyOnSuccess = on
          appendAudit(cfg, { actor: `telegram:${fromId}`, action: 'notify.success', resource: on ? 'on' : 'off' })
          await sendMessage(cfg, chatId, `✅ Notifikasi sukses ${on ? 'aktif' : 'nonaktif'}.`)
          return
        }
        if (key === 'external') {
          if (!['all', 'hourly', 'promoted'].includes(String(value))) throw new Error('Nilai harus all, hourly, atau promoted.')
          updateState(cfg, state => {
            state.settings.externalMode = value
            return state
          })
          cfg.external.mode = value
          appendAudit(cfg, { actor: `telegram:${fromId}`, action: 'external.mode', resource: value })
          await sendMessage(cfg, chatId, `✅ Mode eksternal: ${value}.`)
          return
        }
        await sendMessage(cfg, chatId, 'Kunci tidak dikenal. Lihat /settings.')
      } catch (error) {
        await sendMessage(cfg, chatId, `❌ ${sanitize(error.message)}`)
      }
      return
    }
    default:
      await sendMessage(cfg, chatId, 'Perintah tidak dikenal. Lihat /help.')
  }
}

async function handleCallback(cfg, query) {
  const fromId = String(query.from && query.from.id ? query.from.id : '')
  const chatId = query.message ? query.message.chat.id : null
  const data = String(query.data || '')
  await fetch(`${API}/bot${cfg.telegram.token}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: query.id, text: isAdmin(cfg, fromId) ? 'Diproses' : 'Tidak diizinkan' }),
    signal: AbortSignal.timeout(15_000),
  }).catch(() => {})
  if (!chatId) return
  if (!isAdmin(cfg, fromId)) {
    await sendMessage(cfg, chatId, '⛔ Bukan administrator.')
    return
  }
  const parts = data.split(':')
  try {
    if (parts[0] === 'rs' && parts[1] === 'confirm') {
      await sendMessage(cfg, chatId, '⏳ Restore dijalankan...')
      const result = await confirmRestore(cfg, parts[2], { token: parts[3], actor: `telegram:${fromId}` })
      await sendMessage(cfg, chatId, `✅ Restore ${result.status}.`)
    } else if (parts[0] === 'rs' && parts[1] === 'cancel') {
      await cancelRestore(cfg, parts[2], `telegram:${fromId}`)
      await sendMessage(cfg, chatId, '✅ Restore dibatalkan.')
    }
  } catch (error) {
    await sendMessage(cfg, chatId, `❌ ${sanitize(error.message)}`)
  }
}

async function poll(cfg) {
  const updates = await call(cfg, 'getUpdates', {
    offset: runtime.offset || undefined,
    timeout: cfg.telegram.pollTimeoutSeconds,
    allowed_updates: ['message', 'callback_query'],
  })
  for (const update of updates || []) {
    runtime.offset = update.update_id + 1
    saveOffset(cfg, runtime.offset)
    runtime.lastUpdateAt = new Date().toISOString()
    try {
      if (update.message) await handleCommand(cfg, update.message)
      else if (update.callback_query) await handleCallback(cfg, update.callback_query)
    } catch (error) {
      runtime.lastError = error.message
      logEvent(cfg, { level: 'error', type: 'telegram', message: `Gagal memproses update: ${error.message}` })
    }
  }
}

/** Mulai long polling. Aman dipanggil berkali-kali. */
export async function startTelegramBot(cfg = backupConfig()) {
  if (runtime.polling) return telegramSnapshot()
  if (!cfg.telegram.token) {
    logEvent(cfg, { level: 'info', type: 'telegram', message: 'TELEGRAM_BOT_TOKEN belum diisi — bot Telegram tidak dijalankan.' })
    return telegramSnapshot()
  }
  if (!cfg.telegram.adminIds.length) {
    logEvent(cfg, { level: 'warn', type: 'telegram', message: 'TELEGRAM_ADMIN_IDS kosong — bot Telegram tidak dijalankan (tidak ada admin yang sah).' })
    return telegramSnapshot()
  }
  try {
    const me = await call(cfg, 'getMe', {})
    runtime.username = me.username || String(me.id)
    runtime.offset = loadOffset(cfg)
    runtime.polling = true
    runtime.startedAt = new Date().toISOString()
    logEvent(cfg, { level: 'success', type: 'telegram', message: `Bot Telegram @${runtime.username} aktif (${cfg.telegram.adminIds.length} admin).` })
    if (runtime.offset === 0) {
      // Buang tumpukan update lama supaya tidak menjalankan perintah usang.
      try {
        const pending = await call(cfg, 'getUpdates', { offset: -1, timeout: 0 })
        if (pending.length) {
          runtime.offset = pending[pending.length - 1].update_id + 1
          saveOffset(cfg, runtime.offset)
        }
      } catch {}
    }
    const loop = async () => {
      while (runtime.polling) {
        try {
          await poll(cfg)
          runtime.lastError = null
        } catch (error) {
          if (!runtime.polling) break
          runtime.lastError = error.message
          logEvent(cfg, { level: 'warn', type: 'telegram', message: `Polling error: ${error.message}` })
          await new Promise(resolve => setTimeout(resolve, 5000))
        }
      }
    }
    runtime.loop = loop().catch(() => {})
  } catch (error) {
    runtime.polling = false
    runtime.lastError = error.message
    logEvent(cfg, { level: 'error', type: 'telegram', message: `Bot Telegram gagal start: ${error.message}` })
  }
  return telegramSnapshot()
}

export async function stopTelegramBot() {
  runtime.polling = false
  if (runtime.loop) {
    try { await runtime.loop } catch {}
  }
  runtime.loop = null
  return telegramSnapshot()
}

/** Kirim ringkasan server (dipakai /status lanjutan atau dashboard). */
export async function serverSummaryText(cfg = backupConfig()) {
  const server = collectServer(cfg)
  return [
    `<b>${server.hostname}</b> · ${server.platform}`,
    `CPU: ${server.cpu.cores} core, load ${server.cpu.loadAverage[0]} (${server.cpu.loadPercent}%)`,
    `RAM: ${formatBytes(server.memory.total - server.memory.free)} / ${formatBytes(server.memory.total)} (${server.memory.usedPercent}%)`,
    `Disk: ${server.disk.freeBytes === null ? '-' : formatBytes(server.disk.freeBytes)} sisa`,
  ].join('\n')
}
