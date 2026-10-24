/*
 *
 * Gerbang API backup untuk dashboard web.
 *
 * Browser -> /api/backup/<path> (Vercel, same-origin)
 *         -> verifikasi sesi Supabase + role owner
 *         -> bot /api/backup-system/<path> dengan header x-backup-secret
 *
 * Secret BACKUP_ADMIN_SECRET tidak pernah dikirim ke browser.
 */
import { Readable } from 'node:stream'
import { getBotApiConfig } from './_bot-config.js'
import { assertBodySize, enforceSameOrigin, rateLimit, securityHeaders } from './_security.js'

const FIXED_OWNER = 'owner@example.com'
const MAX_JSON_BYTES = 1024 * 1024
const MAX_UPLOAD_BYTES = 200 * 1024 * 1024

function authBase() {
  return String(process.env.UMI_DATA_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/+$/, '')
}

function anonKey() {
  return String(process.env.UMI_DATA_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '')
}

function serviceKey() {
  return String(process.env.UMI_DATA_SERVICE_ROLE_KEY || '')
}

function bearer(req) {
  return String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim()
}

async function authUser(req) {
  const token = bearer(req)
  if (!token) throw Object.assign(new Error('Silakan masuk terlebih dahulu.'), { status: 401 })
  const base = authBase()
  if (!base) throw Object.assign(new Error('Database platform belum dikonfigurasi.'), { status: 503 })
  const response = await fetch(`${base}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: anonKey() || serviceKey() },
    signal: AbortSignal.timeout(12000),
  })
  if (!response.ok) throw Object.assign(new Error('Sesi login tidak valid atau sudah berakhir.'), { status: 401 })
  const data = await response.json()
  return { id: data.id, email: String(data.email || '').toLowerCase() }
}

async function profileRoles(user) {
  if (user.email === FIXED_OWNER) return ['owner', 'developer']
  const base = authBase()
  const key = serviceKey()
  if (!base || !key) return []
  const response = await fetch(`${base}/rest/v1/platform_profiles?auth_id=eq.${encodeURIComponent(user.id)}&select=roles,banned&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(12000),
  })
  if (!response.ok) return []
  const rows = await response.json()
  const profile = rows && rows[0]
  if (!profile || profile.banned) return []
  return Array.isArray(profile.roles) ? profile.roles : []
}

async function requireOwner(req) {
  const user = await authUser(req)
  const roles = await profileRoles(user)
  if (!roles.includes('owner')) throw Object.assign(new Error('Hanya owner platform yang diizinkan.'), { status: 403 })
  return { ...user, roles }
}

function queryOf(req) {
  if (req.query && typeof req.query === 'object') return req.query
  try {
    const url = new URL(req.url, 'http://localhost')
    return Object.fromEntries(url.searchParams.entries())
  } catch {
    return {}
  }
}

function apiPath(req) {
  const value = queryOf(req).path
  if (Array.isArray(value)) return value.join('/')
  return String(value || '')
}

function forwardQuery(req) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(queryOf(req))) {
    if (key === 'path') continue
    if (Array.isArray(value)) value.forEach(item => params.append(key, String(item)))
    else if (value !== undefined) params.set(key, String(value))
  }
  const text = params.toString()
  return text ? `?${text}` : ''
}

async function readRawBody(req, limit) {
  const chunks = []
  let total = 0
  for await (const chunk of req) {
    total += chunk.length
    if (total > limit) throw Object.assign(new Error('Berkas terlalu besar.'), { status: 413 })
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req, res) {
  securityHeaders(res)
  try {
    rateLimit(req, 'backup:api', 180, 60 * 1000)
    enforceSameOrigin(req)
  } catch (error) {
    if (error.retryAfter) res.setHeader('Retry-After', String(error.retryAfter))
    return res.status(error.status || 400).json({ error: error.message })
  }

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
    res.status(204)
    return res.end()
  }
  if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
    return res.status(405).json({ error: 'Metode tidak diizinkan.' })
  }

  let user
  try {
    user = await requireOwner(req)
  } catch (error) {
    return res.status(error.status || 401).json({ error: error.message })
  }

  const secret = String(process.env.BACKUP_ADMIN_SECRET || '').trim()
  if (!secret) return res.status(503).json({ error: 'BACKUP_ADMIN_SECRET belum diatur di server.' })

  let origin
  try {
    origin = (await getBotApiConfig()).origin
  } catch (error) {
    return res.status(error.status || 503).json({ error: error.message })
  }

  const pathname = apiPath(req).split('/').filter(Boolean).map(encodeURIComponent).join('/')
  const target = `${origin}/api/backup-system/${pathname}${forwardQuery(req)}`
  const headers = {
    'x-backup-secret': secret,
    'x-backup-actor': user.email || user.id,
    accept: req.headers.accept || 'application/json',
  }
  let body
  try {
    if (req.method === 'POST' && pathname === 'backups/upload') {
      const raw = await readRawBody(req, MAX_UPLOAD_BYTES)
      body = raw
      headers['content-type'] = 'application/gzip'
      headers['content-length'] = String(raw.length)
    } else if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'DELETE') {
      assertBodySize(req, MAX_JSON_BYTES)
      const raw = await readRawBody(req, MAX_JSON_BYTES)
      body = raw.length ? raw : Buffer.from('{}')
      headers['content-type'] = 'application/json'
    }
  } catch (error) {
    return res.status(error.status || 400).json({ error: error.message })
  }

  let upstream
  try {
    upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
      signal: AbortSignal.timeout(pathname.endsWith('download') ? 55_000 : 50_000),
      duplex: body ? 'half' : undefined,
    })
  } catch (error) {
    return res.status(502).json({ error: `Server bot tidak dapat dihubungi: ${error.message}` })
  }

  const contentType = upstream.headers.get('content-type') || 'application/json'
  res.status(upstream.status)
  res.setHeader('Content-Type', contentType)
  res.setHeader('Cache-Control', 'no-store')
  const disposition = upstream.headers.get('content-disposition')
  if (disposition) res.setHeader('Content-Disposition', disposition)
  const length = upstream.headers.get('content-length')
  if (length) res.setHeader('Content-Length', length)

  if (!upstream.body) return res.end()
  const stream = Readable.fromWeb(upstream.body)
  stream.on('error', () => {
    if (!res.writableEnded) res.end()
  })
  stream.pipe(res)
}
