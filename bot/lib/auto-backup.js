/* By AlzRiss - Usanagi Umi AI */

import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import archiver from 'archiver'
import { backupConfig } from './backup/config.js'
import { sendDocument, sendMessage as sendTelegramMessage } from './backup/telegram-send.js'

const ROOT = process.cwd()
const state = {
  timer: null,
  running: false,
  nextRetryAt: 0,
  conn: null,
  progress: null,
  lastError: null,
}

/*
 * Task83: arsip harian dikirim ke GROUP TELEGRAM BOT UTAMA, bukan lagi ke
 * nomor WhatsApp owner. Token bot utama sudah tersedia di server (dipakai
 * `lib/platform`), jadi tidak perlu menyalin rahasia ke berkas baru.
 */
const TELEGRAM_SECRET_FILES = [
  path.join('.secrets', 'task70-platform.env'),
  path.join('.secrets', 'telegram.env'),
]

const wait = ms => new Promise(resolve => setTimeout(resolve, ms))
const normalize = value => String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, '')

/*
 * Folder yang TIDAK BOLEH ikut dibackup.
 *
 * `data/auto-backups` wajib di sini: tanpa ini setiap percobaan backup ikut
 * membungkus hasil backup sebelumnya, sehingga ukurannya berlipat ganda tiap
 * percobaan (29 → 48 → 87 → 162 → 311 → 610 bagian) sampai disk penuh
 * (kejadian 2026-10-17: 31 GB di satu container).
 * Sisanya berkas besar yang bisa diunduh ulang (node_modules, cache npm,
 * binary cloudflared, arsip deploy lama).
 */
const DEFAULT_EXCLUDES = [
  'data/auto-backups',
  'data/vercel-backup-exports',
  'node_modules',
  '.npm',
  '.git',
  'tmp',
  'bot-deploy.tar.gz',
  'cloudflared',
]

function config() {
  const value = global.autoBackup || {}
  return {
    enabled: value.enabled !== false,
    timezone: value.timezone || 'Asia/Makassar',
    hour: Math.max(0, Math.min(23, Number(value.hour) || 0)),
    minute: Math.max(0, Math.min(59, Number(value.minute) || 0)),
    checkIntervalMs: Math.max(60_000, Number(value.checkIntervalMs) || 60_000),
    // Percobaan ulang setiap 15 menit terlalu rapat: satu percobaan bisa
    // menulis ratusan MB. Enam jam cukup agar tidak menghabiskan disk.
    retryDelayMs: Math.max(300_000, Number(value.retryDelayMs) || 6 * 60 * 60 * 1000),
    partTargetBytes: Math.max(5 * 1024 * 1024, Number(value.partTargetBytes) || 30 * 1024 * 1024),
    maxPartBytes: Math.max(10 * 1024 * 1024, Number(value.maxPartBytes) || 45 * 1024 * 1024),
    // Batas keras jumlah bagian: > 60 bagian berarti ada folder raksasa yang
    // lolos dari daftar exclude — lebih baik gagal jelas daripada menghabiskan disk.
    maxParts: Math.max(1, Number(value.maxParts) || 60),
    // Jumlah generasi backup yang disimpan di disk (selain batas umur).
    keepGenerations: Math.max(1, Number(value.keepGenerations) || 2),
    retentionDays: Math.max(1, Number(value.retentionDays) || 3),
    // Jangan mulai backup kalau ruang disk tinggal sedikit.
    minFreeBytes: Math.max(0, Number(value.minFreeBytes) || 3 * 1024 * 1024 * 1024),
    // Jeda antar bagian. Telegram membatasi ±20 pesan/menit per chat; 4 detik
    // masih aman dan tetap cepat untuk 4–6 bagian.
    sendDelayMs: Math.max(0, Number(value.sendDelayMs) || 4000),
    telegram: {
      token: String((value.telegram && value.telegram.token) || value.telegramToken || '').trim(),
      chatId: String(value.telegramChatId || (value.telegram && value.telegram.chatId) || '').trim(),
    },
    outputDirectory: path.resolve(ROOT, value.outputDirectory || 'data/auto-backups'),
    exclude: new Set([...DEFAULT_EXCLUDES, ...(value.exclude || [])].map(normalize).filter(Boolean)),
  }
}

