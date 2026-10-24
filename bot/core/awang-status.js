/* By AlzRiss - Usanagi Umi AI */

const SYMBOLS = {
  limit: 'Ⓛ',
  premium: 'Ⓟ',
  owner: 'Ⓞ',
  group: 'Ⓖ',
}

const STATUS_ORDER = ['owner', 'premium', 'group', 'limit']
const LIMIT_CATEGORIES = new Set(['download', 'downloader', 'ai', 'media', 'converter', 'search', 'scraper', 'tools-api'])
const OWNER_CATEGORIES = new Set(['owner', 'owners'])
const PREMIUM_CATEGORIES = new Set(['premium', 'vip', 'pro'])
const GROUP_CATEGORIES = new Set(['group', 'groups', 'rpg'])
const LOCAL_MEDIA_SIGNALS = [
  /\bdownloadContentFromMessage\b/i,
  /\bdownloadMediaMessage\b/i,
]
const LIMIT_SIGNALS = [
  /\b(?:await\s+)?(?:axios|undici)\s*[.(]/i,
  /\bfetch\s*\(\s*['"`]https?:/i,
  /\bnew\s+Request\s*\(/i,
  /\byoutube\.com|youtu\.be|tiktok\.com|instagram\.com|facebook\.com|twitter\.com|x\.com|spotify\.com|pinterest\.com/i,
  /\byt-dlp\b|\bplay-dl\b|\bytDlp\w*\b/i,
  /\b(?:openai|anthropic|gemini)\b\s*[.(]|\bChatCompletion\b/i,
]
const FREE_SIGNALS = [
  /\b(help|menu|allmenu|kategori|listmenu|ping|owner|donasi|peraturan|rules|status|info)\b/i,
]

function resolveBoolean(context, ...values) {
  for (const value of values) {
    if (typeof value === 'boolean') return value
    if (typeof value === 'function') {
      try {
        const resolved = value(context)
        if (typeof resolved === 'boolean') return resolved
      } catch {
      }
    }
  }
  return null
}

function accessValues(plugin) {
  const access = plugin?.access
  if (Array.isArray(access)) return access.map((value) => String(value).trim().toLowerCase()).filter(Boolean)
  if (typeof access === 'string') return access.split(/[|,\s]+/).map((value) => value.trim().toLowerCase()).filter(Boolean)
  return []
}

function getCategory(plugin) {
  return String(plugin?.category || plugin?.tags?.[0] || '').trim().toLowerCase()
}

function getSourceText(plugin) {
  try {
    return typeof plugin === 'function' ? Function.prototype.toString.call(plugin) : ''
  } catch {
    return ''
  }
}

function detectLimitByPolicy(plugin) {
  const category = getCategory(plugin)
  if (LIMIT_CATEGORIES.has(category)) return true
  if (plugin?.hiddenFromLimitPolicy === true) return false
  if (plugin?.free === true || plugin?.noLimit === true || plugin?.limit === false) return false

  const source = getSourceText(plugin)
  if (!source) return false
  const isLocalMediaOnly = LOCAL_MEDIA_SIGNALS.some((pattern) => pattern.test(source))
  if (isLocalMediaOnly) return false
  const freeScore = FREE_SIGNALS.reduce((score, pattern) => score + (pattern.test(source) ? 1 : 0), 0)
  const signalScore = LIMIT_SIGNALS.reduce((score, pattern) => score + (pattern.test(source) ? 1 : 0), 0)
  return signalScore >= 2 && freeScore === 0
}

function resolveStatus(plugin, context = {}) {
  const access = accessValues(plugin)
  const explicitLimit = resolveBoolean(context, plugin?.limit, plugin?.usesLimit, plugin?.useLimit, plugin?.requiresLimit)
  const explicitPremium = resolveBoolean(context, plugin?.premium, plugin?.premiumOnly, plugin?.requiresPremium)
  const explicitOwner = resolveBoolean(context, plugin?.ownerOnly, plugin?.owner, plugin?.requiresOwner)
  const explicitGroup = resolveBoolean(context, plugin?.groupOnly, plugin?.group, plugin?.requiresGroup)
  const category = getCategory(plugin)

  return {
    limit: explicitLimit ?? (access.includes('limit') || detectLimitByPolicy(plugin)),
    premium: explicitPremium ?? (access.includes('premium') || PREMIUM_CATEGORIES.has(category)),
    owner: explicitOwner ?? (access.includes('owner') || OWNER_CATEGORIES.has(category)),
    group: explicitGroup ?? (access.includes('group') || GROUP_CATEGORIES.has(category)),
  }
}

export function getCommandStatus(plugin, context = {}) {
  return resolveStatus(plugin, context)
}

export function getCommandMetadata(plugin, context = {}) {
  const status = resolveStatus(plugin, context)
  return {
    command: context?.command || (Array.isArray(plugin?.help) ? plugin.help[0] : plugin?.help) || null,
    aliases: Array.isArray(plugin?.help) ? [...plugin.help] : [],
    category: getCategory(plugin) || 'umum',
    limit: status.limit,
    premium: status.premium,
    owner: status.owner,
    group: status.group,
    limitCommit: plugin?.limitCommit || (status.limit && /(?:setTimeout|setInterval|\.then\s*\(|void\s+|queueMicrotask)/.test(getSourceText(plugin)) ? 'manual' : status.limit ? 'auto' : 'none'),
  }
}

export function getCommandSymbols(plugin, context = {}) {
  const status = resolveStatus(plugin, context)
  return STATUS_ORDER.filter((key) => status[key]).map((key) => SYMBOLS[key])
}

export function formatCommandWithStatus(command, plugin, prefix = '') {
  // Placeholder {prefix} dilepas karena prefix aktif ditempel di bawah —
  // supaya tidak pernah muncul "{prefix}menu" atau "..menu".
  const cleanCommand = String(command || '').trim().split('{prefix}').join('').replace(/^[./#!$&+~^-]/, '')
  const symbols = getCommandSymbols(plugin, { command: cleanCommand.toLowerCase() })
  return `${prefix}${cleanCommand}${symbols.length ? ` ${symbols.join(' ')}` : ''}`
}

export function isLimitCommand(plugin, context = {}) {
  return resolveStatus(plugin, context).limit
}

export function isPremiumCommand(plugin, context = {}) {
  return resolveStatus(plugin, context).premium
}

export function isOwnerCommand(plugin, context = {}) {
  return resolveStatus(plugin, context).owner
}

export function isGroupCommand(plugin, context = {}) {
  return resolveStatus(plugin, context).group
}

export default {
  getCommandStatus,
  getCommandMetadata,
  getCommandSymbols,
  formatCommandWithStatus,
  isLimitCommand,
  isPremiumCommand,
  isOwnerCommand,
  isGroupCommand,
}
