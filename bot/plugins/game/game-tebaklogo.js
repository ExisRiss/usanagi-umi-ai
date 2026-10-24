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
  conn.tebaklogo = conn.tebaklogo || {}
  if (m.chat in conn.tebaklogo) return conn.sendMessage(m.chat, { text: '❀ Masih ada game yang belum selesai' }, { quoted: global.fstatus })

  let data = JSON.parse(fs.readFileSync('./json/tebaklogo.json'))
  let json = data[Math.floor(Math.random() * data.length)]
  let jawaban = normalize(json.jawaban)

  conn.tebaklogo[m.chat] = {
    jawaban,
    rawJawaban: json.jawaban,
    isGame: true,
    timeout: setTimeout(() => {
      if (conn.tebaklogo[m.chat]) {
        conn.sendMessage(m.chat, { text: `❀ Waktu habis!

🏷 Game : *Tebak Logo*

Jawaban :
${json.jawaban}` }, { quoted: global.fstatus })
        delete conn.tebaklogo[m.chat]
      }
    }, 60000)
  }

  await conn.sendMessage(m.chat, { image: { url: json.img }, caption: `🏷 「 *TEBAK LOGO* 」

Tebak logo berikut

Waktu : 60 detik` }, { quoted: global.fstatus })
}

handler.help = ['tebaklogo']
handler.tags = ['game']
handler.command = /^tebaklogo$/i

handler.all = async function (m) {
  if (!this.tebaklogo) return
  if (!(m.chat in this.tebaklogo)) return
  if (!m.text) return

  let game = this.tebaklogo[m.chat]
  let teks = normalize(m.text)
  if (/^((me)?nyerah|skip|surr?ender)$/i.test(teks)) {
    clearTimeout(game.timeout)
    await this.sendMessage(m.chat, { text: `🏳️ Menyerah!

🏷 Game : *Tebak Logo*

Jawaban :
${game.rawJawaban || game.jawaban}` }, { quoted: global.fstatus })
    delete this.tebaklogo[m.chat]
    return true
  }

  if (teks === game.jawaban || teks.includes(game.jawaban) || game.jawaban.includes(teks)) {
    clearTimeout(game.timeout)
    let hadiah = rewardLimit(m.sender)
    await this.sendMessage(m.chat, { text: winnerText(m.sender, hadiah, 'Tebak Logo'), mentions: [m.sender] }, { quoted: global.fstatus })
    delete this.tebaklogo[m.chat]
    return true
  }
}

export default handler
