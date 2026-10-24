/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Jahat banget, hati-hati."
  else if (percent >= 70) desc = "Agak jahat."
  else if (percent >= 50) desc = "Lumayan nakal."
  else if (percent >= 30) desc = "Sedikit usil."
  else desc = "Baik-baik saja."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK JAHAT*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekjahat|jahat)$/i
handler.help = ['cekjahat']
handler.tags = ['fun']
handler.description = 'Cek cek jahat secara acak'

export default handler
