/* By AlzRiss - Usanagi Umi AI */

import fs from 'fs-extra'
import path from 'node:path'
import { resolveAio } from './usanagi-aio.js'
import { ensureYtDlp, getFfmpegLocationArgs, runYtDlp, ytdlpTempBase } from '../../lib/awang-ytdlp.js'
import { sendRemoteMediaFast, sendLocalMediaFast } from '../../lib/awang-media-transfer.js'
import { prepareRemoteWhatsAppVideo, prepareYtDlpVideo } from '../../lib/awang-video-compat.js'

const DEFAULT_UA = 'Mozilla/5.0 (Linux; Android 13; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36'
const INSTAGRAM_ANDROID_UA = 'Instagram 435.0.0.37.76 Android (30/11; 416dpi; 1080x2400; Pixel 7; en_US)'
const INSTAGRAM_WEB_APP_ID = '936619743392459'
const INSTAGRAM_ANDROID_APP_ID = '567067343352427'

export function sanitizeFilename(value, fallback = 'usanagi') {
  return String(value || fallback)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100) || fallback
}

export function isHttpUrl(value) {
  try {
    const url = new URL(String(value || '').trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function hostMatches(value, hosts = []) {
  try {
    const host = new URL(value).hostname.toLowerCase().replace(/^www\./, '')
    return hosts.some(item => host === item || host.endsWith(`.${item}`))
  } catch {
    return false
  }
}

export async function request(url, { method = 'GET', headers = {}, body, timeoutMs = 30000, retries = 2, signal } = {}) {
  const canRetry = /^(GET|HEAD)$/i.test(method)
  const attempts = canRetry ? Math.max(0, retries) + 1 : 1
  let lastError = null

  for (let attempt = 0; attempt < attempts; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const onAbort = () => controller.abort()
    if (signal) {
      if (signal.aborted) controller.abort()
      else signal.addEventListener('abort', onAbort, { once: true })
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'User-Agent': DEFAULT_UA,
          ...(headers || {}),
        },
        body,
        redirect: 'follow',
        signal: controller.signal,
      })

      if (response.ok) return response

      lastError = new Error(`HTTP ${response.status}`)
      const retryable = response.status === 408 || response.status === 425 || response.status === 429 || response.status >= 500
      if (!retryable || attempt >= attempts - 1) throw lastError
    } catch (error) {
      lastError = error?.name === 'AbortError'
        ? new Error('Permintaan melebihi batas waktu.')
        : error
      if (attempt >= attempts - 1) throw lastError
      if (lastError?.message?.startsWith('HTTP ') && !/HTTP (408|425|429|5\d\d)$/.test(lastError.message)) throw lastError
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
    }

    await new Promise(resolve => setTimeout(resolve, Math.min(2500, 350 * (2 ** attempt))))
  }

  throw lastError || new Error('Permintaan gagal.')
}

export async function responseJson(response) {
  const text = await response.text()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Response server tidak valid.')
  }
}

export async function downloadHead(url, { timeoutMs = 20000 } = {}) {
  try {
    const response = await request(url, {
      method: 'HEAD',
      timeoutMs,
    })

    return {
      contentType: String(response.headers.get('content-type') || '').toLowerCase(),
      length: Number(response.headers.get('content-length') || 0),
    }
  } catch {
    return {
      contentType: '',
      length: 0,
    }
  }
}

export function mediaTypeFromUrl(url = '') {
  const clean = String(url).split('?')[0].toLowerCase()

  if (/\.(jpg|jpeg|png|webp|gif|bmp|avif)(?:$|\/)/i.test(clean)) return 'image'
  if (/\.(mp4|mkv|webm|mov|avi|m4v)(?:$|\/)/i.test(clean)) return 'video'
  if (/\.(mp3|m4a|aac|ogg|opus|wav|flac)(?:$|\/)/i.test(clean)) return 'audio'

  return 'unknown'
}

export function mediaTypeFromHeaders(contentType = '', url = '') {
  const type = String(contentType || '').split(';')[0].trim().toLowerCase()

  if (type.startsWith('image/')) return 'image'
  if (type.startsWith('video/')) return 'video'
  if (type.startsWith('audio/')) return 'audio'

  return mediaTypeFromUrl(url)
}

