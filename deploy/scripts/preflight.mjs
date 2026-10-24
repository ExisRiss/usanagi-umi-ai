#!/usr/bin/env node
/**
 * Preflight check — Usanagi Umi (bot + website)
 *
 * Memeriksa kesiapan sebelum bot dinyalakan atau website di-deploy.
 * Tanpa dependency eksternal. Jalankan dari root repo:
 *
 *   node deploy/scripts/preflight.mjs
 *   node deploy/scripts/preflight.mjs --bot
 *   node deploy/scripts/preflight.mjs --website
 *
 * Exit code 0 = siap (boleh ada WARN), 1 = ada FAIL.
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const BOT = path.join(ROOT, 'bot')
const WEBSITE = path.join(ROOT, 'website')

const only = process.argv.includes('--bot') ? 'bot' : process.argv.includes('--website') ? 'website' : 'all'

const results = []
const add = (scope, level, title, detail = '') => results.push({ scope, level, title, detail })
const pass = (s, t, d) => add(s, 'PASS', t, d)
const warn = (s, t, d) => add(s, 'WARN', t, d)
const fail = (s, t, d) => add(s, 'FAIL', t, d)

/* ---------------------------------------------------------- helpers */

const PLACEHOLDER_PATTERNS = [
  /628xxxxxxxxxx/i,
  /YOUR_[A-Z0-9_]+/,
  /example\.com/i,
  /YOUR_PROJECT/i,
  /NamaKamu/i,
]

function readIfExists(file) {
  try {
    return fs.readFileSync(file, 'utf8')
  } catch {
    return null
  }
}

function parseEnvFile(file) {
  const content = readIfExists(file)
  if (!content) return null
  const env = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!match) continue
    let value = match[2].trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    env[match[1]] = value
  }
  return env
}

function nodeMajor() {
  return Number(process.versions.node.split('.')[0])
}

/* ------------------------------------------------------------ BOT */

