/*
 *
 * /trading1 — Simulator trading saham & kripto.
 *
 * Setiap pengguna punya akun sendiri: saldo cash, portofolio, harga rata-rata,
 * riwayat transaksi, dan laba/rugi yang dihitung seperti trading sungguhan.
 *
 * Cara kerja mesin harga:
 *   Harga bergerak mengikuti random walk dengan volatilitas per aset, ditarik
 *   perlahan ke harga acuan (mean reversion) supaya tidak meledak. Satu "tick"
 *   pasar = 45 detik. Simulasi TIDAK memakai timer: setiap kali ada perintah,
 *   mesin mengejar tick yang tertinggal. Jadi tidak ada timer yang menumpuk
 *   saat plugin di-reload dan posisi tetap aman setelah bot restart.
 *
 * Semua state ada di global.db.data.trading1 sehingga ikut tersimpan oleh
 * mekanisme database bot.
 */

/* ------------------------------- konfigurasi ------------------------------ */

const TICK_MS = 45 * 1000;          // 1 tick pasar
const MAX_STEPS = 240;              // batas langkah saat mengejar ketinggalan
const HISTORY_MAX = 120;            // titik grafik yang disimpan per aset
const TRADE_HISTORY_MAX = 25;       // riwayat transaksi per akun
const FEE_RATE = 0.0015;            // biaya transaksi 0,15%
const WELCOME_BONUS = 25000;        // modal awal gratis
const MIN_DEPOSIT = 1000;           // setoran minimum dari saldo bot
const MIN_TRADE = 100;              // nilai transaksi minimum
const TICK_LABEL = 24;              // jumlah tick untuk kolom "perubahan"

/**
 * vol    = volatilitas per tick (0.022 = 2,2%)
 * drift  = kecenderungan naik/turun per tick
 * spread = selisih harga beli & jual (likuiditas)
 */
const ASSETS = [
  { s: 'UMIC', n: 'Umi Coin',       base: 152000,  vol: 0.022, drift: 0.0006, spread: 0.0030, tag: 'kripto' },
  { s: 'GOLD', n: 'Emas Digital',   base: 1250000, vol: 0.004, drift: 0.0003, spread: 0.0010, tag: 'komoditas' },
  { s: 'ALZR', n: 'AlzRiss Corp',   base: 8450,    vol: 0.011, drift: 0.0004, spread: 0.0015, tag: 'saham' },
  { s: 'NERO', n: 'NeroTech',       base: 12750,   vol: 0.018, drift: 0.0007, spread: 0.0022, tag: 'saham' },
  { s: 'SAWT', n: 'Sawit Jaya',     base: 3200,    vol: 0.008, drift: 0.0002, spread: 0.0018, tag: 'komoditas' },
  { s: 'SBNK', n: 'Sawit Bank',     base: 5600,    vol: 0.006, drift: 0.0002, spread: 0.0012, tag: 'saham' },
  { s: 'KOPI', n: 'Kopi Nusantara', base: 18750,   vol: 0.013, drift: 0.0003, spread: 0.0020, tag: 'komoditas' },
  { s: 'GAME', n: 'GameVerse',      base: 950,     vol: 0.028, drift: 0.0009, spread: 0.0035, tag: 'kripto' },
];

const SPEC = Object.fromEntries(ASSETS.map(a => [a.s, a]));

/* --------------------------------- utilitas -------------------------------- */

const NF = new Intl.NumberFormat('id-ID');

const num = value => (Number.isFinite(Number(value)) ? Number(value) : 0);

/** 1234567 -> "1.234.567" */
function fmt(value) {
  return NF.format(Math.round(num(value)));
}

/** Harga: desimal hanya untuk nilai kecil. */
function fmtPrice(value) {
  const v = num(value);
  return v >= 100 ? NF.format(Math.round(v)) : NF.format(Number(v.toFixed(2)));
}

/** Jumlah aset tanpa nol yang tidak perlu. */
function fmtQty(value) {
  const v = num(value);
  if (Number.isInteger(v)) return String(v);
  return String(Number(v.toFixed(4)));
}

/** Angka bertanda untuk laba/rugi. */
function signed(value) {
  const v = num(value);
  return `${v >= 0 ? '+' : '−'}${fmt(Math.abs(v))}`;
}

function pctText(value, digits = 2) {
  const v = num(value);
  return `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(digits)}%`;
}

function arrow(value) {
  const v = num(value);
  if (v > 0.05) return '📈';
  if (v < -0.05) return '📉';
  return '➖';
}

/** Bilangan acak berdistribusi normal (Box–Muller). */
function gauss() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Grafik batang dari deretan harga. */
function spark(values) {
  const list = Array.isArray(values) ? values : [];
  if (list.length < 2) return '────────';
  const chars = '▁▂▃▄▅▆▇█';
  const min = Math.min(...list);
  const max = Math.max(...list);
  const span = max - min || 1;
  return list
    .map(v => chars[Math.min(7, Math.max(0, Math.floor(((v - min) / span) * 7.99)))])
    .join('');
}

