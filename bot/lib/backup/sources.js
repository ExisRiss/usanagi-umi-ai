/* By AlzRiss - Usanagi Umi AI
 *
 * Pengumpulan data yang dicadangkan.
 *
 * Komponen:
 *   database  snapshot konsisten SQLite + database.json + registry platform
 *   config    bot-config.json tiap sesi + berkas JSON non-rahasia di data/
 *   files     plugin kustom milik sesi Jadibot
 *
 * Rahasia TIDAK pernah masuk arsip biasa: .env*, creds.json, tunnel-creds,
 * webgame.json (berisi token game), kunci privat, dan folder backup itu sendiri.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

export const COMPONENTS = ['database', 'config', 'files']

const SECRET_FILE_PATTERNS = [
  /(^|\/)\.env(\.|$)/i,
  /(^|\/)creds\.json$/i,
  /(^|\/)tunnel-creds[^/]*\.json$/i,
  /(^|\/)webgame\.json$/i,
  /(^|\/)api[-_]?keys?[^/]*\.json$/i,
  /(^|\/)[^/]*(secret|token|password|credential)[^/]*\.(json|env|txt|pem|key)$/i,
  /\.(pem|key|p12|pfx)$/i,
  /(^|\/)auth_info[^/]*$/i,
]

const SKIP_DIRS = new Set(['node_modules', '.git', '.cache', 'tmp', 'backup-system', 'vercel-backup-exports', 'jadibot-backups'])

export function isSecretPath(relativePath) {
  const normalized = String(relativePath || '').replace(/\\/g, '/')
  return SECRET_FILE_PATTERNS.some(pattern => pattern.test(normalized))
}

function shouldSkipDir(name) {
  return SKIP_DIRS.has(name) || name.startsWith('.trashed-')
}

function listFilesRecursive(root, relativeBase = '', { maxFiles = 5000, maxBytes = 512 * 1024 * 1024 } = {}) {
  const out = []
  let totalBytes = 0
  const stack = [{ abs: path.join(root, relativeBase), rel: relativeBase }]
  while (stack.length) {
    const current = stack.pop()
    let entries = []
    try {
      entries = fs.readdirSync(current.abs, { withFileTypes: true })
    } catch {
      continue
    }
    for (const entry of entries) {
      const rel = current.rel ? `${current.rel}/${entry.name}` : entry.name
      if (entry.isDirectory()) {
        if (shouldSkipDir(entry.name)) continue
        stack.push({ abs: path.join(current.abs, entry.name), rel })
        continue
      }
      if (!entry.isFile()) continue
      if (isSecretPath(rel)) continue
      let size = 0
      try { size = fs.statSync(path.join(current.abs, entry.name)).size } catch { continue }
      if (totalBytes + size > maxBytes) continue
      totalBytes += size
      out.push({ relative: rel, absolute: path.join(current.abs, entry.name), size })
      if (out.length >= maxFiles) return out
    }
  }
  return out
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 })
}

function copyWithChecksum(source, target) {
  ensureDir(path.dirname(target))
  const hash = crypto.createHash('sha256')
  const fd = fs.openSync(target, 'w', 0o600)
  try {
    const buffer = Buffer.allocUnsafe(1024 * 1024)
    const input = fs.openSync(source, 'r')
    try {
      while (true) {
        const read = fs.readSync(input, buffer, 0, buffer.length, null)
        if (!read) break
        const chunk = buffer.subarray(0, read)
        hash.update(chunk)
        fs.writeSync(fd, chunk)
      }
    } finally {
      fs.closeSync(input)
    }
  } finally {
    fs.closeSync(fd)
  }
  return hash.digest('hex')
}

/** Snapshot SQLite konsisten memakai API backup better-sqlite3. */
export async function snapshotSqlite(sqlitePath, targetPath) {
  if (!fs.existsSync(sqlitePath)) return { included: false, reason: 'berkas sqlite tidak ada' }
  ensureDir(path.dirname(targetPath))
  try {
    const { default: Database } = await import('better-sqlite3')
    const db = new Database(sqlitePath, { readonly: true, fileMustExist: true })
    try {
      await db.backup(targetPath)
    } finally {
      db.close()
    }
    const check = new Database(targetPath, { readonly: true, fileMustExist: true })
    try {
      const row = check.prepare('PRAGMA quick_check').get()
      const value = row ? Object.values(row)[0] : 'ok'
      if (String(value).toLowerCase() !== 'ok') throw new Error(`quick_check: ${value}`)
    } finally {
      check.close()
    }
    return { included: true, method: 'better-sqlite3.backup', consistent: true, bytes: fs.statSync(targetPath).size }
  } catch (error) {
    // Fallback: salin berkas apa adanya (WAL ikut disalin bila ada).
    try {
      fs.copyFileSync(sqlitePath, targetPath)
      for (const suffix of ['-wal', '-shm']) {
        const extra = `${sqlitePath}${suffix}`
        if (fs.existsSync(extra)) fs.copyFileSync(extra, `${targetPath}${suffix}`)
      }
      return { included: true, method: 'file-copy', consistent: false, reason: error.message, bytes: fs.statSync(targetPath).size }
    } catch (copyError) {
      return { included: false, reason: `gagal snapshot: ${error.message}; fallback: ${copyError.message}` }
    }
  }
}

