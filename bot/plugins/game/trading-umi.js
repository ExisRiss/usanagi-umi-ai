/**
 * UMI TRADE — pusat kendali pasar $AS langsung dari WhatsApp
 *
 * Perintah:
 *   .trading                 ringkasan akun (kas, aset, peringkat, posisi, sesi pasar)
 *   .trading <token>         kontrol akun lewat login token (token akun website)
 *   .trading off             lepas tautan token
 *   .tradingkaya             papan peringkat trader terkaya
 *   .tradingmiskin           papan peringkat trader termiskin
 *   .peringkat kaya|miskin   bentuk lain papan peringkat
 *   .pasar                   daftar harga 10 emiten + status sesi naik
 *   .belisaham <saham> <lot> beli saham   (contoh: .belisaham UMI 5)
 *   .jualsaham <saham> <lot> jual saham   (contoh: .jualsaham UMI 5)
 *   .redeem <kode>           tukar kode saldo $AS
 *   .tradinglogin            kode masuk 6 digit + tautan web trading
 *   .tradingoffline          buka game trading di WhatsApp (rich HTML, main langsung)
 *   .tradingoffline file     kirim versi berkas HTML untuk dibuka di browser
 *
 * Portofolio/transaksi memakai token akun tersimpan; tanpa token tampil panduan login.
 * Token game dibaca dari lib/webgame.json atau env UMI_GAME_TOKEN / GAME_TOKEN.
 *
 * Nama perintah sengaja diberi akhiran "saham/trading" supaya tidak bentrok dengan
 * plugin lama yang sudah memakai kata polos (kaya, miskin, beli, jual, market).
 *
 * Catatan teknis: berkas plugin dibatasi ES2020 — operator ||= dan ??= tidak boleh dipakai.
 * By AlzRiss - Usanagi Umi AI
 */
import { marketHtml, portfolioHtml, leaderboardHtml, receiptHtml, sendRichInfo } from '../../lib/rich-info-cards.js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONFIG_FILE = path.resolve(__dirname, '../../lib/webgame.json')
const LINKS_FILE = path.resolve(__dirname, '../../lib/trading-links.json')
const OFFLINE_CANDIDATES = [
  process.env.UMI_TRADING_OFFLINE_FILE,
  path.resolve(__dirname, '../../db-mirror/assets/trading-offline.bot.html'),
  path.resolve(process.cwd(), 'game/assets/trading-offline.bot.html'),
  path.resolve(process.cwd(), 'assets/trading-offline.bot.html'),
].filter(Boolean)

const TIMEOUT_MS = 20000

/* Rich HTML game trading (jalur sama dengan game-sonic). */
let richGame = { html: null, kirim: null }
async function richSender() {
  if (!richGame.kirim) {
    const [{ kirimForwardSigned }, mod] = await Promise.all([
      import('../../lib/awang-rich-forward.js'),
      import('./trading-wa-html.js'),
    ])
    richGame = { kirim: kirimForwardSigned, html: mod.TRADING_WA_HTML }
  }
  return richGame
}
const COMMANDS = [
  // status akun / login token
  'trading', 'saham', 'trader', 'portofolio', 'astrade', 'umitrade',
  // papan peringkat
  'tradingkaya', 'kayatrade', 'tradingmiskin', 'miskintrade', 'peringkat',
  // pasar
  'pasar', 'harga', 'marketas',
  // order
  'belisaham', 'belias', 'jualsaham', 'jualas',
  // lain-lain
  'redeem', 'tradinglogin', 'kodetrading', 'tradingoffline', 'toffline', 'toff',
]

/* ── konfigurasi ── */
let configCache = { at: 0, value: null }
function loadConfig() {
  if (configCache.value && Date.now() - configCache.at < 30000) return configCache.value
  let parsed = {}
  try { parsed = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) } catch { }
  const token = String(parsed.token || process.env.UMI_GAME_TOKEN || process.env.GAME_TOKEN || '').trim()
  const baseUrl = String(parsed.baseUrl || process.env.UMI_GAME_BASE || 'https://game.example.com').replace(/\/+$/, '')
  configCache = { at: Date.now(), value: { enabled: parsed.enabled !== false, baseUrl, token } }
  return configCache.value
}

