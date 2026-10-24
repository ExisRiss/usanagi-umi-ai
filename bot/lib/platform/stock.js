/**
 * Saham / UMI TRADE untuk adapter Telegram.
 *
 * Sumber data = API yang SAMA dengan website saham dan plugin WhatsApp
 * (`plugins/game/trading-umi.js`): `<baseUrl>/api/trading/*` dengan header
 * `X-UMI-Game-Token` dari `lib/webgame.json`. Tidak ada tabel harga duplikat,
 * tidak ada angka karangan.
 *
 * Akun trading dibuat untuk nomor WhatsApp yang sudah ditautkan ke identitas
 * platform (bukan nomor baru dari teks Telegram), memakai alur bot resmi:
 * `bot/login-code` → `code-login`.
 */
import fs from 'node:fs'
import path from 'node:path'
import { setHealth } from './audit.js'

// Path dihitung saat dipakai (bukan saat modul dimuat) supaya aman diuji dan
// tetap mengikuti cwd proses bot yang sebenarnya.
const configCandidates = () => [
  path.join(process.cwd(), 'lib', 'webgame.json'),
  path.join(process.cwd(), 'bot', 'lib', 'webgame.json'),
]

let cache = { at: 0, value: null }
const sessionCache = new Map()

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return null }
}

export function stockConfig(env = process.env) {
  if (cache.value && Date.now() - cache.at < 30000) return cache.value
  let parsed = null
  for (const file of configCandidates()) {
    parsed = readJson(file)
    if (parsed) break
  }
  const token = String(parsed?.token || env.UMI_GAME_TOKEN || env.GAME_TOKEN || '').trim()
  const baseUrl = String(parsed?.baseUrl || env.UMI_GAME_BASE || 'https://game.example.com').replace(/\/+$/, '')
  const value = { enabled: parsed ? parsed.enabled !== false : true, baseUrl, token, source: parsed ? 'lib/webgame.json' : 'env' }
  cache = { at: Date.now(), value }
  return value
}

export function stockReady() {
  const cfg = stockConfig()
  return Boolean(cfg.enabled && cfg.token)
}

async function call(endpoint, { method = 'GET', body = null, timeout = 12000, bot = false } = {}) {
  const cfg = stockConfig()
  if (!cfg.enabled) throw Object.assign(new Error('Integrasi saham dinonaktifkan di server.'), { status: 503 })
  const headers = { Accept: 'application/json' }
  if (bot) {
    if (!cfg.token) throw Object.assign(new Error('Token game belum diatur di server (lib/webgame.json).'), { status: 503 })
    headers['X-UMI-Game-Token'] = cfg.token
  }
  if (body) headers['Content-Type'] = 'application/json'
  const response = await fetch(`${cfg.baseUrl}${endpoint}`, {
    method, headers, body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(timeout),
  })
  const text = await response.text()
  let json = null
  try { json = JSON.parse(text) } catch {}
  if (!response.ok) {
    const message = json?.error || json?.message || `API saham membalas HTTP ${response.status}`
    throw Object.assign(new Error(String(message).slice(0, 200)), { status: response.status, upstream: true })
  }
  return json
}

/** Snapshot pasar + sesi. `dataAt` berasal dari upstream. */
export async function market() {
  const started = Date.now()
  try {
    const [marketData, session] = await Promise.all([
      call('/api/trading/market'),
      call('/api/trading/session').catch(() => null),
    ])
    setHealth('stock-api', 'ok', `latency ${Date.now() - started}ms`)
    // API UMI TRADE membalas `{ ok, symbols: [{ sym, name, price, prevClose, change, changePct, high, low, volume }] }`.
    // Bentuk lama (`{ stocks: [...] }`) tetap diterima supaya tidak ada
    // ketergantungan pada satu versi API saja.
    const raw = Array.isArray(marketData?.stocks) ? marketData.stocks
      : Array.isArray(marketData?.symbols) ? marketData.symbols
      : Array.isArray(marketData) ? marketData
      : []
    return {
      ok: true,
      source: stockConfig().baseUrl,
      latencyMs: Date.now() - started,
      fetchedAt: new Date().toISOString(),
      dataAt: marketData?.updatedAt || marketData?.asOf || null,
      session: session ? {
        open: Boolean(session.open ?? session.isOpen ?? true),
        label: session.label || session.name || null,
        timezone: session.timezone || null,
        nextOpen: session.nextOpen || null,
      } : null,
      stocks: raw.map(item => {
        const price = Number(item.price ?? item.last ?? 0)
        const prev = Number(item.prevClose ?? item.previousClose ?? 0)
        const change = Number(item.change ?? (prev ? price - prev : 0))
        const changePercent = Number(item.changePct ?? item.changePercent ?? (prev ? (change / prev) * 100 : 0))
        return {
          symbol: String(item.sym || item.symbol || item.code || item.ticker || '').toUpperCase(),
          name: item.name || null,
          sector: item.sector || null,
          price,
          change,
          changePercent,
          high: item.high === undefined ? null : Number(item.high),
          low: item.low === undefined ? null : Number(item.low),
          volume: Number(item.volume ?? 0),
        }
      }).filter(item => item.symbol).slice(0, 60),
    }
  } catch (error) {
    setHealth('stock-api', 'error', error.message)
    throw error
  }
}

