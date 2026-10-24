import test from 'node:test'
import assert from 'node:assert/strict'
import { nextSlotAfter, countMissedSlots } from '../../lib/backup/scheduler.js'

test('interval default 10 menit menghasilkan 6 slot per jam', () => {
  const start = new Date('2026-10-19T00:00:00.000Z')
  let cursor = start
  const slots = []
  for (let index = 0; index < 6; index += 1) {
    cursor = nextSlotAfter(cursor, 10)
    slots.push(cursor.toISOString())
  }
  assert.deepEqual(slots, [
    '2026-10-19T00:10:05.000Z',
    '2026-10-19T00:20:05.000Z',
    '2026-10-19T00:30:05.000Z',
    '2026-10-19T00:40:05.000Z',
    '2026-10-19T00:50:05.000Z',
    '2026-10-19T01:00:05.000Z',
  ])
})

test('slot tetap sejajar jam dinding setelah restart', () => {
  const at = new Date('2026-10-19T00:33:21.000Z')
  assert.equal(nextSlotAfter(at, 10).toISOString(), '2026-10-19T00:40:05.000Z')
})

test('interval 1 menit menghasilkan 1440 slot per hari', () => {
  const start = new Date('2026-10-19T00:00:00.000Z')
  const next = nextSlotAfter(start, 1)
  assert.equal(next.toISOString(), '2026-10-19T00:01:05.000Z')
})

test('slot terlewat dihitung, bukan dikejar berjamaah', () => {
  const last = '2026-10-19T00:00:00.000Z'
  const now = new Date('2026-10-19T01:00:00.000Z')
  assert.equal(countMissedSlots(last, now, 10), 5)
  assert.equal(countMissedSlots(last, new Date('2026-10-19T00:09:00.000Z'), 10), 0)
  assert.equal(countMissedSlots(null, now, 10), 0)
})

test('proxy 144 slot per hari untuk 10 menit', () => {
  const start = Date.UTC(2026, 9, 19)
  const end = start + 24 * 60 * 60 * 1000
  const slots = []
  let cursor = new Date(start)
  while (true) {
    cursor = nextSlotAfter(cursor, 10)
    if (cursor.getTime() > end + 5000) break
    slots.push(cursor.toISOString())
  }
  assert.equal(slots.length, 144)
})
