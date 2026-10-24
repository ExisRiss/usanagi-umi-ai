
import path from 'path'
import fs from 'fs'
import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { initAuthCreds, BufferJSON, proto } from '@rexxhayanasi/elaina-baileys'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const SESSION_DIR = path.join(__dirname, '..', 'sessions')
export const SESSION_DB = path.join(SESSION_DIR, 'auth.db')
const LEGACY_DB = path.join(__dirname, '..', 'sessions.sqlite')

let db = null
let lock = Promise.resolve()

const ALLOWED_KEYS = new Set([
  'pre-key',
  'session',
  'sender-key',
  'app-state-sync-key',
  'app-state-sync-version',
])

function withLock(task) {
  const next = lock.then(task, task)
  lock = next.catch(() => {})
  return next
}

function getDb() {
  if (db) return db

  fs.mkdirSync(SESSION_DIR, { recursive: true })

  db = new Database(SESSION_DB)
  db.pragma('journal_mode = WAL')
  db.pragma('synchronous = NORMAL')
  db.pragma('temp_store = MEMORY')
  db.pragma('foreign_keys = ON')
  db.pragma('busy_timeout = 5000')

  db.exec(`
    CREATE TABLE IF NOT EXISTS creds (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      data TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS keys (
      category TEXT NOT NULL,
      id TEXT NOT NULL,
      data TEXT,
      updated_at INTEGER NOT NULL,
      PRIMARY KEY (category, id)
    );

    CREATE INDEX IF NOT EXISTS idx_keys_category
      ON keys(category);
  `)

  migrateLegacySession()
  return db
}

function migrateLegacySession() {
  if (!fs.existsSync(LEGACY_DB)) return

  try {
    const legacy = new Database(LEGACY_DB, { readonly: true })
    const hasAuth = legacy
      .prepare(`SELECT 1 FROM sqlite_master WHERE type='table' AND name='auth'`)
      .get()

    if (!hasAuth) {
      legacy.close()
      return
    }

    const currentHasCreds = db
      .prepare('SELECT 1 FROM creds WHERE id = 1')
      .get()

    if (currentHasCreds) {
      legacy.close()
      return
    }

    const rows = legacy.prepare('SELECT id, data FROM auth').all()
    const insertCreds = db.prepare(`
      INSERT OR IGNORE INTO creds (id, data, updated_at)
      VALUES (1, ?, ?)
    `)
    const insertKey = db.prepare(`
      INSERT OR IGNORE INTO keys (category, id, data, updated_at)
      VALUES (?, ?, ?, ?)
    `)

    const now = Date.now()
    const migrate = db.transaction(() => {
      for (const row of rows) {
        if (row.id === 'creds') {
          insertCreds.run(row.data, now)
          continue
        }

        const category = [...ALLOWED_KEYS]
          .sort((a, b) => b.length - a.length)
          .find((name) => row.id.startsWith(`${name}-`))

        if (category) {
          const id = row.id.slice(category.length + 1)
          insertKey.run(category, id, row.data, now)
        }
      }
    })

    migrate()
    legacy.close()
    console.log('  \x1b[32m✓\x1b[0m Sesi lama Usanagi berhasil dimigrasikan ke sessions/auth.db')
  } catch (err) {
    console.error('  \x1b[33m!\x1b[0m Gagal migrasi sessions.sqlite:', err?.message || err)
  }
}

const readCreds = async () =>
  withLock(() => {
    const row = getDb().prepare('SELECT data FROM creds WHERE id = 1').get()
    return row ? JSON.parse(row.data, BufferJSON.reviver) : null
  })

const writeCreds = async (creds) =>
  withLock(() => {
    getDb()
      .prepare(`
        INSERT INTO creds (id, data, updated_at)
        VALUES (1, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          data = excluded.data,
          updated_at = excluded.updated_at
      `)
      .run(JSON.stringify(creds, BufferJSON.replacer), Date.now())
  })

const readKey = async (category, id) =>
  withLock(() => {
    const row = getDb()
      .prepare('SELECT data FROM keys WHERE category = ? AND id = ?')
      .get(category, id)

    if (!row) return null

    let value = JSON.parse(row.data, BufferJSON.reviver)

    if (category === 'app-state-sync-key') {
      value = proto.Message.AppStateSyncKeyData.fromObject(value)
    }

    return value
  })

const writeKey = async (category, id, value) =>
  withLock(() => {
    getDb()
      .prepare(`
        INSERT INTO keys (category, id, data, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(category, id) DO UPDATE SET
          data = excluded.data,
          updated_at = excluded.updated_at
      `)
      .run(category, id, JSON.stringify(value, BufferJSON.replacer), Date.now())
  })

const removeKey = async (category, id) =>
  withLock(() => {
    getDb()
      .prepare('DELETE FROM keys WHERE category = ? AND id = ?')
      .run(category, id)
  })

export async function useSQLiteAuthState() {
  const creds = (await readCreds()) || initAuthCreds()

  const keys = {
    get: async (type, ids) => {
      const result = {}

      for (const id of ids) {
        result[id] = await readKey(type, id)
      }

      return result
    },

    set: async (data) => {
      const tasks = []

      for (const category of Object.keys(data)) {
        if (!ALLOWED_KEYS.has(category)) continue

        for (const id of Object.keys(data[category])) {
          const value = data[category][id]

          tasks.push(
            value
              ? writeKey(category, id, value)
              : removeKey(category, id)
          )
        }
      }

      await Promise.all(tasks)
    },
  }

  return {
    state: { creds, keys },
    saveCreds: () => writeCreds(creds),
  }
}

export function ensureSessionDir() {
  getDb()
  return SESSION_DB
}

export function sessionExists() {
  const row = getDb().prepare('SELECT 1 FROM creds WHERE id = 1').get()
  return Boolean(row)
}

export function clearSession() {
  getDb().exec('DELETE FROM creds; DELETE FROM keys;')
}

export function closeSessionDb() {
  if (!db) return
  try {
    db.pragma('wal_checkpoint(TRUNCATE)')
  } catch {}
  db.close()
  db = null
}

export default {
  SESSION_DIR,
  SESSION_DB,
  ensureSessionDir,
  sessionExists,
  clearSession,
  closeSessionDb,
  useSQLiteAuthState,
}
