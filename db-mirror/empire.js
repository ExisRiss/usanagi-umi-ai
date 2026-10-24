/**
 * PROPERTY EMPIRE — mesin permainan papan properti 40 petak.
 *
 * Modul ini murni logika (tanpa DOM) supaya bisa diuji di Node dan dipakai
 * langsung oleh halaman /empire. Semua uang bergerak lewat helper `pay()` /
 * `receive()` sehingga tidak ada saldo yang berubah karena tampilan.
 *
 * Istilah status (`state.phase`):
 *   roll    — pemain giliran harus melempar dadu
 *   buy     — sedang ditawari membeli petak (beli / lelang)
 *   auction — lelang berjalan (state.auction)
 *   debt    — harus menutup utang (gadai / jual bangunan)
 *   end     — boleh mengakhiri giliran
 *   over    — permainan selesai
 */

export const VERSION = 1
export const START_CASH = 1500
export const GO_SALARY = 200
export const JAIL_FINE = 50

export const GROUPS = {
  brown: { name: 'Cokelat', color: '#8b5a2b', houseCost: 50 },
  cyan: { name: 'Biru Muda', color: '#7fd3f7', houseCost: 50 },
  pink: { name: 'Merah Muda', color: '#d94ea6', houseCost: 100 },
  orange: { name: 'Oranye', color: '#f28c28', houseCost: 100 },
  red: { name: 'Merah', color: '#d7263d', houseCost: 150 },
  yellow: { name: 'Kuning', color: '#f5c518', houseCost: 150 },
  green: { name: 'Hijau', color: '#2e9e63', houseCost: 200 },
  blue: { name: 'Biru Tua', color: '#2f5bd8', houseCost: 200 },
}

/* Urutan 40 petak seperti papan properti klasik. */
export const BOARD = [
  { i: 0, name: 'MULAI', type: 'go', desc: 'Terima gaji setiap lewat' },
  { i: 1, name: 'Tanah Abang', type: 'prop', group: 'brown', price: 60, rents: [2, 10, 30, 90, 160, 250] },
  { i: 2, name: 'Dana Komunitas', type: 'chest' },
  { i: 3, name: 'Kwitang', type: 'prop', group: 'brown', price: 60, rents: [4, 20, 60, 180, 320, 450] },
  { i: 4, name: 'Pajak Penghasilan', type: 'tax', amount: 200 },
  { i: 5, name: 'Stasiun Gambir', type: 'railroad', price: 200 },
  { i: 6, name: 'Menteng', type: 'prop', group: 'cyan', price: 100, rents: [6, 30, 90, 270, 400, 550] },
  { i: 7, name: 'Kesempatan', type: 'chance' },
  { i: 8, name: 'Cikini', type: 'prop', group: 'cyan', price: 100, rents: [6, 30, 90, 270, 400, 550] },
  { i: 9, name: 'Senen', type: 'prop', group: 'cyan', price: 120, rents: [8, 40, 100, 300, 450, 600] },
  { i: 10, name: 'PENJARA', type: 'jail', desc: 'Hanya berkunjung' },
  { i: 11, name: 'Kemayoran', type: 'prop', group: 'pink', price: 140, rents: [10, 50, 150, 450, 625, 750] },
  { i: 12, name: 'Listrik PLN', type: 'utility', price: 150 },
  { i: 13, name: 'Sawah Besar', type: 'prop', group: 'pink', price: 140, rents: [10, 50, 150, 450, 625, 750] },
  { i: 14, name: 'Gambir', type: 'prop', group: 'pink', price: 160, rents: [12, 60, 180, 500, 700, 900] },
  { i: 15, name: 'Stasiun Senen', type: 'railroad', price: 200 },
  { i: 16, name: 'Kebon Sirih', type: 'prop', group: 'orange', price: 180, rents: [14, 70, 200, 550, 750, 950] },
  { i: 17, name: 'Dana Komunitas', type: 'chest' },
  { i: 18, name: 'Thamrin', type: 'prop', group: 'orange', price: 180, rents: [14, 70, 200, 550, 750, 950] },
  { i: 19, name: 'Sudirman', type: 'prop', group: 'orange', price: 200, rents: [16, 80, 220, 600, 800, 1000] },
  { i: 20, name: 'PARKIR BEBAS', type: 'park', desc: 'Istirahat sejenak' },
  { i: 21, name: 'Kuningan', type: 'prop', group: 'red', price: 220, rents: [18, 90, 250, 700, 875, 1050] },
  { i: 22, name: 'Kesempatan', type: 'chance' },
  { i: 23, name: 'Rasuna Said', type: 'prop', group: 'red', price: 220, rents: [18, 90, 250, 700, 875, 1050] },
  { i: 24, name: 'Setiabudi', type: 'prop', group: 'red', price: 240, rents: [20, 100, 300, 750, 925, 1100] },
  { i: 25, name: 'Stasiun Manggarai', type: 'railroad', price: 200 },
  { i: 26, name: 'Tebet', type: 'prop', group: 'yellow', price: 260, rents: [22, 110, 330, 800, 975, 1150] },
  { i: 27, name: 'Pancoran', type: 'prop', group: 'yellow', price: 260, rents: [22, 110, 330, 800, 975, 1150] },
  { i: 28, name: 'Air PAM', type: 'utility', price: 150 },
  { i: 29, name: 'Cawang', type: 'prop', group: 'yellow', price: 280, rents: [24, 120, 360, 850, 1025, 1200] },
  { i: 30, name: 'MASUK PENJARA', type: 'gotojail' },
  { i: 31, name: 'Kelapa Gading', type: 'prop', group: 'green', price: 300, rents: [26, 130, 390, 900, 1100, 1275] },
  { i: 32, name: 'Pluit', type: 'prop', group: 'green', price: 300, rents: [26, 130, 390, 900, 1100, 1275] },
  { i: 33, name: 'Dana Komunitas', type: 'chest' },
  { i: 34, name: 'Pantai Indah', type: 'prop', group: 'green', price: 320, rents: [28, 150, 450, 1000, 1200, 1400] },
  { i: 35, name: 'Stasiun Tanjung Priok', type: 'railroad', price: 200 },
  { i: 36, name: 'Kesempatan', type: 'chance' },
  { i: 37, name: 'Senayan', type: 'prop', group: 'blue', price: 350, rents: [35, 175, 500, 1100, 1300, 1500] },
  { i: 38, name: 'Pajak Barang Mewah', type: 'tax', amount: 100 },
  { i: 39, name: 'SCBD', type: 'prop', group: 'blue', price: 400, rents: [50, 200, 600, 1400, 1700, 2000] },
]

