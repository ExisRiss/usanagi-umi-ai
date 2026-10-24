/*
 * Fake FF Duo
 * Base API : https://api.snowping.cfd/api/maker/fakeffDuo
 * Type     : ESM Plugin
 */

import axios from 'axios'

let handler = async (m, {
    conn,
    text,
    usedPrefix,
    command,
    isOwner,
    isBot
}) => {
    const ff2DuoText = text ? text.trim() : ''
    const ff2DuoParts = ff2DuoText.split('|')

    // =========================
    // VALIDASI INPUT
    // =========================
    if (
        !ff2DuoText ||
        ff2DuoParts.length < 2 ||
        !ff2DuoParts[0].trim() ||
        !ff2DuoParts[1].trim()
    ) {
        return m.reply(`✎ *Fake FF Duo*

Kyaa~ cara bikin fake FF Duo:

Contoh:
*${usedPrefix}${command} nama1|nama2* ✿`)
    }

    const ff2DuoName1 = ff2DuoParts[0].trim()
    const ff2DuoName2 = ff2DuoParts[1].trim()

    // =========================
    // LIMIT SYSTEM
    // =========================
    if (!isOwner && !isBot) {
        try {
            const senderNomor = String(m.sender || '')
                .replace(/[^0-9]/g, '')

            // Support function global jika tersedia
            const getUserData =
                global.getUserData ||
                global.db?.getUserData

            if (typeof getUserData === 'function') {
                const userData = await getUserData(senderNomor)

                if (!userData) {
                    return m.reply(
                        `Kyaa~ kamu belum daftar ya~

Ketik *${usedPrefix}daftar Nama* untuk mendaftar.`
                    )
                }

                if (
                    userData.limit !== '∞' &&
                    Number(userData.limit) < 2
                ) {
                    return m.reply(
                        `Limit-mu kurang nih~ (｡•́︿•̀｡)

Fake FF Duo membutuhkan *2 limit*.
Chat owner untuk tambah limit!`
                    )
                }
            }
        } catch (e) {
            console.error('[fakeffduo-limit]', e)
        }
    }

    try {
        // =========================
        // REACTION
        // =========================
        await conn.sendMessage(
            m.chat,
            {
                react: {
                    text: '🕐',
                    key: m.key
                }
            }
        )

        // =========================
        // API
        // =========================
        const ff2DuoApiUrl =
            `https://api.snowping.cfd/api/maker/fakeffDuo?username1=${encodeURIComponent(ff2DuoName1)}&username2=${encodeURIComponent(ff2DuoName2)}`

        const {
            data: ff2DuoJson
        } = await axios.get(
            ff2DuoApiUrl,
            {
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            }
        )

        const ff2DuoUrl =
            ff2DuoJson?.result?.url ||
            ff2DuoJson?.url

        if (!ff2DuoUrl) {
            throw new Error(
                'URL hasil fakeffduo tidak ditemukan'
            )
        }

        // =========================
        // DOWNLOAD IMAGE
        // =========================
        const ff2DuoImgRes = await axios.get(
            ff2DuoUrl,
            {
                timeout: 30000,
                responseType: 'arraybuffer',
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    'Accept': 'image/*'
                },
                maxContentLength: 15 * 1024 * 1024,
                maxBodyLength: 15 * 1024 * 1024
            }
        )

        const ff2DuoImageBuffer =
            Buffer.from(ff2DuoImgRes.data)

        if (
            !ff2DuoImageBuffer ||
            ff2DuoImageBuffer.length === 0
        ) {
            throw new Error(
                'Gambar hasil fakeffduo kosong'
            )
        }

        // =========================
        // SEND IMAGE
        // =========================
        await conn.sendMessage(
            m.chat,
            {
                image: ff2DuoImageBuffer,
                caption:
`.✦ 🎮 *FF DUO*

✎ *Player 1* : ${ff2DuoName1.toUpperCase()}
✎ *Player 2* : ${ff2DuoName2.toUpperCase()}`
            },
            {
                quoted: m
            }
        )

        // =========================
        // KURANGI LIMIT
        // =========================
        if (!isOwner && !isBot) {
            const senderNomor = String(m.sender || '')
                .replace(/[^0-9]/g, '')

            const kurangiLimitGlobal =
                global.kurangiLimitGlobal

            if (typeof kurangiLimitGlobal === 'function') {
                await kurangiLimitGlobal(
                    senderNomor,
                    2
                )
            }
        }

    } catch (e) {
        // =========================
        // ERROR LOG
        // =========================
        console.error(
            '[fakeffduo-error]',
            e?.message || e
        )

        // Support admin logger global
        try {
            if (
                typeof global.sendAdminLog === 'function'
            ) {
                const senderNomor = String(m.sender || '')
                    .replace(/[^0-9]/g, '')

                await global.sendAdminLog(
                    conn,
                    'fakeffduo',
                    senderNomor,
                    e
                )
            }
        } catch (logError) {
            console.error(
                '[fakeffduo-admin-log]',
                logError?.message || logError
            )
        }

        return m.reply(`✎ *Fake FF Duo*

Kyaa~ fake FF Duo-nya error (ToT)
Coba lagi nanti ya~ ✿`)
    }
}

handler.help = [
    'fakeffduo <nama1|nama2>',
    'fakefreefirduo <nama1|nama2>'
]

handler.tags = ['maker']

handler.command = [
    'fakeffduo',
    'fakefreefirduo'
]

export default handler