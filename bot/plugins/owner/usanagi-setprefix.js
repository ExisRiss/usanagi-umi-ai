/*
 *
 * Setelan prefix.
 *
 *   {prefix}setprefix                → lihat prefix aktif
 *   {prefix}setprefix <p>            → prefix untuk chat ini (owner / admin grup / chat pribadi)
 *   {prefix}setprefix default        → kembalikan chat ini ke prefix default bot
 *   {prefix}setprefix global <p>     → [owner] default semua chat bot ini
 *                                      (di bot utama tersimpan di data/prefix-settings.json;
 *                                       di jadibot tersimpan di config sesi jadibot itu sendiri)
 *
 * Semua menu dan pesan perintah otomatis memakai prefix ini.
 */
import { setPrefix, resetPrefix, syncMainPrefix } from '../../core/awang-prefix.js'
import { readMainBotState, writeMainBotState } from '../../lib/main-bot-config.js'
import { saveDefaultPrefix, isValidPrefix } from '../../core/awang-prefix-text.js'
import { saveJadibotConfig } from '../../lib/bot-config.js'
import { clearPrefixRewriteCache } from '../../lib/prefix-rewrite.js'

const HELP = (p) => [
  `Prefix aktif saat ini: *${p}*`,
  '',
  'Cara pakai:',
  `${p}setprefix <prefix_baru>      → untuk chat ini`,
  `${p}setprefix default            → kembali ke prefix default`,
  `${p}setprefix global <prefix>    → [owner] default semua chat bot ini`,
].join('\n')

const handler = async (m, { conn, usedPrefix, botConfig, prefixStorageKey, isOwner, isAdmin, isROwner }) => {
  const text = String(m.text || '').trim()
  const parts = text.split(/\s+/).filter(Boolean)
  const storageKey = prefixStorageKey || m.prefixStorageKey || m.chat
  const defaultPrefix = botConfig?.defaultPrefix || global.mainBot?.defaultPrefix || '.'
  const owner = Boolean(isOwner || isROwner)
  const isGlobal = String(parts[1] || '').toLowerCase() === 'global'
  const value = isGlobal ? parts[2] : parts[1]

  if (!value) return conn.sendMessage(m.chat, { text: HELP(usedPrefix) }, { quoted: m.raw })

  if (isGlobal) {
    if (!owner) {
      return conn.sendMessage(m.chat, { text: 'Hanya owner yang boleh mengubah prefix default semua chat.' }, { quoted: m.raw })
    }
    if (!isValidPrefix(value)) {
      return conn.sendMessage(m.chat, { text: 'Prefix harus 1–3 karakter tanpa spasi.' }, { quoted: m.raw })
    }

    if (botConfig?.type === 'jadibot' && botConfig.file) {
      // Jadibot menyimpan default prefix di config sesinya sendiri.
      botConfig.defaultPrefix = value
      saveJadibotConfig(botConfig)
    } else {
      saveDefaultPrefix(value)
      if (!global.mainBot) global.mainBot = {}
      global.mainBot.defaultPrefix = value
      syncMainPrefix(value, `manual-${Date.now()}`)
      try {
        const state = readMainBotState()
        writeMainBotState({ ...state, enabled: state.enabled })
      } catch {}
    }
    clearPrefixRewriteCache()
    return conn.sendMessage(
      m.chat,
      { text: `Prefix default bot ini diubah menjadi: *${value}*\n\nContoh: ${value}menu\nSemua chat tanpa prefix khusus otomatis mengikuti.` },
      { quoted: m.raw }
    )
  }

  // Perubahan untuk satu chat: owner, admin grup, atau chat pribadi.
  const privateChat = String(m.chat || '').endsWith('@s.whatsapp.net')
  if (!owner && !isAdmin && !privateChat) {
    return conn.sendMessage(m.chat, { text: 'Hanya owner atau admin grup yang bisa mengubah prefix di grup ini.' }, { quoted: m.raw })
  }

  if (value.toLowerCase() === 'default') {
    clearPrefixRewriteCache()
    const reverted = await resetPrefix(storageKey, defaultPrefix)
    return conn.sendMessage(m.chat, { text: `Prefix chat ini dikembalikan ke default: *${reverted}*` }, { quoted: m.raw })
  }

  if (!isValidPrefix(value)) {
    return conn.sendMessage(m.chat, { text: 'Prefix harus 1–3 karakter tanpa spasi.' }, { quoted: m.raw })
  }

  await setPrefix(storageKey, value)
  clearPrefixRewriteCache()
  return conn.sendMessage(
    m.chat,
    { text: `Prefix chat ini diubah menjadi: *${value}*\n\nContoh: ${value}menu\nMenu & contoh perintah otomatis ikut memakai prefix ini.` },
    { quoted: m.raw }
  )
}

handler.command = /^setprefix$/i
handler.help = ['setprefix [global|default] <prefix>']
handler.tags = ['owner']
handler.description = 'Mengubah prefix bot (per chat atau default semua chat)'
handler.owner = false

export default handler
