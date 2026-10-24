let handler = async (m,{conn,args})=>{

let user = global.db.data.users[m.sender]

let type = (args[0]||'').toLowerCase()

if(type !== 'usanagi')
return conn.reply(m.chat,'Gunakan:\n.setrpg usanagi',m)

if(user.usanagi)
return conn.reply(m.chat,'Kamu sudah menjadi Adventurer AlzRiss',m)

user.usanagi = true

conn.reply(m.chat,`
🌸 *ALZRISS RPG* ❀

Selamat datang Adventurer!

Sekarang kamu bisa berburu monster dengan:
.huntanya
`,m)

}

handler.help = ['setrpg']
handler.tags = ['rpg']
handler.command = /^(setrpg)$/i
handler.group = true

export default handler