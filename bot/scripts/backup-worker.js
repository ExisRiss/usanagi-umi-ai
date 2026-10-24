#!/usr/bin/env node
/**
 * Worker backup mandiri.
 *
 * Dipakai bila ingin menjalankan scheduler di proses terpisah dari bot
 * (mis. systemd di VPS). Di panel Pterodactyl cukup biarkan main.js yang
 * menyalakannya; jangan jalankan keduanya bersamaan untuk target yang sama —
 * lock berbasis berkas akan menolak, tetapi lebih baik pilih satu.
 *
 * Contoh:
 *   node scripts/backup-worker.js                # scheduler + Telegram
 *   node scripts/backup-worker.js --once         # satu backup lalu keluar
 *   node scripts/backup-worker.js --once full    # pilih jenis backup
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(ROOT)

const { backupConfig } = await import('../lib/backup/config.js')
const { runBackup } = await import('../lib/backup/pipeline.js')
const { startBackupSystem, stopBackupSystem, snapshot } = await import('../lib/backup/service.js')
const { logEvent } = await import('../lib/backup/log.js')

const args = process.argv.slice(2)
const once = args.includes('--once')
const type = args.find(arg => ['full', 'database', 'config', 'files'].includes(arg)) || 'full'
const cfg = backupConfig(ROOT)

if (once) {
  try {
    const record = await runBackup(cfg, { type, reason: 'cli', actor: 'backup-worker' })
    console.log(JSON.stringify({ ok: true, id: record.id, bytes: record.sizeBytes, verify: record.verifyStatus }, null, 2))
    process.exit(0)
  } catch (error) {
    logEvent(cfg, { level: 'error', type: 'worker', message: `Backup CLI gagal: ${error.message}` })
    console.error(JSON.stringify({ ok: false, error: error.message }, null, 2))
    process.exit(1)
  }
}

await startBackupSystem()
console.log(JSON.stringify(snapshot(), null, 2))
logEvent(cfg, { level: 'info', type: 'worker', message: 'Worker backup mandiri berjalan.' })

const shutdown = async signal => {
  logEvent(cfg, { level: 'info', type: 'worker', message: `Worker berhenti (${signal}).` })
  await stopBackupSystem()
  process.exit(0)
}
process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
