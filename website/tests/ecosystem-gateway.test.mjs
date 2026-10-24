/**
 * Tes gateway web → bot untuk panel ekosistem (Task 70).
 *
 * Yang dibuktikan:
 *  - route di luar whitelist ditolak sebelum menyentuh backend;
 *  - sesi Supabase diverifikasi di server, role diambil dari database;
 *  - bootstrap dijalankan sekali per request sebelum route lain;
 *  - header `x-platform-secret` dan `x-platform-user-id` benar-benar dikirim;
 *  - token bot tidak pernah muncul di URL/response gateway;
 *  - origin lintas situs ditolak.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import handler from '../api/ecosystem.js'

const SECRET = 'test-platform-secret-0123456789abcdef'
const AUTH_ID = '3f1a9d2c-1111-4222-8333-444455556666'
const BOT_ORIGIN = 'https://bot.example'

process.env.UMI_API_ORIGIN = BOT_ORIGIN
process.env.UMI_CONFIG_GIST_URL = ''
process.env.PLATFORM_API_SECRET = SECRET
process.env.UMI_DATA_SUPABASE_URL = ''
process.env.UMI_DATA_SERVICE_ROLE_KEY = ''
process.env.SUPABASE_URL = 'https://auth.example'
process.env.SUPABASE_ANON_KEY = 'anon-key'

const calls = []
let botResponder = () => ({ status: 200, body: { ok: true } })

globalThis.fetch = async (url, options = {}) => {
  const target = String(url)
  const headers = options.headers || {}
  calls.push({ url: target, method: options.method || 'GET', headers, body: options.body })
  if (target.startsWith('https://auth.example/auth/v1/user')) {
    return jsonResponse(200, { id: AUTH_ID, email: 'owner@example.com' })
  }
  if (target.startsWith(BOT_ORIGIN)) {
    const { status, body } = botResponder(target, options)
    return jsonResponse(status, body)
  }
  throw new Error(`URL tak terduga: ${target}`)
}

function jsonResponse(status, body) {
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: { get: () => 'application/json' },
    text: async () => JSON.stringify(body),
    json: async () => body,
  }
}

function makeRes() {
  const res = {
    statusCode: 0,
    headers: {},
    payload: null,
    setHeader(key, value) { this.headers[key.toLowerCase()] = value },
    status(code) { this.statusCode = code; return this },
    json(data) { this.payload = data; return this },
  }
  return res
}

async function invoke(path, { method = 'GET', body = null, auth = true, origin = null, site = null } = {}) {
  const req = {
    method,
    query: { path },
    headers: {
      host: 'alzriss-comunity.vercel.app',
      ...(auth ? { authorization: 'Bearer session-token' } : {}),
      ...(origin ? { origin } : {}),
      ...(site ? { 'sec-fetch-site': site } : {}),
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body,
  }
  const res = makeRes()
  await handler(req, res)
  return res
}

function botCalls() {
  return calls.filter(call => call.url.startsWith(BOT_ORIGIN))
}

test('route di luar whitelist ditolak tanpa menyentuh backend', async () => {
  calls.length = 0
  const res = await invoke('media/upload', { method: 'POST', body: {} })
  assert.equal(res.statusCode, 404)
  assert.equal(botCalls().length, 0)
})

test('tanpa bearer ditolak 401', async () => {
  calls.length = 0
  const res = await invoke('dashboard', { auth: false })
  assert.equal(res.statusCode, 401)
  assert.equal(botCalls().length, 0)
})

test('permintaan tulis lintas situs ditolak walau token valid', async () => {
  calls.length = 0
  const res = await invoke('telegram/bots', { method: 'POST', body: { label: 'x', token: 'y' }, site: 'cross-site' })
  assert.equal(res.statusCode, 403)
  assert.equal(botCalls().length, 0, 'tidak boleh sampai ke backend')
})

test('session: bootstrap dulu, lalu GET session dengan secret dan user id', async () => {
  calls.length = 0
  botResponder = url => {
    if (url.endsWith('/bootstrap')) {
      return { status: 200, body: { userId: `web:${AUTH_ID}`, role: 'owner', permissions: ['session.own'] } }
    }
    return {
      status: 200,
      body: {
        user: { id: `web:${AUTH_ID}`, email: 'owner@example.com', role: 'owner' },
        permissions: ['session.own', 'telegram.manage'],
        whatsapp: { jid: null, numbers: [] },
        telegramLinked: false,
      },
    }
  }
  const res = await invoke('session')
  assert.equal(res.statusCode, 200, JSON.stringify(res.payload))
  const paths = botCalls().map(call => call.url)
  assert.equal(paths[0].endsWith('/bootstrap'), true, 'bootstrap harus pertama')
  assert.equal(paths[1].endsWith('/session'), true)
  for (const call of botCalls()) {
    assert.equal(call.headers['x-platform-secret'], SECRET)
  }
  assert.equal(botCalls()[1].headers['x-platform-user-id'], `web:${AUTH_ID}`)
  assert.equal(res.payload.webRole, 'owner')
  // Secret tidak boleh bocor ke browser.
  assert.equal(JSON.stringify(res.payload).includes(SECRET), false)
})

test('route media link diteruskan apa adanya dan tidak membocorkan token bot', async () => {
  calls.length = 0
  const mediaId = '0123456789abcdef01234567'
  botResponder = url => {
    if (url.endsWith('/bootstrap')) return { status: 200, body: { userId: `web:${AUTH_ID}` } }
    return { status: 200, body: { ok: true, url: `https://api.example/api/platform-system/media/${mediaId}?e=1&u=web&s=abc` } }
  }
  const res = await invoke(`media/${mediaId}/link`, { method: 'POST', body: {} })
  assert.equal(res.statusCode, 200)
  const forwarded = botCalls().at(-1)
  assert.equal(forwarded.url, `${BOT_ORIGIN}/api/platform-system/media/${mediaId}/link`)
  assert.equal(forwarded.method, 'POST')
  assert.equal(JSON.stringify(res.payload).includes(SECRET), false)
})

test('whitelist menolak aksi bot dengan id aneh (path traversal/karakter liar)', async () => {
  calls.length = 0
  const res = await invoke('telegram/bots/..%2F..%2Fsession/revoke', { method: 'POST', body: {} })
  assert.equal(res.statusCode, 404)
  assert.equal(botCalls().length, 0)
})

test('backend mengembalikan error: status diteruskan, bukan 200 palsu', async () => {
  calls.length = 0
  botResponder = url => {
    if (url.endsWith('/bootstrap')) return { status: 200, body: { userId: `web:${AUTH_ID}` } }
    return { status: 403, body: { error: 'Akses ditolak untuk peran ini.' } }
  }
  const res = await invoke('users')
  assert.equal(res.statusCode, 403)
  assert.match(res.payload.error, /Akses ditolak/)
})

test('bootstrap gagal → request tidak dilanjutkan ke route aslinya', async () => {
  calls.length = 0
  botResponder = () => ({ status: 500, body: { error: 'database sibuk' } })
  const res = await invoke('dashboard')
  assert.equal(res.statusCode, 500)
  assert.equal(botCalls().length, 1, 'hanya bootstrap yang dipanggil')
})
