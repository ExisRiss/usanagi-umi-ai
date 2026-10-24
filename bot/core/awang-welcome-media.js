/* By AlzRiss - Usanagi Umi AI */

import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg'
import sharp from 'sharp'
import { downloadMediaMessage } from '@rexxhayanasi/elaina-baileys'

const execFileAsync = promisify(execFile)
const FFMPEG_BINARY = process.env.FFMPEG_PATH || ffmpegInstaller?.path || 'ffmpeg'
const FFPROBE_BINARY = process.env.FFPROBE_PATH || 'ffprobe'
const PROJECT_ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const MEDIA_ROOT = path.join(PROJECT_ROOT, 'data', 'database', 'group-welcome-media')
const MAX_IMAGE_SIZE = 12 * 1024 * 1024
const MAX_VIDEO_SIZE = 25 * 1024 * 1024
const MIN_VIDEO_SECONDS = 5
const MAX_VIDEO_SECONDS = 10
const MEDIA_FILE_PATTERN = /^[a-z0-9_-]+\.(?:jpg|jpeg|png|webp|mp4)$/i
const mediaIntegrityCache = new Map()

function asString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function unwrapMessage(message) {
  let current = message || {}
  for (let i = 0; i < 10; i++) {
    const next =
      current?.ephemeralMessage?.message ||
      current?.viewOnceMessage?.message ||
      current?.viewOnceMessageV2?.message ||
      current?.viewOnceMessageV2Extension?.message ||
      current?.documentWithCaptionMessage?.message
    if (!next || next === current) break
    current = next
  }
  return current || {}
}

function mediaCandidateFromMessage(message) {
  const container = message?.message && typeof message.message === 'object' ? message.message : message
  const content = unwrapMessage(container)

  if (content?.imageMessage) {
    const media = content.imageMessage
    return {
      kind: media?.mimetype === 'image/gif' ? 'gif-image' : 'image',
      message: media,
      sourceType: 'image',
      mimetype: asString(media?.mimetype) || 'image/jpeg',
      fileLength: Number(media?.fileLength || 0),
      seconds: Number(media?.seconds || 0),
      gifPlayback: Boolean(media?.gifPlayback),
    }
  }

  if (content?.videoMessage) {
    const media = content.videoMessage
    const isGif = Boolean(media?.gifPlayback) || asString(media?.mimetype).toLowerCase() === 'image/gif'
    return {
      kind: isGif ? 'gif' : 'video',
      message: media,
      sourceType: 'video',
      mimetype: asString(media?.mimetype) || 'video/mp4',
      fileLength: Number(media?.fileLength || 0),
      seconds: Number(media?.seconds || 0),
      gifPlayback: Boolean(media?.gifPlayback),
    }
  }

  return null
}

export function getCommandMediaSource(m) {
  const primaryMessage = m?.raw || null
  const primary = mediaCandidateFromMessage(primaryMessage)
  if (primary) {
    return {
      ...primary,
      messageContainer: primaryMessage,
    }
  }

  const quotedMessage = m?.quotedMessage || null
  const quoted = quotedMessage?.message ? mediaCandidateFromMessage(quotedMessage.message) : null
  if (quoted) {
    return {
      ...quoted,
      messageContainer: quotedMessage,
    }
  }

  return null
}


async function downloadMedia(source) {
  const sourceMessage = source?.messageContainer
  if (!sourceMessage?.key || !sourceMessage?.message) {
    throw new Error('Sumber media tidak valid.')
  }

  return downloadMediaMessage(
    sourceMessage,
    'buffer',
    {},
    {
      logger: {
        info: () => {},
        debug: () => {},
        error: () => {},
        warn: () => {},
        trace: () => {},
      },
    }
  )
}

async function ffprobe(filePath) {
  try {
    const result = await execFileAsync(
      FFPROBE_BINARY,
      [
        '-v', 'error',
        '-show_entries', 'format=duration,format_name',
        '-show_entries', 'stream=codec_type,width,height,codec_name,duration',
        '-of', 'json',
        filePath,
      ],
      { windowsHide: true, maxBuffer: 2 * 1024 * 1024 }
    )
    const parsed = JSON.parse(result.stdout || '{}')
    return parsed
  } catch (ffprobeError) {
    try {
      const result = await execFileAsync(
        FFMPEG_BINARY,
        ['-hide_banner', '-i', filePath, '-map', '0:v:0', '-f', 'null', '-'],
        { windowsHide: true, maxBuffer: 2 * 1024 * 1024 }
      )
      const output = `${result.stdout || ''}\n${result.stderr || ''}`
      const durationMatch = output.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)/i)
      const videoMatch = /Video:/i.test(output)
      if (!videoMatch) throw new Error('Track video tidak ditemukan.')
      const duration = durationMatch
        ? Number(durationMatch[1]) * 3600 + Number(durationMatch[2]) * 60 + Number(durationMatch[3])
        : 0
      return {
        format: { duration },
        streams: [{ codec_type: 'video' }],
      }
    } catch (ffmpegError) {
      throw new Error(`Metadata video tidak dapat dibaca: ${ffmpegError?.message || ffprobeError?.message || 'ffmpeg tidak tersedia.'}`)
    }
  }
}

