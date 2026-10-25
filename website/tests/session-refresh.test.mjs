/* Task109 — uji sesi login tidak hilang sendiri.
 *
 * Menguji FUNGSI ASLI dari public/assets/app.js (diambil langsung dari berkas
 * yang dipakai website) dengan localStorage + fetch palsu.
 *
 * Jalankan: node tests/session-refresh.test.mjs
 */
/* Harness Task109: menguji potongan KODE ASLI dari public/assets/app.js.
 *
 * Fungsi diambil langsung dari berkas yang dipakai website (bukan tiruan),
 * lalu dijalankan dengan localStorage + fetch palsu supaya bisa dibuktikan
 * kapan sesi login dihapus dan kapan tidak.
 */
import fs from 'node:fs'

/* Ambil teks satu fungsi lengkap. Tokenizer kecil: komentar + string +
   template literal (termasuk ${ ... }) dilewati supaya kurung kurawal di
   dalam string tidak merusak hitungan. */
function sliceFunction(src, name) {
  let start = src.indexOf(`async function ${name}(`)
  if (start < 0) start = src.indexOf(`function ${name}(`)
  if (start < 0) return ''
  // lewati daftar parameter
  let i = src.indexOf('(', start)
  let paren = 0
  for (; i < src.length; i++) {
    if (src[i] === '(') paren++
    else if (src[i] === ')') { paren--; if (!paren) { i++; break } }
  }
  const mode = [{ t: 'code', depth: 0 }]
  for (; i < src.length; i++) {
    const c = src[i], n = src[i + 1]
    const top = mode[mode.length - 1]
    if (top.t === 'line') { if (c === '\n') mode.pop(); continue }
    if (top.t === 'block') { if (c === '*' && n === '/') { mode.pop(); i++ } ; continue }
    if (top.t === 'sq') { if (c === '\\') { i++; continue } ; if (c === "'") mode.pop(); continue }
    if (top.t === 'dq') { if (c === '\\') { i++; continue } ; if (c === '"') mode.pop(); continue }
    if (top.t === 'tpl') {
      if (c === '\\') { i++; continue }
      if (c === '`') { mode.pop(); continue }
      if (c === '$' && n === '{') { mode.push({ t: 'code', depth: 1 }); i++; continue }
      continue
    }
    // mode code
    if (c === '/' && n === '/') { mode.push({ t: 'line' }); i++; continue }
    if (c === '/' && n === '*') { mode.push({ t: 'block' }); i++; continue }
    if (c === "'") { mode.push({ t: 'sq' }); continue }
    if (c === '"') { mode.push({ t: 'dq' }); continue }
    if (c === '`') { mode.push({ t: 'tpl' }); continue }
    if (c === '{') { top.depth++; continue }
    if (c === '}') {
      top.depth--
      if (top.depth === 0) {
        mode.pop()
        if (!mode.length) return src.slice(start, i + 1)
        continue
      }
      continue
    }
  }
  return src.slice(start)
}

export function loadApp(file) {
  const src = fs.readFileSync(file, 'utf8')
  return {
    src,
    saveSession: sliceFunction(src, 'saveSession'),
    sessionExpiredSoon: sliceFunction(src, 'sessionExpiredSoon'),
    storeSession: sliceFunction(src, 'storeSession'),
    refreshSession: sliceFunction(src, 'refreshSession'),
    api: sliceFunction(src, 'api'),
  }
}

export function makeEnv(parts, { fetchImpl, initialSession, storage = new Map() } = {}) {
  const calls = []
  const localStorage = {
    getItem: k => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: k => storage.delete(k),
  }
  const state = { session: initialSession ? JSON.parse(JSON.stringify(initialSession)) : null, profile: null, refreshTask: null }
  const toasts = []
  const body = `
    const STORAGE_KEY = 'umi_studio_session_v2'
    if (state.session) localStorage.setItem(STORAGE_KEY, JSON.stringify(state.session))
    ${parts.saveSession}
    ${parts.sessionExpiredSoon}
    ${parts.storeSession}
    ${parts.refreshSession}
    ${parts.api}
    return { refreshSession, api, state, STORAGE_KEY }
  `
  const fn = new Function('localStorage', 'fetch', 'state', 'toast', body)
  const fetchMock = async (url, options) => { calls.push({ url, options }); return fetchImpl(url, options, calls.length) }
  const obj = fn(localStorage, fetchMock, state, (m, e) => toasts.push({ m, e }))
  return { ...obj, calls, storage, localStorage, state, toasts }
}


const FILE = process.argv[2] || new URL('../public/assets/app.js', import.meta.url).pathname
const parts = loadApp(FILE)
const S = { access_token: 'TOKEN-LAMA', refresh_token: 'REFRESH-LAMA', expires_in: 3600, user: { email: 'uji@contoh.com' } }
const hasil = []
const cek = (nama, lulus, info) => { hasil.push({ nama, lulus, info }); console.log(`${lulus ? 'LULUS' : 'GAGAL'} · ${nama}${info ? ' — ' + info : ''}`) }

