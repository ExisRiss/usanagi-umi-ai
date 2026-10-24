
'use strict'

import { createDecipheriv, randomUUID } from 'node:crypto'
import { spawn } from 'node:child_process'
import fs from 'fs-extra'
import path from 'node:path'
import os from 'node:os'
import sharp from 'sharp'
import { ensureYtDlp, ytDlpExtractAudio, getFfmpegBinPath } from '../../lib/awang-ytdlp.js'

const METADATA_DECRYPTION_KEY = Buffer.from('C5D58EF67A7584E4A29F6C35BBC4EB12', 'hex')
const LRCLIB_API = 'https://lrclib.net/api'
const LRCLIB_USER_AGENT = 'UsanagiMD-Play2/1.0 (https://github.com/)'
const REQUEST_TIMEOUT = 20000
const YTDLP_TIMEOUT = 120000
const AUDIO_FETCH_TIMEOUT = 120000
const SEARCH_LIMIT = 10
const MAX_ORIGINAL_AUDIO_MB = 25
const MAX_ORIGINAL_AUDIO_SIZE = MAX_ORIGINAL_AUDIO_MB * 1024 * 1024
const MAX_COMPRESSED_AUDIO_MB = 6
const MAX_COMPRESSED_AUDIO_SIZE = MAX_COMPRESSED_AUDIO_MB * 1024 * 1024
const COMPRESSED_AUDIO_HARD_LIMIT = 8 * 1024 * 1024
const USER_AGENT = 'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36'

const HEADERS = {
  'Content-Type': 'application/json',
  Origin: 'https://yt.savetube.me',
  'User-Agent': USER_AGENT,
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const clean = (value = '') => String(value)
  .replace(/\\u0026/g, '&')
  .replace(/\\u003d/g, '=')
  .replace(/\\u0027/g, "'")
  .replace(/\\u002f/g, '/')
  .replace(/&amp;/g, '&')
  .replace(/&#39;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ')
  .trim()

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;')

const escapeAttr = value => escapeHtml(value)

const youtubeId = input => {
  const value = clean(input)
  const match = value.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i)
  return match?.[1] || ''
}

const isYouTube = input => {
  try {
    const url = new URL(input)
    const host = url.hostname.toLowerCase().replace(/^www\./, '')
    return host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtu.be'
  } catch {
    return false
  }
}

const secondsFromTimestamp = timestamp => {
  if (!timestamp) return 0

  const parts = String(timestamp).split(':').map(Number)
  if (parts.some(Number.isNaN)) return 0

  if (parts.length === 2) return parts[0] * 60 + parts[1]
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]

  return 0
}

