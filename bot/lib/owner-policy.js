/* By AlzRiss - Usanagi Umi AI
 *
 * Kebijakan akses owner untuk sesi Jadibot (bot milik user).
 *
 * Aturan:
 *   - Owner platform (rowner) selalu boleh semua fitur.
 *   - Owner Jadibot memakai SELURUH fitur bot miliknya, termasuk perintah
 *     yang ditandai `rowner` (mis. .sitagrup / kudeta).
 *   - Pengecualian: fitur yang menyentuh website/game atau data lintas akun
 *     (satu daftar di PLATFORM_ONLY_PLUGINS). Daftar ini yang jadi satu-satunya
 *     sumber kebenaran; plugin baru otomatis terbuka untuk owner Jadibot.
 */

/** nama berkas plugin -> alasan dikunci untuk owner Jadibot */
export const PLATFORM_ONLY_PLUGINS = new Map([
  // Website / game (harga saham, deploy, katalog plugin)
  ['usanagi-boost.js', 'menaikkan harga saham di website trading'],
  ['usanagi-jadibotconfig.js', 'mengubah konfigurasi sesi Jadibot lain di platform'],
  ['owner-gp.js', 'mengambil plugin dari katalog website'],
  ['owner-addplugin.js', 'memasang plugin baru ke seluruh bot'],

  // Data lintas akun / global
  ['umi-dellalluser.js', 'menghapus seluruh user platform'],
  ['umi-delpremall.js', 'menghapus status premium semua member'],
  ['umi-backupdb.js', 'backup database seluruh platform'],
  ['umi-savedb.js', 'mengunduh database seluruh platform'],
  ['usanagi-delowner.js', 'menghapus owner tambahan di database platform'],
  ['umi-gantiapi.js', 'mengganti API key global'],
  ['umi-bcgc.js', 'broadcast ke semua grup'],
  ['umi-swgcv2all.js', 'status ke semua grup'],
  ['umi-public.js', 'mode public/self global'],
  ['umi-modesewa.js', 'mode sewa platform'],
  ['umi-sistemenergi.js', 'aturan energi global'],
  ['umi-setallmenu.js', 'varian allmenu global'],
  ['self.js', 'mode public/self global'],
])

/** Ambil nama berkas saja, tanpa folder. */
export function pluginFileName(name = '') {
  return String(name || '').replace(/\\/g, '/').split('/').pop().toLowerCase()
}

export function isPlatformOnlyPlugin(name = '') {
  return PLATFORM_ONLY_PLUGINS.has(pluginFileName(name))
}

export function platformOnlyReason(name = '') {
  return PLATFORM_ONLY_PLUGINS.get(pluginFileName(name)) || ''
}

/**
 * Boleh tidak sebuah plugin ber-gate `rowner` dipakai?
 * @param {string} name nama berkas plugin
 * @param {{isROwner?: boolean, isJadibot?: boolean, isOwner?: boolean}} ctx
 */
export function canUseOwnerPlugin(name, { isROwner = false, isJadibot = false, isOwner = false } = {}) {
  if (isROwner) return true
  if (!isJadibot || !isOwner) return false
  return !isPlatformOnlyPlugin(name)
}
