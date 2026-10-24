
import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Kepribadian kuat."
  else if (percent >= 70) desc = "Cukup stabil."
  else if (percent >= 50) desc = "Sedang berkembang."
  else if (percent >= 30) desc = "Masih goyah."
  else desc = "Perlu introspeksi."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK KEPRIBADIAN*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekkepribadian|kepribadian)$/i
handler.help = ['cekkepribadian']
handler.tags = ['fun']
handler.description = 'Cek cek kepribadian secara acak'

export default handler