const formatDuration = seconds => {
  const value = Number(seconds)

  if (!Number.isFinite(value) || value <= 0) return '0:00'

  const total = Math.floor(value)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60

  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${m}:${String(s).padStart(2, '0')}`
}

async function request(url, options = {}) {
  const { timeoutMs = REQUEST_TIMEOUT, retries = 1, ...fetchOptions } = options
  let lastError = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(url, {
        redirect: 'follow',
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'User-Agent': USER_AGENT,
          'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
          ...(fetchOptions.headers || {}),
        },
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      return response
    } catch (error) {
      lastError = error?.name === 'AbortError'
        ? new Error('Permintaan timeout, coba lagi.')
        : error

      if (attempt < retries) await sleep(500 * (attempt + 1))
    } finally {
      clearTimeout(timer)
    }
  }

  throw lastError || new Error('Permintaan gagal.')
}

async function getLRCLyrics({ title, artist, duration = 0, album = '' }) {
  try {
    if (!title || !artist) return null

    const params = new URLSearchParams({
      track_name: String(title).trim(),
      artist_name: String(artist).trim(),
    })

    if (album) params.set('album_name', String(album).trim())

    const durationNumber = Number(duration)
    if (Number.isFinite(durationNumber) && durationNumber >= 1 && durationNumber <= 3600) {
      params.set('duration', String(Math.round(durationNumber)))
    }

    const response = await request(`${LRCLIB_API}/get?${params.toString()}`, {
      timeoutMs: 12000,
      retries: 1,
      headers: {
        Accept: 'application/json',
        'User-Agent': LRCLIB_USER_AGENT,
      },
    })

    if (response.status === 404 || response.status === 429) return null

    const data = await response.json()
    if (!data) return null

    return {
      id: data.id || null,
      trackName: data.trackName || title,
      artistName: data.artistName || artist,
      albumName: data.albumName || '',
      duration: Number(data.duration || duration || 0),
      instrumental: Boolean(data.instrumental),
      plainLyrics: typeof data.plainLyrics === 'string' ? data.plainLyrics : '',
      syncedLyrics: typeof data.syncedLyrics === 'string' ? data.syncedLyrics : '',
    }
  } catch {
    return null
  }
}

function parseLrcTimestamp(match) {
  if (!match) return null

  const minutes = Number(match[1])
  const seconds = Number(match[2])
  const fractionText = match[3] || ''

  if (!Number.isFinite(minutes) || !Number.isFinite(seconds) || seconds < 0 || seconds >= 60) return null

  let milliseconds = 0

  if (fractionText.length === 1) milliseconds = Number(fractionText) * 100
  else if (fractionText.length === 2) milliseconds = Number(fractionText) * 10
  else if (fractionText.length >= 3) milliseconds = Number(fractionText.slice(0, 3))

  return minutes * 60 + seconds + milliseconds / 1000
}

function parseSyncedLyrics(lrc = '') {
  if (!lrc || typeof lrc !== 'string') return []

  const result = []
  const timestampRegex = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g

  for (const rawLine of lrc.split(/\r?\n/)) {
    if (!rawLine.trim()) continue

    const matches = [...rawLine.matchAll(timestampRegex)]
    if (!matches.length) continue

    const lineText = rawLine.replace(timestampRegex, '').trim()
    if (!lineText) continue

    for (const match of matches) {
      const time = parseLrcTimestamp(match)
      if (time === null || !Number.isFinite(time) || time < 0) continue
      result.push({ time, text: lineText })
    }
  }

  result.sort((a, b) => a.time - b.time)

  const cleaned = []
  for (const item of result) {
    const last = cleaned[cleaned.length - 1]

    if (last && Math.abs(last.time - item.time) < 0.001 && last.text === item.text) {
      continue
    }

    cleaned.push(item)
  }

  return cleaned
}

function plainLyricsToSynced(lyrics = '', duration = 0) {
  if (!lyrics || typeof lyrics !== 'string') return []

  const lines = lyrics.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
  if (!lines.length) return []

  const totalDuration = Number(duration)
  const interval = Number.isFinite(totalDuration) && totalDuration > 0 && lines.length > 1
    ? Math.max(2, Math.min(8, totalDuration / lines.length))
    : 5

  return lines.map((text, index) => ({ time: index * interval, text }))
}

function normalizeLyrics(lyrics = []) {
  if (!Array.isArray(lyrics)) return []

  return lyrics
    .filter(item => item && Number.isFinite(Number(item.time)) && typeof item.text === 'string')
    .map(item => ({ time: Number(item.time), text: String(item.text).trim() }))
    .filter(item => item.text)
    .sort((a, b) => a.time - b.time)
}

async function optionalYTMusicSearch(query) {
  try {
    const module = await import('ytmusic-api').catch(() => null)
    const YTMusic = module?.default || module?.YTMusic
    if (!YTMusic) return []

    const ytm = new YTMusic()
    await ytm.initialize()

    const songs = await ytm.search(query)

    return (Array.isArray(songs) ? songs : [])
      .filter(item => item?.type === 'SONG' || item?.videoId)
      .slice(0, SEARCH_LIMIT)
      .map(item => ({
        videoId: clean(item.videoId),
        title: clean(item.name || item.title),
        artist: clean(
          Array.isArray(item.artists)
            ? item.artists.map(x => x?.name).filter(Boolean).join(', ')
            : item.artist?.name
        ),
        duration: Number(item.duration || 0),
        thumbnail: clean(item.thumbnails?.[item.thumbnails.length - 1]?.url),
        album: clean(item.album?.name || item.album?.title),
      }))
      .filter(item => /^[A-Za-z0-9_-]{11}$/.test(item.videoId))
  } catch {
    return []
  }
}

async function getYtDlpJson(args, timeoutMs = YTDLP_TIMEOUT) {
  const bin = await ensureYtDlp()

  return new Promise((resolve, reject) => {
    const proc = spawn(bin, args, {
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stdout = ''
    let stderr = ''
    let settled = false

    const fail = error => {
      if (settled) return

      settled = true

      try {
        proc.kill('SIGKILL')
      } catch {}

      reject(error)
    }

    const timer = setTimeout(() => {
      fail(new Error('yt-dlp timeout.'))
    }, timeoutMs)

    proc.stdout.on('data', chunk => {
      stdout += chunk.toString()

      if (stdout.length > 16 * 1024 * 1024) {
        fail(new Error('Output yt-dlp terlalu besar.'))
      }
    })

    proc.stderr.on('data', chunk => {
      stderr += chunk.toString()

      if (stderr.length > 2 * 1024 * 1024) {
        stderr = stderr.slice(-2 * 1024 * 1024)
      }
    })

    proc.on('error', error => {
      clearTimeout(timer)
      fail(error?.code === 'ENOENT' ? new Error('yt-dlp tidak ditemukan.') : error)
    })

    proc.on('close', code => {
      clearTimeout(timer)

      if (settled) return

      if (code !== 0) {
        fail(new Error(stderr.trim().slice(-800) || `yt-dlp gagal (${code})`))
        return
      }

      try {
        const data = JSON.parse(stdout)
        settled = true
        resolve(data)
      } catch {
        fail(new Error('JSON yt-dlp tidak valid.'))
      }
    })
  })
}

async function searchYouTube(query) {
  const ytmusic = await optionalYTMusicSearch(query)

  if (ytmusic.length) {
    return ytmusic
  }

  const data = await getYtDlpJson([
    `ytsearch${SEARCH_LIMIT}:${query}`,
    '--dump-single-json',
    '--flat-playlist',
    '--skip-download',
    '--no-playlist',
    '--no-warnings',
    '--quiet',
    '--ignore-errors',
  ])

  const entries = Array.isArray(data?.entries) ? data.entries : []

  return entries
    .map(item => ({
      videoId: clean(item?.id),
      title: clean(item?.title),
      artist: clean(item?.uploader || item?.channel || item?.creator || ''),
      duration: Number(item?.duration || 0),
      thumbnail: clean(item?.thumbnail),
      album: '',
    }))
    .filter(item => /^[A-Za-z0-9_-]{11}$/.test(item.videoId))
    .slice(0, SEARCH_LIMIT)
}

async function getYouTubeInfo(url) {
  const id = youtubeId(url)

  if (!id) {
    throw new Error('URL YouTube tidak valid.')
  }

  try {
    const data = await getYtDlpJson([
      `https://www.youtube.com/watch?v=${id}`,
      '--dump-single-json',
      '--skip-download',
      '--no-playlist',
      '--no-warnings',
      '--quiet',
      '--ignore-errors',
    ])

    return {
      videoId: id,
      title: clean(data?.title) || 'Unknown',
      artist: clean(data?.uploader || data?.channel || 'YouTube') || 'YouTube',
      duration: Number(data?.duration || 0),
      thumbnail: clean(data?.thumbnail) || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      album: clean(data?.album || ''),
    }
  } catch {
    return {
      videoId: id,
      title: 'Unknown',
      artist: 'YouTube',
      duration: 0,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      album: '',
    }
  }
}

