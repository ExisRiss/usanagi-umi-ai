
import { getParticipantJid } from '../../lib/awang-aksesgrub.js'

const handler = async (m, { conn }) => {
  if (!m.isGroup) {
    return m.reply('Perintah ini hanya bisa digunakan di dalam group.')
  }

  const kategori = (m.text || '').trim()
  if (!kategori) {
    return m.reply(
      `*TOP 5*\n\n` +
      `Masukkan kategori yang diinginkan.\n\n` +
      `Contoh:\n` +
      `> .top orang pintar`
    )
  }

  try {
    const metadata = await conn.groupMetadata(m.chat)
    const members = (metadata.participants || [])
      .map((p) => getParticipantJid(p))
      .filter((jid) => jid && jid.includes('@'))

    if (members.length < 5) {
      return m.reply('Member grup kurang dari 5 orang.')
    }

    const shuffled = [...members].sort(() => Math.random() - 0.5)
    const top5 = shuffled.slice(0, 5)
    const medals = ['1.', '2.', '3.', '4.', '5.']
    const list = top5
      .map((jid, i) => `${medals[i]} @${jid.split('@')[0].split(':')[0]}`)
      .join('\n')

    await conn.sendMessage(
      m.chat,
      {
        text: `*TOP 5 ${kategori.toUpperCase()}*\n\n${list}`,
        mentions: top5,
      },
      { quoted: m.raw }
    )
  } catch {
    await m.reply('Gagal mengambil data member grup.')
  }
}

handler.command = /^(top|top5|toplist)$/i
handler.help = ['top']
handler.tags = ['fun']
handler.description = 'Menampilkan top 5 member acak berdasarkan kategori'
handler.group = true

export default handler
