import { Canvas, loadImage, GlobalFonts } from '@napi-rs/canvas'

const WIDTH = 1280
const HEIGHT = 720

const BG_URL =
  'https://raw.githubusercontent.com/hamm-r/uploader/main/1781134098395-894.jpg'

const DEFAULT_PP =
  'https://i.ibb.co/4pDNDk1/avatar.png'

const FONT_BLACK = './src/font/Roboto-Black.ttf'
const FONT_BOLD = './src/font/Roboto-Bold.ttf'

try {
  GlobalFonts.registerFromPath(FONT_BLACK, 'RobotoBlack')
  GlobalFonts.registerFromPath(FONT_BOLD, 'RobotoBold')
} catch {}

const COLOR = {
  welcome: '#ffd6f5',
  goodbye: '#b9d7ff',
  white: '#ffffff'
}

async function loadImg(url) {
  try {
    return await loadImage(url || DEFAULT_PP)
  } catch {
    return await loadImage(DEFAULT_PP)
  }
}

function cleanText(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/[^\x20-\x7EÀ-ÿ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function setFont(ctx, size, font = 'RobotoBold') {
  ctx.font = `${size}px ${font}, Arial`
}

function fitText(ctx, text, maxWidth, startSize, minSize = 18, font = 'RobotoBold') {
  let size = startSize

  while (size > minSize) {
    setFont(ctx, size, font)
    if (ctx.measureText(text).width <= maxWidth) break
    size -= 2
  }

  return size
}

function centerText(ctx, text, y, size, color, font = 'RobotoBold') {
  setFont(ctx, size, font)
  ctx.fillStyle = color
  ctx.fillText(text, WIDTH / 2, y)
}

function circleImage(ctx, img, x, y, size) {
  const radius = size / 2

  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(img, x - radius, y - radius, size, size)
  ctx.restore()
}

export async function createWelcomeCard({
  avatar,
  username,
  groupName,
  memberCount,
  type = 'welcome'
}) {
  const canvas = new Canvas(WIDTH, HEIGHT)
  const ctx = canvas.getContext('2d')

  const isWelcome = type === 'welcome'
  const accent = isWelcome ? COLOR.welcome : COLOR.goodbye

  username = cleanText(username) || 'Unknown'
  groupName = cleanText(groupName) || 'Group'

  const bg = await loadImg(BG_URL)
  const pp = await loadImg(avatar)

  ctx.drawImage(bg, 0, 0, WIDTH, HEIGHT)

  ctx.fillStyle = 'rgba(0,0,0,0.52)'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  ctx.textAlign = 'center'

  circleImage(ctx, pp, 640, 205, 220)

  ctx.beginPath()
  ctx.arc(640, 205, 118, 0, Math.PI * 2)
  ctx.strokeStyle = accent
  ctx.lineWidth = 8
  ctx.stroke()

  centerText(
    ctx,
    isWelcome ? 'WELCOME' : 'GOODBYE',
    385,
    72,
    COLOR.white,
    'RobotoBlack'
  )

  const userSize = fitText(ctx, username, 820, 46, 24, 'RobotoBold')

  centerText(
    ctx,
    username,
    450,
    userSize,
    accent,
    'RobotoBold'
  )

  const groupSize = fitText(ctx, groupName, 900, 34, 20, 'RobotoBlack')

  ctx.shadowColor = 'rgba(0,0,0,0.45)'
  ctx.shadowBlur = 8

  centerText(
    ctx,
    groupName,
    500,
    groupSize,
    COLOR.white,
    'RobotoBlack'
  )

  ctx.shadowBlur = 0

  centerText(
    ctx,
    isWelcome
      ? `Member #${memberCount}`
      : `Remaining Members: ${memberCount}`,
    555,
    30,
    COLOR.white,
    'RobotoBold'
  )

  centerText(
    ctx,
    isWelcome ? 'Enjoy Your Stay' : 'See You Again',
    600,
    24,
    COLOR.white,
    'RobotoBold'
  )

  centerText(
    ctx,
    'Usanagi Umi AI',
    640,
    20,
    accent,
    'RobotoBold'
  )

  return canvas.toBuffer('image/png')
}