/* Preset AlightMotion Finder — By AlzRiss - Usanagi Umi AI */
import { findAmPresets } from '../../lib/amfind.js'

function react(conn, m, text) {
    // Cosmetic reactions must not hold up the actual lookup or reply.
    try { Promise.resolve(conn.sendMessage(m.chat, { react: { text, key: m.key } })).catch(() => {}) } catch {}
}
const number = value => Number.isFinite(Number(value)) ? Number(value).toLocaleString('id-ID') : '-'
export function formatAmResult(result) {
    let text = `*ALIGHT MOTION PRESET*\n\n` +
        `👤 Kreator: ${result.author.name || '-'}\n` +
        `🔗 Username: @${result.author.username || '-'}\n` +
        `🎬 ${String(result.caption || '-').slice(0, 600)}\n\n` +
        `👁️ ${number(result.views)} · ❤️ ${number(result.likes)} · 💬 ${number(result.comments)}\n`
    if (result.status === 'found') text += '\n*TAUTAN PRESET*\n'
    else if (result.status === 'incomplete') text += '\n⚠️ Pencarian belum lengkap karena batas layanan/waktu. Belum ada tautan preset yang ditemukan pada komentar yang berhasil dibaca. Coba lagi sebentar.\n'
    else text += '\nBelum ditemukan tautan preset pada caption, komentar, dan balasan publik yang berhasil dibaca. Ini tidak memastikan videonya tidak punya preset.\n'
    for (const item of result.items) {
        const location = item.source === 'reply' ? 'balasan komentar' : item.source === 'caption' ? 'caption' : 'komentar'
        text += `\n📁 ${item.label}\nSumber: ${location} ${item.isAuthor ? 'kreator video' : 'pengguna lain (belum terverifikasi sebagai preset kreator)'}\n${item.url}\n`
    }
    text += `\nDiperiksa: ${result.inspected} komentar + ${result.replies} balasan.\n🎥 ${result.url}`
    return text
}
export function createAmfindHandler(find = findAmPresets) {
    return async (m, { conn, usedPrefix, command, text }) => {
        if (!String(text || '').trim()) return m.reply(`Masukkan tautan TikTok.\nContoh: ${usedPrefix}${command} https://vt.tiktok.com/ZSgMYu5uY/`)
        react(conn, m, '⏳')
        let result
        try { result = await find(text) }
        catch (failure) {
            react(conn, m, '❌')
            const message = failure.code === 'INVALID_URL'
                ? `Gunakan satu tautan video TikTok yang valid.\nContoh: ${usedPrefix}${command} https://vt.tiktok.com/ZSgMYu5uY/`
                : failure.code === 'BUSY'
                    ? 'Pencarian preset sedang penuh. Coba lagi sebentar.'
                    : 'Data video/komentar TikTok belum dapat dibaca dari layanan pencarian. Coba lagi sebentar; pastikan videonya publik.'
            // Do not leak provider HTML/errors, or turn a failed lookup into "no preset".
            console.warn('[AMFIND] lookup unavailable:', String(failure.code || 'LOOKUP').replace(/[^A-Z_]/g, '').slice(0, 40))
            return m.reply(message)
        }
        await m.reply(formatAmResult(result))
        react(conn, m, result.status === 'found' ? '✅' : '⚠️')
    }
}
const handler = createAmfindHandler()
handler.help = ['amfind <url>']
handler.tags = ['tools']
handler.command = ['amfind', 'amfinder']
export default handler
