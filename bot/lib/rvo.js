
const VIEW_ONCE_KEYS = [
  'viewOnceMessage',
  'viewOnceMessageV2',
  'viewOnceMessageV2Extension',
]

export function hasViewOnce(message, depth = 0) {
  if (!message || typeof message !== 'object' || depth > 10) return false
  if (VIEW_ONCE_KEYS.some((key) => message[key]?.message)) return true
  if (message.imageMessage?.viewOnce === true) return true
  if (message.videoMessage?.viewOnce === true) return true
  if (message.audioMessage?.viewOnce === true) return true

  const nested =
    message.ephemeralMessage?.message ||
    message.documentWithCaptionMessage?.message
  return nested ? hasViewOnce(nested, depth + 1) : false
}

export function unwrapRvoMessage(message) {
  let current = message
  for (let index = 0; index < 12; index++) {
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

export function getRvoMediaInfo(message) {
  const content = unwrapRvoMessage(message)

  if (content.imageMessage) {
    return {
      type: 'image',
      message: content.imageMessage,
      mimetype: content.imageMessage.mimetype || 'image/jpeg',
      caption: content.imageMessage.caption || '',
    }
  }
  if (content.videoMessage) {
    return {
      type: 'video',
      message: content.videoMessage,
      mimetype: content.videoMessage.mimetype || 'video/mp4',
      caption: content.videoMessage.caption || '',
    }
  }
  if (content.audioMessage) {
    return {
      type: 'audio',
      message: content.audioMessage,
      mimetype: content.audioMessage.mimetype || 'audio/mpeg',
      ptt: Boolean(content.audioMessage.ptt),
    }
  }
  if (content.documentMessage) {
    return {
      type: 'document',
      message: content.documentMessage,
      mimetype: content.documentMessage.mimetype || 'application/octet-stream',
      fileName: content.documentMessage.fileName || 'rvo-file',
      caption: content.documentMessage.caption || '',
    }
  }
  return null
}

export default { hasViewOnce, unwrapRvoMessage, getRvoMediaInfo }
