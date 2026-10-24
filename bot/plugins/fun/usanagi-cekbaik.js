
import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Mantap! Kamu orang paling baik."
  else if (percent >= 70) desc = "Baik hati dan tidak sombong."
  else if (percent >= 50) desc = "Lumayan baik."
  else if (percent >= 30) desc = "Sedikit baik."
  else desc = "Perlu introspeksi sedikit."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK BAIK*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekbaik|baik)$/i
handler.help = ['cekbaik']
handler.tags = ['fun']
handler.description = 'Cek cek baik secara acak'

export default handler
