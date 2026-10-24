import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

// ============================================================
// CONFIG
// ============================================================
// Ganti dengan ID Channel WhatsApp kamu
const CHANNEL_ID = global.links?.channelId || '' 
// Link Channel kamu
const CHANNEL_LINK = global.links?.channelUrl || '' 
// API Neosoft
const API_URL = 'https://api.neosoft.best/api/downloader/youtube-play' 
// Maksimal ukuran audio sebelum convert (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024 

// ============================================================
// THUMBNAIL
// ============================================================
async function getThumb(url) {
    if (!url) return null
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 15000
        })
        return await import('sharp').then(({ default: sharp }) =>
            sharp(Buffer.from(response.data))
                .resize(1280, 720, { fit: 'cover' })
                .jpeg({ quality: 90 })
                .toBuffer()
        )
    } catch (e) {
        console.error('[PLAYCH THUMB ERROR]', e.message)
        return null
    }
}

// ============================================================
// HIGH QUALITY THUMBNAIL
// ============================================================
async function createHighQualityThumbnail(conn, thumb) {
    if (!thumb) return null
    try {
        const { prepareWAMessageMedia } = await import('@itsliaaa/baileys')
        const { imageMessage } = await prepareWAMessageMedia(
            { image: thumb },
            { upload: conn.waUploadToServer, mediaTypeOverride: 'thumbnail-link' }
        )
        if (imageMessage) {
            imageMessage.width = 1280
            imageMessage.height = 720
        }
        return imageMessage
    } catch (e) {
        console.error('[PLAYCH HQ THUMB ERROR]', e.message)
        return null
    }
}

