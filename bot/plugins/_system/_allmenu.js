/*
📌 All Menu — AlzRiss Theme
🏷️ Type: Plugin ESM
*/

import { promises as fsPromises } from 'fs'
import fs from 'fs'
import path from 'path'
import os, { tmpdir } from 'os'
import moment from 'moment-timezone'
import { exec as _exec } from 'child_process'
import { promisify } from 'util'
import * as translator from '../../lib/translator.js'
import { readMenuMedia } from '../../lib/menu-media.js'

const exec = promisify(_exec)

const {
    generateWAMessageFromContent,
    proto
} = (await import('@rexxhayanasi/elaina-baileys')).default || {}

// ============================================================
// TRANSLATOR SAFE IMPORT
// ============================================================

const getChatLanguage =
    translator.getChatLanguage ||
    (() => 'id')

const autoTranslate =
    translator.autoTranslate ||
    (async text => text)

// ============================================================
// AUTO TRANSLATE HELPER
// ============================================================

async function tr(text, lang = 'id') {
    if (!text || lang === 'id') return text

    try {
        return await autoTranslate(
            String(text),
            lang
        )
    } catch (e) {
        console.error(
            '[allmenu] translate error:',
            e
        )

        return text
    }
}

// ============================================================
// TRANSLATE MENU TEXT
// ============================================================

async function translateMenuText(
    text,
    lang = 'id'
) {
    if (!text || lang === 'id')
        return text

    const protectedParts = []

    const protect = value => {
        const id =
            `__ALZRISS_PROTECTED_${protectedParts.length}__`

        protectedParts.push(value)

        return id
    }

    let result = String(text)

    // Protect URLs
    result = result.replace(
        /https?:\/\/[^\s]+/gi,
        match => protect(match)
    )

    // Protect variables
    result = result.replace(
        /%[a-zA-Z_][a-zA-Z0-9_]*/g,
        match => protect(match)
    )

    // Protect WhatsApp JID
    result = result.replace(
        /[\w.-]+@\w+/g,
        match => protect(match)
    )

    // Protect commands
    result = result.replace(
        /(^|\s)([.!/#$%][a-zA-Z0-9_-]+)/g,
        (full, space, command) =>
            `${space}${protect(command)}`
    )

    // Protect command-related words
    result = result.replace(
        /(\b(?:cmd|command|help)\b)/gi,
        match => protect(match)
    )

    result = await tr(
        result,
        lang
    )

    // Restore protected parts
    for (
        let i = 0;
        i < protectedParts.length;
        i++
    ) {
        result = result.replace(
            new RegExp(
                `__ALZRISS_PROTECTED_${i}__`,
                'g'
            ),
            protectedParts[i]
        )
    }

    return result
}

// ============================================================
// AUDIO CONVERTER
// ============================================================

async function toPTT(filePath) {
    const id = Date.now()

    const input =
        path.join(
            tmpdir(),
            `${id}.mp3`
        )

    const output =
        path.join(
            tmpdir(),
            `${id}.ogg`
        )

    try {
        const buffer =
            await fsPromises.readFile(
                filePath
            )

        await fsPromises.writeFile(
            input,
            buffer
        )

        await exec(
            `ffmpeg -y -i "${input}" -vn -c:a libopus -b:a 128k "${output}"`
        )

        const result =
            await fsPromises.readFile(
                output
            )

        return result
    } finally {
        await fsPromises
            .unlink(input)
            .catch(() => {})

        await fsPromises
            .unlink(output)
            .catch(() => {})
    }
}

// ============================================================
// SMALLCAPS STYLE
// ============================================================

const Styles = (
    text,
    style = 1
) => {
    const xStr =
        'abcdefghijklmnopqrstuvwxyz1234567890'
            .split('')

    const yStr = Object.freeze({
        1:
            'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜᴠᴡxʏᴢ1234567890'
    })

    const replacer = []

    xStr.map((v, i) => {
        replacer.push({
            original: v,
            convert:
                yStr[style].split('')[i]
        })
    })

    const str =
        String(text)
            .toLowerCase()
            .split('')

    const output = []

    str.map(v => {
        const find =
            replacer.find(
                x =>
                    x.original === v
            )

        if (find)
            output.push(
                find.convert
            )
        else
            output.push(v)
    })

    return output.join('')
}

// ============================================================
// LOADING ALZRISS
// ============================================================

async function loadingAlzRiss(
    conn,
    m,
    lang = 'id'
) {
    const loadingTitle =
        await tr(
            '🌸 _Membangunkan AlzRiss..._',
            lang
        )

    const msg =
        await conn.sendMessage(
            m.chat,
            {
                text:
                    loadingTitle
            },
            {
                quoted: m
            }
        )

    const framesID = [
        {
            percent: 15,
            text:
                'mencari kacang...'
        },
        {
            percent: 35,
            text:
                'membaca pikiran user...'
        },
        {
            percent: 60,
            text:
                'mengumpulkan plugin...'
        },
        {
            percent: 85,
            text:
                'menyusun kategori...'
        },
        {
            percent: 100,
            text:
                'menu siap ditampilkan!'
        }
    ]

    for (const frame of framesID) {
        const frameText =
            await tr(
                frame.text,
                lang
            )

        const fill =
            Math.floor(
                frame.percent / 10
            )

        const bar =
            '■'.repeat(fill) +
            '□'.repeat(
                10 - fill
            )

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    400
                )
        )

        try {
            await conn.relayMessage(
                m.chat,
                {
                    protocolMessage: {
                        key: msg.key,
                        type: 14,
                        editedMessage: {
                            conversation:
                                `🌸 *AlzRiss Loading* [${bar}] ${frame.percent}%\n> _${frameText}_`
                        }
                    }
                },
                {}
            )
        } catch (e) {
            // Kalau versi Baileys tidak mendukung edit,
            // jangan sampai allmenu ikut crash.
            console.error(
                '[allmenu] loading edit error:',
                e.message
            )
        }
    }

    return msg
}

