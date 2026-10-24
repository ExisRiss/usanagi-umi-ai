/**
 * UI Property Empire — memakai mesin murni di ./engine.js.
 * Semua uang & aturan tetap di mesin; berkas ini hanya tampilan + alur giliran.
 */
import * as E from './engine.js'

/* ============================================================
 * 0. UTIL
 * ============================================================ */
const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]
const cur = () => S ? S.rules.currency : 'Rp'
const fmt = (n) => cur() + Math.round(n).toLocaleString('id-ID')
const isBot = (i) => !!(S && S.players[i] && S.players[i].isBot)
const isHuman = (i) => !isBot(i)
const clamp = (n, a, b) => Math.max(a, Math.min(b, n))
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

const SAVE_KEY = 'umi-empire-save-v1'
const SET_KEY = 'umi-empire-settings-v1'

let S = null
let busy = false
let modalKind = null
let botTimer = null
let gameOverShown = false
let lastCardKey = ''
let selTile = null
let settings = { sound: true, speed: 'normal' }
let animPos = {}
let flashTile = -1

const SPEEDS = { slow: 900, normal: 520, fast: 220 }

/* ============================================================
 * 1. SUARA
 * ============================================================ */
const SFX = (() => {
  let ctx = null
  const ensure = () => {
    if (!settings.sound) return null
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
      if (ctx.state === 'suspended') ctx.resume()
      return ctx
    } catch { return null }
  }
  const tone = (freq, dur = .12, type = 'sine', gain = .06, when = 0) => {
    const c = ensure(); if (!c) return
    const o = c.createOscillator(), g = c.createGain()
    o.type = type; o.frequency.value = freq
    o.connect(g); g.connect(c.destination)
    const t = c.currentTime + when
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(gain, t + .012)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.start(t); o.stop(t + dur + .02)
  }
  return {
    click: () => tone(520, .05, 'triangle', .035),
    dice: () => { tone(180, .06, 'square', .05); tone(240, .07, 'square', .04, .07); tone(150, .09, 'square', .045, .15) },
    step: () => tone(660, .035, 'triangle', .022),
    buy: () => { tone(523, .1, 'triangle', .06); tone(659, .12, 'triangle', .06, .09); tone(784, .16, 'triangle', .05, .19) },
    pay: () => { tone(300, .12, 'sawtooth', .04); tone(220, .16, 'sawtooth', .035, .1) },
    card: () => { tone(880, .08, 'sine', .05); tone(1174, .12, 'sine', .045, .07) },
    jail: () => { tone(160, .18, 'square', .05); tone(120, .24, 'square', .045, .16) },
    win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, .28, 'triangle', .06, i * .14)),
    lose: () => [392, 330, 262].forEach((f, i) => tone(f, .25, 'sine', .05, i * .16)),
  }
})()

/* ============================================================
 * 2. PETA PAPAN
 * ============================================================ */
function tileRC(i) {
  if (i <= 10) return { r: 11, c: 11 - i }
  if (i <= 20) return { r: 21 - i, c: 1 }
  if (i <= 30) return { r: 1, c: i - 19 }
  return { r: i - 29, c: 11 }
}

const GROUP_COLOR = {
  brown: '#8b5a2b', cyan: '#7fd3f7', pink: '#d94ea6', orange: '#f28c28',
  red: '#d7263d', yellow: '#f5c518', green: '#2e9e63', blue: '#2f5bd8',
}

const ICONS = {
  train: '<svg viewBox="0 0 24 24" fill="none"><rect x="5" y="3" width="14" height="14" rx="3" fill="#334155" stroke="#0f172a" stroke-width="1.2"/><rect x="7.5" y="5.5" width="9" height="5" rx="1.2" fill="#cfe6ff"/><circle cx="8.6" cy="14" r="1.5" fill="#facc15"/><circle cx="15.4" cy="14" r="1.5" fill="#facc15"/><path d="M7 19l-1.5 2.5M17 19l1.5 2.5M6 21h12" stroke="#334155" stroke-width="1.6" stroke-linecap="round"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none"><path d="M13 2 5 14h6l-1 8 8-12h-6l1-8Z" fill="#f5c518" stroke="#7a5c00" stroke-width="1.2" stroke-linejoin="round"/></svg>',
  water: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2.5c3.6 4.4 6.5 8 6.5 11.2A6.5 6.5 0 0 1 5.5 13.7C5.5 10.5 8.4 6.9 12 2.5Z" fill="#4fb0e0" stroke="#1c5f7e" stroke-width="1.2"/><path d="M9.2 13.6a2.8 2.8 0 0 0 2.8 2.8" stroke="#eaf7ff" stroke-width="1.3" stroke-linecap="round"/></svg>',
  chance: '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.2" fill="#a78bfa" stroke="#4c1d95" stroke-width="1.2"/><path d="M9.2 8.6c.2-2 1.6-3.1 3.3-3.1 1.9 0 3.2 1.2 3.2 2.9 0 1.4-.9 2.1-2 2.8-.9.6-1.2 1-1.2 1.9v.5" stroke="#fff" stroke-width="1.9" stroke-linecap="round" fill="none"/><circle cx="12.6" cy="17.3" r="1.3" fill="#fff"/></svg>',
  chest: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="8.5" width="18" height="11" rx="2.2" fill="#e2a33d" stroke="#7a4b10" stroke-width="1.2"/><path d="M3 12.5h18" stroke="#7a4b10" stroke-width="1.4"/><rect x="10.5" y="10.5" width="3" height="4.5" rx=".8" fill="#fdf3d0" stroke="#7a4b10" stroke-width="1"/><path d="M5 8.5C5 5.7 8.1 3.5 12 3.5s7 2.2 7 5" stroke="#7a4b10" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
  tax: '<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="3.5" width="16" height="17" rx="2.2" fill="#f7f3e6" stroke="#5b6b5f" stroke-width="1.2"/><path d="M7.5 8h9M7.5 11.5h9M7.5 15h5" stroke="#5b6b5f" stroke-width="1.4" stroke-linecap="round"/><circle cx="16.4" cy="16.6" r="3.3" fill="#e2493f"/><path d="M15 16.6h2.8M16.4 15.2v2.8" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/></svg>',
  bars: '<svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="3.5" width="17" height="17" rx="2.5" fill="#2b3445" stroke="#0f172a" stroke-width="1.2"/><path d="M7.5 5v14M12 5v14M16.5 5v14" stroke="#8ea0c0" stroke-width="2.1"/><rect x="3.5" y="10.2" width="17" height="3.4" fill="#ef4b5a" opacity=".85"/></svg>',
  police: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2.5 20 6v6.2c0 4.6-3.4 7.9-8 9.3-4.6-1.4-8-4.7-8-9.3V6l8-3.5Z" fill="#3b6fd4" stroke="#173a7a" stroke-width="1.2"/><path d="M12 7.6v8.2M8.4 11.7h7.2" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>',
  park: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="18" height="18" rx="3" fill="#3f7fd0" stroke="#17406e" stroke-width="1.2"/><path d="M9.4 17V7.4h4a3.1 3.1 0 0 1 0 6.2H9.4" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
  go: '<svg viewBox="0 0 24 24" fill="none"><path d="M4 12h13" stroke="#1f7a4d" stroke-width="2.6" stroke-linecap="round"/><path d="M12 6.6 19 12l-7 5.4" stroke="#1f7a4d" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M3.2 5.5v13" stroke="#c8881e" stroke-width="2.4" stroke-linecap="round"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none"><path d="M3.5 21V10L12 3.5 20.5 10v11h-6v-6h-5v6h-6Z" fill="#f2c14e" stroke="#7a5c00" stroke-width="1.2" stroke-linejoin="round"/></svg>',
}

function bandHTML(i) {
  const t = E.tile(i)
  if (t.type === 'prop') return `<div class="band" style="background:linear-gradient(180deg,${GROUP_COLOR[t.group]},${shade(GROUP_COLOR[t.group])})"><span class="houses"></span></div>`
  if (t.type === 'railroad') return `<div class="band" style="background:linear-gradient(180deg,#475569,#27313f)"><span class="houses"></span></div>`
  if (t.type === 'utility') return `<div class="band" style="background:linear-gradient(180deg,#3d7fa8,#255a7a)"><span class="houses"></span></div>`
  return ''
}

