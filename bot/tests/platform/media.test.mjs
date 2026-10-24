import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { freshDb, env, tempDir, applyTestEnv } from './helpers.mjs'
import * as media from '../../lib/platform/media.js'
import { listAudit } from '../../lib/platform/audit.js'

applyTestEnv()

const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(64, 1),
])
const PDF = Buffer.concat([Buffer.from('%PDF-1.7\n'), Buffer.alloc(64, 2)])

function configureMediaDir() {
  const dir = tempDir('umi-media-')
  process.env.PLATFORM_MEDIA_DIR = dir
  return dir
}

test('deteksi MIME dari isi berkas, bukan nama', async () => {
  await freshDb()
  assert.equal(media.sniff(PNG).mime, 'image/png')
  assert.equal(media.sniff(PDF).mime, 'application/pdf')
  assert.equal(media.sniff(Buffer.from('bukan berkas biner sama sekali')), null)
})

test('upload gambar berhasil dan URL bertanda tangan bisa diunduh', async () => {
  await freshDb()
  configureMediaDir()
  const stored = media.storeMedia(PNG, { userId: 'web:u1', name: '../../evil.png' })
  assert.equal(stored.mime, 'image/png')
  assert.equal(stored.bytes, PNG.length)
  const url = media.mediaUrl(stored.id, { baseUrl: 'https://api.example', userId: 'web:u1' })
  assert.match(url, /^https:\/\/api\.example\/api\/platform-system\/media\/[a-f0-9]{24}\?e=\d+&u=/)
  const parsed = new URL(url)
  const resolved = media.resolveSigned(stored.id, {
    expiresAt: parsed.searchParams.get('e'),
    userId: parsed.searchParams.get('u'),
    signature: parsed.searchParams.get('s'),
  })
  assert.equal(fs.readFileSync(resolved.file).length, PNG.length)
  // Nama objek acak tidak membocorkan nama asli.
  assert.equal(resolved.row.path.includes('evil'), false)
  assert.equal(listAudit({ action: 'media.upload' }).total, 1)
})

test('URL tanpa tanda tangan / tanda tangan salah / kedaluwarsa ditolak', async () => {
  await freshDb()
  configureMediaDir()
  const stored = media.storeMedia(PNG, { userId: 'web:u1' })
  const url = new URL(media.mediaUrl(stored.id, { userId: 'web:u1', baseUrl: 'https://api.example' }))
  assert.throws(() => media.resolveSigned(stored.id, {
    expiresAt: url.searchParams.get('e'), userId: 'web:u1', signature: 'salah',
  }), /Tanda tangan/)
  assert.throws(() => media.resolveSigned(stored.id, {
    expiresAt: String(Date.now() - 1000), userId: 'web:u1', signature: url.searchParams.get('s'),
  }), /kedaluwarsa/)
  assert.throws(() => media.resolveSigned(stored.id, {
    expiresAt: url.searchParams.get('e'), userId: 'web:lain', signature: url.searchParams.get('s'),
  }), /Tanda tangan/)
  assert.throws(() => media.resolveSigned('0'.repeat(24), { expiresAt: String(Date.now() + 1000), userId: 'web:u1', signature: 'x' }), /tidak ditemukan/)
})

test('format tidak dikenal ditolak 415 dan berkas kebesaran ditolak 413', async () => {
  await freshDb()
  configureMediaDir()
  assert.throws(() => media.storeMedia(Buffer.from('teks biasa yang tidak dikenali'), { userId: 'web:u1' }), error => error.status === 415)
  const big = Buffer.concat([PNG, Buffer.alloc(media.MAX_BYTES.image)])
  assert.throws(() => media.storeMedia(big, { userId: 'web:u1' }), error => error.status === 413)
})

test('hapus media: pemilik boleh, orang lain tidak, admin boleh', async () => {
  await freshDb()
  configureMediaDir()
  const stored = media.storeMedia(PNG, { userId: 'web:u1' })
  assert.throws(() => media.deleteMedia(stored.id, { userId: 'web:u2', role: 'user' }), error => error.status === 403)
  media.deleteMedia(stored.id, { userId: 'web:u2', role: 'admin' })
  assert.throws(() => media.resolveSigned(stored.id, {
    expiresAt: String(Date.now() + 60000), userId: 'web:u1', signature: 'x',
  }), /tidak ditemukan/)
})

test('prune menghapus media kedaluwarsa dari disk', async () => {
  const db = await freshDb()
  const dir = configureMediaDir()
  const stored = media.storeMedia(PNG, { userId: 'web:u1', ttlMs: 60000 })
  db.prepare('UPDATE platform_media SET expires_at = ? WHERE id = ?').run(Date.now() - 1000, stored.id)
  const removed = media.pruneExpired()
  assert.equal(removed, 1)
  assert.equal(fs.readdirSync(dir).length, 0)
})
