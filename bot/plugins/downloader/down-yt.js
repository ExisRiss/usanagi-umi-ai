// plugins/yt.mjs
// YouTube Downloader — Buttons YTMP3 / YTMP4
// Scraper: ymcdn (id.ytmp3.mobi)
// Search: yt-search
// Auto Compress MP4

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import yts from 'yt-search'
import sharp from 'sharp'
import { prepareWAMessageMedia } from '@rexxhayanasi/elaina-baileys'

// ============================================================
// CONSTANTS
// ============================================================

const BOT_NAME = 'USANAGI UMI AI'
const BOT_AUTHOR = global.brandCredit || 'By AlzRiss - Usanagi Umi AI'

// ============================================================
// FAKE QUOTED
// ============================================================

function getFakeQuoted() {
    return {
        key: {
            fromMe: false,
            participant: '0@s.whatsapp.net',
            remoteJid: 'status@broadcast'
        },
        message: {
            contactMessage: {
                displayName: `𖤛 ${BOT_NAME}`,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;AlzRiss,;;;\nFN:Usanagi Umi AI\nitem1.TEL;waid=13135550002:+1 (313) 555-0002\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
                sendEphemeral: true
            }
        }
    }
}

// ============================================================
// YOUTUBE ID EXTRACTOR
// ============================================================

function extractVideoId(url) {
    if (!url) return null
    let match = null

    if (url.includes('youtube.com/shorts/') || url.includes('youtu.be/')) {
        match = /\/([a-zA-Z0-9\-_]{11})/.exec(url)
    } else if (url.includes('youtube.com')) {
        match = /v=([a-zA-Z0-9\-_]{11})/.exec(url)
    } else {
        match = /[a-zA-Z0-9\-_]{11}/.exec(url)
    }

    return match ? match[1] : null
}

// ============================================================
// YMCDN SCRAPER
// ============================================================

async function scrapeYtmp3(youtubeUrl, format = 'mp3') {
    const videoId = extractVideoId(youtubeUrl)
    if (!videoId) {
        throw new Error('Invalid YouTube URL: Could not extract video ID.')
    }

    const lowerFormat = format.toLowerCase()
    if (lowerFormat !== 'mp3' && lowerFormat !== 'mp4') {
        throw new Error('Invalid format: Must be either "mp3" or "mp4".')
    }

    const headers = {
        'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        Origin: 'https://id.ytmp3.mobi',
        Referer: 'https://id.ytmp3.mobi/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site'
    }

    try {
        // 1. Init session
        const initUrl = `https://a.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Math.random()}`
        const initRes = await fetch(initUrl, { headers })

        if (!initRes.ok) {
            throw new Error(`Init request failed: ${initRes.status}`)
        }

        const initJson = await initRes.json()
        if (initJson.error > 0) {
            throw new Error(`Init API error: ${initJson.error}`)
        }

        // 2. Convert
        let convertUrl = initJson.convertURL
        let convertRequestUrl = `${convertUrl}&v=${videoId}&f=${lowerFormat}&_=${Math.random()}`
        let convertJson

        while (true) {
            const convertRes = await fetch(convertRequestUrl, { headers })
            if (!convertRes.ok) {
                throw new Error(`Convert request failed: ${convertRes.status}`)
            }

            convertJson = await convertRes.json()
            if (convertJson.error > 0) {
                throw new Error(`Convert API error: ${convertJson.error}`)
            }

            if (convertJson.redirect > 0 && convertJson.redirectURL) {
                convertRequestUrl = `${convertJson.redirectURL}&v=${videoId}&f=${lowerFormat}&_=${Math.random()}`
                continue
            }
            break
        }

        const progressUrl = convertJson.progressURL
        const downloadUrl = convertJson.downloadURL
        let title = convertJson.title || 'YouTube'

        if (!progressUrl) throw new Error('Missing progress URL.')
        if (!downloadUrl) throw new Error('Missing download URL.')

        // 3. Polling
        let progress = 0
        let pollCount = 0
        const maxPolls = 60

        while (progress < 3 && pollCount < maxPolls) {
            await new Promise(r => setTimeout(r, 1000))
            pollCount++

            const progressRes = await fetch(progressUrl, { headers })
            if (!progressRes.ok) {
                throw new Error(`Progress request failed: ${progressRes.status}`)
            }

            const progressJson = await progressRes.json()
            if (progressJson.error > 0) {
                throw new Error(`Progress API error: ${progressJson.error}`)
            }

            progress = progressJson.progress
            if (progressJson.title) title = progressJson.title
        }

        if (progress < 3) {
            throw new Error('Conversion timed out (60s).')
        }

        return {
            status: 'success',
            videoId,
            title,
            format: lowerFormat,
            downloadUrl
        }
    } catch (error) {
        return {
            status: 'error',
            message: error?.message || String(error)
        }
    }
}

