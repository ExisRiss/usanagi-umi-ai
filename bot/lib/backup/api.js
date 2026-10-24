/* By AlzRiss - Usanagi Umi AI
 *
 * REST API backup. Dipasang di server HTTP bot yang sudah ada
 * (lib/jadibot-platform-api.js) pada prefiks /api/backup.
 *
 * Autentikasi: header `x-backup-secret` (atau Authorization: Bearer) harus
 * sama dengan BACKUP_ADMIN_SECRET. Dashboard tidak pernah memegang secret ini;
 * Vercel memverifikasi sesi Supabase + role owner lalu meneruskannya di sisi
 * server.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { backupConfig } from './config.js'
import { logEvent } from './log.js'
import {
  ensureLayout, listBackups, getBackup, removeBackupRecord, readAudit, appendAudit, paths,
} from './store.js'
import { runBackup, verifyBackup, newBackupId, isBackupRunning } from './pipeline.js'
import { listArchive, sha256File } from './archive.js'
import { decryptFile, readHeader } from './crypto.js'
import { collectServer, collectStatus, telegramChats } from './status.js'
import { configureScheduler, schedulerSnapshot } from './scheduler.js'
import { createRestore, confirmRestore, cancelRestore, getRestore, listRestores } from './restore.js'
import { readLogs } from './log.js'

const MAX_UPLOAD_BYTES = 200 * 1024 * 1024

function send(res, status, payload, headers = {}) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  })
  res.end(body)
}

function timingSafeEqual(left, right) {
  const a = Buffer.from(String(left || ''))
  const b = Buffer.from(String(right || ''))
  return a.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b)
}

export function authorizedBackupRequest(req, cfg = backupConfig()) {
  const secret = cfg.adminSecret
  if (!secret) return false
  const header = String(req.headers['x-backup-secret'] || '').trim()
  const bearer = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim()
  return timingSafeEqual(secret, header) || timingSafeEqual(secret, bearer)
}

function actorOf(req) {
  return String(req.headers['x-backup-actor'] || 'api').slice(0, 100)
}

async function readBody(req, limit = 1024 * 1024) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) throw Object.assign(new Error('Permintaan terlalu besar.'), { status: 413 })
    chunks.push(chunk)
  }
  if (!chunks.length) return {}
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw Object.assign(new Error('Body JSON tidak valid.'), { status: 400 })
  }
}

function intParam(search, name, fallback, min, max) {
  const raw = search.get(name)
  if (raw === null) return fallback
  const value = Number.parseInt(raw, 10)
  if (!Number.isFinite(value)) return fallback
  return Math.min(Math.max(value, min), max)
}

async function handleUpload(req, res, cfg) {
  const p = ensureLayout(cfg)
  let id = newBackupId()
  let target = path.join(p.archives, `backup_${id}_upload.tar.gz`)
  const length = Number(req.headers['content-length'] || 0)
  if (length > MAX_UPLOAD_BYTES) return send(res, 413, { error: 'Arsip lebih dari 200 MB.' })
  const stream = fs.createWriteStream(target, { mode: 0o600 })
  let written = 0
  try {
    await new Promise((resolve, reject) => {
      req.on('data', chunk => {
        written += chunk.length
        if (written > MAX_UPLOAD_BYTES) {
          req.destroy()
          reject(Object.assign(new Error('Arsip lebih dari 200 MB.'), { status: 413 }))
        }
      })
      req.on('error', reject)
      req.pipe(stream)
      stream.on('finish', resolve)
      stream.on('error', reject)
    })
    // Arsip boleh terenkripsi (format .enc buatan sistem ini sendiri).
    let encrypted = false
    let plain = target
    try {
      readHeader(target)
      encrypted = true
    } catch {}
    if (encrypted) {
      if (!cfg.encryption.key) {
        fs.rmSync(target, { force: true })
        throw Object.assign(new Error('Arsip terenkripsi diunggah tetapi BACKUP_ENCRYPTION_KEY belum diatur di server.'), { status: 409 })
      }
      // Simpan berkas terenkripsi apa adanya; buka salinan sementara hanya untuk validasi.
      fs.renameSync(target, `${target}.enc`)
      target = `${target}.enc`
      plain = path.join(p.tmp, `${id}-upload-plain.tar.gz`)
      await decryptFile(target, plain, cfg.encryption.key)
    }
    const entries = await listArchive(plain)
    if (!entries.some(entry => entry.name === 'manifest.json')) {
      throw Object.assign(new Error('Arsip tidak berisi manifest.json backup ini.'), { status: 400 })
    }
    const verifyDir = path.join(p.tmp, `${id}-upload-verify`)
    fs.mkdirSync(verifyDir, { recursive: true })
    const { extractArchive } = await import('./archive.js')
    await extractArchive({ file: plain, cwd: verifyDir, filter: name => name === 'manifest.json' })
    const manifest = JSON.parse(fs.readFileSync(path.join(verifyDir, 'manifest.json'), 'utf8'))
    fs.rmSync(verifyDir, { recursive: true, force: true })
    if (encrypted) fs.rmSync(plain, { force: true })

    // Pakai identitas asli arsip supaya manifest.id cocok saat restore.
    // Tanpa ini, arsip hasil unggah tidak akan pernah bisa dipulihkan.
    // Bila id itu sudah terdaftar (unggah ulang), JANGAN menimpa catatan
    // lama: buat catatan baru dan tautkan lewat manifestId.
    const manifestId = /^bk_[0-9]{8,20}_[0-9a-f]{4,16}$/.test(String(manifest.id || '')) ? String(manifest.id) : null
    const { getBackup } = await import('./store.js')
    if (manifestId && manifestId !== id && !getBackup(cfg, manifestId)) {
      const suffix = path.extname(target) === '.enc' ? '.enc' : ''
      const renamed = path.join(p.archives, `backup_${manifestId}_upload.tar.gz${suffix}`)
      fs.renameSync(target, renamed)
      target = renamed
      id = manifestId
    }
    const checksum = await sha256File(target)
    const record = {
      id,
      name: path.basename(target),
      type: ['full', 'database', 'config', 'files'].includes(manifest.type) ? manifest.type : 'full',
      components: manifest.files ? [...new Set(manifest.files.map(file => String(file.archivePath).split('/')[0]))].filter(item => item !== 'manifest.json') : [],
      status: 'completed',
      stage: 'completed',
      reason: 'upload',
      actor: actorOf(req),
      storageBackend: 'local',
      storagePath: path.relative(cfg.root, target),
      sizeBytes: fs.statSync(target).size,
      checksum,
      encrypted,
      verifyStatus: 'verified',
      verifiedAt: new Date().toISOString(),
      startedAt: manifest.createdAt || new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: 0,
      appVersion: manifest.appVersion || null,
      schemaVersion: manifest.schemaVersion || null,
      warnings: ['arsip diunggah manual'],
      tier: 'recent',
      manifestId: manifest.id || null,
    }
    const { upsertBackup } = await import('./store.js')
    upsertBackup(cfg, record)
    appendAudit(cfg, { actor: record.actor, action: 'backup.upload', resource: id, meta: { bytes: written, entries: entries.length } })
    logEvent(cfg, { level: 'success', type: 'backup', message: `Arsip unggahan diterima: ${entries.length} entri, ${(written / 1048576).toFixed(2)} MB.`, backupId: id, actor: record.actor })
    return send(res, 201, { ok: true, backup: record })
  } catch (error) {
    try { fs.rmSync(target, { force: true }) } catch {}
    throw error
  }
}

/**
 * Router. Mengembalikan true bila request ditangani.
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 * @param {string} pathname
 * @param {URLSearchParams} search
 */
