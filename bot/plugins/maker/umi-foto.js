/*
 * umi-foto.js — Umi Usanagi AI (fitur asli, ditulis dari nol)
 *
 * Editor foto lokal (tanpa API eksternal) memakai Jimp.
 * Balas/kirim gambar lalu pilih efek:
 *
 *   .umifoto abu | blur | terang | gelap | kontras | negatif | sepia | cermin | putar
 */
const EFFECTS = {
    abu: { label: 'Hitam Putih', apply: (img) => img.greyscale() },
    blur: { label: 'Blur', apply: (img) => img.blur(6) },
    terang: { label: 'Lebih Terang', apply: (img) => img.brightness(0.35) },
    gelap: { label: 'Lebih Gelap', apply: (img) => img.brightness(-0.35) },
    kontras: { label: 'Kontras Naik', apply: (img) => img.contrast(0.4) },
    negatif: { label: 'Negatif / Invert', apply: (img) => img.invert() },
    sepia: { label: 'Sepia Klasik', apply: (img) => img.sepia() },
    cermin: { label: 'Cermin (Flip)', apply: (img) => img.flip({ horizontal: true, vertical: false }) },
    putar: { label: 'Putar 90°', apply: (img) => img.rotate(90) },
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const key = (args[0] || '').toLowerCase()
    const fx = EFFECTS[key]
    if (!fx) {
        return m.reply(`🖼️ *EDITOR FOTO — Umi Usanagi AI*\n\nBalas sebuah gambar (atau kirim gambar dengan caption perintah ini), lalu pilih efek:\n\n${Object.entries(EFFECTS).map(([k, v]) => `• *${usedPrefix + command} ${k}* — ${v.label}`).join('\n')}\n\nContoh: balas foto dengan *${usedPrefix + command} sepia*`)
    }

    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''
    if (!/^image\//.test(mime)) return m.reply(`🖼️ Balas/kirim *gambar* dengan perintah *${usedPrefix + command} ${key}*.`)

    await m.react('🖼️').catch(() => {})
    let input
    try { input = await q.download() } catch { return m.reply('⚠️ Gagal mengunduh gambar. Coba kirim ulang fotonya.') }
    if (!input?.length) return m.reply('⚠️ Gambar kosong. Coba kirim ulang.')

    try {
        const { Jimp } = await import('jimp')
        const image = await Jimp.read(input)
        if (image.width > 1600) image.resize({ width: 1600 })
        fx.apply(image)
        const out = await image.getBuffer('image/jpeg')
        await conn.sendFile(m.chat, out, 'umi-foto.jpg', `🖼️ *${fx.label}* — Umi Usanagi AI`, m)
    } catch (e) {
        console.error('[umifoto]', e)
        return m.reply('⚠️ Gagal memproses gambar. Pastikan formatnya JPG/PNG yang valid.')
    }
}

handler.help = ['umifoto <efek>']
handler.tags = ['maker']
handler.command = /^(umifoto|editfoto)$/i

export default handler
