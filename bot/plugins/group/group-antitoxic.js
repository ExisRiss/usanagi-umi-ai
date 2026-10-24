const toxicWords = [
  "anjing",
  "babi",
  "bangsat",
  "kontol",
  "memek",
  "ngentot",
  "asu",
  "goblok",
  "tolol",
  "bajingan",
  "fuck",
  "shit",
  "bitch",
  "jembut",
  "ajg",
  "tlol",
  "bngst",
  "gblk",
  "dongo"
]

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let o = args[0] || ""

  if (!["--on", "--off"].includes(o)) {
    return conn.sendMessage(
      m.chat,
      {
        text: `*– 乂 Anti Toxic –*\n\nPilih mode Anti Toxic untuk grup ini.`,
        footer: global.wm || 'Usanagi-Umi-AI',
        buttons: [
          {
            buttonId: `${usedPrefix + command} --on`,
            buttonText: { displayText: "✅ ON" },
            type: 1
          },
          {
            buttonId: `${usedPrefix + command} --off`,
            buttonText: { displayText: "❌ OFF" },
            type: 1
          }
        ],
        headerType: 1
      },
      { quoted: m }
    )
  }

  if (!global.db.data.chats[m.chat]) {
    global.db.data.chats[m.chat] = {}
  }

  switch (o) {
    case "--on":
      global.db.data.chats[m.chat].antitoxic = true
      m.reply("✅ Anti Toxic berhasil diaktifkan")
      break

    case "--off":
      global.db.data.chats[m.chat].antitoxic = false
      m.reply("❌ Anti Toxic berhasil dinonaktifkan")
      break
  }
}

handler.before = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return
  if (!m.text) return
  if (!isBotAdmin) return

  const chat = global.db?.data?.chats?.[m.chat]

  if (!chat?.antitoxic) return
  if (isAdmin) return

  // clean text
  const text = m.text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")

  // detect toxic word
  const found = toxicWords.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, "i")
    return regex.test(text)
  })

  if (!found) return

  try {
    // hapus pesan
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.sender
      }
    })

    // warning
    await conn.reply(
      m.chat,
      `*– 乂 Anti Toxic –*\n\n⚠️ Pesan dari @${
        m.sender.split("@")[0]
      } mengandung kata toxic dan telah dihapus.`,
      m,
      {
        mentions: [m.sender]
      }
    )

  } catch (e) {
    console.error("AntiToxic Error:", e)
  }
}

handler.help = ["antitoxic"]
handler.tags = ["group"]
handler.command = /^antitoxic$/i

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler