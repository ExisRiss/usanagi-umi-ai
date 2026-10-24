/* By AlzRiss - Usanagi Umi AI
 *
 * Setting lengkap BOT UTAMA (bukan Jadibot).
 *
 * Kenapa modul ini ada:
 *  - Bot utama sebelumnya hanya punya `.main-bot.env` (on/off + nomor pairing)
 *    dan setelan prefix di `data/prefix-settings.json`. Tidak ada tempat resmi
 *    untuk nama bot, mode akses, limit, AutoAI, Auto Typing, menu, link, dsb.
 *  - Jadibot punya `bot-config.json` per sesi; bot utama tidak punya padanan.
 *
 * Aturan penyimpanan:
 *  - File JSON biasa (bukan rahasia) di `data/main-bot-settings.json`, mode 600.
 *  - API key TIDAK disimpan di sini. Gemini/Groq memakai `.env.gemini` /
 *    `.env.groq`; OpenRouter memakai penyimpanan terenkripsi milik AI Agent.
 *  - `data/` sudah di-.gitignore, jadi setting ini tidak pernah ikut commit.
 *  - Semua nilai divalidasi di server; input web tidak pernah dipercaya.
 */

import fs from 'node:fs'
import path from 'node:path'
import { isValidPrefix, saveDefaultPrefix, storedDefaultPrefix } from '../core/awang-prefix-text.js'

const SETTINGS_FILE_NAME = 'main-bot-settings.json'
const MAX_LINKS = 500
const MAX_TEXT = 500

let cache = null

const clone = (value) => JSON.parse(JSON.stringify(value))

function settingsFile() {
  const override = String(process.env.UMI_MAIN_BOT_SETTINGS_FILE || '').trim()
  return override || path.join(process.cwd(), 'data', SETTINGS_FILE_NAME)
}

function badRequest(message) {
  return Object.assign(new Error(message), { status: 400 })
}

function safeText(value, max = MAX_TEXT) {
  return String(value === undefined || value === null ? '' : value)
    .replace(/\u0000/g, '')
    .trim()
    .slice(0, max)
}

function toBool(value, fallback) {
  if (typeof value === 'boolean') return value
  if (value === 'true') return true
  if (value === 'false') return false
  return fallback
}

function toInt(value, min, max, fallback) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.max(min, Math.min(max, Math.trunc(number)))
}

function strictUrl(value, label) {
  const text = safeText(value, MAX_LINKS)
  if (!text) return ''
  let parsed
  try { parsed = new URL(text) } catch { throw badRequest(`${label} bukan URL yang valid.`) }
  if (!/^https?:$/.test(parsed.protocol)) throw badRequest(`${label} harus diawali http:// atau https://`)
  return text
}

function looseUrl(value, fallback = '') {
  const text = safeText(value, MAX_LINKS)
  if (!text) return ''
  try {
    const parsed = new URL(text)
    if (!/^https?:$/.test(parsed.protocol)) return fallback
    return text
  } catch {
    return fallback
  }
}

function normalizeTyping(raw) {
  const value = raw && typeof raw === 'object' ? raw : {}
  return {
    enabled: toBool(value.enabled, true),
    minDelayMs: toInt(value.minDelayMs, 0, 5000, 0),
    maxDelayMs: toInt(value.maxDelayMs, 0, 10000, 80),
    charsPerSecond: toInt(value.charsPerSecond, 1, 10000, 10000),
    includeMedia: toBool(value.includeMedia, true),
  }
}

function normalizeTranslate(raw) {
  const value = raw && typeof raw === 'object' ? raw : {}
  return {
    enabled: toBool(value.enabled, false),
    source: safeText(value.source, 10) || 'id',
    defaultLanguage: safeText(value.defaultLanguage, 10) || 'id',
  }
}

function normalizeLinks(raw) {
  const value = raw && typeof raw === 'object' ? raw : {}
  const channelId = safeText(value.channelId, 120)
  return {
    websiteUrl: looseUrl(value.websiteUrl),
    channelUrl: looseUrl(value.channelUrl),
    groupUrl: looseUrl(value.groupUrl),
    channelId: channelId.endsWith('@newsletter') ? channelId : '',
    upchChannelRole: safeText(value.upchChannelRole, 32).toUpperCase(),
    upchChannelVerifiedAt: toInt(value.upchChannelVerifiedAt, 0, Number.MAX_SAFE_INTEGER, 0),
  }
}

