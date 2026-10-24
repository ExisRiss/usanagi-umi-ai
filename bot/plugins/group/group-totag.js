let handler = async (m, { conn, participants }) => {
	// `participants` bisa kosong saat metadata grup belum termuat; dulu ini
	// melempar TypeError sebelum validasi kutipan sempat berjalan.
	let users = (participants || []).map((u) => u.id).filter((v) => v !== conn.user?.jid);
	if (!m.quoted) return m.reply(`✳️ Reply Pesan`);
	conn.sendMessage(m.chat, { forward: m.quoted.fakeObj, mentions: users });
};

handler.help = ['totag'];
handler.tags = ['group'];
handler.command = /^(totag|tag)$/i;

handler.admin = true;
handler.group = true;

export default handler;
