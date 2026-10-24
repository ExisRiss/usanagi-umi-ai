/* By AlzRiss - Usanagi Umi AI */

import { randomUUID } from 'node:crypto'
import { getDb } from './awang-sqlite.js'
import { getGroupMetadata, setGroupMode } from './awang-grup.js'
import { isBotAdmin } from '../lib/awang-aksesgrub.js'

const MAX_TIMEOUT = 2_147_483_647
const RETRY_DELAY = 30_000
const MAX_ATTEMPTS = 5

const timers = new Map()
const running = new Set()
const runnerToken = randomUUID()
let activeConn = null
let initialized = false

function normalizeMode(value) {
  return value === 'open' ? 'open' : value === 'closed' ? 'closed' : ''
}

function normalizeSchedule(row) {
  if (!row) return null
  return {
    id: Number(row.id),
    groupId: String(row.groupId),
    mode: normalizeMode(row.mode),
    executeAt: Number(row.executeAt),
    createdAt: Number(row.createdAt),
    createdBy: String(row.createdBy || ''),
    status: String(row.status || 'active'),
    attempts: Number(row.attempts || 0),
    runnerToken: String(row.runnerToken || ''),
  }
}

function ensureSchema() {
  const db = getDb()
  db.exec(`
    CREATE TABLE IF NOT EXISTS group_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      groupId TEXT NOT NULL,
      mode TEXT NOT NULL CHECK (mode IN ('open', 'closed')),
      executeAt INTEGER NOT NULL,
      createdAt INTEGER NOT NULL,
      createdBy TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'running', 'done', 'cancelled', 'failed')),
      attempts INTEGER NOT NULL DEFAULT 0,
      updatedAt INTEGER NOT NULL,
      lastError TEXT,
      runnerToken TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_group_schedules_status_time
      ON group_schedules (status, executeAt);

    CREATE INDEX IF NOT EXISTS idx_group_schedules_group
      ON group_schedules (groupId, status, executeAt);
  `)

  const columns = db.prepare('PRAGMA table_info(group_schedules)').all()
  if (!columns.some((column) => column.name === 'runnerToken')) {
    db.exec('ALTER TABLE group_schedules ADD COLUMN runnerToken TEXT')
  }

  db.prepare(
    "UPDATE group_schedules SET status = 'active', runnerToken = NULL, updatedAt = ? WHERE status = 'running' AND (runnerToken IS NULL OR runnerToken != ?)"
  ).run(Date.now(), runnerToken)

  return db
}

function clearTimer(id) {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
}

function clearAllTimers() {
  for (const timer of timers.values()) clearTimeout(timer)
  timers.clear()
}

function scheduleNext(row) {
  const schedule = normalizeSchedule(row)
  if (!schedule || !activeConn || schedule.status !== 'active') return

  clearTimer(schedule.id)

  const remaining = schedule.executeAt - Date.now()
  const delay = Math.max(0, Math.min(remaining, MAX_TIMEOUT))
  const timer = setTimeout(() => {
    timers.delete(schedule.id)
    if (remaining > MAX_TIMEOUT) {
      scheduleNext(schedule)
      return
    }
    void executeSchedule(schedule.id)
  }, delay)

  timers.set(schedule.id, timer)
}

async function executeSchedule(id) {
  if (running.has(id)) return
  if (!activeConn) return

  const db = ensureSchema()
  const current = db.prepare(
    "SELECT * FROM group_schedules WHERE id = ? AND status = 'active' LIMIT 1"
  ).get(id)

  if (!current) return

  const claimed = db.prepare(
    "UPDATE group_schedules SET status = 'running', attempts = attempts + 1, updatedAt = ?, runnerToken = ? WHERE id = ? AND status = 'active'"
  ).run(Date.now(), runnerToken, id)

  if (claimed.changes !== 1) return

  running.add(id)
  const schedule = normalizeSchedule({ ...current, status: 'running', attempts: Number(current.attempts || 0) + 1, runnerToken })

  try {
    const metadata = await getGroupMetadata(activeConn, schedule.groupId)
    if (!(await isBotAdmin(activeConn, schedule.groupId, metadata))) {
      throw new Error('Bot tidak lagi menjadi admin group. Jadwal tidak dapat dijalankan.')
    }

    await setGroupMode(activeConn, schedule.groupId, schedule.mode)

    db.prepare(
      "UPDATE group_schedules SET status = 'done', updatedAt = ?, lastError = NULL, runnerToken = NULL WHERE id = ? AND status = 'running' AND runnerToken = ?"
    ).run(Date.now(), id, runnerToken)
  } catch (err) {
    const message = String(err?.message || err || 'Gagal menjalankan jadwal.').slice(0, 500)
    if (schedule.attempts >= MAX_ATTEMPTS) {
      db.prepare(
        "UPDATE group_schedules SET status = 'failed', updatedAt = ?, lastError = ?, runnerToken = NULL WHERE id = ? AND status = 'running' AND runnerToken = ?"
      ).run(Date.now(), message, id, runnerToken)
    } else {
      db.prepare(
        "UPDATE group_schedules SET status = 'active', executeAt = ?, updatedAt = ?, lastError = ?, runnerToken = NULL WHERE id = ? AND status = 'running' AND runnerToken = ?"
      ).run(Date.now() + RETRY_DELAY, Date.now(), message, id, runnerToken)
    }
  } finally {
    running.delete(id)
    const next = db.prepare(
      "SELECT * FROM group_schedules WHERE id = ? AND status = 'active' LIMIT 1"
    ).get(id)

    if (next) scheduleNext(next)
  }
}

