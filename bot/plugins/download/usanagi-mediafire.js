/* By AlzRiss - Usanagi Umi AI */

import fs from 'fs-extra'
import os from 'node:os'
import path from 'node:path'
import { sendRemoteMediaFast, sendLocalMediaFast } from '../../lib/awang-media-transfer.js'
import { runYtDlp, ytdlpTempBase } from '../../lib/awang-ytdlp.js'

const DEFAULT_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0'
const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024 * 1024
const DOWNLOAD_HOST_RE = /^download\d*\.mediafire\.com$/i
const MEDIAFIRE_HOST_RE = /(?:^|\.)mediafire\.com$/i
const LINK_KEYS = new Set(['direct_download', 'normal_download', 'download', 'download_url', 'downloadUrl', 'directurl', 'direct_url', 'download_link', 'downloadLink'])
const MEDIAFIRE_CACHE_TTL = Number(process.env.USANAGI_MEDIAFIRE_CACHE_TTL_MS) || 180000
const MEDIAFIRE_CACHE = new Map()
const MIME_BY_EXT = {
  zip: 'application/zip',
  rar: 'application/vnd.rar',
  '7z': 'application/x-7z-compressed',
  apk: 'application/vnd.android.package-archive',
  pdf: 'application/pdf',
  txt: 'text/plain',
  json: 'application/json',
  js: 'text/javascript',
  mp4: 'video/mp4',
  mkv: 'video/x-matroska',
  webm: 'video/webm',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  wav: 'audio/wav',
  flac: 'audio/flac',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
}

