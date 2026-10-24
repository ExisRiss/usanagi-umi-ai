let handler = async (m, { conn, command, args }) => {
	let user = global.db.data.users[m.sender]

	let type = (args[0] || '').toLowerCase()

	let count = parseInt(args[1])
	if (isNaN(count)) count = 1
	if (count < 1) count = 1

	const list = `
🍖 *MENU MAKANAN*

Fungsi:
Makanan digunakan untuk menambah *Stamina*

📌 *Cara Menggunakan*
.makan <makanan>
.makan <makanan> <jumlah>

Contoh:
.makan ayamgoreng
.makan ayamgoreng 3

━━━━━━━━━━━━━━

📦 *Daftar Makanan*

• Ayambakar
• Ayamgoreng
• Rendang
• Steak
• Babipanggang
• Gulaiayam
• Oporayam
• Ikanbakar
• Lelebakar
• Nilabakar
• Bawalbakar
• Udangbakar
• Pausbakar
• Kepitingbakar

━━━━━━━━━━━━━━
`.trim()

	switch (type) {

	case 'ayamgoreng':
		if (user.stamina < 100) {
			if (user.ayamgoreng >= count) {
				user.ayamgoreng -= count
				user.stamina += 20 * count
				user.stamina = Math.min(user.stamina, 100)
				conn.reply(m.chat, `🍗 Kamu makan Ayam Goreng x${count}\nStamina +${20 * count}`, m)
			} else conn.reply(m.chat, `Ayam goreng kamu kurang`, m)
		} else conn.reply(m.chat, `Stamina kamu sudah penuh`, m)
	break

	case 'ayambakar':
		if (user.stamina < 100) {
			if (user.ayambakar >= count) {
				user.ayambakar -= count
				user.stamina += 20 * count
				user.stamina = Math.min(user.stamina, 100)
				conn.reply(m.chat, `🍗 Kamu makan Ayam Bakar x${count}\nStamina +${20 * count}`, m)
			} else conn.reply(m.chat, `Ayam bakar kamu kurang`, m)
		} else conn.reply(m.chat, `Stamina kamu sudah penuh`, m)
	break

	case 'rendang':
		if (user.stamina < 100) {
			if (user.rendang >= count) {
				user.rendang -= count
				user.stamina += 20 * count
				user.stamina = Math.min(user.stamina, 100)
				conn.reply(m.chat, `🥩 Kamu makan Rendang x${count}\nStamina +${20 * count}`, m)
			} else conn.reply(m.chat, `Rendang kamu kurang`, m)
		} else conn.reply(m.chat, `Stamina kamu sudah penuh`, m)
	break

	case 'steak':
		if (user.stamina < 100) {
			if (user.steak >= count) {
				user.steak -= count
				user.stamina += 20 * count
				user.stamina = Math.min(user.stamina, 100)
				conn.reply(m.chat, `🥩 Kamu makan Steak x${count}\nStamina +${20 * count}`, m)
			} else conn.reply(m.chat, `Steak kamu kurang`, m)
		} else conn.reply(m.chat, `Stamina kamu sudah penuh`, m)
	break

	case 'gulaiayam':
		if (user.stamina < 100) {
			if (user.gulaiayam >= count) {
				user.gulaiayam -= count
				user.stamina += 20 * count
				user.stamina = Math.min(user.stamina, 100)
				conn.reply(m.chat, `🍲 Kamu makan Gulai Ayam x${count}\nStamina +${20 * count}`, m)
			} else conn.reply(m.chat, `Gulai ayam kamu kurang`, m)
		} else conn.reply(m.chat, `Stamina kamu sudah penuh`, m)
	break

	case 'oporayam':
		if (user.stamina < 100) {
			if (user.oporayam >= count) {
				user.oporayam -= count
				user.stamina += 20 * count
				user.stamina = Math.min(user.stamina, 100)
				conn.reply(m.chat, `🍲 Kamu makan Opor Ayam x${count}\nStamina +${20 * count}`, m)
			} else conn.reply(m.chat, `Opor ayam kamu kurang`, m)
		} else conn.reply(m.chat, `Stamina kamu sudah penuh`, m)
	break

	case 'babipanggang':
		if (user.stamina < 100) {
			if (user.babipanggang >= count) {
				user.babipanggang -= count
				user.stamina += 20 * count
				user.stamina = Math.min(user.stamina, 100)
				conn.reply(m.chat, `🍖 Kamu makan Babi Panggang x${count}\nStamina +${20 * count}`, m)
			} else conn.reply(m.chat, `Babi panggang kamu kurang`, m)
		} else conn.reply(m.chat, `Stamina kamu sudah penuh`, m)
	break

	case 'ikanbakar':
		if (user.stamina < 100) {
			if (user.ikanbakar >= count) {
				user.ikanbakar -= count
				user.stamina += 20 * count
				user.stamina = Math.min(user.stamina, 100)
				conn.reply(m.chat, `🐟 Kamu makan Ikan Bakar x${count}\nStamina +${20 * count}`, m)
			} else conn.reply(m.chat, `Ikan bakar kamu kurang`, m)
		} else conn.reply(m.chat, `Stamina kamu sudah penuh`, m)
	break

	case 'lelebakar':
		if (user.stamina < 100) {
			if (user.lelebakar >= count) {
				user.lelebakar -= count
				user.stamina += 20 * count
				user.stamina = Math.min(user.stamina, 100)
				conn.reply(m.chat, `🐟 Kamu makan Lele Bakar x${count}\nStamina +${20 * count}`, m)
			} else conn.reply(m.chat, `Lele bakar kamu kurang`, m)
		} else conn.reply(m.chat, `Stamina kamu sudah penuh`, m)
	break

	case 'nilabakar':
		if (user.stamina < 100) {
			if (user.nilabakar >= count) {
				user.nilabakar -= count
				user.stamina += 20 * count
				user.stamina = Math.min(user.stamina, 100)
				conn.reply(m.chat, `🐟 Kamu makan Nila Bakar x${count}\nStamina +${20 * count}`, m)
			} else conn.reply(m.chat, `Nila bakar kamu kurang`, m)
		} else conn.reply(m.chat, `Stamina kamu sudah penuh`, m)
	break

	case 'bawalbakar':
		if (user.stamina < 100) {
			if (user.bawalbakar >= count) {
				user.bawalbakar -= count
				user.stamina += 20 * count
				user.stamina = Math.min(user.stamina, 100)
				conn.reply(m.chat, `🐟 Kamu makan Bawal Bakar x${count}\nStamina +${20 * count}`, m)
			} else conn.reply(m.chat, `Bawal bakar kamu kurang`, m)
		} else conn.reply(m.chat, `Stamina kamu sudah penuh`, m)
	break

	case 'udangbakar':
		if (user.stamina < 100) {
			if (user.udangbakar >= count) {
				user.udangbakar -= count
				user.stamina += 20 * count
				user.stamina = Math.min(user.stamina, 100)
				conn.reply(m.chat, `🦐 Kamu makan Udang Bakar x${count}\nStamina +${20 * count}`, m)
			} else conn.reply(m.chat, `Udang bakar kamu kurang`, m)
		} else conn.reply(m.chat, `Stamina kamu sudah penuh`, m)
	break

	case 'pausbakar':
		if (user.stamina < 100) {
			if (user.pausbakar >= count) {
				user.pausbakar -= count
				user.stamina += 20 * count
				user.stamina = Math.min(user.stamina, 100)
				conn.reply(m.chat, `🐋 Kamu makan Paus Bakar x${count}\nStamina +${20 * count}`, m)
			} else conn.reply(m.chat, `Paus bakar kamu kurang`, m)
		} else conn.reply(m.chat, `Stamina kamu sudah penuh`, m)
	break

	case 'kepitingbakar':
		if (user.stamina < 100) {
			if (user.kepitingbakar >= count) {
				user.kepitingbakar -= count
				user.stamina += 20 * count
				user.stamina = Math.min(user.stamina, 100)
				conn.reply(m.chat, `🦀 Kamu makan Kepiting Bakar x${count}\nStamina +${20 * count}`, m)
			} else conn.reply(m.chat, `Kepiting bakar kamu kurang`, m)
		} else conn.reply(m.chat, `Stamina kamu sudah penuh`, m)
	break

	default:
		conn.reply(m.chat, list, m)

	}
}

handler.help = ['makan']
handler.tags = ['rpg']
handler.command = /^(eat|makan)$/i
handler.group = true
handler.register = true

export default handler