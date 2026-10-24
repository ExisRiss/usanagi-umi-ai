/**
 * Jembatan ke bot WhatsApp yang sudah berjalan.
 *
 * Tidak mengubah perilaku bot WA: hanya membaca status nyata (`global.conn`)
 * dan memanggil fungsi jadibot yang sudah ada. Tidak ada socket kedua.
 */
import fs from 'node:fs'
import path from 'node:path'

function stateFile() {
  return path.join(process.cwd(), 'data', 'jadibot-platform.json')
}

export function readSessionState() {
  try {
    const parsed = JSON.parse(fs.readFileSync(stateFile(), 'utf8'))
    return parsed && typeof parsed === 'object' ? (parsed.sessions || {}) : {}
  } catch {
    return {}
  }
}

/** Status bot utama dari socket Baileys yang sedang aktif. */
export function mainBotState() {
  const conn = globalThis.conn
  const registered = Boolean(conn?.authState?.creds?.registered)
  const connection = ['open', 'connecting', 'close'].includes(globalThis.stopped) ? globalThis.stopped : (conn?.ws?.isOpen ? 'open' : 'unknown')
  return {
    registered,
    connected: registered && connection === 'open',
    connection,
    uptimeSeconds: Math.floor(process.uptime()),
    user: conn?.user?.id ? String(conn.user.id).split(':')[0] : null,
    pairingActive: Boolean(globalThis.pairingRequested),
  }
}

export function listSessions() {
  const sessions = readSessionState()
  return Object.entries(sessions).map(([number, row]) => ({
    number: String(number),
    masked: String(number).replace(/^(\d{4})\d+(\d{3})$/, '$1***$2'),
    userId: row?.userId || null,
    email: row?.email || null,
    sessionId: row?.sessionId || String(number),
    createdAt: row?.createdAt || null,
    updatedAt: row?.updatedAt || null,
  }))
}

/**
 * Sesi milik satu pengguna platform. Pemilik = userId web yang sama ATAU nomor
 * WhatsApp yang tertaut ke identitas Telegram-nya.
 */
export function sessionsForUser(userId, whatsappJid = null) {
  const number = String(whatsappJid || '').replace(/\D/g, '')
  return listSessions().filter(row => {
    if (row.userId && String(row.userId) === String(userId)) return true
    if (number && row.number === number) return true
    return false
  })
}

/** Hentikan sesi jadibot. `deleteSession` menghapus folder sesi (permanen). */
export async function stopSession(number, { deleteSession = false, actor = {} } = {}) {
  const normalized = String(number || '').replace(/\D/g, '')
  if (!/^\d{7,15}$/.test(normalized)) throw Object.assign(new Error('Nomor sesi tidak valid.'), { status: 400 })
  const mod = await import('../../jadibot.js')
  if (deleteSession) return mod.disconnectSubBot(normalized, { deleteSession: true })
  return mod.stopSubBot(normalized)
}

export function sessionLimits(role = 'user', env = process.env) {
  const key = `PLATFORM_SESSION_LIMIT_${String(role).toUpperCase()}`
  const fallback = { owner: 50, developer: 25, admin: 15, reseller: 10, user: 2 }
  const value = Number(env[key])
  return Number.isInteger(value) && value >= 0 ? value : (fallback[String(role)] ?? 2)
}
