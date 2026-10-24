

const handler = async (m, { conn }) => {
  const metadata = await conn.groupMetadata(m.chat)
  const participants = metadata.participants.map((p) => p.id)

  await conn.sendMessage(
    m.chat,
    { text: m.text || '📢 Perhatian!', mentions: participants },
    { quoted: m.raw }
  )
}

handler.command = /^hidetag$/i
handler.help = ['hidetag']
handler.tags = ['group']
handler.description = 'Menandai seluruh anggota group tanpa menampilkan tag'
handler.groupOnly = true

export default handler
