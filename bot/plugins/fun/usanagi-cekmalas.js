
import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Malas tingkat dewa."
  else if (percent >= 70) desc = "Sangat malas."
  else if (percent >= 50) desc = "Lumayan malas."
  else if (percent >= 30) desc = "Sedikit malas."
  else desc = "Rajin banget!"

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK MALAS*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekmalas|malas)$/i
handler.help = ['cekmalas']
handler.tags = ['fun']
handler.description = 'Cek cek malas secara acak'

export default handler
