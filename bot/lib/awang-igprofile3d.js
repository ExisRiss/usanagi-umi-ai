/* By AlzRiss - Usanagi Umi AI */

import fs from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TEMPLATE_PATH = path.join(__dirname, '..', 'assets', 'image', 'igprofile3d-reference.jpg')
const EMOJI_FONT_PATHS = [
  '/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf',
  '/usr/share/fonts/noto/NotoColorEmoji.ttf',
  '/usr/share/fonts/NotoColorEmoji.ttf',
  '/system/fonts/NotoColorEmoji.ttf',
]
const FONT_STACK = '"Roboto", "Inter", "Helvetica Neue", Arial, "Liberation Sans", "DejaVu Sans", sans-serif'
const OUTPUT_WIDTH = 1153
const OUTPUT_HEIGHT = 1536
const MAX_FIELD_LENGTH = 180
const MAX_USERNAME_LENGTH = 34
const MAX_BIO_LENGTH = 58
const MAX_STAT_LENGTH = 12
const MAX_LINE_LENGTH = 78
const CLAIM_TTL = 10 * 60 * 1000
const claims = new Map()
const busyChats = new Set()
let templatePromise = null
let emojiReadyPromise = null

const TILT = { topY: 354, bottomY: 1066, topSlope: -0.057, bottomSlope: -0.099 }
const COLOR_TEXT = '#e6e9ef'
const COLOR_SUBTEXT = '#dde1e8'
const COLOR_WHITE = '#ffffff'
const COLOR_LINK = '#42a5f0'
const COLOR_BADGE = '#1f94f7'

