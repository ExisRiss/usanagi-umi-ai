/* By AlzRiss - Usanagi Umi AI */

import axios from 'axios'
import fs from 'fs-extra'
import crypto from 'node:crypto'
import { sendInteractive } from '../../lib/awang-tombol.js'
import { resolveTikTokFile, MAX_VIDEO } from '../download/usanagi-tiktok.js'

const selectionCache = globalThis.__usanagiTikTokSearchSelections || new Map()
globalThis.__usanagiTikTokSearchSelections = selectionCache
const TTL = 5 * 60 * 1000

const cleanText = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback
  const text = String(value).replace(/\s+/g, ' ').trim()
  return text || fallback
}

const shorten = (value, max = 72) => {
  const text = cleanText(value)
  const chars = Array.from(text)
  if (chars.length <= max) return text
  const cut = chars.slice(0, max - 1).join('')
  const wordSafe = cut.replace(/\s+\S*$/, '').trim()
  return `${wordSafe || cut.trim()}…`
}

const firstValue = (...values) => {
  for (const value of values) {
    if (value !== null && value !== undefined && value !== '') return value
  }
  return null
}

const firstNumber = (...values) => {
  for (const value of values) {
    const number = Number(value)
    if (Number.isFinite(number)) return number
  }
  return null
}

const formatMetric = value => {
  const number = firstNumber(value)
  if (number === null) return '-'
  if (number >= 1000000000) return `${(number / 1000000000).toFixed(1).replace('.0', '')}B`
  if (number >= 1000000) return `${(number / 1000000).toFixed(1).replace('.0', '')}M`
  if (number >= 1000) return `${(number / 1000).toFixed(1).replace('.0', '')}K`
  return String(number)
}

const react = async (conn, m, emoji) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
  } catch {}
}

const getResults = data => {
  const candidates = [
    Array.isArray(data) ? data : null,
    data?.results,
    data?.items,
    data?.videos,
    data?.data?.results,
    data?.data?.items,
    data?.data?.videos,
    data?.data
  ]
  return candidates.find(Array.isArray) || []
}

const getAuthor = item =>
  cleanText(
    item?.author?.nickname ||
      item?.author?.uniqueId ||
      item?.author?.unique_id ||
      item?.author?.name ||
      item?.author ||
      item?.username ||
      item?.user?.nickname ||
      item?.user?.unique_id,
    ''
  )

const getTitle = item =>
  cleanText(
    item?.title ||
      item?.description ||
      item?.desc ||
      item?.text,
    'Tanpa judul'
  )

const getStats = item => ({
  views: firstNumber(
    item?.viewCount,
    item?.view_count,
    item?.views,
    item?.playCount,
    item?.play_count,
    item?.stats?.viewCount,
    item?.stats?.views,
    item?.statistics?.playCount,
    item?.statistics?.viewCount
  ),
  likes: firstNumber(
    item?.likeCount,
    item?.like_count,
    item?.likes,
    item?.diggCount,
    item?.digg_count,
    item?.stats?.likeCount,
    item?.stats?.likes,
    item?.statistics?.diggCount
  ),
  comments: firstNumber(
    item?.commentCount,
    item?.comment_count,
    item?.comments,
    item?.stats?.commentCount,
    item?.stats?.comments,
    item?.statistics?.commentCount
  ),
  shares: firstNumber(
    item?.shareCount,
    item?.share_count,
    item?.shares,
    item?.stats?.shareCount,
    item?.stats?.shares,
    item?.statistics?.shareCount
  )
})

