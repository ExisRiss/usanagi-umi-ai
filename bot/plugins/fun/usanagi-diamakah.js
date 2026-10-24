/* By AlzRiss - Usanagi Umi AI */

const answers = [
  'di neraka',
  'di surga',
  'di mars',
  'di tengah laut',
  'di dada',
  'di hatimu',
  'di bawah meja',
  'di dimensi lain',
  'di kantong kamu',
  'di tempat yang tidak terduga'
]

const handler = async (m) => {
  const text = (m.text || '').trim()
  if (!text) {
    return m.reply(
      `*DIMANAKAH*\n\n` +
      `Masukkan pertanyaan.\n\n` +
      `Contoh:\n` +
      `> .dimanakah kunci motor`
    )
  }

  const answer = answers[Math.floor(Math.random() * answers.length)]
  await m.reply(
    `*DIMANAKAH*\n\n` +
    `Pertanyaan: ${text}\n\n` +
    `Jawaban: *${answer}*`
  )
}

handler.command = /^(dimanakah)$/i
handler.help = ['dimanakah']
handler.tags = ['fun']
handler.description = 'Tanya bot di manakah sesuatu'

export default handler
