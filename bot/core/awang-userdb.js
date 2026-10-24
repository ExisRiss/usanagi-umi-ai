
import crypto from 'crypto'
import { getDb } from './awang-sqlite.js'

const MAX_LIMIT = 10
const LIMIT_WINDOW_MS = 86400000
const RESERVATION_TTL_MS = 1800000

function normalizeLimit(value) {
  if (value === null || value === undefined || value === '') return MAX_LIMIT
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return MAX_LIMIT
  return Math.min(MAX_LIMIT, Math.max(0, Math.floor(numeric)))
}

function normalizeTimestamp(value) {
  const numeric = Number(value)
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0
}

function buildUserRecord(row) {
  if (!row) return null
  return {
    pushName: row.pushName,
    registeredAt: Number(row.registeredAt) || 0,
    limit: normalizeLimit(row.limitCount),
    limitResetAt: normalizeTimestamp(row.limitResetAt),
    premium: Boolean(Number(row.premium)),
  }
}

function ensureUser(db, jid, pushName = null, now = Date.now()) {
  const existing = db.prepare('SELECT pushName, registeredAt, limitCount, limitResetAt, premium FROM users WHERE jid = ?').get(jid)
  if (existing) return existing

  const registeredAt = now
  const resetAt = now + LIMIT_WINDOW_MS
  db.prepare(
    'INSERT OR IGNORE INTO users (jid, pushName, registeredAt, limitCount, limitResetAt, premium) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(jid, pushName, registeredAt, MAX_LIMIT, resetAt, 0)

  return db.prepare('SELECT pushName, registeredAt, limitCount, limitResetAt, premium FROM users WHERE jid = ?').get(jid)
}

function normalizeUserQuota(db, jid, now = Date.now(), pushName = null) {
  const row = ensureUser(db, jid, pushName, now)
  let limit = normalizeLimit(row.limitCount)
  let resetAt = normalizeTimestamp(row.limitResetAt)
  const currentResetAt = resetAt

  if (!resetAt || now >= resetAt) {
    limit = MAX_LIMIT
    resetAt = now + LIMIT_WINDOW_MS
  }

  if (row.pushName !== pushName && pushName !== null && pushName !== undefined) {
    db.prepare('UPDATE users SET pushName = ? WHERE jid = ?').run(pushName, jid)
  }

  if (Number(row.limitCount) !== limit || Number(row.limitResetAt) !== resetAt) {
    db.prepare('UPDATE users SET limitCount = ?, limitResetAt = ? WHERE jid = ?').run(limit, resetAt, jid)
  }

  if (currentResetAt !== resetAt) {
    db.prepare('DELETE FROM limit_reservations WHERE jid = ? AND windowResetAt <> ?').run(jid, resetAt)
  }

  db.prepare('DELETE FROM limit_reservations WHERE jid = ? AND (expiresAt <= ? OR windowResetAt <> ?)').run(jid, now, resetAt)

  return { limit, resetAt }
}

export async function touchUser(jid, pushName) {
  const db = getDb()
  const row = ensureUser(db, jid, pushName)
  if (row.pushName !== pushName) {
    db.prepare('UPDATE users SET pushName = ? WHERE jid = ?').run(pushName, jid)
    row.pushName = pushName
  }
  return buildUserRecord(row)
}

export async function getUser(jid) {
  const db = getDb()
  const row = db.prepare('SELECT pushName, registeredAt, limitCount, limitResetAt, premium FROM users WHERE jid = ?').get(jid)
  return buildUserRecord(row)
}

export async function getUserLimit(jid) {
  const db = getDb()
  return normalizeUserQuota(db, jid)
}

export async function reserveUserLimit(jid) {
  const db = getDb()
  const now = Date.now()
  const reservationId = crypto.randomUUID()

  const reserve = db.transaction(() => {
    const quota = normalizeUserQuota(db, jid, now)
    const pending = db.prepare(
      'SELECT COUNT(*) AS total FROM limit_reservations WHERE jid = ? AND windowResetAt = ? AND expiresAt > ?'
    ).get(jid, quota.resetAt, now).total

    if (quota.limit - Number(pending) <= 0) return null

    db.prepare(
      'INSERT INTO limit_reservations (id, jid, createdAt, expiresAt, windowResetAt) VALUES (?, ?, ?, ?, ?)'
    ).run(reservationId, jid, now, now + RESERVATION_TTL_MS, quota.resetAt)

    return {
      id: reservationId,
      limit: quota.limit,
      resetAt: quota.resetAt,
      expiresAt: now + RESERVATION_TTL_MS,
    }
  })

  return reserve.immediate()
}

export async function commitUserLimit(reservationId, jid) {
  const db = getDb()
  const now = Date.now()

  const commit = db.transaction(() => {
    const reservation = db.prepare(
      'SELECT id, jid, windowResetAt, expiresAt FROM limit_reservations WHERE id = ? AND jid = ?'
    ).get(reservationId, jid)

    if (!reservation || Number(reservation.expiresAt) <= now) {
      if (reservation) db.prepare('DELETE FROM limit_reservations WHERE id = ?').run(reservationId)
      return null
    }

    const quota = normalizeUserQuota(db, jid, now)
    let limit = quota.limit
    let resetAt = quota.resetAt

    if (resetAt !== Number(reservation.windowResetAt)) {
      limit = Math.max(0, MAX_LIMIT - 1)
      resetAt = now + LIMIT_WINDOW_MS
      db.prepare('UPDATE users SET limitCount = ?, limitResetAt = ? WHERE jid = ?').run(limit, resetAt, jid)
    } else if (limit <= 0) {
      db.prepare('DELETE FROM limit_reservations WHERE id = ?').run(reservationId)
      return null
    } else {
      limit -= 1
      db.prepare('UPDATE users SET limitCount = ?, limitResetAt = ? WHERE jid = ?').run(limit, resetAt, jid)
    }

    db.prepare('DELETE FROM limit_reservations WHERE id = ?').run(reservationId)
    return { limit, resetAt }
  })

  return commit.immediate()
}

export async function releaseUserLimit(reservationId, jid) {
  const db = getDb()
  const result = db.prepare('DELETE FROM limit_reservations WHERE id = ? AND jid = ?').run(reservationId, jid)
  return result.changes > 0
}

export async function isUserPremium(jid) {
  const db = getDb()
  const row = db.prepare('SELECT premium FROM users WHERE jid = ?').get(jid)
  return Boolean(Number(row?.premium))
}

export async function setUserPremium(jid, premium) {
  const db = getDb()
  ensureUser(db, jid)
  db.prepare('UPDATE users SET premium = ? WHERE jid = ?').run(premium ? 1 : 0, jid)
  return Boolean(premium)
}

export default {
  touchUser,
  getUser,
  getUserLimit,
  reserveUserLimit,
  commitUserLimit,
  releaseUserLimit,
  isUserPremium,
  setUserPremium,
}
