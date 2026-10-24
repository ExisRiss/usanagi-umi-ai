
import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Pelit banget."
  else if (percent >= 70) desc = "Agak pelit."
  else if (percent >= 50) desc = "Standar."
  else if (percent >= 30) desc = "Cukup dermawan."
  else desc = "Dermawan total."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK PELIT*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekpelit|pelit)$/i
handler.help = ['cekpelit']
handler.tags = ['fun']
handler.description = 'Cek cek pelit secara acak'

export default handler
