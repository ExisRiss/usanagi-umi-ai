
import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Partner ideal."
  else if (percent >= 70) desc = "Cocok jadi partner."
  else if (percent >= 50) desc = "Bisa diajak kerja sama."
  else if (percent >= 30) desc = "Perlu penyesuaian."
  else desc = "Sulit diajak kompak."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK PARTNER*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekpartner|partner)$/i
handler.help = ['cekpartner']
handler.tags = ['fun']
handler.description = 'Cek cek partner secara acak'

export default handler
