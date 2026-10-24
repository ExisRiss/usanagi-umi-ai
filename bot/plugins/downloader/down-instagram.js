/*
# Name : Instagram Downloader (Reel / Video / Photo / Carousel)
# Type : ESM
# API : SaveFromIns
# Url : https://savefromins.com
*/

import axios from 'axios'
import { Carousel, Button } from '../../lib/ui/MessageBuilder.js'

const SAVEFROM_API = 'https://api.savefromins.com/api/contentsite_api/media/parse'
const SAVEFROM_AUTH = '20250901majwlqo'
const SAVEFROM_DOMAIN = 'api-ak.savefromins.com'

const USER_AGENT =
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'

let handler = async (m, { conn, text }) => {
    if (!text) {
        throw 'Masukkan link Instagram yang ingin diunduh!\n\nContoh:\n.ig https://www.instagram.com/reel/xxxxx/'
    }

    const instagramUrl = extractInstagramUrl(text)

    if (!instagramUrl) {
        throw '❌ Link Instagram tidak valid!'
    }

    try {
        const data = await igdl(instagramUrl)

        if (!data) {
            throw new Error('Media tidak ditemukan')
        }

        // ==================================================
        // FIX SPAM: Batasi video untuk link Reel
        // ==================================================
        // Jika link adalah Reel/Reels, pastikan hanya ada 1 video.
        // API biasanya mengembalikan banyak link untuk 1 Reel (beda resolusi/segmen).
        if (/\/reels?\//i.test(instagramUrl) && data.videos.length > 1) {
            console.log(`[IGDL] Link Reel terdeteksi dengan ${data.videos.length} video. Membatasi hanya 1.`)
            data.videos = [data.videos[0]] // Hanya ambil video pertama
            data.type = 'video' // Paksa tipe menjadi video
        }

        const caption = data.caption || ''

        console.log(
            `[IGDL] type=${data.type} video=${data.videos.length} image=${data.images.length}`
        )

        // ==================================================
        // SINGLE VIDEO
        // ==================================================

        if (data.videos.length === 1 && data.images.length === 0) {
            const video = data.videos[0]

            return await conn.sendMessage(
                m.chat,
                {
                    video: { url: video },
                    caption
                },
                { quoted: m }
            )
        }

        // ==================================================
        // SINGLE IMAGE
        // ==================================================

        if (data.images.length === 1 && data.videos.length === 0) {
            const image = data.images[0]

            return await conn.sendMessage(
                m.chat,
                {
                    image: { url: image },
                    caption
                },
                { quoted: m }
            )
        }

        // ==================================================
        // CAROUSEL MIXED MEDIA
        // ==================================================

        if (data.type === 'carousel' || data.images.length + data.videos.length > 1) {
            return await sendCarouselMedia(
                conn,
                m,
                data
            )
        }

        // ==================================================
        // FALLBACK VIDEO
        // ==================================================

        if (data.videos.length) {
            return await conn.sendMessage(
                m.chat,
                {
                    video: { url: data.videos[0] },
                    caption
                },
                { quoted: m }
            )
        }

        // ==================================================
        // FALLBACK IMAGE
        // ==================================================

        if (data.images.length) {
            return await conn.sendMessage(
                m.chat,
                {
                    image: { url: data.images[0] },
                    caption
                },
                { quoted: m }
            )
        }

        throw new Error('Media tidak ditemukan')

    } catch (e) {
        console.error(
            '[IGDL ERROR]',
            e?.response?.data || e?.stack || e
        )

        const message =
            e?.response?.data?.message ||
            e?.response?.data?.error ||
            e?.message ||
            String(e)

        throw `❌ Gagal mengunduh Instagram\n\n${message}`
    }
}

handler.help = [
    'instagram',
    'ig',
    'igdl',
    'ighd'
]

handler.tags = ['downloader']

handler.command =
    /^(ig|instagram|igdl|ighd|instagramhd)$/i

handler.limit = 5
handler.register = true

export default handler


// ==========================================================
// INSTAGRAM DOWNLOADER
// ==========================================================

