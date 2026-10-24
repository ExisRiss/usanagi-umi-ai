// plugins/pinlive.js
// Pinterest Live Search
// ESM Plugin
// By AlzRiss - Usanagi Umi AI

'use strict'

import axios from 'axios'
import https from 'https'

const agent = new https.Agent({
    rejectUnauthorized: true,
    maxVersion: 'TLSv1.3',
    minVersion: 'TLSv1.2',
    keepAlive: true
})

const DEFAULT_COUNT = 20
const MAX_COUNT = 100

// ============================================================
// PINTEREST COOKIES
// ============================================================

async function getCookies() {
    try {
        const response = await axios.get(
            'https://www.pinterest.com/csrf_error/',
            {
                httpsAgent: agent,
                timeout: 15000,
                headers: {
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                        '(KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
                }
            }
        )

        const setCookieHeaders = response.headers['set-cookie']

        if (!setCookieHeaders?.length) return null

        return setCookieHeaders
            .map(cookie => cookie.split(';')[0].trim())
            .join('; ')
    } catch {
        return null
    }
}

// ============================================================
// PINTEREST SCRAPER
// ============================================================

async function pinterest(query, limit = DEFAULT_COUNT) {
    try {
        const cookies = await getCookies()

        if (!cookies) return []

        const url =
            'https://www.pinterest.com/resource/BaseSearchResource/get/'

        const encodedQuery = encodeURIComponent(query)

        const params = {
            source_url: `/search/pins/?q=${encodedQuery}`,
            data: JSON.stringify({
                options: {
                    isPrefetch: false,
                    query,
                    scope: 'pins',
                    no_fetch_context_on_resource: false
                },
                context: {}
            }),
            _: Date.now()
        }

        const headers = {
            accept: 'application/json, text/javascript, */*, q=0.01',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'en-US,en;q=0.9',
            cookie: cookies,
            dnt: '1',
            referer: 'https://www.pinterest.com/',
            'sec-ch-ua':
                '"Not(A:Brand";v="99", "Microsoft Edge";v="133", "Chromium";v="133"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                '(KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0',
            'x-app-version': 'c056fb7',
            'x-pinterest-appstate': 'active',
            'x-pinterest-pws-handler':
                'www/[username]/[slug].js',
            'x-requested-with': 'XMLHttpRequest'
        }

        const response = await axios.get(url, {
            httpsAgent: agent,
            headers,
            params,
            timeout: 20000,
            decompress: true,
            validateStatus: status =>
                status >= 200 && status < 400
        })

        const results =
            response?.data?.resource_response?.data?.results

        if (!Array.isArray(results)) return []

        const output = []

        for (const result of results) {
            if (!result?.images?.orig?.url) continue

            const image =
                result.images.orig.url

            const thumbnail =
                result.images['236x']?.url ||
                result.images['474x']?.url ||
                image

            const pinner =
                result.pinner || {}

            const id = result.id

            output.push({
                id,
                image,
                thumbnail,
                upload_by:
                    pinner.username ||
                    'unknown',
                fullname:
                    pinner.full_name ||
                    pinner.username ||
                    'Pinterest User',
                followers:
                    pinner.follower_count ||
                    0,
                caption:
                    result.grid_title ||
                    result.title ||
                    '',
                description:
                    result.description ||
                    '',
                source:
                    id
                        ? `https://id.pinterest.com/pin/${id}/`
                        : 'https://id.pinterest.com/'
            })

            if (output.length >= limit) break
        }

        return output
    } catch (error) {
        console.error(
            '[PINLIVE]',
            error?.message || error
        )
        return []
    }
}

// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

// ============================================================
// NUMBER FORMAT
// ============================================================

function formatNumber(number) {
    number = Number(number) || 0

    if (number >= 1000000) {
        return (
            (number / 1000000)
                .toFixed(1)
                .replace('.0', '') +
            'M'
        )
    }

    if (number >= 1000) {
        return (
            (number / 1000)
                .toFixed(1)
                .replace('.0', '') +
            'K'
        )
    }

    return String(number)
}

// ============================================================
// CARD BUILDER
// ============================================================

function buildCards(results) {
    return results
        .map((item, index) => {
            const image = escapeHTML(item.image)
            const thumb = escapeHTML(item.thumbnail)
            const source = escapeHTML(item.source)

            const fullname =
                escapeHTML(item.fullname)

            const username =
                escapeHTML(item.upload_by)

            const caption =
                escapeHTML(item.caption)

            const followers =
                formatNumber(item.followers)

            return `
<article
    class="pin-card"
    data-index="${index}"
    data-source="${source}"
>
    <div class="image-wrap">
        <img
            class="pin-image lazy"
            src="${thumb}"
            data-src="${image}"
            alt="${caption || fullname}"
            loading="lazy"
            decoding="async"
            draggable="false"
        >

        <div class="image-loader">
            <span></span>
        </div>

        <button
            class="zoom-btn"
            type="button"
            onclick="openLightbox(${index})"
            aria-label="Zoom"
        >
            ⛶
        </button>
    </div>

    <div class="pin-info">

        <div class="user-row">

            <div class="avatar">
                ${fullname.charAt(0).toUpperCase()}
            </div>

            <div class="user-text">
                <div class="fullname">
                    ${fullname}
                </div>

                <div class="username">
                    @${username}
                    ${followers !== '0'
                        ? ` • ${followers} followers`
                        : ''}
                </div>
            </div>

        </div>

        ${
            caption
                ? `
        <div class="caption">
            ${caption}
        </div>
        `
                : ''
        }

        <a
            class="pin-link"
            href="${source}"
            target="_blank"
            rel="noopener noreferrer"
        >
            <span>📌</span>
            Open Pinterest
        </a>

    </div>
</article>
`
        })
        .join('')
}

// ============================================================
// HTML PAGE
// ============================================================

function createHTML(query, results) {
    const safeQuery =
        escapeHTML(query)

    const cards =
        buildCards(results)

    const jsonData =
        JSON.stringify(
            results.map(item => ({
                image: item.image,
                source: item.source,
                fullname: item.fullname,
                username: item.upload_by,
                caption: item.caption
            }))
        )
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/&/g, '\\u0026')

    return `<!DOCTYPE html>

<html lang="id">

<head>

<meta charset="UTF-8">

<meta
    name="viewport"
    content="width=device-width,
    initial-scale=1,
    maximum-scale=1,
    viewport-fit=cover"
>

<meta
    name="theme-color"
    content="#0d0710"
>

<title>PinLive — ${safeQuery}</title>

<style>

:root {
    --bg: #0d0710;
    --panel: #160c1b;
    --panel2: #211127;
    --text: #fff7fd;
    --muted: #bcaebe;
    --pink: #ff7eb6;
    --pink2: #ff4f9a;
    --purple: #9f7aea;
    --line: rgba(255,255,255,.09);
    --shadow: 0 15px 45px rgba(0,0,0,.35);
}

* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    -webkit-tap-highlight-color: transparent;
}

html {
    width: 100%;
    min-height: 100%;
    background: var(--bg);
    overflow-x: hidden;
    overflow-y: auto;
    scroll-behavior: smooth;
}

body {
    width: 100%;
    min-width: 0;
    min-height: 100dvh;
    margin: 0;
    background:
        radial-gradient(
            circle at 20% 0%,
            rgba(255,126,182,.12),
            transparent 32%
        ),
        radial-gradient(
            circle at 100% 20%,
            rgba(159,122,234,.09),
            transparent 30%
        ),
        var(--bg);

    color: var(--text);

    font-family:
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Roboto,
        Helvetica,
        Arial,
        sans-serif;

    overflow-x: hidden;
    overflow-y: auto;

    padding-bottom:
        calc(24px + env(safe-area-inset-bottom));
}

/* ============================= */
/* HEADER */
/* ============================= */

.header {
    position: sticky;
    top: 0;
    z-index: 50;

    width: 100%;

    padding:
        calc(13px + env(safe-area-inset-top))
        14px
        13px;

    background:
        rgba(13,7,16,.82);

    backdrop-filter:
        blur(18px);

    -webkit-backdrop-filter:
        blur(18px);

    border-bottom:
        1px solid var(--line);
}

.header-inner {
    width: 100%;
    max-width: 1100px;
    margin: auto;

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.brand {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
}

.logo {
    width: 42px;
    height: 42px;

    flex: 0 0 42px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 14px;

    background:
        linear-gradient(
            135deg,
            var(--pink2),
            var(--purple)
        );

    box-shadow:
        0 8px 25px
        rgba(255,79,154,.25);

    font-size: 22px;
}

.brand-text {
    min-width: 0;
}

.brand-title {
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -.3px;
}

.brand-sub {
    color: var(--muted);
    font-size: 11px;
    margin-top: 2px;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 220px;
}

.count {
    flex: 0 0 auto;

    padding: 7px 11px;

    border-radius: 999px;

    background: var(--panel2);

    border: 1px solid var(--line);

    color: #ffd7ea;

    font-size: 11px;
    font-weight: 700;
}

/* ============================= */
/* SEARCH INFO */
/* ============================= */

.hero {
    width: 100%;
    max-width: 1100px;

    margin: auto;

    padding:
        20px
        14px
        12px;
}

.search-label {
    color: var(--muted);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    font-weight: 700;
}

.query {
    margin-top: 5px;

    font-size: clamp(22px, 6vw, 34px);

    line-height: 1.12;

    font-weight: 900;

    overflow-wrap: anywhere;
}

.query::before {
    content: "“";
    color: var(--pink);
}

.query::after {
    content: "”";
    color: var(--pink);
}

.tip {
    margin-top: 9px;

    color: var(--muted);

    font-size: 12px;
    line-height: 1.5;
}

/* ============================= */
/* GALLERY */
/* ============================= */

.gallery {
    width: 100%;
    max-width: 1100px;

    margin: auto;

    padding:
        6px
        10px
        30px;

    columns: 2;
    column-gap: 9px;
}

.pin-card {
    display: inline-block;

    width: 100%;

    margin:
        0
        0
        10px;

    break-inside: avoid;

    overflow: hidden;

    background:
        linear-gradient(
            180deg,
            rgba(255,255,255,.045),
            rgba(255,255,255,.018)
        );

    border:
        1px solid var(--line);

    border-radius: 16px;

    box-shadow: var(--shadow);

    vertical-align: top;

    transition:
        transform .2s ease,
        border-color .2s ease;
}

.pin-card:active {
    transform: scale(.985);
}

.image-wrap {
    position: relative;

    width: 100%;

    overflow: hidden;

    background:
        linear-gradient(
            135deg,
            #211127,
            #100914
        );
}

.pin-image {
    display: block;

    width: 100%;
    height: auto;

    min-height: 100px;

    object-fit: cover;

    opacity: 0;

    transition:
        opacity .3s ease,
        transform .35s ease;
}

.pin-image.loaded {
    opacity: 1;
}

.pin-card:hover .pin-image {
    transform: scale(1.025);
}

.image-loader {
    position: absolute;

    inset: 0;

    display: flex;

    align-items: center;
    justify-content: center;

    pointer-events: none;
}

.image-loader span {
    width: 22px;
    height: 22px;

    border-radius: 50%;

    border:
        2px solid
        rgba(255,255,255,.15);

    border-top-color:
        var(--pink);

    animation:
        spin .7s linear infinite;
}

.pin-image.loaded + .image-loader {
    display: none;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.zoom-btn {
    position: absolute;

    right: 8px;
    top: 8px;

    width: 32px;
    height: 32px;

    border: 0;

    border-radius: 50%;

    background:
        rgba(0,0,0,.55);

    color: white;

    backdrop-filter:
        blur(8px);

    font-size: 17px;

    cursor: pointer;

    opacity: .9;
}

/* ============================= */
/* INFO */
/* ============================= */

.pin-info {
    padding: 10px;
}

.user-row {
    display: flex;
    align-items: center;

    gap: 8px;
}

.avatar {
    width: 30px;
    height: 30px;

    flex: 0 0 30px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 50%;

    background:
        linear-gradient(
            135deg,
            var(--pink2),
            var(--purple)
        );

    font-size: 12px;
    font-weight: 900;
}

.user-text {
    min-width: 0;
}

.fullname {
    font-size: 11px;
    font-weight: 800;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.username {
    margin-top: 1px;

    color: var(--muted);

    font-size: 9px;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.caption {
    margin-top: 8px;

    color: #e9dce8;

    font-size: 10px;

    line-height: 1.4;

    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;

    overflow: hidden;
}

.pin-link {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 5px;

    width: 100%;

    margin-top: 9px;

    padding: 7px 8px;

    border-radius: 9px;

    background:
        rgba(255,126,182,.08);

    border:
        1px solid
        rgba(255,126,182,.14);

    color: #ffb9d8;

    text-decoration: none;

    font-size: 9px;
    font-weight: 800;
}

/* ============================= */
/* LIGHTBOX */
/* ============================= */

.lightbox {
    position: fixed;
    inset: 0;
    z-index: 999;
    display: none;
    align-items: center;
    justify-content: center;
    padding: calc(20px + env(safe-area-inset-top)) 14px calc(20px + env(safe-area-inset-bottom));
    background: rgba(4,2,6,.94);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    flex-direction: column;
}

.lightbox.show {
    display: flex;
}

.lightbox img {
    display: block;
    max-width: 100%;
    max-height: 75dvh;
    width: auto;
    height: auto;
    object-fit: contain;
    border-radius: 14px;
    box-shadow: 0 30px 80px rgba(0,0,0,.65);
}

.close-lightbox {
    position: fixed;
    top: calc(12px + env(safe-area-inset-top));
    right: 12px;
    width: 42px;
    height: 42px;
    border: 0;
    border-radius: 50%;
    background: rgba(255,255,255,.1);
    color: white;
    font-size: 22px;
    cursor: pointer;
    z-index: 1000;
}

/* TOMBOL DOWNLOAD */
.download-btn {
    margin-top: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    border-radius: 99px;
    background: var(--pink2);
    color: white;
    border: none;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    text-decoration: none;
    box-shadow: 0 5px 15px rgba(255,79,154,.4);
    transition: transform 0.2s;
}

.download-btn:active {
    transform: scale(0.95);
}

/* TOMBOL SCROLL MELAYANG */
.fab-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    z-index: 90;
}

.fab {
    width: 45px;
    height: 45px;
    background: rgba(22, 12, 27, 0.8);
    border: 1px solid var(--line);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--pink);
    backdrop-filter: blur(5px);
    cursor: pointer;
    font-size: 18px;
    box-shadow: var(--shadow);
    transition: background 0.2s;
}

.fab:active {
    background: var(--panel2);
}

/* ============================= */
/* FOOTER */
/* ============================= */

.footer {
    width: 100%;
    max-width: 1100px;
    margin: auto;
    padding: 10px 14px 25px;
    text-align: center;
    color: var(--muted);
    font-size: 10px;
}

.footer b {
    color: #ff9fc5;
}

/* ============================= */
/* RESPONSIVE */
/* ============================= */

@media (min-width: 600px) {
    .gallery { columns: 3; column-gap: 12px; padding-left: 14px; padding-right: 14px; }
    .pin-card { margin-bottom: 12px; }
}

@media (min-width: 900px) {
    .gallery { columns: 4; column-gap: 14px; }
    .pin-card { margin-bottom: 14px; border-radius: 18px; }
    .pin-card:hover { border-color: rgba(255,126,182,.22); }
    .hero { padding-top: 28px; }
}

@media (max-width: 340px) {
    .gallery { columns: 1; padding-left: 12px; padding-right: 12px; }
    .brand-sub { max-width: 150px; }
}

@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        scroll-behavior: auto !important;
        animation-duration: .01ms !important;
        transition-duration: .01ms !important;
    }
}

</style>

</head>

<body>

<header class="header">
    <div class="header-inner">
        <div class="brand">
            <div class="logo">📌</div>
            <div class="brand-text">
                <div class="brand-title">PinLive</div>
                <div class="brand-sub">Pinterest Search • AlzRiss Edition</div>
            </div>
        </div>
        <div class="count">${results.length} PIN</div>
    </div>
</header>

<main>
<section class="hero">
    <div class="search-label">Pinterest Search</div>
    <div class="query">${safeQuery}</div>
    <div class="tip">✨ Geser ke bawah untuk melihat semua hasil. Tap gambar untuk memperbesar.</div>
</section>

<section class="gallery" id="gallery">
    ${cards}
</section>
</main>

<footer class="footer">
    Made with 💗 by <b>AlzRiss</b> • PinLive
</footer>

<div class="fab-container">
    <div class="fab" onclick="window.scrollTo({top: 0, behavior: 'smooth'})" title="Scroll ke Atas">▲</div>
    <div class="fab" onclick="window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})" title="Scroll ke Bawah">▼</div>
</div>

<div class="lightbox" id="lightbox" onclick="closeLightbox(event)">
    <button class="close-lightbox" onclick="closeLightbox()" aria-label="Close">×</button>
    <img id="lightboxImage" src="" alt="Pinterest Image">
    <button class="download-btn" onclick="downloadImage()">⬇️ Unduh Gambar</button>
</div>

<script>
const DATA = ${jsonData};
const images = document.querySelectorAll('.pin-image');
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        const realSrc = img.dataset.src;
        if (!realSrc) return;
        img.src = realSrc;
        img.onload = () => { img.classList.add('loaded'); };
        img.onerror = () => { img.style.opacity = '0.35'; };
        observer.unobserve(img);
    });
}, { rootMargin: '500px 0px' });

images.forEach(img => { observer.observe(img); });

function openLightbox(index) {
    const item = DATA[index];
    if (!item) return;
    const box = document.getElementById('lightbox');
    const image = document.getElementById('lightboxImage');
    image.src = item.image;
    image.alt = item.caption || item.fullname || 'Pinterest';
    box.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeLightbox(event) {
    if (event && event.target && event.target.id !== 'lightbox' && !event.target.classList.contains('close-lightbox') && !event.target.classList.contains('download-btn')) {
        return;
    }
    const box = document.getElementById('lightbox');
    box.classList.remove('show');
    document.body.style.overflow = '';
}

function downloadImage() {
    const imageSrc = document.getElementById('lightboxImage').src;
    if(!imageSrc) return;
    const a = document.createElement('a');
    a.href = imageSrc;
    a.target = '_blank';
    a.download = 'PinLive_AlzRiss_' + Date.now() + '.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeLightbox();
});

document.addEventListener('dragstart', event => {
    if (event.target.tagName === 'IMG') event.preventDefault();
});
</script>
</body>
</html>`
}

