/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Mesum parah."
  else if (percent >= 70) desc = "Agak mesum."
  else if (percent >= 50) desc = "Netral."
  else if (percent >= 30) desc = "Cukup sopan."
  else desc = "Suci banget."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK MESUM*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekmesum|mesum)$/i
handler.help = ['cekmesum']
handler.tags = ['fun']
handler.description = 'Cek cek mesum secara acak'

export default handler
