import { limitsEnabled } from '../../lib/limit-mode.js'

let handler = async (m, { conn, botConfig }) => {
  let who = m.isGroup
    ? (m.mentionedJid[0] ? m.mentionedJid[0] : m.sender)
    : m.sender

  if (typeof global.db.data.users[who] == 'undefined')
    throw '❌ User tidak ditemukan'

  let user = global.db.data.users[who]

  const isDeveloper = global.owner?.some(v => {
    if (Array.isArray(v)) return who.includes(v[0])
    return who.includes(v)
  })

  // Task64: kalau admin mematikan limit (tombol OFF / default -1) tampilkan
  // keterangan gratis, bukan angka limit yang sudah tidak dipakai.
  const limitMode = limitsEnabled(botConfig)
  let limit =
    !limitMode
      ? '∞ Gratis (limit OFF)'
      : isDeveloper
      ? '∞ Unlimited'
      : user.premiumTime >= 1
      ? '∞ Unlimited'
      : user.limit

  let status =
    isDeveloper
      ? 'Developer'
      : user.premiumTime >= 1
      ? 'Premium'
      : user.level >= 1000
      ? 'Elite'
      : 'Free User'

  let username = user.registered ? user.name : conn.getName(who)

  // Desain teks biasa yang lebih rapi menggunakan border dan emoji
  let caption = `
╭─「 *USER INFORMATION* 」
│ 👤 *Name:* ${username}
│ 🔰 *Status:* ${status}
│ 💳 *Limit:* ${limit}
╰───────────────
`.trim()

  // Menggunakan tipe pesan teks standar agar tidak memicu error media type
  await conn.sendMessage(m.chat, { 
    text: caption 
  }, { 
    quoted: m 
  })
}

handler.help = ['limit [@user]']
handler.tags = ['main']
handler.command = /^limit$/i
handler.limit = false

export default handler