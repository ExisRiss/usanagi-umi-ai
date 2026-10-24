// group/absen.js
// Fitur : Mulai Absen + Absen + List Absen + Reset Absen
// Type  : Plugin ESM
// By    : AlzRiss

const getData = () => {
    if (!global.db.data.absen) {
        global.db.data.absen = {}
    }

    return global.db.data.absen
}

let handler = async (m, {
    command,
    isAdmin,
    isOwner,
    usedPrefix
}) => {
    const data = getData()
    const chat = m.chat

    // ==========================================
    // MULAI ABSEN
    // ==========================================
    if (command === 'mulaiabsen') {
        if (!m.isGroup) {
            throw '❌ Fitur ini hanya bisa digunakan di grup.'
        }

        if (data[chat]) {
            const total = Object.keys(
                data[chat].peserta || {}
            ).length

            return m.reply(
                '📋 *ABSENSI MASIH AKTIF*\n\n' +
                '👥 Sudah hadir: *' + total + ' orang*\n\n' +
                'Gunakan *' + usedPrefix + 'absen* untuk melakukan absen.\n' +
                'Gunakan *' + usedPrefix + 'listabsen* untuk melihat daftar.\n' +
                'Gunakan *' + usedPrefix + 'resetabsen* untuk menghapus.'
            )
        }

        data[chat] = {
            created: Date.now(),
            peserta: {}
        }

        return m.reply(
            '📢 *ABSENSI DIMULAI*\n\n' +
            'Absensi telah dibuka.\n\n' +
            '👤 Yang ingin hadir silakan ketik:\n' +
            '👉 *' + usedPrefix + 'absen*\n\n' +
            '📋 *' + usedPrefix + 'listabsen* — melihat daftar\n' +
            '♻️ *' + usedPrefix + 'resetabsen* — reset absensi'
        )
    }

    // ==========================================
    // ABSEN
    // ==========================================
    if (command === 'absen') {
        if (!m.isGroup) {
            throw '❌ Fitur ini hanya bisa digunakan di grup.'
        }

        if (!data[chat]) {
            return m.reply(
                '❌ *ABSENSI BELUM DIMULAI*\n\n' +
                'Gunakan *' + usedPrefix + 'mulaiabsen* terlebih dahulu.'
            )
        }

        if (!data[chat].peserta) {
            data[chat].peserta = {}
        }

        // Sudah absen
        if (data[chat].peserta[m.sender]) {
            return m.reply(
                '⚠️ Kamu sudah melakukan absen.'
            )
        }

        // Simpan absen
        data[chat].peserta[m.sender] = Date.now()

        const total = Object.keys(
            data[chat].peserta
        ).length

        return m.reply(
            '✅ *ABSEN BERHASIL*\n\n' +
            '👤 @' + m.sender.split('@')[0] + '\n' +
            '⏰ ' +
            new Date().toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
            }) +
            '\n\n' +
            '📊 Total hadir: *' + total + ' orang*',
            null,
            {
                mentions: [m.sender]
            }
        )
    }

    // ==========================================
    // LIST ABSEN
    // ==========================================
    if (command === 'listabsen') {
        if (!m.isGroup) {
            throw '❌ Fitur ini hanya bisa digunakan di grup.'
        }

        if (!data[chat]) {
            return m.reply(
                '❌ *ABSENSI BELUM DIMULAI*\n\n' +
                'Gunakan *' + usedPrefix + 'mulaiabsen* terlebih dahulu.'
            )
        }

        const peserta = data[chat].peserta || {}
        const list = Object.entries(peserta)

        const created = new Date(
            data[chat].created
        )

        let teks =
            '╭─〔 📋 LIST ABSEN 〕─╮\n' +
            '│\n' +
            '│ 📅 Tanggal : ' +
            created.toLocaleDateString('id-ID') + '\n' +
            '│ ⏰ Mulai   : ' +
            created.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
            }) + '\n' +
            '│ 👥 Hadir   : *' +
            list.length +
            ' orang*\n' +
            '│\n'

        if (list.length === 0) {
            teks +=
                '│ ❌ Belum ada yang absen.\n' +
                '│\n'
        } else {
            for (let i = 0; i < list.length; i++) {
                const jid = list[i][0]
                const waktu = list[i][1]

                const jam = new Date(
                    waktu
                ).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                })

                teks +=
                    '│ ' +
                    (i + 1) +
                    '. @' +
                    jid.split('@')[0] +
                    '\n' +
                    '│    └─ ' +
                    jam +
                    '\n'
            }

            teks += '│\n'
        }

        teks +=
            '╰────────────────────╯'

        return m.reply(
            teks,
            null,
            {
                mentions: list.map(function (item) {
                    return item[0]
                })
            }
        )
    }

    // ==========================================
    // RESET ABSEN
    // ==========================================
    if (command === 'resetabsen') {
        if (!m.isGroup) {
            throw '❌ Fitur ini hanya bisa digunakan di grup.'
        }

        if (!isAdmin && !isOwner) {
            throw '❌ Hanya admin grup atau owner yang bisa mereset absensi.'
        }

        if (!data[chat]) {
            return m.reply(
                '❌ Tidak ada absensi yang sedang aktif.'
            )
        }

        delete data[chat]

        return m.reply(
            '♻️ *ABSENSI BERHASIL DI-RESET*\n\n' +
            'Semua data absensi di grup ini telah dihapus.\n\n' +
            'Untuk memulai lagi gunakan:\n' +
            '👉 *' + usedPrefix + 'mulaiabsen*'
        )
    }
}

handler.help = [
    'mulaiabsen',
    'absen',
    'listabsen',
    'resetabsen'
]

handler.tags = [
    'group'
]

handler.command = /^(mulaiabsen|absen|listabsen|resetabsen)$/i

handler.group = true

export default handler