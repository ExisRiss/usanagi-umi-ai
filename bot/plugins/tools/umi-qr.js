/* Umi Usanagi AI — Paket Fitur Umi (kode orisinal) */

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`Contoh: ${usedPrefix + command} https://alzriss-comunity.vercel.app`)
  }
  if (text.length > 1000) return m.reply('Teks terlalu panjang untuk QR (maks 1000 karakter).')

  // Palet biru mengikuti identitas Umi Usanagi AI.
  const qrUrl = `https://quickchart.io/qr?size=600&margin=2&dark=0b3d91&light=ffffff&text=${encodeURIComponent(text)}`
  await conn.sendFile(m.chat, qrUrl, 'umi-qr.png', `🔳 *QR Code — Umi Usanagi AI*\n\n${text.slice(0, 120)}`, m)
}

handler.help = ['umiqr <teks/url>']
handler.tags = ['tools']
handler.category = 'tools'
handler.command = /^(umiqr|buatqr)$/i
handler.description = 'Buat QR code dari teks atau tautan (Umi Usanagi AI)'

export default handler
