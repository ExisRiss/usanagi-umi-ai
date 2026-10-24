/**
 * Regresi WhatsApp: memastikan adapter Telegram tidak merusak jalur lama.
 * Fokus pada hal yang bisa dibuktikan tanpa socket WhatsApp:
 *  - file inti bot tetap valid secara sintaks;
 *  - plugin WhatsApp yang disentuh fitur bersama (trading, tourl, menu, rpg)
 *    masih bisa diparse;
 *  - route API lama masih terdaftar di router yang sama.
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const BOT = path.resolve(import.meta.dirname, '..', '..')

/** Cek sintaks memakai compiler Node yang sebenarnya (dukung ESM penuh). */
function checkSyntax(relative) {
  const file = path.join(BOT, relative)
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' })
  assert.equal(result.status, 0, `${relative}: ${result.stderr.trim().split('\n').slice(0, 3).join(' ')}`)
}

test('file inti bot WhatsApp tetap valid', () => {
  for (const file of ['main.js', 'handler.js', 'index.js', 'lib/jadibot.js', 'lib/simple.js', 'lib/bot-config.js']) {
    checkSyntax(file)
  }
})

test('plugin WhatsApp yang berbagi service tetap valid', () => {
  for (const file of [
    'plugins/game/trading-umi.js',
    'plugins/game/trading-wa.js',
    'plugins/tools/tools-tourl.js',
    'plugins/main/usanagi-menu.js',
    'plugins/main/usanagi-allmenu.js',
    'plugins/owner/owner.js',
  ]) {
    if (!fs.existsSync(path.join(BOT, file))) continue
    checkSyntax(file)
  }
})

test('route API lama masih ada di router yang sama', () => {
  const source = fs.readFileSync(path.join(BOT, 'lib/jadibot-platform-api.js'), 'utf8')
  // Catatan: snapshot repo tertinggal dari server produksi (mis. /api/platform/rpg-koin
  // baru ada di file live). Yang diuji di sini adalah file yang ada di repo.
  for (const route of ['/api/backup/list', '/api/backup/create', '/api/backup/restore', '/api/platform/wallet-convert', '/api/sessions', '/api/health']) {
    assert.ok(source.includes(route), `route lama ${route} tidak boleh hilang`)
  }
  for (const route of ['/api/backup-system', '/api/platform-system']) {
    assert.ok(source.includes(route), `route baru ${route} terdaftar`)
  }
})

test('main.js memulai platform setelah HTTP API dan tetap memanggil fitur lama', () => {
  const source = fs.readFileSync(path.join(BOT, 'main.js'), 'utf8')
  const apiIndex = source.indexOf('startJadibotPlatformApi()')
  const platformIndex = source.indexOf('startPlatform()')
  assert.ok(apiIndex > 0 && platformIndex > apiIndex, 'platform start setelah HTTP API')
  for (const legacy of ['startBackupSystem()', 'installAutoBackup(global.conn)', 'startJadibotSessionCleaner()', 'startVercelBackupScheduler()']) {
    assert.ok(source.includes(legacy), `fitur lama ${legacy} tetap dipanggil`)
  }
})

test('tidak ada TODO/placeholder pada modul platform baru', () => {
  const dir = path.join(BOT, 'lib/platform')
  const walk = root => fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(root, entry.name)
    return entry.isDirectory() ? walk(full) : (entry.name.endsWith('.js') ? [full] : [])
  })
  for (const file of walk(dir)) {
    const source = fs.readFileSync(file, 'utf8')
    assert.equal(/TODO|FIXME|not implemented|Not implemented/i.test(source), false, `${path.relative(BOT, file)} masih berisi TODO`)
  }
})

test('tidak ada token hardcoded di modul platform', () => {
  const dir = path.join(BOT, 'lib/platform')
  const walk = root => fs.readdirSync(root, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(root, entry.name)
    return entry.isDirectory() ? walk(full) : (entry.name.endsWith('.js') ? [full] : [])
  })
  for (const file of walk(dir)) {
    const source = fs.readFileSync(file, 'utf8')
    assert.equal(/\b\d{8,12}:[A-Za-z0-9_-]{25,}\b/.test(source), false, `${path.relative(BOT, file)} memuat token bot hardcoded`)
  }
})
