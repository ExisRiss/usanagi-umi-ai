/* By AlzRiss - Usanagi Umi AI */

import { sendRemoteMediaFast, sendLocalMediaFast } from '../../lib/awang-media-transfer.js'
import { ytDlpDownloadBest } from '../../lib/awang-ytdlp.js'


const DEFAULT_UA = 'Mozilla/5.0 (Linux; Android 13; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36'

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

export async function request(url, { method = 'GET', headers = {}, body, timeoutMs = 30000, signal } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const relay = () => controller.abort()

  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', relay, { once: true })
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

    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('Permintaan melebihi batas waktu.')
    throw error
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener?.('abort', relay)
  }
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

const DOWNR_BASE = (process.env.USANAGI_DOWNR_URL || 'https://downr.org').replace(/\/+$/, '')
const FAA_BASE = (process.env.USANAGI_AIO_URL || 'https://api-faa.my.id').replace(/\/+$/, '')
const ANALYTICS = `${DOWNR_BASE}/.netlify/functions/analytics`
const DOWNLOAD = `${DOWNR_BASE}/.netlify/functions/download`
const NYT = `${DOWNR_BASE}/.netlify/functions/nyt`
const AIO_TIMEOUT = Number(process.env.USANAGI_AIO_TIMEOUT_MS) || 45000
const AIO_MAX_BYTES = 2 * 1024 * 1024 * 1024

function parseLooseJson(text) {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function isSuccessful(status, data) {
  if (status < 200 || status >= 300) return false
  if (data === null || data === undefined || data === '') return false
  if (typeof data === 'string') {
    return !['error', 'failed', 'user_retry_required', 'false', 'null'].includes(data.toLowerCase())
  }
  if (typeof data === 'object') {
    return data.error !== true && data.status !== false && data.success !== false
  }
  return true
}

function extractError(data, status) {
  if (typeof data === 'string') return data || `HTTP ${status}`
  if (data && typeof data === 'object') return data.message || data.error || data.reason || `HTTP ${status}`
  return `HTTP ${status}`
}

function makeTimeoutSignal(timeoutMs, parentSignal) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const abortParent = () => controller.abort()
  if (parentSignal) {
    if (parentSignal.aborted) controller.abort()
    else parentSignal.addEventListener('abort', abortParent, { once: true })
  }
  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer)
      parentSignal?.removeEventListener?.('abort', abortParent)
    },
  }
}

async function getDownrCookie({ signal } = {}) {
  const response = await request(ANALYTICS, {
    timeoutMs: Math.min(AIO_TIMEOUT, 30000),
    headers: {
      Accept: '*/*',
      Referer: `${DOWNR_BASE}/`,
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'cors',
    },
    signal,
  })
  const getSetCookie = response.headers.getSetCookie?.bind(response.headers)
  const values = getSetCookie ? getSetCookie() : []
  return values.map(value => String(value).split(';')[0]).filter(Boolean).join('; ')
}

async function postDownr(endpoint, url, cookie = '', { signal } = {}) {
  const response = await request(endpoint, {
    method: 'POST',
    timeoutMs: AIO_TIMEOUT,
    signal,
    headers: {
      Accept: '*/*',
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      'Content-Type': 'application/json',
      'Accept-Encoding': 'gzip, deflate, br',
      Cookie: cookie,
      Origin: DOWNR_BASE,
      Referer: `${DOWNR_BASE}/`,
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-origin',
    },
    body: JSON.stringify({ url }),
  })

  return {
    endpoint,
    status: response.status,
    data: parseLooseJson(await response.text()),
  }
}

function candidateType(value = '', url = '') {
  const type = String(value || '').toLowerCase()
  if (type.includes('image')) return 'image'
  if (type.includes('audio') || type.includes('music')) return 'audio'
  if (type.includes('video')) return 'video'
  return mediaTypeFromUrl(url || value)
}