const getDownloadUrl = item => {
  const pageCandidates = [
    item?.tiktokUrl,
    item?.shareUrl,
    item?.share_url,
    item?.webUrl,
    item?.web_url,
    item?.link,
    item?.url
  ]

  const mediaCandidates = [
    item?.videoUrl,
    item?.video_url,
    item?.downloadUrl,
    item?.download_url
  ]

  const firstHttp = list => list.find(value => {
    try {
      const url = new URL(value)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  })

  return firstHttp(pageCandidates) || firstHttp(mediaCandidates) || ''
}

const isTikTokPageUrl = value => {
  try {
    const host = new URL(value).hostname.toLowerCase()
    return ['tiktok.com', 'www.tiktok.com', 'vt.tiktok.com', 'vm.tiktok.com', 'm.tiktok.com'].includes(host)
  } catch {
    return false
  }
}

const putSelection = (chat, item) => {
  const token = crypto.randomBytes(7).toString('hex')
  selectionCache.set(`${chat}:${token}`, {
    item,
    createdAt: Date.now()
  })
  return token
}

const getSelection = (chat, token) => {
  const key = `${chat}:${token}`
  const value = selectionCache.get(key)
  if (!value) return null
  if (Date.now() - value.createdAt > TTL) {
    selectionCache.delete(key)
    return null
  }
  return value.item
}

const pruneCache = () => {
  const now = Date.now()
  for (const [key, value] of selectionCache) {
    if (now - value.createdAt > TTL) selectionCache.delete(key)
  }
  while (selectionCache.size > 500) selectionCache.delete(selectionCache.keys().next().value)
}

const encodeSelection = item => {
  const url = cleanText(getDownloadUrl(item))
  if (!url) return ''
  const stats = getStats(item)
  const payload = {
    u: url,
    t: shorten(getTitle(item), 120),
    a: shorten(getAuthor(item) || 'TikTok', 60),
    v: stats.views,
    l: stats.likes,
    c: stats.comments,
    s: stats.shares
  }
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
}

const decodeSelection = token => {
  try {
    if (!token || token.length > 700) return null
    const payload = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'))
    const url = cleanText(payload?.u)
    if (!/^https?:\/\//i.test(url)) return null
    return {
      url,
      title: cleanText(payload?.t, 'Tanpa judul'),
      author: cleanText(payload?.a, 'TikTok'),
      stats: {
        views: firstNumber(payload?.v),
        likes: firstNumber(payload?.l),
        comments: firstNumber(payload?.c),
        shares: firstNumber(payload?.s)
      }
    }
  } catch {
    return null
  }
}

const buildStatsLines = (item, resolved = null) => {
  const stats = item?.stats || getStats(item)
  const author = cleanText(item?.author || getAuthor(item) || resolved?.author, 'TikTok')
  const title = cleanText(resolved?.title || item?.title || getTitle(item), 'Tanpa judul')
  const lines = [
    `Judul   : ${shorten(title, 90)}`,
    `Author  : ${shorten(author, 52)}`
  ]

  const metrics = [
    ['Views', stats?.views],
    ['Likes', stats?.likes],
    ['Komentar', stats?.comments],
    ['Share', stats?.shares]
  ]

  const available = metrics
    .filter(([, value]) => value !== null && value !== undefined)
    .slice(0, 3)

  for (const [label, value] of available) {
    lines.push(`${label.padEnd(label === 'Komentar' ? 7 : 6, ' ')}: ${formatMetric(value)}`)
  }

  return lines.slice(0, 5)
}

const sendPickedVideo = async (m, conn, item) => {
  await react(conn, m, '⏳')
  const source = cleanText(item?.url || getDownloadUrl(item))
  if (!source) {
    await react(conn, m, '❌')
    return m.reply('Video dari hasil tersebut tidak memiliki URL yang dapat diunduh.')
  }

  let tempFile = null
  try {
    if (isTikTokPageUrl(source)) {
      const resolved = await resolveTikTokFile(source, MAX_VIDEO)
      tempFile = resolved.file
      const caption = buildStatsLines({
        title: item?.title || resolved?.title,
        author: item?.author,
        stats: item?.stats || getStats(item)
      }, resolved)
      caption.push('Sumber: TikTok Search')
      await conn.sendMessage(m.chat, {
        video: { url: tempFile },
        mimetype: 'video/mp4',
        caption: caption.join('\n')
      }, { quoted: m.raw })
      await react(conn, m, '✅')
      return
    }

    const response = await axios.get(source, {
      responseType: 'arraybuffer',
      timeout: 45000,
      maxContentLength: MAX_VIDEO,
      maxBodyLength: MAX_VIDEO,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36',
        Accept: 'video/mp4,video/*,*/*'
      }
    })

    const buffer = Buffer.from(response.data)
    if (!buffer.length) throw new Error('Video kosong')
    if (buffer.length > MAX_VIDEO) throw new Error('Ukuran video terlalu besar')

    tempFile = `/tmp/usanagi-tt-search-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.mp4`
    await fs.writeFile(tempFile, buffer)
    const caption = buildStatsLines(item)
    caption.push('Sumber: TikTok Search')
    await conn.sendMessage(m.chat, {
      video: { url: tempFile },
      mimetype: 'video/mp4',
      caption: caption.join('\n')
    }, { quoted: m.raw })
    await react(conn, m, '✅')
  } catch {
    await react(conn, m, '❌')
    return m.reply('Gagal mengunduh video TikTok tersebut. Coba pilih hasil lain.')
  } finally {
    if (tempFile) await fs.remove(tempFile).catch(() => {})
  }
}

const handler = async (m, { conn, usedPrefix }) => {
  pruneCache()
  const args = Array.isArray(m?.args) ? m.args : []

  if (args[0] === '__pick') {
    const token = cleanText(args[1])
    if (!token) return m.reply('Pilihan TikTok sudah tidak valid. Silakan lakukan pencarian ulang.')
    const cached = getSelection(m.chat, token)
    const decoded = decodeSelection(token)
    const item = cached || decoded
    if (!item) return m.reply('Pilihan TikTok tidak lagi tersedia. Silakan lakukan pencarian ulang.')
    return sendPickedVideo(m, conn, item)
  }

  const keywords = cleanText(m?.text)
  if (!keywords) {
    return m.reply(`Gunakan ${usedPrefix}ttsearch\nContoh: ${usedPrefix}ttsearch anime`)
  }

  await react(conn, m, '⏳')

  try {
    const payload = {
      keywords,
      filtersFast: [
        `nbChar > 10`,
        `lang = 'en'`,
        `createTime >= 1742259708 AND createTime <= 1789563708`
      ],
      extraParams: { sort: '' }
    }

    const { data } = await axios.post(
      'https://www.revid.ai/api/tiktok-search',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        timeout: 30000
      }
    )

    const results = getResults(data)
    if (!results.length) {
      await react(conn, m, '❌')
      return m.reply(`Tidak ada video TikTok untuk “${keywords}”. Coba kata kunci lain.`)
    }

    const list = results.slice(0, 10)
    const rows = []

    for (let index = 0; index < list.length; index++) {
      const item = list[index]
      const token = encodeSelection(item) || putSelection(m.chat, item)
      selectionCache.set(`${m.chat}:${token}`, { item, createdAt: Date.now() })
      const title = shorten(getTitle(item), 36)
      const author = shorten(getAuthor(item) || 'TikTok', 36)
      rows.push({
        title: `${index + 1}. ${title}`,
        description: `${author} • Pilih untuk download`,
        command: `${usedPrefix}ttsearch __pick ${token}`
      })
    }

    await sendInteractive(conn, m.chat, {
      title: 'TikTok Search',
      body: `Keyword: ${shorten(keywords, 70)}\nHasil: ${list.length}\n\nPilih video untuk mengunduh.`,
      footer: 'Usanagi Umi AI • TikTok Search',
      list: {
        listTitle: 'Pilih Video',
        sections: [{ title: 'Hasil Pencarian', rows }]
      }
    }, { quoted: m.raw })
    await react(conn, m, '✅')
  } catch (error) {
    await react(conn, m, '❌')
    const status = Number(error?.response?.status)
    if (status === 429) return m.reply('Pencarian TikTok sedang dibatasi. Silakan coba lagi beberapa saat lagi.')
    if (status >= 500) return m.reply('Layanan pencarian TikTok sedang bermasalah. Silakan coba lagi nanti.')
    if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') return m.reply('Pencarian TikTok melewati batas waktu. Silakan coba lagi.')
    return m.reply('Gagal mencari video TikTok. Silakan coba lagi nanti.')
  }
}

handler.help = ['ttsearch']
handler.tags = ['search']
handler.command = /^ttsearch$/i

export default handler
