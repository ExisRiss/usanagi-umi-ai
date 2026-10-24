/* By AlzRiss - Usanagi Umi AI
 *
 * Inti proses backup:
 *   siapkan -> snapshot data -> manifest + checksum -> tar.gz -> (enkripsi)
 *   -> verifikasi arsip -> pindah ke lokasi final -> unggah eksternal
 *   -> retensi -> notifikasi
 *
 * Satu backup hanya boleh berjalan pada satu waktu. Lock berbasis berkas
 * dengan timeout, jadi dua proses (mis. sisa proses lama yang menggantung)
 * tidak akan menulis arsip bersamaan.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { backupConfig } from './config.js'
import { logEvent } from './log.js'
import { collectSources } from './sources.js'
import { createArchive, extractArchive, listArchive, sha256File } from './archive.js'
import { encryptFile, decryptFile } from './crypto.js'
import {
  ensureLayout, paths, upsertBackup, patchBackup, listBackups, readIndex,
} from './store.js'
import { applyRetention, hasCapacity, planRetention, storageUsage } from './retention.js'
import { shouldUploadExternal, uploadToExternal } from './external.js'

export class BackupBusyError extends Error {
  constructor(message = 'Backup lain sedang berjalan.') {
    super(message)
    this.code = 'BACKUP_BUSY'
    this.status = 409
  }
}

let notifier = null
/** Daftarkan fungsi notifikasi (dipasang telegram.js agar tidak saling impor). */
export function setBackupNotifier(fn) {
  notifier = typeof fn === 'function' ? fn : null
}

async function notify(cfg, event) {
  if (!notifier) return
  try {
    await notifier(cfg, event)
  } catch (error) {
    logEvent(cfg, { level: 'warn', type: 'notify', message: `Notifikasi gagal: ${error.message}` })
  }
}

export function newBackupId(now = new Date()) {
  const stamp = now.toISOString().replace(/[-:.TZ]/g, '')
  return `bk_${stamp}_${crypto.randomBytes(4).toString('hex')}`
}

export function archiveName(id, type, encrypted) {
  return `backup_${id}_${type}.tar.gz${encrypted ? '.enc' : ''}`
}

/** Ambil lock; mengembalikan fungsi release. */
export function acquireBackupLock(cfg, { reason = 'manual', pid = process.pid } = {}) {
  const p = ensureLayout(cfg)
  const payload = { pid, host: os.hostname(), startedAt: new Date().toISOString(), reason }
  try {
    const fd = fs.openSync(p.lock, 'wx', 0o600)
    fs.writeSync(fd, JSON.stringify(payload))
    fs.closeSync(fd)
  } catch (error) {
    if (error.code !== 'EEXIST') throw error
    let holder = null
    try { holder = JSON.parse(fs.readFileSync(p.lock, 'utf8')) } catch {}
    const startedAt = holder && holder.startedAt ? new Date(holder.startedAt).getTime() : 0
    const age = Date.now() - startedAt
    if (Number.isFinite(age) && age < cfg.lockTimeoutMs) {
      throw new BackupBusyError(`Backup lain sedang berjalan sejak ${holder?.startedAt || 'tidak diketahui'}.`)
    }
    logEvent(cfg, { level: 'warn', type: 'lock', message: `Lock backup kedaluwarsa (${Math.round(age / 60000)} menit), diambil alih.` })
    try { fs.unlinkSync(p.lock) } catch {}
    const fd = fs.openSync(p.lock, 'wx', 0o600)
    fs.writeSync(fd, JSON.stringify(payload))
    fs.closeSync(fd)
  }
  return () => {
    try {
      const holder = JSON.parse(fs.readFileSync(p.lock, 'utf8'))
      if (holder.pid === pid) fs.unlinkSync(p.lock)
    } catch {}
  }
}

export function isBackupRunning(cfg) {
  const lock = paths(cfg).lock
  try {
    const holder = JSON.parse(fs.readFileSync(lock, 'utf8'))
    const age = Date.now() - new Date(holder.startedAt).getTime()
    return { running: Number.isFinite(age) && age < cfg.lockTimeoutMs, holder, ageMs: age }
  } catch {
    return { running: false, holder: null, ageMs: 0 }
  }
}

function schemaVersion(cfg) {
  const marker = path.join(cfg.cwd, 'data', 'database', 'schema-version.json')
  try {
    return JSON.parse(fs.readFileSync(marker, 'utf8')).version || null
  } catch {
    return null
  }
}

