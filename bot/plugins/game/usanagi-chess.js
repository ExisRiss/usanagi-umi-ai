
'use strict'

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Usanagi Umi AI Chess</title>
<style>
:root{--bg:#08070b;--panel:#121017;--line:rgba(255,255,255,.09);--text:#fff;--muted:#aaa1ae;--pink:#ff6fae;--light:#f2d7b5;--dark:#a96f54;--selected:#ffd45c;--move:rgba(93,255,167,.75);--capture:rgba(255,80,110,.9)}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;padding:0;background:radial-gradient(circle at top,#21101c 0%,#0b080d 45%,#050407 100%);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{min-height:100vh;padding:10px}.app{width:min(100%,760px);margin:auto}
.header{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}
.brand{display:flex;align-items:center;gap:10px}.avatar{width:46px;height:46px;border-radius:15px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#ff77b4,#9b4dff);font-size:25px}
.title{font-size:19px;font-weight:800}.subtitle{color:var(--muted);font-size:11px;margin-top:2px}
.status{padding:8px 11px;border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.035);color:#ddd;font-size:11px}
.controls,.actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}
.actions{grid-template-columns:repeat(3,1fr);margin-top:10px}
.select,.btn{min-height:42px;border-radius:13px;border:1px solid var(--line);background:rgba(255,255,255,.045);color:#fff;font-size:13px;outline:none}
.select{padding:0 12px}.btn{padding:0 12px;font-weight:700;cursor:pointer}.btn:active{transform:scale(.97)}
.btn.primary{background:linear-gradient(135deg,#ff5fa5,#c457ff);border:0}
.boardWrap{position:relative;width:100%;max-width:680px;margin:auto;padding:7px;border-radius:21px;background:linear-gradient(145deg,rgba(255,255,255,.10),rgba(255,255,255,.025));box-shadow:0 20px 60px rgba(0,0,0,.45),0 0 40px rgba(255,80,160,.08)}
.board{position:relative;width:100%;aspect-ratio:1;display:grid;grid-template-columns:repeat(8,1fr);overflow:hidden;border-radius:15px;touch-action:none;user-select:none}
.square{position:relative;display:flex;align-items:center;justify-content:center;aspect-ratio:1;cursor:pointer}
.square.light{background:var(--light)}.square.dark{background:var(--dark)}
.square.selected{box-shadow:inset 0 0 0 4px var(--selected)}
.square.check{background:radial-gradient(circle,rgba(255,30,80,.95),rgba(255,30,80,.35) 55%,transparent 75%)}
.piece{position:relative;z-index:4;font-size:clamp(28px,8vw,61px);line-height:1;filter:drop-shadow(0 3px 2px rgba(0,0,0,.45));transition:transform .1s ease}.piece.w{color:#fff}.piece.b{color:#000;filter:drop-shadow(0 3px 2px rgba(255,255,255,.2))}
.square.selected .piece{transform:scale(1.08)}
.moveDot{position:absolute;width:22%;height:22%;border-radius:50%;background:var(--move);z-index:2;box-shadow:0 0 10px rgba(93,255,167,.35)}
.captureRing{position:absolute;inset:8%;border-radius:50%;border:5px solid var(--capture);z-index:2}
.coord{position:absolute;font-size:9px;font-weight:800;opacity:.65;pointer-events:none}.file{right:4px;bottom:2px}.rank{left:4px;top:2px}.light .coord{color:#754c39}.dark .coord{color:#f5dcc5}
.info{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.card{padding:11px;min-height:62px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.035);text-align:center}.card b{display:block;font-size:15px}.card span{color:var(--muted);font-size:10px}
.captured,.message{margin-top:10px;padding:10px 12px;border:1px solid var(--line);border-radius:13px;background:rgba(255,255,255,.03);color:#ddd}
.captured{min-height:38px;font-size:19px;word-break:break-word}.message{min-height:40px;background:rgba(255,111,174,.07);border-color:rgba(255,111,174,.14);text-align:center;color:#ffd5e7;font-size:12px;display:flex;align-items:center;justify-content:center}
.overlay,.promotion{position:fixed;inset:0;z-index:50;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.72);backdrop-filter:blur(8px)}
.overlay.show,.promotion.show{display:flex}.modal{width:min(92vw,420px);padding:23px;border-radius:23px;background:linear-gradient(145deg,#1c151e,#0f0c12);border:1px solid rgba(255,255,255,.1);box-shadow:0 25px 80px rgba(0,0,0,.65);text-align:center}.modalIcon{font-size:55px}.modal h2{margin:5px 0;font-size:24px}.modal p{color:var(--muted);font-size:13px;margin-bottom:17px}
.modeButtons{display:grid;grid-template-columns:1fr 1fr;gap:9px}.modeBtn{padding:14px 10px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.045);color:#fff;cursor:pointer}.modeBtn strong{display:block;margin-bottom:3px}.modeBtn small{color:var(--muted)}
.promoBox{padding:18px;border-radius:20px;background:#171219;border:1px solid var(--line)}.promoBox h3{margin:0 0 12px;text-align:center}.promoChoices{display:flex;gap:8px}.promo{width:60px;height:60px;border:0;border-radius:13px;background:#29202a;color:white;font-size:39px}
@media(max-width:430px){body{padding:7px}.boardWrap{padding:5px;border-radius:17px}.info{gap:5px}.card{padding:9px 4px}}
</style>
</head>
<body>
<div class="app">
<div class="header"><div class="brand"><div class="avatar">♟️</div><div><div class="title">Usanagi Umi AI Chess ✨</div><div class="subtitle">"Waku waku... ayo catur!" ♡</div></div></div><div class="status" id="status">White turn</div></div>
<div class="controls"><select id="mode" class="select"><option value="easy">🟢 Easy</option><option value="medium" selected>🔵 Medium</option><option value="hard">🟣 Hard</option><option value="master">🔴 Master</option><option value="pvp">👥 2 Player</option></select><button class="btn primary" id="newGame">♻️ New Game</button></div>
<div class="boardWrap"><div id="board" class="board"></div></div>
<div class="info"><div class="card"><b id="turnText">White</b><span>Giliran</span></div><div class="card"><b id="moveText">0</b><span>Moves</span></div><div class="card"><b id="modeText">Medium</b><span>Mode</span></div></div>
<div class="captured" id="captured">⚪ —</div><div class="message" id="message">Pilih bidak untuk mulai bermain ♟️</div>
<div class="actions"><button class="btn" id="undo">↩️ Undo</button><button class="btn" id="flip">🔄 Flip</button><button class="btn" id="resign">🏳️ Resign</button></div>
</div>
<div class="overlay" id="overlay"><div class="modal"><div class="modalIcon" id="resultIcon">🏆</div><h2 id="resultTitle">Checkmate!</h2><p id="resultText">White wins.</p><div class="modeButtons"><button class="modeBtn" data-mode="easy"><strong>🟢 Easy</strong><small>Santai</small></button><button class="modeBtn" data-mode="medium"><strong>🔵 Medium</strong><small>Normal</small></button><button class="modeBtn" data-mode="hard"><strong>🟣 Hard</strong><small>Sulit</small></button><button class="modeBtn" data-mode="master"><strong>🔴 Master</strong><small>Serius 😭</small></button><button class="modeBtn" data-mode="pvp"><strong>👥 2 Player</strong><small>Teman vs teman</small></button><button class="modeBtn" id="playAgain"><strong>♻️ Rematch</strong><small>Main lagi</small></button></div></div></div>
<div class="promotion" id="promotion"><div class="promoBox"><h3>Promote Pion 👑</h3><div class="promoChoices"><button class="promo" data-piece="q">♕</button><button class="promo" data-piece="r">♖</button><button class="promo" data-piece="b">♗</button><button class="promo" data-piece="n">♘</button></div></div></div>

<script>
'use strict';
const W='w',B='b',FILES=['a','b','c','d','e','f','g','h'];
const PIECES={w:{k:'♔',q:'♕',r:'♖',b:'♗',n:'♘',p:'♙'},b:{k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'}};
const VALUE={p:100,n:320,b:330,r:500,q:900,k:20000};
const boardEl=document.getElementById('board'),modeEl=document.getElementById('mode'),statusEl=document.getElementById('status'),turnText=document.getElementById('turnText'),moveText=document.getElementById('moveText'),modeText=document.getElementById('modeText'),messageEl=document.getElementById('message'),capturedEl=document.getElementById('captured'),overlay=document.getElementById('overlay'),resultIcon=document.getElementById('resultIcon'),resultTitle=document.getElementById('resultTitle'),resultText=document.getElementById('resultText'),promotionEl=document.getElementById('promotion');
let board=[],turn=W,selected=null,legalSelected=[],history=[],flipped=false,gameOver=false,thinking=false,pendingPromotion=null,castle={w:{k:true,q:true},b:{k:true,q:true}},enPassant=null,halfmove=0,mode='medium',captured={w:[],b:[]},audioCtx=null;

function audio(){try{if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume()}catch{}}
function sound(type){try{audio();if(!audioCtx)return;const o=audioCtx.createOscillator(),g=audioCtx.createGain(),n=audioCtx.currentTime;o.connect(g);g.connect(audioCtx.destination);o.type=type==='capture'?'square':'sine';o.frequency.setValueAtTime(type==='capture'?300:600,n);o.frequency.exponentialRampToValueAtTime(type==='capture'?100:800,n+.1);g.gain.setValueAtTime(.12,n);g.gain.exponentialRampToValueAtTime(.01,n+.12);o.start(n);o.stop(n+.12)}catch{}}
function speak(t){try{if('speechSynthesis'in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.lang='id-ID';u.pitch=1.4;u.rate=1.1;speechSynthesis.speak(u)}}catch{}}
function clone(b){return b.map(r=>r.map(p=>p?{...p}:null))}
function opp(c){return c===W?B:W} function inside(r,c){return r>=0&&r<8&&c>=0&&c<8}
function piece(b,r,c){return inside(r,c)?b[r][c]:null}
function initial(){const b=Array.from({length:8},()=>Array(8).fill(null)),back=['r','n','b','q','k','b','n','r'];for(let c=0;c<8;c++){b[0][c]={color:B,type:back[c]};b[1][c]={color:B,type:'p'};b[6][c]={color:W,type:'p'};b[7][c]={color:W,type:back[c]}}return b}
function attacked(b,r,c,by){const pd=by===W?1:-1;for(const dc of[-1,1]){const p=piece(b,r+pd,c+dc);if(p&&p.color===by&&p.type==='p')return true}const ns=[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];for(const[x,y]of ns){const p=piece(b,r+x,c+y);if(p&&p.color===by&&p.type==='n')return true}for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++){if(x||y){const p=piece(b,r+x,c+y);if(p&&p.color===by&&p.type==='k')return true}}
for(const[x,y]of[[-1,-1],[-1,1],[1,-1],[1,1]]){let rr=r+x,cc=c+y;while(inside(rr,cc)){const p=b[rr][cc];if(p){if(p.color===by&&(p.type==='b'||p.type==='q'))return true;break}rr+=x;cc+=y}}
for(const[x,y]of[[-1,0],[1,0],[0,-1],[0,1]]){let rr=r+x,cc=c+y;while(inside(rr,cc)){const p=b[rr][cc];if(p){if(p.color===by&&(p.type==='r'||p.type==='q'))return true;break}rr+=x;cc+=y}}return false}
function king(b,c){for(let r=0;r<8;r++)for(let x=0;x<8;x++){const p=b[r][x];if(p&&p.color===c&&p.type==='k')return{r,c:x}}return null}
function check(b,c){const k=king(b,c);return !k||attacked(b,k.r,k.c,opp(c))}
function pseudo(b,r,c,color,rights,ep){const p=b[r][c];if(!p||p.color!==color)return[];const out=[];const add=(rr,cc,x={})=>{if(!inside(rr,cc))return;const t=b[rr][cc];if(!t||t.color!==p.color)out.push({from:{r,c},to:{r:rr,c:cc},...x})};
if(p.type==='p'){const d=color===W?-1:1,s=color===W?6:1;if(inside(r+d,c)&&!b[r+d][c]){add(r+d,c);if(r===s&&!b[r+2*d][c])add(r+2*d,c,{doublePawn:true})}for(const dc of[-1,1]){const rr=r+d,cc=c+dc;if(!inside(rr,cc))continue;if(b[rr][cc]&&b[rr][cc].color!==color)add(rr,cc,{capture:true});if(ep&&ep.r===rr&&ep.c===cc)add(rr,cc,{capture:true,enPassant:true})}}
if(p.type==='n')for(const[x,y]of[[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]])add(r+x,c+y);
if(['b','r','q'].includes(p.type)){const ds=[];if(p.type==='b'||p.type==='q')ds.push([-1,-1],[-1,1],[1,-1],[1,1]);if(p.type==='r'||p.type==='q')ds.push([-1,0],[1,0],[0,-1],[0,1]);for(const[x,y]of ds){let rr=r+x,cc=c+y;while(inside(rr,cc)){if(!b[rr][cc])add(rr,cc);else{if(b[rr][cc].color!==color)add(rr,cc,{capture:true});break}rr+=x;cc+=y}}}
if(p.type==='k'){for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)if(x||y)add(r+x,c+y);const q=rights[color];if(q&&!check(b,color)){if(q.k&&!b[r][5]&&!b[r][6]&&b[r][7]?.type==='r'&&b[r][7].color===color&&!attacked(b,r,5,opp(color))&&!attacked(b,r,6,opp(color)))out.push({from:{r,c},to:{r,c:6},castle:'k'});if(q.q&&!b[r][1]&&!b[r][2]&&!b[r][3]&&b[r][0]?.type==='r'&&b[r][0].color===color&&!attacked(b,r,3,opp(color))&&!attacked(b,r,2,opp(color)))out.push({from:{r,c},to:{r,c:2},castle:'q'})}}return out}
function apply(b,m,promo='q'){const n=clone(b),p=n[m.from.r][m.from.c];n[m.from.r][m.from.c]=null;if(m.enPassant){const d=p.color===W?1:-1;n[m.to.r+d][m.to.c]=null}n[m.to.r][m.to.c]={...p};if(p.type==='p'&&(m.to.r===0||m.to.r===7))n[m.to.r][m.to.c].type=promo;if(m.castle==='k'){n[m.from.r][5]=n[m.from.r][7];n[m.from.r][7]=null}if(m.castle==='q'){n[m.from.r][3]=n[m.from.r][0];n[m.from.r][0]=null}return n}
function legal(b,r,c,color,rights,ep){return pseudo(b,r,c,color,rights,ep).filter(m=>!check(apply(b,m),color))}
function moves(b,color,rights,ep){const a=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(b[r][c]?.color===color)a.push(...legal(b,r,c,color,rights,ep));return a}
function snapshot(){return{board:clone(board),turn,castle:JSON.parse(JSON.stringify(castle)),enPassant:enPassant?{...enPassant}:null,halfmove,captured:{w:[...captured.w],b:[...captured.b]}}}
function restore(s){board=clone(s.board);turn=s.turn;castle=JSON.parse(JSON.stringify(s.castle));enPassant=s.enPassant?{...s.enPassant}:null;halfmove=s.halfmove;captured={w:[...s.captured.w],b:[...s.captured.b]};selected=null;legalSelected=[]}
function execute(m,promo='q',save=true){if(gameOver)return;audio();const before=snapshot(),moving=board[m.from.r][m.from.c];let cap=board[m.to.r][m.to.c];if(m.enPassant){const d=moving.color===W?1:-1;cap=board[m.to.r+d][m.to.c]}board=apply(board,m,promo);if(cap){captured[moving.color].push(cap);sound('capture')}else sound('move');if(moving.type==='k')castle[moving.color]={k:false,q:false};if(moving.type==='r'){if(moving.color===W&&m.from.r===7){if(m.from.c===0)castle.w.q=false;if(m.from.c===7)castle.w.k=false}else if(moving.color===B&&m.from.r===0){if(m.from.c===0)castle.b.q=false;if(m.from.c===7)castle.b.k=false}}if(cap?.type==='r'){if(m.to.r===7&&m.to.c===0)castle.w.q=false;if(m.to.r===7&&m.to.c===7)castle.w.k=false;if(m.to.r===0&&m.to.c===0)castle.b.q=false;if(m.to.r===0&&m.to.c===7)castle.b.k=false}enPassant=null;if(moving.type==='p'&&Math.abs(m.to.r-m.from.r)===2)enPassant={r:(m.to.r+m.from.r)/2,c:m.from.c};halfmove=(moving.type==='p'||cap)?0:halfmove+1;if(save)history.push(before);turn=opp(turn);selected=null;legalSelected=[];render();state();if(!gameOver&&mode!=='pvp'&&turn===B)ai()}
function select(r,c){if(gameOver||thinking||(mode!=='pvp'&&turn===B))return;const p=board[r][c];if(selected){const m=legalSelected.find(x=>x.to.r===r&&x.to.c===c);if(m){const q=board[m.from.r][m.from.c];if(q.type==='p'&&(m.to.r===0||m.to.r===7)){pendingPromotion=m;promotionEl.classList.add('show');return}execute(m);return}if(p?.color===turn){selected={r,c};legalSelected=legal(board,r,c,turn,castle,enPassant);render();return}selected=null;legalSelected=[];render();return}if(p?.color===turn){selected={r,c};legalSelected=legal(board,r,c,turn,castle,enPassant);render()}}
function state(){const ms=moves(board,turn,castle,enPassant),ck=check(board,turn);if(!ms.length){gameOver=true;if(ck){const win=opp(turn)===W?'White':'Black';speak(mode==='pvp'?'Skak mat! '+win+' menang!':win==='White'?'Ughh... kamu menang. Hebat juga ya.':'Yeyyy! Usanagi Umi AI menang!');showResult('👑','Checkmate!',win+' menang!')}else{showResult('🤝','Stalemate','Permainan berakhir remis.');speak('Heeeh... permainannya seri nih.')}return}if(halfmove>=100){gameOver=true;showResult('🤝','Draw','50-move rule.');return}statusEl.textContent=ck?'⚠️ CHECK!':turn===W?'White turn':'Black turn';messageEl.textContent=ck?'⚠️ Raja sedang dalam bahaya!':turn===W?'Giliran kamu ♟️':mode==='pvp'?'Giliran Black ♟️':'Usanagi Umi AI sedang berpikir... 🧠';turnText.textContent=turn===W?'White':'Black'}
function evaluate(b){let s=0;for(let r=0;r<8;r++)for(let c=0;c<8;c++){const p=b[r][c];if(!p)continue;let v=VALUE[p.type];const d=Math.abs(3.5-r)+Math.abs(3.5-c);if(p.type==='p')v+=(p.color===W?6-r:r-1)*8;if(p.type==='n'||p.type==='b')v+=Math.max(0,20-d*5);if(p.type==='q')v+=Math.max(0,12-d*2);s+=p.color===W?v:-v}return s}
function order(b,m){let v=0;if(m.capture){const x=b[m.to.r][m.to.c];v+=(VALUE[x?.type||'p']*10)-(VALUE[b[m.from.r][m.from.c].type])}if(m.castle)v+=40;return v}
function minimax(b,color,d,a,z,rights,ep){const ms=moves(b,color,rights,ep);if(!d)return evaluate(b);if(!ms.length)return check(b,color)?(color===W?-999999:999999):0;const max=color===W;let best=max?-Infinity:Infinity;for(const m of ms){const n=apply(b,m);const val=minimax(n,opp(color),d-1,a,z,rights,ep);best=max?Math.max(best,val):Math.min(best,val);if(max)a=Math.max(a,val);else z=Math.min(z,val);if(z<=a)break}return best}
function ai(){thinking=true;render();setTimeout(()=>{const ms=moves(board,B,castle,enPassant);if(!ms.length){thinking=false;state();return}let best=ms[0];if(mode==='easy'){best=ms[Math.floor(Math.random()*Math.min(6,ms.length))]}else{const d=mode==='medium'?2:mode==='hard'?3:3;let bs=Infinity;for(const m of ms){const v=minimax(apply(board,m),W,d-1,-Infinity,Infinity,castle,enPassant);if(v<bs){bs=v;best=m}}}thinking=false;execute(best)},mode==='master'?180:90)}
function render(){boardEl.innerHTML='';for(let dr=0;dr<8;dr++)for(let dc=0;dc<8;dc++){const r=flipped?7-dr:dr,c=flipped?7-dc:dc,e=document.createElement('div');e.className='square '+((r+c)%2===0?'light':'dark');if(selected?.r===r&&selected?.c===c)e.classList.add('selected');if(board[r][c]?.type==='k'&&board[r][c]?.color===turn&&check(board,turn))e.classList.add('check');const mm=legalSelected.find(x=>x.to.r===r&&x.to.c===c);if(mm){const q=document.createElement('div');q.className=board[r][c]||mm.enPassant?'captureRing':'moveDot';e.appendChild(q)}if(board[r][c]){const q=document.createElement('div');q.className='piece '+board[r][c].color;q.textContent=PIECES[board[r][c].color][board[r][c].type];e.appendChild(q)}if(dc===7){const q=document.createElement('span');q.className='coord file';q.textContent=FILES[c];e.appendChild(q)}if(dr===0){const q=document.createElement('span');q.className='coord rank';q.textContent=8-r;e.appendChild(q)}e.addEventListener('pointerdown',x=>{x.preventDefault();select(r,c)});boardEl.appendChild(e)}turnText.textContent=turn===W?'White':'Black';moveText.textContent=history.length;modeText.textContent=mode==='pvp'?'2 Player':mode[0].toUpperCase()+mode.slice(1);capturedEl.textContent='⚪ '+captured.w.map(p=>PIECES[p.color][p.type]).join(' ')+'    ⚫ '+captured.b.map(p=>PIECES[p.color][p.type]).join(' ');if(!gameOver)statusEl.textContent=thinking?'🧠 Thinking...':turn===W?'White turn':'Black turn'}
function reset(){board=initial();turn=W;selected=null;legalSelected=[];history=[];gameOver=false;thinking=false;pendingPromotion=null;castle={w:{k:true,q:true},b:{k:true,q:true}};enPassant=null;halfmove=0;captured={w:[],b:[]};overlay.classList.remove('show');promotionEl.classList.remove('show');messageEl.textContent=mode==='pvp'?'White mulai dulu ♙':'White mulai dulu. Ayo kalahkan Usanagi Umi AI 😏';render()}
function showResult(i,t,x){resultIcon.textContent=i;resultTitle.textContent=t;resultText.textContent=x;setTimeout(()=>overlay.classList.add('show'),150)}
document.getElementById('newGame').onclick=reset;document.getElementById('flip').onclick=()=>{flipped=!flipped;render()};document.getElementById('undo').onclick=()=>{if(!history.length||thinking)return;restore(history.pop());gameOver=false;overlay.classList.remove('show');render();state()};document.getElementById('resign').onclick=()=>{if(gameOver)return;gameOver=true;speak('Huuu, cemen! Masa nyerah sih!');showResult('🏳️','Resign',turn===W?'White menyerah. Black menang.':'Black menyerah. White menang.')};modeEl.onchange=()=>{mode=modeEl.value;reset()};document.querySelectorAll('.modeBtn[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;modeEl.value=mode;reset()});document.getElementById('playAgain').onclick=reset;document.querySelectorAll('.promo').forEach(b=>b.onclick=()=>{if(!pendingPromotion)return;const m=pendingPromotion;pendingPromotion=null;promotionEl.classList.remove('show');execute(m,b.dataset.piece)});document.onkeydown=e=>{if(e.key==='Escape'){selected=null;legalSelected=[];render()}if(e.key.toLowerCase()==='r')reset();if(e.key.toLowerCase()==='u')document.getElementById('undo').click()};reset();
</script>
</body></html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return

  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '♟️', key: reactionKey } }).catch(() => {})

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
                messageText: 'Usanagi Umi AI Chess ♟️✨',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'usanagi-ai-chess-2026',
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

handler.help = ['chess', 'catur']
handler.tags = ['game']
handler.command = /^(chess|catur)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Game catur Usanagi Umi AI Chess dengan mode Easy sampai Master'

export default handler
