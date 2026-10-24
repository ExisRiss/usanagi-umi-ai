/*
 * Usanagi Umi Panel Auto Order — private configuration vault and wallet ledger.
 *
 * Pterodactyl, TriPay, and wallet state stay in the bot runtime. Browser
 * callers receive safe metadata only; secrets are AES-256-GCM encrypted.
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import dns from 'node:dns/promises'
import net from 'node:net'
import { creditWallet as creditWalletCore, debitWallet as debitWalletCore, DATA_DIR, readWalletFile, WALLET_FILE, writeWalletFile } from './wallet-core.js'

const ROOT = process.cwd()
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.enc.json')
const AUDIT_FILE = path.join(DATA_DIR, 'audit.jsonl')
const TRIPAY_CREATE_URL = 'https://tripay.co.id/api/transaction/create'
const TOPUP_MIN_IDR = 10_000
const GAME_TOPUP_MIN_IDR = Math.max(1000, Number(process.env.UMI_GAME_TOPUP_MIN || 5000))
const GAME_TOPUP_MAX_IDR = Math.max(GAME_TOPUP_MIN_IDR, Number(process.env.UMI_GAME_TOPUP_MAX || 200000))
function gameAsRate() { const rate = Number(process.env.UMI_GAME_AS_PER_1000 || 10); return Number.isFinite(rate) && rate > 0 ? rate : 10 }
const TOPUP_MAX_IDR = 5_000_000
const TOPUP_EXPIRY_SECONDS = 24 * 60 * 60
const MAX_LEDGER_PER_USER = 50
const MAX_TOPUPS_PER_USER = 30
const DEFAULT_SITE_URL = 'https://website-jadibot-by-alzriss.vercel.app'
const DEFAULT_PACKAGES = [
  { id: 'starter-1', name: 'Starter 1 GB', description: 'Paket awal, dapat diubah owner sebelum dipublikasikan.', price: 0, memoryMb: 1024, cpuPercent: 40, diskMb: 1024, enabled: false },
  { id: 'starter-2', name: 'Starter 2 GB', description: 'Paket awal, dapat diubah owner sebelum dipublikasikan.', price: 0, memoryMb: 2048, cpuPercent: 70, diskMb: 2048, enabled: false },
  { id: 'starter-4', name: 'Starter 4 GB', description: 'Paket awal, dapat diubah owner sebelum dipublikasikan.', price: 0, memoryMb: 4096, cpuPercent: 120, diskMb: 4096, enabled: false },
]

let secretProvider = null

function safeText(value, max = 500) {
  return String(value ?? '').replace(/\u0000/g, '').trim().slice(0, max)
}

function nowIso() { return new Date().toISOString() }

function ensureDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 })
  try { fs.chmodSync(DATA_DIR, 0o700) } catch {}
}

function writeJsonAtomic(filename, data) {
  ensureDir()
  const temporary = `${filename}.${process.pid}.${crypto.randomUUID()}.tmp`
  fs.writeFileSync(temporary, `${JSON.stringify(data)}\n`, { mode: 0o600 })
  fs.renameSync(temporary, filename)
  try { fs.chmodSync(filename, 0o600) } catch {}
}

function audit(event, metadata = {}) {
  try {
    ensureDir()
    const safe = {}
    for (const [key, value] of Object.entries(metadata)) safe[key] = safeText(value, 300)
    fs.appendFileSync(AUDIT_FILE, `${JSON.stringify({ at: nowIso(), event, ...safe })}\n`, { mode: 0o600 })
  } catch {}
}

function keyMaterial() {
  const source = String(secretProvider?.() || '')
  if (source.length < 32) throw Object.assign(new Error('Secret runtime owner belum dikonfigurasi.'), { status: 503 })
  return crypto.hkdfSync('sha256', Buffer.from(source), Buffer.from('umi-panel-autoorder-salt-v1'), Buffer.from('umi-panel-autoorder-settings'), 32)
}

function encrypt(value) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', keyMaterial(), iv)
  const data = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()])
  return { iv: iv.toString('base64url'), tag: cipher.getAuthTag().toString('base64url'), data: data.toString('base64url') }
}

function decrypt(value) {
  if (!value?.iv || !value?.tag || !value?.data) return ''
  const decipher = crypto.createDecipheriv('aes-256-gcm', keyMaterial(), Buffer.from(value.iv, 'base64url'))
  decipher.setAuthTag(Buffer.from(value.tag, 'base64url'))
  return Buffer.concat([decipher.update(Buffer.from(value.data, 'base64url')), decipher.final()]).toString('utf8')
}

function defaultSettings() {
  return {
    version: 2,
    panelUrl: '',
    siteUrl: DEFAULT_SITE_URL,
    paymentMode: 'manual_dana',
    tripayChannel: 'DANA',
    pterodactyl: { plta: null, pltc: null },
    tripay: { merchantCode: null, apiKey: null, privateKey: null },
    packages: DEFAULT_PACKAGES,
    provisioning: { eggId: 0, locationId: 0, dockerImage: '', startup: '', environment: {} },
    products: [],
    updatedAt: '',
    updatedBy: '',
  }
}

function readRaw() {
  ensureDir()
  try {
    const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'))
    if (!data || typeof data !== 'object') throw new Error('invalid settings')
    const defaults = defaultSettings()
    return {
      ...defaults,
      ...data,
      pterodactyl: { ...defaults.pterodactyl, ...(data.pterodactyl || {}) },
      tripay: { ...defaults.tripay, ...(data.tripay || {}) },
      packages: Array.isArray(data.packages) ? data.packages : defaults.packages,
      provisioning: { ...defaults.provisioning, ...(data.provisioning && typeof data.provisioning === 'object' ? data.provisioning : {}) },
      products: Array.isArray(data.products) ? data.products : defaults.products,
    }
  } catch {
    return defaultSettings()
  }
}

function writeRaw(next) { writeJsonAtomic(SETTINGS_FILE, next) }

function defaultWallet() { return { version: 1, accounts: {}, ledger: [], topups: {}, orders: {} } }

function readWallet() { return readWalletFile() }

function writeWallet(wallet) { writeWalletFile(wallet) }

/** Kredit saldo Wallet (idempoten per referensi) — dipakai integrasi game web & refund. */
export function creditWalletForGame(input) {
  const result = creditWalletCore(input)
  audit('wallet.game.credit', { userId: input?.userId, amount: input?.amount, reference: input?.reference, duplicate: result.duplicate })
  return result
}

/** Debit saldo Wallet (idempoten per referensi) — dipakai saat tukar Rp → $AS. */
export function debitWalletForGame(input) {
  const result = debitWalletCore(input)
  audit('wallet.game.debit', { userId: input?.userId, amount: input?.amount, reference: input?.reference, duplicate: result.duplicate })
  return result
}