export function cleanHtmlText(value = '') {
  return String(value)
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

export function extractAnchorHrefs(html = '', matcher) {
  const result = []
  const tagRegex = /<a\b[^>]*>/gi

  for (const match of html.matchAll(tagRegex)) {
    const tag = match[0]
    if (matcher && !matcher(tag)) continue

    const hrefMatch =
      tag.match(/\bhref\s*=\s*["']([^"']+)["']/i) ||
      tag.match(/\bhref\s*=\s*([^\s>]+)/i)

    if (!hrefMatch?.[1]) continue

    const href = cleanHtmlText(hrefMatch[1])
    if (href) result.push(href)
  }

  return [...new Set(result)]
}

export function extractMeta(html = '', key, value) {
  const metaRegex = /<meta\b[^>]*>/gi

  for (const match of html.matchAll(metaRegex)) {
    const tag = match[0]
    const name =
      tag.match(new RegExp(`\\b${key}\\s*=\\s*["']${value}["']`, 'i')) ||
      tag.match(new RegExp(`\\b${key}\\s*=\\s*${value}\\b`, 'i'))

    if (!name) continue

    const content =
      tag.match(/\bcontent\s*=\s*["']([^"']+)["']/i) ||
      tag.match(/\bcontent\s*=\s*([^\s>]+)/i)

    if (content?.[1]) return cleanHtmlText(content[1])
  }

  return ''
}

export function extractMetaValues(html = '', key, value) {
  const result = []
  const metaRegex = /<meta\b[^>]*>/gi

  for (const match of html.matchAll(metaRegex)) {
    const tag = match[0]
    const name =
      tag.match(new RegExp(`\\b${key}\\s*=\\s*["']${value}["']`, 'i')) ||
      tag.match(new RegExp(`\\b${key}\\s*=\\s*${value}\\b`, 'i'))

    if (!name) continue

    const content =
      tag.match(/\bcontent\s*=\s*["']([^"']+)["']/i) ||
      tag.match(/\bcontent\s*=\s*([^\s>]+)/i)

    if (content?.[1]) {
      const valueText = cleanHtmlText(content[1])
      if (valueText && !result.includes(valueText)) result.push(valueText)
    }
  }

  return result
}

export function extractScriptJson(html = '', attribute, value) {
  const escapedAttribute = String(attribute).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const escapedValue = String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(
    `<script\\b[^>]*\\b${escapedAttribute}\\s*=\\s*["']${escapedValue}["'][^>]*>([\\s\\S]*?)<\\/script>`,
    'i'
  )

  const match = html.match(regex)
  if (!match?.[1]) return null

  try {
    return JSON.parse(match[1].trim())
  } catch {
    return null
  }
}

export function collectUrls(value, output = []) {
  if (!value) return output

  if (typeof value === 'string') {
    const matches = value.match(/https?:\/\/[^\s"'<>]+/gi) || []
    for (const item of matches) {
      const clean = item.replace(/[),.!?]+$/, '')
      if (!output.includes(clean)) output.push(clean)
    }
    return output
  }

  if (Array.isArray(value)) {
    for (const item of value) collectUrls(item, output)
    return output
  }

  if (typeof value === 'object') {
    for (const item of Object.values(value)) collectUrls(item, output)
  }

  return output
}

export async function sendRemoteMedia(conn, m, url, options = {}) {
  return sendRemoteMediaFast(conn, m, url, options)
}

const MAX_MEDIA_BYTES = 2 * 1024 * 1024 * 1024
const MAX_MEDIA_COUNT = 10
const IG_CACHE = new Map()
const IG_CACHE_TTL = 180000
const IG_BOOTSTRAP_CACHE = { html: '', token: '', csrfToken: '', time: 0 }
const IG_BOOTSTRAP_TTL = 60000
const INSTAGRAM_GRAPHQL_DOC_ID = '27130156389949648'
const IG_YTDLP_UPDATE_TTL = 12 * 60 * 60 * 1000
let igYtdlpUpdatePromise = null
let igYtdlpUpdatedAt = 0

function normalizeInstagramUrl(input) {
  const value = String(input || '').trim()

  if (!hostMatches(value, ['instagram.com', 'instagr.am', 'ig.me'])) {
    throw new Error('Link tersebut bukan link Instagram.')
  }

  return value
}

function canonicalInstagramUrl(input) {
  const value = normalizeInstagramUrl(input)
  try {
    const url = new URL(value)
    if (url.hostname.toLowerCase().includes('ig.me')) return value
    url.search = ''
    url.hash = ''
    url.pathname = url.pathname.replace(/\/{2,}/g, '/')
    url.pathname = url.pathname.endsWith('/') ? url.pathname : `${url.pathname}/`
    return url.href
  } catch {
    return value
  }
}

function getInstagramCookieHeader() {
  const configured = String(process.env.USANAGI_INSTAGRAM_COOKIE || '').trim()
  if (configured) return configured

  const candidates = [
    path.resolve(process.cwd(), 'storage', 'instagram-cookies.txt'),
    path.resolve(process.cwd(), 'instagram-cookies.txt'),
  ]

  for (const file of candidates) {
    try {
      if (!fs.pathExistsSync(file)) continue
      const cookies = []
      const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/)
      for (const line of lines) {
        if (!line || line.startsWith('#')) continue
        const parts = line.split('\t')
        if (parts.length < 7 || !parts[5]) continue
        cookies.push(`${parts[5]}=${parts[6]}`)
      }
      if (cookies.length) return [...new Set(cookies)].join('; ')
    } catch {}
  }

  return ''
}

function extractInstagramShortcode(input) {
  try {
    const url = new URL(canonicalInstagramUrl(input))
    const parts = url.pathname.split('/').filter(Boolean)
    const index = parts.findIndex(value => /^(p|reel|reels|tv)$/i.test(value))
    const code = index >= 0 ? parts[index + 1] : ''
    return code && /^[A-Za-z0-9_-]+$/.test(code) ? code : ''
  } catch {
    return ''
  }
}

function instagramShortcodeToMediaId(shortcode) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
  let id = 0n
  let value = String(shortcode || '').trim()
  if (!value) return ''
  if (value.length > 28) value = value.slice(0, -28)

  for (const char of value) {
    const index = alphabet.indexOf(char)
    if (index < 0) return ''
    id = id * 64n + BigInt(index)
  }

  return id > 0n ? id.toString(10) : ''
}


function decodeInstagramEscapes(value = '') {
  return String(value)
    .replace(/\\u0026/gi, '&')
    .replace(/\\u002F/gi, '/')
    .replace(/\\u003A/gi, ':')
    .replace(/\\u003D/gi, '=')
    .replace(/\\u005C/gi, '\\')
    .replace(/\\\//g, '/')
}

function extractSjsJsonBlocks(html = '') {
  const result = []
  const regex = /<script\b[^>]*\bdata-sjs[^>]*>([\s\S]*?)<\/script>/gi
  for (const match of html.matchAll(regex)) {
    let raw = match[1] || ''
    raw = raw.trim()
    raw = raw.replace(/^for\s*\(;;\);\s*/i, '')
    if (!raw) continue
    try {
      const parsed = JSON.parse(raw)
      result.push(parsed)
      continue
    } catch {}
    try {
      const decoded = decodeInstagramEscapes(raw)
      const parsed = JSON.parse(decoded)
      result.push(parsed)
    } catch {}
  }
  return result
}

function findInstagramMediaObjects(value, output = [], depth = 0) {
  if (!value || depth > 28) return output

  if (Array.isArray(value)) {
    for (const item of value) findInstagramMediaObjects(item, output, depth + 1)
    return output
  }

  if (typeof value !== 'object') return output

  if (value.xig_polaris_media && typeof value.xig_polaris_media === 'object') {
    output.push(value.xig_polaris_media)
  }

  if (value.if_not_gated_logged_out && typeof value.if_not_gated_logged_out === 'object') {
    output.push(value.if_not_gated_logged_out)
  }

  for (const item of Object.values(value)) {
    findInstagramMediaObjects(item, output, depth + 1)
  }

  return output
}

function normalizeInstagramMediaObjects(objects = []) {
  const result = []
  const seen = new Set()
  for (const item of objects) {
    const product = item?.if_not_gated_logged_out || item?.media || item
    if (!product || typeof product !== 'object') continue
    const key = String(
      product.pk
      || product.code
      || product.shortcode
      || product.video_versions?.[0]?.url
      || product.display_url
      || ''
    )
    if (seen.has(key)) continue
    seen.add(key)
    result.push(product)
  }
  return result
}

function instagramGraphqlMedia(data) {
  const media = data?.data?.xig_polaris_media || data?.data?.xig_polaris_media_by_shortcode
  if (!media || typeof media !== 'object') return []
  const objects = [media]
  if (media.if_not_gated_logged_out) objects.push(media.if_not_gated_logged_out)
  if (media.media) objects.push(media.media)
  if (Array.isArray(media.carousel_media)) objects.push(...media.carousel_media)
  return normalizeInstagramMediaObjects(objects)
}

function normalizeEmbeddedUrl(value, baseUrl = 'https://www.instagram.com/') {
  let clean = decodeInstagramEscapes(cleanHtmlText(value))
  try {
    clean = decodeURIComponent(clean)
  } catch {}
  try {
    return new URL(clean, baseUrl).href
  } catch {
    return ''
  }
}

function isInstagramMediaUrl(value) {
  if (!isHttpUrl(value)) return false
  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    const pathname = url.pathname.toLowerCase()
    return host.includes('cdninstagram.com')
      || host.includes('fbcdn.net')
      || host.includes('instagram.com') && /\.(mp4|m4v|webm|mov|jpg|jpeg|png|webp|avif)(?:$|\/)/i.test(pathname)
      || /\.(mp4|m4v|webm|mov|jpg|jpeg|png|webp|avif)(?:$|\/)/i.test(pathname)
  } catch {
    return false
  }
}

