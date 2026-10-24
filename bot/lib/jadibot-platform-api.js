import { platformSessions } from './jadibot-platform-state.js'
import { handleBackupApi } from './backup/api.js'
import { handlePlatformApi } from './platform/api.js'
import { createRealmHttp } from './realms/http.js'
import { realmService } from './realms/runtime.js'
import { getDb } from '../core/awang-sqlite.js'
import { summarizeLegacyCurrency } from './rpg/legacy-migration-plan.js'
import { unifiedRpg } from './rpg/unified-store.js'
import { backupUnifiedRpg } from './rpg/unified-runtime.js'
import { getGroqSettings, persistGroqRuntimeConfig, clearGroqRuntimeConfig } from './groq-client.js'
import { getGeminiSettings, isValidGeminiKey, persistGeminiRuntimeConfig, clearGeminiRuntimeConfig } from './gemini-client.js'
import { applyMainBotSettingsInput, mainBotSettingsView, resetMainBotSettings } from './main-bot-settings.js'
import { getMenuStyle, setMenuStyle } from '../core/awang-menu-config.js'
const realmHttp = createRealmHttp(realmService)
/* By AlzRiss - Usanagi Umi AI */

import http from 'node:http'
import { handleMediaProxy } from './media-proxy.js'
import { apiKey, saveApiKey, removeApiKey } from '../config/api-keys.js'
import https from 'node:https'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import dns from 'node:dns/promises'
import net from 'node:net'
import syntaxerror from 'syntax-error'
import {
  startSubBotForApi,
  restartSubBot,
  disconnectSubBot,
  stopSubBot,
  hasSubBot,
  getSubBot,
} from './jadibot.js'
import {
  loadJadibotConfig,
  saveJadibotConfig,
  resetJadibotConfig,
  normalizeBotNumber,
  normalizeJadibotOwners,
  lockedJadibotOwnerNumber,
} from './bot-config.js'
import { clearScopedPrefixes } from '../core/awang-prefix.js'
import { koinStatus, convertKoin, numberForToken } from './game-koin-topup.js'
import { parseNewsletterInput } from './awang-id.js'
import {
  getMainPremiumConfig,
  getPremiumSystem,
  normalizePremiumEntries,
  premiumConfigFor,
  resolvePremiumEntry,
  saveMainPremiumConfig,
  searchFeatures,
} from './premium-mode.js'
import { cleanupBackupExport, getBackupExportFile, prepareBackupExport } from './vercel-backup-export.js'
import { agentChat, agentProviderKeyMask, agentStatus, agentTest, ownerAgentShell, startUmiAgentWorker, updateAgentSettings } from './umi-agent.js'
import { buyPanelPackage, buyProduct, createWalletTopup, handleTripayCallback, manualTopupRequests, panelAutoOrderStatus, reviewManualTopup, shopCatalog, startPanelAutoOrder, testPanelConnection, updatePanelPackages, updatePanelSettings, adjustWallet, creditWalletForGame, debitWalletForGame, walletOrders, walletStatus } from './panel-autoorder.js'


const BACKUP_DIR = path.join(process.cwd(), 'data', 'jadibot-backups')
const SESSION_DIR = path.join(process.cwd(), 'sessions', 'jadibot')
const CUSTOM_PLUGIN_DIR = path.join(process.cwd(), 'plugins', 'custom')
const SESSION_LOG_LIMIT = 500
const OWNER_CONSOLE_BUFFER_LIMIT = 900
const OWNER_CONSOLE_BUFFER_BYTES = 768 * 1024
import { readMainBotState, normalizeMainBotNumber } from './main-bot-config.js'

const OWNER_CONSOLE_RELAY_FILE = path.join(process.cwd(), '.owner-console-relay.env')
const tokenCache = new Map()
const rateLimits = new Map()
const ownerConsole = globalThis.__usanagiOwnerConsole || { cursor: 0, chunks: [], bytes: 0, captureInstalled: false }
globalThis.__usanagiOwnerConsole = ownerConsole
let ownerConsoleRelaySecret = null
let server = null

const nowIso = () => new Date().toISOString()
const safeText = (value, max = 200) => String(value ?? '').trim().slice(0, max)

function appendOwnerConsole(chunk) {
  const text = Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk ?? '')
  if (!text) return
  const clipped = text.slice(-64 * 1024)
  ownerConsole.cursor += 1
  ownerConsole.chunks.push({ cursor: ownerConsole.cursor, text: clipped })
  ownerConsole.bytes += Buffer.byteLength(clipped)
  while (ownerConsole.chunks.length > OWNER_CONSOLE_BUFFER_LIMIT || ownerConsole.bytes > OWNER_CONSOLE_BUFFER_BYTES) {
    const removed = ownerConsole.chunks.shift()
    ownerConsole.bytes -= Buffer.byteLength(removed?.text || '')
  }
}

function installOwnerConsoleCapture() {
  if (ownerConsole.captureInstalled) return
  ownerConsole.captureInstalled = true
  for (const stream of [process.stdout, process.stderr]) {
    if (!stream || typeof stream.write !== 'function') continue
    const originalWrite = stream.write
    stream.write = function ownerConsoleWrite(chunk, ...args) {
      try { appendOwnerConsole(chunk) } catch {}
      return originalWrite.call(this, chunk, ...args)
    }
  }
}

function ownerConsoleRelayKey() {
  if (ownerConsoleRelaySecret) return ownerConsoleRelaySecret
  let source = ''
  try {
    source = fs.readFileSync(OWNER_CONSOLE_RELAY_FILE, 'utf8')
    // The file is provisioned remotely and never included in code/config backups.
    try { fs.chmodSync(OWNER_CONSOLE_RELAY_FILE, 0o600) } catch {}
  } catch {
    throw Object.assign(new Error('Relay console owner belum dikonfigurasi.'), { status: 503 })
  }
  const match = source.match(/^UMI_CONSOLE_RELAY_SECRET=([^\r\n]+)$/m)
  const secret = String(match?.[1] || '').trim()
  if (secret.length < 32) throw Object.assign(new Error('Relay console owner tidak valid.'), { status: 503 })
  ownerConsoleRelaySecret = secret
  return ownerConsoleRelaySecret
}

const ownerTicketNonces = new Map()
function verifyOwnerRelayTicket(req, header, audience, pathname = '') {
  const token = String(req.headers[header] || '').trim()
  const [body, signature] = token.split('.')
  if (!body || !signature || token.split('.').length !== 2) throw Object.assign(new Error('Akses owner tidak sah.'), { status: 401 })
  const expected = crypto.createHmac('sha256', ownerConsoleRelayKey()).update(body).digest('base64url')
  const actualBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (actualBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(actualBuffer, expectedBuffer)) throw Object.assign(new Error('Akses owner tidak sah.'), { status: 401 })
  let payload
  try { payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) } catch { throw Object.assign(new Error('Tiket owner tidak valid.'), { status: 401 }) }
  const now = Date.now()
  // A brief console-only compatibility path lets the existing Website console
  // continue during a bot-first rollout. Owner-agent tickets always require
  // an explicit audience and can never be used as console tickets.
  const legacyConsole = audience === 'owner-console' && payload?.aud === undefined && payload?.m === undefined
  const audienceValid = payload?.aud === audience || legacyConsole
  if (payload?.v !== 1 || !audienceValid || !/^[A-Za-z0-9_-]{8,128}$/.test(String(payload?.sub || '')) || !Number.isFinite(payload?.exp) || payload.exp <= now || payload.exp > now + 3 * 60 * 1000) {
    throw Object.assign(new Error('Tiket owner kedaluwarsa atau tidak valid.'), { status: 401 })
  }
  if (!legacyConsole) {
    // SEC-12: tiket hanya sah untuk method + path yang ditandatangani.
    const prefix = `/api/${audience}/`
    const boundPath = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : ''
    if (String(payload.m || '').toUpperCase() !== String(req.method || '').toUpperCase() || String(payload.p || '') !== boundPath) {
      throw Object.assign(new Error('Tiket owner tidak cocok dengan tujuan permintaan.'), { status: 401 })
    }
    const nonce = String(payload.nonce || '')
    if (!/^[A-Za-z0-9_-]{8,64}$/.test(nonce)) throw Object.assign(new Error('Tiket owner tidak valid.'), { status: 401 })
    const seenKey = `${payload.sub}:${nonce}`
    if (ownerTicketNonces.has(seenKey)) throw Object.assign(new Error('Tiket owner sudah dipakai.'), { status: 401 })
    ownerTicketNonces.set(seenKey, payload.exp)
    if (ownerTicketNonces.size > 5000) {
      for (const [key, exp] of ownerTicketNonces) if (!(exp > now)) ownerTicketNonces.delete(key)
    }
  }
  return payload
}

function verifyOwnerConsoleTicket(req, pathname) {
  return verifyOwnerRelayTicket(req, 'x-umi-console-ticket', 'owner-console', pathname)
}

function verifyOwnerAgentTicket(req, pathname) {
  return verifyOwnerRelayTicket(req, 'x-umi-agent-ticket', 'owner-agent', pathname)
}

function verifyOwnerPanelTicket(req, pathname) {
  return verifyOwnerRelayTicket(req, 'x-umi-panel-ticket', 'owner-panel', pathname)
}

function ownerConsoleOutput(cursor = 0) {
  const after = Math.max(0, Math.floor(Number(cursor) || 0))
  const first = ownerConsole.chunks[0]?.cursor || ownerConsole.cursor + 1
  const reset = after > 0 && after < first - 1
  const chunks = ownerConsole.chunks.filter(item => item.cursor > (reset ? 0 : after))
  return { cursor: ownerConsole.cursor, reset, chunks }
}

/* Satu permintaan pairing pada satu waktu. Hasil/alasannya tetap terbaca
 * lewat mainBotStatus() (pairing_code / pairing_error / pairing_pending). */
let backgroundPairingPromise = null
function startBackgroundPairing() {
  if (backgroundPairingPromise) return backgroundPairingPromise
  if (typeof global.requestMainPairing !== 'function') return null
  // Pemanggilan ulang saat masih berjalan sengaja diabaikan supaya WhatsApp
  // tidak dibanjiri permintaan kode.
  backgroundPairingPromise = Promise.resolve()
    .then(() => global.requestMainPairing())
    .catch(error => {
      global.lastPairingError = String(error?.message || 'Pairing gagal.')
      console.log('[MAIN-BOT] Permintaan pairing gagal:', global.lastPairingError)
      return null
    })
    .finally(() => { backgroundPairingPromise = null })
  return backgroundPairingPromise
}

/* ── Setting lengkap bot utama (Task80) ─────────────────────────────────
 * Semua nilai divalidasi di `lib/main-bot-settings.js`. API key tidak pernah
 * ikut dikirim utuh: respons hanya berisi `configured`, model, dan versi mask.
 */

function maskApiKey(value) {
  const key = String(value || '')
  if (key.length < 12) return ''
  return `${key.slice(0, 6)}…${key.slice(-4)}`
}

function apiKeyState() {
  const gemini = getGeminiSettings()
  const groq = getGroqSettings()
  let agent = {}
  try { agent = agentStatus() } catch {}
  let openrouterMasked = ''
  try { openrouterMasked = agentProviderKeyMask('openrouter') } catch {}
  return {
    gemini: {
      provider: 'gemini',
      configured: Boolean(gemini.configured),
      model: gemini.model,
      masked: maskApiKey(gemini.apiKey),
      file: '.env.gemini',
      role: 'Auto-AI utama + AI Agent',
    },
    groq: {
      provider: 'groq',
      configured: Boolean(groq.configured),
      model: groq.model,
      masked: maskApiKey(groq.apiKey),
      file: '.env.groq',
      role: 'Cadangan Auto-AI',
    },
    openrouter: {
      provider: 'openrouter',
      configured: Boolean(openrouterMasked),
      model: agent.provider === 'openrouter' ? String(agent.model || '') : '',
      masked: openrouterMasked,
      file: 'AI Agent (terenkripsi)',
      role: 'AI Agent / AI Owner bila provider OpenRouter dipilih',
    },
    // Kunci pihak ketiga dipusatkan di config/settings.js (lihat config/api-keys.js).
    tenor: {
      provider: 'tenor',
      configured: Boolean(apiKey('tenor')),
      model: '',
      masked: maskApiKey(apiKey('tenor')),
      file: '.env.apikeys',
      role: 'Pencarian GIF (Tenor)',
    },
    pastebin: {
      provider: 'pastebin',
      configured: Boolean(apiKey('pastebin')),
      model: '',
      masked: maskApiKey(apiKey('pastebin')),
      file: '.env.apikeys',
      role: 'Upload teks ke Pastebin',
    },
    neuralframes: {
      provider: 'neuralframes',
      configured: Boolean(apiKey('neuralFrames')),
      model: '',
      masked: maskApiKey(apiKey('neuralFrames')),
      file: '.env.apikeys',
      role: 'Image to Prompt (NeuralFrames)',
    },
  }
}

