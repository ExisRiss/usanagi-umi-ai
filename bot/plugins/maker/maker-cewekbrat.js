import axios from 'axios'

/* `global.APIs` tidak pernah diisi oleh config bot ini, jadi dulu baris
 * `global.APIs.deline` melempar TypeError dan .cewekbrat selalu gagal
 * (laporan Feedback 15 Okt 2026). Pakai basis API yang sama dengan plugin
 * bawaan Umi, dengan cadangan tetap di api.deline.web.id. */
const DELINE = String(global.APIs?.deline || global.APIs?.delineWeb || 'https://api.deline.web.id').replace(/\/+$/, '')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`Contoh penggunaan:
${usedPrefix + command} Halo hilman`)
    }

    const url = `${DELINE}/maker/cewekbrat?text=${encodeURIComponent(text)}`

    try {
        const { data, headers } = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 45000,
            headers: { Accept: 'image/png,image/*;q=0.8' },
            validateStatus: () => true,
        })
        const type = String(headers?.['content-type'] || '')
        if (!type.startsWith('image/') || Buffer.byteLength(data) < 1000) {
            throw new Error('Layanan mengembalikan data yang bukan gambar.')
        }
        await conn.sendFile(m.chat, Buffer.from(data), type.includes('png') ? 'cewekbrat.png' : 'cewekbrat.jpg', '', m)
    } catch (e) {
        console.error('[cewekbrat]', e?.message || e)
        await m.reply(`Gagal membuat gambar cewek brat: ${String(e?.message || 'layanan sedang sibuk').slice(0, 120)}.`)
    }
}

handler.help = ['cewekbrat <teks>']
handler.tags = ['maker']
handler.command = /^cewekbrat$/i
handler.limit = true

export default handler