// 1. Jaringan mati / DNS gagal (kasus nyata: host auth tidak bisa dihubungi)
{
  const env = makeEnv(parts, { initialSession: S, fetchImpl: async () => { throw new TypeError('getaddrinfo ENOTFOUND') } })
  const ok = await env.refreshSession()
  cek('jaringan mati → sesi TIDAK dihapus', ok === false && env.state.session?.access_token === 'TOKEN-LAMA' && env.storage.has('umi_studio_session_v2'),
    `session=${env.state.session ? 'masih ada' : 'DIHAPUS'}`)
}

// 2. Server auth balas 503 (gangguan sementara)
{
  const env = makeEnv(parts, { initialSession: S, fetchImpl: async () => ({ ok: false, status: 503, json: async () => ({ error: 'gangguan' }) }) })
  await env.refreshSession()
  cek('error 503 → sesi TIDAK dihapus', Boolean(env.state.session), `session=${env.state.session ? 'masih ada' : 'DIHAPUS'}`)
}

// 3. Refresh token memang tidak berlaku (400) → wajib logout
{
  const env = makeEnv(parts, { initialSession: S, fetchImpl: async () => ({ ok: false, status: 400, json: async () => ({ error: 'refresh_token_invalid' }) }) })
  await env.refreshSession()
  cek('refresh token tidak berlaku → sesi dihapus', env.state.session === null, `session=${env.state.session ? 'masih ada' : 'dihapus'}`)
}

// 4. Refresh sukses → token baru tersimpan + expires_at dihitung
{
  const env = makeEnv(parts, { initialSession: S, fetchImpl: async () => ({ ok: true, status: 200, json: async () => ({ access_token: 'TOKEN-BARU', refresh_token: 'REFRESH-BARU', expires_in: 3600, user: { email: 'uji@contoh.com' } }) }) })
  const ok = await env.refreshSession()
  const saved = JSON.parse(env.storage.get('umi_studio_session_v2') || 'null')
  cek('refresh sukses → token baru tersimpan', ok === true && saved?.access_token === 'TOKEN-BARU', `token=${saved?.access_token}`)
  cek('expires_at dihitung', Number(saved?.expires_at) > Date.now(), `expires_at=${saved?.expires_at}`)
}

// 5. Dua refresh bersamaan → hanya SATU request (token rotation aman)
{
  let n = 0
  const env = makeEnv(parts, { initialSession: S, fetchImpl: async () => { n++; await new Promise(r => setTimeout(r, 30)); return { ok: true, status: 200, json: async () => ({ access_token: 'TOKEN-BARU', refresh_token: 'REFRESH-BARU', expires_in: 3600 }) } } })
  await Promise.all([env.refreshSession(), env.refreshSession(), env.refreshSession()])
  cek('3 refresh bersamaan → 1 request saja', n === 1, `request=${n}`)
}

// 6. api() kena 401 → coba refresh; kalau refresh sukses, ulangi & jangan logout
{
  let panggilanApi = 0
  const env = makeEnv(parts, { initialSession: S, fetchImpl: async (url) => {
    if (String(url).includes('auth/refresh')) {
      return { ok: true, status: 200, json: async () => ({ access_token: 'TOKEN-BARU', refresh_token: 'REFRESH-BARU', expires_in: 3600 }), text: async () => '' }
    }
    panggilanApi++
    return panggilanApi === 1
      ? { ok: false, status: 401, text: async () => '{"error":"expired"}', json: async () => ({ error: 'expired' }) }
      : { ok: true, status: 200, text: async () => JSON.stringify({ user: { email: 'uji@contoh.com' } }), json: async () => ({ user: { email: 'uji@contoh.com' } }) }
  } })
  let data = null
  try { data = await env.api('platform/me') } catch (error) { data = { error: error.message } }
  cek('401 → refresh → ulangi tanpa logout', data?.user?.email === 'uji@contoh.com' && Boolean(env.state.session), `panggilan=${panggilanApi} session=${env.state.session ? 'ada' : 'HILANG'} data=${JSON.stringify(data)}`)
}

// 7. api() 401 tapi jaringan refresh gagal → sesi tetap ada (tidak memaksa login ulang)
{
  const env = makeEnv(parts, { initialSession: S, fetchImpl: async (url) => {
    if (String(url).includes('auth/refresh')) throw new TypeError('getaddrinfo ENOTFOUND')
    return { ok: false, status: 401, text: async () => '{"error":"expired"}', json: async () => ({ error: 'expired' }) }
  } })
  let pesan = ''
  try { await env.api('platform/me') } catch (e) { pesan = e.message }
  cek('401 + refresh gagal jaringan → sesi tetap ada', Boolean(env.state.session), `pesan="${pesan}" session=${env.state.session ? 'ada' : 'HILANG'}`)
}

const gagal = hasil.filter(h => !h.lulus).length
console.log(`\n${hasil.length - gagal}/${hasil.length} lulus`)
process.exit(gagal ? 1 : 0)
