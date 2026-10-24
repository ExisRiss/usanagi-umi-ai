/* By AlzRiss - Usanagi Umi AI */

import { sendRemoteMediaFast } from '../../lib/awang-media-transfer.js'


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

export async function request(url, { method = 'GET', headers = {}, body, timeoutMs = 30000 } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

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

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return response
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('Permintaan melebihi batas waktu.')
    }
    throw error
  } finally {
    clearTimeout(timer)
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

async function parsePinterestPage(input) {
  const response = await request(input, {
    timeoutMs: 45000,
    headers: {
      'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
    },
  })

  const html = await response.text()
  const leaf = extractScriptJson(html, 'data-test-id', 'leaf-snippet')
  const videoSnippet = extractScriptJson(html, 'data-test-id', 'video-snippet')

  const image =
    leaf?.image ||
    extractMeta(html, 'property', 'og:image') ||
    extractMeta(html, 'name', 'twitter:image')

  const video =
    videoSnippet?.contentUrl ||
    extractMeta(html, 'property', 'og:video') ||
    extractMeta(html, 'name', 'twitter:player:stream')

  if (!image && !video) {
    throw new Error('Media Pinterest tidak ditemukan.')
  }

  return {
    image: isHttpUrl(image) ? image : '',
    video: isHttpUrl(video) ? video : '',
  }
}

async function fallbackPinterestVideo(input) {
  const { ytDlpDownloadBest } = await import('../../lib/awang-ytdlp.js')
  return ytDlpDownloadBest(input, 100 * 1024 * 1024, {
    prefix: 'usanagi-pinterest',
  })
}

const handler = async (m, { conn, usedPrefix }) => {
  const commandName = String(m.command || 'pindl').trim() || 'pindl'
  const input = String(m.text || '').trim()

  if (!input) {
    m.limit?.fail()
    return m.reply([
      'Cara penggunaan:',
      `${usedPrefix}${commandName} <url Pinterest>`,
      '',
      'Contoh:',
      `${usedPrefix}${commandName} https://www.pinterest.com/pin/xxxxx/`,
    ].join('\n'))
  }

  if (!isHttpUrl(input)) {
    m.limit?.fail()
    return m.reply('❌ URL Pinterest tidak valid.')
  }

  if (!hostMatches(input, ['pinterest.com', 'pin.it'])) {
    m.limit?.fail()
    return m.reply('❌ Link tersebut bukan link Pinterest.')
  }

  void conn.sendMessage(m.chat, {
    react: { text: '⏳', key: m.raw.key },
  }).catch(() => {})

  try {
    let sent = false

    try {
      const media = await parsePinterestPage(input)

      if (media.video) {
        await sendRemoteMedia(conn, m, media.video, {
          caption: '📌 Pinterest Downloader',
          fallbackType: 'video',
          maxBytes: 100 * 1024 * 1024,
          fileName: 'pinterest.mp4',
        })
        sent = true
      } else if (media.image) {
        await sendRemoteMedia(conn, m, media.image, {
          caption: '📌 Pinterest Downloader',
          fallbackType: 'image',
          maxBytes: 30 * 1024 * 1024,
          fileName: 'pinterest.jpg',
        })
        sent = true
      }
    } catch (primaryError) {
      console.error('[USANAGI PINDL PRIMARY]', primaryError)
    }

    if (!sent) {
      try {
        const file = await fallbackPinterestVideo(input)
        try {
          await conn.sendMessage(m.chat, {
            video: { url: file },
            mimetype: 'video/mp4',
            fileName: 'pinterest.mp4',
            caption: '📌 Pinterest Downloader',
          }, { quoted: m.raw })
          sent = true
        } finally {
          const { default: fs } = await import('fs-extra')
          await fs.remove(file).catch(() => {})
        }
      } catch (fallbackError) {
        console.error('[USANAGI PINDL FALLBACK]', fallbackError)
      }
    }

    if (!sent) {
      throw new Error('Media Pinterest tidak dapat diproses.')
    }

    m.limit?.success()

    void conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.raw.key },
    }).catch(() => {})
  } catch (error) {
    m.limit?.fail()

    try {
      await conn.sendMessage(m.chat, {
        react: { text: '❌', key: m.raw.key },
      })
    } catch {}

    console.error('[USANAGI PINDL]', error)
    return m.reply('❌ Gagal mengambil media Pinterest. Pastikan pin masih tersedia lalu coba lagi.')
  }
}

handler.command = /^pindl$/i
handler.help = ['pindl']
handler.tags = ['download']
handler.category = 'download'
handler.description = 'Download gambar atau video Pinterest'
handler.limit = true
handler.limitCommit = 'manual'

export default handler
