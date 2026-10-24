/* By AlzRiss - Usanagi Umi AI
 *
 * .ytplay — UMI Usanagi AI Player
 * Diadaptasi & ditulis ulang dari paket Rimuru MD (plugins/rich/ytplay.js),
 * dengan resolver yang benar-benar hidup per 24 Oktober 2026:
 *
 *   Piped API      → 403 (mati)
 *   Invidious      → 401/403 (mati)
 *   Innertube      → LOGIN_REQUIRED untuk video (butuh signature challenge)
 *   SaveTube       → HIDUP (cdn*.savetube.vip/media/…, dukung HTTP Range 206)
 *
 * Jadi sumber video diambil dari SaveTube (lib/scrape/YouTube.js —
 * `getYoutubeDirectUrl`) dan diputar dalam tiga lapis:
 *
 *   1. <video src> langsung
 *   2. byte diunduh lewat XHR → blob URL  (untuk webview yang memblokir media remote)
 *   3. iframe embed YouTube               (cadangan terakhir)
 *
 * Kenapa tidak memakai proxy /media/yt: di mode single tidak ada server HTTP,
 * jadi lapis proxy memang tidak tersedia. Player tetap jalan tanpa itu.
 */

import axios from 'axios'
import { randomUUID } from 'node:crypto'
import { searchYoutube, getYoutubeDirectUrl } from '../../lib/scrape/YouTube.js'

const BRAND = 'UMI Usanagi AI'
const UA = 'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/138 Mobile Safari/537.36'

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function jsEsc(value) {
  return String(value == null ? '' : value)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/</g, '\\x3C')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

export function videoIdFrom(value) {
  try {
    const url = new URL(String(value).trim())
    const host = url.hostname.toLowerCase().replace(/^www\./, '')
    if (host === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] || ''
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (url.searchParams.get('v')) return url.searchParams.get('v')
      const parts = url.pathname.split('/').filter(Boolean)
      if (parts[0] === 'shorts' || parts[0] === 'embed' || parts[0] === 'live') return parts[1] || ''
    }
  } catch {}
  return ''
}

export function clock(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

/** Unduh thumbnail jadi data URI (biar tidak butuh koneksi gambar di webview). */
async function posterData(url) {
  if (!url) return ''
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 12000,
      maxContentLength: 3 * 1024 * 1024,
      headers: { 'user-agent': UA },
    })
    const type = String(response.headers?.['content-type'] || 'image/jpeg').split(';')[0]
    if (!/^image\//i.test(type)) return ''
    return `data:${type};base64,${Buffer.from(response.data).toString('base64')}`
  } catch {
    return ''
  }
}

/**
 * HTML player. Semua nilai disisipkan lewat JSON (bukan interpolasi mentah)
 * supaya judul berisi tanda kutip/emoji tidak merusak script.
 */
