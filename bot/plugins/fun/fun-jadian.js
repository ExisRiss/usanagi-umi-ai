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

let handler = async (m, { conn, groupMetadata }) => {
  let ps = groupMetadata.participants
    .map(v => v.jid || v.phoneNumber || v.participant || v.id || v.lid)
    .filter(Boolean)

  if (ps.length < 2) {
    return m.reply('Member grup kurang dari 2.')
  }

  let a = ps.getRandom()
  let b

  do {
    b = ps.getRandom()
  } while (b === a)

  a = await fixJid(conn, a)
  b = await fixJid(conn, b)

  const mentions = [a, b]

  const teks =
`Cieee yang baru jadian... 🥳

${toM(a)} ❤️ ${toM(b)}

Semoga langgeng ya ✨`

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

handler.command = ['jadian']
handler.group = true

export default handler