/**
 * Deteksi fitur yang MUSTAHIL dijalankan di Telegram.
 *
 * Bot WhatsApp punya kemampuan yang tidak ada padanannya di Bot API Telegram:
 * pesan "rich response" (HTML/JS interaktif yang dirender aplikasi WhatsApp,
 * mis. papan catur, tetris, snake) dan pairing/sesi WhatsApp. Fitur seperti itu
 * tetap hidup di bot WhatsApp & jadibot, tetapi tidak ditampilkan di Telegram.
 *
 * Deteksi dilakukan dari isi berkas plugin (statis, tanpa menjalankan kode).
 * Kalau berkas tidak ditemukan, plugin dianggap didukung — lebih baik fitur
 * tampil daripada hilang karena gagal membaca berkas.
 */
import fs from 'node:fs'
import path from 'node:path'

/** Pola yang berarti fitur bergantung pada kemampuan khusus WhatsApp. */
const PATTERNS = [
  {
    test: /richResponseMessage|botForwardedMessage/,
    reason: 'memakai pesan rich HTML interaktif WhatsApp',
  },
  {
    test: /requestPairingCode|useMultiFileAuthState|waitForConnectionUpdate/,
    reason: 'butuh pairing/sesi WhatsApp',
  },
  {
    // Helper internal yang SELALU membungkus isi jadi rich HTML (papan/meja
    // interaktif). Plugin yang memakainya tidak punya bentuk teks.
    test: /awang-table|awang-rich-forward/,
    reason: 'memakai tabel/papan rich HTML WhatsApp',
  },
]

/**
 * `usanagi-ai-rich` sengaja TIDAK masuk daftar: plugin yang memakainya punya
 * fallback teks sendiri (mis. `/deepseek`). Jembatan Telegram melempar error
 * untuk pesan rich supaya fallback itu yang dipakai, jadi fiturnya tetap jalan.
 */

/** Import relatif untuk diperiksa juga (`import x from './helper.js'`). */
const RELATIVE_IMPORT = /(?:from\s+|import\s*\(\s*)['"](\.{1,2}\/[^'"]+)['"]/g
const MAX_DEPTH = 2

/**
 * Helper yang dipakai plugin SEKALIGUS punya fallback teks (mis. `/deepseek`
 * mengirim teks biasa bila rich gagal). Jembatan Telegram melempar error untuk
 * rich, jadi fallback itulah yang dipakai → fitur tetap hidup, jangan dilarang.
 */
const FALLBACK_HELPERS = /usanagi-ai-rich/

const cache = new Map()

function pluginRoot() {
  const candidates = [
    globalThis.__umiPluginRoot,
    path.resolve(process.cwd(), 'plugins'),
    path.resolve(process.cwd(), 'bot', 'plugins'),
    path.resolve(process.cwd(), '..', 'plugins'),
  ].filter(Boolean)
  for (const candidate of candidates) {
    try {
      if (fs.statSync(candidate).isDirectory()) return candidate
    } catch {}
  }
  return null
}

/**
 * Periksa satu plugin.
 * @param {string} key kunci plugin (mis. `game/game-chess.js`)
 * @returns {{waOnly: boolean, reason: string|null}}
 */
export function waOnlyInfo(key, { root = pluginRoot() } = {}) {
  const name = String(key || '')
  if (!name || !root) return { waOnly: false, reason: null }
  const file = path.join(root, name)
  let stat
  try {
    stat = fs.statSync(file)
  } catch {
    return { waOnly: false, reason: null }
  }
  const cached = cache.get(name)
  if (cached && cached.mtimeMs === stat.mtimeMs && cached.size === stat.size) return cached.result
  let result = { waOnly: false, reason: null }
  try {
    result = scanFile(file, 0) || result
  } catch {
    // Berkas tidak bisa dibaca → anggap didukung (jangan hilangkan fitur).
  }
  cache.set(name, { mtimeMs: stat.mtimeMs, size: stat.size, result })
  return result
}

/**
 * Periksa satu berkas dan import relatifnya (maks 2 tingkat). Dipakai supaya
 * plugin yang memakai helper rich lewat berkas lain ikut terdeteksi.
 */
function scanFile(file, depth, seen = new Set()) {
  if (depth > MAX_DEPTH || seen.has(file)) return null
  seen.add(file)
  let text
  try {
    text = fs.readFileSync(file, 'utf8')
  } catch {
    return null
  }
  const hit = PATTERNS.find(pattern => pattern.test.test(text))
  if (hit) return { waOnly: true, reason: hit.reason }
  for (const match of text.matchAll(RELATIVE_IMPORT)) {
    if (FALLBACK_HELPERS.test(match[1])) continue
    const target = path.resolve(path.dirname(file), match[1])
    const candidates = [target, `${target}.js`, `${target}.mjs`, path.join(target, 'index.js')]
    for (const candidate of candidates) {
      try {
        if (!fs.statSync(candidate).isFile()) continue
      } catch {
        continue
      }
      const nested = scanFile(candidate, depth + 1, seen)
      if (nested) return nested
    }
  }
  return null
}

/** Bersihkan cache (dipakai tes dan saat plugin di-reload). */
export function resetWaOnlyCache() {
  cache.clear()
}

export default { waOnlyInfo, resetWaOnlyCache }