export function buildPlayerHtml({ title, channel, duration, videoUrl, embedUrl, poster, directUrl, brand = BRAND }) {
  const cfg = {
    title: String(title || 'YouTube Video'),
    channel: String(channel || 'YouTube'),
    duration: String(duration || '0:00'),
    videoUrl: String(videoUrl || ''),
    embedUrl: String(embedUrl || ''),
    poster: String(poster || ''),
    direct: String(directUrl || ''),
    brand: String(brand || BRAND),
  }
  const cfgJson = JSON.stringify(cfg).replace(/</g, '\\u003c')

  return `<style>
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none}
html,body{margin:0;min-height:100%;font-family:Arial,Helvetica,sans-serif;background:#07080d;color:#fff}
body{padding:10px}
.wrap{width:100%;max-width:440px;margin:auto}
.card{position:relative;overflow:hidden;background:#101218;border:1px solid rgba(255,255,255,.12);border-radius:22px;box-shadow:0 10px 40px rgba(0,0,0,.55)}
.bg{position:absolute;inset:-30px;background:center/cover no-repeat var(--poster);filter:blur(26px);opacity:.32;transform:scale(1.12)}
.ov{position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,6,10,.3),rgba(5,6,10,.86))}
.content{position:relative;z-index:2;padding:16px}
.top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}
.brand{font-size:10px;font-weight:800;letter-spacing:1.6px;color:#7ee7ff}
.sub{font-size:10px;opacity:.55;margin-top:3px;max-width:290px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.icon{width:34px;height:34px;border:0;border-radius:50%;background:rgba(255,255,255,.09);color:#fff;font-size:15px}
.frame{position:relative;width:100%;aspect-ratio:16/9;border-radius:16px;overflow:hidden;background:#000}
video,iframe{position:absolute;inset:0;width:100%;height:100%;display:block;background:#000}
video{z-index:1;object-fit:contain}
iframe{z-index:2;border:0;display:none}
.big{position:absolute;inset:0;z-index:3;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.2)}
.big button{width:62px;height:62px;border:0;border-radius:50%;background:#fff;color:#07080d;font-size:24px}
.playing .big{display:none}
.title{font-size:18px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:14px}
.artist{font-size:12px;opacity:.6;margin-top:4px}
.prog{margin-top:15px}
.range{width:100%;height:4px;accent-color:#7ee7ff}
.times{display:flex;justify-content:space-between;font-size:10px;opacity:.55;margin-top:6px}
.controls{display:flex;align-items:center;justify-content:center;gap:24px;margin-top:12px}
.ctrl{width:40px;height:40px;border:0;background:transparent;color:#fff;font-size:22px}
.bottom{display:flex;align-items:center;justify-content:space-between;margin-top:12px}
.volume{width:86px}
.hint{margin-top:12px;font-size:10px;opacity:.6;text-align:center;min-height:14px}
</style>
<div class="wrap"><div class="card">
<div class="bg" id="bg"></div><div class="ov"></div>
<div class="content">
  <div class="top">
    <div><div class="brand" id="brand">UMI USANAGI AI</div><div class="sub" id="subtitle"></div></div>
    <button class="icon" onclick="umpMute()">🔊</button>
  </div>
  <div class="frame" id="frame">
    <video id="v" playsinline webkit-playsinline preload="metadata" controls></video>
    <iframe id="yt" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
    <div class="big"><button onclick="umpToggle()">▶</button></div>
  </div>
  <div class="title" id="title"></div>
  <div class="artist" id="artist"></div>
  <div class="prog">
    <input class="range" id="progress" type="range" min="0" max="100" value="0" step="0.1" oninput="umpSeek(this.value)">
    <div class="times"><span id="cur">0:00</span><span id="dur">0:00</span></div>
  </div>
  <div class="controls">
    <button class="ctrl" onclick="umpJump(-10)">↶</button>
    <button class="ctrl" id="cp" onclick="umpToggle()">▶</button>
    <button class="ctrl" onclick="umpJump(10)">↷</button>
  </div>
  <div class="bottom">
    <button class="icon" onclick="umpLoop()">↻</button>
    <div><input class="range volume" id="volume" type="range" min="0" max="1" step="0.01" value="0.85" oninput="umpVolume(this.value)"></div>
  </div>
  <div class="hint" id="hint">Menyiapkan pemutar…</div>
</div></div></div>
<script>
(function(){
  var CFG = ${cfgJson};
  var v = document.getElementById('v');
  var yt = document.getElementById('yt');
  var frame = document.getElementById('frame');
  var progress = document.getElementById('progress');
  var cur = document.getElementById('cur');
  var dur = document.getElementById('dur');
  var cp = document.getElementById('cp');
  var vol = document.getElementById('volume');
  var hint = document.getElementById('hint');
  var bg = document.getElementById('bg');

  document.getElementById('title').textContent = CFG.title;
  document.getElementById('artist').textContent = CFG.channel;
  document.getElementById('subtitle').textContent = CFG.title;
  document.getElementById('brand').textContent = String(CFG.brand || 'UMI USANAGI AI').toUpperCase();
  dur.textContent = CFG.duration || '0:00';
  if (CFG.poster) bg.style.setProperty('--poster', 'url("' + CFG.poster + '")');
  if (CFG.poster) v.setAttribute('poster', CFG.poster);

  var layer = 0;      /* 0 = belum, 1 = direct, 2 = blob, 3 = embed */
  var loop = false;
  var triedBlob = false;
  var playRequested = false;

  function tm(n){ if(!isFinite(n)||n<0) return '0:00'; return Math.floor(n/60)+':'+String(Math.floor(n%60)).padStart(2,'0'); }
  function say(t){ hint.textContent = t; }
  function ui(){
    var playing = layer === 3 ? false : !v.paused;
    cp.textContent = playing ? '❚❚' : '▶';
    frame.classList.toggle('playing', playing || layer === 3);
  }

  function useEmbed(reason){
    if (!CFG.embedUrl){ say(reason || 'Video tidak bisa diputar di sini.'); return; }
    layer = 3;
    yt.src = CFG.embedUrl;
    yt.style.display = 'block';
    v.style.display = 'none';
    frame.classList.add('playing');
    say(reason ? reason + ' — dialihkan ke pemutar YouTube.' : 'Diputar lewat pemutar YouTube.');
    ui();
  }

  /* Lapis 1 → 2 → 3 */
  function startDirect(){
    if (!CFG.direct){ useEmbed('Sumber video tidak tersedia'); return; }
    layer = 1;
    v.src = CFG.direct;
    say('Memuat video langsung…');
    var guard = setTimeout(function(){
      if (v.readyState < 2) tryBlob('Video lambat dimuat');
    }, 9000);
    v.addEventListener('loadeddata', function(){ clearTimeout(guard); }, { once: true });
  }

  function tryBlob(reason){
    if (triedBlob || !CFG.direct) { useEmbed(reason); return; }
    triedBlob = true;
    layer = 2;
    say('Mengunduh video ke perangkat…');
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', CFG.direct, true);
      xhr.responseType = 'blob';
      xhr.onprogress = function(e){
        if (e.lengthComputable) say('Mengunduh ' + Math.round(e.loaded / e.total * 100) + '%');
      };
      xhr.onload = function(){
        if (xhr.status >= 200 && xhr.status < 300 && xhr.response && xhr.response.size > 1024){
          v.src = URL.createObjectURL(xhr.response);
          say('Video siap diputar.');
          if (playRequested) { try { v.play(); } catch(e){} }
        } else {
          useEmbed('Unduhan gagal');
        }
      };
      xhr.onerror = function(){ useEmbed('Unduhan diblokir'); };
      xhr.send();
    } catch (e) {
      useEmbed('Unduhan tidak didukung');
    }
  }

  window.umpToggle = function(){
    if (layer === 3){ say('Gunakan kontrol di dalam pemutar YouTube.'); return; }
    if (v.paused){ playRequested = true; var p = v.play(); if (p && p.catch) p.catch(function(){ say('Tekan ▶ sekali lagi untuk memutar.'); }); }
    else v.pause();
    ui();
  };
  window.umpJump = function(n){
    if (layer === 3) return;
    if (isFinite(v.duration)) v.currentTime = Math.max(0, Math.min(v.duration, v.currentTime + Number(n || 0)));
  };
  window.umpSeek = function(x){
    if (layer === 3) return;
    if (isFinite(v.duration)) v.currentTime = Number(x) / 100 * v.duration;
  };
  window.umpVolume = function(x){
    if (layer === 3) return;
    v.volume = Math.max(0, Math.min(1, Number(x) || 0));
    v.muted = false;
  };
  window.umpMute = function(){ if (layer !== 3) v.muted = !v.muted; };
  window.umpLoop = function(){ if (layer === 3) return; loop = !loop; v.loop = loop; say(loop ? 'Ulang aktif' : 'Ulang mati'); };

  v.volume = 0.85;
  v.addEventListener('timeupdate', function(){
    if (!isFinite(v.duration) || v.duration <= 0) return;
    progress.value = v.currentTime / v.duration * 100;
    cur.textContent = tm(v.currentTime);
    dur.textContent = tm(v.duration);
  });
  v.addEventListener('play', ui);
  v.addEventListener('pause', ui);
  v.addEventListener('error', function(){ tryBlob('Sumber langsung ditolak perangkat'); });
  if (CFG.poster) progress.value = 0;

  startDirect();
  ui();
})();
</script>`
}

