let handler = async function (m, { args }) {
	let user = global.db.data.users[m.sender];

	if (!user.registered) {
		return m.reply('Kamu belum terdaftar.');
	}

	if (!args[0]) {
		return m.reply(
`⚠️ *Konfirmasi Unregister*

Ketik:
.unreg yes

untuk melanjutkan unregister.`
		);
	}

	if (args[0].toLowerCase() !== 'yes') {
		return m.reply('Batal unregister.');
	}

	user.registered = false;
	user.name = '';
	user.age = 0;

	m.reply('```Success Unregister ✅```');
};

handler.help = ['unreg'];
handler.tags = ['xp'];
handler.command = /^unreg(ister)?$/i;
handler.register = true;

export default handler;