function extractEmbeddedMediaCandidates(html = '', input = '', { videoOnly = false } = {}) {
  const candidates = []
  const raw = decodeInstagramEscapes(String(html))
  const add = (value, type = 'video', sourceType = 'embedded') => {
    const url = normalizeEmbeddedUrl(value, input)
    if (!url || !isHttpUrl(url) || !isInstagramMediaUrl(url)) return
    if (videoOnly && type !== 'video') return
    candidates.push({ url, type, sourceType })
  }

  for (const match of raw.matchAll(/<(?:video|source)\b[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi)) add(match[1], 'video', 'html-video')
  for (const match of raw.matchAll(/"(?:video_url|videoUrl|video_src|videoSource|contentUrl)"\s*:\s*"([^"]+)"/gi)) add(match[1], 'video', 'embedded-video')
  for (const match of raw.matchAll(/"(?:display_url|displayUrl|image_url|imageUrl|thumbnailUrl)"\s*:\s*"([^"]+)"/gi)) add(match[1], 'image', 'embedded-image')
  for (const match of raw.matchAll(/<meta\b[^>]*\b(?:property|name)\s*=\s*["'](?:og:video|og:video:secure_url|twitter:player:stream)["'][^>]*>/gi)) {
    const content = match[0].match(/\bcontent\s*=\s*["']([^"']+)["']/i)?.[1]
    if (content) add(content, 'video', 'meta-video')
  }
  for (const match of raw.matchAll(/<meta\b[^>]*\b(?:property|name)\s*=\s*["'](?:og:image|twitter:image)["'][^>]*>/gi)) {
    const content = match[0].match(/\bcontent\s*=\s*["']([^"']+)["']/i)?.[1]
    if (content) add(content, 'image', 'meta-image')
  }

  for (const match of raw.matchAll(/<script\b[^>]*\btype\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(match[1].trim())
      const queue = [parsed]
      while (queue.length) {
        const current = queue.shift()
        if (!current || typeof current !== 'object') continue
        if (Array.isArray(current)) {
          queue.push(...current)
          continue
        }
        for (const [key, value] of Object.entries(current)) {
          if (typeof value === 'string' && isHttpUrl(value)) {
            if (/^(contentUrl|embedUrl|video)$/i.test(key)) add(value, 'video', 'ld-json-video')
            else if (/^(image|thumbnailUrl)$/i.test(key)) add(value, 'image', 'ld-json-image')
          } else if (value && typeof value === 'object') {
            queue.push(value)
          }
        }
      }
    } catch {}
  }

  return dedupeInstagramCandidates(candidates)
}

function extractEmbeddedMedia(html = '', input = '') {
  return extractEmbeddedMediaCandidates(html, input).map(candidate => candidate.url)
}

function instagramEmbedUrl(input) {
  try {
    const parsed = new URL(input)
    const parts = parsed.pathname.split('/').filter(Boolean)
    const routeIndex = parts.findIndex(value => /^(p|reel|reels|tv)$/i.test(value))
    const route = routeIndex >= 0 ? parts[routeIndex] : ''
    const code = routeIndex >= 0 ? parts[routeIndex + 1] : ''
    if (!route || !code) return ''
    const canonicalRoute = route.toLowerCase() === 'reels' ? 'reel' : route.toLowerCase()
    return `https://www.instagram.com/${canonicalRoute}/${encodeURIComponent(code)}/embed/captioned/`
  } catch {
    return ''
  }
}

async function fetchInstagramHtml(input, referer = 'https://www.instagram.com/', signal, options = {}) {
  const cookie = options.cookie === undefined ? '' : options.cookie
  const response = await request(input, {
    timeoutMs: options.timeoutMs || 8000,
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      Referer: referer,
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    retries: options.retries === undefined ? 1 : options.retries,
    signal,
  })
  return { html: await response.text(), finalUrl: response.url || input }
}

async function resolveInstagramCanonicalUrl(input, signal) {
  const direct = canonicalInstagramUrl(input)
  if (extractInstagramShortcode(direct)) return direct

  try {
    const response = await request(direct, {
      timeoutMs: 6000,
      retries: 1,
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        Referer: 'https://www.instagram.com/',
      },
      signal,
    })
    const finalUrl = response.url || direct
    const shortcode = extractInstagramShortcode(finalUrl)
    if (shortcode) return canonicalInstagramUrl(finalUrl)
    const html = await response.text()
    const embedded = extractInstagramProductUrlsFromHtml(html)
    if (embedded.length) return direct
  } catch {}

  return direct
}

async function scrapeInstagramPage(input, signal) {
  const intent = instagramVideoIntent(input)
  const result = await fetchInstagramHtml(input, 'https://www.instagram.com/', signal)
  const structured = extractInstagramProductCandidatesFromHtml(result.html, { videoOnly: intent === 'video' })
  const videoMeta = [
    ...extractMetaValues(result.html, 'property', 'og:video'),
    ...extractMetaValues(result.html, 'property', 'og:video:secure_url'),
    ...extractMetaValues(result.html, 'name', 'twitter:player:stream'),
  ].map(url => ({ url: normalizeEmbeddedUrl(url, input), type: 'video', sourceType: 'meta-video' }))
  const embedded = extractEmbeddedMediaCandidates(result.html, input, { videoOnly: intent === 'video' })
  const imageMeta = [
    ...extractMetaValues(result.html, 'property', 'og:image'),
    ...extractMetaValues(result.html, 'name', 'twitter:image'),
  ].map(url => ({ url: normalizeEmbeddedUrl(url, input), type: 'image', sourceType: 'meta-image' }))
  const candidates = [...structured, ...videoMeta, ...embedded, ...imageMeta]
    .filter(candidate => candidate?.url && isHttpUrl(candidate.url) && isInstagramMediaUrl(candidate.url))
  const filtered = filterInstagramCandidatesForIntent(candidates, intent)
  if (!filtered.length) throw new Error('Halaman Instagram tidak mengembalikan media.')
  return filtered.slice(0, MAX_MEDIA_COUNT)
}

async function scrapeInstagramWebSjs(input, signal) {
  const result = await fetchInstagramHtml(input, 'https://www.instagram.com/', signal, { timeoutMs: 8000, retries: 1 })
  const intent = instagramVideoIntent(input)
  const candidates = extractInstagramProductCandidatesFromHtml(result.html, { videoOnly: intent === 'video' })
  if (candidates.length) return candidates
  const embedded = extractEmbeddedMediaCandidates(result.html, input, { videoOnly: intent === 'video' })
  const filtered = filterInstagramCandidatesForIntent(embedded, intent)
  if (filtered.length) return filtered.slice(0, MAX_MEDIA_COUNT)
  throw new Error('Instagram tidak mengembalikan data media terstruktur.')
}

async function scrapeInstagramEmbed(input, signal) {
  const embed = instagramEmbedUrl(input)
  if (!embed) return []
  const intent = instagramVideoIntent(input)
  const result = await fetchInstagramHtml(embed, input, signal, { timeoutMs: 7000, retries: 1 })
  const structured = extractInstagramProductCandidatesFromHtml(result.html, { videoOnly: intent === 'video' })
  const embedded = extractEmbeddedMediaCandidates(result.html, embed, { videoOnly: intent === 'video' })
  const urls = filterInstagramCandidatesForIntent([...structured, ...embedded], intent)
  if (!urls.length) throw new Error('Instagram embed tidak mengembalikan media.')
  return urls.slice(0, MAX_MEDIA_COUNT)
}

function instagramStructuredUrls(input) {
  try {
    const parsed = new URL(input)
    const parts = parsed.pathname.split('/').filter(Boolean)
    const index = parts.findIndex(value => /^(p|reel|reels|tv)$/i.test(value))
    const code = index >= 0 ? parts[index + 1] : ''
    const route = index >= 0 ? parts[index].toLowerCase() : ''
    const canonical = route === 'reels' ? 'reel' : route
    if (!canonical || !code) return []
    return [
      `https://www.instagram.com/${canonical}/${encodeURIComponent(code)}/?__a=1&__d=dis`,
      `https://www.instagram.com/${canonical}/${encodeURIComponent(code)}/?__a=1`,
    ]
  } catch {
    return []
  }
}

function pickBestVideoVersion(versions = []) {
  return [...versions]
    .filter(item => isHttpUrl(item?.url))
    .sort((a, b) => {
      const audioDiff = Number(b?.has_audio !== false) - Number(a?.has_audio !== false)
      if (audioDiff) return audioDiff
      const areaDiff = Number(b?.width || 0) * Number(b?.height || 0) - Number(a?.width || 0) * Number(a?.height || 0)
      if (areaDiff) return areaDiff
      const bitrateDiff = Number(b?.bitrate || 0) - Number(a?.bitrate || 0)
      if (bitrateDiff) return bitrateDiff
      return Number(b?.id || 0) - Number(a?.id || 0)
    })
    .map(item => ({
      url: item.url,
      type: 'video',
      width: Number(item?.width || 0),
      height: Number(item?.height || 0),
      bitrate: Number(item?.bitrate || 0),
      hasAudio: item?.has_audio !== false,
      sourceType: 'video_versions',
    }))
}

function pickBestImageVersions(item) {
  const candidates = Array.isArray(item?.image_versions2?.candidates)
    ? item.image_versions2.candidates.filter(candidate => isHttpUrl(candidate?.url))
    : []
  const targetWidth = Number(item?.original_width || item?.image_versions2?.original_width || 0)
  const targetHeight = Number(item?.original_height || item?.image_versions2?.original_height || 0)
  const targetRatio = targetWidth && targetHeight ? targetWidth / targetHeight : 0

  return candidates
    .sort((a, b) => {
      const areaA = Number(a.width || 0) * Number(a.height || 0)
      const areaB = Number(b.width || 0) * Number(b.height || 0)
      if (targetRatio) {
        const ratioA = Number(a.width || 0) / Math.max(1, Number(a.height || 0))
        const ratioB = Number(b.width || 0) / Math.max(1, Number(b.height || 0))
        const diffA = Math.abs(ratioA - targetRatio)
        const diffB = Math.abs(ratioB - targetRatio)
        if (Math.abs(diffA - diffB) > 0.0005) return diffA - diffB
      }
      return areaB - areaA
    })
    .map(item => ({
      url: item.url,
      type: 'image',
      width: Number(item?.width || 0),
      height: Number(item?.height || 0),
      sourceType: 'image_versions2',
    }))
}

function pickBestImageVersion(item) {
  return pickBestImageVersions(item)[0]?.url || ''
}

function extractInstagramDashUrls(manifest = '') {
  const urls = []
  for (const match of String(manifest).matchAll(/<BaseURL[^>]*>([^<]+)<\/BaseURL>/gi)) {
    const url = normalizeEmbeddedUrl(match[1])
    if (isHttpUrl(url)) urls.push(url)
  }
  return [...new Set(urls)]
}

function isInstagramVideoItem(item) {
  return item?.is_video === true
    || item?.isVideo === true
    || item?.__typename === 'GraphVideo'
    || Number(item?.media_type) === 2
    || Number(item?.product_type_code) === 2
    || Array.isArray(item?.video_versions) && item.video_versions.length > 0
    || typeof item?.video_url === 'string'
    || typeof item?.video_dash_manifest === 'string'
}

function mediaCandidatesFromInstagramItem(item, { videoOnly = false } = {}) {
  if (!item || typeof item !== 'object') return []

  if (Array.isArray(item.carousel_media)) {
    return item.carousel_media.flatMap(media => mediaCandidatesFromInstagramItem(media, { videoOnly }))
  }

  const videos = pickBestVideoVersion(item.video_versions || [])
  if (videos.length) return videos

  if (typeof item.video_url === 'string' && isHttpUrl(item.video_url)) {
    return [{
      url: item.video_url,
      type: 'video',
      width: Number(item?.dimensions?.width || item?.original_width || 0),
      height: Number(item?.dimensions?.height || item?.original_height || 0),
      bitrate: Number(item?.bitrate || 0),
      hasAudio: item?.has_audio !== false,
      sourceType: 'video_url',
    }]
  }

  if (typeof item.video_dash_manifest === 'string') {
    const dash = extractInstagramDashUrls(item.video_dash_manifest)
    if (dash.length) return dash.map(url => ({ url, type: 'video', sourceType: 'video_dash_manifest' }))
  }

  if (videoOnly || isInstagramVideoItem(item)) return []
  return pickBestImageVersions(item)
}

function mediaUrlsFromInstagramItem(item, options = {}) {
  return mediaCandidatesFromInstagramItem(item, options).map(candidate => candidate.url)
}

function dedupeInstagramCandidates(candidates = []) {
  const seen = new Set()
  const result = []
  for (const candidate of candidates) {
    if (!candidate || !isHttpUrl(candidate.url)) continue
    const type = candidate.type === 'image' ? 'image' : 'video'
    const key = `${type}:${candidate.url}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push({ ...candidate, type })
  }
  return result
}

function instagramVideoIntent(input = '') {
  try {
    const pathname = new URL(input).pathname.toLowerCase()
    return /\/(reel|reels|tv)\//.test(pathname) ? 'video' : 'auto'
  } catch {
    return 'auto'
  }
}

function filterInstagramCandidatesForIntent(candidates = [], intent = 'auto') {
  const unique = dedupeInstagramCandidates(candidates)
  if (intent === 'video') return unique.filter(candidate => candidate.type === 'video')
  const videos = unique.filter(candidate => candidate.type === 'video')
  return videos.length ? videos : unique
}

function collectTypedInstagramCandidates(value, parentKey = '', output = [], depth = 0) {
  if (!value || depth > 32) return output

  if (Array.isArray(value)) {
    for (const item of value) collectTypedInstagramCandidates(item, parentKey, output, depth + 1)
    return output
  }

  if (typeof value !== 'object') return output

  if (Array.isArray(value.video_versions) && value.video_versions.length) {
    output.push(...pickBestVideoVersion(value.video_versions))
  }

  if (typeof value.video_url === 'string' && isHttpUrl(value.video_url)) {
    output.push({
      url: value.video_url,
      type: 'video',
      width: Number(value?.dimensions?.width || value?.original_width || 0),
      height: Number(value?.dimensions?.height || value?.original_height || 0),
      bitrate: Number(value?.bitrate || 0),
      hasAudio: value?.has_audio !== false,
      sourceType: 'typed-video-url',
    })
  }

  if (typeof value.video_dash_manifest === 'string') {
    output.push(...extractInstagramDashUrls(value.video_dash_manifest).map(url => ({
      url,
      type: 'video',
      sourceType: 'typed-video-dash',
    })))
  }

  if (value.image_versions2 && typeof value.image_versions2 === 'object' && Array.isArray(value.image_versions2.candidates)) {
    output.push(...pickBestImageVersions(value))
  }

  const key = String(parentKey || '').toLowerCase()
  for (const [name, item] of Object.entries(value)) {
    const lowered = String(name || '').toLowerCase()
    if (typeof item === 'string' && isHttpUrl(item)) {
      if (/playable_url|browser_native_(?:hd|sd)_url|video_url|video_src|video_source|video_path|content_url|stream_url|mp4/i.test(lowered)) {
        output.push({ url: normalizeEmbeddedUrl(item), type: 'video', sourceType: 'typed-url' })
      } else if (/image_url|display_url|thumbnail_url|thumbnail_src|display_src|image_path/i.test(lowered)) {
        output.push({ url: normalizeEmbeddedUrl(item), type: 'image', sourceType: 'typed-url' })
      }
      continue
    }
    if (item && typeof item === 'object') collectTypedInstagramCandidates(item, name || key, output, depth + 1)
  }

  return output
}

function extractInstagramProductCandidatesFromData(data, { videoOnly = false } = {}) {
  const candidates = collectTypedInstagramCandidates(data)
  return filterInstagramCandidatesForIntent(candidates, videoOnly ? 'video' : 'auto').slice(0, MAX_MEDIA_COUNT)
}

function extractInstagramProductCandidatesFromHtml(html = '', { videoOnly = false } = {}) {
  const candidates = []
  for (const item of normalizeInstagramMediaObjects(findInstagramMediaObjects(extractSjsJsonBlocks(html)))) {
    candidates.push(...mediaCandidatesFromInstagramItem(item, { videoOnly }))
  }
  return filterInstagramCandidatesForIntent(candidates, videoOnly ? 'video' : 'auto').slice(0, MAX_MEDIA_COUNT)
}

function extractInstagramProductUrlsFromHtml(html = '', options = {}) {
  return extractInstagramProductCandidatesFromHtml(html, options).map(candidate => candidate.url)
}

function extractCookieHeaderValue(headers, name) {
  const raw = String(headers?.get?.('set-cookie') || headers?.get?.('set-cookie2') || '')
  const match = raw.match(new RegExp(`(?:^|[,; ]+)${name}=([^;\s,]+)`, 'i'))
  return match?.[1] || ''
}

async function getInstagramBootstrap(signal) {
  if (IG_BOOTSTRAP_CACHE.token && Date.now() - IG_BOOTSTRAP_CACHE.time < IG_BOOTSTRAP_TTL) return IG_BOOTSTRAP_CACHE

  const response = await request('https://www.instagram.com/', {
    timeoutMs: 7000,
    retries: 1,
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      'X-IG-App-ID': INSTAGRAM_WEB_APP_ID,
      'X-ASBD-ID': '359341',
      'X-IG-WWW-Claim': '0',
      'User-Agent': DEFAULT_UA,
    },
    signal,
  })
  const html = await response.text()
  const csrfToken = extractCookieHeaderValue(response.headers, 'csrftoken')
  let token = ''

  const eqmcScript = html.match(/<script\b[^>]*\bid=["']__eqmc["'][^>]*>([\s\S]*?)<\/script>/i)?.[1]
  if (eqmcScript) {
    try {
      const parsed = JSON.parse(eqmcScript.trim())
      token = String(parsed?.l || '')
    } catch {}
  }

  if (!token) token = html.match(/\["LSD",\[\],\{"token":"([^"]+)"/i)?.[1] || ''
  if (!token) throw new Error('Token Instagram tidak ditemukan.')

  IG_BOOTSTRAP_CACHE.html = html
  IG_BOOTSTRAP_CACHE.token = token
  IG_BOOTSTRAP_CACHE.csrfToken = csrfToken
  IG_BOOTSTRAP_CACHE.time = Date.now()
  return IG_BOOTSTRAP_CACHE
}

async function checkInstagramAccessibility(mediaId, signal) {
  try {
    const response = await request(`https://www.instagram.com/api/v1/web/get_ruling_for_content/?content_type=MEDIA&target_id=${encodeURIComponent(mediaId)}`, {
      timeoutMs: 4500,
      retries: 0,
      headers: {
        'X-IG-App-ID': INSTAGRAM_WEB_APP_ID,
        'X-ASBD-ID': '359341',
        'X-IG-WWW-Claim': '0',
        Origin: 'https://www.instagram.com',
        Accept: '*/*',
        Referer: 'https://www.instagram.com/',
        'User-Agent': DEFAULT_UA,
      },
      signal,
    })
    return responseJson(response)
  } catch {
    return {}
  }
}

async function scrapeInstagramGraphql(input, signal) {
  const shortcode = extractInstagramShortcode(input)
  const mediaId = instagramShortcodeToMediaId(shortcode)
  if (!mediaId) return []

  const [bootstrap, apiCheck] = await Promise.all([
    getInstagramBootstrap(signal),
    checkInstagramAccessibility(mediaId, signal),
  ])
  const cookie = getInstagramCookieHeader()
  const csrfTokenRaw = cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/i)?.[1] || bootstrap.csrfToken || ''
  const csrfToken = apiCheck?.status === 'ok' ? csrfTokenRaw : ''
  const body = new URLSearchParams({
    lsd: bootstrap.token,
    fb_api_caller_class: 'RelayModern',
    fb_api_req_friendly_name: 'PolarisLoggedOutDesktopWWWPostRootContentQuery',
    server_timestamps: 'true',
    variables: JSON.stringify({ media_id: mediaId }),
    doc_id: INSTAGRAM_GRAPHQL_DOC_ID,
  }).toString()

  const response = await request('https://www.instagram.com/api/graphql', {
    method: 'POST',
    timeoutMs: 8500,
    retries: 0,
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/x-www-form-urlencoded',
      Origin: 'https://www.instagram.com',
      Referer: canonicalInstagramUrl(input),
      'X-Requested-With': 'XMLHttpRequest',
      'X-IG-App-ID': INSTAGRAM_WEB_APP_ID,
      'X-ASBD-ID': '359341',
      'X-IG-WWW-Claim': '0',
      'X-FB-Friendly-Name': 'PolarisLoggedOutDesktopWWWPostRootContentQuery',
      'X-FB-LSD': bootstrap.token,
      ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      'User-Agent': DEFAULT_UA,
    },
    body,
    signal,
  })
  const data = await responseJson(response)
  const items = instagramGraphqlMedia(data)
  const intent = instagramVideoIntent(input)
  const candidates = items.flatMap(item => mediaCandidatesFromInstagramItem(item, { videoOnly: intent === 'video' }))
  const filtered = filterInstagramCandidatesForIntent(candidates, intent)
  if (filtered.length) return filtered.slice(0, MAX_MEDIA_COUNT)

  const fallback = extractInstagramProductCandidatesFromData(data, { videoOnly: intent === 'video' })
  const fallbackFiltered = filterInstagramCandidatesForIntent(fallback, intent)
  if (!fallbackFiltered.length) throw new Error('Instagram GraphQL tidak mengembalikan media.')
  return fallbackFiltered.slice(0, MAX_MEDIA_COUNT)
}

