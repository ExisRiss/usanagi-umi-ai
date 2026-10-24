/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Jomblo akut, butuh dukungan."
  else if (percent >= 70) desc = "Jomblo parah."
  else if (percent >= 50) desc = "Lumayan jomblo."
  else if (percent >= 30) desc = "Sedikit jomblo."
  else desc = "Sudah tidak jomblo."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK JOMBLO*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekjomblo|jomblo)$/i
handler.help = ['cekjomblo']
handler.tags = ['fun']
handler.description = 'Cek cek jomblo secara acak'

export default handler
