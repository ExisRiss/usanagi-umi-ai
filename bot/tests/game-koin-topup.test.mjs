// Task64: tukar koin RPG -> $AS harus idempoten, tidak pernah minus, dan
// mengembalikan koin bila server game menolak kredit.
import test from 'node:test'
import assert from 'node:assert/strict'
import { getDb, cleanup } from './fixtures/realms-sqlite.mjs'
import { UNIFIED_RPG } from '../lib/rpg/unified-store.js'
import { koinToAs, koinStatus, convertKoin, readKoin, usedToday, setLedgerDb } from '../lib/game-koin-topup.js'

const JID = '628123456789@s.whatsapp.net'
let serial = 0
const ref = () => `test-${++serial}`

function fixture(koin = 5000) {
  const rows = new Map([[JID, { jid: JID, koin, exp: 0, level: 1, inventory: {}, rpg: {}, quest: {}, cooldowns: {}, legacy: {} }]])
  const store = {
    identity: key => (String(key).endsWith('@s.whatsapp.net') ? String(key) : ''),
    read: id => JSON.parse(JSON.stringify(rows.get(id) || { jid: id, koin: 0, exp: 0, inventory: {}, rpg: {}, quest: {}, cooldowns: {}, legacy: {} })),
    write: (id, value) => rows.set(id, value),
    direct: task => task(),
  }
  globalThis[UNIFIED_RPG] = store
  setLedgerDb(getDb())
  return { rows, finish() { delete globalThis[UNIFIED_RPG]; setLedgerDb(null) } }
}

test('kurs koin: 10 koin = $AS 1 dan dibulatkan ke bawah', () => {
  assert.equal(koinToAs(0), 0)
  assert.equal(koinToAs(5), 0.5)
  assert.equal(koinToAs(10), 1)
  assert.equal(koinToAs(25), 2.5)
})

test('status menampilkan saldo koin dan batas tukar', () => {
  const f = fixture(4321)
  try {
    const status = koinStatus(JID)
    assert.equal(status.koinBalance, 4321)
    assert.equal(status.koinPerAs, 10)
    assert.ok(status.minimumKoin >= 1)
    assert.ok(status.maximumKoin >= status.minimumKoin)
  } finally { f.finish() }
})

test('konversi memotong koin sekali dan referensi yang sama tidak mengkredit ulang', async () => {
  const f = fixture(5000)
  try {
    let calls = 0
    const credit = async ({ amount, reference }) => { calls++; assert.equal(amount, 25); assert.ok(reference); return { balance: 125 } }
    const first = await convertKoin({ jid: JID, token: 't'.repeat(32), amountKoin: 250, reference: ref(), credit })
    assert.equal(first.credited, 25)
    assert.equal(readKoin(JID), 4750)
    assert.equal(calls, 1)
    const id = 'fixed-reference'
    const a = await convertKoin({ jid: JID, token: 't'.repeat(32), amountKoin: 250, reference: id, credit })
    const b = await convertKoin({ jid: JID, token: 't'.repeat(32), amountKoin: 250, reference: id, credit })
    assert.equal(a.credited, 25)
    assert.equal(b.duplicate, true)
    assert.equal(b.credited, 0)
    assert.equal(readKoin(JID), 4500)
    assert.equal(calls, 2)
  } finally { f.finish() }
})

test('kredit game ditolak 4xx: koin dikembalikan penuh', async () => {
  const f = fixture(1000)
  try {
    await assert.rejects(() => convertKoin({
      jid: JID, token: 't'.repeat(32), amountKoin: 500, reference: ref(),
      credit: async () => { throw Object.assign(new Error('ditolak'), { status: 400 }) },
    }), /ditolak/)
    assert.equal(readKoin(JID), 1000)
  } finally { f.finish() }
})

test('koin tidak cukup dan batas transaksi ditolak', async () => {
  const f = fixture(120)
  try {
    await assert.rejects(() => convertKoin({ jid: JID, token: 't'.repeat(32), amountKoin: 500, reference: ref(), credit: async () => ({}) }), /tidak cukup/)
    assert.equal(readKoin(JID), 120)
    await assert.rejects(() => convertKoin({ jid: JID, token: 't'.repeat(32), amountKoin: 5, reference: ref(), credit: async () => ({}) }), /Jumlah koin harus/)
    assert.equal(readKoin(JID), 120)
  } finally { f.finish() }
})

test('total koin hari ini mencatat transaksi selesai', async () => {
  const f = fixture(3000)
  try {
    const before = usedToday(JID)
    await convertKoin({ jid: JID, token: 't'.repeat(32), amountKoin: 300, reference: ref(), credit: async () => ({ balance: 3 }) })
    assert.equal(usedToday(JID), before + 300)
  } finally { f.finish() }
})

test.after(() => cleanup())
