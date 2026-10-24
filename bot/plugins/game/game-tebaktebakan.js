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
  conn.tebaktebakan = conn.tebaktebakan || {}
  if (m.chat in conn.tebaktebakan) return conn.sendMessage(m.chat, { text: 'Masih ada game yang belum selesai' }, { quoted: global.fstatus })

  let data = JSON.parse(fs.readFileSync('./json/tebaktebakan.json'))
  let json = data[Math.floor(Math.random() * data.length)]
  let jawaban = normalize(json.jawaban)

  let msg = await conn.sendMessage(m.chat, { text: `❓ *TEBAK TEBAKAN*\n\n${json.soal}\n\n⏱ Waktu: 60 detik` }, { quoted: global.fstatus })

  conn.tebaktebakan[m.chat] = {
    msg,
    jawaban,
    rawJawaban: json.jawaban,
    isGame: true,
    timeout: setTimeout(() => {
      if (conn.tebaktebakan[m.chat]) {
        conn.sendMessage(m.chat, { text: `⏰ Waktu habis!\n\nJawaban:\n${json.json || json.jawaban}` }, { quoted: global.fstatus })
        delete conn.tebaktebakan[m.chat]
      }
    }, 60000)
  }
}

handler.help = ['tebaktebakan']
handler.tags = ['game']
handler.command = /^tebaktebakan$/i

handler.all = async function (m) {
  if (!this.tebaktebakan) return
  if (!(m.chat in this.tebaktebakan)) return
  if (!m.text) return
  
  let game = this.tebaktebakan[m.chat]
  
  // Cek apakah user me-reply pesan soal dari bot
  if (!m.quoted || m.quoted.id !== game.msg.key.id) return

  let teks = normalize(m.text)

  // FIX BUG: Cegah spam emoji, simbol acak, atau teks kosong/terlalu pendek agar tidak dianggap benar
  // Pastikan teks mengandung minimal satu huruf atau angka (alfanumerik)
  let isAlphaNumeric = /[a-z0-9]/i.test(teks)
  if (!isAlphaNumeric || teks.length === 0) return

  // Cek kecocokan jawaban
  if (teks === game.jawaban || teks.includes(game.jawaban) || game.jawaban.includes(teks)) {
    clearTimeout(game.timeout)
    let hadiah = rewardLimit(m.sender)
    await this.sendMessage(m.chat, { text: winnerText(m.sender, hadiah, 'Tebak Tebakan'), mentions: [m.sender] }, { quoted: global.fstatus })
    delete this.tebaktebakan[m.chat]
    return true
  } else {
    // Memberikan respon jika jawaban salah saat me-reply soal
    await this.sendMessage(m.chat, { text: `❌ *SALAH!* Jawaban kamu kurang tepat.` }, { quoted: m })
  }
}

export default handler