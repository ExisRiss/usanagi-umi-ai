import crypto from 'node:crypto'
import { createReadStream } from 'node:fs'
import { access, stat } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { gzipSync } from 'node:zlib'
import { del, list, put } from '@vercel/blob'
import { getBotApiConfig } from './_bot-config.js'
import { securityHeaders } from './_security.js'

const SNAPSHOT = path.join(process.cwd(), '.backup-snapshot', 'website-source.tar.gz')
const ARCHIVE_KINDS = ['website', 'bot', 'jadibot']
const MAX_ARCHIVE_BYTES = 250 * 1024 * 1024

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ''))
  const b = Buffer.from(String(right || ''))
  return a.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b)
}

function authorized(req) {
  const configured = String(process.env.BACKUP_CRON_SECRET || '').trim()
  const supplied = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim()
  return Boolean(configured) && safeEqual(configured, supplied)
}

function generationId() {
  return `hourly_${new Date().toISOString().replace(/[-:.TZ]/g, '')}_${crypto.randomBytes(8).toString('hex')}`
}

function archivePath(generation, kind) {
  if (!ARCHIVE_KINDS.includes(kind)) throw new Error('Invalid backup archive kind.')
  return `generations/${generation}/${kind}.tar.gz`
}

function mirrorConfig() {
  const url = String(process.env.UMI_MIRROR_URL || '').replace(/\/+$/, '')
  const token = String(process.env.UMI_MIRROR_TOKEN || '').trim()
  return url && token ? { url, token } : null
}

async function mirrorUpload(kind, generation, body, contentLength) {
  const mirror = mirrorConfig()
  if (!mirror) return null
  const isStream = Boolean(body && typeof body.getReader === 'function')
  const response = await fetch(`${mirror.url}/mirror/${kind}/${encodeURIComponent(generation)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${mirror.token}`, 'Content-Type': 'application/gzip', ...(contentLength ? { 'Content-Length': String(contentLength) } : {}) },
    body,
    ...(isStream ? { duplex: 'half' } : {}),
    signal: AbortSignal.timeout(120_000),
  })
  if (!response.ok) throw new Error(`Mirror ${kind} upload failed (${response.status}).`)
  return response.json()
}

async function buildWebsiteDbDump() {
  const base = String(process.env.UMI_DATA_SUPABASE_URL || '').replace(/\/+$/, '')
  const key = String(process.env.UMI_DATA_SERVICE_ROLE_KEY || '')
  if (!base || !key) return null
  const headers = { apikey: key, Authorization: `Bearer ${key}` }
  const tables = {}
  for (const [name, query] of [
    ['platform_profiles', 'platform_profiles?select=*&limit=5000'],
    ['platform_audit_logs', 'platform_audit_logs?select=*&order=created_at.desc&limit=5000'],
    ['plugin_catalog', 'plugin_catalog?select=*&limit=5000'],
    ['media_assets', 'media_assets?select=*&limit=5000'],
    ['api_plugins', 'api_plugins?select=*&limit=5000'],
  ]) {
    try {
      const response = await fetch(`${base}/rest/v1/${query}`, { headers, signal: AbortSignal.timeout(30_000) })
      if (response.ok) tables[name] = await response.json()
    } catch {}
  }
  let authUsers = null
  try {
    const response = await fetch(`${base}/auth/v1/admin/users?per_page=1000`, { headers, signal: AbortSignal.timeout(30_000) })
    if (response.ok) {
      const parsed = await response.json()
      authUsers = (parsed.users || []).map(item => ({ id: item.id, email: item.email, created_at: item.created_at, last_sign_in_at: item.last_sign_in_at }))
    }
  } catch {}
  if (!Object.keys(tables).length && !authUsers) return null
  return gzipSync(Buffer.from(JSON.stringify({ exportedAt: new Date().toISOString(), tables, authUsers })))
}

async function removeGeneration(generation) {
  let cursor
  do {
    const page = await list({ prefix: `generations/${generation}/`, cursor, limit: 1000 })
    if (page.blobs.length) await del(page.blobs.map(blob => blob.url))
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)
}

async function removePreviousGenerations(currentGeneration) {
  let cursor
  do {
    const page = await list({ prefix: 'generations/', cursor, limit: 1000 })
    const stale = page.blobs.filter(blob => !blob.pathname.startsWith(`generations/${currentGeneration}/`))
    if (stale.length) await del(stale.map(blob => blob.url))
    cursor = page.hasMore ? page.cursor : undefined
  } while (cursor)
}

async function requestBot(origin, exportSecret, pathname, options = {}) {
  const response = await fetch(`${origin}${pathname}`, {
    ...options,
    headers: {
      Accept: options.headers?.Accept || 'application/json',
      Authorization: `Bearer ${exportSecret}`,
      ...options.headers,
    },
    redirect: 'error',
    signal: options.signal || AbortSignal.timeout(55_000),
  })
  return response
}

async function prepareBotExports(origin, exportSecret, generation) {
  const response = await requestBot(origin, exportSecret, '/api/internal/backup/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ generation }),
  })
  if (!response.ok) throw new Error(`Bot export preparation failed (${response.status}).`)
  const payload = await response.json()
  const archives = Array.isArray(payload.archives) ? payload.archives : []
  const byKind = new Map(archives.map(item => [item?.kind, item]))
  for (const kind of ['bot', 'jadibot']) {
    const item = byKind.get(kind)
    if (!item || !Number.isInteger(item.bytes) || item.bytes < 1 || item.bytes > MAX_ARCHIVE_BYTES || !/^[a-f0-9]{64}$/i.test(String(item.sha256 || ''))) {
      throw new Error(`Bot returned an invalid ${kind} export manifest.`)
    }
  }
  return byKind
}