function mainBotSettingsResponse() {
  const settings = mainBotSettingsView()
  settings.menu_style = getMenuStyle()
  settings.premium = getMainPremiumConfig()
  settings.premium_system = getPremiumSystem()
  return { ok: true, settings, api_keys: apiKeyState(), status: mainBotStatus() }
}

function validatePremiumPluginList(input) {
  if (!Array.isArray(input)) throw Object.assign(new Error('Daftar fitur premium harus berupa array.'), { status: 400 })
  if (input.length > 300) throw Object.assign(new Error('Maksimum 300 fitur premium.'), { status: 400 })
  const plugins = normalizePremiumEntries(input.map(item => safeText(item, 120)))
  const unknown = []
  for (const entry of plugins) {
    const resolved = resolvePremiumEntry(entry)
    if (!resolved.ok) unknown.push(resolved)
  }
  if (unknown.length) {
    const hints = unknown.slice(0, 5).map(item => {
      const suggestions = (item.suggestions || []).slice(0, 2)
        .map(feature => `${feature.commands[0] || feature.basename.replace(/\.js$/, '')}`)
        .join(', ')
      return suggestions ? `${item.entry} (mungkin: ${suggestions})` : item.entry
    })
    throw Object.assign(new Error(`Fitur premium tidak dikenal: ${hints.join('; ')}`), { status: 400 })
  }
  return plugins
}

async function routeOwnerConsole(req, res, pathname) {
  verifyOwnerConsoleTicket(req, pathname)
  const url = new URL(req.url, 'http://localhost')
  if (pathname === '/api/owner-console/rpg-backup' && req.method === 'POST') {
    if (limited('owner-rpg-backup', 2, 60000)) throw Object.assign(new Error('Tunggu sebelum membuat backup berikutnya.'), { status: 429 })
    return send(res, 200, { ok: true, ...await backupUnifiedRpg() })
  }
  if (pathname === '/api/owner-console/auto-ai-status' && req.method === 'GET') {
    const { configured, enabled, model } = getGroqSettings()
    return send(res, 200, { configured, enabled, model, provider: 'groq' })
  }
  if (pathname === '/api/owner-console/rpg-unification' && req.method === 'GET') {
    const users = global.db?.data?.users
    if (!users || typeof users !== 'object' || Array.isArray(users)) throw Object.assign(new Error('Database legacy belum siap.'), { status: 503 })
    const store = unifiedRpg()
    if (store) { const status = store.status(); return send(res, 200, { ...status, stage: 'live-unified', currencyConversionApplied: true, legacySpendAdapterEnabled: true, verifiedProgressUnified: true, progressUnificationComplete: status.heldRecords === 0 && status.pendingPetReviews === 0 }) }
    return send(res, 200, summarizeLegacyCurrency(getDb(), users))
  }
  // Task83: status + jalankan manual auto-backup harian (tujuan group Telegram).
  // POST langsung balas 202 karena mengunggah arsip bisa beberapa menit.
  if (pathname === '/api/owner-console/auto-backup') {
    const { autoBackupSnapshot, runFullBackup } = await import('./auto-backup.js')
    if (req.method === 'GET') return send(res, 200, { ok: true, ...(await autoBackupSnapshot()) })
    if (req.method === 'POST') {
      if (limited('owner-auto-backup', 1, 5 * 60 * 1000)) throw Object.assign(new Error('Tunggu 5 menit sebelum menjalankan backup lagi.'), { status: 429 })
      const snapshot = await autoBackupSnapshot()
      if (snapshot.running) return send(res, 409, { ok: false, reason: 'already-running', snapshot })
      runFullBackup({ force: true, reason: 'owner-console' })
        .catch(error => console.error('[AUTO-BACKUP] gagal dijalankan dari console:', error.message))
      return send(res, 202, { ok: true, started: true })
    }
  }
  if (pathname === '/api/owner-console/status' && req.method === 'GET') return send(res, 200, mainBotStatus())
  if (pathname === '/api/owner-console/logs' && req.method === 'GET') return send(res, 200, ownerConsoleOutput(url.searchParams.get('cursor')))
  // Log error terstruktur (data/errors/*.jsonl) — dipakai agen/owner untuk
  // membaca error tanpa menebak dari stdout yang cepat tertimpa.
  if (pathname === '/api/owner-console/errors' && req.method === 'GET') {
    const { readRecentErrors } = await import('./error-hub.js')
    const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit')) || 20))
    return send(res, 200, { ok: true, ...readRecentErrors({ limit, day: url.searchParams.get('day') || null }) })
  }
  if (pathname === '/api/owner-console/input' && req.method === 'POST') {
    const input = String((await bodyJson(req)).input ?? '')
    if (!input || input.length > 4096 || input.includes(' ')) throw Object.assign(new Error('Input console tidak valid.'), { status: 400 })
    if (!global.pairingInputShown || process.stdin.listenerCount('data') < 1) throw Object.assign(new Error('Bot utama belum menunggu input console.'), { status: 409 })
    // Input is delivered only to the active Node console prompt. It is not
    // written to stdout, audit records, files, or the console history buffer.
    process.stdin.emit('data', Buffer.from(`${input}
`, 'utf8'))
    return send(res, 200, { ok: true })
  }

  // Nomor bot utama disimpan permanen (mode 600) supaya pairing tidak lagi
  // bergantung pada prompt console yang bisa tertutup saat socket reconnect.
  if (pathname === '/api/owner-console/pairing-number' && req.method === 'POST') {
    const input = await bodyJson(req)
    const number = normalizeMainBotNumber(input.number)
    if (number.length < 8 || number.length > 15) throw Object.assign(new Error('Nomor bot utama tidak valid.'), { status: 400 })
    if (typeof global.applyMainPairingNumber !== 'function') throw Object.assign(new Error('Runtime bot belum siap menerima nomor.'), { status: 503 })
    global.applyMainPairingNumber(number)
    if (!global.mainBotEnabled && typeof global.setMainBotEnabled === 'function') {
      await global.setMainBotEnabled(true)
    }
    // Task77: permintaan kode dijalankan di latar belakang. Respons tetap cepat
    // (website memantau status setiap 2 detik), jadi relay Vercel tidak kena
    // timeout saat socket WhatsApp butuh waktu untuk siap.
    if (input.request !== false && !global.conn?.authState?.creds?.registered) {
      startBackgroundPairing()
    }
    return send(res, 200, {
      ok: true,
      pairing_code: global.lastPairingCode?.code || '',
      pairing_error: global.lastPairingError || '',
      status: mainBotStatus(),
    })
  }

  // Tombol "MINTA CODE LAGI" — nomor tidak berubah, hanya meminta kode baru.
  if (pathname === '/api/owner-console/pairing-request' && req.method === 'POST') {
    if (typeof global.requestMainPairing !== 'function') throw Object.assign(new Error('Runtime bot belum siap.'), { status: 503 })
    startBackgroundPairing()
    return send(res, 200, { ok: true, pairing_code: global.lastPairingCode?.code || '', status: mainBotStatus() })
  }

  // Hapus sesi WhatsApp bot utama — dipakai saat sesi rusak/logout agar bisa
  // pairing ulang. Sesi jadibot tidak ikut terhapus.
  if (pathname === '/api/owner-console/main-session' && req.method === 'POST') {
    if (typeof global.resetMainBotSession !== 'function') throw Object.assign(new Error('Runtime bot belum siap.'), { status: 503 })
    const result = await global.resetMainBotSession()
    // Setelah sesi bersih, minta kode baru di latar belakang bila nomor sudah
    // tersimpan. Kalau belum ada nomor, cukup siapkan ulang socket.
    if (mainBotStateForStatus().pairingNumber && global.mainBotEnabled) startBackgroundPairing()
    else if (typeof global.reloadHandler === 'function') { try { await global.reloadHandler(true) } catch {} }
    return send(res, 200, { ok: true, removed: result?.removed || 0, pairing_code: global.lastPairingCode?.code || '', pairing_error: global.lastPairingError || '', status: mainBotStatus() })
  }

  // Reset konfigurasi bot utama (.main-bot.env): nomor pairing + status on/off.
  if (pathname === '/api/owner-console/main-config' && req.method === 'POST') {
    if (typeof global.resetMainBotConfig !== 'function') throw Object.assign(new Error('Runtime bot belum siap.'), { status: 503 })
    const result = await global.resetMainBotConfig()
    // Konfigurasi baru (tanpa nomor) butuh socket bersih; muat ulang handler
    // supaya tombol SIMPAN & MINTA CODE berikutnya tidak kena socket mati.
    if (typeof global.reloadHandler === 'function') { try { await global.reloadHandler(true) } catch {} }
    return send(res, 200, { ok: true, ...result, status: mainBotStatus() })
  }

  if (pathname === '/api/owner-console/autoread' && req.method === 'GET') {
    return send(res, 200, { ok: true, ...readAutoreadState() })
  }

  if (pathname === '/api/owner-console/autoread' && req.method === 'POST') {
    const input = await bodyJson(req)
    if (typeof input.enabled !== 'boolean') throw Object.assign(new Error('Nilai enabled harus true atau false.'), { status: 400 })
    const state = await setAutoreadState(input.enabled)
    return send(res, 200, { ok: true, ...state, status: mainBotStatus() })
  }

  if (pathname === '/api/owner-console/main-bot' && req.method === 'POST') {
    const input = await bodyJson(req)
    if (typeof input.enabled !== 'boolean') throw Object.assign(new Error('Nilai enabled harus true atau false.'), { status: 400 })
    if (typeof global.setMainBotEnabled !== 'function') throw Object.assign(new Error('Runtime bot belum siap.'), { status: 503 })
    const result = await global.setMainBotEnabled(input.enabled)
    return send(res, 200, { ok: true, enabled: result.enabled, status: mainBotStatus() })
  }

  /* Setting lengkap bot utama — semua role yang lolos tiket owner-console
   * (owner, partner, developer) boleh membaca dan menyimpan. */
  if (pathname === '/api/owner-console/settings' && req.method === 'GET') {
    return send(res, 200, mainBotSettingsResponse())
  }

  if (pathname === '/api/owner-console/settings' && req.method === 'POST') {
    const input = await bodyJson(req)
    let menuStyle = ''
    if (input.menu_style !== undefined) {
      menuStyle = String(input.menu_style || '').toLowerCase()
      if (!['default', 'modern'].includes(menuStyle)) {
        throw Object.assign(new Error('Gaya menu harus default atau modern.'), { status: 400 })
      }
    }
    let premiumPlugins = null
    if (input.premium_plugins !== undefined) premiumPlugins = validatePremiumPluginList(input.premium_plugins)
    if (input.premium_enabled !== undefined && typeof input.premium_enabled !== 'boolean') {
      throw Object.assign(new Error('Mode Premium ON/OFF harus true atau false.'), { status: 400 })
    }
    await applyMainBotSettingsInput(input, { actor: 'website-console' })
    if (menuStyle) setMenuStyle(menuStyle)
    if (input.premium_enabled !== undefined || premiumPlugins) {
      saveMainPremiumConfig({
        ...(input.premium_enabled !== undefined ? { enabled: input.premium_enabled } : {}),
        ...(premiumPlugins ? { plugins: premiumPlugins } : {}),
        updatedBy: 'website-console',
      })
    }
    return send(res, 200, mainBotSettingsResponse())
  }

  if (pathname === '/api/owner-console/settings/reset' && req.method === 'POST') {
    await resetMainBotSettings({ actor: 'website-console' })
    return send(res, 200, mainBotSettingsResponse())
  }

  /* API key: hanya status + mask yang pernah keluar dari server. */
  if (pathname === '/api/owner-console/apikey' && req.method === 'POST') {
    const input = await bodyJson(req)
    const provider = String(input.provider || '').toLowerCase()
    if (!['gemini', 'groq', 'openrouter', 'tenor', 'pastebin', 'neuralframes'].includes(provider)) {
      throw Object.assign(new Error('Provider API key tidak dikenal.'), { status: 400 })
    }
    const remove = input.delete === true
    if (provider === 'gemini') {
      if (remove) {
        clearGeminiRuntimeConfig()
      } else {
        const key = String(input.api_key || '').trim()
        if (!isValidGeminiKey(key)) {
          throw Object.assign(new Error('Format key Gemini tidak valid. Contoh: AIza… atau AQ.…'), { status: 400 })
        }
        persistGeminiRuntimeConfig({ apiKey: key })
      }
    } else if (provider === 'groq') {
      if (remove) {
        clearGroqRuntimeConfig()
      } else {
        const key = String(input.api_key || '').trim()
        if (!/^gsk_[A-Za-z0-9_-]{20,200}$/.test(key)) {
          throw Object.assign(new Error('Format key Groq tidak valid (diawali gsk_).'), { status: 400 })
        }
        persistGroqRuntimeConfig({ apiKey: key, model: getGroqSettings().model })
      }
    } else if (['tenor', 'pastebin', 'neuralframes'].includes(provider)) {
      // Kunci pihak ketiga: semua fitur membacanya lewat config/settings.js.
      const name = provider === 'neuralframes' ? 'neuralFrames' : provider
      if (remove) removeApiKey(name)
      else saveApiKey(name, String(input.api_key || ''))
    } else if (remove) {
      throw Object.assign(new Error('Key OpenRouter belum bisa dihapus dari sini. Isi key baru untuk menggantinya, atau kelola lewat AI Owner.'), { status: 400 })
    } else {
      const key = String(input.api_key || '').trim()
      if (!/^sk-or-v1-[A-Za-z0-9_-]{16,200}$/.test(key)) {
        throw Object.assign(new Error('Format key OpenRouter tidak valid (diawali sk-or-v1-).'), { status: 400 })
      }
      updateAgentSettings({ apiKey: key, provider: 'openrouter', model: '' }, 'website-mainbot')
    }
    return send(res, 200, { ok: true, provider, deleted: remove, api_keys: apiKeyState() })
  }

  return send(res, 404, { error: 'Endpoint console owner tidak ditemukan.' })
}


