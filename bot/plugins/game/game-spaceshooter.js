/**
 * Space Shooter - Rich HTML Game
 * Arcade space shooter via WhatsApp interactive message
 * 
 * Commands:
 *   .spaceshooter / .space / .shooter
 * 
 * By AlzRiss - Usanagi Umi AI (clean-room build)
 */

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn) return

  const reactionKey = m?.raw?.key || m?.key
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '🚀', key: reactionKey } }).catch(() => {})

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
                messageText: 'Usanagi Umi AI Space Shooter 🚀',
              },
            ],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: 'usanagi-ai-spaceshooter-2026',
                  sections: [
                    {
                      view_model: {
                        primitive: {
                          __typename: 'GenAIaeacdsnwHtmlPrimitive',
                          payload: SPACE_SHOOTER_HTML,
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
            },
          },
        },
      },
    },
    {}
  )
}

const SPACE_SHOOTER_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#0a0e1a">
<title>Space Shooter - Usanagi Umi AI</title>
<style>
:root{--bg:#0a0e1a;--accent:#00d4ff;--gold:#ffd700;--red:#ff4757;--text:#e0e6ff;--dim:#6b7394}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{width:100%;height:100%;overflow:hidden;background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,sans-serif;touch-action:none;user-select:none}
.wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:8px}
.hud{position:fixed;top:0;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:10px 16px;background:rgba(10,14,26,.85);backdrop-filter:blur(8px);z-index:10;border-bottom:1px solid rgba(0,212,255,.15)}
.hud b{font-size:14px;color:var(--accent)}
.hud .score{font:900 20px system-ui;color:var(--gold)}
.hud .lives{font-size:18px}
canvas{display:block;border-radius:12px;background:#050816;box-shadow:0 0 40px rgba(0,212,255,.1)}
.controls{position:fixed;bottom:0;left:0;right:0;display:flex;justify-content:space-between;padding:12px 16px;background:rgba(10,14,26,.85);backdrop-filter:blur(8px);z-index:10}
.btn{width:70px;height:70px;border:2px solid var(--accent);border-radius:50%;background:rgba(0,212,255,.1);color:var(--accent);font-size:28px;display:grid;place-items:center;cursor:pointer;transition:all .1s}
.btn:active{background:rgba(0,212,255,.3);transform:scale(.92)}
.fire-btn{border-color:var(--red);color:var(--red);background:rgba(255,71,87,.1);width:80px;height:80px;font-size:32px}
.fire-btn:active{background:rgba(255,71,87,.3)}
.overlay{position:fixed;inset:0;display:grid;place-items:center;background:rgba(5,8,22,.88);backdrop-filter:blur(12px);z-index:20;opacity:0;pointer-events:none;transition:opacity .3s}
.overlay.show{opacity:1;pointer-events:auto}
.modal{text-align:center;padding:24px 20px;max-width:300px}
.modal h2{font-size:28px;margin-bottom:8px;color:var(--accent);text-shadow:0 0 20px rgba(0,212,255,.4)}
.modal p{font-size:13px;color:var(--dim);margin-bottom:16px;line-height:1.5}
.modal .btn-start{display:inline-block;padding:14px 40px;background:linear-gradient(135deg,var(--accent),#0088cc);border:0;border-radius:12px;color:#fff;font:900 16px system-ui;cursor:pointer;box-shadow:0 4px 20px rgba(0,212,255,.3)}
.modal .stats{display:flex;gap:16px;justify-content:center;margin:16px 0}
.modal .stat{text-align:center}
.modal .stat b{display:block;font-size:24px;color:var(--gold)}
.modal .stat span{font-size:10px;color:var(--dim);text-transform:uppercase;letter-spacing:1px}
</style>
</head>
<body>
<div class="hud">
  <div><b>SCORE</b><div class="score" id="score">0</div></div>
  <div style="text-align:center"><b>WAVE</b><div id="wave" style="color:var(--accent);font:900 16px system-ui">1</div></div>
  <div style="text-align:right"><b>LIVES</b><div class="lives" id="lives">❤️❤️❤️</div></div>
</div>
<canvas id="game"></canvas>
<div class="controls">
  <button class="btn" id="leftBtn">◀</button>
  <button class="btn fire-btn" id="fireBtn">🔥</button>
  <button class="btn" id="rightBtn">▶</button>
</div>
<div class="overlay show" id="overlay">
  <div class="modal">
    <h2 id="modalTitle">🚀 SPACE SHOOTER</h2>
    <p id="modalText">Hancurkan musuh, hindari peluru!<br>🚀 Kontrol: tombol di bawah</p>
    <div class="stats" id="modalStats" style="display:none">
      <div class="stat"><b id="finalScore">0</b><span>Score</span></div>
      <div class="stat"><b id="finalWave">1</b><span>Wave</span></div>
      <div class="stat"><b id="bestScore">0</b><span>Best</span></div>
    </div>
    <button class="btn-start" id="startBtn">🚀 MULAI</button>
  </div>
</div>
<script>
'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const scoreEl=document.getElementById('score'),livesEl=document.getElementById('lives'),waveEl=document.getElementById('wave');
const overlay=document.getElementById('overlay'),modalTitle=document.getElementById('modalTitle');
const modalText=document.getElementById('modalText'),modalStats=document.getElementById('modalStats');
const finalScore=document.getElementById('finalScore'),finalWave=document.getElementById('finalWave'),bestScoreEl=document.getElementById('bestScore');

let W,H,player,bullets,enemyBullets,enemies,particles,score,lives,wave,waveTimer,gameOver,best=0;
let leftPressed=false,rightPressed=false,firePressed=false,fireCooldown=0;

function resize(){
  const dpr=window.devicePixelRatio||1;
  W=Math.min(window.innerWidth-16,420);H=Math.min(window.innerHeight-180,600);
  canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+'px';canvas.style.height=H+'px';
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
resize();window.addEventListener('resize',resize);

function init(){
  player={x:W/2,y:H-60,w:30,h:30,speed:5};
  bullets=[];enemyBullets=[];enemies=[];particles=[];
  score=0;lives=3;wave=1;waveTimer=0;gameOver=false;fireCooldown=0;
  updateHUD();spawnWave();
}

function spawnWave(){
  const count=3+wave*2;
  const cols=Math.min(count,6);
  const rows=Math.ceil(count/cols);
  const ew=24,eh=24,gap=12;
  const totalW=cols*(ew+gap)-gap;
  const startX=(W-totalW)/2;
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      if(enemies.length>=count)break;
      enemies.push({x:startX+c*(ew+gap)+ew/2,y:40+r*(eh+gap),w:ew,h:eh,
        speed:0.3+wave*0.1,dir:1,hp:1+Math.floor(wave/3),color:['#ff4757','#ff6b81','#ffa502','#2ed573'][r%4],
        shootTimer:Math.random()*120+60});
    }
  }
}

function spawnParticles(x,y,color,count=8){
  for(let i=0;i<count;i++){
    const angle=Math.random()*Math.PI*2;
    const speed=Math.random()*3+1;
    particles.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
      life:30+Math.random()*20,maxLife:50,color,size:Math.random()*3+1});
  }
}

