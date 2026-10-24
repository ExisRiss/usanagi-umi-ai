/**
 * Daftar chat Telegram yang pernah melihat bot (grup, supergrup, kanal, pribadi).
 *
 * Kenapa perlu: Bot API tidak punya endpoint "daftar chat saya", sedangkan
 * pengiriman berkas (sendDocument) wajib menyebut `chat_id` numerik. Dengan
 * mencatat setiap update yang masuk, admin bisa mengarahkan bot mengirim arsip
 * ke grup yang benar tanpa menebak ID atau meminta pengguna mencarinya manual.
 */
import { platformDb } from './db.js'

const GROUP_TYPES = new Set(['group', 'supergroup', 'channel'])

export function recordChat(chat) {
  if (!chat?.id) return null
  const db = platformDb()
  const id = String(chat.id)
  const type = String(chat.type || 'unknown')
  const title = chat.title ? String(chat.title).slice(0, 200) : null
  const username = chat.username ? String(chat.username).slice(0, 100) : null
  const now = Date.now()
  db.prepare(`INSERT INTO platform_chats(chat_id, type, title, username, first_seen_at, last_seen_at)
    VALUES (?,?,?,?,?,?)
    ON CONFLICT(chat_id) DO UPDATE SET type=excluded.type, title=COALESCE(excluded.title, title),
      username=COALESCE(excluded.username, username), last_seen_at=excluded.last_seen_at`)
    .run(id, type, title, username, now, now)
  return { chatId: id, type, title, username }
}

export function listChats({ type = null, limit = 50 } = {}) {
  const db = platformDb()
  const where = type ? 'WHERE type = ?' : ''
  const params = type ? [String(type)] : []
  return db.prepare(`SELECT * FROM platform_chats ${where} ORDER BY last_seen_at DESC LIMIT ?`)
    .all(...params, Math.min(Math.max(Number(limit) || 50, 1), 200))
    .map(row => ({
      chatId: row.chat_id,
      type: row.type,
      title: row.title,
      username: row.username,
      isGroup: GROUP_TYPES.has(row.type),
      firstSeenAt: new Date(row.first_seen_at).toISOString(),
      lastSeenAt: new Date(row.last_seen_at).toISOString(),
    }))
}

/** Cari grup berdasarkan judul (mis. "BackUp") — hanya chat yang pernah terlihat. */
export function findChatByTitle(title) {
  const needle = String(title || '').trim().toLowerCase()
  if (!needle) return null
  return listChats({ limit: 200 }).find(chat => chat.isGroup && String(chat.title || '').toLowerCase() === needle) || null
}

export function getChat(chatId) {
  const row = platformDb().prepare('SELECT * FROM platform_chats WHERE chat_id = ?').get(String(chatId))
  return row ? { chatId: row.chat_id, type: row.type, title: row.title, username: row.username, isGroup: GROUP_TYPES.has(row.type) } : null
}
