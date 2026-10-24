/* By AlzRiss - Usanagi Umi AI */

import { isOwner } from '../../lib/awang-cekakses.js'
import { isGroupAdmin } from '../../lib/awang-aksesgrub.js'
import { getAntiTagSwStatus, setAntiTagSwStatus } from '../../core/awang-antitagsw.js'

const handler = async (m, { conn, usedPrefix }) => {
  if (!m.isGroup) {
    await conn.sendMessage(m.chat, { text: 'Fitur anti-tagsw hanya dapat digunakan di dalam group.' }, { quoted: m.raw })
    return
  }

  const owner = await isOwner(m.sender, conn)
  const admin = owner || await isGroupAdmin(conn, m.chat, m.sender)
  if (!admin) {
    await conn.sendMessage(m.chat, { text: 'Perintah ini hanya dapat diatur oleh owner bot atau admin group.' }, { quoted: m.raw })
    return
  }

  const action = String(m.args?.[0] || '').toLowerCase()

  if (!['on', 'off', 'aktif', 'enable', 'mati', 'disable', 'status'].includes(action)) {
    await conn.sendMessage(
      m.chat,
      {
        text: [
          '╭─〔 ANTI TAG STATUS 〕',
          '│',
          '│ Menghapus pesan tag status',
          '│ (groupStatusMentionMessage)',
          '│ yang masuk ke group.',
          '│',
          `│ ${usedPrefix}antitagsw on`,
          `│ ${usedPrefix}antitagsw off`,
          `│ ${usedPrefix}antitagsw status`,
          '╰──────────────',
        ].join('\n'),
      },
      { quoted: m.raw }
    )
    return
  }

  const current = getAntiTagSwStatus(m.chat)
  if (action === 'status') {
    await conn.sendMessage(
      m.chat,
      { text: `╭─〔 ANTI TAG STATUS 〕\n│\n│ Status : *${current ? 'AKTIF' : 'NONAKTIF'}*\n╰──────────────` },
      { quoted: m.raw }
    )
    return
  }

  const enabled = ['on', 'aktif', 'enable'].includes(action)
  setAntiTagSwStatus(m.chat, enabled)

  await conn.sendMessage(
    m.chat,
    {
      text: [
        '╭─〔 ANTI TAG STATUS 〕',
        '│',
        `│ Status : *${enabled ? 'AKTIF' : 'NONAKTIF'}*`,
        '│',
        enabled ? '│ Tag status akan dihapus' : '│ Moderasi tag status telah',
        enabled ? '│ otomatis dari group ini.' : '│ dinonaktifkan.',
        '╰──────────────',
      ].join('\n'),
    },
    { quoted: m.raw }
  )
}

handler.command = /^(antitagsw|antitag|antistatustag)$/i
handler.help = ['antitagsw']
handler.menuHelp = ['antitagsw']
handler.tags = ['group']
handler.category = 'group'
handler.description = 'Mengatur anti tag status di group'
handler.groupOnly = true

export default handler
