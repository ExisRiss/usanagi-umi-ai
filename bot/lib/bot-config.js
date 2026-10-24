
import fs from 'fs'
import path from 'node:path'
import { AsyncLocalStorage } from 'node:async_hooks'
import { isMainBotSettingsManaged, loadMainBotSettings } from './main-bot-settings.js'

const context = globalThis.__usanagiBotConfigContext || new AsyncLocalStorage()
globalThis.__usanagiBotConfigContext = context

const MAIN_SCOPE = 'main'
const CONFIG_FILE = 'bot-config.json'
const dynamicKeys = [
  'namebot', 'autoTyping', 'autoTranslate', 'runtimePerformance',
  'links', 'brandingAssets', 'images', 'ownerInfo', 'stickpack',
  'wait', 'eror', 'multiplier', 'tiktokRich', 'groupWelcomeTemplates',
  'groupGoodbyeTemplates', 'scriptUrl', 'backupGroupLink'
]
const mainValues = globalThis.__usanagiMainConfigValues || {}
globalThis.__usanagiMainConfigValues = mainValues
let accessorsInstalled = Boolean(globalThis.__usanagiBotConfigAccessorsInstalled)

const clone = value => {
  if (value === undefined) return undefined
  return JSON.parse(JSON.stringify(value))
}

function normalizeGroupWelcomeTemplates(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const output = {}
  for (const [groupId, rawText] of Object.entries(value)) {
    if (Object.keys(output).length >= 500) break
    const id = String(groupId || '').trim()
    const text = String(rawText ?? '').replace(/\u0000/g, '').trim()
    if (!/^\d{5,25}(?:-\d{5,25})?@g\.us$/.test(id) || !text || text.length > 4096) continue
    output[id] = text
  }
  return output
}

function normalizeDefaultLimit(value, fallback = 25) {
  const number = Number(value)
  if (number === -1) return -1
  if (!Number.isFinite(number)) return fallback
  return Math.max(0, Math.min(100000, Math.trunc(number)))
}

/**
 * Mode Premium per bot: saklar ON/OFF + daftar fitur yang dikunci.
 * Entri disimpan dalam huruf kecil supaya pencocokan tidak peka huruf besar.
 */
