let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return m.reply('❌ Fitur ini hanya bisa digunakan di grup.')
  if (!isBotAdmin) return m.reply('❌ Bot harus menjadi admin.')

  const user = m.sender

  await m.reply('👋 Oke, sampai jumpa lagi!')
  await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
}

handler.help = ['leavegc', 'kickme', 'out']
handler.tags = ['group']
handler.owner = true 
handler.command = /^(leavegc|kickme|out)$/i

export default handler