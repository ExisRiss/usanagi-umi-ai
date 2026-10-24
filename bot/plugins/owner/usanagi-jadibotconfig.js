
import fs from 'node:fs'
import path from 'node:path'
import {
  loadJadibotConfig,
  saveJadibotConfig,
  resetJadibotConfig,
  normalizeBotNumber,
} from '../../lib/bot-config.js'
import { setPrefix } from '../../core/awang-prefix.js'

const SESSIONS_DIR = path.join('sessions', 'jadibot')

const boolValue = value => {
  const text = String(value || '').toLowerCase()
  if (['on', 'true', '1', 'aktif', 'public', 'yes'].includes(text)) return true
  if (['off', 'false', '0', 'mati', 'private', 'no'].includes(text)) return false
  return null
}

function knownNumbers() {
  const output = new Set([...(global.jadibotConns?.keys?.() || [])].map(normalizeBotNumber))
  try {
    for (const entry of fs.readdirSync(SESSIONS_DIR, { withFileTypes: true })) {
      if (entry.isDirectory() && /^\d+$/.test(entry.name)) output.add(normalizeBotNumber(entry.name))
    }
  } catch {}
  return [...output].filter(Boolean).sort()
}

function resolveProfile(number) {
  const normalized = normalizeBotNumber(number)
  if (!normalized) return null
  const active = global.jadibotConns?.get(normalized)
  if (active?.botConfig?.type === 'jadibot') return active.botConfig
  const sessionPath = path.join(SESSIONS_DIR, normalized)
  if (!fs.existsSync(sessionPath)) return null
  return loadJadibotConfig(normalized, sessionPath)
}

function summary(profile, prefix = '.', fromMain = false) {
  const values = profile.values || {}
  const typing = values.autoTyping || {}
  const tiktok = values.tiktokRich || {}
  const base = fromMain ? `${prefix}jbconfig ${profile.number}` : `${prefix}jbconfig`
  return [
    '*KONFIGURASI JADIBOT*',
    '',
    `Nomor: ${profile.number}`,
    `Status: ${global.jadibotConns?.has(profile.number) ? 'aktif' : 'tersimpan/offline'}`,
    `Nama: ${values.namebot}`,
    `Prefix default: ${profile.defaultPrefix}`,
    `Limit awal: ${profile.defaultLimit === -1 ? 'Unlimited (-1)' : profile.defaultLimit}`,
    `Limit ON/OFF: ${profile.limitEnabled === false ? 'OFF (semua perintah berlimit gratis)' : 'ON'}`,
    `Mode: ${profile.public ? 'public' : 'self'}`,
    `Auto-typing: ${typing.enabled !== false ? 'on' : 'off'}`,
    `Musik TikTok: ${tiktok.sendMusic !== false ? 'on' : 'off'}`,
    `Maks. foto TikTok: ${tiktok.maxPhotos || 8}`,
    `Plugin/command nonaktif: ${(profile.disabledPlugins || []).join(', ') || '-'}`,
    '',
    '*Pengaturan:*',
    `${base} name <nama>`,
    `${base} prefix <1-3 karakter>`,
    `${base} limit <-1 atau 0-100000>  (-1 = unlimited)`,
    `${base} limits on|off`,
    `${base} mode public|private`,
    `${base} typing on|off`,
    `${base} music on|off`,
    `${base} maxphotos <1-20>`,
    `${base} disable command:<nama>`,
    `${base} enable command:<nama>`,
    `${base} channel <url>`,
    `${base} group <url>`,
    `${base} website <url>`,
    `${base} reset`,
    '',
    global.brandCredit || 'By AlzRiss - Usanagi Umi AI',
  ].join('\n')
}

function sessionList(numbers, prefix) {
  return [
    '*DAFTAR SESI JADIBOT*',
    '',
    ...numbers.map((number, index) => `${index + 1}. ${number} — ${global.jadibotConns?.has(number) ? 'aktif' : 'offline'}`),
    '',
    `Lihat konfigurasi: ${prefix}jbconfig <nomor>`,
    `Contoh: ${prefix}jbconfig ${numbers[0] || '628xxxxxxxxxx'} name Umi Kedua`,
    '',
    global.brandCredit || 'By AlzRiss - Usanagi Umi AI',
  ].join('\n')
}

