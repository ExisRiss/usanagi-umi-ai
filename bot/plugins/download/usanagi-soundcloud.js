
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

import { ytDlpExtractAudio } from '../../lib/awang-ytdlp.js'

const BASE_API = (process.env.USANAGI_SOUNDCLOUD_API || 'https://host.optikl.ink/soundcloud').replace(/\/+$/, '')
const sessions = new Map()
const SESSION_TTL = 5 * 60 * 1000

function clearExpiredSessions() {
  const now = Date.now()

  for (const [chat, session] of sessions) {
    if (now - session.createdAt > SESSION_TTL) {
      sessions.delete(chat)
    }
  }
}

async function soundCloudSearch(query, limit = 10) {
  const response = await request(
    `${BASE_API}/search?query=${encodeURIComponent(query)}`,
    {
      timeoutMs: 20000,
      headers: {
        Accept: 'application/json',
      },
    }
  )

  const data = await responseJson(response)
  if (!Array.isArray(data)) return []

  return data.slice(0, limit).map((item, index) => ({
    no: index + 1,
    title: cleanHtmlText(item?.title || 'Untitled'),
    author: cleanHtmlText(item?.author?.name || 'Unknown'),
    url: item?.url || '',
  })).filter(item => isHttpUrl(item.url))
}

async function soundCloudApiDownload(url) {
  const response = await request(
    `${BASE_API}/download?url=${encodeURIComponent(url)}`,
    {
      timeoutMs: 30000,
      headers: {
        Accept: 'application/json',
      },
    }
  )

  const data = await responseJson(response)
  if (!data?.audio_url || !isHttpUrl(data.audio_url)) {
    throw new Error('Audio SoundCloud tidak ditemukan.')
  }

  return {
    title: cleanHtmlText(data.title || 'SoundCloud'),
    author: cleanHtmlText(data.author || 'Unknown'),
    audio: data.audio_url,
  }
}

async function soundCloudFallbackDownload(url, title = 'SoundCloud') {
  const file = await ytDlpExtractAudio(url, 80 * 1024 * 1024, {
    prefix: 'usanagi-soundcloud',
  })

  return {
    file,
    title: sanitizeFilename(title, 'soundcloud'),
  }
}

async function sendSoundCloud(conn, m, data, fileName) {
  if (data.audio) {
    await sendRemoteMedia(conn, m, data.audio, {
      caption: data.author ? `🎧 ${data.title}\n${data.author}` : `🎧 ${data.title}`,
      fallbackType: 'audio',
      maxBytes: 80 * 1024 * 1024,
      fileName,
    })
    return
  }

  try {
    await conn.sendMessage(m.chat, {
      audio: { url: data.file },
      mimetype: 'audio/mpeg',
      fileName,
      ptt: false,
      caption: data.title ? `🎧 ${data.title}` : '',
    }, { quoted: m.raw })
  } finally {
    const { default: fs } = await import('fs-extra')
    await fs.remove(data.file).catch(() => {})
  }
}

