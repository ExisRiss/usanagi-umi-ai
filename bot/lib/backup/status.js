/* By AlzRiss - Usanagi Umi AI
 *
 * Status nyata untuk dashboard & bot Telegram.
 * Semua angka diambil dari pemeriksaan langsung (berkas, SQLite, os), bukan
 * nilai statis.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { backupConfig, externalBackendStatus } from './config.js'
import { listBackups, readState, readIndex } from './store.js'
import { schedulerSnapshot } from './scheduler.js'
import { storageUsage } from './retention.js'
import { isBackupRunning } from './pipeline.js'
import { telegramSnapshot } from './telegram.js'
import { getRestore } from './restore.js'

let externalCache = { at: 0, value: null }

export async function databaseStatus(cfg) {
  const result = { sqlite: { path: path.relative(cfg.cwd, cfg.sqlitePath), exists: false }, json: { path: path.relative(cfg.cwd, cfg.databaseJson), exists: false } }
  if (fs.existsSync(cfg.sqlitePath)) {
    result.sqlite.exists = true
    result.sqlite.bytes = fs.statSync(cfg.sqlitePath).size
    try {
      const { default: Database } = await import('better-sqlite3')
      const db = new Database(cfg.sqlitePath, { readonly: true, fileMustExist: true, timeout: 4000 })
      try {
        const row = db.prepare('PRAGMA quick_check').get()
        result.sqlite.check = String(row ? Object.values(row)[0] : 'ok').toLowerCase()
        const tables = db.prepare("SELECT count(*) AS n FROM sqlite_master WHERE type='table'").get()
        result.sqlite.tables = tables ? tables.n : 0
      } finally {
        db.close()
      }
    } catch (error) {
      result.sqlite.check = `error: ${error.message}`
    }
  }
  if (fs.existsSync(cfg.databaseJson)) {
    result.json.exists = true
    result.json.bytes = fs.statSync(cfg.databaseJson).size
    result.json.valid = Boolean(readSafeJson(cfg.databaseJson))
  }
  result.ok = result.sqlite.exists && result.sqlite.check === 'ok'
  return result
}

function readSafeJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return null }
}

function sessionsInfo(cfg) {
  try {
    if (!fs.existsSync(cfg.sessionsDir)) return { sessions: 0, withConfig: 0 }
    const dirs = fs.readdirSync(cfg.sessionsDir, { withFileTypes: true }).filter(entry => entry.isDirectory())
    const withConfig = dirs.filter(dir => fs.existsSync(path.join(cfg.sessionsDir, dir.name, 'bot-config.json'))).length
    return { sessions: dirs.length, withConfig }
  } catch {
    return { sessions: 0, withConfig: 0 }
  }
}

export async function externalStatus(cfg, { force = false } = {}) {
  const configured = externalBackendStatus(cfg)
  if (!configured.ready) return { ...configured, checkedAt: new Date().toISOString() }
  if (!force && externalCache.value && Date.now() - externalCache.at < 60_000) return externalCache.value
  const { checkExternal } = await import('./external.js')
  const probe = await checkExternal(cfg)
  const value = { ...configured, ...probe, checkedAt: new Date().toISOString() }
  externalCache = { at: Date.now(), value }
  return value
}

export function backupSummary(cfg) {
  const index = readIndex(cfg)
  const completed = index.backups.filter(row => row.status === 'completed')
  const failed = index.backups.filter(row => row.status === 'failed')
  const sorted = index.backups.slice().sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)))
  const last = sorted[0] || null
  const lastSuccess = completed.slice().sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt))).pop() || null
  const lastFailure = failed.slice().sort((a, b) => String(a.startedAt).localeCompare(String(b.startedAt))).pop() || null
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000
  const last24h = index.backups.filter(row => new Date(row.startedAt).getTime() >= dayAgo)
  return {
    total: index.backups.length,
    completed: completed.length,
    failed: failed.length,
    running: index.backups.filter(row => row.status === 'running').length,
    last24h: {
      total: last24h.length,
      success: last24h.filter(row => row.status === 'completed').length,
      failed: last24h.filter(row => row.status === 'failed').length,
      bytes: last24h.reduce((sum, row) => sum + Number(row.sizeBytes || 0), 0),
    },
    last,
    lastSuccess,
    lastFailure,
    averageDurationMs: completed.length
      ? Math.round(completed.reduce((sum, row) => sum + Number(row.durationMs || 0), 0) / completed.length)
      : null,
  }
}

/** Status ringkas untuk dashboard. */
export async function collectStatus(cfg = backupConfig()) {
  const started = Date.now()
  const scheduler = schedulerSnapshot(cfg)
  const lock = isBackupRunning(cfg)
  const usage = storageUsage(cfg)
  const [database, external] = await Promise.all([databaseStatus(cfg), externalStatus(cfg)])
  const summary = backupSummary(cfg)
  const state = readState(cfg)
  const telegram = telegramSnapshot()
  const memory = process.memoryUsage()
  const staleMs = scheduler.nextRunAt ? Date.now() - new Date(scheduler.nextRunAt).getTime() : 0
  const intervalMs = scheduler.intervalMinutes * 60 * 1000

  const checks = [
    { id: 'worker', ok: true, detail: `PID ${process.pid}, uptime ${Math.round(process.uptime())}s` },
    { id: 'scheduler', ok: scheduler.enabled ? Boolean(scheduler.nextRunAt) : true, detail: scheduler.enabled ? `berikutnya ${scheduler.nextRunAt}` : 'dinonaktifkan' },
    { id: 'database', ok: database.ok, detail: database.ok ? `SQLite ${database.sqlite.tables} tabel, quick_check ${database.sqlite.check}` : 'database bermasalah' },
    {
      id: 'backup-freshness',
      ok: !scheduler.enabled || Boolean(scheduler.lastSuccessAt && Date.now() - new Date(scheduler.lastSuccessAt).getTime() < intervalMs * 3),
      detail: scheduler.lastSuccessAt ? `sukses terakhir ${scheduler.lastSuccessAt}` : 'belum ada backup sukses',
    },
    { id: 'storage', ok: usage.diskFreeBytes === null || usage.diskFreeBytes > cfg.minFreeBytes, detail: usage.diskFreeBytes === null ? 'tidak diketahui' : `${Math.round(usage.diskFreeBytes / 1048576)} MB sisa` },
    { id: 'external', ok: external.ready ? Boolean(external.ok) : false, detail: external.ready ? (external.detail || '') : (external.reason || 'belum aktif') },
    { id: 'telegram', ok: Boolean(cfg.telegram.token) && telegram.polling, detail: cfg.telegram.token ? telegram.lastError || 'terhubung' : 'token belum diisi' },
  ]

  return {
    ok: checks.filter(check => ['worker', 'scheduler', 'database'].includes(check.id)).every(check => check.ok),
    generatedAt: new Date().toISOString(),
    tookMs: Date.now() - started,
    service: {
      name: 'usanagi-backup',
      version: '1.0.0',
      pid: process.pid,
      node: process.version,
      uptimeSeconds: Math.round(process.uptime()),
      startedAt: new Date(Date.now() - process.uptime() * 1000).toISOString(),
      memoryMb: Math.round((memory.rss / 1048576) * 10) / 10,
      heapUsedMb: Math.round((memory.heapUsed / 1048576) * 10) / 10,
    },
    scheduler: { ...scheduler, lateByMs: staleMs > 0 ? staleMs : 0, running: lock.running },
    database,
    storage: { ...usage, external },
    backups: summary,
    counters: state.counters,
    restores: state.restores.slice(0, 5).map(row => ({
      id: row.id, backupId: row.backupId, status: row.status, createdAt: row.createdAt, completedAt: row.completedAt,
    })),
    telegram,
    sessions: sessionsInfo(cfg),
    checks,
  }
}

