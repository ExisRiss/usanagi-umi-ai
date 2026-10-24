/* By AlzRiss - Usanagi Umi AI */

import { removeBackground } from '../../lib/scraper/awang-removebackground.js'
import { downloadMediaBuffer, getMediaSource, getMimeType, getFileName, react } from '../../lib/awang-media.js'

const handler = async (m, { rawConn, usedPrefix }) => {
  const source = getMediaSource(m, ['image'])
  if (!source) {
    await m.reply(`💬 Reply atau kirim gambar lalu ketik *${usedPrefix}removebg*.`)
    return
  }

  await react(rawConn, m, '🕕')
  try {
    const buffer = await downloadMediaBuffer(source)
    const result = await removeBackground(buffer, getMimeType(source, 'image/jpeg'), getFileName(source, 'image.jpg'))
    await rawConn.sendMessage(m.chat, {
      image: result,
      caption: '✅ *REMOVEBG SELESAI*',
    }, { quoted: m.raw })
    await react(rawConn, m, '✅')
    return { status: true }
  } catch (error) {
    await react(rawConn, m, '❌')
    throw new Error(`RemoveBG gagal: ${error?.message || 'service tidak tersedia'}`)
  }
}

handler.command = /^(removebg|rmbg|nobg|hapusbg)$/i
handler.help = ['removebg', 'rmbg', 'nobg', 'hapusbg']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Menghapus background dari gambar.'
handler.usage = '.removebg (reply gambar)'
handler.example = '.removebg'
handler.limit = false
handler.premiumOnly = false

export default handler
