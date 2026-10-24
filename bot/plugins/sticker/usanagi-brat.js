/* By AlzRiss - Usanagi Umi AI */

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { createCanvas, GlobalFonts } from '@napi-rs/canvas'
import sharp from 'sharp'
import { settings } from '../../config/settings.js'
import { sendInteractive } from '../../lib/awang-tombol.js'

const require = createRequire(import.meta.url)
const SIZE = 512
const MAX_TEXT = 120
const MAX_STICKER_SIZE = 1024 * 1024
const QUALITIES = [90, 86, 82, 78, 74, 70, 66, 62, 58, 54]
const segmenter = typeof Intl?.Segmenter === 'function' ? new Intl.Segmenter('id', { granularity: 'grapheme' }) : null
const emojiCache = new Map()
const emojiFail = new Set()

const BASE = {
  weight: 700, maxFontSize: 108, minFontSize: 28, lineHeight: 1.02, maxLines: 7,
  paddingX: 28, areaTop: 52, areaBottom: 438, align: 'center', radius: 0, decoration: 'classic',
  emojiScale: 0.76, emojiAdvance: 0.88
}

const BRAT_STYLES = {
  classic: { ...BASE, id: 'classic', label: 'Brat Classic', description: 'Putih hitam original tegas', background: '#F7F7F2', textColor: '#11110F', accent: '#11110F', fontFamily: 'Arial', weight: 700, maxFontSize: 110, minFontSize: 30, paddingX: 26, areaTop: 58, areaBottom: 430, decoration: 'classic' },
  bold: { ...BASE, id: 'bold', label: 'Brat Bold', description: 'Kuning hitam poster tebal', background: '#FFE66D', textColor: '#11100A', accent: '#FF4D2E', accent2: '#11100A', fontFamily: 'Arial Narrow', weight: 900, maxFontSize: 112, minFontSize: 30, paddingX: 30, areaTop: 78, areaBottom: 424, radius: 18, decoration: 'bold' },
  clean: { ...BASE, id: 'clean', label: 'Brat Clean', description: 'Biru ice navy modern', background: '#DDEEFF', textColor: '#13243A', accent: '#4BA8FF', accent2: '#FFFFFF', fontFamily: 'Arial', weight: 700, maxFontSize: 106, minFontSize: 30, paddingX: 34, areaTop: 76, areaBottom: 426, radius: 30, decoration: 'clean' },
  compact: { ...BASE, id: 'compact', label: 'Brat Compact', description: 'Olive grid terminal padat', background: '#D8E0C9', textColor: '#182019', accent: '#F05A28', accent2: '#182019', fontFamily: 'DejaVu Sans Mono', weight: 800, maxFontSize: 98, minFontSize: 27, maxLines: 8, paddingX: 22, areaTop: 54, areaBottom: 440, radius: 12, decoration: 'compact' },
  dark: { ...BASE, id: 'dark', label: 'Brat Dark', description: 'Charcoal lime neon', background: '#0E1211', textColor: '#F4FFE7', accent: '#B8FF46', accent2: '#7CF5D7', fontFamily: 'Arial', weight: 800, maxFontSize: 108, minFontSize: 29, paddingX: 30, areaTop: 64, areaBottom: 432, radius: 24, decoration: 'dark' },
  soft: { ...BASE, id: 'soft', label: 'Brat Soft', description: 'Mint lilac rounded', background: '#D9F1E7', textColor: '#173A2A', accent: '#7E5AC7', accent2: '#5BA782', fontFamily: 'Arial', weight: 700, maxFontSize: 102, minFontSize: 28, paddingX: 32, areaTop: 72, areaBottom: 430, radius: 34, decoration: 'soft' },
  candy: { ...BASE, id: 'candy', label: 'Brat Candy', description: 'Pink peach bubble', background: '#FFD6E4', textColor: '#481C35', accent: '#FF4D91', accent2: '#FF9D6C', fontFamily: 'Arial', weight: 800, maxFontSize: 104, minFontSize: 28, paddingX: 30, areaTop: 74, areaBottom: 430, radius: 34, decoration: 'candy' },
  cyber: { ...BASE, id: 'cyber', label: 'Brat Cyber', description: 'Navy cyan magenta', background: '#0B1020', textColor: '#EAFBFF', accent: '#22E7FF', accent2: '#FF4CCF', fontFamily: 'DejaVu Sans Mono', weight: 800, maxFontSize: 94, minFontSize: 25, maxLines: 8, paddingX: 24, areaTop: 70, areaBottom: 436, radius: 20, decoration: 'cyber' },
  sunset: { ...BASE, id: 'sunset', label: 'Brat Sunset', description: 'Coral orange cream', background: '#F27E65', textColor: '#351710', accent: '#FFF1C7', accent2: '#8E2F24', fontFamily: 'Georgia', weight: 800, maxFontSize: 106, minFontSize: 28, paddingX: 32, areaTop: 82, areaBottom: 428, radius: 26, decoration: 'sunset' },
  paper: { ...BASE, id: 'paper', label: 'Brat Paper', description: 'Cream green editorial', background: '#F2EAD5', textColor: '#213D2A', accent: '#C84A38', accent2: '#213D2A', fontFamily: 'Georgia', weight: 800, maxFontSize: 104, minFontSize: 28, paddingX: 32, areaTop: 72, areaBottom: 432, radius: 7, decoration: 'paper' }
}