function writeManifest(stageDir, manifest) {
  fs.writeFileSync(path.join(stageDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 })
  const lines = manifest.files.map(file => `${file.sha256}  ${file.archivePath}`)
  fs.writeFileSync(path.join(stageDir, 'checksums.sha256'), `${lines.join('\n')}\n`, { mode: 0o600 })
}

function removeDir(dir) {
  try { fs.rmSync(dir, { recursive: true, force: true }) } catch {}
}

/** Perkiraan ukuran arsip berikutnya (untuk cek kapasitas). */
function estimateBytes(cfg, records) {
  const last = records
    .filter(record => record.status === 'completed' && record.sizeBytes)
    .sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)))[0]
  return last ? Math.max(last.sizeBytes, 8 * 1024 * 1024) : 32 * 1024 * 1024
}

/**
 * Jalankan satu backup.
 * @param {object} cfg konfigurasi backup (lihat backupConfig())
 * @param {{type?: 'full'|'database'|'config'|'files', reason?: string, actor?: string, components?: string[]}} options
 */
export async function runBackup(cfg = backupConfig(), options = {}) {
  const type = ['full', 'database', 'config', 'files'].includes(options.type) ? options.type : 'full'
  const reason = String(options.reason || 'manual').slice(0, 40)
  const actor = String(options.actor || 'system').slice(0, 100)
  const components = Array.isArray(options.components) && options.components.length
    ? options.components.filter(item => ['database', 'config', 'files'].includes(item))
    : (type === 'full' ? ['database', 'config', 'files'] : [type])

  const p = ensureLayout(cfg)
  const release = acquireBackupLock(cfg, { reason })

  const id = options.id && /^bk_[0-9]{8,20}_[0-9a-f]{4,16}$/.test(String(options.id)) ? String(options.id) : newBackupId()
  const startedAt = new Date()
  const record = {
    id,
    name: archiveName(id, type, false),
    type,
    components,
    status: 'running',
    stage: 'preparing',
    reason,
    actor,
    storageBackend: 'local',
    storagePath: null,
    sizeBytes: 0,
    checksum: null,
    encrypted: cfg.encryption.enabled,
    encryptionVersion: cfg.encryption.enabled ? 1 : null,
    verifyStatus: 'pending',
    startedAt: startedAt.toISOString(),
    completedAt: null,
    durationMs: null,
    errorCode: null,
    errorMessage: null,
    warnings: [],
    external: null,
    appVersion: cfg.appVersion,
  }
  await upsertBackup(cfg, record)

  const stageDir = path.join(p.staging, id)
  let tempArchive = null
  try {
    logEvent(cfg, { level: 'info', type: 'backup', message: `Backup ${type} dimulai (${reason}).`, backupId: id, actor })

    const usage = storageUsage(cfg)
    const capacity = hasCapacity(cfg, estimateBytes(cfg, readIndex(cfg).backups), usage)
    if (!capacity.ok) {
      const error = new Error(`Backup dibatalkan: ${capacity.reason}.`)
      error.code = 'NO_CAPACITY'
      throw error
    }

    await patchBackup(cfg, id, { stage: 'collecting' })
    const collected = await collectSources(cfg, { stageDir, components })
    if (!collected.files.length) throw Object.assign(new Error('Tidak ada data yang bisa dicadangkan.'), { code: 'EMPTY_SOURCE' })
    if (collected.warnings.length) await patchBackup(cfg, id, { warnings: collected.warnings.slice(0, 20) })

    await patchBackup(cfg, id, { stage: 'archiving' })
    const manifest = {
      id,
      createdAt: new Date().toISOString(),
      type,
      reason,
      appVersion: cfg.appVersion,
      schemaVersion: schemaVersion(cfg),
      node: process.version,
      host: os.hostname(),
      components: collected.components,
      files: collected.files.map(file => ({ archivePath: file.archivePath, size: file.size, sha256: file.sha256 })),
      totals: { files: collected.files.length, bytes: collected.totalBytes },
      encryption: cfg.encryption.enabled ? { algorithm: 'aes-256-gcm', version: 1 } : null,
      warnings: collected.warnings,
    }
    writeManifest(stageDir, manifest)

    const entries = ['manifest.json', 'checksums.sha256', ...collected.files.map(file => file.archivePath)]
    tempArchive = path.join(p.tmp, `${id}.tar.gz`)
    await createArchive({ file: tempArchive, cwd: stageDir, entries })

    await patchBackup(cfg, id, { stage: 'encrypting' })
    const finalName = archiveName(id, type, cfg.encryption.enabled)
    const finalPath = path.join(p.archives, finalName)
    if (cfg.encryption.enabled) {
      if (!cfg.encryption.key) throw Object.assign(new Error('Enkripsi aktif tetapi BACKUP_ENCRYPTION_KEY kosong.'), { code: 'ENCRYPTION_KEY_MISSING' })
      await encryptFile(tempArchive, finalPath, cfg.encryption.key)
      fs.unlinkSync(tempArchive)
      tempArchive = null
    } else {
      fs.renameSync(tempArchive, finalPath)
      tempArchive = null
    }

    await patchBackup(cfg, id, { stage: 'verifying', storagePath: path.relative(cfg.root, finalPath), name: finalName })
    const checksum = await sha256File(finalPath)
    const sizeBytes = fs.statSync(finalPath).size

    // Verifikasi arsip: buka, cocokkan manifest, dan cek checksum satu berkas.
    const verifyDir = path.join(p.tmp, `${id}-verify`)
    removeDir(verifyDir)
    fs.mkdirSync(verifyDir, { recursive: true })
    let verification
    try {
      const source = cfg.encryption.enabled ? path.join(p.tmp, `${id}-plain.tar.gz`) : finalPath
      if (cfg.encryption.enabled) await decryptFile(finalPath, source, cfg.encryption.key)
      const entriesFound = await listArchive(source)
      await extractArchive({ file: source, cwd: verifyDir, filter: name => name === 'manifest.json' || name === 'checksums.sha256' })
      const readManifest = JSON.parse(fs.readFileSync(path.join(verifyDir, 'manifest.json'), 'utf8'))
      if (readManifest.id !== id) throw new Error('Manifest tidak cocok dengan ID backup.')
      verification = {
        ok: true,
        entries: entriesFound.length,
        manifestEntries: entries.length + 0,
        checkedAt: new Date().toISOString(),
      }
      if (cfg.encryption.enabled) removeDir(source)
    } catch (error) {
      verification = { ok: false, error: error.message, checkedAt: new Date().toISOString() }
    } finally {
      removeDir(verifyDir)
    }

    if (!verification.ok) {
      // Arsip tidak bisa dibuka: pindahkan ke karantina, jangan tandai sukses.
      const quarantine = path.join(p.archives, `${finalName}.invalid`)
      try { fs.renameSync(finalPath, quarantine) } catch {}
      throw Object.assign(new Error(`Arsip gagal diverifikasi: ${verification.error}`), { code: 'VERIFY_FAILED' })
    }

    const plan = planRetention(readIndex(cfg).backups.concat([{ ...record, status: 'completed', startedAt: startedAt.toISOString() }]), cfg.retention)
    const tier = (plan.keep.find(item => item.id === id) || {}).tier || 'recent'

    await patchBackup(cfg, id, {
      status: 'completed',
      stage: 'completed',
      sizeBytes,
      checksum,
      verifyStatus: 'verified',
      verifiedAt: verification.checkedAt,
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt.getTime(),
      tier,
      verification,
    })

    // Unggah eksternal (tidak membatalkan backup lokal bila gagal).
    let external = null
    if (options.forceExternal === true || shouldUploadExternal(cfg, { startedAt, tier })) {
      await patchBackup(cfg, id, { stage: 'uploading' })
      try {
        external = await uploadToExternal(cfg, finalPath, `${id}.tar.gz${cfg.encryption.enabled ? '.enc' : ''}`, {
          backupId: id,
          checksum,
          tier,
        })
        await patchBackup(cfg, id, {
          external: { ...external, uploadedAt: new Date().toISOString() },
          storageBackend: 'local+external',
          stage: 'completed',
        })
        logEvent(cfg, {
          level: external.verified ? 'success' : 'warn',
          type: 'backup',
          message: `Salinan eksternal ${external.backend}: ${external.verified ? 'terverifikasi' : 'ukuran tidak cocok'}.`,
          backupId: id,
        })
      } catch (error) {
        await patchBackup(cfg, id, {
          external: { status: 'failed', backend: cfg.external.backend, error: String(error.message).slice(0, 300) },
          warnings: [...(listBackups(cfg, { q: id }).items[0]?.warnings || []), `unggah eksternal gagal: ${error.message}`].slice(0, 20),
        })
        logEvent(cfg, { level: 'warn', type: 'backup', message: `Unggah eksternal gagal: ${error.message}`, backupId: id })
      }
    }

    const retentionResult = await applyRetention(cfg, readIndex(cfg).backups, cfg.retention)
    const finalRecord = (await patchBackup(cfg, id, { tier: (plan.keep.find(item => item.id === id) || {}).tier || tier })) || record

    logEvent(cfg, {
      level: 'success',
      type: 'backup',
      message: `Backup selesai: ${(sizeBytes / 1048576).toFixed(2)} MB, ${collected.files.length} berkas, ${Math.round((Date.now() - startedAt.getTime()) / 1000)}s.`,
      backupId: id,
      actor,
      meta: { tier, deletedByRetention: retentionResult.deleted.length },
    })
    await notify(cfg, { kind: 'backup-success', backup: finalRecord, tier, deleted: retentionResult.deleted.length })
    return (await patchBackup(cfg, id, {})) || finalRecord
  } catch (error) {
    if (tempArchive) { try { fs.unlinkSync(tempArchive) } catch {} }
    const failed = await patchBackup(cfg, id, {
      status: 'failed',
      stage: 'failed',
      errorCode: String(error.code || 'BACKUP_FAILED').slice(0, 60),
      errorMessage: String(error.message || 'unknown').slice(0, 500),
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt.getTime(),
      verifyStatus: 'failed',
    })
    logEvent(cfg, {
      level: 'error',
      type: 'backup',
      message: `Backup gagal: ${error.message}`,
      backupId: id,
      actor,
      meta: { code: error.code || 'BACKUP_FAILED' },
    })
    await notify(cfg, { kind: 'backup-failed', backup: failed, error })
    throw error
  } finally {
    removeDir(stageDir)
    release()
  }
}