// ============================================================
// MENU VIDEO
// ============================================================

const websiteUrl = () =>
    global.links?.websiteUrl || global.scriptUrl || ''

// ============================================================
// MAIN HANDLER
// ============================================================

let handler = async (
    m,
    {
        conn,
        usedPrefix: _p
    }
) => {
    let tags = {}

    const lang =
        await getChatLanguage(
            m.chat
        )

    const defaultMenu = {
        before: `こんにちは、お姉さん %name 🌸

私は *%botname* — bot WhatsApp yang siap bantu apapun: cari data, buka plugin, dengerin cerita kamu.
乂  *S T A T I S T I C* 乂
╭── ︿︿︿︿︿ ︿︿︿︿︿ ︿︿︿︿︿
┊ ‹‹ *ɴᴀᴍᴇ* :: %name
┊•⁀➷ °... ᴡᴀᴋᴜ ᴡᴀᴋᴜ ...
╰─── ︶︶︶︶ ♡⃕  ⌇
 . ┊⿻ [ *ʀᴜɴᴛɪᴍᴇ* :: %muptime]
 . ┊⿻ [ *ᴘʀᴇғɪx* :: <%p>]
 . ┊⿻ [ *ᴅᴀᴛᴀʙᴀsᴇ* :: %totalreg]
 . ┊⿻ [ *ᴅᴀᴛᴇ* :: %date]
 . ┊⿻ [ *ᴘʟᴀᴛғᴏʀᴍ* :: %platform]
 . ┊⿻ [ *ʟɪʙʀᴀʀʏ* :: @rexxhayanasi/elaina-baileys]
 . ┊⿻ [ *ᴅᴇᴠᴇʟᴏᴘᴇʀ* :: AlzRiss × Arena]
 . ┊⿻ [ *ᴏᴡɴᴇʀ 𝟷* :: Okta]
 . ┊⿻ [ *ᴏᴡɴᴇʀ 𝟸* :: Risky]
 . ╰─────────╮

Ada error atau mau upgrade premium? Hubungi owner ya~ 🥜
%readmore
`.trimStart(),

        header:
            '❖━━━━━━[ *%category* ]━━━━━━❖\n╔═━───╍━╍╍┄',

        body:
            '╠➺ %cmd %islimit %isPremium',

        footer:
            '╚═─━╍╍━╍╾',

        after:
            `𝐔𝐬𝐚𝐧𝐚𝐠𝐢 𝐔𝐦𝐢 𝐀𝐈 ${global.version || 'v6.0'}`
    }

    try {
        // ====================================================
        // USER INFO
        // ====================================================

        let name =
            m.pushName ||
            await conn.getName(
                m.sender
            )

        let d =
            new Date(
                new Date()
                    .getTime() +
                3600000
            )

        const locale = 'id'

        let date =
            d.toLocaleDateString(
                locale,
                {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    timeZone:
                        'Asia/Jakarta'
                }
            )

        let time =
            d.toLocaleTimeString(
                locale,
                {
                    timeZone:
                        'Asia/Jakarta'
                }
            )

        time =
            time.replace(
                /[.]/g,
                ':'
            )

        // ====================================================
        // RUNTIME & UPTIME
        // ====================================================

        const _muptime =
            process.uptime() *
            1000

        const _uptime =
            os.uptime() *
            1000

        const totalreg =
            global.db?.data?.users
                ? Object.keys(
                    global.db.data.users
                ).length
                : 0

        const platform =
            os.platform()

        const muptime =
            clockString(
                _muptime
            )

        const uptime =
            clockString(
                _uptime
            )

        // ====================================================
        // GET ALL PLUGINS
        // ====================================================

        const help =
            Object.values(
                global.plugins || {}
            )
                .filter(
                    plugin =>
                        typeof plugin === 'function' &&
                        !plugin.disabled
                )
                .map(plugin => ({
                    help:
                        Array.isArray(
                            plugin.help
                        )
                            ? plugin.help
                            : plugin.help
                                ? [plugin.help]
                                : [],

                    tags:
                        Array.isArray(
                            plugin.tags
                        )
                            ? plugin.tags
                            : plugin.tags
                                ? [plugin.tags]
                                : [],

                    prefix:
                        'customPrefix'
                        in plugin,

                    limit:
                        !!plugin.limit,

                    premium:
                        !!plugin.premium,

                    enabled:
                        !plugin.disabled
                }))

        // ====================================================
        // COLLECT TAGS
        // ====================================================

        for (
            const plugin of help
        ) {
            if (
                !plugin ||
                !plugin.tags
            )
                continue

            for (
                const tag of plugin.tags
            ) {
                if (
                    !tag ||
                    tag in tags
                )
                    continue

                tags[tag] =
                    tag
            }
        }

        // ====================================================
        // MENU CONFIG
        // ====================================================

        conn.menu =
            conn.menu ||
            {}

        const before =
            conn.menu.before ||
            defaultMenu.before

        const header =
            conn.menu.header ||
            defaultMenu.header

        const body =
            conn.menu.body ||
            defaultMenu.body

        const footer =
            conn.menu.footer ||
            defaultMenu.footer

        const after =
            conn.menu.after ||
            defaultMenu.after

        // ====================================================
        // BUILD MENU
        // ====================================================

        const _text = [
            before,

            ...Object.keys(tags)
                .sort()
                .map(tag => {
                    const categoryHeader =
                        header.replace(
                            /%category/g,
                            String(
                                tags[tag]
                            ).toUpperCase()
                        )

                    const commands =
                        help
                            .filter(
                                menu =>
                                    menu.tags &&
                                    menu.tags.includes(
                                        tag
                                    ) &&
                                    menu.help?.length
                            )
                            .map(
                                menu =>
                                    menu.help
                                        .map(
                                            helpCommand =>
                                                body
                                                    .replace(
                                                        /%cmd/g,
                                                        menu.prefix
                                                            ? helpCommand
                                                            : '%p' +
                                                              helpCommand
                                                    )
                                                    .replace(
                                                        /%islimit/g,
                                                        menu.limit
                                                            ? '(Ⓛ)'
                                                            : ''
                                                    )
                                                    .replace(
                                                        /%isPremium/g,
                                                        menu.premium
                                                            ? '(Ⓟ)'
                                                            : ''
                                                    )
                                                    .trim()
                                        )
                                        .join('\n')
                            )

                    return [
                        categoryHeader,
                        commands.join('\n'),
                        footer
                    ].join('\n')
                }),

            after
        ].join('\n')

        let text =
            typeof conn.menu ===
            'string'
                ? conn.menu
                : typeof conn.menu ===
                  'object'
                    ? _text
                    : ''

        // ====================================================
        // REPLACE VARIABLES
        // ====================================================

        const replace = {
            '%': '%',
            p: _p,
            uptime,
            muptime,
            me:
                await conn.getName(
                    conn.user.jid
                ),
            name,
            date,
            time,
            platform,
            botname: String(global.namebot || 'Usanagi Umi AI'),
            _p,
            totalreg,
            readmore:
                readMore
        }

        const replaceKeys =
            Object.keys(replace)
                .sort(
                    (a, b) =>
                        b.length -
                        a.length
                )

        if (replaceKeys.length) {
            text =
                text.replace(
                    new RegExp(
                        `%(${replaceKeys.join(
                            '|'
                        )})`,
                        'g'
                    ),
                    (_, key) =>
                        String(
                            replace[key]
                        )
                )
        }

        // ====================================================
        // AUTO TRANSLATE
        // ====================================================

        text =
            await translateMenuText(
                text,
                lang
            )

        // ====================================================
        // LOADING
        // ====================================================

        await loadingAlzRiss(
            conn,
            m,
            lang
        )

        // ====================================================
        // VIDEO MENU
        // ====================================================

        // ====================================================
        // FAKE ORDER MESSAGE
        // ====================================================

        const orderMessageText =
            await tr(
                'Usanagi Umi AI waku waku ✨',
                lang
            )

        const orderTitle =
            await tr(
                'Usanagi Umi AI',
                lang
            )

        const hlmn = {
            key: {
                participant:
                    '0@s.whatsapp.net'
            },

            message: {
                orderMessage: {
                    itemCount:
                        99999999,

                    surface:
                        99999999,

                    message:
                        orderMessageText,

                    orderTitle:
                        orderTitle,

                    sellerJid:
                        '0@s.whatsapp.net'
                }
            }
        }

        const menuMedia = readMenuMedia(conn)
        await conn.sendMessage(
            m.chat,
            {
                ...(menuMedia.type === 'image'
                    ? { image: menuMedia.data, mimetype: menuMedia.mimetype }
                    : { video: menuMedia.data, mimetype: menuMedia.mimetype, gifPlayback: true }),
                caption: `${websiteUrl()}\n${Styles(text)}`,
                mentions: [m.sender]
            },
            {
                quoted: hlmn
            }
        )


    } catch (e) {
        console.error(
            '[allmenu] error:',
            e
        )

        const errorText =
            await tr(
                'Maaf, menu sedang error 🥲',
                lang
            )

        return conn.reply(
            m.chat,
            errorText,
            m
        )
    }
}

// ============================================================
// HANDLER META
// ============================================================

handler.command =
    /^(allmenu)$/i

handler.daftar =
    false

export default handler

// ============================================================
// READ MORE
// ============================================================

const more =
    String.fromCharCode(
        8206
    )

const readMore =
    more.repeat(4001)

// ============================================================
// CLOCK STRING
// ============================================================

function clockString(ms) {
    const h =
        isNaN(ms)
            ? '--'
            : Math.floor(
                ms / 3600000
            )

    const m =
        isNaN(ms)
            ? '--'
            : Math.floor(
                ms / 60000
            ) % 60

    const s =
        isNaN(ms)
            ? '--'
            : Math.floor(
                ms / 1000
            ) % 60

    return [
        h,
        m,
        s
    ]
        .map(v =>
            String(v)
                .padStart(2, '0')
        )
        .join(':')
}