/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Hidup di socmed."
  else if (percent >= 70) desc = "Sangat aktif."
  else if (percent >= 50) desc = "Cukup aktif."
  else if (percent >= 30) desc = "Jarangan online."
  else desc = "Hampir offline."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK SOCMED*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(ceksocmed|socmed)$/i
handler.help = ['ceksocmed']
handler.tags = ['fun']
handler.description = 'Cek cek socmed secara acak'

export default handler
