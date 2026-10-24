/* ==========================================================================
   USANAGI UMI — THEME BOOT
   --------------------------------------------------------------------------
   Dimuat SINKRON di <head> (tanpa defer) supaya atribut data-theme sudah
   terpasang sebelum paint pertama. Dengan begitu tidak ada kedipan tema
   (flash of wrong theme) saat halaman dimuat.

   CSP situs: script-src 'self' → skrip inline dilarang, karena itu bootstrap
   ini dipisah menjadi berkas sendiri.
   ========================================================================== */
(function () {
  'use strict'
  var STORAGE_KEY = 'umi-theme'
  var root = document.documentElement
  var theme = 'dark'
  try {
    var saved = window.localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') theme = saved
  } catch (error) {
    /* localStorage bisa diblokir (mode privat) — pakai tema default. */
  }
  root.setAttribute('data-theme', theme)
  root.style.colorScheme = theme
  var meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', theme === 'light' ? '#eef3fb' : '#050d1f')
  window.__umiTheme = theme
})()
