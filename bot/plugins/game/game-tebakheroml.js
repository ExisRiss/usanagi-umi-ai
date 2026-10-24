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

let timeout = 60000

let handler = async (m, { conn, usedPrefix, command }) => {
  conn.game = conn.game || {}
  const id = 'tebakheroml-' + m.chat

  if (command === 'tebakheroml') {
    if (id in conn.game) return m.reply('Masih ada soal yang belum terjawab!')

    let data
    try {
      const res = await axios.get('https://api.deline.web.id/game/tebakheroml')
      if (!res.data || !res.data.result) throw new Error('invalid')
      data = res.data.result
    } catch (e) {
      return m.reply('Gagal mengambil data hero, coba lagi.')
    }

    const answer = normalize(data.jawaban)
    const clue = data.deskripsi || 'Tidak ada deskripsi.'
    let caption = `🎮 *TEBAK HERO ML*
Lihat gambar berikut dan tebak heronya!

Timeout: *${timeout / 1000} detik*
Clue: ${clue}
Ketik *${usedPrefix}whohero* untuk bantuan
Reward: Limit Random`.trim()
    let msg = await conn.sendFile(m.chat, data.img, 'hero.jpg', caption, m)

    conn.game[id] = {
      msg,
      jawaban: answer,
      rawJawaban: data.jawaban,
      isGame: true,
      timeout: setTimeout(() => {
        if (conn.game[id]) {
          conn.reply(m.chat, `⏳ *Waktu habis!*
Jawabannya adalah: *${data.jawaban}*`, conn.game[id].msg || m)
          delete conn.game[id]
        }
      }, timeout)
    }
  }

  if (command === 'whohero') {
    if (!(id in conn.game)) return m.reply('Tidak ada game aktif.')
    let ans = conn.game[id].rawJawaban || conn.game[id].jawaban
    let hint = ans[0] + '_'.repeat(Math.max(ans.length - 2, 1)) + ans.slice(-1)
    return m.reply(`🧩 *Hint:* ${hint}`)
  }
}

handler.all = async function (m) {
  this.game = this.game || {}
  const id = 'tebakheroml-' + m.chat
  if (!(id in this.game)) return

  let text = normalize(m.text)
  if (!text) return
  let room = this.game[id]
  if (text === room.jawaban || text.includes(room.jawaban) || room.jawaban.includes(text)) {
    clearTimeout(room.timeout)
    let hadiah = rewardLimit(m.sender)
    this.reply(m.chat, winnerText(m.sender, hadiah, 'Tebak Hero ML', `Jawaban: *${room.rawJawaban}*`), room.msg || m, { mentions: [m.sender] })
    delete this.game[id]
    return true
  }
}

handler.help = ['tebakheroml']
handler.tags = ['game']
handler.command = /^(tebakheroml|whohero)$/i
handler.limit = false
export default handler
