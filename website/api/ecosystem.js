/**
 * Gerbang web untuk ekosistem multi-aplikasi (Task 70).
 *
 * Alur:
 *   browser → /api/ecosystem/*  (verifikasi sesi Supabase + role di sini)
 *           → bot  /api/platform-system/*  (x-platform-secret)
 *
 * Token bot Telegram TIDAK pernah dikembalikan handler ini; backend hanya
 * mengirim versi tersamar. Semua aksi tulis dicatat backend di audit log.
 */
import { assertBodySize, enforceSameOrigin, rateLimit, securityHeaders } from './_security.js'
import { getBotApiConfig } from './_bot-config.js'
import { requestBot } from './_bot-transport.js'

const FIXED_OWNER = 'owner@example.com'
const DATA_URL = () => String(process.env.UMI_DATA_SUPABASE_URL || '').replace(/\/+$/, '')
const DATA_KEY = () => String(process.env.UMI_DATA_SERVICE_ROLE_KEY || '')
const AUTH_URL = () => String(process.env.SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co').replace(/\/+$/, '')
const AUTH_ANON = () => String(process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_ebpebtzCNxvsKWb0xtgX_A_ClzPlhob')
const PLATFORM_SECRET = () => String(process.env.PLATFORM_API_SECRET || '')
const MAX_JSON = 256 * 1024

const ALLOWED = [
  { method: 'GET', pattern: /^session$/ },
  { method: 'POST', pattern: /^bootstrap$/ },
  { method: 'GET', pattern: /^dashboard$/ },
  { method: 'GET', pattern: /^telegram\/bots$/ },
  { method: 'POST', pattern: /^telegram\/bots$/ },
  { method: 'POST', pattern: /^telegram\/bots\/[\w-]+\/(validate|enable|disable|revoke)$/ },
  // Hubungkan bot Telegram milik pengguna ke bot WhatsApp miliknya.
  { method: 'POST', pattern: /^telegram\/bots\/[\w-]+\/link$/ },
  // Nomor bot utama platform (khusus owner).
  { method: 'GET', pattern: /^main-bot$/ },
  { method: 'POST', pattern: /^main-bot\/number$/ },
  // Log error terbaru (owner/developer).
  { method: 'GET', pattern: /^errors$/ },
  // Saklar mode premium platform (owner/developer).
  { method: 'GET', pattern: /^premium-mode$/ },
  { method: 'POST', pattern: /^premium-mode$/ },
  { method: 'GET', pattern: /^servers$/ },
  { method: 'GET', pattern: /^servers\/overview$/ },
  { method: 'PUT', pattern: /^servers\/\d+$/ },
  { method: 'DELETE', pattern: /^servers\/\d+$/ },
  { method: 'POST', pattern: /^servers\/\d+\/action$/ },
  { method: 'GET', pattern: /^users$/ },
  { method: 'PATCH', pattern: /^users\/[^/]+\/role$/ },
  { method: 'GET', pattern: /^audit$/ },
  { method: 'POST', pattern: /^link\/telegram$/ },
  { method: 'GET', pattern: /^media$/ },
  { method: 'POST', pattern: /^media\/[a-f0-9]{24}\/link$/ },
  { method: 'GET', pattern: /^health\/integrations$/ },
  { method: 'GET', pattern: /^rpg\/summary$/ },
  { method: 'GET', pattern: /^stock\/status$/ },
]

const send = (res, status, data) => {
  securityHeaders(res)
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  return res.status(status).json(data)
}

function routePath(req) {
  const value = req.query?.path
  return (Array.isArray(value) ? value.join('/') : String(value || '')).replace(/^\/+|\/+$/g, '')
}

function bearer(req) {
  return String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim()
}

async function authUser(req) {
  const token = bearer(req)
  if (!token) throw Object.assign(new Error('Silakan masuk terlebih dahulu.'), { status: 401 })
  const response = await fetch(`${AUTH_URL()}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: AUTH_ANON() },
    signal: AbortSignal.timeout(12000),
  })
  if (!response.ok) throw Object.assign(new Error('Sesi login tidak valid atau sudah berakhir.'), { status: 401 })
  const data = await response.json()
  return { id: data.id, email: String(data.email || '').toLowerCase(), token }
}

/** Role dari tabel platform_profiles (server-side), bukan dari klien. */
async function profileRoles(user) {
  if (!DATA_URL() || !DATA_KEY()) {
    // Tanpa service key, owner tetap dikenali dari email tetap.
    return user.email === FIXED_OWNER ? ['owner', 'developer'] : ['user']
  }
  const response = await fetch(
    `${DATA_URL()}/rest/v1/platform_profiles?auth_id=eq.${encodeURIComponent(user.id)}&select=roles,locked,banned&limit=1`,
    { headers: { apikey: DATA_KEY(), Authorization: `Bearer ${DATA_KEY()}` }, signal: AbortSignal.timeout(12000) },
  )
  if (!response.ok) return user.email === FIXED_OWNER ? ['owner', 'developer'] : ['user']
  const rows = await response.json()
  const profile = Array.isArray(rows) ? rows[0] : null
  if (profile?.banned) throw Object.assign(new Error('Akun ini diblokir.'), { status: 403 })
  const roles = Array.isArray(profile?.roles) ? profile.roles : []
  if (user.email === FIXED_OWNER) return ['owner', 'developer']
  return roles.length ? roles : ['user']
}

function webRole(roles) {
  const list = roles.map(item => String(item || '').toLowerCase())
  if (list.includes('owner')) return 'owner'
  if (list.includes('developer')) return 'developer'
  if (list.includes('admin')) return 'admin'
  if (list.includes('reseller') || list.includes('partner')) return 'reseller'
  return 'user'
}

async function botConfig() {
  const config = await getBotApiConfig()
  if (!config?.origin) throw Object.assign(new Error('Backend bot belum dikonfigurasi.'), { status: 503 })
  if (!PLATFORM_SECRET()) throw Object.assign(new Error('PLATFORM_API_SECRET belum diatur di website.'), { status: 503 })
  return config
}

async function callBot(config, method, path, { body = null, timeout = 30000, userId = null } = {}) {
  const url = `${String(config.origin).replace(/\/+$/, '')}/api/platform-system/${path}`
  const { response, data } = await requestBot(url, {
    method,
    headers: {
      Accept: 'application/json',
      'x-platform-secret': PLATFORM_SECRET(),
      ...(userId ? { 'x-platform-user-id': userId } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }, timeout)
  return { status: response.status, data, raw: response }
}

export default async function handler(req, res) {
  securityHeaders(res)
  try {
    rateLimit(req, 'ecosystem:all', 240, 60 * 1000)
    assertBodySize(req, MAX_JSON)
    enforceSameOrigin(req)
  } catch (error) {
    if (error.retryAfter) res.setHeader('Retry-After', String(error.retryAfter))
    return send(res, error.status || 400, { error: error.message })
  }
  if (req.method === 'OPTIONS') return send(res, 204, {})
  if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    return send(res, 405, { error: 'Metode tidak diizinkan.' })
  }

  const path = routePath(req)
  const allowed = ALLOWED.some(item => item.method === req.method && item.pattern.test(path))
  if (!allowed) return send(res, 404, { error: 'Endpoint ekosistem tidak ditemukan.' })

  let user
  try {
    user = await authUser(req)
  } catch (error) {
    return send(res, error.status || 401, { error: error.message })
  }

  try {
    const config = await botConfig()
    let roles
    try { roles = await profileRoles(user) } catch (error) { return send(res, error.status || 403, { error: error.message }) }
    const role = webRole(roles)

    // Bootstrap identitas internal di backend sebelum request lain.
    const boot = await callBot(config, 'POST', 'bootstrap', {
      body: {
        authId: user.id,
        email: user.email,
        role,
        displayName: String(user.email.split('@')[0] || '').slice(0, 60),
      },
    })
    if (boot.status >= 400) return send(res, boot.status, boot.data || { error: 'Bootstrap gagal.' })
    const userId = boot.data.userId

    if (path === 'session') {
      const session = await callBot(config, 'GET', 'session', { userId })
      return send(res, session.status, { ...session.data, webRole: role, roles })
    }

    const isWrite = req.method !== 'GET'
    const payload = isWrite && req.body && typeof req.body === 'object' ? req.body : null
    const result = await callBot(config, req.method, path, {
      body: payload,
      userId,
      timeout: path.startsWith('servers') ? 45000 : 30000,
    })
    return send(res, result.status, result.data)
  } catch (error) {
    return send(res, error.status || 502, { error: error.message })
  }
}
