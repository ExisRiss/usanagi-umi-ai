/*
 * Umi DB Mirror — penerima cadangan berkala di panel beyy.ikyhost.cloud.
 *
 * Menyimpan salinan arsip backup produksi (snapshot website, ekspor database
 * website, arsip bot, dan sesi jadibot) sebagai cermin yang bisa dipulihkan
 * bila server utama bermasalah. Produksi TIDAK bergantung pada layanan ini.
 *
 *   GET  /health                         → status (tanpa autentikasi)
 *   POST /mirror/:kind/:generation       → unggah arsip (Bearer token)
 *   GET  /mirror/list                    → daftar arsip tersimpan (Bearer)
 *   GET  /mirror/:kind/:generation       → unduh arsip (Bearer)
 *   DELETE /mirror/:kind/:generation     → hapus arsip (Bearer)
 *
 * Token dibaca dari ./service-token.txt (tidak masuk repo). Hanya memakai
 * modul bawaan Node agar start di egg Pterodactyl generik tanpa dependensi.
 */
import http from 'node:http'
import { spawn } from 'node:child_process'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { startGameServer, gameHandler, startGameCleanup } from './game.js'
import { SECURITY_HEADERS } from './security.js'

const PORT = Number(process.env.SERVER_PORT || process.env.PORT || 2016)
const ROOT = process.cwd()

/* ── Salin keluaran ke ./server.log ────────────────────────────────────────
 * Konsol WebSocket Wings kadang menolak koneksi dari luar (403), jadi log juga
 * ditulis ke berkas yang bisa dibaca lewat File Manager / Client API.
 */
try {
    const LOG_STREAM = fs.createWriteStream(path.join(ROOT, 'server.log'), { flags: 'a' })
    const originalLog = console.log.bind(console)
    console.log = (...args) => {
        const line = args.map((a) => (a instanceof Error ? a.stack || a.message : String(a))).join(' ')
        originalLog(line)
        try { LOG_STREAM.write(`${new Date().toISOString()} ${line}\n`) } catch {}
    }
    process.on('uncaughtException', (error) => console.log('[fatal] uncaughtException:', error.stack || error.message))
    process.on('unhandledRejection', (reason) => console.log('[fatal] unhandledRejection:', reason))
} catch {}

const DATA_DIR = path.join(ROOT, 'data')
const MAX_BYTES = 300 * 1024 * 1024
const KEEP_PER_KIND = 48
const KINDS = {
    website: '.tar.gz',
    'website-db': '.json.gz',
    bot: '.tar.gz',
    jadibot: '.tar.gz',
}

let TOKEN = ''
try { TOKEN = fs.readFileSync(path.join(ROOT, 'service-token.txt'), 'utf8').trim() } catch {}
if (!TOKEN) TOKEN = String(process.env.UMI_MIRROR_TOKEN || '').trim()

fs.mkdirSync(DATA_DIR, { recursive: true })