/**
 * Kumpulkan sumber ke direktori staging.
 * @returns {Promise<{files: Array<{archivePath: string, size: number, sha256: string, source: string}>, components: object, warnings: string[]}>}
 */
export async function collectSources(cfg, { stageDir, components = ['database', 'config', 'files'] } = {}) {
  ensureDir(stageDir)
  const files = []
  const warnings = []
  const summary = {
    database: { included: false },
    config: { included: false, sessions: 0, files: 0 },
    files: { included: false, files: 0 },
  }

  const add = (absolute, archivePath) => {
    const target = path.join(stageDir, archivePath)
    const sha256 = copyWithChecksum(absolute, target)
    const size = fs.statSync(target).size
    files.push({ archivePath, size, sha256, source: path.relative(cfg.cwd, absolute) || path.basename(absolute) })
  }

  if (components.includes('database')) {
    const sqliteTarget = path.join(stageDir, 'database', 'usanagi.sqlite')
    const result = await snapshotSqlite(cfg.sqlitePath, sqliteTarget)
    summary.database = { ...result, path: 'database/usanagi.sqlite' }
    if (result.included) {
      const hash = crypto.createHash('sha256')
      await new Promise((resolve, reject) => {
        fs.createReadStream(sqliteTarget)
          .on('data', chunk => hash.update(chunk))
          .on('error', reject)
          .on('end', resolve)
      })
      files.push({ archivePath: 'database/usanagi.sqlite', size: fs.statSync(sqliteTarget).size, sha256: hash.digest('hex'), source: path.relative(cfg.cwd, cfg.sqlitePath) })
      if (result.consistent === false) warnings.push('Snapshot SQLite memakai salinan berkas (bukan backup API) — bisa kurang konsisten.')
    } else {
      warnings.push(`Database SQLite tidak tercadang: ${result.reason}`)
    }
    if (fs.existsSync(cfg.databaseJson)) {
      add(cfg.databaseJson, 'database/database.json')
      summary.database.jsonIncluded = true
    }
    if (fs.existsSync(cfg.platformState)) {
      add(cfg.platformState, 'config/platform/jadibot-platform.json')
    }
    summary.database.included = files.some(item => item.archivePath.startsWith('database/'))
  }

  if (components.includes('config')) {
    if (fs.existsSync(cfg.sessionsDir)) {
      const sessions = fs.readdirSync(cfg.sessionsDir, { withFileTypes: true }).filter(entry => entry.isDirectory())
      for (const session of sessions) {
        const configFile = path.join(cfg.sessionsDir, session.name, 'bot-config.json')
        if (!fs.existsSync(configFile)) continue
        add(configFile, `config/sessions/${session.name}/bot-config.json`)
      }
      summary.config.sessions = sessions.length
    }
    // Berkas JSON kecil di data/ (state plugin, antrean, dsb) tanpa rahasia.
    if (fs.existsSync(cfg.dataDir)) {
      for (const entry of listFilesRecursive(cfg.dataDir, '', { maxFiles: 400, maxBytes: 64 * 1024 * 1024 })) {
        const rel = entry.relative.replace(/\\/g, '/')
        if (!rel.endsWith('.json') && !rel.endsWith('.jsonl')) continue
        if (rel.startsWith('backup-system/')) continue
        if (rel === 'database/usanagi.sqlite' || rel.includes('usanagi.sqlite')) continue
        if (rel === 'jadibot-platform.json') continue
        add(entry.absolute, `config/data/${rel}`)
      }
    }
    summary.config.included = files.some(item => item.archivePath.startsWith('config/'))
    summary.config.files = files.filter(item => item.archivePath.startsWith('config/')).length
  }

  if (components.includes('files')) {
    if (fs.existsSync(cfg.sessionsDir)) {
      for (const session of fs.readdirSync(cfg.sessionsDir, { withFileTypes: true })) {
        if (!session.isDirectory()) continue
        const pluginsDir = path.join(cfg.sessionsDir, session.name, 'plugins')
        if (!fs.existsSync(pluginsDir)) continue
        for (const entry of listFilesRecursive(pluginsDir, '', { maxFiles: 2000, maxBytes: 128 * 1024 * 1024 })) {
          add(entry.absolute, `files/sessions/${session.name}/plugins/${entry.relative}`)
        }
      }
    }
    summary.files.files = files.filter(item => item.archivePath.startsWith('files/')).length
    summary.files.included = summary.files.files > 0
  }

  const totalBytes = files.reduce((sum, item) => sum + item.size, 0)
  return { files, components: summary, warnings, totalBytes }
}
