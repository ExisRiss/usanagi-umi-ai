/* By AlzRiss - Usanagi Umi AI */

import { isOwner } from '../../lib/awang-cekakses.js'
import { isGroupAdmin } from '../../lib/awang-aksesgrub.js'
import { getAntiSwGcStatus, setAntiSwGcStatus } from '../../core/awang-antiswgc.js'

const handler = async (m, { conn, usedPrefix }) => {
  if (!m.isGroup) {
    await conn.sendMessage(m.chat, { text: 'Fitur anti-swgc hanya dapat digunakan di dalam group.' }, { quoted: m.raw })
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
          '╭─〔 ANTI SW GROUP 〕',
          '│',
          '│ Mendeteksi dan menghapus SW',
          '│ group mention / status mention',
          '│ yang masuk ke group.',
          '│',
          `│ ${usedPrefix}antiswgc on`,
          `│ ${usedPrefix}antiswgc off`,
          `│ ${usedPrefix}antiswgc status`,
          '╰──────────────',
        ].join('\n'),
      },
      { quoted: m.raw }
    )
    return
  }

  const current = getAntiSwGcStatus(m.chat)
  if (action === 'status') {
    await conn.sendMessage(
      m.chat,
      { text: `╭─〔 ANTI SW GROUP 〕\n│\n│ Status : *${current ? 'AKTIF' : 'NONAKTIF'}*\n╰──────────────` },
      { quoted: m.raw }
    )
    return
  }

  const enabled = ['on', 'aktif', 'enable'].includes(action)
  setAntiSwGcStatus(m.chat, enabled)

  await conn.sendMessage(
    m.chat,
    {
      text: [
        '╭─〔 ANTI SW GROUP 〕',
        '│',
        `│ Status : *${enabled ? 'AKTIF' : 'NONAKTIF'}*`,
        '│',
        enabled ? '│ SW group mention akan dihapus' : '│ Moderasi SW group telah',
        enabled ? '│ otomatis dari group ini.' : '│ dinonaktifkan.',
        '╰──────────────',
      ].join('\n'),
    },
    { quoted: m.raw }
  )
}

handler.command = /^(antiswgc|antiswgroup|antiswmentiongc|antiswtaggc)$/i
handler.help = ['antiswgc']
handler.menuHelp = ['antiswgc']
handler.tags = ['group']
handler.category = 'group'
handler.description = 'Mengatur anti SW group mention/status mention'
handler.groupOnly = true

export default handler
