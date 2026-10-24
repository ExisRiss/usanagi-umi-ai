/**
 * Klien API Rin (https://apiii-xrina.my.id) — 284 endpoint.
 *
 * Katalog endpoint disimpan di `lib/xrina-catalog.json` (hasil tarikan dari
 * `/openapi.json` milik API tersebut), jadi bot tidak perlu menembak satu per
 * satu ke dokumentasi dan bisa menampilkan daftar parameter dengan benar.
 *
 * Kunci API pihak ketiga (untuk endpoint yang butuh `apikey`) dibaca dari
 * `config/settings.js` -> `apiKey('xrina')`, sama seperti kunci lain.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import axios from 'axios'
import { apiKey } from '../config/api-keys.js'

const HERE = path.dirname(fileURLToPath(import.meta.url))

export const XRINA_BASE = 'https://apiii-xrina.my.id'
export const XRINA_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'

let catalogCache = null

/** Katalog lengkap: { total, base, routes: [{path,name,category,description,params,premium,secretKey}] }. */
export function xrinaCatalog() {
  if (catalogCache) return catalogCache
  try {
    catalogCache = JSON.parse(fs.readFileSync(path.join(HERE, 'xrina-catalog.json'), 'utf8'))
  } catch (error) {
    catalogCache = { total: 0, base: XRINA_BASE, routes: [], error: error.message }
  }
  return catalogCache
}

export function xrinaCategories() {
  const map = new Map()
  for (const route of xrinaCatalog().routes) {
    if (!map.has(route.category)) map.set(route.category, [])
    map.get(route.category).push(route)
  }
  return map
}

/**
 * Cari endpoint dari nama pendek, path penuh, atau `<kategori>/<nama>`.
 * Contoh: 'gemini', 'ai/gemini', '/ai-image/flux', 'stalk-gh'.
 */
export function findXrinaRoute(query) {
  const raw = String(query || '').trim().replace(/^\/+/, '').toLowerCase()
  if (!raw) return null
  const routes = xrinaCatalog().routes
  const exact = routes.find(r => r.path.toLowerCase() === `/${raw}` || r.path.toLowerCase().slice(1) === raw)
  if (exact) return exact
  const byName = routes.filter(r => r.name.toLowerCase() === raw)
  if (byName.length === 1) return byName[0]
  return byName[0] || null
}

/** Ambil semua endpoint pada satu kategori (nama kategori tidak peka huruf besar). */
export function xrinaRoutesByCategory(category) {
  const wanted = String(category || '').trim().toLowerCase()
  return xrinaCatalog().routes.filter(r => r.category.toLowerCase() === wanted)
}

/**
 * Panggil satu endpoint.
 *
 * @param {string|object} route path ('/ai/gemini') atau objek route dari katalog
 * @param {object} params query parameter (nama harus sesuai katalog; alias ikut diterima)
 * @returns {Promise<{kind:'json'|'image'|'video'|'audio'|'text', data?:any, buffer?:Buffer, mime?:string, status:number, url:string}>}
 */
export async function callXrina(route, params = {}, options = {}) {
  const target = typeof route === 'string' ? route : route?.path
  if (!target) throw new Error('Endpoint tidak dikenal.')

  const clean = {}
  for (const [key, value] of Object.entries(params || {})) {
    if (value === undefined || value === null || value === '') continue
    clean[key] = String(value)
  }

  const query = new URLSearchParams(clean).toString()
  const url = `${XRINA_BASE}${target}${query ? `?${query}` : ''}`
  const timeout = Number(options.timeout) || 90_000

  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout,
    maxRedirects: 3,
    validateStatus: () => true,
    headers: {
      'user-agent': XRINA_UA,
      accept: 'application/json, image/*, video/*, audio/*, text/plain, */*',
      'accept-language': 'id-ID,id;q=0.9,en;q=0.8',
    },
  })

  const mime = String(response.headers['content-type'] || '').split(';')[0].trim().toLowerCase()
  const buffer = Buffer.from(response.data || [])
  const status = Number(response.status) || 0

  if (mime.includes('json') || (!mime && buffer[0] === 0x7b)) {
    let data = null
    try {
      data = JSON.parse(buffer.toString('utf8'))
    } catch {
      data = null
    }
    return { kind: 'json', data, buffer, mime: mime || 'application/json', status, url }
  }
  if (mime.startsWith('image/')) return { kind: 'image', buffer, mime, status, url }
  if (mime.startsWith('video/')) return { kind: 'video', buffer, mime, status, url }
  if (mime.startsWith('audio/')) return { kind: 'audio', buffer, mime, status, url }
  return { kind: 'text', text: buffer.toString('utf8'), mime: mime || 'text/plain', status, url }
}

