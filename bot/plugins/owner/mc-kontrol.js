/* By AlzRiss - Usanagi Umi AI
 *
 * Task135 — kontrol server Minecraft dari WhatsApp.
 *
 * Cara kerja: bot mengirim perintah ke console server Minecraft lewat Client
 * API panel (lihat lib/mc-kaira.js). Jadi tidak perlu buka panel saat mau
 * ganti waktu, cuaca, kick, atau ban pemain.
 *
 * Tampilan:
 *   .pingmc / .statusmc      → teks + foto
 *   ..pingmc / ..statusmc    → rich message (kartu + tombol/list)
 *
 * Perintah:
 *   .statusmc  .pingmc  .mconline  .mcjoin
 *   .settime day|noon|sunset|night|midnight|<0-23999>
 *   .mccuaca clear|rain|thunder        (alias .setcuaca / .weathermc)
 *   .mcban <nama>  .mcunban <nama>  .mckick <nama>
 *   .mcstart  .mcstop  .mcrestart
 *   .mccmd <perintah console>        (khusus developer)
 *   .mchelp
 */

import fs from 'fs'
import path from 'path'
import { sendInteractive } from '../../lib/awang-tombol.js'
import {
  bacaKonfig,
  konfigSiap,
  statusLengkap,
  teksStatus,
  teksPemain,
  teksPing,
  pingServer,
  kirimPerintah,
  dayaServer,
} from '../../lib/mc-kaira.js'

const GAMBAR_LOGO = [path.join(process.cwd(), 'assets', 'menu', 'logo.jpg'), path.join(process.cwd(), 'assets', 'image', 'dok.jpg')]

const JAM = {
  day: 'day', pagi: 'day', siang: 'day',
  noon: 'noon',
  sunset: 'sunset', sore: 'sunset',
  night: 'night', malam: 'night', midnight: 'midnight', tengahmalam: 'midnight',
  sunrise: 'sunrise', subuh: 'sunrise',
}

const CUACA = {
  clear: 'clear', cerah: 'clear', sun: 'clear',
  rain: 'rain', hujan: 'rain',
  thunder: 'thunder', badai: 'thunder', storm: 'thunder',
}

function gambarLokal() {
  for (const jalur of GAMBAR_LOGO) {
    try {
      if (fs.existsSync(jalur)) return fs.readFileSync(jalur)
    } catch (error) { }
  }
  return null
}

async function kirimTeksAtauFoto(m, conn, teks) {
  const gambar = gambarLokal()
  if (gambar) {
    try {
      return await conn.sendMessage(m.chat, { image: gambar, caption: teks }, { quoted: m })
    } catch (error) {
      // jatuh ke teks biasa
    }
  }
  return m.reply(teks)
}

async function kirimRich(m, conn, { judul, subjudul, isi, footer, daftar }) {
  try {
    return await sendInteractive(conn, m.chat, {
      title: judul,
      subtitle: subjudul,
      body: isi,
      footer,
      list: daftar,
    }, { quoted: m.raw || m })
  } catch (error) {
    return kirimTeksAtauFoto(m, conn, `${judul}\n${subjudul || ''}\n\n${isi}`)
  }
}

function belumSiap() {
  return [
    '⚙️ *Server Minecraft belum terhubung ke bot.*',
    '',
    'Berkas konfigurasi `data/mc-kaira.json` belum ada / belum lengkap.',
    'Isi dengan: panelUrl, apiKey (client API key panel Kaira), serverId.',
  ].join('\n')
}

