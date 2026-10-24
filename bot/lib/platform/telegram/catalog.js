/**
 * Katalog plugin WhatsApp untuk antarmuka Telegram.
 *
 * Sumbernya `global.plugins` — objek yang sama yang dimuat `main.js` untuk bot
 * WhatsApp. Jadi menu Telegram tidak pernah "ketinggalan": plugin yang ditambah
 * di `plugins/**` otomatis muncul di kategori yang sesuai, dengan teks bantuan
 * dari `handler.help` milik plugin itu sendiri.
 *
 * Tidak ada data karangan: jumlah dan nama perintah dihitung dari plugin yang
 * benar-benar dimuat di proses ini.
 */
import { FEATURE_GROUPS, HIDDEN_COMMANDS, HIDDEN_CATEGORIES, prettyCommand } from './features.js'
import { waOnlyInfo } from './wa-only.js'

/** Urutan + label kategori. `mobile` dipakai untuk tombol menu utama. */
export const CATEGORY_META = {
  game: { label: 'Game', icon: '🎮', mobile: true },
  rpg: { label: 'RPG', icon: '🐉', mobile: true },
  fun: { label: 'Fun', icon: '😂', mobile: true },
  maker: { label: 'Maker', icon: '🖼️', mobile: true },
  sticker: { label: 'Stiker', icon: '🏷️', mobile: true },
  tools: { label: 'Alat', icon: '🧰', mobile: true },
  group: { label: 'Grup', icon: '👥', mobile: true },
  owner: { label: 'Owner', icon: '👑' },
  ai: { label: 'AI', icon: '🤖', mobile: true },
  downloader: { label: 'Downloader', icon: '⬇️', mobile: true },
  download: { label: 'Download', icon: '📥' },
  search: { label: 'Pencarian', icon: '🔍' },
  anime: { label: 'Anime', icon: '🌸' },
  economy: { label: 'Ekonomi', icon: '💰' },
  music: { label: 'Musik', icon: '🎵' },
  info: { label: 'Info', icon: 'ℹ️' },
  premium: { label: 'Premium', icon: '💎' },
  store: { label: 'Store', icon: '🛒' },
  relationship: { label: 'Relasi', icon: '💞' },
  voice: { label: 'Suara', icon: '🔊' },
  misc: { label: 'Lainnya', icon: '📦' },
  'umi-extra': { label: 'Ekstra', icon: '✨' },
  _system: { label: 'Sistem', icon: '⚙️' },
  data: { label: 'Data', icon: '🗂️' },
  pelengkap: { label: 'Pelengkap', icon: '🧩' },
  notif: { label: 'Notif', icon: '🔔' },
  // Kategori "dummy": bukan plugin, melainkan daftar fitur yang hanya bisa
  // jalan di WhatsApp. Muncul supaya pengguna Telegram tidak bingung ke mana
  // fitur yang mereka kenal dari bot WhatsApp.
  waonly: { label: 'Khusus WhatsApp', icon: '🔒' },
}

export const PAGE_SIZE = 12

/**
 * Plugin di repo ini dimuat sebagai `module.default` — bisa berupa objek
 * `{ handler }` ATAU fungsi handler langsung dengan properti `command/help/tags`
 * menempel padanya. Keduanya harus diterima, kalau tidak katalog terbaca kosong.
 */
export function handlerOf(plugin) {
  if (typeof plugin === 'function') return plugin
  return typeof plugin?.handler === 'function' ? plugin.handler : null
}

function pluginEntries(plugins) {
  if (!plugins || typeof plugins !== 'object') return []
  return Object.entries(plugins).filter(([, plugin]) => handlerOf(plugin) && !plugin?.disabled)
}

/** Nama perintah dari `handler.command` (string | array | RegExp). */
export function commandNames(plugin) {
  const pattern = plugin?.command
  if (!pattern) return []
  if (typeof pattern === 'string') return [pattern.toLowerCase()]
  if (Array.isArray(pattern)) return pattern.map(item => String(item).toLowerCase()).filter(Boolean)
  if (pattern instanceof RegExp) {
    // Pola umum `^a$|^b$` / `^(a|b)$`. Ambil literal yang aman; pencocokan
    // sebenarnya tetap memakai RegExp aslinya saat perintah dijalankan.
    const source = String(pattern.source || '').replace(/^\^|\$$/g, '')
    const parts = source.split('|').map(part => part.replace(/[\^$.()[\]{}?*+\\]/g, '')).filter(part => /^[\w-]{2,}$/.test(part))
    if (parts.length) return [...new Set(parts.map(part => part.toLowerCase()))]
    const loose = [...source.matchAll(/[\w-]{2,}/g)].map(match => match[0].toLowerCase())
    return [...new Set(loose)]
  }
  return []
}

function categoryOf(key, plugin) {
  const tags = Array.isArray(plugin?.tags) ? plugin.tags.map(String) : []
  for (const tag of tags) if (CATEGORY_META[tag]) return tag
  const folder = String(key || '').split('/')[0]
  if (CATEGORY_META[folder]) return folder
  return 'misc'
}

function usageOf(plugin, primary) {
  const help = Array.isArray(plugin?.help) ? plugin.help.map(String).filter(Boolean) : []
  return help.length ? help : [primary]
}

/**
 * Bangun katalog dari objek plugin.
 * @returns {{ items: object[], byCommand: Map<string, object>, byCategory: Map<string, object[]>, total: number }}
 */
export function buildCatalog(plugins = globalThis.plugins) {
  const items = []
  const byCommand = new Map()
  // `canonical` = perintah pertama pada FEATURE_GROUPS. Varian sesudahnya tetap
  // bisa dipakai, tetapi hanya perintah pertama yang tampil di menu.
  const canonical = new Map()
  for (const group of FEATURE_GROUPS) {
    group.commands.forEach((name, index) => {
      if (index === 0) canonical.set(name, group.id)
    })
  }
  const seenCanonical = new Set()
  const waOnlyItems = []
  const waOnlySeen = new Set()
  // Dua tahap: plugin yang didukung Telegram didahulukan, supaya kalau dua
  // plugin memakai perintah yang sama (mis. `/brat` versi WA-only dan versi
  // biasa) yang dipakai di Telegram adalah yang benar-benar bisa jalan.
  const entries = []
  for (const [key, plugin] of pluginEntries(plugins)) {
    const names = commandNames(plugin)
    if (!names.length) continue
    const category = categoryOf(key, plugin)
    const wa = waOnlyInfo(key)
    let hidden = HIDDEN_CATEGORIES.has(category) || names.some(name => HIDDEN_COMMANDS.has(name))
    if (wa.waOnly) hidden = true
    entries.push({ key, plugin, names, category, hidden, waOnly: wa.waOnly, waReason: wa.reason })
  }
  entries.sort((a, b) => Number(a.waOnly) - Number(b.waOnly))

  for (const entry of entries) {
    const { key, plugin, names, category, waOnly } = entry
    let hidden = entry.hidden
    // Varian dalam satu keluarga fitur: cukup satu baris menu.
    const inFamily = names.find(name => canonical.has(name))
    if (inFamily) {
      const groupId = canonical.get(inFamily)
      if (seenCanonical.has(groupId)) hidden = true
      else seenCanonical.add(groupId)
    }
    const item = {
      key,
      category,
      command: names[0],
      aliases: names,
      usage: usageOf(plugin, names[0]),
      description: String(plugin.description || '').slice(0, 120),
      owner: Boolean(plugin.owner),
      admin: Boolean(plugin.admin),
      premium: Boolean(plugin.premium),
      group: Boolean(plugin.group),
      limited: Boolean(plugin.limit),
      hidden,
      waOnly,
      waReason: entry.waReason,
    }
    if (!hidden) items.push(item)
    // Simpan satu entri per plugin untuk halaman "Khusus WhatsApp".
    if (waOnly && !waOnlySeen.has(key) && !HIDDEN_CATEGORIES.has(category)) {
      waOnlySeen.add(key)
      waOnlyItems.push(item)
    }
    entry.item = item
  }
  // Urutan pendaftaran nama: (1) nama utama plugin yang DIDUKUNG Telegram,
  // (2) alias plugin yang didukung, (3) nama utama khusus WhatsApp, (4) alias
  // khusus WhatsApp. Dengan begitu `/ig` tetap mengarah ke plugin yang bisa
  // jalan, meski plugin WA-only memakai `ig` sebagai nama utamanya.
  const supported = entries.filter(entry => !entry.waOnly)
  const blocked = entries.filter(entry => entry.waOnly)
  for (const pass of ['primary', 'alias']) {
    for (const entry of supported) {
      const list = pass === 'primary' ? [entry.names[0]] : entry.names.slice(1)
      for (const name of list) if (!byCommand.has(name)) byCommand.set(name, entry.item)
    }
  }
  for (const pass of ['primary', 'alias']) {
    for (const entry of blocked) {
      const list = pass === 'primary' ? [entry.names[0]] : entry.names.slice(1)
      for (const name of list) if (!byCommand.has(name)) byCommand.set(name, entry.item)
    }
  }
  const byCategory = new Map()
  const seenPerCategory = new Map()
  for (const item of items) {
    if (!byCategory.has(item.category)) {
      byCategory.set(item.category, [])
      seenPerCategory.set(item.category, new Set())
    }
    const seen = seenPerCategory.get(item.category)
    // Dua plugin kadang memakai nama perintah yang sama (mis. `chess` lawas &
    // baru). Menu hanya menampilkan satu baris per perintah; yang dipakai saat
    // eksekusi tetap plugin pertama yang cocok.
    if (seen.has(item.command)) continue
    seen.add(item.command)
    byCategory.get(item.category).push(item)
  }
  for (const list of byCategory.values()) list.sort((a, b) => a.command.localeCompare(b.command))
  return { items, byCommand, byCategory, waOnly: waOnlyItems, total: items.length }
}

let cache = { at: 0, plugins: null, catalog: null }

/** Katalog dengan cache 30 detik (plugin bisa di-reload tanpa restart). */
export function catalog(plugins = globalThis.plugins) {
  const now = Date.now()
  if (cache.catalog && cache.plugins === plugins && now - cache.at < 30000) return cache.catalog
  const value = buildCatalog(plugins)
  cache = { at: now, plugins, catalog: value }
  return value
}

export function resetCatalogCache() {
  cache = { at: 0, plugins: null, catalog: null }
}

/** Daftar kategori yang punya isi, urut sesuai CATEGORY_META. */
export function categories(plugins = globalThis.plugins) {
  const built = catalog(plugins)
  return Object.entries(CATEGORY_META)
    .map(([id, meta]) => ({
      id,
      label: meta.label,
      icon: meta.icon,
      mobile: Boolean(meta.mobile),
      count: id === 'waonly' ? (built.waOnly?.length || 0) : (built.byCategory.get(id)?.length || 0),
    }))
    .filter(entry => entry.count > 0)
}

/**
 * Fitur ringkas untuk menu utama: hanya keluarga dari FEATURE_GROUPS yang
 * perintah utamanya benar-benar termuat di proses ini.
 * @returns {{id:string,label:string,icon:string,description:string,category:string,options:object[]}[]}
 */
export function functions(plugins = globalThis.plugins) {
  const built = catalog(plugins)
  // Satu perintah hanya muncul di satu grup (mis. `/spotify` ada di unduh dan
  // musik — tampil sekali saja) supaya daftar opsi tidak dobel.
  const claimed = new Set()
  return FEATURE_GROUPS
    .map(group => {
      const options = group.commands
        .map(name => {
          if (claimed.has(name)) return null
          const item = built.byCommand.get(name)
          if (!item) return null
          claimed.add(name)
          return {
            command: name,
            usage: item.usage[0] || item.command,
            description: group.notes?.[name] || item.description || prettyCommand(name),
            category: item.category,
          }
        })
        .filter(Boolean)
      return { ...group, options }
    })
    .filter(group => group.options.length > 0)
}

/** Cari keluarga fitur berdasarkan id atau salah satu perintahnya. */
export function findFunction(idOrCommand, plugins = globalThis.plugins) {
  const wanted = String(idOrCommand || '').trim().toLowerCase().replace(/^\//, '')
  if (!wanted) return null
  return functions(plugins).find(group => group.id === wanted || group.commands.includes(wanted)) || null
}

/** Tebak kategori dari kata yang dikirim pengguna (`stiker`, `sticker`, `grup`, ...). */
export function resolveCategory(word, plugins = globalThis.plugins) {
  const wanted = String(word || '').trim().toLowerCase()
  if (!wanted) return null
  const alias = {
    sticker: 'sticker', stiker: 'sticker', grup: 'group', group: 'group', alat: 'tools', tool: 'tools',
    pemilik: 'owner', gambar: 'maker', foto: 'maker', cari: 'search', musik: 'music', lagu: 'music',
    uang: 'economy', ekonomi: 'economy', lain: 'misc', lainnya: 'misc', lainnya_: 'misc', sistem: 'misc',
    download: 'downloader', unduh: 'downloader', relasi: 'relationship', cinta: 'relationship',
    waonly: 'waonly', 'wa-only': 'waonly', wifi: 'waonly', whatsapp: 'waonly', wabot: 'waonly',
  }
  const id = CATEGORY_META[wanted] ? wanted : alias[wanted]
  if (id && CATEGORY_META[id]) return id
  const found = categories(plugins).find(entry => entry.label.toLowerCase() === wanted)
  return found ? found.id : null
}

export function itemsOf(categoryId, plugins = globalThis.plugins) {
  const id = String(categoryId || '')
  if (id === 'waonly') return catalog(plugins).waOnly || []
  return catalog(plugins).byCategory.get(id) || []
}

export function findItem(name, plugins = globalThis.plugins) {
  const wanted = String(name || '').toLowerCase().replace(/^\//, '')
  if (!wanted) return null
  const built = catalog(plugins)
  const direct = built.byCommand.get(wanted)
  if (direct) return direct
  // Cocokkan juga ke RegExp asli plugin (mis. `^kerja$|^work$`).
  for (const [key, plugin] of pluginEntries(plugins)) {
    const pattern = plugin.command
    if (pattern instanceof RegExp && pattern.test(wanted)) {
      const names = commandNames(plugin)
      if (!names.length) continue
      return built.byCommand.get(names[0]) || null
    }
    if (typeof pattern === 'string' && pattern.toLowerCase() === wanted) {
      const names = commandNames(plugin)
      if (names.length) return built.byCommand.get(names[0]) || null
    }
  }
  return null
}

/** Cari perintah dari nama, alias, atau teks bantuan. */
export function search(term, { limit = 24, plugins = globalThis.plugins } = {}) {
  const wanted = String(term || '').trim().toLowerCase()
  if (wanted.length < 2) return []
  const built = catalog(plugins)
  const scored = []
  for (const item of built.items) {
    let score = 0
    if (item.command === wanted) score = 100
    else if (item.aliases.includes(wanted)) score = 90
    else if (item.command.startsWith(wanted)) score = 70
    else if (item.aliases.some(alias => alias.startsWith(wanted))) score = 60
    else if (item.command.includes(wanted)) score = 40
    else if (item.usage.some(line => line.toLowerCase().includes(wanted))) score = 20
    else if (item.category.includes(wanted)) score = 10
    if (score) scored.push({ item, score })
  }
  scored.sort((a, b) => b.score - a.score || a.item.command.localeCompare(b.item.command))
  return scored.slice(0, limit).map(entry => entry.item)
}

function badge(item) {
  const marks = []
  if (item.owner) marks.push('👑')
  if (item.admin) marks.push('🛡️')
  if (item.premium) marks.push('💎')
  if (item.group) marks.push('👥')
  return marks.join('')
}

/** Satu baris daftar perintah: `/kerja` — kerja <jumlah>. */
export function formatItem(item, { detail = false } = {}) {
  if (item.waOnly) {
    // Baris di halaman "Khusus WhatsApp": nama + alasan, bukan cara pakai.
    const name = String(item.command || '').replace(/[<>&]/g, '')
    const desc = String(item.description || item.waReason || '').replace(/[<>&]/g, '').slice(0, 80)
    return `🔒 /<b>${name}</b>${desc ? ` — ${desc}` : ''}`
  }
  const usage = item.usage[0] || item.command
  const marks = badge(item)
  const head = `/<b>${usage.split(/\s+/)[0].replace(/[<>&]/g, '')}</b>`
  const rest = usage.split(/\s+/).slice(1).join(' ')
  const tail = rest ? ` <code>${rest.replace(/[<>&]/g, '')}</code>` : ''
  const desc = item.description && item.description.toLowerCase() !== usage.toLowerCase() ? ` — ${item.description.replace(/[<>&]/g, '')}` : ''
  return `${marks ? `${marks} ` : ''}${head}${tail}${desc}${detail ? `\n   <i>${item.category}</i>` : ''}`
}

/**
 * Potongan halaman kategori siap kirim.
 * @returns {{ text: string, page: number, pages: number, total: number, category: object|null }}
 */
export function pageOf(categoryId, page = 1, { plugins = globalThis.plugins, size = PAGE_SIZE } = {}) {
  const meta = CATEGORY_META[categoryId] || { label: String(categoryId || '?'), icon: '📦' }
  const items = itemsOf(categoryId, plugins)
  const total = items.length
  const pages = Math.max(1, Math.ceil(total / size))
  const current = Math.min(Math.max(1, Math.floor(Number(page) || 1)), pages)
  const slice = items.slice((current - 1) * size, current * size)
  const lines = [
    `${meta.icon} <b>${categoryId === 'waonly' ? 'KHUSUS WHATSAPP' : `MENU ${String(meta.label).toUpperCase()}`}</b>`,
    `<i>${total} fitur · halaman ${current}/${pages}</i>`,
  ]
  if (categoryId === 'waonly') {
    lines.push(
      '',
      '<i>Fitur di bawah ini butuh kemampuan yang hanya ada di WhatsApp (mis. papan game interaktif). Tidak bisa dijalankan dari Telegram.</i>',
      '<b>Cara pakai:</b> buka bot WhatsApp atau jadibot WA milikmu.',
    )
  }
  lines.push('', ...slice.map(item => formatItem(item)))
  if (total > slice.length) lines.push('', '<i>Tekan ➡️ / ⬅️ untuk halaman lain, atau ketik perintahnya langsung.</i>')
  return { text: lines.join('\n'), page: current, pages, total, category: { id: categoryId, label: meta.label, icon: meta.icon } }
}

/** Ringkasan semua kategori untuk `/menu` dan `/allmenu`. */
export function summaryLines(plugins = globalThis.plugins) {
  return categories(plugins).map(entry => `${entry.icon} <b>${entry.label}</b> — ${entry.count} perintah · <code>/menu ${entry.id}</code>`)
}

export default {
  CATEGORY_META, PAGE_SIZE, buildCatalog, catalog, resetCatalogCache, categories, resolveCategory,
  itemsOf, findItem, search, formatItem, pageOf, summaryLines, commandNames, handlerOf,
}
