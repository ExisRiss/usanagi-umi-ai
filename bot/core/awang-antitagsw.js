
import { getDb } from './awang-sqlite.js'
import { isOwner } from '../lib/awang-cekakses.js'
import { findParticipant, participantIsAdmin, getParticipantJid, isBotAdmin } from '../lib/awang-aksesgrub.js'

const noticeCache = new Map()

function asText(value) {
  return typeof value === 'string' ? value : ''
}

function hasStatusTag(message) {
  return Boolean(
    message?.groupStatusMentionMessage ||
    message?.statusMentionMessage ||
    message?.groupMentionedMessage
  )
}

export function getAntiTagSwStatus(groupId) {
  if (!groupId) return false
  const row = getDb().prepare('SELECT enabled FROM group_antitagsw WHERE chatId = ?').get(groupId)
  return Boolean(row?.enabled)
}

export function setAntiTagSwStatus(groupId, enabled) {
  if (!groupId) throw new Error('Group ID tidak valid')
  getDb()
    .prepare(`
      INSERT INTO group_antitagsw (chatId, enabled)
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
  const key = `tagsw:${groupId}`
  const last = noticeCache.get(key) || 0
  if (Date.now() - last < 30 * 60 * 1000) return
  noticeCache.set(key, Date.now())
  await conn.sendMessage(groupId, {
    text: [
      '╭─〔 ANTI TAG STATUS 〕',
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
    console.log(`  \x1b[33m⚠\x1b[0m  Gagal menghapus pesan anti-tagsw: ${err.message}`)
    return false
  }
}

function violationText(senderTag) {
  return [
    '╭─〔 ANTI TAG STATUS 〕',
    '│',
    `│ Tag status dari @${senderTag}`,
    '│ telah dihapus otomatis.',
    '╰──────────────',
  ].join('\n')
}

export async function handleAntiTagSwMessage(conn, raw) {
  const groupId = asText(raw?.key?.remoteJid)
  if (!groupId.endsWith('@g.us')) return false
  if (raw?.key?.fromMe) return false
  if (!raw?.message) return false

  if (!getAntiTagSwStatus(groupId)) return false
  if (!hasStatusTag(raw.message)) return false

  const senderJid = asText(raw?.key?.participant || raw?.key?.participantAlt || raw?.participant || '')
  if (!senderJid) return false

  let metadata
  try {
    metadata = await conn.groupMetadata(groupId)
  } catch (err) {
    console.log(`  \x1b[33m⚠\x1b[0m  Metadata anti-tagsw tidak tersedia: ${err.message}`)
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
  await conn.sendMessage(groupId, { text: violationText(senderTag), mentions: [targetJid] })

  return true
}

export function clearAntiTagSwCache(groupId = '') {
  if (groupId) {
    noticeCache.delete(`tagsw:${groupId}`)
    return
  }
  noticeCache.clear()
}

export default { getAntiTagSwStatus, setAntiTagSwStatus, handleAntiTagSwMessage, clearAntiTagSwCache }
