// plugins/anti-unadmin.mjs
/*
📌 Nama Fitur: Anti Unadmin GC
🏷️ Type : Plugin ESM
🛡️ Real Detection
🛡️ Anti Bot Out
🛡️ Anti Salah Target
🛡️ Support ON / OFF
*/

let handler = m => m

handler.before = async function (m, { conn }) {
  try {
    if (!m.isGroup) return true

    // Cek apakah fitur aktif
    let chat = global.db?.data?.chats?.[m.chat]
    if (!chat?.antiunadmin) return true

    if (!m.messageStubType) return true

    // Event DEMOTE
    const DEMOTE = 30
    if (m.messageStubType !== DEMOTE) return true

    let meta = await conn.groupMetadata(m.chat)

    let botNumber = conn.user.id.split(':')[0] + '@s.whatsapp.net'

    let pelaku = m.participant
    let korban = m.messageStubParameters?.[0]

    if (!pelaku || !korban) return true

    // Guard
    if (pelaku === botNumber) return true
    if (pelaku === korban) return true
    if (pelaku === meta.owner) return true
    if (korban === meta.owner) return true

    // Pastikan pelaku masih admin
    let pelakuData = meta.participants.find(
      p => p.id === pelaku
    )

    if (!pelakuData?.admin) return true

    try {
      // Kembalikan admin korban
      await conn.groupParticipantsUpdate(
        m.chat,
        [korban],
        'promote'
      )

      await new Promise(resolve => setTimeout(resolve, 800))

      // Demote pelaku
      await conn.groupParticipantsUpdate(
        m.chat,
        [pelaku],
        'demote'
      )

      await new Promise(resolve => setTimeout(resolve, 800))

      // Kick pelaku
      await conn.groupParticipantsUpdate(
        m.chat,
        [pelaku],
        'remove'
      )

      // Notifikasi
      await conn.sendMessage(m.chat, {
        text:
          `🚨 *ANTI UNADMIN AKTIF!*\n\n` +
          `👤 Pelaku: @${pelaku.split('@')[0]}\n` +
          `🎯 Korban: @${korban.split('@')[0]}\n\n` +
          `✅ Admin korban dikembalikan\n` +
          `❌ Pelaku dikeluarkan`,
        mentions: [pelaku, korban]
      })

    } catch (e) {
      console.log('[ANTI UNADMIN] Execution Error:', e)

      // Fallback: minimal kembalikan admin korban
      try {
        await conn.groupParticipantsUpdate(
          m.chat,
          [korban],
          'promote'
        )
      } catch {}
    }

  } catch (e) {
    console.log('[ANTI UNADMIN] Error:', e)
  }

  return true
}

export default handler