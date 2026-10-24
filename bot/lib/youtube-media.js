/* By AlzRiss - Usanagi Umi AI
 *
 * Satu pintu unduhan YouTube untuk semua plugin (.ytmp3, .ytmp4, .playvideo).
 *
 * Kenapa modul ini ada (hasil uji nyata di server 22/10/2026):
 *  - Plugin lama memakai API api-faa lalu mengunduh URL-nya TANPA Referer/UA,
 *    hasilnya 403 Forbidden.
 *  - yt-dlp di server ada dan sehat, tetapi YouTube menjawab
 *    "Sign in to confirm you're not a bot" untuk semua player_client karena IP
 *    server adalah IP datacenter. Perbaikannya: cookies (kalau owner menyediakan
 *    data/cookies.txt) atau proxy; tanpa itu yt-dlp tidak bisa dipakai.
 *  - SaveTube masih bisa mengunduh AUDIO dari IP server (HTTP 206), tetapi
 *    video selalu "Failed to get download URL".
 *  - api-faa masih bisa mengunduh VIDEO (HTTP 206 video/mp4) asalkan permintaan
 *    membawa Referer + User-Agent yang wajar.
 *
 * Urutan sumber di modul ini mengikuti hasil uji tersebut, dan setiap kegagalan
 * dicatat lengkap supaya laporan error menyebut penyebab sebenarnya.
 */

import fs from 'fs-extra'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const LIB_DIR = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(LIB_DIR, '..')
const LOCAL_BIN = path.join(PROJECT_ROOT, 'bin', process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp')
const RELEASE_ASSET = process.platform === 'linux'
  ? (process.arch === 'arm64' ? 'yt-dlp_linux_aarch64' : 'yt-dlp_linux')
  : process.platform === 'darwin'
    ? 'yt-dlp_macos'
    : process.platform === 'win32' ? 'yt-dlp.exe' : ''

const DEFAULT_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36'
const MOBILE_UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
const YT_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be', 'www.youtu.be'])

const FAA_ENDPOINTS = {
  audio: 'https://api-faa.my.id/faa/ytmp3',
  video: 'https://api-faa.my.id/faa/ytmp4'
}

/* ---------------------------------------------------------------- util */

export function isYoutubeUrl(value) {
  try {
    const url = new URL(String(value || '').trim())
    return YT_HOSTS.has(url.hostname.toLowerCase())
  } catch {
    return false
  }
}

export function extractVideoId(value) {
  const text = String(value || '').trim()
  try {
    const url = new URL(text)
    if (url.hostname.replace(/^www\./, '') === 'youtu.be') {
      return url.pathname.split('/').filter(Boolean)[0] || ''
    }
    const v = url.searchParams.get('v')
    if (v) return v
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts[0] === 'shorts' || parts[0] === 'embed' || parts[0] === 'live') return parts[1] || ''
  } catch {}
  return /^[A-Za-z0-9_-]{11}$/.test(text) ? text : ''
}

function safeName(value, fallback = 'youtube') {
  return String(value || fallback)
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 90) || fallback
}

function tempBase(prefix) {
  return path.join(os.tmpdir(), `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`)
}

function fileSize(file) {
  try { return fs.statSync(file).size } catch { return 0 }
}

function timeoutController(ms) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  return { controller, done: () => clearTimeout(timer) }
}

/* ------------------------------------------------------------ binary */

function runBinary(command, args, timeoutMs = 30000) {
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
      if (settled) return
      settled = true
      try { child.kill('SIGKILL') } catch {}
      reject(new Error(`${path.basename(command)} melebihi ${Math.round(timeoutMs / 1000)} detik.`))
    }, timeoutMs)

    child.stdout?.on('data', chunk => { stdout += chunk.toString() })
    child.stderr?.on('data', chunk => { stderr += chunk.toString() })
    child.on('error', error => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      reject(error.code === 'ENOENT' ? Object.assign(new Error('tidak ditemukan'), { code: 'ENOENT' }) : error)
    })
    child.on('close', code => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (code === 0) resolve({ stdout, stderr })
      else reject(Object.assign(new Error((stderr || stdout).trim().slice(-500) || `keluar dengan kode ${code}`), { code }))
    })
  })
}

