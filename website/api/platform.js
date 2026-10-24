// Task64: relay koin RPG -> $AS (endpoint platform/rpg-topup).
import crypto from 'node:crypto'
import {
  assertBodySize,
  enforceSameOrigin,
  resolvedPublicHttpUrl,
  rateLimit,
  safeNumericId,
  safeUuid,
  securityHeaders,
} from './_security.js'
import { getBotApiConfig } from './_bot-config.js'
import { requestBot } from './_bot-transport.js'

const FIXED_OWNER = 'owner@example.com'
const VALID_ROLES = new Set(['user', 'admin', 'partner', 'owner', 'developer'])
const DATA_URL = () => String(process.env.UMI_DATA_SUPABASE_URL || '').replace(/\/+$/, '')
const DATA_KEY = () => String(process.env.UMI_DATA_SERVICE_ROLE_KEY || '')
const AUTH_URL = () => String(process.env.SUPABASE_URL || 'https://YOUR_PROJECT.supabase.co').replace(/\/+$/, '')
const AUTH_ANON = () => String(process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_ebpebtzCNxvsKWb0xtgX_A_ClzPlhob')
const AUTH_ADMIN = () => String(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || '')
const usernameCache = new Map()
const USERNAME_CACHE_TTL = 10 * 60 * 1000

const send = (res, status, data) => {
  securityHeaders(res)
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  return res.status(status).json(data)
}
const text = (value, max = 500) => String(value ?? '').trim().slice(0, max)
const email = value => text(value, 320).toLowerCase()
const fixedRoles = value => email(value) === FIXED_OWNER ? ['owner', 'developer'] : null

function routePath(req) {
  const value = req.query?.path
  return (Array.isArray(value) ? value.join('/') : String(value || '')).replace(/^\/+|\/+$/g, '')
}

function bearer(req) {
  return text(req.headers.authorization, 10000).replace(/^Bearer\s+/i, '')
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
  const username = text(data.user_metadata?.username || data.user_metadata?.name || '', 40)
  return { id: data.id, email: email(data.email), username, token }
}

async function dataRequest(path, { method = 'GET', body, headers = {} } = {}) {
  if (!DATA_URL() || !DATA_KEY()) throw Object.assign(new Error('Database platform belum dikonfigurasi.'), { status: 503 })
  const response = await fetch(`${DATA_URL()}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: DATA_KEY(),
      Authorization: `Bearer ${DATA_KEY()}`,
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  })
  const raw = await response.text()
  let data
  try { data = raw ? JSON.parse(raw) : null } catch { data = raw }
  if (!response.ok) {
    const error = new Error(response.status === 409 ? 'Data bertentangan dengan data yang sudah ada.' : 'Permintaan database ditolak.')
    error.status = response.status >= 500 ? 502 : response.status
    error.internalMessage = data?.message || data?.error || raw
    throw error
  }
  return data
}

async function ensureProfile(user) {
  const locked = user.email === FIXED_OWNER
  const forced = fixedRoles(user.email)
  const rows = await dataRequest(`platform_profiles?auth_id=eq.${encodeURIComponent(user.id)}&select=*`)
  let profile = rows?.[0]
  if (!profile) {
    const created = await dataRequest('platform_profiles', {
      method: 'POST',
      body: { auth_id: user.id, email: user.email, username: user.username || '', roles: forced || ['user'], locked, banned: false },
      headers: { Prefer: 'return=representation' },
    })
    profile = created?.[0]
  } else {
    const resolvedUsername = user.username || profile.username || ''
    const lastSeen = new Date(profile.last_seen_at || 0).getTime()
    const stale = !Number.isFinite(lastSeen) || Date.now() - lastSeen > 5 * 60 * 1000
    const ownerMismatch = Boolean(forced) && (profile.email !== FIXED_OWNER || !profile.locked || profile.banned || !forced.every(role => profile.roles?.includes(role)))
    if (stale || resolvedUsername !== profile.username || ownerMismatch) {
      const patch = { last_seen_at: new Date().toISOString(), username: resolvedUsername }
      if (forced) Object.assign(patch, { roles: forced, locked: true, banned: false, email: FIXED_OWNER })
      const updated = await dataRequest(`platform_profiles?auth_id=eq.${encodeURIComponent(user.id)}`, {
        method: 'PATCH', body: patch, headers: { Prefer: 'return=representation' },
      })
      profile = updated?.[0] || { ...profile, ...patch }
    }
  }
  if (profile?.banned && !forced) throw Object.assign(new Error('Akun ini diblokir dari platform.'), { status: 403 })
  return profile
}

function requireOwner(profile) {
  if (!profile?.roles?.includes('owner')) throw Object.assign(new Error('Hanya owner platform yang diizinkan.'), { status: 403 })
}

// Task79: halaman Setting/Pairing/Console Bot Utama dipisah dan dibuka untuk
// owner, partner, dan developer. Route owner lain tetap requireOwner.
const MAIN_BOT_ROLES = new Set(['partner', 'owner', 'developer'])
function requireMainBot(profile) {
  const roles = Array.isArray(profile?.roles) ? profile.roles : []
  if (!roles.some(role => MAIN_BOT_ROLES.has(role))) throw Object.assign(new Error('Hanya owner, partner, dan developer yang diizinkan.'), { status: 403 })
}

async function audit(user, action, target = '', metadata = {}) {
  try {
    await dataRequest('platform_audit_logs', { method: 'POST', body: { actor_id: user.id, actor_email: user.email, action, target: text(target, 500), metadata } })
  } catch {}
}

async function authAdmin(path, { method = 'GET', body } = {}) {
  if (!AUTH_ADMIN()) throw Object.assign(new Error('Admin Auth belum dikonfigurasi.'), { status: 503 })
  const response = await fetch(`${AUTH_URL()}/auth/v1/admin/${path}`, {
    method,
    headers: { apikey: AUTH_ADMIN(), Authorization: `Bearer ${AUTH_ADMIN()}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
  })
  const raw = await response.text(); let data
  try { data = raw ? JSON.parse(raw) : {} } catch { data = {} }
  if (!response.ok) throw Object.assign(new Error(data.msg || data.message || data.error_description || 'Operasi akun gagal.'), { status: response.status })
  return data
}

function consoleRelaySecret() {
  const secret = String(process.env.UMI_CONSOLE_RELAY_SECRET || '')
  if (secret.length < 32) throw Object.assign(new Error('Relay terminal owner belum dikonfigurasi.'), { status: 503 })
  return secret
}

function ownerRelayTicket(user, audience, method, path) {
  // SEC-12: ikat tiket ke method + pathname tujuan supaya tiket yang bocor
  // (log/ekstensi) tidak bisa dipakai ke endpoint owner lain.
  const boundPath = String(path || '').split('?')[0].replace(/^\/+/, '')
  const body = Buffer.from(JSON.stringify({ v: 1, aud: audience, sub: user.id, exp: Date.now() + 75 * 1000, nonce: crypto.randomBytes(12).toString('base64url'), m: String(method || 'GET').toUpperCase(), p: boundPath })).toString('base64url')
  const signature = crypto.createHmac('sha256', consoleRelaySecret()).update(body).digest('base64url')
  return `${body}.${signature}`
}

