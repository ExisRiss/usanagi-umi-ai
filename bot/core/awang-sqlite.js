
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Database from 'better-sqlite3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_DIR = path.join(__dirname, '..', 'data', 'database')
const DB_PATH = path.join(DB_DIR, 'usanagi.sqlite')

let db = null

function applySchema(instance) {
  instance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      jid TEXT PRIMARY KEY,
      pushName TEXT,
      registeredAt INTEGER NOT NULL,
      limitCount INTEGER NOT NULL DEFAULT 10,
      limitResetAt INTEGER NOT NULL DEFAULT 0,
      premium INTEGER NOT NULL DEFAULT 0,
      welcomeSent INTEGER NOT NULL DEFAULT 0,
      welcomeClaimedAt INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS limit_reservations (
      id TEXT PRIMARY KEY,
      jid TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      expiresAt INTEGER NOT NULL,
      windowResetAt INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_limit_reservations_user_window
      ON limit_reservations (jid, windowResetAt, expiresAt);

    CREATE TABLE IF NOT EXISTS prefixes (
      chatId TEXT PRIMARY KEY,
      prefix TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS menu_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      style TEXT NOT NULL DEFAULT 'default' CHECK (style IN ('default', 'modern'))
    );

    CREATE TABLE IF NOT EXISTS anticall_status (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      enabled INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS group_welcome (
      chatId TEXT PRIMARY KEY,
      enabled INTEGER NOT NULL DEFAULT 0,
      goodbyeEnabled INTEGER NOT NULL DEFAULT 0,
      welcomeConfig TEXT,
      goodbyeConfig TEXT
    );

    CREATE TABLE IF NOT EXISTS group_antilink (
      chatId TEXT PRIMARY KEY,
      gc_enabled INTEGER NOT NULL DEFAULT 0,
      gc_mode TEXT NOT NULL DEFAULT '3x',
      ch_enabled INTEGER NOT NULL DEFAULT 0,
      ch_mode TEXT NOT NULL DEFAULT '3x'
    );

    CREATE TABLE IF NOT EXISTS group_antiswgc (
      chatId TEXT PRIMARY KEY,
      enabled INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS group_antitagsw (
      chatId TEXT PRIMARY KEY,
      enabled INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS group_banchat (
      chatId TEXT PRIMARY KEY,
      banned INTEGER NOT NULL DEFAULT 0,
      updatedAt INTEGER NOT NULL DEFAULT 0,
      updatedBy TEXT
    );

    CREATE TABLE IF NOT EXISTS owners (
      number TEXT PRIMARY KEY,
      addedAt INTEGER NOT NULL,
      addedBy TEXT
    );

    CREATE TABLE IF NOT EXISTS antilink_strikes (
      chatId TEXT NOT NULL,
      senderJid TEXT NOT NULL,
      type TEXT NOT NULL,
      strikes INTEGER NOT NULL DEFAULT 0,
      updatedAt INTEGER NOT NULL,
      PRIMARY KEY (chatId, senderJid, type)
    );

    CREATE TABLE IF NOT EXISTS group_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      groupId TEXT NOT NULL,
      mode TEXT NOT NULL CHECK (mode IN ('open', 'closed')),
      executeAt INTEGER NOT NULL,
      createdAt INTEGER NOT NULL,
      createdBy TEXT,
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'running', 'done', 'cancelled', 'failed')),
      attempts INTEGER NOT NULL DEFAULT 0,
      updatedAt INTEGER NOT NULL,
      lastError TEXT,
      runnerToken TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_group_schedules_status_time
      ON group_schedules (status, executeAt);

    CREATE INDEX IF NOT EXISTS idx_group_schedules_group
      ON group_schedules (groupId, status, executeAt);
  `)

  const userColumns = instance.prepare('PRAGMA table_info(users)').all()
  if (!userColumns.some((column) => column.name === 'limitCount')) {
    instance.exec('ALTER TABLE users ADD COLUMN limitCount INTEGER NOT NULL DEFAULT 10')
  }
  if (!userColumns.some((column) => column.name === 'limitResetAt')) {
    instance.exec('ALTER TABLE users ADD COLUMN limitResetAt INTEGER NOT NULL DEFAULT 0')
  }
  if (!userColumns.some((column) => column.name === 'premium')) {
    instance.exec('ALTER TABLE users ADD COLUMN premium INTEGER NOT NULL DEFAULT 0')
  }

  if (!userColumns.some((column) => column.name === 'welcomeSent')) {
    instance.exec('ALTER TABLE users ADD COLUMN welcomeSent INTEGER NOT NULL DEFAULT 0')
  }
  if (!userColumns.some((column) => column.name === 'welcomeClaimedAt')) {
    instance.exec('ALTER TABLE users ADD COLUMN welcomeClaimedAt INTEGER NOT NULL DEFAULT 0')
  }

  const groupAntiLinkColumns = instance.prepare('PRAGMA table_info(group_antilink)').all()
  if (!groupAntiLinkColumns.some((column) => column.name === 'gc_mode')) {
    instance.exec("ALTER TABLE group_antilink ADD COLUMN gc_mode TEXT NOT NULL DEFAULT '3x'")
  }
  if (!groupAntiLinkColumns.some((column) => column.name === 'ch_mode')) {
    instance.exec("ALTER TABLE group_antilink ADD COLUMN ch_mode TEXT NOT NULL DEFAULT '3x'")
  }

  const groupWelcomeColumns = instance.prepare('PRAGMA table_info(group_welcome)').all()
  if (!groupWelcomeColumns.some((column) => column.name === 'goodbyeEnabled')) {
    instance.exec('ALTER TABLE group_welcome ADD COLUMN goodbyeEnabled INTEGER NOT NULL DEFAULT 0')
    instance.exec('UPDATE group_welcome SET goodbyeEnabled = enabled')
  }
  if (!groupWelcomeColumns.some((column) => column.name === 'welcomeConfig')) {
    instance.exec('ALTER TABLE group_welcome ADD COLUMN welcomeConfig TEXT')
  }
  if (!groupWelcomeColumns.some((column) => column.name === 'goodbyeConfig')) {
    instance.exec('ALTER TABLE group_welcome ADD COLUMN goodbyeConfig TEXT')
  }

  const groupScheduleColumns = instance.prepare('PRAGMA table_info(group_schedules)').all()
  if (!groupScheduleColumns.some((column) => column.name === 'runnerToken')) {
    instance.exec('ALTER TABLE group_schedules ADD COLUMN runnerToken TEXT')
  }
}

function readLegacyJson(filePath) {
  if (!fs.existsSync(filePath)) return null

  try {
    const raw = fs.readFileSync(filePath, 'utf-8').trim()
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.log(`  \x1b[33m⚠\x1b[0m  Gagal baca database lama "${path.basename(filePath)}": ${err.message}`)
    return null
  }
}

function markMigrated(filePath) {
  try {
    fs.renameSync(filePath, `${filePath}.migrated`)
  } catch {

  }
}

function migrateLegacyData(instance) {
  const userCount = instance.prepare('SELECT COUNT(*) AS total FROM users').get().total
  const usersJsonPath = path.join(DB_DIR, 'users.json')

  if (userCount === 0) {
    const legacyUsers = readLegacyJson(usersJsonPath)
    if (legacyUsers && Object.keys(legacyUsers).length) {
      const insertUser = instance.prepare(
        'INSERT OR IGNORE INTO users (jid, pushName, registeredAt) VALUES (?, ?, ?)'
      )
      const insertMany = instance.transaction((entries) => {
        for (const [jid, data] of entries) {
          insertUser.run(jid, data?.pushName ?? null, data?.registeredAt ?? Date.now())
        }
      })
      insertMany(Object.entries(legacyUsers))
      console.log(`  \x1b[32m✓\x1b[0m  Migrasi database: ${Object.keys(legacyUsers).length} user dipindah dari users.json ke SQLite`)
    }
  }
  if (fs.existsSync(usersJsonPath)) markMigrated(usersJsonPath)

  const prefixCount = instance.prepare('SELECT COUNT(*) AS total FROM prefixes').get().total
  const prefixJsonPath = path.join(DB_DIR, 'prefix.json')

  if (prefixCount === 0) {
    const legacyPrefixes = readLegacyJson(prefixJsonPath)
    if (legacyPrefixes && Object.keys(legacyPrefixes).length) {
      const insertPrefix = instance.prepare(
        'INSERT OR IGNORE INTO prefixes (chatId, prefix) VALUES (?, ?)'
      )
      const insertMany = instance.transaction((entries) => {
        for (const [chatId, prefix] of entries) {
          insertPrefix.run(chatId, prefix)
        }
      })
      insertMany(Object.entries(legacyPrefixes))
      console.log(`  \x1b[32m✓\x1b[0m  Migrasi database: ${Object.keys(legacyPrefixes).length} prefix custom dipindah dari prefix.json ke SQLite`)
    }
  }
  if (fs.existsSync(prefixJsonPath)) markMigrated(prefixJsonPath)
}

export function getDb() {
  if (db) return db

  fs.mkdirSync(DB_DIR, { recursive: true })

  db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  applySchema(db)
  migrateLegacyData(db)

  return db
}

export default { getDb }
