/* Private safe-operational backup exporter for the Vercel backup service. */

import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import archiver from 'archiver'

const ROOT = process.cwd()
const EXPORT_ROOT = path.join(ROOT, 'data', 'vercel-backup-exports')
const SESSION_ROOT = path.join(ROOT, 'sessions', 'jadibot')
const CUSTOM_PLUGIN_ROOT = path.join(ROOT, 'plugins', 'custom')
const PLATFORM_DB = path.join(ROOT, 'data', 'jadibot-platform.json')
const MAX_EXPORT_AGE_MS = 60 * 60 * 1000
const state = { active: null }

function safeGeneration(value) {
  const generation = String(value || '').trim()
  if (!/^[A-Za-z0-9_-]{16,96}$/.test(generation)) {
    throw Object.assign(new Error('ID generasi backup tidak valid.'), { status: 400 })
  }
  return generation
}

function normalize(relative) {
  return String(relative || '').replace(/\\/g, '/').replace(/^\/+/, '')
}

function sourceFile(name) {
  if (name === 'config.js' || name.startsWith('.env') || /(?:^|\.)pem$/i.test(name) || /(?:^|\.)key$/i.test(name)) return false
  return /\.(?:js|cjs|mjs|json|md|txt|ya?ml|ttf|otf|woff2?|png|jpe?g|webp)$/i.test(name) || ['Dockerfile', 'Procfile', 'LICENSE'].includes(name)
}

async function collectTree(directory, relativePrefix, output, filter) {
  let entries = []
  try { entries = await fsp.readdir(directory, { withFileTypes: true }) } catch (error) {
    if (error.code === 'ENOENT') return output
    throw error
  }
  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue
    const absolute = path.join(directory, entry.name)
    const relative = normalize(path.join(relativePrefix, entry.name))
    if (entry.isDirectory()) {
      if (filter({ type: 'directory', absolute, relative, name: entry.name })) await collectTree(absolute, relative, output, filter)
      continue
    }
    if (!entry.isFile() || !filter({ type: 'file', absolute, relative, name: entry.name })) continue
    const stat = await fsp.stat(absolute)
    output.push({ absolute, relative, size: stat.size, modifiedAt: stat.mtime.toISOString() })
  }
  return output
}

async function collectBotSource() {
  const files = []
  const allowedDirectories = new Set(['lib', 'plugins', 'integrations', 'tests', 'core', 'database', 'commands', 'src', 'locales', 'language', 'languages'])
  const entries = await fsp.readdir(ROOT, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.isSymbolicLink()) continue
    const absolute = path.join(ROOT, entry.name)
    if (entry.isFile() && sourceFile(entry.name)) {
      const stat = await fsp.stat(absolute)
      files.push({ absolute, relative: entry.name, size: stat.size, modifiedAt: stat.mtime.toISOString() })
      continue
    }
    if (!entry.isDirectory() || !allowedDirectories.has(entry.name)) continue
    await collectTree(absolute, entry.name, files, item => item.type === 'directory' || sourceFile(item.name) || /^integrations\/(?:umi|ourin)\/config\.js$/.test(item.relative))
  }
  return files.sort((a, b) => a.relative.localeCompare(b.relative))
}

async function collectJadibotSettings() {
  const files = []
  try {
    const stat = await fsp.stat(PLATFORM_DB)
    files.push({ absolute: PLATFORM_DB, relative: 'data/jadibot-platform.json', size: stat.size, modifiedAt: stat.mtime.toISOString() })
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }

  // A Jadibot session may contain WhatsApp credentials and media. Deliberately
  // include only its bot-config.json, never creds.json or the rest of session data.
  await collectTree(SESSION_ROOT, 'sessions/jadibot', files, item => {
    if (item.type === 'directory') return true
    return item.name === 'bot-config.json'
  })

  // Custom plugins are operational configuration/code and do not contain the
  // WhatsApp auth state. Keep only text source formats.
  await collectTree(CUSTOM_PLUGIN_ROOT, 'plugins/custom', files, item => item.type === 'directory' || sourceFile(item.name))
  return files.sort((a, b) => a.relative.localeCompare(b.relative))
}

