
const answers = [
  'Bisa banget! Percaya diri aja!',
  'Hmm, kayaknya susah deh.',
  'Tentu bisa! Semangat!',
  'Nggak bisa, maaf.',
  'Mungkin bisa, kalau usaha keras.',
  'Pasti bisa! Jangan menyerah!',
  'Agak susah sih, tapi bisa dicoba.',
  'Bisa kok! Yakin deh!',
  'Kayaknya nggak deh.',
  'Bisa! Ayo buktikan!',
  'Hmm... aku ragu.',
  'Bisa banget! Gas terus!',
  'Nggak bisa, coba yang lain.',
  'Bisa! Percaya sama diri sendiri!',
  'Susah, tapi bukan berarti nggak mungkin.',
  'Absolutely! Kamu pasti bisa!',
  'Kayaknya perlu usaha ekstra nih.',
  'Bisa! Jangan ragukan dirimu!',
  'Hmm, coba lagi nanti deh.',
  'Bisa! Aku percaya kamu!'
]

const handler = async (m) => {
  const text = (m.text || '').trim()
  if (!text) {
    return m.reply(
      `*BISAKAH*\n\n` +
      `Masukkan pertanyaan yang ingin ditanyakan.\n\n` +
      `Contoh:\n` +
      `> .bisakah aku lulus ujian?`
    )
  }

  const answer = answers[Math.floor(Math.random() * answers.length)]
  await m.reply(
    `*BISAKAH*\n\n` +
    `Pertanyaan: ${text}\n\n` +
    `Jawaban: *${answer}*`
  )
}

handler.command = /^(bisakah|bisa)$/i
handler.help = ['bisakah']
handler.tags = ['fun']
handler.description = 'Tanya bot apakah sesuatu bisa dilakukan'

export default handler