function shade(hex) {
  const n = parseInt(hex.slice(1), 16)
  const r = clamp((n >> 16) - 26, 0, 255), g = clamp(((n >> 8) & 255) - 26, 0, 255), b = clamp((n & 255) - 26, 0, 255)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function tileHTML(i) {
  const t = E.tile(i)
  const { r, c } = tileRC(i)
  const edge = r === 11 ? 'edge-bottom' : r === 1 ? 'edge-top' : c === 1 ? 'edge-left' : 'edge-right'
  const corner = i % 10 === 0
  let inner = ''
  if (t.type === 'prop') {
    inner = `${bandHTML(i)}<div class="body"><div class="nm">${esc(t.name)}</div><div class="pr">${fmt(t.price)}</div></div>`
  } else if (t.type === 'railroad' || t.type === 'utility') {
    inner = `${bandHTML(i)}<div class="body"><div class="nm">${esc(t.name)}</div><div class="pr">${fmt(t.price)}</div></div>`
  } else if (t.type === 'chance') {
    inner = `<div class="body"><div class="ico">${ICONS.chance}</div><div class="nm">KESEMPATAN</div></div>`
  } else if (t.type === 'chest') {
    inner = `<div class="body"><div class="ico">${ICONS.chest}</div><div class="nm">DANA KOMUNITAS</div></div>`
  } else if (t.type === 'tax') {
    inner = `<div class="body"><div class="ico">${ICONS.tax}</div><div class="nm">${esc(t.name)}</div><div class="pr">${fmt(t.amount)}</div></div>`
  } else if (t.type === 'go') {
    inner = `<div class="body"><div class="ico">${ICONS.go}</div><div class="nm">MULAI</div><div class="pr">+${fmt(S ? S.rules.goSalary : 200)}</div></div>`
  } else if (t.type === 'jail') {
    inner = `<div class="body"><div class="ico">${ICONS.bars}</div><div class="nm">PENJARA</div></div>`
  } else if (t.type === 'gotojail') {
    inner = `<div class="body"><div class="ico">${ICONS.police}</div><div class="nm">MASUK PENJARA</div></div>`
  } else if (t.type === 'park') {
    inner = `<div class="body"><div class="ico">${ICONS.park}</div><div class="nm">PARKIR BEBAS</div></div>`
  }
  return `<div class="tile ${corner ? 'corner' : ''} ${edge}" data-i="${i}" data-kind="${t.type}" style="grid-row:${r};grid-column:${c}" title="${esc(t.name)}">
    ${corner ? '' : '<span class="stripe" hidden></span>'}${inner}
  </div>`
}

/* ============================================================
 * 3. PAPAN
 * ============================================================ */
function buildBoard() {
  const tiles = $('#tiles')
  tiles.innerHTML = Array.from({ length: 40 }, (_, i) => tileHTML(i)).join('')
  tiles.addEventListener('click', (ev) => {
    const el = ev.target.closest('.tile')
    if (!el) return
    SFX.click()
    selectTile(Number(el.dataset.i), true)
  })
}

function selectTile(i, openPanel) {
  selTile = i
  $$('.tile').forEach(el => el.classList.toggle('sel', Number(el.dataset.i) === i))
  if (openPanel) openDetail(i)
}

function updateTiles() {
  if (!S) return
  $$('.tile').forEach(el => {
    const i = Number(el.dataset.i)
    const t = E.tile(i)
    const h = S.holdings[i]
    const own = h && h.owner !== null ? N(h.owner) : null
    el.classList.toggle('owned', !!own)
    if (own) el.style.setProperty('--own', S.players[h.owner].color)
    const stripe = el.querySelector('.stripe')
    if (stripe) { stripe.hidden = !own; if (own) stripe.style.background = S.players[h.owner].color }
    const houses = el.querySelector('.houses')
    if (houses) {
      if (!h) houses.innerHTML = ''
      else if (h.hotel) houses.innerHTML = '<i class="hh hotel"></i>'
      else houses.innerHTML = h.houses ? Array.from({ length: h.houses }, () => '<i class="hh"></i>').join('') : ''
    }
    let mq = el.querySelector('.mq')
    if (h && h.mortgaged && !mq) { mq = document.createElement('div'); mq.className = 'mq'; el.appendChild(mq) }
    if ((!h || !h.mortgaged) && mq) mq.remove()
  })
}

const N = (v) => (v === null || v === undefined ? '' : v)

/* ============================================================
 * 4. PION
 * ============================================================ */
function pawnSVG(color) {
  return `<svg viewBox="0 0 24 30" aria-hidden="true">
    <ellipse cx="12" cy="26.4" rx="8.6" ry="2.7" fill="${color}" opacity=".9" stroke="rgba(0,0,0,.5)" stroke-width="1"/>
    <path d="M12 2.2c2.3 0 4.1 1.8 4.1 4.1 0 1.5-.8 2.8-2 3.5 3 1.4 5.1 4.4 5.1 7.9 0 3.7-1 6.1-2.3 7.5H7.1C5.8 23.7 4.8 21.3 4.8 17.7c0-3.5 2.1-6.5 5.1-7.9a4.1 4.1 0 0 1-2-3.5c0-2.3 1.8-4.1 4.1-4.1Z" fill="${color}" stroke="rgba(0,0,0,.45)" stroke-width="1.1" stroke-linejoin="round"/>
    <path d="M9.4 6.4c.5-1.2 1.5-1.9 2.6-1.9" stroke="rgba(255,255,255,.75)" stroke-width="1.1" stroke-linecap="round" fill="none"/>
  </svg>`
}

function pawnPos(i, order, count) {
  const { r, c } = tileRC(i)
  const baseX = ((c - 1) + .5) / 11 * 100
  const baseY = ((r - 1) + .5) / 11 * 100
  const offs = [[0, 0], [-.95, 0], [.95, 0], [0, -.95], [-.95, -.95], [.95, -.95]]
  const o = offs[order] || [0, 0]
  return { x: baseX + o[0], y: baseY + o[1], count }
}

function renderPawns() {
  if (!S) return
  const wrap = $('#pawns')
  const groups = {}
  S.players.forEach(p => { if (!p.bankrupt) (groups[p.pos] = groups[p.pos] || []).push(p.id) })
  S.players.forEach(p => {
    if (p.bankrupt) { const old = wrap.querySelector(`[data-p="${p.id}"]`); if (old) old.remove(); return }
    let el = wrap.querySelector(`[data-p="${p.id}"]`)
    if (!el) {
      el = document.createElement('div')
      el.className = 'pawn'
      el.dataset.p = p.id
      el.innerHTML = pawnSVG(S.players[p.id].color)
      wrap.appendChild(el)
    }
    const list = groups[p.pos] || [p.id]
    const order = list.indexOf(p.id)
    const ap = animPos[p.id]
    const pos = ap ? { x: ((ap.c - 1) + .5) / 11 * 100, y: ((ap.r - 1) + .5) / 11 * 100 } : pawnPos(p.pos, order, list.length)
    el.style.left = pos.x + '%'
    el.style.top = pos.y + '%'
    el.classList.toggle('active', S.turn === p.id && S.phase !== 'over')
  })
}

async function movePawn(pid, from, to, opts = {}) {
  const fwd = (to - from + 40) % 40
  const back = (from - to + 40) % 40
  const dir = opts.back ? -1 : (fwd <= 12 || fwd === 0 ? 1 : -1)
  const steps = dir > 0 ? fwd : back
  if (steps === 0) { flashTile = to; setTimeout(() => { flashTile = -1 }, 300); return }
  if (steps > 12) { /* teleport (kartu) */
    animPos[pid] = tileRC(to); renderPawns(); SFX.card(); await sleep(240); delete animPos[pid]; renderPawns(); return
  }
  for (let k = 1; k <= steps; k++) {
    const pos = dir > 0 ? (from + k) % 40 : (from - k + 40) % 40
    animPos[pid] = tileRC(pos)
    renderPawns()
    SFX.step()
    await sleep(settings.speed === 'fast' ? 70 : 105)
  }
  delete animPos[pid]
  renderPawns()
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms))

/* ============================================================
 * 5. DADU
 * ============================================================ */
const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] }

function setDie(el, n) {
  const dots = $$('i', el)
  const on = PIPS[n] || []
  dots.forEach((d, i) => d.classList.toggle('on', on.includes(i)))
}

async function rollDiceAnim() {
  const d1 = $('#die1'), d2 = $('#die2')
  d1.classList.remove('roll1'); d2.classList.remove('roll2')
  void d1.offsetWidth
  d1.classList.add('roll1'); d2.classList.add('roll2')
  SFX.dice()
  const t0 = Date.now()
  while (Date.now() - t0 < 430) {
    setDie(d1, 1 + Math.floor(Math.random() * 6))
    setDie(d2, 1 + Math.floor(Math.random() * 6))
    await sleep(65)
  }
  d1.classList.remove('roll1'); d2.classList.remove('roll2')
}

/* ============================================================
 * 6. RENDER
 * ============================================================ */

/* Modal yang mengikuti fase (beli/lelang/utang/tukar) harus otomatis tertutup
 * begitu fasenya berubah — misalnya setelah lelang selesai atau utang lunas. */
function syncModal() {
  if (!modalKind || !S) return
  const need = { buy: 'buy', auction: 'auction', debt: 'debt', tradeResp: 'trade' }[modalKind]
  if (need && need !== S.phase) closeModal()
}

function render() {
  syncModal()
  renderPlayers()
  updateTiles()
  renderPawns()
  renderCenter()
  renderLog()
  $('#turnChip').style.borderColor = S ? (S.players[S.turn].color + '66') : ''
  const dot = $('#turnChip .dot')
  if (dot) dot.style.background = S ? S.players[S.turn].color : '#35d07f'
  $('#turnChipText').textContent = S
    ? (S.phase === 'over' ? 'Permainan selesai' : `Giliran ${S.players[S.turn].name}`)
    : 'Siap bermain'
  $('#turnCount').textContent = S ? `giliran ${S.turnCount}` : ''
  saveGame()
}

