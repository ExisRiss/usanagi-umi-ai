/**
 * Maker Brat AlzRiss
 * Type   : Plugins ESM
  * By AlzRiss - Usanagi Umi AI
 */

import { createCanvas, loadImage } from '@napi-rs/canvas'
import fetch from 'node-fetch'

const TEMPLATE_URL =
  'https://raw.githubusercontent.com/Crashmant/rizky/main/uploads/1780884914544-681.jpeg'

let handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) {
    return conn.sendMessage(
      m.chat,
      { text: `✨ Contoh:\n${usedPrefix + command} halo member` },
      { quoted: global.fkontak || m }
    )
  }

  await m.react('✨')

  try {
    const res = await fetch(TEMPLATE_URL)
    if (!res.ok) throw new Error(`Gagal fetch template: ${res.status}`)

    const buffer = Buffer.from(await res.arrayBuffer())
    const img = await loadImage(buffer)

    const canvas = createCanvas(img.width, img.height)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(img, 0, 0, img.width, img.height)

    const boardX = img.width * 0.16
    const boardY = img.height * 0.54
    const boardW = img.width * 0.68
    const boardH = img.height * 0.30

    const padding = boardW * 0.08
    const textAreaW = boardW - padding * 2

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#111111'

    function wrapLines(ctx, input, maxWidth) {
      const words = String(input).trim().split(/\s+/)
      const lines = []
      let line = ''

      for (const word of words) {
        const test = line ? `${line} ${word}` : word

        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line)
          line = word
        } else {
          line = test
        }
      }

      if (line) lines.push(line)
      return lines
    }

    let fontSize = 78
    let lines = []

    while (fontSize > 28) {
      ctx.font = `600 ${fontSize}px Arial`
      lines = wrapLines(ctx, text, textAreaW)

      const lineHeight = fontSize * 1.08

      if (lines.length <= 3 && lines.length * lineHeight <= boardH)
        break

      fontSize--
    }

    const showLines = lines.slice(0, 3)
    const lineHeight = fontSize * 1.08

    ctx.font = `600 ${fontSize}px Arial`

    ctx.shadowColor = 'rgba(255,255,255,.45)'
    ctx.shadowBlur = 2
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1

    const startY =
      boardY +
      boardH / 2 -
      (showLines.length * lineHeight) / 2 +
      lineHeight * 0.42

    showLines.forEach((line, i) => {
      ctx.fillText(
        line,
        boardX + boardW / 2,
        startY + i * lineHeight
      )
    })

    const pngBuffer = canvas.toBuffer('image/png')

    await conn.sendSticker(
      m.chat,
      pngBuffer,
      global.fkontak || m,
      {
        packname: global.stickpack || global.namebot,
        packpublish: global.stickauth || global.author
      }
    )

    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')

    conn.sendMessage(
      m.chat,
      { text: '❌ Gagal membuat stiker Brat AlzRiss.' },
      { quoted: global.fkontak || m }
    )
  }
}

handler.help = ['bratanya', 'usanagi']
handler.tags = ['maker']
handler.command = /^(bratanya|usanagi)$/i
handler.limit = true
handler.register = true

export default handler