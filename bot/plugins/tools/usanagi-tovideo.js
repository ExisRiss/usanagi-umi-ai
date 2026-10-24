
import sharp from 'sharp'
import { transcodeBuffer } from '../../lib/awang-ffmpeg.js'
import { downloadMediaBuffer, getMediaSource, react } from '../../lib/awang-media.js'

async function convertAnimatedWebp(buffer) {
  const metadata = await sharp(buffer, { animated: true, pages: -1 }).metadata()
  if (!metadata.pages || metadata.pages < 2) throw new Error('Sticker bukan animasi')

  try {
    return await transcodeBuffer(buffer, 'webp', 'mp4', {
      outputOptions: [
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', '21',
        '-pix_fmt', 'yuv420p',
        '-movflags', 'faststart',
        '-an',
      ],
      videoFilters: ['scale=trunc(iw/2)*2:trunc(ih/2)*2'],
      timeoutMs: 120000,
    })
  } catch {
    const gif = await sharp(buffer, { animated: true, pages: -1 }).gif({ loop: 0 }).toBuffer()
    return transcodeBuffer(gif, 'gif', 'mp4', {
      outputOptions: [
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-crf', '21',
        '-pix_fmt', 'yuv420p',
        '-movflags', 'faststart',
        '-an',
      ],
      videoFilters: ['scale=trunc(iw/2)*2:trunc(ih/2)*2'],
      timeoutMs: 120000,
    })
  }
}

const handler = async (m, { rawConn, usedPrefix }) => {
  const source = getMediaSource(m, ['sticker'])
  if (!source) {
    await m.reply(`💬 Reply sticker animasi lalu ketik *${usedPrefix}tovideo*.`)
    return
  }

  await react(rawConn, m, '🕕')
  try {
    const input = await downloadMediaBuffer(source)
    const output = await convertAnimatedWebp(input)
    if (!Buffer.isBuffer(output) || output.length < 100) throw new Error('Video output kosong')

    await rawConn.sendMessage(m.chat, {
      video: output,
      mimetype: 'video/mp4',
      fileName: `Usanagi-Sticker-${Date.now()}.mp4`,
      caption: '✅ *TOVIDEO SELESAI*',
    }, { quoted: m.raw })
    await react(rawConn, m, '✅')
    return { status: true }
  } catch (error) {
    await react(rawConn, m, '❌')
    throw new Error(`Tovideo gagal: ${error?.message || 'sticker animasi tidak dapat dikonversi'}`)
  }
}

handler.command = /^(tovideo|tovid|stickertovideo|giftomp4|webmtomp4)$/i
handler.help = ['tovideo', 'tovid', 'stickertovideo', 'giftomp4', 'webmtomp4']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Mengubah sticker animasi menjadi video MP4 dengan alur khusus video.'
handler.usage = '.tovideo (reply sticker animasi)'
handler.example = '.tovideo'
handler.limit = false
handler.premiumOnly = false

export { convertAnimatedWebp }

export default handler