function updateHUD(){
  scoreEl.textContent=score;
  livesEl.textContent='❤️'.repeat(Math.max(0,lives));
  waveEl.textContent=wave;
}

function shoot(){
  if(fireCooldown>0)return;
  bullets.push({x:player.x,y:player.y-15,w:4,h:12,speed:8});
  fireCooldown=8;
}

function update(){
  if(gameOver)return;
  if(fireCooldown>0)fireCooldown--;
  
  // Player movement
  if(leftPressed)player.x-=player.speed;
  if(rightPressed)player.x+=player.speed;
  player.x=Math.max(player.w/2,Math.min(W-player.w/2,player.x));
  if(firePressed)shoot();
  
  // Bullets
  for(let i=bullets.length-1;i>=0;i--){
    bullets[i].y-=bullets[i].speed;
    if(bullets[i].y<-20){bullets.splice(i,1);continue;}
    // Hit enemies
    for(let j=enemies.length-1;j>=0;j--){
      const b=bullets[i],e=enemies[j];
      if(!b)break;
      if(Math.abs(b.x-e.x)<(b.w+e.w)/2&&Math.abs(b.y-e.y)<(b.h+e.h)/2){
        e.hp--;
        spawnParticles(e.x,e.y,e.color,4);
        bullets.splice(i,1);
        if(e.hp<=0){
          score+=10*wave;
          spawnParticles(e.x,e.y,e.color,12);
          enemies.splice(j,1);
          updateHUD();
        }
        break;
      }
    }
  }
  
  // Enemy bullets
  for(let i=enemyBullets.length-1;i>=0;i--){
    enemyBullets[i].y+=enemyBullets[i].speed;
    if(enemyBullets[i].y>H+20){enemyBullets.splice(i,1);continue;}
    const b=enemyBullets[i];
    if(Math.abs(b.x-player.x)<(b.w+player.w)/2&&Math.abs(b.y-player.y)<(b.h+player.h)/2){
      enemyBullets.splice(i,1);
      lives--;
      spawnParticles(player.x,player.y,'#00d4ff',10);
      updateHUD();
      if(lives<=0){endGame();return;}
    }
  }
  
  // Enemies
  let hitEdge=false;
  for(const e of enemies){
    e.x+=e.speed*e.dir;
    if(e.x<e.w/2||e.x>W-e.w/2)hitEdge=true;
    e.shootTimer--;
    if(e.shootTimer<=0){
      enemyBullets.push({x:e.x,y:e.y+e.h/2,w:4,h:10,speed:3+wave*0.3});
      e.shootTimer=Math.max(30,120-wave*8+Math.random()*60);
    }
  }
  if(hitEdge)for(const e of enemies){e.dir*=-1;e.y+=10;}
  
  // Check if enemies reached bottom
  for(const e of enemies){
    if(e.y+e.h/2>player.y-20){endGame();return;}
  }
  
  // Particles
  for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];
    p.x+=p.vx;p.y+=p.vy;p.life--;p.vx*=0.96;p.vy*=0.96;
    if(p.life<=0)particles.splice(i,1);
  }
  
  // Next wave
  if(enemies.length===0){
    waveTimer++;
    if(waveTimer>60){wave++;waveTimer=0;spawnWave();updateHUD();}
  }
}

