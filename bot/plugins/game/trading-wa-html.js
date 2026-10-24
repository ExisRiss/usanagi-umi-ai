/*
 *
 * HTML game UMI TRADE untuk WhatsApp (rich message).
 *
 * Dibuat mandiri: tanpa aset eksternal, tanpa internet. Semua harga dihitung
 * di HP pengguna dan posisi disimpan di localStorage, jadi tetap jalan di dalam
 * tampilan rich message WhatsApp. Tidak ada sesi boost 02.00 — pasar bergerak
 * 24 jam murni dari derau harga.
 *
 * Isi:
 *   - Strip pasar: jumlah emiten naik/turun + total volume (traffic)
 *   - Grafik candlestick 20 menit + bar volume (naik-turun harga)
 *   - Info saham: sektor, kapitalisasi, tertinggi/terendah 24 jam, volume,
 *     PER, dan sentimen
 *   - Beli/jual lot, portofolio, rata-rata & laba/rugi belum terealisasi
 */

export const TRADING_WA_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>UMI TRADE</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;font-family:'Segoe UI',Roboto,Arial,sans-serif}
body{background:#070b14;color:#e8eefb;padding:10px 10px 18px;font-size:13px}
#app{max-width:430px;margin:0 auto}
.hdr{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.logo{display:flex;align-items:center;gap:7px;font-weight:800;font-size:15px;letter-spacing:.3px}
.dot{width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,#22d3a6,#0e8f6f);display:flex;align-items:center;justify-content:center;font-size:13px}
.small{font-size:9px;color:#7c8aa5;font-weight:600;letter-spacing:1.4px;display:block}
.cards{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:8px}
.card{background:#0e1524;border:1px solid #1b2740;border-radius:12px;padding:8px 10px}
.card i{display:block;font-style:normal;font-size:9px;letter-spacing:1px;color:#7c8aa5;font-weight:700;margin-bottom:3px}
.card b{font-size:16px;font-variant-numeric:tabular-nums}
.up{color:#26e0a5!important}.down{color:#ff6b81!important}
/* ── strip traffic pasar ── */
.traf{display:flex;align-items:center;gap:8px;background:#0e1524;border:1px solid #1b2740;border-radius:12px;padding:7px 10px;margin-bottom:8px}
.traf .lb{font-size:9px;letter-spacing:1px;color:#7c8aa5;font-weight:700;flex:none}
.traf .bar{flex:1;height:7px;border-radius:4px;background:#ff6b81;overflow:hidden;display:flex}
.traf .bar span{display:block;height:100%;background:#26e0a5}
.traf .val{font-size:10.5px;font-weight:800;font-variant-numeric:tabular-nums;flex:none}
.traf .val .g{color:#26e0a5}.traf .val .r{color:#ff6b81}
.tabs{display:flex;gap:6px;margin-bottom:8px}
.tab{flex:1;text-align:center;padding:7px 0;border-radius:10px;background:#0e1524;border:1px solid #1b2740;font-weight:700;font-size:11px;color:#8fa0bd;cursor:pointer}
.tab.on{background:linear-gradient(135deg,#123a5c,#0d2740);border-color:#2b6ea8;color:#8fd8ff}
/* ── panel grafik ── */
.chart{background:#0e1524;border:1px solid #1b2740;border-radius:12px;padding:8px 9px 4px;margin-bottom:8px}
.chart .ct{display:flex;align-items:baseline;justify-content:space-between;gap:6px;margin-bottom:2px}
.chart .ct b{font-size:13px}
.chart .ct b small{font-size:9.5px;color:#7c8aa5;font-weight:600;letter-spacing:.4px;margin-left:4px}
.chart .ct .px{font-size:15px;font-weight:800;font-variant-numeric:tabular-nums}
.chart .ct .pc{font-size:10.5px;font-weight:800;margin-left:5px}
.chart svg{display:block;width:100%;height:auto}
.chart .legend{display:flex;justify-content:space-between;font-size:9px;color:#5d6b85;margin-top:1px}
.chart .legend .hi{color:#26e0a5}.chart .legend .lo{color:#ff6b81}
/* ── info saham ── */
.info{background:#0e1524;border:1px solid #1b2740;border-radius:12px;padding:9px 10px;margin-bottom:8px}
.info h3{font-size:9px;letter-spacing:1.2px;color:#7c8aa5;margin-bottom:6px}
.igrid{display:grid;grid-template-columns:1fr 1fr;gap:5px 10px}
.igrid div{display:flex;justify-content:space-between;gap:6px;font-size:10.5px;border-bottom:1px dashed #16213a;padding-bottom:4px}
.igrid span{color:#7c8aa5;white-space:nowrap}
.igrid b{font-weight:800;font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.badge{display:inline-block;padding:1px 6px;border-radius:999px;font-size:9px;font-weight:800;letter-spacing:.4px;border:1px solid #24344f;color:#8fa0bd}
.badge.g{border-color:rgba(38,224,165,.4);background:rgba(38,224,165,.12);color:#26e0a5}
.badge.r{border-color:rgba(255,107,129,.4);background:rgba(255,107,129,.12);color:#ff6b81}
.badge.y{border-color:rgba(255,204,87,.35);background:rgba(255,204,87,.1);color:#ffcc57}
/* ── daftar saham ── */
.row{display:flex;align-items:center;gap:8px;padding:8px;background:#0e1524;border:1px solid #1b2740;border-radius:11px;margin-bottom:6px;cursor:pointer}
.row.sel{border-color:#2b6ea8;background:#102a44}
.row .q{flex:1;min-width:0}
.row .q b{font-size:12.5px;display:block}
.row .q span{font-size:9.5px;color:#7c8aa5;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.row .p{text-align:right;font-variant-numeric:tabular-nums}
.row .p b{font-size:12.5px;display:block}
.row .p span{font-size:9.5px;font-weight:700}
.spark{width:56px;height:22px;flex:none}
.panel{background:#0e1524;border:1px solid #1b2740;border-radius:12px;padding:10px;margin-bottom:9px}
.panel h3{font-size:12px;margin-bottom:7px;color:#9fb4d6;letter-spacing:.4px}
.qtybar{display:flex;gap:6px;margin:7px 0}
.qtybar button{flex:1;padding:7px 0;border-radius:9px;border:1px solid #24344f;background:#122036;color:#cfe2ff;font-weight:800;font-size:11px;cursor:pointer}
.qtybar button:active{filter:brightness(1.4)}
input[type=number]{width:100%;padding:9px;border-radius:9px;border:1px solid #24344f;background:#0a1220;color:#e8eefb;font-size:15px;font-weight:800;text-align:center;font-variant-numeric:tabular-nums}
input[type=number]:focus{outline:none;border-color:#2b6ea8}
.acts{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:7px}
.acts button{padding:11px 0;border:none;border-radius:11px;font-weight:900;font-size:12.5px;letter-spacing:.4px;cursor:pointer;color:#04220f}
.buy{background:linear-gradient(#2ee6a7,#12a877)}
.sell{background:linear-gradient(#ff8a9a,#e04b63);color:#2a0410}
.acts button:active{transform:translateY(1px);filter:brightness(1.1)}
.hold{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px dashed #1b2740;font-size:11.5px}
.hold:last-child{border-bottom:none}
.hold .n{color:#9fb4d6}
.toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:#123a5c;border:1px solid #2b6ea8;color:#d8ecff;padding:8px 14px;border-radius:10px;font-size:11.5px;font-weight:700;opacity:0;transition:opacity .18s;pointer-events:none;max-width:92%}
.toast.show{opacity:1}
.foot{text-align:center;font-size:9px;color:#5d6b85;line-height:1.6;margin-top:6px}
.mini{display:flex;justify-content:space-between;font-size:10.5px;color:#8fa0bd;margin-top:6px}
#reset{background:none;border:1px solid #24344f;color:#8fa0bd;padding:6px 10px;border-radius:9px;font-size:10px;font-weight:700;cursor:pointer}
</style>
</head>
<body>
<div id="app">
  <div class="hdr">
    <div class="logo"><span class="dot">📈</span><div>UMI TRADE<small class="small">PASAR SAHAM · WA MODE</small></div></div>
    <button id="reset">RESET</button>
  </div>

  <div class="cards">
    <div class="card"><i>KAS</i><b id="cash">$AS 0</b></div>
    <div class="card"><i>TOTAL ASET</i><b id="equity">$AS 0</b></div>
  </div>

  <div class="traf">
    <span class="lb">TRAFFIC</span>
    <span class="bar"><span id="trafUp" style="width:50%"></span></span>
    <span class="val" id="trafVal">0 naik · 0 turun</span>
  </div>

  <div class="tabs">
    <div class="tab on" data-tab="market">PASAR</div>
    <div class="tab" data-tab="pf">PORTOFOLIO</div>
  </div>

  <div id="viewMarket">
    <div class="chart">
      <div class="ct">
        <b id="chName">UMI<small id="chSector">Teknologi</small></b>
        <span><span class="px" id="chPrice">$AS 0</span><span class="pc" id="chPct">0%</span></span>
      </div>
      <svg id="chSvg" viewBox="0 0 320 128" preserveAspectRatio="none"></svg>
      <div class="legend"><span>20 menit · tiap batang 1 menit</span><span><b class="hi" id="chHi">—</b> / <b class="lo" id="chLo">—</b></span></div>
    </div>

    <div class="info">
      <h3>INFO SAHAM <span id="infoSym">UMI</span></h3>
      <div class="igrid">
        <div><span>Harga</span><b id="iPrice">—</b></div>
        <div><span>Perubahan 24j</span><b id="iPct">—</b></div>
        <div><span>Tertinggi 24j</span><b id="iHigh">—</b></div>
        <div><span>Terendah 24j</span><b id="iLow">—</b></div>
        <div><span>Volume 24j</span><b id="iVol">—</b></div>
        <div><span>Volume 5mnt</span><b id="iVol5">—</b></div>
        <div><span>Kapitalisasi</span><b id="iCap">—</b></div>
        <div><span>PER (estimasi)</span><b id="iPer">—</b></div>
        <div><span>Sektor</span><b id="iSector">—</b></div>
        <div><span>Sentimen</span><b id="iSent" class="badge y">SIDEWAYS</b></div>
      </div>
    </div>

    <div id="stocks"></div>
  </div>

  <div id="viewPf" style="display:none">
    <div class="panel">
      <h3>KEPEMILIKAN SAHAM</h3>
      <div id="holds"><div class="hold"><span class="n">Belum ada saham.</span><span>-</span></div></div>
      <div class="mini"><span>P/L belum terealisasi</span><b id="pnl">$AS 0</b></div>
    </div>
  </div>

  <div class="panel">
    <h3 id="selName">PILIH SAHAM</h3>
    <div class="mini" style="margin:0 0 6px"><span id="selPrice">-</span><span id="selHold">dimiliki: 0 lot</span></div>
    <input id="qty" type="number" min="1" step="1" inputmode="numeric" value="1">
    <div class="qtybar">
      <button data-q="1">1</button>
      <button data-q="5">5</button>
      <button data-q="10">10</button>
      <button data-q="max">MAKS</button>
    </div>
    <div class="acts">
      <button class="buy" id="btnBuy">BELI</button>
      <button class="sell" id="btnSell">JUAL</button>
    </div>
    <div class="mini"><span>Total order</span><b id="total">$AS 0</b></div>
  </div>

  <div class="foot">Grafik & info dihitung di HP kamu · tanpa sesi boost · data tersimpan di localStorage<br>By AlzRiss - Usanagi Umi AI</div>
</div>
<div class="toast" id="toast"></div>
<script>
(function(){
"use strict";
/* ── pasar: 45 saham IDX, derau deterministik (tanpa boost) ── */
var TICK=3000;
var SAHAM=[
 {sym:'BBCA',name:'Bank Central Asia',base:4.50,sektor:'Perbankan',shares:0.42,vol:7600000,per:21.6},
 {sym:'BBRI',name:'Bank Rakyat Indonesia',base:2.25,sektor:'Perbankan',shares:1.05,vol:12400000,per:12.8},
 {sym:'BMRI',name:'Bank Mandiri',base:3.00,sektor:'Perbankan',shares:0.74,vol:9800000,per:14.2},
 {sym:'BBNI',name:'Bank Negara Indonesia',base:2.70,sektor:'Perbankan',shares:0.86,vol:7400000,per:9.7},
 {sym:'BRIS',name:'Bank Syariah Indonesia',base:1.30,sektor:'Perbankan',shares:1.35,vol:5200000,per:18.9},
 {sym:'ARTO',name:'Bank Jago',base:1.20,sektor:'Perbankan',shares:1.85,vol:6400000,per:42.5},
 {sym:'TLKM',name:'Telkom Indonesia',base:1.45,sektor:'Telekomunikasi',shares:2.40,vol:15100000,per:13.4},
 {sym:'EXCL',name:'XLSmart Telecom',base:1.15,sektor:'Telekomunikasi',shares:1.62,vol:8100000,per:16.1},
 {sym:'ISAT',name:'Indosat Ooredoo Hutchison',base:4.75,sektor:'Telekomunikasi',shares:0.55,vol:4600000,per:11.8},
 {sym:'TOWR',name:'Sarana Menara Nusantara',base:0.40,sektor:'Telekomunikasi',shares:3.10,vol:9200000,per:8.6},
 {sym:'MTEL',name:'Dayamitra Telekomunikasi',base:0.31,sektor:'Telekomunikasi',shares:2.05,vol:11200000,per:17.3},
 {sym:'ADRO',name:'Alamtri Resources Indonesia',base:1.25,sektor:'Energi',shares:2.15,vol:13800000,per:7.2},
 {sym:'PTBA',name:'Bukit Asam',base:1.40,sektor:'Energi',shares:1.48,vol:7600000,per:9.4},
 {sym:'ITMG',name:'Indo Tambangraya Megah',base:13.00,sektor:'Energi',shares:0.24,vol:1900000,per:6.1},
 {sym:'MEDC',name:'Medco Energi Internasional',base:0.65,sektor:'Energi',shares:1.95,vol:9400000,per:10.5},
 {sym:'PGAS',name:'Perusahaan Gas Negara',base:0.80,sektor:'Energi',shares:1.72,vol:8700000,per:8.2},
 {sym:'AKRA',name:'AKR Corporindo',base:0.70,sektor:'Energi',shares:1.58,vol:6900000,per:11.4},
 {sym:'ESSA',name:'ESSA Industries Indonesia',base:0.45,sektor:'Energi',shares:2.60,vol:8100000,per:14.7},
 {sym:'ICBP',name:'Indofood CBP Sukses Makmur',base:5.50,sektor:'Barang Konsumen',shares:0.68,vol:4200000,per:15.9},
 {sym:'INDF',name:'Indofood Sukses Makmur',base:3.50,sektor:'Barang Konsumen',shares:0.94,vol:6100000,per:9.1},
 {sym:'UNVR',name:'Unilever Indonesia',base:0.90,sektor:'Barang Konsumen',shares:2.30,vol:7300000,per:24.3},
 {sym:'HMSP',name:'HM Sampoerna',base:0.35,sektor:'Barang Konsumen',shares:3.40,vol:9800000,per:12.6},
 {sym:'GGRM',name:'Gudang Garam',base:7.50,sektor:'Barang Konsumen',shares:0.32,vol:1500000,per:18.4},
 {sym:'AMRT',name:'Sumber Alfaria Trijaya',base:1.45,sektor:'Barang Konsumen',shares:1.20,vol:5600000,per:31.7},
 {sym:'CPIN',name:'Charoen Pokphand Indonesia',base:2.40,sektor:'Barang Konsumen',shares:0.81,vol:4900000,per:19.2},
 {sym:'ANTM',name:'Aneka Tambang',base:0.80,sektor:'Tambang',shares:1.75,vol:10400000,per:13.8},
 {sym:'MDKA',name:'Merdeka Copper Gold',base:1.20,sektor:'Tambang',shares:1.42,vol:7200000,per:36.5},
 {sym:'TINS',name:'Timah',base:0.45,sektor:'Tambang',shares:2.20,vol:6300000,per:28.1},
 {sym:'INCO',name:'Vale Indonesia',base:1.90,sektor:'Tambang',shares:0.72,vol:3800000,per:17.6},
 {sym:'SMGR',name:'Semen Indonesia',base:2.00,sektor:'Infrastruktur',shares:0.88,vol:5400000,per:22.4},
 {sym:'INTP',name:'Indocement Tunggal Prakarsa',base:3.50,sektor:'Infrastruktur',shares:0.51,vol:2600000,per:16.8},
 {sym:'WIKA',name:'Wijaya Karya',base:0.15,sektor:'Infrastruktur',shares:3.55,vol:12400000,per:7.9},
 {sym:'PTPP',name:'PP (Persero)',base:0.20,sektor:'Infrastruktur',shares:3.20,vol:10800000,per:8.4},
 {sym:'ASII',name:'Astra International',base:2.45,sektor:'Otomotif',shares:0.92,vol:8600000,per:10.2},
 {sym:'GOTO',name:'GoTo Gojek Tokopedia',base:0.05,sektor:'Teknologi',shares:4.20,vol:32100000,per:3.1},
 {sym:'EMTK',name:'Elang Mahkota Teknologi',base:0.25,sektor:'Teknologi',shares:2.35,vol:7400000,per:11.5},
 {sym:'BUKA',name:'Bukalapak',base:0.07,sektor:'Teknologi',shares:3.85,vol:15800000,per:4.8},
 {sym:'KLBF',name:'Kalbe Farma',base:0.75,sektor:'Kesehatan',shares:1.65,vol:9600000,per:14.6},
 {sym:'SIDO',name:'Industri Jamu & Farmasi Sido Muncul',base:0.30,sektor:'Kesehatan',shares:2.75,vol:8200000,per:17.9},
 {sym:'BSDE',name:'Bumi Serpong Damai',base:0.45,sektor:'Properti',shares:2.15,vol:6700000,per:9.3},
 {sym:'CTRA',name:'Ciputra Development',base:0.50,sektor:'Properti',shares:1.95,vol:7100000,per:11.1},
 {sym:'ACES',name:'Aspirasi Hidup Indonesia',base:0.40,sektor:'Ritel',shares:2.05,vol:8400000,per:13.7},
 {sym:'MAPI',name:'Mitra Adiperkasa',base:0.80,sektor:'Ritel',shares:1.48,vol:5900000,per:14.9},
 {sym:'SCMA',name:'Surya Citra Media',base:0.10,sektor:'Ritel',shares:3.30,vol:14200000,per:6.4},
 {sym:'TPIA',name:'Chandra Asri Pacific',base:3.50,sektor:'Petrokimia',shares:0.62,vol:3400000,per:27.2},
];
var BY={}; SAHAM.forEach(function(s){BY[s.sym]=s});
function frac(n){var v=Math.sin(n*12.9898)*43758.5453;return v-Math.floor(v)}
function noise(seed,x){var i=Math.floor(x),f=x-i,a=frac(i*1.7+seed),b=frac((i+1)*1.7+seed),u=f*f*(3-2*f);return a+(b-a)*u}
function fnv(t){var h=2166136261;for(var i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0)%100000}
function r2(n){return Math.round(n*100)/100}
function r4(n){return Math.round(n*10000)/10000}
function tickNow(){return Math.floor(Date.now()/TICK)}
function priceAt(sym,tick){
  var it=BY[sym]; if(!it) return 1;
  if(tick===undefined) tick=tickNow();
  var s=fnv(sym);
  var trend=(noise(s,tick/4800)-0.5)*0.30;
  var swing=(noise(s+13,tick/240)-0.5)*0.13;
  var micro=(noise(s+41,tick/8)-0.5)*0.015;
  return Math.max(0.05,it.base*(1+trend+swing+micro));
}
/* volume per menit (deterministik) — dipakai bar traffic & info volume */
function volumeMin(sym,tick){
  var it=BY[sym], s=fnv(sym);
  var jam=noise(s+307,tick/1200);
  return it.vol/1440*(0.45+jam*1.5);
}
function quote(sym,tick){
  tick=tick===undefined?tickNow():tick;
  var price=priceAt(sym,tick), prev=priceAt(sym,tick-28800);
  var hi=price,lo=price,spark=[];
  for(var i=60;i>=0;i--){var v=priceAt(sym,tick-i);if(v>hi)hi=v;if(v<lo)lo=v;if(i%3===0)spark.push(r2(v))}
  var ch=price-prev;
  return {sym:sym,name:BY[sym].name,price:r2(price),pct:r2(ch/prev*100),change:r2(ch),spark:spark};
}
/* 24 jam terakhir: sampel tiap 5 menit (288 titik) */
function dayStats(sym,tick){
  tick=tick===undefined?tickNow():tick;
  var hi=0,lo=1e9,step=100;
  for(var i=288;i>=0;i--){var p=priceAt(sym,tick-i*step);if(p>hi)hi=p;if(p<lo)lo=p}
  var vol=0,mins=0,m=Math.floor(tick/20);
  for(var j=0;j<360;j++){vol+=volumeMin(sym,m-j*4);mins+=4}
  return {high:r2(hi),low:r2(lo),vol:vol};
}
function vol5min(sym,tick){
  tick=tick===undefined?tickNow():tick;
  var v=0,m=Math.floor(tick/20);
  for(var i=0;i<5;i++) v+=volumeMin(sym,m-i);
  return v;
}
/* candle 1 menit untuk grafik */
function candles(sym,tick,n){
  var step=20, out=[];
  for(var i=n-1;i>=0;i--){
    var t0=tick-i*step, o=priceAt(sym,t0), c=priceAt(sym,t0+step-1), hi=o, lo=o;
    for(var k=4;k<step;k+=4){var p=priceAt(sym,t0+k);if(p>hi)hi=p;if(p<lo)lo=p}
    out.push({o:o,c:c,h:hi,l:lo,v:volumeMin(sym,Math.floor(t0/20))});
  }
  return out;
}

/* ── penyimpanan ── */
var KEY='umi-wa-trade-v1';
var state=load();
function load(){
  try{var d=JSON.parse(localStorage.getItem(KEY));if(d&&typeof d.cash==='number'&&d.holds)return d}catch(e){}
  return {cash:1000,holds:{},trades:0,started:Date.now()};
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}

/* ── format & util ── */
function money(n){return (Math.round(n*100)/100).toLocaleString('id-ID',{minimumFractionDigits:2,maximumFractionDigits:2})}
function sgn(n){return (n>=0?'+':'')+money(n)}
function big(n){
  var a=Math.abs(n);
  if(a>=1e12) return (n/1e12).toLocaleString('id-ID',{maximumFractionDigits:2})+' T';
  if(a>=1e9) return (n/1e9).toLocaleString('id-ID',{maximumFractionDigits:2})+' M';
  if(a>=1e6) return (n/1e6).toLocaleString('id-ID',{maximumFractionDigits:1})+' jt';
  if(a>=1e3) return (n/1e3).toLocaleString('id-ID',{maximumFractionDigits:1})+' rb';
  return Math.round(n).toLocaleString('id-ID');
}
function $(id){return document.getElementById(id)}
var selected='BBCA', lastTick=-1;
var toastTimer=null;
function toast(msg){var el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(function(){el.classList.remove('show')},1700)}

/* ── grafik: candle + bar volume ── */
function chartSvg(cs){
  var W=320,H=88,VH=26,GAP=4,PAD=2;
  var hi=-1e9,lo=1e9,maxV=1;
  cs.forEach(function(c){if(c.h>hi)hi=c.h;if(c.l<lo)lo=c.l;if(c.v>maxV)maxV=c.v});
  var span=(hi-lo)||1, n=cs.length, slot=(W-PAD*2)/n, bw=Math.max(3,slot*0.58);
  function y(p){return PAD+(H-PAD*2)*((hi-p)/span)}
  var out='';
  /* garis bantu */
  for(var g=0;g<3;g++){
    var gy=(PAD+(H-PAD*2)*g/2).toFixed(1);
    out+='<line x1="0" x2="'+W+'" y1="'+gy+'" y2="'+gy+'" stroke="#16213a" stroke-width="1"/>';
  }
  cs.forEach(function(c,i){
    var cx=PAD+slot*i+slot/2, up=c.c>=c.o, col=up?'#26e0a5':'#ff6b81';
    var top=y(Math.max(c.o,c.c)), bot=y(Math.min(c.o,c.c));
    var bh=Math.max(1.6,bot-top);
    out+='<line x1="'+cx.toFixed(1)+'" x2="'+cx.toFixed(1)+'" y1="'+y(c.h).toFixed(1)+'" y2="'+y(c.l).toFixed(1)+'" stroke="'+col+'" stroke-width="1" opacity=".85"/>';
    out+='<rect x="'+(cx-bw/2).toFixed(1)+'" y="'+top.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+bh.toFixed(1)+'" rx="1" fill="'+col+'" opacity=".95"/>';
    var vh=(c.v/maxV)*VH;
    out+='<rect x="'+(cx-bw/2).toFixed(1)+'" y="'+(H+GAP+VH-vh).toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+vh.toFixed(1)+'" rx="1" fill="'+col+'" opacity=".32"/>';
  });
  return out;
}
function renderChart(tick){
  var q=quote(selected,tick), cs=candles(selected,tick,20);
  $('chSvg').innerHTML=chartSvg(cs);
  $('chName').childNodes[0].nodeValue=selected;
  $('chSector').textContent=BY[selected].sektor;
  $('chPrice').textContent='$AS '+money(q.price);
  $('chPct').textContent=sgn(q.pct)+'%';
  $('chPct').className='pc '+(q.pct>=0?'up':'down');
  var hiq=cs[0].h,loq=cs[0].l;
  cs.forEach(function(c){if(c.h>hiq)hiq=c.h;if(c.l<loq)loq=c.l});
  $('chHi').textContent=money(r2(hiq));
  $('chLo').textContent=money(r2(loq));
}
/* ── info saham ── */
function renderInfo(tick){
  var q=quote(selected,tick), d=dayStats(selected,tick), v5=vol5min(selected,tick), it=BY[selected];
  var cap=it.shares*1e9*q.price;
  var pct24=q.pct;
  var sent = pct24>=6?'NAIK KUAT':pct24>=1.5?'NAIK':pct24<=-6?'TURUN KUAT':pct24<=-1.5?'TURUN':'SIDEWAYS';
  var cls = pct24>=1.5?'g':pct24<=-1.5?'r':'y';
  $('infoSym').textContent=selected;
  $('iPrice').textContent='$AS '+money(q.price);
  $('iPct').textContent=sgn(pct24)+'%';
  $('iPct').className=pct24>=0?'up':'down';
  $('iHigh').textContent=money(d.high);
  $('iLow').textContent=money(d.low);
  $('iVol').textContent=big(d.vol)+' lot';
  $('iVol5').textContent=big(v5)+' lot';
  $('iCap').textContent='$AS '+big(cap);
  $('iPer').textContent=money(it.per+noise(fnv(selected)+19,tick/600)*2)+'×';
  $('iSector').textContent=it.sektor;
  $('iSent').textContent=sent;
  $('iSent').className='badge '+cls;
}
/* ── strip traffic pasar ── */
function renderTraffic(tick){
  var up=0,down=0,vol=0;
  SAHAM.forEach(function(s){
    var q=quote(s.sym,tick); if(q.pct>=0) up++; else down++;
    vol+=vol5min(s.sym,tick);
  });
  var total=up+down||1;
  $('trafUp').style.width=Math.round(up/total*100)+'%';
  $('trafVal').innerHTML='<span class="g">'+up+' naik</span> · <span class="r">'+down+' turun</span> · '+big(vol)+' lot';
}
/* ── daftar & kartu ── */
function sparkSvg(vals,up){
  var min=Math.min.apply(null,vals),max=Math.max.apply(null,vals),span=(max-min)||1;
  var pts=vals.map(function(v,i){return ((i/(vals.length-1))*54+1).toFixed(1)+','+(20-((v-min)/span)*17).toFixed(1)}).join(' ');
  var color=up?'#26e0a5':'#ff6b81';
  return '<svg class="spark" viewBox="0 0 56 22"><polyline fill="none" stroke="'+color+'" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" points="'+pts+'"/></svg>';
}
function renderStocks(tick){
  var html='';
  SAHAM.forEach(function(s){
    var q=quote(s.sym,tick);
    html+='<div class="row'+(s.sym===selected?' sel':'')+'" data-sym="'+s.sym+'">'+
      '<div class="q"><b>'+s.sym+'</b><span>'+s.name+'</span></div>'+
      sparkSvg(q.spark,q.pct>=0)+
      '<div class="p"><b>$AS '+money(q.price)+'</b><span class="'+(q.pct>=0?'up':'down')+'">'+sgn(q.pct)+'%</span></div>'+
    '</div>';
  });
  $('stocks').innerHTML=html;
  Array.prototype.forEach.call($('stocks').querySelectorAll('.row'),function(el){
    el.addEventListener('click',function(){selected=el.getAttribute('data-sym');refresh();});
  });
}
function portfolio(){
  var value=0,pnl=0;
  Object.keys(state.holds).forEach(function(sym){
    var h=state.holds[sym]; if(!h||!h.lot) return;
    var p=priceAt(sym);
    value+=p*h.lot;
    pnl+=(p-h.avg)*h.lot;
  });
  return {value:value,pnl:pnl};
}
function renderCards(){
  var pf=portfolio();
  $('cash').textContent='$AS '+money(state.cash);
  $('equity').textContent='$AS '+money(state.cash+pf.value);
  $('pnl').textContent=sgn(pf.pnl);
  $('pnl').className=pf.pnl>=0?'up':'down';
}
function renderPanel(tick){
  var q=quote(selected,tick);
  var h=state.holds[selected]||{lot:0,avg:0};
  $('selName').textContent=selected+' · '+q.name;
  $('selPrice').innerHTML='$AS '+money(q.price)+' <span class="'+(q.pct>=0?'up':'down')+'">'+sgn(q.pct)+'%</span>';
  $('selHold').textContent='dimiliki: '+h.lot+' lot · avg $AS '+money(h.avg||0);
  updateTotal();
}
function renderHolds(){
  var rows='';
  Object.keys(state.holds).forEach(function(sym){
    var h=state.holds[sym]; if(!h||!h.lot) return;
    var p=priceAt(sym), val=p*h.lot, pl=(p-h.avg)*h.lot;
    rows+='<div class="hold"><span class="n">'+sym+' · '+h.lot+' lot</span><span>$AS '+money(val)+' <b class="'+(pl>=0?'up':'down')+'">'+sgn(pl)+'</b></span></div>';
  });
  $('holds').innerHTML=rows||'<div class="hold"><span class="n">Belum ada saham.</span><span>-</span></div>';
}
function qtyValue(){
  var v=parseInt($('qty').value,10);
  return isFinite(v)&&v>0?v:1;
}
function updateTotal(){
  $('total').textContent='$AS '+money(qtyValue()*priceAt(selected));
}

/* ── aksi ── */
function buy(){
  var qy=qtyValue(), price=priceAt(selected), cost=price*qy;
  if(cost>state.cash+1e-9){toast('Saldo kurang. Butuh $AS '+money(cost)+', kas $AS '+money(state.cash));return}
  var h=state.holds[selected]||{lot:0,avg:0};
  var total=h.lot+qy;
  h.avg=(h.avg*h.lot+price*qy)/total;
  h.lot=total;
  state.holds[selected]=h;
  state.cash=r2(state.cash-cost);
  state.trades++;
  save();refresh('✅ Beli '+qy+' '+selected+' @ $AS '+money(price));
}
function sell(){
  var qy=qtyValue(), price=priceAt(selected);
  var h=state.holds[selected]||{lot:0,avg:0};
  if(h.lot<qy){toast('Saham tidak cukup. Kamu punya '+h.lot+' lot.');return}
  h.lot-=qy;
  state.cash=r2(state.cash+price*qy);
  state.trades++;
  if(h.lot<=0) delete state.holds[selected]; else state.holds[selected]=h;
  save();refresh('✅ Jual '+qy+' '+selected+' @ $AS '+money(price));
}
function refresh(msg){
  var t=tickNow();
  renderCards();renderHolds();renderChart(t);renderInfo(t);renderTraffic(t);renderStocks(t);renderPanel(t);
  if(msg) toast(msg);
}

/* ── event ── */
$('btnBuy').addEventListener('click',buy);
$('btnSell').addEventListener('click',sell);
$('qty').addEventListener('input',updateTotal);
Array.prototype.forEach.call(document.querySelectorAll('.qtybar button'),function(b){
  b.addEventListener('click',function(){
    var q=b.getAttribute('data-q');
    if(q==='max'){
      var price=priceAt(selected);
      $('qty').value=Math.max(1,Math.floor(state.cash/price));
    } else $('qty').value=q;
    updateTotal();
  });
});
Array.prototype.forEach.call(document.querySelectorAll('.tab'),function(t){
  t.addEventListener('click',function(){
    Array.prototype.forEach.call(document.querySelectorAll('.tab'),function(x){x.classList.remove('on')});
    t.classList.add('on');
    var tab=t.getAttribute('data-tab');
    $('viewMarket').style.display=tab==='market'?'block':'none';
    $('viewPf').style.display=tab==='pf'?'block':'none';
    if(tab==='pf'){renderHolds();renderCards()}
  });
});
var resetArmed=false;
$('reset').addEventListener('click',function(){
  // confirm() tidak selalu tersedia di penampil rich WhatsApp → pakai ketuk dua kali.
  if(!resetArmed){resetArmed=true;toast('Ketuk RESET sekali lagi untuk menghapus akun.');setTimeout(function(){resetArmed=false},3000);return}
  resetArmed=false;
  state={cash:1000,holds:{},trades:0,started:Date.now()};
  save();refresh('Akun direset ke $AS 1.000.');
});

/* ── tick 3 detik ── */
refresh();
setInterval(function(){
  var t=tickNow();
  if(t!==lastTick){lastTick=t;refresh()}
},TICK);
})();
</script>
</body>
</html>`

export default TRADING_WA_HTML
