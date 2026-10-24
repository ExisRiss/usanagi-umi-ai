
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawn } from 'node:child_process'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { Transform } from 'node:stream'
import { createWriteStream } from 'node:fs'

const DEFAULT_UA = 'Mozilla/5.0 (Linux; Android 13; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36'
const MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024
const FFMPEG_TIMEOUT = Number(process.env.USANAGI_VIDEO_FFMPEG_TIMEOUT_MS) || 180000
const FFMPEG_BIN = (process.env.FFMPEG_PATH || '').trim() || 'ffmpeg'
const FFPROBE_BIN = (process.env.FFPROBE_PATH || '').trim() || 'ffprobe'

function makeTemp(prefix, ext = 'tmp') {
  return path.join(os.tmpdir(), `${prefix}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext.replace(/^\./, '')}`)
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    let child
    try {
      child = spawn(command, args, { windowsHide: true })
    } catch (error) {
      reject(error)
      return
    }
    let stdout = ''
    let stderr = ''
    let settled = false
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      if (!settled) {
        settled = true
        reject(new Error(`${command} timeout.`))
      }
    }, options.timeoutMs || FFMPEG_TIMEOUT)
    const abort = () => {
      child.kill('SIGKILL')
      if (!settled) {
        settled = true
        reject(new Error(`${command} dibatalkan.`))
      }
    }
    if (options.signal) {
      if (options.signal.aborted) return abort()
      options.signal.addEventListener('abort', abort, { once: true })
    }
    child.stdout?.on('data', chunk => { stdout += chunk.toString() })
    child.stderr?.on('data', chunk => { stderr += chunk.toString() })
    child.on('error', error => {
      if (options.signal) options.signal.removeEventListener('abort', abort)
      clearTimeout(timer)
      if (settled) return
      settled = true
      reject(error)
    })
    child.on('close', code => {
      if (options.signal) options.signal.removeEventListener('abort', abort)
      clearTimeout(timer)
      if (settled) return
      settled = true
      if (code === 0) resolve({ stdout, stderr })
      else reject(new Error((stderr || stdout).trim().slice(-1200) || `${command} keluar dengan kode ${code}`))
    })
  })
}

async function ffprobeJson(file) {
  try {
    const result = await run(FFPROBE_BIN, [
      '-v', 'error',
      '-print_format', 'json',
      '-show_streams',
      '-show_format',
      file,
    ], { timeoutMs: 30000 })
    return JSON.parse(result.stdout || '{}')
  } catch {
    const result = await run(FFMPEG_BIN, ['-hide_banner', '-i', file, '-f', 'null', '-'], { timeoutMs: 30000 })
    const text = `${result.stderr}\n${result.stdout}`
    const video = text.match(/Video:\s*([^,\s]+)/i)?.[1] || ''
    const audio = text.match(/Audio:\s*([^,\s]+)/i)?.[1] || ''
    const size = await fs.stat(file)
    return {
      streams: [
        ...(video ? [{ codec_type: 'video', codec_name: video, pix_fmt: 'yuv420p' }] : []),
        ...(audio ? [{ codec_type: 'audio', codec_name: audio }] : []),
      ],
      format: { format_name: 'unknown', size: String(size.size) },
    }
  }
}

function getVideoProfile(meta) {
  const video = meta?.streams?.find(item => item?.codec_type === 'video') || null
  const audio = meta?.streams?.find(item => item?.codec_type === 'audio') || null
  const formatName = String(meta?.format?.format_name || '').toLowerCase()
  return {
    formatName,
    videoCodec: String(video?.codec_name || '').toLowerCase(),
    audioCodec: String(audio?.codec_name || '').toLowerCase(),
    pixelFormat: String(video?.pix_fmt || '').toLowerCase(),
    width: Number(video?.width || 0),
    height: Number(video?.height || 0),
    duration: Number(meta?.format?.duration || 0),
    hasVideo: Boolean(video),
    hasAudio: Boolean(audio),
  }
}

function isWhatsAppCompatible(profile) {
  const formatOk = profile.formatName.split(',').some(value => ['mov', 'mp4', 'm4a', '3gp', '3g2', 'isom', 'iso2', 'avc1', 'mp41', 'mp42'].includes(value))
  const videoOk = profile.videoCodec === 'h264'
  const pixelOk = !profile.pixelFormat || profile.pixelFormat === 'yuv420p' || profile.pixelFormat === 'yuvj420p'
  const audioOk = !profile.hasAudio || profile.audioCodec === 'aac'
  return formatOk && videoOk && pixelOk && audioOk
}

