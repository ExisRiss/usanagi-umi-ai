import fs from 'fs'

// normalize
function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

let handler = async (m, { conn }) => {

  conn.tebaklirik = conn.tebaklirik || {}

  if (m.chat in conn.tebaklirik)
    return conn.sendMessage(
      m.chat,
      { text: 'Masih ada game yang belum selesai' },
      { quoted: global.fstatus }
    )

  let data = JSON.parse(fs.readFileSync('./json/tebaklirik.json'))
  let json = data[Math.floor(Math.random() * data.length)]

  let jawaban = normalize(json.jawaban)

  conn.tebaklirik[m.chat] = {
    jawaban,
    isGame: true,
    timeout: setTimeout(() => {

      if (conn.tebaklirik[m.chat]) {

        conn.sendMessage(
          m.chat,
          {
            text: `⏰ Waktu habis!\n\nJawaban:\n${json.jawaban}`
          },
          { quoted: global.fstatus }
        )

        delete conn.tebaklirik[m.chat]

      }

    }, 60000)
  }

  conn.sendMessage(
    m.chat,
    {
      text: `🎵 *TEBAK LIRIK*\n\n${json.soal}\n\n⏱ Waktu: 60 detik`
    },
    { quoted: global.fstatus }
  )
}

handler.help = ['tebaklirik']
handler.tags = ['game']
handler.command = /^tebaklirik$/i

handler.all = async function (m) {

  if (!this.tebaklirik) return
  if (!(m.chat in this.tebaklirik)) return
  if (!m.text) return

  let game = this.tebaklirik[m.chat]
  let teks = normalize(m.text)

  if (teks.includes(game.jawaban) || game.jawaban.includes(teks)) {

    clearTimeout(game.timeout)

    let hadiah = Math.floor(Math.random() * 10) + 1

    let user = global.db.data.users[m.sender]
    if (user) user.limit += hadiah

    await this.sendMessage(
      m.chat,
      {
        text: `🎉 *BENAR!*\n\n` +
              `👤 Pemenang: @${m.sender.split('@')[0]}\n` +
              `🎁 Reward: +${hadiah} Limit`,
        mentions: [m.sender]
      },
      { quoted: global.fstatus }
    )

    delete this.tebaklirik[m.chat]

    return true
  }
}

export default handler