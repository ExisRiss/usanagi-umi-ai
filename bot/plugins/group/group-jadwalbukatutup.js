/* By AlzRiss - Usanagi Umi AI
 *
 * Task135 — Jadwal buka/tutup grup (DIPERBARUI).
 *
 * Yang berubah dari versi lama:
 *   1. Zona waktu bisa diatur per grup (.setzona), default Asia/Jakarta.
 *   2. Penjadwal jalan untuk BOT UTAMA dan SEMUA SESI JADIBOT
 *      (global.conn + global.jadibotConns), bukan cuma bot utama.
 *   3. Perintah baru: .settime, .setzona, .tutupgc [menit], .bukagc.
 *      `.tutupgc 30` menutup grup sekarang lalu membukanya otomatis 30 menit
 *      kemudian.
 *   4. Admin grup, owner bot, dan user ber-role admin/owner (.setakses) boleh
 *      memakai perintah ini.
 *
 * Perintah lama tetap jalan: .bukajam, .tutupjam, .jadwal, .hapusbukajam,
 * .hapustutupjam, .hapusjadwal.
 */

const ZONA_BAWAAN = 'Asia/Jakarta'

/** Jadwal yang sudah dijalankan menit ini, supaya tidak dobel. */
const schedules = global.umiJadwalSchedules || (global.umiJadwalSchedules = {})
/** Timer buka-otomatis dari .tutupgc <menit>. */
const timerBuka = global.umiJadwalTimer || (global.umiJadwalTimer = {})

/* ── util ─────────────────────────────────────────────────────────────── */

function db() {
  try {
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.users) global.db.data.users = {}
    return global.db.data
  } catch (error) {
    return null
  }
}

function zonaChat(chat) {
  const zona = (chat && chat.timezone) || ZONA_BAWAAN
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: zona }).format(new Date())
    return zona
  } catch (error) {
    return ZONA_BAWAAN
  }
}

/** Jam "HH:MM" di zona tertentu (dipakai penjadwal & test). */
export function waktuDi(zona) {
  const aman = (() => {
    try {
      new Intl.DateTimeFormat('en-GB', { timeZone: zona }).format(new Date())
      return zona
    } catch (error) {
      return ZONA_BAWAAN
    }
  })()
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: aman, hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date())
  } catch (error) {
    return '00:00'
  }
}

/** Semua koneksi yang bisa mengatur grup: bot utama + sesi jadibot. */
export function semuaSoket() {
  const hasil = []
  const tambah = (conn) => {
    if (conn && typeof conn.groupSettingUpdate === 'function' && !hasil.includes(conn)) hasil.push(conn)
  }
  try { tambah(global.conn) } catch (error) { }
  try {
    if (global.jadibotConns instanceof Map) {
      for (const conn of global.jadibotConns.values()) tambah(conn)
    }
  } catch (error) { }
  return hasil
}

function bolehAtur(m, extra) {
  if (extra && (extra.isAdmin || extra.isOwner)) return true
  const nomor = String(m.sender || '')
  const data = db()
  if (!data) return false
  const user = data.users[nomor] || data.users[nomor.split('@')[0]] || data.users[nomor.split(':')[0] + '@s.whatsapp.net']
  const role = String((user && (user.akses || user.role)) || '').toLowerCase()
  return role === 'owner' || role === 'admin'
}

function uraiJam(teks) {
  const cocok = String(teks || '').trim().match(/^(\d{1,2})[:.](\d{1,2})$/)
  if (!cocok) return null
  const jam = parseInt(cocok[1], 10)
  const menit = parseInt(cocok[2], 10)
  if (Number.isNaN(jam) || jam < 0 || jam > 23) return null
  if (Number.isNaN(menit) || menit < 0 || menit > 59) return null
  return `${String(jam).padStart(2, '0')}:${String(menit).padStart(2, '0')}`
}

/* ── penjadwal ────────────────────────────────────────────────────────── */

