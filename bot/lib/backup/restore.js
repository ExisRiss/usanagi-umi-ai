/* By AlzRiss - Usanagi Umi AI
 *
 * Restore dari arsip backup.
 *
 * Alur aman:
 *   validasi arsip + checksum -> rencana (dry-run) -> konfirmasi token
 *   -> backup kondisi saat ini -> ekstrak dengan validasi path -> terapkan
 *   -> verifikasi hasil -> catat audit
 *
 * Database SQLite tidak ditimpa saat proses bot hidup (koneksi bisa rusak).
 * Berkas hasil restore ditulis sebagai `usanagi.sqlite.restore-<id>` dan
 * diaktifkan otomatis saat boot berikutnya lewat `applyPendingRestore()`.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { logEvent } from './log.js'
import { decryptFile } from './crypto.js'
import { extractArchive, sha256File } from './archive.js'
import {
  ensureLayout, paths, getBackup, readState, updateState, appendAudit, writeJsonAtomic,
} from './store.js'
import { runBackup } from './pipeline.js'

const CONFIRM_TTL_MS = 15 * 60 * 1000

const PENDING_MARKER = 'RESTORE-PENDING.json'

function newRestoreId() {
  return `rs_${new Date().toISOString().replace(/[-:.TZ]/g, '')}_${crypto.randomBytes(3).toString('hex')}`
}

/** Petakan path di dalam arsip ke path nyata. Menolak apa pun di luar daftar. */
export function mapArchivePath(cfg, archivePath) {
  const normalized = String(archivePath || '').replace(/\\/g, '/')
  if (normalized === 'manifest.json' || normalized === 'checksums.sha256') return { internal: true, target: null }

  const sessionMatch = normalized.match(/^(config|files)\/sessions\/(\d{6,20})\/(.+)$/)
  if (sessionMatch) {
    const [, kind, number, rest] = sessionMatch
    if (!/^\d{6,20}$/.test(number)) throw new Error(`Nomor sesi tidak valid pada arsip: ${number}`)
    if (kind === 'config' && rest !== 'bot-config.json') throw new Error(`Berkas sesi tidak dikenal: ${normalized}`)
    return { internal: false, target: path.join(cfg.sessionsDir, number, rest), label: `sessions/jadibot/${number}/${rest}` }
  }

  if (normalized === 'database/database.json') return { internal: false, target: cfg.databaseJson, label: 'database.json' }
  if (normalized === 'database/usanagi.sqlite') {
    return { internal: false, target: cfg.sqlitePath, label: 'data/database/usanagi.sqlite', sqlite: true }
  }
  if (normalized === 'config/platform/jadibot-platform.json') {
    return { internal: false, target: cfg.platformState, label: 'data/jadibot-platform.json' }
  }
  const dataMatch = normalized.match(/^config\/data\/(.+)$/)
  if (dataMatch) {
    const rel = dataMatch[1]
    if (rel.includes('..')) throw new Error('Path data tidak aman.')
    return { internal: false, target: path.join(cfg.dataDir, rel), label: `data/${rel}` }
  }
  throw new Error(`Entri arsip tidak dikenali dan tidak akan dipulihkan: ${normalized}`)
}

function token() {
  return crypto.randomBytes(4).toString('hex').toUpperCase()
}

function safeRelative(cfg, target) {
  const base = path.resolve(cfg.cwd)
  const resolved = path.resolve(target)
  if (resolved !== base && !resolved.startsWith(`${base}${path.sep}`)) {
    throw new Error('Tujuan restore berada di luar folder bot.')
  }
  return resolved
}

/** Ekstrak arsip ke staging, mengembalikan daftar entri + manifest. */
async function stageArchive(cfg, record) {
  const p = ensureLayout(cfg)
  const file = path.resolve(cfg.root, record.storagePath)
  if (!file.startsWith(path.resolve(cfg.root)) || !fs.existsSync(file)) {
    throw Object.assign(new Error('Berkas backup tidak ada.'), { status: 404 })
  }
  const checksum = await sha256File(file)
  if (!record.checksum || checksum !== record.checksum) {
    throw Object.assign(new Error('Checksum arsip tidak cocok — backup rusak atau sudah diubah.'), { status: 409 })
  }

  const stage = path.join(p.staging, `restore-${record.id}-${Date.now()}`)
  fs.mkdirSync(stage, { recursive: true, mode: 0o700 })
  let source = file
  if (record.encrypted) {
    if (!cfg.encryption.key) throw Object.assign(new Error('Kunci enkripsi belum tersedia, arsip tidak bisa dibuka.'), { status: 409 })
    source = path.join(stage, '.archive.tar.gz')
    await decryptFile(file, source, cfg.encryption.key)
  }
  const entries = await extractArchive({ file: source, cwd: stage })
  if (record.encrypted) fs.rmSync(source, { force: true })
  const manifestPath = path.join(stage, 'manifest.json')
  if (!fs.existsSync(manifestPath)) throw Object.assign(new Error('Arsip tidak punya manifest.json.'), { status: 409 })
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  // manifestId dipakai untuk arsip hasil unggah ulang yang mendapat id baru.
  if (manifest.id !== record.id && manifest.id !== record.manifestId) {
    throw Object.assign(new Error('Manifest arsip bukan milik backup ini.'), { status: 409 })
  }
  return { stage, entries, manifest, file, checksum }
}

