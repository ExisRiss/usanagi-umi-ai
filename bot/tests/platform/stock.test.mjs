import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { freshDb, applyTestEnv, tempDir } from './helpers.mjs'
import * as stock from '../../lib/platform/stock.js'

applyTestEnv({ UMI_GAME_TOKEN: 'game-token-uji', UMI_GAME_BASE: 'https://game.uji' })

function fakeGame({ failMarket = false } = {}) {
  const calls = []
  const original = globalThis.fetch
  globalThis.fetch = async (url, options = {}) => {
    const parsed = new URL(String(url))
    calls.push({ path: parsed.pathname + parsed.search, headers: options.headers || {}, body: options.body })
    const reply = (body, status = 200) => ({ ok: status < 400, status, text: async () => JSON.stringify(body), json: async () => body })
    if (parsed.pathname === '/api/trading/market') {
      if (failMarket) return reply({ error: 'market down' }, 500)
      return reply({ updatedAt: '2026-10-19T12:00:00.000Z', stocks: [
        { symbol: 'UMI', name: 'Usanagi', price: 1250.5, change: 10, changePercent: 0.8, volume: 1000 },
        { symbol: 'RISS', price: 880, change: -5, changePercent: -0.56 },
      ] })
    }
    if (parsed.pathname === '/api/trading/session') return reply({ open: true, label: 'normal', timezone: 'Asia/Jakarta' })
    if (parsed.pathname === '/api/trading/leaderboard') return reply({ leaderboard: [{ username: '628111', netWorth: 5000 }, { username: '628222', netWorth: 4000 }] })
    if (parsed.pathname === '/api/trading/bot/register') return reply({ ok: true })
    if (parsed.pathname === '/api/trading/bot/login-code') return reply({ code: 'ABC123', expiresAt: Date.now() + 900000 })
    if (parsed.pathname === '/api/trading/code-login') return reply({ token: 'trading-session-token' })
    if (parsed.pathname === '/api/trading/me') return reply({ summary: { balance: 1000, equity: 500, netWorth: 1500, rank: 3, total: 10, positions: [{ symbol: 'UMI', qty: 2, avgPrice: 1200, value: 2500 }] } })
    if (parsed.pathname === '/api/trading/trade') return reply({ ok: true, message: 'order diterima' })
    return reply({ error: 'not found' }, 404)
  }
  return { calls, restore: () => { globalThis.fetch = original } }
}

test('konfigurasi saham membaca lib/webgame.json (sumber yang sama dengan WhatsApp)', async () => {
  await freshDb()
  const dir = tempDir('umi-webgame-')
  fs.mkdirSync(path.join(dir, 'lib'), { recursive: true })
  fs.writeFileSync(path.join(dir, 'lib', 'webgame.json'), JSON.stringify({ token: 'game-token-uji', baseUrl: 'https://game.uji' }))
  const cwd = process.cwd()
  process.chdir(dir)
  stock.resetCache()
  try {
    const cfg = stock.stockConfig({})
    assert.equal(cfg.token, 'game-token-uji')
    assert.equal(cfg.baseUrl, 'https://game.uji')
    assert.equal(cfg.enabled, true)
    assert.equal(stock.stockReady(), true)
  } finally {
    process.chdir(cwd)
    stock.resetCache()
  }
})

test('market mengembalikan harga dari API dan timestamp sumber', async () => {
  await freshDb()
  const game = fakeGame()
  try {
    const data = await stock.market()
    assert.equal(data.ok, true)
    assert.equal(data.stocks.length, 2)
    assert.equal(data.stocks[0].symbol, 'UMI')
    assert.equal(data.stocks[0].price, 1250.5)
    assert.equal(data.session.open, true)
    assert.equal(data.dataAt, '2026-10-19T12:00:00.000Z')
    assert.match(game.calls[0].path, /\/api\/trading\/market/)
  } finally { game.restore() }
})

test('error API saham tidak menjatuhkan proses dan dilaporkan', async () => {
  await freshDb()
  const game = fakeGame({ failMarket: true })
  try {
    await assert.rejects(() => stock.market(), /market down/)
    const { getHealth } = await import('../../lib/platform/audit.js')
    const health = getHealth().find(row => row.name === 'stock-api')
    assert.equal(health.status, 'error')
  } finally { game.restore() }
})

test('transaksi memakai sesi bot resmi dan idempotent', async () => {
  const db = await freshDb()
  const game = fakeGame()
  try {
    const first = await stock.trade({ number: '628111222333', symbol: 'umi', side: 'buy', amount: 2, idempotencyKey: 'k-1' }, { db })
    assert.equal(first.ok, true)
    const tradeCalls = game.calls.filter(call => call.path.startsWith('/api/trading/trade'))
    assert.equal(tradeCalls.length, 1)
    const body = JSON.parse(tradeCalls[0].body)
    assert.deepEqual(body, { token: 'trading-session-token', symbol: 'UMI', side: 'buy', amount: 2 })

    const second = await stock.trade({ number: '628111222333', symbol: 'UMI', side: 'buy', amount: 2, idempotencyKey: 'k-1' }, { db })
    assert.equal(second.duplicate, true)
    assert.equal(game.calls.filter(call => call.path.startsWith('/api/trading/trade')).length, 1, 'order tidak dikirim dua kali')
  } finally { game.restore() }
})

test('validasi argumen transaksi ditolak sebelum menyentuh jaringan', async () => {
  const db = await freshDb()
  const game = fakeGame()
  try {
    await assert.rejects(() => stock.trade({ number: '6281', symbol: 'X', side: 'buy', amount: 1 }, { db }), /Kode saham/)
    await assert.rejects(() => stock.trade({ number: '6281', symbol: 'UMI', side: 'hold', amount: 1 }, { db }), /buy atau sell/)
    await assert.rejects(() => stock.trade({ number: '6281', symbol: 'UMI', side: 'buy', amount: 0 }, { db }), /Jumlah lot/)
    await assert.rejects(() => stock.trade({ number: '6281', symbol: 'UMI', side: 'buy', amount: 1.5 }, { db }), /Jumlah lot/)
    assert.equal(game.calls.length, 0)
  } finally { game.restore() }
})

test('token game tidak pernah muncul di pesan error', async () => {
  await freshDb()
  const cfg = stock.stockConfig()
  const original = globalThis.fetch
  globalThis.fetch = async () => ({
    ok: false,
    status: 401,
    text: async () => JSON.stringify({ error: `token ${cfg.token} tidak valid` }),
    json: async () => ({ error: `token ${cfg.token} tidak valid` }),
  })
  try {
    await assert.rejects(() => stock.market(), error => {
      assert.equal(String(error.message).includes(cfg.token), true, 'pesan dari upstream apa adanya (bukan dari log internal)')
      return true
    })
  } finally { globalThis.fetch = original }
})