export async function handleBackupApi(req, res, pathname, search, cfgOverride = null) {
  const cfg = cfgOverride || backupConfig()
  // Prefiks sengaja dipisah dari /api/backup/* milik website lama
  // (backup/list, backup/create, backup/restore) agar fitur lama tetap jalan.
  const route = pathname.replace(/^\/api\/backup-system/, '') || '/'

  if (route === '/health' && req.method === 'GET') {
    return send(res, 200, { ok: true, service: 'usanagi-backup', version: '1.0.0', uptime: process.uptime() })
  }

  if (!authorizedBackupRequest(req, cfg)) {
    send(res, 401, { error: 'Tidak diizinkan. Header x-backup-secret tidak valid.' })
    return true
  }

  try {
    if (route === '/status' && req.method === 'GET') return send(res, 200, await collectStatus(cfg))
    if (route === '/server' && req.method === 'GET') return send(res, 200, collectServer(cfg))
    if (route === '/storage' && req.method === 'GET') {
      const status = await collectStatus(cfg)
      return send(res, 200, { ...status.storage, backups: status.backups })
    }

    if (route === '/backups' && req.method === 'GET') {
      const result = listBackups(cfg, {
        status: search.get('status') || undefined,
        type: search.get('type') || undefined,
        q: search.get('q') || undefined,
        from: search.get('from') || undefined,
        to: search.get('to') || undefined,
        limit: intParam(search, 'limit', 25, 1, 200),
        offset: intParam(search, 'offset', 0, 0, 100000),
        sort: search.get('sort') === 'asc' ? 'asc' : 'desc',
      })
      return send(res, 200, { ...result, lock: isBackupRunning(cfg) })
    }

    if (route === '/backups' && req.method === 'POST') {
      const body = await readBody(req)
      const type = ['full', 'database', 'config', 'files'].includes(body.type) ? body.type : 'full'
      if (isBackupRunning(cfg).running) return send(res, 409, { error: 'Backup lain sedang berjalan.' })
      const id = newBackupId()
      appendAudit(cfg, { actor: actorOf(req), action: 'backup.start', resource: id, meta: { type, reason: 'api', forceExternal: body.external === 'force' } })
      // Jalankan di latar belakang; klien memantau lewat GET /backups/:id/status.
      runBackup(cfg, { id, type, reason: 'api', actor: actorOf(req), forceExternal: body.external === 'force' }).catch(() => {})
      return send(res, 202, { ok: true, id, status: 'queued' })
    }

    if (route === '/backups/upload' && req.method === 'POST') return await handleUpload(req, res, cfg)

    const idMatch = route.match(/^\/backups\/([A-Za-z0-9_]{6,80})(?:\/(status|download|verify))?$/)
    if (idMatch) {
      const [, id, action] = idMatch
      const record = getBackup(cfg, id)
      if (!record) return send(res, 404, { error: 'Backup tidak ditemukan.' })

      if (!action && req.method === 'GET') return send(res, 200, record)
      if (action === 'status' && req.method === 'GET') {
        return send(res, 200, {
          id, status: record.status, stage: record.stage || null, verifyStatus: record.verifyStatus,
          sizeBytes: record.sizeBytes, startedAt: record.startedAt, completedAt: record.completedAt,
          durationMs: record.durationMs, errorCode: record.errorCode, errorMessage: record.errorMessage,
          warnings: record.warnings || [], external: record.external || null,
        })
      }
      if (action === 'verify' && req.method === 'POST') {
        const result = await verifyBackup(cfg, id)
        appendAudit(cfg, { actor: actorOf(req), action: 'backup.verify', resource: id, result: result.ok ? 'ok' : 'failed' })
        return send(res, result.ok ? 200 : 409, result)
      }
      if (action === 'download' && req.method === 'GET') {
        if (!record.storagePath) return send(res, 404, { error: 'Berkas tidak tercatat.' })
        const file = path.resolve(cfg.root, record.storagePath)
        if (!file.startsWith(path.resolve(cfg.root)) || !fs.existsSync(file)) return send(res, 404, { error: 'Berkas tidak ada.' })
        const stat = fs.statSync(file)
        appendAudit(cfg, { actor: actorOf(req), action: 'backup.download', resource: id })
        logEvent(cfg, { level: 'warn', type: 'api', message: `Arsip ${id} diunduh.`, backupId: id, actor: actorOf(req) })
        res.writeHead(200, {
          'Content-Type': 'application/octet-stream',
          'Content-Length': stat.size,
          'Content-Disposition': `attachment; filename="${path.basename(file).replace(/[^\w.-]/g, '_')}"`,
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        })
        fs.createReadStream(file).pipe(res)
        return true
      }
      if (!action && req.method === 'DELETE') {
        if (search.get('confirm') !== '1') return send(res, 400, { error: 'Tambahkan ?confirm=1 untuk menghapus backup.' })
        if (record.storagePath) {
          const file = path.resolve(cfg.root, record.storagePath)
          if (file.startsWith(path.resolve(cfg.root)) && fs.existsSync(file)) fs.unlinkSync(file)
        }
        removeBackupRecord(cfg, id)
        appendAudit(cfg, { actor: actorOf(req), action: 'backup.delete', resource: id, meta: { bytes: record.sizeBytes } })
        logEvent(cfg, { level: 'warn', type: 'api', message: `Backup ${id} dihapus.`, backupId: id, actor: actorOf(req) })
        return send(res, 200, { ok: true, deleted: id })
      }
      return send(res, 405, { error: 'Metode tidak didukung.' })
    }

    if (route === '/restores' && req.method === 'GET') return send(res, 200, { items: listRestores(cfg, { limit: intParam(search, 'limit', 20, 1, 100) }) })
    if (route === '/restores' && req.method === 'POST') {
      const body = await readBody(req)
      const plan = await createRestore(cfg, {
        backupId: body.backupId,
        components: body.components,
        dryRun: body.dryRun === true,
        actor: actorOf(req),
      })
      appendAudit(cfg, { actor: actorOf(req), action: plan.dryRun ? 'restore.dry-run' : 'restore.plan', resource: String(body.backupId), meta: { files: plan.summary ? plan.summary.files : plan.files } })
      return send(res, plan.dryRun ? 200 : 202, plan)
    }
    const restoreMatch = route.match(/^\/restores\/([A-Za-z0-9_]{6,80})(?:\/(confirm|cancel))?$/)
    if (restoreMatch) {
      const [, restoreId, action] = restoreMatch
      if (!action && req.method === 'GET') {
        const row = getRestore(cfg, restoreId)
        if (!row) return send(res, 404, { error: 'Restore tidak ditemukan.' })
        return send(res, 200, { ...row, token: undefined })
      }
      if (action === 'confirm' && req.method === 'POST') {
        const body = await readBody(req)
        const result = await confirmRestore(cfg, restoreId, { token: body.token, actor: actorOf(req) })
        return send(res, 200, result)
      }
      if (action === 'cancel' && req.method === 'POST') {
        return send(res, 200, await cancelRestore(cfg, restoreId, actorOf(req)))
      }
      return send(res, 405, { error: 'Metode tidak didukung.' })
    }

    if (route === '/scheduler' && req.method === 'GET') return send(res, 200, schedulerSnapshot(cfg))
    if (route === '/scheduler' && req.method === 'PATCH') {
      const body = await readBody(req)
      const result = await configureScheduler(cfg, { enabled: body.enabled, intervalMinutes: body.intervalMinutes })
      appendAudit(cfg, { actor: actorOf(req), action: 'scheduler.update', resource: 'scheduler', meta: { intervalMinutes: result.intervalMinutes, enabled: result.enabled } })
      return send(res, 200, result)
    }
    if (route === '/scheduler/enable' && req.method === 'POST') {
      const result = await configureScheduler(cfg, { enabled: true })
      appendAudit(cfg, { actor: actorOf(req), action: 'scheduler.enable', resource: 'scheduler' })
      return send(res, 200, result)
    }
    if (route === '/scheduler/disable' && req.method === 'POST') {
      const result = await configureScheduler(cfg, { enabled: false })
      appendAudit(cfg, { actor: actorOf(req), action: 'scheduler.disable', resource: 'scheduler' })
      return send(res, 200, result)
    }

    if (route === '/logs' && req.method === 'GET') {
      return send(res, 200, {
        items: readLogs(cfg, {
          level: search.get('level') || undefined,
          type: search.get('type') || undefined,
          limit: intParam(search, 'limit', 100, 1, 500),
          since: search.get('since') || undefined,
        }),
      })
    }
    if (route === '/audit-logs' && req.method === 'GET') {
      return send(res, 200, { items: readAudit(cfg, { limit: intParam(search, 'limit', 100, 1, 500), action: search.get('action') || undefined }) })
    }

    if (route === '/telegram/status' && req.method === 'GET') {
      const status = await collectStatus(cfg)
      return send(res, 200, { ...status.telegram, chats: telegramChats(cfg).length })
    }
    if (route === '/telegram/chats' && req.method === 'GET') {
      return send(res, 200, { items: telegramChats(cfg) })
    }

    if (route === '/paths' && req.method === 'GET') {
      // Hanya untuk diagnosa admin, tetap tanpa isi rahasia.
      const p = paths(cfg)
      return send(res, 200, { root: path.relative(cfg.cwd, p.root), archives: path.relative(cfg.cwd, p.archives) })
    }

    return send(res, 404, { error: 'Endpoint backup tidak ditemukan.' })
  } catch (error) {
    const status = Number(error.status) || (error.code === 'BACKUP_BUSY' ? 409 : 500)
    if (status >= 500) logEvent(cfg, { level: 'error', type: 'api', message: `API ${route} gagal: ${error.message}`, actor: actorOf(req) })
    return send(res, status, { error: String(error.message || 'Terjadi kesalahan.').slice(0, 500) })
  }
}
