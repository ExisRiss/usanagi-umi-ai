/**
 * ULAR TANGGA — main langsung di chat WhatsApp (rich HTML).
 *
 * Perintah:
 *   .ular            kirim papan ular tangga interaktif (langsung main di chat)
 *   .ular file       kirim berkas HTML untuk dibuka di browser
 *   .ularpapan       alias yang sama
 *
 * Papan digambar penuh di dalam HTML (tanpa aset/internet): dadu, animasi pion,
 * ular & tangga, mode lawan bot atau 2 pemain bergantian, suara, dan progres
 * tersimpan di HP. Cara kirim sama dengan game trading offline / game-sonic.
 *
 * Catatan: berkas plugin dibatasi ES2020 — jangan pakai ||= atau ??=.
 */
import { kirimForwardSigned } from '../../lib/awang-rich-forward.js'
import { ULAR_TANGGA_HTML } from './ular-tangga-wa-html.js'

const COMMANDS = /^(ular|ularpapan|ularrich|ularwa|ularboard|utwa)$/i
const MODE_BERKAS = /^(file|html|unduh|download)$/i

let handler = async (m, { conn, args, usedPrefix }) => {
    const first = String((args && args[0]) || '').toLowerCase()

    if (MODE_BERKAS.test(first)) {
        await conn.sendMessage(m.chat, {
            document: Buffer.from(ULAR_TANGGA_HTML, 'utf8'),
            fileName: 'UMI-ULAR-TANGGA.html',
            mimetype: 'text/html',
            caption: [
                '🐍 *ULAR TANGGA — VERSI BERKAS*',
                '',
                'Simpan berkas lalu buka dengan Chrome (menu ⋮ → Buka dengan).',
                'Semua jalan offline: dadu, ular, tangga, suara, dan progres di HP.',
                '',
                `Mau main langsung di chat? ketik ${usedPrefix}ular (tanpa kata "file").`,
            ].join('\n'),
        }, { quoted: m })
        return
    }

    try {
        await kirimForwardSigned(conn, m.chat, ULAR_TANGGA_HTML, '🐍 ULAR TANGGA · MAIN DI WHATSAPP')
        await m.react('🎲')
    } catch (error) {
        console.error('[ULAR-TANGGA]', error && error.message ? error.message : error)
        // Kalau WhatsApp menolak rich message, kirim versi berkas supaya tetap bisa main.
        try {
            await conn.sendMessage(m.chat, {
                document: Buffer.from(ULAR_TANGGA_HTML, 'utf8'),
                fileName: 'UMI-ULAR-TANGGA.html',
                mimetype: 'text/html',
                caption: '⚠️ Mode langsung tidak bisa dibuka di chat ini, jadi aku kirim berkasnya. Simpan lalu buka di Chrome.',
            }, { quoted: m })
        } catch (fallbackError) {
            await m.reply(`❌ Gagal mengirim game ular tangga: ${String(error && error.message || error).slice(0, 160)}`)
        }
    }
}

handler.help = ['ular', 'ularpapan', 'ular file']
handler.tags = ['game']
handler.command = COMMANDS
handler.description = 'Ular tangga langsung dimainkan di dalam chat WhatsApp — papan, dadu, animasi (rich HTML), tanpa room/create/join'

export default handler
