/* By AlzRiss - Usanagi Umi AI
 *
 * Penulisan ulang prefix pada pesan keluar.
 *
 * Banyak plugin (lama maupun hasil port) masih menulis contoh perintah dengan
 * titik hardcode, mis. "Contoh: .zikir pagi" atau "Gunakan .menu". Kalau owner
 * atau pengguna mengganti prefix, teks itu jadi menyesatkan.
 *
 * Modul ini menambal di lapisan pengiriman pesan: setiap teks/keterangan yang
 * keluar dari bot diperiksa, dan HANYA token yang benar-benar nama perintah
 * terdaftar yang diganti prefix-nya. Aturan ini menjaga angka desimal ("0.5"),
 * nama domain ("example.com"), dan versi ("v1.4.0") tidak ikut berubah.
 */
/* Import berat (sqlite) dimuat malas supaya modul ini tetap ringan dipanggil
 * di setiap pesan keluar dan tidak membuat siklus impor dengan simple.js. */

const CACHE_TTL_MS = 15_000
const prefixCache = new Map()
let commandCache = { names: new Set(), builtAt: 0, pluginCount: -1 }

function buildCommandNames() {
  const names = new Set()
  const plugins = global.plugins || {}
  const count = Object.keys(plugins).length
  if (count === commandCache.pluginCount && Date.now() - commandCache.builtAt < 60_000) return commandCache.names
  for (const plugin of Object.values(plugins)) {
    if (!plugin || typeof plugin !== 'function') continue
    const command = plugin.command
    if (Array.isArray(command)) {
      for (const item of command) {
        if (typeof item === 'string') names.add(item.toLowerCase())
        else if (item instanceof RegExp) for (const part of String(item.source).split('|')) {
          const clean = part.replace(/\\|\^|\$|\(|\)/g, '')
          if (/^[a-z0-9_-]{2,32}$/i.test(clean)) names.add(clean.toLowerCase())
        }
      }
    } else if (command instanceof RegExp) {
      for (const part of String(command.source).split('|')) {
        const clean = part.replace(/\\|\^|\$|\(|\)/g, '')
        if (/^[a-z0-9_-]{2,32}$/i.test(clean)) names.add(clean.toLowerCase())
      }
    } else if (typeof command === 'string') {
      names.add(command.toLowerCase())
    }
    const help = Array.isArray(plugin.help) ? plugin.help : plugin.help ? [plugin.help] : []
    for (const entry of help) {
      const first = String(entry || '').trim().split(/\s+/)[0].replace(/^\{prefix\}/, '').toLowerCase()
      if (/^[a-z0-9_-]{2,32}$/.test(first)) names.add(first)
    }
  }
  commandCache = { names, builtAt: Date.now(), pluginCount: count }
  return names
}

async function activePrefixFor(jid) {
  const key = String(jid || '')
  const cached = prefixCache.get(key)
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value
  let value = '.'
  try {
    const [{ getActivePrefix }, { prefixStorageKey, getCurrentBotConfig }] = await Promise.all([
      import('../core/awang-prefix.js'),
      import('./bot-config.js'),
    ])
    const profile = getCurrentBotConfig()
    const scopeKey = prefixStorageKey(global.conn || {}, key)
    value = await getActivePrefix(scopeKey, profile?.defaultPrefix || global.mainBot?.defaultPrefix || '.')
  } catch {
    value = global.mainBot?.defaultPrefix || '.'
  }
  prefixCache.set(key, { value, at: Date.now() })
  return value
}

/** Dipanggil setelah prefix diubah agar pesan berikutnya langsung ikut. */
export function clearPrefixRewriteCache() {
  prefixCache.clear()
}

const HINT_PATTERN = /(^|[\s(\[`*_~"'])[.!#/$]([a-z][a-z0-9_-]{1,31})(?![a-z0-9_/-])/gi

export function rewriteCommandHints(text, prefix) {
  if (typeof text !== 'string' || !text) return text
  const names = buildCommandNames()
  const active = String(prefix || '.')
  if (!names.size) return text
  return text.replace(HINT_PATTERN, (match, lead, name) => {
    if (!names.has(name.toLowerCase())) return match
    return `${lead}${active}${name}`
  })
}

/** Ubah isi pesan (text/caption) yang akan dikirim. */
function isPlainObject(value) {
  if (!value || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

export function rewriteOutgoingContent(content, prefix) {
  // Buffer/stream/typed array dioper apa adanya (mis. sendMessage(jid, buffer)).
  if (!isPlainObject(content)) return content
  let changed = false
  const next = { ...content }
  for (const field of ['text', 'caption']) {
    if (typeof next[field] === 'string') {
      const replaced = rewriteCommandHints(next[field], prefix)
      if (replaced !== next[field]) {
        next[field] = replaced
        changed = true
      }
    }
  }
  return changed ? next : content
}

export async function prefixForChat(jid) {
  return activePrefixFor(jid)
}

export default { rewriteCommandHints, rewriteOutgoingContent, prefixForChat, clearPrefixRewriteCache }
