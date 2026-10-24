/* By AlzRiss - Usanagi Umi AI */

'use strict'

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#1c3a2a">
<title>Usanagi Umi AI Save the Doge</title>
<style>
:root{--bg:#122419;--panel:#1c3a2a;--panel2:#245036;--line:#3c7a52;--text:#f2fff6;--dim:#a9d4b8;--gold:#ffd23f;--green:#57e389;--red:#ff6a5e}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
html,body{min-height:100%;overscroll-behavior:none;background:radial-gradient(700px 420px at 50% -8%,#245c3a 0%,#15352a 55%,#0b1d14 100%);color:var(--text);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;align-items:flex-start;padding:max(8px,env(safe-area-inset-top)) 8px max(10px,env(safe-area-inset-bottom));touch-action:manipulation}
.app{width:min(100%,520px);margin:auto}
.cab{position:relative;width:100%;background:linear-gradient(180deg,#1f4530,#132b1e);border:1px solid #3c7a52;border-radius:20px;padding:10px;box-shadow:0 26px 60px #000a,inset 0 1px 0 #ffffff22}
.head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.brand{display:flex;align-items:center;gap:9px;min-width:0}
.logo{width:38px;height:38px;flex:none;display:grid;place-items:center;border-radius:11px;background:linear-gradient(150deg,#ffd23f,#e07b12);font-size:20px;box-shadow:0 3px 0 #7c4407,inset 0 1px 0 #fff8}
.title{font-size:15px;font-weight:900;letter-spacing:.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-shadow:0 2px 0 #0008}
.sub{margin-top:1px;color:var(--dim);font-size:8.5px;letter-spacing:.3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hbtns{display:flex;gap:5px;flex:none}
.hb{width:34px;height:34px;border:1px solid #4d9668;border-radius:10px;background:linear-gradient(180deg,#2a5a3d,#1a3c2a);color:#dff5e6;font-size:15px;box-shadow:0 3px 0 #0a1810}
.hb:active{transform:translateY(2px);box-shadow:0 1px 0 #0a1810}
.hb.on{border-color:#ffe793;box-shadow:0 0 0 2px #ffe79366,0 3px 0 #0a1810}
.bar{display:flex;align-items:center;gap:6px;background:linear-gradient(180deg,#245036,#1c3a2a);border:1px solid #3c7a52;border-radius:13px;padding:6px 8px;margin-bottom:8px;box-shadow:inset 0 2px 6px #00000055}
.stx{flex:1;min-width:0;font:900 9px system-ui;letter-spacing:.05em;color:#ffe9b8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chip{flex:none;padding:3px 8px;border-radius:999px;background:#122619;border:1px solid #3c7a52;color:var(--dim);font:800 8.5px system-ui;letter-spacing:.06em;white-space:nowrap}
.chip b{color:var(--gold)}
.inkbar{height:9px;border-radius:999px;background:#0d1c12;border:1px solid #3c7a52;overflow:hidden;margin-bottom:8px;box-shadow:inset 0 2px 4px #0008}
.inkbar i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#b8f2c9,#57e389);border-radius:999px;transition:width .12s linear}
.inkbar.low i{background:linear-gradient(90deg,#ffb199,#ff6a5e)}
.stage{position:relative;width:100%;aspect-ratio:1/1;border:2px solid #3c7a52;border-radius:14px;overflow:hidden;background:#bfe8ff;box-shadow:inset 0 6px 18px #00000033,0 6px 16px #00000055}
.stage canvas{display:block;width:100%;height:100%;touch-action:none;cursor:crosshair}
.toast{position:absolute;left:50%;top:10px;transform:translate(-50%,-14px);padding:5px 11px;border-radius:999px;background:#0d1c12e6;border:1px solid #4d9668;color:#dff5e6;font:900 8.5px system-ui;letter-spacing:.06em;opacity:0;transition:.18s ease;pointer-events:none;white-space:nowrap;max-width:92%;overflow:hidden;text-overflow:ellipsis;z-index:5}
.toast.show{opacity:1;transform:translate(-50%,0)}
.ov{position:absolute;inset:0;z-index:8;display:grid;place-items:center;background:#07160de8;backdrop-filter:blur(7px);padding:10px;transition:opacity .2s ease}
.ov.hide{opacity:0;pointer-events:none}
.card2{width:min(96%,360px);max-height:100%;overflow:auto;-webkit-overflow-scrolling:touch;text-align:center;padding:14px 12px;border:1px solid #4d9668;border-radius:16px;background:linear-gradient(180deg,#245036,#122619);box-shadow:0 18px 40px #000a}
.card2 .big{font-size:21px;font-weight:950;letter-spacing:.4px;color:#ffe9b8;text-shadow:0 3px 0 #00000088}
.card2 .small{margin-top:5px;color:var(--dim);font-size:9px;line-height:1.6}
.stars{font-size:30px;letter-spacing:6px;margin-top:6px;filter:drop-shadow(0 3px 0 #0008)}
.stars .off{opacity:.22}
.lv{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:11px}
.lvb{padding:9px 2px;border:1px solid #4d9668;border-radius:11px;background:linear-gradient(180deg,#2a5a3d,#1a3c2a);color:#dff5e6;font:950 13px system-ui;box-shadow:0 3px 0 #0a1810;touch-action:manipulation}
.lvb span{display:block;font:800 7px system-ui;color:var(--gold);letter-spacing:.08em;margin-top:2px}
.lvb.lock{filter:saturate(.3) brightness(.7)}
.lvb.done{border-color:#ffd23f;box-shadow:0 0 0 1px #ffd23f66,0 3px 0 #0a1810}
.gbtn{display:block;width:100%;margin-top:9px;min-height:44px;border:1px solid #ffe793;border-radius:12px;background:linear-gradient(180deg,#57e389,#1f9d55);color:#06240f;font:950 13px system-ui;letter-spacing:.08em;box-shadow:0 5px 0 #12603a}
.gbtn:active{transform:translateY(3px);box-shadow:0 2px 0 #12603a}
.gbtn.alt{background:linear-gradient(180deg,#c9a75f,#8a6628);color:#241a08;box-shadow:0 5px 0 #4a3210}
.hint{margin-top:8px;color:var(--dim);font-size:8.5px;line-height:1.6}
</style>
</head>
<body>
<div class="app">
  <div class="cab">
    <div class="head">
      <div class="brand">
        <div class="logo">🐶</div>
        <div>
          <div class="title">SAVE THE DOGE</div>
          <div class="sub">gambar garis · lindungi anjing · tahan lebah</div>
        </div>
      </div>
      <div class="hbtns">
        <button class="hb on" id="bSound" title="Suara">🔊</button>
        <button class="hb" id="bHome" title="Menu">🏠</button>
        <button class="hb" id="bRetry" title="Ulang">↻</button>
      </div>
    </div>
    <div class="bar">
      <div class="stx" id="stx">Level 1</div>
      <div class="chip">🐝 <b id="cBee">0</b></div>
      <div class="chip">⏱ <b id="cTime">0</b>s</div>
      <div class="chip">⭐ <b id="cStar">0</b></div>
    </div>
    <div class="inkbar" id="inkWrap"><i id="inkFill"></i></div>
    <div class="stage">
      <canvas id="cv"></canvas>
      <div class="toast" id="toast"></div>
      <div class="ov" id="ovMenu">
        <div class="card2">
          <div class="big">🐶 SAVE THE DOGE</div>
          <div class="small">Lebah akan mengejar anjing. Gambar <b style="color:#ffe9b8">SATU garis</b> untuk memantulkan lebah.<br>Bom 💣 & duri 🔺 bisa membantu. Sisa tinta = bintang!</div>
          <div class="lv" id="lvGrid"></div>
          <button class="gbtn" id="bPlay">▶ MAIN</button>
          <div class="hint">Ketuk & geser di layar untuk menggambar · garis boleh berupa kurva</div>
        </div>
      </div>
      <div class="ov hide" id="ovEnd">
        <div class="card2">
          <div class="big" id="endTitle">SELAMAT!</div>
          <div class="stars" id="endStars">⭐⭐⭐</div>
          <div class="small" id="endInfo"></div>
          <button class="gbtn" id="bNext">▶ LANJUT</button>
          <button class="gbtn alt" id="bAgain">↻ ULANGI</button>
          <button class="gbtn alt" id="bMenu">🏠 MENU</button>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
/*==PHYS==*/
var DW=700, DH=700, LINE_R=4, BEE_R=11, DOG_R=19;
var LEVELS=[
  {ink:620,t:8, dog:[350,560], nest:[120,180], bees:{n:2,spd:95,turn:1.6}, ground:620},
  {ink:600,t:10,dog:[350,560], nest:[560,160], bees:{n:3,spd:110,turn:1.8}, ground:620},
  {ink:560,t:11,dog:[300,560], nest:[120,150], bees:{n:4,spd:120,turn:2.0}, ground:620},
  {ink:560,t:12,dog:[380,560], nest:[600,200], bees:{n:4,spd:135,turn:2.1}, spikes:[[150,600,120]], ground:620},
  {ink:520,t:12,dog:[350,560], nest:[100,170], bees:{n:5,spd:140,turn:2.2}, bombs:[[560,320]], ground:620},
  {ink:520,t:13,dog:[320,560], nest:[580,150], bees:{n:5,spd:150,turn:2.3}, spikes:[[120,600,140]], bombs:[[520,300]], ground:620},
  {ink:500,t:14,dog:[360,560], nest:[110,160], bees:{n:6,spd:155,turn:2.4}, bombs:[[560,260],[180,300]], ground:620},
  {ink:480,t:14,dog:[340,560], nest:[590,180], bees:{n:7,spd:160,turn:2.5}, spikes:[[120,600,150],[430,600,150]], ground:620},
  {ink:460,t:15,dog:[350,560], nest:[100,150], bees:{n:8,spd:165,turn:2.6}, bombs:[[570,280],[140,280],[350,120]], ground:620},
  {ink:450,t:16,dog:[350,560], nest:[590,150], bees:{n:9,spd:170,turn:2.7}, spikes:[[100,600,160],[440,600,160]], bombs:[[350,140]], ground:620},
  {ink:430,t:17,dog:[350,560], nest:[110,170], bees:{n:10,spd:175,turn:2.8}, bombs:[[580,260],[130,260],[350,320]], ground:620},
  {ink:420,t:18,dog:[350,560], nest:[590,160], bees:{n:12,spd:180,turn:2.9}, spikes:[[90,600,170],[440,600,170]], bombs:[[350,130],[560,320],[140,320]], ground:620}
];
function segDist(px,py,ax,ay,bx,by){
  var dx=bx-ax, dy=by-ay, L2=dx*dx+dy*dy;
  var t=L2? ((px-ax)*dx+(py-ay)*dy)/L2 : 0; t=t<0?0:t>1?1:t;
  var x=ax+dx*t, y=ay+dy*t;
  return {d:Math.hypot(px-x,py-y), x:x, y:y};
}
function lineLen(pts){var s=0;for(var i=1;i<pts.length;i++)s+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);return s}
function makeDome(cx,cy,r,groundY){
  var pts=[],N=22;
  for(var i=0;i<=N;i++){var a=Math.PI+ i/N*Math.PI; pts.push([cx+Math.cos(a)*r, cy+Math.sin(a)*r]);}
  var last=pts[pts.length-1];
  pts.push([last[0],groundY-2]);
  var first=pts[0].slice(); pts.unshift([first[0],groundY-2]);
  return pts;
}
function newState(L){
  var st={L:L, t:0, result:null, inkLeft:L.ink, line:[], drawing:false,
    bees:[], bombs:[], dog:[L.dog[0],L.dog[1]], events:[], shake:0};
  for(var i=0;i<L.bees.n;i++){
    st.bees.push({x:L.nest[0], y:L.nest[1], vx:0, vy:0, spd:L.bees.spd*(0.9+0.2*Math.random()),
      turn:L.bees.turn, ph:Math.random()*6.28, born:0.9+i*0.55, alive:true, wob:0});
  }
  if(L.bombs)for(var b=0;b<L.bombs.length;b++)st.bombs.push({x:L.bombs[b][0],y:L.bombs[b][1],used:false});
  return st;
}
function reflect(vx,vy,nx,ny){var d=vx*nx+vy*ny; return [vx-2*d*nx, vy-2*d*ny]}
function stepSim(st,dt){
  if(st.result)return st;
  st.t+=dt; st.shake=Math.max(0,st.shake-dt*3);
  var L=st.L, gy=L.ground;
  var alive=0;
  for(var i=0;i<st.bees.length;i++){
    var b=st.bees[i]; if(!b.alive)continue;
    if(st.t<b.born){alive++;continue}
    var dx=st.dog[0]-b.x, dy=st.dog[1]-b.y, dist=Math.hypot(dx,dy)||1;
    b.wob+=dt*7;
    var wobA=Math.sin(b.wob)*0.55;
    var ux=dx/dist, uy=dy/dist;
    var wx=-uy*Math.sin(wobA)+ux*Math.cos(wobA), wy=ux*Math.sin(wobA)+uy*Math.cos(wobA);
    var k=Math.min(1,b.turn*dt);
    b.vx+=(wx*b.spd-b.vx)*k; b.vy+=(wy*b.spd-b.vy)*k;
    b.x+=b.vx*dt; b.y+=b.vy*dt;
    /* garis pensil = tembok */
    var pts=st.line;
    for(var s=1;s<pts.length;s++){
      var h=segDist(b.x,b.y,pts[s-1][0],pts[s-1][1],pts[s][0],pts[s][1]);
      var RR=BEE_R+LINE_R;
      if(h.d<RR&&h.d>0.001){
        var nx=(b.x-h.x)/h.d, ny=(b.y-h.y)/h.d;
        b.x=h.x+nx*(RR+0.5); b.y=h.y+ny*(RR+0.5);
        var r2=reflect(b.vx,b.vy,nx,ny);
        b.vx=r2[0]*0.55+(Math.random()-0.5)*60;
        b.vy=r2[1]*0.55+(Math.random()-0.5)*60;
        st.events.push({k:'tick',x:b.x,y:b.y});
      }
    }
    /* batas arena & tanah */
    if(b.x<BEE_R){b.x=BEE_R;b.vx=Math.abs(b.vx)*0.6}
    if(b.x>DW-BEE_R){b.x=DW-BEE_R;b.vx=-Math.abs(b.vx)*0.6}
    if(b.y<BEE_R){b.y=BEE_R;b.vy=Math.abs(b.vy)*0.6}
    if(b.y>gy-BEE_R){b.y=gy-BEE_R;b.vy=-Math.abs(b.vy)*0.6-40}
    /* bom */
    for(var bi=0;bi<st.bombs.length;bi++){
      var bo=st.bombs[bi];
      if(!bo.used&&Math.hypot(b.x-bo.x,b.y-bo.y)<34){
        bo.used=true; st.shake=1; st.events.push({k:'boom',x:bo.x,y:bo.y});
        for(var j=0;j<st.bees.length;j++){
          var ob=st.bees[j];
          if(ob.alive&&Math.hypot(ob.x-bo.x,ob.y-bo.y)<95){ob.alive=false;st.events.push({k:'poof',x:ob.x,y:ob.y})}
        }
      }
    }
    /* duri membunuh lebah */
    if(L.spikes)for(var si=0;si<L.spikes.length;si++){
      var sp=L.spikes[si];
      if(b.y>sp[1]-26&&b.y<sp[1]+20&&b.x>sp[0]&&b.x<sp[0]+sp[2]){
        b.alive=false; st.events.push({k:'poof',x:b.x,y:b.y});
      }
    }
    if(!b.alive)continue;
    /* lebah kena anjing = kalah */
    if(Math.hypot(b.x-st.dog[0],b.y-st.dog[1])<BEE_R+DOG_R-6){
      st.result='lose'; st.events.push({k:'lose'}); return st;
    }
    alive++;
  }
  if(st.t>=L.t||alive===0){st.result='win'; st.events.push({k:'win'}); return st}
  return st;
}
if(typeof module!=='undefined')module.exports={LEVELS:LEVELS,newState:newState,stepSim:stepSim,makeDome:makeDome,lineLen:lineLen,DW:DW,DH:DH};
/*==PHYS==*/
(function(){
/* penyimpanan aman: localStorage bisa diblokir di WebView tertentu */
var mem={};
function stGet(k){try{return localStorage.getItem(k)!==null?localStorage.getItem(k):(mem[k]!==undefined?mem[k]:null)}catch(e){return mem[k]!==undefined?mem[k]:null}}
function stSet(k,v){try{localStorage.setItem(k,v)}catch(e){} mem[k]=v}
var cv=document.getElementById('cv'), cx=cv.getContext('2d');
var SAVE={unlocked:1,stars:{}};
try{var s=stGet('usanagi-doge-save'); if(s)SAVE=JSON.parse(s)}catch(e){}
function save(){stSet('usanagi-doge-save',JSON.stringify(SAVE))}
var sOn=stGet('usanagi-doge-snd')!=='0';
var AC=null; function ensureAC(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)(); if(AC.state==='suspended')AC.resume()}catch(e){}}
function beep(f,dur,type,vol,slide){
  if(!sOn||!AC)return;
  try{var o=AC.createOscillator(),g=AC.createGain();
  o.type=type||'sine'; o.frequency.setValueAtTime(f,AC.currentTime);
  if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),AC.currentTime+dur);
  g.gain.setValueAtTime(vol||0.12,AC.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+dur);
  o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+dur)}catch(e){}
}
var SFX={
  tick:function(){beep(220,0.05,'square',0.05)},
  boom:function(){beep(70,0.4,'sawtooth',0.3,-40)},
  poof:function(){beep(500,0.12,'triangle',0.1,-300)},
  win:function(){beep(523,0.12,'sine',0.14);setTimeout(function(){beep(659,0.12,'sine',0.14)},120);setTimeout(function(){beep(784,0.25,'sine',0.16)},240)},
  lose:function(){beep(300,0.35,'sawtooth',0.18,-200)},
  buzz:function(){beep(160,0.1,'sawtooth',0.03,30)}
};
var $=function(id){return document.getElementById(id)};
var st=null, G={lv:1,playing:false};
var particles=[];
function toast(msg){var t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('show')},1600)}
function fit(){
  var r=cv.getBoundingClientRect(), dpr=Math.min(window.devicePixelRatio||1,2);
  cv.width=Math.round(r.width*dpr); cv.height=Math.round(r.height*dpr);
  cx.setTransform(cv.width/DW,0,0,cv.height/DH,0,0);
}
window.addEventListener('resize',fit);
/* ---------- gambar ---------- */
function drawBG(){
  var g=cx.createLinearGradient(0,0,0,DH);
  g.addColorStop(0,'#8fd7ff');g.addColorStop(0.6,'#c9ecff');g.addColorStop(1,'#e8ffd9');
  cx.fillStyle=g;cx.fillRect(0,0,DW,DH);
  cx.fillStyle='#ffffffb0';
  cx.beginPath();cx.ellipse(150,110,70,26,0,0,7);cx.fill();
  cx.beginPath();cx.ellipse(520,80,90,30,0,0,7);cx.fill();
  cx.beginPath();cx.ellipse(360,170,55,20,0,0,7);cx.fill();
  var gy=st?st.L.ground:620;
  cx.fillStyle='#7ccb5e';cx.fillRect(0,gy,DW,DH-gy);
  cx.fillStyle='#69b84f';cx.fillRect(0,gy,DW,10);
  cx.strokeStyle='#5aa344';cx.lineWidth=2;
  for(var x=14;x<DW;x+=34){cx.beginPath();cx.moveTo(x,gy+4);cx.lineTo(x-6,gy-10);cx.stroke()}
}
function drawDog(){
  var x=st.dog[0], y=st.dog[1];
  cx.save();cx.translate(x,y);
  cx.fillStyle='#00000022';cx.beginPath();cx.ellipse(0,DOG_R+4,24,7,0,0,7);cx.fill();
  cx.fillStyle='#e8963f';cx.beginPath();cx.ellipse(0,4,20,17,0,0,7);cx.fill();
  cx.fillStyle='#f7b267';cx.beginPath();cx.ellipse(0,9,13,10,0,0,7);cx.fill();
  cx.fillStyle='#e8963f';
  cx.beginPath();cx.moveTo(-17,-8);cx.lineTo(-22,-24);cx.lineTo(-7,-15);cx.closePath();cx.fill();
  cx.beginPath();cx.moveTo(17,-8);cx.lineTo(22,-24);cx.lineTo(7,-15);cx.closePath();cx.fill();
  cx.fillStyle='#ffffff';
  cx.beginPath();cx.arc(-7,-2,4.5,0,7);cx.fill();
  cx.beginPath();cx.arc(7,-2,4.5,0,7);cx.fill();
  cx.fillStyle='#26221c';
  cx.beginPath();cx.arc(-7,-2,2.2,0,7);cx.fill();
  cx.beginPath();cx.arc(7,-2,2.2,0,7);cx.fill();
  cx.fillStyle='#26221c';cx.beginPath();cx.ellipse(0,6,3,2.4,0,0,7);cx.fill();
  cx.fillStyle='#ff8d80';cx.beginPath();cx.ellipse(0,12,3.4,4.5,0,0,7);cx.fill();
  cx.restore();
}
function drawNest(){
  var x=st.L.nest[0], y=st.L.nest[1];
  cx.save();cx.translate(x,y);
  cx.strokeStyle='#8a5a2b';cx.lineWidth=7;cx.lineCap='round';
  cx.beginPath();cx.moveTo(0,40);cx.lineTo(0,-8);cx.stroke();
  cx.fillStyle='#c9a15a';
  cx.beginPath();cx.ellipse(0,-20,26,32,0,0,7);cx.fill();
  cx.fillStyle='#a87f3f';
  cx.beginPath();cx.ellipse(0,-30,18,12,0,0,7);cx.fill();
  cx.fillStyle='#5c431f';
  cx.beginPath();cx.ellipse(0,-12,8,6,0,0,7);cx.fill();
  cx.restore();
}
function drawBee(b){
  cx.save();cx.translate(b.x,b.y);
  var a=Math.atan2(b.vy,b.vx);cx.rotate(a);
  var wing=Math.sin(Date.now()/28+b.ph)*0.9;
  cx.fillStyle='#ffffffcc';
  cx.beginPath();cx.ellipse(-2,-8,9,4.5,-0.5+wing*0.4,0,7);cx.fill();
  cx.beginPath();cx.ellipse(-2,8,9,4.5,0.5-wing*0.4,0,7);cx.fill();
  cx.fillStyle='#ffd23f';cx.beginPath();cx.ellipse(0,0,12,8.5,0,0,7);cx.fill();
  cx.fillStyle='#3a2c11';
  cx.fillRect(-4,-8,3.6,16);cx.fillRect(2,-8.4,3.6,16.8);
  cx.beginPath();cx.ellipse(10,0,4,5,0,0,7);cx.fill();
  cx.restore();
}
function draw(){
  cx.save();
  if(st&&st.shake>0){cx.translate((Math.random()-0.5)*st.shake*14,(Math.random()-0.5)*st.shake*14)}
  drawBG();
  if(!st){cx.restore();return}
  /* duri */
  if(st.L.spikes)for(var i=0;i<st.L.spikes.length;i++){
    var sp=st.L.spikes[i];
    cx.fillStyle='#c9302c';
    for(var x=sp[0];x<sp[0]+sp[2];x+=20){
      cx.beginPath();cx.moveTo(x,sp[1]+16);cx.lineTo(x+10,sp[1]-14);cx.lineTo(x+20,sp[1]+16);cx.closePath();cx.fill();
    }
    cx.fillStyle='#7c1a17';cx.fillRect(sp[0],sp[1]+14,sp[2],6);
  }
  /* bom */
  for(var b=0;b<st.bombs.length;b++){
    var bo=st.bombs[b]; if(bo.used)continue;
    cx.fillStyle='#232323';cx.beginPath();cx.arc(bo.x,bo.y,16,0,7);cx.fill();
    cx.fillStyle='#ffffff30';cx.beginPath();cx.arc(bo.x-5,bo.y-5,5,0,7);cx.fill();
    cx.strokeStyle='#a87f3f';cx.lineWidth=3;
    cx.beginPath();cx.moveTo(bo.x+6,bo.y-14);cx.quadraticCurveTo(bo.x+16,bo.y-24,bo.x+10,bo.y-30);cx.stroke();
    var fl=2.5+Math.sin(Date.now()/90)*1.8;
    cx.fillStyle='#ff9f2e';cx.beginPath();cx.arc(bo.x+10,bo.y-31,fl,0,7);cx.fill();
  }
  drawNest();
  /* garis pensil */
  if(st.line.length>1){
    cx.strokeStyle='#2b2b2b';cx.lineCap='round';cx.lineJoin='round';cx.lineWidth=LINE_R*2;
    cx.globalAlpha=0.92;
    cx.beginPath();cx.moveTo(st.line[0][0],st.line[0][1]);
    for(var p=1;p<st.line.length;p++)cx.lineTo(st.line[p][0],st.line[p][1]);
    cx.stroke();cx.globalAlpha=1;
    cx.strokeStyle='#6b6b6b';cx.lineWidth=LINE_R*0.9;
    cx.stroke();
  }
  for(var i2=0;i2<st.bees.length;i2++){var be=st.bees[i2]; if(be.alive)drawBee(be)}
  drawDog();
  /* partikel */
  for(var q=0;q<particles.length;q++){
    var pt=particles[q];
    cx.globalAlpha=Math.max(0,pt.t/pt.life);
    cx.fillStyle=pt.col;
    cx.beginPath();cx.arc(pt.x,pt.y,pt.s,0,7);cx.fill();
  }
  cx.globalAlpha=1;
  cx.restore();
}
function syncHUD(){
  $('stx').textContent='Level '+G.lv+' · bertahan '+Math.max(0,Math.ceil(st.L.t-st.t))+'s';
  var alive=0;for(var i=0;i<st.bees.length;i++)if(st.bees[i].alive)alive++;
  $('cBee').textContent=alive;
  $('cTime').textContent=Math.max(0,Math.ceil(st.L.t-st.t));
  $('cStar').textContent=SAVE.stars[G.lv]||0;
  var ratio=st.inkLeft/st.L.ink;
  $('inkFill').style.width=(ratio*100)+'%';
  $('inkWrap').classList.toggle('low',ratio<0.25);
}
/* ---------- loop ---------- */
var last=0;
function loop(ts){
  var dt=Math.min(0.05,(ts-last)/1000||0.016); last=ts;
  if(G.playing&&st&&!st.result){
    stepSim(st,dt);
    if(st.t%0.5<dt)SFX.buzz();
    for(var e=0;e<st.events.length;e++){
      var ev=st.events[e];
      if(ev.k==='tick'){SFX.tick();spawn(ev.x,ev.y,'#ffffff',4)}
      else if(ev.k==='boom'){SFX.boom();spawn(ev.x,ev.y,'#ff9f2e',22)}
      else if(ev.k==='poof'){SFX.poof();spawn(ev.x,ev.y,'#ffd23f',10)}
      else if(ev.k==='win'){finish(true)}
      else if(ev.k==='lose'){SFX.lose();finish(false)}
    }
    st.events.length=0;
  }
  for(var p=particles.length-1;p>=0;p--){
    var q=particles[p]; q.t-=dt; q.x+=q.vx*dt; q.y+=q.vy*dt; q.vy+=300*dt;
    if(q.t<=0)particles.splice(p,1);
  }
  if(st){draw();syncHUD()}
  requestAnimationFrame(loop);
}
function spawn(x,y,col,n){
  for(var i=0;i<n;i++)particles.push({x:x,y:y,vx:(Math.random()-0.5)*220,vy:-Math.random()*220-40,t:0.5+Math.random()*0.4,life:0.8,col:col,s:2+Math.random()*3});
}
/* ---------- alur ---------- */
function startLevel(lv){
  ensureAC();
  G.lv=lv; st=newState(LEVELS[lv-1]); particles=[];
  G.playing=true; fit();
  $('ovMenu').classList.add('hide'); $('ovEnd').classList.add('hide');
  toast('Gambar garis pelindung! 🐝');
}
function stars(){
  var ratio=st.inkLeft/st.L.ink;
  return ratio>=0.55?3:ratio>=0.25?2:1;
}
function finish(win){
  G.playing=false;
  var s=win?stars():0;
  if(win){SFX.win();SAVE.stars[G.lv]=Math.max(SAVE.stars[G.lv]||0,s);SAVE.unlocked=Math.max(SAVE.unlocked,Math.min(LEVELS.length,G.lv+1));save()}
  $('endTitle').textContent=win?'ANJING SELAMAT! 🐶❤️':'KENA LEBAH! 🐝';
  $('endStars').innerHTML=win?(new Array(4-s).join('⭐')+'<span class="off">'+new Array(4-s).join('⭐')+'</span>').replace(/⭐(?=<)/g,'⭐'):'<span class="off">⭐⭐⭐</span>';
  if(win){
    var html_s='';
    for(var i=0;i<3;i++)html_s+=i<s?'⭐':'<span class="off">⭐</span>';
    $('endStars').innerHTML=html_s;
  }
  $('endInfo').textContent=win?('Bertahan '+st.L.t+' detik · tinta tersisa '+Math.round(st.inkLeft/st.L.ink*100)+'%'):('Coba gambar garis yang menutupi anjing dari arah sarang!');
  $('bNext').style.display=win&&G.lv<LEVELS.length?'block':'none';
  $('ovEnd').classList.remove('hide');
  buildLevels();
}
function buildLevels(){
  var g=$('lvGrid'); g.innerHTML='';
  for(var i=1;i<=LEVELS.length;i++){
    var b=document.createElement('button');
    b.className='lvb'+(i>SAVE.unlocked?' lock':'')+(SAVE.stars[i]?' done':'');
    b.innerHTML=i+'<span>'+(SAVE.stars[i]?'⭐'+SAVE.stars[i]:(i>SAVE.unlocked?'🔒':'MAIN'))+'</span>';
    (function(lv){b.addEventListener('click',function(){if(lv<=SAVE.unlocked)startLevel(lv);else toast('Selesaikan level sebelumnya dulu!')})})(i);
    g.appendChild(b);
  }
}
/* ---------- input gambar garis ---------- */
var drawing=false;
function toLocal(e){
  var r=cv.getBoundingClientRect();
  return [ (e.clientX-r.left)/r.width*DW, (e.clientY-r.top)/r.height*DH ];
}
cv.addEventListener('pointerdown',function(e){
  if(!G.playing||!st||st.result)return;
  e.preventDefault();e.stopPropagation();
  if(st.line.length===0){ensureAC()}
  drawing=true;
  try{cv.setPointerCapture(e.pointerId)}catch(err){}
  var p=toLocal(e);
  if(st.inkLeft<=0){toast('Tinta habis!');drawing=false;return}
  st.line=[p];
},{passive:false});
cv.addEventListener('pointermove',function(e){
  if(!drawing||!st||st.result)return;
  e.preventDefault();e.stopPropagation();
  var p=toLocal(e), lastP=st.line[st.line.length-1];
  var d=Math.hypot(p[0]-lastP[0],p[1]-lastP[1]);
  if(d<6)return;
  if(d>st.inkLeft){
    var k=st.inkLeft/d;
    p=[lastP[0]+(p[0]-lastP[0])*k, lastP[1]+(p[1]-lastP[1])*k];
    st.inkLeft=0; toast('Tinta habis!');
  } else st.inkLeft-=d;
  st.line.push(p);
},{passive:false});
function endDraw(e){
  if(!drawing)return;
  if(e){e.preventDefault();e.stopPropagation()}
  drawing=false;
  if(st&&st.line.length>1)beep(700,0.06,'triangle',0.08);
}
cv.addEventListener('pointerup',endDraw,{passive:false});
cv.addEventListener('pointercancel',endDraw,{passive:false});
/* ---------- tombol ---------- */
$('bPlay').addEventListener('click',function(){startLevel(Math.min(SAVE.unlocked,LEVELS.length))});
$('bNext').addEventListener('click',function(){startLevel(Math.min(LEVELS.length,G.lv+1))});
$('bAgain').addEventListener('click',function(){startLevel(G.lv)});
$('bMenu').addEventListener('click',function(){$('ovEnd').classList.add('hide');$('ovMenu').classList.remove('hide');buildLevels()});
$('bHome').addEventListener('click',function(){G.playing=false;$('ovEnd').classList.add('hide');$('ovMenu').classList.remove('hide');buildLevels()});
$('bRetry').addEventListener('click',function(){if(G.lv)startLevel(G.lv)});
$('bSound').addEventListener('click',function(){sOn=!sOn;stSet('usanagi-doge-snd',sOn?'1':'0');this.textContent=sOn?'🔊':'🔇';this.classList.toggle('on',sOn);if(sOn)ensureAC()});
$('bSound').textContent=sOn?'🔊':'🔇';
document.addEventListener('touchmove',function(e){if(e.target===cv)e.preventDefault()},{passive:false});
buildLevels(); fit(); requestAnimationFrame(loop);
})();
</script>
</body>
</html>`

/* ---------- UJI KELAYAKAN: buktikan semua level bisa diselamatkan.
   Jalankan: node plugins/game/doge.js --solve
   Strategi uji: kubah pensil mengelilingi anjing (cakupan penuh) harus muat
   di anggaran tinta & anjing harus selamat sampai waktu habis. */
if (process.argv[2] === '--solve') {
  const fs = await import('node:fs')
  const src = fs.readFileSync(new URL(import.meta.url).pathname, 'utf8')
  const block = src.match(/\/\*==PHYS==\*\/([\s\S]*?)\/\*==PHYS==\*\//)[1]
  const mod = { exports: {} }
  new Function('module', 'exports', block)(mod, mod.exports)
  const P = mod.exports
  const DW = P.DW
  let gagal = []
  for (let i = 0; i < P.LEVELS.length; i++) {
    const L = P.LEVELS[i]
    const masalah = []
    if (L.bees.n < 1) masalah.push('tanpa lebah')
    if (Math.hypot(L.dog[0] - L.nest[0], L.dog[1] - L.nest[1]) < 200) masalah.push('sarang terlalu dekat')
    if (L.dog[1] > L.ground - 20) masalah.push('anjing di bawah tanah')
    /* kubah melindungi anjing: radius aman, muat anggaran */
    let r = Math.min(120, L.dog[1] - 40, DW - L.dog[0] - 30, L.dog[0] - 30)
    let dome = P.makeDome(L.dog[0], L.dog[1], r, L.ground)
    let panjang = P.lineLen(dome)
    while (panjang > L.ink && r > 60) {
      r -= 6
      dome = P.makeDome(L.dog[0], L.dog[1], r, L.ground)
      panjang = P.lineLen(dome)
    }
    if (panjang > L.ink) masalah.push('kubah ' + Math.round(panjang) + ' > tinta ' + L.ink)
    if (!masalah.length) {
      const st = P.newState(L)
      st.line = dome
      const dt = 1 / 60
      let langkah = 0
      while (!st.result && langkah < (L.t + 4) * 60) { P.stepSim(st, dt); langkah++ }
      if (st.result !== 'win') masalah.push('simulasi berakhir: ' + (st.result || 'belum selesai'))
    }
    const ok = !masalah.length
    console.log('Level ' + String(i + 1).padStart(2) + (ok ? ' ✓ aman (kubah r=' + r + ', tinta ' + Math.round(panjang) + '/' + L.ink + ', lebah ' + L.bees.n + ')' : ' ✗ ' + masalah.join(' · ')))
    if (!ok) gagal.push(i + 1)
  }
  process.exit(gagal.length ? 1 : 0)
}

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return
  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🐶', key: reactionKey } }).catch(() => {})

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
                messageText: 'Usanagi Umi AI Save the Doge 🐶',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'usanagi-ai-doge-2026',
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

handler.help = ['doge', 'savedoge', 'savethedoge']
handler.tags = ['game']
handler.command = /^(doge|savedoge|savethedoge)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Save the Doge - gambar garis pensil untuk melindungi anjing dari lebah, 12 level'

export default handler
