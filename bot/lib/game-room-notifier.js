/**
 * PENJAGA ROOM GAME — mengantar notifikasi game web ke WhatsApp.
 *
 * Alur: game web (container yang sama) menyimpan antrean notifikasi room,
 * lalu modul ini memanennya tiap 25 detik lewat `GET /api/notify/pending`
 * (Bearer token game yang sama dengan plugin game) dan mengirimnya:
 *   - kalau room dibuat dari GRUP  -> kirim ke grup + tag pembuat room (@nomor)
 *   - kalau dari PRIVAT / web      -> kirim DM ke nomor pembuat room
 *
 * Jenis notifikasi: `join` (ada pemain duduk), `idle` (10 menit tanpa
 * aktivitas), `closed` (room ditutup otomatis).
 */
import fs from 'node:fs'

const CONFIG_FILES = ['lib/webgame.json', './lib/webgame.json', '/home/container/lib/webgame.json']
const POLL_MS = 25 * 1000
let timer = null
let busy = false
let configCache = { at: 0, value: null }

function loadConfig() {
  if (configCache.value && Date.now() - configCache.at < 30000) return configCache.value
  let parsed = {}
  for (const file of CONFIG_FILES) {
    try { parsed = JSON.parse(fs.readFileSync(file, 'utf8')); break } catch {}
  }
  const token = String(parsed.token || process.env.UMI_GAME_TOKEN || '').trim()
  let baseUrl = String(parsed.baseUrl || process.env.UMI_GAME_BASE || '').trim()
  if (!baseUrl) {
    try { baseUrl = 'http://127.0.0.1:' + (process.env.GAME_PORT || '3900') } catch { baseUrl = 'https://game.gwenna.my.id' }
  }
  baseUrl = baseUrl.replace(/\/+$/, '')
  configCache = { at: Date.now(), value: { enabled: parsed.enabled !== false, baseUrl, token } }
  return configCache.value
}

async function harvest() {
  if (busy) return
  const conn = global.conn
  if (!conn || !conn.user) return
  const cfg = loadConfig()
  if (!cfg.enabled || !cfg.token) return
  busy = true
  try {
    const res = await fetch(`${cfg.baseUrl}/api/notify/pending`, {
      headers: { Authorization: `Bearer ${cfg.token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return
    const data = await res.json().catch(() => ({}))
    for (const item of data.items || []) {
      try { await deliver(conn, item) } catch (error) { console.log('[room-notify] gagal kirim:', error?.message || error) }
    }
  } catch (error) {
    /* Server game kadang restart — diamkan saja, percobaan berikutnya menyusul. */
    if (!/abort|timeout|fetch failed/i.test(String(error?.message || ''))) console.log('[room-notify]', error?.message || error)
  } finally {
    busy = false
  }
}

async function deliver(conn, item) {
  const text = String(item.text || '').trim()
  if (!text) return
  const number = String(item.number || '').replace(/\D/g, '')
  const sender = String(item.sender || (number ? number + '@s.whatsapp.net' : ''))
  if (item.isGroup && item.chat) {
    const tag = sender.includes('@') ? sender : `${number}@s.whatsapp.net`
    const digits = tag.split('@')[0]
    await conn.sendMessage(item.chat, { text: `@${digits} ${text}`, mentions: [tag] })
    return
  }
  const to = sender || (number ? `${number}@s.whatsapp.net` : '')
  if (!to) return
  await conn.sendMessage(to, { text })
}

export function startGameRoomNotifier() {
  if (timer) return timer
  timer = setInterval(() => { harvest().catch(() => {}) }, POLL_MS)
  if (timer.unref) timer.unref()
  setTimeout(() => { harvest().catch(() => {}) }, 8000)
  console.log('[room-notify] aktif — cek notifikasi room game tiap 25 detik')
  return timer
}

export function stopGameRoomNotifier() {
  if (timer) clearInterval(timer)
  timer = null
}
