import test from 'node:test'
import assert from 'node:assert/strict'
import { freshDb, env } from './helpers.mjs'
import * as servers from '../../lib/platform/servers.js'
import { listAudit } from '../../lib/platform/audit.js'

const OWNER = { userId: 'web:owner', platform: 'web' }

function stubFetch(handler) {
  const original = globalThis.fetch
  globalThis.fetch = async (url, options) => handler(String(url), options)
  return () => { globalThis.fetch = original }
}

function jsonResponse(body, status = 200) {
  return {
    ok: status < 400,
    status,
    text: async () => JSON.stringify(body),
    json: async () => body,
  }
}

test('10 slot tersedia, semuanya kosong secara default', async () => {
  await freshDb()
  const slots = servers.listSlots()
  assert.equal(slots.length, 10)
  assert.equal(servers.MAX_SERVERS, 10)
  assert.equal(slots.every(slot => slot.configured === false), true)
  assert.equal(servers.isConfigured(slots[0]), false)
})

test('slot 11 ditolak (tidak bisa dibuat maupun dibaca)', async () => {
  await freshDb()
  assert.throws(() => servers.upsertSlot({ slot: 11, enabled: true }, OWNER), /1–10/)
  assert.throws(() => servers.getSlot(11), /1–10/)
  assert.throws(() => servers.upsertSlot({ slot: 0 }, OWNER), /1–10/)
  assert.throws(() => servers.upsertSlot({ slot: 3.5 }, OWNER), /1–10/)
})

test('slot aktif wajib lengkap; slot kosong tidak dikoneksikan', async () => {
  await freshDb()
  assert.throws(() => servers.upsertSlot({ slot: 1, enabled: true }, OWNER), /wajib punya host/)
  const slot = servers.upsertSlot({ slot: 1, enabled: true, name: 'Bot', host: 'https://panel.example', credentialRef: 'PANEL_KEY', panelServerId: 'abc123' }, OWNER)
  assert.equal(slot.configured, true)
  assert.equal(servers.listSlots().filter(item => item.configured).length, 1)

  const empty = await servers.serverStatus(2)
  assert.equal(empty.configured, false)
  assert.equal(empty.online, false)
  assert.equal(empty.status, 'empty')
  await assert.rejects(() => servers.serverAction(2, 'restart', { role: 'owner' }), /Slot server kosong/)
})

test('status memakai panel API nyata (bukan angka karangan)', async () => {
  await freshDb()
  process.env.PANEL_KEY_UJI = 'panel-secret-key'
  servers.upsertSlot({ slot: 1, enabled: true, name: 'Bot 1', host: 'https://panel.example', credentialRef: 'PANEL_KEY_UJI', panelServerId: 'd178bf71' }, OWNER)
  const restore = stubFetch(async (url, options) => {
    assert.match(url, /\/api\/client\/servers\/d178bf71\/resources$/)
    assert.equal(options.headers.Authorization, 'Bearer panel-secret-key')
    return jsonResponse({
      attributes: {
        current_state: 'running',
        limits: { memory: 2048 },
        resources: { cpu_absolute: 12.5, memory_bytes: 512 * 1024 * 1024, disk_bytes: 1024 * 1024 * 1024, uptime: 7200000 },
      },
    })
  })
  try {
    const status = await servers.serverStatus(1)
    assert.equal(status.online, true)
    assert.equal(status.status, 'running')
    assert.equal(status.usage.cpuPercent, 12.5)
    assert.equal(status.usage.memoryBytes, 512 * 1024 * 1024)
    assert.equal(status.source, 'pterodactyl-panel-api')
  } finally { restore(); delete process.env.PANEL_KEY_UJI }
})

test('server 1 offline tidak memblokir server 2 yang online', async () => {
  await freshDb()
  process.env.PANEL_KEY_UJI = 'k'
  servers.upsertSlot({ slot: 1, enabled: true, name: 'Mati', host: 'https://panel.example', credentialRef: 'PANEL_KEY_UJI', panelServerId: 'srv1' }, OWNER)
  servers.upsertSlot({ slot: 2, enabled: true, name: 'Hidup', host: 'https://panel.example', credentialRef: 'PANEL_KEY_UJI', panelServerId: 'srv2' }, OWNER)
  const restore = stubFetch(async (url) => {
    if (url.includes('/srv1/')) throw Object.assign(new Error('connect ECONNREFUSED'), { name: 'FetchError' })
    return jsonResponse({ attributes: { current_state: 'running', resources: { cpu_absolute: 1 } } })
  })
  try {
    const overview = await servers.serverOverview()
    assert.equal(overview.configured, 2)
    assert.equal(overview.servers[0].online, false)
    assert.equal(overview.servers[1].online, true)
  } finally { restore(); delete process.env.PANEL_KEY_UJI }
})

test('aksi kontrol memakai allowlist dan izin role', async () => {
  await freshDb()
  process.env.PANEL_KEY_UJI = 'k'
  servers.upsertSlot({ slot: 1, enabled: true, name: 'Bot', host: 'https://panel.example', credentialRef: 'PANEL_KEY_UJI', panelServerId: 'srv1' }, OWNER)
  const calls = []
  const restore = stubFetch(async (url, options) => {
    calls.push({ url, options })
    return jsonResponse({})
  })
  try {
    await assert.rejects(() => servers.serverAction(1, 'exec', { role: 'owner' }), /Aksi tidak diizinkan/)
    await assert.rejects(() => servers.serverAction(1, 'restart', { role: 'admin' }), /Akses ditolak/)
    await assert.rejects(() => servers.serverAction(1, 'logs', { role: 'user' }), /Akses ditolak/)
    const result = await servers.serverAction(1, 'restart', { role: 'developer', actor: { userId: 'web:dev' } })
    assert.equal(result.httpStatus, 200)
    assert.match(calls.at(-1).url, /\/power$/)
    assert.equal(JSON.parse(calls.at(-1).options.body).signal, 'restart')
    assert.equal(listAudit({ action: 'server.restart' }).total, 1)
  } finally { restore(); delete process.env.PANEL_KEY_UJI }
})

test('kredensial tidak boleh dari nama aneh dan host wajib HTTPS', async () => {
  await freshDb()
  assert.throws(() => servers.resolveCredential('../etc/passwd'), /nama variabel env/)
  assert.throws(() => servers.resolveCredential('lowercase'), /nama variabel env/)
  servers.upsertSlot({ slot: 3, enabled: true, name: 'X', host: 'http://panel.example', credentialRef: 'PANEL_KEY_UJI', panelServerId: 'srv3' }, OWNER)
  process.env.PANEL_KEY_UJI = 'k'
  const restore = stubFetch(async () => jsonResponse({}))
  try {
    const status = await servers.serverStatus(3)
    assert.equal(status.online, false)
    assert.match(status.message, /HTTPS/)
  } finally { restore(); delete process.env.PANEL_KEY_UJI }
})

test('hapus slot menghapus konfigurasi dan mencatat audit', async () => {
  await freshDb()
  servers.upsertSlot({ slot: 5, enabled: true, name: 'Hapus', host: 'https://p.example', credentialRef: 'PANEL_KEY_UJI', panelServerId: 'srv5' }, OWNER)
  servers.deleteSlot(5, OWNER)
  assert.equal(servers.getSlot(5).configured, false)
  assert.equal(servers.listSlots().filter(item => item.configured).length, 0)
  assert.equal(listAudit({ action: 'server.slot.delete' }).total, 1)
  assert.throws(() => servers.deleteSlot(5, OWNER), /belum dikonfigurasi/)
})
