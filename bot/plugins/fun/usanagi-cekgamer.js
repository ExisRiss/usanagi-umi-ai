
import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Pro player!"
  else if (percent >= 70) desc = "Gamer sejati."
  else if (percent >= 50) desc = "Casual gamer."
  else if (percent >= 30) desc = "Kadang main."
  else desc = "Noob mode."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK GAMER*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekgamer|gamer)$/i
handler.help = ['cekgamer']
handler.tags = ['fun']
handler.description = 'Cek cek gamer secara acak'

export default handler