async function ffmpegConvertGifToMp4(inputPath, outputPath) {
  try {
    await execFileAsync(
      FFMPEG_BINARY,
      [
        '-y',
        '-hide_banner',
        '-loglevel', 'error',
        '-i', inputPath,
        '-movflags', '+faststart',
        '-pix_fmt', 'yuv420p',
        '-an',
        outputPath,
      ],
      { windowsHide: true, maxBuffer: 2 * 1024 * 1024 }
    )
  } catch (err) {
    throw new Error(`GIF tidak dapat dikonversi: ${err?.message || 'ffmpeg gagal.'}`)
  }
}

function safeGroupToken(groupId) {
  return crypto.createHash('sha256').update(String(groupId)).digest('hex').slice(0, 20)
}

function safeAction(action) {
  return action === 'goodbye' ? 'goodbye' : 'welcome'
}

function extensionForType(type) {
  if (type === 'image') return 'jpg'
  return 'mp4'
}

function storedMediaRelativePath(groupId, action, extension) {
  const token = safeGroupToken(groupId)
  return path.join('data', 'database', 'group-welcome-media', token, `${safeAction(action)}-${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${extension}`)
}

function absoluteFromRelative(relativePath) {
  return path.resolve(PROJECT_ROOT, relativePath)
}

function isInsideMediaRoot(filePath) {
  const root = path.resolve(MEDIA_ROOT)
  const target = path.resolve(filePath)
  return target === root || target.startsWith(`${root}${path.sep}`)
}

export function resolveStoredMediaPath(media) {
  const relativePath = asString(media?.path)
  if (!relativePath || path.isAbsolute(relativePath)) return ''
  const filePath = absoluteFromRelative(relativePath)
  if (!isInsideMediaRoot(filePath)) return ''
  return filePath
}

async function persistBuffer(relativePath, buffer) {
  const target = absoluteFromRelative(relativePath)
  if (!isInsideMediaRoot(target)) throw new Error('Lokasi penyimpanan media tidak valid.')
  await fs.mkdir(path.dirname(target), { recursive: true })
  const tempPath = `${target}.tmp-${crypto.randomBytes(6).toString('hex')}`
  try {
    await fs.writeFile(tempPath, buffer, { mode: 0o600 })
    await fs.rename(tempPath, target)
    return target
  } catch (err) {
    await fs.rm(tempPath, { force: true }).catch(() => {})
    throw err
  }
}

async function probeVideoBuffer(buffer, sourceSeconds = 0) {
  const tempDir = path.join(MEDIA_ROOT, '.probe')
  const tempName = `probe-${process.pid}-${Date.now()}-${crypto.randomBytes(8).toString('hex')}.mp4`
  const tempPath = path.join(tempDir, tempName)
  await fs.mkdir(tempDir, { recursive: true })
  try {
    await fs.writeFile(tempPath, buffer, { mode: 0o600 })
    const metadata = await ffprobe(tempPath)
    const streams = Array.isArray(metadata?.streams) ? metadata.streams : []
    const videoStream = streams.find((stream) => stream?.codec_type === 'video')
    if (!videoStream) throw new Error('Media tidak mengandung track video yang valid.')
    const streamDuration = Number(videoStream?.duration)
    const formatDuration = Number(metadata?.format?.duration)
    const detectedDuration = Number.isFinite(streamDuration) && streamDuration > 0
      ? streamDuration
      : Number.isFinite(formatDuration) && formatDuration > 0
        ? formatDuration
        : Number(sourceSeconds || 0)
    if (!Number.isFinite(detectedDuration) || detectedDuration <= 0) {
      throw new Error('Durasi video/GIF tidak dapat dibaca dengan akurat.')
    }

    const durationForLimit = Math.round(detectedDuration * 10) / 10
    if (durationForLimit < MIN_VIDEO_SECONDS) {
      throw new Error(`Durasi video/GIF terdeteksi ${detectedDuration.toFixed(2)} detik; minimal ${MIN_VIDEO_SECONDS} detik.`)
    }
    if (durationForLimit > MAX_VIDEO_SECONDS) {
      throw new Error(`Durasi video/GIF terdeteksi ${detectedDuration.toFixed(2)} detik; maksimal ${MAX_VIDEO_SECONDS} detik.`)
    }

    return {
      duration: Number(detectedDuration.toFixed(3)),
      codec: asString(videoStream?.codec_name),
      width: Number(videoStream?.width || 0),
      height: Number(videoStream?.height || 0),
      format: asString(metadata?.format?.format_name),
    }
  } finally {
    await fs.rm(tempPath, { force: true }).catch(() => {})
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {})
  }
}


async function prepareGifImageBuffer(buffer, sourceSeconds = 0) {
  const tempDir = path.join(MEDIA_ROOT, '.convert')
  const inputPath = path.join(tempDir, `input-${process.pid}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.gif`)
  const outputPath = path.join(tempDir, `output-${process.pid}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.mp4`)
  await fs.mkdir(tempDir, { recursive: true })
  try {
    await fs.writeFile(inputPath, buffer, { mode: 0o600 })
    await ffmpegConvertGifToMp4(inputPath, outputPath)
    const converted = await fs.readFile(outputPath)
    if (!converted.length) throw new Error('Hasil konversi GIF kosong.')
    const metadata = await probeVideoBuffer(converted, sourceSeconds)
    return { buffer: converted, metadata }
  } finally {
    await fs.rm(inputPath, { force: true }).catch(() => {})
    await fs.rm(outputPath, { force: true }).catch(() => {})
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {})
  }
}

export function validateGroupEventMediaSource(source) {
  if (!source?.message) return { valid: false, reason: 'Media tidak ditemukan.' }
  const reportedSize = Number(source.fileLength || 0)
  const maxSize = source.kind === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
  if (Number.isFinite(reportedSize) && reportedSize > maxSize) {
    return { valid: false, reason: `Ukuran media terlalu besar. Batas ${Math.round(maxSize / 1024 / 1024)} MB.` }
  }
  if (source.kind === 'video' || source.kind === 'gif' || source.kind === 'gif-image') {
    const seconds = Number(source.seconds || 0)
    if (Number.isFinite(seconds) && seconds > MAX_VIDEO_SECONDS + 0.5) {
      return { valid: false, reason: `Durasi video/GIF terdeteksi ${seconds.toFixed(2)} detik; maksimal ${MAX_VIDEO_SECONDS} detik.` }
    }
  }
  if (!['image', 'video', 'gif', 'gif-image'].includes(String(source.kind || ''))) {
    return { valid: false, reason: 'Jenis media tidak didukung.' }
  }
  return { valid: true, reason: '' }
}

async function processGroupEventMedia(source, downloadedBuffer = null) {
  const preflight = validateGroupEventMediaSource(source)
  if (!preflight.valid) throw new Error(preflight.reason)

  const reportedSize = Number(source.fileLength || 0)
  const maxSize = source.kind === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE
  if (Number.isFinite(reportedSize) && reportedSize > maxSize) {
    throw new Error(`Ukuran media terlalu besar. Batas ${Math.round(maxSize / 1024 / 1024)} MB.`)
  }

  const downloaded = downloadedBuffer || await downloadMedia(source)
  const buffer = Buffer.isBuffer(downloaded) ? downloaded : Buffer.from(downloaded || [])
  if (!buffer.length) throw new Error('Media kosong atau gagal diunduh.')
  if (buffer.length > maxSize) {
    throw new Error(`Ukuran media terlalu besar. Batas ${Math.round(maxSize / 1024 / 1024)} MB.`)
  }

  let finalBuffer = buffer
  let finalType = source.kind
  let metadata = null

  if (source.kind === 'image') {
    try {
      metadata = await sharp(buffer, { failOn: 'error' }).metadata()
    } catch {
      throw new Error('File gambar tidak valid atau rusak.')
    }
    if (!metadata?.width || !metadata?.height) throw new Error('Dimensi gambar tidak valid.')
    finalType = 'image'
  } else if (source.kind === 'gif-image') {
    const converted = await prepareGifImageBuffer(buffer, source.seconds)
    finalBuffer = converted.buffer
    metadata = converted.metadata
    finalType = 'gif'
  } else {
    metadata = await probeVideoBuffer(buffer, source.seconds)
    finalType = source.kind === 'gif' || source.gifPlayback ? 'gif' : 'video'
  }

  if (finalBuffer.length > maxSize) {
    throw new Error(`Ukuran media hasil pemrosesan terlalu besar. Batas ${Math.round(maxSize / 1024 / 1024)} MB.`)
  }

  return {
    buffer: finalBuffer,
    type: finalType,
    mimetype: finalType === 'image' ? 'image/jpeg' : 'video/mp4',
    gifPlayback: finalType === 'gif',
    size: finalBuffer.length,
    duration: Number(metadata?.duration || 0),
    width: Number(metadata?.width || 0),
    height: Number(metadata?.height || 0),
  }
}

