/**
 * TeraBox: baca share link (tanpa login) + ambil link unduhan (butuh cookie akun).
 *
 * Kenapa dibuat ulang: plugin lama bergantung pada situs pihak ketiga
 * `terabxdownloader.org` yang sekarang menjawab HTTP 500, jadi /terabox selalu
 * gagal. Klien ini memakai API resmi TeraBox, sesuai yang dipanggil halaman
 * share mereka sendiri:
 *
 *   1. GET  <mirror>/sharing/link?surl=<surl>                 → cookie sesi anonim
 *   2. GET  <mirror>/api/shorturlinfo?...&shorturl=1<surl>     → judul + isi root
 *   3. GET  <mirror>/share/list?dir=<folder>&root=0&sign=…     → isi subfolder
 *   4. GET  <mirror>/share/download?fid_list=[fs_id]&sign=…    → dlink (perlu cookie akun)
 *
 * Fakta yang diuji langsung ke API (20 Okt 2026):
 *  - Langkah 1–3 jalan tanpa login, **asal** cookie sesi dari halaman share ada.
 *    Tanpa cookie: `{"errno":400210,"errmsg":"need verify_v2"}`.
 *  - `shorturl` untuk API wajib berawalan "1".
 *  - Langkah 4 tanpa cookie akun: `errno 400310 need verify_v2`, dan di browser
 *    pun tombol Download memunculkan modal Login. Jadi link unduhan memang
 *    butuh akun TeraBox (gratis) — cookie `ndus` disimpan di `.env.terabox`.
 *
 * Aturan rahasia: cookie tidak pernah masuk log, tidak ditampilkan utuh, dan
 * berkasnya mode 600.
 */
import fs from 'node:fs'
import path from 'node:path'

export const TERABOX_MIRRORS = [
  'https://www.terabox.app',
  'https://www.terabox.com',
  'https://www.1024tera.com',
  'https://www.nephobox.com',
  'https://www.teraboxlink.com',
  'https://www.freeterabox.com',
  'https://www.1024terabox.com',
  'https://www.mirrobox.com',
  'https://www.4funbox.com',
  'https://www.momerybox.com',
]

export const TERABOX_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

const APP_QUERY = {
  app_id: '250528',
  web: '1',
  channel: 'dubox',
  clienttype: '0',
}

const ERRNO_TEXT = {
  2: 'Parameter tidak lengkap.',
  105: 'Link TeraBox tidak valid atau sudah kedaluwarsa.',
  '-3': 'File atau folder tidak ditemukan (link mungkin sudah dihapus).',
  130: 'Perlu login TeraBox.',
  400210: 'TeraBox meminta verifikasi (need verify_v2).',
  400310: 'TeraBox meminta verifikasi unduhan (need verify_v2).',
  '-6': 'TeraBox menolak permintaan ini (butuh sesi login).',
}

export const TERABOX_NOT_CONFIGURED = 'TERABOX_COOKIE_BELUM_DIATUR'

/** Lokasi berkas cookie (`.env.terabox`). */
export function teraboxEnvFile() {
  return process.env.UMI_TERABOX_ENV_FILE || path.join(process.cwd(), '.env.terabox')
}

let fileCache = { expires: 0, value: '' }

function readCookieFile() {
  if (fileCache.expires > Date.now()) return fileCache.value
  let value = ''
  try {
    const text = fs.readFileSync(teraboxEnvFile(), 'utf8')
    const match = text.match(/^\s*TERABOX_COOKIE\s*=\s*(.*?)\s*$/m)
    if (match) value = match[1].replace(/^(['"])(.*)\1$/, '$2')
  } catch { }
  fileCache = { expires: Date.now() + 15_000, value }
  return value
}

export function resetTeraboxConfigCache() { fileCache.expires = 0 }

/** Cookie akun TeraBox (`ndus=…`), atau string kosong. */
export function teraboxCookie() {
  return String(
    process.env.TERABOX_COOKIE
    || readCookieFile()
    || globalThis.umiTerabox?.cookie
    || '',
  ).trim()
}

export function teraboxStatus() {
  const cookie = teraboxCookie()
  const hasNdus = /(?:^|;\s*)ndus=/.test(cookie)
  return {
    provider: 'terabox',
    configured: Boolean(cookie),
    accountCookie: hasNdus,
    cookieLength: cookie ? cookie.length : 0,
    mirrors: TERABOX_MIRRORS.length,
    envFile: teraboxEnvFile(),
  }
}

/** Simpan cookie ke `.env.terabox` (mode 600) supaya bertahan setelah restart. */
export function persistTeraboxCookie(cookie) {
  const value = String(cookie || '').trim()
  if (value.length < 20 || /[\s]/.test(value) && !/;\s*/.test(value)) {
    throw Object.assign(new Error('Format cookie TeraBox tidak valid.'), { status: 400 })
  }
  const file = teraboxEnvFile()
  const temp = `${file}.tmp`
  fs.writeFileSync(temp, `TERABOX_COOKIE=${value}\n`, { mode: 0o600 })
  fs.renameSync(temp, file)
  try { fs.chmodSync(file, 0o600) } catch { }
  fileCache = { expires: Date.now() + 15_000, value }
  return { configured: true, length: value.length }
}

export function clearTeraboxCookie() {
  try { if (fs.existsSync(teraboxEnvFile())) fs.unlinkSync(teraboxEnvFile()) } catch { }
  fileCache = { expires: 0, value: '' }
}

const maskCookie = (cookie) => {
  const value = String(cookie || '')
  if (!value) return '(belum ada)'
  return `${value.slice(0, 6)}…${value.slice(-4)} (${value.length} karakter)`
}
export { maskCookie }

/* ───────────────────────────── parsing link ───────────────────────────── */

/**
 * Ambil `surl` dari berbagai bentuk link TeraBox:
 *   /s/1hTsp…                       /wap/share/filelist?surl=cnTOB…
 *   /sharing/link?surl=cnTOB…       https://terabox.app/s/1hTsp…
 *   cnTOBQQK3n5Tj78UwxhrRw          (surl polos)
 */
export function parseTeraBoxUrl(input) {
  const raw = String(input || '').trim()
  if (!raw) throw Object.assign(new Error('Link TeraBox kosong.'), { code: 'EMPTY' })
  let surl = ''
  let host = ''
  try {
    const url = new URL(raw)
    host = url.hostname
    surl = url.searchParams.get('surl') || ''
    if (!surl) {
      const match = url.pathname.match(/\/s\/([A-Za-z0-9_-]+)/)
      if (match) surl = match[1]
    }
  } catch {
    // bukan URL: anggap surl polos
    surl = raw.replace(/^.*?surl=/, '').split(/[&#]/)[0]
  }
  surl = String(surl).trim().replace(/^\/+|\/+$/g, '')
  if (!/^[A-Za-z0-9_-]{6,64}$/.test(surl)) {
    throw Object.assign(new Error('Link TeraBox tidak dikenali. Contoh: /terabox https://www.terabox.app/wap/share/filelist?surl=xxxx'), { code: 'EBADLINK' })
  }
  // API TeraBox selalu minta bentuk berawalan "1".
  const apiSurl = surl.startsWith('1') ? surl : `1${surl}`
  const plainSurl = apiSurl.replace(/^1/, '')
  return { input: raw, host, surl, apiSurl, plainSurl, mirrors: TERABOX_MIRRORS }
}

/* ───────────────────────────── HTTP + cookie jar ───────────────────────────── */

class Jar {
  constructor(initial = '') {
    this.map = new Map()
    if (initial) for (const part of String(initial).split(';')) {
      const [name, ...rest] = part.split('=')
      const key = String(name || '').trim()
      if (key) this.map.set(key, rest.join('=').trim())
    }
  }
  absorb(response) {
    const setCookies = typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : (response.headers.get('set-cookie') ? [response.headers.get('set-cookie')] : [])
    for (const line of setCookies || []) {
      const [pair] = String(line).split(';')
      const index = pair.indexOf('=')
      if (index > 0) this.map.set(pair.slice(0, index).trim(), pair.slice(index + 1).trim())
    }
  }
  header() {
    return [...this.map.entries()].map(([key, value]) => `${key}=${value}`).join('; ')
  }
}

function errnoError(errno, context = '') {
  const code = Number(errno)
  const text = ERRNO_TEXT[String(code)] || `TeraBox menjawab errno ${code}.`
  const hint = code === 400210 || code === 400310 || code === 130 || code === -6
    ? ' Pasang cookie akun TeraBox (gratis) lewat /tbcookie set <cookie> supaya fitur ini bisa mengambil link unduhan.'
    : ''
  return Object.assign(new Error(`${text}${context ? ` (${context})` : ''}${hint}`), { errno: code })
}

async function requestJson(jar, url, { timeoutMs = 12000, referer } = {}) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': TERABOX_UA,
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      Referer: referer || 'https://www.terabox.com/',
      ...(jar.header() ? { Cookie: jar.header() } : {}),
    },
    signal: AbortSignal.timeout(timeoutMs),
  })
  jar.absorb(res)
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    throw Object.assign(new Error(`TeraBox mengirim respons bukan JSON (HTTP ${res.status}).`), { status: res.status })
  }
}