function loadSchedules() {
  const db = ensureSchema()
  return db.prepare(
    "SELECT * FROM group_schedules WHERE status = 'active' ORDER BY executeAt ASC, id ASC"
  ).all()
}

export function createGroupSchedule({ groupId, mode, executeAt, createdBy = '' }) {
  const normalizedMode = normalizeMode(mode)
  const target = String(groupId || '').trim()
  const timestamp = Number(executeAt)
  const creator = String(createdBy || '').trim()

  if (!target.endsWith('@g.us')) throw new Error('Target group tidak valid.')
  if (!normalizedMode) throw new Error('Mode jadwal tidak valid.')
  if (!Number.isSafeInteger(timestamp) || timestamp <= Date.now()) throw new Error('Waktu eksekusi tidak valid.')

  const db = ensureSchema()

  const existing = db.prepare(
    "SELECT id FROM group_schedules WHERE groupId = ? AND mode = ? AND status IN ('active', 'running') LIMIT 1"
  ).get(target, normalizedMode)

  if (existing) {
    throw new Error(`Sudah ada jadwal ${normalizedMode === 'closed' ? 'tutup' : 'buka'} aktif untuk group ini (ID ${existing.id}).`)
  }

  const now = Date.now()
  const result = db.prepare(
    "INSERT INTO group_schedules (groupId, mode, executeAt, createdAt, createdBy, status, attempts, updatedAt, lastError) VALUES (?, ?, ?, ?, ?, 'active', 0, ?, NULL)"
  ).run(target, normalizedMode, timestamp, now, creator || null, now)

  const id = Number(result.lastInsertRowid)
  const row = db.prepare("SELECT * FROM group_schedules WHERE id = ?").get(id)
  scheduleNext(row)

  return normalizeSchedule(row)
}

export function listGroupSchedules(groupId) {
  const target = String(groupId || '').trim()
  if (!target.endsWith('@g.us')) return []
  const db = ensureSchema()
  return db.prepare(
    "SELECT * FROM group_schedules WHERE groupId = ? AND status IN ('active', 'running') ORDER BY executeAt ASC, id ASC"
  ).all().map(normalizeSchedule)
}

export function cancelGroupSchedule(groupId, id = null) {
  const target = String(groupId || '').trim()
  if (!target.endsWith('@g.us')) return { cancelled: 0 }

  const db = ensureSchema()

  if (id === null) {
    const rows = db.prepare(
      "SELECT id FROM group_schedules WHERE groupId = ? AND status IN ('active', 'running')"
    ).all(target)

    const result = db.prepare(
      "UPDATE group_schedules SET status = 'cancelled', updatedAt = ? WHERE groupId = ? AND status IN ('active', 'running')"
    ).run(Date.now(), target)

    for (const row of rows) clearTimer(Number(row.id))
    return { cancelled: Number(result.changes || 0) }
  }

  const scheduleId = Number(id)
  if (!Number.isSafeInteger(scheduleId) || scheduleId <= 0) return { cancelled: 0 }

  const result = db.prepare(
    "UPDATE group_schedules SET status = 'cancelled', updatedAt = ? WHERE id = ? AND groupId = ? AND status IN ('active', 'running')"
  ).run(Date.now(), scheduleId, target)

  clearTimer(scheduleId)
  return { cancelled: Number(result.changes || 0) }
}

export function initializeGroupScheduler(conn) {
  activeConn = conn
  if (!initialized) {
    initialized = true
    ensureSchema()
  } else {
    ensureSchema()
  }

  clearAllTimers()

  for (const row of loadSchedules()) {
    if (Number(row.executeAt) <= Date.now()) {
      void executeSchedule(Number(row.id))
    } else {
      scheduleNext(row)
    }
  }
}

export default {
  createGroupSchedule,
  listGroupSchedules,
  cancelGroupSchedule,
  initializeGroupScheduler,
}