function cleanText(value) {
  return String(value ?? '').replace(/\u0000/g, '').replace(/\r\n?/g, '\n').trim()
}

function chars(value) {
  const text = String(value || '')
  return !text ? [] : segmenter ? Array.from(segmenter.segment(text), x => x.segment) : Array.from(text)
}

function countText(value) {
  return chars(String(value).replace(/\n/g, '')).length
}

function isEmoji(value) {
  const text = String(value || '')
  return /[\p{Extended_Pictographic}\p{Emoji_Presentation}]|(?:\p{Regional_Indicator}{2})|[#*0-9]\uFE0F?\u20E3/u.test(text)
}

function getFonts() {
  try { GlobalFonts.loadSystemFonts?.() } catch {}
  try {
    return Array.isArray(GlobalFonts.families) ? GlobalFonts.families.map(x => String(x?.family || '')).filter(Boolean) : []
  } catch { return [] }
}

const SYSTEM_FONTS = getFonts()

function resolveFont(name) {
  const found = SYSTEM_FONTS.find(x => x.toLowerCase() === String(name).toLowerCase())
  if (found) return found
  return SYSTEM_FONTS.find(x => /^Arial$/i.test(x)) ||
    SYSTEM_FONTS.find(x => /Liberation Sans/i.test(x)) ||
    SYSTEM_FONTS.find(x => /Noto Sans/i.test(x)) ||
    SYSTEM_FONTS.find(x => /DejaVu Sans/i.test(x)) ||
    SYSTEM_FONTS[0] ||
    'Arial'
}

for (const style of Object.values(BRAT_STYLES)) {
  style.fontFamily = resolveFont(style.fontFamily)
}

function setFont(ctx, size, weight, family) {
  ctx.font = `${weight} ${size}px "${family}"`
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'left'
}

function glyphAdvance(ctx, grapheme, size, weight, family, style) {
  if (isEmoji(grapheme)) return Math.max(20, size * style.emojiAdvance)
  setFont(ctx, size, weight, family)
  return ctx.measureText(grapheme).width
}

function measure(ctx, text, size, weight, family, style) {
  let width = 0
  for (const g of chars(text)) width += glyphAdvance(ctx, g, size, weight, family, style)
  return width
}

function splitWord(ctx, word, width, size, weight, family, style) {
  if (measure(ctx, word, size, weight, family, style) <= width) return [word]
  const result = []
  let current = ''
  for (const g of chars(word)) {
    const next = current + g
    if (current && measure(ctx, next, size, weight, family, style) > width) {
      result.push(current)
      current = g
    } else current = next
  }
  if (current) result.push(current)
  return result
}

function wrap(ctx, value, width, size, weight, family, style) {
  const lines = []
  for (const paragraph of String(value).split('\n')) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean)
    if (!words.length) {
      lines.push('')
      continue
    }
    let line = ''
    for (const word of words) {
      for (const part of splitWord(ctx, word, width, size, weight, family, style)) {
        const candidate = line ? `${line} ${part}` : part
        if (!line || measure(ctx, candidate, size, weight, family, style) <= width) line = candidate
        else {
          lines.push(line)
          line = part
        }
        if (line && measure(ctx, line, size, weight, family, style) > width) {
          lines.push(line)
          line = ''
        }
      }
    }
    if (line) lines.push(line)
  }
  while (lines.length && !lines.at(-1)) lines.pop()
  return lines
}