function bar(percent, width = 12) {
  const filled = Math.max(0, Math.min(width, Math.round((Math.abs(percent) / 100) * width)));
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function code(lines) {
  return ['```', ...lines, '```'].join('\n');
}

/* --------------------------------- state ----------------------------------- */

/** Ambil state permainan, buat kalau belum ada. */
function ensureState() {
  const data = global.db?.data;
  if (!data) return null;

  if (!data.trading1 || typeof data.trading1 !== 'object') {
    const assets = {};
    for (const a of ASSETS) {
      assets[a.s] = { price: a.base, prevClose: a.base, high: a.base, low: a.base, history: [a.base] };
    }
    data.trading1 = {
      createdAt: Date.now(),
      lastTick: Date.now(),
      assets,
      accounts: {},
      orders: [],
      orderSeq: 1,
      tickCount: 0,
    };
  }

  const state = data.trading1;
  // Jaga-jaga kalau struktur dari versi lama tidak lengkap.
  if (!state.assets) state.assets = {};
  if (!state.accounts) state.accounts = {};
  if (!Array.isArray(state.orders)) state.orders = [];
  if (!state.orderSeq) state.orderSeq = 1;
  if (!state.tickCount) state.tickCount = 0;
  for (const a of ASSETS) {
    if (!state.assets[a.s]) {
      state.assets[a.s] = { price: a.base, prevClose: a.base, high: a.base, low: a.base, history: [a.base] };
    }
    const asset = state.assets[a.s];
    if (!Array.isArray(asset.history) || !asset.history.length) asset.history = [num(asset.price) || a.base];
    if (!num(asset.price)) asset.price = a.base;
    if (!num(asset.high)) asset.high = asset.price;
    if (!num(asset.low)) asset.low = asset.price;
  }
  if (!num(state.lastTick)) state.lastTick = Date.now();

  return state;
}

/** Satu langkah pasar untuk semua aset. */
function stepOnce(state) {
  for (const a of ASSETS) {
    const asset = state.assets[a.s];
    const price = num(asset.price) || a.base;
    // Ditarik perlahan ke harga acuan supaya tidak meledak atau mati.
    const pull = 0.02 * Math.log(a.base / price);
    const shock = a.vol * gauss();
    let next = price * Math.exp(pull + a.drift + shock);
    next = Math.max(a.base * 0.05, Math.min(a.base * 20, next));

    asset.prevClose = price;
    asset.price = Number(next.toFixed(2));
    asset.high = Math.max(num(asset.high), asset.price);
    asset.low = Math.min(num(asset.low) || asset.price, asset.price);
    asset.history.push(asset.price);
    if (asset.history.length > HISTORY_MAX) asset.history.shift();
  }
  state.tickCount = num(state.tickCount) + 1;
}

/** Selesaikan order limit yang harganya sudah tersentuh. */
function runOrders(state) {
  if (!state.orders.length) return;
  const pending = [];

  for (const order of state.orders) {
    const asset = state.assets[order.symbol];
    const account = state.accounts[order.jid];
    if (!asset || !account) continue;

    const price = num(asset.price);
    const touched = order.side === 'beli' ? price <= num(order.limit) : price >= num(order.limit);
    if (!touched) {
      pending.push(order);
      continue;
    }

    // Harga eksekusi mengikuti harga limit kalau pasar sudah melewatinya.
    const fill = order.side === 'beli' ? Math.min(num(order.limit), price) : Math.max(num(order.limit), price);
    const result = order.side === 'beli'
      ? buyMarket(state, account, order.symbol, num(order.qty), fill)
      : sellMarket(state, account, order.symbol, num(order.qty), fill);

    if (result.ok) {
      pushHistory(account, {
        type: 'limit',
        side: order.side,
        symbol: order.symbol,
        qty: num(order.qty),
        price: num(result.price),
        value: num(result.value),
        fee: num(result.fee),
        pnl: num(result.pnl) || 0,
      });
    } else {
      pushHistory(account, {
        type: 'limit_batal',
        side: order.side,
        symbol: order.symbol,
        qty: num(order.qty),
        price: num(order.limit),
        value: 0,
        fee: 0,
        pnl: 0,
        note: result.error,
      });
    }
  }

  state.orders = pending;
}

/** Stop loss & take profit dievaluasi tiap tick. */
function runStops(state) {
  for (const account of Object.values(state.accounts)) {
    for (const [symbol, holding] of Object.entries(account.holdings || {})) {
      const asset = state.assets[symbol];
      if (!asset) continue;
      const price = num(asset.price);

      const hitSl = num(holding.sl) > 0 && price <= num(holding.sl);
      const hitTp = num(holding.tp) > 0 && price >= num(holding.tp);
      if (!hitSl && !hitTp) continue;

      const qty = num(holding.qty);
      const result = sellMarket(state, account, symbol, qty, price);
      if (result.ok) {
        pushHistory(account, {
          type: hitSl ? 'stop_loss' : 'take_profit',
          side: 'jual',
          symbol,
          qty,
          price: num(result.price),
          value: num(result.value),
          fee: num(result.fee),
          pnl: num(result.pnl),
        });
      }
    }
  }
}

/** Majukan pasar sampai waktu sekarang. */
function advance(state) {
  const now = Date.now();
  const raw = Math.floor((now - num(state.lastTick)) / TICK_MS);
  if (raw <= 0) return 0;

  const steps = Math.min(raw, MAX_STEPS);
  for (let i = 0; i < steps; i++) stepOnce(state);

  // Kalau bot lama mati, lompat ke sekarang alih-alih mengejar ribuan tick.
  state.lastTick = raw > MAX_STEPS ? now : num(state.lastTick) + steps * TICK_MS;

  runOrders(state);
  runStops(state);
  return steps;
}

/* --------------------------------- akun ------------------------------------ */

function accountFor(state, jid, name, create = false) {
  let account = state.accounts[jid];
  if (!account && create) {
    account = state.accounts[jid] = {
      jid,
      name: name || '',
      createdAt: Date.now(),
      cash: WELCOME_BONUS,
      holdings: {},
      realized: 0,
      fees: 0,
      deposit: 0,
      withdraw: 0,
      bonus: WELCOME_BONUS,
      trades: 0,
      history: [],
    };
  }
  if (account) {
    if (!account.holdings) account.holdings = {};
    if (!Array.isArray(account.history)) account.history = [];
    if (!num(account.cash) && account.cash !== 0) account.cash = 0;
    if (!name && !account.name) account.name = '';
  }
  return account;
}

function pushHistory(account, entry) {
  account.history.unshift({ t: Date.now(), ...entry });
  if (account.history.length > TRADE_HISTORY_MAX) account.history.length = TRADE_HISTORY_MAX;
}

function holdingValue(state, account) {
  let value = 0;
  for (const [symbol, holding] of Object.entries(account.holdings || {})) {
    const asset = state.assets[symbol];
    if (!asset) continue;
    value += num(holding.qty) * num(asset.price);
  }
  return value;
}

function equityOf(state, account) {
  return num(account.cash) + holdingValue(state, account);
}

/** Laba/rugi berjalan dibandingkan total setoran (termasuk bonus). */
function pnlOf(state, account) {
  const modal = num(account.deposit) + num(account.bonus) - num(account.withdraw);
  return equityOf(state, account) - modal;
}

/* ------------------------------ transaksi -------------------------------- */

function findAsset(state, input) {
  const key = String(input || '').toUpperCase();
  if (state.assets[key] && SPEC[key]) return key;
  const byName = ASSETS.find(a => a.n.toUpperCase().startsWith(key) && key.length >= 3);
  return byName ? byName.s : null;
}

function symbolTag(asset) {
  return SPEC[asset.symbol]?.tag || '';
}

function buyMarket(state, account, symbol, qty, overridePrice = null) {
  const spec = SPEC[symbol];
  const asset = state.assets[symbol];
  if (!spec || !asset) return { ok: false, error: 'Aset tidak dikenal.' };

  const amount = num(qty);
  if (amount <= 0) return { ok: false, error: 'Jumlah tidak valid.' };

  const price = overridePrice !== null ? num(overridePrice) : num(asset.price) * (1 + spec.spread / 2);
  const gross = amount * price;
  if (gross < MIN_TRADE) return { ok: false, error: `Nilai transaksi minimum ${fmt(MIN_TRADE)}.` };

  const fee = gross * FEE_RATE;
  const total = gross + fee;
  if (num(account.cash) < total) {
    return { ok: false, error: `Cash kurang ${fmt(total - num(account.cash))}.` };
  }

  account.cash = num(account.cash) - total;
  account.fees = num(account.fees) + fee;
  account.trades = num(account.trades) + 1;

  const holding = account.holdings[symbol] || (account.holdings[symbol] = { qty: 0, avg: 0, sl: 0, tp: 0 });
  // Biaya transaksi masuk ke harga rata-rata, seperti portofolio sungguhan.
  holding.avg = (num(holding.avg) * num(holding.qty) + total) / (num(holding.qty) + amount);
  holding.qty = num(holding.qty) + amount;

  return { ok: true, price, value: gross, fee, pnl: 0, qty: amount };
}

function sellMarket(state, account, symbol, qty, overridePrice = null) {
  const spec = SPEC[symbol];
  const asset = state.assets[symbol];
  if (!spec || !asset) return { ok: false, error: 'Aset tidak dikenal.' };

  const holding = account.holdings?.[symbol];
  if (!holding || num(holding.qty) <= 0) return { ok: false, error: 'Kamu tidak punya aset ini.' };

  const amount = Math.min(num(qty), num(holding.qty));
  if (amount <= 0) return { ok: false, error: 'Jumlah tidak valid.' };

  const price = overridePrice !== null ? num(overridePrice) : num(asset.price) * (1 - spec.spread / 2);
  const gross = amount * price;
  if (gross < MIN_TRADE) return { ok: false, error: `Nilai transaksi minimum ${fmt(MIN_TRADE)}.` };

  const fee = gross * FEE_RATE;
  const net = gross - fee;
  const costBasis = amount * num(holding.avg);
  const pnl = net - costBasis;

  account.cash = num(account.cash) + net;
  account.fees = num(account.fees) + fee;
  account.realized = num(account.realized) + pnl;
  account.trades = num(account.trades) + 1;

  holding.qty = num(holding.qty) - amount;
  if (holding.qty <= 0.0000001) delete account.holdings[symbol];

  return { ok: true, price, value: gross, fee, pnl, qty: amount };
}

/* -------------------------------- tampilan -------------------------------- */

function changePct(asset, ticks = TICK_LABEL) {
  const history = asset.history || [];
  const price = num(asset.price);
  const index = Math.max(0, history.length - 1 - ticks);
  const ref = num(history[index]) || price;
  if (!ref) return 0;
  return ((price - ref) / ref) * 100;
}

function header(title, emoji = '💹') {
  return `╭─「 ${emoji} ${title} 」`;
}

function footer() {
  return '╰───────────────';
}

function marketTable(state, limit = 8) {
  const lines = ['SIMBOL  HARGA       Δ24      TREN'];
  for (const a of ASSETS.slice(0, limit)) {
    const asset = state.assets[a.s];
    const change = changePct(asset);
    const price = fmtPrice(asset.price).padStart(9);
    const delta = `${change >= 0 ? '+' : '−'}${Math.abs(change).toFixed(1)}%`.padStart(6);
    lines.push(`${a.s.padEnd(6)} ${price}  ${delta}  ${spark(asset.history.slice(-14))}`);
  }
  return code(lines);
}

function accountCard(state, account) {
  const equity = equityOf(state, account);
  const pnl = pnlOf(state, account);
  const modal = num(account.deposit) + num(account.bonus) - num(account.withdraw);
  const roi = modal > 0 ? (pnl / modal) * 100 : 0;

  return [
    header('AKUN TRADING'),
    `│ 👤 ${account.name || 'Tanpa nama'}`,
    `│ 💵 Cash      : ${fmt(account.cash)}`,
    `│ 📦 Portofolio: ${fmt(holdingValue(state, account))}`,
    `│ 💼 Equity    : ${fmt(equity)}`,
    `│ 📊 Modal     : ${fmt(modal)}`,
    `│ ${pnl >= 0 ? '🟢' : '🔴'} P/L       : ${signed(pnl)} (${pctText(roi, 1)})`,
    `│ 🧾 Transaksi : ${fmt(account.trades)} · biaya ${fmt(account.fees)}`,
    footer(),
  ].join('\n');
}

/* -------------------------------- handler --------------------------------- */

let handler = async function (m, { conn, args, usedPrefix }) {
  const state = ensureState();
  if (!state) return m.reply('❌ Database belum siap. Coba lagi sebentar lagi.');

  const ticked = advance(state);
  const name = (() => {
    try { return conn.getName(m.sender) || ''; } catch { return ''; }
  })();

  const sub = String(args?.[0] || '').toLowerCase();
  const rest = args?.slice(1) || [];
  const P = `${usedPrefix}trading1`;
  const reply = text => m.reply(text.trim());

  /* ------------------------------ bantuan ------------------------------- */
  const helpText = [
    header('TRADING SIMULATOR'),
    '│ Simulasi jual-beli saham & kripto',
    '│ Tiap pengguna punya akun sendiri.',
    footer(),
    '',
    '*PERINTAH*',
    code([
      `${P}                 dashboard`,
      `${P} market            daftar harga`,
      `${P} cek <SIMBOL>      detail aset`,
      `${P} beli <SIMBOL> <jml|all>`,
      `${P} jual <SIMBOL> <jml|all>`,
      `${P} limit beli <SIMBOL> <jml> <harga>`,
      `${P} limit jual <SIMBOL> <jml> <harga>`,
      `${P} order             order terbuka`,
      `${P} batal <id>        batalkan order`,
      `${P} portofolio        rincian aset`,
      `${P} riwayat           transaksi terakhir`,
      `${P} sl <SIMBOL> <harga>   stop loss`,
      `${P} tp <SIMBOL> <harga>   take profit`,
      `${P} setor <jumlah>    isi saldo trading`,
      `${P} tarik <jumlah>    ambil ke saldo bot`,
      `${P} top               papan peringkat`,
    ]),
    '',
    `⏱️ Pasar bergerak tiap ${TICK_MS / 1000} detik · biaya transaksi ${(FEE_RATE * 100).toFixed(2)}%`,
    `💡 Contoh: ${P} beli UMIC 3`,
  ].join('\n');

  if (!sub || ['help', 'bantuan', 'menu', '?', 'dashboard'].includes(sub)) {
    const account = accountFor(state, m.sender, name, false);

    if (!account) {
      return reply([
        header('TRADING SIMULATOR'),
        '│ Kamu belum punya akun trading.',
        '│',
        `│ Modal awal gratis: ${fmt(WELCOME_BONUS)}`,
        footer(),
        '',
        'Buat akun dengan:',
        `*${P} daftar*`,
        '',
        `Lalu lihat daftar perintah: *${P} bantuan*`,
      ].join('\n'));
    }

    return reply([
      accountCard(state, account),
      '',
      '*PASAR*',
      marketTable(state),
      '',
      ticked > 0 ? `_Pasar bergerak ${ticked} tick sejak kunjungan terakhir._\n` : '',
      `Ketik *${P} bantuan* untuk semua perintah.`,
    ].filter(Boolean).join('\n'));
  }

  /* -------------------------------- daftar ------------------------------ */
  if (['daftar', 'register', 'buka'].includes(sub)) {
    if (accountFor(state, m.sender, name, false)) {
      return reply('ℹ️ Kamu sudah punya akun trading. Lihat dengan *' + P + '*');
    }
    const account = accountFor(state, m.sender, name, true);
    return reply([
      header('AKUN DIBUKA'),
      `│ 👤 ${account.name || 'Trader baru'}`,
      `│ 🎁 Modal awal: ${fmt(WELCOME_BONUS)}`,
      `│ 💵 Cash      : ${fmt(account.cash)}`,
      footer(),
      '',
      'Selamat trading! Mulai dengan:',
      `*${P} market* lalu *${P} beli UMIC 1*`,
    ].join('\n'));
  }

  /* -------------------------------- market ------------------------------ */
  if (['market', 'pasar', 'harga'].includes(sub)) {
    const lines = ['SIMBOL  NAMA              HARGA'];
    for (const a of ASSETS) {
      lines.push(`${a.s.padEnd(6)} ${a.n.padEnd(16)} ${fmtPrice(state.assets[a.s].price).padStart(10)}`);
    }
    const rows = ASSETS.map(a => {
      const asset = state.assets[a.s];
      const change = changePct(asset);
      return `${a.s.padEnd(6)} ${`${change >= 0 ? '+' : '−'}${Math.abs(change).toFixed(2)}%`.padStart(7)} ${arrow(change)} ${spark(asset.history.slice(-16))}`;
    });

    return reply([
      header('PASAR', '📊'),
      `│ Bergerak tiap ${TICK_MS / 1000} detik`,
      footer(),
      '',
      code(lines),
      '',
      `*PERUBAHAN ${TICK_LABEL} TICK TERAKHIR*`,
      code(rows),
      '',
      `Harga beli & jual berbeda tipis karena spread.\nLihat satu aset: *${P} cek UMIC*`,
    ].join('\n'));
  }

  /* --------------------------------- cek -------------------------------- */
  if (['cek', 'detail', 'info'].includes(sub)) {
    const symbol = findAsset(state, rest[0]);
    if (!symbol) return reply(`❌ Simbol tidak dikenal.\nContoh: *${P} cek UMIC*`);
    const spec = SPEC[symbol];
    const asset = state.assets[symbol];
    const change24 = changePct(asset, 24);
    const changeAll = changePct(asset, HISTORY_MAX);
    const reference = num(asset.history[0]) || spec.base;

    return reply([
      header(`${symbol} · ${spec.n}`, '🔎'),
      `│ Kategori : ${spec.tag}`,
      `│ Harga    : ${fmtPrice(asset.price)}`,
      `│ Beli     : ${fmtPrice(asset.price * (1 + spec.spread / 2))}`,
      `│ Jual     : ${fmtPrice(asset.price * (1 - spec.spread / 2))}`,
      `│ Δ24      : ${pctText(change24)} ${arrow(change24)}`,
      `│ Δ sejak awal: ${pctText(changeAll)}`,
      `│ Tertinggi: ${fmtPrice(asset.high)}`,
      `│ Terendah : ${fmtPrice(asset.low)}`,
      `│ Volatilitas: ${(spec.vol * 100).toFixed(1)}% / tick`,
      footer(),
      '',
      code([spark(asset.history), `${fmtPrice(reference)} → ${fmtPrice(asset.price)}`]),
      '',
      `Beli: *${P} beli ${symbol} 1*`,
    ].join('\n'));
  }

  /* ------------------------------- beli/jual ---------------------------- */
  if (['beli', 'buy', 'jual', 'sell'].includes(sub)) {
    const side = ['beli', 'buy'].includes(sub) ? 'beli' : 'jual';
    const account = accountFor(state, m.sender, name, false);
    if (!account) return reply(`❌ Kamu belum punya akun. Buat dulu: *${P} daftar*`);

    const symbol = findAsset(state, rest[0]);
    if (!symbol) return reply(`❌ Simbol tidak dikenal.\nContoh: *${P} ${side} UMIC 1*`);

    const spec = SPEC[symbol];
    const asset = state.assets[symbol];
    const rawQty = String(rest[1] || '').toLowerCase();

    let qty;
    if (rawQty === 'all' || rawQty === 'semua') {
      qty = side === 'beli'
        // 0.999 memberi ruang untuk pembulatan float agar tidak ditolak
        // sebagai "cash kurang 0".
        ? (num(account.cash) * 0.999) / (num(asset.price) * (1 + spec.spread / 2) * (1 + FEE_RATE))
        : num(account.holdings?.[symbol]?.qty);
    } else {
      qty = Number(rawQty);
    }

    if (!Number.isFinite(qty) || qty <= 0) {
      return reply([
        '❌ Jumlah tidak valid.',
        `Contoh: *${P} ${side} ${symbol} 5*`,
        `Atau semua sekaligus: *${P} ${side} ${symbol} all*`,
      ].join('\n'));
    }

    const result = side === 'beli'
      ? buyMarket(state, account, symbol, qty)
      : sellMarket(state, account, symbol, qty);

    if (!result.ok) return reply(`❌ ${result.error}`);

    pushHistory(account, {
      type: 'market',
      side,
      symbol,
      qty: result.qty,
      price: result.price,
      value: result.value,
      fee: result.fee,
      pnl: result.pnl,
    });

    const holding = account.holdings?.[symbol];
    const lines = [
      header(side === 'beli' ? 'PEMBELIAN BERHASIL' : 'PENJUALAN BERHASIL', side === 'beli' ? '🟢' : '🔴'),
      `│ Aset   : ${symbol} · ${spec.n}`,
      `│ Jumlah : ${fmtQty(result.qty)}`,
      `│ Harga  : ${fmtPrice(result.price)}`,
      `│ Nilai  : ${fmt(result.value)}`,
      `│ Biaya  : ${fmt(result.fee)}`,
    ];

    if (side === 'beli') lines.push(`│ Cash   : ${fmt(account.cash)}`);
    else lines.push(`│ ${result.pnl >= 0 ? '🟢' : '🔴'} P/L    : ${signed(result.pnl)}`);

    if (holding) lines.push(`│ Rata²  : ${fmtPrice(holding.avg)} · ${fmtQty(holding.qty)} unit`);
    lines.push(footer());

    const equity = equityOf(state, account);
    lines.push('', `💼 Equity sekarang: *${fmt(equity)}*`);

    return reply(lines.join('\n'));
  }

  /* ------------------------------ limit order --------------------------- */
  if (['limit', 'pasang'].includes(sub)) {
    const account = accountFor(state, m.sender, name, false);
    if (!account) return reply(`❌ Kamu belum punya akun. Buat dulu: *${P} daftar*`);

    const side = ['jual', 'sell'].includes(String(rest[0] || '').toLowerCase()) ? 'jual' : 'beli';
    const symbol = findAsset(state, rest[1]);
    if (!symbol) return reply(`❌ Simbol tidak dikenal.\nContoh: *${P} limit beli UMIC 5 140000*`);

    const qty = String(rest[2] || '').toLowerCase() === 'all'
      ? num(account.holdings?.[symbol]?.qty)
      : Number(rest[2]);
    const limit = Number(rest[3]);
    const asset = state.assets[symbol];

    if (!Number.isFinite(qty) || qty <= 0) {
      return reply(`❌ Jumlah tidak valid.\nContoh: *${P} limit ${side} ${symbol} 5 ${fmt(asset.price)}*`);
    }
    if (!Number.isFinite(limit) || limit <= 0) {
      return reply(`❌ Harga limit tidak valid.\nContoh: *${P} limit ${side} ${symbol} 5 ${fmt(asset.price)}*`);
    }
    if (side === 'jual' && num(account.holdings?.[symbol]?.qty) < qty) {
      return reply(`❌ Kamu hanya punya ${fmtQty(num(account.holdings?.[symbol]?.qty))} ${symbol}.`);
    }

    const now = num(asset.price);
    const immediate = side === 'beli' ? limit >= now : limit <= now;
    if (immediate) {
      return reply([
        '❌ Harga limit sudah terlewati.',
        `Harga sekarang ${fmtPrice(now)}, jadi order akan langsung tereksekusi.`,
        `Gunakan *${P} ${side} ${symbol} ${fmtQty(qty)}* untuk transaksi harga pasar.`,
      ].join('\n'));
    }

    if (side === 'beli') {
      const need = qty * limit * (1 + FEE_RATE);
      // Order beli yang masih terbuka ikut menahan dana supaya satu saldo tidak
      // dipakai berulang oleh beberapa order sekaligus.
      const held = state.orders
        .filter(o => o.jid === m.sender && o.side === 'beli')
        .reduce((total, o) => total + num(o.qty) * num(o.limit) * (1 + FEE_RATE), 0);
      const available = num(account.cash) - held;
      if (available < need) {
        return reply([
          `❌ Dana tidak cukup untuk menahan order ini.`,
          `Butuh ${fmt(need)}, tersedia ${fmt(Math.max(0, available))}.`,
          held > 0 ? `_Sebagian cash sudah tertahan oleh order terbuka._` : '',
        ].filter(Boolean).join('\n'));
      }
    }

    const order = {
      id: num(state.orderSeq) + 1,
      jid: m.sender,
      symbol,
      side,
      qty,
      limit,
      createdAt: Date.now(),
    };
    state.orderSeq = order.id;
    state.orders.push(order);

    return reply([
      header('ORDER DIPASANG', '⏳'),
      `│ ID     : #${order.id}`,
      `│ ${side === 'beli' ? 'Beli' : 'Jual'}   : ${fmtQty(qty)} ${symbol}`,
      `│ Limit  : ${fmtPrice(limit)}`,
      `│ Harga  : ${fmtPrice(now)}`,
      `│ Nilai  : ${fmt(qty * limit)}`,
      footer(),
      '',
      'Order tereksekusi otomatis saat harga menyentuh limit.',
      `Cek dengan *${P} order*, batalkan dengan *${P} batal ${order.id}*`,
    ].join('\n'));
  }

  /* -------------------------------- order ------------------------------- */
  if (['order', 'orders', 'terbuka'].includes(sub)) {
    const mine = state.orders.filter(o => o.jid === m.sender);
    if (!mine.length) return reply(`📭 Tidak ada order terbuka.\nPasang dengan: *${P} limit beli UMIC 5 140000*`);

    const lines = ['ID   ASET   SISI   JUMLAH      LIMIT'];
    for (const o of mine) {
      lines.push(`#${String(o.id).padEnd(4)} ${o.symbol.padEnd(6)} ${o.side.padEnd(6)} ${fmtQty(o.qty).padStart(8)} ${fmtPrice(o.limit).padStart(10)}`);
    }

    return reply([
      header('ORDER TERBUKA', '📋'),
      `│ ${mine.length} order menunggu`,
      footer(),
      '',
      code(lines),
      '',
      `Batalkan: *${P} batal <id>*`,
    ].join('\n'));
  }

  /* --------------------------------- batal ------------------------------ */
  if (['batal', 'cancel'].includes(sub)) {
    const id = Number(String(rest[0] || '').replace(/\D/g, ''));
    const index = state.orders.findIndex(o => o.id === id && o.jid === m.sender);
    if (!Number.isFinite(id) || index < 0) return reply(`❌ Order #${rest[0]} tidak ditemukan.`);

    const [order] = state.orders.splice(index, 1);
    return reply([
      header('ORDER DIBATALKAN', '🗑️'),
      `│ ID    : #${order.id}`,
      `│ Aset  : ${order.symbol}`,
      `│ Sisi  : ${order.side}`,
      `│ Jumlah: ${fmtQty(order.qty)}`,
      `│ Limit : ${fmtPrice(order.limit)}`,
      footer(),
    ].join('\n'));
  }

  /* ------------------------------ portofolio ---------------------------- */
  if (['portofolio', 'portfolio', 'pf', 'aset'].includes(sub)) {
    const account = accountFor(state, m.sender, name, false);
    if (!account) return reply(`❌ Kamu belum punya akun. Buat dulu: *${P} daftar*`);

    const entries = Object.entries(account.holdings || {});
    if (!entries.length) {
      return reply([
        accountCard(state, account),
        '',
        '📭 Belum ada aset. Mulai dengan:',
        `*${P} beli UMIC 1*`,
      ].join('\n'));
    }

    const lines = ['ASET   JUMLAH    RATA²      HARGA      P/L'];
    let totalPnl = 0;

    for (const [symbol, holding] of entries) {
      const asset = state.assets[symbol];
      if (!asset) continue;
      const spec = SPEC[symbol];
      const bid = num(asset.price) * (1 - spec.spread / 2);
      const gross = num(holding.qty) * bid;
      const net = gross * (1 - FEE_RATE);
      const pnl = net - num(holding.qty) * num(holding.avg);
      totalPnl += pnl;
      lines.push(
        `${symbol.padEnd(6)} ${fmtQty(holding.qty).padStart(7)} ${fmtPrice(holding.avg).padStart(10)} ${fmtPrice(asset.price).padStart(10)} ${`${pnl >= 0 ? '+' : '−'}${fmt(Math.abs(pnl))}`.padStart(11)}`
      );
    }

    const equity = equityOf(state, account);
    const modal = num(account.deposit) + num(account.bonus) - num(account.withdraw);
    const roi = modal > 0 ? (pnlOf(state, account) / modal) * 100 : 0;

    return reply([
      header('PORTOFOLIO'),
      `│ 💼 Equity    : ${fmt(equity)}`,
      `│ 💵 Cash      : ${fmt(account.cash)}`,
      `│ ${totalPnl >= 0 ? '🟢' : '🔴'} P/L berjalan: ${signed(totalPnl)}`,
      `│ 📊 ${bar(roi)} ${pctText(roi, 1)}`,
      footer(),
      '',
      code(lines),
      '',
      `Jual: *${P} jual ${entries[0][0]} 1*`,
    ].join('\n'));
  }

  /* -------------------------------- riwayat ----------------------------- */
  if (['riwayat', 'history', 'log'].includes(sub)) {
    const account = accountFor(state, m.sender, name, false);
    if (!account) return reply(`❌ Kamu belum punya akun. Buat dulu: *${P} daftar*`);
    if (!account.history.length) return reply('📭 Belum ada transaksi.');

    const lines = account.history.slice(0, 12).map(entry => {
      const time = new Date(num(entry.t));
      const clock = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
      const label = {
        market: `${entry.side} pasar`,
        limit: `limit ${entry.side}`,
        stop_loss: 'STOP LOSS',
        take_profit: 'TAKE PROFIT',
        limit_batal: 'limit gagal',
      }[entry.type] || entry.type;
      const extra = entry.type === 'limit_batal'
        ? `(${entry.note || 'dibatalkan'})`
        : entry.side === 'jual'
          ? `P/L ${signed(entry.pnl)}`
          : '—';
      return `${clock} ${label.padEnd(14)} ${entry.symbol.padEnd(5)} ${fmtQty(entry.qty).padStart(6)} @ ${fmtPrice(entry.price).padStart(9)} ${extra}`;
    });

    return reply([
      header('RIWAYAT TRANSAKSI', '🧾'),
      `│ ${account.history.length} transaksi terakhir`,
      `│ Biaya total: ${fmt(account.fees)}`,
      `│ Realized P/L: ${signed(account.realized)}`,
      footer(),
      '',
      code(lines),
    ].join('\n'));
  }

  /* ------------------------------- sl / tp ------------------------------ */
  if (['sl', 'tp', 'stoploss', 'takeprofit'].includes(sub)) {
    const account = accountFor(state, m.sender, name, false);
    if (!account) return reply(`❌ Kamu belum punya akun. Buat dulu: *${P} daftar*`);

    const isSl = ['sl', 'stoploss'].includes(sub);
    const symbol = findAsset(state, rest[0]);
    if (!symbol) return reply(`❌ Simbol tidak dikenal.\nContoh: *${P} ${isSl ? 'sl' : 'tp'} UMIC ${fmt(num(state.assets.UMIC.price) * 0.95)}*`);

    const holding = account.holdings?.[symbol];
    if (!holding) return reply(`❌ Kamu tidak punya ${symbol}. Beli dulu: *${P} beli ${symbol} 1*`);

    const rawValue = String(rest[1] || '').toLowerCase();
    const value = ['off', 'hapus', '0', '-'].includes(rawValue) ? 0 : Number(rest[1]);
    if (!Number.isFinite(value) || value < 0) return reply('❌ Harga tidak valid. Isi `0` untuk menghapus.');

    holding[isSl ? 'sl' : 'tp'] = value;

    if (!value) return reply(`✅ Batas ${isSl ? 'stop loss' : 'take profit'} untuk ${symbol} dihapus.`);

    const now = num(state.assets[symbol].price);
    const distance = ((value - now) / now) * 100;
    return reply([
      header(isSl ? 'STOP LOSS DIPASANG' : 'TAKE PROFIT DIPASANG', isSl ? '🛡️' : '🎯'),
      `│ Aset    : ${symbol}`,
      `│ Sekarang: ${fmtPrice(now)}`,
      `│ Batas   : ${fmtPrice(value)}`,
      `│ Jarak   : ${pctText(distance)}`,
      footer(),
      '',
      `Posisi otomatis dijual saat harga menyentuh ${fmtPrice(value)}.`,
      `Matikan dengan: *${P} ${isSl ? 'sl' : 'tp'} ${symbol} 0*`,
    ].join('\n'));
  }

  /* ------------------------------- setor -------------------------------- */
  if (['setor', 'deposit', 'isi'].includes(sub)) {
    const account = accountFor(state, m.sender, name, false);
    if (!account) return reply(`❌ Kamu belum punya akun. Buat dulu: *${P} daftar*`);

    const user = global.db.data.users?.[m.sender];
    if (!user) return reply('❌ Data pengguna tidak ditemukan.');

    const amount = Number(String(rest[0] || '').replace(/\D/g, ''));
    if (!Number.isFinite(amount) || amount < MIN_DEPOSIT) {
      return reply(`❌ Setoran minimum ${fmt(MIN_DEPOSIT)}.\nContoh: *${P} setor 10000*`);
    }
    if (num(user.money) < amount) {
      return reply(`❌ Saldo bot kamu hanya ${fmt(user.money)}.\nCari uang dulu lewat game atau fitur lain.`);
    }

    user.money = num(user.money) - amount;
    account.cash = num(account.cash) + amount;
    account.deposit = num(account.deposit) + amount;

    return reply([
      header('SETORAN BERHASIL', '⬇️'),
      `│ Setor  : ${fmt(amount)}`,
      `│ Cash   : ${fmt(account.cash)}`,
      `│ Saldo bot: ${fmt(user.money)}`,
      footer(),
    ].join('\n'));
  }

  /* -------------------------------- tarik ------------------------------- */
  if (['tarik', 'withdraw', 'ambil'].includes(sub)) {
    const account = accountFor(state, m.sender, name, false);
    if (!account) return reply(`❌ Kamu belum punya akun. Buat dulu: *${P} daftar*`);

    const user = global.db.data.users?.[m.sender];
    if (!user) return reply('❌ Data pengguna tidak ditemukan.');

    const raw = String(rest[0] || '').toLowerCase();
    const amount = raw === 'all' || raw === 'semua'
      ? Math.floor(num(account.cash))
      : Number(raw.replace(/\D/g, ''));

    if (!Number.isFinite(amount) || amount < MIN_TRADE) {
      return reply(`❌ Jumlah minimum ${fmt(MIN_TRADE)}.\nContoh: *${P} tarik 10000*`);
    }
    if (num(account.cash) < amount) {
      return reply(`❌ Cash trading hanya ${fmt(account.cash)}.`);
    }

    account.cash = num(account.cash) - amount;
    account.withdraw = num(account.withdraw) + amount;
    user.money = num(user.money) + amount;

    return reply([
      header('PENARIKAN BERHASIL', '⬆️'),
      `│ Tarik  : ${fmt(amount)}`,
      `│ Cash   : ${fmt(account.cash)}`,
      `│ Saldo bot: ${fmt(user.money)}`,
      footer(),
      '',
      '_Jual aset dulu kalau cash masih kurang._',
    ].join('\n'));
  }

  /* --------------------------------- top -------------------------------- */
  if (['top', 'papan', 'peringkat', 'leaderboard'].includes(sub)) {
    const traders = Object.values(state.accounts)
      .map(account => ({ account, equity: equityOf(state, account) }))
      .sort((a, b) => b.equity - a.equity)
      .slice(0, 10);

    if (!traders.length) return reply('📭 Belum ada trader terdaftar.');

    const medals = ['🥇', '🥈', '🥉'];
    const lines = traders.map((item, index) => {
      const pnl = pnlOf(state, item.account);
      return `${(medals[index] || `${index + 1}.`).padEnd(3)} ${(item.account.name || 'Anonim').slice(0, 14).padEnd(15)} ${fmt(item.equity).padStart(12)} ${signed(pnl).padStart(11)}`;
    });

    return reply([
      header('PAPAN PERINGKAT', '🏆'),
      `│ ${Object.keys(state.accounts).length} trader terdaftar`,
      `│ Tick pasar: ${fmt(state.tickCount)}`,
      footer(),
      '',
      code(lines),
      '',
      '_Diurutkan berdasarkan equity (cash + nilai portofolio)._',
    ].join('\n'));
  }

  /* ------------------------------- fallback ----------------------------- */
  return reply([
    `❓ Sub-perintah *${sub}* tidak dikenal.`,
    '',
    `Ketik *${P} bantuan* untuk daftar perintah.`,
  ].join('\n'));
};

handler.help = ['trading1 <perintah>'];
handler.tags = ['game'];
handler.command = /^(trading1)$/i;

export default handler;
