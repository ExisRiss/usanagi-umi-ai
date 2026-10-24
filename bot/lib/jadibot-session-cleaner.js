/* By AlzRiss - Usanagi Umi AI
 *
 * Pembersih sesi jadibot yang sudah mati.
 *
 * Aturan: sesi yang TIDAK pernah tersambung kembali selama 15 menit dihapus,
 * berikut folder backup-nya (sessions-backup/<nomor>) dan isi
 * sessions-backup.tar.gz. Sesi bot utama (sessions/creds.json) tidak pernah
 * disentuh karena pembersih hanya melihat sessions/jadibot.
 *
 * Catatan penting: percobaan reconnect otomatis TIDAK mereset hitungan. Kalau
 * hitungan ikut direset, sesi yang reconnect-loop (seperti 6280000000001) tidak
 * akan pernah dibersihkan. Hitungan hanya direset saat pengguna benar-benar
 * meminta (mulai/pairing/restart) atau saat sesi berhasil tersambung.
 *
 * Hitungan disimpan di data/jadibot-session-cleaner.json supaya restart
 * container tidak mengulang dari nol.
 */
import { platformSessions } from './jadibot-platform-state.js'
import fs from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'

const ROOT = process.cwd()
const SESSIONS_DIR = path.join(ROOT, 'sessions', 'jadibot')
const BACKUP_DIR = path.join(ROOT, 'sessions-backup')
const BACKUP_TAR = path.join(ROOT, 'sessions-backup.tar.gz')
const STATE_FILE = path.join(ROOT, 'data', 'jadibot-session-cleaner.json')

const TTL_MS = Math.max(60_000, Number(process.env.JADIBOT_SESSION_TTL_MS) || 15 * 60 * 1000)
const SWEEP_INTERVAL_MS = 60 * 1000

const state = {
  timer: null,
  sweeping: false,
  loaded: false,
  entries: {},
  removalHook: null,
}

const iso = date => new Date(date).toISOString()
const digits = value => String(value || '').replace(/\D/g, '')

function loadState() {
  state.loaded = true
  try {
    const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'))
    if (data && typeof data === 'object' && data.entries && typeof data.entries === 'object') {
      state.entries = data.entries
    }
  } catch {}
}

function saveState() {
  try {
    fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true })
    const temp = `${STATE_FILE}.${process.pid}.tmp`
    fs.writeFileSync(temp, `${JSON.stringify({ updatedAt: iso(Date.now()), ttlMs: TTL_MS, entries: state.entries }, null, 2)}\n`, { mode: 0o600 })
    fs.renameSync(temp, STATE_FILE)
  } catch {}
}

function entryFor(number) {
  if (!state.loaded) loadState()
  const key = digits(number)
  if (!key) return null
  if (!state.entries[key]) {
    state.entries[key] = { online: false, connectedAt: null, disconnectedSince: null, lastAttemptAt: null }
  }
  return state.entries[key]
}

/** Sesi berhasil tersambung: hitungan putus dihapus. */
export function noteSessionOnline(number) {
  const entry = entryFor(number)
  if (!entry) return
  const changed = !entry.online || entry.disconnectedSince !== null
  entry.online = true
  entry.connectedAt = iso(Date.now())
  entry.disconnectedSince = null
  if (changed) saveState()
}

/** Sesi terputus: kalau belum pernah tercatat putus, mulai hitungan sekarang. */
export function noteSessionOffline(number) {
  const entry = entryFor(number)
  if (!entry) return
  entry.online = false
  if (!entry.disconnectedSince) {
    entry.disconnectedSince = iso(Date.now())
    saveState()
  }
}

/** Pengguna meminta sesuatu untuk sesi ini (mulai/pairing/restart): hitungan direset. */
export function noteSessionActivity(number) {
  const entry = entryFor(number)
  if (!entry) return
  entry.lastAttemptAt = iso(Date.now())
  entry.disconnectedSince = null
  saveState()
}

/** Sesi sudah sengaja dihapus (mis. stopSubBot): buang catatannya. */
export function forgetSession(number) {
  const key = digits(number)
  if (!key || !state.entries[key]) return
  delete state.entries[key]
  saveState()
}

/** Dipanggil sebelum folder sesi dihapus, supaya timer reconnect/socket ikut dimatikan. */
export function setSessionRemovalHook(hook) {
  state.removalHook = typeof hook === 'function' ? hook : null
}

function removeTarget(target) {
  try {
    fs.rmSync(target, { recursive: true, force: true })
    return true
  } catch (error) {
    console.error('[JADIBOT-CLEANER] gagal hapus', path.basename(target), error.message)
    return false
  }
}

