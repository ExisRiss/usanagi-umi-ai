
import { getDb } from './awang-sqlite.js'

const PRIVATE_WELCOME_CLAIM_TTL_MS = 300000
const DEFAULT_WELCOME_ENABLED = 1
const DEFAULT_GOODBYE_ENABLED = 1

export function isWelcomeEnabled(groupId) {
  if (!groupId) return false
  const row = getDb().prepare('SELECT enabled FROM group_welcome WHERE chatId = ?').get(groupId)
  return row ? Boolean(row.enabled) : Boolean(DEFAULT_WELCOME_ENABLED)
}

export function setWelcomeEnabled(groupId, enabled) {
  if (!groupId) throw new Error('Group ID tidak valid')
  getDb()
    .prepare(`
      INSERT INTO group_welcome (chatId, enabled, goodbyeEnabled)
      VALUES (?, ?, COALESCE((SELECT goodbyeEnabled FROM group_welcome WHERE chatId = ?), ?))
      ON CONFLICT(chatId) DO UPDATE SET enabled = excluded.enabled
    `)
    .run(groupId, enabled ? 1 : 0, groupId, DEFAULT_GOODBYE_ENABLED)

  return Boolean(enabled)
}

// Returns only groups that were explicitly enabled through the modern
// /welcome setting. The main participant listener uses this during startup
// to bridge existing SQLite settings to its established event flag.
export function getExplicitlyEnabledWelcomeGroups() {
  return getDb()
    .prepare('SELECT chatId FROM group_welcome WHERE enabled = 1')
    .all()
    .map((row) => String(row?.chatId || '').trim())
    .filter((chatId) => chatId.endsWith('@g.us'))
}

export function isGoodbyeEnabled(groupId) {
  if (!groupId) return false
  const row = getDb().prepare('SELECT goodbyeEnabled FROM group_welcome WHERE chatId = ?').get(groupId)
  return row ? Boolean(row.goodbyeEnabled) : Boolean(DEFAULT_GOODBYE_ENABLED)
}

export function setGoodbyeEnabled(groupId, enabled) {
  if (!groupId) throw new Error('Group ID tidak valid')
  getDb()
    .prepare(`
      INSERT INTO group_welcome (chatId, enabled, goodbyeEnabled)
      VALUES (?, COALESCE((SELECT enabled FROM group_welcome WHERE chatId = ?), ?), ?)
      ON CONFLICT(chatId) DO UPDATE SET goodbyeEnabled = excluded.goodbyeEnabled
    `)
    .run(groupId, groupId, DEFAULT_WELCOME_ENABLED, enabled ? 1 : 0)

  return Boolean(enabled)
}

export function getWelcomeStatus(groupId) {
  return isWelcomeEnabled(groupId)
}

export function getGoodbyeStatus(groupId) {
  return isGoodbyeEnabled(groupId)
}

export function claimPrivateWelcome(jid, now = Date.now()) {
  if (!jid) return 0
  const staleBefore = now - PRIVATE_WELCOME_CLAIM_TTL_MS
  const result = getDb()
    .prepare(`
      UPDATE users
      SET welcomeClaimedAt = ?
      WHERE jid = ?
        AND welcomeSent = 0
        AND (welcomeClaimedAt = 0 OR welcomeClaimedAt <= ?)
    `)
    .run(now, jid, staleBefore)

  return result.changes === 1 ? now : 0
}

export function finalizePrivateWelcome(jid, claimAt) {
  if (!jid || !claimAt) return false
  const result = getDb()
    .prepare(`
      UPDATE users
      SET welcomeSent = 1,
          welcomeClaimedAt = 0
      WHERE jid = ?
        AND welcomeSent = 0
        AND welcomeClaimedAt = ?
    `)
    .run(jid, claimAt)

  return result.changes === 1
}

export function releasePrivateWelcome(jid, claimAt) {
  if (!jid || !claimAt) return false
  const result = getDb()
    .prepare(`
      UPDATE users
      SET welcomeClaimedAt = 0
      WHERE jid = ?
        AND welcomeSent = 0
        AND welcomeClaimedAt = ?
    `)
    .run(jid, claimAt)

  return result.changes === 1
}

export async function resetPrivateWelcomeForChat(chat, conn) {
  const value = String(chat || '').trim()
  if (!value || value === 'status@broadcast' || value.endsWith('@g.us') || value.endsWith('@newsletter')) return 0

  const jids = new Set([value])
  const mapping = conn?.signalRepository?.lidMapping

  try {
    if (value.endsWith('@lid') && typeof mapping?.getPNForLID === 'function') {
      const pn = await mapping.getPNForLID(value)
      if (pn) jids.add(String(pn))
    } else if (value.endsWith('@s.whatsapp.net') && typeof mapping?.getLIDForPN === 'function') {
      const lid = await mapping.getLIDForPN(value)
      if (lid) jids.add(String(lid))
    }
  } catch {

  }

  let changes = 0
  for (const jid of jids) {
    if (resetPrivateWelcome(jid)) changes += 1
  }

  return changes
}

function resetPrivateWelcome(jid) {
  if (!jid) return false
  const result = getDb()
    .prepare(`
      UPDATE users
      SET welcomeSent = 0,
          welcomeClaimedAt = 0
      WHERE jid = ?
    `)
    .run(jid)

  return result.changes === 1
}

export default {
  isWelcomeEnabled,
  setWelcomeEnabled,
  getExplicitlyEnabledWelcomeGroups,
  isGoodbyeEnabled,
  setGoodbyeEnabled,
  getWelcomeStatus,
  getGoodbyeStatus,
  claimPrivateWelcome,
  finalizePrivateWelcome,
  releasePrivateWelcome,
  resetPrivateWelcomeForChat,
}
