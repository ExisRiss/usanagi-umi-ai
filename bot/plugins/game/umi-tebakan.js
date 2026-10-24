/*
 * umi-tebakan.js — Umi Usanagi AI (fitur asli, ditulis dari nol)
 *
 * Tebak-tebakan receh khas tongkrongan dengan bank soal orisinal.
 * Sesi per grup, 3x kesempatan, hadiah saldo bot.
 *
 *   .umitebakan            → soal baru
 *   .umitebakan <jawaban>  → jawab
 *   .umitebakan nyerah     → menyerah
 */
const BANK = [
    { q: 'Hewan apa yang kalau berjalan kakinya selalu mengikuti jejak kaki hewan lain?', a: ['zebra cross', 'zebracross'], display: 'Zebra cross (marka jalan yang diikuti pejalan kaki)' },
    { q: 'Kenapa kuda tidak pernah membawa dompet?', a: ['karena tidak punya saku', 'tidak punya saku', 'nggak punya saku'], display: 'Karena tidak punya saku' },
    { q: 'Ikan apa yang bisa terbang?', a: ['lelelawar', 'lele lawar'], display: 'Lele-lawar (plesetan kelelawar)' },
    { q: 'Benda apa yang makin diisi makin ringan?', a: ['balon'], display: 'Balon (diisi udara)' },
    { q: 'Apa bedanya soto dengan sopir?', a: ['soto ada di mangkok sopir ada di mobil', 'soto di mangkok sopir di mobil'], display: 'Soto ada di mangkok, sopir ada di mobil' },
    { q: 'Kenapa burung terbang ke selatan saat musim dingin?', a: ['karena jalan kaki kejauhan', 'jalan kaki terlalu jauh', 'kejauhan kalau jalan'], display: 'Karena jalan kaki kejauhan' },
    { q: 'Sayur apa yang bisa nyanyi?', a: ['kolaborasi', 'kol aborasi'], display: 'Kol-abrasi → kolaborasi' },
    { q: 'Pintu apa yang didorong sepuluh orang pun tidak bisa terbuka?', a: ['pintu tulisannya tarik', 'pintu bertuliskan tarik', 'pintu yang tulisannya tarik'], display: 'Pintu yang tulisannya "TARIK"' },
    { q: 'Kenapa ayam menyeberang jalan?', a: ['mau ke seberang', 'untuk sampai ke seberang', 'kepengen ke seberang'], display: 'Mau sampai ke seberang' },
    { q: 'Hewan apa yang paling tidak sopan?', a: ['kutu', 'kutu buku'], display: 'Kutu — suka naik ke kepala orang' },
    { q: 'Bulan apa yang paling romantis?', a: ['bulan madu'], display: 'Bulan madu' },
    { q: 'Kenapa dokter kalau operasi selalu pakai masker?', a: ['biar tidak dikenali kalau gagal', 'supaya tidak dikenali pasien', 'agar tidak ketahuan kalau salah'], display: 'Biar tidak dikenali kalau operasinya gagal' },
    { q: 'Kopi apa yang paling pahit?', a: ['kopilih dia daripada aku', 'kopilih dia'], display: 'Kopilih dia daripada aku' },
    { q: 'Tahu apa yang paling besar?', a: ['tahu isi semarang', 'tahu sumedang besar'], display: 'Tahu isi… isinya harapan yang besar' },
    { q: 'Kenapa kalajengking tidak pernah telat?', a: ['karena selalu on time', 'karena punya banyak kaki'], display: 'Karena selalu tepat waktu mengejar mangsa — punya delapan kaki' },
    { q: 'Uang apa yang paling banyak temannya?', a: ['uang receh', 'receh'], display: 'Uang receh — selalu kumpul bareng' },
    { q: 'Sate apa yang berasal dari luar angkasa?', a: ['satelit'], display: 'Satelit' },
    { q: 'Kenapa bintang laut tidak bisa berenang cepat?', a: ['karena bentuknya bintang', 'karena tidak punya ekor'], display: 'Karena tidak punya ekor untuk mendayung' },
]

const sessions = new Map()
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim()

function akun(m) {
    const db = global.db?.data
    if (!db || Array.isArray(db.users)) return null
    if (!db.users) db.users = {}
    if (!db.users[m.sender]) db.users[m.sender] = { money: 0 }
    const user = db.users[m.sender]
    user.money = Number(user.money) || 0
    return user
}

let handler = async (m, { args, usedPrefix, command }) => {
    const ses = sessions.get(m.chat)
    const answer = norm(args.join(' '))

    if (answer === 'nyerah') {
        if (!ses) return m.reply(`Belum ada soal berjalan. Mulai: *${usedPrefix + command}*`)
        sessions.delete(m.chat)
        return m.reply(`🏳️ Jawabannya: *${ses.display}*`)
    }

    if (ses && answer) {
        if (ses.answers.includes(answer)) {
            sessions.delete(m.chat)
            const reward = 900
            const user = akun(m)
            if (user) user.money += reward
            await m.react('😂').catch(() => {})
            return m.reply(`🤣 *BENER BANGET!*\nJawaban: *${ses.display}*\n💰 Hadiah: *Rp${reward.toLocaleString('id-ID')}*${user ? `\n💳 Saldo kamu: *Rp${user.money.toLocaleString('id-ID')}*` : ''}`)
        }
        ses.tries += 1
        if (ses.tries >= 3) {
            sessions.delete(m.chat)
            return m.reply(`❌ Kesempatan habis! Jawabannya: *${ses.display}*\nSoal baru: *${usedPrefix + command}*`)
        }
        return m.reply(`❌ Bukan itu. Sisa kesempatan: *${3 - ses.tries}x*.\n🤔 Soal: ${ses.q}`)
    }

    if (ses && !answer) return m.reply(`⏳ Soal masih berjalan:\n🤔 ${ses.q}\nJawab: *${usedPrefix + command} <jawaban>*`)

    const pick = BANK[Math.floor(Math.random() * BANK.length)]
    sessions.set(m.chat, { q: pick.q, display: pick.display, answers: pick.a.map(norm), tries: 0, at: Date.now() })
    return m.reply(`🤔 *TEBAK-TEBAKAN RECEH — Umi Usanagi AI*\n\n${pick.q}\n\nJawab: *${usedPrefix + command} <jawaban>* · 3x kesempatan`)
}

handler.help = ['umitebakan [jawaban|nyerah]']
handler.tags = ['game']
handler.command = /^(umitebakan|tebakanreceh)$/i

export default handler
