/* By AlzRiss - Usanagi Umi AI */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import sharp from 'sharp'
import { settings } from '../../config/settings.js'

const SIZE = 512
const MAX_STICKER_SIZE = 1024 * 1024
const QUALITIES = [90, 86, 82, 78, 74, 70, 66, 62, 58, 54]
const MAX_TEXT = 160

const SOURCE = path.join(process.cwd(), 'assets', 'image', 'squid-board-3d.png')
const SOURCE_SIZE = 1254
const BOARD = { centerX: 717, centerY: 315, width: 842, height: 414, angle: 5.4, padX: 32, padY: 22 }
const FONT_START = 128
const FONT_MIN = 42
const LINE_GAP = 0.10

const segmenter = typeof Intl?.Segmenter === 'function' ? new Intl.Segmenter('id', { granularity: 'grapheme' }) : null
const emojiCache = new Map()
const emojiFail = new Set()
const textLayoutCache = new Map()

function chars(value) {
  const text = String(value || '')
  return !text ? [] : segmenter ? Array.from(segmenter.segment(text), x => x.segment) : Array.from(text)
}

function isEmoji(value) {
  const text = String(value || '')
  return /[\p{Extended_Pictographic}\p{Emoji_Presentation}]|(?:\p{Regional_Indicator}{2})|[#*0-9]\uFE0F?\u20E3/u.test(text)
}

function cleanText(value) {
  return String(value ?? '').replace(/\r/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()
}

function countText(value) {
  return chars(String(value).replace(/\n/g, '')).length
}

function esc(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function emojiCode(g) {
  return Array.from(g).map(x => {
    const cp = x.codePointAt(0)
    return cp === undefined ? '' : cp.toString(16)
  }).filter(Boolean).join('-')
}

async function emojiPng(grapheme, size) {
  const code = emojiCode(grapheme)
  if (!code || emojiFail.has(code)) return null

  const key = `${code}:${size}`
  if (emojiCache.has(key)) return emojiCache.get(key)

  try {
    let svg = null

    if (typeof fetch === 'function') {
      const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${code}.svg`
      try {
        const controller = typeof AbortController === 'function' ? new AbortController() : null
        const timer = controller ? setTimeout(() => controller.abort(), 1800) : null
        const response = await fetch(url, { signal: controller?.signal })
        if (timer) clearTimeout(timer)
        if (response.ok) svg = Buffer.from(await response.arrayBuffer())
      } catch {}
    }

    if (!svg) {
      emojiFail.add(code)
      return null
    }

    const png = await sharp(svg, { failOn: 'error' }).resize(size, size, {
      fit: 'contain',
      position: 'centre',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }).png().toBuffer()

    if (!Buffer.isBuffer(png) || png.length < 100) {
      emojiFail.add(code)
      return null
    }

    emojiCache.set(key, png)
    if (emojiCache.size > 300) emojiCache.delete(emojiCache.keys().next().value)
    return png
  } catch {
    emojiFail.add(code)
    return null
  }
}

async function renderTextRun(text, fontSize) {
  const key = `${fontSize}::${text}`
  if (textLayoutCache.has(key)) return textLayoutCache.get(key)
  const promise = (async () => {
    const width = Math.max(240, Math.ceil(fontSize * Math.max(4, text.length) * 0.75))
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${Math.ceil(fontSize * 1.6)}">`
      + `<text x="0" y="${Math.ceil(fontSize * 1.12)}" font-family="DejaVu Sans,Arial,sans-serif" font-size="${fontSize}" font-weight="900" fill="#000000">${esc(text)}</text></svg>`
    return sharp(Buffer.from(svg)).trim().png().toBuffer({ resolveWithObject: true })
  })()
  textLayoutCache.set(key, promise)
  return promise
}

async function renderEmojiTile(emoji, size) {
  const img = await emojiPng(emoji, Math.round(size))
  if (img) return sharp(img).resize(Math.round(size), Math.round(size), { fit: 'contain' }).png().toBuffer({ resolveWithObject: true })
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(size * 1.2)}" height="${Math.round(size * 1.2)}"><text x="50%" y="82%" text-anchor="middle" font-family="Noto Color Emoji,DejaVu Sans" font-size="${Math.round(size)}">${esc(emoji)}</text></svg>`
  return sharp(Buffer.from(svg)).png().toBuffer({ resolveWithObject: true })
}

function splitTokens(line) {
  const out = []
  let text = ''
  for (const g of chars(line)) {
    if (isEmoji(g)) {
      if (text) { out.push({ type: 'text', value: text }); text = '' }
      out.push({ type: 'emoji', value: g })
    } else text += g
  }
  if (text) out.push({ type: 'text', value: text })
  return out.length ? out : [{ type: 'text', value: '' }]
}

async function composeLine(line, fontSize, maxWidth) {
  const tokens = splitTokens(line)
  const parts = []
  let totalW = 0
  let maxH = 0
  for (const token of tokens) {
    const result = token.type === 'emoji'
      ? await renderEmojiTile(token.value, Math.round(fontSize * 1.02))
      : await renderTextRun(token.value, fontSize)
    parts.push(result)
    totalW += result.info.width
    maxH = Math.max(maxH, result.info.height)
  }
  const gap = tokens.length > 1 ? Math.max(2, Math.round(fontSize * 0.08)) : 0
  totalW += gap * Math.max(0, tokens.length - 1)
  const canvasW = Math.max(1, totalW)
  const canvasH = Math.max(1, maxH)
  let x = 0
  const composite = []
  for (const part of parts) {
    composite.push({ input: part.data, left: x, top: Math.floor((canvasH - part.info.height) / 2) })
    x += part.info.width + gap
  }
  let buffer = await sharp({
    create: { width: canvasW, height: canvasH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  }).composite(composite).png().toBuffer()
  let width = canvasW
  if (width > maxWidth) {
    const scale = maxWidth / width
    buffer = await sharp(buffer).resize(Math.max(1, Math.floor(width * scale)), Math.max(1, Math.floor(canvasH * scale)), { fit: 'fill' }).png().toBuffer()
    width = Math.max(1, Math.floor(width * scale))
  }
  return { data: buffer, width, height: Math.max(1, Math.floor(canvasH * (width / canvasW))) }
}

function wordWrapByEstimate(text, fontSize, maxWidth) {
  const lines = []
  for (const para of cleanText(text).split('\n')) {
    const words = para.split(/\s+/).filter(Boolean)
    if (!words.length) { lines.push(''); continue }
    let line = ''
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word
      const estimate = chars(candidate).reduce((w, c) => w + (c === ' ' ? fontSize * 0.30 : isEmoji(c) ? fontSize * 1.0 : fontSize * 0.56), 0)
      if (estimate <= maxWidth || !line) line = candidate
      else { lines.push(line); line = word }
    }
    if (line) lines.push(line)
  }
  return lines.length ? lines : ['']
}

async function renderBoardSticker(text) {
  if (!fs.existsSync(SOURCE)) throw new Error('Template board tidak ditemukan.')

  const clean = cleanText(text)
  const maxWidth = BOARD.width - BOARD.padX * 2
  const maxHeight = BOARD.height - BOARD.padY * 2

  let chosen = null
  for (let fsx = FONT_START; fsx >= FONT_MIN; fsx -= 4) {
    const lines = wordWrapByEstimate(clean, fsx, maxWidth)
    if (lines.length > 8) continue
    const rendered = []
    let totalH = 0
    for (const line of lines) {
      const r = await composeLine(line, fsx, maxWidth)
      rendered.push(r)
      totalH += r.height
    }
    totalH += Math.max(0, lines.length - 1) * Math.round(fsx * LINE_GAP)
    if (totalH <= maxHeight && rendered.every(r => r.width <= maxWidth)) {
      chosen = { fontSize: fsx, rendered, totalH }
      break
    }
  }
  if (!chosen) {
    const fsx = FONT_MIN
    const lines = wordWrapByEstimate(clean, fsx, maxWidth).slice(0, 8)
    const rendered = []
    let totalH = 0
    for (const line of lines) {
      const r = await composeLine(line, fsx, maxWidth)
      rendered.push(r)
      totalH += r.height
    }
    chosen = { fontSize: fsx, rendered, totalH }
  }

  let y = BOARD.centerY - chosen.totalH / 2
  const imageTags = []
  const gapPx = Math.max(0, Math.round(chosen.fontSize * LINE_GAP))
  for (const line of chosen.rendered) {
    let rotated = await sharp(line.data).rotate(BOARD.angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer({ resolveWithObject: true })
    const maxOverlayW = Math.max(1, SOURCE_SIZE - 4)
    const maxOverlayH = Math.max(1, SOURCE_SIZE - 4)
    if (rotated.info.width > maxOverlayW || rotated.info.height > maxOverlayH) {
      const scale = Math.min(maxOverlayW / rotated.info.width, maxOverlayH / rotated.info.height)
      rotated = await sharp(rotated.data).resize(Math.max(1, Math.floor(rotated.info.width * scale)), Math.max(1, Math.floor(rotated.info.height * scale)), { fit: 'fill' }).png().toBuffer({ resolveWithObject: true })
    }
    let left = Math.round(BOARD.centerX - rotated.info.width / 2)
    let top = Math.round(y + (line.height - rotated.info.height) / 2)
    left = Math.max(0, Math.min(left, SOURCE_SIZE - rotated.info.width))
    top = Math.max(0, Math.min(top, SOURCE_SIZE - rotated.info.height))
    const b64 = rotated.data.toString('base64')
    imageTags.push(`<image href="data:image/png;base64,${b64}" x="${left}" y="${top}" width="${rotated.info.width}" height="${rotated.info.height}" preserveAspectRatio="none"/>`)
    y += line.height + gapPx
  }

  const baseB64 = fs.readFileSync(SOURCE).toString('base64')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SOURCE_SIZE}" height="${SOURCE_SIZE}"><image href="data:image/png;base64,${baseB64}" x="0" y="0" width="${SOURCE_SIZE}" height="${SOURCE_SIZE}" preserveAspectRatio="none"/>${imageTags.join('')}</svg>`
  const png = await sharp(Buffer.from(svg)).resize(SIZE, SIZE, { fit: 'fill' }).png().toBuffer()
  await validatePng(png)
  return png
}

async function validatePng(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 512) throw new Error('Gambar hasil tidak valid.')
  const meta = await sharp(buffer, { failOn: 'error' }).metadata()
  if (meta.format !== 'png' || meta.width !== SIZE || meta.height !== SIZE) throw new Error('Ukuran gambar hasil tidak valid.')
}

function isWebp(buffer) {
  return Buffer.isBuffer(buffer) &&
    buffer.length > 100 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
}

function metaText(value, fallback) {
  const text = String(value || fallback).replace(/[\u0000\r\n]/g, ' ').replace(/\s+/g, ' ').trim() || fallback
  return Array.from(text).slice(0, 128).join('')
}

function chunk(type, data) {
  const pad = data.length & 1
  const out = Buffer.alloc(8 + data.length + pad)
  out.write(type, 0, 4, 'ascii')
  out.writeUInt32LE(data.length, 4)
  data.copy(out, 8)
  return out
}

function exif(packName, publisher) {
  const json = Buffer.from(JSON.stringify({
    'sticker-pack-id': crypto.randomBytes(16).toString('hex'),
    'sticker-pack-name': packName,
    'sticker-pack-publisher': publisher
  }), 'utf8')

  const header = Buffer.from([
    0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00,
    0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00,
    0x00, 0x00
  ])

  header.writeUInt32LE(json.length, 14)
  return Buffer.concat([header, json])
}

async function addExif(buffer, metadata) {
  if (!isWebp(buffer)) throw new Error('WebP tidak valid.')

  const parts = []
  const base = buffer.subarray(0, 12)
  let offset = 12
  let vp8x = null

  while (offset + 8 <= buffer.length) {
    const type = buffer.toString('ascii', offset, offset + 4)
    const size = buffer.readUInt32LE(offset + 4)
    const end = offset + 8 + size
    const next = end + (size & 1)

    if (next > buffer.length) throw new Error('WebP rusak.')

    const payload = Buffer.from(buffer.subarray(offset + 8, end))

    if (type === 'VP8X') vp8x = payload
    else if (type !== 'EXIF') parts.push({ type, payload })

    offset = next
  }

  if (vp8x) {
    const header = Buffer.from(vp8x)
    if (header.length < 10) throw new Error('VP8X tidak valid.')
    header[0] |= 0x08
    parts.unshift({ type: 'VP8X', payload: header })
  } else {
    const header = Buffer.alloc(10)
    header[0] = 0x08
    header[4] = 0xff
    header[5] = 0x01
    header[7] = 0xff
    header[8] = 0x01
    parts.unshift({ type: 'VP8X', payload: header })
  }

  parts.splice(1, 0, { type: 'EXIF', payload: metadata })

  const body = Buffer.concat(parts.map(item => chunk(item.type, item.payload)))
  const output = Buffer.concat([base, body])

  output.writeUInt32LE(output.length - 8, 4)

  if (!isWebp(output)) throw new Error('Metadata WebP gagal.')

  return output
}

async function makeSticker(png) {
  const pack = metaText(settings.sticker?.pack || settings.botName, 'Usanagi Umi AI')
  const publisher = metaText(settings.sticker?.author || settings.ownerName, 'AlzRiss')

  for (const quality of QUALITIES) {
    try {
      const base = await sharp(png, { failOn: 'error' })
        .resize(SIZE, SIZE, {
          fit: 'contain',
          position: 'centre',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .webp({ quality, effort: 6, smartSubsample: true })
        .toBuffer()

      if (!isWebp(base)) continue

      const tagged = await addExif(base, exif(pack, publisher))

      if (!isWebp(tagged) || tagged.length > MAX_STICKER_SIZE) continue

      return tagged
    } catch {}
  }

  throw new Error('Konversi WebP gagal.')
}

async function react(conn, m, emoji) {
  try {
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
  } catch {}
}

const handler = async (m, { conn, usedPrefix }) => {
  const text = cleanText(m.text)

  if (!text) {
    return m.reply(`Masukkan teks untuk papan Squid.\n\nContoh:\n${usedPrefix}squid JANGAN LUPA SENYUM`)
  }

  if (countText(text) > MAX_TEXT) {
    return m.reply(`Teks terlalu panjang.\n\nMaksimal ${MAX_TEXT} karakter.`)
  }

  await react(conn, m, '⏳')

  try {
    const png = await renderBoardSticker(text)
    const sticker = await makeSticker(png)

    await conn.sendMessage(m.chat, { sticker, mimetype: 'image/webp' }, { quoted: m.raw })
    await react(conn, m, '✅')
  } catch (error) {
    console.error('[squid]', error?.message || error)
    await react(conn, m, '❌')
    await m.reply('Stiker Squid gagal dibuat. Coba lagi beberapa saat lagi.')
  }
}

handler.command = /^(squid|squidboard|squidward)$/i
handler.help = ['squid']
handler.tags = ['sticker']
handler.category = 'sticker'
handler.description = 'Membuat stiker papan Squid 3D dari teks'
handler.limit = false
handler.isOwner = false
handler.isPremium = false
handler.isGroup = false
handler.isPrivate = false
handler.cooldown = 8
handler.energi = 1
handler.disabled = false
handler.hiddenFromCategory = false

export default handler
