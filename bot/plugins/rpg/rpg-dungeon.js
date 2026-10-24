let handler = async (m, { conn }) => {

let user = global.db.data.users[m.sender]
let e = global.rpg.emoticon

if (user.health < 80)
return conn.reply(m.chat,'Health minimal 80 untuk masuk dungeon\nGunakan *.heal*',global.fstatus)

let boss = pickRandom([
'Dark Oni',
'Shadow Dragon',
'Blood Demon',
'Ancient Golem',
'Night Reaper'
])

let damage = Math.floor(Math.random()*40)+20
let exp = Math.floor(Math.random()*5000)+2000
let money = Math.floor(Math.random()*80000)+20000
let diamond = Math.floor(Math.random()*3)
let mythic = Math.floor(Math.random()*2)
let legendary = Math.floor(Math.random()*1)

user.health -= damage
user.exp += exp
user.money += money
user.diamond += diamond
user.mythic += mythic
user.legendary += legendary
let text = `
🌸 *ALZRISS RPG DUNGEON* ❀

👹 Boss : *${boss}*

Kamu berhasil mengalahkan boss!

❤️ Health -${damage}

🎁 Reward

${e('exp')} Exp : +${exp}
${e('money')} Money : +${money}
${diamond ? `${e('diamond')} Diamond : +${diamond}` : ''}
${mythic ? `🎁 Mythic : +${mythic}` : ''}
${legendary ? `🗃️ Legendary : +${legendary}` : ''}

Hati-hati dungeon berikutnya lebih kuat...
`.trim()

conn.sendMessage(m.chat,{
text
},{quoted: global.fstatus})

}

handler.help = ['dungeon']
handler.tags = ['rpg']
handler.command = /^(dungeon)$/i
handler.group = true

export default handler

function pickRandom(list){
return list[Math.floor(Math.random()*list.length)]
}