export const RAILROAD_RENT = [0, 25, 50, 100, 200]

/* ============================================================
 * KARTU
 * ============================================================ */
export const CHANCE = [
  { id: 'c1', text: 'Jalan-jalan ke MULAI. Terima gaji.', effect: { type: 'move', to: 0, salary: true } },
  { id: 'c2', text: 'Menang lomba makan kerupuk. Terima Rp100.', effect: { type: 'money', amount: 100 } },
  { id: 'c3', text: 'Investasi reksa dana gagal. Bayar Rp150.', effect: { type: 'money', amount: -150 } },
  { id: 'c4', text: 'Naik kereta malam ke Stasiun Gambir.', effect: { type: 'move', to: 5 } },
  { id: 'c5', text: 'Kena tilang ugal-ugalan. Bayar Rp50.', effect: { type: 'money', amount: -50 } },
  { id: 'c6', text: 'Kartu bebas penjara. Simpan sampai butuh.', effect: { type: 'getout' } },
  { id: 'c7', text: 'Mundur tiga petak.', effect: { type: 'moveBy', steps: -3 } },
  { id: 'c8', text: 'Masuk penjara! Langsung ke sel.', effect: { type: 'jail' } },
  { id: 'c9', text: 'Perbaikan atap rumah: bayar Rp25 per rumah, Rp100 per hotel.', effect: { type: 'repair', perHouse: 25, perHotel: 100 } },
  { id: 'c10', text: 'Kunjungan ke Air PAM. Bayar 10× dadu kalau sudah dimiliki.', effect: { type: 'move', to: 28 } },
  { id: 'c11', text: 'Gaji proyek sampingan. Terima Rp200.', effect: { type: 'money', amount: 200 } },
  { id: 'c12', text: 'Bayar iuran lingkungan Rp75.', effect: { type: 'money', amount: -75 } },
  { id: 'c13', text: 'Terima dividen Rp50 dari setiap pemain.', effect: { type: 'collectEach', amount: 50 } },
  { id: 'c14', text: 'Bayar traktiran Rp50 ke setiap pemain.', effect: { type: 'payEach', amount: 50 } },
  { id: 'c15', text: 'Lompat ke petak SCBD.', effect: { type: 'move', to: 39 } },
  { id: 'c16', text: 'Dapat warisan Rp250.', effect: { type: 'money', amount: 250 } },
]

export const CHEST = [
  { id: 'k1', text: 'Dana desa cair. Terima Rp100.', effect: { type: 'money', amount: 100 } },
  { id: 'k2', text: 'Sumbang kegiatan RT. Bayar Rp50.', effect: { type: 'money', amount: -50 } },
  { id: 'k3', text: 'Kartu bebas penjara. Simpan sampai butuh.', effect: { type: 'getout' } },
  { id: 'k4', text: 'Dapat pekerjaan sampingan. Terima Rp150.', effect: { type: 'money', amount: 150 } },
  { id: 'k5', text: 'Kembali ke MULAI untuk terima gaji.', effect: { type: 'move', to: 0, salary: true } },
  { id: 'k6', text: 'Bayar biaya rumah sakit Rp100.', effect: { type: 'money', amount: -100 } },
  { id: 'k7', text: 'Laba koperasi Rp200.', effect: { type: 'money', amount: 200 } },
  { id: 'k8', text: 'Bayar pajak kendaraan Rp75.', effect: { type: 'money', amount: -75 } },
  { id: 'k9', text: 'Masuk penjara karena salah paham.', effect: { type: 'jail' } },
  { id: 'k10', text: 'Renovasi: bayar Rp40 per rumah, Rp115 per hotel.', effect: { type: 'repair', perHouse: 40, perHotel: 115 } },
  { id: 'k11', text: 'Terima Rp25 dari setiap pemain.', effect: { type: 'collectEach', amount: 25 } },
  { id: 'k12', text: 'Bayar Rp25 ke setiap pemain.', effect: { type: 'payEach', amount: 25 } },
  { id: 'k13', text: 'Beasiswa anak. Terima Rp120.', effect: { type: 'money', amount: 120 } },
  { id: 'k14', text: 'Servis mobil Rp60.', effect: { type: 'money', amount: -60 } },
  { id: 'k15', text: 'Naik ke Stasiun Manggarai.', effect: { type: 'move', to: 25 } },
  { id: 'k16', text: 'Bonus tahunan Rp300.', effect: { type: 'money', amount: 300 } },
]

/* ============================================================
 * UTILITAS UMUM
 * ============================================================ */
const now = () => Date.now()

