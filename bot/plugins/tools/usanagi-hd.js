
import { enhanceHd } from '../../lib/scraper/awang-hd.js'
import { downloadMediaBuffer, getMediaSource, react } from '../../lib/awang-media.js'

const handler = async (m, { rawConn, usedPrefix }) => {
  const source = getMediaSource(m, ['image'])
  if (!source) {
    await m.reply(`💬 Reply atau kirim gambar lalu ketik *${usedPrefix}hd*.`)
    return
  }

  await react(rawConn, m, '🕕')
  try {
    const input = await downloadMediaBuffer(source)
    await m.reply('🕕 Memproses gambar dengan engine HD...')
    const result = await enhanceHd(input)
    await rawConn.sendMessage(m.chat, {
      image: result.buffer,
      caption: `✅ *HD SELESAI*\nEngine: *${result.engine}*`,
    }, { quoted: m.raw })
    await react(rawConn, m, '✅')
    return { status: true, engine: result.engine }
  } catch (error) {
    await react(rawConn, m, '❌')
    throw new Error(`HD gagal: ${error?.message || 'semua engine tidak tersedia'}`)
  }
}

handler.command = /^(hd|remini|enhance|upscale)$/i
handler.help = ['hd', 'remini', 'enhance', 'upscale']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Meningkatkan kualitas gambar dengan multi-engine enhancer.'
handler.usage = '.hd (reply gambar)'
handler.example = '.hd'
handler.limit = false
handler.premiumOnly = false
handler.credit = global.brandCredit || 'By AlzRiss - Usanagi Umi AI'

export default handler
