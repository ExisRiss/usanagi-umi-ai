/* By AlzRiss - Usanagi Umi AI
 *
 * Task136 — kontrol server Minecraft dari WhatsApp (versi lengkap).
 *
 * Tampilan:
 *   .statusmc / .pingmc / .mcmabar  → teks + ALBUM foto (katalog foto)
 *   ..statusmc / ..pingmc           → rich message (kartu + tombol/list)
 *
 * Perintah:
 *   Lihat      : statusmc · pingmc · mconline · mcjoin · mchistory · listaddon
 *   Atur waktu : settimemc day|noon|sunset|night|midnight|<0-23999>
 *   Cuaca      : mccuaca clear|rain|thunder
 *   Operator   : addoperator (khusus developer, pilih dari pemain yang pernah join)
 *                deloperator <nama>
 *   Ban/kick   : banplayermc <nama> <alasan> (alasan WAJIB, developer)
 *                unbanplayermc <nama> · mckick <nama> [alasan]
 *   Addon      : addaddon (balas berkas .mcaddon/.mcpack/.zip, developer)
 *                deladdon <nama> (developer)
 *   Lain       : mcmabar (alamat + tutorial masuk) · mcstart · mcstop ·
 *                mcrestart · mccmd (developer) · mchelp
 */

import fs from 'fs'
import path from 'path'
import { sendInteractive } from '../../lib/awang-tombol.js'
import { kirimKatalog } from '../../lib/katalog-foto.js'
import {
  bacaKonfig,
  konfigSiap,
  statusLengkap,
  pingServer,
  kirimPerintah,
  dayaServer,
  opPemain,
  deopPemain,
  banPemain,
  unbanPemain,
  kickPemain,
  alamatJoin,
  detailServer,
  pesanGalatPanel,
} from '../../lib/mc-kaira.js'
import { pasangAddon, hapusAddon, daftarAddon } from '../../lib/mc-addon.js'
import { adaLampiran, unduhLampiran, namaBerkasLampiran } from '../../lib/lampiran.js'
import { daftarkanAksi } from '../../lib/pending-aksi.js'

const GAMBAR_LOGO = [path.join(process.cwd(), 'assets', 'menu', 'logo.jpg'), path.join(process.cwd(), 'assets', 'image', 'dok.jpg')]

const JAM = {
  day: 'day', pagi: 'day', siang: 'day',
  noon: 'noon',
  sunset: 'sunset', sore: 'sunset',
  night: 'night', malam: 'night',
  midnight: 'midnight', tengahmalam: 'midnight',
  sunrise: 'sunrise', subuh: 'sunrise',
}

const CUACA = {
  clear: 'clear', cerah: 'clear', sun: 'clear',
  rain: 'rain', hujan: 'rain',
  thunder: 'thunder', badai: 'thunder', storm: 'thunder',
}

function gambarLokal() {
  const hasil = []
  for (const jalur of GAMBAR_LOGO) {
    try {
      if (fs.existsSync(jalur)) hasil.push(fs.readFileSync(jalur))
    } catch (error) { }
  }
  return hasil
}

const richDiminta = (m) => Boolean(m && (m.__richMenu === true || m.__richRequest === true))

async function kirimTeks(m, conn, teks) {
  return kirimKatalog(conn, m.chat, { caption: teks, quoted: m.raw || m, foto: gambarLokal() })
}

async function kirimRich(m, conn, { judul, subjudul, isi, footer, daftar, tombol }) {
  try {
    return await sendInteractive(conn, m.chat, {
      title: judul,
      subtitle: subjudul,
      body: isi,
      footer,
      image: gambarLokal()[0] || undefined,
      list: daftar,
      buttons: tombol,
    }, { quoted: m.raw || m })
  } catch (error) {
    return kirimTeks(m, conn, `${judul}\n${subjudul || ''}\n\n${isi}`)
  }
}

function belumSiap() {
  return [
    '⚙️ *Server Minecraft belum terhubung ke bot.*',
    '',
    'Berkas konfigurasi `data/mc-kaira.json` belum ada / belum lengkap.',
  ].join('\n')
}

/* ── teks ─────────────────────────────────────────────────────────────── */