function fit(ctx, text, style) {
  const width = SIZE - style.paddingX * 2
  const height = style.areaBottom - style.areaTop

  for (let size = style.maxFontSize; size >= style.minFontSize; size--) {
    const lines = wrap(ctx, text, width, size, style.weight, style.fontFamily, style)
    const lineHeight = size * style.lineHeight
    const blockHeight = lines.length * lineHeight

    if (lines.length && lines.length <= style.maxLines && blockHeight <= height) {
      return { size, lines, lineHeight, height: blockHeight }
    }
  }

  const size = style.minFontSize
  const lines = wrap(ctx, text, width, size, style.weight, style.fontFamily, style)

  return {
    size,
    lines: lines.slice(0, style.maxLines),
    lineHeight: size * style.lineHeight,
    height: Math.min(height, lines.length * size * style.lineHeight)
  }
}

function rounded(ctx, x, y, w, h, r, fill, stroke, width = 1) {
  const radius = Math.min(Math.max(0, r), w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
  if (fill) { ctx.fillStyle = fill; ctx.fill() }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke() }
}

function circle(ctx, x, y, r, fill) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = fill
  ctx.fill()
}

function drawDecoration(ctx, s) {
  ctx.fillStyle = s.background
  ctx.fillRect(0, 0, SIZE, SIZE)

  if (s.decoration === 'classic') {
    rounded(ctx, 18, 18, 476, 476, 14, null, 'rgba(17,17,15,.18)', 2)
    rounded(ctx, 30, 30, 452, 452, 9, null, 'rgba(17,17,15,.08)', 1)
    ctx.fillStyle = '#11110F'
    ctx.fillRect(34, 34, 56, 5)
    ctx.fillRect(422, 473, 56, 5)
    circle(ctx, 49, 49, 5, '#11110F')
    circle(ctx, 463, 463, 5, '#11110F')
  }

  if (s.decoration === 'bold') {
    ctx.fillStyle = s.accent
    ctx.fillRect(0, 0, SIZE, 24)
    ctx.fillRect(0, 488, SIZE, 24)
    ctx.fillStyle = s.accent2
    ctx.fillRect(0, 24, 84, 9)
    ctx.fillRect(428, 479, 84, 9)
    rounded(ctx, 18, 44, 476, 426, 18, 'rgba(255,255,255,.16)', 'rgba(17,16,10,.26)', 3)
    ctx.fillStyle = 'rgba(17,16,10,.12)'
    ctx.fillRect(34, 56, 120, 8)
    ctx.fillRect(358, 450, 120, 8)
  }

  if (s.decoration === 'clean') {
    const g = ctx.createLinearGradient(0, 0, SIZE, SIZE)
    g.addColorStop(0, '#ECF7FF')
    g.addColorStop(1, '#CAE6FF')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, SIZE, SIZE)
    rounded(ctx, 16, 16, 480, 480, 34, 'rgba(255,255,255,.50)', 'rgba(19,36,58,.14)', 2)
    rounded(ctx, 30, 30, 452, 452, 26, null, 'rgba(75,168,255,.25)', 2)
    ctx.fillStyle = s.accent
    ctx.fillRect(38, 38, 90, 7)
    ctx.fillRect(384, 467, 90, 7)
    circle(ctx, 458, 56, 15, 'rgba(75,168,255,.13)')
    circle(ctx, 54, 456, 11, 'rgba(75,168,255,.16)')
  }

  if (s.decoration === 'compact') {
    ctx.fillStyle = 'rgba(24,32,25,.075)'
    for (let x = 18; x < 500; x += 22) ctx.fillRect(x, 18, 1, 476)
    for (let y = 18; y < 500; y += 22) ctx.fillRect(18, y, 476, 1)
    ctx.fillStyle = s.accent
    ctx.fillRect(18, 18, 476, 6)
    ctx.fillRect(18, 488, 150, 6)
    rounded(ctx, 22, 44, 468, 430, 12, 'rgba(255,255,255,.10)', 'rgba(24,32,25,.18)', 2)
  }

  if (s.decoration === 'dark') {
    const g = ctx.createLinearGradient(0, 0, SIZE, SIZE)
    g.addColorStop(0, '#090D0C')
    g.addColorStop(.55, '#101713')
    g.addColorStop(1, '#090D0C')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, SIZE, SIZE)
    const glow = ctx.createRadialGradient(416, 78, 8, 416, 78, 220)
    glow.addColorStop(0, 'rgba(184,255,70,.28)')
    glow.addColorStop(1, 'rgba(184,255,70,0)')
    ctx.fillStyle = glow
    ctx.fillRect(160, 0, 352, 280)
    ctx.strokeStyle = 'rgba(184,255,70,.24)'
    ctx.lineWidth = 2
    ctx.strokeRect(24, 24, 464, 464)
    ctx.fillStyle = s.accent
    ctx.fillRect(34, 34, 88, 6)
    ctx.fillRect(358, 472, 120, 4)
  }

  if (s.decoration === 'soft') {
    const g = ctx.createLinearGradient(0, 0, SIZE, SIZE)
    g.addColorStop(0, '#DDF5EA')
    g.addColorStop(.5, '#E8E0FA')
    g.addColorStop(1, '#F4DCEB')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, SIZE, SIZE)
    circle(ctx, 64, 68, 50, 'rgba(255,255,255,.30)')
    circle(ctx, 454, 94, 72, 'rgba(126,90,199,.10)')
    circle(ctx, 434, 444, 56, 'rgba(91,167,130,.11)')
    rounded(ctx, 18, 18, 476, 476, 36, 'rgba(255,255,255,.18)', 'rgba(74,85,99,.14)', 2)
    rounded(ctx, 32, 32, 448, 448, 29, null, 'rgba(126,90,199,.16)', 1)
    ctx.fillStyle = s.accent2
    ctx.fillRect(34, 34, 72, 7)
    ctx.fillStyle = s.accent
    ctx.fillRect(406, 471, 72, 7)
  }

  if (s.decoration === 'candy') {
    const g = ctx.createLinearGradient(0, 0, SIZE, SIZE)
    g.addColorStop(0, '#FFD2E2')
    g.addColorStop(.5, '#FFD9BE')
    g.addColorStop(1, '#EFD9FF')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, SIZE, SIZE)
    circle(ctx, 70, 74, 42, 'rgba(255,255,255,.28)')
    circle(ctx, 446, 94, 34, 'rgba(255,77,145,.13)')
    circle(ctx, 440, 438, 56, 'rgba(154,95,214,.12)')
    rounded(ctx, 20, 20, 472, 472, 36, 'rgba(255,255,255,.18)', 'rgba(72,28,53,.12)', 2)
    ctx.strokeStyle = 'rgba(255,77,145,.28)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(440, 92, 19, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = s.accent
    for (let i = 0; i < 7; i++) circle(ctx, 40 + i * 68, 40 + (i % 2) * 5, 3 + (i % 3), s.accent)
  }

  if (s.decoration === 'cyber') {
    const g = ctx.createLinearGradient(0, 0, SIZE, SIZE)
    g.addColorStop(0, '#080D18')
    g.addColorStop(.5, '#10172A')
    g.addColorStop(1, '#17102A')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, SIZE, SIZE)
    ctx.fillStyle = 'rgba(34,231,255,.05)'
    for (let y = 18; y < 500; y += 18) ctx.fillRect(0, y, SIZE, 1)
    for (let x = 18; x < 500; x += 32) {
      ctx.strokeStyle = 'rgba(34,231,255,.07)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, SIZE)
      ctx.stroke()
    }
    rounded(ctx, 18, 18, 476, 476, 20, 'rgba(7,13,26,.28)', 'rgba(34,231,255,.30)', 2)
    ctx.strokeStyle = 'rgba(255,76,207,.30)'
    ctx.lineWidth = 2
    ctx.strokeRect(30, 30, 452, 452)
    ctx.fillStyle = s.accent
    ctx.fillRect(34, 34, 78, 5)
    ctx.fillStyle = s.accent2
    ctx.fillRect(400, 473, 78, 5)
  }

  if (s.decoration === 'sunset') {
    const g = ctx.createLinearGradient(0, 0, SIZE, SIZE)
    g.addColorStop(0, '#F16E5B')
    g.addColorStop(.45, '#F99C63')
    g.addColorStop(1, '#FFD38D')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, SIZE, SIZE)
    circle(ctx, 412, 104, 42, '#FFF1C7')
    circle(ctx, 412, 104, 70, 'rgba(255,241,199,.22)')
    rounded(ctx, 22, 22, 468, 468, 28, 'rgba(255,241,199,.18)', 'rgba(53,23,16,.18)', 2)
    ctx.fillStyle = s.accent
    ctx.fillRect(34, 34, 120, 8)
    ctx.fillStyle = s.accent2
    ctx.fillRect(358, 470, 120, 8)
  }

  if (s.decoration === 'paper') {
    const g = ctx.createLinearGradient(0, 0, 0, SIZE)
    g.addColorStop(0, '#F7F0DB')
    g.addColorStop(1, '#EDE0C3')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, SIZE, SIZE)
    ctx.fillStyle = 'rgba(33,61,42,.055)'
    for (let y = 70; y < 470; y += 30) ctx.fillRect(26, y, 460, 1)
    ctx.fillStyle = s.accent
    ctx.fillRect(28, 28, 456, 8)
    ctx.fillRect(28, 476, 456, 8)
    rounded(ctx, 30, 48, 452, 410, 8, 'rgba(255,252,240,.36)', 'rgba(33,61,42,.17)', 2)
    ctx.fillStyle = 'rgba(200,74,56,.15)'
    ctx.fillRect(44, 60, 82, 22)
    ctx.fillStyle = s.accent
    ctx.fillRect(48, 64, 74, 14)
  }
}

