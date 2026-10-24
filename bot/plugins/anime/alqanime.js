/*
╭──────────────────────────────────────────────╮
│       USANAGI UMI AI — ALQANIME AUTO UPDATE         │
│                                              │
│ .alqanime on      → Aktifkan auto update     │
│ .alqanime off     → Matikan auto update      │
│ .alqanime status  → Cek status               │
│ .alqanime test    → Tes API AlqAnime         │
╰──────────────────────────────────────────────╯
*/

import fs from 'fs'
import path from 'path'
import axios from 'axios'

const API = 'https://www.sankavollerei.web.id/anime/alqanime'

const DATA_DIR = path.join(process.cwd(), 'database')
const DATA_FILE = path.join(DATA_DIR, 'alqanime.json')

const CHECK_INTERVAL = 5 * 60 * 1000

// JUMLAH UPDATE MAKSIMAL SETIAP PENGECEKAN
const MAX_UPDATE = 10

let activeConn = null
let watcherStarted = false
let checking = false

// ==========================================
// DATABASE
// ==========================================

function ensureDatabase() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true })
    }

    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify({
                groups: {},
                seen: {}
            }, null, 2)
        )
    }
}

function loadData() {
    ensureDatabase()

    try {
        const data = JSON.parse(
            fs.readFileSync(DATA_FILE, 'utf8')
        )

        if (!data.groups) data.groups = {}
        if (!data.seen) data.seen = {}

        return data
    } catch (e) {
        return {
            groups: {},
            seen: {}
        }
    }
}

function saveData(data) {
    ensureDatabase()

    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(data, null, 2)
    )
}

// ==========================================
// API ALQANIME
// ==========================================

async function getLatest() {
    const response = await axios.get(
        `${API}/home`,
        {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        }
    )

    if (
        !response.data ||
        response.data.status !== 'success' ||
        !response.data.data ||
        !Array.isArray(response.data.data.latest)
    ) {
        throw new Error('Format API AlqAnime tidak valid')
    }

    return response.data.data.latest
}

async function getDetail(slug) {
    const response = await axios.get(
        `${API}/detail/${encodeURIComponent(slug)}`,
        {
            timeout: 30000,
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        }
    )

    if (
        !response.data ||
        response.data.status !== 'success' ||
        !response.data.data
    ) {
        throw new Error('Detail anime tidak ditemukan')
    }

    return response.data.data
}

// ==========================================
// FORMAT DOWNLOAD
// ==========================================

function formatDownloads(detail) {

    if (
        !detail.downloads ||
        !Array.isArray(detail.downloads)
    ) {
        return ''
    }

    let text = ''

    for (const episode of detail.downloads) {

        text += `\n📥 *${episode.title || 'Download'}*\n`

        if (!Array.isArray(episode.links))
            continue

        for (const quality of episode.links) {

            text += `\n🎞️ *${quality.resolution || 'Unknown'}*\n`

            if (!Array.isArray(quality.urls))
                continue

            for (const server of quality.urls) {

                if (!server.url)
                    continue

                text +=
                    `• ${server.server || 'Server'}: ${server.url}\n`
            }
        }
    }

    return text
}

// ==========================================
// FORMAT PESAN
// ==========================================

function createMessage(item, detail) {

    const title =
        detail.title ||
        item.title ||
        'Anime terbaru'

    const poster =
        detail.poster ||
        item.poster ||
        null

    const originalUrl =
        item.url ||
        `https://alqanime.net/${item.slug}/`

    const info = detail.info || {}

    let text =
        `╭━━━〔 *ALQANIME UPDATE* 〕━━━╮\n`

    text += `┃ 🎬 *${title}*\n`

    if (info.status)
        text += `┃ 📌 Status: ${info.status}\n`

    if (info.tipe)
        text += `┃ 📺 Tipe: ${info.tipe}\n`

    if (info.musim)
        text += `┃ 🍂 Musim: ${info.musim}\n`

    if (info.dirilis)
        text += `┃ 📅 Tahun: ${info.dirilis}\n`

    if (info.studio)
        text += `┃ 🏢 Studio: ${info.studio}\n`

    text +=
        `╰━━━━━━━━━━━━━━━━━━━━━━╯\n`

    if (detail.synopsis) {

        text +=
            `\n📝 *Sinopsis*\n` +
            `${detail.synopsis}\n`
    }

    text +=
        `\n🌐 *AlqAnime:*\n` +
        `${originalUrl}\n`

    // DOWNLOAD TETAP DISATUKAN DI PESAN YANG SAMA
    text += formatDownloads(detail)

    return {
        text,
        poster
    }
}

// ==========================================
// KIRIM UPDATE
// ==========================================

