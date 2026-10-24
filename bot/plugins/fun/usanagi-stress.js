/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const handler = async (m, { conn }) => {
  const command = (m.command || '').toLowerCase()
  const target = await requireFunTarget(m, conn)
  if (!target) return
  const name = target.display
  const mentions = target.mentions

  let text = ''
  if (command === 'wangy') {
    text =
      `${name} ${name} ${name}\n\n` +
      `Wangi wangi wangi...\n` +
      `Aku suka banget sama ${name}.\n` +
      `Setiap kali mikirin ${name}, hari langsung cerah.\n` +
      `${name} adalah sumber kebahagiaan.`
  } else if (command === 'nenen') {
    text =
      `Kepengen nenen sama ${name}.\n` +
      `Tolong ${name} mengerti perasaan ini.\n` +
      `Nenen nenen nenen ${name}.`
  } else if (command === 'genjot') {
    text =
      `Buruan panggil aku SIMP.\n` +
      `Ini murni perasaan ke ${name}.\n` +
      `Aku serius sama ${name}.\n` +
      `Semoga ${name} juga merasakan hal yang sama.`
  } else if (command === 'curhat') {
    text =
      `Aku sangat mencintai ${name}.\n` +
      `${name} adalah tujuan hidupku.\n` +
      `Temanku bilang aku halu, tapi aku tetap percaya pada ${name}.\n` +
      `${name} itu cinta, ${name} itu kehidupan.`
  } else {
    text =
      `Aku benar-benar suka ${name}.\n` +
      `Setiap hari aku memikirkan ${name}.\n` +
      `Semoga ${name} baik-baik saja selalu.`
  }

  await conn.sendMessage(
    m.chat,
    {
      text: `*${command.toUpperCase()}*\n\n${text}`,
      mentions,
    },
    { quoted: m.raw }
  )
}

handler.command = /^(wangy|nenen|genjot|curhat)$/i
handler.help = ['wangy', 'nenen', 'genjot', 'curhat']
handler.tags = ['fun']
handler.description = 'Teks stress / copypasta fun'

export default handler
