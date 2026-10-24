// minesweeper.js
// Minesweeper — Rich HTML Game
// Mode: Easy / Normal / Hard
// Features: Bomb, numbers, flag, timer, score, animations, sound
// ESM Plugin

const html = `
<style>
:root{
  --bg:#111b21;
  --card:#202c33;
  --cell:#2a3942;
  --cell-hover:#354752;
  --open:#182229;
  --line:#3b4a54;
  --text:#e9edef;
  --muted:#8696a0;
  --accent:#00a884;
  --danger:#ef5350;
  --warning:#ffc107;
  --blue:#53bdeb;
  --green:#25d366;
  --shadow:0 18px 50px rgba(0,0,0,.45);
  --font:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;
}

*{
  margin:0;
  padding:0;
  box-sizing:border-box;
  -webkit-tap-highlight-color:transparent;
}

html,body{
  min-height:100vh;
  background:transparent;
  color:var(--text);
  font-family:var(--font);
  overflow-x:hidden;
  user-select:none;
}

.stage{
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:18px 12px;
}

.card{
  width:100%;
  max-width:390px;
  background:rgba(17,27,33,.96);
  border:1px solid var(--line);
  border-radius:18px;
  padding:16px;
  box-shadow:var(--shadow);
}

.header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding-bottom:13px;
  border-bottom:1px solid var(--line);
  margin-bottom:14px;
}

.title{
  font-size:19px;
  font-weight:700;
}

.subtitle{
  color:var(--muted);
  font-size:11px;
  margin-top:3px;
}

.badge{
  display:flex;
  align-items:center;
  gap:6px;
  font-size:11px;
  color:var(--green);
}

.dot{
  width:7px;
  height:7px;
  border-radius:50%;
  background:var(--green);
  box-shadow:0 0 9px rgba(37,211,102,.7);
  animation:pulse 1.4s infinite;
}

@keyframes pulse{
  50%{opacity:.35;transform:scale(.75)}
}

.stats{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:8px;
  margin-bottom:13px;
}

.stat{
  background:var(--card);
  border:1px solid var(--line);
  border-radius:11px;
  padding:9px 7px;
  text-align:center;
}

.stat-label{
  display:block;
  color:var(--muted);
  font-size:9px;
  margin-bottom:3px;
  text-transform:uppercase;
}

.stat-value{
  font-size:15px;
  font-weight:700;
}

.controls{
  display:flex;
  gap:7px;
  margin-bottom:12px;
}

.diff{
  flex:1;
  border:1px solid var(--line);
  background:transparent;
  color:var(--muted);
  border-radius:9px;
  padding:8px 4px;
  font:inherit;
  font-size:11px;
  cursor:pointer;
}

.diff.active{
  background:var(--accent);
  color:#071b16;
  border-color:var(--accent);
  font-weight:700;
}

.board-wrap{
  position:relative;
  width:100%;
  display:flex;
  justify-content:center;
  overflow:hidden;
  border-radius:12px;
}

.board{
  display:grid;
  gap:3px;
  width:100%;
  max-width:350px;
  aspect-ratio:1;
  padding:3px;
  background:#0b141a;
  border:1px solid var(--line);
  border-radius:12px;
}

.cell{
  position:relative;
  border:0;
  border-radius:5px;
  background:var(--cell);
  color:var(--text);
  font-family:inherit;
  font-size:clamp(12px,4vw,19px);
  font-weight:800;
  cursor:pointer;
  transition:
    transform .1s ease,
    background .15s ease,
    filter .15s ease;
}

.cell:hover{
  background:var(--cell-hover);
}

.cell:active{
  transform:scale(.88);
}

.cell.open{
  background:var(--open);
  cursor:default;
  animation:openCell .16s ease-out;
}

@keyframes openCell{
  from{
    transform:scale(.75);
    opacity:.4;
  }
  to{
    transform:scale(1);
    opacity:1;
  }
}

.cell.flag{
  color:#ffca28;
  background:#263640;
  animation:flagPop .16s ease-out;
}

@keyframes flagPop{
  0%{transform:scale(.7)}
  75%{transform:scale(1.12)}
  100%{transform:scale(1)}
}

.cell.bomb{
  background:rgba(239,83,80,.25);
  animation:bomb .45s ease-in-out;
}

@keyframes bomb{
  0%,100%{transform:scale(1)}
  20%{transform:scale(1.15) rotate(-4deg)}
  40%{transform:scale(.9) rotate(4deg)}
  60%{transform:scale(1.08)}
}

.n1{color:#53bdeb}
.n2{color:#69d18f}
.n3{color:#ff7272}
.n4{color:#b39ddb}
.n5{color:#ff9f43}
.n6{color:#26c6da}
.n7{color:#f48fb1}
.n8{color:#cfd8dc}

.help{
  display:flex;
  justify-content:center;
  gap:13px;
  margin-top:11px;
  color:var(--muted);
  font-size:10px;
}

.help span{
  display:flex;
  align-items:center;
  gap:4px;
}

.actions{
  display:flex;
  gap:8px;
  margin-top:13px;
}

.action{
  flex:1;
  border:1px solid var(--line);
  background:var(--card);
  color:var(--text);
  border-radius:10px;
  padding:10px;
  font:inherit;
  font-size:12px;
  cursor:pointer;
}

.action.primary{
  background:var(--accent);
  border-color:var(--accent);
  color:#071b16;
  font-weight:700;
}

.modal{
  position:fixed;
  inset:0;
  z-index:99;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:20px;
  background:rgba(0,0,0,.48);
  opacity:0;
  pointer-events:none;
  transition:opacity .25s ease;
}

.modal.show{
  opacity:1;
  pointer-events:auto;
}

.modal-card{
  width:100%;
  max-width:300px;
  background:#202c33;
  border:1px solid var(--line);
  border-radius:17px;
  padding:24px 18px 0;
  text-align:center;
  box-shadow:var(--shadow);
  transform:translateY(15px) scale(.92);
  transition:transform .3s cubic-bezier(.34,1.56,.64,1);
}

.modal.show .modal-card{
  transform:translateY(0) scale(1);
}

.result-icon{
  font-size:44px;
  margin-bottom:8px;
  animation:resultPop .45s cubic-bezier(.34,1.56,.64,1);
}

@keyframes resultPop{
  from{transform:scale(0)}
  to{transform:scale(1)}
}

.result-title{
  font-size:21px;
  font-weight:800;
  margin-bottom:5px;
}

.result-sub{
  color:var(--muted);
  font-size:12px;
  margin-bottom:19px;
}

.modal-btn{
  width:100%;
  padding:13px;
  border:0;
  border-top:1px solid var(--line);
  background:transparent;
  color:var(--accent);
  font:inherit;
  font-weight:700;
  cursor:pointer;
}

@media(max-width:340px){
  .card{
    padding:12px;
  }

  .controls{
    gap:4px;
  }

  .diff{
    font-size:10px;
  }
}
</style>

<main class="stage">
  <div class="card">

    <div class="header">
      <div>
        <div class="title">💣 Minesweeper</div>
        <div class="subtitle">Cari semua bom tanpa meledak</div>
      </div>

      <div class="badge">
        <span class="dot"></span>
        LIVE
      </div>
    </div>

    <div class="stats">

      <div class="stat">
        <span class="stat-label">💣 Bom</span>
        <span class="stat-value" id="bombs">10</span>
      </div>

      <div class="stat">
        <span class="stat-label">⏱️ Waktu</span>
        <span class="stat-value" id="timer">000</span>
      </div>

      <div class="stat">
        <span class="stat-label">🚩 Flag</span>
        <span class="stat-value" id="flags">0</span>
      </div>

    </div>

    <div class="controls">

      <button class="diff active" id="easy">
        🟢 Mudah
      </button>

      <button class="diff" id="normal">
        🟡 Normal
      </button>

      <button class="diff" id="hard">
        🔴 Sulit
      </button>

    </div>

    <div class="board-wrap">
      <div class="board" id="board"></div>
    </div>

    <div class="help">
      <span>👆 Buka kotak</span>
      <span>🚩 Tekan lama = flag</span>
    </div>

    <div class="actions">
      <button class="action primary" id="restart">
        🔄 Game Baru
      </button>

      <button class="action" id="flagMode">
        🚩 Mode Flag
      </button>
    </div>

  </div>
</main>

<div class="modal" id="modal">
  <div class="modal-card">

    <div class="result-icon" id="result-icon">💥</div>

    <div class="result-title" id="result-title">
      BOOM!
    </div>

    <div class="result-sub" id="result-sub">
      Kamu menginjak bom 😭
    </div>

    <button class="modal-btn" id="modal-restart">
      🔄 Main Lagi
    </button>

  </div>
</div>

<script>
(() => {

  const $ = id => document.getElementById(id);

  const boardEl = $('board');
  const bombsEl = $('bombs');
  const timerEl = $('timer');
  const flagsEl = $('flags');
  const modal = $('modal');

  const DIFFICULTIES = {

    easy:{
      rows:9,
      cols:9,
      bombs:10
    },

    normal:{
      rows:12,
      cols:12,
      bombs:25
    },

    hard:{
      rows:14,
      cols:14,
      bombs:42
    }

  };

  let difficulty = 'easy';

  let rows = 9;
  let cols = 9;
  let bombCount = 10;

  let board = [];

  let started = false;
  let gameOver = false;
  let flagMode = false;

  let flags = 0;
  let opened = 0;
  let timer = 0;
  let timerInterval = null;

  let audioCtx = null;


  function sound(type){

    try{

      if(!audioCtx){

        audioCtx =
          new (window.AudioContext ||
          window.webkitAudioContext)();

      }

      if(audioCtx.state === 'suspended')
        audioCtx.resume();

      const osc =
        audioCtx.createOscillator();

      const gain =
        audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now =
        audioCtx.currentTime;

      if(type === 'click'){

        osc.frequency.setValueAtTime(
          480,
          now
        );

        osc.frequency.exponentialRampToValueAtTime(
          680,
          now + .06
        );

        gain.gain.setValueAtTime(
          .035,
          now
        );

        gain.gain.exponentialRampToValueAtTime(
          .001,
          now + .08
        );

      }

      else if(type === 'flag'){

        osc.frequency.setValueAtTime(
          360,
          now
        );

        osc.frequency.exponentialRampToValueAtTime(
          700,
          now + .1
        );

        gain.gain.setValueAtTime(
          .05,
          now
        );

        gain.gain.exponentialRampToValueAtTime(
          .001,
          now + .12
        );

      }

      else if(type === 'win'){

        osc.frequency.setValueAtTime(
          500,
          now
        );

        osc.frequency.setValueAtTime(
          700,
          now + .1
        );

        osc.frequency.setValueAtTime(
          900,
          now + .2
        );

        gain.gain.setValueAtTime(
          .06,
          now
        );

        gain.gain.exponentialRampToValueAtTime(
          .001,
          now + .4
        );

      }

      else if(type === 'boom'){

        osc.type = 'sawtooth';

        osc.frequency.setValueAtTime(
          150,
          now
        );

        osc.frequency.exponentialRampToValueAtTime(
          35,
          now + .5
        );

        gain.gain.setValueAtTime(
          .15,
          now
        );

        gain.gain.exponentialRampToValueAtTime(
          .001,
          now + .55
        );

      }

      osc.start(now);
      osc.stop(now + .6);

    }catch{}

  }


  function createBoard(){

    board = [];

    for(let r=0;r<rows;r++){

      const row = [];

      for(let c=0;c<cols;c++){

        row.push({

          bomb:false,
          number:0,
          open:false,
          flag:false

        });

      }

      board.push(row);

    }

  }


  function placeBombs(safeR, safeC){

    const positions = [];

    for(let r=0;r<rows;r++){

      for(let c=0;c<cols;c++){

        if(
          Math.abs(r-safeR) <= 1 &&
          Math.abs(c-safeC) <= 1
        )
          continue;

        positions.push([r,c]);

      }

    }

    for(let i=positions.length-1;i>0;i--){

      const j =
        Math.floor(
          Math.random() * (i+1)
        );

      [positions[i],positions[j]] =
        [positions[j],positions[i]];

    }

    for(let i=0;i<bombCount;i++){

      const [r,c] =
        positions[i];

      board[r][c].bomb = true;

    }

    calculateNumbers();

  }


  function calculateNumbers(){

    for(let r=0;r<rows;r++){

      for(let c=0;c<cols;c++){

        if(board[r][c].bomb)
          continue;

        let count = 0;

        for(let dr=-1;dr<=1;dr++){

          for(let dc=-1;dc<=1;dc++){

            if(dr === 0 && dc === 0)
              continue;

            const nr = r + dr;
            const nc = c + dc;

            if(
              nr >= 0 &&
              nr < rows &&
              nc >= 0 &&
              nc < cols &&
              board[nr][nc].bomb
            ){

              count++;

            }

          }

        }

        board[r][c].number = count;

      }

    }

  }


  function buildBoard(){

    boardEl.innerHTML = '';

    boardEl.style.gridTemplateColumns =
      'repeat(' + cols + ',1fr)';

    boardEl.style.gridTemplateRows =
      'repeat(' + rows + ',1fr)';

    for(let r=0;r<rows;r++){

      for(let c=0;c<cols;c++){

        const cell =
          document.createElement('button');

        cell.className = 'cell';

        cell.dataset.r = r;
        cell.dataset.c = c;

        cell.addEventListener(
          'click',
          () => handleClick(r,c)
        );

        cell.addEventListener(
          'contextmenu',
          e => {

            e.preventDefault();

            toggleFlag(r,c);

          }
        );

        let pressTimer = null;

        cell.addEventListener(
          'touchstart',
          () => {

            pressTimer =
              setTimeout(
                () => {

                  pressTimer = null;

                  toggleFlag(r,c);

                },
                450
              );

          },
          {passive:true}
        );

        cell.addEventListener(
          'touchend',
          e => {

            if(pressTimer){

              clearTimeout(pressTimer);

            }else{

              e.preventDefault();

            }

          },
          {passive:false}
        );

        boardEl.appendChild(cell);

      }

    }

  }


  function cellEl(r,c){

    return boardEl.children[
      r * cols + c
    ];

  }


  function renderCell(r,c){

    const data =
      board[r][c];

    const el =
      cellEl(r,c);

    if(!el)
      return;

    el.className = 'cell';

    if(data.flag && !data.open){

      el.classList.add('flag');

      el.textContent = '🚩';

      return;

    }

    if(!data.open){

      el.textContent = '';

      return;

    }

    el.classList.add('open');

    if(data.bomb){

      el.classList.add('bomb');

      el.textContent = '💣';

      return;

    }

    if(data.number > 0){

      el.textContent =
        data.number;

      el.classList.add(
        'n' + data.number
      );

    }else{

      el.textContent = '';

    }

  }


  function renderAll(){

    for(let r=0;r<rows;r++){

      for(let c=0;c<cols;c++){

        renderCell(r,c);

      }

    }

    bombsEl.textContent =
      bombCount;

    flagsEl.textContent =
      flags;

  }


  function startTimer(){

    if(timerInterval)
      return;

    timerInterval =
      setInterval(() => {

        if(gameOver)
          return;

        timer++;

        timerEl.textContent =
          String(timer).padStart(3,'0');

      },1000);

  }


  function stopTimer(){

    if(timerInterval){

      clearInterval(timerInterval);

      timerInterval = null;

    }

  }


  function handleClick(r,c){

    if(gameOver)
      return;

    const data =
      board[r][c];

    if(data.flag)
      return;

    if(flagMode){

      toggleFlag(r,c);

      return;

    }

    if(data.open)
      return;

    sound('click');

    if(!started){

      started = true;

      placeBombs(r,c);

      startTimer();

    }

    openCell(r,c);

    checkWin();

  }


  function openCell(r,c){

    if(
      r < 0 ||
      r >= rows ||
      c < 0 ||
      c >= cols
    )
      return;

    const data =
      board[r][c];

    if(data.open || data.flag)
      return;

    data.open = true;

    opened++;

    renderCell(r,c);

    if(data.bomb){

      loseGame(r,c);

      return;

    }

    if(data.number === 0){

      for(let dr=-1;dr<=1;dr++){

        for(let dc=-1;dc<=1;dc++){

          if(dr === 0 && dc === 0)
            continue;

          const nr = r + dr;
          const nc = c + dc;

          if(
            nr >= 0 &&
            nr < rows &&
            nc >= 0 &&
            nc < cols
          ){

            if(
              !board[nr][nc].open &&
              !board[nr][nc].bomb
            ){

              openCell(nr,nc);

            }

          }

        }

      }

    }

  }


  function toggleFlag(r,c){

    if(gameOver)
      return;

    const data =
      board[r][c];

    if(data.open)
      return;

    if(!data.flag && flags >= bombCount)
      return;

    data.flag =
      !data.flag;

    flags +=
      data.flag ? 1 : -1;

    sound('flag');

    renderCell(r,c);

    flagsEl.textContent =
      flags;

  }


  function loseGame(hitR,hitC){

    gameOver = true;

    stopTimer();

    sound('boom');

    for(let r=0;r<rows;r++){

      for(let c=0;c<cols;c++){

        const data =
          board[r][c];

        if(data.bomb)
          data.open = true;

      }

    }

    renderAll();

    const hit =
      cellEl(hitR,hitC);

    if(hit){

      hit.style.animation =
        'bomb .45s ease-in-out';

    }

    setTimeout(() => {

      showResult(
        false,
        '💥',
        'BOOM!',
        'Kamu menginjak bom setelah ' +
        timer +
        ' detik 😭'
      );

    },500);

  }


  function checkWin(){

    if(gameOver)
      return;

    const safeCells =
      rows * cols - bombCount;

    if(opened >= safeCells){

      gameOver = true;

      stopTimer();

      sound('win');

      for(let r=0;r<rows;r++){

        for(let c=0;c<cols;c++){

          if(board[r][c].bomb){

            board[r][c].flag = true;

          }

        }

      }

      flags = bombCount;

      renderAll();

      setTimeout(() => {

        showResult(
          true,
          '🏆',
          'MENANG!',
          'Semua bom berhasil ditemukan dalam ' +
          timer +
          ' detik! 🔥'
        );

      },350);

    }

  }


  function showResult(
    win,
    icon,
    title,
    sub
  ){

    $('result-icon').textContent =
      icon;

    $('result-title').textContent =
      title;

    $('result-sub').textContent =
      sub;

    modal.classList.add('show');

  }


  function newGame(){

    stopTimer();

    rows =
      DIFFICULTIES[difficulty].rows;

    cols =
      DIFFICULTIES[difficulty].cols;

    bombCount =
      DIFFICULTIES[difficulty].bombs;

    started = false;
    gameOver = false;
    flagMode = false;

    flags = 0;
    opened = 0;
    timer = 0;

    timerEl.textContent = '000';

    createBoard();
    buildBoard();
    renderAll();

    modal.classList.remove('show');

    $('flagMode').textContent =
      '🚩 Mode Flag';

  }


  function setDifficulty(name){

    difficulty = name;

    document
      .querySelectorAll('.diff')
      .forEach(el =>
        el.classList.remove('active')
      );

    $(name).classList.add('active');

    newGame();

  }


  $('easy').addEventListener(
    'click',
    () => setDifficulty('easy')
  );

  $('normal').addEventListener(
    'click',
    () => setDifficulty('normal')
  );

  $('hard').addEventListener(
    'click',
    () => setDifficulty('hard')
  );

  $('restart').addEventListener(
    'click',
    newGame
  );

  $('modal-restart').addEventListener(
    'click',
    newGame
  );

  $('flagMode').addEventListener(
    'click',
    () => {

      flagMode =
        !flagMode;

      $('flagMode').textContent =
        flagMode
          ? '🚩 Flag: ON'
          : '🚩 Mode Flag';

    }
  );


  newGame();

})();
</script>
`;

