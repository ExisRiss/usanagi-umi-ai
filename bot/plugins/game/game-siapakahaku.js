import fs from 'fs'

function normalize(text) {
  return String(text || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function randomLimit() {
  return Math.floor(Math.random() * 10) + 1
}

function checkAnswer(input, answer) {
  input = normalize(input)
  answer = normalize(answer)

  if (input === answer) return true

  const inputWords = input.split(' ')
  const answerWords = answer.split(' ')

  // Semua kata pada input harus ada di jawaban
  return (
    inputWords.length > 0 &&
    inputWords.every(word => answerWords.includes(word))
  )
}

let handler = async (m, { conn }) => {
  conn.siapakahaku = conn.siapakahaku || {}

  if (m.chat in conn.siapakahaku) {
    return conn.sendMessage(
      m.chat,
      { text: '⚠️ Masih ada game yang belum selesai.' },
      { quoted: global.fstatus }
    )
  }

  const data = JSON.parse(
    fs.readFileSync('./json/siapakahaku.json', 'utf-8')
  )

  const json = data[Math.floor(Math.random() * data.length)]

  conn.siapakahaku[m.chat] = {
    jawaban: normalize(json.jawaban),
    answerOriginal: json.jawaban,
    isGame: true,
    gameName: '🕵️ SIAPAKAH AKU',
    timeout: setTimeout(async () => {
      if (!conn.siapakahaku[m.chat]) return

      await conn.sendMessage(
        m.chat,
        {
          text: `⏰ *Waktu habis!*

✅ Jawaban:
*${json.jawaban}*`
        },
        { quoted: global.fstatus }
      )

      delete conn.siapakahaku[m.chat]
    }, 60000)
  }

  await conn.sendMessage(
    m.chat,
    {
      text: `🕵️ *SIAPAKAH AKU*

${json.soal}

⏱️ Waktu: *60 Detik*`
    },
    { quoted: global.fstatus }
  )
}

handler.help = ['siapakahaku']
handler.tags = ['game']
handler.command = /^siapakahaku$/i

handler.all = async function (m) {
  if (!this.siapakahaku) return
  if (!(m.chat in this.siapakahaku)) return
  if (!m.text) return

  const game = this.siapakahaku[m.chat]

  if (!checkAnswer(m.text, game.answerOriginal)) return

  clearTimeout(game.timeout)

  const hadiah = randomLimit()

  const user = global.db.data.users[m.sender]
  if (user) {
    user.limit = Number(user.limit) || 0
    user.limit += hadiah
  }

  await this.sendMessage(
    m.chat,
    {
      text: `🎉 *BENAR!*

👤 Pemenang: @${m.sender.split('@')[0]}
✅ Jawaban: *${game.answerOriginal}*
🎁 Reward: *+${hadiah} Limit*`,
      mentions: [m.sender]
    },
    { quoted: global.fstatus }
  )

  delete this.siapakahaku[m.chat]
  return true
}

export default handler