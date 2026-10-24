import crypto from 'node:crypto';

// Game Rich tambahan yang belum ada pada Rimuru MD asli.
// HTML disimpan inline di plugin ini; tidak memakai file .html terpisah.
const EXTRA_RICH_GAMES = Object.freeze({
  richquiz: Object.freeze({
    title: 'Rimuru Rich Quiz',
    html: `<!doctype html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Rimuru Quiz</title>
<style>
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;background:#090b14;color:#fff}
body{display:flex;align-items:center;justify-content:center;padding:8px}
.app{width:min(410px,100%);min-height:0;border:1px solid #252a3d;border-radius:28px;background:linear-gradient(180deg,#111526,#0b0e18);box-shadow:0 20px 70px #0008;overflow:hidden;position:relative}
.top{padding:24px 22px 10px;display:flex;justify-content:space-between;align-items:center}
.logo{font-weight:900;font-size:21px;letter-spacing:.3px}
.badge{padding:7px 11px;border-radius:999px;background:#1b2134;color:#aeb8ff;font-size:12px;font-weight:800}
.content{padding:18px 22px 28px}
.screen{text-align:center;padding:55px 12px 30px}
.icon{font-size:64px;margin-bottom:16px}
h1{font-size:34px;line-height:1.05;margin:0 0 12px}
p{color:#9da5bc;line-height:1.55;margin:0 0 25px}
.btn{width:100%;border:0;border-radius:16px;padding:16px 18px;font-size:16px;font-weight:900;color:#fff;background:linear-gradient(135deg,#6c63ff,#8b5cf6);cursor:pointer;box-shadow:0 9px 25px #6c63ff33}
.btn:active{transform:scale(.985)}
.progress{height:7px;background:#202538;border-radius:99px;overflow:hidden;margin:8px 0 22px}
.progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,#6c63ff,#b36cff);transition:.3s}
.meta{display:flex;justify-content:space-between;color:#8992ab;font-size:13px;font-weight:800;margin-bottom:18px}
.question{text-align:left;font-size:25px;line-height:1.2;margin:0 0 20px}
.answers{display:grid;gap:11px}
.answer{background:#151a2a;border:1px solid #292f45;color:#e9ecf5;border-radius:15px;padding:15px;text-align:left;font-size:15px;font-weight:750;cursor:pointer;transition:.15s}
.answer:hover{border-color:#6068a0}
.answer.correct{background:#123522;border-color:#38d996;color:#8ff0c7}
.answer.wrong{background:#3a1820;border-color:#ff657c;color:#ffabb8}
.answer.lock{pointer-events:none}
.feedback{min-height:48px;padding-top:16px;font-weight:800}
.score{font-size:54px;font-weight:950;margin:12px 0}
.small{font-size:13px;color:#7f89a4}
.hide{display:none!important}
</style>
</head>
<body>
<div class="app">
  <div class="top">
    <div class="logo">⚡ Rimuru Quiz</div>
    <div class="badge" id="scoreBadge">0 POIN</div>
  </div>
  <div class="content">
    <section id="start" class="screen">
      <div class="icon">🧠</div>
      <h1>Quiz Kilat</h1>
      <p>15 pertanyaan sulit dipilih secara acak dari bank soal. Ada soal matematika, sains, teknologi, logika, dan konsep.</p>
      <button class="btn" onclick="startQuiz()">MULAI QUIZ</button>
    </section>

    <section id="quiz" class="hide">
      <div class="progress"><i id="bar"></i></div>
      <div class="meta"><span id="count">SOAL 1 / 5</span><span id="liveScore">0 POIN</span></div>
      <h2 class="question" id="question"></h2>
      <div class="answers" id="answers"></div>
      <div class="feedback" id="feedback"></div>
    </section>

    <section id="result" class="screen hide">
      <div class="icon" id="resultIcon">🏆</div>
      <div class="small">SKOR AKHIR</div>
      <div class="score" id="finalScore">0 / 1500</div>
      <p id="resultText"></p>
      <button class="btn" onclick="startQuiz()">MAIN LAGI</button>
    </section>
  </div>
</div>

<script>
const questions=[{"q":"Dalam mekanika kuantum, prinsip ketidakpastian Heisenberg menyatakan bahwa...","a":["Energi selalu kekal dalam sistem kuantum","Posisi dan momentum tidak dapat diketahui secara bersamaan dengan ketelitian tak terbatas","Semua partikel bergerak dalam lintasan elips","Massa partikel selalu berubah saat diamati"],"c":1},{"q":"Jika f(x)=x²−6x+11, nilai minimum f(x) adalah...","a":["1","2","3","5"],"c":1},{"q":"Manakah yang merupakan konsekuensi langsung dari Teorema Noether?","a":["Setiap gaya memiliki pasangan gaya yang sama besar","Simetri kontinu berkaitan dengan hukum kekekalan","Semua sistem fisik bersifat reversibel","Energi kinetik selalu konstan"],"c":1},{"q":"Dalam genetika, crossing-over pada meiosis terutama terjadi pada tahap...","a":["Profase I","Metafase I","Anafase II","Telofase II"],"c":0},{"q":"Bilangan oksidasi sulfur dalam ion sulfat SO₄²⁻ adalah...","a":["+2","+4","+6","+8"],"c":2},{"q":"Jika matriks A berukuran 2×2 memiliki determinan 3, maka determinan 2A adalah...","a":["3","6","9","12"],"c":2},{"q":"Manakah yang paling tepat menggambarkan entropi dalam termodinamika statistik?","a":["Ukuran jumlah keadaan mikro yang konsisten dengan keadaan makro","Ukuran energi total sistem","Jumlah partikel yang tidak bergerak","Tekanan maksimum suatu gas"],"c":0},{"q":"Dalam jaringan komputer, protokol yang menyediakan pengiriman data andal dan berurutan adalah...","a":["UDP","IP","TCP","ARP"],"c":2},{"q":"Apa hasil dari integral ∫₀¹ 3x² dx?","a":["1/3","1","3","9"],"c":1},{"q":"Dalam relativitas khusus, faktor Lorentz γ meningkat ketika...","a":["Kecepatan benda mendekati kecepatan cahaya","Massa benda menjadi nol","Suhu benda turun","Gravitasi menjadi nol"],"c":0},{"q":"Bahasa formal yang dapat dikenali oleh finite automaton deterministik adalah...","a":["Bahasa reguler","Semua bahasa bebas konteks","Semua bahasa Turing-complete","Bahasa yang tidak dapat diputuskan"],"c":0},{"q":"Jika sebuah graf terhubung memiliki n simpul dan n−1 sisi, graf tersebut pasti merupakan...","a":["Graf lengkap","Pohon","Graf bipartit lengkap","Siklus"],"c":1},{"q":"Dalam analisis algoritma, kompleksitas pencarian biner pada array terurut adalah...","a":["O(1)","O(log n)","O(n)","O(n log n)"],"c":1},{"q":"Protein terutama tersusun dari rantai...","a":["Nukleotida","Monosakarida","Asam amino","Asam lemak"],"c":2},{"q":"Jika pH suatu larutan turun dari 5 menjadi 3, konsentrasi ion H⁺ berubah menjadi...","a":["2 kali lebih besar","10 kali lebih besar","100 kali lebih besar","1000 kali lebih kecil"],"c":2},{"q":"Dalam teori bilangan, bilangan prima terbesar yang membagi 2¹⁰−1 adalah...","a":["3","5","7","11"],"c":2},{"q":"Transformasi Fourier terutama digunakan untuk mengubah sinyal dari domain...","a":["Waktu ke frekuensi","Massa ke energi","Ruang ke suhu","Warna ke cahaya"],"c":0},{"q":"Manakah pernyataan yang benar tentang lubang hitam menurut relativitas umum?","a":["Cahaya dapat keluar dari dalam event horizon","Event horizon adalah batas kausal yang tidak dapat dilalui keluar oleh sinyal","Semua lubang hitam harus memiliki massa yang sama","Lubang hitam tidak memiliki gravitasi"],"c":1},{"q":"Dalam SQL, perintah yang digunakan untuk menggabungkan baris dari dua tabel berdasarkan kondisi terkait adalah...","a":["MERGE","JOIN","GROUP","UNION ALL"],"c":1},{"q":"Jika peluang suatu kejadian adalah 0,2 dan dilakukan 3 percobaan independen, peluang kejadian tersebut muncul tepat sekali adalah...","a":["0,096","0,384","0,488","0,512"],"c":1},{"q":"Apa yang dimaksud dengan overfitting dalam machine learning?","a":["Model terlalu sederhana sehingga gagal belajar","Model sangat cocok dengan data latihan tetapi buruk pada data baru","Model tidak memiliki parameter","Model hanya bisa digunakan untuk klasifikasi"],"c":1},{"q":"Dalam kriptografi kunci publik, pasangan yang benar adalah...","a":["AES menggunakan kunci publik dan privat","RSA menggunakan pasangan kunci publik dan privat","SHA-256 menggunakan dua kunci rahasia","Base64 merupakan algoritma enkripsi"],"c":1},{"q":"Jika deret geometri memiliki suku pertama 3 dan rasio 2, jumlah 5 suku pertamanya adalah...","a":["45","63","93","96"],"c":1},{"q":"Dalam biologi sel, organel yang paling terkait dengan fosforilasi oksidatif adalah...","a":["Ribosom","Lisosom","Mitokondria","Badan Golgi"],"c":2},{"q":"Apa yang terjadi pada resistansi total dua resistor identik jika disusun paralel dibandingkan satu resistor saja?","a":["Menjadi dua kali lipat","Tetap sama","Menjadi setengahnya","Menjadi empat kali lipat"],"c":2},{"q":"Manakah yang merupakan contoh inferensi Bayes?","a":["Memperbarui probabilitas hipotesis setelah memperoleh bukti baru","Mengurutkan angka secara ascending","Menghitung luas lingkaran","Mengubah basis bilangan"],"c":0},{"q":"Dalam struktur data heap maksimum, elemen terbesar berada pada...","a":["Daun paling kiri","Akar","Daun paling kanan","Indeks acak"],"c":1},{"q":"Jika log₂(x)=7, maka x adalah...","a":["14","49","64","128"],"c":3},{"q":"Dalam kimia organik, gugus fungsi −COOH disebut...","a":["Hidroksil","Karbonil","Karboksil","Amino"],"c":2},{"q":"Prinsip Pauli menyatakan bahwa...","a":["Dua fermion identik tidak dapat memiliki keadaan kuantum yang sama sepenuhnya","Energi selalu berbanding lurus dengan massa","Semua atom harus memiliki jumlah neutron sama","Elektron selalu berada pada lintasan klasik"],"c":0},{"q":"Jika suatu fungsi memiliki turunan pertama nol pada titik x₀, apakah x₀ pasti merupakan titik minimum?","a":["Ya, selalu","Tidak, bisa minimum, maksimum, atau titik stasioner lain","Ya, jika fungsi kontinu","Tidak, karena turunan tidak pernah menentukan ekstrem"],"c":1},{"q":"Dalam teori graf, derajat total semua simpul suatu graf tak berarah sama dengan...","a":["Jumlah sisi","Dua kali jumlah sisi","Jumlah simpul","Kuadrat jumlah sisi"],"c":1},{"q":"Manakah yang paling tepat mengenai cache CPU?","a":["Lebih lambat daripada penyimpanan eksternal","Digunakan untuk menyimpan data/instruksi yang sering diakses agar akses CPU lebih cepat","Hanya menyimpan file multimedia","Menggantikan seluruh RAM"],"c":1},{"q":"Dalam astronomi, redshift kosmologis terutama berkaitan dengan...","a":["Pemuaian alam semesta","Rotasi Bulan","Medan magnet Bumi","Pembakaran hidrogen di Matahari"],"c":0},{"q":"Jika sebuah hash kriptografis memiliki sifat collision resistance, artinya...","a":["Mustahil secara matematis menemukan input apa pun","Sulit menemukan dua input berbeda dengan hash yang sama","Hash dapat dibalik menjadi input dengan mudah","Hash selalu menghasilkan panjang berbeda"],"c":1},{"q":"Pada proses mitosis, kromatid saudara berpisah pada fase...","a":["Profase","Metafase","Anafase","Telofase"],"c":2},{"q":"Apa nilai lim x→0 (sin x)/x dalam satuan radian?","a":["0","1","∞","Tidak ada"],"c":1},{"q":"Dalam ekonomi, inflasi berarti...","a":["Penurunan umum tingkat harga","Kenaikan umum tingkat harga secara berkelanjutan","Kenaikan nilai mata uang secara otomatis","Penurunan jumlah uang beredar saja"],"c":1},{"q":"Manakah yang bukan merupakan tipe data primitif umum dalam JavaScript?","a":["boolean","string","number","array"],"c":3},{"q":"Dalam sistem operasi, deadlock terjadi ketika...","a":["CPU tidak memiliki instruksi","Proses saling menunggu sumber daya sehingga tidak dapat melanjutkan","RAM selalu kosong","Semua proses selesai bersamaan"],"c":1},{"q":"Jika 5 pekerja menyelesaikan pekerjaan dalam 12 hari dengan laju sama, secara ideal 10 pekerja memerlukan...","a":["3 hari","6 hari","12 hari","24 hari"],"c":1},{"q":"Dalam relativitas umum, gravitasi dipandang sebagai...","a":["Gaya listrik","Kelengkungan ruang-waktu akibat distribusi energi-momentum","Gesekan antar benda","Efek hanya dari medan magnet"],"c":1},{"q":"Apa nama proses ketika RNA digunakan sebagai cetakan untuk membuat protein?","a":["Replikasi","Transkripsi","Translasi","Mutasi"],"c":2},{"q":"Jika semua bilangan dalam sebuah dataset dikalikan 10, standar deviasinya menjadi...","a":["Tetap","10 kali lebih besar","100 kali lebih besar","Akar 10 kali lebih besar"],"c":1},{"q":"Dalam keamanan web, serangan XSS terutama mengeksploitasi...","a":["Injeksi script ke konten yang dijalankan browser pengguna","Kegagalan hard disk","Overheating CPU","Pemutusan kabel jaringan"],"c":0},{"q":"Bilangan kompleks i² bernilai...","a":["1","−1","i","−i"],"c":1},{"q":"Dalam machine learning, regularization digunakan terutama untuk...","a":["Memperbesar overfitting","Mengurangi kompleksitas model dan membantu generalisasi","Menghapus semua data latihan","Menjamin akurasi 100%"],"c":1},{"q":"Jika sebuah koin adil dilempar 4 kali, peluang muncul tepat 2 kepala adalah...","a":["1/8","3/8","1/2","5/8"],"c":1},{"q":"Apa fungsi utama ribosom?","a":["Sintesis protein","Produksi ATP","Penyimpanan DNA","Pencernaan sel"],"c":0},{"q":"Dalam fisika, momentum linear didefinisikan sebagai...","a":["p=mv","p=ma","p=m/v","p=v/m"],"c":0},{"q":"Manakah pernyataan yang tepat mengenai algoritma Dijkstra?","a":["Selalu membutuhkan graf tanpa bobot","Digunakan untuk shortest path dengan bobot sisi non-negatif","Hanya untuk graf pohon","Tidak dapat digunakan pada graf berarah"],"c":1},{"q":"Dalam teori informasi, satu bit dapat merepresentasikan berapa banyak keadaan biner?","a":["1","2","4","8"],"c":1},{"q":"Jika suatu matriks persegi memiliki determinan nol, maka matriks tersebut...","a":["Pasti identitas","Singular/tidak invertibel","Selalu diagonal","Memiliki invers unik"],"c":1}];
let sessionQuestions=[];
let idx=0,score=0,locked=false;

function startQuiz(){
 idx=0;score=0;locked=false;
 sessionQuestions=[...questions].sort(()=>Math.random()-0.5).slice(0,15);
 document.getElementById('start').classList.add('hide');
 document.getElementById('result').classList.add('hide');
 document.getElementById('quiz').classList.remove('hide');
 document.getElementById('scoreBadge').textContent='0 POIN';
 render();
}
function render(){
 locked=false;
 const x=sessionQuestions[idx];
 document.getElementById('count').textContent=\`SOAL \${idx+1} / \${sessionQuestions.length}\`;
 document.getElementById('liveScore').textContent=\`\${score} POIN\`;
 document.getElementById('bar').style.width=((idx/sessionQuestions.length)*100)+'%';
 document.getElementById('question').textContent=x.q;
 document.getElementById('feedback').textContent='';
 const box=document.getElementById('answers'); box.innerHTML='';
 x.a.forEach((answer,n)=>{
   const b=document.createElement('button');
   b.className='answer'; b.textContent=answer;
   b.onclick=()=>choose(n,b);
   box.appendChild(b);
 });
}
function choose(n,button){
 if(locked)return; locked=true;
 const x=sessionQuestions[idx];
 document.querySelectorAll('.answer').forEach(b=>b.classList.add('lock'));
 if(n===x.c){
   score+=100; button.classList.add('correct');
   document.getElementById('feedback').textContent='✓ Benar! +100 poin';
 }else{
   button.classList.add('wrong');
   document.querySelectorAll('.answer')[x.c].classList.add('correct');
   document.getElementById('feedback').textContent='✕ Kurang tepat';
 }
 document.getElementById('scoreBadge').textContent=\`\${score} POIN\`;
 document.getElementById('liveScore').textContent=\`\${score} POIN\`;
 setTimeout(()=>{
   idx++;
   if(idx<sessionQuestions.length) render(); else finish();
 },700);
}
function finish(){
 document.getElementById('quiz').classList.add('hide');
 document.getElementById('result').classList.remove('hide');
 document.getElementById('finalScore').textContent=\`\${score} / \${sessionQuestions.length*100}\`;
 const t=score===500?'Sempurna! Semua jawaban benar.':score>=300?'Mantap! Tinggal sedikit lagi menuju sempurna.':'Coba lagi dan pecahkan skor kamu.';
 document.getElementById('resultText').textContent=t;
 document.getElementById('resultIcon').textContent=score===500?'🏆':score>=300?'🔥':'🎯';
}
</script>
</body>
</html>`
  }),
  richpong: Object.freeze({
    title: 'Rimuru Pong',
    html: `<!doctype html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Rimuru Pong</title>
<style>
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;background:#080a12;color:#fff}
body{display:flex;align-items:center;justify-content:center;padding:8px;overflow:hidden}
.app{width:min(410px,100%);background:linear-gradient(180deg,#111526,#090b13);border:1px solid #252a3c;border-radius:26px;padding:16px;box-shadow:0 20px 70px #0009}
.top{display:flex;justify-content:space-between;align-items:center;padding:2px 5px 12px}
.logo{font-weight:950;font-size:21px}
.mode{font-size:12px;font-weight:800;color:#9ea8c2;background:#191e2e;padding:7px 11px;border-radius:999px}
.score{display:flex;justify-content:center;align-items:center;gap:25px;font-size:38px;font-weight:950;margin:0 0 10px}
.score span:first-child{color:#b8bfff}.score span:last-child{color:#ffb5c0}
canvas{display:block;width:100%;aspect-ratio:16/9;background:#05070d;border:1px solid #292f42;border-radius:18px;touch-action:none}
.help{text-align:center;color:#7f89a4;font-size:12px;margin:10px 0 12px}
.controls{display:flex;justify-content:center;gap:12px}
.ctrl{width:48%;max-width:220px;border:1px solid #2c3349;background:#151a29;color:#fff;border-radius:14px;padding:14px;font-size:16px;font-weight:900;touch-action:none;user-select:none}
.ctrl:active{transform:scale(.97);background:#20273a}
.overlay{position:fixed;inset:0;background:#0009;display:flex;align-items:center;justify-content:center;padding:22px}
.card{width:min(420px,100%);background:#111526;border:1px solid #2a3044;border-radius:24px;padding:28px;text-align:center;box-shadow:0 25px 80px #000}
.card h1{margin:0 0 8px;font-size:32px}
.card p{color:#9da6bd;line-height:1.5;margin:0 0 22px}
.btn{width:100%;border:0;border-radius:15px;padding:16px;background:linear-gradient(135deg,#6861ff,#915df4);color:#fff;font-size:16px;font-weight:950}
.hide{display:none}
</style>
</head>
<body>
<div class="app">
  <div class="top"><div class="logo">🏓 Rimuru Pong</div><div class="mode">VS COMPUTER</div></div>
  <div class="score"><span id="playerScore">0</span><b>:</b><span id="aiScore">0</span></div>
  <canvas id="game" width="960" height="540"></canvas>
  <div class="help">Keyboard: W / S atau ↑ / ↓ &nbsp; • &nbsp; Mobile: tahan tombol di bawah</div>
  <div class="controls">
    <button class="ctrl" id="up">▲ ATAS</button>
    <button class="ctrl" id="down">▼ BAWAH</button>
  </div>
</div>

<div class="overlay" id="startOverlay">
 <div class="card">
  <div style="font-size:58px">🏓</div>
  <h1>Rimuru Pong</h1>
  <p>Kalahkan komputer sampai 7 poin. Pantulkan bola, bertahan, dan manfaatkan sudut pantulan.</p>
  <button class="btn" onclick="startGame()">MULAI</button>
 </div>
</div>

<div class="overlay hide" id="endOverlay">
 <div class="card">
  <div style="font-size:58px" id="endIcon">🏆</div>
  <h1 id="endTitle">Menang!</h1>
  <p id="endText"></p>
  <button class="btn" onclick="startGame()">MAIN LAGI</button>
 </div>
</div>

<script>
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const W=canvas.width,H=canvas.height;
const paddle={w:18,h:108,speed:8};
let player,ai,ball,ps=0,as=0,running=false,raf=0;
const keys={up:false,down:false};

function resetBall(dir){
 ball={x:W/2,y:H/2,r:10,vx:(dir||1)*(6+Math.random()*1.5),vy:(Math.random()-.5)*6};
}
function startGame(){
 ps=as=0;
 document.getElementById('playerScore').textContent=0;
 document.getElementById('aiScore').textContent=0;
 player={x:30,y:H/2-paddle.h/2};
 ai={x:W-48,y:H/2-paddle.h/2};
 resetBall(Math.random()<.5?-1:1);
 document.getElementById('startOverlay').classList.add('hide');
 document.getElementById('endOverlay').classList.add('hide');
 running=true; cancelAnimationFrame(raf); loop();
}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function update(){
 if(keys.up) player.y-=paddle.speed;
 if(keys.down) player.y+=paddle.speed;
 player.y=clamp(player.y,12,H-paddle.h-12);

 // AI with slight reaction delay / imperfection
 const target=ball.y-paddle.h/2;
 ai.y += clamp(target-ai.y,-5.3,5.3);
 ai.y=clamp(ai.y,12,H-paddle.h-12);

 ball.x+=ball.vx; ball.y+=ball.vy;
 if(ball.y-ball.r<8 || ball.y+ball.r>H-8) ball.vy*=-1;

 if(ball.x-ball.r<player.x+paddle.w && ball.x>player.x &&
    ball.y>player.y && ball.y<player.y+paddle.h && ball.vx<0){
   ball.x=player.x+paddle.w+ball.r;
   const rel=(ball.y-(player.y+paddle.h/2))/(paddle.h/2);
   ball.vx=Math.min(12,Math.abs(ball.vx)*1.045);
   ball.vy=rel*8;
 }
 if(ball.x+ball.r>ai.x && ball.x<ai.x+paddle.w &&
    ball.y>ai.y && ball.y<ai.y+paddle.h && ball.vx>0){
   ball.x=ai.x-ball.r;
   const rel=(ball.y-(ai.y+paddle.h/2))/(paddle.h/2);
   ball.vx=-Math.min(12,Math.abs(ball.vx)*1.045);
   ball.vy=rel*8;
 }
 if(ball.x<-25){
   as++; document.getElementById('aiScore').textContent=as;
   if(as>=7)return finish(false);
   resetBall(1);
 }
 if(ball.x>W+25){
   ps++; document.getElementById('playerScore').textContent=ps;
   if(ps>=7)return finish(true);
   resetBall(-1);
 }
}
function draw(){
 ctx.clearRect(0,0,W,H);
 ctx.fillStyle='#05070d';ctx.fillRect(0,0,W,H);
 ctx.setLineDash([12,16]);ctx.lineWidth=4;ctx.strokeStyle='#252b3d';
 ctx.beginPath();ctx.moveTo(W/2,10);ctx.lineTo(W/2,H-10);ctx.stroke();ctx.setLineDash([]);
 ctx.fillStyle='#fff';
 ctx.fillRect(player.x,player.y,paddle.w,paddle.h);
 ctx.fillRect(ai.x,ai.y,paddle.w,paddle.h);
 ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();
}
function loop(){
 if(!running)return;
 update();draw();raf=requestAnimationFrame(loop);
}
function finish(win){
 running=false; cancelAnimationFrame(raf);
 document.getElementById('endIcon').textContent=win?'🏆':'🤖';
 document.getElementById('endTitle').textContent=win?'Kamu Menang!':'Komputer Menang';
 document.getElementById('endText').textContent=\`Skor akhir \${ps} : \${as}. \${win?'Pertahananmu kuat!':'Coba lagi dan kuasai sudut pantulan bola.'}\`;
 document.getElementById('endOverlay').classList.remove('hide');
}
function hold(el,key){
 const on=e=>{e.preventDefault();keys[key]=true};
 const off=e=>{e.preventDefault();keys[key]=false};
 ['pointerdown','touchstart'].forEach(ev=>el.addEventListener(ev,on,{passive:false}));
 ['pointerup','pointercancel','pointerleave','touchend'].forEach(ev=>el.addEventListener(ev,off,{passive:false}));
}
hold(document.getElementById('up'),'up');hold(document.getElementById('down'),'down');
addEventListener('keydown',e=>{
 if(['ArrowUp','w','W'].includes(e.key)){keys.up=true;e.preventDefault()}
 if(['ArrowDown','s','S'].includes(e.key)){keys.down=true;e.preventDefault()}
});
addEventListener('keyup',e=>{
 if(['ArrowUp','w','W'].includes(e.key))keys.up=false;
 if(['ArrowDown','s','S'].includes(e.key))keys.down=false;
});
draw();
</script>
</body>
</html>`
  }),
  richaim: Object.freeze({
    title: 'Rimuru Aim Shooter',
    html: `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Rimuru Aim Shooter</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#080c15;color:#fff;font-family:Arial,sans-serif;display:flex;justify-content:center;min-height:100vh}
.app{width:min(410px,100%);padding:8px}.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
h1{font-size:21px;margin:0}.muted{color:#9ba8c5;font-size:12px}
.menu,.game{background:#111827;border:1px solid #293755;border-radius:18px;padding:14px}.menu{text-align:center}
.modes{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:16px 0}.mode{background:#18233b;border:1px solid #334568;border-radius:14px;color:#fff;padding:16px 10px;cursor:pointer;text-align:left}.mode:hover{border-color:#7895ff;transform:translateY(-2px)}.mode b{display:block;font-size:16px;margin-bottom:5px}.mode small{color:#aab6d0;line-height:1.4}
.game{display:none}.hud{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:9px}.stat{background:#0c1425;border:1px solid #253653;border-radius:10px;padding:8px;text-align:center;font-size:11px}.stat b{display:block;font-size:17px;margin-top:2px}
.arena{position:relative;height:410px;overflow:hidden;border-radius:15px;border:1px solid #2b3b5c;background:radial-gradient(circle at 50% 45%,#1c2940,#0a101c 70%);cursor:crosshair;touch-action:none}
.grid{position:absolute;inset:0;background-image:linear-gradient(#ffffff07 1px,transparent 1px),linear-gradient(90deg,#ffffff07 1px,transparent 1px);background-size:45px 45px;pointer-events:none}
.target{position:absolute;width:58px;height:58px;border-radius:50%;transform:translate(-50%,-50%);border:3px solid #fff;box-shadow:0 0 0 5px #e44b5a55,0 0 24px #e44b5a99;display:none;cursor:crosshair;z-index:3}.target:before{content:"";position:absolute;inset:11px;border:3px solid #fff;border-radius:50%}.target:after{content:"";position:absolute;left:50%;top:50%;width:8px;height:8px;transform:translate(-50%,-50%);background:#fff;border-radius:50%}
#flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:5}.combo{position:absolute;top:12px;left:50%;transform:translateX(-50%);font-weight:bold;font-size:20px;text-shadow:0 2px 8px #000;z-index:4}
.bottom{display:flex;gap:8px;align-items:center;margin-top:9px}.progress{height:9px;background:#242d40;border-radius:20px;overflow:hidden;flex:1}.progress i{display:block;height:100%;width:0;background:#5f83ff}.btn{border:0;border-radius:10px;padding:10px 14px;background:#526eff;color:white;font-weight:bold;cursor:pointer}.secondary{background:#253452}
.overlay{position:fixed;inset:0;background:#000c;display:none;place-items:center;padding:18px}.modal{width:min(400px,100%);background:#121b2e;border:1px solid #3a4b70;border-radius:18px;padding:20px;text-align:center}.modal h2{margin:5px}.big{font-size:36px;font-weight:bold}.stars{font-size:25px;margin:8px}
@media(max-width:600px){.modes{grid-template-columns:1fr}.arena{height:min(58vh,410px);min-height:320px}.hud{grid-template-columns:repeat(2,1fr)}.target{width:52px;height:52px}}
</style>
</head>
<body>
<div class="app">
<div class="top"><h1>🎯 Rimuru Aim Shooter</h1><span class="muted">Precision Training</span></div>

<div id="menu" class="menu">
<h2>Pilih Tingkat Kesulitan</h2>
<p class="muted">Bidik target secepat dan setepat mungkin. Target mengecil dan bergerak lebih cepat pada level tinggi.</p>
<div class="modes">
<button class="mode" data-mode="easy"><b>🟢 Mudah</b><small>Target besar<br>Gerakan lambat<br>30 detik • 15 target</small></button>
<button class="mode" data-mode="normal"><b>🟡 Normal</b><small>Target sedang<br>Gerakan menengah<br>30 detik • 20 target</small></button>
<button class="mode" data-mode="hard"><b>🔴 Sulit</b><small>Target kecil<br>Gerakan cepat + berpindah<br>30 detik • 25 target</small></button>
</div>
</div>

<div id="game" class="game">
<div class="hud">
<div class="stat">🎯 SCORE<b id="score">0</b></div>
<div class="stat">⚡ COMBO<b id="combo">0</b></div>
<div class="stat">🎯 HIT RATE<b id="accuracy">100%</b></div>
<div class="stat">⏱️ TIME<b id="time">30.0</b></div>
</div>
<div class="arena" id="arena"><div class="grid"></div><div class="combo" id="comboText"></div><div id="target" class="target"></div><div id="flash"></div></div>
<div class="bottom"><div class="progress"><i id="progress"></i></div><button class="btn secondary" id="quit">Keluar</button></div>
</div>
</div>

<div class="overlay" id="overlay"><div class="modal">
<h2 id="resultTitle">Selesai</h2><div class="stars" id="stars"></div><div class="big" id="finalScore">0</div>
<p id="resultText"></p><button class="btn" id="again">Main Lagi</button>
</div></div>

<script>
const cfg={
 easy:{name:"Mudah",size:72,speed:70,moveEvery:900,max:15,time:30},
 normal:{name:"Normal",size:56,speed:135,moveEvery:600,max:20,time:30},
 hard:{name:"Sulit",size:42,speed:220,moveEvery:360,max:25,time:30}
};
let state=null,raf=0,last=0;

const $=id=>document.getElementById(id);
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function start(mode){
 cancelAnimationFrame(raf);let c=cfg[mode];
 state={mode,c,score:0,hits:0,shots:0,combo:0,bestCombo:0,time:c.time,spawned:0,x:0,y:0,vx:0,vy:0,nextMove:0,running:true,lastHit:0};
 $("menu").style.display="none";$("game").style.display="block";$("overlay").style.display="none";
 spawn(true);updateHUD();last=performance.now();raf=requestAnimationFrame(loop);
}
function spawn(first=false){
 if(!state.running)return;
 const a=$("arena"),c=state.c,pad=c.size/2+5;
 const w=a.clientWidth,h=a.clientHeight;
 state.x=pad+Math.random()*Math.max(1,w-pad*2);state.y=pad+Math.random()*Math.max(1,h-pad*2);
 const angle=Math.random()*Math.PI*2,s=c.speed*(.75+Math.random()*.5);
 state.vx=Math.cos(angle)*s;state.vy=Math.sin(angle)*s;
 state.nextMove=performance.now()+c.moveEvery*(.7+Math.random()*.5);
 state.spawned++;
 const t=$("target");t.style.width=c.size+"px";t.style.height=c.size+"px";t.style.display="block";
 t.style.left=state.x+"px";t.style.top=state.y+"px";
}
function loop(now){
 if(!state||!state.running)return;
 const dt=Math.min(.035,(now-last)/1000);last=now;state.time-=dt;
 const c=state.c,a=$("arena");
 state.x+=state.vx*dt;state.y+=state.vy*dt;
 const r=c.size/2;
 if(state.x<r||state.x>a.clientWidth-r){state.vx*=-1;state.x=clamp(state.x,r,a.clientWidth-r)}
 if(state.y<r||state.y>a.clientHeight-r){state.vy*=-1;state.y=clamp(state.y,r,a.clientHeight-r)}
 if(now>state.nextMove&&!firstLevelEasy()){spawn()}
 $("target").style.left=state.x+"px";$("target").style.top=state.y+"px";
 if(state.time<=0||state.spawned>=c.max&&state.hits>=c.max){finish();return}
 updateHUD();raf=requestAnimationFrame(loop);
}
function firstLevelEasy(){return false}
function shoot(e){
 if(!state||!state.running)return;
 state.shots++;
 const rect=$("arena").getBoundingClientRect();
 const x=e.clientX-rect.left,y=e.clientY-rect.top;
 const r=state.c.size/2;
 if(Math.hypot(x-state.x,y-state.y)<=r){
  state.hits++;state.combo++;state.bestCombo=Math.max(state.bestCombo,state.combo);
  state.score+=100+Math.min(200,state.combo*15);
  $("comboText").textContent=state.combo>=2?"🔥 COMBO x"+state.combo:"";
  $("flash").style.opacity=".12";setTimeout(()=>$("flash").style.opacity="0",45);
  if(state.hits>=state.c.max){finish();return}
  spawn();
 }else{
  state.combo=0;$("comboText").textContent="";state.score=Math.max(0,state.score-10);
 }
 updateHUD();
}
function updateHUD(){
 if(!state)return;
 $("score").textContent=state.score;$("combo").textContent=state.combo;
 $("accuracy").textContent=(state.shots?Math.round(state.hits/state.shots*100):100)+"%";
 $("time").textContent=Math.max(0,state.time).toFixed(1);
 $("progress").style.width=(state.hits/state.c.max*100)+"%";
}
function finish(){
 if(!state||!state.running)return;state.running=false;cancelAnimationFrame(raf);$("target").style.display="none";
 const acc=state.shots?state.hits/state.shots:0;
 let stars=acc>=.9&&state.hits>=Math.ceil(state.c.max*.8)?3:acc>=.7?2:1;
 $("resultTitle").textContent="🎯 "+state.c.name+" Selesai";
 $("stars").textContent="⭐".repeat(stars)+"☆".repeat(3-stars);
 $("finalScore").textContent=state.score+" pts";
 $("resultText").textContent=\`Hit \${state.hits}/\${state.c.max} • Akurasi \${Math.round(acc*100)}% • Combo terbaik x\${state.bestCombo}\`;
 $("overlay").style.display="grid";
}
$("arena").addEventListener("pointerdown",shoot);
document.querySelectorAll(".mode").forEach(b=>b.addEventListener("click",()=>start(b.dataset.mode)));
$("again").addEventListener("click",()=>start(state.mode));
$("quit").addEventListener("click",()=>{if(state){state.running=false;cancelAnimationFrame(raf)}$("target").style.display="none";$("game").style.display="none";$("menu").style.display="block";$("overlay").style.display="none"});
</script>
</body>
</html>`
  }),
  richplatformer: Object.freeze({
    title: 'Rimuru Platformer',
    html: `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Rimuru Platformer</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#080d18;color:#fff;font-family:Arial,sans-serif;display:flex;justify-content:center;min-height:100vh}.app{width:min(410px,100%);padding:8px}
.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}h1{font-size:21px;margin:0}.muted{font-size:12px;color:#98a6c5}
.menu,.game{background:#111a2c;border:1px solid #2a3b60;border-radius:18px;padding:14px}.menu{text-align:center}.levels{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:15px}.level{border:1px solid #354b76;background:#182540;color:#fff;border-radius:14px;padding:16px 10px;text-align:left;cursor:pointer}.level:hover{border-color:#7895ff;transform:translateY(-2px)}.level b{display:block;margin-bottom:5px}.level small{color:#aab8d2;line-height:1.45}
.game{display:none}.hud{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:9px}.stat{background:#0b1323;border:1px solid #253858;border-radius:10px;padding:7px;text-align:center;font-size:11px}.stat b{display:block;font-size:16px;margin-top:2px}
.canvasWrap{position:relative;border-radius:15px;overflow:hidden;border:1px solid #314568;background:#72b8e6}.gamecanvas{display:block;width:100%;height:auto;touch-action:none}.controls{display:flex;justify-content:space-between;gap:10px;margin-top:9px}.pad{display:flex;gap:8px}.btn{border:0;border-radius:12px;background:#536eff;color:#fff;font-weight:bold;min-width:58px;min-height:48px;font-size:20px;cursor:pointer;touch-action:none}.jump{min-width:100px;background:#5a8cff}.secondary{background:#253653;font-size:13px}
.bar{height:8px;background:#263147;border-radius:10px;overflow:hidden;margin-top:7px}.bar i{display:block;height:100%;width:0;background:#62e28a}.modal{position:fixed;inset:0;background:#000c;display:none;place-items:center;padding:18px}.box{width:min(390px,100%);background:#121c31;border:1px solid #3b4e76;border-radius:18px;padding:20px;text-align:center}.big{font-size:34px;font-weight:bold}.box button{margin-top:12px;width:100%}
@media(max-width:600px){.levels{grid-template-columns:1fr}.hud{grid-template-columns:repeat(2,1fr)}.game{padding:8px}.canvasWrap{max-height:none}}
</style>
</head>
<body>
<div class="app">
<div class="top"><h1>🏃 Rimuru Platformer</h1><span class="muted">Jump • Run • Collect</span></div>
<div id="menu" class="menu">
<h2>Pilih Level</h2><p class="muted">Lompat melewati rintangan, ambil koin, injak musuh, dan capai portal.</p>
<div class="levels">
<button class="level" data-level="easy"><b>🟢 Mudah</b><small>Platform lebar<br>Musuh sedikit<br>Kecepatan santai</small></button>
<button class="level" data-level="normal"><b>🟡 Normal</b><small>Platform lebih kecil<br>Musuh lebih banyak<br>Rintangan bergerak</small></button>
<button class="level" data-level="hard"><b>🔴 Sulit</b><small>Platform sempit<br>Musuh cepat<br>Jatuh lebih mudah</small></button>
</div></div>

<div id="game" class="game">
<div class="hud">
<div class="stat">❤️ HP<b id="hp">3</b></div><div class="stat">🪙 COIN<b id="coins">0</b></div><div class="stat">🏆 SCORE<b id="score">0</b></div><div class="stat">🚩 LEVEL<b id="levelText">Mudah</b></div>
</div>
<div class="canvasWrap"><canvas id="c" class="gamecanvas" width="860" height="480"></canvas></div>
<div class="controls"><div class="pad"><button class="btn" id="left">◀</button><button class="btn" id="right">▶</button></div><button class="btn jump" id="jump">JUMP ⤴</button><button class="btn secondary" id="quit">Keluar</button></div>
<div class="bar"><i id="progress"></i></div>
</div>
</div>
<div class="modal" id="modal"><div class="box"><h2 id="resultTitle">Selesai</h2><div class="big" id="resultScore">0</div><p id="resultText"></p><button class="btn" id="again">Main Lagi</button></div></div>

<script>
const canvas=document.getElementById("c"),ctx=canvas.getContext("2d");
const cfg={easy:{name:"Mudah",speed:3.4,jump:10.8,enemy:1,plats:10},normal:{name:"Normal",speed:4.1,jump:11.2,enemy:2,plats:12},hard:{name:"Sulit",speed:4.8,jump:11.7,enemy:3,plats:14}};
let S=null,keys={left:false,right:false},raf=0,last=0;

function start(level){
 const z=cfg[level]; S={mode:level,c:z,x:70,y:360,vx:0,vy:0,w:28,h:38,hp:3,coins:0,score:0,cam:0,done:false,win:false,jump:false,
 platforms:[],coinsArr:[],enemies:[],portal:{x:0,y:0,w:34,h:60}};
 build();
 document.getElementById("menu").style.display="none";document.getElementById("game").style.display="block";document.getElementById("modal").style.display="none";
 last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop);updateHUD();
}
function build(){
 const n=S.c.plats;let x=0,y=410;
 S.platforms.push({x:0,y:410,w:230,h:70});
 for(let i=1;i<n;i++){
  x+=170+Math.random()*130;
  y=300+Math.random()*105;
  let w=S.mode==="hard"?95+Math.random()*45:120+Math.random()*70;
  S.platforms.push({x,y,w,h:22});
  if(i<n-1)S.coinsArr.push({x:x+w*.5,y:y-25,r:9,got:false});
  if(i>1 && i<n-1 && (i%2===0 || S.mode==="hard")){
   S.enemies.push({x:x+w*.55,y:y-28,w:28,h:28,vx:(Math.random()>.5?1:-1)*(S.c.enemy+.5),min:x+8,max:x+w-36,alive:true});
  }
 }
 let lastp=S.platforms[S.platforms.length-1];S.portal={x:lastp.x+lastp.w-48,y:lastp.y-60,w:34,h:60};
}
function inputLoop(){
 S.vx=keys.left?-S.c.speed:keys.right?S.c.speed:S.vx*.78;
 if(Math.abs(S.vx)<.08)S.vx=0;
}
function jump(){
 if(!S||S.done)return;
 const p=playerPlatform();
 if(p&&S.y+S.h<=p.y+5){S.vy=-S.c.jump}
}
function playerPlatform(){
 return S.platforms.find(p=>S.x+S.w>p.x+4&&S.x<p.x+p.w-4&&S.y+S.h>=p.y-3&&S.y+S.h<=p.y+18);
}
function update(dt){
 inputLoop();S.x+=S.vx;S.vy+=.5*60*dt;S.y+=S.vy;
 let landed=false;
 for(const p of S.platforms){
  if(S.x+S.w>p.x&&S.x<p.x+p.w&&S.y+S.h>=p.y&&S.y+S.h<=p.y+20&&S.vy>=0){S.y=p.y-S.h;S.vy=0;landed=true}
 }
 for(const e of S.enemies){
  if(!e.alive)continue;e.x+=e.vx;
  if(e.x<e.min||e.x>e.max)e.vx*=-1;
  if(collide(S,e)){
   if(S.vy>1&&S.y+S.h-e.y<16){e.alive=false;S.vy=-7;S.score+=150}
   else hurt();
  }
 }
 for(const q of S.coinsArr)if(!q.got&&Math.hypot(S.x+S.w/2-q.x,S.y+S.h/2-q.y)<25){q.got=true;S.coins++;S.score+=50}
 if(collide(S,S.portal)){finish(true);return}
 if(S.y>canvas.height+100){hurt(true);return}
 S.x=Math.max(0,S.x);S.cam=Math.max(0,S.x-260);
 const target= S.platforms[S.platforms.length-1].x;
 document.getElementById("progress").style.width=Math.min(100,S.x/target*100)+"%";
}
function hurt(fall=false){
 if(S.done)return;S.hp--;S.score=Math.max(0,S.score-50);
 if(S.hp<=0){finish(false);return}
 S.x=Math.max(40,S.x-90);S.y=180;S.vy=0;
}
function collide(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function draw(){
 ctx.clearRect(0,0,canvas.width,canvas.height);
 const g=ctx.createLinearGradient(0,0,0,canvas.height);g.addColorStop(0,"#74c4ec");g.addColorStop(1,"#d4f0ff");ctx.fillStyle=g;ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.save();ctx.translate(-S.cam,0);
 // background hills
 ctx.fillStyle="#75a86e";for(let i=0;i<8;i++){ctx.beginPath();ctx.arc(i*260,410,130,Math.PI,Math.PI*2);ctx.fill()}
 for(const p of S.platforms){ctx.fillStyle="#6a4935";ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle="#5ec76b";ctx.fillRect(p.x,p.y,p.w,8)}
 for(const q of S.coinsArr)if(!q.got){ctx.fillStyle="#ffd54a";ctx.beginPath();ctx.arc(q.x,q.y,q.r,0,Math.PI*2);ctx.fill();ctx.fillStyle="#fff1a6";ctx.fillRect(q.x-2,q.y-6,4,12)}
 for(const e of S.enemies)if(e.alive){ctx.fillStyle="#8b3d58";ctx.fillRect(e.x,e.y,e.w,e.h);ctx.fillStyle="#fff";ctx.fillRect(e.x+5,e.y+7,5,5);ctx.fillRect(e.x+18,e.y+7,5,5)}
 ctx.fillStyle="#6b4eff";ctx.fillRect(S.portal.x,S.portal.y,S.portal.w,S.portal.h);ctx.fillStyle="#a88cff";ctx.fillRect(S.portal.x+7,S.portal.y+8,20,44);
 // player
 ctx.fillStyle="#ffcf45";ctx.fillRect(S.x,S.y,S.w,S.h);ctx.fillStyle="#2e3b72";ctx.fillRect(S.x+5,S.y+8,18,12);ctx.fillStyle="#fff";ctx.fillRect(S.x+8,S.y+11,4,5);ctx.fillRect(S.x+17,S.y+11,4,5);
 ctx.restore();
}
function loop(now){
 if(!S||S.done)return;const dt=Math.min(.035,(now-last)/1000);last=now;update(dt);draw();updateHUD();raf=requestAnimationFrame(loop);
}
function updateHUD(){document.getElementById("hp").textContent=S.hp;document.getElementById("coins").textContent=S.coins;document.getElementById("score").textContent=S.score;document.getElementById("levelText").textContent=S.c.name}
function finish(win){
 S.done=true;cancelAnimationFrame(raf);
 document.getElementById("resultTitle").textContent=win?"🏆 LEVEL SELESAI!":"💀 GAME OVER";
 document.getElementById("resultScore").textContent=S.score+" pts";
 document.getElementById("resultText").textContent=win?\`Kamu mencapai portal dengan \${S.coins} coin.\`:\`HP habis. Coin terkumpul: \${S.coins}.\`;
 document.getElementById("modal").style.display="grid";
}
function bindHold(id,key){
 const b=document.getElementById(id);
 const on=()=>keys[key]=true,onoff=()=>keys[key]=false;
 b.addEventListener("pointerdown",on);["pointerup","pointercancel","pointerleave"].forEach(e=>b.addEventListener(e,onoff));
}
bindHold("left","left");bindHold("right","right");
document.getElementById("jump").addEventListener("pointerdown",jump);
document.querySelectorAll(".level").forEach(b=>b.addEventListener("click",()=>start(b.dataset.level)));
document.getElementById("again").addEventListener("click",()=>start(S.mode));
document.getElementById("quit").addEventListener("click",()=>{S.done=true;cancelAnimationFrame(raf);document.getElementById("game").style.display="none";document.getElementById("menu").style.display="block";document.getElementById("modal").style.display="none"});
window.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"||e.key==="a")keys.left=true;if(e.key==="ArrowRight"||e.key==="d")keys.right=true;if(e.key==="ArrowUp"||e.key===" "||e.key==="w"){e.preventDefault();jump()}});
window.addEventListener("keyup",e=>{if(e.key==="ArrowLeft"||e.key==="a")keys.left=false;if(e.key==="ArrowRight"||e.key==="d")keys.right=false});
</script>
</body>
</html>`
  }),
  richspaceshooter: Object.freeze({
    title: 'Rimuru Space Shooter',
    html: `<!doctype html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Rimuru Space Shooter</title>
<style>
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;min-height:100%;background:#080c15;color:#fff;font-family:Arial,sans-serif;-webkit-user-select:none;user-select:none}
body{display:flex;justify-content:center;min-height:100vh;touch-action:pan-y}
.app{width:min(410px,100%);padding:8px}
.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
h1{font-size:21px;margin:0}
.muted{color:#9ba8c5;font-size:12px}
.game{background:#111827;border:1px solid #293755;border-radius:18px;padding:12px}
.hud{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-bottom:9px}
.stat{background:#0c1425;border:1px solid #253653;border-radius:10px;padding:8px 4px;text-align:center;font-size:11px}
.stat b{display:block;font-size:17px;margin-top:2px}
#stage{position:relative;width:100%;aspect-ratio:10/11;overflow:hidden;border-radius:15px;border:1px solid #2b3b5c;background:#020617;touch-action:none}
#game{display:block;position:absolute;inset:0;width:100%;height:100%;background:#020617}
#bossbar{position:absolute;left:12px;right:12px;top:10px;z-index:10;display:none;pointer-events:none}
#bossbar .label{font-size:11px;font-weight:800;margin-bottom:5px;text-align:center;text-shadow:0 1px 4px #000}
.bar{height:9px;border-radius:999px;background:rgba(255,255,255,.13);overflow:hidden;border:1px solid rgba(255,255,255,.1)}
.bar>i{display:block;height:100%;width:100%;background:linear-gradient(90deg,#ef4444,#f97316);border-radius:inherit;transition:width .08s linear}
.controls{display:grid;grid-template-columns:1fr 1fr 1.35fr 1.35fr;gap:8px;margin-top:9px}
.ctrl{height:50px;padding:0;border:1px solid #2c344a;border-radius:14px;background:#171c2c;color:#fff;font-size:20px;font-weight:800;touch-action:none}
.ctrl:active,.ctrl.on{transform:scale(.96);background:#242b40}
#boost{border:0;background:linear-gradient(135deg,#574dff,#9b57e9);font-size:12px}
#fire{border:0;background:#dc2626;font-size:13px}
#overlay{position:absolute;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:12px;background:rgba(2,6,23,.84);overflow:auto}
#panel{width:min(320px,100%);max-height:100%;overflow:auto;padding:18px;border-radius:18px;text-align:center;background:linear-gradient(180deg,rgba(15,23,42,.98),rgba(2,6,23,.98));border:1px solid rgba(255,255,255,.14);box-shadow:0 20px 70px rgba(0,0,0,.45)}
#panel h1{margin:0 0 8px;font-size:23px;color:#7dd3fc}
#panel p{margin:0 0 14px;color:#cbd5e1;font-size:13px;line-height:1.5}
#start{width:100%;min-height:46px;border:0;border-radius:13px;background:#0284c7;color:#fff;font-weight:800;font-size:15px}
#hint{margin-top:10px;color:#94a3b8;font-size:10.5px;line-height:1.5}
.hidden{display:none!important}
@media(max-width:360px){h1{font-size:18px}.muted{display:none}.stat b{font-size:15px}.ctrl{height:46px}}
</style>
</head>
<body>
<div class="app">
  <div class="top"><h1>🚀 Rimuru Space Shooter</h1><span class="muted">Survive • Shoot</span></div>
  <div class="game">
    <div class="hud">
      <div class="stat">SCORE<b id="score">0</b></div>
      <div class="stat">LEVEL<b id="level">1</b></div>
      <div class="stat">LIVES<b id="lives">3</b></div>
      <div class="stat">BEST<b id="best">0</b></div>
    </div>
    <div id="stage">
      <canvas id="game"></canvas>
      <div id="bossbar"><div class="label" id="bossLabel">BOSS</div><div class="bar"><i id="bossFill"></i></div></div>
      <div id="overlay">
        <div id="panel">
          <h1 id="panelTitle">🚀 Space Shooter</h1>
          <p id="panelText">Hancurkan meteor dan alien, kumpulkan skor, lalu kalahkan boss setiap beberapa level.</p>
          <button id="start">MULAI GAME</button>
          <div id="hint">Keyboard: A/D atau ←/→ gerak • Space tembak • Shift boost</div>
        </div>
      </div>
    </div>
    <div class="controls">
      <button id="left" class="ctrl">◀</button>
      <button id="right" class="ctrl">▶</button>
      <button id="boost" class="ctrl">⚡ BOOST</button>
      <button id="fire" class="ctrl">🔥 FIRE</button>
    </div>
  </div>
</div>
<script>
(()=>{
'use strict';
const stage=document.getElementById('stage');
const canvas=document.getElementById('game');
const ctx=canvas.getContext('2d',{alpha:false});
if(!ctx)return;
const $=id=>document.getElementById(id);
let W=760,H=950,DPR=Math.min(devicePixelRatio||1,2);
let raf=0,last=0,running=false,gameOver=false;
let score=0,level=1,lives=3,best=0;
try{best=Number(localStorage.getItem('rimuru_space_best')||0)}catch{}
let spawnTimer=0,shotTimer=0,enemyShotTimer=0,levelTimer=0,screenShake=0,boss=null;
const keys={left:false,right:false,fire:false,boost:false};
const stars=[],bullets=[],enemies=[],enemyBullets=[],particles=[];
const ship={x:0,y:0,w:30,h:38,speed:360,invuln:0,boost:100};
$('best').textContent=best;
const hasAR=!!(window.CSS&&CSS.supports&&CSS.supports('aspect-ratio','10/11'));
function shipY(){return H-Math.max(52,H*.1)}
function resize(){
  if(!hasAR)stage.style.height=Math.round(stage.clientWidth*1.1)+'px';
  const rect=stage.getBoundingClientRect();
  W=Math.max(120,Math.floor(rect.width)); H=Math.max(120,Math.floor(rect.height)); DPR=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.floor(W*DPR); canvas.height=Math.floor(H*DPR);
  canvas.style.width='100%'; canvas.style.height='100%';
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ship.y=shipY();
  ship.x=Math.max(24,Math.min(W-24,ship.x||W/2));
  if(stars.length<90){for(let i=stars.length;i<90;i++)stars.push({x:Math.random()*W,y:Math.random()*H,s:1+Math.random()*2,v:20+Math.random()*80})}
}
addEventListener('resize',()=>{resize();if(!running)draw()});resize();
function showPanel(title,text,button='MULAI GAME'){$('panelTitle').textContent=title;$('panelText').innerHTML=text;$('start').textContent=button;$('overlay').classList.remove('hidden')}
function hidePanel(){$('overlay').classList.add('hidden')}
function reset(){
  bullets.length=enemies.length=enemyBullets.length=particles.length=0;boss=null;score=0;level=1;lives=3;ship.x=W/2;ship.y=shipY();ship.invuln=0;ship.boost=100;spawnTimer=.3;shotTimer=0;enemyShotTimer=0;levelTimer=0;gameOver=false;screenShake=0;
  updateHud();
}
function updateHud(){$('score').textContent=Math.floor(score);$('level').textContent=level;$('lives').textContent=lives;$('best').textContent=best}
function addParticle(x,y,color,size=3,life=.5,vx=0,vy=0){particles.push({x,y,color,size,life,max:life,vx,vy})}
function burst(x,y,color,count=10){for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=(30+Math.random()*110);addParticle(x,y,color,1+Math.random()*3,.3+Math.random()*.45,Math.cos(a)*s,Math.sin(a)*s)}}
function shoot(){if(!running||ship.invuln>99||shotTimer>0)return;bullets.push({x:ship.x,y:ship.y-21,vy:-650,w:4,h:14});shotTimer=keys.boost?.07:.12}
function spawnEnemy(){
  const r=Math.random();
  const type=r<.62?'normal':r<.86?'fast':'tank';
  const size=type==='tank'?29:type==='fast'?20:23;
  const hp=type==='tank'?3:1;
  enemies.push({type,x:18+Math.random()*(W-36),y:-35,w:size,h:size,vy:type==='fast'?115+level*4:type==='tank'?55+level*2:75+level*3,hp,maxHp:hp,t:Math.random()*10,phase:Math.random()*6,shoot:1+Math.random()*2})
}
function spawnBoss(){
  boss={x:W/2,y:-90,w:84,h:62,hp:18+level*3,maxHp:18+level*3,vy:48};
  $('bossbar').style.display='block';
  $('bossFill').style.width='100%';
  $('bossLabel').textContent='BOSS • LEVEL '+level;
}
function enemyDamage(x,y){
  for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(Math.abs(x-e.x)<(e.w+4)&&Math.abs(y-e.y)<(e.h+6)){e.hp--;burst(x,y,e.type==='tank'?'#fb923c':'#facc15',5);if(e.hp<=0){score+=e.type==='tank'?50:e.type==='fast'?25:15;burst(e.x,e.y,e.type==='fast'?'#a855f7':'#ef4444',16);enemies.splice(i,1);updateHud()}return true}}
  if(boss&&Math.abs(x-boss.x)<boss.w*.55&&Math.abs(y-boss.y)<boss.h*.6){boss.hp--;score+=8;burst(x,y,'#facc15',4);$('bossFill').style.width=Math.max(0,boss.hp/boss.maxHp*100)+'%';if(boss.hp<=0){score+=500;burst(boss.x,boss.y,'#ef4444',50);boss=null;$('bossbar').style.display='none';level++;levelTimer=0;updateHud()}return true}
  return false;
}
function hitPlayer(){
  if(ship.invuln>0)return;
  lives--;ship.invuln=1.35;screenShake=.25;burst(ship.x,ship.y,'#f97316',25);updateHud();
  if(lives<=0)endGame();
}
function endGame(){
  running=false;gameOver=true;best=Math.max(best,Math.floor(score));try{localStorage.setItem('rimuru_space_best',String(best))}catch{}updateHud();
  showPanel('💥 GAME OVER',\`Skor kamu <b>\${Math.floor(score)}</b><br>Level tercapai <b>\${level}</b><br><br>Tekan tombol untuk bermain lagi.\`,'MAIN LAGI');
}
function update(dt){
  const boostActive=keys.boost&&ship.boost>0;
  if(boostActive)ship.boost=Math.max(0,ship.boost-32*dt);else ship.boost=Math.min(100,ship.boost+16*dt);
  const speed=ship.speed*(boostActive?1.8:1);
  if(keys.left)ship.x-=speed*dt;if(keys.right)ship.x+=speed*dt;ship.x=Math.max(24,Math.min(W-24,ship.x));
  ship.invuln=Math.max(0,ship.invuln-dt);shotTimer=Math.max(0,shotTimer-dt);
  if(keys.fire)shoot();
  levelTimer+=dt;
  if(!boss&&level%3===0&&levelTimer<1)spawnBoss();
  if(!boss){spawnTimer-=dt;if(spawnTimer<=0){spawnEnemy();spawnTimer=Math.max(.35,1.05-level*.045)*(.75+Math.random()*.55)}enemyShotTimer-=dt;if(enemyShotTimer<=0){for(const e of enemies){if(Math.random()<.28)enemyBullets.push({x:e.x,y:e.y+e.h*.6,vy:160+level*7,r:4})}enemyShotTimer=.9+Math.random()*.9}}
  for(let i=stars.length-1;i>=0;i--){const s=stars[i];s.y+=(s.v+(boostActive?80:0))*dt;if(s.y>H+3)s.y=-3}
  for(let i=bullets.length-1;i>=0;i--){const b=bullets[i];b.y+=b.vy*dt;if(b.y<-30){bullets.splice(i,1);continue}if(enemyDamage(b.x,b.y)){bullets.splice(i,1)}}
  for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];e.y+=e.vy*dt;e.x+=Math.sin((e.t+=dt)+e.phase)*18*dt;if(e.y>H+45){enemies.splice(i,1);continue}if(Math.abs(ship.x-e.x)<(ship.w+e.w)*.45&&Math.abs(ship.y-e.y)<(ship.h+e.h)*.45){enemies.splice(i,1);hitPlayer()}}
  for(let i=enemyBullets.length-1;i>=0;i--){const b=enemyBullets[i];b.y+=b.vy*dt;if(b.y>H+20){enemyBullets.splice(i,1);continue}if(Math.abs(ship.x-b.x)<20&&Math.abs(ship.y-b.y)<28){enemyBullets.splice(i,1);hitPlayer()}}
  if(boss){boss.y=Math.min(130,boss.y+boss.vy*dt);boss.x=W/2+Math.sin(performance.now()/900)*Math.max(30,W*.24);if(Math.random()<dt*.7)enemyBullets.push({x:boss.x-24,y:boss.y+24,vy:210+level*7,r:5});if(Math.random()<dt*.7)enemyBullets.push({x:boss.x+24,y:boss.y+24,vy:230+level*7,r:5})}
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1)}
  screenShake=Math.max(0,screenShake-dt);updateHud();
}
function drawShip(){
  if(ship.invuln>0&&Math.floor(ship.invuln*12)%2===0)return;
  ctx.save();ctx.translate(ship.x,ship.y);
  ctx.fillStyle='#38bdf8';ctx.shadowColor='#38bdf8';ctx.shadowBlur=14;ctx.beginPath();ctx.moveTo(0,-23);ctx.lineTo(-18,19);ctx.lineTo(0,11);ctx.lineTo(18,19);ctx.closePath();ctx.fill();
  ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,-3,5,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f97316';ctx.beginPath();ctx.moveTo(-5,16);ctx.lineTo(0,29+Math.random()*7);ctx.lineTo(5,16);ctx.closePath();ctx.fill();
  ctx.restore();
}
function draw(){
  const shake=screenShake>0?screenShake*14:0;ctx.save();if(shake)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);
  const g=ctx.createRadialGradient(W*.5,H*.2,20,W*.5,H*.5,Math.max(W,H)*.75);g.addColorStop(0,'#172554');g.addColorStop(.48,'#06102a');g.addColorStop(1,'#000');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  for(const s of stars){ctx.fillStyle=\`rgba(255,255,255,\${.35+s.s*.2})\`;ctx.fillRect(s.x,s.y,s.s,s.s*2)}
  for(const b of bullets){ctx.fillStyle='#facc15';ctx.shadowColor='#facc15';ctx.shadowBlur=8;ctx.fillRect(b.x-2,b.y-b.h*.5,b.w,b.h);ctx.shadowBlur=0}
  for(const b of enemyBullets){ctx.fillStyle='#fb7185';ctx.shadowColor='#fb7185';ctx.shadowBlur=9;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}
  for(const e of enemies){ctx.save();ctx.translate(e.x,e.y);ctx.fillStyle=e.type==='fast'?'#a855f7':e.type==='tank'?'#f97316':'#ef4444';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=12;ctx.beginPath();ctx.arc(0,0,e.w*.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#020617';ctx.beginPath();ctx.arc(-e.w*.16,-2,3,0,Math.PI*2);ctx.arc(e.w*.16,-2,3,0,Math.PI*2);ctx.fill();ctx.restore()}
  if(boss){ctx.save();ctx.translate(boss.x,boss.y);ctx.fillStyle='#dc2626';ctx.shadowColor='#dc2626';ctx.shadowBlur=22;ctx.beginPath();ctx.moveTo(-27,-28);ctx.lineTo(27,-28);ctx.quadraticCurveTo(42,-28,42,-13);ctx.lineTo(42,13);ctx.quadraticCurveTo(42,28,27,28);ctx.lineTo(-27,28);ctx.quadraticCurveTo(-42,28,-42,13);ctx.lineTo(-42,-13);ctx.quadraticCurveTo(-42,-28,-27,-28);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#111827';ctx.fillRect(-22,-7,12,12);ctx.fillRect(10,-7,12,12);ctx.fillStyle='#fef08a';ctx.fillRect(-4,10,8,8);ctx.restore()}
  for(const p of particles){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.size,p.size);ctx.globalAlpha=1}
  drawShip();ctx.restore();
}
function loop(t){if(!running)return;const dt=Math.min(.033,Math.max(.001,(t-last)/1000||.016));last=t;update(dt);draw();raf=requestAnimationFrame(loop)}
function startGame(){cancelAnimationFrame(raf);reset();running=true;hidePanel();last=performance.now();raf=requestAnimationFrame(loop)}
$('start').addEventListener('click',startGame);
function bindHold(id,key){const b=$(id);const on=e=>{e.preventDefault();keys[key]=true;b.classList.add('on')};const off=e=>{e.preventDefault();keys[key]=false;b.classList.remove('on')};b.addEventListener('contextmenu',e=>e.preventDefault());b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off)}
bindHold('left','left');bindHold('right','right');bindHold('fire','fire');bindHold('boost','boost');
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k==='a'||e.key==='arrowleft')keys.left=true;if(k==='d'||e.key==='arrowright')keys.right=true;if(e.code==='space')keys.fire=true;if(e.key==='shift')keys.boost=true;if(['arrowleft','arrowright',' '].includes(e.key)||e.code==='Space')e.preventDefault()});
addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(k==='a'||e.key==='arrowleft')keys.left=false;if(k==='d'||e.key==='arrowright')keys.right=false;if(e.code==='space')keys.fire=false;if(e.key==='shift')keys.boost=false});
reset();draw();
})();
</script>
</body>
</html>
`
  }),
  richmurder: Object.freeze({
    title: 'Rimuru Murder Mystery',
    html: `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Murder Mystery</title>
<style>
*{box-sizing:border-box}html,body{margin:0;min-height:100%;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;background:#070910;color:#fff}
body{display:flex;align-items:center;justify-content:center;padding:8px}
.app{width:min(410px,100%);background:linear-gradient(180deg,#111625,#090b12);border:1px solid #272d40;border-radius:26px;overflow:hidden;box-shadow:0 25px 80px #0009}
.top{padding:15px 18px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #202638}.logo{font-size:19px;font-weight:950}.level{font-weight:900;color:#c7b7ff}
.game{padding:14px}.scene{background:#141927;border:1px solid #292f42;border-radius:18px;padding:14px;min-height:250px}.case{font-size:12px;color:#8f9ab4;font-weight:900;text-transform:uppercase;letter-spacing:.08em}.title{font-size:22px;font-weight:950;margin:5px 0 7px}.story{font-size:13px;color:#b3bbcd;line-height:1.5}.clues{display:grid;gap:7px;margin-top:11px}.clue{background:#1b2130;border:1px solid #2b3449;border-radius:11px;padding:9px;font-size:12px;color:#d8ddeb}.suspects{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:11px}.suspect{background:#171c2b;border:1px solid #2c344a;color:#fff;border-radius:13px;padding:10px;text-align:left;min-height:70px;font-weight:900}.suspect span{display:block;font-size:11px;color:#8993aa;font-weight:600;margin-top:3px}.suspect.selected{border-color:#9b7cff;background:#24203a;box-shadow:0 0 0 1px #9b7cff55 inset}.suspect:active{transform:scale(.98)}
.info{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px}.box{background:#141927;border:1px solid #252c40;border-radius:13px;padding:9px;text-align:center}.lab{font-size:10px;color:#7f89a4;font-weight:900}.val{font-size:17px;font-weight:950;margin-top:2px}
.controls{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:10px}button{border:1px solid #2c344a;background:#171c2c;color:#fff;border-radius:14px;padding:13px 8px;font-weight:950;touch-action:manipulation;user-select:none}button:active{transform:scale(.97);background:#242b40}.primary{background:linear-gradient(135deg,#665cff,#9758ec);border:0}.danger{background:#33202a;border-color:#55313e}.help{text-align:center;color:#7f89a4;font-size:11px;margin-top:9px}.overlay{position:fixed;inset:0;background:#000b;display:flex;align-items:center;justify-content:center;padding:20px}.card{width:min(410px,100%);background:#111625;border:1px solid #2a3146;border-radius:25px;padding:28px;text-align:center;box-shadow:0 25px 90px #000}.emoji{font-size:60px}.card h1{font-size:29px;margin:8px 0}.card p{color:#9da6bc;line-height:1.55;margin:0 0 20px}.hide{display:none}.success{color:#7ee5a0}.fail{color:#ff8897}.progress{height:6px;background:#272e40;border-radius:99px;overflow:hidden;margin-top:9px}.progress i{display:block;height:100%;width:2%;background:#8e78ff;transition:width .2s}
@media(max-width:350px){.suspects{grid-template-columns:1fr}.title{font-size:19px}}
</style>
</head>
<body>
<div class="app">
 <div class="top"><div class="logo">🕵️ Murder Mystery</div><div class="level">Lv <span id="level">1</span>/50</div></div>
 <div class="game">
  <div class="scene">
   <div class="case">Kasus <span id="caseNo">01</span></div>
   <div class="title" id="title">Misteri di Rumah Tua</div>
   <div class="story" id="story"></div>
   <div class="clues" id="clues"></div>
   <div class="suspects" id="suspects"></div>
  </div>
  <div class="info">
   <div class="box"><div class="lab">CLUE</div><div class="val" id="clueCount">0/0</div></div>
   <div class="box"><div class="lab">KESALAHAN</div><div class="val" id="mistakes">0/2</div></div>
   <div class="box"><div class="lab">SKOR</div><div class="val" id="score">0</div></div>
  </div>
  <div class="progress"><i id="progress"></i></div>
  <div class="controls">
   <button class="primary" id="accuse">🔎 TUDUH TERSANGKA</button>
   <button class="danger" id="reset">↻ ULANG LEVEL</button>
  </div>
  <div class="help">Baca semua petunjuk, pilih tersangka, lalu tekan tuduh.</div>
 </div>
</div>

<div class="overlay" id="start">
 <div class="card"><div class="emoji">🕵️</div><h1>Murder Mystery</h1><p>Taklukkan 50 kasus. Cari petunjuk, bandingkan alibi, lalu tentukan siapa tersangkanya.</p><button class="primary" style="width:100%" id="startBtn">MULAI PENYELIDIKAN</button></div>
</div>
<div class="overlay hide" id="result">
 <div class="card"><div class="emoji" id="resultEmoji">🎉</div><h1 id="resultTitle">Kasus Terpecahkan!</h1><p id="resultText"></p><button class="primary" style="width:100%" id="nextBtn">KASUS BERIKUTNYA</button></div>
</div>

<script>
const $=id=>document.getElementById(id);
const names=['Arga','Bima','Citra','Dimas','Elin','Fajar','Gita','Hana','Iqbal','Juno'];
const places=['perpustakaan','ruang musik','dapur','teras belakang','ruang kerja','garasi','ruang tamu','loteng','taman','studio'];
const motives=['ingin mengambil dokumen penting','mengejar sebuah rahasia lama','ingin mendapatkan kembali barang miliknya','takut rencananya terbongkar','berselisih soal sebuah kontrak','ingin menutupi kesalahan sebelumnya'];
const baseCases=[
 ['Misteri di Rumah Tua','Sebuah dokumen penting hilang setelah lampu rumah padam beberapa menit.'],
 ['Jam yang Berhenti','Sebuah jam berhenti tepat saat kejadian, tetapi tidak ada tanda kerusakan.'],
 ['Kunci Ruang Kerja','Kunci cadangan ditemukan di tempat yang seharusnya hanya diketahui dua orang.'],
 ['Pesan Terakhir','Sebuah pesan singkat memberi petunjuk tentang seseorang yang berbohong.'],
 ['Jejak di Taman','Sebuah jejak menunjukkan seseorang datang dari arah yang berbeda dari pengakuannya.']
];
let level=1,score=0,mistakes=0,selected=-1,current=null,running=false;
function rng(n){return Math.floor(Math.random()*n)}
function makeCase(lv){
 const n=lv<=5?4:lv<=15?5:lv<=30?6:lv<=45?7:8;
 let culprit=rng(n), pool=[];
 while(pool.length<n) {let x=rng(names.length);if(!pool.includes(x))pool.push(x)}
 const suspects=pool.map((idx,i)=>({name:names[idx],role:['Pemilik','Teman','Pegawai','Tamu','Tetangga','Rekan','Penjaga','Teknisi'][i],truth:i===culprit}));
 const place=places[(lv-1)%places.length], motive=motives[(lv-1)%motives.length];
 const cluePool=[
  \`Rekaman menunjukkan seseorang masuk dari arah \${place}.\`,
  \`Salah satu tersangka mengaku berada di tempat lain pada waktu yang sama.\`,
  \`Ada catatan kecil yang menyebut alasan: \${motive}.\`,
  \`Saksi mendengar langkah kaki sebelum listrik kembali menyala.\`,
  \`Sebuah benda dipindahkan tanpa ada yang mengaku memindahkannya.\`,
  \`Waktu pada catatan saksi berbeda beberapa menit dari cerita salah satu tersangka.\`,
  \`Petunjuk lokasi tidak cocok dengan alibi salah satu tersangka.\`,
  \`Satu alibi terdengar meyakinkan, tetapi bertentangan dengan bukti waktu.\`
 ];
 let clues=[]; const count=Math.min(3+Math.floor((lv-1)/8),6);
 // Guaranteed decisive clue: references culprit's index without explicitly naming them until player chooses.
 clues.push(\`Alibi orang yang datang paling akhir bertentangan dengan catatan waktu.\`);
 while(clues.length<count){let c=cluePool[rng(cluePool.length)];if(!clues.includes(c))clues.push(c)}
 // To make the puzzle deterministic and solvable, the decisive clue identifies a unique suspect by a coded detail.
 const code=(culprit+3)%10;
 clues[0]=\`Petunjuk utama: kode pada catatan cocok dengan angka \${code}. Hanya satu tersangka memiliki nomor lencana \${code}.\`;
 suspects.forEach((s,i)=>s.badge=(i===culprit?code:(i+1+code)%10));
 return {title:baseCases[(lv-1)%baseCases.length][0]+(lv>5?' — Kasus '+lv:''),story:baseCases[(lv-1)%baseCases.length][1],clues,suspects,culprit};
}
function render(){
 $('level').textContent=level;$('caseNo').textContent=String(level).padStart(2,'0');
 $('title').textContent=current.title;$('story').textContent=current.story;
 $('clues').innerHTML=current.clues.map((x,i)=>\`<div class="clue">🔍 \${x}</div>\`).join('');
 $('suspects').innerHTML=current.suspects.map((s,i)=>\`<button class="suspect \${selected===i?'selected':''}" data-i="\${i}">👤 \${s.name}<span>\${s.role} • Lencana #\${s.badge}</span></button>\`).join('');
 document.querySelectorAll('.suspect').forEach(b=>b.onclick=()=>{selected=Number(b.dataset.i);render()});
 $('clueCount').textContent=current.clues.length+'/'+current.clues.length;
 $('mistakes').textContent=mistakes+'/2';$('score').textContent=score;
 $('progress').style.width=(level/50*100)+'%';
}
function newLevel(){current=makeCase(level);mistakes=0;selected=-1;render()}
function start(){level=1;score=0;running=true;$('start').classList.add('hide');$('result').classList.add('hide');newLevel()}
function accuse(){
 if(!running)return;
 if(selected<0)return showResult(false,'Belum memilih tersangka.','Pilih salah satu tersangka terlebih dahulu.');
 if(current.suspects[selected].truth){
  score+=100+Math.max(0,2-mistakes)*25;
  if(level>=50){running=false;showResult(true,'🏆 50 KASUS SELESAI!','Kamu berhasil menyelesaikan seluruh kasus Murder Mystery dengan skor '+score+'.');$('nextBtn').textContent='MAIN LAGI';$('nextBtn').onclick=start;return}
  showResult(true,'🎉 Kasus Terpecahkan!',\`Tersangka yang kamu pilih benar. +\${100+Math.max(0,2-mistakes)*25} poin.\`);
 }else{
  mistakes++;
  if(mistakes>=2){running=false;showResult(false,'❌ Penyidikan Gagal',\`Dua tuduhanmu salah. Jawaban sebenarnya adalah \${current.suspects[current.suspects.findIndex(s=>s.truth)].name}.\`);$('nextBtn').textContent='ULANG LEVEL';$('nextBtn').onclick=()=>{running=true;$('result').classList.add('hide');newLevel()};}
  else {showResult(false,'Belum tepat','Petunjuk belum cocok. Kamu masih punya satu kesempatan.');$('nextBtn').textContent='LANJUTKAN';$('nextBtn').onclick=()=>{$('result').classList.add('hide');render()};}
 }
}
function showResult(ok,title,text){$('resultEmoji').textContent=ok?'🎉':'🕵️';$('resultTitle').className=ok?'success':'fail';$('resultTitle').textContent=title;$('resultText').textContent=text;$('result').classList.remove('hide');$('nextBtn').onclick=()=>{if(ok){level++;$('result').classList.add('hide');newLevel()}else{$('result').classList.add('hide');render()}};$('nextBtn').textContent=ok?'KASUS BERIKUTNYA':'LANJUTKAN'}
$('startBtn').onclick=start;$('accuse').onclick=accuse;$('reset').onclick=()=>{if(running)newLevel()};
current=makeCase(1);render();
</script>
</body>
</html>
`
  })
  ,richplane: Object.freeze({
    title: 'Rimuru Plane Rush',
    html: `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Plane Rush</title>
<style>
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}html,body{margin:0;min-height:100%;background:#07111f;color:#eef7ff;font-family:system-ui,Arial,sans-serif;overflow:hidden;touch-action:manipulation}body{display:flex;justify-content:center;align-items:center;padding:8px}.app{width:min(100%,440px);border:1px solid #29445b;border-radius:22px;background:linear-gradient(180deg,#10283b,#091522);padding:12px;box-shadow:0 18px 55px #0009}.head{display:flex;justify-content:space-between;align-items:center;padding:3px 2px 10px}.logo{font-size:19px;font-weight:950;letter-spacing:.5px}.stats{display:flex;gap:8px;font-size:12px;font-weight:850;color:#a8e6ff}.pill{padding:7px 9px;border-radius:10px;background:#17384d}.stage{position:relative;overflow:hidden;border-radius:14px;border:1px solid #285b76;background:#081526}canvas{display:block;width:100%;height:auto;touch-action:none}.overlay{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:22px;background:#06101bcc}.overlay h1{font-size:31px;line-height:1.05;margin:0 0 10px}.overlay p{line-height:1.5;color:#c0d9e9;margin:0 0 18px;max-width:270px;font-size:14px}.btn{border:0;background:linear-gradient(135deg,#12c2e9,#3a86ff);border-radius:13px;padding:13px 20px;color:#031321;font-size:15px;font-weight:950;min-width:160px}.hidden{display:none!important}.controls{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px}.ctrl{border:1px solid #254a63;border-radius:13px;padding:13px 6px;background:#102d43;color:#dff7ff;font-size:14px;font-weight:900;touch-action:none}.hint{text-align:center;color:#7899b0;font-size:11px;padding-top:9px}
</style>
</head>
<body><main class="app">
<div class="head"><div class="logo">✈️ PLANE RUSH</div><div class="stats"><span class="pill" id="score">SCORE 0</span><span class="pill" id="best">BEST 0</span></div></div>
<div class="stage"><canvas id="game" width="390" height="560"></canvas><section class="overlay" id="overlay"><h1>Sky Rush</h1><p>Terbang melewati rintangan, ambil bintang, dan bertahan selama mungkin.</p><button class="btn" id="start">MULAI TERBANG</button></section></div>
<div class="controls"><button class="ctrl" id="left">◀ KIRI</button><button class="ctrl" id="up">▲ NAIK</button><button class="ctrl" id="right">KANAN ▶</button></div><div class="hint">Sentuh tombol atau geser pesawat · Hindari balok merah</div>
</main>
<script>
(function(){
const c=document.getElementById('game'),x=c.getContext('2d'),overlay=document.getElementById('overlay');
const scoreEl=document.getElementById('score'),bestEl=document.getElementById('best');
let plane,obstacles,stars,score,best=0,running=false,over=false,frame=0,keys={left:false,right:false,up:false},touchX=null,touchY=null;
try{best=Number(localStorage.getItem('rimuru-plane-best')||0)}catch(e){}bestEl.textContent='BEST '+best;
function reset(){plane={x:195,y:445,vx:0,vy:0};obstacles=[];stars=[];score=0;frame=0;running=true;over=false;overlay.classList.add('hidden');scoreEl.textContent='SCORE 0';loop()}
function rect(x0,y0,w,h,col){x.fillStyle=col;x.fillRect(x0,y0,w,h)}
function spawn(){const gap=84+Math.random()*48,center=36+Math.random()*(c.width-72);obstacles.push({x:0,y:-30,w:center-gap/2,h:22});obstacles.push({x:center+gap/2,y:-30,w:c.width-(center+gap/2),h:22});if(Math.random()<.8)stars.push({x:center,y:-50,r:8})}
function drawBg(){const g=x.createLinearGradient(0,0,0,c.height);g.addColorStop(0,'#123e5b');g.addColorStop(1,'#061322');x.fillStyle=g;x.fillRect(0,0,c.width,c.height);for(let i=0;i<48;i++){const sx=(i*83+frame*.7)%c.width,sy=(i*47+frame*2)%c.height;rect(sx,sy,2,2,'rgba(205,239,255,.45)')}}
function drawPlane(){x.save();x.translate(plane.x,plane.y);x.rotate(Math.max(-.3,Math.min(.3,plane.vx*.035)));x.fillStyle='#e8f8ff';x.beginPath();x.moveTo(0,-23);x.lineTo(11,8);x.lineTo(4,6);x.lineTo(0,15);x.lineTo(-4,6);x.lineTo(-11,8);x.closePath();x.fill();x.fillStyle='#19c8f5';x.beginPath();x.moveTo(-5,3);x.lineTo(-23,14);x.lineTo(-7,13);x.closePath();x.fill();x.beginPath();x.moveTo(5,3);x.lineTo(23,14);x.lineTo(7,13);x.closePath();x.fill();x.fillStyle='#ffcf5a';x.beginPath();x.moveTo(-4,19);x.lineTo(0,29+Math.random()*6);x.lineTo(4,19);x.fill();x.restore()}
function collide(a,b){return a.x-a.w/2<b.x+b.w&&a.x+a.w/2>b.x&&a.y-a.h/2<b.y+b.h&&a.y+a.h/2>b.y}
function end(){running=false;over=true;overlay.classList.remove('hidden');overlay.querySelector('h1').textContent='PENERBANGAN SELESAI';overlay.querySelector('p').textContent='Skor '+score+' · Coba lagi untuk mengalahkan rekor terbaikmu.';overlay.querySelector('button').textContent='MAIN LAGI'}
function loop(){if(!running)return;frame++;if(frame%43===0)spawn();plane.vx+=(keys.left?-0.62:0)+(keys.right?0.62:0);plane.vx*=.87;plane.vy+=(keys.up?-.33:.19);plane.vy=Math.max(-4,Math.min(4,plane.vy));plane.x+=plane.vx;plane.y+=plane.vy;plane.x=Math.max(17,Math.min(c.width-17,plane.x));plane.y=Math.max(26,Math.min(c.height-25,plane.y));obstacles.forEach(o=>o.y+=3.4+Math.min(score*.025,3));stars.forEach(s=>s.y+=3.4+Math.min(score*.025,3));obstacles=obstacles.filter(o=>o.y<c.height+40);stars=stars.filter(s=>s.y<c.height+20);
for(const o of obstacles){if(collide({x:plane.x,y:plane.y,w:18,h:23},o)){end();break}}
for(let i=stars.length-1;i>=0;i--){const s=stars[i];if(Math.hypot(plane.x-s.x,plane.y-s.y)<23){score+=25;stars.splice(i,1)}}score+=0.08;scoreEl.textContent='SCORE '+Math.floor(score);
drawBg();obstacles.forEach(o=>{x.shadowColor='#ff4365';x.shadowBlur=10;rect(o.x,o.y,o.w,o.h,'#ff526f');x.shadowBlur=0});stars.forEach(s=>{x.fillStyle='#ffd86b';x.shadowColor='#ffd86b';x.shadowBlur=14;x.beginPath();x.arc(s.x,s.y,s.r,0,Math.PI*2);x.fill();x.shadowBlur=0});drawPlane();if(running)requestAnimationFrame(loop);else{score=Math.floor(score);if(score>best){best=score;bestEl.textContent='BEST '+best;try{localStorage.setItem('rimuru-plane-best',String(best))}catch(e){}}overlay.querySelector('p').textContent='Skor '+score+' · Rekor '+best+'. Coba lagi untuk terbang lebih jauh.'}}
function bind(id,key){const b=document.getElementById(id),on=e=>{e.preventDefault();keys[key]=true},off=e=>{e.preventDefault();keys[key]=false};b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off)}
bind('left','left');bind('right','right');bind('up','up');document.getElementById('start').addEventListener('click',reset);
c.addEventListener('pointerdown',e=>{touchX=e.clientX;touchY=e.clientY});c.addEventListener('pointermove',e=>{if(touchX===null||touchY===null||!running)return;const dx=e.clientX-touchX,dy=e.clientY-touchY;plane.x+=dx*1.1;plane.y+=dy*1.1;touchX=e.clientX;touchY=e.clientY});const stop=()=>{touchX=null;touchY=null};c.addEventListener('pointerup',stop);c.addEventListener('pointercancel',stop);
window.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')keys.left=true;if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')keys.right=true;if(e.key==='ArrowUp'||e.key.toLowerCase()==='w'||e.key===' ')keys.up=true});window.addEventListener('keyup',e=>{if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')keys.left=false;if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')keys.right=false;if(e.key==='ArrowUp'||e.key.toLowerCase()==='w'||e.key===' ')keys.up=false});
function idle(){drawBg();drawPlane();}idle();
})();
</script></body></html>`
  })

});

