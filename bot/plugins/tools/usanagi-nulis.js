
import * as canvasLib from '@napi-rs/canvas'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile } from 'node:fs/promises'
import { react } from '../../lib/awang-media.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PAPER_PATH = path.join(__dirname, '../../assets/image/usanagi-kertas.jpg')
const FONT_PATH = path.join(__dirname, '../../assets/fonts/usanagi-nulis.ttf')
let fontRegistered = false

function wrapText(ctx, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines = []
  let line = ''

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (ctx.measureText(candidate).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }

  if (line) lines.push(line)
  return lines
}

function formatDateParts(timeZone) {
  const date = new Date()
  const weekday = new Intl.DateTimeFormat('id-ID', { weekday: 'long', timeZone }).format(date)
  const formatted = new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone }).format(date)
  return { weekday, date: formatted.replaceAll('.', '/') }
}

const handler = async (m, { rawConn, settings, usedPrefix }) => {
  const text = String(m.args?.join(' ') || '').trim()
  if (!text) {
    await m.reply(`💬 Ketik *${usedPrefix}nulis* lalu masukkan teks.\n\nContoh: *${usedPrefix}nulis Aku cinta kamu*`)
    return
  }

  if (text.length > 500) {
    await m.reply('❌ Teks terlalu panjang. Maksimal *500 karakter*.')
    return
  }

  await react(rawConn, m, '🕕')
  await m.reply('🕕 Menyiapkan tulisan tangan...')

  try {
    const { createCanvas, loadImage, GlobalFonts } = canvasLib
    const [paperBuffer, fontBuffer] = await Promise.all([readFile(PAPER_PATH), readFile(FONT_PATH)])

    if (!fontRegistered) {
      GlobalFonts.register(fontBuffer, 'Zahraaa')
      fontRegistered = true
    }

    const paper = await loadImage(paperBuffer)
    const canvas = createCanvas(paper.width, paper.height)
    const ctx = canvas.getContext('2d')
    ctx.drawImage(paper, 0, 0)

    const { weekday, date } = formatDateParts(settings.timezone || 'Asia/Jakarta')
    ctx.fillStyle = '#1a1a2e'
    ctx.font = '20px Zahraaa, Arial'
    ctx.fillText(weekday, 806, 78)
    ctx.font = '18px Zahraaa, Arial'
    ctx.fillText(date, 806, 102)
    ctx.font = '20px Zahraaa, Arial'

    const lines = wrapText(ctx, text, 600)
    const startX = 344
    const startY = 142
    const lineHeight = 28
    const maxLines = Math.floor((paper.height - startY - 30) / lineHeight)

    if (lines.length > maxLines) {
      throw new Error('Teks terlalu panjang untuk area kertas')
    }

    lines.forEach((line, index) => ctx.fillText(line, startX, startY + index * lineHeight))
    const output = canvas.toBuffer('image/jpeg')

    await rawConn.sendMessage(m.chat, {
      image: output,
      caption: '✅ *NULIS SELESAI*',
    }, { quoted: m.raw })
    await react(rawConn, m, '✅')
    return { status: true }
  } catch (error) {
    await react(rawConn, m, '❌')
    throw new Error(`Nulis gagal: ${error?.message || 'proses tidak tersedia'}`)
  }
}

handler.command = /^(nulis|tulis|write)$/i
handler.help = ['nulis', 'tulis', 'write']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Mengubah teks menjadi tulisan tangan pada template kertas.'
handler.usage = '.nulis <teks>'
handler.example = '.nulis Aku cinta kamu selamanya'
handler.limit = false
handler.premiumOnly = false

export default handler
