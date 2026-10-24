/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Berat banget, hati-hati!"
  else if (percent >= 70) desc = "Cukup berat."
  else if (percent >= 50) desc = "Standar."
  else if (percent >= 30) desc = "Ringan."
  else desc = "Sangat ringan."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK BERAT*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekberat|berat)$/i
handler.help = ['cekberat']
handler.tags = ['fun']
handler.description = 'Cek cek berat secara acak'

export default handler
