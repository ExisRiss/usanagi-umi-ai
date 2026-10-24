
import { getDb } from './awang-sqlite.js'

export function isChatBanned(groupId) {
  if (!groupId) return false
  const row = getDb().prepare('SELECT banned FROM group_banchat WHERE chatId = ?').get(groupId)
  return Boolean(row?.banned)
}

export function getChatBanInfo(groupId) {
  if (!groupId) return null
  const row = getDb().prepare('SELECT banned, updatedAt, updatedBy FROM group_banchat WHERE chatId = ?').get(groupId)
  if (!row) return null
  return { banned: Boolean(row.banned), updatedAt: row.updatedAt || 0, updatedBy: row.updatedBy || null }
}

export function setChatBanned(groupId, banned, updatedBy = null) {
  if (!groupId) throw new Error('Group ID tidak valid')
  getDb()
    .prepare(`
      INSERT INTO group_banchat (chatId, banned, updatedAt, updatedBy)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(chatId) DO UPDATE SET banned = excluded.banned, updatedAt = excluded.updatedAt, updatedBy = excluded.updatedBy
    `)
    .run(groupId, banned ? 1 : 0, Date.now(), updatedBy)
  return Boolean(banned)
}

export default { isChatBanned, getChatBanInfo, setChatBanned }