function kindDir(kind) {
    const dir = path.join(DATA_DIR, kind)
    fs.mkdirSync(dir, { recursive: true })
    return dir
}
function safeGeneration(value) {
    const generation = String(value || '')
    return /^[A-Za-z0-9][A-Za-z0-9_.-]{2,120}$/.test(generation) && !generation.includes('..') ? generation : null
}
function authorized(req) {
    if (!TOKEN) return false
    const supplied = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim()
    const a = Buffer.from(supplied)
    const b = Buffer.from(TOKEN)
    return a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b)
}
function sendJson(res, status, payload) {
    const body = JSON.stringify(payload)
    res.writeHead(status, { ...SECURITY_HEADERS, 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) })
    res.end(body)
}
function listKind(kind) {
    const dir = kindDir(kind)
    const ext = KINDS[kind]
    return fs.readdirSync(dir)
        .filter(name => name.endsWith(ext))
        .map(name => {
            const full = path.join(dir, name)
            const stat = fs.statSync(full)
            let meta = {}
            try { meta = JSON.parse(fs.readFileSync(full + '.json', 'utf8')) } catch {}
            return { generation: name.slice(0, -ext.length), bytes: stat.size, sha256: meta.sha256 || null, storedAt: meta.at || stat.mtime.toISOString() }
        })
        .sort((a, b) => String(b.generation).localeCompare(String(a.generation)))
}
function prune(kind) {
    const entries = listKind(kind)
    for (const stale of entries.slice(KEEP_PER_KIND)) {
        const full = path.join(kindDir(kind), stale.generation + KINDS[kind])
        try { fs.unlinkSync(full) } catch {}
        try { fs.unlinkSync(full + '.json') } catch {}
    }
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url || '/', 'http://localhost')
    const parts = url.pathname.split('/').filter(Boolean).map(decodeURIComponent)

    if (req.method === 'GET' && url.pathname === '/health') {
        const summary = {}
        for (const kind of Object.keys(KINDS)) { try { summary[kind] = listKind(kind).length } catch { summary[kind] = 0 } }
        return sendJson(res, 200, { ok: true, service: 'umi-db-mirror', time: new Date().toISOString(), archives: summary })
    }

    if (parts[0] !== 'mirror') return gameHandler(req, res)
    if (!authorized(req)) return sendJson(res, 401, { error: 'unauthorized' })

    if (req.method === 'GET' && parts[1] === 'list' && parts.length === 2) {
        const kinds = {}
        for (const kind of Object.keys(KINDS)) kinds[kind] = listKind(kind)
        return sendJson(res, 200, { kinds })
    }

    const kind = parts[1]
    const generation = safeGeneration(parts[2])
    if (!KINDS[kind] || !generation) return sendJson(res, 400, { error: 'kind/generation tidak valid' })
    const filePath = path.join(kindDir(kind), generation + KINDS[kind])

    if (req.method === 'POST' && parts.length === 3) {
        const tmpPath = filePath + `.tmp-${crypto.randomBytes(4).toString('hex')}`
        const hash = crypto.createHash('sha256')
        let bytes = 0
        let tooBig = false
        const out = fs.createWriteStream(tmpPath)
        req.on('data', chunk => {
            bytes += chunk.length
            if (bytes > MAX_BYTES) { tooBig = true; req.destroy(); return }
            hash.update(chunk)
            out.write(chunk)
        })
        req.on('error', () => { try { fs.unlinkSync(tmpPath) } catch {} })
        req.on('end', () => out.end())
        out.on('finish', () => {
            if (tooBig) { try { fs.unlinkSync(tmpPath) } catch {}; return sendJson(res, 413, { error: 'arsip terlalu besar' }) }
            try {
                fs.renameSync(tmpPath, filePath)
                const meta = { bytes, sha256: hash.digest('hex'), at: new Date().toISOString() }
                fs.writeFileSync(filePath + '.json', JSON.stringify(meta))
                prune(kind)
                console.log(`[mirror] tersimpan ${kind}/${generation} (${bytes} byte)`)
                return sendJson(res, 201, { ok: true, kind, generation, ...meta })
            } catch (error) {
                return sendJson(res, 500, { error: 'gagal menyimpan arsip' })
            }
        })
        return
    }

    if (req.method === 'GET' && parts.length === 3) {
        if (!fs.existsSync(filePath)) return sendJson(res, 404, { error: 'arsip tidak ditemukan' })
        const stat = fs.statSync(filePath)
        res.writeHead(200, { 'Content-Type': 'application/gzip', 'Content-Length': stat.size })
        fs.createReadStream(filePath).pipe(res)
        return
    }

    if (req.method === 'DELETE' && parts.length === 3) {
        try { fs.unlinkSync(filePath) } catch {}
        try { fs.unlinkSync(filePath + '.json') } catch {}
        return sendJson(res, 200, { ok: true })
    }

    return sendJson(res, 405, { error: 'method not allowed' })
})

// ── Cloudflare Tunnel supervisor ──────────────────────────────────────────
// Menjalankan cloudflared untuk tunnel `alzriss-okta` dari container yang
// sama. Token dibaca dari ./tunnel-token.txt. Bila binary belum ada, diunduh
// sekali dari rilis resmi Cloudflare. Konektor mati → dicoba lagi tiap 10 dtk.
const TUNNEL_TOKEN_FILE = path.join(ROOT, 'tunnel-token.txt')
const CLOUDFLARED_BIN = path.join(ROOT, 'cloudflared')

