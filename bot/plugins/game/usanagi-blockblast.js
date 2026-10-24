
'use strict'

import { randomUUID } from 'node:crypto'

const htmlPayload = `<style>
*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;box-sizing:border-box}
body{margin:0;background:transparent;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer}
.bb-wrap{width:100%;max-width:540px;margin:auto;padding:12px}
.bb-card{background:rgba(15,18,28,.88);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(0,243,255,.25);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,243,255,.15),0 0 15px rgba(157,78,221,.2)}
.bb-header{padding:12px 16px;border-bottom:1px solid rgba(255,255,255,.1);display:flex;justify-content:space-between;align-items:center;background:linear-gradient(90deg,rgba(0,243,255,.05),rgba(157,78,221,.05))}
.bb-sub{font-size:10px;letter-spacing:2px;color:#00f3ff;font-weight:700;text-transform:uppercase;display:flex;align-items:center;gap:4px}
.bb-title{font-size:19px;font-weight:900;color:#fff;text-shadow:0 0 10px rgba(0,243,255,.6);letter-spacing:1px}
.bb-stats{text-align:right;display:flex;align-items:center;gap:12px}
.bb-score{font-size:20px;font-weight:900;color:#00f3ff;text-shadow:0 0 12px rgba(0,243,255,.8);transition:transform .15s ease-out}
.bb-best{font-size:10px;color:rgba(255,255,255,.5);font-weight:600;margin-top:1px;display:flex;align-items:center;justify-content:flex-end;gap:3px}
.bb-audio-btn{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);border-radius:8px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s ease;padding:0}
.bb-audio-btn:active{transform:scale(.9)}
.bb-body{padding:12px;position:relative}
canvas#game{width:100%;height:auto;background:#080b12;border:1px solid rgba(0,243,255,.2);border-radius:12px;display:block;box-shadow:inset 0 0 20px rgba(0,0,0,.8);touch-action:none}
.bb-status{display:flex;justify-content:space-between;margin-top:8px;font-size:11px;color:rgba(255,255,255,.6);font-weight:600}
.svg-icon{display:inline-block;vertical-align:middle}
</style>

<div class="bb-wrap">
<div class="bb-card">
<div class="bb-header">
<div>
<div class="bb-sub">
<svg class="svg-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00f3ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"></rect><path d="M6 12h4m-2-2v4"></path><circle cx="17" cy="10" r="1" fill="#00f3ff"></circle><circle cx="15" cy="13" r="1" fill="#00f3ff"></circle></svg>
HIRARA ARCADE
</div>
<div class="bb-title">Block Blast Mini</div>
</div>
<div class="bb-stats">
<button id="soundToggle" class="bb-audio-btn" title="Toggle Sound">
<svg id="iconAudioOn" class="svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f3ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
<svg id="iconAudioOff" class="svg-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
</button>
<div>
<div id="score" class="bb-score">0000</div>
<div id="best" class="bb-best">
<svg class="svg-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path></svg>
<span id="bestText">BEST 0000</span>
</div>
</div>
</div>
</div>

<div class="bb-body">
<canvas id="game" width="540" height="660"></canvas>
<div class="bb-status">
<span id="comboStatus">Combo: 0x</span>
<span id="linesStatus">Lines Cleared: 0</span>
</div>
<div style="font-size:10px;color:rgba(0,243,255,.5);text-align:center;margin-top:6px;font-weight:600;letter-spacing:1px">By AlzRiss - Usanagi Umi AI</div>
</div>
</div>
</div>

<script>
(function(){
'use strict';

const c=document.getElementById('game');
const ctx=c.getContext('2d');
const scoreEl=document.getElementById('score');
const bestTextEl=document.getElementById('bestText');
const comboStatus=document.getElementById('comboStatus');
const linesStatus=document.getElementById('linesStatus');
const soundBtn=document.getElementById('soundToggle');
const iconAudioOn=document.getElementById('iconAudioOn');
const iconAudioOff=document.getElementById('iconAudioOff');

const GRID_SIZE=8;
const CELL_SIZE=54;
const CELL_GAP=4;
const BOARD_W=GRID_SIZE*CELL_SIZE+(GRID_SIZE-1)*CELL_GAP;
const BOARD_X=(c.width-BOARD_W)/2;
const BOARD_Y=20;

let audioCtx=null;
let soundMuted=false;

function initAudio(){
if(!audioCtx){
const AudioCtx=window.AudioContext||window.webkitAudioContext;
if(AudioCtx)audioCtx=new AudioCtx();
}
if(audioCtx&&audioCtx.state==='suspended'){
audioCtx.resume().catch(function(){});
}
}

soundBtn.addEventListener('click',function(e){
e.stopPropagation();
soundMuted=!soundMuted;

if(soundMuted){
iconAudioOn.style.display='none';
iconAudioOff.style.display='inline-block';
}else{
iconAudioOn.style.display='inline-block';
iconAudioOff.style.display='none';
}
});

function playSound(type){
if(soundMuted)return;

initAudio();
if(!audioCtx)return;

try{
const now=audioCtx.currentTime;

if(type==='place'){
const osc=audioCtx.createOscillator();
const gain=audioCtx.createGain();

osc.type='sine';
osc.frequency.setValueAtTime(320,now);
osc.frequency.exponentialRampToValueAtTime(560,now+.08);
gain.gain.setValueAtTime(.15,now);
gain.gain.exponentialRampToValueAtTime(.01,now+.08);

osc.connect(gain);
gain.connect(audioCtx.destination);
osc.start(now);
osc.stop(now+.08);
}else if(type==='clear'){
const osc=audioCtx.createOscillator();
const gain=audioCtx.createGain();

osc.type='triangle';
osc.frequency.setValueAtTime(440,now);
osc.frequency.setValueAtTime(659,now+.08);
osc.frequency.setValueAtTime(880,now+.16);
gain.gain.setValueAtTime(.2,now);
gain.gain.exponentialRampToValueAtTime(.01,now+.28);

osc.connect(gain);
gain.connect(audioCtx.destination);
osc.start(now);
osc.stop(now+.28);
}else if(type==='combo'){
const osc=audioCtx.createOscillator();
const gain=audioCtx.createGain();

osc.type='sine';
osc.frequency.setValueAtTime(600,now);
osc.frequency.exponentialRampToValueAtTime(1200,now+.2);
gain.gain.setValueAtTime(.2,now);
gain.gain.exponentialRampToValueAtTime(.01,now+.2);

osc.connect(gain);
gain.connect(audioCtx.destination);
osc.start(now);
osc.stop(now+.2);
}else if(type==='over'){
const osc=audioCtx.createOscillator();
const gain=audioCtx.createGain();

osc.type='sawtooth';
osc.frequency.setValueAtTime(200,now);
osc.frequency.exponentialRampToValueAtTime(50,now+.35);
gain.gain.setValueAtTime(.25,now);
gain.gain.exponentialRampToValueAtTime(.01,now+.35);

osc.connect(gain);
gain.connect(audioCtx.destination);
osc.start(now);
osc.stop(now+.35);
}
}catch{}
}

function loadBest(){
const vals=[];

try{
const value=localStorage.getItem('bb_best');
if(value)vals.push(parseInt(value,10));
}catch{}

try{
const value=sessionStorage.getItem('bb_best');
if(value)vals.push(parseInt(value,10));
}catch{}

try{
const match=document.cookie.match(/(?:^|;\\s*)bb_best=(\\d+)/);
if(match)vals.push(parseInt(match[1],10));
}catch{}

const valid=vals.filter(function(value){
return Number.isFinite(value);
});

return valid.length?Math.max.apply(null,valid):0;
}

function saveBest(value){
const stringValue=String(Math.floor(value));

try{
localStorage.setItem('bb_best',stringValue);
}catch{}

try{
sessionStorage.setItem('bb_best',stringValue);
}catch{}

try{
document.cookie='bb_best='+stringValue+';max-age=31536000;path=/';
}catch{}

try{
const request=indexedDB.open('bb_db',1);

request.onupgradeneeded=function(){
try{
request.result.createObjectStore('kv');
}catch{}
};

request.onsuccess=function(){
try{
request.result.transaction('kv','readwrite').objectStore('kv').put(stringValue,'bb_best');
}catch{}
};
}catch{}
}

function loadBestAsync(callback){
try{
const request=indexedDB.open('bb_db',1);

request.onupgradeneeded=function(){
try{
request.result.createObjectStore('kv');
}catch{}
};

request.onsuccess=function(){
try{
const getRequest=request.result.transaction('kv','readonly').objectStore('kv').get('bb_best');

getRequest.onsuccess=function(){
if(getRequest.result!==undefined&&getRequest.result!==null){
const value=parseInt(getRequest.result,10);
if(Number.isFinite(value))callback(value);
}
};
}catch{}
};
}catch{}
}

let bestScore=loadBest();

loadBestAsync(function(value){
if(value>bestScore){
bestScore=value;
bestTextEl.textContent='BEST '+String(Math.floor(bestScore)).padStart(4,'0');
}
});

const PIECES=[
{shape:[[1]],color:'#00f3ff'},
{shape:[[1,1]],color:'#4cc9f0'},
{shape:[[1],[1]],color:'#4cc9f0'},
{shape:[[1,1,1]],color:'#9d4edd'},
{shape:[[1],[1],[1]],color:'#9d4edd'},
{shape:[[1,1,1,1]],color:'#ff007f'},
{shape:[[1],[1],[1]],color:'#ff007f'},
{shape:[[1,1],[1,1]],color:'#ffb703'},
{shape:[[1,0],[1,1]],color:'#00ff87'},
{shape:[[0,1],[1,1]],color:'#00ff87'},
{shape:[[1,1],[1,0]],color:'#00ff87'},
{shape:[[1,1],[0,1]],color:'#00ff87'},
{shape:[[1,0,0],[1,1,1]],color:'#ff5e00'},
{shape:[[0,0,1],[1,1,1]],color:'#ff5e00'},
{shape:[[1,1,1],[1,0,0]],color:'#ff5e00'},
{shape:[[1,1,1],[0,0,1]],color:'#ff5e00'},
{shape:[[1,1,1],[0,1,0]],color:'#b5179e'},
{shape:[[0,1,0],[1,1,1]],color:'#b5179e'},
{shape:[[1,0],[1,1],[1,0]],color:'#b5179e'},
{shape:[[0,1],[1,1],[0,1]],color:'#b5179e'},
{shape:[[1,1],[1,0]],color:'#7209b7'},
{shape:[[1,1],[0,1]],color:'#7209b7'}
];

const STATE_PLAYING=1;
const STATE_GAMEOVER=2;

let gameState=STATE_PLAYING;
let grid=[];
let tray=[null,null,null];
let draggedIndex=-1;
let dragX=0;
let dragY=0;
let isPointerDown=false;
let particles=[];
let floatingTexts=[];
let clearingCells=[];
let shake=0;

const TRAY_Y=555;
const TRAY_SLOTS=[
{x:90,y:TRAY_Y},
{x:270,y:TRAY_Y},
{x:450,y:TRAY_Y}
];

let score=0;
let totalLines=0;
let combo=0;

function getRandomPiece(){
const piece=PIECES[Math.floor(Math.random()*PIECES.length)];

return{
shape:JSON.parse(JSON.stringify(piece.shape)),
color:piece.color
};
}

function spawnTrayPieces(){
for(let i=0;i<3;i++){
if(tray[i]===null){
tray[i]=getRandomPiece();
}
}
}

function resetGame(){
grid=[];

for(let r=0;r<GRID_SIZE;r++){
grid[r]=[];

for(let c=0;c<GRID_SIZE;c++){
grid[r][c]=null;
}
}

tray=[null,null,null];
spawnTrayPieces();

score=0;
totalLines=0;
combo=0;
draggedIndex=-1;
particles=[];
floatingTexts=[];
clearingCells=[];
shake=0;

scoreEl.textContent='0000';
bestTextEl.textContent='BEST '+String(Math.floor(bestScore)).padStart(4,'0');
comboStatus.textContent='Combo: 0x';
linesStatus.textContent='Lines Cleared: 0';
}

function canPlacePiece(piece,targetRow,targetCol){
if(!piece)return false;

const rows=piece.shape.length;
const cols=piece.shape[0].length;

for(let r=0;r<rows;r++){
for(let c=0;c<cols;c++){
if(piece.shape[r][c]===1){
const gr=targetRow+r;
const gc=targetCol+c;

if(gr<0||gr>=GRID_SIZE||gc<0||gc>=GRID_SIZE)return false;
if(grid[gr][gc]!==null)return false;
}
}
}

return true;
}

function checkGameOver(){
for(let i=0;i<3;i++){
const piece=tray[i];

if(piece){
for(let r=0;r<GRID_SIZE;r++){
for(let c=0;c<GRID_SIZE;c++){
if(canPlacePiece(piece,r,c))return false;
}
}
}
}

return true;
}

function addBurst(x,y,count,color){
for(let i=0;i<count;i++){
const angle=Math.random()*Math.PI*2;
const speed=Math.random()*4+1;

particles.push({
x:x,
y:y,
vx:Math.cos(angle)*speed,
vy:Math.sin(angle)*speed,
life:1,
color:color,
size:Math.random()*4+2
});
}
}

function addFloatingText(text,x,y,color){
floatingTexts.push({
text:text,
x:x,
y:y,
vy:-1.2,
life:1,
color:color
});
}

function placePiece(pieceIndex,targetRow,targetCol){
const piece=tray[pieceIndex];

if(!piece)return;

const rows=piece.shape.length;
const cols=piece.shape[0].length;
let placedCellCount=0;

for(let r=0;r<rows;r++){
for(let c=0;c<cols;c++){
if(piece.shape[r][c]===1){
const gr=targetRow+r;
const gc=targetCol+c;

grid[gr][gc]={color:piece.color};
placedCellCount++;

const cx=BOARD_X+gc*(CELL_SIZE+CELL_GAP)+CELL_SIZE/2;
const cy=BOARD_Y+gr*(CELL_SIZE+CELL_GAP)+CELL_SIZE/2;

addBurst(cx,cy,4,piece.color);
}
}
}

playSound('place');
score+=placedCellCount*10;
tray[pieceIndex]=null;

const fullRows=[];
const fullCols=[];

for(let r=0;r<GRID_SIZE;r++){
let full=true;

for(let c=0;c<GRID_SIZE;c++){
if(grid[r][c]===null){
full=false;
break;
}
}

if(full)fullRows.push(r);
}

for(let c=0;c<GRID_SIZE;c++){
let full=true;

for(let r=0;r<GRID_SIZE;r++){
if(grid[r][c]===null){
full=false;
break;
}
}

if(full)fullCols.push(c);
}

const clearedLineCount=fullRows.length+fullCols.length;

if(clearedLineCount>0){
combo++;
totalLines+=clearedLineCount;
shake=12;

fullRows.forEach(function(r){
for(let c=0;c<GRID_SIZE;c++){
const cx=BOARD_X+c*(CELL_SIZE+CELL_GAP)+CELL_SIZE/2;
const cy=BOARD_Y+r*(CELL_SIZE+CELL_GAP)+CELL_SIZE/2;

clearingCells.push({
r:r,
c:c,
color:grid[r][c]?grid[r][c].color:'#00f3ff',
life:1
});

addBurst(cx,cy,6,'#ffffff');
grid[r][c]=null;
}
});

fullCols.forEach(function(c){
for(let r=0;r<GRID_SIZE;r++){
const cx=BOARD_X+c*(CELL_SIZE+CELL_GAP)+CELL_SIZE/2;
const cy=BOARD_Y+r*(CELL_SIZE+CELL_GAP)+CELL_SIZE/2;

if(grid[r][c]!==null){
clearingCells.push({
r:r,
c:c,
color:grid[r][c].color,
life:1
});

addBurst(cx,cy,6,'#ffffff');
grid[r][c]=null;
}
}
});

const lineBonus=clearedLineCount*120*combo;
score+=lineBonus;

if(combo>1){
playSound('combo');
addFloatingText('COMBO x'+combo+'!',BOARD_X+BOARD_W/2,BOARD_Y+120,'#ff007f');
}else{
playSound('clear');
addFloatingText('CLEAR +'+lineBonus,BOARD_X+BOARD_W/2,BOARD_Y+120,'#00f3ff');
}

comboStatus.textContent='Combo: '+combo+'x';
linesStatus.textContent='Lines Cleared: '+totalLines;
}else{
combo=0;
comboStatus.textContent='Combo: 0x';
}

if(score>bestScore){
bestScore=score;
saveBest(bestScore);
}

scoreEl.textContent=String(Math.floor(score)).padStart(4,'0');
bestTextEl.textContent='BEST '+String(Math.floor(bestScore)).padStart(4,'0');

if(tray[0]===null&&tray[1]===null&&tray[2]===null){
spawnTrayPieces();
}

if(checkGameOver()){
gameState=STATE_GAMEOVER;
playSound('over');
shake=18;
}
}

function getCanvasCoords(event){
const rect=c.getBoundingClientRect();
const scaleX=c.width/rect.width;
const scaleY=c.height/rect.height;
const clientX=event.touches?event.touches[0].clientX:event.clientX;
const clientY=event.touches?event.touches[0].clientY:event.clientY;

return{
x:(clientX-rect.left)*scaleX,
y:(clientY-rect.top)*scaleY
};
}

function update(dt){
if(shake>0){
shake=Math.max(0,shake-.6*dt);
}

particles.forEach(function(particle){
particle.x+=particle.vx*dt;
particle.y+=particle.vy*dt;
particle.life-=.03*dt;
});

particles=particles.filter(function(particle){
return particle.life>0;
});

floatingTexts.forEach(function(item){
item.y+=item.vy*dt;
item.life-=.02*dt;
});

floatingTexts=floatingTexts.filter(function(item){
return item.life>0;
});

clearingCells.forEach(function(item){
item.life-=.05*dt;
});

clearingCells=clearingCells.filter(function(item){
return item.life>0;
});
}

function drawPieceShape(piece,startX,startY,scale,alpha,isGhost,isValid){
const rows=piece.shape.length;
const cols=piece.shape[0].length;
const size=CELL_SIZE*scale;
const gap=CELL_GAP*scale;

ctx.save();
ctx.globalAlpha=alpha;

for(let r=0;r<rows;r++){
for(let c=0;c<cols;c++){
if(piece.shape[r][c]===1){
const x=startX+c*(size+gap);
const y=startY+r*(size+gap);

if(isGhost){
ctx.fillStyle=isValid?'rgba(0,243,255,.45)':'rgba(255,0,85,.35)';
ctx.fillRect(x,y,size,size);
ctx.strokeStyle=isValid?'#00f3ff':'#ff0055';
ctx.lineWidth=2;
ctx.strokeRect(x,y,size,size);
}else{
ctx.shadowColor=piece.color;
ctx.shadowBlur=8;
ctx.fillStyle=piece.color;
ctx.fillRect(x,y,size,size);
ctx.fillStyle='rgba(255,255,255,.25)';
ctx.fillRect(x+3,y+3,size-6,size/3);
}
}
}
}

ctx.restore();
}

function draw(){
ctx.clearRect(0,0,c.width,c.height);

ctx.save();

if(shake>0){
ctx.translate(
(Math.random()-.5)*shake,
(Math.random()-.5)*shake
);
}

const bgGrad=ctx.createLinearGradient(0,0,0,c.height);
bgGrad.addColorStop(0,'#060911');
bgGrad.addColorStop(1,'#0e1322');

ctx.fillStyle=bgGrad;
ctx.fillRect(0,0,c.width,c.height);

ctx.fillStyle='rgba(15,20,32,.8)';
ctx.strokeStyle='rgba(0,243,255,.2)';
ctx.lineWidth=2;

ctx.beginPath();
ctx.roundRect(
BOARD_X-10,
BOARD_Y-10,
BOARD_W+20,
BOARD_W+20,
14
);
ctx.fill();
ctx.stroke();

for(let r=0;r<GRID_SIZE;r++){
for(let col=0;col<GRID_SIZE;col++){
const x=BOARD_X+col*(CELL_SIZE+CELL_GAP);
const y=BOARD_Y+r*(CELL_SIZE+CELL_GAP);

ctx.fillStyle='rgba(255,255,255,.03)';
ctx.strokeStyle='rgba(255,255,255,.06)';
ctx.lineWidth=1;

ctx.fillRect(
x,
y,
CELL_SIZE,
CELL_SIZE
);

ctx.strokeRect(
x,
y,
CELL_SIZE,
CELL_SIZE
);

if(grid[r][col]!==null){
ctx.save();

ctx.shadowColor=grid[r][col].color;
ctx.shadowBlur=6;
ctx.fillStyle=grid[r][col].color;
ctx.fillRect(
x,
y,
CELL_SIZE,
CELL_SIZE
);

ctx.fillStyle='rgba(255,255,255,.2)';
ctx.fillRect(
x+4,
y+4,
CELL_SIZE-8,
CELL_SIZE/3
);

ctx.restore();
}
}
}

clearingCells.forEach(function(cell){
const x=BOARD_X+cell.c*(CELL_SIZE+CELL_GAP);
const y=BOARD_Y+cell.r*(CELL_SIZE+CELL_GAP);

ctx.save();
ctx.globalAlpha=cell.life;
ctx.fillStyle='#ffffff';
ctx.shadowColor=cell.color;
ctx.shadowBlur=16;
ctx.fillRect(
x,
y,
CELL_SIZE,
CELL_SIZE
);
ctx.restore();
});

if(draggedIndex!==-1&&tray[draggedIndex]){
const piece=tray[draggedIndex];
const pieceW=piece.shape[0].length;
const pieceH=piece.shape.length;
const targetCenterX=dragX;
const targetCenterY=dragY-65;
const piecePxW=pieceW*CELL_SIZE+(pieceW-1)*CELL_GAP;
const piecePxH=pieceH*CELL_SIZE+(pieceH-1)*CELL_GAP;
const tlX=targetCenterX-piecePxW/2;
const tlY=targetCenterY-piecePxH/2;
const col=Math.round((tlX-BOARD_X)/(CELL_SIZE+CELL_GAP));
const row=Math.round((tlY-BOARD_Y)/(CELL_SIZE+CELL_GAP));
const isValid=canPlacePiece(piece,row,col);

if(col>=0&&col<GRID_SIZE&&row>=0&&row<GRID_SIZE){
const ghostX=BOARD_X+col*(CELL_SIZE+CELL_GAP);
const ghostY=BOARD_Y+row*(CELL_SIZE+CELL_GAP);

drawPieceShape(
piece,
ghostX,
ghostY,
1,
.7,
true,
isValid
);
}
}

ctx.fillStyle='rgba(255,255,255,.02)';
ctx.strokeStyle='rgba(255,255,255,.08)';
ctx.lineWidth=1;

ctx.beginPath();
ctx.roundRect(
BOARD_X-10,
TRAY_Y-45,
BOARD_W+20,
130,
14
);
ctx.fill();
ctx.stroke();

for(let i=0;i<3;i++){
if(tray[i]&&i!==draggedIndex){
const piece=tray[i];
const pW=piece.shape[0].length;
const pH=piece.shape.length;
const scale=.55;
const pPxW=(pW*CELL_SIZE+(pW-1)*CELL_GAP)*scale;
const pPxH=(pH*CELL_SIZE+(pH-1)*CELL_GAP)*scale;
const startX=TRAY_SLOTS[i].x-pPxW/2;
const startY=TRAY_SLOTS[i].y-pPxH/2;

drawPieceShape(
piece,
startX,
startY,
scale,
1
);
}
}

if(draggedIndex!==-1&&tray[draggedIndex]){
const piece=tray[draggedIndex];
const pW=piece.shape[0].length;
const pH=piece.shape.length;
const pPxW=pW*CELL_SIZE+(pW-1)*CELL_GAP;
const pPxH=pH*CELL_SIZE+(pH-1)*CELL_GAP;
const startX=dragX-pPxW/2;
const startY=dragY-65-pPxH/2;

drawPieceShape(
piece,
startX,
startY,
1,
.95
);
}

particles.forEach(function(particle){
ctx.save();
ctx.globalAlpha=Math.max(0,particle.life);
ctx.shadowColor=particle.color;
ctx.shadowBlur=6;
ctx.fillStyle=particle.color;
ctx.fillRect(
particle.x,
particle.y,
particle.size,
particle.size
);
ctx.restore();
});

floatingTexts.forEach(function(item){
ctx.save();
ctx.globalAlpha=Math.max(0,item.life);
ctx.shadowColor=item.color;
ctx.shadowBlur=12;
ctx.font='900 24px "Segoe UI",sans-serif';
ctx.fillStyle=item.color;
ctx.textAlign='center';
ctx.fillText(
item.text,
item.x,
item.y
);
ctx.restore();
});

ctx.restore();

if(gameState===STATE_GAMEOVER){
ctx.fillStyle='rgba(6,9,17,.8)';
ctx.fillRect(
0,
0,
c.width,
c.height
);

ctx.save();

ctx.textAlign='center';
ctx.shadowColor='#ff0055';
ctx.shadowBlur=20;
ctx.font='900 34px "Segoe UI",sans-serif';
ctx.fillStyle='#ff0055';

ctx.fillText(
'NO MORE MOVES!',
c.width/2,
c.height/2-35
);

ctx.shadowBlur=0;
ctx.font='700 18px "Segoe UI",sans-serif';
ctx.fillStyle='#ffffff';

ctx.fillText(
'SCORE: '+Math.floor(score),
c.width/2,
c.height/2+5
);

ctx.font='600 13px "Segoe UI",sans-serif';
ctx.fillStyle='#00f3ff';

ctx.fillText(
'TAP UNTUK MAIN LAGI',
c.width/2,
c.height/2+42
);

ctx.restore();
}
}

function gameLoop(){
update(1);
draw();
requestAnimationFrame(gameLoop);
}

function handlePointerDown(event){
initAudio();

if(event.cancelable&&String(event.type).startsWith('touch')){
event.preventDefault();
}

if(gameState===STATE_GAMEOVER){
gameState=STATE_PLAYING;
resetGame();
return;
}

const position=getCanvasCoords(event);

isPointerDown=true;
dragX=position.x;
dragY=position.y;

for(let i=0;i<3;i++){
if(tray[i]){
const slot=TRAY_SLOTS[i];
const dx=Math.abs(position.x-slot.x);
const dy=Math.abs(position.y-slot.y);

if(dx<65&&dy<65){
draggedIndex=i;
break;
}
}
}
}

function handlePointerMove(event){
if(!isPointerDown||draggedIndex===-1)return;

if(event.cancelable&&String(event.type).startsWith('touch')){
event.preventDefault();
}

const position=getCanvasCoords(event);
dragX=position.x;
dragY=position.y;
}

function handlePointerUp(event){
if(!isPointerDown)return;

if(event.cancelable&&String(event.type).startsWith('touch')){
event.preventDefault();
}

if(draggedIndex!==-1&&tray[draggedIndex]){
const piece=tray[draggedIndex];
const pW=piece.shape[0].length;
const pH=piece.shape.length;
const targetCenterX=dragX;
const targetCenterY=dragY-65;
const pPxW=pW*CELL_SIZE+(pW-1)*CELL_GAP;
const pPxH=pH*CELL_SIZE+(pH-1)*CELL_GAP;
const tlX=targetCenterX-pPxW/2;
const tlY=targetCenterY-pPxH/2;
const col=Math.round((tlX-BOARD_X)/(CELL_SIZE+CELL_GAP));
const row=Math.round((tlY-BOARD_Y)/(CELL_SIZE+CELL_GAP));

if(canPlacePiece(piece,row,col)){
placePiece(
draggedIndex,
row,
col
);
}
}

draggedIndex=-1;
isPointerDown=false;
}

c.addEventListener(
'touchstart',
handlePointerDown,
{passive:false}
);

c.addEventListener(
'touchmove',
handlePointerMove,
{passive:false}
);

c.addEventListener(
'touchend',
handlePointerUp,
{passive:false}
);

c.addEventListener(
'mousedown',
handlePointerDown
);

window.addEventListener(
'mousemove',
handlePointerMove
);

window.addEventListener(
'mouseup',
handlePointerUp
);

resetGame();
requestAnimationFrame(gameLoop);
})();
</script>`;

