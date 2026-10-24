/* By AlzRiss - Usanagi Umi AI
 *
 * Pembungkus arsip tar.gz + proteksi path traversal.
 * Memakai paket `tar` (sudah tersedia di node_modules bot).
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { c as tarCreate, t as tarList, x as tarExtract } from 'tar'

/** Nama entri aman: relatif, tanpa `..`, tanpa null byte, tanpa drive. */
export function isSafeEntryName(name) {
  if (!name || typeof name !== 'string') return false
  if (name.includes('\0')) return false
  if (name.startsWith('/') || name.startsWith('\\')) return false
  if (/^[A-Za-z]:/.test(name)) return false
  const parts = name.replace(/\\/g, '/').split('/')
  return !parts.some(part => part === '..')
}

/**
 * Buat arsip tar.gz dari daftar entri.
 * @param {object} options
 * @param {string} options.file arsip tujuan
 * @param {string} options.cwd direktori dasar
 * @param {string[]} options.entries path relatif terhadap cwd
 * @param {(entryPath: string) => boolean} [options.filter]
 */
export async function createArchive({ file, cwd, entries, filter }) {
  if (!entries.length) throw new Error('Tidak ada berkas untuk diarsipkan.')
  await tarCreate(
    {
      file,
      cwd,
      gzip: { level: 6 },
      portable: true,
      follow: false,
      noDirRecurse: true,
      // Simpan path relatif apa adanya; pemanggil sudah memastikan aman.
      preservePaths: false,
      filter: entryPath => {
        if (!isSafeEntryName(entryPath)) return false
        if (typeof filter === 'function') return filter(entryPath)
        return true
      },
    },
    entries
  )
  return file
}

/** Daftar isi arsip (untuk verifikasi). */
export async function listArchive(file) {
  const rows = []
  await tarList({
    file,
    onentry: entry => {
      rows.push({
        name: entry.path,
        size: Number(entry.size || 0),
        type: entry.type,
      })
    },
  })
  return rows
}

/**
 * Ekstrak arsip dengan validasi ketat. Mengembalikan daftar entri yang ditulis.
 * Menolak symlink/hardlink, path absolut, dan `..` supaya tidak ada penulisan
 * di luar direktori tujuan.
 */
export async function extractArchive({ file, cwd, filter }) {
  if (!fs.existsSync(file)) throw new Error('Arsip tidak ditemukan.')
  // Pindai lebih dulu: tolak seluruh arsip bila ada satu entri berbahaya,
  // supaya tidak ada berkas yang sempat ditulis sebelum error.
  const listed = await listArchive(file)
  for (const entry of listed) {
    if (!isSafeEntryName(entry.name)) throw new Error(`Entri arsip tidak aman: ${entry.name}`)
    if (entry.type === 'SymbolicLink' || entry.type === 'Link') {
      throw new Error(`Arsip berisi tautan yang ditolak: ${entry.name}`)
    }
  }
  const written = []
  await tarExtract({
    file,
    cwd,
    preservePaths: false,
    strict: true,
    // Jangan pernah memulihkan pemilik/izin asli dari mesin lain.
    noChmod: true,
    noMtime: true,
    filter: (entryPath, entry) => {
      if (!isSafeEntryName(entryPath)) {
        throw new Error(`Entri arsip tidak aman: ${entryPath}`)
      }
      const type = entry && entry.type
      if (type === 'SymbolicLink' || type === 'Link') {
        throw new Error(`Arsip berisi tautan yang ditolak: ${entryPath}`)
      }
      if (typeof filter === 'function') return filter(entryPath, entry)
      return true
    },
    onentry: entry => {
      written.push({ name: entry.path, size: Number(entry.size || 0) })
    },
  })
  return written
}

/** SHA-256 streaming, tanpa memuat berkas ke RAM. */
export function sha256File(file) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    const stream = fs.createReadStream(file)
    stream.on('error', reject)
    stream.on('data', chunk => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('hex')))
  })
}

/** Ukuran total pohon direktori. */
export function dirSize(dir) {
  let total = 0
  const stack = [dir]
  while (stack.length) {
    const current = stack.pop()
    let entries = []
    try {
      entries = fs.readdirSync(current, { withFileTypes: true })
    } catch {
      continue
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name)
      try {
        if (entry.isDirectory()) stack.push(full)
        else if (entry.isFile()) total += fs.statSync(full).size
      } catch {}
    }
  }
  return total
}

/** Pastikan direktori ada dan tidak berada di luar batas root. */
export function resolveInside(root, relative) {
  const base = path.resolve(root)
  const target = path.resolve(base, relative)
  if (target !== base && !target.startsWith(`${base}${path.sep}`)) {
    throw new Error('Path keluar dari direktori yang diizinkan.')
  }
  return target
}