/** Koreksi manual owner (amount negatif = tarik, positif = tambah) dengan catatan audit. */
export function adjustWallet({ userId, amount, reference, description = '', actor = 'owner' }) {
  const value = Math.trunc(Number(amount))
  if (!Number.isFinite(value) || value === 0) throw Object.assign(new Error('Jumlah koreksi tidak valid.'), { status: 400 })
  const ref = safeText(reference, 120) || `adjust-${Date.now()}`
  const note = safeText(description, 180) || 'Koreksi manual owner'
  const result = value < 0
    ? debitWalletCore({ userId, amount: Math.abs(value), reference: ref, type: 'ADJUSTMENT', description: `${note} (${actor})` })
    : creditWalletCore({ userId, amount: value, reference: ref, type: 'ADJUSTMENT', description: `${note} (${actor})` })
  audit('wallet.adjust', { actor, userId, amount: value, reference: ref, duplicate: result.duplicate })
  return { ...walletView(userId), duplicate: result.duplicate, reference: ref }
}

function publicPackages(value) {
  return (Array.isArray(value) ? value : []).map(item => ({
    id: safeText(item.id, 40), name: safeText(item.name, 80), description: safeText(item.description, 240),
    price: Number(item.price) || 0, memoryMb: Number(item.memoryMb) || 0, cpuPercent: Number(item.cpuPercent) || 0,
    diskMb: Number(item.diskMb) || 0, enabled: item.enabled === true,
  })).filter(item => item.id && item.name)
}

function callbackUrl(raw) { return `${String(raw.siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, '')}/api/payment/tripay/callback` }
function manualQrUrl(raw) { return `${String(raw.siteUrl || DEFAULT_SITE_URL).replace(/\/+$/, '')}/assets/dana-manual-qr.png` }
function manualMode(raw) { return raw.paymentMode !== 'tripay' }

function publicStatus(raw = readRaw()) {
  const pterodactylReady = Boolean(raw.panelUrl && raw.pterodactyl?.plta)
  const isManual = manualMode(raw)
  const paymentReady = isManual ? Boolean(raw.siteUrl) : Boolean(raw.tripay?.merchantCode && raw.tripay?.apiKey && raw.tripay?.privateKey && raw.siteUrl)
  return {
    configured: pterodactylReady,
    panelUrl: raw.panelUrl || null,
    siteUrl: raw.siteUrl || null,
    pltaConfigured: Boolean(raw.pterodactyl?.plta),
    pltcConfigured: Boolean(raw.pterodactyl?.pltc),
    payment: isManual
      ? { provider: 'manual', mode: 'manual_dana', configured: paymentReady, channel: 'DANA', callbackUrl: null, qrUrl: paymentReady ? manualQrUrl(raw) : null, approvalRequired: true }
      : { provider: 'tripay', mode: 'tripay', configured: paymentReady, channel: raw.tripayChannel || 'DANA', callbackUrl: paymentReady ? callbackUrl(raw) : null, qrUrl: null, approvalRequired: false },
    wallet: { enabled: paymentReady, mode: isManual ? 'manual_dana' : 'tripay', minimumTopupIdr: TOPUP_MIN_IDR, maximumTopupIdr: TOPUP_MAX_IDR },
    checkoutReady: pterodactylReady && Boolean(raw.pterodactyl?.pltc) && paymentReady,
    packages: publicPackages(raw.packages),
    provisioning: {
      eggId: Number(raw.provisioning?.eggId) || 0,
      locationId: Number(raw.provisioning?.locationId) || 0,
      dockerImage: safeText(raw.provisioning?.dockerImage, 200),
      startup: safeText(raw.provisioning?.startup, 500),
      ready: pterodactylReady && Number(raw.provisioning?.eggId) > 0 && Number(raw.provisioning?.locationId) > 0,
    },
    products: publicProducts(raw.products),
    updatedAt: raw.updatedAt || null,
  }
}

function publicProducts(value) {
  return (Array.isArray(value) ? value : []).map(item => ({
    id: safeText(item.id, 40), name: safeText(item.name, 80), description: safeText(item.description, 240),
    price: Number(item.price) || 0, type: safeText(item.type, 20), days: Number(item.days) || 0,
    enabled: item.enabled === true, inStock: item.type === 'digital' ? (Array.isArray(item.stock) ? item.stock.length : 0) : null,
  })).filter(item => item.id && item.name)
}

function validateProducts(value) {
  if (!Array.isArray(value) || value.length > 30) throw Object.assign(new Error('Katalog produk harus berisi maksimal 30 item.'), { status: 400 })
  const seen = new Set()
  return value.map((item) => {
    const id = packageId(item?.id)
    const name = safeText(item?.name, 80)
    const type = safeText(item?.type, 20).toLowerCase()
    const price = Number(item?.price)
    if (!id || seen.has(id)) throw Object.assign(new Error('ID produk tidak valid atau duplikat.'), { status: 400 })
    seen.add(id)
    if (!name) throw Object.assign(new Error('Nama produk diperlukan.'), { status: 400 })
    if (!['premium', 'digital'].includes(type)) throw Object.assign(new Error('Tipe produk harus premium atau digital.'), { status: 400 })
    if (!Number.isSafeInteger(price) || price < 100) throw Object.assign(new Error('Harga produk minimal Rp100.'), { status: 400 })
    const days = Number(item?.days)
    if (type === 'premium' && (!Number.isInteger(days) || days < 1 || days > 365)) throw Object.assign(new Error('Durasi premium harus 1–365 hari.'), { status: 400 })
    const stock = type === 'digital' ? (Array.isArray(item?.stock) ? item.stock.map(s => safeText(s, 300)).filter(Boolean).slice(0, 500) : []) : []
    return { id, name, description: safeText(item?.description, 240), price, type, days: type === 'premium' ? days : 0, stock, enabled: item?.enabled === true }
  })
}

function isPrivateIp(address) {
  const version = net.isIP(address)
  if (version === 4) {
    const [a, b] = address.split('.').map(Number)
    return a === 0 || a === 10 || a === 127 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168 || a === 100 && b >= 64 && b <= 127
  }
  if (version === 6) {
    const normalized = address.toLowerCase()
    return normalized === '::1' || normalized === '::' || normalized.startsWith('fc') || normalized.startsWith('fd') || normalized.startsWith('fe80:') || normalized.startsWith('::ffff:127.')
  }
  return true
}

