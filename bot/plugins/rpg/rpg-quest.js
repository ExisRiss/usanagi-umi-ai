let handler = async (m, { conn }) => {

let user = global.db.data.users[m.sender]
let e = global.rpg.emoticon
if (!user.lastquest) user.lastquest = 0

let cooldown = 86400000
let now = Date.now()

if (now - user.lastquest < cooldown) {

let sisa = cooldown - (now - user.lastquest)
let h = Math.floor(sisa / 3600000)
let mnt = Math.floor(sisa % 3600000 / 60000)

return conn.reply(m.chat,`Quest sudah diambil\nCoba lagi ${h} jam ${mnt} menit`,global.fstatus)
}

let exp = Math.floor(Math.random()*5000)+2000
let money = Math.floor(Math.random()*80000)+20000
let diamond = Math.floor(Math.random()*2)

user.exp += exp
user.money += money
user.diamond += diamond

user.lastquest = now

let text = `
🌸 *ALZRISS RPG QUEST* ❀

🎯 Quest berhasil diselesaikan

🎁 Reward

${e('exp')} Exp : +${exp}
${e('money')} Money : +${money}
${diamond ? `${e('diamond')} Diamond : +${diamond}` : ''}

Quest berikutnya tersedia besok
`.trim()

conn.sendMessage(m.chat,{
text
},{quoted: global.fstatus})

}

handler.help = ['quest']
handler.tags = ['rpg']
handler.command = /^(quest)$/i
handler.group = true

export default handler