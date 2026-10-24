
import { ensureGroupManager, resetGroupEventComponent } from '../../core/awang-welcome-config.js'
import { clearSessionWelcomeTemplate } from '../../lib/jadibot-group-welcome.js'

function resolveComponent(value) {
  const key = String(value || 'all').toLowerCase()
  if (['all', 'semua', 'reset'].includes(key)) return 'all'
  if (['text', 'teks'].includes(key)) return 'text'
  if (['media', 'gambar', 'video', 'gif'].includes(key)) return 'media'
  return ''
}

function componentLabel(component) {
  if (component === 'text') return 'Text Welcome'
  if (component === 'media') return 'Media Welcome'
  return 'seluruh custom Welcome'
}

const handler = async (m, { conn, usedPrefix }) => {
  const permission = await ensureGroupManager(m, conn)
  if (!permission.allowed) {
    await m.reply(
      permission.reason === 'group'
        ? 'Perintah ini hanya bisa dipakai di dalam group.'
        : 'Perintah ini hanya dapat diatur oleh owner bot atau admin group.'
    )
    return
  }

  const component = resolveComponent(m.args?.[0])
  if (!component) {
    await m.reply([
      '╭─〔 RESETWELCOME 〕',
      '│',
      `│ ${usedPrefix}resetwelcome`,
      '│ Reset semua custom Welcome.',
      '│',
      '├─ Reset satu komponen',
      `│ ${usedPrefix}resetwelcome text`,
      `│ ${usedPrefix}resetwelcome media`,
      '╰───────────────',
    ].join('\n'))
    return
  }

  try {
    const isJadibot = conn?.botConfig?.type === 'jadibot'
    const sessionTextCleared = isJadibot && ['all', 'text'].includes(component)
      ? clearSessionWelcomeTemplate(conn, m.chat)
      : false
    // The SQLite text is shared. A Jadibot reset may clear only its own
    // session template; for "all", retain shared text and reset media only.
    const sharedComponent = isJadibot && component === 'all' ? 'media' : component
    const result = isJadibot && component === 'text'
      ? { changed: false }
      : await resetGroupEventComponent(m.chat, 'welcome', sharedComponent)
    if (!result.changed && !sessionTextCleared) {
      await m.reply([
        '╭─〔 RESET WELCOME 〕',
        '│',
        `│ Belum ada custom ${component === 'all' ? 'konfigurasi' : componentLabel(component)} yang perlu di-reset.`,
        '│ Default Usanagi Umi AI tetap digunakan.',
        '╰───────────────',
      ].join('\n'))
      return
    }

    await m.reply([
      `╭─〔 ✅ RESETWELCOME ${component === 'all' ? 'TOTAL' : 'SEBAGIAN'} 〕`,
      '│',
      `│ ${component === 'all' ? 'Seluruh custom Welcome' : componentLabel(component)}`,
      '│ berhasil di-reset.',
      '│',
      '├─ Hasil',
      '│ Kembali ke default Usanagi Umi AI.',
      '│ Scope: Group ini saja',
      '╰───────────────',
    ].join('\n'))
  } catch (err) {
    await m.reply(`Reset Welcome gagal dilakukan.\n\n${String(err?.message || err)}`)
  }
}

handler.command = /^resetwelcome$/i
handler.help = ['resetwelcome']
handler.tags = ['group']
handler.category = 'group'
handler.description = 'Mereset seluruh atau sebagian custom Welcome group'
handler.groupOnly = true

export default handler