/**
 * Buat rencana restore (dry-run selalu aman).
 * @param {{backupId:string, components?:string[], actor?:string, dryRun?:boolean}} input
 */
export async function createRestore(cfg, input = {}) {
  const record = getBackup(cfg, String(input.backupId || ''))
  if (!record) throw Object.assign(new Error('Backup tidak ditemukan.'), { status: 404 })
  if (!['completed', 'partial'].includes(record.status)) {
    throw Object.assign(new Error('Hanya backup berstatus completed yang bisa dipulihkan.'), { status: 409 })
  }
  const components = Array.isArray(input.components) && input.components.length
    ? input.components.filter(item => ['database', 'config', 'files'].includes(item))
    : ['database', 'config', 'files']
  const staged = await stageArchive(cfg, record)

  try {
    const plan = []
    for (const entry of staged.entries) {
      const mapped = mapArchivePath(cfg, entry.name)
      if (mapped.internal) continue
      const component = entry.name.startsWith('database/') ? 'database' : (entry.name.startsWith('files/') ? 'files' : 'config')
      if (!components.includes(component)) continue
      plan.push({
        archivePath: entry.name,
        target: safeRelative(cfg, mapped.target),
        label: mapped.label,
        bytes: entry.size,
        component,
        sqlite: Boolean(mapped.sqlite),
        willOverwrite: fs.existsSync(mapped.target),
      })
    }
    if (!plan.length) throw Object.assign(new Error('Tidak ada berkas yang cocok dengan komponen yang dipilih.'), { status: 400 })

    // Verifikasi isi berkas terhadap checksums di manifest.
    const byPath = new Map(staged.manifest.files.map(item => [item.archivePath, item]))
    let verified = 0
    const corrupt = []
    for (const item of plan) {
      const expected = byPath.get(item.archivePath)
      if (!expected) { corrupt.push(item.archivePath); continue }
      const actual = await sha256File(path.join(staged.stage, item.archivePath))
      if (actual !== expected.sha256) corrupt.push(item.archivePath)
      else verified += 1
    }
    if (corrupt.length) {
      throw Object.assign(new Error(`Isi arsip tidak cocok dengan manifest: ${corrupt.slice(0, 3).join(', ')}`), { status: 409 })
    }

    const summary = {
      backupId: record.id,
      backupName: record.name,
      backupCreatedAt: record.startedAt,
      appVersion: staged.manifest.appVersion,
      schemaVersion: staged.manifest.schemaVersion,
      components,
      files: plan.length,
      bytes: plan.reduce((sum, item) => sum + Number(item.bytes || 0), 0),
      overwrites: plan.filter(item => item.willOverwrite).length,
      requiresRestart: plan.some(item => item.sqlite),
      verifiedFiles: verified,
      plan,
    }

    if (input.dryRun) {
      fs.rmSync(staged.stage, { recursive: true, force: true })
      return { dryRun: true, ...summary }
    }

    const id = newRestoreId()
    const confirmation = token()
    const restore = {
      id,
      backupId: record.id,
      status: 'pending_confirmation',
      dryRun: false,
      components,
      summary: { ...summary, plan: undefined },
      token: confirmation,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + CONFIRM_TTL_MS).toISOString(),
      actor: String(input.actor || 'unknown').slice(0, 100),
      startedAt: null,
      completedAt: null,
      error: null,
      stagePath: staged.stage,
      result: null,
    }
    await updateState(cfg, state => {
      state.restores.unshift(restore)
      if (state.restores.length > 50) state.restores.length = 50
      return state
    })
    logEvent(cfg, {
      level: 'warn',
      type: 'restore',
      message: `Restore ${record.id} menunggu konfirmasi (${plan.length} berkas, ${components.join('+')}).`,
      backupId: record.id,
      actor: restore.actor,
    })
    await appendAudit(cfg, { actor: restore.actor, action: 'restore.request', resource: record.id, meta: { components, files: plan.length } })
    return { ...restore, summary }
  } catch (error) {
    fs.rmSync(staged.stage, { recursive: true, force: true })
    throw error
  }
}

