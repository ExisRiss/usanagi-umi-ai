
import axios from 'axios'
import fs from 'fs-extra'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import { spawn } from 'node:child_process'
import { getFfmpegBinPath } from '../../lib/awang-ytdlp.js'
import { fileTypeFromBuffer } from 'file-type'
import { writeExif } from '../../lib/exif.js'

const BRAND = global.brandCredit || 'By AlzRiss - Usanagi Umi AI'
const CFG = global.rinAPI || {}
const BASE = String(CFG.baseUrl || 'https://apiii-xrina.my.id').replace(/\/+$/, '')
const PRIMARY_PATH = String(CFG.bratvid2Path || '/maker/bratvid2')
const FALLBACK_URL = String(CFG.bratvid2FallbackUrl || '')
const TIMEOUT = Number(CFG.timeoutMs) || 180000
const MAX_BYTES = Number(CFG.maxResponseBytes) || 100 * 1024 * 1024

function describeError(error) {
  if (error === null || error === undefined) return 'kesalahan tidak diketahui'
  if (typeof error === 'string') return error
  if (typeof error?.message === 'string' && error.message.trim()) return error.message.trim()
  if (typeof error?.error === 'string' && error.error.trim()) return error.error.trim()
  try {
    const seen = new WeakSet()
    const text = JSON.stringify(error, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) return '[circular]'
        seen.add(value)
      }
      return value
    })
    if (text && text !== '{}') return text.slice(0, 300)
  } catch {}
  return String(error) === '[object Object]' ? 'kesalahan tidak diketahui' : String(error)
}

/* Ambil pesan dari respons JSON apa pun bentuknya (string/objek/array). */
function pickMessage(value, depth = 0) {
  if (depth > 2 || value === null || value === undefined) return ''
  if (typeof value === 'string') return value.trim()
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) {
    for (const item of value) { const found = pickMessage(item, depth + 1); if (found) return found }
    return ''
  }
  if (typeof value === 'object') {
    for (const key of ['message', 'msg', 'error', 'reason', 'detail', 'description', 'detail_error']) {
      if (key in value) { const found = pickMessage(value[key], depth + 1); if (found) return found }
    }
  }
  return ''
}

function apiError(data, status) {
  const raw = Buffer.from(data || '').toString('utf8').trim()
  if (!raw) return `API bratvid2 gagal (HTTP ${status}).`

  try {
    const parsed = JSON.parse(raw)
    const message = pickMessage(parsed)
    return message ? `API bratvid2: ${message.slice(0, 300)}` : `API bratvid2 gagal (HTTP ${status}).`
  } catch {
    return raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300)
      || `API bratvid2 gagal (HTTP ${status}).`
  }
}

async function fetchBinary(url, input, expected = 'video') {
  const response = await axios.get(url, {
    params: { text: input },
    responseType: 'arraybuffer',
    timeout: TIMEOUT,
    validateStatus: () => true,
    maxContentLength: MAX_BYTES,
    maxBodyLength: MAX_BYTES,
    headers: {
      Accept: expected === 'video'
        ? 'video/mp4,video/*,application/octet-stream,application/json'
        : 'image/gif,image/*,application/octet-stream,application/json',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 13) Chrome/140 Mobile',
    },
  })

  const type = String(response.headers['content-type'] || '').toLowerCase()
  const data = Buffer.from(response.data || '')
  if (response.status < 200 || response.status >= 300 || type.includes('json')) {
    throw new Error(apiError(data, response.status))
  }
  if (!data.length) throw new Error(`API bratvid2 mengembalikan ${expected} kosong.`)
  return { data, type }
}

function run(command, args, timeoutMs = 120000) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true })
    let stderr = ''
    let settled = false
    const finish = (error) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      error ? reject(error) : resolve()
    }
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      finish(new Error('Konversi bratvid2 timeout.'))
    }, timeoutMs)
    child.stderr?.on('data', chunk => { stderr += chunk.toString() })
    child.on('error', finish)
    child.on('close', code => finish(code === 0 ? null : new Error(stderr.trim().slice(-500) || `ffmpeg keluar dengan kode ${code}`)))
  })
}

