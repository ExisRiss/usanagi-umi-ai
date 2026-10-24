
import { normalizeNumber, resolvePhoneNumber } from './awang-cekakses.js'

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function candidateJids(participant) {
  if (!participant || typeof participant !== 'object') return []
  return [participant.id, participant.jid, participant.lid, participant.pn, participant.phoneNumber]
    .map(text)
    .filter(Boolean)
}

function normalizeJid(value) {
  const candidate = text(value).toLowerCase()
  if (!candidate) return ''
  const [local, domain = ''] = candidate.split('@', 2)
  if (!local) return ''
  const cleanLocal = local.split(':', 1)[0]
  return domain ? `${cleanLocal}@${domain}` : cleanLocal
}

function phoneNumberFromJid(value) {
  const jid = normalizeJid(value)
  if (!jid || jid.endsWith('@lid') || jid.endsWith('@g.us') || jid.endsWith('@newsletter')) return ''
  const number = normalizeNumber(jid)
  return number.length >= 7 && number.length <= 15 ? number : ''
}

export function sameParticipant(a, b) {
  const left = normalizeJid(a)
  const right = normalizeJid(b)
  if (!left || !right) return false
  if (left === right) return true

  const leftNumber = phoneNumberFromJid(left)
  const rightNumber = phoneNumberFromJid(right)
  return Boolean(leftNumber && rightNumber && leftNumber === rightNumber)
}

export function findParticipant(metadata, jid) {
  const participants = Array.isArray(metadata?.participants) ? metadata.participants : []
  if (!jid) return null
  return participants.find((participant) =>
    candidateJids(participant).some((candidate) => sameParticipant(candidate, jid))
  ) || null
}

export function participantIsAdmin(participant) {
  return Boolean(
    participant?.admin === 'admin' ||
    participant?.admin === 'superadmin' ||
    participant?.isAdmin ||
    participant?.isSuperAdmin
  )
}

export async function getGroupParticipant(conn, groupId, jid, metadata = null) {
  if (!groupId?.endsWith('@g.us') || !jid) return null
  if (typeof conn?.groupMetadata !== 'function' && !metadata) return null

  const data = metadata || await conn.groupMetadata(groupId)
  const direct = findParticipant(data, jid)
  if (direct) return direct

  let resolved = ''
  try {
    resolved = await resolvePhoneNumber(jid, conn)
  } catch {
  }

  if (!resolved) return null

  const resolvedJid = `${resolved}@s.whatsapp.net`
  const resolvedDirect = findParticipant(data, resolvedJid)
  if (resolvedDirect) return resolvedDirect

  const participants = Array.isArray(data?.participants) ? data.participants : []
  for (const participant of participants) {
    for (const candidate of candidateJids(participant)) {
      if (!normalizeJid(candidate).endsWith('@lid')) continue
      try {
        const candidateNumber = await resolvePhoneNumber(candidate, conn)
        if (candidateNumber && candidateNumber === resolved) return participant
      } catch {
      }
    }
  }

  return null
}

export async function isGroupAdmin(conn, groupId, jid, metadata = null) {
  try {
    const participant = await getGroupParticipant(conn, groupId, jid, metadata)
    return participantIsAdmin(participant)
  } catch {
    return false
  }
}

export async function getBotParticipant(conn, groupId, metadata = null) {
  const botJid = text(conn?.user?.id)
  if (!botJid) return null
  return getGroupParticipant(conn, groupId, botJid, metadata)
}

export async function isBotAdmin(conn, groupId, metadata = null) {
  try {
    const participant = await getBotParticipant(conn, groupId, metadata)
    return participantIsAdmin(participant)
  } catch {
    return false
  }
}

export function getParticipantJid(participant, fallback = '') {
  const candidates = candidateJids(participant)
  return candidates.find((value) => value.includes('@s.whatsapp.net')) || candidates[0] || text(fallback)
}

export default { sameParticipant, findParticipant, participantIsAdmin, getGroupParticipant, isGroupAdmin, getBotParticipant, isBotAdmin, getParticipantJid }
