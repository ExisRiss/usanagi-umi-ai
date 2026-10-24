
'use strict'

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#040814">
<title>Usanagi Umi AI Sky Raiders</title>
<style>
:root{--bg:#040814;--panel:#0b1226;--line:#2c3f74;--text:#eaf2ff;--dim:#8ba0cf;--cyan:#5cd9ff;--blue:#3f7aff;--gold:#ffd36e;--red:#ff5d6c;--green:#66f0b0}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;-webkit-user-drag:none}
html,body{min-height:100%;overscroll-behavior:none;background:radial-gradient(760px 420px at 50% -12%,#17305e 0%,#08122b 54%,#03060f 100%);color:var(--text);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;align-items:center;padding:max(9px,env(safe-area-inset-top)) max(9px,env(safe-area-inset-right)) max(11px,env(safe-area-inset-bottom)) max(9px,env(safe-area-inset-left));overflow-x:hidden;touch-action:manipulation}
.app{width:min(100%,560px);margin:auto}
.cab{position:relative;width:100%;background:linear-gradient(180deg,#152142,#080f22);border:1px solid #35496f;border-radius:22px;padding:10px;box-shadow:0 30px 80px #000d,inset 0 1px 0 #ffffff14}
.head{position:relative;z-index:9;display:flex;align-items:center;justify-content:space-between;gap:9px;background:#070d1e;border:1px solid #26365f;border-radius:14px;padding:8px 9px;margin-bottom:8px}
.brand{display:flex;align-items:center;gap:9px;min-width:0}
.logo{width:40px;height:40px;flex:none;display:grid;place-items:center;border-radius:11px;background:linear-gradient(150deg,#7ce9ff,#3f7aff 58%,#8a5bff);border:1px solid #6f86d8;color:#03102a;font:950 16px system-ui;letter-spacing:-.5px;box-shadow:0 4px 0 #0c1a3c,inset 0 1px 0 #ffffff8c}
.brandText{min-width:0}
.title{font-size:16px;font-weight:950;letter-spacing:1.1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:linear-gradient(90deg,#9df1ff,#7fb0ff 60%,#ffe6a8);-webkit-background-clip:text;background-clip:text;color:transparent}
.sub{margin-top:2px;color:var(--dim);font-size:8px;letter-spacing:.34px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.headBtns{display:flex;gap:6px;flex:none}
.mb{width:38px;height:38px;flex:none;border:1px solid #33467a;border-radius:10px;background:linear-gradient(180deg,#1d2a52,#0d1730);color:#e7eeff;font-size:16px;box-shadow:0 3px 0 #050b1a}
.hud{display:flex;align-items:center;gap:6px;flex-wrap:wrap;background:#060c1c;border:1px solid #223257;border-radius:12px;padding:6px 7px;margin-bottom:8px}
.hpWrap{display:flex;align-items:center;gap:5px;flex:1 1 126px;min-width:112px}
.hpWrap b{font-size:6.6px;letter-spacing:.14em;color:var(--dim)}
.hpBar{position:relative;flex:1;height:11px;border-radius:6px;background:#0d2038;border:1px solid #2c5c86;overflow:hidden;box-shadow:inset 0 2px 4px #000a}
.hpBar i{position:absolute;inset:0 auto 0 0;width:100%;border-radius:6px 0 0 6px;background:linear-gradient(180deg,#a9f4ff,#43c8ff 58%,#1660a8);transition:width .16s ease}
.hpBar.low i{background:linear-gradient(180deg,#ffe6a8,#ffb03a 60%,#a8590a)}
.hpBar.crit i{background:linear-gradient(180deg,#ffc2c8,#ff5d6c 60%,#8d1020);animation:pulseHp .7s infinite}
@keyframes pulseHp{0%,100%{filter:brightness(1)}50%{filter:brightness(1.5)}}
.hpNum{font:900 10px system-ui;color:#cdd9ff;min-width:20px;text-align:right}
.hs{display:flex;align-items:center;gap:4px;padding:3px 6px;background:#0f1732;border:1px solid #263356;border-radius:8px}
.hs b{font-size:6.4px;letter-spacing:.12em;color:var(--dim)}
.hs span{font:900 10px system-ui;color:#bed2ff;letter-spacing:.3px}
.hs.pw span{color:#ffe6a8}
.hs.roll span.ready{color:var(--green)}.hs.roll span.wait{color:#ffab6b}
.stage{position:relative;width:100%;aspect-ratio:480/296;border:1px solid #263358;border-radius:15px;overflow:hidden;background:#03060f;box-shadow:inset 0 10px 26px #000d,0 8px 22px #0009;touch-action:none}
.stage canvas{display:block;width:100%;height:100%;touch-action:none;user-select:none}
.prog{position:absolute;left:0;right:0;bottom:0;height:5px;background:#000000aa}
.prog i{display:block;height:100%;width:0;background:linear-gradient(90deg,#5cd9ff,#7f58ff,#ffd36e);box-shadow:0 0 10px #5cd9ffaa;transition:width .2s ease}
.bossBar{position:absolute;left:8px;right:8px;top:7px;padding:5px 7px;border-radius:9px;background:#120a26e8;border:1px solid #5b3aa8;opacity:0;transform:translateY(-8px);transition:opacity .25s ease,transform .25s ease;pointer-events:none}
.bossBar.show{opacity:1;transform:translateY(0)}
.bossBar b{display:block;font:900 6.8px system-ui;letter-spacing:.2em;color:#d7bcff;margin-bottom:3px}
.bossBar .bb{height:7px;border-radius:4px;background:#20103f;border:1px solid #4d2a8a;overflow:hidden}
.bossBar .bb i{display:block;height:100%;width:100%;background:linear-gradient(180deg,#ffb0d8,#c33ce0 58%,#6b0f92);transition:width .18s ease}
.banner{position:absolute;left:0;right:0;top:32%;text-align:center;pointer-events:none;opacity:0;transition:opacity .3s ease,letter-spacing .4s ease;font:950 17px system-ui;letter-spacing:.06em;color:#e2f6ff;text-shadow:0 3px 0 #000000a0,0 0 18px #5cd9ff8c}
.banner.show{opacity:1;letter-spacing:.16em}
.banner small{display:block;margin-top:5px;font:800 8px system-ui;letter-spacing:.2em;color:#a6bcff}
.ov{position:absolute;inset:0;z-index:7;display:grid;place-items:center;background:#03060fd9;backdrop-filter:blur(9px);padding:12px;border-radius:22px;transition:opacity .22s ease}
.ov.hide{opacity:0;pointer-events:none}
.ovCard{width:min(94%,366px);max-height:calc(100% - 8px);overflow:auto;-webkit-overflow-scrolling:touch;text-align:center;padding:15px 13px;border:1px solid #3f4f96;border-radius:17px;background:linear-gradient(180deg,#161f45,#080f26);box-shadow:0 20px 46px #000a,inset 0 1px 0 #ffffff1c;animation:pop .26s ease}
@keyframes pop{from{transform:scale(.9);opacity:0}to{transform:scale(1);opacity:1}}
.ovIcon{font-size:27px;line-height:1}
.ovTitle{margin-top:6px;font-size:20px;font-weight:950;letter-spacing:.5px}
.ovText{margin-top:6px;color:var(--dim);font-size:9px;line-height:1.5}
.ovStats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:11px}
.ovStats div{padding:6px 5px;border:1px solid #2e3b74;border-radius:9px;background:#0a112a}
.ovStats b{display:block;font-size:12px;color:#9de8ff}
.ovStats span{display:block;margin-top:3px;font-size:6px;letter-spacing:.12em;color:var(--dim);text-transform:uppercase}
.ovBtns{display:grid;gap:6px;margin-top:11px}
.row3{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.sbtn{min-height:38px;border:1px solid #3b4a90;border-radius:10px;background:linear-gradient(180deg,#1f2857,#101636);color:#eaf2ff;font:900 8.2px system-ui;letter-spacing:.06em;box-shadow:0 4px 0 #060c1e,inset 0 1px 0 #ffffff1c;touch-action:manipulation}
.sbtn.sel{border-color:#ffd98a;background:linear-gradient(180deg,#9d7c36,#553f10);color:#1b1403}
.sbtn.go{border-color:#8ff4c2;background:linear-gradient(180deg,#4be0a0,#177a52);color:#052016;box-shadow:0 4px 0 #0d3a28,inset 0 1px 0 #ffffff4d}
.sbtn:active{transform:translateY(3px);box-shadow:0 1px 0 #060c1e}
.pad{margin-top:9px;display:grid;grid-template-columns:1fr 1fr;gap:9px;align-items:end}
/* area tombol arah: gesture eksklusif — jari di sini tidak boleh menggulir halaman */
.usanagi-analog{touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;-webkit-user-drag:none;overscroll-behavior:contain}
.movePad{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,46px);gap:5px;touch-action:none}
.movePad .mbtn{min-height:0;padding:2px;font-size:17px}
.mbtn.up{grid-area:1/2}
.mbtn.left{grid-area:2/1}
.mbtn.right{grid-area:2/3}
.mbtn.down{grid-area:3/2}
.movePad .hub{grid-area:2/2;border:1px dashed #33477e;border-radius:11px}
.mbtn{min-height:46px;border:1px solid #3d4d94;border-radius:12px;background:linear-gradient(180deg,#222c63,#121838);color:#f0f4ff;font:900 17px system-ui;box-shadow:0 5px 0 #060c1e,inset 0 1px 0 #ffffff22;touch-action:none;user-select:none;display:grid;place-items:center}
.mbtn small{display:block;font-size:6px;letter-spacing:.14em;color:#8ba0cf;margin-top:1px}
.mbtn.active{transform:translateY(3px);box-shadow:0 2px 0 #060c1e;filter:brightness(1.2)}
.actPad{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.abtn{min-height:52px;border:1px solid #3d4d94;border-radius:13px;background:linear-gradient(180deg,#222c63,#121838);color:#f0f4ff;font:900 8.4px system-ui;letter-spacing:.06em;box-shadow:0 5px 0 #060c1e,inset 0 1px 0 #ffffff22;touch-action:none;user-select:none}
.abtn.roll{background:linear-gradient(180deg,#2a4f8a,#10233f);border-color:#4f86d8;color:#d6ecff}
.abtn.bom{background:linear-gradient(180deg,#8a2a3d,#3d0f1c);border-color:#e0536b;color:#ffe3e7}
.abtn.active{transform:translateY(4px);box-shadow:0 2px 0 #060c1e;filter:brightness(1.2)}
.abtn.cool{opacity:.45;filter:saturate(.35)}
.foot{display:flex;justify-content:space-between;gap:8px;margin-top:7px;padding:0 3px;color:#7f8fc0;font-size:6.4px}
.foot span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.foot kbd{padding:2px 4px;border:1px solid #2f3a72;border-radius:4px;background:#0a1029;color:#9faaeb;font:700 6px system-ui}
@media(max-width:380px){body{padding:7px}.cab{padding:8px;border-radius:19px}.title{font-size:14px}.logo{width:35px;height:35px;font-size:14px}.abtn{min-height:46px}.ovTitle{font-size:17px}}
@media(min-width:720px){body{padding-top:18px;padding-bottom:18px}.cab{padding:13px;border-radius:24px}}
</style>
</head>
<body>
<div class="app">
  <div class="cab">
    <div class="head">
      <div class="brand">
        <div class="logo">SR</div>
        <div class="brandText"><div class="title">SKY RAIDERS</div><div class="sub" id="stageSub">SEKTOR 01 • USANAGI UMI AI ARCADE</div></div>
      </div>
      <div class="headBtns">
        <button class="mb" id="pauseB" type="button" aria-label="Jeda">⏸</button>
        <button class="mb" id="muteB" type="button" aria-label="Suara">🔊</button>
      </div>
    </div>

    <div class="hud">
      <div class="hpWrap"><b>ARMOR</b><div class="hpBar" id="hpBar"><i id="hpFill"></i></div><span class="hpNum" id="hpTxt">100</span></div>
      <div class="hs"><b>SKOR</b><span id="score">0</span></div>
      <div class="hs"><b>PESAWAT</b><span id="lives">3</span></div>
      <div class="hs pw"><b>POWER</b><span id="pw">1</span></div>
      <div class="hs"><b>SHIELD</b><span id="sh">—</span></div>
      <div class="hs roll"><b>ROLL</b><span id="rollTxt" class="ready">SIAP</span></div>
      <div class="hs"><b>BOM</b><span id="bom">3</span></div>
    </div>

    <div class="stage" id="stage">
      <canvas id="cv"></canvas>
      <div class="bossBar" id="bossBar"><b id="bossName">⚠ BOS</b><div class="bb"><i id="bossFill"></i></div></div>
      <div class="banner" id="banner"></div>
      <div class="prog"><i id="progFill"></i></div>
    </div>

    <div class="pad">
      <div class="movePad usanagi-analog" id="movePad">
        <button class="mbtn up" id="bUp" type="button">▲<small>ATAS</small></button>
        <button class="mbtn left" id="bLeft" type="button">◀<small>KIRI</small></button>
        <i class="hub"></i>
        <button class="mbtn right" id="bRight" type="button">▶<small>KANAN</small></button>
        <button class="mbtn down" id="bDown" type="button">▼<small>BAWAH</small></button>
      </div>
      <div class="actPad">
        <button class="abtn bom" id="bBom" type="button">💥 BOM</button>
        <button class="abtn roll" id="bRoll" type="button">↯ ROLL</button>
        <button class="abtn" id="bFire" type="button" style="grid-column:1/3">🔥 TEMBAK (OTOMATIS: AKTIF)</button>
      </div>
    </div>

    <div class="foot"><span>Tombol arah ATAU geser di layar untuk terbang • tembakan otomatis • ↯ ROLL = kebal sekejap</span><span><kbd>←↑↓→</kbd> <kbd>SPACE</kbd> <kbd>SHIFT</kbd> <kbd>P</kbd></span></div>

    <div class="ov" id="ov">
      <div class="ovCard">
        <div class="ovIcon" id="ovIcon">🛩️</div>
        <h2 class="ovTitle" id="ovTitle">SKY RAIDERS</h2>
        <p class="ovText" id="ovText">Pilih sektor, lalu tekan MULAI.</p>
        <div class="ovStats" id="ovStats"></div>
        <div class="ovBtns" id="ovBtns"></div>
      </div>
    </div>
  </div>
</div>
<script>
'use strict';
(function(){
var D=document;
/* WhatsApp/webview: matikan menu TEKAN-LAMA (Salin/Bagikan/Hapus), seleksi teks, dan seret
   gambar — supaya sentuhan di permainan tidak direbut lapisan chat di atasnya */
(function(){
  var evs=['contextmenu','selectstart','dragstart','gesturestart'],i;
  for(i=0;i<evs.length;i++){
    D.addEventListener(evs[i],function(e){
      var t=e.target;
      if(t&&t.closest&&t.closest('textarea,input,[contenteditable]'))return;
      e.preventDefault();
    },false);
  }
  D.addEventListener('touchmove',function(e){
    var t=e.target,n;
    if(t&&t.closest&&t.closest('textarea,input,[contenteditable],.ovCard,.modal'))return;
    for(n=t;n&&n!==D.body;n=n.parentElement){
      if(n.scrollHeight>n.clientHeight+4)return;
    }
    if(D.documentElement.scrollHeight>window.innerHeight+4)return;
    e.preventDefault();
  },{passive:false});
})();
function $(i){return D.getElementById(i)}
function clamp(v,a,b){return v<a?a:(v>b?b:v)}
function rnd(a,b){return a+Math.random()*(b-a)}
function ri(a,b){return Math.floor(a+Math.random()*(b-a+1))}
function pick(a){return a[(Math.random()*a.length)|0]}
function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}

var cv=$('cv'),ctx=cv.getContext('2d',{alpha:false});
var VW=480,VH=296;
function fit(){
  var host=cv.parentNode||D.body;
  var w=host.clientWidth||VW;
  var dpr=Math.min(1.35,Math.max(1,window.devicePixelRatio||1));
  cv.width=Math.max(280,Math.round(w*dpr));
  cv.height=Math.max(170,Math.round(cv.width*VH/VW));
  if(cv.width/VW>2.6){cv.width=Math.round(2.6*VW);cv.height=Math.round(2.6*VH)}
  ctx.imageSmoothingEnabled=true;
  if(ctx.imageSmoothingQuality)ctx.imageSmoothingQuality='high';
}
/* ══════════ AUDIO ══════════ */
var AC=null,master=null,muted=false;
function ensureAC(){try{if(!AC){var C=window.AudioContext||window.webkitAudioContext;if(C)AC=new C()}if(AC&&AC.state==='suspended'&&AC.resume)AC.resume()}catch(e){}return AC}
function bus(){if(!master&&AC){master=AC.createGain();master.gain.value=muted?0:0.5;master.connect(AC.destination)}return master}
function tone(f1,f2,dur,vol,type,delay){
  var a=ensureAC();if(!a)return;var m=bus();if(!m)return;
  try{
    var t0=a.currentTime+(delay||0),o=a.createOscillator(),g=a.createGain();
    o.type=type||'square';o.frequency.setValueAtTime(f1,t0);
    if(f2&&f2!==f1)o.frequency.exponentialRampToValueAtTime(Math.max(24,f2),t0+dur);
    g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(Math.max(0.0002,vol||0.05),t0+0.012);
    g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
    o.connect(g);g.connect(m);o.start(t0);o.stop(t0+dur+0.02);
  }catch(e){}
}
function noise(dur,vol,f0,f1,delay){
  var a=ensureAC();if(!a)return;var m=bus();if(!m)return;
  try{
    var n=Math.max(1,Math.floor(a.sampleRate*dur)),buf=a.createBuffer(1,n,a.sampleRate),d=buf.getChannelData(0),i;
    for(i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
    var s=a.createBufferSource();s.buffer=buf;
    var bp=a.createBiquadFilter();bp.type='lowpass';bp.frequency.setValueAtTime(f0||900,a.currentTime);
    if(f1)bp.frequency.exponentialRampToValueAtTime(Math.max(60,f1),a.currentTime+dur);
    var g=a.createGain();g.gain.value=vol||0.08;
    s.connect(bp);bp.connect(g);g.connect(m);s.start(a.currentTime+(delay||0));
  }catch(e){}
}
var sfx={
  shot:function(){tone(880,520,.05,.02,'square')},
  laser:function(){tone(1400,700,.07,.025,'sawtooth')},
  hit:function(){tone(200,120,.06,.035,'square')},
  kill:function(){noise(.2,.06,1400,300);tone(320,120,.14,.03,'square')},
  boom:function(){noise(.5,.14,900,70);tone(120,40,.4,.06,'sawtooth')},
  roll:function(){tone(700,1500,.14,.04,'triangle')},
  bomb:function(){tone(200,60,.5,.07,'sawtooth');noise(.7,.12,1000,60)},
  power:function(){tone(700,1500,.16,.05,'triangle');tone(1100,2200,.14,.04,'triangle',.1)},
  boss:function(){tone(150,70,.7,.07,'sawtooth');noise(.7,.09,700,90)},
  clear:function(){tone(660,1320,.3,.055,'triangle');tone(990,1980,.34,.045,'triangle',.16)},
  dead:function(){tone(500,70,.6,.06,'sawtooth')},
  click:function(){tone(900,650,.05,.035,'square')}
};
/* ══════════ STAGE ══════════ */
var STAGES=[
  {name:'SKYLINE APPROACH',sub:'SEKTOR 01 • LANGIT KOTA',len:5400,
   pal:{sky:['#0a1330','#1a3566','#4a7fc8'],ground:'#16233f',detail:'#2c4470',accent:'#5cd9ff'},
   pool:['scout','gunner','weaver'],boss:{name:'WING COMMANDER',kind:'wing',hp:300}},
  {name:'OCEAN RUN',sub:'SEKTOR 02 • SAMUDRA',len:5600,
   pal:{sky:['#04161f','#0a3a52','#1a7a94'],ground:'#06222c',detail:'#0e4a5c',accent:'#66f0b0'},
   pool:['gunner','turret','drone'],boss:{name:'TIDAL CORE',kind:'core',hp:340}},
  {name:'CANYON PASS',sub:'SEKTOR 03 • NGARAI',len:5800,
   pal:{sky:['#2a1206','#5c2a0c','#a8551a'],ground:'#3a1a08',detail:'#6b3210',accent:'#ffd36e'},
   pool:['weaver','scout','turret'],boss:{name:'FORT MESA',kind:'fortress',hp:380}},
  {name:'ORBITAL RING',sub:'SEKTOR 04 • ORBIT',len:6000,
   pal:{sky:['#05030f','#140a33','#331a66'],ground:'#0d0722',detail:'#2a1460',accent:'#c39bff'},
   pool:['drone','gunner','carrier'],boss:{name:'HIVE NEXUS',kind:'hive',hp:420}},
  {name:'IRON FORTRESS',sub:'SEKTOR 05 • BENTENG BAJA',len:6400,
   pal:{sky:['#0b0b12','#1e1f2e','#3a3d52'],ground:'#14151f',detail:'#33374a',accent:'#ff5d6c'},
   pool:['scout','weaver','turret','gunner'],boss:{name:'OMEGA DREADNOUGHT',kind:'omega',hp:520}}
];
/* ══════════ STATE ══════════ */
var state='menu',tick=0,mission=0,ST=STAGES[0];
var sc=0,score=0,lives=3,kills=0,shots=0,hits=0,diff=1;
var enemies=[],bullets=[],eBullets=[],bombs=[],booms=[],parts=[],pops=[],drops=[],pending=[];
var bossRef=null,spawnCd=60,stageDone=false,bannerT=0,bannerEl=null,cam={shake:0};
var waveIdx=0;
var CLEAR_KEY='usanagi_sr_clear',cleared={};
try{var _c=localStorage.getItem(CLEAR_KEY);if(_c){var _a=_c.split(',');for(var _i=0;_i<_a.length;_i++)if(_a[_i])cleared[_a[_i]]=1}}catch(e){}
function markCleared(id){cleared[id]=1;try{var l=[],k;for(k in cleared)if(cleared[k])l.push(k);localStorage.setItem(CLEAR_KEY,l.join(','))}catch(e){}}
var FIXED=1/60,acc=0,last=0;
var P={x:80,y:VH/2,w:26,h:20,hp:100,maxHp:100,inv:0,fireT:0,pw:1,shield:0,rollT:0,rollCd:0,bombs:3,
  anim:0,dead:false,deadT:0,fire:true,kx:0,ky:0};
var input={left:false,right:false,up:false,down:false};
/* ══════════ SETUP ══════════ */
function buildStage(m){
  var i;ST=STAGES[m];
  sc=0;enemies.length=0;bullets.length=0;eBullets.length=0;bombs.length=0;booms.length=0;parts.length=0;pops.length=0;drops.length=0;pending.length=0;
  bossRef=null;spawnCd=70;stageDone=false;waveIdx=0;pendingSlide=0;
  P.x=80;P.y=VH/2;P.hp=P.maxHp;P.inv=60;P.pw=1;P.shield=0;P.rollT=0;P.rollCd=0;P.bombs=3;P.dead=false;P.deadT=0;
  cam.shake=0;
  if(bossBarEl)bossBarEl.classList.remove('show');
  stageLenDone=false;
}
var pendingSlide=0,stageLenDone=false;
/* ══════════ FORMATIONS ══════════ */
function queueFormation(){
  var i,n,t,form=ri(0,3),base=ri(40,VH-90);
  n=ri(3,6);
  for(i=0;i<n;i++){
    t=pick(ST.pool);
    if(mission===3&&Math.random()<.25)t='carrier';
    pending.push({k:t,y:clamp(base+i*22,36,VH-40),delay:i*16,sort:'form'});
  }
  if(Math.random()<.5)pending.push({k:pick(ST.pool),y:rnd(40,VH-50),delay:60,sort:'lone'});
}
function spawnEnemy(t,y,delay){
  var e={kind:t,x:VW+30,y:y,vx:0,vy:0,hp:1,w:20,h:18,dead:false,atkT:ri(50,110),hurt:0,anim:rnd(0,6),base:y,ph:rnd(0,6),drop:0,cool:delay||0};
  /* semua kecepatan dalam piksel per langkah (60 fps tetap) */
  if(t==='scout'){e.hp=14;e.vx=-rnd(2.8,3.9);e.w=20;e.h=14}
  else if(t==='gunner'){e.hp=28;e.vx=-1.5;e.w=24;e.h=20;e.stop=rnd(120,300)}
  else if(t==='weaver'){e.hp=22;e.vx=-2.0;e.w=22;e.h=16;e.cool=ri(30,70)}
  else if(t==='drone'){e.hp=34;e.vx=-1.2;e.w=22;e.h=20}
  else if(t==='turret'){e.hp=48;e.vx=0;e.w=26;e.h=22;e.fixed=true;e.y=(Math.random()<.5)?14:VH-26;e.atkT=ri(40,80)}
  else if(t==='carrier'){e.hp=95;e.vx=-.75;e.w=44;e.h=30;e.drop=1;e.atkT=90}
  enemies.push(e);
  return e;
}
function mkBoss(){
  var b=ST.boss,hp=Math.round(b.hp*(1+(diff-1)*.3));
  var e={kind:'boss',bossKind:b.kind,name:b.name,x:VW+70,y:VH/2,w:76,h:64,hp:hp,maxHp:hp,vx:-1.4,vy:0,dead:false,
    atkT:80,atkT2:150,hurt:0,anim:0,phase:0,anim2:0,base:VH/2,home:VW-140,entered:false};
  if(b.kind==='fortress'){e.w=96;e.h=110;e.y=VH/2}
  enemies.push(e);bossRef=e;
  if(bossBarEl){bossBarEl.classList.add('show')}
  var bn=$('bossName');if(bn)bn.textContent='⚠ '+b.name;
  banner('⚠ '+b.name,'TEMBAK TITIK LEMAHNYA');
  sfx.boss();
  return e;
}
/* ══════════ PLAYER ACTIONS ══════════ */
function fireShot(){
  if(state!=='play'||P.dead)return;
  var lv=P.pw,i;
  var y0=P.y;
  if(lv>=4){
    bullets.push({x:P.x+16,y:y0-5,vx:14,vy:0,dmg:13,life:48,c:'#9df1ff',size:4,pierce:60,laser:1});
    bullets.push({x:P.x+16,y:y0+5,vx:14,vy:0,dmg:13,life:48,c:'#9df1ff',size:4,pierce:60,laser:1});
    sfx.laser();
  }else{
    bullets.push({x:P.x+16,y:y0,vx:13,vy:0,dmg:9,life:44,c:'#eaf6ff',size:3.4,pierce:0});
    if(lv>=2){
      bullets.push({x:P.x+14,y:y0-7,vx:13,vy:-.15,dmg:8,life:44,c:'#bfe9ff',size:3,pierce:0});
      bullets.push({x:P.x+14,y:y0+7,vx:13,vy:.15,dmg:8,life:44,c:'#bfe9ff',size:3,pierce:0});
    }
    if(lv>=3){
      bullets.push({x:P.x+10,y:y0-9,vx:11,vy:-1.2,dmg:7,life:40,c:'#ffe6a8',size:3,pierce:0});
      bullets.push({x:P.x+10,y:y0+9,vx:11,vy:1.2,dmg:7,life:40,c:'#ffe6a8',size:3,pierce:0});
    }
    sfx.shot();
  }
  shots++;
}
function useBomb(){
  if(state!=='play'||P.dead||P.bombs<=0)return;
  P.bombs--;sfx.bomb();cam.shake=12;
  bombs.push({x:P.x,y:P.y,t:0});
  P.inv=Math.max(P.inv,70);
  eBullets.length=0;
  var i;
  for(i=0;i<40;i++)parts.push({x:P.x,y:P.y,vx:rnd(-7,7),vy:rnd(-7,7),life:30,max:30,c:pick(['#ffffff','#5cd9ff','#ffd36e']),r:rnd(1.4,3.4)});
  hud();
}
function doRoll(){
  if(state!=='play'||P.dead||P.rollCd>0)return;
  P.rollT=16;P.rollCd=72;P.inv=Math.max(P.inv,26);
  sfx.roll();
  var i;for(i=0;i<10;i++)parts.push({x:P.x,y:P.y,vx:rnd(-2,2),vy:rnd(-2,2),life:16,max:16,c:'#9df1ff',r:rnd(1.2,2.6)});
  hud();
}
function hurtPlayer(n){
  if(state!=='play'||P.dead||P.inv>0)return;
  if(P.shield>0){P.shield=0;P.inv=70;sfx.power();popup(P.x,P.y-16,'SHIELD PECAH','#66f0b0');hud();return}
  P.hp-=n;P.inv=68;cam.shake=Math.max(cam.shake,6);sfx.hit();
  var i;for(i=0;i<12;i++)parts.push({x:P.x,y:P.y,vx:rnd(-2.4,2.4),vy:rnd(-2.4,2.4),life:18,max:18,c:'#ff5d6c',r:rnd(1.2,3)});
  if(P.hp<=0){P.hp=0;killPlayer()}
  hud();
}
function killPlayer(){
  if(P.dead)return;
  P.dead=true;P.deadT=0;sfx.dead();cam.shake=14;
  booms.push({x:P.x,y:P.y,r:0,max:40,life:24,lifeMax:24});
  var i;for(i=0;i<26;i++)parts.push({x:P.x,y:P.y,vx:rnd(-5,5),vy:rnd(-5,5),life:28,max:28,c:pick(['#ff5d6c','#ffd36e','#9df1ff']),r:rnd(1.4,3.6)});
}
function popup(x,y,txt,c){pops.push({x:x,y:y,txt:txt,c:c||'#fff',life:44,lifeMax:44})}
function banner(t,s){
  bannerEl=$('banner');if(!bannerEl)return;
  bannerEl.innerHTML=t+(s?'<small>'+s+'</small>':'');
  bannerEl.classList.add('show');bannerT=90;
}
/* ══════════ DAMAGE ══════════ */
function hurtEnemy(e,dmg,x,y){
  if(e.dead)return;
  e.hp-=dmg;e.hurt=5;hits++;
  var i;for(i=0;i<3;i++)parts.push({x:x||e.x,y:y||e.y,vx:rnd(-1.4,1.4),vy:rnd(-1.4,1.4),life:10,max:10,c:'#ffd36e',r:rnd(1,2)});
  if(e.hp<=0){
    e.dead=true;kills++;score+=e.bossKind?2000:(e.kind==='carrier'?260:(e.fixed?120:90));
    sfx.kill();
    var n=e.bossKind?38:12;
    for(i=0;i<n;i++)parts.push({x:e.x,y:e.y,vx:rnd(-4,4),vy:rnd(-4,4),life:e.bossKind?34:20,max:e.bossKind?34:20,c:pick(['#ffd36e','#ff8a3d','#9df1ff','#ff5d6c']),r:rnd(1.4,3.4)});
    booms.push({x:e.x,y:e.y,r:0,max:e.bossKind?80:28,life:e.bossKind?30:18,lifeMax:e.bossKind?30:18});
    if(e.bossKind){cam.shake=14;bossRef=null;if(bossBarEl)bossBarEl.classList.remove('show');onStageClear()}
    else dropFor(e);
    hud();
  }
}
function dropFor(e){
  var r=Math.random();
  if(e.drop)r=0;
  if(r<.18)drops.push({x:e.x,y:e.y,vx:-70,vy:0,kind:'pw',t:0});
  else if(r<.3)drops.push({x:e.x,y:e.y,vx:-70,vy:0,kind:'bom',t:0});
  else if(r<.4)drops.push({x:e.x,y:e.y,vx:-70,vy:0,kind:'hp',t:0});
  else if(r<.5)drops.push({x:e.x,y:e.y,vx:-70,vy:0,kind:'shield',t:0});
}
function grabDrop(d){
  if(d.kind==='pw'){P.pw=Math.min(4,P.pw+1);popup(P.x,P.y-16,'POWER '+P.pw,'#ffe6a8')}
  else if(d.kind==='bom'){P.bombs=Math.min(6,P.bombs+1);popup(P.x,P.y-16,'BOM +1','#ff8a3d')}
  else if(d.kind==='hp'){P.hp=Math.min(P.maxHp,P.hp+24);popup(P.x,P.y-16,'+24 ARMOR','#66f0b0')}
  else{P.shield=1;popup(P.x,P.y-16,'SHIELD','#66f0b0')}
  sfx.power();hud();
}
/* ══════════ STAGE FLOW ══════════ */
function onStageClear(){
  if(stageDone)return;
  stageDone=true;state='win';
  score+=800+Math.round(P.hp*7)+P.pw*120;
  sfx.clear();
  var stars=1;
  if(P.hp>=P.maxHp*.6)stars++;
  if(kills>=70)stars++;
  var key='m'+mission;
  cleared[key+'_s']=Math.max(cleared[key+'_s']|0,stars);
  markCleared(key);
  setTimeout(function(){if(state==='win')winScreen(stars)},800);
}
function winScreen(stars){
  var s='',i;
  for(i=0;i<3;i++)s+=i<stars?'★':'☆';
  ovShow('🏆','SEKTOR AMAN',ST.name+' bersih. '+s,
    [['SKOR',score],['BUNUH',kills],['POWER','LV '+P.pw]],
    mission<STAGES.length-1
      ? [{act:'next',label:'▶ SEKTOR BERIKUT',cls:'go'},{act:'again',label:'↻ ULANG'},{act:'menu',label:'⏹ MENU'}]
      : [{act:'again',label:'↻ MAIN LAGI',cls:'go'},{act:'menu',label:'⏹ MENU'}]);
}
/* ══════════ STEP ══════════ */
function step(){
  if(state!=='play')return;
  tick++;
  var i,j,e,b;
  if(bannerT>0){bannerT--;if(bannerT===0&&bannerEl)bannerEl.classList.remove('show')}
  if(P.inv>0)P.inv--;
  if(P.fireT>0)P.fireT--;
  if(P.rollCd>0)P.rollCd--;
  if(P.rollT>0)P.rollT--;
  if(cam.shake>0)cam.shake=Math.max(0,cam.shake-.5);

  /* ── gerak pemain (keyboard; sentuhan menggerakkan langsung) ── */
  if(P.dead){
    P.deadT++;
    if(P.deadT>80){
      lives--;
      if(lives<0){state='dead';deadScreen()}
      else{
        P.dead=false;P.hp=P.maxHp;P.inv=110;P.x=70;P.y=VH/2;P.pw=Math.max(1,P.pw-1);
        eBullets.length=0;
        banner('PESAWAT CADANGAN','POWER TURUN 1');
        hud();
      }
    }
  }else{
    var ax=0,ay=0;
    if(input.left)ax=-1;if(input.right)ax=1;
    if(input.up)ay=-1;if(input.down)ay=1;
    P.kx+= (ax*230-P.kx)*.22;
    P.ky+= (ay*230-P.ky)*.22;
    var sp=(P.rollT>0)?2.4:1;
    P.x=clamp(P.x+P.kx*FIXED*sp,16,VW-24);
    P.y=clamp(P.y+P.ky*FIXED*sp,26,VH-18);
    P.anim+=.2;
    if(P.fire){
      if(P.fireT<=0){P.fireT=P.pw>=4?9:7;fireShot()}
    }
  }
  /* ── dunia bergulir ── */
  if(!stageDone&&!bossRef)sc+=1.62*(1+(diff-1)*.15);
  /* ── jadwal musuh ── */
  if(!bossRef&&!stageDone){
    spawnCd--;
    if(spawnCd<=0&&pending.length<10){queueFormation();spawnCd=ri(120,190)}
    for(i=pending.length-1;i>=0;i--){
      pending[i].delay--;
      if(pending[i].delay<=0){
        spawnEnemy(pending[i].k,pending[i].y,0);
        pending.splice(i,1);
      }
    }
    if(sc>=ST.len){mkBoss();sc=ST.len}
  }
  /* ── peluru pemain ── */
  for(i=bullets.length-1;i>=0;i--){
    b=bullets[i];b.x+=b.vx*FIXED*60;b.y+=b.vy*FIXED*60;b.life--;
    var gone=b.life<=0||b.x>VW+30||b.y<-20||b.y>VH+20;
    if(!gone){
      for(j=0;j<enemies.length;j++){
        e=enemies[j];if(e.dead)continue;
        if(b.x>e.x-e.w/2&&b.x<e.x+e.w/2&&b.y>e.y-e.h/2&&b.y<e.y+e.h/2){
          if(b.pierce>0){if(b.hitE===e)continue;b.hitE=e;hurtEnemy(e,b.dmg,b.x,b.y);if(b.pierce--<=0)gone=true}
          else{hurtEnemy(e,b.dmg,b.x,b.y);gone=true;break}
        }
      }
    }
    if(gone)bullets.splice(i,1);
  }
  /* ── musuh ── */
  for(i=enemies.length-1;i>=0;i--){
    e=enemies[i];
    if(e.dead){enemies.splice(i,1);continue}
    if(e.hurt>0)e.hurt--;
    e.anim+=.18;
    if(e.bossKind){stepBoss(e);continue}
    if(e.cool>0){e.cool--;continue}
    if(e.fixed){
      e.atkT--;
      if(e.atkT<=0&&Math.abs(e.x-P.x)<400){
        e.atkT=ri(56,92);
        aimedShot(e,'#ffd36e',3.4,8,0);
      }
    }else if(e.kind==='scout'){
      e.x+=e.vx;
      e.atkT--;
      if(e.atkT<=0&&e.x<400&&e.x>60){e.atkT=ri(90,160);aimedShot(e,'#ff8a3d',3.4,7,0)}
    }else if(e.kind==='gunner'){
      if(e.x>VW-e.stop)e.x+=e.vx;
      else e.y+=(P.y-e.y)*.01;
      e.atkT--;
      if(e.atkT<=0){
        e.atkT=ri(70,110);
        var k;for(k=-1;k<=1;k++)aimedShot(e,'#ff5d6c',3.5,7,k*.16);
      }
    }else if(e.kind==='weaver'){
      e.x+=e.vx;
      e.ph+=.06;
      e.y=e.base+Math.sin(e.ph)*40;
      e.atkT--;
      if(e.atkT<=0){
        e.atkT=ri(80,130);
        var m;for(m=-1;m<=1;m++)eBullets.push({x:e.x-10,y:e.y,vx:-3.2,vy:m*1.1,dmg:7,life:150,color:'#c39bff',size:3.2});
      }
    }else if(e.kind==='drone'){
      var dx=P.x-e.x,dy=P.y-e.y,dl=Math.sqrt(dx*dx+dy*dy)||1;
      e.x+=clamp(dx/dl*.9,-1.4,1.4);
      e.y+=clamp(dy/dl*.9,-1.4,1.4);
      e.atkT--;
      if(e.atkT<=0&&Math.abs(e.x-P.x)<80){e.atkT=999;e.burst=18}
      if(e.burst>0){e.burst--;if(e.burst%3===0)aimedShot(e,'#ff8a3d',4,6,0);if(e.burst===0)e.atkT=ri(140,220)}
    }else if(e.kind==='carrier'){
      e.x+=e.vx;
      e.atkT--;
      if(e.atkT<=0){
        e.atkT=ri(120,180);
        var sis=ri(0,1);
        if(sis)spawnEnemy('scout',clamp(e.y-20,30,VH-40),0);
        else spawnEnemy('scout',clamp(e.y+20,30,VH-40),0);
      }
    }
    if(e.x<-40){
      enemies.splice(i,1);
      continue;
    }
    /* tabrakan badan */
    if(!e.dead&&Math.abs(e.x-P.x)<(e.w+P.w)/2&&Math.abs(e.y-P.y)<(e.h+P.h)/2){
      if(P.rollT>0||P.inv>0){}
      else{
        if(!e.fixed&&!e.bossKind){hurtEnemy(e,26,P.x,P.y)}
        hurtPlayer(12);
      }
    }
  }
  /* ── peluru musuh ── */
  for(i=eBullets.length-1;i>=0;i--){
    var eb=eBullets[i];
    eb.x+=eb.vx;eb.y+=eb.vy;eb.life--;
    if(eb.grow)eb.size+=0.02;
    if(Math.abs(eb.x-P.x)<8+eb.size&&Math.abs(eb.y-P.y)<9+eb.size){
      hurtPlayer(eb.dmg);eBullets.splice(i,1);continue;
    }
    if(eb.life<=0||eb.x<-30||eb.x>VW+30||eb.y<-30||eb.y>VH+30)eBullets.splice(i,1);
  }
  /* ── bom pemain ── */
  for(i=bombs.length-1;i>=0;i--){
    var bo=bombs[i];bo.t++;
    if(bo.t%6===0){
      for(j=0;j<enemies.length;j++){
        e=enemies[j];
        if(!e.dead&&Math.abs(e.x-P.x)<220&&Math.abs(e.y-P.y)<200)hurtEnemy(e,38,e.x,e.y);
      }
    }
    if(bo.t>26)bombs.splice(i,1);
  }
  /* ── drops ── */
  for(i=drops.length-1;i>=0;i--){
    var d=drops[i];d.t++;
    d.x+=d.vx*FIXED;d.y+=d.vy*FIXED;
    if(d.x<-30){drops.splice(i,1);continue}
    if(d.t>560){drops.splice(i,1);continue}
    if(Math.abs(d.x-P.x)<22&&Math.abs(d.y-P.y)<22){grabDrop(d);drops.splice(i,1)}
  }
  /* ── partikel/efek ── */
  for(i=booms.length-1;i>=0;i--){var bx=booms[i];bx.life--;bx.r+=(bx.max-bx.r)*.28;if(bx.life<=0)booms.splice(i,1)}
  for(i=parts.length-1;i>=0;i--){var pt=parts[i];pt.life--;pt.x+=pt.vx;pt.y+=pt.vy;pt.vx*=.96;pt.vy*=.96;if(pt.life<=0)parts.splice(i,1)}
  for(i=pops.length-1;i>=0;i--){var pp=pops[i];pp.life--;pp.x-=1.2;if(pp.life<=0)pops.splice(i,1)}
  if(tick%6===0)hud();
}
function aimedShot(e,col,size,dmg,off){
  var ang=Math.atan2(P.y-e.y,P.x-e.x)+(off||0);
  eBullets.push({x:e.x-8,y:e.y,vx:Math.cos(ang)*3.6,vy:Math.sin(ang)*3.6,dmg:dmg,life:160,color:col,size:size});
  sfx.shot();
}
/* ══════════ BOS ══════════ */
function stepBoss(e){
  if(!e.entered){
    e.x+=e.vx;
    if(e.x<=e.home){e.entered=true;e.vx=0}
    return;
  }
  e.anim2++;
  if(e.hp<e.maxHp*.55)e.phase=1;
  if(e.hp<e.maxHp*.25)e.phase=2;
  var i,k;
  if(e.bossKind==='wing'){
    e.y=clamp(e.base+Math.sin(e.anim2*.02)*70,50,VH-50);
    e.x=clamp(e.home+Math.sin(e.anim2*.013)*40,40,VW-70);
    e.atkT--;
    if(e.atkT<=0){
      e.atkT=e.phase>=1?74:96;
      for(k=-1;k<=1;k++)eBullets.push({x:e.x-24,y:e.y+k*10,vx:-3.6,vy:k*.5,dmg:8,life:160,color:'#ff8a3d',size:3.6});
      if(e.phase>=1){for(i=0;i<5;i++)eBullets.push({x:e.x-24,y:e.y-30+i*14,vx:-3.2,vy:0,dmg:8,life:170,color:'#ff5d6c',size:3.4})}
    }
    e.atkT2--;
    if(e.atkT2<=0){e.atkT2=e.phase>=2?200:320;spawnEnemy('scout',clamp(e.y-30,30,VH-40),0);spawnEnemy('scout',clamp(e.y+30,30,VH-40),0)}
  }else if(e.bossKind==='core'){
    e.y=clamp(e.base+Math.sin(e.anim2*.016)*64,56,VH-56);
    e.x=clamp(e.home+Math.sin(e.anim2*.01)*30,60,VW-70);
    e.atkT--;
    if(e.atkT<=0){
      e.atkT=e.phase>=1?66:88;
      var n=8+(e.phase*3),base=e.anim2*.03;
      for(i=0;i<n;i++){
        var a=base+i*(Math.PI*2/n);
        eBullets.push({x:e.x+Math.cos(a)*18,y:e.y+Math.sin(a)*18,vx:Math.cos(a)*3.1,vy:Math.sin(a)*3.1,dmg:8,life:170,color:'#66f0b0',size:3.2});
      }
    }
  }else if(e.bossKind==='fortress'){
    e.y=clamp(VH/2+Math.sin(e.anim2*.012)*40,90,VH-90);
    e.x=clamp(e.home,60,VW-70);
    e.atkT--;
    if(e.atkT<=0){
      e.atkT=e.phase>=1?52:70;
      var ty=(e.anim2*2)%(VH-80)+40;
      for(i=0;i<4;i++)eBullets.push({x:e.x-40,y:ty+i*20-30,vx:-4,vy:0,dmg:9,life:170,color:'#ffd36e',size:4});
      aimedShot(e,'#ff5d6c',3.6,8,0);
    }
    e.atkT2--;
    if(e.atkT2<=0){
      e.atkT2=e.phase>=2?170:260;
      for(i=0;i<7;i++)eBullets.push({x:e.x-40,y:VH/2-60+i*20,vx:-3.4,vy:(i-3)*.22,dmg:8,life:180,color:'#ff8a3d',size:3.6});
    }
  }else if(e.bossKind==='hive'){
    e.y=clamp(e.base+Math.sin(e.anim2*.02)*54,50,VH-50);
    e.x=clamp(e.home+Math.sin(e.anim2*.011)*36,60,VW-70);
    e.atkT--;
    if(e.atkT<=0){
      e.atkT=e.phase>=1?70:94;
      var ol=Math.atan2(P.y-e.y,P.x-e.x);
      for(i=-2;i<=2;i++)        eBullets.push({x:e.x-20,y:e.y,vx:Math.cos(ol+i*.16)*3.6,vy:Math.sin(ol+i*.16)*3.6,dmg:8,life:170,color:'#c39bff',size:3.4});
    }
    e.atkT2--;
    if(e.atkT2<=0){e.atkT2=e.phase>=2?220:340;spawnEnemy('drone',clamp(e.y,40,VH-50),0)}
  }else{
    /* omega */
    if(e.dash>0){
      e.dash--;e.x-=3.4;
      if(e.x<90){e.dash=0}
    }else{
      e.y=clamp(e.base+Math.sin(e.anim2*.018)*70,54,VH-54);
      e.x=clamp(e.home+Math.sin(e.anim2*.009)*46,70,VW-70);
    }
    e.atkT--;
    if(e.atkT<=0){
      e.atkT=e.phase>=2?54:76;
      var md=e.phase>=1?2:1;
      for(i=0;i<6;i++){
        var aa=(e.anim2*.04)+i*(Math.PI/3);
        eBullets.push({x:e.x+Math.cos(aa)*20,y:e.y+Math.sin(aa)*20,vx:Math.cos(aa)*3.2,vy:Math.sin(aa)*3.2,dmg:9,life:180,color:'#ff5d6c',size:3.6,grow:1});
      }
      for(i=-md;i<=md;i++)eBullets.push({x:e.x-34,y:e.y,vx:-4.2,vy:i*.5,dmg:9,life:170,color:'#ffd36e',size:4});
    }
    e.atkT2--;
    if(e.atkT2<=0){e.atkT2=ri(180,300);e.dash=70}
  }
}
/* ══════════ GAMBAR ══════════ */
function drawBG(){
  var p=ST.pal,g=ctx.createLinearGradient(0,0,0,VH);
  g.addColorStop(0,p.sky[0]);g.addColorStop(.5,p.sky[1]);g.addColorStop(1,p.sky[2]);
  ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
  var i,x,y,off;
  if(mission===3){
    /* antariksa */
    ctx.fillStyle='#ffffff';
    for(i=0;i<70;i++){
      x=((i*71-(sc*1.4))%(VW+40)+VW+40)%(VW+40)-20;
      y=(i*53)%VH;
      var tw=(i%7===0)?1:0.55;
      ctx.globalAlpha=tw;ctx.fillRect(x,y,1.4,1.4);
    }
    ctx.globalAlpha=1;
    ctx.fillStyle='#3a1c6e';ctx.beginPath();ctx.arc(120-(sc*.04)%260,VH*.72,58,0,6.283);ctx.fill();
    ctx.fillStyle='#58289a';ctx.beginPath();ctx.arc(140-(sc*.04)%260,VH*.68,40,0,6.283);ctx.fill();
  }else{
    /* awan bergaris */
    for(i=0;i<6;i++){
      off=((i*160+sc*.25)%(VW+320))-160;
      ctx.globalAlpha=.16+ (i%3)*.05;
      ctx.fillStyle='#ffffff';
      rr(ctx,VW-off,40+i*38,120+i*20,16,8);ctx.fill();
      rr(ctx,VW-off+50,52+i*38,90,12,6);ctx.fill();
    }
    ctx.globalAlpha=1;
  }
  /* permukaan bergulir (atas & bawah) */
  ctx.fillStyle=p.ground;ctx.fillRect(0,0,VW,20);ctx.fillRect(0,VH-14,VW,14);
  ctx.fillStyle=p.detail;
  for(i=0;i<14;i++){
    x=((i*44-(sc*.9))%(VW+44)+VW+44)%(VW+44)-44;
    ctx.fillRect(x,4,26,6);
    ctx.fillRect(x+12,VH-10,20,5);
  }
  ctx.fillStyle=p.accent;ctx.globalAlpha=.5;
  for(i=0;i<8;i++){
    x=((i*74-(sc*1.6))%(VW+74)+VW+74)%(VW+74)-74;
    ctx.fillRect(x,2,3,3);ctx.fillRect(x+30,VH-6,3,3);
  }
  ctx.globalAlpha=1;
}
function drawPlayer(){
  if(P.dead)return;
  var x=P.x,y=P.y,t=P.rollT>0;
  if(P.inv>0&&!t&&(tick>>1)%2===0)ctx.globalAlpha=.45;
  ctx.save();
  ctx.translate(x,y);
  if(t)ctx.rotate(P.anim*1.4);
  /* badan */
  ctx.fillStyle='#dbeaff';
  ctx.beginPath();ctx.moveTo(20,0);ctx.lineTo(-6,-11);ctx.lineTo(-14,-4);ctx.lineTo(-14,4);ctx.lineTo(-6,11);ctx.closePath();ctx.fill();
  ctx.fillStyle='#3f7aff';
  ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(-8,-7);ctx.lineTo(-8,7);ctx.closePath();ctx.fill();
  ctx.fillStyle='#5cd9ff';
  ctx.beginPath();ctx.moveTo(-4,-13);ctx.lineTo(-16,-19);ctx.lineTo(-10,-6);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(-4,13);ctx.lineTo(-16,19);ctx.lineTo(-10,6);ctx.closePath();ctx.fill();
  ctx.fillStyle='#9df1ff';ctx.fillRect(2,-2,7,4);
  /* semburan mesin */
  var fl=6+Math.abs(Math.sin(tick*.4))*7;
  ctx.fillStyle='rgba(157,241,255,.85)';
  ctx.beginPath();ctx.moveTo(-14,-4);ctx.lineTo(-14-fl,0);ctx.lineTo(-14,4);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,211,110,.7)';
  ctx.beginPath();ctx.moveTo(-14,-2);ctx.lineTo(-14-fl*.6,0);ctx.lineTo(-14,2);ctx.closePath();ctx.fill();
  ctx.restore();
  ctx.globalAlpha=1;
  if(P.shield>0){
    ctx.strokeStyle='rgba(102,240,176,.75)';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(x,y,22+Math.sin(tick*.2)*2,0,6.283);ctx.stroke();
    ctx.strokeStyle='rgba(102,240,176,.25)';ctx.lineWidth=6;ctx.stroke();
  }
  if(P.inv>0&&!t){
    ctx.strokeStyle='rgba(157,241,255,.55)';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(x,y,26,0,6.283);ctx.stroke();
  }
}
function drawEnemies(){
  var i;
  for(i=0;i<enemies.length;i++){
    var e=enemies[i];
    if(e.dead)continue;
    if(e.x<-60||e.x>VW+90)continue;
    if(e.hurt>0)ctx.globalAlpha=.7;
    var x=e.x,y=e.y;
    if(e.bossKind){
      var p=ST.pal;
      ctx.fillStyle='#1a1130';
      rr(ctx,x-e.w/2,y-e.h/2,e.w,e.h,10);ctx.fill();
      ctx.strokeStyle=p.accent;ctx.lineWidth=2.4;ctx.stroke();
      ctx.fillStyle=p.accent;
      ctx.beginPath();ctx.moveTo(x-e.w/2,y-e.h/2+14);ctx.lineTo(x-e.w/2-16,y-e.h/2+4);ctx.lineTo(x-e.w/2-16,y-e.h/2+26);ctx.closePath();ctx.fill();
      ctx.fillStyle='#ff9cf0';
      ctx.beginPath();ctx.arc(x-6,y,11,0,6.283);ctx.fill();
      ctx.fillStyle='#ffe6a8';ctx.beginPath();ctx.arc(x-6,y,5,0,6.283);ctx.fill();
      ctx.fillStyle=p.accent;
      ctx.fillRect(x+e.w/2-14,y-18,8,8);ctx.fillRect(x+e.w/2-14,y+10,8,8);
    }else if(e.kind==='scout'){
      ctx.fillStyle='#2b2f52';
      ctx.beginPath();ctx.moveTo(x-12,y);ctx.lineTo(x+10,y-7);ctx.lineTo(x+12,y);ctx.lineTo(x+10,y+7);ctx.closePath();ctx.fill();
      ctx.fillStyle='#ff8a3d';ctx.fillRect(x-2,y-2,7,4);
    }else if(e.kind==='gunner'){
      ctx.fillStyle='#3a2438';rr(ctx,x-12,y-10,24,20,5);ctx.fill();
      ctx.strokeStyle='#ff5d6c';ctx.lineWidth=1.6;ctx.stroke();
      ctx.fillStyle='#ff5d6c';ctx.fillRect(x-14,y-3,6,6);
      ctx.fillStyle='#ffe6a8';ctx.fillRect(x+2,y-4,5,8);
    }else if(e.kind==='weaver'){
      ctx.fillStyle='#33255c';
      ctx.beginPath();ctx.moveTo(x-13,y);ctx.lineTo(x,y-9);ctx.lineTo(x+13,y);ctx.lineTo(x,y+9);ctx.closePath();ctx.fill();
      ctx.fillStyle='#c39bff';ctx.fillRect(x-3,y-3,6,6);
    }else if(e.kind==='drone'){
      ctx.fillStyle='#2a1830';ctx.beginPath();ctx.arc(x,y,11,0,6.283);ctx.fill();
      ctx.strokeStyle='#ff8a3d';ctx.lineWidth=1.8;ctx.stroke();
      ctx.fillStyle='#ff8a3d';ctx.beginPath();ctx.arc(x,y,4,0,6.283);ctx.fill();
      ctx.fillStyle='rgba(255,138,61,.4)';ctx.fillRect(x-13,y-13,26,2);
    }else if(e.kind==='turret'){
      ctx.fillStyle='#1e2340';rr(ctx,x-13,y-11,26,22,4);ctx.fill();
      ctx.fillStyle='#ffd36e';ctx.beginPath();ctx.arc(x,y,6,0,6.283);ctx.fill();
      ctx.fillStyle='#0a0d1c';ctx.beginPath();ctx.arc(x,y,2.6,0,6.283);ctx.fill();
    }else{
      /* carrier */
      ctx.fillStyle='#241a3c';rr(ctx,x-22,y-15,44,30,7);ctx.fill();
      ctx.strokeStyle='#c39bff';ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle='#c39bff';rr(ctx,x-14,y-6,28,12,4);ctx.fill();
      ctx.fillStyle='#ffe6a8';ctx.fillRect(x-22,y-2,6,4);ctx.fillRect(x+16,y-2,6,4);
      ctx.fillStyle='rgba(195,155,255,.28)';rr(ctx,x-30,y-8,10,16,4);ctx.fill();
    }
    ctx.globalAlpha=1;
    if(!e.bossKind&&e.hp<40&&e.hp>0){
      var mxe=e.kind==='turret'?48:(e.kind==='carrier'?95:(e.kind==='drone'?34:28));
      ctx.fillStyle='#000a';ctx.fillRect(x-12,y-e.h/2-7,24,3);
      ctx.fillStyle='#ff8a3d';ctx.fillRect(x-12,y-e.h/2-7,24*clamp(e.hp/mxe,0,1),3);
    }
  }
}
function drawShots(){
  var i;
  for(i=0;i<bullets.length;i++){
    var b=bullets[i];
    if(b.laser){
      ctx.globalAlpha=.9;ctx.fillStyle='#9df1ff';ctx.fillRect(b.x-14,b.y-2.4,20,4.8);
      ctx.globalAlpha=.35;ctx.fillStyle='#ffffff';ctx.fillRect(b.x-10,b.y-1,14,2);
      ctx.globalAlpha=1;
    }else{
      ctx.fillStyle=b.c;
      rr(ctx,b.x-b.size/2,b.y-b.size/2,b.size,b.size,b.size/2);ctx.fill();
      ctx.globalAlpha=.3;ctx.fillRect(b.x-b.size-6,b.y-.8,b.size+6,1.6);ctx.globalAlpha=1;
    }
  }
  for(i=0;i<eBullets.length;i++){
    var eb=eBullets[i];
    ctx.fillStyle=eb.color;
    ctx.beginPath();ctx.arc(eb.x,eb.y,eb.size,0,6.283);ctx.fill();
    ctx.globalAlpha=.3;
    ctx.beginPath();ctx.arc(eb.x,eb.y,eb.size+2.6,0,6.283);ctx.fill();
    ctx.globalAlpha=1;
  }
  for(i=0;i<bombs.length;i++){
    var bo=bombs[i],t=bo.t/26;
    ctx.globalAlpha=(1-t)*.8;
    ctx.strokeStyle='#9df1ff';ctx.lineWidth=4;
    ctx.beginPath();ctx.arc(P.x,P.y,60+t*260,0,6.283);ctx.stroke();
    ctx.globalAlpha=(1-t)*.4;ctx.strokeStyle='#ffd36e';ctx.lineWidth=10;ctx.stroke();
    ctx.globalAlpha=1;
  }
}
function drawDrops(){
  var i;
  for(i=0;i<drops.length;i++){
    var d=drops[i];
    var col=d.kind==='pw'?'#ffe6a8':(d.kind==='bom'?'#ff8a3d':(d.kind==='hp'?'#66f0b0':'#9df1ff'));
    ctx.save();ctx.translate(d.x,d.y);ctx.rotate(Math.sin(tick*.09+i)*.25);
    ctx.globalAlpha=.3;ctx.fillStyle=col;rr(ctx,-11,-11,22,22,6);ctx.fill();
    ctx.globalAlpha=1;ctx.fillStyle='#08101f';rr(ctx,-8,-8,16,16,4);ctx.fill();
    ctx.strokeStyle=col;ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=col;ctx.font='900 9px system-ui';ctx.textAlign='center';
    ctx.fillText(d.kind==='pw'?'P':d.kind==='bom'?'B':d.kind==='hp'?'+':'S',0,3.4);
    ctx.textAlign='left';ctx.restore();
  }
  ctx.globalAlpha=1;
}
function drawFX(){
  var i;
  for(i=0;i<booms.length;i++){
    var b=booms[i],t=b.life/b.lifeMax;
    ctx.globalAlpha=t*.85;
    var g=ctx.createRadialGradient(b.x,b.y,2,b.x,b.y,b.r);
    g.addColorStop(0,'#ffffff');g.addColorStop(.42,'#ffd36e');g.addColorStop(1,'rgba(255,90,60,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,6.283);ctx.fill();
    ctx.globalAlpha=1;
  }
  for(i=0;i<parts.length;i++){
    var p=parts[i];
    ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillStyle=p.c;
    ctx.fillRect(p.x,p.y,p.r,p.r);
  }
  ctx.globalAlpha=1;
  for(i=0;i<pops.length;i++){
    var pp=pops[i];
    ctx.globalAlpha=clamp(pp.life/pp.lifeMax,0,1);
    ctx.font='900 8px system-ui';ctx.fillStyle=pp.c;ctx.textAlign='center';
    ctx.fillText(pp.txt,pp.x,pp.y);
    ctx.textAlign='left';ctx.globalAlpha=1;
  }
}
function draw(){
  ctx.save();
  var sh=cam.shake;
  if(sh)ctx.translate(rnd(-sh,sh),rnd(-sh,sh));
  drawBG();
  drawDrops();
  drawEnemies();
  drawPlayer();
  drawShots();
  drawFX();
  ctx.restore();
  var g=ctx.createRadialGradient(VW/2,VH/2,VH*.36,VW/2,VH/2,VW*.74);
  g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.5)');
  ctx.fillStyle=g;ctx.fillRect(0,0,VW,VH);
}
/* ══════════ HUD / OVERLAY ══════════ */
var bossBarEl=null;
function hud(){
  if(!bossBarEl)bossBarEl=$('bossBar');
  var f=$('hpFill');
  f.style.width=clamp(P.hp/P.maxHp*100,0,100)+'%';
  var bar=$('hpBar');
  bar.className='hpBar'+(P.hp/P.maxHp<.3?' crit':(P.hp/P.maxHp<.6?' low':''));
  $('hpTxt').textContent=Math.round(P.hp);
  $('score').textContent=score;
  $('lives').textContent=Math.max(0,lives);
  $('pw').textContent=P.pw>=4?'LASER':'LV '+P.pw;
  $('sh').textContent=P.shield>0?'AKTIF':'—';
  $('bom').textContent=P.bombs;
  var r=$('rollTxt');
  if(P.rollCd>0){r.textContent=Math.round(P.rollCd/60*10)/10+'s';r.className='wait'}
  else{r.textContent='SIAP';r.className='ready'}
  $('progFill').style.width=clamp(sc/ST.len*100,0,100)+'%';
  if(bossRef)$('bossFill').style.width=clamp(bossRef.hp/bossRef.maxHp*100,0,100)+'%';
}
function ovShow(icon,title,text,stats,btns){
  $('ovIcon').textContent=icon;$('ovTitle').textContent=title;$('ovText').innerHTML=text;
  var s='',i;
  if(stats)for(i=0;i<stats.length;i++)s+='<div><b>'+stats[i][1]+'</b><span>'+stats[i][0]+'</span></div>';
  $('ovStats').innerHTML=s;
  var h='<div class="row3">',n=0;
  (btns||[]).forEach(function(b){
    if(b.act==='next'||b.act==='again'||b.act==='start')h+='</div><div class="row3">';
    h+='<button class="sbtn '+(b.cls||'')+'" type="button" data-act="'+b.act+'">'+b.label+'</button>';
  });
  h+='</div>';
  $('ovBtns').innerHTML=h;
  $('ov').classList.remove('hide');
}
function ovHide(){$('ov').classList.add('hide')}
function menu(){
  state='menu';
  var i,btns=[];
  for(i=0;i<STAGES.length;i++){
    var ok=i===0||cleared['m'+(i-1)];
    var st=cleared['m'+i+'_s']|0,s='';
    var k;for(k=0;k<3;k++)s+=k<st?'★':'☆';
    btns.push({act:'lv'+(ok?i:'x'),label:(ok?'':'🔒 ')+'S'+(i+1)+' '+s});
  }
  ovShow('🛩️','SKY RAIDERS','Pesawatmu menembak otomatis. <b>Geser jari di layar</b> untuk terbang, <b>↯ ROLL</b> bikin kebal sekejap, <b>💥 BOM</b> membersihkan peluru di layar.<br>Ambil <b>P</b> untuk naik power sampai LASER.',
    [['SKOR',score],['SEKTOR',STAGES.length],['POWER','LV '+P.pw]],
    btns.concat([{act:'start',label:'▶ MULAI SEKTOR '+(mission+1),cls:'go'},{act:'help',label:'❔ CARA MAIN'}]));
}
function helpScreen(){
  ovShow('📖','CARA MAIN',
    '<b>TOMBOL ARAH</b> (kiri bawah) — <b>◀ ▶ ▲ ▼</b> untuk terbang; bisa ditekan dua sekaligus untuk menyerong.<br>'+ 
    'Bisa juga <b>GESER DI LAYAR</b> — pesawat mengikuti gerakan jarimu (jari tidak menutupi pesawat, jadi bisa menghindar lebih presisi).<br>'+
    '<b>🔥 TEMBAK</b> — otomatis. Tinggal fokus menghindar.<br>'+
    '<b>↯ ROLL</b> — berputar cepat & <b>kebal</b> ± 0,27 dtk. Tembus peluru maupun badan musuh.<br>'+
    '<b>💥 BOM</b> — melukai semua yang di layar & <b>menghapus semua peluru musuh</b>.<br><br>'+
    'Power-up: <b>P</b> naik tingkat senjata (1→2→3→LASER) · <b>B</b> tambah bom · <b>+</b> pulihkan armor · <b>S</b> perisai satu lapis.<br>'+
    'Armor habis = pesawat hilang. Punya 3 pesawat cadangan; tiap kali gugur, power turun 1 tingkat.<br><br>'+
    'Bos muncul di ujung tiap sektor (bar di atas layar). Kalahkan untuk membuka sektor berikutnya.',
    null,[{act:'back',label:'◀ KEMBALI'}]);
}
function deadScreen(){
  ovShow('💥','MISI GAGAL','Semua pesawat habis di '+ST.name+'.',
    [['SKOR',score],['BUNUH',kills],['SEKTOR',mission+1]],
    [{act:'again',label:'↻ COBA LAGI',cls:'go'},{act:'menu',label:'⏹ MENU'}]);
}
function pause(){
  if(state!=='play')return;
  state='pause';
  ovShow('⏸','JEDA','Sektor '+(mission+1)+' — '+ST.name+' ditunda.',
    [['SKOR',score],['BUNUH',kills],['ARMOR',Math.round(P.hp)]],
    [{act:'resume',label:'▶ LANJUT',cls:'go'},{act:'restart',label:'↻ ULANG',cls:''},{act:'menu',label:'⏹ MENU'}]);
}
function resumeState(){if(state!=='pause')return;state='play';ovHide()}
function start(){
  lives=3;kills=0;shots=0;hits=0;
  buildStage(mission);
  state='play';ovHide();
  banner('SEKTOR '+(mission+1)+' — '+ST.name,ST.sub);
  last=performance.now();acc=0;
  hud();
}
/* ══════════ INPUT ══════════ */
/* gesture eksklusif: selama jari menggeser di area permainan, halaman/chat tidak boleh
   ikut tergulir. Kunci hanya hidup selama jari menempel, lalu dicabut lagi. */
var dragDocLock=null;
function dragClaim(e){
  if(e.cancelable&&!e.defaultPrevented)e.preventDefault();
  if(e.stopPropagation)e.stopPropagation();
}
function dragLockPage(on){
  if(on){
    if(dragDocLock)return;
    dragDocLock=function(e){if(e.cancelable)e.preventDefault()};
    D.addEventListener('touchmove',dragDocLock,{passive:false});
  }else if(dragDocLock){D.removeEventListener('touchmove',dragDocLock,{passive:false});dragDocLock=null}
}
function bindTouchDrag(){
  var st=$('stage');if(!st)return;
  var pid=null,lx=0,ly=0,kx=0,ky=0;
  function scale(){var r=cv.getBoundingClientRect();return (r.width||VW)/VW}
  st.addEventListener('pointerdown',function(e){
    if(e.button)return;
    dragClaim(e);ensureAC();
    if(pid!==null)return;
    pid=e.pointerId;lx=e.clientX;ly=e.clientY;kx=ky=0;
    try{st.setPointerCapture(e.pointerId)}catch(err){}
    dragLockPage(true);
  },{passive:false});
  st.addEventListener('pointermove',function(e){
    if(pid===null||e.pointerId!==pid)return;
    dragClaim(e);
    var s=scale();
    var dx=(e.clientX-lx)/s,dy=(e.clientY-ly)/s;
    lx=e.clientX;ly=e.clientY;
    if(state==='play'&&!P.dead){
      P.x=clamp(P.x+dx*1.35,16,VW-24);
      P.y=clamp(P.y+dy*1.35,26,VH-18);
    }
  },{passive:false});
  function up(e){
    if(pid===null)return;
    if(e&&e.pointerId!==undefined&&e.pointerId!==pid)return;
    try{st.releasePointerCapture(pid)}catch(err){}
    pid=null;dragLockPage(false);
  }
  st.addEventListener('pointerup',up);st.addEventListener('pointercancel',up);
  D.addEventListener('pointerup',up);D.addEventListener('pointercancel',up);
  /* jaring pengaman untuk WebView yang belum paham touch-action — hanya di area permainan */
  st.addEventListener('touchmove',function(e){dragClaim(e)},{passive:false});
  D.addEventListener('visibilitychange',function(){if(D.hidden){pid=null;dragLockPage(false)}});
  if(window.addEventListener)window.addEventListener('blur',function(){pid=null;dragLockPage(false)});
  st.addEventListener('contextmenu',function(e){e.preventDefault()});
}
function bindHold(el,on,off,opt){
  if(!el)return;
  var pid=null,rep=0,every=(opt&&opt.every)||70,offFn=(typeof off==='function')?off:function(){};
  function tick(){
    if(pid===null)return;
    on();
    if(pid===null)return;
    rep=setTimeout(tick,every);
  }
  function press(e){
    if(pid!==null)return;
    e.preventDefault();ensureAC();
    pid=e.pointerId;
    try{el.setPointerCapture(e.pointerId)}catch(err){}
    el.classList.add('active');
    on();
    if(opt&&opt.repeat)rep=setTimeout(tick,every);
  }
  function release(e){
    if(pid===null)return;
    if(e&&e.pointerId!==undefined&&e.pointerId!==pid)return;
    pid=null;
    if(rep){clearTimeout(rep);rep=0}
    el.classList.remove('active');
    offFn();
  }
  el.addEventListener('pointerdown',press,{passive:false});
  el.addEventListener('pointerup',release);
  el.addEventListener('pointercancel',release);
  D.addEventListener('pointerup',release);
  D.addEventListener('pointercancel',release);
  el.addEventListener('contextmenu',function(e){e.preventDefault()});
}
/* ── TOMBOL ARAH (D-PAD) ── ◀ ▶ ▲ ▼ terbang ke empat arah.
   Ditangani sejak jari MENYENTUH (bukan saat dilepas) supaya menu tekan-lama WhatsApp
   tidak sempat muncul. Tiap tombol menjaga pointerId-nya sendiri, jadi bisa ditekan
   bersamaan (jalan + lompat) tanpa saling mengunci. */
var STICK_DEAD=0.22;   /* ambang gerak minimum yang dibaca mesin fisika */
var dirDocLock=null,dirHeldN=0;
function dirSync(){}   /* pesawat: kiri/kanan & atas/bawah dibaca langsung mesin fisika */
/* ambil alih gesture: jangan sampai diteruskan ke halaman/chat */
function stickClaim(e){
  if(e.cancelable&&!e.defaultPrevented)e.preventDefault();
  if(e.stopPropagation)e.stopPropagation();
}
/* Selama tombol arah dipegang, SEMUA geser jari dikunci supaya halaman/chat WhatsApp
   tidak ikut tergulir (termasuk jari kedua di luar tombol). Kunci DICABUT saat semua
   tombol dilepas — tidak ada preventDefault permanen di document, scroll normal hidup. */
function dirLock(on){
  dirHeldN+=on?1:-1;if(dirHeldN<0)dirHeldN=0;
  if(dirHeldN>0&&!dirDocLock){
    dirDocLock=function(e){if(e.cancelable)e.preventDefault()};
    D.addEventListener('touchmove',dirDocLock,{passive:false});
  }else if(dirHeldN===0&&dirDocLock){
    D.removeEventListener('touchmove',dirDocLock,{passive:false});dirDocLock=null;
  }
}
function padReset(){
  input.ax=0;input.left=false;input.right=false;input.down=false;
  dirHeldN=0;
  if(dirDocLock){D.removeEventListener('touchmove',dirDocLock,{passive:false});dirDocLock=null}
  var ids=['bLeft','bRight','bUp','bDown'],i,el;
  for(i=0;i<ids.length;i++){el=$(ids[i]);if(el)el.classList.remove('active')}
}
/* satu tombol: pointerdown = tekan (sejak jari menyentuh), pointerup = lepas.
   pointerId dijaga per tombol supaya bisa ditekan bersamaan. */
function padHold(id,on,off){
  var el=$(id);if(!el)return;
  var pid=null;
  function press(e){
    if(e.button)return;                       /* klik kanan/tengah diabaikan */
    stickClaim(e);ensureAC();                 /* gesture ini milik tombol */
    if(pid!==null)return;                     /* tombol ini sudah dipegang jari lain */
    pid=e.pointerId;
    try{el.setPointerCapture(e.pointerId)}catch(err){}
    el.classList.add('active');
    dirLock(true);
    if(on)on();
  }
  function rel(e){
    if(pid===null)return;
    if(e&&e.pointerId!==undefined&&e.pointerId!==pid)return;
    try{el.releasePointerCapture(pid)}catch(err){}
    pid=null;el.classList.remove('active');
    dirLock(false);
    if(off)off();
  }
  el.addEventListener('pointerdown',press,{passive:false});
  el.addEventListener('pointerup',rel);el.addEventListener('pointercancel',rel);
  D.addEventListener('pointerup',rel);D.addEventListener('pointercancel',rel);
  /* jaring pengaman WebView lama: geser di tombol arah tidak menggulir halaman */
  el.addEventListener('touchmove',function(e){if(e.cancelable)e.preventDefault()},{passive:false});
  el.addEventListener('contextmenu',function(e){e.preventDefault()});
}
function mountDpad(){
  var pad=$('movePad');if(!pad)return;
  padHold('bLeft',function(){input.left=true;dirSync()},function(){input.left=false;dirSync()});
  padHold('bRight',function(){input.right=true;dirSync()},function(){input.right=false;dirSync()});
  pad.addEventListener('touchmove',function(e){stickClaim(e)},{passive:false});
  /* aplikasi pindah / jari hilang: tombol tidak boleh tertinggal menekan */
  D.addEventListener('visibilitychange',function(){if(D.hidden)padReset()});
  if(window.addEventListener)window.addEventListener('blur',function(){padReset()});
}
function bindInput(){
  mountDpad();
  padHold('bUp',function(){input.up=true},function(){input.up=false});
  padHold('bDown',function(){input.down=true},function(){input.down=false});
  bindTouchDrag();
  bindHold($('bBom'),function(){useBomb()},{},{});
  bindHold($('bRoll'),function(){doRoll()},{},{});
  var fb=$('bFire');
  if(fb){
    fb.addEventListener('click',function(){
      P.fire=!P.fire;
      fb.textContent=P.fire?'🔥 TEMBAK (OTOMATIS: AKTIF)':'🔥 TEMBAK (MATI)';
      ensureAC();sfx.click();
    });
  }
  $('ov').addEventListener('click',function(e){
    var b=e.target&&e.target.closest?e.target.closest('[data-act]'):null;
    if(!b)return;
    var a=b.getAttribute('data-act');
    ensureAC();sfx.click();
    if(a==='start'||a==='restart'||a==='again')start();
    else if(a==='next'){mission=Math.min(STAGES.length-1,mission+1);start()}
    else if(a==='help')helpScreen();
    else if(a==='menu'||a==='back')menu();
    else if(a==='resume')resumeState();
    else if(a.indexOf('lv')===0){var n=parseInt(a.slice(2),10);if(!isNaN(n)){mission=n;start()}}
  });
  var mb=$('muteB');
  if(mb)mb.addEventListener('click',function(){
    muted=!muted;
    if(master)master.gain.value=muted?0:0.5;
    mb.textContent=muted?'🔇':'🔊';
  });
  var pb=$('pauseB');
  if(pb)pb.addEventListener('click',function(){
    ensureAC();
    if(state==='play')pause();
    else if(state==='pause')resumeState();
  });
  D.addEventListener('keydown',function(e){
    ensureAC();
    var k=(e.key||'').toLowerCase();
    if(k==='arrowleft'||k==='a'){input.left=true;e.preventDefault()}
    else if(k==='arrowright'||k==='d'){input.right=true;e.preventDefault()}
    else if(k==='arrowup'||k==='w'){input.up=true;e.preventDefault()}
    else if(k==='arrowdown'||k==='s'){input.down=true;e.preventDefault()}
    else if(k===' '){if(!e.repeat)useBomb();e.preventDefault()}
    else if(k==='shift'||k==='j'){if(!e.repeat)doRoll()}
    else if(k==='p'){if(state==='play')pause();else if(state==='pause')resumeState()}
    else if(k==='f'){if(fb)fb.click()}
    else if(k==='m'){if(mb)mb.click()}
    else if(k==='enter'){if(state==='menu'||state==='dead'||state==='win')start()}
  },{passive:false});
  D.addEventListener('keyup',function(e){
    var k=(e.key||'').toLowerCase();
    if(k==='arrowleft'||k==='a')input.left=false;
    else if(k==='arrowright'||k==='d')input.right=false;
    else if(k==='arrowup'||k==='w')input.up=false;
    else if(k==='arrowdown'||k==='s')input.down=false;
  });
  D.addEventListener('visibilitychange',function(){if(D.hidden&&state==='play')pause()});
  if(window.addEventListener)window.addEventListener('resize',function(){fit()});
}
/* ══════════ LOOP ══════════ */
function loop(now){
  var dt;
  if(!last)last=now;
  dt=now-last;last=now;
  if(dt>120)dt=120;
  acc+=dt;
  var guard=0;
  while(acc>=FIXED*1000&&guard<5){step();acc-=FIXED*1000;guard++}
  if(guard>=5)acc=0;
  draw();
  requestAnimationFrame(loop);
}
/* ══════════ BOOT ══════════ */
fit();bossBarEl=$('bossBar');bannerEl=$('banner');buildStage(0);bindInput();hud();menu();
if(D.readyState==='complete'||D.readyState==='interactive')setTimeout(fit,60);else D.addEventListener('DOMContentLoaded',function(){fit()});
if(window.setTimeout)setTimeout(function(){fit();draw()},260);
requestAnimationFrame(loop);

if(typeof window!=='undefined'){
  window.__SR={
    get s(){return{state:state,tick:tick,hp:Math.round(P.hp),lives:lives,score:score,kills:kills,shots:shots,hits:hits,
      x:Math.round(P.x*10)/10,y:Math.round(P.y*10)/10,inv:P.inv,pw:P.pw,shield:P.shield,bombs:P.bombs,rollCd:P.rollCd,dead:P.dead,fire:P.fire,
      enemies:enemies.length,alive:(function(){var n=0,i;for(i=0;i<enemies.length;i++)if(!enemies[i].dead)n++;return n})(),
      bullets:bullets.length,eBullets:eBullets.length,drops:drops.length,scroll:Math.round(sc),len:ST.len,
      boss:bossRef?{hp:Math.round(bossRef.hp),maxHp:bossRef.maxHp,kind:bossRef.bossKind,name:bossRef.name,x:Math.round(bossRef.x),y:Math.round(bossRef.y)}:null,
      mission:mission,missionName:ST.name,cleared:cleared}},
    player:P,input:input,get enemies(){return enemies},get bullets(){return bullets},get eBullets(){return eBullets},get drops(){return drops},get pending(){return pending},
    dir:function(l,r){input.left=!!l;input.right=!!r},
    get dirs(){return{l:!!input.left,r:!!input.right,u:!!input.up,d:!!input.down,held:dirHeldN>0}},
    step:function(n){n=n||1;for(var i=0;i<n;i++)step()},
    draw:draw,start:start,fire:fireShot,bomb:useBomb,roll:doRoll,pause:pause,resume:resumeState,boss:mkBoss,
    spawn:function(k,y){return spawnEnemy(k,y===undefined?VH/2:y,0)},
    spawnWave:function(){queueFormation();var i;for(i=0;i<pending.length;i++)pending[i].delay=0},
    setMission:function(m){mission=clamp(m,0,STAGES.length-1)},
    setPower:function(l){P.pw=clamp(l,1,4);hud()},
    teleport:function(x,y){P.x=clamp(x,16,VW-24);if(y!==undefined)P.y=clamp(y,26,VH-18)},
    hurt:function(n){hurtPlayer(n)},forceFire:function(){P.fireT=0;fireShot()},
    skipScroll:function(d){sc+=d||0},clearEnemies:function(){enemies.length=0},eBulletsClear:function(){eBullets.length=0}
  };
}
})();
</script>
<script>
/* usanagi-tap-fast: tombol balas SEKETIKA saat jari menyentuh, bukan saat jari diangkat —
   supaya ambang tekan-lama WhatsApp (~0,5 dtk) tidak pernah tercapai sehingga menu
   "Hapus/Teruskan" tidak sempat muncul. */
(function(){var D=document,syn=false,PAD=/(btn|button|key|pad|tab|chip|cell|tile|card|lvt|opt|choice|pick|cmd|ctl|num|digit)/i;
function hit(el){for(var n=el,k=0;n&&n!==D.body&&k<5;n=n.parentElement,k++){var tn=n.tagName;
if(tn==='BUTTON'||tn==='A'||tn==='SUMMARY')return true;
if(n.getAttribute&&n.getAttribute('role')==='button')return true;
if(n.className&&typeof n.className==='string'&&PAD.test(n.className))return true}return false}
/* Satu ketukan = satu aksi: klik buatan dibedakan dari klik asli lewat isTrusted,
   jadi apa pun urutan kedatangannya, aksi tidak mungkin jalan dua kali. */
var g=null;
D.addEventListener('pointerdown',function(e){if(e.button)return;var t=e.target;
if(!t||!t.dispatchEvent||!hit(t))return;
if(t.closest&&t.closest('textarea,input,select,[contenteditable]'))return;
var x=e.clientX,y=e.clientY,gg={done:0,target:t};g=gg;
setTimeout(function(){
if(gg.done)return;gg.done=1;if(e.defaultPrevented)return;syn=true;
try{t.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true,clientX:x,clientY:y,button:0}))}catch(err){}
syn=false;setTimeout(function(){if(g===gg)g=null},700)},0)},true);
D.addEventListener('click',function(e){
if(syn)return;var gg=g;g=null;
if(!gg||gg.target!==e.target)return;
if(!gg.done){gg.done=1;return}
if(e.isTrusted){e.stopPropagation();e.preventDefault()}},true)})();
</script>
<style>
button,[role="button"],a,.btn,.key,.pad,.tab,.lvt,.chip,.cell,.tile,.card{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;touch-action:manipulation}
canvas{touch-action:none}
</style>
<!-- usanagi-polish -->
<style>
*{-webkit-tap-highlight-color:transparent;text-rendering:optimizeLegibility}
button,[role="button"],.btn,.key,.pad,a{-webkit-user-select:none;user-select:none;transition:transform .07s ease,filter .16s ease,box-shadow .22s ease}
button:active,[role="button"]:active,.btn:active,.key:active,.pad:active{transform:translateY(1px) scale(.985);filter:brightness(1.07)}
canvas,svg,img{-webkit-user-drag:none;user-select:none}
::selection{background:rgba(92,217,255,.32)}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-thumb{background:rgba(92,217,255,.35);border-radius:99px}
::-webkit-scrollbar-track{background:transparent}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation-duration:.001ms!important}}
/* material: bevel + bayangan kontak supaya tombol terasa benda nyata */
.abtn,.sbtn,.mb{box-shadow:inset 0 2px 0 rgba(255,255,255,.22),inset 0 -3px 5px rgba(0,0,0,.42),0 4px 0 rgba(0,0,0,.44),0 8px 16px rgba(0,0,0,.38)!important}
.ovCard{box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 18px 40px rgba(0,0,0,.55),0 2px 0 rgba(0,0,0,.45)!important}
.stage{box-shadow:inset 0 0 0 2px rgba(255,255,255,.08),inset 0 -8px 20px rgba(0,0,0,.6),0 16px 34px rgba(0,0,0,.52)!important}
.stage canvas{filter:saturate(1.08) contrast(1.05)}
/* tombol kepala (🔊/⏸) tetap bisa disentuh walau lapisan menu/jeda terbuka */
#muteB,#pauseB{position:relative;z-index:9;touch-action:manipulation}
</style>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return

  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🛩️', key: reactionKey } }).catch(() => {})

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
                messageText: 'Usanagi Umi AI Sky Raiders 🛩️',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'usanagi-ai-skyraiders-2026',
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

handler.help = ['skyraiders', 'skyraider', 'shmup', 'sky']
handler.tags = ['game']
handler.command = /^(skyraiders|skyraider|shmup|sky)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Game Sky Raiders Usanagi Umi AI - shmup horizontal, 5 sektor, power-up, bom, roll, 5 bos'

export default handler