async function sendBlockBlast(conn, chat, html) {
  const responseId = randomUUID();

  const data = Buffer.from(
    JSON.stringify({
      __typename: 'GenAIUnifiedResponse',
      response_id: responseId,
      sections: [
        {
          __typename: 'GenAIUnifiedResponseSection',
          view_model: {
            __typename: 'GenAISingleLayoutViewModel',
            primitive: {
              __typename: 'GenAIaeacdsnwHtmlPrimitive',
              payload: html,
              trusted_sources: [],
            },
          },
        },
      ],
    })
  ).toString('base64');

  return conn.relayMessage(
    chat,
    {
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2,
        botMetadata: {
          messageDisclaimerText: '',
          botResponseId: responseId,
        },
      },
      botForwardedMessage: {
        message: {
          richResponseMessage: {
            messageType: 1,
            submessages: [
              {
                messageType: 2,
                messageText: 'Block Blast Mini Game',
              },
            ],
            unifiedResponse: {
              data,
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
  );
}

const handler = async (m, { conn }) => {
  if (!m?.chat || !conn?.relayMessage) return;

  try {
    try {
      await conn.sendMessage(
        m.chat,
        {
          react: {
            text: '🧩',
            key: m.raw?.key || m.key,
          },
        }
      );
    } catch {}

    await sendBlockBlast(
      conn,
      m.chat,
      htmlPayload
    );
  } catch (error) {
    try {
      await conn.sendMessage(
        m.chat,
        {
          react: {
            text: '❌',
            key: m.raw?.key || m.key,
          },
        }
      );
    } catch {}

    await m.reply(
      `❌ Gagal mengirim Block Blast Mini.\n\n> ${String(error?.message || 'Unknown error').slice(0, 500)}`
    ).catch(() => {});
  }
};

handler.help = [
  'blockblast',
  'blockgame',
  'blockpuzzle',
  'block',
];

handler.tags = ['game'];
handler.category = 'game';
handler.command = /^(blockblast|blockgame|blockpuzzle|block)$/i;
handler.description = 'Main game Block Blast Mini interaktif';
handler.limit = false;

export default handler;