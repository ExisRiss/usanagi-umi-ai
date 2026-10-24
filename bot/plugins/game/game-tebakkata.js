import axios from 'axios'

const timeout = 2 * 60 * 1000 // 2 menit
const reward = 5000

let handler = async (m, { conn }) => {
  conn.tebakKata = conn.tebakKata || {}

  let id = m.chat

  if (conn.tebakKata[id]) {
    return m.reply('❗ Masih ada game Tebak Kata yang berjalan di chat ini!')
  }

  try {
    let res = await axios.get('https://api.siputzx.my.id/api/games/tebakkata')

    if (!res.data.status) throw 'API error'

    let data = res.data.data

    conn.tebakKata[id] = {
      soal: data.soal,
      jawaban: data.jawaban.toUpperCase(),
      time: Date.now()
    }

    await conn.sendMessage(m.chat, {
      text: `🧩 *TEBAK KATA*

❓ Soal:
${data.soal}

💡 Petunjuk:
Gabungkan semua kata di atas menjadi satu jawaban.

⏳ Waktu: 2 menit
🎁 Hadiah: ${reward} XP

Ketik jawabanmu!`
    }, {
      quoted: m
    })


    setTimeout(() => {
      if (conn.tebakKata[id]) {
        conn.sendMessage(id, {
          text: `⏰ Waktu habis!

Jawabannya:
*${conn.tebakKata[id].jawaban}*`
        })

        delete conn.tebakKata[id]
      }
    }, timeout)


  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal mengambil soal Tebak Kata!')
  }
}


handler.help = ['tebakkata']
handler.tags = ['game']
handler.command = /^(tebakkata|tk)$/i
handler.limit = true

export default handler


// ===============================
// CEK JAWABAN
// ===============================

handler.before = async function (m, { conn }) {

  conn.tebakKata = conn.tebakKata || {}

  let id = m.chat
  let game = conn.tebakKata[id]

  if (!game) return

  // wajib reply pesan soal
  if (!m.quoted) return

  // cek apakah reply ke pesan bot tebak kata
  if (!m.quoted.text?.includes('TEBAK KATA')) return

  if (!m.text) return


  let answer = m.text
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')


  let correct = game.jawaban
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')


  if (answer === correct) {

    let user = global.db.data.users[m.sender]

    if (user) {
      user.exp += reward
    }

    await conn.sendMessage(m.chat, {
      text: `🎉 *BENAR!*

Jawaban:
✅ ${game.jawaban}

👤 Penjawab:
@${m.sender.split('@')[0]}

🎁 +${reward} XP`,
      mentions: [m.sender]
    }, {
      quoted: m
    })


    delete conn.tebakKata[id]

  } else {

    m.reply('❌ Jawaban salah!')
  }
}