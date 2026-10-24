import sharp from 'sharp'
import { prepareWAMessageMedia } from '@rexxhayanasi/elaina-baileys'

const THUMB_URL = './media/banner.jpg'
const URL = global.links?.websiteUrl || global.scriptUrl || ''

let handler = async (m, { conn }) => {
  const caption = `${global.brandCredit || 'By AlzRiss - Usanagi Umi AI'}`

  let thumb
  try {
    thumb = await sharp(THUMB_URL)
      .resize(1280, 720, { fit: 'cover' })
      .jpeg({ quality: 90 })
      .toBuffer()
  } catch {
    thumb = Buffer.alloc(0)
  }

  const media = thumb.length
    ? await prepareWAMessageMedia(
        { image: thumb },
        { upload: conn.waUploadToServer }
      )
    : {}

  await conn.sendMessage(m.chat, {
    text: caption,
    contextInfo: {
      externalAdReply: {
        title: global.brandCredit || 'By AlzRiss - Usanagi Umi AI',
        body: global.namebot || 'Usanagi Umi AI',
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: false,
        sourceUrl: URL,
        mediaUrl: URL,
        thumbnail: thumb,
        ...(media.imageMessage ? { thumbnailUrl: media.imageMessage.url } : {})
      }
    }
  }, { quoted: m })
}

handler.help = ['tqto', 'thanks']
handler.tags = ['info']
handler.command = /^(tqto|thanks|thanksto)$/i

export default handler