async function normalizePublicOrigin(value, label) {
  let url
  try { url = new URL(safeText(value, 500)) } catch { throw Object.assign(new Error(`URL ${label} tidak valid.`), { status: 400 }) }
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || (url.pathname && url.pathname !== '/')) {
    throw Object.assign(new Error(`URL ${label} harus berupa origin HTTPS publik tanpa path, query, atau kredensial.`), { status: 400 })
  }
  const hostname = url.hostname.toLowerCase()
  if (hostname === 'localhost' || net.isIP(hostname) && isPrivateIp(hostname)) throw Object.assign(new Error(`URL ${label} tidak boleh menunjuk ke host lokal/pribadi.`), { status: 400 })
  let addresses
  try { addresses = await dns.lookup(hostname, { all: true, verbatim: true }) } catch { throw Object.assign(new Error(`Domain URL ${label} tidak dapat di-resolve.`), { status: 400 }) }
  if (!addresses.length || addresses.some(item => isPrivateIp(item.address))) throw Object.assign(new Error(`URL ${label} harus mengarah ke alamat IP publik.`), { status: 400 })
  return url.origin
}

function secretToken(value, label, prefix = '') {
  const result = safeText(value, 1000)
  if (!result) return ''
  if (result.length < 20 || !/^[A-Za-z0-9._~-]+$/.test(result) || (prefix && !result.startsWith(prefix))) {
    throw Object.assign(new Error(`${label} tidak valid.`), { status: 400 })
  }
  return result
}

function optionalFlag(input, name) { return input?.[name] === true }

export async function updatePanelSettings(input, actor) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw Object.assign(new Error('Konfigurasi Panel tidak valid.'), { status: 400 })
  const previous = readRaw()
  const next = structuredClone(previous)
  if (Object.prototype.hasOwnProperty.call(input, 'panelUrl')) next.panelUrl = await normalizePublicOrigin(input.panelUrl, 'Panel')
  if (Object.prototype.hasOwnProperty.call(input, 'siteUrl')) next.siteUrl = await normalizePublicOrigin(input.siteUrl, 'Website')
  if (Object.prototype.hasOwnProperty.call(input, 'paymentMode')) {
    const mode = safeText(input.paymentMode, 30).toLowerCase()
    if (!['manual_dana', 'tripay'].includes(mode)) throw Object.assign(new Error('Mode pembayaran tidak valid.'), { status: 400 })
    next.paymentMode = mode
  }
  if (Object.prototype.hasOwnProperty.call(input, 'tripayChannel')) {
    const channel = safeText(input.tripayChannel, 40).toUpperCase()
    if (!/^[A-Z0-9_-]{2,40}$/.test(channel)) throw Object.assign(new Error('Kode channel TriPay tidak valid.'), { status: 400 })
    next.tripayChannel = channel
  }

  const nextPlta = optionalFlag(input, 'clearPlta') ? '' : secretToken(input.plta, 'PLTA', 'ptla_')
  const nextPltc = optionalFlag(input, 'clearPltc') ? '' : secretToken(input.pltc, 'PLTC', 'ptlc_')
  if (optionalFlag(input, 'clearPlta')) next.pterodactyl.plta = null
  else if (nextPlta) next.pterodactyl.plta = encrypt(nextPlta)
  if (optionalFlag(input, 'clearPltc')) next.pterodactyl.pltc = null
  else if (nextPltc) next.pterodactyl.pltc = encrypt(nextPltc)

  const merchant = optionalFlag(input, 'clearTripay') ? '' : safeText(input.tripayMerchantCode, 160)
  const tripayApiKey = optionalFlag(input, 'clearTripay') ? '' : secretToken(input.tripayApiKey, 'TriPay API key')
  const tripayPrivateKey = optionalFlag(input, 'clearTripay') ? '' : secretToken(input.tripayPrivateKey, 'TriPay private key')
  if (optionalFlag(input, 'clearTripay')) next.tripay = { merchantCode: null, apiKey: null, privateKey: null }
  else {
    if (merchant) {
      if (!/^[A-Za-z0-9_-]{3,160}$/.test(merchant)) throw Object.assign(new Error('Merchant code TriPay tidak valid.'), { status: 400 })
      next.tripay.merchantCode = encrypt(merchant)
    }
    if (tripayApiKey) next.tripay.apiKey = encrypt(tripayApiKey)
    if (tripayPrivateKey) next.tripay.privateKey = encrypt(tripayPrivateKey)
  }

  if (input.provisioning && typeof input.provisioning === 'object' && !Array.isArray(input.provisioning)) {
    const prov = input.provisioning
    const eggId = Number(prov.eggId), locationId = Number(prov.locationId)
    if (prov.eggId !== undefined && (!Number.isInteger(eggId) || eggId < 0 || eggId > 100000)) throw Object.assign(new Error('ID Egg tidak valid.'), { status: 400 })
    if (prov.locationId !== undefined && (!Number.isInteger(locationId) || locationId < 0 || locationId > 100000)) throw Object.assign(new Error('ID Lokasi tidak valid.'), { status: 400 })
    if (prov.eggId !== undefined) next.provisioning.eggId = eggId
    if (prov.locationId !== undefined) next.provisioning.locationId = locationId
    if (prov.dockerImage !== undefined) next.provisioning.dockerImage = safeText(prov.dockerImage, 200)
    if (prov.startup !== undefined) next.provisioning.startup = safeText(prov.startup, 500)
    if (prov.environment !== undefined) {
      if (!prov.environment || typeof prov.environment !== 'object' || Array.isArray(prov.environment)) throw Object.assign(new Error('Environment provisioning tidak valid.'), { status: 400 })
      const env = {}
      for (const [k, v] of Object.entries(prov.environment).slice(0, 30)) env[safeText(k, 60)] = safeText(v, 300)
      next.provisioning.environment = env
    }
  }
  if (Object.prototype.hasOwnProperty.call(input, 'products')) next.products = validateProducts(input.products)

  if (next.panelUrl && !next.pterodactyl.plta) throw Object.assign(new Error('PLTA diperlukan setelah URL Panel diatur.'), { status: 400 })
  next.updatedAt = nowIso()
  next.updatedBy = safeText(actor, 100)
  writeRaw(next)
  audit('panel.settings.updated', { actor, plta: Boolean(next.pterodactyl.plta), pltc: Boolean(next.pterodactyl.pltc), tripay: Boolean(next.tripay.apiKey && next.tripay.privateKey && next.tripay.merchantCode) })
  return publicStatus(next)
}

