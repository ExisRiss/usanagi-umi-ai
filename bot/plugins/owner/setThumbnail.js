// plugins/owner/setthumbnail.js
// Set Thumbnail Bot
// Owner Only

import fs from 'fs'
import path from 'path'

const THUMB_PATH = './media/thumbnail.jpg'

let handler = async (m, { isOwner }) => {
  if (!isOwner) return m.reply('❌ Khusus Owner!')

  const quoted = m.quoted

  if (!quoted) {
    return m.reply(
      '🖼️ Reply gambar yang ingin dijadikan thumbnail!\n\n' +
      'Contoh:\n' +
      '.setthumbnail'
    )
  }

  try {
    const mime = quoted.mimetype || quoted.msg?.mimetype || ''

    if (!mime.startsWith('image/')) {
      return m.reply(
        '❌ Yang kamu reply bukan gambar!\n\n' +
        '📸 Reply gambar lalu ketik *.setthumbnail*'
      )
    }

    await m.reply('⏳ Menyimpan thumbnail...')

    const buffer = await quoted.download()

    if (!buffer || !buffer.length) {
      throw new Error('Gagal mengunduh gambar.')
    }

    const dir = path.dirname(THUMB_PATH)

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    // Timpa thumbnail lama
    fs.writeFileSync(THUMB_PATH, buffer)

    await m.reply(
      '✅ Thumbnail berhasil diganti!\n\n' +
      '🖼️ File: `./media/thumbnail.jpg`'
    )

  } catch (e) {
    console.error('SET THUMBNAIL ERROR:', e)

    await m.reply(
      `❌ Gagal mengganti thumbnail!\n\n${e?.message || e}`
    )
  }
}

handler.help = ['setthumbnail']
handler.tags = ['owner']
handler.command = /^setthumbnail$/i
handler.owner = true

export default handler