// plugins/owner/cekwa.js
// WA CHECK
// ESM Plugin

import axios from 'axios';

const handler = async (m, {
    conn,
    text,
    usedPrefix,
    isOwner,
    isBot
}) => {

    // =========================
    // CEK LIMIT
    // =========================
    const user = global.db.data.users[m.sender];

    if (!isOwner && !isBot) {
        if (!user) {
            return m.reply(
                `Kyaa~ kamu belum daftar ya~\n\n` +
                `Ketik *${usedPrefix}daftar Nama* untuk mendaftar.`
            );
        }

        if (Number(user.limit) < 5) {
            return m.reply(
                `Limit-mu kurang nih~ (｡•́︿•̀｡)\n\n` +
                `Fitur ini butuh 5 limit.\n` +
                `Chat owner untuk tambah limit!`
            );
        }
    }

    // =========================
    // AMBIL NOMOR
    // =========================
    let targetNumber = (text || '').replace(/[^0-9]/g, '');

    // Reply pesan
    if (!targetNumber && m.quoted?.sender) {
        targetNumber = m.quoted.sender.replace(/[^0-9]/g, '');
    }

    // Mention
    if (!targetNumber && m.mentionedJid?.[0]) {
        targetNumber = m.mentionedJid[0].replace(/[^0-9]/g, '');
    }

    // =========================
    // NOMOR KOSONG
    // =========================
    if (!targetNumber) {
        return m.reply(
            `Masukkan nomor WhatsApp-nya dulu ya kawaii-chan~ 🌸\n\n` +
            `Contoh:\n` +
            `${usedPrefix}cekwa 628xxxxxxxxxx\n\n` +
            `Atau reply pesan orangnya terus ketik ` +
            `*${usedPrefix}cekwa*`
        );
    }

    // 08xxxxxxxx → 628xxxxxxxx
    if (targetNumber.startsWith('08')) {
        targetNumber = '62' + targetNumber.slice(1);
    }

    // =========================
    // LOADING
    // =========================
    await m.reply(
        '_✨ lagi ngecek nomornya..._'
    );

    try {

        // =========================
        // REQUEST API
        // =========================
        const { data } = await axios.get(
            'https://kyuux-r.indevs.in/api/check-whatsapp',
            {
                params: {
                    phone: targetNumber
                },
                timeout: 30000
            }
        );

        // =========================
        // VALIDASI RESPONSE
        // =========================
        if (!data?.success) {
            throw new Error(
                data?.message ||
                'API tidak mengembalikan hasil'
            );
        }

        const d = data.data || {};

        // =========================
        // REACTION SUCCESS
        // =========================
        await conn.sendMessage(m.chat, {
            react: {
                text: '✅',
                key: m.key
            }
        }).catch(() => {});

        // =========================
        // HASIL
        // =========================
        const result =
            `✦ *WA CHECK*\n\n` +
            `✎ *Number:* ${d.number || targetNumber}\n` +
            `✎ *Status:* ${d.status || '-'}\n` +
            `✎ *Banned:* ${
                d.banned === true
                    ? 'Yes'
                    : d.banned === false
                        ? 'No'
                        : '-'
            }\n` +
            `✎ *Device:* ${d.info?.device || '-'}\n` +
            `✎ *Email:* ${d.info?.email || '-'}`;

        await m.reply(result);

        // =========================
        // LIMIT
        // =========================
        if (!isOwner && !isBot) {
            m.limit = 5;
        }

    } catch (e) {

        console.error(
            '[cekwa] error:',
            e?.message || e
        );

        // =========================
        // REACTION ERROR
        // =========================
        await conn.sendMessage(m.chat, {
            react: {
                text: '❌',
                key: m.key
            }
        }).catch(() => {});

        // =========================
        // ERROR MESSAGE
        // =========================
        await m.reply(
            `❌ Gagal cek nomornya nih~ (T_T)\n\n` +
            `${e?.message || 'Coba lagi nanti ya'} ✿`
        );
    }
};

handler.help = ['cekwa <nomor>'];
handler.tags = ['owner'];
handler.command = /^cekwa$/i;
handler.owner = true

export default handler;