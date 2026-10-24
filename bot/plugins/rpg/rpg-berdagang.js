import { scheduleRpgReward } from '../../lib/rpg/unified-runtime.js'
import { unifiedRpg } from '../../lib/rpg/unified-store.js'
let handler = async (m, { conn }) => {
	const dapat = Math.floor(Math.random() * 5000);
	const who = m.mentionedJid[0];
	if (!who) throw 'Tag salah satu lah, yang kamu ingin berdagang bareng';

	if (!global.db.data.users[who]) return m.reply('Pengguna tidak ada didalam data base');

	if (who === m.sender || (unifiedRpg() && unifiedRpg().identity(who) === unifiedRpg().identity(m.sender))) return m.reply('Pilih peserta lain, bukan alias akun sendiri.');
	const user = global.db.data.users[m.sender];
	const partner = global.db.data.users[who];

	const now = Date.now();
	const _timers = now - user.lastdagang;
	const timers = clockString(28800000 - _timers);

	if (now - user.lastdagang < 28800000) return m.reply(`Anda sudah berdagang, tunggu ${timers} lagi.`);

	if (partner.money < 5000) throw 'Target tidak memiliki modal, minimal 5000';
	if (user.money < 5000) throw 'Kamu tidak memiliki modal, minimal 5000';

	partner.money -= dapat;
	user.money -= dapat;
	partner.lastdagang = now;
	user.lastdagang = now;

	const pending = scheduleRpgReward(m, 'dagang-1', 3600000, [{jid:m.sender,koin:15000},{jid:who,koin:15000}], conn, 'Hasil dagang pertama sudah masuk: +15.000 koin per peserta.');
	if (pending) scheduleRpgReward(m, 'dagang-2', 7200000, [{jid:m.sender,koin:15000},{jid:who,koin:15000}], conn, 'Hasil dagang kedua sudah masuk: +15.000 koin per peserta.');
	m.reply(
		`
Mohon tunggu kak..
Kamu dan @${who.split('@')[0]} sedang berdagang...
Kedua pihak meletakkan modal: -${dapat}
        `.trim()
	);

	if (pending) return;

	setTimeout(() => {
		user.money += 15000;
		partner.money += 15000;

		m.reply(
			`
Selamat! Hasil dagang pertama telah keluar.

Kamu mendapat +15000 (Total: ${user.money})
@${who.split('@')[0]} mendapat +15000 (Total: ${partner.money})`
		);
	}, 3600000);

	setTimeout(() => {
		user.money += 15000;
		partner.money += 15000;

		m.reply(
			`
Selamat! Hasil dagang kedua telah keluar.

Kamu mendapat +15000 (Total: ${user.money})
@${who.split('@')[0]} mendapat +15000 (Total: ${partner.money})`
		);
	}, 7200000);
};

handler.help = ['berdagang'];
handler.tags = ['rpg'];
handler.command = /^berdagang$/i;
handler.register = true;
handler.group = true;

export default handler;

function clockString(ms) {
	let h = Math.floor(ms / 3600000);
	let m = Math.floor(ms / 60000) % 60;
	let s = Math.floor(ms / 1000) % 60;
	return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(':');
}