async function tanganiStatus(m, conn, rich) {
  const status = await statusLengkap()
  const isi = teksStatus(status)
  if (!rich) return kirimTeksAtauFoto(m, conn, isi)

  const online = status.online.length ? status.online : ['(tidak ada pemain)']
  return kirimRich(m, conn, {
    judul: '🎮 STATUS SERVER MC',
    subjudul: `${status.nama} · ${String(status.state).toUpperCase()}`,
    isi,
    footer: 'Klik tombol di bawah untuk aksi cepat.',
    daftar: {
      listTitle: 'Aksi Server',
      sections: [
        {
          title: 'LIHAT',
          rows: [
            { title: '🔄 Refresh status', description: 'Ambil data terbaru dari panel', command: '..statusmc' },
            { title: '👥 Pemain online', description: online.join(', '), command: '.mconline' },
            { title: '🗂️ Pernah join', description: `${status.totalPernah} pemain tercatat`, command: '.mcjoin' },
            { title: '📡 Ping server', description: 'Cek TCP signaling + HTTP /v1/join', command: '..pingmc' },
          ],
        },
        {
          title: 'ATUR (OWNER)',
          rows: [
            { title: '🌞 Waktu siang', description: 'time set day', command: '.settime day' },
            { title: '🌙 Waktu malam', description: 'time set night', command: '.settime night' },
            { title: '☀️ Cuaca cerah', description: 'weather clear', command: '.mccuaca clear' },
            { title: '🌧️ Cuaca hujan', description: 'weather rain', command: '.mccuaca rain' },
            { title: '⛈️ Badai', description: 'weather thunder', command: '.mccuaca thunder' },
          ],
        },
      ],
    },
  })
}

async function tanganiPing(m, conn, rich) {
  const ping = await pingServer()
  const status = await statusLengkap().catch(() => ({ state: 'unknown', jumlahOnline: 0, maksimal: 0 }))
  const isi = teksPing(ping, status)
  if (!rich) return kirimTeksAtauFoto(m, conn, isi)
  return kirimRich(m, conn, {
    judul: '📡 PING SERVER MC',
    subjudul: `${ping.host}:${ping.port}`,
    isi,
    footer: ping.tcp.ok ? 'Koneksi ke server normal.' : 'Server belum bisa dihubungi dari luar.',
    daftar: {
      listTitle: 'Aksi',
      sections: [{
        title: 'PING & STATUS',
        rows: [
          { title: '🔄 Ping ulang', description: `Terakhir ${ping.tcp.ms} ms`, command: '..pingmc' },
          { title: '📊 Status lengkap', description: 'RAM, CPU, pemain, dunia', command: '..statusmc' },
          { title: '▶️ Nyalakan server', description: 'power start', command: '.mcstart' },
          { title: '🔁 Restart server', description: 'power restart', command: '.mcrestart' },
        ],
      }],
    },
  })
}

