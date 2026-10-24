
const INSTALLED = Symbol.for('usanagi.autoTyping.installed')
const ORIGINAL = Symbol.for('usanagi.autoTyping.originalSendMessage')

function settings(conn) {
  const value = conn?.botConfig?.values?.autoTyping || global.autoTyping || {}
  return {
    enabled: value.enabled !== false,
    minDelayMs: Math.max(0, Number(value.minDelayMs) || 0),
    maxDelayMs: Math.max(0, Number(value.maxDelayMs) || 80),
    charsPerSecond: Math.max(1, Number(value.charsPerSecond) || 10000),
    includeMedia: value.includeMedia !== false,
    stopPresence: String(value.stopPresence || 'paused')
  }
}

function isChatJid(jid) {
  const value = String(jid || '')
  if (!value || value === 'status@broadcast') return false
  if (value.endsWith('@newsletter') || value.endsWith('@broadcast')) return false
  return value.endsWith('@s.whatsapp.net') || value.endsWith('@g.us') || value.endsWith('@lid')
}

function isSilentPayload(content) {
  if (!content || typeof content !== 'object') return true
  return Boolean(
    content.react ||
    content.delete ||
    content.edit ||
    content.protocolMessage ||
    content.keepInChat ||
    content.pin ||
    content.requestPhoneNumber
  )
}

function payloadLength(content) {
  if (!content || typeof content !== 'object') return 0
  const values = [
    content.text,
    content.caption,
    content.footer,
    content.footerText,
    content.title,
    content.fileName
  ]
  return values.reduce((total, value) => total + (typeof value === 'string' ? value.length : 0), 0)
}

function hasMedia(content) {
  if (!content || typeof content !== 'object') return false
  return ['image', 'video', 'audio', 'document', 'sticker', 'contacts', 'location', 'product'].some(key => key in content)
}

function typingDelay(content, config) {
  const chars = payloadLength(content)
  const estimated = chars > 0 ? (chars / config.charsPerSecond) * 1000 : config.minDelayMs
  const jitter = Math.floor(Math.random() * 220)
  return Math.min(config.maxDelayMs, Math.max(config.minDelayMs, estimated + jitter))
}

function wait(ms) {
  return ms > 0 ? new Promise(resolve => setTimeout(resolve, ms)) : Promise.resolve()
}

export function installAutoTyping(conn) {
  if (!conn || conn[INSTALLED] || typeof conn.sendMessage !== 'function') return conn

  const originalSendMessage = conn.sendMessage.bind(conn)
  const active = new Map()

  Object.defineProperty(conn, INSTALLED, { value: true, configurable: false })
  Object.defineProperty(conn, ORIGINAL, { value: originalSendMessage, configurable: false })

  conn.sendMessage = async function autoTypingSendMessage(jid, content, options = {}) {
    const config = settings(conn)
    const eligible = config.enabled && isChatJid(jid) && !isSilentPayload(content) && (config.includeMedia || !hasMedia(content))

    if (!eligible || typeof conn.sendPresenceUpdate !== 'function') {
      return originalSendMessage(jid, content, options)
    }

    const key = String(jid)
    active.set(key, (active.get(key) || 0) + 1)

    try {
      // Presence tidak boleh menahan pengiriman pesan jika jaringan WhatsApp lambat.
      void conn.sendPresenceUpdate('composing', jid).catch(() => {})
      await wait(typingDelay(content, config))
      return await originalSendMessage(jid, content, options)
    } finally {
      const remaining = Math.max(0, (active.get(key) || 1) - 1)
      if (remaining > 0) active.set(key, remaining)
      else {
        active.delete(key)
        void conn.sendPresenceUpdate(config.stopPresence, jid).catch(() => {})
      }
    }
  }

  return conn
}

export function hasAutoTyping(conn) {
  return Boolean(conn?.[INSTALLED])
}

export default installAutoTyping