async function sendAnime(conn, jid, item) {

    try {

        const detail =
            await getDetail(item.slug)

        const result =
            createMessage(item, detail)

        if (result.poster) {

            await conn.sendMessage(
                jid,
                {
                    image: {
                        url: result.poster
                    },
                    caption: result.text
                }
            )

        } else {

            await conn.sendMessage(
                jid,
                {
                    text: result.text
                }
            )
        }

        console.log(
            `[ALQANIME] Terkirim: ${item.title} -> ${jid}`
        )

        return true

    } catch (error) {

        console.error(
            `[ALQANIME] Gagal mengirim ${item.title}:`,
            error?.message || error
        )

        /*
         * FALLBACK
         *
         * Kalau detail gagal, tetap coba kirim
         * informasi dasar dari /home.
         */
        try {

            const url =
                item.url ||
                `https://alqanime.net/${item.slug}/`

            const fallbackText =
                `╭━━━〔 *ALQANIME UPDATE* 〕━━━╮\n` +
                `┃ 🎬 *${item.title}*\n` +
                `┃ 📺 ${item.episode || ''}\n` +
                `╰━━━━━━━━━━━━━━━━━━━━━━╯\n\n` +
                `🌐 *AlqAnime:*\n${url}`

            if (item.poster) {

                await conn.sendMessage(
                    jid,
                    {
                        image: {
                            url: item.poster
                        },
                        caption: fallbackText
                    }
                )

            } else {

                await conn.sendMessage(
                    jid,
                    {
                        text: fallbackText
                    }
                )
            }

            /*
             * Fallback berhasil.
             */
            return true

        } catch (sendError) {

            console.error(
                '[ALQANIME] Gagal mengirim fallback:',
                sendError?.message || sendError
            )

            return false
        }
    }
}

// ==========================================
// CEK UPDATE OTOMATIS
// ==========================================

async function checkUpdates() {

    if (!activeConn) {
        console.log(
            '[ALQANIME] Menunggu koneksi WhatsApp...'
        )
        return
    }

    if (checking) {
        console.log(
            '[ALQANIME] Pengecekan sebelumnya masih berjalan.'
        )
        return
    }

    const data = loadData()

    const enabledGroups =
        Object.keys(data.groups)
            .filter(
                jid => data.groups[jid] === true
            )

    if (!enabledGroups.length) {

        console.log(
            '[ALQANIME] Tidak ada grup yang mengaktifkan auto update.'
        )

        return
    }

    checking = true

    try {

        console.log(
            '[ALQANIME] Mengecek anime terbaru...'
        )

        const latest =
            await getLatest()

        if (!latest.length) {

            console.log(
                '[ALQANIME] Tidak ada data terbaru.'
            )

            return
        }

        /*
         * ======================================
         * CARI UPDATE YANG BELUM TERKIRIM
         * ======================================
         *
         * Tidak lagi menggunakan:
         *
         * latest.slice(0, 10)
         *
         * karena itu bisa membuat update lama
         * terlewat kalau ada banyak anime baru.
         *
         * Sekarang kita cari semua yang belum
         * pernah dikirim, lalu ambil maksimal 10.
         */

        const newItems = []

        for (const item of latest) {

            if (!item?.slug)
                continue

            const episode =
                item.episode ||
                item.title ||
                ''

            const updateId =
                `${item.slug}|${episode}`

            if (data.seen[updateId])
                continue

            newItems.push({
                item,
                updateId
            })

            if (
                newItems.length >=
                MAX_UPDATE
            ) {
                break
            }
        }

        if (!newItems.length) {

            console.log(
                '[ALQANIME] Tidak ada update baru.'
            )

            return
        }

        console.log(
            `[ALQANIME] Ditemukan ${newItems.length} update baru.`
        )

        /*
         * ======================================
         * KIRIM KE SETIAP GRUP
         * ======================================
         */

        for (const entry of newItems) {

            const item =
                entry.item

            console.log(
                `[ALQANIME] Update baru: ${item.title} ${item.episode || ''}`
            )

            let berhasilSemua = true

            for (const jid of enabledGroups) {

                try {

                    const success =
                        await sendAnime(
                            activeConn,
                            jid,
                            item
                        )

                    if (!success) {

                        berhasilSemua = false

                        console.log(
                            `[ALQANIME] Gagal mengirim ${item.title} ke ${jid}`
                        )
                    }

                    /*
                     * Jeda antar anime.
                     */
                    await new Promise(
                        resolve =>
                            setTimeout(
                                resolve,
                                1500
                            )
                    )

                } catch (error) {

                    berhasilSemua = false

                    console.error(
                        `[ALQANIME] Error kirim ${jid}:`,
                        error?.message || error
                    )
                }
            }

            /*
             * PENTING:
             *
             * Anime hanya dianggap sudah terkirim
             * kalau berhasil dikirim.
             *
             * Kalau gagal, pengecekan berikutnya
             * akan mencoba lagi.
             */
            if (berhasilSemua) {

                data.seen[
                    entry.updateId
                ] = Date.now()

                saveData(data)

                console.log(
                    `[ALQANIME] Ditandai terkirim: ${item.title}`
                )

            } else {

                console.log(
                    `[ALQANIME] ${item.title} akan dicoba lagi.`
                )
            }
        }

        /*
         * ======================================
         * HAPUS HISTORY > 30 HARI
         * ======================================
         */

        const expire =
            Date.now() -
            (30 * 24 * 60 * 60 * 1000)

        for (
            const key of Object.keys(data.seen)
        ) {

            if (
                data.seen[key] <
                expire
            ) {

                delete data.seen[key]
            }
        }

        saveData(data)

        console.log(
            '[ALQANIME] Pengecekan selesai.'
        )

    } catch (error) {

        console.error(
            '[ALQANIME] Error auto check:',
            error?.message || error
        )

    } finally {

        checking = false
    }
}