export async function jalankanJadwal() {
  const data = db()
  if (!data) return []
  const soket = semuaSoket()
  if (!soket.length) return []
  const laporan = []

  for (const jid of Object.keys(data.chats)) {
    const chat = data.chats[jid]
    if (!chat) continue
    const sekarang = waktuDi(zonaChat(chat))

    const aksi = []
    if (chat.openTime && chat.openTime === sekarang) aksi.push({ jenis: 'buka', nilai: 'not_announcement' })
    if (chat.closeTime && chat.closeTime === sekarang) aksi.push({ jenis: 'tutup', nilai: 'announcement' })

    for (const item of aksi) {
      const kunci = `${jid}_${item.jenis}_${sekarang}_${chat.timezone || ZONA_BAWAAN}`
      if (schedules[kunci]) continue
      schedules[kunci] = true

      let berhasil = null
      for (const conn of soket) {
        try {
          await conn.groupSettingUpdate(jid, item.nilai)
          berhasil = conn
          break
        } catch (error) {
          // koneksi ini tidak ikut grup tersebut — coba koneksi lain
        }
      }

      if (berhasil) {
        laporan.push({ jid, jenis: item.jenis, jam: sekarang })
        try {
          await berhasil.sendMessage(jid, {
            text: item.jenis === 'buka'
              ? `✅ Grup dibuka otomatis (${sekarang} ${zonaChat(chat)}).\nSekarang semua peserta bisa mengirim pesan.`
              : `🔒 Grup ditutup otomatis (${sekarang} ${zonaChat(chat)}).\nHanya admin yang bisa mengirim pesan.`,
          })
        } catch (error) { }
      }

      const bersih = setTimeout(() => { delete schedules[kunci] }, 70000)
      if (bersih && typeof bersih.unref === 'function') bersih.unref()
    }
  }
  return laporan
}

const timer = setInterval(() => {
  jalankanJadwal().catch(() => { })
}, 30000)
if (timer && typeof timer.unref === 'function') timer.unref()

/* ── handler perintah ─────────────────────────────────────────────────── */

