
const tafsir = {
  jatuh: 'Mimpi jatuh sering berkaitan dengan rasa kehilangan kontrol. Waktunya lebih hati-hati.',
  gigi: 'Mimpi gigi tanggal bisa berkaitan dengan kecemasan atau perubahan besar.',
  air: 'Air dalam mimpi sering berhubungan dengan emosi. Perhatikan kondisi perasaanmu.',
  ular: 'Ular bisa berarti transformasi atau peringatan. Ada perubahan yang sedang datang.',
  terbang: 'Terbang menandakan keinginan bebas dan ambisi yang tinggi.',
  mati: 'Kematian di mimpi sering berarti akhir suatu fase, bukan literal.',
  rumah: 'Rumah mencerminkan diri. Kondisi rumah di mimpi mencerminkan kondisi batin.',
  uang: 'Uang berkaitan dengan nilai diri dan rasa aman.',
  pacar: 'Munculnya seseorang spesial bisa berarti kerinduan atau harapan.',
  default: 'Mimpi itu pesan dari alam bawah sadar. Renungkan kaitannya dengan hidupmu saat ini.'
}

const handler = async (m) => {
  const q = (m.text || '').trim().toLowerCase()
  if (!q) {
    return m.reply(
      `*TAFSIR MIMPI*\n\n` +
      `Tulis kata kunci mimpimu.\n\n` +
      `Contoh:\n` +
      `> .mimpi ular\n` +
      `> .mimpi jatuh`
    )
  }

  let result = tafsir.default
  for (const [key, val] of Object.entries(tafsir)) {
    if (key !== 'default' && q.includes(key)) {
      result = val
      break
    }
  }

  await m.reply(
    `*TAFSIR MIMPI*\n\n` +
    `Kata kunci : ${q}\n\n` +
    `${result}`
  )
}

handler.command = /^(mimpi|tafsirmimpi)$/i
handler.help = ['mimpi']
handler.tags = ['fun']
handler.description = 'Tafsir mimpi sederhana berdasarkan kata kunci'

export default handler
