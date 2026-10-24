import axios from 'axios'
import FormData from 'form-data'

let handler = async (m, { conn, usedPrefix, command }) => {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''

    if (!/image/.test(mime)) {
        return m.reply(`Reply gambar dengan caption\n${usedPrefix + command}`)
    }

    try {
        await m.reply('⏳ Processing...')

        const buffer = await q.download()
        if (!buffer) throw new Error('Gagal download gambar')

        const form = new FormData()
        form.append('image', buffer, {
            filename: 'image.jpg',
            contentType: mime || 'image/jpeg'
        })

        const url = 'https://api.theresav.eu/api/image/tomanga'

        // Request ke API (tanpa arraybuffer karena responsnya JSON)
        const res = await axios.post(url, form, {
            headers: {
                ...form.getHeaders(),
                'x-apikey': 'hamm'
            },
            validateStatus: () => true 
        })

        const json = res.data

        // Cek apakah respons dari API statusnya true
        if (!json || !json.status) {
            throw new Error(json?.message || 'Gagal memproses gambar di server')
        }

        // Ambil link gambar dari JSON (json.result.image_url)
        const imageUrl = json.result?.image_url
        if (!imageUrl) {
            throw new Error('Link gambar tidak ditemukan di respons API')
        }

        // Kirim gambar menggunakan URL langsung
        await conn.sendMessage(m.chat, {
            image: { url: imageUrl },
            caption: '📚 Done convert manga'
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        await m.reply(`❌ Error:\n${e.message}`)
    }
}

handler.help = ['tomanga']
handler.tags = ['image']
handler.command = /^(tomanga|manga)$/i
handler.register = true
handler.limit = true

export default handler