export function getRestore(cfg, id) {
  return readState(cfg).restores.find(item => item.id === id) || null
}

export function listRestores(cfg, { limit = 20 } = {}) {
  return readState(cfg).restores.slice(0, Math.min(Math.max(Number(limit) || 20, 1), 100))
}

async function patchRestore(cfg, id, patch) {
  return updateState(cfg, state => {
    const row = state.restores.find(item => item.id === id)
    if (row) Object.assign(row, patch)
    return state
  })
}

export async function cancelRestore(cfg, id, actor = 'unknown') {
  const restore = getRestore(cfg, id)
  if (!restore) throw Object.assign(new Error('Restore tidak ditemukan.'), { status: 404 })
  if (restore.status !== 'pending_confirmation') {
    throw Object.assign(new Error('Restore ini sudah berjalan dan tidak bisa dibatalkan.'), { status: 409 })
  }
  if (restore.stagePath) fs.rmSync(restore.stagePath, { recursive: true, force: true })
  await patchRestore(cfg, id, { status: 'cancelled', completedAt: new Date().toISOString(), stagePath: null })
  await appendAudit(cfg, { actor, action: 'restore.cancel', resource: restore.backupId, result: 'ok' })
  logEvent(cfg, { level: 'warn', type: 'restore', message: `Restore ${id} dibatalkan.`, backupId: restore.backupId, actor })
  return getRestore(cfg, id)
}

function copyAtomic(source, target) {
  fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 })
  const tmp = `${target}.restore-tmp-${process.pid}`
  fs.copyFileSync(source, tmp)
  fs.renameSync(tmp, target)
}

/**
 * Konfirmasi dan jalankan restore. Destruktif: memerlukan token dari
 * createRestore() dan selalu membuat backup kondisi terbaru lebih dulu.
 */