/** Kirim HTML lewat pesan AI Rich; kalau perangkat tidak mendukung, balas teks. */
async function sendRich(conn, chatId, html, { title, fallback }) {
  const responseId = randomUUID()
  const unified = {
    __typename: 'GenAIUnifiedResponse',
    response_id: responseId,
    sections: [{
      __typename: 'GenAIUnifiedResponseSection',
      view_model: {
        __typename: 'GenAISingleLayoutViewModel',
        primitive: {
          __typename: 'GenAIaeacdsnwHtmlPrimitive',
          payload: html,
          trusted_sources: [],
        },
      },
    }],
  }

  try {
    await conn.relayMessage(
      chatId,
      {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2,
          botMetadata: { messageDisclaimerText: '', botResponseId: responseId },
        },
        botForwardedMessage: {
          message: {
            richResponseMessage: {
              messageType: 1,
              submessages: [{ messageType: 2, messageText: title }],
              unifiedResponse: { data: Buffer.from(JSON.stringify(unified)).toString('base64') },
              contextInfo: {
                forwardingScore: 1,
                isForwarded: true,
                forwardedAiBotMessageInfo: { botJid: '867051314767696@bot' },
                forwardOrigin: 4,
              },
            },
          },
        },
      },
      { messageId: responseId },
    )
    return { ok: true }
  } catch (error) {
    if (fallback) {
      try { await conn.sendMessage(chatId, { text: fallback }) } catch {}
    }
    return { ok: false, error }
  }
}

/**
 * Kirim video sebagai berkas WhatsApp — jalur yang selalu bisa diputar,
 * tanpa webview, tanpa API. Dipakai `.ytvideo`.
 */
