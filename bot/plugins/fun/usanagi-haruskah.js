/* By AlzRiss - Usanagi Umi AI */

const answers = [
  'Ya, harus banget!',
  'Tidak usah, lebih baik tidak.',
  'Mungkin sebaiknya iya.',
  'Terserah kamu, tapi aku saranin iya.',
  'Jangan dulu, nunggu waktu yang tepat.',
  'Harus! Jangan ragu.',
  'Nggak harus, santai aja.',
  'Menurutku sih harus.',
  'Lebih baik dipikirkan lagi.',
  'Lakukan saja jika kamu siap.',
  'Ya, sekarang juga!',
  'Nggak perlu dipaksakan.',
  'Harus, biar nggak nyesel.',
  'Coba tunda dulu.',
  'Tentu harus!'
]

const handler = async (m) => {
  const text = (m.text || '').trim()
  if (!text) {
    return m.reply(
      `*HARUSKAH*\n\n` +
      `Masukkan pertanyaan yang ingin ditanyakan.\n\n` +
      `Contoh:\n` +
      `> .haruskah aku beli ini?`
    )
  }

  const answer = answers[Math.floor(Math.random() * answers.length)]
  await m.reply(
    `*HARUSKAH*\n\n` +
    `Pertanyaan: ${text}\n\n` +
    `Jawaban: *${answer}*`
  )
}

handler.command = /^(haruskah|harus)$/i
handler.help = ['haruskah']
handler.tags = ['fun']
handler.description = 'Tanya bot apakah sesuatu harus dilakukan'

export default handler
