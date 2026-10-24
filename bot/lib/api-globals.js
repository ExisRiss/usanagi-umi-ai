/**
 * Pasang `global.APIs` untuk plugin-plugin lama.
 *
 * Kenapa ini ada
 * --------------
 * Puluhan plugin (maker, ai, search, internet, fun, downloader) menulis URL
 * seperti `${global.APIs.deline}/maker/cewekbrat` atau `${global.APIs.faa}/faa/...`.
 * Runtime bot ini tidak pernah mengisi `global.APIs`, jadi setiap kali salah satu
 * perintah itu dipakai, JavaScript melempar
 *
 *     TypeError: Cannot read properties of undefined (reading 'deline')
 *
 * sebelum satu baris pun kode plugin berjalan. Itulah error yang muncul di
 * halaman Feedback untuk `.cewekbrat` (dan akan muncul untuk puluhan perintah
 * lain yang belum sempat dipakai).
 *
 * Solusi: satu tempat yang memasang basis API bawaan, dipanggil dari main.js
 * sebelum plugin dimuat. Nilainya sama dengan URL yang sudah dipakai plugin
 * yang menulis URL-nya langsung (ai-kurumi.js, usanagi-search-playstore.js,
 * usanagi-aio.js), jadi perilakunya tidak berubah.
 *
 * Idempoten dan tidak menimpa definisi yang sudah ada, supaya aman dipanggil
 * berkali-kali saat hot restart dan aman bila config.js suatu saat mengisi
 * `global.APIs` sendiri.
 */

const DEFAULT_APIS = {
  /** API umum: maker, AI, search, berita, stalker. */
  deline: 'https://api.deline.web.id',
  /** API FAA: downloader, AI, internet, fun. */
  faa: 'https://api-faa.my.id',
}

export function installApiGlobals() {
  const current = global.APIs && typeof global.APIs === 'object' ? global.APIs : {}
  const next = { ...DEFAULT_APIS }
  for (const [key, value] of Object.entries(current)) {
    if (typeof value === 'string' && value.trim()) next[key] = value.trim().replace(/\/+$/, '')
  }
  global.APIs = next
  return global.APIs
}

export default installApiGlobals
