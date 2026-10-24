/* By AlzRiss - Usanagi Umi AI */

const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#0f2027">
<title>Usanagi Umi AI Mini Racing</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
html,body{min-height:100%;overscroll-behavior:none;background:#0b1618;color:#eaf6f6;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;align-items:flex-start;padding:max(8px,env(safe-area-inset-top)) 8px max(10px,env(safe-area-inset-bottom));touch-action:manipulation}
.app{width:min(100%,520px);margin:auto}
.cab{width:100%;background:linear-gradient(180deg,#173236,#0e2023);border:1px solid #2b5c60;border-radius:20px;padding:10px;box-shadow:0 26px 60px #000a,inset 0 1px 0 #ffffff18}
.head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.brand{display:flex;align-items:center;gap:9px;min-width:0}
.logo{width:38px;height:38px;flex:none;display:grid;place-items:center;border-radius:11px;background:linear-gradient(150deg,#ff5e5e,#c62828);font-size:20px;box-shadow:0 3px 0 #6b1414,inset 0 1px 0 #fff8}
.title{font-size:15px;font-weight:900;text-shadow:0 2px 0 #0008;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sub{margin-top:1px;color:#8fc7c7;font-size:8.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hbtns{display:flex;gap:5px}
.hb{width:34px;height:34px;border:1px solid #2b5c60;border-radius:10px;background:linear-gradient(180deg,#12292c,#0d1f21);color:#eaf6f6;font-size:15px;box-shadow:0 3px 0 #081315}
.hb:active{transform:translateY(2px);box-shadow:0 1px 0 #081315}
.bar{display:flex;align-items:center;gap:6px;background:#12292c;border:1px solid #2b5c60;border-radius:13px;padding:6px 8px;margin-bottom:8px}
.stx{flex:1;font:900 9px system-ui;color:#ffe082;letter-spacing:.05em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chip{padding:3px 8px;border-radius:999px;background:#0d1f21;border:1px solid #2b5c60;color:#8fc7c7;font:800 8.5px system-ui;white-space:nowrap}
.chip b{color:#ffd23f}
.stage{position:relative;width:100%;aspect-ratio:4/3;border:2px solid #2b5c60;border-radius:14px;overflow:hidden;background:#1b3f28}
.stage canvas{display:block;width:100%;height:100%;touch-action:none}
.toast{position:absolute;left:50%;top:10px;transform:translate(-50%,-14px);padding:5px 11px;border-radius:999px;background:#0d1f21e6;border:1px solid #2b5c60;color:#eaf6f6;font:900 8.5px system-ui;opacity:0;transition:.18s;pointer-events:none;white-space:nowrap;max-width:92%;overflow:hidden;text-overflow:ellipsis;z-index:5}
.toast.show{opacity:1;transform:translate(-50%,0)}
.ov{position:absolute;inset:0;z-index:8;display:grid;place-items:center;background:#061012e8;backdrop-filter:blur(7px);padding:10px;transition:opacity .2s}
.ov.hide{opacity:0;pointer-events:none}
.card2{width:min(96%,340px);text-align:center;padding:16px 14px;border:1px solid #2b5c60;border-radius:16px;background:linear-gradient(180deg,#173236,#0e2023);box-shadow:0 18px 40px #000a}
.card2 .big{font-size:21px;font-weight:950;color:#ffe082;text-shadow:0 3px 0 #0008}
.card2 .small{margin-top:6px;color:#8fc7c7;font-size:9px;line-height:1.65}
.gbtn{display:block;width:100%;margin-top:10px;min-height:44px;border:1px solid #ffe082;border-radius:12px;background:linear-gradient(180deg,#ff7043,#c62828);color:#2d0505;font:950 13px system-ui;letter-spacing:.08em;box-shadow:0 5px 0 #6b1414}
.gbtn:active{transform:translateY(3px);box-shadow:0 2px 0 #6b1414}
.ctrls{display:flex;gap:8px;margin-top:8px}
.pedal{flex:1;min-height:58px;border:1px solid #2b5c60;border-radius:14px;background:linear-gradient(180deg,#1d4046,#12292c);color:#eaf6f6;font:950 15px system-ui;box-shadow:0 4px 0 #081315;touch-action:none}
.pedal:active,.pedal.on{transform:translateY(2px);box-shadow:0 1px 0 #081315;background:linear-gradient(180deg,#2b5c60,#1d4046)}
.pedal.gas{background:linear-gradient(180deg,#43a047,#1b5e20);border-color:#81c784;color:#eafbea}
.pedal.nitro{background:linear-gradient(180deg,#7e57c2,#4527a0);border-color:#b39ddb;color:#f0eaff;flex:0.8}
.pedal .sm{display:block;font:800 7px system-ui;color:#ffffff99;letter-spacing:.1em;margin-top:2px}
</style>
</head>
<body>
<div class="app">
  <div class="cab">
    <div class="head">
      <div class="brand">
        <div class="logo">🏎️</div>
        <div>
          <div class="title">MINI RACING</div>
          <div class="sub">2 lap · 3 bot · gas &amp; nitro · drift</div>
        </div>
      </div>
      <div class="hbtns"><button class="hb" id="bSound">🔊</button></div>
    </div>
    <div class="bar">
      <div class="stx" id="stx">Siap di garis start</div>
      <div class="chip">🏁 <b id="cPos">-</b></div>
      <div class="chip">LAP <b id="cLap">1/2</b></div>
      <div class="chip">⚡ <b id="cNitro">100%</b></div>
    </div>
    <div class="stage">
      <canvas id="cv"></canvas>
      <div class="toast" id="toast"></div>
      <div class="ov" id="ovStart">
        <div class="card2">
          <div class="big">🏎️ MINI RACING</div>
          <div class="small"><b style="color:#ffe082">◀ ▶</b> tahan = kemudi · <b style="color:#81c784">GAS</b> akselerasi<br><b style="color:#b39ddb">NITRO</b> dorongan ekstra (isi otomatis)<br>Belok kencang = <b>drift</b> · keluar aspal = melambat<br>Kalahkan 3 bot dalam 2 lap!</div>
          <button class="gbtn" id="bPlay">▶ START ENGINE</button>
        </div>
      </div>
      <div class="ov hide" id="ovEnd">
        <div class="card2">
          <div class="big" id="endTitle">FINIS!</div>
          <div class="small" id="endInfo"></div>
          <button class="gbtn" id="bAgain">↻ BALAPAN LAGI</button>
        </div>
      </div>
    </div>
    <div class="ctrls">
      <button class="pedal" id="pL">◀<span class="sm">KIRI</span></button>
      <button class="pedal" id="pR">▶<span class="sm">KANAN</span></button>
      <button class="pedal nitro" id="pN">⚡<span class="sm">NITRO</span></button>
      <button class="pedal gas" id="pG">▲<span class="sm">GAS</span></button>
    </div>
  </div>
</div>
<script>
(function(){
var DW=960,DH=720,CX=DW/2,CY=DH/2;
var ROX=425,ROY=320;      /* radius luar oval (bulge ×1.1 → maks 467 < 480) */
var RW=150,RH=105;        /* setengah lebar aspal (dalam: X min 65 · Y min 110) */
var mem={},stGet=function(k){try{return localStorage.getItem(k)}catch(e){return mem[k]||null}},stSet=function(k,v){try{localStorage.setItem(k,v)}catch(e){}mem[k]=v};
var sOn=stGet('usanagi-race-snd')!=='0';
var AC=null;function ensureAC(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}}
function tone(f,d,type,v,slide){if(!sOn||!AC)return;try{var o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,AC.currentTime);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f+slide),AC.currentTime+d);g.gain.setValueAtTime(v||0.1,AC.currentTime);g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
var SFX={go:function(){tone(660,0.2,'square',0.14)},lap:function(){tone(880,0.12,'sine',0.13)},win:function(){tone(523,0.12,'sine',0.14);setTimeout(function(){tone(659,0.12,'sine',0.14)},130);setTimeout(function(){tone(784,0.28,'sine',0.16)},260)},lose:function(){tone(300,0.35,'sawtooth',0.12,-160)},bump:function(){tone(160,0.08,'square',0.09,-60)}};
var cv=document.getElementById('cv'),cx=cv.getContext('2d');
function fit(){var r=cv.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);cx.setTransform(cv.width/DW,0,0,cv.height/DH,0,0)}
window.addEventListener('resize',fit);
function toast(m){var t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('show')},1400)}
/* titik lintasan: t=0..1 keliling, off=-1..1 (tepi dalam..tepi luar) */
function trackPt(t,off){
  var a=t*Math.PI*2-Math.PI/2;
  /* oval: sudut disesuaikan agar kecepatan kira-kira merata */
  var ex=ROX*(1+0.10*Math.sin(a)), ey=ROY;
  var ix=ROX*(1+0.10*Math.sin(a))-RW*2, iy=ROY-RH*2;
  if(ix<60)ix=60; if(iy<40)iy=40;
  return {x:CX+Math.cos(a)*(ex+(ix-ex)*(off+1)/2),
          y:CY+Math.sin(a)*(ey+(iy-ey)*(off+1)/2)};
}
function heading(t){
  var a=t*Math.PI*2-Math.PI/2;
  var ex=ROX*(1+0.10*Math.sin(a)), ey=ROY;
  var ix=Math.max(60,ex-RW*2), iy=Math.max(40,ey-RH*2);
  var rx=(ex+ix)/2, ry=(ey+iy)/2;
  var dx=-Math.sin(a)*rx, dy=Math.cos(a)*ry;
  return Math.atan2(dy,dx);
}
function rnd(a,b){return a+Math.random()*(b-a)}
var G=null,started=false,t0=0,skid=[];
function makeCar(me,startT,col){
  return {me:me,t:startT,off:me?0.5:rnd(-0.5,0.5),spd:0,lap:0,col:col,
    nitro:1,drift:0,base:0.9+Math.random()*0.16,wob:rnd(0,6),lt:0,done:false};
}
function reset(){
  G={cars:[],count:3.4,rank:4,t:0,steer:0,gas:0,nitroBtn:0,over:false,startT:performance.now()};
  G.cars.push(makeCar(true,0.992,'#e53935'));
  G.cars.push(makeCar(false,0.94,'#546e7a'));
  G.cars.push(makeCar(false,0.918,'#00897b'));
  G.cars.push(makeCar(false,0.896,'#8d6e63'));
  bakeCar('#e53935',1);bakeCar('#546e7a',0);bakeCar('#00897b',0);bakeCar('#8d6e63',0);
}
function place(){
  for(var i=0;i<G.cars.length;i++){var c=G.cars[i];var p=trackPt(c.t,c.off);c.x=p.x;c.y=p.y}
}
function step(dt){
  if(!G||G.over)return;
  G.t+=dt;
  if(G.count>0){
    G.count-=dt;
    if(G.count<=0){SFX.go();toast('GO! 🏁')}
    return;
  }
  var p=G.cars[0];
  /* kecepatan */
  var top=560+(G.nitroBtn&&p.nitro>0?210:0);
  var want=G.gas?top:200;
  p.spd+=(want-p.spd)*Math.min(1,dt*1.5);
  if(G.nitroBtn&&p.nitro>0){p.nitro-=dt*0.5}
  else p.nitro=Math.min(1,p.nitro+dt*0.13);
  /* kemudi: geser offset lateral — mulus, anti-macet */
  var grip=0.62+p.spd/900;
  var turn=G.steer*dt*(1.05)*grip;
  p.off+=turn;
  p.drift=Math.abs(G.steer)*Math.min(1,p.spd/500)*(0.5+grip*0.3);
  /* tepi lintasan: off di luar [-1,1] = off-road */
  var offroad=false;
  if(p.off>1){p.off=1;offroad=true}
  if(p.off<-1){p.off=-1;offroad=true}
  if(offroad)p.spd*=1-1.8*dt;
  /* maju sepanjang lintasan */
  var adv=p.spd*dt/2050;
  var prev=p.t;
  p.t+=adv;
  if(p.lt>0.9&&p.t<0.1){p.lap++;SFX.lap();
    if(p.lap>=2)finish()}
  p.lt=p.t;
  var pos=trackPt(p.t,p.off);
  p.x=pos.x;p.y=pos.y;
  /* bot */
  for(var i=1;i<G.cars.length;i++){
    var b=G.cars[i];
    if(!b.done){
      var bs=b.base*(500+60*Math.sin(G.t*0.6+b.wob));
      b.spd+=(bs-b.spd)*Math.min(1,dt*1.2);
      /* bot menjauh dari pemain sedikit & meander */
      var target=0.35*Math.sin(G.t*0.5+b.wob*2);
      b.off+=(target-b.off)*dt*1.2;
      if(b.off>0.85)b.off=0.85;if(b.off<-0.85)b.off=-0.85;
      b.t+=b.spd*dt/2050;
      if(b.lt>0.9&&b.t<0.1){b.lap++;if(b.lap>=2){b.done=true}}
      b.lt=b.t;
      var bp=trackPt(b.t,b.off);
      b.x=bp.x;b.y=bp.y;
      b.drift=Math.abs(Math.cos(G.t*0.5+b.wob))*0.3;
    }
  }
  /* bump halus antar mobil */
  for(var a2=0;a2<G.cars.length;a2++)for(var b2=a2+1;b2<G.cars.length;b2++){
    var c1=G.cars[a2],c2=G.cars[b2];
    var dt2=Math.abs(((c1.t-c2.t+1.5)%1)-0.5);
    if(dt2<0.012&&Math.abs(c1.off-c2.off)<0.22){
      var push=(c1.off<c2.off?-1:1)*dt*0.9;
      c1.off+=push;c2.off-=push;
      if(c1.me||c2.me)SFX.bump();
    }
  }
  /* peringkat */
  var score=p.lap+p.t,rank=1;
  for(var j=1;j<G.cars.length;j++){var o=G.cars[j];if(o.lap+o.t>score)rank++}
  G.rank=rank;
  /* skid marks */
  if(p.drift>0.35&&skid.length<140){skid.push({x:p.x,y:p.y,t:1})}
  for(var sk=skid.length-1;sk>=0;sk--){skid[sk].t-=dt*0.5;if(skid[sk].t<=0)skid.splice(sk,1)}
}
function finish(){
  G.over=true;
  var waktu=(performance.now()-G.startT)/1000;
  if(G.rank===1)SFX.win();else SFX.lose();
  setTimeout(function(){
    document.getElementById('endTitle').textContent=G.rank===1?'🏆 JUARA!':'FINIS #'+G.rank;
    document.getElementById('endInfo').innerHTML='Posisi <b style="color:#ffe082">#'+G.rank+'</b> dari 4<br>Nitro terpakai — coba drift di tikungan!';
    document.getElementById('ovEnd').classList.remove('hide');
  },400);
}
function drawCarBody(c){
  var ang=heading(c.t)+(c.drift||0)*0.5;
  var sp=bakeCar(c.col,c.me);
  cx.save();cx.translate(c.x,c.y);cx.rotate(ang);
  cx.drawImage(sp.cv,-sp.W/2,-sp.H/2,sp.W,sp.H);
  if(c.me&&G&&G.nitroBtn&&c.nitro>0){
    cx.fillStyle='#7e57c2';
    cx.beginPath();cx.moveTo(-30,-5);cx.lineTo(-52,0);cx.lineTo(-30,5);cx.fill();
  }
  cx.restore();
}
function lighten(hex,amt){
  var n=parseInt(hex.slice(1),16),r=(n>>16)&255,g2=(n>>8)&255,b=n&255;
  r=Math.max(0,Math.min(255,Math.round(r+255*amt)));
  g2=Math.max(0,Math.min(255,Math.round(g2+255*amt)));
  b=Math.max(0,Math.min(255,Math.round(b+255*amt)));
  return 'rgb('+r+','+g2+','+b+')';
}
function rr(x,y,w,h,r){r=Math.min(r,w/2,h/2);cx.beginPath();cx.moveTo(x+r,y);cx.arcTo(x+w,y,x+w,y+h,r);cx.arcTo(x+w,y+h,x,y+h,r);cx.arcTo(x,y+h,x,y,r);cx.arcTo(x,y,x+w,y,r);cx.closePath()}
var CARSPR={};
function rr2(g,x,y,w,h,r){r=Math.min(r,w/2,h/2);g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
/* gambar mobil sekali di kanvas 3× lalu jadi sprite — tajam & hemat CPU */
function bakeCar(col,me){
  if(CARSPR[col])return CARSPR[col];
  var SC=3,w=me?52:48,h=30,W=Math.ceil(w*1.8),H=Math.ceil(h*1.9);
  var c=document.createElement('canvas');c.width=W*SC;c.height=H*SC;
  var g=c.getContext('2d');g.translate(c.width/2,c.height/2);g.scale(SC,SC);
  g.globalAlpha=0.3;g.fillStyle='#000';
  g.beginPath();g.ellipse(3,6,w*0.55,h*0.6,0,0,7);g.fill();g.globalAlpha=1;
  g.fillStyle='#151515';
  g.fillRect(-w*0.32,-h/2-4,13,8);g.fillRect(w*0.12,-h/2-4,13,8);
  g.fillRect(-w*0.32,h/2-4,13,8);g.fillRect(w*0.12,h/2-4,13,8);
  g.fillStyle='#3e3e3e';
  g.fillRect(-w*0.32+2,-h/2-3,9,6);g.fillRect(w*0.12+2,-h/2-3,9,6);
  g.fillRect(-w*0.32+2,h/2-3,9,6);g.fillRect(w*0.12+2,h/2-3,9,6);
  var lg=g.createLinearGradient(0,-h/2,0,h/2);
  lg.addColorStop(0,lighten(col,0.38));lg.addColorStop(0.45,col);lg.addColorStop(1,lighten(col,-0.32));
  g.fillStyle=lg;
  rr2(g,-w/2,-h/2,w,h,9);g.fill();
  g.strokeStyle='rgba(0,0,0,0.4)';g.lineWidth=2;g.stroke();
  /* highlight metalik */
  g.fillStyle='rgba(255,255,255,0.22)';
  rr2(g,-w/2+4,-h/2+3,w-8,5,3);g.fill();
  g.fillStyle='#b3e5fc';
  rr2(g,-w*0.1,-h/2+5,w*0.28,h-10,4);g.fill();
  g.fillStyle='rgba(255,255,255,0.55)';
  rr2(g,-w*0.08,-h/2+7,w*0.1,h-18,2);g.fill();
  g.fillStyle='rgba(0,0,0,0.45)';
  g.fillRect(-w/2-3,-h/2+2,5,h-4);
  g.fillStyle='#fff8e1';
  g.fillRect(w/2-3,-h/2+4,3,5);g.fillRect(w/2-3,h/2-9,3,5);
  CARSPR[col]={cv:c,W:W,H:H};
  return CARSPR[col];
}
var grassCache=null;
function drawTrack(){
  if(grassCache)return cx.drawImage(grassCache,0,0,DW,DH),grassCache;
  grassCache=document.createElement('canvas');grassCache.width=DW;grassCache.height=DH;
  var g=grassCache.getContext('2d');
  var rg=g.createRadialGradient(CX,CY,60,CX,CY,620);
  rg.addColorStop(0,'#2e7d32');rg.addColorStop(1,'#173d1a');
  g.fillStyle=rg;g.fillRect(0,0,DW,DH);
  g.fillStyle='rgba(0,0,0,0.12)';
  for(var i=0;i<50;i++){g.fillRect((i*211)%DW,(i*137)%DH,4,3)}
  /* aspal: cincin oval */
  g.beginPath();
  for(var k=0;k<=90;k++){var t=k/90,a=t*Math.PI*2-Math.PI/2;var ex=ROX*(1+0.10*Math.sin(a)),ey=ROY;var x=CX+Math.cos(a)*ex,y=CY+Math.sin(a)*ey;k?g.lineTo(x,y):g.moveTo(x,y)}
  g.closePath();
  g.arc(CX,CY,ROX-2*RW,0,7,true);
  g.fillStyle='#37474f';g.fill('evenodd');
  /* tekstur aspal */
  g.save();g.globalAlpha=0.08;
  for(var s=0;s<420;s++){var t2=Math.random(),a2=t2*Math.PI*2-Math.PI/2;var ex2=ROX*(1+0.10*Math.sin(a2)),ey2=ROY;
    var ix2=Math.max(60,ex2-2*RW),iy2=Math.max(40,ey2-2*RH);
    var off=Math.random()*2-1;
    g.fillStyle='#fff';
    g.fillRect(CX+Math.cos(a2)*(ex2+(ix2-ex2)*(off+1)/2),CY+Math.sin(a2)*(ey2+(iy2-ey2)*(off+1)/2),2,2)}
  g.restore();
  /* curb merah-putih di tepi luar & dalam */
  for(var edge=0;edge<2;edge++){
    for(var k2=0;k2<90;k2++){
      var t3=k2/90,a3=t3*Math.PI*2-Math.PI/2;
      if(edge===0){var ex3=ROX*(1+0.10*Math.sin(a3)),ey3=ROY}
      else{var ex3=Math.max(60,ROX*(1+0.14*Math.sin(a3))-2*RW),ey3=Math.max(40,ROY-2*RH)}
      var x3=CX+Math.cos(a3)*ex3,y3=CY+Math.sin(a3)*ey3;
      g.fillStyle=(k2%2)?'#eceff1':'#e53935';
      g.beginPath();g.arc(x3,y3,edge===0?4:3,0,7);g.fill();
    }
  }
  /* garis start kotak-kotak */
  var sp=trackPt(0,0);
  g.save();g.translate(sp.x,sp.y);g.rotate(heading(0));
  for(var sx2=0;sx2<6;sx2++)for(var sy2=0;sy2<3;sy2++){
    g.fillStyle=(sx2+sy2)%2?'#fff':'#222';
    g.fillRect(-4,-RH*0.8+sy2*(RH*0.55),8,RH*0.5);
  }
  g.restore();
  return grassCache;
}
function draw(){
  cx.drawImage(drawTrack(),0,0,DW,DH);
  /* skid marks */
  cx.fillStyle='rgba(20,20,20,0.5)';
  for(var i=0;i<skid.length;i++){var s=skid[i];cx.globalAlpha=s.t*0.5;cx.beginPath();cx.arc(s.x,s.y,4,0,7);cx.fill()}
  cx.globalAlpha=1;
  /* mobil diurutkan by y biar tumpang tindih natural (guard: G bisa null sebelum start) */
  if(G){var order=G.cars.slice().sort(function(a,b){return a.y-b.y});
  for(var c2=0;c2<order.length;c2++)drawCarBody(order[c2])}
  if(G&&G.count>0){
    cx.fillStyle='rgba(0,0,0,0.35)';cx.fillRect(0,0,DW,DH);
    cx.fillStyle='#fff';cx.font='900 96px system-ui';cx.textAlign='center';cx.textBaseline='middle';
    var n=Math.ceil(G.count-0.4);
    cx.fillText(n>=1?String(n):'GO!',CX,CY);
    cx.textAlign='left';cx.textBaseline='alphabetic';
  }
}
function loop(ts){
  var dt=Math.min(0.04,(ts-t0)/1000||0.016);t0=ts;
  if(G&&started)step(dt);
  draw();
  if(G&&started&&!G.over){
    var p=G.cars[0];
    document.getElementById('stx').textContent=G.count>0?'Bersiap…':(p.off>=1||p.off<=-1?'⚠️ OFF-ROAD — kembali ke aspal!':'Kecepatan '+Math.round(p.spd/4)+' km/j');
    document.getElementById('cPos').textContent='#'+(G.rank||4);
    document.getElementById('cLap').textContent=Math.min(2,(p.lap||0)+1)+'/2';
    document.getElementById('cNitro').textContent=Math.round(p.nitro*100)+'%';
  }
  requestAnimationFrame(loop);
}
function bindHold(id,on,off){
  var el=document.getElementById(id);
  el.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();ensureAC();el.classList.add('on');on()},{passive:false});
  ['pointerup','pointercancel','pointerleave'].forEach(function(ev){el.addEventListener(ev,function(){el.classList.remove('on');off()})});
}
bindHold('pL',function(){if(G)G.steer=-1},function(){if(G)G.steer=0});
bindHold('pR',function(){if(G)G.steer=1},function(){if(G)G.steer=0});
bindHold('pG',function(){if(G)G.gas=1},function(){if(G)G.gas=0});
bindHold('pN',function(){if(G)G.nitroBtn=1},function(){if(G)G.nitroBtn=0});
document.addEventListener('keydown',function(e){if(!G)return;if(e.code==='ArrowLeft')G.steer=-1;if(e.code==='ArrowRight')G.steer=1;if(e.code==='ArrowUp'||e.code==='Space')G.gas=1;if(e.code==='ShiftLeft'||e.code==='KeyZ')G.nitroBtn=1});
document.addEventListener('keyup',function(e){if(!G)return;if(e.code==='ArrowLeft'&&G.steer<0)G.steer=0;if(e.code==='ArrowRight'&&G.steer>0)G.steer=0;if(e.code==='ArrowUp'||e.code==='Space')G.gas=0;if(e.code==='ShiftLeft'||e.code==='KeyZ')G.nitroBtn=0});
/* sentuh sisi kiri/kanan layar = kemudi juga */
cv.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();ensureAC();
  var r=cv.getBoundingClientRect();
  if(G){G.steer=(e.clientX-r.left)/r.width<0.5?-1:1;G.gas=1}},{passive:false});
['pointerup','pointercancel'].forEach(function(ev){cv.addEventListener(ev,function(){if(G){G.steer=0;G.gas=0}})});
document.getElementById('bPlay').addEventListener('click',function(){ensureAC();reset();started=true;skid=[];document.getElementById('ovStart').classList.add('hide');document.getElementById('ovEnd').classList.add('hide');toast('3… 2… 1…')});
document.getElementById('bAgain').addEventListener('click',function(){ensureAC();reset();skid=[];document.getElementById('ovEnd').classList.add('hide')});
document.getElementById('bSound').addEventListener('click',function(){sOn=!sOn;stSet('usanagi-race-snd',sOn?'1':'0');this.textContent=sOn?'🔊':'🔇';if(sOn)ensureAC()});
document.getElementById('bSound').textContent=sOn?'🔊':'🔇';
fit();requestAnimationFrame(loop);
})();
</script>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return
  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🏎️', key: reactionKey } }).catch(() => {})
  await sendRich(conn, m.chat, 'Usanagi Umi AI Mini Racing 🏎️', 'usanagi-ai-racing-2026', html)
}

async function sendRich(conn, chat, title, rid, htmlPayload) {
  const payload = {
    messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2, botMetadata: {} },
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          messageType: 1,
          submessages: [{ messageType: 2, messageText: title }],
          unifiedResponse: {
            data: Buffer.from(JSON.stringify({
              response_id: rid,
              sections: [{ view_model: { primitive: { __typename: 'GenAIaeacdsnwHtmlPrimitive', payload: htmlPayload, trusted_sources: [] }, __typename: 'GenAISingleLayoutViewModel' } }],
            })).toString('base64'),
          },
          contextInfo: { forwardingScore: 1, isForwarded: true, forwardedAiBotMessageInfo: { botJid: '867051314767696@bot' }, forwardOrigin: 4 },
        },
      },
    },
  }
  await conn.relayMessage(chat, payload, {})
}

handler.help = ['racing', 'miniracing', 'balapmobil']
handler.tags = ['game']
handler.command = /^(racing|miniracing|balapmobil)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Mini Racing HD - kemudi anti-macet, drift, nitro, lawan 3 bot 2 lap'

export default handler
