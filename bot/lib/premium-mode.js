/**
 * Mode Premium (Task75) — saklar premium dua lapis + daftar fitur premium per bot.
 *
 * Lapis 1 · Platform (owner/developer)
 *   `platform_meta.premium_system` = { enabled }.
 *   OFF = seluruh gating premium dimatikan di semua bot (semua fitur gratis).
 *
 * Lapis 2 · Bot (pemilik bot / owner / developer)
 *   `bot-config.json` → `premium = { enabled, plugins: [] }`.
 *   `plugins` berisi fitur yang dikunci untuk pengguna non-premium.
 *   OFF = bot itu tidak punya fitur premium (semua fitur gratis).
 *
 * Efektif: fitur dikunci hanya bila saklar platform ON *dan* saklar bot ON.
 * Plugin yang memang bertanda `premium` / `premiumOnly` ikut aturan yang sama,
 * sehingga mematikan mode premium benar-benar membebaskan semua fitur.
 */
import fs from 'node:fs'
import path from 'node:path'
import { platformDb } from './platform/db.js'

const META_KEY = 'premium_system'
const MAIN_FILE = path.join(process.cwd(), 'data', 'premium-main.json')
export const MAX_PREMIUM_FEATURES = 300
const MAX_ENTRY_LENGTH = 120
const SYSTEM_CACHE_MS = 5000

let systemCache = null
let systemCacheAt = 0

function toBool(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback
  if (typeof value === 'boolean') return value
  const text = String(value).trim().toLowerCase()
  if (['1', 'true', 'on', 'ya', 'yes', 'aktif'].includes(text)) return true
  if (['0', 'false', 'off', 'tidak', 'no', 'mati'].includes(text)) return false
  return fallback
}

