const cleanJid = jid => {
    if (!jid) return ''
    if (typeof jid !== 'string') jid = String(jid)

    return jid
        .replace(/:\d+@/g, '@')
        .replace('@lid', '@s.whatsapp.net')
        .trim()
}

const getTarget = (m, args = []) => {
    if (m.quoted?.sender)
        return cleanJid(m.quoted.sender)

    if (m.mentionedJid?.length)
        return cleanJid(m.mentionedJid[0])

    const number = args[0]?.replace(/\D/g, '')

    if (number)
        return `${number}@s.whatsapp.net`

    return ''
}

const handler = async (m, {
    args,
    isOwner,
    usedPrefix,
    command
}) => {
    if (!isOwner)
        return m.reply('❌ Command ini khusus owner.')

    // BAGIAN INI YANG DIBENERIN BIAR GAK ERROR
    global.db.data.blacklistUser = global.db.data.blacklistUser || {}

    const target = getTarget(m, args)

    if (!target) {
        return m.reply(
            `🚫 *BLACKLIST USER*\n\n` +
            `Cara penggunaan:\n\n` +
            `• ${usedPrefix + command} @user\n` +
            `• ${usedPrefix + command} 628xxxxxxxxxx\n` +
            `• Reply pesan lalu ketik ${usedPrefix + command}\n\n` +
            `Contoh:\n` +
            `${usedPrefix + command} 628xxxxxxxxxx`
        )
    }

    const number = target.split('@')[0]

    if (cleanJid(target) === cleanJid(m.sender))
        return m.reply('Jangan blacklist diri sendiri.')

    if (global.db.data.blacklistUser[target])
        return m.reply(`⚠️ ${number} sudah ada di blacklist.`)

    global.db.data.blacklistUser[target] = {
        addedAt: Date.now(),
        addedBy: cleanJid(m.sender)
    }

    return m.reply(
        `🔴 *USER DI-BLACKLIST*\n\n` +
        `👤 User: @${number}\n` +
        `📌 Status: BLACKLIST\n\n` +
        `Jika user tersebut masuk grup, bot akan otomatis mengeluarkannya.`,
        null,
        {
            mentions: [target]
        }
    )
}

handler.help = ['blacklist']
handler.tags = ['owner']
handler.command = /^blacklist$/i
handler.admin = true

export default handler