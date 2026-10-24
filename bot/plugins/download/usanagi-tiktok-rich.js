/* By AlzRiss - Usanagi Umi AI */

import { AIRich } from '../../lib/ui/MessageBuilder.js'
import { resolveTikTokUrl } from './usanagi-tiktok.js'

const BRAND = global.brandCredit || 'By AlzRiss - Usanagi Umi AI'
const richConfig = () => global.tiktokRich || {}
const tikwmBase = () => String(richConfig().tikwmBaseUrl || 'https://www.tikwm.com').replace(/\/+$/, '')
const revidSearch = () => String(richConfig().revidSearchUrl || 'https://www.revid.ai/api/tiktok-search')
const UA = 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36'
const TIKTOK_URL = /https?:\/\/(?:(?:www|m)\.)?tiktok\.com\/[^\s]+|https?:\/\/(?:vt|vm)\.tiktok\.com\/[^\s]+/i

async function requestJson(url, options = {}) {
  const controller = new AbortController()
  const timeout = Number(richConfig().timeoutMs) || 45000
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': UA,
        ...(options.headers || {}),
      },
    })
    const raw = await response.text()
    let data
    try { data = JSON.parse(raw) } catch { data = null }
    if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`)
    if (!data) throw new Error('Respons API bukan JSON.')
    return data
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('Permintaan TikTok timeout.')
    throw error
  } finally {
    clearTimeout(timer)
  }
}

const absoluteTikwm = value => {
  const url = String(value || '').trim()
  if (!url) return ''
  if (/^https?:\/\//i.test(url)) return url
  return `${tikwmBase()}${url.startsWith('/') ? '' : '/'}${url}`
}

function normalizeTikwm(data = {}) {
  const images = (Array.isArray(data.images) ? data.images : [])
    .map(absoluteTikwm)
    .filter(Boolean)
  return {
    title: String(data.title || data.desc || '-').trim(),
    uploader: String(data.author?.nickname || data.author?.unique_id || data.author?.uniqueId || '-').trim(),
    duration: Number(data.duration) || 0,
    views: Number(data.play_count ?? data.playCount) || 0,
    likes: Number(data.digg_count ?? data.diggCount) || 0,
    comments: Number(data.comment_count ?? data.commentCount) || 0,
    shares: Number(data.share_count ?? data.shareCount) || 0,
    video: absoluteTikwm(data.hdplay || data.play || data.wmplay),
    cover: absoluteTikwm(data.cover || data.origin_cover || data.dynamic_cover),
    images,
    music: absoluteTikwm(data.music_info?.play || data.music),
  }
}

function normalizeRevid(item = {}) {
  return {
    title: String(item.desc || item.contentSummary || item.content || '-').trim(),
    uploader: String(item.userNickname || item.username || '-').trim(),
    duration: Number(item.durationInSeconds || item.duration) || 0,
    views: Number(item.playCount) || 0,
    likes: Number(item.diggCount) || 0,
    comments: Number(item.commentCount) || 0,
    shares: Number(item.shareCount) || 0,
    video: String(item.urlUploaded || '').trim(),
    cover: String(item.imagePreview || '').trim(),
    images: [],
    music: '',
    pageUrl: String(item.url || '').trim(),
  }
}

async function fetchTikwm(tiktokUrl) {
  const endpoint = `${tikwmBase()}/api/?url=${encodeURIComponent(tiktokUrl)}&hd=1`
  const json = await requestJson(endpoint)
  if (!json?.data || (json.code !== undefined && Number(json.code) !== 0)) {
    throw new Error(json?.msg || json?.message || 'TikWM tidak mengembalikan data.')
  }
  return normalizeTikwm(json.data)
}

async function searchTikwm(keyword) {
  const endpoint = `${tikwmBase()}/api/feed/search?keywords=${encodeURIComponent(keyword)}&count=1&cursor=0&web=1&hd=1`
  const json = await requestJson(endpoint)
  const item = json?.data?.videos?.[0]
  if (!item) throw new Error('TikWM tidak menemukan hasil.')
  const username = item.author?.unique_id || item.author?.uniqueId
  const id = item.video_id || item.id
  if (!username || !id) throw new Error('Hasil TikWM tidak memiliki URL video.')
  return fetchTikwm(`https://www.tiktok.com/@${username}/video/${id}`)
}

