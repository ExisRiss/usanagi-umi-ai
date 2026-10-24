/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Setia mati!"
  else if (percent >= 70) desc = "Sangat setia."
  else if (percent >= 50) desc = "Lumayan setia."
  else if (percent >= 30) desc = "Agak goyah."
  else desc = "Perlu introspeksi."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK SETIA*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(ceksetia|setia)$/i
handler.help = ['ceksetia']
handler.tags = ['fun']
handler.description = 'Cek cek setia secara acak'

export default handler
