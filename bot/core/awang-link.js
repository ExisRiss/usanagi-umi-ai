
import { getDb } from './awang-sqlite.js'
import { isOwner, normalizeNumber, resolvePhoneNumber } from '../lib/awang-cekakses.js'
import { findParticipant, participantIsAdmin, getParticipantJid, isBotAdmin } from '../lib/awang-aksesgrub.js'

const GROUP_LINK_RE = /(?:(?:https?:\/\/)(?:www\.)?|www\.)?chat\.whatsapp\.com\/(?:invite\/)?[A-Za-z0-9_-]+(?![A-Za-z0-9_-])/i
const GROUP_LINK_GLOBAL_RE = /(?:(?:https?:\/\/)(?:www\.)?|www\.)?chat\.whatsapp\.com\/(?:invite\/)?([A-Za-z0-9_-]+)(?![A-Za-z0-9_-])/gi
const CHANNEL_LINK_RE = /(?:(?:https?:\/\/)(?:www\.)?|www\.)?(?:whatsapp\.com\/channel\/|wa\.me\/channel\/)[A-Za-z0-9_-]+(?![A-Za-z0-9_-])/i
const metadataCache = new Map()
const metadataInflight = new Map()
const groupInviteCodeCache = new Map()
const noticeCache = new Map()
const processedMessageCache = new Map()
const processingMessageCache = new Set()
const PROCESS_CACHE_MS = 30000
const METADATA_CACHE_MS = 15000
const GROUP_INVITE_CACHE_MS = 3000
const PROCESS_CACHE_LIMIT = 5000

const GC_MODE_3X = '3x'
const GC_MODE_24H = '24h'
const GC_MODE_DELETE = 'delete'
const GC_MODE_SET = new Set([GC_MODE_3X, GC_MODE_24H, GC_MODE_DELETE])
const CH_MODE_3X = '3x'
const CH_MODE_24H = '24h'
const CH_MODE_DELETE = 'delete'
const CH_MODE_SET = new Set([CH_MODE_3X, CH_MODE_24H, CH_MODE_DELETE])
const GC_WINDOW_MS = 24 * 60 * 60 * 1000
const CH_WINDOW_MS = 24 * 60 * 60 * 1000

function asText(value) {
  return typeof value === 'string' ? value : ''
}

function unwrapMessage(message) {
  let current = message
  for (let i = 0; i < 8; i++) {
    if (!current || typeof current !== 'object') break
    const next = current.ephemeralMessage?.message || current.viewOnceMessage?.message || current.viewOnceMessageV2?.message || current.documentWithCaptionMessage?.message || current
    if (next === current) break
    current = next
  }
  return current || {}
}

export function extractMessageText(message) {
  const content = unwrapMessage(message)
  const texts = [
    content.conversation,
    content.extendedTextMessage?.text,
    content.imageMessage?.caption,
    content.videoMessage?.caption,
    content.documentMessage?.caption,
    content.documentWithCaptionMessage?.message?.documentMessage?.caption,
    content.buttonsResponseMessage?.selectedButtonId,
    content.listResponseMessage?.singleSelectReply?.selectedRowId,
    content.templateButtonReplyMessage?.selectedId,
  ]
  return texts.filter((value) => typeof value === 'string' && value.trim()).join('\n')
}

