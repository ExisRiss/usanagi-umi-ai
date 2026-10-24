/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Imut banget!"
  else if (percent >= 70) desc = "Sangat imut."
  else if (percent >= 50) desc = "Lumayan imut."
  else if (percent >= 30) desc = "Sedikit imut."
  else desc = "Gahar mode."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK IMUT*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekimut|imut)$/i
handler.help = ['cekimut']
handler.tags = ['fun']
handler.description = 'Cek cek imut secara acak'

export default handler
