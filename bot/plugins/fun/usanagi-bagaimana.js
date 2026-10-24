/* By AlzRiss - Usanagi Umi AI */

const answers = [
  'Caranya gampang, ya tinggal dilakuin aja!',
  'Hmm, susah dijelasin sih. Coba aja dulu!',
  'Dengan usaha dan doa pastinya.',
  'Ya begitulah caranya.',
  'Aku kurang tau sih, coba cari referensi lain.',
  'Pelan-pelan aja, nanti juga bisa.',
  'Dengan kerja keras dan pantang menyerah!',
  'Pertama, percaya sama diri sendiri dulu.',
  'Hmm, tiap orang beda-beda sih caranya.',
  'Ikutin kata hatimu aja.',
  'Belajar dari yang sudah berpengalaman.',
  'Step by step, jangan terburu-buru.',
  'Dengan tekad yang kuat!',
  'Mulai dari yang kecil dulu.',
  'Konsisten aja, nanti juga bisa.',
  'Jangan overthinking, langsung action!',
  'Gampang! Tinggal mulai aja!',
  'Caranya? Ya dicoba dulu!',
  'Dengan strategi yang tepat.',
  'Hmm, aku juga masih belajar sih.'
]

const handler = async (m) => {
  const text = (m.text || '').trim()
  if (!text) {
    return m.reply(
      `*BAGAIMANA*\n\n` +
      `Masukkan pertanyaan yang ingin ditanyakan.\n\n` +
      `Contoh:\n` +
      `> .bagaimana cara jadi sukses?`
    )
  }
  const answer = answers[Math.floor(Math.random() * answers.length)]
  await m.reply(
    `*BAGAIMANA*\n\n` +
    `Pertanyaan: ${text}\n\n` +
    `Jawaban: *${answer}*`
  )
}

handler.command = /^(bagaimana|gimana|how)$/i
handler.help = ['bagaimana']
handler.tags = ['fun']
handler.description = 'Tanya bot bagaimana cara melakukan sesuatu'

export default handler
