/* By AlzRiss - Usanagi Umi AI */

const list = [
  'Jangan biarkan kegagalan menghentikan langkahmu. Gagal adalah guru terbaik.',
  'Hari ini sulit, besok mungkin lebih sulit, tapi lusa akan indah jika kamu bertahan.',
  'Bersyukurlah atas apa yang ada, maka yang kurang akan datang dengan sendirinya.',
  'Orang yang kuat bukan yang tidak pernah jatuh, tapi yang selalu bangkit.',
  'Diam bukan berarti kalah. Kadang diam adalah cara menjaga harga diri.',
  'Waktu akan menjelaskan semuanya. Sabar adalah kunci.',
  'Jangan bandingkan prosesmu dengan orang lain. Setiap orang punya jalannya sendiri.',
  'Kesuksesan datang kepada mereka yang berani memulai dan konsisten.',
  'Hati yang bersih akan menuntun langkah yang benar.',
  'Lebih baik terlambat memahami, daripada tidak pernah memahami sama sekali.'
]

const handler = async (m) => {
  const item = list[Math.floor(Math.random() * list.length)]
  await m.reply(`*RENUNGAN*\n\n${item}`)
}

handler.command = /^(renungan)$/i
handler.help = ['renungan']
handler.tags = ['fun']
handler.description = 'Renungan singkat acak'

export default handler
