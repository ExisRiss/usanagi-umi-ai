/**
 * Owner: kelola API key Gemini untuk Auto-AI — tanpa perlu restart bot.
 *
 *   /aikey                 → status singkat
 *   /aikey status          → status penyedia (Gemini / Groq)
 *   /aikey set <API_KEY>   → simpan kunci (disarankan lewat chat pribadi)
 *   /aikey test            → panggil Gemini sungguhan, laporkan model & latensi
 *   /aikey hapus           → hapus kunci Gemini (Auto-AI kembali ke Groq)
 *
 * Kunci tidak pernah ditampilkan ulang, tidak masuk log, dan disimpan di
 * berkas mode 600 lewat `lib/gemini-client.js`.
 */
import fs from 'fs'
import {
  geminiStatus, persistGeminiRuntimeConfig, geminiEnvFile, chatGemini, getGeminiSettings,
} from '../../lib/gemini-client.js'
import { aiProviderState } from '../../lib/auto-ai.js'

const ADMIN_ROLES = new Set(['owner', 'developer', 'creator'])

function digits(value) {
  return String(value || '').split('@')[0].split(':')[0].replace(/\D/g, '')
}

function isOwnerNow(m) {
  const sender = digits(m.sender || m.chat)
  const owners = Array.isArray(global.owner) ? global.owner : []
  const found = owners.some((entry) => {
    const number = Array.isArray(entry) ? entry[0] : entry
    return String(number).replace(/\D/g, '') === sender
  })
  if (found) return true
  const role = String(globalThis.__role || '').toLowerCase()
  return ADMIN_ROLES.has(role)
}

const maskKey = (key) => {
  const value = String(key || '')
  if (value.length < 12) return '(tidak ada)'
  return `${value.slice(0, 6)}…${value.slice(-4)}`
}

function providerLine() {
  const state = aiProviderState()
  const gem = state.gemini || {}
  const groq = state.groq || {}
  return [
    '╭─〔 🤖 STATUS AUTO-AI 〕─╮',
    `│ Penyedia aktif : ${state.provider ? state.provider.toUpperCase() : '— belum ada'}`,
    `│ Gemini         : ${gem.ready ? `✅ siap (${gem.model || 'gemini-3.5-flash'})` : '❌ belum ada kunci'}`,
    `│ Groq           : ${groq.ready ? '✅ siap (cadangan)' : '❌ belum ada kunci'}`,
    `│ Auto-AI        : ${state.enabled ? 'AKTIF' : 'NONAKTIF'}`,
    '╰────────────────────────╯',
    '',
    state.provider === 'gemini'
      ? 'Auto-AI memakai Gemini lebih dulu; Groq hanya dipakai bila Gemini gagal.'
      : (groq.ready
        ? 'Gemini belum terpasang, jadi Auto-AI memakai Groq. Kirim kunci dengan: /aikey set <API_KEY>'
        : 'Belum ada penyedia. Kirim kunci dengan: /aikey set <API_KEY>'),
  ].join('\n')
}

function helpText(prefix) {
  const p = prefix || '/'
  return [
    '╭─〔 🔑 KUNCI GEMINI 〕─╮',
    `│ ${p}aikey status — cek penyedia`,
    `│ ${p}aikey set <API_KEY> — simpan kunci`,
    `│ ${p}aikey test — uji kunci`,
    `│ ${p}aikey hapus — hapus kunci`,
    '╰──────────────────╯',
    '',
    'Ambil kunci di https://aistudio.google.com/apikey (diawali "AIza" atau "AQ.").',
    'Kunci disimpan di server dengan izin 600 dan tidak ditampilkan lagi.',
  ].join('\n')
}

