/*
 * USANAGI UMI AI — ALQANIME AUTO NOTIF
 * Check: 15 minutes
 */

import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

const SITE = 'https://alqanime.net'
const INTERVAL = 15 * 60 * 1000
const MAX_NOTIF = 5

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'Referer': SITE + '/'
}

let lastCheck = 0
let checking = false

// ============================================================
// DATABASE
// ============================================================

function getDB() {
  if (!global.db)
    global.db = {}

  if (!global.db.data)
    global.db.data = {}

  if (!global.db.data.animeNotif)
    global.db.data.animeNotif = {}

  const db = global.db.data.animeNotif

  if (!Array.isArray(db.known))
    db.known = []

  if (typeof db.initialized !== 'boolean')
    db.initialized = false

  return db
}

function getChat(chat) {
  if (!global.db.data.chats)
    global.db.data.chats = {}

  if (!global.db.data.chats[chat])
    global.db.data.chats[chat] = {}

  return global.db.data.chats[chat]
}

// ============================================================
// REQUEST
// ============================================================

async function getHTML(url) {
  const res = await fetch(url, {
    headers,
    timeout: 30000
  })

  if (!res.ok)
    throw new Error(`HTTP ${res.status}`)

  return await res.text()
}

// ============================================================
// AMBIL RILISAN TERBARU
// ============================================================

async function getLatest() {
  const html = await getHTML(SITE + '/')
  const $ = cheerio.load(html)

  const results = []
  const seen = new Set()

  /*
   * Cari heading "Rilisan Terbaru"
   */
  let section = null

  $('h1, h2, h3, h4, h5, h6').each((i, el) => {
    const text = $(el).text().trim().toLowerCase()

    if (
      text.includes('rilisan terbaru') &&
      !section
    ) {
      section = $(el)
    }
  })

  /*
   * Ambil parent/container dari heading.
   */
  let container = section

  if (section && section.length) {
    for (let i = 0; i < 4; i++) {
      if (
        container.parent().length &&
        container.parent().find('a').length >= 3
      ) {
        container = container.parent()
        break
      }

      container = container.parent()
    }
  }

  /*
   * Kalau section tidak ketemu,
   * fallback ke homepage seluruh link alqanime.
   */
  const links = container && container.length
    ? container.find('a[href]')
    : $('a[href]')

  links.each((i, el) => {
    const a = $(el)

    const href = a.attr('href')
    if (!href)
      return

    let url

    try {
      url = new URL(href, SITE).href
    } catch {
      return
    }

    /*
     * Hanya halaman anime.
     */
    if (!url.startsWith(SITE))
      return

    if (
      url === SITE ||
      url === SITE + '/' ||
      url.includes('/category/') ||
      url.includes('/genre/') ||
      url.includes('/season/') ||
      url.includes('/studio/') ||
      url.includes('/page/') ||
      url.includes('/tag/') ||
      url.includes('/jadwal-rilis') ||
      url.includes('/advanced-search')
    ) {
      return
    }

    const title = a.text()
      .replace(/\s+/g, ' ')
      .trim()

    if (!title)
      return

    /*
     * Jangan masukkan link yang cuma menu.
     */
    if (
      title.length < 3 ||
      title.toLowerCase() === 'lihat semua'
    ) {
      return
    }

    if (seen.has(url))
      return

    seen.add(url)

    const parent = a.closest('article, li, .bs, .bsx, .item')

    const poster =
      parent.find('img').first().attr('src') ||
      parent.find('img').first().attr('data-src') ||
      ''

    results.push({
      title,
      url,
      poster
    })
  })

  /*
   * Alqanime saat ini menampilkan rilisan terbaru
   * dari yang paling baru ke lama.
   */
  return results.slice(0, 30)
}

// ============================================================
// KIRIM NOTIF
// ============================================================

async function sendNotif(conn, chat, list) {
  if (!list.length)
    return

  let text = `╭━━━〔 *ANIME UPDATE* 〕━━━╮\n`
  text += `┃ ✨ *Rilisan baru Alqanime!*\n`
  text += `╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n`

  for (let i = 0; i < list.length; i++) {
    const anime = list[i]

    text += `*${i + 1}. ${anime.title}*\n`
    text += `🔗 ${anime.url}\n`

    if (i < list.length - 1)
      text += '\n'
  }

  text += `\n> ❀ USANAGI UMI AI ❀`

  await conn.sendMessage(chat, {
    text
  })
}

// ============================================================
// CHECK
// ============================================================