async function pterodactylFetch(raw, type, pathname) {
  const token = decrypt(raw.pterodactyl?.[type])
  if (!raw.panelUrl || !token) throw Object.assign(new Error(type === 'plta' ? 'URL Panel dan PLTA belum dikonfigurasi.' : 'URL Panel dan PLTC bridge belum dikonfigurasi.'), { status: 409 })
  const prefix = type === 'plta' ? '/api/application' : '/api/client'
  const response = await fetch(`${raw.panelUrl}${prefix}${pathname}`, {
    headers: { Accept: 'Application/vnd.pterodactyl.v1+json', Authorization: `Bearer ${token}` }, redirect: 'error', signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) {
    const message = response.status === 401 || response.status === 403 ? 'Token Panel ditolak atau tidak memiliki izin yang diperlukan.' : `Panel merespons HTTP ${response.status}.`
    throw Object.assign(new Error(message), { status: response.status >= 500 ? 502 : 400 })
  }
  return response
}

export async function testPanelConnection(actor) {
  const raw = readRaw()
  const result = { pterodactyl: false, bridge: false, payment: Boolean(raw.tripay?.merchantCode && raw.tripay?.apiKey && raw.tripay?.privateKey) }
  try { await pterodactylFetch(raw, 'plta', '/locations?per_page=1'); result.pterodactyl = true } catch (error) { audit('panel.connection.failed', { actor, target: 'plta', message: error.message }); throw error }
  if (raw.pterodactyl?.pltc) {
    try { await pterodactylFetch(raw, 'pltc', '?per_page=1'); result.bridge = true } catch (error) { audit('panel.connection.failed', { actor, target: 'pltc', message: error.message }); throw error }
  }
  audit('panel.connection.tested', { actor, plta: result.pterodactyl, pltc: result.bridge })
  return { ok: true, ...result }
}

function packageId(value) { return safeText(value, 40).toLowerCase().replace(/[^a-z0-9-]/g, '') }

function validatePackages(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 20) throw Object.assign(new Error('Katalog harus berisi 1–20 paket.'), { status: 400 })
  const seen = new Set()
  return value.map((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw Object.assign(new Error(`Paket #${index + 1} tidak valid.`), { status: 400 })
    const id = packageId(item.id || item.name)
    const name = safeText(item.name, 80)
    const description = safeText(item.description, 240)
    const number = (key, min, max) => {
      const parsed = Number(item[key])
      if (!Number.isInteger(parsed) || parsed < min || parsed > max) throw Object.assign(new Error(`${key} paket ${name || index + 1} tidak valid.`), { status: 400 })
      return parsed
    }
    if (!id || !name || seen.has(id)) throw Object.assign(new Error('ID/nama paket tidak valid atau duplikat.'), { status: 400 })
    seen.add(id)
    return { id, name, description, price: number('price', 0, 100000000), memoryMb: number('memoryMb', 128, 1048576), cpuPercent: number('cpuPercent', 1, 100000), diskMb: number('diskMb', 128, 10485760), enabled: item.enabled === true }
  })
}

export function updatePanelPackages(input, actor) {
  const raw = readRaw()
  raw.packages = validatePackages(input?.packages)
  raw.updatedAt = nowIso()
  raw.updatedBy = safeText(actor, 100)
  writeRaw(raw)
  audit('panel.packages.updated', { actor, count: raw.packages.length })
  return publicStatus(raw)
}

function requireUserId(value) {
  const userId = safeText(value, 128)
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(userId)) throw Object.assign(new Error('Identitas akun Wallet tidak valid.'), { status: 400 })
  return userId
}

function safeBalance(value) { return Number.isSafeInteger(value) && value >= 0 ? value : 0 }

function accountFor(wallet, userId) {
  const current = wallet.accounts[userId]
  if (!current || typeof current !== 'object') wallet.accounts[userId] = { balance: 0, updatedAt: nowIso() }
  wallet.accounts[userId].balance = safeBalance(wallet.accounts[userId].balance)
  return wallet.accounts[userId]
}

function publicLedger(row) {
  return { id: safeText(row.id, 80), type: safeText(row.type, 40), amount: Number(row.amount) || 0, balanceAfter: safeBalance(row.balanceAfter), reference: safeText(row.reference, 120), description: safeText(row.description, 180), createdAt: safeText(row.createdAt, 64) }
}

function publicTopup(row) {
  return {
    id: safeText(row.id, 80), merchantRef: safeText(row.merchantRef, 100), reference: safeText(row.reference, 120) || null,
    amount: Number(row.amount) || 0, totalAmount: Number(row.totalAmount) || 0, feeCustomer: Number(row.feeCustomer) || 0,
    status: safeText(row.status, 32), checkoutUrl: safeText(row.checkoutUrl, 1200) || null,
    payCode: safeText(row.payCode, 160) || null, paymentName: safeText(row.paymentName, 120) || null,
    expiresAt: safeText(row.expiresAt, 64) || null, paidAt: safeText(row.paidAt, 64) || null, createdAt: safeText(row.createdAt, 64),
  }
}

function walletView(userId) {
  const wallet = readWallet()
  const account = accountFor(wallet, userId)
  return {
    balance: safeBalance(account.balance), currency: 'IDR', minimumTopupIdr: TOPUP_MIN_IDR, maximumTopupIdr: TOPUP_MAX_IDR,
    gameConversion: { enabled: true, asPer1000Idr: gameAsRate(), minIdr: GAME_TOPUP_MIN_IDR, maxIdr: GAME_TOPUP_MAX_IDR, currency: 'AS' },
    ledger: wallet.ledger.filter(item => item.userId === userId).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, MAX_LEDGER_PER_USER).map(publicLedger),
    topups: Object.values(wallet.topups).filter(item => item.userId === userId).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, MAX_TOPUPS_PER_USER).map(publicTopup),
  }
}

function tripaySettings(raw) {
  const merchantCode = decrypt(raw.tripay?.merchantCode)
  const apiKey = decrypt(raw.tripay?.apiKey)
  const privateKey = decrypt(raw.tripay?.privateKey)
  if (!merchantCode || !apiKey || !privateKey || !raw.siteUrl) throw Object.assign(new Error('Top up belum diaktifkan oleh owner. Konfigurasi TriPay DANA belum lengkap.'), { status: 503 })
  return { merchantCode, apiKey, privateKey, channel: raw.tripayChannel || 'DANA' }
}

function tripaySignature(privateKey, value) { return crypto.createHmac('sha256', privateKey).update(value).digest('hex') }

function topupId() { return `tu_${Date.now().toString(36)}_${crypto.randomBytes(8).toString('hex')}` }
function merchantRef(id) { return `UMITOP-${id.slice(3).toUpperCase().replace(/[^A-Z0-9]/g, '')}`.slice(0, 80) }

function callbackSafeEqual(expected, received) {
  const left = Buffer.from(String(expected), 'utf8')
  const right = Buffer.from(String(received || ''), 'utf8')
  return left.length === right.length && crypto.timingSafeEqual(left, right)
}

