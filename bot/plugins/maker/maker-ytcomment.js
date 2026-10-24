import axios from 'axios'

const DELINE = String(global.APIs?.deline || global.APIs?.delineWeb || 'https://api.deline.web.id').replace(/\/+$/, '')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`Contoh penggunaan:
${usedPrefix + command} username|komentar

Contoh:
${usedPrefix + command} AlzRiss|Halo hilman`)
    }

    let [username, komentar] = text.split('|')

    if (!username || !komentar) {
        return m.reply(`Format salah!
${usedPrefix + command} username|komentar`)
    }

    const avatar = await conn.profilePictureUrl(m.sender, 'image')
        .catch(() => `${DELINE}/Eu3BVf3K4x.jpg`)

    const url = `${DELINE}/maker/ytcomment?text=${encodeURIComponent(komentar.trim())}&username=${encodeURIComponent(username.trim())}&avatar=${encodeURIComponent(avatar)}`

    try {
        const { data, headers } = await axios.get(url, { responseType: 'arraybuffer', timeout: 45000, validateStatus: () => true })
        const type = String(headers?.['content-type'] || '')
        if (!type.startsWith('image/')) throw new Error('Layanan mengembalikan data yang bukan gambar.')
        await conn.sendFile(m.chat, Buffer.from(data), 'ytcomment.jpg', '', m)
    } catch (e) {
        console.error('[ytcomment]', e?.message || e)
        await m.reply(`Gagal membuat YouTube comment: ${String(e?.message || 'layanan sedang sibuk').slice(0, 120)}.`)
    }
}

handler.help = ['ytcomment <username>|<komentar>']
handler.tags = ['maker']
handler.command = /^ytcomment$/i
handler.limit = true

export default handler