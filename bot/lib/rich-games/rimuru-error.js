/**
 * Pengganti `src/lib/rimuru-error.js` milik paket sumber Rimuru MD.
 *
 * Berkas aslinya mengimpor `../../config.js` milik Rimuru (template error
 * mereka). Supaya game HTML bisa dipakai apa adanya tanpa membawa config
 * bot lain, fungsi ini memakai template teks yang sama bentuknya tapi tidak
 * bergantung pada config mana pun.
 */

export default function rimuruError(prefix = '.', command = '?', pushName = 'User') {
  return (
    '☢ *ᴇʀʀᴏʀ*\n\n' +
    `> Terjadi kesalahan pada command \`${prefix}${command}\`\n` +
    `> Silahkan coba lagi nanti, ${pushName}\n\n` +
    '_Jika masalah berlanjut, hubungi owner_'
  )
}
