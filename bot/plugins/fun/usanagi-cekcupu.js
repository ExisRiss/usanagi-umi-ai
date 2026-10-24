
import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Cupu banget."
  else if (percent >= 70) desc = "Agak cupu."
  else if (percent >= 50) desc = "Standar."
  else if (percent >= 30) desc = "Cukup pro."
  else desc = "Pro level!"

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK CUPU*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekcupu|cupu)$/i
handler.help = ['cekcupu']
handler.tags = ['fun']
handler.description = 'Cek cek cupu secara acak'

export default handler
