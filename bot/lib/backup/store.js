/*
 *
 * Penyimpanan status sistem backup:
 *   index.json   daftar backup (sumber kebenaran metadata arsip)
 *   state.json   pengaturan, status scheduler, antrean restore, audit
 *
 * Semua penulisan memakai pola tmp + rename supaya tidak pernah ada JSON
 * setengah jadi walau proses mati di tengah penulisan.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const INDEX_VERSION = 1
let chain = Promise.resolve()

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 })
}

export function paths(cfg) {
  const root = cfg.root
  return {
    root,
    archives: path.join(root, 'archives'),
    staging: path.join(root, 'staging'),
    tmp: path.join(root, 'tmp'),
    locks: path.join(root, 'locks'),
    logs: path.join(root, 'logs'),
    restores: path.join(root, 'restores'),
    index: path.join(root, 'index.json'),
    state: path.join(root, 'state.json'),
    lock: path.join(root, 'locks', 'backup.lock'),
  }
}

export function ensureLayout(cfg) {
  const p = paths(cfg)
  for (const dir of [p.root, p.archives, p.staging, p.tmp, p.locks, p.logs, p.restores]) {
    ensureDir(dir)
  }
  return p
}

/** Serialisasi semua operasi baca-ubah-tulis. */
export function withStoreLock(fn) {
  const run = chain.then(fn, fn)
  chain = run.catch(() => {})
  return run
}

export function readJson(file, fallback) {
  try {
    const text = fs.readFileSync(file, 'utf8')
    if (!text.trim()) return fallback
    return JSON.parse(text)
  } catch {
    return fallback
  }
}

export function writeJsonAtomic(file, value) {
  const dir = path.dirname(file)
  ensureDir(dir)
  const tmp = path.join(dir, `.${path.basename(file)}.${process.pid}.${crypto.randomBytes(4).toString('hex')}.tmp`)
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 })
  fs.renameSync(tmp, file)
}

export function readIndex(cfg) {
  const data = readJson(paths(cfg).index, null)
  if (!data || !Array.isArray(data.backups)) return { version: INDEX_VERSION, updatedAt: new Date().toISOString(), backups: [] }
  return data
}

export function writeIndex(cfg, index) {
  const next = { version: INDEX_VERSION, updatedAt: new Date().toISOString(), backups: index.backups || [] }
  writeJsonAtomic(paths(cfg).index, next)
  return next
}

export function listBackups(cfg, { status, type, q, from, to, limit = 50, offset = 0, sort = 'desc' } = {}) {
  let rows = readIndex(cfg).backups.slice()
  if (status) rows = rows.filter(row => row.status === status)
  if (type) rows = rows.filter(row => row.type === type)
  if (from) {
    const threshold = new Date(from).getTime()
    if (Number.isFinite(threshold)) rows = rows.filter(row => new Date(row.startedAt).getTime() >= threshold)
  }
  if (to) {
    const threshold = new Date(to).getTime()
    if (Number.isFinite(threshold)) rows = rows.filter(row => new Date(row.startedAt).getTime() <= threshold)
  }
  if (q) {
    const needle = String(q).toLowerCase()
    rows = rows.filter(row => `${row.name} ${row.id} ${row.type} ${row.status}`.toLowerCase().includes(needle))
  }
  rows.sort((a, b) => String(a.startedAt).localeCompare(String(b.startedAt)))
  if (sort !== 'asc') rows.reverse()
  const total = rows.length
  const page = rows.slice(Math.max(0, Number(offset) || 0), Math.max(0, Number(offset) || 0) + Math.min(Math.max(Number(limit) || 50, 1), 200))
  return { total, limit, offset: Number(offset) || 0, items: page }
}

export function getBackup(cfg, id) {
  return readIndex(cfg).backups.find(row => row.id === id) || null
}

export function upsertBackup(cfg, record) {
  return withStoreLock(() => {
    const index = readIndex(cfg)
    const at = index.backups.findIndex(row => row.id === record.id)
    if (at >= 0) index.backups[at] = { ...index.backups[at], ...record }
    else index.backups.push(record)
    writeIndex(cfg, index)
    return at >= 0 ? index.backups[at] : record
  })
}

export function patchBackup(cfg, id, patch) {
  return withStoreLock(() => {
    const index = readIndex(cfg)
    const row = index.backups.find(item => item.id === id)
    if (!row) return null
    Object.assign(row, patch, { updatedAt: new Date().toISOString() })
    writeIndex(cfg, index)
    return row
  })
}

export function removeBackupRecord(cfg, id) {
  return withStoreLock(() => {
    const index = readIndex(cfg)
    const next = index.backups.filter(row => row.id !== id)
    const removed = next.length !== index.backups.length
    if (removed) writeIndex(cfg, { ...index, backups: next })
    return removed
  })
}

/* -------------------------------------------------------------- state */

const DEFAULT_STATE = () => ({
  version: 1,
  updatedAt: new Date().toISOString(),
  scheduler: {
    enabled: true,
    intervalMinutes: null,
    lastRunAt: null,
    lastSuccessAt: null,
    lastFailureAt: null,
    lastSlot: null,
    nextRunAt: null,
    missedSlots: 0,
    skippedBusy: 0,
    lastError: null,
  },
  settings: {
    retention: null,
    storageLimitBytes: null,
    minFreeBytes: null,
    externalMode: null,
    captureTelegram: true,
  },
  restores: [],
  audit: [],
  counters: { success: 0, failed: 0, partial: 0, last24hSuccess: 0 },
})

export function readState(cfg) {
  const data = readJson(paths(cfg).state, null)
  if (!data || typeof data !== 'object') return DEFAULT_STATE()
  const base = DEFAULT_STATE()
  return {
    ...base,
    ...data,
    scheduler: { ...base.scheduler, ...(data.scheduler || {}) },
    settings: { ...base.settings, ...(data.settings || {}) },
    counters: { ...base.counters, ...(data.counters || {}) },
    restores: Array.isArray(data.restores) ? data.restores : [],
    audit: Array.isArray(data.audit) ? data.audit : [],
  }
}

export function writeState(cfg, state) {
  const next = { ...state, updatedAt: new Date().toISOString() }
  writeJsonAtomic(paths(cfg).state, next)
  return next
}

export function updateState(cfg, mutator) {
  return withStoreLock(() => {
    const state = readState(cfg)
    const result = mutator(state) || state
    writeState(cfg, result)
    return result
  })
}

/** Catat tindakan administratif (dipakai dashboard & Telegram). */
export function appendAudit(cfg, { actor, action, resource, result = 'ok', meta = {} }) {
  return updateState(cfg, state => {
    state.audit.push({
      at: new Date().toISOString(),
      actor: String(actor || 'unknown').slice(0, 100),
      action: String(action || '').slice(0, 80),
      resource: String(resource || '').slice(0, 200),
      result: String(result || 'ok').slice(0, 40),
      meta,
    })
    if (state.audit.length > 2000) state.audit.splice(0, state.audit.length - 2000)
    return state
  })
}

export function readAudit(cfg, { limit = 100, action } = {}) {
  let rows = readState(cfg).audit.slice()
  if (action) rows = rows.filter(row => row.action === action)
  rows.reverse()
  return rows.slice(0, Math.min(Math.max(Number(limit) || 100, 1), 500))
}
