import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import { writeFile, mkdir, unlink } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import https from 'node:https'
import http from 'node:http'

const __dirname = dirname(fileURLToPath(import.meta.url))

const ASSETS_DIR = join(__dirname, '../../assets/ttqc')
const FONTS_DIR = join(ASSETS_DIR, 'fonts')
const TEMPLATE_PATH = join(ASSETS_DIR, 'template.png')

const TEMPLATE_URL =
  'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/ttqc/qyzwa.png'

const FONT_ASSETS = [
  {
    file: 'PlusJakartaSans-Regular.ttf',
    url: 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/ttqc/PlusJakartaSans-Regular.ttf',
    family: 'Plus Jakarta Sans'
  },
  {
    file: 'PlusJakartaSans-Medium.ttf',
    url: 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/ttqc/PlusJakartaSans-Medium.ttf',
    family: 'Plus Jakarta Sans'
  },
  {
    file: 'PlusJakartaSans-Bold.ttf',
    url: 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/ttqc/PlusJakartaSans-Bold.ttf',
    family: 'Plus Jakarta Sans'
  },
  {
    file: 'fa-solid-900.ttf',
    url: 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/ttqc/fa-solid-900.ttf',
    family: 'Font Awesome 6 Free'
  },
  {
    file: 'NotoColorEmoji.ttf',
    url: 'https://github.com/googlefonts/noto-emoji/raw/main/fonts/NotoColorEmoji.ttf',
    family: 'Noto Color Emoji'
  }
]

const MENU_ICONS = [
  { unicode: '\uf3e5', text: 'Balas', color: '#000000' },
  { unicode: '\uf064', text: 'Teruskan', color: '#000000' },
  { unicode: '\uf0c5', text: 'Salin', color: '#000000' },
  { unicode: '\uf1ab', text: 'Terjemahkan', color: '#000000' },
  { unicode: '\uf2ed', text: 'Hapus untuk saya', color: '#000000' },
  { unicode: '\uf024', text: 'Laporkan', color: '#ea4335' }
]

const config = {
  topPPX: 183,
  topPPY: 83,
  topPPRadius: 42,

  topNameX: 250,
  topNameY: 82,
  topNameSize: 34,

  chatPPX: 75,
  chatPPRadius: 38,

  textX: 175,
  textY: 962,

  bubbleWidth: 520,
  textSize: 30,

  bubbleBgColor: '#ffffff',
  textColor: '#161823'
}

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http

    client
      .get(
        url,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        },
        res => {
          if (res.statusCode === 301 || res.statusCode === 302) {
            return fetchBuffer(res.headers.location)
              .then(resolve)
              .catch(reject)
          }

          if (res.statusCode !== 200) {
            return reject(
              new Error(`HTTP ${res.statusCode} -> ${url}`)
            )
          }

          const chunks = []

          res.on('data', d => chunks.push(d))
          res.on('end', () => resolve(Buffer.concat(chunks)))
          res.on('error', reject)
        }
      )
      .on('error', reject)
  })
}

async function ensureAssets() {
  await mkdir(FONTS_DIR, { recursive: true })

  if (!existsSync(TEMPLATE_PATH)) {
    await writeFile(
      TEMPLATE_PATH,
      await fetchBuffer(TEMPLATE_URL)
    )
  }

  for (const font of FONT_ASSETS) {
    const dest = join(FONTS_DIR, font.file)

    if (!existsSync(dest)) {
      await writeFile(dest, await fetchBuffer(font.url))
    }

    GlobalFonts.registerFromPath(dest, font.family)
  }
}

async function loadImageSmart(src) {
  if (/^https?:\/\//.test(src)) {
    return loadImage(await fetchBuffer(src))
  }

  return loadImage(src)
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(/(\s+)/)
  const lines = []
  let current = ''

  for (const word of words) {
    if (!word) continue

    const test = current + word

    if (ctx.measureText(test).width > maxWidth) {
      if (current) {
        lines.push(current.trimEnd())
        current = word.trimStart()
      } else {
        lines.push(test)
        current = ''
      }
    } else {
      current = test
    }
  }

  if (current.trim()) lines.push(current.trimEnd())

  return lines
}

