/* By AlzRiss - Usanagi Umi AI
 *
 * Task83 — auto-backup dikirim ke group Telegram bot utama.
 *
 * Tes ini TIDAK menghubungi Telegram: hanya memeriksa resolusi tujuan
 * (token + chat id) dan perilaku skip saat tujuan belum dikonfigurasi.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const MODULE = path.resolve(HERE, '../lib/auto-backup.js')
const ORIGINAL_CWD = process.cwd()
const ENV_KEYS = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_BACKUP_CHAT_ID']

function tempRoot() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'umi-auto-backup-'))
  fs.mkdirSync(path.join(dir, 'data'), { recursive: true })
  fs.writeFileSync(path.join(dir, 'data', 'contoh.txt'), 'isi\n')
  return dir
}

function clearEnv() {
  for (const key of ENV_KEYS) delete process.env[key]
}

async function loadModule(root) {
  process.chdir(root)
  return import(`${MODULE}?case=${Date.now()}-${Math.random().toString(16).slice(2)}`)
}

test.afterEach(() => {
  process.chdir(ORIGINAL_CWD)
  clearEnv()
  delete global.autoBackup
})

test('token dan chat id dibaca dari berkas rahasia server', async () => {
  const root = tempRoot()
  fs.mkdirSync(path.join(root, '.secrets'), { recursive: true })
  fs.writeFileSync(path.join(root, '.secrets', 'task70-platform.env'), 'TELEGRAM_BOT_TOKEN=123:DUMMY\n')
  fs.writeFileSync(path.join(root, '.secrets', 'telegram.env'), 'TELEGRAM_BACKUP_CHAT_ID=-100777\n')
  clearEnv()
  global.autoBackup = { outputDirectory: 'out', minFreeBytes: 1 }
  const mod = await loadModule(root)
  const snapshot = await mod.autoBackupSnapshot()
  assert.equal(snapshot.telegram.configured, true)
  assert.equal(snapshot.telegram.tokenSet, true)
  assert.equal(snapshot.telegram.chatId, '-100777')
  assert.equal(snapshot.schedule, '00:00 Asia/Makassar')
})

test('environment proses menang atas berkas rahasia', async () => {
  const root = tempRoot()
  fs.mkdirSync(path.join(root, '.secrets'), { recursive: true })
  fs.writeFileSync(path.join(root, '.secrets', 'telegram.env'), 'TELEGRAM_BACKUP_CHAT_ID=-100777\n')
  process.env.TELEGRAM_BOT_TOKEN = '999:ENV'
  process.env.TELEGRAM_BACKUP_CHAT_ID = '-100888'
  global.autoBackup = { outputDirectory: 'out', minFreeBytes: 1 }
  const mod = await loadModule(root)
  const snapshot = await mod.autoBackupSnapshot()
  assert.equal(snapshot.telegram.chatId, '-100888')
})

test('config.js (global.autoBackup) menang atas environment', async () => {
  const root = tempRoot()
  process.env.TELEGRAM_BOT_TOKEN = '999:ENV'
  process.env.TELEGRAM_BACKUP_CHAT_ID = '-100888'
  global.autoBackup = { outputDirectory: 'out', minFreeBytes: 1, telegramChatId: '-100999' }
  const mod = await loadModule(root)
  const snapshot = await mod.autoBackupSnapshot()
  assert.equal(snapshot.telegram.chatId, '-100999')
})

test('tanpa tujuan Telegram backup dilewati tanpa menulis arsip', async () => {
  const root = tempRoot()
  clearEnv()
  global.autoBackup = { outputDirectory: 'out', minFreeBytes: 1 }
  const mod = await loadModule(root)
  const result = await mod.runFullBackup({ force: true, reason: 'test' })
  assert.deepEqual(result, { skipped: true, reason: 'telegram-not-configured' })
  assert.equal(fs.existsSync(path.join(root, 'out')), false, 'folder arsip tidak boleh dibuat saat tujuan belum siap')
})
