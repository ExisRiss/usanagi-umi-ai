/**
 * Kontrol server: maksimum 10 slot opsional.
 *
 * Aturan yang ditegakkan di sini:
 *  - Slot kosong = tidak ada server. Tidak pernah dikoneksikan dan tidak
 *    pernah dilaporkan "aktif".
 *  - Aksi memakai allowlist (`status|start|stop|restart|logs`), bukan shell.
 *  - Kredensial hanya berupa referensi (`credential_ref`) ke env/file secret;
 *    isi kredensial tidak disimpan di database.
 *  - Setiap aksi kontrol dicatat di audit log.
 */
import fs from 'node:fs'
import path from 'node:path'
import { platformDb } from './db.js'
import { audit } from './audit.js'
import { roleRank } from './roles.js'
import { open } from './secrets.js'

export const MAX_SERVERS = 10
export const ACTIONS = ['status', 'start', 'stop', 'restart', 'logs']
const ACTION_PERMISSION = {
  status: 'server.read',
  logs: 'server.logs',
  start: 'server.control',
  stop: 'server.control',
  restart: 'server.control',
}

function rowToSlot(row) {
  if (!row) return null
  return {
    slot: Number(row.slot),
    enabled: Boolean(row.enabled),
    name: row.name || '',
    host: row.host || '',
    port: row.port || null,
    connectionType: row.connection_type || 'panel',
    credentialRef: row.credential_ref || '',
    panelServerId: row.panel_server_id || '',
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : null,
  }
}

/** Slot dianggap terkonfigurasi hanya bila enabled + host + kredensial + id server. */
export function isConfigured(slot) {
  if (!slot || !slot.enabled || !slot.host || !slot.panelServerId) return false
  if (!slot.credentialRef) return false
  // Ref terkelola dianggap terkonfigurasi bila kuncinya benar-benar bisa dibuka.
  if (slot.credentialRef === MANAGED_REF) return Boolean(resolveManagedPanelKey())
  return true
}

export function listSlots() {
  const db = platformDb()
  const rows = db.prepare('SELECT * FROM server_slots ORDER BY slot').all()
  const bySlot = new Map(rows.map(row => [Number(row.slot), rowToSlot(row)]))
  return Array.from({ length: MAX_SERVERS }, (_, index) => {
    const slot = index + 1
    return bySlot.get(slot) || {
      slot, enabled: false, name: '', host: '', port: null,
      connectionType: 'panel', credentialRef: '', panelServerId: '', updatedAt: null, empty: true,
    }
  }).map(item => ({ ...item, configured: isConfigured(item) }))
}

export function getSlot(slot) {
  const n = Number(slot)
  if (!Number.isInteger(n) || n < 1 || n > MAX_SERVERS) {
    throw Object.assign(new Error(`Slot server harus 1–${MAX_SERVERS}.`), { status: 400 })
  }
  return listSlots().find(item => item.slot === n)
}

function assertSlotNumber(slot) {
  const n = Number(slot)
  if (!Number.isInteger(n) || n < 1 || n > MAX_SERVERS) {
    throw Object.assign(new Error(`Slot server harus 1–${MAX_SERVERS}.`), { status: 400 })
  }
  return n
}

export function upsertSlot(input = {}, actor = {}) {
  const db = platformDb()
  const slot = assertSlotNumber(input.slot)
  const existing = db.prepare('SELECT * FROM server_slots WHERE slot = ?').get(slot)
  const at = Date.now()
  const next = {
    enabled: input.enabled === undefined ? Boolean(existing?.enabled) : Boolean(input.enabled),
    name: input.name === undefined ? (existing?.name || '') : String(input.name || '').slice(0, 80),
    host: input.host === undefined ? (existing?.host || '') : String(input.host || '').trim().slice(0, 200),
    port: input.port === undefined ? (existing?.port || null) : (Number(input.port) || null),
    connectionType: input.connectionType === undefined ? (existing?.connection_type || 'panel') : String(input.connectionType || 'panel'),
    credentialRef: input.credentialRef === undefined ? (existing?.credential_ref || '') : String(input.credentialRef || '').trim().slice(0, 120),
    panelServerId: input.panelServerId === undefined ? (existing?.panel_server_id || '') : String(input.panelServerId || '').trim().slice(0, 60),
  }
  if (next.enabled && (!next.host || !next.credentialRef || !next.panelServerId)) {
    throw Object.assign(new Error('Slot aktif wajib punya host, credential ref, dan server id panel.'), { status: 400 })
  }
  db.prepare(`INSERT INTO server_slots(slot, enabled, name, host, port, connection_type, credential_ref, panel_server_id, created_at, updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?)
    ON CONFLICT(slot) DO UPDATE SET enabled=excluded.enabled, name=excluded.name, host=excluded.host, port=excluded.port,
      connection_type=excluded.connection_type, credential_ref=excluded.credential_ref, panel_server_id=excluded.panel_server_id, updated_at=excluded.updated_at`)
    .run(slot, next.enabled ? 1 : 0, next.name, next.host, next.port, next.connectionType, next.credentialRef, next.panelServerId, existing?.created_at || at, at)
  audit({
    actorUserId: actor.userId,
    platform: actor.platform,
    platformUserId: actor.platformUserId,
    action: existing ? 'server.slot.update' : 'server.slot.create',
    resource: `server:${slot}`,
    meta: { enabled: next.enabled, name: next.name, host: next.host, panelServerId: next.panelServerId, credentialRef: next.credentialRef },
  })
  return getSlot(slot)
}

