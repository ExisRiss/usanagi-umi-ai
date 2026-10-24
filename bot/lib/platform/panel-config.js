/**
 * Konfigurasi panel hosting (Pterodactyl/Pelican) yang bisa diatur dari bot.
 *
 * Yang disimpan:
 *  - URL panel (HTTPS wajib)
 *  - API key klien `ptlc_...` (dipakai untuk baca status, daya, log, berkas)
 *  - API key aplikasi `ptla_...` (opsional, hanya dicatat; tidak dipakai runtime)
 *  - server id/identifier (mis. d178bf71)
 *
 * Semua rahasia dienkripsi AES-256-GCM lewat `secrets.seal` dan TIDAK pernah
 * dikembalikan dalam bentuk utuh. Slot server memakai ref khusus
 * `PANEL_MANAGED` sehingga mesin slot yang sudah ada (audit, allowlist aksi,
 * panel web) langsung ikut memakainya tanpa jalur kedua.
 */
import { platformDb } from './db.js'
import { audit } from './audit.js'
import { seal, open, mask, hasSecretKey } from './secrets.js'
import { upsertSlot, deleteSlot, getSlot, resolveManagedPanelKey, MANAGED_REF } from './servers.js'

const META = {
  url: 'panel.url',
  clientKey: 'panel.client_key',
  applicationKey: 'panel.application_key',
  serverId: 'panel.server_id',
}

function metaGet(key) {
  return platformDb().prepare('SELECT value FROM platform_meta WHERE key = ?').get(String(key))?.value || null
}

function metaSet(key, value) {
  platformDb().prepare('INSERT OR REPLACE INTO platform_meta(key, value) VALUES(?,?)').run(String(key), String(value))
}

function metaDelete(key) {
  platformDb().prepare('DELETE FROM platform_meta WHERE key = ?').run(String(key))
}

export function isValidPanelUrl(value) {
  try {
    const url = new URL(String(value || '').trim())
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) return false
    if (url.pathname !== '/' && url.pathname !== '') return false
    return Boolean(url.hostname) && url.hostname.includes('.')
  } catch { return false }
}

export function normalizePanelUrl(value) {
  return String(value || '').trim().replace(/\/+$/, '')
}

/** Bentuk aman untuk ditampilkan di chat/panel (tanpa rahasia). */
export function describePanel() {
  const slot = getSlot(1)
  const managed = slot?.credentialRef === MANAGED_REF
  const clientKey = metaGet(META.clientKey)
  let keyMasked = null
  let keyReadable = false
  if (clientKey) {
    try {
      const value = open(clientKey)
      keyMasked = mask(value)
      keyReadable = true
    } catch { keyMasked = '(tidak bisa dibuka — kunci enkripsi berubah)' }
  }
  return {
    managed,
    configured: Boolean(clientKey && slot?.host && slot?.panelServerId),
    url: slot?.host || metaGet(META.url) || null,
    serverId: slot?.panelServerId || metaGet(META.serverId) || null,
    clientKeyMasked: keyMasked,
    clientKeySet: Boolean(clientKey),
    clientKeyReadable: keyReadable,
    applicationKeySet: Boolean(metaGet(META.applicationKey)),
    slot: slot?.slot || null,
    enabled: Boolean(slot?.enabled),
  }
}

function requireSecretKey() {
  if (!hasSecretKey()) {
    throw Object.assign(new Error('PLATFORM_SECRET_KEY belum diatur di server, kredensial panel tidak bisa disimpan aman.'), { status: 503 })
  }
}

/**
 * Simpan perubahan sebagian. Nilai `undefined`/null tidak mengubah apa pun.
 * @param {{url?:string, clientKey?:string, applicationKey?:string, serverId?:string}} patch
 */
