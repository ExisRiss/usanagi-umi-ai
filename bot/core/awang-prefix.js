
import { settings } from '../config/settings.js'
import { getDb } from './awang-sqlite.js'

export async function getActivePrefix(chatId, defaultPrefix = settings.defaultPrefix) {
  const db = getDb()
  const row = db.prepare('SELECT prefix FROM prefixes WHERE chatId = ?').get(chatId)
  return row?.prefix || defaultPrefix || settings.defaultPrefix
}

export async function setPrefix(chatId, newPrefix) {
  const db = getDb()
  db.prepare(
    'INSERT INTO prefixes (chatId, prefix) VALUES (?, ?) ON CONFLICT(chatId) DO UPDATE SET prefix = excluded.prefix'
  ).run(chatId, newPrefix)
  return newPrefix
}

export async function resetPrefix(chatId, defaultPrefix = settings.defaultPrefix) {
  const db = getDb()
  db.prepare('DELETE FROM prefixes WHERE chatId = ?').run(chatId)
  return defaultPrefix || settings.defaultPrefix
}

// Menyamakan prefix bot utama satu kali per revision. Prefix Jadibot memakai
// namespace "jadibot:<nomor>:" sehingga tidak ikut berubah.
export function clearScopedPrefixes(scope) {
  const value = String(scope || '').trim()
  if (!value || value === 'main') return 0
  const db = getDb()
  return db.prepare('DELETE FROM prefixes WHERE chatId LIKE ?').run(`${value}:%`).changes
}

export function syncMainPrefix(defaultPrefix, revision) {
  const prefix = String(defaultPrefix || '').slice(0, 3)
  const version = String(revision || '').trim()
  if (!prefix || !version) return false

  const db = getDb()
  db.exec(`
    CREATE TABLE IF NOT EXISTS runtime_config_migrations (
      key TEXT PRIMARY KEY,
      appliedAt INTEGER NOT NULL
    )
  `)
  const key = `main-prefix:${version}`
  if (db.prepare('SELECT 1 FROM runtime_config_migrations WHERE key = ?').get(key)) return false

  db.transaction(() => {
    db.prepare("UPDATE prefixes SET prefix = ? WHERE chatId NOT LIKE 'jadibot:%'").run(prefix)
    db.prepare('INSERT INTO runtime_config_migrations (key, appliedAt) VALUES (?, ?)').run(key, Date.now())
  })()
  return true
}

export default { getActivePrefix, setPrefix, resetPrefix, clearScopedPrefixes, syncMainPrefix }
