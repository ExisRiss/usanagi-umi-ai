import {
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  proto
} from '@rexxhayanasi/elaina-baileys'
import fs from 'fs'
import sharp from 'sharp'

/* Dulu hanya './media/menu.png'. Di server bot folder /media tidak ada,
 * sehingga buffer kosong masuk ke sharp dan muncul "Input Buffer is empty"
 * (laporan Feedback 15 Okt 2026). Sekarang dicoba beberapa berkas yang memang
 * ada, dan kalau semuanya tidak ada dibuat gambar polos supaya .sc tetap jalan. */
const THUMB_CANDIDATES = [
  './media/menu.png',
  './media/thumbnail.jpg',
  './assets/image/menu.png',
  './bg-template.jpg',
]

function readThumbnail() {
  for (const file of THUMB_CANDIDATES) {
    try {
      const buffer = fs.readFileSync(file)
      if (buffer.length > 1024) return buffer
    } catch { }
  }
  return null
}

let handler = async (m, { conn }) => {
  const scriptUrl = global.scriptUrl || ''
  if (!scriptUrl) {
    return m.reply('URL script belum diatur. Isi `global.scriptUrl` di config.js.')
  }

  const text = `⚡ *INFO SCRIPT USANAGI UMI AI*

Usanagi Umi AI adalah bot WhatsApp multi-device dengan sistem plugin dinamis.

• Menu modern dengan beberapa gaya
• Plugin AI, downloader, game, RPG, grup, maker, dan tools
• Sistem level, limit, premium, jadibot, dan database
• Dukungan bahasa Indonesia dan Inggris

Tekan tombol di bawah untuk membuka halaman script.`

  let thumb
  try {
    const rawThumb = readThumbnail()
    thumb = rawThumb
      ? await sharp(rawThumb).resize(1280, 720, { fit: 'cover', position: 'center' }).jpeg({ quality: 90 }).toBuffer()
      : await sharp({ create: { width: 1280, height: 720, channels: 3, background: { r: 22, g: 17, b: 40 } } })
        .jpeg({ quality: 90 })
        .toBuffer()
  } catch (error) {
    console.error('[info-script] thumbnail gagal:', error?.message || error)
    return m.reply('Gagal menyiapkan gambar untuk kartu script.')
  }
  const hdImage = await createHighQualityThumbnail(conn, thumb)

  if (!hdImage) return m.reply('Gagal menyiapkan thumbnail script.')

  const msg = generateWAMessageFromContent(
    m.chat,
    proto.Message.fromObject({
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: '「 𝐔𝐬𝐚𝐧𝐚𝐠𝐢 𝐔𝐦𝐢 𝐀𝐈 • 𝐒𝐜𝐫𝐢𝐩𝐭 」\n',
              hasMediaAttachment: true,
              imageMessage: hdImage
            },
            body: { text },
            footer: { text: `⚡ ${global.namebot || 'Usanagi Umi AI'}` },
            nativeFlowMessage: {
              buttons: [{
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({
                  display_text: 'Buka Script',
                  url: scriptUrl,
                  merchant_url: scriptUrl
                })
              }]
            }
          }
        }
      }
    }),
    { userJid: m.sender, quoted: m }
  )

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

handler.help = ['sc', 'script']
handler.tags = ['info']
handler.command = /^(sc|script)$/i

export default handler

async function createHighQualityThumbnail(conn, thumb) {
  try {
    if (!thumb.length) return null
    const { imageMessage } = await prepareWAMessageMedia(
      { image: thumb },
      { upload: conn.waUploadToServer }
    )
    imageMessage.width = 1280
    imageMessage.height = 720
    return imageMessage
  } catch {
    return null
  }
}