export function deleteSlot(slot, actor = {}) {
  const db = platformDb()
  const n = assertSlotNumber(slot)
  const existing = db.prepare('SELECT * FROM server_slots WHERE slot = ?').get(n)
  if (!existing) throw Object.assign(new Error('Slot server belum dikonfigurasi.'), { status: 404 })
  db.prepare('DELETE FROM server_slots WHERE slot = ?').run(n)
  audit({ actorUserId: actor.userId, platform: actor.platform, platformUserId: actor.platformUserId, action: 'server.slot.delete', resource: `server:${n}`, meta: { name: existing.name } })
  return { deleted: n }
}

/** Ref khusus: kredensial panel tersimpan terenkripsi di database (diatur dari bot). */
export const MANAGED_REF = 'PANEL_MANAGED'

/**
 * Baca API key panel terkelola (AES-256-GCM di `platform_meta`).
 * Tidak mengimpor `panel-config.js` supaya tidak ada impor melingkar.
 */
export function resolveManagedPanelKey(env = process.env) {
  try {
    const row = platformDb().prepare('SELECT value FROM platform_meta WHERE key = ?').get('panel.client_key')
    if (!row?.value) return null
    return open(row.value, env)
  } catch {
    return null
  }
}

/** Kredensial panel dari env (nama variabel) atau file di .secrets. */
export function resolveCredential(ref, env = process.env) {
  const name = String(ref || '').trim()
  if (name === MANAGED_REF) {
    const key = resolveManagedPanelKey(env)
    if (!key) throw Object.assign(new Error('Kredensial panel terkelola belum diatur. Gunakan /admin panel set ptlc <key>.'), { status: 503 })
    return key
  }
  if (!/^[A-Z][A-Z0-9_]{2,80}$/.test(name)) {
    throw Object.assign(new Error('credential ref harus nama variabel env (huruf besar/angka/underscore).'), { status: 400 })
  }
  if (env[name]) return env[name]
  const filePath = env.PLATFORM_SECRETS_DIR || path.join(process.cwd(), '.secrets')
  const candidate = path.join(filePath, `${name.toLowerCase()}.env`)
  try {
    const raw = fs.readFileSync(candidate, 'utf8')
    const match = raw.match(new RegExp(`^${name}\\s*=\\s*(.+)$`, 'm'))
    if (match) return match[1].trim()
  } catch {}
  throw Object.assign(new Error(`Kredensial ${name} tidak tersedia di server.`), { status: 503 })
}

