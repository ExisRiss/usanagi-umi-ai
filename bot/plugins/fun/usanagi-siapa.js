
import { getParticipantJid } from '../../lib/awang-aksesgrub.js'

const positive = new Set(['ganteng', 'cantik', 'keren', 'pro', 'sultan', 'kaya', 'pinter', 'pintar', 'mastah'])

const handler = async (m, { conn }) => {
  if (!m.isGroup) {
    return m.reply('Perintah ini hanya bisa digunakan di dalam group.')
  }

  const command = (m.command || '').toLowerCase()

  try {
    const metadata = await conn.groupMetadata(m.chat)
    const members = (metadata.participants || [])
      .map((p) => getParticipantJid(p))
      .filter((jid) => jid && jid.includes('@'))

    if (!members.length) {
      return m.reply('Tidak ada member di grup.')
    }

    const randomMember = members[Math.floor(Math.random() * members.length)]
    const isPositive = positive.has(command)
    const label = isPositive ? 'Yang paling' : 'Anak'
    const tag = '@' + randomMember.split('@')[0].split(':')[0]

    await conn.sendMessage(
      m.chat,
      {
        text: `*${label} ${command} di sini adalah* ${tag}`,
        mentions: [randomMember],
      },
      { quoted: m.raw }
    )
  } catch {
    await m.reply('Gagal mengambil data member grup.')
  }
}

handler.command = /^(bego|goblok|janda|perawan|babi|tolol|pekok|jancok|pinter|pintar|asu|bodoh|lesby|bajingan|anjing|ngentod|ngentot|monyet|mastah|newbie|bangsat|bangke|sange|sangean|dakjal|horny|wibu|puki|pantek|setan|iblis|cacat|yatim|piatu|ganteng|cantik|jelek|keren|cupu|noob|pro|sultan|miskin|kaya|siapa)$/i
handler.help = ['siapa', 'ganteng', 'cantik', 'keren']
handler.tags = ['fun']
handler.description = 'Memilih member acak untuk kategori tertentu'
handler.group = true

export default handler
