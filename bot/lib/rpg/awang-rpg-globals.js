/**
 * Mengembalikan `global.rpg` yang hilang.
 *
 * Kenapa ini ada
 * --------------
 * Dua belas plugin di `plugins/rpg/rpg-*.js` memakai `global.rpg.emoticon(name)`
 * untuk menampilkan ikon di daftar inventaris dan saldo. Fungsi itu dulu disediakan
 * runtime induk (keluarga Rimuru/Ourin), tetapi di runtime ini **tidak pernah
 * didefinisikan siapa pun** — grep di seluruh repo tidak menemukan satu pun
 * `global.rpg = ...`.
 *
 * Akibatnya setiap plugin yang menyentuhnya langsung mati dengan
 * `TypeError: Cannot read properties of undefined (reading 'emoticon')`, dan itu
 * terjadi **sebelum** baris kode pertama plugin dijalankan. Yang paling terasa:
 * `.bank` dan `.atm` tidak pernah bisa dipakai, padahal `.deposit` dan `.withdraw`
 * (yang tidak memakai emoticon) berjalan normal — jadi saldo bisa diisi tapi tidak
 * bisa dilihat.
 *
 * Kenapa tidak sekadar menghapus plugin yang rusak
 * ------------------------------------------------
 * Karena bidangnya sudah dipakai: `.deposit`, `.withdraw`, dan `.buyatm` menulis ke
 * `user.money` dan `user.bank` di `database.json` — di sanalah uang pengguna yang
 * sebenarnya (data per 14 Oktober 2026: 5 pengguna, total 103.414). Menghapus
 * `.bank` berarti menghilangkan satu-satunya cara melihat saldo itu. Yang rusak
 * hanyalah *tampilan* saldo, bukan sistemnya, jadi yang diperbaiki adalah
 * dependensi yang hilang — bukan fiturnya.
 *
 * Catatan: sistem RPG yang lebih baru (`plugins/rpg/usanagi-*.js`) memakai
 * penyimpanan terpisah (tabel `rpg_users` di SQLite, mata uang `koin`) dan tidak
 * terpengaruh berkas ini.
 */

/** Ikon per kunci. Kunci mengikuti yang benar-benar diminta plugin. */
const EMOTICONS = {
  // mata uang & status
  money: '💰',
  bank: '🏦',
  atm: '💳',
  exp: '✨',
  level: '📊',
  limit: '📈',
  health: '❤️',
  stamina: '⚡',

  // peralatan
  sword: '🗡️',
  armor: '🛡️',
  pickaxe: '⛏️',
  potion: '🧪',
  fishingrod: '🎣',
  bow: '🏹',
  axe: '🪓',

  // hasil tambang & kelangkaan
  diamond: '💎',
  emerald: '💚',
  common: '🪨',
  uncommon: '🗿',
  mythic: '🔮',
  legendary: '🏆',
  trash: '🗑️',
  wood: '🪵',
  stone: '🧱',
  iron: '⛓️',
  gold: '🥇',
  coal: '⚫',
  fish: '🐟',
  meat: '🍖',
  fruit: '🍎',
  seed: '🌱',
  crate: '📦',
  key: '🗝️',
  ticket: '🎟️',
}

/** Dipakai bila kunci tidak dikenal — jangan pernah melempar, jangan pernah kosong. */
const FALLBACK = '•'

/**
 * Kembalikan ikon untuk sebuah kunci.
 *
 * Sengaja dibuat sangat toleran: plugin memanggilnya dengan nama item yang berasal
 * dari data pengguna (`global.rpg.emoticon(lost)` di rpg-mining.js), jadi kunci tak
 * dikenal adalah hal normal. Fungsi ini tidak boleh melempar — kalau melempar, kita
 * kembali ke masalah awal.
 *
 * @param {unknown} name nama kunci, boleh apa saja
 * @returns {string} ikon, atau titik bila tidak ada yang cocok
 */
export function emoticon(name) {
  if (name === null || name === undefined) return FALLBACK
  const key = String(name).trim().toLowerCase().replace(/[\s_-]+/g, '')
  if (!key) return FALLBACK
  if (EMOTICONS[key]) return EMOTICONS[key]
  // Coba cocokkan sebagian: "diamondmine" → diamond, "rawFish" → fish.
  for (const candidate of Object.keys(EMOTICONS)) {
    if (key.includes(candidate)) return EMOTICONS[candidate]
  }
  return FALLBACK
}

/**
 * Pasang `global.rpg`. Idempoten — aman dipanggil berkali-kali (main.js dimuat
 * ulang saat hot-restart).
 *
 * Hanya dipasang bila belum ada, supaya tidak menimpa definisi lain bila suatu
 * saat runtime menyediakannya sendiri.
 */
export function installRpgGlobals() {
  if (global.rpg && typeof global.rpg.emoticon === 'function') return global.rpg

  global.rpg = {
    ...(global.rpg || {}),
    emoticon,
  }

  return global.rpg
}

export default installRpgGlobals