let handler = async (m, extra = {}) => {
  const { text = '', args = [], command = '', conn, isBotAdmin } = extra
  const data = db()
  if (!data) return m.reply('❌ Database bot belum siap, coba lagi sebentar.')
  if (!data.chats[m.chat]) data.chats[m.chat] = {}

  if (command === 'setzona') {
    const zona = String(args[0] || '').trim()
    if (!zona) {
      const dipakai = zonaChat(data.chats[m.chat])
      return m.reply(
`🌏 *ZONA WAKTU*

Zona grup ini: *${zonaChat(data.chats[m.chat])}*
Jam sekarang: *${waktuDi(dipakai)}*

Ubah: .setzona Asia/Makassar
Contoh lain: Asia/Jakarta, Asia/Jayapura`
      )
    }
    try {
      new Intl.DateTimeFormat('en-GB', { timeZone: zona }).format(new Date())
    } catch (error) {
      return m.reply('❌ Zona tidak dikenal.\nContoh: Asia/Makassar, Asia/Jakarta, Asia/Jayapura')
    }
    data.chats[m.chat].timezone = zona
    return m.reply(`✅ Zona waktu grup diset ke *${zona}*.\nJam sekarang: ${waktuDi(zona)}`)
  }

  if (command === 'settime') {
    const jenis = String(args[0] || '').toLowerCase()
    if (!jenis || jenis === 'bantuan' || jenis === 'help') {
      return m.reply(
`⏰ *ATUR JADWAL GRUP*

.settime buka 08:00
.settime tutup 22:00
.settime hapus
.jadwal  — lihat jadwal
.setzona Asia/Makassar  — ganti zona waktu
.tutupgc 30  — tutup grup sekarang, buka lagi 30 menit kemudian
.bukagc  — buka grup sekarang`
      )
    }
    if (jenis === 'hapus' || jenis === 'off') {
      delete data.chats[m.chat].openTime
      delete data.chats[m.chat].closeTime
      return m.reply('✅ Semua jadwal otomatis grup ini dihapus.')
    }
    const jam = uraiJam(args[1])
    if (!jam) return m.reply('❌ Format jam salah. Contoh: .settime buka 08:00')
    if (jenis === 'buka' || jenis === 'open') {
      data.chats[m.chat].openTime = jam
      return m.reply(`✅ Grup dibuka otomatis setiap *${jam}* (${zonaChat(data.chats[m.chat])}).`)
    }
    if (jenis === 'tutup' || jenis === 'close') {
      data.chats[m.chat].closeTime = jam
      return m.reply(`✅ Grup ditutup otomatis setiap *${jam}* (${zonaChat(data.chats[m.chat])}).`)
    }
    return m.reply('❌ Pilih *buka* atau *tutup*. Contoh: .settime tutup 22:00')
  }

  const chat = data.chats[m.chat]

  if (command === 'jadwal') {
    const zona = zonaChat(chat)
    return m.reply(
`📅 *JADWAL OTOMATIS GRUP*

🔓 Buka grup : ${chat.openTime || 'belum diatur'}
🔒 Tutup grup: ${chat.closeTime || 'belum diatur'}
🌏 Zona waktu: ${zona}
🕒 Jam sekarang: ${waktuDi(zona)}
${timerBuka[m.chat] ? '\n⏳ Grup ditutup manual, akan dibuka otomatis.' : ''}

Ubah: .settime buka 08:00 / .settime tutup 22:00`
    )
  }

  if (command === 'hapusbukajam') {
    if (!chat.openTime) return m.reply('❌ Jadwal buka grup belum diatur.')
    delete chat.openTime
    return m.reply('✅ Jadwal buka grup dihapus.')
  }

  if (command === 'hapustutupjam') {
    if (!chat.closeTime) return m.reply('❌ Jadwal tutup grup belum diatur.')
    delete chat.closeTime
    return m.reply('✅ Jadwal tutup grup dihapus.')
  }

  if (command === 'hapusjadwal') {
    delete chat.openTime
    delete chat.closeTime
    return m.reply('✅ Semua jadwal buka & tutup grup dihapus.')
  }

  if (command === 'bukajam' || command === 'tutupjam') {
    const jam = uraiJam(text.trim())
    if (!jam) return m.reply(`❌ Contoh: .${command} 18:00`)
    if (command === 'bukajam') {
      chat.openTime = jam
      return m.reply(`✅ Grup dibuka otomatis setiap *${jam}* (${zonaChat(chat)}).`)
    }
    chat.closeTime = jam
    return m.reply(`✅ Grup ditutup otomatis setiap *${jam}* (${zonaChat(chat)}).`)
  }

  if (command === 'tutupgc' || command === 'bukagc') {
    if (!bolehAtur(m, extra)) return m.reply('❌ Khusus admin grup atau owner bot.')
    const soket = conn ? [conn].concat(semuaSoket().filter((c) => c !== conn)) : semuaSoket()
    if (!soket.length) return m.reply('❌ Bot belum tersambung.')
    if (isBotAdmin === false) return m.reply('❌ Bot harus jadi admin grup dulu.')

    if (command === 'tutupgc') {
      const menit = parseInt(args[0], 10)
      let berhasil = false
      for (const c of soket) {
        try { await c.groupSettingUpdate(m.chat, 'announcement'); berhasil = true; break } catch (error) { }
      }
      if (!berhasil) return m.reply('❌ Gagal menutup grup (bot bukan admin?).')
      if (m.chat in timerBuka) { clearTimeout(timerBuka[m.chat]); delete timerBuka[m.chat] }
      if (Number.isFinite(menit) && menit > 0) {
        timerBuka[m.chat] = setTimeout(async () => {
          delete timerBuka[m.chat]
          for (const c of semuaSoket()) {
            try {
              await c.groupSettingUpdate(m.chat, 'not_announcement')
              await c.sendMessage(m.chat, { text: `✅ Grup dibuka otomatis setelah ${menit} menit.` })
              break
            } catch (error) { }
          }
        }, menit * 60000)
        if (timerBuka[m.chat] && typeof timerBuka[m.chat].unref === 'function') timerBuka[m.chat].unref()
        return m.reply(`🔒 Grup ditutup. Akan dibuka otomatis *${menit} menit* lagi.`)
      }
      return m.reply('🔒 Grup ditutup. Buka lagi dengan .bukagc')
    }

    let berhasil = false
    for (const c of soket) {
      try { await c.groupSettingUpdate(m.chat, 'not_announcement'); berhasil = true; break } catch (error) { }
    }
    if (m.chat in timerBuka) { clearTimeout(timerBuka[m.chat]); delete timerBuka[m.chat] }
    if (!berhasil) return m.reply('❌ Gagal membuka grup (bot bukan admin?).')
    return m.reply('🔓 Grup dibuka. Semua peserta bisa mengirim pesan.')
  }
}

handler.help = [
  'settime buka 08:00',
  'settime tutup 22:00',
  'setzona Asia/Makassar',
  'jadwal',
  'bukajam 08:00',
  'tutupjam 22:00',
  'tutupgc 30',
  'bukagc',
  'hapusbukajam',
  'hapustutupjam',
  'hapusjadwal',
]
handler.tags = ['group']
handler.command = /^(settime|setzona|jadwal|bukajam|tutupjam|tutupgc|bukagc|hapusbukajam|hapustutupjam|hapusjadwal)$/i
handler.group = true
handler.admin = false
handler.botAdmin = false

export { handler }
export default handler
