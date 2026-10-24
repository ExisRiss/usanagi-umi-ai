/**
 * Owner: kelola cookie akun TeraBox untuk /terabox — tanpa restart.
 *
 *   /tbcookie                 → status
 *   /tbcookie set <cookie>    → simpan (disarankan lewat DM; cookie tidak ditampilkan)
 *   /tbcookie test <link>     → uji baca link + ambil link unduhan file pertama
 *   /tbcookie hapus           → hapus cookie
 */
import fs from 'node:fs'
import {
  teraboxStatus, persistTeraboxCookie, clearTeraboxCookie, teraboxEnvFile, maskCookie,
  resolveTeraBoxShare, teraboxDirectLink, TERABOX_NOT_CONFIGURED,
} from '../../lib/terabox.js'

const ADMIN_ROLES = new Set(['owner', 'developer', 'creator'])

function digits(value) {
  return String(value || '').split('@')[0].split(':')[0].replace(/\D/g, '')
}

function isOwnerNow(m) {
  const sender = digits(m.sender || m.chat)
  const owners = Array.isArray(global.owner) ? global.owner : []
  if (owners.some((entry) => String(Array.isArray(entry) ? entry[0] : entry).replace(/\D/g, '') === sender)) return true
  return ADMIN_ROLES.has(String(globalThis.__role || '').toLowerCase())
}

const helpText = (prefix) => [
  '╭─〔 🍪 COOKIE TERABOX 〕─╮',
  `│ ${prefix}tbcookie status`,
  `│ ${prefix}tbcookie set <cookie>`,
  `│ ${prefix}tbcookie test <link>`,
  `│ ${prefix}tbcookie hapus`,
  '╰────────────────────╯',
  '',
  'Cara ambil cookie: buka terabox.com → login → DevTools (F12) → Application →',
  'Cookies → https://www.terabox.com → salin nilai `ndus` (boleh hanya "ndus=…").',
  'Cookie disimpan di server dengan izin 600 dan tidak ditampilkan lagi.',
].join('\n')

let handler = async (m, { usedPrefix, text }) => {
  const prefix = usedPrefix || '/'
  if (!isOwnerNow(m)) return m.reply('❌ Fitur ini khusus owner bot.')

  const raw = String(text || '').trim()
  const parts = raw.split(/\s+/).filter(Boolean)
  let action = String(parts[0] || 'status').toLowerCase()

  // Dukung `/tbcookie ndus=xxxx` langsung.
  if (!['status', 'set', 'test', 'hapus', 'reset', 'del', 'help', 'bantuan'].includes(action)) action = 'set'

  if (['help', 'bantuan'].includes(action)) return m.reply(helpText(prefix))

  if (action === 'status') {
    const status = teraboxStatus()
    const state = globalThis.umiTerabox?.stats || {}
    return m.reply([
      '╭─〔 🍪 STATUS TERABOX 〕─╮',
      `│ Cookie      : ${status.configured ? '✅ terpasang' : '❌ belum ada'}`,
      `│ Isi ndus    : ${status.accountCookie ? '✅ ada' : (status.configured ? '⚠️ tidak terlihat' : '—')}`,
      `│ Panjang     : ${status.cookieLength || 0} karakter`,
      `│ Berkas      : ${teraboxEnvFile().split('/').pop()}`,
      `│ Mirror      : ${status.mirrors}`,
      state.lastError ? `│ Error akhir : ${String(state.lastError).slice(0, 80)}` : '',
      '╰──────────────────────╯',
      '',
      status.configured
        ? 'Cookie siap dipakai /terabox.'
        : `Cookie belum ada, jadi /terabox hanya bisa membaca daftar file. Pasang: ${prefix}tbcookie set <cookie>`,
    ].filter(Boolean).join('\n'))
  }

  if (action === 'set') {
    const inGroup = Boolean(m.isGroup) || /@g\.us$/.test(String(m.chat || ''))
    if (inGroup) {
      return m.reply(['⚠️ Jangan kirim cookie di grup.', 'Hapus pesan itu, lalu kirim lewat chat pribadi ke bot.'].join('\n'))
    }
    let value = parts.slice(1).join(' ')
    if (!value) return m.reply(`Format: ${prefix}tbcookie set ndus=...`)
    // Kalau yang dikirim hanya nilai ndus, lengkapi jadi pasangan cookie.
    if (!value.includes('=')) return m.reply('❌ Cookie harus berbentuk `nama=nilai` (contoh: ndus=abc123).')
    if (!/(?:^|;\s*)ndus=/.test(value)) value = `ndus=${value.replace(/^ndus=/, '')}`

    try {
      persistTeraboxCookie(value)
    } catch (error) {
      return m.reply(`❌ Gagal menyimpan cookie: ${String(error?.message || error)}`)
    }
    try { await m.delete?.() } catch { }
    return m.reply([
      '✅ Cookie TeraBox tersimpan.',
      `│ Cookie : ${maskCookie(value)}`,
      `│ Berkas : ${teraboxEnvFile().split('/').pop()}`,
      '',
      `Uji sekarang: ${prefix}tbcookie test <link terabox>`,
    ].join('\n'))
  }

  if (action === 'test') {
    const link = parts.slice(1).join(' ').trim()
    if (!link) return m.reply(`Format: ${prefix}tbcookie test <link terabox>`)
    if (!teraboxStatus().configured) return m.reply('❌ Cookie belum ada. Pasang dulu: ' + prefix + 'tbcookie set ndus=...')
    try {
      const share = await resolveTeraBoxShare(link, { timeoutMs: 15000 })
      const first = share.files[0]
      if (!first) return m.reply(`⚠️ Link terbaca (${share.title}) tetapi tidak ada file di dalamnya.`)
      const direct = await teraboxDirectLink(share, first)
      return m.reply([
        '✅ Cookie TeraBox berfungsi.',
        `│ Judul : ${share.title}`,
        `│ File  : ${first.name}`,
        `│ Link  : ${String(direct).slice(0, 80)}…`,
      ].join('\n'))
    } catch (error) {
      if (error?.code === TERABOX_NOT_CONFIGURED) {
        return m.reply(['❌ Cookie tidak berlaku.', String(error?.message || error).slice(0, 200), 'Perbarui dengan ' + prefix + 'tbcookie set <cookie>'].join('\n'))
      }
      return m.reply(`❌ Uji gagal: ${String(error?.message || error).slice(0, 250)}`)
    }
  }

  if (['hapus', 'reset', 'del'].includes(action)) {
    clearTeraboxCookie()
    return m.reply('🗑️ Cookie TeraBox dihapus. /terabox kembali hanya bisa membaca daftar file.')
  }

  return m.reply(helpText(prefix))
}

handler.help = ['tbcookie status|set <cookie>|test <link>|hapus']
handler.tags = ['owner']
handler.command = /^(tbcookie|teraboxcookie|setterabox)$/i
handler.owner = true

export default handler
