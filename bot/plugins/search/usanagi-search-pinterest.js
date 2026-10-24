/* By AlzRiss - Usanagi Umi AI */

import axios from 'axios'
import https from 'https'
import { sendCarousel } from '../../lib/awang-carousel.js'

const agent = new https.Agent({
  rejectUnauthorized: true,
  maxVersion: 'TLSv1.3',
  minVersion: 'TLSv1.2',
  keepAlive: true
})

const cookieState = globalThis.__usanagiPinterestCookieState || {
  value: '',
  expiresAt: 0,
  promise: null
}
globalThis.__usanagiPinterestCookieState = cookieState

const getCookies = async () => {
  if (cookieState.value && cookieState.expiresAt > Date.now()) {
    return cookieState.value
  }

  if (cookieState.promise) return cookieState.promise

  cookieState.promise = (async () => {
    try {
      const response = await axios.get('https://www.pinterest.com/csrf_error/', {
        httpsAgent: agent,
        timeout: 8000,
        validateStatus: status => status >= 200 && status < 500,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/133.0.0.0 Safari/537.36'
        }
      })

      const cookies = response.headers?.['set-cookie']
      if (!Array.isArray(cookies) || !cookies.length) return ''

      const value = cookies
        .map(cookie => String(cookie).split(';')[0].trim())
        .filter(Boolean)
        .join('; ')

      if (value) {
        cookieState.value = value
        cookieState.expiresAt = Date.now() + 10 * 60 * 1000
      }

      return value
    } catch {
      return ''
    } finally {
      cookieState.promise = null
    }
  })()

  return cookieState.promise
}

const firstNumber = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue
    const number = Number(value)
    if (Number.isFinite(number)) return number
  }
  return null
}

const pinterest = async query => {
  const cookies = await getCookies()
  const url = 'https://www.pinterest.com/resource/BaseSearchResource/get/'
  const params = {
    source_url: `/search/pins/?q=${encodeURIComponent(query)}`,
    data: JSON.stringify({
      options: {
        isPrefetch: false,
        query,
        scope: 'pins',
        no_fetch_context_on_resource: false
      },
      context: {}
    }),
    _: Date.now()
  }

  const headers = {
    accept: 'application/json, text/javascript, */*, q=0.01',
    'accept-language': 'en-US,en;q=0.9',
    referer: 'https://www.pinterest.com/',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/133.0.0.0 Safari/537.36',
    'x-app-version': 'c056fb7',
    'x-pinterest-appstate': 'active',
    'x-pinterest-pws-handler': 'www/search/pins.js',
    'x-pinterest-source-url': '/search/pins/',
    'x-requested-with': 'XMLHttpRequest',
    ...(cookies ? { cookie: cookies } : {})
  }

  const response = await axios.get(url, {
    httpsAgent: agent,
    headers,
    params,
    timeout: 15000,
    maxContentLength: 20 * 1024 * 1024,
    maxBodyLength: 20 * 1024 * 1024,
    validateStatus: status => status >= 200 && status < 400
  })

  const results = response?.data?.resource_response?.data?.results
  if (!Array.isArray(results)) return []

  return results
    .filter(item => item?.images?.orig?.url)
    .map(item => {
      const original = item?.images?.orig || {}
      const thumbnail = item?.images?.['474x']?.url || item?.images?.['236x']?.url || original.url
      const pinner = item?.pinner || {}
      const engagementSources = [
        ['Reaksi', item?.reaction_count],
        ['Reaksi', item?.reactionCount],
        ['Reaksi', item?.aggregated_pin_data?.aggregated_stats?.reaction_count],
        ['Saves', item?.save_count],
        ['Saves', item?.saveCount],
        ['Repin', item?.repin_count],
        ['Repin', item?.repinCount],
        ['Saves', item?.aggregated_save_count]
      ]
      let engagementLabel = 'Interaksi'
      let engagement = null
      for (const [label, value] of engagementSources) {
        const number = firstNumber(value)
        if (number !== null) {
          engagementLabel = label
          engagement = number
          break
        }
      }

      return {
        id: cleanText(item?.id),
        image: original.url,
        thumbnail,
        source: item?.id ? `https://id.pinterest.com/pin/${item.id}/` : '',
        name: item?.grid_title || item?.title || '',
        username: pinner?.username || '',
        fullname: pinner?.full_name || pinner?.fullName || '',
        followers: firstNumber(pinner?.follower_count, pinner?.followerCount),
        board: item?.board?.name || item?.board?.title || '',
        engagement,
        engagementLabel,
        description: item?.description || item?.rich_summary?.display_description || '',
        width: firstNumber(original?.width),
        height: firstNumber(original?.height)
      }
    })
}

