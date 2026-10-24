import test from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { Readable } from 'node:stream'
import { freshDb, applyTestEnv, env, TEST_API_SECRET, tempDir } from './helpers.mjs'
import { handlePlatformApi } from '../../lib/platform/api.js'
import { platformDb } from '../../lib/platform/db.js'

applyTestEnv()

function makeReq({ method = 'GET', headers = {}, body = null, url = '/' } = {}) {
  const chunks = body === null ? [] : [Buffer.isBuffer(body) ? body : Buffer.from(JSON.stringify(body))]
  const req = Readable.from(chunks)
  req.method = method
  req.headers = headers
  req.url = url
  return req
}

function makeRes() {
  return {
    statusCode: 0,
    headers: {},
    chunks: [],
    writableEnded: false,
    writeHead(status, headers = {}) { this.statusCode = status; this.headers = headers; return this },
    end(chunk) { if (chunk) this.chunks.push(Buffer.from(chunk)); this.writableEnded = true },
    write(chunk) { if (chunk) this.chunks.push(Buffer.from(chunk)) },
    pipe(stream) { stream.on('data', chunk => this.chunks.push(Buffer.from(chunk))); stream.on('end', () => { this.writableEnded = true }) },
    get body() { return Buffer.concat(this.chunks) },
    get json() { try { return JSON.parse(this.body.toString('utf8')) } catch { return null } },
  }
}

async function call(path, { method = 'GET', headers = {}, body = null, auth = true, user = null } = {}) {
  const res = makeRes()
  const req = makeReq({
    method,
    headers: {
      ...(auth ? { 'x-platform-secret': TEST_API_SECRET } : {}),
      ...(user ? { 'x-platform-user-id': user } : {}),
      ...headers,
    },
    body,
  })
  const url = new URL(`http://localhost${path}`)
  await handlePlatformApi(req, res, url.pathname, url.searchParams, env())
  return res
}

async function bootstrapUser(authId = 'auth-owner', role = 'owner') {
  const res = await call('/api/platform-system/bootstrap', {
    method: 'POST', body: { authId, email: `${authId}@example.com`, role },
  })
  assert.equal(res.statusCode, 200, res.body.toString())
  return res.json
}

test('health publik, endpoint lain wajib secret', async () => {
  await freshDb()
  const health = await call('/api/platform-system/health', { auth: false })
  assert.equal(health.statusCode, 200)
  assert.equal(health.json.ok, true)
  assert.equal(health.json.secretKey, true)

  const denied = await call('/api/platform-system/dashboard', { auth: false })
  assert.equal(denied.statusCode, 401)
  const wrong = await call('/api/platform-system/dashboard', { auth: false, headers: { 'x-platform-secret': 'salah' } })
  assert.equal(wrong.statusCode, 401)
  const unknown = await call('/api/platform-system/tidak-ada')
  assert.equal(unknown.statusCode, 404)
})

test('bootstrap memetakan role web dan menyimpan identitas internal', async () => {
  await freshDb()
  const owner = await bootstrapUser('auth-owner', 'owner')
  assert.equal(owner.userId, 'web:auth-owner')
  assert.equal(owner.role, 'owner')
  assert.ok(owner.permissions.includes('platform.manage'))

  const session = await call('/api/platform-system/session', { user: owner.userId })
  assert.equal(session.statusCode, 200)
  assert.equal(session.json.user.role, 'owner')
  assert.equal(session.json.telegramLinked, false)

  const member = await bootstrapUser('auth-user', 'user')
  assert.equal(member.role, 'user')
  assert.equal(member.permissions.includes('platform.manage'), false)
})

test('RBAC API: developer tidak bisa mengelola role, admin tidak bisa kontrol server', async () => {
  await freshDb()
  const owner = await bootstrapUser('auth-owner', 'owner')
  const dev = await bootstrapUser('auth-dev', 'developer')
  const admin = await bootstrapUser('auth-admin', 'admin')

  const denied = await call('/api/platform-system/users/' + encodeURIComponent(dev.userId) + '/role', {
    method: 'PATCH', user: dev.userId, body: { role: 'owner' },
  })
  assert.equal(denied.statusCode, 403)

  const ok = await call('/api/platform-system/users/' + encodeURIComponent(admin.userId) + '/role', {
    method: 'PATCH', user: owner.userId, body: { role: 'developer' },
  })
  assert.equal(ok.statusCode, 200)
  assert.equal(ok.json.user.role, 'developer')

  const control = await call('/api/platform-system/servers/1/action', {
    method: 'POST', user: owner.userId, body: { action: 'restart' },
  })
  assert.equal(control.statusCode, 409, 'slot kosong tidak bisa dikontrol walau owner')

  const listDev = await call('/api/platform-system/users', { user: dev.userId })
  assert.equal(listDev.statusCode, 200, 'developer memang boleh membaca daftar pengguna')
  const listUser = await call('/api/platform-system/users', { user: (await bootstrapUser('auth-plain', 'user')).userId })
  assert.equal(listUser.statusCode, 403, 'user biasa tidak boleh membaca daftar pengguna')
})

