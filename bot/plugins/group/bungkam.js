/*
# Fitur : Bungkam Target
# By AlzRiss - Usanagi Umi AI
# Type : ESM Plugin
*/

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

async function dmsg(conn, chatId, stanzaId) {
    const tempId = await conn.relayMessage(
        chatId,
        {
            groupStatusMessageV2: {
                message: {
                    extendedTextMessage: {
                        text: '',
                        contextInfo: {
                            isGroupStatus: true
                        }
                    }
                }
            }
        },
        {}
    )

    const tempId2 = await conn.relayMessage(
        chatId,
        {
            protocolMessage: {
                key: {
                    jid: chatId,
                    fromMe: true,
                    id: tempId
                },
                type: 14,
                editedMessage: {
                    extendedTextMessage: {
                        text: '\0',
                        contextInfo: {
                            isGroupStatus: false
                        }
                    }
                }
            }
        },
        {
            messageId: stanzaId
        }
    )

    await delay(100)

    await Promise.allSettled([
        conn.sendMessage(chatId, {
            delete: {
                remoteJid: chatId,
                id: tempId,
                fromMe: true
            }
        }),
        conn.sendMessage(chatId, {
            delete: {
                remoteJid: chatId,
                id: tempId2,
                fromMe: true
            }
        })
    ])
}

function getTarget(m) {
    // Target dari tag
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        return m.mentionedJid[0]
    }

    // Target dari reply
    if (m.quoted && m.quoted.sender) {
        return m.quoted.sender
    }

    return null
}

let handler = async function (m, { conn, args, isOwner }) {
    if (!isOwner) return

    if (!m.chat || !m.chat.endsWith('@g.us')) {
        return m.reply('❌ Fitur ini hanya bisa digunakan di group.')
    }

    // Buat database utama
    if (!global.db.data.bungkam) {
        global.db.data.bungkam = {}
    }

    // Buat database group
    if (!global.db.data.bungkam[m.chat]) {
        global.db.data.bungkam[m.chat] = []
    }

    const action = args[0] ? args[0].toLowerCase() : ''

    if (
        action !== 'on' &&
        action !== 'off' &&
        action !== 'list'
    ) {
        return m.reply(
            '🔇 *BUNGKAM TARGET*\n\n' +
            'Cara penggunaan:\n\n' +
            '• .bungkam on 628xxx\n' +
            '• .bungkam off 628xxx\n\n' +
            'Reply pesan target:\n' +
            '• .bungkam on\n' +
            '• .bungkam off\n\n' +
            'Tag target:\n' +
            '• .bungkam on @628xxx\n' +
            '• .bungkam off @628xxx\n\n' +
            '• .bungkam list'
        )
    }

    // =========================
    // LIST
    // =========================

    if (action === 'list') {
        const targets = global.db.data.bungkam[m.chat]

        if (targets.length === 0) {
            return m.reply(
                '📭 Belum ada target yang dibungkam.'
            )
        }

        let text = '🔇 *DAFTAR TARGET BUNGKAM*\n\n'

        for (let i = 0; i < targets.length; i++) {
            text += (i + 1) + '. @' +
                targets[i].split('@')[0] +
                '\n'
        }

        return m.reply(
            text,
            null,
            {
                mentions: targets
            }
        )
    }

    // =========================
    // CARI TARGET
    // =========================

    let target = getTarget(m)

    // Kalau bukan reply/tag, ambil nomor
    if (!target) {
        let number = args[1]

        if (!number) {
            return m.reply(
                '❌ Target tidak ditemukan.\n\n' +
                'Reply pesan target, tag target, atau masukkan nomor.\n\n' +
                'Contoh:\n' +
                '.bungkam on 628xxxxxxxxxx'
            )
        }

        number = number.replace(/[^0-9]/g, '')

        if (!number) {
            return m.reply(
                '❌ Nomor target tidak valid.'
            )
        }

        target = number + '@s.whatsapp.net'
    }

    // Bersihkan device ID
    if (target.indexOf(':') !== -1) {
        target = target.split(':')[0]
    }

    if (target.indexOf('@') === -1) {
        target += '@s.whatsapp.net'
    }

    const targets = global.db.data.bungkam[m.chat]

    // =========================
    // AKTIFKAN
    // =========================

    if (action === 'on') {
        if (targets.indexOf(target) !== -1) {
            return m.reply(
                '⚠️ @' +
                target.split('@')[0] +
                ' sudah dibungkam.',
                null,
                {
                    mentions: [target]
                }
            )
        }

        targets.push(target)

        return m.reply(
            '🔇 Berhasil membungkam @' +
            target.split('@')[0] +
            '.\n\n' +
            'Pesan dari target tersebut akan otomatis dibungkam.',
            null,
            {
                mentions: [target]
            }
        )
    }

    // =========================
    // NONAKTIFKAN
    // =========================

    if (action === 'off') {
        const index = targets.indexOf(target)

        if (index === -1) {
            return m.reply(
                '⚠️ @' +
                target.split('@')[0] +
                ' tidak ada dalam daftar bungkam.',
                null,
                {
                    mentions: [target]
                }
            )
        }

        targets.splice(index, 1)

        return m.reply(
            '🔊 Bungkam @' +
            target.split('@')[0] +
            ' berhasil dinonaktifkan.',
            null,
            {
                mentions: [target]
            }
        )
    }
}

// =========================
// AUTO BUNGKAM
// =========================

handler.before = async function (m, { conn }) {
    if (m.fromMe) return

    if (!m.chat) return

    if (!m.chat.endsWith('@g.us')) return

    if (!m.id) return

    if (!global.db.data.bungkam) {
        global.db.data.bungkam = {}
    }

    if (!global.db.data.bungkam[m.chat]) {
        return
    }

    const targets = global.db.data.bungkam[m.chat]

    if (!targets || targets.length === 0) {
        return
    }

    let sender = m.sender

    if (!sender) return

    if (sender.indexOf(':') !== -1) {
        sender = sender.split(':')[0]
    }

    if (sender.indexOf('@') === -1) {
        sender += '@s.whatsapp.net'
    }

    // Bukan target
    if (targets.indexOf(sender) === -1) {
        return
    }

    try {
        await dmsg(
            conn,
            m.chat,
            m.id
        )
    } catch (e) {
        console.error(
            '[BUNGKAM TARGET]',
            e
        )
    }
}

handler.help = ['bungkam']
handler.tags = ['group']
handler.command = /^bungkam$/i
handler.admin = true

export default handler