async function checkAnime(conn) {
  if (checking)
    return

  checking = true

  try {
    const db = getDB()

    const latest = await getLatest()

    if (!latest.length) {
      console.log('[ANIME NOTIF] Tidak menemukan rilisan.')
      checking = false
      return
    }

    const urls = latest.map(v => v.url)

    /*
     * FIRST RUN
     *
     * Jangan langsung spam semua anime yang sudah ada.
     */
    if (!db.initialized) {
      db.known = urls
      db.initialized = true

      console.log(
        `[ANIME NOTIF] Initial sync: ${latest.length} anime`
      )

      checking = false
      return
    }

    const known = Array.isArray(db.known)
      ? db.known
      : []

    /*
     * Cari yang belum pernah diketahui.
     */
    const newAnime = latest.filter(item => {
      return !known.includes(item.url)
    })

    /*
     * Update database.
     */
    db.known = [
      ...urls,
      ...known
    ]

    db.known = [
      ...new Set(db.known)
    ].slice(0, 200)

    if (!newAnime.length) {
      console.log('[ANIME NOTIF] Tidak ada anime baru.')
      checking = false
      return
    }

    console.log(
      `[ANIME NOTIF] Anime baru: ${newAnime.length}`
    )

    /*
     * Ambil chat yang mengaktifkan notif.
     */
    const chats = global.db.data.chats || {}

    const targets = Object.keys(chats).filter(chat => {
      return chats[chat] &&
        chats[chat].animeNotif === true
    })

    if (!targets.length) {
      checking = false
      return
    }

    /*
     * Jangan spam.
     * Maksimal 5 rilisan dalam satu pesan.
     */
    const sendList = newAnime.slice(0, MAX_NOTIF)

    for (const chat of targets) {
      try {
        await sendNotif(
          conn,
          chat,
          sendList
        )
      } catch (e) {
        console.error(
          '[ANIME NOTIF] Send error:',
          e?.message || e
        )
      }
    }

  } catch (e) {
    console.error(
      '[ANIME NOTIF] Check error:',
      e?.message || e
    )
  }

  checking = false
}

// ============================================================
// TIMER
// ============================================================

function startWatcher(conn) {
  if (global.__anyaAnimeWatcher)
    return

  global.__anyaAnimeWatcher = true

  console.log(
    '[ANIME NOTIF] Watcher aktif — interval 15 menit.'
  )

  /*
   * Tunggu sebentar setelah bot hidup.
   */
  setTimeout(() => {
    checkAnime(conn)
  }, 15000)

  setInterval(() => {
    checkAnime(conn)
  }, INTERVAL)
}

// ============================================================
// COMMAND
// ============================================================

let handler = async (m, { conn, command, args, usedPrefix }) => {

  /*
   * Jalankan watcher ketika plugin pertama kali dipanggil.
   */
  startWatcher(conn)

  const chat = getChat(m.chat)

  const action = (
    args?.[0] ||
    'status'
  ).toLowerCase()

  // ==========================================================
  // ON
  // ==========================================================

  if (action === 'on') {

    if (chat.animeNotif === true) {
      return m.reply(
        '⚠️ Anime notif sudah aktif di chat ini.'
      )
    }

    /*
     * Pastikan database sudah sinkron
     * sebelum mengaktifkan.
     *
     * Jadi anime lama tidak dianggap baru.
     */
    try {
      const db = getDB()

      if (!db.initialized) {
        const latest = await getLatest()

        db.known = latest.map(v => v.url)
        db.initialized = true

        console.log(
          `[ANIME NOTIF] Initial sync: ${latest.length}`
        )
      }
    } catch (e) {
      console.error(
        '[ANIME NOTIF] Initial sync error:',
        e?.message || e
      )
    }

    chat.animeNotif = true

    return m.reply(
      `╭━━━〔 *ANIME NOTIF* 〕━━━╮\n` +
      `┃ ✅ Status : *AKTIF*\n` +
      `┃ ⏱️ Check : *15 menit*\n` +
      `┃ 📦 Max : *${MAX_NOTIF} anime/pesan*\n` +
      `┃ 🔕 Anti spam : *ON*\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━╯`
    )
  }

  // ==========================================================
  // OFF
  // ==========================================================

  if (action === 'off') {

    chat.animeNotif = false

    return m.reply(
      `╭━━━〔 *ANIME NOTIF* 〕━━━╮\n` +
      `┃ ❌ Status : *NONAKTIF*\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━╯`
    )
  }

  // ==========================================================
  // STATUS
  // ==========================================================

  if (action === 'status') {

    const db = getDB()

    const status =
      chat.animeNotif === true
        ? 'AKTIF 🟢'
        : 'NONAKTIF 🔴'

    return m.reply(
      `╭━━━〔 *ANIME NOTIF* 〕━━━╮\n` +
      `┃ Status : ${status}\n` +
      `┃ Interval : 15 menit\n` +
      `┃ Max notif : ${MAX_NOTIF}\n` +
      `┃ Known : ${db.known.length}\n` +
      `┃ Watcher : ${global.__anyaAnimeWatcher ? 'ON 🟢' : 'OFF 🔴'}\n` +
      `╰━━━━━━━━━━━━━━━━━━━━━━╯`
    )
  }

  // ==========================================================
  // TEST
  // ==========================================================

  if (action === 'test') {

    try {
      const latest = await getLatest()

      if (!latest.length) {
        return m.reply(
          '❌ Alqanime tidak mengembalikan data rilisan.'
        )
      }

      const list = latest.slice(0, 3)

      await sendNotif(
        conn,
        m.chat,
        list
      )

      return
    } catch (e) {
      return m.reply(
        `❌ Test gagal:\n${e?.message || e}`
      )
    }
  }

  return m.reply(
    `*ANIME NOTIF*\n\n` +
    `${usedPrefix}animenotif on\n` +
    `${usedPrefix}animenotif off\n` +
    `${usedPrefix}animenotif status\n` +
    `${usedPrefix}animenotif test`
  )
}

handler.help = [
  'animenotif on',
  'animenotif off',
  'animenotif status',
  'animenotif test'
]

handler.tags = ['anime']

handler.command = /^animenotif$/i

export default handler