function parseEnvFile(file) {
  const out = {}
  try {
    for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue
      const index = line.indexOf('=')
      if (index < 1) continue
      let value = line.slice(index + 1).trim()
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      out[line.slice(0, index).trim()] = value
    }
  } catch {}
  return out
}

/**
 * Tujuan pengiriman arsip: token bot utama + ID group.
 *
 * Urutan: config.js (global.autoBackup) → environment proses (termasuk
 * `.backup-system.env` yang dimuat `backupConfig()`) → berkas rahasia server.
 * Nilai secret tidak pernah dicetak ke log.
 */
function telegramTarget() {
  const cfg = config()
  const env = backupConfig(ROOT).telegram
  let token = cfg.telegram.token || String(process.env.TELEGRAM_BOT_TOKEN || '').trim() || env.token
  let chatId = cfg.telegram.chatId || String(process.env.TELEGRAM_BACKUP_CHAT_ID || '').trim() || env.chatId
  for (const relative of TELEGRAM_SECRET_FILES) {
    if (token && chatId) break
    const values = parseEnvFile(path.join(ROOT, relative))
    if (!token && values.TELEGRAM_BOT_TOKEN) token = values.TELEGRAM_BOT_TOKEN.trim()
    if (!chatId && values.TELEGRAM_BACKUP_CHAT_ID) chatId = values.TELEGRAM_BACKUP_CHAT_ID.trim()
  }
  return { token: String(token || '').trim(), chatId: String(chatId || '').trim() }
}

function localDateParts(timezone) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date())
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]))
  return {
    date: `${value.year}-${value.month}-${value.day}`,
    stamp: `${value.year}${value.month}${value.day}-${value.hour}${value.minute}`,
    hour: Number(value.hour),
    minute: Number(value.minute),
  }
}

function excluded(relative, cfg) {
  const key = normalize(relative)
  if (!key) return false
  if (['.env.groq','.groq.env'].includes(path.basename(key)) || key.startsWith('.umi-update-stage-') || key.startsWith('.umi-source-rollback-')) return true
  for (const item of cfg.exclude) {
    if (key === item || key.startsWith(`${item}/`)) return true
  }
  return false
}

async function collectFiles(directory, cfg, base = ROOT, output = []) {
  const entries = await fsp.readdir(directory, { withFileTypes: true })
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name)
    // Jangan pernah membungkus folder output backup ke dalam backup itu sendiri.
    if (absolute === cfg.outputDirectory || absolute.startsWith(cfg.outputDirectory + path.sep)) continue
    const relative = normalize(path.relative(base, absolute))
    if (excluded(relative, cfg)) continue
    if (entry.isSymbolicLink()) continue
    if (entry.isDirectory()) {
      await collectFiles(absolute, cfg, base, output)
      continue
    }
    if (!entry.isFile()) continue
    const stat = await fsp.stat(absolute)
    output.push({ absolute, relative, size: stat.size, mtime: stat.mtime.toISOString() })
  }
  return output
}

function partitionFiles(files, targetBytes) {
  const groups = []
  let current = [], currentSize = 0
  for (const file of files.sort((a, b) => a.relative.localeCompare(b.relative))) {
    if (current.length && currentSize + file.size > targetBytes) {
      groups.push(current)
      current = []
      currentSize = 0
    }
    current.push(file)
    currentSize += file.size
  }
  if (current.length) groups.push(current)
  return groups
}

function createZip(destination, files, manifest) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(destination, { mode: 0o600 })
    const archive = archiver('zip', { zlib: { level: 6 } })
    output.on('close', resolve)
    output.on('error', reject)
    archive.on('warning', error => error.code === 'ENOENT' ? console.warn('[AUTO-BACKUP]', error.message) : reject(error))
    archive.on('error', reject)
    archive.pipe(output)
    archive.append(`${JSON.stringify(manifest, null, 2)}\n`, { name: 'BACKUP-MANIFEST.json' })
    for (const file of files) archive.file(file.absolute, { name: file.relative })
    archive.finalize()
  })
}