// The Website platform validates a Supabase-backed owner role before it
// forwards this audience-bound ticket. Browser role claims never authorize
// configuration, server tools, or a terminal at the bot runtime.
async function routeOwnerAgent(req, res, pathname) {
  const ticket = verifyOwnerAgentTicket(req, pathname)
  const actor = `owner:${ticket.sub}`
  if (pathname === '/api/owner-agent/status' && req.method === 'GET') return send(res, 200, agentStatus())
  if (pathname === '/api/owner-agent/chat' && req.method === 'POST') {
    const input = await bodyJson(req)
    return send(res, 200, await agentChat({ userId: actor, prompt: input.prompt, owner: true }))
  }
  if (pathname === '/api/owner-agent/settings' && req.method === 'POST') {
    const input = await bodyJson(req)
    return send(res, 200, updateAgentSettings(input, actor))
  }
  // Tes koneksi provider AI (dipakai tombol "TES KONEKSI AI").
  if (pathname === '/api/owner-agent/test' && req.method === 'POST') {
    return send(res, 200, await agentTest(actor))
  }
  if (pathname === '/api/owner-agent/shell' && req.method === 'POST') {
    const input = await bodyJson(req)
    return send(res, 200, await ownerAgentShell(input.command, actor))
  }
  return send(res, 404, { error: 'Endpoint agent owner tidak ditemukan.' })
}


// The panel-commerce relay is separate from the agent audience. It accepts
// only short-lived tickets minted after Website owner-role verification.
async function routeOwnerPanel(req, res, pathname) {
  const ticket = verifyOwnerPanelTicket(req, pathname)
  const actor = `owner:${ticket.sub}`
  if (pathname === '/api/owner-panel/status' && req.method === 'GET') return send(res, 200, panelAutoOrderStatus())
  if (pathname === '/api/owner-panel/settings' && req.method === 'POST') {
    const input = await bodyJson(req)
    return send(res, 200, await updatePanelSettings(input, actor))
  }
  if (pathname === '/api/owner-panel/packages' && req.method === 'POST') {
    const input = await bodyJson(req)
    return send(res, 200, updatePanelPackages(input, actor))
  }
  if (pathname === '/api/owner-panel/test-connection' && req.method === 'POST') {
    return send(res, 200, await testPanelConnection(actor))
  }
  if (pathname === '/api/owner-panel/wallet-adjust' && req.method === 'POST') {
    const input = await bodyJson(req)
    return send(res, 200, adjustWallet({ userId: input.userId, amount: input.amount, reference: input.reference, description: input.description, actor }))
  }
  if (pathname === '/api/owner-panel/manual-topups' && req.method === 'GET') {
    return send(res, 200, { topups: manualTopupRequests() })
  }
  if (pathname === '/api/owner-panel/manual-topups/review' && req.method === 'POST') {
    const input = await bodyJson(req)
    return send(res, 200, reviewManualTopup({ id: input.id, decision: input.decision, actor }))
  }
  return send(res, 404, { error: 'Endpoint Panel owner tidak ditemukan.' })
}

installOwnerConsoleCapture()

/* ── Konversi saldo Wallet (Rp) → $AS untuk game web ───────────────────────
 * Alur: token akun → verify-token (website) → potong saldo Rp → kredit $AS di
 * database game (via GAME_INTERNAL_URL + GAME_TOKEN). Idempoten per referensi. */
const GAME_VERIFY_URL = String(process.env.UMI_GAME_VERIFY_URL || 'https://jadibot-alzriss.gwenna.my.id/api/platform/verify-token').trim()
const GAME_INTERNAL_URL = String(process.env.UMI_GAME_INTERNAL_URL || 'http://127.0.0.1:3900').trim().replace(/\/+$/, '')
const GAME_INTERNAL_TOKEN = String(process.env.UMI_GAME_TOKEN || process.env.GAME_TOKEN || '').trim()
const GAME_TOPUP_MIN = Math.max(1000, Number(process.env.UMI_GAME_TOPUP_MIN || 5000))
const GAME_TOPUP_MAX = Math.max(GAME_TOPUP_MIN, Number(process.env.UMI_GAME_TOPUP_MAX || 200000))
function gameAsRate() { const rate = Number(process.env.UMI_GAME_AS_PER_1000 || 10); return Number.isFinite(rate) && rate > 0 ? rate : 10 }

async function gameProfileFromToken(token) {
  const response = await fetch(GAME_VERIFY_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }), signal: AbortSignal.timeout(15000) })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.ok) throw Object.assign(new Error(data.error || 'Token akun tidak valid.'), { status: response.status === 403 ? 403 : 401 })
  return data.user || {}
}

async function creditGameBalance(userToken, amount, reference) {
  if (!GAME_INTERNAL_TOKEN) throw Object.assign(new Error('Token internal game belum diatur.'), { status: 503 })
  const response = await fetch(`${GAME_INTERNAL_URL}/api/trading/credit`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: GAME_INTERNAL_TOKEN, userToken, amount, reference }), signal: AbortSignal.timeout(15000),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.ok) throw Object.assign(new Error(data.error || 'Game menolak kredit $AS.'), { status: 502 })
  return data
}

async function routeGameWalletConvert(req, res) {
  const input = await bodyJson(req)
  const token = safeText(input.token, 300)
  if (token.length < 16) return send(res, 400, { ok: false, error: 'Token akun diperlukan.' })
  let profile
  try { profile = await gameProfileFromToken(token) } catch (error) { return send(res, Number(error?.status) || 401, { ok: false, error: error?.message || 'Token akun tidak valid.' }) }
  const userId = safeText(profile.id, 80)
  if (!userId) return send(res, 401, { ok: false, error: 'Profil akun tidak lengkap.' })
  if (limited(`game-wallet:${userId}`, 30)) throw Object.assign(new Error('Terlalu banyak permintaan konversi. Coba lagi sebentar.'), { status: 429 })

  if (input.action === 'status') {
    const wallet = walletStatus({ id: userId })
    return send(res, 200, {
      ok: true, walletBalance: wallet.balance, currency: 'IDR', rate: gameAsRate(), asPer1000: gameAsRate(),
      minimumTopupIdr: GAME_TOPUP_MIN, maximumTopupIdr: GAME_TOPUP_MAX, description: 'Saldo Rp hasil top up UMI, bisa ditukar jadi $AS.',
    })
  }

  const amountIdr = Math.floor(Number(input.amountIdr))
  if (!Number.isFinite(amountIdr) || amountIdr < GAME_TOPUP_MIN || amountIdr > GAME_TOPUP_MAX) {
    return send(res, 400, { ok: false, error: `Nominal konversi harus Rp${GAME_TOPUP_MIN.toLocaleString('id-ID')}–Rp${GAME_TOPUP_MAX.toLocaleString('id-ID')}.` })
  }
  const reference = safeText(input.reference, 120) || `game-${userId}-${Date.now()}`
  const credited = Math.max(1, Math.round((amountIdr / 1000) * gameAsRate() * 100) / 100)
  let result
  try {
    result = debitWalletForGame({ userId, amount: amountIdr, reference, type: 'GAME_TOPUP', description: `Tukar Rp${amountIdr.toLocaleString('id-ID')} ke $AS UMI TRADE (+${credited} $AS)` })
  } catch (error) {
    const status = Number(error?.status) || 500
    return send(res, status === 409 ? 402 : status, { ok: false, error: error?.message || 'Konversi gagal.' })
  }
  if (result.duplicate) {
    // SEC-01: referensi yang sudah pernah diproses tidak boleh mengkredit $AS
    // lagi. Klien lama yang mempercayai `credited` akan mengkredit dua kali,
    // jadi laporkan 0 dan biarkan riwayat wallet sebagai sumber kebenaran.
    return send(res, 200, { ok: true, duplicate: true, credited: 0, amountIdr, rate: gameAsRate(), walletBalance: result.balance, reference, note: 'Referensi ini sudah pernah ditukar.' })
  }
  let game = null
  let lastError = null
  for (let attempt = 0; attempt < 2; attempt++) {
    try { game = await creditGameBalance(token, credited, reference); lastError = null; break }
    catch (error) {
      lastError = error
      if (Number(error?.status) && Number(error.status) < 500) break
      await new Promise(resolve => setTimeout(resolve, 1200))
    }
  }
  if (game) {
    return send(res, 200, { ok: true, credited, amountIdr, rate: gameAsRate(), walletBalance: result.balance, reference, gameBalance: game.balance })
  }
  const status = Number(lastError?.status) || 0
  if (status >= 400 && status < 500) {
    /* Game menolak secara pasti -> kembalikan saldo Rp. */ 
    try { creditWalletForGame({ userId, amount: amountIdr, reference: `${reference}:refund`, type: 'REFUND', description: `Refund tukar $AS gagal (${reference})` }) } catch {}
    return send(res, 502, { ok: false, error: `${lastError?.message || 'Game menolak kredit.'} Saldo Rp kamu sudah dikembalikan.` })
  }
  // Hasil tidak pasti (timeout/5xx): jangan refund otomatis, karena kredit di
  // game mungkin sudah tersimpan. Referensi idempoten, jadi percobaan ulang
  // dengan referensi yang sama aman dan tidak menghasilkan kredit ganda.
  return send(res, 502, { ok: false, retryable: true, code: 'UNCERTAIN', error: 'Kredit $AS belum terkonfirmasi. Coba lagi dengan referensi yang sama; saldo tidak akan terpotong dua kali.' })
}

/* Task64 - top up $AS memakai koin RPG (tanpa DANA).
 *
 * Dipanggil website /api/platform/rpg-topup (relay dari server game).
 * Token akun diverifikasi ulang ke website, lalu nomor WhatsApp pemilik token
 * ditentukan dari sesi jadibot milik akun atau tautan `.trading login`.
 * Koin dipotong oleh game-koin-topup.js secara idempoten; $AS dikreditkan ke
 * database game lewat jalur internal yang sama dengan wallet-convert. */
function koinOwnerNumbers(userId, token) {
  const numbers = new Set()
  try {
    const rows = Object.values(loadDb().sessions || {})
    for (const row of rows) {
      if (String(row?.userId || '') !== String(userId)) continue
      const number = normalizeBotNumber(row.sessionId)
      if (number) numbers.add(number)
    }
  } catch {}
  const linked = numberForToken(token)
  if (linked) numbers.add(linked)
  return { numbers: [...numbers], linked }
}

async function routeGameKoinTopup(req, res) {
  const input = await bodyJson(req)
  const token = safeText(input.token, 300)
  if (token.length < 16) return send(res, 400, { ok: false, error: 'Token akun diperlukan.' })
  let profile
  try { profile = await gameProfileFromToken(token) } catch (error) { return send(res, Number(error?.status) || 401, { ok: false, error: error?.message || 'Token akun tidak valid.' }) }
  const userId = safeText(profile.id, 80)
  if (!userId) return send(res, 401, { ok: false, error: 'Profil akun tidak lengkap.' })
  if (limited(`game-koin:${userId}`, 30)) throw Object.assign(new Error('Terlalu banyak permintaan tukar koin. Coba lagi sebentar.'), { status: 429 })

  const { numbers, linked } = koinOwnerNumbers(userId, token)
  if (!numbers.length) {
    return send(res, 409, {
      ok: false, code: 'NOT_LINKED',
      error: 'Nomor WhatsApp kamu belum tertaut. Kirim perintah .trading login <token> dari WhatsApp, lalu coba lagi.',
    })
  }
  let number = normalizeBotNumber(input.number)
  if (number && !numbers.includes(number)) number = ''
  if (!number) number = linked && numbers.includes(linked) ? linked : numbers[0]
  const jid = `${number}@s.whatsapp.net`

  if (input.action === 'status') return send(res, 200, { ...koinStatus(jid), number })

  let result
  try {
    result = await convertKoin({
      jid,
      token,
      amountKoin: input.amountKoin,
      reference: safeText(input.reference, 120),
      credit: async ({ token: userToken, amount, reference }) => {
        const credit = await creditGameBalance(userToken, amount, reference)
        return { balance: Number(credit?.balance) || undefined }
      },
    })
  } catch (error) {
    return send(res, Number(error?.status) || 500, { ok: false, error: error?.message || 'Tukar koin gagal.', code: error?.code, retryable: error?.retryable === true })
  }
  return send(res, 200, { ...result, number })
}