async function sendExtraRichGame(sock, chat, command) {
  const game = EXTRA_RICH_GAMES[command];
  if (!game) throw new Error(`Game Rich tidak dikenal: ${command}`);
  if (!sock || typeof sock.relayMessage !== 'function') {
    throw new Error('Koneksi WhatsApp belum siap untuk mengirim Rich message.');
  }
  const responseId = crypto.randomUUID();
  const message = {
    messageContextInfo: {
      deviceListMetadata: {},
      deviceListMetadataVersion: 2,
      botMetadata: {
        messageDisclaimerText: '',
        botResponseId: responseId
      }
    },
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          messageType: 1,
          submessages: [{ messageType: 2, messageText: game.title }],
          unifiedResponse: {
            data: Buffer.from(JSON.stringify({
              response_id: responseId,
              sections: [{
                view_model: {
                  primitive: {
                    __typename: 'GenAIaeacdsnwHtmlPrimitive',
                    payload: game.html,
                    trusted_sources: []
                  },
                  __typename: 'GenAISingleLayoutViewModel'
                }
              }]
            })).toString('base64')
          },
          contextInfo: {
            stanzaId: responseId,
            forwardingScore: 1,
            isForwarded: true,
            forwardedAiBotMessageInfo: { botJid: '867051314767696@bot' },
            forwardOrigin: 4
          }
        }
      }
    }
  };
  await sock.relayMessage(chat, message, { messageId: responseId });
}

