/* Hourly external-to-Vercel trigger. The backup work and storage remain in Vercel. */

const HOUR_MS = 60 * 60 * 1000
const state = { timer: null, running: false }

function settings() {
  return {
    url: String(process.env.UMI_BACKUP_TRIGGER_URL || 'https://website-jadibot-by-alzriss.vercel.app/api/cron/backup').trim(),
    secret: String(process.env.UMI_BACKUP_CRON_SECRET || '').trim(),
  }
}

function nextHourDelay() {
  const now = Date.now()
  return Math.max(10_000, HOUR_MS - (now % HOUR_MS) + 2_000)
}

async function trigger() {
  const { url, secret } = settings()
  if (!secret || !/^https:\/\//i.test(url)) return { skipped: true }
  if (state.running) return { skipped: true }
  state.running = true
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(55_000),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const payload = await response.json().catch(() => ({}))
    console.log(`[VERCEL-BACKUP-SCHEDULER] Backup hourly selesai${payload?.generation ? ` (${payload.generation})` : ''}.`)
    return payload
  } catch (error) {
    console.error('[VERCEL-BACKUP-SCHEDULER] Trigger backup gagal:', error?.message || 'unknown')
    return { error: error?.message || 'unknown' }
  } finally {
    state.running = false
  }
}

function schedule() {
  clearTimeout(state.timer)
  const delay = nextHourDelay()
  const next = new Date(Date.now() + delay).toISOString()
  console.log(`[VERCEL-BACKUP-SCHEDULER] Backup berikutnya dijadwalkan ${next}.`)
  state.timer = setTimeout(async () => {
    await trigger()
    schedule()
  }, delay)
}

export function startVercelBackupScheduler() {
  if (state.timer) return
  const { url, secret } = settings()
  if (!secret) {
    console.warn('[VERCEL-BACKUP-SCHEDULER] Tidak aktif: UMI_BACKUP_CRON_SECRET belum disetel.')
    return
  }
  if (!/^https:\/\//i.test(url)) {
    console.error('[VERCEL-BACKUP-SCHEDULER] Tidak aktif: URL pemicu harus HTTPS.')
    return
  }
  schedule()
}

export function stopVercelBackupScheduler() {
  clearTimeout(state.timer)
  state.timer = null
}

export default { startVercelBackupScheduler, stopVercelBackupScheduler }
