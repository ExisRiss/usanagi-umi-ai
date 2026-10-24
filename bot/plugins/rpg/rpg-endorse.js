let handler = async (m, { conn, command }) => {

let user = global.db.data.users[m.sender]

if (command == 'endorse') {

let income = Math.floor(Math.random() * 500000) + 100000
let exp = Math.floor(Math.random() * 300) + 50

let brand = [
'Nike',
'Adidas',
'Samsung',
'Xiaomi',
'Tokopedia',
'Shopee',
'Gojek',
'Grab',
'Indomie',
'Teh Botol'
]

let chosen = brand[Math.floor(Math.random() * brand.length)]

user.money += income
user.exp += exp

conn.reply(m.chat, `❀ ENDORSEMENT DEAL ❀

📢 Kamu mendapat sponsor dari ${chosen}

💰 Bayaran : +${income}
✨ Exp : +${exp}

Brand sangat puas dengan promosi kamu!`, global.fstatus)
}

if (command == 'fyp') {

let followers = Math.floor(Math.random() * 2000) + 500
let money = Math.floor(Math.random() * 300000) + 100000
let exp = Math.floor(Math.random() * 200) + 50

user.money += money
user.exp += exp

conn.reply(m.chat, `❀ KONTEN MASUK FYP ❀

🔥 Konten kamu viral!

👥 Followers baru : +${followers}

💰 Money : +${money}
✨ Exp : +${exp}`, global.fstatus)
}

if (command == 'verified') {

if (user.money < 500000) {
return conn.reply(m.chat, `Untuk membeli centang biru kamu butuh 500000 money`, global.fstatus)
}

user.money -= 500000
user.verified = true

conn.reply(m.chat, `❀ VERIFIED ACCOUNT ❀

Akun kamu sekarang memiliki centang biru ✔️

Sekarang kamu terlihat lebih profesional!`, global.fstatus)
}

}

handler.help = ['endorse','fyp','verified']
handler.tags = ['rpg']
handler.command = /^(endorse|fyp|verified)$/i
handler.limit = true

export default handler