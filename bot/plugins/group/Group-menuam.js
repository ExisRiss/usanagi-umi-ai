/* By AlzRiss - Usanagi Umi AI */

import sharp from 'sharp'
import { prepareWAMessageMedia } from '@rexxhayanasi/elaina-baileys'

const THUMB_URL = 'https://raw.githubusercontent.com/hamm-r/uploader/main/1785278261599-24.jpg' // Bisa diganti URL gambar lain
const URL = 'https://api.theresav.eu/'

let handler = async (m, { conn, usedPrefix }) => {
  // Inisialisasi database chat jaga-jaga
  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  let chat = global.db.data.chats[m.chat]
  let isAmMode = chat.am_mode

  let statusMode = isAmMode ? "🟢 AKTIF (Bebas Akses)" : "🔴 NONAKTIF (Khusus Premium)"

  const caption = `🎨 *───「 AM PREMIUM MENU 」───* 🎨

📊 *Status AM Mode:* ${statusMode}
📍 *Grup:* ${conn.getName(m.chat)}

Halo kak! Berikut adalah layanan Alight Motion Premium yang tersedia.

*1. Pengirim Link Verifikasi*
 ◦ Perintah: \`${usedPrefix}ampremium\`
 ◦ Format: \`${usedPrefix}ampremium emailkamu@gmail.com\`
 ◦ Fungsi: Mengirim link aktivasi resmi ke Gmail kamu.

*2. Verifikasi Akun Premium*
 ◦ Perintah: \`${usedPrefix}amverify\`
 ◦ Format: \`${usedPrefix}amverify email | link_login\`
 ◦ Fungsi: Memasukkan link yang dikirim dari email untuk aktivasi Premium di akun kamu.

💡 *Info:*
Jika *AM Mode* sedang **AKTIF**, maka siapapun di grup ini bisa menggunakan fitur di atas meskipun bukan user premium di bot!

By AlzRiss - Usanagi Umi AI`

  const thumb = await getThumbUrl(THUMB_URL)
  const highQualityThumbnail = await createHighQualityThumbnail(conn, thumb)
  const invisible = '\u200B'.repeat(400)

  await conn.sendMessage(
    m.chat,
    {
      text: `${URL}${invisible}\n\n${caption}`,
      linkPreview: {
        'matched-text': URL,
        matchedText: URL,
        canonicalUrl: URL,
        title: '「 𝐀𝐥𝐢𝐠𝐡𝐭 𝐌𝐨𝐭𝐢𝐨𝐧 𝐏𝐫𝐞𝐦𝐢𝐮𝐦 𝐕𝐈𝐏 」',
        description: global.brandCredit || 'By AlzRiss - Usanagi Umi AI',
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
      quoted: global.fmeta || m
    }
  )
}

handler.help = ["ammenu"]
handler.tags = ["main"]
handler.command = /^(ammenu|menuam)$/i

export default handler

// ==========================================
// KUMPULAN FUNGSI HELPER UNTUK THUMBNAIL HQ
// ==========================================

async function getThumbUrl(url) {
  try {
    const res = await fetch(url)
    const raw = Buffer.from(await res.arrayBuffer())

    return await sharp(raw)
      .resize(1280, 720, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toBuffer()
  } catch {
    return Buffer.alloc(0)
  }
}

async function createHighQualityThumbnail(conn, thumb) {
  try {
    if (!thumb.length) return null

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
  } catch {
    return null
  }
}