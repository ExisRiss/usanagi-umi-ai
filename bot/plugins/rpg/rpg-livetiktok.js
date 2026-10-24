let handler = async (m, { conn, args, usedPrefix }) => {

let user = global.db.data.users[m.sender]

if (!args[0]) {
return conn.reply(m.chat, `🌸 ALZRISS TIKTOK RPG ❀

Gunakan perintah berikut

${usedPrefix}livetiktok buat <username>
Membuat akun TikTok

${usedPrefix}livetiktok cek
Melihat akun TikTok kamu

${usedPrefix}livetiktok live
Memulai live TikTok

${usedPrefix}livetiktok delete
Menghapus akun TikTok`, global.fstatus)
}

let type = args[0].toLowerCase()

if (type == 'buat') {

if (user.tiktok) return conn.reply(m.chat, `Kamu sudah memiliki akun TikTok.`, global.fstatus)

if (!args[1]) return conn.reply(m.chat, `Contoh penggunaan

${usedPrefix}livetiktok buat usanagi_chan`, global.fstatus)

let username = args[1]

user.tiktok = {
username: username,
followers: 0,
like: 0,
verified: false,
lastlive: 0
}

return conn.reply(m.chat, `❀ AKUN TIKTOK BERHASIL DIBUAT ❀

👤 Username : ${username}
👥 Followers : 0
❤️ Like : 0

Sekarang kamu bisa live TikTok`, global.fstatus)
}

if (type == 'cek') {

if (!user.tiktok) return conn.reply(m.chat, `Kamu belum memiliki akun TikTok

Gunakan
${usedPrefix}livetiktok buat <username>`, global.fstatus)

let acc = user.tiktok

let teks = `❀ TIKTOK ACCOUNT ❀

👤 Username : ${acc.username}
👥 Followers : ${acc.followers}
❤️ Like : ${acc.like}
${acc.verified ? '✔️ Verified' : '❌ Not Verified'}
`

return conn.reply(m.chat, teks, global.fstatus)
}

if (type == 'delete') {

if (!user.tiktok) return conn.reply(m.chat, `Kamu belum memiliki akun TikTok`, global.fstatus)

let username = user.tiktok.username

delete user.tiktok

return conn.reply(m.chat, `❀ AKUN TIKTOK DIHAPUS ❀

Akun @${username} telah dihapus dari sistem.`, global.fstatus)
}

if (type == 'live') {

if (!user.tiktok) return conn.reply(m.chat, `Kamu belum memiliki akun TikTok

Gunakan
${usedPrefix}livetiktok buat <username>`, global.fstatus)

let acc = user.tiktok

let __timers = (new Date - acc.lastlive)
let _timers = (1800000 - __timers)
let timers = clockString(_timers)

if (new Date - acc.lastlive < 1800000) {
return conn.reply(m.chat, `🌸 ALZRISS TIKTOK LIVE ❀

Kamu sudah live sebelumnya

Coba lagi dalam
${timers}`, global.fstatus)
}

let viewers = Math.floor(Math.random() * 1000) + 50
let followers = Math.floor(Math.random() * 200) + 10
let like = Math.floor(Math.random() * 500) + 50
let gift = Math.floor(Math.random() * 300000) + 50000
let exp = Math.floor(Math.random() * 200) + 50

acc.followers += followers
acc.like += like
acc.lastlive = new Date * 1

user.money += gift
user.exp += exp

let hasil = `🌸 ALZRISS TIKTOK LIVE ❀

📱 @${acc.username} sedang live

👥 Penonton : ${viewers}
➕ Followers : +${followers}
❤️ Like : +${like}

🎁 Gift : ${gift} Money
✨ Exp : +${exp}
`

conn.reply(m.chat, hasil, global.fstatus)
}

}

handler.help = ['livetiktok']
handler.tags = ['rpg']
handler.command = /^(livetiktok)$/i
handler.limit = true

export default handler

function clockString(ms) {
let h = Math.floor(ms / 3600000)
let m = Math.floor(ms / 60000) % 60
let s = Math.floor(ms / 1000) % 60
return [h,m,s].map(v => v.toString().padStart(2,0)).join(':')
}