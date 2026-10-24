/**
 * Jembatan RPG untuk adapter Telegram.
 *
 * Sumber kebenaran = `rpg_users` (SQLite) yang dipakai bot WhatsApp lewat
 * `lib/rpg/unified-store.js`. Tidak ada salinan progres, tidak ada tabel RPG
 * kedua.
 *
 * Keputusan penting: Telegram TIDAK membuat identitas RPG sendiri. Perintah RPG
 * hanya jalan setelah akun Telegram ditautkan ke nomor WhatsApp, sehingga
 * progres di WhatsApp dan Telegram benar-benar satu baris data. (Menulis
 * identitas Telegram ke `rpg_unified_aliases` akan merusak invariant alias WA.)
 */
import { unifiedRpg } from '../rpg/unified-store.js'
import { platformDb } from './db.js'
import { whatsappJidFor } from './identity.js'

export const DAILY = { koin: 500, exp: 250, cooldownMs: 22 * 60 * 60 * 1000 }
export const WORK = { minKoin: 40, maxKoin: 120, exp: 40, cooldownMs: 30 * 60 * 1000 }
// Nomor semu untuk pemain Telegram yang belum punya WhatsApp tertaut.
// Awalan 999 bukan kode negara sehingga tidak mungkin bentrok dengan nomor
// WhatsApp asli; tetap berupa 13 digit agar lolos validasi `pn()` milik engine.
export const PSEUDO_PREFIX = '999'

/**
 * Identitas RPG untuk satu pengguna platform.
 *  - Bila nomor WhatsApp sudah tertaut → nomor asli (progres sama dengan WhatsApp).
 *  - Bila belum → nomor semu stabil dari ID Telegram, supaya pemain Telegram
 *    bisa main sekarang juga. Tidak ada baris yang ditulis ke `rpg_unified_aliases`
 *    untuk identitas semu ini (engine hanya menulis alias dari daftar nomor WA).
 */
export function rpgJidFor(userId, platformUserId = null) {
  const linked = whatsappJidFor(userId)
  if (linked) return { jid: linked, source: 'whatsapp' }
  const id = String(platformUserId || '').replace(/\D/g, '')
  if (!id) return { jid: null, source: 'none' }
  return { jid: `${PSEUDO_PREFIX}${id.padStart(10, '0')}@s.whatsapp.net`, source: 'telegram' }
}

export function isPseudoJid(jid) {
  return String(jid || '').startsWith(PSEUDO_PREFIX)
}

/**
 * Buat profil RPG bila belum ada (aksi eksplisit `/rpg mulai`).
 * Ditulis dalam transaksi engine supaya konsisten dengan bot WhatsApp.
 */
export async function ensureProfile(jid, { idempotencyKey } = {}) {
  const store = requireStore()
  if (!jid) throw Object.assign(new Error('Identitas RPG tidak tersedia.'), { status: 409 })
  const id = store.identity(String(jid))
  if (!id) throw Object.assign(new Error('Identitas RPG tidak valid.'), { status: 400 })
  if (hasProfileRow(id)) return { created: false, jid: id }
  const result = await store.command(`tg-rpg-join:${idempotencyKey || id}`, () => {
    store.write(id, store.read(id))
    return { success: true }
  })
  return { created: !result?.duplicate, jid: id, duplicate: Boolean(result?.duplicate) }
}

/**
 * Kerja (mini game harian): hadiah koin kecil, cooldown 30 menit, dicek di
 * dalam transaksi engine sehingga dua permintaan bersamaan tidak menggandakan.
 */
export async function work(jid, { idempotencyKey, now = Date.now() } = {}) {
  const store = requireStore()
  if (!idempotencyKey) throw Object.assign(new Error('ID permintaan wajib untuk kerja.'), { status: 400 })
  const id = canonical(jid)
  let outcome = null
  const result = await store.command(`tg-work:${idempotencyKey}`, () => {
    const row = store.read(id)
    const last = Number(row?.cooldowns?.work || 0)
    if (last && now - last < WORK.cooldownMs) {
      outcome = { ok: false, reason: 'cooldown', remainingMs: last + WORK.cooldownMs - now, nextAt: new Date(last + WORK.cooldownMs).toISOString() }
      return { success: false }
    }
    // Hadiah deterministik dari menit berjalan: adil, tidak bisa ditebak klien,
    // dan tetap acak antar sesi.
    const span = WORK.maxKoin - WORK.minKoin + 1
    const koin = WORK.minKoin + (Math.floor(now / 60000) * 7919 + id.length * 131) % span
    row.koin = Number(row.koin || 0) + koin
    row.exp = Number(row.exp || 0) + WORK.exp
    row.cooldowns = { ...(row.cooldowns || {}), work: now }
    store.write(id, row)
    outcome = { ok: true, koin, exp: WORK.exp, totalKoin: row.koin, totalExp: row.exp }
    return { success: true }
  })
  if (result?.duplicate) return { ok: false, reason: 'duplicate' }
  return outcome || { ok: false, reason: 'failed' }
}

