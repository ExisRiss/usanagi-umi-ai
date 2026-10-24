
import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Sangat menarik!"
  else if (percent >= 70) desc = "Cukup memikat."
  else if (percent >= 50) desc = "Lumayan."
  else if (percent >= 30) desc = "Biasa saja."
  else desc = "Fokus ke dalam saja."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK SEXY*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(ceksexy|sexy)$/i
handler.help = ['ceksexy']
handler.tags = ['fun']
handler.description = 'Cek cek sexy secara acak'

export default handler