export async function leaderboard(limit = 10) {
  const data = await call('/api/trading/leaderboard')
  // Bentuk API: `{ ok, total, richest: [{ rank, username, netWorth, balance, equity, pl, positions }] }`.
  const rows = Array.isArray(data) ? data
    : (data?.richest || data?.leaderboard || data?.traders || [])
  return rows.slice(0, Math.min(Math.max(Number(limit) || 10, 1), 25)).map(row => ({
    rank: Number(row.rank) || null,
    username: row.username || row.name || '-',
    source: row.source || null,
    netWorth: Number(row.netWorth ?? row.net_worth ?? 0),
    balance: Number(row.balance ?? 0),
    equity: Number(row.equity ?? 0),
    pl: Number(row.pl ?? row.profit ?? 0),
    positions: Number(row.positions ?? row.positionCount ?? 0),
  }))
}

/** Sesi trading untuk nomor WA tertaut (alur bot resmi). */
export async function sessionFor(number, { name = null, force = false } = {}) {
  const normalized = String(number || '').replace(/\D/g, '')
  if (!normalized) throw Object.assign(new Error('Nomor WhatsApp belum ditautkan ke akun ini.'), { status: 409 })
  const cached = sessionCache.get(normalized)
  if (!force && cached && cached.expiresAt - Date.now() > 60000) return cached.token
  await call('/api/trading/bot/register', {
    method: 'POST', bot: true,
    body: { number: normalized, name: name || undefined, username: normalized },
  })
  const code = await call('/api/trading/bot/login-code', { method: 'POST', bot: true, body: { number: normalized, kind: 'login' } })
  const redeem = await call('/api/trading/code-login', { method: 'POST', body: { code: String(code.code || '') } })
  const token = String(redeem.token || '')
  if (!token) throw Object.assign(new Error('Gagal membuat sesi trading.'), { status: 502 })
  sessionCache.set(normalized, { token, expiresAt: Number(code.expiresAt) || Date.now() + 19 * 60000 })
  return token
}

export async function portfolio(number) {
  const token = await sessionFor(number)
  return call(`/api/trading/me?token=${encodeURIComponent(token)}`)
}

/**
 * Beli/jual saham. Validasi akhir tetap di backend game (sumber kebenaran),
 * idempotency key mencegah order ganda saat retry.
 */
export async function trade({ number, symbol, side, amount, idempotencyKey }, { db } = {}) {
  const sym = String(symbol || '').trim().toUpperCase()
  if (!/^[A-Z0-9]{2,12}$/.test(sym)) throw Object.assign(new Error('Kode saham tidak valid.'), { status: 400 })
  if (!['buy', 'sell'].includes(side)) throw Object.assign(new Error('Sisi transaksi harus buy atau sell.'), { status: 400 })
  const lots = Number(amount)
  if (!Number.isInteger(lots) || lots <= 0 || lots > 100000) throw Object.assign(new Error('Jumlah lot harus bilangan bulat 1–100000.'), { status: 400 })
  if (db && idempotencyKey) {
    const seen = db.prepare('SELECT result FROM platform_idempotency WHERE key = ?').get(String(idempotencyKey))
    if (seen) return { ...JSON.parse(seen.result || '{}'), duplicate: true }
  }
  const token = await sessionFor(number)
  const result = await call('/api/trading/trade', { method: 'POST', body: { token, symbol: sym, side, amount: lots } })
  if (db && idempotencyKey) {
    db.prepare('INSERT OR REPLACE INTO platform_idempotency(key, created_at, result) VALUES(?,?,?)')
      .run(String(idempotencyKey), Date.now(), JSON.stringify(result || {}))
  }
  return result
}

export async function redeem({ number, code }) {
  const value = String(code || '').trim().toUpperCase()
  if (!/^[A-Z0-9-]{4,32}$/.test(value)) throw Object.assign(new Error('Kode redeem tidak valid.'), { status: 400 })
  const token = await sessionFor(number)
  return call('/api/trading/redeem', { method: 'POST', body: { token, code: value } })
}

export function resetCache() {
  cache = { at: 0, value: null }
  sessionCache.clear()
}
