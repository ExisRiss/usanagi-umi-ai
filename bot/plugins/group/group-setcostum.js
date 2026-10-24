import {
  setSessionWelcomeTemplate,
  setSessionGoodbyeTemplate,
} from '../../lib/jadibot-group-welcome.js'

let handler = async (m, { conn, usedPrefix, command, text }) => {
	if (!text) return m.reply(`Teksnya mana?\n\nContoh:\n${usedPrefix + command} Hi @user\n\nVariabel template:\n@user = Member masuk/keluar\n@subject = Nama group\n@info = Informasi group\n@bot = Informasi bot\n@member = Jumlah member group\n@deks = Deskripsi group\n@desc = Alias @deks`);
	let chat = global.db.data.chats[m.chat];
	const isJadibot = conn?.botConfig?.type === 'jadibot'

	switch (command) {
		case 'setwelcome':
			// Text Jadibot disimpan pada profil session, bukan chat global.
			if (isJadibot) setSessionWelcomeTemplate(conn, m.chat, text);
			else chat.sWelcome = text;
			m.reply('✅ Pesan welcome berhasil diset:\n\nketik .enable welcome untuk aktifkan welcome nya yaa🥰\n\n' + text);
			break;
		case 'setbye':
			// Text Jadibot disimpan pada profil session, bukan chat global.
			if (isJadibot) setSessionGoodbyeTemplate(conn, m.chat, text);
			else chat.sBye = text;
			m.reply('✅ Pesan bye berhasil diset:\n' + text);
			break;
		case 'setpromote':
			chat.sPromote = text;
			m.reply('✅ Pesan promote berhasil diset:\n' + text);
			break;
		case 'setdemote':
			chat.sDemote = text;
			m.reply('✅ Pesan demote berhasil diset:\n' + text);
			break;
	}
};

handler.help = ['welcome', 'bye', 'promote', 'demote'].map((v) => 'set' + v + ' <teks>');
handler.tags = ['group'];
handler.command = /^(setwelcome|setbye|setpromote|setdemote)$/i;
handler.group = true;
handler.admin = true;

export default handler;