// ============================================================
// SEND HTML (MENGGUNAKAN AIRICH RESPONSE)
// ============================================================

async function sendHTML(conn, chat, html, query, m) {
    try {
        const messageContent = {
            aiRichMessage: {
                template: {
                    body: {
                        text: `Pinterest Search: ${query}`
                    },
                    header: {
                        title: '📌 PinLive Gallery',
                        subtitle: 'AlzRiss Edition • Pinterest Live'
                    }
                },
                buttonParamsJson: JSON.stringify({
                    display_text: 'Buka PinLive',
                    url: 'about:blank'
                }),
                nativeFlowMessage: {
                    messageParamsJson: JSON.stringify({
                        html: html
                    })
                }
            }
        }

        if (typeof conn.generateWAMessageFromContent === 'function') {
            constWAMessage = await conn.generateWAMessageFromContent(chat, messageContent, { quoted: m })
            await conn.relayMessage(chat, constWAMessage.message, { messageId: constWAMessage.key.id })
            return true
        }

        await conn.relayMessage(chat, messageContent, { messageId: `${Date.now()}` })
        return true

    } catch (error) {
        console.error('[PINLIVE SEND ERROR]', error?.message || error)
        return false
    }
}

// ============================================================
// HANDLER
// ============================================================

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text?.trim()) {
        return m.reply(
`📌 *PinLive*

Cari gambar Pinterest dalam viewer HTML.

*Penggunaan:*
${usedPrefix + command} <query> <jumlah>

*Contoh:*
${usedPrefix + command} ryo yamada
${usedPrefix + command} usanagi forger 20
${usedPrefix + command} anime wallpaper 30

✨ Hasil bisa di-scroll sampai bawah.`
        )
    }

    let input = text.trim()
    let count = DEFAULT_COUNT

    const match = input.match(/\s+(\d+)\s*$/)
    if (match) {
        count = parseInt(match[1], 10)
        input = input.slice(0, match.index).trim()
    }

    if (!input) {
        return m.reply(`Query Pinterest-nya mana? 🤔`)
    }

    if (!Number.isFinite(count) || count < 1) {
        count = DEFAULT_COUNT
    }
    count = Math.min(count, MAX_COUNT)

    await m.reply(`📌 *PinLive*\n\n🔎 Mencari *${input}*...\n⏳ Tunggu sebentar yaa~`)

    try {
        const results = await pinterest(input, count)

        if (!results.length) {
            return m.reply(
`❌ *Tidak ada hasil.*

Query: ${input}

Coba kata kunci lain yaa~`
            )
        }

        const html = createHTML(input, results)

        const sent = await sendHTML(
            conn,
            m.chat,
            html,
            input,
            m
        )

        if (!sent) {
            return m.reply(
`⚠️ *PinLive gagal dibuka.*

Pinterest berhasil mendapatkan ${results.length} gambar, tetapi fitur Airich response gagal merespons.`
            )
        }

    } catch (error) {
        console.error('[PINLIVE ERROR]', error)
        return m.reply(
`❌ *Terjadi kesalahan.*

Pinterest sedang tidak bisa diakses atau responsnya berubah.
Coba beberapa saat lagi yaa~`
        )
    }
}

// ============================================================
// COMMAND CONFIG
// ============================================================

handler.help = ['pinlive <query> <jumlah>']
handler.tags = ['search']
handler.command = ['pinlive', 'pinlive2']
handler.limit = true
handler.register = true

export default handler