import path from 'node:path'

const BASE = 'https://ezgif.com'
const UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/147 Mobile Safari/537.36'

const BACKGROUND = '#ffffff'
const REPEAT = '1'

function detectWebp(buffer) {
  const riff = buffer.subarray(0, 4).toString('ascii') === 'RIFF'
  const webp = buffer.subarray(8, 12).toString('ascii') === 'WEBP'

  if (!riff || !webp) throw new Error('File harus sticker / gambar WEBP.')
}

function absUrl(url) {
  if (!url) return ''
  if (url.startsWith('//')) return 'https:' + url
  if (url.startsWith('/')) return BASE + url
  return url
}

function parseUploadedPage(html) {
  let match =
    html.match(/href=["'](\/webp-to-mp4\/[^"']+?\.webp\.html)["']/i) ||
    html.match(/action=["'](?:https:\/\/ezgif\.com)?(\/webp-to-mp4\/[^"']+?\.webp)["']/i) ||
    html.match(/\/webp-to-mp4\/([^"'<>]+?\.webp)\.html/i) ||
    html.match(/name=["']file["'][^>]*value=["']([^"']+?\.webp)["']/i)

  if (!match) throw new Error('Gagal menemukan file hasil upload EZGIF.')

  let file = match[1]

  if (file.startsWith('/webp-to-mp4/')) {
    file = file.replace('/webp-to-mp4/', '').replace(/\.html$/i, '')
  }

  return file
}

function parseMp4Url(html) {
  const match =
    html.match(/<source[^>]+src=["']([^"']+?\.mp4)["']/i) ||
    html.match(/href=["'](\/save\/[^"']+?\.mp4)["']/i) ||
    html.match(/(\/\/s\d+\.ezgif\.com\/tmp\/[^"'<>]+?\.mp4)/i)

  if (!match) throw new Error('Gagal menemukan URL MP4 dari EZGIF.')

  let url = match[1]

  if (url.startsWith('/save/')) {
    url = url.replace('/save/', '//s6.ezgif.com/tmp/')
  }

  return absUrl(url)
}

async function uploadWebp(buffer, filename) {
  const form = new FormData()
  form.append('new-image', new Blob([buffer], { type: 'image/webp' }), filename)
  form.append('new-image-url', '')
  form.append('upload', 'Upload!')

  const res = await fetch(`${BASE}/webp-to-mp4`, {
    method: 'POST',
    headers: {
      'user-agent': UA,
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'origin': BASE,
      'referer': `${BASE}/webp-to-mp4`,
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
    },
    body: form,
    redirect: 'follow'
  })

  const html = await res.text()
  if (!res.ok) throw new Error(`Upload gagal: ${res.status}`)

  return parseUploadedPage(html)
}

async function openConvertPage(file) {
  const res = await fetch(`${BASE}/webp-to-mp4/${file}.html`, {
    method: 'GET',
    headers: {
      'user-agent': UA,
      'accept': '*/*',
      'referer': `${BASE}/webp-to-mp4`,
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
    }
  })

  if (!res.ok) throw new Error(`Buka halaman convert gagal: ${res.status}`)
  return await res.text()
}

async function convertToMp4(file) {
  const form = new FormData()
  form.append('file', file)
  form.append('background', BACKGROUND)
  form.append('backgroundc', BACKGROUND)
  form.append('repeat', REPEAT)
  form.append('ajax', 'true')

  const res = await fetch(`${BASE}/webp-to-mp4/${file}?ajax=true`, {
    method: 'POST',
    headers: {
      'user-agent': UA,
      'accept': '*/*',
      'origin': BASE,
      'referer': `${BASE}/webp-to-mp4/${file}.html`,
      'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7'
    },
    body: form
  })

  const html = await res.text()
  if (!res.ok) throw new Error(`Convert gagal: ${res.status}`)

  return parseMp4Url(html)
}

async function webpToMp4(buffer, filename = 'sticker.webp') {
  detectWebp(buffer)

  const file = await uploadWebp(buffer, filename)
  await openConvertPage(file)

  return await convertToMp4(file)
}

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mimetype || ''

    if (!/webp/i.test(mime)) {
      return m.reply(
        `Reply sticker/webp dengan command:\n\n${usedPrefix + command}`
      )
    }

    await m.reply('⏳ Sedang convert sticker WEBP ke MP4...')

    let buffer

    if (q.download) {
      buffer = await q.download()
    } else if (conn.downloadM) {
      buffer = await conn.downloadM(q, 'buffer', {})
    } else {
      throw new Error('Downloader media tidak tersedia di base bot.')
    }

    if (!buffer || !buffer.length) {
      throw new Error('Gagal download media.')
    }

    const mp4Url = await webpToMp4(buffer, `usanagi-${Date.now()}.webp`)

    const res = await fetch(mp4Url, {
      headers: {
        'user-agent': UA,
        'referer': BASE
      }
    })

    if (!res.ok) throw new Error(`Gagal mengambil MP4: ${res.status}`)

    const mp4Buffer = Buffer.from(await res.arrayBuffer())

    await conn.sendMessage(
      m.chat,
      {
        video: mp4Buffer,
        mimetype: 'video/mp4',
        caption: '✅ Berhasil convert WEBP ke MP4.'
      },
      { quoted: m }
    )
  } catch (e) {
    await m.reply(`❌ Gagal convert.\n\n${e.message || e}`)
  }
}

handler.help = ['webp2mp4']
handler.tags = ['tools']
handler.command = /^(webp2mp4|sticker2mp4|stickertomp4|tomp4|togif)$/i

export default handler