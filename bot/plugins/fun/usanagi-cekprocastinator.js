/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Raja tunda!"
  else if (percent >= 70) desc = "Sering menunda."
  else if (percent >= 50) desc = "Kadang menunda."
  else if (percent >= 30) desc = "Cukup disiplin."
  else desc = "Sangat disiplin."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK PROCRASTINATOR*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekprocastinator|procrastinator|maleskerja)$/i
handler.help = ['cekprocastinator']
handler.tags = ['fun']
handler.description = 'Cek cek procrastinator secara acak'

export default handler
