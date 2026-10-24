// Code By Xnuvers007
// Fix LID + Force Mention By ChatGPT 

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

const toM = jid => {
  return '@' + cleanJid(jid).split('@')[0]
}

let handler = async (m, { conn, text, participants }) => {
  let teks = `◇───── Tag All ─────◇
乂 *Pesan : ${text ? text : 'kosong'}*

`

  let mentions = []

  for (let mem of participants) {
    let rawJid = mem.jid || mem.phoneNumber || mem.participant || mem.id || mem.lid
    let jid = await fixJid(conn, rawJid)

    if (!jid) continue

    teks += `• ${toM(jid)}\n`
    mentions.push(jid)
  }

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

  await conn.relayMessage(m.chat, msg.message, {
    messageId: msg.key.id
  })
}

handler.help = ['tagall']
handler.tags = ['group']
handler.command = ['tagall']

handler.admin = true
handler.group = true

export default handler