/* ───────────────────────────── pembacaan share ───────────────────────────── */

function normalizeItem(host, item) {
  return {
    name: String(item.server_filename || item.filename || '(tanpa nama)'),
    path: String(item.path || ''),
    size: Number(item.size || 0),
    fsId: String(item.fs_id || ''),
    isdir: String(item.isdir) === '1',
    dlink: String(item.dlink || ''),
    thumbs: item.thumbs || null,
    host,
  }
}

/**
 * Baca satu share link. Tanpa cookie akun pun jalan (langkah 1–3).
 * @returns {Promise<{surl:string,host:string,title:string,shareId:number,uk:string,sign:string,timestamp:number,files:Array,folders:Array,jar:Jar,totalSize:number}>}
 */
export async function resolveTeraBoxShare(link, options = {}) {
  const parsed = typeof link === 'string' ? parseTeraBoxUrl(link) : link
  const mirrors = options.mirrors || parsed.mirrors || TERABOX_MIRRORS
  const maxItems = Number(options.maxItems || 300)
  const maxDepth = Number(options.maxDepth || 3)
  const timeoutMs = Number(options.timeoutMs || 12000)
  const errors = []

  for (const host of mirrors) {
    const jar = new Jar(options.cookie || '')
    const referer = `${host}/sharing/link?surl=${parsed.plainSurl}`
    try {
      // 1. cookie sesi anonim dari halaman share
      try {
        const page = await fetch(referer, {
          headers: { 'User-Agent': TERABOX_UA, Accept: 'text/html,application/xhtml+xml' },
          signal: AbortSignal.timeout(timeoutMs),
          redirect: 'follow',
        })
        jar.absorb(page)
      } catch { }

      // 2. info root
      const infoUrl = `${host}/api/shorturlinfo?` + new URLSearchParams({
        ...APP_QUERY, root: '1', shorturl: parsed.apiSurl,
      })
      const info = await requestJson(jar, infoUrl, { timeoutMs, referer })
      if (Number(info?.errno) !== 0) {
        errors.push(`${host}: ${ERRNO_TEXT[String(info?.errno)] || `errno ${info?.errno}`}`)
        continue
      }
      const meta = {
        host,
        referer,
        surl: parsed.plainSurl,
        apiSurl: parsed.apiSurl,
        title: String(info.title || info.list?.[0]?.server_filename || 'TeraBox'),
        shareId: info.shareid,
        uk: String(info.uk || ''),
        sign: String(info.sign || ''),
        timestamp: Number(info.timestamp || 0),
        jar,
      }
      const signed = {
        ...APP_QUERY,
        shorturl: meta.surl,
        sign: meta.sign,
        timestamp: String(meta.timestamp),
        shareid: String(meta.shareId),
        uk: meta.uk,
      }

      const files = []
      const folders = []
      const seenDirs = new Set()
      const walk = async (dirPath, depth, items) => {
        for (const raw of items) {
          if (files.length + folders.length >= maxItems) return
          const item = normalizeItem(host, raw)
          if (item.isdir) {
            folders.push({ name: item.name, path: item.path })
            if (depth < maxDepth && item.path && !seenDirs.has(item.path)) {
              seenDirs.add(item.path)
              const listUrl = `${host}/share/list?` + new URLSearchParams({
                ...signed, page: '1', num: '100', dir: item.path, root: '0',
              })
              try {
                const listed = await requestJson(jar, listUrl, { timeoutMs, referer })
                if (Number(listed?.errno) === 0 && Array.isArray(listed.list)) {
                  await walk(item.path, depth + 1, listed.list)
                }
              } catch { }
            }
          } else {
            files.push(item)
          }
        }
      }
      await walk('/', 0, Array.isArray(info.list) ? info.list : [])

      return {
        ...meta,
        files,
        folders,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
        errors,
      }
    } catch (error) {
      errors.push(`${host}: ${String(error?.message || error)}`)
    }
  }
  const error = Object.assign(new Error(`TeraBox tidak bisa dibaca. ${errors.slice(0, 3).join(' · ')}`), { code: 'EALLMIRRORS', errors })
  throw error
}

