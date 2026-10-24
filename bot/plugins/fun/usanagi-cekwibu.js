
import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Wibu sejati!"
  else if (percent >= 70) desc = "Sangat wibu."
  else if (percent >= 50) desc = "Lumayan ngefans."
  else if (percent >= 30) desc = "Tau anime dikit."
  else desc = "Bukan wibu."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK WIBU*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekwibu)$/i
handler.help = ['cekwibu']
handler.tags = ['fun']
handler.description = 'Cek cek wibu secara acak'

export default handler
