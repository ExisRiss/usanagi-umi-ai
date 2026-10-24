/* Fixture bersama untuk tes sistem backup. */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { backupConfig } from '../../lib/backup/config.js'

export function tempDir(prefix = 'umi-backup-test-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix))
}

export function write(file, content) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
  return file
}

/** Siapkan struktur mirip server bot sungguhan. */
export async function makeFixture(root = tempDir()) {
  const sqlitePath = path.join(root, 'data', 'database', 'usanagi.sqlite')
  fs.mkdirSync(path.dirname(sqlitePath), { recursive: true })
  const { default: Database } = await import('better-sqlite3')
  const db = new Database(sqlitePath)
  db.exec('CREATE TABLE users (jid TEXT PRIMARY KEY, name TEXT, coins INTEGER)')
  const insert = db.prepare('INSERT INTO users (jid, name, coins) VALUES (?, ?, ?)')
  insert.run('628111@s.whatsapp.net', 'Alz', 100)
  insert.run('628222@s.whatsapp.net', 'Riss', 250)
  insert.run('628333@s.whatsapp.net', 'Umi', 500)
  db.close()

  write(path.join(root, 'database.json'), JSON.stringify({ users: { a: 1 }, chats: [] }))
  write(path.join(root, 'data', 'jadibot-platform.json'), JSON.stringify({ sessions: { '628111': { status: 'connected' } } }))
  write(path.join(root, 'data', 'plugin-state.json'), JSON.stringify({ welcome: true }))
  write(path.join(root, 'sessions', 'jadibot', '628111', 'bot-config.json'), JSON.stringify({ ownerNumbers: ['628111'], prefix: '.' }))
  write(path.join(root, 'sessions', 'jadibot', '628111', 'plugins', 'custom.js'), 'export default {}')
  write(path.join(root, 'sessions', 'jadibot', '628111', 'creds.json'), JSON.stringify({ me: { id: 'rahasia' } }))
  write(path.join(root, '.env'), 'TELEGRAM_BOT_TOKEN=123:abc')
  write(path.join(root, 'webgame.json'), JSON.stringify({ token: 'rahasia' }))
  write(path.join(root, 'node_modules', 'skip-me.js'), 'x')
  write(path.join(root, 'tmp', 'junk.bin'), 'x')
  return { root, sqlitePath }
}

export function config(root, overrides = {}) {
  const base = backupConfig(root)
  return {
    ...base,
    root: path.join(root, 'data', 'backup-system'),
    intervalMinutes: 10,
    encryption: { enabled: false, key: '', algorithm: 'aes-256-gcm' },
    telegram: { ...base.telegram, token: '', adminIds: [], notifyOnSuccess: false },
    external: { ...base.external, backend: 'none', mode: 'hourly' },
    ...overrides,
  }
}

export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))