function archiveFile(destination, kind, files, generation) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(destination, { mode: 0o600 })
    const archive = archiver('tar', { gzip: true, gzipOptions: { level: 6 } })
    const manifest = {
      schemaVersion: 1,
      product: 'Usanagi Umi Jadibot',
      kind,
      scope: 'safe-operational',
      generation,
      createdAt: new Date().toISOString(),
      exclusions: kind === 'bot'
        ? ['config.js', '.env*', 'credential files', 'tokens', 'sessions/', 'node_modules/', 'data/']
        : ['sessions/jadibot/**/creds.json', 'all other WhatsApp session credentials', 'session media'],
      files: files.map(file => ({ path: file.relative, size: file.size, modifiedAt: file.modifiedAt })),
    }
    output.on('close', resolve)
    output.on('error', reject)
    archive.on('warning', error => error.code === 'ENOENT' ? console.warn('[VERCEL-BACKUP]', error.message) : reject(error))
    archive.on('error', reject)
    archive.pipe(output)
    archive.append(`${JSON.stringify(manifest, null, 2)}\n`, { name: 'BACKUP-MANIFEST.json' })
    for (const file of files) archive.file(file.absolute, { name: file.relative })
    archive.finalize()
  })
}

async function checksum(file) {
  const hash = crypto.createHash('sha256')
  await new Promise((resolve, reject) => {
    const input = fs.createReadStream(file)
    input.on('data', chunk => hash.update(chunk))
    input.on('error', reject)
    input.on('end', resolve)
  })
  return hash.digest('hex')
}

async function describe(kind, file, sourceCount) {
  const stat = await fsp.stat(file)
  return { kind, name: path.basename(file), bytes: stat.size, sha256: await checksum(file), sourceFiles: sourceCount }
}

async function pruneExpiredExports(exceptGeneration = '') {
  await fsp.mkdir(EXPORT_ROOT, { recursive: true })
  const cutoff = Date.now() - MAX_EXPORT_AGE_MS
  for (const entry of await fsp.readdir(EXPORT_ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === exceptGeneration) continue
    const destination = path.join(EXPORT_ROOT, entry.name)
    try {
      const stat = await fsp.stat(destination)
      if (stat.mtimeMs < cutoff) await fsp.rm(destination, { recursive: true, force: true })
    } catch {}
  }
}

async function createExport(generation) {
  const destination = path.join(EXPORT_ROOT, generation)
  await fsp.rm(destination, { recursive: true, force: true })
  await fsp.mkdir(destination, { recursive: true, mode: 0o700 })
  const [botFiles, jadibotFiles] = await Promise.all([collectBotSource(), collectJadibotSettings()])
  const botArchive = path.join(destination, 'bot.tar.gz')
  const jadibotArchive = path.join(destination, 'jadibot.tar.gz')
  await archiveFile(botArchive, 'bot', botFiles, generation)
  await archiveFile(jadibotArchive, 'jadibot', jadibotFiles, generation)
  const archives = await Promise.all([
    describe('bot', botArchive, botFiles.length),
    describe('jadibot', jadibotArchive, jadibotFiles.length),
  ])
  const result = { generation, createdAt: new Date().toISOString(), archives }
  await fsp.writeFile(path.join(destination, 'export.json'), `${JSON.stringify(result, null, 2)}\n`, { mode: 0o600 })
  await pruneExpiredExports(generation)
  return result
}

export async function prepareBackupExport(value) {
  const generation = safeGeneration(value)
  if (state.active) {
    if (state.active.generation !== generation) throw Object.assign(new Error('Backup lain masih diproses.'), { status: 409 })
    return state.active.promise
  }
  const promise = createExport(generation).finally(() => { state.active = null })
  state.active = { generation, promise }
  return promise
}

export async function getBackupExportFile(value, kind) {
  const generation = safeGeneration(value)
  if (!['bot', 'jadibot'].includes(kind)) throw Object.assign(new Error('Jenis arsip backup tidak valid.'), { status: 404 })
  const file = path.join(EXPORT_ROOT, generation, `${kind}.tar.gz`)
  try {
    const stat = await fsp.stat(file)
    if (!stat.isFile()) throw new Error('not file')
    return { file, bytes: stat.size }
  } catch {
    throw Object.assign(new Error('Arsip backup tidak tersedia atau sudah kedaluwarsa.'), { status: 404 })
  }
}

export async function cleanupBackupExport(value) {
  const generation = safeGeneration(value)
  if (state.active?.generation === generation) throw Object.assign(new Error('Backup masih diproses.'), { status: 409 })
  await fsp.rm(path.join(EXPORT_ROOT, generation), { recursive: true, force: true })
  return { generation, removed: true }
}
