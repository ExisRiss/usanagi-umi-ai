/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Sial parah hari ini."
  else if (percent >= 70) desc = "Kurang beruntung."
  else if (percent >= 50) desc = "Biasa saja."
  else if (percent >= 30) desc = "Sedikit sial."
  else desc = "Hoki terus!"

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK SIAL*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(ceksial|sial)$/i
handler.help = ['ceksial']
handler.tags = ['fun']
handler.description = 'Cek cek sial secara acak'

export default handler
