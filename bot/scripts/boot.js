#!/usr/bin/env node
/**
 * Boot wrapper untuk deploy di panel (Pterodactyl/Pelican).
 *
 * Kenapa ini ada:
 *   Banyak panel memakai npm yang memblokir lifecycle script demi keamanan
 *   ("allow-scripts"), sehingga paket native seperti better-sqlite3 dan canvas
 *   diinstal TANPA langkah kompilasi, dan @ffmpeg-installer tidak pernah
 *   di-chmod +x. Akibatnya bot bisa boot tapi fitur tertentu mati mendadak.
 *
 * Skrip ini memeriksa hal-hal itu dan hanya memperbaiki yang memang rusak,
 * jadi aman dijalankan setiap kali server dinyalakan.
 */
import { repairBaileysSessions } from '../lib/baileys-session-compat.js'
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(ROOT)

const require = createRequire(import.meta.url)
const log = (...a) => console.log('[boot]', ...a)

/*
 * /tmp di panel ini adalah tmpfs berukuran 100 MB. Satu video 60 MB + audio
 * 38 MB sudah cukup membuatnya penuh, lalu SEMUA penulisan (menu, ping,
 * unduhan) gagal dengan ENOSPC seperti kejadian 2026-10-19 12.59 WITA.
 * Jadi seluruh temp proses diarahkan ke folder container yang disk-backed.
 */
const TMP_ROOT = path.join(ROOT, 'tmp')
try {
  fs.mkdirSync(TMP_ROOT, { recursive: true })
  for (const key of ['TMPDIR', 'TMP', 'TEMP']) process.env[key] = TMP_ROOT
  log(`tmp: ${TMP_ROOT} (disk-backed)`)
} catch (error) {
  log(`tmp: gagal menyiapkan ${TMP_ROOT} (${error.message})`)
}

/** Hapus isi folder temp yang lebih tua dari maxAgeMs. Aman: hanya berkas lama. */
function sweepTemp(dir, maxAgeMs, keep) {
  let removed = 0
  let bytes = 0
  let names = []
  try { names = fs.readdirSync(dir) } catch { return { removed, bytes } }
  const now = Date.now()
  for (const name of names) {
    if (keep && keep.has(name)) continue
    const target = path.join(dir, name)
    let stat
    try { stat = fs.lstatSync(target) } catch { continue }
    if (now - stat.mtimeMs < maxAgeMs) continue
    try {
      fs.rmSync(target, { recursive: true, force: true })
      removed++
      if (stat.isFile()) bytes += stat.size
    } catch {}
  }
  return { removed, bytes }
}

const SWEEP_KEEP = new Set(['node-compile-cache', 'usanagi-waveform'])

/** Folder kerja unduhan (…-job-<ts>-<rand>) boleh dibuang lebih cepat. */
function sweepJobDirs(dir, maxAgeMs) {
  let removed = 0
  let bytes = 0
  let names = []
  try { names = fs.readdirSync(dir) } catch { return { removed, bytes } }
  const now = Date.now()
  for (const name of names) {
    if (!/-(job)-\d+-[0-9a-f]{6,}$/.test(name)) continue
    const target = path.join(dir, name)
    let stat
    try { stat = fs.lstatSync(target) } catch { continue }
    if (!stat.isDirectory() || now - stat.mtimeMs < maxAgeMs) continue
    try {
      for (const inner of fs.readdirSync(target)) {
        try { bytes += fs.statSync(path.join(target, inner)).size } catch {}
      }
      fs.rmSync(target, { recursive: true, force: true })
      removed++
    } catch {}
  }
  return { removed, bytes }
}

function sweepAllTemp() {
  const jobs = [sweepTemp(TMP_ROOT, 2 * 60 * 60 * 1000, SWEEP_KEEP), sweepJobDirs(TMP_ROOT, 15 * 60 * 1000)]
  if (path.resolve('/tmp') !== path.resolve(TMP_ROOT)) {
    jobs.push(sweepTemp('/tmp', 2 * 60 * 60 * 1000, SWEEP_KEEP), sweepJobDirs('/tmp', 15 * 60 * 1000))
  }
  const removed = jobs.reduce((acc, item) => acc + item.removed, 0)
  const bytes = jobs.reduce((acc, item) => acc + item.bytes, 0)
  if (removed) log(`tmp: bersihkan ${removed} berkas sisa (${(bytes / 1048576).toFixed(1)} MB)`)
  try {
    const free = fs.statfsSync(TMP_ROOT)
    const availMb = (free.bavail * free.bsize) / 1048576
    if (availMb < 200) log(`tmp: ruang tersisa ${availMb.toFixed(0)} MB`)
  } catch {}
}

/** Paket native yang harus bisa dimuat. */
const NATIVE = [
  { name: 'better-sqlite3', prebuildArgs: [] },
  { name: 'canvas', prebuildArgs: ['-r', 'napi'] },
]

function canLoad(pkg) {
  try {
    const loaded = require(pkg)
    // better-sqlite3 loads its native binding lazily, on construction.
    // A successful require alone falsely passes after npm blocks install scripts.
    if (pkg === 'better-sqlite3') {
      const probe = new loaded(':memory:')
      try { probe.prepare('SELECT 1 AS ok').get() } finally { probe.close() }
    } else if (pkg === 'canvas') {
      loaded.createCanvas(1, 1).getContext('2d')
    }
    return true
  } catch {
    return false
  }
}

function run(cmd, args, cwd) {
  const res = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env },
  })
  return res.status === 0
}

/** Perbaiki satu paket native: prebuild dulu, baru compile dari sumber. */
function repairNative({ name, prebuildArgs }) {
  const dir = path.join(ROOT, 'node_modules', name)
  if (!fs.existsSync(dir)) {
    log(`${name}: tidak terpasang, dilewati`)
    return false
  }

  const prebuild = path.join(ROOT, 'node_modules', '.bin', 'prebuild-install')

  if (fs.existsSync(prebuild)) {
    log(`${name}: mencoba mengunduh binary siap pakai...`)
    if (run(prebuild, prebuildArgs, dir)) {
      if (canLoad(name)) {
        log(`${name}: OK (binary siap pakai)`)
        return true
      }
    }
  }

  log(`${name}: compile dari sumber (butuh python3 + make + g++)...`)
  if (run('node-gyp', ['rebuild', '--release'], dir) && canLoad(name)) {
    log(`${name}: OK (hasil compile)`)
    return true
  }

  // Jalur terakhir: minta npm yang mengurus, siapa tahu policy-nya mengizinkan.
  log(`${name}: mencoba npm rebuild...`)
  if (run('npm', ['rebuild', name, '--foreground-scripts'], ROOT) && canLoad(name)) {
    log(`${name}: OK (npm rebuild)`)
    return true
  }

  log(`${name}: GAGAL diperbaiki — fitur yang bergantung padanya tidak akan jalan`)
  return false
}

/** @ffmpeg-installer butuh chmod +x yang dilakukan postinstall-nya. */
function ensureFfmpegExecutable() {
  const candidates = [
    '@ffmpeg-installer/linux-x64/ffmpeg',
    '@ffmpeg-installer/linux-arm64/ffmpeg',
    '@ffmpeg-installer/ffmpeg',
  ]
  let fixed = false
  for (const rel of candidates) {
    const bin = path.join(ROOT, 'node_modules', rel)
    if (!fs.existsSync(bin)) continue
    try {
      const mode = fs.statSync(bin).mode
      if (!(mode & 0o111)) {
        fs.chmodSync(bin, 0o755)
        log(`ffmpeg: izin eksekusi diperbaiki -> ${rel}`)
        fixed = true
      }
    } catch (error) {
      log(`ffmpeg: gagal chmod ${rel} (${error.message})`)
    }
  }
  if (!fixed) log('ffmpeg: tidak ada yang perlu diperbaiki')
}

/* ------------------------------------------------------------------ main */

log(`mulai di ${ROOT}`)
log(`node ${process.version}`)

const broken = []
for (const entry of NATIVE) {
  if (canLoad(entry.name)) {
    log(`${entry.name}: tersedia`)
  } else {
    log(`${entry.name}: TIDAK bisa dimuat -> memperbaiki`)
    if (!repairNative(entry)) broken.push(entry.name)
  }
}

ensureFfmpegExecutable()

if (broken.length) {
  log(`peringatan: masih rusak -> ${broken.join(', ')}`)
  log('bot tetap dijalankan; fitur terkait akan menolak dengan pesan jelas.')
}

// Pastikan folder runtime ada supaya tidak error ENOENT saat runtime.
for (const dir of ['sessions', 'tmp', 'jadibot']) {
  fs.mkdirSync(path.join(ROOT, dir), { recursive: true })
}

// Patch dependency source before its first ESM import; idempotent after npm reinstalls.
try { log('Baileys session wire:', repairBaileysSessions(ROOT)) }
catch (error) { log('Baileys session compatibility needs review:', error.message) }
sweepAllTemp()
const sweepTimer = setInterval(sweepAllTemp, 10 * 60 * 1000)
sweepTimer.unref?.()

// Restore database yang tertunda diterapkan sebelum modul bot membuka SQLite.
try {
  const { backupConfig } = await import(path.join(ROOT, 'lib', 'backup', 'config.js'))
  const { applyPendingRestore } = await import(path.join(ROOT, 'lib', 'backup', 'restore.js'))
  const result = applyPendingRestore(backupConfig(ROOT))
  if (result.applied) log(`restore database tertunda diaktifkan (${result.restoreId})`)
} catch (error) {
  log(`gagal memeriksa restore tertunda: ${error.message}`)
}

log('menyerahkan ke main.js...')
await import(path.join(ROOT, 'main.js'))