function draw(){
  // Stars background
  ctx.fillStyle='#050816';ctx.fillRect(0,0,W,H);
  const t=Date.now()/1000;
  for(let i=0;i<40;i++){
    const sx=(i*137.5+t*20*(1+i%3))%W;
    const sy=(i*89.3+t*15*(1+i%2))%H;
    ctx.fillStyle='rgba(255,255,255,'+(0.2+Math.sin(t+i)*0.15)+')';
    ctx.fillRect(sx,sy,1.5,1.5);
  }
  
  // Player
  ctx.save();
  ctx.translate(player.x,player.y);
  ctx.fillStyle='#00d4ff';
  ctx.beginPath();ctx.moveTo(0,-15);ctx.lineTo(-12,12);ctx.lineTo(0,6);ctx.lineTo(12,12);ctx.closePath();ctx.fill();
  ctx.fillStyle='#0088cc';
  ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(-6,8);ctx.lineTo(0,4);ctx.lineTo(6,8);ctx.closePath();ctx.fill();
  // Engine glow
  ctx.fillStyle='rgba(0,212,255,'+(0.3+Math.sin(t*10)*0.2)+')';
  ctx.beginPath();ctx.ellipse(0,12,6,8+Math.sin(t*15)*3,0,0,Math.PI*2);ctx.fill();
  ctx.restore();
  
  // Bullets
  for(const b of bullets){
    ctx.fillStyle='#00d4ff';
    ctx.shadowBlur=8;ctx.shadowColor='#00d4ff';
    ctx.fillRect(b.x-b.w/2,b.y-b.h/2,b.w,b.h);
    ctx.shadowBlur=0;
  }
  
  // Enemy bullets
  for(const b of enemyBullets){
    ctx.fillStyle='#ff4757';
    ctx.shadowBlur=6;ctx.shadowColor='#ff4757';
    ctx.fillRect(b.x-b.w/2,b.y-b.h/2,b.w,b.h);
    ctx.shadowBlur=0;
  }
  
  // Enemies
  for(const e of enemies){
    ctx.fillStyle=e.color;
    ctx.save();ctx.translate(e.x,e.y);
    ctx.fillRect(-e.w/2,-e.h/2,e.w,e.h);
    ctx.fillStyle='rgba(255,255,255,.3)';
    ctx.fillRect(-e.w/2+3,-e.h/2+3,6,6);
    ctx.fillRect(e.w/2-9,-e.h/2+3,6,6);
    if(e.hp>1){
      ctx.fillStyle='rgba(255,255,255,.15)';
      ctx.fillRect(-e.w/2,-e.h/2,e.w,e.h);
    }
    ctx.restore();
  }
  
  // Particles
  for(const p of particles){
    const alpha=p.life/p.maxLife;
    ctx.fillStyle=p.color.replace(')',', '+alpha+')').replace('rgb','rgba');
    ctx.beginPath();ctx.arc(p.x,p.y,p.size*alpha,0,Math.PI*2);ctx.fill();
  }
  
  // Wave text
  if(waveTimer>0&&waveTimer<60&&enemies.length===0){
    ctx.fillStyle='rgba(0,212,255,'+Math.sin(waveTimer/60*Math.PI)+')';
    ctx.font='900 28px system-ui';ctx.textAlign='center';
    ctx.fillText('WAVE '+(wave+1),W/2,H/2);
  }
}

