/* By AlzRiss - Usanagi Umi AI */

'use strict'

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#6fc3ea">
<title>Usanagi Umi AI BMX Boy</title>
<style>
:root{--text:#132639;--dim:#5b7288;--go:#3fbf6a;--coin:#ffb020;--sky:#8ed7f7;--bike:#2f7ad6}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;-webkit-user-drag:none}
html,body{min-height:100%;overscroll-behavior:none;background:radial-gradient(760px 430px at 50% -6%,#bfe8fa 0%,#7cc3e8 42%,#3d7ea3 100%);color:var(--text);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;align-items:center;padding:max(9px,env(safe-area-inset-top)) max(9px,env(safe-area-inset-right)) max(11px,env(safe-area-inset-bottom)) max(9px,env(safe-area-inset-left));overflow-x:hidden;touch-action:manipulation}
.app{width:min(100%,560px);margin:auto}
.cab{position:relative;width:100%;background:linear-gradient(180deg,#f4fbff,#cfe4ef);border:1px solid #9ec3d6;border-radius:20px;padding:10px;box-shadow:0 30px 80px #10394f70,inset 0 1px 0 #fff}
.head{display:flex;align-items:center;justify-content:space-between;gap:9px;background:linear-gradient(180deg,#12334a,#0b2130);border:1px solid #2b5a75;border-radius:13px;padding:8px 9px;margin-bottom:8px}
.brand{display:flex;align-items:center;gap:9px;min-width:0}
.logo{width:40px;height:40px;flex:none;display:grid;place-items:center;border-radius:12px;background:linear-gradient(150deg,#5aa9f0,#1f5fa8);border:1px solid #9fd0f7;color:#fff;font:900 20px system-ui;box-shadow:0 4px 0 #123a63,inset 0 1px 0 #ffffff40}
.brandText{min-width:0}
.title{font-size:16px;font-weight:900;letter-spacing:.8px;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sub{margin-top:2px;color:#8fb6cd;font-size:8px;letter-spacing:.34px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hbtns{display:flex;gap:6px;flex:none}
.mb{width:38px;height:38px;flex:none;border:1px solid #2b5a75;border-radius:10px;background:linear-gradient(180deg,#1d4a64,#0d2839);color:#eaf7ff;font-size:16px;box-shadow:0 3px 0 #071b27}
.hud{display:flex;align-items:center;gap:6px;flex-wrap:wrap;background:#0f2a3a;border:1px solid #24526b;border-radius:12px;padding:6px 7px;margin-bottom:8px}
.hs{display:flex;align-items:center;gap:4px;padding:3px 6px;background:#14384c;border:1px solid #2d6480;border-radius:8px}
.hs b{font-size:6.4px;letter-spacing:.12em;color:#8fb6cd}
.hs span{font:900 11px system-ui;color:#ffd166}
.timeWrap{display:flex;align-items:center;gap:5px;flex:1 1 116px;min-width:100px}
.timeWrap b{font-size:6.4px;letter-spacing:.14em;color:#8fb6cd}
.timeBar{position:relative;flex:1;height:11px;border-radius:6px;background:#08202c;border:1px solid #2d6480;overflow:hidden;box-shadow:inset 0 2px 4px #0008}
.timeBar i{position:absolute;inset:0 auto 0 0;width:100%;background:linear-gradient(180deg,#9df3bd,#3fbf6a 60%,#1d7a42);transition:width .12s linear}
.timeBar.low i{background:linear-gradient(180deg,#ffb08a,#e0442e 60%,#8a1a0f);animation:tp .6s infinite}
@keyframes tp{0%,100%{filter:brightness(1)}50%{filter:brightness(1.5)}}
.stage{position:relative;width:100%;aspect-ratio:480/296;border:1px solid #8fb6cd;border-radius:14px;overflow:hidden;background:#9fd6ef;box-shadow:inset 0 10px 26px #10394f55}
.stage canvas{display:block;width:100%;height:100%;touch-action:none;user-select:none}
.banner{position:absolute;left:0;right:0;top:26%;text-align:center;pointer-events:none;opacity:0;transition:opacity .3s ease;font:950 18px system-ui;letter-spacing:.07em;color:#fff;text-shadow:0 3px 0 #00000070,0 0 18px #ffb02090}
.banner.show{opacity:1}
.banner small{display:block;margin-top:4px;font:800 8px system-ui;letter-spacing:.18em;color:#ffe6b0}
.ov{position:absolute;inset:0;z-index:7;display:grid;place-items:center;background:#08151fcc;backdrop-filter:blur(9px);padding:12px;border-radius:20px;transition:opacity .22s ease}
.ov.hide{opacity:0;pointer-events:none}
.ovCard{width:min(95%,374px);max-height:calc(100% - 6px);overflow:auto;-webkit-overflow-scrolling:touch;text-align:center;padding:14px 12px;border:1px solid #3d6b85;border-radius:16px;background:linear-gradient(180deg,#1d3b4d,#0b1c26);box-shadow:0 20px 46px #0009,inset 0 1px 0 #ffffff18;animation:pop .26s ease}
@keyframes pop{from{transform:scale(.9);opacity:0}to{transform:scale(1);opacity:1}}
.ovIcon{font-size:26px;line-height:1}
.ovTitle{margin-top:5px;font-size:20px;font-weight:950;color:#fff;letter-spacing:.6px}
.ovText{margin-top:6px;color:#a9c6d6;font-size:9px;line-height:1.55}
.ovText b{color:#ffd166}
.ovStats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:10px}
.ovStats div{padding:6px 5px;border:1px solid #2d6480;border-radius:9px;background:#0b1c26}
.ovStats b{display:block;font-size:12px;color:#ffd166}
.ovStats span{display:block;margin-top:3px;font-size:6px;letter-spacing:.12em;color:#8fb6cd;text-transform:uppercase}
.ovBtns{display:grid;gap:6px;margin-top:10px}
.lvGrid{display:grid;grid-template-columns:repeat(5,1fr);gap:5px}
.lvt{position:relative;min-height:42px;border:1px solid #2d6480;border-radius:9px;background:linear-gradient(180deg,#1b4258,#0d2634);color:#eaf7ff;font:900 13px system-ui;box-shadow:0 3px 0 #071b27,inset 0 1px 0 #ffffff18;touch-action:manipulation;display:grid;place-items:center;gap:1px;padding:3px 2px}
.lvt .stt{display:flex;gap:1px;font:700 6px system-ui;line-height:1}
.lvt .stt i{color:#3d6b85;font-style:normal}
.lvt .stt i.on{color:#ffd166;text-shadow:0 0 6px #ffb02090}
.lvt.sel{border-color:#ffd166;background:linear-gradient(180deg,#2b6382,#123448);box-shadow:0 0 0 2px #ffd16670,0 3px 0 #071b27}
.lvt.lock{opacity:.5;background:linear-gradient(180deg,#173444,#0a1a24)}
.sbtn{min-height:38px;border:1px solid #3d6b85;border-radius:10px;background:linear-gradient(180deg,#1b4258,#0d2634);color:#eaf7ff;font:900 8.4px system-ui;letter-spacing:.06em;box-shadow:0 4px 0 #071b27,inset 0 1px 0 #ffffff18;touch-action:manipulation}
.sbtn.go{border-color:#7ce0a3;background:linear-gradient(180deg,#43c973,#1d7a42);color:#062612;box-shadow:0 4px 0 #0b3a1e,inset 0 1px 0 #ffffff44}
.sbtn.gold{border-color:#ffd166;background:linear-gradient(180deg,#ffcf5a,#c9820c);color:#3d2503;box-shadow:0 4px 0 #6b4503,inset 0 1px 0 #ffffff66}
.sbtn:active{transform:translateY(3px);box-shadow:0 1px 0 #071b27}
.pad{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-top:9px}
.ped{min-height:74px;border:1px solid #3d6b85;border-radius:16px;background:linear-gradient(180deg,#26536c,#12303f);color:#eaf7ff;font:900 11.4px system-ui;letter-spacing:.06em;box-shadow:0 6px 0 #071b27,inset 0 1px 0 #ffffff20;touch-action:none;user-select:none;display:grid;place-items:center;gap:2px;padding:4px}
.ped small{font-size:6px;letter-spacing:.1em;color:#9dc0d3;text-align:center;line-height:1.3}
.ped.gas{border-color:#7ce0a3;background:radial-gradient(circle at 40% 24%,#5ad886,#1f8a4a 58%,#0d3d22);color:#04220f;box-shadow:0 6px 0 #0a3320,inset 0 2px 0 #ffffff55}
.ped.gas small{color:#0a3320}
.ped.brake{border-color:#e0917a;background:radial-gradient(circle at 40% 24%,#ff9d8a,#c03a28 58%,#6b1409);color:#fff;box-shadow:0 6px 0 #4a0f06,inset 0 2px 0 #ffffff55}
.ped.brake small{color:#ffd8d0}
.ped.jump{border-color:#9fd0f7;background:radial-gradient(circle at 40% 24%,#7cc4ff,#2f7ad6 58%,#123a63);color:#fff;box-shadow:0 6px 0 #0b2440,inset 0 2px 0 #ffffff55}
.ped.jump small{color:#d6ecff}
.ped.active{transform:translateY(4px);box-shadow:0 2px 0 #071b27;filter:brightness(1.15)}
.foot{display:flex;justify-content:space-between;gap:8px;margin-top:7px;padding:0 3px;color:#6b8698;font-size:6.2px}
.foot kbd{padding:2px 4px;border:1px solid #2d6480;border-radius:4px;background:#0f2a3a;color:#9dc0d3;font:700 6px system-ui}
@media(max-width:380px){body{padding:7px}.cab{padding:8px}.title{font-size:14px}.logo{width:35px;height:35px}.ped{min-height:64px;font-size:10px}.ped small{font-size:5.6px}}
@media(min-width:720px){body{padding-top:18px;padding-bottom:18px}.cab{padding:13px}}
</style>
</head>
<body>
<div class="app">
  <div class="cab">
    <div class="head">
      <div class="brand">
        <div class="logo">🚲</div>
        <div class="brandText"><div class="title">BMX BOY</div><div class="sub">SEPEDA LINTAS MEDAN • USANAGI UMI AI ARCADE</div></div>
      </div>
      <div class="hbtns">
        <button class="mb" id="pauseB" type="button" aria-label="Jeda">⏸</button>
        <button class="mb" id="muteB" type="button" aria-label="Suara">🔊</button>
      </div>
    </div>

    <div class="hud">
      <div class="hs"><b>LEVEL</b><span id="lvTxt">1/10</span></div>
      <div class="hs"><b>KOIN</b><span id="coinTxt">0/0</span></div>
      <div class="timeWrap"><b>WAKTU</b><div class="timeBar" id="timeBar"><i id="timeFill"></i></div></div>
      <div class="hs"><b>SKOR</b><span id="scoreTxt">0</span></div>
    </div>

    <div class="stage" id="stage">
      <canvas id="cv"></canvas>
      <div class="banner" id="banner"></div>
    </div>

    <div class="pad">
      <button class="ped brake" id="bBrake" type="button">⏪ MUNDUR<small>REM / PUTAR KE DEPAN</small></button>
      <button class="ped jump" id="bJump" type="button">⤒ LOMPAT<small>LONCATI RINTANGAN</small></button>
      <button class="ped gas" id="bGas" type="button">⏩ GAS<small>MAJU / PUTAR KE BELAKANG</small></button>
    </div>

    <div class="foot"><span>Balik ke finis sebelum waktu habis • Putaran udara + bonus skor</span><span><kbd>←</kbd><kbd>→</kbd> <kbd>SPASI</kbd> <kbd>P</kbd> <kbd>M</kbd></span></div>

    <div class="ov" id="ov">
      <div class="ovCard">
        <div class="ovIcon" id="ovIcon">🚲</div>
        <h2 class="ovTitle" id="ovTitle">BMX BOY</h2>
        <p class="ovText" id="ovText">Gowes sepeda BMX menembus 10 lintasan. Sejauh apa kamu bisa?</p>
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
  /* geser di area permainan tidak boleh menutup webview / menggeser chat; kotak yang memang
     bisa digulir (menu) dan halaman yang lebih tinggi dari layar tetap dibiarkan */
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
function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}

var cv=$('cv'),ctx=cv.getContext('2d');
var VW=480,VH=296,PX=1,LOW=false;
try{LOW=(navigator.hardwareConcurrency||4)<=2}catch(e){}
function fit(){
  var host=cv.parentNode||D.body;
  var cssW=Math.max(150,Math.round(host.clientWidth||((window.innerWidth||360)-26)));
  var dpr=Math.min(LOW?1.5:2,(window.devicePixelRatio)||1);
  PX=clamp(Math.round(cssW*dpr/VW),1,2);
  cv.width=Math.round(VW*PX);cv.height=Math.round(VH*PX);
}

/* ══════════ SUARA ══════════ */
var AC=null,master=null,muted=false,chainG=null,chainO=null,chainO2=null;
function ensureAC(){try{if(!AC){var C=window.AudioContext||window.webkitAudioContext;if(C)AC=new C()}if(AC&&AC.state==='suspended'&&AC.resume)AC.resume()}catch(e){}return AC}
function bus(){if(!master&&AC){master=AC.createGain();master.gain.value=muted?0:0.5;master.connect(AC.destination)}return master}
function tone(f1,f2,dur,vol,type,delay){
  if(muted)return;var a=ensureAC();if(!a)return;
  try{
    var t=a.currentTime+(delay||0),o=a.createOscillator(),g=a.createGain();
    o.type=type||'square';o.frequency.setValueAtTime(Math.max(24,f1),t);
    if(f2&&f2>0)o.frequency.exponentialRampToValueAtTime(Math.max(24,f2),t+dur);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(0.001,vol||0.05),t+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g);g.connect(bus());o.start(t);o.stop(t+dur+0.03);
  }catch(e){}
}
function noise(dur,vol,f0,f1){
  if(muted)return;var a=ensureAC();if(!a)return;
  try{
    var n=Math.max(1,Math.floor(a.sampleRate*dur)),buf=a.createBuffer(1,n,a.sampleRate),d=buf.getChannelData(0),i;
    for(i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);
    var t=a.currentTime,s=a.createBufferSource();s.buffer=buf;
    var fl=a.createBiquadFilter();fl.type='lowpass';fl.frequency.setValueAtTime(Math.max(60,f0||1200),t);
    if(f1)fl.frequency.exponentialRampToValueAtTime(Math.max(60,f1),t+dur);
    var g=a.createGain();g.gain.setValueAtTime(Math.max(0.001,vol||0.2),t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    s.connect(fl);fl.connect(g);g.connect(bus());s.start(t);
  }catch(e){}
}
function chainStart(){
  if(chainO||muted)return;var a=ensureAC();if(!a)return;
  try{
    chainO=a.createOscillator();chainO.type='sawtooth';chainO.frequency.value=42;
    chainO2=a.createOscillator();chainO2.type='triangle';chainO2.frequency.value=88;
    chainG=a.createGain();chainG.gain.value=0;
    var fl=a.createBiquadFilter();fl.type='bandpass';fl.frequency.value=340;fl.Q.value=1.4;
    chainO.connect(fl);chainO2.connect(fl);fl.connect(chainG);chainG.connect(bus());
    chainO.start();chainO2.start();
  }catch(e){}
}
function chainSet(rate,on){
  if(chainG&&AC){try{chainG.gain.value=(muted||!on)?0:(0.012+rate*0.024);chainO.frequency.value=38+rate*120;chainO2.frequency.value=80+rate*180}catch(e){}}
}
function chainStop(){if(chainG){try{chainG.gain.value=0}catch(e){}}}
var sfx={
  coin:function(){tone(1240,1660,0.06,0.05,'square');tone(1660,2220,0.09,0.035,'square',0.055)},
  jump:function(){tone(320,760,0.11,0.05,'triangle');noise(0.06,0.07,900,300)},
  land:function(){noise(0.09,0.14,520,110)},
  crash:function(){noise(0.5,0.34,1700,90);tone(210,50,0.5,0.09,'sawtooth')},
  flip:function(){var s=[784,988,1175,1568],i;for(i=0;i<s.length;i++)tone(s[i],s[i]*1.01,0.12,0.05,'square',i*0.07)},
  bump:function(){noise(0.12,0.2,700,120);tone(180,90,0.14,0.05,'square')},
  click:function(){tone(660,900,0.05,0.04,'square')},
  go:function(){tone(440,880,0.16,0.05,'square');tone(880,1320,0.2,0.045,'square',0.16)},
  tick:function(){tone(1000,1000,0.05,0.04,'square')},
  win:function(){var s=[523,659,784,1046,1318],i;for(i=0;i<s.length;i++)tone(s[i],s[i]*1.02,0.16,0.055,'square',i*0.1)},
  star:function(){tone(1400,2100,0.1,0.045,'triangle');tone(2100,2600,0.12,0.035,'triangle',0.08)}
};

/* ══════════ LINTASAN ══════════ */
var PAL={
  city:{a:'#79c7ee',b:'#e9f8ff',far:'#a7c4d6',near:'#7ba0ba',gr1:'#8ed060',gr2:'#4f9a34',d1:'#9b7a52',d2:'#4b3826',prop:'tree',sun:'#fff6d0',night:false},
  village:{a:'#9adcf0',b:'#fdf8e4',far:'#b3ccb4',near:'#83a882',gr1:'#9ad365',gr2:'#548f33',d1:'#a58560',d2:'#54402c',prop:'tree',sun:'#fff3c0',night:false},
  desert:{a:'#f6c882',b:'#fff2d6',far:'#e0b177',near:'#c9924f',gr1:'#eccb7c',gr2:'#b98f3f',d1:'#dcb070',d2:'#8a6534',prop:'cactus',sun:'#fff0b0',night:false},
  forest:{a:'#7cc48d',b:'#e6f7e0',far:'#6fa878',near:'#4b7d55',gr1:'#63b64a',gr2:'#357a26',d1:'#8a6a48',d2:'#463424',prop:'pine',sun:'#f0ffd0',night:false},
  night:{a:'#151d38',b:'#38466f',far:'#26304e',near:'#1a2138',gr1:'#4a7f6a',gr2:'#26503c',d1:'#3a3a52',d2:'#1e1e2c',prop:'lamp',sun:'#ffeaa8',night:true},
  beach:{a:'#7fdcf0',b:'#fff5da',far:'#9fd9e6',near:'#59b0c9',gr1:'#f2dfa0',gr2:'#d0b061',d1:'#efdca8',d2:'#a8905c',prop:'palm',sun:'#fff8d8',night:false},
  snow:{a:'#b4e0f5',b:'#f8feff',far:'#d3e6f2',near:'#a6c4d8',gr1:'#f6fcff',gr2:'#c2dcec',d1:'#e4f0f7',d2:'#8fabbd',prop:'pine',sun:'#ffffff',night:false},
  canyon:{a:'#eb9f70',b:'#ffdcb0',far:'#d1774f',near:'#a2532f',gr1:'#cf7a52',gr2:'#8f4526',d1:'#b0613a',d2:'#6b3620',prop:'rock',sun:'#ffe0a8',night:false},
  volcano:{a:'#4d1b30',b:'#c9542e',far:'#7a2a30',near:'#43161e',gr1:'#6b3a2a',gr2:'#3a1e16',d1:'#4f2a20',d2:'#28140f',prop:'rock',sun:'#ff9a4a',night:false},
  space:{a:'#080c22',b:'#221a48',far:'#1a2044',near:'#101434',gr1:'#7777ba',gr2:'#3d3d78',d1:'#3a3a68',d2:'#1b1b34',prop:'rock',sun:'#d0e0ff',night:true}
};
var LEVELS=[
  {n:'TAMAN KOTA',len:4200,time:45,seed:11,sky:'city'},
  {n:'JALAN DESA',len:4900,time:48,seed:23,sky:'village'},
  {n:'GURUN PANAS',len:5600,time:50,seed:37,sky:'desert'},
  {n:'RIMBA HIJAU',len:6300,time:52,seed:41,sky:'forest'},
  {n:'KOTA MALAM',len:7000,time:55,seed:53,sky:'night'},
  {n:'PANTAI SURF',len:7700,time:58,seed:67,sky:'beach'},
  {n:'SALJU PUTIH',len:8400,time:60,seed:71,sky:'snow'},
  {n:'NGARAI MERAH',len:9100,time:62,seed:83,sky:'canyon'},
  {n:'GUNUNG API',len:9800,time:65,seed:97,sky:'volcano'},
  {n:'ANTARIKSA',len:10500,time:70,seed:103,sky:'space'}
];
var PROG={unlocked:1,stars:{},best:{}};
try{var rawP=localStorage.getItem('usanagi-bmxboy');if(rawP){var pp=JSON.parse(rawP);if(pp&&pp.unlocked)PROG=pp}}catch(e){}
function saveProg(){try{localStorage.setItem('usanagi-bmxboy',JSON.stringify(PROG))}catch(e){}}
function getStars(i){return PROG.stars[i]||0}

/* ══════════ MEDAN ══════════ */
var DX=7,TERR=[],SEED=1,DIFF=1;
function hsh(n){var s=Math.sin(n*127.1+11.7)*43758.5453;return s-Math.floor(s)}
function vn(x){var i=Math.floor(x),f=x-i,a=hsh(i),b=hsh(i+1);f=f*f*(3-2*f);return a+(b-a)*f}
function terrainAtI(i){
  if(i<0)i=0;
  if(i<13)return 190;
  var amp=0.70+DIFF*0.030;
  var h=190;
  h+=(vn(i*0.0175+SEED*3.1)-0.5)*44*amp;
  h+=(vn(i*0.0520+SEED*7.7)-0.5)*26*amp;
  h+=(vn(i*0.1180+SEED*1.9)-0.5)*8*amp;
  h+=(vn(i*0.3000+SEED*5.3)-0.5)*2.6*amp;
  var m=i%140;
  if(m<11)h-=m*2.8*amp;
  return h;
}
var MAXSTEP=4.5;   /* ~33 derajat: tanjakan 40 derajat membuat sepeda merangkak (traksi hampir tak cukup) */
function ensureTerrain(iMax){
  var need=iMax+2,i;
  for(i=TERR.length;i<=need;i++){
    var h=terrainAtI(i),p=(i>0?TERR[i-1]:h);
    if(h-p>MAXSTEP)h=p+MAXSTEP;
    else if(p-h>MAXSTEP)h=p-MAXSTEP;
    TERR[i]=h;
  }
}
function groundY(x){
  var f=x/DX;if(f<0)f=0;
  var i=Math.floor(f);ensureTerrain(i+2);
  var a=TERR[i],b=TERR[i+1],t=f-i;
  var y=a+(b-a)*t;
  if(i<13)return y;
  return y;
}
function slopeAt(x){
  var f=x/DX;if(f<0)f=0;
  var i=Math.floor(f);ensureTerrain(i+2);
  return (TERR[i+1]-TERR[i])/DX;
}
function normalAt(x,out){
  var s=slopeAt(x),l=Math.sqrt(1+s*s);
  out.nx=s/l;out.ny=-1/l;out.tx=1/l;out.ty=s/l;out.s=s;
  return out;
}
var N1={nx:0,ny:-1,tx:1,ty:0,s:0};

/* ══════════ SEPEDA ══════════ */
var WR=7,WHEELL=[{x:-13,y:4},{x:13,y:4}];
var MASS=1,INERTIA=9,GRAV=0.32,K=1.25,DAMP=2.1,FRIC=3.1,MU=1.15,MAXV=8.6;
var W_TARGET=1.35,ROLL_DRAG=0.02,FN_MAX=1.3,AV_GROUND=0.075,AV_AIR=0.26,SUB=4;
var MAXPEN=5;      /* kedalaman tembus maksimum: lebih dari ini, sepeda didorong keluar */
var JUMPV=6.7;
var bike={x:0,y:0,vx:0,vy:0,a:0,av:0,onGround:true,gas:false,brake:false,air:0,airRot:0,wheelSpin:0,bounce:0,w:0,jumpCd:0};
var prevA=0,subPrevA=0;
function reset(x){
  ensureTerrain(Math.ceil(x/DX)+4);
  bike.x=x;bike.y=groundY(x)-WR-6;bike.vx=0;bike.vy=0;bike.a=0;bike.av=0;bike.onGround=true;bike.air=0;bike.airRot=0;
  bike.wheelSpin=0;bike.bounce=0;bike.w=0;bike.jumpCd=0;
  prevA=0;subPrevA=0;
}
function headPoint(){
  var ca=Math.cos(bike.a),sa=Math.sin(bike.a),lx=1,ly=-29;
  return{x:bike.x+lx*ca-ly*sa,y:bike.y+lx*sa+ly*ca};
}
function subStep(dt){
  var i,ca=Math.cos(bike.a),sa=Math.sin(bike.a);
  var FX=0,FY=GRAV*MASS,torque=0;
  var drive=(bike.gas?1:0)-(bike.brake?1:0);
  var touched=0;
  var targetW=drive>0?W_TARGET:(drive<0?-W_TARGET*0.6:0);
  bike.w+=(targetW-bike.w)*Math.min(0.6,0.06*dt*2);
  ensureTerrain(Math.ceil(bike.x/DX)+6);
  for(i=0;i<2;i++){
    var L=WHEELL[i];
    var rx=L.x*ca-L.y*sa,ry=L.x*sa+L.y*ca;
    var wx=bike.x+rx,wy=bike.y+ry;
    var pen=(wy+WR)-groundY(wx);
    if(pen>0){
      normalAt(wx,N1);
      var nx=N1.nx,ny=N1.ny,tx=N1.tx,ty=N1.ty;
      var vn=bike.vx*nx+bike.vy*ny,vt=bike.vx*tx+bike.vy*ty;
      var Fn=K*pen-DAMP*vn;
      if(Fn<0)Fn=0;if(Fn>FN_MAX)Fn=FN_MAX;
      FX+=nx*Fn;FY+=ny*Fn;torque+=(rx*ny*Fn-ry*nx*Fn);
      var Ft,lim=MU*Fn;
      if(drive!==0){
        var slip=vt-bike.w*WR;
        Ft=-slip*FRIC;
        if(Ft>lim)Ft=lim;if(Ft<-lim)Ft=-lim;
      }else{
        Ft=-vt*ROLL_DRAG;
      }
      FX+=tx*Ft;FY+=ty*Ft;torque+=(rx*ty*Ft-ry*tx*Ft);
      touched=1;
    }
  }
  bike.onGround=!!touched;
  if(touched){bike.air=0;bike.av*=Math.pow(0.80,dt);}
  else if(bike.air>5){
    /* di udara: GAS/MUNDUR memutar sepeda, sedangkan LEPAS tombol menghentikan putaran.
       Dulu peredamnya 0,997 sehingga sisa putaran sekecil apa pun berubah jadi jungkir balik. */
    bike.av-=drive*0.013*dt;
    if(drive===0){
      /* tanpa input, sepeda menyesuaikan diri dengan arah lintasan seperti sepeda sungguhan,
         supaya mendarat di lereng tidak selalu berarti tumbang.
         HANYA kalau selisihnya kecil — kalau sudah hampir terbalik, tidak diselamatkan. */
      var tgt=clamp(Math.atan2(bike.vy,Math.abs(bike.vx)+1.5),-0.5,0.5);
      var dif=wrapAng(tgt-bike.a);
      if(Math.abs(dif)<0.9)bike.av+=dif*0.011*dt;
      bike.av*=Math.pow(0.86,dt);
    }
  }else{
    bike.av*=Math.pow(0.90,dt);
  }
  bike.vx+=(FX/MASS)*dt;bike.vy+=(FY/MASS)*dt;bike.av+=(torque/INERTIA)*dt;
  var avMax=touched?AV_GROUND:AV_AIR;
  bike.av=clamp(bike.av,-avMax,avMax);
  bike.vx=clamp(bike.vx,-MAXV,MAXV);
  bike.vy=clamp(bike.vy,-14,14);
  bike.x+=bike.vx*dt;bike.y+=bike.vy*dt;bike.a+=bike.av*dt;
  bike.wheelSpin+=(bike.w*7.5)*dt;
  if(!touched){bike.air+=dt;bike.w+=(0-bike.w)*Math.min(0.4,0.02*dt)}
  /* koreksi posisi: mendarat keras tidak boleh menembus tanah (dulu bisa tenggelam 17 satuan
     lalu kepala dianggap menyentuh tanah = tumbang palsu) */
  if(touched){
    var j;
    for(j=0;j<2;j++){
      var L2=WHEELL[j];
      var rx2=L2.x*ca-L2.y*sa,ry2=L2.x*sa+L2.y*ca;
      var wx2=bike.x+rx2;
      var pen2=(bike.y+ry2+WR)-groundY(wx2);
      if(pen2>MAXPEN){
        normalAt(wx2,N1);
        var ex=pen2-MAXPEN;
        bike.x+=N1.nx*ex;bike.y+=N1.ny*ex;
        var vn2=bike.vx*N1.nx+bike.vy*N1.ny;
        if(vn2<0){bike.vx-=N1.nx*vn2;bike.vy-=N1.ny*vn2}
      }
    }
  }
  /* total putaran di udara dihitung per sub-langkah (dulu memakai pembanding yang sama
     untuk 4 sub-langkah sehingga tercatat 4x lebih besar dari putaran sebenarnya) */
  bike.airRot+=wrapAng(bike.a-subPrevA);
  subPrevA=bike.a;
  return touched;
}
function wrapAng(v){while(v>Math.PI)v-=Math.PI*2;while(v<-Math.PI)v+=Math.PI*2;return v}
function phys(){
  /* nilai udara HARUS disimpan sebelum subStep: di dalamnya bike.air di-reset saat roda menyentuh,
     sehingga memeriksa bike.air sesudahnya membuat bonus trik tidak pernah aktif */
  var wasAir=!bike.onGround,airBefore=bike.air,rotBefore=bike.airRot;
  for(var si=0;si<SUB;si++)subStep(1/SUB);
  if(bike.onGround&&wasAir&&airBefore>8){
    var ta=Math.atan(slopeAt(bike.x));
    var d=wrapAng(bike.a-ta);
    if(Math.abs(d)>1.45){fail('Mendarat terbalik! Sepeda tidak bisa diselamatkan.');return}
    sfx.land();
    var r=Math.abs(rotBefore);
    if(r>5.4){
      var flips=Math.floor(r/6.283)||1;
      var pts=250*flips;
      addScore(pts);
      showBanner(flips>1?('TRICK x'+flips+'!'):'TRICK!','PUTARAN UDARA +'+pts);
      sfx.flip();
    }else if(airBefore>32){
      addScore(80);showBanner('MELAYANG','+80 • '+(airBefore/60).toFixed(1)+' dtk');
    }
    bike.air=0;bike.airRot=0;
    bike.bounce=clamp(Math.abs(bike.vy)*0.5,0,1);
  }
  prevA=bike.a;
  if(bike.onGround){bike.air=0;bike.airRot=0}
}
function doJump(){
  if(state!=='play')return;
  if(bike.jumpCd>0||!bike.onGround)return;
  bike.vy=-JUMPV;
  bike.av=0;
  bike.jumpCd=10;
  bike.air=0;
  sfx.jump();
}

/* ══════════ ISIAN LINTASAN ══════════ */
var coins=[],obs=[],pops=[];
var nextCoinX=220,nextObsX=560,lastObsX=-9999,coinsGot=0,coinTotal=0,score=0,finishX=0,level=1,levelTime=60,timeLeft=60;
/* tata letak koin & rintangan dihitung dari POSISI (bukan pengacak berurutan),
   jadi susunannya sama setiap kali level dimainkan = lintasan bisa dihafal seperti game aslinya */
function ph1(x){return hsh(Math.floor(x)*0.0173+SEED*3.7)}
var state='menu',tick=0,bannerT=0,overReason='';
function ensureItems(xTo){
  var lim=Math.min(xTo,finishX-150);
  while(nextCoinX<lim){
    var n=3+Math.floor(ph1(nextCoinX)*3),i;
    for(i=0;i<n;i++){
      var cx=nextCoinX+i*24,cy=groundY(cx)-26-Math.sin(i/((n-1)||1)*Math.PI)*18;
      coins.push({x:cx,y:cy,got:false,ph:ph1(cx+31)*6});
    }
    coinTotal+=n;
    nextCoinX+=190+ph1(nextCoinX+7)*130;
  }
  var olim=Math.min(xTo,finishX-170);
  while(nextObsX<olim){
    var ox=nextObsX;
    /* jarak minimum 430 satuan: satu lompatan menempuh ~360 satuan, jadi rintangan yang
       lebih rapat dari itu tidak mungkin dihindari (lompat yang pertama = mendarat di yang kedua) */
    if(ox-lastObsX>=430&&obsSpotOk(ox)){
      obs.push({x:ox,y:groundY(ox),r:8.5+ph1(ox+11)*4,type:ph1(ox+23)<0.5?'cone':'rock'});
      lastObsX=ox;
    }
    nextObsX+=320+ph1(ox+5)*260;
  }
}
/* Rintangan hanya boleh di landasan yang rata. Dulu rintangan bisa berada tepat setelah
   tanjakan tempat sepeda MELAYANG — saat itu pemain tidak bisa melompat sama sekali,
   jadi tabrakan tak terhindarkan (bot uji pun selalu mati di sana). */
function obsSpotOk(ox){
  if(Math.abs(slopeAt(ox))>0.32)return false;
  if(Math.abs(slopeAt(ox+44))>0.32)return false;
  /* puncak bukit (permukaan cembung) 240 satuan sebelum rintangan = sepeda terlempar
     melayang dan pemain TIDAK bisa melompat menghindar. Rumus cembung: y layar ke bawah,
     jadi puncak memberi groundY(k-40)-2*groundY(k)+groundY(k+40) yang positif besar. */
  var k,c;
  for(k=-240;k<=0;k+=40){
    c=groundY(ox+k-40)-2*groundY(ox+k)+groundY(ox+k+40);
    if(c>13)return false;
  }
  return true;
}
function collect(){
  var i;
  for(i=0;i<coins.length;i++){
    var it=coins[i];
    if(it.got)continue;
    if(Math.abs(it.x-bike.x)<22&&Math.abs(it.y-bike.y)<32){
      it.got=true;coinsGot++;score+=25;sfx.coin();popup(it.x,it.y,'+25','#ffd166');hud();
    }
  }
}
function hitObs(){
  var i;
  for(i=0;i<obs.length;i++){
    var o=obs[i];
    if(Math.abs(o.x-bike.x)>o.r+9)continue;
    var dx=bike.x-o.x,dy=bike.y-(o.y-o.r);
    var d=Math.sqrt(dx*dx+dy*dy);
    if(d<o.r+7){
      if(Math.abs(bike.vx)>5.0){
        fail(o.type==='cone'?'Kamu menabrak cone lalu terpelanting.':'Kamu menghantam batu dan terjungkal.');
        return;
      }
      sfx.bump();
      bike.vx=Math.abs(bike.vx)>0.4?-Math.abs(bike.vx)*0.4:0;
      bike.x=o.x-(dx>=0?1:-1)*(o.r+8);
      bike.vy=Math.min(bike.vy,-1.1);
      popup(o.x,o.y-22,'AWAS!','#ff9a6a');
    }
  }
}
function popup(x,y,t,c){pops.push({x:x,y:y,t:t,c:c,life:46,max:46})}
function addScore(v){score+=v;hud()}
function showBanner(t,s){var b=$('banner');b.innerHTML=t+(s?'<small>'+s+'</small>':'');b.classList.add('show');bannerT=tick}
function hideBanner(){var b=$('banner');if(b)b.classList.remove('show')}

/* ══════════ HUD & OVERLAY ══════════ */
var hc={lv:'',coin:'',score:-1,time:-1};
function hud(){
  var lt=level+'/'+LEVELS.length;
  if(hc.lv!==lt){hc.lv=lt;var e=$('lvTxt');if(e)e.textContent=lt}
  var ct=coinsGot+'/'+coinTotal;
  if(hc.coin!==ct){hc.coin=ct;var c=$('coinTxt');if(c)c.textContent=ct}
  if(hc.score!==score){hc.score=score;var s=$('scoreTxt');if(s)s.textContent=score}
  var t=Math.max(0,Math.ceil(timeLeft*10));
  if(hc.time!==t){
    hc.time=t;
    var fi=$('timeFill'),fb=$('timeBar');
    if(fi)fi.style.width=clamp(timeLeft/levelTime,0,1)*100+'%';
    if(fb)fb.className='timeBar'+(timeLeft<levelTime*0.25?' low':'');
  }
}
function statHtml(stats){
  if(!stats||!stats.length)return '';
  var h='',i;
  for(i=0;i<stats.length;i++)h+='<div><b>'+stats[i][1]+'</b><span>'+stats[i][0]+'</span></div>';
  return h;
}
function ovSet(icon,title,text,stats,btns){
  var o=$('ov');if(!o)return;
  $('ovIcon').textContent=icon;
  $('ovTitle').textContent=title;
  $('ovText').innerHTML=text;
  var stEl=$('ovStats');
  stEl.innerHTML=stats||'';
  stEl.style.display=stats?'grid':'none';
  $('ovBtns').innerHTML=btns||'';
  o.classList.remove('hide');
}
function ovHide(){var o=$('ov');if(o)o.classList.add('hide')}
var sel=clamp(PROG.unlocked,1,LEVELS.length);
function menu(){
  state='menu';hideBanner();
  var tiles='',i,k;
  for(i=1;i<=LEVELS.length;i++){
    var lock=i>PROG.unlocked,st=getStars(i),ss='';
    for(k=0;k<3;k++)ss+='<i class="'+(k<st?'on':'')+'">★</i>';
    tiles+='<button class="lvt'+(lock?' lock':'')+(i===sel?' sel':'')+'" type="button" data-act="lv" data-lv="'+i+'"'+'>'
      +'<b>'+(lock?'🔒':i)+'</b><span class="stt">'+ss+'</span></button>';
  }
  var totalStar=0;
  for(i=1;i<=LEVELS.length;i++)totalStar+=getStars(i);
  var btns='<div class="lvGrid">'+tiles+'</div>'
    +'<button class="sbtn go" type="button" data-act="start">▶ MULAI LEVEL '+sel+'</button>'
    +'<button class="sbtn" type="button" data-act="help">❔ CARA MAIN</button>';
  ovSet('🚲','BMX BOY',
    'Gowes ke garis finis sebelum waktu habis. Kumpulkan koin, lompati rintangan, dan putar sepeda di udara untuk skor besar.'
    +'<br><br>Level '+LEVELS[sel-1].n+' • target '+Math.round(LEVELS[sel-1].len/8)+' m',
    statHtml([['TERBUKA',PROG.unlocked+'/'+LEVELS.length],['BINTANG',totalStar+'/'+(LEVELS.length*3)],['REKOR',(PROG.best[sel]||0)+' m']]),
    btns);
}
function help(){
  ovSet('📖','CARA MAIN',
    '<b>⏩ GAS</b> — mengayuh maju. Di udara, gas memutar sepeda ke <b>belakang</b> (backflip).<br>'
    +'<b>⏪ MUNDUR</b> — mengerem/mundur. Di udara, tombol ini memutar sepeda ke <b>depan</b>.<br>'
    +'<b>⤒ LOMPAT</b> — lompat tinggi dari tanah (bisa dipakai tiap kali mendarat).<br>'
    +'Di udara, <b>lepas kedua tombol</b> supaya putaran meredam. Putaran penuh (2π) mendarat rata; putaran tanggung malah <b>tumbang</b>.<br><br>'
    +'<b>Rintangan</b>: cone merah & batu kelabu. Menabraknya saat ngebut = <b>tumbang</b>. Lompati saja.<br>'
    +'<b>Kepala menyentuh tanah</b> juga tumbang — pastikan roda yang mendarat, bukan kepala.<br><br>'
    +'<b>Bintang</b>: 1★ finis • 2★ kumpulkan ≥70% koin • 3★ finis dengan sisa waktu ≥30%.<br>'
    +'1 meter dihitung 8 satuan. Koin +25, putaran udara +250, bonus waktu di akhir.',
    null,'<button class="sbtn go" type="button" data-act="back">◀ KEMBALI</button>');
}
function pause(){
  if(state!=='play')return;
  state='pause';chainSet(0,false);
  ovSet('⏸️','JEDA','Gowes ditunda sebentar.',statHtml([['LEVEL',level+'/'+LEVELS.length],['KOIN',coinsGot+'/'+coinTotal],['SKOR',score]]),
    '<button class="sbtn go" type="button" data-act="resume">▶ LANJUT</button>'
    +'<button class="sbtn" type="button" data-act="retry">↻ ULANG</button>'
    +'<button class="sbtn" type="button" data-act="menu">⏹ MENU</button>');
}
function resumeState(){if(state!=='pause')return;state='play';ovHide()}
function fail(reason){
  if(state!=='play')return;
  state='dead';overReason=reason;chainStop();sfx.crash();
  var m=Math.floor(Math.max(0,bike.x)/8);
  if(m>(PROG.best[level]||0)){PROG.best[level]=m;saveProg()}
  ovSet('💥','TUMBANG',reason,
    statHtml([['LEVEL',level+'/'+LEVELS.length],['JARAK',m+' m'],['SKOR',score]]),
    '<button class="sbtn go" type="button" data-act="retry">↻ COBA LAGI</button>'
    +'<button class="sbtn" type="button" data-act="menu">⏹ MENU</button>');
}
function win(){
  if(state!=='play')return;
  state='win';chainStop();
  var st=1;
  if(coinTotal>0&&coinsGot>=Math.ceil(coinTotal*0.7))st++;
  if(timeLeft>=levelTime*0.30)st++;
  var bonus=Math.round(timeLeft*12);
  score+=bonus;
  if(st>(PROG.stars[level]||0))PROG.stars[level]=st;
  if(level<LEVELS.length&&level+1>PROG.unlocked)PROG.unlocked=level+1;
  var m=Math.floor(finishX/8);
  if(m>(PROG.best[level]||0))PROG.best[level]=m;
  saveProg();hud();
  sfx.win();sfx.star();
  var ss='';var k;
  for(k=0;k<3;k++)ss+=(k<st?'★':'☆');
  var nextTxt=(level<LEVELS.length)?LEVELS[level].n:'SEMUA LEVEL TAMAT';
  var btns='';
  if(level<LEVELS.length)btns+='<button class="sbtn go" type="button" data-act="next">▶ LANJUT: '+nextTxt+'</button>';
  btns+='<button class="sbtn gold" type="button" data-act="retry">↻ ULANG LEVEL</button>';
  btns+='<button class="sbtn" type="button" data-act="menu">⏹ MENU</button>';
  ovSet(level<LEVELS.length?'🏁':'🏆','LEVEL '+level+' SELESAI',
    '<b style="font-size:15px;letter-spacing:3px;color:#ffd166">'+ss+'</b><br>Waktu tersisa '+timeLeft.toFixed(1)+' dtk (bonus +'+bonus+')'
    +(level<LEVELS.length?'':'<br><br>🏆 <b>Semua 10 lintasan sudah kamu tamatkan!</b>'),
    statHtml([['KOIN',coinsGot+'/'+coinTotal],['SKOR',score],['REKOR',(PROG.best[level]||0)+' m']]),
    btns);
}
function startLevel(n){
  level=clamp(n,1,LEVELS.length);
  sel=level;
  var L=LEVELS[level-1];
  DIFF=level;SEED=L.seed;
  TERR.length=0;coins.length=0;obs.length=0;pops.length=0;
  nextCoinX=220;nextObsX=560;lastObsX=-9999;coinsGot=0;coinTotal=0;score=0;tick=0;overReason='';
  finishX=L.len;levelTime=L.time;timeLeft=L.time;
  reset(60);
  ensureItems(2600);
  cam.x=0;cam.y=0;
  hc.lv='';hc.coin='';hc.score=-1;hc.time=-1;
  bike.gas=false;bike.brake=false;
  state='play';
  ovHide();hud();
  ensureAC();chainStart();
  sfx.go();
  showBanner('GO!','LEVEL '+level+' • '+L.n);
}

/* ══════════ GAMBAR ══════════ */
var cam={x:0,y:0},props=[],clouds=[],starsB=[];
function bakeProps(){
  props.length=0;clouds.length=0;starsB.length=0;
  var i;
  for(i=0;i<90;i++)props.push({x:i*118+rnd(-40,40),s:rnd(0.7,1.3),t:(i%5===0)?1:0});
  for(i=0;i<22;i++)clouds.push({x:i*180+rnd(-60,60),y:rnd(14,90),s:rnd(0.6,1.5)});
  for(i=0;i<70;i++)starsB.push({x:rnd(0,VW),y:rnd(0,VH*0.7),r:rnd(0.6,1.5),p:rnd(0,6.3)});
}
function curPal(){return PAL[LEVELS[level-1].sky]}
function skyGrad(){
  var p=curPal();
  var g=ctx.createLinearGradient(0,0,0,VH);
  g.addColorStop(0,p.a);g.addColorStop(1,p.b);
  return g;
}
function drawSky(){
  var p=curPal(),i;
  ctx.fillStyle=skyGrad();ctx.fillRect(0,0,VW,VH);
  if(p.night){
    for(i=0;i<starsB.length;i++){
      var s=starsB[i],a=0.35+0.65*Math.abs(Math.sin(tick/40+s.p));
      ctx.fillStyle='rgba(255,255,255,'+a.toFixed(2)+')';
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,6.3);ctx.fill();
    }
  }
  var sx=((VW*0.76-cam.x*0.03)%(VW+160)+VW+160)%(VW+160)-80;
  var sy=52;
  var rg=ctx.createRadialGradient(sx,sy,4,sx,sy,74);
  rg.addColorStop(0,p.sun);rg.addColorStop(0.22,'rgba(255,240,190,.42)');rg.addColorStop(1,'rgba(255,240,190,0)');
  ctx.fillStyle=rg;ctx.beginPath();ctx.arc(sx,sy,74,0,6.3);ctx.fill();
  ctx.fillStyle=p.sun;ctx.beginPath();ctx.arc(sx,sy,15,0,6.3);ctx.fill();
  var par=[0.20,0.42],col=[p.far,p.near];
  for(i=0;i<2;i++){
    ctx.fillStyle=col[i];
    ctx.beginPath();ctx.moveTo(0,VH);
    for(var k=0;k<=VW;k+=12){
      var wx=(cam.x*par[i]+k)*0.021;
      ctx.lineTo(k,VH*0.50+Math.sin(wx*1.35+i*1.7)*26+Math.sin(wx*0.62+i*2.4)*15);
    }
    ctx.lineTo(VW,VH);ctx.closePath();ctx.fill();
  }
  if(p.night){
    for(i=0;i<9;i++){
      var bx=((i*220-cam.x*0.20)%(VW+400)+VW+400)%(VW+400)-200;
      ctx.fillStyle='rgba(10,14,26,.75)';
      ctx.fillRect(bx,VH*0.30,34,VH*0.5);
      ctx.fillRect(bx-8,VH*0.24,50,10);
      ctx.fillStyle='rgba(255,220,140,.85)';
      for(var r=0;r<4;r++)for(var c=0;c<3;c++)ctx.fillRect(bx+4+c*10,VH*0.34+r*16,5,7);
    }
  }
  for(i=0;i<clouds.length;i++){
    var c=clouds[i];
    sx=c.x-cam.x*0.55;
    sx=((sx%(VW+340))+VW+340)%(VW+340)-170;
    ctx.fillStyle=p.night?'rgba(160,180,220,'+(0.16+i%3*0.06)+')':'rgba(255,255,255,'+(0.55+i%3*0.12)+')';
    ctx.beginPath();
    ctx.arc(sx,c.y,12*c.s,0,6.3);ctx.arc(sx+14*c.s,c.y+3*c.s,9*c.s,0,6.3);ctx.arc(sx-13*c.s,c.y+4*c.s,8*c.s,0,6.3);
    ctx.fill();
  }
}
function drawTerrain(){
  var p=curPal(),step=4,sx;
  ctx.beginPath();ctx.moveTo(-20,VH+40);
  for(sx=-20;sx<=VW+20;sx+=step)ctx.lineTo(sx,groundY(cam.x+sx)-cam.y);
  ctx.lineTo(VW+20,VH+40);ctx.closePath();
  var g=ctx.createLinearGradient(0,0,0,VH);
  g.addColorStop(0,p.d1);g.addColorStop(1,p.d2);
  ctx.fillStyle=g;ctx.fill();
  ctx.beginPath();ctx.moveTo(-20,VH+40);
  for(sx=-20;sx<=VW+20;sx+=step)ctx.lineTo(sx,groundY(cam.x+sx)-cam.y);
  for(sx=VW+20;sx>=-20;sx-=step)ctx.lineTo(sx,groundY(cam.x+sx)-cam.y+8);
  ctx.closePath();
  var g2=ctx.createLinearGradient(0,0,0,VH);
  g2.addColorStop(0,p.gr1);g2.addColorStop(1,p.gr2);
  ctx.fillStyle=g2;ctx.fill();
  var i;
  for(i=0;i<24;i++){
    var ix=Math.floor((cam.x+i*21)/44);
    var bx=(ix*44-cam.x)%(VW+90),by=groundY(cam.x+bx)-cam.y;
    if(bx<-20||bx>VW+20)continue;
    ctx.fillStyle='rgba(0,0,0,.16)';
    ctx.beginPath();ctx.arc(bx,by+4,2+((ix*7)%3),0,6.3);ctx.fill();
  }
}
function drawProps(){
  var p=curPal(),i;
  for(i=0;i<props.length;i++){
    var t=props[i],sx=t.x-cam.x;
    sx=((sx%10600)+10600)%10600-320;
    if(sx<-46||sx>VW+46)continue;
    var wy=groundY(t.x)-cam.y,s=t.s;
    ctx.fillStyle='rgba(0,0,0,.18)';
    ctx.beginPath();ctx.ellipse(sx,wy+3,11*s,3*s,0,0,6.3);ctx.fill();
    if(p.prop==='tree'){
      ctx.fillStyle='#4a3520';ctx.fillRect(sx-2*s,wy-17*s,4*s,17*s);
      ctx.fillStyle='#2f7a30';
      ctx.beginPath();ctx.moveTo(sx,wy-42*s);ctx.lineTo(sx+13*s,wy-15*s);ctx.lineTo(sx-13*s,wy-15*s);ctx.closePath();ctx.fill();
      ctx.fillStyle='#3d9440';
      ctx.beginPath();ctx.moveTo(sx,wy-33*s);ctx.lineTo(sx+10*s,wy-13*s);ctx.lineTo(sx-10*s,wy-13*s);ctx.closePath();ctx.fill();
    }else if(p.prop==='pine'){
      ctx.fillStyle='#3a2a18';ctx.fillRect(sx-2*s,wy-13*s,4*s,13*s);
      ctx.fillStyle='#226b3a';
      ctx.beginPath();ctx.moveTo(sx,wy-46*s);ctx.lineTo(sx+12*s,wy-26*s);ctx.lineTo(sx-12*s,wy-26*s);ctx.closePath();ctx.fill();
      ctx.beginPath();ctx.moveTo(sx,wy-36*s);ctx.lineTo(sx+14*s,wy-13*s);ctx.lineTo(sx-14*s,wy-13*s);ctx.closePath();ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.85)';
      ctx.beginPath();ctx.moveTo(sx,wy-46*s);ctx.lineTo(sx+6*s,wy-36*s);ctx.lineTo(sx-6*s,wy-36*s);ctx.closePath();ctx.fill();
    }else if(p.prop==='cactus'){
      ctx.fillStyle='#2f8a4a';
      rr(ctx,sx-4*s,wy-34*s,8*s,34*s,4*s);ctx.fill();
      rr(ctx,sx-13*s,wy-25*s,9*s,7*s,3*s);ctx.fill();
      rr(ctx,sx-13*s,wy-32*s,6*s,14*s,3*s);ctx.fill();
      rr(ctx,sx+4*s,wy-29*s,9*s,7*s,3*s);ctx.fill();
      rr(ctx,sx+8*s,wy-36*s,5*s,15*s,2.6*s);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(sx-2.6*s,wy-32*s,2*s,30*s);
    }else if(p.prop==='palm'){
      ctx.strokeStyle='#8a6136';ctx.lineWidth=3.4*s;ctx.beginPath();
      ctx.moveTo(sx,wy);ctx.quadraticCurveTo(sx+4*s,wy-20*s,sx+9*s,wy-34*s);ctx.stroke();
      ctx.fillStyle='#2f9a54';
      var ang;
      for(ang=0;ang<6;ang++){
        var a2=ang*1.047,r2=15*s;
        ctx.beginPath();ctx.moveTo(sx+9*s,wy-34*s);
        ctx.quadraticCurveTo(sx+9*s+Math.cos(a2)*r2,wy-34*s-Math.sin(a2)*r2*0.7,sx+9*s+Math.cos(a2)*r2*1.5,wy-30*s-Math.sin(a2)*r2*0.35);
        ctx.quadraticCurveTo(sx+9*s+Math.cos(a2)*r2*0.8,wy-34*s-Math.sin(a2)*r2*0.3,sx+9*s,wy-34*s);
        ctx.fill();
      }
      ctx.fillStyle='#7a4a1e';ctx.beginPath();ctx.arc(sx+9*s,wy-31*s,2.6*s,0,6.3);ctx.fill();
    }else if(p.prop==='lamp'){
      ctx.fillStyle='#3c4c60';ctx.fillRect(sx-1.6*s,wy-38*s,3.2*s,38*s);
      ctx.fillRect(sx-3*s,wy-2*s,6*s,3*s);
      ctx.fillStyle='#ffd166';
      rr(ctx,sx-5*s,wy-42*s,10*s,6*s,3*s);ctx.fill();
      var lg=ctx.createRadialGradient(sx,wy-39*s,2,sx,wy-39*s,26*s);
      lg.addColorStop(0,'rgba(255,220,140,.5)');lg.addColorStop(1,'rgba(255,220,140,0)');
      ctx.fillStyle=lg;ctx.beginPath();ctx.arc(sx,wy-39*s,26*s,0,6.3);ctx.fill();
    }else{
      ctx.fillStyle='#7d8492';
      ctx.beginPath();ctx.moveTo(sx-13*s,wy);ctx.lineTo(sx-8*s,wy-13*s);ctx.lineTo(sx+2*s,wy-16*s);
      ctx.lineTo(sx+12*s,wy-9*s);ctx.lineTo(sx+13*s,wy);ctx.closePath();ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.22)';
      ctx.beginPath();ctx.moveTo(sx-8*s,wy-13*s);ctx.lineTo(sx+2*s,wy-16*s);ctx.lineTo(sx+1*s,wy-9*s);ctx.closePath();ctx.fill();
    }
  }
}
function drawItems(){
  var i;
  /* finis */
  var fsx=finishX-cam.x;
  if(fsx>-60&&fsx<VW+80){
    var fy=groundY(finishX)-cam.y;
    ctx.fillStyle='#e8eef5';ctx.fillRect(fsx-1.6,fy-66,3.2,66);
    var wave=Math.sin(tick/12)*2;
    for(var r2=0;r2<5;r2++)for(var c2=0;c2<5;c2++){
      ctx.fillStyle=((r2+c2)%2===0)?'#20242c':'#f4f7fb';
      ctx.fillRect(fsx+2+c2*5.4,fy-64+r2*5.4+wave*(c2/5),5.4,5.4);
    }
    var fg=ctx.createRadialGradient(fsx,fy-34,4,fsx,fy-34,64);
    fg.addColorStop(0,'rgba(255,209,102,.34)');fg.addColorStop(1,'rgba(255,209,102,0)');
    ctx.fillStyle=fg;ctx.beginPath();ctx.arc(fsx,fy-34,64,0,6.3);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.92)';ctx.font='950 10px system-ui';ctx.textAlign='center';
    ctx.fillText('FINIS',fsx+14,fy-70);ctx.textAlign='left';
  }
  for(i=0;i<coins.length;i++){
    var it=coins[i];
    if(it.got)continue;
    var sx=it.x-cam.x,sy=it.y-cam.y;
    if(sx<-26||sx>VW+26)continue;
    var bob=Math.sin(tick/16+it.ph)*2.6,w=4.2+Math.abs(Math.cos(tick/22+it.ph))*3.4;
    ctx.fillStyle='rgba(255,209,102,.2)';
    ctx.beginPath();ctx.arc(sx,sy+bob,10.5,0,6.3);ctx.fill();
    ctx.fillStyle='#c98a12';
    ctx.beginPath();ctx.ellipse(sx,sy+bob,w+1.1,10,0,0,6.3);ctx.fill();
    ctx.fillStyle='#ffd166';
    ctx.beginPath();ctx.ellipse(sx,sy+bob,w,8.8,0,0,6.3);ctx.fill();
    ctx.fillStyle='#fff3c4';
    ctx.beginPath();ctx.ellipse(sx-w*0.32,sy+bob-2,w*0.26,4.2,0,0,6.3);ctx.fill();
  }
  for(i=0;i<obs.length;i++){
    var o=obs[i],ox=o.x-cam.x,oy=o.y-cam.y;
    if(ox<-30||ox>VW+30)continue;
    ctx.fillStyle='rgba(0,0,0,.2)';
    ctx.beginPath();ctx.ellipse(ox,oy+2,o.r*0.9,3.2,0,0,6.3);ctx.fill();
    if(o.type==='cone'){
      ctx.fillStyle='#e0442e';
      ctx.beginPath();ctx.moveTo(ox,oy-o.r*2.1);ctx.lineTo(ox+o.r,oy);ctx.lineTo(ox-o.r,oy);ctx.closePath();ctx.fill();
      ctx.fillStyle='#f4f7fb';ctx.fillRect(ox-o.r*0.62,oy-o.r*1.1,o.r*1.24,o.r*0.42);
      ctx.fillStyle='#b02a1a';ctx.fillRect(ox-o.r*1.1,oy-2.4,o.r*2.2,3.4);
    }else{
      ctx.fillStyle='#7d8492';
      ctx.beginPath();ctx.moveTo(ox-o.r,oy);ctx.lineTo(ox-o.r*0.6,oy-o.r);ctx.lineTo(ox+o.r*0.2,oy-o.r*1.25);
      ctx.lineTo(ox+o.r,oy-o.r*0.62);ctx.lineTo(ox+o.r,oy);ctx.closePath();ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.25)';
      ctx.beginPath();ctx.moveTo(ox-o.r*0.6,oy-o.r);ctx.lineTo(ox+o.r*0.2,oy-o.r*1.25);ctx.lineTo(ox+o.r*0.1,oy-o.r*0.6);ctx.closePath();ctx.fill();
    }
  }
}
function drawWheel(x,y,spin){
  ctx.save();ctx.translate(x,y);ctx.rotate(spin);
  ctx.fillStyle='#1b1b21';ctx.beginPath();ctx.arc(0,0,WR,0,6.3);ctx.fill();
  ctx.strokeStyle='#3a3a44';ctx.lineWidth=2.2;ctx.beginPath();ctx.arc(0,0,WR-1.5,0,6.3);ctx.stroke();
  ctx.strokeStyle='#aeb6c4';ctx.lineWidth=1.1;
  for(var k=0;k<8;k++){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(k*0.785)*5.4,Math.sin(k*0.785)*5.4);ctx.stroke()}
  ctx.fillStyle='#cdd4de';ctx.beginPath();ctx.arc(0,0,1.9,0,6.3);ctx.fill();
  ctx.restore();
}
function drawBike(){
  var p=curPal();
  var sx=bike.x-cam.x,sy=bike.y-cam.y;
  var gy=groundY(bike.x)-cam.y;
  var airGap=clamp((gy-sy-11)/70,0,1);
  ctx.fillStyle='rgba(0,0,0,'+(0.26*(1-airGap*0.72)).toFixed(2)+')';
  ctx.beginPath();ctx.ellipse(sx+2,gy+2,20*(1-airGap*0.3),4.6,0,0,6.3);ctx.fill();
  var ca=Math.cos(bike.a),sa=Math.sin(bike.a);
  var i,wp=[];
  for(i=0;i<2;i++){
    var L=WHEELL[i];
    wp.push({x:sx+L.x*ca-L.y*sa,y:sy+L.x*sa+L.y*ca});
  }
  drawWheel(wp[0].x,wp[0].y,bike.wheelSpin);
  ctx.save();ctx.translate(sx,sy);ctx.rotate(bike.a);
  var crank=bike.wheelSpin*0.32;
  /* rangka BMX */
  ctx.lineCap='round';
  ctx.strokeStyle='#1e4f8f';ctx.lineWidth=2.6;
  ctx.beginPath();
  ctx.moveTo(-13,4);ctx.lineTo(0,-2);ctx.lineTo(-6,-10);ctx.closePath();
  ctx.moveTo(0,-2);ctx.lineTo(11,-12);
  ctx.moveTo(-6,-10);ctx.lineTo(11,-12);
  ctx.moveTo(11,-12);ctx.lineTo(13,4);
  ctx.stroke();
  ctx.strokeStyle='#3f8ae0';ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(-13,4);ctx.lineTo(0,-2);ctx.lineTo(-6,-10);ctx.closePath();
  ctx.moveTo(0,-2);ctx.lineTo(11,-12);
  ctx.moveTo(-6,-10);ctx.lineTo(11,-12);
  ctx.moveTo(11,-12);ctx.lineTo(13,4);
  ctx.stroke();
  /* sadel & setang */
  ctx.fillStyle='#20242c';rr(ctx,-9.6,-12.4,7,3.4,1.6);ctx.fill();
  ctx.strokeStyle='#d8dee8';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(11,-12);ctx.lineTo(9,-18);ctx.lineTo(3,-19.4);ctx.stroke();
  ctx.beginPath();ctx.moveTo(11,-12);ctx.lineTo(13.4,-17.6);ctx.lineTo(7.6,-19.4);ctx.stroke();
  ctx.fillStyle='#20242c';ctx.beginPath();ctx.arc(3,-19.4,1.7,0,6.3);ctx.fill();
  ctx.beginPath();ctx.arc(9,-18,1.7,0,6.3);ctx.fill();
  /* crank + pedal */
  ctx.strokeStyle='#c9d2de';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(Math.cos(crank)*5.2,Math.sin(crank)*5.2-2);ctx.lineTo(-Math.cos(crank)*5.2,-Math.sin(crank)*5.2-2);ctx.stroke();
  /* pembalap */
  ctx.strokeStyle='#2b3a55';ctx.lineWidth=2.6;
  ctx.beginPath();ctx.moveTo(Math.cos(crank)*5.2,Math.sin(crank)*5.2-2);ctx.lineTo(-1.4,-11);ctx.stroke();
  ctx.beginPath();ctx.moveTo(-Math.cos(crank)*5.2,-Math.sin(crank)*5.2-2);ctx.lineTo(1.6,-11);ctx.stroke();
  var jg=ctx.createLinearGradient(0,-26,0,-12);
  jg.addColorStop(0,'#ffd166');jg.addColorStop(1,'#f0a020');
  ctx.fillStyle=jg;rr(ctx,-2.6,-26,8.4,15,3.6);ctx.fill();
  ctx.fillStyle='#e0442e';rr(ctx,-2.6,-26,8.4,4.4,2.2);ctx.fill();
  ctx.strokeStyle='#ffca7a';ctx.lineWidth=2.4;
  ctx.beginPath();ctx.moveTo(1,-24);ctx.lineTo(8,-19);ctx.stroke();
  ctx.beginPath();ctx.moveTo(4,-24);ctx.lineTo(11,-18.6);ctx.stroke();
  ctx.fillStyle='#f4c39a';ctx.beginPath();ctx.arc(3.4,-29,4.6,0,6.3);ctx.fill();
  ctx.fillStyle='#2f7ad6';
  ctx.beginPath();ctx.arc(3.4,-30,5.4,Math.PI*1.0,Math.PI*2.05);ctx.fill();
  ctx.fillRect(6.4,-31.6,4.6,2.6);
  ctx.fillStyle='#123a63';ctx.beginPath();ctx.arc(3.4,-30,5.4,Math.PI*1.0,Math.PI*1.5);ctx.fill();
  ctx.restore();
  drawWheel(wp[1].x,wp[1].y,bike.wheelSpin);
  /* jejak debu saat melaju */
  if(bike.gas&&bike.onGround&&Math.abs(bike.vx)>1.4&&Math.random()<0.5){
    ctx.fillStyle='rgba(200,200,190,.5)';
    ctx.beginPath();ctx.arc(wp[0].x-4+rnd(-3,3),gy-2+rnd(-3,1),rnd(1.6,3.4),0,6.3);ctx.fill();
  }
}
function drawPops(){
  ctx.textAlign='center';
  var i;
  for(i=0;i<pops.length;i++){
    var p=pops[i],a=clamp(p.life/p.max,0,1);
    ctx.globalAlpha=a;ctx.font='900 13px system-ui';
    ctx.lineWidth=3.2;ctx.strokeStyle='rgba(0,0,0,.8)';
    ctx.strokeText(p.t,p.x-cam.x,p.y-cam.y);
    ctx.fillStyle=p.c;ctx.fillText(p.t,p.x-cam.x,p.y-cam.y);
    ctx.globalAlpha=1;
  }
  ctx.textAlign='left';
}
function draw(){
  ctx.setTransform(PX,0,0,PX,0,0);
  ctx.clearRect(0,0,VW,VH);
  drawSky();
  drawTerrain();
  drawProps();
  drawItems();
  drawBike();
  drawPops();
  /* panel info */
  ctx.fillStyle='rgba(6,20,30,.44)';rr(ctx,9,VH-24,116,15,7);ctx.fill();
  var sp=Math.min(1,Math.abs(bike.vx)/MAXV);
  ctx.fillStyle='#ffd166';rr(ctx,11,VH-22,112*sp,11,5);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.92)';ctx.font='900 7px system-ui';
  ctx.fillText('KECEPATAN '+Math.round(Math.abs(bike.vx)*6)+' KM/J',13,VH-13);
  ctx.fillStyle='rgba(6,20,30,.44)';rr(ctx,VW-118,VH-24,109,15,7);ctx.fill();
  var pr=clamp(bike.x/finishX,0,1);
  ctx.fillStyle='#7ce0a3';rr(ctx,VW-116,VH-22,105*pr,11,5);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.92)';
  ctx.fillText('FINIS '+Math.floor(pr*100)+'%',VW-112,VH-13);
  if(!bike.onGround&&bike.air>6){
    ctx.fillStyle='rgba(255,209,102,.94)';ctx.font='950 12px system-ui';ctx.textAlign='center';
    ctx.fillText('UDARA '+(bike.air/60).toFixed(1)+' dtk',VW/2,24);ctx.textAlign='left';
  }
}

/* ══════════ LOOP ══════════ */
function step(){
  tick++;
  var i;
  if(state==='play'){
    if(bike.jumpCd>0)bike.jumpCd--;
    phys();
    if(state!=='play')return;
    collect();
    hitObs();
    if(state!=='play')return;
    ensureItems(bike.x+1500);
    timeLeft-=1/60;
    if(timeLeft<=0){timeLeft=0;fail('Waktu habis! Kamu belum sampai garis finis.');return}
    if(timeLeft<5.05&&Math.abs(timeLeft*60-Math.round(timeLeft*60))<0.02&&Math.round(timeLeft*60)%60===0)sfx.tick();
    var hp=headPoint();
    if(hp.y>groundY(hp.x)+1){
      fail(bike.onGround?'Kepala pembalap menyentuh tanah.':'Mendarat terbalik! Roda harus mendarat lebih dulu.');
      return;
    }
    if(bike.x>=finishX){win();return}
    chainSet(Math.min(1,Math.abs(bike.vx)/MAXV),bike.gas||bike.brake||Math.abs(bike.vx)>0.9);
  }else chainSet(0,false);
  if(bannerT&&tick-bannerT>96)hideBanner();
  for(i=pops.length-1;i>=0;i--){pops[i].y-=0.45;pops[i].life--;if(pops[i].life<=0)pops.splice(i,1)}
  bike.bounce*=0.92;
  var tx=bike.x-VW*0.34,ty=bike.y-VH*0.56;
  cam.x+=(tx-cam.x)*0.17;
  cam.y+=(ty-cam.y)*0.09;
  cam.y=clamp(cam.y,-300,240);
  if(tick%10===0)hud();
}
var last=0,acc=0,FIXED=1000/60;
function loop(now){
  requestAnimationFrame(loop);
  if(!last)last=now;
  var dt=now-last;last=now;
  if(dt>120)dt=120;
  acc+=dt;
  var g=0;
  while(acc>=FIXED&&g<5){step();acc-=FIXED;g++}
  if(g>=5)acc=0;
  draw();
}

/* ══════════ KONTROL ══════════ */
function hold(id,on,off){
  var el=$(id);if(!el)return;
  el.addEventListener('pointerdown',function(e){e.preventDefault();ensureAC();el.classList.add('active');on()},{passive:false});
  var up=function(){el.classList.remove('active');if(off)off()};
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('pointerleave',up);
  el.addEventListener('contextmenu',function(e){e.preventDefault()});
}
function tap(id,fn){
  var el=$(id);if(!el)return;
  el.addEventListener('pointerdown',function(e){e.preventDefault();ensureAC();el.classList.add('active');fn()},{passive:false});
  var up=function(){el.classList.remove('active')};
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('pointerleave',up);
  el.addEventListener('contextmenu',function(e){e.preventDefault()});
}
function bind(){
  hold('bGas',function(){if(state!=='play')return;bike.gas=true;bike.brake=false},function(){bike.gas=false});
  hold('bBrake',function(){if(state!=='play')return;bike.brake=true;bike.gas=false},function(){bike.brake=false});
  tap('bJump',function(){doJump()});
  tap('pauseB',function(){if(state==='play')pause();else if(state==='pause')resumeState()});
  $('ov').addEventListener('click',function(e){
    var b=(e.target&&e.target.closest)?e.target.closest('[data-act]'):null;
    if(!b)return;
    var a=b.getAttribute('data-act');
    ensureAC();sfx.click();
    if(a==='start')startLevel(sel);
    else if(a==='lv'){var n=parseInt(b.getAttribute('data-lv'),10)||1;if(n<=PROG.unlocked){sel=n;startLevel(n)}else menu()}
    else if(a==='help')help();
    else if(a==='back')menu();
    else if(a==='resume')resumeState();
    else if(a==='menu')menu();
    else if(a==='retry')startLevel(level);
    else if(a==='next'){
      if(level<LEVELS.length)startLevel(level+1);else menu();
    }
  });
  var mb=$('muteB');
  mb.addEventListener('click',function(){
    muted=!muted;
    if(master)master.gain.value=muted?0:0.5;
    if(muted)chainStop();
    mb.textContent=muted?'🔇':'🔊';
  });
  D.addEventListener('keydown',function(e){
    ensureAC();
    var k=(e.key||'').toLowerCase();
    if(k==='arrowright'||k==='d'){if(state==='play'){bike.gas=true;bike.brake=false;e.preventDefault()}}
    else if(k==='arrowleft'||k==='a'){if(state==='play'){bike.brake=true;bike.gas=false;e.preventDefault()}}
    else if(k===' '||k==='arrowup'||k==='w'){e.preventDefault();doJump()}
    else if(k==='r'){if(state==='play'||state==='dead'||state==='pause')startLevel(level)}
    else if(k==='p'){if(state==='play')pause();else if(state==='pause')resumeState()}
    else if(k==='enter'){if(state==='menu'||state==='dead')startLevel(level)}
    else if(k==='m'){if(mb)mb.click()}
  },{passive:false});
  D.addEventListener('keyup',function(e){
    var k=(e.key||'').toLowerCase();
    if(k==='arrowright'||k==='d')bike.gas=false;
    else if(k==='arrowleft'||k==='a')bike.brake=false;
  });
  D.addEventListener('visibilitychange',function(){if(D.hidden&&state==='play')pause()});
  if(window.addEventListener)window.addEventListener('resize',function(){fit()});
}

/* ══════════ BOOT ══════════ */
fit();bakeProps();bind();
(function(){
  level=clamp(PROG.unlocked,1,LEVELS.length);sel=level;
  DIFF=level;SEED=LEVELS[level-1].seed;
  TERR.length=0;finishX=LEVELS[level-1].len;
  levelTime=LEVELS[level-1].time;timeLeft=levelTime;
  reset(60);cam.x=0;cam.y=0;hud();menu();
})();
if(typeof window!=='undefined'){
  window.__BB={
    get s(){return{state:state,tick:tick,level:level,x:+bike.x.toFixed(1),y:+bike.y.toFixed(1),vx:+bike.vx.toFixed(2),
      vy:+bike.vy.toFixed(2),a:+bike.a.toFixed(3),av:+bike.av.toFixed(3),onGround:bike.onGround,air:+bike.air.toFixed(1),
      coins:coinsGot,coinTotal:coinTotal,score:score,meters:Math.floor(bike.x/8),time:+timeLeft.toFixed(2),
      finishX:finishX,reason:overReason,stars:getStars(level),unlocked:PROG.unlocked,obs:obs.length}},
    bike:bike,
    step:function(n){n=n||1;for(var i=0;i<n;i++)step()},
    draw:draw,menu:menu,startLevel:startLevel,help:help,pause:pause,resume:resumeState,
    gas:function(v){bike.gas=!!v;if(v)bike.brake=false},
    brake:function(v){bike.brake=!!v;if(v)bike.gas=false},
    jump:doJump,
    groundY:groundY,slopeAt:slopeAt,terrainAtI:terrainAtI,
    headPoint:headPoint,
    setSeed:function(s){SEED=s;TERR.length=0;reset(60);coins.length=0;obs.length=0;coinTotal=0;nextCoinX=220;nextObsX=560;lastObsX=-9999;ensureItems(bike.x+1500)},
    flatTerrain:function(h){h=h||190;TERR.length=0;for(var i=0;i<9000;i++)TERR[i]=h;coins.length=0;obs.length=0;coinTotal=0;coinsGot=0;nextCoinX=999999;nextObsX=999999;lastObsX=-9999},
    forceCoin:function(x,y){coins.push({x:x,y:y,got:false,ph:0});coinTotal++},
    forceObs:function(x,r,t){obs.push({x:x,y:groundY(x),r:r||10,type:t||'rock'})},
    teleport:function(x,y){bike.x=x;bike.y=(y===undefined?groundY(x)-WR-6:y);bike.vx=0;bike.vy=0;bike.a=0;bike.av=0},
    setCoin:function(got,total){coinsGot=got;coinTotal=total;hud()},
    setFinish:function(x){finishX=x},
    obsList:function(){return obs},
    setTime:function(t){timeLeft=t},
    setLevelTime:function(t){levelTime=t},
    prog:PROG,
    state:function(){return state},
    level:function(){return level},
    sel:function(){return sel},
    setSel:function(n){sel=n},
    timeLeft:function(){return timeLeft},
    coinTotal:function(){return coinTotal},
    saveProg:saveProg,
    resetProg:function(){PROG={unlocked:1,stars:{},best:{}};saveProg()},
    unlockAll:function(){PROG.unlocked=LEVELS.length;saveProg()}
  };
}
if(D.readyState==='complete'||D.readyState==='interactive')setTimeout(fit,60);else D.addEventListener('DOMContentLoaded',fit);
if(window.setTimeout)setTimeout(function(){fit();draw()},260);
requestAnimationFrame(loop);
})();
</script>
<script>
/* usanagi-tap-fast: tombol balas SEKETIKA saat jari menyentuh, bukan saat jari diangkat —
   supaya ambang tekan-lama WhatsApp (~0,5 dtk) tidak pernah tercapai sehingga menu
   "Hapus/Teruskan" tidak sempat muncul. Klik asli sesudahnya dimatikan agar tidak dobel. */
(function(){var D=document,sup=false,syn=false,PAD=/(btn|button|key|pad|tab|chip|cell|tile|card|lvt|opt|choice|pick|cmd|ctl|num|digit)/i;
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
button,[role="button"],a,.btn,.key,.pad,.tab,.lvt,.chip,.cell,.tile,.card{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;touch-action:manipulation}
canvas{touch-action:none}
</style>
<!-- usanagi-polish -->
<style>
*{-webkit-tap-highlight-color:transparent;text-rendering:optimizeLegibility}
button,[role="button"],.btn,.key,.pad,a,.lvt,.ped{-webkit-user-select:none;user-select:none;transition:transform .07s ease,filter .16s ease,box-shadow .22s ease}
button:active,[role="button"]:active,.btn:active,.key:active,.pad:active,.lvt:active,.ped:active{transform:translateY(1px) scale(.985);filter:brightness(1.07)}
canvas,svg,img{-webkit-user-drag:none;user-select:none}
::selection{background:rgba(255,209,102,.35)}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-thumb{background:rgba(255,209,102,.3);border-radius:99px}
::-webkit-scrollbar-track{background:transparent}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation-duration:.001ms!important}}
html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
html::after{content:"";position:fixed;inset:0;z-index:9;pointer-events:none;background-image:radial-gradient(122% 82% at 16% -12%,rgba(255,255,255,.07),rgba(255,255,255,0) 58%),radial-gradient(132% 112% at 92% 118%,rgba(0,0,0,.22),rgba(0,0,0,0) 62%)}
.ped,.sbtn,.mb,.lvt{box-shadow:inset 0 2px 0 rgba(255,255,255,.18),inset 0 -3px 5px rgba(0,0,0,.35),0 4px 0 rgba(0,0,0,.38),0 8px 16px rgba(0,0,0,.28)!important}
.ovCard{box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 18px 40px rgba(0,0,0,.55),0 2px 0 rgba(0,0,0,.45)!important}
.stage{box-shadow:inset 0 0 0 2px rgba(255,255,255,.2),inset 0 -8px 20px rgba(0,0,0,.2),0 16px 34px rgba(0,0,0,.3)!important}
.stage canvas{filter:saturate(1.06) contrast(1.03)}
/* tombol kepala (🔊/⏸) tetap bisa disentuh walau lapisan menu/jeda terbuka */
#muteB,#pauseB{position:relative;z-index:9;touch-action:manipulation}
</style>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return

  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🚲', key: reactionKey } }).catch(() => {})

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
                messageText: 'Usanagi Umi AI BMX Boy 🚲',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'usanagi-ai-bmxboy-2026',
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

handler.help = ['bmxboy', 'bmx', 'sepeda', 'bmxgame']
handler.tags = ['game']
handler.command = /^(bmxboy|bmx|sepeda|bmxgame)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Game BMX Boy Usanagi Umi AI - sepeda lintas medan, trik udara, 10 level'

export default handler