function emojiCode(g) {
  return Array.from(g).map(x => {
    const cp = x.codePointAt(0)
    return cp === undefined ? '' : cp.toString(16)
  }).filter(Boolean).join('-')
}

function twemojiRoot() {
  try {
    const entry = require.resolve('twemoji')
    let dir = path.dirname(entry)
    for (let i = 0; i < 10; i++) {
      const svg = path.join(dir, 'assets', 'svg')
      if (fs.existsSync(svg)) return svg
      const next = path.dirname(dir)
      if (next === dir) break
      dir = next
    }
  } catch {}
  return null
}

const LOCAL_TWEMOJI = twemojiRoot()

async function emojiPng(grapheme, size) {
  const code = emojiCode(grapheme)
  if (!code || emojiFail.has(code)) return null

  const key = `${code}:${size}`
  if (emojiCache.has(key)) return emojiCache.get(key)

  try {
    let svg = null

    if (LOCAL_TWEMOJI) {
      const file = path.join(LOCAL_TWEMOJI, `${code}.svg`)
      if (fs.existsSync(file)) svg = fs.readFileSync(file)
    }

    if (!svg && typeof fetch === 'function') {
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

async function prepareEmoji(text, size) {
  const result = new Map()
  const unique = [...new Set(chars(text).filter(isEmoji))]

  await Promise.all(unique.map(async g => {
    try {
      const png = await emojiPng(g, Math.max(22, Math.min(82, Math.round(size * 0.72))))
      if (png) result.set(g, png)
    } catch {}
  }))

  return result
}

function drawText(ctx, text, x, y, size, weight, style, assets) {
  const total = measure(ctx, text, size, weight, style.fontFamily, style)
  let cursor = x - total / 2
  const overlays = []

  for (const g of chars(text)) {
    const advance = glyphAdvance(ctx, g, size, weight, style.fontFamily, style)

    if (isEmoji(g)) {
      const png = assets.get(g)
      if (png) {
        const emojiSize = Math.max(22, Math.min(82, Math.round(size * style.emojiScale)))
        overlays.push({
          input: png,
          left: Math.round(cursor + (advance - emojiSize) / 2),
          top: Math.round(y - emojiSize * 0.82)
        })
      }
      cursor += advance
      continue
    }

    setFont(ctx, size, weight, style.fontFamily)
    ctx.fillStyle = style.textColor
    ctx.fillText(g, cursor, y)
    cursor += advance
  }

  return overlays
}

async function renderBrat(text, style) {
  const canvas = createCanvas(SIZE, SIZE)
  const ctx = canvas.getContext('2d')

  if (!ctx) throw new Error('Canvas tidak tersedia.')

  drawDecoration(ctx, style)

  const layout = fit(ctx, text, style)
  const assets = await prepareEmoji(text, layout.size)
  const top = style.areaTop + Math.max(0, (style.areaBottom - style.areaTop - layout.height) / 2)
  const baseline = top + layout.size * 0.82
  const overlays = []

  for (let i = 0; i < layout.lines.length; i++) {
    overlays.push(...drawText(
      ctx,
      layout.lines[i],
      SIZE / 2,
      baseline + i * layout.lineHeight,
      layout.size,
      style.weight,
      style,
      assets
    ))
  }

  let png = canvas.toBuffer('image/png')

  if (overlays.length) {
    try {
      png = await sharp(png, { failOn: 'error' }).composite(overlays).png().toBuffer()
    } catch {}
  }

  await validate(png, 'png')
  return png
}

async function validate(buffer, format) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 512) throw new Error('Gambar tidak valid.')

  const meta = await sharp(buffer, { failOn: 'error' }).metadata()

  if (meta.format !== format || meta.width !== SIZE || meta.height !== SIZE) {
    throw new Error('Ukuran gambar tidak valid.')
  }

  return meta
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
    0x49,0x49,0x2a,0x00,0x08,0x00,0x00,0x00,0x01,0x00,
    0x41,0x57,0x07,0x00,0x00,0x00,0x00,0x00,0x16,0x00,
    0x00,0x00
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

      await validate(tagged, 'webp')
      return tagged
    } catch {}
  }

  throw new Error('Konversi WebP gagal.')
}