async function savetube(url, { downloadType = 'audio', quality = '128kbps' } = {}) {
  const videoId = youtubeId(url)

  if (!videoId) {
    throw new Error('URL YouTube tidak valid.')
  }

  const cdnRes = await request(
    'https://media.savetube.vip/api/random-cdn',
    {
      headers: HEADERS,
      timeoutMs: 15000,
      retries: 1,
    }
  )
    .then(response => response.json())
    .catch(() => null)

  if (!cdnRes?.cdn) {
    throw new Error('CDN SaveTube tidak tersedia.')
  }

  const cdn = String(cdnRes.cdn)
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')

  const infoResponse = await request(`https://${cdn}/v2/info`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      url: `https://www.youtube.com/watch?v=${videoId}`,
    }),
    timeoutMs: 20000,
    retries: 1,
  })

  const info = await infoResponse.json()

  if (!info?.data) {
    throw new Error('Metadata SaveTube kosong.')
  }

  let metadata

  try {
    const encrypted = Buffer.from(info.data, 'base64')

    if (encrypted.length <= 16) {
      throw new Error('Data encrypted tidak valid.')
    }

    const decipher = createDecipheriv(
      'aes-128-cbc',
      METADATA_DECRYPTION_KEY,
      encrypted.subarray(0, 16)
    )

    const decrypted = Buffer.concat([
      decipher.update(encrypted.subarray(16)),
      decipher.final(),
    ])

    metadata = JSON.parse(decrypted.toString('utf8'))
  } catch {
    throw new Error('Decrypt metadata SaveTube gagal.')
  }

  if (!metadata?.key) {
    throw new Error('Key download SaveTube tidak ditemukan.')
  }

  const downloadResponse = await request(`https://${cdn}/download`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      id: videoId,
      downloadType,
      quality,
      key: metadata.key,
    }),
    timeoutMs: 20000,
    retries: 1,
  })

  const downloadData = await downloadResponse.json()

  if (!downloadData?.data?.downloadUrl) {
    throw new Error(downloadData?.message || 'Download SaveTube gagal.')
  }

  return {
    title: clean(metadata.title),
    duration: clean(metadata.durationLabel),
    thumbnail: clean(metadata.thumbnail),
    url: clean(downloadData.data.downloadUrl),
  }
}

