let handler = async (m, { conn }) => {
  const code = await conn.groupRevokeInvite(m.chat)

  m.reply(
    `✅ Berhasil mereset link grup.\n\n` +
    `🔗 Link Baru:\nhttps://chat.whatsapp.com/${code}`
  )
}

handler.help = ['revoke']
handler.tags = ['group']
handler.command = /^revoke$/i

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler