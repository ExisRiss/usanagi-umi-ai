
import { requireFunTarget } from '../../lib/awang-fun.js'


const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const label = target.display

  const text =
    `*CEK TT*\n\n` +
    `Nama : ${label}\n` +
    `Warna : ${pick(['Putih', 'Hitam', 'Putih mulus', 'Gelap', 'Karatan'])}\n` +
    `Bentuk : ${pick(['Sempurna', 'Kecil', 'Besar', 'Standar', 'Unik'])}\n` +
    `Ukuran : ${pick(['32', '34', '36', '38', 'Spek spesial', 'Rahasia'])}\n` +
    `Status : ${pick(['Aman', 'Bahaya', 'Menawan', 'Biasa saja', 'Mysteri'])}`

  await conn.sendMessage(
    m.chat,
    { text, mentions: target.mentions },
    { quoted: m.raw }
  )
}

handler.command = /^(cektt|ttcek)$/i
handler.help = ['cektt']
handler.tags = ['fun']
handler.description = 'Cek TT secara acak'

export default handler
