/* By AlzRiss - Usanagi Umi AI
 *
 * Task136 — menu Minecraft.
 *
 *   .mcmenu    → menu teks + tombol
 *   ..mcmenu   → rich message (kartu + daftar)
 *
 * Isinya: semua fitur yang sudah ada + daftar perintah baru
 * (addaddon, addoperator, deladdon, settimemc, statusmc, banplayermc, mcmabar).
 */

import { sendInteractive } from '../../lib/awang-tombol.js'
import { konfigSiap, statusLengkap } from '../../lib/mc-kaira.js'

const DAFTAR = [
  {
    judul: '📊 LIHAT STATUS',
    baris: [
      ['.statusmc', 'Status server, RAM/CPU, pemain online + username yang pernah join'],
      ['..statusmc', 'Versi rich message (tombol + daftar)'],
      ['.pingmc / ..pingmc', 'Tes TCP signaling + HTTP /v1/join'],
      ['.mconline', 'Pemain yang online sekarang'],
      ['.mcjoin', 'Daftar pemain yang pernah join (username)'],
      ['.mcmabar', 'Alamat server, port, dan tutorial masuk'],
    ],
  },
  {
    judul: '⏰ WAKTU & CUACA',
    baris: [
      ['.settimemc day', 'Set waktu siang (noon/sunset/night/midnight juga bisa)'],
      ['.settimemc <0-23999>', 'Set waktu dengan tick manual'],
      ['.mccuaca clear', 'Cuaca cerah (rain / thunder juga bisa)'],
    ],
  },
  {
    judul: '👑 OPERATOR & BAN',
    baris: [
      ['.addoperator', 'Pilih pemain yang pernah join → jadi operator (developer)'],
      ['.addoperator <nama>', 'Langsung jadikan operator (developer)'],
      ['.deloperator <nama>', 'Cabut operator (developer)'],
      ['.banplayermc <nama> <alasan>', 'Ban pemain — alasan WAJIB (developer)'],
      ['.unbanplayermc <nama>', 'Cabut ban (developer)'],
      ['.mckick <nama> [alasan]', 'Keluarkan pemain dari server'],
    ],
  },
  {
    judul: '🧩 ADDON',
    baris: [
      ['.addaddon', 'Balas berkas .mcaddon / .mcpack / .zip (developer)'],
      ['.deladdon <nama>', 'Hapus addon dari server (developer)'],
      ['.listaddon', 'Daftar addon yang terpasang'],
    ],
  },
  {
    judul: '⚡ SERVER',
    baris: [
      ['.mcstart', 'Nyalakan server'],
      ['.mcstop', 'Matikan server'],
      ['.mcrestart', 'Restart server (wajib setelah pasang addon)'],
      ['.mccmd <perintah>', 'Kirim perintah console mentah (developer)'],
      ['.mchelp', 'Bantuan singkat'],
    ],
  },
]

function teksMenu(status) {
  const baris = ['🎮 *MENU MINECRAFT*', '']
  if (status) {
    baris.push(
      `Server : *${status.nama}*`,
      `Status : *${String(status.state).toUpperCase()}* · ${status.jumlahOnline}/${status.maksimal} online`,
      `Alamat : ${status.host}:${status.port}`,
      `Pernah join : ${status.totalPernah} pemain`,
      '',
    )
  }
  for (const bagian of DAFTAR) {
    baris.push(`*${bagian.judul}*`)
    for (const [cmd, ket] of bagian.baris) {
      baris.push(`▸ ${cmd}`)
      baris.push(`   ${ket}`)
    }
    baris.push('')
  }
  baris.push('🌐 Fitur subdomain: *.subdomainmenu*')
  return baris.join('\n')
}

function daftarRich() {
  return {
    listTitle: 'Menu Minecraft',
    sections: DAFTAR.map((bagian) => ({
      title: bagian.judul.replace(/^[^\w]+\s*/, ''),
      rows: bagian.baris.slice(0, 6).map(([cmd, ket]) => ({
        title: cmd.startsWith('.') || cmd.startsWith('..') ? cmd : `.${cmd}`,
        description: ket.slice(0, 70),
        command: cmd.startsWith('.') ? cmd : `.${cmd}`,
      })),
    })),
  }
}

let handler = async (m, extra = {}) => {
  const { conn } = extra
  const rich = Boolean(m.__richMenu === true || m.__richRequest === true)
  let status = null
  if (konfigSiap()) {
    try { status = await statusLengkap() } catch (error) { status = null }
  }
  const isi = teksMenu(status)

  if (rich) {
    try {
      return await sendInteractive(conn, m.chat, {
        title: '🎮 MENU MINECRAFT',
        subtitle: status ? `${status.nama} · ${String(status.state).toUpperCase()}` : 'Server belum terhubung',
        body: isi,
        footer: 'Pilih perintah dari daftar di bawah.',
        list: daftarRich(),
      }, { quoted: m.raw || m })
    } catch (error) { }
  }

  try {
    return await sendInteractive(conn, m.chat, {
      title: '🎮 MENU MINECRAFT',
      subtitle: status ? `${status.nama} · ${String(status.state).toUpperCase()}` : 'Server belum terhubung',
      body: isi,
      footer: 'Klik "Menu Minecraft" untuk daftar perintah.',
      list: daftarRich(),
    }, { quoted: m.raw || m })
  } catch (error) {
    return m.reply(isi)
  }
}

handler.help = ['mcmenu']
handler.tags = ['owner']
handler.command = /^(mcmenu|menumc|menu_minecraft)$/i
handler.description = 'Menu semua fitur kontrol server Minecraft'
handler.owner = false
handler.group = false
handler.private = false

export { handler, teksMenu, DAFTAR }
export default handler
