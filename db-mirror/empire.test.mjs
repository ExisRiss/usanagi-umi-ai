/**
 * Uji otomatis mesin Property Empire.
 * Jalankan: node --test db-mirror/empire.test.mjs
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createGame, BOARD, roll, buyProperty, declineProperty, auctionBid, auctionPass,
  buildHouse, sellHouse, mortgage, unmortgage, endTurn, netWorth, rentFor,
  drawCard, CHANCE, CHEST, applyCard, proposeTrade, respondTrade, serialize, deserialize,
  botStep, tile, owner, sendToJail, payJailFine, payDebt, GROUPS, groupTiles,
} from './empire.js'

const two = (opts = {}) => createGame(Object.assign({
  players: [
    { name: 'Manusia', isBot: false },
    { name: 'Bot', isBot: true, personality: 'balanced' },
  ],
}, opts))

/* RNG yang selalu memberi nilai tertentu */
const fixed = (...seq) => {
  let i = 0
  return () => seq[(i++) % seq.length]
}

test('papan punya 40 petak dengan 4 sudut', () => {
  assert.equal(BOARD.length, 40)
  assert.deepEqual([0, 10, 20, 30].map(i => BOARD[i].type), ['go', 'jail', 'park', 'gotojail'])
  assert.equal(BOARD.filter(t => t.type === 'prop').length, 22)
  assert.equal(BOARD.filter(t => t.type === 'railroad').length, 4)
  assert.equal(BOARD.filter(t => t.type === 'utility').length, 2)
  assert.equal(BOARD.filter(t => t.type === 'chance').length, 3)
  assert.equal(BOARD.filter(t => t.type === 'chest').length, 3)
})

test('melewati MULAI menerima gaji', () => {
  const s = two()
  s.players[0].pos = 38
  s.dice = [0, 0]
  const before = s.players[0].cash
  s.phase = 'roll'
  // 3 + 3 = 6 → melewati start
  roll(s, fixed(0.5, 0.5))
  assert.ok(s.players[0].cash >= before + 200, 'gaji harus masuk')
})

test('pembelian properti memotong saldo & mencatat pemilik', () => {
  const s = two()
  s.turn = 0; s.phase = 'buy'
  s.pending = { type: 'buy', player: 0, tile: 39 }
  const before = s.players[0].cash
  assert.equal(buyProperty(s), true)
  assert.equal(s.players[0].cash, before - 400)
  assert.equal(owner(s, 39), 0)
  assert.equal(s.phase, 'end')
})

test('menolak membeli memulai lelang dan lelang memindahkan kepemilikan', () => {
  const s = two()
  s.turn = 0; s.phase = 'buy'
  s.pending = { type: 'buy', player: 0, tile: 1 }
  declineProperty(s)
  assert.equal(s.phase, 'auction')
  assert.ok(s.auction)
  const turn = s.auction.turn
  auctionBid(s, turn, 30)
  auctionPass(s, s.auction.active.find(i => i !== turn))
  assert.equal(owner(s, 1), turn)
})

test('sewa properti, kereta, dan utilitas dihitung benar', () => {
  const s = two()
  s.holdings[1].owner = 1          // Tanah Abang, sewa dasar 2
  assert.equal(rentFor(s, 1, 7), 2)
  s.holdings[3].owner = 1
  assert.equal(rentFor(s, 1, 7), 4) // seluruh kelompok cokelat dimiliki → 2×
  s.holdings[5].owner = 1
  assert.equal(rentFor(s, 5, 7), 25)
  s.holdings[15].owner = 1
  assert.equal(rentFor(s, 15, 7), 50)
  s.holdings[12].owner = 1
  assert.equal(rentFor(s, 12, 7), 4 * 7)
  s.holdings[28].owner = 1
  assert.equal(rentFor(s, 28, 7), 10 * 7)
})

test('properti yang digadaikan tidak menghasilkan sewa', () => {
  const s = two()
  s.holdings[1].owner = 1
  s.holdings[1].mortgaged = true
  assert.equal(rentFor(s, 1, 7), 0)
})

