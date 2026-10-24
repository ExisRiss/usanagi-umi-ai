/*
 * Usanagi Umi Wallet Core — inti dompet saldo (IDR) yang dipakai bersama oleh
 * panel auto-order dan integrasi game web (UMI TRADE).
 *
 * Satu sumber data untuk semua fitur dompet: DATA_DIR/wallet-ledger.json
 *   { version, accounts{userId:{balance,updatedAt}}, ledger[...], topups{}, orders{} }
 *
 * Modul ini sengaja tanpa ketergantungan lain supaya bisa diimpor dari mana pun
 * tanpa memuat konfigurasi panel (dan tanpa risiko siklus impor).
 */
import fs from 'node:fs'
import path from 'node:path'

export const DATA_DIR = process.env.UMI_PANEL_DATA_DIR || path.join(process.cwd(), 'data', 'panel-autoorder')
export const WALLET_FILE = path.join(DATA_DIR, 'wallet-ledger.json')

const MAX_LEDGER_ROWS = 20000
const MAX_LEDGER_PER_USER = 60

export function walletNowIso() { return new Date().toISOString() }

export function walletSafeText(value, max = 180) {
  const clean = String(value == null ? '' : value).replace(/[\u0000-\u001f\u007f]/g, ' ').trim()
  return clean.slice(0, max)
}

export function walletUserId(value) {
  const id = walletSafeText(value, 128)
  if (!/^[A-Za-z0-9_-]{8,128}$/.test(id)) throw Object.assign(new Error('Identitas akun Wallet tidak valid.'), { status: 400 })
  return id
}

function safeBalance(value) { return Number.isSafeInteger(value) && value >= 0 ? value : 0 }

function ensureDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 })
  try { fs.chmodSync(DATA_DIR, 0o700) } catch {}
}

export function emptyWallet() { return { version: 1, accounts: {}, ledger: [], topups: {}, orders: {} } }

function assertWalletRecovered() {
  if (process.env.UMI_WALLET_RECOVERY_REQUIRED === 'true') throw Object.assign(new Error('Data dompet dan riwayat pembayaran lama belum dipulihkan. Saldo, top up dan pembelian dikunci sementara; bukan saldo nol.'), { status: 503, recoveryRequired: true })
}

export function readWalletFile() {
  assertWalletRecovered()
  ensureDir()
  try {
    const data = JSON.parse(fs.readFileSync(WALLET_FILE, 'utf8'))
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('invalid wallet')
    return {
      version: 1,
      accounts: data.accounts && typeof data.accounts === 'object' ? data.accounts : {},
      ledger: Array.isArray(data.ledger) ? data.ledger : [],
      topups: data.topups && typeof data.topups === 'object' ? data.topups : {},
      orders: data.orders && typeof data.orders === 'object' ? data.orders : {},
    }
  } catch {
    return emptyWallet()
  }
}

export function writeWalletFile(wallet) {
  assertWalletRecovered()
  ensureDir()
  const next = wallet && typeof wallet === 'object' ? wallet : emptyWallet()
  if (Array.isArray(next.ledger) && next.ledger.length > MAX_LEDGER_ROWS) next.ledger = next.ledger.slice(-MAX_LEDGER_ROWS)
  const temporary = `${WALLET_FILE}.${process.pid}.${Date.now()}.tmp`
  fs.writeFileSync(temporary, `${JSON.stringify(next)}\n`, { mode: 0o600 })
  fs.renameSync(temporary, WALLET_FILE)
  try { fs.chmodSync(WALLET_FILE, 0o600) } catch {}
}

export function accountForFile(wallet, userId) {
  const id = walletUserId(userId)
  const current = wallet.accounts[id]
  if (!current || typeof current !== 'object') wallet.accounts[id] = { balance: 0, updatedAt: walletNowIso() }
  wallet.accounts[id].balance = safeBalance(wallet.accounts[id].balance)
  return wallet.accounts[id]
}

