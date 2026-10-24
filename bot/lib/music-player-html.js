/* Yang diubah dari aslinya:
 *  - Daftar putar, partikel latar, dan jendela info dibuang. Kartu ini cuma
 *    memutar SATU lagu, jadi tombol acak/sebelumnya/berikutnya/ulang sengaja
 *    dimatikan (tetap terlihat supaya bentuknya tidak berubah, tapi tidak bisa
 *    ditekan).
 *  - Warna latar tidak lagi biru tetap, melainkan diambil dari sampul lagunya
 *    sendiri (sampul yang sama diburamkan dan digelapkan), jadi tiap lagu punya
 *    nuansa warnanya sendiri.
 *  - Audio dan sampul ditanam sebagai data URI. Kartu HTML jalan di sandbox
 *    WhatsApp yang tidak bisa mengambil berkas dari internet, jadi kalau
 *    memakai URL biasa, lagunya tidak akan pernah bunyi.
 *
 * Dipakai fitur {prefix}play2 di play-player.js.
 */

function escapeHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * @param {object} opts
 * @param {string} opts.title      judul lagu
 * @param {string} opts.artist     nama artis
 * @param {string} opts.cover      data URI gambar sampul (data:image/...;base64,...)
 * @param {string} opts.audio      data URI audio (data:audio/mpeg;base64,...)
 * @param {string} [opts.album]    nama album, ditampilkan di header
 * @param {string} [opts.note]     catatan kecil di bawah, misal "cuplikan 60 detik"
 */
function buildMusicPlayerHtml(opts = {}) {
    const title = escapeHtml(opts.title || 'Tanpa Judul');
    const artist = escapeHtml(opts.artist || 'Artis Tidak Diketahui');
    const album = escapeHtml(opts.album || 'Songs');
    const note = escapeHtml(opts.note || '');
    const cover = opts.cover || '';
    const audio = opts.audio || '';

    // Sampul dipakai dua kali: sebagai gambar utama, dan sebagai latar yang
    // diburamkan. Kalau tidak ada sampul, latar jatuh ke gradasi gelap netral.
    const bgLayer = cover
        ? `<img class="bg" src="${cover}" alt="">`
        : '';

    return `
<style>
:root{
  --ink:#ffffff; --muted:#b9b1b6; --line:rgba(255,255,255,.22);
  --sys:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
}
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
html,body{background:transparent;color:var(--ink);font-family:var(--sys);min-height:100vh;-webkit-font-smoothing:antialiased;}

.wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px 12px;}
.player{position:relative;width:100%;max-width:330px;border-radius:18px;overflow:hidden;
  background:#1a0d12;box-shadow:0 18px 40px rgba(0,0,0,.5);}

/* Latar diambil dari sampul lagunya sendiri, diburamkan lalu digelapkan. */
.bg{position:absolute;inset:-30%;width:160%;height:160%;object-fit:cover;filter:blur(38px) saturate(1.5);
  opacity:.85;z-index:0;}
.veil{position:absolute;inset:0;z-index:1;
  background:linear-gradient(180deg,rgba(20,8,12,.55) 0%,rgba(20,8,12,.72) 45%,rgba(12,5,8,.94) 100%);}
.content{position:relative;z-index:2;padding:16px 18px 20px;}

.head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:16px;}
.head__icon{width:18px;height:18px;color:var(--ink);opacity:.85;flex:none;}
.head__mid{text-align:center;flex:1;min-width:0;}
.head__from{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);}
.head__album{font-size:12px;font-weight:600;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

.poster{width:100%;aspect-ratio:1;border-radius:10px;overflow:hidden;background:rgba(255,255,255,.06);
  box-shadow:0 12px 26px rgba(0,0,0,.45);margin-bottom:18px;}
.poster img{width:100%;height:100%;object-fit:cover;display:block;}
.poster__empty{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:34px;color:var(--muted);}

.info{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:14px;}
.info__names{min-width:0;}
.info__title{font-size:17px;font-weight:600;line-height:1.3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.info__artist{font-size:12px;color:var(--muted);margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.info__heart{width:34px;height:34px;flex:none;display:flex;align-items:center;justify-content:center;
  background:none;border:none;color:var(--muted);cursor:pointer;padding:0;}
.info__heart svg{width:19px;height:19px;}
.info__heart.is-on{color:#ff5c8a;}
.info__heart.is-on svg{fill:currentColor;}

.bar{position:relative;height:4px;border-radius:4px;background:rgba(255,255,255,.22);cursor:pointer;margin-bottom:7px;}
.bar__fill{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:4px;background:#fff;}
.bar__dot{position:absolute;top:50%;left:0;width:11px;height:11px;border-radius:50%;background:#fff;transform:translate(-50%,-50%);}
.time{display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:14px;font-variant-numeric:tabular-nums;}

.controls{display:flex;align-items:center;justify-content:space-between;}
.ctrl{width:34px;height:34px;display:flex;align-items:center;justify-content:center;color:var(--ink);
  background:none;border:none;cursor:pointer;padding:0;}
.ctrl svg{width:21px;height:21px;}

/* Tombol acak / sebelumnya / berikutnya / ulang sengaja DIMATIKAN: kartu ini
   cuma memuat satu lagu, jadi tombol itu tidak ada yang bisa dikerjakan.
   Tetap ditampilkan supaya susunannya sama seperti pemutar aslinya. */
.ctrl.is-off{opacity:.32;cursor:default;}

.play{width:56px;height:56px;border-radius:50%;background:#fff;color:#12070b;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;flex:none;padding:0;
  box-shadow:0 6px 16px rgba(0,0,0,.4);transition:transform .15s ease;}
.play svg{width:26px;height:26px;}
.play:active{transform:scale(.93);}

.note{margin-top:14px;text-align:center;font-size:10px;color:var(--muted);line-height:1.6;}
</style>

<div class="wrap">
  <div class="player">
    ${bgLayer}
    <div class="veil"></div>

    <div class="content">
      <div class="head">
        <svg class="head__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        <div class="head__mid">
          <div class="head__from">Playing from search</div>
          <div class="head__album">${album}</div>
        </div>
        <svg class="head__icon" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>
      </div>

      <div class="poster">
        ${cover ? `<img src="${cover}" alt="Sampul ${title}">` : '<div class="poster__empty"><svg viewBox="0 0 24 24" width="42" height="42" fill="currentColor"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div>'}
      </div>

      <div class="info">
        <div class="info__names">
          <div class="info__title">${title}</div>
          <div class="info__artist">${artist}</div>
        </div>
        <button class="info__heart" id="heart" aria-label="Suka">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.8 5.6a5.1 5.1 0 0 0-7.2 0L12 7.2l-1.6-1.6a5.1 5.1 0 0 0-7.2 7.2l1.6 1.6L12 21.6l7.2-7.2 1.6-1.6a5.1 5.1 0 0 0 0-7.2z"/>
          </svg>
        </button>
      </div>

      <div class="bar" id="bar">
        <div class="bar__fill" id="fill"></div>
        <div class="bar__dot" id="dot"></div>
      </div>
      <div class="time">
        <span id="cur">0:00</span>
        <span id="dur">0:00</span>
      </div>

      <!-- Ikon digambar sebagai SVG, bukan karakter seperti &#9654; atau emoji.
           Karakter begitu dirender pakai font emoji bawaan HP - warnanya jadi
           oranye/biru sendiri dan bentuknya beda-beda tiap merek HP. -->
      <div class="controls">
        <button class="ctrl is-off" disabled title="Tidak tersedia" aria-label="Acak">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 3h5v5"/><path d="M4 20 21 3"/><path d="M21 16v5h-5"/><path d="m15 15 6 6"/><path d="M4 4l5 5"/>
          </svg>
        </button>
        <button class="ctrl is-off" disabled title="Tidak tersedia" aria-label="Sebelumnya">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 5h2.5v14H6z"/><path d="M20 5.5v13a.6.6 0 0 1-.93.5L10 13.1a.6.6 0 0 1 0-1l9.07-5.9a.6.6 0 0 1 .93.5z"/>
          </svg>
        </button>
        <button class="play" id="play" aria-label="Putar">
          <svg id="icon-play" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5.6v12.8a.6.6 0 0 0 .92.5l10-6.4a.6.6 0 0 0 0-1l-10-6.4a.6.6 0 0 0-.92.5z"/>
          </svg>
          <svg id="icon-pause" viewBox="0 0 24 24" fill="currentColor" style="display:none">
            <rect x="6.5" y="5" width="3.8" height="14" rx="1"/><rect x="13.7" y="5" width="3.8" height="14" rx="1"/>
          </svg>
        </button>
        <button class="ctrl is-off" disabled title="Tidak tersedia" aria-label="Berikutnya">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 5H18v14h-2.5z"/><path d="M4 5.5v13a.6.6 0 0 0 .93.5L14 13.1a.6.6 0 0 0 0-1L4.93 6.2A.6.6 0 0 0 4 6.7z"/>
          </svg>
        </button>
        <button class="ctrl is-off" disabled title="Tidak tersedia" aria-label="Ulang">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>
          </svg>
        </button>
      </div>

      ${note ? `<div class="note">${note}</div>` : ''}
      <audio id="audio" preload="metadata" src="${audio}"></audio>
    </div>
  </div>
</div>

<script>
(function(){
  var audio = document.getElementById('audio');
  var play = document.getElementById('play');
  var fill = document.getElementById('fill');
  var dot = document.getElementById('dot');
  var cur = document.getElementById('cur');
  var dur = document.getElementById('dur');
  var bar = document.getElementById('bar');
  var heart = document.getElementById('heart');

  var iconPlay = document.getElementById('icon-play');
  var iconPause = document.getElementById('icon-pause');

  function setIcon(playing){
    iconPlay.style.display = playing ? 'none' : '';
    iconPause.style.display = playing ? '' : 'none';
  }

  function fmt(t){
    if (!isFinite(t) || t < 0) t = 0;
    var m = Math.floor(t / 60);
    var s = Math.floor(t % 60);
    return m + ':' + (s < 10 ? '0' + s : s);
  }

  function paint(){
    var d = audio.duration;
    var p = (isFinite(d) && d > 0) ? (audio.currentTime / d) * 100 : 0;
    fill.style.width = p + '%';
    dot.style.left = p + '%';
    cur.textContent = fmt(audio.currentTime);
    dur.textContent = isFinite(d) ? fmt(d) : '0:00';
  }

  play.addEventListener('click', function(){
    if (audio.paused){
      // Sebagian klien menolak memutar audio tanpa disentuh pengguna. Karena ini
      // dijalankan dari klik, izinnya sudah ada - tapi tetap dijaga kalau gagal.
      var p = audio.play();
      if (p && p.catch) p.catch(function(){ setIcon(false); });
      setIcon(true);
    } else {
      audio.pause();
      setIcon(false);
    }
  });

  audio.addEventListener('timeupdate', paint);
  audio.addEventListener('loadedmetadata', paint);
  audio.addEventListener('ended', function(){
    setIcon(false);
    audio.currentTime = 0;
    paint();
  });

  bar.addEventListener('click', function(e){
    var d = audio.duration;
    if (!isFinite(d) || d <= 0) return;
    var r = bar.getBoundingClientRect();
    var ratio = (e.clientX - r.left) / r.width;
    audio.currentTime = Math.max(0, Math.min(1, ratio)) * d;
    paint();
  });

  heart.addEventListener('click', function(){
    heart.classList.toggle('is-on');
  });

  paint();
})();
</script>
`;
}

export { buildMusicPlayerHtml };
