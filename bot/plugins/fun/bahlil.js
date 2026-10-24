/**
 * Maker Brat Bahlil
 * Type   : Plugins ESM
 */

import { createCanvas, loadImage } from '@napi-rs/canvas'
import fetch from 'node-fetch'

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
    const imageUrl = 'https://i.ibb.co/JwT2QFvY/elaina-md.jpg'

    const res = await fetch(imageUrl)
    if (!res.ok) throw new Error(`Gagal fetch gambar: ${res.status}`)

    const buffer = Buffer.from(await res.arrayBuffer())
    const img = await loadImage(buffer)

    const canvas = createCanvas(img.width, img.height)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(img, 0, 0, img.width, img.height)

    const boardX = img.width * 0.18
    const boardY = img.height * 0.55
    const boardW = img.width * 0.64
    const boardH = img.height * 0.30

    const padding = boardW * 0.08
    const textAreaW = boardW - padding * 2

    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#000'

    function wrapLines(ctx, text, maxWidth) {
      const words = String(text).trim().split(/\s+/)
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

    let fontSize = 80
    let lines = []

    while (fontSize > 30) {
      ctx.font = `500 ${fontSize}px Arial`
      lines = wrapLines(ctx, text, textAreaW)

      const lineHeight = fontSize * 1.05
      if (lines.length <= 3 && lines.length * lineHeight <= boardH) break

      fontSize--
    }

    ctx.font = `500 ${fontSize}px Arial`

    ctx.shadowColor = 'rgba(0,0,0,.12)'
    ctx.shadowBlur = 2
    ctx.shadowOffsetX = 1
    ctx.shadowOffsetY = 1

    const lineHeight = fontSize * 1.05
    const showLines = lines.slice(0, 3)

    const startY =
      boardY +
      boardH / 2 -
      (showLines.length * lineHeight) / 2 +
      lineHeight * 0.38

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
      { text: '❌ Gagal membuat stiker Brat Bahlil.' },
      { quoted: global.fkontak || m }
    )
  }
}

handler.help = ['bahlil', 'bratbahlil']
handler.tags = ['maker']
handler.command = /^(bahlil|bratbahlil)$/i
handler.limit = true
handler.register = true

export default handler