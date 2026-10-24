/**
 * Pusat kunci API pihak ketiga.
 *
 * Semua fitur yang butuh API/token membaca dari sini — tidak ada lagi kunci
 * yang ditulis langsung di dalam plugin.
 *
 * Urutan pencarian nilai (yang pertama menang):
 *   1. `global.apiKeys.<nama>`  — diisi di config.js
 *   2. `process.env.<ENV>`      — dari .platform.env / environment panel
 *   3. nilai bawaan di bawah    — kosong, artinya fitur dimatikan
 *
 * Kalau kunci kosong, fitur terkait TIDAK error: ia membalas pesan ramah
 * "fitur belum dikonfigurasi". Jadi bot tetap jalan walau kamu tidak punya
 * kunci pihak ketiga.
 *
 * Cara mengisi (pilih salah satu):
 *
 *   // config.js
 *   global.apiKeys = {
 *     tenor: 'KUNCI-TENOR',
 *     pastebin: 'KUNCI-PASTEBIN',
 *     neuralFrames: 'TOKEN-NEURALFRAMES',
 *   }
 *
 * atau di `.platform.env`:
 *
 *   UMI_TENOR_KEY=...
 *   UMI_PASTEBIN_KEY=...
 *   UMI_NEURALFRAMES_TOKEN=...
 */

/** Daftar kunci yang dikenal: nama pendek -> nama variabel environment. */
export const API_KEY_ENV = {
  tenor: 'UMI_TENOR_KEY',
  pastebin: 'UMI_PASTEBIN_KEY',
  neuralFrames: 'UMI_NEURALFRAMES_TOKEN',
  gemini: 'GEMINI_API_KEY',
  groq: 'GROQ_API_KEY',
  openai: 'OPENAI_API_KEY',
  saveTubeQuality: 'UMI_SAVETUBE_VIDEO_QUALITY',
}

import fs from 'node:fs'
import path from 'node:path'

const cache = new Map()
const fileCache = { expires: 0, values: {} }

/** Berkas tempat halaman setting website menyimpan kunci (mode 0600). */
export function keyFile() {
  return process.env.UMI_APIKEYS_ENV_FILE || path.join(process.cwd(), '.env.apikeys')
}

function readFileKeys() {
  if (fileCache.expires > Date.now()) return fileCache.values
  const values = {}
  try {
    for (const line of fs.readFileSync(keyFile(), 'utf8').split(/\r?\n/)) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (match) values[match[1]] = match[2]
    }
  } catch {}
  fileCache.values = values
  fileCache.expires = Date.now() + 5000
  return values
}

function writeFileKeys(values) {
  const file = keyFile()
  const body = Object.entries(values)
    .filter(([, value]) => value)
    .map(([name, value]) => `${name}=${value}`)
    .join('\n')
  fs.writeFileSync(`${file}.tmp`, body ? `${body}\n` : '', { mode: 0o600 })
  fs.renameSync(`${file}.tmp`, file)
  try { fs.chmodSync(file, 0o600) } catch {}
  refreshApiKeys()
}

/** Simpan satu kunci (dipanggil dari halaman setting website). */
export function saveApiKey(name, value) {
  const key = clean(name, 60)
  const envName = API_KEY_ENV[key]
  if (!envName) throw Object.assign(new Error(`Kunci API "${key}" tidak dikenal.`), { status: 400 })
  const text = clean(value, 1000)
  if (!text) throw Object.assign(new Error('Kunci API kosong.'), { status: 400 })
  if (/[\s]/.test(text)) throw Object.assign(new Error('Kunci API tidak boleh mengandung spasi.'), { status: 400 })
  const current = { ...readFileKeys() }
  current[envName] = text
  writeFileKeys(current)
  return { key, env: envName, configured: true }
}

/** Hapus satu kunci dari berkas. */
export function removeApiKey(name) {
  const key = clean(name, 60)
  const envName = API_KEY_ENV[key]
  if (!envName) throw Object.assign(new Error(`Kunci API "${key}" tidak dikenal.`), { status: 400 })
  const current = { ...readFileKeys() }
  delete current[envName]
  writeFileKeys(current)
  return { key, env: envName, configured: false }
}

function clean(value, max = 500) {
  return String(value ?? '').trim().slice(0, max)
}

/**
 * Ambil satu kunci API.
 * @param {string} name nama pendek, mis. 'tenor'
 * @returns {string} nilai kunci, atau '' kalau belum diisi
 */
export function apiKey(name) {
  const key = clean(name, 60)
  if (!key) return ''
  if (cache.has(key)) return cache.get(key)

  let value = ''
  try {
    value = clean(globalThis.apiKeys?.[key], 1000)
  } catch {}
  const envName = API_KEY_ENV[key] || `UMI_${key.toUpperCase()}_KEY`
  if (!value) value = clean(readFileKeys()[envName], 1000)
  if (!value) value = clean(process.env[envName], 1000)
  // Hanya nilai terisi yang di-cache: kalau kunci baru dipasang lewat halaman
  // setting/config.js saat bot berjalan, pembacaan berikutnya langsung ikut.
  if (value) cache.set(key, value)
  return value
}

/** True kalau kunci sudah diisi. */
export function hasApiKey(name) {
  return apiKey(name).length > 0
}

/**
 * Ambil kunci atau lempar error yang ramah (dipakai di dalam try/catch plugin).
 * @param {string} name
 * @param {string} [label] nama tampilan untuk pesan error
 */
export function requireApiKey(name, label = '') {
  const value = apiKey(name)
  if (value) return value
  const envName = API_KEY_ENV[name] || `UMI_${String(name).toUpperCase()}_KEY`
  const who = label || name
  throw Object.assign(
    new Error(`Fitur ${who} belum dikonfigurasi. Isi global.apiKeys.${name} di config.js atau ${envName} di .platform.env.`),
    { code: 'API_KEY_MISSING', apiKeyName: name },
  )
}

/** Peta status semua kunci — dipakai /owner atau halaman setting untuk diagnosa. */
export function apiKeyStatus() {
  return Object.fromEntries(
    Object.keys(API_KEY_ENV).map(name => [name, apiKey(name) ? 'ok' : 'belum diisi']),
  )
}

/** Buang cache (dipanggil setelah config.js diubah lewat halaman setting). */
export function refreshApiKeys() {
  cache.clear()
  fileCache.expires = 0
}

export default { apiKey, hasApiKey, requireApiKey, apiKeyStatus, refreshApiKeys, saveApiKey, removeApiKey, keyFile, API_KEY_ENV }