function renderPlayers() {
  if (!S) { $('#players').innerHTML = '<div class="empty">Belum ada permainan.</div>'; return }
  $('#players').innerHTML = S.players.map(p => {
    const bc = E.buildingCount(S, p.id)
    const badge = p.bankrupt ? '<span class="badge">bangkrut</span>'
      : p.isBot ? `<span class="badge bot">${(E.BOT_PERSONALITIES.find(x => x.id === p.personality) || {}).name || 'Bot'}</span>`
        : '<span class="badge you">kamu</span>'
    const jail = p.inJail ? '<span class="badge jail">penjara</span>' : ''
    return `<div class="prow ${S.turn === p.id && S.phase !== 'over' ? 'now' : ''} ${p.bankrupt ? 'dead' : ''}">
      <div class="av" style="background:${p.color}">${p.name.slice(0, 1).toUpperCase()}</div>
      <div style="min-width:0">
        <div class="nm"><span>${esc(p.name)}</span>${badge}${jail}</div>
        <div class="meta">
          <span>${Object.values(S.holdings).filter(h => h.owner === p.id).length} petak</span>
          <span>🏠 ${bc.houses}</span><span>🏨 ${bc.hotels}</span>
          ${p.getOutCards ? `<span>🎫 ${p.getOutCards}</span>` : ''}
        </div>
      </div>
      <div class="cash">${fmt(p.cash)}<small>aset ${fmt(E.netWorth(S, p.id))}</small></div>
    </div>`
  }).join('')
}

function renderCenter() {
  const who = $('#turnWho'), st = $('#turnStatus'), ctas = $('#centerCtas')
  if (!S) {
    who.innerHTML = ''; st.textContent = 'Atur pemain lalu mulai permainan.'
    ctas.innerHTML = '<button class="btn gold" data-act="setup">Mulai Permainan</button>'
    return
  }
  const p = S.players[S.turn]
  const human = isHuman(S.turn)
  who.innerHTML = `<span class="pdot" style="background:${p.color}"></span>${esc(p.name)}${p.isBot ? ' <span class="badge bot">bot</span>' : ''}`
  const d1 = S.dice[0], d2 = S.dice[1]
  setDie($('#die1'), d1 || 1); setDie($('#die2'), d2 || 1)
  $('#diceTotal').textContent = d1 && d2 ? `${d1} + ${d2} = ${d1 + d2}${d1 === d2 ? ' · kembar' : ''}` : ''
  $('#die1').style.opacity = d1 ? 1 : .4
  $('#die2').style.opacity = d2 ? 1 : .4

  let status = '', acts = []
  switch (S.phase) {
    case 'roll':
      status = p.inJail
        ? `Di penjara — coba dadu kembar (percobaan ${p.jailTurns}/3) atau bayar denda ${fmt(S.rules.jailFine)}.`
        : `Lempar dua dadu. Kembar berarti lempar lagi; tiga kali kembar masuk penjara.`
      if (human) {
        acts.push(`<button class="btn primary" id="btnRoll" data-act="roll" ${busy ? 'disabled' : ''}>🎲 Lempar Dadu</button>`)
        if (p.inJail) {
          acts.push(`<button class="btn ghost" data-act="jailfine" ${p.cash >= S.rules.jailFine ? '' : 'disabled'}>Bayar ${fmt(S.rules.jailFine)}</button>`)
          if (p.getOutCards > 0) acts.push(`<button class="btn ghost" data-act="jailcard">Pakai Kartu Bebas</button>`)
        }
      } else status = 'Bot sedang berpikir…'
      break
    case 'buy':
      status = `${E.tile(S.pending.tile).name} belum bertuan — menunggu keputusan.`
      if (human) acts.push(`<button class="btn gold" data-act="buyopen">Lihat Tawaran</button>`)
      break
    case 'auction': {
      const cur = E.auctionCurrent(S)
      status = cur === null ? 'Lelang berjalan…' : `Lelang ${E.tile(S.auction.tile).name} — giliran menawar ${S.players[cur].name} (tawaran ${fmt(S.auction.bid)}).`
      if (cur !== null && isHuman(cur)) acts.push(`<button class="btn gold" data-act="aucopen">Buka Lelang</button>`)
      break
    }
    case 'debt':
      status = `${S.players[S.pending.player].name} harus menyiapkan ${fmt(S.pending.amount)}.`
      if (human) acts.push(`<button class="btn danger" data-act="debtopen">Selesaikan Utang</button>`)
      break
    case 'trade':
      status = 'Tawaran tukar menunggu jawaban.'
      if (human) acts.push(`<button class="btn gold" data-act="tradeopen">Lihat Tawaran</button>`)
      break
    case 'end':
      status = human ? 'Selesai? Kamu masih bisa membangun, menggadai, atau menukar sebelum mengakhiri giliran.' : 'Bot menyelesaikan giliran…'
      if (human) {
        acts.push(`<button class="btn primary" id="btnEnd" data-act="end">Akhiri Giliran →</button>`)
        if (Object.values(S.holdings).some(h => h.owner === S.turn && (h.houses || h.hotel || h.mortgaged))) acts.push(`<button class="btn ghost" data-act="manage">🏗 Kelola</button>`)
      }
      break
    case 'over':
      status = 'Permainan selesai.'
      acts.push(`<button class="btn gold" data-act="result">Lihat Hasil</button>`)
      break
  }
  st.textContent = status
  ctas.innerHTML = acts.join('')
  $$('#centerCtas [data-act]').forEach(b => b.onclick = () => onAct(b.dataset.act))

  $('#centerStats').innerHTML = `<div class="cs"><b>${S.bank.houses}</b><small>rumah</small></div>
    <div class="cs"><b>${S.bank.hotels}</b><small>hotel</small></div>
    <div class="cs"><b>${S.turnCount}</b><small>giliran</small></div>
    <div class="cs"><b>${Object.values(S.holdings).filter(h => h.owner !== null).length}/28</b><small>terjual</small></div>`
  const canAct = human && S.phase !== 'over'
  $('#btnManage').disabled = !canAct
  $('#btnTrade').disabled = !canAct
}

function onAct(act) {
  SFX.click()
  switch (act) {
    case 'roll': doRoll(); break
    case 'end': doEnd(); break
    case 'jailfine': if (E.payJailFine(S)) { SFX.buy(); toast('Bebas dari penjara', 'good') } else toast('Uang tidak cukup', 'bad'); afterAction(); break
    case 'jailcard': if (E.useJailCard(S)) { SFX.card(); toast('Kartu bebas dipakai', 'good') } else toast('Tidak punya kartu', 'bad'); afterAction(); break
    case 'buyopen': openBuy(); break
    case 'aucopen': openAuction(); break
    case 'debtopen': openDebt(); break
    case 'tradeopen': openTradeRespond(); break
    case 'manage': openManage(); break
    case 'result': showGameOver(true); break
    case 'setup': openSetup(); break
  }
}

function renderLog() {
  if (!S) { $('#log').innerHTML = '<div class="empty">Catatan permainan muncul di sini.</div>'; return }
  const el = $('#log')
  const near = el.scrollTop + el.clientHeight >= el.scrollHeight - 40
  el.innerHTML = S.log.slice(-120).map(l => `<div class="li ${l.kind}">${esc(l.text)}</div>`).join('')
  $('#logCount').textContent = `${S.log.length}`
  if (near) el.scrollTop = el.scrollHeight
}

/* ============================================================
 * 7. AKSI GILIRAN
 * ============================================================ */
async function doRoll() {
  if (!S || busy || S.phase !== 'roll' || !isHuman(S.turn)) return
  busy = true
  renderCenter()
  const pid = S.turn
  const from = S.players[pid].pos
  await rollDiceAnim()
  const ok = E.roll(S)
  if (!ok) { busy = false; afterAction(); return }
  const to = S.players[pid].pos
  await movePawn(pid, from, to)
  busy = false
  await sleep(120)
  afterAction()
}

function doEnd() {
  if (!S || busy) return
  if (S.phase !== 'end') return
  const before = S.turn
  E.endTurn(S)
  SFX.click()
  if (S.turn !== before) animPos = {}
  afterAction()
}

function afterAction() {
  render()
  checkCard()
  pump()
}

function checkCard() {
  const c = S && S.lastCard
  if (!c) return
  const key = `${c.deck}:${c.id}:${c.player}:${S.turnCount}:${S.log.length}`
  if (key === lastCardKey) return
  lastCardKey = key
  openCard(c)
}

/* ============================================================
 * 8. OTORITAS GILIRAN / BOT
 * ============================================================ */
function scheduleBot(ms) {
  clearTimeout(botTimer)
  const t = ms === undefined ? SPEEDS[settings.speed] || 520 : ms
  botTimer = setTimeout(() => {
    if (!S || busy || modalKind) return
    if (S.phase === 'buy') { /* botStep menangani */
    }
    const acted = E.botStep(S)
    if (!acted) { render(); return }
    afterAction()
  }, t)
}

