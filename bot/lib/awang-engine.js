
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import { spawn, execFile } from 'node:child_process'
import { createCanvas, GlobalFonts } from '@napi-rs/canvas'
import sharp from 'sharp'

const BASE_WIDTH = 720
const BASE_HEIGHT = 1280
const BASE_FPS = 20
const OVERLAY_FPS = 20
const MAX_INPUT = 1400
const MAX_SCENES = 6
const MAX_VIDEO_SECONDS = 30
const MAX_VIDEO_BYTES = 45 * 1024 * 1024
const MAX_SOURCE_VIDEO_BYTES = 50 * 1024 * 1024
const MIN_SOURCE_DURATION_SECONDS = 1.2
const MIN_SCENE_MS = 2200
const MAX_SCENE_MS = 5600
const MAX_QUOTE_LINES = 7
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const STYLE_NAMES = ['cinematic', 'glass', 'neon', 'paper', 'minimal']
const FONT_NAMES = ['serif', 'sans', 'display', 'mono', 'script']
const PACE_NAMES = ['slow', 'normal', 'fast']
const busyJobs = new Set()
let usanagiFontReady = false
let ffmpegPathPromise = null

const STYLES = {
  cinematic: {
    name: 'CINEMATIC',
    bg: ['#040507', '#141821', '#020204'],
    ink: '#f7f1e8',
    muted: '#b8b1a7',
    accent: '#d8bf97',
    accent2: '#6d7891',
    panel: 'rgba(6, 8, 12, 0.54)',
    soft: 'rgba(6, 8, 12, 0.72)',
    border: 'rgba(247, 241, 232, 0.58)',
    glow: 'rgba(216, 191, 151, 0.22)',
    tag: 'CINEMATIC',
    font: 'serif',
    frame: 'film',
  },
  glass: {
    name: 'GLASS',
    bg: ['#041115', '#123d46', '#03080b'],
    ink: '#efffff',
    muted: '#a9c4c8',
    accent: '#9de5da',
    accent2: '#63bed0',
    panel: 'rgba(7, 27, 32, 0.34)',
    soft: 'rgba(7, 27, 32, 0.62)',
    border: 'rgba(228, 255, 252, 0.46)',
    glow: 'rgba(157, 229, 218, 0.24)',
    tag: 'GLASS',
    font: 'sans',
    frame: 'capsule',
  },
  neon: {
    name: 'NEON',
    bg: ['#06030b', '#1a0e2f', '#020207'],
    ink: '#fff6ff',
    muted: '#b8a8cb',
    accent: '#ff63d9',
    accent2: '#69e7ff',
    panel: 'rgba(10, 5, 22, 0.46)',
    soft: 'rgba(10, 5, 22, 0.70)',
    border: 'rgba(242, 227, 255, 0.52)',
    glow: 'rgba(255, 99, 217, 0.24)',
    tag: 'NEON',
    font: 'mono',
    frame: 'signal',
  },
  paper: {
    name: 'PAPER',
    bg: ['#beb7aa', '#eee7db', '#a9a092'],
    ink: '#181817',
    muted: '#68635c',
    accent: '#9d5046',
    accent2: '#746e64',
    panel: 'rgba(248, 244, 235, 0.78)',
    soft: 'rgba(248, 244, 235, 0.92)',
    border: 'rgba(24, 24, 23, 0.34)',
    glow: 'rgba(157, 80, 70, 0.12)',
    tag: 'PAPER',
    font: 'serif',
    frame: 'editorial',
  },
  minimal: {
    name: 'MINIMAL',
    bg: ['#0c0d10', '#191b1f', '#070809'],
    ink: '#f4f4f0',
    muted: '#9f9fa0',
    accent: '#ffffff',
    accent2: '#6e7077',
    panel: 'rgba(10, 11, 13, 0.30)',
    soft: 'rgba(10, 11, 13, 0.62)',
    border: 'rgba(244, 244, 240, 0.42)',
    glow: 'rgba(255, 255, 255, 0.08)',
    tag: 'MINIMAL',
    font: 'sans',
    frame: 'clean',
  },
}

const FONT_FAMILIES = {
  serif: 'Georgia',
  sans: 'Arial',
  display: 'Arial',
  mono: 'Courier New',
  script: 'UsanagiNulis',
}

const FALLBACK_FONT_FAMILIES = {
  serif: 'Georgia',
  sans: 'Arial',
  display: 'Arial',
  mono: 'Courier New',
  script: 'Georgia',
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function hashSeed(value) {
  return crypto.createHash('sha256').update(String(value)).digest().readUInt32LE(0) || 1
}

function createRng(seed) {
  let x = seed >>> 0
  return () => {
    x ^= x << 13
    x ^= x >>> 17
    x ^= x << 5
    return ((x >>> 0) % 100000) / 100000
  }
}

function sanitizeText(text) {
  return String(text || '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function canonicalStyle(value) {
  const token = String(value || '').toLowerCase().trim()
  const aliases = {
    cinematik: 'cinematic',
    cinema: 'cinematic',
    cinematic: 'cinematic',
    aesthetic: 'cinematic',
    kaca: 'glass',
    glass: 'glass',
    bening: 'glass',
    neon: 'neon',
    cyber: 'neon',
    paper: 'paper',
    kertas: 'paper',
    minimal: 'minimal',
    minimalis: 'minimal',
  }
  return aliases[token] || null
}

function canonicalFont(value) {
  const token = String(value || '').toLowerCase().trim()
  const aliases = {
    serif: 'serif',
    sans: 'sans',
    display: 'display',
    bold: 'display',
    mono: 'mono',
    script: 'script',
    skrip: 'script',
  }
  return aliases[token] || null
}

function canonicalPace(value) {
  const token = String(value || '').toLowerCase().trim()
  if (token === 'slow' || token === 'pelan' || token === 'slowmo') return 'slow'
  if (token === 'fast' || token === 'cepat') return 'fast'
  if (token === 'normal' || token === 'standar') return 'normal'
  return null
}

function canonicalFrame(value) {
  const token = String(value || '').toLowerCase().trim()
  const aliases = {
    film: 'film',
    cinema: 'film',
    cinematic: 'film',
    capsule: 'capsule',
    glass: 'capsule',
    signal: 'signal',
    neon: 'signal',
    editorial: 'editorial',
    paper: 'editorial',
    clean: 'clean',
    minimal: 'clean',
    auto: 'auto',
  }
  return aliases[token] || null
}

function canonicalMotion(value) {
  const token = String(value || '').toLowerCase().trim()
  const aliases = {
    calm: 'calm',
    tenang: 'calm',
    drift: 'drift',
    mengalir: 'drift',
    zoom: 'zoom',
    zoomin: 'zoom',
    float: 'float',
    mengambang: 'float',
    cinematic: 'cinematic',
    sinematik: 'cinematic',
    auto: 'auto',
  }
  return aliases[token] || null
}

export function parseArgs(text) {
  let source = String(text || '').trim()
  const options = { style: 'auto', font: 'auto', pace: 'normal', frame: 'auto', motion: 'auto', storyText: { tabs: ['Healing', 'Nature', 'Escape'], the: 'The' } }
  const patterns = [
    { key: 'style', regex: /(?:^|\s)(?:--style|style)\s*(?:=|:)??\s*(cinematic|cinematik|cinema|aesthetic|glass|kaca|neon|cyber|paper|kertas|minimal|minimalis)(?=\s|$)/i },
    { key: 'font', regex: /(?:^|\s)(?:--font|font)\s*(?:=|:)??\s*(serif|sans|display|bold|mono|script|skrip)(?=\s|$)/i },
    { key: 'pace', regex: /(?:^|\s)(?:--pace|pace)\s*(?:=|:)??\s*(slow|pelan|slowmo|normal|standar|fast|cepat)(?=\s|$)/i },
    { key: 'frame', regex: /(?:^|\s)(?:--frame|frame)\s*(?:=|:)??\s*(film|cinema|cinematic|capsule|glass|signal|neon|editorial|paper|clean|minimal|auto)(?=\s|$)/i },
    { key: 'motion', regex: /(?:^|\s)(?:--motion|motion)\s*(?:=|:)??\s*(calm|tenang|drift|mengalir|zoom|zoomin|float|mengambang|cinematic|sinematik|auto)(?=\s|$)/i },
  ]

  for (const item of patterns) {
    const match = source.match(item.regex)
    if (!match) continue
    if (item.key === 'style') options.style = canonicalStyle(match[1]) || 'auto'
    if (item.key === 'font') options.font = canonicalFont(match[1]) || 'auto'
    if (item.key === 'pace') options.pace = canonicalPace(match[1]) || 'normal'
    if (item.key === 'frame') options.frame = canonicalFrame(match[1]) || 'auto'
    if (item.key === 'motion') options.motion = canonicalMotion(match[1]) || 'auto'
    source = source.replace(match[0], ' ')
  }

  const customParts = source.split('|')
  source = customParts.shift()?.replace(/\s+/g, ' ').trim() || ''
  if (customParts.length) {
    const tabValues = String(customParts.shift() || '').split(',')
    for (let index = 0; index < 3; index++) {
      const value = sanitizeText(tabValues[index])
      if (value) options.storyText.tabs[index] = value
    }
    const the = sanitizeText(customParts.shift())
    if (the) options.storyText.the = the
  }

  source = source.replace(/\s+/g, ' ').trim()
  return { text: source, options }
}

function splitText(text, maxChars = 230) {
  const words = String(text).split(/\s+/).filter(Boolean)
  const lines = []
  let current = ''
  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (!current || next.length <= maxChars) {
      current = next
      continue
    }
    lines.push(current)
    current = word
  }
  if (current) lines.push(current)
  return lines
}

function splitStory(text) {
  const normalized = sanitizeText(text)
  const pieces = normalized
    .replace(/\|/g, '\n')
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean)

  const scenes = []
  for (const piece of pieces) {
    const sentences = piece.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g) || [piece]
    for (const sentence of sentences) {
      const clean = sentence.replace(/\s+/g, ' ').trim()
      if (clean) scenes.push(...splitText(clean, 230))
    }
  }

  if (scenes.length <= MAX_SCENES) return scenes
  const grouped = []
  const chunkSize = Math.ceil(scenes.length / MAX_SCENES)
  for (let i = 0; i < scenes.length; i += chunkSize) {
    grouped.push(scenes.slice(i, i + chunkSize).join(' '))
  }
  return grouped.slice(0, MAX_SCENES)
}

function chooseStyle(style, index, text) {
  if (style && style !== 'auto' && STYLES[style]) return STYLES[style]
  const hint = String(text || '').toLowerCase()
  if (/(malam|sunyi|rindu|kehilangan|sedih|sendiri|hujan)/.test(hint)) return STYLES.cinematic
  if (/(laut|tenang|damai|cahaya|alam|harapan|langit)/.test(hint)) return STYLES.glass
  if (/(future|digital|neon|kota|cyber|listrik)/.test(hint)) return STYLES.neon
  if (/(surat|kenangan|masa lalu|dulu|cerita)/.test(hint)) return STYLES.paper
  return STYLES[STYLE_NAMES[index % STYLE_NAMES.length]]
}

function chooseFont(style, requested, index) {
  if (requested && requested !== 'auto' && FONT_NAMES.includes(requested)) return requested
  if (style?.font && FONT_NAMES.includes(style.font)) return style.font
  return ['serif', 'sans', 'display', 'mono'][index % 4]
}

function chooseFrame(style, requested) {
  if (requested && requested !== 'auto') return requested
  return style?.frame || 'film'
}

function chooseMotion(requested, styleName) {
  if (requested && requested !== 'auto') return requested
  if (styleName === 'NEON') return 'float'
  if (styleName === 'PAPER') return 'drift'
  if (styleName === 'MINIMAL') return 'calm'
  if (styleName === 'GLASS') return 'drift'
  return 'cinematic'
}

function paceFactor(pace) {
  if (pace === 'slow') return 1.22
  if (pace === 'fast') return 0.84
  return 1
}

function chooseOverlayFps(durationSeconds) {
  const duration = Number(durationSeconds) || 0
  if (duration <= 8) return OVERLAY_FPS
  if (duration <= 16) return 18
  return 15
}

function sceneDurationMs(text, pace) {
  return clamp(Math.round((3000 + String(text).length * 11) * paceFactor(pace)), MIN_SCENE_MS, MAX_SCENE_MS)
}

function fitSceneDurations(scenes, totalMs) {
  if (!scenes.length) return []
  const minTotal = scenes.length * MIN_SCENE_MS
  const maxTotal = scenes.length * MAX_SCENE_MS
  const boundedTotal = clamp(Math.round(totalMs), minTotal, maxTotal)
  const weights = scenes.map((scene) => Math.max(1, scene.text.length))
  const totalWeight = weights.reduce((sum, value) => sum + value, 0)
  const durations = scenes.map((scene, index) => Math.round(boundedTotal * (weights[index] / totalWeight)))
  let delta = boundedTotal - durations.reduce((sum, value) => sum + value, 0)
  let cursor = durations.length - 1
  while (delta !== 0 && durations.length) {
    const step = delta > 0 ? 1 : -1
    const next = durations[cursor] + step
    if (next >= MIN_SCENE_MS && next <= MAX_SCENE_MS) {
      durations[cursor] = next
      delta -= step
    }
    cursor = cursor > 0 ? cursor - 1 : durations.length - 1
  }
  return durations
}

function makeScenes(text, options, forcedDurationMs = null) {
  let parts = splitStory(text)
  if (!parts.length) return []
  if (forcedDurationMs !== null && parts.length > 3) parts = parts.slice(0, 3)
  const scenes = parts.map((sceneText, index) => {
    const style = chooseStyle(options.style, index, sceneText)
    return {
      index,
      text: sceneText,
      style,
      styleName: style.name,
      fontFamily: chooseFont(style, options.font, index),
      frameStyle: chooseFrame(style, options.frame),
      motion: chooseMotion(options.motion, style.name),
    }
  })

  const durations = forcedDurationMs === null
    ? scenes.map((scene) => sceneDurationMs(scene.text, options.pace))
    : fitSceneDurations(scenes, forcedDurationMs)

  let startMs = 0
  return scenes.map((scene, index) => {
    const durationMs = durations[index]
    const result = { ...scene, durationMs, startMs }
    startMs += durationMs
    return result
  })
}

function ensureUsanagiFont() {
  if (usanagiFontReady) return
  usanagiFontReady = true
  const candidates = [
    path.join(process.cwd(), 'assets', 'fonts', 'usanagi-nulis.ttf'),
    path.join(process.cwd(), 'assets', 'fonts', 'Usanagi-Nulis.ttf'),
    path.join(process.cwd(), 'fonts', 'usanagi-nulis.ttf'),
  ]
  for (const fontPath of candidates) {
    try {
      if (GlobalFonts.registerFromPath(fontPath, 'UsanagiNulis')) break
    } catch {
    }
  }
}

function rgba(hex, alpha) {
  const clean = String(hex || '').replace('#', '')
  if (clean.length !== 6) return `rgba(255,255,255,${alpha})`
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + width - r, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + r)
  ctx.lineTo(x + width, y + height - r)
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  ctx.lineTo(x + r, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function wrapForCanvas(ctx, text, maxWidth, maxLines, fontSpec) {
  ctx.font = fontSpec
  const words = String(text).split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (!line || ctx.measureText(candidate).width <= maxWidth) {
      line = candidate
      continue
    }
    lines.push(line)
    line = word
  }
  if (line) lines.push(line)
  if (lines.length <= maxLines) return lines
  const clipped = lines.slice(0, maxLines)
  let finalLine = clipped[maxLines - 1]
  for (let i = maxLines; i < lines.length; i++) {
    const candidate = `${finalLine} ${lines[i]}`
    if (ctx.measureText(`${candidate}…`).width > maxWidth) break
    finalLine = candidate
  }
  clipped[maxLines - 1] = `${finalLine}…`
  return clipped
}

function fitQuote(ctx, text, familyKey, width) {
  const family = FONT_FAMILIES[familyKey] || FALLBACK_FONT_FAMILIES.sans
  const fallback = FALLBACK_FONT_FAMILIES[familyKey] || FALLBACK_FONT_FAMILIES.sans
  const start = familyKey === 'script' ? 84 : familyKey === 'display' ? 82 : 88
  for (let size = start; size >= 40; size -= 2) {
    const weight = familyKey === 'display' ? 700 : familyKey === 'sans' ? 600 : 500
    const spec = `${weight} ${size}px ${family}`
    const lines = wrapForCanvas(ctx, text, width, MAX_QUOTE_LINES, spec)
    const widest = Math.max(...lines.map((line) => ctx.measureText(line).width), 0)
    if (lines.length <= MAX_QUOTE_LINES && widest <= width) {
      return { size, family, spec, lines, weight }
    }
  }
  const size = 40
  const spec = `500 ${size}px ${fallback}`
  return { size, family: fallback, spec, lines: wrapForCanvas(ctx, text, width, MAX_QUOTE_LINES, spec), weight: 500 }
}

function easeOutCubic(value) {
  const t = clamp(value, 0, 1)
  return 1 - Math.pow(1 - t, 3)
}

function easeInOut(value) {
  const t = clamp(value, 0, 1)
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function sceneAtTime(scenes, timeMs) {
  if (!scenes.length) return null
  const time = Math.max(0, Number(timeMs) || 0)
  for (let i = scenes.length - 1; i >= 0; i--) {
    if (time >= scenes[i].startMs) return scenes[i]
  }
  return scenes[0]
}

function sceneProgress(scene, timeMs) {
  return clamp((timeMs - scene.startMs) / Math.max(1, scene.durationMs), 0, 1)
}

function drawAmbientBackground(ctx, style, width, height, seedText, timeSeconds) {
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, style.bg[0])
  gradient.addColorStop(0.5, style.bg[1])
  gradient.addColorStop(1, style.bg[2])
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)
  const random = createRng(hashSeed(`${seedText}:ambient:${style.name}`))
  for (let i = 0; i < 16; i++) {
    const x = random() * width + Math.sin(timeSeconds * 0.22 + i) * 22
    const y = random() * height
    const radius = 20 + random() * 105
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius)
    glow.addColorStop(0, rgba(i % 2 ? style.accent : style.accent2, 0.14))
    glow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = glow
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
  }
  const mist = ctx.createLinearGradient(0, height * 0.56, 0, height)
  mist.addColorStop(0, 'rgba(255,255,255,0)')
  mist.addColorStop(1, rgba(style.accent2, 0.04))
  ctx.fillStyle = mist
  ctx.fillRect(0, height * 0.52, width, height * 0.48)
  ctx.save()
  ctx.globalAlpha = style.name === 'PAPER' ? 0.08 : 0.05
  ctx.strokeStyle = style.border
  ctx.lineWidth = 1
  const offset = (timeSeconds * 22) % 70
  for (let y = -height + offset; y < height * 2; y += 70) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y - width * 0.20)
    ctx.stroke()
  }
  ctx.restore()
  const vignette = ctx.createRadialGradient(width / 2, height / 2, height * 0.14, width / 2, height / 2, height * 0.84)
  vignette.addColorStop(0, 'rgba(0,0,0,0)')
  vignette.addColorStop(0.68, 'rgba(0,0,0,0.06)')
  vignette.addColorStop(1, 'rgba(0,0,0,0.72)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, width, height)
}

function drawFrame(ctx, style, width, height, frameStyle, timeSeconds) {
  const pulse = 0.5 + 0.5 * Math.sin(timeSeconds * 1.8)
  ctx.save()
  if (frameStyle === 'film') {
    ctx.strokeStyle = style.border
    ctx.lineWidth = 2
    roundedRect(ctx, 28, 28, width - 56, height - 56, 26)
    ctx.stroke()
    ctx.strokeStyle = rgba(style.accent, 0.25 + pulse * 0.10)
    ctx.lineWidth = 4
    const len = 104
    const pad = 46
    const segments = [[pad, pad, pad + len, pad], [width - pad - len, pad, width - pad, pad], [pad, height - pad, pad + len, height - pad], [width - pad - len, height - pad, width - pad, height - pad]]
    for (const [x1, y1, x2, y2] of segments) {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
    }
  } else if (frameStyle === 'capsule') {
    ctx.strokeStyle = rgba(style.border, 0.78)
    ctx.lineWidth = 2
    roundedRect(ctx, 24, 24, width - 48, height - 48, 40)
    ctx.stroke()
    ctx.strokeStyle = rgba(style.accent2, 0.22 + pulse * 0.08)
    ctx.lineWidth = 1
    roundedRect(ctx, 42, 42, width - 84, height - 84, 28)
    ctx.stroke()
  } else if (frameStyle === 'signal') {
    ctx.shadowColor = style.glow
    ctx.shadowBlur = 18
    ctx.strokeStyle = rgba(style.accent, 0.26 + pulse * 0.16)
    ctx.lineWidth = 2
    roundedRect(ctx, 26, 26, width - 52, height - 52, 24)
    ctx.stroke()
    ctx.shadowColor = 'transparent'
    ctx.strokeStyle = rgba(style.accent2, 0.40)
    ctx.lineWidth = 3
    const dash = 28 + pulse * 22
    ctx.beginPath(); ctx.moveTo(44, 68); ctx.lineTo(44 + dash, 68); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(width - 44 - dash, height - 68); ctx.lineTo(width - 44, height - 68); ctx.stroke()
  } else if (frameStyle === 'editorial') {
    ctx.strokeStyle = style.border
    ctx.lineWidth = 1.3
    roundedRect(ctx, 34, 34, width - 68, height - 68, 18)
    ctx.stroke()
    ctx.fillStyle = rgba(style.accent, 0.24)
    ctx.fillRect(58, 70, 96 + pulse * 18, 3)
  } else {
    ctx.strokeStyle = rgba(style.border, 0.86)
    ctx.lineWidth = 1.6
    roundedRect(ctx, 30, 30, width - 60, height - 60, 22)
    ctx.stroke()
  }
  ctx.restore()
}

