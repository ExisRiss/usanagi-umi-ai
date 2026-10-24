/* By AlzRiss - Usanagi Umi AI */

import { settings } from '../config/settings.js'
import { getDynamicOwners } from '../core/awang-ownerdb.js'

// LID resolution may require a WhatsApp query. Keep it bounded and briefly
// coalesce repeated lookups so one slow group metadata request cannot stall a
// Jadibot command queue.
const LID_RESOLVE_TIMEOUT_MS = 2200
const LID_CACHE_TTL_MS = 15000
const lidResolutionCache = new WeakMap()

function timed(value, timeoutMs) {
  let timer
  return Promise.race([
    Promise.resolve(value),
    new Promise(resolve => { timer = setTimeout(() => resolve(''), timeoutMs) }),
  ]).finally(() => clearTimeout(timer))
}

function lidCache(conn) {
  if (!conn || (typeof conn !== 'object' && typeof conn !== 'function')) return null
  let cache = lidResolutionCache.get(conn)
  if (!cache) {
    cache = new Map()
    lidResolutionCache.set(conn, cache)
  }
  return cache
}

export function normalizeNumber(jidOrNumber = '') {
  const withoutDomain = String(jidOrNumber).split('@')[0]
  const withoutDevice = withoutDomain.split(':')[0]
  return withoutDevice.replace(/\D/g, '')
}

export async function resolvePhoneNumber(senderJid, conn) {
  const value = String(senderJid || '').trim()
  if (!value) return ''
  if (!value.endsWith('@lid') || !conn?.signalRepository?.lidMapping) {
    return value.endsWith('@lid') ? '' : normalizeNumber(value)
  }

  try {
    const resolvedPn = await conn.signalRepository.lidMapping.getPNForLID(value)
    if (resolvedPn && !String(resolvedPn).endsWith('@lid')) {
      const number = normalizeNumber(resolvedPn)
      if (number.length >= 7 && number.length <= 15) return number
    }
  } catch {

  }

  return ''
}

function participantCandidates(participant) {
  if (!participant || typeof participant !== 'object') return []
  return [
    participant.id,
    participant.jid,
    participant.pn,
    participant.phoneNumber,
    participant.phone,
    participant.lid,
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
}

function participantPhoneNumber(participant) {
  const candidates = participantCandidates(participant)
  const preferred = candidates.filter((value) => !value.endsWith('@lid'))
  for (const candidate of preferred) {
    const number = normalizeNumber(candidate)
    if (number.length >= 7 && number.length <= 15) return number
  }
  return ''
}

export async function resolveTargetPhoneNumber(jid, conn, groupId = '') {
  const value = String(jid || '').trim()
  if (!value) return ''

  if (!value.endsWith('@lid')) {
    const number = normalizeNumber(value)
    return number.length >= 7 && number.length <= 15 ? number : ''
  }

  const cache = lidCache(conn)
  const key = `${value}|${String(groupId || '')}`
  const cached = cache?.get(key)
  if (cached?.pending) return cached.pending
  if (cached && cached.expires > Date.now()) return cached.value

  const resolve = async () => {
    const mapped = await resolvePhoneNumber(value, conn)
    if (mapped) return mapped
    if (!groupId?.endsWith('@g.us') || typeof conn?.groupMetadata !== 'function') return ''

    try {
      const metadata = await conn.groupMetadata(groupId)
      const participants = Array.isArray(metadata?.participants) ? metadata.participants : []
      for (const participant of participants) {
        const candidates = participantCandidates(participant)
        if (!candidates.some((candidate) => candidate === value)) continue
        const number = participantPhoneNumber(participant)
        if (number) return number
      }
    } catch {

    }
    return ''
  }

  // Never let a slow LID/metadata request leave a command waiting forever.
  const pending = timed(resolve(), LID_RESOLVE_TIMEOUT_MS).catch(() => '')
  if (cache) cache.set(key, { pending, value: '', expires: 0 })
  const result = await pending
  if (cache) cache.set(key, { value: result, expires: Date.now() + LID_CACHE_TTL_MS })
  return result
}

export function getAllOwnerEntries(conn = null) {
  const botConfig = conn?.botConfig
  const entries = new Map()

  // Jadibot memakai owner per-session. Urutannya dipertahankan: owner yang
  // dipilih user lebih dulu, lalu owner/developer permanen dari config.js.
  if (botConfig?.type === 'jadibot') {
    const locked = normalizeNumber(global.jadibotPlatform?.lockedOwnerNumber || '')
    const configured = Array.isArray(botConfig.ownerNumbers) ? botConfig.ownerNumbers : []
    for (const owner of [...configured, locked]) {
      const number = normalizeNumber(owner)
      if (!number || entries.has(number)) continue
      entries.set(number, {
        number,
        name: number === locked ? String(settings.ownerName || 'Developer').trim() || 'Developer' : 'Owner Bot',
        primary: true,
        locked: number === locked,
      })
    }
    return [...entries.values()]
  }

  // Bot utama: nomor owner dari setting web (kalau diisi) menang atas config.js.
  const configuredMain = Array.isArray(botConfig?.ownerNumbers) ? botConfig.ownerNumbers.filter(Boolean) : []
  const primary = configuredMain.length
    ? configuredMain
    : (Array.isArray(settings.ownerNumbers) ? settings.ownerNumbers : [])
  const dynamic = getDynamicOwners()
  for (const owner of primary) {
    const number = normalizeNumber(owner)
    if (number) entries.set(number, { number, name: String(settings.ownerName || 'Owner').trim() || 'Owner', primary: true, locked: true })
  }

  for (const owner of dynamic) {
    const number = normalizeNumber(owner.number)
    if (!number) continue
    entries.set(number, {
      number,
      name: String(owner.name || 'Owner').trim() || 'Owner',
      primary: false,
      locked: false,
    })
  }

  return [...entries.values()]
}

export function getAllOwnerNumbers(conn = null) {
  return getAllOwnerEntries(conn).map((owner) => owner.number)
}

export async function isOwner(senderJid, conn) {
  const senderNumber = await resolvePhoneNumber(senderJid, conn)
  const owners = getAllOwnerNumbers(conn)

  const selfNumber = normalizeNumber(conn?.user?.id || '')
  if (selfNumber && senderNumber && selfNumber === senderNumber) return true

  return owners.includes(senderNumber)
}

export default { isOwner, resolvePhoneNumber, resolveTargetPhoneNumber, normalizeNumber, getAllOwnerNumbers, getAllOwnerEntries }
