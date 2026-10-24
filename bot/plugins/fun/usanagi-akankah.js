/* By AlzRiss - Usanagi Umi AI */

const answers = [
  'Ya, pasti akan terjadi!',
  'Tidak, sepertinya tidak akan.',
  'Mungkin akan, mungkin tidak.',
  'InsyaAllah akan terjadi!',
  'Hmm, sulit diprediksi.',
  'Pasti! Yakin saja!',
  'Kayaknya nggak deh.',
  'Akan terjadi kalau kamu mau berusaha.',
  'Suatu saat nanti, pasti.',
  'Nggak akan, maaf.',
  'Tentu akan! Tunggu saja!',
  'Hmm, aku ragu.',
  'Akan! Percaya sama proses!',
  'Kemungkinannya kecil.',
  'Pasti akan, aku yakin!',
  'Nggak akan, cari yang lain aja.',
  'Akan, tapi butuh waktu.',
  'InsyaAllah!',
  'Kalau jodoh, pasti akan.',
  'Akan terjadi di saat yang tepat!'
]

const handler = async (m) => {
  const text = (m.text || '').trim()
  if (!text) {
    return m.reply(
      `*AKANKAH*\n\n` +
      `Masukkan pertanyaan yang ingin ditanyakan.\n\n` +
      `Contoh:\n` +
      `> .akankah aku sukses?`
    )
  }

  const answer = answers[Math.floor(Math.random() * answers.length)]
  await m.reply(
    `*AKANKAH*\n\n` +
    `Pertanyaan: ${text}\n\n` +
    `Jawaban: *${answer}*`
  )
}

handler.command = /^(akankah|akan)$/i
handler.help = ['akankah']
handler.tags = ['fun']
handler.description = 'Tanya bot apakah sesuatu akan terjadi di masa depan'

export default handler