async function igdl(url) {
    console.log('[IGDL] Processing:', url)

    // ======================================================
    // INTERNAL SCRAPER
    // ======================================================

    const envData =
        typeof env !== 'undefined'
            ? env
            : {}

    const scraperBase =
        envData.SCRAPER_BASE
            ? String(envData.SCRAPER_BASE).replace(/\/+$/, '')
            : ''

    const scraperToken =
        envData.SCRAPER_TOKEN
            ? String(envData.SCRAPER_TOKEN)
            : ''

    if (scraperBase && scraperToken) {
        try {
            console.log('[IGDL] Trying internal scraper...')

            const response = await axios.get(
                `${scraperBase}/ig-meta`,
                {
                    params: {
                        url
                    },
                    headers: {
                        'X-Internal-Token': scraperToken,
                        'Accept': 'application/json'
                    },
                    timeout: 30000
                }
            )

            if (response.status >= 200 && response.status < 300) {
                const raw =
                    response.data?.item ||
                    response.data?.data ||
                    response.data

                const normalized =
                    normalizeAnyResponse(raw)

                if (
                    normalized.videos.length ||
                    normalized.images.length
                ) {
                    console.log('[IGDL] Internal scraper success')

                    return normalized
                }
            }
        } catch (e) {
            console.log(
                '[IGDL] Internal scraper failed:',
                e?.response?.status ||
                e?.message ||
                e
            )
        }
    }

    // ======================================================
    // SAVEFROMINS FALLBACK
    // ======================================================

    console.log('[IGDL] Trying SaveFromIns...')

    const result =
        await saveFromIns(url)

    if (
        result &&
        (
            result.videos.length ||
            result.images.length
        )
    ) {
        console.log(
            `[IGDL] SaveFromIns success: ${result.type}`
        )

        return result
    }

    throw new Error(
        'SaveFromIns tidak menemukan media Instagram'
    )
}


// ==========================================================
// SAVEFROMINS
// ==========================================================

async function saveFromIns(url) {
    const body = new URLSearchParams()

    body.set(
        'auth',
        SAVEFROM_AUTH
    )

    body.set(
        'domain',
        SAVEFROM_DOMAIN
    )

    body.set(
        'origin',
        'source'
    )

    body.set(
        'link',
        url
    )

    const response =
        await axios.post(
            SAVEFROM_API,
            body.toString(),
            {
                headers: {
                    'accept': '*/*',

                    'content-type':
                        'application/x-www-form-urlencoded',

                    'origin':
                        'https://savefromins.com',

                    'referer':
                        'https://savefromins.com/',

                    'user-agent':
                        USER_AGENT
                },

                timeout: 30000,

                maxContentLength:
                    10 * 1024 * 1024,

                maxBodyLength:
                    10 * 1024 * 1024
            }
        )

    const raw =
        response.data

    console.log(
        '[IGDL] SaveFromIns response received'
    )

    /*
     * SaveFromIns kadang memiliki struktur response
     * berbeda tergantung jenis media.
     *
     * Jadi jangan mengandalkan satu key saja.
     */

    const normalized =
        normalizeAnyResponse(raw)

    if (
        !normalized.videos.length &&
        !normalized.images.length
    ) {
        console.log(
            '[IGDL] Unknown SaveFromIns response:',
            JSON.stringify(raw).slice(0, 3000)
        )
    }

    return normalized
}


// ==========================================================
// NORMALIZER
// ==========================================================