function encodeContext(chat, sender, text) {
  const data = JSON.stringify({ c: chat, u: sender, t: text })
  return crypto.createHash('sha256').update(data).digest('hex') + '.' + Buffer.from(data, 'utf8').toString('base64url')
}

function decodeContext(value, chat, sender) {
  const parts = String(value || '').split('.')

  if (parts.length !== 2 || parts[0].length !== 64 || parts[1].length > 1800) return null

  try {
    const payload = Buffer.from(parts[1], 'base64url').toString('utf8')
    const hash = crypto.createHash('sha256').update(payload).digest('hex')

    if (hash !== parts[0]) return null

    const data = JSON.parse(payload)

    if (data.c !== chat || data.u !== sender || typeof data.t !== 'string') return null

    const text = cleanText(data.t)

    return text && countText(text) <= MAX_TEXT ? text : null
  } catch {
    return null
  }
}

function parsePick(value, chat, sender) {
  const parts = String(value || '').trim().split(/\s+/)

  if (parts.length !== 2) return null

  const style = parts[1].toLowerCase()

  if (!BRAT_STYLES[style]) return null

  const text = decodeContext(parts[0], chat, sender)

  if (!text) return null

  return { style, text }
}

async function sendMenu(conn, m, prefix, text) {
  const token = encodeContext(m.chat, m.sender, text)

  const rows = Object.values(BRAT_STYLES).map(style => ({
    title: style.label,
    description: style.description,
    command: `${prefix}bratpick ${token} ${style.id}`
  }))

  return sendInteractive(conn, m.chat, {
    title: 'Usanagi - Ai',
    subtitle: '10 Style',
    body: 'Pilih style Brat Yang Tersedia Dibawah.',
    footer: `Teks: ${text}`,
    list: {
      listTitle: 'Style Brat',
      sections: [{
        title: 'BRAT STYLE',
        rows
      }]
    }
  }, { quoted: m.raw })
}

