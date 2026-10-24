/* By AlzRiss - Usanagi Umi AI */

import { isOwner } from '../../lib/awang-cekakses.js'
import { isGroupAdmin } from '../../lib/awang-aksesgrub.js'
import { isGoodbyeEnabled, setGoodbyeEnabled } from '../../core/awang-goodbye.js'
import { getConfigReport, getGroupGoodbyeConfig } from '../../core/awang-welcome-config.js'
import { getSessionGoodbyeTemplate } from '../../lib/jadibot-group-welcome.js'

function renderStatus(conn, groupId) {
  const shared = { ...(getGroupGoodbyeConfig(groupId) || {}) }
  if (conn?.botConfig?.type !== 'jadibot') return getConfigReport(shared)

  // SQLite text belongs to the main/shared bot scope. Status for a Jadibot
  // must show only that session's text, while retaining the media summary.
  delete shared.text
  const sessionText = getSessionGoodbyeTemplate(conn, groupId)
  if (sessionText) shared.text = sessionText
  return getConfigReport(shared)
}

function formatStatus(prefix, enabled, report) {
  const lines = [
    '╭─〔 GOODBYE 〕',
    '│',
    `│ Status : *${enabled ? 'AKTIF ✓' : 'NONAKTIF ✕'}*`,
    `│ Custom : *${report.hasCustom ? 'ADA' : 'BELUM ADA'}*`,
    '│',
    '├─ Konfigurasi',
    `│ Text   : *${report.text ? 'Custom' : 'Default'}*`,
  ]

  if (report.textPreview) {
    lines.push('│ Preview:')
    lines.push(`│ ${report.textPreview.replace(/\n/g, '\n│ ')}`)
  }

  lines.push(`│ Media  : *${report.media}*`)
  if (report.mediaDuration > 0) lines.push(`│ Durasi : *${report.mediaDuration.toFixed(2)} detik*`)
  lines.push('│ Button : *Default Usanagi Umi AI*')
  lines.push('│', '├─ Kontrol', `│ ${prefix}goodbye on/off`, `│ ${prefix}resetgoodbye`, `│ ${prefix}resetgoodbye text/media`, '╰──────────────')
  return lines.join('\n')
}

const handler = async (m, { conn, usedPrefix }) => {
  if (!m.isGroup) {
    await m.reply('Fitur Goodbye hanya dapat digunakan di dalam group.')
    return
  }

  const owner = await isOwner(m.sender, conn)
  const admin = owner || await isGroupAdmin(conn, m.chat, m.sender)
  if (!admin) {
    await m.reply('Perintah ini hanya dapat diatur oleh owner bot atau admin group.')
    return
  }

  const action = String(m.args?.[0] || '').toLowerCase()
  const current = isGoodbyeEnabled(m.chat)

  if (action === 'on' || action === 'aktif' || action === 'enable') {
    setGoodbyeEnabled(m.chat, true)
    await m.reply([
      '╭─〔 GOODBYE AKTIF 〕',
      '│',
      '│ Member baru akan mendapatkan',
      '│ sambutan otomatis saat bergabung.',
      '│ Goodbye tidak ikut berubah.',
      '│',
      `│ Cek : ${usedPrefix}goodbye status`,
      `│ Off : ${usedPrefix}goodbye off`,
      '╰────────────────',
    ].join('\n'))
    return
  }

  if (action === 'off' || action === 'mati' || action === 'disable') {
    setGoodbyeEnabled(m.chat, false)
    await m.reply([
      '╭─〔 GOODBYE NONAKTIF 〕',
      '│',
      '│ Sambutan Goodbye otomatis dimatikan.',
      '│ Goodbye tidak ikut berubah.',
      '│',
      `│ Cek : ${usedPrefix}goodbye status`,
      `│ On  : ${usedPrefix}goodbye on`,
      '╰────────────────',
    ].join('\n'))
    return
  }

  await m.reply(formatStatus(usedPrefix, current, renderStatus(conn, m.chat)))
}

handler.command = /^goodbye$/i
handler.help = ['goodbye']
handler.tags = ['group']
handler.category = 'group'
handler.description = 'Mengaktifkan, menonaktifkan, dan mengecek konfigurasi Goodbye group'
handler.groupOnly = true

export default handler