async function persistPreparedGroupEventMedia(groupId, action, prepared) {
  const extension = extensionForType(prepared.type === 'image' ? 'image' : 'video')
  const relativePath = storedMediaRelativePath(groupId, action, extension).split(path.sep).join('/')
  const absolutePath = await persistBuffer(relativePath, prepared.buffer)

  try {
    const storedStat = await fs.stat(absolutePath)
    if (!storedStat.isFile() || storedStat.size !== prepared.buffer.length) {
      throw new Error('Verifikasi file media gagal.')
    }
  } catch (err) {
    await fs.rm(absolutePath, { force: true }).catch(() => {})
    throw err
  }

  const checksum = crypto.createHash('sha256').update(prepared.buffer).digest('hex')
  return {
    type: prepared.type,
    mimetype: prepared.mimetype,
    gifPlayback: prepared.gifPlayback,
    path: relativePath,
    size: prepared.size,
    checksum,
    duration: prepared.duration,
    width: prepared.width,
    height: prepared.height,
  }
}

export async function saveGroupEventMedia({ groupId, action, source, preparedBuffer = null }) {
  if (!groupId?.endsWith('@g.us')) throw new Error('Target group tidak valid.')
  const prepared = await processGroupEventMedia(source, preparedBuffer)
  return persistPreparedGroupEventMedia(groupId, action, prepared)
}

export async function inspectGroupEventMedia(source) {
  const prepared = await processGroupEventMedia(source)
  return {
    type: prepared.type,
    duration: prepared.duration,
    width: prepared.width,
    height: prepared.height,
    size: prepared.size,
    mimetype: prepared.mimetype,
    gifPlayback: prepared.gifPlayback,
  }
}

export async function isStoredMediaUsable(media) {
  const filePath = resolveStoredMediaPath(media)
  if (!filePath || !MEDIA_FILE_PATTERN.test(path.basename(filePath))) return false

  try {
    const stat = await fs.stat(filePath)
    if (!stat.isFile() || stat.size <= 0) return false

    if (Number(media?.size) > 0 && stat.size !== Number(media.size)) return false

    const cacheKey = `${filePath}:${stat.size}:${stat.mtimeMs}`
    if (mediaIntegrityCache.has(cacheKey)) return mediaIntegrityCache.get(cacheKey)

    if (media?.type === 'image') {
      const metadata = await sharp(filePath, { failOn: 'error' }).metadata()
      if (!metadata?.width || !metadata?.height) return false
    } else {
      const handle = await fs.open(filePath, 'r')
      try {
        const buffer = Buffer.alloc(12)
        const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0)
        if (bytesRead < 8 || buffer.subarray(4, 8).toString('ascii') !== 'ftyp') return false
      } finally {
        await handle.close()
      }
    }

    if (media?.checksum) {
      const buffer = await fs.readFile(filePath)
      const checksum = crypto.createHash('sha256').update(buffer).digest('hex')
      if (checksum !== media.checksum) return false
    }

    if (mediaIntegrityCache.size >= 256) {
      const firstKey = mediaIntegrityCache.keys().next().value
      if (firstKey) mediaIntegrityCache.delete(firstKey)
    }
    mediaIntegrityCache.set(cacheKey, true)
    return true
  } catch {
    return false
  }
}

export async function deleteStoredMedia(media) {
  const filePath = resolveStoredMediaPath(media)
  if (!filePath) return false
  try {
    for (const key of [...mediaIntegrityCache.keys()]) {
      if (key.startsWith(`${filePath}:`)) mediaIntegrityCache.delete(key)
    }
    await fs.rm(filePath, { force: true })
    return true
  } catch {
    return false
  }
}

export default {
  getCommandMediaSource,
  resolveStoredMediaPath,
  saveGroupEventMedia,
  isStoredMediaUsable,
  deleteStoredMedia,
  validateGroupEventMediaSource,
  inspectGroupEventMedia,
}
