
'use strict'

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#0d1b2a">
<title>Usanagi Umi AI Hill Racer</title>
<style>
:root{--text:#f2f6ff;--dim:#93a2b8;--go:#4ad07a;--fuel:#ffb020;--coin:#ffd166;--dirt:#8a5a2b}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;-webkit-user-drag:none}
html,body{min-height:100%;overscroll-behavior:none;background:radial-gradient(760px 430px at 50% -8%,#1c2f47 0%,#0a1220 58%,#05080e 100%);color:var(--text);font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;align-items:center;padding:max(9px,env(safe-area-inset-top)) max(9px,env(safe-area-inset-right)) max(11px,env(safe-area-inset-bottom)) max(9px,env(safe-area-inset-left));overflow-x:hidden;touch-action:manipulation}
.app{width:min(100%,560px);margin:auto}
.cab{position:relative;width:100%;background:linear-gradient(180deg,#20303f,#0d141d);border:1px solid #33465a;border-radius:20px;padding:10px;box-shadow:0 30px 80px #000c,inset 0 1px 0 #ffffff10}
.head{display:flex;align-items:center;justify-content:space-between;gap:9px;background:#0b1119;border:1px solid #2b3d50;border-radius:13px;padding:8px 9px;margin-bottom:8px}
.brand{display:flex;align-items:center;gap:9px;min-width:0}
.logo{width:40px;height:40px;flex:none;display:grid;place-items:center;border-radius:11px;background:linear-gradient(150deg,#3b5265,#17222c);border:1px solid #d8a63c;color:#ffd166;font:900 19px system-ui;box-shadow:0 4px 0 #0a0f15,inset 0 1px 0 #ffffff1a,0 0 14px #ffb02033}
.brandText{min-width:0}
.title{font-size:16px;font-weight:900;letter-spacing:.6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:linear-gradient(180deg,#fff4d2,#ffc247 58%,#c98a12);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;filter:drop-shadow(0 1px 0 #00000080)}
.sub{margin-top:2px;color:var(--dim);font-size:8px;letter-spacing:.34px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mb{width:38px;height:38px;flex:none;border:1px solid #33465a;border-radius:10px;background:linear-gradient(180deg,#26374a,#131b24);color:#eaf2ff;font-size:16px;box-shadow:0 3px 0 #0a0f15}
.hud{display:flex;align-items:center;gap:6px;flex-wrap:wrap;background:#0a0f16;border:1px solid #22323f;border-radius:12px;padding:6px 7px;margin-bottom:8px}
.hs{display:flex;align-items:center;gap:4px;padding:3px 6px;background:#101a24;border:1px solid #2b4054;border-radius:8px}
.hs b{font-size:6.4px;letter-spacing:.12em;color:var(--dim)}
.hs span{font:900 11px system-ui;color:var(--coin)}
.fuelWrap{display:flex;align-items:center;gap:5px;flex:1 1 120px;min-width:104px}
.fuelWrap b{font-size:6.4px;letter-spacing:.14em;color:var(--dim)}
.fuelBar{position:relative;flex:1;height:11px;border-radius:6px;background:#241705;border:1px solid #4a3a12;overflow:hidden;box-shadow:inset 0 2px 4px #000a}
.fuelBar i{position:absolute;inset:0 auto 0 0;width:100%;background:linear-gradient(180deg,#ffe08a,#ffb020 60%,#c07000);transition:width .12s linear}
.fuelBar.low i{background:linear-gradient(180deg,#ff9a7a,#e0442e 60%,#8a1a0f);animation:fp .6s infinite}
@keyframes fp{0%,100%{filter:brightness(1)}50%{filter:brightness(1.5)}}
.stage{position:relative;width:100%;aspect-ratio:480/296;border:1px solid #3c5570;border-radius:14px;overflow:hidden;background:#08101a;box-shadow:inset 0 10px 26px #000c,0 0 0 1px #d8a63c1f,0 10px 30px #0008}
.stage canvas{display:block;width:100%;height:100%;touch-action:none;user-select:none}
.banner{position:absolute;left:0;right:0;top:30%;text-align:center;pointer-events:none;opacity:0;transition:opacity .3s ease;font:950 18px system-ui;letter-spacing:.08em;text-shadow:0 3px 0 #00000090,0 0 18px #ffb02080;color:#fff}
.banner.show{opacity:1}
.banner small{display:block;margin-top:4px;font:800 8px system-ui;letter-spacing:.18em;color:#ffe0a0}
.ov{position:absolute;inset:0;z-index:7;display:grid;place-items:center;background:#04070acc;backdrop-filter:blur(9px);padding:12px;border-radius:20px;transition:opacity .22s ease}
.ov.hide{opacity:0;pointer-events:none}
.ovCard{width:min(94%,364px);max-height:calc(100% - 8px);overflow:auto;-webkit-overflow-scrolling:touch;text-align:center;padding:15px 13px;border:1px solid #3a5064;border-radius:16px;background:linear-gradient(180deg,#1c2735,#0c1219);box-shadow:0 20px 46px #0009,inset 0 1px 0 #ffffff14;animation:pop .26s ease}
@keyframes pop{from{transform:scale(.9);opacity:0}to{transform:scale(1);opacity:1}}
.ovIcon{font-size:27px;line-height:1}
.ovTitle{margin-top:6px;font-size:20px;font-weight:950}
.ovText{margin-top:6px;color:var(--dim);font-size:9px;line-height:1.55}
.ovStats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:11px}
.ovStats div{padding:6px 5px;border:1px solid #2b3d50;border-radius:9px;background:#0a1119}
.ovStats b{display:block;font-size:12px;color:var(--coin)}
.ovStats span{display:block;margin-top:3px;font-size:6px;letter-spacing:.12em;color:var(--dim);text-transform:uppercase}
.ovBtns{display:grid;gap:6px;margin-top:11px}
.sbtn{min-height:38px;border:1px solid #3a5064;border-radius:10px;background:linear-gradient(180deg,#26374a,#131b24);color:#eef;font:900 8.2px system-ui;letter-spacing:.06em;box-shadow:0 4px 0 #0a0f15,inset 0 1px 0 #ffffff14;touch-action:manipulation}
.sbtn.go{border-color:#63d68c;background:linear-gradient(180deg,#3fbf6a,#1c6b38);color:#06210f;box-shadow:0 4px 0 #0d2a17,inset 0 1px 0 #ffffff3d}
.sbtn:active{transform:translateY(3px);box-shadow:0 1px 0 #0a0f15}
.pedals{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:9px}
.ped{min-height:74px;border:1px solid #3a5064;border-radius:16px;background:linear-gradient(180deg,#2b3d50,#141d26);color:#eef;font:900 12px system-ui;letter-spacing:.1em;box-shadow:0 6px 0 #0a0f15,inset 0 1px 0 #ffffff1c,inset 0 -9px 20px #00000066;touch-action:none;user-select:none;display:grid;place-items:center;gap:2px}
.ped small{font-size:6.4px;letter-spacing:.16em;color:#9fb2c8}
.ped.gas{border-color:#63d68c;background:radial-gradient(circle at 40% 26%,#54d684,#1f8a4a 58%,#0d3d22);color:#04220f;box-shadow:0 6px 0 #0a3320,inset 0 2px 0 #ffffff55}
.ped.gas small{color:#0a3320}
.ped.brake{border-color:#e08a7a;background:radial-gradient(circle at 40% 26%,#ff9d8a,#c03a28 58%,#6b1409);color:#fff;box-shadow:0 6px 0 #4a0f06,inset 0 2px 0 #ffffff55}
.ped.brake small{color:#ffd8d0}
.ped.active{transform:translateY(4px);box-shadow:0 2px 0 #0a0f15;filter:brightness(1.15)}
.foot{display:flex;justify-content:space-between;gap:8px;margin-top:7px;padding:0 3px;color:#6b7d92;font-size:6.4px}
.foot kbd{padding:2px 4px;border:1px solid #2b3d50;border-radius:4px;background:#0a1119;color:#9fb2c8;font:700 6px system-ui}
@media(max-width:380px){body{padding:7px}.cab{padding:8px}.title{font-size:14px}.logo{width:35px;height:35px}.ped{min-height:64px}}
@media(min-width:720px){body{padding-top:18px;padding-bottom:18px}.cab{padding:13px}}
</style>
</head>
<body>
<div class="app">
  <div class="cab">
    <div class="head">
      <div class="brand">
        <div class="logo">🚙</div>
        <div class="brandText"><div class="title">HILL RACER</div><div class="sub">BUKIT LIAR • USANAGI UMI AI ARCADE</div></div>
      </div>
      <button class="mb" id="muteB" type="button" aria-label="Suara">🔊</button>
    </div>

    <div class="hud">
      <div class="hs"><b>JARAK</b><span id="dist">0 m</span></div>
      <div class="hs"><b>KOIN</b><span id="coins">0</span></div>
      <div class="fuelWrap"><b>BAHAN BAKAR</b><div class="fuelBar" id="fuelBar"><i id="fuelFill"></i></div></div>
      <div class="hs"><b>REKOR</b><span id="best">0 m</span></div>
    </div>

    <div class="stage" id="stage">
      <canvas id="cv"></canvas>
      <div class="banner" id="banner"></div>
    </div>

    <div class="pedals">
      <button class="ped brake" id="bBrake" type="button">⏪ REM<small>MUNDUR / NOSEBLEED</small></button>
      <button class="ped gas" id="bGas" type="button">⏩ GAS<small>MAJU / PUTAR DI UDARA</small></button>
    </div>

    <div class="foot"><span>Gas di udara = putar ke belakang (backflip) • Rem di udara = putar ke depan</span><span><kbd>←</kbd><kbd>→</kbd> <kbd>R</kbd> <kbd>P</kbd> <kbd>M</kbd></span></div>

    <div class="ov" id="ov">
      <div class="ovCard">
        <div class="ovIcon" id="ovIcon">🚙</div>
        <h2 class="ovTitle" id="ovTitle">HILL RACER</h2>
        <p class="ovText" id="ovText">Bukit liar tak berujung. Sejauh apa kamu bisa jalan?</p>
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
try{LOW=(navigator.hardwareConcurrency||4)<=2}
catch(e){}
function fit(forceOne){
  var host=cv.parentNode||D.body;
  var cssW=Math.max(150,Math.round(host.clientWidth||((window.innerWidth||360)-26)));
  var dpr=Math.min(2.5,(window.devicePixelRatio)||1);
  var need=cssW*dpr/VW;
  /* Layar HP DPI tinggi: bulatkan KE ATAS supaya kanvas tidak ikut diperbesar (gambar lebih tajam).
     HP lama (LOW) tetap 1x, dan ada penurun mutu otomatis di loop() kalau frame terasa lambat. */
  PX=clamp(need<=1?1:Math.ceil(need),1,LOW?1:2);
  if(forceOne)PX=1;
  cv.width=Math.round(VW*PX);cv.height=Math.round(VH*PX);
  skyCache=null;vigCache=null;
}

/* ══════════ AUDIO ══════════ */
var AC=null,master=null,muted=false,engineGain=null,engineOsc=null,engineOsc2=null;
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
function engineStart(){
  if(engineOsc||muted)return;var a=ensureAC();if(!a)return;
  try{
    engineOsc=a.createOscillator();engineOsc.type='sawtooth';engineOsc.frequency.value=60;
    engineOsc2=a.createOscillator();engineOsc2.type='square';engineOsc2.frequency.value=30;
    engineGain=a.createGain();engineGain.gain.value=0.0;
    var fl=a.createBiquadFilter();fl.type='lowpass';fl.frequency.value=520;
    engineOsc.connect(fl);engineOsc2.connect(fl);fl.connect(engineGain);engineGain.connect(bus());
    engineOsc.start();engineOsc2.start();
  }catch(e){}
}
function engineSet(rate,on){
  if(engineGain&&AC){try{engineGain.gain.value=(muted||!on)?0:(0.018+rate*0.03);engineOsc.frequency.value=52+rate*130;engineOsc2.frequency.value=26+rate*66}catch(e){}}
}
function engineStop(){if(engineGain){try{engineGain.gain.value=0}catch(e){}}}
var sfx={
  coin:function(){tone(1180,1560,0.07,0.05,'square');tone(1560,2100,0.08,0.035,'square',0.06)},
  fuel:function(){tone(520,900,0.1,0.05,'triangle');tone(900,1300,0.12,0.04,'triangle',0.1)},
  crash:function(){noise(0.5,0.34,1600,90);tone(180,50,0.5,0.09,'sawtooth')},
  land:function(){noise(0.1,0.16,600,110)},
  flip:function(){var s=[784,988,1175,1568],i;for(i=0;i<s.length;i++)tone(s[i],s[i]*1.01,0.12,0.05,'square',i*0.07)},
  empty:function(){tone(200,90,0.4,0.06,'sawtooth')},
  click:function(){tone(640,880,0.05,0.04,'square')},
  go:function(){tone(440,880,0.16,0.05,'square');tone(880,1320,0.2,0.045,'square',0.16)},
  warn:function(){tone(880,660,0.16,0.05,'square');tone(660,880,0.16,0.05,'square',0.2)}
};

/* ══════════ MEDAN ══════════ */
var DX=7,TERR=[];
function hsh(n){var s=Math.sin(n*127.1+11.7)*43758.5453;return s-Math.floor(s)}
function vn(x){var i=Math.floor(x),f=x-i,a=hsh(i),b=hsh(i+1);f=f*f*(3-2*f);return a+(b-a)*f}
var SEED=1;
function terrainAtI(i){
  if(i<0)i=0;
  if(i<13)return 180;                    /* lintasan datar untuk start (dua roda di tanah rata) */
  var amp=1+Math.min(i*0.00040,1.25);
  if(i<34)amp*=clamp((i-13)/21,0.06,1);  /* makin jauh makin liar */
  var h=180;
  h+=(vn(i*0.0165+SEED*3.1)-0.5)*46*amp;
  h+=(vn(i*0.049+SEED*7.7)-0.5)*30*amp;
  h+=(vn(i*0.115+SEED*1.9)-0.5)*9*amp;
  h+=(vn(i*0.31+SEED*5.3)-0.5)*3*amp;
  var m=i%230;
  if(m<12)h-=m*3.4*amp;                       /* tanjakan pemicu lompatan */
  return h;
}
var MAXSTEP=6;      /* batas kemiringan: 6 satuan per 7 satuan = ~40 derajat */
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
  return a+(b-a)*t;
}
function slopeAt(x){
  var f=x/DX;if(f<0)f=0;
  var i=Math.floor(f);ensureTerrain(i+2);
  return (TERR[i+1]-TERR[i])/DX;
}
function normalAt(x,out){
  /* y layar ke bawah: tangent=(1,s)/L ; normal mengarah ke atas = (s,-1)/L */
  var s=slopeAt(x),l=Math.sqrt(1+s*s);
  out.nx=s/l;out.ny=-1/l;out.tx=1/l;out.ty=s/l;out.s=s;
  return out;
}
var N1={nx:0,ny:-1,tx:1,ty:0,s:0};

/* ══════════ MOBIL ══════════ */
var WR=9,WHEELL=[{x:-15,y:5},{x:15,y:5}];
var MASS=1,INERTIA=14,GRAV=0.34,K=1.1,DAMP=1.95,FRIC=2.2,MU=0.9,MAXV=7.5;
var W_TARGET=0.9,ROLL_DRAG=0.015,FN_MAX=1.2,AV_GROUND=0.07,AV_AIR=0.22,SUB=4;
var car={x:0,y:0,vx:0,vy:0,a:0,av:0,fuel:100,onGround:true,gas:false,brake:false,spin:0,air:0,airRot:0,wheelSpin:0,bounce:0,w:0};
var prevA=0,subPrevA=0;
function wrapAng(v){while(v>Math.PI)v-=Math.PI*2;while(v<-Math.PI)v+=Math.PI*2;return v}
function reset(x){
  ensureTerrain(Math.ceil(x/DX)+4);
  car.x=x;car.y=groundY(x)-WR-6;car.vx=0;car.vy=0;car.a=0;car.av=0;car.fuel=100;car.onGround=true;car.air=0;car.airRot=0;car.spin=0;car.w=0;car.wheelSpin=0;
  prevA=0;subPrevA=0;
}
function headPoint(){
  var ca=Math.cos(car.a),sa=Math.sin(car.a),lx=-3,ly=-17;
  return{x:car.x+lx*ca-ly*sa,y:car.y+lx*sa+ly*ca};
}
function crashPoint(){
  var ca=Math.cos(car.a),sa=Math.sin(car.a),lx=16,ly=-13;
  return{x:car.x+lx*ca-ly*sa,y:car.y+lx*sa+ly*ca};
}
function subStep(dt){
  var i,ca=Math.cos(car.a),sa=Math.sin(car.a);
  var FX=0,FY=GRAV*MASS,torque=0;
  var drive=(car.gas?1:0)-(car.brake?1:0);
  var touched=0;
  /* roda punya kecepatan putar sendiri; gas memutarnya, slip yang mendorong mobil */
  var targetW=drive>0?W_TARGET:(drive<0?-W_TARGET*0.66:0);
  car.w+=(targetW-car.w)*Math.min(0.6,0.05*dt*2);
  ensureTerrain(Math.ceil(car.x/DX)+6);
  for(i=0;i<2;i++){
    var L=WHEELL[i];
    var rx=L.x*ca-L.y*sa,ry=L.x*sa+L.y*ca;
    var wx=car.x+rx,wy=car.y+ry;
    var pen=(wy+WR)-groundY(wx);
    if(pen>0){
      normalAt(wx,N1);
      var nx=N1.nx,ny=N1.ny,tx=N1.tx,ty=N1.ty;
      /* peredam memakai kecepatan BODI saja: memakai kecepatan titik kontak (yang mengandung
         av*rx) menimbulkan umpan-balik positif -> mobil memantul selamanya */
      var vn=car.vx*nx+car.vy*ny,vt=car.vx*tx+car.vy*ty;
      var Fn=K*pen-DAMP*vn;
      if(Fn<0)Fn=0;if(Fn>FN_MAX)Fn=FN_MAX;
      FX+=nx*Fn;FY+=ny*Fn;torque+=(rx*ny*Fn-ry*nx*Fn);
      var Ft,lim=MU*Fn;
      if(drive!==0){
        var slip=vt-car.w*WR;              /* selisih putaran roda vs tanah */
        Ft=-slip*FRIC;
        if(Ft>lim)Ft=lim;if(Ft<-lim)Ft=-lim;
      }else{
        Ft=-vt*ROLL_DRAG;                  /* meluncur bebas, hambatan kecil */
      }
      FX+=tx*Ft;FY+=ty*Ft;torque+=(rx*ty*Ft-ry*tx*Ft);
      touched=1;
    }
  }
  car.onGround=!!touched;
  if(car.onGround){
    car.air=0;
  }
  if(!touched){
    /* kontrol putaran hanya berlaku saat benar-benar melayang, bukan saat terpantul kecil */
    if(car.air>5)car.av+=drive*0.007*dt;
    car.av*=Math.pow(0.997,dt);
  }else{
    car.av*=Math.pow(0.80,dt);
  }
  car.vx+=(FX/MASS)*dt;car.vy+=(FY/MASS)*dt;car.av+=(torque/INERTIA)*dt;
  var avMax=touched?AV_GROUND:AV_AIR;
  car.av=clamp(car.av,-avMax,avMax);
  car.vx=clamp(car.vx,-MAXV,MAXV);
  car.vy=clamp(car.vy,-14,14);
  car.x+=car.vx*dt;car.y+=car.vy*dt;car.a+=car.av*dt;
  car.wheelSpin+=(car.w*7.5)*dt;
  if(!touched){car.air+=dt;car.w+=(0-car.w)*Math.min(0.4,0.02*dt)}
  /* putaran dihitung per sub-langkah: memakai satu pembanding untuk 4 sub-langkah
     membuat tercatat ~4x lebih besar dari putaran sebenarnya */
  car.airRot+=wrapAng(car.a-subPrevA);
  subPrevA=car.a;
  return touched;
}
function phys(){
  var wasAir=!car.onGround;
  /* nilai udara disimpan SEBELUM subStep: di dalamnya car.air di-reset begitu roda menyentuh,
     jadi memeriksa car.air setelahnya membuat bonus TRICK/AIR TIME tidak pernah aktif */
  var airBefore=car.air,rotBefore=car.airRot;
  for(var si=0;si<SUB;si++)subStep(1/SUB);
  if(car.onGround&&wasAir&&airBefore>8){
    sfx.land();
    landPuff();
    var r=Math.abs(rotBefore);
    if(r>5.4){
      var flips=Math.floor(r/6.15);
      addScore(260*(flips||1));
      showBanner('TRICK!','PUTARAN UDARA +'+(260*(flips||1)));
      sfx.flip();
    }else if(airBefore>34){
      addScore(90);
      showBanner('AIR TIME','+90 • '+Math.round(airBefore/6)+' detik melayang');
    }
    car.air=0;car.airRot=0;
  }
  if(car.a>Math.PI*2)car.a-=Math.PI*2;
  if(car.a<-Math.PI*2)car.a+=Math.PI*2;
  prevA=car.a;
  if(car.onGround)car.air=0;
}

/* ══════════ ITEM ══════════ */
var items=[],nextCoinX=260,nextFuelX=620,score=0,coinsGot=0,dist=0,best=0,state='menu',tick=0,bannerT=0,bannerTxt='';
try{best=parseInt(localStorage.getItem('usanagi-hillracer-best')||'0',10)||0}catch(e){best=0}
function ensureItems(xTo){
  while(nextCoinX<xTo){
    var n=3+Math.floor(Math.random()*3),i;
    for(i=0;i<n;i++){
      var cx=nextCoinX+i*22,cy=groundY(cx)-27-Math.sin(i/(n-1||1)*Math.PI)*21;
      items.push({x:cx,y:cy,type:'coin',got:false,ph:Math.random()*6});
    }
    nextCoinX+=rnd(150,290);
  }
  while(nextFuelX<xTo){
    items.push({x:nextFuelX,y:groundY(nextFuelX)-16,type:'fuel',got:false,ph:0});
    nextFuelX+=rnd(520,760);
  }
}
function collect(){
  var i;
  for(i=0;i<items.length;i++){
    var it=items[i];
    if(it.got)continue;
    if(Math.abs(it.x-car.x)<20&&Math.abs(it.y-car.y)<30){
      it.got=true;
      if(it.type==='coin'){coinsGot++;score+=25;sfx.coin();popup(it.x,it.y,'+25','#ffd166')}
      else{car.fuel=Math.min(100,car.fuel+42);sfx.fuel();popup(it.x,it.y,'+BAKAR','#8ef0a8')}
      hud();
    }
  }
  var cut=0;
  for(i=0;i<items.length;i++){if(items[i].got)cut++;else break}
  if(cut>60)items.splice(0,cut);
}
var pops=[];
function popup(x,y,t,c){pops.push({x:x,y:y,t:t,c:c,life:44,max:44})}
function addScore(v){score+=v;hud()}
function showBanner(t,s){bannerTxt=t;var b=$('banner');b.innerHTML=t+(s?'<small>'+s+'</small>':'');b.classList.add('show');bannerT=tick}
function hideBanner(){var b=$('banner');if(b)b.classList.remove('show')}

/* ══════════ HUD ══════════ */
var hc={dist:-1,coin:-1,fuel:-1,best:-1};
function hud(){
  var dm=Math.floor(Math.max(0,car.x-60)/8);
  if(hc.dist!==dm){hc.dist=dm;var e=$('dist');if(e)e.textContent=dm+' m'}
  if(hc.coin!==coinsGot){hc.coin=coinsGot;var c=$('coins');if(c)c.textContent=coinsGot}
  var f=Math.max(0,Math.round(car.fuel));
  if(hc.fuel!==f){hc.fuel=f;var fi=$('fuelFill'),fb=$('fuelBar');
    if(fi)fi.style.width=clamp(car.fuel/100,0,1)*100+'%';
    if(fb)fb.className='fuelBar'+(car.fuel<26?' low':'');
  }
  if(hc.best!==best){hc.best=best;var b=$('best');if(b)b.textContent=best+' m'}
}
function ovShow(icon,title,text,stats,buttons){
  var o=$('ov');if(!o)return;
  $('ovIcon').textContent=icon;$('ovTitle').textContent=title;$('ovText').innerHTML=text;
  var st=$('ovStats');st.innerHTML='';
  if(stats&&stats.length){for(var i=0;i<stats.length;i++)st.innerHTML+='<div><b>'+stats[i][1]+'</b><span>'+stats[i][0]+'</span></div>';st.style.display='grid'}
  else st.style.display='none';
  var bs=$('ovBtns');bs.innerHTML='';
  for(var j=0;j<buttons.length;j++){var b=buttons[j];bs.innerHTML+='<button class="sbtn'+(b.cls?' '+b.cls:'')+'" type="button" data-act="'+b.act+'">'+b.label+'</button>'}
  o.classList.remove('hide');
}
function ovHide(){var o=$('ov');if(o)o.classList.add('hide')}
function menu(){
  state='menu';hideBanner();
  ovShow('🚙','HILL RACER',
    'Bukit liar tanpa ujung. Kamu punya <b>bahan bakar terbatas</b> — cari jerigen <b>hijau</b> di jalan.<br><br>Makin jauh, bukit makin liar. Lakukan <b>backflip</b> untuk skor besar.<br><br><b>GAS</b> menaikkan bukit dan memutar ke belakang di udara. <b>REM</b> mengerem dan memutar ke depan. Mendarat terbalik = <b>tumbang</b>.',
    [['REKOR',best+' m'],['KOIN','×25'],['BAKAR','42%']],
    [{act:'start',label:'▶ MULAI BALAP',cls:'go'},{act:'help',label:'❔ CARA MAIN'}]);
}
function help(){
  ovShow('📖','CARA MAIN',
    '<b>⏩ GAS</b> — maju. Di udara, gas membuat mobil berputar ke <b>belakang</b> (backflip).<br><b>⏪ REM</b> — mengerem/mundur. Di udara, rem memutar ke <b>depan</b>.<br><br>Jangan sampai <b>kepala pengemudi menyentuh tanah</b> — itu tumbang.<br>Bahan bakar terus berkurang. Jerigen hijau menambah 42%.<br>Setiap bunyi <b>peringatan</b> berarti bahan bakar di bawah 25%.<br><br>Jarak 1 meter = 8 satuan. Koin +25 poin, putaran udara +260.',
    null,[{act:'back',label:'◀ KEMBALI'}]);
}
function pause(){
  if(state!=='play')return;
  state='pause';engineSet(0,false);
  ovShow('⏸️','JEDA','Balap ditunda.',[['JARAK',Math.floor(car.x/8)+' m'],['KOIN',coinsGot],['SKOR',score]],
    [{act:'resume',label:'▶ LANJUT',cls:'go'},{act:'restart',label:'↻ ULANG'},{act:'menu',label:'⏹ MENU'}]);
}
function resumeState(){if(state!=='pause')return;state='play';ovHide()}
var overReason='';
function gameOver(reason){
  state='dead';engineSet(0,false);sfx.crash();crashPuff();overReason=reason;
  var dm=Math.floor(Math.max(0,car.x-60)/8);
  var isBest=dm>best;
  if(isBest){best=dm;try{localStorage.setItem('usanagi-hillracer-best',String(best))}catch(e){}}
  hc.best=-1;hud();
  ovShow('💥','TUMBANG',reason+(isBest?'<br><br>🏅 <b>REKOR BARU!</b>':'<br><br>Rekor kamu: <b>'+best+' m</b>'),
    [['JARAK',dm+' m'],['KOIN',coinsGot],['SKOR',score]],
    [{act:'restart',label:'↻ COBA LAGI',cls:'go'},{act:'menu',label:'⏹ MENU'}]);
}
function start(){
  SEED=Math.floor(Math.random()*9999)+1;
  TERR.length=0;items.length=0;pops.length=0;dust.length=0;
  vis.sag=0;vis.tilt=0;vis.prev=0;
  nextCoinX=260;nextFuelX=620;score=0;coinsGot=0;dist=0;tick=0;
  reset(60);
  ensureItems(2400);
  cam.x=0;cam.y=0;
  hc.dist=-1;hc.coin=-1;hc.fuel=-1;
  car.gas=false;car.brake=false;
  state='play';
  ovHide();hud();
  ensureAC();engineStart();
  sfx.go();
  showBanner('GO!','JANGAN BERHENTI MENGGAS');
}

/* ══════════ GAMBAR ══════════ */
var cam={x:0,y:0},trees=[],clouds=[],birds=[],dust=[];
var skyCache=null,vigCache=null,SUNX=VW*0.76,SUNY=45;
function bakeProps(){
  trees.length=0;clouds.length=0;birds.length=0;dust.length=0;
  var i;
  for(i=0;i<86;i++)trees.push({x:i*114+rnd(-42,42),s:rnd(0.72,1.42),t:i%3,h:rnd(0.86,1.18)});
  for(i=0;i<26;i++)clouds.push({x:i*168+rnd(-64,64),y:rnd(10,108),s:rnd(0.6,1.7)});
  for(i=0;i<7;i++)birds.push({x:rnd(0,1240),y:rnd(24,84),s:rnd(0.55,1.15),ph:Math.random()*6.3});
}
function skyGrad(){
  if(!skyCache){
    var g=ctx.createLinearGradient(0,0,0,VH);
    g.addColorStop(0,'#0a2344');g.addColorStop(0.2,'#1b487c');g.addColorStop(0.45,'#3d7cb4');
    g.addColorStop(0.68,'#7cb6d8');g.addColorStop(0.87,'#cfe7f2');g.addColorStop(1,'#eef7f8');
    skyCache=g;
  }
  return skyCache;
}
function drawSun(){
  var g=ctx.createRadialGradient(SUNX,SUNY,2,SUNX,SUNY,124);
  g.addColorStop(0,'rgba(255,251,228,.98)');g.addColorStop(0.1,'rgba(255,242,196,.8)');
  g.addColorStop(0.3,'rgba(255,228,152,.2)');g.addColorStop(1,'rgba(255,222,150,0)');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(SUNX,SUNY,124,0,6.2832);ctx.fill();
  ctx.save();ctx.translate(SUNX,SUNY);ctx.rotate(tick*0.0016);
  var i,a,r2;
  for(i=0;i<12;i++){
    a=i*0.5236;r2=78+Math.sin(tick*0.02+i)*10;
    ctx.fillStyle='rgba(255,247,205,'+(i%2?0.05:0.085)+')';
    ctx.beginPath();ctx.moveTo(0,0);
    ctx.lineTo(Math.cos(a-0.055)*r2,Math.sin(a-0.055)*r2);
    ctx.lineTo(Math.cos(a+0.055)*r2,Math.sin(a+0.055)*r2);
    ctx.closePath();ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle='#fffceb';ctx.beginPath();ctx.arc(SUNX,SUNY,16.5,0,6.2832);ctx.fill();
}
function drawBirds(){
  ctx.strokeStyle='rgba(22,42,64,.48)';ctx.lineWidth=1.3;
  var i;
  for(i=0;i<birds.length;i++){
    var b=birds[i],bx=((b.x-cam.x*0.22)%1240+1240)%1240-120;
    var by=b.y+Math.sin(tick*0.02+b.ph)*3.4,f=Math.sin(tick*0.15+b.ph)*2.6*b.s;
    ctx.beginPath();
    ctx.moveTo(bx-5.6*b.s,by+f);
    ctx.quadraticCurveTo(bx-2.4*b.s,by-2.8*b.s,bx,by+0.4*b.s);
    ctx.quadraticCurveTo(bx+2.4*b.s,by-2.8*b.s,bx+5.6*b.s,by+f);
    ctx.stroke();
  }
}
function drawSunFlare(){
  var dx=VW*0.5-SUNX,dy=VH*0.56-SUNY,i,a;
  for(i=1;i<=3;i++){
    a=0.05/i;
    ctx.fillStyle='rgba(255,236,190,'+a.toFixed(3)+')';
    ctx.beginPath();ctx.arc(SUNX+dx*(i*0.34),SUNY+dy*(i*0.34),10+i*7,0,6.2832);ctx.fill();
  }
}
function drawSky(){
  ctx.fillStyle=skyGrad();ctx.fillRect(0,0,VW,VH);
  drawSun();
  /* kabut cakrawala */
  var hz=ctx.createLinearGradient(0,VH*0.36,0,VH*0.8);
  hz.addColorStop(0,'rgba(214,236,246,0)');hz.addColorStop(0.55,'rgba(216,238,246,.44)');hz.addColorStop(1,'rgba(206,232,242,0)');
  ctx.fillStyle=hz;ctx.fillRect(0,VH*0.34,VW,VH*0.5);
  /* pegunungan 4 lapis (makin jauh makin pucat) */
  var par=[0.1,0.2,0.34,0.54],col=['#6995bb','#527ba4','#3b5f86','#294767'];
  var amp=[30,34,28,22],y0=[0.4,0.46,0.53,0.6],i,k;
  for(i=0;i<4;i++){
    ctx.fillStyle=col[i];
    ctx.beginPath();ctx.moveTo(-6,VH);
    for(k=-6;k<=VW+6;k+=10){
      var wx=(cam.x*par[i]+k)*0.013;
      ctx.lineTo(k,VH*y0[i]+Math.sin(wx*(1.25+i*0.33)+i*1.7)*amp[i]*0.5+Math.sin(wx*0.52+i*2.1)*amp[i]*0.32);
    }
    ctx.lineTo(VW+6,VH);ctx.closePath();ctx.fill();
  }
  drawBirds();
  /* awan bervolume */
  for(i=0;i<clouds.length;i++){
    var c=clouds[i],cs=c.s,wy=c.y-Math.sin(tick*0.004+c.x)*2;
    var sx=c.x-cam.x*0.55;
    sx=((sx%(VW+340))+VW+340)%(VW+340)-170;
    ctx.fillStyle='rgba(118,148,178,.15)';
    ctx.beginPath();ctx.ellipse(sx,wy+6.4*cs,30*cs,8*cs,0,0,6.2832);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.88)';
    ctx.beginPath();
    ctx.arc(sx,wy,12*cs,0,6.2832);ctx.arc(sx+15*cs,wy+2.6*cs,9.4*cs,0,6.2832);
    ctx.arc(sx-14*cs,wy+3.4*cs,8.6*cs,0,6.2832);ctx.arc(sx+5*cs,wy-6*cs,8.2*cs,0,6.2832);
    ctx.fill();
    ctx.fillStyle='rgba(150,180,205,.22)';
    ctx.beginPath();ctx.ellipse(sx+2*cs,wy+7*cs,22*cs,3.4*cs,0,0,6.2832);ctx.fill();
  }
}
function drawTerrain(){
  var step=4,sx,i,n,tops=[];
  for(sx=-20;sx<=VW+20;sx+=step)tops.push(groundY(cam.x+sx)-cam.y);
  n=tops.length;
  /* badan tanah */
  ctx.beginPath();ctx.moveTo(-24,VH+40);
  for(i=0;i<n;i++)ctx.lineTo(-20+i*step,tops[i]);
  ctx.lineTo(VW+24,VH+40);ctx.closePath();
  var g=ctx.createLinearGradient(0,VH*0.2,0,VH+40);
  g.addColorStop(0,'#845a36');g.addColorStop(0.28,'#6d4726');g.addColorStop(0.7,'#4b2f1a');g.addColorStop(1,'#281709');
  ctx.fillStyle=g;ctx.fill();
  ctx.save();
  ctx.beginPath();ctx.moveTo(-24,VH+40);
  for(i=0;i<n;i++)ctx.lineTo(-20+i*step,tops[i]);
  ctx.lineTo(VW+24,VH+40);ctx.closePath();ctx.clip();
  /* garis strata batu mengikuti bukit */
  var s,y;
  for(s=0;s<4;s++){
    ctx.strokeStyle='rgba(255,224,186,'+(0.05+s*0.014)+')';ctx.lineWidth=1.7;
    ctx.beginPath();
    for(i=0;i<n;i++){
      y=tops[i]+14+s*24+Math.sin(i*0.55+s*1.3)*4;
      if(i)ctx.lineTo(-20+i*step,y);else ctx.moveTo(-20+i*step,y);
    }
    ctx.stroke();
  }
  /* butiran kerikil di dalam tanah */
  for(i=0;i<40;i++){
    var ix=Math.floor((cam.x+i*17+((i*7)%13))/44);
    var bx=(ix*44-cam.x)%(VW+90),by=groundY(cam.x+bx)-cam.y;
    ctx.fillStyle='rgba(36,22,10,.30)';
    ctx.beginPath();ctx.arc(bx,by+9+((ix*5)%26),1.4+((ix*7)%3)*0.7,0,6.2832);ctx.fill();
  }
  ctx.restore();
  /* hamparan rumput */
  ctx.beginPath();ctx.moveTo(-24,VH+40);
  for(i=0;i<n;i++)ctx.lineTo(-20+i*step,tops[i]);
  for(i=n-1;i>=0;i--)ctx.lineTo(-20+i*step,tops[i]+8);
  ctx.closePath();
  var g2=ctx.createLinearGradient(0,VH*0.2,0,VH);
  g2.addColorStop(0,'#7dd35c');g2.addColorStop(0.4,'#54ad38');g2.addColorStop(0.75,'#37841f');g2.addColorStop(1,'#215c12');
  ctx.fillStyle=g2;ctx.fill();
  /* sorot matahari di bibir rumput */
  ctx.strokeStyle='rgba(219,255,196,.5)';ctx.lineWidth=1.5;
  ctx.beginPath();
  for(i=0;i<n;i++){
    y=tops[i]+0.7;
    if(i)ctx.lineTo(-20+i*step,y);else ctx.moveTo(-20+i*step,y);
  }
  ctx.stroke();
  /* bilah rumput */
  ctx.strokeStyle='rgba(28,78,18,.34)';ctx.lineWidth=1.1;
  ctx.beginPath();
  for(i=0;i<n;i+=3){
    var gx=-20+i*step,gy=tops[i]+2.4;
    ctx.moveTo(gx,gy);ctx.lineTo(gx+1.7,gy-4.6-Math.abs(Math.sin(i*1.7))*2.6);
  }
  ctx.stroke();
}
function drawTrees(){
  var i;
  for(i=0;i<trees.length;i++){
    var t=trees[i],sx=t.x-cam.x;
    sx=((sx%9800)+9800)%9800-320;
    if(sx<-56||sx>VW+56)continue;
    var wy=groundY(t.x)-cam.y;
    if(wy<-96||wy>VH+80)continue;
    var s=t.s*t.h,k;
    /* bayangan pohon di tanah */
    ctx.fillStyle='rgba(18,30,10,.2)';
    ctx.beginPath();ctx.ellipse(sx+5*s,wy+1,14*s,3.4*s,0,0,6.2832);ctx.fill();
    /* batang kayu bergradasi */
    var tg=ctx.createLinearGradient(sx-2.6*s,0,sx+2.6*s,0);
    tg.addColorStop(0,'#2b1e10');tg.addColorStop(0.45,'#573d21');tg.addColorStop(1,'#281b0e');
    ctx.fillStyle=tg;
    ctx.fillRect(sx-2.2*s,wy-17*s,4.4*s,17*s);
    if(t.t===0){
      /* cemara berlapis */
      for(k=0;k<3;k++){
        var yy=wy-12*s-k*8.4*s,w=(13-k*2.4)*s,h=11*s;
        var pg=ctx.createLinearGradient(sx-w,yy-h,sx+w,yy);
        pg.addColorStop(0,'#1c5622');pg.addColorStop(0.45,'#3f8f39');pg.addColorStop(1,'#134418');
        ctx.fillStyle=pg;
        ctx.beginPath();ctx.moveTo(sx,yy-h-3.4*s);ctx.lineTo(sx+w,yy);ctx.lineTo(sx-w,yy);ctx.closePath();ctx.fill();
        ctx.fillStyle='rgba(196,244,174,.18)';
        ctx.beginPath();ctx.moveTo(sx,yy-h-3.4*s);ctx.lineTo(sx+2.4*s,yy);ctx.lineTo(sx-6.6*s,yy);ctx.closePath();ctx.fill();
      }
    }else if(t.t===1){
      /* pohon rimbun */
      var rg=ctx.createRadialGradient(sx-5*s,wy-27*s,2,sx,wy-21*s,18*s);
      rg.addColorStop(0,'#6cb84e');rg.addColorStop(0.55,'#3d8236');rg.addColorStop(1,'#1c4d22');
      ctx.fillStyle=rg;
      ctx.beginPath();
      ctx.arc(sx,wy-22*s,11.5*s,0,6.2832);ctx.arc(sx-8.6*s,wy-16*s,8.2*s,0,6.2832);
      ctx.arc(sx+8.6*s,wy-16.4*s,8.6*s,0,6.2832);ctx.arc(sx+1.6*s,wy-30*s,7.6*s,0,6.2832);
      ctx.fill();
      ctx.fillStyle='rgba(206,248,178,.16)';
      ctx.beginPath();ctx.arc(sx-4*s,wy-26*s,6*s,0,6.2832);ctx.fill();
    }else{
      /* bongkahan batu berumput */
      var bg2=ctx.createLinearGradient(sx-11*s,wy-15*s,sx+11*s,wy);
      bg2.addColorStop(0,'#a3abb5');bg2.addColorStop(0.55,'#717983');bg2.addColorStop(1,'#434952');
      ctx.fillStyle=bg2;
      ctx.beginPath();
      ctx.moveTo(sx-11*s,wy);ctx.quadraticCurveTo(sx-8*s,wy-13*s,sx-1*s,wy-14*s);
      ctx.quadraticCurveTo(sx+8*s,wy-13*s,sx+11*s,wy);ctx.closePath();ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.17)';
      ctx.beginPath();ctx.moveTo(sx-6.4*s,wy-10*s);ctx.quadraticCurveTo(sx-1*s,wy-13.6*s,sx+4*s,wy-12*s);
      ctx.quadraticCurveTo(sx,wy-8.6*s,sx-6.4*s,wy-10*s);ctx.closePath();ctx.fill();
      ctx.fillStyle='#3f8f36';
      ctx.beginPath();ctx.ellipse(sx+2*s,wy-13.4*s,6.2*s,2.4*s,0,0,6.2832);ctx.fill();
    }
  }
}
function drawItems(){
  var i;
  for(i=0;i<items.length;i++){
    var it=items[i];
    if(it.got)continue;
    var sx=it.x-cam.x,sy=it.y-cam.y;
    if(sx<-34||sx>VW+34)continue;
    var gy=groundY(it.x)-cam.y;
    if(it.type==='coin'){
      var bob=Math.sin(tick/16+it.ph)*3.2,cy=sy+bob;
      var w=4.6+Math.abs(Math.cos(tick/22+it.ph))*3.8;
      /* bayangan + pendar emas */
      ctx.fillStyle='rgba(30,40,12,.16)';
      ctx.beginPath();ctx.ellipse(sx,gy+1,6,2,0,0,6.2832);ctx.fill();
      var gg=ctx.createRadialGradient(sx,cy,1,sx,cy,17);
      gg.addColorStop(0,'rgba(255,214,102,.35)');gg.addColorStop(1,'rgba(255,214,102,0)');
      ctx.fillStyle=gg;ctx.beginPath();ctx.arc(sx,cy,17,0,6.2832);ctx.fill();
      /* sisi tebal koin */
      ctx.fillStyle='#a86d0c';
      ctx.beginPath();ctx.ellipse(sx,cy,w+1.4,10.6,0,0,6.2832);ctx.fill();
      var cg=ctx.createLinearGradient(sx-w,cy-10,sx+w,cy+10);
      cg.addColorStop(0,'#fff0b8');cg.addColorStop(0.4,'#ffd166');cg.addColorStop(0.75,'#e0a52a');cg.addColorStop(1,'#b8790c');
      ctx.fillStyle=cg;
      ctx.beginPath();ctx.ellipse(sx,cy,w,9.4,0,0,6.2832);ctx.fill();
      if(w>3.4){
        ctx.strokeStyle='rgba(150,96,10,.5)';ctx.lineWidth=1;
        ctx.beginPath();ctx.ellipse(sx,cy,w*0.66,6.4,0,0,6.2832);ctx.stroke();
        ctx.fillStyle='rgba(255,249,216,.9)';ctx.font='900 7px system-ui';ctx.textAlign='center';
        ctx.fillText('$',sx,cy+2.6);ctx.textAlign='left';
      }
      ctx.fillStyle='rgba(255,255,255,.55)';
      ctx.beginPath();ctx.ellipse(sx-w*0.32,cy-3.2,Math.max(0.8,w*0.24),3.6,0,0,6.2832);ctx.fill();
    }else{
      var bob2=Math.sin(tick/14)*1.8,cy2=sy+bob2;
      ctx.fillStyle='rgba(30,40,12,.16)';
      ctx.beginPath();ctx.ellipse(sx,gy+1,8,2.4,0,0,6.2832);ctx.fill();
      var fg=ctx.createRadialGradient(sx,cy2,2,sx,cy2,19);
      fg.addColorStop(0,'rgba(74,208,122,.32)');fg.addColorStop(1,'rgba(74,208,122,0)');
      ctx.fillStyle=fg;ctx.beginPath();ctx.arc(sx,cy2,19,0,6.2832);ctx.fill();
      /* jerigen 3D */
      var kg=ctx.createLinearGradient(sx-9,0,sx+9,0);
      kg.addColorStop(0,'#1d5730');kg.addColorStop(0.42,'#4ad07a');kg.addColorStop(0.72,'#2aa356');kg.addColorStop(1,'#155c2c');
      ctx.fillStyle=kg;rr(ctx,sx-8.4,cy2-12.6,16.8,23.4,3.2);ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.32)';ctx.lineWidth=1;
      rr(ctx,sx-7.2,cy2-11.4,14.4,20.6,2.6);ctx.stroke();
      ctx.fillStyle='#dbe8dd';rr(ctx,sx-3.4,cy2-15.6,6.8,3.6,1.2);ctx.fill();
      ctx.strokeStyle='#0d381c';ctx.lineWidth=2.4;
      ctx.beginPath();ctx.arc(sx-1,cy2-11.4,3.6,Math.PI*1.05,Math.PI*1.95);ctx.stroke();
      ctx.fillStyle='#f6fff8';ctx.font='900 8px system-ui';ctx.textAlign='center';
      ctx.fillText('42',sx,cy2+3.4);ctx.textAlign='left';
      ctx.fillStyle='rgba(255,255,255,.42)';
      rr(ctx,sx-6.6,cy2-10.4,2.4,17.6,1.2);ctx.fill();
    }
  }
}
/* ══════════ MOBIL (bayangan berlapis, ban 3D, bodi bervolume) ══════════ */
var vis={sag:0,tilt:0,prev:0};
function carShadow(sx,sy){
  var gy=groundY(car.x)-cam.y+2.6;
  var air=clamp((gy-sy)/95,0,1);
  var w=25+air*13,h=6.2+air*4.4;
  var g=ctx.createRadialGradient(sx,gy,1,sx,gy,w);
  g.addColorStop(0,'rgba(10,16,8,'+(0.40-air*0.2).toFixed(3)+')');
  g.addColorStop(0.5,'rgba(10,16,8,'+(0.24-air*0.13).toFixed(3)+')');
  g.addColorStop(1,'rgba(10,16,8,0)');
  ctx.fillStyle=g;
  ctx.beginPath();ctx.ellipse(sx,gy,w,h,0,0,6.2832);ctx.fill();
}
function drawWheel(wx,wy,rot,far){
  var R=WR-(far?0.5:0);
  ctx.save();ctx.translate(wx,wy);
  ctx.fillStyle='rgba(0,0,0,'+(far?0.3:0.38)+')';
  ctx.beginPath();ctx.arc(0,0,R+1.8,0,6.2832);ctx.fill();
  ctx.rotate(rot);
  /* ban: karet dengan kilau di sisi atas */
  var tg=ctx.createRadialGradient(-R*0.36,-R*0.42,R*0.14,0,0,R*1.02);
  tg.addColorStop(0,far?'#41444c':'#5b5f69');
  tg.addColorStop(0.4,far?'#2b2e35':'#363943');
  tg.addColorStop(0.78,far?'#191b20':'#1d2026');
  tg.addColorStop(1,'#0a0b0e');
  ctx.fillStyle=tg;ctx.beginPath();ctx.arc(0,0,R,0,6.2832);ctx.fill();
  /* kembang ban */
  ctx.strokeStyle='rgba(0,0,0,.6)';ctx.lineWidth=1.5;
  var k,a;
  for(k=0;k<11;k++){
    a=k*0.5712;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a)*(R-0.7),Math.sin(a)*(R-0.7));
    ctx.lineTo(Math.cos(a+0.13)*(R-5.2),Math.sin(a+0.13)*(R-5.2));
    ctx.stroke();
  }
  /* pelek metalik */
  var rg=ctx.createLinearGradient(-R*0.7,-R*0.7,R*0.7,R*0.7);
  if(far){rg.addColorStop(0,'#7d838f');rg.addColorStop(0.5,'#4e525c');rg.addColorStop(1,'#2a2c33')}
  else{rg.addColorStop(0,'#fdfefe');rg.addColorStop(0.26,'#ccd3df');rg.addColorStop(0.52,'#98a0b0');rg.addColorStop(0.78,'#666d7c');rg.addColorStop(1,'#3b3f49')}
  ctx.fillStyle=rg;ctx.beginPath();ctx.arc(0,0,R*0.62,0,6.2832);ctx.fill();
  /* cakram rem */
  ctx.fillStyle=far?'#39404a':'#8b93a1';
  ctx.beginPath();ctx.arc(0,0,R*0.44,0,6.2832);ctx.fill();
  /* jari-jari pelek */
  ctx.fillStyle=far?'#3b3f48':'#aeb6c4';
  for(k=0;k<5;k++){
    ctx.save();ctx.rotate(k*1.2566);
    ctx.beginPath();ctx.moveTo(-1.5,-1.4);ctx.lineTo(1.5,-1.4);ctx.lineTo(1.1,-R*0.6);ctx.lineTo(-1.1,-R*0.6);
    ctx.closePath();ctx.fill();ctx.restore();
  }
  /* mur tengah + baut emas */
  var hg=ctx.createRadialGradient(-1,-1.2,0.4,0,0,3.4);
  hg.addColorStop(0,'#ffffff');hg.addColorStop(0.5,far?'#8b9099':'#d7dce6');hg.addColorStop(1,far?'#3a3d45':'#5f6673');
  ctx.fillStyle=hg;ctx.beginPath();ctx.arc(0,0,R*0.3,0,6.2832);ctx.fill();
  if(!far){
    ctx.fillStyle='#f0c24a';
    for(k=0;k<5;k++){
      ctx.beginPath();
      ctx.arc(Math.cos(k*1.2566)*R*0.42,Math.sin(k*1.2566)*R*0.42,0.95,0,6.2832);
      ctx.fill();
    }
  }
  ctx.restore();
}
function drawExhaust(){
  ctx.fillStyle='#3a4048';rr(ctx,-22.2,2.6,5.4,3.2,1.5);ctx.fill();
  var mg=ctx.createLinearGradient(0,2.4,0,6);
  mg.addColorStop(0,'#b9c1cd');mg.addColorStop(1,'#6b7280');
  ctx.fillStyle=mg;ctx.beginPath();ctx.ellipse(-21.8,4.2,2.5,1.7,0,0,6.2832);ctx.fill();
  ctx.fillStyle='#14161a';ctx.beginPath();ctx.ellipse(-21.8,4.2,1.5,0.9,0,0,6.2832);ctx.fill();
}
function drawBody(){
  /* ---- spoiler belakang ---- */
  ctx.fillStyle='#20242c';
  ctx.beginPath();ctx.moveTo(-15.2,-18.6);ctx.lineTo(-13.6,-18.6);ctx.lineTo(-12.8,-11.4);ctx.lineTo(-14.8,-11.4);ctx.closePath();ctx.fill();
  ctx.fillStyle='#161a20';rr(ctx,-24,-20.6,11.6,3.6,1.7);ctx.fill();
  var sg=ctx.createLinearGradient(0,-20.8,0,-16.8);
  sg.addColorStop(0,'#454d5a');sg.addColorStop(0.55,'#2b313a');sg.addColorStop(1,'#141820');
  ctx.fillStyle=sg;rr(ctx,-23.4,-20.1,10.4,2.7,1.35);ctx.fill();
  ctx.fillStyle='#c6cedb';rr(ctx,-22.8,-19.6,9.2,1,0.5);ctx.fill();
  drawExhaust();
  /* ---- siluet bodi (lengkung roda dilubangi) ---- */
  ctx.beginPath();
  ctx.moveTo(-19,6.4);
  ctx.lineTo(-19,-6.4);
  ctx.quadraticCurveTo(-19,-10.6,-15.4,-11.8);
  ctx.lineTo(-14,-17.6);
  ctx.quadraticCurveTo(-13.4,-18.8,-11.6,-18.8);
  ctx.lineTo(-4.6,-18.8);
  ctx.quadraticCurveTo(-2.8,-18.8,-2,-17.4);
  ctx.lineTo(3.6,-11.6);
  ctx.quadraticCurveTo(4.8,-9.6,7.2,-9.2);
  ctx.lineTo(16.8,-7.8);
  ctx.quadraticCurveTo(21,-7,21,-3.2);
  ctx.lineTo(21,6.4);
  ctx.closePath();
  ctx.moveTo(25.4,5);ctx.arc(15,5,10.4,0,6.2832,true);
  ctx.moveTo(-4.6,5);ctx.arc(-15,5,10.4,0,6.2832,true);
  var bg=ctx.createLinearGradient(0,-19.4,0,8.4);
  bg.addColorStop(0,'#ffb27a');bg.addColorStop(0.14,'#f8653f');bg.addColorStop(0.44,'#d63523');
  bg.addColorStop(0.74,'#9c1c14');bg.addColorStop(1,'#4e0c09');
  ctx.fillStyle=bg;ctx.fill();
  ctx.save();
  ctx.clip();
  /* sorot langit di kap */
  var hl=ctx.createLinearGradient(0,-19,0,-6);
  hl.addColorStop(0,'rgba(255,246,224,.5)');hl.addColorStop(0.6,'rgba(255,220,180,.1)');hl.addColorStop(1,'rgba(255,220,180,0)');
  ctx.fillStyle=hl;
  ctx.beginPath();ctx.moveTo(-16,-18.4);ctx.lineTo(21,-8);ctx.lineTo(21,-2);ctx.lineTo(-16,-12);ctx.closePath();ctx.fill();
  /* garis pinggang emas */
  var gl=ctx.createLinearGradient(-19,0,21,0);
  gl.addColorStop(0,'#7a5a12');gl.addColorStop(0.35,'#ffd977');gl.addColorStop(0.7,'#e0a92c');gl.addColorStop(1,'#8a6410');
  ctx.fillStyle=gl;
  ctx.beginPath();ctx.moveTo(-19,-8.6);ctx.lineTo(21,-4.4);ctx.lineTo(21,-2.9);ctx.lineTo(-19,-7.1);ctx.closePath();ctx.fill();
  /* panel pintu */
  ctx.strokeStyle='rgba(60,8,4,.5)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(7.4,-9.2);ctx.lineTo(6,-2);ctx.moveTo(-9.4,-11.6);ctx.lineTo(-9.8,-2);ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.16)';
  ctx.beginPath();ctx.moveTo(8.2,-9);ctx.lineTo(6.8,-2);ctx.stroke();
  /* kisi ventilasi */
  var v;
  for(v=0;v<3;v++){
    ctx.fillStyle='rgba(24,6,4,.6)';rr(ctx,0.4,-1.4-v*2.6,10,1.7,0.7);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.11)';ctx.fillRect(0.4,-1.5-v*2.6,10,0.4);
  }
  /* nomor balap */
  ctx.save();ctx.rotate(-0.05);
  ctx.fillStyle='rgba(255,255,255,.9)';ctx.font='900 11px system-ui';ctx.textAlign='center';
  ctx.fillText('7',-4.6,3.4);ctx.textAlign='left';ctx.restore();
  /* skirt samping + oklusi bawah */
  ctx.fillStyle='rgba(20,6,4,.55)';rr(ctx,-18,4.2,38,2.6,1.2);ctx.fill();
  var ao=ctx.createLinearGradient(0,1.4,0,7.4);
  ao.addColorStop(0,'rgba(10,2,2,0)');ao.addColorStop(1,'rgba(10,2,2,.62)');
  ctx.fillStyle=ao;ctx.fillRect(-19,1.4,40,6);
  var aoR=ctx.createLinearGradient(-19,0,-8,0);
  aoR.addColorStop(0,'rgba(10,2,2,.48)');aoR.addColorStop(1,'rgba(10,2,2,0)');
  ctx.fillStyle=aoR;ctx.fillRect(-19,-19,11,26);
  /* interior lengkung roda */
  var wg=ctx.createRadialGradient(15,5,6.2,15,5,10.6);
  wg.addColorStop(0,'rgba(6,4,3,.94)');wg.addColorStop(0.72,'rgba(10,6,4,.72)');wg.addColorStop(1,'rgba(10,6,4,0)');
  ctx.fillStyle=wg;ctx.beginPath();ctx.arc(15,5,10.6,0,6.2832);ctx.fill();
  wg=ctx.createRadialGradient(-15,5,6.2,-15,5,10.6);
  wg.addColorStop(0,'rgba(6,4,3,.94)');wg.addColorStop(0.72,'rgba(10,6,4,.72)');wg.addColorStop(1,'rgba(10,6,4,0)');
  ctx.fillStyle=wg;ctx.beginPath();ctx.arc(-15,5,10.6,0,6.2832);ctx.fill();
  ctx.restore();
  /* bibir lengkung roda: kilau logam */
  ctx.strokeStyle='rgba(255,214,140,.32)';ctx.lineWidth=1.4;
  ctx.beginPath();ctx.arc(15,5,10.9,Math.PI*1.12,Math.PI*1.95);ctx.stroke();
  ctx.beginPath();ctx.arc(-15,5,10.9,Math.PI*1.12,Math.PI*1.95);ctx.stroke();
  /* ---- kaca + rangka roller ---- */
  ctx.beginPath();
  ctx.moveTo(-12.6,-17.2);ctx.lineTo(-3.2,-17.2);ctx.lineTo(2.6,-12.4);ctx.lineTo(-12.6,-12.4);ctx.closePath();
  var wgg=ctx.createLinearGradient(-12,-17,3,-11);
  wgg.addColorStop(0,'#2f5f8c');wgg.addColorStop(0.45,'#7db2d6');wgg.addColorStop(0.7,'#a9d3e8');wgg.addColorStop(1,'#3d7099');
  ctx.fillStyle=wgg;ctx.fill();
  ctx.save();ctx.clip();
  ctx.fillStyle='rgba(255,255,255,.3)';
  ctx.beginPath();ctx.moveTo(-11.4,-18);ctx.lineTo(-5.6,-18);ctx.lineTo(-10.6,-11.6);ctx.lineTo(-14,-11.6);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.16)';
  ctx.beginPath();ctx.moveTo(-0.6,-18);ctx.lineTo(2,-18);ctx.lineTo(-1.4,-11.6);ctx.lineTo(-4,-11.6);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(10,30,50,.32)';ctx.fillRect(-14,-13.2,20,2.4);
  ctx.restore();
  ctx.strokeStyle='#1b1f26';ctx.lineWidth=1.7;
  ctx.beginPath();ctx.moveTo(-12.6,-17.2);ctx.lineTo(-3.2,-17.2);ctx.lineTo(2.6,-12.4);ctx.lineTo(-12.6,-12.4);ctx.closePath();ctx.stroke();
  /* rangka roller */
  ctx.strokeStyle='#23272f';ctx.lineWidth=2.9;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-14.2,-11.6);ctx.lineTo(-14,-18.6);ctx.moveTo(-14,-18.6);ctx.lineTo(-1,-18.9);ctx.stroke();
  ctx.strokeStyle='rgba(255,255,255,.22)';ctx.lineWidth=0.9;
  ctx.beginPath();ctx.moveTo(-14.6,-11.8);ctx.lineTo(-14.4,-18.4);ctx.stroke();
  ctx.lineCap='butt';
  /* bar lampu atap */
  ctx.fillStyle='#15181e';rr(ctx,-13.6,-21.6,12.6,3,1.3);ctx.fill();
  var li;
  for(li=0;li<4;li++){
    ctx.fillStyle='rgba(255,238,170,.9)';
    ctx.beginPath();ctx.arc(-12.6+li*3.1,-20.1,1.5,0,6.2832);ctx.fill();
  }
  /* ---- pengemudi ---- */
  var dz=car.gas?0.3:0;
  ctx.fillStyle='#2e3440';rr(ctx,-4.6+dz,-16.4,7.4,6.2,2.4);ctx.fill();
  ctx.fillStyle='#d8342a';
  ctx.beginPath();ctx.moveTo(-1.2+dz,-14.6);ctx.lineTo(3.6+dz,-13.2);ctx.lineTo(2.8+dz,-10.8);ctx.lineTo(-1.6+dz,-12.4);ctx.closePath();ctx.fill();
  var hx=-2.4+dz,hy=-20.2;
  ctx.fillStyle='#e8b98f';
  ctx.beginPath();ctx.arc(hx,hy+0.6,4.7,0,6.2832);ctx.fill();
  var hg2=ctx.createLinearGradient(hx-5,hy-5,hx+5,hy+5);
  hg2.addColorStop(0,'#fff1cf');hg2.addColorStop(0.5,'#ffd166');hg2.addColorStop(1,'#c98a12');
  ctx.fillStyle=hg2;
  ctx.beginPath();ctx.arc(hx,hy,5.2,Math.PI*1,Math.PI*2.02);ctx.fill();
  ctx.fillRect(hx+2.4,hy-2.6,4.4,2.1);
  ctx.fillStyle='rgba(30,64,96,.9)';
  ctx.beginPath();ctx.moveTo(hx+1.4,hy-1.6);ctx.lineTo(hx+5.4,hy-1.4);ctx.lineTo(hx+5,hy+1.6);ctx.lineTo(hx+1.6,hy+1.2);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.34)';
  ctx.beginPath();ctx.moveTo(hx+2,hy-1.2);ctx.lineTo(hx+3.4,hy-1.1);ctx.lineTo(hx+3,hy+1.2);ctx.lineTo(hx+2.2,hy+1.1);ctx.closePath();ctx.fill();
  /* ---- bemper depan krom + lampu ---- */
  var chg=ctx.createLinearGradient(18,-8,23,5);
  chg.addColorStop(0,'#f4f8ff');chg.addColorStop(0.4,'#b0b9c6');chg.addColorStop(0.72,'#77808e');chg.addColorStop(1,'#464d58');
  ctx.strokeStyle=chg;ctx.lineWidth=2.1;ctx.lineCap='round';
  ctx.beginPath();
  ctx.moveTo(19.4,-8.6);ctx.lineTo(22.6,-8.2);ctx.lineTo(22.6,4.6);ctx.lineTo(19.2,5);
  ctx.moveTo(22,1.2);ctx.lineTo(19.6,1.6);
  ctx.stroke();
  ctx.lineCap='butt';
  ctx.fillStyle='rgba(255,238,180,'+(car.gas?0.42:0.26)+')';
  ctx.beginPath();ctx.arc(18.6,-6.2,8.4,0,6.2832);ctx.fill();
  var lg=ctx.createRadialGradient(18.2,-6.8,0.6,18.6,-6.2,3.6);
  lg.addColorStop(0,'#ffffff');lg.addColorStop(0.45,'#ffe9a8');lg.addColorStop(1,'#b58a1e');
  ctx.fillStyle=lg;ctx.beginPath();ctx.arc(18.6,-6.2,3.4,0,6.2832);ctx.fill();
  ctx.fillStyle='rgba(255,249,222,.9)';
  ctx.beginPath();ctx.arc(17.4,-7.2,1.3,0,6.2832);ctx.fill();
  ctx.fillStyle='rgba(255,214,120,.55)';
  ctx.beginPath();ctx.arc(19,-9.6,4,0,6.2832);ctx.fill();
  ctx.fillStyle='#fff3c8';ctx.beginPath();ctx.arc(19,-9.6,1.7,0,6.2832);ctx.fill();
  /* lampu belakang */
  ctx.fillStyle='rgba(255,60,40,.5)';
  ctx.beginPath();ctx.arc(-19.6,-5.6,5,0,6.2832);ctx.fill();
  ctx.fillStyle='#ff5a3c';rr(ctx,-20.6,-7.2,2.4,3.6,1);ctx.fill();
}
function drawCar(){
  var sx=car.x-cam.x,sy=car.y-cam.y;
  var ca=Math.cos(car.a),sa=Math.sin(car.a);
  var vib=(car.gas&&car.onGround)?(Math.random()-0.5)*0.34:0;
  var sag=vis.sag*0.55,tilt=vis.tilt;
  var i,L,rx,ry;
  carShadow(sx,sy);
  /* roda sisi jauh lebih dulu (di belakang bodi, digeser sedikit = kesan ruang) */
  for(i=0;i<2;i++){
    L=WHEELL[i];rx=L.x*ca-L.y*sa;ry=L.x*sa+L.y*ca;
    drawWheel(sx+rx-2.6,sy+ry-1.8,car.wheelSpin*(i===0?0.9:1.1)+0.36,true);
  }
  /* rangka, as, peredam */
  ctx.save();ctx.translate(sx,sy);ctx.rotate(car.a);
  ctx.fillStyle='#0e1014';rr(ctx,-19.5,-2.6,39,7,2.6);ctx.fill();
  ctx.fillStyle='#2b3038';rr(ctx,-16.5,-1.6,33,2.4,1.1);ctx.fill();
  ctx.strokeStyle='#98a1b0';ctx.lineWidth=2.1;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-10.4,-3.4);ctx.lineTo(-15.4,2.4);ctx.moveTo(10.4,-3.4);ctx.lineTo(15.4,2.4);ctx.stroke();
  ctx.strokeStyle='#e8bd57';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(-8.4,-4.6);ctx.lineTo(-13.6,1.4);ctx.moveTo(13.6,-4.6);ctx.lineTo(8.4,1.4);ctx.stroke();
  ctx.lineCap='butt';
  ctx.restore();
  /* bodi (goyangan suspensi + getaran mesin) */
  ctx.save();
  ctx.translate(sx+vib*0.35,sy+sag+vib);
  ctx.rotate(car.a+tilt);
  drawBody();
  ctx.restore();
  /* roda sisi dekat */
  for(i=0;i<2;i++){
    L=WHEELL[i];rx=L.x*ca-L.y*sa;ry=L.x*sa+L.y*ca;
    drawWheel(sx+rx,sy+ry,car.wheelSpin*(i===0?0.9:1.1),false);
  }
}
function drawPops(){
  ctx.textAlign='center';
  var i;
  for(i=0;i<pops.length;i++){
    var p=pops[i],a=clamp(p.life/p.max,0,1);
    ctx.globalAlpha=a;
    ctx.font='900 13px system-ui';
    ctx.lineWidth=3.2;ctx.strokeStyle='rgba(0,0,0,.8)';
    ctx.strokeText(p.t,p.x-cam.x,p.y-cam.y);
    ctx.fillStyle=p.c;ctx.fillText(p.t,p.x-cam.x,p.y-cam.y);
    ctx.globalAlpha=1;
  }
  ctx.textAlign='left';
}
/* ══════════ SUSPENSI TAMPILAN, DEBU, EFEK LAYAR ══════════ */
function visUpdate(){
  var ca=Math.cos(car.a),sa=Math.sin(car.a),i,p=0,touched=0;
  for(i=0;i<2;i++){
    var L=WHEELL[i],rx=L.x*ca-L.y*sa,ry=L.x*sa+L.y*ca;
    var pen=(car.y+ry+WR)-groundY(car.x+rx);
    if(pen>0){p+=pen;touched++}
  }
  var target=(car.onGround&&touched)?clamp(p/Math.max(1,touched),0,3.4):0;
  vis.sag+=(target-vis.sag)*0.24;
  var d=vis.sag-vis.prev;
  vis.prev=vis.sag;
  var tt=car.onGround?clamp(-slopeAt(car.x)*0.1,-0.1,0.1):0;
  vis.tilt+=(clamp(d*0.55,-0.14,0.14)+tt-vis.tilt)*0.28;
}
function wheelWorld(i){
  var ca=Math.cos(car.a),sa=Math.sin(car.a),L=WHEELL[i];
  var rx=L.x*ca-L.y*sa,ry=L.x*sa+L.y*ca;
  return{x:car.x+rx,y:car.y+ry+WR-2};
}
function addDust(x,y,n,sp,rad){
  if(dust.length>150)return;
  var i;
  for(i=0;i<n;i++){
    dust.push({x:x+rnd(-2,2),y:y+rnd(-1.5,1.5),vx:-sp+rnd(-0.4,0.4),vy:-rnd(0.15,0.85),
      r:rnd(rad*0.6,rad*1.7),g:rnd(0.05,0.16),life:1,d:rnd(0.014,0.028)});
  }
}
function spawnDust(){
  if(!car.onGround||Math.abs(car.vx)<0.8)return;
  if(tick%3)return;
  var w=wheelWorld(0);
  addDust(w.x,w.y,1,car.vx*0.18,2.6);
}
function landPuff(){
  var i,w;
  for(i=0;i<2;i++){w=wheelWorld(i);addDust(w.x,w.y,5,rnd(0.2,0.8),3.2)}
}
function crashPuff(){
  var i,w;
  for(i=0;i<2;i++){w=wheelWorld(i);addDust(w.x,w.y,12,rnd(0.4,1.4),4)}
}
function updateDust(){
  var i;
  for(i=dust.length-1;i>=0;i--){
    var d=dust[i];
    d.x+=d.vx;d.y+=d.vy;d.vy*=0.98;d.vy-=d.g*0.02;d.vx*=0.985;
    d.r+=0.11;d.life-=d.d;
    if(d.life<=0||d.x<cam.x-70)dust.splice(i,1);
  }
}
function drawDust(){
  var i;
  for(i=0;i<dust.length;i++){
    var d=dust[i];
    ctx.fillStyle='rgba(206,180,138,'+(d.life*0.5).toFixed(3)+')';
    ctx.beginPath();ctx.arc(d.x-cam.x,d.y-cam.y,d.r,0,6.2832);ctx.fill();
  }
}
function drawSpeedLines(){
  var sp=Math.abs(car.vx)/MAXV;
  if(sp<0.62)return;
  var n=Math.round((sp-0.6)*22),i;
  ctx.strokeStyle='rgba(255,255,255,.16)';ctx.lineWidth=1.3;
  for(i=0;i<n;i++){
    var seed=i*97.3,sy=(seed*7.13+tick*0.6)%VH;
    var lx=((seed*53.7+tick*(6+sp*10))%(VW+160))-80;
    ctx.beginPath();ctx.moveTo(VW+80-lx,sy);ctx.lineTo(VW+80-lx-26-sp*22,sy);ctx.stroke();
  }
}
function drawGrade(){
  if(!vigCache){
    var g=ctx.createRadialGradient(VW/2,VH*0.48,VH*0.3,VW/2,VH*0.5,VH*0.95);
    g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(0.62,'rgba(6,10,18,.12)');g.addColorStop(1,'rgba(4,8,14,.42)');
    vigCache=g;
  }
  ctx.fillStyle=vigCache;ctx.fillRect(0,0,VW,VH);
  var t=ctx.createLinearGradient(0,0,0,VH*0.24);
  t.addColorStop(0,'rgba(255,214,150,.1)');t.addColorStop(1,'rgba(255,214,150,0)');
  ctx.fillStyle=t;ctx.fillRect(0,0,VW,VH*0.24);
}
function draw(){
  ctx.setTransform(PX,0,0,PX,0,0);
  ctx.clearRect(0,0,VW,VH);
  drawSky();
  drawSunFlare();
  drawTerrain();
  drawTrees();
  drawDust();
  drawItems();
  drawCar();
  drawPops();
  drawSpeedLines();
  drawGrade();
  /* indikator kecepatan */
  var sp=Math.min(1,Math.abs(car.vx)/MAXV);
  ctx.fillStyle='rgba(4,10,16,.5)';rr(ctx,10,VH-23,96,13,6.5);ctx.fill();
  ctx.strokeStyle='rgba(255,214,140,.3)';ctx.lineWidth=1;rr(ctx,10,VH-23,96,13,6.5);ctx.stroke();
  var gsp=ctx.createLinearGradient(12,0,94,0);
  gsp.addColorStop(0,'#e8bd57');gsp.addColorStop(0.5,'#7fe07f');gsp.addColorStop(1,'#4ad07a');
  ctx.fillStyle=gsp;rr(ctx,12.5,VH-20.5,91*sp,8,4);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.85)';ctx.font='900 7px system-ui';
  ctx.fillText('KECEPATAN '+Math.round(Math.abs(car.vx)*27)+' KM/J',14,VH-25);
  if(!car.onGround){
    ctx.fillStyle='rgba(255,209,102,.95)';ctx.font='950 12px system-ui';ctx.textAlign='center';
    ctx.fillText('UDARA '+(car.air/60).toFixed(1)+' dtk',VW/2,26);ctx.textAlign='left';
  }
}

/* ══════════ LOOP ══════════ */
function step(){
  tick++;
  if(state==='play'){
    phys();
    collect();
    ensureItems(car.x+1600);
    /* bahan bakar */
    car.fuel-=(car.gas?0.0115:0.0032);
    if(car.fuel<=0){car.fuel=0;gameOver('Bahan bakar habis di tengah bukit.')}
    if(car.fuel<26&&car.fuel>25.9)sfx.warn();
    /* kepala menyentuh tanah = tumbang */
    var hp=headPoint();
    if(hp.y>groundY(hp.x)+2){gameOver('Kepala pengemudi membentur tanah.')}
    var cp=crashPoint();
    if(cp.y>groundY(cp.x)-2&&Math.abs(car.vx)<1.4){gameOver('Mobil terjungkal dan berhenti.')}
    var dm=Math.floor(Math.max(0,car.x-60)/8);
    if(dm>dist){dist=dm}
    visUpdate();
    spawnDust();
    engineSet(Math.min(1,Math.abs(car.vx)/MAXV),car.gas||car.brake);
    if(Math.abs(car.vx)<0.05&&(car.gas||car.brake))engineSet(0.15,true);
  }else engineSet(0,false);
  if(bannerT&&tick-bannerT>96)hideBanner();
  var i;
  for(i=pops.length-1;i>=0;i--){pops[i].y-=0.45;pops[i].life--;if(pops[i].life<=0)pops.splice(i,1)}
  updateDust();
  /* kamera */
  var tx=car.x-VW*0.36,ty=car.y-VH*0.56;
  cam.x+=(tx-cam.x)*0.16;
  cam.y+=(ty-cam.y)*0.09;
  cam.y=clamp(cam.y,-260,240);
  if(tick%12===0)hud();
}
var last=0,acc=0,FIXED=1000/60,perfAcc=0,perfN=0,perfLow=false;
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
  /* penurun mutu otomatis: kalau perangkat tak sanggup, kembali ke 1x supaya tetap mulus */
  if(!perfLow&&PX>1&&tick>120){
    perfAcc+=dt;perfN++;
    if(perfN>=90){
      if(perfAcc/perfN>26){perfLow=true;fit(1)}
      perfAcc=0;perfN=0;
    }
  }
}

/* ══════════ INPUT ══════════ */
function hold(id,on,off){
  var el=$(id);if(!el)return;
  el.addEventListener('pointerdown',function(e){e.preventDefault();ensureAC();el.classList.add('active');on()},{passive:false});
  var up=function(){el.classList.remove('active');if(off)off()};
  el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('pointerleave',up);
  el.addEventListener('contextmenu',function(e){e.preventDefault()});
}
function bind(){
  hold('bGas',function(){
    if(state==='menu')return;
    car.gas=true;car.brake=false;
  },function(){car.gas=false});
  hold('bBrake',function(){
    if(state==='menu')return;
    car.brake=true;car.gas=false;
  },function(){car.brake=false});
  var ov=$('ov');
  ov.addEventListener('click',function(e){
    var b=e.target&&e.target.closest?e.target.closest('[data-act]'):null;
    if(!b)return;
    var a=b.getAttribute('data-act');
    ensureAC();sfx.click();
    if(a==='start'||a==='restart')start();
    else if(a==='help')help();
    else if(a==='back')menu();
    else if(a==='resume')resumeState();
    else if(a==='menu')menu();
  });
  var mb=$('muteB');
  mb.addEventListener('click',function(){
    muted=!muted;
    if(master)master.gain.value=muted?0:0.5;
    if(muted)engineStop();
    mb.textContent=muted?'🔇':'🔊';
  });
  D.addEventListener('keydown',function(e){
    ensureAC();
    var k=(e.key||'').toLowerCase();
    if(k==='arrowright'||k==='d'){if(state==='menu')return;car.gas=true;car.brake=false;e.preventDefault()}
    else if(k==='arrowleft'||k==='a'){if(state==='menu')return;car.brake=true;car.gas=false;e.preventDefault()}
    else if(k==='r'){if(state==='play'||state==='dead'||state==='pause')start()}
    else if(k==='p'){if(state==='play')pause();else if(state==='pause')resumeState()}
    else if(k==='enter'){if(state==='menu'||state==='dead')start()}
    else if(k==='m'){if(mb)mb.click()}
    else if(k===' '){e.preventDefault();if(state==='play'){car.brake=false;car.gas=false}}
  },{passive:false});
  D.addEventListener('keyup',function(e){
    var k=(e.key||'').toLowerCase();
    if(k==='arrowright'||k==='d')car.gas=false;
    else if(k==='arrowleft'||k==='a')car.brake=false;
  });
  D.addEventListener('visibilitychange',function(){if(D.hidden&&state==='play')pause()});
  if(window.addEventListener)window.addEventListener('resize',function(){fit()});
}

/* ══════════ BOOT ══════════ */
fit();bakeProps();bind();
RESET_MENU();
function RESET_MENU(){SEED=Math.floor(Math.random()*9999)+1;TERR.length=0;reset(60);cam.x=0;cam.y=0;hud();menu()}
if(D.readyState==='complete'||D.readyState==='interactive')setTimeout(fit,60);else D.addEventListener('DOMContentLoaded',fit);
if(window.setTimeout)setTimeout(function(){fit();draw()},260);
requestAnimationFrame(loop);
if(typeof window!=='undefined'){
  window.__HR={
    get s(){return{state:state,tick:tick,x:+car.x.toFixed(1),y:+car.y.toFixed(1),vx:+car.vx.toFixed(2),vy:+car.vy.toFixed(2),
      a:+car.a.toFixed(3),av:+car.av.toFixed(3),fuel:+car.fuel.toFixed(1),onGround:car.onGround,dist:Math.floor(Math.max(0,car.x-60)/8),
      coins:coinsGot,score:score,best:best,items:items.length,air:+car.air.toFixed(1),reason:overReason,wheelW:+car.w.toFixed(2),spin:+car.wheelSpin.toFixed(2),px:PX,sag:+vis.sag.toFixed(2),
      camX:+cam.x.toFixed(1),camY:+cam.y.toFixed(1)}},
    car:car,
    step:function(n){n=n||1;for(var i=0;i<n;i++)step()},
    draw:draw,start:start,reset:reset,
    gas:function(v){car.gas=!!v;if(v)car.brake=false},
    brake:function(v){car.brake=!!v;if(v)car.gas=false},
    groundY:groundY,slopeAt:slopeAt,terrainAtI:terrainAtI,
    setSeed:function(s){SEED=s;TERR.length=0;reset(60);ensureItems(car.x+1600)},
    flatTerrain:function(h){h=h||180;TERR.length=0;for(var i=0;i<6000;i++)TERR[i]=h},
    reason:function(){return overReason},
    setFuel:function(f){car.fuel=f},
    setPos:function(x,y,a){car.x=x;car.y=y;if(a!==undefined)car.a=a;car.vx=0;car.vy=0;car.av=0},
    headPoint:headPoint,crashPoint:crashPoint,
    minPen:function(){var ca=Math.cos(car.a),sa=Math.sin(car.a),i,best=1e9;
      for(i=0;i<2;i++){var L=WHEELL[i];var rx=L.x*ca-L.y*sa,ry=L.x*sa+L.y*ca;
        var p=(car.y+ry+WR)-groundY(car.x+rx);if(p<best)best=p}
      return best},
    wheelGround:function(){var ca=Math.cos(car.a),sa=Math.sin(car.a),o=[];
      for(var i=0;i<2;i++){var L=WHEELL[i];var rx=L.x*ca-L.y*sa,ry=L.x*sa+L.y*ca;
        o.push({wx:+(car.x+rx).toFixed(1),wy:+(car.y+ry).toFixed(1),gy:+groundY(car.x+rx).toFixed(1)})}
      return o},
    forceItem:function(x,y,t){items.push({x:x,y:y,type:t||'coin',got:false,ph:0})},
    engineOn:function(){return !!engineOsc}
  };
}
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
button,[role="button"],.btn,.key,.pad,a{-webkit-user-select:none;user-select:none;transition:transform .07s ease,filter .16s ease,box-shadow .22s ease}
button:active,[role="button"]:active,.btn:active,.key:active,.pad:active{transform:translateY(1px) scale(.985);filter:brightness(1.07)}
canvas,svg,img{-webkit-user-drag:none;user-select:none}
::selection{background:rgba(255,209,102,.35)}
::-webkit-scrollbar{width:6px;height:6px}
::-webkit-scrollbar-thumb{background:rgba(255,209,102,.3);border-radius:99px}
::-webkit-scrollbar-track{background:transparent}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation-duration:.001ms!important}}
html{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
html::after{content:"";position:fixed;inset:0;z-index:9;pointer-events:none;background-image:radial-gradient(122% 82% at 16% -12%,rgba(255,255,255,.07),rgba(255,255,255,0) 58%),radial-gradient(132% 112% at 92% 118%,rgba(0,0,0,.24),rgba(0,0,0,0) 62%),url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='.05'/%3E%3C/svg%3E");background-size:auto,auto,160px 160px}
.ped,.sbtn,.mb{box-shadow:inset 0 2px 0 rgba(255,255,255,.18),inset 0 -3px 5px rgba(0,0,0,.4),0 4px 0 rgba(0,0,0,.42),0 8px 16px rgba(0,0,0,.34)!important}
.ovCard{box-shadow:inset 0 1px 0 rgba(255,255,255,.1),0 18px 40px rgba(0,0,0,.55),0 2px 0 rgba(0,0,0,.45)!important}
.stage{box-shadow:inset 0 0 0 2px rgba(255,255,255,.06),inset 0 -8px 20px rgba(0,0,0,.6),0 16px 34px rgba(0,0,0,.5)!important}
.stage canvas{filter:saturate(1.06) contrast(1.04)}
.hud,.head{border-radius:12px!important}
/* tombol kepala (🔊/⏸) tetap bisa disentuh walau lapisan menu/jeda terbuka */
#muteB,#pauseB{position:relative;z-index:9;touch-action:manipulation}
</style>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return

  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🚙', key: reactionKey } }).catch(() => {})

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
                messageText: 'Usanagi Umi AI Hill Racer 🚙',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'usanagi-ai-hillracer-2026',
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

handler.help = ['hillracer', 'hillclimb', 'hcr']
handler.tags = ['game']
handler.command = /^(hillracer|hillclimb|hcr|hill)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Game Hill Racer Usanagi Umi AI - balap bukit dengan fisika'

export default handler