async function sendVideoFile(m, conn, info, meta) {
  const url = info?.url
  if (!url) throw new Error('Sumber video tidak tersedia dari server.')

  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 120000,
    maxContentLength: 64 * 1024 * 1024,
    headers: { 'user-agent': UA },
  })
  const buffer = Buffer.from(response.data || [])
  if (buffer.length < 10240) throw new Error('Berkas video kosong.')
  const type = String(response.headers?.['content-type'] || '').split(';')[0] || 'video/mp4'
  const caption =
    `▶️ *${BRAND}*\n\n` +
    `🎬 ${meta.title}\n📺 ${meta.channel}\n⏱️ ${meta.duration}\n` +
    `📦 ${(buffer.length / 1024 / 1024).toFixed(1)} MB`

  try {
    await conn.sendMessage(m.chat, { video: buffer, mimetype: type, caption }, { quoted: m })
  } catch (error) {
    if (typeof conn.sendFile === 'function') {
      await conn.sendFile(m.chat, buffer, 'umi-usanagi-ai.mp4', caption, m)
    } else {
      throw error
    }
  }
  return buffer.length
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const query = String(text || '').trim()
  const prefix = usedPrefix || '.'
  const cmd = String(command || '').toLowerCase()
  const asFile = /^(ytvideo|ytvid|ytmp4umi)$/.test(cmd)
  if (!query) {
    return m.reply(
      `▶️ *${BRAND}* — pemutar YouTube\n\n` +
      `\`${prefix}ytplay <judul atau link>\` — pemutar HTML interaktif\n` +
      `\`${prefix}ytvideo <judul atau link>\` — kirim videonya langsung\n\n` +
      `Contoh: \`${prefix}ytplay alan walker faded\`\n` +
      `        \`${prefix}ytplay https://youtu.be/fJ9rUzIMcZQ\``,
    )
  }

  try { await m.react('🕐') } catch {}

  try {
    // 1. Tentukan URL video
    const looked = await searchYoutube(query)
    const videoUrl = String(looked || '').trim()
    const videoId = videoIdFrom(videoUrl)
    if (!videoId) throw new Error('Video YouTube tidak ditemukan untuk pencarian itu.')

    // 2. Ambil sumber putar (SaveTube — satu-satunya resolver yang hidup)
    let info = null
    try {
      info = await getYoutubeDirectUrl(videoUrl, '360')
    } catch (error) {
      info = null
    }

    const title = info?.title || 'YouTube Video'
    const duration = info?.duration ? clock(info.duration) : '0:00'
    const thumb = info?.thumb || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`

    // 3. Nama channel (opsional — kalau gagal, tetap "YouTube")
    let channel = 'YouTube'
    try {
      const oe = await axios.get('https://www.youtube.com/oembed', {
        params: { url: videoUrl, format: 'json' },
        timeout: 8000,
        headers: { 'user-agent': UA },
      })
      channel = String(oe.data?.author_name || '').trim() || channel
    } catch {}

    if (asFile) {
      const bytes = await sendVideoFile(m, conn, info, { title, channel, duration })
      try { await m.react('✅') } catch {}
      return { ok: true, bytes }
    }

    const poster = await posterData(thumb)
    const embedUrl = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?playsinline=1&rel=0&autoplay=0`

    const html = buildPlayerHtml({
      title,
      channel,
      duration,
      videoUrl,
      embedUrl,
      poster,
      directUrl: info?.url || '',
    })

    const fallback =
      `▶️ *${BRAND}*\n\n` +
      `🎬 ${title}\n📺 ${channel}\n⏱️ ${duration}\n\n` +
      `${videoUrl}\n\n` +
      `_Pemutar HTML tidak didukung di perangkat ini — video tetap bisa dibuka lewat tautan di atas._`

    const sent = await sendRich(conn, m.chat, html, { title: `${BRAND} • ${title}`, fallback })
    if (!sent.ok) console.warn('[ytplay] relay gagal:', sent.error?.message || sent.error)

    try { await m.react('✅') } catch {}
    return sent
  } catch (error) {
    console.error('[ytplay]', error?.stack || error?.message || error)
    try { await m.react('❌') } catch {}
    return m.reply(`❌ *${BRAND}* gagal memutar video.\n\n${String(error?.message || error).slice(0, 220)}`)
  }
}

handler.help = ['ytplay <judul/link>', 'ytp <judul/link>', 'ytvideo <judul/link>']
handler.tags = ['music']
handler.command = /^(ytplay|ytp|ytvideo|ytvid|ytmp4umi)$/i
handler.description = `${BRAND} — pemutar YouTube 3 lapis (langsung, unduh, embed)`
handler.cooldown = 5

export default handler
