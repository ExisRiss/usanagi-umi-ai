/* Umi Usanagi AI — Paket Fitur Umi (kode orisinal) */

// Misi harian Umi. Status disimpan di user.umimisi pada database.json yang sama
// dengan RPG lama, dan hadiahnya masuk ke user.money (dompet yang dipakai
// .bank/.sell/.deposit).

export const MISI_HARIAN = [
  { id: 'harian', nama: 'Absen Harian', target: 1, hadiah: 5000, progres: s => 1 },
  { id: 'main', nama: 'Main .umitebak 3 kali', target: 3, hadiah: 7500, progres: s => s.plays || 0 },
  { id: 'menang', nama: 'Menang .umitebak 1 kali', target: 1, hadiah: 10000, progres: s => s.wins || 0 },
]

/** Kunci hari di zona waktu pengguna bot (Asia/Makassar). */
export function dayKey(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Makassar' }).format(now)
}

/** Ambil status misi hari ini; reset otomatis saat berganti hari. */
export function missionState(user, now = new Date()) {
  const today = dayKey(now)
  if (!user.umimisi || user.umimisi.day !== today) {
    user.umimisi = { day: today, plays: 0, wins: 0, claimed: {} }
  }
  if (!user.umimisi.claimed) user.umimisi.claimed = {}
  return user.umimisi
}

let handler = async (m, { args, usedPrefix, command }) => {
  const user = global.db?.data?.users?.[m.sender]
  if (!user) return m.reply('Kamu belum terdaftar di RPG. Mainkan fitur RPG lain dulu (mis. *.bank*) agar datamu dibuat.')

  const state = missionState(user)
  const sub = String(args[0] || '').toLowerCase()

  if (sub === 'klaim') {
    const wanted = String(args[1] || 'semua').toLowerCase()
    let total = 0
    const done = []

    for (const misi of MISI_HARIAN) {
      if (wanted !== 'semua' && wanted !== misi.id) continue
      if (state.claimed[misi.id]) continue
      if (misi.progres(state) < misi.target) continue
      state.claimed[misi.id] = true
      total += misi.hadiah
      done.push(`• ${misi.nama} → +${misi.hadiah.toLocaleString('id-ID')}`)
    }

    if (!done.length) {
      return m.reply(wanted === 'semua'
        ? 'Belum ada misi selesai yang bisa diklaim. Cek progres: *.umimisi*'
        : `Misi *${wanted}* belum selesai atau sudah diklaim.`)
    }

    user.money = (user.money || 0) + total
    const e = global.rpg?.emoticon ? global.rpg.emoticon('money') : '💰'
    return m.reply(`🎉 *HADIAH MISI DIKLAIM — Umi Usanagi AI*\n\n${done.join('\n')}\n\n${e} Total: +${total.toLocaleString('id-ID')}\nSaldo dompet: ${(user.money).toLocaleString('id-ID')}`)
  }

  const lines = MISI_HARIAN.map(misi => {
    const now = Math.min(misi.progres(state), misi.target)
    const status = state.claimed[misi.id] ? '✅ sudah diklaim' : now >= misi.target ? '🎁 siap diklaim' : '⏳ berjalan'
    return `• *${misi.nama}*\n  Progres ${now}/${misi.target} · Hadiah ${misi.hadiah.toLocaleString('id-ID')} · ${status}`
  })

  return m.reply(
    `🎯 *MISI HARIAN — Umi Usanagi AI*\n📅 ${state.day}\n\n${lines.join('\n')}\n\nKlaim: ${usedPrefix + command} klaim semua\nMain untuk progres: *.umitebak*`,
  )
}

handler.help = ['umimisi', 'umimisi klaim <semua|harian|main|menang>']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.command = /^(umimisi|misi)$/i
handler.description = 'Misi harian berhadiah money RPG (Umi Usanagi AI)'

export default handler