async function gifToMp4(gif) {
  const ffmpeg = await getFfmpegBinPath()
  if (!ffmpeg) throw new Error('Binary ffmpeg tidak tersedia.')
  await fs.chmod(ffmpeg, 0o755).catch(() => {})

  const id = crypto.randomBytes(6).toString('hex')
  const input = path.join(os.tmpdir(), `bratvid2-${id}.gif`)
  const output = path.join(os.tmpdir(), `bratvid2-${id}.mp4`)

  try {
    await fs.writeFile(input, gif)
    await run(ffmpeg, [
      '-y', '-i', input,
      '-vf', 'fps=15,scale=trunc(iw/2)*2:trunc(ih/2)*2',
      '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      output,
    ])
    const video = await fs.readFile(output)
    if (!video.length) throw new Error('Hasil konversi bratvid2 kosong.')
    return video
  } finally {
    await Promise.all([fs.remove(input).catch(() => {}), fs.remove(output).catch(() => {})])
  }
}

async function createBratMedia(input) {
  let primaryError = null
  const primaryUrl = `${BASE}${PRIMARY_PATH.startsWith('/') ? '' : '/'}${PRIMARY_PATH}`
  // Dua percobaan: API ini kadang menjawab JSON sementara (rate limit/5xx).
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const primary = await fetchBinary(primaryUrl, input, 'video')
      const kind = primary.type.includes('image/') ? 'image' : 'video'
      return {
        data: primary.data,
        kind,
        mimetype: primary.type.split(';')[0] || (kind === 'image' ? 'image/jpeg' : 'video/mp4'),
        provider: 'utama',
      }
    } catch (error) {
      primaryError = error
      console.warn(`[BRATVID2] Provider utama gagal (percobaan ${attempt}/2): ${describeError(error)}`)
      if (attempt === 1) await new Promise(resolve => setTimeout(resolve, 1500))
    }
  }

  if (!FALLBACK_URL) throw primaryError

  try {
    const fallback = await fetchBinary(FALLBACK_URL, input, 'gif')
    return {
      data: await gifToMp4(fallback.data),
      kind: 'video',
      mimetype: 'video/mp4',
      provider: 'fallback',
    }
  } catch (fallbackError) {
    throw new Error(`Provider utama: ${describeError(primaryError)}; fallback: ${describeError(fallbackError)}`)
  }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const input = String(text || m.quoted?.text || '').trim()
  const prefix = usedPrefix || '.'

  if (!input) {
    await m.reply(`Contoh:\n${prefix}${command || 'bratvid2'} Halo dunia 🤩`)
    return { success: false }
  }

  try {
    await m.react('⏳').catch(() => {})
    const result = await createBratMedia(input)
    // API mengembalikan video, tetapi keluaran command ini WAJIB stiker.
    // Jangan kirim MP4/GIF/image langsung, termasuk ketika memakai fallback.
    const detected = await fileTypeFromBuffer(result.data)
    const mime = detected?.mime || result.mimetype
    if (!/^(?:video|image)\//.test(mime)) throw new Error('API bratvid2 tidak mengembalikan media yang valid.')
    const sticker = await writeExif({
      data: result.data,
      mimetype: mime === 'image/gif' ? 'video/gif' : mime,
      ext: detected?.ext || (result.kind === 'video' ? 'mp4' : 'png'),
    }, {
      packName: String(global.packname || 'Umi Usanagi'),
      packPublish: String(global.author || BRAND),
    })
    if (!Buffer.isBuffer(sticker) || sticker.toString('ascii', 0, 4) !== 'RIFF' || sticker.toString('ascii', 8, 12) !== 'WEBP') {
      throw new Error('Konversi stiker bratvid2 gagal; hasilnya bukan WebP.')
    }
    const isAnimated = sticker.toString('ascii', 12, 16) === 'VP8X' && Boolean(sticker[20] & 0x02)
    await conn.sendMessage(m.chat, { sticker, ...(isAnimated ? { isAnimated: true } : {}) }, { quoted: m.raw || m })

    if (result.provider === 'fallback') console.log('[BRATVID2] Stiker berhasil dikirim melalui fallback.')
    await m.react('✅').catch(() => {})
    return { success: true }
  } catch (error) {
    const reason = describeError(error)
    console.error('[BRATVID2]', reason)
    await m.react('❌').catch(() => {})
    await m.reply(
      `❌ Gagal membuat stiker bratvid2.\n\n` +
      `Alasan: ${reason}\n\n` +
      `Coba lagi beberapa saat (API pembuat video kadang sibuk), atau pakai ${prefix}bratvid untuk gambar statis.\n\n${BRAND}`
    )
    return { success: false }
  }
}

handler.help = ['bratvid2 <teks>', 'brat2 <teks>']
handler.tags = ['maker']
handler.command = /^(bratvid2|brat2)$/i
handler.limit = true
handler.description = 'Membuat stiker animasi Brat v2 dari teks (hasil WebP, bukan pesan video)'

export default handler
