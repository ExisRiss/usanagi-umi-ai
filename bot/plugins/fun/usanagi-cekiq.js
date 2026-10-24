/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const results = [
  '70 - Di bawah rata-rata',
  '85 - Rata-rata rendah',
  '100 - Rata-rata',
  '115 - Di atas rata-rata',
  '130 - Superior',
  '145 - Genius',
  '160 - Jenius banget',
  '50 - Perlu istirahat',
  '200 - Error sensor',
  '90 - Standar stabil'
]

const handler = async (m, { conn }) => {
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const label = target.display
  const hasil = results[Math.floor(Math.random() * results.length)]

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*CEK IQ*\n\n` +
        `User : ${label}\n` +
        `Hasil : *${hasil}*`,
      mentions: target.mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(cekiq|iq)$/i
handler.help = ['cekiq']
handler.tags = ['fun']
handler.description = 'Cek IQ secara acak'

export default handler
