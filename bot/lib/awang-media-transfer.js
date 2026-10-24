
import fs from 'fs-extra'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { Transform } from 'node:stream'
import { open as openFile } from 'node:fs/promises'
import { createReadStream } from 'node:fs'

const DEFAULT_UA = 'Mozilla/5.0 (Linux; Android 13; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36'
const INLINE_VIDEO_LIMIT = 100 * 1024 * 1024
const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024 * 1024

function isHttpUrl(value) {
  try {
    const url = new URL(String(value || '').trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function sanitizeFilename(value, fallback = 'usanagi') {
  return String(value || fallback)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100) || fallback
}

function mediaTypeFromContentType(contentType = '', url = '', fallback = 'document') {
  const type = String(contentType || '').split(';')[0].trim().toLowerCase()
  if (type.startsWith('image/')) return 'image'
  if (type.startsWith('video/')) return 'video'
  if (type.startsWith('audio/')) return 'audio'

  const clean = String(url || '').split('?')[0].toLowerCase()
  if (/\.(jpg|jpeg|png|webp|gif|bmp|avif)(?:$|\/)/i.test(clean)) return 'image'
  if (/\.(mp4|mkv|webm|mov|avi|m4v|3gp|flv)(?:$|\/)/i.test(clean)) return 'video'
  if (/\.(mp3|m4a|aac|ogg|opus|wav|flac)(?:$|\/)/i.test(clean)) return 'audio'
  return fallback
}

function fallbackMime(type, url = '') {
  const ext = String(url || '').split('?')[0].toLowerCase().match(/\.([a-z0-9]{2,5})$/i)?.[1] || ''
  const map = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif',
    mp4: 'video/mp4', mkv: 'video/x-matroska', webm: 'video/webm', mov: 'video/quicktime', avi: 'video/x-msvideo',
    mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', ogg: 'audio/ogg', opus: 'audio/ogg', wav: 'audio/wav',
    pdf: 'application/pdf', zip: 'application/zip', apk: 'application/vnd.android.package-archive',
  }
  if (map[ext]) return map[ext]
  if (type === 'image') return 'image/jpeg'
  if (type === 'video') return 'video/mp4'
  if (type === 'audio') return 'audio/mpeg'
  return 'application/octet-stream'
}

function looksLikeHtml(buffer) {
  if (!buffer?.length) return false
  const sample = Buffer.from(buffer).subarray(0, 2048).toString('utf8').replace(/^\uFEFF/, '').trimStart().toLowerCase()
  return sample.startsWith('<!doctype html') || sample.startsWith('<html') || sample.startsWith('<head') || sample.includes('<html')
}

function isHtmlResponse(response, firstChunk) {
  const type = String(response.headers.get('content-type') || '').toLowerCase()
  return type.includes('text/html') || type.includes('application/xhtml') || looksLikeHtml(firstChunk)
}

function createValidatedStream(response, { maxBytes = 0, expectedBytes = 0, expectedSha256 = '', expectedHash = '' } = {}) {
  const contentLength = Number(response.headers.get('content-length') || 0)
  const apiExpected = Number.isFinite(expectedBytes) && expectedBytes > 0 ? expectedBytes : 0
  const encoding = String(response.headers.get('content-encoding') || '').toLowerCase()
  const expected = contentLength || apiExpected
  let size = 0
  let inspected = false
  const targetHash = String(expectedHash || expectedSha256 || '').trim().toLowerCase()
  const hashAlgorithm = /^[a-f0-9]{32}$/.test(targetHash) ? 'md5' : /^[a-f0-9]{40}$/.test(targetHash) ? 'sha1' : /^[a-f0-9]{64}$/.test(targetHash) ? 'sha256' : ''
  const hash = hashAlgorithm ? crypto.createHash(hashAlgorithm) : null
  let hashDigest = ''

  const validator = new Transform({
    highWaterMark: 1024 * 1024,
    transform(chunk, encodingName, callback) {
      if (!inspected) {
        inspected = true
        if (isHtmlResponse(response, chunk)) return callback(new Error('Server mengembalikan halaman HTML, bukan file media.'))
      }
      size += chunk.length
      if (hash) hash.update(chunk)
      if (maxBytes && size > maxBytes) return callback(new Error('Ukuran file melebihi batas yang diizinkan.'))
      callback(null, chunk)
    },
    flush(callback) {
      if (contentLength && !encoding && size !== contentLength) return callback(new Error('Unduhan file tidak lengkap.'))
      if (apiExpected && !encoding && size !== apiExpected) return callback(new Error('Ukuran file tidak sesuai dengan data sumber.'))
      if (hash && !encoding && !hashDigest) hashDigest = hash.digest('hex')
      if (targetHash && hash && !encoding && hashDigest !== targetHash) return callback(new Error('Hash file tidak sesuai dengan data sumber.'))
      if (!size) return callback(new Error('File hasil unduhan kosong.'))
      callback()
    },
  })

  const stream = Readable.fromWeb(response.body).pipe(validator)
  stream.usanagiSize = () => size
  stream.usanagiHash = () => hashDigest
  return { stream, contentLength, apiExpected, encoding }
}

async function readFileSample(file, size = 65536) {
  const handle = await openFile(file, 'r')
  try {
    const buffer = Buffer.allocUnsafe(size)
    const { bytesRead } = await handle.read(buffer, 0, size, 0)
    return buffer.subarray(0, bytesRead)
  } finally {
    await handle.close().catch(() => {})
  }
}

function hasMagic(sample, signatures) {
  return signatures.some(signature => sample.subarray(0, signature.length).equals(signature))
}

async function validateDownloadedFile(file, fileName = '', mimeType = '') {
  const sample = await readFileSample(file)
  const name = String(fileName || '').toLowerCase()
  const mime = String(mimeType || '').toLowerCase()
  if (!sample.length || looksLikeHtml(sample)) throw new Error('File hasil unduhan tidak valid.')

  if (name.endsWith('.pdf') || mime === 'application/pdf') {
    if (!sample.subarray(0, 5).toString('ascii').startsWith('%PDF-')) throw new Error('File PDF tidak valid.')
    return
  }
  if (/\.(zip|apk|jar|docx|xlsx|pptx)$/i.test(name) || /zip|android\.package|openxmlformats/i.test(mime)) {
    if (!hasMagic(sample, [Buffer.from('PK\x03\x04', 'binary'), Buffer.from('PK\x05\x06', 'binary'), Buffer.from('PK\x07\x08', 'binary')])) throw new Error('Arsip ZIP tidak valid.')
    return
  }
  if (name.endsWith('.rar') || mime === 'application/vnd.rar') {
    if (!sample.subarray(0, 7).equals(Buffer.from('Rar!\x1A\x07\x00', 'binary')) && !sample.subarray(0, 8).equals(Buffer.from('Rar!\x1A\x07\x01\x00', 'binary'))) throw new Error('File RAR tidak valid.')
    return
  }
  if (name.endsWith('.7z') || mime === 'application/x-7z-compressed') {
    if (!sample.subarray(0, 6).equals(Buffer.from([0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C]))) throw new Error('File 7z tidak valid.')
    return
  }
  if (/\.(jpe?g)$/i.test(name) || mime.startsWith('image/jpeg')) {
    if (!hasMagic(sample, [Buffer.from([0xFF, 0xD8, 0xFF])])) throw new Error('File JPEG tidak valid.')
    return
  }
  if (name.endsWith('.png') || mime === 'image/png') {
    if (!sample.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) throw new Error('File PNG tidak valid.')
    return
  }
  if (name.endsWith('.gif') || mime === 'image/gif') {
    if (!/^(GIF87a|GIF89a)$/.test(sample.subarray(0, 6).toString('ascii'))) throw new Error('File GIF tidak valid.')
    return
  }
  if (name.endsWith('.webp') || mime === 'image/webp') {
    if (sample.length < 12 || sample.subarray(0, 4).toString('ascii') !== 'RIFF' || sample.subarray(8, 12).toString('ascii') !== 'WEBP') throw new Error('File WEBP tidak valid.')
    return
  }
  if (name.endsWith('.mp4') || mime === 'video/mp4') {
    const probe = sample.toString('latin1')
    if (!probe.includes('ftyp')) throw new Error('File MP4 tidak valid.')
    return
  }
  if (name.endsWith('.mp3') || mime === 'audio/mpeg') {
    const isId3 = sample.subarray(0, 3).toString('ascii') === 'ID3'
    const isFrame = sample.length >= 2 && sample[0] === 0xFF && (sample[1] & 0xE0) === 0xE0
    if (!isId3 && !isFrame) throw new Error('File MP3 tidak valid.')
  }
}

async function probeRemote(url, timeoutMs = 3500, headers = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': DEFAULT_UA,
        Accept: '*/*',
        'Accept-Encoding': 'identity',
        ...(headers || {}),
      },
      redirect: 'follow',
      signal: controller.signal,
    })
    return { ok: response.ok, type: String(response.headers.get('content-type') || '').toLowerCase(), size: Number(response.headers.get('content-length') || 0) }
  } catch {
    return { ok: false, type: '', size: 0 }
  } finally {
    clearTimeout(timer)
  }
}