/** Info server fisik (CPU/RAM/disk) — read-only. */
export function collectServer(cfg = backupConfig()) {
  const cpus = os.cpus()
  const memory = { total: os.totalmem(), free: os.freemem(), usedPercent: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 1000) / 10 }
  const usage = storageUsage(cfg)
  return {
    hostname: os.hostname(),
    platform: `${os.platform()} ${os.release()}`,
    arch: os.arch(),
    cpu: {
      model: cpus[0] ? cpus[0].model : 'unknown',
      cores: cpus.length,
      loadAverage: os.loadavg().map(value => Math.round(value * 100) / 100),
      loadPercent: cpus.length ? Math.round((os.loadavg()[0] / cpus.length) * 1000) / 10 : null,
    },
    memory,
    disk: {
      freeBytes: usage.diskFreeBytes,
      totalBytes: usage.diskTotalBytes,
      usedPercent: usage.percentOfDisk,
      backupUsedBytes: usage.usedBytes,
      backupLimitBytes: usage.limitBytes,
    },
    uptimeSeconds: Math.round(os.uptime()),
    node: process.version,
    time: new Date().toISOString(),
  }
}

/** Data Telegram yang benar-benar ada (chat yang pernah mengirim update). */
export function telegramChats(cfg = backupConfig()) {
  const file = path.join(cfg.root, 'telegram-chats.json')
  const data = readSafeJson(file)
  return Array.isArray(data) ? data : []
}

export function recordTelegramChat(cfg, chat) {
  const file = path.join(cfg.root, 'telegram-chats.json')
  const rows = telegramChats(cfg)
  const id = String(chat.id)
  const existing = rows.find(row => row.id === id)
  const now = new Date().toISOString()
  if (existing) {
    existing.title = chat.title || existing.title
    existing.type = chat.type || existing.type
    existing.lastActivityAt = now
  } else {
    rows.push({ id, title: chat.title || '', type: chat.type || 'private', firstSeenAt: now, lastActivityAt: now })
  }
  if (rows.length > 200) rows.splice(0, rows.length - 200)
  fs.writeFileSync(file, `${JSON.stringify(rows, null, 2)}\n`, { mode: 0o600 })
  return rows
}

export function lastBackupDetail(cfg, id) {
  const rows = listBackups(cfg, { q: id, limit: 200 }).items
  return rows.find(row => row.id === id) || null
}

export function restoreDetail(cfg, id) {
  return getRestore(cfg, id)
}