function endGame(){
  gameOver=true;
  if(score>best)best=score;
  modalTitle.textContent='💀 GAME OVER';
  modalText.textContent='Kapalmu hancur!';
  finalScore.textContent=score;
  finalWave.textContent=wave;
  bestScoreEl.textContent=best;
  modalStats.style.display='flex';
  document.getElementById('startBtn').textContent='🔄 MAIN LAGI';
  overlay.classList.add('show');
}

function loop(){update();draw();requestAnimationFrame(loop);}

// Controls
const leftBtn=document.getElementById('leftBtn');
const rightBtn=document.getElementById('rightBtn');
const fireBtn=document.getElementById('fireBtn');

leftBtn.addEventListener('touchstart',e=>{e.preventDefault();leftPressed=true;},{passive:false});
leftBtn.addEventListener('touchend',e=>{e.preventDefault();leftPressed=false;},{passive:false});
leftBtn.addEventListener('mousedown',()=>leftPressed=true);
leftBtn.addEventListener('mouseup',()=>leftPressed=false);

rightBtn.addEventListener('touchstart',e=>{e.preventDefault();rightPressed=true;},{passive:false});
rightBtn.addEventListener('touchend',e=>{e.preventDefault();rightPressed=false;},{passive:false});
rightBtn.addEventListener('mousedown',()=>rightPressed=true);
rightBtn.addEventListener('mouseup',()=>rightPressed=false);

fireBtn.addEventListener('touchstart',e=>{e.preventDefault();firePressed=true;},{passive:false});
fireBtn.addEventListener('touchend',e=>{e.preventDefault();firePressed=false;},{passive:false});
fireBtn.addEventListener('mousedown',()=>firePressed=true);
fireBtn.addEventListener('mouseup',()=>firePressed=false);

// Keyboard
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowLeft'||e.key==='a')leftPressed=true;
  if(e.key==='ArrowRight'||e.key==='d')rightPressed=true;
  if(e.key===' '||e.key==='Enter')firePressed=true;
});
document.addEventListener('keyup',e=>{
  if(e.key==='ArrowLeft'||e.key==='a')leftPressed=false;
  if(e.key==='ArrowRight'||e.key==='d')rightPressed=false;
  if(e.key===' '||e.key==='Enter')firePressed=false;
});

document.getElementById('startBtn').addEventListener('click',()=>{
  overlay.classList.remove('show');init();
});
document.getElementById('startBtn').addEventListener('touchend',e=>{
  e.preventDefault();overlay.classList.remove('show');init();
},{passive:false});

loop();
</script>
</body>
</html>`

handler.help = ['spaceshooter', 'space', 'shooter']
handler.tags = ['game']
handler.command = /^(spaceshooter|space|shooter|spacegame|richspaceshooter)$/i
handler.limit = false

export default handler