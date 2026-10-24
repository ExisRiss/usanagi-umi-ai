/*
 *
 * UMI TRADE — versi main langsung di WhatsApp (rich HTML).
 *
 * Perintah:
 *   {prefix}tradingwa          buka game trading di dalam chat
 *   {prefix}tradewa            alias
 *   {prefix}mainas             alias
 *   {prefix}sahamwa            alias
 *
 * Game dikirim sebagai rich message (HTML primitive) memakai jalur yang sama
 * dengan game-sonic: pesan forward bertanda tangan, jadi WhatsApp langsung
 * merendernya di chat tanpa perlu unduh berkas.
 *
 * Isi HTML sepenuhnya mandiri: tanpa aset eksternal, tanpa internet. Harga
 * bergerak 24 jam tanpa sesi boost 02.00, saldo & posisi disimpan di
 * localStorage HP pemain.
 */

import { kirimForwardSigned } from '../../lib/awang-rich-forward.js'
import { TRADING_WA_HTML } from './trading-wa-html.js'

const JUDUL = '📈 UMI TRADE · MAIN DI WHATSAPP'

let handler = async (m, { conn, usedPrefix }) => {
  try {
    await kirimForwardSigned(conn, m.chat, TRADING_WA_HTML, JUDUL)
    await m.react('📈').catch(() => {})
  } catch (error) {
    const reason = error && error.message ? error.message : String(error)
    console.error('[TRADING-WA]', reason)
    await m.react('❌').catch(() => {})
    await m.reply(
      [
        '❌ Gagal membuka game trading di WhatsApp.',
        '',
        `Alasan: ${reason}`,
        '',
        `Cadangan: ketik ${usedPrefix || '.'}tradingoffline untuk mengirim versi berkas HTML,`,
        'atau buka versi web di game.gwenna.my.id/trading-offline.html',
      ].join('\n')
    )
  }
}

handler.help = ['tradingwa', 'tradewa', 'mainas', 'sahamwa']
handler.tags = ['game']
handler.command = /^(tradingwa|tradewa|mainas|sahamwa)$/i
handler.limit = false

export default handler
