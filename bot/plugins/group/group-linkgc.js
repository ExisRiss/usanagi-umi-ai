let handler = async (m, { conn }) => {
  const code = await conn.groupInviteCode(m.chat)
  m.reply(`https://chat.whatsapp.com/${code}`)
}

handler.help = ['linkgc']
handler.tags = ['group']
handler.command = /^linkgc$/i

handler.group = true

export default handler