async function savetubeRetry(url, options, retries = 2) {
  let lastError = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await savetube(url, options)
    } catch (error) {
      lastError = error

      if (attempt < retries) {
        await sleep(700 * (attempt + 1))
      }
    }
  }

  throw lastError || new Error('SaveTube gagal.')
}

async function downloadRemoteAudio(url) {
  if (!url) {
    throw new Error('URL audio kosong.')
  }

  const response = await request(url, {
    timeoutMs: AUDIO_FETCH_TIMEOUT,
    retries: 1,
    headers: {
      Accept: 'audio/*,application/octet-stream,*/*',
    },
  })

  const declaredLength = Number(
    response.headers.get('content-length') || 0
  )

  if (declaredLength > MAX_ORIGINAL_AUDIO_SIZE) {
    throw new Error('Audio asli terlalu besar.')
  }

  const buffer = Buffer.from(
    await response.arrayBuffer()
  )

  if (!buffer.length) {
    throw new Error('Audio kosong.')
  }

  if (buffer.length > MAX_ORIGINAL_AUDIO_SIZE) {
    throw new Error('Audio asli terlalu besar.')
  }

  return buffer
}

async function getAudioBuffer(url) {
  try {
    const saved = await savetubeRetry(
      url,
      {
        downloadType: 'audio',
        quality: '128kbps',
      },
      2
    )

    if (saved?.url) {
      return await downloadRemoteAudio(
        saved.url
      )
    }
  } catch {}

  const file = await ytDlpExtractAudio(
    url,
    MAX_ORIGINAL_AUDIO_SIZE,
    {
      prefix: 'usanagi-play2',
    }
  )

  try {
    const buffer = await fs.readFile(file)

    if (!buffer.length) {
      throw new Error('Audio yt-dlp kosong.')
    }

    if (buffer.length > MAX_ORIGINAL_AUDIO_SIZE) {
      throw new Error('Audio yt-dlp terlalu besar.')
    }

    return buffer
  } finally {
    await fs.remove(file).catch(() => {})
  }
}

async function compressAudio(inputBuffer) {
  if (!Buffer.isBuffer(inputBuffer) || !inputBuffer.length) {
    throw new Error('Input audio kosong.')
  }

  const ffmpeg = await getFfmpegBinPath()

  if (!ffmpeg) {
    throw new Error('FFmpeg tidak tersedia.')
  }

  const token = randomUUID()
  const inputFile = path.join(os.tmpdir(), `usanagi-play2-${token}.src`)
  const outputFile = path.join(os.tmpdir(), `usanagi-play2-${token}.ogg`)

  await fs.writeFile(inputFile, inputBuffer)

  try {
    await new Promise((resolve, reject) => {
      let settled = false
      let stderr = ''

      const proc = spawn(
        ffmpeg,
        [
          '-hide_banner',
          '-loglevel',
          'error',
          '-i',
          inputFile,
          '-vn',
          '-c:a',
          'libopus',
          '-b:a',
          '16k',
          '-ar',
          '24000',
          '-ac',
          '1',
          '-application',
          'audio',
          '-f',
          'ogg',
          outputFile,
          '-y',
        ],
        {
          windowsHide: true,
          stdio: ['ignore', 'ignore', 'pipe'],
        }
      )

      const fail = error => {
        if (settled) return

        settled = true

        try {
          proc.kill('SIGKILL')
        } catch {}

        reject(error)
      }

      const timer = setTimeout(
        () => fail(new Error('FFmpeg timeout.')),
        120000
      )

      proc.stderr.on('data', chunk => {
        stderr += chunk.toString()

        if (stderr.length > 3000) {
          stderr = stderr.slice(-3000)
        }
      })

      proc.on('error', error => {
        clearTimeout(timer)
        fail(error)
      })

      proc.on('close', code => {
        clearTimeout(timer)

        if (settled) return

        if (code !== 0) {
          fail(
            new Error(
              stderr.trim() ||
              `FFmpeg gagal (${code})`
            )
          )
          return
        }

        settled = true
        resolve()
      })
    })

    const stat = await fs.stat(outputFile)

    if (!stat.size) {
      throw new Error('Audio hasil compress kosong.')
    }

    if (stat.size > MAX_COMPRESSED_AUDIO_SIZE) {
      throw new Error('Audio hasil compress terlalu besar.')
    }

    return await fs.readFile(outputFile)
  } finally {
    await fs.remove(inputFile).catch(() => {})
    await fs.remove(outputFile).catch(() => {})
  }
}

