
const handler = async (m, { conn, command }) => {
  if (m.isGroup) return m.reply('Command ini hanya dapat digunakan di chat pribadi.')
  const pin = command.toLowerCase() === 'pinchat'
  try {
    await conn.chatModify({ pin }, m.chat)
    return m.reply(pin ? '✅ Chat berhasil disematkan.' : '✅ Sematan chat berhasil dilepas.')
  } catch (error) {
    console.error('[PINCHAT]', error.message)
    return m.reply(`Gagal mengubah sematan chat: ${error.message}`)
  }
}

handler.command = /^(pinchat|unpinchat)$/i
handler.help = ['pinchat', 'unpinchat']
handler.tags = ['owner']
handler.owner = true
handler.private = true
handler.description = 'Menyematkan atau melepas sematan chat pribadi bot'

export default handler
