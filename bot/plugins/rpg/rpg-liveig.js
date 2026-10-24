let handler = async (m, { conn, args, usedPrefix }) => {

let user = global.db.data.users[m.sender]

if (!args[0]) {
return conn.reply(m.chat, `🌸 ALZRISS INSTAGRAM RPG ❀

Gunakan perintah berikut

${usedPrefix}liveig buat <username>
Membuat akun Instagram

${usedPrefix}liveig cek
Melihat akun Instagram kamu

${usedPrefix}liveig post
Upload postingan

${usedPrefix}liveig delete
Menghapus akun`, global.fstatus)
}

let type = args[0].toLowerCase()

if (type == 'buat') {

if (user.instagram) return conn.reply(m.chat, `Kamu sudah memiliki akun Instagram.`, global.fstatus)

if (!args[1]) return conn.reply(m.chat, `Contoh penggunaan

${usedPrefix}liveig buat usanagi_chan`, global.fstatus)

let username = args[1]

user.instagram = {
username: username,
followers: 0,
like: 0,
post: 0,
verified: false,
lastpost: 0
}

return conn.reply(m.chat, `❀ AKUN INSTAGRAM BERHASIL DIBUAT ❀

📷 Username : ${username}
👥 Followers : 0
❤️ Like : 0
📸 Post : 0

Sekarang kamu bisa upload postingan`, global.fstatus)
}

if (type == 'cek') {

if (!user.instagram) return conn.reply(m.chat, `Kamu belum memiliki akun Instagram

Gunakan
${usedPrefix}liveig buat <username>`, global.fstatus)

let ig = user.instagram

let teks = `❀ INSTAGRAM ACCOUNT ❀

📷 Username : ${ig.username}
👥 Followers : ${ig.followers}
❤️ Like : ${ig.like}
📸 Post : ${ig.post}
${ig.verified ? '✔️ Verified' : '❌ Not Verified'}
`

return conn.reply(m.chat, teks, global.fstatus)
}

if (type == 'delete') {

if (!user.instagram) return conn.reply(m.chat, `Kamu belum memiliki akun Instagram`, global.fstatus)

let username = user.instagram.username

delete user.instagram

return conn.reply(m.chat, `❀ AKUN INSTAGRAM DIHAPUS ❀

Akun @${username} telah dihapus dari sistem.`, global.fstatus)
}

if (type == 'post') {

if (!user.instagram) return conn.reply(m.chat, `Kamu belum memiliki akun Instagram

Gunakan
${usedPrefix}liveig buat <username>`, global.fstatus)

let ig = user.instagram

let __timers = (new Date - ig.lastpost)
let _timers = (1800000 - __timers)
let timers = clockString(_timers)

if (new Date - ig.lastpost < 1800000) {
return conn.reply(m.chat, `❀ INSTAGRAM POST ❀

Kamu sudah posting sebelumnya

Coba lagi dalam
${timers}`, global.fstatus)
}

let like = Math.floor(Math.random() * 2000) + 100
let followers = Math.floor(Math.random() * 300) + 20
let money = Math.floor(Math.random() * 200000) + 50000
let exp = Math.floor(Math.random() * 200) + 50

ig.like += like
ig.followers += followers
ig.post += 1
ig.lastpost = new Date * 1

user.money += money
user.exp += exp

let hasil = `❀ INSTAGRAM POSTING ❀

📷 @${ig.username} mengupload postingan baru

❤️ Like : +${like}
👥 Followers : +${followers}

📸 Total Post : ${ig.post}

💰 Money : +${money}
✨ Exp : +${exp}
`

conn.reply(m.chat, hasil, global.fstatus)
}

}

handler.help = ['liveig']
handler.tags = ['rpg']
handler.command = /^(liveig)$/i
handler.limit = true

export default handler

function clockString(ms) {
let h = Math.floor(ms / 3600000)
let m = Math.floor(ms / 60000) % 60
let s = Math.floor(ms / 1000) % 60
return [h,m,s].map(v => v.toString().padStart(2,0)).join(':')
}