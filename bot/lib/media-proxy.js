/**
 * Proxy media YouTube — pengganti `wss://stream.kanara.my.id` yang sudah mati.
 *
 * Kenapa perlu proxy?
 *   Link `googlevideo.com` hasil ekstraksi terikat pada IP yang memintanya.
 *   Bot meng-extract dari IP server panel, sedangkan video diputar di HP
 *   pengguna (IP berbeda) — YouTube membalas 403 dan player menampilkan
 *   "WebSocket error". Dengan proxy ini, server bot yang meneruskan byte-nya,
 *   jadi HP cukup bicara ke domain publik bot.
 *
 * Endpoint (otomatis ikut server API yang sudah ada):
 *   GET /media/yt?u=<url googlevideo ter-encode>
 *   Range request diteruskan apa adanya, jadi seek/geser progress bar tetap jalan.
 *
 * Keamanan:
 *   - hanya https, hanya host di daftar izin (anti open-proxy)
 *   - hanya GET/HEAD
 *   - tidak menyimpan apa pun ke disk
 *
 * Bisa dimatikan lewat `global.media.proxyEnabled = false`.
 */

import https from 'node:https'
import http from 'node:http'
import crypto from 'node:crypto'

const DEFAULT_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'

const BASE_ALLOWED_HOSTS = [
  'googlevideo.com',
  'youtube.com',
  'youtu.be',
  'ytimg.com',
  'ggpht.com',
  'googleusercontent.com',
  'savetube.vip',
]

function allowedHosts() {
  const extra = Array.isArray(global.media?.proxyHosts) ? global.media.proxyHosts : []
  return [...BASE_ALLOWED_HOSTS, ...extra.map(h => String(h || '').toLowerCase().trim()).filter(Boolean)]
}

function hostAllowed(hostname) {
  const host = String(hostname || '').toLowerCase()
  if (!host) return false
  return allowedHosts().some(base => host === base || host.endsWith(`.${base}`))
}

/** Base publik untuk player. Kosong = proxy tidak dipakai (player pakai URL langsung). */
export function mediaProxyBase() {
  if (global.media?.proxyEnabled === false) return ''
  const raw = String(
    global.media?.proxyBase ||
      process.env.UMI_MEDIA_PROXY_BASE ||
      process.env.PLATFORM_PUBLIC_BASE_URL ||
      globalThis.__umiPlatformPublicBase ||
      '',
  ).trim()
  return raw.replace(/\/+$/, '')
}

function signingKey() {
  return String(
    process.env.PLATFORM_MEDIA_SIGNING_KEY ||
      process.env.PLATFORM_SECRET_KEY ||
      global.media?.signingKey ||
      '',
  ).trim()
}

/** Tanda tangan pendek supaya endpoint tidak bisa dipakai orang luar. */
export function signProxy(target, expiresAt) {
  const key = signingKey()
  if (!key) return ''
  return crypto.createHmac('sha256', key).update(`${target}|${expiresAt}`).digest('base64url').slice(0, 32)
}

function verifyProxy(target, expiresAt, signature) {
  const key = signingKey()
  if (!key) return true // belum ada kunci: andalkan daftar host saja
  const exp = Number(expiresAt) || 0
  if (!exp || exp < Date.now()) return false
  const expected = signProxy(target, exp)
  const given = String(signature || '')
  if (given.length !== expected.length) return false
  try {
    return crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected))
  } catch {
    return false
  }
}

/** Bungkus URL media jadi URL proxy bertanda tangan kalau base tersedia. */
export function proxyUrlFor(url, ttlMs = 12 * 60 * 60 * 1000) {
  const base = mediaProxyBase()
  const target = String(url || '').trim()
  if (!base || !/^https?:\/\//i.test(target)) return target
  const expiresAt = Date.now() + ttlMs
  const signature = signProxy(target, expiresAt)
  const tail = signature ? `&e=${expiresAt}&s=${signature}` : ''
  return `${base}/media/yt?u=${encodeURIComponent(target)}${tail}`
}

function sendError(res, status, message) {
  if (res.headersSent) return res.end()
  const body = JSON.stringify({ error: message })
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'access-control-allow-origin': '*',
    'cache-control': 'no-store',
  })
  res.end(body)
}

export function handleMediaProxy(req, res, url) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return sendError(res, 405, 'Metode tidak diizinkan.')
  if (global.media?.proxyEnabled === false) return sendError(res, 503, 'Proxy media dimatikan.')

  const raw = String(url?.searchParams?.get('u') || '').trim()
  if (!raw) return sendError(res, 400, 'Parameter u wajib diisi.')

  let target
  try {
    target = new URL(raw)
  } catch {
    return sendError(res, 400, 'URL media tidak valid.')
  }
  if (target.protocol !== 'https:') return sendError(res, 400, 'Hanya URL https yang diizinkan.')
  if (!hostAllowed(target.hostname)) return sendError(res, 403, 'Host media tidak diizinkan.')
  if (!verifyProxy(raw, url.searchParams.get('e'), url.searchParams.get('s'))) {
    return sendError(res, 403, 'Tautan media tidak valid atau kedaluwarsa.')
  }

  const headers = {
    'user-agent': DEFAULT_UA,
    accept: '*/*',
  }
  if (req.headers.range) headers.range = String(req.headers.range)
  if (target.hostname.endsWith('googlevideo.com')) headers.referer = 'https://www.youtube.com/'

  const client = target.hostname.endsWith('youtube.com') ? http : https
  const upstream = client.request(
    target,
    { method: req.method === 'HEAD' ? 'HEAD' : 'GET', headers, timeout: 30000 },
    up => {
      const status = Number(up.statusCode) || 502
      const out = {
        'access-control-allow-origin': '*',
        'access-control-expose-headers': 'content-length, content-range, accept-ranges',
        'accept-ranges': up.headers['accept-ranges'] || 'bytes',
        'cache-control': 'no-store',
      }
      if (up.headers['content-type']) out['content-type'] = up.headers['content-type']
      if (up.headers['content-length']) out['content-length'] = up.headers['content-length']
      if (up.headers['content-range']) out['content-range'] = up.headers['content-range']
      if (up.headers['content-encoding']) out['content-encoding'] = up.headers['content-encoding']

      res.writeHead(status, out)
      if (req.method === 'HEAD') {
        up.resume()
        return res.end()
      }
      up.pipe(res)
      up.on('error', () => { try { res.destroy() } catch {} })
    },
  )

  upstream.on('timeout', () => upstream.destroy(new Error('timeout')))
  upstream.on('error', error => sendError(res, 502, `Gagal mengambil media: ${error?.message || 'error'}`))
  // Kalau HP menutup koneksi (geser video / keluar player), putus hulu juga.
  req.on('close', () => { try { upstream.destroy() } catch {} })
  upstream.end()
}

export default { handleMediaProxy, mediaProxyBase, proxyUrlFor, signProxy }
