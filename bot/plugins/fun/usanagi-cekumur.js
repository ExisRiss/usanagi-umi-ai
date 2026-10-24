/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Jiwa tua banget."
  else if (percent >= 70) desc = "Dewasa."
  else if (percent >= 50) desc = "Pas di tengah."
  else if (percent >= 30) desc = "Masih muda."
  else desc = "Bayi abadi."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK UMUR*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekumur|umur)$/i
handler.help = ['cekumur']
handler.tags = ['fun']
handler.description = 'Cek cek umur secara acak'

export default handler