/** Pesan error dari balasan JSON API (`{status:false, message}`), kalau ada. */
export function xrinaErrorMessage(result) {
  const data = result?.data
  if (data && typeof data === 'object') {
    const message = data.message || data.error || data.msg
    if (message) return String(message)
  }
  if (result?.status === 404) return 'Endpoint tidak ditemukan di server API (404).'
  if (result?.status >= 500) return `Server API sedang bermasalah (HTTP ${result.status}).`
  if (result?.status === 429) return 'Batas pemakaian API tercapai, coba lagi nanti.'
  return `Permintaan gagal (HTTP ${result?.status || 0}).`
}

/** True kalau balasan dianggap sukses. */
export function xrinaOk(result) {
  if (!result) return false
  if (result.kind !== 'json') return result.status >= 200 && result.status < 300
  const data = result.data
  if (data && typeof data === 'object' && data.status === false) return false
  return result.status >= 200 && result.status < 300
}

/**
 * Isi parameter otomatis: kalau endpoint butuh `apikey` dan kunci tersedia,
 * isi sendiri dari settings.js.
 */
export function withDefaultKeys(route, params = {}) {
  const next = { ...params }
  const wantsKey = Array.isArray(route?.params) && route.params.some(p => p.name === 'apikey')
  if (wantsKey && !next.apikey) {
    const key = apiKey('xrina')
    if (key) next.apikey = key
  }
  return next
}

/** Apakah endpoint bisa dipanggil tanpa kunci milik pengguna? */
export function xrinaNeedsKey(route) {
  if (!route) return false
  if (route.secretKey) return true
  return Array.isArray(route.params) && route.params.some(p => p.name === 'apikey' && p.required)
}

/**
 * Unduh tautan media ke Buffer, lalu pastikan isinya benar-benar media.
 * Server Rin sering mengembalikan tautan CDN yang sudah kedaluwarsa
 * (contoh: savetube → redirect ke ytshortdown.com), jadi tautan tidak boleh
 * dikirim langsung ke WhatsApp tanpa dicek.
 *
 * @returns {Promise<{ok:boolean, buffer?:Buffer, mime?:string, size?:number, reason?:string}>}
 */
export async function fetchMedia(url, options = {}) {
  const maxBytes = Number(options.maxBytes) || 64 * 1024 * 1024
  const timeout = Number(options.timeout) || 60_000
  if (!/^https?:\/\//i.test(String(url || ''))) return { ok: false, reason: 'Tautan tidak valid.' }

  let response
  try {
    response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout,
      maxRedirects: 5,
      maxContentLength: maxBytes,
      validateStatus: () => true,
      headers: {
        'user-agent': XRINA_UA,
        accept: '*/*',
        'accept-language': 'id-ID,id;q=0.9,en;q=0.8',
      },
    })
  } catch (error) {
    return { ok: false, reason: `Tidak bisa diunduh (${String(error?.code || error?.message || error).slice(0, 60)}).` }
  }

  const status = Number(response.status) || 0
  const mime = String(response.headers['content-type'] || '').split(';')[0].trim().toLowerCase()
  const buffer = Buffer.from(response.data || [])
  const finalUrl = response.request?.res?.responseUrl || url

  if (status !== 200 && status !== 206) return { ok: false, reason: `HTTP ${status}.`, mime }
  if (/text\/html|application\/json|text\/plain/.test(mime)) {
    return { ok: false, reason: `Isinya bukan media (${mime || 'tidak diketahui'}).`, mime }
  }
  if (!/^(image|video|audio|application\/octet-stream)/.test(mime) && buffer.length < 1024) {
    return { ok: false, reason: 'Berkas media kosong.', mime }
  }
  if (buffer.length < 1024) return { ok: false, reason: 'Berkas media terlalu kecil.', mime }
  if (buffer.length >= maxBytes) return { ok: false, reason: 'Berkas terlalu besar.', mime }

  return { ok: true, buffer, mime, size: buffer.length, finalUrl }
}

