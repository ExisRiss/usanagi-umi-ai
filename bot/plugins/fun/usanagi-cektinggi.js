
import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Tinggi menjulang!"
  else if (percent >= 70) desc = "Cukup tinggi."
  else if (percent >= 50) desc = "Standar."
  else if (percent >= 30) desc = "Agak pendek."
  else desc = "Mungil tapi keren."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK TINGGI*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cektinggi|tinggi)$/i
handler.help = ['cektinggi']
handler.tags = ['fun']
handler.description = 'Cek cek tinggi secara acak'

export default handler
