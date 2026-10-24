
import { requireFunTarget } from '../../lib/awang-fun.js'

import { getParticipantJid } from '../../lib/awang-aksesgrub.js'

const quotes = [
  'Cinta sejati tidak pernah mengenal jarak.',
  'Dua hati yang bersatu takkan terpisahkan.',
  'Kalian seperti puzzle yang sempurna.',
  'Match made in heaven!',
  'Chemistry-nya kuat banget!',
  'Couple goals banget sih kalian.',
  'Destiny brought you together.',
  'Perfect match detected!'
]

const statusOf = (p) => {
  if (p >= 90) return 'JODOH SEJATI'
  if (p >= 70) return 'Sangat Cocok'
  if (p >= 50) return 'Lumayan Cocok'
  if (p >= 30) return 'Bisa Dicoba'
  return 'Butuh Usaha Lebih'
}

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
    const botId = String(conn.user?.id || '').split(':')[0]
    const members = (metadata.participants || [])
      .map((p) => getParticipantJid(p))
      .filter((jid) => jid && jid.includes('@') && !jid.startsWith(botId))

    if (members.length < 2) {
      return m.reply('Minimal ada 2 member untuk dijodohkan.')
    }

    const a = targetJid
    const candidates = members.filter((jid) => jid !== targetJid)
    if (!candidates.length) {
      return m.reply('Tidak ada member lain untuk dijodohkan.')
    }
    const b = candidates[Math.floor(Math.random() * candidates.length)]

    const percent = Math.floor(Math.random() * 101)
    const quote = quotes[Math.floor(Math.random() * quotes.length)]
    const tagA = target.display
    const tagB = '@' + b.split('@')[0].split(':')[0]

    await conn.sendMessage(
      m.chat,
      {
        text:
          `*JODOH*\n\n` +
          `${tagA}  ×  ${tagB}\n\n` +
          `Kecocokan : *${percent}%*\n` +
          `Status : *${statusOf(percent)}*\n\n` +
          `${quote}`,
        mentions: [targetJid, b],
      },
      { quoted: m.raw }
    )
  } catch {
    await m.reply('Gagal mengambil data member grup.')
  }
}

handler.command = /^(jodoh|match|ship)$/i
handler.help = ['jodoh']
handler.tags = ['fun']
handler.description = 'Jodohkan 2 member secara acak'
handler.group = true

export default handler
