import fetch from 'node-fetch'
import FormData from 'form-data'

let handler = async (m, { conn }) => {

  let q = m.quoted ? m.quoted : m
  let mime = (q.msg || q).mimetype || ''

  if (!/image/.test(mime)) return conn.reply(
    m.chat,
    'Reply atau kirim gambar dengan caption\nContoh: .jadikomik',
    global.fstatus
  )

  await m.reply('Gambar dulu woy')

  try {
    let media = await q.download()

    let form = new FormData()
    form.append('image', media, 'image.jpg')
    form.append(
      'param',
      'buat gambar ini menjadi panel manga, buat beberapa panel dan ubah karakternya menjadi anime tanpa bubble text'
    )

    let res = await fetch('https://api.nexray.web.id/ai/nanobanana', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    })

    if (!res.ok) throw new Error(await res.text())

    let buffer = Buffer.from(await res.arrayBuffer())

    await conn.sendFile(
      m.chat,
      buffer,
      'manga.jpg',
      'udh jadi nih ngab',
      global.fkontak
    )

  } catch (e) {
    console.log('jadikomik eror...:', e)
    conn.reply(
      m.chat,
      'API error.',
      global.fstatus
    )
  }
}

handler.help = ['jadikomik']
handler.tags = ['ai']
handler.command = /^jadikomik$/i
handler.limit = true

export default handler