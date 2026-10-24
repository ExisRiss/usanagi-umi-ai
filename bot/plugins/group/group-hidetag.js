// Code By Xnuvers007
// Fix LID + Force Mention By ChatGPT 🗿 + Media Support
// Added: @all / @semua prefix khusus

import { generateWAMessageFromContent, proto } from '@rexxhayanasi/elaina-baileys'

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

const getMentions = async (conn, participants) => {
  let mentions = []

  for (let mem of participants || []) {
    let rawJid =
      mem.jid ||
      mem.phoneNumber ||
      mem.participant ||
      mem.id ||
      mem.lid

    let jid = await fixJid(conn, rawJid)

    if (jid && !mentions.includes(jid)) {
      mentions.push(jid)
    }
  }

  return mentions
}

const sendHidetag = async (conn, m, teks, mentions) => {
  // Reply pesan
  if (m.quoted) {
    let msg = conn.cMod(
      m.chat,
      m.quoted.vM,
      teks,
      conn.user.jid,
      { mentions }
    )

    return await conn.relayMessage(
      m.chat,
      msg.message,
      { messageId: msg.key.id }
    )
  }

  // Pesan teks biasa
  const msg = generateWAMessageFromContent(
    m.chat,
    {
      extendedTextMessage: proto.Message.ExtendedTextMessage.fromObject({
        text: teks,
        contextInfo: {
          mentionedJid: mentions
        }
      })
    },
    {
      quoted: m
    }
  )

  return await conn.relayMessage(
    m.chat,
    msg.message,
    { messageId: msg.key.id }
  )
}

let handler = async (m, { conn, text, participants }) => {
  let mentions = await getMentions(conn, participants)

  let teks =
    text ||
    m.quoted?.text ||
    m.quoted?.caption ||
    ''

  if (!teks) {
    return m.reply('Masukin teksnya atau reply pesan yang mau di-hidetag!')
  }

  await sendHidetag(conn, m, teks, mentions)
}

handler.help = ['hidetag', 'h']
handler.tags = ['group']
handler.command = /^(hidetag|h)$/i

handler.admin = true
handler.group = true

// =====================================================
// PREFIX KHUSUS @all / @semua
// Tidak membutuhkan prefix default bot
// =====================================================
handler.before = async function (m, { conn, participants }) {
  if (!m.isGroup) return
  if (!m.text) return

  // Harus benar-benar diawali @all atau @semua
  let match = m.text.match(/^@(all|semua)(?:\s+([\s\S]*))?$/i)

  if (!match) return

  // Ambil teks setelah @all / @semua
  let teks =
    match[2] ||
    m.quoted?.text ||
    m.quoted?.caption ||
    ''

  if (!teks) {
    return m.reply('Masukin teks setelah @all / @semua atau reply pesan!')
  }

  let mentions = await getMentions(conn, participants)

  await sendHidetag(conn, m, teks, mentions)

  return true
}

export default handler