export function normalizePremiumConfig(value) {
  const raw = value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  const source = Array.isArray(raw.plugins) ? raw.plugins : []
  const plugins = []
  const seen = new Set()
  for (const item of source) {
    const entry = String(item === undefined || item === null ? '' : item)
      .trim()
      .toLowerCase()
      .replace(/^[.#!/\\]+/, '')
      .slice(0, 120)
    if (!entry || seen.has(entry)) continue
    seen.add(entry)
    plugins.push(entry)
    if (plugins.length >= 300) break
  }
  return {
    enabled: raw.enabled !== false,
    plugins,
  }
}

function merge(base, override) {
  if (!base || typeof base !== 'object' || Array.isArray(base)) return override === undefined ? clone(base) : clone(override)
  const output = clone(base) || {}
  if (!override || typeof override !== 'object' || Array.isArray(override)) return output
  for (const [key, value] of Object.entries(override)) {
    output[key] = value && typeof value === 'object' && !Array.isArray(value)
      ? merge(output[key] || {}, value)
      : clone(value)
  }
  return output
}

export function normalizeBotNumber(value) {
  const digits = String(value || '').replace(/\D/g, '')
  return digits.startsWith('0') ? `62${digits.slice(1)}` : digits
}

export function lockedJadibotOwnerNumber() {
  const configured = normalizeBotNumber(global.jadibotPlatform?.lockedOwnerNumber)
  if (configured) return configured
  const fallback = (global.owner || []).map(item => normalizeBotNumber(Array.isArray(item) ? item[0] : item)).find(Boolean)
  return fallback || 'OWNER_PHONE_PLACEHOLDER'
}

export function normalizeJadibotOwners(values = []) {
  const locked = lockedJadibotOwnerNumber()
  const requested = (Array.isArray(values) ? values : [values])
    .map(normalizeBotNumber)
    .filter(number => number.length >= 8 && number.length <= 15 && number !== locked)
  return [...new Set([...requested, locked])]
}

export function installBotConfigAccessors() {
  if (accessorsInstalled) return
  for (const key of dynamicKeys) {
    mainValues[key] = global[key]
    Object.defineProperty(global, key, {
      configurable: true,
      enumerable: true,
      get() {
        const profile = context.getStore()
        return profile?.values?.[key] ?? mainValues[key]
      },
      set(value) {
        mainValues[key] = value
      },
    })
  }
  accessorsInstalled = true
  globalThis.__usanagiBotConfigAccessorsInstalled = true
}

export function getMainBotConfig() {
  installBotConfigAccessors()
  // Setting bot utama (data/main-bot-settings.json) menang atas nilai bawaan.
  // Kalau owner belum pernah menyimpan setting dari website, perilaku lama
  // tetap dipakai supaya bot yang sudah jalan tidak berubah diam-diam.
  const managed = isMainBotSettingsManaged()
  const settings = managed ? loadMainBotSettings() : null
  return {
    type: 'main',
    scope: MAIN_SCOPE,
    number: '',
    defaultPrefix: String(settings ? settings.prefix : (global.mainBot?.defaultPrefix || '.')),
    defaultLimit: settings ? settings.defaultLimit : 50,
    limitEnabled: settings ? settings.limitEnabled !== false : global.mainBot?.limitEnabled !== false,
    public: settings ? settings.mode !== 'self' : true,
    managedSettings: Boolean(settings),
    onlyGroup: settings ? settings.onlyGroup === true : false,
    registrationRequired: settings ? settings.registrationRequired !== false : global.mainBot?.registrationRequired !== false,
    ownerNumbers: settings && settings.ownerNumber ? [settings.ownerNumber] : [],
    disabledPlugins: settings ? [...settings.disabledPlugins] : [],
    values: mainValues,
  }
}

function defaults() {
  installBotConfigAccessors()
  const configured = global.jadibotDefaults || {}
  const links = merge(mainValues.links || {}, configured.links || {})
  const namebot = String(configured.namebot || 'Usanagi Umi Jadibot')
  return {
    namebot,
    defaultPrefix: String(configured.defaultPrefix || '.'),
    defaultLimit: normalizeDefaultLimit(configured.defaultLimit, 25),
    limitEnabled: configured.limitEnabled !== false,
    public: configured.public !== false,
    onlyGroup: configured.onlyGroup === true,
    registrationRequired: configured.registrationRequired !== false,
    stickpack: String(configured.stickpack || namebot),
    autoAI: { enabled: configured.autoAI?.enabled !== false },
    autoTyping: merge(mainValues.autoTyping || {}, configured.autoTyping || {}),
    autoTranslate: merge(mainValues.autoTranslate || {}, configured.autoTranslate || {}),
    runtimePerformance: merge(mainValues.runtimePerformance || {}, configured.runtimePerformance || {}),
    links,
    brandingAssets: merge(mainValues.brandingAssets || {}, configured.brandingAssets || {}),
    images: clone(mainValues.images || {}),
    ownerInfo: {
      ...(clone(mainValues.ownerInfo || {})),
      subtitle: `Jadibot of ${namebot}`,
    },
    tiktokRich: merge(mainValues.tiktokRich || {}, configured.tiktokRich || {}),
    groupWelcomeTemplates: normalizeGroupWelcomeTemplates(configured.groupWelcomeTemplates || {}),
    groupGoodbyeTemplates: normalizeGroupWelcomeTemplates(configured.groupGoodbyeTemplates || {}),
    wait: String(mainValues.wait || '✨ _Tunggu sebentar..._'),
    eror: String(mainValues.eror || '🚩 Terjadi kesalahan.'),
    multiplier: Number(mainValues.multiplier) || 38,
    ownerNumbers: normalizeJadibotOwners(configured.ownerNumbers || []),
    premium: normalizePremiumConfig(configured.premium || {}),
    disabledPlugins: Array.isArray(configured.disabledPlugins) ? [...configured.disabledPlugins] : [],
    enabledCustomPlugins: Array.isArray(configured.enabledCustomPlugins) ? [...configured.enabledCustomPlugins] : [],
  }
}

function sanitize(raw = {}) {
  const base = defaults()
  const output = merge(base, raw)
  output.namebot = String(output.namebot || base.namebot).slice(0, 80)
  output.defaultPrefix = String(output.defaultPrefix || '.').slice(0, 3) || '.'
  output.defaultLimit = normalizeDefaultLimit(output.defaultLimit, base.defaultLimit)
  output.limitEnabled = output.limitEnabled !== false
  output.autoAI = { enabled: raw.autoAIEnabled === false ? false : output.autoAI?.enabled !== false }
  output.public = output.public !== false
  output.onlyGroup = output.onlyGroup === true
  output.registrationRequired = output.registrationRequired !== false
  output.groupWelcomeTemplates = normalizeGroupWelcomeTemplates(output.groupWelcomeTemplates)
  output.groupGoodbyeTemplates = normalizeGroupWelcomeTemplates(output.groupGoodbyeTemplates)
  output.stickpack = String(output.stickpack || output.namebot).slice(0, 80)
  output.ownerNumbers = normalizeJadibotOwners(output.ownerNumbers || [])
  output.premium = normalizePremiumConfig({
    enabled: raw.premium && typeof raw.premium === 'object' ? raw.premium.enabled : output.premium?.enabled,
    plugins: raw.premium && typeof raw.premium === 'object' ? raw.premium.plugins : output.premium?.plugins,
  })
  output.disabledPlugins = [...new Set((Array.isArray(output.disabledPlugins) ? output.disabledPlugins : []).map(String).map(v => v.trim()).filter(Boolean))].slice(0, 500)
  output.enabledCustomPlugins = [...new Set((Array.isArray(output.enabledCustomPlugins) ? output.enabledCustomPlugins : []).map(String).map(v => v.replace(/\\/g, '/').trim().toLowerCase()).filter(v => /^custom\/[a-z0-9_.-]+\.js$/.test(v)))].slice(0, 100)
  return output
}

export function sessionConfigPath(number, sessionPath = '') {
  const normalized = normalizeBotNumber(number)
  const directory = sessionPath || path.join('sessions', 'jadibot', normalized)
  return path.join(directory, CONFIG_FILE)
}

export function loadJadibotConfig(number, sessionPath = '', { create = true } = {}) {
  installBotConfigAccessors()
  const normalized = normalizeBotNumber(number || path.basename(sessionPath))
  const file = sessionConfigPath(normalized, sessionPath)
  let stored = {}
  try { stored = JSON.parse(fs.readFileSync(file, 'utf8')) } catch {}
  const values = sanitize(stored)
  const profile = {
    type: 'jadibot',
    scope: `jadibot:${normalized}`,
    number: normalized,
    defaultPrefix: values.defaultPrefix,
    defaultLimit: values.defaultLimit,
    limitEnabled: values.limitEnabled !== false,
    public: values.public,
    onlyGroup: values.onlyGroup,
    registrationRequired: values.registrationRequired,
    ownerNumbers: values.ownerNumbers,
    premium: values.premium,
    disabledPlugins: values.disabledPlugins,
    enabledCustomPlugins: values.enabledCustomPlugins,
    file,
    values: {
      namebot: values.namebot,
      limitEnabled: values.limitEnabled !== false,
      autoAI: values.autoAI,
      autoTyping: values.autoTyping,
      autoTranslate: values.autoTranslate,
      runtimePerformance: values.runtimePerformance,
      links: values.links,
      brandingAssets: values.brandingAssets,
      images: values.images,
      ownerInfo: values.ownerInfo,
      stickpack: values.stickpack,
      wait: values.wait,
      eror: values.eror,
      multiplier: values.multiplier,
      tiktokRich: values.tiktokRich,
      groupWelcomeTemplates: values.groupWelcomeTemplates,
      groupGoodbyeTemplates: values.groupGoodbyeTemplates,
      scriptUrl: values.links.websiteUrl,
      backupGroupLink: values.links.groupUrl,
    },
  }
  if (create) saveJadibotConfig(profile)
  return profile
}

export function saveJadibotConfig(profile) {
  if (!profile || profile.type !== 'jadibot' || !profile.file) throw new Error('Profil Jadibot tidak valid.')
  const serializable = sanitize({
    namebot: profile.values?.namebot,
    defaultPrefix: profile.defaultPrefix,
    defaultLimit: profile.defaultLimit,
    limitEnabled: profile.limitEnabled !== false,
    public: profile.public,
    onlyGroup: profile.onlyGroup,
    registrationRequired: profile.registrationRequired !== false,
    ownerNumbers: profile.ownerNumbers,
    stickpack: profile.values?.stickpack,
    autoAI: profile.values?.autoAI,
    autoTyping: profile.values?.autoTyping,
    autoTranslate: profile.values?.autoTranslate,
    runtimePerformance: profile.values?.runtimePerformance,
    links: profile.values?.links,
    brandingAssets: profile.values?.brandingAssets,
    images: profile.values?.images,
    ownerInfo: profile.values?.ownerInfo,
    wait: profile.values?.wait,
    eror: profile.values?.eror,
    multiplier: profile.values?.multiplier,
    tiktokRich: profile.values?.tiktokRich,
    groupWelcomeTemplates: profile.values?.groupWelcomeTemplates,
    groupGoodbyeTemplates: profile.values?.groupGoodbyeTemplates,
    premium: profile.premium,
    disabledPlugins: profile.disabledPlugins,
    enabledCustomPlugins: profile.enabledCustomPlugins,
  })
  fs.mkdirSync(path.dirname(profile.file), { recursive: true })
  const temp = `${profile.file}.${process.pid}.tmp`
  fs.writeFileSync(temp, `${JSON.stringify(serializable, null, 2)}\n`, { mode: 0o600 })
  fs.renameSync(temp, profile.file)
  return profile
}

export function resetJadibotConfig(profile) {
  if (!profile?.number) throw new Error('Profil Jadibot tidak valid.')
  try { fs.rmSync(profile.file, { force: true }) } catch {}
  const fresh = loadJadibotConfig(profile.number, path.dirname(profile.file), { create: true })
  Object.assign(profile, fresh)
  return profile
}

export function runWithBotConfig(conn, callback) {
  installBotConfigAccessors()
  const profile = conn?.botConfig || getMainBotConfig()
  return context.run(profile, callback)
}

export function getCurrentBotConfig() {
  return context.getStore() || getMainBotConfig()
}

export function prefixStorageKey(conn, chatId) {
  const profile = conn?.botConfig || getCurrentBotConfig()
  return profile?.scope && profile.scope !== MAIN_SCOPE
    ? `${profile.scope}:${chatId}`
    : chatId
}

export function isPluginDisabled(profile, pluginName, command = '') {
  // Bot utama ikut aturan plugin nonaktif kalau owner menyimpan setting dari web.
  if (!profile || (profile.type !== 'jadibot' && profile.managedSettings !== true)) return false
  const entries = profile.disabledPlugins || []
  const name = String(pluginName || '').toLowerCase()
  const cmd = String(command || '').toLowerCase()
  return entries.some(entry => {
    const rule = String(entry).toLowerCase()
    if (rule.startsWith('command:')) return cmd && cmd === rule.slice(8)
    if (rule.startsWith('plugin:')) return name === rule.slice(7) || name.endsWith(`/${rule.slice(7)}`)
    return name === rule || name.endsWith(`/${rule}`)
  })
}

export default {
  installBotConfigAccessors,
  getMainBotConfig,
  loadJadibotConfig,
  saveJadibotConfig,
  resetJadibotConfig,
  runWithBotConfig,
  getCurrentBotConfig,
  prefixStorageKey,
  isPluginDisabled,
}