// ==========================================
// START WATCHER
// ==========================================

function startWatcher(conn) {

    activeConn = conn

    if (watcherStarted)
        return

    watcherStarted = true

    console.log(
        '[ALQANIME] Auto updater berhasil dimulai.'
    )

    console.log(
        '[ALQANIME] Interval: 5 menit.'
    )

    setTimeout(() => {

        checkUpdates()

    }, 10000)

    setInterval(() => {

        checkUpdates()

    }, CHECK_INTERVAL)
}

// ==========================================
// HANDLER
// ==========================================

const handler = async (
    m,
    {
        conn,
        args
    }
) => {

    startWatcher(conn)

    if (!m.isGroup) {

        return m.reply(
            '❌ Perintah ini hanya bisa digunakan di grup.'
        )
    }

    const action =
        (args?.[0] || 'status')
            .toLowerCase()

    const jid = m.chat

    const data =
        loadData()

    // ======================================
    // ON
    // ======================================

    if (action === 'on') {

        data.groups[jid] = true

        saveData(data)

        return m.reply(
            `✅ *ALQANIME AUTO UPDATE AKTIF*\n\n` +
            `📡 Grup ini sekarang menerima update otomatis.\n\n` +
            `⏱️ Pengecekan: setiap 5 menit\n` +
            `📦 Maksimal: 10 anime/update check\n` +
            `🌐 Source: AlqAnime\n\n` +
            `Gunakan *.alqanime off* untuk mematikan.`
        )
    }

    // ======================================
    // OFF
    // ======================================

    if (action === 'off') {

        data.groups[jid] = false

        saveData(data)

        return m.reply(
            `❌ *ALQANIME AUTO UPDATE DIMATIKAN*\n\n` +
            `Grup ini tidak akan menerima update otomatis.`
        )
    }

    // ======================================
    // STATUS
    // ======================================

    if (action === 'status') {

        const enabled =
            data.groups[jid] === true

        return m.reply(
            `📡 *ALQANIME STATUS*\n\n` +
            `Status: ${enabled ? '✅ AKTIF' : '❌ NONAKTIF'}\n` +
            `⏱️ Interval: 5 menit\n` +
            `📦 Maks/check: 10 anime\n` +
            `🌐 Source: AlqAnime\n` +
            `🤖 Watcher: ${watcherStarted ? '✅ Berjalan' : '❌ Belum berjalan'}`
        )
    }

    // ======================================
    // TEST
    // ======================================

    if (action === 'test') {

        try {

            await m.reply(
                '🔎 Mengambil anime terbaru dari AlqAnime...'
            )

            const latest =
                await getLatest()

            if (!latest.length) {

                return m.reply(
                    '❌ API AlqAnime tidak memberikan data terbaru.'
                )
            }

            const item =
                latest[0]

            await sendAnime(
                conn,
                jid,
                item
            )

        } catch (error) {

            console.error(
                '[ALQANIME TEST]',
                error
            )

            return m.reply(
                `❌ *Test AlqAnime gagal.*\n\n` +
                `Error: ${error?.message || error}`
            )
        }

        return
    }

    // ======================================
    // HELP
    // ======================================

    return m.reply(
        `📡 *ALQANIME AUTO UPDATE*\n\n` +
        `• .alqanime on\n` +
        `• .alqanime off\n` +
        `• .alqanime status\n` +
        `• .alqanime test`
    )
}

handler.help = [
    'alqanime on',
    'alqanime off',
    'alqanime status',
    'alqanime test'
]

handler.tags = [
    'anime'
]

handler.command =
    /^alqanime$/i

export default handler