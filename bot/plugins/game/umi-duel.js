/*
 * umi-duel.js — Umi Usanagi AI (fitur asli, ditulis dari nol)
 *
 * Duel lempar koin antar pengguna dengan taruhan saldo bot.
 *
 *   .umiduel @user <taruhan>  → tantang
 *   .umiduel terima           → pihak tertantang menerima (berlaku 2 menit)
 *   .umiduel tolak            → menolak tantangan
 *
 * Koin dilempar (adil 50/50). Pemenang mengambil seluruh pot (2x taruhan).
 */
const CHALLENGES = new Map() // chat -> challenge
const idr = (n) => `Rp${Number(n).toLocaleString('id-ID')}`

function akun(jid) {
    const db = global.db?.data
    if (!db || Array.isArray(db.users)) return null
    if (!db.users) db.users = {}
    if (!db.users[jid]) db.users[jid] = { money: 0 }
    const user = db.users[jid]
    user.money = Number(user.money) || 0
    return user
}
const num = (jid) => String(jid || '').split('@')[0]

let handler = async (m, { args, usedPrefix, command }) => {
    const action = (args[0] || '').toLowerCase()
    const active = CHALLENGES.get(m.chat)
    const fresh = active && Date.now() - active.at < 2 * 60 * 1000 ? active : null
    if (active && !fresh) CHALLENGES.delete(m.chat)

    if (action === 'terima') {
        if (!fresh) return m.reply(`Tidak ada tantangan aktif. Tantang temanmu: *${usedPrefix + command} @user 5000*`)
        if (m.sender !== fresh.target) return m.reply(`Tantangan ini untuk @${num(fresh.target)} ya.`, null, { mentions: [fresh.target] })
        const me = akun(m.sender)
        const foe = akun(fresh.from)
        if (!me || !foe) return m.reply('⚠️ Ekonomi bot sedang tidak tersedia.')
        if (me.money < fresh.bet) { CHALLENGES.delete(m.chat); return m.reply(`💸 Saldo kamu kurang untuk taruhan ${idr(fresh.bet)}. Saldo: ${idr(me.money)}`) }
        if (foe.money < fresh.bet) { CHALLENGES.delete(m.chat); return m.reply(`💸 Saldo penantang sudah tidak cukup. Duel dibatalkan.`) }
        me.money -= fresh.bet
        foe.money -= fresh.bet
        const winner = Math.random() < 0.5 ? fresh.from : fresh.target
        const loser = winner === fresh.from ? fresh.target : fresh.from
        const winAcc = winner === fresh.from ? foe : me
        winAcc.money += fresh.bet * 2
        CHALLENGES.delete(m.chat)
        await m.react('🪙').catch(() => {})
        return m.reply(
            `🪙 *DUEL KOIN — HASIL*\n\n@${num(fresh.from)} ⚔️ @${num(fresh.target)}\nTaruhan: ${idr(fresh.bet)} / orang\n\n🏆 Pemenang: @${num(winner)}\n💰 Mengambil pot: *${idr(fresh.bet * 2)}*`,
            null, { mentions: [fresh.from, fresh.target, winner] }
        )
    }

    if (action === 'tolak') {
        if (!fresh) return m.reply('Tidak ada tantangan aktif.')
        if (m.sender !== fresh.target && m.sender !== fresh.from) return m.reply('Hanya pihak yang terlibat yang bisa membatalkan.')
        CHALLENGES.delete(m.chat)
        return m.reply('🚫 Tantangan duel dibatalkan.')
    }

    // Buat tantangan baru
    const target = (m.mentionedJid || [])[0]
    const bet = parseInt(String(args.find((a) => /^\d+$/.test(a)) || '').replace(/\D/g, ''), 10)
    if (!target || !bet) {
        return m.reply(`⚔️ *DUEL KOIN — Umi Usanagi AI*\n\nTantang: *${usedPrefix + command} @user <taruhan>*\nContoh: *${usedPrefix + command} @teman 5000*\n\nLawan menerima dengan *${usedPrefix + command} terima* (berlaku 2 menit). Koin adil 50/50, pemenang mengambil semua pot.`)
    }
    if (target === m.sender) return m.reply('Tidak bisa duel dengan diri sendiri 😅')
    if (fresh) return m.reply(`⏳ Masih ada tantangan aktif dari @${num(fresh.from)} untuk @${num(fresh.target)}. Tunggu selesai/dibatalkan.`, null, { mentions: [fresh.from, fresh.target] })
    if (bet < 1000 || bet > 100000) return m.reply('Taruhan minimal Rp1.000 dan maksimal Rp100.000.')
    const me = akun(m.sender)
    const foe = akun(target)
    if (!me || !foe) return m.reply('⚠️ Ekonomi bot sedang tidak tersedia.')
    if (me.money < bet) return m.reply(`💸 Saldo kamu kurang. Saldo: ${idr(me.money)}, taruhan: ${idr(bet)}`)

    CHALLENGES.set(m.chat, { from: m.sender, target, bet, at: Date.now() })
    return m.reply(
        `⚔️ *TANTANGAN DUEL KOIN!*\n\n@${num(m.sender)} menantang @${num(target)}\n🪙 Taruhan: *${idr(bet)}* / orang (pot ${idr(bet * 2)})\n\n@${num(target)}, ketik *${usedPrefix + command} terima* dalam 2 menit, atau *${usedPrefix + command} tolak*.`,
        null, { mentions: [m.sender, target] }
    )
}

handler.help = ['umiduel @user <taruhan>', 'umiduel terima', 'umiduel tolak']
handler.tags = ['game']
handler.command = /^(umiduel|duelkoin)$/i

export default handler
