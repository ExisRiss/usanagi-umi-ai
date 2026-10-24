/*
 *
 * Scheduler backup otomatis.
 *
 * - Default setiap 10 menit (6x/jam, 144x/hari), bisa diubah administrator.
 * - Tidak bergantung pada dashboard/browser: berjalan di proses bot.
 * - Slot dihitung dari jam dinding (UTC), jadi tidak bergeser walau proses
 *   restart; slot yang terlewat dicatat, bukan dikejar dengan proses paralel.
 * - Saat start, bila backup terakhir sudah terlalu lama, satu catch-up
 *   dijalankan (tetap lewat lock yang sama, jadi tidak menumpuk).
 */
import { backupConfig } from './config.js'
import { logEvent } from './log.js'
import { readState, updateState, paths, ensureLayout } from './store.js'
import { runBackup, isBackupRunning } from './pipeline.js'

const TICK_MS = 15 * 1000
const START_DELAY_MS = 60 * 1000
const runtime = {
  timer: null,
  startedAt: null,
  lastTickAt: null,
  running: false,
  busy: false,
  lastResult: null,
  lastError: null,
}

export function schedulerIntervalMinutes(cfg = backupConfig()) {
  const state = readState(cfg)
  const value = Number(state.settings.intervalMinutes || state.scheduler.intervalMinutes || cfg.intervalMinutes)
  return Number.isFinite(value) && value >= 1 && value <= 1440 ? Math.round(value) : cfg.defaultIntervalMinutes
}

export function schedulerEnabled(cfg = backupConfig()) {
  const state = readState(cfg)
  return state.scheduler.enabled !== false
}

/** Slot berikutnya setelah waktu tertentu (UTC), dibulatkan ke kelipatan interval. */
export function nextSlotAfter(now, intervalMinutes) {
  const interval = Math.max(1, Number(intervalMinutes) || 10) * 60 * 1000
  const stamp = now.getTime()
  const slot = (Math.floor(stamp / interval) + 1) * interval
  return new Date(slot + 5000)
}

/** Berapa slot yang terlewat antara dua waktu. */
export function countMissedSlots(lastRunAt, now, intervalMinutes) {
  if (!lastRunAt) return 0
  const last = new Date(lastRunAt).getTime()
  if (!Number.isFinite(last)) return 0
  const interval = Math.max(1, Number(intervalMinutes) || 10) * 60 * 1000
  const gap = now.getTime() - last
  if (gap <= interval * 1.5) return 0
  return Math.max(0, Math.floor(gap / interval) - 1)
}

async function persist(cfg, patch) {
  return await updateState(cfg, state => {
    Object.assign(state.scheduler, patch)
    return state
  })
}

/** Jalankan backup terjadwal dengan semua penjagaan. */
export async function runScheduled(reason = 'scheduled', cfg = backupConfig()) {
  if (!schedulerEnabled(cfg) && reason === 'scheduled') {
    return { skipped: true, reason: 'scheduler-disabled' }
  }
  const lock = isBackupRunning(cfg)
  if (lock.running) {
    const state = await updateState(cfg, current => {
      current.scheduler.skippedBusy = Number(current.scheduler.skippedBusy || 0) + 1
      current.scheduler.missedSlots = Number(current.scheduler.missedSlots || 0) + 1
      return current
    })
    logEvent(cfg, {
      level: 'warn',
      type: 'scheduler',
      message: `Slot ${reason} dilewati: backup lain masih berjalan sejak ${lock.holder?.startedAt || 'tidak diketahui'}.`,
      meta: { skippedBusy: state.scheduler.skippedBusy },
    })
    return { skipped: true, reason: 'busy' }
  }

  runtime.busy = true
  runtime.lastTickAt = new Date().toISOString()
  try {
    const record = await runBackup(cfg, { type: 'full', reason, actor: 'scheduler' })
    runtime.lastResult = { id: record.id, at: record.completedAt, bytes: record.sizeBytes }
    runtime.lastError = null
    await updateState(cfg, state => {
      state.scheduler.lastRunAt = new Date().toISOString()
      state.scheduler.lastSuccessAt = new Date().toISOString()
      state.scheduler.lastFailureAt = state.scheduler.lastFailureAt
      state.scheduler.lastError = null
      state.counters.success = Number(state.counters.success || 0) + 1
      return state
    })
    return { ok: true, id: record.id }
  } catch (error) {
    runtime.lastError = String(error.message || 'unknown')
    await updateState(cfg, state => {
      state.scheduler.lastRunAt = new Date().toISOString()
      state.scheduler.lastFailureAt = new Date().toISOString()
      state.scheduler.lastError = String(error.message || 'unknown').slice(0, 300)
      state.counters.failed = Number(state.counters.failed || 0) + 1
      return state
    })
    logEvent(cfg, { level: 'error', type: 'scheduler', message: `Backup terjadwal gagal: ${error.message}` })
    return { ok: false, error: String(error.message || 'unknown') }
  } finally {
    runtime.busy = false
  }
}