async function checksum(file) {
  const digest = crypto.createHash('sha256')
  await new Promise((resolve, reject) => {
    const input = fs.createReadStream(file)
    input.on('data', chunk => digest.update(chunk))
    input.on('end', resolve)
    input.on('error', reject)
  })
  return digest.digest('hex')
}

async function splitOversizeZip(file, maxBytes) {
  const stat = await fsp.stat(file)
  if (stat.size <= maxBytes) return [file]
  const input = await fsp.open(file, 'r')
  const outputs = []
  try {
    let offset = 0, index = 1
    while (offset < stat.size) {
      const length = Math.min(maxBytes, stat.size - offset)
      const buffer = Buffer.allocUnsafe(length)
      await input.read(buffer, 0, length, offset)
      const part = `${file}.${String(index).padStart(3, '0')}`
      await fsp.writeFile(part, buffer, { mode: 0o600 })
      outputs.push(part)
      offset += length
      index += 1
    }
  } finally {
    await input.close()
  }
  await fsp.unlink(file)
  return outputs
}

function generationOf(name) {
  const match = /^(usanagi-full-backup-\d{8}-\d{4})-part-/.exec(name)
  return match ? match[1] : null
}

async function pruneBackups(cfg) {
  await fsp.mkdir(cfg.outputDirectory, { recursive: true })
  const deadline = Date.now() - cfg.retentionDays * 86_400_000
  const generations = new Map()
  for (const entry of await fsp.readdir(cfg.outputDirectory, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.startsWith('usanagi-full-backup-')) continue
    const file = path.join(cfg.outputDirectory, entry.name)
    const stat = await fsp.stat(file).catch(() => null)
    if (!stat) continue
    const generation = generationOf(entry.name)
    if (!generation) {
      // Nama tidak mengikuti pola bagian resmi → sisa percobaan lama.
      await fsp.unlink(file).catch(() => {})
      continue
    }
    const list = generations.get(generation) || []
    list.push({ file, stat })
    generations.set(generation, list)
  }
  const ordered = [...generations.entries()].sort((a, b) => b[0].localeCompare(a[0]))
  for (let index = 0; index < ordered.length; index += 1) {
    const files = ordered[index][1]
    const expired = files.every(item => item.stat.mtimeMs < deadline)
    // Bagian 0 byte = percobaan yang gagal di tengah jalan (mis. disk penuh).
    const broken = files.some(item => item.stat.size === 0)
    const surplus = index >= cfg.keepGenerations
    if (!expired && !broken && !surplus) continue
    for (const item of files) await fsp.unlink(item.file).catch(() => {})
  }
}

async function freeDiskBytes(directory) {
  try {
    const stat = await fsp.statfs(directory)
    return Number(stat.bavail) * Number(stat.bsize)
  } catch {
    return null
  }
}

function stateFile(cfg) {
  return path.join(cfg.outputDirectory, 'state.json')
}

async function readBackupState(cfg) {
  try { return JSON.parse(await fsp.readFile(stateFile(cfg), 'utf8')) } catch { return {} }
}

async function writeBackupState(cfg, value) {
  await fsp.mkdir(cfg.outputDirectory, { recursive: true })
  const target = stateFile(cfg), temp = `${target}.${process.pid}.tmp`
  await fsp.writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 })
  await fsp.rename(temp, target)
}

async function sendArchive(target, file, index, total, backupDate, digest) {
  const name = path.basename(file)
  const multipart = /\.zip\.\d{3}$/.test(name)
  const caption = [
    `📦 <b>AUTO BACKUP USANAGI UMI AI</b>`,
    `Tanggal: ${backupDate}`,
    `Bagian: ${index}/${total}`,
    `SHA-256: <code>${digest}</code>`,
    multipart ? 'File ini adalah pecahan ZIP. Gabungkan semua .001, .002, dst sebelum diekstrak.' : 'Arsip ZIP siap diekstrak.',
    '',
    'By AlzRiss - Usanagi Umi AI',
  ].join('\n')
  return sendDocument(target.token, target.chatId, file, {
    caption,
    filename: name,
    mime: multipart ? 'application/octet-stream' : 'application/zip',
  })
}

