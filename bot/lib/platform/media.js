/**
 * Media → URL.
 *
 * Penyimpanan internal di `data/platform/media` (bukan host pihak ketiga),
 * nama objek acak, tipe dideteksi dari isi berkas (magic bytes), dan URL
 * bertanda tangan HMAC dengan masa berlaku. URL tanpa tanda tangan valid
 * selalu ditolak — termasuk untuk berkas yang "tidak sengaja diketahui".
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { platformDb } from './db.js'
import { signMedia, verifyMedia } from './secrets.js'
import { audit } from './audit.js'

export const MAX_BYTES = {
  image: 10 * 1024 * 1024,
  video: 50 * 1024 * 1024,
  audio: 20 * 1024 * 1024,
  document: 25 * 1024 * 1024,
}

export const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000

const MAGIC = [
  { mime: 'image/jpeg', ext: 'jpg', test: b => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: 'image/png', ext: 'png', test: b => b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { mime: 'image/gif', ext: 'gif', test: b => b.slice(0, 6).toString('ascii') === 'GIF87a' || b.slice(0, 6).toString('ascii') === 'GIF89a' },
  { mime: 'image/webp', ext: 'webp', test: b => b.slice(0, 4).toString('ascii') === 'RIFF' && b.slice(8, 12).toString('ascii') === 'WEBP' },
  { mime: 'video/mp4', ext: 'mp4', test: b => b.slice(4, 8).toString('ascii') === 'ftyp' },
  { mime: 'video/webm', ext: 'webm', test: b => b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3 },
  { mime: 'audio/mpeg', ext: 'mp3', test: b => b.slice(0, 3).toString('ascii') === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0) },
  { mime: 'audio/ogg', ext: 'ogg', test: b => b.slice(0, 4).toString('ascii') === 'OggS' },
  { mime: 'application/pdf', ext: 'pdf', test: b => b.slice(0, 5).toString('ascii') === '%PDF-' },
  { mime: 'application/zip', ext: 'zip', test: b => b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03 && b[3] === 0x04 },
]

export function mediaDir(env = process.env) {
  const dir = env.PLATFORM_MEDIA_DIR || path.join(process.cwd(), 'data', 'platform', 'media')
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 })
  return dir
}

/** Deteksi MIME dari isi berkas. Nama/ekstensi dari klien tidak dipercaya. */
export function sniff(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null
  for (const item of MAGIC) {
    try { if (item.test(buffer)) return { mime: item.mime, ext: item.ext } } catch {}
  }
  return null
}

export function categoryOf(mime) {
  if (!mime) return null
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  return 'document'
}

