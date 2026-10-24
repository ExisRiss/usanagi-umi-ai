import { proto, generateWAMessage, areJidsSameUser } from '@rexxhayanasi/elaina-baileys';

export async function all(m, chatUpdate) {
	if (m?.isBaileys) return;
	if (!m?.message) return;

	// Link previews, protocol messages, and some WhatsApp message wrappers do
	// not expose `m.msg`. Only media that actually carries a sticker hash should
	// enter the command-with-media compatibility path.
	const fileSha256 = m?.msg?.fileSha256;
	if (!fileSha256) return;
	const stickers = global.db?.data?.sticker;
	if (!stickers || typeof stickers !== 'object') return;

	let hash;
	try {
		hash = Buffer.from(fileSha256).toString('base64');
	} catch {
		return;
	}
	if (!(hash in stickers)) return;

	let { text, mentionedJid } = stickers[hash] || {};
	if (typeof text !== 'string' || !text.trim()) return;
	let messages = await generateWAMessage(
		m.sender,
		{ text: text, mentions: mentionedJid },
		{
			userJid: this.user.jid,
			quoted: m.quoted && m.quoted.fakeObj,
		}
	);
	messages.key.remoteJid = m.chat;
	messages.key.fromMe = areJidsSameUser(m.chat, this.user.id);
	messages.key.id = m.key.id;
	messages.pushName = m.pushName;
	if (m.isGroup) messages.key.participant = m.sender;
	let msg = {
		...chatUpdate,
		messages: [proto.WebMessageInfo.create(messages)],
		type: 'append',
	};
	this.ev.emit('messages.upsert', msg);
}
