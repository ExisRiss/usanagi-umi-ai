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
  conn.susunkata = conn.susunkata || {}

  if (m.chat in conn.susunkata)
    return conn.sendMessage(
      m.chat,
      { text: 'Masih ada game yang belum selesai' },
      { quoted: global.fstatus }
    )

  let data = JSON.parse(fs.readFileSync('./json/susunkata.json', 'utf-8'))
  let json = data[Math.floor(Math.random() * data.length)]
  let jawaban = normalize(json.jawaban)

  conn.susunkata[m.chat] = {
    jawaban,
    answer: jawaban,
    answerOriginal: json.jawaban,
    isGame: true,
    gameName: '🧩 SUSUN KATA',
    timeout: setTimeout(() => {
      if (conn.susunkata[m.chat]) {
        conn.sendMessage(
          m.chat,
          { text: `⏰ Waktu habis!

Jawaban:
${json.jawaban}` },
          { quoted: global.fstatus }
        )
        delete conn.susunkata[m.chat]
      }
    }, 60000)
  }

  conn.sendMessage(
    m.chat,
    { text: `🧩 *SUSUN KATA*

${json.soal}

⏱ Waktu: 60 detik` },
    { quoted: global.fstatus }
  )
}

handler.help = ['susunkata']
handler.tags = ['game']
handler.command = /^susunkata$/i

handler.all = async function (m) {
  if (!this.susunkata) return
  if (!(m.chat in this.susunkata)) return
  if (!m.text) return

  let game = this.susunkata[m.chat]
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

    delete this.susunkata[m.chat]
    return true
  }
}

export default handler