async function handlePick(m, { conn, usedPrefix }) {
  const parsed = parsePick(m.text, m.chat, m.sender)

  if (!parsed) {
    return m.reply(`Pilihan tidak valid.\n\nGunakan ${usedPrefix}brat <teks>.`)
  }

  try {
    const png = await renderBrat(parsed.text, BRAT_STYLES[parsed.style])
    const sticker = await makeSticker(png)

    await conn.sendMessage(
      m.chat,
      { sticker, mimetype: 'image/webp' },
      { quoted: m.raw }
    )
  } catch (error) {
    console.error('[brat]', error?.message || error)
    await m.reply('Stiker Brat gagal dibuat.')
  }
}

async function handleCommand(m, { conn, usedPrefix }) {
  const text = cleanText(m.text)

  if (!text) {
    return m.reply(`Masukkan teks.\n\nContoh:\n${usedPrefix}brat halo cuy`)
  }

  if (countText(text) > MAX_TEXT) {
    return m.reply(`Teks terlalu panjang.\n\nMaksimal ${MAX_TEXT} karakter.`)
  }

  try {
    await sendMenu(conn, m, usedPrefix, text)
  } catch (error) {
    console.error('[brat-menu]', error?.message || error)
    await m.reply('Menu Brat gagal ditampilkan.')
  }
}

const handler = async (m, context) => {
  if (!m?.chat || !m?.sender) return

  const command = String(m.command || '').toLowerCase()

  if (command === 'bratpick') {
    return handlePick(m, context)
  }

  if (command === 'brat') {
    return handleCommand(m, context)
  }
}

handler.command = /^(brat|bratpick)$/i
handler.help = ['brat']
handler.tags = ['sticker']
handler.category = 'sticker'
handler.description = 'Membuat stiker Brat dengan 10 style'
handler.limit = false
handler.isOwner = false
handler.isPremium = false
handler.isGroup = false
handler.isPrivate = false
handler.cooldown = 0
handler.energi = 0
handler.disabled = false
handler.hiddenFromCategory = false

export default handler