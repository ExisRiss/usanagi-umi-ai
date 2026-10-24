/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Hoki level dewa!"
  else if (percent >= 70) desc = "Sangat beruntung."
  else if (percent >= 50) desc = "Lumayan hoki."
  else if (percent >= 30) desc = "Hoki biasa."
  else desc = "Sedikit sial hari ini."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK HOKI*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekhoki|hoki)$/i
handler.help = ['cekhoki']
handler.tags = ['fun']
handler.description = 'Cek cek hoki secara acak'

export default handler