async function scrapeInstagramApi(input, signal) {
  const shortcode = extractInstagramShortcode(input)
  const mediaId = instagramShortcodeToMediaId(shortcode)
  if (!mediaId) return []

  const cookie = getInstagramCookieHeader()
  const variants = [
    { host: 'www.instagram.com', ua: INSTAGRAM_ANDROID_UA, appId: INSTAGRAM_ANDROID_APP_ID },
    { host: 'www.instagram.com', ua: DEFAULT_UA, appId: INSTAGRAM_WEB_APP_ID },
    { host: 'i.instagram.com', ua: INSTAGRAM_ANDROID_UA, appId: INSTAGRAM_ANDROID_APP_ID },
  ]

  const data = await Promise.any(variants.map(variant =>
    request(`https://${variant.host}/api/v1/media/${mediaId}/info/`, {
      timeoutMs: 5000,
      retries: 0,
      headers: {
        Accept: 'application/json,text/plain,*/*',
        'X-IG-App-ID': variant.appId,
        'X-ASBD-ID': '359341',
        'X-IG-WWW-Claim': '0',
        'X-Requested-With': 'XMLHttpRequest',
        Referer: 'https://www.instagram.com/',
        Origin: 'https://www.instagram.com',
        'User-Agent': variant.ua,
        ...(cookie ? { Cookie: cookie } : {}),
      },
      signal,
    }).then(async response => {
      if (response.url && /(?:\/accounts\/login|instagram\.com\/$)/i.test(response.url)) throw new Error('Instagram authentication redirect.')
      return responseJson(response)
    })
  ))

  const item = data?.items?.[0]
  const intent = instagramVideoIntent(input)
  const candidates = mediaCandidatesFromInstagramItem(item, { videoOnly: intent === 'video' })
  const filtered = filterInstagramCandidatesForIntent(candidates, intent)
  if (!filtered.length) throw new Error('Media Instagram API tidak mengembalikan media.')
  return filtered.slice(0, MAX_MEDIA_COUNT)
}