export async function runFullBackup({ force = false, reason = 'daily' } = {}) {
  const cfg = config()
  if (!cfg.enabled && !force) return { skipped: true, reason: 'disabled' }
  if (state.running) return { skipped: true, reason: 'already-running' }

  /*
   * Task83: pengiriman tidak lagi bergantung pada socket WhatsApp. Selama token
   * bot utama + ID group tersedia, backup tetap jalan walau bot WA terputus.
   */
  const target = telegramTarget()
  if (!target.token || !target.chatId) {
    return { skipped: true, reason: 'telegram-not-configured' }
  }

  const local = localDateParts(cfg.timezone)
  const previous = await readBackupState(cfg)
  if (!force && previous.lastSuccessDate === local.date) return { skipped: true, reason: 'already-backed-up' }

  state.running = true
  const startedAt = new Date().toISOString()
  const created = []
  state.progress = { phase: 'zipping', startedAt, sent: 0, total: 0 }
  try {
    await pruneBackups(cfg)
    const free = await freeDiskBytes(cfg.outputDirectory)
    if (free !== null && free < cfg.minFreeBytes) {
      throw new Error(`Ruang disk tidak cukup untuk backup (${(free / 1024 / 1024 / 1024).toFixed(2)} GB tersisa).`)
    }
    const files = await collectFiles(ROOT, cfg)
    if (!files.length) throw new Error('Tidak ada file yang dapat dibackup')
    const groups = partitionFiles(files, cfg.partTargetBytes)
    if (groups.length > cfg.maxParts) {
      throw new Error(`Backup butuh ${groups.length} bagian (batas ${cfg.maxParts}). Periksa folder besar yang belum di-exclude.`)
    }
    const archives = []
    const baseName = `usanagi-full-backup-${local.stamp}`

    for (let index = 0; index < groups.length; index += 1) {
      const group = groups[index]
      const zip = path.join(cfg.outputDirectory, `${baseName}-part-${String(index + 1).padStart(2, '0')}-of-${String(groups.length).padStart(2, '0')}.zip`)
      const manifest = {
        product: 'Usanagi Umi AI',
        credit: 'By AlzRiss - Usanagi Umi AI',
        createdAt: new Date().toISOString(),
        timezone: cfg.timezone,
        reason,
        root: path.basename(ROOT),
        part: index + 1,
        totalParts: groups.length,
        files: group.map(file => ({ path: file.relative, size: file.size, modifiedAt: file.mtime })),
      }
      await createZip(zip, group, manifest)
      const parts = await splitOversizeZip(zip, cfg.maxPartBytes)
      archives.push(...parts)
      created.push(...parts)
    }

    const records = []
    for (const file of archives) records.push({ file, digest: await checksum(file), size: (await fsp.stat(file)).size })

    state.progress = { phase: 'sending', startedAt, sent: 0, total: records.length, chatId: target.chatId }

    await sendTelegramMessage(
      target.token,
      target.chatId,
      `⏳ <b>Backup otomatis ${local.date}</b>\nSelesai dibungkus. Mengirim ${records.length} bagian ZIP...\n\nBy AlzRiss - Usanagi Umi AI`
    ).catch(error => console.warn('[AUTO-BACKUP] pesan pembuka gagal:', error.message))

    const messageIds = []
    for (let index = 0; index < records.length; index += 1) {
      const sent = await sendArchive(target, records[index].file, index + 1, records.length, local.date, records[index].digest)
      if (sent && sent.messageId) messageIds.push(sent.messageId)
      state.progress = { phase: 'sending', startedAt, sent: index + 1, total: records.length, chatId: target.chatId }
      if (index + 1 < records.length && cfg.sendDelayMs) await wait(cfg.sendDelayMs)
    }

    await sendTelegramMessage(
      target.token,
      target.chatId,
      `✅ <b>Backup otomatis terkirim lengkap.</b>\nFile: ${files.length}\nBagian ZIP: ${records.length}\nUkuran: ${(records.reduce((sum, item) => sum + item.size, 0) / 1024 / 1024).toFixed(2)} MB\n\nBy AlzRiss - Usanagi Umi AI`
    ).catch(error => console.warn('[AUTO-BACKUP] pesan penutup gagal:', error.message))

    const result = {
      lastSuccessDate: local.date,
      completedAt: new Date().toISOString(),
      startedAt,
      reason,
      fileCount: files.length,
      parts: records.map(item => ({ name: path.basename(item.file), size: item.size, sha256: item.digest })),
      telegram: { chatId: target.chatId, messageIds },
    }
    await writeBackupState(cfg, result)
    state.nextRetryAt = 0
    state.lastError = null
    state.progress = { phase: 'done', startedAt, sent: records.length, total: records.length, chatId: target.chatId, completedAt: result.completedAt }
    console.log(`[AUTO-BACKUP] ${files.length} file, ${records.length} bagian berhasil dikirim ke group Telegram ${target.chatId}.`)
    return result
  } catch (error) {
    // Percobaan gagal tidak boleh meninggalkan pecahan ZIP: dulu sisa ini
    // menumpuk tiap 15 menit dan menghabiskan disk.
    for (const file of created) await fsp.unlink(file).catch(() => {})
    state.nextRetryAt = Date.now() + cfg.retryDelayMs
    state.lastError = error.message
    state.progress = { phase: 'failed', startedAt, total: 0, error: error.message }
    console.error('[AUTO-BACKUP]', error)
    throw error
  } finally {
    state.running = false
  }
}

