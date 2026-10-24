/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'


const meaning = (p) => {
  if (p >= 90) return 'Soulmate level. Energi kalian saling melengkapi.'
  if (p >= 70) return 'Koneksi jiwa cukup kuat dan harmonis.'
  if (p >= 50) return 'Ada potensi, butuh komunikasi lebih.'
  if (p >= 30) return 'Masih perlu penyesuaian.'
  return 'Perbedaan signifikan. Butuh pengertian ekstra.'
}

const handler = async (m, { conn }) => {
  const ctx = m?.currentMessage?.extendedTextMessage?.contextInfo
  const mentions = Array.isArray(ctx?.mentionedJid) ? ctx.mentionedJid : []
  const target = await requireFunTarget(m, conn, { groupLookup: Boolean(m.isGroup) })
  if (!target) return
  let a = m.sender
  let b = target.jid || target.display

  if (mentions.length >= 2) {
    a = mentions[0]
    b = mentions[1]
  }


  const percent = Math.floor(Math.random() * 101)
  const tagA = mentions.length >= 2 ? '@' + a.split('@')[0].split(':')[0] : '@' + a.split('@')[0].split(':')[0]
  const tagB = mentions.length >= 2 ? '@' + b.split('@')[0].split(':')[0] : target.display

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*SOUL MATCH*\n\n` +
        `${tagA}  ×  ${tagB}\n\n` +
        `Kecocokan jiwa : *${percent}%*\n` +
        `${meaning(percent)}`,
      mentions: mentions.length >= 2 ? [a, b] : [...new Set([m.sender, ...target.mentions])],
    },
    { quoted: m.raw }
  )
}

handler.command = /^(soulmatch|soul)$/i
handler.help = ['soulmatch']
handler.tags = ['fun']
handler.description = 'Cek kecocokan jiwa antar user'

export default handler
