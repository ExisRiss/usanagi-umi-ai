
import { proto, generateWAMessage, areJidsSameUser } from '@rexxhayanasi/elaina-baileys';
import { extractSelectionId } from '../../lib/message-response.js';

function responseId(m) {
	if (m.mtype === 'conversation') return m.message.conversation || '';
	if (m.mtype === 'imageMessage') return m.message.imageMessage?.caption || '';
	if (m.mtype === 'videoMessage') return m.message.videoMessage?.caption || '';
	if (m.mtype === 'extendedTextMessage') return m.message.extendedTextMessage?.text || '';
	if (['buttonsResponseMessage', 'listResponseMessage', 'templateButtonReplyMessage', 'interactiveResponseMessage'].includes(m.mtype)) {
		return extractSelectionId(m.msg);
	}
	if (m.mtype === 'messageContextInfo') {
		return m.message.buttonsResponseMessage?.selectedButtonId ||
			m.message.listResponseMessage?.singleSelectReply?.selectedRowId ||
			m.text || '';
	}
	return '';
}

export async function all(m, chatUpdate) {
	if (m.isBaileys) return;
	if (!m.message) return;
	if (!(m.message.buttonsResponseMessage || m.message.templateButtonReplyMessage || m.message.listResponseMessage || m.message.interactiveResponseMessage || m.message.pollUpdateMessage)) return;

	const id = responseId(m);
	if (!id) return;

	// Serializer baru sudah menaruh ID tombol/list/native-flow ke m.text.
	// Dalam kondisi itu command diproses langsung oleh handler. Jangan emit
	// pesan sintetis lagi karena akan membuat kategori dibalas dua kali.
	if (m.text === id) return;

	let messages = await generateWAMessage(
		m.chat,
		{ text: id, mentions: m.mentionedJid },
		{
			userJid: this.user.jid,
			quoted: m.quoted && m.quoted.fakeObj,
		}
	);
	messages.key.remoteJid = m.chat;
	messages.key.fromMe = areJidsSameUser(m.sender, this.user.id);
	messages.key.id = m.key.id;
	messages.pushName = m.pushName;
	if (m.isGroup) messages.key.participant = messages.participant = m.sender;
	let msg = {
		...chatUpdate,
		messages: [proto.WebMessageInfo.create(messages)].map((v) => ((v.conn = this), v)),
		type: 'append',
	};
	this.ev.emit('messages.upsert', msg);
}