export function walletSnapshot(userId) {
  const id = walletUserId(userId)
  const wallet = readWalletFile()
  const account = accountForFile(wallet, id)
  return {
    balance: safeBalance(account.balance),
    ledger: wallet.ledger
      .filter(item => item && item.userId === id)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, MAX_LEDGER_PER_USER)
      .map(item => ({ id: walletSafeText(item.id, 80), type: walletSafeText(item.type, 40), amount: Number(item.amount) || 0, balanceAfter: safeBalance(item.balanceAfter), reference: walletSafeText(item.reference, 120), description: walletSafeText(item.description, 180), createdAt: walletSafeText(item.createdAt, 64) })),
  }
}

/**
 * Kredit saldo Wallet dengan idempoten per (userId, type, reference).
 * Dipakai game web saat menukar saldo Rp → $AS. Return daftar saldo terbaru.
 */
export function creditWallet({ userId, amount, reference, type, description = '' }) {
  const id = walletUserId(userId)
  const credit = Math.floor(Number(amount))
  if (!Number.isSafeInteger(credit) || credit < 1) throw Object.assign(new Error('Jumlah kredit Wallet tidak valid.'), { status: 400 })
  const ref = walletSafeText(reference, 120)
  if (!ref) throw Object.assign(new Error('Referensi kredit diperlukan.'), { status: 400 })
  const kind = walletSafeText(type || 'TOPUP', 40).toUpperCase().replace(/[^A-Z0-9_]/g, '_') || 'TOPUP'
  const wallet = readWalletFile()
  const account = accountForFile(wallet, id)
  const existing = wallet.ledger.find(item => item && item.userId === id && item.type === kind && item.reference === ref)
  if (existing) return { duplicate: true, balance: safeBalance(account.balance), entry: { ...existing } }
  account.balance += credit
  account.updatedAt = walletNowIso()
  const entry = { id: `wl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`, userId: id, type: kind, amount: credit, balanceAfter: account.balance, reference: ref, description: walletSafeText(description, 180), createdAt: walletNowIso() }
  wallet.ledger.push(entry)
  writeWalletFile(wallet)
  return { duplicate: false, balance: safeBalance(account.balance), entry: { ...entry } }
}

/**
 * Debit saldo Wallet dengan idempoten per (userId, type, reference).
 * Dipakai saat menukar saldo Rp → $AS game. Gagal kalau saldo kurang.
 */
export function debitWallet({ userId, amount, reference, type, description = '' }) {
  const id = walletUserId(userId)
  const debit = Math.floor(Number(amount))
  if (!Number.isSafeInteger(debit) || debit < 1) throw Object.assign(new Error('Jumlah debit Wallet tidak valid.'), { status: 400 })
  const ref = walletSafeText(reference, 120)
  if (!ref) throw Object.assign(new Error('Referensi debit diperlukan.'), { status: 400 })
  const kind = walletSafeText(type || 'GAME_TOPUP', 40).toUpperCase().replace(/[^A-Z0-9_]/g, '_') || 'GAME_TOPUP'
  const wallet = readWalletFile()
  const account = accountForFile(wallet, id)
  const existing = wallet.ledger.find(item => item && item.userId === id && item.type === kind && item.reference === ref)
  if (existing) return { duplicate: true, balance: safeBalance(account.balance), entry: { ...existing } }
  if (safeBalance(account.balance) < debit) throw Object.assign(new Error(`Saldo tidak cukup. Saldo Rp kamu Rp${safeBalance(account.balance).toLocaleString('id-ID')}, dibutuhkan Rp${debit.toLocaleString('id-ID')}.`), { status: 409 })
  account.balance -= debit
  account.updatedAt = walletNowIso()
  const entry = { id: `wl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`, userId: id, type: kind, amount: -debit, balanceAfter: account.balance, reference: ref, description: walletSafeText(description, 180), createdAt: walletNowIso() }
  wallet.ledger.push(entry)
  writeWalletFile(wallet)
  return { duplicate: false, balance: safeBalance(account.balance), entry: { ...entry } }
}

export default { DATA_DIR, WALLET_FILE, readWalletFile, writeWalletFile, walletSnapshot, creditWallet, debitWallet, accountForFile, walletUserId }
