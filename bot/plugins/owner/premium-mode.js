/* By AlzRiss - Usanagi Umi AI */
/**
 * .premium — atur mode premium bot.
 *
 * Owner/developer bot:
 *   .premium on|off              saklar premium untuk bot ini
 *   .premium add <fitur>         masukkan fitur yang mau dijadikan premium
 *   .premium del <fitur>         keluarkan fitur dari daftar
 *   .premium set <fitur,fitur>   ganti seluruh daftar
 *   .premium reset               kosongkan daftar
 *   .premium global on|off       saklar seluruh platform (khusus owner utama)
 *
 * Semua pengguna boleh melihat status, daftar, dan mencari fitur.
 */
import { saveJadibotConfig, getCurrentBotConfig } from '../../lib/bot-config.js'
import {
  applyPremiumPatch,
  featureLabel,
  getPremiumSystem,
  normalizePremiumEntries,
  premiumConfigFor,
  resolvePremiumEntry,
  saveMainPremiumConfig,
  searchFeatures,
  setPremiumSystem,
} from '../../lib/premium-mode.js'

const MAX_SHOW = 40

function splitEntries(text) {
  return normalizePremiumEntries(String(text || '').split(/[\s,]+/).filter(Boolean))
}

function profileOf(conn) {
  return conn?.botConfig || getCurrentBotConfig()
}

function saveProfile(profile, patch) {
  if (profile?.type === 'jadibot') return applyPremiumPatch(profile, patch, saveJadibotConfig)
  return saveMainPremiumConfig(patch)
}

function statusText(profile, prefix) {
  const system = getPremiumSystem()
  const config = premiumConfigFor(profile)
  const list = config.plugins
  const shown = list.slice(0, MAX_SHOW)
  const lines = [
    '💎 *MODE PREMIUM*',
    '',
    `Saklar platform: *${system.enabled ? 'ON' : 'OFF'}*${system.enabled ? '' : ' — semua fitur gratis di semua bot'}`,
    `Saklar bot ini: *${config.enabled ? 'ON' : 'OFF'}*${config.enabled ? '' : ' — semua fitur gratis di bot ini'}`,
    `Fitur premium: *${list.length}*`,
  ]
  if (shown.length) {
    lines.push('', ...shown.map((entry, index) => `${index + 1}. ${entry}`))
    if (list.length > shown.length) lines.push(`… dan ${list.length - shown.length} fitur lain`)
  } else if (system.enabled && config.enabled) {
    lines.push('', '_Belum ada fitur premium. Masukkan fitur yang mau dijadikan premium._')
  }
  lines.push(
    '',
    '*Perintah owner bot:*',
    `${prefix}premium on | off`,
    `${prefix}premium add <fitur>`,
    `${prefix}premium del <fitur>`,
    `${prefix}premium set <fitur,fitur>`,
    `${prefix}premium reset`,
    `${prefix}premium cari <kata>`,
  )
  if (!system.enabled) lines.push('', '_Mode premium dimatikan owner platform. Semua fitur gratis._')
  return lines.join('\n')
}

