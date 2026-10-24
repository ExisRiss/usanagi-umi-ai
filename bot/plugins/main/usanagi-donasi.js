
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { settings } from '../../config/settings.js'
import { ButtonV2 } from '../../lib/awang-tombol.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const QRIS_PATH = path.join(__dirname, '..', '..', 'assets', 'image', settings.donation.qrisImage || 'qris.jpg')

const donationMenuText = [
  '╭───〔 💝 DONASI USANAGI UMI AI 〕',
  '│',
  '│ Terima kasih sudah mendukung',
  '│ perkembangan dan pemeliharaan',
  '│ Usanagi Umi AI.',
  '│',
  '│ Dukungan Anda membantu biaya',
  '│ server, pengembangan fitur,',
  '│ serta menjaga bot tetap aktif.',
  '│',
  '╰──────────────',
  '',
  'Pembayaran hanya tersedia melalui QRIS.',
].join('\n')

const PAYMENT_UNAVAILABLE_TEXT = 'Tidak menerima payment.'

const handler = async (m, { conn, usedPrefix }) => {
  const action = String(m.args?.[0] || '').toLowerCase()

  // QRIS adalah satu-satunya metode yang diterima. DANA dan semua metode
  // lain tetap diberi respons yang jelas jika dipanggil secara manual.
  if (action && action !== 'qris') {
    await conn.sendMessage(m.chat, { text: PAYMENT_UNAVAILABLE_TEXT }, { quoted: m.raw })
    return
  }

  if (action === 'qris') {
    if (!(await fs.pathExists(QRIS_PATH))) {
      await conn.sendMessage(
        m.chat,
        { text: `❌ Gambar QRIS tidak ditemukan. Pastikan file tersedia di assets/image/${settings.donation?.qrisImage || 'qris.jpg'}.` },
        { quoted: m.raw }
      )
      return
    }

    const image = await fs.readFile(QRIS_PATH)
    const caption = [
      '╭───〔 📱 QRIS 〕',
      '│',
      '│ Scan QRIS di atas menggunakan',
      '│ aplikasi pembayaran yang',
      '│ mendukung QRIS.',
      '│',
      '│ Terima kasih atas dukungan',
      '│ Anda untuk Usanagi Umi AI. 🙏',
      '╰──────────────',
    ].join('\n')

    await conn.sendMessage(
      m.chat,
      { image, caption },
      { quoted: m.raw }
    )
    return
  }

  const button = new ButtonV2(conn)
    .setBody(' ')
    .setFooter(donationMenuText)

  const thumbnailPath = './assets/image/donasi.jpg'
  if (await fs.pathExists(thumbnailPath)) {
    button.setThumbnail(await fs.readFile(thumbnailPath))
  }

  button.addButton('▣ QRIS', `${usedPrefix}donasi qris`)

  await button.send(m.chat, { quoted: m.raw })
}

handler.command = /^donasi$/i
handler.help = ['donasi']
handler.tags = ['main']
handler.description = 'Menampilkan pilihan metode donasi'
handler.category = 'main'
handler.hiddenFromCategory = false

export default handler
