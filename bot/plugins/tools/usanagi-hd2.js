/* By AlzRiss - Usanagi Umi AI */

import { enhanceHd2 } from '../../lib/scraper/awang-hd.js'
import { downloadMediaBuffer, getMediaSource, react } from '../../lib/awang-media.js'

const handler = async (m, { rawConn, usedPrefix, settings }) => {
  const source = getMediaSource(m, ['image'])
  if (!source) {
    await m.reply(`💬 Reply atau kirim gambar lalu ketik *${usedPrefix}hd2*.`)
    return
  }

  await react(rawConn, m, '🕕')
  try {
    const input = await downloadMediaBuffer(source)
    await m.reply('🕕 Memproses gambar dengan engine HD2...')
    const result = await enhanceHd2(input)
    const botName = String(settings.botName || 'Usanagi Umi AI').trim() || 'Usanagi Umi AI'
    await rawConn.sendMessage(m.chat, {
      image: result.buffer,
      caption: `✅ *HD2 SELESAI*\nEngine: *${result.engine}*\n${global.brandCredit || 'By AlzRiss - Usanagi Umi AI'}`,
    }, { quoted: m.raw })
    await react(rawConn, m, '✅')
    return { status: true, engine: result.engine }
  } catch (error) {
    await react(rawConn, m, '❌')
    throw new Error(`HD2 gagal: ${error?.message || 'semua engine tidak tersedia'}`)
  }
}

handler.command = /^(hd2|enhance2|upscale2|aienhancer)$/i
handler.help = ['hd2', 'enhance2', 'upscale2', 'aienhancer']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Upscale gambar melalui multi-engine AI alternatif.'
handler.usage = '.hd2 (reply gambar)'
handler.example = '.hd2'
handler.limit = false
handler.premiumOnly = false

export default handler
