
import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Femboy vibes kuat."
  else if (percent >= 70) desc = "Agak femboy."
  else if (percent >= 50) desc = "Netral."
  else if (percent >= 30) desc = "Maskulin."
  else desc = "Gahar total."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK FEMBOY*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekfemboy|femboy)$/i
handler.help = ['cekfemboy']
handler.tags = ['fun']
handler.description = 'Cek cek femboy secara acak'

export default handler
