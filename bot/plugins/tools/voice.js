// plugins/tools/voice.js
// MP3 / MP4 / Audio -> Opus + Real Waveform -> WhatsApp PTT
// ESM - Usanagi Umi AI

'use strict'

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { spawn } from 'node:child_process'

const TMP_DIR = path.join(os.tmpdir(), 'usanagi-waveform')

if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true })
}

function randomName(ext = '') {
    return path.join(
        TMP_DIR,
        `${Date.now()}-${crypto.randomBytes(5).toString('hex')}${ext}`
    )
}

function runFFmpeg(args) {
    return new Promise((resolve, reject) => {
        const proc = spawn('ffmpeg', args, {
            stdio: ['ignore', 'pipe', 'pipe']
        })

        let stdout = ''
        let stderr = ''

        proc.stdout.on('data', data => {
            stdout += data.toString()
        })

        proc.stderr.on('data', data => {
            stderr += data.toString()
        })

        proc.on('error', reject)

        proc.on('close', code => {
            if (code === 0) {
                resolve({ stdout, stderr })
            } else {
                reject(
                    new Error(
                        `FFmpeg keluar dengan code ${code}\n${stderr.slice(-3000)}`
                    )
                )
            }
        })
    })
}

/*
 * Mengambil PCM mono dari audio.
 * PCM dipakai untuk menghitung amplitude waveform asli.
 */
async function getPCM(input) {
    const result = await runFFmpeg([
        '-hide_banner',
        '-loglevel', 'error',
        '-i', input,

        '-vn',
        '-ac', '1',
        '-ar', '8000',
        '-f', 's16le',
        'pipe:1'
    ])

    return result.stdout
}

/*
 * Versi yang benar-benar mengambil binary PCM.
 */
function getPCMBuffer(input) {
    return new Promise((resolve, reject) => {
        const proc = spawn('ffmpeg', [
            '-hide_banner',
            '-loglevel', 'error',
            '-i', input,

            '-vn',
            '-ac', '1',
            '-ar', '8000',
            '-f', 's16le',
            'pipe:1'
        ], {
            stdio: ['ignore', 'pipe', 'pipe']
        })

        const chunks = []
        const errors = []

        proc.stdout.on('data', chunk => {
            chunks.push(chunk)
        })

        proc.stderr.on('data', chunk => {
            errors.push(chunk)
        })

        proc.on('error', reject)

        proc.on('close', code => {
            if (code !== 0) {
                return reject(
                    new Error(
                        Buffer.concat(errors).toString().slice(-3000)
                    )
                )
            }

            resolve(Buffer.concat(chunks))
        })
    })
}

/*
 * PCM -> waveform WhatsApp
 *
 * Output:
 * Uint8Array dengan nilai 0-100.
 */
function generateWaveform(pcm, bars = 64) {
    if (!pcm?.length) {
        return new Uint8Array(bars)
    }

    const samples = Math.floor(pcm.length / 2)

    if (samples <= 0) {
        return new Uint8Array(bars)
    }

    const waveform = new Uint8Array(bars)

    const samplesPerBar = Math.max(
        1,
        Math.floor(samples / bars)
    )

    let maxAmplitude = 1

    /*
     * Cari peak global supaya waveform tidak terlalu kecil.
     */
    for (let i = 0; i < samples; i++) {
        const value = Math.abs(
            pcm.readInt16LE(i * 2)
        )

        if (value > maxAmplitude) {
            maxAmplitude = value
        }
    }

    for (let bar = 0; bar < bars; bar++) {
        const start = bar * samplesPerBar
        const end = Math.min(
            samples,
            start + samplesPerBar
        )

        let peak = 0
        let sum = 0
        let count = 0

        for (let i = start; i < end; i++) {
            const value = Math.abs(
                pcm.readInt16LE(i * 2)
            )

            if (value > peak) {
                peak = value
            }

            sum += value
            count++
        }

        if (!count) {
            waveform[bar] = 0
            continue
        }

        /*
         * Campuran RMS-ish + peak supaya
         * waveform lebih natural.
         */
        const average = sum / count

        const level =
            average * 0.35 +
            peak * 0.65

        let normalized =
            (level / maxAmplitude) * 100

        /*
         * Sedikit boost supaya bagian suara
         * yang pelan tetap terlihat.
         */
        normalized = Math.sqrt(
            Math.max(0, normalized) / 100
        ) * 100

        waveform[bar] = Math.max(
            0,
            Math.min(100, Math.round(normalized))
        )
    }

    return waveform
}