const pluginConfig = {
  name: ["nixelgames", "richquiz", "richpong", "richaim", "aim", "richplatformer", "platformer", "jump", "richspaceshooter", "spacegame", "richmurder", "richplane"],
  alias: ["nixel", "nixelgame", "minigames"],
  category: "rich",
  description: "Game Hub Rich Rimuru MD dengan Dino Runner, Tic Tac Toe, Doom, Quiz, Pong, Aim Shooter, Platformer, Space Shooter, Murder Mystery, dan Plane Rush",
  usage: ".nixelgames",
  example: ".nixelgames",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 2,
  energi: 0,
  isEnabled: true
};

const EXTRA_RICH_GAME_ALIASES = Object.freeze({
  aim: "richaim",
  platformer: "richplatformer",
  jump: "richplatformer",
  spacegame: "richspaceshooter"
});

async function handler(m, { sock }) {
  try {
    const requestedCommand = String(m.command || "").trim().toLowerCase();
    const command = EXTRA_RICH_GAME_ALIASES[requestedCommand] || requestedCommand;
    if (Object.prototype.hasOwnProperty.call(EXTRA_RICH_GAMES, command)) {
      await sendExtraRichGame(sock, m.chat, command);
      return;
    }
    await sock.relayMessage(
      m.chat,
{
  messageContextInfo: {
   deviceListMetadata: {},
   deviceListMetadataVersion: 2,
   botMetadata: {
    messageDisclaimerText: '',
    botResponseId: 'f090cd0f-bad1-4a4a-b0c3-b8f8e852c197',
    verificationMetadata: {
     proofs: [
      {
       version: 1,
       useCase: 1,
       signature: 'TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LVZlcmlmaWNhdGlvblNpZ25hdHVyZS5NZXRhZGF0YY28GDo8OXSlgg==',
       certificateChain: [
        'TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGE663ESCbLizCieg4wPebEFhVgH2dAgtZ8ajRuM4EY9p4BB4ay1X8InJh4KPu2GGhxlhPifhj3TFWzDND9OoPAx9ngvHgJ7qW+qq4UWIO3BxUoSc1UlkrSRYrDad3Oddz6dbHJqguhpE4JQ9nTyVT3lFWnuMg2oBEXG2mkdFR1fOnKG03454VeAGFLQfQMoAlq7AfmTFVXn45X8kMduwwCFuSE3sIF8uAMhP5Ng1Rn+mMmGZfne5RsyCa4wuHhv9p5KVKgnP8NXF6Sv6kAx5Dcer/qxZRaofRXTp7kSenmU+HU1w9KQfsEpHdbsfoRXKsscYm2KYl45U+FaFWbdaM1SXso3kE7SmMbNNCoJyX1ra8qoCXn940lJ3NjAb/7V6FjV7kHXXQycABxEtM7f3XaWzBMAnHMv43vTYv0g14snH90OpBPAJoOqA9Fhd+7636dOAT1pEQfCaghq/oSE2+/c0pbXK20WxtrzJnGRO6Kiy3R9KWMiPlbQu5Npoiu25PMFqujhoZiteQY3EoQnxLCHWZuV7ozseUrnfCbSGuzIvvd2iwx3z7k2Vlh5+vuiM9/j6/tstk5KG0AhP/G4aOAnbQfnowH1jpCC51Onnoz9eXDBwYOmA/QCiLgIL9PcJUoMPERaX0bp3Oy5q77VNVzFhIWFWVukfWn7uNmZgKFqfPzLAiy5nBEwfSrf23tmXxjbF0131XO1KbraDB0TVktoWMF45Y2U81rB4yD7WR+MFxMRaA3EF+jC6i/+giHnUHRhb3F4BF3derq03u1EmegX6dnt43U5dnSZmJb9pmQslhBaFlWJqRK82gqfdRtT5r4Q/wamUUgrIGjS',
        'TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGFOvdeboN7QHpWcPzdiI0ToTcoQmXrfuUIXi8v7akW/tOniN+d81uRd3SAcEEBKYyU3FCvolzcQCSd/P1+7jc8AwUqwp7OE0QpcJmqTO7EBLHQHx5B2gEZN0+ELrpuGdG3pQRVs7UB0bhTChnGR3asNYE6akIIrcMBKLaH0A+RjpJ0cOMh4Im9ZysfMWlFkng2Q0rmbBjxmxt/uY2hMDC6FAT6Agty8fSMQZAqU1KgbDpe/0kHA1p0U04N2t7xgi/zCsrPIHrq3YSKn1pYAmUeT+F/CK5Wz2SsEN7DicSMzHsK5XMJ0sWFp4ICrmSp+n5dhzrW/rt2ZB6sEyX4ll1z0dRuApMLNV4+j96Ir+0FzQ1QwNzMDHdQMSYXJulErBjjuK7j6BPG3lGd6yaGIZbfkZmL4ohq/thIIFP99JsUppkox0ENCmXkcwYfvTw8Ob+fv5VeTycFXUIufKV/Sc16Yf4bi5Hlr1U/zQRb/T86KHxUBBYuDW4F0PbrOZUGKaWKoWlHG2ZLTxLYomYbS/K7EyF6zjeLLioB/kQOtqD1K8R5u4tl7WnauJLV6jANHFWRflWdoBTETbgVE2Jew46vvQlk6VQKlava48yGAjZWvjkGCsZWUSu5azahZh9FbNbc/Z/cbY7++g2xxpTFywh698xyGsO4WSEIT9zWv3+esKut+/1BTu/hVZReQnU9NaJSeMpysUZmWmVM0FNQPPNrfYrj6p25MtyfjVT/AtCgEhNrin5q8unHgfDRUpi7WffTH3NFVVHcfOrc99/wHfAHUtAEFTdzjHSwJ+AODaXf/zbAnGXHqKgtcnesf+UhbPBK6HYX0T95EgGOUzwNPujmKUrcKNDFeCksP2QXSZiT1J03T/sGgIBABuuu6UoA1l8Id7qOtDl9umuZVsxFoXfVEzOR702oL3fwCCWJr8U9UJ6aUHa4o/lXP/zFoC4rV9DFvntb5HfPDL2taOmYocN1iI3l9rl4S+Pvoo8iFjRrwJAikIgZ+pbX137sfKdETrgw0QuW+khRtsj6Q90s3vmI/bxRNASxBKws92R/JCSZUenpRtSUrRoY9mvFlq7qsbAWkGA09lzFCVB/sK/kXJLBGgx+298TvhBYyOw==',
       ],
      },
     ],
    },
   },
  },
  botForwardedMessage: {
   message: {
    richResponseMessage: {
     messageType: 1,
     submessages: [
      {
       messageType: 2,
       messageText: 'Nixel Games • Fitur By: Anita Putri Azzahra',
      },
     ],
     unifiedResponse: {
      data: Buffer.from(
       JSON.stringify({
        response_id: '183d0aee-fb35-4349-8bc5-7793b11859db',
        sections: [
         {
          view_model: {
           primitive: {
            text: '> popioo',
            __typename: 'GenAIMarkdownTextUXPrimitive',
           },
           __typename: 'GenAISingleLayoutViewModel',
          },
         }
        ],
        embedded_screens: [
         {
          title: 'Preview',
          content: [
           {
            __typename: 'FOAIDNixelButtonSheets',
            tabs: [
             {
              id: 'tab_0',
              tab_header: 'Dino Runner',
              sections: [
               {
                __typename: 'GenAIUnifiedResponseSection',
                view_model: {
                 __typename: 'GenAISingleLayoutViewModel',
                 primitive: {
                  __typename: 'GenAIaeacdsnwHtmlPrimitive',
                  payload:
                   "<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n<div style=\"width:100%;max-width:620px;margin:auto;padding:16px;box-sizing:border-box\">\n<div style=\"background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<div style=\"padding:18px 20px;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center\">\n<div><div style=\"font-size:11px;letter-spacing:1.5px;color:rgba(255,255,255,.45)\">NIXEL DINO</div><div style=\"font-size:21px;font-weight:bold;color:#fff\">Dino Runner</div></div>\n<div style=\"text-align:right\"><div id=\"score\" style=\"font-size:18px;font-weight:bold;color:#fff;text-shadow:0 0 10px rgba(108,92,231,.85);transition:transform .15s\">00000</div><div id=\"best\" style=\"font-size:10px;color:rgba(255,255,255,.4);margin-top:2px\">BEST 00000</div></div>\n</div>\n<div style=\"padding:18px\">\n<canvas id=\"game\" width=\"560\" height=\"190\" style=\"width:100%;height:auto;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.12);border-radius:12px;display:block\"></canvas>\n<div id=\"status\" style=\"text-align:center;margin-top:10px;font-size:12px;color:rgba(255,255,255,.55)\">Speed 5.0x</div>\n</div></div></div>\n<script>\nconst c=document.getElementById('game'),x=c.getContext('2d'),scoreEl=document.getElementById('score'),bestEl=document.getElementById('best'),statusEl=document.getElementById('status');\nconst GY=170;\nlet d,o,clouds,particles,ambient,trail,score,best=0,speed,gameOver,last,shake,flash,runT,spawnTimer,milestone,squash;\nfunction loadBest(){\nlet vals=[];\ntry{let v=localStorage.getItem('dino_best');if(v)vals.push(parseInt(v,10))}catch(e){}\ntry{let v=sessionStorage.getItem('dino_best');if(v)vals.push(parseInt(v,10))}catch(e){}\ntry{let m=document.cookie.match(/(?:^|;\\s*)dino_best=(\\d+)/);if(m)vals.push(parseInt(m[1],10))}catch(e){}\nreturn vals.length?Math.max(...vals.filter(v=>!isNaN(v))):0\n}\nfunction saveBest(v){\nlet val=String(Math.floor(v));\ntry{localStorage.setItem('dino_best',val)}catch(e){}\ntry{sessionStorage.setItem('dino_best',val)}catch(e){}\ntry{document.cookie='dino_best='+val+';max-age=31536000;path=/'}catch(e){}\ntry{\nlet rq=indexedDB.open('dino_db',1);\nrq.onupgradeneeded=()=>{rq.result.createObjectStore('kv')};\nrq.onsuccess=()=>{try{rq.result.transaction('kv','readwrite').objectStore('kv').put(val,'dino_best')}catch(e){}}\n}catch(e){}\n}\nfunction loadBestAsync(cb){\ntry{\nlet rq=indexedDB.open('dino_db',1);\nrq.onupgradeneeded=()=>{rq.result.createObjectStore('kv')};\nrq.onsuccess=()=>{\ntry{\nlet gr=rq.result.transaction('kv','readonly').objectStore('kv').get('dino_best');\ngr.onsuccess=()=>{if(gr.result)cb(parseInt(gr.result,10))}\n}catch(e){}\n}\n}catch(e){}\n}\nbest=loadBest();\nloadBestAsync(v=>{if(!isNaN(v)&&v>best){best=v;bestEl.textContent='BEST '+String(Math.floor(best)).padStart(5,'0')}});\nfunction reset(){\nd={x:55,y:132,w:27,h:30,vy:0,jumping:false};\no=[];\nclouds=[{x:120,y:32,w:44,s:.35},{x:300,y:52,w:60,s:.22},{x:460,y:26,w:36,s:.4},{x:560,y:70,w:50,s:.18}];\nparticles=[];\ntrail=[];\nif(!ambient){ambient=[];for(let i=0;i<18;i++)ambient.push({x:Math.random()*c.width,y:Math.random()*c.height,r:.5+Math.random()*1.5,vx:.1+Math.random()*.3,ph:Math.random()*10})}\nscore=0;speed=5;gameOver=false;last=0;shake=0;flash=0;runT=0;milestone=0;squash=1;\nspawnTimer=70+Math.random()*30;\nbestEl.textContent='BEST '+String(Math.floor(best)).padStart(5,'0');\nstatusEl.textContent='Speed 5.0x'\n}\nfunction burst(px,py,n,col,spd){for(let i=0;i<n;i++)particles.push({x:px,y:py,vx:(Math.random()-.5)*spd,vy:-Math.random()*spd,life:1,col,size:2+Math.random()*2})}\nfunction jumpDino(){\nif(gameOver){reset();return}\nif(!d.jumping){d.jumping=true;d.vy=-13;squash=.7;burst(d.x+13,d.y+30,10,'255,255,255',4)}\n}\nfunction cactus(){\nlet h=24+Math.random()*24;\no.push({x:c.width+20,y:GY-h,w:16+Math.random()*6,h});\nif(Math.random()<.22){o.push({x:c.width+20+34+Math.random()*10,y:GY-(20+Math.random()*18),w:16,h:20+Math.random()*18})}\n}\nfunction hit(a,b){return a.x+4<b.x+b.w&&a.x+a.w-4>b.x&&a.y+4<b.y+b.h&&a.y+a.h>b.y}\nfunction drawTrail(){\ntrail.forEach((p,i)=>{x.fillStyle='rgba(108,92,231,'+(.25*(i/trail.length))+')';x.fillRect(p.x,p.y,27,30)})\n}\nfunction drawDino(){\nx.save();\nlet cx=d.x+13,cy=d.y+30;\nx.translate(cx,cy);\nx.scale(1/squash,squash);\nx.translate(-cx,-cy);\nlet legOff=d.jumping?0:Math.sin(runT*.5)*5;\nx.fillStyle='#eaeaea';\nx.fillRect(d.x,d.y,27,30);\nx.fillRect(d.x+22,d.y+5,13,18);\nx.fillStyle='#6c5ce7';\nx.fillRect(d.x+29,d.y+8,4,4);\nx.fillStyle='#eaeaea';\nx.fillRect(d.x+5,d.y+30,6,8+legOff);\nx.fillRect(d.x+20,d.y+30,6,8-legOff);\nx.restore()\n}\nfunction drawCactus(q){\nx.save();\nx.shadowColor='rgba(255,90,90,.35)';x.shadowBlur=10;\nx.fillStyle='#e17a7a';\nx.fillRect(q.x,q.y,q.w,q.h);\nx.fillRect(q.x-7,q.y+10,7,6);\nx.fillRect(q.x-7,q.y+4,6,12);\nx.fillRect(q.x+q.w,q.y+18,7,6);\nx.fillRect(q.x+q.w+1,q.y+12,6,12);\nx.restore()\n}\nfunction drawParticles(){\nparticles.forEach(p=>{x.fillStyle='rgba('+p.col+','+Math.max(p.life,0)+')';x.fillRect(p.x,p.y,p.size,p.size)})\n}\nfunction drawAmbient(){\nambient.forEach(p=>{let a=.15+Math.sin(runT*.05+p.ph)*.1;x.fillStyle='rgba(180,160,255,'+a+')';x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fill()})\n}\nfunction draw(){\nx.clearRect(0,0,c.width,c.height);\nx.save();\nif(shake>0)x.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);\ndrawAmbient();\nx.fillStyle='rgba(255,255,255,.35)';\nclouds.forEach(q=>{let b=Math.sin(runT*.03+q.x)*2;x.fillRect(q.x,q.y+b,q.w,5);x.fillRect(q.x+10,q.y+b-5,q.w*.45,10)});\nx.strokeStyle='rgba(255,255,255,.25)';\nx.lineWidth=2;\nx.setLineDash([10,8]);\nx.lineDashOffset=-runT*speed*.6;\nx.beginPath();x.moveTo(0,GY);x.lineTo(c.width,GY);x.stroke();\nx.setLineDash([]);\ndrawTrail();\ndrawDino();\no.forEach(drawCactus);\ndrawParticles();\nif(flash>0){x.fillStyle='rgba(255,60,60,'+(flash*.35)+')';x.fillRect(0,0,c.width,c.height)}\nx.restore();\nif(gameOver){\nx.fillStyle='rgba(15,15,25,.55)';x.fillRect(0,0,c.width,c.height);\nx.fillStyle='#fff';x.textAlign='center';\nx.font='bold 24px Arial';x.fillText('GAME OVER',c.width/2,85);\nx.font='14px Arial';x.fillText('Tap layar untuk main lagi',c.width/2,112);\nx.textAlign='left'\n}\n}\nfunction loop(t){\nif(!last)last=t;\nlet dt=Math.min((t-last)/16.67,2);\nlast=t;\nrunT+=dt;\nif(!gameOver){\nd.y+=d.vy*dt;d.vy+=.75*dt;\nif(d.y>=132){\nif(d.jumping){burst(d.x+13,GY,10,'255,255,255',3.5);squash=1.35}\nd.y=132;d.vy=0;d.jumping=false\n}\nif(d.jumping)trail.push({x:d.x,y:d.y});\nif(trail.length>6)trail.shift();\nif(!d.jumping)trail.length=0;\nsquash+=(1-squash)*.18*dt;\nif(!d.jumping&&Math.floor(runT)%8===0&&Math.random()<.4)burst(d.x+6,GY-2,1,'255,255,255',1.5);\nambient.forEach(p=>{p.x-=p.vx*dt;if(p.x<-4)p.x=c.width+4});\nspawnTimer-=dt;\nif(spawnTimer<=0){cactus();spawnTimer=Math.max(38,62-speed*1.4)+Math.random()*30}\no.forEach(q=>q.x-=speed*dt);\no=o.filter(q=>q.x>-40);\nclouds.forEach(q=>{q.x-=q.s*dt;if(q.x<-80)q.x=c.width+Math.random()*100});\nparticles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=.3*dt;p.life-=.03*dt});\nparticles=particles.filter(p=>p.life>0);\nspeed=Math.min(11,speed+.0018*dt);\nscore+=dt*.6;\nif(score>best)best=score;\nif(Math.floor(score/500)>milestone){\nmilestone=Math.floor(score/500);\nscoreEl.style.transform='scale(1.35)';\nsetTimeout(()=>scoreEl.style.transform='scale(1)',150)\n}\nscoreEl.textContent=String(Math.floor(score)).padStart(5,'0');\nbestEl.textContent='BEST '+String(Math.floor(best)).padStart(5,'0');\nstatusEl.textContent='Speed '+speed.toFixed(1)+'x';\nfor(const q of o)if(hit(d,q)){\ngameOver=true;shake=14;flash=1;\nsaveBest(best);\nburst(d.x+13,d.y+15,18,'255,90,90',5)\n}\n}\nif(shake>0)shake=Math.max(0,shake-.6*dt);\nif(flash>0)flash=Math.max(0,flash-.05*dt);\ndraw();\nrequestAnimationFrame(loop)\n}\ndocument.addEventListener('pointerdown',e=>{e.preventDefault();jumpDino()});\ndocument.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();jumpDino()}});\nreset();\nrequestAnimationFrame(loop);\n</script></body>",
                  url: 'https://nixel.dev',
                  trusted_sources: ['nixel.dev'],
                 },
                },
               },
              ],
              step_entries: [],
             },
             {
              id: 'tab_1',
              tab_header: 'Tic Tac Toe',
              sections: [
               {
                __typename: 'GenAIUnifiedResponseSection',
                view_model: {
                 __typename: 'GenAISingleLayoutViewModel',
                 primitive: {
                  __typename: 'GenAIaeacdsnwHtmlPrimitive',
                  payload:
                   "<!DOCTYPE html>\n<html lang=\"id\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<title>Tic-Tac-Toe â Dark</title>\n<style>\n:root{\n  --bg:transparent;\n  --card:transparent;\n  --card-2:#2a3942;\n  --ink:#e9edef;\n  --ink-soft:#aebac1;\n  --muted:#8696a0;\n  --accent:#00a884;\n  --accent-2:#008069;\n  --line:#2a3942;\n  --line-strong:#374248;\n  --cell-bg:#111b21;\n  --o:#00a884;\n  --x:#e9edef;\n  --sys:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;\n}\n*{margin:0;padding:0;box-sizing:border-box}\nhtml,body{\n  background:transparent;\n  color:var(--ink);\n  font-family:var(--sys);\n  min-height:100vh;\n  overflow-x:hidden;\n  -webkit-font-smoothing:antialiased;\n}\n\n.stage{\n  min-height:100vh;\n  display:flex;flex-direction:column;\n  align-items:center;justify-content:center;\n  /* Padding diperkecil agar hemat ruang vertikal */\n  padding:12px 16px;\n}\n\n.card{\n  width:100%;\n  /* Ukuran diperkecil dari 360px agar tidak menenggelamkan webview */\n  max-width:280px; \n}\n\n.header{\n  display:flex;align-items:baseline;justify-content:space-between;\n  /* Margin diperkecil sedikit */\n  margin-bottom:10px;padding-bottom:8px;\n  border-bottom:1px solid var(--line);\n  gap:8px;\n}\n.header__title{\n  font-size:17px;font-weight:600;\n  color:var(--ink);letter-spacing:-.005em;\n}\n.header__sub{font-size:12px;color:var(--muted)}\n\n.status{\n  display:flex;align-items:center;justify-content:space-between;\n  margin-bottom:10px;font-size:13px;gap:8px;\n}\n.status__turn{display:flex;align-items:center;gap:8px;color:var(--ink-soft)}\n.status__indicator{\n  width:9px;height:9px;border-radius:50%;\n  background:var(--x);\n  position:relative;flex-shrink:0;\n  transition:background .2s ease;\n}\n.status__indicator.is-o{background:var(--o)}\n.status__indicator.is-thinking::after{\n  content:'';position:absolute;inset:-3px;\n  border-radius:50%;border:1.5px solid var(--o);\n  animation:ring 1.1s ease-out infinite;\n}\n@keyframes ring{\n  0%{transform:scale(.7);opacity:1}\n  100%{transform:scale(2.2);opacity:0}\n}\n.status__score{\n  display:flex;gap:12px;\n  font-variant-numeric:tabular-nums;\n  color:var(--muted);font-size:12px;\n}\n.status__score b{\n  color:var(--ink);font-weight:600;margin-left:3px;\n}\n\n.board{\n  width:100%;aspect-ratio:1;\n  position:relative;\n  display:grid;\n  grid-template-columns:1fr 1fr 1fr;\n  grid-template-rows:1fr 1fr 1fr;\n  background:var(--cell-bg);\n  border-radius:8px;overflow:hidden;\n  border:1px solid var(--line);\n}\n.cell{\n  position:relative;background:transparent;border:none;\n  cursor:pointer;padding:0;\n  font-family:inherit;color:inherit;\n}\n.cell:disabled{cursor:default}\n.cell:focus-visible{outline:2px solid var(--accent);outline-offset:-3px}\n.cell::before{\n  content:'';position:absolute;right:0;top:6%;bottom:6%;\n  width:1px;background:var(--line-strong);\n}\n.cell:nth-child(3n)::before{display:none}\n.cell::after{\n  content:'';position:absolute;bottom:0;left:6%;right:6%;\n  height:1px;background:var(--line-strong);\n}\n.cell:nth-last-child(-n+3)::after{display:none}\n.cell.is-winning{background:rgba(0,168,132,0.14)}\n.cell.is-winning-x{background:rgba(233,237,239,0.07)}\n\n.mark{position:absolute;inset:22%;pointer-events:none}\n.mark__svg{width:100%;height:100%;overflow:visible}\n.mark__svg path,.mark__svg circle{\n  fill:none;stroke:var(--x);stroke-width:9;\n  stroke-linecap:round;\n}\n.mark--o .mark__svg path,.mark--o .mark__svg circle{stroke:var(--o)}\n.mark__svg path{\n  stroke-dasharray:120;stroke-dashoffset:120;\n  animation:draw .3s ease-out forwards;\n}\n.mark__svg path:nth-child(2){animation-delay:.12s}\n.mark__svg circle{\n  stroke-dasharray:220;stroke-dashoffset:220;\n  animation:draw .4s ease-out forwards;\n}\n@keyframes draw{to{stroke-dashoffset:0}}\n\n.winning-line{\n  position:absolute;height:4px;\n  background:var(--o);\n  transform-origin:left center;\n  z-index:5;pointer-events:none;\n  border-radius:2px;\n}\n.winning-line.is-x{background:var(--x)}\n\n.levels{margin-top:10px}\n.levels__label{\n  font-size:11px;color:var(--muted);\n  margin-bottom:6px;\n}\n.levels__list{\n  display:flex;\n  flex-wrap:nowrap;\n  gap:8px;\n  overflow-x:auto;\n  overflow-y:hidden;\n  -webkit-overflow-scrolling:touch;\n  scrollbar-width:none;\n  -ms-overflow-style:none;\n  padding:2px 2px 4px;\n  margin:0 -2px;\n}\n.levels__list::-webkit-scrollbar{\n  display:none;\n}\n.level{\n  background:transparent;\n  border:1px solid var(--line-strong);\n  border-radius:20px;\n  padding:8px 14px;\n  font-size:12px;font-weight:500;\n  color:var(--ink-soft);\n  cursor:pointer;\n  font-family:inherit;\n  transition:color .15s ease,border-color .15s ease,background .15s ease;\n  white-space:nowrap;\n  flex-shrink:0;\n}\n.level:hover{color:var(--ink);border-color:var(--ink-soft)}\n.level.is-active{\n  background:var(--accent);\n  border-color:var(--accent);\n  color:#0b141a;\n}\n.level:focus-visible{outline:2px solid var(--accent);outline-offset:1px}\n\n.footer{\n  margin-top:8px;\n  display:flex;justify-content:center;\n}\n.footer__reset{\n  background:none;border:none;\n  color:var(--accent);\n  font-family:inherit;\n  font-size:13px;font-weight:500;\n  cursor:pointer;\n  padding:8px 16px;\n  transition:color .15s ease;\n}\n.footer__reset:hover{color:var(--ink)}\n.footer__reset:focus-visible{outline:2px solid var(--accent);outline-offset:1px}\n\n/* modal â tanpa blur, tanpa gelap */\n.modal{\n  position:fixed;inset:0;z-index:50;\n  display:flex;align-items:center;justify-content:center;\n  padding:24px;\n  opacity:0;pointer-events:none;\n  transition:opacity .3s ease;\n}\n.modal.is-open{opacity:1;pointer-events:auto}\n.modal__backdrop{\n  position:absolute;inset:0;\n  background:transparent;\n}\n.modal__card{\n  position:relative;\n  background:var(--card-2);\n  border-radius:12px;\n  padding:24px 24px 0;\n  text-align:center;\n  max-width:300px;width:100%;\n  box-shadow:0 24px 50px -12px rgba(0,0,0,0.6);\n  transform:translateY(8px) scale(.96);\n  transition:transform .35s cubic-bezier(.34,1.56,.64,1);\n  overflow:hidden;\n}\n.modal.is-open .modal__card{transform:translateY(0) scale(1)}\n.modal__title{\n  font-size:20px;font-weight:700;\n  letter-spacing:-.015em;\n  color:var(--ink);margin-bottom:8px;line-height:1.25;\n}\n.modal__title.is-o{color:var(--o)}\n.modal__sub{\n  font-size:14px;color:var(--muted);\n  margin-bottom:20px;line-height:1.4;\n}\n.modal__retry{\n  background:transparent;border:none;\n  color:var(--accent);\n  font-family:inherit;\n  font-size:16px;font-weight:600;\n  letter-spacing:-.005em;\n  cursor:pointer;\n  padding:14px 24px;\n  width:100%;\n  border-top:1px solid var(--line-strong);\n  transition:color .15s ease;\n}\n.modal__retry:hover{color:var(--ink)}\n.modal__retry:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}\n\n@media (max-width:380px){\n  .stage{padding:12px 10px}\n  .level{padding:7px 12px;font-size:11px}\n  .modal__title{font-size:18px}\n}\n@media (prefers-reduced-motion:reduce){\n  *,*::before,*::after{\n    animation-duration:.01ms!important;\n    animation-iteration-count:1!important;\n    transition-duration:.01ms!important;\n  }\n}\n</style>\n</head>\n<body>\n<main class=\"stage\">\n  <div class=\"card\">\n    <div class=\"header\">\n      <div class=\"header__title\">Tic-Tac-Toe</div>\n      <div class=\"header__sub\">Melawan AI</div>\n    </div>\n\n    <div class=\"status\" aria-live=\"polite\">\n      <div class=\"status__turn\">\n        <span class=\"status__indicator\" id=\"indicator\"></span>\n        <span id=\"status-text\">Giliranmu</span>\n      </div>\n      <div class=\"status__score\">\n        <span>Kamu<b id=\"score-x\">0</b></span>\n        <span>Seri<b id=\"score-d\">0</b></span>\n        <span>AI<b id=\"score-o\">0</b></span>\n      </div>\n    </div>\n\n    <div class=\"board\" id=\"board\" role=\"grid\" aria-label=\"Papan permainan tiga kali tiga\"></div>\n\n    <div class=\"levels\">\n      <div class=\"levels__label\">Tingkat lawan</div>\n      <div class=\"levels__list\" id=\"levels-list\" role=\"radiogroup\" aria-label=\"Tingkat kesulitan\"></div>\n    </div>\n\n    <div class=\"footer\">\n      <button class=\"footer__reset\" id=\"reset\">Ulang papan</button>\n    </div>\n  </div>\n</main>\n\n<div class=\"modal\" id=\"modal\" hidden>\n  <div class=\"modal__backdrop\" id=\"modal-backdrop\"></div>\n  <div class=\"modal__card\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"modal-title\">\n    <h2 class=\"modal__title\" id=\"modal-title\">Kamu menang</h2>\n    <p class=\"modal__sub\" id=\"modal-sub\">Bagus sekali. Mau coba lagi?</p>\n    <button class=\"modal__retry\" id=\"modal-retry\">Coba lagi</button>\n  </div>\n</div>\n\n<script>\nconst state={\n  board:Array(9).fill(null),\n  human:'X',ai:'O',\n  turn:'X',\n  over:false,winner:null,line:null,\n  thinking:false,\n  level:2,\n  scores:{X:0,O:0,D:0}\n};\nconst LEVELS=[\n  {name:'Pemula'},\n  {name:'Terlatih'},\n  {name:'Taktisi'},\n  {name:'Master'}\n];\nconst WIN_LINES=[\n  [0,1,2],[3,4,5],[6,7,8],\n  [0,3,6],[1,4,7],[2,5,8],\n  [0,4,8],[2,4,6]\n];\n\nconst $=id=>document.getElementById(id);\nconst boardEl=$('board'),statusText=$('status-text'),indicator=$('indicator');\nconst levelsList=$('levels-list');\nconst scoreX=$('score-x'),scoreO=$('score-o'),scoreD=$('score-d');\nconst modal=$('modal');\n\nfunction buildBoard(){\n  boardEl.innerHTML='';\n  for(let i=0;i<9;i++){\n    const c=document.createElement('button');\n    c.className='cell';\n    c.setAttribute('role','gridcell');\n    c.setAttribute('aria-label',`Kotak ${i+1}`);\n    c.dataset.idx=i;\n    c.addEventListener('click',()=>onCell(i));\n    boardEl.appendChild(c);\n  }\n}\nfunction buildLevels(){\n  levelsList.innerHTML='';\n  LEVELS.forEach((lvl,i)=>{\n    const b=document.createElement('button');\n    b.className='level'+(i===state.level?' is-active':'');\n    b.setAttribute('role','radio');\n    b.setAttribute('aria-checked',i===state.level?'true':'false');\n    b.textContent=lvl.name;\n    b.addEventListener('click',()=>setLevel(i));\n    levelsList.appendChild(b);\n  });\n}\nfunction setLevel(i){\n  state.level=i;\n  document.querySelectorAll('.level').forEach((el,idx)=>{\n    const on=idx===i;\n    el.classList.toggle('is-active',on);\n    el.setAttribute('aria-checked',on?'true':'false');\n  });\n  resetBoard();\n}\nfunction markSVG(v){\n  if(v==='X'){\n    return `<svg class=\"mark__svg\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"xMidYMid meet\"><path d=\"M 22 22 L 78 78\"/><path d=\"M 78 22 L 22 78\"/></svg>`;\n  }\n  return `<svg class=\"mark__svg\" viewBox=\"0 0 100 100\" preserveAspectRatio=\"xMidYMid meet\"><circle cx=\"50\" cy=\"50\" r=\"30\"/></svg>`;\n}\nfunction renderCell(i){\n  const cell=boardEl.children[i];\n  const v=state.board[i];\n  const existing=cell.querySelector('.mark');\n  if(v){\n    if(!existing){\n      const m=document.createElement('div');\n      m.className='mark mark--'+v.toLowerCase();\n      m.innerHTML=markSVG(v);\n      cell.appendChild(m);\n    }\n    cell.disabled=true;\n  } else {\n    if(existing) existing.remove();\n    cell.disabled=state.over||state.thinking||state.turn!==state.human;\n  }\n  const isWin=!!(state.line&&state.line.includes(i));\n  cell.classList.toggle('is-winning',isWin);\n  cell.classList.toggle('is-winning-x',isWin&&state.winner==='X');\n}\nfunction render(){\n  for(let i=0;i<9;i++) renderCell(i);\n  if(state.over){\n    if(state.winner==='X'){statusText.textContent='Kamu menang';indicator.className='status__indicator';}\n    else if(state.winner==='O'){statusText.textContent='AI menang';indicator.className='status__indicator is-o';}\n    else {statusText.textContent='Seri';indicator.className='status__indicator';}\n  } else if(state.thinking){\n    statusText.textContent='AI berpikirâ¦';\n    indicator.className='status__indicator is-o is-thinking';\n  } else {\n    statusText.textContent=state.turn===state.human?'Giliranmu':'Giliran AI';\n    indicator.className='status__indicator'+(state.turn===state.ai?' is-o':'');\n  }\n  scoreX.textContent=state.scores.X;\n  scoreO.textContent=state.scores.O;\n  scoreD.textContent=state.scores.D;\n}\nfunction onCell(i){\n  if(state.over||state.thinking) return;\n  if(state.board[i]!==null) return;\n  if(state.turn!==state.human) return;\n  state.board[i]=state.human;\n  renderCell(i);\n  const r=checkWinner(state.board);\n  if(r){endGame(r);return;}\n  state.turn=state.ai;\n  state.thinking=true;\n  render();\n  setTimeout(aiMove,380+Math.random()*340);\n}\nfunction aiMove(){\n  if(!state.thinking) return;\n  const m=chooseAIMove();\n  if(m===null){state.thinking=false;render();return;}\n  state.board[m]=state.ai;\n  renderCell(m);\n  state.thinking=false;\n  const r=checkWinner(state.board);\n  if(r){endGame(r);}\n  else {state.turn=state.human;render();}\n}\nfunction chooseAIMove(){\n  const empty=state.board.map((v,i)=>v===null?i:-1).filter(i=>i>=0);\n  if(!empty.length) return null;\n  const L=state.level;\n  if(L===0) return empty[Math.floor(Math.random()*empty.length)];\n  if(L===1){\n    const win=findImmediate(state.board,state.ai);\n    if(win!==null) return win;\n    if(Math.random()>0.15){\n      const block=findImmediate(state.board,state.human);\n      if(block!==null) return block;\n    }\n    if(state.board[4]===null) return 4;\n    if(Math.random()>0.2){\n      const corners=[0,2,6,8].filter(i=>state.board[i]===null);\n      if(corners.length) return corners[Math.floor(Math.random()*corners.length)];\n    }\n    return empty[Math.floor(Math.random()*empty.length)];\n  }\n  if(L===2){\n    if(Math.random()<0.10) return empty[Math.floor(Math.random()*empty.length)];\n    return minimaxMove(state.board,state.ai,4);\n  }\n  return minimaxMove(state.board,state.ai,9);\n}\nfunction findImmediate(board,player){\n  for(const line of WIN_LINES){\n    const cells=[board[line[0]],board[line[1]],board[line[2]]];\n    const c=cells.filter(v=>v===player).length;\n    const e=cells.filter(v=>v===null).length;\n    if(c===2&&e===1) return line[cells.indexOf(null)];\n  }\n  return null;\n}\nfunction minimaxMove(board,player,maxDepth){\n  let best=-Infinity,moves=[];\n  for(let i=0;i<9;i++){\n    if(board[i]!==null) continue;\n    board[i]=player;\n    const s=minimax(board,player==='O'?'X':'O',0,maxDepth,-Infinity,Infinity);\n    board[i]=null;\n    if(s>best){best=s;moves=[i];}\n    else if(s===best){moves.push(i);}\n  }\n  return moves[Math.floor(Math.random()*moves.length)];\n}\nfunction minimax(board,current,depth,maxDepth,alpha,beta){\n  const r=checkWinner(board);\n  if(r){\n    if(r.winner==='O') return 10-depth;\n    if(r.winner==='X') return depth-10;\n    return 0;\n  }\n  if(depth>=maxDepth) return 0;\n  const isMax=current==='O';\n  let best=isMax?-Infinity:Infinity;\n  for(let i=0;i<9;i++){\n    if(board[i]!==null) continue;\n    board[i]=current;\n    const s=minimax(board,current==='O'?'X':'O',depth+1,maxDepth,alpha,beta);\n    board[i]=null;\n    if(isMax){best=Math.max(best,s);alpha=Math.max(alpha,s);}\n    else {best=Math.min(best,s);beta=Math.min(beta,s);}\n    if(beta<=alpha) break;\n  }\n  return best;\n}\nfunction checkWinner(board){\n  for(const line of WIN_LINES){\n    const [a,b,c]=line;\n    if(board[a]&&board[a]===board[b]&&board[a]===board[c]){\n      return {winner:board[a],line};\n    }\n  }\n  if(board.every(v=>v!==null)) return {winner:'D',line:null};\n  return null;\n}\nfunction endGame(r){\n  state.over=true;\n  state.winner=r.winner;\n  state.line=r.line;\n  if(r.winner==='X') state.scores.X++;\n  else if(r.winner==='O') state.scores.O++;\n  else state.scores.D++;\n  render();\n  if(r.line){\n    setTimeout(()=>drawWinningLine(r.line,r.winner),220);\n    setTimeout(()=>showModal(r.winner),950);\n  } else {\n    setTimeout(()=>showModal(r.winner),400);\n  }\n}\nfunction showModal(winner){\n  const title=$('modal-title');\n  const sub=$('modal-sub');\n  if(winner==='X'){\n    title.textContent='Kamu menang';\n    title.className='modal__title';\n    sub.textContent='Bagus sekali. Mau coba lagi?';\n  } else if(winner==='O'){\n    title.textContent='AI menang';\n    title.className='modal__title is-o';\n    sub.textContent='Kali ini lawan lebih baik. Ulangi?';\n  } else {\n    title.textContent='Seri';\n    title.className='modal__title';\n    sub.textContent='Imbang. Main sekali lagi?';\n  }\n  modal.hidden=false;\n  void modal.offsetWidth;\n  modal.classList.add('is-open');\n  setTimeout(()=>$('modal-retry').focus(),80);\n}\nfunction hideModal(){\n  modal.classList.remove('is-open');\n  setTimeout(()=>{modal.hidden=true;},350);\n}\nfunction drawWinningLine(line,winner){\n  const rect=boardEl.getBoundingClientRect();\n  const s=boardEl.children[line[0]].getBoundingClientRect();\n  const e=boardEl.children[line[2]].getBoundingClientRect();\n  const x1=s.left+s.width/2-rect.left;\n  const y1=s.top+s.height/2-rect.top;\n  const x2=e.left+e.width/2-rect.left;\n  const y2=e.top+e.height/2-rect.top;\n  const len=Math.hypot(x2-x1,y2-y1);\n  const ang=Math.atan2(y2-y1,x2-x1);\n  const el=document.createElement('div');\n  el.className='winning-line'+(winner==='X'?' is-x':'');\n  el.style.left=x1+'px';\n  el.style.top=y1+'px';\n  el.style.width=len+'px';\n  el.style.transform=`translateY(-50%) rotate(${ang}rad) scaleX(0)`;\n  el.style.transition='transform .55s cubic-bezier(0.65,0,0.35,1)';\n  boardEl.appendChild(el);\n  requestAnimationFrame(()=>requestAnimationFrame(()=>{\n    el.style.transform=`translateY(-50%) rotate(${ang}rad) scaleX(1)`;\n  }));\n}\nfunction resetBoard(){\n  hideModal();\n  state.board=Array(9).fill(null);\n  state.turn=state.human;\n  state.over=false;state.winner=null;state.line=null;\n  state.thinking=false;\n  const wl=boardEl.querySelector('.winning-line');\n  if(wl) wl.remove();\n  render();\n}\n\n $('reset').addEventListener('click',resetBoard);\n $('modal-retry').addEventListener('click',resetBoard);\n $('modal-backdrop').addEventListener('click',resetBoard);\ndocument.addEventListener('keydown',(e)=>{\n  if(!modal.classList.contains('is-open')) return;\n  if(e.key==='Escape'||e.key==='Enter'){e.preventDefault();resetBoard();}\n});\n\nbuildBoard();\nbuildLevels();\nrender();\n</script>\n</body>\n</html>",
                  url: 'https://nixel.dev',
                  trusted_sources: ['nixel.dev'],
                 },
                },
               },
              ],
              step_entries: [],
             },
             {
              id: 'tab_2',
              tab_header: 'Doom',
              sections: [
               {
                __typename: 'GenAIUnifiedResponseSection',
                view_model: {
                 __typename: 'GenAISingleLayoutViewModel',
                 primitive: {
                  __typename: 'GenAIaeacdsnwHtmlPrimitive',
                  payload:
                   "{<style>*{-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}</style>\n<body style=\"margin:0;background:transparent;font-family:Arial,sans-serif;color:#eee;touch-action:manipulation;cursor:pointer\">\n<div style=\"width:100%;max-width:620px;margin:auto;box-sizing:border-box\">\n<div style=\"position:relative;width:100%;aspect-ratio:16/9;background:rgba(255,255,255,.06);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.15);border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,.35)\">\n<canvas id=\"game\" width=\"480\" height=\"270\" style=\"position:absolute;inset:0;width:100%;height:100%;display:block;background:#000;touch-action:none\"></canvas>\n<div style=\"position:absolute;top:8px;left:12px;pointer-events:none;text-shadow:0 1px 4px rgba(0,0,0,.9)\">\n<div style=\"font-size:9px;letter-spacing:1.5px;color:rgba(255,255,255,.65)\">NIXEL DOOM</div>\n<div style=\"font-size:14px;font-weight:bold;color:#fff\">Mini Doom FPS</div>\n</div>\n<div style=\"position:absolute;top:8px;right:12px;text-align:right;pointer-events:none;text-shadow:0 1px 4px rgba(0,0,0,.9)\">\n<div id=\"hp\" style=\"font-size:13px;font-weight:bold;color:#fff;transition:transform .15s\">HP 100</div>\n<div id=\"ammo\" style=\"font-size:9px;color:rgba(255,255,255,.75);margin-top:1px\">AMMO 30 · SCORE 0</div>\n</div>\n<div id=\"status\" style=\"position:absolute;bottom:6px;left:0;right:0;text-align:center;font-size:9px;color:rgba(255,255,255,.75);pointer-events:none;text-shadow:0 1px 4px rgba(0,0,0,.9)\">5 musuh tersisa</div>\n<div style=\"position:absolute;bottom:6px;left:6px;display:flex;gap:5px\">\n<button id=\"forward\" style=\"width:44px;height:32px;border:1px solid rgba(255,255,255,.3);border-radius:8px;background:rgba(0,0,0,.4);color:#fff;font-size:14px;padding:0\">▲</button>\n</div>\n<div style=\"position:absolute;bottom:6px;right:6px;display:grid;grid-template-columns:repeat(3,32px);gap:5px\">\n<button id=\"strafeL\" style=\"width:32px;height:32px;border:1px solid rgba(255,255,255,.3);border-radius:8px;background:rgba(0,0,0,.4);color:#fff;font-size:13px;padding:0\">◀</button>\n<button id=\"fire\" style=\"width:32px;height:32px;border:1px solid rgba(230,60,60,.5);border-radius:8px;background:rgba(230,60,60,.35);color:#fff;font-size:13px;padding:0\">🔥</button>\n<button id=\"strafeR\" style=\"width:32px;height:32px;border:1px solid rgba(255,255,255,.3);border-radius:8px;background:rgba(0,0,0,.4);color:#fff;font-size:13px;padding:0\">▶</button>\n</div>\n</div></div>\n<script>\nconst c=document.getElementById('game'),x=c.getContext('2d'),hpEl=document.getElementById('hp'),ammoEl=document.getElementById('ammo'),statusEl=document.getElementById('status');\nx.imageSmoothingEnabled=false;\nconst W=c.width,H=c.height;\nconst map=[\"################\",\"#..............#\",\"#..##....##....#\",\"#..#..........##\",\"#..#..####.....#\",\"#.....#........#\",\"###...#..####..#\",\"#.....#........#\",\"#..####........#\",\"#........####..#\",\"#........#.....#\",\"#..##....#.....#\",\"#..##..........#\",\"#..............#\",\"#..............#\",\"################\"];\nconst player={x:2.5,y:2.5,angle:0,hp:100,ammo:30,score:0,fireCooldown:0,muzzle:0,hurt:0};\nlet enemies,pickups,particles,ambient,shake,bobT,runT,endT,gameOver,win;\nconst keys=Object.create(null);\nconst FOV=Math.PI/3,MOVE=.052;\nlet zBuffer=new Float32Array(W);\nfunction initEnemies(){return [{x:11.5,y:2.5,hp:60,max:60,dead:false,flash:0},{x:7.5,y:5.5,hp:60,max:60,dead:false,flash:0},{x:13.5,y:8.5,hp:60,max:60,dead:false,flash:0},{x:5.5,y:10.5,hp:60,max:60,dead:false,flash:0},{x:11.5,y:12.5,hp:60,max:60,dead:false,flash:0}]}\nfunction initPickups(){return [{x:4.5,y:1.5,type:\"ammo\",taken:false},{x:14.5,y:5.5,type:\"health\",taken:false},{x:3.5,y:13.5,type:\"ammo\",taken:false}]}\nfunction reset(){\nplayer.x=2.5;player.y=2.5;player.angle=0;player.hp=100;player.ammo=30;player.score=0;player.fireCooldown=0;player.muzzle=0;player.hurt=0;\nenemies=initEnemies();pickups=initPickups();particles=[];\nif(!ambient){ambient=[];for(let i=0;i<16;i++)ambient.push({x:Math.random()*W,y:Math.random()*H,r:.6+Math.random()*1.2,vx:.15+Math.random()*.25,ph:Math.random()*10})}\nshake=0;bobT=0;runT=0;endT=0;gameOver=false;win=false\n}\nfunction burst(px,py,n,col,spd,grav){for(let i=0;i<n;i++)particles.push({x:px,y:py,vx:(Math.random()-.5)*spd,vy:-Math.random()*spd,life:1,col,size:2+Math.random()*2.5,grav:grav||0})}\nfunction isWall(px,py){const mx=Math.floor(px),my=Math.floor(py);if(mx<0||my<0||my>=map.length||mx>=map[0].length)return true;return map[my][mx]===\"#\"}\nfunction canWalk(px,py){const r=.18;return !isWall(px-r,py-r)&&!isWall(px+r,py-r)&&!isWall(px-r,py+r)&&!isWall(px+r,py+r)}\nfunction move(dx,dy){const nx=player.x+dx,ny=player.y+dy;if(canWalk(nx,player.y))player.x=nx;if(canWalk(player.x,ny))player.y=ny}\nfunction normAngle(a){while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a}\nfunction dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}\nfunction lineClear(x1,y1,x2,y2){const d=Math.hypot(x2-x1,y2-y1),steps=Math.ceil(d/.08);for(let i=1;i<steps;i++){const t=i/steps,px=x1+(x2-x1)*t,py=y1+(y2-y1)*t;if(isWall(px,py))return false}return true}\nfunction castRay(a){const ca=Math.cos(a),sa=Math.sin(a);let d=0;while(d<30){d+=.025;if(isWall(player.x+ca*d,player.y+sa*d))break}return d}\nfunction screenPos(ex,ey){const dx=ex-player.x,dy=ey-player.y,d=Math.hypot(dx,dy);const a=normAngle(Math.atan2(dy,dx)-player.angle);const sx=W/2+Math.tan(a)*(W/2)/Math.tan(FOV/2);return {sx,d,a}}\nfunction shoot(){\nif(player.fireCooldown>0||player.ammo<=0||gameOver||win)return;\nplayer.fireCooldown=13;player.ammo--;player.muzzle=4;\nburst(W/2,H-88,7,'255,210,80',3,.1);\nlet best=null,bestDist=Infinity;\nfor(const e of enemies){\nif(e.dead)continue;\nconst {sx,d,a}=screenPos(e.x,e.y);\nif(d>10)continue;\nconst tol=.055+.16/d;\nif(Math.abs(a)<tol&&d<bestDist&&lineClear(player.x,player.y,e.x,e.y)){best=e;bestDist=d}\n}\nif(best){\nconst dmg=25+Math.floor(Math.random()*12);\nbest.hp-=dmg;best.flash=6;\nconst {sx,d}=screenPos(best.x,best.y);\nconst size=Math.min(H*1.8,H/d*.72);\nif(best.hp<=0){best.dead=true;player.score+=100;burst(sx,H/2,22,'220,40,40',4.5,.25)}\nelse{player.score+=10;burst(sx,H/2,10,'220,40,40',3.5,.2)}\n}\n}\nfunction updateEnemies(){\nfor(const e of enemies){\nif(e.dead)continue;\nif(e.flash>0)e.flash--;\nconst d=dist(player,e);\nif(d<1){\nplayer.hp-=.18;player.hurt=6;shake=Math.max(shake,4.5);\nconst a=Math.atan2(e.y-player.y,e.x-player.x);\nplayer.x-=Math.cos(a)*.015;player.y-=Math.sin(a)*.015;\ncontinue\n}\nif(d<7&&lineClear(e.x,e.y,player.x,player.y)){\nconst a=Math.atan2(player.y-e.y,player.x-e.x),spd=.0085;\nconst nx=e.x+Math.cos(a)*spd,ny=e.y+Math.sin(a)*spd;\nif(canWalk(nx,ny)){e.x=nx;e.y=ny}\nif(Math.random()<.006&&d<6){player.hp-=2.5;player.hurt=10;shake=Math.max(shake,3.5);}\n}\n}\n}\nfunction updatePickups(){\nfor(const p of pickups){\nif(p.taken)continue;\nif(Math.hypot(player.x-p.x,player.y-p.y)<.55){\np.taken=true;\nif(p.type===\"ammo\")player.ammo=Math.min(99,player.ammo+15);\nif(p.type===\"health\")player.hp=Math.min(100,player.hp+25)\n}\n}\n}\nfunction update(){\nrunT++;\nif(gameOver||win){endT++;return}\nif(player.fireCooldown>0)player.fireCooldown--;\nif(player.muzzle>0)player.muzzle--;\nif(player.hurt>0)player.hurt--;\nif(shake>0)shake=Math.max(0,shake-.6);\nlet dx=0,dy=0;\nconst moving=keys.forward||keys.strafeL||keys.strafeR;\nif(moving)bobT++;else bobT+=.15;\nif(keys.forward){dx+=Math.cos(player.angle)*MOVE;dy+=Math.sin(player.angle)*MOVE}\nif(keys.strafeL){dx+=Math.cos(player.angle-Math.PI/2)*MOVE;dy+=Math.sin(player.angle-Math.PI/2)*MOVE}\nif(keys.strafeR){dx+=Math.cos(player.angle+Math.PI/2)*MOVE;dy+=Math.sin(player.angle+Math.PI/2)*MOVE}\nmove(dx,dy);\nupdateEnemies();updatePickups();\nif(keys.fire)shoot();\nparticles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=p.grav;p.life-=.035});\nparticles=particles.filter(p=>p.life>0);\nambient.forEach(p=>{p.x-=p.vx;if(p.x<-4)p.x=W+4});\nif(enemies.filter(e=>!e.dead).length===0)win=true;\nif(player.hp<=0)gameOver=true\n}\nfunction wallColor(d,side){let l=230-d*18;if(side)l*=.76;l=Math.max(25,Math.min(220,l));return 'rgb('+Math.floor(l)+','+Math.floor(l*.62)+','+Math.floor(l*.48)+')'}\nfunction drawWalls(bob){\nconst half=H/2+bob,halfFov=FOV/2;\nconst sky=x.createLinearGradient(0,0,0,half);sky.addColorStop(0,'#12151a');sky.addColorStop(1,'#34302b');\nx.fillStyle=sky;x.fillRect(0,0,W,half);\nconst floor=x.createLinearGradient(0,half,0,H);floor.addColorStop(0,'#4a4540');floor.addColorStop(1,'#111');\nx.fillStyle=floor;x.fillRect(0,half,W,H-half);\nfor(let px=0;px<W;px++){\nconst a=player.angle-halfFov+(px/W)*FOV;\nlet raw=castRay(a);\nconst corrected=raw*Math.cos(a-player.angle);\nzBuffer[px]=corrected;\nconst wallH=Math.min(H*3,H/corrected),top=half-wallH/2;\nconst cellX=player.x+Math.cos(a)*raw,cellY=player.y+Math.sin(a)*raw;\nconst wx=cellX-Math.floor(cellX),wy=cellY-Math.floor(cellY);\nconst side=wx<.035||wx>.965;\nx.fillStyle=wallColor(corrected,side);\nx.fillRect(px,top,1,wallH)\n}\n}\nfunction drawEnemySprite(e,bob){\nif(e.dead)return;\nconst {sx,d,a}=screenPos(e.x,e.y);\nif(Math.abs(a)>FOV*.7||d<.2)return;\nconst size=Math.min(H*1.8,H/d*.72);\nconst left=Math.floor(sx-size*.3),top=Math.floor(H/2+bob-size*.48),bottom=Math.floor(H/2+bob+size*.52);\nconst zi=Math.max(0,Math.min(W-1,Math.floor(sx)));\nif(d>zBuffer[zi]+.25)return;\nconst hit=e.flash>0;\nconst wob=Math.sin(runT*.08+e.x*3)*2;\nx.fillStyle=hit?'#fff':'#991b1b';\nx.fillRect(left+size*.12+wob,top+size*.28,size*.36,size*.48);\nx.fillRect(left+size*.16+wob,top,size*.28,size*.22);\nif(size>25){\nx.fillStyle='#ffd000';\nx.fillRect(left+size*.22+wob,top+size*.09,Math.max(2,size*.035),Math.max(2,size*.045));\nx.fillRect(left+size*.38+wob,top+size*.09,Math.max(2,size*.035),Math.max(2,size*.045))\n}\nx.fillStyle=hit?'#fff':'#741414';\nx.fillRect(left-size*.03+wob,top+size*.28,size*.15,size*.11);\nx.fillRect(left+size*.6-size*.12+wob,top+size*.28,size*.15,size*.11);\nx.fillRect(left+size*.13+wob,bottom-size*.23,size*.14,size*.25);\nx.fillRect(left+size*.35+wob,bottom-size*.23,size*.14,size*.25);\nif(size>35){\nconst barW=size*.55;\nx.fillStyle='#111';x.fillRect(sx-barW/2,top-size*.07,barW,4);\nx.fillStyle='#e33';x.fillRect(sx-barW/2,top-size*.07,barW*Math.max(0,e.hp/e.max),4)\n}\n}\nfunction drawPickup(p,bob){\nif(p.taken)return;\nconst {sx,d,a}=screenPos(p.x,p.y);\nif(Math.abs(a)>FOV*.6)return;\nconst pulse=1+.12*Math.sin(runT*.12+p.x*4);\nconst size=Math.min(45,H/d*.2)*pulse;\nconst zi=Math.max(0,Math.min(W-1,Math.floor(sx)));\nif(d>zBuffer[zi]+.15)return;\nx.save();\nx.shadowColor=p.type==='health'?'rgba(33,197,93,.7)':'rgba(246,201,69,.7)';\nx.shadowBlur=10;\nx.fillStyle=p.type==='health'?'#21c55d':'#f6c945';\nx.fillRect(sx-size/2,H/2+bob-size/2,size,size);\nx.restore()\n}\nfunction drawWeapon(bob){\nconst cx=W/2,base=H+bob*1.5;\nx.fillStyle='#282828';x.fillRect(cx-44,base-64,88,50);\nx.fillStyle='#555';x.fillRect(cx-32,base-80,64,24);\nif(player.muzzle>0){\nx.fillStyle=player.muzzle%2?'#fff':'#ffd43b';\nx.beginPath();x.moveTo(cx,base-96);x.lineTo(cx-20,base-68);x.lineTo(cx,base-74);x.lineTo(cx+20,base-68);x.closePath();x.fill()\n}\n}\nfunction drawAmbient(){ambient.forEach(p=>{const a=.12+Math.sin(runT*.04+p.ph)*.08;x.fillStyle='rgba(200,190,255,'+a+')';x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fill()})}\nfunction drawParticles(){particles.forEach(p=>{x.fillStyle='rgba('+p.col+','+Math.max(p.life,0)+')';x.fillRect(p.x,p.y,p.size,p.size)})}\nfunction drawCrosshair(){\nconst cx=W/2,cy=H/2;\nx.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=2;\nx.beginPath();x.moveTo(cx-5,cy);x.lineTo(cx-1,cy);x.moveTo(cx+1,cy);x.lineTo(cx+5,cy);x.moveTo(cx,cy-5);x.lineTo(cx,cy-1);x.moveTo(cx,cy+1);x.lineTo(cx,cy+5);x.stroke()\n}\nfunction drawVignette(){\nconst g=x.createRadialGradient(W/2,H/2,H*.25,W/2,H/2,H*.75);\ng.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.45)');\nx.fillStyle=g;x.fillRect(0,0,W,H)\n}\nfunction drawEndScreen(){\nif(!gameOver&&!win)return;\nconst a=Math.min(1,endT*.04);\nx.fillStyle='rgba(0,0,0,'+(a*.75)+')';x.fillRect(0,0,W,H);\nx.globalAlpha=a;\nx.textAlign='center';x.fillStyle=win?'#ffd43b':'#f33';x.font='bold 22px Arial';\nx.fillText(win?'LEVEL CLEAR':'YOU DIED',W/2,H/2-10);\nx.fillStyle='#fff';x.font='12px Arial';x.fillText('Skor '+player.score+' · Tap untuk ulang',W/2,H/2+14);\nx.textAlign='left';x.globalAlpha=1\n}\nfunction draw(){\nx.clearRect(0,0,W,H);\nx.save();\nif(shake>0)x.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);\nconst bob=Math.sin(bobT*.3)*(keys.forward||keys.strafeL||keys.strafeR?3:.8);\ndrawWalls(bob);\ndrawAmbient();\nconst sprites=[...enemies.filter(e=>!e.dead).map(e=>({t:'e',o:e})),...pickups.filter(p=>!p.taken).map(p=>({t:'p',o:p}))];\nsprites.sort((a,b)=>dist(player,b.o)-dist(player,a.o));\nfor(const s of sprites)s.t==='e'?drawEnemySprite(s.o,bob):drawPickup(s.o,bob);\ndrawParticles();\ndrawWeapon(bob);\ndrawCrosshair();\ndrawVignette();\nif(player.hurt>0){x.fillStyle='rgba(255,0,0,'+(player.hurt/45)+')';x.fillRect(0,0,W,H)}\nx.restore();\ndrawEndScreen();\nhpEl.textContent='HP '+Math.max(0,Math.floor(player.hp));\nammoEl.textContent='AMMO '+player.ammo+' · SCORE '+player.score;\nstatusEl.textContent=win?'Level clear!':gameOver?'Kamu tewas':enemies.filter(e=>!e.dead).length+' musuh tersisa'\n}\nfunction loop(){update();draw();requestAnimationFrame(loop)}\nfunction bind(id,key){\nconst b=document.getElementById(id);\nconst down=e=>{e.preventDefault();keys[key]=true};\nconst up=e=>{e.preventDefault();keys[key]=false};\nb.addEventListener('touchstart',down,{passive:false});\nb.addEventListener('touchend',up,{passive:false});\nb.addEventListener('touchcancel',up,{passive:false});\nb.addEventListener('mousedown',down);\nb.addEventListener('mouseup',up);\nb.addEventListener('mouseleave',up)\n}\nbind('forward','forward');bind('strafeL','strafeL');bind('strafeR','strafeR');bind('fire','fire');\n\nlet looking=false;\nlet lookLastX=0;\nc.addEventListener('pointerdown',e=>{\nif(gameOver||win){reset();return;}\nlooking=true;\nlookLastX=e.clientX;\nc.setPointerCapture(e.pointerId);\n});\nc.addEventListener('pointermove',e=>{\nif(!looking)return;\nconst dx=e.clientX-lookLastX;\nplayer.angle+=dx*0.009;\nlookLastX=e.clientX;\n});\nconst stopLook=e=>{looking=false;};\nc.addEventListener('pointerup',stopLook);\nc.addEventListener('pointercancel',stopLook);\n\nwindow.addEventListener('keydown',e=>{\nconst k=e.key.toLowerCase();\nif(k==='w')keys.forward=true;\nif(k==='a')keys.strafeL=true;\nif(k==='d')keys.strafeR=true;\nif(k==='arrowleft')player.angle-=.1;\nif(k==='arrowright')player.angle+=.1;\nif(k===' ')keys.fire=true\n});\nwindow.addEventListener('keyup',e=>{\nconst k=e.key.toLowerCase();\nif(k==='w')keys.forward=false;\nif(k==='a')keys.strafeL=false;\nif(k==='d')keys.strafeR=false;\nif(k===' ')keys.fire=false\n});\nreset();\nrequestAnimationFrame(loop);\n</script></body>",
                  url: 'https://nixel.dev',
                  trusted_sources: ['nixel.dev'],
                 },
                },
               },
              ],
              step_entries: [],
             },
            ],
           },
          ],
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
    );
  } catch (error) {
    const command = String(m.command || "").trim().toLowerCase();
    console.error(EXTRA_RICH_GAMES[command] ? `[${command}]` : "[nixelgames]", error);
    // Rich games do not send standalone text or reactions; the chat only receives the Rich payload.
    return;
  }
}

export { pluginConfig as config, handler };

export default {
  config: pluginConfig,
  handler
};
