import axios from 'axios'
import cheerio from 'cheerio'

const delay = ms => new Promise(r => setTimeout(r, ms))
if (!global.beritaInterval) global.beritaInterval = new Map()

class DetikNews {
  constructor() {
    this.baseUrl = 'https://www.detik.com'
    this.headers = {
      'user-agent': 'Mozilla/5.0',
      referer: 'https://www.detik.com/',
      origin: 'https://www.detik.com/',
      accept: '*/*'
    }
  }

  async populer() {
    const { data } = await axios.get(this.baseUrl + '/terpopuler', { headers: this.headers })
    const $ = cheerio.load(data)
    let results = []

    $('.list-content__item').each((i, el) => {
      let title = $(el).find('.media__title').text().trim()
      let link = $(el).find('a').attr('href')
      let time = $(el).find('.media__date').text().trim()
      let image = $(el).find('img').attr('src')

      if (title && link) results.push({
        no: i + 1,
        judul: title,
        jam: time,
        url: link,
        image
      })
    })

    return results
  }

  async search(query) {
    const url = `${this.baseUrl}/search/searchall?query=${encodeURIComponent(query)}`
    const { data } = await axios.get(url, { headers: this.headers })
    const $ = cheerio.load(data)
    let results = []

    $('.list-content__item').each((i, el) => {
      let title = $(el).find('.media__title').text().trim()
      let link = $(el).find('.media__title a').attr('href')
      let time = $(el).find('.media__date span').attr('title') || $(el).find('.media__date').text().trim()
      let image = $(el).find('.media__image img').attr('src')

      if (title && link) results.push({
        no: i + 1,
        judul: title,
        jam: time,
        url: link,
        image
      })
    })

    return results
  }
}

async function sendBerita(conn, jid) {
  let chat = global.db.data.chats[jid]
  if (!chat?.notifberita?.status) return

  try {
    const detik = new DetikNews()
    let keyword = chat.notifberita.keyword || 'populer'
    let results = keyword === 'populer'
      ? await detik.populer()
      : await detik.search(keyword)

    if (!results.length) return

    let berita = results[0]
    if (chat.notifberita.lastUrl === berita.url) return

    chat.notifberita.lastUrl = berita.url

    let teks = `乂 *NOTIFIKASI BERITA DETIK*

📰 *Judul:* ${berita.judul}
🕒 *Waktu:* ${berita.jam || '-'}
🔍 *Mode:* ${keyword}

🔗 ${berita.url}`

    if (berita.image) {
      await conn.sendMessage(jid, {
        image: { url: berita.image },
        caption: teks
      })
    } else {
      await conn.sendMessage(jid, { text: teks })
    }
  } catch (e) {
    console.log('Notif Berita Error:', e)
  }
}

function startBerita(conn, jid) {
  let chat = global.db.data.chats[jid]
  if (!chat?.notifberita?.status) return

  if (global.beritaInterval.has(jid)) {
    clearInterval(global.beritaInterval.get(jid))
    global.beritaInterval.delete(jid)
  }

  let menit = chat.notifberita.interval || 30
  let timer = setInterval(() => {
    sendBerita(conn, jid)
  }, menit * 60 * 1000)

  global.beritaInterval.set(jid, timer)
}

let handler = async (m, { conn, text, command, usedPrefix, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply('Fitur ini khusus grup.')
  if (!isAdmin && !isOwner) return m.reply('Khusus admin grup.')

  let chat = global.db.data.chats[m.chat]
  if (!chat.notifberita) {
    chat.notifberita = {
      status: false,
      keyword: 'populer',
      interval: 30,
      lastUrl: ''
    }
  }

  if (command === 'notifberita') {
    if (!text) {
      return m.reply(`乂 *NOTIF BERITA DETIK*

${usedPrefix}notifberita on
${usedPrefix}notifberita off
${usedPrefix}notifberita status
${usedPrefix}setberita populer
${usedPrefix}setberita teknologi
${usedPrefix}intervalberita 30`)
    }

    if (text === 'on') {
      chat.notifberita.status = true
      startBerita(conn, m.chat)
      await sendBerita(conn, m.chat)
      return m.reply('✅ Notifikasi berita grup berhasil diaktifkan.')
    }

    if (text === 'off') {
      chat.notifberita.status = false
      if (global.beritaInterval.has(m.chat)) {
        clearInterval(global.beritaInterval.get(m.chat))
        global.beritaInterval.delete(m.chat)
      }
      return m.reply('✅ Notifikasi berita grup berhasil dimatikan.')
    }

    if (text === 'status') {
      return m.reply(`乂 *STATUS NOTIF BERITA*

Status: ${chat.notifberita.status ? 'Aktif' : 'Mati'}
Keyword: ${chat.notifberita.keyword}
Interval: ${chat.notifberita.interval} menit`)
    }
  }

  if (command === 'setberita') {
    if (!text) return m.reply(`Contoh:\n${usedPrefix}setberita populer\n${usedPrefix}setberita teknologi`)
    chat.notifberita.keyword = text.toLowerCase()
    chat.notifberita.lastUrl = ''
    return m.reply(`✅ Keyword berita diubah ke: *${text}*`)
  }

  if (command === 'intervalberita') {
    let menit = parseInt(text)
    if (!menit || menit < 5) return m.reply('Minimal interval 5 menit.')

    chat.notifberita.interval = menit
    if (chat.notifberita.status) startBerita(conn, m.chat)

    return m.reply(`✅ Interval berita diubah ke *${menit} menit*.`)
  }
}

handler.all = async function () {
  const conn = this
  if (!global.db?.data?.chats) return

  for (let jid of Object.keys(global.db.data.chats)) {
    let chat = global.db.data.chats[jid]
    if (chat?.notifberita?.status && !global.beritaInterval.has(jid)) {
      startBerita(conn, jid)
      await delay(500)
    }
  }
}

handler.help = ['notifberita', 'setberita', 'intervalberita']
handler.tags = ['group']
handler.command = /^(notifberita|setberita|intervalberita)$/i
handler.group = true

export default handler