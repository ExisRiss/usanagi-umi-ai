let handler = async (m, { conn, args }) => {

let user = global.db.data.users[m.sender]
let target = m.mentionedJid[0]

if (!target) return conn.reply(m.chat, `Tag target yang ingin dirampok

Contoh:
.merampok @user`, global.fstatus)

if (target == m.sender) return conn.reply(m.chat, `Tidak bisa merampok diri sendiri`, global.fstatus)

let targetUser = global.db.data.users[target]

let __timers = (new Date - user.lastrampok)
let _timers = (3600000 - __timers)
let timers = clockString(_timers)

if (new Date - user.lastrampok < 3600000) {
return conn.reply(m.chat, `🌸 ALZRISS RAMPOK ❀

Kamu sudah merampok sebelumnya

Coba lagi dalam
${timers}`, global.fstatus)
}

if (targetUser.money < 1000) {
return conn.reply(m.chat, `Target terlalu miskin untuk dirampok`, global.fstatus)
}

let berhasil = Math.random() > 0.4

if (!berhasil) {

let denda = Math.floor(Math.random() * 5000) + 1000

user.money -= denda
user.lastrampok = new Date * 1

return conn.reply(m.chat, `❀ RAMPOK GAGAL ❀

🚓 Kamu tertangkap polisi!

💸 Denda : ${denda} Money`, global.fstatus)
}

let hasil = Math.floor(Math.random() * targetUser.money / 2) + 1000

user.money += hasil
targetUser.money -= hasil
user.lastrampok = new Date * 1

let teks = `❀ RAMPOK BERHASIL ❀

🕵️ @${m.sender.split('@')[0]} berhasil merampok

💰 @${target.split('@')[0]}

🎁 Hasil Rampok : ${hasil} Money
`

conn.reply(m.chat, teks, global.fstatus, {
mentions: [m.sender, target]
})

}

handler.help = ['merampok @user']
handler.tags = ['rpg']
handler.command = /^(merampok)$/i
handler.group = true
handler.limit = true

export default handler

function clockString(ms) {
let h = Math.floor(ms / 3600000)
let m = Math.floor(ms / 60000) % 60
let s = Math.floor(ms / 1000) % 60
return [h,m,s].map(v => v.toString().padStart(2,0)).join(':')
}