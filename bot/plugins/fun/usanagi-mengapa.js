/* By AlzRiss - Usanagi Umi AI */

const answers = [
  'Karena takdir bilang begitu.',
  'Ya karena emang gitu.',
  'Karena kamu pantas mendapatkannya.',
  'Karena dunia memang tidak adil kadang.',
  'Karena ada pelajaran di baliknya.',
  'Karena itu yang terbaik untukmu saat ini.',
  'Karena hati bilang iya.',
  'Karena semesta sedang menyusun rencana.',
  'Karena kamu belum siap menerima yang lebih baik.',
  'Karena masih ada yang harus kamu pelajari.',
  'Karena waktu belum tepat.',
  'Karena kamu masih butuh proses.',
  'Karena itu yang kamu butuhkan, bukan yang kamu mau.',
  'Karena ada hikmah di baliknya.',
  'Karena hidup memang penuh kejutan.'
]

const handler = async (m) => {
  const text = (m.text || '').trim()
  if (!text) {
    return m.reply(
      `*MENGAPA*\n\n` +
      `Masukkan pertanyaan yang ingin ditanyakan.\n\n` +
      `Contoh:\n` +
      `> .mengapa aku selalu gagal?`
    )
  }
  const answer = answers[Math.floor(Math.random() * answers.length)]
  await m.reply(
    `*MENGAPA*\n\n` +
    `Pertanyaan: ${text}\n\n` +
    `Jawaban: *${answer}*`
  )
}

handler.command = /^(mengapa|kenapa|why)$/i
handler.help = ['mengapa']
handler.tags = ['fun']
handler.description = 'Tanya bot mengapa sesuatu terjadi'

export default handler