function daftarNama(status, batas = 10) {
  if (!status.pemain.length) return '_belum ada_'
  return status.pemain.slice(0, batas).map((p, i) => {
    const kapan = p.terakhir ? new Date(p.terakhir).toLocaleDateString('id-ID', { timeZone: 'Asia/Makassar' }) : '-'
    return `${i + 1}. *${p.nama}* — ${kapan}`
  }).join('\n')
}

function teksStatusLengkap(status) {
  const online = status.online.length ? status.online.join(', ') : 'tidak ada'
  return [
    `🎮 *${status.nama}*`,
    '',
    `Status : *${String(status.state).toUpperCase()}*`,
    `Versi  : ${status.versi}`,
    `Dunia  : ${status.level}`,
    `Alamat : ${status.host}:${status.port}`,
    '',
    `Pemain online : ${status.jumlahOnline}/${status.maksimal} — ${online}`,
    `Pernah join   : ${status.totalPernah} pemain`,
    `CPU/RAM/Disk  : ${status.cpu.toFixed(1)}% · ${status.memori} · ${status.disk}`,
    `Uptime panel  : ${status.uptime}`,
    '',
    '👥 *Username yang pernah join*',
    daftarNama(status, 10),
    status.galat.length ? `\n⚠️ Galat sesi ini:\n${status.galat.map((x) => `- ${x}`).join('\n')}` : '\n✅ Tidak ada galat di sesi server ini.',
  ].join('\n')
}

function teksMabar(status) {
  return [
    '🎮 *CARA MASUK SERVER*',
    '',
    '1. Buka Minecraft Bedrock (versi *1.26.52.3*)',
    '2. Pilih *Play* → *Servers* → *Add Server*',
    `3. Server Name: *${status.nama}*`,
    `4. Server Address: *${status.host}*`,
    `5. Port: *${status.port}*`,
    '6. Simpan, lalu tekan *Join Server*',
    '',
    '📌 Catatan',
    '• Versi client harus 1.26.52.3 (harus sama dengan server)',
    '• Kalau tidak bisa masuk: pastikan jaringan stabil, coba lagi 1–2 menit',
    '• Pemain baru akan tercatat otomatis di `.mcjoin`',
  ].join('\n')
}

/* ── aksi ─────────────────────────────────────────────────────────────── */

async function tanganiStatus(m, conn, rich) {
  const status = await statusLengkap()
  const isi = teksStatusLengkap(status)
  if (!rich) return kirimTeks(m, conn, isi)

  return kirimRich(m, conn, {
    judul: '🎮 STATUS SERVER MC',
    subjudul: `${status.nama} · ${String(status.state).toUpperCase()}`,
    isi,
    footer: 'Pilih aksi cepat di bawah.',
    daftar: {
      listTitle: 'Aksi Server',
      sections: [
        {
          title: 'LIHAT',
          rows: [
            { title: '🔄 Refresh status', description: 'Ambil data terbaru', command: '..statusmc' },
            { title: '🗂️ Pemain pernah join', description: `${status.totalPernah} pemain`, command: '.mcjoin' },
            { title: '📡 Ping server', description: 'TCP + HTTP /v1/join', command: '..pingmc' },
            { title: '🎮 Cara masuk server', description: 'Alamat + tutorial', command: '.mcmabar' },
          ],
        },
        {
          title: 'ATUR (OWNER)',
          rows: [
            { title: '🌞 Waktu siang', description: 'time set day', command: '.settimemc day' },
            { title: '🌙 Waktu malam', description: 'time set night', command: '.settimemc night' },
            { title: '☀️ Cuaca cerah', description: 'weather clear', command: '.mccuaca clear' },
            { title: '🌧️ Cuaca hujan', description: 'weather rain', command: '.mccuaca rain' },
          ],
        },
      ],
    },
  })
}

async function tanganiPing(m, conn, rich) {
  const ping = await pingServer()
  const status = await statusLengkap().catch(() => ({ state: 'unknown', jumlahOnline: 0, maksimal: 0 }))
  const isi = [
    '📡 *PING SERVER MC*',
    '',
    `Host  : ${ping.host}:${ping.port}`,
    `TCP signaling : ${ping.tcp.ok ? `✔ ${ping.tcp.ms} ms` : `✘ ${ping.tcp.pesan}`}`,
    `HTTP /v1/join : ${ping.httpJoin.status === 200 ? `✔ 200 (${ping.httpJoin.ms} ms)` : `✘ ${ping.httpJoin.status || ping.httpJoin.pesan}`}`,
    `Panel         : ${String(status.state).toUpperCase()}`,
    `Pemain online : ${status.jumlahOnline}/${status.maksimal}`,
    '',
    ping.tcp.ok && ping.httpJoin.status === 200
      ? 'Server bisa dihubungi dari internet.'
      : 'Server belum bisa dihubungi dari luar — cek alokasi port / status server.',
  ].join('\n')

  if (!rich) return kirimTeks(m, conn, isi)
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
        ],
      }],
    },
  })
}