export function walletStatus(user) {
  const userId = requireUserId(user?.id)
  const raw = readRaw()
  const isManual = manualMode(raw)
  const enabled = isManual ? Boolean(raw.siteUrl) : Boolean(raw.tripay?.merchantCode && raw.tripay?.apiKey && raw.tripay?.privateKey && raw.siteUrl)
  return { enabled, provider: isManual ? 'manual' : 'tripay', mode: isManual ? 'manual_dana' : 'tripay', channel: isManual ? 'DANA' : raw.tripayChannel || 'DANA', manualPayment: isManual ? { qrUrl: manualQrUrl(raw), approvalRequired: true } : null, ...walletView(userId) }
}

function createManualWalletTopup(user, amount, raw) {
  const userId = requireUserId(user?.id)
  const wallet = readWallet()
  const pending = Object.values(wallet.topups).filter(item => item.userId === userId && item.status === 'WAITING_APPROVAL').length
  if (pending >= 3) throw Object.assign(new Error('Masih ada 3 permintaan top up menunggu verifikasi. Tunggu owner memeriksa pembayaranmu.'), { status: 409 })
  const id = topupId(); const createdAt = nowIso()
  const entry = { id, userId, merchantRef: merchantRef(id), reference: '', amount, totalAmount: amount, feeCustomer: 0, status: 'WAITING_APPROVAL', checkoutUrl: manualQrUrl(raw), payCode: '', paymentName: 'DANA Manual', expiresAt: '', paidAt: '', createdAt, updatedAt: createdAt }
  wallet.topups[id] = entry
  writeWallet(wallet)
  audit('wallet.manual_topup.requested', { userId, topupId: id, amount })
  return { topup: publicTopup(entry), wallet: walletView(userId) }
}

export async function createWalletTopup(user, input) {
  const userId = requireUserId(user?.id)
  const amount = Number(input?.amount)
  if (!Number.isInteger(amount) || amount < TOPUP_MIN_IDR || amount > TOPUP_MAX_IDR) throw Object.assign(new Error(`Nominal top up harus Rp${TOPUP_MIN_IDR.toLocaleString('id-ID')}–Rp${TOPUP_MAX_IDR.toLocaleString('id-ID')}.`), { status: 400 })
  const raw = readRaw()
  if (manualMode(raw)) return createManualWalletTopup(user, amount, raw)
  const gateway = tripaySettings(raw)
  const wallet = readWallet()
  const pending = Object.values(wallet.topups).filter(item => item.userId === userId && ['CREATING', 'UNPAID'].includes(String(item.status))).length
  if (pending >= 3) throw Object.assign(new Error('Masih ada 3 invoice top up aktif. Selesaikan atau tunggu hingga kedaluwarsa.'), { status: 409 })

  const id = topupId()
  const reference = merchantRef(id)
  const createdAt = nowIso()
  const entry = { id, userId, merchantRef: reference, reference: '', amount, totalAmount: 0, feeCustomer: 0, status: 'CREATING', checkoutUrl: '', payCode: '', paymentName: '', expiresAt: new Date(Date.now() + TOPUP_EXPIRY_SECONDS * 1000).toISOString(), paidAt: '', createdAt, updatedAt: createdAt }
  wallet.topups[id] = entry
  writeWallet(wallet)

  const signature = tripaySignature(gateway.privateKey, `${gateway.merchantCode}${reference}${amount}`)
  const form = new URLSearchParams()
  form.set('method', gateway.channel)
  form.set('merchant_ref', reference)
  form.set('amount', String(amount))
  form.set('customer_name', safeText(user?.email, 100).split('@')[0] || 'Umi Customer')
  form.set('customer_email', safeText(user?.email, 320))
  form.set('order_items[0][sku]', 'UMI-WALLET')
  form.set('order_items[0][name]', 'Top Up Saldo Umi')
  form.set('order_items[0][price]', String(amount))
  form.set('order_items[0][quantity]', '1')
  form.set('callback_url', callbackUrl(raw))
  form.set('return_url', `${raw.siteUrl.replace(/\/+$/, '')}/#wallet`)
  form.set('expired_time', String(Math.floor(Date.now() / 1000) + TOPUP_EXPIRY_SECONDS))
  form.set('signature', signature)

  let response; let payload
  try {
    response = await fetch(TRIPAY_CREATE_URL, { method: 'POST', headers: { Authorization: `Bearer ${gateway.apiKey}`, 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body: form, signal: AbortSignal.timeout(30_000) })
    payload = await response.json().catch(() => ({}))
  } catch (error) {
    const latest = readWallet(); if (latest.topups[id]) { latest.topups[id].status = 'CREATE_FAILED'; latest.topups[id].updatedAt = nowIso(); writeWallet(latest) }
    throw Object.assign(new Error('Gateway pembayaran tidak dapat dihubungi. Coba lagi.'), { status: 502 })
  }
  if (!response.ok || payload?.success !== true || !payload?.data?.reference) {
    const latest = readWallet(); if (latest.topups[id]) { latest.topups[id].status = 'CREATE_FAILED'; latest.topups[id].updatedAt = nowIso(); writeWallet(latest) }
    throw Object.assign(new Error(safeText(payload?.message, 300) || 'Gateway menolak pembuatan invoice top up.'), { status: 502 })
  }

  const data = payload.data
  const latest = readWallet()
  const stored = latest.topups[id]
  if (!stored) throw Object.assign(new Error('Invoice top up tidak dapat disimpan.'), { status: 500 })
  Object.assign(stored, {
    reference: safeText(data.reference, 120), status: safeText(data.status, 32).toUpperCase() || 'UNPAID',
    totalAmount: Number(data.total_amount ?? data.amount) || amount, feeCustomer: Number(data.fee_customer) || 0,
    checkoutUrl: safeText(data.checkout_url || data.pay_url, 1200), payCode: safeText(data.pay_code, 160),
    paymentName: safeText(data.payment_name, 120), expiresAt: Number(data.expired_time) > 0 ? new Date(Number(data.expired_time) * 1000).toISOString() : stored.expiresAt,
    updatedAt: nowIso(),
  })
  writeWallet(latest)
  audit('wallet.topup.created', { userId, topupId: id, amount, reference: stored.reference })
  return { topup: publicTopup(stored), wallet: walletView(userId) }
}

export function manualTopupRequests() {
  const wallet = readWallet()
  return Object.values(wallet.topups).filter(item => item.status === 'WAITING_APPROVAL').sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt))).slice(0, 100).map(publicTopup)
}

function findManualTopup(wallet, id) {
  const clean = safeText(id, 100)
  const topup = wallet.topups[clean]
  if (!topup || topup.status !== 'WAITING_APPROVAL') throw Object.assign(new Error('Permintaan top up tidak ditemukan atau sudah diproses.'), { status: 404 })
  return topup
}

