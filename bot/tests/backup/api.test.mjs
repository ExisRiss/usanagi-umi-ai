import test from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import { handleBackupApi, authorizedBackupRequest } from '../../lib/backup/api.js'
import { runBackup } from '../../lib/backup/pipeline.js'
import { listBackups } from '../../lib/backup/store.js'
import { makeFixture, config } from './helpers.mjs'

const SECRET = 'rahasia-uji-1234567890'

function makeRequest({ method = 'GET', headers = {}, body = null, url = '/' } = {}) {
  const req = Readable.from(body === null ? [] : [Buffer.from(JSON.stringify(body))])
  req.method = method
  req.headers = headers
  req.url = url
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

async function call(cfg, { path, method = 'GET', headers = {}, body = null }) {
  const url = new URL(`http://localhost${path}`)
  const res = makeResponse()
  await handleBackupApi(
    makeRequest({ method, headers: { 'x-backup-secret': SECRET, ...headers }, body }),
    res,
    url.pathname,
    url.searchParams,
    cfg
  )
  return res
}

test('request tanpa secret ditolak 401', async () => {
  const { root } = await makeFixture()
  const cfg = config(root, { adminSecret: SECRET })
  const res = await call(cfg, { path: '/api/backup-system/status', headers: { 'x-backup-secret': '' } })
  assert.equal(res.statusCode, 401)
})

test('secret yang salah ditolak 401', async () => {
  const { root } = await makeFixture()
  const cfg = config(root, { adminSecret: SECRET })
  const res = await call(cfg, { path: '/api/backup-system/status', headers: { 'x-backup-secret': 'salah' } })
  assert.equal(res.statusCode, 401)
  assert.equal(authorizedBackupRequest({ headers: { 'x-backup-secret': SECRET } }, cfg), true)
})

test('health bisa diakses tanpa secret', async () => {
  const { root } = await makeFixture()
  const cfg = config(root, { adminSecret: SECRET })
  const res = await call(cfg, { path: '/api/backup-system/health', headers: { 'x-backup-secret': '' } })
  assert.equal(res.statusCode, 200)
  assert.equal(res.json.ok, true)
})

test('status mengembalikan data nyata dari server', async () => {
  const { root } = await makeFixture()
  const cfg = config(root, { adminSecret: SECRET })
  const res = await call(cfg, { path: '/api/backup-system/status' })
  assert.equal(res.statusCode, 200)
  const body = res.json
  assert.equal(body.database.ok, true)
  assert.ok(body.database.sqlite.tables >= 1)
  assert.equal(body.scheduler.intervalMinutes, 10)
  assert.ok(Array.isArray(body.checks))
  assert.ok(body.storage.limitBytes > 0)
})

test('POST /backups menjalankan backup dan id bisa dipantau', async () => {
  const { root } = await makeFixture()
  const cfg = config(root, { adminSecret: SECRET })
  const res = await call(cfg, { path: '/api/backup-system/backups', method: 'POST', body: { type: 'full' } })
  assert.equal(res.statusCode, 202)
  const id = res.json.id
  assert.ok(id.startsWith('bk_'))

  // Tunggu sampai pipeline selesai (record dibuat sinkron, status berubah async).
  for (let index = 0; index < 60; index += 1) {
    const record = listBackups(cfg, { limit: 5 }).items.find(row => row.id === id)
    if (record && record.status !== 'running' && record.status !== 'queued') break
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  const status = await call(cfg, { path: `/api/backup-system/backups/${id}/status` })
  assert.equal(status.statusCode, 200)
  assert.equal(status.json.status, 'completed')
  assert.equal(status.json.verifyStatus, 'verified')
})

test('daftar backup mendukung filter dan pagination', async () => {
  const { root } = await makeFixture()
  const cfg = config(root, { adminSecret: SECRET })
  await runBackup(cfg, { reason: 'test' })
  await runBackup(cfg, { reason: 'test' })
  const res = await call(cfg, { path: '/api/backup-system/backups?limit=1&sort=desc' })
  assert.equal(res.statusCode, 200)
  assert.equal(res.json.items.length, 1)
  assert.equal(res.json.total, 2)

  const filtered = await call(cfg, { path: '/api/backup-system/backups?status=failed' })
  assert.equal(filtered.json.total, 0)
})

test('delete tanpa konfirmasi ditolak, dengan konfirmasi berhasil', async () => {
  const { root } = await makeFixture()
  const cfg = config(root, { adminSecret: SECRET })
  const record = await runBackup(cfg, { reason: 'test' })
  const denied = await call(cfg, { path: `/api/backup-system/backups/${record.id}`, method: 'DELETE' })
  assert.equal(denied.statusCode, 400)
  const ok = await call(cfg, { path: `/api/backup-system/backups/${record.id}?confirm=1`, method: 'DELETE' })
  assert.equal(ok.statusCode, 200)
  assert.equal(listBackups(cfg, { limit: 10 }).total, 0)
})

test('interval scheduler tidak valid ditolak', async () => {
  const { root } = await makeFixture()
  const cfg = config(root, { adminSecret: SECRET })
  const res = await call(cfg, { path: '/api/backup-system/scheduler', method: 'PATCH', body: { intervalMinutes: 0 } })
  assert.equal(res.statusCode, 400)
})

test('enable/disable scheduler tersimpan', async () => {
  const { root } = await makeFixture()
  const cfg = config(root, { adminSecret: SECRET })
  const disabled = await call(cfg, { path: '/api/backup-system/scheduler/disable', method: 'POST' })
  assert.equal(disabled.json.enabled, false)
  const enabled = await call(cfg, { path: '/api/backup-system/scheduler/enable', method: 'POST' })
  assert.equal(enabled.json.enabled, true)
})

test('endpoint tidak dikenal mengembalikan 404', async () => {
  const { root } = await makeFixture()
  const cfg = config(root, { adminSecret: SECRET })
  const res = await call(cfg, { path: '/api/backup-system/tidak-ada' })
  assert.equal(res.statusCode, 404)
})

test('log dan audit tidak membocorkan secret', async () => {
  const { root } = await makeFixture()
  const cfg = config(root, { adminSecret: SECRET })
  await runBackup(cfg, { reason: 'test' })
  const res = await call(cfg, { path: '/api/backup-system/logs?limit=50' })
  const text = JSON.stringify(res.json)
  assert.ok(!text.includes(SECRET))
  assert.ok(!text.includes('123:abc'))
})
