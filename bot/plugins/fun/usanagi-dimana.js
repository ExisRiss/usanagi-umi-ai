/* By AlzRiss - Usanagi Umi AI */

const answers = [
  'Di dekatmu!', 'Jauh di sana.', 'Di tempat yang tidak kamu duga.',
  'Di hatimu.', 'Di sekitar sini.', 'Hmm, coba cari di kamar.',
  'Di luar sana, menunggumu.', 'Di tempat yang sama denganmu.',
  'Di suatu tempat yang indah.', 'Di balik pintu.', 'Di sebelah kirimu.',
  'Di depan matamu!', 'Jauh banget, di luar negeri mungkin?',
  'Di tempat yang penuh kenangan.', 'Di mana-mana!', 'Di dunia maya.',
  'Di alam mimpi.', 'Di tempat rahasia.', 'Hmm, susah dijelaskan lokasinya.',
  'Di tempat yang akan membuatmu bahagia.'
]

const handler = async (m) => {
  const text = (m.text || '').trim()
  if (!text) {
    return m.reply(
      `*DIMANA*\n\n` +
      `Masukkan pertanyaan yang ingin ditanyakan.\n\n` +
      `Contoh:\n` +
      `> .dimana jodohku berada?`
    )
  }
  const answer = answers[Math.floor(Math.random() * answers.length)]
  await m.reply(
    `*DIMANA*\n\n` +
    `Pertanyaan: ${text}\n\n` +
    `Jawaban: *${answer}*`
  )
}

handler.command = /^(dimana|where|mana)$/i
handler.help = ['dimana']
handler.tags = ['fun']
handler.description = 'Tanya bot di mana sesuatu berada'

export default handler
