// Per-socket metadata cache: shared by handlers and Baileys outbound encryption.
// Never use stale participants for permission checks after invalidation/rate limits.
const copy = value => structuredClone(value)
const limited = error => /rate.?overlimit|rate.?limit/i.test(String(error?.message || '')) || Number(error?.output?.statusCode || error?.statusCode) === 429
// Task90: WhatsApp menjawab 403 "forbidden" saat metadata grup diminta untuk grup
// yang tidak bisa diakses bot (bot dikeluarkan, grup dihapus, atau sesi rusak).
// Dulu error ini dilempar apa adanya sehingga SETIAP perintah yang mengirim pesan
// ke grup tersebut gagal dengan stack panjang — .unreg, .daftar mlz, .bratvid, dst.
const forbidden = error => Number(error?.data ?? error?.output?.statusCode ?? error?.statusCode) === 403 ||
  /^forbidden$/i.test(String(error?.message || '').trim())
export function createGroupMetadataCache({ fetchGroup, fetchAll, now = Date.now, ttlMs = 30000, backoffMs = 60000, maxEntries = 256, fetchTimeoutMs = 8000, forbiddenCooldownMs = 120000, staleMaxAgeMs = 15 * 60000 }) {
  const entries = new Map(), flights = new Map(), versions = new Map()
  const stale = new Map(), blockedJids = new Map()
  let blockedUntil = 0, blockedStatus = 429, allCache = null, allFlight = null, epoch = 0, session = 0
  function ready() {
    if (now() < blockedUntil) throw Object.assign(new Error(blockedStatus === 429 ? 'Metadata WhatsApp dibatasi sementara; tunggu sebelum mencoba lagi.' : 'Metadata WhatsApp belum merespons; coba lagi sebentar.'), { statusCode: blockedStatus, retryAfterMs: blockedUntil - now() })
  }
  async function query(fetcher) {
    let timer
    try {
      return await Promise.race([
        Promise.resolve().then(fetcher),
        new Promise((_, reject) => { timer = setTimeout(() => reject(Object.assign(new Error('Metadata WhatsApp timeout.'), { code: 'GROUP_METADATA_TIMEOUT', statusCode: 503 })), fetchTimeoutMs) }),
      ])
    } finally { clearTimeout(timer) }
  }
  function failure(error) {
    if (limited(error)) { blockedStatus = 429; blockedUntil = now() + backoffMs }
    else if (error?.code === 'GROUP_METADATA_TIMEOUT') { blockedStatus = 503; blockedUntil = now() + Math.min(5000, backoffMs) }
    throw error
  }
  function groupForbidden(id, error) {
    // Jangan menembak WhatsApp berulang-ulang untuk grup yang sama.
    blockedJids.set(id, now() + forbiddenCooldownMs)
    while (blockedJids.size > maxEntries) blockedJids.delete(blockedJids.keys().next().value)
    const last = stale.get(id)
    if (last && now() - last.at <= staleMaxAgeMs) {
      console.warn(`[GROUP-CACHE] 403 untuk ${id}; memakai metadata terakhir (${Math.round((now() - last.at) / 1000)} dtk lalu) agar pengiriman tetap berjalan.`)
      return copy(last.value)
    }
    console.warn(`[GROUP-CACHE] 403 untuk ${id}; bot tidak bisa membaca metadata grup ini.`)
    throw Object.assign(
      new Error('Bot tidak bisa mengakses grup ini (403 forbidden). Kemungkinan bot sudah keluar/dikeluarkan dari grup, atau grupnya sudah tidak aktif.'),
      { code: 'GROUP_FORBIDDEN', statusCode: 403, data: error?.data }
    )
  }
  function put(id, data) {
    if (!Array.isArray(data?.participants)) return
    entries.delete(id); entries.set(id, { value: copy(data), expires: now() + ttlMs })
    stale.delete(id); stale.set(id, { value: copy(data), at: now() })
    while (entries.size > maxEntries) entries.delete(entries.keys().next().value)
    while (stale.size > maxEntries) stale.delete(stale.keys().next().value)
  }
  function invalidate(id) {
    epoch++; allCache = null; allFlight = null
    if (id) { entries.delete(id); flights.delete(id); versions.set(id, epoch); stale.delete(id); blockedJids.delete(id) }
    else { session++; entries.clear(); flights.clear(); versions.clear(); stale.clear(); blockedJids.clear() }
  }
  async function get(id) {
    const hit = entries.get(id)
    if (hit?.expires > now()) return copy(hit.value)
    const blocked = blockedJids.get(id)
    if (blocked && blocked > now()) {
      const last = stale.get(id)
      if (last && now() - last.at <= staleMaxAgeMs) return copy(last.value)
      throw Object.assign(new Error('Bot tidak bisa mengakses grup ini (403 forbidden).'), { code: 'GROUP_FORBIDDEN', statusCode: 403 })
    }
    if (flights.has(id)) return copy(await flights.get(id))
    ready()
    const version = versions.get(id) || 0, generation = session
    const task = query(() => fetchGroup(id)).then(data => {
      if (generation !== session || (versions.get(id) || 0) !== version) throw Error('Metadata grup berubah; ulangi permintaan.')
      if (!Array.isArray(data?.participants)) throw Error('Metadata grup tidak lengkap.')
      put(id, data); return data
    }).catch(error => {
      if (forbidden(error)) return groupForbidden(id, error)
      return failure(error)
    })
    flights.set(id, task)
    try { return copy(await task) } finally { if (flights.get(id) === task) flights.delete(id) }
  }
  async function all() {
    if (allCache?.expires > now()) return copy(allCache.value)
    if (allFlight) return copy(await allFlight)
    ready(); const version = epoch
    const task = query(fetchAll).then(groups => {
      if (version !== epoch) throw Error('Daftar grup berubah; ulangi permintaan.')
      for (const [id, data] of Object.entries(groups || {})) put(id, data)
      allCache = { value: copy(groups || {}), expires: now() + ttlMs }; return groups || {}
    }).catch(failure)
    allFlight = task
    try { return copy(await task) } finally { if (allFlight === task) allFlight = null }
  }
  function bind(events) {
    events.on('group-participants.update', event => invalidate(event.id))
    events.on('groups.update', rows => { for (const row of rows || []) invalidate(row.id) })
    events.on('connection.update', event => { if (event.connection === 'close') invalidate() })
  }
  return { get, all, invalidate, bind }
}