function binaryCandidates(kind) {
  const configured = kind === 'ytdlp' ? global.youtubeDownloader?.ytDlpPath : global.youtubeDownloader?.ffmpegPath
  return [
    String(configured || '').trim(),
    process.env[kind === 'ytdlp' ? 'YTDLP_PATH' : 'FFMPEG_PATH'] || '',
    kind === 'ytdlp' ? LOCAL_BIN : path.join(PROJECT_ROOT, 'bin', process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'),
    kind === 'ytdlp' ? '/usr/local/bin/yt-dlp' : '/usr/local/bin/ffmpeg',
    kind === 'ytdlp' ? '/usr/bin/yt-dlp' : '/usr/bin/ffmpeg',
    path.join(os.homedir(), '.local', 'bin', kind === 'ytdlp' ? 'yt-dlp' : 'ffmpeg'),
    kind === 'ytdlp' ? 'yt-dlp' : 'ffmpeg'
  ].filter(Boolean)
}

const cache = { ytdlp: null, ffmpeg: null, ytdlpVersion: '', ffmpegVersion: '', attempts: [] }

export async function resolveFfmpeg({ refresh = false } = {}) {
  if (cache.ffmpeg && !refresh) return cache.ffmpeg

  const packaged = []
  for (const name of ['@ffmpeg-installer/ffmpeg', 'ffmpeg-static']) {
    try {
      const mod = await import(name)
      const value = mod?.default?.path || mod?.path || mod?.default || ''
      if (typeof value === 'string' && value) packaged.push(value)
    } catch {}
  }

  for (const candidate of [...packaged, ...binaryCandidates('ffmpeg')]) {
    try {
      const { stdout } = await runBinary(candidate, ['-version'], 15000)
      if (/ffmpeg version/i.test(stdout)) {
        cache.ffmpeg = candidate
        cache.ffmpegVersion = stdout.split('\n')[0].trim()
        return candidate
      }
    } catch {}
  }
  cache.ffmpeg = ''
  return ''
}

export async function resolveYtDlp({ refresh = false } = {}) {
  if (cache.ytdlp && !refresh) return cache.ytdlp
  const attempts = []
  for (const candidate of binaryCandidates('ytdlp')) {
    try {
      const { stdout } = await runBinary(candidate, ['--version'], 20000)
      const version = stdout.trim().split('\n')[0]
      if (/^[\d.]+/.test(version)) {
        cache.ytdlp = candidate
        cache.ytdlpVersion = version
        cache.attempts = attempts
        return candidate
      }
      attempts.push(`${candidate}: keluaran tidak dikenal`)
    } catch (error) {
      attempts.push(`${candidate}: ${error.code || error.message}`)
    }
  }
  cache.ytdlp = ''
  cache.attempts = attempts
  return ''
}

/** Unduh binary yt-dlp terbaru dari GitHub (dipakai bila binary lama gagal). */
async function downloadFreshYtDlp() {
  if (!RELEASE_ASSET) throw new Error(`tidak ada binary yt-dlp untuk ${process.platform}/${process.arch}`)
  const { controller, done } = timeoutController(180000)
  try {
    const response = await fetch(`https://github.com/yt-dlp/yt-dlp/releases/latest/download/${RELEASE_ASSET}`, {
      redirect: 'follow',
      signal: controller.signal
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const buffer = Buffer.from(await response.arrayBuffer())
    if (buffer.length < 1_000_000) throw new Error('berkas hasil unduhan terlalu kecil')
    await fs.ensureDir(path.dirname(LOCAL_BIN))
    await fs.writeFile(LOCAL_BIN, buffer, { mode: 0o755 })
    try { await fs.chmod(LOCAL_BIN, 0o755) } catch {}
    const { stdout } = await runBinary(LOCAL_BIN, ['--version'], 30000)
    cache.ytdlp = LOCAL_BIN
    cache.ytdlpVersion = stdout.trim()
    return LOCAL_BIN
  } finally {
    done()
  }
}

/* ------------------------------------------------------- konfigurasi */

function cookiesFile() {
  const configured = [
    global.youtubeDownloader?.cookiesFile,
    process.env.YTDLP_COOKIES,
    path.join(PROJECT_ROOT, 'data', 'cookies.txt')
  ].filter(value => typeof value === 'string' && value.trim())

  for (const candidate of configured) {
    try {
      const resolved = path.resolve(candidate)
      if (fs.existsSync(resolved) && fs.statSync(resolved).size > 100) return resolved
    } catch {}
  }
  return ''
}

function proxyUrl() {
  const value = global.youtubeDownloader?.proxy || process.env.YTDLP_PROXY || ''
  return typeof value === 'string' ? value.trim() : ''
}

const BOT_CHECK = /sign in to confirm|not a bot|confirm you.{0,3}re not a bot/i

async function ytdlp(args, { timeoutMs = 240000, bin } = {}) {
  const executable = bin || (await resolveYtDlp())
  if (!executable) throw new Error('yt-dlp tidak ditemukan di server')
  return runBinary(executable, args, timeoutMs)
}

/* ------------------------------------------------------------ SaveTube */

const SAVETUBE_KEY = Buffer.from('C5D58EF67A7584E4A29F6C35BBC4EB12', 'hex')

function decryptSaveTube(payload) {
  const data = Buffer.from(payload, 'base64')
  const decipher = crypto.createDecipheriv('aes-128-cbc', SAVETUBE_KEY, data.subarray(0, 16))
  return JSON.parse(Buffer.concat([decipher.update(data.subarray(16)), decipher.final()]).toString())
}

export async function saveTubeLink(videoId, kind = 'mp3', { quality = '' } = {}) {
  const headers = { 'User-Agent': MOBILE_UA, Referer: 'https://save-tube.com/', 'Content-Type': 'application/json' }

  const cdnResponse = await fetch('https://media.savetube.vip/api/random-cdn', { headers })
  if (!cdnResponse.ok) throw new Error(`SaveTube CDN HTTP ${cdnResponse.status}`)
  const { cdn } = await cdnResponse.json()
  if (!cdn) throw new Error('SaveTube tidak memberi CDN')

  const infoResponse = await fetch(`https://${cdn}/v2/info`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ url: `https://www.youtube.com/watch?v=${videoId}` })
  })
  if (!infoResponse.ok) throw new Error(`SaveTube info HTTP ${infoResponse.status}`)
  const infoRaw = await infoResponse.json()
  if (!infoRaw?.data) throw new Error(infoRaw?.message || 'SaveTube tidak memberi data')
  const info = decryptSaveTube(infoRaw.data)

  const chosenQuality = kind === 'mp3'
    ? '128'
    : String(quality || global.youtubeDownloader?.saveTubeVideoQuality || '360')

  const downloadResponse = await fetch(`https://${cdn}/download`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      downloadType: kind === 'mp3' ? 'audio' : 'video',
      quality: chosenQuality,
      key: info.key
    })
  })
  if (!downloadResponse.ok) throw new Error(`SaveTube download HTTP ${downloadResponse.status}`)
  const payload = await downloadResponse.json()
  const url = payload?.data?.downloadUrl
  if (!url) throw new Error(payload?.message || 'SaveTube tidak memberi URL unduhan')

  return {
    url,
    title: info.title || '',
    duration: Number(info.duration) || 0,
    thumbnail: info.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
  }
}

