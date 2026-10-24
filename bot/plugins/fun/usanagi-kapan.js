/* By AlzRiss - Usanagi Umi AI */

const answers = [
  'Besok mungkin?', 'Tahun depan kayaknya.', '3 hari lagi!',
  'Hmm, masih lama sih.', 'Sebentar lagi kok!', 'Kalau sudah waktunya, pasti terjadi.',
  'Bulan depan!', 'Entah kapan, yang penting sabar.', 'Dalam waktu dekat!',
  '10 tahun lagi mungkin?', 'Nggak lama lagi!', 'Kalau jodoh, pasti ketemu.',
  'Hmm, susah diprediksi.', 'Minggu depan!', 'Kalau usahanya lebih keras, lebih cepat!',
  'Pas waktunya tepat.', 'Secepatnya, tenang aja.', 'Ntar kalo udah siap.',
  'Dalam hitungan hari!', 'Saat kamu sudah siap menerimanya.'
]

const handler = async (m) => {
  const text = (m.text || '').trim()
  if (!text) {
    return m.reply(
      `*KAPAN*\n\n` +
      `Masukkan pertanyaan yang ingin ditanyakan.\n\n` +
      `Contoh:\n` +
      `> .kapan aku nikah?`
    )
  }
  const answer = answers[Math.floor(Math.random() * answers.length)]
  await m.reply(
    `*KAPAN*\n\n` +
    `Pertanyaan: ${text}\n\n` +
    `Jawaban: *${answer}*`
  )
}

handler.command = /^(kapan|when)$/i
handler.help = ['kapan']
handler.tags = ['fun']
handler.description = 'Tanya bot kapan sesuatu akan terjadi'

export default handler
