/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Introvert banget."
  else if (percent >= 70) desc = "Lebih suka sendiri."
  else if (percent >= 50) desc = "Ambivert."
  else if (percent >= 30) desc = "Cukup terbuka."
  else desc = "Ekstrovert total."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK INTROVERT*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekintrovert|introvert)$/i
handler.help = ['cekintrovert']
handler.tags = ['fun']
handler.description = 'Cek cek introvert secara acak'

export default handler
