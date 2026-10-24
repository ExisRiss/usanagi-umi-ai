let handler = async (m, { conn, args }) => {

	let user = global.db.data.users[m.sender]
	let e = global.rpg.emoticon

	let count = parseInt(args[0])
	if (isNaN(count)) count = 1

	if (user.potion < count)
		return m.reply(`${e('potion')} Potion kamu tidak cukup`)

	if (user.health >= 100)
		return m.reply(`${e('health')} Health kamu sudah penuh`)

	user.potion -= count
	user.health += 20 * count

	if (user.health > 100) user.health = 100

	m.reply(`
${e('health')} *HEAL BERHASIL*

${e('potion')} Potion dipakai : ${count}
${e('health')} Health sekarang : ${user.health}
`.trim())

}

handler.help = ['heal','heal jumlah']
handler.tags = ['rpg']
handler.command = /^(heal)$/i
handler.group = true

export default handler