/** Menu pilih pemain untuk dijadikan operator (tombol/list). */
async function pilihOperator(m, conn, status) {
  const pemain = status.pemain.slice(0, 8)
  if (!pemain.length) {
    return kirimTeks(m, conn, '👥 Belum ada pemain yang pernah join, jadi belum ada yang bisa dijadikan operator.\n\nKalau kamu tahu username-nya, pakai: *.addoperator <username>*')
  }
  const rows = pemain.map((p) => ({
    title: `👑 ${p.nama}`,
    description: p.xuid ? `xuid ${p.xuid}` : 'pemain yang pernah join',
    command: `.addoperator ${p.nama}`,
  }))
  const isi = [
    '👑 *JADIKAN OPERATOR*',
    '',
    `Pilih pemain dari daftar yang pernah join server (${status.totalPernah} pemain).`,
    '',
    daftarNama(status, 8),
    '',
    'Atau ketik: *.addoperator <username>*',
  ].join('\n')

  if (richDiminta(m)) {
    return kirimRich(m, conn, {
      judul: '👑 PILIH OPERATOR',
      subjudul: 'Daftar pemain yang pernah join',
      isi,
      footer: 'Hanya developer yang bisa menjalankan.',
      daftar: { listTitle: 'Pilih pemain', sections: [{ title: 'PEMAIN', rows }] },
    })
  }
  try {
    return await sendInteractive(conn, m.chat, {
      title: '👑 PILIH OPERATOR',
      subtitle: 'Daftar pemain yang pernah join',
      body: isi,
      footer: 'Klik nama untuk menjadikan operator.',
      list: { listTitle: 'Pilih pemain', sections: [{ title: 'PEMAIN', rows }] },
    }, { quoted: m.raw || m })
  } catch (error) {
    return m.reply(isi)
  }
}

/** Unduh berkas dari pesan yang dibalas. */
/* ── menunggu berkas addon ────────────────────────────────────────────── */
/* Sama seperti deploy subdomain: setelah `.addaddon` bot menunggu berkas.
 * Pesan berkas tanpa prefix tidak sampai ke plugin, jadi didaftarkan sebagai
 * aksi tertunda yang diperiksa handler.js lebih dulu. */
const TUNGGU_ADDON = new Map()
const BATAS_ADDON = 10 * 60 * 1000
const kunciAddon = (m) => `${m.chat}:${m.sender}`

function pasangAddonTunggu(m) {
  TUNGGU_ADDON.set(kunciAddon(m), { waktu: Date.now(), level: '' })
}

function ambilAddonTunggu(m) {
  const data = TUNGGU_ADDON.get(kunciAddon(m))
  if (!data) return null
  if (Date.now() - Number(data.waktu || 0) > BATAS_ADDON) {
    TUNGGU_ADDON.delete(kunciAddon(m))
    return null
  }
  return data
}

async function prosesAddon(conn, m) {
  const buffer = await unduhLampiran(conn, m)
  if (!buffer) {
    await m.reply('❌ Berkas tidak bisa diunduh. Kirim ulang sebagai dokumen (.mcaddon/.mcpack/.zip).').catch(() => { })
    return true
  }
  TUNGGU_ADDON.delete(kunciAddon(m))
  const nama = namaBerkasLampiran(m)
  let status
  try { status = await statusLengkap() } catch (error) { status = { level: '' } }
  try {
    await m.reply('⏳ Memasang addon...').catch(() => { })
    const hasil = await pasangAddon(buffer, nama, status.level)
    const baris = hasil.packs.map((p) => `• *${p.nama}* (${p.jenis}) — ${p.berkas} berkas${p.terdaftar ? ', terdaftar di dunia' : ''}`)
    await m.reply(['🧩 *Addon terpasang*', '', ...baris, '', 'Restart server dengan `.mcrestart` supaya addon aktif.'].join('\n'))
  } catch (error) {
    await m.reply(`❌ Gagal memasang addon: ${error?.message || error}`).catch(() => { })
  }
  return true
}