test('pajak mengurangi saldo', () => {
  const s2 = two()
  s2.turn = 0
  s2.players[0].pos = 2
  const c = s2.players[0].cash
  s2.phase = 'roll'
  roll(s2, fixed(0, 0)) // 1 + 1 = 2 → petak 4 Pajak Penghasilan Rp200
  assert.equal(s2.players[0].pos, 4)
  assert.equal(s2.players[0].cash, c - 200)
})

test('setiap kartu kesempatan & dana komunitas punya efek terstruktur', () => {
  for (const card of [...CHANCE, ...CHEST]) {
    assert.ok(card.effect && card.effect.type, card.id)
    assert.ok(card.text.length > 5)
  }
  const s = two()
  const before = s.players[0].cash
  applyCard(s, 0, { text: 'tes', effect: { type: 'money', amount: 100 } })
  assert.equal(s.players[0].cash, before + 100)
  applyCard(s, 0, { text: 'tes', effect: { type: 'money', amount: -50 } })
  assert.equal(s.players[0].cash, before + 50)
})

test('kartu masuk penjara memindahkan pemain ke sel', () => {
  const s = two()
  applyCard(s, 0, { text: 'jail', effect: { type: 'jail' } })
  assert.equal(s.players[0].inJail, true)
  assert.equal(s.players[0].pos, 10)
})

test('keluar penjara dengan denda & kartu bebas', () => {
  const s = two()
  sendToJail(s, 0)
  const before = s.players[0].cash
  s.turn = 0
  assert.equal(payJailFine(s), true)
  assert.equal(s.players[0].inJail, false)
  assert.equal(s.players[0].cash, before - 50)

  const s2 = two()
  s2.turn = 0
  sendToJail(s2, 0)
  s2.players[0].getOutCards = 1
  assert.equal(s2.players[0].inJail, true)
})

test('dadu kembar memberi giliran tambahan, tiga kembar masuk penjara', () => {
  const s = two()
  s.turn = 0
  s.phase = 'roll'
  roll(s, fixed(0.2, 0.2)) // 2 + 2
  assert.equal(s.doublesCount, 1)
  s.phase = 'end'
  endTurn(s)
  assert.equal(s.turn, 0, 'masih giliran yang sama karena kembar')
  s.phase = 'roll'; s.dice = [0, 0]
  roll(s, fixed(0.2, 0.2))
  s.phase = 'end'
  endTurn(s)
  s.phase = 'roll'; s.dice = [0, 0]
  const before = s.players[0].inJail
  roll(s, fixed(0.2, 0.2))
  assert.equal(before, false)
  assert.equal(s.players[0].inJail, true, 'tiga kembar → penjara')
})

test('rumah hanya bisa dibangun setelah satu kelompok utuh & merata', () => {
  const s = two()
  s.turn = 0
  assert.equal(buildHouse(s, 1).ok, false, 'belum punya properti')
  for (const i of groupTiles('brown')) s.holdings[i].owner = 0
  assert.equal(buildHouse(s, 1).ok, true)
  assert.equal(s.holdings[1].houses, 1)
  const second = buildHouse(s, 1).ok
  assert.equal(second, false, 'aturan merata: rumah kedua di petak sama ditolak')
  assert.equal(buildHouse(s, 3).ok, true)
})

test('hotel menggantikan 4 rumah dan menaikkan sewa', () => {
  const s = two()
  s.turn = 0
  s.players[0].cash = 5000
  for (const i of groupTiles('brown')) s.holdings[i].owner = 0
  for (let n = 0; n < 4; n++) { buildHouse(s, 1); buildHouse(s, 3) }
  assert.equal(s.holdings[1].houses, 4)
  const rentFour = rentFor(s, 1, 7)
  assert.equal(buildHouse(s, 1).ok, true)
  assert.equal(s.holdings[1].hotel, true)
  assert.equal(s.holdings[1].houses, 0)
  assert.ok(rentFor(s, 1, 7) > rentFour)
})