function pump() {
  if (!S) return
  render()
  if (S.phase === 'over') { if (!gameOverShown) showGameOver(); return }
  if (S.phase === 'buy' && isHuman(S.turn)) return openBuy()
  if (S.phase === 'debt') return isHuman(S.pending.player) ? openDebt() : scheduleBot()
  if (S.phase === 'auction') {
    const cur = E.auctionCurrent(S)
    if (cur === null) return scheduleBot(80)
    if (isHuman(cur)) return openAuction()
    closeModal()
    return scheduleBot()
  }
  if (S.phase === 'trade') {
    if (!S.trade) return scheduleBot(80)
    if (isHuman(S.trade.to)) return openTradeRespond()
    closeModal()
    return scheduleBot(500)
  }
  if (isBot(S.turn)) { closeModal(); return scheduleBot() }
}

/* ============================================================
 * 9. MODAL DASAR
 * ============================================================ */
function openModal(kind, html, opts = {}) {
  modalKind = kind
  const root = $('#modalRoot'), m = $('#modal')
  m.innerHTML = html
  root.classList.add('open')
  root.dataset.lock = opts.lock ? '1' : ''
  const x = m.querySelector('[data-close]')
  if (x) x.onclick = () => { if (!opts.lock) closeModal() }
  root.onclick = (ev) => { if (ev.target === root && !opts.lock) closeModal() }
  return m
}

function closeModal() {
  modalKind = null
  $('#modalRoot').classList.remove('open')
  $('#modal').innerHTML = ''
  $$('#modalRoot [data-close]').forEach(b => b.onclick = null)
}

function modalShell(title, body, footer, lock) {
  return `<div class="modal-h"><h3>${title}</h3>${lock ? '' : '<button class="x" data-close aria-label="Tutup">✕</button>'}</div>
    <div class="modal-b">${body}</div>${footer ? `<div class="modal-f">${footer}</div>` : ''}`
}

function toast(text, kind = '') {
  const el = document.createElement('div')
  el.className = 'toast ' + kind
  el.textContent = text
  $('#toasts').appendChild(el)
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(6px)'; el.style.transition = '.25s'; setTimeout(() => el.remove(), 260) }, 2200)
}

/* ============================================================
 * 10. SETUP / LANJUTKAN
 * ============================================================ */
const DEFAULT_PLAYERS = [
  { name: 'Kamu', isBot: false, personality: 'balanced' },
  { name: 'Bot Umi', isBot: true, personality: 'balanced' },
  { name: 'Bot Rangga', isBot: true, personality: 'aggressive' },
  { name: 'Bot Sari', isBot: true, personality: 'conservative' },
]

function savedGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !parsed.state) return null
    const st = E.deserialize(JSON.stringify(parsed.state))
    return st ? { state: st, at: parsed.at } : null
  } catch { return null }
}

function openSetup() {
  const sv = savedGame()
  const savedCard = sv ? `<div class="saved-card">
      <div class="txt"><b>Permainan tersimpan</b><small>${sv.state.players.length} pemain · giliran ${sv.state.turnCount} · ${new Date(sv.at).toLocaleString('id-ID')}</small></div>
      <button class="btn gold sm" data-act="resume">Lanjutkan</button>
      <button class="btn ghost sm" data-act="fresh">Mulai Baru</button>
    </div>` : ''
  const rows = DEFAULT_PLAYERS.map((p, i) => setupRow(p, i)).join('')
  const body = `
    ${savedCard}
    <div class="lead">Atur pemain, aturan, dan durasi. Semua komputer tetap di perangkat ini — tidak ada tombol multiplayer yang belum nyata.</div>
    <div id="setupRows">${rows}</div>
    <button class="btn ghost sm" id="addPlayer" style="align-self:flex-start">+ Tambah Pemain</button>
    <div class="divider"></div>
    <div class="form-grid">
      <div class="field"><label>Modal awal</label><select id="setCash">
        <option value="1000">${`Rp1.000`} — cepat</option>
        <option value="1500" selected>${`Rp1.500`} — klasik</option>
        <option value="2500">${`Rp2.500`} — santai</option>
      </select></div>
      <div class="field"><label>Batas giliran</label><select id="setTurns">
        <option value="0">Tanpa batas (sampai bangkrut)</option>
        <option value="80">80 giliran — singkat</option>
        <option value="140" selected>140 giliran — sedang</option>
        <option value="240">240 giliran — panjang</option>
      </select></div>
      <div class="field"><label>Mata uang</label><select id="setCur"><option value="Rp" selected>Rp</option><option value="$">$</option><option value="€">€</option></select></div>
      <div class="field"><label>Kecepatan animasi</label><select id="setSpeed">
        <option value="slow">Pelan</option><option value="normal" selected>Normal</option><option value="fast">Cepat</option>
      </select></div>
    </div>`
  const m = openModal('setup', modalShell('Property Empire', body,
    `<button class="btn ghost" data-close>Batal</button><button class="btn gold" data-act="start">Mulai Permainan</button>`, false))
  $('#setSpeed').value = settings.speed
  bindSetup(m)
}

function setupRow(p, i) {
  const persist = ['beginner', 'balanced', 'aggressive', 'conservative']
  return `<div class="prow-set" data-row="${i}">
    <div class="idx" style="background:${['#7ee787', '#7fd3f7', '#ffd166', '#f78fb3', '#c792ea', '#ffa94d'][i % 6]}">${i + 1}</div>
    <input class="pname" value="${esc(p.name)}" maxlength="18" aria-label="Nama pemain ${i + 1}">
    <select class="ptype"><option value="human"${p.isBot ? '' : ' selected'}>Manusia</option><option value="bot"${p.isBot ? ' selected' : ''}>Bot</option></select>
    <select class="pperson" ${p.isBot ? '' : 'disabled'}>${persist.map(x => `<option value="${x}"${p.personality === x ? ' selected' : ''}>${E.BOT_PERSONALITIES.find(b => b.id === x).name}</option>`).join('')}</select>
    <button class="rm" title="Hapus" ${i < 2 ? 'disabled style="opacity:.25"' : ''}>✕</button>
  </div>`
}

function bindSetup(root) {
  const rows = () => $$('.prow-set', root)
  root.addEventListener('change', (ev) => {
    const row = ev.target.closest('.prow-set')
    if (!row) return
    if (ev.target.classList.contains('ptype')) {
      $('.pperson', row).disabled = ev.target.value !== 'bot'
    }
  })
  root.addEventListener('click', (ev) => {
    if (ev.target.closest('#addPlayer')) {
      const i = rows().length
      if (i >= 6) return toast('Maksimal 6 pemain', 'bad')
      const el = document.createElement('div')
      el.innerHTML = setupRow({ name: `Bot ${i}`, isBot: true, personality: E.BOT_PERSONALITIES[i % 4].id }, i)
      $('#setupRows', root).appendChild(el.firstElementChild)
      rebindSetupRows(root)
      return
    }
    if (ev.target.classList.contains('rm')) {
      const row = ev.target.closest('.prow-set')
      if (rows().length <= 2) return toast('Minimal 2 pemain', 'bad')
      row.remove(); rebindSetupRows(root)
      return
    }
    const act = ev.target.closest('[data-act]')?.dataset.act
    if (act === 'resume') { const sv = savedGame(); if (sv) { S = sv.state; lastCardKey = ''; gameOverShown = false; closeModal(); afterAction(); setTimeout(pump, 60) } return }
    if (act === 'fresh') { localStorage.removeItem(SAVE_KEY); openSetup(); return }
    if (act === 'start') {
      const players = rows().map((row, i) => {
        const name = $('.pname', row).value.trim() || `Pemain ${i + 1}`
        const bot = $('.ptype', row).value === 'bot'
        return { name, isBot: bot, personality: $('.pperson', row).value || 'balanced' }
      })
      if (players.length < 2) return toast('Minimal 2 pemain', 'bad')
      settings.speed = $('#setSpeed').value
      saveSettings()
      S = E.createGame({
        players,
        rules: {
          startingCash: Number($('#setCash').value),
          maxTurns: Number($('#setTurns').value),
          currency: $('#setCur').value,
        },
      })
      lastCardKey = ''; gameOverShown = false; animPos = {}
      closeModal()
      render()
      pump()
    }
  })
  rebindSetupRows(root)
}

function rebindSetupRows(root) {
  $$('.prow-set', root).forEach((row, i) => {
    const rm = $('.rm', row)
    rm.disabled = $$('.prow-set', root).length <= 2
    rm.style.opacity = rm.disabled ? .25 : 1
    $('.idx', row).textContent = i + 1
  })
}

/* ============================================================
 * 11. BELI
 * ============================================================ */
function rentTableHTML(i) {
  const t = E.tile(i)
  const line = (label, val, hi) => `<tr class="${hi ? 'hi' : ''}"><td>${label}</td><td>${fmt(val)}</td></tr>`
  if (t.type === 'prop') {
    return `<table class="rent-table">
      ${line('Sewa dasar', t.rents[0])}
      ${line('Sewa + seluruh kelompok', t.rents[0] * 2)}
      ${line('1 rumah', t.rents[1])}${line('2 rumah', t.rents[2])}${line('3 rumah', t.rents[3])}${line('4 rumah', t.rents[4])}
      ${line('Hotel', t.rents[5], true)}
      ${line('Harga rumah / hotel', E.GROUPS[t.group].houseCost)}
      ${line('Nilai gadai', E.mortgageValue(t))}
      ${line('Biaya tebus', E.unmortgageCost(t))}
    </table>`
  }
  if (t.type === 'railroad') {
    return `<table class="rent-table">${[25, 50, 100, 200].map((v, k) => line(`${k + 1} stasiun`, v, k === 3)).join('')}${line('Nilai gadai', E.mortgageValue(t))}</table>`
  }
  if (t.type === 'utility') {
    return `<table class="rent-table">${line('1 utilitas', 4)}${line('2 utilitas', 10, true)}<tr><td colspan="2" style="color:#8ea0c0;font-size:11px">dikalikan hasil dadu</td></tr>${line('Nilai gadai', E.mortgageValue(t))}</table>`
  }
  return ''
}

