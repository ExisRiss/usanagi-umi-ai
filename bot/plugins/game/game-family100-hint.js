let handler = async (m, { conn }) => {
  conn.game = conn.game || {}

  const id = 'family100_' + m.chat

  if (!(id in conn.game))
    return m.reply('❌ Tidak ada game *Family100* yang sedang berlangsung.')

  const room = conn.game[id]

  if (room.hint <= 0)
    return m.reply('❌ Hint sudah habis.')

  // Cari jawaban yang belum dijawab & belum pernah dihint
  const available = room.jawaban
    .map((_, i) => i)
    .filter(i => !room.terjawab[i] && !room.hinted.includes(i))

  if (!available.length)
    return m.reply('🎉 Semua jawaban sudah terbuka!')

  // Ambil satu secara acak
  const index = available[Math.floor(Math.random() * available.length)]

  room.hinted.push(index)
  room.hint--

  const answer = room.jawaban[index]

  // Tampilkan huruf pertama saja
  const hint =
    answer[0].toUpperCase() +
    '*'.repeat(Math.max(answer.length - 1, 0))

  const progress =
    room.terjawab.filter(Boolean).length + '/' + room.jawaban.length

  await m.reply(`
💡 *Hint Family100*

Jawaban ke-*${index + 1}*

\`${hint}\`

📊 Progress : ${progress}
🎫 Sisa Hint : ${room.hint}/3
`.trim())
}

handler.help = ['hint']
handler.tags = ['game']
handler.command = /^(hint)$/i
handler.game = true

export default handler