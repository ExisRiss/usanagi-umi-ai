/* By AlzRiss - Usanagi Umi AI */

const handler = async (m, { conn, usedPrefix }) => {
  if (!m.text) {
    await conn.sendMessage(
      m.chat,
      { text: `Cara pakai:\n${usedPrefix}broadcast <pesan>` },
      { quoted: m.raw }
    )
    return
  }

  const chats = Object.keys(conn.chats || {}).filter((jid) => jid.endsWith('@s.whatsapp.net'))

  let success = 0
  for (const jid of chats) {
    try {
      await conn.sendMessage(jid, { text: `📢 *Broadcast*\n\n${m.text}` })
      success++
    } catch {
    }
  }

  await conn.sendMessage(
    m.chat,
    { text: `Broadcast selesai.\nTerkirim ke ${success} dari ${chats.length} chat.` },
    { quoted: m.raw }
  )
}

handler.command = /^broadcast$/i
handler.help = ['broadcast']
handler.tags = ['owner']
handler.description = 'Mengirim pesan ke seluruh chat (owner only)'
handler.ownerOnly = true

export default handler