async function scrapeInstagramStructured(input, signal) {
  const endpoints = instagramStructuredUrls(input)
  if (!endpoints.length) return []
  const data = await Promise.any(endpoints.map(endpoint =>
    request(endpoint, {
      timeoutMs: 6000,
      retries: 0,
      headers: {
        Accept: 'application/json,text/plain,*/*',
        'X-Requested-With': 'XMLHttpRequest',
        Referer: input,
        'User-Agent': DEFAULT_UA,
      },
      signal,
    }).then(responseJson)
  ))
  const intent = instagramVideoIntent(input)
  const direct = extractInstagramProductCandidatesFromData(data, { videoOnly: intent === 'video' })
  const filtered = filterInstagramCandidatesForIntent(direct, intent)
  if (!filtered.length) throw new Error('Data media Instagram tidak ditemukan.')
  return filtered.slice(0, MAX_MEDIA_COUNT)
}

function getInstagramCookiePath() {
  const configured = String(process.env.USANAGI_INSTAGRAM_COOKIES || '').trim()
  if (configured && fs.pathExistsSync(configured)) return configured

  const local = path.resolve(process.cwd(), 'storage', 'instagram-cookies.txt')
  if (fs.pathExistsSync(local)) return local

  return ''
}

async function cleanupYtDlpBase(base) {
  const dir = path.dirname(base)
  const prefix = path.basename(base)

  try {
    const entries = await fs.readdir(dir)
    await Promise.all(
      entries
        .filter(entry => entry.startsWith(prefix))
        .map(entry => fs.remove(path.join(dir, entry)).catch(() => {}))
    )
  } catch {}
}

