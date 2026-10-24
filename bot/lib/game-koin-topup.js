/*
 *
 * Task64 — Tukar koin RPG menjadi saldo $AS UMI TRADE.
 *
 * Tidak ada pembayaran DANA/uang sungguhan di jalur ini. Sumber dana satu-satunya
 * adalah `koin` RPG milik nomor WhatsApp pengguna.
 *
 * Aturan keamanan (mengikuti pola SEC-01 pada wallet-convert):
 *  - Referensi idempoten disimpan di SQLite SEBELUM koin dipotong.
 *  - Koin dipotong secara sinkron (tanpa await) setelah reservasi berhasil.
 *  - Bila server game menolak kredit, koin dikembalikan dan reservasi ditandai gagal.
 *  - Batas harian dihitung dari total koin pada reservasi hari itu.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { getDb } from '../core/awang-sqlite.js'
import { unifiedRpg } from './rpg/unified-store.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LINKS_FILE = path.join(__dirname, 'trading-links.json')
const DAY_MS = 24 * 60 * 60 * 1000
const RESERVE_TTL_MS = 5 * 60 * 1000

function intEnv(name, fallback, min = 1) {
  const value = Math.trunc(Number(process.env[name]))
  return Number.isFinite(value) && value >= min ? value : fallback
}

/** 1 $AS = berapa koin. Default 10 koin = $AS 1 (kurs murah, pilihan owner). */
export function koinPerAs() { return intEnv('UMI_KOIN_PER_AS', 10) }
export function koinLimits() {
  const min = intEnv('UMI_KOIN_MIN', 20)                    // 20 koin = $AS 2
  const max = Math.max(min, intEnv('UMI_KOIN_MAX', 5000))   // 5.000 koin = $AS 500
  const daily = Math.max(max, intEnv('UMI_KOIN_DAILY_MAX', 20000))
  return { min, max, daily }
}
export function koinToAs(amountKoin) {
  const value = Math.floor(Number(amountKoin) || 0)
  if (value <= 0) return 0
  return Math.floor((value / koinPerAs()) * 100) / 100
}

function normalizeNumber(value) {
  const digits = String(value || '').replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 25 ? digits : ''
}
export function jidForNumber(number) {
  const digits = normalizeNumber(number)
  return digits ? `${digits}@s.whatsapp.net` : ''
}
function bareNumber(jid) { return String(jid || '').split('@')[0].split(':')[0].replace(/\D/g, '') }

/* ── peta nomor WA <-> token akun (dibuat oleh `.trading login`) ── */
export function tradingLinks() {
  try {
    const data = JSON.parse(fs.readFileSync(LINKS_FILE, 'utf8'))
    return data && typeof data === 'object' ? data : {}
  } catch { return {} }
}
export function numberForToken(token) {
  const wanted = String(token || '').trim()
  if (wanted.length < 16) return ''
  let best = ''
  let bestAt = -1
  for (const [number, link] of Object.entries(tradingLinks())) {
    if (!link || String(link.token || '') !== wanted) continue
    const at = Number(link.at) || 0
    if (at >= bestAt) { best = normalizeNumber(number); bestAt = at }
  }
  return best
}
export function tokenForNumber(number) {
  const digits = normalizeNumber(number)
  if (!digits) return ''
  const link = tradingLinks()[digits]
  return String(link?.token || '')
}

