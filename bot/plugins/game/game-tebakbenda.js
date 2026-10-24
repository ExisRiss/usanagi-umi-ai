import fs from 'fs'
import similarity from 'similarity'

const threshold = 0.72
const TIME_LIMIT = 60000
const HINT_TIME = 30000

const reward = {
  exp: 1500,
  limit: 2
}

let handler = async (m, { conn }) => {
  conn.tebakbenda = conn.tebakbenda || {}

  let id = m.chat

  if (id in conn.tebakbenda)
    return m.reply('❌ Masih ada soal tebak benda yang belum selesai!')

  let data = JSON.parse(
    fs.readFileSync('./json/tebakbenda.json', 'utf8')
  )

  let json = data[Math.floor(Math.random() * data.length)]

  let soal = json.question || json.soal
  let jawaban = Array.isArray(json.answer || json.jawaban)
    ? (json.answer || json.jawaban)
    : [(json.answer || json.jawaban)]

  let caption = `
🎮 *TEBAK BENDA*

${soal}

⏳ Waktu : 60 Detik

💎 Reward
• ${reward.exp} XP
• ${reward.limit} Limit

💬 Balas pesan ini untuk menjawab.
🏳️ Ketik *nyerah* untuk menyerah.
`.trim()

  let msg = await conn.reply(m.chat, caption, m)

  // Hint otomatis
  let hint = setTimeout(async () => {
    if (!(id in conn.tebakbenda)) return

    let ans = jawaban[0]

    let teksHint = ans
      .split('')
      .map((v, i) => {
        if (v === ' ') return ' '
        if (i === 0) return v
        return Math.random() < 0.35 ? v : '_'
      })
      .join(' ')

    await conn.reply(
      m.chat,
      `💡 *Hint*\n\n${teksHint}`,
      msg
    )
  }, HINT_TIME)

  let timeout = setTimeout(() => {
    if (!(id in conn.tebakbenda)) return

    clearTimeout(hint)

    conn.reply(
      m.chat,
      `⏰ *Waktu Habis!*\n\n✅ Jawaban : *${jawaban[0]}*`,
      msg
    )

    delete conn.tebakbenda[id]
  }, TIME_LIMIT)

  conn.tebakbenda[id] = [
    msg,
    {
      soal,
      jawaban
    },
    timeout,
    hint
  ]
}

handler.help = ['tebakbenda']
handler.tags = ['game']
handler.command = /^tebakbenda$/i
handler.limit = false

export default handler

handler.before = async function (m, { conn }) {
  conn.tebakbenda = conn.tebakbenda || {}

  let id = m.chat
  if (!(id in conn.tebakbenda)) return

  let [msg, data, timeout, hint] = conn.tebakbenda[id]

  if (!m.text) return
  if (!m.quoted) return
  if (m.quoted.id !== msg.key.id) return

  let text = m.text
    .toLowerCase()
    .replace(/[^\w\s-]+/g, '')
    .trim()

  // Menyerah
  if (/^((me)?nyerah|skip|giveup|surr?ender)$/i.test(text)) {
    clearTimeout(timeout)
    clearTimeout(hint)

    await conn.reply(
      m.chat,
      `🏳️ *MENYERAH!*\n\n✅ Jawaban : *${data.jawaban[0]}*`,
      m
    )

    delete conn.tebakbenda[id]
    return true
  }

  // Cek semua kemungkinan jawaban
  let sim = 0
  let benar = false

  for (let ans of data.jawaban) {
    let score = similarity(ans.toLowerCase(), text)

    if (score > sim) sim = score

    if (score >= 0.9) {
      benar = true
      break
    }
  }

  // Jawaban benar
  if (benar) {
    clearTimeout(timeout)
    clearTimeout(hint)

    let user = global.db.data.users[m.sender]

    user.exp = (user.exp || 0) + reward.exp
    user.limit = (user.limit || 0) + reward.limit

    await conn.reply(
      m.chat,
      `🎉 *BENAR!*\n\n` +
      `✅ Jawaban : *${data.jawaban[0]}*\n\n` +
      `🎁 Reward\n` +
      `✨ +${reward.exp} XP\n` +
      `🎫 +${reward.limit} Limit`,
      m
    )

    delete conn.tebakbenda[id]
    return true
  }

  // Hampir benar
  if (sim >= threshold) {
    m.reply("🤏 Dikit lagi!")
    return true
  }

  return true
}