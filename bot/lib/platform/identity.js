/**
 * Identitas lintas platform.
 *
 * Model:
 *   platform_users      = identitas internal (satu baris per manusia)
 *   platform_identities = akun platform (telegram:<id>, web:<auth-id>, whatsapp:<jid>)
 *
 * ID Telegram TIDAK pernah dianggap sama dengan nomor WhatsApp. Penggabungan
 * hanya terjadi lewat kode tautan sekali-pakai yang dibuat dari sesi web
 * terautentikasi, lalu dikonsumsi di Telegram.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { platformDb } from './db.js'
import { audit } from './audit.js'
import { hashToken, linkCode } from './secrets.js'
import { normalizeRole, outranks } from './roles.js'

const LINK_TTL_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5

function nowIso(ms = Date.now()) {
  return new Date(ms).toISOString()
}

export function webUserId(authId) {
  return `web:${String(authId || '').trim()}`
}

function bootstrapRole(platform, platformUserId, env = process.env) {
  if (platform !== 'telegram') return null
  const id = String(platformUserId)
  const list = name => String(env[name] || '').split(/[,\s]+/).filter(Boolean)
  if (list('TELEGRAM_OWNER_IDS').includes(id)) return 'owner'
  if (list('TELEGRAM_DEVELOPER_IDS').includes(id)) return 'developer'
  if (list('TELEGRAM_ADMIN_IDS').includes(id)) return 'admin'
  return null
}

export function ensureUser({ id, source = 'telegram', email = null, displayName = null, role = 'user' }) {
  const db = platformDb()
  const userId = id || `pu_${crypto.randomBytes(8).toString('hex')}`
  const existing = db.prepare('SELECT * FROM platform_users WHERE id = ?').get(userId)
  if (existing) {
    const patch = []
    const params = []
    if (displayName && displayName !== existing.display_name) { patch.push('display_name = ?'); params.push(displayName) }
    if (email && !existing.email) { patch.push('email = ?'); params.push(email) }
    if (patch.length) {
      db.prepare(`UPDATE platform_users SET ${patch.join(', ')}, updated_at = ? WHERE id = ?`).run(...params, Date.now(), userId)
    }
    return db.prepare('SELECT * FROM platform_users WHERE id = ?').get(userId)
  }
  const at = Date.now()
  db.prepare(`INSERT INTO platform_users(id, source, email, display_name, role, status, created_at, updated_at)
    VALUES (?,?,?,?,?, 'active', ?, ?)`).run(userId, source, email, displayName, normalizeRole(role), at, at)
  return db.prepare('SELECT * FROM platform_users WHERE id = ?').get(userId)
}

export function getUser(userId) {
  return platformDb().prepare('SELECT * FROM platform_users WHERE id = ?').get(String(userId)) || null
}

export function setRole(userId, role, actor = {}) {
  const db = platformDb()
  const next = normalizeRole(role)
  const user = getUser(userId)
  if (!user) throw Object.assign(new Error('Pengguna tidak ditemukan.'), { status: 404 })
  db.prepare('UPDATE platform_users SET role = ?, updated_at = ? WHERE id = ?').run(next, Date.now(), userId)
  audit({
    actorUserId: actor.userId,
    platform: actor.platform,
    platformUserId: actor.platformUserId,
    action: 'rbac.role.change',
    resource: userId,
    meta: { from: user.role, to: next },
  })
  return getUser(userId)
}

export function findIdentity(platform, platformUserId) {
  return platformDb().prepare('SELECT * FROM platform_identities WHERE platform = ? AND platform_user_id = ?')
    .get(String(platform), String(platformUserId)) || null
}

/**
 * Resolusi konteks adapter: identitas → user internal → role.
 * User baru otomatis dibuat dengan role dari bootstrap env (default `user`).
 */
