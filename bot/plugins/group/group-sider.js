import { generateWAMessageFromContent, proto } from '@rexxhayanasi/elaina-baileys'

const INACTIVE_TIME = 3 * 24 * 60 * 60 * 1000 // 3 hari

const cleanJid = jid => {
  if (!jid) return ''
  if (typeof jid !== 'string') jid = String(jid)
  return jid.replace(/:\d+@/g, '@')
}

const fixJid = async (conn, jid) => {
  jid = cleanJid(jid)

  try {
    const data = await conn.findUserId(jid)
    return cleanJid(data?.phoneNumber || data?.jid || jid)
  } catch {
    return jid
  }
}

const getMemJid = mem => {
  return cleanJid(
    mem?.jid ||
    mem?.phoneNumber ||
    mem?.participant ||
    mem?.id ||
    mem?.lid ||
    ''
  )
}

const toM = jid => {
  return '@' + cleanJid(jid).split('@')[0]
}

const clockString = ms => {
  if (!isFinite(ms)) return 'Belum Pernah Aktif'

  const h = Math.floor(ms / 3600000)
  const m = Math.floor(ms / 60000) % 60

  return `${h}H ${m}J`
}

const sendForceMention = async (conn, m, text, mentions = {}) => {
  const msg = generateWAMessageFromContent(
    m.chat,
    {
      extendedTextMessage: proto.Message.ExtendedTextMessage.fromObject({
        text,
        contextInfo: {
          mentionedJid: mentions
        }
      })
    },
    {
      quoted: m
    }
  )

  await conn.relayMessage(m.chat, msg.message, {
    messageId: msg.key.id
  })
}

let handler = async (m, { conn, command, groupMetadata }) => {
  const users = global.db.data.users
  const members = groupMetadata.participants || []

  const memberData = []

  for (const mem of members) {
    const rawJid = getMemJid(mem)
    const jid = await fixJid(conn, rawJid)

    if (!jid) continue

    memberData.push({
      jid,
      rawJid
    })
  }

  // =========================
  // RESET SIDER
  // =========================
  if (command === 'resetsider') {
    let total = 0

    for (const mem of memberData) {
      if (!users[mem.jid]) users[mem.jid] = {}

      users[mem.jid].lastseen = Date.now()
      total++
    }

    return m.reply(`✅ Berhasil reset aktivitas ${total} member grup`)
  }

  // =========================
  // CEK SIDER
  // =========================
  let sider = []

  for (const mem of memberData) {
    if (mem.jid === conn.user.jid) continue

    const user = users[mem.jid] || {}
    const lastseen = user.lastseen || 0

    const inactive =
      !lastseen ||
      (Date.now() - lastseen > INACTIVE_TIME)

    if (inactive) {
      sider.push({
        jid: mem.jid,
        lastseen
      })
    }
  }

  // =========================
  // KICK SIDER
  // =========================
  if (command === 'kicksider') {
    let kicked = []

    for (const user of sider) {
      try {
        await conn.groupParticipantsUpdate(
          m.chat,
          [user.jid],
          'remove'
        )

        kicked.push(user.jid)
      } catch {}
    }

    if (!kicked.length) {
      return m.reply('Tidak ada sider yang berhasil di kick 🗿')
    }

    return sendForceMention(
      conn,
      m,
      `✅ Berhasil kick ${kicked.length} sider`,
      kicked
    )
  }

  // =========================
  // LIST SIDER
  // =========================
  if (!sider.length) {
    return m.reply('Tidak ada sider di grup ini 🗿')
  }

  const mentions = []
  const siderList = []

  for (const user of sider) {
    const time = user.lastseen
      ? clockString(Date.now() - user.lastseen)
      : 'Belum Pernah Aktif'

    siderList.push(`○ ${toM(user.jid)} (${time})`)
    mentions.push(user.jid)
  }

  const teks =
`*${sider.length}/${members.length}* anggota grup *${groupMetadata.subject}* terdeteksi sebagai *sider*

*Perintah Admin:*
🚫 Kick sider
.kicksider

♻️ Reset aktivitas
.resetsider

_“Harap aktif di grup karena akan ada pembersihan member setiap saat”_

*LIST SIDER:*
${siderList.join('\n')}`

  await sendForceMention(conn, m, teks, mentions)
}

handler.help = ['sider', 'kicksider', 'resetsider']
handler.tags = ['group']
handler.command = /^(sider|ceksider|kicksider|resetsider)$/i

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler