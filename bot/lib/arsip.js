/* By AlzRiss - Usanagi Umi AI
 *
 * Task136 — pembaca arsip tanpa dependensi tambahan.
 *
 * Dipakai dua fitur:
 *   1. `.addaddon`  → membongkar .mcaddon / .mcpack / .zip dari WhatsApp
 *   2. `.deploysubdomain` → membongkar web (.zip / .tar.gz / .tgz)
 *
 * Kenapa ditulis sendiri: paket bot hanya punya `archiver` (membuat arsip,
 * bukan membongkar) dan `tar`. Bot juga tidak dijamin punya biner `unzip`.
 * ZIP "deflate" bisa dibongkar dengan `zlib` bawaan Node, jadi tidak perlu
 * memasang paket baru di panel.
 *
 * Format yang didukung: .zip (stored + deflate), .tar, .tar.gz/.tgz.
 * .7z TIDAK bisa dibaca tanpa biner `7z` — pemanggil menerima pesan jelas.
 */

import zlib from 'zlib'

export const FORMAT = { zip: 'zip', targz: 'tar.gz', tar: 'tar', tujuhZip: '7z', tidakDikenal: 'tidak-dikenal' }

/** Tebak format dari magic bytes (nama berkas hanya cadangan). */
export function tebakFormat(buffer, nama = '') {
  if (!Buffer.isBuffer(buffer) || buffer.length < 4) return FORMAT.tidakDikenal
  const b = buffer
  if (b[0] === 0x50 && b[1] === 0x4b && (b[2] === 0x03 || b[2] === 0x05 || b[2] === 0x07)) return FORMAT.zip
  if (b[0] === 0x1f && b[1] === 0x8b) return FORMAT.targz
  if (b[0] === 0x37 && b[1] === 0x7a && b[2] === 0xbc && b[3] === 0xaf) return FORMAT.tujuhZip
  const rendah = String(nama).toLowerCase()
  if (rendah.endsWith('.zip') || rendah.endsWith('.mcaddon') || rendah.endsWith('.mcpack')) return FORMAT.zip
  if (rendah.endsWith('.tar.gz') || rendah.endsWith('.tgz')) return FORMAT.targz
  if (rendah.endsWith('.tar')) return FORMAT.tar
  if (rendah.endsWith('.7z')) return FORMAT.tujuhZip
  /* Tar "ustar" ada di offset 257. */
  if (b.length > 262 && b.slice(257, 262).toString('latin1') === 'ustar') return FORMAT.tar
  return FORMAT.tidakDikenal
}

/** Baca isi ZIP (stored/deflate) langsung dari central directory. */
export function bacaZip(buffer) {
  const EOCD = 0x06054b50
  let akhir = -1
  for (let i = buffer.length - 22; i >= 0 && i > buffer.length - 66000; i--) {
    if (buffer.readUInt32LE(i) === EOCD) { akhir = i; break }
  }
  if (akhir < 0) throw new Error('ZIP rusak: penanda akhir tidak ditemukan.')
  const jumlah = buffer.readUInt16LE(akhir + 10)
  let posisi = buffer.readUInt32LE(akhir + 16)
  const hasil = []

  for (let n = 0; n < jumlah; n++) {
    if (buffer.readUInt32LE(posisi) !== 0x02014b50) break
    const metode = buffer.readUInt16LE(posisi + 10)
    const ukuranPadat = buffer.readUInt32LE(posisi + 20)
    const panjangNama = buffer.readUInt16LE(posisi + 28)
    const panjangEkstra = buffer.readUInt16LE(posisi + 30)
    const panjangKomentar = buffer.readUInt16LE(posisi + 32)
    const awalLokal = buffer.readUInt32LE(posisi + 42)
    const nama = buffer.slice(posisi + 46, posisi + 46 + panjangNama).toString('utf8')
    posisi += 46 + panjangNama + panjangEkstra + panjangKomentar

    if (!nama || nama.endsWith('/')) continue
    if (buffer.readUInt32LE(awalLokal) !== 0x04034b50) continue
    const nLokal = buffer.readUInt16LE(awalLokal + 26)
    const eLokal = buffer.readUInt16LE(awalLokal + 28)
    const mulai = awalLokal + 30 + nLokal + eLokal
    const padat = buffer.slice(mulai, mulai + ukuranPadat)
    let isi
    if (metode === 0) isi = Buffer.from(padat)
    else if (metode === 8) {
      try { isi = zlib.inflateRawSync(padat) } catch (error) { continue }
    } else continue
    hasil.push({ jalur: nama.replace(/\\/g, '/'), data: isi })
  }
  return hasil
}

/** Baca isi TAR (block 512 byte, ustar/POSIX). */
export function bacaTar(buffer) {
  const hasil = []
  let posisi = 0
  while (posisi + 512 <= buffer.length) {
    const kepala = buffer.slice(posisi, posisi + 512)
    if (kepala.every((x) => x === 0)) break
    const nama = kepala.slice(0, 100).toString('utf8').replace(/\0.*$/, '')
    const ukuranTeks = kepala.slice(124, 136).toString('utf8').replace(/\0.*$/, '').trim()
    const ukuran = parseInt(ukuranTeks, 8) || 0
    const tipe = String.fromCharCode(kepala[156] || 48)
    const awal = posisi + 512
    if (nama && (tipe === '0' || tipe === '\0' || tipe === '7') && ukuran > 0) {
      hasil.push({ jalur: nama.replace(/^\.\//, '').replace(/\\/g, '/'), data: buffer.slice(awal, awal + ukuran) })
    }
    posisi = awal + Math.ceil(ukuran / 512) * 512
  }
  return hasil
}

/**
 * Bongkar arsip apa pun yang didukung.
 * @returns {{ format: string, berkas: Array<{jalur: string, data: Buffer}> }}
 */
export function bacaArsip(buffer, nama = '') {
  const format = tebakFormat(buffer, nama)
  if (format === FORMAT.zip) return { format, berkas: bacaZip(buffer) }
  if (format === FORMAT.targz) {
    let mentah
    try { mentah = zlib.gunzipSync(buffer) } catch (error) { throw new Error('Gzip rusak / bukan .tar.gz yang valid.') }
    return { format, berkas: bacaTar(mentah) }
  }
  if (format === FORMAT.tar) return { format, berkas: bacaTar(buffer) }
  if (format === FORMAT.tujuhZip) throw new Error('Berkas .7z belum bisa dibongkar di server ini. Pakai .zip atau .tar.gz.')
  throw new Error('Format berkas tidak dikenal. Kirim .html, .zip, atau .tar.gz.')
}

/** Buang entri berbahaya (path traversal, absolut) dan folder sistem. */
export function amanJalur(jalur) {
  const bersih = String(jalur || '')
    .replace(/\\/g, '/')
    .split('/')
    .filter((bagian) => bagian && bagian !== '.' && bagian !== '..')
    .join('/')
  if (!bersih) return ''
  if (/^(__MACOSX|\.DS_Store|node_modules|\.git)\b/.test(bersih)) return ''
  return bersih
}