const AVATAR = { x: 311, y: 508, photo: 95, ring: 111 }
const USERNAME = { x: 462, y: 452, size: 27, minSize: 16, maxWidth: 250 }
const BIO = { x: 466, y: 499, size: 22.5, minSize: 12, maxWidth: 420 }
const STAT_COLUMNS = [
  { key: 'posts', label: 'Posts', x: 472, valueY: 581, labelY: 620, maxWidth: 136 },
  { key: 'followers', label: 'Followers', x: 623, valueY: 571, labelY: 609, maxWidth: 140 },
  { key: 'following', label: 'Following', x: 780, valueY: 559, labelY: 595, maxWidth: 190 },
]
const DETAIL_ROWS = [
  { key: 'line1', iconX: 236.5, iconY: 704.5, x: 264, y: 709 },
  { key: 'line2', iconX: 240.5, iconY: 750.5, x: 267, y: 755 },
  { key: 'description', iconX: 244, iconY: 795.5, x: 271, y: 800 },
  { key: 'email', iconX: 249, iconY: 842, x: 276, y: 847 },
  { key: 'link', iconX: 250, iconY: 893, x: 280, y: 898 },
]
const ICON_ALIASES = {
  compass: ['🧭'],
  palette: ['🎨'],
  globe: ['🌐', '🌍', '🌎', '🌏'],
  mail: ['✉', '📧', '📩', '📨', '💌'],
  link: ['🔗'],
}
const EMOJI_PART = /[\p{Extended_Pictographic}\p{Regional_Indicator}\p{Emoji_Modifier}\uFE0F\u200D\u20E3]/u
const EMOJI_MARKER = /[\p{Extended_Pictographic}\p{Regional_Indicator}\u20E3]/u
const MARKER_ATTACHED = /^(?:[0-9#*]\uFE0F?\u20E3|\p{Regional_Indicator}{2}|[\p{Extended_Pictographic}\p{So}](?:\uFE0F|\p{Emoji_Modifier})*(?:\u200D[\p{Extended_Pictographic}\p{So}](?:\uFE0F|\p{Emoji_Modifier})*)*)/u
const MARKER_SPACED = /^[\p{P}\p{S}]{1,2}(?=\s)/u
const TWEMOJI_SOURCES = [
  (code) => `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${code}.svg`,
  (code) => `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${code}.svg`,
]
const TWEMOJI_TIMEOUT = 2800
const TWEMOJI_MISS_TTL = 2 * 60 * 1000
const emojiImages = new Map()
const emojiPending = new Map()
const emojiMisses = new Map()
const glyphCache = new Map()
let missingGlyphHashes = null
let twemojiDirCache
const nodeRequire = createRequire(import.meta.url)

function cleanText(value) {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function clipText(value, max) {
  const text = cleanText(value)
  if (text.length <= max) return text
  return `${text.slice(0, Math.max(1, max - 1)).trimEnd()}…`
}

function glyphProbe(text) {
  const canvas = createCanvas(56, 56)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#000000'
  ctx.font = `36px ${FONT_STACK}`
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(text, 6, 42)
  const data = ctx.getImageData(0, 0, 56, 56).data
  let ink = 0
  let hash = 2166136261
  for (let i = 3; i < data.length; i += 4) {
    const on = data[i] > 48 ? 1 : 0
    ink += on
    hash = Math.imul(hash ^ on, 16777619) >>> 0
  }
  return { ink, hash }
}

function glyphVisible(text) {
  if (glyphCache.has(text)) return glyphCache.get(text)
  let visible = false
  try {
    if (!missingGlyphHashes) missingGlyphHashes = new Set(['\u0378', '\uFFFF', '\uE0FF'].map((ch) => glyphProbe(ch).hash))
    const probe = glyphProbe(text)
    visible = probe.ink >= 14 && !missingGlyphHashes.has(probe.hash)
  } catch {
    visible = false
  }
  if (glyphCache.size > 500) glyphCache.clear()
  glyphCache.set(text, visible)
  return visible
}

function stripUnrenderable(value) {
  let out = ''
  for (const ch of String(value ?? '')) {
    if (!EMOJI_PART.test(ch)) {
      out += ch
      continue
    }
    if (/[\uFE0F\u200D\u20E3\p{Emoji_Modifier}\p{Regional_Indicator}]/u.test(ch)) continue
    if (glyphVisible(ch)) out += ch
  }
  return cleanText(out)
}

function splitDetailText(value) {
  const source = cleanText(value)
  if (!source) return { marker: '', text: '' }
  const marker = source.match(MARKER_ATTACHED)?.[0] ?? source.match(MARKER_SPACED)?.[0] ?? ''
  if (!marker) return { marker: '', text: source }
  return { marker, text: cleanText(source.slice(marker.length)) }
}

function iconNameFor(emoji) {
  const key = String(emoji || '').replace(/\uFE0F/g, '')
  for (const [name, list] of Object.entries(ICON_ALIASES)) {
    if (list.includes(key)) return name
  }
  return ''
}

function emojiCode(marker) {
  const list = Array.from(marker)
  const joined = list.includes('\u200D')
  return list
    .filter((ch) => joined || ch !== '\uFE0F')
    .map((ch) => ch.codePointAt(0).toString(16))
    .join('-')
}

function localTwemojiDir() {
  if (twemojiDirCache !== undefined) return twemojiDirCache
  twemojiDirCache = null
  try {
    let dir = path.dirname(nodeRequire.resolve('twemoji'))
    for (let i = 0; i < 10; i += 1) {
      const candidate = path.join(dir, 'assets', 'svg')
      if (existsSync(candidate)) {
        twemojiDirCache = candidate
        break
      }
      const next = path.dirname(dir)
      if (next === dir) break
      dir = next
    }
  } catch {}
  return twemojiDirCache
}

async function fetchBuffer(url) {
  if (typeof fetch !== 'function') return null
  const controller = typeof AbortController === 'function' ? new AbortController() : null
  const timer = controller ? setTimeout(() => controller.abort(), TWEMOJI_TIMEOUT) : null
  try {
    const response = await fetch(url, { signal: controller?.signal })
    if (!response.ok) return null
    const buffer = Buffer.from(await response.arrayBuffer())
    return buffer.length > 40 ? buffer : null
  } catch {
    return null
  } finally {
    if (timer) clearTimeout(timer)
  }
}

async function readTwemojiSvg(code) {
  const dir = localTwemojiDir()
  if (dir) {
    try {
      return await fs.readFile(path.join(dir, `${code}.svg`))
    } catch {}
  }
  for (const build of TWEMOJI_SOURCES) {
    const svg = await fetchBuffer(build(code))
    if (svg) return svg
  }
  return null
}

async function buildEmojiImage(code) {
  try {
    const svg = await readTwemojiSvg(code)
    if (!svg) return null
    const png = await sharp(svg, { density: 384 })
      .resize(72, 72, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()
    return await loadImage(png)
  } catch {
    return null
  }
}

async function loadEmojiImage(marker) {
  const code = emojiCode(marker)
  if (!code) return null
  if (emojiImages.has(code)) return emojiImages.get(code)
  const missedAt = emojiMisses.get(code)
  if (missedAt && Date.now() - missedAt < TWEMOJI_MISS_TTL) return null
  if (!emojiPending.has(code)) {
    emojiPending.set(code, buildEmojiImage(code).finally(() => emojiPending.delete(code)))
  }
  const image = await emojiPending.get(code)
  if (image) {
    emojiImages.set(code, image)
    if (emojiImages.size > 120) emojiImages.delete(emojiImages.keys().next().value)
    emojiMisses.delete(code)
  } else {
    emojiMisses.set(code, Date.now())
  }
  return image
}

async function prepareIcon(marker, emojiReady) {
  if (!marker) return null
  if (EMOJI_MARKER.test(marker)) {
    if (emojiReady) return { type: 'font', value: marker }
    const image = await loadEmojiImage(marker)
    if (image) return { type: 'image', image }
    const name = iconNameFor(marker)
    if (name) return { type: 'vector', name }
  }
  if (glyphVisible(marker)) return { type: 'glyph', value: marker }
  return { type: 'blank' }
}

async function prepareRows(profile, emojiReady) {
  return Promise.all(DETAIL_ROWS.map(async (row) => {
    const parsed = splitDetailText(profile[row.key])
    return { row, marker: parsed.marker, text: parsed.text, icon: await prepareIcon(parsed.marker, emojiReady) }
  }))
}

export function parseIgProfileInput(text) {
  const raw = String(text || '')
  if (!raw.trim()) return { error: 'EMPTY' }
  const parts = raw.split('|').map((part) => cleanText(part))
  if (parts.length !== 10 || parts.some((part) => !part)) return { error: 'FORMAT' }
  const [username, bio, followers, following, posts, line1, line2, description, email, link] = parts
  const values = { username, bio, followers, following, posts, line1, line2, description, email, link }
  if (Object.values(values).some((value) => value.length > MAX_FIELD_LENGTH)) return { error: 'LENGTH' }
  return {
    value: {
      username: clipText(username, MAX_USERNAME_LENGTH),
      bio: clipText(bio, MAX_BIO_LENGTH),
      followers: clipText(followers, MAX_STAT_LENGTH),
      following: clipText(following, MAX_STAT_LENGTH),
      posts: clipText(posts, MAX_STAT_LENGTH),
      line1: clipText(line1, MAX_LINE_LENGTH),
      line2: clipText(line2, MAX_LINE_LENGTH),
      description: clipText(description, MAX_LINE_LENGTH),
      email: clipText(email, MAX_LINE_LENGTH),
      link: clipText(link, MAX_LINE_LENGTH),
    },
  }
}

export function igProfileUsage(prefix = '.') {
  return [
    '📸 *IGPROFILE3D*',
    '',
    `Gunakan: *${prefix}igprofile3d USERNAME | BIO | FOLLOWERS | FOLLOWING | POSTS | TEXT 1 | TEXT 2 | DESKRIPSI | EMAIL | LINK*`,
    '',
    'Foto bisa dikirim bersama command atau command terbaru dapat digunakan sebagai reply pada foto.',
    'Emoji atau simbol di awal TEXT 1, TEXT 2, DESKRIPSI, EMAIL, atau LINK akan tampil sesuai yang ditulis.',
    'Tanpa emoji atau simbol, baris tampil tanpa ikon.',
    '',
    `Contoh: *${prefix}igprofile3d alzriss | AlzRiss | 8.7K | 420 | 98 | 🧭 Exploring ideas, creating stories. | 🎨 UI/UX Designer & Visual Storyteller | 🌐 Designing experiences that connect. | ✉️ hello@axcode.id | 🔗 axcode.id*`,
  ].join('\n')
}

function pruneClaims(now = Date.now()) {
  for (const [key, value] of claims) {
    if (now - value > CLAIM_TTL) claims.delete(key)
  }
}

export function claimIgProfileMessage(key) {
  pruneClaims()
  if (!key || claims.has(key)) return false
  claims.set(key, Date.now())
  return true
}

export function releaseIgProfileMessage(key) {
  if (key) claims.delete(key)
}

export function startIgProfileJob(key) {
  if (!key || busyChats.has(key)) return false
  busyChats.add(key)
  return true
}

export function endIgProfileJob(key) {
  if (key) busyChats.delete(key)
}

function probeColorEmoji() {
  try {
    const canvas = createCanvas(64, 64)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#000000'
    ctx.font = '40px "Noto Color Emoji"'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText('🧭', 6, 46)
    const data = ctx.getImageData(0, 0, 64, 64).data
    let colored = 0
    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 200 && (Math.abs(data[i] - data[i + 1]) > 24 || Math.abs(data[i + 1] - data[i + 2]) > 24)) colored += 1
    }
    return colored > 40
  } catch {
    return false
  }
}

async function ensureEmojiFont() {
  if (!emojiReadyPromise) {
    emojiReadyPromise = (async () => {
      for (const fontPath of EMOJI_FONT_PATHS) {
        try {
          await fs.access(fontPath)
          try {
            GlobalFonts.registerFromPath(fontPath, 'Noto Color Emoji')
            break
          } catch {}
        } catch {}
      }
      return probeColorEmoji()
    })()
  }
  return emojiReadyPromise
}

async function getTemplateImage() {
  if (!templatePromise) {
    templatePromise = fs.readFile(TEMPLATE_PATH).then((buffer) => loadImage(buffer))
  }
  try {
    return await templatePromise
  } catch (error) {
    templatePromise = null
    throw Object.assign(new Error('Template IGProfile3D tidak tersedia.'), { code: 'ASSET', cause: error })
  }
}

async function normalizeProfileImage(buffer) {
  try {
    if (!Buffer.isBuffer(buffer) || !buffer.length) throw new Error('Foto kosong.')
    const normalized = await sharp(buffer, { failOn: 'error' })
      .rotate()
      .resize(256, 256, { fit: 'cover', position: 'centre' })
      .png()
      .toBuffer()
    return loadImage(normalized)
  } catch (error) {
    throw Object.assign(new Error('Foto profile tidak valid atau tidak dapat diproses.'), { code: 'IMAGE', cause: error })
  }
}

function tiltAngle(y) {
  const t = Math.min(1, Math.max(0, (y - TILT.topY) / (TILT.bottomY - TILT.topY)))
  return Math.atan(TILT.topSlope + (TILT.bottomSlope - TILT.topSlope) * t)
}

function setFont(ctx, weight, size) {
  ctx.font = `${weight} ${size}px ${FONT_STACK}`
}

function fitText(ctx, text, maxWidth, startSize, minSize, weight = 400) {
  const value = cleanText(text)
  let size = startSize
  while (size > minSize) {
    setFont(ctx, weight, size)
    if (ctx.measureText(value).width <= maxWidth) break
    size -= 0.5
  }
  setFont(ctx, weight, size)
  if (ctx.measureText(value).width <= maxWidth) return { text: value, size }
  let fitted = value
  while (fitted.length > 1 && ctx.measureText(`${fitted}…`).width > maxWidth) fitted = fitted.slice(0, -1)
  return { text: `${fitted.trimEnd()}…`, size }
}

function drawText(ctx, text, x, baseline, options) {
  const weight = options.weight ?? 400
  const fit = fitText(ctx, text, options.maxWidth, options.size, options.minSize, weight)
  const angle = tiltAngle(baseline)
  ctx.save()
  ctx.translate(x, baseline)
  ctx.rotate(angle)
  setFont(ctx, weight, fit.size)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = options.color ?? COLOR_TEXT
  ctx.shadowColor = 'rgba(0,0,0,0.36)'
  ctx.shadowBlur = 2
  ctx.shadowOffsetY = 1
  ctx.fillText(fit.text, 0, 0)
  if (options.heavy) {
    ctx.shadowColor = 'transparent'
    ctx.lineWidth = options.heavy
    ctx.lineJoin = 'round'
    ctx.strokeStyle = options.color ?? COLOR_TEXT
    ctx.strokeText(fit.text, 0, 0)
  }
  const width = ctx.measureText(fit.text).width
  ctx.restore()
  return { ...fit, width, angle }
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function iconCompass(ctx) {
  const face = ctx.createLinearGradient(-12, -12, 12, 12)
  face.addColorStop(0, '#f6e7c4')
  face.addColorStop(1, '#cfa65f')
  ctx.beginPath()
  ctx.arc(0, 0, 12.5, 0, Math.PI * 2)
  ctx.fillStyle = face
  ctx.fill()
  ctx.lineWidth = 1.6
  ctx.strokeStyle = '#a97c34'
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, 9, 0, Math.PI * 2)
  ctx.fillStyle = '#fbf3e0'
  ctx.fill()
  ctx.save()
  ctx.rotate(Math.PI / 4)
  ctx.beginPath()
  ctx.moveTo(0, -8)
  ctx.lineTo(3, 0)
  ctx.lineTo(-3, 0)
  ctx.closePath()
  ctx.fillStyle = '#e0463c'
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(0, 8)
  ctx.lineTo(3, 0)
  ctx.lineTo(-3, 0)
  ctx.closePath()
  ctx.fillStyle = '#46566e'
  ctx.fill()
  ctx.restore()
  ctx.beginPath()
  ctx.arc(0, 0, 1.4, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
}

function iconPalette(ctx) {
  const wood = ctx.createLinearGradient(-13, -10, 13, 10)
  wood.addColorStop(0, '#f0bf78')
  wood.addColorStop(1, '#d08e45')
  ctx.beginPath()
  ctx.ellipse(0, 0, 13, 10.5, -0.2, 0, Math.PI * 2)
  ctx.fillStyle = wood
  ctx.fill()
  ctx.lineWidth = 1.4
  ctx.strokeStyle = '#a86a2a'
  ctx.stroke()
  ctx.beginPath()
  ctx.ellipse(5.5, 3.6, 2.6, 2, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#4a3220'
  ctx.fill()
  const dots = [
    [-7.5, -1.5, '#e8453c'],
    [-3, -6, '#f7c531'],
    [3.2, -6.4, '#3fa7e8'],
    [8, -1.8, '#4cb85c'],
  ]
  for (const [x, y, color] of dots) {
    ctx.beginPath()
    ctx.arc(x, y, 2.4, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
  }
}

function iconGlobe(ctx) {
  const sea = ctx.createLinearGradient(-12, -12, 12, 12)
  sea.addColorStop(0, '#4da3ef')
  sea.addColorStop(1, '#2468c4')
  ctx.save()
  ctx.beginPath()
  ctx.arc(0, 0, 12.5, 0, Math.PI * 2)
  ctx.fillStyle = sea
  ctx.fill()
  ctx.clip()
  ctx.fillStyle = '#5fbf4a'
  const lands = [
    [-4.5, -3, 4.8, 6.4, 0.4],
    [5.5, 4.5, 4.2, 5.8, -0.3],
    [6.5, -7, 3.4, 2.2, 0],
  ]
  for (const [x, y, rx, ry, rot] of lands) {
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
  ctx.beginPath()
  ctx.arc(0, 0, 12.5, 0, Math.PI * 2)
  ctx.lineWidth = 1.4
  ctx.strokeStyle = '#1f5fae'
  ctx.stroke()
}

function iconMail(ctx) {
  roundedRect(ctx, -12.5, -8.5, 25, 17, 2.4)
  ctx.fillStyle = '#eef0f4'
  ctx.fill()
  ctx.lineWidth = 1.4
  ctx.strokeStyle = '#aab0bd'
  ctx.stroke()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 1.7
  ctx.beginPath()
  ctx.moveTo(-11.5, 7.5)
  ctx.lineTo(-3.5, 0.5)
  ctx.moveTo(11.5, 7.5)
  ctx.lineTo(3.5, 0.5)
  ctx.strokeStyle = '#d9534f'
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(-11.5, -7.5)
  ctx.lineTo(0, 1.5)
  ctx.lineTo(11.5, -7.5)
  ctx.strokeStyle = '#8d95a5'
  ctx.stroke()
}

function iconLink(ctx) {
  ctx.save()
  ctx.rotate(-Math.PI / 4)
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.strokeStyle = COLOR_LINK
  roundedRect(ctx, -14, -4.6, 16, 9.2, 4.6)
  ctx.stroke()
  roundedRect(ctx, -2, -4.6, 16, 9.2, 4.6)
  ctx.stroke()
  ctx.restore()
}

const ICON_DRAWERS = {
  compass: iconCompass,
  palette: iconPalette,
  globe: iconGlobe,
  mail: iconMail,
  link: iconLink,
}

function drawIcon(ctx, icon, centerX, centerY, color) {
  if (!icon || icon.type === 'blank') return
  ctx.save()
  ctx.translate(centerX, centerY)
  ctx.rotate(tiltAngle(centerY))
  if (icon.type === 'font') {
    ctx.font = '23px "Noto Color Emoji"'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(icon.value, 0, 8.7)
  } else if (icon.type === 'image') {
    ctx.drawImage(icon.image, -13.5, -13.5, 27, 27)
  } else if (icon.type === 'vector') {
    ICON_DRAWERS[icon.name](ctx)
  } else if (icon.type === 'glyph') {
    let size = 24
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = color
    ctx.font = `500 ${size}px ${FONT_STACK}`
    while (size > 12 && ctx.measureText(icon.value).width > 27) {
      size -= 1
      ctx.font = `500 ${size}px ${FONT_STACK}`
    }
    ctx.fillText(icon.value, 0, size * 0.34)
  }
  ctx.restore()
}

function drawAvatar(ctx, image) {
  const { x, y, photo, ring } = AVATAR
  ctx.save()
  ctx.shadowColor = 'rgba(232, 110, 214, 0.42)'
  ctx.shadowBlur = 14
  ctx.beginPath()
  ctx.arc(x, y, ring, 0, Math.PI * 2)
  ctx.lineWidth = 6
  ctx.strokeStyle = 'rgba(232, 110, 214, 0.5)'
  ctx.stroke()
  ctx.restore()
  ctx.save()
  let stroke
  if (typeof ctx.createConicGradient === 'function') {
    stroke = ctx.createConicGradient(0, x, y)
    stroke.addColorStop(0, '#b07af0')
    stroke.addColorStop(0.12, '#d466e8')
    stroke.addColorStop(0.22, '#ff9f4a')
    stroke.addColorStop(0.28, '#ffc45a')
    stroke.addColorStop(0.42, '#ffc866')
    stroke.addColorStop(0.53, '#f3a96e')
    stroke.addColorStop(0.62, '#ef7a88')
    stroke.addColorStop(0.70, '#e862c8')
    stroke.addColorStop(0.79, '#e45ed6')
    stroke.addColorStop(0.89, '#c986f4')
    stroke.addColorStop(1, '#b07af0')
  } else {
    stroke = ctx.createLinearGradient(x - ring, y + ring, x + ring, y - ring)
    stroke.addColorStop(0, '#ffc45a')
    stroke.addColorStop(0.35, '#ef7a88')
    stroke.addColorStop(0.65, '#e45ed6')
    stroke.addColorStop(1, '#b07af0')
  }
  ctx.beginPath()
  ctx.arc(x, y, ring, 0, Math.PI * 2)
  ctx.lineWidth = 6
  ctx.strokeStyle = stroke
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(x, y, ring - 7, 0, Math.PI * 2)
  ctx.lineWidth = 8
  ctx.strokeStyle = 'rgba(8, 10, 18, 0.92)'
  ctx.stroke()
  ctx.restore()
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, photo, 0, Math.PI * 2)
  ctx.clip()
  ctx.drawImage(image, x - photo, y - photo, photo * 2, photo * 2)
  ctx.restore()
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, photo + 1.5, 0, Math.PI * 2)
  ctx.lineWidth = 3.2
  ctx.strokeStyle = 'rgba(226, 229, 237, 0.55)'
  ctx.stroke()
  ctx.restore()
}

function drawVerified(ctx, anchorX, baseline, offsetX, offsetY) {
  ctx.save()
  ctx.translate(anchorX, baseline)
  ctx.rotate(tiltAngle(baseline))
  ctx.translate(offsetX, offsetY)
  ctx.beginPath()
  const points = 160
  for (let i = 0; i <= points; i += 1) {
    const theta = (i / points) * Math.PI * 2
    const radius = 14.6 * (0.93 + 0.07 * Math.cos(theta * 8))
    const px = Math.cos(theta) * radius
    const py = Math.sin(theta) * radius
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.fillStyle = COLOR_BADGE
  ctx.fill()
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2.7
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(-5.4, 0.4)
  ctx.lineTo(-1.6, 4.4)
  ctx.lineTo(5.8, -4.4)
  ctx.stroke()
  ctx.restore()
}

function drawStats(ctx, profile, textOf) {
  for (const column of STAT_COLUMNS) {
    drawText(ctx, textOf(profile[column.key]), column.x, column.valueY, {
      maxWidth: column.maxWidth,
      size: 33,
      minSize: 18,
      weight: 500,
      color: COLOR_WHITE,
      heavy: 0.9,
    })
    drawText(ctx, column.label, column.x + 1, column.labelY, {
      maxWidth: column.maxWidth,
      size: 23,
      minSize: 12,
      color: COLOR_SUBTEXT,
    })
  }
}

function drawDetailRow(ctx, entry, anyIcon, textOf) {
  const { row, marker, icon } = entry
  const color = row.key === 'link' ? COLOR_LINK : COLOR_TEXT
  if (marker) drawIcon(ctx, icon, row.iconX, row.iconY, color)
  drawText(ctx, textOf(entry.text), anyIcon ? row.x : row.iconX - 12.5, row.y, {
    maxWidth: anyIcon ? 660 : 690,
    size: 23.5,
    minSize: 12,
    color,
  })
}

function drawDynamicFields(ctx, profile, profileImage, emojiReady, rows) {
  const textOf = (value) => (emojiReady ? cleanText(value) : stripUnrenderable(value))
  const username = drawText(ctx, textOf(profile.username), USERNAME.x, USERNAME.y, {
    maxWidth: USERNAME.maxWidth,
    size: USERNAME.size,
    minSize: USERNAME.minSize,
    weight: 700,
    color: COLOR_WHITE,
  })
  drawVerified(ctx, USERNAME.x, USERNAME.y, username.width + 25, -11)
  drawText(ctx, textOf(profile.bio), BIO.x, BIO.y, {
    maxWidth: BIO.maxWidth,
    size: BIO.size,
    minSize: BIO.minSize,
    color: COLOR_SUBTEXT,
  })
  drawStats(ctx, profile, textOf)
  const anyIcon = rows.some((entry) => entry.marker)
  for (const entry of rows) drawDetailRow(ctx, entry, anyIcon, textOf)
  drawAvatar(ctx, profileImage)
}

export async function renderIgProfile3d(profileData, profileImageBuffer) {
  const emojiReady = await ensureEmojiFont()
  const [profileImage, template, rows] = await Promise.all([
    normalizeProfileImage(profileImageBuffer),
    getTemplateImage(),
    prepareRows(profileData, emojiReady),
  ])
  const canvas = createCanvas(OUTPUT_WIDTH, OUTPUT_HEIGHT)
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(template, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT)
  drawDynamicFields(ctx, profileData, profileImage, emojiReady, rows)
  ctx.save()
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.font = `600 17px ${FONT_STACK}`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = 'rgba(255,255,255,0.84)'
  ctx.shadowColor = 'rgba(0,0,0,0.78)'
  ctx.shadowBlur = 7
  ctx.fillText('By AlzRiss - Usanagi Umi AI', 26, OUTPUT_HEIGHT - 26)
  ctx.restore()
  const buffer = canvas.toBuffer('image/png')
  if (!Buffer.isBuffer(buffer) || buffer.length < 1024) throw Object.assign(new Error('Canvas tidak menghasilkan gambar yang valid.'), { code: 'CANVAS' })
  return { buffer, width: OUTPUT_WIDTH, height: OUTPUT_HEIGHT, mime: 'image/png' }
}