const handler = async (m, { conn }) => {

  try {

    await conn.relayMessage(
      m.chat,
      {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2,
          botMetadata: {}
        },

        botForwardedMessage: {

          message: {

            richResponseMessage: {

              messageType: 1,

              submessages: [
                {
                  messageType: 2,
                  messageText:
                    'Minesweeper — Bomb & Numbers 💣'
                }
              ],

              unifiedResponse: {

                data: Buffer.from(
                  JSON.stringify({

                    response_id:
                      'minesweeper-2026-rich-html',

                    sections: [

                      {
                        view_model: {

                          primitive: {

                            __typename:
                              'GenAIaeacdsnwHtmlPrimitive',

                            payload:
                              html,

                            trusted_sources: []

                          },

                          __typename:
                            'GenAISingleLayoutViewModel'

                        }

                      }

                    ]

                  })
                ).toString('base64')

              },

              contextInfo: {

                forwardingScore: 1,

                isForwarded: true,

                forwardedAiBotMessageInfo: {

                  botJid:
                    '867051314767696@bot'

                },

                forwardOrigin: 4

              }

            }

          }

        }

      },
      {}
    );

  } catch (e) {

    console.error(
      '[MINESWEEPER ERROR]',
      e
    );

    await m.reply(
      '❌ Gagal mengirim game Minesweeper.'
    );

  }

};


handler.help = [
  'minesweeper',
  'sweeper',
  'mine'
];

handler.tags = [
  'game'
];

handler.command = [
  'minesweeper',
  'sweeper',
  'mine'
];

handler.limit = false;

export default handler;