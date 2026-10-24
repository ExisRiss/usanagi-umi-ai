/* By AlzRiss - Usanagi Umi AI */

let handler = async (m, { args, isAdmin, isOwner }) => {
  // Pengecekan manual seperti di code antitagsw
  if (!m.isGroup) return m.reply("Fitur ini hanya dapat digunakan dalam grup.")
  if (!(isAdmin || isOwner)) return m.reply("Maaf, fitur ini hanya untuk owner.")

  // init db chats
  if (!global.db.data.chats) global.db.data.chats = {}
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

  let chat = global.db.data.chats[m.chat]

  if (!args[0]) {
    return m.reply(
`Gunakan:
.ammode on / off

Catatan:
Mengaktifkan mode Alight Motion Premium gratis untuk seluruh member grup.`
    )
  }

  if (args[0] === "on") {
    if (chat.am_mode) return m.reply("AM Mode sudah aktif di grup ini.")

    chat.am_mode = true

    return m.reply(`✅ *AM MODE AKTIF!*\n\nGrup ini sekarang beralih ke Mode Khusus Alight Motion Premium.\nSeluruh member bisa menggunakan fitur AM Prem secara gratis! Ketik *.ammenu* untuk melihat fitur.`)
  }

  if (args[0] === "off") {
    if (!chat.am_mode) return m.reply("AM Mode sudah nonaktif.")

    chat.am_mode = false
    return m.reply("❌ *AM MODE DIMATIKAN!*\n\nFitur Alight Motion kembali normal (Khusus Premium).")
  }

  return m.reply("Opsi tidak valid. Gunakan 'on' atau 'off'.")
}

handler.command = /^(ammode|modeam)$/i
handler.help = [
  "ammode on",
  "ammode off"
]
handler.tags = ["group"]
handler.group = true
handler.owner = true

export default handler