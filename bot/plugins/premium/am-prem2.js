/* 
 * Name   : Alight Motion Prem V2 
 * Type   : ESM 
 * Url    : https://am.neonode.my.id 
  * By AlzRiss - Usanagi Umi AI
 */ 

import axios from 'axios';

const API_URL = 'https://am.neonode.my.id/api';

// Session sementara untuk menyimpan email user
const sessions = new Map();

/**
 * Fungsi untuk mengirim magic link
 */
async function sendLink(email) {
  try {
    const { data } = await axios.post(
      `${API_URL}/send-link`,
      { email },
      {
        headers: { 'content-type': 'application/json' },
        timeout: 30000
      }
    );
    return data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

/**
 * Fungsi untuk memverifikasi magic link
 */
async function verifyLink(email, magicLink) {
  try {
    const { data } = await axios.post(
      `${API_URL}/verify-link`,
      { email, magicLink },
      {
        headers: { 'content-type': 'application/json' },
        timeout: 30000
      }
    );
    return data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
}

/**
 * Fungsi untuk memvalidasi format email
 */
function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  text = text?.trim();

  /* ============================================================
     VERIFY MAGIC LINK
  ============================================================ */
  if (command === 'ampremverify' || command === 'ampverify') {
    if (!text) {
      return m.reply(
        `❌ *Magic link belum diberikan*\n\n` +
        `Contoh:\n` +
        `${usedPrefix}${command} https://am.neonode.my.id/...`
      );
    }

    const session = sessions.get(m.sender);
    if (!session) {
      return m.reply(
        `❌ *Session tidak ditemukan*\n\n` +
        `Silakan mulai ulang dengan:\n` +
        `${usedPrefix}amprem email@gmail.com`
      );
    }

    await m.reply('⏳ Memverifikasi magic link...');
    
    const result = await verifyLink(session.email, text);
    
    if (!result?.success) {
      return m.reply(
        `❌ *Verifikasi gagal*\n\n` +
        `${result?.message || 'Magic link tidak valid atau sudah kedaluwarsa.'}`
      );
    }

    // Hapus sesi setelah berhasil
    sessions.delete(m.sender);
    
    // ======== FORMAT RESULT SUKSES ========
    let resMsg = `✅ *Berhasil diverifikasi!*\n`;
    resMsg += `📝 ${result.message || 'verifikasi berhasil, premium aktif.'}\n\n`;
    
    if (result.data) {
      const d = result.data;
      
      resMsg += `👤 *INFO AKUN*\n`;
      resMsg += `• *Email:* ${d.email || '-'}\n`;
      resMsg += `• *UID:* ${d.uid || '-'}\n`;
      resMsg += `• *Status:* ${d.status || '-'}\n\n`;
      
      resMsg += `💎 *INFO PREMIUM*\n`;
      resMsg += `• *Plan:* ${d.planName || '-'}\n`;
      resMsg += `• *Tipe:* ${d.subscriptionType || '-'}\n`;
      resMsg += `• *Membership:* ${d.membershipStatus || '-'}\n`;
      resMsg += `• *Order ID:* ${d.orderId || '-'}\n`;
      resMsg += `• *Berlaku Sampai:* ${d.validUntil || '-'}`;
    }

    // Kirim pesan Info Akun & Premium tanpa ID Token
    return m.reply(resMsg);
  }

  /* ============================================================
     SEND MAGIC LINK
  ============================================================ */
  if (!text) {
    return m.reply(
      `✨ *Alight Motion Premium V2*\n\n` +
      `Masukkan email kamu.\n\n` +
      `Contoh:\n` +
      `${usedPrefix}${command} email@gmail.com\n\n` +
      `Setelah magic link diterima, gunakan:\n` +
      `${usedPrefix}ampremverify <magic-link>`
    );
  }

  const email = text.split(/\s+/)[0].trim();
  
  if (!validEmail(email)) {
    return m.reply(
      `❌ *Email tidak valid*\n\n` +
      `Contoh:\n` +
      `${usedPrefix}${command} email@gmail.com`
    );
  }

  await m.reply(
    `⏳ *Mengirim magic link...*\n\n` +
    `📧 Email: ${email}`
  );

  const result = await sendLink(email);
  
  if (!result?.success) {
    return m.reply(
      `❌ *Gagal mengirim magic link*\n\n` +
      `${result?.message || 'Terjadi kesalahan pada server.'}`
    );
  }

  // Simpan email ke dalam memori/session sementara
  sessions.set(m.sender, { email, createdAt: Date.now() });
  
  return m.reply(
    `✅ *Magic link berhasil dikirim!*\n\n` +
    `📧 Email: ${email}\n\n` +
    `📩 Silakan cek inbox atau folder spam.\n` +
    `🔗 Salin magic link yang dikirim.\n\n` +
    `Kemudian kirim:\n` +
    `${usedPrefix}ampremverify <magic-link>\n\n` +
    `⚠️ Jangan bagikan magic link kepada orang lain.`
  );
};

handler.help = ['amprem2 <email>', 'ampremverify2 <magic-link>'];
handler.tags = ['premium'];
handler.command = ['amprem2', 'alightmotionprem', 'ampremverify2', 'ampverify'];
handler.premium = true

export default handler;