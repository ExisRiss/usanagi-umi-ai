import fetch from 'node-fetch'
import path from 'path'
import mime from 'mime-types'
import { format } from 'util'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} https://example.com/file.pdf`)
  }

  try {
    let url = text.trim()

    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url
    }

    let res = await fetch(url, {
      redirect: 'follow',
      follow: 20,
      compress: true,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })

    if (!res.ok) {
      throw `${res.status} ${res.statusText}`
    }

    let contentType = res.headers.get('content-type')?.split(';')[0].trim() || 'application/octet-stream'
    let contentLength = Number(res.headers.get('content-length')) || 0

    if (contentLength > 500 * 1024 * 1024) {
      throw 'File terlalu besar (Max 500 MB)'
    }

    let finalUrl = res.url
    let disposition = res.headers.get('content-disposition')

    let filename = 'file'

    if (disposition && /filename=/i.test(disposition)) {
      filename = disposition
        .split('filename=')[1]
        .replace(/UTF-8''/i, '')
        .replace(/["']/g, '')
        .trim()
    } else {
      filename = decodeURIComponent(path.basename(new URL(finalUrl).pathname)) || 'file'
    }

    let ext = mime.extension(contentType)
    if (!path.extname(filename) && ext) {
      filename += '.' + ext
    }

    // TEXT
    if (/^text\//i.test(contentType)) {
      let txt = await res.text()

      await m.reply(txt.slice(0, 65536))

      return conn.sendFile(
        m.chat,
        Buffer.from(txt),
        filename,
        null,
        m
      )
    }

    // JSON
    if (/application\/json/i.test(contentType)) {
      let json = await res.json()
      let txt = format(JSON.stringify(json, null, 2))

      await m.reply(txt.slice(0, 65536))

      return conn.sendFile(
        m.chat,
        Buffer.from(txt),
        filename,
        null,
        m
      )
    }

    let buffer = Buffer.from(await res.arrayBuffer())

    let caption = `乂 *FETCH URL*

📦 *Name:* ${filename}
📄 *Type:* ${contentType}
📏 *Size:* ${(buffer.length / 1024 / 1024).toFixed(2)} MB`

    // IMAGE
    if (/^image\//i.test(contentType) && contentType !== 'image/webp') {
      return conn.sendMessage(
        m.chat,
        {
          image: buffer,
          mimetype: contentType,
          caption
        },
        { quoted: m }
      )
    }

    // STICKER
    if (contentType === 'image/webp') {
      return conn.sendMessage(
        m.chat,
        {
          sticker: buffer
        },
        { quoted: m }
      )
    }

    // VIDEO
    if (/^video\//i.test(contentType)) {
      return conn.sendMessage(
        m.chat,
        {
          video: buffer,
          mimetype: contentType,
          caption,
          fileName: filename
        },
        { quoted: m }
      )
    }

    // AUDIO
    if (/^audio\//i.test(contentType)) {
      return conn.sendMessage(
        m.chat,
        {
          audio: buffer,
          mimetype: contentType,
          fileName: filename,
          ptt: false
        },
        { quoted: m }
      )
    }

    // DOCUMENT (Default)
    return conn.sendMessage(
      m.chat,
      {
        document: buffer,
        mimetype: contentType,
        fileName: filename,
        caption
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    m.reply(`❌ Error:\n${e.message || e}`)
  }
}

handler.help = ['fetch', 'get'].map(v => `${v} <url>`)
handler.tags = ['tools']
handler.command = /^(fetch|get)$/i

export default handler