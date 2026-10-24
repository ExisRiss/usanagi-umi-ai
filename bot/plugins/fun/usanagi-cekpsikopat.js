/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Level bahaya!"
  else if (percent >= 70) desc = "Agak mengkhawatirkan."
  else if (percent >= 50) desc = "Lumayan aneh."
  else if (percent >= 30) desc = "Sedikit gelap."
  else desc = "Aman terkendali."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK PSIKOPAT*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekpsikopat|psikopat)$/i
handler.help = ['cekpsikopat']
handler.tags = ['fun']
handler.description = 'Cek cek psikopat secara acak'

export default handler
