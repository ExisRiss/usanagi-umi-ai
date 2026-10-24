// File: plugins/owner-sleepmode.js

export async function before(m, { isOwner, conn }) {
    if (typeof global.sleepMode === 'undefined') {
        global.sleepMode = false;
    }

    // Jika sleep mode aktif dan yang chat BUKAN owner
    if (global.sleepMode && !isOwner) {
        // Cek apakah pesan dari pengguna berupa command (menggunakan prefix umum atau conn.prefix)
        const prefix = global.prefix || /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/;
        const isCommand = m.text && (typeof prefix === 'string' ? m.text.startsWith(prefix) : prefix.test(m.text));
        
        if (isCommand) {
            // Opsional: Kirim balasan hanya di chat tempat user tersebut mengetik command
            m.reply('💤 *Bot sedang dalam Sleep Mode*\n\nSaat ini bot sedang istirahat di semua grup. Hanya Owner yang dapat menggunakan fitur bot.');
            
            // Kosongkan teks agar perintah gagal dieksekusi di SEMUA grup/pribadi
            m.text = ''; 
            return true;
        }
    }
    return true;
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) {
        return m.reply(`*Format salah!*\n\nGunakan format:\n${usedPrefix}${command} on [durasi]\n${usedPrefix}${command} off\n\n*Contoh Penggunaan:*\n${usedPrefix}${command} on *(Permanen di semua grup)*\n${usedPrefix}${command} on 30m *(Untuk 30 menit)*\n${usedPrefix}${command} on 2h *(Untuk 2 jam)*`);
    }

    const action = args[0].toLowerCase();

    if (action === 'on') {
        global.sleepMode = true;
        
        if (args[1]) {
            let time = parseInt(args[1]);
            let unit = args[1].replace(/[0-9]/g, '').toLowerCase(); 
            let durationInMs = 0;

            if (unit === 'h' || unit === 'jam') {
                durationInMs = time * 60 * 60 * 1000;
            } else if (unit === 'm' || unit === 'menit' || unit === '') {
                durationInMs = time * 60 * 1000; 
            } else if (unit === 's' || unit === 'detik') {
                durationInMs = time * 1000; 
            } else {
                return m.reply('❌ *Unit waktu tidak valid!* Gunakan *m* (menit) atau *h* (jam). Contoh: 30m');
            }

            if (isNaN(time) || durationInMs <= 0) return m.reply('❌ Masukkan angka durasi yang benar!');

            if (global.sleepTimer) clearTimeout(global.sleepTimer);

            m.reply(`✅ *Sleep Mode diaktifkan di SEMUA GRUP selama ${time}${unit}.*\n\nBot akan otomatis bangun setelah durasi habis.`);

            global.sleepTimer = setTimeout(() => {
                global.sleepMode = false;
                // Mengirim pesan ke tempat owner menyalakan, atau kamu bisa hapus jika tidak ingin ada pesan otomatis saat bangun
                conn.reply(m.chat, '⏰ *Waktu Sleep Mode telah habis!*\n\nBot kembali bangun dan bisa diakses di semua grup.', m);
                delete global.sleepTimer; 
            }, durationInMs);

        } else {
            m.reply('✅ *Sleep Mode diaktifkan di SEMUA GRUP (Tanpa batas waktu).*\n\nSemua fitur terkunci di seluruh grup dan chat pribadi kecuali untuk Owner.');
        }

    } else if (action === 'off') {
        global.sleepMode = false;
        
        if (global.sleepTimer) {
            clearTimeout(global.sleepTimer);
            delete global.sleepTimer;
        }
        
        m.reply('❌ *Sleep Mode dinonaktifkan.*\n\nBot kembali berjalan normal untuk semua pengguna di semua grup.');
    } else {
        m.reply(`Opsi tidak valid. Gunakan 'on' atau 'off'.\nContoh: ${usedPrefix}${command} on 1h`);
    }
}

handler.help = ['sleepmode <on/off> [durasi]']
handler.tags = ['owner']
handler.command = /^(sleepmode|sleep)$/i
handler.owner = true 

export default handler