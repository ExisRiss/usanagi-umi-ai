import fs from 'fs'
import { generateWAMessageFromContent, proto } from '@rexxhayanasi/elaina-baileys'

const dbPath = './lib/chat.json'

const loadDB = () => {
  try {
    return JSON.parse(fs.readFileSync(dbPath))
  } catch {
    return {}
  }
}

const metadataCache = new Map()

const getGroupMeta = async (conn, jid) => {
  try {
    const cache = metadataCache.get(jid)
    if (cache && Date.now() - cache.time < 300000) return cache.data

    const meta = await conn.groupMetadata(jid)
    metadataCache.set(jid, { data: meta, time: Date.now() })
    return meta
  } catch (e) {
    console.log('Metadata Error:', e)
    return { participants: [] }
  }
}

const cleanJid = jid => {
  if (!jid) return ''
  if (typeof jid !== 'string') jid = String(jid)
  return jid.replace(/:\d+@/g, '@')
}

const jidNum = jid => cleanJid(jid).split('@')[0].replace(/\D/g, '')

const isRealJid = jid => {
  jid = cleanJid(jid)
  return jid.endsWith('@s.whatsapp.net') && /^\d+$/.test(jidNum(jid))
}

const getRealJid = p => {
  const list = [
    p?.jid,
    p?.phoneNumber,
    p?.participant
  ].map(cleanJid)

  return list.find(isRealJid) || ''
}

const getLidJid = p => cleanJid(p?.id || p?.lid || '')

const sameUser = (a, b) => {
  a = jidNum(a)
  b = jidNum(b)
  return a && b && a === b
}

const findCount = (counts, ...jids) => {
  for (const key in counts) {
    for (const jid of jids) {
      if (sameUser(key, jid)) return counts[key] || 0
    }
  }
  return 0
}

let handler = async (m, { conn }) => {
  try {
    const db = loadDB()

    if (!db[m.chat]) {
      return m.reply('Belum ada data pesan.')
    }

    const meta = await getGroupMeta(conn, m.chat)
    const participants = meta.participants || []
    const counts = db[m.chat] || {}

    let data = []

    for (const p of participants) {
      const realJid = getRealJid(p)
      const lidJid = getLidJid(p)

      if (!realJid) continue

      data.push({
        jid: realJid,
        number: jidNum(realJid),
        total: findCount(counts, realJid, lidJid)
      })
    }

    data.sort((a, b) => b.total - a.total)

    const totalPesan = data.reduce((a, b) => a + b.total, 0)
    const mentions = data.map(v => v.jid)

    const list = data.map((v, i) => {
      return `*${i + 1}.* @${v.number} : *${v.total}* pesan`
    }).join('\n')

    const teks =
`📊 *TOTAL CHAT GROUP*

👥 Member : ${participants.length}
💬 Total Pesan : ${totalPesan}

${list}`

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

  } catch (e) {
    console.log(e)
    m.reply('Error mengambil total chat.')
  }
}

handler.help = ['totalchat']
handler.tags = ['group']
handler.command = /^(totalchat|totalpesan)$/i
handler.group = true
handler.admin = true

export default handler