function drawRoundedRect(
  ctx,
  x,
  y,
  w,
  h,
  r,
  fill,
  stroke = null,
  shadow = false
) {
  ctx.save()

  if (shadow) {
    ctx.shadowColor = 'rgba(0,0,0,0.05)'
    ctx.shadowBlur = 40
    ctx.shadowOffsetY = 12
  }

  ctx.fillStyle = fill

  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()

  ctx.fill()

  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = 1
    ctx.stroke()
  }

  ctx.restore()
}

function drawCircleImage(ctx, img, cx, cy, r) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()

  ctx.drawImage(
    img,
    cx - r,
    cy - r,
    r * 2,
    r * 2
  )

  ctx.restore()
}

async function render(username, chatText, avatarSrc) {
  await ensureAssets()

  const template = await loadImage(TEMPLATE_PATH)
  const avatar = await loadImageSmart(avatarSrc)

  const canvas = createCanvas(2160, 4560)
  const ctx = canvas.getContext('2d')

  ctx.scale(2, 2)

  ctx.drawImage(template, 0, 0, 1080, 2280)

  drawCircleImage(
    ctx,
    avatar,
    config.topPPX,
    config.topPPY,
    config.topPPRadius
  )

  ctx.font = `bold ${config.topNameSize}px 'Plus Jakarta Sans'`
  ctx.fillStyle = '#000'
  ctx.fillText(
    username,
    config.topNameX,
    config.topNameY
  )

  ctx.font = `500 ${config.textSize}px 'Plus Jakarta Sans'`

  const lines = wrapText(
    ctx,
    chatText,
    config.bubbleWidth - 52
  )

  const lineH = config.textSize * 1.45

  let maxW = 0

  for (const line of lines) {
    maxW = Math.max(
      maxW,
      ctx.measureText(line).width
    )
  }

  const bubbleW = maxW + 60
  const bubbleH = lines.length * lineH + 48
  const bubbleX = config.textX - 30
  const bubbleY = config.textY - 24

  drawCircleImage(
    ctx,
    avatar,
    config.chatPPX,
    bubbleY + bubbleH / 2,
    config.chatPPRadius
  )

  drawRoundedRect(
    ctx,
    bubbleX,
    bubbleY,
    bubbleW,
    bubbleH,
    35,
    '#fff'
  )

  ctx.fillStyle = config.textColor

  lines.forEach((line, i) => {
    ctx.fillText(
      line,
      config.textX,
      config.textY +
        i * lineH +
        config.textSize / 2
    )
  })

  const menuX = 90
  const menuY = bubbleY + bubbleH + 28

  drawRoundedRect(
    ctx,
    menuX,
    menuY,
    565,
    580,
    40,
    '#fff',
    'rgba(0,0,0,0.02)',
    true
  )

  MENU_ICONS.forEach((item, i) => {
    const cy = menuY + 25 + i * 90 + 45

    ctx.font = `900 34px 'Font Awesome 6 Free'`
    ctx.fillStyle = item.color
    ctx.textAlign = 'center'
    ctx.fillText(item.unicode, menuX + 60, cy)

    ctx.font = `500 34px 'Plus Jakarta Sans'`
    ctx.textAlign = 'left'
    ctx.fillText(item.text, menuX + 130, cy)
  })

  return canvas.encode('png')
}

let handler = async (m, { conn, text }) => {
  if (!text)
    throw `.ttqc Nama|Pesan\n\nContoh:\n.ttqc Ditzzx|Just friend kok cemburu 😂`

  const [name, ...msg] = text.split('|')

  const chat = msg.join('|').trim()

  const avatar =
    await conn.profilePictureUrl(
      m.sender,
      'image'
    ).catch(
      () =>
        'https://i.ibb.co/4pDNDk1/avatar.png'
    )

  const buffer = await render(
    name.trim(),
    chat,
    avatar
  )

  const file = join(
    __dirname,
    `ttqc-${Date.now()}.png`
  )

  await writeFile(file, buffer)

  await conn.sendFile(
    m.chat,
    file,
    'ttqc.png',
    '',
    m
  )

  await unlink(file).catch(() => {})
}

handler.help = ['ttqc']
handler.tags = ['maker']
handler.command = /^ttqc$/i

export default handler