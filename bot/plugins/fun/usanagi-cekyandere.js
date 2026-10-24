/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Yandere mode on."
  else if (percent >= 70) desc = "Agak posesif."
  else if (percent >= 50) desc = "Biasa saja."
  else if (percent >= 30) desc = "Santai."
  else desc = "Sangat bebas."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK YANDERE*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekyandere|yandere)$/i
handler.help = ['cekyandere']
handler.tags = ['fun']
handler.description = 'Cek cek yandere secara acak'

export default handler
