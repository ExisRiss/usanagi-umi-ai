import axios from 'axios'

/* Sama seperti maker-cewekbrat: global.APIs tidak diisi oleh config bot,
 * jadi sediakan basis API yang pasti ada. */
const DELINE = String(global.APIs?.deline || global.APIs?.delineWeb || 'https://api.deline.web.id').replace(/\/+$/, '')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(`Contoh penggunaan:
${usedPrefix + command} name|username|comment|verified

Contoh:
${usedPrefix + command} hilman|anu|halo hilman|true`)
    }

    let [name, username, comment, verified] = text.split('|')

    if (!name || !username || !comment) {
        return m.reply(`Format salah!
${usedPrefix + command} name|username|comment|verified`)
    }

    verified = (verified || 'false').trim().toLowerCase()

    const avatar = await conn.profilePictureUrl(m.sender, 'image')
        .catch(() => `${DELINE}/Eu3BVf3K4x.jpg`)

    const url = `${DELINE}/maker/faketweet?name=${encodeURIComponent(name.trim())}&username=${encodeURIComponent(username.trim())}&comment=${encodeURIComponent(comment.trim())}&avatar=${encodeURIComponent(avatar)}&verified=${verified}`

    try {
        const { data, headers } = await axios.get(url, { responseType: 'arraybuffer', timeout: 45000, validateStatus: () => true })
        const type = String(headers?.['content-type'] || '')
        if (!type.startsWith('image/')) throw new Error('Layanan mengembalikan data yang bukan gambar.')
        await conn.sendFile(m.chat, Buffer.from(data), 'faketweet.jpg', '', m)
    } catch (e) {
        console.error('[faketweet]', e?.message || e)
        await m.reply(`Gagal membuat fake tweet: ${String(e?.message || 'layanan sedang sibuk').slice(0, 120)}.`)
    }
}

handler.help = ['faketweet <name>|<username>|<comment>|<verified>']
handler.tags = ['maker']
handler.command = /^faketweet$/i
handler.limit = true

export default handler