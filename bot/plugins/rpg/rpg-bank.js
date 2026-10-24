let handler = async (m, { conn }) => {

// `global.rpg` tidak selalu ada di config bot ramping; akses langsung
// `global.rpg.emoticon` dulu melempar TypeError dan .bank gagal total
// (laporan Feedback 14 Okt 2026).
const user = global.db.data.users[m.sender] || {}
const e = typeof global.rpg?.emoticon === 'function'
    ? global.rpg.emoticon
    : (key) => ({ money: '💵', bank: '🏦' }[key] || '')

let text = `
🌸 *ALZRISS RPG BANK* ❀

${e('money')} Money : ${user.money || 0}
${e('bank')} Bank  : ${user.bank || 0}
💳 ATM : ${user.atm > 0 ? '✔️' : '❌'}

Gunakan:
.deposit jumlah
.withdraw jumlah
.buyatm
.upgradeatm
`.trim()

conn.reply(m.chat, text, global.fstatus)

}

handler.help = ['bank']
handler.tags = ['rpg']
handler.command = /^(bank)$/i
handler.group = true

export default handler