function numeric(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function candidateScore(item) {
  const type = candidateType(item?.type || item?.mime || '', item?.url || '')
  const width = numeric(item?.width)
  const height = numeric(item?.height)
  const bitrate = numeric(item?.bitrate || item?.audioBitrate || item?.audio_bitrate)
  const size = numeric(item?.filesize || item?.fileSize || item?.size)
  const qualityText = String(item?.quality || item?.resolution || '').toLowerCase()
  const quality = numeric(qualityText.match(/(\d{3,5})/)?.[1])
  const typeWeight = type === 'video' ? 3 : type === 'audio' ? 2 : type === 'image' ? 1 : 0
  return typeWeight * 1e15 + height * Math.max(width, 1) * 1e6 + bitrate * 100 + size + quality * 1000
}

function makeCandidate(item, source = '') {
  if (!item) return null
  if (typeof item === 'string') {
    if (!isHttpUrl(item)) return null
    return { url: item, type: candidateType(item), title: '', source, score: candidateScore({ url: item }) }
  }
  if (typeof item !== 'object') return null

  const rawUrl = item.url || item.download_url || item.downloadUrl || item.mediaUrl || item.media_url || item.videoUrl || item.video_url || item.audioUrl || item.audio_url || item.link || item.src
  if (!isHttpUrl(rawUrl)) return null

  const candidate = {
    url: rawUrl,
    type: candidateType(item.type || item.mime || item.mimeType || '', rawUrl),
    title: String(item.title || item.caption || item.name || ''),
    fileName: String(item.fileName || item.filename || item.name || ''),
    mimeType: String(item.mime || item.mimeType || item.contentType || ''),
    width: numeric(item.width),
    height: numeric(item.height),
    bitrate: numeric(item.bitrate || item.audioBitrate || item.audio_bitrate),
    size: numeric(item.filesize || item.fileSize || item.size),
    ext: String(item.ext || item.extension || ''),
    source,
  }
  candidate.score = candidateScore(candidate)
  return candidate
}

function collectMediaCandidates(data, source = '', output = [], seen = new Set()) {
  if (!data) return output
  if (typeof data === 'string') {
    const candidate = makeCandidate(data, source)
    if (candidate && !seen.has(candidate.url)) {
      seen.add(candidate.url)
      output.push(candidate)
    }
    return output
  }
  if (Array.isArray(data)) {
    for (const item of data) collectMediaCandidates(item, source, output, seen)
    return output
  }
  if (typeof data !== 'object') return output

  const mediaArrays = ['medias', 'media', 'mediaItems', 'items', 'downloads', 'formats', 'results', 'links']
  for (const key of mediaArrays) {
    const value = data[key]
    if (Array.isArray(value)) {
      for (const item of value) {
        const candidate = makeCandidate(item, source)
        if (candidate && !seen.has(candidate.url)) {
          seen.add(candidate.url)
          output.push(candidate)
        }
        collectMediaCandidates(item, source, output, seen)
      }
    } else if (value && typeof value === 'object') {
      const candidate = makeCandidate(value, source)
      if (candidate && !seen.has(candidate.url)) {
        seen.add(candidate.url)
        output.push(candidate)
      }
      collectMediaCandidates(value, source, output, seen)
    }
  }

  const directKeys = ['download_url', 'downloadUrl', 'download', 'video_url', 'videoUrl', 'audio_url', 'audioUrl', 'media_url', 'mediaUrl', 'play_url', 'playUrl', 'nowm', 'no_watermark', 'noWatermark', 'source', 'src']
  for (const key of directKeys) {
    const value = data[key]
    const candidate = makeCandidate(typeof value === 'string' ? value : value, source)
    if (candidate && !seen.has(candidate.url)) {
      seen.add(candidate.url)
      output.push(candidate)
    }
  }

  const nestedKeys = ['result', 'data', 'response', 'api']
  for (const key of nestedKeys) {
    if (data[key] && typeof data[key] === 'object') collectMediaCandidates(data[key], source, output, seen)
  }

  return output
}

function normalizeCandidates(candidates) {
  const unique = new Map()
  for (const candidate of candidates || []) {
    if (!candidate?.url || !isHttpUrl(candidate.url)) continue
    const key = candidate.url.replace(/#.*$/, '')
    const old = unique.get(key)
    if (!old || candidate.score > old.score) unique.set(key, candidate)
  }
  return [...unique.values()].sort((a, b) => b.score - a.score)
}

function parseDownrCandidates(result) {
  if (!isSuccessful(result.status, result.data)) throw new Error(extractError(result.data, result.status))
  const candidates = normalizeCandidates(collectMediaCandidates(result.data, `downr:${result.endpoint}`))
  if (!candidates.length) throw new Error('API Downr tidak mengembalikan media yang dapat diproses.')
  const title = String(result.data?.title || result.data?.caption || result.data?.result?.title || 'Universal Downloader')
  return { candidates, title, source: 'downr' }
}

async function downr(url, { signal } = {}) {
  const cookie = await getDownrCookie({ signal }).catch(() => '')
  const endpoints = [NYT, DOWNLOAD]

  const firstPass = await Promise.allSettled(endpoints.map(endpoint => postDownr(endpoint, url, cookie, { signal })))
  for (const item of firstPass) {
    if (item.status !== 'fulfilled') continue
    try {
      return parseDownrCandidates(item.value)
    } catch {}
  }

  const freshCookie = await getDownrCookie({ signal }).catch(() => cookie)
  const retryPass = await Promise.allSettled(endpoints.map(endpoint => postDownr(endpoint, url, freshCookie, { signal })))
  for (const item of retryPass) {
    if (item.status !== 'fulfilled') continue
    try {
      return parseDownrCandidates(item.value)
    } catch {}
  }

  throw new Error('Downr tidak mengembalikan media yang dapat diproses.')
}

async function faaAio(url, { signal } = {}) {
  const response = await request(`${FAA_BASE}/faa/aio?url=${encodeURIComponent(url)}`, {
    timeoutMs: AIO_TIMEOUT,
    signal,
    headers: { Accept: 'application/json', 'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7' },
  })
  const data = await responseJson(response)
  const candidates = normalizeCandidates(collectMediaCandidates(data, 'faa'))
  if (!candidates.length) throw new Error(data?.message || data?.error || 'API AIO tidak mengembalikan media.')
  return {
    candidates,
    title: String(data?.result?.title || data?.title || data?.result?.caption || 'Universal Downloader'),
    source: 'faa',
  }
}

async function validateCandidate(url, { signal, timeoutMs = 5000 } = {}) {
  if (!isHttpUrl(url)) return false
  const { signal: localSignal, cleanup } = makeTimeoutSignal(timeoutMs, signal)
  try {
    const controller = new AbortController()
    const relay = () => controller.abort()
    if (localSignal.aborted) controller.abort()
    else localSignal.addEventListener('abort', relay, { once: true })
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': DEFAULT_UA,
        Accept: '*/*',
        Range: 'bytes=0-0',
        'Accept-Encoding': 'identity',
      },
      redirect: 'follow',
      signal: controller.signal,
    })
    localSignal.removeEventListener('abort', relay)
    if (!response.ok) return false
    const type = String(response.headers.get('content-type') || '').toLowerCase()
    if (type.includes('text/html') || type.includes('application/xhtml')) return false
    return true
  } catch {
    return false
  } finally {
    cleanup()
  }
}

