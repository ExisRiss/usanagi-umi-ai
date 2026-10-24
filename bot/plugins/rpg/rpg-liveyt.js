let handler = async (m, { conn, args, usedPrefix }) => {

let user = global.db.data.users[m.sender]

if (!args[0]) {
return conn.reply(m.chat, `🌸 ALZRISS YOUTUBE RPG ❀

Gunakan perintah berikut

${usedPrefix}liveyt buat <channel>
Membuat channel YouTube

${usedPrefix}liveyt cek
Melihat channel YouTube kamu

${usedPrefix}liveyt upload
Upload video YouTube

${usedPrefix}liveyt delete
Menghapus channel`, global.fstatus)
}

let type = args[0].toLowerCase()

if (type == 'buat') {

if (user.youtube) return conn.reply(m.chat, `Kamu sudah memiliki channel YouTube.`, global.fstatus)

if (!args[1]) return conn.reply(m.chat, `Contoh penggunaan

${usedPrefix}liveyt buat usanagi_channel`, global.fstatus)

let name = args.slice(1).join(" ")

user.youtube = {
channel: name,
subscriber: 0,
like: 0,
video: 0,
verified: false,
lastupload: 0
}

return conn.reply(m.chat, `❀ CHANNEL YOUTUBE BERHASIL DIBUAT ❀

📺 Channel : ${name}
👥 Subscriber : 0
👍 Like : 0
🎬 Video : 0

Sekarang kamu bisa upload video`, global.fstatus)
}

if (type == 'cek') {

if (!user.youtube) return conn.reply(m.chat, `Kamu belum memiliki channel YouTube

Gunakan
${usedPrefix}liveyt buat <channel>`, global.fstatus)

let yt = user.youtube

let teks = `❀ YOUTUBE CHANNEL ❀

📺 Channel : ${yt.channel}
👥 Subscriber : ${yt.subscriber}
👍 Like : ${yt.like}
🎬 Video : ${yt.video}
${yt.verified ? '✔️ Verified Channel' : '❌ Not Verified'}
`

return conn.reply(m.chat, teks, global.fstatus)
}

if (type == 'delete') {

if (!user.youtube) return conn.reply(m.chat, `Kamu belum memiliki channel YouTube`, global.fstatus)

let name = user.youtube.channel

delete user.youtube

return conn.reply(m.chat, `❀ CHANNEL YOUTUBE DIHAPUS ❀

Channel ${name} telah dihapus dari sistem.`, global.fstatus)
}

if (type == 'upload') {

if (!user.youtube) return conn.reply(m.chat, `Kamu belum memiliki channel YouTube

Gunakan
${usedPrefix}liveyt buat <channel>`, global.fstatus)

let yt = user.youtube

let __timers = (new Date - yt.lastupload)
let _timers = (3600000 - __timers)
let timers = clockString(_timers)

if (new Date - yt.lastupload < 3600000) {
return conn.reply(m.chat, `❀ YOUTUBE UPLOAD ❀

Kamu sudah upload video sebelumnya

Coba lagi dalam
${timers}`, global.fstatus)
}

let views = Math.floor(Math.random() * 50000) + 1000
let subs = Math.floor(Math.random() * 500) + 50
let like = Math.floor(Math.random() * 1000) + 100
let money = Math.floor(Math.random() * 400000) + 100000
let exp = Math.floor(Math.random() * 300) + 50

yt.subscriber += subs
yt.like += like
yt.video += 1
yt.lastupload = new Date * 1

user.money += money
user.exp += exp

let hasil = `❀ YOUTUBE VIDEO UPLOADED ❀

📺 Channel : ${yt.channel}

👁️ Views : ${views}
➕ Subscriber : +${subs}
👍 Like : +${like}

🎬 Total Video : ${yt.video}

💰 Money : +${money}
✨ Exp : +${exp}
`

conn.reply(m.chat, hasil, global.fstatus)
}

}

handler.help = ['liveyt']
handler.tags = ['rpg']
handler.command = /^(liveyt)$/i
handler.limit = true

export default handler

function clockString(ms) {
let h = Math.floor(ms / 3600000)
let m = Math.floor(ms / 60000) % 60
let s = Math.floor(ms / 1000) % 60
return [h,m,s].map(v => v.toString().padStart(2,0)).join(':')
}