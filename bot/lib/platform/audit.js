/**
 * Audit log platform. Semua aksi sensitif (kontrol server, perubahan role,
 * konfigurasi token, restore, reward RPG, transaksi saham) wajib lewat sini.
 *
 * Rahasia TIDAK pernah masuk audit: nilai sensitif di-redact sebelum disimpan.
 */
import crypto from 'node:crypto'
import { platformDb } from './db.js'

const SENSITIVE_KEY = /token|secret|password|apikey|api_key|authorization|credential|cookie|private/i

export function redactMeta(meta) {
  if (meta === null || meta === undefined) return null
  const walk = (value, depth = 0) => {
    if (depth > 6) return '[deep]'
    if (Array.isArray(value)) return value.slice(0, 50).map(item => walk(item, depth + 1))
    if (value && typeof value === 'object') {
      const out = {}
      for (const [key, item] of Object.entries(value)) {
        if (SENSITIVE_KEY.test(key)) out[key] = '[redacted]'
        else out[key] = walk(item, depth + 1)
      }
      return out
    }
    if (typeof value === 'string' && value.length > 500) return `${value.slice(0, 500)}…`
    return value
  }
  return walk(meta)
}

/**
 * Catat satu event audit.
 * @param {{actorUserId?:string, platform?:string, platformUserId?:string, action:string, resource?:string, result?:string, meta?:object, correlationId?:string}} event
 */
export function audit(event = {}) {
  const db = platformDb()
  const id = `evt_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`
  db.prepare(`INSERT INTO platform_audit
    (id, at, actor_user_id, actor_platform, actor_platform_user_id, action, resource, result, meta, correlation_id)
    VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
    id,
    Date.now(),
    event.actorUserId || null,
    event.platform || null,
    event.platformUserId ? String(event.platformUserId) : null,
    String(event.action || 'unknown'),
    event.resource ? String(event.resource).slice(0, 200) : null,
    String(event.result || 'ok'),
    event.meta ? JSON.stringify(redactMeta(event.meta)) : null,
    event.correlationId || null
  )
  return id
}

export function listAudit({ limit = 50, action, actorUserId, offset = 0 } = {}) {
  const db = platformDb()
  const where = []
  const params = []
  if (action) { where.push('action = ?'); params.push(String(action)) }
  if (actorUserId) { where.push('actor_user_id = ?'); params.push(String(actorUserId)) }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : ''
  const total = db.prepare(`SELECT count(*) n FROM platform_audit ${clause}`).get(...params).n
  const rows = db.prepare(`SELECT * FROM platform_audit ${clause} ORDER BY at DESC LIMIT ? OFFSET ?`)
    .all(...params, Math.min(Math.max(Number(limit) || 50, 1), 200), Math.max(Number(offset) || 0, 0))
  return {
    total,
    items: rows.map(row => ({
      id: row.id,
      at: new Date(row.at).toISOString(),
      actorUserId: row.actor_user_id,
      platform: row.actor_platform,
      platformUserId: row.actor_platform_user_id,
      action: row.action,
      resource: row.resource,
      result: row.result,
      meta: row.meta ? JSON.parse(row.meta) : null,
      correlationId: row.correlation_id,
    })),
  }
}

/** Health check terakhir per integrasi (dipakai dashboard & /status). */
export function setHealth(name, status, detail = null) {
  platformDb().prepare(`INSERT INTO integration_health(name, status, detail, checked_at) VALUES(?,?,?,?)
    ON CONFLICT(name) DO UPDATE SET status=excluded.status, detail=excluded.detail, checked_at=excluded.checked_at`)
    .run(String(name), String(status), detail ? String(detail).slice(0, 300) : null, Date.now())
}

export function getHealth() {
  const rows = platformDb().prepare('SELECT * FROM integration_health ORDER BY name').all()
  return rows.map(row => ({ name: row.name, status: row.status, detail: row.detail, checkedAt: new Date(row.checked_at).toISOString() }))
}
