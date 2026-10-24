import { addExif } from '../../lib/sticker.js'


let handler = async (m, { conn, text }) => {
  // Kesalahan pengguna dijawab sebagai pesan biasa. Dulu semuanya dilempar dari
  // dalam blok finally sehingga tercatat sebagai error plugin di Feedback.
  if (!m.quoted) return m.reply('Balas stiker yang mau diberi watermark, lalu ketik .wm <nama pack>|<author>.')
  let stiker = false
  try {
    let [packname, ...author] = String(text || '').split('|')
    author = (author || []).join('|')
    let mime = m.quoted.mimetype || ''
    if (!/webp/.test(mime)) return m.reply('Yang dibalas bukan stiker. Balas stiker (.webp) ya.')
    let img = await m.quoted.download()
    if (!img) return m.reply('Gagal mengunduh stiker. Coba kirim ulang.')
    stiker = await addExif(img, packname || '', author || '')
  } catch (e) {
    console.error('[wm]', e)
    if (Buffer.isBuffer(e)) stiker = e
  }
  if (!stiker) return m.reply('Gagal mengubah metadata stiker ini.')
  await conn.sendFile(m.chat, stiker, 'wm.webp', '', m, false, { asSticker: true })
}
handler.help = ['wm <packname>|<author>']
handler.tags = ['sticker']
handler.command = /^wm$/i

export default handler