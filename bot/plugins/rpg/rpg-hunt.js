let handler = async (m,{conn})=>{

let user = global.db.data.users[m.sender]

if(!user.guild)
return conn.reply(m.chat,'Kamu belum join guild\nGunakan *.guild*',m)

let monsters = [
{ name:'Goblin', rank:'F', exp:200, money:1000 },
{ name:'Orc', rank:'E', exp:400, money:2000 },
{ name:'Skeleton Knight', rank:'D', exp:800, money:4000 },
{ name:'Dark Mage', rank:'C', exp:1200, money:6000 },
{ name:'Wyvern', rank:'B', exp:2500, money:12000 },
{ name:'Ancient Dragon', rank:'S', exp:8000, money:40000 }
]

let cooldown = 300000
let now = Date.now()

if(now-user.lasthunt < cooldown){
let sisa = cooldown-(now-user.lasthunt)
return conn.reply(m.chat,`Tunggu ${clockString(sisa)} untuk berburu lagi`,m)
}

let monster = monsters[Math.floor(Math.random()*monsters.length)]

let damage = Math.floor(Math.random()*30)+10

user.health -= damage

if(user.health <= 0){

user.health = 100

return conn.reply(m.chat,`
🌸 *ALZRISS RPG* ❀

Kamu bertemu *${monster.name}* 🐉

Namun kamu kalah...

❤️ Health kembali 100
`,m)

}

user.exp += monster.exp
user.money += monster.money

user.lasthunt = now

conn.reply(m.chat,`
⚔️ *BATTLE RESULT*

Monster : ${monster.name}
Rank : ${monster.rank}

💰 Money +${monster.money}
✨ Exp +${monster.exp}

❤️ Health tersisa ${user.health}
`,m)

}

handler.help = ['hunt']
handler.tags = ['rpg']
handler.command = /^hunt$/i
handler.group = true

export default handler

function clockString(ms){
let h=Math.floor(ms/3600000)
let m=Math.floor(ms/60000)%60
let s=Math.floor(ms/1000)%60
return[h,m,s].map(v=>v.toString().padStart(2,0)).join(':')
}