
import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const percent = Math.floor(Math.random() * 101)
  let desc = ""
  if (percent >= 90) desc = "Ngantuk berat, tidur aja."
  else if (percent >= 70) desc = "Sangat ngantuk."
  else if (percent >= 50) desc = "Lumayan ngantuk."
  else if (percent >= 30) desc = "Sedikit ngantuk."
  else desc = "Masih fresh."

  const label = target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK NGANTUK*\n\n` +
        `Target : ${label}\n` +
        `Hasil  : *${percent}%*\n` +
        `Komentar : ${desc}`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekngantuk|ngantuk)$/i
handler.help = ['cekngantuk']
handler.tags = ['fun']
handler.description = 'Cek cek ngantuk secara acak'

export default handler
