/* By AlzRiss - Usanagi Umi AI
 *
 * Task135 — .bot on / .bot off untuk sesi ini saja.
 *
 * Saat OFF:
 *   - Bot tidak membalas pesan apa pun di sesi itu (semua perintah & chat).
 *   - Hanya owner/developer yang bisa menyalakan kembali dengan .bot on.
 *
 * Status per sesi (bot utama dan tiap jadibot terpisah) disimpan di
 * data/bot-power.json, dan bisa juga diubah dari halaman setting website
 * Jadibot (POST /api/settings/apply { session_id, bot_power }).
 */

import {
  powerNyala,
  powerInfo,
  setPower,
  powerSemua,
  scopeDariConfig,
} from '../../lib/bot-power.js'

let handler = async (m, extra = {}) => {
  const { args = [], command = '', botConfig, isOwner, isROwner } = extra
  const sayaOwner = Boolean(isOwner || isROwner || m.fromMe)
  if (!sayaOwner) return m.reply('🔒 Hanya owner/developer yang boleh menyalakan atau mematikan bot.')

  const scope = scopeDariConfig(botConfig)
  const aksi = String(args[0] || '').toLowerCase()

  if (!aksi || aksi === 'status') {
    const info = powerInfo(scope)
    const semua = powerSemua().filter((x) => x.scope !== 'main')
    return m.reply(
      [
        '⚙️ *SAKLAR BOT*',
        '',
        `Sesi ini : ${scope}`,
        `Status   : *${info.enabled ? 'ON' : 'OFF'}*`,
        info.by ? `Diubah   : ${info.by}` : '',
        info.since ? `Sejak    : ${new Date(info.since).toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })} WITA` : '',
        '',
        'Perintah: .bot on / .bot off / .bot status',
        semua.length ? `\nSesi lain yang OFF:\n${semua.filter((x) => !x.enabled).map((x) => `- ${x.scope}`).join('\n') || '(tidak ada)'}` : '',
      ].filter(Boolean).join('\n')
    )
  }

  if (aksi === 'on' || aksi === 'nyala') {
    setPower(scope, true, String(m.sender || '').split('@')[0])
    return m.reply(`✅ Bot *ON* untuk sesi ${scope}.\nMulai sekarang semua perintah dijawab lagi.`)
  }

  if (aksi === 'off' || aksi === 'mati') {
    setPower(scope, false, String(m.sender || '').split('@')[0])
    return m.reply(
      `⛔ Bot *OFF* untuk sesi ${scope}.\n\nMulai sekarang bot tidak membalas apa pun di sesi ini.\nHanya owner/developer yang bisa menyalakan dengan *.bot on*.`
    )
  }

  return m.reply('Pilih: .bot on / .bot off / .bot status')
}

handler.help = ['bot on', 'bot off', 'bot status']
handler.tags = ['owner']
handler.command = /^bot$/i
handler.owner = false
handler.group = false
handler.private = false

export { handler }
export default handler