async function searchRevid(keyword) {
  const payload = {
    keywords: keyword,
    filtersFast: [],
    extraParams: { sort: '' },
  }
  const json = await requestJson(revidSearch(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const item = json?.videos?.[0] || json?.data?.videos?.[0] || json?.results?.[0]
  if (!item) throw new Error('Hasil pencarian TikTok tidak ditemukan.')
  const result = normalizeRevid(item)
  if (!result.video && result.pageUrl) return fetchDirect(result.pageUrl)
  if (!result.video) throw new Error('Hasil pencarian tidak memiliki media.')
  return result
}

async function fetchDirect(url) {
  try {
    return await fetchTikwm(url)
  } catch (tikwmError) {
    const resolved = await resolveTikTokUrl(url)
    if (!resolved?.url) throw tikwmError
    let uploader = '-'
    try {
      const parsed = new URL(url)
      uploader = parsed.pathname.match(/\/@([^/]+)/)?.[1] || '-'
    } catch {}
    return {
      title: resolved.title || '-', uploader, duration: 0,
      views: 0, likes: 0, comments: 0, shares: 0,
      video: resolved.url, cover: '', images: [], music: '',
    }
  }
}

async function resolveInput(input) {
  const matchedUrl = input.match(TIKTOK_URL)?.[0]
  if (matchedUrl) return fetchDirect(matchedUrl)
  try {
    return await searchTikwm(input)
  } catch (error) {
    console.warn(`[TIKTOK-RICH] TikWM search gagal: ${error?.message || error}`)
    return searchRevid(input)
  }
}

function shortNum(value = 0) {
  const num = Number(value) || 0
  if (num >= 1e9) return `${(num / 1e9).toFixed(1).replace('.0', '')}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(1).replace('.0', '')}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(1).replace('.0', '')}K`
  return String(num)
}

function formatDuration(seconds = 0) {
  const sec = Math.max(0, Math.floor(Number(seconds) || 0))
  const hours = Math.floor(sec / 3600)
  const minutes = Math.floor((sec % 3600) / 60)
  const rest = sec % 60
  return hours
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

function infoTable(data, photoCount = 0) {
  const rows = [
    ['Info', 'Value'],
    ['Uploader', data.uploader || '-'],
    [photoCount ? 'Total Foto' : 'Durasi', photoCount ? String(photoCount) : formatDuration(data.duration)],
    ['Views', shortNum(data.views)],
  ]
  if (!photoCount) {
    rows.push(['Likes', shortNum(data.likes)])
    rows.push(['Komentar', shortNum(data.comments)])
    rows.push(['Share', shortNum(data.shares)])
  }
  return rows
}

async function sendRich(conn, m, data) {
  const rich = new AIRich(conn)
  const config = conn.botConfig?.values?.tiktokRich || richConfig()
  const maxPhotos = Math.max(1, Number(config.maxPhotos) || 12)
  const photos = data.images.slice(0, maxPhotos)

  if (photos.length) {
    rich
      .addText(`📸 *USANAGI TIKTOK PHOTO*\n${BRAND}`)
      .addImage(photos)
      .addTable(infoTable(data, data.images.length))
      .addTip(`${data.title || '-'}\n\n${BRAND}`)
      .addSuggest(['photo', 'tiktok', 'Usanagi Umi AI'])
  } else {
    if (!data.video) throw new Error('URL video TikTok tidak ditemukan.')
    rich
      .addText(`🎌 *USANAGI TIKTOK RICH*\n${BRAND}`)
      .addVideo({
        url: data.video,
        thumbnail: data.cover || undefined,
        duration: data.duration || undefined,
        mime_type: 'video/mp4',
      })
      .addTable(infoTable(data))
      .addTip(`${data.title || '-'}\n\n${BRAND}`)
      .addSuggest(['downloader', 'video', 'tiktok'])
  }

  await rich.send(m.chat, { quoted: m.raw || m })

  if (!photos.length && config.sendMusic !== false && data.music) {
    await conn.sendMessage(
      m.chat,
      {
        audio: { url: data.music },
        mimetype: 'audio/mpeg',
        fileName: 'usanagi-tiktok.mp3',
      },
      { quoted: m.raw || m },
    )
  }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const input = String(m.quoted?.text || text || '').trim()
  if (!input) {
    await m.reply([
      'Contoh:',
      `${usedPrefix}${command} https://vt.tiktok.com/xxxx`,
      `${usedPrefix}${command} elaina edit`,
    ].join('\n'))
    return { success: false }
  }

  try {
    await m.react('✨').catch(() => {})
    const data = await resolveInput(input)
    await sendRich(conn, m, data)
    await m.react('✅').catch(() => {})
    return { success: true }
  } catch (error) {
    console.error('[TIKTOK-RICH]', error)
    await m.react('❌').catch(() => {})
    await m.reply(`❌ Gagal memproses TikTok.\n\n${error?.message || error}\n\n${BRAND}`)
    return { success: false }
  }
}

handler.help = ['ttv4 <url/kata kunci>', 'tt4 <url/kata kunci>', 'tiktokrich <url/kata kunci>']
handler.tags = ['downloader']
handler.command = /^(ttv4|tt4|ttdl4|tiktok4|tiktokrich)$/i
handler.limit = true
handler.description = 'TikTok downloader dan search dengan tampilan AIRich'

export default handler