function openBuy() {
  if (!S || S.phase !== 'buy') return
  const i = S.pending.tile, t = E.tile(i), p = S.players[S.turn]
  const afford = p.cash >= t.price
  const color = t.group ? GROUP_COLOR[t.group] : t.type === 'railroad' ? '#475569' : '#3d7fa8'
  const body = `
    <div class="buycard">
      <div class="top" style="background:linear-gradient(180deg,${color},${shade(color)})">${t.group ? E.GROUPS[t.group].name : t.type === 'railroad' ? 'Stasiun' : 'Utilitas'}</div>
      <div class="in">
        <div class="name">${esc(t.name)}</div>
        <div class="kv"><span class="k">Harga</span><span class="v">${fmt(t.price)}</span>
          <span class="k">Saldo kamu</span><span class="v">${fmt(p.cash)}</span>
          <span class="k">Setelah beli</span><span class="v" style="color:${afford ? '#8ff0ba' : '#ff9aa4'}">${fmt(p.cash - t.price)}</span>
        </div>
        <div class="divider"></div>
        ${rentTableHTML(i)}
      </div>
    </div>
    ${afford ? '' : '<div class="lead" style="color:#ff9aa4">Uang belum cukup — lelang tetap bisa diikuti pemain lain.</div>'}`
  const m = openModal('buy', modalShell(`Beli ${esc(t.name)}?`, body,
    `<button class="btn ghost" data-act="decline">Lewati / Lelang</button>
     <button class="btn gold" data-act="buy" ${afford ? '' : 'disabled'}>Beli ${fmt(t.price)}</button>`, true))
  $('[data-act="buy"]', m).onclick = () => {
    if (E.buyProperty(S)) { SFX.buy(); toast(`${t.name} menjadi milikmu`, 'good') }
    closeModal(); afterAction()
  }
  $('[data-act="decline"]', m).onclick = () => {
    E.declineProperty(S); closeModal(); afterAction()
  }
}

/* ============================================================
 * 12. LELANG
 * ============================================================ */
let auctionDraft = 0

function openAuction() {
  if (!S || S.phase !== 'auction' || !S.auction) return
  const a = S.auction
  const cur = E.auctionCurrent(S)
  if (cur === null) { closeModal(); scheduleBot(80); return }
  const t = E.tile(a.tile)
  if (isBot(cur) && modalKind === 'auction') { closeModal(); return scheduleBot() }
  const p = S.players[cur]
  const human = isHuman(cur)
  const minBid = a.bid + 25
  if (!human) {
    if (modalKind !== 'auction') return scheduleBot()
    return
  }
  if (modalKind !== 'auction') auctionDraft = Math.min(p.cash, Math.max(minBid, Math.round(t.price * 0.6)))
  const thumb = a.active.length ? a.active.map(id => `<span class="chip" style="border:1px solid ${S.players[id].color}55;background:${S.players[id].color}22">${esc(S.players[id].name)}</span>`).join(' ') : '-'
  const body = `
    <div class="buycard" style="margin-bottom:4px">
      <div class="top" style="height:38px;background:linear-gradient(180deg,${t.group ? GROUP_COLOR[t.group] : '#475569'},${t.group ? shade(GROUP_COLOR[t.group]) : '#27313f'})">${t.group ? E.GROUPS[t.group].name : 'Petak'}</div>
      <div class="in" style="padding:10px 14px"><div class="name" style="font-size:16px">${esc(t.name)}</div>
        <div class="auc-who">Harga dasar ${fmt(t.price)} · pemain aktif: ${thumb}</div></div>
    </div>
    <div class="auc-head"><div><div class="auc-who">Tawaran tertinggi</div><div class="auc-big">${fmt(a.bid)}</div></div>
      <div class="auc-who" style="margin-left:auto;text-align:right">Penawar<br><b style="color:#fff">${a.highBidder !== null ? esc(S.players[a.highBidder].name) : '—'}</b></div></div>
    <div class="lead">Sekarang giliran <b style="color:${p.color}">${esc(p.name)}</b> · saldo ${fmt(p.cash)}</div>
    <div class="bidrow">
      <input id="bidInput" type="number" min="${minBid}" max="${p.cash}" step="5" value="${Math.min(p.cash, Math.max(minBid, auctionDraft))}">
      <button class="btn ghost sm" data-bid="-50">−50</button>
      <button class="btn ghost sm" data-bid="+50">+50</button>
      <button class="btn ghost sm" data-bid="+100">+100</button>
    </div>
    <div class="lead" style="font-size:11.5px;color:#8ea0c0">Minimal ${fmt(minBid)} · kamu bisa lewat kapan saja.</div>`
  const m = openModal('auction', modalShell('🔨 Lelang', body,
    `<button class="btn ghost" data-act="pass">Lewati</button>
     <button class="btn gold" data-act="bid" ${p.cash < minBid ? 'disabled' : ''}>Tawar</button>`, true))
  const inp = $('#bidInput', m)
  $$('[data-bid]', m).forEach(b => b.onclick = () => {
    const delta = Number(b.dataset.bid)
    inp.value = clamp((Number(inp.value) || minBid) + delta, minBid, p.cash)
    SFX.click()
  })
  $('[data-act="bid"]', m).onclick = () => {
    const val = Math.floor(Number(inp.value))
    if (!Number.isFinite(val) || val < minBid) return toast(`Minimal ${fmt(minBid)}`, 'bad')
    if (E.auctionBid(S, cur, val)) { auctionDraft = val; SFX.buy() } else toast('Tawaran tidak sah', 'bad')
    closeModal(); afterAction()
  }
  $('[data-act="pass"]', m).onclick = () => { E.auctionPass(S, cur); SFX.click(); closeModal(); afterAction() }
}

/* ============================================================
 * 13. UTANG
 * ============================================================ */
function openDebt() {
  const d = S.pending
  if (!d || d.type !== 'debt') return
  const p = S.players[d.player]
  const own = Object.keys(S.holdings).map(Number).filter(i => S.holdings[i].owner === d.player)
  const rows = own.map(i => assetRow(i, true)).join('') || '<div class="empty">Tidak ada aset untuk dijual.</div>'
  const body = `
    <div class="kv"><span class="k">Harus dibayar</span><span class="v" style="color:#ff9aa4">${fmt(d.amount)}</span>
      <span class="k">Saldo ${esc(p.name)}</span><span class="v">${fmt(p.cash)}</span>
      <span class="k">Kekayaan total</span><span class="v">${fmt(E.netWorth(S, d.player))}</span></div>
    <div class="lead">${esc(d.reason)}. Jual bangunan (setengah harga) atau gadai properti untuk menutup kekurangan.</div>
    <div class="alist" id="debtList">${rows}</div>`
  const enough = p.cash >= d.amount
  const m = openModal('debt', modalShell('⚠️ Butuh Dana', body,
    `<button class="btn danger" data-act="bankrupt">Menyerah (Bangkrut)</button>
     <button class="btn gold" data-act="pay" ${enough ? '' : 'disabled'}>Bayar ${fmt(d.amount)}</button>`, true))
  bindAssetOps(m, () => openDebt())
  $('[data-act="pay"]', m).onclick = () => {
    if (E.payDebt(S)) { SFX.pay(); toast('Utang lunas', 'good'); closeModal(); afterAction() }
  }
  $('[data-act="bankrupt"]', m).onclick = () => {
    E.bankrupt(S, d.player, d.creditor); SFX.lose(); closeModal(); afterAction()
  }
}

/* ============================================================
 * 14. KELOLA ASET
 * ============================================================ */
