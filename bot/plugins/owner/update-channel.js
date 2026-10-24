/* Main-bot owner announcement command for the configured WhatsApp Channel. */

const TIMEZONE = 'Asia/Makassar'
const divider = '├──────────────────────┤'
const MAX_MEDIA_CAPTION_LENGTH = 1024

function clean(value, max) {
  return String(value ?? '').replace(/\u0000/g, '').trim().slice(0, max)
}

function dateParts(date = new Date()) {
  const dateText = new Intl.DateTimeFormat('id-ID', {
    timeZone: TIMEZONE,
    day: '2-digit', month: 'long', year: 'numeric',
  }).format(date)
  const timeText = new Intl.DateTimeFormat('id-ID', {
    timeZone: TIMEZONE,
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(date)
  const dayText = new Intl.DateTimeFormat('id-ID', { timeZone: TIMEZONE, weekday: 'long' }).format(date)
  return { dateText, timeText, dayText }
}

function usage(prefix) {
  return [
    'Format update belum lengkap.',
    '',
    `Contoh: ${prefix}update Perbaikan Sistem | Menu dan media telah diperbarui.`,
    `Opsional pengirim: ${prefix}update Perbaikan Sistem | Menu dan media telah diperbarui. | AlzRiss`,
    '',
    `Media opsional: balas foto atau video, lalu kirim ${prefix}update dengan format yang sama.`,
  ].join('\n')
}

function quotedMediaType(message) {
  const quoted = message?.quoted
  const mime = String(quoted?.mimetype || quoted?.msg?.mimetype || quoted?.mediaType || '').toLowerCase()
  if (/^image\//.test(mime)) return { kind: 'image', mime, quoted }
  if (/^video\//.test(mime)) return { kind: 'video', mime, quoted }
  return { kind: '', mime, quoted }
}

const handler = async (m, { conn, text, usedPrefix }) => {
  // This command must never publish using a Jadibot connection/channel.
  if (conn?.isJadibot || conn?.botConfig?.type === 'jadibot') {
    return m.reply('Command update hanya tersedia di bot utama.')
  }

  const [rawInfo = '', rawMessage = '', rawSender = ''] = String(text || '').split('|').map(value => value.trim())
  const info = clean(rawInfo, 1500)
  const message = clean(rawMessage, 3000)
  const sender = clean(rawSender, 80) || clean(m.pushName, 80) || clean(global.ownerName, 80) || 'Owner'
  if (!info || !message) return m.reply(usage(usedPrefix || '.'))

  const channelId = clean(conn?.botConfig?.values?.links?.channelId || global.links?.channelId, 120)
  if (!channelId || !channelId.endsWith('@newsletter')) {
    return m.reply('ID saluran WhatsApp utama belum dikonfigurasi.')
  }

  const { dateText, timeText, dayText } = dateParts()
  const updateText = [
    '┌─ INFORMATION UPDATE ─┐',
    '│',
    `│ 📢 ${info}`,
    '│',
    divider,
    `│ 📅 Tanggal : ${dateText}`,
    `│ 🕒 Jam     : ${timeText} WITA`,
    `│ 📆 Hari    : ${dayText}`,
    '│',
    divider,
    '│ 💬 Pesan :',
    '│',
    `│ ${message}`,
    '│',
    divider,
    `│ 👤 Pengirim : ${sender}`,
    '└──────────────────────┘',
  ].join('\n')

  const media = quotedMediaType(m)
  if (media.mime && !media.kind) {
    return m.reply('Media reply untuk update hanya mendukung foto atau video.')
  }

  await m.react?.('⏳').catch(() => {})
  if (media.kind) {
    if (typeof media.quoted?.download !== 'function') return m.reply('Media reply tidak dapat diunduh. Coba kirim ulang foto atau videonya.')
    let buffer
    try {
      buffer = await media.quoted.download()
    } catch {
      return m.reply('Gagal mengunduh media reply. Coba kirim ulang foto atau videonya.')
    }
    if (!buffer?.length || buffer.length > 64 * 1024 * 1024) return m.reply('Media reply kosong atau terlalu besar (maksimal 64 MB).')
    // WhatsApp media captions are shorter than a normal text message. Keep
    // the full information update intact by following long media captions with
    // the complete text post in the same configured channel.
    const caption = updateText.length <= MAX_MEDIA_CAPTION_LENGTH
      ? updateText
      : `📢 ${clean(info, 700)}\n\nDetail update dikirim setelah media.`
    const payload = media.kind === 'image'
      ? { image: buffer, caption, mimetype: media.mime }
      : { video: buffer, caption, mimetype: media.mime }
    await conn.sendMessage(channelId, payload)
    if (caption !== updateText) await conn.sendMessage(channelId, { text: updateText })
  } else {
    await conn.sendMessage(channelId, { text: updateText })
  }
  await m.react?.('✅').catch(() => {})
  return m.reply(media.kind ? `Update ${media.kind === 'image' ? 'foto' : 'video'} berhasil dikirim ke saluran utama.` : 'Update berhasil dikirim ke saluran utama.')
}

handler.help = ['update <info> | <pesan> [| pengirim] (balas foto/video opsional)']
handler.tags = ['owner']
handler.command = /^update$/i
// Obey the main bot's active per-chat prefix. The current main default is `/`,
// while an owner who changes the prefix can still use the same command.
handler.rowner = true
handler.description = 'Kirim informasi update dari bot utama ke saluran WhatsApp'

export default handler
