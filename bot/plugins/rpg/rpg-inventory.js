let handler = async (m, { conn }) => {

	let user = global.db.data.users[m.sender]
	let e = global.rpg.emoticon
	let totalitem =
	user.potion +
	user.diamond +
	user.emerald +
	user.trash +
	user.common +
	user.uncommon +
	user.mythic +
	user.legendary

	let text = `
🌸 *ALZRISS RPG INVENTORY* ❀

━━━━━━━━━━━━━━
${e('health')} *Health* : ${user.health}
${e('stamina')} *Stamina* : ${user.stamina}
${e('exp')} *Exp* : ${user.exp}

${e('money')} *Money* : ${user.money}
${e('bank')} *Bank* : ${user.bank}

━━━━━━━━━━━━━━
📦 *ITEM STORAGE*

${e('potion')} Potion : ${user.potion}
${e('diamond')} Diamond : ${user.diamond}
${e('emerald')} Emerald : ${user.emerald}
${e('trash')} Trash : ${user.trash}

${e('common')} Common Crate : ${user.common}
${e('uncommon')} Uncommon Crate : ${user.uncommon}
${e('mythic')} Mythic Crate : ${user.mythic}
${e('legendary')} Legendary Crate : ${user.legendary}

━━━━━━━━━━━━━━
⚒️ *TOOLS*

${e('sword')} Sword : ${user.sword}
${e('pickaxe')} Pickaxe : ${user.pickaxe}
${e('fishingrod')} Fishing Rod : ${user.fishingrod}
${e('armor')} Armor : ${user.armor}

━━━━━━━━━━━━━━
🐾 *KANDANG*

🐃 Banteng : ${user.banteng}
🐅 Harimau : ${user.harimau}
🐘 Gajah : ${user.gajah}
🐐 Kambing : ${user.kambing}
🐼 Panda : ${user.panda}
🐊 Buaya : ${user.buaya}
🐃 Kerbau : ${user.kerbau}
🐄 Sapi : ${user.sapi}
🐒 Monyet : ${user.monyet}
🐗 Babi Hutan : ${user.babihutan}
🐖 Babi : ${user.babi}
🐓 Ayam : ${user.ayam}

━━━━━━━━━━━━━━
🐟 *IKAN*

🐟 Ikan : ${user.ikan}
🐟 Lele : ${user.lele}
🐟 Nila : ${user.nila}
🐟 Bawal : ${user.bawal}
🦐 Udang : ${user.udang}
🐋 Paus : ${user.paus}
🦀 Kepiting : ${user.kepiting}

━━━━━━━━━━━━━━
🍖 *MAKANAN*

🍗 Ayam Bakar : ${user.ayambakar}
🍗 Ayam Goreng : ${user.ayamgoreng}
🍲 Opor Ayam : ${user.oporayam}
🍲 Gulai Ayam : ${user.gulaiayam}
🥩 Rendang : ${user.rendang}
🥩 Steak : ${user.steak}
🍖 Babi Panggang : ${user.babipanggang}

━━━━━━━━━━━━━━
📊 *Total Item* : ${totalitem}

✦ AlzRiss RPG System
`.trim()

	await conn.sendMessage(m.chat, {
		text: text
	}, { quoted: m })

}

handler.help = ['inventory','inv']
handler.tags = ['rpg']
handler.command = /^(inventory|inv)$/i
handler.group = true

export default handler