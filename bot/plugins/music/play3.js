import { searchYoutube, getYoutubeDirectUrl } from '../../lib/scrape/YouTube.js';
import { proxyUrlFor } from '../../lib/media-proxy.js';
import { extractVideoId } from '../../lib/youtube-media.js';
import { randomUUID } from 'crypto';
import axios from 'axios';

// UA khusus untuk oEmbed YouTube (dipakai mengambil nama channel).
const UA_OE =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36";

function escapeHtmlJs(value) {
    return String(value ?? '')
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/`/g, '\\`')
        .replace(/\$\{/g, '\\${')
        .replace(/</g, '\\x3C');
}

function buildPlayerHtml({ title, channel, duration, videoUrl, proxyUrl, embedUrl, posterBase64 }) {
    const safeTitle = escapeHtmlJs(title);
    const safeChannel = escapeHtmlJs(channel);
    const safeDuration = escapeHtmlJs(duration);
    const safeVideoUrl = escapeHtmlJs(videoUrl);
    const safeProxyUrl = escapeHtmlJs(proxyUrl || "");
    const safeEmbedUrl = escapeHtmlJs(embedUrl || "");

    return `<style>
*{
-webkit-tap-highlight-color:transparent;
-webkit-user-select:none;
user-select:none;
-webkit-touch-callout:none;
box-sizing:border-box
}
body{
margin:0;
background:#090a0f;
font-family:Arial,Helvetica,sans-serif;
color:#fff;
touch-action:manipulation;
cursor:pointer
}
input[type=range]{
width:100%;
height:4px;
accent-color:#fff;
cursor:pointer
}
.player-wrap{
width:100%;
max-width:440px;
margin:auto;
padding:12px
}
.player{
position:relative;
overflow:hidden;
background:#111318;
border:1px solid rgba(255,255,255,.12);
border-radius:20px;
box-shadow:0 10px 40px rgba(0,0,0,.55)
}
.bg{
position:absolute;
inset:-25px;
background-position:center;
background-size:cover;
filter:blur(22px);
opacity:.38;
transform:scale(1.15);
pointer-events:none
}
.bg-overlay{
position:absolute;
inset:0;
background:linear-gradient(180deg, rgba(5,6,10,.35), rgba(5,6,10,.72));
pointer-events:none
}
.content{
position:relative;
padding:18px;
z-index:2
}
.top{
display:flex;
align-items:center;
justify-content:space-between;
margin-bottom:15px
}
.top-title{
font-size:13px;
font-weight:700;
letter-spacing:.8px;
opacity:.85
}
.top-sub{
font-size:10px;
opacity:.5;
margin-top:3px;
white-space:nowrap;
overflow:hidden;
text-overflow:ellipsis;
max-width:260px
}
.icon-btn{
width:34px;
height:34px;
border:0;
border-radius:50%;
background:rgba(255,255,255,.08);
color:#fff;
display:flex;
align-items:center;
justify-content:center;
padding:0;
flex-shrink:0
}
.icon-btn svg{
width:17px;
height:17px;
fill:none;
stroke:currentColor;
stroke-width:2;
stroke-linecap:round;
stroke-linejoin:round
}
.video-frame{
position:relative;
width:100%;
aspect-ratio:16/9;
border-radius:15px;
overflow:hidden;
background:#000;
box-shadow:0 12px 35px rgba(0,0,0,.45);
cursor:pointer
}
.video-frame video{
width:100%;
height:100%;
display:block;
background:#000;
object-fit:contain
}
.video-frame iframe{
width:100%;
height:100%;
border:0;
display:block;
background:#000
}
.big-play{
position:absolute;
inset:0;
display:flex;
align-items:center;
justify-content:center;
background:rgba(0,0,0,.18);
transition:opacity .2s;
z-index:3
}
.big-btn{
width:64px;
height:64px;
border:0;
border-radius:50%;
background:#fff;
color:#08090d;
display:flex;
align-items:center;
justify-content:center;
padding:0;
box-shadow:0 6px 18px rgba(0,0,0,.35)
}
.big-btn svg{
width:26px;
height:26px;
fill:currentColor;
stroke:currentColor;
stroke-width:2;
stroke-linecap:round;
stroke-linejoin:round
}
.frame-playing .big-play{
opacity:0;
pointer-events:none
}
.info{
padding-top:15px
}
.song-title{
font-size:19px;
font-weight:700;
white-space:nowrap;
overflow:hidden;
text-overflow:ellipsis
}
.artist{
font-size:13px;
opacity:.6;
margin-top:5px;
white-space:nowrap;
overflow:hidden;
text-overflow:ellipsis
}
.progress{
margin-top:18px
}
.times{
display:flex;
justify-content:space-between;
font-size:10px;
opacity:.55;
margin-top:7px
}
.controls{
display:flex;
align-items:center;
justify-content:center;
gap:18px;
margin-top:13px
}
.side-btn{
width:38px;
height:38px;
border:0;
background:transparent;
color:#fff;
display:flex;
align-items:center;
justify-content:center;
padding:0;
opacity:.8
}
.side-btn svg{
width:19px;
height:19px;
fill:none;
stroke:currentColor;
stroke-width:2;
stroke-linecap:round;
stroke-linejoin:round
}
.bottom{
display:flex;
align-items:center;
justify-content:space-between;
margin-top:15px;
gap:12px
}
.bottom-left,
.bottom-right{
display:flex;
align-items:center;
gap:9px
}
.volume{
width:85px
}
.debug-wrap{
margin-top:12px;
background:#111318;
border:1px solid rgba(255,255,255,.12);
border-radius:16px;
padding:12px;
font-family:monospace
}
.debug-head{
display:flex;
align-items:center;
justify-content:space-between;
margin-bottom:8px
}
.debug-title{
font-size:11px;
font-weight:700;
letter-spacing:.8px;
opacity:.85
}
.debug-state{
font-size:10px;
font-weight:700;
padding:3px 8px;
border-radius:20px;
background:rgba(255,255,255,.08);
color:#ffd166;
letter-spacing:.5px
}
.debug-server{
font-size:9px;
opacity:.5;
word-break:break-all;
margin-bottom:8px;
line-height:1.4
}
.debug-grid{
display:grid;
grid-template-columns:repeat(3,1fr);
gap:6px;
margin-bottom:8px
}
.debug-cell{
background:rgba(255,255,255,.05);
border-radius:8px;
padding:6px 8px
}
.debug-cell span{
display:block;
font-size:8px;
opacity:.5;
letter-spacing:.5px
}
.debug-cell b{
display:block;
font-size:11px;
margin-top:2px;
white-space:nowrap;
overflow:hidden;
text-overflow:ellipsis
}
.debug-bar{
height:4px;
border-radius:4px;
background:rgba(255,255,255,.08);
overflow:hidden;
margin-bottom:8px
}
.debug-bar-fill{
height:100%;
width:0;
background:linear-gradient(90deg,#4cc9f0,#7bff9f);
transition:width .3s
}
.debug-log{
height:110px;
overflow-y:auto;
background:rgba(0,0,0,.35);
border-radius:8px;
padding:6px 8px;
font-size:9px;
line-height:1.6;
color:rgba(255,255,255,.75);
word-break:break-all;
-webkit-overflow-scrolling:touch
}
.log-line{
white-space:pre-wrap
}
</style>

<body>
<div class="player-wrap">
<div class="player">

<div class="bg" id="background"></div>
<div class="bg-overlay"></div>

<div class="content">

<div class="top">
<div>
<div class="top-title" id="playlistTitle">NOW PLAYING VIDEO</div>
<div class="top-sub" id="playlistSub">${safeTitle}</div>
</div>

<button class="icon-btn" type="button" onclick="toggleMute()" id="muteButton">
<svg id="volumeIcon" viewBox="0 0 24 24">
<path d="M11 5 6 9H2v6h4l5 4V5z"></path>
<path d="M19 9a5 5 0 0 1 0 6"></path>
<path d="M16 6.5a9 9 0 0 1 0 11"></path>
</svg>
</button>
</div>

<div class="video-frame" id="videoFrame" onclick="toggleVideo()">
<video id="videoPlayer" playsinline webkit-playsinline preload="none" poster="${posterBase64}"></video>
<iframe id="embedPlayer" src="about:blank" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen style="display:none;width:100%;height:100%;border:0;background:#000"></iframe>
<div class="big-play" id="bigPlay">
<button class="big-btn" type="button" onclick="event.stopPropagation();toggleVideo()">
<svg id="playIcon" viewBox="0 0 24 24">
<path d="M8 5v14l11-7z"></path>
</svg>
<svg id="pauseIcon" viewBox="0 0 24 24" style="display:none">
<path d="M7 5v14"></path>
<path d="M17 5v14"></path>
</svg>
</button>
</div>
</div>

<div class="info">
<div class="song-title" id="songTitle">Unknown Video</div>
<div class="artist" id="artist">Unknown Channel</div>
</div>

<div class="progress">
<input id="progress" type="range" min="0" max="100" value="0" step="0.1" oninput="seekVideo(this.value)">
<div class="times">
<span id="currentTime">0:00</span>
<span id="duration">0:00</span>
</div>
</div>

<div class="controls">
<button class="side-btn" type="button" onclick="previousVideo()">
<svg viewBox="0 0 24 24">
<path d="M19 20 9 12l10-8v16z"></path>
<path d="M5 19V5"></path>
</svg>
</button>
<button class="side-btn" type="button" onclick="toggleVideo()">
<svg id="smallPlayIcon" viewBox="0 0 24 24">
<path d="M8 5v14l11-7z"></path>
</svg>
<svg id="smallPauseIcon" viewBox="0 0 24 24" style="display:none">
<path d="M7 5v14"></path>
<path d="M17 5v14"></path>
</svg>
</button>
<button class="side-btn" type="button" onclick="nextVideo()">
<svg viewBox="0 0 24 24">
<path d="m5 4 10 8-10 8V4z"></path>
<path d="M19 5v14"></path>
</svg>
</button>
</div>

<div class="bottom">
<div class="bottom-left">
<button class="icon-btn" type="button" onclick="toggleRepeat()" id="repeatButton">
<svg viewBox="0 0 24 24">
<path d="M17 2l4 4-4 4"></path>
<path d="M3 11V9a3 3 0 0 1 3-3h15"></path>
<path d="m7 22-4-4 4-4"></path>
<path d="M21 13v2a3 3 0 0 1-3 3H3"></path>
</svg>
</button>
</div>
<div class="bottom-right">
<button class="icon-btn" type="button" onclick="toggleMute()">
<svg viewBox="0 0 24 24">
<path d="M11 5 6 9H2v6h4l5 4V5z"></path>
<path d="m19 9-5 6"></path>
<path d="m14 9 5 6"></path>
</svg>
</button>
<input class="volume" id="volume" type="range" min="0" max="1" step="0.01" value="1" oninput="changeVolume(this.value)">
</div>
</div>

</div>
</div>

<div class="debug-wrap">
<div class="debug-head">
<div class="debug-title">SUMBER VIDEO</div>
<div class="debug-state" id="srcState">SIAP</div>
</div>
<div class="debug-server" id="srcServer">menunggu pemutaran</div>
<div class="debug-grid">
<div class="debug-cell"><span>Mode</span><b id="dbgMode">-</b></div>
<div class="debug-cell"><span>Buffer</span><b id="dbgBuffered">0%</b></div>
<div class="debug-cell"><span>Resolusi</span><b id="dbgRes">-</b></div>
<div class="debug-cell"><span>Loop</span><b id="dbgLoop">OFF</b></div>
</div>
<div class="debug-log" id="debugLog"></div>
</div>
</div>

<script>
window.VIDEO_CONFIG = {
    title: "${safeTitle}",
    channel: "${safeChannel}",
    duration: "${safeDuration}",
    videoUrl: "${safeVideoUrl}",
    proxyUrl: "${safeProxyUrl}",
    embedUrl: "${safeEmbedUrl}",
    autoplay: false,
    volume: 0.8,
    loop: false
};

var video = document.getElementById("videoPlayer");
var frame = document.getElementById("videoFrame");
var songTitle = document.getElementById("songTitle");
var artist = document.getElementById("artist");
var progress = document.getElementById("progress");
var currentTime = document.getElementById("currentTime");
var durationLabel = document.getElementById("duration");
var volume = document.getElementById("volume");
var smallPlayIcon = document.getElementById("smallPlayIcon");
var smallPauseIcon = document.getElementById("smallPauseIcon");
var repeatButton = document.getElementById("repeatButton");
var playlistSub = document.getElementById("playlistSub");
var background = document.getElementById("background");

var isLoop = false;
var userPressed = false;
var config = window.VIDEO_CONFIG || {};

songTitle.textContent = config.title || "Unknown Video";
artist.textContent = config.channel || "Unknown Channel";
playlistSub.textContent = config.title || "Unknown Video";

if (video.poster && background) {
    background.style.backgroundImage = "url('" + video.poster + "')";
}

if (config.volume !== undefined) {
    video.volume = config.volume;
    volume.value = config.volume;
}

isLoop = config.loop || false;
video.loop = isLoop;
updateLoopStatus();

function formatTime(seconds) {
    if (!isFinite(seconds)) return "0:00";
    var min = Math.floor(seconds / 60);
    var sec = Math.floor(seconds % 60);
    if (sec < 10) sec = "0" + sec;
    return min + ":" + sec;
}

function updateUI() {
    if (video.paused) {
        smallPlayIcon.style.display = "block";
        smallPauseIcon.style.display = "none";
        frame.classList.remove("frame-playing");
    } else {
        smallPlayIcon.style.display = "none";
        smallPauseIcon.style.display = "block";
        frame.classList.add("frame-playing");
    }
}

function playVideo() {
    var result = video.play();
    if (result && result.catch) {
        result.catch(function() {});
    }
    updateUI();
}

function toggleVideo() {
    if (video.paused) {
        if (!video.src) userPressed = true;
        playVideo();
    } else {
        userPressed = false;
        video.pause();
    }
    updateUI();
}

function previousVideo() {
    if (!isFinite(video.duration)) return;
    video.currentTime = Math.max(0, video.currentTime - 10);
}

function nextVideo() {
    if (!isFinite(video.duration)) return;
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
}

function seekVideo(value) {
    if (!isFinite(video.duration)) return;
    video.currentTime = (Number(value) / 100) * video.duration;
}

function changeVolume(value) {
    video.volume = Number(value);
    if (video.volume > 0) video.muted = false;
}

function toggleMute() {
    video.muted = !video.muted;
}

function toggleRepeat() {
    isLoop = !isLoop;
    video.loop = isLoop;
    repeatButton.style.opacity = isLoop ? "1" : ".55";
    repeatButton.title = isLoop ? "Loop ON" : "Loop OFF";
    updateLoopStatus();
}

function updateLoopStatus() {
    var el = document.getElementById("dbgLoop");
    if (el) el.textContent = isLoop ? "ON" : "OFF";
}

video.addEventListener("loadedmetadata", function() {
    durationLabel.textContent = formatTime(video.duration);
});

video.addEventListener("timeupdate", function() {
    if (!isFinite(video.duration)) return;
    var value = (video.currentTime / video.duration) * 100;
    progress.value = value;
    currentTime.textContent = formatTime(video.currentTime);
    durationLabel.textContent = formatTime(video.duration);
});

video.addEventListener("play", function() { updateUI(); });
video.addEventListener("pause", function() { updateUI(); });
video.addEventListener("ended", function() {
    if (!isLoop) {
        progress.value = 0;
        currentTime.textContent = "0:00";
        video.currentTime = 0;
    }
    updateUI();
});

function setSrcState(state) {
    var el = document.getElementById("srcState");
    if (el) el.textContent = state;
}

function writeLog(line) {
    var box = document.getElementById("debugLog");
    if (!box) return;
    var div = document.createElement("div");
    div.className = "log-line";
    div.textContent = line;
    box.appendChild(div);
    while (box.childNodes.length > 12) {
        box.removeChild(box.firstChild);
    }
    box.scrollTop = box.scrollHeight;
}

function setCell(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value;
}

function updateLoopStatus() {
    setCell("dbgLoop", isLoop ? "ON" : "OFF");
}

function showEmbed(cfg, reason) {
    var iframe = document.getElementById("embedPlayer");
    var embed = cfg.embedUrl || "";
    if (!iframe || !embed) {
        setSrcState("TIDAK TERSEDIA");
        writeLog(reason || "Video tidak bisa diputar di sini.");
        setCell("dbgMode", "tidak ada");
        return;
    }
    iframe.src = embed;
    iframe.style.display = "block";
    video.style.display = "none";
    setSrcState("PEMUTAR YOUTUBE");
    setCell("dbgMode", "embed youtube");
    writeLog("Video dialihkan ke pemutar YouTube.");
}

/*
 * Urutan sumber: proxy server bot -> link langsung -> embed YouTube.
 * Proxy dipakai lebih dulu karena link googlevideo terikat ke IP server;
 * tanpa proxy, HP pengguna sering ditolak (403) padahal server bisa akses.
 * Semua kegagalan diteruskan ke sumber berikutnya tanpa menampilkan
 * tulisan error mentah ke pengguna.
 */
function startPlayback(cfg) {
    var mode = document.getElementById("dbgMode");
    var server = document.getElementById("srcServer");
    var sources = [];

    if (cfg.proxyUrl) sources.push({ url: cfg.proxyUrl, kind: "proxy server" });
    if (cfg.videoUrl) sources.push({ url: cfg.videoUrl, kind: "link langsung" });

    if (server) {
        try { server.textContent = new URL(sources.length ? sources[0].url : "https://youtube.com").host; }
        catch (e) { server.textContent = "youtube"; }
    }

    if (!sources.length) {
        showEmbed(cfg, "Sumber video tidak tersedia.");
        return;
    }

    var index = 0;

    function tryNext() {
        if (index >= sources.length) {
            showEmbed(cfg, "Tidak bisa memutar langsung.");
            return;
        }
        var source = sources[index++];
        if (mode) mode.textContent = source.kind;
        setSrcState(index === 1 ? "MEMUAT" : "COBA SUMBER LAIN");
        writeLog("Memuat " + source.kind + "...");
        video.src = source.url;
        video.load();
        if (userPressed) {
            var p = video.play();
            if (p && p.catch) p.catch(function () {});
        }
    }

    video.addEventListener("error", function () {
        if (video.style.display === "none") return;
        writeLog("Sumber " + (sources[Math.max(0, index - 1)] || {}).kind + " gagal, mencoba berikutnya.");
        tryNext();
    });

    video.addEventListener("loadeddata", function () {
        setSrcState("SIAP");
        writeLog("Video siap diputar.");
    });

    video.addEventListener("loadedmetadata", function () {
        var res = video.videoWidth > 0 ? video.videoWidth + "x" + video.videoHeight : "-";
        setCell("dbgRes", res);
    });

    video.addEventListener("progress", function () {
        try {
            if (!video.buffered.length || !isFinite(video.duration) || video.duration <= 0) return;
            var end = video.buffered.end(video.buffered.length - 1);
            setCell("dbgBuffered", Math.min(100, Math.round((end / video.duration) * 100)) + "%");
        } catch (e) {}
    });

    video.addEventListener("play", function () { setSrcState("DIPUTAR"); });
    video.addEventListener("pause", function () {
        if (video.style.display !== "none") setSrcState("DIJEDA");
    });

    tryNext();
}

startPlayback(config);
</script>`;
}

let handler = async (m, { conn, text }) => {
    const query = String(text || "").trim();

    // Periksa input lebih dulu. Versi lama selalu mengirim "sedang memproses"
    // sebelum memeriksa, jadi pengguna yang lupa menulis judul tetap melihat
    // pesan "memproses" yang menyesatkan sebelum pesan contohnya muncul.
    if (!query) {
        return m.reply(
            "🎬 *YT PLAY*\n\n" +
            "Masukkan judul atau link YouTube.\n\n" +
            "Contoh:\n" +
            ".ytplay alan walker faded\n" +
            ".ytp https://youtu.be/xxxxx"
        );
    }

    // Umpan balik langsung: prosesnya butuh ~3 detik (cari → ambil link →
    // susun player), jadi pengguna perlu tanda bahwa perintahnya diterima.
    // Dibungkus try/catch supaya perangkat tanpa dukungan reaksi tidak gagal.
    try { await m.react("⏳"); } catch {}

    await m.reply("⏳ Sedang memproses, mohon tunggu sebentar...");

    try {

        const youtubeUrl = await searchYoutube(query);

        if (!youtubeUrl) {
            throw new Error("Video YouTube tidak ditemukan.");
        }

        const info = await getYoutubeDirectUrl(youtubeUrl, "360");

        if (!info?.url) {
            throw new Error("Gagal mendapatkan direct link video.");
        }

        let posterBase64 = "";

        if (info.thumb) {
            try {
                const thumbRes = await axios.get(info.thumb, {
                    responseType: "arraybuffer",
                    timeout: 10000
                });

                posterBase64 = "data:image/jpeg;base64," + Buffer.from(thumbRes.data).toString("base64");
            } catch (e) {
                posterBase64 = "";
            }
        }

        // SaveTube hanya mengembalikan judul/durasi/thumbnail — tidak ada nama
        // channel. Karena itu nama channel diambil dari oEmbed resmi YouTube
        // (tanpa perlu API key). Ini juga memperbaiki bug lama: kode memakai
        // info.author yang memang tidak pernah ada, sehingga label channel
        // selalu jatuh ke "YouTube" untuk semua video.
        let channelName = String(info.author || "").trim();
        if (!channelName) {
            try {
                const oe = await axios.get("https://www.youtube.com/oembed", {
                    params: { url: youtubeUrl, format: "json" },
                    timeout: 8000,
                    headers: { "user-agent": UA_OE }
                });
                channelName = String(oe.data?.author_name || "").trim();
            } catch (e) {
                channelName = "";
            }
        }
        channelName = channelName || "YouTube";

        const duration = info.duration
            ? `${Math.floor(info.duration / 60)}:${String(info.duration % 60).padStart(2, "0")}`
            : "";

        const playerTitle = info.title || "YouTube Video";

        // Video id dipakai untuk embed YouTube (cadangan terakhir kalau link
        // langsung tidak bisa diputar di HP pengguna).
        const videoId = extractVideoId(youtubeUrl) || extractVideoId(info.url) || "";
        const embedUrl = videoId
            ? "https://www.youtube.com/embed/" + encodeURIComponent(videoId) + "?playsinline=1&rel=0"
            : "";

        // Proxy dimatikan otomatis kalau PLATFORM_PUBLIC_BASE_URL / global.media.proxyBase
        // belum diisi: player langsung memakai link asli lalu jatuh ke embed.
        const proxyUrl = proxyUrlFor(info.url);

        const htmlPayload = buildPlayerHtml({
            title: playerTitle,
            channel: channelName,
            duration,
            videoUrl: info.url,
            proxyUrl,
            embedUrl,
            posterBase64
        });

        /* ------------------------------------------------------------------
         * Pesan HTML "AI Rich" hanya dirender WhatsApp kalau amplopnya lengkap.
         *
         * Versi lama memakai primitif __typename "FOAHtmlPrimitiveDemoDONOTUSE"
         * — nama itu sendiri berarti "jangan dipakai"; ia primitif DEMO, bukan
         * primitif HTML yang benar-benar dirender. Selain itu amplopnya juga
         * kehilangan messageContextInfo.botMetadata, submessages, dan
         * forwardedAiBotMessageInfo, lalu memakai opsi relay yang salah
         * (additionalAttributes, bukan messageId).
         *
         * Bentuk di bawah ini sama dengan plugins/music/play2.js dan
         * plugins/main/usanagi-ping3.js — pola yang dipakai puluhan plugin lain
         * di repo ini dan sudah terbukti dirender.
         * ------------------------------------------------------------------ */
        const responseId = randomUUID();
        const unified = {
            __typename: "GenAIUnifiedResponse",
            response_id: responseId,
            sections: [
                {
                    __typename: "GenAIUnifiedResponseSection",
                    view_model: {
                        __typename: "GenAISingleLayoutViewModel",
                        primitive: {
                            __typename: "GenAIaeacdsnwHtmlPrimitive",
                            trusted_sources: [],
                            payload: htmlPayload
                        }
                    }
                }
            ]
        };

        try {
            await conn.relayMessage(
                m.chat,
                {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2,
                        botMetadata: {
                            messageDisclaimerText: "",
                            botResponseId: responseId
                        }
                    },
                    botForwardedMessage: {
                        message: {
                            richResponseMessage: {
                                messageType: 1,
                                submessages: [{ messageType: 2, messageText: playerTitle }],
                                unifiedResponse: {
                                    data: Buffer.from(JSON.stringify(unified)).toString("base64")
                                },
                                contextInfo: {
                                    forwardingScore: 1,
                                    isForwarded: true,
                                    forwardedAiBotMessageInfo: { botJid: "867051314767696@bot" },
                                    forwardOrigin: 4
                                }
                            }
                        }
                    }
                },
                { messageId: responseId }
            );
        } catch (relayErr) {
            // Sebagian perangkat/versi WhatsApp belum mendukung pesan HTML.
            // Perintahnya jangan digagalkan — kirim teks biasa supaya pengguna
            // tetap mendapatkan judul dan tautannya.
            console.warn("[ytplay] relayMessage gagal, memakai teks biasa:", relayErr?.message || relayErr);
            await m.reply(
                "🎬 *" + playerTitle + "*\n" +
                "📺 " + channelName + "\n" +
                (duration ? "⏱️ " + duration + "\n" : "") +
                "\n▶️ " + youtubeUrl + "\n\n" +
                "_Player interaktif tidak didukung di perangkat ini._"
            );
        }

        try { await m.react("✅"); } catch {}

    } catch (err) {
        console.error("[ytplay error]", err);
        try { await m.react("❌"); } catch {}
        await m.reply("Gagal memutar video YouTube.\nError: " + err.message);
    }
};

handler.help = ["ytplay <judul/link>", "ytp <judul/link>"];
handler.tags = ["search"];
handler.command = /^(ytplay|ytp)$/i;

export default handler;