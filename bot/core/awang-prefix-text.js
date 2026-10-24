/* By AlzRiss - Usanagi Umi AI
 *
 * Satu tempat untuk urusan prefix yang tampil di menu & pesan perintah.
 *
 * Masalah yang diselesaikan:
 *   Banyak plugin (terutama hasil port) menulis teks contoh seperti ".zikir pagi"
 *   dengan titik hardcode. Kalau owner/user mengganti prefix lewat `.setprefix`,
 *   teks itu tetap menampilkan "." dan membingungkan pengguna.
 *
 * Aturan di sini:
 *   1. Semua teks perintah yang disimpan di metadata (help/usage/example)
 *      dinormalkan menjadi "{prefix}<perintah>" saat plugin dimuat.
 *   2. Saat ditampilkan, "{prefix}" diganti prefix aktif chat tersebut
 *      (owner bisa menyetel default global; user bisa menyetel per chat;
 *      jadibot memakai namespace sendiri).
 */
import fs from 'node:fs'
import path from 'node:path'

export const PREFIX_PLACEHOLDER = '{prefix}'

// Karakter yang lazim dipakai sebagai prefix bot WhatsApp.
const LEADING_PREFIX = /^[./#!$&+~^-]/
const DEFAULT_PREFIX = '.'

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'prefix-settings.json')

/** Ubah ".zikir pagi" menjadi "{prefix}zikir pagi" (hanya di awal teks). */
export function normalizeCommandText(value) {
  const text = String(value ?? '')
  if (!text) return text
  if (text.startsWith(PREFIX_PLACEHOLDER)) return text
  if (LEADING_PREFIX.test(text)) return `${PREFIX_PLACEHOLDER}${text.slice(1)}`
  return text
}

/** Ganti "{prefix}" dengan prefix aktif. */
export function renderCommandText(value, prefix = DEFAULT_PREFIX) {
  const text = String(value ?? '')
  if (!text) return text
  const active = String(prefix || DEFAULT_PREFIX)
  return text.split(PREFIX_PLACEHOLDER).join(active)
}

/**
 * Untuk daftar menu: placeholder dibuang lalu prefix aktif ditempel sekali,
 * supaya tidak pernah muncul "{prefix}" mentah atau "..zikir".
 */
export function renderMenuCommand(value, prefix = DEFAULT_PREFIX) {
  const text = String(value ?? '').trim()
  if (!text) return text
  const active = String(prefix || DEFAULT_PREFIX)
  const bare = text.split(PREFIX_PLACEHOLDER).join('').replace(LEADING_PREFIX, '')
  return `${active}${bare}`
}

export function isValidPrefix(value) {
  const text = String(value ?? '')
  return text.length >= 1 && text.length <= 3 && !/\s/.test(text)
}

/** Rapikan metadata satu plugin tanpa menyentuh logika pluginnya. */
export function normalizePluginText(plugin) {
  if (typeof plugin !== 'function') return plugin
  const fields = ['help', 'menuHelp', 'usage', 'example']
  for (const field of fields) {
    const value = plugin[field]
    if (Array.isArray(value)) plugin[field] = value.map(normalizeCommandText)
    else if (typeof value === 'string') plugin[field] = normalizeCommandText(value)
  }
  for (const holder of [plugin.importConfig, plugin.metadata]) {
    if (!holder || typeof holder !== 'object') continue
    if (typeof holder.usage === 'string') holder.usage = normalizeCommandText(holder.usage)
    if (typeof holder.example === 'string') holder.example = normalizeCommandText(holder.example)
  }
  return plugin
}

/* ── setelan default prefix (disimpan di data/prefix-settings.json) ── */

function readSettings() {
  try {
    const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'))
    if (data && typeof data === 'object') return data
  } catch {}
  return {}
}

function writeSettings(value) {
  try {
    fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true })
    const temp = `${SETTINGS_FILE}.${process.pid}.tmp`
    fs.writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 })
    fs.renameSync(temp, SETTINGS_FILE)
    return true
  } catch (error) {
    console.error('[PREFIX] gagal menyimpan setelan:', error.message)
    return false
  }
}

export function storedDefaultPrefix() {
  const value = String(readSettings().defaultPrefix || '')
  return isValidPrefix(value) ? value : ''
}

export function saveDefaultPrefix(prefix) {
  if (!isValidPrefix(prefix)) return false
  const current = readSettings()
  return writeSettings({ ...current, defaultPrefix: prefix, updatedAt: new Date().toISOString(), revision: Date.now() })
}