/* -------------------------------------------------------------- api-faa */

function pickDownloadUrl(payload) {
  const direct = [
    payload?.result?.download_url,
    payload?.result?.url,
    payload?.result?.download,
    payload?.data?.download_url,
    payload?.data?.url,
    payload?.url,
    payload?.download_url
  ].find(value => typeof value === 'string' && /^https?:\/\//.test(value))
  if (direct) return direct

  const stack = [payload]
  const seen = new Set()
  while (stack.length) {
    const node = stack.pop()
    if (!node || typeof node !== 'object' || seen.has(node)) continue
    seen.add(node)
    for (const value of Object.values(node)) {
      if (typeof value === 'string' && /^https?:\/\/\S+\.(mp4|m4a|mp3|webm)(\?|$)/i.test(value)) return value
      if (value && typeof value === 'object') stack.push(value)
    }
  }
  return ''
}

async function faaResolve(type, watchUrl) {
  const endpoint = FAA_ENDPOINTS[type]
  if (!endpoint) throw new Error('endpoint api-faa tidak dikenal')
  const { controller, done } = timeoutController(45000)
  try {
    const response = await fetch(`${endpoint}?url=${encodeURIComponent(watchUrl)}`, {
      headers: { 'User-Agent': MOBILE_UA, Accept: 'application/json', Referer: 'https://api-faa.my.id/' },
      signal: controller.signal
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const payload = await response.json()
    if (payload?.status === false) throw new Error(payload?.message || payload?.error || 'api-faa menolak')
    const url = pickDownloadUrl(payload)
    if (!url) throw new Error('URL media tidak ada di respons api-faa')
    return {
      url,
      title: payload?.result?.title || payload?.title || '',
      thumbnail: payload?.result?.thumbnail || payload?.thumbnail || ''
    }
  } finally {
    done()
  }
}

/* -------------------------------------------------------- unduh berkas */

async function saveToFile(url, file, { maxBytes, timeoutMs = 180000, kind = 'media' } = {}) {
  const { controller, done } = timeoutController(timeoutMs)
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': DEFAULT_UA,
        Accept: kind === 'audio' ? 'audio/mpeg,audio/*,*/*' : 'video/mp4,video/*,*/*',
        Referer: 'https://www.youtube.com/',
        Range: 'bytes=0-'
      },
      redirect: 'follow',
      signal: controller.signal
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const type = (response.headers.get('content-type') || '').toLowerCase()
    if (type.includes('text/html') || type.includes('application/json')) {
      throw new Error(`server mengirim ${type}, bukan media`)
    }

    const declared = Number(response.headers.get('content-length') || 0)
    if (maxBytes && declared && declared > maxBytes) {
      throw new Error(`ukuran ${(declared / 1048576).toFixed(1)} MB melebihi batas ${(maxBytes / 1048576).toFixed(0)} MB`)
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    if (!buffer.length) throw new Error('berkas kosong')
    if (maxBytes && buffer.length > maxBytes) {
      throw new Error(`ukuran ${(buffer.length / 1048576).toFixed(1)} MB melebihi batas ${(maxBytes / 1048576).toFixed(0)} MB`)
    }

    await fs.writeFile(file, buffer)
    return buffer.length
  } catch (error) {
    if (error.name === 'AbortError') throw new Error(`unduhan melebihi ${Math.round(timeoutMs / 1000)} detik`)
    throw error
  } finally {
    done()
  }
}

/* ------------------------------------------------------------ publik */

export async function probeYoutube(url) {
  const id = extractVideoId(url)
  if (!id) throw new Error('URL YouTube tidak valid')
  const watch = `https://www.youtube.com/watch?v=${id}`
  const thumbnail = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

  const base = { id, title: '', duration: 0, thumbnail, uploader: '' }

  try {
    const { stdout } = await ytdlp([
      '-J', '--no-warnings', '--no-playlist', '--socket-timeout', '20',
      ...(cookiesFile() ? ['--cookies', cookiesFile()] : []),
      ...(proxyUrl() ? ['--proxy', proxyUrl()] : []),
      watch
    ], { timeoutMs: 60000 })
    const data = JSON.parse(stdout)
    return {
      ...base,
      title: data.title || '',
      duration: Number(data.duration) || 0,
      thumbnail: data.thumbnail || thumbnail,
      uploader: data.uploader || ''
    }
  } catch (error) {
    // Metadata masih bisa diambil lewat oEmbed walau yt-dlp diblokir.
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(watch)}&format=json`, {
        headers: { 'User-Agent': DEFAULT_UA }
      })
      if (response.ok) {
        const data = await response.json()
        return { ...base, title: data.title || '', uploader: data.author_name || '', thumbnail: data.thumbnail_url || thumbnail }
      }
    } catch {}
    return { ...base, probeError: error.message }
  }
}

/**
 * Unduh audio (mp3) atau video (mp4) ke berkas sementara.
 * @returns {{ file: string, title: string, provider: string, bytes: number, attempts: Array }}
 */
export async function downloadYoutube(url, {
  type = 'audio',
  maxBytes = 100 * 1024 * 1024,
  prefix = 'usanagi-yt',
  timeoutMs = 240000
} = {}) {
  const id = extractVideoId(url)
  if (!id) throw new Error('URL YouTube tidak valid')

  const watch = `https://www.youtube.com/watch?v=${id}`
  const isAudio = type === 'audio'
  const attempts = []
  const remember = (provider, error) => {
    const message = String(error?.message || error || 'gagal').replace(/\s+/g, ' ').trim().slice(0, 260)
    attempts.push({ provider, error: message })
    console.warn(`[youtube-media] ${type} ${id} · ${provider} gagal: ${message}`)
  }

  const workRoot = tempBase(prefix)
  await fs.ensureDir(workRoot)

  const finish = async (producedFile, provider, title = '') => {
    const target = `${tempBase(prefix)}.${path.extname(producedFile).slice(1) || (isAudio ? 'mp3' : 'mp4')}`
    await fs.move(producedFile, target, { overwrite: true })
    await fs.remove(workRoot).catch(() => {})
    return { file: target, provider, bytes: fileSize(target), title, attempts }
  }

  /* ── 1. yt-dlp (kualitas terbaik; butuh cookies bila IP diblokir) ───── */
  const ffmpeg = await resolveFfmpeg()
  const commonArgs = [
    '--no-playlist', '--no-warnings', '--no-progress',
    '--socket-timeout', '30',
    '--retries', '3', '--fragment-retries', '3', '--extractor-retries', '2',
    '--concurrent-fragments', '4',
    ...(ffmpeg ? ['--ffmpeg-location', ffmpeg] : []),
    ...(cookiesFile() ? ['--cookies', cookiesFile()] : []),
    ...(proxyUrl() ? ['--proxy', proxyUrl()] : [])
  ]

  const runYtDlp = async () => {
    const dir = path.join(workRoot, 'ytdlp')
    await fs.ensureDir(dir)
    const args = isAudio
      ? [watch, '-x', '--audio-format', 'mp3', '--audio-quality', '128K', '-f', 'ba/b', ...commonArgs]
      : [
          watch,
          // avc1+mp4a diprioritaskan supaya video bisa diputar WhatsApp di Android.
          '-f', [
            'bv*[height<=720][vcodec^=avc1]+ba[acodec^=mp4a]',
            'bv*[height<=720][vcodec^=avc1]+ba',
            'bv*[height<=720]+ba',
            'b[height<=720]',
            'b'
          ].join('/'),
          '--merge-output-format', 'mp4',
          '--remux-video', 'mp4',
          ...commonArgs
        ]

    await ytdlp([...args, '-o', path.join(dir, 'media.%(ext)s')], { timeoutMs })

    const names = (await fs.readdir(dir).catch(() => []))
      .filter(name => !/\.(part|ytdl|temp)$/i.test(name))
    const picked = names.find(name => name.toLowerCase().endsWith(`.${isAudio ? 'mp3' : 'mp4'}`)) || names[0]
    if (!picked) throw new Error('yt-dlp tidak menghasilkan berkas')

    const size = fileSize(path.join(dir, picked))
    if (!size) throw new Error('berkas hasil kosong')
    if (size > maxBytes) {
      throw Object.assign(
        new Error(`ukuran ${(size / 1048576).toFixed(1)} MB melebihi batas ${(maxBytes / 1048576).toFixed(0)} MB`),
        { tooLarge: true }
      )
    }
    return { produced: path.join(dir, picked), title: '' }
  }

  try {
    const { produced } = await runYtDlp()
    return await finish(produced, 'yt-dlp')
  } catch (error) {
    remember('yt-dlp', error)
    if (!cookiesFile() && !proxyUrl() && BOT_CHECK.test(String(error.message || ''))) {
      remember('yt-dlp-catatan', new Error('IP server ditolak YouTube; sementara memakai sumber lain. Pasang data/cookies.txt agar yt-dlp bisa dipakai lagi.'))
    }
  }

  /* ── 2a. VIDEO: api-faa (terbukti 206 dari server) ─────────────────── */
  if (!isAudio) {
    for (let round = 1; round <= 2; round += 1) {
      try {
        const link = await faaResolve('video', watch)
        const file = `${tempBase(prefix)}.mp4`
        const bytes = await saveToFile(link.url, file, { maxBytes, kind: 'video', timeoutMs: 180000 })
        return await finish(file, 'api-faa', link.title)
      } catch (error) {
        remember(`api-faa${round > 1 ? '-ulang' : ''}`, error)
      }
    }
  }

  /* ── 2b. AUDIO: SaveTube (terbukti 206 dari server) ───────────────── */
  if (isAudio) {
    try {
      const link = await saveTubeLink(id, 'mp3')
      const file = `${tempBase(prefix)}.mp3`
      const bytes = await saveToFile(link.url, file, { maxBytes, kind: 'audio', timeoutMs: 180000 })
      return await finish(file, 'savetube', link.title)
    } catch (error) {
      remember('savetube', error)
    }

    try {
      const link = await faaResolve('audio', watch)
      const file = `${tempBase(prefix)}.mp3`
      await saveToFile(link.url, file, { maxBytes, kind: 'audio', timeoutMs: 180000 })
      return await finish(file, 'api-faa', link.title)
    } catch (error) {
      remember('api-faa', error)
    }
  }

  /* ── 3. VIDEO: SaveTube sebagai usaha terakhir ─────────────────────── */
  if (!isAudio) {
    try {
      const link = await saveTubeLink(id, 'video')
      const file = `${tempBase(prefix)}.mp4`
      await saveToFile(link.url, file, { maxBytes, kind: 'video', timeoutMs: 180000 })
      return await finish(file, 'savetube', link.title)
    } catch (error) {
      remember('savetube', error)
    }
  }

  await fs.remove(workRoot).catch(() => {})
  const detail = attempts
    .filter(item => item.provider !== 'yt-dlp-catatan')
    .map(item => `${item.provider}: ${item.error}`)
    .join(' · ')
  const failure = new Error(`Gagal mengunduh ${isAudio ? 'audio' : 'video'} YouTube. ${detail}`)
  failure.attempts = attempts
  failure.code = 'UMI_YTDL_FAILED'
  throw failure
}

/** Ringkasan lingkungan untuk panel owner / debugging. */
export async function youtubeEnvironment() {
  const ytdlpBin = await resolveYtDlp()
  const ffmpegBin = await resolveFfmpeg()
  return {
    ytdlp: ytdlpBin || null,
    ytdlpVersion: cache.ytdlpVersion || null,
    ytdlpAttempts: cache.attempts || [],
    ffmpeg: ffmpegBin || null,
    ffmpegVersion: cache.ffmpegVersion || null,
    cookies: cookiesFile() || null,
    proxy: proxyUrl() || null,
    tmpdir: os.tmpdir(),
    platform: `${process.platform}/${process.arch}`
  }
}

/**
 * Diagnosis nyata (bukan laporan kira-kira): coba unduh audio + video
 * berukuran kecil, ukur waktu dan hasilnya, kembalikan detail tiap langkah.
 */
export async function diagnoseYoutube(url, { limitBytes = 12 * 1024 * 1024, timeoutMs = 240000, onStep = null } = {}) {
  if (!isYoutubeUrl(url)) throw new Error('Hanya URL YouTube yang bisa didiagnosis')
  const steps = []
  const report = { url, at: new Date().toISOString(), steps, running: true }

  const push = async step => {
    steps.push(step)
    if (typeof onStep === 'function') {
      try { await onStep(report) } catch {}
    }
  }

  const env = await youtubeEnvironment()
  await push({ step: 'environment', ok: Boolean(env.ytdlp), detail: env })

  const probe = await probeYoutube(url)
  await push({ step: 'probe', ok: Boolean(probe.title), detail: probe })

  for (const type of ['audio', 'video']) {
    const started = Date.now()
    try {
      const result = await downloadYoutube(url, { type, maxBytes: limitBytes, prefix: `diag-${type}`, timeoutMs })
      await push({
        step: `download-${type}`,
        ok: true,
        ms: Date.now() - started,
        detail: { provider: result.provider, bytes: result.bytes, title: result.title || '' }
      })
      await fs.remove(result.file).catch(() => {})
    } catch (error) {
      await push({
        step: `download-${type}`,
        ok: false,
        ms: Date.now() - started,
        detail: { message: error.message, attempts: error.attempts || [] }
      })
    }
  }

  report.running = false
  report.finishedAt = new Date().toISOString()
  if (typeof onStep === 'function') {
    try { await onStep(report) } catch {}
  }
  return report
}

export { safeName as sanitizeYoutubeName }

export default {
  isYoutubeUrl,
  extractVideoId,
  probeYoutube,
  downloadYoutube,
  saveTubeLink,
  youtubeEnvironment,
  diagnoseYoutube,
  resolveFfmpeg,
  resolveYtDlp
}
