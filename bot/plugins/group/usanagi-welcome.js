/* By AlzRiss - Usanagi Umi AI */

import { isOwner } from '../../lib/awang-cekakses.js'
import { isGroupAdmin } from '../../lib/awang-aksesgrub.js'
import { isWelcomeEnabled, setWelcomeEnabled } from '../../core/awang-welcome.js'
import { getConfigReport, getGroupWelcomeConfig } from '../../core/awang-welcome-config.js'
import { getSessionWelcomeTemplate } from '../../lib/jadibot-group-welcome.js'

function renderStatus(conn, groupId) {
  const shared = { ...(getGroupWelcomeConfig(groupId) || {}) }
  if (conn?.botConfig?.type !== 'jadibot') return getConfigReport(shared)

  // SQLite text belongs to the main/shared bot scope. Status for a Jadibot
  // must show only that session's text, while retaining the media summary.
  delete shared.text
  const sessionText = getSessionWelcomeTemplate(conn, groupId)
  if (sessionText) shared.text = sessionText
  return getConfigReport(shared)
}

// The participant-event listener used by the active main bot reads this
// established per-chat flag. Keep it synchronized with the SQLite-backed
// /welcome on/off setting so the visible status and the actual event sender
// can never disagree.
export function syncLegacyWelcomeEventFlag(groupId, enabled) {
  const chatId = String(groupId || '').trim()
  const chats = global.db?.data?.chats
  if (!chatId || !chats) return false

  if (!chats[chatId]) chats[chatId] = {}
  chats[chatId].welcome = Boolean(enabled)
  return true
}

function formatStatus(prefix, enabled, report) {
  const lines = [
    '╭─〔 WELCOME 〕',
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
  lines.push('│', '├─ Kontrol', `│ ${prefix}welcome on/off`, `│ ${prefix}resetwelcome`, `│ ${prefix}resetwelcome text/media`, '╰───────────────')
  return lines.join('\n')
}

const handler = async (m, { conn, usedPrefix }) => {
  if (!m.isGroup) {
    await m.reply('Fitur Welcome hanya dapat digunakan di dalam group.')
    return
  }

  const owner = await isOwner(m.sender, conn)
  const admin = owner || await isGroupAdmin(conn, m.chat, m.sender)
  if (!admin) {
    await m.reply('Perintah ini hanya dapat diatur oleh owner bot atau admin group.')
    return
  }

  const action = String(m.args?.[0] || '').toLowerCase()
  const current = isWelcomeEnabled(m.chat)

  if (action === 'on' || action === 'aktif' || action === 'enable') {
    setWelcomeEnabled(m.chat, true)
    syncLegacyWelcomeEventFlag(m.chat, true)
    await m.reply([
      '╭─〔 WELCOME AKTIF 〕',
      '│',
      '│ Member baru akan mendapatkan',
      '│ sambutan otomatis saat bergabung.',
      '│ Goodbye tidak ikut berubah.',
      '│',
      `│ Cek : ${usedPrefix}welcome status`,
      `│ Off : ${usedPrefix}welcome off`,
      '╰───────────────',
    ].join('\n'))
    return
  }

  if (action === 'off' || action === 'mati' || action === 'disable') {
    setWelcomeEnabled(m.chat, false)
    syncLegacyWelcomeEventFlag(m.chat, false)
    await m.reply([
      '╭─〔 WELCOME NONAKTIF 〕',
      '│',
      '│ Sambutan Welcome otomatis dimatikan.',
      '│ Goodbye tidak ikut berubah.',
      '│',
      `│ Cek : ${usedPrefix}welcome status`,
      `│ On  : ${usedPrefix}welcome on`,
      '╰────────────────',
    ].join('\n'))
    return
  }

  await m.reply(formatStatus(usedPrefix, current, renderStatus(conn, m.chat)))
}

handler.command = /^welcome$/i
handler.help = ['welcome']
handler.tags = ['group']
handler.category = 'group'
handler.description = 'Mengaktifkan, menonaktifkan, dan mengecek konfigurasi Welcome group'
handler.groupOnly = true

export default handler
