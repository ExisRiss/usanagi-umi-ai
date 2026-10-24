let handler = async (m,{conn})=>{

let user = global.db.data.users[m.sender]
let e = global.rpg.emoticon

let text = `
🌸 *ALZRISS RPG PROFILE* ❀

👤 User : @${m.sender.split('@')[0]}

${e('level')} Level : ${user.level}
${e('exp')} Exp : ${user.exp}

${e('health')} Health : ${user.health}
${e('stamina')} Stamina : ${user.stamina}

${e('money')} Money : ${user.money}
${e('bank')} Bank : ${user.bank}

${e('diamond')} Diamond : ${user.diamond}
${e('emerald')} Emerald : ${user.emerald}

${e('limit')} Limit : ${user.limit}
`.trim()

conn.sendMessage(m.chat,{
text,
mentions:[m.sender]
},{quoted:global.fstatus})

}

handler.help = ['merpg']
handler.tags = ['rpg']
handler.command = /^(merpg)$/i
handler.group = true

export default handler