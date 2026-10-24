/**
 * Titik masuk ekosistem multi-aplikasi.
 *
 * Dipanggil dari `main.js` setelah HTTP API bot hidup. Tidak menyentuh socket
 * WhatsApp: adapter Telegram hanya membaca status yang sudah ada.
 */
// Muat `.platform.env` lebih dulu (rahasia tidak dititipkan ke file tracked).
import './env.js'
import { migrate, platformDb } from './db.js'
import { audit, getHealth } from './audit.js'
import * as identity from './identity.js'
import * as bots from './telegram/bots.js'
import { TelegramAdapter } from './telegram/poller.js'
import { pruneExpired } from './media.js'
import { storeStatus } from './rpg.js'
import { stockReady } from './stock.js'
import { mainBotState, listSessions } from './wa.js'
import { secretKey } from './secrets.js'
import * as catalog from './telegram/catalog.js'

const adapters = new Map()
let timer = null
let started = false

// Dipakai `/health` dan `/fitur` untuk melaporkan katalog plugin yang termuat.
globalThis.__umiCatalog = catalog

export function platformState() {
  return {
    started,
    adapters: [...adapters.values()].map(adapter => adapter.status()),
    db: migrate().version,
  }
}

/**
 * Pastikan bot utama dari env terdaftar (token dienkripsi di DB).
 * Idempoten: token hanya disimpan ulang bila berbeda.
 */
async function ensureMainBot(env) {
  const token = String(env.TELEGRAM_BOT_TOKEN || '').trim()
  if (!token) return null
  const existing = bots.getBotRow(bots.MAIN_BOT_ID)
  if (existing?.token_cipher) {
    try {
      const current = bots.botToken(bots.MAIN_BOT_ID, env)
      if (current === token) return bots.MAIN_BOT_ID
    } catch {}
  }
  await bots.saveBot({
    id: bots.MAIN_BOT_ID,
    token,
    label: env.TELEGRAM_BOT_LABEL || 'Bot Utama Platform',
    ownerUserId: 'system',
    scope: 'platform',
    mode: env.TELEGRAM_MODE === 'webhook' ? 'webhook' : 'polling',
    enabled: true,
    env,
  })
  return bots.MAIN_BOT_ID
}

const TELEGRAM_START_DELAYS = [0, 3000, 8000]

/** Coba jalankan adapter beberapa kali dengan jeda; percobaan terakhir dilempar. */
async function startWithRetry(adapter, { logger = console, delays = TELEGRAM_START_DELAYS } = {}) {
  let lastError = null
  for (let attempt = 0; attempt < delays.length; attempt += 1) {
    if (delays[attempt]) await new Promise(resolve => setTimeout(resolve, delays[attempt]))
    try {
      await adapter.start()
      if (attempt > 0) logger.log?.(`[PLATFORM] Telegram berhasil start pada percobaan ke-${attempt + 1}.`)
      return
    } catch (error) {
      lastError = error
      logger.warn?.(`[PLATFORM] Telegram start gagal (percobaan ${attempt + 1}/${delays.length}): ${error.message}`)
    }
  }
  throw lastError
}

export async function startPlatform({ env = process.env, logger = console } = {}) {
  if (started) return platformState()
  migrate()
  const db = platformDb()
  // Global dipakai handler command (audit/bot/user) tanpa impor melingkar.
  globalThis.__umiPlatformDb = platformDb
  globalThis.__umiPlatformAudit = { listAudit: (await import('./audit.js')).listAudit, getHealth }
  globalThis.__umiPlatformIdentity = identity
  globalThis.__umiTelegramBots = bots
  globalThis.__umiPlatformWebUrl = env.PLATFORM_WEB_URL || 'https://jadibot-alzriss.gwenna.my.id'
  globalThis.__umiPlatformPublicBase = env.PLATFORM_PUBLIC_BASE_URL || ''
  globalThis.__umiPlatformReseller = {
    // Belum ada tabel reseller di backend; jangan mengarang angka.
    summary: () => ({ available: false, customers: 0, orders: 0, commission: 0, currency: 'IDR' }),
  }

  let keyOk = true
  try { secretKey(env) } catch (error) {
    keyOk = false
    logger.warn?.('[PLATFORM] ' + error.message + ' — konfigurasi token Telegram tidak akan tersimpan.')
  }

  if (keyOk && env.TELEGRAM_BOT_TOKEN) {
    try {
      const botId = await ensureMainBot(env)
      const row = bots.getBotRow(botId)
      if (row?.enabled) {
        const adapter = new TelegramAdapter({
          botRowId: botId, env, logger,
          baseUrl: env.PLATFORM_PUBLIC_BASE_URL || '',
        })
        adapters.set(botId, adapter)
        // Telegram kadang lambat saat bot baru boot (getMe timeout 12 s). Tanpa
        // percobaan ulang, satu timeout membuat bot Telegram mati sampai
        // restart berikutnya. `start()` yang gagal di init belum membuat loop
        // polling, jadi aman dipanggil ulang (tidak ada dua poller).
        await startWithRetry(adapter, { logger })
      }
    } catch (error) {
      logger.error?.('[PLATFORM] Gagal menjalankan bot Telegram:', error.message)
      audit({ action: 'telegram.start.failed', result: 'failed', meta: { error: error.message } })
    }
  } else if (!env.TELEGRAM_BOT_TOKEN) {
    logger.log?.('[PLATFORM] TELEGRAM_BOT_TOKEN belum diisi — adapter Telegram tidak dijalankan.')
  }

  // Bot tambahan milik user yang aktif (dijalankan berurutan, bukan paralel liar).
  if (keyOk) {
    const rows = db.prepare('SELECT id FROM telegram_bots WHERE enabled = 1 AND id != ?').all(bots.MAIN_BOT_ID)
    for (const row of rows) {
      try {
        const adapter = new TelegramAdapter({ botRowId: row.id, env, logger, baseUrl: env.PLATFORM_PUBLIC_BASE_URL || '' })
        adapters.set(row.id, adapter)
        await adapter.start()
      } catch (error) {
        logger.warn?.(`[PLATFORM] Bot ${row.id} gagal start: ${error.message}`)
      }
    }
  }

  // Pembersihan media kedaluwarsa tiap jam (tanpa dependency scheduler baru).
  timer = setInterval(() => {
    try { pruneExpired() } catch (error) { logger.warn?.('[PLATFORM] prune media:', error.message) }
  }, 60 * 60 * 1000)
  timer.unref?.()

  started = true
  audit({ action: 'platform.start', meta: { adapters: adapters.size, rpg: storeStatus().active, stock: stockReady() } })
  return platformState()
}

export async function stopPlatform({ logger = console } = {}) {
  if (timer) clearInterval(timer)
  timer = null
  for (const adapter of adapters.values()) {
    try { await adapter.stop({ reason: 'shutdown' }) } catch (error) { logger.warn?.('[PLATFORM] stop:', error.message) }
  }
  adapters.clear()
  started = false
}

/** Ringkasan untuk dashboard web & /status. */
export async function platformSummary() {
  const wa = mainBotState()
  return {
    started,
    telegram: {
      adapters: [...adapters.values()].map(adapter => adapter.status()),
      bots: bots.listBots(),
    },
    whatsapp: { ...wa, sessions: listSessions().length },
    rpg: storeStatus(),
    stock: { ready: stockReady() },
    health: getHealth(),
  }
}

export { adapters }