const cleanText = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback
  const text = String(value).replace(/\s+/g, ' ').trim()
  return text || fallback
}

const shorten = (value, max = 180) => {
  const text = cleanText(value)
  const chars = Array.from(text)
  if (chars.length <= max) return text
  const cut = chars.slice(0, max - 1).join('')
  const wordSafe = cut.replace(/\s+\S*$/, '').trim()
  return `${wordSafe || cut.trim()}…`
}

const formatMetric = value => {
  const number = Number(value)
  if (!Number.isFinite(number)) return '-'
  if (number >= 1000000000) return `${(number / 1000000000).toFixed(1).replace('.0', '')}B`
  if (number >= 1000000) return `${(number / 1000000).toFixed(1).replace('.0', '')}M`
  if (number >= 1000) return `${(number / 1000).toFixed(1).replace('.0', '')}K`
  return String(number)
}

const formatResolution = (item) => {
  const width = Number(item?.width)
  const height = Number(item?.height)
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return '-'
  return `${width}x${height}`
}

const validUrl = value => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const react = async (conn, m, emoji) => {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
  } catch {}
}

const handler = async (m, { conn, usedPrefix }) => {
  const input = cleanText(m?.text)
  if (!input) {
    return m.reply(`Gunakan ${usedPrefix}pinsearch\nContoh: ${usedPrefix}pinsearch anime`)
  }

  const parts = input.split(/\s+/)
  let count = 6
  if (/^\d+$/.test(parts.at(-1))) {
    count = Math.min(6, Math.max(2, Number(parts.pop())))
  }

  const query = parts.join(' ').trim()
  if (!query) {
    return m.reply(`Gunakan ${usedPrefix}pinsearch\nContoh: ${usedPrefix}pinsearch anime`)
  }

  await react(conn, m, '⏳')

  try {
    const results = await pinterest(query)
    const images = results.filter(item => validUrl(item.image) && validUrl(item.thumbnail)).slice(0, count)

    if (!images.length) {
      await react(conn, m, '❌')
      return m.reply(`Tidak ada hasil Pinterest untuk “${query}”. Coba kata kunci lain.`)
    }

    if (images.length < 2) {
      await react(conn, m, '❌')
      return m.reply('Pinterest hanya mengembalikan satu hasil yang dapat ditampilkan. Coba kata kunci yang lebih umum.')
    }

    const cards = images.map((item, index) => {
      const name = shorten(item.name || item.description || 'Tanpa judul', 26)
      const fullname = shorten(item.fullname || 'Pinterest User', 22)
      const username = shorten(item.username ? `@${item.username}` : '-', 22)
      const followers = formatMetric(item.followers)
      const board = shorten(item.board || '-', 22)
      const resolution = formatResolution(item)

      return {
        image: item.thumbnail || item.image,
        title: `Pinterest #${String(index + 1).padStart(2, '0')}`,
        body: [
          `Nama      : ${name}`,
          `Pemilik   : ${fullname}`,
          `Akun      : ${username}`,
          `Followers : ${followers}`,
          `Board     : ${board}`,
          `Resolusi  : ${resolution}`,
          `${shorten(item.engagementLabel || 'Interaksi', 10).padEnd(10, ' ')}: ${formatMetric(item.engagement)}`
        ].join('\n'),
        footer: 'Pinterest Search',
        buttons: item.source && validUrl(item.source)
          ? [{ type: 'cta_url', text: 'Buka Pinterest', url: item.source }]
          : [{ type: 'cta_copy', text: 'Salin URL', id: `pin_url_${index + 1}`, copyCode: item.image }]
      }
    })

    await sendCarousel(conn, m.chat, {
      text: `Pinterest Search\nQuery: ${shorten(query, 70)}\nHasil: ${cards.length}`,
      footer: 'Usanagi Umi AI • Pinterest Search',
      cards,
      quoted: m.raw
    })
    await react(conn, m, '✅')
  } catch (error) {
    await react(conn, m, '❌')
    const status = Number(error?.response?.status)
    if (status === 429 || status === 403) {
      return m.reply('Pencarian Pinterest sedang dibatasi. Silakan coba lagi beberapa saat lagi.')
    }
    if (status >= 500) {
      return m.reply('Layanan Pinterest sedang bermasalah. Silakan coba lagi nanti.')
    }
    return m.reply('Pinterest sedang tidak dapat diakses. Silakan coba lagi beberapa saat lagi.')
  }
}

handler.help = ['pinsearch']
handler.tags = ['search']
handler.command = /^pinsearch$/i
handler.limit = true
handler.register = true

export default handler
