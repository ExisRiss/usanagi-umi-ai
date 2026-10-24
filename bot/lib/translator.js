import translate from 'translate'

translate.engine = 'google'

const cache = new Map()
const pending = new Map()

const MAX_CACHE = 2000

const protectedPatterns = [
  /```[\s\S]*?```/g,
  /`[^`\n]+`/g,
  /https?:\/\/[^\s<>"']+/gi,
  /(?:wa\.me\/|chat\.whatsapp\.com\/|t\.me\/)[^\s<>"']+/gi,
  /@[0-9]{5,20}/g
]

function protectText(text) {
  const values = []

  const protectedText = text.replace(
    new RegExp(protectedPatterns.map((r) => r.source).join('|'), 'gi'),
    (value) => {
      const key = `__ALZRISS_PROTECT_${values.length}__`
      values.push(value)
      return key
    }
  )

  return {
    text: protectedText,
    restore(value) {
      return value.replace(/__ALZRISS_PROTECT_(\d+)__/g, (_, index) => values[Number(index)] ?? '')
    }
  }
}

function cleanCache() {
  while (cache.size > MAX_CACHE) {
    const first = cache.keys().next().value
    if (first === undefined) break
    cache.delete(first)
  }
}

export function getChatLanguage(jid) {
  if (global.autoTranslate?.enabled === false) return 'id'

  const configured = global.db?.data?.chats?.[jid]?.language
  const fallback = global.autoTranslate?.defaultLanguage === 'en' ? 'en' : 'id'

  return configured === 'en'
    ? 'en'
    : configured === 'id'
      ? 'id'
      : fallback
}

export function setChatLanguage(jid, language) {
  if (!global.db?.data?.chats?.[jid]) {
    global.db.data.chats[jid] = {}
  }

  const lang = language === 'en' ? 'en' : 'id'
  global.db.data.chats[jid].language = lang
  return lang
}

export async function translateText(text, to = 'en') {
  if (typeof text !== 'string' || !text.trim()) return text
  if (!['id', 'en'].includes(to)) return text

  // Bahasa Indonesia adalah bahasa asli plugin.
  if (to === 'id') return text

  const source = 'id'
  const key = `${source}:${to}:${text}`

  if (cache.has(key)) return cache.get(key)
  if (pending.has(key)) return pending.get(key)

  const job = (async () => {
    try {
      const protectedValue = protectText(text)

      // Kalau setelah perlindungan tidak ada teks yang layak diterjemahkan,
      // langsung kembalikan string aslinya.
      if (!protectedValue.text.trim()) return text

      const result = await translate(protectedValue.text, {
        from: source,
        to
      })

      const output = protectedValue.restore(
        typeof result === 'string' && result.trim() ? result : protectedValue.text
      )

      cache.set(key, output)
      cleanCache()

      return output
    } catch (error) {
      console.error('[ALZRISS TRANSLATOR]', error?.message || error)
      return text
    } finally {
      pending.delete(key)
    }
  })()

  pending.set(key, job)
  return job
}

const TEXT_KEYS = new Set([
  'text',
  'caption',
  'footer',
  'title',
  'description',
  'body',
  'bodyText',
  'contentText',
  'headerText',
  'displayText',
  'buttonText'
])

const ARRAY_OBJECT_KEYS = new Set([
  'buttons',
  'button',
  'sections',
  'rows',
  'list',
  'nativeFlowMessage',
  'interactiveMessage',
  'header',
  'body',
  'footer',
  'contextInfo'
])

const SKIP_KEYS = new Set([
  'id',
  'buttonId',
  'rowId',
  'sectionId',
  'selectedId',
  'stanzaId',
  'participant',
  'remoteJid',
  'jid',
  'url',
  'mediaUrl',
  'thumbnailUrl',
  'fileName',
  'mimetype',
  'type',
  'messageId',
  'serverId'
])

export async function translatePayload(value, to = 'en', seen = new WeakSet()) {
  if (!value || typeof value !== 'object') return value
  if (to === 'id') return value
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) return value
  if (seen.has(value)) return value

  seen.add(value)

  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (value[i] && typeof value[i] === 'object') {
        await translatePayload(value[i], to, seen)
      }
    }
    return value
  }

  for (const [key, current] of Object.entries(value)) {
    if (SKIP_KEYS.has(key)) continue

    if (typeof current === 'string' && TEXT_KEYS.has(key)) {
      value[key] = await translateText(current, to)
      continue
    }

    if (
      current &&
      typeof current === 'object' &&
      (
        ARRAY_OBJECT_KEYS.has(key) ||
        Array.isArray(current)
      )
    ) {
      await translatePayload(current, to, seen)
    }
  }

  return value
}


function clonePayload(value, seen = new WeakMap()) {
  if (!value || typeof value !== 'object') return value
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) return value
  if (seen.has(value)) return seen.get(value)

  if (Array.isArray(value)) {
    const out = []
    seen.set(value, out)
    for (const item of value) out.push(clonePayload(item, seen))
    return out
  }

  const proto = Object.getPrototypeOf(value)
  if (proto !== Object.prototype && proto !== null) return value

  const out = {}
  seen.set(value, out)

  for (const [key, item] of Object.entries(value)) {
    out[key] = clonePayload(item, seen)
  }

  return out
}

export async function translateOutgoing(jid, content) {
  const lang = getChatLanguage(jid)

  if (lang !== 'en') return content
  if (!content || typeof content !== 'object') return content

  const copy = clonePayload(content)
  return translatePayload(copy, lang)
}

export function clearTranslateCache() {
  cache.clear()
  pending.clear()
}
