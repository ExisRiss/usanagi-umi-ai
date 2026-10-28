/* By AlzRiss - Usanagi Umi AI
 *
 * Task135 — saklar ON/OFF bot per sesi.
 *
 * Setiap sesi (bot utama `main` + setiap jadibot `jadibot:<nomor>`) punya
 * saklar sendiri sehingga mematikan satu sesi tidak memengaruhi sesi lain.
 *
 * Status disimpan di data/bot-power.json agar bertahan setelah restart dan
 * bisa diubah dari dua tempat:
 *   - WhatsApp: .bot on / .bot off / .bot status
 *   - Website Jadibot: /api/settings/apply { session_id, bot_power }
 *
 * Saat saklar OFF, bot tidak membalas apa pun kecuali owner/developer mengetik
 * `.bot on`. Semua perintah lain diabaikan (tanpa balasan) supaya tidak bocor.
 */

import fs from 'fs'
import path from 'path'

const FILE = path.join(process.cwd(), 'data', 'bot-power.json')
const SCOPE_UTAMA = 'main'

let cache = null

function bacaBerkas() {
  try {
    const mentah = fs.readFileSync(FILE, 'utf8')
    const isi = JSON.parse(mentah)
    if (isi && typeof isi === 'object' && !Array.isArray(isi)) return isi
  } catch (error) {
    // berkas belum ada / rusak — mulai dari kosong
  }
  return {}
}

function muat() {
  if (!cache) cache = bacaBerkas()
  return cache
}

function simpan() {
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true })
    fs.writeFileSync(FILE, JSON.stringify(muat(), null, 2), { mode: 0o600 })
    return true
  } catch (error) {
    console.log(`[bot-power] gagal menyimpan: ${error?.message || error}`)
    return false
  }
}

/** Kunci sesi yang dipakai konsisten oleh handler, plugin, dan API website. */
export function scopeDariConfig(botConfig) {
  const mentah = String(botConfig?.scope || '').trim()
  if (mentah) return mentah
  return botConfig?.type === 'jadibot' ? `jadibot:${botConfig?.number || 'tanpa-nomor'}` : SCOPE_UTAMA
}

export function scopeDariNomor(nomor) {
  const bersih = String(nomor || '').replace(/[^0-9]/g, '')
  return bersih ? `jadibot:${bersih}` : SCOPE_UTAMA
}

/** Status saklar. Bawaan: menyala. */
export function powerNyala(scope) {
  const data = muat()
  const entri = data[String(scope || SCOPE_UTAMA)]
  if (!entri) return true
  return entri.enabled !== false
}

/** Info lengkap (untuk .bot status / website). */
export function powerInfo(scope) {
  const data = muat()
  const entri = data[String(scope || SCOPE_UTAMA)] || {}
  return {
    scope: String(scope || SCOPE_UTAMA),
    enabled: entri.enabled !== false,
    since: entri.since || null,
    by: entri.by || null,
  }
}

/** Ubah saklar dan simpan. */
export function setPower(scope, enabled, by = '') {
  const kunci = String(scope || SCOPE_UTAMA)
  const data = muat()
  data[kunci] = {
    enabled: Boolean(enabled),
    since: Date.now(),
    by: String(by || '').slice(0, 60),
  }
  simpan()
  return powerInfo(kunci)
}

/** Daftar semua sesi yang punya status tersimpan. */
export function powerSemua() {
  const data = muat()
  return Object.keys(data).map((kunci) => powerInfo(kunci))
}

/** Muat ulang dari berkas (dipakai setelah API menulis). */
export function powerMuatUlang() {
  cache = bacaBerkas()
  return powerSemua()
}

/**
 * Deteksi perintah `.bot on|off|status` tanpa bergantung pada parser handler.
 * Dipakai handler untuk tetap mengizinkan owner menyalakan bot yang mati.
 */
export function perintahPower(teks) {
  const cocok = String(teks || '').trim().match(/^[.\/!#]+\s*bot\s+(on|off|status|nyala|mati)\b/i)
  if (!cocok) return null
  const kata = cocok[1].toLowerCase()
  if (kata === 'nyala') return 'on'
  if (kata === 'mati') return 'off'
  return kata
}
