/* By AlzRiss - Usanagi Umi AI */

import axios from 'axios'
import FormData from 'form-data'

const BRAND = global.brandCredit || 'By AlzRiss - Usanagi Umi AI'
const TIMEOUT = Number(global.faaAPI?.timeoutMs) || 120000
const MAX_RESPONSE = Number(global.faaAPI?.maxResponseBytes) || 80 * 1024 * 1024

const ENDPOINTS = {
  umigemini: { path: 'gemini-ai', param: 'text', kind: 'text', usage: '<pertanyaan>', title: 'Gemini AI' },
  umirealtime: { path: 'ai-realtime', param: 'text', kind: 'text', usage: '<pertanyaan>', title: 'AI Realtime' },
  umiytsearch: { path: 'youtube', param: 'q', kind: 'text', usage: '<judul>', title: 'YouTube Search' },
  umiplay: { path: 'ytplay', param: 'query', kind: 'text', usage: '<judul>', title: 'YouTube Play' },
  umipinterest: { path: 'pinterest', param: 'q', kind: 'text', usage: '<kata kunci>', title: 'Pinterest Search' },
  umitiktokstalk: { path: 'tiktokstalk', param: 'username', kind: 'username', usage: '<username>', title: 'TikTok Stalk' },
  umiemoji: { path: 'emojigerak', param: 'emoji', kind: 'text', usage: '<emoji>', title: 'Emoji Bergerak' },
  umiwikipedia: { path: 'Wikipedia-search', param: 'q', kind: 'text', usage: '<kata kunci>', title: 'Wikipedia Search' },
  umiig: { path: 'igdl', param: 'url', kind: 'url', usage: '<url Instagram>', title: 'Instagram Downloader' },
  umipin: { path: 'pin-down', param: 'url', kind: 'url', usage: '<url Pinterest>', title: 'Pinterest Downloader' },
  umifb: { path: 'fbdownload', param: 'url', kind: 'url', usage: '<url Facebook>', title: 'Facebook Downloader' },
  umimediafire: { path: 'mediafire', param: 'url', kind: 'url', usage: '<url MediaFire>', title: 'MediaFire Downloader' },
  umitiktok: { path: 'tiktok', param: 'url', kind: 'url', usage: '<url TikTok>', title: 'TikTok Downloader' },
  umidouyin: { path: 'douyin-down', param: 'url', kind: 'url', usage: '<url Douyin>', title: 'Douyin Downloader' },
  umiytmp3: { path: 'ytmp3', param: 'url', kind: 'url', usage: '<url YouTube>', title: 'YouTube MP3' },
  umiytmp4: { path: 'ytmp4', param: 'url', kind: 'url', usage: '<url YouTube>', title: 'YouTube MP4' },
  umieditfoto: { path: 'editfoto', kind: 'image-prompt', usage: '<prompt> (reply foto)', title: 'Edit Foto AI' },
  umisuperhd: { path: 'superhd', kind: 'image', usage: '(reply foto)', title: 'Super HD' },
  umihitamkan: { path: 'hitamkan', kind: 'image', usage: '(reply foto)', title: 'Hitamkan Foto' }
}

const COMMANDS = Object.keys(ENDPOINTS)
// Dipakai menu UMI terpadu tanpa mengekspos nama provider pada command.
global.umiDirectCommands = ENDPOINTS

function baseUrl() {
  return String(global.faaAPI?.baseUrl || global.APIs?.faa || 'https://api-faa.my.id').replace(/\/+$/, '')
}