async function tick(cfg) {
  const interval = schedulerIntervalMinutes(cfg)
  const state = readState(cfg)
  const now = new Date()
  const nextRunAt = state.scheduler.nextRunAt ? new Date(state.scheduler.nextRunAt) : null

  if (!nextRunAt || !Number.isFinite(nextRunAt.getTime()) || nextRunAt.getTime() <= now.getTime()) {
    const next = nextSlotAfter(now, interval)
    await persist(cfg, { nextRunAt: next.toISOString(), intervalMinutes: interval })
    if (!nextRunAt) return
  }

  const target = state.scheduler.nextRunAt ? new Date(state.scheduler.nextRunAt) : null
  if (!target || now.getTime() < target.getTime()) return
  if (!schedulerEnabled(cfg)) {
    await persist(cfg, { nextRunAt: nextSlotAfter(now, interval).toISOString() })
    return
  }

  // Jadwalkan slot berikutnya lebih dulu supaya tick terlambat tidak menumpuk.
  await persist(cfg, { nextRunAt: nextSlotAfter(now, interval).toISOString(), intervalMinutes: interval })
  runScheduled('scheduled', cfg).catch(() => {})
}

/**
 * Nyalakan layanan backup (scheduler). Idempoten.
 * @param {object} [cfg]
 */
export async function startBackupScheduler(cfg = backupConfig()) {
  if (runtime.timer) return schedulerSnapshot(cfg)
  ensureLayout(cfg)
  runtime.startedAt = new Date().toISOString()

  const interval = schedulerIntervalMinutes(cfg)
  const state = readState(cfg)
  const now = new Date()
  const missed = countMissedSlots(state.scheduler.lastRunAt, now, interval)
  const next = nextSlotAfter(now, interval)

  await updateState(cfg, current => {
    current.scheduler.intervalMinutes = interval
    current.scheduler.nextRunAt = next.toISOString()
    if (missed > 0) current.scheduler.missedSlots = Number(current.scheduler.missedSlots || 0) + missed
    if (!current.scheduler.lastSlot) current.scheduler.lastSlot = next.toISOString()
    return current
  })

  logEvent(cfg, {
    level: 'info',
    type: 'scheduler',
    message: schedulerEnabled(cfg)
      ? `Scheduler backup aktif: setiap ${interval} menit, slot berikutnya ${next.toISOString()}.`
      : 'Scheduler backup nonaktif (dinonaktifkan administrator).',
    meta: { missedSlots: missed, paths: paths(cfg).root },
  })

  if (missed > 0) {
    logEvent(cfg, { level: 'warn', type: 'scheduler', message: `${missed} slot backup terlewat saat scheduler tidak berjalan.` })
  }

  const lastSuccess = state.scheduler.lastSuccessAt ? new Date(state.scheduler.lastSuccessAt).getTime() : 0
  const tooOld = !lastSuccess || now.getTime() - lastSuccess > interval * 2 * 60 * 1000
  if (schedulerEnabled(cfg) && tooOld) {
    setTimeout(() => {
      runScheduled('catch-up', cfg).catch(() => {})
    }, START_DELAY_MS).unref?.()
  }

  runtime.timer = setInterval(() => {
    try {
      Promise.resolve(tick(cfg)).catch(error => {
        runtime.lastError = error.message
        logEvent(cfg, { level: 'error', type: 'scheduler', message: `Tick scheduler gagal: ${error.message}` })
      })
    } catch (error) {
      runtime.lastError = error.message
      logEvent(cfg, { level: 'error', type: 'scheduler', message: `Tick scheduler gagal: ${error.message}` })
    }
  }, TICK_MS)
  runtime.timer.unref?.()

  return schedulerSnapshot(cfg)
}

export function stopBackupScheduler() {
  if (runtime.timer) clearInterval(runtime.timer)
  runtime.timer = null
}

export function schedulerSnapshot(cfg = backupConfig()) {
  const state = readState(cfg)
  const interval = schedulerIntervalMinutes(cfg)
  const lock = isBackupRunning(cfg)
  return {
    enabled: state.scheduler.enabled !== false,
    intervalMinutes: interval,
    defaultIntervalMinutes: cfg.defaultIntervalMinutes,
    provider: 'in-process scheduler (server-side)',
    processStartedAt: runtime.startedAt,
    lastTickAt: runtime.lastTickAt,
    running: lock.running || runtime.busy,
    lockHolder: lock.holder,
    nextRunAt: state.scheduler.nextRunAt,
    lastRunAt: state.scheduler.lastRunAt,
    lastSuccessAt: state.scheduler.lastSuccessAt,
    lastFailureAt: state.scheduler.lastFailureAt,
    missedSlots: Number(state.scheduler.missedSlots || 0),
    skippedBusy: Number(state.scheduler.skippedBusy || 0),
    lastError: state.scheduler.lastError,
    lastResult: runtime.lastResult,
  }
}

/** Ubah pengaturan scheduler. Interval berubah => slot dihitung ulang. */
export async function configureScheduler(cfg, { enabled, intervalMinutes }) {
  const patch = {}
  if (typeof enabled === 'boolean') patch.enabled = enabled
  let interval = null
  if (intervalMinutes !== undefined && intervalMinutes !== null) {
    const value = Number(intervalMinutes)
    if (!Number.isFinite(value) || value < 1 || value > 1440) {
      throw Object.assign(new Error('Interval harus antara 1 dan 1440 menit.'), { status: 400 })
    }
    interval = Math.round(value)
    patch.intervalMinutes = interval
  }
  const next = nextSlotAfter(new Date(), interval || schedulerIntervalMinutes(cfg))
  patch.nextRunAt = next.toISOString()
  await updateState(cfg, state => {
    Object.assign(state.scheduler, patch)
    if (interval) state.settings.intervalMinutes = interval
    return state
  })
  return schedulerSnapshot(cfg)
}