let handler = async (m, { conn, usedPrefix, command, text }) => {
  const prefix = usedPrefix || '/'
  if (!isOwnerNow(m)) return m.reply('❌ Fitur ini khusus owner bot.')

  const parts = String(text || '').trim().split(/\s+/).filter(Boolean)
  let action = String(parts[0] || '').toLowerCase()
  let value = parts.slice(1).join(' ').trim()

  // Dukung `/aikey <API_KEY>` langsung.
  const looksLikeKey = (text0) => /^(AIza[0-9A-Za-z_-]{20,}|[A-Za-z0-9._-]{30,})$/.test(String(text0 || ''))
  if (action && !['status', 'set', 'test', 'hapus', 'reset', 'del', 'help', 'bantuan'].includes(action)) {
    if (looksLikeKey(parts[0])) {
      value = String(parts[0])
      action = 'set'
    }
  }
  if (!action) action = 'status'

  if (['help', 'bantuan'].includes(action)) return m.reply(helpText(prefix))

  if (action === 'status') return m.reply(providerLine())

  if (action === 'set') {
    if (!value) return m.reply(`Format: ${prefix}aikey set <API_KEY>`)

    const inGroup = Boolean(m.isGroup) || /@g\.us$/.test(String(m.chat || ''))
    if (inGroup) {
      return m.reply([
        '⚠️ Jangan kirim kunci di grup.',
        'Hapus pesan itu, lalu kirim lewat chat pribadi ke bot:',
        `${prefix}aikey set <API_KEY>`,
      ].join('\n'))
    }
    if (!looksLikeKey(value)) {
      return m.reply([
        '❌ Format kunci tidak dikenali.',
        'Kunci Gemini API diawali "AIza" atau "AQ." dan panjangnya 35–60 karakter.',
        'Salin ulang dari https://aistudio.google.com/apikey',
      ].join('\n'))
    }

    try {
      persistGeminiRuntimeConfig({ apiKey: value })
    } catch (error) {
      return m.reply(`❌ Gagal menyimpan kunci: ${String(error?.message || error)}`)
    }

    // Hapus pesan berisi kunci bila memungkinkan (bot harus admin di grup;
    // di chat pribadi biasanya berhasil).
    try {
      if (typeof conn?.sendMessage === 'function') await conn.sendMessage(m.chat, { delete: m.key })
    } catch { }

    return m.reply([
      '✅ Kunci Gemini tersimpan.',
      `│ File   : ${geminiEnvFile().split('/').pop()}`,
      `│ Kunci  : ${maskKey(value)} (disamarkan)`,
      `│ Model  : ${getGeminiSettings().model || 'gemini-3.5-flash'}`,
      '',
      `Uji sekarang: ${prefix}aikey test`,
    ].join('\n'))
  }

  if (action === 'test') {
    const state = aiProviderState()
    if (!state.gemini?.ready) return m.reply('❌ Belum ada kunci Gemini. Kirim: ' + prefix + 'aikey set <API_KEY>')
    const started = Date.now()
    try {
      const result = await chatGemini([
        { role: 'system', content: 'Jawab satu kalimat pendek dalam bahasa Indonesia.' },
        { role: 'user', content: 'Perkenalkan dirimu sebagai Umi dalam satu kalimat.' },
      ], { maxTokens: 120, temperature: 0.6, timeoutMs: 20000 })
      const ms = Date.now() - started
      const usage = result.usage || {}
      return m.reply([
        '✅ Gemini menjawab (panggilan API sungguhan).',
        `│ Model    : ${result.model}`,
        `│ Latensi  : ${ms} ms`,
        `│ Token    : ${usage.total_tokens || 0}`,
        '',
        `💬 ${String(result.content || '').slice(0, 400)}`,
      ].join('\n'))
    } catch (error) {
      return m.reply([
        '❌ Gemini gagal dipanggil.',
        `│ Pesan : ${String(error?.message || error).slice(0, 300)}`,
        '',
        `Cek kunci di https://aistudio.google.com/apikey lalu simpan ulang: ${prefix}aikey set <API_KEY>`,
      ].join('\n'))
    }
  }

  if (['hapus', 'reset', 'del'].includes(action)) {
    const file = geminiEnvFile()
    try {
      if (fs.existsSync(file)) fs.unlinkSync(file)
    } catch (error) {
      return m.reply(`❌ Gagal menghapus: ${String(error?.message || error)}`)
    }
    const state = aiProviderState()
    return m.reply([
      '🗑️ Kunci Gemini dihapus dari server.',
      state.groq?.ready ? 'Auto-AI otomatis memakai Groq sebagai penyedia.' : 'Auto-AI sekarang nonaktif sampai kunci dipasang lagi.',
    ].join('\n'))
  }

  return m.reply(helpText(prefix))
}

handler.help = ['aikey status|set <kunci>|test|hapus']
handler.tags = ['owner']
handler.command = /^(aikey|setgemini|geminikey)$/i
handler.owner = true

export default handler