/* ── simpanan tautan token per nomor (hanya di server) ── */
let linksCache = null
function loadLinks() {
  if (linksCache && Date.now() - linksCache.at < 15000) return linksCache.value
  let data = {}
  try { data = JSON.parse(fs.readFileSync(LINKS_FILE, 'utf8')) } catch { }
  if (!data || typeof data !== 'object') data = {}
  linksCache = { at: Date.now(), value: data }
  return data
}
function saveLinks() {
  try { fs.mkdirSync(path.dirname(LINKS_FILE), { recursive: true }); fs.writeFileSync(LINKS_FILE, JSON.stringify(linksCache.value, null, 2)) } catch { }
}
function linkFor(number) { return loadLinks()[number] || null }
function setLink(number, token) {
  const data = loadLinks()
  if (token) data[number] = { token, at: Date.now() }
  else delete data[number]
  linksCache = { at: Date.now(), value: data }
  saveLinks()
}

/* ── HTTP ke server game ── */
async function callGame(config, pathname, { method = 'GET', body, bot = false, auth } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (bot) {
    if (!config.token) throw new Error('Token game belum diatur (lib/webgame.json / UMI_GAME_TOKEN).')
    headers['X-UMI-Game-Token'] = config.token
  }
  if (auth) headers.Authorization = `Bearer ${auth}`
  const res = await fetch(`${config.baseUrl}${pathname}`, {
    method, headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  let data = {}
  try { data = await res.json() } catch { }
  if (!res.ok) {
    const err = new Error(String(data.error || `Server game membalas HTTP ${res.status}`))
    err.payload = data
    err.status = res.status
    throw err
  }
  return data
}
const isToken = (value) => /^[A-Za-z0-9_-]{16,200}$/.test(String(value || '')) && /\d/.test(String(value))
const money = (n) => Number(n || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const signed = (n) => `${Number(n) >= 0 ? '+' : '-'}$${'AS'} ${money(Math.abs(Number(n) || 0))}`
const numOr = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback)

/* Panduan login token — dipakai saat token belum ada / tidak valid. */
function tokenTutorial(prefix = '.', reason = '') {
  const head = reason
    ? `⚠️ *${reason}*`
    : '🔑 *LOGIN PAKAI TOKEN AKUN*'
  return [
    head,
    '',
    'Token akun diambil dari website Umi:',
    '1. Buka https://jadibot-alzriss.gwenna.my.id/#profile',
    '2. Masuk pakai akun kamu (email/Google).',
    '3. Cari bagian *Token Akun* → salin tokennya.',
    `4. Kirim ke bot: ${prefix}trading login <token>`,
    '',
    `Contoh: ${prefix}trading login 8f2c1d9a...`,
    '',
    '🌐 Main lewat browser: https://game.example.com/trading',
    'Tempel token yang sama di tab *Token Website* di sana.',
    '',
    'Belum punya token? Buat baru di halaman Profil — token lama otomatis tidak berlaku.',
    'Token cuma disimpan di server bot, tidak ditampilkan di chat.',
  ].join('\n')
}

/* ── sesi bot untuk akun WA: kode sekali pakai ditukar jadi token sesi ── */
const sessionCache = new Map()
async function waSession(number, force) {
  const cached = sessionCache.get(number)
  if (!force && cached && cached.expiresAt - Date.now() > 60000) return cached.token
  const config = loadConfig()
  const data = await callGame(config, '/api/trading/bot/login-code', { method: 'POST', bot: true, body: { number, kind: 'login' } })
  const redeem = await callGame(config, '/api/trading/code-login', { method: 'POST', body: { code: data.code } })
  const token = String(redeem.token || '')
  if (!token) throw new Error('Gagal membuat sesi trading.')
  sessionCache.set(number, { token, expiresAt: Number(data.expiresAt) || Date.now() + 19 * 60000 })
  return token
}
async function ensureAccount(number, name) {
  const config = loadConfig()
  const data = await callGame(config, '/api/trading/bot/register', { method: 'POST', bot: true, body: { number, name: name || undefined, username: number } })
  return data
}
async function sessionFor(number, name, force) {
  await ensureAccount(number, name)
  return waSession(number, force)
}

/* ── tampilan ── */
function accountCard(summary, session, extra, prefix = '.') {
  const rows = []
  rows.push('╭─〔 💹 UMI TRADE 〕')
  rows.push(`│ 👤 ${summary.username || '-'}${summary.number ? ` · wa.me/${summary.number}` : ''}`)
  rows.push('├─ Saldo')
  rows.push(`│ 💵 Kas      : $AS ${money(summary.balance)}`)
  rows.push(`│ 📈 Saham    : $AS ${money(summary.equity)}`)
  rows.push(`│ 🏦 Total    : $AS ${money(summary.netWorth)}`)
  rows.push(`│ ${summary.unrealized >= 0 ? '🟢' : '🔴'} Floating : ${signed(summary.unrealized)}`)
  rows.push(`│ ✅ Realized : ${signed(summary.realized)}`)
  rows.push(`│ 🏆 Peringkat: #${summary.rank || '-'} dari ${summary.total || 0}`)
  if (summary.richest) rows.push(`│ 👑 Terkaya  : ${summary.richest.username} · $AS ${money(summary.richest.netWorth)}`)
  if (summary.positions && summary.positions.length) {
    rows.push('├─ Portofolio')
    summary.positions.slice(0, 8).forEach((pos) => {
      rows.push(`│ • ${pos.sym || pos.symbol || '—'} ${Number(pos.qty).toFixed(2)} lot @ ${money(pos.avgPrice)}`)
      rows.push(`│   nilai $AS ${money(pos.value)} · ${pos.pl >= 0 ? '+' : ''}$${'AS'} ${money(pos.pl)}`)
    })
  } else {
    rows.push(`├─ Portofolio kosong — ketik ${prefix}pasar lalu ${prefix}belisaham UMI 5`)
  }
  if (session) {
    rows.push('├─ Pasar')
    rows.push('│ 🌙 Pasar normal 24 jam (tanpa sesi boost)')
    if (session.timezone) rows.push(`│ Zona       : ${session.timezone}`)
  }
  if (extra) rows.push(`├─ ${extra}`)
  rows.push('╰────────────────')
  rows.push(`Tips: ${prefix}pasar · ${prefix}belisaham UMI 5 · ${prefix}jualsaham UMI 5 · ${prefix}tradingkaya · ${prefix}tradingoffline (main di chat)`)
  return rows.join('\n')
}

function boardCard(rows, mode, total, prefix = '.') {
  if (!rows || !rows.length) return `📊 Papan peringkat masih kosong. Ajak teman pakai ${prefix}trading!`
  const isRich = mode === 'rich'
  const head = isRich ? '🏆 *TRADER TERKAYA*' : '🪙 *TRADER TERMISKIN*'
  const body = rows.map((row) => {
    const medal = row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : row.rank === 3 ? '🥉' : `${row.rank}.`
    const who = row.number ? `${row.username} (wa.me/${row.number})` : row.username
    return `${medal} ${who}\n   💰 $AS ${money(row.netWorth)} · kas ${money(row.balance)} · ${row.positions || 0} emiten`
  }).join('\n')
  return `${head}\n━━━━━━━━━━━━━━━\n${body}\n━━━━━━━━━━━━━━━\nTotal ${total || rows.length} trader · ubah nasibmu dengan ${prefix}trading`
}

function marketCard(market, prefix = '.') {
  const ses = market.session || {}
  const rows = (market.symbols || []).map((q) => {
    const up = numOr(q.changePct, numOr(q.pct, 0)) >= 0
    const pct = numOr(q.changePct, numOr(q.pct, 0))
    // API pasar memakai kunci `sym`; dulu hanya `q.symbol` sehingga daftar
    // harga tampil sebagai "*undefined*".
    const code = q.sym || q.symbol || '—'
    return `${up ? '🟢' : '🔴'} *${code}* $AS ${money(q.price)}  ${up ? '+' : ''}${money(pct)}%`
  }).join('\n')
  return `📊 *PASAR $AS* · 🌙 pasar normal 24 jam\n${ses.timezone ? `zona ${ses.timezone} · tanpa sesi boost` : 'tanpa sesi boost'}\n━━━━━━━━━━━━━━━\n${rows}\n━━━━━━━━━━━━━━━\nBeli: ${prefix}belisaham KODE LOT · Jual: ${prefix}jualsaham KODE LOT`
}

/* ── game offline (HTML mandiri) ── */
let offlineCache = null
async function offlineHtml(config) {
  if (offlineCache && Date.now() - offlineCache.at < 300000) return offlineCache.value
  for (const file of OFFLINE_CANDIDATES) {
    try {
      const buffer = fs.readFileSync(file)
      if (buffer.length > 20000) { offlineCache = { at: Date.now(), value: buffer }; return buffer }
    } catch { }
  }
  const urls = [`${config.baseUrl}/trading-offline.bot.html`, `${config.baseUrl}/trading-offline.html`]
  for (const url of urls) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) })
      if (!res.ok) continue
      const buffer = Buffer.from(await res.arrayBuffer())
      if (buffer.length > 20000) { offlineCache = { at: Date.now(), value: buffer }; return buffer }
    } catch { }
  }
  return null
}