async function refreshBackupArchive() {
  if (!fs.existsSync(BACKUP_TAR)) return
  if (!fs.existsSync(BACKUP_DIR)) { fs.rmSync(BACKUP_TAR, { force: true }); return }
  const temp = `${BACKUP_TAR}.tmp`
  try {
    await new Promise((resolve, reject) => execFile('tar', ['-czf', temp, '-C', path.dirname(BACKUP_DIR), path.basename(BACKUP_DIR)], { timeout: 60_000 }, error => error ? reject(error) : resolve()))
    fs.renameSync(temp, BACKUP_TAR)
  } catch (error) {
    try { fs.unlinkSync(temp) } catch {}
    throw error // Retain reservation/state and retry; never report a complete purge.
  }
}

function sessionFolders() {
  try {
    return fs.readdirSync(SESSIONS_DIR, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && /^\d{6,16}$/.test(entry.name))
      .map(entry => entry.name)
  } catch {
    return []
  }
}

/**
 * Satu putaran pemeriksaan.
 * @returns {Promise<Array<{number: string, minutes: number, backupRemoved: boolean}>>}
 */
export async function sweepJadibotSessions() {
  if (state.sweeping) return []
  state.sweeping = true
  // Sapuan bisa berjalan sebelum startJadibotSessionCleaner(): pastikan
  // hitungan dari disk tetap dipakai supaya restart tidak mengulang dari nol.
  if (!state.loaded) loadState()
  const removed = []
  try {
    const conns = global.jadibotConns instanceof Map ? global.jadibotConns : null
    // Include orphan website reservations/backups, not only folders on disk.
    const folders = [...new Set([...sessionFolders(), ...platformSessions.numbers()])]
    const now = Date.now()

    for (const number of folders) {
      const conn = conns ? conns.get(number) : null
      if (conn && conn.__jadibotConnected) {
        noteSessionOnline(number)
        continue
      }
      const entry = entryFor(number)
      if (!entry) continue
      if (!entry.disconnectedSince) {
        entry.disconnectedSince = iso(now)
        saveState()
        continue
      }
      const disconnectedMs = now - new Date(entry.disconnectedSince).getTime()
      if (!(disconnectedMs >= TTL_MS)) continue

      const minutes = Math.round(disconnectedMs / 60000)
      if (!platformSessions.beginRemoval(number)) continue
      try {
        if (state.removalHook) await state.removalHook(number)
        const current = conns && conns.get(number)
        if (current && current.__jadibotConnected) continue
        const sessionRemoved = removeTarget(path.join(SESSIONS_DIR, number))
        if (!sessionRemoved) continue
        const backupPath = path.join(BACKUP_DIR, number)
        const hadBackup = fs.existsSync(backupPath)
        if (hadBackup && !removeTarget(backupPath)) continue
        await refreshBackupArchive()
        const platform = platformSessions.remove(number)
        delete state.entries[number]
        saveState()
        console.log(`[JADIBOT-CLEANER] sesi putus ${minutes} menit dibersihkan beserta registry dan backup.`)
        removed.push({ number, minutes, backupRemoved: hadBackup, ...platform })
      } catch (error) {
        console.error('[JADIBOT-CLEANER] pembersihan belum lengkap; akan diulang:', error.message)
      } finally { platformSessions.endRemoval(number) }

    }

    // Buang catatan untuk sesi yang sudah tidak ada di disk.
    let dirty = false
    for (const key of Object.keys(state.entries)) {
      if (folders.includes(key)) continue
      if (conns && conns.has(key)) continue
      delete state.entries[key]
      dirty = true
    }
    if (dirty) saveState()
  } finally {
    state.sweeping = false
  }
  return removed
}

export function jadibotSessionCleanerStatus() {
  const now = Date.now()
  const entries = Object.entries(state.entries).map(([number, entry]) => ({
    number,
    online: Boolean(entry.online),
    connectedAt: entry.connectedAt || null,
    disconnectedSince: entry.disconnectedSince || null,
    disconnectedMinutes: entry.disconnectedSince ? Math.round((now - new Date(entry.disconnectedSince).getTime()) / 60000) : 0,
    lastAttemptAt: entry.lastAttemptAt || null,
  }))
  return { ttlMinutes: Math.round(TTL_MS / 60000), intervalSeconds: Math.round(SWEEP_INTERVAL_MS / 1000), entries }
}

export function startJadibotSessionCleaner() {
  loadState()
  if (state.timer) clearInterval(state.timer)
  state.timer = setInterval(() => { sweepJadibotSessions().catch(() => {}) }, SWEEP_INTERVAL_MS)
  state.timer.unref?.()
  setTimeout(() => { sweepJadibotSessions().catch(() => {}) }, 20_000).unref?.()
  console.log(`[JADIBOT-CLEANER] Aktif — sesi yang putus ${Math.round(TTL_MS / 60000)} menit dihapus beserta backup-nya.`)
}

export default {
  noteSessionOnline,
  noteSessionOffline,
  noteSessionActivity,
  forgetSession,
  setSessionRemovalHook,
  sweepJadibotSessions,
  jadibotSessionCleanerStatus,
  startJadibotSessionCleaner,
}
