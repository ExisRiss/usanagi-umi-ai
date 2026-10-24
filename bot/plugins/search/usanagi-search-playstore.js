/* By AlzRiss - Usanagi Umi AI */

import axios from 'axios'
import crypto from 'node:crypto'
import { sendInteractive } from '../../lib/awang-tombol.js'

const API_URL = 'https://api.deline.web.id'
const selectionCache = globalThis.__usanagiPlayStoreSearchSelections || new Map()
globalThis.__usanagiPlayStoreSearchSelections = selectionCache
const TTL = 5 * 60 * 1000

const cleanText = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback
  const text = String(value).replace(/\s+/g, ' ').trim()
  return text || fallback
}

const shorten = (value, max = 70) => {
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

const formatMetric = value => {
  const number = Number(value)
  if (!Number.isFinite(number)) return cleanText(value, '-')
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

const validUrl = value => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const getResults = data => {
  if (Array.isArray(data?.result)) return data.result
  if (Array.isArray(data?.data?.result)) return data.data.result
  if (Array.isArray(data?.results)) return data.results
  return []
}

const putSelection = (chat, item) => {
  const token = crypto.randomBytes(7).toString('hex')
  selectionCache.set(`${chat}:${token}`, { item, createdAt: Date.now() })
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

const getAppData = item => ({
  name: firstValue(item?.nama, item?.name, item?.title, 'Tanpa nama'),
  developer: firstValue(item?.developer, item?.developerName, item?.author),
  rating: firstValue(item?.rate2, item?.rating, item?.score),
  price: firstValue(item?.price, item?.priceText, item?.harga),
  installs: firstValue(item?.installs, item?.installCount, item?.downloads, item?.downloadCount),
  version: firstValue(item?.version, item?.versi),
  size: firstValue(item?.size, item?.fileSize, item?.ukuran),
  category: firstValue(item?.category, item?.genre),
  updated: firstValue(item?.updated, item?.updatedAt, item?.lastUpdated),
  description: firstValue(item?.description, item?.desc),
  appLink: firstValue(item?.link, item?.url),
  developerLink: firstValue(item?.link_dev, item?.developerLink)
})

const renderDetail = async (m, conn, item) => {
  const app = getAppData(item)
  const lines = [
    shorten(app.name, 72),
    app.developer ? `Developer : ${shorten(app.developer, 46)}` : '',
    app.rating !== null ? `Rating    : ${shorten(app.rating, 18)}` : '',
    app.installs !== null ? `Installs  : ${formatMetric(app.installs)}` : '',
    app.version ? `Version   : ${shorten(app.version, 18)}` : '',
    app.size ? `Size      : ${shorten(app.size, 18)}` : '',
    app.category ? `Kategori  : ${shorten(app.category, 28)}` : '',
    app.price ? `Harga     : ${shorten(app.price, 18)}` : '',
    app.updated ? `Update    : ${shorten(app.updated, 28)}` : '',
    app.description ? `Deskripsi : ${shorten(app.description, 180)}` : ''
  ].filter(Boolean)

  const buttons = []
  if (validUrl(app.appLink)) {
    buttons.push({ type: 'url', label: 'Buka Play Store', url: app.appLink })
  }
  if (validUrl(app.developerLink)) {
    buttons.push({ type: 'url', label: 'Developer', url: app.developerLink })
  }

  return sendInteractive(conn, m.chat, {
    title: shorten(app.name, 60),
    body: lines.join('\n'),
    footer: 'Usanagi Umi AI • Play Store Search',
    buttons
  }, { quoted: m.raw })
}

const handler = async (m, { conn, usedPrefix }) => {
  pruneCache()
  const args = Array.isArray(m?.args) ? m.args : []

  if (args[0] === '__pick') {
    const token = cleanText(args[1])
    if (!token) return m.reply('Pilihan Play Store sudah tidak valid. Silakan lakukan pencarian ulang.')
    const item = getSelection(m.chat, token)
    if (!item) return m.reply('Hasil pencarian sudah kedaluwarsa. Silakan lakukan pencarian ulang.')

    await react(conn, m, '⏳')
    try {
      const result = await renderDetail(m, conn, item)
      await react(conn, m, '✅')
      return result
    } catch {
      await react(conn, m, '❌')
      return m.reply('Detail aplikasi tidak dapat ditampilkan. Silakan pilih hasil lain.')
    }
  }

  const query = cleanText(m?.text)
  if (!query) {
    return m.reply(`Gunakan ${usedPrefix}playstoresearch\nContoh: ${usedPrefix}playstoresearch kinemaster`)
  }

  await react(conn, m, '⏳')

  try {
    const { data } = await axios.get(
      `${API_URL}/search/playstore?q=${encodeURIComponent(query)}`,
      { timeout: 15000 }
    )

    const results = getResults(data)
    if (!results.length) {
      await react(conn, m, '❌')
      return m.reply(`Aplikasi tidak ditemukan untuk “${query}”.`)
    }

    const list = results.slice(0, 10)
    const rows = []

    for (let index = 0; index < list.length; index++) {
      const item = list[index]
      const token = putSelection(m.chat, item)
      const app = getAppData(item)
      const name = shorten(app.name, 38)
      const developer = shorten(app.developer || 'Developer tidak tersedia', 28)
      const rating = app.rating !== null ? `Rating ${shorten(app.rating, 10)}` : ''
      const installs = app.installs !== null ? `Install ${formatMetric(app.installs)}` : ''
      const description = [developer, rating || installs].filter(Boolean).join(' • ')

      rows.push({
        title: `${index + 1}. ${name}`,
        description: shorten(description || 'Pilih untuk melihat detail', 52),
        command: `${usedPrefix}playstoresearch __pick ${token}`
      })
    }

    await sendInteractive(conn, m.chat, {
      title: 'Play Store Search',
      body: `Query: ${shorten(query, 70)}\nHasil: ${list.length}\n\nPilih aplikasi untuk melihat detail.`,
      footer: 'Usanagi Umi AI • Play Store Search',
      list: {
        listTitle: 'Pilih Aplikasi',
        sections: [{ title: 'Hasil Pencarian', rows }]
      }
    }, { quoted: m.raw })
    await react(conn, m, '✅')
  } catch (error) {
    await react(conn, m, '❌')
    const status = Number(error?.response?.status)
    if (status === 429) return m.reply('Pencarian Play Store sedang dibatasi. Silakan coba lagi beberapa saat lagi.')
    if (status >= 500) return m.reply('Layanan Play Store Search sedang bermasalah. Silakan coba lagi nanti.')
    if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') return m.reply('Pencarian Play Store melewati batas waktu. Silakan coba lagi.')
    return m.reply('Gagal mencari aplikasi di Play Store. Silakan coba lagi nanti.')
  }
}

handler.help = ['playstoresearch']
handler.tags = ['search']
handler.command = /^playstoresearch$/i
handler.limit = true

export default handler
