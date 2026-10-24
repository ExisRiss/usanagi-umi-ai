import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import fs from 'fs'
import path from 'path'

const fontPath = './tmp/wafatfont.ttf'
const bgUrl = 'https://uploader.zenzxz.dpdns.org/uploads/1776848882042.jpeg'

let fontLoaded = false

async function getBuffer(input) {
  if (Buffer.isBuffer(input)) return input

  if (typeof input === 'string' && input.startsWith('data:image')) {
    return Buffer.from(input.split(',')[1], 'base64')
  }

  const res = await fetch(input)
  if (!res.ok) throw new Error('Gagal mengambil gambar')

  return Buffer.from(await res.arrayBuffer())
}

function drawCircle(ctx, img, x, y, size) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, size / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(img, x - size / 2, y - size / 2, size, size)
  ctx.restore()
}

async function loadAssets() {
  if (fontLoaded) return

  if (!fs.existsSync('./tmp'))
    fs.mkdirSync('./tmp', { recursive: true })

  if (!fs.existsSync(fontPath)) {
    const res = await fetch('https://uploader.zenzxz.dpdns.org/uploads/1776849905914.ttf')
    if (!res.ok) throw new Error('Gagal mengunduh font')

    fs.writeFileSync(
      fontPath,
      Buffer.from(await res.arrayBuffer())
    )
  }

  GlobalFonts.registerFromPath(
    path.resolve(fontPath),
    'WafatFont'
  )

  fontLoaded = true
}

async function fakeWafat({ fotourl, nama, lahir, wafat }) {
  await loadAssets()

  const [bgBuffer, fotoBuffer] = await Promise.all([
    getBuffer(bgUrl),
    getBuffer(fotourl)
  ])

  const bg = await loadImage(bgBuffer)
  const foto = await loadImage(fotoBuffer)

  const canvas = createCanvas(bg.width, bg.height)
  const ctx = canvas.getContext('2d')

  ctx.drawImage(bg, 0, 0)

  const centerX = bg.width / 2

  drawCircle(ctx, foto, centerX, 1210, 575)

  ctx.fillStyle = '#462F29'
  ctx.textAlign = 'center'

  let fontSize = 60
  ctx.font = `${fontSize}px WafatFont`

  while (
    ctx.measureText(nama).width > 900 &&
    fontSize > 35
  ) {
    fontSize--
    ctx.font = `${fontSize}px WafatFont`
  }

  ctx.fillText(nama, centerX, 1740)

  ctx.font = '40px WafatFont'
  ctx.fillText(
    `${lahir} - ${wafat}`,
    centerX,
    1815,
    900
  )

  return canvas.toBuffer('image/png')
}

let handler = async (m, { conn, text }) => {
  if (!text) {
    throw `
Contoh penggunaan:

• Reply foto
.fakewafat Nama|1995|2026

• Pakai URL
.fakewafat https://contoh.com/foto.jpg|Nama|1995|2026

• Mention user
.fakewafat @user Nama|1995|2026
`.trim()
  }

  let fotourl
  let nama
  let lahir
  let wafat

  let target = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : m.sender)

  // ========= MODE URL =========
  if (/^https?:\/\//i.test(text)) {
    let split = text.split('|')

    if (split.length < 4)
      throw 'Format salah!\n\n.fakewafat url|nama|lahir|wafat'

    fotourl = split.shift().trim()
    nama = split[0].trim()
    lahir = split[1].trim()
    wafat = split[2].trim()

  } else {

    // ========= MODE MENTION =========
    if (m.mentionedJid?.length) {
      let clean = text.replace(/@\d+/g, '').trim()
      let split = clean.split('|')

      if (split.length < 3)
        throw 'Format salah!\n\n.fakewafat @tag Nama|1995|2026'

      nama = split[0].trim()
      lahir = split[1].trim()
      wafat = split[2].trim()

    } else {

      // ========= MODE BIASA =========
      let split = text.split('|')

      if (split.length < 3)
        throw 'Format salah!\n\n.fakewafat Nama|1995|2026'

      nama = split[0].trim()
      lahir = split[1].trim()
      wafat = split[2].trim()
    }

    // Reply gambar
    if (
      m.quoted &&
      /image\/(png|jpe?g|webp)/i.test(m.quoted.mimetype || '')
    ) {
      fotourl = await m.quoted.download()
    } else {
      fotourl = await conn.profilePictureUrl(target, 'image')
        .catch(() => 'https://i.ibb.co/2WzLyGk/profile.jpg')
    }
  }

  await m.reply('⏳ Sedang membuat fake wafat...')

  try {
    const buffer = await fakeWafat({
      fotourl,
      nama,
      lahir,
      wafat
    })

    await conn.sendFile(
      m.chat,
      buffer,
      'fake_wafat.png',
      '',
      m
    )

  } catch (e) {
    console.error(e)
    throw '❌ Gagal membuat fake wafat.'
  }
}

handler.help = ['fakewafat']
handler.tags = ['maker']
handler.command = /^fakewafat$/i

export default handler