
import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "BUCIN AKUT! Susah diselamatkan."
  else if (percent >= 70) desc = "Bucin parah nih."
  else if (percent >= 50) desc = "Lumayan bucin."
  else if (percent >= 30) desc = "Sedikit bucin."
  else desc = "Santai aja, tidak bucin."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK BUCIN*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekbucin)$/i
handler.help = ['cekbucin']
handler.tags = ['fun']
handler.description = 'Cek cek bucin secara acak'

export default handler