function drawHeader(ctx, style, scene, width, timeMs, totalScenes) {
  const x = 60
  const y = 94
  const pulse = 0.5 + 0.5 * Math.sin(timeMs / 700)
  ctx.save()
  ctx.font = `600 14px ${FONT_FAMILIES.sans}`
  ctx.fillStyle = style.muted
  ctx.fillText('STORYVIDEO', x, y)
  ctx.textAlign = 'right'
  ctx.fillText(`${String(scene.index + 1).padStart(2, '0')} / ${String(totalScenes).padStart(2, '0')}`, width - x, y)
  ctx.textAlign = 'left'
  roundedRect(ctx, x, y + 18, 126, 34, 17)
  ctx.fillStyle = style.panel
  ctx.fill()
  ctx.strokeStyle = rgba(style.accent, 0.26 + pulse * 0.10)
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.font = `600 12px ${FONT_FAMILIES.sans}`
  ctx.fillStyle = style.accent
  ctx.fillText(style.tag, x + 17, y + 40)
  ctx.font = `500 12px ${FONT_FAMILIES.sans}`
  ctx.fillStyle = style.muted
  ctx.fillText(scene.fontFamily.toUpperCase(), x + 142, y + 40)
  ctx.restore()
}

function drawTextLines(ctx, lines, fit, style, x, top, maxWidth, progress, align = 'left') {
  const lineHeight = Math.round(fit.size * 1.13)
  const visible = clamp(progress / 0.54, 0, 1)
  ctx.save()
  ctx.textAlign = align
  ctx.textBaseline = 'top'
  for (let index = 0; index < lines.length; index++) {
    const reveal = easeOutCubic(clamp((visible - index * 0.055) / 0.26, 0, 1))
    ctx.globalAlpha = reveal
    ctx.font = fit.spec
    ctx.fillStyle = style.ink
    ctx.shadowColor = rgba('#000000', 0.58)
    ctx.shadowBlur = 12
    const line = fit.weight >= 700 ? lines[index].toUpperCase() : lines[index]
    ctx.fillText(line, x, top + index * lineHeight + (1 - reveal) * 34, maxWidth)
  }
  ctx.restore()
}

function drawCinematicLayout(ctx, style, scene, width, height, progress) {
  const fit = fitQuote(ctx, scene.text, scene.fontFamily, width - 132)
  const lineHeight = Math.round(fit.size * 1.13)
  const cardW = width - 116
  const cardH = clamp(fit.lines.length * lineHeight + 180, 310, 670)
  const baseY = clamp(height * 0.40 - cardH / 2, 300, height - cardH - 195)
  const enter = easeOutCubic(clamp(progress / 0.22, 0, 1))
  const exit = easeInOut(clamp((progress - 0.82) / 0.18, 0, 1))
  const alpha = clamp(enter * (1 - exit), 0, 1)
  const scale = 0.96 + enter * 0.04 - exit * 0.01
  const y = baseY + (1 - enter) * 50 - exit * 18
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(width / 2, y + cardH / 2)
  ctx.scale(scale, scale)
  ctx.translate(-width / 2, -(y + cardH / 2))
  roundedRect(ctx, 58, y, cardW, cardH, 30)
  ctx.fillStyle = style.panel
  ctx.fill()
  ctx.strokeStyle = rgba(style.border, 0.58)
  ctx.lineWidth = 1.4
  ctx.stroke()
  ctx.fillStyle = style.accent
  ctx.fillRect(92, y + 36, 78, 4)
  ctx.font = `600 13px ${FONT_FAMILIES.sans}`
  ctx.fillStyle = style.accent
  ctx.fillText('WORDS THAT STAY', 92, y + 68)
  drawTextLines(ctx, fit.lines, fit, style, width / 2, y + 108, width - 164, progress, 'center')
  ctx.font = `500 12px ${FONT_FAMILIES.sans}`
  ctx.fillStyle = style.muted
  ctx.fillText(`SCENE ${String(scene.index + 1).padStart(2, '0')}`, 92, y + cardH - 38)
  ctx.textAlign = 'right'
  ctx.fillText(style.name, width - 92, y + cardH - 38)
  ctx.restore()
}

function drawGlassLayout(ctx, style, scene, width, height, progress) {
  const fit = fitQuote(ctx, scene.text, scene.fontFamily, width - 172)
  const lineHeight = Math.round(fit.size * 1.10)
  const h = clamp(fit.lines.length * lineHeight + 190, 340, 640)
  const w = width - 92
  const enter = easeOutCubic(clamp(progress / 0.20, 0, 1))
  const exit = easeInOut(clamp((progress - 0.83) / 0.17, 0, 1))
  const alpha = clamp(enter * (1 - exit), 0, 1)
  const y = height * 0.42 - h / 2 + (1 - enter) * 55 - exit * 18
  const x = (width - w) / 2
  ctx.save()
  ctx.globalAlpha = alpha
  roundedRect(ctx, x, y, w, h, 42)
  ctx.fillStyle = style.panel
  ctx.fill()
  ctx.strokeStyle = rgba(style.border, 0.62)
  ctx.lineWidth = 1.5
  ctx.stroke()
  roundedRect(ctx, x + 24, y + 24, 156, 34, 17)
  ctx.fillStyle = rgba(style.accent, 0.11)
  ctx.fill()
  ctx.strokeStyle = rgba(style.accent, 0.28)
  ctx.stroke()
  ctx.font = `600 12px ${FONT_FAMILIES.sans}`
  ctx.fillStyle = style.accent
  ctx.fillText('AESTHETIC QUOTE', x + 42, y + 46)
  drawTextLines(ctx, fit.lines, fit, style, width / 2, y + 104, width - 160, progress, 'center')
  ctx.font = `500 12px ${FONT_FAMILIES.sans}`
  ctx.fillStyle = style.muted
  ctx.textAlign = 'center'
  ctx.fillText('STORYVIDEO', width / 2, y + h - 38)
  ctx.restore()
}

function drawNeonLayout(ctx, style, scene, width, height, progress, timeSeconds) {
  const fit = fitQuote(ctx, scene.text, scene.fontFamily, width - 140)
  const lineHeight = Math.round(fit.size * 1.10)
  const totalHeight = fit.lines.length * lineHeight
  const enter = easeOutCubic(clamp(progress / 0.20, 0, 1))
  const exit = easeInOut(clamp((progress - 0.83) / 0.17, 0, 1))
  const alpha = clamp(enter * (1 - exit), 0, 1)
  const top = height * 0.41 - totalHeight / 2 + (1 - enter) * 46 - exit * 18
  const pulse = 0.5 + 0.5 * Math.sin(timeSeconds * 2.3)
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = rgba(style.accent2, 0.12)
  ctx.fillRect(58, top - 34, 5, totalHeight + 48)
  ctx.fillStyle = rgba(style.accent, 0.12)
  ctx.fillRect(width - 63, top - 34, 5, totalHeight + 48)
  drawTextLines(ctx, fit.lines, fit, style, width / 2, top, width - 148, progress, 'center')
  const lineY = top + totalHeight + 34
  const lineW = 180 + pulse * 90
  ctx.strokeStyle = style.accent
  ctx.shadowColor = style.glow
  ctx.shadowBlur = 16
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(width / 2 - lineW / 2, lineY); ctx.lineTo(width / 2 + lineW / 2, lineY); ctx.stroke()
  ctx.shadowColor = 'transparent'
  ctx.font = `600 12px ${FONT_FAMILIES.mono}`
  ctx.fillStyle = style.muted
  ctx.textAlign = 'center'
  ctx.fillText('SIGNAL / STORY', width / 2, lineY + 28)
  ctx.restore()
}

function drawPaperLayout(ctx, style, scene, width, height, progress, timeSeconds) {
  const fit = fitQuote(ctx, scene.text, scene.fontFamily, width - 178)
  const lineHeight = Math.round(fit.size * 1.08)
  const cardW = width - 94
  const cardH = clamp(fit.lines.length * lineHeight + 178, 320, 640)
  const enter = easeOutCubic(clamp(progress / 0.22, 0, 1))
  const exit = easeInOut(clamp((progress - 0.82) / 0.18, 0, 1))
  const alpha = clamp(enter * (1 - exit), 0, 1)
  const centerY = height * 0.45 + (1 - enter) * 46 - exit * 18
  const x = (width - cardW) / 2
  const y = centerY - cardH / 2
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(width / 2, centerY)
  ctx.rotate(-0.012 + Math.sin(timeSeconds * 0.35) * 0.004)
  ctx.translate(-width / 2, -centerY)
  ctx.shadowColor = 'rgba(0,0,0,0.24)'
  ctx.shadowBlur = 28
  ctx.shadowOffsetY = 16
  roundedRect(ctx, x, y, cardW, cardH, 10)
  ctx.fillStyle = style.soft
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.shadowOffsetY = 0
  ctx.strokeStyle = rgba(style.border, 0.42)
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.fillStyle = style.accent
  ctx.fillRect(x + 34, y + 34, 58, 3)
  ctx.font = `600 12px ${FONT_FAMILIES.sans}`
  ctx.fillStyle = style.muted
  ctx.fillText('A NOTE TO KEEP', x + 34, y + 60)
  drawTextLines(ctx, fit.lines, fit, style, width / 2, y + 106, width - 160, progress, 'center')
  ctx.font = `500 11px ${FONT_FAMILIES.sans}`
  ctx.fillStyle = style.muted
  ctx.textAlign = 'right'
  ctx.fillText(`PAGE ${String(scene.index + 1).padStart(2, '0')}`, x + cardW - 28, y + cardH - 24)
  ctx.restore()
}

function drawMinimalLayout(ctx, style, scene, width, height, progress) {
  const fit = fitQuote(ctx, scene.text, scene.fontFamily, width - 108)
  const lineHeight = Math.round(fit.size * 1.10)
  const totalHeight = fit.lines.length * lineHeight
  const enter = easeOutCubic(clamp(progress / 0.20, 0, 1))
  const exit = easeInOut(clamp((progress - 0.84) / 0.16, 0, 1))
  const alpha = clamp(enter * (1 - exit), 0, 1)
  const top = height * 0.43 - totalHeight / 2 + (1 - enter) * 38 - exit * 16
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = style.accent
  ctx.fillRect(56, top - 44, 54, 3)
  drawTextLines(ctx, fit.lines, fit, style, 56, top, width - 112, progress, 'left')
  ctx.font = `500 12px ${FONT_FAMILIES.sans}`
  ctx.fillStyle = style.muted
  ctx.fillText(`STORY ${String(scene.index + 1).padStart(2, '0')}  /  ${style.name}`, 56, top + totalHeight + 42)
  ctx.restore()
}

function drawDecor(ctx, style, width, height, timeSeconds, seedText, sceneIndex) {
  const random = createRng(hashSeed(`${seedText}:decor:${sceneIndex}`))
  ctx.save()
  ctx.globalAlpha = 0.10 + (0.5 + 0.5 * Math.sin(timeSeconds * 1.3)) * 0.05
  for (let i = 0; i < 8; i++) {
    const x = random() * width
    const y = random() * height + Math.sin(timeSeconds * (0.4 + random() * 0.35) + i) * 16
    ctx.fillStyle = i % 2 ? style.accent : style.accent2
    ctx.beginPath()
    ctx.arc(x, y, 1.2 + random() * 3.4, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 0.18
  ctx.strokeStyle = style.border
  ctx.lineWidth = 1
  const scan = (timeSeconds * 38) % height
  ctx.beginPath(); ctx.moveTo(58, scan); ctx.lineTo(width - 58, scan - 20); ctx.stroke()
  ctx.restore()
}

function drawMotionSweep(ctx, style, width, height, timeSeconds, progress) {
  const sweep = ((timeSeconds * 0.16 + progress * 0.12) % 1.35) - 0.18
  const x = sweep * width
  const beam = ctx.createLinearGradient(x - 160, 0, x + 160, 0)
  beam.addColorStop(0, 'rgba(255,255,255,0)')
  beam.addColorStop(0.5, rgba(style.accent, 0.07))
  beam.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.save()
  ctx.translate(x, height * 0.50)
  ctx.rotate(-0.17)
  ctx.globalCompositeOperation = 'screen'
  ctx.fillStyle = beam
  ctx.fillRect(-220, -height, 440, height * 2)
  ctx.restore()
}


function easeOutBack(value) {
  const t = clamp(value, 0, 1)
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

function drawAnimatedBorder(ctx, style, width, height, progress, timeSeconds) {
  const perimeter = (width * 2) + (height * 2)
  const draw = clamp(progress / 0.72, 0, 1)
  const pulse = 0.48 + 0.14 * Math.sin(timeSeconds * 2.1)
  ctx.save()
  ctx.strokeStyle = rgba(style.border, 0.88)
  ctx.lineWidth = 1.5
  roundedRect(ctx, 26, 26, width - 52, height - 52, 30)
  ctx.stroke()
  ctx.strokeStyle = rgba(style.accent, 0.20 + pulse)
  ctx.lineWidth = 3.5
  ctx.setLineDash([110, perimeter])
  ctx.lineDashOffset = -perimeter * draw
  roundedRect(ctx, 30, 30, width - 60, height - 60, 26)
  ctx.stroke()
  ctx.setLineDash([])
  ctx.strokeStyle = rgba(style.ink, 0.34)
  ctx.lineWidth = 1
  const inset = 52
  const mark = 58 + 18 * Math.sin(timeSeconds * 1.4)
  ctx.beginPath(); ctx.moveTo(inset, inset); ctx.lineTo(inset + mark, inset); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(width - inset - mark, height - inset); ctx.lineTo(width - inset, height - inset); ctx.stroke()
  ctx.restore()
}

function drawStoryboardChip(ctx, x, y, text, style, active = false) {
  ctx.save()
  ctx.font = `600 11px ${FONT_FAMILIES.sans}`
  const w = ctx.measureText(text).width + 26
  roundedRect(ctx, x, y, w, 30, 15)
  ctx.fillStyle = active ? rgba(style.accent, 0.18) : rgba(style.soft, 0.72)
  ctx.fill()
  ctx.strokeStyle = active ? rgba(style.accent, 0.60) : rgba(style.border, 0.30)
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.fillStyle = active ? style.ink : style.muted
  ctx.fillText(text, x + 13, y + 19.5)
  ctx.restore()
  return w
}

function drawStoryWords(ctx, fit, style, x, y, progress) {
  const lineHeight = Math.round(fit.size * 1.08)
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.font = fit.spec
  ctx.shadowColor = 'rgba(0,0,0,0.52)'
  ctx.shadowBlur = 16
  for (let lineIndex = 0; lineIndex < fit.lines.length; lineIndex++) {
    const words = fit.lines[lineIndex].split(/\s+/).filter(Boolean)
    const lineWidth = ctx.measureText(fit.lines[lineIndex]).width
    let cursor = x - lineWidth / 2
    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
      const word = words[wordIndex]
      const wordWidth = ctx.measureText(word).width
      const start = 0.10 + lineIndex * 0.07 + wordIndex * 0.035
      const local = clamp((progress - start) / 0.28, 0, 1)
      const eased = easeOutCubic(local)
      const lift = (1 - eased) * 28
      const scale = 0.86 + eased * 0.14
      const centerX = cursor + wordWidth / 2
      ctx.save()
      ctx.globalAlpha = eased
      ctx.translate(centerX, y + lineIndex * lineHeight + fit.size * 0.5)
      ctx.scale(scale, scale)
      ctx.translate(-centerX, -(y + lineIndex * lineHeight + fit.size * 0.5))
      ctx.fillStyle = style.ink
      ctx.fillText(word, centerX, y + lineIndex * lineHeight + lift)
      ctx.restore()
      cursor += wordWidth
      if (wordIndex < words.length - 1) cursor += ctx.measureText(' ').width
    }
  }
  ctx.restore()
}


const STORY_INK = '#ffffff'
const STORY_LAYOUT_WIDTH = 720
const STORY_LAYOUT_HEIGHT = 1280
const STORY_TITLE_BASELINE = 540
const STORY_TITLE_STRETCH = 1.9
const STORY_TITLE_TRACKING = 3.2
const STORY_TITLE_MAX_WIDTH = 524
const STORY_TITLE_MAX_BLOCK = 240
const STORY_TITLE_CAPS = [168, 146, 131, 112, 96, 82, 70, 60, 52, 46, 40, 36]
const STORY_SETTLE_PROGRESS = 1.12
const STORY_FINAL_HOLD_PROGRESS = 0.84

const STORY_FONTS = {
  display: '"UsanagiStoryDisplay", "Bebas Neue", Impact, "Arial Narrow", Arial, sans-serif',
  script: '"UsanagiStoryScript", "Great Vibes", "UsanagiNulis", Georgia, serif',
  serifItalic: '"UsanagiStorySerifItalic", "Instrument Serif", Georgia, serif',
  sans: '"UsanagiStorySans", Poppins, Arial, sans-serif',
  sansSemi: '"UsanagiStorySansSemi", Poppins, Arial, sans-serif',
}

const STORY_FONT_ALIASES = {
  display: 'UsanagiStoryDisplay',
  script: 'UsanagiStoryScript',
  serifItalic: 'UsanagiStorySerifItalic',
  sans: 'UsanagiStorySans',
  sansSemi: 'UsanagiStorySansSemi',
}

let storyFontsReady = false

function ensureStoryFonts() {
  if (storyFontsReady) return
  storyFontsReady = true
  for (const [key, data] of Object.entries(STORY_FONT_DATA)) {
    try {
      GlobalFonts.register(Buffer.from(data, 'base64'), STORY_FONT_ALIASES[key])
    } catch {
    }
  }
}

function storyFrameGeometry(width, height) {
  const kx = width / STORY_LAYOUT_WIDTH
  const ky = height / STORY_LAYOUT_HEIGHT
  return { x: 22 * kx, y: 63 * ky, w: width - 44 * kx, h: 1170 * ky, r: 38 * kx }
}

function measureTracked(ctx, text, tracking) {
  let width = 0
  for (const ch of String(text)) width += ctx.measureText(ch).width
  return Math.max(0, width + Math.max(0, [...String(text)].length - 1) * tracking)
}

function drawTrackedCentered(ctx, text, centerX, baselineY, tracking, maxWidth = Infinity) {
  const value = String(text || '')
  let scale = 1
  const rawWidth = measureTracked(ctx, value, tracking)
  if (rawWidth > maxWidth && maxWidth > 0) scale = maxWidth / rawWidth
  const width = rawWidth * scale
  let x = centerX - width / 2
  ctx.save()
  if (scale !== 1) ctx.scale(scale, 1)
  if (scale !== 1) x /= scale
  for (const ch of value) {
    ctx.fillText(ch, x, baselineY)
    x += ctx.measureText(ch).width + tracking
  }
  ctx.restore()
  return width
}

function drawStoryTopTabs(ctx, progress, customTabs = null) {
  const tabs = Array.isArray(customTabs) && customTabs.length >= 3 ? customTabs : ['Healing', 'Nature', 'Escape']
  const centers = [214, 369, 519]
  ctx.save()
  ctx.font = `italic 36px ${STORY_FONTS.serifItalic}`
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'center'
  for (let i = 0; i < tabs.length; i++) {
    const local = easeOutCubic(clamp((progress - (0.05 + i * 0.035)) / 0.26, 0, 1))
    ctx.save()
    ctx.globalAlpha = local
    ctx.translate(0, (1 - local) * 18)
    if (i === 1) {
      roundedRect(ctx, centers[i] - 69, 127, 138, 54, 27)
      ctx.fillStyle = 'rgba(0,0,0,0.10)'
      ctx.fill()
      ctx.strokeStyle = rgba(STORY_INK, 0.95)
      ctx.lineWidth = 2.2
      ctx.stroke()
    }
    ctx.fillStyle = STORY_INK
    let tabSize = 36
    const maxTabWidth = 130
    while (tabSize > 20) {
      ctx.font = `italic ${tabSize}px ${STORY_FONTS.serifItalic}`
      if (ctx.measureText(tabs[i]).width <= maxTabWidth) break
      tabSize -= 1
    }
    ctx.fillText(tabs[i], centers[i], 166, maxTabWidth)
    ctx.restore()
  }
  ctx.restore()
}

function storyTitleFit(ctx, text) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim().toUpperCase()
  const words = clean.split(' ').filter(Boolean)
  const tracking = STORY_TITLE_TRACKING
  ctx.font = `100px ${STORY_FONTS.display}`
  const measuredCap = ctx.measureText('H').actualBoundingBoxAscent / 100
  const capRatio = Number.isFinite(measuredCap) && measuredCap > 0.4 ? measuredCap : 0.86
  let fit = null
  for (let i = 0; i < STORY_TITLE_CAPS.length && !fit; i++) {
    const cap = STORY_TITLE_CAPS[i]
    const size = cap / (capRatio * STORY_TITLE_STRETCH)
    const gap = Math.round(cap * 0.16)
    const maxLines = Math.max(1, Math.floor((STORY_TITLE_MAX_BLOCK + gap) / (cap + gap)))
    ctx.font = `${size}px ${STORY_FONTS.display}`
    const lines = []
    let current = ''
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word
      if (!current || measureTracked(ctx, candidate, tracking) <= STORY_TITLE_MAX_WIDTH) current = candidate
      else { lines.push(current); current = word }
    }
    if (current) lines.push(current)
    const widest = Math.max(...lines.map((line) => measureTracked(ctx, line, tracking)), 0)
    const fits = lines.length <= maxLines && widest <= STORY_TITLE_MAX_WIDTH
    if (fits || i === STORY_TITLE_CAPS.length - 1) fit = { lines, size, cap, gap, maxLines, tracking }
  }
  ctx.font = `${fit.size}px ${STORY_FONTS.display}`
  if (fit.lines.length > fit.maxLines) {
    const kept = fit.lines.slice(0, fit.maxLines)
    let tail = kept[kept.length - 1]
    while (tail.length > 1 && measureTracked(ctx, `${tail}…`, tracking) > STORY_TITLE_MAX_WIDTH) tail = tail.slice(0, -1).trimEnd()
    kept[kept.length - 1] = `${tail}…`
    fit.lines = kept
  }
  fit.widths = fit.lines.map((line) => Math.min(measureTracked(ctx, line, tracking), STORY_TITLE_MAX_WIDTH))
  const count = fit.lines.length
  fit.top = STORY_TITLE_BASELINE - (count - 1) * (fit.cap + fit.gap) - fit.cap
  fit.left = STORY_LAYOUT_WIDTH / 2 - fit.widths[0] / 2
  fit.lastLeft = STORY_LAYOUT_WIDTH / 2 - fit.widths[count - 1] / 2
  return fit
}

