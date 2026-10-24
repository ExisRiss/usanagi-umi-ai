/**
 * UMI JADWAL — lihat & batalkan perintah Auto-AI yang sedang menunggu.
 *
 *   .jadwal            daftar jadwal di chat ini
 *   .jadwal batal      batalkan semua jadwal milikmu di chat ini
 *   .bataljadwal       bentuk singkat
 *
 * Owner bisa melihat/membatalkan jadwal semua orang di chat tersebut.
 */
import { listScheduled, cancelScheduled } from '../../lib/auto-ai-scheduler.js'

function sisa(ms) {
    const total = Math.max(0, Math.round(ms / 1000))
    if (total < 60) return `${total} detik`
    const menit = Math.floor(total / 60)
    if (menit < 60) return total % 60 ? `${menit} menit ${total % 60} detik` : `${menit} menit`
    const jam = Math.floor(menit / 60)
    return menit % 60 ? `${jam} jam ${menit % 60} menit` : `${jam} jam`
}

let handler = async (m, { args, command, usedPrefix, isOwner }) => {
    const sub = String((args && args[0]) || '').toLowerCase()
    const mine = listScheduled().filter(job => job.chat === m.chat && (isOwner || job.sender === m.sender))

    if (command === 'bataljadwal' || /^(batal|cancel|hapus|stop|clear)$/.test(sub)) {
        if (!mine.length) return m.reply('ℹ️ Tidak ada jadwal Auto-AI yang menunggu di chat ini.')
        let removed = 0
        for (const job of mine) if (cancelScheduled(job.id)) removed += 1
        return m.reply(`✅ *${removed} JADWAL DIBATALKAN*\n\nTidak ada perintah yang akan dijalankan lagi dari antrean tersebut.`)
    }

    if (!mine.length) {
        return m.reply([
            '⏱️ *JADWAL AUTO-AI*',
            '',
            'Tidak ada perintah yang sedang menunggu di chat ini.',
            '',
            'Cara membuat: mention bot lalu minta waktunya, mis.',
            '“tutup grup lalu buka lagi 5 detik kemudian”.',
        ].join('\n'))
    }

    const lines = ['⏱️ *JADWAL AUTO-AI*', '']
    for (const job of mine) {
        const label = `${usedPrefix}${job.command}${job.args ? ' ' + job.args : ''}`
        const jam = new Date(job.runAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        lines.push(`• ${label}`)
        lines.push(`  ${isOwner && job.sender !== m.sender ? 'milik ' + String(job.sender).split('@')[0] + ' · ' : ''}jalan ${jam} (${sisa(job.delayMs)} lagi)`)
    }
    lines.push('', `Batalkan semua: ${usedPrefix}jadwal batal`)
    return m.reply(lines.join('\n'))
}

handler.help = ['jadwal', 'jadwal batal']
handler.tags = ['tools']
handler.command = /^(jadwal|jadwalsaya|bataljadwal)$/i
handler.description = 'Lihat dan batalkan perintah Auto-AI yang dijadwalkan'

export default handler
