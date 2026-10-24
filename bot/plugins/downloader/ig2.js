// Instagram Downloader + Caption
// ESM Plugin
// Command: .ig

const API_URL = 'https://all-media-downloader-api.onrender.com'
const API_KEY = 'm41nul'

let handler = async (m, { conn, args }) => {
    const url = args[0]

    if (!url) {
        return m.reply(
            '📥 *INSTAGRAM DOWNLOADER*\n\n' +
            'Contoh:\n' +
            '.ig https://www.instagram.com/reel/xxxxx/'
        )
    }

    if (!/^https?:\/\/(www\.)?instagram\.com\//i.test(url)) {
        return m.reply('❌ Link Instagram tidak valid.')
    }

    await m.reply('⏳ Sedang mengunduh media Instagram...')

    try {
        const response = await fetch(
            `${API_URL}/api/instagram?url=${encodeURIComponent(url)}`,
            {
                headers: {
                    'x-api-key': API_KEY,
                    'Accept': 'application/json'
                }
            }
        )

        if (!response.ok) {
            throw new Error(`API HTTP ${response.status}`)
        }

        const data = await response.json()

        if (!data.success) {
            throw new Error(data.message || 'Media Instagram tidak ditemukan.')
        }

        // Ambil caption dari beberapa kemungkinan field API
        const caption =
            data.caption ||
            data.description ||
            data.text ||
            data.data?.caption ||
            data.data?.description ||
            ''

        // Bisa video atau foto
        const mediaUrl =
            data.video_url ||
            data.image_url ||
            data.url ||
            data.data?.video_url ||
            data.data?.image_url

        if (!mediaUrl) {
            throw new Error('URL media tidak ditemukan dari API.')
        }

        const mediaResponse = await fetch(mediaUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        })

        if (!mediaResponse.ok) {
            throw new Error('Gagal mengambil file Instagram.')
        }

        const buffer = Buffer.from(
            await mediaResponse.arrayBuffer()
        )

        if (!buffer.length) {
            throw new Error('File media kosong.')
        }

        // Tentukan jenis file
        const contentType =
            mediaResponse.headers.get('content-type') || ''

        const isImage =
            contentType.startsWith('image/') ||
            /\.(jpg|jpeg|png|webp)(\?|$)/i.test(mediaUrl)

        const finalCaption =
            caption.trim() ||
            '📥 Instagram Downloader'

        if (isImage) {
            // Kirim foto + caption asli
            await conn.sendMessage(
                m.chat,
                {
                    image: buffer,
                    mimetype: contentType || 'image/jpeg',
                    caption: finalCaption
                },
                { quoted: m }
            )
        } else {
            // Kirim video + caption asli
            await conn.sendMessage(
                m.chat,
                {
                    video: buffer,
                    mimetype: contentType || 'video/mp4',
                    caption: finalCaption
                },
                { quoted: m }
            )
        }

    } catch (error) {
        console.error('IG Downloader Error:', error)

        await m.reply(
            `❌ *Gagal mengunduh Instagram*\n\n` +
            `Penyebab: ${error.message}`
        )
    }
}

handler.help = ['ig2']
handler.tags = ['downloader']
handler.command = /^ig2$/i
handler.limit = true

export default handler