/**
 * Ambil link unduhan langsung untuk satu file. **Butuh cookie akun TeraBox.**
 * Tanpa cookie, melempar error dengan kode TERABOX_NOT_CONFIGURED.
 */
export async function teraboxDirectLink(share, file, options = {}) {
  const cookie = String(options.cookie ?? teraboxCookie() ?? '')
  if (!cookie) {
    throw Object.assign(new Error('Link unduhan TeraBox butuh akun (cookie belum diatur).'), { code: TERABOX_NOT_CONFIGURED })
  }
  const jar = new Jar(cookie)
  const host = share.host || TERABOX_MIRRORS[0]
  const url = `${host}/share/download?` + new URLSearchParams({
    ...APP_QUERY,
    shorturl: share.surl,
    sign: share.sign,
    timestamp: String(share.timestamp),
    shareid: String(share.shareId),
    uk: share.uk,
    fid_list: `[${file.fsId}]`,
  })
  const data = await requestJson(jar, url, { timeoutMs: Number(options.timeoutMs || 15000), referer: share.referer })
  const errno = Number(data?.errno)
  if (errno !== 0) {
    if (errno === 400310 || errno === 130 || errno === -6) {
      throw Object.assign(new Error('Cookie TeraBox tidak berlaku lagi (silakan perbarui lewat /tbcookie set).'), { errno, code: TERABOX_NOT_CONFIGURED })
    }
    throw errnoError(errno, 'share/download')
  }
  const direct = data?.dlink?.[0]?.dlink
    || data?.list?.[0]?.dlink
    || data?.dlink
  if (!direct || typeof direct !== 'string') {
    throw Object.assign(new Error('TeraBox tidak mengembalikan link unduhan untuk file ini.'), { errno })
  }
  return direct
}

export default {
  TERABOX_MIRRORS,
  TERABOX_NOT_CONFIGURED,
  parseTeraBoxUrl,
  resolveTeraBoxShare,
  teraboxDirectLink,
  teraboxCookie,
  teraboxStatus,
  persistTeraboxCookie,
  clearTeraboxCookie,
  teraboxEnvFile,
}
