/* By AlzRiss - Usanagi Umi AI */
  
'use strict'  
  
const html = `<!DOCTYPE html>  
<html lang="id">  
<head>  
<meta charset="UTF-8">  
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">  
<title>Tic-Tac-Toe Usanagi Umi AI</title>  
<style>  
:root {  
  --bg: transparent;  
  --card: #202c33;  
  --border: rgba(255, 255, 255, 0.18);  
  --pill-bg: #242625;  
  --accent: #00a884;  
  --text: #e9edef;  
  --muted: #8696a0;  
  --x-color: #ffffff;  
  --o-color: #00a884;  
  --board-line: rgba(255, 255, 255, 0.18);  
}  
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }  
button {  
  -webkit-appearance: none;  
  -moz-appearance: none;  
  appearance: none;  
  background-image: none;  
  box-shadow: none;  
  background-clip: padding-box;  
  font: inherit;  
  margin: 0;  
}  
html, body {  
  margin: 0;  
  padding: 0;  
  background: var(--bg);  
  color: var(--text);  
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;  
  display: flex;  
  justify-content: center;  
  min-height: 100vh;  
}  
body {   
  padding: 12px 8px;   
  width: 100%;  
}  
.app {  
  width: 100%;  
  max-width: 360px;  
  display: flex;  
  flex-direction: column;  
  gap: 14px;  
}  
/* Header */  
.header {  
  display: flex;  
  justify-content: space-between;  
  align-items: center;  
  padding: 2px 4px;  
}  
.header-title {  
  font-size: 21px;  
  font-weight: 800;  
  letter-spacing: -0.3px;  
}  
.header-sub {  
  font-size: 11px;  
  color: var(--muted);  
  font-weight: 500;  
}  
/* Section Labels */  
.section-label {  
  font-size: 11px;  
  color: var(--muted);  
  margin-bottom: 6px;  
  font-weight: 600;  
  padding: 0 4px;  
  letter-spacing: 0.3px;  
}  
.pill-group {  
  display: flex;  
  gap: 8px;  
}  
.pill-btn {  
  flex: 1;  
  padding: 10px 12px;  
  border-radius: 18px;  
  border: 1px solid var(--border);  
  background-color: var(--pill-bg);  
  color: var(--text);  
  font-size: 12px;  
  font-weight: 600;  
  cursor: pointer;  
  display: flex;  
  align-items: center;  
  justify-content: center;  
  gap: 6px;  
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;  
}  
.pill-btn.active {  
  background-color: var(--accent);  
  color: #ffffff;  
  border-color: var(--accent);  
  font-weight: 700;  
}  
/* Status & Score Row */  
.status-row {  
  display: flex;  
  justify-content: space-between;  
  align-items: center;  
  font-size: 12px;  
  padding: 2px 4px;  
}  
.status-badge {  
  display: flex;  
  align-items: center;  
  gap: 7px;  
  font-weight: 600;  
  color: var(--text);  
}  
.status-dot {  
  width: 7px;  
  height: 7px;  
  border-radius: 50%;  
  background: var(--accent);  
  box-shadow: 0 0 4px var(--accent);  
}  
.scores {  
  display: flex;  
  gap: 10px;  
  font-size: 12px;  
  color: var(--muted);  
  font-weight: 600;  
}  
.scores span b {  
  color: var(--text);  
  margin-left: 2px;  
}  
.board-wrap {  
  background: transparent;  
  padding: 0;  
  display: flex;  
  justify-content: center;  
  align-items: center;  
}  
.board {  
  display: grid;  
  grid-template-columns: repeat(3, 1fr);  
  grid-template-rows: repeat(3, 1fr);  
  gap: 2px;  
  background: var(--board-line);  
  border: 1px solid var(--board-line);  
  border-radius: 10px;  
  overflow: hidden;  
  width: 100%;  
  max-width: 320px;  
  aspect-ratio: 1 / 1;  
  flex-shrink: 0;  
}  
.cell {  
  background: var(--card);  
  display: flex;  
  align-items: center;  
  justify-content: center;  
  font-size: 52px;  
  font-weight: 600;  
  cursor: pointer;  
  user-select: none;  
  -webkit-user-select: none;  
  transition: background 0.15s ease, color 0.15s ease;  
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;  
  width: 100%;  
  height: 100%;  
}  
.cell:active {  
  background: #26333c;  
}  
.cell.x { color: var(--x-color); }  
.cell.o { color: var(--o-color); }  
.cell.win {  
  background: var(--card);  
}  
.cell.win.x,  
.cell.win.o {  
  color: var(--accent);  
  text-shadow: 0 0 10px rgba(0, 168, 132, 0.55);  
}  
.diff-group {  
  display: flex;  
  gap: 6px;  
}  
.diff-btn {  
  flex: 1;  
  padding: 8px 4px;  
  border-radius: 14px;  
  border: 1px solid var(--border);  
  background-color: var(--pill-bg);  
  color: var(--text);  
  font-size: 11px;  
  font-weight: 600;  
  cursor: pointer;  
  text-align: center;  
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;  
}  
.diff-btn.active {  
  background-color: var(--accent);  
  color: #ffffff;  
  border-color: var(--accent);  
  font-weight: 700;  
}  
/* Action Button */  
.reset-action {  
  text-align: center;  
  margin-top: -2px;  
}  
.reset-btn {  
  background: transparent;  
  border: none;  
  color: var(--accent);  
  font-size: 15px;  
  font-weight: 700;  
  cursor: pointer;  
  padding: 6px 12px;  
}  
.reset-btn:active {  
  opacity: 0.7;  
}  
/* Leaderboard Section */  
.leaderboard-card {  
  border-top: 1px solid var(--border);  
  padding-top: 10px;  
  display: flex;  
  flex-direction: column;  
  gap: 4px;  
}  
.lb-header {  
  display: flex;  
  justify-content: space-between;  
  align-items: center;  
  font-size: 11px;  
  font-weight: 700;  
  color: var(--muted);  
  letter-spacing: 0.4px;  
}  
.lb-desc {  
  font-size: 11px;  
  color: var(--text);  
  line-height: 1.4;  
}  
/* Modal Overlay */  
.overlay {  
  position: fixed;  
  inset: 0;  
  background: rgba(17, 27, 33, 0.8);  
  display: none;  
  align-items: center;  
  justify-content: center;  
  z-index: 50;  
  padding: 20px;  
  backdrop-filter: blur(2px);  
}  
.overlay.show { display: flex; }  
.modal {  
  background: var(--card);  
  border: 1px solid var(--border);  
  border-radius: 16px;  
  padding: 20px;  
  width: 100%;  
  max-width: 280px;  
  text-align: center;  
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);  
}  
.modal h3 { margin: 0 0 6px; font-size: 18px; color: var(--text); }  
.modal p { margin: 0 0 16px; font-size: 12px; color: var(--muted); }  
.modal-btn {  
  width: 100%;  
  padding: 10px;  
  border-radius: 12px;  
  border: none;  
  background: var(--accent);  
  color: #111b21;  
  font-weight: 700;  
  font-size: 13px;  
  cursor: pointer;  
}  
</style>  
</head>  
<body>  
<div class="app">  
  <div class="header">  
    <div class="header-title">Tic-Tac-Toe</div>  
    <div class="header-sub">Usanagi Umi AI</div>  
  </div>  
  
  <div>  
    <div class="section-label">Mode Permainan</div>  
    <div class="pill-group">  
      <button id="modeAi" class="pill-btn active" type="button">🤖 Lawan AI</button>  
      <button id="modePvp" class="pill-btn" type="button">👥 2 Player</button>  
    </div>  
  </div>  
  
  <div class="status-row">  
    <div class="status-badge">  
      <span class="status-dot"></span>  
      <span id="statusText">Giliranmu</span>  
    </div>  
    <div class="scores">  
      <span>X <b id="scoreX">0</b></span>  
      <span>Seri <b id="scoreD">0</b></span>  
      <span>O <b id="scoreO">0</b></span>  
    </div>  
  </div>  
  
  <div class="board-wrap">  
    <div id="board" class="board"></div>  
  </div>  
  
  <div id="diffSection">  
    <div class="section-label">Tingkat Kesulitan</div>  
    <div class="diff-group">  
      <button class="diff-btn" data-diff="pemula">Pemula</button>  
      <button class="diff-btn" data-diff="terlatih">Terlatih</button>  
      <button class="diff-btn active" data-diff="taktisi">Taktisi</button>  
      <button class="diff-btn" data-diff="master">Master</button>  
    </div>  
  </div>  
  
  <div class="reset-action">  
    <button id="resetBtn" class="reset-btn" type="button">Ulang Papan</button>  
  </div>  
  
  <div class="leaderboard-card">  
    <div class="lb-header">  
      <span>PAPAN PERINGKAT</span>  
      <span>Usanagi</span>  
    </div>  
    <div class="lb-desc" id="lbDesc">Belum ada skor. Kalahkan Master untuk masuk sini.</div>  
  </div>  
</div>  
  
<div id="overlay" class="overlay">  
  <div class="modal">  
    <h3 id="modalTitle">Selesai</h3>  
    <p id="modalDesc">Ronde berakhir.</p>  
    <button id="modalBtn" class="modal-btn" type="button">Main Lagi</button>  
  </div>  
</div>  
  
<script>  
(function(){  
  const boardEl = document.getElementById('board');  
  const statusText = document.getElementById('statusText');  
  const scoreXEl = document.getElementById('scoreX');  
  const scoreOEl = document.getElementById('scoreO');  
  const scoreDEl = document.getElementById('scoreD');  
  const lbDesc = document.getElementById('lbDesc');  
  const overlay = document.getElementById('overlay');  
  const modalTitle = document.getElementById('modalTitle');  
  const modalDesc = document.getElementById('modalDesc');  
  const diffSection = document.getElementById('diffSection');  
  
  const WIN_LINES = [  
    [0,1,2],[3,4,5],[6,7,8],  
    [0,3,6],[1,4,7],[2,5,8],  
    [0,4,8],[2,4,6]  
  ];  
  
  let board = Array(9).fill('');  
  let turn = 'X';  
  let mode = 'ai'; // 'ai' or 'pvp'  
  let difficulty = 'taktisi'; // 'pemula', 'terlatih', 'taktisi', 'master'  
  let score = { X: 0, O: 0, D: 0, masterWins: 0 };  
  let gameOver = false;  
  let busy = false;  
  let winLine = [];  
  
  function emptyCells(b) {  
    return b.map((v, i) => v === '' ? i : null).filter(v => v !== null);  
  }  
  
  function checkWinner(b) {  
    for (let line of WIN_LINES) {  
      const [a, bIdx, c] = line;  
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {  
        return { winner: b[a], line };  
      }  
    }  
    if (emptyCells(b).length === 0) return { winner: 'D', line: [] };  
    return null;  
  }  
  
  function minimax(b, player, depth) {  
    const res = checkWinner(b);  
    if (res) {  
      if (res.winner === 'O') return 10 - depth;  
      if (res.winner === 'X') return depth - 10;  
      return 0;  
    }  
    const empty = emptyCells(b);  
    if (player === 'O') {  
      let best = -Infinity;  
      for (let m of empty) {  
        b[m] = 'O';  
        best = Math.max(best, minimax(b, 'X', depth + 1));  
        b[m] = '';  
      }  
      return best;  
    } else {  
      let best = Infinity;  
      for (let m of empty) {  
        b[m] = 'X';  
        best = Math.min(best, minimax(b, 'O', depth + 1));  
        b[m] = '';  
      }  
      return best;  
    }  
  }  
  
  function getBestMove(b) {  
    const empty = emptyCells(b);  
    let bestVal = -Infinity;  
    let move = empty[0];  
    for (let m of empty) {  
      b[m] = 'O';  
      let val = minimax(b, 'X', 0);  
      b[m] = '';  
      if (val > bestVal) {  
        bestVal = val;  
        move = m;  
      }  
    }  
    return move;  
  }  
  
  function getAiMove() {  
    const empty = emptyCells(board);  
    if (!empty.length) return -1;  
  
    for (let p of ['O', 'X']) {  
      for (let m of empty) {  
        board[m] = p;  
        if (checkWinner(board)?.winner === p) {  
          board[m] = '';  
          return m;  
        }  
        board[m] = '';  
      }  
    }  
  
    if (difficulty === 'pemula') {  
      return empty[Math.floor(Math.random() * empty.length)];  
    } else if (difficulty === 'terlatih') {  
      return Math.random() < 0.5 ? getBestMove(board) : empty[Math.floor(Math.random() * empty.length)];  
    } else if (difficulty === 'taktisi') {  
      return Math.random() < 0.85 ? getBestMove(board) : empty[Math.floor(Math.random() * empty.length)];  
    } else {  
      return getBestMove(board);  
    }  
  }  
  
  function aiTurn() {  
    if (gameOver || mode !== 'ai' || turn !== 'O') return;  
    busy = true;  
    statusText.textContent = 'Usanagi berpikir...';  
    setTimeout(() => {  
      const move = getAiMove();  
      if (move >= 0) placeSymbol(move, 'O');  
      busy = false;  
      render();  
    }, 280);  
  }  
  
  function placeSymbol(idx, player) {  
    if (board[idx] || gameOver) return;  
    board[idx] = player;  
    const res = checkWinner(board);  
    if (res) {  
      gameOver = true;  
      winLine = res.line;  
      if (res.winner === 'D') {  
        score.D++;  
      } else {  
        score[res.winner]++;  
        if (res.winner === 'X' && mode === 'ai' && difficulty === 'master') {  
          score.masterWins++;  
        }  
      }  
      setTimeout(() => showResult(res.winner), 200);  
    } else {  
      turn = player === 'X' ? 'O' : 'X';  
    }  
    render();  
    if (!gameOver && mode === 'ai' && turn === 'O') {  
      aiTurn();  
    }  
  }  
  
  function render() {  
    boardEl.innerHTML = '';  
    for (let i = 0; i < 9; i++) {  
      const cell = document.createElement('div');  
      cell.className = 'cell ' + (board[i] ? board[i].toLowerCase() : '');  
      if (winLine.includes(i)) cell.classList.add('win');  
      cell.textContent = board[i] === 'X' ? '✕' : board[i] === 'O' ? '○' : '';  
      cell.onclick = () => {  
        if (!busy && !gameOver && !board[i]) {  
          if (mode === 'pvp' || turn === 'X') {  
            placeSymbol(i, turn);  
          }  
        }  
      };  
      boardEl.appendChild(cell);  
    }  
  
    if (!gameOver) {  
      if (mode === 'ai') {  
        statusText.textContent = turn === 'X' ? 'Giliranmu' : 'Usanagi berpikir...';  
      } else {  
        statusText.textContent = 'Giliran ' + turn;  
      }  
    } else {  
      statusText.textContent = 'Selesai';  
    }  
  
    scoreXEl.textContent = score.X;  
    scoreOEl.textContent = score.O;  
    scoreDEl.textContent = score.D;  
  
    if (score.masterWins > 0) {  
      lbDesc.textContent = 'Menang lawan Master: ' + score.masterWins + 'x. Mantap Brok!';  
    } else {  
      lbDesc.textContent = 'Belum ada skor. Kalahkan Master untuk masuk sini.';  
    }  
  }  
  
  function resetBoard() {  
    board = Array(9).fill('');  
    turn = 'X';  
    gameOver = false;  
    busy = false;  
    winLine = [];  
    overlay.classList.remove('show');  
    render();  
  }  
  
  function showResult(winner) {  
    if (winner === 'D') {  
      modalTitle.textContent = 'Seri!';  
      modalDesc.textContent = 'Permainan berakhir seimbang.';  
    } else {  
      const winnerName = mode === 'pvp' ? ('Pemain ' + winner) : (winner === 'X' ? 'Kamu' : 'Usanagi');  
      modalTitle.textContent = winnerName + ' Menang!';  
      modalDesc.textContent = 'Tiga tanda berhasil berjejer.';  
    }  
    overlay.classList.add('show');  
  }  
  
  document.getElementById('modeAi').onclick = function() {  
    if (mode === 'ai') return;  
    mode = 'ai';  
    this.classList.add('active');  
    document.getElementById('modePvp').classList.remove('active');  
    diffSection.style.display = 'block';  
    resetBoard();  
  };  
  
  document.getElementById('modePvp').onclick = function() {  
    if (mode === 'pvp') return;  
    mode = 'pvp';  
    this.classList.add('active');  
    document.getElementById('modeAi').classList.remove('active');  
    diffSection.style.display = 'none';  
    resetBoard();  
  };  
  
  document.querySelectorAll('.diff-btn').forEach(btn => {  
    btn.onclick = function() {  
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));  
      this.classList.add('active');  
      difficulty = this.dataset.diff;  
      resetBoard();  
    };  
  });  
  
  document.getElementById('resetBtn').onclick = resetBoard;  
  document.getElementById('modalBtn').onclick = resetBoard;  
  
  resetBoard();  
})();  
</script>  
</body>  
</html>`  
  
const handler = async (m, { conn }) => {  
  if (!m?.chat || !conn) return  
  
  const reactionKey = m?.raw?.key || m?.key  
  if (reactionKey) await conn.sendMessage(m.chat, { react: { text: '✕', key: reactionKey } }).catch(() => {})  
  
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
                messageText: 'Usanagi Umi AI Tic Tac Toe ✕○',  
              },  
            ],  
            unifiedResponse: {  
              data: Buffer.from(  
                JSON.stringify({  
                  response_id: 'usanagi-ai-tictactoe-2026',  
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
  
handler.help = ['tictactoe', 'ttt', 'tic']  
handler.tags = ['game']  
handler.command = /^(tictactoe|ttt|tic)$/i  
handler.category = 'game'  
handler.groupOnly = false  
handler.limit = false  
handler.description = 'Game Tic Tac Toe Usanagi Umi AI dengan desain garis & warna kotak persis referensi'  
  
export default handler