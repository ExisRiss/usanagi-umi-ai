/* By AlzRiss - Usanagi Umi AI
 *
 * Task136 — "katalog foto": kirim beberapa foto sekaligus sebagai ALBUM
 * (seperti katalog produk), bukan satu foto langsung.
 *
 * Kenapa: pesan satu-foto sering tampil sebagai kartu besar dan terpotong di
 * WhatsApp Business; album tetap bisa dibuka di WhatsApp biasa maupun
 * WhatsApp Business.
 *
 * Kalau server WhatsApp menolak album (butuh minimal 2 media), fungsi ini
 * turun bertahap: album → satu gambar + caption → teks saja. Tidak pernah
 * gagal diam-diam.
 */

import fs from 'fs'
import path from 'path'

const KANDIDAT = [
  path.join(process.cwd(), 'assets', 'menu', 'logo.jpg'),
  path.join(process.cwd(), 'assets', 'menu', 'cover.jpg'),
  path.join(process.cwd(), 'assets', 'menu', 'bg-card.jpg'),
  path.join(process.cwd(), 'assets', 'image', 'dok.jpg'),
  path.join(process.cwd(), 'assets', 'image', 'awang.jpg'),
]

export function daftarFotoLokal(batas = 3) {
  const hasil = []
  for (const jalur of KANDIDAT) {
    try {
      if (!fs.existsSync(jalur)) continue
      const data = fs.readFileSync(jalur)
      if (data.length) hasil.push(data)
    } catch (error) { }
    if (hasil.length >= batas) break
  }
  return hasil
}

/**
 * Kirim teks panjang sebagai album foto (katalog).
 * @returns {Promise<'album'|'foto'|'teks'>} cara yang berhasil
 */
export async function kirimKatalog(conn, jid, { caption = '', quoted = null, foto = null, batas = 3 } = {}) {
  const gambar = Array.isArray(foto) && foto.length ? foto : daftarFotoLokal(batas)
  const opsi = quoted ? { quoted } : {}

  if (gambar.length >= 2) {
    try {
      const media = gambar.slice(0, 4).map((data, i) => ({
        image: data,
        ...(i === 0 ? { caption } : {}),
      }))
      await conn.sendAlbumMessage(jid, media, opsi)
      return 'album'
    } catch (error) {
      console.log('[katalog] album ditolak:', error?.message || error)
    }
  }

  if (gambar.length) {
    try {
      await conn.sendMessage(jid, { image: gambar[0], caption }, opsi)
      return 'foto'
    } catch (error) { }
  }

  await conn.sendMessage(jid, { text: caption }, opsi)
  return 'teks'
}