function normalizeAnyResponse(data) {
    const videos = []
    const images = []

    let caption = ''
    let type = 'unknown'

    const visited =
        new Set()

    function addVideo(url) {
        if (!isMediaUrl(url)) return

        if (!videos.includes(url)) {
            videos.push(url)
        }
    }

    function addImage(url) {
        if (!isMediaUrl(url)) return

        if (!images.includes(url)) {
            images.push(url)
        }
    }

    function walk(value, depth = 0) {
        if (!value || depth > 15) return

        if (
            typeof value === 'string'
        ) {
            inspectUrl(value)
            return
        }

        if (
            typeof value !== 'object'
        ) {
            return
        }

        if (visited.has(value)) {
            return
        }

        visited.add(value)

        if (Array.isArray(value)) {
            for (const item of value) {
                walk(item, depth + 1)
            }

            return
        }

        // ----------------------------------------------
        // CAPTION
        // ----------------------------------------------

        if (!caption) {
            const possibleCaption =
                value.caption ||
                value.description ||
                value.text ||
                value.title

            if (
                typeof possibleCaption === 'string' &&
                possibleCaption.length > 0 &&
                possibleCaption.length < 5000 &&
                !looksLikeUrl(possibleCaption)
            ) {
                caption =
                    possibleCaption
            }
        }

        // ----------------------------------------------
        // TYPE
        // ----------------------------------------------

        const detectedType =
            value.type ||
            value.media_type ||
            value.mediaType ||
            value.kind

        if (
            typeof detectedType === 'string'
        ) {
            const lower =
                detectedType.toLowerCase()

            if (
                lower.includes('carousel')
            ) {
                type = 'carousel'
            } else if (
                lower.includes('video') ||
                lower.includes('reel')
            ) {
                if (type !== 'carousel') {
                    type = 'video'
                }
            } else if (
                lower.includes('image') ||
                lower.includes('photo')
            ) {
                if (type !== 'carousel') {
                    type = 'image'
                }
            }
        }

        // ----------------------------------------------
        // KNOWN VIDEO KEYS
        // ----------------------------------------------

        const videoKeys = [
            'video',
            'video_url',
            'videoUrl',
            'download',
            'download_url',
            'downloadUrl',
            'video_download',
            'videoDownload',
            'hd',
            'hd_url',
            'hdUrl',
            'url'
        ]

        for (const key of videoKeys) {
            const item =
                value[key]

            if (
                typeof item === 'string'
            ) {
                if (
                    isLikelyVideoUrl(item)
                ) {
                    addVideo(item)
                }
            } else if (
                item &&
                typeof item === 'object'
            ) {
                inspectMediaObject(
                    item
                )
            }
        }

        // ----------------------------------------------
        // KNOWN IMAGE KEYS
        // ----------------------------------------------

        const imageKeys = [
            'image',
            'image_url',
            'imageUrl',
            'thumbnail',
            'thumbnail_url',
            'thumbnailUrl',
            'display_url',
            'displayUrl',
            'photo',
            'photo_url',
            'photoUrl'
        ]

        for (const key of imageKeys) {
            const item =
                value[key]

            if (
                typeof item === 'string'
            ) {
                if (
                    isLikelyImageUrl(item)
                ) {
                    addImage(item)
                }
            } else if (
                item &&
                typeof item === 'object'
            ) {
                inspectMediaObject(
                    item
                )
            }
        }

        // ----------------------------------------------
        // RECURSIVE WALK
        // ----------------------------------------------

        for (const [key, child] of Object.entries(value)) {
            if (
                key === 'caption' ||
                key === 'description'
            ) {
                continue
            }

            walk(
                child,
                depth + 1
            )
        }
    }

    function inspectMediaObject(value) {
        if (!value) return

        if (
            typeof value === 'string'
        ) {
            inspectUrl(value)
            return
        }

        if (
            typeof value !== 'object'
        ) {
            return
        }

        const candidates = [
            value.url,
            value.src,
            value.href,
            value.download,
            value.download_url,
            value.video_url,
            value.videoUrl,
            value.image_url,
            value.imageUrl
        ]

        for (const url of candidates) {
            if (
                typeof url !== 'string'
            ) {
                continue
            }

            if (
                isLikelyVideoUrl(url)
            ) {
                addVideo(url)
            } else if (
                isLikelyImageUrl(url)
            ) {
                addImage(url)
            }
        }

        if (
            Array.isArray(value.urls)
        ) {
            for (const url of value.urls) {
                inspectUrl(url)
            }
        }

        if (
            Array.isArray(value.sources)
        ) {
            for (const source of value.sources) {
                inspectMediaObject(source)
            }
        }
    }

    function inspectUrl(value) {
        if (!isMediaUrl(value)) {
            return
        }

        if (
            isLikelyVideoUrl(value)
        ) {
            addVideo(value)
        } else if (
            isLikelyImageUrl(value)
        ) {
            addImage(value)
        }
    }

    walk(data)

    // ======================================================
    // FIX: DEDUPLIKASI URL (Mencegah link sama terkirim berkali-kali)
    // ======================================================
    function deduplicateUrls(urls) {
        const unique = []
        const seen = new Set()
        
        for (const url of urls) {
            try {
                const parsed = new URL(url)
                // Gunakan origin + pathname sebagai kunci, abaikan query params
                // karena API biasanya mengirim URL sama dengan ?bytestart= berbeda
                const key = parsed.origin + parsed.pathname
                if (!seen.has(key)) {
                    seen.add(key)
                    unique.push(url)
                }
            } catch {
                if (!seen.has(url)) {
                    seen.add(url)
                    unique.push(url)
                }
            }
        }
        return unique
    }

    const uniqueVideos = deduplicateUrls(videos)
    const uniqueImages = deduplicateUrls(images)
    
    videos.length = 0
    videos.push(...uniqueVideos)
    
    images.length = 0
    images.push(...uniqueImages)

    // ======================================================
    // TYPE DETECTION
    // ======================================================

    if (
        type === 'unknown'
    ) {
        if (
            videos.length &&
            images.length
        ) {
            type = 'carousel'
        } else if (
            videos.length
        ) {
            type = 'video'
        } else if (
            images.length
        ) {
            type = 'image'
        }
    }

    if (
        videos.length + images.length > 1
    ) {
        type = 'carousel'
    }

    /*
     * Thumbnail kadang ikut terbaca sebagai image.
     * Kalau ada video, buang image yang jelas merupakan
     * thumbnail dari video jika hanya ada satu image.
     */

    if (
        videos.length &&
        images.length === 1 &&
        type === 'video'
    ) {
        images.length = 0
    }

    return {
        type,
        caption,
        videos,
        images,
        raw: data
    }
}


