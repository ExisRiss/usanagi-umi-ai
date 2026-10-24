import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import { handleBackupApi } from '../../lib/backup/api.js'
import { runBackup } from '../../lib/backup/pipeline.js'
import { listBackups, removeBackupRecord } from '../../lib/backup/store.js'
import { createRestore } from '../../lib/backup/restore.js'
import { makeFixture, config } from './helpers.mjs'

const SECRET = 'rahasia-uji-upload-123456'

function rawRequest(buffer, { method = 'POST', headers = {} } = {}) {
  const req = Readable.from([buffer])
  req.method = method
  req.headers = {
    'x-backup-secret': SECRET,
    'content-type': 'application/gzip',
    'content-length': String(buffer.length),
    ...headers,
  }
  req.url = '/'
  return req
}

function makeResponse() {
  const res = {
    statusCode: 0,
    headers: {},
    chunks: [],
    writeHead(status, headers = {}) {
      this.statusCode = status
      this.headers = headers
      return this
    },
    end(chunk) {
      if (chunk) this.chunks.push(Buffer.from(chunk))
    },
    write(chunk) {
      if (chunk) this.chunks.push(Buffer.from(chunk))
    },
    get body() {
      return Buffer.concat(this.chunks).toString('utf8')
    },
    get json() {
      try { return JSON.parse(this.body) } catch { return null }
    },
  }
  return res
}

async function upload(cfg, buffer) {
  const res = makeResponse()
  await handleBackupApi(rawRequest(buffer), res, '/api/backup-system/backups/upload', new URLSearchParams(), cfg)
  return res
}

test('unggah arsip polos diterima dan tercatat verified', async () => {
  const { root } = await makeFixture()
  const cfg = config(root, { adminSecret: SECRET })
  const made = await runBackup(cfg, { reason: 'test' })
  const bytes = fs.readFileSync(path.join(cfg.root, made.storagePath))
  // Simulasikan arsip dari server lain: berkasnya ada, catatannya tidak.
  removeBackupRecord(cfg, made.id)

  const res = await upload(cfg, bytes)
  assert.equal(res.statusCode, 201)
  const record = res.json.backup
  assert.equal(record.encrypted, false)
  assert.equal(record.verifyStatus, 'verified')
  assert.equal(record.sizeBytes, bytes.length)
  assert.equal(fs.existsSync(path.join(cfg.root, record.storagePath)), true)
  // Arsip baru (belum terdaftar) memakai identitas aslinya supaya bisa direstore.
  assert.equal(record.id, made.id)
  assert.equal(listBackups(cfg, { limit: 10 }).total, 1)
})

test('unggah arsip terenkripsi diterima, disimpan .enc, dan bisa di-restore', async () => {
  const { root } = await makeFixture()
  const cfg = config(root, {
    adminSecret: SECRET,
    encryption: { enabled: true, key: 'b'.repeat(64), algorithm: 'aes-256-gcm' },
  })
  const made = await runBackup(cfg, { reason: 'test' })
  removeBackupRecord(cfg, made.id)
  const encPath = path.join(cfg.root, `${made.storagePath}.enc`)
  const source = fs.existsSync(encPath) ? encPath : path.join(cfg.root, made.storagePath)
  assert.equal(source.endsWith('.enc'), true, 'backup dengan enkripsi harus berakhiran .enc')
  const bytes = fs.readFileSync(source)

  const res = await upload(cfg, bytes)
  assert.equal(res.statusCode, 201, res.body)
  const record = res.json.backup
  assert.equal(record.encrypted, true)
  assert.equal(record.storagePath.endsWith('.enc'), true)
  assert.equal(record.sizeBytes, bytes.length)

  // Arsip hasil unggahan harus bisa direncanakan untuk restore (berarti
  // dekripsi + manifest + checksum lolos verifikasi).
  const plan = await createRestore(cfg, { backupId: record.id, dryRun: true, actor: 'test' })
  assert.equal(plan.dryRun, true)
  assert.equal(plan.verifiedFiles, plan.files)
  assert.ok(plan.files > 0)
})

test('unggah ulang arsip yang sudah terdaftar tidak menimpa catatan lama', async () => {
  const { root } = await makeFixture()
  const cfg = config(root, { adminSecret: SECRET })
  const made = await runBackup(cfg, { reason: 'scheduled' })
  const bytes = fs.readFileSync(path.join(cfg.root, made.storagePath))

  const first = await upload(cfg, bytes)
  assert.equal(first.statusCode, 201)
  assert.notEqual(first.json.backup.id, made.id, 'id asli sudah dipakai, unggahan dapat id baru')
  assert.equal(first.json.backup.manifestId, made.id)

  const second = await upload(cfg, bytes)
  assert.equal(second.statusCode, 201)
  const copy = second.json.backup
  assert.notEqual(copy.id, made.id)
  assert.notEqual(copy.id, first.json.backup.id)
  assert.equal(copy.manifestId, made.id)

  // Catatan asli tetap utuh.
  const original = listBackups(cfg, { limit: 10 }).items.find(row => row.id === made.id)
  assert.equal(original.storagePath, made.storagePath)
  assert.equal(original.reason, 'scheduled')
  assert.equal(original.status, 'completed')
  // Kedua unggahan tetap bisa direstore walau manifest.id != id catatan.
  for (const id of [first.json.backup.id, copy.id]) {
    const plan = await createRestore(cfg, { backupId: id, dryRun: true, actor: 'test' })
    assert.equal(plan.dryRun, true)
    assert.equal(plan.verifiedFiles, plan.files)
  }
  assert.equal(listBackups(cfg, { limit: 10 }).total, 3)
})

test('unggah berkas bukan arsip backup ditolak 400 dan tidak meninggalkan sisa', async () => {
  const { root } = await makeFixture()
  const cfg = config(root, { adminSecret: SECRET })
  const res = await upload(cfg, Buffer.from('bukan tar.gz sama sekali'))
  assert.equal(res.statusCode, 400)
  assert.equal(listBackups(cfg, { limit: 10 }).total, 0)
  const archives = fs.readdirSync(cfg.root ? path.join(cfg.root, 'archives') : root).filter(name => name.includes('upload'))
  assert.deepEqual(archives, [])
})
