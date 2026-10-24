/*
 * umi-suara.js — Umi Usanagi AI (fitur asli, ditulis dari nol)
 *
 * Pengubah suara lokal memakai FFmpeg. Balas voice note/audio lalu pilih efek:
 *
 *   .umisuara tupai | berat | robot | gema | bass | cepat | lambat
 *
 * Hasil dikirim kembali sebagai voice note (PTT).
 */
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'

const requireHere = createRequire(import.meta.url)
let ffmpegPath = null
function resolveFfmpeg() {
    if (ffmpegPath) return ffmpegPath
    try { ffmpegPath = requireHere('@ffmpeg-installer/ffmpeg').path } catch { ffmpegPath = 'ffmpeg' }
    return ffmpegPath
}

const EFFECTS = {
    tupai: { label: 'Suara Tupai (tinggi & lucu)', filter: 'asetrate=44100*1.45,aresample=44100' },
    berat: { label: 'Suara Berat (rendah)', filter: 'asetrate=44100*0.72,aresample=44100' },
    robot: { label: 'Suara Robot', filter: 'asetrate=44100*0.85,aresample=44100,atempo=1.1,afftdn=nf=-25' },
    gema: { label: 'Gema / Echo', filter: 'aecho=0.8:0.85:220|380:0.35|0.22' },
    bass: { label: 'Bass Boost', filter: 'bass=g=16,treble=g=-4' },
    cepat: { label: 'Dipercepat 1.5x', filter: 'atempo=1.5' },
    lambat: { label: 'Diperlambat 0.7x', filter: 'atempo=0.7' },
}

function runFfmpeg(input, filter) {
    return new Promise((resolve, reject) => {
        const chunks = []
        const ff = spawn(resolveFfmpeg(), [
            '-v', 'error', '-i', 'pipe:0',
            '-af', filter,
            '-t', '180',
            '-c:a', 'libopus', '-b:a', '48k', '-f', 'ogg', 'pipe:1',
        ], { stdio: ['pipe', 'pipe', 'pipe'] })
        let err = ''
        ff.stdout.on('data', (d) => chunks.push(d))
        ff.stderr.on('data', (d) => { if (err.length < 800) err += d })
        ff.on('error', reject)
        ff.on('close', (code) => {
            if (code !== 0) return reject(new Error('ffmpeg: ' + err.slice(0, 300)))
            resolve(Buffer.concat(chunks))
        })
        ff.stdin.on('error', () => {})
        ff.stdin.end(input)
    })
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const key = (args[0] || '').toLowerCase()
    const fx = EFFECTS[key]
    if (!fx) {
        return m.reply(`🎙️ *PENGUBAH SUARA — Umi Usanagi AI*\n\nBalas *voice note/audio* dengan salah satu efek:\n\n${Object.entries(EFFECTS).map(([k, v]) => `• *${usedPrefix + command} ${k}* — ${v.label}`).join('\n')}\n\nContoh: balas VN dengan *${usedPrefix + command} tupai*`)
    }

    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''
    if (!/^audio\//.test(mime)) return m.reply(`🎙️ Balas *voice note/audio* dengan perintah *${usedPrefix + command} ${key}*.`)

    await m.react('🎙️').catch(() => {})
    let input
    try { input = await q.download() } catch { return m.reply('⚠️ Gagal mengunduh audio. Coba kirim ulang.') }
    if (!input?.length) return m.reply('⚠️ Audio kosong. Coba kirim ulang.')

    try {
        const out = await runFfmpeg(input, fx.filter)
        if (!out.length) throw new Error('keluaran kosong')
        await conn.sendMessage(m.chat, { audio: out, mimetype: 'audio/ogg; codecs=opus', ptt: true }, { quoted: m })
    } catch (e) {
        console.error('[umisuara]', e)
        return m.reply('⚠️ Gagal memproses audio. Pastikan durasinya wajar (maks 3 menit).')
    }
}

handler.help = ['umisuara <efek>']
handler.tags = ['tools']
handler.command = /^(umisuara|editvoice|voicefx)$/i

export default handler
