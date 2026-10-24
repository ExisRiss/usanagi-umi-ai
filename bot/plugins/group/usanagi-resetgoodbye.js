
import { ensureGroupManager, resetGroupEventComponent } from '../../core/awang-welcome-config.js'
import { clearSessionGoodbyeTemplate } from '../../lib/jadibot-group-welcome.js'

function resolveComponent(value) {
  const key = String(value || 'all').toLowerCase()
  if (['all', 'semua', 'reset'].includes(key)) return 'all'
  if (['text', 'teks'].includes(key)) return 'text'
  if (['media', 'gambar', 'video', 'gif'].includes(key)) return 'media'
  return ''
}

function componentLabel(component) {
  if (component === 'text') return 'Text Goodbye'
  if (component === 'media') return 'Media Goodbye'
  return 'seluruh custom Goodbye'
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
      '╭─〔 RESETGOODBYE 〕',
      '│',
      `│ ${usedPrefix}resetgoodbye`,
      '│ Reset semua custom Goodbye.',
      '│',
      '├─ Reset satu komponen',
      `│ ${usedPrefix}resetgoodbye text`,
      `│ ${usedPrefix}resetgoodbye media`,
      '╰───────────────',
    ].join('\n'))
    return
  }

  try {
    const isJadibot = conn?.botConfig?.type === 'jadibot'
    const sessionTextCleared = isJadibot && ['all', 'text'].includes(component)
      ? clearSessionGoodbyeTemplate(conn, m.chat)
      : false
    // The SQLite text is shared. A Jadibot reset may clear only its own
    // session template; for "all", retain shared text and reset media only.
    const sharedComponent = isJadibot && component === 'all' ? 'media' : component
    const result = isJadibot && component === 'text'
      ? { changed: false }
      : await resetGroupEventComponent(m.chat, 'goodbye', sharedComponent)
    if (!result.changed && !sessionTextCleared) {
      await m.reply([
        '╭─〔 RESET GOODBYE 〕',
        '│',
        `│ Belum ada custom ${component === 'all' ? 'konfigurasi' : componentLabel(component)} yang perlu di-reset.`,
        '│ Default Usanagi Umi AI tetap digunakan.',
        '╰──────────────',
      ].join('\n'))
      return
    }

    await m.reply([
      `╭─〔 ✅ RESETGOODBYE ${component === 'all' ? 'TOTAL' : 'SEBAGIAN'} 〕`,
      '│',
      `│ ${component === 'all' ? 'Seluruh custom Goodbye' : componentLabel(component)}`,
      '│ berhasil di-reset.',
      '│',
      '├─ Hasil',
      '│ Kembali ke default Usanagi Umi AI.',
      '│ Scope: Group ini saja',
      '╰──────────────',
    ].join('\n'))
  } catch (err) {
    await m.reply(`Reset Goodbye gagal dilakukan.\n\n${String(err?.message || err)}`)
  }
}

handler.command = /^resetgoodbye$/i
handler.help = ['resetgoodbye']
handler.tags = ['group']
handler.category = 'group'
handler.description = 'Mereset seluruh atau sebagian custom Goodbye group'
handler.groupOnly = true

export default handler
