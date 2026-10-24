/* By AlzRiss - Usanagi Umi AI */

import { isWelcomeEnabled, isGoodbyeEnabled } from './awang-welcome.js'
import { normalizeNumber, resolvePhoneNumber } from '../lib/awang-cekakses.js'
import { settings } from '../config/settings.js'
import { getActivePrefix } from './awang-prefix.js'
import { sendInteractive } from '../lib/awang-tombol.js'
import { renderMemberCard } from './awang-welcome-render.js'
import { getUser } from './awang-userdb.js'
import { getGroupWelcomeConfig, getGroupGoodbyeConfig } from './awang-welcome-config.js'
import { isStoredMediaUsable, resolveStoredMediaPath } from './awang-welcome-media.js'

const memberNameCache = new Map()
const memberJidCache = new Map()
const contactNameCache = new Map()

function asString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeParticipantKey(value) {
  const text = asString(value).toLowerCase()
  if (!text) return ''
  const [local, domain] = text.split('@')
  if (!domain) return text
  const base = local.split(':')[0]
  return `${base}@${domain}`
}

function cacheKey(groupId, jid) {
  const key = normalizeParticipantKey(jid)
  return `${groupId}:${key || 'unknown'}`
}

function participantNumber(jid) {
  const value = asString(jid)
  if (!/@s\.whatsapp\.net$/i.test(value)) return ''
  const number = normalizeNumber(value)
  return /^\d{7,15}$/.test(number) ? number : ''
}

function looksLikePhoneName(value) {
  const text = asString(value)
  if (!text) return true
  const number = normalizeNumber(text)
  return number && text.replace(/[+\s().-]/g, '') === number
}

function participantName(participant) {
  if (participant && typeof participant === 'object') {
    const candidates = [
      participant.pushName,
      participant.name,
      participant.notify,
      participant.profileName,
      participant.contactName,
      participant.shortName,
      participant.verifiedName,
      participant.displayName,
      participant.subject,
    ]

    for (const candidate of candidates) {
      const value = asString(candidate)
      if (value && !looksLikePhoneName(value)) return value
    }
  }

  return ''
}

function validParticipantJid(value) {
  const jid = asString(value)
  return /^(?:\d{5,20}@s\.whatsapp\.net|[\w.-]{2,80}@lid)$/i.test(jid)
}

function normalizePhoneJid(value) {
  const jid = asString(value)
  if (!jid) return ''
  if (/^\d{5,20}@s\.whatsapp\.net$/i.test(jid)) return jid
  if (/^\d{5,20}$/.test(jid)) return `${jid}@s.whatsapp.net`
  return ''
}

function normalizeEventParticipant(participant) {
  if (typeof participant === 'string') {
    const direct = normalizePhoneJid(participant)
    if (direct) return { jid: direct, lid: '' }
    const value = asString(participant)
    return validParticipantJid(value) ? { jid: value, lid: value.endsWith('@lid') ? value : '' } : { jid: '', lid: '' }
  }

  if (!participant || typeof participant !== 'object') return { jid: '', lid: '' }

  const phoneCandidates = [
    participant.phoneNumber,
    participant.pn,
    participant.phone,
  ]

  for (const candidate of phoneCandidates) {
    const jid = normalizePhoneJid(candidate)
    if (jid) {
      return {
        jid,
        lid: participantLid(participant) || (asString(participant.id).endsWith('@lid') ? asString(participant.id) : ''),
      }
    }
  }

  const directCandidates = [participant.jid, participant.id]
  for (const candidate of directCandidates) {
    const value = asString(candidate)
    if (!value) continue
    const jid = normalizePhoneJid(value)
    if (jid) return { jid, lid: participantLid(participant) }
  }

  for (const candidate of directCandidates) {
    const value = asString(candidate)
    if (validParticipantJid(value)) {
      return { jid: value, lid: value.endsWith('@lid') ? value : participantLid(participant) }
    }
  }

  return { jid: '', lid: participantLid(participant) }
}

export function extractParticipantJid(participant) {
  return normalizeEventParticipant(participant).jid || normalizeEventParticipant(participant).lid
}

function participantLid(participant) {
  if (typeof participant === 'string') {
    return participant.endsWith('@lid') ? participant.trim() : ''
  }
  if (!participant || typeof participant !== 'object') return ''
  const candidates = [participant.lid, participant.id, participant.jid]
  for (const candidate of candidates) {
    const value = asString(candidate)
    if (value.endsWith('@lid')) return value
  }
  return ''
}

