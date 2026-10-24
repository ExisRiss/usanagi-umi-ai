/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Jenius banget!"
  else if (percent >= 70) desc = "Sangat pintar."
  else if (percent >= 50) desc = "Lumayan cerdas."
  else if (percent >= 30) desc = "Cukup pintar."
  else desc = "Perlu belajar lagi."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK PINTAR*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekpintar|pintar)$/i
handler.help = ['cekpintar']
handler.tags = ['fun']
handler.description = 'Cek cek pintar secara acak'

export default handler
