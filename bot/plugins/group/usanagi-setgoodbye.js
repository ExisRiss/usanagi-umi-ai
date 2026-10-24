
import { ensureGroupManager, getCommandArgumentText, getConfigSummary, queueGroupEventMedia, updateGroupEventConfig } from '../../core/awang-welcome-config.js'
import { getCommandMediaSource, validateGroupEventMediaSource } from '../../core/awang-welcome-media.js'
import { setSessionGoodbyeTemplate } from '../../lib/jadibot-group-welcome.js'

function helpText(usedPrefix) {
  return [
    '╭─〔 SETGOODBYE 〕',
    '│',
    `│ ${usedPrefix}setgoodbye <text>`,
    '│',
    '├─ Media langsung',
    '│ Kirim gambar/video dengan caption command.',
    '│',
    '├─ Media reply',
    '│ Reply gambar/video lalu gunakan command.',
    '│',
    `│ Contoh: ${usedPrefix}setgoodbye Halo @user!`,
    '│',
    '├─ Variabel template',
    '│ @user    = Member yang masuk/keluar',
    '│ @subject = Nama group',
    '│ @info    = Informasi group',
    '│ @bot     = Informasi bot',
    '│ @member  = Jumlah member group',
    '│ @deks    = Deskripsi group',
    '│ @desc    = Alias @deks',
    '│',
    '│ Welcome/Goodbye dikirim dengan tombol',
    '│ Info Grup, Menu Bot, dan Peraturan.',
    '│ Link yang ditulis tetap menjadi bagian text custom.',
    `│ Cek konfigurasi: ${usedPrefix}goodbye status`,
    '╰────────────────',
  ].join('\n')
}

function buildPatch(rawText) {
  const patch = {}
  if (rawText) patch.text = rawText
  return patch
}

function successText(usedPrefix, summary, textChanged) {
  return [
    '╭─〔 ✅ SETGOODBYE 〕',
    '│',
    '│ Konfigurasi Goodbye diperbarui.',
    '│',
    '├─ Komponen',
    `│ Text  : *${textChanged ? 'Diperbarui' : summary.text ? 'Tetap custom' : 'Default'}*`,
    `│ Media : *${summary.media}*`,
    '│ Button: *Default Usanagi Umi AI*',
    '│',
    '├─ Scope',
    '│ Group ini saja',
    '╰───────────────',
  ].join('\n')
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

  const rawText = getCommandArgumentText(m, usedPrefix)
  const mediaSource = getCommandMediaSource(m)
  if (!rawText && !mediaSource) {
    await m.reply(helpText(usedPrefix))
    return
  }

  const validation = mediaSource ? validateGroupEventMediaSource(mediaSource) : { valid: true, reason: '' }
  if (!validation.valid) {
    await m.reply(`Media Goodbye tidak dapat digunakan.\n\n${validation.reason}`)
    return
  }

  const isJadibot = conn?.botConfig?.type === 'jadibot'
  // SQLite config is shared by every connection. Never write Jadibot text there.
  const patch = buildPatch(isJadibot ? '' : rawText)
  const textChanged = Boolean(rawText)

  if (!mediaSource) {
    try {
      if (isJadibot && rawText) {
        setSessionGoodbyeTemplate(conn, m.chat, rawText)
        await m.reply(successText(usedPrefix, getConfigSummary({}), textChanged))
        return
      }
      const saved = await updateGroupEventConfig(m.chat, 'goodbye', patch)
      if (rawText && isJadibot) setSessionGoodbyeTemplate(conn, m.chat, rawText)
      const summary = getConfigSummary(saved || {})
      await m.reply(successText(usedPrefix, summary, textChanged))
    } catch (err) {
      await m.reply(`Konfigurasi Goodbye gagal disimpan.\n\n${String(err?.message || err)}`)
    }
    return
  }

  try {
    void conn.sendMessage(m.chat, { react: { text: '⏳', key: m.raw.key } }).catch(() => {})
    const result = await queueGroupEventMedia({
      groupId: m.chat,
      action: 'goodbye',
      source: mediaSource,
      patch,
    })

    if (result?.stale) return

    if (!result?.success) {
      void conn.sendMessage(m.chat, { react: { text: '❌', key: m.raw.key } }).catch(() => {})
      const message = String(result?.error?.message || result?.error || 'Media tidak dapat disimpan.')
      await m.reply(`Media Goodbye ditolak atau gagal diproses.\n\n${message}`)
      return
    }

    void conn.sendMessage(m.chat, { react: { text: '✅', key: m.raw.key } }).catch(() => {})
    if (rawText && isJadibot) setSessionGoodbyeTemplate(conn, m.chat, rawText)
    const summary = getConfigSummary(result.config || {})
    await m.reply(successText(usedPrefix, summary, textChanged))
  } catch (err) {
    void conn.sendMessage(m.chat, { react: { text: '❌', key: m.raw.key } }).catch(() => {})
    await m.reply(`Media Goodbye gagal diproses. Konfigurasi sebelumnya tetap digunakan.\n\n${String(err?.message || err)}`)
  }
}

handler.command = /^setgoodbye$/i
handler.help = ['setgoodbye']
handler.tags = ['group']
handler.category = 'group'
handler.description = 'Mengatur custom Goodbye group dengan text dan media'
handler.groupOnly = true

export default handler