function isUrl(value) {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

function collectUrls(value, output = []) {
  if (!value || output.length >= 30) return output
  if (typeof value === 'string') {
    for (const match of value.match(/https?:\/\/[^\s"'<>]+/gi) || []) {
      const clean = match.replace(/[),.!?]+$/, '')
      if (!output.includes(clean)) output.push(clean)
    }
  } else if (Array.isArray(value)) {
    for (const item of value) collectUrls(item, output)
  } else if (typeof value === 'object') {
    for (const item of Object.values(value)) collectUrls(item, output)
  }
  return output
}

function findText(value) {
  if (typeof value === 'string' && value.trim() && !isUrl(value.trim())) return value.trim()
  if (!value || typeof value !== 'object') return ''
  const preferred = ['result', 'response', 'answer', 'message', 'text', 'caption', 'description', 'title']
  for (const key of preferred) {
    const found = value[key]
    if (typeof found === 'string' && found.trim() && !isUrl(found.trim())) return found.trim()
  }
  for (const item of Object.values(value)) {
    const found = findText(item)
    if (found) return found
  }
  return ''
}

function compactJson(value) {
  const seen = new WeakSet()
  const text = JSON.stringify(value, (key, item) => {
    if (item && typeof item === 'object') {
      if (seen.has(item)) return '[Circular]'
      seen.add(item)
    }
    return item
  }, 2)
  return (text || String(value)).slice(0, 12000)
}

function guessMedia(url) {
  const clean = url.split('?')[0].toLowerCase()
  if (/\.(jpe?g|png|webp|gif)$/.test(clean)) return 'image'
  if (/\.(mp4|mov|mkv|webm)$/.test(clean)) return 'video'
  if (/\.(mp3|m4a|aac|ogg|opus|wav)$/.test(clean)) return 'audio'
  if (/\.(zip|rar|7z|pdf|apk|docx?|xlsx?)$/.test(clean)) return 'document'
  return 'unknown'
}

async function uploadQuotedImage(m) {
  const quoted = m.quoted || m
  const mime = String((quoted.msg || quoted)?.mimetype || quoted.mediaType || '')
  if (!/^image\//i.test(mime)) throw new Error('Reply foto yang ingin diproses.')
  const buffer = await quoted.download()
  if (!buffer?.length) throw new Error('Gagal mengunduh foto.')
  const form = new FormData()
  form.append('files[]', buffer, { filename: `faa-${Date.now()}.${mime.split('/')[1] || 'jpg'}` })
  const response = await axios.post('https://uguu.se/upload.php', form, {
    headers: form.getHeaders(),
    timeout: 60000,
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  })
  const url = response?.data?.files?.[0]?.url
  if (!url) throw new Error('Gagal mengunggah foto sementara.')
  return url
}

async function requestUmi(endpoint, params) {
  const response = await axios.get(`${baseUrl()}/faa/${endpoint}`, {
    params,
    timeout: TIMEOUT,
    maxContentLength: MAX_RESPONSE,
    maxBodyLength: MAX_RESPONSE,
    responseType: 'arraybuffer',
    validateStatus: () => true,
    headers: {
      Accept: 'application/json,image/*,video/*,audio/*,*/*',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/140 Mobile Safari/537.36'
    }
  })
  const contentType = String(response.headers['content-type'] || '').toLowerCase()
  if (response.status < 200 || response.status >= 300) {
    const detail = Buffer.from(response.data || '').toString('utf8').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300)
    throw new Error(`UMI API HTTP ${response.status}${detail ? `: ${detail}` : ''}`)
  }
  if (/^(image|video|audio)\//.test(contentType) || /application\/(pdf|zip|octet-stream)/.test(contentType)) {
    return { binary: Buffer.from(response.data), contentType }
  }
  const raw = Buffer.from(response.data || '').toString('utf8')
  if (/text\/html/.test(contentType) && /cloudflare|just a moment|security verification/i.test(raw)) {
    throw new Error('Layanan UMI sedang menolak akses otomatis melalui proteksi Cloudflare.')
  }
  try {
    const data = JSON.parse(raw)
    if (data?.status === false || data?.success === false || data?.error === true) {
      throw new Error(String(data.message || data.reason || data.error || 'API UMI gagal.'))
    }
    return { data, contentType }
  } catch (error) {
    if (error?.message && !/Unexpected token|JSON/.test(error.message)) throw error
    return { data: raw, contentType }
  }
}

async function sendResult(conn, m, result, title) {
  const caption = `*${title}*\n${BRAND}`
  if (result.binary) {
    const type = result.contentType.split(';')[0] || 'application/octet-stream'
    const ext = type.split('/')[1]?.replace('jpeg', 'jpg').replace(/[^a-z0-9]/g, '') || 'bin'
    return conn.sendFile(m.chat, result.binary, `umi-result.${ext}`, caption, m)
  }

  const urls = collectUrls(result.data)
  const mediaUrl = urls.find(url => guessMedia(url) !== 'unknown') || urls[0]
  const text = findText(result.data)
  if (mediaUrl) {
    try {
      await conn.sendFile(m.chat, mediaUrl, `umi-result.${guessMedia(mediaUrl) === 'audio' ? 'mp3' : guessMedia(mediaUrl) === 'video' ? 'mp4' : guessMedia(mediaUrl) === 'image' ? 'jpg' : 'bin'}`, text ? `${text.slice(0, 900)}\n\n${BRAND}` : caption, m)
      const extras = urls.filter(url => url !== mediaUrl).slice(0, 8)
      if (extras.length) await m.reply(`*Tautan lainnya:*\n${extras.join('\n')}\n\n${BRAND}`)
      return
    } catch {}
  }

  const body = text || compactJson(result.data)
  await m.reply(`${caption}\n\n${body.slice(0, 12000)}`)
}

function catalog(prefix = '.') {
  return [
    '*UMI API SUITE*',
    '',
    ...Object.entries(ENDPOINTS).map(([command, item]) => `• ${prefix}${command} ${item.usage}`),
    '',
    `Endpoint: ${baseUrl()}`,
    BRAND
  ].join('\n')
}

const handler = async (m, { conn, text, command, usedPrefix }) => {
  const prefix = usedPrefix || '.'
  const selected = String(command || '').toLowerCase()
  const input = String(text || '').trim()
  const item = ENDPOINTS[selected]
  if (!item) return m.reply(catalog(prefix))
  const params = {}

  try {
    if (item.kind === 'image' || item.kind === 'image-prompt') {
      params.url = await uploadQuotedImage(m)
      if (item.kind === 'image-prompt') params.prompt = input || 'Tingkatkan kualitas foto ini dengan hasil natural'
    } else {
      if (!input) throw new Error(`Contoh: ${prefix}${selected} ${item.usage}`)
      if (item.kind === 'url' && !isUrl(input)) throw new Error('Masukkan URL yang valid.')
      params[item.param] = item.kind === 'username' ? input.replace(/^@/, '') : input
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.raw?.key || m.key } }).catch(() => {})
    const result = await requestUmi(item.path, params)
    await sendResult(conn, m, result, item.title)
    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.raw?.key || m.key } }).catch(() => {})
    m.limit?.success?.()
  } catch (error) {
    m.limit?.fail?.()
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.raw?.key || m.key } }).catch(() => {})
    await m.reply(`*${item.title} gagal*\n${error?.message || error}\n\n${BRAND}`)
  }
}

handler.help = COMMANDS.map(command => `${command} ${ENDPOINTS[command].usage}`)
handler.tags = ['tools', 'internet', 'downloader', 'ai']
handler.command = new RegExp(`^(${COMMANDS.join('|')})$`, 'i')
handler.limit = true

export default handler
