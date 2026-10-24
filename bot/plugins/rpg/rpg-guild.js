let handler = async (m,{conn})=>{

let user = global.db.data.users[m.sender]

if(user.guild)
return conn.reply(m.chat,'Kamu sudah menjadi Adventurer Guild',m)

user.guild = true
user.rank = 'F'

conn.reply(m.chat,`
🌸 *ALZRISS ADVENTURER GUILD* ❀

Selamat datang Adventurer!

Rank kamu sekarang : *F*

Gunakan:
.hunt → berburu monster
.rank → cek rank
`,m)

}

handler.help = ['guild']
handler.tags = ['rpg']
handler.command = /^guild$/i
handler.group = true

export default handler