/* Validasi token ke server game, lalu simpan tautan untuk nomor ini. */
async function loginWithToken(m, conn, config, number, token, prefix) {
  try {
    const login = await callGame(config, '/api/trading/login', { method: 'POST', body: { token } })
    setLink(number, token)
    sessionCache.delete(number)
    const summary={...login,account:login.user || login.account || {username:'Trader'}}
    return sendRichInfo(conn,m,portfolioHtml(summary,prefix),'UMI · PORTOFOLIO',
      'Token terhubung.\n'+accountCard({...login,username:summary.account.username},login.session,null,prefix))
  } catch (error) {
    const status = Number(error.status) || 0
    const alasan = status === 401 || status === 403
      ? 'Token tidak valid atau sudah kedaluwarsa.'
      : 'Server belum bisa memeriksa token. Coba lagi sebentar.'
    return m.reply(tokenTutorial(prefix, alasan))
  }
}

/* ── handler ── */
const handler = async (m, { conn, text, command, usedPrefix }) => {
  usedPrefix = usedPrefix || '.'
  const cmd = String(command || '').toLowerCase()
  const config = loadConfig()
  const number = String(m.sender || '').split('@')[0].split(':')[0].replace(/\D/g, '')
  const args = String(text || '').trim().split(/\s+/).filter(Boolean)
  const arg0 = (args[0] || '').toLowerCase()
  if (!config.enabled) return m.reply('⏸️ Fitur trading sedang dimatikan oleh owner.')

  /* ── game offline: main langsung di WhatsApp (rich HTML) ── */
  if (cmd === 'tradingoffline' || cmd === 'toffline' || cmd === 'toff') {
    const modeBerkas = /^(file|html|unduh|download)$/i.test(String(arg0 || '').trim())

    if (!modeBerkas) {
      try {
        const rich = await richSender()
        await rich.kirim(conn, m.chat, rich.html, '📈 UMI TRADE · MAIN DI WHATSAPP')
        return
      } catch (error) {
        console.error('[TRADING-WA]', error && error.message ? error.message : error)
        await m.reply('⚠️ Mode main langsung gagal dibuka, aku kirim versi berkasnya saja ya.')
      }
    }

    const buffer = await offlineHtml(config)
    if (!buffer) return m.reply('❌ Berkas game offline tidak ditemukan di server. Coba lagi nanti.')
    await conn.sendMessage(m.chat, {
      document: buffer,
      fileName: 'UMI-TRADE-OFFLINE.html',
      mimetype: 'text/html',
      caption: [
        '📴 *UMI TRADE OFFLINE*',
        '',
        'Game trading versi file — 100% jalan tanpa internet:',
        '• Harga dihitung sendiri di HP (tick 3 detik, 10 emiten)',
        '• Saldo & portofolio disimpan di localStorage HP kamu',
        '• Pasar bergerak 24 jam, tanpa sesi boost 02.00',
        '• Bonus harian $AS 10 + kode redeem UMI2024/TRADING/WELCOME/BONUS',
        '',
        'Cara buka: simpan berkas → buka dengan Chrome (menu ⋮ → Buka dengan) → main.',
        `Mau main langsung di chat? ketik ${usedPrefix}tradingoffline (tanpa kata "file").`,
      ].join('\n'),
    }, { quoted: m })
    return
  }

  /* ── papan peringkat ── */
  if (['tradingkaya', 'kayatrade', 'tradingmiskin', 'miskintrade', 'peringkat'].includes(cmd)) {
    const wanted = ['tradingkaya', 'kayatrade'].includes(cmd) ? 'kaya' : ['tradingmiskin', 'miskintrade'].includes(cmd) ? 'miskin' : arg0
    const data = await callGame(config, '/api/trading/leaderboard')
    const rich = wanted !== 'miskin'
    return sendRichInfo(conn,m,leaderboardHtml(rich ? data.richest || [] : data.poorest || [],rich ? 'rich':'poor',data.total,usedPrefix),'UMI · PERINGKAT TRADER',boardCard(rich ? data.richest : data.poorest, rich ? 'rich' : 'poor', data.total, usedPrefix))
  }

  /* ── daftar harga ── */
  if (['pasar','harga','marketas'].includes(cmd) || (cmd === 'saham' && !args.length) || (['trading','saham'].includes(cmd) && arg0 === 'pasar')) {
    const data = await callGame(config, '/api/trading/market')
    return sendRichInfo(conn,m,marketHtml(data,usedPrefix),'UMI · BURSA SAHAM',marketCard(data,usedPrefix))
  }

  /* ── kode masuk web ── */
  if (cmd === 'tradinglogin' || cmd === 'kodetrading') {
    const data = await callGame(config, '/api/trading/bot/login-code', { method: 'POST', bot: true, body: { number, kind: 'login' } })
    return m.reply([
      '🔐 *MASUK WEB TRADING*',
      '',
      `Kode kamu: *${data.code}*`,
      `Berlaku ${data.minutes || 20} menit (sekali pakai).`,
      '',
      `Buka: ${data.verifyUrl || config.baseUrl + '/trading'}`,
      'Masuk lewat tab *Kode bot*, atau langsung:',
      `${data.link || ''}`,
      '',
      `Ringkasan: $AS ${money(numOr(data.summary && data.summary.netWorth))} · rank #${(data.summary && data.summary.rank) || '-'}`,
    ].join('\n'))
  }

  /* ── token akun (kontrol akun via login token) ── */
  if (['trading', 'saham', 'trader', 'portofolio', 'astrade', 'umitrade'].includes(cmd) && arg0 === 'off') {
    setLink(number, '')
    return m.reply('🔓 Tautan token dilepas. Login token lagi untuk membuka portofolio.')
  }

  /* ── tukar koin RPG jadi $AS (tanpa DANA) ── */
  if (['trading', 'saham', 'trader', 'portofolio', 'astrade', 'umitrade'].includes(cmd) && ['topup', 'tukar'].includes(arg0)) {
    const koin = await import('../../lib/game-koin-topup.js')
    const jid = `${number}@s.whatsapp.net`
    const status = koin.koinStatus(jid)
    const fmt = (n) => Number(n || 0).toLocaleString('id-ID')
    const rawAmount = String(args[1] || '').trim().toLowerCase()
    if (!rawAmount) {
      return m.reply([
        '🪙 *TUKAR KOIN RPG → $AS*',
        '',
        `Koin kamu    : ${fmt(status.koinBalance)} koin`,
        `Kurs         : ${fmt(status.koinPerAs)} koin = $AS 1`,
        `Sekali tukar : ${fmt(status.minimumKoin)}–${fmt(status.maximumKoin)} koin`,
        `Harian       : ${fmt(status.usedTodayKoin)}/${fmt(status.dailyMaximumKoin)} koin`,
        '',
        `Tukar  : ${usedPrefix}trading topup <jumlah koin>`,
        `Semua  : ${usedPrefix}trading topup semua`,
        '',
        'Tanpa DANA dan tanpa uang sungguhan — koin dari quest, dungeon, dan RPG.',
      ].join('\n'))
    }
    let amount = /^(all|semua|max)$/.test(rawAmount)
      ? Math.min(status.koinBalance, status.maximumKoin)
      : Math.floor(Number(rawAmount.replace(/[.,]/g, '')))
    if (!Number.isFinite(amount) || amount <= 0) return m.reply(`📝 Contoh: ${usedPrefix}trading topup 1000`)
    let token = linkFor(number)?.token || ''
    if (!token) {
      try { token = await tradeToken(number, m) } catch (error) {
        return m.reply(`❌ ${error.message || 'Gagal membuat sesi trading.'}`)
      }
    }
    try {
      const result = await koin.convertKoin({
        jid,
        token,
        amountKoin: amount,
        reference: `wa-${number}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        credit: async ({ token: userToken, amount: creditAmount, reference }) => {
          const data = await callGame(config, '/api/trading/credit', { method: 'POST', bot: true, body: { token: config.token, userToken, amount: creditAmount, reference } })
          return { balance: Number(data.balance) || undefined }
        },
      })
      if (result.duplicate) return m.reply('ℹ️ Referensi ini sudah pernah ditukar.')
      return m.reply([
        '✅ *TUKAR KOIN BERHASIL*',
        '',
        `Koin dipakai : ${fmt(result.koin)} koin`,
        `$AS masuk    : $AS ${money(result.credited)}`,
        `Koin tersisa : ${fmt(result.koinBalance)} koin`,
        result.gameBalance ? `Kas trading  : $AS ${money(result.gameBalance)}` : '',
      ].filter(Boolean).join('\n'))
    } catch (error) {
      return m.reply(`❌ ${error.message || 'Tukar koin gagal.'}`)
    }
  }

  if (['trading', 'saham', 'trader', 'portofolio', 'astrade', 'umitrade'].includes(cmd)) {
    const sub = ['login', 'token', 'masuk'].includes(arg0)
    const raw = String(sub ? (args[1] || '') : (args[0] || '')).trim()
    const bukanToken = ['off', 'kaya', 'miskin', 'pasar', 'topup', 'tukar', 'help', 'bantuan', ''].includes(arg0)
    if (sub && !raw) return m.reply(tokenTutorial(usedPrefix))
    if (raw && (!bukanToken || sub)) return loginWithToken(m, conn, config, number, raw, usedPrefix)
  }

  /* ── beli / jual ── */
  if (['belisaham', 'belias', 'jualsaham', 'jualas'].includes(cmd)) {
    const buy = cmd.startsWith('beli')
    const symbol = (args[0] || '').toUpperCase()
    const amount = Number(String(args[1] || '').replace(',', '.'))
    if (!symbol || !Number.isFinite(amount) || amount <= 0) return m.reply(`📝 Format: ${usedPrefix}${cmd} KODE LOT\nContoh: ${usedPrefix}${cmd} UMI 5\nDaftar kode: ${usedPrefix}pasar`)
    if (!linkFor(number)?.token) return m.reply(tokenTutorial(usedPrefix))
    const token = await tradeToken(number, m)
    try {
      const result = await callGame(config, '/api/trading/trade', { method: 'POST', body: { token, symbol, side: buy ? 'buy' : 'sell', amount } })
      const price = numOr(result.price)
      const fallback = [
        `${buy ? '🟢 *PEMBELIAN BERHASIL*' : '🔴 *PENJUALAN BERHASIL*'}`,
        '',
        `${buy ? 'Beli' : 'Jual'} ${amount} lot ${symbol} @ $AS ${money(price)}`,
        `Total      : $AS ${money(numOr(result.total, price * amount))}`,
        `Kas sekarang: $AS ${money(numOr(result.balance))}`,
        `Aset        : $AS ${money(numOr(result.equity ?? result.netWorth))}`,
        result.rank ? `Peringkat   : #${result.rank}` : '',
      ].filter(Boolean).join('\n')
      return sendRichInfo(conn,m,receiptHtml({...result,side:buy?'buy':'sell',symbol,amount,total:numOr(result.total,price*amount)},usedPrefix),'UMI · BUKTI TRANSAKSI',fallback)
    } catch (error) {
      const code = Number(error.status) || 0
      if (code === 401 || code === 403) return m.reply(tokenTutorial(usedPrefix, `Sesi token tidak valid: ${error.message}`))
      const payload = error.payload || {}
      if (payload.code === 'INSUFFICIENT') return m.reply(`⚠️ Kas tidak cukup. Butuh $AS ${money(payload.need)} · kas kamu $AS ${money(payload.balance)} · maksimal ${money(payload.maxAmount)} lot.`)
      if (payload.code === 'NO_POSITION') return m.reply(`⚠️ Posisi ${symbol} tidak cukup (punya ${money(payload.holding)} lot).`)
      return m.reply(`❌ ${error.message}`)
    }
  }

  /* ── redeem kode saldo ── */
  if (cmd === 'redeem') {
    if (!args[0]) {
      const codes = await callGame(config, '/api/trading/codes')
      const list = (codes.codes || []).map((c) => `• *${c.code}* — $AS ${money(c.amount)} (sisa ${c.left})`).join('\n')
      return m.reply(`🎁 *KODE SALDO $AS*\n\n${list}\n\nTukar: ${usedPrefix}redeem KODE`)
    }
    if (!linkFor(number)?.token) return m.reply(tokenTutorial(usedPrefix))
    const token = await tradeToken(number, m)
    try {
      const result = await callGame(config, '/api/trading/redeem', { method: 'POST', body: { token, code: args[0].toUpperCase() } })
      return m.reply(`🎉 Kode *${result.code}* ditukar! +$AS ${money(result.amount)}\nKas sekarang: $AS ${money(result.balance)}`)
    } catch (error) {
      const code = Number(error.status) || 0
      if (code === 401 || code === 403) return m.reply(tokenTutorial(usedPrefix, `Sesi token tidak valid: ${error.message}`))
      return m.reply(`❌ ${error.message}`)
    }
  }

  /* ── portofolio token: data asli, HTML tanpa token/account credentials ── */
  const linked=linkFor(number)
  if(!linked?.token) return m.reply(tokenTutorial(usedPrefix))
  try {
    const me=await callGame(config, '/api/trading/me', { auth: linked.token })
    return sendRichInfo(conn,m,portfolioHtml(me,usedPrefix),'UMI · PORTOFOLIO',accountCard({...me,username:me.account?.username || 'Trader'},me.session,null,usedPrefix))
  } catch(error) {
    if(error.status===401 || error.status===403) {
      setLink(number,'')
      return m.reply(tokenTutorial(usedPrefix,'Token tersimpan sudah tidak berlaku. Login ulang dengan token akun.'))
    }
    return m.reply('Gagal memuat portofolio dari server. Coba lagi sebentar.')
  }
}

async function tradeToken(number, m) {
  const linked = linkFor(number)
  if (linked && linked.token) return linked.token
  const name = (() => {
    const user = global.db && global.db.data && global.db.data.users ? global.db.data.users[m.sender] : null
    return String((user && user.name) || m.pushName || '').trim().slice(0, 40)
  })()
  return sessionFor(number, name)
}

handler.help = COMMANDS.map((c) => `${c} ${['belisaham', 'belias', 'jualsaham', 'jualas'].includes(c) ? '<saham> <lot>' : c === 'trading' ? '[login <token>|topup <koin>|off]' : c === 'redeem' ? '[kode]' : c === 'peringkat' ? 'kaya|miskin' : ''}`.trim())
handler.tags = ['game', 'economy']
handler.description = 'Kartu rich HTML saham/pasar, portofolio akun token, peringkat trader, dan bukti transaksi langsung di pesan WhatsApp'
handler.command = new RegExp(`^(${COMMANDS.join('|')})$`, 'i')
// Tidak wajib daftar dulu: login token harus bisa langsung dari bot utama maupun jadibot.
handler.register = false
handler.limit = false

export default handler
