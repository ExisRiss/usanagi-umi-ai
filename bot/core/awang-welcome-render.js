/* By AlzRiss - Usanagi Umi AI */

import { createCanvas, loadImage } from '@napi-rs/canvas'

function safe(value, fallback = '-') {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim()
  return text || fallback
}

function initials(name) {
  const parts = safe(name, 'Member').split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map((word) => word[0]).join('').toUpperCase() || 'M'
}

async function fetchBuffer(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return Buffer.from(await response.arrayBuffer())
  } finally {
    clearTimeout(timer)
  }
}

async function getAvatar(conn, jid) {
  if (!conn?.profilePictureUrl || !jid) return null
  try {
    const url = await conn.profilePictureUrl(jid, 'image')
    return url ? await fetchBuffer(url) : null
  } catch {
    return null
  }
}

function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

function fitText(ctx, text, maxWidth, maxSize, minSize = 16, weight = 700) {
  let size = maxSize
  while (size > minSize) {
    ctx.font = `${weight} ${size}px Arial`
    if (ctx.measureText(text).width <= maxWidth) return size
    size -= 1
  }
  return minSize
}

function drawText(ctx, text, x, y, options = {}) {
  const { size = 18, weight = 400, color = '#fff', align = 'left' } = options
  ctx.font = `${weight} ${size}px Arial`
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(text, x, y)
  ctx.textAlign = 'left'
}

function drawLabel(ctx, text, x, y, accent) {
  drawText(ctx, text.toUpperCase(), x, y, { size: 13, weight: 700, color: accent })
}

async function drawAvatar(ctx, buffer, name, x, y, size, accent) {
  let avatar = null
  if (buffer) {
    try { avatar = await loadImage(buffer) } catch { avatar = null }
  }

  ctx.save()
  ctx.beginPath()
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
  ctx.clip()

  if (avatar) {
    ctx.drawImage(avatar, x, y, size, size)
  } else {
    const fill = ctx.createLinearGradient(x, y, x + size, y + size)
    fill.addColorStop(0, 'rgba(255,255,255,0.13)')
    fill.addColorStop(1, 'rgba(255,255,255,0.035)')
    ctx.fillStyle = fill
    ctx.fillRect(x, y, size, size)
    drawText(ctx, initials(name), x + size / 2, y + size / 2 + 19, { size: 52, weight: 700, color: accent, align: 'center' })
  }
  ctx.restore()

  ctx.beginPath()
  ctx.arc(x + size / 2, y + size / 2, size / 2 + 5, 0, Math.PI * 2)
  ctx.strokeStyle = accent
  ctx.globalAlpha = 0.7
  ctx.lineWidth = 3
  ctx.stroke()
  ctx.globalAlpha = 1
}

function drawMeta(ctx, label, value, x, y, width, accent) {
  roundedRect(ctx, x, y, width, 72, 14)
  ctx.fillStyle = 'rgba(255,255,255,0.035)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.075)'
  ctx.lineWidth = 1
  ctx.stroke()
  drawLabel(ctx, label, x + 16, y + 22, accent)
  drawText(ctx, value, x + 16, y + 50, {
    size: fitText(ctx, value, width - 32, 18, 12, 600),
    weight: 600,
    color: '#E8EDF1',
  })
}