let handler = async (m, { conn, args, usedPrefix, command, isOwner, isROwner }) => {
  const profile = profileOf(conn)
  const action = String(args[0] || '').toLowerCase()
  const rest = args.slice(1).join(' ').trim()
  const prefix = usedPrefix || '.'

  if (!action || action === 'status' || action === 'info') {
    return m.reply(statusText(profile, prefix))
  }

  if (action === 'list' || action === 'daftar') {
    const config = premiumConfigFor(profile)
    if (!config.plugins.length) {
      return m.reply(`Belum ada fitur premium di bot ini.\n\nOwner bot bisa menambah: *${prefix}premium add sticker*`)
    }
    return m.reply([
      '💎 *DAFTAR FITUR PREMIUM*',
      '',
      ...config.plugins.slice(0, MAX_SHOW).map((entry, index) => `${index + 1}. ${entry}`),
      config.plugins.length > MAX_SHOW ? `… dan ${config.plugins.length - MAX_SHOW} fitur lain` : '',
      '',
      `Status: ${config.enabled ? 'ON' : 'OFF (semua gratis)'}`,
    ].filter(Boolean).join('\n'))
  }

  if (action === 'cari' || action === 'search' || action === 'fitur') {
    const query = rest || String(args[1] || '').trim()
    if (!query) return m.reply(`Contoh: *${prefix}premium cari sticker*`)
    const results = searchFeatures(query, 10)
    if (!results.length) return m.reply(`Tidak ada fitur yang cocok dengan *${query}*.`)
    return m.reply([
      `🔎 *HASIL PENCARIAN: ${query}*`,
      '',
      ...results.map((feature, index) => `${index + 1}. ${featureLabel(feature)}${feature.premium ? ' 💎' : ''}`),
      '',
      `Tambah ke premium: *${prefix}premium add ${results[0].commands[0] || results[0].basename.replace('.js', '')}*`,
    ].join('\n'))
  }

  if (action === 'global') {
    if (!isROwner) return m.reply('🚫 Saklar platform hanya untuk owner utama / developer bot.')
    const value = String(args[1] || '').toLowerCase()
    if (!['on', 'off'].includes(value)) return m.reply(`Contoh: *${prefix}premium global on*`)
    const state = setPremiumSystem(value === 'on', m.sender || 'owner')
    return m.reply(`✅ Mode premium platform: *${state.enabled ? 'ON' : 'OFF'}*${state.enabled ? '' : '\nSemua fitur premium di semua bot kini gratis.'}`)
  }

  const needOwner = () => m.reply(
    '🚫 Pengaturan premium hanya untuk owner/developer bot.\n' +
    `Kamu bisa melihat daftarnya dengan *${prefix}premium list*.`,
  )

  if (action === 'on' || action === 'off') {
    if (!isOwner) return needOwner()
    const enabled = action === 'on'
    const config = saveProfile(profile, { enabled })
    if (!enabled) {
      return m.reply('✅ Mode premium *OFF*. Semua fitur di bot ini gratis untuk semua pengguna.')
    }
    const system = getPremiumSystem()
    if (!system.enabled) {
      return m.reply(
        '⚠️ Mode premium bot ON, tetapi saklar platform sedang *OFF* (diatur owner utama).\n' +
        'Semua fitur tetap gratis sampai saklar platform dinyalakan.',
      )
    }
    if (!config.plugins.length) {
      return m.reply([
        '✅ Mode premium *ON*.',
        '',
        'Sekarang masukkan fitur bot yang mau dijadikan premium, contoh:',
        `${prefix}premium add sticker, brat, toimg`,
        '',
        `Cari nama fitur dulu: ${prefix}premium cari sticker`,
        'Atau lewat website → Settings → Mode Premium.',
      ].join('\n'))
    }
    return m.reply(`✅ Mode premium *ON* dengan ${config.plugins.length} fitur premium.\n\nLihat daftar: ${prefix}premium list`)
  }

  if (action === 'add' || action === 'tambah' || action === 'del' || action === 'remove' || action === 'hapus') {
    if (!isOwner) return needOwner()
    const entries = splitEntries(rest || String(args[1] || ''))
    if (!entries.length) return m.reply(`Contoh: *${prefix}premium ${action} sticker*`)
    const config = premiumConfigFor(profile)
    const isAdd = ['add', 'tambah'].includes(action)
    if (isAdd) {
      const valid = []
      const invalid = []
      for (const entry of entries) {
        const resolved = resolvePremiumEntry(entry)
        if (resolved.ok) valid.push(resolved.entry)
        else invalid.push(resolved)
      }
      if (invalid.length) {
        const details = invalid.map(item => {
          const hints = (item.suggestions || []).slice(0, 3).map(feature => `• ${featureLabel(feature)}`).join('\n')
          return `❌ *${item.entry}* tidak ditemukan.${hints ? `\nMungkin maksud kamu:\n${hints}` : ''}`
        }).join('\n\n')
        return m.reply(`${details}\n\nCari fitur: *${prefix}premium cari <kata>*`)
      }
      const next = [...config.plugins]
      for (const entry of valid) if (!next.includes(entry)) next.push(entry)
      if (next.length === config.plugins.length) return m.reply('Fitur itu sudah ada di daftar premium.')
      const saved = saveProfile(profile, { plugins: next })
      return m.reply([
        `✅ ${valid.map(entry => `*${entry}*`).join(', ')} masuk daftar premium.`,
        `Total: ${saved.plugins.length} fitur.`,
        config.enabled ? '' : `\n⚠️ Mode premium bot masih OFF. Nyalakan dengan *${prefix}premium on*.`,
      ].filter(Boolean).join('\n'))
    }
    const next = config.plugins.filter(entry => !entries.includes(entry))
    if (next.length === config.plugins.length) return m.reply('Fitur itu tidak ada di daftar premium.')
    const saved = saveProfile(profile, { plugins: next })
    return m.reply(`✅ Dihapus dari premium. Sisa ${saved.plugins.length} fitur.\n\nLihat: ${prefix}premium list`)
  }

  if (action === 'set' || action === 'ganti') {
    if (!isOwner) return needOwner()
    const entries = splitEntries(rest)
    if (!entries.length) return m.reply(`Contoh: *${prefix}premium set sticker, brat, toimg*`)
    const invalid = entries.map(resolvePremiumEntry).filter(item => !item.ok)
    if (invalid.length) {
      return m.reply(`❌ Tidak ditemukan: ${invalid.map(item => `*${item.entry}*`).join(', ')}\n\nCari fitur: *${prefix}premium cari <kata>*`)
    }
    const saved = saveProfile(profile, { plugins: entries })
    return m.reply(`✅ Daftar premium diganti. Total ${saved.plugins.length} fitur.`)
  }

  if (action === 'reset' || action === 'clear' || action === 'kosongkan') {
    if (!isOwner) return needOwner()
    const saved = saveProfile(profile, { plugins: [] })
    return m.reply(`✅ Daftar fitur premium dikosongkan. Mode premium bot: *${saved.enabled ? 'ON' : 'OFF'}*`)
  }

  return m.reply(statusText(profile, prefix))
}

handler.help = ['premium', 'premium on|off', 'premium add <fitur>', 'premium list', 'premium cari <kata>']
handler.tags = ['owner']
handler.command = /^(premium|premfitur|fiturpremium)$/i
handler.description = 'Atur mode premium bot: ON/OFF, daftar fitur premium, cari fitur.'

export default handler
