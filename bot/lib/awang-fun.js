/* By AlzRiss - Usanagi Umi AI */

const TARGET_PROMPT = 'Masukkan nama atau tag orangnya.'

function unwrap(message) {
  let current = message
  for (let i = 0; i < 8; i++) {
    const next =
      current?.ephemeralMessage?.message ||
      current?.viewOnceMessage?.message ||
      current?.viewOnceMessageV2?.message ||
      current?.viewOnceMessageV2Extension?.message ||
      current?.documentWithCaptionMessage?.message
    if (!next || next === current) break
    current = next
  }
  return current || null
}

function normalizeJid(value) {
  const source = String(value || '').trim()
  if (!source || !source.includes('@')) return null
  const [local, domain] = source.split('@', 2)
  const cleanLocal = local.split(':', 1)[0].trim()
  if (!cleanLocal || !domain) return null
  return `${cleanLocal}@${domain}`
}

function contextInfo(message) {
  const current = unwrap(message)
  return (
    current?.extendedTextMessage?.contextInfo ||
    current?.imageMessage?.contextInfo ||
    current?.videoMessage?.contextInfo ||
    current?.documentMessage?.contextInfo ||
    current?.documentWithCaptionMessage?.message?.documentMessage?.contextInfo ||
    current?.audioMessage?.contextInfo ||
    null
  )
}

function getMentions(info) {
  if (!Array.isArray(info?.mentionedJid)) return []
  return info.mentionedJid.map(normalizeJid).filter(Boolean)
}

function cleanName(value) {
  return String(value || '')
    .replace(/@[\d\w._:-]+/g, ' ')
    .replace(/[\u200e\u200f\u202a-\u202e]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function labelFromJid(jid) {
  const normalized = normalizeJid(jid)
  if (!normalized) return ''
  return `@${normalized.split('@')[0]}`
}

function makeTarget({ jid = null, name = '', source = '' } = {}) {
  const normalizedJid = normalizeJid(jid)
  const clean = cleanName(name)
  const display = normalizedJid ? labelFromJid(normalizedJid) : clean
  if (!display) return null
  return {
    jid: normalizedJid,
    name: clean || display,
    display,
    mention: normalizedJid ? display : null,
    mentions: normalizedJid ? [normalizedJid] : [],
    source,
  }
}

export function resolveFunTarget(m) {
  const current = unwrap(m?.currentMessage || m?.raw?.message)
  const currentContext = contextInfo(current)
  const currentMentions = getMentions(currentContext)
  const directText = cleanName(m?.text)

  if (currentMentions.length) {
    return makeTarget({ jid: currentMentions[0], source: 'mention' })
  }

  if (directText) {
    return makeTarget({ name: directText, source: 'text' })
  }

  const quotedMessage = unwrap(currentContext?.quotedMessage)
  const quotedContext = contextInfo(quotedMessage)
  const quotedMentions = getMentions(quotedContext)
  if (quotedMentions.length) {
    return makeTarget({ jid: quotedMentions[0], source: 'reply-mention' })
  }

  const participant = normalizeJid(currentContext?.participant || m?.quotedMessage?.key?.participant)
  if (participant) {
    return makeTarget({ jid: participant, source: 'reply-author' })
  }

  if (currentContext?.quotedMessage && !m?.isGroup) {
    const privateTarget = normalizeJid(m?.chat)
    if (privateTarget && privateTarget !== normalizeJid(m?.sender)) {
      return makeTarget({ jid: privateTarget, source: 'private-reply' })
    }
  }

  return null
}

function normalizeLookup(value) {
  return cleanName(value)
    .replace(/^@/, '')
    .toLowerCase()
}

export async function resolveGroupFunTarget(m, conn) {
  const target = resolveFunTarget(m)
  if (!target || target.jid || !m?.isGroup || typeof conn?.groupMetadata !== 'function') return target

  const query = normalizeLookup(target.name)
  if (!query) return target

  try {
    const metadata = await conn.groupMetadata(m.chat)
    const participants = Array.isArray(metadata?.participants) ? metadata.participants : []
    const matches = participants.filter((participant) => {
      const values = [
        participant?.notify,
        participant?.name,
        participant?.verifiedName,
        participant?.pushName,
        participant?.displayName,
        participant?.lid,
        participant?.jid,
        participant?.id,
      ]
      return values.some((value) => normalizeLookup(value) === query)
    })

    if (matches.length === 1) {
      const jid = normalizeJid([matches[0]?.id, matches[0]?.jid, matches[0]?.lid, matches[0]?.pn, matches[0]?.phoneNumber].find((value) => String(value || '').includes('@')))
      if (jid) return makeTarget({ jid, name: target.name, source: 'group-name' })
    }
  } catch {
  }

  return target
}

export async function requireFunTarget(m, conn = null, options = {}) {
  const target = options?.groupLookup ? await resolveGroupFunTarget(m, conn) : resolveFunTarget(m)
  if (!target) {
    await m.reply(TARGET_PROMPT)
    return null
  }
  return target
}

export { TARGET_PROMPT }