function participantAliases(participant, canonicalJid = '') {
  const aliases = new Set()
  const add = (value) => {
    const normalized = normalizeParticipantKey(value)
    if (normalized) aliases.add(normalized)
  }

  if (typeof participant === 'string') {
    add(participant)
  } else if (participant && typeof participant === 'object') {
    add(participant.id)
    add(participant.jid)
    add(participant.lid)
    add(participant.phoneNumber)
    add(participant.pn)
    add(participant.phone)
  }

  add(canonicalJid)
  return [...aliases]
}

function sameJid(a, b) {
  const left = normalizeParticipantKey(a)
  const right = normalizeParticipantKey(b)
  return Boolean(left && right && left === right)
}

async function resolveParticipantJid(participant, conn) {
  const resolved = normalizeEventParticipant(participant)
  if (resolved.jid && resolved.jid.endsWith('@s.whatsapp.net')) return resolved.jid

  const lid = resolved.lid || (resolved.jid.endsWith('@lid') ? resolved.jid : '')
  if (!lid) return ''

  try {
    const phone = await resolvePhoneNumber(lid, conn)
    const jid = normalizePhoneJid(phone)
    if (jid) return jid
  } catch {
  }

  return lid
}

async function getGroupData(conn, groupId) {
  const metadata = await conn.groupMetadata(groupId)

  for (const participant of metadata?.participants || []) {
    const rawJid = extractParticipantJid(participant)
    const jid = await resolveParticipantJid(participant, conn) || rawJid
    if (!jid) continue

    const name = participantName(participant)
    const aliases = participantAliases(participant, jid)

    for (const alias of aliases) {
      const key = cacheKey(groupId, alias)
      if (name) memberNameCache.set(key, name)
      memberJidCache.set(key, jid)
    }
  }

  return metadata
}

function contactNameFromConnection(conn, jid) {
  const candidates = [
    conn?.store?.contacts?.[jid],
    conn?.contacts?.[jid],
  ]

  for (const contact of candidates) {
    const name = participantName(contact)
    if (name) return name
  }

  return contactNameCache.get(jid) || ''
}

async function findKnownName(groupId, jid, participant = null, conn = null) {
  const direct = participantName(participant)
  if (direct) return direct

  for (const alias of participantAliases(participant, jid)) {
    const connectionName = contactNameFromConnection(conn, alias)
    if (connectionName) return connectionName
  }

  for (const alias of participantAliases(participant, jid)) {
    const cached = memberNameCache.get(cacheKey(groupId, alias))
    if (cached && !looksLikePhoneName(cached)) return cached

    const resolvedJid = memberJidCache.get(cacheKey(groupId, alias))
    const resolvedCached = resolvedJid
      ? memberNameCache.get(cacheKey(groupId, resolvedJid))
      : ''
    if (resolvedCached && !looksLikePhoneName(resolvedCached)) return resolvedCached
  }

  const resolvedJid = normalizePhoneJid(jid) || jid
  try {
    const user = await getUser(resolvedJid)
    const dbName = asString(user?.pushName)
    if (dbName && !looksLikePhoneName(dbName) && dbName.toLowerCase() !== 'kak') return dbName
  } catch {
  }

  return ''
}

function truncateDisplayName(name, maxLength = 32) {
  const value = asString(name)
  const chars = Array.from(value)
  if (!chars.length || chars.length <= maxLength) return value
  return `${chars.slice(0, Math.max(1, maxLength - 3)).join('').trimEnd()}...`
}

function fallbackDisplayName(name) {
  return truncateDisplayName(name, 32) || 'User'
}

function buildMemberFooter({ action, name, number, groupName }) {
  const welcome = action === 'welcome'
  const displayName = truncateDisplayName(name, 24) || 'User'
  const displayGroupName = truncateDisplayName(groupName, 28) || 'Group'
  const identity = number ? `@${number}` : displayName

  return [
    '‎╭═════════════ ⪩',
    `‎╰╮${welcome ? '👋 WELCOME' : '👋 GOODBYE'} ${identity}`,
    '‎╭═════════════ ⪩',
    `‎┃ • Nama  : ${displayName}`,
    `┃ • Nomor : ${number ? `+${number}` : 'Tidak tersedia'}`,
    `┃ • Group : ${displayGroupName}`,
    '‎╰══════════════ ⪨',
    '',
    '‎╭═════════════ ⪩',
    welcome ? '‎┃ Selamat datang di grup.' : '‎┃ Terima kasih sudah bersama.',
    welcome ? '┃ Semoga betah bersama kami.' : '┃ Semoga sukses selalu.',
    '‎╰══════════════ ⪨',
    '',
    'By AlzRiss - Usanagi Umi AI',
  ].join('\n')
}

