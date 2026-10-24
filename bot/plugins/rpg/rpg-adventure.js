let handler = async (m, { conn }) => {
	try {

		if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
		const user = global.db.data.users[m.sender]

		if (!user.health) user.health = 100
		if (!user.lastadventure) user.lastadventure = 0

		const cooldown = 3600000
		const now = Date.now()

		const diff = now - user.lastadventure
		const timers = clockString(cooldown - diff)

		if (user.health < 80)
			return m.reply(
				'Minimal 80 Health Untuk Bisa Berpetualang\nGunakan *.heal*\nAtau beli potion dengan *.buy potion jumlah*'
			)

		if (diff < cooldown)
			return m.reply(`Kamu Sudah Berpetualang, Istirahat Selama *${timers}*`)

		const health = Math.floor(Math.random() * 101)
		const exp = Math.floor(Math.random() * 10000)
		const uang = Math.floor(Math.random() * 100000)
		const trash = Math.floor(Math.random() * 10000)
		const emerald = Math.floor(Math.random() * 100)

		const _potion = makeInt('rand', 3)
		const _sampah = makeInt('anu', 50)
		const _diamond = makeInt('anu', 10)
		const _common = makeInt('anu', 3)
		const _uncommon = makeInt('rand', 4)
		const _mythic = makeInt('rand', 5, 3)
		const _legendary = makeInt('rand', 5, 3)

		const potion = pickRandom(_potion)
		const sampah = pickRandom(_sampah)
		const diamond = pickRandom(_diamond)
		const common = pickRandom(_common)
		const uncommon = pickRandom(_uncommon)
		const mythic = pickRandom(_mythic)
		const legendary = pickRandom(_legendary)

		const itemrand = pickRandom([
			`*${mythic} Peti Mythic*`,
			`*${legendary} Peti Legendary*`
		])

		const str = `
⚔️ *PETUALANGAN*

Kamu bertarung melawan ${pickRandom(['Raksasa','Beruang','Harimau','Macan','Iblis'])}

❤️ Health Berkurang: -${health}

🎁 Hadiah:

✨ Exp: ${exp}
💰 Uang: ${uang}
💎 Diamond: ${diamond}
🟢 Emerald: ${emerald}
🗑 Sampah: ${sampah}
${potion ? `🧪 Potion: ${potion}` : ''}
${common ? `📦 Common crate: ${common}` : ''}
${uncommon ? `📦 Uncommon crate: ${uncommon}` : ''}

Dan Mendapatkan ${itemrand}
`.trim()

		await conn.sendMessage(
			m.chat,
			{
				text: str
			},
			{ quoted: m }
		)

		user.health -= health
		if (user.health < 0) user.health = 0

		user.exp = (user.exp || 0) + exp
		user.money = (user.money || 0) + uang
		user.potion = (user.potion || 0) + potion
		user.diamond = (user.diamond || 0) + diamond
		user.emerald = (user.emerald || 0) + emerald
		user.trash = (user.trash || 0) + sampah
		user.common = (user.common || 0) + common
		user.uncommon = (user.uncommon || 0) + uncommon
		user.mythic = (user.mythic || 0) + mythic
		user.legendary = (user.legendary || 0) + legendary

		user.lastadventure = now

	} catch (e) {
		console.error(e)
		m.reply(String(e))
	}
}

handler.help = ['petualang']
handler.tags = ['rpg']
handler.command = /^(petualang|adventure)$/i
handler.group = true

export default handler


function makeInt(type, total, maxNumber = 3) {
	if (type === 'anu') {
		return Array.from({ length: total }, (_, i) => i + 1)
	}

	if (type === 'rand') {
		return Array.from({ length: total }, () => Math.floor(Math.random() * maxNumber) + 1)
	}
}

function pickRandom(list) {
	return list[Math.floor(Math.random() * list.length)]
}

function clockString(ms) {
	let d = isNaN(ms) ? '--' : Math.floor(ms / 86400000)
	let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000) % 24
	let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
	let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
	return [d + ' Hari ', h + ' Jam ', m + ' Menit ', s + ' Detik'].join('')
}