import sharp from 'sharp'
import { prepareWAMessageMedia } from '@rexxhayanasi/elaina-baileys'

const THUMB_URL = 'https://telegra.ph/file/cf4f28ed3b9ebdfb30adc.png'
const URL_B = global.links?.websiteUrl || global.scriptUrl || ''

let handler = async (m, { conn }) => {
  let stats = Object.entries(global.db.data.stats || {})
    .map(([key, val]) => {
      let name = Array.isArray(global.plugins[key]?.help)
        ? global.plugins[key].help.join(' , ')
        : global.plugins[key]?.help || key

      if (/exec/i.test(name)) return null
      return { name, ...val }
    })
    .filter(Boolean)
    .sort((a, b) => (b.total || 0) - (a.total || 0))

  let handlers = stats
    .slice(0, 50)
    .map(({ name, total = 0, last = 0, success = 0, lastSuccess = 0 }, i) => {
      return `*${i + 1}.* *${name}*
• *Hits* : ${total}
• *Success* : ${success}
• *Last Used* : ${last ? getTime(last) : '-'}
• *Last Success* : ${lastSuccess ? formatTime(lastSuccess) : '-'}`
    })
    .join('\n\n')

  if (!handlers) handlers = 'Belum ada data dashboard.'

  const caption = `乂 *D A S H B O A R D*

${handlers}`

  const thumb = await getThumbUrl(THUMB_URL)
  const highQualityThumbnail = await createHighQualityThumbnail(conn, thumb)
  const invisible = '\u200B'.repeat(400)

  await conn.sendMessage(
    m.chat,
    {
      text: `${URL_B}${invisible}

${caption}`,
      linkPreview: {
        'matched-text': URL_B,
        matchedText: URL_B,
        canonicalUrl: URL_B,
        title: '❀ USANAGI UMI AI ❀',
        description: 'Dashboard Command Stats ✨',
        previewType: 0,
        jpegThumbnail: thumb,
        highQualityThumbnail,
        thumbnailUrl: THUMB_URL,
        linkPreviewMetadata: {
          linkMediaDuration: 0,
          socialMediaPostType: 4
        }
      },
      favicon: {
        url: THUMB_URL
      }
    },
    {
      quoted: global.fmeta || m
    }
  )
}

handler.help = ['dashboard']
handler.command = ['dashboard', 'dash']
handler.tags = ['info']

export default handler

async function getThumbUrl(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Gagal ambil thumbnail')

    const raw = Buffer.from(await res.arrayBuffer())

    return await sharp(raw)
      .resize(1280, 720, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
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
      { image: thumb },
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

function formatTime(time) {
  if (!time) return '-'

  const date = new Date(time)
  if (isNaN(date)) return '-'

  const month = getMonthName(date.getMonth())
  const day = date.getDate()
  const year = date.getFullYear()

  return `${month} ${day}, ${year}`
}

function getMonthName(month) {
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ]

  return months[month] || '-'
}

function getTime(ms) {
  if (!ms) return '-'

  const now = parseMs(Date.now() - ms)

  if (now.days) return `${now.days} days ago`
  if (now.hours) return `${now.hours} hours ago`
  if (now.minutes) return `${now.minutes} minutes ago`

  return 'a few seconds ago'
}

function parseMs(ms) {
  if (typeof ms !== 'number') {
    throw new Error('Parameters must be filled with numbers')
  }

  return {
    days: Math.trunc(ms / 86400000),
    hours: Math.trunc(ms / 3600000) % 24,
    minutes: Math.trunc(ms / 60000) % 60,
    seconds: Math.trunc(ms / 1000) % 60,
    milliseconds: Math.trunc(ms) % 1000,
    microseconds: Math.trunc(ms * 1000) % 1000,
    nanoseconds: Math.trunc(ms * 1000000) % 1000
  }
}