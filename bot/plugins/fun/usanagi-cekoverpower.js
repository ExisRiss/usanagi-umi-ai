
import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "OP banget!"
  else if (percent >= 70) desc = "Sangat kuat."
  else if (percent >= 50) desc = "Seimbang."
  else if (percent >= 30) desc = "Agak lemah."
  else desc = "Butuh buff."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK OVERPOWER*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekoverpower|overpower|op)$/i
handler.help = ['cekoverpower']
handler.tags = ['fun']
handler.description = 'Cek cek overpower secara acak'

export default handler