async function resolveAioCandidates(url, { signal } = {}) {
  const sourceUrl = String(url).trim()
  if (!isHttpUrl(sourceUrl)) throw new Error('URL tidak valid.')

  const directType = mediaTypeFromUrl(sourceUrl)
  if (directType !== 'unknown') {
    return { candidates: [{ url: sourceUrl, type: directType, title: '', source: 'direct', score: Number.MAX_SAFE_INTEGER }], title: '' }
  }

  const providerPromises = [
    { name: 'downr', promise: downr(sourceUrl, { signal }) },
    { name: 'faa', promise: faaAio(sourceUrl, { signal }) },
  ].map((item, index) => ({
    index,
    name: item.name,
    promise: item.promise.then(value => ({ index, name: item.name, value }), error => ({ index, name: item.name, error })),
  }))

  const pending = [...providerPromises]
  let lastError = new Error('Tidak ada provider AIO yang mengembalikan media.')

  while (pending.length) {
    const result = await Promise.race(pending.map(item => item.promise))
    const position = pending.findIndex(item => item.index === result.index)
    if (position >= 0) pending.splice(position, 1)

    if (result.error) {
      lastError = result.error
      continue
    }

    const candidates = normalizeCandidates(result.value.candidates || []).slice(0, 8)
    const validation = await Promise.all(candidates.map(candidate =>
      validateCandidate(candidate.url, { signal, timeoutMs: 3500 }).then(valid => ({ candidate, valid }))
    ))
    const ready = normalizeCandidates(validation
      .filter(item => item.valid)
      .map(item => ({ ...item.candidate, title: item.candidate.title || result.value.title || 'Universal Downloader' })))

    if (ready.length) {
      return { candidates: ready, title: result.value.title || ready[0].title || 'Universal Downloader' }
    }

    lastError = new Error(`Provider ${result.name} mengembalikan URL yang tidak dapat diverifikasi.`)
  }

  throw lastError
}

export async function resolveAio(url) {
  const result = await resolveAioCandidates(url)
  const best = result.candidates[0]
  return {
    url: best.url,
    type: best.type,
    mimeType: best.mimeType || '',
    fileName: best.fileName || '',
    title: result.title || best.title || 'Universal Downloader',
    candidates: result.candidates,
  }
}

