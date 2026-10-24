/* Companion services — dijalankan sebagai CMD_RUN container bot:
 *   node scripts/companion.js
 *
 * Menyalakan, di samping bot:
 *   1) game web Umi Games   (game/game.js, port internal 3900)
 *   2) Cloudflare tunnel    (cloudflared + tunnel-games.yml -> game & api)
 *   3) bot utama            (scripts/boot.js, foreground)
 *
 * Tiap layanan dihidupkan ulang otomatis kalau mati; bot tetap jadi proses
 * utama supaya perilaku container sama seperti sebelumnya.
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const bump = (msg) => console.log(`[companion] ${msg}`)

function keep(name, command, args, env = process.env, delay = 5000) {
  const child = spawn(command, args, { cwd: ROOT, stdio: 'inherit', env })
  bump(`${name} jalan (pid ${child.pid})`)
  child.on('error', (error) => bump(`${name} gagal dijalankan: ${error.message}`))
  child.on('exit', (code, signal) => {
    bump(`${name} berhenti (code=${code} signal=${signal}) — ulang dalam ${delay / 1000}s`)
    setTimeout(() => keep(name, command, args, env, Math.min(delay * 2, 60000)), delay)
  })
  return child
}

const has = (p) => { try { fs.accessSync(path.join(ROOT, p)); return true } catch { return false } }

/* Berkas rahasia di root container. Sebelumnya hanya dibaca oleh `npm run
 * tunnel-start` (lewat `set -a; . ./.backup-export.env`), sehingga kalau
 * container dijalankan dengan `node scripts/companion.js` (CMD_RUN sekarang)
 * variabelnya kosong: ekspor backup balas 503, scheduler backup nonaktif,
 * dan laporan error tidak terkirim. Sekarang dibaca di sini supaya perilakunya
 * sama pada kedua cara menjalankan bot. */
const ENV_FILES = ['.tunnel.env', '.backup-export.env', '.error-report.env']

function loadDotEnv() {
  const collected = {}
  for (const name of ENV_FILES) {
    const file = path.join(ROOT, name)
    let source = ''
    try { source = fs.readFileSync(file, 'utf8') } catch { continue }
    try { fs.chmodSync(file, 0o600) } catch {}
    let count = 0
    for (const line of source.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const index = trimmed.indexOf('=')
      if (index < 1) continue
      const key = trimmed.slice(0, index).trim()
      const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '')
      if (!key || !value) continue
      // Nilai dari environment asli tidak ditimpa (env panel tetap menang).
      if (process.env[key] === undefined) collected[key] = value
      count += 1
    }
    bump(`${name}: ${count} variabel dimuat`)
  }
  return collected
}

const fileEnv = loadDotEnv()

/* Token bersama bot <-> game: dipakai endpoint internal /api/trading/credit
 * supaya konversi saldo Rp -> $AS hanya bisa dilakukan bot, bukan dari luar. */
const gameToken = (() => {
  const fromEnv = String(process.env.UMI_GAME_TOKEN || process.env.GAME_TOKEN || '').trim()
  if (fromEnv) return fromEnv
  try { return fs.readFileSync(path.join(ROOT, 'game-token.txt'), 'utf8').trim() } catch { return '' }
})()

if (has('game/game.js')) {
  keep('game', process.execPath, ['game/game.js'], {
    ...process.env,
    ...fileEnv,
    GAME_PORT: process.env.GAME_PORT || '3900',
    ...(gameToken ? { GAME_TOKEN: gameToken } : {}),
  })
} else bump('game/game.js tidak ada — dilewati')

if (has('cloudflared') && has('tunnel-games.yml')) {
  try { fs.chmodSync(path.join(ROOT, 'cloudflared'), 0o700) } catch {}
  keep('tunnel', path.join(ROOT, 'cloudflared'), ['tunnel', '--no-autoupdate', '--config', path.join(ROOT, 'tunnel-games.yml'), 'run'])
} else bump('cloudflared / tunnel-games.yml tidak ada — tunnel dilewati')

bump('menjalankan bot: node scripts/boot.js')
const bot = spawn(process.execPath, ['scripts/boot.js'], {
  cwd: ROOT,
  stdio: 'inherit',
  env: {
    ...process.env,
    ...fileEnv,
    ...(gameToken ? { UMI_GAME_TOKEN: gameToken, GAME_TOKEN: gameToken } : {}),
    UMI_GAME_INTERNAL_URL: process.env.UMI_GAME_INTERNAL_URL || 'http://127.0.0.1:3900',
    UMI_GAME_VERIFY_URL: process.env.UMI_GAME_VERIFY_URL || 'https://jadibot-alzriss.gwenna.my.id/api/platform/verify-token',
    UMI_TOPUP_URL: process.env.UMI_TOPUP_URL || 'https://jadibot-alzriss.gwenna.my.id/api/platform/game-topup',
  },
})
bot.on('exit', (code) => { bump(`bot berhenti (code ${code})`); process.exit(code ?? 0) })
