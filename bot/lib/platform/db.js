/**
 * Skema & koneksi database platform lintas-aplikasi (WhatsApp + Telegram).
 *
 * Memakai SQLite yang SAMA dengan RPG (`core/awang-sqlite.js`) supaya:
 *  - satu sumber data, tidak ada database kedua;
 *  - migrasi aditif: hanya `CREATE TABLE IF NOT EXISTS` + `ADD COLUMN` yang dicek,
 *    tidak ada DROP/ALTER destruktif terhadap tabel lama.
 *
 * Semua tabel baru berprefix `platform_` agar tidak bentrok dengan tabel bot lama.
 */
import { getDb } from '../../core/awang-sqlite.js'

export const SCHEMA_VERSION = 3

const MIGRATIONS = [
  {
    version: 1,
    statements: [
      `CREATE TABLE IF NOT EXISTS platform_users (
        id TEXT PRIMARY KEY,
        source TEXT NOT NULL DEFAULT 'telegram',
        email TEXT,
        display_name TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        status TEXT NOT NULL DEFAULT 'active',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS platform_users_email ON platform_users(email) WHERE email IS NOT NULL`,
      `CREATE TABLE IF NOT EXISTS platform_identities (
        platform TEXT NOT NULL,
        platform_user_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        whatsapp_jid TEXT,
        username TEXT,
        verified_via TEXT NOT NULL DEFAULT 'auto',
        linked_at INTEGER NOT NULL,
        last_seen_at INTEGER,
        PRIMARY KEY (platform, platform_user_id)
      )`,
      `CREATE INDEX IF NOT EXISTS platform_identities_user ON platform_identities(user_id)`,
      `CREATE TABLE IF NOT EXISTS platform_link_codes (
        code_hash TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        whatsapp_jid TEXT,
        label TEXT,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        used_at INTEGER,
        used_platform TEXT,
        used_platform_user_id TEXT,
        attempts INTEGER NOT NULL DEFAULT 0
      )`,
      `CREATE INDEX IF NOT EXISTS platform_link_codes_user ON platform_link_codes(user_id)`,
      `CREATE TABLE IF NOT EXISTS telegram_bots (
        id TEXT PRIMARY KEY,
        owner_user_id TEXT NOT NULL,
        scope TEXT NOT NULL DEFAULT 'user',
        label TEXT NOT NULL,
        token_cipher TEXT NOT NULL,
        bot_id TEXT,
        username TEXT,
        first_name TEXT,
        enabled INTEGER NOT NULL DEFAULT 0,
        mode TEXT NOT NULL DEFAULT 'polling',
        webhook_url TEXT,
        webhook_secret TEXT,
        status TEXT NOT NULL DEFAULT 'unconfigured',
        last_error TEXT,
        last_checked_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,
      `CREATE UNIQUE INDEX IF NOT EXISTS telegram_bots_bot_id ON telegram_bots(bot_id) WHERE bot_id IS NOT NULL`,
      `CREATE TABLE IF NOT EXISTS telegram_updates (
        bot_id TEXT NOT NULL,
        update_id INTEGER NOT NULL,
        seen_at INTEGER NOT NULL,
        PRIMARY KEY (bot_id, update_id)
      )`,
      `CREATE TABLE IF NOT EXISTS server_slots (
        slot INTEGER PRIMARY KEY CHECK (slot BETWEEN 1 AND 10),
        enabled INTEGER NOT NULL DEFAULT 0,
        name TEXT,
        host TEXT,
        port INTEGER,
        connection_type TEXT NOT NULL DEFAULT 'panel',
        credential_ref TEXT,
        panel_server_id TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS platform_audit (
        id TEXT PRIMARY KEY,
        at INTEGER NOT NULL,
        actor_user_id TEXT,
        actor_platform TEXT,
        actor_platform_user_id TEXT,
        action TEXT NOT NULL,
        resource TEXT,
        result TEXT NOT NULL DEFAULT 'ok',
        meta TEXT,
        correlation_id TEXT
      )`,
      `CREATE INDEX IF NOT EXISTS platform_audit_at ON platform_audit(at DESC)`,
      `CREATE INDEX IF NOT EXISTS platform_audit_actor ON platform_audit(actor_user_id, at DESC)`,
      `CREATE TABLE IF NOT EXISTS platform_idempotency (
        key TEXT PRIMARY KEY,
        created_at INTEGER NOT NULL,
        result TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS integration_health (
        name TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        detail TEXT,
        checked_at INTEGER NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS platform_media (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        platform TEXT,
        name TEXT,
        mime TEXT NOT NULL,
        bytes INTEGER NOT NULL,
        sha256 TEXT NOT NULL,
        path TEXT NOT NULL,
        is_public INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        expires_at INTEGER,
        deleted_at INTEGER
      )`,
      `CREATE INDEX IF NOT EXISTS platform_media_user ON platform_media(user_id, created_at DESC)`,
      `CREATE TABLE IF NOT EXISTS platform_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`,
    ],
  },
  {
    version: 2,
    statements: [
      // Tombol inline Telegram: aksi diikat ke pemiliknya, sekali pakai, kedaluwarsa.
      `CREATE TABLE IF NOT EXISTS platform_callbacks (
        token TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        platform_user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        payload TEXT,
        created_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL,
        used_at INTEGER
      )`,
      `CREATE INDEX IF NOT EXISTS platform_callbacks_user ON platform_callbacks(platform, platform_user_id, created_at DESC)`,
      // Idempotensi job lintas restart (mis. klaim hadiah, order saham).
      `CREATE TABLE IF NOT EXISTS platform_jobs (
        id TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        result TEXT
      )`,
    ],
  },
  {
    version: 3,
    statements: [
      // Chat Telegram yang pernah dilihat bot (grup/channel/pribadi). Dipakai
      // untuk mengirim berkas ke grup arsip tanpa menebak chat id.
      `CREATE TABLE IF NOT EXISTS platform_chats (
        chat_id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT,
        username TEXT,
        first_seen_at INTEGER NOT NULL,
        last_seen_at INTEGER NOT NULL
      )`,
      `CREATE INDEX IF NOT EXISTS platform_chats_type ON platform_chats(type, last_seen_at DESC)`,
    ],
  },
]

function ensureColumn(db, table, column, ddl) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all().map(row => row.name)
  if (!columns.includes(column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`)
}

/**
 * Jalankan migrasi aditif. Aman dipanggil berulang (idempotent).
 * @returns {{version:number, applied:number[]}}
 */
export function migrate(db = getDb()) {
  db.exec('CREATE TABLE IF NOT EXISTS platform_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)')
  const current = Number(db.prepare("SELECT value FROM platform_meta WHERE key='schema_version'").get()?.value || 0)
  const applied = []
  db.transaction(() => {
    for (const migration of MIGRATIONS) {
      if (migration.version <= current) continue
      for (const statement of migration.statements) db.exec(statement)
      db.prepare("INSERT OR REPLACE INTO platform_meta VALUES('schema_version', ?)").run(String(migration.version))
      applied.push(migration.version)
    }
    // Kolom yang ditambahkan belakangan (dicek agar tidak error saat upgrade).
    ensureColumn(db, 'platform_identities', 'whatsapp_jid', 'TEXT')
    ensureColumn(db, 'platform_identities', 'username', 'TEXT')
    ensureColumn(db, 'platform_users', 'email', 'TEXT')
    // Bot Telegram milik pengguna bisa dihubungkan ke bot WhatsApp miliknya
    // sendiri (nomor jadibot). Migrasi aditif, bukan tabel baru.
    ensureColumn(db, 'telegram_bots', 'wa_number', 'TEXT')
    ensureColumn(db, 'telegram_bots', 'wa_linked_at', 'INTEGER')
  })()
  return { version: Math.max(current, ...MIGRATIONS.map(item => item.version)), applied }
}

let migrated = null
let injected = null

/**
 * Hook khusus pengujian: pakai database terpisah (mis. `:memory:`).
 * Tidak dipakai di produksi.
 */
export function setPlatformDbForTests(db) {
  injected = db
  migrated = null
}

/** Koneksi utama + migrasi sekali per proses. */
export function platformDb() {
  const db = injected || getDb()
  if (!migrated) migrated = migrate(db)
  return db
}

export function schemaInfo(db = null) {
  const target = db || platformDb()
  migrate(target)
  const version = Number(target.prepare("SELECT value FROM platform_meta WHERE key='schema_version'").get()?.value || 0)
  const owned = ['platform_users', 'platform_identities', 'platform_link_codes', 'telegram_bots', 'telegram_updates',
    'server_slots', 'platform_audit', 'platform_idempotency', 'integration_health', 'platform_media',
    'platform_meta', 'platform_callbacks', 'platform_jobs']
  const tables = target.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name IN (${owned.map(() => '?').join(',')}) ORDER BY name`)
    .all(...owned).map(row => row.name)
  return { version, tables }
}