daftarkanAksi('mc-addon', (m) => {
  const tunggu = ambilAddonTunggu(m)
  if (!tunggu) return null
  if (!adaLampiran(m)) return null
  return {
    jalankan: function (msg) {
      return prosesAddon(this, msg || m)
    },
  }
})

const jalankanHandler = async (m, extra = {}) => {
  const { conn, args = [], command = '', text = '', isROwner, isOwner } = extra
  const rich = richDiminta(m)
  const dev = Boolean(isROwner)
  const orangPenting = Boolean(isROwner || isOwner)

  if (command === 'mchelp') {
    return m.reply([
      '🎮 *KONTROL SERVER MINECRAFT*',
      '',
      '*Lihat*',
      '.statusmc — status server + username yang pernah join',
      '..statusmc — versi rich message',
      '.pingmc / ..pingmc — ping + signaling',
      '.mconline — pemain online sekarang',
      '.mcjoin — daftar pemain yang pernah join',
      '.mcmabar — alamat + tutorial masuk server',
      '.listaddon — addon yang terpasang',
      '',
      '*Atur waktu & cuaca (owner)*',
      '.settimemc day|noon|sunset|night|midnight|<0-23999>',
      '.mccuaca clear|rain|thunder',
      '',
      '*Pemain*',
      '.addoperator [nama] — jadikan operator (developer)',
      '.deloperator <nama> — cabut operator (developer)',
      '.banplayermc <nama> <alasan> — ban (developer, alasan wajib)',
      '.unbanplayermc <nama> — cabut ban (developer)',
      '.mckick <nama> [alasan] — keluarkan pemain',
      '',
      '*Addon (developer)*',
      '.addaddon — balas berkas .mcaddon/.mcpack/.zip',
      '.deladdon <nama> — hapus addon dari server',
      '',
      '*Server*',
      '.mcstart · .mcstop · .mcrestart',
      '.mccmd <perintah console> — developer',
    ].join('\n'))
  }

  if (!konfigSiap()) return m.reply(belumSiap())

  if (command === 'statusmc') return tanganiStatus(m, conn, rich)
  if (command === 'pingmc') return tanganiPing(m, conn, rich)

  if (command === 'mcmabar') {
    const status = await statusLengkap()
    return kirimTeks(m, conn, teksMabar(status))
  }

  if (command === 'mconline') {
    const status = await statusLengkap()
    const isi = status.online.length
      ? `👥 *Online sekarang* (${status.jumlahOnline}/${status.maksimal})\n\n${status.online.map((x, i) => `${i + 1}. ${x}`).join('\n')}`
      : `Tidak ada pemain online (0/${status.maksimal || '-'}).`
    return kirimTeks(m, conn, isi)
  }

  if (command === 'mcjoin' || command === 'mchistory') {
    const status = await statusLengkap()
    if (!status.pemain.length) return kirimTeks(m, conn, 'Belum ada pemain yang pernah join.')
    return kirimTeks(m, conn, [
      `👥 *Pemain yang pernah join* (${status.totalPernah})`,
      '',
      daftarNama(status, Number(args[0]) || 20),
    ].join('\n'))
  }

  if (command === 'listaddon') {
    const daftar = await daftarAddon()
    if (!daftar.length) return m.reply('Belum ada addon tambahan di server (selain bawaan BDS).')
    return m.reply([
      `🧩 *Addon terpasang* (${daftar.length})`,
      '',
      ...daftar.map((x, i) => `${i + 1}. *${x.nama}* · ${x.jenis} · v${x.versi}`),
    ].join('\n'))
  }

  if (!orangPenting) return m.reply('🔒 Perintah ini khusus owner/developer.')

  if (command === 'settimemc' || command === 'settime') {
    const nilai = String(args[0] || '').toLowerCase()
    if (!nilai) return m.reply('Pakai: .settimemc day|night|noon|midnight|<0-23999>')
    if (CUACA[nilai]) return m.reply('Itu nilai cuaca. Pakai .mccuaca ' + CUACA[nilai])
    const target = JAM[nilai] || (/^\d+$/.test(nilai) ? String(Math.min(23999, Number(nilai))) : '')
    if (!target) return m.reply('Nilai waktu tidak dikenal. Contoh: .settimemc night')
    const dijalankan = await kirimPerintah(`time set ${target}`)
    return m.reply(`🌗 Perintah dikirim: \`${dijalankan}\`\nCek dengan .statusmc`)
  }

  if (command === 'mccuaca' || command === 'setcuaca' || command === 'weathermc') {
    const nilai = String(args[0] || '').toLowerCase()
    const target = CUACA[nilai]
    if (!target) return m.reply('Pakai: .mccuaca clear|rain|thunder')
    const dijalankan = await kirimPerintah(`weather ${target}`)
    return m.reply(`🌦️ Perintah dikirim: \`${dijalankan}\``)
  }

  if (command === 'addoperator') {
    if (!dev) return m.reply('🔒 Menjadikan operator hanya untuk developer.')
    const target = String(args[0] || '').trim()
    if (!target) {
      const status = await statusLengkap()
      return pilihOperator(m, conn, status)
    }
    if (!/^[A-Za-z0-9_ .-]{2,32}$/.test(target)) return m.reply('Nama pemain tidak valid.')
    try {
      const dijalankan = await opPemain(target)
      return m.reply(`👑 *${target}* sekarang operator.\n\`${dijalankan}\`\n\nKalau pemain sedang online, minta rejoin supaya hak operator aktif.`)
    } catch (error) {
      return m.reply(`❌ Gagal: ${error?.message || error}`)
    }
  }

  if (command === 'deloperator' || command === 'deopoperator') {
    if (!dev) return m.reply('🔒 Mencabut operator hanya untuk developer.')
    const target = String(args[0] || '').trim()
    if (!target) return m.reply('Pakai: .deloperator <nama>')
    try {
      const dijalankan = await deopPemain(target)
      return m.reply(`✅ Operator *${target}* dicabut.\n\`${dijalankan}\``)
    } catch (error) {
      return m.reply(`❌ Gagal: ${error?.message || error}`)
    }
  }

  if (command === 'banplayermc' || command === 'mcban') {
    if (!dev) return m.reply('🔒 Ban pemain hanya untuk developer.')
    const target = String(args[0] || '').trim()
    const alasan = args.slice(1).join(' ').trim()
    if (!target) return m.reply('Pakai: .banplayermc <nama> <alasan>')
    if (!alasan) return m.reply('❌ Alasan wajib diisi.\nContoh: .banplayermc Steve griefing spawn')
    try {
      const dijalankan = await banPemain(target, alasan)
      return m.reply(`🚫 *${target}* diban.\nAlasan: ${alasan}\n\`${dijalankan}\``)
    } catch (error) {
      return m.reply(`❌ Gagal: ${error?.message || error}`)
    }
  }

  if (command === 'unbanplayermc' || command === 'mcunban') {
    if (!dev) return m.reply('🔒 Cabut ban hanya untuk developer.')
    const target = String(args[0] || '').trim()
    if (!target) return m.reply('Pakai: .unbanplayermc <nama>')
    try {
      const dijalankan = await unbanPemain(target)
      return m.reply(`✅ Ban *${target}* dicabut.\n\`${dijalankan}\``)
    } catch (error) {
      return m.reply(`❌ Gagal: ${error?.message || error}`)
    }
  }

  if (command === 'mckick') {
    const target = String(args[0] || '').trim()
    if (!target) return m.reply('Pakai: .mckick <nama> [alasan]')
    const alasan = args.slice(1).join(' ').trim()
    try {
      const dijalankan = await kickPemain(target, alasan)
      return m.reply(`👢 *${target}* dikeluarkan.\n\`${dijalankan}\``)
    } catch (error) {
      return m.reply(`❌ Gagal: ${error?.message || error}`)
    }
  }

  if (command === 'addaddon') {
    if (!dev) return m.reply('🔒 Menambah addon hanya untuk developer.')
    if (!adaLampiran(m)) {
      /* Belum ada berkas: minta user mengirim berkasnya sekarang. */
      pasangAddonTunggu(m)
      return m.reply([
        '🧩 *Pasang addon*',
        '',
        'Kirim berkasnya sekarang (maks 10 menit):',
        '• *.mcaddon* — addon lengkap (behaviour + resource)',
        '• *.mcpack* — satu pack saja',
        '• *.zip* — isi folder yang ada manifest.json',
        '',
        'Bisa juga: balas berkas itu dengan `.addaddon`',
      ].join('\n'))
    }
    const buffer = await unduhLampiran(conn, m)
    const nama = namaBerkasLampiran(m)
    if (!buffer) return m.reply('❌ Berkas tidak bisa diunduh. Coba kirim ulang sebagai dokumen.')
    let status
    try { status = await statusLengkap() } catch (error) { status = { level: '' } }
    try {
      await m.reply('⏳ Memasang addon... server akan dimuat ulang setelah selesai.')
      const hasil = await pasangAddon(buffer, nama, status.level)
      const baris = hasil.packs.map((p) => `• *${p.nama}* (${p.jenis}) — ${p.berkas} berkas${p.terdaftar ? ', terdaftar di dunia' : ''}`)
      return m.reply(['🧩 *Addon terpasang*', '', ...baris, '', 'Restart server dengan `.mcrestart` supaya addon aktif.'].join('\n'))
    } catch (error) {
      return m.reply(`❌ Gagal memasang addon: ${error?.message || error}`)
    }
  }

  if (command === 'deladdon') {
    if (!dev) return m.reply('🔒 Menghapus addon hanya untuk developer.')
    const target = String(args[0] || '').trim()
    if (!target) {
      const daftar = await daftarAddon()
      if (!daftar.length) return m.reply('Belum ada addon tambahan di server.')
      return m.reply(['Pakai: .deladdon <nama>', '', 'Addon terpasang:', ...daftar.map((x) => `• ${x.nama}`)].join('\n'))
    }
    let status
    try { status = await statusLengkap() } catch (error) { status = { level: '' } }
    try {
      const hasil = await hapusAddon(target, status.level)
      return m.reply(`🗑️ Addon *${hasil.nama}* dihapus dari server.\nRestart dengan \`.mcrestart\` supaya perubahan aktif.`)
    } catch (error) {
      return m.reply(`❌ Gagal: ${error?.message || error}`)
    }
  }

  if (['mcstart', 'mcstop', 'mcrestart', 'mckill'].includes(command)) {
    const sinyal = command.replace('mc', '')
    try {
      await dayaServer(sinyal)
      return m.reply(`⚡ Sinyal *${sinyal}* dikirim ke server MC. Cek .statusmc beberapa saat lagi.`)
    } catch (error) {
      return m.reply(`❌ Gagal: ${error?.message || error}`)
    }
  }

  if (command === 'mccmd') {
    if (!dev) return m.reply('🔒 Perintah console mentah hanya untuk developer.')
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

/* Pembungkus: apa pun yang gagal (panel 502, jaringan putus, dll) dijawab
 * dengan kalimat yang bisa dibaca user — bukan tumpukan error plugin. */
let handler = async (m, extra = {}) => {
  try {
    return await jalankanHandler(m, extra)
  } catch (error) {
    console.log(`[mc-kontrol] ${error?.message || error}`)
    const pesan = error?.ramah || pesanGalatPanel(error)
    try {
      return await m.reply(`❌ ${pesan}`)
    } catch (balasError) { }
  }
}

handler.help = [
  'statusmc', 'pingmc', 'mconline', 'mcjoin', 'mcmabar',
  'settimemc day', 'mccuaca rain', 'addoperator', 'deloperator nama',
  'banplayermc nama alasan', 'unbanplayermc nama', 'mckick nama',
  'addaddon', 'deladdon nama', 'listaddon',
  'mcstart', 'mcstop', 'mcrestart', 'mccmd perintah', 'mchelp',
]
handler.tags = ['owner']
handler.command = /^(statusmc|pingmc|mconline|mcjoin|mchistory|mcmabar|listaddon|settimemc|settime|mccuaca|setcuaca|weathermc|addoperator|deloperator|deopoperator|banplayermc|mcban|unbanplayermc|mcunban|mckick|addaddon|deladdon|mcstart|mcstop|mcrestart|mckill|mccmd|mchelp)$/i
handler.description = 'Kontrol server Minecraft dari WhatsApp (status, waktu, cuaca, operator, ban, addon)'
handler.owner = false
handler.group = false
handler.private = false

export { handler, JAM, CUACA, teksStatusLengkap, teksMabar, daftarNama }
export default handler
