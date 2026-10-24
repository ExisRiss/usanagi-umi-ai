/*
 *
 * BOOST EMITEN — nyalakan "harga naik terus" untuk satu saham di game trading.
 *
 * Perintah (khusus owner):
 *   {prefix}boost TRD 5          TRD naik terus 5 menit (+2% per menit, maks +30%)
 *   {prefix}boost TRD 5 4        sama, tapi +4% per menit
 *   {prefix}booststop            matikan boost & pump
 *   {prefix}boostinfo            lihat boost yang sedang jalan
 *
 * Singkatan cepat: {prefix}boosttrd [menit] [rate]
 *
 * Endpoint yang dipanggil: POST /api/trading/session/config dengan header
 * X-UMI-Game-Token. Token & base URL dibaca dari lib/webgame.json
 * (atau env UMI_GAME_TOKEN / GAME_TOKEN dan UMI_GAME_BASE).
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONFIG_FILE = path.resolve(__dirname, '../../lib/webgame.json')
const BRAND = global.brandCredit || 'By AlzRiss - Usanagi Umi AI'

function gameConfig() {
  let parsed = {}
  try { parsed = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) } catch { }
  let token = String(parsed.token || process.env.UMI_GAME_TOKEN || process.env.GAME_TOKEN || '').trim()
  if (!token) {
    // cadangan: token bersama bot <-> game yang disimpan di root bot
    for (const file of [path.resolve(__dirname, '../../game-token.txt'), path.resolve(process.cwd(), 'game-token.txt')]) {
      try { token = fs.readFileSync(file, 'utf8').trim(); if (token) break } catch { }
    }
  }
  // Server game menumpang di container yang sama → 127.0.0.1 paling cepat & bebas Cloudflare.
  const baseUrl = String(
    process.env.UMI_GAME_INTERNAL_URL || 'http://127.0.0.1:3900',
  ).replace(/\/+$/, '')
  const publicUrl = String(parsed.baseUrl || process.env.UMI_GAME_BASE || 'https://game.gwenna.my.id').replace(/\/+$/, '')
  return { token, baseUrl, publicUrl }
}

async function callGame(pathname, body, method = 'POST') {
  const { token, baseUrl, publicUrl } = gameConfig()
  if (!token) throw new Error('Token game belum disetel (game-token.txt / webgame.json / UMI_GAME_TOKEN).')

  const hosts = [...new Set([baseUrl, publicUrl].filter(Boolean))]
  let lastError = null
  for (const host of hosts) {
    try {
      const res = await fetch(`${host}${pathname}`, {
        method,
        headers: { 'Content-Type': 'application/json', 'X-UMI-Game-Token': token, Accept: 'application/json' },
        body: method === 'POST' ? JSON.stringify(body || {}) : undefined,
        signal: AbortSignal.timeout(20000),
      })
      const text = await res.text()
      let json = {}
      try { json = JSON.parse(text) } catch { }
      if (!res.ok) throw new Error(json.error || `HTTP ${res.status}`)
      return json
    } catch (error) {
      lastError = error
      // host internal mati / bukan di container yang sama → coba host publik
      if (!/fetch failed|ECONNREFUSED|ENOTFOUND|network/i.test(String(error && error.message))) throw error
    }
  }
  throw lastError || new Error('Tidak bisa menghubungi server game.')
}

function rupiahTime(ms) {
  try {
    return new Date(ms).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Makassar' }) + ' WITA'
  } catch { return '-' }
}

let handler = async (m, { text, command, usedPrefix, isOwner }) => {
  if (!isOwner) return m.reply('❌ Perintah ini khusus owner.')

  const cmd = String(command || '').toLowerCase()
  const args = String(text || '').trim().split(/\s+/).filter(Boolean)

  try {
    /* ── matikan ── */
    if (cmd === 'booststop' || cmd === 'boostoff') {
      await callGame('/api/trading/session/config', { off: true })
      return m.reply('🛑 Boost & pump pasar dimatikan. Harga kembali normal (dengan mendarat perlahan bila boost baru selesai).')
    }

    /* ── lihat status ── */
    if (cmd === 'boostinfo') {
      const d = await callGame('/api/trading/session/config', null, 'GET')
      const b = d.boost
      if (!b) return m.reply(`ℹ️ Tidak ada boost emiten yang aktif.\n\nNyalakan: ${usedPrefix}boost TRD 5\n\n${BRAND}`)
      const live = Date.now() < Number(b.end)
      return m.reply([
        `🔥 *BOOST ${b.symbol}*`,
        '',
        `Status   : ${live ? 'NAIK TERUS' : 'mendarat (decay)'}`,
        `Rate     : +${(Number(b.rate) * 100).toFixed(2)}% / menit`,
        `Batas    : +${(Number(b.cap) * 100).toFixed(0)}%`,
        `Mulai    : ${rupiahTime(b.start)}`,
        `Selesai  : ${rupiahTime(b.end)}`,
        `Decay    : ${b.decayMin} menit`,
        `Boost kini: +${d.session && d.session.boostPct ? d.session.boostPct : 0}%`,
        '',
        `Matikan: ${usedPrefix}booststop`,
        '',
        BRAND,
      ].join('\n'))
    }

    /* ── nyalakan ── */
    let symbol = ''
    let minutes = 5
    let rate = 0

    if (cmd === 'boosttrd') {
      symbol = 'BBCA'
      if (args[0]) minutes = Number(args[0])
      if (args[1]) rate = Number(args[1]) / 100
    } else {
      // .boost <SYM> <menit> [rate%]
      symbol = String(args[0] || '').toUpperCase()
      if (args[1]) minutes = Number(args[1])
      if (args[2]) rate = Number(args[2]) / 100
      if (!symbol) {
        return m.reply([
          `📈 *BOOST EMITEN*`,
          '',
          `Format: ${usedPrefix}boost <SAHAM> <menit> [rate%]`,
          `Contoh: ${usedPrefix}boost TRD 5`,
          `Singkat: ${usedPrefix}boosttrd 5`,
          '',
          `Cek status: ${usedPrefix}boostinfo`,
          `Matikan    : ${usedPrefix}booststop`,
        ].join('\n'))
      }
    }

    if (!Number.isFinite(minutes) || minutes < 1 || minutes > 720) {
      return m.reply('⚠️ Menit harus 1–720.')
    }
    if (rate && (!Number.isFinite(rate) || rate < 0.001 || rate > 0.2)) {
      return m.reply('⚠️ Rate harus 0,1%–20% per menit.')
    }

    const payload = { symbol, minutes, by: m.pushName || 'owner', note: `via ${usedPrefix}${cmd}` }
    if (rate) payload.rate = rate
    const d = await callGame('/api/trading/session/config', payload)
    const b = d.boost || {}

    return m.reply([
      `🔥 *BOOST ${symbol} DIAKTIFKAN*`,
      '',
      `Durasi   : ${minutes} menit`,
      `Rate     : +${(Number(b.rate) * 100).toFixed(2)}% / menit`,
      `Batas    : +${(Number(b.cap) * 100).toFixed(0)}%`,
      `Selesai  : ${rupiahTime(b.end)}`,
      `Mendarat : ${b.decayMin} menit sesudahnya`,
      '',
      `Harga ${symbol} akan naik terus selama ${minutes} menit — buka game.gwenna.my.id/trading`,
      '',
      BRAND,
    ].join('\n'))
  } catch (error) {
    console.error('[BOOST]', error && error.message ? error.message : error)
    return m.reply(`❌ Gagal mengatur boost.\n\nAlasan: ${(error && error.message) || 'kesalahan tidak diketahui'}\n\n${BRAND}`)
  }
}

handler.help = ['boost <saham> <menit>', 'boosttrd [menit]', 'booststop', 'boostinfo']
handler.tags = ['owner', 'game']
handler.command = /^(boost|boosttrd|booststop|boostoff|boostinfo)$/i
handler.owner = true
// Website/game: hanya owner platform (lihat lib/owner-policy.js).
handler.platformOnly = true
handler.limit = false

export default handler
