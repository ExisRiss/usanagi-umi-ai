import { scheduleRpgReward } from '../../lib/rpg/unified-runtime.js'
const games = [
{ name:'Game Snake', cost:1000, time:3*60*1000 },
{ name:'Game Tetris', cost:2000, time:4*60*1000 },
{ name:'Game Puzzle', cost:3000, time:5*60*1000 },
{ name:'Game Kartu', cost:4000, time:6*60*1000 },
{ name:'Game Balon Pop', cost:5000, time:6*60*1000 },

{ name:'Game Petualangan', cost:10000, time:10*60*1000 },
{ name:'Game Balap Mobil', cost:15000, time:12*60*1000 },
{ name:'Game Zombie', cost:20000, time:15*60*1000 },
{ name:'Game Horor', cost:25000, time:15*60*1000 },
{ name:'Game RPG Fantasi', cost:30000, time:20*60*1000 },
{ name:'Game Battle Royale', cost:35000, time:18*60*1000 },
{ name:'Game Simulator Kota', cost:40000, time:20*60*1000 },

{ name:'Game MMORPG', cost:60000, time:25*60*1000 },
{ name:'Game Esport Arena', cost:80000, time:25*60*1000 },
{ name:'Game Open World', cost:100000, time:30*60*1000 },
{ name:'Game Survival Hardcore', cost:120000, time:30*60*1000 },
{ name:'Game Space Adventure', cost:150000, time:35*60*1000 },

{ name:'Game Metaverse', cost:300000, time:40*60*1000 },
{ name:'Game VR World', cost:400000, time:45*60*1000 },
{ name:'Game Galaxy RPG', cost:500000, time:50*60*1000 }
]

function formatNumber(num){
if(num >= 1000000) return (num/1000000).toFixed(1)+'M'
if(num >= 1000) return (num/1000).toFixed(1)+'k'
return num.toString()
}

let handler = async (m,{conn,args,usedPrefix}) => {

let user = global.db.data.users[m.sender]

if(!args[0]){

let txt = `
🌸 *ALZRISS WARNET* ❀

Daftar game yang bisa dimainkan:

Contoh bermain:
${usedPrefix}warnet game horor
${usedPrefix}warnet game snake
`.trim()

games.forEach((g,i)=>{
txt += `

${i+1}. ${g.name}
💹 Biaya : ${formatNumber(g.cost)}
⏱ Waktu : ${g.time/60000} menit`
})

return conn.reply(m.chat,txt,m)
}

let gameName = args.join(' ').toLowerCase()
let game = games.find(v=>v.name.toLowerCase()==gameName)

if(!game) return m.reply(`Game tidak ditemukan.\nCek daftar dengan *${usedPrefix}warnet*`)

if(user.money < game.cost)
return m.reply(`Uang kamu tidak cukup.\nButuh ${formatNumber(game.cost-user.money)} lagi`)

let now = Date.now()

if(user.lastwarnet && now-user.lastwarnet < game.time){

let sisa = game.time-(now-user.lastwarnet)
let menit = Math.floor(sisa/60000)
let detik = Math.floor(sisa/1000)%60

return m.reply(`Kamu masih bermain.\nTunggu ${menit} menit ${detik} detik lagi`)
}

user.money -= game.cost
user.lastwarnet = now

let exp = Math.floor(Math.random()*200)+50
let uang = Math.floor(game.cost*0.7)

let teks = `
🎮 Kamu bermain *${game.name}*

⏱ Waktu bermain : ${game.time/60000} menit
💸 Biaya : ${formatNumber(game.cost)}

Sedang bermain...
`.trim()

if (scheduleRpgReward(m, 'warnet', game.time, [{jid:m.sender,koin:uang,exp}], conn, `Hadiah warnet ${game.name} sudah masuk: +${uang} koin, +${exp} EXP.`)) return conn.reply(m.chat,teks,m)

await conn.reply(m.chat,teks,m)

setTimeout(()=>{

user.money += uang
user.exp += exp

conn.reply(m.chat,`
🎉 Permainan selesai!

Game : ${game.name}

💹 Uang didapat : ${formatNumber(uang)}
✨ Exp didapat : ${exp}

💰 Money sekarang : ${formatNumber(user.money)}
`.trim(),m)

},game.time)

}

handler.help = ['warnet']
handler.tags = ['rpg']
handler.command = /^(warnet)$/i
handler.group = true

export default handler