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

async function fetchAyah() {
  try {
    const rand = Math.floor(Math.random() * 6236) + 1
    const res = await axios.get(`https://api.alquran.cloud/v1/ayah/${rand}/ar.alafasy`, { timeout: 30000 })
    if (!res.data || !res.data.data) throw new Error('Invalid')
    const ayah = res.data.data
    return {
      text: ayah.text,
      audio: ayah.audio,
      surah: ayah.surah && ayah.surah.englishName ? ayah.surah.englishName.toLowerCase().replace(/[^a-z ]/g, '') : ''
    }
  } catch (e) {
    throw new Error('Gagal mengambil data ayat!')
  }
}

let timeout = 60000

let handler = async (m, { conn, command }) => {
  conn.tebaksurah = conn.tebaksurah || {}
  const chat = m.chat
  let room = conn.tebaksurah[chat]

  if (command === 'tebaksurah') {
    if (room && room.jawaban) return m.reply('❌ Masih ada soal yang belum terjawab!')
    let data
    try { data = await fetchAyah() } catch (e) { return m.reply('❌ Gagal mengambil data ayat.') }

    await conn.sendMessage(chat, { text: `📖 *TEBAK SURAH*

Ayat:
"${data.text}"

⏳ Timeout: *${timeout / 1000} detik*
Ketik *.whosurah* untuk hint.` }, { quoted: m })
    if (data.audio) await conn.sendMessage(chat, { audio: { url: data.audio }, mimetype: 'audio/mpeg' }, { quoted: m })

    conn.tebaksurah[chat] = {
      jawaban: normalize(data.surah),
      rawJawaban: data.surah,
      isGame: true,
      timeout: setTimeout(() => {
        conn.reply(chat, `❌ Waktu habis!
Jawaban: *${data.surah}*`)
        delete conn.tebaksurah[chat]
      }, timeout)
    }
  }

  if (command === 'whosurah') {
    room = conn.tebaksurah[chat]
    if (!room || !room.jawaban) return m.reply('❌ Tidak ada game aktif.')
    let ans = room.rawJawaban || room.jawaban
    let hint = ans[0] + '_'.repeat(Math.max(ans.length - 2, 1)) + ans.slice(-1)
    return m.reply(`🧩 *Hint:* ${hint}`)
  }
}

handler.all = async function (m) {
  this.tebaksurah = this.tebaksurah || {}
  const room = this.tebaksurah[m.chat]
  if (!room || !room.jawaban) return

  let text = normalize(m.text)
  if (!text) return
  let ans = room.jawaban
  let cleanNoAl = ans.replace(/^al /, '')
  let noSpace = ans.replace(/ /g, '')

  if (text === ans || text === cleanNoAl || text === noSpace) {
    clearTimeout(room.timeout)
    let hadiah = rewardLimit(m.sender)
    this.reply(m.chat, winnerText(m.sender, hadiah, 'Tebak Surah', `Surah: *${room.rawJawaban.toUpperCase()}*`), m, { mentions: [m.sender] })
    delete this.tebaksurah[m.chat]
    return true
  }
}

handler.help = ['tebaksurah']
handler.tags = ['game']
handler.command = /^(tebaksurah|whosurah)$/i
handler.limit = false
export default handler