function drawStoryMainTitle(ctx, fit, progress) {
  const count = fit.lines.length
  const lineHeight = fit.cap + fit.gap
  const enter = easeOutCubic(clamp((progress - 0.10) / 0.42, 0, 1))
  const exit = easeInOut(clamp((progress - 0.88) / 0.12, 0, 1))
  const alpha = clamp(enter * (1 - exit), 0, 1)
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.shadowColor = 'rgba(0,0,0,0.42)'
  ctx.shadowBlur = 10
  ctx.fillStyle = STORY_INK
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `${fit.size}px ${STORY_FONTS.display}`
  for (let i = 0; i < count; i++) {
    const lineStart = 0.12 + i * 0.12
    const local = easeOutCubic(clamp((progress - lineStart) / 0.48, 0, 1))
    const baseline = STORY_TITLE_BASELINE - (count - 1 - i) * lineHeight
    const y = baseline + (1 - local) * 30 - exit * 18
    const drift = (1 - local) * 22
    ctx.save()
    ctx.globalAlpha = alpha * local
    ctx.translate(STORY_LAYOUT_WIDTH / 2 + drift, y)
    ctx.scale(0.90 + local * 0.10, (0.92 + local * 0.08) * STORY_TITLE_STRETCH)
    drawTrackedCentered(ctx, fit.lines[i], 0, 0, fit.tracking, STORY_TITLE_MAX_WIDTH)
    ctx.restore()
  }
  ctx.restore()
}

function drawStoryScriptTitle(ctx, fit, progress, exit, customText = 'The') {
  const local = easeOutCubic(clamp((progress - 0.08) / 0.34, 0, 1))
  const alpha = clamp(local * (1 - exit), 0, 1)
  const size = Math.round(clamp(fit.cap * 0.74, 60, 122))
  const x = fit.left - 25
  const y = fit.top - 8 - (1 - local) * 30 - exit * 18
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.font = `${size}px ${STORY_FONTS.script}`
  ctx.fillStyle = STORY_INK
  ctx.shadowColor = 'rgba(0,0,0,0.36)'
  ctx.shadowBlur = 10
  let titleSize = size
  const maxWidth = 210
  while (titleSize > 46) {
    ctx.font = `${titleSize}px ${STORY_FONTS.script}`
    if (ctx.measureText(customText).width <= maxWidth) break
    titleSize -= 2
  }
  ctx.font = `${titleSize}px ${STORY_FONTS.script}`
  ctx.fillText(customText, x, y, maxWidth)
  ctx.restore()
}

function drawStorySubtitle(ctx, fit, progress, exit) {
  const local = easeOutCubic(clamp((progress - 0.36) / 0.28, 0, 1))
  const alpha = clamp(local * (1 - exit), 0, 1)
  const x = fit.lastLeft - 5
  const y = STORY_TITLE_BASELINE + 44 - exit * 15
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.shadowColor = 'rgba(0,0,0,0.40)'
  ctx.shadowBlur = 8
  ctx.font = `23px ${STORY_FONTS.sans}`
  ctx.fillStyle = rgba(STORY_INK, 0.95)
  const prefix = 'storytelling by'
  const prefixWidth = ctx.measureText(prefix).width
  ctx.fillText(prefix, x, y)
  ctx.font = `italic 30px ${STORY_FONTS.serifItalic}`
  ctx.fillStyle = STORY_INK
  ctx.fillText('Usanagi Umi AI', x + prefixWidth + 9, y + 1)
  ctx.restore()
}

function drawStorySearchPill(ctx, text, progress) {
  const pillX = 183
  const pillY = 659
  const pillW = 351
  const pillH = 62
  const enter = easeOutCubic(clamp((progress - 0.42) / 0.24, 0, 1))
  const exit = easeInOut(clamp((progress - 0.90) / 0.10, 0, 1))
  const alpha = clamp(enter * (1 - exit), 0, 1)
  const top = pillY + (1 - enter) * 22 - exit * 15
  ctx.save()
  ctx.globalAlpha = alpha
  roundedRect(ctx, pillX, top, pillW, pillH, pillH / 2)
  ctx.fillStyle = 'rgba(6,7,10,0.80)'
  ctx.fill()
  ctx.strokeStyle = rgba(STORY_INK, 0.92)
  ctx.lineWidth = 2
  ctx.stroke()
  ctx.strokeStyle = STORY_INK
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  const iconX = pillX + 40
  const iconY = top + pillH / 2 - 2
  ctx.beginPath(); ctx.arc(iconX, iconY, 8.5, 0, Math.PI * 2); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(iconX + 6.6, iconY + 6.6); ctx.lineTo(iconX + 12.6, iconY + 12.6); ctx.stroke()
  ctx.font = `25px ${STORY_FONTS.sansSemi}`
  const available = pillW - 68 - 30
  let shownText = String(text || '').replace(/\s+/g, ' ').trim()
  if (ctx.measureText(shownText).width > available) {
    while (shownText.length > 1 && ctx.measureText(`${shownText}…`).width > available) shownText = shownText.slice(0, -1).trimEnd()
    shownText = `${shownText}…`
  }
  const reveal = clamp((progress - 0.45) / 0.24, 0, 1)
  const chars = Math.max(1, Math.floor([...shownText].length * reveal))
  const visible = [...shownText].slice(0, chars).join('')
  ctx.fillStyle = STORY_INK
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(visible, pillX + 68, top + pillH / 2 + 9)
  if (reveal < 1) {
    const cursorX = pillX + 68 + ctx.measureText(visible).width + 4
    ctx.fillRect(cursorX, top + 16, 2.5, pillH - 32)
  }
  ctx.restore()
}

function drawStoryCard(ctx, img, plan, timeSeconds, index, progress) {
  const enter = easeOutBack(clamp((progress - plan.enter) / plan.enterDuration, 0, 1))
  const exit = easeInOut(clamp((progress - plan.exit) / plan.exitDuration, 0, 1))
  const alpha = clamp(enter * (1 - exit), 0, 1)
  if (alpha <= 0) return
  const e = enter
  const ex = exit
  const groupDriftX = Math.sin(timeSeconds * 0.60) * 0.55
  const groupDriftY = Math.cos(timeSeconds * 0.46) * 0.55
  const x = plan.startX + (plan.x - plan.startX) * e + (plan.exitX - plan.x) * ex + groupDriftX
  const y = plan.startY + (plan.y - plan.startY) * e + (plan.exitY - plan.y) * ex + groupDriftY
  const rotation = 0
  const scale = 0.90 + e * 0.10 - ex * 0.025
  const w = plan.w
  const h = plan.h
  const radius = 17
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.translate(x + w / 2, y + h / 2)
  ctx.rotate(rotation)
  ctx.scale(scale, scale)
  ctx.shadowColor = 'rgba(0,0,0,0.42)'
  ctx.shadowBlur = 17
  ctx.shadowOffsetY = 9
  roundedRect(ctx, -w / 2, -h / 2, w, h, radius)
  ctx.fillStyle = 'rgba(0,0,0,0.28)'
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.shadowOffsetY = 0
  ctx.save()
  roundedRect(ctx, -w / 2 + 2.5, -h / 2 + 2.5, w - 5, h - 5, radius - 3)
  ctx.clip()
  if (img) {
    const scaleImg = Math.max(w / img.width, h / img.height)
    const dw = img.width * scaleImg
    const dh = img.height * scaleImg
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh)
  } else {
    const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2)
    g.addColorStop(0, 'rgba(255,255,255,0.16)')
    g.addColorStop(1, 'rgba(0,0,0,0.68)')
    ctx.fillStyle = g
    ctx.fillRect(-w / 2, -h / 2, w, h)
  }
  ctx.fillStyle = 'rgba(255,255,255,0.025)'
  ctx.fillRect(-w / 2, -h / 2, w, h)
  ctx.restore()
  ctx.strokeStyle = rgba(STORY_INK, 0.96)
  ctx.lineWidth = 2.6
  roundedRect(ctx, -w / 2, -h / 2, w, h, radius)
  ctx.stroke()
  ctx.restore()
}

function drawStoryMusicCard(ctx, progress, thumb) {
  const enter = easeOutBack(clamp((progress - 0.58) / 0.24, 0, 1))
  const exit = easeInOut(clamp((progress - 0.90) / 0.10, 0, 1))
  const alpha = clamp(enter * (1 - exit), 0, 1)
  const x = 94
  const w = 528
  const h = 100
  const y = 1041 + (1 - enter) * 34 + exit * 12
  ctx.save()
  ctx.globalAlpha = alpha
  roundedRect(ctx, x, y, w, h, 44)
  ctx.fillStyle = 'rgba(6,7,9,0.74)'
  ctx.fill()
  ctx.strokeStyle = rgba(STORY_INK, 0.9)
  ctx.lineWidth = 2
  ctx.stroke()
  const tx = x + 22
  const ty = y + 16
  const ts = 68
  ctx.save()
  roundedRect(ctx, tx, ty, ts, ts, 16)
  ctx.clip()
  if (thumb) {
    const scaleImg = Math.max(ts / thumb.width, ts / thumb.height)
    const dw = thumb.width * scaleImg
    const dh = thumb.height * scaleImg
    ctx.drawImage(thumb, tx + (ts - dw) / 2, ty + (ts - dh) / 2, dw, dh)
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.14)'
    ctx.fillRect(tx, ty, ts, ts)
  }
  ctx.restore()
  ctx.strokeStyle = rgba(STORY_INK, 0.55)
  ctx.lineWidth = 1.6
  roundedRect(ctx, tx, ty, ts, ts, 16)
  ctx.stroke()
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = STORY_INK
  ctx.font = `26px ${STORY_FONTS.sansSemi}`
  ctx.fillText('Usanagi Umi AI', x + 112, y + 47)
  ctx.fillStyle = rgba(STORY_INK, 0.6)
  ctx.font = `20px ${STORY_FONTS.sans}`
  ctx.fillText('suara asli', x + 112, y + 75)
  const cx = x + w - 50
  const cy = y + h / 2
  ctx.fillStyle = STORY_INK
  ctx.beginPath(); ctx.moveTo(cx - 12, cy - 16); ctx.lineTo(cx + 8, cy); ctx.lineTo(cx - 12, cy + 16); ctx.closePath(); ctx.fill()
  ctx.fillRect(cx + 11, cy - 16, 5, 32)
  ctx.restore()
}

function drawReferenceStoryboardFrame(ctx, scene, scenes, width, height, timeMs, seedText, cardImages = [], storyText = null) {
  const rawProgress = (timeMs - scene.startMs) / Math.max(1, scene.durationMs)
  const isFinalScene = scene.index === scenes.length - 1
  const progress = clamp(rawProgress, 0, isFinalScene ? STORY_FINAL_HOLD_PROGRESS : 1)
  const timeSeconds = timeMs / 1000
  const exit = easeInOut(clamp((progress - 0.92) / 0.08, 0, 1))
  const k = width / STORY_LAYOUT_WIDTH
  const frame = storyFrameGeometry(STORY_LAYOUT_WIDTH, STORY_LAYOUT_HEIGHT)

  ctx.clearRect(0, 0, width, height)
  ctx.save()
  ctx.scale(k, k)

  ctx.fillStyle = 'rgba(0,0,0,0.30)'
  ctx.fillRect(0, 0, STORY_LAYOUT_WIDTH, STORY_LAYOUT_HEIGHT)
  ctx.save()
  ctx.globalCompositeOperation = 'destination-out'
  roundedRect(ctx, frame.x, frame.y, frame.w, frame.h, frame.r)
  ctx.fillStyle = '#000000'
  ctx.fill()
  ctx.restore()

  ctx.save()
  roundedRect(ctx, frame.x, frame.y, frame.w, frame.h, frame.r)
  ctx.clip()
  const veil = ctx.createLinearGradient(0, frame.y, 0, frame.y + frame.h)
  veil.addColorStop(0, 'rgba(0,0,0,0.20)')
  veil.addColorStop(0.22, 'rgba(0,0,0,0.02)')
  veil.addColorStop(0.62, 'rgba(0,0,0,0.03)')
  veil.addColorStop(1, 'rgba(0,0,0,0.56)')
  ctx.fillStyle = veil
  ctx.fillRect(frame.x, frame.y, frame.w, frame.h)
  ctx.restore()

  const titleFit = storyTitleFit(ctx, scene.text)
  drawStoryTopTabs(ctx, progress, storyText?.tabs)
  drawStoryMainTitle(ctx, titleFit, progress)
  drawStoryScriptTitle(ctx, titleFit, progress, exit, storyText?.the || 'The')
  drawStorySubtitle(ctx, titleFit, progress, exit)
  drawStorySearchPill(ctx, scene.text, progress)

  const plans = [
    { x: 87, y: 726, w: 129, h: 121, startX: -170, startY: 730, exitX: -160, exitY: 710, angle: 0, enter: 0.42, enterDuration: 0.24, exit: 0.885, exitDuration: 0.115 },
    { x: 504, y: 726, w: 129, h: 121, startX: 890, startY: 730, exitX: 880, exitY: 710, angle: 0, enter: 0.46, enterDuration: 0.24, exit: 0.90, exitDuration: 0.115 },
    { x: 154, y: 777, w: 139, h: 160, startX: -185, startY: 834, exitX: -160, exitY: 760, angle: 0, enter: 0.50, enterDuration: 0.25, exit: 0.915, exitDuration: 0.115 },
    { x: 427, y: 777, w: 139, h: 160, startX: 905, startY: 834, exitX: 880, exitY: 760, angle: 0, enter: 0.54, enterDuration: 0.25, exit: 0.93, exitDuration: 0.115 },
    { x: 258, y: 810, w: 204, h: 196, startX: 258, startY: 1314, exitX: 258, exitY: 1328, angle: 0, enter: 0.58, enterDuration: 0.27, exit: 0.945, exitDuration: 0.115 },
  ]
  for (let i = 0; i < plans.length; i++) drawStoryCard(ctx, cardImages[i] || null, plans[i], timeSeconds, i, progress)

  drawStoryMusicCard(ctx, progress, cardImages[4] || cardImages[0] || null)

  ctx.save()
  ctx.lineJoin = 'round'
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 5
  ctx.strokeStyle = STORY_INK
  ctx.lineWidth = 3
  roundedRect(ctx, frame.x, frame.y, frame.w, frame.h, frame.r)
  ctx.stroke()
  ctx.restore()

  ctx.restore()

  ctx.save()
  const rng = createRng(hashSeed(`${seedText}:reference-v8:${scene.index}`))
  ctx.globalAlpha = 0.022
  for (let i = 0; i < 72; i++) {
    ctx.fillStyle = i % 2 ? '#ffffff' : '#000000'
    ctx.fillRect(rng() * width, rng() * height, 1, 1)
  }
  ctx.restore()
}

async function extractReferenceStoryCards(inputPath, outputDir, durationSeconds, width = BASE_WIDTH, height = BASE_HEIGHT) {
  const ffmpeg = await resolveFfmpeg()
  await fs.mkdir(outputDir, { recursive: true })
  const ratios = [0.18, 0.31, 0.45, 0.59, 0.73]
  const paths = []
  for (let index = 0; index < ratios.length; index++) {
    const time = clamp(durationSeconds * ratios[index], 0.12, Math.max(0.12, durationSeconds - 0.10))
    const outputPath = path.join(outputDir, `card-${String(index + 1).padStart(2, '0')}.png`)
    const cardRasterWidth = width >= 1000 ? 480 : 320
    const cardRasterHeight = width >= 1000 ? 360 : 240
    const cropW = Math.max(260, Math.round(width * (0.58 + (index % 2) * 0.05)))
    const cropH = Math.max(180, Math.round(height * (0.22 + (index % 3) * 0.025)))
    const maxX = Math.max(0, width - cropW)
    const maxY = Math.max(0, height - cropH)
    const cropX = Math.round(maxX * ((index * 0.43) % 1))
    const cropY = Math.round(maxY * (0.16 + (index % 2) * 0.34))
    await runCommand(ffmpeg, [
      '-y', '-nostdin', '-hide_banner', '-loglevel', 'error',
      '-ss', time.toFixed(3), '-i', inputPath,
      '-frames:v', '1',
      '-vf', `crop=${cropW}:${cropH}:${Math.max(0, cropX)}:${Math.max(0, cropY)},scale=${cardRasterWidth}:${cardRasterHeight}:force_original_aspect_ratio=increase,crop=${cardRasterWidth}:${cardRasterHeight}:(iw-${cardRasterWidth})/2:(ih-${cardRasterHeight})/2,eq=contrast=1.055:saturation=0.92:brightness=-0.02,setsar=1`,
      outputPath,
    ], 30000)
    const stat = await fs.stat(outputPath)
    if (!stat.size) throw Object.assign(new Error('Story card kosong.'), { code: 'CANVAS' })
    paths.push(outputPath)
  }
  return paths
}

async function loadRasterCanvas(filePath) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const canvas = createCanvas(info.width, info.height)
  const ctx = canvas.getContext('2d')
  const imageData = ctx.createImageData(info.width, info.height)
  imageData.data.set(data)
  ctx.putImageData(imageData, 0, 0)
  return canvas
}

async function renderReferenceOverlayFrames({ scenes, cardPaths, outputFramesDir, width, height, fps, seedText, durationSeconds: totalSeconds = null, storyText = null }) {
  await fs.mkdir(outputFramesDir, { recursive: true })
  ensureUsanagiFont()
  ensureStoryFonts()
  const canvas = createCanvas(width, height)
  const cards = []
  for (const filePath of cardPaths || []) {
    try { cards.push(await loadRasterCanvas(filePath)) } catch { cards.push(null) }
  }
  const scenesMs = scenes.reduce((sum, scene) => sum + scene.durationMs, 0)
  const durationSeconds = Math.max(scenesMs / 1000, Number(totalSeconds) || 0)
  const totalFrames = Math.max(1, Math.ceil(durationSeconds * fps))
  const lastScene = scenes[scenes.length - 1]
  const settleMs = Math.min(durationSeconds * 1000, lastScene.startMs + lastScene.durationMs * STORY_FINAL_HOLD_PROGRESS * 0.96)
  let settledBuffer = null
  for (let index = 0; index < totalFrames; index++) {
    const timeMs = index * 1000 / fps
    let buffer = timeMs >= settleMs ? settledBuffer : null
    if (!buffer) {
      const scene = sceneAtTime(scenes, timeMs)
      if (!scene) throw Object.assign(new Error('Scene tidak tersedia.'), { code: 'CANVAS' })
      const bufferCanvas = canvas.getContext('2d')
      drawReferenceStoryboardFrame(bufferCanvas, scene, scenes, width, height, timeMs, seedText, cards, storyText)
      buffer = Buffer.from(canvas.toBuffer('image/png'))
      if (buffer.length < 64 || !buffer.subarray(0, 8).equals(PNG_SIGNATURE)) throw Object.assign(new Error('Overlay frame tidak valid.'), { code: 'CANVAS' })
      if (timeMs >= settleMs) settledBuffer = buffer
    }
    const framePath = path.join(outputFramesDir, `frame-${String(index + 1).padStart(6, '0')}.png`)
    await fs.writeFile(framePath, buffer)
  }
  return totalFrames
}

