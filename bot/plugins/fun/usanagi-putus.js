
if (!globalThis.usanagiPasangan) globalThis.usanagiPasangan = new Map()

const handler = async (m, { conn }) => {
  const partner = globalThis.usanagiPasangan.get(m.sender)
  if (!partner) {
    return m.reply(
      `*PUTUS*\n\n` +
      `Kamu belum punya pasangan.\n` +
      `Gunakan .tembak @user dulu.`
    )
  }

  globalThis.usanagiPasangan.delete(m.sender)
  globalThis.usanagiPasangan.delete(partner)

  const tagS = '@' + m.sender.split('@')[0].split(':')[0]
  const tagP = '@' + partner.split('@')[0].split(':')[0]

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*PUTUS*\n\n` +
        `${tagS} memutuskan hubungan dengan ${tagP}.`,
      mentions: [m.sender, partner],
    },
    { quoted: m.raw }
  )
}

handler.command = /^(putus|breakup|cerai)$/i
handler.help = ['putus']
handler.tags = ['fun']
handler.description = 'Memutuskan hubungan pasangan'
handler.group = true

export default handler
