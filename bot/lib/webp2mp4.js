import { tmpdir } from 'os'
import { join } from 'path'
import { writeFileSync, readFileSync, unlinkSync } from 'fs'
import { spawn } from 'child_process'
import { randomBytes } from 'crypto'

function tmp(ext) {
    return join(tmpdir(), `${randomBytes(6).toString('hex')}.${ext}`)
}

// Ambil durasi WebP pakai ffprobe
function getDuration(file) {
    return new Promise((resolve, reject) => {
        let ff = spawn('ffprobe', [
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            file
        ])

        let out = ''
        ff.stdout.on('data', d => out += d)

        ff.on('close', () => {
            let duration = parseFloat(out)
            if (!duration || isNaN(duration)) return resolve(3) // fallback
            resolve(duration)
        })

        ff.on('error', reject)
    })
}

export async function webp2mp4(buffer) {
    return new Promise(async (resolve, reject) => {
        let input = tmp('webp')
        let output = tmp('mp4')

        try {
            writeFileSync(input, buffer)

            let duration = await getDuration(input)

            let ff = spawn('ffmpeg', [
                '-y',
                '-i', input,
                '-t', duration.toString(), // ⬅️ durasi sesuai sticker
                '-movflags', 'faststart',
                '-pix_fmt', 'yuv420p',
                '-vf', 'scale=512:512:flags=lanczos,fps=25',
                '-an',
                '-c:v', 'libx264',
                output
            ])

            ff.on('error', reject)

            ff.on('close', () => {
                try {
                    let file = readFileSync(output)
                    unlinkSync(input)
                    unlinkSync(output)
                    resolve(file)
                } catch (e) {
                    reject(e)
                }
            })

        } catch (err) {
            reject(err)
        }
    })
}