export function savePanelConfig(patch = {}, actor = {}) {
  requireSecretKey()
  const changes = []
  if (patch.url !== undefined) {
    if (!isValidPanelUrl(patch.url)) throw Object.assign(new Error('URL panel harus https://domain.tld tanpa path.'), { status: 400 })
    metaSet(META.url, normalizePanelUrl(patch.url))
    changes.push('url')
  }
  if (patch.clientKey !== undefined) {
    const key = String(patch.clientKey || '').trim()
    if (!/^ptlc_[A-Za-z0-9]{20,}$/.test(key)) throw Object.assign(new Error('API key klien harus berawalan ptlc_ (minimal 20 karakter).'), { status: 400 })
    metaSet(META.clientKey, seal(key))
    changes.push('client_key')
  }
  if (patch.applicationKey !== undefined) {
    const key = String(patch.applicationKey || '').trim()
    if (!/^ptla_[A-Za-z0-9]{20,}$/.test(key)) throw Object.assign(new Error('Application API key harus berawalan ptla_ (minimal 20 karakter).'), { status: 400 })
    metaSet(META.applicationKey, seal(key))
    changes.push('application_key')
  }
  if (patch.serverId !== undefined) {
    const id = String(patch.serverId || '').trim().toLowerCase()
    if (!/^[a-z0-9]{6,40}$/.test(id)) throw Object.assign(new Error('Server ID/identifier harus 6–40 karakter huruf kecil/angka.'), { status: 400 })
    metaSet(META.serverId, id)
    changes.push('server_id')
  }
  if (!changes.length) throw Object.assign(new Error('Tidak ada nilai yang diubah.'), { status: 400 })

  const url = metaGet(META.url)
  const serverId = metaGet(META.serverId)
  const clientKey = metaGet(META.clientKey)
  const current = getSlot(1)
  const keepExisting = current?.credentialRef === MANAGED_REF
  if (url && serverId && clientKey) {
    upsertSlot({
      slot: 1,
      enabled: true,
      name: current?.name && keepExisting ? current.name : 'Panel Utama',
      host: url,
      credentialRef: MANAGED_REF,
      panelServerId: serverId,
    }, actor)
  }

  audit({
    actorUserId: actor.userId,
    platform: actor.platform,
    platformUserId: actor.platformUserId,
    action: 'panel.config.update',
    resource: 'panel:1',
    // Nama field saja — nilai rahasia tidak pernah masuk audit.
    meta: { changed: changes },
  })
  return describePanel()
}

/** Hapus konfigurasi panel terkelola (slot 1 ikut dihapus). */
export function clearPanelConfig(actor = {}) {
  for (const key of Object.values(META)) metaDelete(key)
  const slot = getSlot(1)
  if (slot?.credentialRef === MANAGED_REF) {
    try { deleteSlot(1, actor) } catch {}
  }
  audit({
    actorUserId: actor.userId, platform: actor.platform, platformUserId: actor.platformUserId,
    action: 'panel.config.clear', resource: 'panel:1', result: 'ok',
  })
  return describePanel()
}

/** Uji koneksi nyata ke panel memakai kredensial tersimpan. */
export async function testPanel() {
  const description = describePanel()
  if (!description.url || !description.serverId) {
    throw Object.assign(new Error('Panel belum dikonfigurasi (URL/server id).'), { status: 409 })
  }
  const key = resolveManagedPanelKey()
  if (!key) throw Object.assign(new Error('API key klien belum tersimpan.'), { status: 409 })

  const started = Date.now()
  const base = description.url.replace(/\/+$/, '')
  const response = await fetch(`${base}/api/client/account`, {
    headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  })
  const latencyMs = Date.now() - started
  let payload = null
  try { payload = await response.json() } catch {}
  if (response.status === 401 || response.status === 403) {
    return { ok: false, status: response.status, latencyMs, error: 'Panel menolak API key (401/403).' }
  }
  if (!response.ok) {
    return { ok: false, status: response.status, latencyMs, error: `Panel membalas HTTP ${response.status}.` }
  }
  const account = payload?.attributes || {}
  return {
    ok: true,
    status: response.status,
    latencyMs,
    username: account.username || null,
    email: account.email || null,
    admin: Boolean(account.root_admin),
  }
}

export { MANAGED_REF }