async function hasValidVideo(file) {
  const stat = await fs.stat(file)
  if (!stat.isFile() || !stat.size || stat.size > MAX_VIDEO_BYTES) throw new Error('File video tidak valid atau melebihi batas.')
  const meta = await ffprobeJson(file)
  const profile = getVideoProfile(meta)
  if (!profile.hasVideo || !profile.width || !profile.height) throw new Error('Stream video tidak ditemukan.')
  if (!Number.isFinite(profile.duration) || profile.duration <= 0) throw new Error('Durasi video tidak valid.')
  return { meta, profile, size: stat.size }
}

async function muxCompatible(input, output) {
  await run(FFMPEG_BIN, [
    '-y',
    '-hide_banner',
    '-loglevel', 'error',
    '-i', input,
    '-map', '0:v:0',
    '-map', '0:a:0?',
    '-c', 'copy',
    '-movflags', '+faststart',
    '-avoid_negative_ts', 'make_zero',
    output,
  ], { timeoutMs: FFMPEG_TIMEOUT })
}

async function muxAudioCompatible(input, output) {
  await run(FFMPEG_BIN, [
    '-y',
    '-hide_banner',
    '-loglevel', 'error',
    '-i', input,
    '-map', '0:v:0',
    '-map', '0:a:0?',
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', process.env.USANAGI_VIDEO_AAC_BITRATE || '192k',
    '-movflags', '+faststart',
    '-avoid_negative_ts', 'make_zero',
    output,
  ], { timeoutMs: FFMPEG_TIMEOUT })
}

async function transcodeCompatible(input, output) {
  await run(FFMPEG_BIN, [
    '-y',
    '-hide_banner',
    '-loglevel', 'error',
    '-i', input,
    '-map', '0:v:0',
    '-map', '0:a:0?',
    '-c:v', 'libx264',
    '-preset', process.env.USANAGI_VIDEO_X264_PRESET || 'veryfast',
    '-crf', process.env.USANAGI_VIDEO_X264_CRF || '18',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', process.env.USANAGI_VIDEO_AAC_BITRATE || '192k',
    '-movflags', '+faststart',
    '-avoid_negative_ts', 'make_zero',
    '-max_muxing_queue_size', '4096',
    output,
  ], { timeoutMs: FFMPEG_TIMEOUT })
}

export async function prepareWhatsAppVideo(inputFile, { prefix = 'usanagi-video', removeInput = false } = {}) {
  const original = await hasValidVideo(inputFile)
  const source = original.profile
  const direct = source.formatName.split(',').some(value => ['mp4', 'mov', 'isom', 'iso2', 'avc1', 'mp41', 'mp42'].includes(value)) && source.videoCodec === 'h264' && (!source.hasAudio || source.audioCodec === 'aac') && (!source.pixelFormat || source.pixelFormat === 'yuv420p' || source.pixelFormat === 'yuvj420p')
  let output = inputFile
  let temporary = false

  const mp4VideoReady = source.formatName.split(',').some(value => ['mp4', 'mov', 'isom', 'iso2', 'avc1', 'mp41', 'mp42'].includes(value)) && source.videoCodec === 'h264' && (!source.pixelFormat || source.pixelFormat === 'yuv420p' || source.pixelFormat === 'yuvj420p')

  if (!direct && mp4VideoReady && source.hasAudio && source.audioCodec !== 'aac') {
    output = makeTemp(prefix, 'mp4')
    temporary = true
    try {
      await muxAudioCompatible(inputFile, output)
    } catch (audioError) {
      await fs.rm(output).catch(() => {})
      output = inputFile
      temporary = false
    }
  }

  if (output === inputFile && !direct) {
    output = makeTemp(prefix, 'mp4')
    temporary = true
    try {
      await transcodeCompatible(inputFile, output)
    } catch (transcodeError) {
      await fs.rm(output).catch(() => {})
      throw transcodeError
    }
  } else if (direct) {
    const remuxed = makeTemp(prefix, 'mp4')
    try {
      await muxCompatible(inputFile, remuxed)
      output = remuxed
      temporary = true
    } catch {
      await fs.rm(remuxed).catch(() => {})
    }
  }

  try {
    const final = await hasValidVideo(output)
    const compatible = isWhatsAppCompatible(final.profile)
    if (!compatible) {
      if (output !== inputFile) await fs.rm(output).catch(() => {})
      output = makeTemp(prefix, 'mp4')
      temporary = true
      await transcodeCompatible(inputFile, output)
      const verified = await hasValidVideo(output)
      if (!isWhatsAppCompatible(verified.profile)) throw new Error('Video tidak kompatibel dengan pengiriman WhatsApp.')
      return { file: output, size: verified.size, profile: verified.profile, generated: true, original: inputFile }
    }
    return { file: output, size: final.size, profile: final.profile, generated: temporary, original: inputFile }
  } catch (error) {
    if (output !== inputFile) await fs.rm(output).catch(() => {})
    throw error
  } finally {
    if (removeInput && inputFile !== output) await fs.rm(inputFile).catch(() => {})
  }
}