async function findYtDlpOutput(base) {
  const dir = path.dirname(base)
  const prefix = path.basename(base)
  try {
    const entries = await fs.readdir(dir)
    const matches = entries
      .filter(entry => entry.startsWith(prefix) && !entry.endsWith('.part'))
      .map(entry => path.join(dir, entry))
      .filter(file => /\.(mp4|mkv|webm|mov|m4v|3gp)$/i.test(file))

    for (const file of matches) {
      const stat = await fs.stat(file).catch(() => null)
      if (stat?.isFile() && stat.size > 0) return file
    }
  } catch {}
  return ''
}

async function maybeUpdateInstagramYtDlp() {
  if (Date.now() - igYtdlpUpdatedAt < IG_YTDLP_UPDATE_TTL) return
  if (!igYtdlpUpdatePromise) {
    igYtdlpUpdatePromise = (async () => {
      await ensureYtDlp()
      try {
        await runYtDlp(['--update-to', 'nightly'], 120000)
      } catch {}
      igYtdlpUpdatedAt = Date.now()
    })().finally(() => {
      igYtdlpUpdatePromise = null
    })
  }
  await igYtdlpUpdatePromise
}

async function downloadInstagramWithYtDlp(input, signal) {
  await maybeUpdateInstagramYtDlp()
  const base = ytdlpTempBase('usanagi-instagram')
  const ffmpegArgs = await getFfmpegLocationArgs()
  const cookies = getInstagramCookiePath()
  const browserCookies = String(process.env.USANAGI_INSTAGRAM_BROWSER || '').trim()
  const cookieHeader = String(process.env.USANAGI_INSTAGRAM_COOKIE || '').trim()
  const profiles = [
    { ua: DEFAULT_UA, appId: INSTAGRAM_WEB_APP_ID, cookiePath: cookies, browser: browserCookies, cookieHeader },
    { ua: INSTAGRAM_ANDROID_UA, appId: INSTAGRAM_ANDROID_APP_ID, cookiePath: cookies, browser: browserCookies, cookieHeader },
    { ua: INSTAGRAM_ANDROID_UA, appId: INSTAGRAM_ANDROID_APP_ID, cookiePath: '', browser: '', cookieHeader: '' },
  ]
  let lastError = null

  for (const profile of profiles) {
    const args = [
      input,
      '-f', 'bv*+ba/b',
      '--merge-output-format', 'mp4',
      '--remux-video', 'mp4',
      '--max-filesize', '2G',
      '--no-playlist',
      '--retries', '6',
      '--fragment-retries', '8',
      '--extractor-retries', '3',
      '--file-access-retries', '3',
      '--retry-sleep', 'fragment:exp=1:10',
      '--concurrent-fragments', String(global.youtubeDownloader?.ytDlpConcurrentFragments || 4),
      '--socket-timeout', '20',
      '--no-warnings',
      '--quiet',
      '--user-agent', profile.ua,
      '--extractor-args', `Instagram:app_id=${profile.appId}`,
      ...ffmpegArgs,
      '-o', `${base}.%(ext)s`,
    ]

    if (profile.cookiePath) args.push('--cookies', profile.cookiePath)
    else if (profile.browser) args.push('--cookies-from-browser', profile.browser)
    else if (profile.cookieHeader) args.push('--add-header', `Cookie:${profile.cookieHeader}`)

    try {
      await runYtDlp(args, 100000, { signal })
      const file = await findYtDlpOutput(base)
      if (!file) throw new Error('yt-dlp tidak menghasilkan file video Instagram.')
      const stat = await fs.stat(file)
      if (!stat.size || stat.size > MAX_MEDIA_BYTES) {
        await fs.remove(file).catch(() => {})
        throw new Error('Ukuran media Instagram tidak sesuai batas.')
      }
      return file
    } catch (error) {
      lastError = error
      await cleanupYtDlpBase(base)
      if (signal?.aborted) throw error
    }
  }

  throw lastError || new Error('yt-dlp gagal memproses Instagram.')
}

