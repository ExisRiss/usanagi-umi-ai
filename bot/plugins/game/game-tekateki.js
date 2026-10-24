import axios from 'axios'

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function rewardLimit(sender) {
  let hadiah = Math.floor(Math.random() * 10) + 1
  let user = global.db.data.users[sender]
  if (user) {
    if (!user.limit) user.limit = 0
    user.limit += hadiah
  }
  return hadiah
}

function winnerText(sender, hadiah, gameName, answerExtra) {
  return `🎉 *BENAR!*\n\n🎮 Game : ${gameName}\n👤 Pemenang: @${sender.split('@')[0]}\n🎁 Reward: +${hadiah} Limit${answerExtra ? '\n' + answerExtra : ''}`
}

async function scrapeTekateki() {
  try {
    const res = await axios.get('https://raw.githubusercontent.com/BochilTeam/database/master/games/tekateki.json', { timeout: 30000 })
    const data = res.data
    const pick = data[Math.floor(Math.random() * data.length)]
    if (!pick.soal || !pick.jawaban) throw new Error('Invalid Data')
    return { soal: pick.soal, answer: pick.jawaban }
  } catch (e) {
    throw new Error('Gagal mengambil data teka-teki!')
  }
}

let timeout = 60000

let handler = async (m, { conn, command, isAdmin, isOwner }) => {
  conn.tekateki = conn.tekateki || {}
  const chat = m.chat
  let room = conn.tekateki[chat]

  if (command === 'tekateki') {
    if (room && room.jawaban) return conn.reply(chat, 'Masih ada game yang belum selesai.', m)
    const data = await scrapeTekateki()
    await conn.reply(chat, `🧩 *TEKA-TEKI*

"${data.soal}"

⏳ Waktu: *60 detik*.
Jawab dengan benar.`, m)
    conn.tekateki[chat] = {
      jawaban: normalize(data.answer),
      rawJawaban: data.answer,
      player: m.sender,
      isGame: true,
      timeout: setTimeout(() => {
        conn.reply(chat, `❌ Waktu habis!
Jawaban: *${data.answer}*`)
        delete conn.tekateki[chat]
      }, timeout)
    }
  }

  if (command === 'whoteka') {
    room = conn.tekateki[chat]
    if (!room || !room.jawaban) return conn.reply(chat, '❌ Tidak ada game aktif.', m)
    if (!isAdmin && !isOwner) return conn.reply(chat, '❌ Tidak diizinkan.', m)
    let ans = room.rawJawaban || room.jawaban
    let hint = ans[0] + '_'.repeat(Math.max(ans.length - 2, 1)) + ans.slice(-1)
    return conn.reply(chat, `🧩 *KLU:* ${hint}`, m)
  }
}

handler.all = async function (m) {
  this.tekateki = this.tekateki || {}
  const room = this.tekateki[m.chat]
  if (!room || !room.jawaban) return
  const text = normalize(m.text)
  if (!text) return

  if (text === room.jawaban || text.includes(room.jawaban) || room.jawaban.includes(text)) {
    clearTimeout(room.timeout)
    let hadiah = rewardLimit(m.sender)
    this.reply(m.chat, winnerText(m.sender, hadiah, 'Teka-Teki', `Jawaban: *${room.rawJawaban}*`), m, { mentions: [m.sender] })
    delete this.tekateki[m.chat]
    return true
  }
}

handler.help = ['tekateki']
handler.tags = ['game']
handler.command = /^(tekateki|whoteka)$/i
handler.limit = false
export default handler