async function botOwnerRelayRequest(audience, path, user, { method = 'GET', body } = {}) {
  const botConfig = await getBotApiConfig()
  const ticketHeaders = {
    'owner-console': 'X-UMI-Console-Ticket',
    'owner-agent': 'X-UMI-Agent-Ticket',
    'owner-panel': 'X-UMI-Panel-Ticket',
  }
  const ticketHeader = ticketHeaders[audience]
  if (!ticketHeader) throw Object.assign(new Error('Audience relay owner tidak valid.'), { status: 500 })
  const { response, data } = await requestBot(`${botConfig.origin}/api/${audience}/${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      [ticketHeader]: ownerRelayTicket(user, audience, method, path),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!response.ok) throw Object.assign(new Error(data.error || 'Relay owner bot gagal merespons.'), { status: response.status })
  return data
}

function botConsoleRequest(path, user, options = {}) {
  return botOwnerRelayRequest('owner-console', path, user, options)
}

function botAgentRequest(path, user, options = {}) {
  return botOwnerRelayRequest('owner-agent', path, user, options)
}

function botPanelRequest(path, user, options = {}) {
  return botOwnerRelayRequest('owner-panel', path, user, options)
}

async function botRequest(path, user, { method = 'GET', body, headers = {} } = {}) {
  // Owner-session aggregation and media application are server-to-server calls.
  // Resolve the same HTTPS-only dynamic Gist origin used by the public proxy;
  // never fall back to an HTTP Pterodactyl allocation.
  const botConfig = await getBotApiConfig()
  const { response, data } = await requestBot(`${botConfig.origin}/api/${path}`, {
    method,
    headers: { Authorization: `Bearer ${user.token}`, Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!response.ok) throw Object.assign(new Error(data.error || 'Backend bot gagal merespons.'), { status: response.status })
  return data
}

/*
 * Ringkasan sesi bot untuk panel owner.
 *
 * `/api/sessions?all=1` hanya mengembalikan SEMUA sesi bila email pemanggil
 * terdaftar di `ownerEmails` milik backend bot. Kalau tidak, backend hanya
 * mengembalikan sesi milik pemanggil — bisa 0 padahal puluhan bot hidup.
 * Karena itu hasil yang kosong diverifikasi ke `/api/stats` (agregat resmi
 * bot). Yang dilaporkan selalu angka dari backend, bukan tebakan, dan
 * `source` menjelaskan asal angkanya.
 */
async function botSessionTotals(user) {
  const result = { sessions: [], total: null, online: null, offline: null, source: 'sessions', error: null, checkedAt: null }
  let statsProbe = null
  const readStats = async () => {
    if (statsProbe) return statsProbe
    try {
      const botConfig = await getBotApiConfig()
      const secret = String(process.env.BOT_BACKUP_EXPORT_SECRET || process.env.UMI_ERROR_REPORT_SECRET || '').trim()
      const response = await fetch(`${botConfig.origin}/api/stats`, {
        headers: secret ? { Authorization: `Bearer ${secret}` } : {},
        signal: AbortSignal.timeout(8000),
      })
      if (!response.ok) { statsProbe = null; return null }
      const stats = await response.json()
      const total = Number(stats.sessions)
      statsProbe = Number.isFinite(total)
        ? { total, online: Number(stats.online) || 0 }
        : null
    } catch { statsProbe = null }
    return statsProbe
  }

  try {
    const sessions = (await botRequest('sessions?all=1', user)).sessions || []
    result.total = sessions.length
    result.online = sessions.filter(item => item.status === 'connected').length
    result.offline = sessions.length - result.online
    result.checkedAt = new Date().toISOString()
    if (!sessions.length) {
      const stats = await readStats()
      if (stats && stats.total > 0) {
        result.total = stats.total
        result.online = stats.online
        result.offline = Math.max(0, stats.total - stats.online)
        result.source = 'stats'
        result.sessions = []
      }
    }
    return result
  } catch (error) {
    result.error = error.message || 'Backend bot tidak dapat dihubungi.'
  }

  const stats = await readStats()
  if (stats) {
    result.total = stats.total
    result.online = stats.online
    result.offline = Math.max(0, stats.total - stats.online)
    result.source = 'stats'
    result.checkedAt = new Date().toISOString()
  }
  return result
}

function normalizedRoles(input, targetEmail) {
  if (targetEmail === FIXED_OWNER) return ['owner', 'developer']
  const roles = [...new Set((Array.isArray(input) ? input : []).map(x => text(x, 20).toLowerCase()).filter(x => VALID_ROLES.has(x)))]
  return roles.length ? roles : ['user']
}

function pluginSummary(row, includeCode = false) {
  const output = { id: row.id, slug: row.slug, filename: row.filename, description: row.description, active: row.active, uploader_email: row.uploader_email, created_at: row.created_at, updated_at: row.updated_at }
  if (includeCode) output.code = row.code
  return output
}

export default async function handler(req, res) {
  try {
    securityHeaders(res)
    if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(req.method)) return send(res, 405, { error: 'Metode tidak diizinkan.' })
    assertBodySize(req, 768 * 1024)
    rateLimit(req, 'platform:all', 300, 60 * 1000)
    enforceSameOrigin(req)
    const path = routePath(req)
    if (!/^[A-Za-z0-9_./-]{0,180}$/.test(path) || path.includes('..')) return send(res, 400, { error: 'Path tidak valid.' })
    if (path === 'health' && req.method === 'GET') {
      await dataRequest('platform_profiles?select=auth_id&limit=1')
      return send(res, 200, { ok: true, service: 'usanagi-umi-platform', database: 'connected', time: new Date().toISOString() })
    }
    if (path === 'auth/login' && req.method === 'POST') {
      rateLimit(req, 'platform:login', 10, 15 * 60 * 1000)
      const identifier = text(req.body?.identifier, 320)
      const password = String(req.body?.password || '')
      if (!identifier || !password || password.length > 256) return send(res, 400, { error: 'Username/email atau password salah.' })
      let loginEmail = email(identifier)
      let knownProfile = null
      if (!identifier.includes('@')) {
        if (!/^[A-Za-z0-9_.-]{3,40}$/.test(identifier)) return send(res, 400, { error: 'Username/email atau password salah.' })
        const cleanUsername = identifier
        const cacheKey = cleanUsername.toLowerCase()
        const cached = usernameCache.get(cacheKey)
        if (cached && cached.expires > Date.now()) {
          loginEmail = cached.email || ''
        } else {
          const rows = await dataRequest(`platform_profiles?username=ilike.${encodeURIComponent(cleanUsername)}&select=*&limit=1`)
          knownProfile = rows?.[0] || null
          loginEmail = knownProfile?.email || ''
          if (knownProfile) usernameCache.set(cacheKey, { email: knownProfile.email, expires: Date.now() + USERNAME_CACHE_TTL })
        }
      }
      if (!loginEmail) return send(res, 400, { error: 'Username/email atau password salah.' })
      const profilePromise = knownProfile ? Promise.resolve([knownProfile]) : dataRequest(`platform_profiles?email=eq.${encodeURIComponent(loginEmail)}&select=*&limit=1`).catch(() => [])
      const response = await fetch(`${AUTH_URL()}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { apikey: AUTH_ANON(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password }),
        signal: AbortSignal.timeout(15000),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data.access_token || !data.refresh_token) return send(res, 400, { error: 'Username/email atau password salah.' })
      knownProfile = knownProfile || (await profilePromise)?.[0] || null
      const loginUser = {
        id: data.user?.id,
        email: email(data.user?.email || loginEmail),
        username: text(data.user?.user_metadata?.username || data.user?.user_metadata?.name || '', 40),
        token: data.access_token,
      }
      const profile = knownProfile || await ensureProfile(loginUser)
      if (profile?.banned && loginUser.email !== FIXED_OWNER) return send(res, 403, { error: 'Akun ini diblokir dari platform.' })
      return send(res, 200, {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        user: { id: loginUser.id, email: loginUser.email, username: profile.username || loginUser.username, roles: profile.roles, locked: profile.locked },
      })
    }
    if (path === 'auth/register' && req.method === 'POST') {
      rateLimit(req, 'platform:register', 5, 60 * 60 * 1000)
      const username = text(req.body?.username, 40)
      const registerEmail = email(req.body?.email)
      const password = String(req.body?.password || '')
      if (!/^[A-Za-z0-9_.-]{3,40}$/.test(username)) return send(res, 400, { error: 'Username harus 3–40 karakter dan hanya boleh berisi huruf, angka, titik, garis bawah, atau tanda minus.' })
      const gmailLocal = registerEmail.endsWith('@gmail.com') ? registerEmail.slice(0, -10) : ''
      if (!gmailLocal || !/^[a-z0-9]+(?:\.?[a-z0-9]+)*$/.test(gmailLocal)) return send(res, 400, { error: 'Gunakan alamat Gmail yang valid, contoh nama@gmail.com.' })
      if (password.length < 8 || password.length > 128) return send(res, 400, { error: 'Password harus 8–128 karakter.' })
      const duplicateUsername = await dataRequest(`platform_profiles?username=ilike.${encodeURIComponent(username.replace(/[*,()]/g, ''))}&select=auth_id&limit=1`)
      if (duplicateUsername?.length) return send(res, 409, { error: 'Username sudah digunakan.' })
      let created
      try {
        created = await authAdmin('users', { method: 'POST', body: { email: registerEmail, password, email_confirm: true, user_metadata: { username } } })
      } catch (error) {
        const message = String(error.message || '').toLowerCase()
        if (message.includes('already') || message.includes('registered') || error.status === 422) return send(res, 409, { error: 'Email sudah terdaftar. Silakan masuk.' })
        throw error
      }
      try {
        await dataRequest('platform_profiles', {
          method: 'POST',
          body: { auth_id: created.id, email: registerEmail, username, roles: fixedRoles(registerEmail) || ['user'], locked: registerEmail === FIXED_OWNER, banned: false },
          headers: { Prefer: 'return=minimal' },
        })
      } catch (error) {
        await authAdmin(`users/${created.id}`, { method: 'DELETE' }).catch(() => {})
        throw error
      }
      return send(res, 201, { ok: true, message: 'Akun berhasil dibuat. Silakan masuk.' })
    }
    /* Google OAuth redirect URL */
    if (path === 'auth/google' && req.method === 'POST') {
      try {
        const supabaseUrl = AUTH_URL()
        const anonKey = AUTH_ANON()
        const redirectTo = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/#dashboard`
        const oauthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`
        return send(res, 200, { url: oauthUrl })
      } catch (e) {
        return send(res, 500, { error: 'Google login belum dikonfigurasi' })
      }
    }
    /* Get/regenerate API token */
    if (path === 'auth/token' && req.method === 'POST') {
      const user = await authUser(req)
      if (!user) return send(res, 401, { error: 'Unauthorized' })
      const newToken = crypto.randomBytes(32).toString('hex')
      await dataRequest(`platform_profiles?auth_id=eq.${encodeURIComponent(user.id)}`, {
        method: 'PATCH',
        body: { api_token: newToken },
        headers: { Prefer: 'return=minimal' },
      }).catch(() => {})
      return send(res, 200, { ok: true, token: newToken })
    }
    /* Verifikasi token API — dipakai game web / integrasi eksternal (tanpa login) */
    if (path === 'verify-token' && req.method === 'POST') {
      rateLimit(req, 'platform:verify-token', 120, 60 * 1000)
      const token = text(req.body?.token, 200)
      if (token.length < 16) return send(res, 400, { ok: false, error: 'Token tidak valid.' })
      const rows = await dataRequest(`platform_profiles?api_token=eq.${encodeURIComponent(token)}&select=auth_id,username,email,roles,locked,banned,created_at&limit=1`)
      const profile = rows?.[0]
      if (!profile) return send(res, 401, { ok: false, error: 'Token tidak dikenali. Buat token baru di halaman Profil.' })
      if (profile.banned) return send(res, 403, { ok: false, error: 'Akun ini diblokir dari platform.' })
      return send(res, 200, {
        ok: true,
        user: {
          id: profile.auth_id,
          username: profile.username || '',
          email: profile.email || '',
          roles: profile.roles || ['user'],
          owner: Boolean(profile.locked),
          joined: profile.created_at || null,
        },
      })
    }
    /* Konversi saldo UMI (Rp) → $AS game — dipakai halaman UMI TRADE di game web.
     * Saldo Rp tetap di bot; website hanya meneruskan dengan tiket relay. */
    if (path === 'game-topup' && req.method === 'POST') {
      rateLimit(req, 'platform:game-topup', 60, 60 * 1000)
      const token = text(req.body?.token, 300)
      if (token.length < 16) return send(res, 400, { ok: false, error: 'Token akun diperlukan.' })
      let userId = ''
      try {
        const rows = await dataRequest(`platform_profiles?api_token=eq.${encodeURIComponent(token)}&select=auth_id,banned&limit=1`)
        const profile = rows?.[0]
        if (!profile) return send(res, 401, { ok: false, error: 'Token akun tidak dikenali. Buat token baru di halaman Profil.' })
        if (profile.banned) return send(res, 403, { ok: false, error: 'Akun ini diblokir dari platform.' })
        userId = profile.auth_id
      } catch {
        return send(res, 502, { ok: false, error: 'Verifikasi token sedang tidak tersedia.' })
      }
      let botConfig = null
      try { botConfig = await getBotApiConfig() } catch {}
      if (!botConfig?.origin) return send(res, 503, { ok: false, error: 'Relay bot belum siap. Coba lagi sebentar.' })
      try {
        const { response, data } = await requestBot(`${String(botConfig.origin).replace(/\/+$/, '')}/api/platform/wallet-convert`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-UMI-Panel-Ticket': ownerRelayTicket({ id: userId }, 'owner-panel', 'POST', 'wallet-convert'),
          },
          body: JSON.stringify({
            token,
            action: req.body?.action === 'status' ? 'status' : 'convert',
            amountIdr: req.body?.amountIdr,
            reference: text(req.body?.reference, 120),
            source: text(req.body?.source, 40) || 'umi-games',
          }),
        }, 40000)
        return send(res, response.status, data)
      } catch (error) {
        return send(res, error.status || 502, { ok: false, error: error.message, code: error.code })
      }
    }
    /* Task64 - Tukar koin RPG menjadi $AS UMI TRADE (tanpa DANA).
       Website hanya meneruskan token akun; verifikasi token, pemotongan koin,
       dan kredit $AS semuanya dilakukan bot (idempoten per referensi). */
    if (path === 'rpg-topup' && req.method === 'POST') {
      rateLimit(req, 'platform:rpg-topup', 60, 60 * 1000)
      const token = text(req.body?.token, 300)
      if (token.length < 16) return send(res, 400, { ok: false, error: 'Token akun diperlukan.' })
      let botConfig = null
      try { botConfig = await getBotApiConfig() } catch {}
      if (!botConfig?.origin) return send(res, 503, { ok: false, error: 'Relay bot belum siap. Coba lagi sebentar.' })
      try {
        const { response, data } = await requestBot(`${String(botConfig.origin).replace(/\/+$/, '')}/api/platform/rpg-koin`, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            action: req.body?.action === 'status' ? 'status' : 'convert',
            amountKoin: req.body?.amountKoin,
            reference: text(req.body?.reference, 120),
            source: text(req.body?.source, 40) || 'umi-games',
          }),
        }, 40000)
        return send(res, response.status, data)
      } catch (error) {
        return send(res, error.status || 502, { ok: false, error: error.message, code: error.code })
      }
    }
    /* Change password */
    if (path === 'auth/change-password' && req.method === 'POST') {
      const user = await authUser(req)
      if (!user) return send(res, 401, { error: 'Unauthorized' })
      const oldPw = String(req.body?.old_password || '')
      const newPw = String(req.body?.new_password || '')
      if (!oldPw) return send(res, 400, { error: 'Password lama wajib diisi.' })
      if (newPw.length < 8 || newPw.length > 128) return send(res, 400, { error: 'Password baru harus 8–128 karakter.' })
      if (newPw === oldPw) return send(res, 400, { error: 'Password baru harus berbeda dari password lama.' })
      // SEC-05: buktikan pemilik akun tahu password lama sebelum menggantinya.
      // Tanpa ini, bearer token yang dicuri (XSS/ekstensi) bisa mengunci pemilik.
      let verified = false
      try {
        const check = await fetch(`${AUTH_URL()}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: { apikey: AUTH_ANON(), 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, password: oldPw }),
          signal: AbortSignal.timeout(12000),
        })
        verified = check.ok
      } catch { verified = false }
      if (!verified) return send(res, 400, { error: 'Password lama tidak cocok.' })
      try {
        await authAdmin(`users/${user.id}`, { method: 'PUT', body: { password: newPw } })
        // Cabut refresh token lain; sesi ini tetap boleh lanjut sampai expiry.
        fetch(`${AUTH_URL()}/auth/v1/logout?scope=others`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${user.token}`, apikey: AUTH_ANON() },
          signal: AbortSignal.timeout(8000),
        }).catch(() => {})
        return send(res, 200, { ok: true, message: 'Password berhasil diubah.' })
      } catch (e) {
        return send(res, 500, { error: 'Gagal mengubah password.' })
      }
    }
    /* Public stats for hero section */
    if (path === 'stats' && req.method === 'GET') {
      try {
        const profiles = await dataRequest('platform_profiles?select=auth_id&limit=10000').catch(() => [])
        // Query bot API public stats endpoint (no auth required)
        let sessions = 0, online = 0
        try {
          const botCfg = await getBotApiConfig()
          const secret = String(process.env.BOT_BACKUP_EXPORT_SECRET || process.env.UMI_ERROR_REPORT_SECRET || '').trim()
          const botRes = await fetch(`${botCfg.origin}/api/stats`, {
            headers: secret ? { Authorization: `Bearer ${secret}` } : {},
            signal: AbortSignal.timeout(8000)
          })
          if (botRes.ok) {
            const botData = await botRes.json()
            sessions = Number(botData.sessions) || 0
            online = Number(botData.online) || 0
          }
        } catch {}
        return send(res, 200, { ok: true, users: profiles.length, online, sessions })
      } catch (e) {
        return send(res, 200, { ok: true, users: 0, online: 0, sessions: 0 })
      }
    }
    /*
     * Laporan error dari bot (server-to-server).
     *
     * Bot tidak punya akun Supabase, jadi rute ini tidak memakai sesi pengguna.
     * Autentikasinya memakai rahasia bersama yang sudah tersedia di kedua sisi —
     * nilai yang sama yang dipakai jalur backup ekspor, sehingga tidak ada kredensial
     * baru yang perlu diprovisikan.
     *
     * Laporan disimpan ke tabel audit yang sama dengan formulir feedback halaman
     * website (`action: 'feedback.submit'`), sehingga muncul di daftar RIWAYAT
     * LAPORAN milik pemilik sesi yang bersangkutan. Rute ini harus berada SEBELUM
     * `authUser(req)` di bawah — kalau tidak, permintaan bot akan ditolak 401.
     */
    if (path === 'feedback/bot' && req.method === 'POST') {
      // Bot bisa mengirim beberapa laporan sekaligus saat satu plugin berulang kali
      // gagal; batasnya lebih longgar daripada formulir pengguna, tetapi tetap ada.
      rateLimit(req, 'platform:feedback:bot', 120, 60 * 60 * 1000)

      const expected = String(process.env.UMI_ERROR_REPORT_SECRET || process.env.BOT_BACKUP_EXPORT_SECRET || '').trim()
      if (!expected) return send(res, 503, { error: 'Penerimaan laporan bot belum dikonfigurasi.' })

      const supplied = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim()
      const expectedBuffer = Buffer.from(expected)
      const suppliedBuffer = Buffer.from(supplied)
      const secretOk = suppliedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(suppliedBuffer, expectedBuffer)
      if (!secretOk) return send(res, 401, { error: 'Rahasia laporan bot ditolak.' })

      const title = text(req.body?.title, 160)
      const description = text(req.body?.description, 5000)
      const steps = text(req.body?.steps, 2500)
      const plugin = text(req.body?.plugin, 160)
      const command = text(req.body?.command, 120)
      const severity = text(req.body?.severity, 20).toLowerCase() || 'error'
      const sessionId = text(req.body?.session_id, 20).replace(/\D/g, '')
      const occurrences = Math.max(1, Math.min(9999, Number(req.body?.occurrences) || 1))
      if (!title || description.length < 10) return send(res, 400, { error: 'Judul dan penjelasan minimal 10 karakter diperlukan.' })

      /*
       * Tentukan penerima laporan.
       *
       * Halaman feedback hanya menampilkan laporan milik pengguna yang sedang masuk
       * (GET memfilter `actor_id`), jadi satu baris audit hanya terlihat oleh satu
       * orang. Error plugin bot perlu dibaca dua pihak: pengguna yang botnya
       * bermasalah, dan operator platform yang harus memperbaiki pluginnya. Karena
       * itu laporan ditulis untuk keduanya (satu baris per penerima; kalau sama,
       * tidak digandakan).
       */
      const recipients = []
      const requestedId = text(req.body?.actor_id, 64)
      const requestedEmail = email(req.body?.actor_email)
      if (/^[0-9a-fA-F-]{36}$/.test(requestedId)) recipients.push({ id: requestedId, email: requestedEmail || null })

      try {
        const owners = await dataRequest(`platform_profiles?select=auth_id,email&email=eq.${encodeURIComponent(FIXED_OWNER)}&limit=1`)
        const owner = owners?.[0]
        if (owner?.auth_id && !recipients.some(item => item.id === owner.auth_id)) {
          recipients.push({ id: owner.auth_id, email: owner.email || FIXED_OWNER })
        }
      } catch {}

      if (!recipients.length) return send(res, 202, { ok: true, stored: false, reason: 'Pemilik laporan tidak dapat ditentukan.' })

      const metadata = {
        target: sessionId ? 'bot' : 'bot-main',
        session_id: sessionId || null,
        title,
        description,
        steps: steps || null,
        page: 'bot-error',
        status: 'open',
        source: 'bot',
        severity,
        plugin: plugin || null,
        command: command || null,
        occurrences,
      }
      const created = await dataRequest('platform_audit_logs', {
        method: 'POST',
        body: recipients.map(item => ({
          actor_id: item.id,
          actor_email: item.email,
          action: 'feedback.submit',
          target: sessionId ? `bot:${sessionId}` : 'bot-main',
          metadata,
        })),
        headers: { Prefer: 'return=representation' },
      })
      return send(res, 201, {
        ok: true,
        deliveredTo: recipients.length,
        feedback: created?.[0] || { action: 'feedback.submit', metadata },
      })
    }

    const user = await authUser(req)
    const profile = await ensureProfile(user)

    if (path === 'me' && req.method === 'GET') return send(res, 200, { user: { id: user.id, email: user.email, username: profile.username || user.username || '', roles: profile.roles, locked: profile.locked, created_at: profile.created_at || user.created_at || null, api_token: profile.api_token || null } })

    if (path === 'chat' && req.method === 'GET') {
      const limit = Math.max(1, Math.min(200, Number(req.query.limit) || 100))
      const rows = await dataRequest(`global_messages?select=id,auth_id,roles,body,created_at&order=created_at.desc&limit=${limit}`)
      const profiles = await dataRequest('platform_profiles?select=auth_id,username,roles&limit=1000')
      const profileMap = new Map((profiles || []).map(item => [item.auth_id, item]))
      return send(res, 200, { messages: (rows || []).reverse().map(message => {
        const current = profileMap.get(message.auth_id)
        return { ...message, display_name: current?.username || `User ${String(message.auth_id).slice(0, 8)}`, roles: current?.roles || message.roles }
      }) })
    }
    if (path === 'chat' && req.method === 'POST') {
      rateLimit(req, `platform:chat:${user.id}`, 30, 60 * 1000)
      const body = text(req.body?.body, 1000)
      if (!body) return send(res, 400, { error: 'Pesan tidak boleh kosong.' })
      const recent = await dataRequest(`global_messages?auth_id=eq.${encodeURIComponent(user.id)}&select=created_at&order=created_at.desc&limit=1`)
      if (recent?.[0] && Date.now() - new Date(recent[0].created_at).getTime() < 1500) return send(res, 429, { error: 'Tunggu sebentar sebelum mengirim pesan lagi.' })
      const inserted = await dataRequest('global_messages', { method: 'POST', body: { auth_id: user.id, email: user.email, roles: profile.roles, body }, headers: { Prefer: 'return=representation' } })
      const saved = inserted?.[0]
      return send(res, 201, { message: saved ? { id: saved.id, auth_id: saved.auth_id, display_name: profile.username || `User ${String(user.id).slice(0, 8)}`, roles: profile.roles, body: saved.body, created_at: saved.created_at } : null })
    }
    if (path.startsWith('chat/') && req.method === 'DELETE') {
      if (!profile.roles.some(r => ['owner', 'admin'].includes(r))) return send(res, 403, { error: 'Role tidak diizinkan menghapus pesan.' })
      const id = safeNumericId(path.split('/')[1], 'ID pesan')
      await dataRequest(`global_messages?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' })
      await audit(user, 'chat.delete', id)
      return send(res, 200, { ok: true })
    }

    if (path === 'feedback' && req.method === 'GET') {
      // Feedback is retained in the existing private audit table so deployments
      // that already have the platform schema can accept reports immediately.
      const rows = await dataRequest(`platform_audit_logs?actor_id=eq.${encodeURIComponent(user.id)}&action=eq.feedback.submit&select=id,action,target,metadata,created_at&order=created_at.desc&limit=100`)
      return send(res, 200, { feedback: rows || [] })
    }
    if (path === 'feedback' && req.method === 'POST') {
      rateLimit(req, `platform:feedback:${user.id}`, 10, 60 * 60 * 1000)
      const target = text(req.body?.target, 20).toLowerCase()
      const sessionId = text(req.body?.session_id, 20).replace(/\D/g, '')
      const title = text(req.body?.title, 160)
      const description = text(req.body?.description, 5000)
      const steps = text(req.body?.steps, 2500)
      const page = text(req.body?.page, 120)
      if (!['website', 'bot'].includes(target) || !title || description.length < 10) {
        return send(res, 400, { error: 'Target, judul, dan penjelasan bug minimal 10 karakter diperlukan.' })
      }
      if (target === 'bot') {
        if (!/^\d{7,15}$/.test(sessionId)) return send(res, 400, { error: 'Pilih session bot yang ingin dilaporkan.' })
        // The bot API verifies that this session belongs to the reporting user.
        await botRequest(`session/status?session_id=${encodeURIComponent(sessionId)}`, user)
      }
      const metadata = {
        target,
        session_id: target === 'bot' ? sessionId : null,
        title,
        description,
        steps: steps || null,
        page: page || null,
        status: 'open',
      }
      const created = await dataRequest('platform_audit_logs', {
        method: 'POST',
        body: {
          actor_id: user.id,
          actor_email: user.email,
          action: 'feedback.submit',
          target: target === 'bot' ? `bot:${sessionId}` : 'website',
          metadata,
        },
        headers: { Prefer: 'return=representation' },
      })
      return send(res, 201, { ok: true, feedback: created?.[0] || { action: 'feedback.submit', target: target === 'bot' ? `bot:${sessionId}` : 'website', metadata } })
    }

    // Agent owner operations never pass through the browser-to-bot proxy.
    // This server has already verified the Supabase profile role, then mints
    // a short-lived, audience-bound ticket for exactly one backend request.
    if (path === 'agent/status' && req.method === 'GET') {
      requireOwner(profile)
      return send(res, 200, await botAgentRequest('status', user))
    }
    if (path === 'agent/chat' && req.method === 'POST') {
      requireOwner(profile)
      rateLimit(req, `platform:agent-chat:${user.id}`, 30, 10 * 60 * 1000)
      const prompt = String(req.body?.prompt ?? '')
      if (!prompt.trim() || prompt.length > 12000 || prompt.includes('\0')) return send(res, 400, { error: 'Prompt Agent tidak valid.' })
      return send(res, 200, await botAgentRequest('chat', user, { method: 'POST', body: { prompt } }))
    }
    if (path === 'agent/settings' && req.method === 'POST') {
      requireOwner(profile)
      rateLimit(req, `platform:agent-settings:${user.id}`, 10, 60 * 60 * 1000)
      const apiKey = String(req.body?.apiKey ?? req.body?.openrouterApiKey ?? '')
      // Task78: Gemini ikut didukung dan jadi default — key Gemini owner sudah
      // terpasang di server bot (.env.gemini), jadi AI Agent & AI Owner memakai
      // provider yang benar-benar hidup, bukan menebak Groq/OpenRouter.
      const provider = String(req.body?.provider || (req.body?.openrouterApiKey ? 'openrouter' : 'gemini'))
      const model = String(req.body?.model ?? '').trim()
      if (!['groq','openrouter','gemini'].includes(provider) || (apiKey && apiKey.length < 16) || apiKey.length > 1000 || apiKey.includes('\0') || model.includes('\0') || model.length > 160) return send(res, 400, { error: 'Konfigurasi AI tidak valid.' })
      await audit(user, 'agent.settings.update', user.id, { provider, model })
      return send(res, 200, await botAgentRequest('settings', user, { method: 'POST', body: { apiKey, provider, model } }))
    }
    // Tes koneksi provider AI aktif (tombol "TES KONEKSI AI" di AI Owner).
    // Hasil apa adanya: kalau kuota habis, pesan 429 dari bot yang diteruskan.
    if (path === 'agent/test' && req.method === 'POST') {
      requireOwner(profile)
      rateLimit(req, `platform:agent-test:${user.id}`, 6, 10 * 60 * 1000)
      const result = await botAgentRequest('test', user, { method: 'POST', body: {} })
      await audit(user, 'agent.connection.test', user.id, { provider: result?.provider || null, ok: Boolean(result?.ok) })
      return send(res, 200, result)
    }
    if (path === 'agent/shell' && req.method === 'POST') {
      requireOwner(profile)
      rateLimit(req, `platform:agent-shell:${user.id}`, 20, 10 * 60 * 1000)
      const command = String(req.body?.command ?? '')
      if (!command.trim() || command.length > 2000 || command.includes('\0')) return send(res, 400, { error: 'Command Agent tidak valid.' })
      return send(res, 200, await botAgentRequest('shell', user, { method: 'POST', body: { command } }))
    }

    // Pterodactyl and payment credentials are accepted only by this owner-only
    // relay and forwarded once to the encrypted bot-runtime vault. They are not
    // persisted in Website audit rows, browser storage, or responses.
    if (path === 'panel/status' && req.method === 'GET') {
      requireOwner(profile)
      return send(res, 200, await botPanelRequest('status', user))
    }
    if (path === 'panel/settings' && req.method === 'POST') {
      requireOwner(profile)
      rateLimit(req, `platform:panel-settings:${user.id}`, 10, 60 * 60 * 1000)
      const fields = ['panelUrl', 'siteUrl', 'paymentMode', 'tripayChannel', 'plta', 'pltc', 'tripayMerchantCode', 'tripayApiKey', 'tripayPrivateKey']
      const body = {}
      for (const field of fields) {
        if (!Object.prototype.hasOwnProperty.call(req.body || {}, field)) continue
        const value = String(req.body?.[field] ?? '')
        if (value.length > 1000 || value.includes('\0')) return send(res, 400, { error: 'Konfigurasi Panel tidak valid.' })
        body[field] = value
      }
      for (const field of ['clearPlta', 'clearPltc', 'clearTripay']) {
        if (Object.prototype.hasOwnProperty.call(req.body || {}, field)) body[field] = req.body[field] === true
      }
      if (req.body?.provisioning && typeof req.body.provisioning === 'object' && !Array.isArray(req.body.provisioning)) {
        if (JSON.stringify(req.body.provisioning).length > 6000) return send(res, 400, { error: 'Konfigurasi provisioning terlalu besar.' })
        body.provisioning = req.body.provisioning
      }
      if (Object.prototype.hasOwnProperty.call(req.body || {}, 'products')) {
        if (!Array.isArray(req.body.products) || req.body.products.length > 30 || JSON.stringify(req.body.products).length > 120000) return send(res, 400, { error: 'Katalog produk tidak valid.' })
        body.products = req.body.products
      }
      const result = await botPanelRequest('settings', user, { method: 'POST', body })
      await audit(user, 'panel.settings.update', 'auto-order', { panelUrlChanged: Object.prototype.hasOwnProperty.call(body, 'panelUrl'), pltaReplaced: Boolean(body.plta), pltcReplaced: Boolean(body.pltc), tripayReplaced: Boolean(body.tripayMerchantCode || body.tripayApiKey || body.tripayPrivateKey), credentialsCleared: Boolean(body.clearPlta || body.clearPltc || body.clearTripay) })
      return send(res, 200, result)
    }
    if (path === 'panel/packages' && req.method === 'POST') {
      requireOwner(profile)
      rateLimit(req, `platform:panel-packages:${user.id}`, 20, 60 * 60 * 1000)
      const packages = req.body?.packages
      if (!Array.isArray(packages) || packages.length > 20) return send(res, 400, { error: 'Katalog paket tidak valid.' })
      const result = await botPanelRequest('packages', user, { method: 'POST', body: { packages } })
      await audit(user, 'panel.packages.update', 'auto-order', { count: packages.length })
      return send(res, 200, result)
    }
    if (path === 'panel/test-connection' && req.method === 'POST') {
      requireOwner(profile)
      rateLimit(req, `platform:panel-test:${user.id}`, 10, 10 * 60 * 1000)
      const result = await botPanelRequest('test-connection', user, { method: 'POST', body: {} })
      await audit(user, 'panel.connection.test', 'auto-order', { pterodactyl: Boolean(result.pterodactyl), bridge: Boolean(result.bridge) })
      return send(res, 200, result)
    }

    if (path === 'panel/manual-topups' && req.method === 'GET') {
      requireOwner(profile)
      return send(res, 200, await botPanelRequest('manual-topups', user))
    }
    if (path === 'panel/manual-topups/review' && req.method === 'POST') {
      requireOwner(profile)
      rateLimit(req, `platform:manual-topup-review:${user.id}`, 30, 10 * 60 * 1000)
      const id = text(req.body?.id, 100)
      const decision = text(req.body?.decision, 20).toLowerCase()
      if (!/^tu_[a-z0-9_]+$/i.test(id) || !['approve', 'reject'].includes(decision)) return send(res, 400, { error: 'Permintaan verifikasi top up tidak valid.' })
      const result = await botPanelRequest('manual-topups/review', user, { method: 'POST', body: { id, decision } })
      await audit(user, `wallet.manual_topup.${decision}`, id, { amount: Number(result.topup?.amount) || 0 })
      return send(res, 200, result)
    }

    if (path === 'main-console/status' && req.method === 'GET') {
      requireMainBot(profile)
      return send(res, 200, { status: await botConsoleRequest('status', user) })
    }
    if (path === 'main-console/logs' && req.method === 'GET') {
      requireMainBot(profile)
      const cursor = Math.max(0, Math.min(9007199254740991, Math.floor(Number(req.query.cursor) || 0)))
      return send(res, 200, await botConsoleRequest(`logs?cursor=${cursor}`, user))
    }
    if (path === 'main-console/input' && req.method === 'POST') {
      requireMainBot(profile)
      rateLimit(req, `platform:main-console-input:${user.id}`, 30, 60 * 1000)
      const input = String(req.body?.input ?? '')
      if (!input || input.length > 4096 || input.includes('\0')) return send(res, 400, { error: 'Input terminal tidak valid.' })
      // Deliberately not audited: terminal input can contain a WhatsApp number
      // or pairing code and must never be persisted by the website.
      return send(res, 200, await botConsoleRequest('input', user, { method: 'POST', body: { input } }))
    }

    // Nomor bot utama disimpan permanen di server bot. Websitenya sendiri tidak
    // pernah menyimpan nomor ini, dan audit tidak merekam nilainya.
    if (path === 'main-console/pairing-number' && req.method === 'POST') {
      requireMainBot(profile)
      rateLimit(req, `platform:main-bot-number:${user.id}`, 10, 60 * 1000)
      const number = String(req.body?.number ?? '').replace(/\D/g, '')
      if (number.length < 8 || number.length > 15) return send(res, 400, { error: 'Nomor bot utama tidak valid.' })
      const result = await botConsoleRequest('pairing-number', user, { method: 'POST', body: { number, request: true } })
      await audit(user, 'main_bot.pairing_number_set', null, { prefix: number.slice(0, 4) })
      return send(res, 200, result)
    }

    // Tombol "MINTA CODE LAGI": nomor tidak berubah, hanya minta kode baru.
    // Server bot menjawab cepat lalu pairing jalan di latar belakang; halaman
    // memantau status tiap beberapa detik, jadi relay tidak kena timeout.
    if (path === 'main-console/pairing-request' && req.method === 'POST') {
      requireMainBot(profile)
      rateLimit(req, `platform:main-bot-code:${user.id}`, 12, 60 * 1000)
      const result = await botConsoleRequest('pairing-request', user, { method: 'POST', body: {} })
      await audit(user, 'main_bot.pairing_request', null, {})
      return send(res, 200, result)
    }

    // Hapus sesi WhatsApp bot utama (bukan sesi jadibot). Ini resep yang terbukti
    // memperbaiki sesi rusak/logout sehingga pairing code kembali terbit.
    if (path === 'main-console/main-session' && req.method === 'POST') {
      requireMainBot(profile)
      rateLimit(req, `platform:main-bot-session:${user.id}`, 6, 5 * 60 * 1000)
      const result = await botConsoleRequest('main-session', user, { method: 'POST', body: {} })
      await audit(user, 'main_bot.session_deleted', null, { files: Number(result?.removed) || 0 })
      return send(res, 200, result)
    }

    // Reset konfigurasi bot utama (.main-bot.env): nomor pairing + status on/off.
    if (path === 'main-console/main-config' && req.method === 'POST') {
      requireMainBot(profile)
      rateLimit(req, `platform:main-bot-config:${user.id}`, 6, 30 * 60 * 1000)
      const result = await botConsoleRequest('main-config', user, { method: 'POST', body: {} })
      await audit(user, 'main_bot.config_reset', null, {})
      return send(res, 200, result)
    }

    // Auto read (centang biru otomatis) bot utama — dibaca handler bot dari
    // settings[<jid bot>].autoread, jadi tidak perlu restart bot.
    if (path === 'main-console/autoread' && req.method === 'GET') {
      requireMainBot(profile)
      return send(res, 200, await botConsoleRequest('autoread', user))
    }
    if (path === 'main-console/autoread' && req.method === 'POST') {
      requireMainBot(profile)
      rateLimit(req, `platform:main-autoread:${user.id}`, 30, 60 * 1000)
      const enabled = req.body?.enabled
      if (typeof enabled !== 'boolean') return send(res, 400, { error: 'Nilai enabled harus true atau false.' })
      const result = await botConsoleRequest('autoread', user, { method: 'POST', body: { enabled } })
      await audit(user, `main_bot.autoread_${enabled ? 'on' : 'off'}`, null, { sessions: Number(result.jids) || 0 })
      return send(res, 200, result)
    }

    if (path === 'main-console/main-bot' && req.method === 'POST') {
      requireMainBot(profile)
      rateLimit(req, `platform:main-bot-toggle:${user.id}`, 20, 60 * 1000)
      const enabled = req.body?.enabled
      if (typeof enabled !== 'boolean') return send(res, 400, { error: 'Nilai enabled harus true atau false.' })
      const result = await botConsoleRequest('main-bot', user, { method: 'POST', body: { enabled } })
      await audit(user, `main_bot.${enabled ? 'enabled' : 'disabled'}`, null, {})
      return send(res, 200, result)
    }

    /* Task80: setting lengkap bot utama (umum, menu, AutoAI, link, premium)
     * dan API key. Nilai key tidak pernah diaudit maupun dikembalikan utuh. */
    if (path === 'main-console/settings' && req.method === 'GET') {
      requireMainBot(profile)
      return send(res, 200, await botConsoleRequest('settings', user))
    }
    if (path === 'main-console/settings' && req.method === 'POST') {
      requireMainBot(profile)
      rateLimit(req, `platform:main-settings:${user.id}`, 20, 5 * 60 * 1000)
      const body = req.body && typeof req.body === 'object' ? req.body : {}
      const result = await botConsoleRequest('settings', user, { method: 'POST', body })
      await audit(user, 'main_bot.settings_updated', null, { fields: Object.keys(body).slice(0, 40) })
      return send(res, 200, result)
    }
    if (path === 'main-console/settings/reset' && req.method === 'POST') {
      requireMainBot(profile)
      rateLimit(req, `platform:main-settings-reset:${user.id}`, 3, 30 * 60 * 1000)
      const result = await botConsoleRequest('settings/reset', user, { method: 'POST', body: {} })
      await audit(user, 'main_bot.settings_reset', null, {})
      return send(res, 200, result)
    }
    if (path === 'main-console/apikey' && req.method === 'POST') {
      requireMainBot(profile)
      rateLimit(req, `platform:main-apikey:${user.id}`, 10, 60 * 60 * 1000)
      const body = req.body && typeof req.body === 'object' ? req.body : {}
      const provider = ['gemini', 'groq', 'openrouter', 'tenor', 'pastebin', 'neuralframes'].includes(String(body.provider)) ? String(body.provider) : 'unknown'
      const payload = { provider, delete: body.delete === true }
      if (!payload.delete && typeof body.api_key === 'string') payload.api_key = body.api_key.slice(0, 400)
      const result = await botConsoleRequest('apikey', user, { method: 'POST', body: payload })
      // Jangan pernah menyimpan nilai key di audit log.
      await audit(user, `main_bot.apikey_${payload.delete ? 'deleted' : 'saved'}`, provider, {})
      return send(res, 200, result)
    }

    if (path === 'admin/users' && req.method === 'GET') {
      requireOwner(profile)
      const auth = await authAdmin('users?page=1&per_page=1000')
      let profiles = await dataRequest('platform_profiles?select=*&order=created_at.desc&limit=1000')
      let pmap = new Map((profiles || []).map(x => [x.auth_id, x]))
      const missing = (auth.users || []).filter(item => !pmap.has(item.id)).map(item => {
        const itemEmail = email(item.email)
        return { auth_id: item.id, email: itemEmail, username: text(item.user_metadata?.username || item.user_metadata?.name || '', 40), roles: fixedRoles(itemEmail) || ['user'], locked: itemEmail === FIXED_OWNER, banned: false }
      })
      if (missing.length) {
        const added = await dataRequest('platform_profiles', { method: 'POST', body: missing, headers: { Prefer: 'resolution=merge-duplicates,return=representation' } })
        profiles = [...(profiles || []), ...(added || [])]
        pmap = new Map(profiles.map(x => [x.auth_id, x]))
      }
      /*
       * Status bot TIDAK boleh disamarkan menjadi 0.
       *
       * Sebelumnya kegagalan backend bot ditelan `catch {}` sehingga panel owner
       * menampilkan "0 bot connect" padahal bot hidup. Sekarang kegagalannya
       * dilaporkan lewat `errors.sessions` + `bot.reachable` supaya UI bisa
       * membedakan "memang tidak ada sesi" dari "backend tidak terjangkau".
       */
      const sessionTotals = await botSessionTotals(user)
      const sessions = sessionTotals.sessions
      const sessionsError = sessionTotals.error
      return send(res, 200, {
        users: (auth.users || []).map(item => {
          const p = pmap.get(item.id)
          const itemEmail = email(item.email)
          return { id: item.id, email: itemEmail, username: p?.username || text(item.user_metadata?.username || item.user_metadata?.name || '', 40), roles: fixedRoles(itemEmail) || p?.roles || ['user'], locked: itemEmail === FIXED_OWNER || Boolean(p?.locked), banned: Boolean(p?.banned), created_at: item.created_at, last_sign_in_at: item.last_sign_in_at, sessions: sessions.filter(s => s.userId === item.id) }
        }),
        totals: { users: (auth.users || []).length, sessions: sessionTotals.total, online: sessionTotals.online, offline: sessionTotals.offline },
        generatedAt: new Date().toISOString(),
        sessionSource: sessionTotals.source,
        errors: { sessions: sessionsError },
        bot: { reachable: !sessionsError },
      })
    }

    /*
     * Ringkasan real-time panel owner (polling ringan 10 detik).
     *
     * `admin/users` menarik sampai 1000 akun + audit tiap kali dipanggil, jadi
     * tidak layak dipakai untuk auto-refresh. Rute ini hanya menghitung angka
     * kunci dan MENGEMBALIKAN ERROR PER SUMBER, bukan 0 palsu:
     *   · users    → Supabase Auth (fallback: tabel platform_profiles)
     *   · sessions → API bot (fallback: /api/stats dengan rahasia bersama)
     */
    if (path === 'admin/live' && req.method === 'GET') {
      requireOwner(profile)
      rateLimit(req, `platform:admin-live:${user.id}`, 240, 60 * 1000)
      const generatedAt = new Date().toISOString()
      const live = {
        ok: true,
        generatedAt,
        users: { value: null, source: 'auth', error: null },
        sessions: { total: null, online: null, offline: null, source: 'bot', error: null, checkedAt: null },
        bot: { reachable: false },
      }

      try {
        const auth = await authAdmin('users?page=1&per_page=1000')
        live.users.value = Array.isArray(auth.users) ? auth.users.length : 0
      } catch (error) {
        live.users.error = error.message || 'Daftar akun tidak dapat dibaca.'
        try {
          const rows = await dataRequest('platform_profiles?select=auth_id&limit=10000')
          live.users.value = Array.isArray(rows) ? rows.length : null
          live.users.source = 'profiles'
        } catch { live.users.value = null }
      }

      const totals = await botSessionTotals(user)
      if (totals.error) live.sessions.error = totals.error
      if (totals.total !== null) {
        live.sessions.total = totals.total
        live.sessions.online = totals.online
        live.sessions.offline = totals.offline
        live.sessions.source = totals.source
        live.sessions.checkedAt = totals.checkedAt
        live.bot.reachable = true
      }

      return send(res, 200, live)
    }

    if (path === 'admin/users' && req.method === 'POST') {
      requireOwner(profile)
      const targetEmail = email(req.body?.email)
      const username = text(req.body?.username, 40)
      const password = String(req.body?.password || '')
      if (!/^\S+@\S+\.\S+$/.test(targetEmail) || password.length < 8 || password.length > 128 || !/^[A-Za-z0-9_.-]{3,40}$/.test(username)) return send(res, 400, { error: 'Username valid, email valid, dan password 8–128 karakter diperlukan.' })
      const created = await authAdmin('users', { method: 'POST', body: { email: targetEmail, password, email_confirm: true, user_metadata: { username } } })
      const roles = normalizedRoles(req.body?.roles, targetEmail)
      await dataRequest('platform_profiles', { method: 'POST', body: { auth_id: created.id, email: targetEmail, username, roles, locked: targetEmail === FIXED_OWNER, banned: false }, headers: { Prefer: 'resolution=merge-duplicates,return=representation' } })
      await audit(user, 'account.create', created.id, { email: targetEmail, username, roles })
      return send(res, 201, { user: { id: created.id, email: targetEmail, username, roles } })
    }
    if (path.startsWith('admin/users/') && req.method === 'DELETE') {
      requireOwner(profile)
      const id = safeUuid(path.split('/')[2], 'ID akun')
      const rows = await dataRequest(`platform_profiles?auth_id=eq.${encodeURIComponent(id)}&select=*`)
      if (rows?.[0]?.email === FIXED_OWNER || id === user.id) return send(res, 403, { error: 'Akun owner utama dikunci dan tidak dapat dihapus.' })
      await authAdmin(`users/${encodeURIComponent(id)}`, { method: 'DELETE' })
      await dataRequest(`platform_profiles?auth_id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' })
      await audit(user, 'account.delete', id, { email: rows?.[0]?.email })
      return send(res, 200, { ok: true })
    }
    if (/^admin\/users\/[^/]+\/roles$/.test(path) && req.method === 'PATCH') {
      requireOwner(profile)
      const id = safeUuid(path.split('/')[2], 'ID akun')
      const rows = await dataRequest(`platform_profiles?auth_id=eq.${encodeURIComponent(id)}&select=*`)
      const target = rows?.[0]
      if (!target) return send(res, 404, { error: 'Profil akun tidak ditemukan.' })
      if (target.email === FIXED_OWNER) return send(res, 403, { error: 'Role owner utama dikunci.' })
      const roles = normalizedRoles(req.body?.roles, target.email)
      const updated = await dataRequest(`platform_profiles?auth_id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: { roles, updated_at: new Date().toISOString() }, headers: { Prefer: 'return=representation' } })
      await audit(user, 'account.roles', id, { email: target.email, roles })
      return send(res, 200, { profile: updated?.[0] })
    }
    if (/^admin\/users\/[^/]+\/ban$/.test(path) && req.method === 'PATCH') {
      requireOwner(profile)
      const id = safeUuid(path.split('/')[2], 'ID akun')
      const rows = await dataRequest(`platform_profiles?auth_id=eq.${encodeURIComponent(id)}&select=*`)
      const target = rows?.[0]
      if (!target) return send(res, 404, { error: 'Profil akun tidak ditemukan.' })
      if (target.email === FIXED_OWNER) return send(res, 403, { error: 'Owner utama tidak dapat diblokir.' })
      const banned = Boolean(req.body?.banned)
      await authAdmin(`users/${encodeURIComponent(id)}`, { method: 'PUT', body: { ban_duration: banned ? '876000h' : 'none' } })
      await dataRequest(`platform_profiles?auth_id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: { banned, updated_at: new Date().toISOString() } })
      await audit(user, banned ? 'account.ban' : 'account.unban', id, { email: target.email })
      return send(res, 200, { ok: true, banned })
    }

    if (path === 'plugins' && req.method === 'GET') {
      const rows = await dataRequest(`plugin_catalog?select=*&active=eq.true&order=created_at.desc&limit=200`)
      return send(res, 200, { plugins: (rows || []).map(row => pluginSummary(row, false)) })
    }
    if (path === 'plugins' && req.method === 'POST') {
      requireOwner(profile)
      rateLimit(req, `platform:plugin-upload:${user.id}`, 10, 60 * 60 * 1000)
      const filename = text(req.body?.filename, 100).replace(/[^a-zA-Z0-9_.-]/g, '-')
      const code = String(req.body?.code || '')
      const slug = text(req.body?.slug || filename.replace(/\.js$/i, ''), 64).toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/^-+|-+$/g, '')
      if (!filename.endsWith('.js') || !/^[a-z0-9][a-z0-9_-]{1,63}$/.test(slug)) return send(res, 400, { error: 'Nama plugin atau slug tidak valid.' })
      if (!code || Buffer.byteLength(code) > 524288 || code.includes('\0')) return send(res, 400, { error: 'File plugin kosong atau melebihi 512 KB.' })
      const blocked = [
        /(?:node:)?child_process/i,
        /process\.env/i,
        /fs(?:\/promises)?['"]?\s*\)?\s*\.\s*(?:rm|unlink|rmdir)/i,
        /\beval\s*\(/i,
        /new\s+Function\s*\(/i,
        /(?:node:)?vm(?:['"]|\b)/i,
        /worker_threads/i,
      ]
      const violations = blocked.filter(rx => rx.test(code)).map(rx => rx.source)
      if (violations.length) return send(res, 400, { error: 'Plugin mengandung operasi berisiko tinggi dan ditolak.', violations })
      const inserted = await dataRequest('plugin_catalog', { method: 'POST', body: { slug, filename, description: text(req.body?.description, 1000), code, uploader_id: user.id, uploader_email: user.email, active: true }, headers: { Prefer: 'return=representation' } })
      await audit(user, 'plugin.upload', inserted?.[0]?.id, { slug, filename, security_scan: 'passed' })
      return send(res, 201, { plugin: pluginSummary(inserted?.[0], false), warnings: [] })
    }
    if (/^plugins\/[^/]+$/.test(path) && req.method === 'GET') {
      const id = safeUuid(path.split('/')[1], 'ID plugin')
      const rows = await dataRequest(`plugin_catalog?id=eq.${encodeURIComponent(id)}&select=*`)
      if (!rows?.[0]) return send(res, 404, { error: 'Plugin tidak ditemukan.' })
      return send(res, 200, { plugin: pluginSummary(rows[0], true) })
    }
    if (/^plugins\/[^/]+$/.test(path) && req.method === 'DELETE') {
      requireOwner(profile)
      const id = safeUuid(path.split('/')[1], 'ID plugin')
      await dataRequest(`plugin_catalog?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', body: { active: false, updated_at: new Date().toISOString() } })
      await audit(user, 'plugin.disable', id)
      return send(res, 200, { ok: true })
    }
    if (/^plugins\/[^/]+\/install$/.test(path) && req.method === 'POST') {
      const id = safeUuid(path.split('/')[1], 'ID plugin')
      const sessionId = text(req.body?.session_id, 20).replace(/\D/g, '')
      const rows = await dataRequest(`plugin_catalog?id=eq.${encodeURIComponent(id)}&active=eq.true&select=*`)
      if (!rows?.[0]) return send(res, 404, { error: 'Plugin tidak ditemukan.' })
      const plugin = rows[0]
      const installBody = { session_id: sessionId, filename: plugin.filename, code: plugin.code, catalog_id: plugin.id }
      const timestamp = String(Date.now())
      const digest = crypto.createHash('sha256').update(JSON.stringify(installBody)).digest('hex')
      const privateKey = String(process.env.UMI_PLUGIN_SIGNING_PRIVATE_KEY || '')
      if (!privateKey) throw Object.assign(new Error('Penandatanganan plugin belum dikonfigurasi.'), { status: 503 })
      const signature = crypto.sign(null, Buffer.from(`${timestamp}.${digest}`), privateKey).toString('base64')
      const result = await botRequest('plugin/install', user, { method: 'POST', body: installBody, headers: { 'X-Umi-Timestamp': timestamp, 'X-Umi-Signature': signature } })
      await dataRequest('plugin_installs', { method: 'POST', body: { plugin_id: plugin.id, auth_id: user.id, session_id: sessionId, status: 'installed', installed_at: new Date().toISOString(), updated_at: new Date().toISOString() }, headers: { Prefer: 'resolution=merge-duplicates' } })
      await audit(user, 'plugin.install', id, { session_id: sessionId })
      return send(res, 200, { ok: true, result })
    }

    if (path === 'media/sign' && req.method === 'POST') {
      rateLimit(req, `platform:media-sign:${user.id}`, 20, 60 * 60 * 1000)
      const sessionId = text(req.body?.session_id, 20).replace(/\D/g, '')
      const kind = text(req.body?.kind, 30)
      const mime = text(req.body?.mime_type, 100).toLowerCase()
      const extMap = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'video/mp4': 'mp4', 'video/webm': 'webm', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/ogg': 'ogg', 'audio/opus': 'opus' }
      const expectedType = kind === 'menu_audio' ? 'audio/' : kind === 'menu_video' ? 'video/' : 'image/'
      if (!/^\d{7,15}$/.test(sessionId) || !['logo','menu_banner','menu_video','menu_audio','welcome_image','goodbye_image','thumbnail'].includes(kind) || !extMap[mime] || !mime.startsWith(expectedType)) return send(res, 400, { error: 'Data media tidak valid.' })
      await botRequest(`session/status?session_id=${encodeURIComponent(sessionId)}`, user)
      const objectPath = `${user.id}/${sessionId}/${kind}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${extMap[mime]}`
      const response = await fetch(`${DATA_URL()}/storage/v1/object/upload/sign/umi-media/${objectPath}`, { method: 'POST', headers: { apikey: DATA_KEY(), Authorization: `Bearer ${DATA_KEY()}`, 'Content-Type': 'application/json', 'x-upsert': 'true' }, body: '{}', signal: AbortSignal.timeout(15000) })
      const signed = await response.json()
      if (!response.ok) throw Object.assign(new Error(signed.message || 'Gagal membuat izin upload.'), { status: response.status })
      const signedUrl = /^https?:\/\//i.test(String(signed.url || ''))
        ? String(signed.url)
        : `${DATA_URL()}/storage/v1${String(signed.url || '').startsWith('/') ? '' : '/'}${signed.url}`
      return send(res, 200, { path: objectPath, token: new URL(signedUrl).searchParams.get('token'), signed_url: signedUrl })
    }
    // Owner-only ZIP file hosting: objects live in the private `umi-files`
    // Supabase Storage bucket under the `owner/` prefix. Browsers upload
    // directly via signed URLs (no serverless body limit); listing reads the
    // bucket itself, so there is no separate metadata table to keep in sync.
    if (path.startsWith('files/')) {
      requireOwner(profile)
      if (!DATA_URL() || !DATA_KEY()) throw Object.assign(new Error('Storage platform belum dikonfigurasi.'), { status: 503 })
      const BUCKET = 'umi-files'
      const storageHeaders = { apikey: DATA_KEY(), Authorization: `Bearer ${DATA_KEY()}`, 'Content-Type': 'application/json' }
      const storageFetch = (suffix, init = {}) => fetch(`${DATA_URL()}/storage/v1${suffix}`, { headers: storageHeaders, signal: AbortSignal.timeout(20000), ...init })
      const ensureBucket = async () => {
        const check = await storageFetch(`/bucket/${BUCKET}`)
        if (!check.ok) {
          await storageFetch('/bucket', { method: 'POST', body: JSON.stringify({ id: BUCKET, name: BUCKET, public: false }) }).catch(() => {})
        }
      }
      const safeObjectPath = (value) => {
        const objectPath = text(value, 400)
        if (!objectPath.startsWith('owner/') || objectPath.includes('..') || !/^[A-Za-z0-9_./-]+$/.test(objectPath)) throw Object.assign(new Error('Path file tidak diizinkan.'), { status: 403 })
        return objectPath
      }
      if (path === 'files/list' && req.method === 'GET') {
        await ensureBucket()
        const response = await storageFetch(`/object/list/${BUCKET}`, { method: 'POST', body: JSON.stringify({ prefix: 'owner', limit: 100, offset: 0, sortBy: { column: 'created_at', order: 'desc' } }) })
        const rows = await response.json().catch(() => [])
        if (!response.ok) throw Object.assign(new Error(rows?.message || 'Gagal membaca daftar file.'), { status: response.status })
        const files = (Array.isArray(rows) ? rows : []).filter(item => item?.name && item.name !== '.emptyFolderPlaceholder' && item.metadata)
          .map(item => ({
            path: `owner/${item.name}`,
            name: item.name.replace(/^\d{10,}_[a-f0-9]{8}_/, ''),
            size: Number(item.metadata?.size) || 0,
            createdAt: item.created_at || item.updated_at || null,
          }))
        return send(res, 200, { files })
      }
      if (path === 'files/sign-upload' && req.method === 'POST') {
        rateLimit(req, `platform:files-sign:${user.id}`, 20, 60 * 60 * 1000)
        const rawName = text(req.body?.filename, 200).split(/[\\/]/).pop() || ''
        const cleanName = rawName.replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 140)
        const size = Number(req.body?.size)
        if (!/\.zip$/i.test(cleanName) || cleanName.length < 5) return send(res, 400, { error: 'Hanya file .zip yang diterima.' })
        if (!Number.isInteger(size) || size < 1 || size > 50 * 1024 * 1024) return send(res, 400, { error: 'Ukuran file harus 1 byte – 50 MB.' })
        await ensureBucket()
        const objectPath = `owner/${Date.now()}_${crypto.randomBytes(4).toString('hex')}_${cleanName}`
        const response = await storageFetch(`/object/upload/sign/${BUCKET}/${objectPath}`, { method: 'POST', body: '{}' })
        const signed = await response.json().catch(() => ({}))
        if (!response.ok) throw Object.assign(new Error(signed.message || 'Gagal membuat izin upload.'), { status: response.status })
        const signedUrl = /^https?:\/\//i.test(String(signed.url || '')) ? String(signed.url) : `${DATA_URL()}/storage/v1${String(signed.url || '').startsWith('/') ? '' : '/'}${signed.url}`
        await audit(user, 'files.upload_sign', objectPath, { filename: cleanName, size })
        return send(res, 200, { path: objectPath, signed_url: signedUrl })
      }
      if (path === 'files/download' && req.method === 'POST') {
        rateLimit(req, `platform:files-download:${user.id}`, 60, 60 * 60 * 1000)
        const objectPath = safeObjectPath(req.body?.path)
        await ensureBucket()
        const response = await storageFetch(`/object/sign/${BUCKET}/${objectPath}`, { method: 'POST', body: JSON.stringify({ expiresIn: 3600 }) })
        const signed = await response.json().catch(() => ({}))
        if (!response.ok) throw Object.assign(new Error(signed.message || 'Gagal membuat link unduh.'), { status: response.status })
        const rawUrl = String(signed.signedURL || signed.signedUrl || signed.url || '')
        const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `${DATA_URL()}/storage/v1${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`
        await audit(user, 'files.download', objectPath, {})
        return send(res, 200, { url, expiresIn: 3600 })
      }
      if (path === 'files/delete' && req.method === 'POST') {
        rateLimit(req, `platform:files-delete:${user.id}`, 30, 60 * 60 * 1000)
        const objectPath = safeObjectPath(req.body?.path)
        const response = await storageFetch(`/object/${BUCKET}`, { method: 'DELETE', body: JSON.stringify({ prefixes: [objectPath] }) })
        const result = await response.json().catch(() => [])
        if (!response.ok) throw Object.assign(new Error(result?.message || 'Gagal menghapus file.'), { status: response.status })
        await audit(user, 'files.delete', objectPath, {})
        return send(res, 200, { ok: true, deleted: Array.isArray(result) ? result.length : 0 })
      }
      return send(res, 404, { error: 'Endpoint file tidak ditemukan.' })
    }

    if (path === 'media/apply' && req.method === 'POST') {
      const sessionId = text(req.body?.session_id, 20).replace(/\D/g, '')
      const kind = text(req.body?.kind, 30)
      let sourceUrl = text(req.body?.url, 2000)
      const storagePath = text(req.body?.storage_path, 1000)
      if (!/^\d{7,15}$/.test(sessionId)) return send(res, 400, { error: 'Session tidak valid.' })
      if (storagePath) {
        const expectedPrefix = `${user.id}/${sessionId}/`
        if (!storagePath.startsWith(expectedPrefix) || storagePath.includes('..') || !/^[A-Za-z0-9_./-]+$/.test(storagePath)) return send(res, 403, { error: 'Path media tidak diizinkan.' })
        sourceUrl = `${DATA_URL()}/storage/v1/object/public/umi-media/${storagePath.split('/').map(encodeURIComponent).join('/')}`
      }
      try { sourceUrl = await resolvedPublicHttpUrl(sourceUrl) } catch (error) { return send(res, error.status || 400, { error: error.message }) }
      if (!['logo','menu_banner','menu_video','menu_audio','welcome_image','goodbye_image','thumbnail'].includes(kind)) return send(res, 400, { error: 'Jenis media tidak valid.' })
      const sizeBytes = Math.max(0, Number(req.body?.size_bytes) || 0)
      const maxBytes = ['menu_video'].includes(kind) ? 15 * 1024 * 1024 : 8 * 1024 * 1024
      if (storagePath && (!Number.isFinite(sizeBytes) || sizeBytes < 1 || sizeBytes > maxBytes)) return send(res, 400, { error: 'Ukuran media tidak valid atau terlalu besar.' })
      const result = await botRequest('media/apply', user, { method: 'POST', body: { session_id: sessionId, kind, url: sourceUrl } })
      const mediaAsset = { auth_id: user.id, session_id: sessionId, kind, storage_path: storagePath || null, source_url: sourceUrl, mime_type: text(req.body?.mime_type, 100) || null, size_bytes: sizeBytes }
      try {
        await dataRequest('media_assets', { method: 'POST', body: mediaAsset })
      } catch (error) {
        // Existing installations may still have the older media_assets CHECK
        // constraint until the supplied SQL migration is run. The bot setting
        // and audit entry remain correct; retain the asset history compatibly.
        if (kind !== 'goodbye_image') throw error
        await dataRequest('media_assets', { method: 'POST', body: { ...mediaAsset, kind: 'welcome_image' } })
      }
      await audit(user, 'media.apply', sessionId, { kind, source_url: sourceUrl })
      return send(res, 200, { ok: true, url: sourceUrl, result })
    }

    if (path === 'audit' && req.method === 'GET') {
      requireOwner(profile)
      const rows = await dataRequest('platform_audit_logs?select=*&order=created_at.desc&limit=200')
      return send(res, 200, { logs: rows || [] })
    }

    return send(res, 404, { error: 'Endpoint platform tidak ditemukan.' })
  } catch (error) {
    const status = Number(error?.status) || 500
    if (error?.retryAfter) res.setHeader('Retry-After', String(error.retryAfter))
    if (status >= 500) console.error('[PLATFORM]', error?.message)
    return send(res, status, { error: error.code?.startsWith('BOT_') ? error.message : status >= 500 ? 'Layanan platform sedang bermasalah.' : error.message, ...(error.code?.startsWith('BOT_') ? { code: error.code } : {}) })
  }
}