/* ── baca/tulis koin lewat otoritas RPG yang sama dengan plugin RPG ── */
function rpgIdentity(jid) {
  const store = unifiedRpg()
  const key = String(jid || '')
  if (store) {
    try { return store.identity(key) || bareNumber(key) } catch { return bareNumber(key) }
  }
  return key
}
export function readKoin(jid) {
  const store = unifiedRpg()
  const id = rpgIdentity(jid)
  if (!id) return 0
  if (store) {
    try {
      const user = store.read(id)
      return Math.max(0, Math.trunc(Number(user?.koin) || 0))
    } catch { return 0 }
  }
  const user = global.db?.data?.users?.[jid] || global.db?.data?.users?.[id]
  return Math.max(0, Math.trunc(Number(user?.koin ?? user?.money ?? 0) || 0))
}
function debitKoin(jid, amount) {
  const store = unifiedRpg()
  const id = rpgIdentity(jid)
  if (!id) throw Object.assign(new Error('Identitas RPG tidak ditemukan.'), { status: 409 })
  const value = Math.trunc(Number(amount) || 0)
  if (!Number.isSafeInteger(value) || value <= 0) throw Object.assign(new Error('Jumlah koin tidak valid.'), { status: 400 })
  const apply = () => {
    if (store) {
      const user = store.read(id)
      const balance = Math.trunc(Number(user?.koin) || 0)
      if (balance < value) throw Object.assign(new Error('Koin RPG tidak cukup.'), { status: 402, balance })
      user.koin = balance - value
      store.write(id, user)
      return balance - value
    }
    const users = global.db?.data?.users || {}
    const user = users[jid] || users[id]
    if (!user) throw Object.assign(new Error('Akun RPG tidak ditemukan.'), { status: 404 })
    const field = Number.isFinite(Number(user.koin)) ? 'koin' : 'money'
    const balance = Math.trunc(Number(user[field]) || 0)
    if (balance < value) throw Object.assign(new Error('Koin RPG tidak cukup.'), { status: 402, balance })
    user[field] = balance - value
    return balance - value
  }
  return store ? store.direct(apply) : apply()
}
function creditKoin(jid, amount) {
  const store = unifiedRpg()
  const id = rpgIdentity(jid)
  const value = Math.trunc(Number(amount) || 0)
  if (!id || value <= 0) return
  const apply = () => {
    if (store) {
      const user = store.read(id)
      user.koin = Math.max(0, Math.trunc(Number(user?.koin) || 0) + value)
      store.write(id, user)
      return
    }
    const users = global.db?.data?.users || {}
    const user = users[jid] || users[id]
    if (!user) return
    const field = Number.isFinite(Number(user.koin)) ? 'koin' : 'money'
    user[field] = Math.max(0, Math.trunc(Number(user[field]) || 0) + value)
  }
  return store ? store.direct(apply) : apply()
}

/* ── ledger idempoten ── */
let tableReady = false
let injectedDb = null
/** Hanya untuk test: pakai koneksi SQLite sementara, bukan database bot asli. */
export function setLedgerDb(instance) {
  injectedDb = instance || null
  tableReady = false
}
function db() {
  const instance = injectedDb || getDb()
  if (!tableReady) {
    instance.exec(`CREATE TABLE IF NOT EXISTS game_koin_topups (
      reference TEXT PRIMARY KEY,
      jid TEXT NOT NULL,
      account TEXT NOT NULL,
      koin INTEGER NOT NULL,
      credit REAL NOT NULL,
      state TEXT NOT NULL,
      created INTEGER NOT NULL,
      updated INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_game_koin_topups_jid ON game_koin_topups(jid, created);`)
    tableReady = true
  }
  return instance
}
function hashToken(token) { return crypto.createHash('sha256').update(String(token || '')).digest('hex').slice(0, 32) }
function dayStart() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
}
export function usedToday(jid) {
  try {
    const id = rpgIdentity(jid)
    const row = db().prepare("SELECT COALESCE(SUM(koin),0) AS total FROM game_koin_topups WHERE jid = ? AND state IN ('reserved','done') AND created >= ?").get(id, dayStart())
    return Math.max(0, Math.trunc(Number(row?.total) || 0))
  } catch { return 0 }
}
function reserve({ reference, jid, account, koin, credit }) {
  const now = Date.now()
  const row = db().prepare('SELECT reference, state, created FROM game_koin_topups WHERE reference = ?').get(reference)
  if (row) {
    if (row.state === 'done') return { duplicate: true, state: 'done' }
    if (row.state === 'reserved' && now - Number(row.created) < RESERVE_TTL_MS) return { pending: true, state: 'reserved' }
    db().prepare("UPDATE game_koin_topups SET state='reserved', jid=?, account=?, koin=?, credit=?, created=?, updated=? WHERE reference=?")
      .run(jid, account, koin, credit, now, now, reference)
    return { reserved: true, retry: true }
  }
  db().prepare("INSERT INTO game_koin_topups(reference,jid,account,koin,credit,state,created,updated) VALUES(?,?,?,?,?,'reserved',?,?)")
    .run(reference, jid, account, koin, credit, now, now)
  return { reserved: true }
}
function finish(reference, state, patch = {}) {
  db().prepare('UPDATE game_koin_topups SET state=?, credit=COALESCE(?,credit), updated=? WHERE reference=?')
    .run(state, patch.credit ?? null, Date.now(), reference)
}
function ledgerRow(reference) {
  return db().prepare('SELECT * FROM game_koin_topups WHERE reference = ?').get(reference) || null
}

