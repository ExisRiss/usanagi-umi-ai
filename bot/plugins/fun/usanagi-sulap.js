/* By AlzRiss - Usanagi Umi AI */

import { requireFunTarget } from '../../lib/awang-fun.js'

import { isGroupAdmin, isBotAdmin, getParticipantJid } from '../../lib/awang-aksesgrub.js'


const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const handler = async (m, { conn }) => {
  if (!m.isGroup) {
    return m.reply('Perintah ini hanya bisa digunakan di dalam group.')
  }

  const targetData = await requireFunTarget(m, conn, { groupLookup: true })
  if (!targetData) return
  if (!targetData.jid) return m.reply('Tag atau reply orangnya dulu.')
  const target = targetData.jid

  try {
    const metadata = await conn.groupMetadata(m.chat)
    const adminOk = await isGroupAdmin(conn, m.chat, m.sender, metadata)
    const botOk = await isBotAdmin(conn, m.chat, metadata)

    if (!adminOk) {
      return m.reply('Hanya admin group yang bisa memakai perintah ini.')
    }
    if (!botOk) {
      return m.reply('Bot harus menjadi admin untuk menjalankan sulap.')
    }

    if (target === m.sender) {
      return m.reply('Tidak bisa menyulap diri sendiri.')
    }

    const tag = '@' + target.split('@')[0].split(':')[0]

    await conn.sendMessage(
      m.chat,
      {
        text: `*SULAP*\n\nSiap-siap...\nTarget: ${tag}`,
        mentions: [target],
      },
      { quoted: m.raw }
    )

    await sleep(1500)
    await m.reply('3...')
    await sleep(800)
    await m.reply('2...')
    await sleep(800)
    await m.reply('1...')
    await sleep(800)

    await conn.groupParticipantsUpdate(m.chat, [target], 'remove')

    await conn.sendMessage(
      m.chat,
      {
        text: `*POOF!*\n\n${tag} berhasil dihilangkan dari group.`,
        mentions: [target],
      },
      { quoted: m.raw }
    )
  } catch {
    await m.reply('Sulap gagal. Pastikan bot admin dan target valid.')
  }
}

handler.command = /^(sulap|magic)$/i
handler.help = ['sulap']
handler.tags = ['fun']
handler.description = 'Menghilangkan member dari group secara dramatis'
handler.group = true

export default handler
