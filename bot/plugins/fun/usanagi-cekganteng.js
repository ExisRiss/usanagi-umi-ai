/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Ganteng banget kayak model!"
  else if (percent >= 70) desc = "Ganteng banget!"
  else if (percent >= 50) desc = "Cukup ganteng~"
  else if (percent >= 30) desc = "Lumayan ganteng"
  else desc = "Tetap keren kok!"

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK GANTENG*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekganteng|gantengcek)$/i
handler.help = ['cekganteng']
handler.tags = ['fun']
handler.description = 'Cek cek ganteng secara acak'

export default handler
