/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
const pct = () => (Math.random() * 100).toFixed(1) + '%'

const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const label = target.display

  const text =
    `*CEK SIFAT*\n\n` +
    `Nama : ${label}\n` +
    `Ahlak baik : ${pct()}\n` +
    `Ahlak buruk : ${pct()}\n` +
    `Karakter : ${pick(['Baik hati', 'Sombong', 'Pelit', 'Dermawan', 'Rendah hati', 'Pemalu', 'Penakut', 'Usil', 'Cengeng'])}\n` +
    `Kebiasaan : ${pick(['Rajin', 'Malas', 'Membantu', 'Ngegosip', 'Jail', 'Shopping', 'Chat terus', 'Sedih', 'Bahagia'])}\n` +
    `Kecerdasan : ${pct()}\n` +
    `Kenakalan : ${pct()}\n` +
    `Keberanian : ${pct()}\n` +
    `Ketakutan : ${pct()}`

  await conn.sendMessage(
    m.chat,
    { text, mentions: target.mentions },
    { quoted: m.raw }
  )
}

handler.command = /^(ceksifat|sifat)$/i
handler.help = ['ceksifat']
handler.tags = ['fun']
handler.description = 'Cek sifat seseorang secara acak'

export default handler
