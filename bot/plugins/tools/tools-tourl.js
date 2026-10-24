/*
 * TO URL - PONE.RS
 * Type    : Plugin ESM
 * Support : All Media
  * By AlzRiss - Usanagi Umi AI
 */

import path from 'node:path'
import axios from 'axios'
import FormData from 'form-data'

const API = 'https://pone.rs/upload.php'

function getExtFromMime(mime = '') {
  if (mime.includes('image/jpeg')) return '.jpg'
  if (mime.includes('image/png')) return '.png'
  if (mime.includes('image/webp')) return '.webp'
  if (mime.includes('image/gif')) return '.gif'
  if (mime.includes('video/mp4')) return '.mp4'
  if (mime.includes('video/webm')) return '.webm'
  if (mime.includes('audio/mpeg')) return '.mp3'
  if (mime.includes('audio/ogg')) return '.ogg'
  if (mime.includes('audio/mp4')) return '.m4a'
  if (mime.includes('application/pdf')) return '.pdf'
  if (mime.includes('application/zip')) return '.zip'
  return '.bin'
}

async function uploadPone(buffer, filename = 'file.bin') {
  const form = new FormData()

  form.append('files[]', buffer, {
    filename
  })

  try {
    const res = await axios.post(API, form, {
      headers: {
        ...form.getHeaders(),
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36',
        accept: '*/*',
        origin: 'https://pone.rs',
        referer: 'https://pone.rs/'
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: () => true
    })

    const data = res.data
    const url = data?.files?.[0]?.url?.replaceAll('\\/', '/') || null

    return {
      status: Boolean(data?.success && url),
      code: res.status,
      result_url: url
    }
  } catch (err) {
    return {
      status: false,
      code: err.response?.status || 500,
      result_url: null,
      error: err.message
    }
  }
}

let handler = async (m, { usedPrefix, command }) => {
  const q = m.quoted || m
  const mime = q.mimetype || q.msg?.mimetype || ''

  if (!mime) {
    return m.reply(
      `🌸 *TO URL - PONE.RS*\n\n` +
      `Reply/kirim media dengan caption:\n` +
      `*${usedPrefix + command}*\n\n` +
      `Support: image, video, audio, sticker, document, pdf, zip, dll.`
    )
  }

  await m.react?.('🕒')

  try {
    const buffer = await q.download()

    if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < 1) {
      await m.react?.('❌')
      return m.reply('❌ Gagal download media, buffer kosong.')
    }

    let filename =
      q.fileName ||
      q.msg?.fileName ||
      `Usanagi-Umi-AI-${Date.now()}${getExtFromMime(mime)}`

    filename = path.basename(filename)

    const result = await uploadPone(buffer, filename)

    if (!result.status) {
      await m.react?.('❌')
      return m.reply(
        `❌ *Upload gagal!*\n\n` +
        `Code: ${result.code || '-'}\n` +
        `Error: ${result.error || 'Tidak diketahui'}`
      )
    }

    await m.react?.('✅')

    return m.reply(
      `乂 *TO URL - PONE.RS*\n\n` +
      `✅ *Status:* Success\n` +
      `📦 *File:* ${filename}\n\n` +
      `🔗 *URL:*\n${result.result_url}`
    )
  } catch (e) {
    await m.react?.('❌')
    return m.reply(`❌ Error: ${e.message}`)
  }
}

handler.help = ['tourl']
handler.tags = ['tools']
handler.command = /^(tourl|tolink|upload)$/i

export default handler