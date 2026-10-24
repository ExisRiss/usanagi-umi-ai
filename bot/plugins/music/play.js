import { createDecipheriv } from 'crypto'
import yts from 'yt-search'
import sharp from 'sharp'
import { prepareWAMessageMedia } from '@rexxhayanasi/elaina-baileys'

const METADATA_DECRYPTION_KEY = Buffer.from(
  'C5D58EF67A7584E4A29F6C35BBC4EB12',
  'hex'
)

const HEADERS = {
  'Content-Type': 'application/json',
  Origin: 'https://yt.savetube.me',
  'User-Agent': 'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36'
}

async function savetube(url, { downloadType = 'audio', quality = '128kbps' } = {}) {
  const idMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/
  )

  if (!idMatch) throw 'URL YouTube tidak valid'

  const videoId = idMatch[1]

  const cdnRes = await fetch('https://media.savetube.vip/api/random-cdn', {
    headers: HEADERS
  }).then(v => v.json()).catch(() => null)

  if (!cdnRes?.cdn) throw 'CDN tidak tersedia'

  const cdn = cdnRes.cdn

  const info = await fetch(`https://${cdn}/v2/info`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      url: 'https://www.youtube.com/watch?v=' + videoId
    })
  }).then(v => v.json()).catch(() => null)

  if (!info?.data) throw 'Metadata kosong'

  let metadata

  try {
    const encrypted = Buffer.from(info.data, 'base64')

    const decipher = createDecipheriv(
      'aes-128-cbc',
      METADATA_DECRYPTION_KEY,
      encrypted.subarray(0, 16)
    )

    const decrypted = Buffer.concat([
      decipher.update(encrypted.subarray(16)),
      decipher.final()
    ])

    metadata = JSON.parse(decrypted.toString('utf8'))
  } catch {
    throw 'Decrypt metadata gagal'
  }

  if (!metadata?.key) throw 'Key download tidak ditemukan'

  const dl = await fetch(`https://${cdn}/download`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      id: videoId,
      downloadType,
      quality,
      key: metadata.key
    })
  }).then(v => v.json()).catch(() => null)

  if (!dl?.data?.downloadUrl)
    throw dl?.message || 'Download gagal'

  return {
    title: metadata.title,
    duration: metadata.durationLabel,
    thumbnail: metadata.thumbnail,
    url: dl.data.downloadUrl
  }
}

async function savetubeRetry(url, opts, retry = 3) {
  let lastErr

  for (let i = 0; i < retry; i++) {
    try {
      return await savetube(url, opts)
    } catch (e) {
      lastErr = e
    }
  }

  throw lastErr
}

async function getThumb(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Thumbnail gagal diambil')

    const raw = Buffer.from(await res.arrayBuffer())

    return await sharp(raw)
      .resize(1280, 720, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: 90
      })
      .toBuffer()
  } catch (e) {
    console.error('Thumb Error:', e)
    return Buffer.alloc(0)
  }
}

async function createHighQualityThumbnail(conn, thumb) {
  try {
    if (!thumb?.length) return null

    const { imageMessage } = await prepareWAMessageMedia(
      {
        image: thumb
      },
      {
        upload: conn.waUploadToServer,
        mediaTypeOverride: 'thumbnail-link'
      }
    )

    imageMessage.width = 1280
    imageMessage.height = 720

    return imageMessage
  } catch (e) {
    console.error('HQ Thumb Error:', e)
    return null
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text)
    throw `Contoh:\n${usedPrefix + command} chase atlantic`

  await m.react('🎧')

  let url = text

  if (!/youtube\.com|youtu\.be/i.test(text)) {
    const search = await yts(text)

    if (!search?.videos?.length)
      throw 'Lagu tidak ditemukan'

    url = search.videos[0].url
  }

  const detail = await yts(url)
  const vid = detail?.videos?.[0]

  if (!vid)
    throw 'Video tidak ditemukan'

  const ytUrl = vid.url || url
  const thumb = await getThumb(vid.thumbnail)
  const highQualityThumbnail = await createHighQualityThumbnail(conn, thumb)

  const invisible = '\u200B'.repeat(400)

  const caption = `
┈─ ◦ now playing ◦ ─┈

🎵 ${vid.title}

⏱️ ${vid.timestamp || '-'}
👁️ ${Number(vid.views || 0).toLocaleString('id-ID')}
📆 ${vid.ago || '-'}

⏳ sedang mengambil audio...
`.trim()

  await conn.sendMessage(
    m.chat,
    {
      text: `${ytUrl}${invisible}

${caption}`,

      linkPreview: {
        'matched-text': ytUrl,
        matchedText: ytUrl,
        canonicalUrl: ytUrl,
        title: vid.title,
        description: `🎧 Usanagi Umi AI • ${vid.timestamp || 'Audio'}`,
        previewType: 0,
        jpegThumbnail: thumb,
        highQualityThumbnail,
        thumbnailUrl: vid.thumbnail,
        linkPreviewMetadata: {
          linkMediaDuration: 0,
          socialMediaPostType: 4
        }
      },

      favicon: {
        url: vid.thumbnail
      }
    },
    {
      quoted: global.fmeta || m
    }
  )

  try {
    const audio = await savetubeRetry(url, {
      downloadType: 'audio',
      quality: '128kbps'
    })

    await conn.sendMessage(
      m.chat,
      {
        audio: {
          url: audio.url
        },
        mimetype: 'audio/mpeg',
        fileName: `${audio.title}.mp3`,
        ptt: false
      },
      {
        quoted: global.fmeta || m
      }
    )

    await m.react('✅')
  } catch (e) {
    console.error(e)

    await m.react('❌')

    await conn.sendMessage(
      m.chat,
      {
        text: '❌ Audio gagal diambil, coba lagi nanti.'
      },
      {
        quoted: global.fmeta || m
      }
    )
  }
}

handler.help = ['play']
handler.tags = ['downloader']
handler.command = /^play$/i
handler.limit = true

export default handler