/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Tsundere murni."
  else if (percent >= 70) desc = "Agak tsundere."
  else if (percent >= 50) desc = "Campuran."
  else if (percent >= 30) desc = "Lebih jujur."
  else desc = "Straight forward."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK TSUNDERE*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cektsundere|tsundere)$/i
handler.help = ['cektsundere']
handler.tags = ['fun']
handler.description = 'Cek cek tsundere secara acak'

export default handler
