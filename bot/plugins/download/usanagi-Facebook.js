
import fs from 'fs-extra'
import path from 'node:path'
import { runYtDlp, getFfmpegLocationArgs, ytdlpTempBase } from '../../lib/awang-ytdlp.js'
import { prepareYtDlpVideo, prepareRemoteWhatsAppVideo, probeRemoteWhatsAppVideo } from '../../lib/awang-video-compat.js'

const MAX_VIDEO = 2 * 1024 * 1024 * 1024

const API_URL = 'https://gateway.gencipta.com/api/downloader/facebook'
const API_KEY = process.env.USANAGI_FACEBOOK_KEY || 'YOUR_GENCIPTA_API_KEY'
const FB_DOWNLOADER = 'https://fbdownloader.to'
const MAX_RESOLVE_MS = 150000
const FACEBOOK_UA = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_voiced.html)'

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
  } catch {}
}

function isFacebookUrl(url) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '')
    return host === 'facebook.com' || host === 'm.facebook.com' || host === 'fb.watch'
  } catch {
    return false
  }
}

function findMediaUrls(data) {
  const results = []
  const videoKeys = new Set([
    'video', 'video_url', 'videoUrl', 'hd', 'hd_url', 'hdUrl', 'sd', 'sd_url', 'sdUrl',
    'download_url', 'downloadUrl', 'media_url', 'mediaUrl', 'source', 'playable_url',
    'playable_url_quality_hd', 'browser_native_hd_url', 'browser_native_sd_url', 'hd_src', 'sd_src'
  ])
  const imageKeys = new Set(['image', 'image_url', 'imageUrl', 'photo', 'photo_url', 'photoUrl', 'thumbnail', 'cover'])

  const push = (url, type, quality = 0, width = 0, height = 0, bitrate = 0) => {
    if (!/^https?:\/\//i.test(String(url || ''))) return
    results.push({ type, url: String(url), quality, width, height, bitrate })
  }

  function scan(obj, depth = 0, keyName = '') {
    if (!obj || depth > 10) return
    if (typeof obj === 'string') {
      const urls = obj.match(/https?:\/\/[^\s"'<>]+/gi) || []
      for (const url of urls) {
        if (/\.(mp4|m4v|webm|mov)(?:[?#]|$)/i.test(url) || /video|facebook.*video/i.test(url)) push(url, 'video', 0, 0, 0, 0)
        else if (/\.(jpg|jpeg|png|webp|gif)(?:[?#]|$)/i.test(url) || /image|photo/i.test(url)) push(url, 'image')
      }
      return
    }
    if (Array.isArray(obj)) {
      for (const item of obj) scan(item, depth + 1, keyName)
      return
    }
    if (typeof obj !== 'object') return
    for (const [key, value] of Object.entries(obj)) {
      const lower = key.toLowerCase()
      if (typeof value === 'string' && /^https?:\/\//i.test(value)) {
        if (videoKeys.has(lower) || /video|playable.*url|stream/i.test(lower)) {
          const quality = Number(obj.quality || obj.height || obj.width || 0)
          push(value, 'video', quality, Number(obj.width || 0), Number(obj.height || 0), Number(obj.bitrate || 0))
          continue
        }
        if (imageKeys.has(lower) || /image|photo|thumbnail|cover/i.test(lower)) {
          push(value, 'image')
          continue
        }
      }
      scan(value, depth + 1, key)
    }
  }

  scan(data)
  const unique = []
  const seen = new Set()
  for (const item of results) {
    if (!item.url || seen.has(item.url)) continue
    seen.add(item.url)
    unique.push(item)
  }
  unique.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'video' ? -1 : 1
    const areaA = a.width * a.height
    const areaB = b.width * b.height
    if (areaA !== areaB) return areaB - areaA
    if (a.bitrate !== b.bitrate) return b.bitrate - a.bitrate
    return b.quality - a.quality
  })
  return unique
}

function cleanUrl(value) {
  return String(value || '').replace(/[\\\"'<>),.;]+$/g, '').trim()
}


function cleanHtml(value = '') {
  return String(value)
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
}

function extractVideoUrlsFromHtml(html = '') {
  const urls = []
  const raw = cleanHtml(String(html).replace(/\\u002F/gi, '/').replace(/\\u003A/gi, ':').replace(/\\u0026/gi, '&').replace(/\\\//g, '/'))
  const add = value => {
    if (!value) return
    let url = cleanUrl(value)
    try { url = decodeURIComponent(url) } catch {}
    if (/^https?:\/\//i.test(url) && (/(?:fbcdn|facebook).*?(?:video|playable|scontent)/i.test(url) || /\.(?:mp4|m4v)(?:[?#]|$)/i.test(url))) {
      if (!urls.includes(url)) urls.push(url)
    }
  }

  for (const key of ['playable_url_quality_hd', 'browser_native_hd_url', 'browser_native_sd_url', 'playable_url', 'hd_src', 'sd_src', 'video_url']) {
    const re = new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`, 'gi')
    for (const match of raw.matchAll(re)) add(match[1])
  }
  for (const match of raw.matchAll(/(?:data-videourl|data-video-url|href)=["']([^"']+)["']/gi)) add(match[1])
  for (const match of raw.matchAll(/https?:\/\/[^"'\s<>]+(?:\.mp4|video|playable)[^"'\s<>]*/gi)) add(match[0])
  return [...new Set(urls)]
}

async function fetchFacebookPage(input, { timeoutMs = 10000, signal } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const relay = () => controller.abort()
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', relay, { once: true })
  }
  try {
    const response = await fetch(input, {
      headers: {
        Accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'User-Agent': FACEBOOK_UA,
        Referer: 'https://www.facebook.com/',
      },
      redirect: 'follow',
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`Facebook HTTP ${response.status}`)
    const html = await response.text()
    return { html, finalUrl: response.url || input }
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('Facebook page timeout.')
    throw error
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener?.('abort', relay)
  }
}

async function expandFacebookUrl(input, signal) {
  try {
    const page = await fetchFacebookPage(input, { timeoutMs: 9000, signal })
    return page.finalUrl || input
  } catch {
    return input
  }
}

async function downloadViaFacebookPage(input, signal) {
  const page = await fetchFacebookPage(input, { timeoutMs: 12000, signal })
  const urls = extractVideoUrlsFromHtml(page.html)
  if (!urls.length) throw new Error('Video Facebook tidak ditemukan pada halaman.')
  return { media: urls.map(url => ({ type: 'video', url, quality: /hd|quality_hd|native_hd/i.test(url) ? 1080 : 480 })), title: 'Facebook', finalUrl: page.finalUrl }
}

async function getFbDownloaderToken(signal) {
  const page = await fetchFacebookPage(`${FB_DOWNLOADER}/id`, { timeoutMs: 10000, signal })
  const match = page.html.match(/k_exp\s*=\s*["'](.*?)["'][\s\S]*?k_token\s*=\s*["'](.*?)["']/i)
  if (!match) throw new Error('Token Facebook downloader tidak ditemukan.')
  return { k_exp: match[1], k_token: match[2] }
}

async function downloadViaFbDownloader(input, signal) {
  const { k_exp, k_token } = await getFbDownloaderToken(signal)
  const payload = new URLSearchParams({ k_exp, k_token, p: 'home', q: input, lang: 'id', v: 'v2', W: '' })
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  const relay = () => controller.abort()
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', relay, { once: true })
  }
  try {
    const response = await fetch(`${FB_DOWNLOADER}/api/ajaxSearch`, {
      method: 'POST',
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0',
        'X-Requested-With': 'XMLHttpRequest',
        Origin: FB_DOWNLOADER,
        Referer: `${FB_DOWNLOADER}/id`,
      },
      body: payload,
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`Facebook downloader HTTP ${response.status}`)
    const data = await response.json()
    if (!data?.data) throw new Error('Facebook downloader tidak menghasilkan data.')
    const html = String(data.data)
    const media = []
    const rowRe = /<td\s+class=["']video-quality["'][^>]*>([\s\S]*?)<\/td>[\s\S]*?(?:href=["']([^"']+)["']|data-videourl=["']([^"']+)["'])/gi
    for (const match of html.matchAll(rowRe)) {
      const quality = cleanHtml(match[1]).replace(/<[^>]+>/g, '').trim()
      const url = cleanUrl(match[2] || match[3] || '')
      if (/^https?:\/\//i.test(url)) media.push({ type: 'video', url, quality: /1080|hd/i.test(quality) ? 1080 : /720/i.test(quality) ? 720 : /480/i.test(quality) ? 480 : 360 })
    }
    const fallbackUrls = extractVideoUrlsFromHtml(html)
    for (const url of fallbackUrls) {
      if (!media.some(item => item.url === url)) media.push({ type: 'video', url, quality: 0 })
    }
    if (!media.length) throw new Error('Video Facebook tidak ditemukan pada resolver.')
    media.sort((a, b) => b.quality - a.quality)
    return { media, title: 'Facebook' }
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('Facebook downloader timeout.')
    throw error
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener?.('abort', relay)
  }
}

function getFacebookCookiePath() {
  const configured = String(process.env.USANAGI_FACEBOOK_COOKIES || '').trim()
  if (configured && fs.pathExistsSync(configured)) return configured
  const local = path.resolve(process.cwd(), 'storage', 'facebook-cookies.txt')
  if (fs.pathExistsSync(local)) return local
  return ''
}

async function downloadFacebookWithYtDlp(input, signal) {
  const sources = [input]
  const canonical = await expandFacebookUrl(input, signal)
  if (canonical && canonical !== input) sources.push(canonical)
  try {
    const parsed = new URL(canonical || input)
    const reel = parsed.pathname.match(/\/reel\/(\d+)/i)?.[1]
    if (reel) sources.push(`https://m.facebook.com/watch/?v=${reel}&_rdr`)
  } catch {}

  const unique = [...new Set(sources.filter(Boolean))]
  let lastError = null
  for (const source of unique) {
    const base = ytdlpTempBase('usanagi-fb')
    try {
      const ffmpegArgs = await getFfmpegLocationArgs()
      const args = [
        source,
        '-f', 'bv*+ba/b',
        '--merge-output-format', 'mp4',
        '--remux-video', 'mp4',
        '--no-playlist',
        '--retries', '8',
        '--fragment-retries', '8',
        '--extractor-retries', '3',
        '--file-access-retries', '3',
        '--concurrent-fragments', String(global.youtubeDownloader?.ytDlpConcurrentFragments || 4),
        '--http-chunk-size', '250M',
        '--socket-timeout', '30',
        '--add-header', `User-Agent: ${FACEBOOK_UA}`,
        '--add-header', 'Referer: https://www.facebook.com/',
        '--no-warnings', '--quiet',
        ...ffmpegArgs,
        '-o', `${base}.%(ext)s`,
      ]
      const cookie = getFacebookCookiePath()
      const browserCookies = String(process.env.USANAGI_FACEBOOK_BROWSER || '').trim()
      if (cookie) args.push('--cookies', cookie)
      else if (browserCookies) args.push('--cookies-from-browser', browserCookies)
      const controller = new AbortController()
      const relay = () => controller.abort()
      if (signal) {
        if (signal.aborted) controller.abort()
        else signal.addEventListener('abort', relay, { once: true })
      }
      await runYtDlp(args, 90000, { signal: controller.signal })
      const entries = await fs.readdir(path.dirname(base)).catch(() => [])
      const output = entries
        .filter(name => name.startsWith(path.basename(base) + '.') && /\.(mp4|mkv|webm|mov)$/i.test(name))
        .map(name => path.join(path.dirname(base), name))
        .sort()
        .find(Boolean)
      if (!output) throw new Error('yt-dlp tidak menghasilkan video Facebook.')
      const stat = await fs.stat(output)
      if (!stat.size || stat.size > MAX_VIDEO) throw new Error('Video Facebook tidak valid atau terlalu besar.')
      signal?.removeEventListener?.('abort', relay)
      return output
    } catch (error) {
      lastError = error
      try {
        const dir = path.dirname(base)
        const prefix = path.basename(base)
        const entries = await fs.readdir(dir)
        await Promise.all(entries.filter(name => name.startsWith(prefix)).map(name => fs.remove(path.join(dir, name)).catch(() => {})))
      } catch {}
    }
  }
  throw lastError || new Error('Downloader Facebook gagal.')
}

async function downloadViaApi(input) {
  const apiUrl = `${API_URL}?url=${encodeURIComponent(input)}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 90000)
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${API_KEY}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`API HTTP ${response.status}`)
    const result = await response.json()
    if (result?.status === false || result?.success === false) throw new Error(result?.message || result?.error || 'API gagal mengambil Facebook.')
    const media = findMediaUrls(result).filter(item => item.type === 'video')
    if (!media.length) throw new Error('URL video Facebook tidak ditemukan pada response API.')
    return { media, title: result.title || result.caption || result.description || 'Facebook' }
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('API Facebook timeout.')
    throw error
  } finally {
    clearTimeout(timer)
  }
}

const handler = async (m, { conn, usedPrefix }) => {
  const input = m.text?.trim()

  if (!input) {
    m.limit?.fail()
    return conn.sendMessage(m.chat, {
      text: `❌ Masukkan link Facebook!\n\nContoh:\n${usedPrefix}fb https://www.facebook.com/share/v/xxxxx/`
    }, { quoted: m.raw })
  }

  if (!isFacebookUrl(input)) {
    m.limit?.fail()
    return conn.sendMessage(m.chat, { text: '❌ Link tersebut bukan link Facebook.' }, { quoted: m.raw })
  }

  void react(conn, m, '⏳')

  const abort = new AbortController()
  const timeout = setTimeout(() => abort.abort(), MAX_RESOLVE_MS)
  let lastError = null
  try {
    const resolvedPromise = expandFacebookUrl(input, abort.signal)
    const resolvers = [
      downloadViaFbDownloader(input, abort.signal),
      downloadViaFacebookPage(input, abort.signal),
      API_KEY ? downloadViaApi(input) : Promise.reject(new Error('API Facebook tidak tersedia.')),
    ]

    const pending = resolvers.map(promise => {
      const entry = {}
      entry.promise = promise.then(value => ({ entry, value }), error => ({ entry, error }))
      return entry
    })
    while (pending.length) {
      const result = await Promise.race(pending.map(entry => entry.promise))
      const slot = pending.findIndex(entry => entry === result.entry)
      if (slot >= 0) pending.splice(slot, 1)
      if (result.error) {
        lastError = result.error
        continue
      }

      const media = Array.isArray(result.value?.media) ? result.value.media.filter(item => item?.type === 'video' && /^https?:\/\//i.test(item.url)) : []
      for (const item of media.slice(0, 6)) {
        try {
          const prepared = await prepareRemoteWhatsAppVideo(item.url, {
            prefix: 'usanagi-fb-verified',
            timeoutMs: 90000,
            maxBytes: MAX_VIDEO,
            headers: {
              Referer: 'https://www.facebook.com/',
              'User-Agent': FACEBOOK_UA,
              Accept: 'video/mp4,video/*,*/*',
              'Accept-Encoding': 'identity',
            },
          })
          try {
            await conn.sendMessage(m.chat, {
              video: { url: prepared.file },
              mimetype: 'video/mp4',
              fileName: 'facebook.mp4',
              caption: '🎬 Facebook',
              ptv: false,
            }, { quoted: m.raw })
          } finally {
            await fs.remove(prepared.file).catch(() => {})
          }
          await react(conn, m, '✅')
          m.limit?.success()
          return
        } catch (error) {
          lastError = error
        }
      }
    }

    const resolved = await resolvedPromise
    try {
      const ytFile = await downloadFacebookWithYtDlp(resolved || input, abort.signal)
      try {
        const prepared = await prepareYtDlpVideo(ytFile, { prefix: 'usanagi-fb-ready', removeInput: true })
        try {
          await conn.sendMessage(m.chat, {
            video: { url: prepared.file },
            mimetype: 'video/mp4',
            fileName: 'facebook.mp4',
            caption: '🎬 Facebook',
            ptv: false,
          }, { quoted: m.raw })
        } finally {
          await fs.remove(prepared.file).catch(() => {})
        }
      } catch (error) {
        await fs.remove(ytFile).catch(() => {})
        throw error
      }
      await react(conn, m, '✅')
      m.limit?.success()
      return
    } catch (error) {
      lastError = error
      if (resolved !== input) {
        try {
          const ytFile = await downloadFacebookWithYtDlp(input, abort.signal)
          try {
            const prepared = await prepareYtDlpVideo(ytFile, { prefix: 'usanagi-fb-ready', removeInput: true })
            try {
              await conn.sendMessage(m.chat, {
                video: { url: prepared.file },
                mimetype: 'video/mp4',
                fileName: 'facebook.mp4',
                caption: '🎬 Facebook',
                ptv: false,
              }, { quoted: m.raw })
            } finally {
              await fs.remove(prepared.file).catch(() => {})
            }
          } catch (error2) {
            await fs.remove(ytFile).catch(() => {})
            throw error2
          }
          await react(conn, m, '✅')
          m.limit?.success()
          return
        } catch (error2) {
          lastError = error2
        }
      }
    }

    throw lastError || new Error('Video Facebook tidak dapat diproses.')
  } catch (error) {
    m.limit?.fail()
    await react(conn, m, '❌')
    return conn.sendMessage(m.chat, { text: /timeout|rate.?limit|403/i.test(String(error?.message || '')) ? '❌ Facebook sedang membatasi akses. Coba lagi beberapa saat.' : '❌ Gagal mendownload Facebook. Pastikan link video masih aktif lalu coba lagi.' }, { quoted: m.raw })
  } finally {
    clearTimeout(timeout)
    abort.abort()
  }

}

handler.command = /^(fb|facebook|fbdl|fbdown)$/i
handler.help = ['fb', 'facebook', 'fbdl']
handler.tags = ['download']
handler.description = 'Download video dan media Facebook'
handler.limitCommit = 'manual'

export default handler
