
import { downloadContentFromMessage } from '@rexxhayanasi/elaina-baileys'

const TYPE_MAP = new Map([
  ['imageMessage', 'image'],
  ['videoMessage', 'video'],
  ['audioMessage', 'audio'],
  ['stickerMessage', 'sticker'],
  ['documentMessage', 'document'],
  ['documentWithCaptionMessage', 'document'],
])

export function unwrapMessage(message) {
  let current = message || null
  while (current) {
    if (current.ephemeralMessage?.message) {
      current = current.ephemeralMessage.message
      continue
    }
    if (current.viewOnceMessage?.message) {
      current = current.viewOnceMessage.message
      continue
    }
    if (current.viewOnceMessageV2?.message) {
      current = current.viewOnceMessageV2.message
      continue
    }
    if (current.viewOnceMessageV2Extension?.message) {
      current = current.viewOnceMessageV2Extension.message
      continue
    }
    if (current.documentWithCaptionMessage?.message) {
      current = current.documentWithCaptionMessage.message
      continue
    }
    break
  }
  return current
}

function locateMedia(message) {
  const unwrapped = unwrapMessage(message)
  if (!unwrapped) return null
  for (const [key, type] of TYPE_MAP) {
    if (unwrapped[key]) {
      return {
        key,
        type,
        message: unwrapped[key],
      }
    }
  }
  return null
}

export function getMediaSource(m, allowedTypes = []) {
  const allowed = new Set(allowedTypes)
  const direct = locateMedia(m.currentMessage)
  if (direct && (!allowed.size || allowed.has(direct.type))) {
    return {
      ...direct,
      quoted: false,
      key: m.raw?.key || null,
    }
  }

  const quotedMessage = m.quotedMessage?.message
  const quoted = locateMedia(quotedMessage)
  if (quoted && (!allowed.size || allowed.has(quoted.type))) {
    return {
      ...quoted,
      quoted: true,
      key: m.quotedMessage?.key || null,
    }
  }

  return null
}

export async function downloadMediaBuffer(source) {
  if (!source?.message || !source.type) throw new Error('Media source tidak tersedia')
  const stream = await downloadContentFromMessage(source.message, source.type)
  const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  const buffer = Buffer.concat(chunks)
  if (!buffer.length) throw new Error('Media kosong')
  return buffer
}

export function getMimeType(source, fallback = 'application/octet-stream') {
  return source?.message?.mimetype || fallback
}

export function getFileName(source, fallback = 'media') {
  return source?.message?.fileName || fallback
}

export function getExtensionFromMime(mime = '') {
  const type = mime.toLowerCase().split(';')[0].trim()
  const map = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'audio/mpeg': 'mp3',
    'audio/ogg': 'ogg',
    'audio/opus': 'opus',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'application/pdf': 'pdf',
  }
  return map[type] || type.split('/')[1] || 'bin'
}

export function normalizeImageMime(mime = '') {
  const type = mime.toLowerCase().split(';')[0].trim()
  if (type === 'image/png') return 'image/png'
  if (type === 'image/webp') return 'image/webp'
  if (type === 'image/gif') return 'image/gif'
  return 'image/jpeg'
}

export async function react(conn, m, emoji) {
  if (!conn?.sendMessage || !m?.key) return
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } })
  } catch {}
}
