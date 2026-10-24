/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Kece abis!"
  else if (percent >= 70) desc = "Sangat kece."
  else if (percent >= 50) desc = "Lumayan kece."
  else if (percent >= 30) desc = "Biasa saja."
  else desc = "Perlu upgrade style."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK KECE*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekkece|kece)$/i
handler.help = ['cekkece']
handler.tags = ['fun']
handler.description = 'Cek cek kece secara acak'

export default handler