export function detectLinkType(text) {
  const value = asText(text)
  const groupMatch = value.match(GROUP_LINK_RE)
  if (groupMatch) {
    const index = groupMatch.index || 0
    const before = index > 0 ? value[index - 1] : ''
    const hasExplicitUrlPrefix = /^(?:https?:\/\/|www\.)/i.test(groupMatch[0])
    if (!before || /[\s([\]{},;:!?<>"'`~]/.test(before) || hasExplicitUrlPrefix) return 'gc'
  }

  const channelMatch = value.match(CHANNEL_LINK_RE)
  if (channelMatch) {
    const index = channelMatch.index || 0
    const before = index > 0 ? value[index - 1] : ''
    const hasExplicitUrlPrefix = /^(?:https?:\/\/|www\.)/i.test(channelMatch[0])
    if (!before || /[\s([\]{},;:!?<>"'`~]/.test(before) || hasExplicitUrlPrefix) return 'ch'
  }

  return null
}

function normalizeInviteCode(value) {
  const input = asText(value).trim()
  if (!input) return ''
  const match = input.match(/chat\.whatsapp\.com\/(?:invite\/)?([A-Za-z0-9_-]+)/i)
  return match?.[1] || input.replace(/^invite\//i, '')
}

function extractGroupInviteCodes(text) {
  const value = asText(text)
  if (!value) return []
  const codes = []
  let match
  GROUP_LINK_GLOBAL_RE.lastIndex = 0
  while ((match = GROUP_LINK_GLOBAL_RE.exec(value))) {
    const index = match.index || 0
    const before = index > 0 ? value[index - 1] : ''
    const explicit = /^(?:https?:\/\/|www\.)/i.test(match[0])
    if (!before || /[\s([\]{},;:!?<>"'`~]/.test(before) || explicit) {
      const code = normalizeInviteCode(match[1])
      if (code && !codes.includes(code)) codes.push(code)
    }
  }
  GROUP_LINK_GLOBAL_RE.lastIndex = 0
  return codes
}

async function getCurrentGroupInviteCode(conn, groupId, metadata) {
  const metadataCode = normalizeInviteCode(metadata?.inviteCode || metadata?.groupInviteCode || metadata?.invite)
  if (metadataCode) return metadataCode

  const now = Date.now()
  const cached = groupInviteCodeCache.get(groupId)
  if (cached && cached.expiresAt > now && cached.code) return cached.code
  if (typeof conn?.groupInviteCode !== 'function') return ''

  try {
    const code = normalizeInviteCode(await conn.groupInviteCode(groupId))
    if (code) groupInviteCodeCache.set(groupId, { code, expiresAt: now + GROUP_INVITE_CACHE_MS })
    return code
  } catch {
    return ''
  }
}

async function isOwnGroupLink(conn, groupId, text, metadata) {
  const codes = extractGroupInviteCodes(text)
  if (!codes.length) return false
  const ownCode = await getCurrentGroupInviteCode(conn, groupId, metadata)
  return Boolean(ownCode && codes.every((code) => code === ownCode))
}

function normalizeGcMode(value) {
  return GC_MODE_SET.has(value) ? value : GC_MODE_3X
}

function getStoredGcMode(row) {
  return row?.gc_enabled ? normalizeGcMode(row?.gc_mode) : null
}

function normalizeChMode(value) {
  return CH_MODE_SET.has(value) ? value : CH_MODE_3X
}

function getStoredChMode(row) {
  return row?.ch_enabled ? normalizeChMode(row?.ch_mode) : null
}

export function getAntiLinkStatus(groupId) {
  const row = getDb().prepare('SELECT gc_enabled, gc_mode, ch_enabled, ch_mode FROM group_antilink WHERE chatId = ?').get(groupId)
  return {
    gc: Boolean(row?.gc_enabled),
    gcMode: getStoredGcMode(row),
    ch: Boolean(row?.ch_enabled),
    chMode: getStoredChMode(row),
  }
}

export function setAntiLinkGcMode(groupId, mode) {
  const nextMode = mode === null || mode === undefined ? null : normalizeGcMode(mode)
  const db = getDb()
  const currentRow = db.prepare('SELECT gc_enabled, gc_mode, ch_enabled FROM group_antilink WHERE chatId = ?').get(groupId)
  const currentMode = getStoredGcMode(currentRow)

  const update = db.transaction(() => {
    if (nextMode) {
      db.prepare(`
        INSERT INTO group_antilink (chatId, gc_enabled, ch_enabled, gc_mode)
        VALUES (?, 1, 0, ?)
        ON CONFLICT(chatId) DO UPDATE SET
          gc_enabled = 1,
          ch_enabled = 0,
          gc_mode = excluded.gc_mode
      `).run(groupId, nextMode)
    } else {
      db.prepare(`
        INSERT INTO group_antilink (chatId, gc_enabled, ch_enabled, gc_mode)
        VALUES (?, 0, 0, ?)
        ON CONFLICT(chatId) DO UPDATE SET
          gc_enabled = 0,
          ch_enabled = 0,
          gc_mode = excluded.gc_mode
      `).run(groupId, GC_MODE_3X)
    }

    if (currentMode !== nextMode) {
      db.prepare('DELETE FROM antilink_strikes WHERE chatId = ? AND type = ?').run(groupId, 'gc')
    }
  })

  update()
  return getAntiLinkStatus(groupId)
}

export function setAntiLinkChMode(groupId, mode) {
  const nextMode = mode === null || mode === undefined ? null : normalizeChMode(mode)
  const db = getDb()
  const currentRow = db.prepare('SELECT gc_enabled, gc_mode, ch_enabled, ch_mode FROM group_antilink WHERE chatId = ?').get(groupId)
  const currentMode = getStoredChMode(currentRow)

  const update = db.transaction(() => {
    if (nextMode) {
      db.prepare(`
        INSERT INTO group_antilink (chatId, gc_enabled, gc_mode, ch_enabled, ch_mode)
        VALUES (?, 0, ?, 1, ?)
        ON CONFLICT(chatId) DO UPDATE SET
          gc_enabled = 0,
          ch_enabled = 1,
          ch_mode = excluded.ch_mode
      `).run(groupId, GC_MODE_3X, nextMode)
    } else {
      db.prepare(`
        INSERT INTO group_antilink (chatId, gc_enabled, gc_mode, ch_enabled, ch_mode)
        VALUES (?, 0, ?, 0, ?)
        ON CONFLICT(chatId) DO UPDATE SET
          ch_enabled = 0,
          ch_mode = excluded.ch_mode
      `).run(groupId, GC_MODE_3X, CH_MODE_3X)
    }

    if (currentMode !== nextMode) {
      db.prepare('DELETE FROM antilink_strikes WHERE chatId = ? AND type = ?').run(groupId, 'ch')
    }
  })

  update()
  return getAntiLinkStatus(groupId)
}

export function setAntiLinkStatus(groupId, type, enabled) {
  if (type === 'gc') {
    return setAntiLinkGcMode(groupId, enabled ? GC_MODE_3X : null)
  }
  if (type === 'ch') {
    return setAntiLinkChMode(groupId, enabled ? CH_MODE_3X : null)
  }
  return getAntiLinkStatus(groupId)
}

function getAntiLinkStrikeState(groupId, senderJid, type) {
  const key = normalizeNumber(senderJid) || senderJid
  const row = getDb().prepare(
    'SELECT strikes, updatedAt FROM antilink_strikes WHERE chatId = ? AND senderJid = ? AND type = ?'
  ).get(groupId, key, type)
  return {
    strikes: Number(row?.strikes || 0),
    updatedAt: Number(row?.updatedAt || 0),
  }
}

export function getAntiLinkStrike(groupId, senderJid, type) {
  return getAntiLinkStrikeState(groupId, senderJid, type).strikes
}

function incrementStrike(groupId, senderJid, type, timestamp = Date.now()) {
  const key = normalizeNumber(senderJid) || senderJid
  const db = getDb()
  db.prepare(`
    INSERT INTO antilink_strikes (chatId, senderJid, type, strikes, updatedAt)
    VALUES (?, ?, ?, 1, ?)
    ON CONFLICT(chatId, senderJid, type)
    DO UPDATE SET strikes = strikes + 1, updatedAt = excluded.updatedAt
  `).run(groupId, key, type, timestamp)
  return getAntiLinkStrikeState(groupId, key, type).strikes
}

function clearStrikes(groupId, senderJid, type) {
  const key = normalizeNumber(senderJid) || senderJid
  getDb().prepare('DELETE FROM antilink_strikes WHERE chatId = ? AND senderJid = ? AND type = ?').run(groupId, key, type)
}

async function getMetadata(conn, groupId) {
  const now = Date.now()
  const cached = metadataCache.get(groupId)
  if (cached && cached.expiresAt > now) return cached.metadata

  const existing = metadataInflight.get(groupId)
  if (existing) return existing

  const pending = Promise.resolve()
    .then(() => conn.groupMetadata(groupId))
    .then((metadata) => {
      metadataCache.set(groupId, { metadata, expiresAt: Date.now() + METADATA_CACHE_MS })
      return metadata
    })
    .finally(() => {
      metadataInflight.delete(groupId)
    })

  metadataInflight.set(groupId, pending)
  return pending
}

async function resolveSenderJid(senderJid, conn) {
  const value = asText(senderJid)
  if (!value) return ''
  if (value.includes('@s.whatsapp.net')) return value
  try {
    const number = await resolvePhoneNumber(value, conn)
    if (number) return `${number}@s.whatsapp.net`
  } catch {
  }
  return value
}

async function getSenderRole(conn, groupId, senderJid, metadata) {
  if (await isOwner(senderJid, conn)) return 'owner'
  const participant = findParticipant(metadata, senderJid)
  if (participant && participantIsAdmin(participant)) return 'admin'
  const resolved = await resolveSenderJid(senderJid, conn)
  const resolvedParticipant = findParticipant(metadata, resolved)
  if (resolvedParticipant && participantIsAdmin(resolvedParticipant)) return 'admin'
  return null
}

async function sendBotAdminNotice(conn, groupId, type, mode) {
  const key = `${groupId}:${type}`
  const last = noticeCache.get(key) || 0
  if (Date.now() - last < 30 * 60 * 1000) return
  noticeCache.set(key, Date.now())
  const needsRemove = mode === GC_MODE_3X || mode === CH_MODE_3X
  const action = needsRemove ? 'menghapus pesan dan mengeluarkan pelanggar' : 'menghapus pesan'
  await conn.sendMessage(groupId, {
    text: [
      '╭─〔 ANTI LINK 〕',
      '│',
      '│ Moderasi belum dapat berjalan.',
      '│ Bot harus menjadi admin group',
      `│ agar dapat ${action}.`,
      '╰──────────────',
    ].join('\n'),
  })
}

async function deleteMessage(conn, raw) {
  try {
    await conn.sendMessage(raw.key.remoteJid, { delete: raw.key })
    return true
  } catch (err) {
    console.log(`  \x1b[33m⚠\x1b[0m  Gagal menghapus pesan anti-link: ${err.message}`)
    return false
  }
}

async function removeParticipant(conn, groupId, participantJid) {
  const jid = asText(participantJid)
  if (!jid) return false
  try {
    await conn.groupParticipantsUpdate(groupId, [jid], 'remove')
    return true
  } catch (firstError) {
    try {
      const number = await resolvePhoneNumber(jid, conn)
      if (number) {
        await conn.groupParticipantsUpdate(groupId, [`${number}@s.whatsapp.net`], 'remove')
        return true
      }
    } catch {
    }
    console.log(`  \x1b[33m⚠\x1b[0m  Gagal mengeluarkan member anti-link: ${firstError.message}`)
    return false
  }
}

function violationText(type, strike, max) {
  const label = type === 'gc' ? 'LINK GRUP WHATSAPP' : 'LINK SALURAN WHATSAPP'
  if (strike >= max) {
    return [
      '╭─〔 ANTI LINK 〕',
      '│',
      `│ ${label} melanggar batas ${max}x.`,
      '│ Pesan telah dihapus.',
      '│ User diproses untuk dikeluarkan.',
      '╰──────────────',
    ].join('\n')
  }
  return [
    '╭─〔 ANTI LINK 〕',
    '│',
    `│ ${label} terdeteksi dan dihapus.`,
    `│ Peringatan : ${strike}/${max}`,
    `│ Sisa kesempatan : ${max - strike}x`,
    '╰──────────────',
  ].join('\n')
}

function formatCooldownDuration(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(Number(milliseconds || 0) / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts = []
  if (hours > 0) parts.push(`${hours} jam`)
  if (minutes > 0 || hours > 0) parts.push(`${minutes} menit`)
  parts.push(`${String(seconds).padStart(2, '0')} detik`)
  return parts.join(' ')
}

function getDailyViolationState(groupId, senderJid, type, timestamp = Date.now()) {
  const key = normalizeNumber(senderJid) || senderJid
  const db = getDb()
  const windowMs = type === 'gc' ? GC_WINDOW_MS : CH_WINDOW_MS

  return db.transaction(() => {
    const existing = db.prepare(
      'SELECT strikes, updatedAt FROM antilink_strikes WHERE chatId = ? AND senderJid = ? AND type = ?'
    ).get(groupId, key, type)

    const updatedAt = Number(existing?.updatedAt || 0)
    const elapsed = updatedAt > 0 ? Math.max(0, timestamp - updatedAt) : windowMs
    const active = Number(existing?.strikes || 0) > 0 && updatedAt > 0 && elapsed < windowMs

    if (active) {
      return {
        limited: true,
        updatedAt,
        remainingMs: windowMs - elapsed,
      }
    }

    db.prepare(`
      INSERT INTO antilink_strikes (chatId, senderJid, type, strikes, updatedAt)
      VALUES (?, ?, ?, 1, ?)
      ON CONFLICT(chatId, senderJid, type)
      DO UPDATE SET strikes = 1, updatedAt = excluded.updatedAt
    `).run(groupId, key, type, timestamp)

    return {
      limited: false,
      updatedAt: timestamp,
      remainingMs: windowMs,
    }
  })()
}

function dailyFirstText(type, state) {
  if (type === 'gc') {
    return [
      '╭─〔 🔐 ANTI LINK GC 24 JAM 〕',
      '│',
      '│ Link pertama diperbolehkan.',
      '│',
      '│ Kesempatan 1x/24 jam Anda',
      '│ sudah tercatat untuk group ini.',
      `│ Link berikutnya : ${formatCooldownDuration(state.remainingMs)}`,
      '╰────────────────',
    ].join('\n')
  }

  return [
    '╭─〔 🔐 ANTI LINK CH 24 JAM 〕',
    '│',
    '│ Link pertama diperbolehkan.',
    '│',
    '│ Kesempatan 1x/24 jam sudah',
    '│ tercatat untuk group ini.',
    `│ Link berikutnya : ${formatCooldownDuration(state.remainingMs)}`,
    '╰────────────────',
  ].join('\n')
}

function dailyLimitedText(type, state) {
  if (type === 'gc') {
    return [
      '╭─〔 🔐 ANTI LINK GC 24 JAM 〕',
      '│',
      '│ Kesempatan 1x/24 jam sudah',
      '│ digunakan sebelumnya.',
      '│',
      '│ Pesan link ini telah dihapus.',
      '│',
      `│ Bisa berbagi lagi dalam`,
      `│ ${formatCooldownDuration(state.remainingMs)}`,
      '╰────────────────',
    ].join('\n')
  }

  return [
    '╭─〔 🔐 ANTI LINK CH 24 JAM 〕',
    '│',
    '│ Kesempatan 1x/24 jam sudah',
    '│ digunakan sebelumnya.',
    '│',
    '│ Pesan link ini telah dihapus.',
    `│ Bisa berbagi lagi dalam`,
    `│ ${formatCooldownDuration(state.remainingMs)}`,
    '╰────────────────',
  ].join('\n')
}

function ownGroupLinkText() {
  return [
    '╭─〔 🔗 LINK GROUP SENDIRI 〕',
    '│',
    '│ Link yang dibagikan adalah',
    '│ link group ini sendiri.',
    '│',
    '│ Link tidak dihapus dan tidak',
    '│ dihitung sebagai pelanggaran.',
    '╰────────────────',
  ].join('\n')
}

function deleteOnlyText(type) {
  if (type === 'gc') {
    return [
      '╭─〔 ANTI LINK DELETE ONLY 〕',
      '│',
      '│ Link grup terdeteksi.',
      '│ Pesan telah dihapus.',
      '│ Tidak ada warning atau kick.',
      '╰──────────────',
    ].join('\n')
  }

  return [
    '╭─〔 ANTI LINK CH DELETE ONLY 〕',
    '│',
    '│ Link saluran terdeteksi.',
    '│ Pesan telah dihapus.',
    '│ Tanpa warning dan kick.',
    '╰──────────────',
  ].join('\n')
}

function adminBypassText(role, type) {
  if (type === 'gc') {
    return [
      `╭─〔 ${role === 'owner' ? 'OWNER BOT' : 'ADMIN GROUP'} 〕`,
      '│',
      '│ Link grup diperbolehkan.',
      '│ AntiLinkGC tidak berlaku untuk role ini.',
      '│ Tidak ada delete, warning, atau kick.',
      '╰──────────────',
    ].join('\n')
  }

  return [
    `╭─〔 ${role === 'owner' ? 'OWNER BOT' : 'ADMIN GROUP'} 〕`,
    '│',
    '│ Link saluran diperbolehkan.',
    '│ AntiLinkCH tidak berlaku untuk role ini.',
    '╰──────────────',
  ].join('\n')
}

function markProcessedMessage(messageId, timestamp) {
  if (!messageId) return
  processedMessageCache.set(messageId, timestamp)
  if (processedMessageCache.size <= PROCESS_CACHE_LIMIT) return
  for (const [id, time] of processedMessageCache) {
    if (timestamp - time >= PROCESS_CACHE_MS) processedMessageCache.delete(id)
    if (processedMessageCache.size <= PROCESS_CACHE_LIMIT) break
  }
}

export async function handleAntiLinkMessage(conn, raw) {
  const groupId = asText(raw?.key?.remoteJid)
  const messageId = asText(raw?.key?.id)
  const processKey = messageId ? `${groupId}:${messageId}` : ''
  if (!groupId.endsWith('@g.us')) return false
  if (raw?.key?.fromMe) return false
  if (!raw?.message) return false

  const now = Date.now()
  if (messageId) {
    const previousProcessed = processedMessageCache.get(processKey)
    if (previousProcessed && now - previousProcessed < PROCESS_CACHE_MS) return false
  }

  const status = getAntiLinkStatus(groupId)
  if (!status.gc && !status.ch) return false

  const text = extractMessageText(raw.message)
  const type = detectLinkType(text)
  if (!type || (type === 'gc' ? !status.gc : !status.ch)) return false

  const senderJid = asText(raw?.key?.participant || raw?.key?.participantAlt || raw?.participant || '')
  if (!senderJid) {
    if (messageId) processedMessageCache.delete(processKey)
    return false
  }

  let metadata
  try {
    metadata = await getMetadata(conn, groupId)
  } catch (err) {
    console.log(`  \x1b[33m⚠\x1b[0m  Metadata anti-link tidak tersedia: ${err.message}`)
    if (messageId) processedMessageCache.delete(processKey)
    return false
  }

  const role = await getSenderRole(conn, groupId, senderJid, metadata)
  if (role) {
    markProcessedMessage(processKey, now)
    try {
      await conn.sendMessage(
        groupId,
        { text: adminBypassText(role, type), mentions: [senderJid] },
        { quoted: raw }
      )
    } catch (err) {
      console.log(`  \x1b[33m⚠\x1b[0m  Gagal kirim notifikasi bypass anti-link: ${err.message}`)
    }
    return false
  }

  if (type === 'gc') {
    let ownGroupLink = false
    try {
      ownGroupLink = await isOwnGroupLink(conn, groupId, text, metadata)
    } catch {
      ownGroupLink = false
    }
    if (ownGroupLink) {
      markProcessedMessage(processKey, now)
      try {
        await conn.sendMessage(
          groupId,
          { text: ownGroupLinkText(), mentions: [senderJid] },
          { quoted: raw }
        )
      } catch (err) {
        console.log(`  \x1b[33m⚠\x1b[0m  Gagal kirim notifikasi link group sendiri: ${err.message}`)
      }
      return false
    }
  }

  const liveStatus = getAntiLinkStatus(groupId)
  if (!liveStatus.gc && !liveStatus.ch) return false
  if (type === 'gc' && !liveStatus.gc) return false
  if (type === 'ch' && !liveStatus.ch) return false

  const activeMode = type === 'gc' ? (liveStatus.gcMode || GC_MODE_3X) : (liveStatus.chMode || CH_MODE_3X)
  const botAdmin = await isBotAdmin(conn, groupId, metadata)
  if (!botAdmin) {
    await sendBotAdminNotice(conn, groupId, type, activeMode)
    return false
  }

  const participant = findParticipant(metadata, senderJid)
  const resolvedSender = participant ? '' : await resolveSenderJid(senderJid, conn)
  const resolvedParticipant = participant || findParticipant(metadata, resolvedSender)
  const targetJid = getParticipantJid(resolvedParticipant, resolvedSender || senderJid) || senderJid
  const gcMode = type === 'gc' ? (liveStatus.gcMode || GC_MODE_3X) : null
  const chMode = type === 'ch' ? (liveStatus.chMode || CH_MODE_3X) : null

  if (processKey) {
    if (processingMessageCache.has(processKey)) return true
    processingMessageCache.add(processKey)
  }

  try {
    const latestStatus = getAntiLinkStatus(groupId)
    if (type === 'gc' && (!latestStatus.gc || latestStatus.gcMode !== gcMode)) return true
    if (type === 'ch' && (!latestStatus.ch || latestStatus.chMode !== chMode)) return true

    if ((type === 'gc' && gcMode === GC_MODE_DELETE) || (type === 'ch' && chMode === CH_MODE_DELETE)) {
      const deleted = await deleteMessage(conn, raw)
      if (!deleted) {
        if (processKey) processedMessageCache.delete(processKey)
        return true
      }
      markProcessedMessage(processKey, Date.now())
      try {
        await conn.sendMessage(
          groupId,
          { text: deleteOnlyText(type), mentions: [targetJid] },
          { quoted: raw }
        )
      } catch (err) {
        console.log(`  \x1b[33m⚠\x1b[0m  Gagal kirim notifikasi delete-only: ${err.message}`)
      }
      return true
    }

    if ((type === 'gc' && gcMode === GC_MODE_24H) || (type === 'ch' && chMode === CH_MODE_24H)) {
      const dailyState = getDailyViolationState(groupId, targetJid, type, Date.now())
      const currentAfterState = getAntiLinkStatus(groupId)
      if (type === 'gc' && (!currentAfterState.gc || currentAfterState.gcMode !== gcMode)) return true
      if (type === 'ch' && (!currentAfterState.ch || currentAfterState.chMode !== chMode)) return true

      if (dailyState.limited) {
        const deleted = await deleteMessage(conn, raw)
        if (!deleted) {
          if (processKey) processedMessageCache.delete(processKey)
          return true
        }
        markProcessedMessage(processKey, Date.now())
        try {
          await conn.sendMessage(
            groupId,
            { text: dailyLimitedText(type, dailyState), mentions: [targetJid] },
            { quoted: raw }
          )
        } catch (err) {
          console.log(`  \x1b[33m⚠\x1b[0m  Gagal kirim notifikasi anti-link 24 jam: ${err.message}`)
        }
        return true
      }

      markProcessedMessage(processKey, Date.now())
      try {
        await conn.sendMessage(
          groupId,
          { text: dailyFirstText(type, dailyState), mentions: [targetJid] },
          { quoted: raw }
        )
      } catch (err) {
        console.log(`  \x1b[33m⚠\x1b[0m  Gagal kirim notifikasi anti-link 24 jam: ${err.message}`)
      }
      return true
    }

    const deleted = await deleteMessage(conn, raw)
    if (!deleted) {
      if (processKey) processedMessageCache.delete(processKey)
      return true
    }
    markProcessedMessage(processKey, Date.now())

    const max = 3
    const strike = incrementStrike(groupId, targetJid, type)

    if (strike >= max) {
      await conn.sendMessage(
        groupId,
        { text: violationText(type, strike, max), mentions: [targetJid] },
        { quoted: raw }
      )
      const currentAfterNotice = getAntiLinkStatus(groupId)
      if (type === 'gc' && (!currentAfterNotice.gc || currentAfterNotice.gcMode !== gcMode)) return true
      if (type === 'ch' && (!currentAfterNotice.ch || currentAfterNotice.chMode !== chMode)) return true
      const removed = await removeParticipant(conn, groupId, targetJid)
      if (!removed && targetJid !== senderJid) {
        await removeParticipant(conn, groupId, senderJid)
      } else if (removed) {
        clearStrikes(groupId, targetJid, type)
      }
      return true
    }

    await conn.sendMessage(
      groupId,
      { text: violationText(type, strike, max), mentions: [targetJid] },
      { quoted: raw }
    )
    return true
  } finally {
    if (processKey) processingMessageCache.delete(processKey)
  }
}

export function clearAntiLinkCache(groupId = '') {
  if (groupId) {
    metadataCache.delete(groupId)
    metadataInflight.delete(groupId)
    groupInviteCodeCache.delete(groupId)
    noticeCache.delete(`${groupId}:gc`)
    noticeCache.delete(`${groupId}:ch`)
    for (const id of processedMessageCache.keys()) {
      if (String(id).startsWith(`${groupId}:`)) processedMessageCache.delete(id)
    }
    for (const id of processingMessageCache) {
      if (String(id).startsWith(`${groupId}:`)) processingMessageCache.delete(id)
    }
    return
  }
  metadataCache.clear()
  metadataInflight.clear()
  groupInviteCodeCache.clear()
  noticeCache.clear()
  processedMessageCache.clear()
  processingMessageCache.clear()
}

export { GC_MODE_3X, GC_MODE_24H, GC_MODE_DELETE, CH_MODE_3X, CH_MODE_24H, CH_MODE_DELETE }
export default { getAntiLinkStatus, setAntiLinkStatus, setAntiLinkGcMode, setAntiLinkChMode, getAntiLinkStrike, handleAntiLinkMessage, detectLinkType, extractMessageText, clearAntiLinkCache }
