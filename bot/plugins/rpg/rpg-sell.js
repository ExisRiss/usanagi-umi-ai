let handler = async (m, { args }) => {

	let user = global.db.data.users[m.sender]
	if (!user) return m.reply('Data pengguna tidak ditemukan. Coba kirim pesan lain dulu.')
	// Sama seperti rpg-bank: jangan asumsikan global.rpg selalu ada.
	const e = typeof global.rpg?.emoticon === 'function'
		? global.rpg.emoticon
		: (key) => ({ money: '💵', bank: '🏦' }[key] || '')

	// Terima dua urutan argumen: ".sell harimau 8" dan ".sell 8 harimau".
	// Laporan Feedback 15 Okt 2026: pengguna mengetik ".sell 8 harimau" dan
	// hanya mendapat "Item tidak bisa dijual" karena "8" dibaca sebagai nama item.
	let mentah = args.map(a => String(a).toLowerCase())
	if (mentah[0] === 'babi' && mentah[1] === 'hutan') mentah = ['babihutan', ...mentah.slice(2)]
	let item = mentah.find(a => !/^\d+$/.test(a)) || ''
	let jumlah = parseInt(mentah.find(a => /^\d+$/.test(a))) || 1

	let harga = {
		trash: 50,

		ikan: 1500,
		lele: 2000,
		nila: 2000,
		bawal: 2500,
		udang: 3000,
		kepiting: 3500,
		paus: 10000,

		// Semua hasil .berburu harus bisa dijual — sebelumnya harimau, gajah,
		// panda, buaya, kerbau, monyet, dan babihutan hilang dari tabel ini.
		ayam: 5000,
		monyet: 6000,
		kambing: 8000,
		babihutan: 9000,
		babi: 10000,
		sapi: 12000,
		kerbau: 13000,
		buaya: 14000,
		banteng: 15000,
		panda: 16000,
		harimau: 18000,
		gajah: 20000,

		diamond: 9000,
		emerald: 7000
	}

	if (!item) {
		return m.reply(`
🌸 *ALZRISS RPG SELL* ❀

📦 Item yang bisa dijual

🗑 Trash
🐟 Ikan / Lele / Nila / Bawal
🦐 Udang
🦀 Kepiting
🐋 Paus

🐓 Ayam
🐒 Monyet
🐐 Kambing
🐗 Babi Hutan
🐖 Babi
🐄 Sapi
🐃 Kerbau
🐊 Buaya
🐂 Banteng
🐼 Panda
🐅 Harimau
🐘 Gajah

💎 Diamond
❇️ Emerald

Contoh:
.sell ikan 5
.sell harimau 8
.sell diamond
`.trim())
	}

	// Kesalahan pengguna dibalas sebagai pesan biasa, bukan dilempar sebagai
	// error — supaya tidak tercatat sebagai laporan kerusakan di Feedback.
	if (!(item in harga)) return m.reply(`Item *${item}* tidak bisa dijual.\nKetik *.sell* untuk melihat daftar item yang bisa dijual.`)

	if ((user[item] || 0) < jumlah) return m.reply(`Item tidak cukup. Kamu punya *${user[item] || 0}* ${item}, mau menjual *${jumlah}*.`)

	let total = harga[item] * jumlah

	user[item] -= jumlah
	user.money += total

	m.reply(`
❀ *BERHASIL MENJUAL* ❀

Item : ${item}
Jumlah : ${jumlah}

${e('money')} +${total}
`.trim())

}

handler.help = ['sell']
handler.tags = ['rpg']
handler.command = /^(sell)$/i
handler.group = true

export default handler