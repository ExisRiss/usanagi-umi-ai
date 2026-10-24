import fs from 'fs'
import sharp from 'sharp'
import { prepareWAMessageMedia } from '@rexxhayanasi/elaina-baileys'

const THUMB_URL = 'https://telegra.ph/file/5c636746e3be7de5fb61f.jpg'

let handler = async (m, { conn }) => {
  let user = m.sender
  let hasil = pickRandom(iqcek)

  let caption = `*── 「 CEK IQ 」 ──*

• *User:* @${user.split('@')[0]}
• *Hasil:* ${hasil}`

  let thumb = await getThumbUrl(THUMB_URL)
  let highQualityThumbnail = await createHighQualityThumbnail(conn, thumb)

  let urlB = global.links?.websiteUrl || global.scriptUrl || ''
  let invisible = '\u200B'.repeat(400)

  let hlmn = {
    key: {
      participant: '0@s.whatsapp.net'
    },
    message: {
      orderMessage: {
        itemCount: 99999999,
        surface: 99999999,
        message: 'Usanagi Umi AI waku waku ✨',
        orderTitle: 'Usanagi Umi AI',
        thumbnail: thumb,
        sellerJid: '0@s.whatsapp.net'
      }
    }
  }

  await conn.sendMessage(
    m.chat,
    {
      text: `${urlB}${invisible}

${caption}`,
      mentions: [user],
      linkPreview: {
        'matched-text': urlB,
        matchedText: urlB,
        canonicalUrl: urlB,
        title: '❀ USANAGI UMI AI ❀',
        description: 'IQ Scanner • Waku Waku 🥜',
        previewType: 0,
        jpegThumbnail: thumb,
        highQualityThumbnail,
        thumbnailUrl: THUMB_URL,
        linkPreviewMetadata: {
          linkMediaDuration: 0,
          socialMediaPostType: 4
        }
      },
      favicon: {
        url: THUMB_URL
      }
    },
    {
      quoted: hlmn
    }
  )
}

handler.help = ['cekiq']
handler.tags = ['fun']
handler.command = /^cekiq$/i
handler.limit = false

export default handler

async function getThumbUrl(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Gagal ambil thumbnail')

    const raw = Buffer.from(await res.arrayBuffer())

    return await sharp(raw)
      .resize(1280, 720, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toBuffer()
  } catch (e) {
    console.error('Thumb Error:', e)
    return Buffer.alloc(0)
  }
}

async function createHighQualityThumbnail(conn, thumb) {
  try {
    if (!thumb?.length) return null

    const { imageMessage } = await prepareWAMessageMedia(
      { image: thumb },
      {
        upload: conn.waUploadToServer,
        mediaTypeOverride: 'thumbnail-link'
      }
    )

    imageMessage.width = 1280
    imageMessage.height = 720

    return imageMessage
  } catch (e) {
    console.error('HQ Thumb Error:', e)
    return null
  }
}

function pickRandom(list) {
  return list[Math.floor(list.length * Math.random())]
}

let iqcek = [
  `IQ Level : 50\n\nOtak aplikasi kandang monyet 🐒`,
  `IQ Level : 57\n\nOtak aplikasi kandang monyet 🐒`,
  `IQ Level : 63\n\nOtak aplikasi kandang monyet 🐒`,
  `IQ Level : 71\n\nOtak aplikasi kandang monyet 🐒`,
  `IQ Level : 78\n\nOtak aplikasi kandang monyet 🐒`,
  `IQ Level : 85\n\nOtak reza arap awokwok 😹`,
  `IQ Level : 93\n\nOtak aplikasi kandang monyet 🐒`,
  `IQ Level : 100\n\nOtak aplikasi kandang monyet 🐒`,
  `IQ Level : 108\n\nStandar manusia bumi`,
  `IQ Level : 119\n\nLumayan encer otaknya`,
  `IQ Level : 127\n\nCerdas dan berwibawa`,
  `IQ Level : 138\n\nIsi kepala bukan kaleng-kaleng`,
  `IQ Level : 149\n\nOtak roket`,
  `IQ Level : 162\n\nLevel ilmuwan`,
  `IQ Level : 174\n\nCalon profesor`,
  `IQ Level : 186\n\nDebat auto win`,
  `IQ Level : 195\n\nGoogle aja nanya balik`,
  `IQ Level : 200\n\nJenius tidak wajar`
]