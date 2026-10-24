/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Rezeki lancar jaya."
  else if (percent >= 70) desc = "Rezeki cukup baik."
  else if (percent >= 50) desc = "Stabil."
  else if (percent >= 30) desc = "Perlu usaha ekstra."
  else desc = "Sedang diuji."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK REZEKI*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekrezeki|rezeki)$/i
handler.help = ['cekrezeki']
handler.tags = ['fun']
handler.description = 'Cek cek rezeki secara acak'

export default handler