function assetRow(i, compact) {
  const t = E.tile(i)
  const h = S.holdings[i]
  const p = S.players[h.owner]
  const chips = []
  if (h.hotel) chips.push('<span class="chip ht">hotel</span>')
  else if (h.houses) chips.push(`<span class="chip hs">${h.houses} rumah</span>`)
  if (h.mortgaged) chips.push('<span class="chip mq">gadai</span>')
  if (t.group && E.ownsGroup(S, h.owner, t.group)) chips.push('<span class="chip">set lengkap</span>')
  const color = t.group ? GROUP_COLOR[t.group] : t.type === 'railroad' ? '#475569' : '#3d7fa8'
  const canBuild = !h.mortgaged && t.type === 'prop' && E.ownsGroup(S, h.owner, t.group) && !h.hotel
  const ops = []
  if (canBuild) {
    const err = E.canBuild(S, h.owner, i)
    const label = h.houses >= S.rules.maxHouses ? '+ Hotel' : '+ Rumah'
    ops.push(`<button class="btn ghost sm" data-op="build" data-i="${i}" ${err ? `disabled title="${esc(err)}"` : ''}>${label}</button>`)
  }
  if (h.houses || h.hotel) ops.push(`<button class="btn ghost sm" data-op="sell" data-i="${i}">− Jual</button>`)
  if (!h.mortgaged && !h.houses && !h.hotel) ops.push(`<button class="btn ghost sm" data-op="mortgage" data-i="${i}">Gadai ${fmt(E.mortgageValue(t))}</button>`)
  if (h.mortgaged) {
    const cost = E.unmortgageCost(t)
    ops.push(`<button class="btn gold sm" data-op="unmortgage" data-i="${i}" ${p.cash < cost ? 'disabled' : ''}>Tebus ${fmt(cost)}</button>`)
  }
  return `<div class="arow">
    <div class="stripe" style="background:${color}"></div>
    <div style="min-width:0">
      <div class="t1">${esc(t.name)} ${chips.join(' ')}</div>
      <div class="t2">${E.rentFor(S, i, 7) ? `sewa kini ${fmt(E.rentFor(S, i, 7))}` : 'sewa —'} · gadai ${fmt(E.mortgageValue(t))}</div>
    </div>
    <div class="ops">${compact ? '' : ops.join('')}</div>
  </div>`
}

function bindAssetOps(root, refresh) {
  $$('[data-op]', root).forEach(b => b.onclick = () => {
    const i = Number(b.dataset.i)
    const op = b.dataset.op
    let res = null
    if (op === 'build') res = E.buildHouse(S, i)
    if (op === 'sell') res = E.sellHouse(S, i)
    if (op === 'mortgage') res = E.mortgage(S, i)
    if (op === 'unmortgage') res = E.unmortgage(S, i)
    if (res && !res.ok) return toast(res.error, 'bad')
    if (op === 'build') SFX.buy(); else if (op === 'sell' || op === 'unmortgage') SFX.pay(); else SFX.click()
    render(); refresh()
  })
}

function openManage() {
  if (!S) return
  const me = S.turn
  const p = S.players[me]
  const own = Object.keys(S.holdings).map(Number).filter(i => S.holdings[i].owner === me)
  const body = own.length
    ? `<div class="lead">Bangunan harus merata per kelompok warna. Maksimal 4 rumah lalu hotel. Bank tersisa ${S.bank.houses} rumah & ${S.bank.hotels} hotel.</div>
       <div class="alist">${own.map(i => assetRow(i)).join('')}</div>`
    : '<div class="empty">Belum punya properti. Beli atau menangkan lelang dulu.</div>'
  const m = openModal('manage', modalShell(`Kelola Aset — ${esc(p.name)}`, body,
    `<button class="btn ghost" data-close>Tutup</button>`, false))
  bindAssetOps(m, () => openManage())
}

/* ============================================================
 * 15. TUKAR
 * ============================================================ */
function openTrade() {
  if (!S || S.phase === 'over') return
  const me = S.turn
  const others = S.players.filter(x => x.id !== me && !x.bankrupt)
  const myTiles = Object.keys(S.holdings).map(Number).filter(i => S.holdings[i].owner === me)
  const opt = others.map(o => `<option value="${o.id}">${esc(o.name)}${o.isBot ? ' (bot)' : ''}</option>`).join('')
  const body = `
    <div class="form-grid">
      <div class="field"><label>Pemain lawan</label><select id="trPartner">${opt}</select></div>
    </div>
    <div class="lead" style="font-size:12px">Pilih properti yang kamu berikan (kiri) dan yang kamu minta (kanan). Bangunan harus dijual dulu, dan tidak boleh menciptakan uang.</div>
    <div class="trade-grid">
      <div class="tcol"><h4>Kamu berikan</h4><div class="picklist" id="pickGive">${myTiles.map(i => pickRow(i, 'give')).join('') || '<div class="empty">Tidak ada properti.</div>'}</div>
        <div class="money-in"><span>${cur()}</span><input type="number" min="0" id="cashGive" value="0"></div></div>
      <div class="tcol"><h4>Kamu minta</h4><div class="picklist" id="pickWant"></div>
        <div class="money-in"><span>${cur()}</span><input type="number" min="0" id="cashWant" value="0"></div></div>
    </div>`
  const m = openModal('trade', modalShell('🤝 Tukar Properti', body,
    `<button class="btn ghost" data-close>Batal</button><button class="btn gold" data-act="propose">Kirim Tawaran</button>`, false))
  const fillWant = () => {
    const to = Number($('#trPartner', m).value)
    const list = Object.keys(S.holdings).map(Number).filter(i => S.holdings[i].owner === to)
    $('#pickWant', m).innerHTML = list.map(i => pickRow(i, 'want')).join('') || '<div class="empty">Lawan belum punya properti.</div>'
  }
  fillWant()
  $('#trPartner', m).onchange = fillWant
  $('[data-act="propose"]', m).onclick = () => {
    const to = Number($('#trPartner', m).value)
    const giveTiles = $$('#pickGive input:checked', m).map(x => Number(x.value))
    const wantTiles = $$('#pickWant input:checked', m).map(x => Number(x.value))
    const giveCash = Number($('#cashGive', m).value) || 0
    const wantCash = Number($('#cashWant', m).value) || 0
    if (!giveTiles.length && !wantTiles.length && !giveCash && !wantCash) return toast('Isi dulu isi tawarannya', 'bad')
    const res = E.proposeTrade(S, { from: me, to, giveTiles, giveCash, wantTiles, wantCash })
    if (!res.ok) return toast(res.error, 'bad')
    SFX.click()
    closeModal()
    if (isBot(to)) {
      const body2 = `<div class="lead">${esc(S.players[to].name)} sedang menimbang tawaranmu…</div>
        <div class="auc-who">Memberi: ${giveTiles.map(i => esc(E.tile(i).name)).join(', ') || '—'}${giveCash ? ' + ' + fmt(giveCash) : ''}</div>
        <div class="auc-who">Meminta: ${wantTiles.map(i => esc(E.tile(i).name)).join(', ') || '—'}${wantCash ? ' + ' + fmt(wantCash) : ''}</div>`
      openModal('tradeWait', modalShell('Menunggu jawaban', body2, '', true))
      setTimeout(() => {
        const ok = E.botConsiderTrade(S)
        closeModal()
        toast(ok ? 'Tawaran diterima!' : 'Tawaran ditolak', ok ? 'good' : 'bad')
        afterAction()
      }, 900)
    } else afterAction()
  }
}

function pickRow(i, kind) {
  const t = E.tile(i)
  const h = S.holdings[i]
  const color = t.group ? GROUP_COLOR[t.group] : t.type === 'railroad' ? '#475569' : '#3d7fa8'
  const note = h.mortgaged ? ' · gadai' : h.houses ? ` · ${h.houses} rumah` : h.hotel ? ' · hotel' : ''
  return `<label class="pick"><input type="checkbox" value="${i}" data-kind="${kind}"><span class="sw" style="background:${color}"></span><span>${esc(t.name)}${note}</span></label>`
}

function openTradeRespond() {
  const t = S.trade
  if (!t) return
  const a = S.players[t.from], b = S.players[t.to]
  const list = (arr, money) => {
    const tiles = arr.map(i => `<span class="chip">${esc(E.tile(i).name)}</span>`).join(' ')
    return `${tiles || '<span class="chip">—</span>'}${money ? ` <span class="chip">${fmt(money)}</span>` : ''}`
  }
  const body = `
    <div class="lead"><b style="color:${a.color}">${esc(a.name)}</b> menawarkan tukar kepada <b style="color:${b.color}">${esc(b.name)}</b>.</div>
    <div class="trade-grid">
      <div class="tcol"><h4>Mereka beri</h4><div style="display:flex;gap:4px;flex-wrap:wrap">${list(t.giveTiles, t.giveCash)}</div></div>
      <div class="tcol"><h4>Mereka minta</h4><div style="display:flex;gap:4px;flex-wrap:wrap">${list(t.wantTiles, t.wantCash)}</div></div>
    </div>`
  const m = openModal('tradeResp', modalShell('Tawaran Tukar', body,
    `<button class="btn danger" data-act="no">Tolak</button><button class="btn primary" data-act="yes">Terima</button>`, true))
  $('[data-act="yes"]', m).onclick = () => { E.respondTrade(S, true); SFX.buy(); toast('Tukar disetujui', 'good'); closeModal(); afterAction() }
  $('[data-act="no"]', m).onclick = () => { E.respondTrade(S, false); SFX.click(); closeModal(); afterAction() }
}

/* ============================================================
 * 16. KARTU
 * ============================================================ */
function openCard(c) {
  const isChance = c.deck === 'chance'
  SFX.card()
  const body = `<div class="flip" id="flip"><div class="inner">
      <div class="face front"><div><div style="font-size:34px">${isChance ? '❓' : '🎁'}</div><div style="font-weight:900;letter-spacing:2px;margin-top:6px">${isChance ? 'KESEMPATAN' : 'DANA KOMUNITAS'}</div></div></div>
      <div class="face back"><div><h4>${isChance ? 'Kesempatan' : 'Dana Komunitas'}</h4><p>${esc(c.text)}</p></div></div>
    </div></div>`
  const m = openModal('card', modalShell(`${esc(S.players[c.player].name)} mengambil kartu`, body,
    `<button class="btn gold" data-act="closecard">Tutup</button>`, true))
  const flip = $('#flip', m)
  setTimeout(() => flip.classList.add('show'), 60)
  $('[data-act="closecard"]', m).onclick = () => { SFX.click(); closeModal(); pump() }
  setTimeout(() => { if (modalKind === 'card') { /* biarkan menunggu klik */ } }, 50)
}