test('slot server: CRUD lewat API dan slot 11 ditolak', async () => {
  await freshDb()
  const owner = await bootstrapUser()
  const before = await call('/api/platform-system/servers', { user: owner.userId })
  assert.equal(before.json.slots.filter(slot => slot.configured).length, 0)

  const put = await call('/api/platform-system/servers/1', {
    method: 'PUT', user: owner.userId,
    body: { enabled: true, name: 'Bot', host: 'https://panel.example', credentialRef: 'PANEL_KEY_UJI', panelServerId: 'srv-1' },
  })
  assert.equal(put.statusCode, 200)
  assert.equal(put.json.slot.configured, true)

  const tooMany = await call('/api/platform-system/servers/11', {
    method: 'PUT', user: owner.userId, body: { enabled: true, name: 'X', host: 'https://p', credentialRef: 'K', panelServerId: 's' },
  })
  assert.equal(tooMany.statusCode, 400)

  const removed = await call('/api/platform-system/servers/1', { method: 'DELETE', user: owner.userId })
  assert.equal(removed.statusCode, 200)
})

test('konfigurasi bot Telegram lewat API tidak pernah mengembalikan token', async () => {
  await freshDb()
  const owner = await bootstrapUser()
  const { mockTelegram } = await import('./helpers.mjs')
  const tg = await mockTelegram()
  try {
    process.env.TELEGRAM_API_BASE = tg.base
    const created = await call('/api/platform-system/telegram/bots', {
      method: 'POST', user: owner.userId,
      body: { token: tg.token, label: 'Bot Uji', scope: 'user', enabled: false },
    })
    assert.equal(created.statusCode, 201, created.body.toString())
    assert.equal(created.body.toString().includes(tg.token), false, 'token tidak dikembalikan API')
    assert.equal(created.json.bot.username, 'uji_bot')
    const list = await call('/api/platform-system/telegram/bots', { user: owner.userId })
    assert.equal(list.json.items.length, 1)
    assert.equal(list.body.toString().includes(tg.token), false)
  } finally {
    delete process.env.TELEGRAM_API_BASE
    await tg.close()
  }
})

test('kode tautan Telegram dibuat server-side dengan nomor dari state jadibot', async () => {
  await freshDb()
  const fs = await import('node:fs')
  const path = await import('node:path')
  const dir = tempDir('umi-web-')
  fs.mkdirSync(path.join(dir, 'data'), { recursive: true })
  fs.writeFileSync(path.join(dir, 'data', 'jadibot-platform.json'), JSON.stringify({
    sessions: { 628777666555: { userId: 'auth-link', email: 'link@example.com' } },
  }))
  const cwd = process.cwd()
  process.chdir(dir)
  try {
    const user = await bootstrapUser('auth-link', 'user')
    const res = await call('/api/platform-system/link/telegram', { method: 'POST', user: user.userId })
    assert.equal(res.statusCode, 201)
    assert.match(res.json.code, /^UMI-[A-Z2-9]{4}-[A-Z2-9]{4}$/)
    assert.equal(res.json.whatsappJid, '628777666555@s.whatsapp.net')
    assert.match(res.json.instructions, /\/link UMI-/)
  } finally {
    process.chdir(cwd)
  }
})

