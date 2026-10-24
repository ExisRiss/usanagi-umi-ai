let handler = async (m, { conn, text, command }) => {
  if (!m.isGroup) return m.reply('Khusus grup')

  if (!global.db.data.cap) global.db.data.cap = {}
  if (!global.db.data.cap[m.chat]) global.db.data.cap[m.chat] = {}

  let who = m.mentionedJid[0]
    ? m.mentionedJid[0]
    : m.quoted
    ? m.quoted.sender
    : text.split(' ')[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net'

  if (!who || who == '@s.whatsapp.net') {
    return m.reply('Tag/reply/masukkan nomor')
  }

  if (command == 'delcap') {
    delete global.db.data.cap[m.chat][who]
    return conn.reply(
      m.chat,
      `Berhasil menghapus cap @${who.split('@')[0]}`,
      m,
      { mentions: [who] }
    )
  }

  let capText = text
    .replace(/@\d+/g, '')
    .replace(/[0-9]/g, '')
    .trim()

  if (!capText) return m.reply('Masukkan teks cap')

  global.db.data.cap[m.chat][who] = capText

  m.reply(`Berhasil set cap ${capText}`)
}

handler.before = async function (m, { conn }) {
  if (!m.isGroup || m.fromMe) return

  if (!global.db.data.cap) return
  if (!global.db.data.cap[m.chat]) return

  let cap = global.db.data.cap[m.chat][m.sender]
  if (!cap) return

  if (!global.db.data.capcd) global.db.data.capcd = {}
  if (!global.db.data.capcd[m.chat]) global.db.data.capcd[m.chat] = {}

  let cooldown = 10 * 60 * 1000
  let now = Date.now()

  let last = global.db.data.capcd[m.chat][m.sender] || 0

  if (now - last < cooldown) return

  global.db.data.capcd[m.chat][m.sender] = now

  let teks = [
    `Ehh ${cap} datang`,
    `Awas gengs ${cap} muncul`,
    `Oalah ${cap} online juga`,
    `Bahaya datang si ${cap}`,
    `Yang ditunggu datang juga`,
    `Waduh ada ${cap}`,
    `Si ${cap} ikut nimbrung`,
    `Loh loh ${cap} nongol`,
    `Hati-hati sama ${cap}`,
    `Akhirnya gerak juga ${cap}`
  ]

  let hasil = teks[Math.floor(Math.random() * teks.length)]

  conn.reply(m.chat, hasil, m, {
    mentions: [m.sender]
  })
}

handler.help = ['cap', 'delcap']
handler.tags = ['fun']
handler.command = /^(cap|delcap)$/i
handler.group = true
handler.admin = true

export default handler