export function resolveContext({ platform, platformUserId, username = null, displayName = null, env = process.env }) {
  const db = platformDb()
  const identity = findIdentity(platform, platformUserId)
  if (identity) {
    db.prepare('UPDATE platform_identities SET last_seen_at = ?, username = COALESCE(?, username) WHERE platform = ? AND platform_user_id = ?')
      .run(Date.now(), username, String(platform), String(platformUserId))
    let user = getUser(identity.user_id)
    if (user?.status === 'banned') throw Object.assign(new Error('Akun ini diblokir.'), { status: 403 })
    // Owner/developer/admin dari environment selalu menang atas role tersimpan
    // yang lebih rendah, supaya menambah ID ke TELEGRAM_OWNER_IDS cukup lewat
    // konfigurasi dan langsung berlaku tanpa migrasi data manual.
    const envRole = bootstrapRole(platform, platformUserId, env)
    if (envRole && outranks(envRole, user?.role)) {
      db.prepare('UPDATE platform_users SET role = ?, updated_at = ? WHERE id = ?').run(envRole, Date.now(), identity.user_id)
      audit({
        actorUserId: identity.user_id, platform, platformUserId,
        action: 'rbac.role.bootstrap', resource: identity.user_id,
        meta: { from: user?.role || null, to: envRole },
      })
      user = getUser(identity.user_id)
    }
    return { identity, user, role: normalizeRole(user?.role), userId: identity.user_id }
  }
  const role = normalizeRole(bootstrapRole(platform, platformUserId, env) || 'user')
  const user = ensureUser({ source: platform, displayName, role })
  const at = Date.now()
  db.prepare(`INSERT INTO platform_identities(platform, platform_user_id, user_id, whatsapp_jid, username, verified_via, linked_at, last_seen_at)
    VALUES (?,?,?,NULL,?,?,?,?)`).run(String(platform), String(platformUserId), user.id, username, role === 'user' ? 'auto' : 'bootstrap-env', at, at)
  audit({
    actorUserId: user.id,
    platform,
    platformUserId,
    action: 'identity.create',
    resource: `${platform}:${platformUserId}`,
    meta: { role },
  })
  return { identity: findIdentity(platform, platformUserId), user, role, userId: user.id }
}

/** Nomor WhatsApp (jid) milik satu user internal, bila ada. */
export function whatsappJidFor(userId) {
  const row = platformDb().prepare(`SELECT whatsapp_jid FROM platform_identities
    WHERE user_id = ? AND platform = 'whatsapp' AND whatsapp_jid IS NOT NULL ORDER BY linked_at DESC LIMIT 1`).get(String(userId))
  return row?.whatsapp_jid || null
}

/**
 * Sesi jadibot WhatsApp milik user web (dibaca dari state platform yang sama
 * dengan yang dipakai website). Tidak menerima nomor dari klien.
 */
export function whatsappNumbersForWebUser(authId, dataDir = path.join(process.cwd(), 'data')) {
  try {
    const raw = fs.readFileSync(path.join(dataDir, 'jadibot-platform.json'), 'utf8')
    const parsed = JSON.parse(raw)
    const sessions = parsed.sessions || {}
    return Object.entries(sessions)
      .filter(([, row]) => String(row?.userId || '') === String(authId || ''))
      .map(([number, row]) => ({ number: String(number), email: row?.email || null }))
      .sort((a, b) => a.number.localeCompare(b.number))
  } catch {
    return []
  }
}

/** Buat kode tautan sekali pakai untuk user web yang sudah terautentikasi. */
export function createLinkCode(userId, { label = null, ttlMs = LINK_TTL_MS, whatsappJid = null } = {}) {
  const db = platformDb()
  const user = getUser(userId)
  if (!user) throw Object.assign(new Error('Pengguna tidak ditemukan.'), { status: 404 })
  const code = linkCode()
  const at = Date.now()
  db.prepare(`INSERT INTO platform_link_codes(code_hash, user_id, whatsapp_jid, label, created_at, expires_at, used_at, attempts)
    VALUES (?,?,?,?,?,?,NULL,0)`).run(hashToken(code), userId, whatsappJid, label, at, at + Math.max(60000, Number(ttlMs) || LINK_TTL_MS))
  audit({ actorUserId: userId, platform: 'web', action: 'identity.link.code.create', resource: userId, meta: { label, whatsappJid } })
  return { code, expiresAt: nowIso(at + Math.max(60000, Number(ttlMs) || LINK_TTL_MS)) }
}

/**
 * Konsumsi kode tautan dari platform lain.
 * Identitas yang sudah ada dipindahkan ke user target; user sementara tanpa
 * identitas lain dihapus. Role mengikuti user target.
 */
