/* By AlzRiss - Usanagi Umi AI */

import { isChatBanned, setChatBanned } from '../../core/awang-banchat.js'

const UNBAN_COMMANDS = new Set(['unbanchat', 'unbangroup'])

const handler = async (m, { conn }) => {
  if (!m.isGroup) {
    await conn.sendMessage(m.chat, { text: 'Perintah ini hanya dapat digunakan di dalam group.' }, { quoted: m.raw })
    return
  }

  const command = String(m.command || '').toLowerCase()
  const isUnban = UNBAN_COMMANDS.has(command)
  const banned = isChatBanned(m.chat)
  let groupName = 'Group ini'

  try {
    const metadata = await conn.groupMetadata(m.chat)
    groupName = metadata?.subject || groupName
  } catch {}

  if (isUnban) {
    if (!banned) {
      await conn.sendMessage(
        m.chat,
        { text: `╭─〔 BAN GROUP 〕\n│\n│ ${groupName} tidak sedang\n│ dalam status banned.\n╰──────────────` },
        { quoted: m.raw }
      )
      return
    }

    setChatBanned(m.chat, false, m.sender)
    await conn.sendMessage(
      m.chat,
      {
        text: [
          '╭─〔 BAN GROUP 〕',
          '│',
          `│ Group   : *${groupName}*`,
          '│ Status  : *AKTIF*',
          `│ Diubah oleh : @${m.sender.split('@')[0]}`,
          '│',
          '│ Bot dapat digunakan kembali',
          '│ oleh seluruh member.',
          '╰──────────────',
        ].join('\n'),
        mentions: [m.sender],
      },
      { quoted: m.raw }
    )
    return
  }

  if (banned) {
    await conn.sendMessage(
      m.chat,
      { text: `╭─〔 BAN GROUP 〕\n│\n│ ${groupName} sudah dalam\n│ status banned.\n│\n│ Gunakan *.unbanchat* untuk\n│ membuka akses kembali.\n╰──────────────` },
      { quoted: m.raw }
    )
    return
  }

  setChatBanned(m.chat, true, m.sender)
  await conn.sendMessage(
    m.chat,
    {
      text: [
        '╭─〔 BAN GROUP 〕',
        '│',
        `│ Group   : *${groupName}*`,
        '│ Status  : *BANNED*',
        `│ Diubah oleh : @${m.sender.split('@')[0]}`,
        '│',
        '│ Hanya owner bot yang dapat',
        '│ menggunakan bot di group ini.',
        '╰──────────────',
      ].join('\n'),
      mentions: [m.sender],
    },
    { quoted: m.raw }
  )
}

handler.command = /^(banchat|bangroup|bangrup|unbanchat|unbangroup)$/i
handler.help = ['banchat']
handler.menuHelp = ['banchat']
handler.tags = ['group']
handler.category = 'group'
handler.description = 'Ban atau unban group dari penggunaan bot'
handler.groupOnly = true
handler.ownerOnly = true

export default handler