function checkBot() {
  const scope = 'BOT'

  if (nodeMajor() >= 20) pass(scope, `Node.js ${process.versions.node} memenuhi syarat (>= 20)`)
  else fail(scope, `Node.js ${process.versions.node} terlalu tua`, 'Bot membutuhkan Node 20 atau lebih baru.')

  const configPath = path.join(BOT, 'config.js')
  const config = readIfExists(configPath)
  if (!config) {
    fail(scope, 'bot/config.js tidak ditemukan', 'Salin dari config.example.js lalu isi datamu.')
  } else {
    const hits = PLACEHOLDER_PATTERNS.filter(p => p.test(config))
    if (hits.length) {
      fail(scope, 'bot/config.js masih berisi placeholder', `Pola terdeteksi: ${hits.map(String).join(', ')}`)
    } else {
      pass(scope, 'bot/config.js terbaca tanpa placeholder')
    }

    const portMatch = config.match(/apiPort\s*:\s*(\d+)/)
    if (portMatch) {
      const port = Number(portMatch[1])
      warn(
        scope,
        `Port API Jadibot: ${port} (bind 0.0.0.0)`,
        `Port ini listen ke semua interface. Taruh di belakang reverse proxy HTTPS ` +
          `(deploy/nginx/umi-bot-api.conf) dan tolak akses langsung dari internet.`
      )

      const ufw = readIfExists(path.join(ROOT, 'deploy', 'scripts', 'firewall-ufw.sh'))
      if (ufw && ufw.includes(String(port))) pass(scope, `Port ${port} sudah diblokir di panduan firewall`)
      else warn(scope, `Port ${port} belum terlihat di deploy/scripts/firewall-ufw.sh`)
    } else {
      warn(scope, 'apiPort tidak ditemukan di config.js', 'Kode akan memakai default 2144.')
    }

    if (/supabaseUrl\s*:\s*['"]https:\/\//.test(config) && !PLACEHOLDER_PATTERNS.some(p => p.test(config))) {
      pass(scope, 'supabaseUrl terisi')
    } else if (/supabaseUrl/.test(config)) {
      warn(scope, 'supabaseUrl belum diisi dengan project asli', 'Login Jadibot dari website akan gagal.')
    }
  }

  if (fs.existsSync(path.join(BOT, 'node_modules'))) pass(scope, 'Dependency bot terpasang (node_modules ada)')
  else fail(scope, 'node_modules bot belum ada', 'Jalankan: cd bot && npm ci')

  const sessions = path.join(BOT, 'sessions')
  if (fs.existsSync(sessions) && fs.readdirSync(sessions).length) {
    pass(scope, 'Folder sessions ada dan tidak kosong')
  } else {
    warn(scope, 'Sesi WhatsApp belum ada', 'Bot akan meminta pairing saat pertama dijalankan.')
  }

  const sensitive = ['bot/config.js', 'bot/.env', 'bot/sessions/state.json', 'bot/database.json']
  const notIgnored = []
  for (const target of sensitive) {
    if (!fs.existsSync(path.join(ROOT, target)) && !target.endsWith('config.js') && !target.endsWith('database.json')) continue
    try {
      execFileSync('git', ['check-ignore', '-q', target], { cwd: ROOT, stdio: 'pipe' })
    } catch {
      notIgnored.push(target)
    }
  }
  if (notIgnored.length) {
    fail(scope, 'File sensitif tidak diabaikan git', `Tambahkan ke .gitignore: ${notIgnored.join(', ')}`)
  } else {
    pass(scope, 'config.js, .env, sessions, database.json semuanya diabaikan git')
  }

  try {
    const tracked = execFileSync('git', ['ls-files', '--', 'bot/config.js', 'bot/sessions', 'bot/.env'], {
      cwd: ROOT,
      encoding: 'utf8',
    }).trim()
    if (tracked) fail(scope, 'Ada file rahasia yang sudah ter-track git', tracked.split('\n').join(', '))
    else pass(scope, 'Tidak ada config/session/env yang ter-track git')
  } catch {
    warn(scope, 'Tidak bisa memverifikasi git track (bukan repo git?)')
  }

  const ffmpegInstaller = path.join(BOT, 'node_modules', '@ffmpeg-installer')
  if (fs.existsSync(ffmpegInstaller) || process.env.FFMPEG_PATH) pass(scope, 'FFmpeg tersedia')
  else warn(scope, 'FFmpeg tidak terdeteksi', 'Fitur audio/video bisa gagal. Set FFMPEG_PATH atau pasang ffmpeg.')
}

/* -------------------------------------------------------- WEBSITE */

function checkWebsite() {
  const scope = 'WEBSITE'

  const envFiles = ['.env.local', '.env.production', '.env']
    .map(name => path.join(WEBSITE, name))
    .filter(fs.existsSync)

  const env = Object.assign({}, ...envFiles.map(f => parseEnvFile(f) || {}))
  const source = envFiles.length ? envFiles.map(f => path.basename(f)).join(', ') : 'tidak ada file env'

  if (!envFiles.length) {
    warn(scope, 'Belum ada file .env lokal', 'Normal saat produksi: env diisi di dashboard Vercel.')
  }

  const gist = env.UMI_CONFIG_GIST_URL || process.env.UMI_CONFIG_GIST_URL
  const origin = env.UMI_API_ORIGIN || process.env.UMI_API_ORIGIN

  if (!gist && !origin) {
    warn(scope, 'UMI_CONFIG_GIST_URL / UMI_API_ORIGIN belum diisi', `Dicek dari: ${source}`)
  } else {
    if (gist && /gist\.githubusercontent\.com\/.+\/raw\//.test(gist)) pass(scope, 'UMI_CONFIG_GIST_URL format raw terdeteksi benar')
    else if (gist) warn(scope, 'UMI_CONFIG_GIST_URL bukan URL raw Gist', 'Gunakan tautan .../raw/umi-server-config.json')

    if (origin && !/^https:\/\/[^/]+$/.test(origin)) {
      fail(scope, 'UMI_API_ORIGIN harus origin HTTPS tanpa path', `Nilai saat ini: ${origin}`)
    } else if (origin) {
      pass(scope, 'UMI_API_ORIGIN berupa origin HTTPS')
      if (/pterodactyl|panel|\d+\.\d+\.\d+\.\d+/.test(origin)) {
        fail(scope, 'UMI_API_ORIGIN menunjuk panel/IP mentah', 'Harus origin bot API di balik TLS, bukan panel Pterodactyl.')
      }
    }
  }

  for (const key of ['BACKUP_CRON_SECRET', 'BOT_BACKUP_EXPORT_SECRET']) {
    const value = env[key] || process.env[key]
    if (!value) warn(scope, `${key} belum diisi`, 'Hanya diperlukan untuk fitur backup terjadwal.')
    else if (value.length < 24) fail(scope, `${key} terlalu pendek`, 'Gunakan minimal 24 karakter acak.')
    else pass(scope, `${key} terisi (${value.length} karakter)`)
  }

  const apiDir = path.join(WEBSITE, 'api')
  const apiFiles = fs.existsSync(apiDir) ? fs.readdirSync(apiDir).filter(f => f.endsWith('.js')) : []
  let syntaxOk = true
  for (const file of apiFiles) {
    try {
      execFileSync(process.execPath, ['--check', path.join(apiDir, file)], { stdio: 'pipe' })
    } catch (error) {
      syntaxOk = false
      fail(scope, `Syntax error di api/${file}`, String(error.stderr || '').slice(0, 200))
    }
  }
  if (syntaxOk && apiFiles.length) pass(scope, `${apiFiles.length} Vercel Function lolos syntax check`)

  const vercelJson = path.join(WEBSITE, 'vercel.json')
  if (fs.existsSync(vercelJson)) {
    try {
      const cfg = JSON.parse(readIfExists(vercelJson))
      pass(scope, `vercel.json valid (${(cfg.rewrites || []).length} rewrite, ${Object.keys(cfg.functions || {}).length} function)`)
    } catch (error) {
      fail(scope, 'vercel.json tidak valid JSON', error.message)
    }
  }

  const engines = JSON.parse(readIfExists(path.join(WEBSITE, 'package.json')) || '{}').engines || {}
  if (engines.node && !engines.node.includes(String(nodeMajor()))) {
    warn(
      scope,
      `Website minta Node ${engines.node}, lokal kamu ${process.versions.node}`,
      'Vercel memakai versi di package.json; lokal boleh berbeda.'
    )
  } else if (engines.node) {
    pass(scope, `Node ${engines.node} sesuai`)
  }

  if (fs.existsSync(path.join(WEBSITE, '.backup-snapshot', 'website-source.tar.gz')))
    pass(scope, 'Snapshot backup website tersedia untuk api/backup-cron')
  else warn(scope, 'Snapshot backup belum dibuat', 'Jalankan: npm run backup:snapshot (hanya bila memakai cron backup).')
}

/* ----------------------------------------------------------- main */

console.log('Usanagi Umi — preflight check')
console.log(`Root     : ${ROOT}`)
console.log(`Runtime  : Node ${process.versions.node}`)
console.log('')

if (only === 'all' || only === 'bot') checkBot()
if (only === 'all' || only === 'website') checkWebsite()

const order = { FAIL: 0, WARN: 1, PASS: 2 }
results.sort((a, b) => a.scope.localeCompare(b.scope) || order[a.level] - order[b.level])

const icon = { PASS: '[ OK ]', WARN: '[WARN]', FAIL: '[FAIL]' }
for (const row of results) {
  console.log(`${icon[row.level]} ${row.scope.padEnd(7)} ${row.title}`)
  if (row.detail) console.log(`         └─ ${row.detail}`)
}

const fails = results.filter(r => r.level === 'FAIL').length
const warns = results.filter(r => r.level === 'WARN').length
console.log('')
console.log(`Ringkasan: ${results.filter(r => r.level === 'PASS').length} lulus · ${warns} peringatan · ${fails} gagal`)
process.exit(fails ? 1 : 0)
