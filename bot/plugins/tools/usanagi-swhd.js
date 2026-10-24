
import pino from 'pino'
import { downloadMediaMessage } from '@rexxhayanasi/elaina-baileys'
import { settings } from '../../config/settings.js'

const logger = pino({ level: 'silent' })
const BRAND = settings.swhd?.brand || 'USANAGI SW HD V8'
const PRESERVE_VIDEO_MIME = false

const isVideoMime = (mime) => String(mime || '').toLowerCase().startsWith('video/')
const hasContent = (node) => !!node && typeof node === 'object' && Object.keys(node).length > 0

function classify(type, node) {
  if (!hasContent(node)) return null
  if (type === 'videoMessage') return 'video'
  if (type === 'documentMessage') return isVideoMime(node.mimetype) ? 'video' : 'document'
  return null
}

function unwrap(message) {
  let current = message

  for (let i = 0; i < 6; i++) {
    const next =
      current?.ephemeralMessage?.message ||
      current?.viewOnceMessage?.message ||
      current?.viewOnceMessageV2?.message ||
      current?.viewOnceMessageV2Extension?.message ||
      current?.documentWithCaptionMessage?.message

    if (!next || next === current) break
    current = next
  }

  return current || {}
}

function pickFrom(container, key) {
  if (!container) return null

  const inner = unwrap(container)

  for (const type of ['videoMessage', 'documentMessage']) {
    const node = inner[type]
    if (!node) continue

    const kind = classify(type, node)
    if (kind) return { kind, type, node, key }
  }

  return null
}

function pickMedia(m) {
  return (
    pickFrom(m.currentMessage, m.raw?.key) ||
    pickFrom(m.quotedMessage?.message, m.quotedMessage?.key) ||
    null
  )
}

function mp4Duration(buffer) {
  const idx = buffer.indexOf('mvhd')
  if (idx === -1) return 0

  try {
    const version = buffer[idx + 4]
    const timescale = version === 1
      ? buffer.readUInt32BE(idx + 24)
      : buffer.readUInt32BE(idx + 16)

    const duration = version === 1
      ? Number(buffer.readBigUInt64BE(idx + 28))
      : buffer.readUInt32BE(idx + 20)

    return timescale > 0 && duration > 0 ? Math.round(duration / timescale) : 0
  } catch {
    return 0
  }
}

function webmDuration(buffer) {
  if (buffer.length < 4 || buffer.readUInt32BE(0) !== 0x1a45dfa3) return 0

  try {
    const idx = buffer.indexOf(Buffer.from([0x44, 0x89]))
    if (idx === -1) return 0

    const size = buffer[idx + 2]
    if (size === 4) return Math.round(buffer.readFloatBE(idx + 3))
    if (size === 8) return Math.round(buffer.readDoubleBE(idx + 3))

    return 0
  } catch {
    return 0
  }
}

function mediaDuration(buffer) {
  const mp4 = mp4Duration(buffer)
  return mp4 > 0 ? mp4 : webmDuration(buffer)
}

