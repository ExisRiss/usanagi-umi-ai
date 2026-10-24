
import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Masih panjang umurnya."
  else if (percent >= 70) desc = "Cukup panjang."
  else if (percent >= 50) desc = "Standar."
  else if (percent >= 30) desc = "Perlu jaga kesehatan."
  else desc = "Fokus kualitas hidup."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK SISA UMUR*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(ceksisaumur|sisaumur)$/i
handler.help = ['ceksisaumur']
handler.tags = ['fun']
handler.description = 'Cek cek sisa umur secara acak'

export default handler
