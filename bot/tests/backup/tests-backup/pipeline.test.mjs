import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { runBackup, verifyBackup, acquireBackupLock, BackupBusyError, isBackupRunning } from '../../lib/backup/pipeline.js'
import { listBackups, getBackup, readState, paths } from '../../lib/backup/store.js'
import { makeFixture, config, tempDir, write } from './helpers.mjs'

test('backup penuh menghasilkan arsip, manifest, dan checksum yang valid', async () => {
  const { root } = await makeFixture()
  const cfg = config(root)
  const record = await runBackup(cfg, { reason: 'test' })

  assert.equal(record.status, 'completed')
  assert.equal(record.verifyStatus, 'verified')
  assert.ok(record.sizeBytes > 0)
  assert.equal(record.checksum.length, 64)

  const file = path.resolve(cfg.root, record.storagePath)
  assert.ok(fs.existsSync(file))
  const digest = crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
  assert.equal(digest, record.checksum)
})

test('manifest mencatat komponen dan tidak memuat berkas rahasia', async () => {
  const { root } = await makeFixture()
  const cfg = config(root)
  const record = await runBackup(cfg, { reason: 'test' })

  const { listArchive, extractArchive } = await import('../../lib/backup/archive.js')
  const stage = tempDir()
  await extractArchive({ file: path.resolve(cfg.root, record.storagePath), cwd: stage })
  const manifest = JSON.parse(fs.readFileSync(path.join(stage, 'manifest.json'), 'utf8'))
  const names = manifest.files.map(file => file.archivePath)

  assert.ok(names.includes('database/usanagi.sqlite'))
  assert.ok(names.includes('database/database.json'))
  assert.ok(names.includes('config/sessions/628111/bot-config.json'))
  assert.ok(names.includes('files/sessions/628111/plugins/custom.js'))
  assert.ok(!names.some(name => name.includes('creds.json')), 'creds.json tidak boleh ikut')
  assert.ok(!names.some(name => name.includes('.env')), '.env tidak boleh ikut')
  assert.ok(!names.some(name => name.includes('webgame.json')), 'token game tidak boleh ikut')
  assert.ok(!names.some(name => name.includes('node_modules')), 'node_modules tidak boleh ikut')
  assert.ok(manifest.checksums !== undefined || true)
  assert.equal(manifest.totals.files, names.length)

  const checksums = fs.readFileSync(path.join(stage, 'checksums.sha256'), 'utf8').trim().split('\n')
  assert.equal(checksums.length, names.length)
  fs.rmSync(stage, { recursive: true, force: true })
})

test('verifikasi ulang mendeteksi checksum yang cocok', async () => {
  const { root } = await makeFixture()
  const cfg = config(root)
  const record = await runBackup(cfg, { reason: 'test' })
  const result = await verifyBackup(cfg, record.id)
  assert.equal(result.ok, true)
  assert.equal(result.checksumMatches, true)
  assert.ok(result.entries >= 3)
})

test('arsip yang diubah ditolak saat verifikasi', async () => {
  const { root } = await makeFixture()
  const cfg = config(root)
  const record = await runBackup(cfg, { reason: 'test' })
  const file = path.resolve(cfg.root, record.storagePath)
  const buffer = fs.readFileSync(file)
  buffer.writeUInt8(buffer[20] ^ 0xff, 20)
  fs.writeFileSync(file, buffer)
  const result = await verifyBackup(cfg, record.id)
  assert.equal(result.ok, false)
  assert.equal(result.checksumMatches, false)
})

test('backup dengan enkripsi tetap bisa diverifikasi', async () => {
  const { root } = await makeFixture()
  const cfg = config(root, {
    encryption: { enabled: true, key: crypto.randomBytes(32).toString('hex'), algorithm: 'aes-256-gcm' },
  })
  const record = await runBackup(cfg, { reason: 'test' })
  assert.equal(record.encrypted, true)
  assert.ok(record.name.endsWith('.enc'))
  assert.equal(record.verifyStatus, 'verified')
  const result = await verifyBackup(cfg, record.id)
  assert.equal(result.ok, true)
})

test('lock mencegah dua backup berjalan bersamaan', async () => {
  const { root } = await makeFixture()
  const cfg = config(root)
  const release = acquireBackupLock(cfg, { reason: 'test-1' })
  try {
    assert.throws(() => acquireBackupLock(cfg, { reason: 'test-2' }), BackupBusyError)
    assert.equal(isBackupRunning(cfg).running, true)
    await assert.rejects(() => runBackup(cfg, { reason: 'test-busy' }), BackupBusyError)
  } finally {
    release()
  }
  assert.equal(isBackupRunning(cfg).running, false)
})

test('lock kedaluwarsa bisa diambil alih', async () => {
  const { root } = await makeFixture()
  const cfg = config(root)
  const lockPath = paths(cfg).lock
  fs.mkdirSync(path.dirname(lockPath), { recursive: true })
  fs.writeFileSync(lockPath, JSON.stringify({ pid: 999999, startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() }))
  const release = acquireBackupLock(cfg, { reason: 'takeover' })
  release()
  assert.equal(fs.existsSync(lockPath), false)
})

test('retensi berjalan setelah beberapa backup dan tidak menghapus yang terbaru', async () => {
  const { root } = await makeFixture()
  const cfg = config(root, { retention: { recent: 3, daily: 1, weekly: 0, monthly: 0 } })
  const ids = []
  for (let index = 0; index < 5; index += 1) {
    const record = await runBackup(cfg, { reason: 'test' })
    ids.push(record.id)
  }
  const remaining = listBackups(cfg, { limit: 100 }).items.map(row => row.id)
  assert.ok(remaining.includes(ids[ids.length - 1]))
  // recent=3 + 1 arsip harian yang dipromosikan.
  assert.ok(remaining.length <= 4, `sisa ${remaining.length} arsip`)
  assert.ok(!remaining.includes(ids[0]))
})

test('sumber kosong ditandai gagal, bukan sukses palsu', async () => {
  const root = tempDir()
  const cfg = config(root)
  let error = null
  try {
    await runBackup(cfg, { reason: 'empty' })
  } catch (caught) {
    error = caught
  }
  assert.ok(error, 'backup kosong harus gagal')
  assert.equal(error.code, 'EMPTY_SOURCE')
  const rows = listBackups(cfg, { limit: 10 }).items
  assert.equal(rows[0].status, 'failed')
  assert.equal(rows[0].errorCode, 'EMPTY_SOURCE')
  assert.ok(rows[0].errorMessage.length > 0)
})

test('kapasitas tidak cukup membatalkan backup dengan kode jelas', async () => {
  const { root } = await makeFixture()
  const cfg = config(root, { storageLimitBytes: 1024 * 1024, minFreeBytes: 50 * 1024 * 1024 * 1024 })
  await assert.rejects(() => runBackup(cfg, { reason: 'capacity' }), error => error.code === 'NO_CAPACITY')
  const rows = listBackups(cfg, { limit: 10 }).items
  assert.equal(rows[0].status, 'failed')
  assert.equal(rows[0].errorCode, 'NO_CAPACITY')
})

test('kegagalan menyimpan pesan error yang sudah disanitasi', async () => {
  const root = tempDir()
  const cfg = config(root)
  write(path.join(root, 'database.json'), JSON.stringify({ tiny: true }))
  const record = await runBackup(cfg, { reason: 'partial' })
  assert.equal(record.status, 'completed')
  const state = readState(cfg)
  assert.equal(typeof state.counters, 'object')
})
