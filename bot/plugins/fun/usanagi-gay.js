/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'

import { getParticipantJid } from '../../lib/awang-aksesgrub.js'

const handler = async (m, { conn }) => {
  if (!m.isGroup) {
    return m.reply('Perintah ini hanya bisa digunakan di dalam group.')
  }

  const target = await requireFunTarget(m, conn, { groupLookup: true })
  if (!target) return
  if (!target.jid) return m.reply('Tag atau reply orangnya dulu.')
  const targetJid = target.jid

  try {
    const metadata = await conn.groupMetadata(m.chat)
    const members = (metadata.participants || [])
      .map((p) => getParticipantJid(p))
      .filter((jid) => jid && jid.includes('@'))

    if (members.length < 2) {
      return m.reply('Member grup kurang dari 2 orang.')
    }

    const a = targetJid
    const candidates = members.filter((jid) => jid !== targetJid)
    if (!candidates.length) {
      return m.reply('Tidak ada member lain untuk dicek.')
    }
    const b = candidates[Math.floor(Math.random() * candidates.length)]

    const tagA = target.display
    const tagB = '@' + b.split('@')[0].split(':')[0]

    await conn.sendMessage(
      m.chat,
      {
        text: `*GAY CHECK*\n\n${tagA} nge-gay sama ${tagB}`,
        mentions: [targetJid, b],
      },
      { quoted: m.raw }
    )
  } catch {
    await m.reply('Gagal mengambil data member grup.')
  }
}

handler.command = /^(gay|howgay)$/i
handler.help = ['gay']
handler.tags = ['fun']
handler.description = 'Menunjuk dua member secara acak'
handler.group = true

export default handler