/**
 * Daftar plugin yang dimatikan untuk bot utama. Bentuk entri sama dengan
 * jadibot: `nama`, `folder/file.js`, `plugin:folder/file.js`, `command:nama`.
 */
export function normalizeDisabledPlugins(raw) {
  const list = Array.isArray(raw) ? raw : []
  const out = []
  for (const item of list) {
    const entry = safeText(item, 120).toLowerCase()
    if (entry && !out.includes(entry)) out.push(entry)
    if (out.length >= 500) break
  }
  return out
}

/** Nomor owner bot utama (digit saja, 8-15 digit). Kosong = ikut config.js. */
export function normalizeOwnerNumber(raw) {
  const number = safeText(raw, 20).replace(/\D/g, '')
  return number.length >= 8 && number.length <= 15 ? number : ''
}

/** Nilai bawaan; sama dengan perilaku bot utama sebelum setting ini ada. */
export function defaultMainBotSettings() {
  return {
    version: 1,
    botName: 'Usanagi Umi AI',
    ownerNumber: '',
    prefix: '.',
    mode: 'public',
    onlyGroup: false,
    registrationRequired: true,
    defaultLimit: 50,
    limitEnabled: true,
    autoAI: true,
    disabledPlugins: [],
    autoTyping: normalizeTyping({}),
    autoTranslate: normalizeTranslate({}),
    menuAudioEnabled: true,
    links: normalizeLinks({}),
    waitText: '✨ _Tunggu sebentar..._',
    errorText: '🚩 Terjadi kesalahan.',
    multiplier: 38,
    updatedAt: '',
    updatedBy: '',
  }
}

/** Rapikan data dari disk (tidak pernah melempar error). */
export function normalizeMainBotSettings(raw) {
  const base = defaultMainBotSettings()
  const value = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {}
  const prefix = safeText(value.prefix, 3)
  const mode = String(value.mode || '').toLowerCase()
  return {
    version: 1,
    botName: safeText(value.botName, 80) || base.botName,
    ownerNumber: normalizeOwnerNumber(value.ownerNumber),
    prefix: isValidPrefix(prefix) ? prefix : base.prefix,
    mode: mode === 'self' || mode === 'private' ? 'self' : 'public',
    onlyGroup: toBool(value.onlyGroup, base.onlyGroup),
    registrationRequired: toBool(value.registrationRequired, base.registrationRequired),
    defaultLimit: toInt(value.defaultLimit, -1, 100000, base.defaultLimit),
    limitEnabled: toBool(value.limitEnabled, base.limitEnabled),
    autoAI: toBool(value.autoAI, base.autoAI),
    disabledPlugins: normalizeDisabledPlugins(value.disabledPlugins),
    autoTyping: normalizeTyping(value.autoTyping),
    autoTranslate: normalizeTranslate(value.autoTranslate),
    menuAudioEnabled: toBool(value.menuAudioEnabled, base.menuAudioEnabled),
    links: normalizeLinks(value.links),
    waitText: safeText(value.waitText, MAX_TEXT) || base.waitText,
    errorText: safeText(value.errorText, MAX_TEXT) || base.errorText,
    multiplier: toInt(value.multiplier, 1, 1000, base.multiplier),
    updatedAt: safeText(value.updatedAt, 40),
    updatedBy: safeText(value.updatedBy, 120),
  }
}

export function mainBotSettingsFile() {
  return settingsFile()
}

export function isMainBotSettingsManaged() {
  try { return fs.statSync(settingsFile()).isFile() } catch { return false }
}

/** Baca setting (cache di memori; `fresh` untuk membaca ulang berkas). */
export function loadMainBotSettings(options = {}) {
  const fresh = options && options.fresh === true
  if (cache && !fresh) return cache
  let stored = {}
  try { stored = JSON.parse(fs.readFileSync(settingsFile(), 'utf8')) } catch { stored = {} }
  cache = normalizeMainBotSettings(stored)
  return cache
}