export function storeMedia(buffer, { userId, platform = 'telegram', name = null, ttlMs = DEFAULT_TTL_MS, permanent = false, isPublic = false, actor = {} } = {}) {
  if (!Buffer.isBuffer(buffer) || !buffer.length) throw Object.assign(new Error('Berkas kosong.'), { status: 400 })
  const kind = sniff(buffer)
  if (!kind) throw Object.assign(new Error('Format berkas tidak dikenali. Hanya gambar, video, audio, PDF, dan ZIP.'), { status: 415 })
  const category = categoryOf(kind.mime)
  const limit = MAX_BYTES[category] || MAX_BYTES.document
  if (buffer.length > limit) {
    throw Object.assign(new Error(`Berkas ${(buffer.length / 1048576).toFixed(1)} MB melebihi batas ${(limit / 1048576).toFixed(0)} MB untuk ${category}.`), { status: 413 })
  }
  const id = crypto.randomBytes(12).toString('hex')
  const file = path.join(mediaDir(), `${id}.${kind.ext}`)
  fs.writeFileSync(file, buffer, { mode: 0o600 })
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex')
  const now = Date.now()
  const expiresAt = permanent || ttlMs === 0 ? null : now + Math.max(60000, Number(ttlMs) || DEFAULT_TTL_MS)
  platformDb().prepare(`INSERT INTO platform_media(id, user_id, platform, name, mime, bytes, sha256, path, is_public, created_at, expires_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
    id, String(userId || 'anonymous'), platform,
    name ? String(name).slice(0, 120) : null,
    kind.mime, buffer.length, sha256, path.basename(file),
    isPublic ? 1 : 0, now, expiresAt
  )
  audit({
    actorUserId: userId, platform,
    platformUserId: actor.platformUserId,
    action: 'media.upload', resource: `media:${id}`,
    meta: { mime: kind.mime, bytes: buffer.length, expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null },
  })
  return { id, mime: kind.mime, category, bytes: buffer.length, sha256, expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null }
}

/**
 * URL bertanda tangan. Bisa dipakai adapter (Telegram) untuk mengirim tautan.
 * @param {string} id
 * @param {{baseUrl?:string, userId?:string, ttlMs?:number}} options
 */
export function mediaUrl(id, { baseUrl = '', userId = null, ttlMs = DEFAULT_TTL_MS, permanent = false } = {}) {
  const row = platformDb().prepare('SELECT * FROM platform_media WHERE id = ? AND deleted_at IS NULL').get(String(id))
  if (!row) throw Object.assign(new Error('Media tidak ditemukan.'), { status: 404 })
  const owner = String(userId || row.user_id)
  // `e=0` = tautan permanen: tanda tangan tetap wajib, tetapi tanpa batas waktu.
  // Dipakai fitur to-URL supaya berkas tidak mati setelah 7 hari.
  const isPermanent = permanent || ttlMs === 0 || row.expires_at === null
  const exp = isPermanent ? 0 : Date.now() + Math.max(60000, Number(ttlMs) || DEFAULT_TTL_MS)
  const sig = signMedia(row.id, exp, owner)
  const base = String(baseUrl || process.env.PLATFORM_PUBLIC_BASE_URL || '').replace(/\/+$/, '')
  return `${base}/api/platform-system/media/${row.id}?e=${exp}&u=${encodeURIComponent(owner)}&s=${sig}`
}

export function resolveSigned(id, { expiresAt, userId, signature, now = Date.now() } = {}) {
  const row = platformDb().prepare('SELECT * FROM platform_media WHERE id = ?').get(String(id))
  if (!row || row.deleted_at) throw Object.assign(new Error('Media tidak ditemukan.'), { status: 404 })
  if (!signature || !userId || !expiresAt) {
    throw Object.assign(new Error('Tautan media wajib memakai tanda tangan.'), { status: 403 })
  }
  const exp = Number(expiresAt)
  if (!Number.isFinite(exp) || exp < 0) throw Object.assign(new Error('Tautan media tidak valid.'), { status: 403 })
  // exp = 0 berarti permanen; selain itu wajib belum lewat.
  if (exp !== 0 && exp < now) throw Object.assign(new Error('Tautan media sudah kedaluwarsa.'), { status: 410 })
  if (row.expires_at && Number(row.expires_at) < now) throw Object.assign(new Error('Media sudah kedaluwarsa.'), { status: 410 })
  if (!verifyMedia(row.id, exp, String(userId || ''), signature)) {
    throw Object.assign(new Error('Tanda tangan tautan media tidak valid.'), { status: 403 })
  }
  const file = path.join(mediaDir(), row.path)
  if (!fs.existsSync(file)) throw Object.assign(new Error('Berkas media hilang dari penyimpanan.'), { status: 410 })
  return { row, file }
}

export function listMedia({ userId = null, limit = 50 } = {}) {
  const db = platformDb()
  const where = userId ? 'WHERE user_id = ? AND deleted_at IS NULL' : 'WHERE deleted_at IS NULL'
  const params = userId ? [String(userId)] : []
  const rows = db.prepare(`SELECT * FROM platform_media ${where} ORDER BY created_at DESC LIMIT ?`).all(...params, Math.min(Math.max(Number(limit) || 50, 1), 200))
  return rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    mime: row.mime,
    bytes: row.bytes,
    createdAt: new Date(row.created_at).toISOString(),
    expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : null,
    permanent: row.expires_at === null || row.expires_at === undefined,
  }))
}

export function deleteMedia(id, { userId, role = 'user', actor = {} } = {}) {
  const db = platformDb()
  const row = db.prepare('SELECT * FROM platform_media WHERE id = ? AND deleted_at IS NULL').get(String(id))
  if (!row) throw Object.assign(new Error('Media tidak ditemukan.'), { status: 404 })
  const isOwner = String(row.user_id) === String(userId)
  const canAny = ['owner', 'developer', 'admin'].includes(String(role))
  if (!isOwner && !canAny) throw Object.assign(new Error('Anda tidak berhak menghapus media ini.'), { status: 403 })
  db.prepare('UPDATE platform_media SET deleted_at = ? WHERE id = ?').run(Date.now(), row.id)
  try { fs.rmSync(path.join(mediaDir(), row.path), { force: true }) } catch {}
  audit({ actorUserId: userId, platform: actor.platform, platformUserId: actor.platformUserId, action: 'media.delete', resource: `media:${row.id}`, meta: { owner: row.user_id } })
  return { deleted: row.id }
}

/** Bersihkan media kedaluwarsa (dipanggil scheduler ringan). */
export function pruneExpired(now = Date.now()) {
  const db = platformDb()
  const rows = db.prepare('SELECT id, path FROM platform_media WHERE deleted_at IS NULL AND expires_at IS NOT NULL AND expires_at < ?').all(now)
  for (const row of rows) {
    db.prepare('UPDATE platform_media SET deleted_at = ? WHERE id = ?').run(now, row.id)
    try { fs.rmSync(path.join(mediaDir(), row.path), { force: true }) } catch {}
  }
  return rows.length
}