/*
 * Input -> Opus OGG
 */
async function convertToOpus(input, output) {
    await runFFmpeg([
        '-hide_banner',
        '-loglevel', 'error',

        '-i', input,

        '-vn',
        '-map_metadata', '-1',

        '-ac', '1',
        '-ar', '48000',

        '-c:a', 'libopus',
        '-b:a', '32k',
        '-vbr', 'on',

        '-application', 'voip',

        '-f', 'ogg',

        '-y',
        output
    ])
}

/*
 * Ambil media dari quoted message.
 */
async function downloadQuotedMedia(m) {
    const q = m.quoted

    if (!q) {
        throw new Error('Reply media/audio dulu.')
    }

    const mime =
        q.mimetype ||
        q.msg?.mimetype ||
        ''

    if (!mime) {
        throw new Error('Media tidak memiliki mimetype.')
    }

    const stream = await q.download()

    if (!stream) {
        throw new Error('Gagal download media.')
    }

    return Buffer.isBuffer(stream)
        ? stream
        : Buffer.from(stream)
}

/*
 * Handler
 */
let handler = async (m, { conn }) => {
    if (!m.quoted) {
        throw `Reply MP3 / MP4 / audio dengan perintah ini.`
    }

    const mime =
        m.quoted.mimetype ||
        m.quoted.msg?.mimetype ||
        ''

    if (
        !mime.startsWith('audio/') &&
        !mime.startsWith('video/')
    ) {
        throw `Media yang direply harus berupa audio atau video.`
    }

    let input = null
    let opus = null

    try {
        await conn.sendMessage(
            m.chat,
            {
                react: {
                    text: '⏳',
                    key: m.key
                }
            }
        )

        const media = await downloadQuotedMedia(m)

        input = randomName(
            mime.startsWith('video/')
                ? '.mp4'
                : '.audio'
        )

        opus = randomName('.opus')

        fs.writeFileSync(input, media)

        /*
         * 1. Convert input -> Opus
         */
        await convertToOpus(
            input,
            opus
        )

        /*
         * 2. Ambil PCM dari hasil audio
         */
        const pcm =
            await getPCMBuffer(opus)

        /*
         * 3. Generate waveform asli
         */
        const waveform =
            generateWaveform(
                pcm,
                64
            )

        /*
         * 4. Baca hasil Opus
         */
        const audio =
            fs.readFileSync(opus)

        /*
         * 5. Kirim sebagai PTT
         */
        await conn.sendMessage(
            m.chat,
            {
                audio,
                mimetype: 'audio/ogg; codecs=opus',
                ptt: true,
                waveform
            },
            {
                quoted: m
            }
        )

        await conn.sendMessage(
            m.chat,
            {
                react: {
                    text: '✅',
                    key: m.key
                }
            }
        )
    } catch (e) {
        console.error(
            '[VOICE WAVEFORM]',
            e
        )

        await conn.sendMessage(
            m.chat,
            {
                react: {
                    text: '❌',
                    key: m.key
                }
            }
        )

        throw `Gagal membuat voice note:\n${e.message}`
    } finally {
        /*
         * Bersihkan temporary file.
         */
        for (const file of [input, opus]) {
            if (!file) continue

            try {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file)
                }
            } catch {}
        }
    }
}

handler.help = ['voice']
handler.tags = ['tools']
handler.command = ['voice', 'vn', 'ptt']

export default handler