import axios from 'axios'
import uploadImage from '../../lib/uploadImage.js'

const DEFAULT_PP = 'https://i.ibb.co/2WzLyGk/profile.jpg'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const q = m.quoted || m
    let txt = text || (typeof q.text === 'string' ? q.text : '')

    if (!txt) {
        throw `Example:
${usedPrefix + command} halo
${usedPrefix + command} hitam|halo
${usedPrefix + command} merah|halo
${usedPrefix + command} #ff00ff|halo`
    }

    let color = 'putih'

    if (txt.includes('|')) {
        const split = txt.split('|')
        color = split.shift().trim()
        txt = split.join('|').trim()

        if (!txt) throw 'Masukkan teksnya.'
    }

    const name =
        q.pushName ||
        q.name ||
        await conn.getName(q.sender) ||
        'User'

    let avatar = await conn
        .profilePictureUrl(q.sender, 'image')
        .catch(() => DEFAULT_PP)

    if (!/^https?:\/\//.test(avatar)) {
        avatar = await uploadImage((await conn.getFile(avatar)).data)
    }

    const image = await fakechat(
        txt,
        name,
        avatar,
        color
    )

    await conn.sendSticker(
        m.chat,
        image,
        m,
        {
            packname: global.stickpack || global.namebot,
            packpublish: global.stickauth || global.author
        }
    )
}

handler.help = ['qc']
handler.tags = ['sticker']
handler.command = /^(qc|fc|fakechat)$/i
handler.limit = true
handler.onlyprem = true

export default handler

async function fakechat(text, name, avatar, color = 'putih') {
    const { data } = await axios.get(
        'https://api.nexray.eu.cc/maker/qc',
        {
            params: {
                text,
                name,
                avatar,
                color
            },
            responseType: 'arraybuffer'
        }
    )

    return Buffer.from(data)
}