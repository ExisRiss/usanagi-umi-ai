// @description React pesan WhatsApp Channel
// @category Tools
// @url https://apiii-xrina.vercel.app/

import fetch from 'node-fetch'

let handler = async (m, {
    conn,
    text,
    usedPrefix,
    command
}) => {
    if (!text) {
        throw `Contoh:\n${usedPrefix + command} https://whatsapp.com/channel/0029Vb8SClgHQbRwhvyMDo0m/153 👍`
    }

    let args = text.trim().split(/\s+/)
    let url = args[0]
    let reaction = args[1] || '👍'

    if (!url.includes('whatsapp.com/channel/')) {
        throw '❌ URL harus berupa link pesan WhatsApp Channel.'
    }

    try {
        let api = `https://apiii-xrina.vercel.app/tools/rch?url=${encodeURIComponent(url)}&reaction=${encodeURIComponent(reaction)}&apikey=YOUR_API_KEY`

        let res = await fetch(api)
        let json = await res.json()

        if (!json.status) {
            throw json.message || 'Gagal mengirim reaction.'
        }

        let data = json.data || {}

        await m.reply(
            `✅ *Reaction berhasil dikirim!*\n\n` +
            `💬 Reaction : ${data.reaction?.join(' ') || reaction}\n` +
            `📢 Channel : WhatsApp Channel\n` +
            `📝 Status : ${data.message || 'Berhasil mengirim react ke pesan channel'}`
        )
    } catch (e) {
        console.error('[RCH]', e)
        throw `❌ Gagal mengirim reaction:\n${e.message || e}`
    }
}

handler.help = ['rch <url> <reaction>']
handler.tags = ['tools']
handler.command = ['rch', 'reactchannel']

export default handler
