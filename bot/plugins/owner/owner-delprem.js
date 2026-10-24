let handler = async (m, { conn, text }) => {
  let who;

  if (m.quoted) {
    // Reply pesan
    who = m.quoted.sender;
  } else if (m.mentionedJid && m.mentionedJid.length) {
    // Tag pengguna
    who = m.mentionedJid[0];
  } else if (text) {
    // Nomor telepon
    let phone = text.replace(/\D/g, '');
    if (!phone) throw 'Masukkan nomor yang valid.';
    who = phone + '@s.whatsapp.net';
  } else {
    throw `Gunakan salah satu cara berikut:

• .delprem @tag
• .delprem 628xxxxxxxxxx
• Reply pesan pengguna lalu ketik .delprem`;
  }

  let users = global.db.data.users;

  if (!users[who]) throw 'User tidak ditemukan di database.';

  users[who].premium = false;
  users[who].premiumTime = 0;
  users[who].isUnlimitedLimit = false;

  conn.reply(
    m.chat,
    `✅ Berhasil menghapus status premium dari @${
      who.split('@')[0]
    }`,
    m,
    {
      mentions: [who]
    }
  );
};

handler.help = ['delprem'];
handler.tags = ['owner'];
handler.command = /^delprem(user)?$/i;
handler.owner = true;

export default handler;