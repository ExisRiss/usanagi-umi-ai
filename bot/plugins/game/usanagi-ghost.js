
const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#0c0f1e">
<title>Usanagi Umi AI Ghost Hunter</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
html,body{min-height:100%;overscroll-behavior:none;background:#070912;color:#e6ecff;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}
body{display:flex;justify-content:center;align-items:flex-start;padding:max(8px,env(safe-area-inset-top)) 8px max(10px,env(safe-area-inset-bottom));touch-action:manipulation}
.app{width:min(100%,520px);margin:auto}
.cab{width:100%;background:linear-gradient(180deg,#141a33,#0b0f20);border:1px solid #303c66;border-radius:20px;padding:10px;box-shadow:0 26px 60px #000a,inset 0 1px 0 #ffffff15}
.head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.brand{display:flex;align-items:center;gap:9px;min-width:0}
.logo{width:38px;height:38px;flex:none;display:grid;place-items:center;border-radius:11px;background:linear-gradient(150deg,#7986cb,#3949ab);font-size:20px;box-shadow:0 3px 0 #1a2450,inset 0 1px 0 #fff8}
.title{font-size:15px;font-weight:900;text-shadow:0 2px 0 #0008;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sub{margin-top:1px;color:#93a0cc;font-size:8.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bar{display:flex;align-items:center;gap:6px;background:#101528;border:1px solid #303c66;border-radius:13px;padding:6px 8px;margin-bottom:8px}
.stx{flex:1;font:900 9px system-ui;color:#b3c2f5;letter-spacing:.05em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chip{padding:3px 8px;border-radius:999px;background:#0a0e1d;border:1px solid #303c66;color:#93a0cc;font:800 8.5px system-ui;white-space:nowrap}
.chip b{color:#ffd23f}
.stage{position:relative;width:100%;aspect-ratio:4/3;border:2px solid #303c66;border-radius:14px;overflow:hidden;background:#04060d}
.stage canvas{display:block;width:100%;height:100%;touch-action:none}
.toast{position:absolute;left:50%;top:10px;transform:translate(-50%,-14px);padding:5px 11px;border-radius:999px;background:#0a0e1de6;border:1px solid #303c66;color:#e6ecff;font:900 8.5px system-ui;opacity:0;transition:.18s;pointer-events:none;white-space:nowrap;max-width:92%;overflow:hidden;text-overflow:ellipsis;z-index:5}
.toast.show{opacity:1;transform:translate(-50%,0)}
.ov{position:absolute;inset:0;z-index:8;display:grid;place-items:center;background:#04060de8;backdrop-filter:blur(7px);padding:10px;transition:opacity .2s}
.ov.hide{opacity:0;pointer-events:none}
.card2{width:min(96%,340px);text-align:center;padding:16px 14px;border:1px solid #303c66;border-radius:16px;background:linear-gradient(180deg,#141a33,#0a0e1c);box-shadow:0 18px 40px #000a}
.card2 .big{font-size:21px;font-weight:950;color:#b3c2f5;text-shadow:0 3px 0 #0008}
.card2 .small{margin-top:6px;color:#93a0cc;font-size:9px;line-height:1.65}
.gbtn{display:block;width:100%;margin-top:10px;min-height:44px;border:1px solid #b3c2f5;border-radius:12px;background:linear-gradient(180deg,#7986cb,#3949ab);color:#0e1330;font:950 13px system-ui;letter-spacing:.08em;box-shadow:0 5px 0 #1a2450}
.gbtn:active{transform:translateY(3px);box-shadow:0 2px 0 #1a2450}
.ctrls{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-top:8px;max-width:300px;margin-left:auto;margin-right:auto}
.dpad{min-height:50px;border:1px solid #303c66;border-radius:12px;background:linear-gradient(180deg,#1a2340,#10152b);color:#e6ecff;font:950 16px system-ui;box-shadow:0 3px 0 #05070f;touch-action:none}
.dpad:active,.dpad.on{transform:translateY(2px);box-shadow:0 1px 0 #05070f;background:linear-gradient(180deg,#26325c,#1a2340)}
.dpad.up{grid-column:2}
.dpad.left{grid-column:1;grid-row:2}
.dpad.mid{grid-column:2;grid-row:2;font-size:12px}
.dpad.right{grid-column:3;grid-row:2}
.dpad.down{grid-column:2;grid-row:3}
</style>
</head>
<body>
<div class="app">
  <div class="cab">
    <div class="head">
      <div class="brand">
        <div class="logo">👻</div>
        <div>
          <div class="title">GHOST HUNTER</div>
          <div class="sub">cari &amp; jaring hantu di rumah gelap</div>
        </div>
      </div>
      <div class="hbtns"><button class="hb" id="bSound">🔊</button></div>
    </div>
    <div class="bar">
      <div class="stx" id="stx">Rumah gelap gulita…</div>
      <div class="chip">👻 <b id="cGhost">0/8</b></div>
      <div class="chip">⏱ <b id="cTime">90</b>s</div>
    </div>
    <div class="stage">
      <canvas id="cv"></canvas>
      <div class="toast" id="toast"></div>
      <div class="ov" id="ovStart">
        <div class="card2">
          <div class="big">👻 GHOST HUNTER</div>
          <div class="small">Rumah gelap, senter cuma menerangi sekelilingmu.<br>Gunakan <b style="color:#b3c2f5">D-PAD</b> untuk bergerak antar ruangan.<br><b style="color:#b3c2f5">TAP HANTU</b> yang terlihat untuk menjaringnya!<br>Tangkap <b>8 hantu</b> sebelum 90 detik habis.<br>🔥 Hantu biru lebih cepat hilang — kejar!</div>
          <button class="gbtn" id="bPlay">▶ MULAI BERBURU</button>
        </div>
      </div>
      <div class="ov hide" id="ovEnd">
        <div class="card2">
          <div class="big" id="endTitle">WAKTU HABIS!</div>
          <div class="small" id="endInfo"></div>
          <button class="gbtn" id="bAgain">↻ BURU LAGI</button>
        </div>
      </div>
    </div>
    <div class="ctrls">
      <button class="dpad up" id="dU">▲</button>
      <button class="dpad left" id="dL">◀</button>
      <button class="dpad mid" id="dS">🔍</button>
      <button class="dpad right" id="dR">▶</button>
      <button class="dpad down" id="dD">▼</button>
    </div>
  </div>
</div>
<script>
(function(){
var DW=800,DH=600,TS=50,CW=16,CH=12;
var mem={},stGet=function(k){try{return localStorage.getItem(k)}catch(e){return mem[k]||null}},stSet=function(k,v){try{localStorage.setItem(k,v)}catch(e){}mem[k]=v};
var sOn=stGet('usanagi-ghost-snd')!=='0';
var AC=null;function ensureAC(){try{if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}}
function tone(f,d,type,v,slide){if(!sOn||!AC)return;try{var o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,AC.currentTime);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f+slide),AC.currentTime+d);g.gain.setValueAtTime(v||0.1,AC.currentTime);g.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
var SFX={step:function(){tone(140,0.05,'triangle',0.05)},net:function(){tone(700,0.1,'square',0.12,300);setTimeout(function(){tone(980,0.15,'square',0.12,200)},90)},flee:function(){tone(500,0.2,'sine',0.08,-260)},win:function(){tone(523,0.12,'sine',0.14);setTimeout(function(){tone(659,0.12,'sine',0.14)},130);setTimeout(function(){tone(880,0.25,'sine',0.16)},260)},lose:function(){tone(300,0.4,'sawtooth',0.15,-200)}};
var cv=document.getElementById('cv'),cx=cv.getContext('2d');
function fit(){var r=cv.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr);cx.setTransform(cv.width/DW,0,0,cv.height/DH,0,0)}
window.addEventListener('resize',fit);
function toast(m){var t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('show')},1400)}
/* labirin rumah: dinding grid; 1=dinding */
function genMaze(){
  var m=[];
  for(var r=0;r<CH;r++){m.push([]);for(var c=0;c<CW;c++)m[r].push(1)}
  /* gali ruangan kamar-kamar & koridor */
  function carve(x,y,w,h){
    for(var r=y;r<y+h;r++)for(var c=x;c<x+w;c++)m[r][c]=0;
  }
  carve(1,1,4,3);carve(7,1,4,2);carve(12,1,3,4);
  carve(1,5,3,4);carve(5,4,6,3);carve(12,6,3,3);
  carve(1,10,5,1);carve(7,8,4,3);carve(12,10,3,1);
  /* koridor penghubung */
  carve(5,2,2,1);carve(11,2,1,1);carve(4,6,1,1);carve(11,7,1,1);
  carve(3,9,1,1);carve(7,7,1,1);carve(6,10,1,1);carve(8,4,1,1);
  carve(2,4,1,1);carve(13,5,1,1);carve(9,1,1,0);carve(6,11,1,1);
  carve(10,3,1,2);carve(5,7,1,3);carve(14,4,1,2);carve(1,8,0,2);
  return m;
}
var G=null,started=false,t0=0;
function rnd(a,b){return a+Math.floor(Math.random()*(b-a+1))}
function freeCell(){
  for(var tries=0;tries<200;tries++){
    var r=rnd(0,CH-1),c=rnd(0,CW-1);
    if(G.maze[r][c]===0)return {r:r,c:c};
  }
  return {r:1,c:1};
}
function spawnGhost(){
  var p=freeCell();
  var far=Math.hypot(p.c-G.pc,p.r-G.pr)>5;
  if(!far){p=freeCell()}
  G.ghosts.push({c:p.c,r:p.r,t:rnd(4,8),blue:Math.random()<0.3,ph:Math.random()*6.28});
}
function reset(){
  G={maze:genMaze(),pr:2,pc:2,px:0,py:0,moving:0,mvx:0,mvy:0,
     ghosts:[],caught:0,time:90,t:0,dead:false,net:0,scan:0};
  for(var i=0;i<3;i++)spawnGhost();
}
function tryMove(dx,dy){
  if(!G||G.dead||G.moving>0)return;
  var nr=G.pr+dy,nc=G.pc+dx;
  if(nr<0||nc<0||nr>=CH||nc>=CW||G.maze[nr][nc]===1)return;
  G.moving=0.22;G.mvx=dx;G.mvy=dy;
  G.pr=nr;G.pc=nc;
  SFX.step();
}
function step(dt){
  if(!G||G.dead)return;
  G.t+=dt;G.time-=dt;
  document.getElementById('cTime').textContent=Math.max(0,Math.ceil(G.time));
  if(G.time<=0){endGame(false);return}
  if(G.moving>0)G.moving-=dt;
  /* hantu hidup-hidupan */
  for(var i=G.ghosts.length-1;i>=0;i--){
    var g=G.ghosts[i];
    g.t-=dt;
    if(g.t<=0){
      /* pindah / menghilang → spawn lagi di tempat lain */
      G.ghosts.splice(i,1);
      spawnGhost();
      if(Math.hypot(g.c-G.pc,g.r-G.pr)<7)SFX.flee();
      continue;
    }
  }
  /* pemain menyentuh ruangan hantu → hantu "menampakkan diri" lebih jelas */
  G.scan=Math.max(0,G.scan-dt);
  G.net=Math.max(0,G.net-dt);
}
function tapGhost(x,y){
  if(!G||G.dead)return;
  var r=cv.getBoundingClientRect();
  var wx=(x-r.left)/r.width*DW, wy=(y-r.top)/r.height*DH;
  var gc=Math.floor(wx/TS), gr=Math.floor(wy/TS);
  G.scan=1;
  for(var i=G.ghosts.length-1;i>=0;i--){
    var g=G.ghosts[i];
    /* boleh menangkap kalau hantu di ruangan sekitar pemain (jarak <=2 petak) */
    if(g.c===gc&&g.r===gr&&Math.abs(g.c-G.pc)<=2&&Math.abs(g.r-G.pr)<=2){
      G.ghosts.splice(i,1);G.caught++;G.net=0.4;
      SFX.net();
      document.getElementById('cGhost').textContent=G.caught+'/8';
      toast(g.blue?'Hantu biru tertangkap! 💙':'Hantu tertangkap! 🕸️');
      if(G.caught>=8){endGame(true);return}
      if(G.ghosts.length<3)spawnGhost();
      return;
    }
  }
  toast('Tidak ada hantu yang bisa dijangkau di situ');
}
function endGame(win){
  G.dead=true;
  if(win)SFX.win();else SFX.lose();
  stSet('usanagi-ghost-last',String(G.caught));
  setTimeout(function(){
    document.getElementById('endTitle').textContent=win?'🏆 SEMUA HANTU TERTANGKAP!':'WAKTU HABIS';
    document.getElementById('endInfo').innerHTML='Tertangkap: <b style="color:#b3c2f5">'+G.caught+'/8</b><br>Sisa waktu: <b style="color:#ffd23f">'+Math.max(0,Math.ceil(G.time))+'s</b>';
    document.getElementById('ovEnd').classList.remove('hide');
  },400);
}
function draw(){
  cx.fillStyle='#04060d';cx.fillRect(0,0,DW,DH);
  if(!G)return;
  var pxc=(G.px||(G.pc+0))*0, fpx=(G.pc+0.5)*TS, fpy=(G.pr+0.5)*TS;
  /* lantai & dinding */
  for(var r=0;r<CH;r++)for(var c=0;c<CW;c++){
    var x=c*TS,y=r*TS;
    if(G.maze[r][c]===1){
      cx.fillStyle='#1a2140';cx.fillRect(x,y,TS,TS);
      cx.fillStyle='#232c56';cx.fillRect(x+2,y+2,TS-4,TS-4);
      cx.fillStyle='#151b36';cx.fillRect(x+6,y+6,TS-12,TS-12);
    } else {
      /* jarak ke pemain utk cahaya senter */
      var d=Math.hypot(c-G.pc,r-G.pr);
      var lit=Math.max(0,1-d/3.4);
      cx.fillStyle='#141a33';cx.fillRect(x,y,TS,TS);
      cx.fillStyle='#1c2445';cx.fillRect(x+1,y+1,TS-2,TS-2);
      /* ubin lantai */
      cx.strokeStyle='#232c56';cx.lineWidth=1;
      cx.strokeRect(x+8,y+8,TS-16,TS-16);
      /* cahaya senter */
      if(lit>0){
        cx.fillStyle='rgba(255,241,180,'+(lit*0.16)+')';cx.fillRect(x,y,TS,TS);
        cx.strokeStyle='rgba(255,241,180,'+(lit*0.22)+')';
        cx.strokeRect(x+8,y+8,TS-16,TS-16);
      }
      /* dekorasi kamar: noda / meja */
      if((r*31+c*17)%7===0){cx.fillStyle='rgba(120,110,90,'+(0.06+lit*0.1)+')';cx.beginPath();cx.arc(x+TS/2,y+TS/2,10,0,7);cx.fill()}
    }
  }
  /* hantu */
  for(var gi=0;gi<G.ghosts.length;gi++){
    var g2=G.ghosts[gi];
    var gx=g2.c*TS+TS/2, gy=g2.r*TS+TS/2;
    var d2=Math.hypot(g2.c-G.pc,g2.r-G.pr);
    var lit2=Math.max(0,1-d2/3.6);
    var wob=Math.sin(Date.now()/300+g2.ph)*3;
    var fade=Math.min(1,g2.t/1.2);   /* mendekati pindah: memudar */
    cx.globalAlpha=Math.max(0.15,lit2)*fade;
    /* aura */
    cx.fillStyle=g2.blue?'#4fc3f7':'#e0e0e0';
    cx.beginPath();cx.arc(gx,gy+wob,13,0,7);cx.fill();
    /* ekor berkibar */
    cx.beginPath();cx.moveTo(gx-12,gy+wob+4);
    cx.quadraticCurveTo(gx,gy+wob+16+Math.sin(Date.now()/150)*3,gx+12,gy+wob+4);
    cx.fill();
    cx.fillStyle='#1a1a2e';
    cx.beginPath();cx.arc(gx-4,gy+wob-3,2.6,0,7);cx.arc(gx+4,gy+wob-3,2.6,0,7);cx.fill();
    cx.globalAlpha=1;
    /* jangkauan jaring (petak di sekitar pemain) */
    if(Math.abs(g2.c-G.pc)<=2&&Math.abs(g2.r-G.pr)<=2){
      cx.strokeStyle=g2.blue?'#4fc3f7':'#ffd23f';cx.lineWidth=2;
      cx.setLineDash([4,4]);
      cx.strokeRect(g2.c*TS+4,g2.r*TS+4,TS-8,TS-8);
      cx.setLineDash([]);
    }
  }
  /* pemburu (pemain) */
  var px2=(G.pc+0.5)*TS, py2=(G.pr+0.5)*TS;
  cx.fillStyle='rgba(255,241,180,0.09)';
  cx.beginPath();cx.arc(px2,py2,TS*1.7,0,7);cx.fill();
  cx.fillStyle='rgba(255,241,180,0.05)';
  cx.beginPath();cx.arc(px2,py2,TS*2.6,0,7);cx.fill();
  /* topi pemburu */
  cx.fillStyle='#00000066';cx.beginPath();cx.ellipse(px2,py2+10,12,4,0,0,7);cx.fill();
  cx.fillStyle='#ffb74d';rr2(px2-8,py2-6,16,16,5);cx.fill();
  cx.fillStyle='#ffcc80';rr2(px2-8,py2-6,16,7,5);cx.fill();
  cx.fillStyle='#6d4c41';cx.beginPath();cx.arc(px2,py2-9,9,Math.PI,0);cx.fill();
  cx.fillStyle='#37474f';cx.fillRect(px2-13,py2-9,26,3);
  cx.fillStyle='#263238';cx.fillRect(px2-5,py2+8,4,4);cx.fillRect(px2+1,py2+8,4,4);
  /* efek jaring */
  if(G.net>0){
    cx.strokeStyle='#ffd23f';cx.globalAlpha=G.net/0.4;cx.lineWidth=2;
    for(var n=0;n<3;n++){cx.beginPath();cx.arc(px2,py2,(0.4-G.net+0.15+n*0.12)*TS*3,0,7);cx.stroke()}
    cx.globalAlpha=1;
  }
  /* petunjuk scan */
  if(G.scan>0){
    cx.strokeStyle='#4fc3f788';cx.lineWidth=2;cx.globalAlpha=G.scan;
    for(var sc=1;sc<=2;sc++){cx.beginPath();cx.arc(px2,py2,sc*TS,0,7);cx.stroke()}
    cx.globalAlpha=1;
  }
  /* vinyet gelap */
  var vg=cx.createRadialGradient(px2,py2,TS*1.2,px2,py2,DW*0.62);
  vg.addColorStop(0,'rgba(2,4,10,0)');vg.addColorStop(1,'rgba(2,4,10,0.93)');
  cx.fillStyle=vg;cx.fillRect(0,0,DW,DH);
}
function rr2(x,y,w,h,r){r=Math.min(r,w/2,h/2);cx.beginPath();cx.moveTo(x+r,y);cx.arcTo(x+w,y,x+w,y+h,r);cx.arcTo(x+w,y+h,x,y+h,r);cx.arcTo(x,y+h,x,y,r);cx.arcTo(x,y,x+w,y,r);cx.closePath()}
function loop(ts){
  var dt=Math.min(0.04,(ts-t0)/1000||0.016);t0=ts;
  if(G&&started&&!G.dead)step(dt);
  draw();
  if(G&&started&&!G.dead)document.getElementById('stx').textContent='Jelajahi ruangan · ketuk hantu di jangkauan!';
  requestAnimationFrame(loop);
}
function bindHold(id,dx,dy){
  var el=document.getElementById(id);
  el.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();ensureAC();el.classList.add('on');tryMove(dx,dy)},{passive:false});
  ['pointerup','pointercancel','pointerleave'].forEach(function(ev){el.addEventListener(ev,function(){el.classList.remove('on')})});
}
bindHold('dU',0,-1);bindHold('dD',0,1);bindHold('dL',-1,0);bindHold('dR',1,0);
document.getElementById('dS').addEventListener('click',function(){if(G&&!G.dead){G.scan=1;tone(900,0.08,'sine',0.05,200)}});
document.addEventListener('keydown',function(e){
  if(!G)return;
  if(e.code==='ArrowUp'||e.code==='KeyW')tryMove(0,-1);
  if(e.code==='ArrowDown'||e.code==='KeyS')tryMove(0,1);
  if(e.code==='ArrowLeft'||e.code==='KeyA')tryMove(-1,0);
  if(e.code==='ArrowRight'||e.code==='KeyD')tryMove(1,0);
});
cv.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();tapGhost(e.clientX,e.clientY)},{passive:false});
document.getElementById('bPlay').addEventListener('click',function(){ensureAC();reset();started=true;document.getElementById('ovStart').classList.add('hide');document.getElementById('ovEnd').classList.add('hide');toast('Cari 8 hantu! 👻')});
document.getElementById('bAgain').addEventListener('click',function(){ensureAC();reset();document.getElementById('ovEnd').classList.add('hide');document.getElementById('cGhost').textContent='0/8'});
document.getElementById('bSound').addEventListener('click',function(){sOn=!sOn;stSet('usanagi-ghost-snd',sOn?'1':'0');this.textContent=sOn?'🔊':'🔇';if(sOn)ensureAC()});
document.getElementById('bSound').textContent=sOn?'🔊':'🔇';
fit();requestAnimationFrame(loop);
})();
</script>
</body>
</html>`

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return
  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '👻', key: reactionKey } }).catch(() => {})
  await sendRich(conn, m.chat, 'Usanagi Umi AI Ghost Hunter 👻', 'usanagi-ai-ghost-2026', html)
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

handler.help = ['ghost', 'ghosthunter', 'berburuhantu']
handler.tags = ['game']
handler.command = /^(ghost|ghosthunter|berburuhantu)$/i
handler.category = 'game'
handler.groupOnly = false
handler.limit = false
handler.description = 'Ghost Hunter - keliling rumah gelap dengan senter, jaring 8 hantu sebelum waktu habis'

export default handler
