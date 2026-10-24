/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Bias is life!"
  else if (percent >= 70) desc = "Kpopers aktif."
  else if (percent >= 50) desc = "Kadang dengar K-pop."
  else if (percent >= 30) desc = "Tau sedikit."
  else desc = "Bukan kpopers."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK KPOPERS*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekkpopers|kpopers)$/i
handler.help = ['cekkpopers']
handler.tags = ['fun']
handler.description = 'Cek cek kpopers secara acak'

export default handler
