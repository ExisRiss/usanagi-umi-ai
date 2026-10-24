/* By AlzRiss - Usanagi Umi AI */

import sharp from 'sharp'
import { downloadMediaBuffer, getMediaSource, react } from '../../lib/awang-media.js'

const handler = async (m, { rawConn, usedPrefix }) => {
  const source = getMediaSource(m, ['sticker'])
  if (!source) {
    await m.reply(`💬 Reply atau kirim sticker lalu ketik *${usedPrefix}toimg*.`)
    return
  }

  if (source.message?.isAnimated) {
    await m.reply(`🎞️ Sticker animasi terdeteksi. Gunakan *${usedPrefix}tovideo* untuk MP4.`)
    return
  }

  await react(rawConn, m, '🕕')
  try {
    const buffer = await downloadMediaBuffer(source)
    if (buffer.length < 32) throw new Error('Sticker kosong atau rusak')
    const image = await sharp(buffer).png().toBuffer()

    await rawConn.sendMessage(m.chat, {
      image,
      caption: '✅ *TOIMG SELESAI*',
    }, { quoted: m.raw })
    await react(rawConn, m, '✅')
    return { status: true }
  } catch (error) {
    await react(rawConn, m, '❌')
    throw new Error(`Toimg gagal: ${error?.message || 'proses tidak tersedia'}`)
  }
}

handler.command = /^(toimg|toimage|stickertoimage|stimg)$/i
handler.help = ['toimg', 'toimage', 'stickertoimage', 'stimg']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Mengubah sticker statis menjadi gambar.'
handler.usage = '.toimg (reply sticker)'
handler.example = '.toimg'
handler.limit = false
handler.premiumOnly = false

export default handler
