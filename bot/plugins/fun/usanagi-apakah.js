
const answers = [
  'Ya, tentu saja!',
  'Tidak, sepertinya tidak.',
  'Mungkin saja, coba lagi nanti.',
  'Hmm... aku rasa iya.',
  'Aku ragu, tapi bisa jadi.',
  'Pasti! 100%!',
  'Tidak mungkin.',
  'Bisa jadi, siapa yang tau?',
  'Menurutku sih iya.',
  'Wah, kayaknya nggak deh.',
  'Tentu, kenapa tidak?',
  'Aku nggak tau, coba tanya yang lain.',
  'Ya ampun, pasti lah!',
  'Hmm... sepertinya tidak.',
  'Aku yakin iya!',
  'Nggak mungkin banget.',
  'Mungkin, tapi jangan berharap terlalu tinggi.',
  'Iya dong!',
  'Nggak, maaf ya.',
  'Bisa! Semangat!'
]

const handler = async (m) => {
  const text = (m.text || '').trim()
  if (!text) {
    return m.reply(
      `*APAKAH*\n\n` +
      `Masukkan pertanyaan yang ingin ditanyakan.\n\n` +
      `Contoh:\n` +
      `> .apakah aku bisa kaya?`
    )
  }

  const answer = answers[Math.floor(Math.random() * answers.length)]
  await m.reply(
    `*APAKAH*\n\n` +
    `Pertanyaan: ${text}\n\n` +
    `Jawaban: *${answer}*`
  )
}

handler.command = /^(apakah|apa)$/i
handler.help = ['apakah']
handler.tags = ['fun']
handler.description = 'Tanya bot apakah sesuatu akan terjadi'

export default handler