function extensionFor(candidate, fallbackType = 'video') {
  const ext = String(candidate?.ext || candidate?.fileName || candidate?.url || '').match(/\.([a-z0-9]{2,6})(?:[?#]|$)/i)?.[1]?.toLowerCase()
  if (ext) return ext
  if (candidate?.type === 'image') return 'jpg'
  if (candidate?.type === 'audio') return 'mp3'
  if (fallbackType === 'document') return 'bin'
  return 'mp4'
}

async function sendAioCandidate(conn, m, candidate, title = '') {
  const type = ['image', 'video', 'audio'].includes(candidate?.type) ? candidate.type : mediaTypeFromUrl(candidate?.url) || 'video'
  const ext = extensionFor(candidate, type)
  const fileName = candidate?.fileName || `aio.${ext}`
  return sendRemoteMedia(conn, m, candidate.url, {
    caption: title ? `🎬 ${title}` : '🎬 AIO Downloader',
    fallbackType: type,
    maxBytes: AIO_MAX_BYTES,
    fileName,
    mimeType: candidate?.mimeType || '',
    probe: false,
    preferDirect: true,
    timeoutMs: 30000,
  })
}

async function sendAioYtDlpFallback(conn, m, input, title = '') {
  let file = null
  try {
    file = await ytDlpDownloadBest(input, AIO_MAX_BYTES, { prefix: 'usanagi-aio' })
    await sendLocalMediaFast(conn, m, file, {
      type: 'video',
      mimeType: 'video/mp4',
      fileName: 'aio.mp4',
      caption: title ? `🎬 ${title}` : '🎬 AIO Downloader',
      maxBytes: AIO_MAX_BYTES,
      forceDocument: false,
    })
    file = null
    return true
  } finally {
    if (file) {
      try {
        const fs = await import('fs-extra')
        await fs.remove(file).catch(() => {})
      } catch {}
    }
  }
}

const handler = async (m, { conn, usedPrefix }) => {
  const commandName = String(m.command || 'aio').trim() || 'aio'
  let input = String(m.text || '').trim()

  if (!input && m.quoted) input = String(m.quoted.text || m.quoted.caption || '').trim()
  if (!input) {
    m.limit?.fail()
    return m.reply([
      'Cara penggunaan:',
      `${usedPrefix}${commandName} <url>`,
      '',
      'Contoh:',
      `${usedPrefix}${commandName} https://example.com/...`,
      '',
      'Mendukung link yang dapat diproses oleh layanan AIO.',
    ].join('\n'))
  }

  const urlMatch = input.match(/https?:\/\/[^\s<>"']+/i)
  input = (urlMatch?.[0] || input).replace(/[),.!?]+$/, '')
  if (!isHttpUrl(input)) {
    m.limit?.fail()
    return m.reply('❌ URL tidak valid. Masukkan link yang diawali http:// atau https://.')
  }

  void conn.sendMessage(m.chat, { react: { text: '⏳', key: m.raw.key } }).catch(() => {})

  try {
    let resolvedError = null
    try {
      const resolved = await resolveAioCandidates(input)
      for (const candidate of resolved.candidates.slice(0, 8)) {
        try {
          await sendAioCandidate(conn, m, candidate, resolved.title)
          m.limit?.success()
          void conn.sendMessage(m.chat, { react: { text: '✅', key: m.raw.key } }).catch(() => {})
          return
        } catch (error) {
          resolvedError = error
        }
      }
    } catch (error) {
      resolvedError = error
    }

    try {
      const ok = await sendAioYtDlpFallback(conn, m, input)
      if (ok) {
        m.limit?.success()
        void conn.sendMessage(m.chat, { react: { text: '✅', key: m.raw.key } }).catch(() => {})
        return
      }
    } catch (error) {
      resolvedError = error || resolvedError
    }

    throw resolvedError || new Error('Media AIO tidak dapat dikirim.')
  } catch (error) {
    m.limit?.fail()
    void conn.sendMessage(m.chat, { react: { text: '❌', key: m.raw.key } }).catch(() => {})
    console.warn('[USANAGI UMI AIO]', String(error?.message || error).slice(0, 240))
    return m.reply('❌ Gagal memproses link dengan AIO. Pastikan link masih aktif lalu coba lagi.')
  }
}

handler.command = /^(aio|aio2|downr)$/i
handler.help = ['aio', 'aio2', 'downr']
handler.tags = ['download']
handler.category = 'download'
handler.description = 'Universal downloader dari AIO/Downr'
handler.limit = true
handler.limitCommit = 'manual'

export default handler