/** Ringkasan untuk dashboard/console owner (tanpa membocorkan token). */
export async function autoBackupSnapshot() {
  const cfg = config()
  const target = telegramTarget()
  const previous = await readBackupState(cfg)
  return {
    enabled: cfg.enabled,
    running: state.running,
    schedule: `${String(cfg.hour).padStart(2, '0')}:${String(cfg.minute).padStart(2, '0')} ${cfg.timezone}`,
    nextRetryAt: state.nextRetryAt ? new Date(state.nextRetryAt).toISOString() : null,
    telegram: {
      configured: Boolean(target.token && target.chatId),
      tokenSet: Boolean(target.token),
      chatId: target.chatId || null,
    },
    progress: state.progress,
    lastError: state.lastError,
    lastSuccessDate: previous.lastSuccessDate || null,
    completedAt: previous.completedAt || null,
    fileCount: previous.fileCount || 0,
    partCount: (previous.parts || []).length,
    messageIds: (previous.telegram && previous.telegram.messageIds) || [],
  }
}

async function schedulerTick() {
  const cfg = config()
  if (!cfg.enabled || state.running || Date.now() < state.nextRetryAt) return
  const local = localDateParts(cfg.timezone)
  if (local.hour < cfg.hour || (local.hour === cfg.hour && local.minute < cfg.minute)) return
  const previous = await readBackupState(cfg)
  if (previous.lastSuccessDate === local.date) return
  await runFullBackup({ reason: 'daily' }).catch(() => {})
}

export function installAutoBackup(conn) {
  state.conn = conn
  global.runFullBackup = options => runFullBackup({ ...(options || {}) })
  if (state.timer) clearInterval(state.timer)
  const cfg = config()
  if (!cfg.enabled) {
    console.log('[AUTO-BACKUP] Dinonaktifkan melalui config.js')
    return
  }
  state.timer = setInterval(schedulerTick, cfg.checkIntervalMs)
  state.timer.unref?.()
  setTimeout(schedulerTick, 15_000).unref?.()
  console.log(`[AUTO-BACKUP] Aktif setiap hari pukul ${String(cfg.hour).padStart(2, '0')}:${String(cfg.minute).padStart(2, '0')} ${cfg.timezone}`)
}

export function updateAutoBackupConnection(conn) {
  state.conn = conn
}

export default { installAutoBackup, updateAutoBackupConnection, runFullBackup, autoBackupSnapshot }
