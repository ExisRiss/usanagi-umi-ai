#!/usr/bin/env node
/**
 * Selaraskan berkas statis ke public/ sebelum deploy.
 *
 * Kenapa perlu:
 *   Project ini tidak memakai framework. Vercel menyajikan berkas statis dari
 *   `public/` (terbukti: /assets/* selalu 200, sedangkan berkas root 404 pada
 *   deployment yang tidak punya public/index.html). Supaya tidak ada dua salinan
 *   yang bisa berbeda isi, `index.html` di root tetap jadi SATU-SATUNYA sumber,
 *   dan skrip ini menyalinnya ke public/ saat build.
 *
 * Dijalankan otomatis lewat buildCommand di vercel.json.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = path.join(root, 'public')

/** [sumber di root, tujuan di dalam public/] */
const FILES = [['index.html', 'index.html']]

await fs.mkdir(publicDir, { recursive: true })

let synced = 0
for (const [from, to] of FILES) {
  const src = path.join(root, from)
  const dest = path.join(publicDir, to)
  try {
    await fs.access(src)
  } catch {
    console.warn(`[sync-public] lewati ${from} (tidak ada)`)
    continue
  }
  await fs.copyFile(src, dest)
  const { size } = await fs.stat(dest)
  console.log(`[sync-public] ${from} -> public/${to} (${size} byte)`)
  synced++
}

if (!synced) {
  console.error('[sync-public] tidak ada berkas yang disalin.')
  process.exit(1)
}

console.log(`[sync-public] selesai: ${synced} berkas diselaraskan.`)
