/**
 * Penyimpanan rahasia (token bot Telegram, kredensial panel).
 *
 * Format cipher: `v1:<iv-hex>:<tag-hex>:<cipher-hex>` — AES-256-GCM.
 * Kunci diambil dari env `PLATFORM_SECRET_KEY` (32 byte hex/base64) dan
 * TIDAK pernah ditulis ke database, log, atau respons API.
 */
import crypto from 'node:crypto'

const VERSION = 'v1'

export class SecretError extends Error {
  constructor(message, status = 500) {
    super(message)
    this.status = status
    this.name = 'SecretError'
  }
}

/** Ambil kunci enkripsi dari env. Menerima 64 hex atau base64 32 byte. */
export function secretKey(env = process.env) {
  const raw = String(env.PLATFORM_SECRET_KEY || '').trim()
  if (!raw) throw new SecretError('PLATFORM_SECRET_KEY belum diatur di server.', 503)
  let key
  if (/^[0-9a-f]{64}$/i.test(raw)) key = Buffer.from(raw, 'hex')
  else {
    try { key = Buffer.from(raw, 'base64') } catch { key = Buffer.alloc(0) }
  }
  if (key.length !== 32) throw new SecretError('PLATFORM_SECRET_KEY harus 32 byte (64 hex atau base64).', 503)
  return key
}

export function hasSecretKey(env = process.env) {
  try { return Boolean(secretKey(env)) } catch { return false }
}

/** Enkripsi teks. Kunci wajib tersedia. */
export function seal(plain, env = process.env) {
  const text = String(plain ?? '')
  if (!text) throw new SecretError('Nilai rahasia kosong.', 400)
  const key = secretKey(env)
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [VERSION, iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':')
}

/** Dekripsi. Melempar SecretError bila format/kunci tidak cocok. */
export function open(cipherText, env = process.env) {
  const parts = String(cipherText || '').split(':')
  if (parts.length !== 4 || parts[0] !== VERSION) throw new SecretError('Format rahasia tidak dikenali.', 500)
  const [, ivHex, tagHex, dataHex] = parts
  const key = secretKey(env)
  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'))
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
    return Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]).toString('utf8')
  } catch {
    throw new SecretError('Rahasia tidak bisa dibuka (kunci berbeda atau data rusak).', 500)
  }
}

/**
 * Bentuk aman untuk ditampilkan: `1234567890:***…***:abcd`.
 * Token Telegram tidak pernah dikirim utuh setelah disimpan.
 */
export function mask(value) {
  const text = String(value || '')
  if (!text) return ''
  if (text.length <= 8) return '*'.repeat(text.length)
  const head = text.slice(0, Math.min(6, text.indexOf(':') > 0 ? text.indexOf(':') + 1 : 4))
  return `${head}${'*'.repeat(Math.max(6, Math.min(24, text.length - head.length - 4)))}${text.slice(-4)}`
}

/** Buang token dari pesan error sebelum logging/response. */
export function redact(text, secret = '') {
  let out = String(text || '')
  if (secret) out = out.split(secret).join('[REDACTED]')
  return out.replace(/bot\d{5,}:[A-Za-z0-9_-]{20,}/g, 'bot[REDACTED]')
}

/** Hash untuk kode tautan (kode tidak disimpan plaintext). */
export function hashToken(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex')
}

/** Kode tautan manusiawi: UMI-XXXX-XXXX (tanpa karakter ambigu). */
export function linkCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const block = () => Array.from({ length: 4 }, () => alphabet[crypto.randomInt(0, alphabet.length)]).join('')
  return `UMI-${block()}-${block()}`
}

/** Tanda tangan URL media: HMAC(id|exp|userId). */
export function signMedia(id, expiresAt, userId, env = process.env) {
  const key = String(env.PLATFORM_MEDIA_SIGNING_KEY || '') || String(env.PLATFORM_SECRET_KEY || '')
  if (!key) throw new SecretError('Kunci tanda tangan media belum diatur.', 503)
  return crypto.createHmac('sha256', key).update(`${id}|${expiresAt}|${userId}`).digest('base64url').slice(0, 32)
}

export function verifyMedia(id, expiresAt, userId, signature, env = process.env) {
  const expected = signMedia(id, expiresAt, userId, env)
  const given = String(signature || '')
  if (given.length !== expected.length) return false
  return crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected))
}