/* ============================================================
 * 17. DETAIL PETAK & STATISTIK
 * ============================================================ */
function openDetail(i) {
  const t = E.tile(i)
  const h = S ? S.holdings[i] : null
  const own = h && h.owner !== null ? S.players[h.owner] : null
  const color = t.group ? GROUP_COLOR[t.group] : '#475569'
  let extra = ''
  if (t.type === 'prop' || t.type === 'railroad' || t.type === 'utility') {
    extra = `<div class="divider"></div>${rentTableHTML(i)}
      <div class="kv"><span class="k">Pemilik</span><span class="v" style="color:${own ? own.color : '#8ea0c0'}">${own ? esc(own.name) : 'Belum ada'}</span>
      <span class="k">Bangunan</span><span class="v">${h.hotel ? 'Hotel' : h.houses ? h.houses + ' rumah' : '—'}</span>
      <span class="k">Status</span><span class="v">${h.mortgaged ? 'Digadaikan' : 'Aktif'}</span></div>`
  } else if (t.type === 'tax') {
    extra = `<div class="kv"><span class="k">Harus dibayar</span><span class="v">${fmt(t.amount)}</span></div>`
  } else if (t.type === 'go') {
    extra = `<div class="kv"><span class="k">Gaji lewat MULAI</span><span class="v">${fmt(S.rules.goSalary)}</span></div>`
  } else if (t.type === 'jail') {
    extra = `<div class="lead">Hanya berkunjung — tidak ada denda kalau berhenti di sini.</div>`
  } else if (t.type === 'gotojail') {
    extra = `<div class="lead">Langsung dipindah ke sel penjara dan wajib keluar dengan denda, kartu, atau dadu kembar.</div>`
  } else if (t.type === 'chance' || t.type === 'chest') {
    extra = `<div class="lead">Ambil satu kartu dari tumpukan ${t.type === 'chance' ? 'Kesempatan' : 'Dana Komunitas'} — efeknya langsung berlaku.</div>`
  } else if (t.type === 'park') {
    extra = `<div class="lead">Parkir gratis. Tidak ada efek khusus.</div>`
  }
  const body = `<div class="buycard"><div class="top" style="height:44px;background:linear-gradient(180deg,${color},${shade(color)})">${t.group ? E.GROUPS[t.group].name : (t.type || '').toUpperCase()}</div>
    <div class="in"><div class="name">${esc(t.name)}</div><div class="kv"><span class="k">Petak</span><span class="v">#${i}</span>${t.price ? `<span class="k">Harga</span><span class="v">${fmt(t.price)}</span>` : ''}</div></div></div>
    ${extra}`
  openModal('detail', modalShell('Detail Petak', body, `<button class="btn ghost" data-close>Tutup</button>`, false))
}

function openStats() {
  if (!S) return
  const rows = E.summary(S)
  const max = Math.max(1, ...rows.map(r => r.netWorth))
  const body = `<div class="rank">${rows.map((r, k) => `
    <div class="r ${k === 0 ? 'first' : ''}">
      <b>${k + 1}</b>
      <div><b>${esc(r.name)}</b>${r.bankrupt ? ' <span class="chip">bangkrut</span>' : ''}
        <div class="t2" style="height:4px;background:rgba(255,255,255,.08);border-radius:9px;margin-top:4px;overflow:hidden"><div style="height:100%;width:${Math.round(r.netWorth / max * 100)}%;background:${S.players[r.id].color}"></div></div>
      </div>
      <div style="text-align:right"><b>${fmt(r.netWorth)}</b><div class="t2">${r.properties} petak · ${r.houses} rumah · ${r.hotels} hotel</div></div>
      <div class="t2">${fmt(r.cash)} tunai</div>
    </div>`).join('')}</div>
    <div class="lead" style="font-size:11.5px">Total giliran: ${S.turnCount} · bank tersisa ${S.bank.houses} rumah / ${S.bank.hotels} hotel.</div>`
  openModal('stats', modalShell('📊 Statistik', body, `<button class="btn ghost" data-close>Tutup</button>`, false))
}

/* ============================================================
 * 18. SELESAI
 * ============================================================ */
function showGameOver(force) {
  if (!S || S.phase !== 'over') return
  if (gameOverShown && !force) return
  gameOverShown = true
  const rows = E.summary(S)
  const w = rows[0]
  SFX.win()
  confetti()
  const body = `<div class="winner-hero"><div class="cup">🏆</div><h2>${esc(w.name)} menang!</h2>
      <div class="lead">Kekayaan akhir ${fmt(w.netWorth)} · ${E.summary(S).length} pemain</div></div>
    <div class="rank">${rows.map((r, k) => `<div class="r ${k === 0 ? 'first' : ''}"><b>${k + 1}</b>
      <div><b>${esc(r.name)}</b>${r.bankrupt ? ' <span class="chip">bangkrut</span>' : ''}<div class="t2">${r.properties} petak · ${r.houses} rumah · ${r.hotels} hotel</div></div>
      <div style="text-align:right"><b>${fmt(r.netWorth)}</b></div><div class="t2">${fmt(r.cash)}</div></div>`).join('')}</div>
    <div class="divider"></div>
    <div class="kv"><span class="k">Total giliran</span><span class="v">${S.turnCount}</span>
      <span class="k">Petak terjual</span><span class="v">${Object.values(S.holdings).filter(h => h.owner !== null).length}</span>
      <span class="k">Bangunan berdiri</span><span class="v">${Object.values(S.holdings).reduce((a, h) => a + (h.hotel ? 0 : h.houses || 0), 0)} rumah · ${Object.values(S.holdings).reduce((a, h) => a + (h.hotel ? 1 : 0), 0)} hotel</span></div>`
  openModal('over', modalShell('Permainan Selesai', body,
    `<button class="btn ghost" data-act="menu">Menu Utama</button><button class="btn gold" data-act="again">Main Lagi</button>`, true))
  $('[data-act="menu"]').onclick = () => { localStorage.removeItem(SAVE_KEY); S = null; closeModal(); openSetup(); render() }
  $('[data-act="again"]').onclick = () => {
    localStorage.removeItem(SAVE_KEY)
    const players = S.players.map(p => ({ name: p.name, isBot: p.isBot, personality: p.personality }))
    const rules = { startingCash: S.rules.startingCash, maxTurns: S.rules.maxTurns, currency: S.rules.currency }
    S = E.createGame({ players, rules })
    lastCardKey = ''; gameOverShown = false; animPos = {}
    closeModal(); render(); pump()
  }
}

function confetti() {
  const root = $('#confetti')
  const colors = ['#f2c14e', '#35d07f', '#5aa9ff', '#ef4b5a', '#a78bfa', '#ffd97a']
  for (let i = 0; i < 90; i++) {
    const el = document.createElement('i')
    el.style.left = Math.random() * 100 + 'vw'
    el.style.background = colors[i % colors.length]
    el.style.animationDuration = (1.8 + Math.random() * 2) + 's'
    el.style.animationDelay = (Math.random() * .6) + 's'
    el.style.opacity = .9
    root.appendChild(el)
    setTimeout(() => el.remove(), 4600)
  }
}

/* ============================================================
 * 19. SETELAN / TUTORIAL / RESTART
 * ============================================================ */
function openSettings() {
  const body = `<div class="lead">Perubahan berlaku langsung dan tersimpan di perangkat ini.</div>
    <div class="form-grid">
      <div class="field"><label>Kecepatan animasi</label><select id="osSpeed">
        <option value="slow"${settings.speed === 'slow' ? ' selected' : ''}>Pelan</option>
        <option value="normal"${settings.speed === 'normal' ? ' selected' : ''}>Normal</option>
        <option value="fast"${settings.speed === 'fast' ? ' selected' : ''}>Cepat</option></select></div>
      <div class="field"><label>Suara</label><select id="osSound">
        <option value="1"${settings.sound ? ' selected' : ''}>Aktif</option>
        <option value="0"${settings.sound ? '' : ' selected'}>Senyap</option></select></div>
    </div>
    <div class="divider"></div>
    <div class="kv"><span class="k">Aturan aktif</span><span class="v">${S ? (S.rules.auction ? 'Lelang aktif' : 'Tanpa lelang') + ' · ' + (S.rules.evenBuild ? 'bangun merata' : 'bebas bangun') : '—'}</span>
      <span class="k">Modal awal</span><span class="v">${S ? fmt(S.rules.startingCash) : '—'}</span>
      <span class="k">Batas giliran</span><span class="v">${S && S.rules.maxTurns ? S.rules.maxTurns + ' giliran' : 'tanpa batas'}</span>
      <span class="k">Gaji MULAI</span><span class="v">${S ? fmt(S.rules.goSalary) : '—'}</span></div>
    <div class="lead" style="font-size:11.5px;color:#8ea0c0">Tidak ada API key atau token di halaman ini; simpanan hanya berisi status permainan di localStorage browser.</div>`
  const m = openModal('settings', modalShell('⚙ Pengaturan', body, `<button class="btn ghost" data-close>Tutup</button>`, false))
  $('#osSpeed', m).onchange = (e) => { settings.speed = e.target.value; saveSettings() }
  $('#osSound', m).onchange = (e) => { settings.sound = e.target.value === '1'; saveSettings(); syncSoundBtn() }
}