async function uploadWebsite(generation) {
  await access(SNAPSHOT)
  const info = await stat(SNAPSHOT)
  if (!info.isFile() || info.size < 1 || info.size > MAX_ARCHIVE_BYTES) throw new Error('Website snapshot is invalid.')
  const digest = crypto.createHash('sha256')
  const body = createReadStream(SNAPSHOT)
  body.on('data', chunk => digest.update(chunk))
  const blob = await put(archivePath(generation, 'website'), Readable.toWeb(body), {
    access: 'private',
    addRandomSuffix: false,
    contentType: 'application/gzip',
    cacheControlMaxAge: 60,
  })
  return { kind: 'website', pathname: blob.pathname, bytes: info.size, sha256: digest.digest('hex') }
}

async function uploadBotArchive(origin, exportSecret, generation, kind, metadata) {
  const response = await requestBot(origin, exportSecret, `/api/internal/backup/export/${generation}/${kind}`, {
    headers: { Accept: 'application/gzip' },
  })
  if (!response.ok || !response.body) throw new Error(`Bot ${kind} export download failed (${response.status}).`)
  const declared = Number(response.headers.get('content-length') || 0)
  if (declared !== metadata.bytes || declared > MAX_ARCHIVE_BYTES) throw new Error(`Bot ${kind} export size mismatch.`)
  const blob = await put(archivePath(generation, kind), response.body, {
    access: 'private',
    addRandomSuffix: false,
    contentType: 'application/gzip',
    cacheControlMaxAge: 60,
  })
  return { kind, pathname: blob.pathname, bytes: metadata.bytes, sha256: String(metadata.sha256).toLowerCase(), sourceFiles: metadata.sourceFiles }
}

async function cleanupBotExport(origin, exportSecret, generation) {
  try {
    await requestBot(origin, exportSecret, '/api/internal/backup/export/cleanup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ generation }),
      signal: AbortSignal.timeout(10_000),
    })
  } catch (error) {
    // Bot-side archive expiry will clean this up later; never expose internal details.
    console.warn('[HOURLY-BACKUP] Bot export cleanup request failed:', error?.message || 'unknown')
  }
}

export default async function handler(req, res) {
  securityHeaders(res)
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed.' })
  }
  if (!authorized(req)) return res.status(401).json({ error: 'Unauthorized.' })

  const exportSecret = String(process.env.BOT_BACKUP_EXPORT_SECRET || '').trim()
  if (!exportSecret) return res.status(503).json({ error: 'Backup exporter is not configured.' })

  const generation = generationId()
  let botOrigin = ''
  let uploaded = false
  try {
    const config = await getBotApiConfig()
    botOrigin = config.origin
    const exports = await prepareBotExports(botOrigin, exportSecret, generation)
    const website = await uploadWebsite(generation)
    const bot = await uploadBotArchive(botOrigin, exportSecret, generation, 'bot', exports.get('bot'))
    const jadibot = await uploadBotArchive(botOrigin, exportSecret, generation, 'jadibot', exports.get('jadibot'))
    const manifest = {
      schemaVersion: 1,
      generation,
      createdAt: new Date().toISOString(),
      interval: 'hourly',
      scope: 'safe-operational',
      archives: [website, bot, jadibot],
    }

    // Make the new set current before deleting anything. A failed run therefore
    // never destroys the last known-good three backup files.
    await put('current.json', JSON.stringify(manifest), {
      access: 'private',
      addRandomSuffix: false,
      contentType: 'application/json; charset=utf-8',
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    })
    uploaded = true

    // Mirror the same generation to the panel-beyy database service: website
    // source snapshot, a JSON dump of the website database (Supabase tables),
    // and the bot + jadibot session archives. Mirror failures never fail the
    // primary backup above.
    try {
      if (mirrorConfig()) {
        const snapshotInfo = await stat(SNAPSHOT)
        await mirrorUpload('website', generation, Readable.toWeb(createReadStream(SNAPSHOT)), snapshotInfo.size)
        const dump = await buildWebsiteDbDump()
        if (dump) await mirrorUpload('website-db', generation, dump, dump.length)
        for (const kind of ['bot', 'jadibot']) {
          const meta = exports.get(kind)
          const response = await requestBot(botOrigin, exportSecret, `/api/internal/backup/export/${generation}/${kind}`, { headers: { Accept: 'application/gzip' }, signal: AbortSignal.timeout(120_000) })
          if (response.ok && response.body) await mirrorUpload(kind, generation, response.body, meta.bytes)
        }
        console.info('[HOURLY-BACKUP] Mirrored generation', generation, 'to panel beyy')
      }
    } catch (error) {
      console.warn('[HOURLY-BACKUP] Mirror to panel beyy failed:', error?.message || 'unknown')
    }
    await removePreviousGenerations(generation)
    console.info('[HOURLY-BACKUP] Completed generation', generation, manifest.archives.map(item => `${item.kind}:${item.bytes}`).join(', '))
    return res.status(200).json({ ok: true, generation, archives: manifest.archives.map(item => ({ kind: item.kind, bytes: item.bytes, sha256: item.sha256 })) })
  } catch (error) {
    console.error('[HOURLY-BACKUP] Failed generation', generation, error?.message || 'unknown')
    if (!uploaded) await removeGeneration(generation).catch(() => {})
    return res.status(502).json({ error: 'Backup generation failed. The prior backup was kept.' })
  } finally {
    if (botOrigin) await cleanupBotExport(botOrigin, exportSecret, generation)
  }
}