async function ensureCloudflared() {
    if (fs.existsSync(CLOUDFLARED_BIN)) {
        // Berkas yang diunggah lewat File Manager / Client API kehilangan bit
        // eksekusi, sehingga spawn gagal dengan EACCES. Dipulihkan di sini agar
        // biner hasil unggahan maupun hasil unduhan sama-sama jalan.
        try { fs.chmodSync(CLOUDFLARED_BIN, 0o755) } catch (error) { console.log('[tunnel] chmod cloudflared gagal:', error.message) }
        return
    }
    console.log('[tunnel] mengunduh cloudflared…')
    const response = await fetch('https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64', { redirect: 'follow' })
    if (!response.ok || !response.body) throw new Error(`unduh cloudflared gagal (${response.status})`)
    await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(CLOUDFLARED_BIN))
    fs.chmodSync(CLOUDFLARED_BIN, 0o755)
    console.log('[tunnel] cloudflared siap')
}

function startTunnel() {
    // Utamakan konfigurasi lokal (tunnel-config.yml + tunnel-creds.json):
    // mode token murni pada cloudflared modern menimpa ingress Cloudflare
    // dengan konfigurasi kosong (semua hostname jadi 503).
    const configFile = path.join(ROOT, 'tunnel-config.yml')
    const credsFile = path.join(ROOT, 'tunnel-creds.json')
    let args
    if (fs.existsSync(configFile) && fs.existsSync(credsFile)) {
        args = ['tunnel', '--no-autoupdate', '--config', configFile, 'run']
    } else {
        let token = ''
        try { token = fs.readFileSync(TUNNEL_TOKEN_FILE, 'utf8').trim() } catch {}
        if (!token) { console.log('[tunnel] token tidak ada — supervisor nonaktif'); return }
        args = ['tunnel', '--no-autoupdate', 'run', '--token', token]
    }
    const child = spawn(CLOUDFLARED_BIN, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    const forward = (stream, tag) => stream.on('data', chunk => {
        for (const line of String(chunk).split('\n')) if (line.trim()) console.log(`[tunnel] ${line.trim().slice(0, 200)}`)
    })
    forward(child.stdout); forward(child.stderr)
    child.on('exit', (code) => {
        console.log(`[tunnel] cloudflared berhenti (kode ${code}) — mencoba lagi 10 detik`)
        setTimeout(startTunnel, 10_000)
    })
    child.on('error', (error) => console.log('[tunnel] gagal start:', error.message))
}

ensureCloudflared().then(startTunnel).catch(error => console.log('[tunnel] supervisor gagal:', error.message))

// ── Placeholder untuk aplikasi lama ───────────────────────────────────────
// Ingress tunnel mengarah ke localhost port-port aplikasi deployer lama
// (3000/3200/3300/3500/3600/3700/3800). Selama aplikasinya belum dipasang di
// server ini, port-port itu dijawab halaman penampung yang sopan agar tidak
// tampil error 502/1033. Matikan dengan UMI_PLACEHOLDER=off bila aplikasi
// aslinya sudah dipasang.
if (String(process.env.UMI_PLACEHOLDER || 'on') !== 'off') {
    const placeholderHtml = `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Umi — Layanan Sedang Disiapkan</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#07111f;color:#e8efff;font-family:system-ui,sans-serif;padding:24px}.card{max-width:520px;background:linear-gradient(145deg,rgba(18,35,63,.94),rgba(10,23,43,.96));border:1px solid rgba(142,169,225,.25);border-radius:18px;padding:28px;box-shadow:0 14px 36px rgba(0,0,0,.35)}h1{margin:0 0 8px;font-size:22px}p{color:#9aaaca;line-height:1.6}a{color:#62d8ff}</style></head><body><div class="card"><h1>🌊 Umi Usanagi AI</h1><p>Domain ini sudah tersambung kembali ke server. Aplikasi di alamat ini sedang disiapkan dan akan segera aktif.</p><p>Kembali ke <a href="https://alzriss-comunity.vercel.app">website jadibot</a>.</p></div></body></html>`
    for (const port of [3000, 3200, 3300, 3500, 3600, 3700, 3800]) {
        const placeholder = http.createServer((req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
            res.end(placeholderHtml)
        })
        placeholder.on('error', (error) => console.log(`[placeholder] port ${port}: ${error.message}`))
        placeholder.listen(port, '127.0.0.1', () => console.log(`[placeholder] menjawab di 127.0.0.1:${port}`))
    }
}

server.listen(PORT, '0.0.0.0', () => {
    console.log(`[mirror] Umi DB Mirror aktif di 0.0.0.0:${PORT} (token ${TOKEN ? 'siap' : 'BELUM DIATUR'})`)
})

// Game terintegrasi di mirror server — gameHandler menangani semua non-/mirror
startGameCleanup()