function isHttpUrl(value) {
  try {
    const url = new URL(String(value || '').trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function isMediafireHost(value) {
  try {
    return MEDIAFIRE_HOST_RE.test(new URL(value).hostname.toLowerCase())
  } catch {
    return false
  }
}

function isDownloadHost(value) {
  try {
    return DOWNLOAD_HOST_RE.test(new URL(value).hostname.toLowerCase())
  } catch {
    return false
  }
}

function sanitizeFilename(value, fallback = 'mediafire') {
  return String(value || fallback)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 150) || fallback
}

function cleanHtmlText(value = '') {
  return String(value || '')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\\u002F/gi, '/')
    .replace(/\\u003A/gi, ':')
    .replace(/\\u0026/gi, '&')
    .replace(/\\\//g, '/')
    .trim()
}

function normalizeUrl(value, baseUrl = 'https://www.mediafire.com/') {
  try {
    let raw = cleanHtmlText(String(value || '').trim()).replace(/^['"]|['"]$/g, '')
    if (!raw) return ''
    try { raw = decodeURIComponent(raw) } catch {}
    const url = new URL(raw, baseUrl)
    if (!/^https?:$/i.test(url.protocol)) return ''
    return url.href
  } catch {
    return ''
  }
}

function normalizeDownloadCandidate(value, baseUrl = 'https://www.mediafire.com/', allowKnownContext = false) {
  const normalized = normalizeUrl(value, baseUrl)
  if (!normalized || !isHttpUrl(normalized)) return ''
  if (!isMediafireHost(normalized)) return ''
  if (isDownloadHost(normalized)) return normalized
  if (allowKnownContext) return normalized
  return ''
}

function decodeScrambledUrl(value) {
  const raw = cleanHtmlText(String(value || '').trim())
  if (!raw) return ''
  const decodedVariants = [raw, raw.replace(/-/g, '+').replace(/_/g, '/'), raw.replace(/ /g, '+')]
  for (const source of decodedVariants) {
    try {
      const padded = source + '='.repeat((4 - (source.length % 4)) % 4)
      const decoded = Buffer.from(padded, 'base64').toString('utf8').trim()
      const candidate = decodeURIComponent(decoded.replace(/\\x([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16))))
      if (/^https?:\/\//i.test(candidate)) return candidate
    } catch {}
  }
  return ''
}

function decodeJsonEscapes(value) {
  return cleanHtmlText(String(value || ''))
    .replace(/\\r/g, '\r')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\"/g, '"')
}

function extractContentDispositionFilename(value = '') {
  const raw = String(value || '')
  const utf = raw.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)?.[1]
  if (utf) {
    try {
      return sanitizeFilename(decodeURIComponent(utf))
    } catch {}
  }
  const plain = raw.match(/filename\s*=\s*"([^"]+)"/i)?.[1] || raw.match(/filename\s*=\s*([^;]+)/i)?.[1]
  return plain ? sanitizeFilename(plain) : ''
}

function extractFilenameFromUrl(value = '') {
  try {
    const url = new URL(value)
    const segments = url.pathname.split('/').filter(Boolean)
    const last = segments.at(-1) || ''
    if (!last || /^file(?:_premium)?$/i.test(last) || /^download\d*$/i.test(last)) return ''
    return sanitizeFilename(decodeURIComponent(last))
  } catch {
    return ''
  }
}

function extractHtmlFilename(html = '', input = '') {
  const raw = String(html || '')
  const matches = []
  const push = value => {
    const clean = cleanHtmlText(value)
    if (!clean) return
    if (/^(mediafire|usanagi umi ai|usanagi)$/i.test(clean)) return
    if (clean.length > 180) return
    if (!matches.includes(clean)) matches.push(clean)
  }
  for (const match of raw.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0]
    const property = tag.match(/\b(?:property|name)\s*=\s*["'](?:og:title|twitter:title)["']/i)
    if (property) push(tag.match(/\bcontent\s*=\s*["']([^"']+)["']/i)?.[1])
  }
  push(raw.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1])
  for (const match of raw.matchAll(/\b(?:filename|file_name|fileName)\s*[=:]\s*["']([^"']+)["']/gi)) push(match[1])
  const urlName = extractFilenameFromUrl(input)
  if (urlName && !/^file(?:_premium)?$/i.test(urlName)) push(urlName)
  return matches[0] || ''
}

function extractDirectCandidatesFromHtml(html = '', baseUrl = '') {
  const raw = String(html || '')
    .replace(/\u002F/gi, '/')
    .replace(/\u003A/gi, ':')
    .replace(/\u0026/gi, '&')
    .replace(/\\\//g, '/')
  const output = []
  const push = (value, known = false) => {
    const normalized = normalizeDownloadCandidate(value, baseUrl, known)
    if (normalized && !output.includes(normalized)) output.push(normalized)
  }

  for (const match of raw.matchAll(/<(?:a|button)\b[^>]*\bid\s*=\s*[\"']downloadButton[\"'][^>]*>/gi)) {
    const tag = match[0]
    const href = tag.match(/\bhref\s*=\s*[\"']([^\"']+)[\"']/i)?.[1]
    const data = tag.match(/\bdata-scrambled-url\s*=\s*[\"']([^\"']+)[\"']/i)?.[1]
    if (href) push(href, true)
    if (data) push(decodeScrambledUrl(data), true)
  }
  for (const match of raw.matchAll(/<(?:a|button)\b[^>]*\bhref\s*=\s*[\"']([^\"']+)[\"'][^>]*\bid\s*=\s*[\"']downloadButton[\"'][^>]*>/gi)) push(match[1], true)
  for (const match of raw.matchAll(/<(?:a|button)\b[^>]*\baria-label\s*=\s*[\"']Download file[\"'][^>]*>/gi)) {
    const href = match[0].match(/\bhref\s*=\s*[\"']([^\"']+)[\"']/i)?.[1]
    const data = match[0].match(/\bdata-scrambled-url\s*=\s*[\"']([^\"']+)[\"']/i)?.[1]
    if (href) push(href, true)
    if (data) push(decodeScrambledUrl(data), true)
  }
  for (const match of raw.matchAll(/<(?:a|button)\b[^>]*(?:data-testid|data-test-id)\s*=\s*[\"']download(?:-button)?[\"'][^>]*>/gi)) {
    const href = match[0].match(/\bhref\s*=\s*[\"']([^\"']+)[\"']/i)?.[1]
    const data = match[0].match(/\bdata-scrambled-url\s*=\s*[\"']([^\"']+)[\"']/i)?.[1]
    if (href) push(href, true)
    if (data) push(decodeScrambledUrl(data), true)
  }
  for (const match of raw.matchAll(/<(?:a|button)\b[^>]*\bclass\s*=\s*[\"'][^\"']*(?:download-btn|downloadButton|download-button)[^\"']*[\"'][^>]*>/gi)) {
    const href = match[0].match(/\bhref\s*=\s*[\"']([^\"']+)[\"']/i)?.[1]
    if (href) push(href, true)
  }
  for (const match of raw.matchAll(/<a\b[^>]*\bhref\s*=\s*[\"']([^\"']+)[\"'][^>]*>[^<]{0,120}\bdownload(?:\s+file)?\b[^<]{0,120}<\/a>/gi)) push(match[1], true)
  for (const match of raw.matchAll(/(?:window\.location|location|location\.href|window\.open)\s*(?:=|\()\s*[\"']([^\"']*(?:download|mediafire)[^\"']*)[\"']/gi)) push(match[1], true)
  for (const match of raw.matchAll(/\bkNO\s*=\s*[\"']([^\"']+)[\"']/gi)) push(match[1], true)
  for (const match of raw.matchAll(/\bdata-scrambled-url\s*=\s*[\"']([^\"']+)[\"']/gi)) push(decodeScrambledUrl(match[1]), true)
  for (const match of raw.matchAll(/\b(?:direct_download|normal_download|download_url|downloadUrl|directurl|direct_url|download_link|downloadLink|file_url|fileUrl)\s*[=:]\s*[\"']([^\"']+)[\"']/gi)) push(decodeJsonEscapes(match[1]), true)
  for (const match of raw.matchAll(/https?:\/\/download\d*\.mediafire\.com[^\s\"'<>\\]+/gi)) push(match[0], true)
  for (const regex of [
    /[\"'](?:direct_download|normal_download|download_url|downloadUrl|directurl|direct_url)[\"']\s*:\s*[\"']((?:https?:)?\\?\/\\?\/[^\"']+)[\"']/gi,
    /[\"'](?:url|href)[\"']\s*:\s*[\"']((?:https?:)?\\?\/\\?\/download\d*\.mediafire\.com[^\"']+)[\"']/gi,
  ]) {
    for (const match of raw.matchAll(regex)) push(match[1], true)
  }

  return [...new Set(output)]
}

function extractApiCandidates(value, output = [], keyName = '') {
  if (value == null) return output
  if (typeof value === 'string') {
    const key = String(keyName || '')
    const known = LINK_KEYS.has(key) || /download/i.test(key)
    const normalized = normalizeDownloadCandidate(value, 'https://www.mediafire.com/', known)
    if (normalized && !output.includes(normalized)) output.push(normalized)
    return output
  }
  if (Array.isArray(value)) {
    for (const item of value) extractApiCandidates(item, output, keyName)
    return output
  }
  if (typeof value !== 'object') return output
  for (const [key, item] of Object.entries(value)) extractApiCandidates(item, output, key)
  return output
}

function parseSize(value) {
  if (value == null) return 0
  if (typeof value === 'number') return Number.isFinite(value) && value > 0 ? Math.round(value) : 0
  const raw = String(value).trim().replace(/,/g, '')
  if (!raw) return 0
  if (/^\d+(?:\.\d+)?$/.test(raw)) return Math.round(Number(raw))
  const match = raw.match(/(\d+(?:\.\d+)?)\s*(bytes?|kb|kib|mb|mib|gb|gib|tb|tib)/i)
  if (!match) return 0
  const amount = Number(match[1])
  const unit = match[2].toLowerCase()
  const multiplier = {
    byte: 1, bytes: 1,
    kb: 1024, kib: 1024,
    mb: 1024 ** 2, mib: 1024 ** 2,
    gb: 1024 ** 3, gib: 1024 ** 3,
    tb: 1024 ** 4, tib: 1024 ** 4,
  }[unit] || 0
  return Number.isFinite(amount) && multiplier ? Math.round(amount * multiplier) : 0
}

function totalSizeFromResponse(response) {
  const range = String(response?.headers?.get('content-range') || '')
  const match = range.match(/^bytes\s+\d+-\d+\/(\d+)$/i)
  if (match?.[1]) return parseSize(match[1])
  if (response?.status === 200) return parseSize(response?.headers?.get('content-length') || 0)
  return 0
}

function isHtmlContent(contentType = '', chunk = null) {
  const type = String(contentType || '').toLowerCase()
  if (type.includes('text/html') || type.includes('application/xhtml')) return true
  if (!chunk) return false
  const sample = Buffer.from(chunk).subarray(0, 4096).toString('utf8').replace(/^\uFEFF/, '').trimStart().toLowerCase()
  return sample.startsWith('<!doctype html') || sample.startsWith('<html') || sample.startsWith('<head') || sample.startsWith('<body') || sample.includes('<html')
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      ...options,
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('Permintaan MediaFire timeout.')
    throw error
  } finally {
    clearTimeout(timer)
  }
}

async function readLimitedText(response, limit = 1024 * 1024) {
  if (!response.body) return ''
  const reader = response.body.getReader()
  const chunks = []
  let total = 0
  try {
    while (total < limit) {
      const { value, done } = await reader.read()
      if (done) break
      const chunk = Buffer.from(value || [])
      if (!chunk.length) continue
      const take = Math.min(chunk.length, limit - total)
      chunks.push(chunk.subarray(0, take))
      total += take
      if (total >= limit) break
    }
  } finally {
    await reader.cancel().catch(() => {})
  }
  return Buffer.concat(chunks, total).toString('utf8')
}

async function readSample(response, limit = 32768) {
  if (!response.body) return Buffer.alloc(0)
  const reader = response.body.getReader()
  const chunks = []
  let total = 0
  try {
    while (total < limit) {
      const { value, done } = await reader.read()
      if (done) break
      const chunk = Buffer.from(value || [])
      if (!chunk.length) continue
      const take = Math.min(chunk.length, limit - total)
      chunks.push(chunk.subarray(0, take))
      total += take
      if (total >= limit) break
    }
  } finally {
    await reader.cancel().catch(() => {})
  }
  return Buffer.concat(chunks, total)
}

function extractSetCookies(response) {
  try {
    const values = response.headers.getSetCookie?.() || []
    return values.map(item => String(item).split(';')[0]).filter(Boolean).join('; ')
  } catch {
    return ''
  }
}

async function getPage(input) {
  const headers = {
    'User-Agent': DEFAULT_UA,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    Referer: 'https://www.mediafire.com/',
    'Accept-Encoding': 'gzip, deflate, br',
  }
  const response = await fetchWithTimeout(input, { headers }, 12000)
  const contentType = String(response.headers.get('content-type') || '').toLowerCase()
  const finalUrl = String(response.url || input)
  if (!response.ok) throw new Error(`MediaFire HTTP ${response.status}`)
  if (!isHtmlContent(contentType)) {
    const direct = (isDownloadHost(finalUrl) || response.headers.has('content-disposition')) ? normalizeDownloadCandidate(finalUrl, input, true) : ''
    if (direct) {
      return { html: '', candidates: [direct], finalUrl, cookie: extractSetCookies(response), filename: extractContentDispositionFilename(response.headers.get('content-disposition') || '') }
    }
  }
  const html = await response.text()
  return {
    html,
    candidates: extractDirectCandidatesFromHtml(html, finalUrl),
    finalUrl,
    cookie: extractSetCookies(response),
    filename: extractHtmlFilename(html, input),
  }
}

function extractQuickKey(input) {
  try {
    const url = new URL(String(input || '').trim())
    const direct = url.searchParams.get('quick_key') || url.searchParams.get('quickkey') || url.searchParams.get('key')
    if (direct && /^[A-Za-z0-9_-]{11,20}$/.test(direct)) return direct
    const parts = url.pathname.split('/').filter(Boolean)
    const typeIndex = parts.findIndex(item => /^(file|file_premium|view|download)$/i.test(item))
    const key = typeIndex >= 0 ? parts[typeIndex + 1] : ''
    return /^[A-Za-z0-9_-]{11,20}$/.test(key) ? key : ''
  } catch {
    return ''
  }
}

function canonicalPage(key) {
  return `https://www.mediafire.com/file/${encodeURIComponent(key)}/`
}

async function getApiJson(url, { method = 'GET', body = '' } = {}) {
  const headers = {
    'User-Agent': DEFAULT_UA,
    Accept: 'application/json,text/plain,*/*',
    Referer: 'https://www.mediafire.com/',
    ...(method === 'POST' ? { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } : {}),
  }
  const response = await fetchWithTimeout(url, { method, headers, ...(body ? { body } : {}) }, 10000)
  if (!response.ok) throw new Error(`MediaFire API HTTP ${response.status}`)
  const text = await response.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error('Response MediaFire API tidak valid.')
  }
  const result = json?.response?.result
  if (result && result !== 'Success') throw new Error(json?.response?.message || 'MediaFire API menolak permintaan.')
  return json
}

async function getApiData(key) {
  const baseParams = `quick_key=${encodeURIComponent(key)}&response_format=json`
  const primaryInfo = `https://www.mediafire.com/api/1.5/file/get_info.php?${baseParams}`
  const primaryDirect = `https://www.mediafire.com/api/1.5/file/get_links.php?${baseParams}&link_type=direct_download`
  const primaryNormal = `https://www.mediafire.com/api/1.5/file/get_links.php?${baseParams}&link_type=normal_download`

  const primary = await Promise.allSettled([
    getApiJson(primaryInfo),
    getApiJson(primaryDirect),
    getApiJson(primaryNormal),
  ])

  let info = primary[0]?.status === 'fulfilled' ? primary[0].value?.response?.file_info || {} : {}
  const candidates = []
  for (const result of primary.slice(1)) {
    if (result.status === 'fulfilled') extractApiCandidates(result.value, candidates)
  }

  if (!candidates.length) {
    const legacyBase = `https://www.mediafire.com/api/file/get_links.php?${baseParams}`
    const legacy = await Promise.allSettled([
      getApiJson(`${legacyBase}&link_type=direct_download`),
      getApiJson(`${legacyBase}&link_type=normal_download`),
    ])
    for (const result of legacy) {
      if (result.status === 'fulfilled') extractApiCandidates(result.value, candidates)
    }
  }

  if (!Object.keys(info).length) {
    try {
      const legacyInfo = await getApiJson(`https://www.mediafire.com/api/file/get_info.php?${baseParams}`)
      info = legacyInfo?.response?.file_info || {}
    } catch {}
  }

  return { info, candidates: [...new Set(candidates)] }
}

async function inspectCandidate(candidate, headers = {}) {
  const response = await fetchWithTimeout(candidate, {
    method: 'GET',
    headers: {
      'User-Agent': DEFAULT_UA,
      Accept: '*/*',
      'Accept-Encoding': 'identity',
      Range: 'bytes=0-32767',
      ...headers,
    },
  }, 9000)
  const contentType = String(response.headers.get('content-type') || '').toLowerCase()
  const firstChunk = await readSample(response)
  if (!response.ok) throw new Error(`MediaFire download HTTP ${response.status}`)
  if (isHtmlContent(contentType, firstChunk)) {
    const html = firstChunk.length < 1024 * 1024 ? firstChunk.toString('utf8') : ''
    const discovered = html ? extractDirectCandidatesFromHtml(html, response.url || candidate) : []
    return { valid: false, discovered }
  }
  const finalUrl = normalizeDownloadCandidate(response.url || candidate, candidate, true)
  if (!finalUrl) throw new Error('URL direct MediaFire tidak valid.')
  return {
    valid: true,
    url: finalUrl,
    contentType,
    size: totalSizeFromResponse(response),
    fileName: extractContentDispositionFilename(response.headers.get('content-disposition') || ''),
  }
}

function filenameFromInfo(info = {}) {
  const value = sanitizeFilename(info?.filename || '')
  if (!value || /^(usanagi umi ai|usanagi|mediafire|download)$/i.test(value)) return ''
  if (value.length > 180) return ''
  return value
}

function extensionOf(name = '') {
  const ext = String(name || '').toLowerCase().match(/\.([a-z0-9]{1,12})$/)?.[1]
  return ext || ''
}

function preferredFilename({ info, candidateFilename, pageFilename, finalUrl }) {
  const values = [candidateFilename, pageFilename, filenameFromInfo(info), extractFilenameFromUrl(finalUrl)]
  for (const value of values) {
    const clean = sanitizeFilename(value, '')
    if (!clean) continue
    if (/^(usanagi umi ai|usanagi|mediafire|download)$/i.test(clean)) continue
    if (/\.(?:png|jpe?g|gif|webp)$/i.test(clean) && /\.zip(?:$|[?#])/i.test(finalUrl)) continue
    return clean
  }
  return 'mediafire-file'
}

function preferredMime({ contentType, filename, info, finalUrl }) {
  const directType = String(contentType || '').split(';')[0].trim().toLowerCase()
  if (directType && directType !== 'application/octet-stream' && !directType.startsWith('text/html')) return directType
  const ext = extensionOf(filename) || extensionOf(extractFilenameFromUrl(finalUrl))
  if (ext && MIME_BY_EXT[ext]) return MIME_BY_EXT[ext]
  const apiMime = String(info?.mimetype || '').split(';')[0].trim().toLowerCase()
  if (apiMime && apiMime !== 'application/octet-stream' && !apiMime.startsWith('image/') && !apiMime.startsWith('text/html')) return apiMime
  return 'application/octet-stream'
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '-'
  const units = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / (1024 ** index)).toFixed(index ? 2 : 0)} ${units[index]}`
}

async function resolveMediafire(input) {
  const key = extractQuickKey(input)
  if (!key) throw new Error('Gunakan link file MediaFire yang valid.')

  const cached = MEDIAFIRE_CACHE.get(key)
  if (cached && Date.now() - cached.time < MEDIAFIRE_CACHE_TTL) return { ...cached.data, cached: true }
  MEDIAFIRE_CACHE.delete(key)

  const parsedInput = new URL(input)
  const inputParts = parsedInput.pathname.split('/').filter(Boolean)
  const inputFileName = inputParts.find((part, index) => index > 0 && /\.(?:zip|rar|7z|apk|pdf|mp4|mp3|jpg|jpeg|png|webp|txt|json|docx|xlsx|pptx)$/i.test(part)) || ''
  const legacyDownload = inputFileName
    ? `https://www.mediafire.com/download/${encodeURIComponent(key)}/${encodeURIComponent(inputFileName)}`
    : `https://www.mediafire.com/download/${encodeURIComponent(key)}`
  const pages = [...new Set([input, canonicalPage(key), `${canonicalPage(key)}?download=1`, legacyDownload])]
  const pageResults = await Promise.allSettled(pages.map(url => getPage(url)))
  const pageData = pageResults.filter(item => item.status === 'fulfilled').map(item => item.value)
  const pageCandidates = [...new Set(pageData.flatMap(item => item.candidates || []))]
  const pageCookies = pageData.map(item => item.cookie).find(Boolean) || ''
  const pageFilename = pageData.map(item => item.filename).find(Boolean) || ''
  const pageReferer = pageData.map(item => item.finalUrl).find(Boolean) || input
  const headers = {
    Referer: pageReferer,
    ...(pageCookies ? { Cookie: pageCookies } : {}),
  }

  const verifyCandidates = async candidates => {
    const verified = []
    const discovered = []
    const results = await Promise.allSettled(candidates.slice(0, 16).map(item => inspectCandidate(item, headers)))
    for (const result of results) {
      if (result.status !== 'fulfilled') continue
      if (result.value.valid && result.value.url && !verified.some(item => item.url === result.value.url)) verified.push(result.value)
      for (const url of result.value.discovered || []) if (!discovered.includes(url)) discovered.push(url)
    }
    if (!verified.length && discovered.length) {
      const second = await Promise.allSettled(discovered.slice(0, 12).map(item => inspectCandidate(item, headers)))
      for (const result of second) {
        if (result.status !== 'fulfilled') continue
        if (result.value.valid && result.value.url && !verified.some(item => item.url === result.value.url)) verified.push(result.value)
      }
    }
    return verified
  }

  let verified = pageCandidates.length ? await verifyCandidates(pageCandidates) : []
  let info = {}
  let allCandidates = pageCandidates

  if (!verified.length) {
    const api = await getApiData(key)
    info = api.info || {}
    allCandidates = [...new Set([...pageCandidates, ...(api.candidates || [])])]
      .filter(value => isDownloadHost(value) || /\/download(?:\?|\/|$)/i.test(new URL(value).pathname))
    const apiCandidates = allCandidates.filter(item => !pageCandidates.includes(item))
    verified = await verifyCandidates(apiCandidates.length ? apiCandidates : allCandidates)
  }

  if (!verified.length) throw new Error('Direct download MediaFire tidak dapat diverifikasi.')

  verified.sort((a, b) => {
    const aDownload = isDownloadHost(a.url) ? 0 : 1
    const bDownload = isDownloadHost(b.url) ? 0 : 1
    if (aDownload !== bDownload) return aDownload - bDownload
    const aSize = a.size > 0 ? 0 : 1
    const bSize = b.size > 0 ? 0 : 1
    return aSize - bSize
  })

  const best = verified[0]
  const filename = preferredFilename({
    info,
    candidateFilename: best.fileName,
    pageFilename,
    finalUrl: best.url,
  })
  const mimetype = preferredMime({
    contentType: best.contentType,
    filename,
    info,
    finalUrl: best.url,
  })
  const size = best.size > 0 ? best.size : 0

  const data = {
    key,
    filename,
    mimetype,
    filetype: extensionOf(filename) || extensionOf(extractFilenameFromUrl(best.url)) || 'bin',
    size,
    candidate: best.url,
    cookie: pageCookies,
    info,
  }
  MEDIAFIRE_CACHE.set(key, { time: Date.now(), data })
  return data
}

async function downloadMediafireWithYtDlp(input) {
  const base = ytdlpTempBase('usanagi-mediafire')
  try {
    await runYtDlp([
      input,
      '--no-playlist',
      '--retries', '6',
      '--fragment-retries', '6',
      '--extractor-retries', '3',
      '--file-access-retries', '3',
      '--socket-timeout', '25',
      '--max-filesize', '2G',
      '--no-warnings',
      '--quiet',
      '-o', `${base}.%(ext)s`,
    ], 180000)

    const entries = await fs.readdir(os.tmpdir())
    const matches = []
    for (const entry of entries) {
      if (!entry.startsWith(path.basename(base)) || entry.endsWith('.part')) continue
      const file = path.join(os.tmpdir(), entry)
      const stat = await fs.stat(file).catch(() => null)
      if (stat?.isFile() && stat.size > 0 && stat.size <= MAX_DOCUMENT_BYTES) matches.push({ file, size: stat.size })
    }
    matches.sort((a, b) => b.size - a.size)
    if (!matches[0]) throw new Error('yt-dlp tidak menghasilkan file MediaFire.')
    return matches[0].file
  } catch (error) {
    const entries = await fs.readdir(os.tmpdir()).catch(() => [])
    await Promise.all(entries.filter(entry => entry.startsWith(path.basename(base))).map(entry => fs.remove(path.join(os.tmpdir(), entry)).catch(() => {})))
    throw error
  }
}

const handler = async (m, { conn, usedPrefix }) => {
  const commandName = String(m.command || 'mediafire').trim() || 'mediafire'
  const input = String(m.text || '').trim()

  if (!input) {
    m.limit?.fail()
    return m.reply([
      'Cara penggunaan:',
      `${usedPrefix}${commandName} <url>`,
      '',
      'Contoh:',
      `${usedPrefix}${commandName} https://www.mediafire.com/file/xxxxx/...`,
    ].join('\n'))
  }

  if (!isHttpUrl(input) || !isMediafireHost(input)) {
    m.limit?.fail()
    return m.reply('❌ Link MediaFire tidak valid.')
  }

  void conn.sendMessage(m.chat, { react: { text: '⏳', key: m.raw.key } }).catch(() => {})

  let resolved = null
  let lastResolveError = null

  try {
    for (let attempt = 0; attempt < 2 && !resolved; attempt++) {
      try {
        resolved = await resolveMediafire(input)
      } catch (error) {
        lastResolveError = error
        MEDIAFIRE_CACHE.delete(extractQuickKey(input))
        if (attempt === 0) await new Promise(resolve => setTimeout(resolve, 150))
      }
    }

    if (resolved) {
      if (resolved.size > MAX_DOCUMENT_BYTES) throw new Error('Ukuran file MediaFire melebihi batas pengiriman.')

      const caption = [
        `📄 ${resolved.filename}`,
        `📦 Ukuran: ${formatBytes(resolved.size)}`,
        `🗂️ Tipe: ${resolved.filetype}`,
      ].join('\n')

      let sent = false
      let lastError = null
      const headers = {
        Referer: input,
        Accept: '*/*',
        'Accept-Encoding': 'identity',
        ...(resolved.cookie ? { Cookie: resolved.cookie } : {}),
      }

      for (let attempt = 0; attempt < 2 && !sent; attempt++) {
        try {
          await sendRemoteMediaFast(conn, m, resolved.candidate, {
            caption,
            maxBytes: MAX_DOCUMENT_BYTES,
            fileName: sanitizeFilename(resolved.filename, `mediafire.${resolved.filetype}`),
            mimeType: resolved.mimetype,
            headers,
            forceDocument: true,
            forceStream: attempt === 1,
            preferDirect: attempt === 0,
            probe: attempt === 1,
            timeoutMs: 180000,
            expectedBytes: attempt === 1 && resolved.size > 0 ? resolved.size : 0,
            verifyBeforeSend: attempt === 1,
          })
          sent = true
        } catch (error) {
          lastError = error
          if (attempt === 0) {
            MEDIAFIRE_CACHE.delete(resolved.key)
            resolved = await resolveMediafire(input).catch(resolveError => {
              lastResolveError = resolveError
              return null
            }) || resolved
            if (resolved.candidate === '' || !resolved.candidate) break
          }
        }
      }

      if (!sent && resolved) throw lastError || lastResolveError || new Error('File MediaFire tidak dapat dikirim.')

      if (sent) {
        m.limit?.success()
        void conn.sendMessage(m.chat, { react: { text: '✅', key: m.raw.key } }).catch(() => {})
        return
      }
    }

    const fallbackFile = await downloadMediafireWithYtDlp(input)
    try {
      const stat = await fs.stat(fallbackFile)
      await sendLocalMediaFast(conn, m, fallbackFile, {
        caption: '📄 MediaFire',
        type: 'document',
        mimeType: 'application/octet-stream',
        fileName: `mediafire-${Date.now()}${path.extname(fallbackFile).toLowerCase() || ''}`,
        forceDocument: true,
        maxBytes: MAX_DOCUMENT_BYTES,
      })
      if (!stat.size) throw new Error('File MediaFire kosong.')
    } finally {
      await fs.remove(fallbackFile).catch(() => {})
    }

    m.limit?.success()
    void conn.sendMessage(m.chat, { react: { text: '✅', key: m.raw.key } }).catch(() => {})
  } catch (error) {
    m.limit?.fail()
    void conn.sendMessage(m.chat, { react: { text: '❌', key: m.raw.key } }).catch(() => {})

    const message = String(error?.message || '').toLowerCase()
    if (message.includes('2 gb') || message.includes('melebihi batas pengiriman')) return m.reply('❌ File MediaFire melebihi batas 2 GB yang dapat dikirim WhatsApp.')
    if (message.includes('tidak ditemukan') || message.includes('file not found') || message.includes('404')) return m.reply('❌ File MediaFire tidak ditemukan atau sudah tidak tersedia.')
    if (message.includes('403') || message.includes('forbidden')) return m.reply('❌ Link MediaFire tidak dapat diakses saat ini. Coba lagi beberapa saat.')
    if (message.includes('timeout') || message.includes('batas waktu')) return m.reply('❌ Akses MediaFire terlalu lama. Coba lagi beberapa saat.')
    return m.reply('❌ Gagal mengambil file MediaFire. Pastikan link file masih aktif lalu coba lagi.')
  }
}

handler.command = /^(mediafire|mf)$/i
handler.help = ['mediafire', 'mf']
handler.tags = ['download']
handler.category = 'download'
handler.description = 'Download file dari MediaFire'
handler.limit = true
handler.limitCommit = 'manual'

export default handler
