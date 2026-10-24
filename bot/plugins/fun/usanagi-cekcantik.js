/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Cantik banget kayak bidadari!"
  else if (percent >= 70) desc = "Cantik banget!"
  else if (percent >= 50) desc = "Manis dan cantik~"
  else if (percent >= 30) desc = "Lumayan cantik"
  else desc = "Tetap cantik kok!"

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK CANTIK*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekcantik|cantikcek|cantik)$/i
handler.help = ['cekcantik']
handler.tags = ['fun']
handler.description = 'Cek cek cantik secara acak'

export default handler
