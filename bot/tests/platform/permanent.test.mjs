/**
 * Media permanen (to-URL) + sinkronisasi role dari environment + pencatatan chat.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { freshDb, applyTestEnv, env, tempDir } from './helpers.mjs'
import * as media from '../../lib/platform/media.js'
import { resolveContext, getUser } from '../../lib/platform/identity.js'
import { recordChat, listChats, findChatByTitle } from '../../lib/platform/chats.js'
import { platformDb } from '../../lib/platform/db.js'

applyTestEnv()

const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(64, 9)])

test('to-URL menyimpan permanen: expires_at NULL dan tautan e=0 tetap valid', async () => {
  await freshDb()
  process.env.PLATFORM_MEDIA_DIR = tempDir('umi-media-perm-')
  const stored = media.storeMedia(PNG, { userId: 'web:u1', platform: 'telegram', name: 'foto.png', permanent: true })
  assert.equal(stored.expiresAt, null, 'tidak ada masa kedaluwarsa')

  const row = platformDb().prepare('SELECT expires_at FROM platform_media WHERE id = ?').get(stored.id)
  assert.equal(row.expires_at, null)

  const url = new URL(media.mediaUrl(stored.id, { baseUrl: 'https://api.example', userId: 'web:u1', permanent: true }))
  assert.equal(url.searchParams.get('e'), '0', 'tautan permanen memakai e=0')

  // Valid setahun kemudian: permanen tidak boleh mati oleh waktu.
  const later = Date.now() + 365 * 24 * 60 * 60 * 1000
  const resolved = media.resolveSigned(stored.id, {
    expiresAt: url.searchParams.get('e'),
    userId: url.searchParams.get('u'),
    signature: url.searchParams.get('s'),
    now: later,
  })
  assert.equal(resolved.row.id, stored.id)
})

test('tautan permanen tetap menolak tanda tangan salah dan media terhapus', async () => {
  await freshDb()
  process.env.PLATFORM_MEDIA_DIR = tempDir('umi-media-perm2-')
  const stored = media.storeMedia(PNG, { userId: 'web:u2', permanent: true })
  const url = new URL(media.mediaUrl(stored.id, { baseUrl: 'https://api.example', userId: 'web:u2', permanent: true }))

  assert.throws(() => media.resolveSigned(stored.id, {
    expiresAt: '0', userId: 'web:u2', signature: 'x'.repeat(32),
  }), /tidak valid/)

  assert.throws(() => media.resolveSigned(stored.id, {
    expiresAt: '0', userId: 'web:lain', signature: url.searchParams.get('s'),
  }), /tidak valid/)

  media.deleteMedia(stored.id, { userId: 'web:u2', role: 'user' })
  assert.throws(() => media.resolveSigned(stored.id, {
    expiresAt: '0', userId: 'web:u2', signature: url.searchParams.get('s'),
  }), /tidak ditemukan/)
})

test('prune harian tidak menghapus media permanen', async () => {
  await freshDb()
  process.env.PLATFORM_MEDIA_DIR = tempDir('umi-media-perm3-')
  const permanent = media.storeMedia(PNG, { userId: 'web:u3', permanent: true })
  const temporary = media.storeMedia(PNG, { userId: 'web:u3', ttlMs: 60000 })
  const removed = media.pruneExpired(Date.now() + 2 * 24 * 60 * 60 * 1000)
  assert.equal(removed, 1, 'hanya media sementara yang dibersihkan')
  assert.ok(platformDb().prepare('SELECT 1 FROM platform_media WHERE id = ? AND deleted_at IS NULL').get(permanent.id))
  assert.equal(platformDb().prepare('SELECT deleted_at FROM platform_media WHERE id = ?').get(temporary.id).deleted_at > 0, true)
})

test('daftar media menandai permanen dengan benar', async () => {
  await freshDb()
  process.env.PLATFORM_MEDIA_DIR = tempDir('umi-media-perm4-')
  media.storeMedia(PNG, { userId: 'web:u4', permanent: true })
  media.storeMedia(PNG, { userId: 'web:u4', ttlMs: 7 * 24 * 60 * 60 * 1000 })
  const items = media.listMedia({ userId: 'web:u4' })
  assert.equal(items.filter(item => item.permanent).length, 1)
  assert.equal(items.filter(item => !item.permanent).length, 1)
})

test('ID di TELEGRAM_OWNER_IDS menaikkan role user lama menjadi owner', async () => {
  await freshDb()
  const first = resolveContext({ platform: 'telegram', platformUserId: '100000001', env: env() })
  assert.equal(first.role, 'user')
  const upgraded = resolveContext({ platform: 'telegram', platformUserId: '100000001', env: env({ TELEGRAM_OWNER_IDS: '100000001,100000002' }) })
  assert.equal(upgraded.role, 'owner')
  assert.equal(getUser(first.userId).role, 'owner', 'role tersimpan ikut naik')
  const second = resolveContext({ platform: 'telegram', platformUserId: '100000002', env: env({ TELEGRAM_OWNER_IDS: '100000001,100000002' }) })
  assert.equal(second.role, 'owner')
})

test('role dari env tidak menurunkan owner yang sudah ada', async () => {
  await freshDb()
  const a = resolveContext({ platform: 'telegram', platformUserId: '6006', env: env({ TELEGRAM_OWNER_IDS: '6006' }) })
  assert.equal(a.role, 'owner')
  const b = resolveContext({ platform: 'telegram', platformUserId: '6006', env: env() })
  assert.equal(b.role, 'owner', 'menghapus dari env tidak menurunkan role tersimpan')
})

test('chat grup dicatat dan bisa dicari berdasarkan judul', async () => {
  await freshDb()
  recordChat({ id: -1001234567890, type: 'supergroup', title: 'BackUp' })
  recordChat({ id: 100000001, type: 'private', title: null, username: 'akun' })
  const groups = listChats({ type: 'supergroup' })
  assert.equal(groups.length, 1)
  assert.equal(groups[0].chatId, '-1001234567890')
  assert.equal(groups[0].isGroup, true)
  const found = findChatByTitle('backup')
  assert.equal(found.chatId, '-1001234567890')
  assert.equal(findChatByTitle('tidak-ada'), null)
})

test('recordChat idempoten dan memperbarui judul', async () => {
  await freshDb()
  recordChat({ id: -1009999999999, type: 'group', title: 'Lama' })
  recordChat({ id: -1009999999999, type: 'group', title: 'BackUp' })
  const rows = listChats()
  assert.equal(rows.length, 1)
  assert.equal(rows[0].title, 'BackUp')
})