export function reviewManualTopup({ id, decision, actor }) {
  const action = safeText(decision, 20).toLowerCase()
  if (!['approve', 'reject'].includes(action)) throw Object.assign(new Error('Keputusan verifikasi top up tidak valid.'), { status: 400 })
  const wallet = readWallet()
  const topup = findManualTopup(wallet, id)
  if (action === 'approve') {
    const account = accountFor(wallet, topup.userId)
    const nextBalance = safeBalance(account.balance) + Number(topup.amount)
    if (!Number.isSafeInteger(nextBalance) || nextBalance > 1_000_000_000) throw Object.assign(new Error('Batas saldo akun terlampaui.'), { status: 409 })
    account.balance = nextBalance; account.updatedAt = nowIso()
    topup.status = 'PAID'; topup.paidAt = nowIso(); topup.approvedBy = safeText(actor, 100)
    wallet.ledger.push({ id: `wl_${crypto.randomUUID()}`, userId: topup.userId, type: 'TOPUP_MANUAL', amount: topup.amount, balanceAfter: nextBalance, reference: topup.merchantRef, description: 'Top up DANA manual disetujui owner', createdAt: nowIso() })
  } else {
    topup.status = 'REJECTED'; topup.rejectedBy = safeText(actor, 100)
  }
  topup.updatedAt = nowIso()
  writeWallet(wallet)
  audit(`wallet.manual_topup.${action}d`, { actor, topupId: topup.id, amount: topup.amount })
  return { topup: publicTopup(topup), wallet: walletView(topup.userId) }
}

export function handleTripayCallback({ rawBody, signature, event }) {
  const raw = String(rawBody ?? '')
  if (!raw || Buffer.byteLength(raw) > 128 * 1024) throw Object.assign(new Error('Payload callback tidak valid.'), { status: 400 })
  const settings = readRaw()
  const gateway = tripaySettings(settings)
  const expected = tripaySignature(gateway.privateKey, raw)
  if (!callbackSafeEqual(expected, signature) || safeText(event, 64) !== 'payment_status') throw Object.assign(new Error('Signature callback pembayaran tidak valid.'), { status: 401 })
  let data
  try { data = JSON.parse(raw) } catch { throw Object.assign(new Error('JSON callback pembayaran tidak valid.'), { status: 400 }) }
  const merchant = safeText(data?.merchant_ref, 100)
  const reference = safeText(data?.reference, 120)
  const status = safeText(data?.status, 32).toUpperCase()
  if (!merchant || !reference || !['PAID', 'FAILED', 'EXPIRED'].includes(status)) throw Object.assign(new Error('Status callback pembayaran tidak didukung.'), { status: 400 })

  const wallet = readWallet()
  const topup = Object.values(wallet.topups).find(item => item.merchantRef === merchant)
  if (!topup || topup.reference !== reference) throw Object.assign(new Error('Invoice pembayaran tidak ditemukan.'), { status: 404 })
  const reportedAmount = Number(data.amount)
  if (!Number.isSafeInteger(reportedAmount) || reportedAmount !== Number(topup.amount)) throw Object.assign(new Error('Nominal callback tidak sesuai invoice.'), { status: 400 })

  const wasPaid = topup.status === 'PAID'
  // A completed payment is final: ignore any delayed status regression so it
  // cannot reopen or re-credit an invoice after the ledger has settled it.
  if (wasPaid && status !== 'PAID') {
    audit('wallet.topup.callback.ignored', { topupId: topup.id, status, reference })
    return { ok: true, status: 'PAID', credited: false, alreadyProcessed: true, ignored: true }
  }
  if (status === 'PAID' && !wasPaid) {
    const account = accountFor(wallet, topup.userId)
    const nextBalance = safeBalance(account.balance) + topup.amount
    if (!Number.isSafeInteger(nextBalance) || nextBalance > 1_000_000_000) throw Object.assign(new Error('Batas saldo akun terlampaui.'), { status: 409 })
    account.balance = nextBalance
    account.updatedAt = nowIso()
    wallet.ledger.push({ id: `wl_${crypto.randomUUID()}`, userId: topup.userId, type: 'TOPUP', amount: topup.amount, balanceAfter: nextBalance, reference: topup.reference, description: 'Top up DANA TriPay tervalidasi', createdAt: nowIso() })
  }
  topup.status = status
  topup.paidAt = status === 'PAID' ? nowIso() : topup.paidAt || ''
  topup.updatedAt = nowIso()
  writeWallet(wallet)
  audit('wallet.topup.callback', { topupId: topup.id, status, reference })
  return { ok: true, status, credited: status === 'PAID' && !wasPaid, alreadyProcessed: status === 'PAID' && wasPaid }
}

// This debit primitive is intentionally not exposed to browsers. The upcoming
// provisioning flow will call it only after package ownership/availability is
// validated server-side and record its immutable order reference.
export function debitWalletForPanel({ userId, amount, orderReference, description = 'Pembelian paket panel' }) {
  const owner = requireUserId(userId)
  const debit = Number(amount)
  if (!Number.isSafeInteger(debit) || debit < 1) throw Object.assign(new Error('Jumlah debit Wallet tidak valid.'), { status: 400 })
  const reference = safeText(orderReference, 120)
  if (!reference) throw Object.assign(new Error('Referensi order diperlukan.'), { status: 400 })
  const wallet = readWallet()
  if (wallet.ledger.some(item => item.userId === owner && item.type === 'PANEL_PURCHASE' && item.reference === reference)) return walletView(owner)
  const account = accountFor(wallet, owner)
  if (account.balance < debit) throw Object.assign(new Error('Saldo tidak cukup untuk membeli paket panel.'), { status: 409 })
  account.balance -= debit
  account.updatedAt = nowIso()
  wallet.ledger.push({ id: `wl_${crypto.randomUUID()}`, userId: owner, type: 'PANEL_PURCHASE', amount: -debit, balanceAfter: account.balance, reference, description: safeText(description, 180), createdAt: nowIso() })
  writeWallet(wallet)
  audit('wallet.panel.debit', { userId: owner, reference, amount: debit })
  return walletView(owner)
}

// ── Auto-order engine (Umi Usanagi AI) ─────────────────────────────────────
// Wallet-funded instant fulfilment: Pterodactyl panel provisioning, bot
// premium activation, and stocked digital delivery. Purchases debit the
// wallet first (idempotent by order reference); any fulfilment failure
// credits an automatic refund with the same reference guard.