async function getThumb(url) {
  try {
    if (!url) return Buffer.alloc(0)

    const response = await request(url, {
      timeoutMs: 15000,
      retries: 1,
      headers: {
        Accept: 'image/avif,image/webp,image/apng,image/jpeg,image/png,image/*,*/*;q=0.8',
      },
    })

    const raw = Buffer.from(
      await response.arrayBuffer()
    )

    if (!raw.length) {
      return Buffer.alloc(0)
    }

    return await sharp(raw)
      .rotate()
      .resize(640, 640, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({
        quality: 78,
        chromaSubsampling: '4:2:0',
      })
      .toBuffer()
  } catch {
    return Buffer.alloc(0)
  }
}

function createMusicPlayer({
  title,
  artist,
  duration,
  audioSrc,
  imageSrc,
  lyrics,
}) {
  const safeTitle = escapeHtml(title)
  const safeArtist = escapeHtml(artist)
  const safeDuration = escapeHtml(duration || '0:00')

  const safeImage =
    imageSrc ||
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzFhMGQxMiIvPjx0ZXh0IHg9IjIwMCIgeT0iMjEwIiBmb250LXNpemU9IjM0IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UTJQTEFZPC90ZXh0Pjwvc3ZnPg=='

  const lyricsJson = Buffer.from(
    JSON.stringify(
      Array.isArray(lyrics) ? lyrics : []
    ),
    'utf8'
  ).toString('base64')

  return `
<style>
:root{--ink:#fff;--muted:#b9b1b6;--sys:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{background:transparent;color:var(--ink);font-family:var(--sys);-webkit-font-smoothing:antialiased}
.wrap{display:flex;align-items:center;justify-content:center;padding:10px}
.player{position:relative;width:100%;max-width:330px;border-radius:18px;overflow:hidden;background:#1a0d12;box-shadow:0 18px 40px rgba(0,0,0,.5)}
.bg{position:absolute;inset:-30%;width:160%;height:160%;object-fit:cover;filter:blur(38px) saturate(1.5);opacity:.85;z-index:0}
.veil{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(20,8,12,.65) 0%,rgba(20,8,12,.8) 45%,rgba(12,5,8,.96) 100%)}
.content{position:relative;z-index:2;padding:16px 18px 18px}
.head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px}
.head__icon{width:18px;height:18px;color:var(--ink);opacity:.85;flex:none}
.head__mid{text-align:center;flex:1;min-width:0}
.head__from{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.head__album{font-size:12px;font-weight:600;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.poster{width:100%;aspect-ratio:1;border-radius:10px;overflow:hidden;background:rgba(255,255,255,.06);box-shadow:0 12px 26px rgba(0,0,0,.45);margin-bottom:14px}
.poster img{width:100%;height:100%;object-fit:cover;display:block}
.info{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px}
.info__names{min-width:0}
.info__title{font-size:17px;font-weight:600;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.info__artist{font-size:12px;color:var(--muted);margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.info__heart{width:34px;height:34px;flex:none;display:flex;align-items:center;justify-content:center;background:none;border:none;color:var(--muted);cursor:pointer;padding:0;font-size:23px}
.info__heart.is-on{color:#ff5c8a}
.mini-lyrics{position:relative;height:82px;overflow-x:hidden;overflow-y:auto;scrollbar-width:none;margin-bottom:10px;scroll-behavior:auto;mask-image:linear-gradient(180deg,transparent 0%,black 18%,black 82%,transparent 100%);-webkit-mask-image:linear-gradient(180deg,transparent 0%,black 18%,black 82%,transparent 100%)}
.mini-lyrics::-webkit-scrollbar{display:none}
.lyrics-text{width:100%;padding:32px 0;display:flex;flex-direction:column;gap:5px}
.lyric-line{font-size:10.5px;color:rgba(255,255,255,.4);line-height:1.4;transition:color .25s ease,font-size .25s ease,opacity .25s ease,transform .25s ease;text-align:left;white-space:normal;overflow-wrap:anywhere;font-weight:500;opacity:.75}
.lyric-line.is-active{font-size:12px;color:#fff;font-weight:700;opacity:1;transform:translateX(2px) scale(1.01)}
.lyrics-empty{font-size:10.5px;color:var(--muted);text-align:left;padding:16px 0}
.bar{position:relative;height:4px;border-radius:4px;background:rgba(255,255,255,.22);cursor:pointer;margin-bottom:6px;touch-action:none}
.bar__fill{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:4px;background:#fff;pointer-events:none}
.bar__dot{position:absolute;top:50%;left:0;width:11px;height:11px;border-radius:50%;background:#fff;transform:translate(-50%,-50%);pointer-events:none}
.time{display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:12px;font-variant-numeric:tabular-nums}
.controls{display:flex;align-items:center;justify-content:space-between}
.ctrl{width:34px;height:34px;display:flex;align-items:center;justify-content:center;color:var(--ink);background:none;border:none;cursor:pointer;padding:0;font-size:20px}
.ctrl:disabled{opacity:.5;cursor:default}
.play{width:52px;height:52px;border-radius:50%;background:#fff;color:#12070b;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex:none;padding:0;box-shadow:0 6px 16px rgba(0,0,0,.4);font-size:22px}
.note{margin-top:12px;text-align:center;font-size:10px;color:var(--muted);line-height:1.6}
</style>

<div class="wrap">
<div class="player">
<img class="bg" src="${escapeAttr(safeImage)}" alt="">
<div class="veil"></div>
<div class="content">

<div class="head">
<div class="head__icon">♫</div>
<div class="head__mid">
<div class="head__from">YT Music Audio</div>
<div class="head__album">${safeArtist}</div>
</div>
<div class="head__icon">⋮</div>
</div>

<div class="poster">
<img src="${escapeAttr(safeImage)}" alt="${escapeAttr(safeTitle)}">
</div>

<div class="info">
<div class="info__names">
<div class="info__title">${safeTitle}</div>
<div class="info__artist">${safeArtist}</div>
</div>
<button class="info__heart" id="heart" aria-label="Favorite">♡</button>
</div>

<div class="mini-lyrics" id="mini-lyrics">
<div class="lyrics-text" id="lyrics-text"></div>
</div>

<div class="bar" id="bar">
<div class="bar__fill" id="fill"></div>
<div class="bar__dot" id="dot"></div>
</div>

<div class="time">
<span id="cur">0:00</span>
<span id="dur">${safeDuration}</span>
</div>

<div class="controls">
<button class="ctrl" disabled>♫</button>
<button class="ctrl" id="btn-rw" aria-label="Mundur 10 detik">↶</button>

<button class="play" id="play" aria-label="Play">
<span id="icon-play">▶</span>
<span id="icon-pause" style="display:none">Ⅱ</span>
</button>

<button class="ctrl" id="btn-fw" aria-label="Maju 10 detik">↷</button>
<button class="ctrl" disabled>↻</button>
</div>

<div class="note">support terus kami yaaa</div>

</div>
</div>
</div>

<audio id="audio" preload="metadata" src="${escapeAttr(audioSrc)}"></audio>

<script>
(function(){
'use strict';

const audio=document.getElementById('audio');
const play=document.getElementById('play');
const bar=document.getElementById('bar');
const fill=document.getElementById('fill');
const dot=document.getElementById('dot');
const cur=document.getElementById('cur');
const dur=document.getElementById('dur');
const heart=document.getElementById('heart');
const iconPlay=document.getElementById('icon-play');
const iconPause=document.getElementById('icon-pause');
const lyricsContainer=document.getElementById('mini-lyrics');
const lyricsText=document.getElementById('lyrics-text');
const btnRw=document.getElementById('btn-rw');
const btnFw=document.getElementById('btn-fw');

let lyrics=[];

try{
const binary=atob('${lyricsJson}');
const bytes=new Uint8Array(binary.length);

for(let i=0;i<binary.length;i++){
bytes[i]=binary.charCodeAt(i);
}

const parsed=JSON.parse(
new TextDecoder('utf-8').decode(bytes)
);

if(Array.isArray(parsed)){
lyrics=parsed
.filter(x=>x&&Number.isFinite(Number(x.time)))
.map(x=>({
time:Number(x.time),
text:String(x.text||'♪')
}))
.sort((a,b)=>a.time-b.time);
}
}catch{}

const lyricElements=[];

function renderLyrics(){
lyricsText.innerHTML='';
lyricElements.length=0;

if(!lyrics.length){
lyricsText.innerHTML='<div class="lyrics-empty">Lirik belum tersedia untuk lagu ini.</div>';
return;
}

const fragment=document.createDocumentFragment();

lyrics.forEach((line,index)=>{
const el=document.createElement('div');
el.className='lyric-line';
el.dataset.index=String(index);
el.textContent=line.text||'♪';
fragment.appendChild(el);
lyricElements.push(el);
});

lyricsText.appendChild(fragment);
}

renderLyrics();

let active=-1;

function findIndex(time){
if(!lyrics.length)return-1;

let low=0;
let high=lyrics.length-1;
let result=-1;

while(low<=high){
const mid=Math.floor((low+high)/2);

if(lyrics[mid].time<=time){
result=mid;
low=mid+1;
}else{
high=mid-1;
}
}

return result;
}

function updateLyrics(time,immediate){
if(!lyrics.length||!lyricElements.length)return;

const index=findIndex(
Number(time)||0
);

if(index===active&&!immediate)return;

active=index;

lyricElements.forEach((el,i)=>{
el.classList.toggle(
'is-active',
i===index
);
});

if(index>=0){
const el=lyricElements[index];

const target=Math.max(
0,
el.offsetTop-
(lyricsContainer.clientHeight/2)+
(el.offsetHeight/2)
);

lyricsContainer.scrollTop=target;
}
}

function formatTime(sec){
sec=Number(sec);

if(!Number.isFinite(sec)||sec<0){
return'0:00';
}

const h=Math.floor(sec/3600);
const m=Math.floor((sec%3600)/60);
const s=Math.floor(sec%60);

return h>0
?h+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')
:m+':'+String(s).padStart(2,'0');
}

function update(){
const duration=Number(audio.duration);

if(!Number.isFinite(duration)||duration<=0){
return;
}

const current=Math.max(
0,
Math.min(
duration,
Number(audio.currentTime)||0
)
);

const percent=current/duration*100;

fill.style.width=percent+'%';
dot.style.left=percent+'%';
cur.textContent=formatTime(current);

updateLyrics(current,false);
}

play.addEventListener('click',async()=>{
try{
if(audio.paused){
await audio.play();
iconPlay.style.display='none';
iconPause.style.display='inline';
}else{
audio.pause();
iconPlay.style.display='inline';
iconPause.style.display='none';
}
}catch{
iconPlay.style.display='inline';
iconPause.style.display='none';
}
});

heart.addEventListener('click',()=>{
heart.classList.toggle('is-on');
heart.textContent=
heart.classList.contains('is-on')
?'♥'
:'♡';
});

btnRw.addEventListener('click',()=>{
const duration=Number(audio.duration);

if(!Number.isFinite(duration)||duration<=0){
return;
}

audio.currentTime=Math.max(
0,
(Number(audio.currentTime)||0)-10
);

updateLyrics(
audio.currentTime,
true
);

update();
});

btnFw.addEventListener('click',()=>{
const duration=Number(audio.duration);

if(!Number.isFinite(duration)||duration<=0){
return;
}

audio.currentTime=Math.min(
duration,
(Number(audio.currentTime)||0)+10
);

updateLyrics(
audio.currentTime,
true
);

update();
});

bar.addEventListener('pointerdown',event=>{
const duration=Number(audio.duration);

if(!Number.isFinite(duration)||duration<=0){
return;
}

const rect=bar.getBoundingClientRect();

if(!rect.width){
return;
}

const x=Math.max(
0,
Math.min(
event.clientX-rect.left,
rect.width
)
);

audio.currentTime=
x/rect.width*duration;

updateLyrics(
audio.currentTime,
true
);

update();
});

audio.addEventListener('loadedmetadata',()=>{
if(Number.isFinite(audio.duration)){
dur.textContent=
formatTime(audio.duration);
}

update();
});

audio.addEventListener('durationchange',()=>{
if(Number.isFinite(audio.duration)){
dur.textContent=
formatTime(audio.duration);
}
});

audio.addEventListener(
'timeupdate',
update
);

audio.addEventListener('play',()=>{
iconPlay.style.display='none';
iconPause.style.display='inline';
});

audio.addEventListener('pause',()=>{
iconPlay.style.display='inline';
iconPause.style.display='none';
});

audio.addEventListener('ended',()=>{
iconPlay.style.display='inline';
iconPause.style.display='none';
fill.style.width='0%';
dot.style.left='0%';
cur.textContent='0:00';
updateLyrics(0,true);
});

})();
</script>
`
}

async function sendMusicPlayer(conn, m, html) {
  const responseId = randomUUID()

  const payload = {
    response_id: responseId,
    sections: [
      {
        view_model: {
          primitive: {
            __typename: 'GenAIaeacdsnwHtmlPrimitive',
            payload: html,
            trusted_sources: [],
          },
          __typename: 'GenAISingleLayoutViewModel',
        },
      },
    ],
  }

  await conn.relayMessage(
    m.chat,
    {
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2,
        botMetadata: {
          messageDisclaimerText: '',
          botResponseId: responseId,
        },
      },
      botForwardedMessage: {
        message: {
          richResponseMessage: {
            messageType: 1,
            submessages: [
              {
                messageType: 2,
                messageText: 'Music Player',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify(payload)
              ).toString('base64'),
            },
            contextInfo: {
              forwardingScore: 1,
              isForwarded: true,
              forwardedAiBotMessageInfo: {
                botJid: '867051314767696@bot',
              },
              forwardOrigin: 4,
            },
          },
        },
      },
    },
    {
      messageId: responseId,
    }
  )
}