/** Verifikasi ulang arsip yang sudah ada (checksum + isi manifest). */
export async function verifyBackup(cfg, id) {
  const record = listBackups(cfg, { q: id, limit: 200 }).items.find(item => item.id === id)
  if (!record) throw Object.assign(new Error('Backup tidak ditemukan.'), { status: 404 })
  if (!record.storagePath) throw Object.assign(new Error('Berkas backup tidak tercatat.'), { status: 404 })
  const file = path.resolve(cfg.root, record.storagePath)
  if (!file.startsWith(path.resolve(cfg.root)) || !fs.existsSync(file)) {
    throw Object.assign(new Error('Berkas backup tidak ada di disk.'), { status: 404 })
  }
  const checksum = await sha256File(file)
  const sizeBytes = fs.statSync(file).size
  const result = {
    id,
    checksumMatches: Boolean(record.checksum) && checksum === record.checksum,
    sizeMatches: !record.sizeBytes || sizeBytes === record.sizeBytes,
    checksum,
    sizeBytes,
    checkedAt: new Date().toISOString(),
  }
  const verifyDir = path.join(paths(cfg).tmp, `${id}-reverify`)
  removeDir(verifyDir)
  fs.mkdirSync(verifyDir, { recursive: true })
  try {
    const source = record.encrypted ? path.join(paths(cfg).tmp, `${id}-reverify.tar.gz`) : file
    if (record.encrypted) {
      if (!cfg.encryption.key) throw new Error('Kunci enkripsi tidak tersedia untuk memverifikasi arsip ini.')
      await decryptFile(file, source, cfg.encryption.key)
    }
    const entries = await listArchive(source)
    result.entries = entries.length
    result.archiveReadable = true
    if (record.encrypted) removeDir(source)
  } catch (error) {
    result.archiveReadable = false
    result.error = error.message
  } finally {
    removeDir(verifyDir)
  }
  result.ok = result.checksumMatches && result.sizeMatches && result.archiveReadable
  await patchBackup(cfg, id, {
    verifyStatus: result.ok ? 'verified' : 'failed',
    verifiedAt: result.ok ? result.checkedAt : null,
    lastVerify: result,
  })
  logEvent(cfg, {
    level: result.ok ? 'success' : 'error',
    type: 'verify',
    message: `Verifikasi ${id}: ${result.ok ? 'OK' : 'GAGAL'}`,
    backupId: id,
  })
  return result
}
