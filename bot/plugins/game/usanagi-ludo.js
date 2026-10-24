
'use strict'

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Usanagi Umi AI Ludo</title>
<style>
:root{--bg:#08070b;--line:rgba(255,255,255,.08);--text:#fff;--muted:#9d96a9;--p0:#e0392f;--p1:#2fa94f;--p2:#e8b21f;--p3:#2a6fd6;--track:#f2ead8;--track2:#e3d9c2}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;padding:0;background:radial-gradient(circle at 50% -8%,#231033 0%,#0b0810 46%,#050407 100%);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{min-height:100vh;padding:9px}.app{width:min(100%,560px);margin:auto}
.header{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:9px}
.brand{display:flex;align-items:center;gap:10px}.avatar{width:43px;height:43px;border-radius:14px;display:grid;place-items:center;background:linear-gradient(135deg,#ff77b4,#9b4dff);font-size:22px;box-shadow:0 8px 20px rgba(255,111,174,.28)}
.title{font-size:18px;font-weight:800;letter-spacing:-.3px}.subtitle{color:var(--muted);font-size:10.5px;margin-top:3px}
.status{padding:7px 11px;border:1px solid rgba(255,111,174,.22);border-radius:999px;background:rgba(255,111,174,.1);color:#ffd6ea;font-size:10.5px;font-weight:700;white-space:nowrap}
.wrap{padding:11px;border-radius:22px;background:repeating-linear-gradient(97deg,rgba(255,255,255,.028) 0 2px,rgba(0,0,0,.06) 2px 4px,transparent 4px 12px),linear-gradient(172deg,#4b3222,#241610);border:1px solid rgba(0,0,0,.6);box-shadow:0 24px 60px rgba(0,0,0,.62),inset 0 2px 0 rgba(255,255,255,.14),inset 0 -3px 9px rgba(0,0,0,.65)}
.board{position:relative;display:grid;grid-template-columns:repeat(15,1fr);width:100%;aspect-ratio:1;border-radius:8px;overflow:hidden;border:1px solid rgba(0,0,0,.65);background:#0e0b13;box-shadow:inset 0 4px 12px rgba(0,0,0,.5),inset 0 -2px 6px rgba(0,0,0,.35)}
.c{position:relative;display:grid;place-items:center;min-width:0;min-height:0}
.c.trk{background:linear-gradient(170deg,var(--track),var(--track2));box-shadow:inset 0 1px 0 rgba(255,255,255,.55),inset 0 -1px 0 rgba(0,0,0,.07)}
.c.trk.alt{background:linear-gradient(170deg,var(--track2),#d8ccb2)}
.c.safe:after{content:"";position:absolute;width:52%;height:52%;background:linear-gradient(160deg,#b9ac90,#8e8267);clip-path:polygon(50% 0,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)}
.c.h0{background:linear-gradient(160deg,#ff6a5e,var(--p0))}.c.h1{background:linear-gradient(160deg,#6bd98c,var(--p1))}.c.h2{background:linear-gradient(160deg,#ffd977,var(--p2))}.c.h3{background:linear-gradient(160deg,#77aaff,var(--p3))}
.c.yard{background:#1c1622}
.c.y0{background:rgba(224,57,47,.92)}.c.y1{background:rgba(47,169,79,.92)}.c.y2{background:rgba(232,178,31,.92)}.c.y3{background:rgba(42,111,214,.92)}
.c.inh{background:#fff5dc;box-shadow:inset 0 0 0 1px rgba(0,0,0,.08)}
.center{position:absolute;left:40%;top:40%;width:20%;height:20%;border-radius:6px;background:conic-gradient(from 45deg,var(--p0) 0 25%,var(--p2) 0 50%,var(--p3) 0 75%,var(--p1) 0);box-shadow:inset 0 0 0 2px rgba(255,255,255,.5),0 6px 14px rgba(0,0,0,.45);transform:rotate(0deg)}
.dot{position:relative;z-index:2;display:grid;place-items:center;width:90%;height:90%;max-width:27px;max-height:27px}
.dot.p0{--pc:#e0392f}.dot.p1{--pc:#2fa94f}.dot.p2{--pc:#e8b21f}.dot.p3{--pc:#2a6fd6}
.pawn{width:100%;height:100%;fill:var(--pc);stroke:rgba(0,0,0,.42);stroke-width:2.4;stroke-linejoin:round;filter:drop-shadow(0 2px 1.5px rgba(0,0,0,.5)) drop-shadow(0 5px 6px rgba(0,0,0,.28))}

.dot.pick{cursor:pointer;animation:bob .7s ease-in-out infinite}
.dot.pick .pawn{filter:drop-shadow(0 0 5px rgba(255,111,174,.95)) drop-shadow(0 2px 1.5px rgba(0,0,0,.5))}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
.dot.home{width:66%;height:66%}
.c.stack{display:flex;align-items:center;justify-content:center;gap:1px}
.c.stack .dot{width:auto;height:auto;flex:1 1 0;min-width:0;max-width:13px;aspect-ratio:1}
.diceRow{display:grid;grid-template-columns:auto 1fr;gap:9px;align-items:center;margin-top:10px}
.dice{width:64px;height:64px;border-radius:18px;border:1px solid rgba(255,255,255,.22);background:linear-gradient(150deg,#fffdf6,#d9cfb4);display:grid;place-items:center;padding:9px;box-shadow:0 10px 22px rgba(0,0,0,.55),0 3px 0 #a99d80,inset 0 2px 0 #fff,inset 0 -7px 12px rgba(0,0,0,.14);cursor:pointer}
.pips{width:100%;height:100%;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:2px}
.pips i{border-radius:50%}
.pips i.on{background:radial-gradient(circle at 34% 28%,#6b6576,#14111b);box-shadow:inset 0 -1px 1px rgba(255,255,255,.22),inset 0 1px 2px rgba(0,0,0,.7)}
.pips i.q{grid-area:1/1/4/4;display:grid;place-items:center;font-size:26px;font-weight:900;font-style:normal;color:#5f5869}
.dice.rolling{animation:shk .32s ease infinite}
@keyframes shk{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}
.dice:disabled{cursor:default;filter:grayscale(.4) brightness(.85)}
.chips{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.chip{min-width:0;padding:7px 4px;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,.04);text-align:center}
.chip.active{border-color:rgba(255,111,174,.55);box-shadow:0 0 0 1px rgba(255,111,174,.35),0 0 16px rgba(255,111,174,.2)}
.chip b{display:block;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chip span{display:block;margin-top:3px;color:var(--muted);font-size:8.5px}
.pill{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px;vertical-align:1px}
.p0b{background:var(--p0)}.p1b{background:var(--p1)}.p2b{background:var(--p2)}.p3b{background:var(--p3)}
.row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}
.btn{min-height:46px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.05);color:#fff;font-size:12px;font-weight:800;cursor:pointer;outline:none}
.btn:active{transform:scale(.97)}
.btn.primary{background:linear-gradient(135deg,#ff5fa5,#c457ff);border:0}
.btn:disabled{filter:grayscale(.75) brightness(.7);cursor:default}
.info{margin-top:10px;padding:11px 12px;border-radius:15px;border:1px solid rgba(255,111,174,.16);background:rgba(255,111,174,.07);color:#ffd5e7;font-size:11.5px;text-align:center;min-height:40px;display:flex;align-items:center;justify-content:center}
.overlay{position:fixed;inset:0;z-index:50;display:none;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.76);backdrop-filter:blur(8px)}
.overlay.show{display:flex}
.modal{width:min(92vw,400px);padding:22px;border-radius:22px;background:linear-gradient(145deg,#1c151e,#0f0c12);border:1px solid rgba(255,255,255,.1);box-shadow:0 25px 80px rgba(0,0,0,.65);text-align:center}
.modalIcon{font-size:50px}.modal h2{margin:4px 0;font-size:22px}.modal p{color:var(--muted);font-size:12.5px;margin:6px 0 16px}
.modalBtns{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.toast{position:fixed;left:50%;bottom:22px;z-index:60;max-width:88vw;padding:9px 13px;border-radius:12px;background:rgba(24,18,28,.96);border:1px solid rgba(255,255,255,.14);color:#fff;font-size:11.5px;font-weight:700;transform:translate(-50%,12px);opacity:0;pointer-events:none;transition:opacity .14s ease,transform .14s ease}
.toast.show{opacity:1;transform:translate(-50%,0)}
@media(max-width:420px){body{padding:7px}.title{font-size:16.5px}.wrap{padding:6px;border-radius:16px}.dice{width:56px;height:56px;font-size:30px}.chip b{font-size:10px}.btn{font-size:11px;min-height:43px}.row{gap:6px}}
</style>
</head>
<body>
<svg width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden"><symbol id="pz" viewBox="0 0 100 100"><circle cx="50" cy="24" r="14.5"/><ellipse cx="50" cy="41" rx="12.5" ry="4.4"/><path d="M39 41C39 57 44 65 45 76H55C56 65 61 57 61 41Z"/><path d="M35 76H65L69 87H31Z"/><rect x="27" y="87" width="46" height="7" rx="3.5"/><g stroke="none" opacity=".5" fill="#fff"><ellipse cx="44" cy="20" rx="4.2" ry="6.4" transform="rotate(-22 44 20)"/><rect x="33" y="88.6" width="34" height="2.6" rx="1.3"/><ellipse cx="50" cy="95" rx="14" ry="2" opacity=".35"/></g></symbol></svg>
<div class="app">
<div class="header"><div class="brand"><div class="avatar">🎲</div><div><div class="title">Ludo Usanagi ✨</div><div class="subtitle">"Keluar butuh angka 6 — ayo balap ke rumah!" ♡</div></div></div><div class="status" id="status">Giliran kamu</div></div>
<div class="wrap">
<div class="board" id="board"><div class="center" id="center"></div></div>
<div class="diceRow"><div class="dice" id="dice"><span class="pips" id="pips"><i class="q">?</i></span></div><div class="chips" id="chips"></div></div>
<div class="row"><button class="btn primary" id="rollBtn">🎲 Lempar Dadu</button><button class="btn" id="newGame">♻️ Main Baru</button><button class="btn" id="sound">🔇 Suara: Mati</button></div>
</div>
<div class="info" id="info">Tekan Lempar Dadu. Bidak yang bisa jalan akan menyala — ketuk untuk memindahkannya.</div>
<div class="row" style="grid-template-columns:1fr 1fr;margin-top:10px"><button class="btn" id="rulesBtn">📖 Aturan</button><button class="btn" id="speedBtn">⏩ Kecepatan: Normal</button></div>
</div>
<div class="overlay" id="overlay"><div class="modal"><div class="modalIcon" id="resultIcon">🏆</div><h2 id="resultTitle">Kamu menang!</h2><p id="resultText">Semua bidakmu sampai rumah.</p><div class="modalBtns"><button class="btn primary" id="againBtn">Main Lagi</button><button class="btn" id="closeBtn">Tutup</button></div></div></div>
<div class="overlay" id="rulesBox"><div class="modal"><div class="modalIcon">📖</div><h2>Aturan singkat</h2><p style="text-align:left">1. Dadu 6 untuk keluar dari kandang, dan dapat lemparan tambahan.<br>2. Bidak berjalan searah jarum jam mengelilingi jalur.<br>3. Mendarat di bidak lawan &rarr; lawan pulang ke kandang (kotak aman dikecualikan).<br>4. Angka pas diperlukan untuk masuk ke rumah.<br>5. Menangkap lawan, dapat 6, atau sampai rumah &rarr; lemparan tambahan.</p><div class="modalBtns"><button class="btn primary" id="rulesClose">Mengerti</button><button class="btn" id="rulesClose2">Tutup</button></div></div></div>
<div class="toast" id="toast"></div>
<script>
'use strict';
const $=id=>document.getElementById(id);
const boardEl=$('board'),diceEl=$('dice'),pipsEl=$('pips'),chipsEl=$('chips'),infoEl=$('info'),statusEl=$('status'),rollBtn=$('rollBtn'),overlay=$('overlay'),toastEl=$('toast'),resultIcon=$('resultIcon'),resultTitle=$('resultTitle'),resultText=$('resultText'),rulesBox=$('rulesBox');
// jalur 56 kotak (searah jarum jam) pada papan 15x15, dihitung sekali
const RING=[[6,0],[6,1],[6,2],[6,3],[6,4],[6,5],[6,6],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[6,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],[7,14],[8,14],[8,13],[8,12],[8,11],[8,10],[8,9],[8,8],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[14,7],[14,6],[13,6],[12,6],[11,6],[10,6],[9,6],[8,6],[8,5],[8,4],[8,3],[8,2],[8,1],[8,0],[7,0]];
const START=[1,15,29,43],SAFE=[1,15,29,43,9,23,37,51];
const HOME_COL=[[[7,1],[7,2],[7,3],[7,4],[7,5]],[[1,7],[2,7],[3,7],[4,7],[5,7]],[[7,13],[7,12],[7,11],[7,10],[7,9]],[[13,7],[12,7],[11,7],[10,7],[9,7]]];
const YARD=[[[1,1],[1,3],[3,1],[3,3]],[[1,10],[1,12],[3,10],[3,12]],[[10,10],[10,12],[12,10],[12,12]],[[10,1],[10,3],[12,1],[12,3]]];
const YBOX=[[[0,0,5,5]],[[0,9,5,14]],[[9,9,14,14]],[[9,0,14,5]]];
const CENTER=[[7,6],[6,7],[7,8],[8,7]];
const NAMES=['Kamu','Usanagi Hijau','Usanagi Kuning','Usanagi Biru'];
const ND=56,HOME_K=60;
let pieces=[],turn=0,dice=0,rolling=false,busy=false,moving=false,gameOver=false,finished=false,soundOn=false,audioCtx=null,humanTurn=false,legal=[],fast=false;
function blip(f1,f2,dur,type,gain){if(!soundOn)return;try{audioCtx=audioCtx||new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const t=audioCtx.currentTime;const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type||'triangle';o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+(dur||.08));g.gain.setValueAtTime(gain||.05,t);g.gain.exponentialRampToValueAtTime(.001,t+(dur||.08)+.04);o.connect(g);g.connect(audioCtx.destination);o.start(t);o.stop(t+(dur||.08)+.05)}catch{}}
const PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
function pipHtml(n){const on=PIPS[n]||[];let h='';for(let i=0;i<9;i++)h+='<i'+(on.indexOf(i)>=0?' class="on"':'')+'></i>';return h}
const DICE_BLANK='<i class="q">?</i>';
function toast(t){toastEl.textContent=t;toastEl.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>toastEl.classList.remove('show'),1600)}
function delay(ms){return new Promise(r=>setTimeout(r,fast?Math.min(120,ms):ms))}
function cellOf(p,i){const pc=pieces[p][i];if(pc.k<0)return YARD[p][i];if(pc.k<55)return RING[(START[p]+pc.k)%ND];if(pc.k<HOME_K)return HOME_COL[p][pc.k-55];return CENTER[p]}
function sameCell(a,b){return a[0]===b[0]&&a[1]===b[1]}
function occupants(cell){const out=[];for(let p=0;p<4;p++)for(let i=0;i<4;i++)if(sameCell(cellOf(p,i),cell))out.push({p,i});return out}
function ringIndexOf(p,i){const pc=pieces[p][i];return pc.k>=0&&pc.k<55?(START[p]+pc.k)%ND:-1}
function isSafeRing(idx){return SAFE.indexOf(idx)>=0}
function buildBoard(){boardEl.innerHTML='<div class="center"></div>';for(let r=0;r<15;r++)for(let c=0;c<15;c++){const el=document.createElement('div');el.className='c';el.dataset.r=r;el.dataset.c=c;boardEl.appendChild(el)}for(let i=0;i<56;i++){const rc=RING[i];const el=cellEl(rc[0],rc[1]);el.classList.add('trk');if(i%2)el.classList.add('alt');if(isSafeRing(i))el.classList.add('safe')}for(let p=0;p<4;p++){for(const rc of HOME_COL[p])cellEl(rc[0],rc[1]).classList.add('h'+p);for(const rc of YARD[p])cellEl(rc[0],rc[1]).classList.add('y'+p)}for(let p=0;p<4;p++){const [r1,c1,r2,c2]=YBOX[p][0];for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++){const el=cellEl(r,c);if(r>r1&&r<r2&&c>c1&&c<c2)el.classList.add('inh')}}}
function cellEl(r,c){return boardEl.children[r*15+c+1]}
function drawPieces(){for(let n=0;n<boardEl.children.length;n++){const el=boardEl.children[n];el.classList.remove('stack');for(const child of Array.from(el.children))child.remove()}const map={};for(let p=0;p<4;p++)for(let i=0;i<4;i++){const rc=cellOf(p,i);const key=rc[0]+':'+rc[1];(map[key]=map[key]||[]).push({p,i})}for(const key in map){const list=map[key];const parts=key.split(':');const host=cellEl(Number(parts[0]),Number(parts[1]));if(!host)continue;if(list.length>1)host.classList.add('stack');for(const item of list){const dot=document.createElement('div');dot.className='dot p'+item.p+(pieces[item.p][item.i].k>=HOME_K?' home':'');dot.innerHTML='<svg class="pawn" viewBox="0 0 100 100" aria-hidden="true"><use href="#pz"></use></svg>';if(humanTurn&&!gameOver&&turn===0&&legal.some(l=>l.i===item.i)){dot.classList.add('pick');dot.addEventListener('click',()=>chooseMove(item.i))}host.appendChild(dot)}}}
function render(){chipsEl.innerHTML='';for(let p=0;p<4;p++){let home=0;pieces[p].forEach(pc=>{if(pc.k>=HOME_K)home++});const chip=document.createElement('div');chip.className='chip'+(turn===p&&!gameOver?' active':'');chip.innerHTML='<b><span class="pill p'+p+'b"></span>'+NAMES[p].replace('Usanagi ','')+'</b><span>'+home+'/4 rumah</span>';chipsEl.appendChild(chip)}drawPieces();statusEl.textContent=gameOver?'Selesai':(turn===0?'Giliran kamu':'🧠 '+NAMES[turn]+' jalan');rollBtn.disabled=!humanTurn||gameOver||rolling||moving;$('sound').textContent=soundOn?'🔊 Suara: Nyala':'🔇 Suara: Mati';$('speedBtn').textContent='⏩ Kecepatan: '+(fast?'Cepat':'Normal')}
function newGame(){pieces=Array.from({length:4},()=>Array.from({length:4},()=>({k:-1})));turn=0;dice=0;rolling=false;busy=false;moving=false;gameOver=false;finished=false;legal=[];humanTurn=false;pipsEl.innerHTML=DICE_BLANK;overlay.classList.remove('show');buildBoard();render();infoEl.textContent='Tekan Lempar Dadu untuk mulai. Bidak keluar dari kandang kalau dapat angka 6.';startTurn()}
function legalMoves(p,roll){const out=[];for(let i=0;i<4;i++){const pc=pieces[p][i];if(pc.k>=HOME_K)continue;if(pc.k<0){if(roll!==6)continue;const startIdx=START[p];const occ=occupants(RING[startIdx]);const foe=occ.filter(o=>o.p!==p);if(foe.length>=2)continue;out.push({i,from:pc.k,to:0});continue}const nk=pc.k+roll;if(nk>HOME_K)continue;if(nk<55){const idx=(START[p]+nk)%ND;if(!isSafeRing(idx)){const foe=occupants(RING[idx]).filter(o=>o.p!==p);if(foe.length>=2)continue}}out.push({i,from:pc.k,to:nk})}return out}
async function startTurn(){if(gameOver)return;legal=[];humanTurn=false;if(turn===0){humanTurn=true;infoEl.textContent='Giliran kamu. Tekan Lempar Dadu.';render();return}render();infoEl.textContent=NAMES[turn]+' sedang berpikir...';await delay(700);if(gameOver)return;await doRoll(true)}
async function doRoll(isBot){if(rolling||moving||gameOver)return;rolling=true;diceEl.classList.add('rolling');render();const spin=fast?6:10;for(let i=0;i<spin;i++){pipsEl.innerHTML=pipHtml(1+Math.floor(Math.random()*6));await delay(60)}dice=1+Math.floor(Math.random()*6);pipsEl.innerHTML=pipHtml(dice);diceEl.classList.remove('rolling');rolling=false;blip(520,760,.08);legal=legalMoves(turn,dice);render();if(!legal.length){infoEl.textContent=(turn===0?'Kamu':NAMES[turn])+' dapat '+dice+' — tidak ada bidak yang bisa jalan.';if(dice===6){await delay(500);if(gameOver)return;await doRoll(isBot);return}await delay(700);if(gameOver)return;nextTurn();return}if(turn===0){humanTurn=true;infoEl.textContent='Dadu '+dice+'. Pilih bidak yang menyala ('+(legal.length===1?'cuma 1 pilihan':'beberapa pilihan')+').';render();return}await delay(520);if(gameOver)return;chooseMove(botPick(),true)}
function botPick(){const p=turn;let best=legal[0],bestScore=-1e9;for(const mv of legal){let s=0;const pc=pieces[p][mv.i];if(mv.to>=HOME_K)s+=120;if(mv.from<0)s+=40;const tgt=mv.to<55?RING[(START[p]+mv.to)%ND]:null;if(tgt){const foes=occupants(tgt).filter(o=>o.p!==p);if(foes.length===1&&!isSafeRing((START[p]+mv.to)%ND))s+=110;if(isSafeRing((START[p]+mv.to)%ND))s+=25}if(pc.k>=0&&pc.k<54&&mv.to>=54)s+=45;s+=mv.to*.12;s+=Math.random()*6;if(s>bestScore){bestScore=s;best=mv}}return best.i}
async function chooseMove(i,isBot){if(gameOver||moving)return;const mv=legal.find(l=>l.i===i);if(!mv)return;if(turn!==0&&!isBot)return;legal=[];humanTurn=false;moving=true;render();const p=turn,pc=pieces[p][i];if(mv.from<0){pc.k=0;blip(660,980,.1);render();await delay(260)}else{let k=pc.k;while(k<mv.to){k++;pc.k=k;blip(700+((k%5)*40),900,.045,'sine',.03);render();await delay(130)}}let extra=false;if(pc.k>=HOME_K){extra=true;blip(880,1240,.14);infoEl.textContent=NAMES[p]+' memasukkan satu bidak ke rumah!';await delay(420)}if(pc.k<55){const idx=(START[p]+pc.k)%ND;if(!isSafeRing(idx)){const foes=occupants(RING[idx]).filter(o=>o.p!==p);if(foes.length===1){const foe=foes[0];pieces[foe.p][foe.i].k=-1;extra=true;blip(320,200,.2,'sawtooth',.06);toast('Bidak '+NAMES[foe.p].replace('Usanagi ','')+' dipulangkan!');infoEl.textContent=(p===0?'Kamu':NAMES[p])+' menangkap bidak lawan — dapat lemparan tambahan.';render();await delay(520)}}}moving=false;if(pieces[p].every(x=>x.k>=HOME_K)){finish(p);return}if(dice===6)extra=true;if(extra){infoEl.textContent=(p===0?'Kamu':NAMES[p])+' dapat lemparan tambahan.';render();await delay(420);if(playerAlive()===1){infoEl.textContent='Cuma kamu yang tersisa — permainan selesai.';finish(p);return}turn=p;if(turn===0){humanTurn=true;render();return}await delay(500);if(gameOver)return;await doRoll(true);return}nextTurn()}
function playerAlive(){return pieces.filter(ps=>ps.some(pc=>pc.k<HOME_K)).length}
function nextTurn(){if(gameOver)return;let guard=0;do{turn=(turn+1)%4;guard++}while(guard<8&&pieces[turn].every(pc=>pc.k>=HOME_K));dice=0;legal=[];startTurn()}
function finish(p){gameOver=true;humanTurn=false;render();if(p===0){resultIcon.textContent='🏆';resultTitle.textContent='Kamu menang!';resultText.textContent='Semua bidakmu sampai rumah lebih dulu. Main lagi?';blip(720,1180,.14);setTimeout(()=>blip(980,1560,.16),150)}else{resultIcon.textContent='🙈';resultTitle.textContent=NAMES[p]+' menang';resultText.textContent=NAMES[p]+' memasukkan keempat bidaknya lebih dulu. Coba lagi ya.';blip(320,220,.2,'sawtooth',.06)}setTimeout(()=>overlay.classList.add('show'),260)}
rollBtn.addEventListener('click',()=>{if(!humanTurn||gameOver||rolling||moving)return;doRoll(false)});
$('newGame').addEventListener('click',newGame);$('againBtn').addEventListener('click',()=>{overlay.classList.remove('show');newGame()});$('closeBtn').addEventListener('click',()=>overlay.classList.remove('show'));
$('sound').addEventListener('click',()=>{soundOn=!soundOn;if(soundOn)blip(660,980,.08);render()});
$('speedBtn').addEventListener('click',()=>{fast=!fast;infoEl.textContent=fast?'Kecepatan cepat: animasi dan jeda bot diperpendek.':'Kecepatan normal.';render()});
$('rulesBtn').addEventListener('click',()=>rulesBox.classList.add('show'));$('rulesClose').addEventListener('click',()=>rulesBox.classList.remove('show'));$('rulesClose2').addEventListener('click',()=>rulesBox.classList.remove('show'));
newGame();
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
button,[role="button"],.btn,.dice,.dot,a{-webkit-user-select:none;user-select:none;transition:transform .07s ease,filter .16s ease,box-shadow .22s ease}
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
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🎲', key: reactionKey } }).catch(() => {})

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
                messageText: 'Usanagi Umi AI Ludo 🎲',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'usanagi-ai-ludo-2026',
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

handler.help = ['ludo', 'ludogame', 'ludoku']
handler.tags = ['game']
handler.command = /^(ludo|ludogame|ludoku)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Game Ludo Usanagi Umi AI — papan silang, dadu, kamu melawan 3 bot dengan aturan tangkap dan kotak aman'

export default handler
