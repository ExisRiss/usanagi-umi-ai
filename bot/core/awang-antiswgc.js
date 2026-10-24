/* By AlzRiss - Usanagi Umi AI */

import { getDb } from './awang-sqlite.js'
import { isOwner } from '../lib/awang-cekakses.js'
import { findParticipant, participantIsAdmin, getParticipantJid, isBotAdmin } from '../lib/awang-aksesgrub.js'

const noticeCache = new Map()

function asText(value) {
  return typeof value === 'string' ? value : ''
}

function findSwGcType(node, path = 'message', seen = new WeakSet()) {
  if (!node || typeof node !== 'object') return null
  if (seen.has(node)) return null
  seen.add(node)

  if (node.groupStatusMessage) return `${path}.groupStatusMessage`
  if (node.groupStatusMessageV2) return `${path}.groupStatusMessageV2`
  if (node.groupStatusMentionMessage) return `${path}.groupStatusMentionMessage`
  if (node.groupMentionedMessage) return `${path}.groupMentionedMessage`
  if (node.statusMentionMessage) return `${path}.statusMentionMessage`
  if (node.contextInfo?.groupMentions?.length > 0) return `${path}.contextInfo.groupMentions`

  for (const [key, value] of Object.entries(node)) {
    if (!value || typeof value !== 'object') continue
    const found = findSwGcType(value, `${path}.${key}`, seen)
    if (found) return found
  }

  return null
}

export function detectSwGcType(message) {
  if (!message) return null
  return findSwGcType(message, 'message')
}

export function getAntiSwGcStatus(groupId) {
  if (!groupId) return false
  const row = getDb().prepare('SELECT enabled FROM group_antiswgc WHERE chatId = ?').get(groupId)
  return Boolean(row?.enabled)
}

export function setAntiSwGcStatus(groupId, enabled) {
  if (!groupId) throw new Error('Group ID tidak valid')
  getDb()
    .prepare(`
      INSERT INTO group_antiswgc (chatId, enabled)
      VALUES (?, ?)
      ON CONFLICT(chatId) DO UPDATE SET enabled = excluded.enabled
    `)
    .run(groupId, enabled ? 1 : 0)
  return Boolean(enabled)
}

async function canBypass(conn, groupId, senderJid, metadata) {
  if (await isOwner(senderJid, conn)) return true
  const participant = findParticipant(metadata, senderJid)
  return Boolean(participant && participantIsAdmin(participant))
}

async function sendBotAdminNotice(conn, groupId) {
  const key = `swgc:${groupId}`
  const last = noticeCache.get(key) || 0
  if (Date.now() - last < 30 * 60 * 1000) return
  noticeCache.set(key, Date.now())
  await conn.sendMessage(groupId, {
    text: [
      '╭─〔 ANTI SW GROUP 〕',
      '│',
      '│ Moderasi belum dapat berjalan.',
      '│ Bot harus menjadi admin group',
      '│ agar dapat menghapus pesan.',
      '╰──────────────',
    ].join('\n'),
  })
}

async function deleteMessage(conn, raw) {
  try {
    await conn.sendMessage(raw.key.remoteJid, { delete: raw.key })
    return true
  } catch (err) {
    console.log(`  \x1b[33m⚠\x1b[0m  Gagal menghapus pesan anti-swgc: ${err.message}`)
    return false
  }
}

function violationText(type, senderTag) {
  return [
    '╭─〔 ANTI SW GROUP 〕',
    '│',
    `│ Terdeteksi : *${type}*`,
    `│ Dari       : @${senderTag}`,
    '│',
    '│ Pesan telah dihapus otomatis.',
    '╰──────────────',
  ].join('\n')
}

export async function handleAntiSwGcMessage(conn, raw) {
  const groupId = asText(raw?.key?.remoteJid)
  if (!groupId.endsWith('@g.us')) return false
  if (raw?.key?.fromMe) return false
  if (!raw?.message) return false

  if (!getAntiSwGcStatus(groupId)) return false

  const detectedType = detectSwGcType(raw.message)
  if (!detectedType) return false

  const senderJid = asText(raw?.key?.participant || raw?.key?.participantAlt || raw?.participant || '')
  if (!senderJid) return false

  let metadata
  try {
    metadata = await conn.groupMetadata(groupId)
  } catch (err) {
    console.log(`  \x1b[33m⚠\x1b[0m  Metadata anti-swgc tidak tersedia: ${err.message}`)
    return false
  }

  if (await canBypass(conn, groupId, senderJid, metadata)) return false

  const botAdmin = await isBotAdmin(conn, groupId, metadata)
  if (!botAdmin) {
    await sendBotAdminNotice(conn, groupId)
    return false
  }

  const participant = findParticipant(metadata, senderJid)
  const targetJid = getParticipantJid(participant, senderJid) || senderJid
  const senderTag = targetJid.split('@')[0]

  await deleteMessage(conn, raw)
  await conn.sendMessage(groupId, { text: violationText(detectedType, senderTag), mentions: [targetJid] })

  return true
}

export function clearAntiSwGcCache(groupId = '') {
  if (groupId) {
    noticeCache.delete(`swgc:${groupId}`)
    return
  }
  noticeCache.clear()
}

export default { getAntiSwGcStatus, setAntiSwGcStatus, detectSwGcType, handleAntiSwGcMessage, clearAntiSwGcCache }
