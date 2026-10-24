
const answers = [
  '1', '7', '12', '21', '99', '69', '100', '50', '25', '1000',
  '5', '17', '88', '33', 'Banyak banget!', 'Cuma sedikit.',
  'Tak terhitung!', 'Hmm, sekitar 10-an.', 'Lebih dari yang kamu kira!',
  'Gak tau ah, males'
]

const handler = async (m) => {
  const text = (m.text || '').trim()
  if (!text) {
    return m.reply(
      `*BERAPA*\n\n` +
      `Masukkan pertanyaan yang ingin ditanyakan.\n\n` +
      `Contoh:\n` +
      `> .berapa umur jodohku?`
    )
  }
  const answer = answers[Math.floor(Math.random() * answers.length)]
  await m.reply(
    `*BERAPA*\n\n` +
    `Pertanyaan: ${text}\n\n` +
    `Jawaban: *${answer}*`
  )
}

handler.command = /^(berapa|howmuch|howmany)$/i
handler.help = ['berapa']
handler.tags = ['fun']
handler.description = 'Tanya bot berapa jumlah/nilai sesuatu'

export default handler
