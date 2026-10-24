import test from 'node:test'
import assert from 'node:assert/strict'
import { freshDb, applyTestEnv } from './helpers.mjs'
import { createUnifiedStore, UNIFIED_RPG } from '../../lib/rpg/unified-store.js'
import * as rpg from '../../lib/platform/rpg.js'

applyTestEnv()

const JID = '628111222333@s.whatsapp.net'
const OTHER = '628999888777@s.whatsapp.net'

async function setupStore() {
  const db = await freshDb()
  const users = {
    [JID]: { name: 'Umi', money: 0, exp: 25000, inventory: { sword: 1, potion: 3 }, rpg: { health: 100, maxHealth: 100 }, cooldowns: {} },
    [OTHER]: { name: 'Riss', money: 0, exp: 5000, inventory: {}, rpg: { health: 50, maxHealth: 100 }, cooldowns: {} },
  }
  const store = createUnifiedStore({ db, users, links: [] })
  store.migrate()
  globalThis[UNIFIED_RPG] = store
  return { db, store }
}

test('profil RPG Telegram membaca baris data yang sama dengan WhatsApp', async () => {
  const { store } = await setupStore()
  const profile = rpg.profile(JID)
  assert.equal(profile.hasProfile, true)
  assert.equal(profile.jid, '628111222333')
  assert.equal(profile.exp, 25000)
  assert.equal(profile.level, 3)
  assert.equal(profile.inventoryCount, 2)
  assert.equal(profile.inventory[0].count >= 1, true)
  // Store WA membaca data yang identik.
  const waRow = store.read('628111222333')
  assert.equal(waRow.exp, profile.exp)
})

test('profil tanpa nomor tertaut ditolak jelas (bukan data karangan)', async () => {
  await setupStore()
  assert.throws(() => rpg.profile(''), /belum ditautkan/)
  const missing = rpg.profile('628000000000@s.whatsapp.net')
  assert.equal(missing.hasProfile, false, 'nomor yang belum pernah bermain tidak dibuatkan profil palsu')
  assert.match(missing.message, /Belum ada progres RPG/)
  await assert.rejects(() => rpg.claimDaily('628000000000@s.whatsapp.net', { idempotencyKey: 'x' }), /belum punya profil RPG/)
})

test('leaderboard menyamarkan nomor dan mengurutkan koin', async () => {
  await setupStore()
  const rows = rpg.leaderboard({ limit: 5 })
  assert.equal(rows.length, 2)
  assert.ok(rows[0].koin >= rows[1].koin)
  assert.match(rows[0].masked, /\*\*\*/)
  assert.equal(rows[0].masked.includes('628111222333'), false)
})

test('hadiah harian sekali per cooldown dan idempoten untuk ID yang sama', async () => {
  const { store } = await setupStore()
  const before = store.read('628111222333').koin

  const first = await rpg.claimDaily(JID, { idempotencyKey: 'upd-1', now: Date.now() })
  assert.equal(first.ok, true)
  assert.equal(first.koin, rpg.DAILY.koin)
  const afterFirst = store.read('628111222333')
  assert.equal(afterFirst.koin, before + rpg.DAILY.koin)
  assert.equal(afterFirst.exp, 25000 + rpg.DAILY.exp)

  // ID sama (Telegram retry) → tidak menambah apa pun.
  const duplicate = await rpg.claimDaily(JID, { idempotencyKey: 'upd-1', now: Date.now() })
  assert.equal(duplicate.ok, false)
  assert.equal(duplicate.reason, 'duplicate')
  assert.equal(store.read('628111222333').koin, before + rpg.DAILY.koin)

  // ID berbeda pada hari yang sama → cooldown, bukan double reward.
  const cooling = await rpg.claimDaily(JID, { idempotencyKey: 'upd-2', now: Date.now() })
  assert.equal(cooling.ok, false)
  assert.equal(cooling.reason, 'cooldown')
  assert.equal(store.read('628111222333').koin, before + rpg.DAILY.koin)

  // Setelah cooldown lewat → boleh lagi.
  const later = await rpg.claimDaily(JID, { idempotencyKey: 'upd-3', now: Date.now() + rpg.DAILY.cooldownMs + 1000 })
  assert.equal(later.ok, true)
  assert.equal(store.read('628111222333').koin, before + rpg.DAILY.koin * 2)
})

test('klik ganda bersamaan tidak menggandakan hadiah', async () => {
  const { store } = await setupStore()
  const before = store.read('628111222333').koin
  const results = await Promise.allSettled([
    rpg.claimDaily(JID, { idempotencyKey: 'race-1' }),
    rpg.claimDaily(JID, { idempotencyKey: 'race-1' }),
  ])
  const granted = results.filter(item => item.status === 'fulfilled' && item.value.ok).length
  assert.equal(granted, 1, 'tepat satu klaim yang dieksekusi')
  assert.equal(store.read('628111222333').koin, before + rpg.DAILY.koin)
})

test('tanpa idempotency key permintaan ditolak', async () => {
  await setupStore()
  await assert.rejects(() => rpg.claimDaily(JID, {}), /ID permintaan wajib/)
})

test('status mesin RPG melaporkan angka nyata', async () => {
  await setupStore()
  const status = rpg.storeStatus()
  assert.equal(status.active, true)
  assert.equal(status.canonicalUsers, 2)
  assert.equal(status.currencyRule.includes('RPG-only'), true)
})
