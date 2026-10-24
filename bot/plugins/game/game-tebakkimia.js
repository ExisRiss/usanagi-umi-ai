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
  conn.tebakkimia = conn.tebakkimia || {}

  if (m.chat in conn.tebakkimia) return conn.sendMessage(m.chat, { text: 'Masih ada game yang belum selesai' }, { quoted: global.fstatus })

  let data = JSON.parse(fs.readFileSync('./json/tebakkimia.json'))
  let json = data[Math.floor(Math.random() * data.length)]
  let jawaban = normalize(json.lambang)

  conn.tebakkimia[m.chat] = {
    jawaban,
    rawJawaban: json.lambang,
    isGame: true,
    timeout: setTimeout(() => {
      if (conn.tebakkimia[m.chat]) {
        conn.sendMessage(m.chat, { text: `⏰ Waktu habis!

Jawaban:
${json.lambang}` }, { quoted: global.fstatus })
        delete conn.tebakkimia[m.chat]
      }
    }, 60000)
  }

  conn.sendMessage(m.chat, { text: `⚗️ *TEBAK KIMIA*

${json.unsur}

⏱ Waktu: 60 detik` }, { quoted: global.fstatus })
}

handler.help = ['tebakkimia']
handler.tags = ['game']
handler.command = /^tebakkimia$/i

handler.all = async function (m) {
  if (!this.tebakkimia) return
  if (!(m.chat in this.tebakkimia)) return
  if (!m.text) return

  let game = this.tebakkimia[m.chat]
  let teks = normalize(m.text)
  if (teks === game.jawaban) {
    clearTimeout(game.timeout)
    let hadiah = rewardLimit(m.sender)
    await this.sendMessage(m.chat, { text: winnerText(m.sender, hadiah, 'Tebak Kimia'), mentions: [m.sender] }, { quoted: global.fstatus })
    delete this.tebakkimia[m.chat]
    return true
  }
}

export default handler
