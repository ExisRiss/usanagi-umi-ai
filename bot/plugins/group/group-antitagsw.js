let handler = async (m, { args, isAdmin, isOwner }) => {
  if (!m.isGroup) return m.reply("Fitur ini hanya dapat digunakan dalam grup.")
  if (!(isAdmin || isOwner)) return m.reply("Maaf, fitur ini hanya untuk admin.")

  // init db chats
  if (!global.db.data.chats) global.db.data.chats = {}
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

  let chat = global.db.data.chats[m.chat]

  if (!args[0]) {
    return m.reply(
`Gunakan:
.antitagsw on / off
.antitagsw set <jumlah>

Catatan:
Default = langsung dihapus (0x)
Contoh:
.antitagsw set 1`
    )
  }

  if (args[0] === "on") {
    if (chat.antitagsw) return m.reply("Anti Tag Status sudah aktif.")

    chat.antitagsw = true

    return m.reply(`✅ Anti Tag Status aktif!
Default: langsung dihapus (belum di-set limit)`)
  }

  if (args[0] === "off") {
    if (!chat.antitagsw) return m.reply("Anti Tag Status sudah nonaktif.")

    chat.antitagsw = false
    return m.reply("❌ Anti Tag Status dimatikan.")
  }

  if (args[0] === "set") {
    let limit = parseInt(args[1])
    if (isNaN(limit) || limit < 0) {
      return m.reply("Masukkan angka yang valid.\nContoh: .antitagsw set 1")
    }

    chat.antitagswLimit = limit
    return m.reply(`✅ Limit tag SW diatur menjadi ${limit}x per hari`)
  }

  return m.reply("Opsi tidak valid.")
}

// ==============================
// 🔥 AUTO DETECT TAG STATUS
// ==============================
handler.before = async (m, { conn, isBotAdmin, isAdmin, isOwner, usedPrefix }) => {
  if (!m.isGroup) return
  if (!isBotAdmin) return

  // init chats
  if (!global.db.data.chats) global.db.data.chats = {}
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

  let chat = global.db.data.chats[m.chat]
  if (!chat.antitagsw) return

  // skip command
  if (typeof m.text === "string") {
    let txt = m.text.toLowerCase()
    if (txt.startsWith((usedPrefix || ".") + "antitagsw")) return
  }

  const isTagStatus =
    m.mtype === "groupStatusMentionMessage" ||
    (m.quoted && m.quoted.mtype === "groupStatusMentionMessage") ||
    (m.message && m.message.groupStatusMentionMessage) ||
    (m.message && m.message.protocolMessage && m.message.protocolMessage.type === 25)

  if (!isTagStatus) return

  // 👑 ADMIN BYPASS
  if (isAdmin || isOwner) return

  // ==============================
  // 🔢 LIMIT SYSTEM
  // ==============================
  if (!global.db.data.users) global.db.data.users = {}
  if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}

  let userData = global.db.data.users[m.sender]

  let today = new Date().toISOString().slice(0, 10)

  // reset harian
  if (userData.lastTagDate !== today) {
    userData.lastTagDate = today
    userData.tagCount = 0
  }

  // 🔥 DEFAULT = 0 (langsung block)
  let limit = (chat.antitagswLimit != null) ? chat.antitagswLimit : 0

  // 🚫 BLOCK TOTAL / DEFAULT
  if (limit === 0) {
    try {
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.sender
        }
      })
    } catch (e) {}

    let user = `@${m.sender.split("@")[0]}`
    return conn.sendMessage(m.chat, {
      text: `🚫 ${user}, tag SW tidak diizinkan di grup ini!`,
      mentions: [m.sender]
    })
  }

  // 🚫 OVER LIMIT
  if (userData.tagCount >= limit) {
    try {
      await conn.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.sender
        }
      })
    } catch (e) {}

    let user = `@${m.sender.split("@")[0]}`
    return conn.sendMessage(m.chat, {
      text: `🚫 ${user}, limit tag SW kamu habis (${limit}x/hari).`,
      mentions: [m.sender]
    })
  }

  // ✅ IZINKAN
  userData.tagCount += 1

  let user = `@${m.sender.split("@")[0]}`
  await conn.sendMessage(m.chat, {
    text: `✅ ${user} menggunakan tag SW (${userData.tagCount}/${limit})`,
    mentions: [m.sender]
  })
}

handler.command = /^antitagsw$/i
handler.help = [
  "antitagsw on",
  "antitagsw off",
  "antitagsw set <jumlah>"
]
handler.tags = ["group"]
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler