/* By AlzRiss - Usanagi Umi AI */

import os from 'os'
import fs from 'fs'
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@rexxhayanasi/elaina-baileys'
import { settings } from '../config/settings.js'
import { pluginStore, getAllCategories, getPluginsByCategory } from '../core/awang-loader.js'
import { creatorWatermark } from '../core/awang-identitas.js'
import { formatCommandWithStatus } from '../core/awang-status.js'
import { resolvePhoneNumber, normalizeNumber } from './awang-cekakses.js'
import { getUser } from '../core/awang-userdb.js'
import { getUser as getRpgUser } from '../lib/rpg/awang-db.js'
import { isOwner as checkOwner } from './awang-cekakses.js'
import { createReplyV1Quoted } from './awang-reply.js'
import { readMenuMedia } from './menu-media.js'

function formatCategoryName(categoryKey) {
  return categoryKey
    .split(/[-_]/)
    .map((word) => {
      const isAllUpper = word === word.toUpperCase() && word.length > 1
      return isAllUpper ? word : word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

function resolveCategoryMeta(categoryKey) {
  const name = formatCategoryName(categoryKey)

  return {
    title: `Menu ${name}`,
    description: `Kumpulan fitur ${name.toLowerCase()}`,
  }
}

function cleanMenuDisplayName(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim().replace(/^@+/, '')
  if (!text || /^\+?\d+$/.test(text)) return ''
  return Array.from(text).slice(0, 40).join('')
}

function collectMenuIdentityCandidates(m, conn, resolvedJid = '') {
  const rawKey = m?.raw?.key || {}
  return [
    resolvedJid,
    rawKey.participantAlt,
    rawKey.participant,
    m?.sender,
    rawKey.remoteJid,
  ].map((value) => String(value || '').trim()).filter(Boolean)
}

function extractConnectionName(conn, candidates) {
  for (const jid of candidates) {
    const contacts = [
      conn?.store?.contacts?.[jid],
      conn?.contacts?.[jid],
    ]
    for (const contact of contacts) {
      const values = [
        contact?.pushName,
        contact?.name,
        contact?.notify,
        contact?.profileName,
        contact?.contactName,
        contact?.shortName,
        contact?.verifiedName,
        contact?.displayName,
      ]
      for (const value of values) {
        const name = cleanMenuDisplayName(value)
        if (name) return name
      }
    }
  }
  return ''
}

async function resolveMenuParticipantJid(m, conn) {
  const rawKey = m?.raw?.key || {}
  const directCandidates = [rawKey.participantAlt, m?.sender, rawKey.participant, rawKey.remoteJid]
  const phoneCandidate = directCandidates.find((value) => /@s\.whatsapp\.net$/i.test(String(value || '').trim()))
  if (phoneCandidate) return String(phoneCandidate).trim()

  const lidCandidate = directCandidates.find((value) => /@lid$/i.test(String(value || '').trim()))
  if (lidCandidate) {
    try {
      const number = await resolvePhoneNumber(lidCandidate, conn)
      if (number) return `${normalizeNumber(number)}@s.whatsapp.net`
    } catch {}
    return lidCandidate
  }

  for (const candidate of directCandidates) {
    const value = String(candidate || '').trim()
    const number = normalizeNumber(value)
    if (/^\d{7,20}$/.test(number)) return `${number}@s.whatsapp.net`
  }

  return ''
}

export async function resolveMenuMention(m, conn) {
  const jid = await resolveMenuParticipantJid(m, conn)
  const candidates = collectMenuIdentityCandidates(m, conn, jid)
  const directName = cleanMenuDisplayName(m?.pushName || m?.raw?.pushName)
  if (directName) return { jid, name: directName, text: `@${directName}` }

  const connectionName = extractConnectionName(conn, candidates)
  if (connectionName) return { jid, name: connectionName, text: `@${connectionName}` }

  if (jid) {
    try {
      const user = await getUser(jid)
      const dbName = cleanMenuDisplayName(user?.pushName)
      if (dbName) return { jid, name: dbName, text: `@${dbName}` }
    } catch {}
  }

  for (const candidate of candidates) {
    const fallback = cleanMenuDisplayName(candidate?.split('@')[0]?.split(':')[0])
    if (fallback && !/^\d+$/.test(fallback)) return { jid, name: fallback, text: `@${fallback}` }
  }

  return { jid, name: 'User', text: '@User' }
}

export function getGreeting() {
  const hour = new Date().toLocaleString('en-US', { timeZone: settings.timezone, hour: 'numeric', hour12: false })
  const h = parseInt(hour, 10)

  if (h >= 4 && h < 11) return 'Selamat Pagi'
  if (h >= 11 && h < 15) return 'Selamat Siang'
  if (h >= 15 && h < 19) return 'Selamat Sore'
  return 'Selamat Malam'
}

function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const parts = []
  if (d) parts.push(`${d}h`)
  parts.push(`${h}j ${m}m ${s}d`)
  return parts.join(' ')
}

function getSystemInfo() {
  const memUsage = process.memoryUsage()
  const memPercent = ((memUsage.rss / os.totalmem()) * 100).toFixed(1)

  return {
    uptime: formatUptime(process.uptime()),
    memory: memPercent,
    platform: os.platform(),
    nodeVersion: process.version,
  }
}
function buildInfoBlock({ botName, ownerName, botVersion, botMode, pushName, isOwnerUser, contactNumber, registeredAt }) {
  const statusLabel = isOwnerUser ? 'Owner' : 'User'
  const registerLabel = registeredAt
    ? new Date(registeredAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Baru terdaftar'

  return [
    '╭ ┈──ׅ─┈─ׅ─┈─ׅ─┈─ׅ─',
    '│   ---- *⫹ INFO BOT ⫺* ----',
    '│╭ ┈──ׅ───ׅ──ׅ─┈─ׅ─',
    `││ *‎‎𖢷 ׁ 𖹭₊  Name  :* ${botName}`,
    `││ *‎‎𖢷 ׁ 𖹭₊  Owner  :* ${ownerName}`,
    `││ *𖢷 ׁ 𖹭₊  Versi   :* ${botVersion}`,
    `││ *‎‎𖢷 ׁ 𖹭₊  Mode   :* ${botMode}`,
    '│‎╰┈─ׅ──ֺ─ֺ──ׅ──ׅ─ֺ─ֺ',
    '‎╰┈─ׅ──ֺ─ֺ───ׅ─  ׅ ⏝ׅ︶ ׅ 𝅄',
    '',
    '╭ ┈──ׅ─┈─ׅ─┈─ׅ─┈─ׅ─',
    '│  ---- *⫹ INFO USER ⫺* ----',
    '│╭ ┈──ׅ─┈─ׅ─┈─ׅ──ׅ─',
    `││ *𖢷 ׁ 𖹭₊  Name    :* ${pushName}`,
    `││ *𖢷 ׁ 𖹭₊  Status   :* ${statusLabel}`,
    `││ *𖢷 ׁ 𖹭₊  Kontak  :* ${contactNumber}`,
    `││ *𖢷 ׁ 𖹭₊  Register  :* ${registerLabel}`,
    '│‎╰┈─ׅ──ֺ─ֺ──ׅ─ֺ─ֺ─ׅ─',
    '‎╰┈─ׅ──ֺ─ֺ───ׅ─  ׅ ⏝ׅ︶ ׅ 𝅄',
    '',
    '🌐 *JADIBOT BY AlzRiss*',
    '▸ https://website-jadibot-by-alzriss.vercel.app',
  ].join('\n')
}


function buildKategoriBlock(categoryTitle, commandList) {
  const lines = [`‎┇╭─•⪨  *` + '`' + `${categoryTitle.toUpperCase()}` + '`' + `*`, '‎┇‎├───────────']
  commandList.forEach((cmd) => lines.push(`‎┇│‎✎ ${cmd}`))
  lines.push('‎┇‎╰──────────⌯⌲')
  return lines.join('\n')
}

function buildStatusHeader() {
  return [
    `┇👋 Hai welcome saya *${settings.botName}*`,
    '┇ WhatsApp Bot pintar & multifungsi',
    '┇ Dirancang untuk memudahkan harimu',
    '┇ Semua fitur sudah aktif dan lengkap',
    '',
    '╭ ┈──ׅ─┈─ׅ─┈─ׅ─┈─ׅ',
    '│  --- *⫹ KETERANGAN ⫺* ---',
    '│╭ ┈──ׅ─┈─ׅ─┈─ׅ──ׅ',
    '││ *Ⓛ = Menggunakan Limit*',
    '││ *Ⓟ = Khusus Premium*',
    '││ *Ⓞ = Khusus Owner*',
    '││ *Ⓖ = Khusus Di Grup*',
    '│‎╰┈─ׅ──ֺ─ֺ──ׅ─ֺ─ֺ─ׅ─ ╰┈─ׅ──ֺ─ֺ───ׅ─  ׅ ⏝ׅ︶ ׅ 𝅄',
    '',
    '▭▬▭▬▭▬▭▬▭▬▭▬▭',
  ].join('\n')
}

function getPluginMenuCommands(plugin, prefix) {
  const menuHelp = Array.isArray(plugin.menuHelp)
    ? plugin.menuHelp
    : plugin.menuHelp ? [plugin.menuHelp] : []
  const help = Array.isArray(plugin.help)
    ? plugin.help
    : plugin.help ? [plugin.help] : []

  // Jangan hanya mengambil help[0]. Satu plugin sering menyediakan beberapa
  // command (contoh play, playaudio, playvideo) yang semuanya harus tampil.
  const names = [...new Set([...menuHelp, ...help]
    .filter((name) => typeof name === 'string' && name.trim())
    .map((name) => name.trim()))]

  return names.map((name) => formatCommandWithStatus(name, plugin, prefix))
}

export function buildMenuFooter({ prefix = settings.defaultPrefix, pushName = 'Kak', contactNumber = '-', isOwnerUser = false, registeredAt = null } = {}) {
  const lines = []

  lines.push(`┇👋 Hai welcome saya *${settings.botName}*`)
  lines.push('‎┇ WhatsApp Bot pintar & multifungsi')
  lines.push('‎┇ Dirancang untuk memudahkan harimu')
  lines.push('‎┇ Semua fitur sudah aktif dan lengkap')
  lines.push('')
  lines.push(
    buildInfoBlock({
      botName: settings.botName,
      ownerName: settings.ownerName,
      botVersion: settings.botVersion,
      botMode: settings.botMode,
      pushName,
      contactNumber,
      isOwnerUser,
      registeredAt,
    })
  )

  return lines.join('\n')
}

export function buildCategoryList({ prefix = settings.defaultPrefix } = {}) {
  const activeCategories = getAllCategories()
    .map((key) => ({ key, meta: resolveCategoryMeta(key) }))
    .filter(({ key }) => getPluginsByCategory(key).length > 0)
    .sort((a, b) => a.key.localeCompare(b.key))

  const categoryRows = activeCategories.map(({ key, meta }) => {
    const total = getPluginsByCategory(key).length
    return {
      title: `${meta.title} • ${total} fitur`,
      description: meta.description || `Kumpulan fitur ${meta.title.toLowerCase()}`,
      command: `${prefix}kategori ${key}`,
    }
  })

  const categorySections = []
  for (let index = 0; index < categoryRows.length; index += 8) {
    const page = Math.floor(index / 8) + 1
    const totalPages = Math.ceil(categoryRows.length / 8)
    categorySections.push({
      title: totalPages > 1 ? `Kategori Tersedia ${page}/${totalPages}` : 'Kategori Tersedia',
      rows: categoryRows.slice(index, index + 8),
    })
  }

  return {
    listTitle: 'Pilih Kategori',
    sections: [
      {
        title: 'Menu Utama',
        highlightLabel: 'Rekomendasi',
        rows: [
          {
            header: '📖',
            title: 'Semua Fitur',
            description: 'Daftar lengkap seluruh perintah bot',
            command: `${prefix}allmenu`,
          },
          {
            header: '🫅',
            title: 'Owner Bot',
            description: 'Kirim kontak owner bot',
            command: `${prefix}owner`,
          },
        ],
      },
      ...categorySections,
      {
        title: 'Pusat Bantuan & Dukungan',
        highlightLabel: 'Support Kami',
        rows: [
          {
            header: '💝',
            title: 'Donasi',
            description: 'Dukung pengembangan dan operasional Usanagi Umi AI',
            command: `${prefix}donasi`,
          },
          {
            header: '📜',
            title: 'Peraturan Bot',
            description: 'Panduan penggunaan bot yang aman dan tertib',
            command: `${prefix}peraturan`,
          },
        ],
      },
    ],
  }
}

export function buildCategoryText(categoryKey, { prefix = settings.defaultPrefix, pushName = 'Kak', contactNumber = '-', isOwnerUser = false, registeredAt = null } = {}) {
  const meta = resolveCategoryMeta(categoryKey)
  const commandList = getPluginsByCategory(categoryKey)
    .flatMap((plugin) => getPluginMenuCommands(plugin, prefix))
    .sort()

  return [
    buildStatusHeader(),
    '',
    buildKategoriBlock(meta.title, commandList.length ? commandList : ['Belum ada fitur di kategori ini']),
    '',
    creatorWatermark(),
  ].join('\n')
}

export function buildFullMenuText({ prefix = settings.defaultPrefix, pushName = 'Kak', contactNumber = '-', isOwnerUser = false, registeredAt = null } = {}) {
  const activeCategories = getAllCategories()
    .map((key) => ({ key, meta: resolveCategoryMeta(key) }))
    .filter(({ key }) => getPluginsByCategory(key).length > 0)
    .sort((a, b) => a.key.localeCompare(b.key))

  const blocks = activeCategories.map(({ key, meta }) => {
    const commandList = getPluginsByCategory(key)
      .flatMap((plugin) => getPluginMenuCommands(plugin, prefix))
      .sort()

    return buildKategoriBlock(meta.title, commandList)
  })

  return [
    buildStatusHeader(),
    '',
    blocks.join('\n\n'),
    '',
    creatorWatermark(),
  ].join('\n')
}


const MENU_STYLE_LABELS = Object.freeze({
  default: 'Menu Default · ButtonV2',
  modern: 'Menu Modern · Native Flow',
})

export function getSelectableMenuLabel(style) {
  const value = String(style || '').trim().toLowerCase()
  return MENU_STYLE_LABELS[value] || MENU_STYLE_LABELS.default
}

export function buildMenuStyleRows(usedPrefix, activeStyle) {
  return [
    {
      title: MENU_STYLE_LABELS.default,
      description: 'ButtonV2 dengan tampilan ringkas.',
      highlightLabel: activeStyle === 'default' ? 'AKTIF' : '',
      command: `${usedPrefix}setmenu default`,
    },
    {
      title: MENU_STYLE_LABELS.modern,
      description: 'Native Flow dengan navigasi modern.',
      highlightLabel: activeStyle === 'modern' ? 'AKTIF' : '',
      command: `${usedPrefix}setmenu modern`,
    },
  ]
}

export function buildMenuStyleSections(usedPrefix, activeStyle) {
  const rows = buildMenuStyleRows(usedPrefix, activeStyle).map(({ highlightLabel, ...row }) => row)
  const activeIndex = Math.max(0, rows.findIndex((row) => row.command.endsWith(` ${activeStyle}`)))

  if (activeIndex <= 0) {
    return [{ title: 'Tampilan Menu', highlightLabel: 'AKTIF', rows }]
  }

  return [
    {
      title: 'Tampilan Menu',
      rows: rows.slice(0, activeIndex),
    },
    {
      title: 'Tampilan Menu',
      rows: rows.slice(activeIndex),
      highlightLabel: 'AKTIF',
    },
  ]
}

export default { buildMenuFooter, buildCategoryList, buildCategoryText, buildFullMenuText, getSystemInfo, getGreeting, sendModernMenu, getSelectableMenuLabel, buildMenuStyleRows, buildMenuStyleSections }

const BOT_NAME = settings.botName || 'Usanagi Umi AI - MD'
const GROUP_URL = settings.links?.groupLink || ''
const OFFER_EXPIRE_MS = 86_400_000

function fontBold(str) {
  return [...String(str)].map(c => {
    const n = c.codePointAt(0)
    if (n >= 65 && n <= 90) return String.fromCodePoint(0x1D400 + n - 65)
    if (n >= 97 && n <= 122) return String.fromCodePoint(0x1D41A + n - 97)
    if (n >= 48 && n <= 57) return String.fromCodePoint(0x1D7CE + n - 48)
    return c
  }).join('')
}

function fontSmallCaps(str) {
  const map = {
    'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ',
    'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ',
    's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
  }
  return [...String(str).toLowerCase()].map(c => map[c] || c).join('')
}

function fontItalic(str) {
  return [...String(str)].map(c => {
    const n = c.codePointAt(0)
    if (n >= 65 && n <= 90) return String.fromCodePoint(0x1D608 + n - 65)
    if (n >= 97 && n <= 122) return String.fromCodePoint(0x1D622 + n - 97)
    return c
  }).join('')
}

function formatBytes(bytes = 0) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)}${units[i]}`
}

function runtime() {
  const sec = Math.floor(process.uptime())
  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return [d ? `${d}d` : '', h ? `${h}h` : '', m ? `${m}m` : '', `${s}s`].filter(Boolean).join(' ')
}

function ucapan() {
  const h = new Intl.DateTimeFormat('en-US', {
    timeZone: settings.timezone || 'Asia/Jakarta',
    hour: '2-digit',
    hourCycle: 'h23'
  }).format(new Date())
  const hour = Number(h)
  if (hour < 4) return 'Good Night'
  if (hour < 11) return 'Good Morning'
  if (hour < 15) return 'Good Afternoon'
  if (hour < 18) return 'Good Evening'
  return 'Good Night'
}

function progressBar(percent = 0) {
  const value = Math.max(0, Math.min(100, Number(percent) || 0))
  const full = Math.floor(value / 10)
  return '■'.repeat(full) + '□'.repeat(10 - full)
}

function xpRange(level, multiplier = 1) {
  const growth = Math.pow(Math.PI / Math.E, 1.618) * Math.E * 0.75
  level = Math.max(0, Math.floor(Number(level) || 0))
  const min = level === 0 ? 0 : Math.round(Math.pow(level, growth) * multiplier) + 1
  const max = Math.round(Math.pow(level + 1, growth) * multiplier)
  return { min, max, xp: max - min }
}

function commandCount() {
  let total = 0
  for (const plugin of pluginStore.values()) {
    const help = Array.isArray(plugin?.help) ? plugin.help : plugin?.help ? [plugin.help] : []
    total += help.length
  }
  return total
}

function cleanName(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim().replace(/^@+/, '')
  if (!text || /^\+?\d+$/.test(text)) return ''
  return Array.from(text).slice(0, 40).join('')
}

async function resolveName(m, conn) {
  try {
    if (typeof conn?.getName === 'function') {
      const value = cleanName(await conn.getName(m.sender))
      if (value) return value
    }
  } catch {}

  const pushName = cleanName(m?.pushName)
  if (pushName) return pushName

  const senderName = cleanName(String(m?.sender || '').split('@')[0]?.split(':')[0])
  return senderName || 'User'
}

async function getMenuUser(m, conn) {
  const user = await getUser(m.sender).catch(() => null)
  const rpgUser = getRpgUser(m.sender)
  const owner = await checkOwner(m.sender, conn).catch(() => false)
  const role = owner ? 'Owner' : String(rpgUser?.role || user?.role || 'Beginner')
  const status = owner ? 'Owner' : 'User'
  const limit = owner || user?.premium ? 'Unlimited' : String(Number(user?.limit ?? rpgUser?.limit) || 0)
  return { role, status, limit }
}

function nativeSingleSelect(displayText, sections) {
  return {
    name: 'single_select',
    buttonParamsJson: JSON.stringify({
      title: displayText,
      sections
    })
  }
}

function nativeQuickReply(displayText, id) {
  return {
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({
      display_text: displayText,
      id
    })
  }
}

function nativeCopy(displayText, copyCode) {
  return {
    name: 'cta_copy',
    buttonParamsJson: JSON.stringify({
      display_text: displayText,
      copy_code: String(copyCode)
    })
  }
}

function nativeUrl(displayText, url) {
  return {
    name: 'cta_url',
    buttonParamsJson: JSON.stringify({
      display_text: displayText,
      url,
      webview_interaction: true
    })
  }
}

function buildCategoryRows(usedPrefix) {
  return getAllCategories()
    .filter(category => getPluginsByCategory(category).length > 0)
    .sort((a, b) => String(a).localeCompare(String(b)))
    .map(category => {
      const total = getPluginsByCategory(category).length
      const name = formatCategoryName(category)
      return {
        header: BOT_NAME,
        title: `${name} · ${total} fitur`,
        description: `Kumpulan fitur ${name.toLowerCase()} · Folder plugin dinamis`,
        id: `${usedPrefix}kategori ${category}`
      }
    })
}

function buildNativeFlow(usedPrefix) {
  const categoryRows = buildCategoryRows(usedPrefix)
  const categorySections = []
  for (let index = 0; index < categoryRows.length; index += 8) {
    const page = Math.floor(index / 8) + 1
    const totalPages = Math.ceil(categoryRows.length / 8)
    categorySections.push({
      title: totalPages > 1 ? `Categories ${page}/${totalPages}` : `Categories (${categoryRows.length})`,
      rows: categoryRows.slice(index, index + 8),
    })
  }
  const categoryButton = nativeSingleSelect('Categories', categorySections)

  return [
    categoryButton,
    nativeQuickReply('All Features', `${usedPrefix}allmenu`),
    nativeCopy('Runtime Status', runtime()),
    nativeQuickReply('Owner Usanagi', `${usedPrefix}owner`),
    nativeUrl('Usanagi Group', GROUP_URL)
  ]
}

function buildMessageParams(buttonCount) {
  return {
    limited_time_offer: {
      text: 'Dashboard',
      url: GROUP_URL,
      copy_code: 'USANAGI-AI',
      expiration_time: Date.now() + OFFER_EXPIRE_MS
    },
    bottom_sheet: {
      in_thread_buttons_limit: 1,
      divider_indices: Array.from({ length: buttonCount }, (_, index) => index + 1).concat(999),
      list_title: BOT_NAME,
      button_title: 'Open Menu'
    }
  }
}

async function sendUsanagiStyle1(conn, m, { usedPrefix, caption, mention }) {
  const menuMedia = readMenuMedia(conn)
  const headerMedia = await prepareWAMessageMedia(
    menuMedia.type === 'image'
      ? { image: menuMedia.data, mimetype: menuMedia.mimetype }
      : { video: menuMedia.data, mimetype: menuMedia.mimetype },
    { upload: conn.waUploadToServer }
  )

  const buttons = buildNativeFlow(usedPrefix)
  const params = buildMessageParams(buttons.length)

  const generated = generateWAMessageFromContent(
    m.chat,
    {
      interactiveMessage: {
        header: {
          title: '',
          subtitle: '',
          hasMediaAttachment: true,
          ...headerMedia
        },
        body: {
          text: '\u200e'
        },
        footer: {
          text: caption
        },
        contextInfo: {
          mentionedJid: mention.jid ? [mention.jid] : [],
        },
        nativeFlowMessage: {
          messageParamsJson: JSON.stringify(params),
          buttons
        }
      }
    },
    {
      quoted: createReplyV1Quoted({ displayName: mention.name, jid: mention.jid || m.sender }),
      userJid: conn.user?.id || conn.user?.jid || m.sender
    }
  )

  await conn.relayMessage(m.chat, generated.message, {
    messageId: generated.key.id,
    additionalNodes: [
      {
        tag: 'biz',
        attrs: {},
        content: [
          {
            tag: 'interactive',
            attrs: { type: 'native_flow', v: '1' },
            content: [
              {
                tag: 'native_flow',
                attrs: { v: '9', name: 'mixed' }
              }
            ]
          }
        ]
      }
    ]
  })
}

export async function sendModernMenu(conn, m, usedPrefix) {
  const [user, mention] = await Promise.all([
    getMenuUser(m, conn),
    resolveMenuMention(m, conn)
  ])
const caption = [
    '┏┈┈┈┈┈┈┈┈┈┈┈┈╼',
    `┆ *Hᴀʟᴏ* ${mention.text}`,
    '┢╶╶╶╶╶╶╶╶╶╶╶╶╼',
    '┣╌ ⟪ *Yᴏᴜʀ Iɴғᴏ* ⟫',
    `┆➥ Nᴀᴍᴇ : ${mention.name}`,
    `┆➥ Sᴛᴀᴛᴜs : ${user.status}`,
    `┆➥ Lɪᴍɪᴛ : ${user.limit}`,
    '╰╶╶╶╶╶╶╶╶╶╶╶╶╳',
    '',
    '┏╶╶╶╶╶╶╶╶╶╶╶╶╼',
    '┆ Sɪʟᴀʜᴋᴀɴ Kʟɪᴋ Bᴜᴛᴛᴏɴ Dɪʙᴀᴡᴀʜ',
    '┆ Uɴᴛᴜᴋ Ceᴋ Fɪᴛᴜʀ Yᴀɴɢ Aᴅᴀ',
    '┗ ╶╶╶╶╶╶╶╶╶╶╶╶╼',
    '',
    '*By AlzRiss - Usanagi Umi AI*',
    '',
    '🌐 *JADIBOT BY AlzRiss*',
    '▸ https://website-jadibot-by-alzriss.vercel.app'
].join('\n')

  await sendUsanagiStyle1(conn, m, {
    usedPrefix,
    caption,
    mention
  })
}