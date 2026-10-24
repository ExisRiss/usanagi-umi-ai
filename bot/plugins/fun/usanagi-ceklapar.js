
import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Lapar banget!"
  else if (percent >= 70) desc = "Mulai lapar."
  else if (percent >= 50) desc = "Biasa saja."
  else if (percent >= 30) desc = "Masih kenyang."
  else desc = "Kenyang total."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK LAPAR*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(ceklapar|lapar)$/i
handler.help = ['ceklapar']
handler.tags = ['fun']
handler.description = 'Cek cek lapar secara acak'

export default handler
