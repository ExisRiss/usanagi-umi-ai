// Public TikTok caption/comment/reply lookup. No cookies, login bypass or media download.
const TIKTOK = new Set(['tiktok.com', 'www.tiktok.com', 'm.tiktok.com', 'vt.tiktok.com', 'vm.tiktok.com'])
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36'
const error = (code, message) => Object.assign(new Error(message), { code })
const videoId = url => new URL(url).pathname.match(/\/(?:video|photo)\/(\d{10,25})\/?$/)?.[1] || ''
export function normalizeTikTokInput(input) {
  let text = String(input || '').trim()
  const markdown = text.match(/^\[[^\]]*\]\((https?:\/\/[^\s)]+)\)$/i)
  if (markdown) text = markdown[1]
  else if (/^<https?:\/\/[^<>]+>$/.test(text)) text = text.slice(1, -1)
  let url
  try { url = new URL(text) } catch { throw error('INVALID_URL', 'Masukkan satu tautan TikTok yang valid.') }
  if (!['https:', 'http:'].includes(url.protocol) || !TIKTOK.has(url.hostname) || url.username || url.password || (url.port && url.port !== '443')) throw error('INVALID_URL', 'URL harus berasal dari TikTok.')
  const short = /^(?:vt|vm)\./.test(url.hostname)
  if (short ? !/^\/[A-Za-z0-9_-]+\/?$/.test(url.pathname) : !/^\/(?:@[^/]+\/(?:video|photo)\/\d{10,25}|t\/[A-Za-z0-9_-]+)\/?$/.test(url.pathname)) throw error('INVALID_URL', 'Gunakan tautan video/post TikTok, bukan profil atau halaman lain.')
  url.protocol = 'https:'; url.port = ''; url.search = ''; url.hash = ''
  if (short || url.pathname.startsWith('/t/')) url.pathname = url.pathname.replace(/\/$/, '') + '/'
  else { url.hostname = 'www.tiktok.com'; url.pathname = url.pathname.replace(/\/$/, '') }
  return url.href
}
export function extractPresetLinks(text, { source = 'comment', isAuthor = false } = {}) {
  const clean = String(text || '').replace(/[\u200b\u2060\u2063]/g, '').replace(/&amp;/g, '&')
  const seen = new Set(), items = []
  for (const raw of clean.match(/https?:\/\/[^\s<>"']+/gi) || []) {
    if (raw.length > 2048) continue
    let u
    try { u = new URL(raw.replace(/[),.;!\]}]+$/, '')) } catch { continue }
    if (u.username || u.password || (u.port && u.port !== '443')) continue
    const host = u.hostname.replace(/^www\./, '').toLowerCase()
    let label, kind = 'preset'
    if (host === 'alight.link' && u.pathname !== '/') label = 'Preset Alight Motion'
    else if (host === 'alightcreative.com' && /^\/am\/share\//.test(u.pathname)) label = 'Preset Alight Motion'
    else if (host === 'alightmotion.com' && /^\/share\//.test(u.pathname)) label = 'Preset Alight Motion'
    else if ((host === 'mediafire.com' && /^\/file\//.test(u.pathname)) || (host === 'drive.google.com' && (/^\/file\/d\//.test(u.pathname) || (u.pathname === '/open' && u.searchParams.has('id'))))) label = 'Berkas preset (cek format file)'
    else if (host === 'whatsapp.com' && /^\/channel\/[A-Za-z0-9]+$/.test(u.pathname) && isAuthor && /xml|preset|saluran|channel/i.test(clean)) { label = 'Kanal kreator untuk XML (bukan file langsung)'; kind = 'channel' }
    else continue
    u.protocol = 'https:'; u.port = ''; u.hash = ''
    if (seen.has(u.href)) continue
    seen.add(u.href); items.push({ url: u.href, label, kind, source, isAuthor })
  }
  return items.slice(0, 12)
}
function authorMatches(user, author) {
  const id = String(user?.id || user?.uid || ''), expected = String(author?.id || '')
  if (id && expected) return id === expected
  const name = String(user?.unique_id || user?.uniqueId || '').toLowerCase()
  return Boolean(name && name === String(author?.username || '').toLowerCase())
}
function embeddedVideo(html) {
  for (const id of ['__UNIVERSAL_DATA_FOR_REHYDRATION__', 'SIGI_STATE']) {
    const m = html.match(new RegExp('<script[^>]*id=["\']' + id + '["\'][^>]*>([\\s\\S]*?)<\\/script>', 'i'))
    if (!m) continue
    try {
      const data = JSON.parse(m[1])
      return data.__DEFAULT_SCOPE__?.['webapp.video-detail']?.itemInfo?.itemStruct || Object.values(data.ItemModule || {})[0] || null
    } catch {}
  }
  return null
}
export function createAmFinder({ fetchImpl = (...args) => fetch(...args), now = Date.now, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)), budgetMs = 24000, requestMs = 5500, pacingMs = 1200, maxPages = 4, maxThreads = 10, maxActive = 2 } = {}) {
  const cache = new Map(), flights = new Map()
  let nextRequestAt = 0, active = 0
  function check(deadline) { if (now() >= deadline) throw error('DEADLINE', 'Batas waktu pencarian tercapai.') }
  async function read(url, deadline, { manual = false, limit = 1500000 } = {}) {
    check(deadline)
    const controller = new AbortController(), timeout = Math.min(requestMs, deadline - now())
    let timer
    try {
      return await Promise.race([
        (async () => {
          const response = await fetchImpl(url, { signal: controller.signal, redirect: manual ? 'manual' : 'error', headers: { 'User-Agent': UA, Accept: 'application/json,text/html', Referer: 'https://www.tiktok.com/' } })
          if (manual && response.status >= 300 && response.status < 400) {
            const location = response.headers.get('location'); await response.body?.cancel(); return { location, status: response.status }
          }
          if (!response.ok) { await response.body?.cancel(); throw error('HTTP', 'Layanan tidak dapat dibaca.') }
          if (Number(response.headers.get('content-length')) > limit) { await response.body?.cancel(); throw error('SIZE', 'Respons layanan terlalu besar.') }
          const reader = response.body?.getReader()
          if (!reader) throw error('EMPTY', 'Layanan tidak mengirim data.')
          const chunks = []; let bytes = 0
          try {
            for (;;) { const part = await reader.read(); if (part.done) break; bytes += part.value.byteLength; if (bytes > limit) throw error('SIZE', 'Respons layanan terlalu besar.'); chunks.push(Buffer.from(part.value)) }
          } finally { await reader.cancel().catch(() => {}) }
          return { text: Buffer.concat(chunks).toString('utf8'), status: response.status }
        })(),
        new Promise((_, reject) => { timer = setTimeout(() => { controller.abort(); reject(error('TIMEOUT', 'Layanan pencarian belum merespons.')) }, timeout) }),
      ])
    } finally { clearTimeout(timer) }
  }
  async function tikwm(path, params, deadline) {
    // Reserve starts globally across lookups, including concurrent Jadibot sessions.
    for (let attempt = 0; attempt < 2; attempt++) {
      check(deadline)
      const slot = Math.max(now(), nextRequestAt)
      if (slot >= deadline) throw error('DEADLINE', 'Antrean pencarian sedang penuh.')
      nextRequestAt = slot + pacingMs
      if (slot > now()) await sleep(slot - now())
      const url = new URL(path, 'https://www.tikwm.com')
      for (const [key, value] of Object.entries(params)) url.searchParams.set(key, String(value))
      const data = JSON.parse((await read(url.href, deadline)).text)
      if (data.code === 0 && data.data) return data.data
      if (attempt === 0 && /limit|too many/i.test(String(data.msg || ''))) continue
      throw error('PROVIDER', 'Data pencarian belum tersedia.')
    }
  }
  async function canonical(input, deadline) {
    let url = input
    const seen = new Set()
    for (let i = 0; i < 4; i++) {
      if (videoId(url)) return url
      if (seen.has(url)) throw error('REDIRECT', 'Tautan TikTok berulang.')
      seen.add(url)
      const response = await read(url, deadline, { manual: true })
      if (!response.location) throw error('REDIRECT', 'Tautan pendek belum dapat dibuka.')
      // Reject off-site/private redirects before making the next request.
      url = normalizeTikTokInput(new URL(response.location, url).href)
    }
    throw error('REDIRECT', 'Terlalu banyak pengalihan TikTok.')
  }
  async function metadata(url, deadline) {
    const expected = videoId(url)
    try {
      const data = await tikwm('/api/', { url }, deadline)
      const id = String(data.id || '')
      if (!/^\d{10,25}$/.test(id) || (expected && id !== expected)) throw error('VIDEO_MISMATCH', 'Data video tidak cocok.')
      return { id, caption: String(data.title || ''), author: { id: String(data.author?.id || ''), username: data.author?.unique_id || '', name: data.author?.nickname || '' }, views: data.play_count, likes: data.digg_count, comments: data.comment_count, duration: data.duration, source: 'tikwm' }
    } catch (failure) {
      if (!expected || failure.code === 'VIDEO_MISMATCH') throw failure
      const item = embeddedVideo((await read(url, deadline)).text)
      if (!item || String(item.id) !== expected) throw error('VIDEO', 'Video TikTok belum dapat dibaca.')
      return { id: expected, caption: String(item.desc || ''), author: { id: String(item.author?.id || ''), username: item.author?.uniqueId || '', name: item.author?.nickname || '' }, views: item.stats?.playCount, likes: item.stats?.diggCount, comments: item.stats?.commentCount, duration: item.video?.duration, source: 'tiktok' }
    }
  }
  async function page(meta, cursor, thread, deadline) {
    try {
      const params = thread ? { video_id: meta.id, comment_id: thread, count: 50, cursor } : { url: meta.id, count: 50, cursor }
      const data = await tikwm(thread ? '/api/comment/reply' : '/api/comment/list', params, deadline)
      if (!Array.isArray(data.comments)) throw error('SCHEMA', 'Komentar belum dapat dibaca.')
      return { comments: data.comments, cursor: Number(data.cursor), more: Boolean(data.hasMore) }
    } catch {
      const url = new URL(thread ? 'https://www.tiktok.com/api/comment/list/reply/' : 'https://www.tiktok.com/api/comment/list/')
      const params = thread ? { aid: 1988, item_id: meta.id, comment_id: thread, count: 50, cursor } : { aid: 1988, aweme_id: meta.id, count: 50, cursor }
      for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))
      const data = JSON.parse((await read(url.href, deadline)).text)
      if (data.status_code !== 0 || !Array.isArray(data.comments)) throw error('COMMENTS', 'Komentar belum dapat dibaca.')
      return { comments: data.comments, cursor: Number(data.cursor), more: Boolean(data.has_more), fallback: true }
    }
  }
  async function scan(input) {
    const started = now(), deadline = started + budgetMs
    let url = input
    try { url = await canonical(input, deadline) } catch (e) { if (e.code === 'INVALID_URL') throw e }
    const meta = await metadata(url, deadline)
    if (!videoId(url) && meta.author.username) url = `https://www.tiktok.com/@${encodeURIComponent(meta.author.username)}/video/${meta.id}`
    const items = new Map(), threads = new Map(), visited = new Set(), seenComments = new Set()
    let inspected = 0, replies = 0, pages = 0, partial = false, remaining = true, cursor = 0
    function collect(text, source, isAuthor) {
      for (const item of extractPresetLinks(text, { source, isAuthor })) {
        const old = items.get(item.url)
        if (!old || (!old.isAuthor && item.isAuthor)) items.set(item.url, item)
      }
    }
    const authorPreset = () => [...items.values()].some(x => x.kind === 'preset' && x.isAuthor)
    collect(meta.caption, 'caption', true)
    async function readThread(thread) {
      visited.add(thread.id)
      try {
        const result = await page(meta, 0, thread.id, deadline)
        if (result.more || result.comments.length < thread.count) partial = true
        for (const comment of result.comments) { replies++; collect(comment.text, 'reply', authorMatches(comment.user, meta.author)) }
      } catch { partial = true }
    }
    while (!authorPreset() && remaining && pages < maxPages) {
      let result
      try { result = await page(meta, cursor, '', deadline) } catch { partial = true; break }
      pages++; remaining = result.more
      if (!result.comments.length && Number(meta.comments) > inspected + replies) partial = true
      for (const comment of result.comments) {
        const id = String(comment.id || comment.cid || '')
        if (!/^\d+$/.test(id) || seenComments.has(id)) continue
        seenComments.add(id); inspected++
        const isAuthor = authorMatches(comment.user, meta.author)
        collect(comment.text, 'comment', isAuthor)
        for (const reply of comment.reply_comment || []) { replies++; collect(reply.text, 'reply', authorMatches(reply.user, meta.author)) }
        const count = Number(comment.reply_total || comment.reply_comment_total) || 0
        if (count) threads.set(id, { id, count, score: (isAuthor ? 1000 : 0) + (/preset|xml|alight|5\s*mb/i.test(comment.text || '') ? 100 : 0) + Math.min(count, 30) })
      }
      // Preset requests/creator replies are more useful than unrelated large threads.
      const priority = [...threads.values()].filter(x => x.score >= 100 && !visited.has(x.id)).sort((a, b) => b.score - a.score)
      for (const thread of priority) { if (authorPreset() || visited.size >= maxThreads || now() >= deadline) break; await readThread(thread) }
      if (result.more && (!Number.isFinite(result.cursor) || result.cursor <= cursor)) { partial = true; break }
      cursor = result.cursor
    }
    for (const thread of [...threads.values()].sort((a, b) => b.score - a.score)) {
      if (authorPreset() || visited.size >= maxThreads || now() >= deadline) break
      if (!visited.has(thread.id)) await readThread(thread)
    }
    if (remaining || visited.size < threads.size || now() >= deadline || Number(meta.comments) > inspected + replies) partial = true
    const sorted = [...items.values()].sort((a, b) => Number(b.isAuthor) - Number(a.isAuthor)).slice(0, 12)
    return { ...meta, url, items: sorted, status: sorted.some(x => x.kind === 'preset') ? 'found' : partial ? 'incomplete' : 'not_found', partial, inspected, replies, pages, elapsedMs: now() - started }
  }
  return async function find(input) {
    const normalized = normalizeTikTokInput(input), key = videoId(normalized) || normalized
    const cached = cache.get(key)
    if (cached && cached.expires > now()) return structuredClone(cached.result)
    if (flights.has(key)) return structuredClone(await flights.get(key))
    if (active >= maxActive) throw error('BUSY', 'Pencarian preset sedang penuh. Coba lagi sebentar.')
    active++
    const task = scan(normalized).then(result => {
      // Cache successful links only: failures/incomplete searches must remain retryable.
      if (result.status === 'found') {
        for (const id of [key, result.id]) cache.set(id, { result: structuredClone(result), expires: now() + 5 * 60 * 1000 })
        while (cache.size > 64) cache.delete(cache.keys().next().value)
      }
      return result
    })
    flights.set(key, task)
    try { return structuredClone(await task) } finally { active--; flights.delete(key) }
  }
}
export const findAmPresets = createAmFinder()