async function routeTripayCallback(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'Metode callback tidak diizinkan.' })
  if (limited('tripay:callback', 180, 60 * 1000)) throw Object.assign(new Error('Terlalu banyak callback pembayaran.'), { status: 429 })
  const payload = await rawBody(req)
  const result = handleTripayCallback({
    rawBody: payload,
    signature: String(req.headers['x-callback-signature'] || ''),
    event: String(req.headers['x-callback-event'] || ''),
  })
  return send(res, 200, result)
}

function config() {
  return global.jadibotPlatform || {}
}

const loadDb = () => platformSessions.load()
const saveDb = () => platformSessions.save()

function send(res, status, payload, headers = {}) {
  const body = payload === undefined ? '' : JSON.stringify(payload)
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers })
  res.end(body)
}

function setCors(req, res) {
  const origin = String(req.headers.origin || '')
  const allowed = config().allowedOrigins || []
  if (origin && allowed.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('Content-Security-Policy', "frame-ancestors 'none'; object-src 'none'; base-uri 'self'")
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()')
}

async function bodyJson(req) {
  const max = Number(config().requestBodyLimitBytes) || 1024 * 1024
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > max) throw Object.assign(new Error('Request terlalu besar.'), { status: 413 })
    chunks.push(chunk)
  }
  if (!chunks.length) return {}
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { throw Object.assign(new Error('JSON tidak valid.'), { status: 400 }) }
}

async function rawBody(req, max = 128 * 1024) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > max) throw Object.assign(new Error('Payload callback terlalu besar.'), { status: 413 })
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

function limited(key, max = 20, windowMs = 60000) {
  const time = Date.now()
  const row = rateLimits.get(key) || { start: time, count: 0 }
  if (time - row.start > windowMs) { row.start = time; row.count = 0 }
  row.count++
  rateLimits.set(key, row)
  return row.count > max
}

function claimLegacySessions(user) {
  if (!user?.id || !user?.email) return
  const db = loadDb()
  const previousIds = new Set()
  let changed = false
  for (const row of Object.values(db.sessions)) {
    if (String(row.email || '').toLowerCase() !== user.email || row.userId === user.id) continue
    if (row.userId) previousIds.add(row.userId)
    row.userId = user.id
    changed = true
  }
  if (previousIds.size) {
    for (const row of Object.values(db.backups)) {
      if (previousIds.has(row.userId)) {
        row.userId = user.id
        changed = true
      }
    }
  }
  if (changed) saveDb()
}

