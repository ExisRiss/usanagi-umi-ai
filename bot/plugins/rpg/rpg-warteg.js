const foods = [
{ name:'Nasi Telur', price:2000, health:10, exp:5 },
{ name:'Nasi Tempe', price:3000, health:12, exp:6 },
{ name:'Nasi Tahu', price:3000, health:12, exp:6 },
{ name:'Nasi Sayur', price:3500, health:14, exp:7 },
{ name:'Nasi Ayam', price:5000, health:18, exp:10 },
{ name:'Nasi Ikan', price:6000, health:20, exp:12 },
{ name:'Nasi Lele', price:6500, health:22, exp:13 },
{ name:'Nasi Udang', price:8000, health:28, exp:15 },
{ name:'Nasi Rendang', price:9000, health:30, exp:18 },
{ name:'Nasi Ayam Bakar', price:10000, health:35, exp:20 },
{ name:'Paket Kenyang', price:15000, health:50, exp:25 },
{ name:'Paket Sultan', price:25000, health:80, exp:40 }
]

function formatNumber(num){
if(num>=1000000)return(num/1000000).toFixed(1)+'M'
if(num>=1000)return(num/1000).toFixed(1)+'k'
return num.toString()
}

let handler = async (m,{conn,args})=>{

let user = global.db.data.users[m.sender]

if(!args[0]){

let text=`
🌸 *ALZRISS WARTEG* ❀

Selamat datang di warteg 🍽️

Contoh:
.warteg nasi telur
.warteg paket kenyang

Daftar menu:
`.trim()

foods.forEach((f,i)=>{
text+=`

${i+1}. ${f.name}
💹 Harga : ${formatNumber(f.price)}
❤️ Heal : +${f.health}
✨ Exp : +${f.exp}`
})

return conn.reply(m.chat,text,global.fstatus)
}

let pilih = args.join(' ').toLowerCase()
let food = foods.find(v=>v.name.toLowerCase()==pilih)

if(!food) return conn.reply(m.chat,'Menu tidak ditemukan.\nCek daftar dengan *.warteg*',global.fstatus)

if(user.money < food.price)
return conn.reply(m.chat,`Money tidak cukup.\nButuh ${formatNumber(food.price-user.money)} lagi`,global.fstatus)

user.money -= food.price

let keracunan = Math.random() < 0.15

if(keracunan){

user.health -= 10

return conn.reply(m.chat,`
🤢 Kamu makan *${food.name}*

Tapi makanannya basi...

❤️ Health -10
💸 Money -${formatNumber(food.price)}

❤️ Health sekarang : ${user.health}
`.trim(),global.fstatus)

}

user.health += food.health
user.exp += food.exp

if(user.health > user.maxhealth) user.health = user.maxhealth

conn.reply(m.chat,`
🍽️ Kamu makan *${food.name}*

❤️ Health +${food.health}
✨ Exp +${food.exp}
💸 Money -${formatNumber(food.price)}

❤️ Health : ${user.health}
💰 Money : ${formatNumber(user.money)}
`.trim(),global.fstatus)

}

handler.help = ['warteg']
handler.tags = ['rpg']
handler.command = /^(warteg)$/i
handler.group = true

export default handler