function getInstagramCache(input) {
  const value = IG_CACHE.get(input)
  if (!value || Date.now() - value.time > IG_CACHE_TTL) {
    IG_CACHE.delete(input)
    return null
  }
  return value.candidates
}

function setInstagramCache(input, candidates) {
  const normalized = filterInstagramCandidatesForIntent(candidates).slice(0, MAX_MEDIA_COUNT)
  if (normalized.length) IG_CACHE.set(input, { time: Date.now(), candidates: normalized })
  return normalized
}

async function resolveInstagramFast(input, attempt = null) {
  const canonical = await resolveInstagramCanonicalUrl(input, new AbortController().signal)
  const source = canonicalInstagramUrl(canonical)
  const intent = instagramVideoIntent(source)
  const cached = getInstagramCache(source)
  if (cached?.length) {
    const validCached = filterInstagramCandidatesForIntent(cached, intent)
    if (validCached.length && (!attempt || await attempt({ kind: 'remote', candidates: validCached, cached: true, intent }))) {
      return { kind: 'remote', candidates: validCached, cached: true, intent }
    }
    IG_CACHE.delete(source)
  }

  const tierController = new AbortController()
  let lastError = new Error('Media Instagram tidak ditemukan.')
  const tierTasks = [
    [
      scrapeInstagramGraphql(source, tierController.signal).then(candidates => ({ kind: 'remote', candidates, tier: 1 })),
      scrapeInstagramApi(source, tierController.signal).then(candidates => ({ kind: 'remote', candidates, tier: 1 })),
    ],
    [
      scrapeInstagramWebSjs(source, tierController.signal).then(candidates => ({ kind: 'remote', candidates, tier: 2 })),
      scrapeInstagramPage(source, tierController.signal).then(candidates => ({ kind: 'remote', candidates, tier: 2 })),
      scrapeInstagramEmbed(source, tierController.signal).then(candidates => ({ kind: 'remote', candidates, tier: 2 })),
    ],
  ]

  try {
    for (const tier of tierTasks) {
      const pending = tier.map(task => task.then(result => {
        const candidates = filterInstagramCandidatesForIntent(result.candidates, intent)
        if (!candidates.length) throw new Error('Resolver Instagram tidak mengembalikan media yang sesuai.')
        return { ...result, candidates }
      }))
      while (pending.length) {
        const result = await Promise.race(pending.map((promise, index) =>
          promise.then(value => ({ index, value }), error => ({ index, error }))
        ))
        pending.splice(result.index, 1)
        if (result.error) {
          lastError = result.error
          continue
        }
        if (!attempt || await attempt(result.value)) {
          const candidates = setInstagramCache(source, result.value.candidates)
          tierController.abort()
          return { ...result.value, candidates, intent }
        }
        lastError = new Error('Media Instagram dari resolver ini tidak dapat dikirim.')
      }
    }
  } finally {
    tierController.abort()
  }

  try {
    const data = await resolveAio(source)
    const candidate = data?.url && isHttpUrl(data.url)
      ? { url: data.url, type: intent === 'video' ? 'video' : mediaTypeFromUrl(data.url), sourceType: 'aio' }
      : null
    const candidates = filterInstagramCandidatesForIntent(candidate ? [candidate] : [], intent)
    if (candidates.length && (!attempt || await attempt({ kind: 'remote', candidates, tier: 'aio', intent }))) {
      return { kind: 'remote', candidates, tier: 'aio', intent }
    }
  } catch (error) {
    lastError = error
  }

  const ytdlpController = new AbortController()
  try {
    const file = await downloadInstagramWithYtDlp(source, ytdlpController.signal)
    return { kind: 'ytdlp', file, intent }
  } catch (error) {
    lastError = error
  }

  throw lastError
}