const handler = async (m, { conn, usedPrefix }) => {
  const commandName = String(m.command || 'soundcloud').trim() || 'soundcloud'
  clearExpiredSessions()

  const input = String(m.text || '').trim()
  const session = sessions.get(m.chat)

  if (!input) {
    m.limit?.fail()
    return m.reply([
      'Cara penggunaan:',
      `${usedPrefix}${commandName} <judul lagu>`,
      '',
      'Contoh:',
      `${usedPrefix}${commandName} another love tom odell`,
      '',
      `Bisa juga: ${usedPrefix}${commandName} <url SoundCloud>`,
    ].join('\n'))
  }

  try {
    await conn.sendMessage(m.chat, {
      react: { text: '🎧', key: m.raw.key },
    })
  } catch {}

  try {
    const selection = /^\d+$/.test(input) ? Number(input) : 0

    if (selection > 0 && session) {
      const pick = session.list[selection - 1]

      if (!pick) {
        m.limit?.fail()
        return m.reply(`❌ Nomor pilihan tidak tersedia. Pilih 1-${session.list.length}.`)
      }

      sessions.delete(m.chat)

      let sent = false

      try {
        const result = await soundCloudApiDownload(pick.url)
        await sendSoundCloud(conn, m, {
          audio: result.audio,
          title: result.title || pick.title,
          author: result.author || pick.author,
        }, `${sanitizeFilename(result.title || pick.title, 'soundcloud')}.mp3`)
        sent = true
      } catch (apiError) {
        console.error('[USANAGI SOUNDCLOUD API]', apiError)
      }

      if (!sent) {
        const fallback = await soundCloudFallbackDownload(pick.url, pick.title)
        try {
          await sendSoundCloud(conn, m, fallback, `${fallback.title}.mp3`)
          sent = true
        } catch (sendError) {
          console.error('[USANAGI SOUNDCLOUD YTDLP SEND]', sendError)
          throw sendError
        }
      }

      if (!sent) throw new Error('Audio SoundCloud tidak dapat dikirim.')

      m.limit?.success()

      try {
        await conn.sendMessage(m.chat, {
          react: { text: '✅', key: m.raw.key },
        })
      } catch {}

      return
    }

    if (selection > 0 && !session) {
      m.limit?.fail()
      return m.reply('❌ Sesi pilihan SoundCloud sudah berakhir. Cari lagu lagi dengan command SoundCloud.')
    }

    if (isHttpUrl(input)) {
      if (!hostMatches(input, ['soundcloud.com'])) {
        m.limit?.fail()
        return m.reply('❌ Link tersebut bukan link SoundCloud.')
      }

      let sent = false

      try {
        const result = await soundCloudApiDownload(input)
        await sendSoundCloud(conn, m, result, `${sanitizeFilename(result.title, 'soundcloud')}.mp3`)
        sent = true
      } catch (apiError) {
        console.error('[USANAGI SOUNDCLOUD DIRECT API]', apiError)
      }

      if (!sent) {
        const fallback = await soundCloudFallbackDownload(input)
        try {
          await sendSoundCloud(conn, m, fallback, `${fallback.title}.mp3`)
          sent = true
        } catch (sendError) {
          console.error('[USANAGI SOUNDCLOUD DIRECT YTDLP SEND]', sendError)
          throw sendError
        }
      }

      m.limit?.success()

      try {
        await conn.sendMessage(m.chat, {
          react: { text: '✅', key: m.raw.key },
        })
      } catch {}

      return
    }

    const list = await soundCloudSearch(input, 10)

    if (!list.length) {
      m.limit?.fail()
      return m.reply('❌ Tidak ada hasil SoundCloud untuk pencarian tersebut.')
    }

    const lines = [
      '╭─〔 🎧 SOUNDCLOUD 〕',
      '│',
      `│ Hasil untuk: *${input}*`,
      '│',
      ...list.map(item => `│ ${item.no}. ${item.title}\n│    ${item.author}`),
      '│',
      `│ Pilih dengan: ${usedPrefix}${commandName} <nomor>`,
      '╰────────────────',
    ]

    await m.reply(lines.join('\n'))
    sessions.set(m.chat, {
      createdAt: Date.now(),
      list,
    })

    m.limit?.success()

    void conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.raw.key },
    }).catch(() => {})
  } catch (error) {
    sessions.delete(m.chat)
    m.limit?.fail()

    try {
      await conn.sendMessage(m.chat, {
        react: { text: '❌', key: m.raw.key },
      })
    } catch {}

    console.error('[USANAGI SOUNDCLOUD]', error)
    return m.reply('❌ Gagal memproses SoundCloud. Silakan coba lagi beberapa saat.')
  }
}

handler.command = /^soundcloud$/i
handler.help = ['soundcloud']
handler.tags = ['download']
handler.category = 'download'
handler.description = 'Cari dan download audio SoundCloud'
handler.limit = true
handler.limitCommit = 'manual'

export default handler