async function pterodactylRequest(raw, pathname, { method = 'GET', body } = {}) {
  const token = decrypt(raw.pterodactyl?.plta)
  if (!raw.panelUrl || !token) throw Object.assign(new Error('URL Panel dan PLTA belum dikonfigurasi.'), { status: 409 })
  let response
  try {
    response = await fetch(`${raw.panelUrl}/api/application${pathname}`, {
      method,
      headers: { Accept: 'Application/vnd.pterodactyl.v1+json', Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
      redirect: 'error',
      signal: AbortSignal.timeout(25_000),
    })
  } catch { throw Object.assign(new Error('Panel tidak dapat dihubungi. Dana tidak terpotong.'), { status: 502 }) }
  if (!response.ok) {
    let detail = ''
    try { const parsed = await response.json(); detail = safeText(parsed?.errors?.[0]?.detail || parsed?.message || '', 220) } catch {}
    throw Object.assign(new Error(`Panel menolak permintaan (HTTP ${response.status})${detail ? `: ${detail}` : ''}`), { status: 502 })
  }
  if (response.status === 204) return null
  return response.json().catch(() => null)
}

function creditWalletOnce({ userId, amount, reference, type, description }) {
  const owner = requireUserId(userId)
  const credit = Number(amount)
  if (!Number.isSafeInteger(credit) || credit < 1) return null
  const wallet = readWallet()
  if (wallet.ledger.some(item => item.userId === owner && item.type === type && item.reference === reference)) return walletView(owner)
  const account = accountFor(wallet, owner)
  account.balance += credit
  account.updatedAt = nowIso()
  wallet.ledger.push({ id: `wl_${crypto.randomUUID()}`, userId: owner, type, amount: credit, balanceAfter: account.balance, reference, description: safeText(description, 180), createdAt: nowIso() })
  writeWallet(wallet)
  return walletView(owner)
}

function saveOrder(order) {
  const wallet = readWallet()
  wallet.orders[order.reference] = order
  writeWallet(wallet)
  return order
}

function publicOrder(row) {
  const out = {
    reference: safeText(row.reference, 120), kind: safeText(row.kind, 20), itemId: safeText(row.itemId, 40),
    itemName: safeText(row.itemName, 80), amount: Number(row.amount) || 0, status: safeText(row.status, 24),
    createdAt: safeText(row.createdAt, 64),
  }
  if (row.panel) out.panel = { url: safeText(row.panel.url, 300), username: safeText(row.panel.username, 80), serverName: safeText(row.panel.serverName, 120), serverIdentifier: safeText(row.panel.serverIdentifier, 64) || null }
  if (row.premium) out.premium = { whatsapp: safeText(row.premium.whatsapp, 24), premiumUntil: safeText(row.premium.premiumUntil, 64) }
  if (row.deliveryEnc) { try { out.delivery = decrypt(row.deliveryEnc) } catch { out.delivery = null } }
  if (row.passwordEnc) { try { out.password = decrypt(row.passwordEnc) } catch { out.password = null } }
  return out
}

function panelProvisionReady(raw) {
  return Boolean(raw.panelUrl && raw.pterodactyl?.plta && Number(raw.provisioning?.eggId) > 0 && Number(raw.provisioning?.locationId) > 0)
}

export function shopCatalog(user) {
  const userId = requireUserId(user?.id)
  const raw = readRaw()
  const wallet = readWallet()
  const account = accountFor(wallet, userId)
  return {
    balance: safeBalance(account.balance),
    mode: manualMode(raw) ? 'manual_dana' : 'tripay',
    panelReady: panelProvisionReady(raw),
    panelUrl: raw.panelUrl || null,
    packages: publicPackages(raw.packages).filter(item => item.enabled && item.price > 0),
    products: publicProducts(raw.products).filter(item => item.enabled && item.price > 0),
  }
}

export function walletOrders(user) {
  const userId = requireUserId(user?.id)
  const wallet = readWallet()
  return Object.values(wallet.orders || {}).filter(row => row.userId === userId)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 30).map(publicOrder)
}

async function ensurePanelAccount(raw, userId, user) {
  const wallet = readWallet()
  const account = accountFor(wallet, userId)
  if (account.panelAccount?.id) return account.panelAccount
  const username = `umi${crypto.createHash('sha256').update(String(userId)).digest('hex').slice(0, 10)}`
  const suppliedEmail = safeText(user?.email, 160)
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(suppliedEmail) ? suppliedEmail : `${username}@users.umi.local`
  const password = crypto.randomBytes(10).toString('base64url')
  let created = null
  try {
    created = await pterodactylRequest(raw, '/users', { method: 'POST', body: { username, email, first_name: 'Umi', last_name: 'Panel', password } })
  } catch (error) {
    if (!/already been taken/i.test(String(error?.message || ''))) throw error
    // Akun panel sudah pernah dibuat (mis. sebelum data wallet di-reset
    // saat pindah server): adopsi akun lama, lalu reset password-nya
    // supaya kredensial yang kami simpan tetap valid untuk pembeli.
    let attrs = null
    const byEmail = await pterodactylRequest(raw, `/users?filter[email]=${encodeURIComponent(email)}`).catch(() => null)
    if (Array.isArray(byEmail?.data) && byEmail.data[0]?.attributes?.id) attrs = byEmail.data[0].attributes
    if (!attrs) {
      const byName = await pterodactylRequest(raw, `/users?filter[username]=${encodeURIComponent(username)}`).catch(() => null)
      if (Array.isArray(byName?.data) && byName.data[0]?.attributes?.id) attrs = byName.data[0].attributes
    }
    if (!attrs?.id) throw error
    await pterodactylRequest(raw, `/users/${attrs.id}`, { method: 'PATCH', body: { username: attrs.username, email: attrs.email, first_name: attrs.first_name || 'Umi', last_name: attrs.last_name || 'Panel', password } })
    created = { attributes: { id: attrs.id, username: attrs.username, email: attrs.email } }
  }
  const id = Number(created?.attributes?.id)
  if (!id) throw Object.assign(new Error('Panel tidak mengembalikan akun pengguna baru.'), { status: 502 })
  const panelAccount = { id, username: safeText(created?.attributes?.username || username, 80), email: safeText(created?.attributes?.email || email, 160), passwordEnc: encrypt(password) }
  const fresh = readWallet()
  accountFor(fresh, userId).panelAccount = panelAccount
  writeWallet(fresh)
  return panelAccount
}

