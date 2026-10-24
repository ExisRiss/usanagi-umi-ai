
import crypto from 'crypto'
import sharp from 'sharp'
import { downloadContentFromMessage } from '@rexxhayanasi/elaina-baileys'
import { settings } from '../../config/settings.js'

const MAX_STICKER_SIZE = 1024 * 1024
const STICKER_SIZE = 512
const qualities = [85, 78, 70, 62, 55]

function unwrapMessage(message) {
  let current = message
  for (let i = 0; i < 8; i++) {
    const next =
      current?.ephemeralMessage?.message ||
      current?.viewOnceMessage?.message ||
      current?.viewOnceMessageV2?.message ||
      current?.viewOnceMessageV2Extension?.message ||
      current?.documentWithCaptionMessage?.message
    if (!next || next === current) break
    current = next
  }
  return current || {}
}

function getImageMessage(message) {
  const content = unwrapMessage(message)
  return content?.imageMessage || null
}

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
  } catch {}
}

async function streamToBuffer(stream) {
  const chunks = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  const buffer = Buffer.concat(chunks)
  if (!buffer.length) throw new Error('Media gambar kosong.')
  return buffer
}

async function downloadImage(imageMessage) {
  const stream = await downloadContentFromMessage(imageMessage, 'image')
  return streamToBuffer(stream)
}

async function imageToWebp(input, quality) {
  return sharp(input, { failOn: 'error' })
    .rotate()
    .resize(STICKER_SIZE, STICKER_SIZE, {
      fit: 'contain',
      position: 'centre',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      withoutEnlargement: false,
    })
    .webp({ quality, effort: 6, smartSubsample: true })
    .toBuffer()
}

function addStickerExif(webp, packName, author) {
  if (!Buffer.isBuffer(webp) || webp.length < 16) throw new Error('Hasil WebP tidak valid.')
  if (webp.toString('ascii', 0, 4) !== 'RIFF' || webp.toString('ascii', 8, 12) !== 'WEBP') {
    throw new Error('Format WebP tidak valid.')
  }

  const json = {
    'sticker-pack-id': crypto.randomBytes(16).toString('hex'),
    'sticker-pack-name': packName,
    'sticker-pack-publisher': author,
    emojis: ['✨'],
  }
  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
  const exifHeader = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00,
    0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00,
    0x00, 0x00,
  ])
  const exif = Buffer.concat([exifHeader, jsonBuffer])
  exif.writeUInt32LE(jsonBuffer.length, 14)

  const chunks = []
  let offset = 12
  let inserted = false

  const makeExifChunk = () => {
    const chunk = Buffer.alloc(8 + exif.length + (exif.length % 2))
    chunk.write('EXIF', 0, 4, 'ascii')
    chunk.writeUInt32LE(exif.length, 4)
    exif.copy(chunk, 8)
    return chunk
  }

  while (offset + 8 <= webp.length) {
    const type = webp.toString('ascii', offset, offset + 4)
    const size = webp.readUInt32LE(offset + 4)
    const end = offset + 8 + size
    if (end > webp.length) throw new Error('Struktur WebP tidak lengkap.')

    if (type !== 'EXIF') {
      const chunk = Buffer.from(webp.subarray(offset, end + (size % 2)))
      if (type === 'VP8X' && chunk.length >= 9) {
        chunk[8] |= 0x04
        chunks.push(chunk)
        chunks.push(makeExifChunk())
        inserted = true
      } else {
        chunks.push(chunk)
      }
    }

    offset = end + (size % 2)
  }

  if (offset !== webp.length) throw new Error('Struktur WebP tidak valid.')
  if (!inserted) chunks.push(makeExifChunk())

  const output = Buffer.concat([webp.subarray(0, 12), ...chunks])
  output.writeUInt32LE(output.length - 8, 4)
  return output
}

async function createSticker(input, packName, author) {
  for (const quality of qualities) {
    const webp = await imageToWebp(input, quality)
    const sticker = addStickerExif(webp, packName, author)
    if (sticker.length <= MAX_STICKER_SIZE || quality === qualities[qualities.length - 1]) return sticker
  }
  throw new Error('Gagal membuat stiker.')
}

function getStickerSource(m) {
  const direct = getImageMessage(m.raw?.message)
  if (direct) return direct
  return getImageMessage(m.quoted)
}

const handler = async (m, { conn }) => {
  const imageMessage = getStickerSource(m)

  if (!imageMessage) {
    await react(conn, m, '❌')
    return conn.sendMessage(m.chat, {
      text: '❌ Kirim gambar dengan caption .s / .stiker atau reply pesan bergambar dengan .s / .stiker.'
    }, { quoted: m.raw })
  }

  const packName = String(settings.sticker?.pack || settings.botName || 'Usanagi Umi AI').trim() || 'Usanagi Umi AI'
  const author = String(settings.sticker?.author || settings.ownerName || 'AlzRiss').trim() || 'AlzRiss'

  await react(conn, m, '⏳')

  try {
    const input = await downloadImage(imageMessage)
    const sticker = await createSticker(input, packName, author)

    if (!Buffer.isBuffer(sticker) || sticker.length < 100 || sticker.length > MAX_STICKER_SIZE) {
      throw new Error('Hasil stiker tidak valid atau melebihi batas ukuran.')
    }

    const metadata = await sharp(sticker, { failOn: 'error' }).metadata()
    if (metadata.format !== 'webp' || metadata.width !== STICKER_SIZE || metadata.height !== STICKER_SIZE) {
      throw new Error('Hasil stiker kosong atau dimensinya tidak valid.')
    }

    await conn.sendMessage(m.chat, {
      sticker,
      mimetype: 'image/webp',
    }, { quoted: m.raw })
    await react(conn, m, '✅')
  } catch (error) {
    await react(conn, m, '❌')
    await conn.sendMessage(m.chat, {
      text: `❌ Gagal membuat stiker.\n\n${error?.message || 'Terjadi kesalahan saat memproses gambar.'}`
    }, { quoted: m.raw })
  }
}

handler.command = /^(s|stiker)$/i
handler.help = ['s', 'stiker']
handler.tags = ['sticker']
handler.category = 'sticker'
handler.description = 'Membuat stiker dari gambar'
handler.limit = false

export default handler
