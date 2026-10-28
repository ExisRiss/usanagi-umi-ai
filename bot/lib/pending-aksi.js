/* By AlzRiss - Usanagi Umi AI
 *
 * Task136 — aksi yang MENUNGGU balasan user.
 *
 * Kasus nyata: `.deploysubdomain toko` lalu user membalas berkas .zip / .html.
 * Berkas tanpa caption tidak punya prefix, sehingga handler.js berhenti di
 * gerbang "chat pribadi tanpa prefix" sebelum hook `all` plugin dijalankan —
 * akibatnya bot tidak membalas apa pun.
 *
 * Solusi: plugin mendaftarkan pemeriksa ke registry kecil ini, dan handler.js
 * memeriksanya SEBELUM gerbang prefix. Kalau ada yang cocok, pesan diserahkan
 * ke plugin dan alur biasa dihentikan.
 *
 * Registry disimpan di `globalThis` supaya tetap satu meski modul ini termuat
 * lewat dua jalur import berbeda (handler.js dan plugin).
 */

function registry() {
  if (!globalThis.__umiPending || !(globalThis.__umiPending.daftar instanceof Map)) {
    globalThis.__umiPending = {
      daftar: new Map(),
      cari(m) {
        for (const [nama, periksa] of globalThis.__umiPending.daftar) {
          try {
            const hasil = periksa(m)
            if (hasil && typeof hasil.jalankan === 'function') return { nama, ...hasil }
          } catch (error) {
            console.log(`[pending:${nama}] ${error?.message || error}`)
          }
        }
        return null
      },
    }
  }
  return globalThis.__umiPending
}

/**
 * Daftarkan pemeriksa.
 * @param {string} nama
 * @param {(m: any) => ({ jalankan: (m: any) => Promise<any> } | null)} periksa
 */
export function daftarkanAksi(nama, periksa) {
  registry().daftar.set(nama, periksa)
  return () => registry().daftar.delete(nama)
}

export function lepasAksi(nama) {
  registry().daftar.delete(nama)
}

/** Dipakai handler.js — kembalikan aksi yang mengklaim pesan ini, atau null. */
export function cariAksi(m) {
  return registry().cari(m)
}
