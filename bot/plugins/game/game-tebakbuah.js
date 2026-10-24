import fs from 'fs'
import similarity from 'similarity'

const threshold = 0.72
const TIME_LIMIT = 60000

let handler = async (m, { conn }) => {
  conn.tebakbuah = conn.tebakbuah ? conn.tebakbuah : {}

  let id = m.chat
  if (id in conn.tebakbuah)
    return m.reply('Masih ada soal tebak buah yang belum selesai')

  let data = JSON.parse(fs.readFileSync('./json/tebakbuah.json', 'utf-8'))
  let json = data[Math.floor(Math.random() * data.length)]

  let soal = json.soal
  let jawaban = json.jawaban.toLowerCase()

  let caption = `
🍉 *TEBAK BUAH*

${soal}

⏳ Waktu: 60 detik
Ketik *nyerah* untuk menyerah
`.trim()

  let msg = await m.reply(caption)

  conn.tebakbuah[id] = [
    msg,
    { soal, jawaban },
    setTimeout(() => {
      let data = conn.tebakbuah[id]
      if (!data) return

      m.reply(`⏰ Waktu habis!\n\nJawaban: *${data[1].jawaban}*`)
      delete conn.tebakbuah[id]
    }, TIME_LIMIT)
  ]
}

handler.help = ['tebakbuah']
handler.tags = ['game']
handler.command = /^tebakbuah$/i
handler.limit = false

export default handler

// 🔥 BEFORE (jawaban + reward)
handler.before = async function (m, { conn }) {
  conn.tebakbuah = conn.tebakbuah ? conn.tebakbuah : {}

  let id = m.chat
  if (!(id in conn.tebakbuah)) return

  let [msg, data, time] = conn.tebakbuah[id]
  if (!m.text) return

  let text = m.text.toLowerCase().replace(/[^\w\s\-]+/g, '').trim()

  // 🏳️ nyerah
  if (/^((me)?nyerah|surr?ender)$/i.test(text)) {
    clearTimeout(time)
    m.reply(`🏳️ *MENYERAH!*\n\nJawaban: *${data.jawaban}*`)
    delete conn.tebakbuah[id]
    return true
  }

  let sim = similarity(data.jawaban, text)

  // ✅ BENAR
  if (sim >= 0.9) {
    clearTimeout(time)

    let user = global.db.data.users[m.sender]
    let reward = 5

    if (!user.limit) user.limit = 0
    user.limit += reward

    await conn.reply(
      m.chat,
      `🎉 *BENAR!*\n\nJawaban: *${data.jawaban}*\n+${reward} Limit 🎁`,
      m
    )

    delete conn.tebakbuah[id]
  }

  // 🤏 DIKIT LAGI
  else if (sim >= threshold) {
    m.reply('🤏 Dikit lagi!')
  }

  return true
}