export async function renderMemberCard({ conn, memberJid, memberNumber, groupName, action = 'welcome', memberName }) {
  const isWelcome = action === 'welcome'
  const width = 1200
  const height = 675
  const accent = isWelcome ? '#A8E6CF' : '#D7B7A6'
  const accentDim = isWelcome ? 'rgba(168,230,207,0.14)' : 'rgba(215,183,166,0.13)'
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  const bg = ctx.createLinearGradient(0, 0, width, height)
  bg.addColorStop(0, '#080C11')
  bg.addColorStop(0.52, '#0D131A')
  bg.addColorStop(1, '#121820')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  const glow = ctx.createRadialGradient(1040, 74, 10, 1040, 74, 310)
  glow.addColorStop(0, accentDim)
  glow.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = glow
  ctx.fillRect(700, 0, 500, 360)

  ctx.strokeStyle = 'rgba(255,255,255,0.022)'
  ctx.lineWidth = 1
  for (let x = 80; x < width; x += 80) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
  }

  roundedRect(ctx, 34, 34, width - 68, height - 68, 28)
  ctx.fillStyle = 'rgba(7,11,16,0.76)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.10)'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.fillStyle = accent
  roundedRect(ctx, 72, 74, 42, 4, 2)
  ctx.fill()
  drawLabel(ctx, isWelcome ? 'NEW MEMBER' : 'MEMBER UPDATE', 130, 81, accent)
  drawText(ctx, isWelcome ? 'WELCOME' : 'GOODBYE', 1128, 81, { size: 13, weight: 700, color: 'rgba(255,255,255,0.45)', align: 'right' })

  const group = safe(groupName, 'Group')
  const name = safe(memberName, 'Member')
  const rawNumber = safe(memberNumber, '')
  const number = /^\d{7,15}$/.test(rawNumber) ? rawNumber : ''
  const numberDisplay = number ? `+${number}` : 'Tidak tersedia'

  drawText(ctx, group, 72, 146, {
    size: fitText(ctx, group, 760, 46, 25, 700),
    weight: 700,
    color: '#F4F7F9',
  })
  drawText(ctx, isWelcome ? 'Seseorang baru saja bergabung.' : 'Seseorang baru saja meninggalkan group.', 72, 177, {
    size: 18,
    weight: 400,
    color: 'rgba(244,247,249,0.48)',
  })

  ctx.strokeStyle = 'rgba(255,255,255,0.08)'
  ctx.beginPath(); ctx.moveTo(72, 204); ctx.lineTo(1128, 204); ctx.stroke()

  const avatarSize = 164
  await drawAvatar(ctx, await getAvatar(conn, memberJid), name, 72, 236, avatarSize, accent)

  drawLabel(ctx, 'MEMBER', 278, 264, accent)
  drawText(ctx, name, 278, 310, {
    size: fitText(ctx, name, 820, 40, 21, 700),
    weight: 700,
    color: '#FFFFFF',
  })
  drawText(ctx, numberDisplay, 278, 343, { size: 20, weight: 400, color: 'rgba(255,255,255,0.54)' })

  const metaY = 382
  const metaW = 330
  drawMeta(ctx, 'STATUS', isWelcome ? 'WELCOME' : 'GOODBYE', 278, metaY, metaW, accent)
  drawMeta(ctx, 'GROUP', group, 624, metaY, metaW, accent)
  drawMeta(ctx, 'NUMBER', numberDisplay, 970, metaY, 158, accent)

  const panelY = 478
  roundedRect(ctx, 72, panelY, 1056, 92, 16)
  ctx.fillStyle = 'rgba(255,255,255,0.028)'
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'
  ctx.stroke()

  drawLabel(ctx, 'USANAGI UMI AI  /  GROUP ASSISTANT', 96, panelY + 28, accent)
  const message = isWelcome
    ? 'Silakan perkenalkan diri, baca peraturan, lalu nikmati group.'
    : 'Terima kasih telah menjadi bagian dari perjalanan group ini.'
  drawText(ctx, message, 96, panelY + 61, { size: 19, weight: 400, color: 'rgba(255,255,255,0.72)' })

  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.beginPath(); ctx.moveTo(72, 598); ctx.lineTo(1128, 598); ctx.stroke()
  drawText(ctx, 'Usanagi Umi AI', 72, 624, { size: 14, weight: 600, color: 'rgba(255,255,255,0.34)' })
  drawText(ctx, isWelcome ? 'WELCOME CARD' : 'GOODBYE CARD', 1128, 624, { size: 14, weight: 700, color: accent, align: 'right' })

  return canvas.toBuffer('image/png')
}

export default { renderMemberCard }