async function authenticate(req) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim()
  if (!token) throw Object.assign(new Error('Silakan masuk terlebih dahulu.'), { status: 401 })
  const cached = tokenCache.get(token)
  if (cached && cached.expires > Date.now()) {
    claimLegacySessions(cached.user)
    return cached.user
  }

  const cfg = config()
  const response = await fetch(`${String(cfg.supabaseUrl).replace(/\/+$/, '')}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: cfg.supabaseAnonKey },
    signal: AbortSignal.timeout(12000),
  })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    console.error('[JADIBOT-AUTH]', response.status, detail.slice(0, 300))
    throw Object.assign(new Error(`Sesi login tidak valid atau sudah berakhir. (Auth ${response.status})`), { status: 401 })
  }
  const data = await response.json()
  const user = { id: data.id, email: String(data.email || '').toLowerCase(), isOwner: (cfg.ownerEmails || []).map(v => v.toLowerCase()).includes(String(data.email || '').toLowerCase()) }
  claimLegacySessions(user)
  tokenCache.set(token, { user, expires: Date.now() + 60000 })
  return user
}

function ownedSession(user, number) {
  platformSessions.assertAvailable(number)
  const session = loadDb().sessions[number]
  if (!session) throw Object.assign(new Error('Session tidak ditemukan.'), { status: 404 })
  if (!user.isOwner && session.userId !== user.id) throw Object.assign(new Error('Anda tidak memiliki session ini.'), { status: 403 })
  return session
}

export function mainBotStatus() {
  const registered = Boolean(global.conn?.authState?.creds?.registered)
  const connection = ['open', 'connecting', 'close'].includes(global.stopped) ? global.stopped : 'unknown'
  return {
    status: registered && connection === 'open' ? 'connected' : registered ? 'registered' : global.pairingRequested ? 'pairing' : 'unpaired',
    registered,
    connected: connection === 'open',
    connection,
    socket_ready: Boolean(global.mainPairingSocketReady),
    pairing_active: Boolean(global.pairingRequested),
    console_prompt_active: Boolean(global.pairingInputShown),
    uptime_seconds: Math.floor(process.uptime()),
    main_bot_enabled: mainBotStateForStatus().enabled,
    pairing_number_set: Boolean(mainBotStateForStatus().pairingNumber),
    // Nomor hanya ditampilkan sebagian; nilainya tidak pernah dikirim utuh.
    pairing_number_masked: maskMainBotNumber(mainBotStateForStatus().pairingNumber),
    pairing_unavailable: Boolean(global.pairingUnavailable),
    // Task77: kode pairing dibagikan lewat status (bukan hanya di log console)
    // supaya halaman Bot Utama selalu bisa menampilkannya walau buffer log
    // sudah berputar atau console tertutup. Hanya endpoint owner bertiket yang
    // bisa membaca nilai ini.
    pairing_code: global.lastPairingCode?.code || '',
    pairing_code_at: global.lastPairingCode?.at || null,
    pairing_code_age_seconds: global.lastPairingCode?.at
      ? Math.max(0, Math.floor((Date.now() - global.lastPairingCode.at) / 1000))
      : null,
    pairing_error: global.lastPairingError || '',
    pairing_pending: Boolean(global.pairingPending),
    session_saved: fs.existsSync(path.join(process.cwd(), 'sessions', 'creds.json')),
    autoread: readAutoreadState().autoread,
    autoread_partial: readAutoreadState().partial,
    autoread_settings: readAutoreadState().jids,
  }
}

/* ── Auto read (centang biru otomatis) bot utama ──
 * Nilainya dibaca handler.js dari global.db.data.settings[<jid bot>].autoread.
 * Jid bot utama diambil dari koneksi aktif; kalau belum ada, semua setelan
 * sesi WhatsApp yang sudah tersimpan ikut disamakan supaya tidak setengah-setengah. */
function autoreadSettingJids() {
  const list = new Set()
  const push = (jid) => {
    const clean = String(jid || '').trim()
    if (clean.endsWith('@s.whatsapp.net') || clean.endsWith('@lid')) list.add(clean)
  }
  push(global.conn && global.conn.user && global.conn.user.jid)
  push(global.mainBotJid)
  const settings = (global.db && global.db.data && global.db.data.settings) || {}
  for (const jid of Object.keys(settings)) push(jid)
  return [...list]
}

function readAutoreadState() {
  const settings = (global.db && global.db.data && global.db.data.settings) || {}
  const jids = autoreadSettingJids()
  const on = jids.filter((jid) => (settings[jid] ? settings[jid].autoread !== false : true))
  return {
    autoread: jids.length ? on.length > 0 : true,
    partial: jids.length > 0 && on.length > 0 && on.length < jids.length,
    jids: jids.length,
    settings_ready: Boolean(global.db && global.db.data && global.db.data.settings),
  }
}

async function setAutoreadState(enabled) {
  if (!(global.db && global.db.data && global.db.data.settings)) {
    throw Object.assign(new Error('Database bot belum siap. Coba lagi sebentar.'), { status: 503 })
  }
  const jids = autoreadSettingJids()
  if (!jids.length) throw Object.assign(new Error('Belum ada sesi WhatsApp yang aktif.'), { status: 409 })
  for (const jid of jids) {
    const setting = global.db.data.settings[jid] || (global.db.data.settings[jid] = {})
    setting.autoread = Boolean(enabled)
  }
  try {
    if (typeof global.db.write === 'function') await global.db.write()
  } catch (error) {
    console.error('[AUTOREAD] gagal menyimpan setelan:', error && error.message)
  }
  return readAutoreadState()
}

function mainBotStateForStatus() {
  try { return readMainBotState() } catch { return { enabled: false, pairingNumber: '' } }
}

function maskMainBotNumber(number) {
  const clean = String(number || '')
  return clean.length >= 8 ? `${clean.slice(0, 4)}${'*'.repeat(Math.max(0, clean.length - 7))}${clean.slice(-3)}` : ''
}

function requirePlatformOwner(user) {
  if (!user?.isOwner) throw Object.assign(new Error('Console bot utama hanya untuk owner.'), { status: 403 })
}

/* Nomor bot utama: utamakan socket utama, lalu nomor pairing tersimpan. */
function mainBotNumber() {
  const raw = String(global.conn?.user?.id || global.sock?.user?.id || '')
  const digits = raw.split('@')[0].split(':')[0].replace(/\D/g, '')
  if (digits) return normalizeBotNumber(digits)
  try { return normalizeMainBotNumber(readMainBotState().pairingNumber) } catch { return '' }
}

function statusFor(number) {
  if (number && number === mainBotNumber()) {
    const main = mainBotStatus()
    return {
      status: main.status === 'connected' ? 'connected' : main.registered ? 'pending' : 'disconnected',
      connected: main.status === 'connected',
      registered: Boolean(main.registered),
      stored: true,
      phone: number,
      botJid: String(global.conn?.user?.id || '') || null,
      main: true,
    }
  }
  const active = hasSubBot(number)
  const creds = path.join(SESSION_DIR, number, 'creds.json')
  let registered = false
  try { registered = Boolean(JSON.parse(fs.readFileSync(creds, 'utf8'))?.registered) } catch {}
  const conn = getSubBot(number)
  return {
    status: active && registered ? 'connected' : active ? 'pending' : 'disconnected',
    connected: active,
    registered,
    stored: fs.existsSync(creds),
    phone: number,
    botJid: conn?.user?.id || null,
  }
}

function publicSession(row) {
  const profile = getSubBot(row.sessionId)?.botConfig || loadJadibotConfig(row.sessionId, path.join(SESSION_DIR, row.sessionId), { create: false })
  return { ...row, ...statusFor(row.sessionId), auto_ai: profile.values?.autoAI?.enabled !== false }
}

function uploadChannelRole(metadata) {
  const value = metadata?.viewer_metadata?.role
    ?? metadata?.viewerMetadata?.role
    ?? metadata?.viewer?.role
    ?? metadata?.role
    ?? ''
  if (value && typeof value === 'object') return safeText(value.name || value.value || '', 32).toUpperCase()
  return safeText(value, 32).toUpperCase()
}

async function newsletterMetadataWithTimeout(conn, type, value, timeoutMs = 15000) {
  let timer
  try {
    return await Promise.race([
      conn.newsletterMetadata(type, value),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), timeoutMs) }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

async function resolveJadibotUploadChannel(conn, rawValue) {
  const value = safeText(rawValue, 500)
  if (!value) return null
  const parsed = parseNewsletterInput(value)
  if (!parsed || parsed.type !== 'invite') {
    throw Object.assign(new Error('Masukkan link WhatsApp Channel yang valid untuk Channel Utama /upch.'), { status: 400 })
  }
  if (!conn?.user?.id || typeof conn.newsletterMetadata !== 'function') {
    throw Object.assign(new Error('Jadibot harus terhubung terlebih dahulu sebelum Channel Utama dapat diverifikasi.'), { status: 409 })
  }

  let inviteMetadata
  try {
    inviteMetadata = await newsletterMetadataWithTimeout(conn, 'invite', parsed.value)
  } catch {
    throw Object.assign(new Error('Channel tidak dapat dibaca dari WhatsApp. Pastikan link benar dan bot sudah mengikuti Channel.'), { status: 400 })
  }

  const channelId = safeText(inviteMetadata?.id, 120)
  if (!channelId.endsWith('@newsletter')) {
    throw Object.assign(new Error('ID Channel tidak ditemukan. Gunakan link Channel WhatsApp yang benar.'), { status: 400 })
  }

  // WhatsApp can resolve an invite while omitting viewer_metadata.role in that
  // response. The JID lookup is the authoritative per-account role check; it
  // prevents a real Channel admin from being incorrectly rejected in Settings.
  let metadata = inviteMetadata
  let role = uploadChannelRole(metadata)
  if (!['OWNER', 'ADMIN'].includes(role)) {
    try {
      const byJid = await newsletterMetadataWithTimeout(conn, 'jid', channelId)
      if (safeText(byJid?.id, 120) === channelId) {
        metadata = byJid
        role = uploadChannelRole(metadata)
      }
    } catch {
      // Preserve the explicit role result if WhatsApp temporarily cannot serve
      // the second lookup; a missing role remains a safe rejection below.
    }
  }
  if (!['OWNER', 'ADMIN'].includes(role)) {
    throw Object.assign(new Error('Jadibot belum terdeteksi sebagai admin Channel tersebut. Pastikan nomor Jadibot yang dipilih (bukan bot utama) adalah admin, lalu coba simpan kembali.'), { status: 400 })
  }

  return { id: channelId, url: value, role, verifiedAt: Date.now() }
}

function setJadibotUploadChannel(profile, channel) {
  const values = profile.values ||= {}
  const links = values.links ||= {}
  if (!channel) {
    delete links.upchChannelId
    delete links.upchChannelUrl
    delete links.upchChannelRole
    delete links.upchChannelVerifiedAt
    return
  }
  links.upchChannelId = channel.id
  links.upchChannelUrl = channel.url
  links.upchChannelRole = channel.role
  links.upchChannelVerifiedAt = channel.verifiedAt
}

function profileSettings(profile) {
  const v = profile.values || {}
  const links = { ...(v.links || {}) }
  const upchChannel = {
    configured: Boolean(links.upchChannelId && links.upchChannelUrl),
    url: String(links.upchChannelUrl || ''),
    role: String(links.upchChannelRole || ''),
  }
  delete links.upchChannelId
  delete links.upchChannelUrl
  delete links.upchChannelRole
  delete links.upchChannelVerifiedAt
  return {
    session_id: profile.number,
    bot_name: v.namebot,
    prefix: profile.defaultPrefix,
    mode: profile.public ? 'public' : 'self',
    only_group: profile.onlyGroup === true,
    registration_required: profile.registrationRequired !== false,
    default_limit: profile.defaultLimit,
    limit_enabled: profile.limitEnabled !== false,
    owner_number: (profile.ownerNumbers || []).find(number => number !== lockedJadibotOwnerNumber()) || '',
    owner_numbers: normalizeJadibotOwners(profile.ownerNumbers || []),
    locked_owner_number: lockedJadibotOwnerNumber(),
    auto_ai: v.autoAI?.enabled !== false,
    auto_typing: v.autoTyping?.enabled !== false,
    auto_typing_config: v.autoTyping,
    auto_translate: v.autoTranslate?.enabled !== false,
    auto_translate_config: v.autoTranslate,
    links,
    upch_channel: upchChannel,
    tiktok: v.tiktokRich,
    runtime: v.runtimePerformance,
    branding_assets: v.brandingAssets,
    menu_audio_enabled: v.brandingAssets?.menuAudioEnabled !== false,
    images: v.images,
    owner_info: v.ownerInfo,
    wait_text: v.wait,
    error_text: v.eror,
    multiplier: v.multiplier,
    premium: premiumConfigFor(profile),
    premium_system: getPremiumSystem(),
    disabled_plugins: profile.disabledPlugins || [],
    enabled_custom_plugins: profile.enabledCustomPlugins || [],
  }
}

function applySettings(profile, input) {
  if (input.auto_ai !== undefined && typeof input.auto_ai !== 'boolean') throw Object.assign(new Error('AutoAI harus true atau false.'), { status: 400 })
  const v = profile.values
  if (input.bot_name !== undefined) {
    v.namebot = safeText(input.bot_name, 80) || 'Usanagi Umi Jadibot'
    v.stickpack = v.namebot
    v.ownerInfo = { ...(v.ownerInfo || {}), subtitle: `Jadibot of ${v.namebot}` }
  }
  if (input.prefix !== undefined) {
    const prefix = safeText(input.prefix, 3)
    if (!prefix || /\s/.test(prefix)) throw Object.assign(new Error('Prefix harus 1-3 karakter tanpa spasi.'), { status: 400 })
    profile.defaultPrefix = prefix
    clearScopedPrefixes(profile.scope)
  }
  if (input.mode !== undefined) {
    const mode = String(input.mode).toLowerCase()
    if (!['public', 'self', 'private'].includes(mode)) throw Object.assign(new Error('Mode bot harus public atau self.'), { status: 400 })
    profile.public = mode === 'public'
  }
  if (input.only_group !== undefined) profile.onlyGroup = Boolean(input.only_group)
  if (input.registration_required !== undefined) profile.registrationRequired = Boolean(input.registration_required)
  if (input.default_limit !== undefined) {
    const limit = Number(input.default_limit)
    if (!Number.isInteger(limit) || limit < -1 || limit > 100000) {
      throw Object.assign(new Error('Limit awal harus -1 (unlimited) atau 0-100000.'), { status: 400 })
    }
    profile.defaultLimit = limit
  }
  if (input.limit_enabled !== undefined) {
    if (typeof input.limit_enabled !== 'boolean') throw Object.assign(new Error('Limit ON/OFF harus true atau false.'), { status: 400 })
    profile.limitEnabled = input.limit_enabled
  }
  if (input.owner_number !== undefined) {
    const ownerNumber = normalizeBotNumber(input.owner_number)
    if (ownerNumber.length < 8 || ownerNumber.length > 15) {
      throw Object.assign(new Error('Nomor owner harus 8-15 digit dengan format internasional tanpa tanda +.'), { status: 400 })
    }
    // Nomor owner utama yang diatur di website tetap ditempatkan paling depan,
    // sementara owner tambahan yang dibuat melalui /addowner pada session ini
    // dipertahankan.
    const retainedOwners = (profile.ownerNumbers || []).filter(number => {
      const normalized = normalizeBotNumber(number)
      return normalized && normalized !== lockedJadibotOwnerNumber() && normalized !== ownerNumber
    })
    profile.ownerNumbers = normalizeJadibotOwners([ownerNumber, ...retainedOwners])
  }
  if (input.auto_typing !== undefined) v.autoTyping = { ...(v.autoTyping || {}), enabled: Boolean(input.auto_typing) }
  if (input.auto_typing_config && typeof input.auto_typing_config === 'object') {
    v.autoTyping = {
      ...(v.autoTyping || {}),
      minDelayMs: Math.max(0, Math.min(5000, Number(input.auto_typing_config.minDelayMs) || 0)),
      maxDelayMs: Math.max(0, Math.min(10000, Number(input.auto_typing_config.maxDelayMs) || 80)),
      charsPerSecond: Math.max(1, Math.min(10000, Number(input.auto_typing_config.charsPerSecond) || 10000)),
      includeMedia: input.auto_typing_config.includeMedia !== false,
    }
  }
  if (input.auto_translate !== undefined) v.autoTranslate = { ...(v.autoTranslate || {}), enabled: Boolean(input.auto_translate) }
  if (input.menu_audio_enabled !== undefined) v.brandingAssets = { ...(v.brandingAssets || {}), menuAudioEnabled: Boolean(input.menu_audio_enabled) }
  if (input.auto_translate_config && typeof input.auto_translate_config === 'object') {
    v.autoTranslate = {
      ...(v.autoTranslate || {}),
      source: safeText(input.auto_translate_config.source || 'id', 10) || 'id',
      defaultLanguage: safeText(input.auto_translate_config.defaultLanguage || 'id', 10) || 'id',
    }
  }
  if (input.runtime && typeof input.runtime === 'object') {
    v.runtimePerformance = {
      ...(v.runtimePerformance || {}),
      connectTimeoutMs: Math.max(10000, Math.min(120000, Number(input.runtime.connectTimeoutMs) || 60000)),
      keepAliveIntervalMs: Math.max(5000, Math.min(120000, Number(input.runtime.keepAliveIntervalMs) || 30000)),
      retryRequestDelayMs: Math.max(0, Math.min(10000, Number(input.runtime.retryRequestDelayMs) || 250)),
      maxMessageRetries: Math.max(1, Math.min(30, Number(input.runtime.maxMessageRetries) || 5)),
    }
  }
  if (input.wait_text !== undefined) v.wait = safeText(input.wait_text, 500) || '✨ _Tunggu sebentar..._'
  if (input.error_text !== undefined) v.eror = safeText(input.error_text, 500) || '🚩 Terjadi kesalahan.'
  if (input.multiplier !== undefined) v.multiplier = Math.max(1, Math.min(1000, Number(input.multiplier) || 38))
  if (input.tiktok && typeof input.tiktok === 'object') {
    v.tiktokRich = {
      ...(v.tiktokRich || {}),
      sendMusic: input.tiktok.sendMusic !== false,
      maxPhotos: Math.max(1, Math.min(20, Number(input.tiktok.maxPhotos) || 8)),
    }
  }
  // Task75: mode premium bot. ON/OFF dan daftar fitur premium per bot.
  if (input.premium_enabled !== undefined) {
    if (typeof input.premium_enabled !== 'boolean') {
      throw Object.assign(new Error('Mode Premium ON/OFF harus true atau false.'), { status: 400 })
    }
    profile.premium = { ...(profile.premium || {}), enabled: input.premium_enabled }
  }
  if (input.premium_plugins !== undefined) {
    if (!Array.isArray(input.premium_plugins)) {
      throw Object.assign(new Error('Daftar fitur premium harus berupa array.'), { status: 400 })
    }
    if (input.premium_plugins.length > 300) {
      throw Object.assign(new Error('Maksimum 300 fitur premium.'), { status: 400 })
    }
    const plugins = normalizePremiumEntries(input.premium_plugins.map(item => safeText(item, 120)))
    const unknown = []
    for (const entry of plugins) {
      const resolved = resolvePremiumEntry(entry)
      if (!resolved.ok) unknown.push(resolved)
    }
    if (unknown.length) {
      const hints = unknown.slice(0, 5).map(item => {
        const suggestions = (item.suggestions || []).slice(0, 2)
          .map(feature => `${feature.commands[0] || feature.basename.replace(/\.js$/, '')}`)
          .join(', ')
        return suggestions ? `${item.entry} (mungkin: ${suggestions})` : item.entry
      })
      throw Object.assign(new Error(`Fitur premium tidak dikenal: ${hints.join('; ')}`), { status: 400 })
    }
    profile.premium = { ...(profile.premium || {}), plugins }
  }
  if (Array.isArray(input.disabled_plugins)) {
    profile.disabledPlugins = [...new Set(input.disabled_plugins.map(x => safeText(x, 150)).filter(Boolean))].slice(0, 500)
  }
  if (input.links && typeof input.links === 'object') {
    for (const key of ['channelUrl', 'groupUrl', 'websiteUrl']) {
      if (input.links[key] === undefined) continue
      const value = safeText(input.links[key], 500)
      try { new URL(value) } catch { throw Object.assign(new Error(`${key} bukan URL valid.`), { status: 400 }) }
      v.links = { ...(v.links || {}), [key]: value }
    }
    v.scriptUrl = v.links.websiteUrl
    v.backupGroupLink = v.links.groupUrl
  }
  if (input.auto_ai !== undefined) v.autoAI = { enabled: input.auto_ai }
  saveJadibotConfig(profile)
  return profileSettings(profile)
}

function readSessionFiles(number) {
  const root = path.join(SESSION_DIR, number)
  const files = {}
  if (!fs.existsSync(root)) return files
  for (const name of fs.readdirSync(root)) {
    const file = path.join(root, name)
    if (!fs.statSync(file).isFile()) continue
    const data = fs.readFileSync(file)
    if (data.length > 2 * 1024 * 1024) continue
    files[name] = data.toString('base64')
  }
  return files
}

function writeSessionFiles(number, files) {
  const root = path.join(SESSION_DIR, number)
  fs.mkdirSync(root, { recursive: true })
  for (const [name, encoded] of Object.entries(files || {})) {
    if (!/^[a-zA-Z0-9_.-]+$/.test(name)) continue
    const data = Buffer.from(String(encoded), 'base64')
    if (data.length > 2 * 1024 * 1024) continue
    fs.writeFileSync(path.join(root, name), data, { mode: 0o600 })
  }
}

function appendSessionLog(number, level, message) {
  try {
    const root = path.join(SESSION_DIR, number)
    fs.mkdirSync(root, { recursive: true })
    const file = path.join(root, 'platform.log.jsonl')
    fs.appendFileSync(file, `${JSON.stringify({ t: Date.now(), level, text: safeText(message, 2000) })}\n`, { mode: 0o600 })
    const lines = fs.readFileSync(file, 'utf8').trim().split('\n')
    if (lines.length > SESSION_LOG_LIMIT) fs.writeFileSync(file, `${lines.slice(-SESSION_LOG_LIMIT).join('\n')}\n`, { mode: 0o600 })
  } catch {}
}

function readSessionLogs(number, limit = 200) {
  try {
    const file = path.join(SESSION_DIR, number, 'platform.log.jsonl')
    return fs.readFileSync(file, 'utf8').trim().split('\n').slice(-Math.max(1, Math.min(500, limit))).map(line => JSON.parse(line)).filter(Boolean)
  } catch { return [] }
}

function privateIp(address) {
  if (!net.isIP(address)) return true
  let value = String(address).toLowerCase().split('%')[0]
  if (value.startsWith('::ffff:') && net.isIP(value.slice(7)) === 4) value = value.slice(7)
  if (net.isIP(value) === 4) {
    const p = value.split('.').map(Number)
    return p[0] === 0 || p[0] === 10 || p[0] === 127 || (p[0] === 169 && p[1] === 254) ||
      (p[0] === 172 && p[1] >= 16 && p[1] <= 31) || (p[0] === 192 && (p[1] === 0 || p[1] === 168)) ||
      (p[0] === 100 && p[1] >= 64 && p[1] <= 127) || (p[0] === 198 && (p[1] === 18 || p[1] === 19)) ||
      p[0] >= 224
  }
  if (net.isIP(value) !== 6) return true
  return value === '::' || value === '::1' || value.startsWith('fc') || value.startsWith('fd') ||
    /^fe[89ab]/.test(value) || value.startsWith('ff') || value.startsWith('::ffff:') ||
    value.startsWith('64:ff9b:') || value.startsWith('2002:') || value.startsWith('2001:0')
}

async function assertPublicUrl(value) {
  let parsed
  try { parsed = new URL(String(value || '').trim()) } catch { throw Object.assign(new Error('URL media tidak valid.'), { status: 400 }) }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) throw Object.assign(new Error('URL media tidak valid.'), { status: 400 })
  if (!parsed.hostname || parsed.hostname.startsWith('[')) throw Object.assign(new Error('Alamat IPv6 literal tidak diizinkan.'), { status: 400 })
  let records
  try { records = await dns.lookup(parsed.hostname, { all: true, verbatim: true }) } catch { throw Object.assign(new Error('Hostname media tidak dapat diverifikasi.'), { status: 400 }) }
  if (!records.length || records.some(record => privateIp(record.address))) throw Object.assign(new Error('Alamat media privat tidak diizinkan.'), { status: 400 })
  // Pin the verified address: fetch() would resolve DNS a second time and could
  // be rebound to 127.0.0.1 / 169.254.169.254 between check and connect.
  return { url: parsed, address: records[0] }
}

function pinnedGet(parsed, address, maxBytes) {
  return new Promise((resolve, reject) => {
    let settled = false
    const fail = (error) => { if (!settled) { settled = true; reject(error) } }
    const transport = parsed.protocol === 'https:' ? https : http
    const port = parsed.port || (parsed.protocol === 'https:' ? 443 : 80)
    const req = transport.request({
      protocol: parsed.protocol,
      hostname: parsed.hostname,
      port,
      path: `${parsed.pathname}${parsed.search}`,
      method: 'GET',
      servername: parsed.hostname,
      headers: { Host: parsed.host, 'User-Agent': 'Usanagi-Umi-Media/1.0', Accept: '*/*' },
      lookup: (hostname, options, callback) => callback(null, address.address, address.family),
      timeout: 30000,
    }, (res) => {
      const status = Number(res.statusCode) || 0
      if (status >= 300 && status < 400 && res.headers.location) {
        res.resume(); settled = true; return resolve({ status, location: res.headers.location })
      }
      if (status < 200 || status >= 300) {
        res.resume(); return fail(Object.assign(new Error(`Media gagal diunduh (HTTP ${status}).`), { status: 400 }))
      }
      const declared = Number(res.headers['content-length'] || 0)
      if (declared > maxBytes) { res.destroy(); return fail(Object.assign(new Error('Ukuran media melebihi batas.'), { status: 413 })) }
      const chunks = []; let size = 0
      res.on('data', chunk => {
        size += chunk.length
        if (size > maxBytes) { req.destroy(); fail(Object.assign(new Error('Ukuran media melebihi batas.'), { status: 413 })) }
        else chunks.push(chunk)
      })
      res.on('end', () => { if (!settled) { settled = true; resolve({ status, headers: res.headers, body: Buffer.concat(chunks), size }) } })
      res.on('error', fail)
    })
    req.on('timeout', () => req.destroy(Object.assign(new Error('Unduhan media melewati batas waktu.'), { status: 400 })))
    req.on('error', fail)
    req.end()
  })
}

async function downloadMedia(value, destination, maxBytes, redirects = 0) {
  const { url, address } = await assertPublicUrl(value)
  const response = await pinnedGet(url, address, maxBytes)
  if (response.location) {
    if (redirects >= 3) throw Object.assign(new Error('Terlalu banyak redirect media.'), { status: 400 })
    return downloadMedia(new URL(response.location, url).toString(), destination, maxBytes, redirects + 1)
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true })
  const temp = `${destination}.${process.pid}.tmp`
  fs.writeFileSync(temp, response.body, { mode: 0o600 })
  fs.renameSync(temp, destination)
  return { size: response.size, contentType: String(response.headers['content-type'] || '') }
}

function verifyPluginSignature(req, body) {
  const timestamp = String(req.headers['x-umi-timestamp'] || '')
  const signature = String(req.headers['x-umi-signature'] || '')
  if (!/^\d{13}$/.test(timestamp) || Math.abs(Date.now() - Number(timestamp)) > 120000 || !signature) return false
  const canonical = { session_id: body.session_id, filename: body.filename, code: body.code, catalog_id: body.catalog_id }
  const digest = crypto.createHash('sha256').update(JSON.stringify(canonical)).digest('hex')
  try { return crypto.verify(null, Buffer.from(`${timestamp}.${digest}`), config().pluginSigningPublicKey, Buffer.from(signature, 'base64')) } catch { return false }
}

function statsAuthorized(req) {
  const supplied = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim()
  if (!supplied) return false
  const suppliedBuffer = Buffer.from(supplied)
  const candidates = [process.env.UMI_BACKUP_EXPORT_SECRET, process.env.BOT_BACKUP_EXPORT_SECRET, process.env.UMI_ERROR_REPORT_SECRET]
    .map(value => String(value || '').trim()).filter(value => value.length >= 16)
  return candidates.some(value => {
    const expectedBuffer = Buffer.from(value)
    return expectedBuffer.length === suppliedBuffer.length && crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)
  })
}

function backupExporterAuthorized(req) {
  const expected = String(process.env.UMI_BACKUP_EXPORT_SECRET || '').trim()
  const supplied = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim()
  if (!expected) throw Object.assign(new Error('Layanan ekspor backup belum dikonfigurasi.'), { status: 503 })
  const expectedBuffer = Buffer.from(expected)
  const suppliedBuffer = Buffer.from(supplied)
  if (!supplied || expectedBuffer.length !== suppliedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, suppliedBuffer)) {
    throw Object.assign(new Error('Autentikasi ekspor backup ditolak.'), { status: 401 })
  }
}

function streamBackupArchive(res, record) {
  res.writeHead(200, {
    'Content-Type': 'application/gzip',
    'Content-Length': String(record.bytes),
    'Content-Disposition': `attachment; filename="${path.basename(record.file)}"`,
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  })
  const input = fs.createReadStream(record.file)
  input.on('error', error => {
    console.error('[VERCEL-BACKUP] Gagal mengirim arsip:', error.message)
    if (!res.headersSent) send(res, 500, { error: 'Arsip backup gagal dibaca.' })
    else res.destroy(error)
  })
  input.pipe(res)
}

async function routeInternalBackup(req, res, pathname) {
  backupExporterAuthorized(req)
  if (pathname === '/api/internal/backup/export' && req.method === 'POST') {
    const input = await bodyJson(req)
    const result = await prepareBackupExport(input.generation)
    return send(res, 200, { ok: true, ...result })
  }
  if (pathname === '/api/internal/backup/export/cleanup' && req.method === 'POST') {
    const input = await bodyJson(req)
    return send(res, 200, { ok: true, ...(await cleanupBackupExport(input.generation)) })
  }
  const match = pathname.match(/^\/api\/internal\/backup\/export\/([A-Za-z0-9_-]{16,96})\/(bot|jadibot)$/)
  if (match && req.method === 'GET') {
    return streamBackupArchive(res, await getBackupExportFile(match[1], match[2]))
  }
  return send(res, 404, { error: 'Endpoint ekspor backup tidak ditemukan.' })
}

async function route(req, res) {
  if (/^\/realms(?:\/|\?|$)/.test(req.url || '')) return realmHttp(req, res)
  setCors(req, res)
  if (req.method === 'OPTIONS') return send(res, 204)
  const url = new URL(req.url, 'http://localhost')
  const pathname = url.pathname.replace(/\/+$/, '') || '/'

  // Sistem backup 10 menit. Prefiks dipisah dari /api/backup/* lama
  // (backup/list, backup/create, backup/restore) agar fitur lama tetap jalan.
  // Autentikasi memakai BACKUP_ADMIN_SECRET, bukan sesi Supabase.
  if (pathname === '/api/backup-system' || pathname.startsWith('/api/backup-system/')) {
    return handleBackupApi(req, res, pathname, url.searchParams)
  }

  // Ekosistem multi-aplikasi (WhatsApp + Telegram). Prefiks terpisah dari
  // /api/platform/* yang sudah dipakai wallet game. Autentikasi memakai
  // PLATFORM_API_SECRET; website memverifikasi sesi Supabase lebih dulu.
  if (pathname === '/api/platform-system' || pathname.startsWith('/api/platform-system/')) {
    return handlePlatformApi(req, res, pathname, url.searchParams)
  }

  if (pathname === '/api/stats' && req.method === 'GET') {
    // SEC-08: statistik sesi hanya untuk layanan internal (website), bukan publik.
    if (!statsAuthorized(req)) return send(res, 401, { error: 'unauthorized' })
    const db = loadDb()
    const sessions = Object.values(db.sessions || {})
    let online = sessions.filter(s => s.status === 'connected' || s.status === 'online').length
    /* Task77: registry platform tidak menyimpan status koneksi, sehingga
       hitungan online selalu 0 walau jadibot benar-benar tersambung.
       Pembersih sesi menulis status nyata di data/jadibot-session-cleaner.json. */
    if (!online) {
      try {
        const raw = fs.readFileSync(path.join(process.cwd(), 'data', 'jadibot-session-cleaner.json'), 'utf8')
        const entries = (JSON.parse(raw) || {}).entries || {}
        online = sessions.filter(s => entries[String(s.sessionId)] && entries[String(s.sessionId)].online === true).length
      } catch { /* berkas belum ada: biarkan 0 */ }
    }
    return send(res, 200, { ok: true, sessions: sessions.length, online, users: sessions.length })
  }

  if (pathname === '/api/health') {
    return send(res, 200, { ok: true, service: 'usanagi-umi-jadibot', version: '1.4.0', uptime: process.uptime(), time: nowIso() })
  }

  // This relay is authenticated with short-lived HMAC tickets minted only by
  // the website after its own owner-role check. Raw output never travels to
  // unauthenticated callers and no Pterodactyl credential is required.
  if (pathname.startsWith('/api/owner-console/')) return routeOwnerConsole(req, res, pathname)
  if (pathname.startsWith('/api/owner-agent/')) return routeOwnerAgent(req, res, pathname)
  if (pathname.startsWith('/api/owner-panel/')) return routeOwnerPanel(req, res, pathname)
  // TriPay calls this through the Website relay. Its HMAC signature is verified
  // against the encrypted server-side merchant key before any wallet credit.
  if (pathname === '/api/payment/tripay/callback') return routeTripayCallback(req, res)
  // Game web (UMI TRADE) memakai saldo Rp pengguna untuk ditukar jadi $AS.
  // Token akun diverifikasi ulang ke website sebelum saldo disentuh.
  if (pathname === '/api/platform/wallet-convert' && req.method === 'POST') return routeGameWalletConvert(req, res)
  // Task64: tukar koin RPG -> $AS UMI TRADE (tanpa DANA).
  if (pathname === '/api/platform/rpg-koin' && req.method === 'POST') return routeGameKoinTopup(req, res)

  if (pathname.startsWith('/api/internal/backup/')) return routeInternalBackup(req, res, pathname)

  const user = await authenticate(req)
  if (limited(`${user.id}:${pathname}`, pathname.includes('pairing') ? 4 : 60)) throw Object.assign(new Error('Terlalu banyak permintaan.'), { status: 429 })

  if (pathname === '/api/me') return send(res, 200, user)

  // Public AI chat stays inside a per-user workspace and never has server
  // tools. Owner chat/configuration/shell use the signed relay above, where
  // the Website validates the database-backed owner role.
  if (pathname === '/api/agent/status' && req.method === 'GET') {
    const status = agentStatus()
    return send(res, 200, { ...status, configured: status.configured === true })
  }
  if (pathname === '/api/agent/chat' && req.method === 'POST') {
    const input = await bodyJson(req)
    return send(res, 200, await agentChat({ userId: user.id, prompt: input.prompt, owner: false }))
  }

  if (pathname === '/api/wallet/status' && req.method === 'GET') {
    return send(res, 200, walletStatus(user))
  }
  if (pathname === '/api/wallet/topup' && req.method === 'POST') {
    if (limited(`wallet:topup:${user.id}`, 6, 60 * 60 * 1000)) throw Object.assign(new Error('Batas pembuatan invoice top up tercapai. Coba lagi nanti.'), { status: 429 })
    const input = await bodyJson(req)
    return send(res, 201, await createWalletTopup(user, input))
  }
  if (pathname === '/api/wallet/shop' && req.method === 'GET') {
    return send(res, 200, shopCatalog(user))
  }
  if (pathname === '/api/wallet/buy-panel' && req.method === 'POST') {
    if (limited(`wallet:buy:${user.id}`, 10, 60 * 60 * 1000)) throw Object.assign(new Error('Batas pembelian tercapai. Coba lagi nanti.'), { status: 429 })
    const input = await bodyJson(req)
    return send(res, 201, await buyPanelPackage(user, input.package_id))
  }
  if (pathname === '/api/wallet/buy-product' && req.method === 'POST') {
    if (limited(`wallet:buy:${user.id}`, 10, 60 * 60 * 1000)) throw Object.assign(new Error('Batas pembelian tercapai. Coba lagi nanti.'), { status: 429 })
    const input = await bodyJson(req)
    return send(res, 201, await buyProduct(user, input.product_id, { whatsapp: input.whatsapp }))
  }
  if (pathname === '/api/wallet/orders' && req.method === 'GET') {
    return send(res, 200, { orders: walletOrders(user) })
  }

  // No terminal output, pairing code, phone value, token, or credential is
  // returned here. The website uses this owner-only health snapshot before
  // opening the separate Pterodactyl terminal page.
  if (pathname === '/api/main/status' && req.method === 'GET') {
    requirePlatformOwner(user)
    return send(res, 200, mainBotStatus())
  }

  if (pathname === '/api/sessions' && req.method === 'GET') {
    const rows = Object.values(loadDb().sessions).filter(row => user.isOwner && url.searchParams.get('all') === '1' ? true : row.userId === user.id)
    return send(res, 200, { sessions: rows.map(publicSession) })
  }

  if (['/api/session/pairing', '/api/session/start'].includes(pathname) && req.method === 'POST') {
    const input = await bodyJson(req)
    const number = normalizeBotNumber(input.phone || input.session_id)
    if (!number || number.length < 7 || number.length > 15) throw Object.assign(new Error('Nomor WhatsApp tidak valid.'), { status: 400 })
    platformSessions.assertAvailable(number)
    const db = loadDb()
    const existing = db.sessions[number]
    let previousOwner = null

    /*
     * Nomor bot utama tidak boleh dijalankan sebagai jadibot: dua socket dengan
     * kredensial yang sama saling menendang (401) dan sesi utama bisa terhapus
     * (kejadian 2026-10-19: "[JADIBOT] <nomor> disconnected (401)"). Nomor ini
     * tetap boleh DITAUTKAN ke akun owner, hanya tanpa startSubBot.
     */
    const mainNumber = mainBotNumber()
    if (mainNumber && number === mainNumber) {
      if (!user.isOwner) throw Object.assign(new Error('Nomor ini adalah nomor bot utama platform dan tidak bisa dipakai sebagai Jadibot.'), { status: 409, code: 'MAIN_BOT_NUMBER' })
      db.sessions[number] = existing || { sessionId: number, userId: user.id, email: user.email, createdAt: nowIso() }
      db.sessions[number].userId = user.id
      db.sessions[number].email = user.email
      db.sessions[number].updatedAt = nowIso()
      saveDb()
      appendSessionLog(number, 'info', `Nomor bot utama ditautkan ke ${user.email}.`)
      return send(res, 200, {
        session_id: number, status: 'connected', connected: true, registered: true, main: true,
        message: 'Nomor bot utama ditautkan. Bot berjalan dari Console Owner, tidak perlu pairing ulang.',
      })
    }

    if (existing && !user.isOwner && existing.userId !== user.id) {
      /*
       * Nomor yang sesinya sudah MATI (logout 401 / dihapus cleaner) tidak boleh
       * mengunci pemiliknya selamanya. Dulu registry tetap menyimpan userId lama
       * sehingga user menerima "Nomor ini sudah dimiliki akun lain" padahal
       * nomornya belum tertaut di akun mana pun (laporan 2026-10-19).
       *
       * Verifikasi tetap terjadi di WhatsApp: pemilik baru harus memasukkan kode
       * pairing di nomor itu. Sesi lama dibuang supaya mulai bersih.
       */
      const sessionPath = path.join(SESSION_DIR, number)
      let liveRegistered = false
      try { liveRegistered = Boolean(JSON.parse(fs.readFileSync(path.join(sessionPath, 'creds.json'), 'utf8'))?.registered) } catch {}
      const liveOwner = hasSubBot(number) || liveRegistered
      if (!liveOwner) {
        appendSessionLog(number, 'info', `Ambil alih nomor mati oleh ${user.email} (pemilik lama ${existing.email || existing.userId}).`)
        previousOwner = { userId: existing.userId, email: existing.email }
        try { fs.rmSync(sessionPath, { recursive: true, force: true }) } catch {}
        existing.userId = user.id
        existing.email = user.email
        existing.updatedAt = nowIso()
        saveDb()
      } else {
        const masked = String(existing.email || '').replace(/^(.{2})[^@]*(@.*)$/, '$1***$2')
        console.log(`[JADIBOT-API] tolak pairing ${number.slice(0, 4)}****${number.slice(-3)}: milik ${masked || existing.userId}`)
        appendSessionLog(number, 'warn', `Pairing ditolak untuk ${user.email}: nomor masih aktif milik ${masked || existing.userId}.`)
        throw Object.assign(new Error(`Nomor ini sudah dimiliki akun lain${masked ? ` (${masked})` : ''}. Hapus session itu dulu atau hubungi owner.`), { status: 409, code: 'NUMBER_OWNED' })
      }
    }

    const ownCount = Object.values(db.sessions).filter(row => row.userId === user.id).length

    if (!existing && !user.isOwner && ownCount >= (Number(config().maxSessionsPerUser) || 3)) throw Object.assign(new Error('Batas session akun tercapai.'), { status: 403 })
    db.sessions[number] = existing || { sessionId: number, userId: user.id, email: user.email, createdAt: nowIso() }
    db.sessions[number].updatedAt = nowIso()
    saveDb()
    let result
    try {
      result = await startSubBotForApi(number, global.conn)
    } catch (error) {
      /* Pairing gagal (nomor tidak valid / WhatsApp menolak / timeout): kalau tadi
       * nomor mati diambil alih, kembalikan kepemilikan supaya tidak "nyangkut"
       * di akun yang gagal pairing. */
      if (previousOwner) {
        const row = loadDb().sessions[number]
        if (row) {
          row.userId = previousOwner.userId
          row.email = previousOwner.email
          row.updatedAt = nowIso()
          saveDb()
        }
        appendSessionLog(number, 'warn', `Pairing ${user.email} gagal; kepemilikan dikembalikan.`)
      }
      throw error
    }
    appendSessionLog(number, 'info', `Pairing dimulai oleh ${user.email}; status ${result.status || 'pending'}.`)
    return send(res, 200, { ...result, session_id: number })
  }

  if (pathname === '/api/session/status' && req.method === 'GET') {
    const number = normalizeBotNumber(url.searchParams.get('session_id') || url.searchParams.get('phone'))
    ownedSession(user, number)
    return send(res, 200, { session_id: number, ...statusFor(number) })
  }

  if (pathname === '/api/session/restart' && req.method === 'POST') {
    const input = await bodyJson(req); const number = normalizeBotNumber(input.session_id || input.phone)
    ownedSession(user, number); await restartSubBot(number, global.conn)
    appendSessionLog(number, 'info', `Restart diminta oleh ${user.email}.`)
    return send(res, 200, { ok: true, session_id: number, ...statusFor(number) })
  }

  if (pathname === '/api/session/disconnect' && req.method === 'POST') {
    const input = await bodyJson(req); const number = normalizeBotNumber(input.session_id || input.phone)
    ownedSession(user, number); await disconnectSubBot(number, { deleteSession: false })
    appendSessionLog(number, 'info', `Disconnect diminta oleh ${user.email}.`)
    return send(res, 200, { ok: true, session_id: number, ...statusFor(number) })
  }

  if (pathname === '/api/session/logout' && req.method === 'POST') {
    const input = await bodyJson(req)
    const number = normalizeBotNumber(input.session_id || input.phone)
    const db = loadDb()
    const session = db.sessions[number]
    if (!session) return send(res, 200, { ok: true, session_id: number, already_deleted: true })
    if (!user.isOwner && session.userId !== user.id) throw Object.assign(new Error('Anda tidak memiliki session ini.'), { status: 403 })

    // Hapus metadata lebih dulu agar kartu session tidak muncul kembali jika
    // koneksi WhatsApp gagal dihentikan atau folder kredensial sudah tidak ada.
    delete db.sessions[number]
    saveDb()
    try {
      await stopSubBot(number)
    } catch (error) {
      console.error('[JADIBOT-DELETE]', number, error?.message || error)
    }
    return send(res, 200, { ok: true, session_id: number })
  }

  if (pathname === '/api/premium/catalog' && req.method === 'GET') {
    const query = String(url.searchParams.get('q') || '').trim().slice(0, 60)
    const limit = Math.max(1, Math.min(50, Number(url.searchParams.get('limit')) || 20))
    const features = searchFeatures(query, limit).map(feature => ({
      key: feature.key,
      name: feature.name,
      commands: feature.commands.slice(0, 3),
      tags: feature.tags.slice(0, 4),
      premium: feature.premium,
      description: feature.description,
    }))
    return send(res, 200, { ok: true, query, total: features.length, features })
  }

  if (pathname === '/api/settings/get' && req.method === 'GET') {
    const number = normalizeBotNumber(url.searchParams.get('session_id')); ownedSession(user, number)
    return send(res, 200, { ok: true, settings: profileSettings(loadJadibotConfig(number, path.join(SESSION_DIR, number))) })
  }

  if (pathname === '/api/settings/apply' && req.method === 'POST') {
    const input = await bodyJson(req); const number = normalizeBotNumber(input.session_id)
    ownedSession(user, number)
    const sessionPath = path.join(SESSION_DIR, number)
    const profile = loadJadibotConfig(number, sessionPath)
    const active = getSubBot(number)
    const target = active?.botConfig || profile
    // Older deployed website builds expose this as the existing "Channel"
    // field. Accept it as the Channel Utama /upch setting too, so users do
    // not need to wait for a static-asset deployment before configuring it.
    const hasExplicitUploadChannel = Object.prototype.hasOwnProperty.call(input, 'upch_channel_url')
    const hasLegacyChannelUrl = !hasExplicitUploadChannel
      && Object.prototype.hasOwnProperty.call(input.links || {}, 'channelUrl')
    const hasUploadChannelInput = hasExplicitUploadChannel || hasLegacyChannelUrl
    const uploadChannelValue = hasExplicitUploadChannel
      ? input.upch_channel_url
      : input.links?.channelUrl
    const uploadChannel = hasUploadChannelInput
      ? await resolveJadibotUploadChannel(active, uploadChannelValue)
      : undefined
    let settings = applySettings(target, input)
    if (hasUploadChannelInput) {
      setJadibotUploadChannel(target, uploadChannel)
      saveJadibotConfig(target)
      settings = profileSettings(target)
    }

    // Socket/runtime tertentu membaca konfigurasi saat koneksi dibuat. Restart
    // otomatis memastikan semua perubahan website langsung dipakai oleh bot,
    // bukan hanya tersimpan di bot-config.json.
    let restarted = false
    const credsFile = path.join(sessionPath, 'creds.json')
    let registered = false
    try { registered = Boolean(JSON.parse(fs.readFileSync(credsFile, 'utf8'))?.registered) } catch {}
    const autoAIOnly = Object.keys(input).every(key => ['session_id', 'auto_ai'].includes(key)) && typeof input.auto_ai === 'boolean'
    if (registered && !autoAIOnly) {
      await restartSubBot(number, global.conn)
      restarted = true
    }
    appendSessionLog(number, 'info', `Pengaturan diperbarui oleh ${user.email}${restarted ? ' dan bot direstart' : ''}.`)
    return send(res, 200, { ok: true, settings, restarted, pending_pairing: !registered })
  }

  if (pathname === '/api/settings/reset' && req.method === 'POST') {
    const input = await bodyJson(req); const number = normalizeBotNumber(input.session_id); ownedSession(user, number)
    const active = getSubBot(number); const profile = active?.botConfig || loadJadibotConfig(number, path.join(SESSION_DIR, number))
    resetJadibotConfig(profile); clearScopedPrefixes(profile.scope)
    return send(res, 200, { ok: true, settings: profileSettings(profile) })
  }

  if (pathname === '/api/backup/create' && req.method === 'POST') {
    const input = await bodyJson(req); const number = normalizeBotNumber(input.session_id); ownedSession(user, number)
    const id = crypto.randomUUID(); const record = { id, sessionId: number, userId: user.id, createdAt: nowIso(), files: readSessionFiles(number) }
    fs.mkdirSync(BACKUP_DIR, { recursive: true }); fs.writeFileSync(path.join(BACKUP_DIR, `${id}.json`), JSON.stringify(record), { mode: 0o600 })
    loadDb().backups[id] = { id, sessionId: number, userId: user.id, createdAt: record.createdAt }; saveDb()
    return send(res, 200, { ok: true, backup: loadDb().backups[id] })
  }

  if (pathname === '/api/backup/list' && req.method === 'GET') {
    const number = normalizeBotNumber(url.searchParams.get('session_id')); ownedSession(user, number)
    const backups = Object.values(loadDb().backups).filter(row => row.sessionId === number && (user.isOwner || row.userId === user.id))
    return send(res, 200, { backups })
  }

  if (pathname === '/api/backup/restore' && req.method === 'POST') {
    const input = await bodyJson(req); const number = normalizeBotNumber(input.session_id); ownedSession(user, number)
    const meta = loadDb().backups[input.backup_id]
    if (!meta || meta.sessionId !== number || (!user.isOwner && meta.userId !== user.id)) throw Object.assign(new Error('Backup tidak ditemukan.'), { status: 404 })
    const record = JSON.parse(fs.readFileSync(path.join(BACKUP_DIR, `${meta.id}.json`), 'utf8')); await disconnectSubBot(number, { deleteSession: false }); writeSessionFiles(number, record.files)
    return send(res, 200, { ok: true, restored: Object.keys(record.files || {}).length })
  }

  if (pathname === '/api/console/logs' && req.method === 'GET') {
    const number = normalizeBotNumber(url.searchParams.get('session_id')); ownedSession(user, number)
    const status = statusFor(number)
    const logs = readSessionLogs(number, Number(url.searchParams.get('limit')) || 200)
    return send(res, 200, { status, logs: [...logs, { t: Date.now(), level: 'status', text: `${number}: ${status.status}` }] })
  }

  if (pathname === '/api/console/run' && req.method === 'POST') {
    const input = await bodyJson(req); const number = normalizeBotNumber(input.session_id); ownedSession(user, number)
    const rawCommand = safeText(input.command, 200)
    const [command, ...args] = rawCommand.trim().split(/\s+/)
    const cmd = String(command || '').toLowerCase()
    let output
    if (cmd === 'status') output = statusFor(number)
    else if (cmd === 'restart') { await restartSubBot(number, global.conn); output = statusFor(number) }
    else if (cmd === 'disconnect') { await disconnectSubBot(number, { deleteSession: false }); output = statusFor(number) }
    else if (cmd === 'plugins') {
      const profile = loadJadibotConfig(number, path.join(SESSION_DIR, number))
      output = { enabled_custom_plugins: profile.enabledCustomPlugins || [], disabled_plugins: profile.disabledPlugins || [] }
    } else if (['enable', 'disable'].includes(cmd)) {
      const pluginName = safeText(args.join(' '), 150).replace(/\\/g, '/').toLowerCase()
      if (!/^custom\/[a-z0-9_.-]+\.js$/.test(pluginName)) throw Object.assign(new Error('Gunakan: enable custom/nama.js atau disable custom/nama.js'), { status: 400 })
      const profile = loadJadibotConfig(number, path.join(SESSION_DIR, number))
      const enabled = new Set(profile.enabledCustomPlugins || [])
      if (cmd === 'enable') enabled.add(pluginName); else enabled.delete(pluginName)
      profile.enabledCustomPlugins = [...enabled]
      saveJadibotConfig(profile)
      output = { plugin: pluginName, enabled: cmd === 'enable' }
    } else throw Object.assign(new Error('Command diizinkan: status, restart, disconnect, plugins, enable custom/file.js, disable custom/file.js.'), { status: 403 })
    appendSessionLog(number, 'console', `${user.email}: ${rawCommand}`)
    return send(res, 200, { ok: true, output })
  }

  if (pathname === '/api/plugin/install' && req.method === 'POST') {
    const input = await bodyJson(req)
    if (!verifyPluginSignature(req, input)) throw Object.assign(new Error('Tanda tangan instalasi plugin tidak valid.'), { status: 403 })
    const number = normalizeBotNumber(input.session_id); ownedSession(user, number)
    const original = safeText(input.filename, 100)
    const catalog = safeText(input.catalog_id, 100).replace(/[^a-zA-Z0-9-]/g, '')
    const safeName = original.toLowerCase().replace(/[^a-z0-9_.-]/g, '-').replace(/^-+/, '')
    const code = String(input.code || '')
    if (!safeName.endsWith('.js') || !code || Buffer.byteLength(code) > 512 * 1024 || !catalog) throw Object.assign(new Error('Data plugin tidak valid.'), { status: 400 })
    const pluginName = `platform-${catalog.slice(0, 8)}-${safeName}`
    const relative = `custom/${pluginName}`
    const syntax = syntaxerror(code, relative, { sourceType: 'module', allowAwaitOutsideFunction: true })
    if (syntax) throw Object.assign(new Error(`Syntax plugin tidak valid: ${syntax.message}`), { status: 400 })
    fs.mkdirSync(CUSTOM_PLUGIN_DIR, { recursive: true })
    const destination = path.join(CUSTOM_PLUGIN_DIR, pluginName)
    const temp = `${destination}.${process.pid}.tmp`
    fs.writeFileSync(temp, code, { mode: 0o600 }); fs.renameSync(temp, destination)
    const profile = loadJadibotConfig(number, path.join(SESSION_DIR, number))
    profile.enabledCustomPlugins = [...new Set([...(profile.enabledCustomPlugins || []), relative.toLowerCase()])]
    saveJadibotConfig(profile)
    if (typeof global.reload === 'function') await global.reload('change', relative)
    appendSessionLog(number, 'plugin', `Plugin ${relative} diinstal dari katalog oleh ${user.email}.`)
    return send(res, 200, { ok: true, plugin: relative, enabled: true })
  }

  if (pathname === '/api/plugin/list' && req.method === 'GET') {
    const number = normalizeBotNumber(url.searchParams.get('session_id')); ownedSession(user, number)
    const profile = loadJadibotConfig(number, path.join(SESSION_DIR, number))
    return send(res, 200, { plugins: profile.enabledCustomPlugins || [] })
  }

  if (pathname === '/api/plugin/remove' && req.method === 'POST') {
    const input = await bodyJson(req); const number = normalizeBotNumber(input.session_id); ownedSession(user, number)
    const pluginName = safeText(input.plugin, 150).replace(/\\/g, '/').toLowerCase()
    const profile = loadJadibotConfig(number, path.join(SESSION_DIR, number))
    profile.enabledCustomPlugins = (profile.enabledCustomPlugins || []).filter(value => String(value).toLowerCase() !== pluginName)
    saveJadibotConfig(profile)
    appendSessionLog(number, 'plugin', `Plugin ${pluginName} dinonaktifkan oleh ${user.email}.`)
    return send(res, 200, { ok: true, plugin: pluginName, enabled: false })
  }

  if (pathname === '/api/media/apply' && req.method === 'POST') {
    const input = await bodyJson(req); const number = normalizeBotNumber(input.session_id); ownedSession(user, number)
    const kind = safeText(input.kind, 30)
    if (!['logo', 'menu_banner', 'menu_video', 'menu_audio', 'welcome_image', 'goodbye_image', 'thumbnail'].includes(kind)) throw Object.assign(new Error('Jenis media tidak valid.'), { status: 400 })
    const sourceUrl = safeText(input.url, 2000)
    const pathname = new URL(sourceUrl).pathname.toLowerCase()
    const extension = kind === 'menu_video'
      ? (pathname.endsWith('.webm') ? '.webm' : '.mp4')
      : kind === 'menu_audio'
        ? (pathname.endsWith('.ogg') || pathname.endsWith('.opus') ? '.ogg' : pathname.endsWith('.m4a') || pathname.endsWith('.mp4') ? '.m4a' : '.mp3')
        : (pathname.endsWith('.png') ? '.png' : pathname.endsWith('.webp') ? '.webp' : '.jpg')
    const destination = path.join(SESSION_DIR, number, 'media', `${kind}${extension}`)
    const maxBytes = kind === 'menu_video' ? 15 * 1024 * 1024 : kind === 'menu_audio' ? 12 * 1024 * 1024 : 8 * 1024 * 1024
    const downloaded = await downloadMedia(sourceUrl, destination, maxBytes)
    const expectedType = kind === 'menu_audio' ? 'audio/' : kind === 'menu_video' ? 'video/' : 'image/'
    if (!String(downloaded.contentType).toLowerCase().startsWith(expectedType)) {
      try { fs.rmSync(destination, { force: true }) } catch {}
      throw Object.assign(new Error(`Tipe file ${kind} tidak valid.`), { status: 400 })
    }
    const loadedProfile = loadJadibotConfig(number, path.join(SESSION_DIR, number))
    const profile = getSubBot(number)?.botConfig || loadedProfile
    profile.values.brandingAssets ||= {}
    profile.values.images ||= {}
    if (kind === 'menu_video') { profile.values.brandingAssets.menuVideo = destination; profile.values.brandingAssets.menuMediaType = 'video' }
    if (kind === 'menu_audio') { profile.values.brandingAssets.menuAudio = destination; profile.values.brandingAssets.menuAudioEnabled = true }
    if (kind === 'menu_banner') { profile.values.brandingAssets.menu = destination; profile.values.brandingAssets.menuMediaType = 'image' }
    if (kind === 'welcome_image') { profile.values.brandingAssets.welcomeBanner = destination; profile.values.brandingAssets.banner = destination }
    if (kind === 'goodbye_image') profile.values.brandingAssets.goodbyeBanner = destination
    if (kind === 'thumbnail') profile.values.brandingAssets.thumbnail = destination
    if (kind === 'logo') { profile.values.brandingAssets.avatar = destination; profile.values.images.ratio_1_1 = { ...(profile.values.images.ratio_1_1 || {}), url: sourceUrl, url_fallback: sourceUrl } }
    saveJadibotConfig(profile)
    appendSessionLog(number, 'media', `${kind} diperbarui oleh ${user.email} (${downloaded.size} byte).`)
    return send(res, 200, { ok: true, kind, path: destination, size: downloaded.size, content_type: downloaded.contentType })
  }

  if (pathname === '/api/notify/test' && req.method === 'POST') {
    const input = await bodyJson(req); const number = normalizeBotNumber(input.session_id); ownedSession(user, number)
    const conn = getSubBot(number); if (!conn) throw Object.assign(new Error('Jadibot sedang offline.'), { status: 409 })
    const jid = safeText(input.group_jid, 100); if (!/@(g\.us|s\.whatsapp\.net)$/.test(jid)) throw Object.assign(new Error('JID tujuan tidak valid.'), { status: 400 })
    await conn.sendMessage(jid, { text: safeText(input.message || 'Tes notifikasi Usanagi Umi Jadibot', 2000) })
    return send(res, 200, { ok: true })
  }

  // Proxy media YouTube (pengganti wss://stream.kanara.my.id yang sudah mati).
  // Dipakai player .ytplay / .play3 supaya video tetap bisa diputar di HP
  // walau link googlevideo terikat ke IP server.
  if (pathname === '/media/yt') return handleMediaProxy(req, res, url)

  return send(res, 404, { error: 'Endpoint tidak ditemukan.' })
}

export function startJadibotPlatformApi() {
  if (server || config().enabled === false) return server
  startUmiAgentWorker(() => ownerConsoleRelayKey())
  startPanelAutoOrder(() => ownerConsoleRelayKey())
  const port = Number(config().apiPort) || 2144
  server = http.createServer((req, res) => {
    route(req, res).catch(error => {
      const status = Number(error?.status) || 500
      if (status >= 500) console.error('[JADIBOT-API]', error)
      if (!res.headersSent) send(res, status, { error: error?.message || 'Internal server error.' })
      else res.end()
    })
  })
  server.on('error', error => console.error('[JADIBOT-API] Server error:', error.message))
  server.listen(port, '0.0.0.0', () => console.log(`[JADIBOT-API] Aktif di 0.0.0.0:${port}`))
  return server
}

export function stopJadibotPlatformApi() {
  return new Promise(resolve => {
    if (!server) return resolve()
    server.close(() => { server = null; resolve() })
  })
}

export default { startJadibotPlatformApi, stopJadibotPlatformApi }