let handler = async (m, extra = {}) => {
  const { conn, args = [], command = '', text = '', isROwner, isOwner } = extra
  const rich = Boolean(m.__richRequest)

  if (command === 'mchelp') {
    return m.reply(
      [
        '🎮 *KONTROL SERVER MINECRAFT*',
        '',
        '*Lihat*',
        '.statusmc — status server (teks + foto)',
        '..statusmc — status versi rich message',
        '.pingmc — ping + signaling (teks + foto)',
        '..pingmc — ping versi rich message',
        '.mconline — pemain yang online sekarang',
        '.mcjoin — daftar pemain yang pernah join',
        '',
        '*Atur (owner)*',
        '.settime day|noon|sunset|night|midnight|<tick>',
        '.mccuaca clear|rain|thunder',
        '.mckick <nama> · .mcban <nama> · .mcunban <nama>',
        '.mcstart · .mcstop · .mcrestart',
        '.mccmd <perintah console> — khusus developer',
      ].join('\n')
    )
  }

  if (!konfigSiap()) return m.reply(belumSiap())

  if (command === 'statusmc') {
    if (!rich && !isOwner) {
      // semua orang boleh lihat status server
    }
    return tanganiStatus(m, conn, rich)
  }

  if (command === 'pingmc') return tanganiPing(m, conn, rich)

  if (!isOwner && !isROwner) {
    return m.reply('🔒 Perintah ini khusus owner/developer.')
  }

  if (command === 'mconline') {
    const status = await statusLengkap()
    const isi = status.online.length
      ? `👥 *Online sekarang* (${status.jumlahOnline}/${status.maksimal})\n\n${status.online.map((x, i) => `${i + 1}. ${x}`).join('\n')}`
      : `Tidak ada pemain online (0/${status.maksimal || '-'}).`
    return kirimTeksAtauFoto(m, conn, isi)
  }

  if (command === 'mcjoin' || command === 'mchistory') {
    const status = await statusLengkap()
    return kirimTeksAtauFoto(m, conn, teksPemain(status, Number(args[0]) || 10))
  }

  if (command === 'settime') {
    const nilai = String(args[0] || '').toLowerCase()
    if (!nilai) return m.reply('Pakai: .settime day|night|noon|midnight|<0-23999>')
    if (CUACA[nilai]) return m.reply('Itu nilai cuaca. Pakai .mccuaca ' + CUACA[nilai])
    const target = JAM[nilai] || (/^\d+$/.test(nilai) ? String(Math.min(23999, Number(nilai))) : '')
    if (!target) return m.reply('Nilai waktu tidak dikenal. Contoh: .settime night')
    const dijalankan = await kirimPerintah(`time set ${target}`)
    return kirimTeksAtauFoto(m, conn, `🌗 Perintah dikirim ke server MC:\n\`${dijalankan}\`\n\nCek dengan .statusmc`)
  }

  if (command === 'mccuaca' || command === 'setcuaca' || command === 'weathermc') {
    const nilai = String(args[0] || '').toLowerCase()
    const target = CUACA[nilai]
    if (!target) return m.reply('Pakai: .mccuaca clear|rain|thunder')
    const dijalankan = await kirimPerintah(`weather ${target}`)
    return kirimTeksAtauFoto(m, conn, `🌦️ Perintah dikirim ke server MC:\n\`${dijalankan}\``)
  }

  if (['mckick', 'mcban', 'mcunban'].includes(command)) {
    const target = String(args[0] || '').trim()
    if (!target) return m.reply(`Pakai: .${command} <nama pemain>`)
    if (!/^[A-Za-z0-9_ .-]{2,32}$/.test(target)) return m.reply('Nama pemain tidak valid.')
    const perintah = command === 'mckick' ? `kick "${target}"` : command === 'mcban' ? `ban "${target}"` : `unban "${target}"`
    try {
      const dijalankan = await kirimPerintah(perintah)
      return kirimTeksAtauFoto(m, conn, `✅ Dikirim ke server MC:\n\`${dijalankan}\``)
    } catch (error) {
      return m.reply(`❌ Gagal: ${error?.message || error}`)
    }
  }

  if (['mcstart', 'mcstop', 'mcrestart', 'mckill'].includes(command)) {
    const sinyal = command.replace('mc', '')
    try {
      await dayaServer(sinyal)
      return kirimTeksAtauFoto(m, conn, `⚡ Sinyal *${sinyal}* dikirim ke server MC. Cek .statusmc beberapa saat lagi.`)
    } catch (error) {
      return m.reply(`❌ Gagal: ${error?.message || error}`)
    }
  }

  if (command === 'mccmd') {
    if (!isROwner) return m.reply('🔒 Perintah console mentah hanya untuk developer.')
    const mentah = String(text || '').trim()
    if (!mentah) return m.reply('Pakai: .mccmd <perintah console>')
    try {
      const dijalankan = await kirimPerintah(mentah)
      return m.reply(`✅ Console MC:\n\`${dijalankan}\``)
    } catch (error) {
      return m.reply(`❌ Gagal: ${error?.message || error}`)
    }
  }
}

handler.help = ['statusmc', '..statusmc', 'pingmc', '..pingmc', 'mconline', 'mcjoin', 'settime day', 'mccuaca rain', 'mcban nama', 'mchelp']
handler.tags = ['owner']
handler.command = /^(statusmc|pingmc|mconline|mcjoin|mchistory|settime|mccuaca|setcuaca|weathermc|mckick|mcban|mcunban|mcstart|mcstop|mcrestart|mckill|mccmd|mchelp)$/i
handler.owner = false
handler.group = false
handler.private = false

export { handler, JAM, CUACA }

export default handler