async function downloadRemote(url, { maxBytes, headers = {}, prefix = 'usanagi-media', expectedBytes = 0, expectedSha256 = '', expectedHash = '' } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 120000)
  const base = path.join(os.tmpdir(), `${prefix}-${Date.now()}-${crypto.randomBytes(5).toString('hex')}`)
  const file = `${base}.bin`
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': DEFAULT_UA, Accept: '*/*', 'Accept-Encoding': 'identity', ...(headers || {}) },
      redirect: 'follow',
      signal: controller.signal,
    })
    if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`)

    const contentLength = Number(response.headers.get('content-length') || 0)
    const sourceExpected = Number.isFinite(expectedBytes) && expectedBytes > 0 ? expectedBytes : 0
    const declared = contentLength || sourceExpected
    if (declared && declared > maxBytes) throw new Error('Ukuran file melebihi batas yang diizinkan.')

    const validated = createValidatedStream(response, { maxBytes, expectedBytes: sourceExpected, expectedSha256, expectedHash })
    await pipeline(validated.stream, fs.createWriteStream(file, { highWaterMark: 1024 * 1024 }))
    const size = validated.stream.usanagiSize()
    const sha256 = validated.stream.usanagiHash?.() || ''
    if (!size) throw new Error('File hasil unduhan kosong.')
    if (sourceExpected && size !== sourceExpected) throw new Error('Ukuran file tidak sesuai dengan data sumber.')

    return { file, size, sha256, contentType: String(response.headers.get('content-type') || '').toLowerCase() }
  } catch (error) {
    await fs.remove(file).catch(() => {})
    if (error?.name === 'AbortError') throw new Error('Unduhan melebihi batas waktu.')
    throw error
  } finally {
    clearTimeout(timer)
  }
}

async function fetchRemoteStream(url, { maxBytes, headers = {}, timeoutMs = 120000, expectedBytes = 0 } = {}) {
  const controller = new AbortController()
  let timer = null
  let completed = false

  const clear = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': DEFAULT_UA,
        Accept: '*/*',
        'Accept-Encoding': 'identity',
        ...(headers || {}),
      },
      redirect: 'follow',
      signal: controller.signal,
    })

    if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`)

    const contentLength = Number(response.headers.get('content-length') || 0)
    const apiExpected = Number.isFinite(expectedBytes) && expectedBytes > 0 ? expectedBytes : 0
    const declared = contentLength || apiExpected
    if (declared && maxBytes && declared > maxBytes) throw new Error('Ukuran file melebihi batas yang diizinkan.')

    const validated = createValidatedStream(response, { maxBytes, expectedBytes: apiExpected })
    const stream = validated.stream
    timer = setTimeout(() => {
      controller.abort()
      stream.destroy(new Error('Unduhan melebihi batas waktu.'))
    }, timeoutMs)
    const cleanup = () => {
      if (!completed) {
        completed = true
        clear()
      }
    }
    stream.once('end', cleanup)
    stream.once('error', cleanup)
    stream.once('close', cleanup)

    return {
      stream,
      size: declared || 0,
      contentType: String(response.headers.get('content-type') || '').toLowerCase(),
      finalUrl: response.url || url,
    }
  } catch (error) {
    clear()
    if (error?.name === 'AbortError') throw new Error('Unduhan melebihi batas waktu.')
    throw error
  }
}

async function sendContent(conn, m, { source, type, mime, fileName, caption, size = 0, forceDocument = false }) {
  const safeName = sanitizeFilename(fileName, type === 'audio' ? 'usanagi.mp3' : type === 'video' ? 'usanagi.mp4' : 'usanagi')
  const asDocument = forceDocument || type === 'document' || (type === 'video' && size > INLINE_VIDEO_LIMIT)

  if (asDocument) {
    await conn.sendMessage(m.chat, { document: source, fileName: safeName, mimetype: mime || 'application/octet-stream', caption: caption || '' }, { quoted: m.raw })
    return 'document'
  }

  if (type === 'image') {
    await conn.sendMessage(m.chat, { image: source, caption: caption || '' }, { quoted: m.raw })
    return 'image'
  }

  if (type === 'audio') {
    await conn.sendMessage(m.chat, { audio: source, mimetype: mime || 'audio/mpeg', fileName: safeName, ptt: false }, { quoted: m.raw })
    return 'audio'
  }

  await conn.sendMessage(m.chat, { video: source, mimetype: mime || 'video/mp4', fileName: safeName, caption: caption || '' }, { quoted: m.raw })
  return 'video'
}

export async function sendRemoteMediaFast(conn, m, url, {
  caption = '',
  fallbackType = 'video',
  maxBytes = MAX_DOCUMENT_BYTES,
  fileName,
  mimeType = '',
  headers = {},
  forceDocument = false,
  probe = false,
  forceStream = false,
  timeoutMs = 120000,
  expectedBytes = 0,
  expectedSha256 = '',
  expectedHash = '',
  verifyBeforeSend = false,
  preferDirect = true,
  strictHeaders = false,
} = {}) {
  if (!isHttpUrl(url)) throw new Error('URL media tidak valid.')

  if (verifyBeforeSend) {
    let local = null
    try {
      local = await downloadRemote(url, { maxBytes, headers, prefix: 'usanagi-media-verified', expectedBytes, expectedSha256, expectedHash })
      await validateDownloadedFile(local.file, fileName, mimeType || local.contentType)
      const localType = mediaTypeFromContentType(local.contentType || mimeType, url, fallbackType)
      const localMime = mimeType || local.contentType || fallbackMime(localType, url)
      return await sendContent(conn, m, { source: { stream: createReadStream(local.file) }, type: localType, mime: localMime, fileName, caption, size: local.size, forceDocument })
    } finally {
      if (local?.file) await fs.remove(local.file).catch(() => {})
    }
  }

  const hasHeaders = Object.keys(headers || {}).length > 0
  const directType = mediaTypeFromContentType(mimeType, url, fallbackType)
  const directMime = mimeType || fallbackMime(directType, url)
  let directError = null

  if (preferDirect && !strictHeaders && !probe) {
    try {
      return await sendContent(conn, m, { source: { url }, type: directType, mime: directMime, fileName, caption, size: 0, forceDocument })
    } catch (error) {
      directError = error
    }
  }

  let remote = null
  try {
    if (probe) {
      const head = await probeRemote(url, Math.min(3500, timeoutMs), headers)
      const type = mediaTypeFromContentType(head.type || mimeType, url, fallbackType)
      const size = head.size || 0
      const mime = mimeType || head.type || fallbackMime(type, url)
      if (size && size > maxBytes) throw new Error('Ukuran file melebihi batas yang diizinkan.')
      if (!forceStream && !hasHeaders && preferDirect) return await sendContent(conn, m, { source: { url }, type, mime, fileName, caption, size, forceDocument })
    }

    remote = await fetchRemoteStream(url, { maxBytes, headers, timeoutMs, expectedBytes })
    const type = mediaTypeFromContentType(remote.contentType || mimeType, remote.finalUrl || url, fallbackType)
    const mime = mimeType || remote.contentType || fallbackMime(type, remote.finalUrl || url)
    return await sendContent(conn, m, { source: { stream: remote.stream }, type, mime, fileName, caption, size: remote.size, forceDocument })
  } catch (remoteError) {
    let local = null
    try {
      local = await downloadRemote(url, { maxBytes, headers, prefix: 'usanagi-media', expectedBytes })
      const localType = mediaTypeFromContentType(local.contentType || mimeType, url, fallbackType)
      const localMime = mimeType || local.contentType || fallbackMime(localType, url)
      return await sendContent(conn, m, { source: { stream: createReadStream(local.file) }, type: localType, mime: localMime, fileName, caption, size: local.size, forceDocument })
    } catch (fallbackError) {
      throw fallbackError || remoteError || directError
    } finally {
      if (local?.file) await fs.remove(local.file).catch(() => {})
    }
  } finally {
    if (remote?.stream?.destroyed === false) remote.stream.destroy()
  }
}

export async function sendLocalMediaFast(conn, m, file, {
  caption = '', type = 'video', mimeType = '', fileName, forceDocument = false, maxBytes = MAX_DOCUMENT_BYTES,
} = {}) {
  const stat = await fs.stat(file)
  if (!stat.size) throw new Error('File hasil download kosong.')
  if (stat.size > maxBytes) throw new Error('Ukuran file melebihi batas yang diizinkan.')

  try {
    return await sendContent(conn, m, { source: { stream: createReadStream(file) }, type, mime: mimeType || fallbackMime(type, file), fileName, caption, size: stat.size, forceDocument })
  } finally {
    await fs.remove(file).catch(() => {})
  }
}

export async function streamRemoteMedia(url, options = {}) {
  if (!isHttpUrl(url)) throw new Error('URL media tidak valid.')
  return fetchRemoteStream(url, options)
}

export const mediaTransferLimits = { inlineVideo: INLINE_VIDEO_LIMIT, maxDocument: MAX_DOCUMENT_BYTES }