function openTutorial() {
  const body = `<div class="lead">Cara main singkat — sama seperti papan properti klasik.</div>
    <div class="kv">
      <span class="k">1. Lempar dadu</span><span class="v">Dua dadu, pion berjalan tiap petak</span>
      <span class="k">2. Beli / lelang</span><span class="v">Petak kosong bisa dibeli atau dilelang</span>
      <span class="k">3. Sewa</span><span class="v">Berhenti di petak lawan → bayar sewa</span>
      <span class="k">4. Bangun</span><span class="v">Miliki 1 kelompok warna, bangun merata</span>
      <span class="k">5. Hotel</span><span class="v">4 rumah → hotel, sewa paling besar</span>
      <span class="k">6. Gadai</span><span class="v">Dapat setengah harga, tanpa sewa</span>
      <span class="k">7. Penjara</span><span class="v">Bayar denda, pakai kartu, atau dadu kembar</span>
      <span class="k">8. Kembar</span><span class="v">Lempar lagi; 3× kembar masuk penjara</span>
      <span class="k">9. Menang</span><span class="v">Pemain terakhir bertahan / kekayaan tertinggi saat batas giliran</span>
    </div>
    <div class="divider"></div>
    <div class="lead">Tips: klik petak mana pun untuk melihat harga, sewa, dan pemiliknya. Gunakan tombol + / − di papan kalau layar HP kecil, lalu geser papan untuk melihat sudut lain.</div>`
  openModal('tutorial', modalShell('? Tutorial', body, `<button class="btn gold" data-close>Mengerti</button>`, false))
}

function requestRestart() {
  if (!S) return openSetup()
  const body = `<div class="lead">Permainan saat ini akan dihapus dari perangkat ini dan tidak bisa dikembalikan. Yakin mulai ulang?</div>
    <div class="kv"><span class="k">Giliran berjalan</span><span class="v">${S.turnCount}</span>
      <span class="k">Pemain</span><span class="v">${S.players.length}</span></div>`
  const m = openModal('restart', modalShell('Mulai Ulang?', body,
    `<button class="btn ghost" data-close>Batal</button><button class="btn danger" data-act="yes">Ya, Mulai Ulang</button>`, false))
  $('[data-act="yes"]', m).onclick = () => { localStorage.removeItem(SAVE_KEY); S = null; gameOverShown = false; closeModal(); openSetup(); render() }
}

/* ============================================================
 * 20. SIMPAN / MUAT
 * ============================================================ */
function saveGame() {
  if (!S) return
  try {
    const ok = ['roll', 'buy', 'auction', 'debt', 'end', 'trade', 'over'].includes(S.phase)
    if (!ok) return
    localStorage.setItem(SAVE_KEY, JSON.stringify({ v: 1, at: Date.now(), state: JSON.parse(E.serialize(S)) }))
  } catch (e) { /* penyimpanan penuh — abaikan */ }
}

function saveSettings() {
  try { localStorage.setItem(SET_KEY, JSON.stringify(settings)) } catch {}
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SET_KEY)
    if (raw) Object.assign(settings, JSON.parse(raw))
  } catch {}
}

function syncSoundBtn() {
  const b = $('#btnSound')
  b.classList.toggle('on', settings.sound)
  b.querySelector('.wave').style.opacity = settings.sound ? 1 : .25
  b.title = settings.sound ? 'Suara aktif' : 'Suara senyap'
}

/* ============================================================
 * 21. PAN / ZOOM
 * ============================================================ */
const view = { s: 1, x: 0, y: 0 }
let drag = null

function applyView() {
  const b = $('#board')
  b.style.transform = `translate(${view.x}px,${view.y}px) scale(${view.s})`
  $('#boardWrap').classList.toggle('zoomed', view.s > 1.02)
}

function zoomAt(factor, cx, cy) {
  const prev = view.s
  const next = clamp(prev * factor, 1, 2.8)
  const wrap = $('#boardWrap')
  const rect = wrap.getBoundingClientRect()
  const px = cx === undefined ? rect.width / 2 : cx - rect.left
  const py = cy === undefined ? rect.height / 2 : cy - rect.top
  view.x = px - (px - view.x) * (next / prev)
  view.y = py - (py - view.y) * (next / prev)
  view.s = next
  clampView()
  applyView()
}

function clampView() {
  const wrap = $('#boardWrap')
  const w = wrap.clientWidth, h = wrap.clientHeight
  const maxX = (view.s - 1) * w, maxY = (view.s - 1) * h
  view.x = clamp(view.x, -maxX, 0)
  view.y = clamp(view.y, -maxY, 0)
}

function initZoom() {
  const wrap = $('#boardWrap')
  $('#zIn').onclick = () => { SFX.click(); zoomAt(1.25) }
  $('#zOut').onclick = () => { SFX.click(); zoomAt(.8) }
  $('#zReset').onclick = () => { SFX.click(); view.s = 1; view.x = 0; view.y = 0; applyView() }
  wrap.addEventListener('wheel', (ev) => {
    ev.preventDefault()
    zoomAt(ev.deltaY < 0 ? 1.12 : .89, ev.clientX, ev.clientY)
  }, { passive: false })
  wrap.addEventListener('pointerdown', (ev) => {
    if (view.s <= 1.02) return
    drag = { x: ev.clientX, y: ev.clientY, ox: view.x, oy: view.y, id: ev.pointerId }
    wrap.setPointerCapture(ev.pointerId)
  })
  wrap.addEventListener('pointermove', (ev) => {
    if (!drag || drag.id !== ev.pointerId) return
    view.x = drag.ox + (ev.clientX - drag.x)
    view.y = drag.oy + (ev.clientY - drag.y)
    clampView(); applyView()
  })
  wrap.addEventListener('pointerup', () => { drag = null })
  wrap.addEventListener('pointercancel', () => { drag = null })
  wrap.addEventListener('dblclick', (ev) => { zoomAt(view.s > 1.5 ? .5 : 1.6, ev.clientX, ev.clientY) })
}

/* ============================================================
 * 22. INIT
 * ============================================================ */
function init() {
  loadSettings()
  if (window.matchMedia('(max-width:760px)').matches) $('#board').classList.add('compact')
  syncSoundBtn()
  buildBoard()
  initZoom()
  $('#btnSound').onclick = () => { settings.sound = !settings.sound; saveSettings(); syncSoundBtn(); if (settings.sound) SFX.click() }
  $('#btnSettings').onclick = () => { SFX.click(); openSettings() }
  $('#btnTutorial').onclick = () => { SFX.click(); openTutorial() }
  $('#btnRestart').onclick = () => { SFX.click(); requestRestart() }
  $('#btnManage').onclick = () => { SFX.click(); openManage() }
  $('#btnTrade').onclick = () => { SFX.click(); openTrade() }
  $('#btnDetail').onclick = () => { SFX.click(); openDetail(selTile ?? (S ? S.players[S.turn].pos : 0)) }
  $('#btnStats').onclick = () => { SFX.click(); S ? openStats() : toast('Belum ada permainan', 'bad') }
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && modalKind && !['buy', 'auction', 'debt', 'tradeWait', 'tradeResp', 'card', 'over'].includes(modalKind)) closeModal()
    if (ev.code === 'Space' && !modalKind && S && S.phase === 'roll' && isHuman(S.turn)) { ev.preventDefault(); doRoll() }
  })
  window.addEventListener('beforeunload', saveGame)
  const sv = savedGame()
  render()
  if (sv) {
    openModal('resume', modalShell('Lanjutkan Permainan?', `
      <div class="lead">Ditemukan permainan tersimpan di perangkat ini.</div>
      <div class="kv"><span class="k">Pemain</span><span class="v">${sv.state.players.map(p => esc(p.name)).join(', ')}</span>
        <span class="k">Giliran</span><span class="v">${sv.state.turnCount}</span>
        <span class="k">Disimpan</span><span class="v">${new Date(sv.at).toLocaleString('id-ID')}</span></div>`,
      `<button class="btn ghost" data-act="new">Permainan Baru</button><button class="btn gold" data-act="cont">Lanjutkan</button>`, true))
    $('#modal [data-act="cont"]').onclick = () => { S = sv.state; lastCardKey = ''; gameOverShown = false; closeModal(); render(); pump() }
    $('#modal [data-act="new"]').onclick = () => { localStorage.removeItem(SAVE_KEY); closeModal(); openSetup() }
  } else {
    setTimeout(openSetup, 220)
  }
}

init()

/* Debug ringan untuk pengujian otomatis (tidak menyimpan data sensitif). */
window.__empire = {
  get state() { return S },
  set state(v) { S = v },
  get phase() { return S ? S.phase : null },
  get busy() { return busy },
  get modal() { return modalKind },
  render() { render(); },
  pump() { pump(); },
  afterAction() { afterAction(); },
}
