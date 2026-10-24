/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Karma bagus banget!"
  else if (percent >= 70) desc = "Karma positif."
  else if (percent >= 50) desc = "Netral."
  else if (percent >= 30) desc = "Perlu hati-hati."
  else desc = "Waktunya introspeksi."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK KARMA*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekkarma|karma)$/i
handler.help = ['cekkarma']
handler.tags = ['fun']
handler.description = 'Cek cek karma secara acak'

export default handler
