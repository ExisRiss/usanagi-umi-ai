/*
 *
 * Enkripsi arsip backup: AES-256-GCM streaming.
 *
 * Format berkas .enc:
 *   magic(8) "UMIBK1\0\0" | versi(1) | kdf(1) | saltLen(1) | salt(N) | iv(12)
 *   | ciphertext... | tag(16)
 *
 * kdf 0 = kunci mentah 32 byte (hex/base64), 1 = scrypt dari passphrase.
 * Tag GCM disimpan di akhir dan diverifikasi saat dekripsi, jadi arsip yang
 * berubah sedikit pun akan ditolak.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import { pipeline } from 'node:stream/promises'

const MAGIC = Buffer.from('UMIBK1\0\0', 'latin1')
const VERSION = 1
const IV_BYTES = 12
const TAG_BYTES = 16
const SALT_BYTES = 16
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }

function parseRawKey(raw) {
  const text = String(raw || '').trim()
  if (!text) return null
  if (/^[0-9a-fA-F]{64}$/.test(text)) return Buffer.from(text, 'hex')
  try {
    const buf = Buffer.from(text, 'base64')
    if (buf.length === 32) return buf
  } catch {}
  return null
}

/** Turunkan kunci 32 byte dari secret; null bila kosong. */
export function deriveKey(secret) {
  if (!secret) return null
  const raw = parseRawKey(secret)
  if (raw) return { key: raw, kdf: 0, salt: Buffer.alloc(0) }
  const salt = crypto.randomBytes(SALT_BYTES)
  const key = crypto.scryptSync(String(secret), salt, 32, SCRYPT_PARAMS)
  return { key, kdf: 1, salt }
}

function keyFromHeader(secret, kdf, salt) {
  if (kdf === 0) {
    const raw = parseRawKey(secret)
    if (!raw) throw new Error('BACKUP_ENCRYPTION_KEY harus 32 byte (hex/base64) untuk arsip ini.')
    return raw
  }
  const raw = parseRawKey(secret)
  if (raw) return raw
  return crypto.scryptSync(String(secret), salt, 32, SCRYPT_PARAMS)
}

/** Enkripsi berkas. Mengembalikan metadata yang aman disimpan di index. */
export async function encryptFile(sourceFile, targetFile, secret) {
  const { key, kdf, salt } = deriveKey(secret)
  if (!key) throw new Error('Kunci enkripsi belum diatur.')
  const iv = crypto.randomBytes(IV_BYTES)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const header = Buffer.concat([
    MAGIC,
    Buffer.from([VERSION, kdf, salt.length]),
    salt,
    iv,
  ])
  const out = fs.createWriteStream(targetFile, { mode: 0o600 })
  out.write(header)
  await pipeline(fs.createReadStream(sourceFile), cipher, out, { end: false })
  const tag = cipher.getAuthTag()
  await new Promise((resolve, reject) => {
    out.end(tag, error => (error ? reject(error) : resolve()))
  })
  return {
    algorithm: 'aes-256-gcm',
    version: VERSION,
    kdf: kdf === 0 ? 'raw-key' : 'scrypt',
    iv: iv.toString('base64'),
    tagBytes: TAG_BYTES,
  }
}

/** Baca header tanpa mendekripsi seluruh berkas. */
export function readHeader(file) {
  const fd = fs.openSync(file, 'r')
  try {
    const buffer = Buffer.alloc(MAGIC.length + 3 + SALT_BYTES + IV_BYTES)
    const read = fs.readSync(fd, buffer, 0, buffer.length, 0)
    if (read < MAGIC.length + 3) throw new Error('Berkas terenkripsi terlalu pendek.')
    if (!buffer.subarray(0, MAGIC.length).equals(MAGIC)) throw new Error('Format enkripsi tidak dikenal.')
    const version = buffer[MAGIC.length]
    const kdf = buffer[MAGIC.length + 1]
    const saltLength = buffer[MAGIC.length + 2]
    if (version !== VERSION) throw new Error(`Versi enkripsi ${version} tidak didukung.`)
    const offset = MAGIC.length + 3
    const salt = buffer.subarray(offset, offset + saltLength)
    const iv = buffer.subarray(offset + saltLength, offset + saltLength + IV_BYTES)
    return { version, kdf, salt, iv, headerBytes: offset + saltLength + IV_BYTES }
  } finally {
    fs.closeSync(fd)
  }
}

/** Dekripsi berkas; gagal (throw) bila tag GCM tidak cocok. */
export async function decryptFile(sourceFile, targetFile, secret) {
  const header = readHeader(sourceFile)
  const key = keyFromHeader(secret, header.kdf, header.salt)
  const stat = fs.statSync(sourceFile)
  const payloadBytes = stat.size - header.headerBytes - TAG_BYTES
  if (payloadBytes < 0) throw new Error('Berkas terenkripsi rusak.')

  const tagFd = fs.openSync(sourceFile, 'r')
  let tag
  try {
    tag = Buffer.alloc(TAG_BYTES)
    fs.readSync(tagFd, tag, 0, TAG_BYTES, stat.size - TAG_BYTES)
  } finally {
    fs.closeSync(tagFd)
  }

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, header.iv)
  decipher.setAuthTag(tag)
  const input = fs.createReadStream(sourceFile, { start: header.headerBytes, end: header.headerBytes + payloadBytes - 1 })
  await pipeline(input, decipher, fs.createWriteStream(targetFile, { mode: 0o600 }))
  return { ok: true, bytes: payloadBytes }
}
