/* By AlzRiss - Usanagi Umi AI
 *
 * Log sistem backup: JSON Lines per bulan + buffer memori untuk dashboard.
 * Semua pesan disanitasi sebelum ditulis supaya token/kredensial tidak pernah
 * ikut tersimpan.
 */
import fs from 'node:fs'
import path from 'node:path'

const MAX_LINES_PER_FILE = 20000
const memory = []
const MAX_MEMORY = 500

const SECRET_PATTERNS = [
  [/Bearer\s+[A-Za-z0-9._~+/-]{8,}/gi, 'Bearer ***'],
  [/ptlc_[A-Za-z0-9]{8,}/g, 'ptlc_***'],
  [/ptla_[A-Za-z0-9]{8,}/g, 'ptla_***'],
  [/\b\d{8,10}:[A-Za-z0-9_-]{30,}\b/g, '***telegram-token***'],
  [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}\b/g, '***jwt***'],
  [/(password|secret|token|apikey|api_key|authorization)\s*[:=]\s*\S+/gi, '$1: ***'],
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '***email***'],
]

/** Bersihkan teks dari kredensial dan data pribadi yang tidak perlu. */
export function sanitize(input) {
  let text = String(input === undefined || input === null ? '' : input)
  for (const [pattern, replacement] of SECRET_PATTERNS) text = text.replace(pattern, replacement)
  return text.slice(0, 4000)
}

function logDir(cfg) {
  return path.join(cfg.root, 'logs')
}

/**
 * Tulis satu event.
 * @param {object} cfg konfigurasi backup
 * @param {{level?: 'info'|'warn'|'error'|'success', type?: string, message: string, backupId?: string, actor?: string, meta?: object}} event
 */
export function logEvent(cfg, event) {
  const entry = {
    at: new Date().toISOString(),
    level: ['info', 'warn', 'error', 'success'].includes(event.level) ? event.level : 'info',
    type: sanitize(event.type || 'system').slice(0, 40),
    message: sanitize(event.message || ''),
    backupId: event.backupId ? sanitize(event.backupId).slice(0, 80) : undefined,
    actor: event.actor ? sanitize(event.actor).slice(0, 80) : undefined,
    meta: event.meta === undefined ? undefined : JSON.parse(sanitize(JSON.stringify(event.meta))),
  }
  memory.push(entry)
  if (memory.length > MAX_MEMORY) memory.splice(0, memory.length - MAX_MEMORY)

  try {
    const dir = logDir(cfg)
    fs.mkdirSync(dir, { recursive: true })
    const file = path.join(dir, `${entry.at.slice(0, 7)}.jsonl`)
    fs.appendFileSync(file, `${JSON.stringify(entry)}\n`, { mode: 0o600 })
    rotateIfNeeded(file)
  } catch (error) {
    console.error('[BACKUP] Gagal menulis log:', error.message)
  }

  const line = `[BACKUP][${entry.level.toUpperCase()}] ${entry.message}`
  if (entry.level === 'error') console.error(line)
  else if (entry.level === 'warn') console.warn(line)
  else console.log(line)
  return entry
}

function rotateIfNeeded(file) {
  try {
    const stat = fs.statSync(file)
    if (stat.size < 2 * 1024 * 1024) return
    const lines = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean)
    if (lines.length <= MAX_LINES_PER_FILE) return
    fs.writeFileSync(`${file}.1`, `${lines.slice(-MAX_LINES_PER_FILE).join('\n')}\n`, { mode: 0o600 })
    fs.writeFileSync(file, '', { mode: 0o600 })
  } catch {}
}

/** Baca log dari berkas bulan berjalan + bulan sebelumnya, terbaru dulu. */
export function readLogs(cfg, { level, type, limit = 100, since } = {}) {
  const dir = logDir(cfg)
  const entries = []
  try {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(name => name.endsWith('.jsonl')).sort().slice(-2)
      for (const name of files) {
        const text = fs.readFileSync(path.join(dir, name), 'utf8')
        for (const line of text.split('\n')) {
          if (!line.trim()) continue
          try { entries.push(JSON.parse(line)) } catch {}
        }
      }
    }
  } catch {}
  let result = entries
  if (level) result = result.filter(item => item.level === level)
  if (type) result = result.filter(item => item.type === type)
  if (since) {
    const threshold = new Date(since).getTime()
    if (Number.isFinite(threshold)) result = result.filter(item => new Date(item.at).getTime() >= threshold)
  }
  result.sort((a, b) => String(b.at).localeCompare(String(a.at)))
  return result.slice(0, Math.min(Math.max(Number(limit) || 100, 1), 500))
}

/** Ringkasan dari buffer memori (tanpa I/O) untuk status cepat. */
export function recentLogs(limit = 20) {
  return memory.slice(-Math.min(Math.max(Number(limit) || 20, 1), MAX_MEMORY)).reverse()
}