/** Pilih nama berkas + jenis kiriman WhatsApp dari MIME. */
export function mediaKind(mime, fallbackUrl = '') {
  const type = String(mime || '').toLowerCase()
  if (type.startsWith('image/')) return { kind: 'image', name: type.includes('png') ? 'rin.png' : 'rin.jpg' }
  if (type.startsWith('video/')) return { kind: 'video', name: 'rin.mp4' }
  if (type.startsWith('audio/')) return { kind: 'audio', name: type.includes('wav') ? 'rin.wav' : 'rin.mp3' }
  const url = String(fallbackUrl).toLowerCase()
  if (/\.(mp4|mkv|webm)(\?|$)/.test(url)) return { kind: 'video', name: 'rin.mp4' }
  if (/\.(mp3|m4a|opus|ogg|wav)(\?|$)/.test(url)) return { kind: 'audio', name: 'rin.mp3' }
  if (/\.(jpe?g|png|webp|gif)(\?|$)/.test(url)) return { kind: 'image', name: 'rin.jpg' }
  return { kind: 'document', name: 'rin.bin' }
}

const MEDIA_PATTERN = /\.(mp4|m4v|mkv|webm|mp3|m4a|ogg|opus|wav|jpe?g|png|webp|gif)(\?|$)/i

/** Cari tautan media pertama di dalam data JSON (rekursif, kedalaman terbatas). */
export function findMediaUrl(value, depth = 0) {
  if (depth > 4 || value == null) return ''
  if (typeof value === 'string') {
    if (/^https?:\/\//i.test(value) && MEDIA_PATTERN.test(value)) return value
    return ''
  }
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 12)) {
      const found = findMediaUrl(item, depth + 1)
      if (found) return found
    }
    return ''
  }
  if (typeof value === 'object') {
    // Prioritaskan kunci yang jelas menunjuk media.
    for (const key of ['download', 'download_url', 'downloadUrl', 'url', 'link', 'video', 'audio', 'mp4', 'mp3', 'image', 'thumbnail']) {
      if (value[key]) {
        const found = findMediaUrl(value[key], depth + 1)
        if (found) return found
      }
    }
    for (const item of Object.values(value)) {
      const found = findMediaUrl(item, depth + 1)
      if (found) return found
    }
  }
  return ''
}

const MEDIA_KEYS = new Set([
  'download', 'download_url', 'downloadurl', 'dl', 'media', 'medias', 'video', 'videos',
  'audio', 'mp3', 'mp4', 'hd', 'sd', 'stream', 'stream_url', 'streamurl', 'play', 'url', 'link', 'src',
])

/**
 * Kumpulkan kandidat tautan media dari JSON download (beserta nama kuncinya).
 * Server sering memberi URL CDN tanpa ekstensi (mis. TikTok), jadi ekstensi
 * bukan satu-satunya patokan.
 */
export function findMediaCandidates(value, depth = 0, out = [], key = '') {
  if (depth > 4 || value == null) return out
  if (typeof value === 'string') {
    if (/^https?:\/\//i.test(value)) out.push({ url: value, key: key.toLowerCase() })
    return out
  }
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 8)) findMediaCandidates(item, depth + 1, out, key)
    return out
  }
  if (typeof value === 'object') {
    for (const [name, item] of Object.entries(value)) findMediaCandidates(item, depth + 1, out, name)
  }
  return out
}

