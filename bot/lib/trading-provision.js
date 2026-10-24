/* By AlzRiss - Usanagi Umi AI
 *
 * Auto-provision akun UMI TRADE ($AS) untuk pemain WhatsApp.
 *
 * Dipakai plugin registrasi (daftar/verify) dan plugin trading: begitu user
 * terdaftar di bot, akun trading-nya langsung dibuat di server game dengan
 * username = nomor WhatsApp, jadi saldo awal + bonus harian langsung ada.
 *
 * Konfigurasi (urut prioritas):
 *   1. lib/webgame.json  { baseUrl, token, enabled }
 *   2. env UMI_GAME_BASE / UMI_GAME_TOKEN / GAME_TOKEN
 * Token TIDAK pernah ditulis di repo — berkas webgame.json hanya ada di server.
 */
import fs from 'node:fs'
import path from 'node:path'

const CONFIG_FILE = path.join(process.cwd(), 'lib', 'webgame.json')
const TIMEOUT_MS = Number(process.env.UMI_GAME_TIMEOUT || 15000)

let cache = { at: 0, value: null }

export function gameConfig() {
    if (cache.value && Date.now() - cache.at < 30000) return cache.value
    let parsed = {}
    try { parsed = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) } catch { }
    const token = String(parsed.token || process.env.UMI_GAME_TOKEN || process.env.GAME_TOKEN || '').trim()
    const baseUrl = String(parsed.baseUrl || process.env.UMI_GAME_BASE || 'https://game.example.com').replace(/\/+$/, '')
    cache = { at: Date.now(), value: { enabled: parsed.enabled !== false, baseUrl, token } }
    return cache.value
}

export const cleanNumber = (jid) => String(jid || '').split('@')[0].split(':')[0].replace(/\D/g, '')

async function call(pathname, body) {
    const config = gameConfig()
    if (!config.enabled) throw new Error('Fitur trading sedang dimatikan')
    if (!config.token) throw new Error('Token game belum diatur (lib/webgame.json)')
    const res = await fetch(`${config.baseUrl}${pathname}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-UMI-Game-Token': config.token },
        body: JSON.stringify(body || {}),
        signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || `Server game membalas HTTP ${res.status}`)
    return data
}

/**
 * Buat (atau ambil) akun trading milik sebuah nomor WhatsApp.
 * @returns {Promise<{ok:boolean, created:boolean, dailyBonus:number, summary:object}>}
 */
export async function provisionTrading(senderOrNumber, { username, name } = {}) {
    const number = cleanNumber(senderOrNumber)
    if (number.length < 8) return { ok: false, error: 'Nomor tidak valid' }
    const data = await call('/api/trading/bot/register', {
        number,
        username: String(username || number).slice(0, 60),
        name: name ? String(name).slice(0, 60) : undefined,
    })
    return { ok: true, created: Boolean(data.created), dailyBonus: Number(data.dailyBonus) || 0, summary: data.summary || {} }
}

/** Ringkasan singkat untuk caption pesan (satu baris). */
export function tradingLine(result) {
    if (!result || !result.ok) return ''
    const s = result.summary || {}
    const as = (n) => Number(n || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const parts = [`💹 Akun trading ${result.created ? 'dibuat' : 'siap'}: $AS ${as(s.netWorth)}`]
    if (s.rank) parts.push(`peringkat #${s.rank}/${s.total || '?'}`)
    if (result.dailyBonus) parts.push(`bonus harian +${as(result.dailyBonus)}`)
    return parts.join(' · ')
}