function instagramHeaders(url, { video = false } = {}) {
  const instagramHost = hostMatches(url, ['cdninstagram.com', 'fbcdn.net', 'instagram.com'])
  if (!instagramHost) return { Referer: 'https://www.instagram.com/' }
  return {
    Referer: 'https://www.instagram.com/',
    ...(video ? { Accept: 'video/mp4,video/*,*/*' } : { Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8' }),
    'Accept-Encoding': 'identity',
    'User-Agent': INSTAGRAM_ANDROID_UA,
    'X-IG-App-ID': INSTAGRAM_ANDROID_APP_ID,
    ...(getInstagramCookieHeader() ? { Cookie: getInstagramCookieHeader() } : {}),
  }
}

async function sendInstagramRemoteMedia(conn, m, candidates, { videoOnly = false } = {}) {
  let sent = 0
  const filtered = filterInstagramCandidatesForIntent(candidates, videoOnly ? 'video' : 'auto')

  for (const candidate of filtered.slice(0, MAX_MEDIA_COUNT)) {
    try {
      if (candidate.type === 'video') {
        const prepared = await prepareRemoteWhatsAppVideo(candidate.url, {
          prefix: 'usanagi-instagram-verified',
          timeoutMs: 120000,
          maxBytes: MAX_MEDIA_BYTES,
          headers: instagramHeaders(candidate.url, { video: true }),
        })
        await sendLocalMediaFast(conn, m, prepared.file, {
          caption: sent === 0 ? '📷 Instagram Downloader' : '',
          type: 'video',
          mimeType: 'video/mp4',
          fileName: `instagram-${sent + 1}.mp4`,
          maxBytes: MAX_MEDIA_BYTES,
        })
      } else {
        if (videoOnly) continue
        await sendRemoteMediaFast(conn, m, candidate.url, {
          caption: sent === 0 ? '📷 Instagram Downloader' : '',
          fallbackType: 'image',
          maxBytes: MAX_MEDIA_BYTES,
          fileName: `instagram-${sent + 1}.jpg`,
          mimeType: 'image/jpeg',
          probe: false,
          preferDirect: true,
          timeoutMs: 18000,
          headers: instagramHeaders(candidate.url, { video: false }),
        })
      }
      sent++
    } catch {}
  }

  return sent
}

async function sendInstagramYtDlp(conn, m, file) {
  const prepared = await prepareYtDlpVideo(file, { prefix: 'usanagi-instagram-ready', removeInput: true })
  return sendLocalMediaFast(conn, m, prepared.file, {
    caption: '📷 Instagram Downloader',
    type: 'video',
    mimeType: 'video/mp4',
    fileName: 'instagram.mp4',
    maxBytes: MAX_MEDIA_BYTES,
  })
}

function mapInstagramError(error) {
  const message = String(error?.message || '').toLowerCase()

  if (message.includes('link tersebut bukan link instagram')) {
    return '❌ Link tersebut bukan link Instagram.'
  }

  if (message.includes('url instagram tidak valid')) {
    return '❌ Link Instagram tidak valid.'
  }

  if (message.includes('timeout') || message.includes('batas waktu')) {
    return '❌ Proses Instagram terlalu lama. Coba lagi beberapa saat.'
  }

  if (message.includes('login required') || message.includes('requested content is not available') || message.includes('empty media response') || message.includes('authentication redirect')) {
    return '❌ Media Instagram tidak bisa diakses saat ini. Pastikan posting/reel dapat dibuka tanpa login atau gunakan cookie Instagram pada server.'
  }

  if (message.includes('yt-dlp') || message.includes('binary')) {
    return '❌ Downloader Instagram tidak tersedia pada server saat ini. Coba lagi setelah konfigurasi downloader siap.'
  }

  if (message.includes('ukuran media') || message.includes('ukuran file')) return '❌ Media Instagram terlalu besar untuk dikirim oleh WhatsApp.'
  if (message.includes('403') || message.includes('forbidden') || message.includes('rate limit')) return '❌ Instagram sedang membatasi akses. Coba lagi beberapa saat.'

  return '❌ Gagal mengambil media Instagram. Pastikan link posting/reel masih aktif lalu coba lagi.'
}

const handler = async (m, { conn, usedPrefix }) => {
  const commandName = String(m.command || 'instagram').trim() || 'instagram'
  const input = String(m.text || '').trim()

  if (!input) {
    m.limit?.fail()
    return m.reply([
      'Cara penggunaan:',
      `${usedPrefix}${commandName} <url>`,
      '',
      'Contoh:',
      `${usedPrefix}${commandName} https://www.instagram.com/reel/xxxxx/`,
      '',
      'Mendukung link posting dan reel Instagram yang masih dapat diakses.',
    ].join('\n'))
  }

  if (!isHttpUrl(input)) {
    m.limit?.fail()
    return m.reply('❌ Link Instagram tidak valid.')
  }

  try {
    normalizeInstagramUrl(input)
  } catch (error) {
    m.limit?.fail()
    return m.reply(`❌ ${error.message}`)
  }

  void conn.sendMessage(m.chat, {
    react: { text: '⏳', key: m.raw.key },
  }).catch(() => {})

  try {
    const winner = await resolveInstagramFast(input, async result => {
      if (result.kind === 'remote') return Boolean(await sendInstagramRemoteMedia(conn, m, result.candidates, { videoOnly: result.intent === 'video' }))
      return true
    })
    if (winner.kind === 'ytdlp') await sendInstagramYtDlp(conn, m, winner.file)

    m.limit?.success()
    void conn.sendMessage(m.chat, { react: { text: '✅', key: m.raw.key } }).catch(() => {})
    return
  } catch (error) {
    m.limit?.fail()

    try {
      await conn.sendMessage(m.chat, {
        react: { text: '❌', key: m.raw.key },
      })
    } catch {}

    return m.reply(mapInstagramError(error))
  }

}

handler.command = /^(instagram|ig|igdl)$/i
handler.help = ['instagram', 'ig', 'igdl']
handler.tags = ['download']
handler.category = 'download'
handler.description = 'Download media Instagram'
handler.limit = true
handler.limitCommit = 'manual'

export default handler