const handler = async (m, { conn, usedPrefix }) => {
  const input = clean(m.text)
  const commandName = clean(m.command) || 'play2'

  if (!input) {
    m.limit?.fail()

    return m.reply(
      `Contoh:\n${usedPrefix}${commandName} another love tom odell`
    )
  }

  try {
    await conn.sendMessage(
      m.chat,
      {
        react: {
          text: '🎧',
          key: m.raw.key,
        },
      }
    )
  } catch {}

  try {
    let ytUrl = input
    let title = 'Unknown'
    let artist = 'Unknown Artist'
    let durationSec = 0
    let thumbUrl = ''
    let album = ''

    if (isYouTube(input)) {
      const info = await getYouTubeInfo(input)

      ytUrl = `https://www.youtube.com/watch?v=${info.videoId}`
      title = info.title
      artist = info.artist
      durationSec = info.duration
      thumbUrl = info.thumbnail
      album = info.album
    } else {
      const songs = await searchYouTube(input)
      const track = songs[0]

      if (!track?.videoId) {
        throw new Error('Lagu tidak ditemukan di YouTube.')
      }

      ytUrl = `https://www.youtube.com/watch?v=${track.videoId}`
      title = track.title || 'Unknown'
      artist = track.artist || 'Unknown Artist'
      durationSec = Number(track.duration || 0)
      thumbUrl = track.thumbnail || `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg`
      album = track.album || ''
    }

    let syncedLyrics = []

    const lrclib = await getLRCLyrics({
      title,
      artist,
      duration: durationSec,
      album,
    })

    if (lrclib?.syncedLyrics) {
      syncedLyrics = parseSyncedLyrics(
        lrclib.syncedLyrics
      )
    }

    if (!syncedLyrics.length && lrclib?.plainLyrics) {
      syncedLyrics = plainLyricsToSynced(
        lrclib.plainLyrics,
        durationSec
      )
    }

    syncedLyrics = normalizeLyrics(
      syncedLyrics
    )

    const thumb = await getThumb(
      thumbUrl
    )

    const imageSrc = thumb.length
      ? `data:image/jpeg;base64,${thumb.toString('base64')}`
      : ''

    const originalBuffer = await getAudioBuffer(
      ytUrl
    )

    const compressedBuffer = await compressAudio(
      originalBuffer
    )

    const audioSrc =
      `data:audio/ogg;base64,${compressedBuffer.toString('base64')}`

    if (
      Buffer.byteLength(
        audioSrc,
        'utf8'
      ) > COMPRESSED_AUDIO_HARD_LIMIT
    ) {
      throw new Error(
        'Audio player terlalu besar.'
      )
    }

    const html = createMusicPlayer({
      title,
      artist,
      duration: formatDuration(
        durationSec
      ),
      audioSrc,
      imageSrc,
      lyrics: syncedLyrics,
    })

    await sendMusicPlayer(
      conn,
      m,
      html
    )

    m.limit?.success()

    try {
      await conn.sendMessage(
        m.chat,
        {
          react: {
            text: '✅',
            key: m.raw.key,
          },
        }
      )
    } catch {}
  } catch (error) {
    m.limit?.fail()

    try {
      await conn.sendMessage(
        m.chat,
        {
          react: {
            text: '❌',
            key: m.raw.key,
          },
        }
      )
    } catch {}

    const message = clean(
      error?.message ||
      'Unknown error'
    ).slice(0, 700)

    await conn.sendMessage(
      m.chat,
      {
        text:
          `❌ Gagal memproses lagu.\n\n> ${message}`,
      },
      {
        quoted: m.raw,
      }
    )
  }
}

handler.command = /^play2$/i
handler.help = ['play2']
handler.tags = ['download']
handler.category = 'download'
handler.description = 'YouTube Music player dengan lirik sinkron, SaveTube, FFmpeg dan HTML Player'
handler.limit = true
handler.limitCommit = 'manual'

export default handler