/** Kandidat media berurut prioritas; thumbnail/poster dibuang karena bukan hasil unduhan. */
export function rankMediaCandidates(data, limit = 6) {
  const seen = new Set()
  const scored = []
  for (const item of findMediaCandidates(data)) {
    if (seen.has(item.url)) continue
    seen.add(item.url)
    if (/thumbnail|thumb|cover|poster|avatar|icon|logo|banner/i.test(item.key)) continue
    if (/^https?:\/\/(i\.ytimg\.com|img\.youtube\.com)/i.test(item.url)) continue
    if (/\/embed\//i.test(item.url)) continue
    let score = 0
    if (MEDIA_KEYS.has(item.key)) score += 3
    if (MEDIA_PATTERN.test(item.url)) score += 4
    if (/\.(mp4|mkv|webm)(\?|$)/i.test(item.url)) score += 1
    if (/(videoplayback|googlevideo|tiktokcdn|\/file\/)/i.test(item.url)) score += 1
    scored.push({ url: item.url, key: item.key, score })
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.url)
}

/** Ubah JSON jadi teks rapi untuk dibaca di WhatsApp. */
export function formatXrinaData(data, { maxArray = 10, maxChars = 3200 } = {}) {
  const lines = []

  const push = (text) => {
    if (lines.join('\n').length + text.length > maxChars) return false
    lines.push(text)
    return true
  }

  const walk = (value, indent = '') => {
    if (value === null || value === undefined) return
    if (Array.isArray(value)) {
      const slice = value.slice(0, maxArray)
      slice.forEach((item, index) => {
        if (item && typeof item === 'object') {
          const title = item.title || item.name || item.judul || item.slug || item.username || `Item ${index + 1}`
          push(`${indent}${index + 1}. ${String(title).slice(0, 90)}`)
          const detailKeys = Object.keys(item).filter(k => !['title', 'name', 'judul', 'slug'].includes(k)).slice(0, 4)
          for (const key of detailKeys) {
            const raw = item[key]
            if (raw && typeof raw === 'object') continue
            const text = String(raw ?? '').replace(/\s+/g, ' ').slice(0, 80)
            if (text) push(`${indent}   ${key}: ${text}`)
          }
        } else {
          push(`${indent}${index + 1}. ${String(item).slice(0, 120)}`)
        }
      })
      if (value.length > slice.length) push(`${indent}… ${value.length - slice.length} item lagi`)
      return
    }
    if (typeof value === 'object') {
      for (const [key, item] of Object.entries(value)) {
        if (item === null || item === undefined || item === '') continue
        if (Array.isArray(item) || (item && typeof item === 'object')) {
          push(`${indent}${key}:`)
          walk(item, `${indent}  `)
          continue
        }
        const text = String(item).replace(/\s+/g, ' ')
        if (text.length > 160) {
          push(`${indent}${key}: ${text.slice(0, 160)}…`)
        } else {
          push(`${indent}${key}: ${text}`)
        }
      }
      return
    }
    push(`${indent}${String(value).slice(0, 500)}`)
  }

  walk(data)
  const body = lines.join('\n').trim()
  return body.length > maxChars ? `${body.slice(0, maxChars)}\n…` : body
}

/** Ringkasan satu endpoint untuk ditampilkan di bantuan. */
export function describeXrinaRoute(route) {
  const params = (route.params || []).map(p => (p.required ? `${p.name}*` : p.name)).join(' ')
  return `/${route.path.replace(/^\//, '')}${params ? ` — ${params}` : ''}`
}

export default {
  XRINA_BASE,
  xrinaCatalog,
  xrinaCategories,
  xrinaRoutesByCategory,
  findXrinaRoute,
  callXrina,
  xrinaOk,
  xrinaErrorMessage,
  withDefaultKeys,
  xrinaNeedsKey,
  findMediaUrl,
  findMediaCandidates,
  rankMediaCandidates,
  fetchMedia,
  mediaKind,
  formatXrinaData,
  describeXrinaRoute,
}
