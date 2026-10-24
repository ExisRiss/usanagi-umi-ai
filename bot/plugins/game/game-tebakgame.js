import fs from 'fs'

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

let handler = async (m, { conn }) => {
  conn.game = conn.game || {}

  let id = 'tebakgame-' + m.chat
  if (id in conn.game) {
    return conn.sendMessage(m.chat, { text: 'Masih ada game yang belum selesai' }, { quoted: global.fstatus })
  }

  let data = JSON.parse(fs.readFileSync('./json/tebakgame.json'))
  let json = data[Math.floor(Math.random() * data.length)]
  let jawaban = normalize(json.jawaban)

  conn.game[id] = {
    jawaban,
    rawJawaban: json.jawaban,
    isGame: true,
    timeout: setTimeout(() => {
      if (conn.game[id]) {
        conn.sendMessage(m.chat, { text: `⏰ Waktu habis!

🎮 Game : Tebak Game

Jawaban:
${json.jawaban}` }, { quoted: global.fstatus })
        delete conn.game[id]
      }
    }, 60000)
  }

  await conn.sendMessage(m.chat, {
    image: { url: json.img },
    caption: `🎮 *TEBAK GAME*

Tebak nama game dari gambar ini

⏱ Waktu : 60 detik`
  }, { quoted: global.fstatus })
}

handler.help = ['tebakgame']
handler.tags = ['game']
handler.command = /^tebakgame$/i

handler.before = async function (m) {
  this.game = this.game || {}
  let id = 'tebakgame-' + m.chat
  if (!(id in this.game)) return
  if (!m.text) return

  let room = this.game[id]
  let teks = normalize(m.text)
  if (teks === room.jawaban || teks.includes(room.jawaban) || room.jawaban.includes(teks)) {
    clearTimeout(room.timeout)
    let hadiah = rewardLimit(m.sender)
    await this.sendMessage(m.chat, { text: winnerText(m.sender, hadiah, 'Tebak Game'), mentions: [m.sender] }, { quoted: global.fstatus })
    delete this.game[id]
    return true
  }
}

export default handler
