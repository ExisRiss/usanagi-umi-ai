
import { requireFunTarget } from '../../lib/awang-fun.js'

if (!globalThis.usanagiTembak) globalThis.usanagiTembak = new Map()
if (!globalThis.usanagiPasangan) globalThis.usanagiPasangan = new Map()


const handler = async (m, { conn }) => {
  if (!m.isGroup) {
    return m.reply('Perintah ini hanya bisa digunakan di dalam group.')
  }

  const targetData = await requireFunTarget(m, conn, { groupLookup: true })
  if (!targetData) return
  if (!targetData.jid) return m.reply('Tag atau reply orangnya dulu.')
  const target = targetData.jid

  if (target === m.sender) {
    return m.reply('Tidak bisa menembak diri sendiri.')
  }

  if (globalThis.usanagiPasangan.get(m.sender) || globalThis.usanagiPasangan.get(target)) {
    return m.reply('Salah satu dari kalian sudah memiliki pasangan.')
  }

  const key = `${m.chat}:${m.sender}:${target}`
  globalThis.usanagiTembak.set(key, {
    shooter: m.sender,
    target,
    chat: m.chat,
    at: Date.now(),
  })

  setTimeout(() => globalThis.usanagiTembak.delete(key), 5 * 60 * 1000)

  const tagS = '@' + m.sender.split('@')[0].split(':')[0]
  const tagT = '@' + target.split('@')[0].split(':')[0]

  await conn.sendMessage(
    m.chat,
    {
      text:
        `*TEMBAK*\n\n` +
        `${tagS} menembak ${tagT}\n\n` +
        `Balas dengan:\n` +
        `> .terima\n` +
        `> .tolak`,
      mentions: [m.sender, target],
    },
    { quoted: m.raw }
  )
}

handler.command = /^(tembak|nembak)$/i
handler.help = ['tembak']
handler.tags = ['fun']
handler.description = 'Menembak seseorang di group'
handler.group = true

export default handler
