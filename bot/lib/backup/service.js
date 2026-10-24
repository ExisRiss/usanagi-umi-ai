/* By AlzRiss - Usanagi Umi AI
 *
 * Titik masuk sistem backup untuk proses bot.
 * Dipanggil dari main.js: scheduler + bot Telegram + notifier.
 */
import { backupConfig } from './config.js'
import { ensureLayout } from './store.js'
import { logEvent } from './log.js'
import { setBackupNotifier } from './pipeline.js'
import { startBackupScheduler, stopBackupScheduler, schedulerSnapshot } from './scheduler.js'
import { notifyBackupEvent, startTelegramBot, stopTelegramBot, telegramSnapshot } from './telegram.js'

let started = false

export async function startBackupSystem() {
  const cfg = backupConfig()
  ensureLayout(cfg)
  if (started) return snapshot()
  started = true

  setBackupNotifier(notifyBackupEvent)

  if (!cfg.autoStart) {
    logEvent(cfg, { level: 'warn', type: 'system', message: 'BACKUP_AUTOSTART=0 — scheduler tidak dijalankan.' })
    return snapshot()
  }

  await startBackupScheduler(cfg)
  startTelegramBot(cfg).catch(error => {
    logEvent(cfg, { level: 'error', type: 'telegram', message: `Bot Telegram gagal dijalankan: ${error.message}` })
  })

  return snapshot()
}

export async function stopBackupSystem() {
  stopBackupScheduler()
  await stopTelegramBot()
  started = false
}

export function snapshot() {
  const cfg = backupConfig()
  return {
    scheduler: schedulerSnapshot(cfg),
    telegram: telegramSnapshot(),
    enabled: started,
  }
}

export default { startBackupSystem, stopBackupSystem, snapshot }
