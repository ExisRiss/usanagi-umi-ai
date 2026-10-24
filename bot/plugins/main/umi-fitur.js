/* Umi Usanagi AI — Paket Fitur Umi (kode orisinal) */

const BRAND = 'Umi Usanagi AI'

const handler = async (m, { usedPrefix }) => {
  const p = usedPrefix || '.'
  return m.reply(
    `╭─「 ✨ *PAKET FITUR UMI* 」\n` +
    `│ ${BRAND}\n` +
    `╰────────────────\n\n` +

    `📥 *Downloader & Media*\n` +
    `• ${p}umigrab <url> — unduh berkas dari tautan langsung\n` +
    `• ${p}spotify <url/judul> — lagu Spotify (audio via YouTube)\n\n` +

    `🧰 *AI & Utilitas*\n` +
    `• ${p}umiringkas <teks/url> — ringkas teks & artikel\n` +
    `• ${p}umiterjemah <kode> <teks> — terjemah bahasa\n` +
    `• ${p}umisandi [panjang] — buat sandi kuat\n` +
    `• ${p}umiqr <teks> — buat QR code\n\n` +

    `🎮 *RPG & Game*\n` +
    `• ${p}umimisi — misi harian berhadiah money\n` +
    `• ${p}umitebak — tebak angka 1–100 berhadiah\n\n` +

    `👥 *Grup*\n` +
    `• ${p}umipolling <tanya> | <opsi> | <opsi> — polling grup\n` +
    `• ${p}umigrup info|buka|tutup — kelola grup\n\n` +

    `Ketik ${p}menu untuk semua fitur ${BRAND}.`,
  )
}

handler.help = ['umifitur']
handler.tags = ['main']
handler.category = 'main'
handler.command = /^(umifitur|fiturumi)$/i
handler.description = 'Daftar Paket Fitur Umi (Umi Usanagi AI)'

export default handler