// ==========================================================
// SEND CAROUSEL
// ==========================================================

async function sendCarouselMedia(
    conn,
    m,
    data
) {
    const total =
        data.images.length +
        data.videos.length

    /*
     * Kalau mixed media, kirim video terlebih dahulu.
     * Setelah itu foto dibuat dalam MessageBuilder Carousel.
     */

    if (data.videos.length) {
        for (
            let i = 0;
            i < data.videos.length;
            i++
        ) {
            const video =
                data.videos[i]

            try {
                await conn.sendMessage(
                    m.chat,
                    {
                        video: {
                            url: video
                        },

                        caption:
                            total === 1
                                ? data.caption
                                : `Instagram Video ${i + 1}/${data.videos.length}`
                    },
                    {
                        quoted: m
                    }
                )
            } catch (e) {
                console.error(
                    '[IGDL] Failed sending video:',
                    e?.message || e
                )
            }
        }
    }

    // ======================================================
    // NO IMAGES
    // ======================================================

    if (!data.images.length) {
        return
    }

    // ======================================================
    // ONE IMAGE
    // ======================================================

    if (
        data.images.length === 1
    ) {
        return await conn.sendMessage(
            m.chat,
            {
                image: {
                    url: data.images[0]
                },

                caption:
                    data.caption
            },
            {
                quoted: m
            }
        )
    }

    // ======================================================
    // MESSAGEBUILDER CAROUSEL
    // ======================================================

    let carousel

    try {
        carousel =
            new Carousel(conn)
                .setBody(
                    data.caption ||
                    `Instagram Downloader\n${data.images.length} foto ditemukan`
                )
                .setFooter(
                    'Geser untuk melihat semua foto'
                )
    } catch (e) {
        console.error(
            '[IGDL] Carousel init failed:',
            e?.message || e
        )

        return await sendImagesFallback(
            conn,
            m,
            data.images,
            data.caption
        )
    }

    for (
        let i = 0;
        i < data.images.length;
        i++
    ) {
        const image =
            data.images[i]

        try {
            const button =
                new Button(conn)
                    .setTitle(
                        `FOTO ${i + 1}/${data.images.length}`
                    )
                    .setBody(
                        'Instagram Downloader'
                    )
                    .setFooter(
                        'Download foto HD'
                    )
                    .setImage(
                        image
                    )
                    .addUrl(
                        'DOWNLOAD HD',
                        image
                    )

            const card =
                await button.toCard()

            carousel.addCard(card)

        } catch (e) {
            console.error(
                `[IGDL] Failed creating card ${i + 1}:`,
                e?.message || e
            )
        }
    }

    try {
        return await carousel.send(
            m.chat,
            {
                quoted: m
            }
        )
    } catch (e) {
        console.error(
            '[IGDL] Carousel send failed:',
            e?.message || e
        )

        return await sendImagesFallback(
            conn,
            m,
            data.images,
            data.caption
        )
    }
}