const FIXED_FOOTER = global.brandCredit || 'By AlzRiss - Usanagi Umi AI'

function buildCustomFooter(customText) {
  const text = asString(customText)
  return text ? `${text}\n\n${FIXED_FOOTER}` : FIXED_FOOTER
}

function resolveCustomText(text, memberJid, number) {
  const source = asString(text)
  if (!source) return { text: '', mentionRequested: false }
  const identifier = number || asString(memberJid).split('@')[0].split(':')[0] || 'user'
  const placeholderRequested = /@user\b/i.test(source)
  const resolved = source.replace(/@user\b/gi, `@${identifier}`)
  const directMentionRequested = Boolean(number && new RegExp(`@${escapeRegExp(number)}\b`, 'i').test(resolved))
  return {
    text: resolved,
    mentionRequested: placeholderRequested || directMentionRequested,
  }
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function defaultButtons(action, footer, usedPrefix) {
  if (action === 'welcome') {
    return [
      { type: 'copy', label: 'SALIN INTRO', id: 'welcome_copy_intro', copyCode: footer },
      { label: 'PERATURAN', command: `${usedPrefix}peraturan` },
    ]
  }
  return [{ type: 'noop', label: 'GOODBYE' }]
}

async function buildEventMedia(conn, action, memberJid, number, groupName, name, config) {
  const customMedia = config?.media
  if (customMedia && await isStoredMediaUsable(customMedia)) {
    const mediaPath = resolveStoredMediaPath(customMedia)
    if (mediaPath) {
      if (customMedia.type === 'image') return { image: mediaPath, custom: true }
      return { video: mediaPath, gifPlayback: Boolean(customMedia.gifPlayback || customMedia.type === 'gif'), custom: true }
    }
  }

  try {
    const image = await renderMemberCard({
      conn,
      memberJid,
      memberNumber: number,
      groupName,
      action,
      memberName: name,
    })
    return { image, custom: false }
  } catch (err) {
    console.log(`  \x1b[33m⚠\x1b[0m  Canvas ${action} gagal: ${err.message}`)
    return { image: null, custom: false }
  }
}

async function sendMemberEvent(conn, groupId, memberJid, action, groupName, name, usedPrefix) {
  const safeJid = asString(memberJid)
  if (!safeJid || (!safeJid.endsWith('@s.whatsapp.net') && !safeJid.endsWith('@lid'))) {
    throw new Error('JID participant tidak valid')
  }

  let number = participantNumber(safeJid)
  if (!number && safeJid.endsWith('@lid')) {
    try {
      const resolved = await resolvePhoneNumber(safeJid, conn)
      if (resolved) number = /^\d{7,15}$/.test(resolved) ? resolved : ''
    } catch {
    }
  }

  const safeName = fallbackDisplayName(name)
  const safeGroupName = asString(groupName) || 'Group'
  const defaultFooter = buildMemberFooter({
    action,
    name: safeName,
    number,
    groupName: safeGroupName,
  })
  const config = action === 'welcome'
    ? getGroupWelcomeConfig(groupId)
    : getGroupGoodbyeConfig(groupId)

  const hasCustomText = Boolean(asString(config?.text))
  const customTextResult = resolveCustomText(config?.text, safeJid, number)
  const customBody = customTextResult.text
  const footer = hasCustomText
    ? buildCustomFooter(customBody)
    : defaultFooter
  const buttons = defaultButtons(action, footer, usedPrefix)
  const mentions = hasCustomText
    ? (customTextResult.mentionRequested ? [safeJid] : [])
    : [safeJid]
  const media = await buildEventMedia(conn, action, safeJid, number, safeGroupName, safeName, config)

  const payload = {
    title: '',
    subtitle: '',
    body: '',
    footer,
    image: media.image || null,
    video: media.video || null,
    gifPlayback: Boolean(media.gifPlayback),
    buttons,
    mentions,
    fallbackToText: false,
  }

  try {
    await sendInteractive(conn, groupId, payload, {})
  } catch (err) {
    if (!media.custom) throw err

    const fallbackMedia = await buildEventMedia(
      conn,
      action,
      safeJid,
      number,
      safeGroupName,
      safeName,
      null
    )
    await sendInteractive(
      conn,
      groupId,
      {
        ...payload,
        image: fallbackMedia.image || null,
        video: fallbackMedia.video || null,
        gifPlayback: Boolean(fallbackMedia.gifPlayback),
        buttons: defaultButtons(action, footer, usedPrefix),
        fallbackToText: true,
      },
      {}
    )
  }
}

export function attachWelcomeHandler(conn) {
  if (!conn?.ev?.on) return conn

  conn.ev.on('contacts.upsert', (contacts = []) => {
    for (const contact of contacts) {
      const jid = asString(contact?.id || contact?.jid)
      const name = participantName(contact)
      if (jid && name) contactNameCache.set(jid, name)
    }
  })

  conn.ev.on('contacts.update', (contacts = []) => {
    for (const contact of contacts) {
      const jid = asString(contact?.id || contact?.jid)
      const name = participantName(contact)
      if (jid && name) contactNameCache.set(jid, name)
    }
  })

  conn.ev.on('group-participants.update', async (update) => {
    try {
      const groupId = asString(update?.id || update?.jid || update?.chatId)
      const action = asString(update?.action).toLowerCase()

      if (!groupId.endsWith('@g.us')) return
      if (!['add', 'remove', 'leave'].includes(action)) return

      const eventAction = action === 'add' ? 'welcome' : 'goodbye'
      const enabled = eventAction === 'welcome'
        ? isWelcomeEnabled(groupId)
        : isGoodbyeEnabled(groupId)
      if (!enabled) return

      const rawParticipants = Array.isArray(update?.participants) ? update.participants : []
      if (!rawParticipants.length) return

      let metadata = null
      try {
        metadata = await getGroupData(conn, groupId)
      } catch (err) {
        console.log(`  \x1b[33m⚠\x1b[0m  Metadata group tidak tersedia untuk ${groupId}: ${err.message}`)
      }

      const groupName = asString(metadata?.subject) || 'Group'
      let usedPrefix = settings.defaultPrefix
      try {
        usedPrefix = await getActivePrefix(groupId)
      } catch {
      }

      for (const rawParticipant of rawParticipants) {
        const originalJid = extractParticipantJid(rawParticipant)
        if (!originalJid) {
          console.log('  \x1b[33m⚠\x1b[0m  Event participant diabaikan: JID tidak ditemukan')
          continue
        }

        const memberJid = await resolveParticipantJid(rawParticipant, conn) || originalJid
        if (!memberJid || sameJid(memberJid, conn.user?.id)) continue

        const participant = (metadata?.participants || []).find((p) => {
          const aliases = participantAliases(p)
          const targets = participantAliases(rawParticipant, memberJid)
          return aliases.some((alias) => targets.includes(alias))
        })

        const name = await findKnownName(groupId, originalJid, participant || rawParticipant, conn)
        const displayName = fallbackDisplayName(name)

        for (const alias of participantAliases(rawParticipant, memberJid)) {
          const key = cacheKey(groupId, alias)
          if (name) memberNameCache.set(key, name)
          memberJidCache.set(key, memberJid)
        }

        console.log(`  \x1b[36m›\x1b[0m  Group event: ${action} | ${memberJid} | ${displayName}`)

        try {
          await sendMemberEvent(
            conn,
            groupId,
            memberJid,
            eventAction,
            groupName,
            displayName,
            usedPrefix
          )
          console.log(`  \x1b[32m✓\x1b[0m  ${eventAction === 'welcome' ? 'Welcome' : 'Goodbye'} terkirim untuk ${memberJid}`)
        } catch (err) {
          const detail = err instanceof Error ? err.message : JSON.stringify(err)
          console.log(`  \x1b[33m⚠\x1b[0m  Gagal mengirim ${eventAction} ${memberJid}: ${detail}`)
        } finally {
          if (eventAction !== 'welcome') {
            for (const alias of participantAliases(rawParticipant, memberJid)) {
              const key = cacheKey(groupId, alias)
              memberNameCache.delete(key)
              memberJidCache.delete(key)
            }
          }
        }
      }
    } catch (err) {
      const detail = err instanceof Error ? err.stack || err.message : JSON.stringify(err)
      console.log(`  \x1b[31m✗\x1b[0m  Welcome handler error: ${detail}`)
    }
  })

  return conn
}

export default { attachWelcomeHandler, extractParticipantJid }
