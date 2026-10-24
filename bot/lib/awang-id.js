
function cleanInput(value) {
  return String(value || '').trim()
}

export function parseNewsletterInput(value) {
  const input = cleanInput(value)
  if (!input) return null

  if (/@newsletter$/i.test(input)) {
    return { type: 'jid', value: input.replace(/^https?:\/\//i, '') }
  }

  const urlMatch = input.match(/(?:https?:\/\/)?(?:www\.)?whatsapp\.com\/channel\/([A-Za-z0-9_-]+)/i)
  if (urlMatch?.[1]) return { type: 'invite', value: urlMatch[1] }

  if (/^[A-Za-z0-9_-]{8,}$/.test(input)) {
    return { type: 'invite', value: input }
  }

  return null
}

export function parseGroupInput(value) {
  const input = cleanInput(value)
  if (!input) return null

  if (/@g\.us$/i.test(input)) {
    return { type: 'jid', value: input.replace(/^https?:\/\//i, '') }
  }

  const urlMatch = input.match(/(?:https?:\/\/)?chat\.whatsapp\.com\/([A-Za-z0-9_-]+)/i)
  if (urlMatch?.[1]) return { type: 'invite', value: urlMatch[1] }

  if (/^https?:\/\//i.test(input)) return null

  if (/^[A-Za-z0-9_-]{8,}$/.test(input)) {
    return { type: 'invite', value: input }
  }

  return null
}

export function normalizeNewsletterMetadata(metadata, fallbackJid = '') {
  const root = metadata && typeof metadata === 'object' ? metadata : {}
  const thread = root?.thread_metadata && typeof root.thread_metadata === 'object' ? root.thread_metadata : root
  const nameValue = thread?.name
  const descriptionValue = thread?.description
  const pictureValue = thread?.picture
  const previewValue = thread?.preview
  const id = String(root?.id || fallbackJid || '').trim()
  const name = String(
    typeof nameValue === 'object' && nameValue !== null ? nameValue.text || '' : nameValue || ''
  ).trim() || 'Tanpa nama'
  const description = String(
    typeof descriptionValue === 'object' && descriptionValue !== null ? descriptionValue.text || '' : descriptionValue || ''
  ).trim()
  const invite = String(thread?.invite || '').trim()
  const subscribersRaw = thread?.subscribers_count ?? thread?.subscribers
  const subscribers = Number(subscribersRaw)
  const owner = String(root?.owner || thread?.owner || '').trim()
  const verificationRaw = String(thread?.verification || root?.verification || '').trim().toUpperCase()
  const creationRaw = thread?.creation_time ?? root?.creation_time
  const creationTime = Number(creationRaw)
  const pictureUrl = String(pictureValue?.url || '').trim()
  const pictureDirectPath = String(pictureValue?.direct_path || pictureValue?.directPath || '').trim()
  const previewUrl = String(previewValue?.url || '').trim()
  const previewDirectPath = String(previewValue?.direct_path || previewValue?.directPath || '').trim()

  return {
    id,
    name,
    description,
    invite,
    subscribers: Number.isFinite(subscribers) && subscribers >= 0 ? subscribers : null,
    owner,
    verification: verificationRaw === 'VERIFIED' ? 'TERVERIFIKASI' : verificationRaw === 'UNVERIFIED' ? 'BELUM TERVERIFIKASI' : 'TIDAK DIKETAHUI',
    creationTime: Number.isFinite(creationTime) && creationTime > 0 ? creationTime : null,
    pictureUrl,
    pictureDirectPath,
    hasPicture: Boolean(pictureValue && (pictureUrl || pictureDirectPath)),
    previewUrl,
    previewDirectPath,
  }
}

export function normalizeGroupMetadata(metadata, fallbackJid = '') {
  const id = String(metadata?.id || fallbackJid || '').trim()
  const subject = String(metadata?.subject || metadata?.name || 'Tanpa nama').trim()
  const description = String(metadata?.desc || metadata?.description || '').trim()
  const owner = String(metadata?.owner || '').trim()
  const participants = Array.isArray(metadata?.participants) ? metadata.participants : []
  const creation = Number(metadata?.creation)

  return {
    id,
    subject,
    description,
    owner,
    memberCount: participants.length,
    creation: Number.isFinite(creation) && creation > 0 ? creation : null,
  }
}

export async function fetchImageBuffer(url, timeoutMs = 10000) {
  if (!url || !/^https?:\/\//i.test(url)) return null

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: { accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8' },
    })
    if (!response.ok) return null
    const contentType = String(response.headers.get('content-type') || '').toLowerCase()
    if (contentType && !contentType.startsWith('image/')) return null
    return Buffer.from(await response.arrayBuffer())
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    Promise.resolve(promise),
    new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ])
}

function directPathToUrl(directPath) {
  const value = String(directPath || '').trim()
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('/')) return `https://mmg.whatsapp.net${value}`
  return `https://mmg.whatsapp.net/${value}`
}

export async function resolveProfileImage(conn, jid, preferredUrl = '', preferredDirectPath = '', previewUrl = '', previewDirectPath = '') {
  const candidates = [
    preferredUrl,
    directPathToUrl(preferredDirectPath),
    previewUrl,
    directPathToUrl(previewDirectPath),
  ].filter(Boolean)

  const tasks = candidates.map((url) => (async () => {
    const buffer = await fetchImageBuffer(url, 3200)
    if (!buffer?.length) throw new Error('image-unavailable')
    return buffer
  })())

  if (typeof conn?.profilePictureUrl === 'function' && jid) {
    tasks.unshift((async () => {
      const url = await withTimeout(conn.profilePictureUrl(jid, 'image', 2000), 2300)
      if (!url) throw new Error('profile-unavailable')
      const buffer = await fetchImageBuffer(url, 3200)
      if (!buffer?.length) throw new Error('profile-image-unavailable')
      return buffer
    })())
  }

  if (!tasks.length) return null

  try {
    return await Promise.any(tasks)
  } catch {
    return null
  }
}

export function extractQuotedText(message) {
  const candidates = [
    message?.quotedMessage,
    message?.quoted,
    message?.contextInfo?.quotedMessage,
    message?.extendedTextMessage?.contextInfo?.quotedMessage,
  ]

  for (const candidate of candidates) {
    const text = extractMessageText(candidate)
    if (text) return text
    const nestedText = extractMessageText(candidate?.message)
    if (nestedText) return nestedText
  }

  return ''
}

function extractMessageText(message) {
  if (!message || typeof message !== 'object') return ''

  const direct = [
    message.conversation,
    message.extendedTextMessage?.text,
    message.imageMessage?.caption,
    message.videoMessage?.caption,
    message.documentMessage?.caption,
  ]

  for (const value of direct) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }

  return ''
}

export function makeNewsletterLink(metadata, originalInput = '') {
  const directInput = cleanInput(originalInput)
  const inputMatch = directInput.match(/(?:https?:\/\/)?(?:www\.)?whatsapp\.com\/channel\/([A-Za-z0-9_-]+)/i)
  if (inputMatch?.[1]) return `https://whatsapp.com/channel/${inputMatch[1]}`
  if (metadata?.invite) return `https://whatsapp.com/channel/${metadata.invite}`
  return ''
}

export function makeGroupLink(inviteCode) {
  const code = cleanInput(inviteCode)
  return code ? `https://chat.whatsapp.com/${code}` : ''
}

export function formatDateId(timestamp, timezone = 'Asia/Jakarta') {
  if (!Number.isFinite(Number(timestamp))) return 'Tidak tersedia'
  try {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: timezone,
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(Number(timestamp) * 1000))
  } catch {
    return 'Tidak tersedia'
  }
}

export function formatNumber(value) {
  if (!Number.isFinite(Number(value))) return 'Tidak tersedia'
  return new Intl.NumberFormat('id-ID').format(Number(value))
}