// ==========================================================
// IMAGE FALLBACK
// ==========================================================

async function sendImagesFallback(
    conn,
    m,
    images,
    caption = ''
) {
    for (
        let i = 0;
        i < images.length;
        i++
    ) {
        await conn.sendMessage(
            m.chat,
            {
                image: {
                    url: images[i]
                },

                caption:
                    i === 0
                        ? caption
                        : `Instagram Foto ${i + 1}/${images.length}`
            },
            {
                quoted: m
            }
        )
    }
}


// ==========================================================
// URL UTILITIES
// ==========================================================

function extractInstagramUrl(text) {
    if (!text) return null

    const match =
        String(text).match(
            /https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|reels|tv|stories)\/[^\s]+/i
        )

    if (!match) {
        return null
    }

    return cleanInstagramUrl(
        match[0]
    )
}


function cleanInstagramUrl(url) {
    try {
        const parsed =
            new URL(url)

        /*
         * Jangan buang query secara paksa.
         * Beberapa link Instagram membutuhkan parameter
         * tertentu untuk redirect/session.
         */

        return parsed.toString()
    } catch {
        return url
    }
}


function isMediaUrl(url) {
    if (
        typeof url !== 'string'
    ) {
        return false
    }

    if (
        !/^https?:\/\//i.test(url)
    ) {
        return false
    }

    if (
        url.length < 20
    ) {
        return false
    }

    /*
     * Jangan anggap URL Instagram page sebagai media.
     */

    if (
        /instagram\.com\/(?:p|reel|reels|tv|stories)\//i.test(url)
    ) {
        return false
    }

    return true
}


function looksLikeUrl(value) {
    return /^https?:\/\//i.test(
        String(value).trim()
    )
}


function isLikelyVideoUrl(url) {
    if (
        typeof url !== 'string'
    ) {
        return false
    }

    const lower =
        url.toLowerCase()

    // 1. Cek ekstensi video yang jelas
    if (
        /\.(mp4|m4v|mov|webm)(?:$|[?#])/i.test(lower)
    ) {
        return true
    }

    // 2. Cek indikator video
    if (
        lower.includes('.mp4') ||
        lower.includes('video=')
    ) {
        return true
    }

    // 3. Penanganan khusus CDN Instagram
    // Jangan asal tebak jika tidak ada ekstensi. Gambar sering memiliki /v/t51.
    if (
        lower.includes('cdninstagram') ||
        lower.includes('fbcdn.net')
    ) {
        // Hanya anggap video jika ada indikasi kuat (misal mp4 di path)
        if (
            lower.includes('mp4') ||
            lower.includes('/v/t50.')
        ) {
            return true
        }
        return false // Jika ragu, kembalikan false agar tidak salah kirim gambar sebagai video
    }

    return false
}


function isLikelyImageUrl(url) {
    if (
        typeof url !== 'string'
    ) {
        return false
    }

    const lower =
        url.toLowerCase()

    if (
        /\.(jpg|jpeg|png|webp|gif|avif)(?:$|[?#])/i.test(lower)
    ) {
        return true
    }

    if (
        lower.includes('image') ||
        lower.includes('thumbnail') ||
        lower.includes('jpg')
    ) {
        return true
    }

    /*
     * CDN Instagram sering tidak menggunakan extension.
     * Kalau bukan video dan URL terlihat seperti CDN media,
     * anggap sebagai image.
     */

    if (
        lower.includes('cdninstagram') ||
        lower.includes('fbcdn.net')
    ) {
        return !isLikelyVideoUrl(url)
    }

    return false
}