const handler = async (m, { conn, args, usedPrefix, prefixStorageKey }) => {
  let profile
  let commandArgs = [...args]
  let fromMain = !conn.isJadibot

  if (conn.isJadibot && conn.botConfig?.type === 'jadibot') {
    profile = conn.botConfig
  } else {
    const numbers = knownNumbers()
    const requestedNumber = /^\+?\d[\d\s-]+$/.test(String(commandArgs[0] || ''))
      ? normalizeBotNumber(commandArgs.shift())
      : ''

    if (requestedNumber) {
      profile = resolveProfile(requestedNumber)
      if (!profile) return m.reply(`Sesi Jadibot ${requestedNumber} tidak ditemukan.`)
    } else if (numbers.length === 1) {
      profile = resolveProfile(numbers[0])
    } else if (!numbers.length) {
      return m.reply('Belum ada sesi Jadibot. Buat terlebih dahulu dengan perintah /jadibot <nomor>.')
    } else {
      return m.reply(sessionList(numbers, usedPrefix))
    }
  }

  if (!profile) return m.reply('Konfigurasi sesi Jadibot tidak ditemukan.')

  const action = String(commandArgs[0] || 'show').toLowerCase()
  const value = commandArgs.slice(1).join(' ').trim()
  const values = profile.values

  if (['show', 'view', 'info'].includes(action)) return m.reply(summary(profile, usedPrefix, fromMain))

  if (action === 'reset') {
    resetJadibotConfig(profile)
    return m.reply(`Konfigurasi Jadibot dikembalikan ke default aman.\n\n${summary(profile, usedPrefix, fromMain)}`)
  }

  if (action === 'name') {
    if (!value) return m.reply('Masukkan nama Jadibot.')
    values.namebot = value.slice(0, 80)
    values.stickpack = values.namebot
    values.ownerInfo = { ...(values.ownerInfo || {}), subtitle: `Jadibot of ${values.namebot}` }
  } else if (action === 'prefix') {
    if (!value || value.length > 3 || /\s/.test(value)) return m.reply('Prefix harus 1-3 karakter tanpa spasi.')
    profile.defaultPrefix = value
    const key = conn.isJadibot
      ? (prefixStorageKey || m.prefixStorageKey || `${profile.scope}:${m.chat}`)
      : `${profile.scope}:${m.chat}`
    await setPrefix(key, value)
  } else if (action === 'limit') {
    const number = Number(value)
    if (!Number.isInteger(number) || number < -1 || number > 100000) return m.reply('Limit harus -1 (unlimited) atau angka 0-100000.')
    profile.defaultLimit = number
  } else if (action === 'limits') {
    const enabled = boolValue(value)
    if (enabled === null) return m.reply('Gunakan limits on atau limits off.')
    profile.limitEnabled = enabled
  } else if (action === 'mode') {
    const enabled = boolValue(value)
    if (enabled === null) return m.reply('Gunakan mode public atau private.')
    profile.public = enabled
  } else if (action === 'typing') {
    const enabled = boolValue(value)
    if (enabled === null) return m.reply('Gunakan typing on atau off.')
    values.autoTyping = { ...(values.autoTyping || {}), enabled }
  } else if (action === 'music') {
    const enabled = boolValue(value)
    if (enabled === null) return m.reply('Gunakan music on atau off.')
    values.tiktokRich = { ...(values.tiktokRich || {}), sendMusic: enabled }
  } else if (action === 'maxphotos') {
    const number = Number(value)
    if (!Number.isInteger(number) || number < 1 || number > 20) return m.reply('Jumlah foto harus 1-20.')
    values.tiktokRich = { ...(values.tiktokRich || {}), maxPhotos: number }
  } else if (action === 'disable') {
    if (!value) return m.reply('Masukkan aturan, contoh: command:play atau plugin:maker/brat2.js')
    profile.disabledPlugins = [...new Set([...(profile.disabledPlugins || []), value])]
  } else if (action === 'enable') {
    if (!value) return m.reply('Masukkan aturan yang akan diaktifkan kembali.')
    profile.disabledPlugins = (profile.disabledPlugins || []).filter(item => item.toLowerCase() !== value.toLowerCase())
  } else if (['channel', 'group', 'website'].includes(action)) {
    try { new URL(value) } catch { return m.reply('Masukkan URL http/https yang valid.') }
    const key = action === 'channel' ? 'channelUrl' : action === 'group' ? 'groupUrl' : 'websiteUrl'
    values.links = { ...(values.links || {}), [key]: value }
    values.scriptUrl = values.links.websiteUrl
    values.backupGroupLink = values.links.groupUrl
  } else {
    return m.reply(summary(profile, usedPrefix, fromMain))
  }

  saveJadibotConfig(profile)
  await m.reply(`✅ Konfigurasi Jadibot ${profile.number} berhasil diperbarui.\n\n${summary(profile, usedPrefix, fromMain)}`)
}

handler.help = ['jadibotconfig [nomor]', 'jbconfig [nomor]']
handler.tags = ['owner']
handler.command = /^(jadibotconfig|jbconfig)$/i
handler.ownerOnly = true
// Platform: jangan sampai owner satu sesi mengubah sesi milik user lain.
handler.platformOnly = true
handler.description = 'Mengatur konfigurasi per sesi Jadibot dari bot utama atau akun Jadibot'

export default handler