/** Tulis atomik mode 600. Folder `data/` dibuat bila belum ada. */
export function persistMainBotSettings(values) {
  const data = normalizeMainBotSettings(values)
  const file = settingsFile()
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const temp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(temp, `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600 })
  fs.renameSync(temp, file)
  try { fs.chmodSync(file, 0o600) } catch {}
  cache = data
  return data
}

/* ── Runtime ──────────────────────────────────────────────────────────── */

async function applyPrefix(prefix) {
  try { saveDefaultPrefix(prefix) } catch {}
  try {
    const mod = await import('../core/awang-prefix.js')
    if (typeof mod.syncMainPrefix === 'function') mod.syncMainPrefix(prefix, `main-settings-${Date.now()}`)
  } catch {}
  try {
    const mod = await import('./prefix-rewrite.js')
    if (typeof mod.clearPrefixRewriteCache === 'function') mod.clearPrefixRewriteCache()
  } catch {}
}

/* Mode public/self bot utama dibaca handler dari database (sama seperti
 * perintah /self). Setting ini menuliskan nilai yang sama supaya perilaku
 * setelah restart tetap konsisten walau handler belum sempat memuat profil. */
async function applyModeToDatabase(settings) {
  const data = global.db && global.db.data
  if (!data || !data.settings) return
  const jids = new Set()
  const push = (value) => {
    const jid = String(value || '').trim()
    if (jid.endsWith('@s.whatsapp.net') || jid.endsWith('@lid')) jids.add(jid)
  }
  push(global.conn && global.conn.user ? global.conn.user.jid : '')
  push(global.conn && global.conn.user ? global.conn.user.id : '')
  push(global.mainBotJid)
  if (!jids.size) return
  for (const jid of jids) {
    const setting = data.settings[jid] || (data.settings[jid] = {})
    setting.public = settings.mode !== 'self'
  }
  try { if (typeof global.db.write === 'function') await global.db.write() } catch {}
}

/** Terapkan setting ke global + profil bot yang sedang berjalan. */
export async function applyMainBotSettingsToRuntime(values) {
  const s = normalizeMainBotSettings(values === undefined ? loadMainBotSettings({ fresh: true }) : values)

  if (!global.mainBot) global.mainBot = {}
  global.mainBot.defaultPrefix = s.prefix

  // Dynamic keys milik bot-config.js (accessor global) — aman diubah kapan pun.
  global.namebot = s.botName
  global.stickpack = s.botName
  global.wait = s.waitText
  global.eror = s.errorText
  global.multiplier = s.multiplier
  global.autoTyping = { ...s.autoTyping }
  global.autoTranslate = { ...s.autoTranslate }
  global.umiAutoAI = { ...(global.umiAutoAI || {}), enabled: s.autoAI !== false }
  global.brandingAssets = { ...(global.brandingAssets || {}), menuAudioEnabled: s.menuAudioEnabled }
  global.links = {
    ...(global.links || {}),
    websiteUrl: s.links.websiteUrl,
    channelUrl: s.links.channelUrl,
    groupUrl: s.links.groupUrl,
    channelId: s.links.channelId || '',
  }

  const profile = global.conn && global.conn.botConfig
  if (profile && profile.type === 'main') syncMainBotSettingsProfile(profile, s)

  await applyPrefix(s.prefix)
  await applyModeToDatabase(s)
  return s
}

/** Sinkronkan profil bot utama yang sudah dibuat `getMainBotConfig()`. */
export function syncMainBotSettingsProfile(profile, values) {
  if (!profile || profile.type !== 'main') return profile
  if (!isMainBotSettingsManaged() && values === undefined) return profile
  const s = normalizeMainBotSettings(values === undefined ? loadMainBotSettings({ fresh: true }) : values)
  profile.defaultPrefix = s.prefix
  profile.public = s.mode !== 'self'
  profile.managedSettings = true
  profile.onlyGroup = s.onlyGroup === true
  profile.registrationRequired = s.registrationRequired !== false
  profile.defaultLimit = s.defaultLimit
  profile.limitEnabled = s.limitEnabled !== false
  profile.ownerNumbers = s.ownerNumber ? [s.ownerNumber] : []
  profile.disabledPlugins = [...s.disabledPlugins]
  const valuesBag = profile.values || (profile.values = {})
  valuesBag.namebot = s.botName
  valuesBag.stickpack = s.botName
  valuesBag.wait = s.waitText
  valuesBag.eror = s.errorText
  valuesBag.multiplier = s.multiplier
  valuesBag.autoAI = { enabled: s.autoAI !== false }
  valuesBag.autoTyping = { ...s.autoTyping }
  valuesBag.autoTranslate = { ...s.autoTranslate }
  valuesBag.links = {
    ...(valuesBag.links || {}),
    websiteUrl: s.links.websiteUrl,
    channelUrl: s.links.channelUrl,
    groupUrl: s.links.groupUrl,
    channelId: s.links.channelId || '',
  }
  valuesBag.brandingAssets = { ...(valuesBag.brandingAssets || {}), menuAudioEnabled: s.menuAudioEnabled }
  return profile
}

/** Dipanggil sekali saat boot, setelah database siap. */
export async function applyMainBotSettingsAtBoot() {
  if (!isMainBotSettingsManaged()) return null
  const settings = loadMainBotSettings({ fresh: true })
  await applyMainBotSettingsToRuntime(settings)
  return settings
}

/* ── Input dari website ───────────────────────────────────────────────── */

function mergeLinks(current, input) {
  const next = { ...(current || {}) }
  const source = input && typeof input === 'object' ? input : {}
  if (source.websiteUrl !== undefined) next.websiteUrl = strictUrl(source.websiteUrl, 'Website')
  if (source.channelUrl !== undefined) next.channelUrl = strictUrl(source.channelUrl, 'Channel publik')
  if (source.groupUrl !== undefined) next.groupUrl = strictUrl(source.groupUrl, 'Link grup')
  if (source.channel_id !== undefined) {
    // ID channel WhatsApp untuk /upch bot utama, mis. 1203630…@newsletter.
    const channelId = safeText(source.channel_id, 120)
    if (channelId && !/^[0-9]{5,40}@newsletter$/.test(channelId)) {
      throw badRequest('Channel ID harus berbentuk 120363…@newsletter atau dikosongkan.')
    }
    next.channelId = channelId
  }
  return normalizeLinks(next)
}

/**
 * Nilai awal untuk update. Kalau berkas setting belum pernah dibuat, ambil
 * prefix yang SEDANG AKTIF (data/prefix-settings.json / global.mainBot) supaya
 * menyimpan satu field tidak diam-diam mengubah prefix bot.
 */
function currentSettingsForUpdate() {
  const stored = clone(loadMainBotSettings({ fresh: true }))
  if (isMainBotSettingsManaged()) return stored
  try {
    const active = String(storedDefaultPrefix() || (global.mainBot && global.mainBot.defaultPrefix) || '').trim()
    if (isValidPrefix(active)) stored.prefix = active
  } catch {}
  return stored
}

/**
 * Validasi + simpan + terapkan. Hanya field yang dikirim yang diubah.
 * Melempar error berstatus 400 dengan pesan berbahasa Indonesia.
 */
export async function applyMainBotSettingsInput(input, options = {}) {
  const source = input && typeof input === 'object' && !Array.isArray(input) ? input : null
  if (!source) throw badRequest('Payload setting bot utama tidak valid.')
  const actor = safeText(options && options.actor ? options.actor : 'owner-console', 120)
  const next = currentSettingsForUpdate()

  if (source.bot_name !== undefined) {
    const name = safeText(source.bot_name, 80)
    if (!name) throw badRequest('Nama bot tidak boleh kosong.')
    next.botName = name
  }
  if (source.owner_number !== undefined) {
    const raw = String(source.owner_number === undefined || source.owner_number === null ? '' : source.owner_number)
    const number = raw.replace(/\D/g, '')
    if (number && (number.length < 8 || number.length > 15)) {
      throw badRequest('Nomor owner harus 8-15 digit, tanpa + atau spasi.')
    }
    next.ownerNumber = number
  }
  if (source.prefix !== undefined) {
    // Jangan dipotong dulu: prefix 4+ karakter harus DITOLAK, bukan diam-diam
    // dipotong menjadi 3 karakter.
    const prefix = String(source.prefix === undefined || source.prefix === null ? '' : source.prefix).trim()
    if (!isValidPrefix(prefix)) throw badRequest('Prefix harus 1-3 karakter tanpa spasi.')
    next.prefix = prefix
  }
  if (source.mode !== undefined) {
    const mode = String(source.mode || '').toLowerCase()
    if (!['public', 'self', 'private'].includes(mode)) throw badRequest('Mode bot harus public atau self.')
    next.mode = mode === 'public' ? 'public' : 'self'
  }
  if (source.only_group !== undefined) {
    if (typeof source.only_group !== 'boolean') throw badRequest('Only Group harus true atau false.')
    next.onlyGroup = source.only_group
  }
  if (source.registration_required !== undefined) {
    if (typeof source.registration_required !== 'boolean') throw badRequest('Wajib daftar harus true atau false.')
    next.registrationRequired = source.registration_required
  }
  if (source.default_limit !== undefined) {
    const limit = Number(source.default_limit)
    if (!Number.isInteger(limit) || limit < -1 || limit > 100000) {
      throw badRequest('Limit awal harus -1 (unlimited) atau 0-100000.')
    }
    next.defaultLimit = limit
  }
  if (source.limit_enabled !== undefined) {
    if (typeof source.limit_enabled !== 'boolean') throw badRequest('Limit ON/OFF harus true atau false.')
    next.limitEnabled = source.limit_enabled
  }
  if (source.disabled_plugins !== undefined) {
    if (!Array.isArray(source.disabled_plugins)) throw badRequest('Daftar plugin nonaktif harus berupa array.')
    if (source.disabled_plugins.length > 500) throw badRequest('Maksimum 500 plugin nonaktif.')
    next.disabledPlugins = normalizeDisabledPlugins(source.disabled_plugins)
  }
  if (source.auto_ai !== undefined) {
    if (typeof source.auto_ai !== 'boolean') throw badRequest('AutoAI harus true atau false.')
    next.autoAI = source.auto_ai
  }
  if (source.auto_typing !== undefined) {
    if (typeof source.auto_typing !== 'boolean') throw badRequest('Auto Typing harus true atau false.')
    next.autoTyping = { ...next.autoTyping, enabled: source.auto_typing }
  }
  if (source.auto_typing_config !== undefined) {
    if (!source.auto_typing_config || typeof source.auto_typing_config !== 'object') {
      throw badRequest('Konfigurasi Auto Typing tidak valid.')
    }
    next.autoTyping = normalizeTyping({ ...next.autoTyping, ...source.auto_typing_config })
  }
  if (source.auto_translate !== undefined) {
    if (typeof source.auto_translate !== 'boolean') throw badRequest('Auto Translate harus true atau false.')
    next.autoTranslate = { ...next.autoTranslate, enabled: source.auto_translate }
  }
  if (source.auto_translate_config !== undefined) {
    if (!source.auto_translate_config || typeof source.auto_translate_config !== 'object') {
      throw badRequest('Konfigurasi Auto Translate tidak valid.')
    }
    const language = safeText(source.auto_translate_config.defaultLanguage, 10)
    if (language && !/^[a-zA-Z-]{2,10}$/.test(language)) throw badRequest('Kode bahasa tidak valid.')
    next.autoTranslate = normalizeTranslate({ ...next.autoTranslate, ...source.auto_translate_config })
  }
  if (source.menu_audio_enabled !== undefined) {
    if (typeof source.menu_audio_enabled !== 'boolean') throw badRequest('Audio menu harus true atau false.')
    next.menuAudioEnabled = source.menu_audio_enabled
  }
  if (source.links !== undefined) next.links = mergeLinks(next.links, source.links)
  if (source.wait_text !== undefined) next.waitText = safeText(source.wait_text, MAX_TEXT) || defaultMainBotSettings().waitText
  if (source.error_text !== undefined) next.errorText = safeText(source.error_text, MAX_TEXT) || defaultMainBotSettings().errorText
  if (source.multiplier !== undefined) {
    const multiplier = Number(source.multiplier)
    if (!Number.isFinite(multiplier) || multiplier < 1 || multiplier > 1000) {
      throw badRequest('Multiplier harus 1-1000.')
    }
    next.multiplier = Math.trunc(multiplier)
  }

  next.updatedAt = new Date().toISOString()
  next.updatedBy = actor
  const saved = persistMainBotSettings(next)
  await applyMainBotSettingsToRuntime(saved)
  return saved
}

/** Hapus berkas setting dan kembalikan nilai bawaan (bukan API key). */
export async function resetMainBotSettings(options = {}) {
  const actor = safeText(options && options.actor ? options.actor : 'owner-console', 120)
  try { fs.rmSync(settingsFile(), { force: true }) } catch {}
  cache = null
  const fresh = defaultMainBotSettings()
  // Prefix yang sedang aktif dipertahankan: reset setting tidak boleh diam-diam
  // mengubah prefix yang dipakai semua chat di bot utama.
  try {
    const active = String(storedDefaultPrefix() || (global.mainBot && global.mainBot.defaultPrefix) || '').trim()
    if (isValidPrefix(active)) fresh.prefix = active
  } catch {}
  fresh.updatedAt = new Date().toISOString()
  fresh.updatedBy = actor
  await applyMainBotSettingsToRuntime(fresh)
  return fresh
}

/** Bentuk snake_case untuk website + info berkas (tanpa rahasia apa pun). */
export function mainBotSettingsView() {
  const s = loadMainBotSettings({ fresh: true })
  let prefix = s.prefix
  try {
    prefix = storedDefaultPrefix()
      || String((global.mainBot && global.mainBot.defaultPrefix) || '')
      || s.prefix
  } catch {}
  return {
    bot_name: s.botName,
    owner_number: s.ownerNumber,
    prefix,
    mode: s.mode,
    only_group: s.onlyGroup,
    registration_required: s.registrationRequired,
    default_limit: s.defaultLimit,
    limit_enabled: s.limitEnabled,
    auto_ai: s.autoAI,
    disabled_plugins: [...s.disabledPlugins],
    auto_typing: s.autoTyping.enabled,
    auto_typing_config: {
      minDelayMs: s.autoTyping.minDelayMs,
      maxDelayMs: s.autoTyping.maxDelayMs,
      charsPerSecond: s.autoTyping.charsPerSecond,
      includeMedia: s.autoTyping.includeMedia,
    },
    auto_translate: s.autoTranslate.enabled,
    auto_translate_config: {
      source: s.autoTranslate.source,
      defaultLanguage: s.autoTranslate.defaultLanguage,
    },
    menu_audio_enabled: s.menuAudioEnabled,
    links: {
      websiteUrl: s.links.websiteUrl,
      channelUrl: s.links.channelUrl,
      groupUrl: s.links.groupUrl,
      channelId: s.links.channelId,
      upchChannelRole: s.links.upchChannelRole,
      upchChannelVerifiedAt: s.links.upchChannelVerifiedAt,
    },
    wait_text: s.waitText,
    error_text: s.errorText,
    multiplier: s.multiplier,
    updated_at: s.updatedAt,
    updated_by: s.updatedBy,
    file: settingsFile(),
    managed: isMainBotSettingsManaged(),
  }
}

/** Dipakai /upch bot utama bila channel berhasil diverifikasi. */
export function setMainBotUploadChannel(channel) {
  const current = loadMainBotSettings({ fresh: true })
  const next = clone(current)
  if (!channel) {
    next.links = normalizeLinks({ ...next.links, channelId: '', upchChannelRole: '', upchChannelVerifiedAt: 0 })
  } else {
    next.links = normalizeLinks({
      ...next.links,
      channelId: channel.id,
      channelUrl: channel.url || next.links.channelUrl,
      upchChannelRole: channel.role,
      upchChannelVerifiedAt: channel.verifiedAt || Date.now(),
    })
  }
  next.updatedAt = new Date().toISOString()
  next.updatedBy = 'upload-channel'
  return persistMainBotSettings(next)
}

export default {
  defaultMainBotSettings,
  normalizeMainBotSettings,
  loadMainBotSettings,
  persistMainBotSettings,
  applyMainBotSettingsInput,
  applyMainBotSettingsToRuntime,
  applyMainBotSettingsAtBoot,
  syncMainBotSettingsProfile,
  resetMainBotSettings,
  mainBotSettingsView,
  mainBotSettingsFile,
  isMainBotSettingsManaged,
  setMainBotUploadChannel,
}