// ============================================================
// HANDLER
// ============================================================
let handler = async (m, { conn, text, usedPrefix, command }) => {
    
    // ========================================================
    // CHECK TEXT & CHANNEL
    // ========================================================
    if (!text) {
        return m.reply(`╭─❏ 𝗣𝗹𝗮𝘆 𝗖𝗵𝗮𝗻𝗻𝗲𝗹\n│\n│✧ Masukkan judul lagu!\n│\n│✧ Format:\n│ ${usedPrefix + command} <judul lagu>\n│\n│✧ Contoh:\n│ ${usedPrefix + command} lofi hip hop\n│\n╰──────────────❏`)
    }

    if (!CHANNEL_ID || CHANNEL_ID.includes('xxxxxxxx')) {
        return m.reply(`╭─❏ 𝗣𝗹𝗮𝘆 𝗖𝗵𝗮𝗻𝗻𝗲𝗹\n│\n│✧ ID Channel belum diatur!\n│\n│✧ Edit bagian:\n│ const CHANNEL_ID = '...'\n│\n╰──────────────❏`)
    }

    // ========================================================
    // REACTION LOADING
    // ========================================================
    await m.react('⏳').catch(() => {})
    let inputPath = null
    let outputPath = null

    try {
        // ====================================================
        // REQUEST API
        // ====================================================
        const { data } = await axios.get(API_URL, {
            params: { q: text, type: 'mp3' },
            timeout: 30000
        })

        if (!data || !data.status || !data.download) {
            throw new Error('Audio tidak ditemukan')
        }

        // ====================================================
        // DATA API & THUMBNAIL
        // ====================================================
        const title = data.title || text
        const artist = data.artist || 'Unknown'
        const thumbnail = data.thumbnail || ''
        const source = data.source || ''
        const duration = data.durationText || '-'
        const views = Number(data.views || 0).toLocaleString('id-ID')
        const uploaded = data.uploadedAt || '-'
        const downloadUrl = data.download

        const thumb = await getThumb(thumbnail)
        const highQualityThumbnail = await createHighQualityThumbnail(conn, thumb)

        // ====================================================
        // CAPTION PREVIEW
        // ====================================================
        const invisible = '\u200B'.repeat(400)
        const caption = ` ┈─ ◦ now playing ◦ ─┈ \n🎵 ${title} \n👤 ${artist} \n⏱️ ${duration} \n👁️ ${views} \n📆 ${uploaded} \n⏳ sedang mengambil audio...`.trim()

        // ====================================================
        // SEND MATCHED LINK PREVIEW
        // ====================================================
        if (source) {
            await conn.sendMessage(CHANNEL_ID, {
                text: `${source}${invisible}\n${caption}`,
                linkPreview: {
                    'matched-text': source,
                    matchedText: source,
                    canonicalUrl: source,
                    title: title,
                    description: `🎧 Usanagi Umi AI • ${duration}`,
                    previewType: 0,
                    jpegThumbnail: thumb,
                    highQualityThumbnail: highQualityThumbnail,
                    thumbnailUrl: thumbnail,
                    linkPreviewMetadata: {
                        linkMediaDuration: Number(data.duration || 0),
                        socialMediaPostType: 4
                    }
                },
                favicon: thumbnail ? { url: thumbnail } : undefined
            })
        } else {
            await conn.sendMessage(CHANNEL_ID, { text: `${caption}` })
        }

        // ====================================================
        // TEMP DIRECTORY & FILE
        // ====================================================
        const tmpDir = path.resolve('./tmp')
        if (!fs.existsSync(tmpDir)) {
            fs.mkdirSync(tmpDir, { recursive: true })
        }

        const fileName = `playch_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
        inputPath = path.join(tmpDir, `${fileName}.mp3`)
        outputPath = path.join(tmpDir, `${fileName}.opus`)

        // ====================================================
        // DOWNLOAD MP3
        // ====================================================
        const audioResponse = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'stream',
            timeout: 120000,
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        })

        const writer = fs.createWriteStream(inputPath)
        audioResponse.data.pipe(writer)
        
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve)
            writer.on('error', reject)
            audioResponse.data.on('error', reject)
        })

        // ====================================================
        // CHECK FILE
        // ====================================================
        if (!fs.existsSync(inputPath)) {
            throw new Error('File audio tidak ditemukan')
        }
        
        const stats = fs.statSync(inputPath)
        if (stats.size > MAX_FILE_SIZE) {
            throw new Error('FILE_TOO_LARGE')
        }

        // ====================================================
        // CONVERT MP3 -> OPUS
        // ====================================================
        await execPromise(
            `ffmpeg -y -i "${inputPath}" -vn -c:a libopus -ac 1 -ar 48000 -b:a 32k -application voip -map_metadata -1 "${outputPath}"`
        )

        // ====================================================
        // CHECK OUTPUT & READ OPUS
        // ====================================================
        if (!fs.existsSync(outputPath)) {
            throw new Error('FFmpeg gagal menghasilkan audio')
        }

        const audioBuffer = fs.readFileSync(outputPath)
        if (!audioBuffer || !audioBuffer.length) {
            throw new Error('Buffer audio kosong')
        }

        // ====================================================
        // SEND AUDIO TO CHANNEL
        // ====================================================
        await conn.sendMessage(CHANNEL_ID, {
            audio: audioBuffer,
            mimetype: 'audio/ogg; codecs=opus',
            fileName: `${title}.opus`,
            ptt: false
        })

        // ====================================================
        // SUCCESS
        // ====================================================
        await m.react('✅').catch(() => {})
        return m.reply(`╭─❏ 𝗣𝗹𝗮𝘆 𝗖𝗵𝗮𝗻𝗻𝗲𝗹\n│\n│✧ Berhasil dikirim!\n│\n│✧ Judul : ${title}\n│✧ Artist : ${artist}\n│✧ Durasi : ${duration}\n│✧ Views : ${views}\n│\n│✧ Channel:\n│ ${CHANNEL_LINK}\n│\n╰──────────────❏`)

    } catch (e) {
        console.error('[PLAYCH ERROR]', e)

        // ERROR REACTION
        await m.react('❌').catch(() => {})

        // ERROR MESSAGE
        let errorMsg = 'Terjadi kesalahan saat proses.'
        if (e.message === 'FILE_TOO_LARGE') {
            errorMsg = 'File terlalu besar. Maksimal 50MB.'
        } else if (e.code === 'ECONNABORTED') {
            errorMsg = 'Request timeout. Coba lagi nanti.'
        } else if (e.response?.status === 404) {
            errorMsg = 'Lagu atau audio tidak ditemukan.'
        } else if (e.response?.status === 403) {
            errorMsg = 'Download ditolak oleh server.'
        } else if (e.response?.status === 429) {
            errorMsg = 'API sedang terlalu banyak digunakan.'
        } else if (e.code === 'ENOTFOUND') {
            errorMsg = 'Server API tidak dapat dihubungi.'
        } else if (e.message === 'Audio tidak ditemukan') {
            errorMsg = 'Audio tidak ditemukan dari API.'
        } else if (e.message === 'FFmpeg gagal menghasilkan audio') {
            errorMsg = 'FFmpeg gagal mengconvert audio.'
        }

        return m.reply(`╭─❏ 𝗣𝗹𝗮𝘆 𝗖𝗵𝗮𝗻𝗻𝗲𝗹\n│\n│✧ Status : Gagal\n│✧ Error :\n│ ${errorMsg}\n│\n╰──────────────❏`)
        
    } finally {
        // ====================================================
        // CLEANUP
        // ====================================================
        try {
            if (inputPath && fs.existsSync(inputPath)) {
                fs.unlinkSync(inputPath)
            }
            if (outputPath && fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath)
            }
        } catch (err) {
            console.error('[PLAYCH CLEANUP]', err.message)
        }
    }
}

// ============================================================
// PLUGIN META
// ============================================================
handler.help = ['playch <judul lagu>']
handler.tags = ['owner']
handler.command = /^playch$/i
handler.owner = true

export default handler