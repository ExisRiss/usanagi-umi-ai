/*
 * umi-susun.js — Umi Usanagi AI (fitur asli, ditulis dari nol)
 *
 * Gim susun kata: bot mengacak huruf sebuah kata, pemain menebak kata aslinya.
 * Sesi per grup dengan maksimal 3x percobaan dan hadiah saldo bot.
 *
 *   .umisusun            → mulai / kata baru
 *   .umisusun <kata>     → jawab
 *   .umisusun nyerah     → menyerah (kata ditampilkan)
 */
const BANK = [
    { w: 'pramuka', clue: 'Kegiatan seragam cokelat di sekolah' },
    { w: 'perpustakaan', clue: 'Tempat meminjam buku' },
    { w: 'komputer', clue: 'Mesin pengolah data di meja kerja' },
    { w: 'sepanjang', clue: 'Antonim dari pendek untuk jarak' },
    { w: 'keluarga', clue: 'Ayah, ibu, dan anak-anak' },
    { w: 'petualang', clue: 'Orang yang suka menjelajah tempat baru' },
    { w: 'cermin', clue: 'Benda untuk melihat bayangan wajah' },
    { w: 'pelangi', clue: 'Lengkungan warna-warni setelah hujan' },
    { w: 'gemilang', clue: 'Bercahaya cemerlang, sangat berhasil' },
    { w: 'bersandar', clue: 'Menyandarkan badan pada dinding' },
    { w: 'melompat', clue: 'Gerakan meloncat ke atas' },
    { w: 'perpindahan', clue: 'Proses berpindah tempat' },
    { w: 'semangat', clue: 'Rasa ingin berusaha dengan giat' },
    { w: 'pengetahuan', clue: 'Hal-hal yang diketahui dari belajar' },
    { w: 'kerajinan', clue: 'Barang hasil keterampilan tangan' },
    { w: 'menyelam', clue: 'Masuk ke dalam air dengan alat bantu napas' },
    { w: 'berlayar', clue: 'Bepergian dengan kapal di laut' },
    { w: 'kesehatan', clue: 'Keadaan badan yang sehat' },
    { w: 'pekerjaan', clue: 'Kegiatan untuk mencari nafkah' },
    { w: 'tersenyum', clue: 'Ekspresi wajah yang ramah' },
]

const sessions = new Map()

function acak(word) {
    const letters = word.split('')
    for (let round = 0; round < 12 && letters.join('') === word; round++) {
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[letters[i], letters[j]] = [letters[j], letters[i]]
        }
    }
    return letters.join(' ').toUpperCase()
}

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
    const answer = (args.join(' ') || '').trim().toLowerCase()

    if (answer === 'nyerah') {
        if (!ses) return m.reply(`Belum ada gim berjalan. Mulai dengan *${usedPrefix + command}*`)
        sessions.delete(m.chat)
        return m.reply(`🏳️ Menyerah! Katanya adalah *${ses.word.toUpperCase()}*.`)
    }

    if (ses && answer) {
        if (answer === ses.word) {
            sessions.delete(m.chat)
            const reward = 1200 + ses.word.length * 150
            const user = akun(m)
            if (user) user.money += reward
            await m.react('🏆').catch(() => {})
            return m.reply(`🎉 *BENAR!* Katanya: *${ses.word.toUpperCase()}*\n💰 Hadiah: *Rp${reward.toLocaleString('id-ID')}*${user ? `\n💳 Saldo kamu: *Rp${user.money.toLocaleString('id-ID')}*` : ''}`)
        }
        ses.tries += 1
        if (ses.tries >= 3) {
            sessions.delete(m.chat)
            return m.reply(`❌ Salah (${answer}) — kesempatan habis!\nKatanya adalah *${ses.word.toUpperCase()}*. Coba lagi: *${usedPrefix + command}*`)
        }
        return m.reply(`❌ Belum tepat (${answer}). Sisa kesempatan: *${3 - ses.tries}x*.\n💡 Petunjuk: ${ses.clue}\n🔤 Huruf: *${ses.shuffled}*`)
    }

    if (ses && !answer) {
        return m.reply(`⏳ Gim masih berjalan!\n🔤 Huruf: *${ses.shuffled}*\n💡 Petunjuk: ${ses.clue}\nJawab: *${usedPrefix + command} <kata>* · atau *${usedPrefix + command} nyerah*`)
    }

    const pick = BANK[Math.floor(Math.random() * BANK.length)]
    const fresh = { word: pick.w, clue: pick.clue, shuffled: acak(pick.w), tries: 0, at: Date.now() }
    sessions.set(m.chat, fresh)
    return m.reply(`🧩 *SUSUN KATA — Umi Usanagi AI*\n\n🔤 Huruf acak: *${fresh.shuffled}*\n💡 Petunjuk: ${fresh.clue}\n📏 ${pick.w.length} huruf · kesempatan 3x\n\nJawab: *${usedPrefix + command} <kata>*`)
}

handler.help = ['umisusun [kata|nyerah]']
handler.tags = ['game']
handler.command = /^umisusun$/i

export default handler
