/* Reaksi bersifat hiasan: kalau koneksi WhatsApp sedang menutup, jangan sampai
 * seluruh perintah ikut gagal (dulu muncul "Connection Closed" di Feedback). */
const safeReact = async (m, emoji) => {
    try { if (typeof m.react === 'function') await m.react(emoji) } catch { }
}

let handler = async (m, { conn, text }) => {
    text = m.quoted?.text || text
    if (!text) return m.reply('Reply / masukkan teks')

    await safeReact(m, '🕒')

    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 20000)

        const res = await fetch(
            `https://apiii-xrina.my.id/maker/brat?text=${encodeURIComponent(text)}`,
            { signal: controller.signal }
        )
        clearTimeout(timeout)

        if (!res.ok) throw new Error(`API ${res.status}`)

        const buffer = Buffer.from(await res.arrayBuffer())
        if (buffer.length < 100) throw new Error('Response terlalu kecil')

        await conn.sendSticker(
            m.chat,
            buffer,
            m,
            {
                packname: global.stickpack || global.namebot,
                packpublish: global.stickauth || global.author
            }
        )

        await safeReact(m, '✅')
    } catch (e) {
        console.error('[brat]', e.message || e)
        await safeReact(m, '❌')
        const reason = e?.name === 'AbortError' ? 'server gambar terlalu lama merespons' : (e?.message || 'layanan sedang sibuk')
        try { await m.reply(`Gagal membuat sticker: ${String(reason).slice(0, 120)}. Coba lagi nanti.`) } catch { }
    }
}

handler.help = ['brat <text>']
handler.tags = ['sticker']
handler.command = /^brat$/i
handler.limit = true
handler.group = true

export default handler