function formatBytes(value) {
  if (!Number.isFinite(value) || value <= 0) return '0 B'
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(2)} MB`
  if (value >= 1024) return `${(value / 1024).toFixed(2)} KB`
  return `${value} B`
}

const buildCaption = ({ sender, size, seconds }) => [
  `┏━〔 *${BRAND}* 〕`,
  '┃',
  '┃ ✓ Media berhasil diproses',
  '┃',
  `┃ Pengirim : @${sender}`,
  `┃ Ukuran   : ${size}`,
  `┃ Durasi   : ${seconds > 0 ? `${seconds} Detik` : '-'}`,
  '┃',
  '┣━〔 *INFORMASI* 〕',
  '┃ • Tanpa encode ulang',
  '┃ • Kualitas media tetap',
  '┃ • Siap diteruskan ke Status WA',
  '┃',
  '┗━〔 *USANAGI • SW HD* 〕'
].join('\n')

const buildDocCaption = ({ sender, size, fileName }) => [
  `┏━〔 *${BRAND}* 〕`,
  '┃',
  '┃ ✓ File berhasil diproses',
  '┃',
  `┃ Pengirim : @${sender}`,
  `┃ Ukuran   : ${size}`,
  `┃ File     : ${fileName}`,
  '┃',
  '┣━〔 *INFORMASI* 〕',
  '┃ • File dikirim tanpa kompresi',
  '┃ • Format asli tetap dipertahankan',
  '┃ • Dapat digunakan kembali sesuai kebutuhan',
  '┃',
  '┗━〔 *USANAGI • SW HD* 〕'
].join('\n')

const GUIDE = [
  '┏━〔 *USANAGI • SW HD* 〕',
  '┃',
  '┃ Kirim ulang media tanpa encode ulang.',
  '┃',
  '┃ *Cara penggunaan:*',
  '┃ • Reply video/dokumen → *.swhd*',
  '┃ • Kirim media dengan caption *.swhd*',
  '┃',
  '┃ *Support:*',
  '┃ • Video: mp4, mov, mkv, webm, 3gp, avi',
  '┃ • Dokumen: pdf, zip, apk, docx, dan lainnya',
  '┃',
  '┃ Kualitas media dipertahankan',
  '┃ selama format asli didukung WhatsApp.',
  '┃',
  '┗━━━━━━━━━━━━━━'
].join('\n')

const handler = async (m, { conn, rawConn }) => {
  const src = pickMedia(m)

  if (!src) {
    await conn.sendMessage(
      m.chat,
      { text: GUIDE },
      { quoted: m.raw }
    )
    return
  }

  try {
    const buffer = await downloadMediaMessage(
      { key: src.key, message: { [src.type]: src.node } },
      'buffer',
      {},
      {
        logger,
        reuploadRequest: rawConn?.updateMediaMessage
      }
    )

    if (!buffer?.length) {
      throw new Error('Media gagal diunduh, silakan kirim ulang.')
    }

    const sender = String(m.sender || '').split('@')[0]
    const size = formatBytes(buffer.length)

    if (src.kind === 'video') {
      const originalMime = String(src.node.mimetype || '')
      const mimetype = PRESERVE_VIDEO_MIME && isVideoMime(originalMime)
        ? originalMime
        : 'video/mp4'

      const caption = buildCaption({
        sender,
        size,
        seconds: Number(src.node.seconds) || mediaDuration(buffer)
      })

      await conn.sendMessage(
        m.chat,
        {
          video: buffer,
          mimetype,
          caption,
          mentions: [m.sender],
          jpegThumbnail: src.node.jpegThumbnail || undefined
        },
        { quoted: m.raw }
      )

      return
    }

    const fileName = src.node.fileName || `file-${Date.now()}`
    const caption = buildDocCaption({
      sender,
      size,
      fileName
    })

    await conn.sendMessage(
      m.chat,
      {
        document: buffer,
        mimetype: src.node.mimetype || 'application/octet-stream',
        fileName,
        caption,
        mentions: [m.sender],
        jpegThumbnail: src.node.jpegThumbnail || undefined
      },
      { quoted: m.raw }
    )
  } catch (err) {
    const errorText = String(err?.message || err || 'Terjadi kesalahan.')

    await conn.sendMessage(
      m.chat,
      {
        text: [
          '┏━〔 *USANAGI • SW HD* 〕',
          '┃',
          '┃ ✕ Media gagal diproses.',
          '┃',
          `┃ ${errorText}`,
          '┃',
          '┃ Silakan coba kirim ulang media',
          '┃ atau gunakan file yang berbeda.',
          '┃',
          '┗━━━━━━━━━━━━━━'
        ].join('\n')
      },
      { quoted: m.raw }
    )
  }
}

handler.command = /^swhd$/i
handler.help = ['swhd', 'sw']
handler.description = 'Kirim ulang video/dokumen tanpa kompres — kualitas tetap HD'
handler.limit = false
handler.free = true

export {
  buildCaption,
  buildDocCaption,
  mp4Duration,
  webmDuration,
  mediaDuration,
  pickMedia
}

export default handler