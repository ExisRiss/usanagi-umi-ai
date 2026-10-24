
const answers = [
  'Hmm, aku coba ya... Kamu lagi mikirin makanan!',
  'Aku tebak... Kamu lagi gabut!',
  'Coba ya... Kayaknya kamu lagi seneng!',
  'Hmm, aku rasa kamu lagi bingung.',
  'Aku coba nebak... Kamu lagi kangen seseorang?',
  'Kayaknya kamu lagi santai deh.',
  'Aku tebak kamu lagi scroll HP terus.',
  'Hmm, pasti lagi bosan ya?',
  'Coba ditebak... Kamu lagi pengen jalan-jalan!',
  'Aku rasa kamu lagi butuh hiburan.',
  'Hmm, kayaknya kamu lagi happy!',
  'Aku coba... Kamu pasti lagi penasaran!',
  'Tebakan aku: kamu lagi rebahan.',
  'Hmm, kamu mungkin lagi mikirin seseorang spesial.',
  'Aku coba: kamu lagi mau curhat?',
  'Kayaknya kamu lagi pengen main game!',
  'Hmm, aku tebak kamu lagi dengerin musik.',
  'Coba aku tebak... Kamu lagi di kamar!',
  'Aku rasa kamu lagi waiting for something.',
  'Hmm, tebakan aku: kamu butuh temen ngobrol!'
]

const handler = async (m) => {
  const text = (m.text || '').trim()
  if (!text) {
    return m.reply(
      `*COBA*\n\n` +
      `Masukkan sesuatu untuk ditebak.\n\n` +
      `Contoh:\n` +
      `> .coba tebak apa yang aku pikirkan`
    )
  }
  const answer = answers[Math.floor(Math.random() * answers.length)]
  await m.reply(
    `*COBA*\n\n` +
    `Input: ${text}\n\n` +
    `Tebakan: *${answer}*`
  )
}

handler.command = /^(coba|try)$/i
handler.help = ['coba']
handler.tags = ['fun']
handler.description = 'Coba tebak sesuatu secara acak'

export default handler
