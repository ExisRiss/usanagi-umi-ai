let handler = async (m, { conn, args }) => {

let user = global.db.data.users[m.sender]

/* ================= COOLDOWN ================= */

let cooldown = 1800000 // 30 menit
let last = user.lastnguli || 0

if (new Date - last < cooldown) {
let sisa = cooldown - (new Date - last)
let menit = Math.floor(sisa / 60000)
let detik = Math.floor((sisa % 60000) / 1000)

return m.reply("⏳ Kamu sudah bekerja\nTunggu ${menit}m ${detik}s lagi")
}

/* ================= JOB LIST ================= */

const jobs = {

ojek:{
name:'Ojek',
tasks:[
'🛵 Mengantarkan nenek-nenek ke pasar',
'🛵 Mengantarkan bocil pulang sekolah',
'🛵 Mengantarkan cewek pulang kerja',
'🛵 Mengantarkan gamer FF ke warnet',
'🛵 Mengantarkan bapak-bapak yang nyasar'
],
events:[
'⭐ Penumpang memberi tip',
'😂 Penumpang lupa bayar',
'😹 Penumpang ngajak selfie',
'💀 Penumpang kentut di motor',
'🚨 Kena macet parah'
],
exp:15
},

pedagang:{
name:'Pedagang',
tasks:[
'🛒 Menjual gorengan',
'🛒 Menjual minuman dingin',
'🛒 Melayani pelanggan',
'🛒 Membuka diskon besar'
],
events:[
'💰 Dagangan laris',
'😂 Pembeli nawar keterlaluan',
'😹 Bocil kabur belum bayar',
'⭐ Dapat pelanggan setia'
],
exp:25
},

dokter:{
name:'Dokter',
tasks:[
'💉 Menyembuhkan pasien',
'💉 Memberi resep obat',
'💉 Menolong pasien darurat'
],
events:[
'⭐ Pasien berterima kasih',
'😂 Pasien takut suntik',
'💀 Pasien pingsan duluan'
],
exp:40
},

petani:{
name:'Petani',
tasks:[
'🌾 Menanam padi',
'🌾 Memanen jagung',
'🌾 Menyiram tanaman'
],
events:[
'🌧️ Hujan deras',
'⭐ Panen melimpah',
'😂 Dikejar ayam'
],
exp:30
},

montir:{
name:'Montir',
tasks:[
'🔧 Memperbaiki motor',
'🔧 Mengganti oli',
'🔧 Mengganti ban'
],
events:[
'⭐ Pelanggan puas',
'😂 Baut jatuh entah kemana',
'💀 Tangan kena oli'
],
exp:20
},

kuli:{
name:'Kuli',
tasks:[
'🏋️ Mengangkat semen',
'🏋️ Mengangkat batu bata',
'🏋️ Membantu proyek'
],
events:[
'⭐ Mandor memberi bonus',
'😂 Hampir ketimpa semen',
'💀 Capek banget'
],
exp:50
}

}

/* ================= PILIH JOB ================= */

let type = (args[0] || '').toLowerCase()

if (!type) {

let list = Object.keys(jobs).map(v=>'⌬ .kerja '+v).join('\n')

return conn.reply(m.chat,`
🌸 ALZRISS WORK ❀

Pilih pekerjaan:

${list}

Contoh:
.kerja ojek
`,m)

}

let job = jobs[type]

if (!job) return m.reply('Pekerjaan tidak ditemukan')

/* ================= RANDOM ================= */

let task = pickRandom(job.tasks)
let event = pickRandom(job.events)

let money = Math.floor(Math.random()*30000)+10000
let exp = job.exp

/* ================= UPDATE DB ================= */

user.money += money
user.exp += exp
user.lastnguli = new Date * 1

/* ================= RESULT ================= */

let text = `
🌸 ALZRISS WORK ❀

👷 Pekerjaan : ${job.name}

📋 Tugas :
${task}

🎲 Kejadian :
${event}

💹 Money : +${money}
✨ Exp : +${exp}
`.trim()

conn.sendMessage(m.chat,{
text
},{quoted:m})

}

handler.help = ['kerja']
handler.tags = ['rpg']
handler.command = /^kerja$/i
handler.group = true

export default handler

function pickRandom(list){
return list[Math.floor(Math.random()*list.length)]
}