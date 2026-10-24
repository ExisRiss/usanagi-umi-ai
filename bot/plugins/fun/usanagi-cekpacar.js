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

    let pair = members[Math.floor(Math.random() * members.length)]
    while (pair === targetJid) {
      pair = members[Math.floor(Math.random() * members.length)]
    }

    const percent = Math.floor(Math.random() * 101)
    const tagT = target.display
    const tagP = '@' + pair.split('@')[0].split(':')[0]

    await conn.sendMessage(
      m.chat,
      {
        text:
          `*CEK PACAR*\n\n` +
          `Target : ${tagT}\n` +
          `Pacar  : ${tagP}\n` +
          `Kecocokan : *${percent}%*`,
        mentions: [targetJid, pair],
      },
      { quoted: m.raw }
    )
  } catch {
    await m.reply('Gagal mengambil data member grup.')
  }
}

handler.command = /^(cekpacar|pacar)$/i
handler.help = ['cekpacar']
handler.tags = ['fun']
handler.description = 'Cek pasangan acak di group'
handler.group = true

export default handler