/** Buang prefix command yang ikut diketik, rapikan, dan batasi panjang. */
export function normalizePremiumEntry(value) {
  let text = String(value === undefined || value === null ? '' : value).trim().toLowerCase()
  if (!text) return ''
  text = text.replace(/^[.#!/\\]+/, '').trim()
  if (!text) return ''
  return text.slice(0, MAX_ENTRY_LENGTH)
}

/** Daftar entri unik, urutan dipertahankan, maksimum 300. */
export function normalizePremiumEntries(values) {
  const list = Array.isArray(values) ? values : String(values || '').split(/[\n,]+/)
  const output = []
  const seen = new Set()
  for (const raw of list) {
    const entry = normalizePremiumEntry(raw)
    if (!entry || seen.has(entry)) continue
    seen.add(entry)
    output.push(entry)
    if (output.length >= MAX_PREMIUM_FEATURES) break
  }
  return output
}

/* --------------------------------------------------------------- global */

function readMetaRow() {
  try {
    const row = platformDb().prepare('SELECT value FROM platform_meta WHERE key = ?').get(META_KEY)
    if (!row || !row.value) return null
    const parsed = JSON.parse(row.value)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

/**
 * Saklar premium tingkat platform. Default ON supaya perilaku bot tidak berubah
 * sampai owner benar-benar mematikannya.
 */
export function getPremiumSystem() {
  const now = Date.now()
  if (systemCache && now - systemCacheAt < SYSTEM_CACHE_MS) return { ...systemCache }
  const stored = readMetaRow()
  const state = {
    enabled: toBool(stored?.enabled, true),
    updatedAt: stored?.updatedAt || null,
    updatedBy: stored?.updatedBy || null,
  }
  systemCache = state
  systemCacheAt = now
  return { ...state }
}

export function setPremiumSystem(enabled, actor = 'system') {
  const next = toBool(enabled, true)
  const payload = {
    enabled: next,
    updatedAt: new Date().toISOString(),
    updatedBy: String(actor || 'system').slice(0, 120),
  }
  const db = platformDb()
  db.prepare('INSERT INTO platform_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .run(META_KEY, JSON.stringify(payload))
  systemCache = { ...payload }
  systemCacheAt = Date.now()
  return getPremiumSystem()
}

/* ---------------------------------------------------------------- bot */

function readMainPremiumFile() {
  try {
    const parsed = JSON.parse(fs.readFileSync(MAIN_FILE, 'utf8'))
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeMainPremiumFile(data) {
  fs.mkdirSync(path.dirname(MAIN_FILE), { recursive: true })
  const temp = `${MAIN_FILE}.${process.pid}.tmp`
  fs.writeFileSync(temp, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 })
  fs.renameSync(temp, MAIN_FILE)
}

/**
 * Konfigurasi premium untuk bot utama (tidak punya bot-config.json).
 * Disimpan di data/premium-main.json.
 */
export function getMainPremiumConfig() {
  const stored = readMainPremiumFile()
  return {
    enabled: toBool(stored.enabled, true),
    plugins: normalizePremiumEntries(stored.plugins || []),
  }
}

export function saveMainPremiumConfig(patch = {}) {
  const current = getMainPremiumConfig()
  const next = {
    enabled: patch.enabled === undefined ? current.enabled : toBool(patch.enabled, current.enabled),
    plugins: patch.plugins === undefined ? current.plugins : normalizePremiumEntries(patch.plugins),
    updatedAt: new Date().toISOString(),
    updatedBy: String(patch.updatedBy || 'system').slice(0, 120),
  }
  writeMainPremiumFile(next)
  return { enabled: next.enabled, plugins: next.plugins }
}

/** Baca konfigurasi premium dari profil bot (jadibot atau bot utama). */
export function premiumConfigFor(profile) {
  if (profile && profile.type === 'jadibot') {
    const stored = profile.premium || {}
    return {
      enabled: toBool(stored.enabled, true),
      plugins: normalizePremiumEntries(stored.plugins || []),
    }
  }
  return getMainPremiumConfig()
}

/**
 * Simpan konfigurasi premium. Profil jadibot disimpan lewat saveJadibotConfig
 * milik pemanggil agar tidak ada dua penulis file yang berbeda.
 */
export function applyPremiumPatch(profile, patch = {}, save = null) {
  const current = premiumConfigFor(profile)
  const next = {
    enabled: patch.enabled === undefined ? current.enabled : toBool(patch.enabled, current.enabled),
    plugins: patch.plugins === undefined ? current.plugins : normalizePremiumEntries(patch.plugins),
  }
  if (profile && profile.type === 'jadibot') {
    profile.premium = next
    if (typeof save === 'function') save(profile)
    return next
  }
  return saveMainPremiumConfig(next)
}

/* ------------------------------------------------------------ katalog */

function commandsOf(plugin) {
  const output = []
  const push = value => {
    const text = String(value || '').trim().toLowerCase()
    if (text && /^[a-z0-9_.-]{1,40}$/.test(text) && !output.includes(text)) output.push(text)
  }
  const fromRegExp = source => {
    const clean = String(source || '').replace(/^\^/, '').replace(/\$$/, '').replace(/^\\?\/|\/i?$/g, '')
    const group = clean.match(/^\(([^()]*)\)$/i)
    const parts = group ? group[1].split('|') : [clean]
    for (const part of parts) {
      const word = part.replace(/[\\^$.*+?()[\]{}|]/g, '')
      if (word && word === part) push(word)
    }
  }
  const raw = plugin?.command
  if (Array.isArray(raw)) {
    for (const item of raw) item instanceof RegExp ? fromRegExp(item.source) : push(item)
  } else if (raw instanceof RegExp) {
    fromRegExp(raw.source)
  } else {
    push(raw)
  }
  return output
}

/** Ringkas semua plugin yang termuat menjadi data yang mudah dicari. */
export function pluginCatalog(plugins = global.plugins) {
  const entries = []
  for (const [key, plugin] of Object.entries(plugins || {})) {
    if (!plugin || typeof plugin !== 'object') continue
    const basename = String(key).split('/').pop() || String(key)
    entries.push({
      key,
      basename,
      name: String(plugin.name || '').trim(),
      commands: commandsOf(plugin),
      tags: Array.isArray(plugin.tags) ? plugin.tags.map(tag => String(tag).toLowerCase()) : [],
      premium: Boolean(plugin.premium || plugin.premiumOnly),
      description: String(
        (Array.isArray(plugin.help) ? plugin.help[0] : '') || plugin.description || plugin.help || '',
      ).slice(0, 160),
    })
  }
  return entries
}

function featureMatches(feature, query) {
  const q = String(query || '').toLowerCase()
  if (!q) return false
  if (feature.key.toLowerCase().includes(q)) return true
  if (feature.basename.toLowerCase().includes(q)) return true
  if (feature.name && feature.name.toLowerCase().includes(q)) return true
  if (feature.commands.some(command => command.includes(q))) return true
  if (feature.tags.some(tag => tag.includes(q))) return true
  return false
}

/** Cari fitur berdasarkan nama command, nama file, atau tag. */
export function searchFeatures(query, limit = 20, plugins = global.plugins) {
  const catalog = pluginCatalog(plugins)
  const q = String(query || '').trim().toLowerCase()
  if (!q) return catalog.slice(0, limit)
  const scored = []
  for (const feature of catalog) {
    if (!featureMatches(feature, q)) continue
    let score = 0
    if (feature.commands.includes(q)) score += 4
    if (feature.commands.some(command => command.startsWith(q))) score += 2
    if (feature.name.toLowerCase() === q) score += 2
    if (feature.basename.toLowerCase() === `${q}.js`) score += 3
    if (feature.premium) score += 1
    scored.push({ feature, score })
  }
  scored.sort((a, b) => b.score - a.score || a.feature.key.localeCompare(b.feature.key))
  return scored.slice(0, Math.max(1, Math.min(50, Number(limit) || 20))).map(item => item.feature)
}

/** Label pendek untuk ditampilkan di chat / website. */
export function featureLabel(feature) {
  if (!feature) return ''
  const command = feature.commands[0] ? `/.${feature.commands[0]}` : ''
  return `${feature.name || feature.basename.replace(/\.js$/, '')}${command ? ` (${command})` : ''}`
}

/**
 * Cek satu entri (mis. `sticker`, `command:menu`, `plugin:ai/autogpt chat.js`,
 * `tag:ai`) terhadap satu plugin. Dipakai saat runtime.
 */
export function premiumRuleMatches(entry, feature) {
  const rule = normalizePremiumEntry(entry)
  if (!rule || !feature) return false
  const key = String(feature.key || '').toLowerCase()
  const basename = String(feature.basename || '').toLowerCase()
  const name = String(feature.name || '').toLowerCase()
  const command = String(feature.command || '').toLowerCase()
  const tags = Array.isArray(feature.tags) ? feature.tags.map(tag => String(tag).toLowerCase()) : []

  if (rule.startsWith('command:')) {
    const target = rule.slice(8).trim()
    return Boolean(target) && target === command
  }
  if (rule.startsWith('plugin:')) {
    return pluginPathMatches(rule.slice(7).trim(), key, basename)
  }
  if (rule.startsWith('tag:') || rule.startsWith('kategori:')) {
    const target = rule.split(':').slice(1).join(':').trim()
    return Boolean(target) && tags.includes(target)
  }
  if (command && rule === command) return true
  if (name && rule === name) return true
  if (pluginPathMatches(rule, key, basename)) return true
  return tags.includes(rule)
}

function pluginPathMatches(target, key, basename) {
  if (!target) return false
  const cleanTarget = target.replace(/\.js$/, '')
  const cleanKey = key.replace(/\.js$/, '')
  const cleanBase = basename.replace(/\.js$/, '')
  return cleanTarget === cleanKey ||
    cleanTarget === cleanBase ||
    cleanKey.endsWith(`/${cleanTarget}`) ||
    cleanBase === target
}

/**
 * Apakah satu fitur harus dikunci untuk pengguna non-premium.
 * `builtinPremium` = plugin bertanda premium bawaan.
 */
export function isPremiumFeatureLocked(profile, feature, options = {}) {
  const system = getPremiumSystem()
  if (!system.enabled) return false
  const config = premiumConfigFor(profile)
  if (!config.enabled) return false
  if (options.builtinPremium) return true
  if (!config.plugins.length) return false
  return config.plugins.some(entry => premiumRuleMatches(entry, feature))
}

/** Nomor owner bot untuk dihubungi saat pengguna kena fitur premium. */
export function premiumOwnerContact(profile) {
  const owners = Array.isArray(profile?.ownerNumbers) ? profile.ownerNumbers : []
  const fromProfile = owners.map(number => String(number).replace(/\D/g, '')).find(Boolean)
  if (fromProfile) return fromProfile
  const first = (global.owner || []).map(item => Array.isArray(item) ? item[0] : item).find(Boolean)
  return String(first || '').replace(/\D/g, '')
}

/** Cocokkan satu entri dengan satu baris katalog (dipakai saat validasi input). */
export function entryMatchesFeature(entry, feature) {
  const rule = normalizePremiumEntry(entry)
  if (!rule || !feature) return false
  const key = String(feature.key || '').toLowerCase()
  const basename = String(feature.basename || '').toLowerCase()
  const name = String(feature.name || '').toLowerCase()
  const tags = Array.isArray(feature.tags) ? feature.tags.map(tag => String(tag).toLowerCase()) : []
  const commands = Array.isArray(feature.commands) ? feature.commands.map(cmd => String(cmd).toLowerCase()) : []
  if (rule.startsWith('command:')) return commands.includes(rule.slice(8).trim())
  if (rule.startsWith('plugin:')) return pluginPathMatches(rule.slice(7).trim(), key, basename)
  if (rule.startsWith('tag:') || rule.startsWith('kategori:')) return tags.includes(rule.split(':').slice(1).join(':').trim())
  return commands.includes(rule) || (name && rule === name) || pluginPathMatches(rule, key, basename) || tags.includes(rule)
}

/**
 * Validasi entri yang diketik pengguna terhadap katalog plugin yang termuat.
 * @returns {{ entry: string, ok: boolean, feature: object|null, suggestions: object[] }}
 */
export function resolvePremiumEntry(entry) {
  const clean = normalizePremiumEntry(entry)
  if (!clean) return { entry: '', ok: false, feature: null, suggestions: [] }
  const catalog = pluginCatalog()
  if (!catalog.length) return { entry: clean, ok: true, feature: null, suggestions: [] }

  const matches = catalog.filter(feature => entryMatchesFeature(clean, feature))
  if (matches.length) {
    matches.sort((a, b) => Number(b.commands.includes(clean)) - Number(a.commands.includes(clean)))
    return { entry: clean, ok: true, feature: matches[0], suggestions: [] }
  }
  return { entry: clean, ok: false, feature: null, suggestions: searchFeatures(clean, 5) }
}

export default {
  MAX_PREMIUM_FEATURES,
  normalizePremiumEntry,
  normalizePremiumEntries,
  getPremiumSystem,
  setPremiumSystem,
  getMainPremiumConfig,
  saveMainPremiumConfig,
  premiumConfigFor,
  applyPremiumPatch,
  pluginCatalog,
  searchFeatures,
  featureLabel,
  premiumRuleMatches,
  isPremiumFeatureLocked,
  premiumOwnerContact,
  entryMatchesFeature,
  resolvePremiumEntry,
}