/** Hadiah kuis/tebak angka yang benar; juga lewat transaksi engine. */
export async function reward(jid, { koin = 0, exp = 0, key, reason = 'game' } = {}) {
  const store = requireStore()
  if (!key) throw Object.assign(new Error('ID permintaan wajib untuk hadiah.'), { status: 400 })
  const id = canonical(jid)
  let outcome = null
  const result = await store.command(`tg-reward:${key}`, () => {
    const row = store.read(id)
    row.koin = Number(row.koin || 0) + Number(koin || 0)
    row.exp = Number(row.exp || 0) + Number(exp || 0)
    store.write(id, row)
    outcome = { ok: true, koin: row.koin, exp: row.exp, reason }
    return { success: true }
  })
  if (result?.duplicate) return { ok: false, reason: 'duplicate' }
  return outcome || { ok: false, reason: 'failed' }
}

export function rpgStore() {
  return unifiedRpg()
}

export function rpgReady() {
  return Boolean(unifiedRpg())
}

export function storeStatus() {
  const store = unifiedRpg()
  if (!store) return { active: false }
  try { return { active: true, ...store.status() } } catch (error) { return { active: false, error: error.message } }
}

function requireStore() {
  const store = unifiedRpg()
  if (!store) throw Object.assign(new Error('Mesin RPG belum aktif di server.'), { status: 503 })
  return store
}

function hasProfileRow(id) {
  // Baris nyata di SQLite = sumber kebenaran "profil ada".
  // `store.read()` akan membuat profil dasar untuk nomor apa pun, jadi tidak
  // bisa dipakai sebagai bukti bahwa pengguna pernah bermain.
  return Boolean(platformDb().prepare('SELECT 1 FROM rpg_users WHERE jid = ?').get(String(id)))
}

function canonical(jid) {
  const store = requireStore()
  const id = store.identity(String(jid || ''))
  if (!id || !hasProfileRow(id)) {
    throw Object.assign(new Error('Nomor WhatsApp ini belum punya profil RPG.'), { status: 409 })
  }
  return id
}

export function profile(jid) {
  const store = requireStore()
  if (!jid) throw Object.assign(new Error('Akun WhatsApp belum ditautkan.'), { status: 409 })
  const id = store.identity(String(jid))
  if (!id || !hasProfileRow(id)) {
    return {
      linked: true,
      hasProfile: false,
      jid,
      message: 'Belum ada progres RPG untuk nomor ini. Mulai dari WhatsApp dulu (kirim pesan biasa agar profil dibuat).',
    }
  }
  const row = store.read(id)
  const inventory = Object.entries(row.inventory || {}).filter(([, count]) => Number(count) > 0).sort((a, b) => b[1] - a[1])
  return {
    linked: true,
    hasProfile: true,
    jid: id,
    koin: row.koin,
    exp: row.exp,
    level: Math.floor(row.exp / 10000) + 1,
    rpg: row.rpg || {},
    quest: row.quest || {},
    cooldowns: row.cooldowns || {},
    inventoryCount: inventory.length,
    inventory: inventory.slice(0, 15).map(([item, count]) => ({ item, count })),
    totalItems: inventory.reduce((sum, [, count]) => sum + Number(count), 0),
  }
}

export function leaderboard({ limit = 10, by = 'koin' } = {}) {
  const store = requireStore()
  const rows = store.allUsers()
    .filter(row => row && typeof row === 'object')
    .map(row => ({
      jid: row.jid,
      koin: Number(row.koin || 0),
      exp: Number(row.exp || 0),
      level: Math.floor(Number(row.exp || 0) / 10000) + 1,
    }))
    .sort((a, b) => (by === 'exp' ? b.exp - a.exp : b.koin - a.koin))
    .slice(0, Math.min(Math.max(Number(limit) || 10, 1), 25))
  return rows.map((row, index) => ({
    ...row,
    rank: index + 1,
    // Nomor disamarkan: papan peringkat dibaca banyak orang.
    masked: row.jid.replace(/(\d{4})\d+(\d{3})/, '$1***$2'),
  }))
}

/**
 * Klaim hadiah harian. Ditulis lewat `store.command(id)` sehingga:
 *  - berjalan dalam satu transaksi SQLite;
 *  - idempotent terhadap ID pesan/platform (retry tidak menggandakan hadiah);
 *  - cooldown dicek di dalam transaksi (bukan dari klien).
 */
export async function claimDaily(jid, { idempotencyKey, now = Date.now() } = {}) {
  const store = requireStore()
  if (!idempotencyKey) throw Object.assign(new Error('ID permintaan wajib untuk hadiah harian.'), { status: 400 })
  const id = canonical(jid)
  let outcome = null
  const result = await store.command(`tg-daily:${idempotencyKey}`, () => {
    const row = store.read(id)
    const last = Number(row?.cooldowns?.daily || 0)
    if (last && now - last < DAILY.cooldownMs) {
      outcome = { ok: false, reason: 'cooldown', nextAt: new Date(last + DAILY.cooldownMs).toISOString(), remainingMs: last + DAILY.cooldownMs - now }
      return { success: false }
    }
    row.koin = Number(row.koin || 0) + DAILY.koin
    row.exp = Number(row.exp || 0) + DAILY.exp
    row.cooldowns = { ...(row.cooldowns || {}), daily: now }
    store.write(id, row)
    outcome = { ok: true, koin: DAILY.koin, exp: DAILY.exp, totalKoin: row.koin, totalExp: row.exp, level: Math.floor(row.exp / 10000) + 1 }
    return { success: true }
  })
  if (result?.duplicate) return { ok: false, reason: 'duplicate', message: 'Hadiah ini sudah diproses.' }
  return outcome || { ok: false, reason: 'failed' }
}
