/*
 *
 * Umi Web Games — jembatan WhatsApp ke server game multiplayer web
 * (db-mirror/game.js, game.gwenna.my.id). Tujuh meja: UNO, UNO Flip, Catur,
 * Ular Tangga, Monopoli, Property Empire, Werewolf.
 *
 * Alur pemain:
 *   1. `.uno`              → bot membuat meja, kirim tautan + id room
 *   2. teman buka tautan    → minta kursi di web (status pending)
 *   3. `.uno join <id>`    → atau klaim langsung dari WhatsApp
 *   4. `.uno <id>`         → verifikasi WhatsApp, bot membalas kode masuk 6 digit
 *   5. kode dimasukkan di halaman room → kursi jadi terverifikasi, boleh main
 *
 * Konfigurasi ada di lib/webgame.json (baseUrl + token). Token JANGAN
 * dimasukkan ke repo — berkas itu hanya ada di server.
 *
 * Catatan teknis: berkas plugin dibatasi ES2020, jadi operator penugasan
 * logis (OR-assign dan nullish-assign) tidak boleh dipakai di sini.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CONFIG_FILE = path.resolve(__dirname, '../../lib/webgame.json')
const TIMEOUT_MS = 20000

/* Nama perintah → id game di server. Akhiran `web` dipakai untuk catur/ular
 * tangga/werewolf karena nama polosnya sudah dimiliki game WhatsApp lama. */
const GAMES = {
  uno: { id: 'uno', label: 'UNO', emoji: '🃏' },
  unoflip: { id: 'unoflip', label: 'UNO Flip', emoji: '🔄' },
  caturweb: { id: 'chess', label: 'Catur Web', emoji: '♟️' },
  utweb: { id: 'snakes', label: 'Ular Tangga Web', emoji: '🎲' },
  monopoli: { id: 'monopoly', label: 'Monopoli Web', emoji: '🏙️' },
  empire: { id: 'empire', label: 'Property Empire', emoji: '🎩' },
  wwweb: { id: 'werewolf', label: 'Werewolf Web', emoji: '🐺' },
}
const COMMANDS = Object.keys(GAMES)
console.log(`[WEBGAME] plugin aktif — ${COMMANDS.length} meja: ${COMMANDS.join(', ')}`)

let configCache = { at: 0, value: null }
function loadConfig() {
  // Dibaca ulang tiap 30 detik supaya perubahan token tidak butuh restart.
  if (configCache.value && Date.now() - configCache.at < 30000) return configCache.value
  let parsed = {}
  try { parsed = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')) } catch {}
  const token = String(parsed.token || process.env.UMI_GAME_TOKEN || '').trim()
  const baseUrl = String(parsed.baseUrl || process.env.UMI_GAME_BASE || 'https://game.gwenna.my.id').replace(/\/+$/, '')
  configCache = { at: Date.now(), value: { enabled: parsed.enabled !== false, baseUrl, token } }
  return configCache.value
}

async function api(cfg, pathname, { method = 'GET', body, asBot = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (asBot) {
    if (!cfg.token) throw 'Token game belum diatur di lib/webgame.json.'
    headers.Authorization = `Bearer ${cfg.token}`
  }
  const res = await fetch(`${cfg.baseUrl}${pathname}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  let data = {}
  try { data = await res.json() } catch {}
  if (!res.ok) throw String(data.error || `Server game membalas HTTP ${res.status}`)
  return data
}

const cleanNumber = (jid) => String(jid || '').split('@')[0].replace(/\D/g, '')
const isRoomId = (value) => /^[A-Za-z0-9]{6,14}$/.test(String(value || ''))
const cleanName = (m) => {
  const user = global.db?.data?.users?.[m.sender]
  const name = String(user?.name || m.pushName || '').trim()
  return name ? name.slice(0, 24) : 'Pemain'
}
const roomUrl = (cfg, game, roomId) => `${cfg.baseUrl}/${game}/${roomId}`

function helpText(usedPrefix) {
  const rows = Object.entries(GAMES)
    .map(([cmd, g]) => `${g.emoji} ${usedPrefix}${cmd.padEnd(10)} — ${g.label}`)
    .join('\n')
  return `🎮 *UMI WEB GAMES*

Main bareng di browser, kendali lewat WhatsApp.

${rows}

*Contoh:*
• ${usedPrefix}uno → buat meja UNO
• ${usedPrefix}uno join <id> → duduk di meja teman
• ${usedPrefix}uno <id> → verifikasi & ambil kode masuk
• ${usedPrefix}webgame room <id> → intip keadaan meja`
}

const STATUS_ID = { lobby: 'menunggu pemain', playing: 'sedang bermain', finished: 'selesai' }

async function createRoom(m, conn, cmd, cfg) {
  const game = GAMES[cmd]
  const number = cleanNumber(m.sender)
  const data = await api(cfg, '/api/rooms', {
    method: 'POST',
    asBot: true,
    body: { game: game.id, name: cleanName(m), number },
  })
  const codeLine = data.entryCode
    ? `\n🔑 Kode masuk kamu: *${data.entryCode}*`
    : ''
  await conn.reply(m.chat, `${game.emoji} *Meja ${game.label} siap!*

🆔 Room: \`${data.roomId}\`
🔗 ${roomUrl(cfg, game.id, data.roomId)}${codeLine}

Buka tautan di atas, isi kode itu → kamu langsung duduk sebagai host.
Teman tinggal buka tautan yang sama, lalu kirim:
\`${cmd} join ${data.roomId}\` ke bot ini, dan verifikasi dengan \`${cmd} ${data.roomId}\`.`, m)
}

async function claimSeat(m, conn, cmd, cfg, roomId) {
  const number = cleanNumber(m.sender)
  const data = await api(cfg, `/api/rooms/${roomId}/claim`, {
    method: 'POST',
    body: { name: cleanName(m), number },
  })
  if (data.status === 'verified') {
    return conn.reply(m.chat, `✅ Kursimu di room \`${roomId}\` sudah terverifikasi. Buka tautan room lalu pakai kode masuk dari \`${cmd} ${roomId}\`.`, m)
  }
  return conn.reply(m.chat, `🪑 Kursi diminta di room \`${roomId}\` (nomor ${number}).
Status: menunggu verifikasi. Ketik \`${cmd} ${roomId}\` untuk memverifikasi lewat WhatsApp.`, m)
}

async function verifySeat(m, conn, cmd, cfg, roomId) {
  const number = cleanNumber(m.sender)
  const data = await api(cfg, `/api/rooms/${roomId}/verify`, {
    method: 'POST',
    asBot: true,
    body: { name: cleanName(m), number },
  })
  const game = GAMES[cmd]
  return conn.reply(m.chat, `🔐 *Verifikasi berhasil* — ${game ? game.label : data.game}

Nomor ${number} sekarang duduk di kursi #${Number(data.seat) + 1}.
🔢 Kode masuk: *${data.entryCode}*

Buka tautan room, isi kode itu di kolom "Kode masuk":
${roomUrl(cfg, data.game, roomId)}`, m)
}

async function showRoom(m, conn, cfg, roomId) {
  const data = await api(cfg, `/api/rooms/${roomId}/state`)
  const game = Object.values(GAMES).find((g) => g.id === data.game) || { label: data.game, emoji: '🎮', id: data.game }
  const seats = (data.seats || [])
    .map((s, i) => `${i + 1}. ${s.name || 'Pemain'} — ${s.kind === 'bot' ? '🤖 bot' : (s.status === 'verified' ? '✅ terverifikasi' : '⏳ menunggu')}`)
    .join('\n')
  return conn.reply(m.chat, `${game.emoji} *Meja ${game.label}* \`${roomId}\`

Status: ${STATUS_ID[data.status] || data.status}
Pemain: ${(data.seats || []).length}
${seats || '(kosong)'}

🔗 ${roomUrl(cfg, data.game, roomId)}`, m)
}

const handler = async (m, { conn, usedPrefix, args, command }) => {
  const cfg = loadConfig()
  if (!cfg.enabled) throw 'Umi Web Games sedang dinonaktifkan.'

  const cmd = String(command || '').toLowerCase()
  const sub = String(args?.[0] || '').toLowerCase()
  const target = String(args?.[1] || '')

  // `.webgame` → bantuan & pemeriksaan kesehatan layanan
  if (cmd === 'webgame') {
    if (sub === 'room' && isRoomId(target)) return showRoom(m, conn, cfg, target)
    if (sub === 'verify' && isRoomId(target)) return verifySeat(m, conn, 'webgame', cfg, target)
    if (sub === 'join' && isRoomId(target)) {
      const state = await api(cfg, `/api/rooms/${target}/state`)
      const key = Object.keys(GAMES).find((k) => GAMES[k].id === state.game) || 'uno'
      return claimSeat(m, conn, key, cfg, target)
    }
    let health = 'tidak diketahui'
    try {
      const h = await api(cfg, '/health')
      health = `aktif — ${h.rooms} meja berjalan, ${h.games.length} permainan`
    } catch (error) { health = `gangguan (${String(error.message || error).slice(0, 60)})` }
    return conn.reply(m.chat, `${helpText(usedPrefix)}\n\n🛰️ Server: ${health}`, m)
  }

  if (!GAMES[cmd]) return
  const roomId = String(args?.[0] || '')

  // `<cmd>` tanpa argumen → buat meja baru
  if (!roomId) return createRoom(m, conn, cmd, cfg)
  // `<cmd> join <id>` → minta kursi
  if (sub === 'join' && isRoomId(target)) return claimSeat(m, conn, cmd, cfg, target)
  // `<cmd> <id>` → verifikasi WhatsApp, balas kode masuk
  if (isRoomId(roomId)) return verifySeat(m, conn, cmd, cfg, roomId)

  throw `Room id tidak dikenal. Contoh: ${usedPrefix}${cmd} join <id-room>`
}

handler.help = ['webgame', ...COMMANDS]
handler.tags = ['game']
handler.command = new RegExp(`^(${['webgame', ...COMMANDS].join('|')})$`, 'i')
// Tidak wajib daftar: bot utama maupun sesi jadibot harus bisa langsung buka meja.
handler.register = false
handler.limit = false

export default handler