export async function confirmRestore(cfg, id, { token: suppliedToken, actor = 'unknown' } = {}) {
  const restore = getRestore(cfg, id)
  if (!restore) throw Object.assign(new Error('Restore tidak ditemukan.'), { status: 404 })
  if (restore.status !== 'pending_confirmation') {
    throw Object.assign(new Error(`Restore berstatus ${restore.status}, tidak bisa dikonfirmasi.`), { status: 409 })
  }
  if (String(suppliedToken || '').toUpperCase() !== String(restore.token || '')) {
    throw Object.assign(new Error('Kode konfirmasi salah.'), { status: 403 })
  }
  if (new Date(restore.expiresAt).getTime() < Date.now()) {
    await patchRestore(cfg, id, { status: 'expired', stagePath: null })
    throw Object.assign(new Error('Kode konfirmasi kedaluwarsa, buat restore baru.'), { status: 409 })
  }

  const record = getBackup(cfg, restore.backupId)
  if (!record) throw Object.assign(new Error('Backup sumber hilang dari index.'), { status: 404 })

  await patchRestore(cfg, id, { status: 'running', startedAt: new Date().toISOString(), token: null })
  logEvent(cfg, { level: 'warn', type: 'restore', message: `Restore ${record.id} dimulai.`, backupId: record.id, actor })

  let stage = restore.stagePath
  try {
    // 1. Backup kondisi saat ini supaya restore bisa dibatalkan secara manual.
    const safety = await runBackup(cfg, { type: 'full', reason: 'pre-restore', actor: `restore:${id}` })

    // 2. Pastikan staging masih valid (bisa saja server restart sejak rencana dibuat).
    if (!stage || !fs.existsSync(stage)) {
      stage = (await stageArchive(cfg, record)).stage
    }

    const planRows = []
    for (const entry of fs.readdirSync(stage, { recursive: true, withFileTypes: true })) {
      if (!entry.isFile()) continue
      const full = path.join(entry.parentPath || entry.path, entry.name)
      const rel = path.relative(stage, full).replace(/\\/g, '/')
      const mapped = mapArchivePath(cfg, rel)
      if (mapped.internal) continue
      const component = rel.startsWith('database/') ? 'database' : (rel.startsWith('files/') ? 'files' : 'config')
      if (!restore.components.includes(component)) continue
      planRows.push({ rel, target: mapped.target, sqlite: Boolean(mapped.sqlite) })
    }
    if (!planRows.length) throw new Error('Rencana restore kosong.')

    // 3. Terapkan.
    const p = paths(cfg)
    let pendingSqlite = null
    const applied = []
    for (const row of planRows) {
      const source = path.join(stage, row.rel)
      const target = safeRelative(cfg, row.target)
      if (row.sqlite) {
        const pending = `${target}.restore-${id}`
        copyAtomic(source, pending)
        pendingSqlite = pending
        applied.push({ label: 'data/database/usanagi.sqlite', pending })
        continue
      }
      if (fs.existsSync(target)) {
        const backupCopy = `${target}.before-restore-${id}`
        try { fs.copyFileSync(target, backupCopy) } catch {}
      }
      copyAtomic(source, target)
      applied.push({ label: path.relative(cfg.cwd, target), bytes: fs.statSync(target).size })
    }

    // 4. Verifikasi: checksum berkas yang dipulihkan + quick_check sqlite.
    const verification = { files: applied.length, mismatches: [] }
    for (const row of planRows) {
      if (row.sqlite) continue
      const source = path.join(stage, row.rel)
      const target = safeRelative(cfg, row.target)
      if (await sha256File(source) !== await sha256File(target)) verification.mismatches.push(row.rel)
    }
    if (pendingSqlite) {
      try {
        const { default: Database } = await import('better-sqlite3')
        const db = new Database(pendingSqlite, { readonly: true, fileMustExist: true })
        const row = db.prepare('PRAGMA quick_check').get()
        db.close()
        verification.sqliteCheck = String(row ? Object.values(row)[0] : 'ok').toLowerCase()
      } catch (error) {
        verification.sqliteCheck = `gagal: ${error.message}`
      }
    }

    // 5. Aktifkan database hasil restore pada boot berikutnya.
    if (pendingSqlite) {
      writeJsonAtomic(path.join(path.dirname(pendingSqlite), PENDING_MARKER), {
        restoreId: id,
        backupId: record.id,
        pendingFile: path.basename(pendingSqlite),
        targetFile: path.basename(cfg.sqlitePath),
        createdAt: new Date().toISOString(),
        note: 'Diterapkan otomatis saat bot start. Hapus berkas ini untuk membatalkan.',
      })
    }

    if (verification.mismatches.length) throw new Error(`Verifikasi restore gagal: ${verification.mismatches.join(', ')}`)

    const status = pendingSqlite ? 'completed_pending_restart' : 'completed'
    await patchRestore(cfg, id, {
      status,
      completedAt: new Date().toISOString(),
      stagePath: null,
      result: { applied, verification, safetyBackupId: safety.id, pendingSqlite: pendingSqlite ? path.basename(pendingSqlite) : null },
    })
    fs.rmSync(stage, { recursive: true, force: true })
    await appendAudit(cfg, { actor, action: 'restore.confirm', resource: record.id, meta: { files: applied.length, status } })
    logEvent(cfg, {
      level: 'success',
      type: 'restore',
      message: `Restore selesai: ${applied.length} berkas${pendingSqlite ? ', database aktif setelah restart' : ''}.`,
      backupId: record.id,
      actor,
    })
    return getRestore(cfg, id)
  } catch (error) {
    await patchRestore(cfg, id, {
      status: 'failed',
      completedAt: new Date().toISOString(),
      error: String(error.message || 'unknown').slice(0, 500),
      stagePath: stage && fs.existsSync(stage) ? stage : null,
    })
    await appendAudit(cfg, { actor, action: 'restore.confirm', resource: record?.id || '', result: 'failed', meta: { error: error.message } })
    logEvent(cfg, { level: 'error', type: 'restore', message: `Restore gagal: ${error.message}`, backupId: record?.id, actor })
    throw error
  }
}

/**
 * Dipanggil saat bot start: aktifkan database hasil restore bila ada marker.
 * Aman dipanggil berkali-kali.
 */
export function applyPendingRestore(cfg) {
  try {
    const marker = path.join(path.dirname(cfg.sqlitePath), PENDING_MARKER)
    if (!fs.existsSync(marker)) return { applied: false }
    const data = JSON.parse(fs.readFileSync(marker, 'utf8'))
    const pending = path.join(path.dirname(cfg.sqlitePath), data.pendingFile)
    if (!fs.existsSync(pending)) {
      fs.rmSync(marker, { force: true })
      return { applied: false, reason: 'berkas pending tidak ada' }
    }
    // Simpan salinan database lama sekali lagi sebelum ditimpa.
    for (const suffix of ['', '-wal', '-shm']) {
      const current = `${cfg.sqlitePath}${suffix}`
      if (fs.existsSync(current)) {
        try { fs.renameSync(current, `${current}.pre-restore-${Date.now()}`) } catch {}
      }
    }
    fs.renameSync(pending, cfg.sqlitePath)
    fs.rmSync(marker, { force: true })
    logEvent(cfg, { level: 'success', type: 'restore', message: `Database hasil restore ${data.restoreId} diaktifkan saat boot.`, backupId: data.backupId })
    return { applied: true, restoreId: data.restoreId, backupId: data.backupId }
  } catch (error) {
    console.error('[BACKUP] Gagal menerapkan restore tertunda:', error.message)
    return { applied: false, error: error.message }
  }
}

export { PENDING_MARKER }