export function consumeLinkCode(code, { platform, platformUserId, username = null }) {
  const db = platformDb()
  const hash = hashToken(String(code || '').trim().toUpperCase())
  const row = db.prepare('SELECT * FROM platform_link_codes WHERE code_hash = ?').get(hash)
  if (!row) throw Object.assign(new Error('Kode tautan tidak ditemukan. Buat kode baru di dashboard.'), { status: 404 })
  if (row.used_at) throw Object.assign(new Error('Kode tautan sudah dipakai.'), { status: 409 })
  if (row.expires_at < Date.now()) throw Object.assign(new Error('Kode tautan kedaluwarsa.'), { status: 410 })
  if (Number(row.attempts) >= MAX_ATTEMPTS) throw Object.assign(new Error('Terlalu banyak percobaan untuk kode ini.'), { status: 429 })

  const target = getUser(row.user_id)
  if (!target) throw Object.assign(new Error('Pemilik kode tautan tidak ditemukan.'), { status: 404 })

  const existing = findIdentity(platform, platformUserId)
  const previousUserId = existing?.user_id || null
  const at = Date.now()

  db.transaction(() => {
    db.prepare(`UPDATE platform_link_codes SET used_at = ?, used_platform = ?, used_platform_user_id = ?, attempts = attempts + 1
      WHERE code_hash = ?`).run(at, platform, String(platformUserId), hash)
    if (existing) {
      db.prepare(`UPDATE platform_identities SET user_id = ?, whatsapp_jid = COALESCE(whatsapp_jid, ?), username = COALESCE(?, username), verified_via = 'link-code', linked_at = ?
        WHERE platform = ? AND platform_user_id = ?`)
        .run(target.id, row.whatsapp_jid || null, username, at, platform, String(platformUserId))
    } else {
      db.prepare(`INSERT INTO platform_identities(platform, platform_user_id, user_id, whatsapp_jid, username, verified_via, linked_at, last_seen_at)
        VALUES (?,?,?,?,?,'link-code',?,?)`).run(platform, String(platformUserId), target.id, row.whatsapp_jid || null, username, at, at)
    }
    // Tautan WhatsApp (bila kode membawa jid) memakai tabel identitas, bukan rpg_unified_aliases.
    if (row.whatsapp_jid) {
      db.prepare(`INSERT INTO platform_identities(platform, platform_user_id, user_id, whatsapp_jid, username, verified_via, linked_at, last_seen_at)
        VALUES ('whatsapp', ?, ?, ?, NULL, 'link-code', ?, ?)
        ON CONFLICT(platform, platform_user_id) DO UPDATE SET user_id = excluded.user_id, whatsapp_jid = excluded.whatsapp_jid`)
        .run(String(row.whatsapp_jid), target.id, row.whatsapp_jid, at, at)
    }
    if (previousUserId && previousUserId !== target.id) {
      const left = db.prepare('SELECT count(*) n FROM platform_identities WHERE user_id = ?').get(previousUserId).n
      if (left === 0) {
        db.prepare('DELETE FROM platform_users WHERE id = ? AND role = ?').run(previousUserId, 'user')
      }
    }
  })()

  audit({
    actorUserId: target.id,
    platform,
    platformUserId,
    action: 'identity.link.consume',
    resource: `${platform}:${platformUserId}`,
    meta: { previousUserId, role: target.role, whatsappJid: row.whatsapp_jid },
  })
  return { user: getUser(target.id), identity: findIdentity(platform, platformUserId) }
}

/** Klaim owner sekali pakai (dipakai saat bot baru dipasang). */
export function claimOwner({ platform, platformUserId, code, username }, env = process.env) {
  const expected = String(env.TELEGRAM_OWNER_CLAIM_CODE || '').trim()
  if (!expected) throw Object.assign(new Error('Klaim owner tidak diaktifkan di server.'), { status: 403 })
  const db = platformDb()
  const used = db.prepare("SELECT value FROM platform_meta WHERE key = 'owner_claimed'").get()
  if (used) throw Object.assign(new Error('Kode klaim owner sudah pernah dipakai.'), { status: 409 })
  const given = String(code || '').trim()
  if (!given || given.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected))) {
    throw Object.assign(new Error('Kode klaim owner salah.'), { status: 403 })
  }
  const ctx = resolveContext({ platform, platformUserId, username })
  db.prepare("INSERT OR REPLACE INTO platform_meta VALUES('owner_claimed', ?)").run(`${platform}:${platformUserId}:${Date.now()}`)
  setRole(ctx.userId, 'owner', { userId: ctx.userId, platform, platformUserId })
  return { ...ctx, role: 'owner' }
}

export function listUsers({ limit = 50, offset = 0, role } = {}) {
  const db = platformDb()
  const where = role ? 'WHERE u.role = ?' : ''
  const params = role ? [String(role)] : []
  const total = db.prepare(`SELECT count(*) n FROM platform_users u ${where}`).get(...params).n
  const rows = db.prepare(`SELECT u.*, (SELECT count(*) FROM platform_identities i WHERE i.user_id = u.id) AS identities
    FROM platform_users u ${where} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, Math.min(Math.max(Number(limit) || 50, 1), 200), Math.max(Number(offset) || 0, 0))
  return {
    total,
    items: rows.map(row => ({
      id: row.id,
      source: row.source,
      email: row.email,
      displayName: row.display_name,
      role: normalizeRole(row.role),
      status: row.status,
      identities: row.identities,
      createdAt: nowIso(row.created_at),
    })),
  }
}
