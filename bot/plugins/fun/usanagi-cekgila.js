/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Gila banget, perlu penanganan khusus."
  else if (percent >= 70) desc = "Agak gila, tapi masih waras."
  else if (percent >= 50) desc = "Lumayan aneh."
  else if (percent >= 30) desc = "Sedikit unik."
  else desc = "Masih normal kok."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK GILA*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekgila|gila)$/i
handler.help = ['cekgila']
handler.tags = ['fun']
handler.description = 'Cek cek gila secara acak'

export default handler