export function shuffle(list, rng = Math.random) {
  const a = list.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function tile(idx) { return BOARD[((idx % 40) + 40) % 40] }

export function log(state, text, kind = 'info') {
  state.log.push({ text, kind, at: now() })
  if (state.log.length > 250) state.log.splice(0, state.log.length - 250)
}

export function owner(state, idx) {
  const h = state.holdings[idx]
  return h && h.owner !== null && h.owner !== undefined ? h.owner : null
}

export function groupTiles(group) { return BOARD.filter(t => t.group === group).map(t => t.i) }

export function ownsGroup(state, playerIdx, group) {
  return groupTiles(group).every(i => owner(state, i) === playerIdx)
}

export function buildingCount(state, playerIdx) {
  let houses = 0, hotels = 0
  for (const h of Object.values(state.holdings)) {
    if (h.owner !== playerIdx) continue
    if (h.hotel) hotels++
    else houses += h.houses || 0
  }
  return { houses, hotels }
}

export function netWorth(state, playerIdx) {
  const p = state.players[playerIdx]
  if (!p || p.bankrupt) return 0
  let total = p.cash
  for (const [i, h] of Object.entries(state.holdings)) {
    if (h.owner !== playerIdx) continue
    const t = tile(Number(i))
    total += h.mortgaged ? Math.floor((t.price || 0) / 2) : (t.price || 0)
    if (h.hotel) total += h.hotelCost || 0
    else total += (h.houses || 0) * (h.houseCost || 0)
  }
  return total
}

export function mortgageValue(t) { return Math.floor((t.price || 0) / 2) }
export function unmortgageCost(t) { return Math.ceil((mortgageValue(t) * 11) / 10) }

export function rentFor(state, idx, diceTotal = 7) {
  const t = tile(idx)
  const o = owner(state, idx)
  if (o === null) return 0
  const h = state.holdings[idx]
  if (h.mortgaged) return 0
  if (t.type === 'prop') {
    if (h.hotel) return t.rents[5]
    if (h.houses > 0) return t.rents[Math.min(4, h.houses)]
    return ownsGroup(state, o, t.group) ? t.rents[0] * 2 : t.rents[0]
  }
  if (t.type === 'railroad') {
    const n = BOARD.filter(x => x.type === 'railroad' && owner(state, x.i) === o).length
    return RAILROAD_RENT[n] || 0
  }
  if (t.type === 'utility') {
    const n = BOARD.filter(x => x.type === 'utility' && owner(state, x.i) === o).length
    return (n >= 2 ? 10 : 4) * diceTotal
  }
  return 0
}

/* ============================================================
 * PEMBUATAN PERMAINAN
 * ============================================================ */
export function createGame(opts = {}) {
  const rules = Object.assign({
    startingCash: START_CASH,
    goSalary: GO_SALARY,
    jailFine: JAIL_FINE,
    auction: true,
    evenBuild: true,
    maxTurns: 0,
    currency: 'Rp',
    maxHouses: 4,
  }, opts.rules || {})
  const players = (opts.players || [
    { name: 'Kamu', isBot: false },
    { name: 'Bot Umi', isBot: true, personality: 'balanced' },
  ]).map((p, i) => ({
    id: i,
    name: String(p.name || `Pemain ${i + 1}`).slice(0, 18),
    isBot: !!p.isBot,
    personality: p.personality || 'balanced',
    color: ['#7ee787', '#7fd3f7', '#ffd166', '#f78fb3', '#c792ea', '#ffa94d'][i % 6],
    cash: rules.startingCash,
    pos: 0,
    inJail: false,
    jailTurns: 0,
    getOutCards: 0,
    bankrupt: false,
  }))
  const holdings = {}
  for (const t of BOARD) if (t.type === 'prop' || t.type === 'railroad' || t.type === 'utility') {
    holdings[t.i] = { owner: null, houses: 0, hotel: false, mortgaged: false, houseCost: t.group ? GROUPS[t.group].houseCost : 0 }
  }
  const state = {
    version: VERSION,
    rules,
    players,
    turn: 0,
    phase: 'roll',
    dice: [0, 0],
    doublesCount: 0,
    holdings,
    bank: { houses: 32, hotels: 12 },
    decks: { chance: shuffle(CHANCE.map(c => c.id)), chest: shuffle(CHEST.map(c => c.id)) },
    drawn: { chance: 0, chest: 0 },
    auction: null,
    trade: null,
    pending: null,
    lastCard: null,
    winner: null,
    log: [],
    startedAt: now(),
    turnCount: 0,
  }
  log(state, `🎲 Property Empire dimulai — ${players.length} pemain, modal awal ${rules.currency}${rules.startingCash}.`, 'good')
  return state
}

/* ============================================================
 * UANG
 * ============================================================ */
export function pay(state, from, to, amount, reason) {
  const payer = state.players[from]
  const receiver = to === null || to === 'bank' ? null : state.players[to]
  if (!payer || amount <= 0) return true
  if (payer.cash < amount) return false
  payer.cash -= amount
  if (receiver && !receiver.bankrupt) receiver.cash += amount
  if (reason) log(state, `${reason} (${state.rules.currency}${amount})`, 'money')
  return true
}

export function receive(state, idx, amount, reason) {
  const p = state.players[idx]
  if (!p || amount <= 0) return
  p.cash += amount
  if (reason) log(state, `${reason} (+${state.rules.currency}${amount})`, 'money')
}

/** Menagih pemain; kalau uang kurang → fase debt / bangkrut. */
function charge(state, playerIdx, amount, creditor, reason) {
  const p = state.players[playerIdx]
  if (amount <= 0) return true
  if (p.cash >= amount) {
    p.cash -= amount
    if (creditor !== null && creditor !== 'bank' && state.players[creditor] && !state.players[creditor].bankrupt) {
      state.players[creditor].cash += amount
    }
    log(state, `${reason} — ${p.name} bayar ${state.rules.currency}${amount}`, 'money')
    return true
  }
  const worth = netWorth(state, playerIdx)
  if (worth < amount) {
    bankrupt(state, playerIdx, creditor)
    return true
  }
  state.pending = { type: 'debt', player: playerIdx, amount, creditor: creditor === undefined ? 'bank' : creditor, reason }
  state.phase = 'debt'
  log(state, `⚠️ ${p.name} harus menyiapkan ${state.rules.currency}${amount} (${reason}). Jual bangunan atau gadai properti.`, 'warn')
  return false
}

export function payDebt(state) {
  const d = state.pending
  if (!d || d.type !== 'debt') return false
  const p = state.players[d.player]
  if (p.cash < d.amount) return false
  p.cash -= d.amount
  if (d.creditor !== 'bank' && state.players[d.creditor] && !state.players[d.creditor].bankrupt) state.players[d.creditor].cash += d.amount
  log(state, `✅ ${p.name} melunasi ${state.rules.currency}${d.amount}`, 'money')
  state.pending = null
  state.phase = 'end'
  return true
}

export function bankrupt(state, playerIdx, creditor) {
  const p = state.players[playerIdx]
  if (!p || p.bankrupt) return
  p.bankrupt = true
  const receiver = creditor !== null && creditor !== 'bank' && state.players[creditor] && !state.players[creditor].bankrupt ? state.players[creditor] : null
  log(state, `💥 ${p.name} BANGKRUT${receiver ? ` — seluruh aset pindah ke ${receiver.name}` : ' — aset kembali ke bank'}.`, 'bad')
  for (const [i, h] of Object.entries(state.holdings)) {
    if (h.owner !== playerIdx) continue
    if (receiver) {
      h.owner = receiver.id
      if (h.houses || h.hotel) { state.bank.houses += h.houses || 0; state.bank.hotels += h.hotel ? 1 : 0; h.houses = 0; h.hotel = false }
    } else {
      state.bank.houses += h.houses || 0
      state.bank.hotels += h.hotel ? 1 : 0
      h.owner = null; h.houses = 0; h.hotel = false; h.mortgaged = false
    }
  }
  if (receiver) receiver.cash += p.cash
  p.cash = 0
  if (state.auction) state.auction.active = state.auction.active.filter(i => i !== playerIdx)
  const wasTurn = state.turn === playerIdx
  state.pending = null
  if (checkWinner(state)) return
  if (wasTurn) { nextTurn(state); return }
  state.phase = 'end'
}

function checkWinner(state) {
  const alive = state.players.filter(p => !p.bankrupt)
  if (alive.length <= 1) {
    state.phase = 'over'
    state.winner = alive[0] ? alive[0].id : null
    if (alive[0]) log(state, `🏆 ${alive[0].name} menang! Sisa aset ${state.rules.currency}${netWorth(state, alive[0].id)}.`, 'good')
    return true
  }
  return false
}

export function alivePlayers(state) { return state.players.filter(p => !p.bankrupt) }

/* ============================================================
 * DADU & GILIRAN
 * ============================================================ */
export function rollDie(rng = Math.random) { return 1 + Math.floor(rng() * 6) }

export function roll(state, rng = Math.random) {
  if (state.phase !== 'roll') return false
  const p = state.players[state.turn]
  if (!p || p.bankrupt) { nextTurn(state); return false }
  const d1 = rollDie(rng), d2 = rollDie(rng)
  state.dice = [d1, d2]
  const total = d1 + d2
  const doubles = d1 === d2
  log(state, `🎲 ${p.name} melempar ${d1} + ${d2} = ${total}${doubles ? ' (kembar!)' : ''}`)

  if (p.inJail) return jailRoll(state, total, doubles)

  if (doubles) {
    state.doublesCount++
    if (state.doublesCount >= 3) {
      log(state, `🚔 Tiga kali kembar berturut-turut — ${p.name} masuk penjara.`, 'bad')
      sendToJail(state, state.turn)
      state.doublesCount = 0
      return true
    }
  } else state.doublesCount = 0

  moveBy(state, state.turn, total)
  resolveLanding(state, state.turn, { doubles, total })
  return true
}

function jailRoll(state, total, doubles) {
  const p = state.players[state.turn]
  p.jailTurns++
  if (doubles) {
    p.inJail = false; p.jailTurns = 0
    log(state, `🔓 ${p.name} keluar penjara dengan dadu kembar.`, 'good')
    moveBy(state, state.turn, total)
    resolveLanding(state, state.turn, { doubles: false, total })
    return true
  }
  if (p.jailTurns >= 3) {
    const fine = state.rules.jailFine
    if (!charge(state, state.turn, fine, 'bank', `Denda penjara ${p.name}`)) return true
    p.inJail = false; p.jailTurns = 0
    log(state, `🔓 ${p.name} membayar denda dan keluar penjara.`, 'good')
    moveBy(state, state.turn, total)
    resolveLanding(state, state.turn, { doubles: false, total })
    return true
  }
  log(state, `🔒 ${p.name} masih di penjara (percobaan ${p.jailTurns}/3).`, 'warn')
  state.phase = 'end'
  return true
}

export function payJailFine(state) {
  const p = state.players[state.turn]
  if (!p || !p.inJail) return false
  if (!charge(state, state.turn, state.rules.jailFine, 'bank', `${p.name} bayar denda penjara`)) return false
  p.inJail = false; p.jailTurns = 0
  log(state, `🔓 ${p.name} bebas dari penjara.`, 'good')
  state.phase = 'roll'
  return true
}

export function useJailCard(state) {
  const p = state.players[state.turn]
  if (!p || !p.inJail || p.getOutCards <= 0) return false
  p.getOutCards--
  p.inJail = false; p.jailTurns = 0
  log(state, `🎫 ${p.name} memakai kartu bebas penjara.`, 'good')
  state.phase = 'roll'
  return true
}

export function sendToJail(state, playerIdx) {
  const p = state.players[playerIdx]
  p.pos = 10
  p.inJail = true
  p.jailTurns = 0
  state.doublesCount = 0
  log(state, `🚔 ${p.name} masuk penjara.`, 'bad')
  if (state.turn === playerIdx) state.phase = 'end'
}

export function moveBy(state, playerIdx, steps) {
  const p = state.players[playerIdx]
  const before = p.pos
  let pos = p.pos + steps
  if (steps > 0 && pos >= 40) {
    const times = Math.floor(pos / 40)
    p.pos = pos % 40
    receive(state, playerIdx, state.rules.goSalary * times, `${p.name} melewati MULAI`)
    if (pos % 40 === 0) log(state, `🟢 ${p.name} berhenti tepat di MULAI.`, 'good')
  } else {
    p.pos = ((pos % 40) + 40) % 40
  }
  if (steps !== 0 && p.pos !== before) log(state, `➡️ ${p.name} ke petak ${p.pos} — ${tile(p.pos).name}`)
  return p.pos
}

/* ============================================================
 * RESOLUSI PETAK
 * ============================================================ */
export function resolveLanding(state, playerIdx, opts = {}) {
  const p = state.players[playerIdx]
  const t = tile(p.pos)
  const diceTotal = opts.total || (state.dice[0] + state.dice[1]) || 7
  state.phase = 'end'

  if (t.type === 'go') { receive(state, playerIdx, state.rules.goSalary, `${p.name} berhenti di MULAI`); return }
  if (t.type === 'tax') { charge(state, playerIdx, t.amount, 'bank', `Pajak ${t.name}`); return }
  if (t.type === 'gotojail') { sendToJail(state, playerIdx); return }
  if (t.type === 'jail') { log(state, `🚶 ${p.name} hanya berkunjung ke penjara.`); return }
  if (t.type === 'park') { log(state, `🅿️ ${p.name} istirahat di Parkir Bebas.`); return }
  if (t.type === 'chance') { drawCard(state, playerIdx, 'chance'); return }
  if (t.type === 'chest') { drawCard(state, playerIdx, 'chest'); return }

  /* properti / kereta / utilitas */
  const h = state.holdings[t.i]
  if (!h || h.owner === null) {
    state.pending = { type: 'buy', player: playerIdx, tile: t.i }
    state.phase = 'buy'
    log(state, `❓ ${t.name} belum ada pemilik — beli ${state.rules.currency}${t.price}?`, 'warn')
    return
  }
  if (h.owner === playerIdx) { log(state, `🏠 ${p.name} mendarat di propertinya sendiri (${t.name}).`); return }
  if (h.mortgaged) { log(state, `🔒 ${t.name} sedang digadaikan — tidak ada sewa.`); return }
  const rent = rentFor(state, t.i, diceTotal)
  const landlord = state.players[h.owner]
  log(state, `💸 ${p.name} mendarat di ${t.name} milik ${landlord.name} — sewa ${state.rules.currency}${rent}.`, 'money')
  charge(state, playerIdx, rent, h.owner, `Sewa ${t.name}`)
}

/* ============================================================
 * PEMBELIAN & LELANG
 * ============================================================ */
export function buyProperty(state) {
  const pend = state.pending
  if (!pend || pend.type !== 'buy') return false
  const t = tile(pend.tile)
  const p = state.players[pend.player]
  if (state.holdings[pend.tile].owner !== null) return false
  if (p.cash < t.price) {
    log(state, `❌ Uang ${p.name} tidak cukup untuk membeli ${t.name}.`, 'bad')
    return false
  }
  p.cash -= t.price
  state.holdings[pend.tile].owner = p.id
  log(state, `🏷️ ${p.name} membeli ${t.name} seharga ${state.rules.currency}${t.price}.`, 'good')
  state.pending = null
  state.phase = 'end'
  return true
}

export function declineProperty(state) {
  const pend = state.pending
  if (!pend || pend.type !== 'buy') return false
  const t = tile(pend.tile)
  state.pending = null
  if (state.rules.auction) {
    log(state, `🔨 ${state.players[pend.player].name} menolak membeli ${t.name} — dilelang!`, 'warn')
    startAuction(state, pend.tile, pend.player)
  } else {
    state.phase = 'end'
  }
  return true
}

export function startAuction(state, tileIdx, starter) {
  const active = alivePlayers(state).map(p => p.id)
  if (!active.length) { state.phase = 'end'; return }
  let start = Number.isInteger(starter) ? starter : state.turn
  let idx = active.indexOf(start)
  idx = idx === -1 ? 0 : (idx + 1) % active.length
  state.auction = { tile: tileIdx, active, turn: active[idx], bid: 0, high: null, highBidder: null, round: 1 }
  state.phase = 'auction'
  log(state, `🔨 Lelang ${tile(tileIdx).name} dimulai — penawaran pertama ${state.players[state.auction.turn].name}.`, 'warn')
}

export function auctionCurrent(state) {
  const a = state.auction
  if (!a) return null
  if (!a.active.length) return null
  if (!a.active.includes(a.turn)) a.turn = a.active[0]
  return a.turn
}

export function auctionBid(state, playerIdx, amount) {
  const a = state.auction
  if (!a) return false
  if (playerIdx !== auctionCurrent(state)) return false
  const p = state.players[playerIdx]
  const value = Math.floor(amount)
  if (!Number.isFinite(value) || value <= a.bid || value > p.cash) return false
  a.bid = value
  a.high = value
  a.highBidder = playerIdx
  log(state, `🔨 ${p.name} menawar ${state.rules.currency}${value}.`)
  auctionAdvance(state)
  return true
}

export function auctionPass(state, playerIdx) {
  const a = state.auction
  if (!a) return false
  const who = playerIdx === undefined ? auctionCurrent(state) : playerIdx
  if (who !== auctionCurrent(state) && playerIdx !== undefined) return false
  const p = state.players[who]
  const stillBidder = a.highBidder === who
  a.active = a.active.filter(i => i !== who)
  log(state, `🔨 ${p.name} lewat.`)
  if (a.active.length === 0 || (a.highBidder !== null && a.active.length === 1 && a.active[0] === a.highBidder)) {
    return auctionFinish(state)
  }
  /* kalau yang masih aktif cuma satu dan dia belum menawar, tetap butuh satu putaran */
  const next = a.active.find(i => i !== a.highBidder) ?? a.active[0]
  a.turn = stillBidder ? a.active[0] : next
  a.round++
  return true
}

function auctionAdvance(state) {
  const a = state.auction
  if (!a) return
  if (a.active.length === 1 && a.highBidder !== null) return auctionFinish(state)
  const idx = a.active.indexOf(a.turn)
  a.turn = a.active[(idx + 1) % a.active.length]
  a.round++
}

function auctionFinish(state) {
  const a = state.auction
  state.auction = null
  state.phase = 'end'
  if (a.highBidder === null) {
    log(state, `🔨 Tidak ada penawar untuk ${tile(a.tile).name}.`, 'warn')
    return true
  }
  const p = state.players[a.highBidder]
  p.cash -= a.bid
  state.holdings[a.tile].owner = p.id
  log(state, `🔨 ${p.name} memenangkan lelang ${tile(a.tile).name} seharga ${state.rules.currency}${a.bid}.`, 'good')
  return true
}

/* ============================================================
 * BANGUNAN & GADAI
 * ============================================================ */
export function canBuild(state, playerIdx, idx) {
  const t = tile(idx)
  const h = state.holdings[idx]
  if (!h || h.owner !== playerIdx) return 'Bukan propertimu.'
  if (t.type !== 'prop') return 'Hanya properti tanah yang bisa dibangun.'
  if (h.mortgaged) return 'Properti sedang digadaikan.'
  if (!ownsGroup(state, playerIdx, t.group)) return 'Harus memiliki seluruh kelompok warna.'
  if (groupTiles(t.group).some(i => state.holdings[i].mortgaged)) return 'Ada properti kelompok yang digadaikan.'
  if (h.hotel) return 'Sudah ada hotel.'
  const cost = GROUPS[t.group].houseCost
  if (state.players[playerIdx].cash < cost) return 'Uang tidak cukup.'
  if (h.houses >= state.rules.maxHouses) {
    if (state.bank.hotels <= 0) return 'Bank kehabisan hotel.'
  } else if (state.bank.houses <= 0) return 'Bank kehabisan rumah.'
  if (state.rules.evenBuild) {
    const sizes = groupTiles(t.group).map(i => state.holdings[i].houses || 0)
    if (h.houses > Math.min(...sizes)) return 'Bangunan harus merata di kelompok warna.'
  }
  return null
}

export function buildHouse(state, idx) {
  const p = state.players[state.turn]
  const err = canBuild(state, p.id, idx)
  if (err) return { ok: false, error: err }
  const t = tile(idx)
  const h = state.holdings[idx]
  const cost = GROUPS[t.group].houseCost
  p.cash -= cost
  if (h.houses >= state.rules.maxHouses) {
    h.hotel = true
    h.houses = 0
    state.bank.houses += state.rules.maxHouses
    state.bank.hotels--
    log(state, `🏨 ${p.name} membangun HOTEL di ${t.name} (${state.rules.currency}${cost}).`, 'good')
  } else {
    h.houses++
    state.bank.houses--
    log(state, `🏠 ${p.name} membangun rumah ke-${h.houses} di ${t.name} (${state.rules.currency}${cost}).`, 'good')
  }
  return { ok: true }
}

export function sellHouse(state, idx) {
  const p = state.players[state.turn]
  const t = tile(idx)
  const h = state.holdings[idx]
  if (!h || h.owner !== p.id) return { ok: false, error: 'Bukan propertimu.' }
  if (!h.hotel && !h.houses) return { ok: false, error: 'Tidak ada bangunan.' }
  const cost = GROUPS[t.group].houseCost
  const refund = Math.floor(cost / 2)
  if (h.hotel) {
    h.hotel = false
    state.bank.hotels++
    if (state.bank.houses >= state.rules.maxHouses) { state.bank.houses -= state.rules.maxHouses; h.houses = state.rules.maxHouses }
    else h.houses = 0
  } else { h.houses--; state.bank.houses++ }
  p.cash += refund
  log(state, `🏚️ ${p.name} menjual bangunan di ${t.name} (+${state.rules.currency}${refund}).`, 'money')
  return { ok: true }
}

export function mortgage(state, idx) {
  const p = state.players[state.turn]
  const h = state.holdings[idx]
  const t = tile(idx)
  if (!h || h.owner !== p.id) return { ok: false, error: 'Bukan propertimu.' }
  if (h.mortgaged) return { ok: false, error: 'Sudah digadaikan.' }
  if (h.houses || h.hotel) return { ok: false, error: 'Jual bangunannya dulu.' }
  h.mortgaged = true
  p.cash += mortgageValue(t)
  log(state, `🏦 ${p.name} menggadaikan ${t.name} (+${state.rules.currency}${mortgageValue(t)}).`, 'money')
  return { ok: true }
}

export function unmortgage(state, idx) {
  const p = state.players[state.turn]
  const h = state.holdings[idx]
  const t = tile(idx)
  if (!h || h.owner !== p.id) return { ok: false, error: 'Bukan propertimu.' }
  if (!h.mortgaged) return { ok: false, error: 'Tidak sedang digadaikan.' }
  const cost = unmortgageCost(t)
  if (p.cash < cost) return { ok: false, error: 'Uang tidak cukup.' }
  p.cash -= cost
  h.mortgaged = false
  log(state, `🏦 ${p.name} menebus ${t.name} (-${state.rules.currency}${cost}).`, 'money')
  return { ok: true }
}

/* ============================================================
 * KARTU
 * ============================================================ */
export function drawCard(state, playerIdx, deckName) {
  const deckIds = state.decks[deckName]
  const pile = deckName === 'chance' ? CHANCE : CHEST
  const id = deckIds.shift()
  deckIds.push(id)
  const card = pile.find(c => c.id === id) || pile[0]
  state.lastCard = { deck: deckName, id: card.id, text: card.text, player: playerIdx }
  log(state, `🃏 ${state.players[playerIdx].name} → ${card.text}`, 'card')
  applyCard(state, playerIdx, card)
  return card
}

export function applyCard(state, playerIdx, card) {
  const p = state.players[playerIdx]
  const eff = card.effect || {}
  if (eff.type === 'money') {
    if (eff.amount >= 0) receive(state, playerIdx, eff.amount)
    else charge(state, playerIdx, -eff.amount, 'bank', card.text)
  } else if (eff.type === 'move') {
    const target = eff.to
    if (target <= p.pos && eff.salary !== false) {
      /* melewati start → gaji */
      moveBy(state, playerIdx, (40 - p.pos) + target)
    } else if (target === 0) {
      p.pos = 0
      receive(state, playerIdx, state.rules.goSalary, `${p.name} kembali ke MULAI`)
      log(state, `➡️ ${p.name} ke petak 0 — MULAI`)
    } else {
      p.pos = target
      log(state, `➡️ ${p.name} dipindah ke ${target} — ${tile(target).name}`)
    }
    resolveLanding(state, playerIdx, { total: 7 })
  } else if (eff.type === 'moveBy') {
    moveBy(state, playerIdx, eff.steps)
    resolveLanding(state, playerIdx, { total: 7 })
  } else if (eff.type === 'jail') {
    sendToJail(state, playerIdx)
    state.phase = 'end'
  } else if (eff.type === 'getout') {
    p.getOutCards++
  } else if (eff.type === 'repair') {
    let houses = 0, hotels = 0
    for (const [i, h] of Object.entries(state.holdings)) {
      if (h.owner !== playerIdx) continue
      if (h.hotel) hotels++
      else houses += h.houses || 0
    }
    const amount = houses * eff.perHouse + hotels * eff.perHotel
    if (amount > 0) charge(state, playerIdx, amount, 'bank', 'Biaya perbaikan bangunan')
  } else if (eff.type === 'collectEach') {
    for (const other of state.players) {
      if (other.id === playerIdx || other.bankrupt) continue
      const give = Math.min(other.cash, eff.amount)
      other.cash -= give
      p.cash += give
    }
    log(state, `💵 ${p.name} menerima ${state.rules.currency}${eff.amount} dari tiap pemain.`, 'money')
  } else if (eff.type === 'payEach') {
    for (const other of state.players) {
      if (other.id === playerIdx || other.bankrupt) continue
      const give = Math.min(p.cash, eff.amount)
      p.cash -= give
      other.cash += give
    }
    log(state, `💸 ${p.name} membayar ${state.rules.currency}${eff.amount} ke tiap pemain.`, 'money')
  }
}

/* ============================================================
 * PERDAGANGAN
 * ============================================================ */
export function proposeTrade(state, offer) {
  const from = Number(offer.from), to = Number(offer.to)
  const a = state.players[from], b = state.players[to]
  if (!a || !b || a.bankrupt || b.bankrupt || from === to) return { ok: false, error: 'Pemain tidak valid.' }
  const giveTiles = (offer.giveTiles || []).map(Number)
  const wantTiles = (offer.wantTiles || []).map(Number)
  for (const i of giveTiles) if (owner(state, i) !== from) return { ok: false, error: `Kamu tidak memiliki petak ${i}.` }
  for (const i of wantTiles) if (owner(state, i) !== to) return { ok: false, error: `Lawan tidak memiliki petak ${i}.` }
  for (const i of [...giveTiles, ...wantTiles]) {
    const h = state.holdings[i]
    if (h.houses || h.hotel) return { ok: false, error: 'Jual bangunan pada properti yang ditukar dulu.' }
  }
  const giveCash = Math.max(0, Math.floor(Number(offer.giveCash) || 0))
  const wantCash = Math.max(0, Math.floor(Number(offer.wantCash) || 0))
  if (giveCash > a.cash) return { ok: false, error: 'Uang yang kamu tawarkan melebihi saldo.' }
  if (wantCash > b.cash) return { ok: false, error: 'Uang yang diminta melebihi saldo lawan.' }
  state.trade = { from, to, giveTiles, wantTiles, giveCash, wantCash, status: 'pending' }
  state.phase = 'trade'
  log(state, `🤝 ${a.name} menawarkan tukar properti ke ${b.name}.`, 'warn')
  return { ok: true }
}

export function respondTrade(state, accept) {
  const t = state.trade
  if (!t) return false
  if (!accept) {
    state.trade = null
    state.phase = 'end'
    log(state, '🤝 Tawaran tukar ditolak.', 'warn')
    return false
  }
  const a = state.players[t.from], b = state.players[t.to]
  if (t.giveCash > a.cash || t.wantCash > b.cash) {
    state.trade = null; state.phase = 'end'
    log(state, '❌ Tukar gagal — saldo berubah.', 'bad')
    return false
  }
  for (const i of t.giveTiles) if (owner(state, i) !== t.from) { state.trade = null; state.phase = 'end'; return false }
  for (const i of t.wantTiles) if (owner(state, i) !== t.to) { state.trade = null; state.phase = 'end'; return false }
  a.cash += t.wantCash - t.giveCash
  b.cash += t.giveCash - t.wantCash
  for (const i of t.giveTiles) state.holdings[i].owner = t.to
  for (const i of t.wantTiles) state.holdings[i].owner = t.from
  log(state, '🤝 Tukar properti disetujui!', 'good')
  state.trade = null
  state.phase = 'end'
  return true
}


/** Bot memutuskan tawaran tukar yang masuk (dipakai UI & botStep). */
export function botConsiderTrade(state) {
  const t = state.trade
  if (!t) return false
  const bot = state.players[t.to]
  if (!bot || !bot.isBot) return false
  const style = bot.personality || 'balanced'
  const valueOf = (i) => {
    const h = state.holdings[i]
    let v = tile(i).price
    if (tile(i).type === 'prop' && ownsGroup(state, t.from, tile(i).group)) v *= 1.15
    if (tile(i).type === 'prop' && ownsGroup(state, t.to, tile(i).group) === false && state.holdings[i].owner === null) v *= 1
    if (h) {
      if (!h.mortgaged) v += (h.houses || 0) * (h.houseCost || 0)
      if (h.hotel) v += (h.houseCost || 0) * 5
    }
    return v
  }
  const gain = t.giveTiles.reduce((sum, i) => sum + valueOf(i), 0) + t.giveCash
  const lose = t.wantTiles.reduce((sum, i) => sum + valueOf(i), 0) + t.wantCash
  const threshold = style === 'aggressive' ? 1.0 : style === 'conservative' ? 1.35 : style === 'beginner' ? 1.2 : 1.12
  /* jangan mau kehilangan properti yang melengkapi kelompok warna lawan */
  let block = false
  for (const i of t.wantTiles) {
    const tt = tile(i)
    if (tt.group && ownsGroup(state, t.to, tt.group)) block = true
  }
  const accept = !block && gain >= lose * threshold && (bot.cash + t.giveCash - t.wantCash) >= 0
  respondTrade(state, accept)
  return accept
}

/* ============================================================
 * AKHIR GILIRAN
 * ============================================================ */
export function endTurn(state) {
  if (state.phase === 'over') return
  if (state.phase === 'debt') return
  const p = state.players[state.turn]
  const doubled = state.dice[0] === state.dice[1] && !p.inJail && state.doublesCount > 0
  state.pending = null
  state.trade = null
  state.dice = [0, 0]
  if (doubled && !p.bankrupt) {
    state.phase = 'roll'
    log(state, `🎲 ${p.name} dapat dadu kembar — lempar lagi.`, 'good')
    return
  }
  nextTurn(state)
}

export function nextTurn(state) {
  state.pending = null
  state.trade = null
  state.dice = [0, 0]
  state.doublesCount = 0
  if (checkWinner(state)) return
  const limit = Number(state.rules.maxTurns) || 0
  if (limit > 0 && state.turnCount >= limit) {
    const ranking = summary(state)
    state.phase = 'over'
    state.winner = ranking[0] ? ranking[0].id : null
    log(state, `⏳ Batas ${limit} giliran tercapai — pemenang ditentukan dari total kekayaan: ${ranking[0] ? ranking[0].name : '-'}.`, 'good')
    return
  }
  let guard = 0
  do {
    state.turn = (state.turn + 1) % state.players.length
    guard++
  } while (state.players[state.turn].bankrupt && guard < 40)
  state.turnCount++
  state.phase = 'roll'
}

/* ============================================================
 * AI BOT
 * ============================================================ */
export function botStep(state, rng = Math.random) {
  if (state.phase === 'over') return false
  if (state.phase === 'trade' && state.trade && state.players[state.trade.to] && state.players[state.trade.to].isBot) {
    botConsiderTrade(state)
    return true
  }
  /* Lelang bisa berjalan walau yang punya giliran manusia: yang menjawab
   * adalah pemain yang sedang mendapat giliran menawar. */
  if (state.phase === 'auction') {
    const a = state.auction
    if (!a) { state.phase = 'end'; return true }
    const current = auctionCurrent(state)
    if (current === null) { auctionPass(state); return true }
    const bp = state.players[current]
    if (!bp || !bp.isBot) return false
    const t = tile(a.tile)
    const styleBid = bp.personality || 'balanced'
    const maxBid = Math.floor(t.price * (styleBid === 'aggressive' ? 1.25 : styleBid === 'conservative' ? 0.6 : styleBid === 'balanced' ? 0.95 : 0.75))
    const nextBid = a.bid === 0 ? Math.max(10, Math.floor(t.price * 0.3)) : a.bid + Math.max(10, Math.round(a.bid * 0.1))
    if (nextBid <= maxBid && nextBid <= bp.cash - 50) auctionBid(state, current, nextBid)
    else auctionPass(state, current)
    return true
  }

  const p = state.players[state.turn]
  if (!p || !p.isBot || p.bankrupt) return false
  const style = p.personality || 'balanced'

  if (state.phase === 'roll') { roll(state, rng); return true }
  if (state.phase === 'buy') {
    const t = tile(state.pending.tile)
    const reserve = style === 'aggressive' ? 50 : style === 'conservative' ? 320 : style === 'balanced' ? 180 : 120
    const want = p.cash - t.price >= reserve
    if (want) buyProperty(state)
    else declineProperty(state)
    return true
  }
  if (state.phase === 'debt') {
    return botRaiseFunds(state, style)
  }
  if (state.phase === 'trade') return false
  if (state.phase === 'end') {
    botManage(state, p, style)
    endTurn(state)
    return true
  }
  return false
}

function botRaiseFunds(state, style) {
  const d = state.pending
  const idx = d.player
  const p = state.players[idx]
  /* jual bangunan dulu */
  for (const [i, h] of Object.entries(state.holdings)) {
    if (h.owner !== idx) continue
    if (h.houses || h.hotel) {
      h._tmpOwner = idx
      const prevTurn = state.turn
      state.turn = idx
      while ((state.holdings[i].houses || state.holdings[i].hotel) && p.cash < d.amount) sellHouse(state, Number(i))
      state.turn = prevTurn
      if (p.cash >= d.amount) return payDebt(state)
    }
  }
  /* gadai properti termurah dulu */
  const mine = Object.keys(state.holdings).map(Number).filter(i => state.holdings[i].owner === idx && !state.holdings[i].mortgaged && !state.holdings[i].houses && !state.holdings[i].hotel)
    .sort((a, b) => tile(a).price - tile(b).price)
  const prevTurn = state.turn
  state.turn = idx
  for (const i of mine) {
    if (p.cash >= d.amount) break
    mortgage(state, i)
  }
  state.turn = prevTurn
  if (p.cash >= d.amount) return payDebt(state)
  bankrupt(state, idx, d.creditor)
  return true
}

function botManage(state, p, style) {
  const groups = Object.keys(GROUPS)
  for (const g of groups) {
    if (!ownsGroup(state, p.id, g)) continue
    const tiles = groupTiles(g)
    const play = style === 'aggressive' ? 0.35 : style === 'balanced' ? 0.55 : 0.75
    let guard = 0
    const cost = GROUPS[g].houseCost
    const reserve = style === 'conservative' ? 350 : style === 'aggressive' ? 80 : 180
    while (guard++ < 16) {
      const cheapest = tiles.reduce((a, b) => (state.holdings[a].houses + (state.holdings[a].hotel ? 5 : 0)) <= (state.holdings[b].houses + (state.holdings[b].hotel ? 5 : 0)) ? a : b)
      if (p.cash - cost < reserve) break
      if (p.cash / (p.cash + 400) < (1 - play) * 0.5) break
      if (!buildHouse(state, cheapest).ok) break
    }
  }
  for (const [i, h] of Object.entries(state.holdings)) {
    if (h.owner !== p.id || !h.mortgaged) continue
    if (p.cash > (style === 'conservative' ? 600 : 350)) {
      const prev = state.turn; state.turn = p.id
      unmortgage(state, Number(i))
      state.turn = prev
    }
  }
}

/* ============================================================
 * SIMPAN / MUAT
 * ============================================================ */
export function serialize(state) {
  return JSON.stringify({ v: VERSION, state })
}

export function deserialize(raw) {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!parsed || parsed.v !== VERSION || !parsed.state) return null
    const s = parsed.state
    if (!Array.isArray(s.players) || !s.holdings || !BOARD[s.players[0]?.pos ?? 0]) return null
    if (typeof s.turn !== 'number' || !s.phase) return null
    return s
  } catch { return null }
}

/* Ringkasan aset untuk panel akhir permainan. */
export function summary(state) {
  return state.players.map(p => {
    const tiles = Object.keys(state.holdings).map(Number).filter(i => state.holdings[i].owner === p.id)
    return {
      id: p.id,
      name: p.name,
      cash: p.cash,
      bankrupt: p.bankrupt,
      properties: tiles.length,
      houses: tiles.reduce((s, i) => s + (state.holdings[i].hotel ? 0 : state.holdings[i].houses), 0),
      hotels: tiles.reduce((s, i) => s + (state.holdings[i].hotel ? 1 : 0), 0),
      netWorth: netWorth(state, p.id),
    }
  }).sort((a, b) => b.netWorth - a.netWorth)
}

export const BOT_PERSONALITIES = [
  { id: 'beginner', name: 'Pemula', desc: 'Mudah menyerah, jarang bangun rumah' },
  { id: 'balanced', name: 'Seimbang', desc: 'Beli & bangun secukupnya' },
  { id: 'aggressive', name: 'Agresif', desc: 'Berani beli & lelang tinggi' },
  { id: 'conservative', name: 'Ekonomis', desc: 'Simpan uang, tunggu aman' },
]
