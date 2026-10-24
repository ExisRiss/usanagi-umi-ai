let handler = async (m, { conn, text, isOwner }) => {

  if (!isOwner)
    return m.reply('Hanya Owner yang bisa mengganti tampilan menu!')

  // ================= SAFE DB INIT =================
  if (!global.db)
    global.db = { data: {} }

  if (!global.db.data)
    global.db.data = {}

  if (!global.db.data.settings)
    global.db.data.settings = {}

  const jid = conn.user.jid

  // ================= GET OR CREATE SETTINGS =================
  let setting = global.db.data.settings[jid]

  if (!setting) {
    setting = global.db.data.settings[jid] = {
      setmenu: 1
    }
  }

  // ================= LIST STYLE =================
  if (!text) {
    return m.reply(
`*List Style Menu*

1. Native Flow
2. Interactive Button
3. Classic Text
4. System Status Dashboard
5. Interactive Bottom Sheet

Contoh:
.setmenu 5`
    )
  }

  // ================= PARSE TYPE =================
  const type = parseInt(text)

  if (
    isNaN(type) ||
    type < 1 ||
    type > 5
  ) {
    return m.reply(
      '❌ Pilihan hanya 1, 2, 3, 4, atau 5!'
    )
  }

  // ================= SAVE SETTING =================
  setting.setmenu = type

  // ================= STYLE NAME =================
  const name = {
    1: 'Native Flow',
    2: 'Interactive Button',
    3: 'Classic Text',
    4: 'System Status Dashboard',
    5: 'Interactive Bottom Sheet'
  }

  // ================= SUCCESS =================
  return m.reply(
`✅ Menu berhasil diubah

📌 Style: *${name[type]}* (${type})
👤 Set oleh: Owner`
  )
}

handler.help = ['setmenu']
handler.tags = ['owner']
handler.command = /^setmenu$/i
handler.owner = true

export default handler