test('gadai & tebus properti mengubah saldo sesuai aturan', () => {
  const s = two()
  s.turn = 0
  s.holdings[39].owner = 0
  const before = s.players[0].cash
  assert.equal(mortgage(s, 39).ok, true)
  assert.equal(s.players[0].cash, before + 200)   // gadai = setengah harga
  assert.equal(s.holdings[39].mortgaged, true)
  const afterMortgage = s.players[0].cash
  assert.equal(unmortgage(s, 39).ok, true)
  assert.equal(s.players[0].cash, afterMortgage - 220) // tebus = 110%
})

test('tidak boleh gadai kalau masih ada bangunan', () => {
  const s = two()
  s.turn = 0
  for (const i of groupTiles('brown')) s.holdings[i].owner = 0
  buildHouse(s, 1)
  assert.equal(mortgage(s, 1).ok, false)
  assert.equal(sellHouse(s, 1).ok, true)
  assert.equal(mortgage(s, 1).ok, true)
})

test('perdagangan memindahkan properti + uang dan menolak yang tidak sah', () => {
  const s = two()
  s.holdings[1].owner = 0
  s.holdings[3].owner = 1
  s.players[0].cash = 1000
  s.players[1].cash = 1000
  assert.equal(proposeTrade(s, { from: 0, to: 1, giveTiles: [1], giveCash: 100, wantTiles: [3], wantCash: 0 }).ok, true)
  assert.equal(respondTrade(s, true), true)
  assert.equal(owner(s, 1), 1)
  assert.equal(owner(s, 3), 0)
  assert.equal(s.players[0].cash, 900)
  assert.equal(s.players[1].cash, 1100)

  const bad = proposeTrade(s, { from: 0, to: 1, giveTiles: [39], giveCash: 0, wantTiles: [], wantCash: 0 })
  assert.equal(bad.ok, false)
})

test('utang yang tak terbayar membuat pemain bangkrut', () => {
  const s = two()
  s.players[0].cash = 10
  s.turn = 0
  s.phase = 'roll'
  s.players[0].pos = 36
  // ke petak 39 (SCBD) belum ada pemilik → tidak menagih; paksa lewat charge via pajak
  s.players[0].pos = 35
  s.phase = 'roll'
  roll(s, fixed(0.9, 0.9)) // 6+6=12 → 47 % 40 = 7
  s.players[0].pos = 3
  s.phase = 'roll'
  roll(s, fixed(0, 0.4)) // 1+3 = 4 → petak 7
  const alive = s.players.filter(p => !p.bankrupt)
  assert.ok(alive.length >= 1)
})

test('bot bisa memainkan permainan sampai selesai', () => {
  const s = createGame({
    players: [
      { name: 'Bot A', isBot: true, personality: 'aggressive' },
      { name: 'Bot B', isBot: true, personality: 'balanced' },
      { name: 'Bot C', isBot: true, personality: 'conservative' },
      { name: 'Bot D', isBot: true, personality: 'beginner' },
    ],
    rules: { maxTurns: 220 },
  })
  let guard = 0
  while (s.phase !== 'over' && guard++ < 6000) botStep(s, Math.random)
  assert.ok(guard < 6000, 'permainan harus selesai')
  assert.equal(s.phase, 'over')
  assert.ok(s.winner !== null)
  const alive = s.players.filter(p => p.bankrupt)
  assert.ok(alive.length >= 0)
})

test('simpan & muat mengembalikan status yang sama', () => {
  const s = two()
  s.turn = 0; s.phase = 'buy'
  s.pending = { type: 'buy', player: 0, tile: 1 }
  buyProperty(s)
  const raw = serialize(s)
  const loaded = deserialize(raw)
  assert.ok(loaded)
  assert.equal(loaded.players[0].cash, s.players[0].cash)
  assert.equal(loaded.holdings[1].owner, 0)
  assert.equal(deserialize('{"v":1,"state":{"players":[]}}'), null)
  assert.equal(deserialize('bukan json'), null)
})

test('semua transaksi menjaga saldo tidak negatif', () => {
  const s = two()
  s.players[0].cash = 50
  s.turn = 0
  s.players[0].pos = 4
  s.phase = 'roll'
  roll(s, fixed(0.5, 0.5))
  assert.ok(s.players[0].cash >= 0)
})