/* ── status konversi ── */
export function koinStatus(jid) {
  const limits = koinLimits()
  const number = bareNumber(jid)
  return {
    ok: true,
    number,
    jid: rpgIdentity(jid),
    koinBalance: readKoin(jid),
    koinPerAs: koinPerAs(),
    asPerKoin: 1 / koinPerAs(),
    minimumKoin: limits.min,
    maximumKoin: limits.max,
    dailyMaximumKoin: limits.daily,
    usedTodayKoin: usedToday(jid),
    description: 'Tukar koin RPG hasil main di bot WhatsApp menjadi saldo $AS. Tanpa DANA.',
  }
}

/* ── konversi utama ── */
export async function convertKoin({ jid, token, amountKoin, reference, credit }) {
  if (typeof credit !== 'function') throw Object.assign(new Error('Kreditor game tidak tersedia.'), { status: 503 })
  const id = rpgIdentity(jid)
  if (!id) throw Object.assign(new Error('Nomor WhatsApp belum tertaut ke akun RPG.'), { status: 409 })
  const limits = koinLimits()
  const amount = Math.trunc(Number(amountKoin) || 0)
  if (!Number.isSafeInteger(amount) || amount <= 0) throw Object.assign(new Error('Jumlah koin tidak valid.'), { status: 400 })
  if (amount < limits.min || amount > limits.max) {
    throw Object.assign(new Error(`Jumlah koin harus ${limits.min.toLocaleString('id-ID')}–${limits.max.toLocaleString('id-ID')} per transaksi.`), { status: 400 })
  }
  const used = usedToday(id)
  if (used + amount > limits.daily) {
    throw Object.assign(new Error(`Batas tukar koin harian ${limits.daily.toLocaleString('id-ID')} koin sudah tercapai (terpakai ${used.toLocaleString('id-ID')}).`), { status: 429 })
  }
  const credited = koinToAs(amount)
  if (!(credited > 0)) throw Object.assign(new Error('Nilai tukar terlalu kecil.'), { status: 400 })
  const ref = String(reference || `koin-${id}-${crypto.randomUUID()}`).slice(0, 120)
  const account = hashToken(token)

  const slot = reserve({ reference: ref, jid: id, account, koin: amount, credit: credited })
  if (slot.duplicate) {
    const row = ledgerRow(ref)
    const balance = readKoin(id)
    return { ok: true, duplicate: true, credited: 0, koin: Number(row?.koin) || amount, koinBalance: balance, reference: ref, note: 'Referensi ini sudah pernah ditukar.' }
  }
  if (slot.pending) {
    throw Object.assign(new Error('Transaksi dengan referensi ini sedang diproses.'), { status: 409, pending: true })
  }

  let koinBalance
  try {
    koinBalance = debitKoin(id, amount)
  } catch (error) {
    finish(ref, 'failed')
    throw error
  }

  try {
    const result = await credit({ token, amount: credited, reference: ref })
    finish(ref, 'done')
    return {
      ok: true,
      credited,
      koin: amount,
      koinBalance: readKoin(id),
      balance: Number(result?.balance) || undefined,
      gameBalance: Number(result?.balance) || undefined,
      reference: ref,
      rate: koinPerAs(),
    }
  } catch (error) {
    // Server game menolak secara pasti -> koin dikembalikan. Untuk kegagalan
    // tak pasti (timeout) kredit mungkin sudah masuk, jadi koin TIDAK
    // dikembalikan otomatis; referensi tetap 'reserved' dan bisa direkonsiliasi.
    const status = Number(error?.status) || 0
    if (status >= 400 && status < 500) {
      creditKoin(id, amount)
      finish(ref, 'failed')
      throw Object.assign(new Error(`${error?.message || 'Game menolak kredit.'} Koin kamu sudah dikembalikan.`), { status: 502 })
    }
    throw Object.assign(new Error('Kredit $AS belum terkonfirmasi. Coba lagi dengan referensi yang sama; koin tidak akan terpotong dua kali.'), { status: 502, retryable: true, code: 'UNCERTAIN', reference: ref })
  }
}

export default { koinPerAs, koinLimits, koinToAs, koinStatus, convertKoin, numberForToken, tokenForNumber, jidForNumber, readKoin, usedToday }