async function createStoryFrameMask(outputPath, width, height) {
  const frame = storyFrameGeometry(width, height)
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="${width}" height="${height}" fill="#000"/><rect x="${frame.x}" y="${frame.y}" width="${frame.w}" height="${frame.h}" rx="${frame.r}" ry="${frame.r}" fill="#fff"/></svg>`
  await sharp(Buffer.from(svg)).png().toFile(outputPath)
}

function storyFrameCount(durationSeconds, fps) {
  return Math.max(1, Math.ceil(Math.max(0, Number(durationSeconds) || 0) * Math.max(1, Number(fps) || 1)))
}

async function compositeReferenceVideo({ inputPath, overlayFramesDir, outputPath, width, height, fps, overlayFps = fps, durationSeconds, maskPath, profile = null }) {
  const ffmpeg = await resolveFfmpeg()
  const pattern = path.join(overlayFramesDir, 'frame-%06d.png')
  const totalFrames = storyFrameCount(durationSeconds, fps)
  const blurRadius = width >= 1000 ? 12 : 8
  const blurChroma = Math.max(2, Math.round(blurRadius / 2))
  const level = profile?.level || (width >= 1000 ? '4.2' : '3.1')
  const crf = Number.isFinite(Number(profile?.crf)) ? Number(profile.crf) : width >= 1000 ? 19 : 21
  const args = [
    '-y', '-nostdin', '-hide_banner', '-loglevel', 'error',
    '-i', inputPath,
    '-framerate', String(overlayFps), '-start_number', '1', '-i', pattern,
    '-loop', '1', '-framerate', String(fps), '-i', maskPath,
    '-filter_complex', `[0:v]split=2[sharp][blur];[blur]boxblur=luma_radius=${blurRadius}:luma_power=1:chroma_radius=${blurChroma}:chroma_power=1[blurred];[sharp]format=yuv420p[sharp_yuv];[blurred]format=yuv420p[blur_yuv];[2:v]format=gray[mask];[blur_yuv][sharp_yuv][mask]maskedmerge[base];[1:v]format=rgba,setpts=PTS-STARTPTS[ov];[base][ov]overlay=0:0:shortest=0:eof_action=repeat:repeatlast=1:format=auto,format=yuv420p[v]`,
    '-map', '[v]',
    '-an',
    '-frames:v', String(totalFrames),
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', String(crf), '-threads', '1', '-filter_complex_threads', '1',
    '-profile:v', 'high', '-level', level, '-pix_fmt', 'yuv420p',
    '-vsync', 'cfr', '-r', String(fps), '-color_range', 'tv',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-map_metadata', '-1',
    outputPath,
  ]
  const runner = spawnEncoder(ffmpeg, args, 420000, 'StoryVideo reference compositor')
  await runner.done
}

async function hasAudioStream(inputPath) {
  try {
    const { stdout } = await runCommand(resolveFfprobe(), [
      '-v', 'error',
      '-select_streams', 'a:0',
      '-show_entries', 'stream=index',
      '-of', 'csv=p=0',
      inputPath,
    ], 30000)
    return Boolean(String(stdout || '').trim())
  } catch {
    return false
  }
}

async function muxSourceAudio(videoOnlyPath, audioSourcePath, outputPath, durationSeconds) {
  const ffmpeg = await resolveFfmpeg()
  const args = [
    '-y', '-nostdin', '-hide_banner', '-loglevel', 'error',
    '-i', videoOnlyPath,
    '-i', audioSourcePath,
    '-map', '0:v:0',
    '-map', '1:a:0?',
    '-c:v', 'copy',
    '-c:a', 'copy',
    '-t', Number(durationSeconds).toFixed(3),
    '-movflags', '+faststart',
    '-map_metadata', '-1',
    outputPath,
  ]
  const runner = spawnEncoder(ffmpeg, args, 120000, 'StoryVideo audio mux')
  await runner.done
}

async function compositeStaticOverlayVideo({ inputPath, overlayFramePath, outputPath, fps, durationSeconds, profile = null }) {
  const ffmpeg = await resolveFfmpeg()
  const totalFrames = storyFrameCount(durationSeconds, fps)
  const args = [
    '-y', '-nostdin', '-hide_banner', '-loglevel', 'error',
    '-i', inputPath,
    '-loop', '1', '-framerate', String(fps), '-i', overlayFramePath,
    '-filter_complex', '[0:v]setpts=PTS-STARTPTS,format=yuv420p[base];[1:v]format=rgba,setpts=PTS-STARTPTS[ov];[base][ov]overlay=0:0:shortest=0:eof_action=repeat:repeatlast=1:format=auto,format=yuv420p[v]',
    '-map', '[v]',
    '-an',
    '-frames:v', String(totalFrames),
    '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', String(Number.isFinite(Number(profile?.crf)) ? Math.max(22, Number(profile.crf) + 4) : 24), '-threads', '1', '-filter_complex_threads', '1',
    '-profile:v', 'high', '-level', profile?.level || '3.1', '-pix_fmt', 'yuv420p',
    '-vsync', 'cfr', '-r', String(fps), '-map_metadata', '-1',
    outputPath,
  ]
  const runner = spawnEncoder(ffmpeg, args, 300000, 'StoryVideo static fallback')
  await runner.done
}

function drawVideoStoryboardOverlay(ctx, scene, scenes, width, height, timeMs, seedText) {
  const style = scene.style
  const progress = sceneProgress(scene, timeMs)
  const timeSeconds = timeMs / 1000
  ctx.clearRect(0, 0, width, height)
  const veil = ctx.createLinearGradient(0, 0, 0, height)
  veil.addColorStop(0, 'rgba(0,0,0,0.40)')
  veil.addColorStop(0.35, 'rgba(0,0,0,0.04)')
  veil.addColorStop(0.70, 'rgba(0,0,0,0.10)')
  veil.addColorStop(1, 'rgba(0,0,0,0.64)')
  ctx.fillStyle = veil
  ctx.fillRect(0, 0, width, height)
  ctx.save()
  const focal = ctx.createRadialGradient(width / 2, height * 0.39, 50, width / 2, height * 0.39, width * 0.62)
  focal.addColorStop(0, rgba(style.accent, 0.10))
  focal.addColorStop(0.62, rgba(style.accent2, 0.035))
  focal.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = focal
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
  drawAnimatedBorder(ctx, style, width, height, progress, timeSeconds)

  const headerIn = easeOutCubic(clamp(progress / 0.20, 0, 1))
  ctx.save()
  ctx.globalAlpha = headerIn
  const headerY = 82 - (1 - headerIn) * 26
  let chipX = 58
  chipX += drawStoryboardChip(ctx, chipX, headerY, 'STORYVIDEO', style, true) + 8
  chipX += drawStoryboardChip(ctx, chipX, headerY, style.name, style, false) + 8
  drawStoryboardChip(ctx, chipX, headerY, `SCENE ${String(scene.index + 1).padStart(2, '0')}`, style, false)
  ctx.font = `500 11px ${FONT_FAMILIES.sans}`
  ctx.fillStyle = style.muted
  ctx.textAlign = 'right'
  ctx.fillText(`${String(scene.index + 1).padStart(2, '0')} / ${String(scenes.length).padStart(2, '0')}`, width - 58, headerY + 19.5)
  ctx.restore()

  const fit = fitQuote(ctx, scene.text, scene.fontFamily, width - 160)
  const lineHeight = Math.round(fit.size * 1.08)
  const quoteHeight = fit.lines.length * lineHeight
  const quoteTop = clamp(height * 0.31 - quoteHeight / 2, 285, 545)
  const heroIn = easeOutBack(clamp(progress / 0.34, 0, 1))
  const heroExit = easeInOut(clamp((progress - 0.82) / 0.18, 0, 1))
  const heroAlpha = clamp(heroIn * (1 - heroExit), 0, 1)
  ctx.save()
  ctx.globalAlpha = heroAlpha
  ctx.translate(0, (1 - heroIn) * 32 - heroExit * 26)
  const plateY = quoteTop - 62
  const plateH = quoteHeight + 154
  roundedRect(ctx, 54, plateY, width - 108, plateH, 30)
  ctx.fillStyle = 'rgba(6,7,10,0.28)'
  ctx.fill()
  ctx.strokeStyle = rgba(style.border, 0.20)
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.fillStyle = style.accent
  roundedRect(ctx, 84, plateY + 36, 70, 4, 2)
  ctx.fill()
  ctx.font = `600 11px ${FONT_FAMILIES.sans}`
  ctx.fillStyle = style.muted
  ctx.fillText('QUOTE / STORY', 84, plateY + 60)
  drawStoryWords(ctx, fit, style, width / 2, quoteTop, progress)
  ctx.restore()

  const searchText = scene.text.length > 34 ? `${scene.text.slice(0, 33).trim()}…` : scene.text
  const searchIn = easeOutBack(clamp((progress - 0.15) / 0.34, 0, 1))
  const searchOut = easeInOut(clamp((progress - 0.88) / 0.12, 0, 1))
  const searchAlpha = clamp(searchIn * (1 - searchOut), 0, 1)
  const searchW = width - 190
  const searchX = (width - searchW) / 2
  const searchY = clamp(quoteTop + quoteHeight + 84, 650, 805) + (1 - searchIn) * 38 - searchOut * 24
  ctx.save()
  ctx.globalAlpha = searchAlpha
  roundedRect(ctx, searchX, searchY, searchW, 56, 28)
  ctx.fillStyle = 'rgba(5,6,9,0.78)'
  ctx.fill()
  ctx.strokeStyle = rgba(style.border, 0.46)
  ctx.lineWidth = 1.2
  ctx.stroke()
  ctx.strokeStyle = style.accent
  ctx.lineWidth = 2.4
  ctx.beginPath(); ctx.arc(searchX + 24, searchY + 25, 7, Math.PI * 0.20, Math.PI * 1.75); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(searchX + 29, searchY + 31); ctx.lineTo(searchX + 34, searchY + 36); ctx.stroke()
  ctx.font = `600 15px ${FONT_FAMILIES.sans}`
  ctx.fillStyle = style.ink
  ctx.textAlign = 'left'
  ctx.fillText(searchText, searchX + 50, searchY + 34)
  ctx.restore()

  const trackIn = easeOutCubic(clamp((progress - 0.28) / 0.34, 0, 1))
  const trackY = height - 142 + (1 - trackIn) * 52
  ctx.save()
  ctx.globalAlpha = trackIn
  const trackX = 82
  const trackW = width - 164
  roundedRect(ctx, trackX, trackY, trackW, 82, 22)
  ctx.fillStyle = 'rgba(3,4,6,0.82)'
  ctx.fill()
  ctx.strokeStyle = rgba(style.border, 0.30)
  ctx.lineWidth = 1
  ctx.stroke()
  roundedRect(ctx, trackX + 14, trackY + 14, 54, 54, 16)
  ctx.fillStyle = rgba(style.accent, 0.16)
  ctx.fill()
  ctx.strokeStyle = rgba(style.accent, 0.48)
  ctx.stroke()
  ctx.fillStyle = style.ink
  ctx.font = `700 13px ${FONT_FAMILIES.sans}`
  ctx.textAlign = 'left'
  ctx.fillText('STORY EDIT', trackX + 84, trackY + 31)
  ctx.font = `500 11px ${FONT_FAMILIES.sans}`
  ctx.fillStyle = style.muted
  ctx.fillText(`${style.name} · ${scene.fontFamily.toUpperCase()}`, trackX + 84, trackY + 51)
  const barX = trackX + 84
  const barW = trackW - 102
  ctx.fillStyle = rgba(style.ink, 0.16)
  roundedRect(ctx, barX, trackY + 61, barW, 3, 2); ctx.fill()
  ctx.fillStyle = style.accent
  roundedRect(ctx, barX, trackY + 61, barW * progress, 3, 2); ctx.fill()
  ctx.textAlign = 'right'
  ctx.fillStyle = style.muted
  ctx.fillText(`${timeSeconds.toFixed(1)}s`, trackX + trackW - 18, trackY + 31)
  ctx.restore()

  ctx.save()
  const rng = createRng(hashSeed(`${seedText}:grain-v2:${scene.index}`))
  ctx.globalAlpha = 0.04
  for (let i = 0; i < 72; i++) {
    ctx.fillStyle = i % 2 ? '#ffffff' : '#000000'
    ctx.fillRect(rng() * width, rng() * height, 1, 1)
  }
  ctx.restore()
}

function drawOverlay(ctx, scene, scenes, width, height, timeMs, seedText) {
  const progress = sceneProgress(scene, timeMs)
  const timeSeconds = timeMs / 1000
  drawFrame(ctx, scene.style, width, height, scene.frameStyle, timeSeconds)
  const driftX = Math.sin(timeSeconds * 0.72 + scene.index * 0.8) * 5.5
  const driftY = Math.cos(timeSeconds * 0.58 + scene.index * 0.35) * 4.0
  const breathe = 1 + Math.sin(timeSeconds * 0.55 + scene.index) * 0.006
  ctx.save()
  ctx.translate(width / 2 + driftX, height / 2 + driftY)
  ctx.scale(breathe, breathe)
  ctx.translate(-width / 2, -height / 2)
  drawHeader(ctx, scene.style, scene, width, timeMs, scenes.length)
  if (scene.styleName === 'CINEMATIC') drawCinematicLayout(ctx, scene.style, scene, width, height, progress)
  else if (scene.styleName === 'GLASS') drawGlassLayout(ctx, scene.style, scene, width, height, progress)
  else if (scene.styleName === 'NEON') drawNeonLayout(ctx, scene.style, scene, width, height, progress, timeSeconds)
  else if (scene.styleName === 'PAPER') drawPaperLayout(ctx, scene.style, scene, width, height, progress, timeSeconds)
  else drawMinimalLayout(ctx, scene.style, scene, width, height, progress)
  drawDecor(ctx, scene.style, width, height, timeSeconds, seedText, scene.index)
  drawMotionSweep(ctx, scene.style, width, height, timeSeconds, progress)
  ctx.restore()
}

function drawQuoteOverlayCanvas(ctx, scene, scenes, width, height, timeMs, seedText) {
  ctx.clearRect(0, 0, width, height)
  const style = scene.style
  const progress = sceneProgress(scene, timeMs)
  const timeSeconds = timeMs / 1000
  ctx.save()
  const topFade = ctx.createLinearGradient(0, 0, 0, height)
  topFade.addColorStop(0, 'rgba(0,0,0,0.26)')
  topFade.addColorStop(0.35, 'rgba(0,0,0,0)')
  topFade.addColorStop(0.72, 'rgba(0,0,0,0)')
  topFade.addColorStop(1, 'rgba(0,0,0,0.34)')
  ctx.fillStyle = topFade
  ctx.fillRect(0, 0, width, height)
  ctx.restore()

  drawOverlay(ctx, scene, scenes, width, height, timeMs, seedText)

  const total = scenes.reduce((sum, item) => sum + item.durationMs, 0)
  const totalProgress = clamp(timeMs / Math.max(1, total), 0, 1)
  const progressWidth = width - 112
  ctx.save()
  ctx.globalAlpha = 0.72
  ctx.fillStyle = rgba(style.ink, 0.16)
  roundedRect(ctx, 56, height - 82, progressWidth, 3, 2)
  ctx.fill()
  ctx.fillStyle = style.accent
  roundedRect(ctx, 56, height - 82, progressWidth * totalProgress, 3, 2)
  ctx.fill()
  ctx.globalAlpha = 0.38
  ctx.fillStyle = style.accent2
  ctx.beginPath()
  ctx.arc(56 + progressWidth * totalProgress, height - 80.5, 2.5 + Math.sin(timeSeconds * 2.2) * 0.7, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  if (progress < 0.16 || progress > 0.84) {
    const alpha = progress < 0.16 ? clamp(progress / 0.16, 0, 1) : clamp((1 - progress) / 0.16, 0, 1)
    ctx.save()
    ctx.globalAlpha = (1 - alpha) * 0.25
    ctx.fillStyle = style.ink
    ctx.fillRect(0, 0, width, height)
    ctx.restore()
  }
}

function drawFullCanvasFrame(ctx, scene, scenes, width, height, timeMs, seedText) {
  const style = scene.style
  drawAmbientBackground(ctx, style, width, height, seedText, timeMs / 1000)
  drawOverlay(ctx, scene, scenes, width, height, timeMs, seedText)
  const total = scenes.reduce((sum, item) => sum + item.durationMs, 0)
  const totalProgress = clamp(timeMs / Math.max(1, total), 0, 1)
  const progressWidth = width - 112
  ctx.save()
  ctx.globalAlpha = 0.72
  ctx.fillStyle = rgba(style.ink, 0.16)
  roundedRect(ctx, 56, height - 82, progressWidth, 3, 2)
  ctx.fill()
  ctx.fillStyle = style.accent
  roundedRect(ctx, 56, height - 82, progressWidth * totalProgress, 3, 2)
  ctx.fill()
  ctx.restore()
}

async function renderCanvasFrame({ canvas, scene, scenes, timeMs, seedText, width, height, overlayMode }) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, width, height)
  if (overlayMode) drawQuoteOverlayCanvas(ctx, scene, scenes, width, height, timeMs, seedText)
  else drawFullCanvasFrame(ctx, scene, scenes, width, height, timeMs, seedText)
  const buffer = Buffer.from(canvas.toBuffer('image/png'))
  if (buffer.length < 64 || !buffer.subarray(0, 8).equals(PNG_SIGNATURE)) throw Object.assign(new Error('Canvas menghasilkan frame tidak valid.'), { code: 'CANVAS' })
  return buffer
}

async function resolveFfmpeg() {
  if (ffmpegPathPromise) return ffmpegPathPromise
  ffmpegPathPromise = (async () => {
    const candidates = []
    if (process.env.FFMPEG_PATH) candidates.push(process.env.FFMPEG_PATH)
    try {
      const mod = await import('@ffmpeg-installer/ffmpeg')
      if (mod.default?.path) candidates.push(mod.default.path)
      if (mod.path) candidates.push(mod.path)
    } catch {
    }
    candidates.push('ffmpeg')
    for (const candidate of candidates) {
      try {
        await new Promise((resolve, reject) => {
          execFile(candidate, ['-version'], { timeout: 10000 }, (error) => error ? reject(error) : resolve())
        })
        return candidate
      } catch {
      }
    }
    throw Object.assign(new Error('FFmpeg tidak tersedia.'), { code: 'DEPENDENCY' })
  })()
  try {
    return await ffmpegPathPromise
  } catch (error) {
    ffmpegPathPromise = null
    throw error
  }
}

function resolveFfprobe() {
  return process.env.FFPROBE_PATH || 'ffprobe'
}

function runCommand(binary, args, timeoutMs = 180000) {
  return new Promise((resolve, reject) => {
    execFile(binary, args, { timeout: timeoutMs, maxBuffer: 8 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        const detail = String(stderr || stdout || error.message || '').trim()
        reject(new Error(detail || `${path.basename(binary)} gagal.`))
        return
      }
      resolve({ stdout: String(stdout || ''), stderr: String(stderr || '') })
    })
  })
}

async function probeDuration(inputPath) {
  let duration = Number.NaN
  try {
    const { stdout } = await runCommand(resolveFfprobe(), [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      inputPath,
    ], 30000)
    duration = Number.parseFloat(stdout.trim())
  } catch {
  }
  if (!Number.isFinite(duration) || duration <= 0) {
    const { stdout } = await runCommand(resolveFfprobe(), [
      '-v', 'error',
      '-show_entries', 'format=duration',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      inputPath,
    ], 30000)
    duration = Number.parseFloat(stdout.trim())
  }
  if (!Number.isFinite(duration) || duration <= 0) throw new Error('Durasi video sumber tidak dapat dibaca.')
  return clamp(duration, 0.8, MAX_VIDEO_SECONDS)
}

function spawnEncoder(binary, args, timeoutMs = 240000, stage = 'FFmpeg') {
  const proc = spawn(binary, args, { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true })
  let stderr = ''
  proc.stderr.setEncoding('utf8')
  proc.stderr.on('data', (chunk) => {
    stderr += chunk
    if (stderr.length > 24000) stderr = stderr.slice(-24000)
  })
  const done = new Promise((resolve, reject) => {
    let finished = false
    const timer = setTimeout(() => {
      if (finished) return
      finished = true
      try { proc.kill('SIGKILL') } catch {}
      reject(Object.assign(new Error(`${stage} timeout.`), { code: 'TIMEOUT', stage }))
    }, timeoutMs)
    proc.once('error', (error) => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      reject(Object.assign(error, { code: error?.code === 'ENOENT' ? 'DEPENDENCY' : 'FFMPEG', stage }))
    })
    proc.once('close', (code, signal) => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      if (code === 0) {
        resolve({ code, signal, stderr })
        return
      }
      const detail = stderr.trim().split('\n').slice(-10).join(' | ')
      const error = Object.assign(new Error(detail || `${stage} berhenti (${code ?? signal ?? 'unknown'}).`), { code: 'FFMPEG', stage, signal: signal || null, ffmpegDetail: detail || '' })
      if (detail) console.error(`[StoryVideo] ${stage}: ${detail}`)
      if (/Unknown encoder|Unknown decoder|No such filter|No such file or directory/i.test(detail)) error.code = 'DEPENDENCY'
      reject(error)
    })
  })
  return { proc, done }
}

async function normalizeSourceVideo(inputPath, outputPath, profile, durationSeconds, withAudio = true, loopInput = false) {
  const ffmpeg = await resolveFfmpeg()
  const vf = `scale=${Math.round(profile.width * 1.04)}:${Math.round(profile.height * 1.04)}:force_original_aspect_ratio=increase:flags=lanczos,crop=${profile.width}:${profile.height}:(iw-${profile.width})/2:(ih-${profile.height})/2,setsar=1,fps=${profile.fps},eq=contrast=1.035:saturation=0.84:brightness=-0.025`
  const args = [
    '-y', '-nostdin', '-hide_banner', '-loglevel', 'error',
    '-analyzeduration', '12M', '-probesize', '12M',
    ...(loopInput ? ['-stream_loop', '-1'] : []),
    '-i', inputPath,
    '-map', '0:v:0',
  ]
  if (withAudio) args.push('-map', '0:a:0?')
  args.push(
    '-vf', vf,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', String(Number.isFinite(Number(profile.crf)) ? profile.crf : (profile.quality === 'fallback' ? 23 : 21)), '-threads', '1',
    '-profile:v', 'high', '-level', profile.level || '3.1', '-pix_fmt', 'yuv420p',
    '-vsync', 'cfr', '-r', String(profile.fps),
  )
  if (withAudio) args.push('-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-ac', '2')
  else args.push('-an')
  args.push('-t', Number(durationSeconds).toFixed(3), '-movflags', '+faststart', '-map_metadata', '-1', outputPath)
  const runner = spawnEncoder(ffmpeg, args, 240000, 'StoryVideo normalize')
  await runner.done
}

async function renderSceneLayers({ scenes, outputDir, width, height, seedText }) {
  await fs.mkdir(outputDir, { recursive: true })
  ensureUsanagiFont()
  const canvas = createCanvas(width, height)
  const paths = []
  for (const scene of scenes) {
    const states = [
      { label: 'intro', progress: 0.24 },
      { label: 'full', progress: 0.70 },
    ]
    for (const state of states) {
      const timeMs = scene.startMs + scene.durationMs * state.progress
      const buffer = await renderCanvasFrame({ canvas, scene, scenes, timeMs, seedText, width, height, overlayMode: true })
      const outputPath = path.join(outputDir, `scene-${String(scene.index + 1).padStart(2, '0')}-${state.label}.png`)
      await fs.writeFile(outputPath, buffer)
      paths.push({ path: outputPath, scene, state: state.label })
    }
  }
  if (!paths.length) throw Object.assign(new Error('Scene visual tidak berhasil dibuat.'), { code: 'CANVAS' })
  return paths
}

async function extractStoryCards(inputPath, outputDir, durationSeconds, styleName, width, height) {
  const ffmpeg = await resolveFfmpeg()
  await fs.mkdir(outputDir, { recursive: true })
  const count = durationSeconds >= 10 ? 4 : 3
  const cropW = Math.max(260, Math.round(width * 0.58))
  const cropH = Math.max(340, Math.round(height * 0.44))
  const cardW = Math.max(150, Math.round(width * 0.25))
  const cardH = Math.max(190, Math.round(height * 0.19))
  const plans = [
    { x: 0.08, y: 0.61, angle: -3.2 },
    { x: 0.38, y: 0.66, angle: 2.6 },
    { x: 0.66, y: 0.60, angle: -2.2 },
    { x: 0.18, y: 0.74, angle: 2.5 },
  ]
  const times = []
  for (let index = 0; index < count; index++) {
    const ratio = (index + 1) / (count + 1)
    times.push(clamp(durationSeconds * ratio, 0.24, Math.max(0.24, durationSeconds - 0.16)))
  }
  const cardPaths = []
  const accent = STYLES[styleName]?.accent || '#ffffff'
  for (let index = 0; index < count; index++) {
    const rawPath = path.join(outputDir, `source-${String(index + 1).padStart(2, '0')}.jpg`)
    const cardPath = path.join(outputDir, `card-${String(index + 1).padStart(2, '0')}.png`)
    const plan = plans[index] || plans[plans.length - 1]
    const cropX = clamp(Math.round((width - cropW) * (index % 3) / 2), 0, Math.max(0, width - cropW))
    const cropY = clamp(Math.round((height - cropH) * (0.18 + (index % 2) * 0.44)), 0, Math.max(0, height - cropH))
    await runCommand(ffmpeg, [
      '-y', '-nostdin', '-hide_banner', '-loglevel', 'error',
      '-ss', times[index].toFixed(3), '-i', inputPath,
      '-frames:v', '1',
      '-vf', `crop=${width}:${height}:0:0,crop=${cropW}:${cropH}:${cropX}:${cropY},scale=${cardW}:${cardH}:force_original_aspect_ratio=increase,crop=${cardW}:${cardH}:(iw-${cardW})/2:(ih-${cardH})/2,eq=contrast=1.08:saturation=0.88:brightness=-0.01,setsar=1`,
      '-q:v', '3', rawPath,
    ], 30000)
    const radius = Math.max(18, Math.round(cardW * 0.13))
    const shadow = Buffer.from(`<svg width="${cardW + 18}" height="${cardH + 18}"><rect x="8" y="9" width="${cardW}" height="${cardH}" rx="${radius}" ry="${radius}" fill="#000" fill-opacity="0.42"/></svg>`)
    const maskSvg = Buffer.from(`<svg width="${cardW}" height="${cardH}"><rect x="0" y="0" width="${cardW}" height="${cardH}" rx="${radius}" ry="${radius}" fill="white"/></svg>`)
    const borderSvg = Buffer.from(`<svg width="${cardW}" height="${cardH}"><rect x="2" y="2" width="${cardW - 4}" height="${cardH - 4}" rx="${Math.max(14, radius - 2)}" ry="${Math.max(14, radius - 2)}" fill="none" stroke="white" stroke-opacity="0.96" stroke-width="3"/><rect x="8" y="8" width="${cardW - 16}" height="${cardH - 16}" rx="${Math.max(12, radius - 8)}" ry="${Math.max(12, radius - 8)}" fill="none" stroke="${accent}" stroke-opacity="0.40" stroke-width="1"/><rect x="11" y="11" width="42" height="21" rx="10" fill="#050609" fill-opacity="0.70"/><text x="32" y="26" text-anchor="middle" font-family="Arial" font-size="10" font-weight="700" fill="white">${String(index + 1).padStart(2, '0')}</text></svg>`)
    const output = await sharp(rawPath)
      .resize(cardW, cardH, { fit: 'cover', position: 'centre' })
      .composite([
        { input: shadow, left: -8, top: -8, blend: 'over' },
        { input: maskSvg, blend: 'dest-in' },
        { input: borderSvg, blend: 'over' },
      ])
      .png({ compressionLevel: 6 })
      .rotate(plan.angle, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer()
    await fs.writeFile(cardPath, output)
    cardPaths.push({ path: cardPath, plan })
  }
  return cardPaths
}

async function compositeOverlayVideoV3({ inputPath, scenePaths, cardPaths, outputPath, width, height, fps, durationSeconds, scenes }) {
  const ffmpeg = await resolveFfmpeg()
  const scriptPath = `${outputPath}.filter.txt`
  const lines = ['[0:v]setpts=PTS-STARTPTS[base0]']
  let current = 'base0'
  let inputIndex = 1
  for (let index = 0; index < scenes.length; index++) {
    const scene = scenes[index]
    const intro = scenePaths.find((item) => item.scene.index === index && item.state === 'intro')
    const full = scenePaths.find((item) => item.scene.index === index && item.state === 'full')
    if (!intro || !full) continue
    const inStart = scene.startMs / 1000
    const outEnd = (scene.startMs + scene.durationMs) / 1000
    const split = Math.min(outEnd - 0.25, inStart + Math.max(0.85, Math.min(1.45, scene.durationMs / 1000 * 0.32)))
    const introFade = Math.min(0.48, Math.max(0.26, (split - inStart) * 0.46))
    const fullFade = Math.min(0.58, Math.max(0.28, (outEnd - split) * 0.22))
    const exitStart = Math.max(split + 0.55, outEnd - 0.48)
    lines.push(`[${inputIndex}:v]format=rgba,setpts=PTS-STARTPTS,fade=t=in:st=${inStart.toFixed(3)}:d=${introFade.toFixed(3)}:alpha=1,fade=t=out:st=${Math.max(inStart + 0.12, outEnd - 0.40).toFixed(3)}:d=0.40:alpha=1[s${index}a]`)
    const yIntro = `34*(1-min(1,max(0,(t-${inStart.toFixed(3)})/0.72)))`
    const yExit = `-24*min(1,max(0,(t-${exitStart.toFixed(3)})/0.48))`
    let out = `s${index}m0`
    lines.push(`[${current}][s${index}a]overlay=x='0':y='${yIntro}':enable='between(t,${inStart.toFixed(3)},${outEnd.toFixed(3)})':eof_action=pass:repeatlast=0:format=auto[${out}]`)
    inputIndex += 1
    lines.push(`[${inputIndex}:v]format=rgba,setpts=PTS-STARTPTS,fade=t=in:st=${split.toFixed(3)}:d=${fullFade.toFixed(3)}:alpha=1,fade=t=out:st=${exitStart.toFixed(3)}:d=0.48:alpha=1[s${index}b]`)
    out = `s${index}m1`
    lines.push(`[${out === `s${index}m1` ? `s${index}m0` : `s${index}m0` }][s${index}b]overlay=x='0':y='${yExit}':enable='between(t,${split.toFixed(3)},${outEnd.toFixed(3)})':eof_action=pass:repeatlast=0:format=auto[${out}]`)
    current = out
    inputIndex += 1
  }
  const cardBase = 1 + scenes.length * 2
  for (let index = 0; index < cardPaths.length; index++) {
    const item = cardPaths[index]
    const p = item.plan
    const inputNo = cardBase + index
    const inStart = Math.min(0.38 + index * 0.30, Math.max(0.38, durationSeconds - 1.30))
    const outEnd = Math.max(inStart + 0.88, durationSeconds - (0.56 + (cardPaths.length - index - 1) * 0.08))
    const outStart = Math.max(inStart + 0.70, outEnd - 0.50)
    const fromX = p.fromX * width
    const fromY = p.fromY * height
    const toX = p.x * width
    const toY = p.y * height
    const enter = `min(1,max(0,(t-${inStart.toFixed(3)})/0.62))`
    const exit = `min(1,max(0,(t-${outStart.toFixed(3)})/0.48))`
    const xexpr = `${fromX.toFixed(2)}+(${toX.toFixed(2)}-${fromX.toFixed(2)})*${enter}+(${(p.fromX * width - toX).toFixed(2)})*${exit}+3*sin(t*1.25+${(index * 0.8).toFixed(2)})`
    const yexpr = `${fromY.toFixed(2)}+(${toY.toFixed(2)}-${fromY.toFixed(2)})*${enter}+(${(p.fromY * height - toY).toFixed(2)})*${exit}+5*sin(t*1.50+${(index * 0.7).toFixed(2)})`
    lines.push(`[${inputNo}:v]format=rgba,setpts=PTS-STARTPTS,fade=t=in:st=${inStart.toFixed(3)}:d=0.56:alpha=1,fade=t=out:st=${outStart.toFixed(3)}:d=0.48:alpha=1[card${index}]`)
    const out = `cardmix${index}`
    lines.push(`[${current}][card${index}]overlay=x='${xexpr}':y='${yexpr}':enable='between(t,${inStart.toFixed(3)},${outEnd.toFixed(3)})':eof_action=pass:repeatlast=0:format=auto[${out}]`)
    current = out
  }
  lines.push(`[${current}]format=yuv420p[v]`)
  await fs.writeFile(scriptPath, lines.join(';\n') + '\n')
  const args = ['-y', '-nostdin', '-hide_banner', '-loglevel', 'error', '-i', inputPath]
  for (const item of scenePaths) args.push('-loop', '1', '-framerate', String(fps), '-t', Number(durationSeconds).toFixed(3), '-i', item.path)
  for (const item of cardPaths) args.push('-loop', '1', '-framerate', String(fps), '-t', Number(durationSeconds).toFixed(3), '-i', item.path)
  args.push(
    '-filter_complex_script', scriptPath,
    '-map', '[v]', '-map', '0:a:0?',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21',
    '-profile:v', 'high', '-level', '3.1', '-pix_fmt', 'yuv420p',
    '-vsync', 'cfr', '-r', String(fps),
    '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-ac', '2',
    '-t', Number(durationSeconds).toFixed(3),
    '-movflags', '+faststart', '-max_muxing_queue_size', '2048', '-map_metadata', '-1',
    outputPath,
  )
  const runner = spawnEncoder(ffmpeg, args, 300000, 'StoryVideo compositor')
  try {
    await runner.done
  } finally {
    await fs.rm(scriptPath, { force: true }).catch(() => {})
  }
}

async function compositeSimpleSceneVideo({ inputPath, scenePaths, outputPath, width, height, fps, durationSeconds, scenes }) {
  const ffmpeg = await resolveFfmpeg()
  const scriptPath = `${outputPath}.simple.filter.txt`
  const lines = ['[0:v]setpts=PTS-STARTPTS[base0]']
  let current = 'base0'
  for (let index = 0; index < scenes.length; index++) {
    const item = scenePaths.find((entry) => entry.scene.index === index && entry.state === 'full')
    if (!item) continue
    const inStart = scenes[index].startMs / 1000
    const outEnd = (scenes[index].startMs + scenes[index].durationMs) / 1000
    const inFade = Math.min(0.46, Math.max(0.22, scenes[index].durationMs / 1000 * 0.15))
    const outStart = Math.max(inStart + inFade + 0.20, outEnd - 0.40)
    const inputNo = 1 + index
    lines.push(`[${inputNo}:v]format=rgba,setpts=PTS-STARTPTS,fade=t=in:st=${inStart.toFixed(3)}:d=${inFade.toFixed(3)}:alpha=1,fade=t=out:st=${outStart.toFixed(3)}:d=0.40:alpha=1[simple${index}]`)
    const out = `simplemix${index}`
    lines.push(`[${current}][simple${index}]overlay=0:0:enable='between(t,${inStart.toFixed(3)},${outEnd.toFixed(3)})':eof_action=pass:repeatlast=0:format=auto[${out}]`)
    current = out
  }
  lines.push(`[${current}]format=yuv420p[v]`)
  await fs.writeFile(scriptPath, lines.join(';\n') + '\n')
  const args = ['-y', '-nostdin', '-hide_banner', '-loglevel', 'error', '-i', inputPath]
  for (const item of scenePaths.filter((entry) => entry.state === 'full')) args.push('-loop', '1', '-framerate', String(fps), '-t', Number(durationSeconds).toFixed(3), '-i', item.path)
  args.push(
    '-filter_complex_script', scriptPath,
    '-map', '[v]', '-map', '0:a:0?',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22',
    '-profile:v', 'high', '-level', '3.1', '-pix_fmt', 'yuv420p',
    '-vsync', 'cfr', '-r', String(fps),
    '-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-ac', '2',
    '-t', Number(durationSeconds).toFixed(3), '-movflags', '+faststart', '-map_metadata', '-1',
    outputPath,
  )
  const runner = spawnEncoder(ffmpeg, args, 240000, 'StoryVideo simple compositor')
  try {
    await runner.done
  } finally {
    await fs.rm(scriptPath, { force: true }).catch(() => {})
  }
}

async function encodeFrameSequence(framesDir, outputPath, fps, audioSourcePath = null, durationSeconds = null, profile = null) {
  const ffmpeg = await resolveFfmpeg()
  const inputPattern = path.join(framesDir, 'frame-%06d.png')
  const totalFrames = storyFrameCount(durationSeconds, fps)
  const args = [
    '-y', '-nostdin',
    '-hide_banner',
    '-loglevel', 'error',
    '-framerate', String(fps),
    '-start_number', '1',
    '-i', inputPattern,
    '-map', '0:v:0',
    '-frames:v', String(totalFrames),
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', String(Number.isFinite(Number(profile?.crf)) ? Number(profile.crf) : 20),
    '-threads', '1',
    '-profile:v', 'high',
    '-level', profile?.level || '3.1',
    '-pix_fmt', 'yuv420p',
    '-vsync', 'cfr',
    '-r', String(fps),
    '-an',
    '-map_metadata', '-1',
    outputPath,
  ]
  const runner = spawnEncoder(ffmpeg, args, 300000, 'StoryVideo encoder')
  await runner.done
}

async function renderTextFrames({ scenes, outputFramesDir, width, height, fps, seedText }) {
  await fs.mkdir(outputFramesDir, { recursive: true })
  const canvas = createCanvas(width, height)
  const durationSeconds = scenes.reduce((sum, scene) => sum + scene.durationMs, 0) / 1000
  const totalFrames = Math.max(1, Math.ceil(durationSeconds * fps))
  for (let index = 0; index < totalFrames; index++) {
    const timeMs = index * 1000 / fps
    const scene = sceneAtTime(scenes, timeMs)
    if (!scene) throw Object.assign(new Error('Scene tidak tersedia.'), { code: 'INPUT' })
    const buffer = await renderCanvasFrame({ canvas, scene, scenes, timeMs, seedText, width, height, overlayMode: false })
    const framePath = path.join(outputFramesDir, `frame-${String(index + 1).padStart(6, '0')}.png`)
    await fs.writeFile(framePath, buffer)
  }
  return totalFrames
}



async function validateVideo(outputPath, expectedWidth, expectedHeight) {
  const stat = await fs.stat(outputPath)
  if (!stat.size) throw Object.assign(new Error('Video hasil kosong.'), { code: 'OUTPUT' })
  if (stat.size > MAX_VIDEO_BYTES) throw Object.assign(new Error('Video hasil terlalu besar untuk dikirim.'), { code: 'SIZE' })

  const ffprobe = resolveFfprobe()
  const { stdout } = await runCommand(ffprobe, [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=codec_name,width,height,pix_fmt,r_frame_rate',
    '-of', 'default=noprint_wrappers=1',
    outputPath,
  ], 30000)
  const required = ['codec_name=h264', `width=${expectedWidth}`, `height=${expectedHeight}`, 'pix_fmt=yuv420p']
  for (const entry of required) {
    if (!stdout.includes(entry)) throw Object.assign(new Error('Video hasil tidak lolos pemeriksaan format.'), { code: 'VALIDATE' })
  }
  await runCommand(await resolveFfmpeg(), ['-hide_banner', '-loglevel', 'error', '-xerror', '-i', outputPath, '-map', '0:v:0', '-f', 'null', '-'], 60000)
  return stat
}

function buildPublicError(error) {
  const code = error?.code
  const stage = String(error?.stage || '')
  if (code === 'TIMEOUT') return '⚠️ *StoryVideo gagal*\n\n• Render terlalu lama.\n• Coba video atau teks yang lebih singkat.'
  if (code === 'SIZE') return '⚠️ *StoryVideo gagal*\n\n• Video hasil terlalu besar.\n• Coba video sumber yang lebih ringan.'
  if (code === 'VALIDATE' || code === 'OUTPUT') return '⚠️ *StoryVideo gagal*\n\n• Hasil render tidak lolos pemeriksaan akhir.\n• Coba ulangi sekali lagi.'
  if (code === 'MEDIA') return '⚠️ *StoryVideo gagal*\n\n• Video sumber tidak bisa dibaca.\n• Coba kirim video lain.'
  if (code === 'DEPENDENCY') return '⚠️ *StoryVideo belum siap*\n\n• Komponen Canvas/FFmpeg/FFprobe belum tersedia di server.'
  if (code === 'CANVAS') return '⚠️ *StoryVideo gagal*\n\n• Frame tidak berhasil dibuat dengan utuh.\n• Coba ulangi sekali lagi.'
  if (code === 'FFMPEG' && error?.signal === 'SIGKILL') return '⚠️ *StoryVideo gagal*\n\n• Proses encoder dihentikan oleh server.\n• Coba video yang lebih ringan atau lebih pendek.'
  if (code === 'FFMPEG' && /normalize/i.test(stage)) return '⚠️ *StoryVideo gagal*\n\n• Video sumber gagal dinormalisasi.\n• Coba video MP4 lain.'
  if (code === 'FFMPEG' && /compositor|fallback/i.test(stage)) return '⚠️ *StoryVideo gagal*\n\n• Video dan animasi gagal digabungkan.\n• Coba ulangi dengan video yang lebih pendek.'
  if (code === 'FFMPEG') return '⚠️ *StoryVideo gagal*\n\n• Frame video gagal dikodekan sampai selesai.\n• Coba ulangi sekali lagi.'
  return '⚠️ *StoryVideo gagal*\n\n• Render belum berhasil.\n• Coba ulangi sekali lagi.'
}

export function getStoryVideoUsage(prefix = '.') {
  return [
    '🎬 *STORYVIDEO*',
    '',
    `📝 ${prefix}storyvideo <nama>`,
    `✨ ${prefix}storyvideo AWANG OFC | Engine, Nature, Escape`,
    `🖋️ ${prefix}storyvideo AWANG OFC | Engine, Nature, Escape | The`,
  ].join('\n')
}

function extensionFromMime(mime = '') {
  const type = String(mime || '').toLowerCase().split(';')[0].trim()
  if (type === 'video/webm') return 'webm'
  if (type === 'video/quicktime') return 'mov'
  if (type === 'video/3gpp') return '3gp'
  return 'mp4'
}

export async function renderStoryVideo(text, options = {}, inputVideoBuffer = null, inputVideoMime = 'video/mp4') {
  const normalized = sanitizeText(text)
  if (!normalized) throw Object.assign(new Error('Teks belum diisi.'), { code: 'INPUT' })
  if (normalized.length > MAX_INPUT) throw Object.assign(new Error('Teks terlalu panjang.'), { code: 'INPUT' })
  if (inputVideoBuffer && inputVideoBuffer.length > MAX_SOURCE_VIDEO_BYTES) throw Object.assign(new Error('Video sumber terlalu besar.'), { code: 'MEDIA' })

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'usanagi-storyvideo-'))
  const inputPath = inputVideoBuffer ? path.join(dir, `source.${extensionFromMime(inputVideoMime)}`) : null
  if (inputVideoBuffer) await fs.writeFile(inputPath, inputVideoBuffer)

  try {
    const hdProfile = os.freemem() >= 1200 * 1024 * 1024
      ? { width: 1080, height: 1920, fps: 20, quality: 'hd', crf: 19, level: '4.2' }
      : { width: 900, height: 1600, fps: 20, quality: 'hd-balanced', crf: 18, level: '4.1' }
    const profiles = [
      hdProfile,
      { width: BASE_WIDTH, height: BASE_HEIGHT, fps: BASE_FPS, quality: 'standard', crf: 21, level: '3.1' },
      { width: 540, height: 960, fps: 18, quality: 'fallback', crf: 23, level: '3.1' },
    ]
    let inputDuration = null
    let storyboardDuration = null
    if (inputPath) {
      try {
        inputDuration = clamp(await probeDuration(inputPath), MIN_SOURCE_DURATION_SECONDS, MAX_VIDEO_SECONDS)
        storyboardDuration = clamp(Math.max(inputDuration, 7.2), MIN_SOURCE_DURATION_SECONDS, MAX_VIDEO_SECONDS)
      } catch (error) {
        throw Object.assign(new Error('Video sumber tidak bisa dibaca.'), { code: 'MEDIA', cause: error })
      }
    }

    let lastError = null
    for (let attempt = 0; attempt < profiles.length; attempt++) {
      const profile = profiles[attempt]
      try {
        const scenes = makeScenes(normalized, options, inputPath ? storyboardDuration * 1000 : null)
        if (!scenes.length) throw Object.assign(new Error('Teks tidak menghasilkan scene.'), { code: 'INPUT' })
        const outputPath = path.join(dir, `story-${attempt}.mp4`)

        if (inputPath) {
          const normalizedSource = path.join(dir, `normalized-${attempt}.mp4`)
          const compositedVideo = path.join(dir, `composited-${attempt}.mp4`)
          const cardDir = path.join(dir, `story-cards-${attempt}`)
          let sourceHasAudio = false
          try {
            await normalizeSourceVideo(inputPath, normalizedSource, profile, storyboardDuration, true, storyboardDuration > inputDuration + 0.05)
            sourceHasAudio = await hasAudioStream(normalizedSource)
          } catch {
            const noAudioSource = path.join(dir, `normalized-noaudio-${attempt}.mp4`)
            await normalizeSourceVideo(inputPath, noAudioSource, profile, storyboardDuration, false, storyboardDuration > inputDuration + 0.05)
            await fs.copyFile(noAudioSource, normalizedSource)
          }
          let cardPaths = []
          try {
            cardPaths = await extractReferenceStoryCards(normalizedSource, cardDir, storyboardDuration, profile.width, profile.height)
          } catch {
            cardPaths = []
          }
          const overlayDir = path.join(dir, `reference-overlay-${attempt}`)
          const overlayFps = chooseOverlayFps(storyboardDuration)
          try {
            await renderReferenceOverlayFrames({ scenes, cardPaths, outputFramesDir: overlayDir, width: profile.width, height: profile.height, fps: overlayFps, seedText: normalized, durationSeconds: storyboardDuration, storyText: options.storyText })
            const maskPath = path.join(dir, `story-frame-mask-${attempt}.png`)
            await createStoryFrameMask(maskPath, profile.width, profile.height)
            await compositeReferenceVideo({ inputPath: normalizedSource, overlayFramesDir: overlayDir, outputPath: compositedVideo, width: profile.width, height: profile.height, fps: profile.fps, overlayFps, durationSeconds: storyboardDuration, maskPath, profile })
          } catch (complexError) {
            const reducedOverlayDir = path.join(dir, `reference-overlay-reduced-${attempt}`)
            try {
              await renderReferenceOverlayFrames({ scenes, cardPaths: [], outputFramesDir: reducedOverlayDir, width: profile.width, height: profile.height, fps: overlayFps, seedText: normalized, durationSeconds: storyboardDuration, storyText: options.storyText })
              const maskPath = path.join(dir, `story-frame-mask-${attempt}.png`)
              await createStoryFrameMask(maskPath, profile.width, profile.height)
              await compositeReferenceVideo({ inputPath: normalizedSource, overlayFramesDir: reducedOverlayDir, outputPath: compositedVideo, width: profile.width, height: profile.height, fps: profile.fps, overlayFps, durationSeconds: storyboardDuration, maskPath, profile })
            } catch (reducedError) {
              const lastFrameNumber = storyFrameCount(storyboardDuration, overlayFps)
              const fallbackFrameCandidates = [
                path.join(reducedOverlayDir, `frame-${String(lastFrameNumber).padStart(6, '0')}.png`),
                path.join(overlayDir, `frame-${String(lastFrameNumber).padStart(6, '0')}.png`),
              ]
              let fallbackFrame = null
              for (const candidate of fallbackFrameCandidates) {
                try {
                  const stat = await fs.stat(candidate)
                  if (stat.size > 64) {
                    fallbackFrame = candidate
                    break
                  }
                } catch {
                }
              }
              if (!fallbackFrame) throw (reducedError?.code ? reducedError : complexError)
              try {
                await compositeStaticOverlayVideo({ inputPath: normalizedSource, overlayFramePath: fallbackFrame, outputPath: compositedVideo, fps: profile.fps, durationSeconds: storyboardDuration, profile })
              } catch {
                throw (complexError?.code ? complexError : reducedError)
              }
            }
          }
          if (sourceHasAudio) {
            try {
              await muxSourceAudio(compositedVideo, normalizedSource, outputPath, storyboardDuration)
            } catch {
              await fs.copyFile(compositedVideo, outputPath)
            }
          } else {
            await fs.copyFile(compositedVideo, outputPath)
          }
        } else {
          const outputFramesDir = path.join(dir, `frames-${attempt}`)
          const duration = scenes.reduce((sum, scene) => sum + scene.durationMs, 0) / 1000
          await renderTextFrames({ scenes, outputFramesDir, width: profile.width, height: profile.height, fps: profile.fps, seedText: normalized })
          await encodeFrameSequence(outputFramesDir, outputPath, profile.fps, null, duration, profile)
        }

        const stat = await validateVideo(outputPath, profile.width, profile.height)
        const buffer = await fs.readFile(outputPath)
        if (!Buffer.isBuffer(buffer) || buffer.length !== stat.size) throw Object.assign(new Error('Video hasil tidak terbaca utuh.'), { code: 'OUTPUT' })
        const totalDuration = storyboardDuration ?? scenes.reduce((sum, scene) => sum + scene.durationMs, 0) / 1000
        return {
          buffer,
          size: stat.size,
          durationMs: Math.round(totalDuration * 1000),
          scenes: scenes.length,
          styleName: options.style && options.style !== 'auto' ? STYLES[options.style]?.name || scenes[0].styleName : scenes[0].styleName,
          fontFamily: options.font && options.font !== 'auto' ? options.font : scenes[0].fontFamily,
          quality: profile.quality,
          usedSourceVideo: Boolean(inputVideoBuffer),
        }
      } catch (error) {
        lastError = error
        if (attempt === 0) continue
      }
    }

    throw (lastError || Object.assign(new Error('Render gagal.'), { code: 'FFMPEG' }))
  } catch (error) {
    error.publicMessage = buildPublicError(error)
    throw error
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {})
  }
}

const STORY_FONT_DATA = {
  display: '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',
  script: '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',
  serifItalic: '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',
  sans: 'd09GMgABAAAAAATIAAwAAAAACKwAAAR6AAQBBgAAAAAAAAAAAAAAAAAAAAAAAAAAGyAcMAZgAHQKiCiGdgE2AiQDPAsgAAQgBYMaByAbCQcIngVO2S2CQwiHSx8tJOpa8cN4+Nrv9dzdffkhgNZHtixbRSA0kWVVYTKVqKocAEiwzf9fp3+DaqYA0jpghQkxE/SloKfn7763APYQ0nxpZ/Q/QHhtj7FzlhIhE9fURfEam2RAA5/Ify+iKZOf/kZJNF3rmiq4BAc2UJw5G5K8FCk0xBCuZ5yd+41eLdBoWDLGNqWeBH8FNgUw+TIeVnHkqbZxESQ3ShMRQ7W85H2MteBDus50AtjbSuIIiELdSJW2hm6n3fuVJjgNqaZK/P/tWssAcwQ9I02nowDGsZGQ0Y0lPI/tmC8UK1o8rlmbDl16DRgzNWdkXFPK7Tf8m9xNhQkhhs7QJtRRfxd4ET+egqWglmSoIUyC09XeGOef2h7ILt3tbuuC7ij/x14vfsPDZeClMe7fx64vLTE+2znY9fv3gfZ48BteL+M1GPcAfX/rjwdY1ZQ+HoE//YFBMAW/X+W85h02LA0EyKC3dyFX+e34NkaNEfebPb1Y8v4kY/HUjBNAH8coNlYdtaW/PcBszNcEPIlXTR7xcA3+UN3zCvK1yorXXlzj9TFwE6fjmzx1txjXbtovFsylsM13sevXgT5xRXrBcyetLnWQSZ/Aj4IlRm6MJkNBOvOrrLkJg9/y2HxmEkP1uAvldRDz4wqNuqt8c6ub424/0l2h0oypiEXbrXUhIgVisY3vkxWVQrctspICObICzn3oKVdoxxTEPGkjFsdVGlV3+ZE29OZg1kgP28gXi0iByF1eYUGF9WmVUNVc8IRtbq1Vlxpl/5ujjMuam43TCgVNUcTCtNxsnCCqxnV1Sq7WmCVQNDp8DbUwttz9uJMEusrR8WpT75q2QEfty8NlNbr6OmrkSFelSjM+r4H8kp6uvZ460XRRHB/fW+My9mkZcflODuLAntdv9HGOcWcmh4lamdViV6lJl52POMi4z80tgg/+FxVKmiLV9JzcaLRbqxcoSksvKIwCE8WVoJoaMbIVCEVWC0RiQoAsfwKc+u0UV9XHrtudhzjIBbf8T+YV69Pqi+TiIsmJDM6XmtBb+lRZlTRPqEA5pWgAsUwo77VUuC49IV3+7pEm2cDgblXV5pTCsQdETmgeYbDqdQozodKplqPla3QgmuIgyzo3r6iqTVLSpa+ulVosdpXG5rJzgTMVuSOrvsfvSVLbgWP7jgFAoETdHXyltiGk7J9/zj8AeLFz30kAXkfLrv9///88VisLQE2CRtaIteE9xPnd31H80TPjL4gm0j3ItwFD6vXJfD9UCM+QaF9+jMnnMWvRC/GJBnUSCxRocxcCneYrJKN8cQrIEmoOYInSgA2ASBlabVAT87EyW3dSWYz6o6w0Rv95dUYjHWHAoCnDunToNCqViEB9qciE2mYww7pBNNBvJNYNJ+lubVpIX7Uxr+vMDMOYIadQN0qWjijBx1+VMJgc04xHpwf04WeG9rXq79e6RkEl+GSz3NhgXbvUMWrTIBokJZPSWQkIGPweCR4BAYlmRRzOEOGquA6WTtPmEgEA',
  sansSemi: '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',
}

const seenStoryMessages = new Map()
const STORY_MESSAGE_TTL_MS = 10 * 60 * 1000

function pruneStoryMessageClaims(now = Date.now()) {
  for (const [key, expiresAt] of seenStoryMessages.entries()) {
    if (expiresAt <= now) seenStoryMessages.delete(key)
  }
}

export function claimStoryMessage(key) {
  const normalized = String(key || '').trim()
  if (!normalized) return true
  const now = Date.now()
  pruneStoryMessageClaims(now)
  const expiresAt = seenStoryMessages.get(normalized)
  if (expiresAt && expiresAt > now) return false
  seenStoryMessages.set(normalized, now + STORY_MESSAGE_TTL_MS)
  return true
}

export function makeStoryJobKey(m) {
  return `${String(m?.chat || '')}:${String(m?.sender || '')}`
}

export function makeStoryMessageKey(m) {
  const chat = String(m?.chat || '').trim()
  const messageId = String(m?.key?.id || '').trim()
  if (!chat || !messageId) return ''
  return `${chat}:${messageId}`
}

export function isStoryVideoBusy(key) {
  return busyJobs.has(key)
}

export function startStoryVideoJob(key) {
  if (busyJobs.has(key)) return false
  busyJobs.add(key)
  return true
}

export function endStoryVideoJob(key) {
  busyJobs.delete(key)
}

export { buildPublicError }

export default {
  getStoryVideoUsage,
  renderStoryVideo,
  parseArgs,
  makeStoryJobKey,
  makeStoryMessageKey,
  claimStoryMessage,
  isStoryVideoBusy,
  startStoryVideoJob,
  endStoryVideoJob,
  buildPublicError,
}

const QUOTES_VIDEO_MAX_INPUT = 50 * 1024 * 1024
const QUOTES_VIDEO_MAX_SECONDS = 30
const QUOTES_VIDEO_MIN_SECONDS = 3
const QUOTES_VIDEO_FPS = 20
const QUOTES_VIDEO_MAX_QUOTE_LENGTH = 420
const QUOTES_VIDEO_MAX_HEADING_LENGTH = 64
const QUOTES_VIDEO_CREDIT = global.brandCredit || 'By AlzRiss - Usanagi Umi AI'
const QUOTES_VIDEO_MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const QUOTES_VIDEO_PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
let quotesFfmpegPromise = null
let quotesFfprobePromise = null

function quotesNormalizeText(value) {
  return String(value || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim()
}

function quotesFormatDate(date = new Date()) {
  let parts
  try {
    parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jakarta',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).formatToParts(date)
  } catch {
    parts = new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).formatToParts(date)
  }
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  const monthIndex = Math.max(0, Math.min(11, Number(map.month || 1) - 1))
  return {
    day: String(map.day || '01').padStart(2, '0'),
    month: QUOTES_VIDEO_MONTHS[monthIndex],
    year: String(map.year || new Date().getFullYear()),
  }
}

function quotesTextWidth(ctx, text) {
  return Number(ctx.measureText(String(text || '')).width || 0)
}

function quotesBreakLongWord(ctx, word, maxWidth) {
  const chunks = []
  let chunk = ''
  for (const character of String(word || '')) {
    const candidate = chunk + character
    if (!chunk || quotesTextWidth(ctx, candidate) <= maxWidth) {
      chunk = candidate
      continue
    }
    chunks.push(chunk)
    chunk = character
  }
  if (chunk) chunks.push(chunk)
  return chunks.length ? chunks : ['']
}

function quotesWrapText(ctx, text, maxWidth, maxLines, fontSpec) {
  ctx.font = fontSpec
  const safeWidth = Math.max(80, Number(maxWidth) || 80)
  const safeLines = Math.max(1, Math.floor(maxLines) || 1)
  const source = quotesNormalizeText(text)
  const paragraphs = source.split('\n')
  const lines = []

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean)
    if (!words.length) {
      if (lines.length) lines.push('')
      continue
    }
    let line = ''
    for (const word of words) {
      if (quotesTextWidth(ctx, word) > safeWidth) {
        if (line) {
          lines.push(line)
          line = ''
        }
        const chunks = quotesBreakLongWord(ctx, word, safeWidth)
        for (let index = 0; index < chunks.length - 1; index++) lines.push(chunks[index])
        line = chunks[chunks.length - 1]
        continue
      }
      const candidate = line ? `${line} ${word}` : word
      if (!line || quotesTextWidth(ctx, candidate) <= safeWidth) {
        line = candidate
      } else {
        lines.push(line)
        line = word
      }
    }
    if (line) lines.push(line)
  }

  if (!lines.length) return ['']
  if (lines.length <= safeLines) return lines

  const clipped = lines.slice(0, safeLines)
  let last = clipped[safeLines - 1]
  for (let index = safeLines; index < lines.length; index++) {
    const candidate = `${last} ${lines[index]}`
    if (quotesTextWidth(ctx, `${candidate}…`) > safeWidth) break
    last = candidate
  }
  if (quotesTextWidth(ctx, `${last}…`) <= safeWidth) {
    clipped[safeLines - 1] = `${last}…`
  } else {
    let shortened = last
    while (shortened.length > 1 && quotesTextWidth(ctx, `${shortened}…`) > safeWidth) shortened = shortened.slice(0, -1)
    clipped[safeLines - 1] = `${shortened}…`
  }
  return clipped
}

function quotesFitHeading(ctx, text, maxWidth, minDim) {
  const safeWidth = Math.max(180, maxWidth)
  const preferred = clamp(Math.round(minDim * 0.074), 42, 66)
  for (let size = preferred; size >= 28; size -= 1) {
    const fontSpec = `800 ${size}px Arial`
    const lines = quotesWrapText(ctx, text.toUpperCase(), safeWidth, 2, fontSpec)
    const widest = Math.max(...lines.map((line) => quotesTextWidth(ctx, line)), 0)
    if (lines.length <= 2 && widest <= safeWidth) return { size, fontSpec, lines }
  }
  const fontSpec = '800 28px Arial'
  return { size: 28, fontSpec, lines: quotesWrapText(ctx, text.toUpperCase(), safeWidth, 2, fontSpec) }
}

function quotesFitQuote(ctx, text, maxWidth, maxLines, maxHeight, minDim) {
  const preferred = clamp(Math.round(minDim * 0.0195), 15, 19)
  for (let size = preferred; size >= 13; size -= 1) {
    const fontSpec = `600 ${size}px Arial`
    const lineHeight = Math.max(18, Math.round(size * 1.26))
    const lines = quotesWrapText(ctx, text, maxWidth, maxLines, fontSpec)
    const widest = Math.max(...lines.map((line) => quotesTextWidth(ctx, line)), 0)
    if (lines.length <= maxLines && widest <= maxWidth && lineHeight * lines.length <= maxHeight) {
      return { size, fontSpec, lines, lineHeight }
    }
  }
  const fontSpec = '600 13px Arial'
  return { size: 13, fontSpec, lines: quotesWrapText(ctx, text, maxWidth, maxLines, fontSpec), lineHeight: 17 }
}

function quotesEaseOut(value) {
  return easeOutCubic(clamp(value, 0, 1))
}

function quotesEaseInOut(value) {
  return easeInOut(clamp(value, 0, 1))
}

function quotesOutputProfile(source, fallback = false) {
  const width = Number(source?.width || 0)
  const height = Number(source?.height || 0)
  if (!width || !height) throw Object.assign(new Error('Resolusi video tidak valid.'), { code: 'MEDIA' })
  const ratio = width / height
  const orientation = ratio >= 1.15 ? 'landscape' : ratio <= 0.87 ? 'portrait' : 'square'
  if (fallback) {
    if (orientation === 'landscape') return { width: 960, height: 540, orientation, quality: 'fallback', fps: QUOTES_VIDEO_FPS }
    if (orientation === 'portrait') return { width: 540, height: 960, orientation, quality: 'fallback', fps: QUOTES_VIDEO_FPS }
    return { width: 720, height: 720, orientation, quality: 'fallback', fps: QUOTES_VIDEO_FPS }
  }
  if (orientation === 'landscape') return { width: 1280, height: 720, orientation, quality: 'standard', fps: QUOTES_VIDEO_FPS }
  if (orientation === 'portrait') return { width: 720, height: 1280, orientation, quality: 'standard', fps: QUOTES_VIDEO_FPS }
  return { width: 960, height: 960, orientation, quality: 'standard', fps: QUOTES_VIDEO_FPS }
}

function quotesLayout(width, height, heading, quote, dateParts, credit, ctx) {
  const minDim = Math.min(width, height)
  const orientation = height >= width * 1.15 ? 'portrait' : width >= height * 1.15 ? 'landscape' : 'square'

  let cardW
  let cardH
  let cardY
  if (orientation === 'portrait') {
    cardW = width * 0.817
    cardH = height * 0.2715
    cardY = height * 0.3645
  } else if (orientation === 'landscape') {
    cardW = width * 0.78
    cardH = height * 0.46
    cardY = height * 0.27
  } else {
    cardW = width * 0.82
    cardH = height * 0.43
    cardY = height * 0.285
  }

  const cardX = (width - cardW) / 2
  const pad = Math.max(26, Math.round(minDim * (orientation === 'portrait' ? 0.074 : 0.06)))
  const iconSize = Math.max(34, Math.round(minDim * 0.053))
  const iconGap = Math.max(8, Math.round(minDim * 0.010))
  const titleMaxW = Math.max(170, cardW - pad * 2 - iconSize - iconGap)
  const titleFit = quotesFitHeading(ctx, heading, titleMaxW, minDim)
  const titleLineHeight = Math.round(titleFit.size * 1.05)
  const titleBlockHeight = titleFit.lines.length * titleLineHeight

  const titleTop = cardY + Math.round(minDim * 0.061)
  const ruleY = titleTop + titleBlockHeight + Math.round(minDim * 0.024)
  const ruleW = Math.max(42, Math.round(minDim * 0.055))
  const ruleH = Math.max(4, Math.round(minDim * 0.007))
  const contentTop = ruleY + Math.round(minDim * 0.045)

  const dateColW = Math.max(84, Math.round(cardW * 0.17))
  const contentGap = Math.max(18, Math.round(minDim * 0.018))
  const quoteMaxW = Math.max(160, cardW - pad * 2 - dateColW - contentGap)

  const creditFontSize = Math.max(12, Math.round(minDim * 0.0175))
  const creditY = cardY + cardH - Math.max(30, Math.round(minDim * 0.061))
  const creditPadX = Math.max(8, Math.round(creditFontSize * 0.62))
  ctx.font = `500 ${creditFontSize}px Arial`
  const creditTextWidth = quotesTextWidth(ctx, credit)
  const creditPillH = Math.max(23, Math.round(creditFontSize * 1.9))
  const creditPillW = creditTextWidth + creditPadX * 2

  const dateTop = contentTop - Math.round(minDim * 0.001)
  const quoteBottom = creditY - Math.max(35, Math.round(minDim * 0.037))
  const quoteHeight = Math.max(70, quoteBottom - contentTop)
  const maxQuoteLines = orientation === 'portrait' ? 8 : orientation === 'square' ? 7 : 6
  const quoteFit = quotesFitQuote(ctx, quote, quoteMaxW, maxQuoteLines, quoteHeight, minDim)

  return {
    orientation,
    card: {
      x: cardX,
      y: cardY,
      w: cardW,
      h: cardH,
      radius: Math.round(minDim * 0.030),
    },
    pad,
    title: {
      x: cardX + pad,
      top: titleTop,
      maxWidth: titleMaxW,
      fit: titleFit,
      lineHeight: titleLineHeight,
    },
    line: {
      x: cardX + pad,
      y: ruleY,
      width: ruleW,
      height: ruleH,
    },
    quote: {
      x: cardX + pad,
      top: contentTop,
      maxWidth: quoteMaxW,
      fit: quoteFit,
      totalChars: quoteFit.lines.reduce((sum, line) => sum + line.length, 0),
    },
    date: {
      x: cardX + cardW - pad,
      top: dateTop,
      parts: dateParts,
      fontSize: Math.max(34, Math.round(minDim * 0.052)),
    },
    credit: {
      x: cardX + pad,
      y: creditY,
      fontSize: creditFontSize,
      text: credit,
      pillWidth: creditPillW,
      pillHeight: creditPillH,
      padX: creditPadX,
    },
    icon: {
      x: cardX + cardW - pad - iconSize - iconGap,
      y: titleTop + Math.max(1, Math.round(minDim * 0.002)),
      size: iconSize,
    },
  }
}

function quotesDrawBackgroundVignette(ctx, width, height, progress, timeSeconds) {
  const edge = ctx.createLinearGradient(0, 0, 0, height)
  edge.addColorStop(0, `rgba(0,0,0,${0.055 - progress * 0.010})`)
  edge.addColorStop(0.34, 'rgba(0,0,0,0.005)')
  edge.addColorStop(0.68, 'rgba(0,0,0,0.045)')
  edge.addColorStop(1, 'rgba(0,0,0,0.20)')
  ctx.fillStyle = edge
  ctx.fillRect(0, 0, width, height)

  const glow = ctx.createRadialGradient(
    width * (0.18 + Math.sin(timeSeconds * 0.13) * 0.02),
    height * 0.08,
    0,
    width * 0.18,
    height * 0.08,
    Math.max(width, height) * 0.54,
  )
  glow.addColorStop(0, 'rgba(255,219,172,0.065)')
  glow.addColorStop(0.48, 'rgba(255,175,110,0.018)')
  glow.addColorStop(1, 'rgba(255,140,70,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)
}

function quotesDrawCard(ctx, layout, progress, timeSeconds) {
  const { x, y, w, h, radius } = layout.card
  const appear = quotesEaseOut((progress - 0.035) / 0.24)
  const offsetY = (1 - appear) * 10
  const scale = 0.994 + appear * 0.006
  ctx.save()
  ctx.globalAlpha = appear
  ctx.translate(x + w / 2, y + h / 2)
  ctx.scale(scale, scale)
  ctx.translate(-w / 2 - x, -h / 2 - y + offsetY)
  ctx.shadowColor = 'rgba(0,0,0,0.22)'
  ctx.shadowBlur = Math.max(18, Math.round(w * 0.027))
  ctx.shadowOffsetY = Math.max(6, Math.round(h * 0.035))
  roundedRect(ctx, x, y, w, h, radius)
  const fill = ctx.createLinearGradient(x, y, x + w, y + h)
  fill.addColorStop(0, 'rgba(36,32,29,0.30)')
  fill.addColorStop(0.50, 'rgba(27,25,23,0.25)')
  fill.addColorStop(1, 'rgba(9,9,9,0.30)')
  ctx.fillStyle = fill
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0

  roundedRect(ctx, x + 1, y + 1, w - 2, h - 2, Math.max(10, radius - 1))
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = Math.max(1, Math.min(2, minSafe(w, h) * 0.0018))
  ctx.stroke()

  const gloss = ctx.createLinearGradient(x, y, x, y + h * 0.40)
  gloss.addColorStop(0, 'rgba(255,255,255,0.045)')
  gloss.addColorStop(1, 'rgba(255,255,255,0)')
  roundedRect(ctx, x + 2, y + 2, w - 4, h * 0.38, Math.max(9, radius - 2))
  ctx.fillStyle = gloss
  ctx.fill()

  void timeSeconds
  ctx.restore()
}

function minSafe(a, b) {
  return Math.max(1, Math.min(Number(a) || 1, Number(b) || 1))
}

function quotesDrawIcon(ctx, layout, progress) {
  const { x, y, size } = layout.icon
  const appear = quotesEaseOut((progress - 0.17) / 0.20)
  ctx.save()
  ctx.globalAlpha = appear
  roundedRect(ctx, x, y, size, size, Math.max(6, Math.round(size * 0.08)))
  ctx.strokeStyle = 'rgba(255,255,255,0.92)'
  ctx.lineWidth = Math.max(2, Math.round(size * 0.045))
  ctx.stroke()
  ctx.fillStyle = 'rgba(255,255,255,0.94)'
  ctx.beginPath()
  ctx.moveTo(x + size * 0.31, y + size * 0.39)
  ctx.lineTo(x + size * 0.69, y + size * 0.39)
  ctx.lineTo(x + size * 0.50, y + size * 0.66)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function quotesDrawTitle(ctx, layout, progress) {
  const { x, top, fit, lineHeight } = layout.title
  const appear = quotesEaseOut((progress - 0.10) / 0.22)
  const offsetY = (1 - appear) * 8
  ctx.save()
  ctx.globalAlpha = appear
  ctx.font = fit.fontSpec
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  for (let index = 0; index < fit.lines.length; index++) {
    ctx.fillText(fit.lines[index], x, top + index * lineHeight + offsetY)
  }
  ctx.restore()
}

function quotesDrawHeadingRule(ctx, layout, progress) {
  const appear = quotesEaseOut((progress - 0.23) / 0.18)
  ctx.save()
  ctx.globalAlpha = appear
  ctx.fillStyle = '#ffffff'
  roundedRect(ctx, layout.line.x, layout.line.y, layout.line.width, layout.line.height, layout.line.height / 2)
  ctx.fill()
  ctx.restore()
}

function quotesDrawQuote(ctx, layout, progress, typingStartSeconds, typingEndSeconds, currentTimeSeconds) {
  const fit = layout.quote.fit
  const typingProgress = clamp((currentTimeSeconds - typingStartSeconds) / Math.max(0.001, typingEndSeconds - typingStartSeconds), 0, 1)
  const visibleChars = Math.min(layout.quote.totalChars, Math.floor(layout.quote.totalChars * quotesEaseInOut(typingProgress) + 0.0001))
  const lines = []
  let remaining = visibleChars
  for (const line of fit.lines) {
    if (remaining <= 0) {
      lines.push('')
      continue
    }
    lines.push(line.slice(0, remaining))
    remaining -= line.length
  }
  const appear = quotesEaseOut((currentTimeSeconds - typingStartSeconds) / 0.22)
  ctx.save()
  ctx.font = fit.fontSpec
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillStyle = '#f5f4f0'
  for (let index = 0; index < lines.length; index++) {
    if (!lines[index]) continue
    ctx.globalAlpha = appear
    ctx.fillText(lines[index], layout.quote.x, layout.quote.top + index * fit.lineHeight)
  }
  ctx.restore()
}

function quotesDrawDate(ctx, layout, progress) {
  const appear = quotesEaseOut((progress - 0.52) / 0.20)
  const { x, top, parts, fontSize } = layout.date
  ctx.save()
  ctx.globalAlpha = appear
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'top'
  ctx.font = `800 ${fontSize}px Arial`
  ctx.fillText(parts.day, x, top)
  ctx.font = `700 ${Math.max(16, Math.round(fontSize * 0.47))}px Arial`
  ctx.fillText(parts.month, x, top + fontSize * 1.02)
  ctx.font = `800 ${Math.max(20, Math.round(fontSize * 0.69))}px Arial`
  ctx.fillText(parts.year, x, top + fontSize * 1.48)
  ctx.restore()
}

function quotesDrawCredit(ctx, layout, progress) {
  const appear = quotesEaseOut((progress - 0.70) / 0.20)
  const { x, y, fontSize, text, pillWidth, pillHeight, padX } = layout.credit
  ctx.save()
  ctx.globalAlpha = appear
  ctx.font = `500 ${fontSize}px Arial`
  ctx.textAlign = 'left'
  ctx.textBaseline = 'middle'
  roundedRect(ctx, x, y - pillHeight / 2, pillWidth, pillHeight, Math.round(pillHeight * 0.25))
  ctx.fillStyle = 'rgba(0,0,0,0.22)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.075)'
  ctx.lineWidth = Math.max(1, minSafe(fontSize * 0.06, 1.2))
  ctx.stroke()
  ctx.fillStyle = 'rgba(255,255,255,0.82)'
  ctx.fillText(text, x + padX, y)
  ctx.restore()
}

function quotesAnimationTiming(durationSeconds, quote) {
  const safeDuration = Math.max(QUOTES_VIDEO_MIN_SECONDS, Number(durationSeconds) || QUOTES_VIDEO_MIN_SECONDS)
  const start = safeDuration <= 4.2 ? 0.62 : 0.82
  const typingDuration = clamp(1.65 + String(quote || '').length * 0.009, 1.80, 2.80)
  const end = Math.min(start + typingDuration, Math.max(start + 1.55, Math.min(safeDuration - 0.80, 3.80)))
  return { start, end }
}

function drawQuotesVideoOverlay(ctx, layout, animationDurationSeconds, timeSeconds, heading, quote) {
  const safeTime = Math.max(0, Number(timeSeconds) || 0)
  const progress = clamp(safeTime / Math.max(0.001, animationDurationSeconds), 0, 1)
  const timing = quotesAnimationTiming(animationDurationSeconds, quote)
  quotesDrawBackgroundVignette(ctx, ctx.canvas.width, ctx.canvas.height, progress, safeTime)
  quotesDrawCard(ctx, layout, progress, safeTime)
  quotesDrawTitle(ctx, layout, progress)
  quotesDrawHeadingRule(ctx, layout, progress)
  quotesDrawIcon(ctx, layout, progress)
  quotesDrawQuote(ctx, layout, progress, timing.start, timing.end, safeTime)
  quotesDrawDate(ctx, layout, progress)
  quotesDrawCredit(ctx, layout, progress)
}

function quotesOverlayFps(durationSeconds) {
  void durationSeconds
  return QUOTES_VIDEO_FPS
}

async function quotesExecFile(binary, args, timeoutMs = 15000, maxBuffer = 8 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    execFile(binary, args, { timeout: timeoutMs, maxBuffer }, (error, stdout, stderr) => {
      if (error) {
        const detail = String(stderr || stdout || error.message || '').trim()
        reject(Object.assign(new Error(detail || `${path.basename(binary)} gagal.`), { code: error.code || 'EXEC' }))
        return
      }
      resolve({ stdout: String(stdout || ''), stderr: String(stderr || '') })
    })
  })
}

async function quotesResolveFfmpeg() {
  if (quotesFfmpegPromise) return quotesFfmpegPromise
  quotesFfmpegPromise = (async () => {
    const candidates = []
    if (process.env.FFMPEG_PATH) candidates.push(process.env.FFMPEG_PATH)
    try {
      const mod = await import('@ffmpeg-installer/ffmpeg')
      if (mod.default?.path) candidates.push(mod.default.path)
      if (mod.path) candidates.push(mod.path)
    } catch {
    }
    candidates.push('ffmpeg', '/usr/bin/ffmpeg', '/usr/local/bin/ffmpeg')
    const unique = [...new Set(candidates.filter(Boolean))]
    let lastError = null
    for (const candidate of unique) {
      try {
        const version = await quotesExecFile(candidate, ['-version'], 10000, 1024 * 1024)
        if (!/ffmpeg version/i.test(version.stdout)) throw new Error('FFmpeg version tidak valid.')
        const encoders = await quotesExecFile(candidate, ['-hide_banner', '-encoders'], 12000, 4 * 1024 * 1024)
        if (!/libx264/i.test(encoders.stdout)) throw new Error('Encoder libx264 tidak tersedia.')
        const filters = await quotesExecFile(candidate, ['-hide_banner', '-filters'], 12000, 4 * 1024 * 1024)
        if (!/boxblur/i.test(filters.stdout)) throw new Error('Filter boxblur tidak tersedia.')
        return candidate
      } catch (error) {
        lastError = error
      }
    }
    throw Object.assign(new Error(lastError?.message || 'FFmpeg tidak tersedia.'), { code: 'DEPENDENCY', cause: lastError })
  })()
  try {
    return await quotesFfmpegPromise
  } catch (error) {
    quotesFfmpegPromise = null
    throw error
  }
}

async function quotesResolveFfprobe() {
  if (quotesFfprobePromise) return quotesFfprobePromise
  quotesFfprobePromise = (async () => {
    const candidates = []
    if (process.env.FFPROBE_PATH) candidates.push(process.env.FFPROBE_PATH)
    if (process.env.FFMPEG_PATH) candidates.push(path.join(path.dirname(process.env.FFMPEG_PATH), process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe'))
    candidates.push('ffprobe', '/usr/bin/ffprobe', '/usr/local/bin/ffprobe')
    const unique = [...new Set(candidates.filter(Boolean))]
    let lastError = null
    for (const candidate of unique) {
      try {
        const version = await quotesExecFile(candidate, ['-version'], 10000, 1024 * 1024)
        if (/ffprobe version/i.test(version.stdout)) return candidate
      } catch (error) {
        lastError = error
      }
    }
    throw Object.assign(new Error(lastError?.message || 'FFprobe tidak tersedia.'), { code: 'DEPENDENCY', cause: lastError })
  })()
  try {
    return await quotesFfprobePromise
  } catch (error) {
    quotesFfprobePromise = null
    throw error
  }
}

function quotesRunCommand(binary, args, timeoutMs = 180000, stage = 'QuotesVideo') {
  return new Promise((resolve, reject) => {
    execFile(binary, args, { timeout: timeoutMs, maxBuffer: 12 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (!error) {
        resolve({ stdout: String(stdout || ''), stderr: String(stderr || '') })
        return
      }
      const detail = String(stderr || stdout || error.message || '').trim()
      const wrapped = Object.assign(new Error(detail || `${stage} gagal.`), {
        code: 'FFMPEG',
        stage,
        detail,
        cause: error,
      })
      if (/Unknown encoder|Unknown decoder|No such filter|No such file or directory|Invalid argument/i.test(detail)) wrapped.code = 'DEPENDENCY'
      console.error(`[QuotesVideo] ${stage}: ${detail || error.message || 'gagal'}`)
      reject(wrapped)
    })
  })
}

function quotesSpawnEncoder(binary, args, timeoutMs, stage) {
  const proc = spawn(binary, args, { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true })
  let stderr = ''
  proc.stderr?.setEncoding?.('utf8')
  proc.stderr?.on?.('data', (chunk) => {
    stderr += chunk
    if (stderr.length > 32000) stderr = stderr.slice(-32000)
  })
  const done = new Promise((resolve, reject) => {
    let finished = false
    let forceTimer = null
    const timer = setTimeout(() => {
      if (finished) return
      try { proc.kill('SIGTERM') } catch {}
      forceTimer = setTimeout(() => {
        try { proc.kill('SIGKILL') } catch {}
      }, 1500)
      const error = Object.assign(new Error(`${stage} timeout.`), { code: 'TIMEOUT', stage, detail: stderr.trim() })
      finished = true
      reject(error)
    }, timeoutMs)
    proc.once('error', (error) => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      if (forceTimer) clearTimeout(forceTimer)
      const code = error?.code === 'ENOENT' ? 'DEPENDENCY' : 'FFMPEG'
      reject(Object.assign(error, { code, stage, detail: stderr.trim() }))
    })
    proc.once('close', (code, signal) => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      if (forceTimer) clearTimeout(forceTimer)
      if (code === 0) {
        resolve({ code, signal, detail: stderr.trim() })
        return
      }
      const detail = stderr.trim().split('\n').slice(-12).join(' | ')
      const error = Object.assign(new Error(detail || `${stage} berhenti (${code ?? signal ?? 'unknown'}).`), { code: 'FFMPEG', stage, signal: signal || null, detail })
      if (/Unknown encoder|Unknown decoder|No such filter|No such file or directory|Invalid argument/i.test(detail)) error.code = 'DEPENDENCY'
      console.error(`[QuotesVideo] ${stage}: ${detail || 'gagal'}`)
      reject(error)
    })
  })
  return { proc, done }
}

async function probeQuotesVideo(inputPath) {
  const ffprobe = await quotesResolveFfprobe()
  try {
    const { stdout } = await quotesRunCommand(ffprobe, [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height,duration,codec_type,codec_name:stream_tags=rotate:format=duration',
      '-of', 'json',
      inputPath,
    ], 30000, 'QuotesVideo probe')
    const data = JSON.parse(stdout || '{}')
    const stream = data?.streams?.[0]
    const formatDuration = Number(data?.format?.duration || 0)
    const streamDuration = Number(stream?.duration || 0)
    let width = Number(stream?.width || 0)
    let height = Number(stream?.height || 0)
    const rotation = Number(stream?.tags?.rotate || 0)
    if (Math.abs(rotation) % 180 === 90) [width, height] = [height, width]
    const duration = Math.max(streamDuration, formatDuration)
    if (String(stream?.codec_type || '') !== 'video') throw Object.assign(new Error('Stream video tidak ditemukan.'), { code: 'MEDIA' })
    if (!width || !height || !Number.isFinite(duration) || duration <= 0) throw Object.assign(new Error('Metadata video tidak valid.'), { code: 'MEDIA' })
    if (width < 96 || height < 96) throw Object.assign(new Error('Resolusi video terlalu kecil.'), { code: 'MEDIA' })
    return { width, height, duration, codec: String(stream?.codec_name || '') }
  } catch (error) {
    if (!error?.stage) error.stage = 'QuotesVideo probe'
    if (error?.code === 'FFMPEG' && /Invalid data found|moov atom not found|could not find codec/i.test(String(error.detail || error.message || ''))) error.code = 'MEDIA'
    throw error
  }
}

async function renderQuotesOverlayFrames({ width, height, heading, quote, dateParts, credit, durationSeconds, outputDir }) {
  await fs.mkdir(outputDir, { recursive: true })
  ensureUsanagiFont()
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  const layout = quotesLayout(width, height, heading, quote, dateParts, credit, ctx)
  const overlayFps = quotesOverlayFps(durationSeconds)
  const timing = quotesAnimationTiming(durationSeconds, quote)
  const settleSeconds = Math.min(durationSeconds, Math.max(4.10, Math.min(5.20, timing.end + 0.80)))
  const totalFrames = Math.max(1, Math.ceil(settleSeconds * overlayFps))
  let finalBuffer = null
  for (let index = 0; index < totalFrames; index++) {
    const timeSeconds = Math.min(settleSeconds, index / overlayFps)
    ctx.clearRect(0, 0, width, height)
    drawQuotesVideoOverlay(ctx, layout, settleSeconds, timeSeconds, heading, quote)
    const buffer = Buffer.from(canvas.toBuffer('image/png'))
    if (buffer.length < 64 || !buffer.subarray(0, 8).equals(QUOTES_VIDEO_PNG_SIGNATURE)) throw Object.assign(new Error('Canvas menghasilkan frame tidak valid.'), { code: 'CANVAS' })
    await fs.writeFile(path.join(outputDir, `frame-${String(index + 1).padStart(6, '0')}.png`), buffer)
    finalBuffer = buffer
  }
  if (!finalBuffer) throw Object.assign(new Error('Frame quotes tidak berhasil dibuat.'), { code: 'CANVAS' })
  const finalFramePath = path.join(outputDir, 'final.png')
  await fs.writeFile(finalFramePath, finalBuffer)
  return { layout, fps: overlayFps, settleSeconds, frameCount: totalFrames, finalFramePath }
}

async function normalizeQuotesVideoInput(inputPath, outputPath, durationSeconds, loopInput = false, withAudio = true, profile = null) {
  const ffmpeg = await quotesResolveFfmpeg()
  const width = Math.max(2, Number(profile?.width || 720))
  const height = Math.max(2, Number(profile?.height || 1280))
  const fps = Math.max(10, Number(profile?.fps || QUOTES_VIDEO_FPS))
  const scaleWidth = Math.round(width * 1.035)
  const scaleHeight = Math.round(height * 1.035)
  const vf = [
    `scale=${scaleWidth}:${scaleHeight}:force_original_aspect_ratio=increase:flags=lanczos`,
    `crop=${width}:${height}:(iw-${width})/2:(ih-${height})/2`,
    'setsar=1',
    `fps=${fps}`,
  ].join(',')
  const args = [
    '-y', '-nostdin', '-hide_banner', '-loglevel', 'error',
    '-analyzeduration', '20M', '-probesize', '20M',
    ...(loopInput ? ['-stream_loop', '-1'] : []),
    '-i', inputPath,
    '-map', '0:v:0',
  ]
  if (withAudio) args.push('-map', '0:a:0?')
  args.push(
    '-vf', vf,
    '-c:v', 'libx264',
    '-preset', process.env.USANAGI_VIDEO_X264_PRESET || 'veryfast',
    '-crf', process.env.USANAGI_VIDEO_X264_CRF || (profile?.quality === 'fallback' ? '23' : '21'),
    '-threads', '1',
    '-profile:v', 'high',
    '-level', profile?.level || '3.1',
    '-pix_fmt', 'yuv420p',
    '-r', String(fps),
    '-vsync', 'cfr',
  )
  if (withAudio) args.push('-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-ac', '2')
  else args.push('-an')
  args.push(
    '-t', Number(durationSeconds).toFixed(3),
    '-movflags', '+faststart',
    '-max_muxing_queue_size', '2048',
    '-map_metadata', '-1',
    outputPath,
  )
  const runner = quotesSpawnEncoder(ffmpeg, args, 240000, 'QuotesVideo normalize')
  await runner.done
}

async function compositeQuotesVideoPass({ inputPath, overlayDir, outputPath, width, height, overlayFps, durationSeconds, profile, withAudio }) {
  const ffmpeg = await quotesResolveFfmpeg()
  const pattern = path.join(overlayDir, 'frame-%06d.png')
  const blurRadius = profile?.quality === 'fallback' ? 8 : 11
  const blurChroma = Math.max(3, Math.round(blurRadius * 0.45))
  const scriptPath = path.join(overlayDir, 'composite.filter.txt')
  const filterLines = [
    `[0:v]scale=${width}:${height}:force_original_aspect_ratio=increase:flags=lanczos,crop=${width}:${height}:(iw-${width})/2:(ih-${height})/2,boxblur=luma_radius=${blurRadius}:luma_power=1:chroma_radius=${blurChroma}:chroma_power=1,eq=contrast=1.015:saturation=0.94:brightness=0.005,setsar=1,fps=${profile.fps}[base]`,
    `[1:v]format=rgba,setpts=PTS-STARTPTS[ov]`,
    `[base][ov]overlay=0:0:shortest=0:eof_action=repeat:repeatlast=1:format=auto,format=yuv420p[v]`,
  ]
  await fs.writeFile(scriptPath, `${filterLines.join(';\n')}\n`)
  const args = [
    '-y', '-nostdin', '-hide_banner', '-loglevel', 'error',
    '-analyzeduration', '20M', '-probesize', '20M',
    '-i', inputPath,
    '-framerate', String(overlayFps), '-start_number', '1', '-i', pattern,
    '-filter_complex_script', scriptPath,
    '-map', '[v]',
  ]
  if (withAudio) args.push('-map', '0:a:0?')
  args.push(
    '-c:v', 'libx264',
    '-preset', process.env.USANAGI_VIDEO_X264_PRESET || 'veryfast',
    '-crf', process.env.USANAGI_VIDEO_X264_CRF || (profile.quality === 'fallback' ? '23' : '21'),
    '-threads', '1',
    '-profile:v', 'high',
    '-level', profile.level || '3.1',
    '-pix_fmt', 'yuv420p',
    '-r', String(profile.fps),
    '-vsync', 'cfr',
  )
  if (withAudio) args.push('-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-ac', '2')
  else args.push('-an')
  args.push(
    '-t', Number(durationSeconds).toFixed(3),
    '-movflags', '+faststart',
    '-max_muxing_queue_size', '2048',
    '-map_metadata', '-1',
    outputPath,
  )
  try {
    const runner = quotesSpawnEncoder(ffmpeg, args, 420000, `QuotesVideo composite ${withAudio ? 'audio' : 'video-only'}`)
    await runner.done
  } finally {
    await fs.rm(scriptPath, { force: true }).catch(() => {})
  }
}

async function compositeQuotesVideo({ inputPath, overlayDir, outputPath, width, height, overlayFps, settleSeconds, durationSeconds, profile }) {
  void settleSeconds
  try {
    await compositeQuotesVideoPass({ inputPath, overlayDir, outputPath, width, height, overlayFps, durationSeconds, profile, withAudio: true })
  } catch (error) {
    await fs.rm(outputPath, { force: true }).catch(() => {})
    await compositeQuotesVideoPass({ inputPath, overlayDir, outputPath, width, height, overlayFps, durationSeconds, profile, withAudio: false })
  }
}

async function compositeQuotesVideoStaticPass({ inputPath, overlayFramePath, outputPath, durationSeconds, profile, withAudio }) {
  const ffmpeg = await quotesResolveFfmpeg()
  const blurRadius = profile?.quality === 'fallback' ? 8 : 11
  const args = [
    '-y', '-nostdin', '-hide_banner', '-loglevel', 'error',
    '-i', inputPath,
    '-loop', '1', '-framerate', '1', '-i', overlayFramePath,
    '-filter_complex', `[0:v]scale=${profile.width}:${profile.height}:force_original_aspect_ratio=increase:flags=lanczos,crop=${profile.width}:${profile.height}:(iw-${profile.width})/2:(ih-${profile.height})/2,boxblur=luma_radius=${blurRadius}:luma_power=1:chroma_radius=${Math.max(3, Math.round(blurRadius * 0.45))}:chroma_power=1,eq=contrast=1.015:saturation=0.94:brightness=0.005,setsar=1[base];[base][1:v]overlay=0:0:shortest=0:eof_action=repeat:repeatlast=1:format=auto,format=yuv420p[v]`,
    '-map', '[v]',
  ]
  if (withAudio) args.push('-map', '0:a:0?')
  args.push(
    '-c:v', 'libx264',
    '-preset', process.env.USANAGI_VIDEO_X264_PRESET || 'veryfast',
    '-crf', profile.quality === 'fallback' ? '24' : '22',
    '-threads', '1',
    '-profile:v', 'high',
    '-level', profile.level || '3.1',
    '-pix_fmt', 'yuv420p',
    '-r', String(profile.fps),
    '-vsync', 'cfr',
  )
  if (withAudio) args.push('-c:a', 'aac', '-b:a', '128k', '-ar', '48000', '-ac', '2')
  else args.push('-an')
  args.push(
    '-t', Number(durationSeconds).toFixed(3),
    '-movflags', '+faststart',
    '-max_muxing_queue_size', '2048',
    '-map_metadata', '-1',
    outputPath,
  )
  const runner = quotesSpawnEncoder(ffmpeg, args, 300000, `QuotesVideo static ${withAudio ? 'audio' : 'video-only'}`)
  await runner.done
}

async function compositeQuotesVideoStatic({ inputPath, overlayFramePath, outputPath, durationSeconds, profile }) {
  try {
    await compositeQuotesVideoStaticPass({ inputPath, overlayFramePath, outputPath, durationSeconds, profile, withAudio: true })
  } catch (error) {
    await fs.rm(outputPath, { force: true }).catch(() => {})
    await compositeQuotesVideoStaticPass({ inputPath, overlayFramePath, outputPath, durationSeconds, profile, withAudio: false })
  }
}

async function validateQuotesVideo(outputPath, width, height, expectedDuration) {
  const ffprobe = await quotesResolveFfprobe()
  const { stdout } = await quotesRunCommand(ffprobe, [
    '-v', 'error',
    '-show_entries', 'stream=index,codec_type,codec_name,width,height,pix_fmt:format=duration,size',
    '-of', 'json',
    outputPath,
  ], 30000, 'QuotesVideo validate')
  const data = JSON.parse(stdout || '{}')
  const video = data?.streams?.find((stream) => stream.codec_type === 'video')
  const duration = Number(data?.format?.duration || 0)
  const size = Number(data?.format?.size || 0)
  if (!video || video.codec_name !== 'h264') throw Object.assign(new Error('Video hasil bukan H.264.'), { code: 'VALIDATE' })
  if (Number(video.width) !== Number(width) || Number(video.height) !== Number(height)) throw Object.assign(new Error('Resolusi video hasil tidak sesuai.'), { code: 'VALIDATE' })
  if (video.pix_fmt && video.pix_fmt !== 'yuv420p') throw Object.assign(new Error('Pixel format video hasil tidak didukung.'), { code: 'VALIDATE' })
  if (!Number.isFinite(duration) || duration < Math.min(Number(expectedDuration), QUOTES_VIDEO_MIN_SECONDS) - 0.15) throw Object.assign(new Error('Durasi video hasil tidak valid.'), { code: 'VALIDATE' })
  if (!Number.isFinite(size) || size < 1024) throw Object.assign(new Error('Ukuran video hasil tidak valid.'), { code: 'VALIDATE' })
  const stat = await fs.stat(outputPath)
  return { size: stat.size, duration, width: Number(video.width), height: Number(video.height) }
}

function quotesVideoProfiles(source) {
  const lowMemory = os.freemem() < 700 * 1024 * 1024
  const profiles = []
  if (!lowMemory) profiles.push(quotesOutputProfile(source, false))
  profiles.push(quotesOutputProfile(source, true))
  return profiles.filter((profile, index, list) => index === list.findIndex((item) => item.width === profile.width && item.height === profile.height))
}

async function renderQuotesVideoAttempt({ inputPath, source, profile, dir, heading, quote, dateParts, durationSeconds }) {
  const normalizedPath = path.join(dir, `normalized-${profile.quality}.mp4`)
  const overlayDir = path.join(dir, `overlay-${profile.quality}`)
  const outputPath = path.join(dir, `result-${profile.quality}.mp4`)
  const shouldLoop = durationSeconds > source.duration + 0.05
  let normalizedReady = false
  try {
    await normalizeQuotesVideoInput(inputPath, normalizedPath, durationSeconds, shouldLoop, true, { ...profile, fps: QUOTES_VIDEO_FPS })
    normalizedReady = true
  } catch (error) {
    if (error?.code === 'DEPENDENCY') throw error
  }
  if (!normalizedReady) {
    await normalizeQuotesVideoInput(inputPath, normalizedPath, durationSeconds, shouldLoop, false, { ...profile, fps: QUOTES_VIDEO_FPS })
  }
  const overlay = await renderQuotesOverlayFrames({
    width: profile.width,
    height: profile.height,
    heading,
    quote,
    dateParts,
    credit: QUOTES_VIDEO_CREDIT,
    durationSeconds,
    outputDir: overlayDir,
  })
  await compositeQuotesVideo({
    inputPath: normalizedPath,
    overlayDir,
    outputPath,
    width: profile.width,
    height: profile.height,
    overlayFps: overlay.fps,
    settleSeconds: overlay.settleSeconds,
    durationSeconds,
    profile: { ...profile, fps: QUOTES_VIDEO_FPS, level: profile.width >= 1280 ? '3.1' : '3.1' },
  })
  const stat = await validateQuotesVideo(outputPath, profile.width, profile.height, durationSeconds)
  const buffer = await fs.readFile(outputPath)
  if (!buffer.length || buffer.length !== stat.size) throw Object.assign(new Error('Video hasil tidak terbaca utuh.'), { code: 'OUTPUT' })
  return { buffer, size: stat.size, durationMs: Math.round(stat.duration * 1000), width: stat.width, height: stat.height, profile: profile.quality }
}

export async function renderQuotesVideo(heading, quote, inputVideoBuffer, inputVideoMime = 'video/mp4') {
  const cleanHeading = quotesNormalizeText(heading)
  const cleanQuote = quotesNormalizeText(quote)
  if (!cleanHeading) throw Object.assign(new Error('Heading kosong.'), { code: 'INPUT_HEADING', publicMessage: 'Heading tidak boleh kosong.\nGunakan heading seperti *GOOD VIBES*.' })
  if (!cleanQuote) throw Object.assign(new Error('Quote kosong.'), { code: 'INPUT_QUOTE', publicMessage: 'Quote tidak boleh kosong.\nSilakan masukkan kata-kata yang ingin digunakan.' })
  if (cleanHeading.length > QUOTES_VIDEO_MAX_HEADING_LENGTH) throw Object.assign(new Error('Heading terlalu panjang.'), { code: 'INPUT_HEADING_LENGTH', publicMessage: `Heading terlalu panjang.\nMaksimal ${QUOTES_VIDEO_MAX_HEADING_LENGTH} karakter.` })
  if (cleanQuote.length > QUOTES_VIDEO_MAX_QUOTE_LENGTH) throw Object.assign(new Error('Quote terlalu panjang.'), { code: 'INPUT_QUOTE_LENGTH', publicMessage: `Quote terlalu panjang.\nMaksimal ${QUOTES_VIDEO_MAX_QUOTE_LENGTH} karakter.` })
  if (!Buffer.isBuffer(inputVideoBuffer) || !inputVideoBuffer.length) throw Object.assign(new Error('Video sumber kosong.'), { code: 'MEDIA', publicMessage: 'Video tidak dapat dibaca. Pastikan file video valid dan coba lagi.' })
  if (inputVideoBuffer.length > QUOTES_VIDEO_MAX_INPUT) throw Object.assign(new Error('Video sumber terlalu besar.'), { code: 'SIZE', publicMessage: 'Ukuran video terlalu besar. Gunakan video maksimal 50 MB.' })

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'usanagi-quotesvideo-'))
  const inputExt = extensionFromMime(inputVideoMime)
  const inputPath = path.join(dir, `source.${inputExt}`)
  await fs.writeFile(inputPath, inputVideoBuffer)

  try {
    const source = await probeQuotesVideo(inputPath)
    const durationSeconds = clamp(Math.max(source.duration, QUOTES_VIDEO_MIN_SECONDS), QUOTES_VIDEO_MIN_SECONDS, QUOTES_VIDEO_MAX_SECONDS)
    const dateParts = quotesFormatDate()
    const profiles = quotesVideoProfiles(source)
    let lastError = null
    for (let index = 0; index < profiles.length; index++) {
      const profile = profiles[index]
      try {
        const result = await renderQuotesVideoAttempt({ inputPath, source, profile, dir, heading: cleanHeading, quote: cleanQuote, dateParts, durationSeconds })
        return {
          ...result,
          date: `${dateParts.day} ${dateParts.month} ${dateParts.year}`,
          credit: QUOTES_VIDEO_CREDIT,
          quality: profile.quality,
        }
      } catch (error) {
        lastError = error
        await fs.rm(path.join(dir, `normalized-${profile.quality}.mp4`), { force: true }).catch(() => {})
        await fs.rm(path.join(dir, `overlay-${profile.quality}`), { recursive: true, force: true }).catch(() => {})
        await fs.rm(path.join(dir, `result-${profile.quality}.mp4`), { force: true }).catch(() => {})
        if (index + 1 < profiles.length) continue
      }
    }

    const fallbackProfile = profiles.at(-1)
    const finalOverlayDir = path.join(dir, `overlay-${fallbackProfile.quality}`)
    const fallbackNormalized = path.join(dir, `fallback-normalized-${fallbackProfile.quality}.mp4`)
    const fallbackOutput = path.join(dir, `fallback-output-${fallbackProfile.quality}.mp4`)
    try {
      await normalizeQuotesVideoInput(inputPath, fallbackNormalized, durationSeconds, durationSeconds > source.duration + 0.05, false, { ...fallbackProfile, fps: QUOTES_VIDEO_FPS })
      const overlay = await renderQuotesOverlayFrames({
        width: fallbackProfile.width,
        height: fallbackProfile.height,
        heading: cleanHeading,
        quote: cleanQuote,
        dateParts,
        credit: QUOTES_VIDEO_CREDIT,
        durationSeconds,
        outputDir: finalOverlayDir,
      })
      await compositeQuotesVideoStatic({
        inputPath: fallbackNormalized,
        overlayFramePath: overlay.finalFramePath,
        outputPath: fallbackOutput,
        durationSeconds,
        profile: { ...fallbackProfile, fps: QUOTES_VIDEO_FPS },
      })
      const stat = await validateQuotesVideo(fallbackOutput, fallbackProfile.width, fallbackProfile.height, durationSeconds)
      const buffer = await fs.readFile(fallbackOutput)
      return {
        buffer,
        size: stat.size,
        durationMs: Math.round(stat.duration * 1000),
        width: stat.width,
        height: stat.height,
        date: `${dateParts.day} ${dateParts.month} ${dateParts.year}`,
        credit: QUOTES_VIDEO_CREDIT,
        quality: 'fallback-static',
      }
    } catch (fallbackError) {
      lastError = fallbackError?.code ? fallbackError : lastError
    }

    throw (lastError || Object.assign(new Error('QuotesVideo gagal.'), { code: 'FFMPEG' }))
  } catch (error) {
    const code = error?.code
    if (!error?.publicMessage) {
      if (code === 'INPUT_HEADING') error.publicMessage = 'Heading tidak boleh kosong.\nGunakan heading seperti *GOOD VIBES*.'
      else if (code === 'INPUT_QUOTE') error.publicMessage = 'Quote tidak boleh kosong.\nSilakan masukkan kata-kata yang ingin digunakan.'
      else if (code === 'INPUT_HEADING_LENGTH') error.publicMessage = `Heading terlalu panjang.\nMaksimal ${QUOTES_VIDEO_MAX_HEADING_LENGTH} karakter.`
      else if (code === 'INPUT_QUOTE_LENGTH') error.publicMessage = `Quote terlalu panjang.\nMaksimal ${QUOTES_VIDEO_MAX_QUOTE_LENGTH} karakter.`
      else if (code === 'MEDIA') error.publicMessage = 'Video sumber tidak valid atau tidak dapat dibaca. Kirim video lain dan coba lagi.'
      else if (code === 'SIZE') error.publicMessage = 'Ukuran video terlalu besar. Gunakan video maksimal 50 MB.'
      else if (code === 'CANVAS') error.publicMessage = 'Tampilan quotes gagal dirender. Silakan coba lagi dengan video yang lebih singkat.'
      else if (code === 'DEPENDENCY') error.publicMessage = 'Komponen video Usanagi belum tersedia dengan benar di server.'
      else if (code === 'TIMEOUT') error.publicMessage = 'Proses video terlalu lama. Gunakan video yang lebih singkat.'
      else if (code === 'VALIDATE' || code === 'OUTPUT') error.publicMessage = 'Video selesai diproses tetapi hasilnya tidak lolos pemeriksaan. Silakan coba lagi.'
      else if (code === 'BUSY') error.publicMessage = 'Proses video quotes sebelumnya masih berjalan. Tunggu sampai selesai lalu coba lagi.'
      else if (code === 'FFMPEG') error.publicMessage = 'Video quotes gagal dirender. Silakan coba video lain.'
      else error.publicMessage = 'Video quotes belum berhasil dibuat. Silakan coba lagi.'
    }
    if (error?.detail) console.error(`[QuotesVideo] ${code || 'ERROR'}: ${error.detail}`)
    else if (error?.message) console.error(`[QuotesVideo] ${code || 'ERROR'}: ${error.message}`)
    throw error
  } finally {
    await fs.rm(dir, { recursive: true, force: true }).catch(() => {})
  }
}
