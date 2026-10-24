/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Sangat kreatif!"
  else if (percent >= 70) desc = "Ide-idenya bagus."
  else if (percent >= 50) desc = "Lumayan kreatif."
  else if (percent >= 30) desc = "Perlu diasah."
  else desc = "Masih kaku."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK CREATIVE*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekcreative|creative)$/i
handler.help = ['cekcreative']
handler.tags = ['fun']
handler.description = 'Cek cek creative secara acak'

export default handler
