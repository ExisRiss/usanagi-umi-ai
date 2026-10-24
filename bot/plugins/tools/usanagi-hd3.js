
import { enhanceHd3 } from '../../lib/scraper/awang-hd.js'
import { downloadMediaBuffer, getMediaSource, react } from '../../lib/awang-media.js'

const handler = async (m, { rawConn, usedPrefix }) => {
  const source = getMediaSource(m, ['image'])
  if (!source) {
    await m.reply(`💬 Reply atau kirim gambar lalu ketik *${usedPrefix}hd3*.`)
    return
  }

  await react(rawConn, m, '🕕')
  try {
    const input = await downloadMediaBuffer(source)
    await m.reply('🕕 Memulihkan detail gambar dengan engine HD3...')
    const result = await enhanceHd3(input)
    await rawConn.sendMessage(m.chat, {
      image: result.buffer,
      caption: `✅ *HD3 SELESAI*\nEngine: *${result.engine}*`,
    }, { quoted: m.raw })
    await react(rawConn, m, '✅')
    return { status: true, engine: result.engine }
  } catch (error) {
    await react(rawConn, m, '❌')
    throw new Error(`HD3 gagal: ${error?.message || 'semua engine tidak tersedia'}`)
  }
}

handler.command = /^(hd3|enhance3|upscale3|unblur)$/i
handler.help = ['hd3', 'enhance3', 'upscale3', 'unblur']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Memulihkan detail dan blur dengan multi-engine deblur.'
handler.usage = '.hd3 (reply gambar)'
handler.example = '.hd3'
handler.limit = false
handler.premiumOnly = false

export default handler