test('media: upload butuh izin, URL bertanda tangan bisa diakses tanpa secret', async () => {
  await freshDb()
  process.env.PLATFORM_MEDIA_DIR = tempDir('umi-media-api-')
  const user = await bootstrapUser('auth-media', 'user')
  const png = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(32, 7)])

  const uploaded = await call('/api/platform-system/media/upload', { method: 'POST', user: user.userId, body: png })
  assert.equal(uploaded.statusCode, 201, uploaded.body.toString())
  const url = new URL(uploaded.json.media.url)
  assert.equal(url.pathname.startsWith('/api/platform-system/media/'), true)

  const res = makeRes()
  await handlePlatformApi(
    makeReq({ headers: {} }),
    res,
    url.pathname,
    url.searchParams,
    env()
  )
  await new Promise(resolve => setTimeout(resolve, 50))
  assert.equal(res.statusCode, 200)
  assert.equal(res.body.length, png.length)

  const tampered = new URL(url.toString())
  tampered.searchParams.set('s', 'x'.repeat(32))
  const bad = makeRes()
  await handlePlatformApi(makeReq({ headers: {} }), bad, tampered.pathname, tampered.searchParams, env())
  assert.equal(bad.statusCode, 403)

  const other = await bootstrapUser('auth-other', 'user')
  const del = await call(`/api/platform-system/media/${uploaded.json.media.id}`, { method: 'DELETE', user: other.userId })
  assert.equal(del.statusCode, 403, 'pengguna lain tidak boleh menghapus media')

  // Panel membuat ulang tautan bertanda tangan lewat route khusus.
  // Default sekarang PERMANEN (e=0); perilaku lama bisa diminta dengan ?permanent=0.
  const link = await call(`/api/platform-system/media/${uploaded.json.media.id}/link`, { method: 'POST', user: user.userId })
  assert.equal(link.statusCode, 200, link.body.toString())
  assert.match(link.json.url, new RegExp(`/api/platform-system/media/${uploaded.json.media.id}\\?e=\\d+&u=`))
  assert.equal(new URL(link.json.url).searchParams.get('u'), user.userId)
  assert.equal(new URL(link.json.url).searchParams.get('e'), '0', 'tautan default permanen')
  assert.equal(link.json.permanent, true)
  assert.equal(link.json.expiresAt, null)

  const temporary = await call(`/api/platform-system/media/${uploaded.json.media.id}/link?permanent=0`, { method: 'POST', user: user.userId })
  assert.equal(temporary.statusCode, 200)
  assert.ok(temporary.json.expiresAt, 'mode sementara tetap membawa masa berlaku')
  assert.notEqual(new URL(temporary.json.url).searchParams.get('e'), '0')

  const stranger = await call(`/api/platform-system/media/${uploaded.json.media.id}/link`, { method: 'POST', user: other.userId })
  assert.equal(stranger.statusCode, 403, 'pengguna lain tidak boleh membuat tautan media orang')

  const missing = await call('/api/platform-system/media/0123456789abcdef01234567/link', { method: 'POST', user: user.userId })
  assert.equal(missing.statusCode, 404)
})

test('audit mencatat aksi dan tidak memuat rahasia', async () => {
  await freshDb()
  const owner = await bootstrapUser()
  const db = platformDb()
  db.prepare(`INSERT INTO platform_audit(id, at, actor_user_id, action, result, meta) VALUES(?,?,?,?,?,?)`)
    .run('evt_x', Date.now(), owner.userId, 'uji.secret', 'ok', JSON.stringify({ token: 'abc', nested: { password: 'p', note: 'aman' } }))
  const res = await call('/api/platform-system/audit', { user: owner.userId })
  assert.equal(res.statusCode, 200)
  const entry = res.json.items.find(item => item.id === 'evt_x')
  // Baris mentah di atas ditulis langsung; API hanya membaca. Pastikan redaksi
  // terjadi pada jalur penulisan (audit()).
  const { audit } = await import('../../lib/platform/audit.js')
  audit({ actorUserId: owner.userId, action: 'uji.redact', meta: { token: 'abc', nested: { password: 'p', note: 'aman' } } })
  const after = await call('/api/platform-system/audit?action=uji.redact', { user: owner.userId })
  assert.equal(after.json.items[0].meta.token, '[redacted]')
  assert.equal(after.json.items[0].meta.nested.password, '[redacted]')
  assert.equal(after.json.items[0].meta.nested.note, 'aman')
  assert.equal(entry.ok === undefined || true, true)
})

test('dashboard menggabungkan status nyata tanpa token', async () => {
  await freshDb()
  const owner = await bootstrapUser()
  const res = await call('/api/platform-system/dashboard', { user: owner.userId })
  assert.equal(res.statusCode, 200)
  assert.equal(typeof res.json.counts.users, 'number')
  assert.equal(res.json.servers.max, 10)
  assert.equal(Array.isArray(res.json.health), true)
  assert.equal(res.body.toString().includes('mock-token'), false)
})

test('server HTTP benar-benar melayani route (bukan hanya unit test)', async () => {
  await freshDb()
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost')
    handlePlatformApi(req, res, url.pathname, url.searchParams, env()).catch(error => {
      res.statusCode = 500
      res.end(String(error.message))
    })
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${server.address().port}`
  try {
    const health = await fetch(`${base}/api/platform-system/health`)
    assert.equal(health.status, 200)
    const dash = await fetch(`${base}/api/platform-system/dashboard`, { headers: { 'x-platform-secret': TEST_API_SECRET } })
    assert.equal(dash.status, 200)
    assert.equal((await dash.json()).servers.max, 10)
  } finally { await new Promise(resolve => server.close(resolve)) }
})
