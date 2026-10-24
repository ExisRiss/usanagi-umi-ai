/* By AlzRiss - Usanagi Umi AI */

'use strict'

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Usanagi Umi AI Tebak Gambar</title>
<style>
:root{--bg:#08070b;--line:rgba(255,255,255,.08);--text:#fff;--muted:#9d96a9;--pink:#ff6fae;--accent:#c86bff;--good:#39d98a;--bad:#ff4d6d}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;padding:0;background:radial-gradient(circle at 50% -10%,#241033 0%,#0b0810 46%,#050407 100%);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{min-height:100vh;padding:9px}.app{width:min(100%,560px);margin:auto}
.header{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:9px}
.brand{display:flex;align-items:center;gap:10px}.avatar{width:43px;height:43px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(135deg,#ff77b4,#9b4dff);font-size:22px;box-shadow:0 8px 20px rgba(255,111,174,.28)}
.title{font-size:18px;font-weight:800;letter-spacing:-.3px}.subtitle{color:var(--muted);font-size:10.5px;margin-top:3px}
.status{padding:7px 11px;border:1px solid rgba(255,111,174,.22);border-radius:999px;background:rgba(255,111,174,.1);color:#ffd6ea;font-size:10.5px;font-weight:700;white-space:nowrap}
.card{margin-top:2px;padding:14px;border-radius:22px;border:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(255,255,255,.055),rgba(255,255,255,.012));box-shadow:0 22px 55px rgba(0,0,0,.5)}
.stage{position:relative;border-radius:12px;padding:20px 14px 16px;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='q'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23q)' opacity='.5'/%3E%3C/svg%3E"),linear-gradient(165deg,#fbf6e8,#e8dcc2);background-size:120px 120px,auto;border:9px solid #3b2819;border-radius:6px;box-shadow:0 20px 44px rgba(0,0,0,.6),inset 0 0 0 1px rgba(0,0,0,.35),inset 0 0 26px rgba(120,92,54,.22);text-align:center;overflow:hidden}
.pics{font-size:clamp(46px,15vw,72px);line-height:1.12;letter-spacing:6px;filter:drop-shadow(0 6px 10px rgba(80,60,30,.35)) drop-shadow(0 1px 0 rgba(255,255,255,.6))}
.clue{margin-top:12px;color:#4a3f52;font-size:12.5px;line-height:1.45;font-weight:600}
.cat{margin-top:9px;display:inline-block;padding:4px 10px;border-radius:6px;background:linear-gradient(160deg,#f3d9e5,#e7c6d6);border:1px solid rgba(150,80,120,.35);color:#7a3d5c;font-size:9.5px;font-weight:900;letter-spacing:.6px;text-transform:uppercase;box-shadow:inset 0 1px 0 rgba(255,255,255,.7)}
.slots{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin:16px 0 4px}
.slot{width:34px;height:42px;border-radius:11px;display:grid;place-items:center;font-size:19px;font-weight:900;background:rgba(255,255,255,.05);border:1px solid var(--line);box-shadow:inset 0 1px 0 rgba(255,255,255,.08)}
.slot.filled{background:linear-gradient(160deg,#3a2a45,#241a2e);border-color:rgba(255,111,174,.35)}
.slot.hinted{color:var(--pink);border-color:rgba(255,111,174,.5)}
.slot.ok{background:linear-gradient(160deg,#12482f,#0b2c1d);border-color:rgba(57,217,138,.6);color:#b9ffd8}
.slot.no{background:linear-gradient(160deg,#4c1424,#2c0c15);border-color:rgba(255,77,109,.6);color:#ffd0da}
.slot.gap{background:transparent;border:0;box-shadow:none;width:14px}
.bank{display:flex;flex-wrap:wrap;justify-content:center;gap:7px;margin-top:14px}
.tile{width:40px;height:44px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:linear-gradient(160deg,#2c2434,#1b1622);color:#fff;font-size:19px;font-weight:900;cursor:pointer;box-shadow:0 6px 14px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.12)}
.tile:active{transform:translateY(1px) scale(.97)}
.tile.used{opacity:.25;pointer-events:none}
.row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px}
.btn{min-height:44px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.05);color:#fff;font-size:12px;font-weight:800;cursor:pointer;outline:none}
.btn:active{transform:scale(.97)}
.btn.primary{background:linear-gradient(135deg,#ff5fa5,#c457ff);border:0}
.btn.warn{background:rgba(255,77,109,.14);border-color:rgba(255,77,109,.35)}
.btn.good{background:rgba(57,217,138,.14);border-color:rgba(57,217,138,.35)}
.stats{display:grid;grid-template-columns:repeat(4,1fr);margin-top:12px;border:1px solid var(--line);border-radius:16px;background:rgba(255,255,255,.03);overflow:hidden}
.stat{padding:10px 4px;text-align:center;border-left:1px solid var(--line)}.stat:first-child{border-left:0}
.stat b{display:block;font-size:15px}.stat span{display:block;margin-top:3px;color:var(--muted);font-size:8px;letter-spacing:.5px;text-transform:uppercase}
.info{margin-top:11px;padding:11px 12px;border-radius:15px;border:1px solid rgba(255,111,174,.16);background:rgba(255,111,174,.07);color:#ffd5e7;font-size:12px;text-align:center;min-height:40px;display:flex;align-items:center;justify-content:center}
.shake{animation:shk .4s ease}
@keyframes shk{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
.pop{animation:popz .45s cubic-bezier(.2,1.6,.4,1)}
@keyframes popz{0%{transform:scale(.85)}60%{transform:scale(1.06)}100%{transform:scale(1)}}
.overlay{position:fixed;inset:0;z-index:50;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.75);backdrop-filter:blur(8px)}
.overlay.show{display:flex}
.modal{width:min(92vw,400px);padding:22px;border-radius:22px;background:linear-gradient(145deg,#1c151e,#0f0c12);border:1px solid rgba(255,255,255,.1);box-shadow:0 25px 80px rgba(0,0,0,.65);text-align:center}
.modalIcon{font-size:50px}.modal h2{margin:4px 0;font-size:22px}.modal p{color:var(--muted);font-size:12.5px;margin:6px 0 16px}
.modalBtns{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.toast{position:fixed;left:50%;bottom:22px;z-index:60;max-width:88vw;padding:9px 13px;border-radius:12px;background:rgba(24,18,28,.96);border:1px solid rgba(255,255,255,.14);color:#fff;font-size:11.5px;font-weight:700;transform:translate(-50%,12px);opacity:0;pointer-events:none;transition:opacity .14s ease,transform .14s ease}
.toast.show{opacity:1;transform:translate(-50%,0)}
@media(max-width:420px){body{padding:7px}.title{font-size:16.5px}.slot{width:30px;height:38px;font-size:17px}.tile{width:36px;height:40px;font-size:17px}.pics{letter-spacing:3px}.row{gap:6px}}
</style>
</head>
<body>
<div class="app">
<div class="header"><div class="brand"><div class="avatar">🖼️</div><div><div class="title">Tebak Gambar ✨</div><div class="subtitle">"Lihat gambarnya, susun hurufnya!" ♡</div></div></div><div class="status" id="status">Level 1</div></div>
<div class="card">
<div class="stage" id="stage"><div class="pics" id="pics">🖼️</div><div class="clue" id="clue">Petunjuk muncul di sini.</div><div class="cat" id="cat">Umum</div></div>
<div class="slots" id="slots"></div>
<div class="bank" id="bank"></div>
<div class="row"><button class="btn good" id="hintBtn">💡 Buka Huruf</button><button class="btn warn" id="skipBtn">⏭️ Lewati</button><button class="btn" id="clearBtn">↺ Ulangi</button></div>
</div>
<div class="stats"><div class="stat"><b id="statLevel">1</b><span>Level</span></div><div class="stat"><b id="statScore">0</b><span>Skor</span></div><div class="stat"><b id="statStreak">0</b><span>Beruntun</span></div><div class="stat"><b id="statTime">0s</b><span>Waktu</span></div></div>
<div class="info" id="info">Susun huruf sesuai gambar. Ketuk huruf di bawah, ketuk kotak untuk mengembalikan.</div>
<div class="row" style="grid-template-columns:1fr 1fr"><button class="btn primary" id="newGame">♻️ Mulai dari Awal</button><button class="btn" id="sound">🔇 Suara: Mati</button></div>
</div>
<div class="overlay" id="overlay"><div class="modal"><div class="modalIcon" id="resultIcon">🎉</div><h2 id="resultTitle">Semua level selesai!</h2><p id="resultText">Kamu menebak semua gambar.</p><div class="modalBtns"><button class="btn primary" id="againBtn">Main Lagi</button><button class="btn" id="closeBtn">Tutup</button></div></div></div>
<div class="toast" id="toast"></div>
<script>
'use strict';
const $=id=>document.getElementById(id);
const stageEl=$('stage'),picsEl=$('pics'),clueEl=$('clue'),catEl=$('cat'),slotsEl=$('slots'),bankEl=$('bank'),infoEl=$('info'),statusEl=$('status'),overlay=$('overlay'),toastEl=$('toast'),resultIcon=$('resultIcon'),resultTitle=$('resultTitle'),resultText=$('resultText');
const LEVELS=[
{e:'🐘',c:'Hewan besar berbelalai panjang',a:'GAJAH',k:'Hewan'},
{e:'🦒',c:'Lehernya paling panjang di kebun binatang',a:'JERAPAH',k:'Hewan'},
{e:'🐢',c:'Jalan lambat, rumahnya di punggung',a:'KURA-KURA',k:'Hewan'},
{e:'🐝',c:'Serangga kecil penghasil madu',a:'LEBAH',k:'Hewan'},
{e:'🦈',c:'Ikan bergigi tajam di laut',a:'HIU',k:'Hewan'},
{e:'🐙',c:'Punya delapan lengan dan menyemprot tinta',a:'GURITA',k:'Hewan'},
{e:'🦅',c:'Burung pemangsa yang terbang tinggi',a:'ELANG',k:'Hewan'},
{e:'🐊',c:'Reptil bermulut besar penghuni sungai',a:'BUAYA',k:'Hewan'},
{e:'🐍',c:'Melata tanpa kaki',a:'ULAR',k:'Hewan'},
{e:'🦋',c:'Serangga bersayap indah',a:'KUPU-KUPU',k:'Hewan'},
{e:'🐜🏠',c:'Tempat tinggal serangga kecil bergotong royong',a:'RUMAH SEMUT',k:'Rebus'},
{e:'🍚🍳',c:'Makanan khas Indonesia, digoreng',a:'NASI GORENG',k:'Rebus'},
{e:'🐔🍗',c:'Lauk ayam berbalut tepung, digoreng',a:'AYAM GORENG',k:'Rebus'},
{e:'🌈',c:'Muncul di langit setelah hujan',a:'PELANGI',k:'Alam'},
{e:'🌋',c:'Gunung yang memuntahkan lava',a:'VULKAN',k:'Alam'},
{e:'⚡',c:'Kilat di langit saat hujan badai',a:'PETIR',k:'Alam'},
{e:'🌊',c:'Air laut yang bergulung ke pantai',a:'OMBAK',k:'Alam'},
{e:'🏝️',c:'Daratan yang dikelilingi laut',a:'PULAU',k:'Alam'},
{e:'🍉',c:'Buah merah berbiji banyak',a:'SEMANGKA',k:'Makanan'},
{e:'🥥',c:'Buah keras dengan air di dalamnya',a:'KELAPA',k:'Makanan'},
{e:'🍍',c:'Buah berkulit bersisik dan berjambul',a:'NANAS',k:'Makanan'},
{e:'🌽',c:'Bijinya tersusun di tongkol',a:'JAGUNG',k:'Makanan'},
{e:'🍄',c:'Tumbuh di tempat lembap dan gelap',a:'JAMUR',k:'Makanan'},
{e:'🍯',c:'Cairan manis kental dari lebah',a:'MADU',k:'Makanan'},
{e:'🥛',c:'Minuman putih dari sapi',a:'SUSU',k:'Makanan'},
{e:'🧂',c:'Bikin masakan jadi terasa asin',a:'GARAM',k:'Makanan'},
{e:'🍜',c:'Makanan berkuah dari tepung, panjang-panjang',a:'MIE AYAM',k:'Rebus'},
{e:'🚁',c:'Terbang dengan baling-baling di atas',a:'HELIKOPTER',k:'Benda'},
{e:'⚓',c:'Alat penahan kapal di dasar laut',a:'JANGKAR',k:'Benda'},
{e:'🎻',c:'Alat musik yang digesek',a:'BIOLA',k:'Benda'},
{e:'🥁',c:'Alat musik yang dipukul',a:'GENDANG',k:'Benda'},
{e:'🎺',c:'Alat musik yang ditiup, suaranya nyaring',a:'TEROMPET',k:'Benda'},
{e:'🧭',c:'Penunjuk arah utara',a:'KOMPAS',k:'Benda'},
{e:'🔭',c:'Alat untuk melihat bintang',a:'TELESKOP',k:'Benda'},
{e:'🌂',c:'Pelindung dari hujan',a:'PAYUNG',k:'Benda'},
{e:'⛵',c:'Kendaraan di air yang didorong angin',a:'PERAHU',k:'Benda'},
{e:'🚂',c:'Berjalan di atas rel sambil mengepulkan asap',a:'KERETA',k:'Benda'},
{e:'🚜',c:'Kendaraan pembajak sawah',a:'TRAKTOR',k:'Benda'},
{e:'🔨',c:'Alat untuk memukul paku',a:'PALU',k:'Benda'},
{e:'🔑',c:'Untuk membuka dan mengunci pintu',a:'KUNCI',k:'Benda'},
{e:'🪁',c:'Terbang tinggi ditarik benang',a:'LAYANG-LAYANG',k:'Benda'},
{e:'🪥',c:'Alat untuk membersihkan gigi',a:'SIKAT',k:'Benda'},
{e:'🧤',c:'Dipakai untuk melindungi tangan',a:'SARUNG TANGAN',k:'Benda'}
];
const KEY='usanagi-tebakgambar-v1';
let levels=[],idx=0,slots=[],tiles=[],locked=[],levelScore=0,score=0,streak=0,best=0,solved=0,skips=0,hints=3,soundOn=false,audioCtx=null,lockInput=false,startedAt=Date.now(),tickTimer=0;
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=a[i];a[i]=a[j];a[j]=t}return a}
function loadProgress(){try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&Number.isFinite(s.score)){score=Math.max(0,s.score|0);best=Math.max(0,s.best|0);solved=Math.max(0,s.solved|0)}soundOn=Boolean(s&&s.soundOn)}catch{}}
function saveProgress(){try{localStorage.setItem(KEY,JSON.stringify({score,best,solved,soundOn}))}catch{}}
function audio(){try{audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume()}catch{}}
function blip(freqs,dur,type,gain){if(!soundOn)return;try{audio();if(!audioCtx)return;const t=audioCtx.currentTime;const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type||'triangle';o.frequency.setValueAtTime(freqs[0],t);o.frequency.exponentialRampToValueAtTime(freqs[1],t+dur);g.gain.setValueAtTime(gain||.05,t);g.gain.exponentialRampToValueAtTime(.001,t+dur+.04);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+dur+.05)}catch{}}
function toast(text){toastEl.textContent=text;toastEl.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>toastEl.classList.remove('show'),1500)}
function startGame(){levels=shuffle(LEVELS.map((l,i)=>i));idx=0;streak=0;solved=0;skips=0;hints=3;overlay.classList.remove('show');loadLevel()}
function loadLevel(){clearInterval(tickTimer);const lv=LEVELS[levels[idx%levels.length]];const chars=lv.a.split('');slots=chars.map(ch=>({ch,letter:/[A-Z]/.test(ch),fixed:!/[A-Z]/.test(ch),value:'',hinted:false}));const need=chars.filter(c=>/[A-Z]/.test(c));const decoyCount=Math.min(6,Math.max(3,Math.round(need.length*.35)));const decoys=[];const used={};need.forEach(c=>used[c]=true);while(decoys.length<decoyCount){const c=String.fromCharCode(65+Math.floor(Math.random()*26));if(decoys.filter(d=>d===c).length>=2)continue;decoys.push(c)}tiles=shuffle(need.concat(decoys).map((c,i)=>({c,id:i,used:false})));locked=slots.map(()=>false);levelScore=0;lockInput=false;startedAt=Date.now();stageEl.classList.remove('shake');infoEl.textContent='Susun huruf sesuai gambar. Ketuk kotak untuk mengembalikan huruf.';render();tickTimer=setInterval(()=>{$('statTime').textContent=Math.floor((Date.now()-startedAt)/1000)+'s'},500)}
function currentAnswer(){return slots.map(s=>s.fixed?s.ch:(s.value||' ')).join('')}
function filled(){return slots.every(s=>s.fixed||s.value)}
function placeTile(tileIndex){const tile=tiles[tileIndex];if(!tile||tile.used||lockInput)return;const target=slots.findIndex(s=>s.letter&&!s.value&&!locked[s]);if(target<0){toast('Semua kotak sudah terisi.');return}tile.used=true;slots[target].value=tile.c;slots[target].tileId=tile.id;blip([520,760],.07);render();if(filled())checkAnswer()}
function clearSlot(i){if(lockInput||!slots[i].letter||locked[i]||!slots[i].value)return;const id=slots[i].tileId;const tile=tiles.find(t=>t.id===id);if(tile)tile.used=false;slots[i].value='';slots[i].tileId=null;slots[i].hinted=false;blip([420,320],.06);render()}
function clearAll(){if(lockInput)return;slots.forEach((s,i)=>{if(!locked[i]&&s.letter){const tile=tiles.find(t=>t.id===s.tileId);if(tile)tile.used=false;s.value='';s.tileId=null;s.hinted=false}});blip([380,300],.08);render();infoEl.textContent='Huruf dikembalikan. Coba lagi.'}
function checkAnswer(){const guess=currentAnswer();const answer=LEVELS[levels[idx%levels.length]].a;const secs=Math.floor((Date.now()-startedAt)/1000);if(guess===answer){lockInput=true;const bonus=Math.max(0,25-Math.min(25,secs));levelScore=10+streak*2+bonus;score+=levelScore;solved++;streak++;best=Math.max(best,streak);saveProgress();blip([720,1180],.12);setTimeout(()=>blip([980,1520],.12),120);slots.forEach(s=>{s.ok=true});render();stageEl.classList.add('pop');infoEl.textContent='✅ Benar! +'+levelScore+' poin'+(streak>1?' · beruntun '+streak:'')+' — lanjut ke gambar berikutnya...';setTimeout(()=>{stageEl.classList.remove('pop');idx++;if(idx>=levels.length){finish()}else{hints=Math.min(3,hints+1);loadLevel()}},1300)}else{levelScore=0;streak=0;lockInput=true;blip([300,180],.18,'sawtooth',.06);stageEl.classList.add('shake');slots.forEach(s=>{if(s.letter&&s.value)s.no=true});render();infoEl.textContent='❌ Belum tepat. Susunannya dihapus, coba lagi.';setTimeout(()=>{stageEl.classList.remove('shake');lockInput=false;slots.forEach((s,i)=>{if(!locked[i]){const tile=tiles.find(t=>t.id===s.tileId);if(tile)tile.used=false;s.value='';s.tileId=null;s.no=false;s.ok=false}});render()},760)}}
function useHint(){if(lockInput)return;if(hints<=0){toast('Bantuan habis untuk level ini.');return}const idxs=slots.map((s,i)=>i).filter(i=>slots[i].letter&&!slots[i].value&&!locked[i]);if(!idxs.length){toast('Tidak ada kotak kosong yang bisa dibuka.');return}const pick=idxs[Math.floor(Math.random()*idxs.length)];const need=slots[pick].ch;let tile=tiles.find(t=>!t.used&&t.c===need);if(!tile){const victim=tiles.find(t=>!t.used);if(victim){victim.c=need}tile=victim}if(tile){tile.used=true;slots[pick].value=tile.c;slots[pick].tileId=tile.id}slots[pick].hinted=true;locked[pick]=true;hints--;blip([880,1240],.1);render();infoEl.textContent='💡 Satu huruf dibuka. Sisa bantuan: '+hints;if(filled())checkAnswer()}
function useSkip(){if(lockInput)return;const lv=LEVELS[levels[idx%levels.length]];skips++;streak=0;lockInput=true;slots.forEach((s,i)=>{if(s.letter){s.value=s.ch;s.ok=true}});render();infoEl.textContent='⏭️ Jawabannya: '+lv.a+' — lanjut ke gambar berikutnya...';setTimeout(()=>{lockInput=false;idx++;if(idx>=levels.length)finish();else loadLevel()},1600)}
function finish(){clearInterval(tickTimer);const total=LEVELS.length;resultIcon.textContent='🏆';resultTitle.textContent='Semua gambar tertebak!';resultText.textContent='Skor '+score+' poin · level selesai '+solved+'/'+total+' · dilewati '+skips+'. Beruntun terbaik '+best+'.';blip([720,1180],.14);setTimeout(()=>blip([980,1600],.16),160);overlay.classList.add('show');saveProgress();render()}
function render(){const lv=LEVELS[levels[idx%levels.length]];picsEl.textContent=lv.e;clueEl.textContent=lv.c;catEl.textContent=lv.k;statusEl.textContent='Level '+(idx+1)+' / '+LEVELS.length;slotsEl.innerHTML='';slots.forEach((s,i)=>{const el=document.createElement('div');let cls='slot';if(!s.letter)cls+=' gap';else if(s.value)cls+=' filled';if(s.ok)cls+=' ok';if(s.no)cls+=' no';if(s.hinted)cls+=' hinted';el.className=cls;el.textContent=s.fixed?s.ch:(s.value||'');if(s.letter)el.addEventListener('click',()=>clearSlot(i));slotsEl.appendChild(el)});bankEl.innerHTML='';tiles.forEach((t,i)=>{const b=document.createElement('button');b.type='button';b.className='tile'+(t.used?' used':'');b.textContent=t.c;b.addEventListener('click',()=>placeTile(i));bankEl.appendChild(b)});$('statLevel').textContent=(idx+1);$('statScore').textContent=score;$('statStreak').textContent=streak;$('hintBtn').textContent='💡 Buka Huruf ('+hints+')';$('sound').textContent=soundOn?'🔊 Suara: Nyala':'🔇 Suara: Mati'}
$('hintBtn').addEventListener('click',useHint);$('skipBtn').addEventListener('click',useSkip);$('clearBtn').addEventListener('click',clearAll);
$('newGame').addEventListener('click',startGame);$('againBtn').addEventListener('click',startGame);$('closeBtn').addEventListener('click',()=>overlay.classList.remove('show'));
$('sound').addEventListener('click',()=>{soundOn=!soundOn;saveProgress();if(soundOn)blip([620,900],.08);render()});
loadProgress();startGame();
</script>
<script>
/* usanagi-guard-v2: (1) matikan menu tekan-lama/seleksi/seret, (2) geser di area permainan
   tidak menutup webview, (3) tombol balas SEKETIKA saat jari menyentuh supaya ambang
   tekan-lama WhatsApp tidak pernah tercapai (klik asli sesudahnya dimatikan). */
(function(){var D=document,i,evs=['contextmenu','selectstart','dragstart','gesturestart'];
for(i=0;i<evs.length;i++)D.addEventListener(evs[i],function(e){var t=e.target;if(t&&t.closest&&t.closest('textarea,input,[contenteditable]'))return;e.preventDefault()},false);
D.addEventListener('touchmove',function(e){var t=e.target,n;if(t&&t.closest&&t.closest('textarea,input,[contenteditable],.ovCard,.modal'))return;
for(n=t;n&&n!==D.body;n=n.parentElement)if(n.scrollHeight>n.clientHeight+4)return;
if(D.documentElement.scrollHeight>window.innerHeight+4)return;e.preventDefault()},{passive:false});
var sup=false,syn=false,PAD=/(btn|button|key|pad|tab|chip|cell|tile|card|lvt|opt|choice|pick|cmd|ctl|num|digit)/i;
function hit(el){for(var n=el,k=0;n&&n!==D.body&&k<5;n=n.parentElement,k++){var tn=n.tagName;
if(tn==='BUTTON'||tn==='A'||tn==='SUMMARY')return true;
if(n.getAttribute&&n.getAttribute('role')==='button')return true;
if(n.className&&typeof n.className==='string'&&PAD.test(n.className))return true}return false}
/* Satu ketukan = satu aksi: klik buatan kita dibedakan dari klik asli lewat isTrusted,
   jadi urutan keduanya tidak lagi bisa membuat aksi jalan dua kali. */
var g=null;
D.addEventListener('pointerdown',function(e){if(e.button)return;var t=e.target;
if(!t||!t.dispatchEvent||!hit(t))return;
if(t.closest&&t.closest('textarea,input,select,[contenteditable]'))return;
var x=e.clientX,y=e.clientY,gg={done:0};g=gg;
setTimeout(function(){
if(gg.done)return;gg.done=1;if(e.defaultPrevented)return;syn=true;
try{t.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0}))}catch(err){}
syn=false;setTimeout(function(){if(g===gg)g=null},700)},0)},true);
D.addEventListener('click',function(e){
if(syn||!g)return;var gg=g;g=null;
if(!gg.done){gg.done=1;return}
if(e.isTrusted){e.stopPropagation();e.preventDefault()}},true)})();
</script>
<style>
html,body{overscroll-behavior:none;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none}
img,canvas,svg{-webkit-user-drag:none;-webkit-touch-callout:none}
textarea,input,select,[contenteditable]{-webkit-user-select:text;user-select:text}
button,[role="button"],a,.btn,.key,.pad,.tab,.lvt,.chip,.cell,.tile,.card{-webkit-user-select:none;user-select:none;touch-action:manipulation}
canvas{touch-action:none}
</style>
<!-- usanagi-polish -->
<style>
*{-webkit-tap-highlight-color:transparent;text-rendering:optimizeLegibility}
button,[role="button"],.btn,.tile,a{-webkit-user-select:none;user-select:none;transition:transform .07s ease,filter .16s ease,box-shadow .22s ease}
canvas,svg,img{-webkit-user-drag:none;user-select:none}
::selection{background:rgba(212,180,143,.35)}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-thumb{background:rgba(255,111,174,.4);border-radius:99px}
::-webkit-scrollbar-track{background:transparent}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation-duration:.001ms!important}}
/* ── lapisan HD Usanagi ─────────────────────────────
   cahaya ruang dari kiri-atas + vignette + butiran halus supaya layar
   tidak terasa datar. Tidak mengubah tata letak sama sekali. */
html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility}
canvas,img,svg{-webkit-user-drag:none;-webkit-user-select:none;user-select:none}
html::after{content:"";position:fixed;inset:0;z-index:9;pointer-events:none;background-image:radial-gradient(122% 82% at 16% -12%,rgba(255,255,255,.11),rgba(255,255,255,0) 58%),radial-gradient(132% 112% at 92% 118%,rgba(0,0,0,.20),rgba(0,0,0,0) 62%),url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.06'/%3E%3C/svg%3E");background-size:auto,auto,160px 160px}
</style>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return

  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🖼️', key: reactionKey } }).catch(() => {})

  await conn.relayMessage(
    m.chat,
    {
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2,
        botMetadata: {},
      },
      botForwardedMessage: {
        message: {
          richResponseMessage: {
            messageType: 1,
            submessages: [
              {
                messageType: 2,
                messageText: 'Usanagi Umi AI Tebak Gambar 🖼️',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'usanagi-ai-tebakgambar-2026',
                  sections: [
                    {
                      view_model: {
                        primitive: {
                          __typename: 'GenAIaeacdsnwHtmlPrimitive',
                          payload: html,
                          trusted_sources: [],
                        },
                        __typename: 'GenAISingleLayoutViewModel',
                      },
                    },
                  ],
                })
              ).toString('base64'),
            },
            contextInfo: {
              forwardingScore: 1,
              isForwarded: true,
              forwardedAiBotMessageInfo: {
                botJid: '867051314767696@bot',
              },
              forwardOrigin: 4,
            },
          },
        },
      },
    },
    {}
  )
}

handler.help = ['tebakgambar', 'tebakpic', 'gambarkata']
handler.tags = ['game']
handler.command = /^(tebakgambar|tebakpic|gambarkata)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Game Tebak Gambar Usanagi Umi AI — 40 level emoji, huruf diacak, ada bantuan huruf dan bonus waktu'

export default handler
