import axios from 'axios'

const winScore = 4999
const finishBonus = 15000
const timeout = 5 * 60 * 1000 // 5 menit

function normalize(text = '') {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .trim()
}

async function handler(m) {
  this.game = this.game || {}

  const id = 'family100_' + m.chat

  if (id in this.game) {
    return this.reply(
      m.chat,
      '⚠️ Masih ada game Family100 yang belum selesai di chat ini.',
      this.game[id].msg
    )
  }

  try {
    const { data } = await axios.get(
      'https://api.siputzx.my.id/api/games/family100'
    )

    if (!data.status || !data.data)
      throw 'Gagal mengambil soal.'

    const json = data.data

    const answers = json.jawaban
      .map(v => String(v).trim())
      .sort(() => Math.random() - 0.5)

    const caption = `
🎮 *FAMILY100*

❓ *Soal:*
${json.soal}

📦 Jumlah Jawaban: *${answers.length}*
${answers.some(v => v.includes(' ')) ? '📝 Beberapa jawaban mengandung spasi.\n' : ''}
💡 Hint: Ketik *hint* sambil reply pesan ini
⏳ Waktu: *5 Menit*
📌 *Cara menjawab: Reply/Balas pesan ini dengan jawaban kamu!*

🏆 Reward:
+${winScore} XP / Jawaban
🎁 Bonus selesai: +${finishBonus} XP
`.trim()

    // MENGGUNAKAN this.sendMessage AGAR MENDAPATKAN KEY/ID PESAN LEBIH AKURAT
    const msg = await this.sendMessage(m.chat, { text: caption }, { quoted: m })

    const room = {
      id,
      soal: json.soal,
      jawaban: answers,
      jawabanNormal: answers.map(normalize),
      msg, // Menyimpan seluruh object pesan
      terjawab: Array(answers.length).fill(false),
      hint: 3,
      hinted: [],
      winScore,
      finishBonus,
      timeout: setTimeout(async () => {
        if (!(id in this.game)) return
        const ans = room.jawaban.map((v, i) => `${i + 1}. ${v}`).join('\n')
        await this.sendMessage(m.chat, {
          text: `⏰ *Waktu 5 menit telah habis!*\n\n📖 *Jawaban Family100:*\n\n${ans}`
        })
        delete this.game[id]
      }, timeout)
    }

    this.game[id] = room

  } catch (e) {
    console.error(e)
    m.reply('❌ Gagal mengambil soal Family100.')
  }
}

handler.help = ['family100']
handler.tags = ['game']
handler.command = /^family100$/i
handler.onlyprem = true
handler.game = true

handler.before = async function (m) {
  this.game = this.game || {}

  const id = 'family100_' + m.chat
  const room = this.game[id]

  if (!room) return
  if (m.isBaileys || !m.text) return
  
  // 1. Cek apakah pesan adalah sebuah balasan/reply
  if (!m.quoted) return

  // 2. Cek apakah yang di-reply adalah pesan dari bot itu sendiri
  const isFromBot = m.quoted.isBaileys || m.quoted.fromMe || (m.quoted.sender === this.user?.jid)
  if (!isFromBot) return

  // 3. FALLBACK LOGIC: Mengecek ID (jika bot base support) ATAU mengecek teks jika ID gagal
  const gameMsgId = room.msg?.key?.id
  const isExactId = gameMsgId ? (m.quoted.id === gameMsgId) : false
  const isTextMatch = m.quoted.text && m.quoted.text.includes('FAMILY100') && m.quoted.text.includes(room.soal)

  // Jika tidak memenuhi ID atau Text, abaikan
  if (!isExactId && !isTextMatch) return

  const text = normalize(m.text)

  // =======================
  // HINT
  // =======================
  if (text === 'hint') {
    if (room.hint <= 0) return m.reply('❌ Hint sudah habis!')

    const idx = room.jawaban.findIndex((v, i) => !room.terjawab[i] && !room.hinted.includes(i))
    if (idx < 0) return m.reply('Semua jawaban sudah ditemukan.')

    room.hinted.push(idx)
    room.hint--

    const clue = room.jawaban[idx]
      .split('')
      .map((c, i, arr) => (i === 0 || i === arr.length - 1 ? c : '_'))
      .join('')

    return m.reply(`💡 *Hint Family100*\n\n📝 ${clue}\n\nSisa hint: ${room.hint}`)
  }

  // =======================
  // CEK JAWABAN
  // =======================
  const answered = room.jawabanNormal.findIndex((v, i) => room.terjawab[i] && v === text)
  if (answered >= 0) return m.reply('⚠️ Jawaban itu sudah ditemukan!')

  const index = room.jawabanNormal.findIndex((v, i) => !room.terjawab[i] && v === text)
  if (index < 0) return m.reply(`❌ *Jawaban salah!*\n\n💭 "${m.text}" bukan jawaban yang ada.\nSilakan coba lagi!`)

  // JAWABAN BENAR
  room.terjawab[index] = m.sender
  let user = global.db.data.users[m.sender]
  if (user) user.exp += room.winScore

  const selesai = room.terjawab.every(Boolean)
  const papan = room.jawaban
    .map((v, i) => room.terjawab[i] ? `✅ ${i + 1}. ${v}` : `⬜ ${i + 1}. ${'_'.repeat(v.length)}`)
    .join('\n')

  await this.sendMessage(m.chat, {
    text: `🎮 *FAMILY100*\n\n${papan}\n\n🎉 @${m.sender.split('@')[0]} menjawab dengan benar!\n\n🏆 Reward:\n+${room.winScore} XP`,
    mentions: [m.sender]
  })

  // =======================
  // GAME SELESAI
  // =======================
  if (!selesai) return true

  clearTimeout(room.timeout)
  if (user) user.exp += room.finishBonus

  await this.sendMessage(m.chat, {
    text: `🏆 *FAMILY100 SELESAI!*\n\nSemua jawaban berhasil ditemukan 🎉\n\n🎁 Bonus selesai:\n+${room.finishBonus} XP`
  })

  delete this.game[id]
  return true
}

export default handler