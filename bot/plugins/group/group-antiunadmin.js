// plugins/anti-unadmin-toggle.mjs
/*
📌 Nama Fitur: Anti Unadmin ON/OFF
🏷️ Type : Plugin ESM
*/

let handler = async (m, { args, usedPrefix, command }) => {
  if (!m.isGroup) {
    return m.reply('❌ Perintah ini hanya bisa digunakan di grup.')
  }

  // ==============================
  // DATABASE
  // ==============================

  if (!global.db.data)
    global.db.data = {}

  if (!global.db.data.chats)
    global.db.data.chats = {}

  if (!global.db.data.chats[m.chat]) {
    global.db.data.chats[m.chat] = {}
  }

  let chat = global.db.data.chats[m.chat]

  // ==============================
  // ARGUMENT
  // ==============================

  let option = (args[0] || '').toLowerCase()

  // ==============================
  // CEK STATUS
  // ==============================

  if (!option) {
    let status = chat.antiunadmin
      ? 'ON 🟢'
      : 'OFF 🔴'

    return m.reply(
      `🛡️ *ANTI UNADMIN*\n\n` +
      `📊 Status: *${status}*\n\n` +
      `Gunakan:\n` +
      `• ${usedPrefix + command} on\n` +
      `• ${usedPrefix + command} off`
    )
  }

  // ==============================
  // ON
  // ==============================

  if (option === 'on') {
    if (chat.antiunadmin) {
      return m.reply(
        `🛡️ *ANTI UNADMIN*\n\n` +
        `🟢 Anti Unadmin sudah aktif sebelumnya.`
      )
    }

    chat.antiunadmin = true

    return m.reply(
      `🛡️ *ANTI UNADMIN AKTIF!*\n\n` +
      `🟢 Status: *ON*\n\n` +
      `✅ Sistem Anti Unadmin berhasil diaktifkan.`
    )
  }

  // ==============================
  // OFF
  // ==============================

  if (option === 'off') {
    if (!chat.antiunadmin) {
      return m.reply(
        `🛡️ *ANTI UNADMIN*\n\n` +
        `🔴 Anti Unadmin sudah nonaktif sebelumnya.`
      )
    }

    chat.antiunadmin = false

    return m.reply(
      `🛡️ *ANTI UNADMIN DINONAKTIFKAN!*\n\n` +
      `🔴 Status: *OFF*\n\n` +
      `❌ Sistem Anti Unadmin berhasil dinonaktifkan.`
    )
  }

  // ==============================
  // FORMAT SALAH
  // ==============================

  return m.reply(
    `❌ *Format salah!*\n\n` +
    `Gunakan:\n` +
    `• ${usedPrefix + command} on\n` +
    `• ${usedPrefix + command} off`
  )
}

// ==============================
// COMMAND CONFIG
// ==============================

handler.help = [
  'antiunadmin on',
  'antikudeta on',
  'antiunadmin off'
]

handler.tags = ['group']

handler.command = /^(antiunadmin|antikudeta)$/i

handler.group = true
handler.admin = true

export default handler