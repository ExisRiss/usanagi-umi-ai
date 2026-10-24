let handler = async (m, { conn }) => {

let user = global.db.data.users[m.sender]

let cooldown = 86400000
let now = new Date * 1

if (user.lastclaim && now - user.lastclaim < cooldown) {

let sisa = cooldown - (now - user.lastclaim)
let h = Math.floor(sisa / 3600000)
let mnt = Math.floor(sisa / 60000) % 60
let d = Math.floor(sisa / 1000) % 60

return conn.reply(m.chat,`
🌸 ALZRISS CLAIM ❀

Hadiah harian sudah diambil.

Cooldown:
${h}j ${mnt}m ${d}s
`.trim(), m)

}

let money = Math.floor(Math.random()*50000)+20000
let exp = Math.floor(Math.random()*5000)+1000
let limit = Math.floor(Math.random()*5)+1

user.money += money
user.exp += exp
user.limit += limit
user.lastclaim = now

let text = `
🌸 ALZRISS DAILY CLAIM ❀

Hadiah Harian:

💹 Money : +${money}
✨ Exp : +${exp}
🎫 Limit : +${limit}

Datang lagi besok untuk hadiah berikutnya.
`.trim()

conn.sendMessage(m.chat,{
text
},{quoted:m})

}

handler.help = ['claim']
handler.tags = ['rpg']
handler.command = /^claim$/i
handler.group = true

export default handler