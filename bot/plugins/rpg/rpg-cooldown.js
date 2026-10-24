let handler = async (m, { conn }) => {

let user = global.db.data.users[m.sender]
let e = global.rpg.emoticon
const cooldown = {
adventure: 3600000,
berburu: 300000,
dagang: 300000,
mining: 300000,
nebang: 300000,
nguli: 300000,
claim: 86400000,
weekly: 604800000,
monthly: 2592000000
}

function cek(last, cd){
let sisa = cd - (Date.now() - last)
if (sisa <= 0) return 'Ready'
let m = Math.floor(sisa / 60000)
let s = Math.floor(sisa % 60000 / 1000)
return `${m}m ${s}s`
}

let text = `
🌸 *ALZRISS RPG COOLDOWN* ❀

🧭 Adventure : ${cek(user.lastadventure, cooldown.adventure)}
🏹 Berburu   : ${cek(user.lastberburu, cooldown.berburu)}
💰 Dagang    : ${cek(user.lastdagang, cooldown.dagang)}
⛏️ Mining    : ${cek(user.lastmining, cooldown.mining)}
🌲 Nebang    : ${cek(user.lastnebang, cooldown.nebang)}
🪨 Nguli     : ${cek(user.lastnguli, cooldown.nguli)}

🎁 Daily     : ${cek(user.lastclaim, cooldown.claim)}
📦 Weekly    : ${cek(user.lastweekly, cooldown.weekly)}
🎉 Monthly   : ${cek(user.lastmonthly, cooldown.monthly)}
`.trim()

conn.sendMessage(m.chat,{
text
},{quoted: global.fstatus})

}

handler.help = ['cooldown']
handler.tags = ['rpg']
handler.command = /^(cooldown)$/i
handler.group = true

export default handler