export async function probeRemoteWhatsAppVideo(url, { headers = {}, timeoutMs = 6000 } = {}) {
  try {
    const headerText = Object.entries(headers || {}).map(([key, value]) => `${key}: ${String(value)}\r\n`).join('')
    const meta = await run(FFPROBE_BIN, [
      '-v', 'error',
      '-print_format', 'json',
      '-show_streams',
      '-show_format',
      '-probesize', process.env.USANAGI_VIDEO_PROBE_SIZE || '5M',
      '-analyzeduration', process.env.USANAGI_VIDEO_PROBE_DURATION || '2M',
      '-rw_timeout', String(Math.max(1000000, timeoutMs * 1000)),
      ...(headerText ? ['-headers', headerText] : []),
      url,
    ], { timeoutMs })
    const data = JSON.parse(meta.stdout || '{}')
    const profile = getVideoProfile(data)
    if (!profile.hasVideo || !profile.width || !profile.height) return null
    return { ...profile, compatible: isWhatsAppCompatible(profile) }
  } catch {
    return null
  }
}

async function remoteToFile(url, { headers = {}, timeoutMs = 120000, maxBytes = MAX_VIDEO_BYTES, prefix = 'usanagi-remote-video' } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const file = makeTemp(prefix, 'source')
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': DEFAULT_UA, Accept: 'video/mp4,video/*,*/*', 'Accept-Encoding': 'identity', ...(headers || {}) },
      redirect: 'follow',
      signal: controller.signal,
    })
    if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`)
    const contentType = String(response.headers.get('content-type') || '').toLowerCase()
    const declared = Number(response.headers.get('content-length') || 0)
    if (declared && declared > maxBytes) throw new Error('Ukuran video melebihi batas yang diizinkan.')
    let inspected = false
    let total = 0
    const validator = new Transform({
      transform(chunk, encoding, callback) {
        if (!inspected) {
          inspected = true
          const sample = Buffer.from(chunk).subarray(0, 4096).toString('utf8').replace(/^\uFEFF/, '').trimStart().toLowerCase()
          if (contentType.includes('text/html') || contentType.includes('application/xhtml') || sample.startsWith('<!doctype html') || sample.startsWith('<html') || sample.includes('<html')) return callback(new Error('Sumber mengembalikan HTML, bukan video.'))
        }
        total += chunk.length
        if (total > maxBytes) return callback(new Error('Ukuran video melebihi batas yang diizinkan.'))
        callback(null, chunk)
      },
      flush(callback) {
        if (!total) return callback(new Error('File video kosong.'))
        callback()
      },
    })
    await pipeline(Readable.fromWeb(response.body).pipe(validator), createWriteStream(file, { highWaterMark: 1024 * 1024 }))
    return { file, contentType, size: total, finalUrl: response.url || url }
  } catch (error) {
    await fs.rm(file).catch(() => {})
    if (error?.name === 'AbortError') throw new Error('Unduhan video timeout.')
    throw error
  } finally {
    clearTimeout(timer)
  }
}


export async function prepareRemoteWhatsAppVideo(url, options = {}) {
  const remote = await remoteToFile(url, options)
  try {
    const prepared = await prepareWhatsAppVideo(remote.file, { prefix: options.prefix || 'usanagi-remote-video', removeInput: true })
    return { ...prepared, contentType: remote.contentType, finalUrl: remote.finalUrl, remoteSize: remote.size }
  } catch (error) {
    await fs.rm(remote.file).catch(() => {})
    throw error
  }
}

export async function prepareYtDlpVideo(file, options = {}) {
  return prepareWhatsAppVideo(file, { prefix: options.prefix || 'usanagi-ytdlp-video', removeInput: options.removeInput ?? false })
}

export async function validateVideoFile(file) {
  return hasValidVideo(file)
}
