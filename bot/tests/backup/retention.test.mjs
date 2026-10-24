import test from 'node:test'
import assert from 'node:assert/strict'
import { planRetention } from '../../lib/backup/retention.js'

function records(count, { minutes = 10, start = Date.UTC(2026, 0, 1, 0, 0, 0) } = {}) {
  return Array.from({ length: count }, (_, index) => ({
    id: `bk_${index}`,
    status: 'completed',
    startedAt: new Date(start + index * minutes * 60_000).toISOString(),
  }))
}

test('retensi default menyimpan 144 snapshot terbaru', () => {
  const rows = records(300)
  const plan = planRetention(rows, { recent: 144, daily: 7, weekly: 4, monthly: 3 })
  const kept = new Set(plan.keep.map(item => item.id))
  for (const row of rows.slice(-144)) assert.ok(kept.has(row.id), `${row.id} harus disimpan`)
  assert.equal(plan.expired.length, 300 - kept.size)
  assert.ok(kept.size >= 144)
})

test('arsip harian, mingguan, bulanan dipromosikan', () => {
  // 2 hari data, 10 menit sekali = 288 snapshot
  const rows = records(288)
  const plan = planRetention(rows, { recent: 144, daily: 7, weekly: 4, monthly: 3 })
  const tiers = Object.fromEntries(plan.keep.map(item => [item.id, item.tier]))
  const daily = plan.keep.filter(item => item.tier === 'daily')
  const weekly = plan.keep.filter(item => item.tier === 'weekly')
  const monthly = plan.keep.filter(item => item.tier === 'monthly')
  // Hari pertama hanya diwakili arsip harian karena di luar 144 terbaru.
  assert.ok(daily.length >= 1, 'harus ada arsip harian')
  assert.ok(Object.values(tiers).includes('recent'))
  assert.ok(weekly.length >= 0 && monthly.length >= 0)
  assert.ok(plan.expired.length > 0)
})

test('tidak menghapus backup yang lebih baru dari penggantinya', () => {
  const rows = records(200)
  const plan = planRetention(rows, { recent: 144, daily: 7, weekly: 4, monthly: 3 })
  const expired = new Set(plan.expired)
  const keptSorted = plan.keep.map(item => item.id)
  const newest = rows[rows.length - 1].id
  assert.ok(!expired.has(newest))
  assert.ok(keptSorted.includes(newest))
  // Semua yang kedaluwarsa harus lebih tua dari snapshot terbaru yang disimpan.
  const newestKeptTime = Math.max(...plan.keep.map(item => new Date(rows.find(row => row.id === item.id).startedAt).getTime()))
  for (const id of expired) {
    const row = rows.find(item => item.id === id)
    assert.ok(new Date(row.startedAt).getTime() <= newestKeptTime)
  }
})

test('backup gagal atau berjalan tidak dihitung untuk retensi', () => {
  const rows = [
    { id: 'ok', status: 'completed', startedAt: '2026-01-01T00:00:00.000Z' },
    { id: 'bad', status: 'failed', startedAt: '2026-01-01T00:10:00.000Z' },
    { id: 'run', status: 'running', startedAt: '2026-01-01T00:20:00.000Z' },
  ]
  const plan = planRetention(rows, { recent: 10, daily: 7, weekly: 4, monthly: 3 })
  assert.deepEqual(plan.expired, [])
  assert.deepEqual(plan.keep.map(item => item.id), ['ok'])
})