// ============================================================
// DOWNLOAD BUFFER
// ============================================================

async function downloadBuffer(url) {
    const res = await fetch(url, {
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
            Referer: 'https://id.ytmp3.mobi/'
        }
    })

    if (!res.ok) throw new Error(`Download gagal, status: ${res.status}`)

    const arrayBuffer = await res.arrayBuffer()
    return Buffer.from(arrayBuffer)
}

// ============================================================
// FFMPEG HELPER
// ============================================================

function checkFFmpeg() {
    return new Promise(resolve => {
        const ffmpeg = spawn('ffmpeg', ['-version'])
        ffmpeg.on('error', () => resolve(false))
        ffmpeg.on('close', code => resolve(code === 0))
    })
}

function compressMP4(inputBuffer) {
    return new Promise((resolve, reject) => {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'usanagi-ytmp4-'))
        const inputPath = path.join(tempDir, 'input.mp4')
        const outputPath = path.join(tempDir, 'output.mp4')

        const cleanup = () => {
            try { if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath) } catch {}
            try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath) } catch {}
            try { fs.rmdirSync(tempDir) } catch {}
        }

        try {
            fs.writeFileSync(inputPath, inputBuffer)

            const args = [
                '-y',
                '-i', inputPath,
                '-c:v', 'libx264',
                '-vf', 'scale=w=1280:h=720:force_original_aspect_ratio=decrease:force_divisible_by=2',
                '-preset', 'veryfast',
                '-crf', '28',
                '-c:a', 'aac',
                '-b:a', '96k',
                '-pix_fmt', 'yuv420p',
                '-movflags', '+faststart',
                '-map_metadata', '-1',
                outputPath
            ]

            const ffmpeg = spawn('ffmpeg', args)
            let stderr = ''

            ffmpeg.stderr.on('data', d => { stderr += d.toString() })

            ffmpeg.on('error', err => {
                cleanup()
                reject(new Error(`FFmpeg gagal: ${err.message}`))
            })

            ffmpeg.on('close', code => {
                if (code !== 0) {
                    cleanup()
                    reject(new Error(`FFmpeg error (code ${code})`))
                    return
                }
                try {
                    if (!fs.existsSync(outputPath)) {
                        cleanup()
                        reject(new Error('File hasil tidak ditemukan.'))
                        return
                    }
                    const result = fs.readFileSync(outputPath)
                    cleanup()
                    resolve(result)
                } catch (e) {
                    cleanup()
                    reject(e)
                }
            })
        } catch (e) {
            cleanup()
            reject(e)
        }
    })
}

// ============================================================
// CLEAN FILENAME
// ============================================================

