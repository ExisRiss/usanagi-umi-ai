import fs from 'fs'

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function randomLimit() {
  return Math.floor(Math.random() * 10) + 1
}

let handler = async (m, { conn }) => {
  conn.tebakanml = conn.tebakanml || {}

  if (m.chat in conn.tebakanml)
    return conn.sendMessage(
      m.chat,
      { text: 'Masih ada game yang belum selesai' },
      { quoted: global.fstatus }
    )

  let data = JSON.parse(fs.readFileSync('./json/tebakanml.json', 'utf-8'))
  let json = data[Math.floor(Math.random() * data.length)]
  let jawaban = normalize(json.jawaban)

  conn.tebakanml[m.chat] = {
    jawaban,
    answer: jawaban,
    answerOriginal: json.jawaban,
    isGame: true,
    gameName: '🎮 TEBAKAN ML',
    timeout: setTimeout(() => {
      if (conn.tebakanml[m.chat]) {
        conn.sendMessage(
          m.chat,
          { text: `⏰ Waktu habis!

Jawaban:
${json.jawaban}` },
          { quoted: global.fstatus }
        )
        delete conn.tebakanml[m.chat]
      }
    }, 60000)
  }

  conn.sendMessage(
    m.chat,
    { text: `🎮 *TEBAKAN ML*

${json.soal}

⏱ Waktu: 60 detik` },
    { quoted: global.fstatus }
  )
}

handler.help = ['tebakanml']
handler.tags = ['game']
handler.command = /^tebakanml$/i

handler.all = async function (m) {
  if (!this.tebakanml) return
  if (!(m.chat in this.tebakanml)) return
  if (!m.text) return

  let game = this.tebakanml[m.chat]
  let teks = normalize(m.text)

  if (teks === game.jawaban || teks.includes(game.jawaban) || game.jawaban.includes(teks)) {
    clearTimeout(game.timeout)

    let hadiah = randomLimit()
    let user = global.db.data.users[m.sender]
    if (user) {
      if (!user.limit) user.limit = 0
      user.limit += hadiah
    }

    await this.sendMessage(
      m.chat,
      {
        text: `🎉 *BENAR!*

👤 Pemenang: @${m.sender.split('@')[0]}
🎁 Reward: +${hadiah} Limit`,
        mentions: [m.sender]
      },
      { quoted: global.fstatus }
    )

    delete this.tebakanml[m.chat]
    return true
  }
}

export default handler