async function panelFetch(slot, apiPath, { method = 'GET', body = null, timeout = 12000 } = {}) {
  const key = resolveCredential(slot.credentialRef)
  const base = String(slot.host || '').replace(/\/+$/, '')
  if (!/^https:\/\//i.test(base)) throw Object.assign(new Error('Host panel wajib HTTPS.'), { status: 400 })
  const response = await fetch(`${base}${apiPath}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(timeout),
  })
  const text = await response.text()
  let json = null
  try { json = JSON.parse(text) } catch {}
  return { status: response.status, json, text }
}

/** Status nyata dari panel API. Tidak pernah mengarang "online". */
export async function serverStatus(slotNumber, { actor = {} } = {}) {
  const slot = getSlot(slotNumber)
  if (!slot.configured) {
    return {
      slot: slot.slot, configured: false, online: false, status: 'empty',
      message: 'Slot ini belum dikonfigurasi, jadi tidak ada server yang dipantau.',
      checkedAt: new Date().toISOString(),
    }
  }
  const started = Date.now()
  try {
    const res = await panelFetch(slot, `/api/client/servers/${encodeURIComponent(slot.panelServerId)}/resources`)
    if (res.status === 401 || res.status === 403) {
      return { slot: slot.slot, configured: true, name: slot.name, online: false, status: 'unauthorized', message: 'Kredensial panel ditolak.', checkedAt: new Date().toISOString() }
    }
    if (!res.json) {
      return { slot: slot.slot, configured: true, name: slot.name, online: false, status: 'error', message: `Panel membalas ${res.status}.`, checkedAt: new Date().toISOString() }
    }
    const attr = res.json.attributes || {}
    const state = String(attr.current_state || 'unknown')
    const resources = attr.resources || {}
    return {
      slot: slot.slot,
      configured: true,
      name: slot.name,
      online: state === 'running',
      status: state,
      state,
      limits: attr.limits || {},
      usage: {
        cpuPercent: Number(resources.cpu_absolute ?? 0),
        memoryBytes: Number(resources.memory_bytes ?? 0),
        diskBytes: Number(resources.disk_bytes ?? 0),
        networkRxBytes: Number(resources.network_rx_bytes ?? 0),
        networkTxBytes: Number(resources.network_tx_bytes ?? 0),
        uptimeMs: Number(resources.uptime ?? 0),
      },
      latencyMs: Date.now() - started,
      checkedAt: new Date().toISOString(),
      source: 'pterodactyl-panel-api',
    }
  } catch (error) {
    return {
      slot: slot.slot, configured: true, name: slot.name, online: false, status: 'offline',
      message: error.name === 'TimeoutError' ? 'Panel tidak merespons (timeout).' : String(error.message || error),
      checkedAt: new Date().toISOString(),
    }
  }
}

export async function serverAction(slotNumber, action, { actor = {}, role = 'user', powerSignal = null } = {}) {
  const slot = getSlot(slotNumber)
  const allowed = ACTIONS.includes(action)
  if (!allowed) throw Object.assign(new Error(`Aksi tidak diizinkan. Pilihan: ${ACTIONS.join(', ')}.`), { status: 400 })
  if (!slot.configured) throw Object.assign(new Error('Slot server kosong tidak bisa menerima perintah.'), { status: 409 })
  const permission = ACTION_PERMISSION[action]
  if (roleRank(role) < 0) throw Object.assign(new Error('Peran tidak valid.'), { status: 403 })
  if (!hasPermission(role, permission)) throw Object.assign(new Error('Akses ditolak untuk aksi ini.'), { status: 403, permission })

  if (action === 'status') return serverStatus(slotNumber, { actor })

  if (action === 'logs') {
    const res = await panelFetch(slot, `/api/client/servers/${encodeURIComponent(slot.panelServerId)}/files/contents?file=${encodeURIComponent('/server.log')}`, { timeout: 15000 })
    const lines = String(res.text || '').replace(/^\uFEFF/, '').trimEnd().split('\n').slice(-60)
    audit({ actorUserId: actor.userId, platform: actor.platform, platformUserId: actor.platformUserId, action: 'server.logs', resource: `server:${slot.slot}`, meta: { lines: lines.length } })
    return { slot: slot.slot, name: slot.name, lines, truncated: lines.length >= 60, status: res.status }
  }

  const signal = powerSignal || action
  const res = await panelFetch(slot, `/api/client/servers/${encodeURIComponent(slot.panelServerId)}/power`, {
    method: 'POST', body: { signal },
  })
  audit({
    actorUserId: actor.userId, platform: actor.platform, platformUserId: actor.platformUserId,
    action: `server.${action}`, resource: `server:${slot.slot}`, result: res.status < 400 ? 'ok' : 'failed',
    meta: { signal, httpStatus: res.status },
  })
  if (res.status >= 400) throw Object.assign(new Error(`Panel menolak aksi (HTTP ${res.status}).`), { status: 502 })
  return { slot: slot.slot, name: slot.name, action, signal, httpStatus: res.status, requestedAt: new Date().toISOString() }
}

function hasPermission(role, permission) {
  // Import lokal untuk menghindari siklus modul saat unit test memuat sebagian.
  const map = {
    'server.read': ['owner', 'developer', 'admin'],
    'server.control': ['owner', 'developer'],
    'server.logs': ['owner', 'developer'],
  }
  return (map[permission] || []).includes(String(role))
}

/** Ringkasan semua slot terkonfigurasi (paralel terbatas). */
export async function serverOverview({ actor = {}, concurrency = 3 } = {}) {
  const slots = listSlots().filter(item => item.configured)
  const results = []
  for (let index = 0; index < slots.length; index += concurrency) {
    const batch = slots.slice(index, index + concurrency)
    results.push(...await Promise.all(batch.map(slot => serverStatus(slot.slot, { actor }))))
  }
  return {
    configured: slots.length,
    empty: MAX_SERVERS - slots.length,
    max: MAX_SERVERS,
    servers: results,
  }
}