function cleanName(name = 'file') {
    return String(name)
        .replace(/[\\/:*?"<>|]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 150)
}

// ============================================================
// THUMBNAIL HELPERS
// ============================================================

async function getThumb(url) {
    try {
        if (!url) return Buffer.alloc(0)

        const res = await fetch(url)
        if (!res.ok) throw new Error('thumb fail')

        const raw = Buffer.from(await res.arrayBuffer())

        return await sharp(raw)
            .resize(1280, 720, { fit: 'cover', position: 'center' })
            .jpeg({ quality: 90 })
            .toBuffer()
    } catch (e) {
        console.error('Thumb Error:', e)
        return Buffer.alloc(0)
    }
}

async function getSmallThumbB64(url) {
    try {
        if (!url) return null

        const res = await fetch(url)
        if (!res.ok) throw new Error('small thumb fail')

        const raw = Buffer.from(await res.arrayBuffer())

        const small = await sharp(raw)
            .resize(300, 169, { fit: 'cover' })
            .jpeg({ quality: 70 })
            .toBuffer()

        return small.toString('base64')
    } catch {
        return null
    }
}

async function createHighQualityThumbnail(conn, thumb) {
    try {
        if (!thumb?.length) return null

        const { imageMessage } = await prepareWAMessageMedia(
            { image: thumb },
            {
                upload: conn.waUploadToServer,
                mediaTypeOverride: 'thumbnail-link'
            }
        )

        imageMessage.width = 1280
        imageMessage.height = 720

        return imageMessage
    } catch (e) {
        console.error('HQ Thumb Error:', e)
        return null
    }
}

// ============================================================
// RESOLVE VIDEO — yt-search only
// ============================================================

async function resolveVideo(text) {
    const isUrl = /youtube\.com|youtu\.be/i.test(text)

    let url = text
    let vid = null

    // ── Kalau bukan URL → search pake yt-search ──
    if (!isUrl) {
        try {
            const search = await yts(text)

            if (search?.videos?.length) {
                vid = search.videos[0]
                url = vid.url
            } else {
                // Coba search lagi dengan query yang lebih spesifik
                const search2 = await yts({ query: text, pages: 1 })
                if (search2?.videos?.length) {
                    vid = search2.videos[0]
                    url = vid.url
                }
            }
        } catch (e) {
            console.error('[yt-search] keyword search failed:', e.message)
        }

        if (!vid) {
            throw new Error(
                `Video "${text}" tidak ditemukan.\n\n` +
                `💡 Coba:\n` +
                `• Kirim URL YouTube langsung\n` +
                `• Cek ejaan keyword\n` +
                `• Pakai keyword yang lebih spesifik`
            )
        }
    }

    // ── Kalau URL → ambil metadata ──
    if (isUrl) {
        const videoId = extractVideoId(text)

        if (!videoId) {
            throw new Error('URL YouTube tidak valid')
        }

        // Coba yt-search by videoId
        try {
            const info = await yts({ videoId })

            if (info) {
                vid = info
            }
        } catch (e) {
            console.error('[yt-search] videoId lookup failed:', e.message)
        }

        // Fallback: yts(url)
        if (!vid) {
            try {
                const detail = await yts(text)
                if (detail?.videos?.length) {
                    vid = detail.videos[0]
                }
            } catch (e) {
                console.error('[yt-search] url lookup failed:', e.message)
            }
        }

        // Fallback manual (kalau yt-search gagal total)
        if (!vid) {
            vid = {
                videoId,
                url: `https://www.youtube.com/watch?v=${videoId}`,
                title: 'YouTube Video',
                timestamp: '-',
                views: 0,
                ago: '-',
                thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
                author: { name: '-' }
            }
        }
    }

    if (!vid) throw new Error('Video tidak ditemukan')

    // ── Normalisasi output ──
    const videoId = vid.videoId || extractVideoId(url)

    const thumbnail =
        vid.thumbnail ||
        (videoId ? `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg` : '')

    return {
        url: vid.url || url,
        videoId,
        title: vid.title || 'YouTube Video',
        timestamp: vid.timestamp || '-',
        views: vid.views || 0,
        ago: vid.ago || '-',
        thumbnail,
        author: vid.author?.name || vid.author || '-'
    }
}

// ============================================================
// SEND BUTTONS
// ============================================================

async function sendYtButtons(conn, m, vid, usedPrefix) {
    const smallThumb = await getSmallThumbB64(vid.thumbnail)

    const contentText = [
        `       ✩  ʏ ᴛ ᴅ ʟ  ✩`,
        `      ⋆ ─────────────── ⋆`,
        ``,
        `   ♡ ${vid.title.slice(0, 60)}${vid.title.length > 60 ? '...' : ''}`,
        ``,
        `   ✧ ⏱️ ᴅᴜʀᴀᴛɪᴏɴ  ›  ${vid.timestamp}`,
        `   ✧ 👁️ ᴠɪᴇᴡs    ›  ${Number(vid.views || 0).toLocaleString('id-ID')}`,
        `   ✧ 📆 ᴜᴘʟᴏᴀᴅ    ›  ${vid.ago}`,
        `   ✧ 👤 ᴄʜᴀɴɴᴇʟ   ›  ${vid.author}`,
        ``,
        `   ⟨ sᴇʟᴇᴄᴛ ғᴏʀᴍᴀᴛ ⟩`,
        ``,
        `      ⋆｡°✩ Waku waku ✩°｡⋆`,
        `      ⋆ ─────────────── ⋆`
    ].join('\n')

    const buttonsMessage = {
        locationMessage: {
            degreesLatitude: 0,
            degreesLongitude: 0,
            name: BOT_NAME,
            address: global.ownerName || global.ownername || BOT_AUTHOR,
            jpegThumbnail: smallThumb
        },
        contentText,
        footerText: `✩ ${BOT_NAME} ⋆ YT Downloader ♡`,
        buttons: [
            {
                buttonId: `${usedPrefix}ytmp3 ${vid.url}`,
                buttonText: { displayText: '♫ ᴍᴘ𝟹 · ᴀᴜᴅɪᴏ' },
                type: 1
            },
            {
                buttonId: `${usedPrefix}ytmp4 ${vid.url}`,
                buttonText: { displayText: '❖ ᴍᴘ𝟺 · ᴠɪᴅᴇᴏ' },
                type: 1
            },
            {
                buttonId: `${usedPrefix}ytinfo ${vid.url}`,
                buttonText: { displayText: 'ⓘ ɪɴғᴏ ᴠɪᴅᴇᴏ' },
                type: 1
            }
        ],
        headerType: 6
    }

    return conn.relayMessage(
        m.chat,
        { buttonsMessage },
        { messageId: null }
    )
}

// ============================================================
// HANDLER
// ============================================================

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const cmd = (command || '').toLowerCase()

    // ==========================================
    // YT — Buttons
    // ==========================================
    if (cmd === 'yt') {
        if (!text)
            throw `Contoh:\n${usedPrefix}yt chase atlantic\n${usedPrefix}yt https://youtu.be/xxx`

        await m.react('🔍')

        try {
            const vid = await resolveVideo(text)
            await sendYtButtons(conn, m, vid, usedPrefix)
            await m.react('✅')
        } catch (e) {
            console.error('[YT]', e)
            await m.react('❌')
            return m.reply(`❌ ${e.message || e}`)
        }
        return
    }

    // ==========================================
    // YTMP3 — Audio
    // ==========================================
    if (cmd === 'ytmp3' || cmd === 'yta') {
        if (!text) throw `Contoh:\n${usedPrefix + cmd} https://youtu.be/xxx`

        await m.react('🎧')
        await m.reply('_✨ otw..._')

        try {
            const vid = await resolveVideo(text)
            const thumb = await getThumb(vid.thumbnail)
            const hqThumb = await createHighQualityThumbnail(conn, thumb)
            const invisible = '\u200B'.repeat(400)

            const caption = `
┈─ ◦ ɴᴏᴡ ᴘʟᴀʏɪɴɢ ◦ ─┈

♫ ${vid.title}

⏱️ ${vid.timestamp}
👁️ ${Number(vid.views || 0).toLocaleString('id-ID')}
📆 ${vid.ago}

⏳ sedang mengambil audio...
`.trim()

            await conn.sendMessage(
                m.chat,
                {
                    text: `${vid.url}${invisible}\n\n${caption}`,
                    linkPreview: {
                        'matched-text': vid.url,
                        matchedText: vid.url,
                        canonicalUrl: vid.url,
                        title: vid.title,
                        description: `🎧 ${BOT_NAME} • Audio`,
                        previewType: 0,
                        jpegThumbnail: thumb,
                        highQualityThumbnail: hqThumb,
                        thumbnailUrl: vid.thumbnail,
                        linkPreviewMetadata: {
                            linkMediaDuration: 0,
                            socialMediaPostType: 4
                        }
                    },
                    favicon: { url: vid.thumbnail }
                },
                { quoted: getFakeQuoted() }
            )

            const res = await scrapeYtmp3(text.trim(), 'mp3')
            if (res.status === 'error') throw new Error(res.message)

            const safeTitle = cleanName(res.title || 'YouTube')
            const buffer = await downloadBuffer(res.downloadUrl)

            await conn.sendMessage(
                m.chat,
                {
                    audio: buffer,
                    mimetype: 'audio/mpeg',
                    fileName: `${safeTitle}.mp3`,
                    ptt: false
                },
                { quoted: getFakeQuoted() }
            )

            await m.react('✅')
        } catch (e) {
            console.error('[YTMP3]', e)
            await m.react('❌')
            await conn.sendMessage(
                m.chat,
                { text: '❌ Gagal: ' + (e?.message || e) },
                { quoted: m }
            )
        }
        return
    }

    // ==========================================
    // YTMP4 — Video
    // ==========================================
    if (cmd === 'ytmp4' || cmd === 'ytv') {
        if (!text) throw `Contoh:\n${usedPrefix + cmd} https://youtu.be/xxx`

        await m.react('🎬')
        await m.reply('_✨ otw..._')

        try {
            const vid = await resolveVideo(text)
            const thumb = await getThumb(vid.thumbnail)
            const hqThumb = await createHighQualityThumbnail(conn, thumb)
            const invisible = '\u200B'.repeat(400)

            const caption = `
┈─ ◦ ɴᴏᴡ ᴘʟᴀʏɪɴɢ ◦ ─┈

❖ ${vid.title}

⏱️ ${vid.timestamp}
👁️ ${Number(vid.views || 0).toLocaleString('id-ID')}
📆 ${vid.ago}

⏳ sedang mengambil video...
`.trim()

            await conn.sendMessage(
                m.chat,
                {
                    text: `${vid.url}${invisible}\n\n${caption}`,
                    linkPreview: {
                        'matched-text': vid.url,
                        matchedText: vid.url,
                        canonicalUrl: vid.url,
                        title: vid.title,
                        description: `🎬 ${BOT_NAME} • Video`,
                        previewType: 0,
                        jpegThumbnail: thumb,
                        highQualityThumbnail: hqThumb,
                        thumbnailUrl: vid.thumbnail,
                        linkPreviewMetadata: {
                            linkMediaDuration: 0,
                            socialMediaPostType: 4
                        }
                    },
                    favicon: { url: vid.thumbnail }
                },
                { quoted: getFakeQuoted() }
            )

            const res = await scrapeYtmp3(text.trim(), 'mp4')
            if (res.status === 'error') throw new Error(res.message)

            const safeTitle = cleanName(res.title || 'YouTube')
            let buffer = await downloadBuffer(res.downloadUrl)

            // Cek FFmpeg
            const hasFFmpeg = await checkFFmpeg()
            if (!hasFFmpeg) {
                throw new Error('FFmpeg tidak ditemukan di server.')
            }

            // Compress MP4
            try {
                buffer = await compressMP4(buffer)
            } catch (compressError) {
                console.error('[YTMP4 COMPRESS]', compressError)
                throw new Error('Gagal compress: ' + (compressError?.message || compressError))
            }

            await conn.sendMessage(
                m.chat,
                {
                    video: buffer,
                    mimetype: 'video/mp4',
                    fileName: `${safeTitle}.mp4`,
                    caption: `❖ ${res.title}\n\n❀ USANAGI UMI AI ❀`
                },
                { quoted: getFakeQuoted() }
            )

            await m.react('✅')
        } catch (e) {
            console.error('[YTMP4]', e)
            await m.react('❌')
            await conn.sendMessage(
                m.chat,
                { text: '❌ Gagal: ' + (e?.message || e) },
                { quoted: m }
            )
        }
        return
    }

    // ==========================================
    // YTINFO
    // ==========================================
    if (cmd === 'ytinfo') {
        if (!text) throw `Contoh:\n${usedPrefix}ytinfo https://youtu.be/xxx`

        const vid = await resolveVideo(text)

        let info = `✩ *${BOT_NAME} — YT INFO* ✩\n\n`
        info += `♫ *${vid.title}*\n\n`
        info += `⏱️ Duration  › ${vid.timestamp}\n`
        info += `👁️ Views     › ${Number(vid.views || 0).toLocaleString('id-ID')}\n`
        info += `📆 Upload    › ${vid.ago}\n`
        info += `👤 Channel   › ${vid.author}\n`
        info += `🔗 URL       › ${vid.url}`

        return m.reply(info)
    }
}

// ============================================================
// META
// ============================================================

handler.help = ['yt','ytinfo']
handler.tags = ['downloader']
handler.command = /^(yt|ytinfo)$/i
handler.limit = true

export default handler