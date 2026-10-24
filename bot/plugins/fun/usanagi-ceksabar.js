/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Sabar level nabi."
  else if (percent >= 70) desc = "Sangat sabar."
  else if (percent >= 50) desc = "Lumayan sabar."
  else if (percent >= 30) desc = "Agak mudah marah."
  else desc = "Perlu latihan sabar."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK SABAR*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(ceksabar|sabar)$/i
handler.help = ['ceksabar']
handler.tags = ['fun']
handler.description = 'Cek cek sabar secara acak'

export default handler