export async function buyPanelPackage(user, packageIdRaw) {
  const userId = requireUserId(user?.id)
  const raw = readRaw()
  if (!panelProvisionReady(raw)) throw Object.assign(new Error('Auto order panel belum aktif. Owner perlu mengatur URL Panel, PLTA, ID Egg, dan ID Lokasi di halaman Owner.'), { status: 409 })
  const pkg = publicPackages(raw.packages).find(item => item.id === packageId(packageIdRaw) && item.enabled && item.price > 0)
  if (!pkg) throw Object.assign(new Error('Paket panel tidak ditemukan atau belum dijual.'), { status: 404 })
  const reference = `order_${crypto.randomUUID()}`
  debitWalletForPanel({ userId, amount: pkg.price, orderReference: reference, description: `Beli panel ${pkg.name}` })
  const order = { reference, userId, kind: 'panel', itemId: pkg.id, itemName: pkg.name, amount: pkg.price, status: 'processing', createdAt: nowIso() }
  saveOrder(order)
  try {
    const panelAccount = await ensurePanelAccount(raw, userId, user)
    const prov = raw.provisioning || {}
    const serverName = `umi-${pkg.id}-${reference.slice(-6)}`
    const created = await pterodactylRequest(raw, '/servers', {
      method: 'POST',
      body: {
        name: serverName,
        user: panelAccount.id,
        egg: Number(prov.eggId),
        ...(prov.dockerImage ? { docker_image: safeText(prov.dockerImage, 200) } : {}),
        ...(prov.startup ? { startup: safeText(prov.startup, 500) } : {}),
        environment: (prov.environment && typeof prov.environment === 'object') ? prov.environment : {},
        limits: { memory: pkg.memoryMb, swap: 0, disk: pkg.diskMb, io: 500, cpu: pkg.cpuPercent },
        feature_limits: { databases: 0, allocations: 1, backups: 0 },
        deploy: { locations: [Number(prov.locationId)], dedicated_ip: false, port_range: [] },
      },
    })
    const attrs = created?.attributes || {}
    order.status = 'active'
    order.panel = { url: raw.panelUrl, username: panelAccount.username, serverName, serverIdentifier: safeText(attrs.identifier, 64) }
    order.passwordEnc = panelAccount.passwordEnc
    saveOrder(order)
    audit('wallet.panel.order', { userId, reference, package: pkg.id, amount: pkg.price })
    return publicOrder(order)
  } catch (error) {
    creditWalletOnce({ userId, amount: pkg.price, reference, type: 'ORDER_REFUND', description: `Refund gagal buat panel ${pkg.name}` })
    order.status = 'refunded'
    order.error = safeText(error?.message, 240)
    saveOrder(order)
    audit('wallet.panel.order.failed', { userId, reference, package: pkg.id, message: order.error })
    throw Object.assign(new Error(`Pembuatan server gagal (${order.error}). Saldo Rp${pkg.price.toLocaleString('id-ID')} sudah otomatis dikembalikan ke Wallet kamu.`), { status: 502 })
  }
}

function applyPremiumDays(whatsappDigits, days) {
  const jid = `${whatsappDigits}@s.whatsapp.net`
  const db = global.db?.data
  if (!db || Array.isArray(db.users)) throw Object.assign(new Error('Basis data bot sedang tidak tersedia. Saldo akan di-refund.'), { status: 503 })
  db.users ||= {}
  const target = db.users[jid] ||= { exp: 0, limit: 10, premiumTime: 0 }
  const now = Date.now()
  const base = Number(target.premiumTime) > now ? Number(target.premiumTime) : now
  target.premiumTime = base + days * 86_400_000
  try { Promise.resolve(global.db.write?.()).catch(() => {}) } catch {}
  return { whatsapp: whatsappDigits, premiumUntil: new Date(target.premiumTime).toISOString() }
}

export async function buyProduct(user, productIdRaw, input = {}) {
  const userId = requireUserId(user?.id)
  const raw = readRaw()
  const product = (Array.isArray(raw.products) ? raw.products : []).find(item => item.id === packageId(productIdRaw) && item.enabled === true && Number(item.price) > 0)
  if (!product) throw Object.assign(new Error('Produk tidak ditemukan atau belum dijual.'), { status: 404 })
  const reference = `order_${crypto.randomUUID()}`

  if (product.type === 'premium') {
    const digits = String(input.whatsapp || '').replace(/\D/g, '')
    if (!/^\d{10,16}$/.test(digits)) throw Object.assign(new Error('Nomor WhatsApp tujuan premium tidak valid (10–16 digit, awali kode negara).'), { status: 400 })
    debitWalletForPanel({ userId, amount: product.price, orderReference: reference, description: `Beli ${product.name}` })
    try {
      const premium = applyPremiumDays(digits, Number(product.days) || 0)
      const order = { reference, userId, kind: 'premium', itemId: product.id, itemName: product.name, amount: product.price, status: 'active', premium, createdAt: nowIso() }
      saveOrder(order)
      audit('wallet.product.premium', { userId, reference, product: product.id, days: product.days })
      return publicOrder(order)
    } catch (error) {
      creditWalletOnce({ userId, amount: product.price, reference, type: 'ORDER_REFUND', description: `Refund gagal aktivasi ${product.name}` })
      audit('wallet.product.premium.failed', { userId, reference, message: safeText(error?.message, 200) })
      throw Object.assign(new Error(`Aktivasi premium gagal dan saldo sudah di-refund otomatis. (${safeText(error?.message, 160)})`), { status: 502 })
    }
  }

  // digital: stock pop is synchronous with the debit so a race cannot over-sell
  const stock = Array.isArray(product.stock) ? product.stock : []
  if (!stock.length) throw Object.assign(new Error('Stok produk ini sedang habis. Coba lagi nanti.'), { status: 409 })
  debitWalletForPanel({ userId, amount: product.price, orderReference: reference, description: `Beli ${product.name}` })
  const nextRaw = readRaw()
  const live = (nextRaw.products || []).find(item => item.id === product.id)
  const delivery = live && Array.isArray(live.stock) && live.stock.length ? live.stock.shift() : null
  if (!delivery) {
    creditWalletOnce({ userId, amount: product.price, reference, type: 'ORDER_REFUND', description: `Refund stok kosong ${product.name}` })
    throw Object.assign(new Error('Stok baru saja habis. Saldo sudah di-refund otomatis.'), { status: 409 })
  }
  writeRaw(nextRaw)
  const order = { reference, userId, kind: 'digital', itemId: product.id, itemName: product.name, amount: product.price, status: 'active', deliveryEnc: encrypt(String(delivery)), createdAt: nowIso() }
  saveOrder(order)
  audit('wallet.product.digital', { userId, reference, product: product.id })
  return publicOrder(order)
}

export function panelAutoOrderStatus() { return publicStatus() }

export function startPanelAutoOrder(secretSource) {
  secretProvider = secretSource
  ensureDir()
}

export default { startPanelAutoOrder, panelAutoOrderStatus, updatePanelSettings, updatePanelPackages, testPanelConnection, walletStatus, createWalletTopup, manualTopupRequests, reviewManualTopup, handleTripayCallback, debitWalletForPanel, shopCatalog, buyPanelPackage, buyProduct, walletOrders }
