import axios from 'axios'
import crypto from 'node:crypto'
import FormData from 'form-data'
import fs from 'node:fs'
import path from 'node:path'

const SIGN_API = 'https://cloudinary-tools.netlify.app/.netlify/functions/sign-upload-params'
const UPLOAD_API = 'https://api.cloudinary.com/v1_1/dtz0urit6/auto/upload'

const API_KEY = 'YOUR_API_KEY'
const UPLOAD_PRESET = 'cloudinary-tools'
const SOURCE = 'ml'

const UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36'

const tmp = path.join(process.cwd(), 'tmp')
if (!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true })

function mimeToExt(mime = '') {
  if (mime.includes('jpeg')) return 'jpg'
  if (mime.includes('png')) return 'png'
  if (mime.includes('webp')) return 'webp'
  return 'jpg'
}

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  return 'application/octet-stream'
}

async function getSignature(timestamp) {
  const payload = {
    paramsToSign: {
      timestamp,
      upload_preset: UPLOAD_PRESET,
      source: SOURCE
    }
  }

  const { data, status } = await axios.post(SIGN_API, payload, {
    headers: {
      'user-agent': UA,
      'content-type': 'application/json',
      accept: '*/*',
      origin: 'https://cloudinary.com',
      referer: 'https://cloudinary.com/'
    },
    timeout: 30000,
    validateStatus: () => true
  })

  if (status < 200 || status >= 300 || !data?.signature) {
    throw new Error(`Gagal ambil signature: HTTP ${status}`)
  }

  return data.signature
}

async function uploadFile(filePath) {
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = await getSignature(timestamp)

  const form = new FormData()
  form.append('upload_preset', UPLOAD_PRESET)
  form.append('source', SOURCE)
  form.append('signature', signature)
  form.append('timestamp', String(timestamp))
  form.append('api_key', API_KEY)
  form.append('file', fs.createReadStream(filePath), {
    filename: path.basename(filePath),
    contentType: getMimeType(filePath)
  })

  const { data, status } = await axios.post(UPLOAD_API, form, {
    headers: {
      ...form.getHeaders(),
      'user-agent': UA,
      accept: 'application/json, text/javascript, */*; q=0.01',
      origin: 'https://upload-widget.cloudinary.com',
      referer: 'https://upload-widget.cloudinary.com/',
      'x-requested-with': 'XMLHttpRequest',
      'x-unique-upload-id': crypto.randomUUID()
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 120000,
    validateStatus: () => true
  })

  if (status < 200 || status >= 300) {
    throw new Error(`Upload gagal: HTTP ${status}`)
  }

  return data?.secure_url || data?.url
}

function makeUpscaleUrl(url) {
  return url.replace('/upload/', '/upload/e_improve,e_sharpen,q_auto:best/')
}

let handler = async (m, { conn, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/image\/(jpe?g|png|webp)/i.test(mime)) {
    return m.reply(`Kirim/reply gambar dengan caption *${usedPrefix + command}*`)
  }

  let filePath

  try {
    await m.reply('⏳ Sedang upscale gambar...')

    let buffer = await q.download()
    if (!buffer) throw new Error('Gagal download gambar.')

    let ext = mimeToExt(mime)
    filePath = path.join(tmp, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`)

    fs.writeFileSync(filePath, buffer)

    let uploadedUrl = await uploadFile(filePath)
    if (!uploadedUrl) throw new Error('URL upload tidak ditemukan.')

    let resultUrl = makeUpscaleUrl(uploadedUrl)

    await conn.sendMessage(
      m.chat,
      {
        image: { url: resultUrl },
        caption: `乂 *IMAGE UPSCALER*

✅ *Status:* Success
🔗 *URL:* ${resultUrl}`
      },
      { quoted: m }
    )
  } catch (e) {
    await m.reply(`❌ Gagal upscale gambar.\n\n${e.message}`)
  } finally {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }
}

handler.help = ['upscale']
handler.tags = ['tools']
handler.command = /^(upscale|remini)$/i
handler.limit = true

export default handler