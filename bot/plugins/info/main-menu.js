/*
 * USANAGI UMI AI — Main Menu
 * Type: Plugin ESM
 */

import moment from 'moment-timezone'
import * as levelling from '../../lib/levelling.js'
import fs from 'fs'
import os from 'os'
import sharp from 'sharp'
import { prepareWAMessageMedia } from '@rexxhayanasi/elaina-baileys'
import * as translator from '../../lib/translator.js'

// ============================================================
// TRANSLATOR SAFE IMPORT
// ============================================================

const getChatLanguage = translator.getChatLanguage || (() => 'id')
const autoTranslate = translator.autoTranslate || (async text => text)

// ============================================================
// CONSTANTS
// ============================================================

const botName = () => String(global.namebot || 'USANAGI UMI AI')
const BOT_AUTHOR = 'AlzRiss × Arena'

const THUMB_PATH = './media/menu.png'
const AUDIO_PATH = './assets/audio/menu.mp3'

const previewUrl = () => global.links?.websiteUrl || global.scriptUrl || ''

const COOLDOWN_MS = 0
const CACHE_REFRESH_MS = 60_000

const cooldown = new Map()
const menuCache = new Map()

// ============================================================
// FAKE QUOTED (Contact Card)
// ============================================================

function getFakeQuoted() {
    return {
        key: {
            fromMe: false,
            participant: '0@s.whatsapp.net',
            remoteJid: 'status@broadcast'
        },
        message: {
            contactMessage: {
                displayName: `𖤛 ${botName()}`,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;AlzRiss,;;;\nFN:Usanagi Umi AI\nitem1.TEL;waid=13135550002:+1 (313) 555-0002\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
                sendEphemeral: true
            }
        }
    }
}

// Helper: build contextInfo dari fakeQuoted
function buildFakeContextInfo() {
    const fakeQ = getFakeQuoted()
    return {
        mentionedJid: [],
        groupMentions: [],
        statusAttributions: [],
        pairedMediaType: 0,
        participant: fakeQ.key.participant,
        remoteJid: fakeQ.key.remoteJid,
        stanzaId: '',
        quotedMessage: fakeQ.message
    }
}

// ============================================================
// AUTO TRANSLATE
// ============================================================

async function tr(text, lang = 'id') {
    if (!text || lang === 'id') return text

    try {
        return await autoTranslate(String(text), lang)
    } catch (e) {
        console.error('[menu] translate error:', e)
        return text
    }
}

async function trTag(tag = '', lang = 'id') {
    return await tr(formatTag(tag), lang)
}

// ============================================================
// FONT HELPERS
// ============================================================

function fontBold(str) {
    return [...String(str)].map(c => {
        const n = c.codePointAt(0)

        if (n >= 65 && n <= 90)
            return String.fromCodePoint(0x1D400 + n - 65)

        if (n >= 97 && n <= 122)
            return String.fromCodePoint(0x1D41A + n - 97)

        if (n >= 48 && n <= 57)
            return String.fromCodePoint(0x1D7CE + n - 48)

        return c
    }).join('')
}

function fontSmallCaps(str) {
    const map = {
        a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ꜰ', g: 'ɢ', h: 'ʜ',
        i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ', n: 'ɴ', o: 'ᴏ', p: 'ᴘ',
        q: 'ǫ', r: 'ʀ', s: 'ꜱ', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x',
        y: 'ʏ', z: 'ᴢ'
    }

    return [...String(str).toLowerCase()]
        .map(c => map[c] || c)
        .join('')
}

function fontItalic(str) {
    return [...String(str)].map(c => {
        const n = c.codePointAt(0)

        if (n >= 65 && n <= 90)
            return String.fromCodePoint(0x1D608 + n - 65)

        if (n >= 97 && n <= 122)
            return String.fromCodePoint(0x1D622 + n - 97)

        return c
    }).join('')
}

// ============================================================
// UTILS
// ============================================================

function formatBytes(bytes = 0) {
    if (!bytes) return '0 B'

    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))

    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

function runtime() {
    const s = process.uptime()

    const d = Math.floor(s / 86400)
    const h = Math.floor((s % 86400) / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = Math.floor(s % 60)

    return [
        d && `${d}d`,
        h && `${h}h`,
        m && `${m}m`,
        `${sec}s`
    ].filter(Boolean).join(' ')
}

function ucapan() {
    const h = moment.tz('Asia/Jakarta').hour()

    if (h < 4) return 'Good Night'
    if (h < 11) return 'Good Morning'
    if (h < 15) return 'Good Afternoon'
    if (h < 18) return 'Good Evening'

    return 'Good Night'
}

function randomQuote() {
    const quotes = [
        'Waku waku! ✨',
        'AlzRiss is here! ♡',
        'Mission complete! ✧',
        'Stay curious, ne~',
        'Everything is possible!',
        'Ready for next command~',
        'System running normally ♡',
        'Okaeri, welcome back!'
    ]

    return quotes[Math.floor(Math.random() * quotes.length)]
}

function randomKaomoji() {
    const list = [
        '(´｡• ᵕ •｡`)',
        '(◕‿◕)',
        '(๑>ᴗ<๑)',
        '(≧▽≦)',
        '(｡•̀ᴗ-)✧',
        '(◍•ᴗ•◍)',
        '( ˶ˆᗜˆ˵ )',
        '(★ω★)',
        '(*´▽`*)',
        '(っ˘ω˘ς)'
    ]

    return list[Math.floor(Math.random() * list.length)]
}

function formatTag(tag = '') {
    return String(tag)
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, v => v.toUpperCase())
}

function getBadge(item = {}) {
    const b = []

    if (item.limit) b.push('ʟ')
    if (item.premium) b.push('ᴘ')
    if (item.owner) b.push('ᴏ')
    if (item.admin) b.push('ᴀ')

    return b.length ? ` [${b.join('')}]` : ''
}

function progressBar(percent = 0, style = 1) {
    percent = Math.max(0, Math.min(100, percent))

    const total = 8
    const full = Math.round((percent / 100) * total)
    const empty = total - full

    const map = {
        1: ['▰', '▱'],
        2: ['♡', '♢'],
        3: ['✿', '✧'],
        4: ['★', '☆'],
        5: ['❚', '❘']
    }

    const [f, e] = map[style] || map[1]

    return f.repeat(full) + e.repeat(empty)
}

function systemInfo() {
    const mem = process.memoryUsage()

    return {
        ram: formatBytes(mem.rss),
        heap: formatBytes(mem.heapUsed),
        platform: os.platform(),
        node: process.version.replace('v', ''),
        cpu: (os.cpus()[0]?.model || '-').slice(0, 30)
    }
}

// ============================================================
// THUMBNAIL
// ============================================================

async function getThumbnail(input) {
    try {
        if (input && Buffer.isBuffer(input)) {
            return await sharp(input)
                .resize(300, 300, { fit: 'cover' })
                .jpeg({ quality: 80 })
                .toBuffer()
        }

        if (input && typeof input === 'string' && fs.existsSync(input)) {
            const buf = fs.readFileSync(input)

            return await sharp(buf)
                .resize(300, 300, { fit: 'cover' })
                .jpeg({ quality: 80 })
                .toBuffer()
        }

        if (fs.existsSync(THUMB_PATH))
            return fs.readFileSync(THUMB_PATH)

        console.warn('[menu] Thumbnail tidak ditemukan:', THUMB_PATH)

        return Buffer.alloc(0)
    } catch (e) {
        console.error('[menu] thumbnail error:', e)
        return Buffer.alloc(0)
    }
}

async function getLocalThumb(path = THUMB_PATH) {
    try {
        if (!fs.existsSync(path)) {
            console.warn('[menu] Local thumbnail tidak ditemukan:', path)
            return Buffer.alloc(0)
        }

        const buf = fs.readFileSync(path)

        return await sharp(buf)
            .resize(1280, 720, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 90 })
            .toBuffer()
    } catch (e) {
        console.error('[menu] local thumb error:', e)
        return Buffer.alloc(0)
    }
}

async function createHighQualityThumbnail(conn, thumb) {
    try {
        if (!thumb?.length) return null

        const { imageMessage } = await prepareWAMessageMedia(
            { image: thumb },
            {
                upload: conn.waUploadToServer,
                mediaTypeOverride: 'thumbnail-link'
            }
        )

        if (!imageMessage) return null

        imageMessage.width = 1280
        imageMessage.height = 720

        return imageMessage
    } catch (e) {
        console.error('[menu] HQ Thumb Error:', e)
        return null
    }
}

// ============================================================
// PLUGIN CACHE
// ============================================================

function buildPluginCache() {
    if (menuCache.has('plugins'))
        return menuCache.get('plugins')

    const plugins = Object.values(global.plugins || {})
        .filter(p => !p.disabled)

    const categories = {}

    for (const plugin of plugins) {
        const help = Array.isArray(plugin.help)
            ? plugin.help
            : plugin.help
                ? [plugin.help]
                : []

        const tags = Array.isArray(plugin.tags)
            ? plugin.tags
            : plugin.tags
                ? [plugin.tags]
                : []

        for (const tag of tags) {
            if (!tag) continue

            if (!categories[tag])
                categories[tag] = []

            categories[tag].push({
                help,
                limit: !!plugin.limit,
                premium: !!plugin.premium,
                owner: !!plugin.owner,
                admin: !!plugin.admin,
                prefix: !!plugin.customPrefix
            })
        }
    }

    menuCache.set('plugins', {
        plugins,
        categories
    })

    return menuCache.get('plugins')
}

// ============================================================
// STYLE 1 — ALZRISS PREMIUM (contextInfo fake quoted)
// ============================================================

async function sendStyle1(
    conn,
    m,
    {
        d,
        sys,
        thumb,
        categories,
        categoryList,
        usedPrefix,
        command
    }
) {
    const lang = getChatLanguage(m.chat)

    let jpegThumbB64 = null

    try {
        const smallBuf = await sharp(thumb)
            .resize(300, 200, { fit: 'cover' })
            .jpeg({ quality: 60 })
            .toBuffer()

        jpegThumbB64 = smallBuf.toString('base64')
    } catch (e) {
        console.error('[menu] thumb b64 error:', e)
    }

    let imageMessage = null

    try {
        const uploaded = await prepareWAMessageMedia(
            { image: thumb },
            {
                upload: conn.waUploadToServer
            }
        )

        imageMessage = uploaded.imageMessage

        if (imageMessage) {
            if (jpegThumbB64)
                imageMessage.jpegThumbnail = Buffer.from(jpegThumbB64, 'base64')

            imageMessage.width = 1280
            imageMessage.height = 720

            if (!imageMessage.mimetype)
                imageMessage.mimetype = 'image/jpeg'
        }
    } catch (e) {
        console.error('[menu] upload image error:', e)
    }

    const rows = await Promise.all(
        categoryList.map(async tag => {
            const count = categories[tag]
                .reduce((a, b) => a + b.help.length, 0)

            const tagName = await trTag(tag, lang)
            const description = await tr(
                `${count} perintah tersedia`,
                lang
            )

            return {
                header: botName(),
                title: `✦ ${tagName}`,
                description,
                id: `${usedPrefix + command} ${tag}`
            }
        })
    )

    const greeting = await tr(d.greeting, lang)
    const userProfile = await tr('ᴜꜱᴇʀ ᴘʀᴏꜰɪʟᴇ', lang)
    const roleText = await tr('Role', lang)
    const levelText = await tr('Level', lang)
    const limitText = await tr('Limit', lang)

    const botSystem = await tr('ʙᴏᴛ ꜱʏꜱᴛᴇᴍ', lang)
    const uptimeText = await tr('Uptime', lang)
    const ramText = await tr('RAM', lang)
    const cmdsText = await tr('Cmds', lang)
    const progressText = await tr('ᴘʀᴏɢʀᴇꜱꜱ', lang)
    const quote = await tr(d.quote, lang)

    const bodyText = [
        `✧ *${botName()}* ✧`,
        `━━━━━━━━━━━━━━━━━`,
        ``,
        `   ☾ *${greeting},* ${d.user}`,
        `       ${fontItalic(randomKaomoji())}`,
        ``,
        `   ▸ *${userProfile}*`,
        `      ⊹ ${roleText.padEnd(6)} › ${d.role}`,
        `      ⊹ ${levelText.padEnd(6)} › ${d.level}`,
        `      ⊹ ${limitText.padEnd(6)} › ${d.limit}`,
        ``,
        `   ▸ *${botSystem}*`,
        `      ⊹ ${uptimeText.padEnd(6)} › ${d.runtime}`,
        `      ⊹ ${ramText.padEnd(6)} › ${sys.ram}`,
        `      ⊹ ${cmdsText.padEnd(6)} › ${d.commands}`,
        ``,
        `   ▸ *${progressText}*`,
        `      ${d.progress}  ${d.percent}%`,
        ``,
        `━━━━━━━━━━━━━━━━━`,
        `   ❝ _*${quote}*_ ❞`
    ].join('\n')

    const selectTitle = await tr(
        '✦ ᴘɪʟɪʜ ᴋᴀᴛᴇɢᴏʀɪ',
        lang
    )

    const categoryTitle = await tr(
        `✧ ᴋᴀᴛᴇɢᴏʀɪ (${categoryList.length})`,
        lang
    )

    const allText = await tr(
        '▤ ᴛᴀᴍᴘɪʟᴋᴀɴ sᴇᴍᴜᴀ',
        lang
    )

    const thanksText = await tr(
        '♡ ᴛʜᴀɴᴋꜱ ᴛᴏ',
        lang
    )

    const ownerText = await tr(
        '⟡ ᴏᴡɴᴇʀ',
        lang
    )

    const officialGroup = await tr(
        '⬡ ᴏꜰꜰɪᴄɪᴀʟ ɢʀᴏᴜᴘ',
        lang
    )

    const channelBot = await tr(
        '⬢ ᴄʜᴀɴɴᴇʟ ʙᴏᴛ',
        lang
    )

    const buttons = [
        {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
                title: selectTitle,
                sections: [
                    {
                        title: categoryTitle,
                        rows
                    }
                ]
            })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: allText,
                id: `${usedPrefix}allmenu`
            })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: thanksText,
                id: `${usedPrefix}tqto`
            })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: ownerText,
                id: `${usedPrefix}owner`
            })
        },
        {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
                display_text: officialGroup,
                url: global.links?.groupUrl || '',
                merchant_url: global.links?.groupUrl || '',
                webview_interaction: true
            })
        },
        {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
                display_text: channelBot,
                url: global.links?.channelUrl || '',
                merchant_url: global.links?.channelUrl || '',
                webview_interaction: true
            })
        }
    ]

    const dashboardText = await tr(
        'Dashboard',
        lang
    )

    const openMenuText = await tr(
        'Buka Menu',
        lang
    )

    const messageParamsJson = JSON.stringify({
        limited_time_offer: {
            text: dashboardText,
            url: global.links?.groupUrl || '',
            copy_code: 'ALZRISS-MD',
            expiration_time: Date.now() + 86400000
        },
        bottom_sheet: {
            in_thread_buttons_limit: 1,
            divider_indices: [0, 1, 2, 3, 4, 5],
            list_title: botName(),
            button_title: openMenuText
        }
    })

    const header = imageMessage
        ? {
            imageMessage,
            hasMediaAttachment: true
        }
        : {
            title: botName(),
            hasMediaAttachment: false
        }

    const interactiveMessage = {
        header,
        body: {
            text: bodyText
        },
        footer: {
            text: `✧ ${botName()} ✦ Multi Device ✧`
        },
        nativeFlowMessage: {
            buttons,
            messageParamsJson
        },
        contextInfo: buildFakeContextInfo()
    }

    return conn.relayMessage(
        m.chat,
        { interactiveMessage },
        { messageId: null }
    )
}

// ============================================================
// STYLE 2 — ALZRISS KAWAII (sendMessage + quoted)
// ============================================================

async function sendStyle2(
    conn,
    m,
    {
        d,
        thumb,
        categories,
        categoryList,
        usedPrefix,
        command
    }
) {
    const lang = getChatLanguage(m.chat)

    const rows = await Promise.all(
        categoryList.map(async tag => {
            const total = categories[tag]
                .reduce((a, b) => a + b.help.length, 0)

            const tagName = await trTag(tag, lang)

            const unitText = await tr(
                `${total} perintah ♡`,
                lang
            )

            return {
                title: `♡ ${tagName}`,
                description: unitText,
                id: `${usedPrefix + command} ${tag}`
            }
        })
    )

    const hello = await tr('Hello', lang)
    const role = await tr('Role', lang)
    const level = await tr('Level', lang)
    const limit = await tr('Limit', lang)
    const cmds = await tr('Cmds', lang)
    const uptime = await tr('Uptime', lang)
    const memory = await tr('Memory', lang)

    const openModules = await tr(
        '♡ ᴏᴘᴇɴ ᴍᴏᴅᴜʟᴇꜱ ♡',
        lang
    )

    const quote = await tr(d.quote, lang)
    const kaomoji = randomKaomoji()

    const caption = [
        `      ｡ﾟ ✿ ᴀ ɴ ʏ ᴀ  ᴍ ᴅ ✿ ﾟ｡`,
        `     ˚₊· ─────────────── ·₊˚`,
        ``,
        `        ♡ ${hello}, ${d.user} ♡`,
        `             ${kaomoji}`,
        ``,
        `   ✿ ${fontSmallCaps('ᴜꜱᴇʀ ᴘʀᴏꜰɪʟᴇ')} ✿`,
        `      ❀ ${role.padEnd(6)} → ${d.role}`,
        `      ❀ ${level.padEnd(6)} → ${d.level}`,
        `      ❀ ${limit.padEnd(6)} → ${d.limit}`,
        ``,
        `   ✿ ${fontSmallCaps('ʙᴏᴛ ꜱʏꜱᴛᴇᴍ')} ✿`,
        `      ❀ ${uptime.padEnd(6)} → ${d.runtime}`,
        `      ❀ ${memory.padEnd(6)} → ${d.percent}%`,
        `      ❀ ${cmds.padEnd(6)} → ${d.commands}`,
        ``,
        `   ✿ ${fontSmallCaps('ᴘʀᴏɢʀᴇꜱꜱ')} ✿`,
        `      ✩ ${d.progress} ${d.percent}% ✩`,
        ``,
        `     ⋆｡°✩ ${fontItalic(quote)} ✩°｡⋆`,
        `     ˚₊· ─────────────── ·₊˚`
    ].join('\n')

    return conn.sendMessage(
        m.chat,
        {
            image: thumb,
            caption,
            footer: `♡ ${botName()} ✿ AlzRiss Kawaii ♡`,
            buttons: [
                {
                    text: openModules,
                    sections: [
                        {
                            title: `✿ ᴍᴏᴅᴜʟᴇꜱ ✿`,
                            rows
                        }
                    ]
                }
            ]
        },
        {
            quoted: getFakeQuoted()
        }
    )
}

// ============================================================
// STYLE 3 — ALZRISS SAKURA (matched-link preview + order message)
// ============================================================

async function sendStyle3(
    conn,
    m,
    {
        d,
        sys,
        categories,
        categoryList
    }
) {
    const lang = getChatLanguage(m.chat)

    const modules = (
        await Promise.all(
            categoryList.map(async tag => {
                const total = categories[tag]
                    .reduce((a, b) => a + b.help.length, 0)

                const tagName = await trTag(
                    formatTag(tag),
                    lang
                )

                return `       ❀ ${fontSmallCaps(tagName)} ⋯ ${total}`
            })
        )
    ).join('\n')

    const greeting = await tr(d.greeting, lang)
    const profile = await tr('ᴘʀᴏꜰɪʟᴇ', lang)
    const rank = await tr('Rank', lang)
    const level = await tr('Level', lang)
    const limit = await tr('Limit', lang)
    const system = await tr('ꜱʏꜱᴛᴇᴍ', lang)
    const uptime = await tr('Uptime', lang)
    const memory = await tr('Memory', lang)
    const cmds = await tr('Cmds', lang)
    const progress = await tr('ᴘʀᴏɢʀᴇꜱꜱ', lang)
    const modulesText = await tr('ᴍᴏᴅᴜʟᴇꜱ', lang)
    const quote = await tr(d.quote, lang)

    const caption = [
        `      ｡ﾟ ❀ ᴀ ɴ ʏ ᴀ  ᴍ ᴅ ❀ ﾟ｡`,
        `      ──────────────`,
        ``,
        `   🌸 ${greeting}, ${d.user}`,
        `      ${fontItalic(randomKaomoji())}`,
        ``,
        `   ❀ ${profile}`,
        `      · ${rank.padEnd(6)} › ${d.role}`,
        `      · ${level.padEnd(6)} › ${d.level}`,
        `      · ${limit.padEnd(6)} › ${d.limit}`,
        ``,
        `   ❀ ${system}`,
        `      · ${uptime.padEnd(6)} › ${d.runtime}`,
        `      · ${memory.padEnd(6)} › ${sys.ram}`,
        `      · ${cmds.padEnd(6)} › ${d.commands}`,
        ``,
        `   ❀ ${progress}`,
        `      ✿ ${d.progress} ${d.percent}%`,
        ``,
        `   ❀ ${modulesText}`,
        modules,
        ``,
        `      ⋆｡°✩ ${fontItalic(quote)} ✩°｡⋆`
    ].join('\n')

    const thumb = await getLocalThumb()
    const highQualityThumbnail =
        await createHighQualityThumbnail(conn, thumb)

    const urlB = previewUrl()
    const invisible = '\u200B'.repeat(400)

    const hlmn = {
        key: {
            participant: '0@s.whatsapp.net'
        },
        message: {
            orderMessage: {
                itemCount: 99999999,
                surface: 99999999,
                message: 'Usanagi Umi AI waku waku ✨',
                orderTitle: 'Usanagi Umi AI',
                thumbnail: thumb,
                sellerJid: '0@s.whatsapp.net'
            }
        }
    }

    return conn.sendMessage(
        m.chat,
        {
            text: `${urlB}${invisible}\n\n${caption}`,
            linkPreview: {
                'matched-text': urlB,
                matchedText: urlB,
                canonicalUrl: urlB,
                title: '❀ USANAGI UMI AI ❀',
                description: 'Soft Edition • Cherry Blossom 🌸',
                previewType: 0,
                jpegThumbnail: thumb,
                highQualityThumbnail,
                thumbnailUrl: urlB,
                linkPreviewMetadata: {
                    linkMediaDuration: 0,
                    socialMediaPostType: 4
                }
            },
            favicon: {
                url: urlB
            }
        },
        {
            quoted: hlmn
        }
    )
}

// ============================================================
// STYLE 4 — ALZRISS COSMOS
// ============================================================

async function sendStyle4(
    conn,
    m,
    {
        d,
        sys,
        usedPrefix
    }
) {
    const lang = getChatLanguage(m.chat)

    // ── Ambil thumbnail + convert ke base64 ──
    let thumb4 = null
    try {
        const rawThumb = await getThumbnail()

        if (rawThumb?.length) {
            const smallThumb = await sharp(rawThumb)
                // Resize diubah ke rasio landscape 16:9 agar tidak memakan layar
                .resize(300, 169, { fit: 'cover' }) 
                .jpeg({ quality: 70 })
                .toBuffer()

            thumb4 = smallThumb.toString('base64')
        }
    } catch (e) {
        console.error('[menu] style4 thumb error:', e)
    }

    const mode =
        global.opts && global.opts.self
            ? 'SELF'
            : 'PUBLIC'

    const ping =
        Math.floor(Math.random() * 20) + 5

    const userText = await tr('User', lang)
    const modeText = await tr('Mode', lang)
    const pingText = await tr('Ping', lang)
    const roleText = await tr('Role', lang)
    const uptimeText = await tr('Uptime', lang)
    const memoryText = await tr('Memory', lang)
    const cmdsText = await tr('Cmds', lang)
    const quote = await tr(d.quote, lang)

    const contentText = [
        `       ✩  ᴀ ɴ ʏ ᴀ  ᴄ ᴏ ꜱ ᴍ ᴏ ꜱ  ✩`,
        `      ⋆ ─────────────── ⋆`,
        ``,
        `        ♡ ${d.user} ♡`,
        `           ${randomKaomoji()}`,
        ``,
        `   ✧ ${fontSmallCaps(userText)}     ›${d.user}`,
        `   ✧ ${fontSmallCaps(modeText)}     ›${mode}`,
        `   ✧ ${fontSmallCaps(pingText)}     ›${ping}ms`,
        `   ✧ ${fontSmallCaps(roleText)}     ›${d.role}`,
        ``,
        `   ✧ ${fontSmallCaps(uptimeText)}   ›${d.runtime}`,
        `   ✧ ${fontSmallCaps(memoryText)}   ›${sys.ram}`,
        `   ✧ ${fontSmallCaps(cmdsText)}     ›${d.commands}`,
        ``,
        `   ⟨ ${d.progress} ⟩${d.percent}%`,
        ``,
        `      ⋆｡°✩ ${fontItalic(quote)} ✩°｡⋆`,
        `      ⋆ ─────────────── ⋆`
    ].join('\n')

    const menuButton = await tr(
        '✩ ᴍᴇɴᴜ',
        lang
    )

    const pingButton = await tr(
        '✦ ᴘɪɴɢ',
        lang
    )

    const ownerButton = await tr(
        '♡ ᴏᴡɴᴇʀ',
        lang
    )

    // ── Build buttonsMessage ──
    const buttonsMessage = {
        locationMessage: {
            degreesLatitude: 0,
            degreesLongitude: 0,
            name: botName(),
            address:
                global.creditOwnersText ||
                global.ownerName ||
                BOT_AUTHOR,
            jpegThumbnail: thumb4
        },
        contentText,
        footerText:
            `✩ ${botName()} ⋆ Cosmos ♡`,
        buttons: [
            {
                buttonId:
                    `${usedPrefix}allmenu`,
                buttonText: {
                    displayText: menuButton
                },
                type: 1
            },
            {
                buttonId:
                    `${usedPrefix}ping`,
                buttonText: {
                    displayText: pingButton
                },
                type: 1
            },
            {
                buttonId:
                    `${usedPrefix}owner`,
                buttonText: {
                    displayText: ownerButton
                },
                type: 1
            }
        ],
        headerType: 6
    }

    return conn.relayMessage(
        m.chat,
        { buttonsMessage },
        { messageId: null }
    )
}


// ============================================================
// DETAIL MENU — untuk .menu <kategori> atau .menu all
// ============================================================

async function sendDetail(
    conn,
    m,
    {
        d,
        categories,
        showTags,
        usedPrefix
    }
) {
    const lang = getChatLanguage(m.chat)

    const rankText = await tr('Rank', lang)
    const levelText = await tr('Level', lang)
    const limitText = await tr('Limit', lang)

    let text = [
        `      ｡ﾟ ✿ *${botName()}* ✿ ﾟ｡`,
        `     ˚₊· ───────────── ·₊˚`,
        ``,
        `   ♡ ${d.user} ♡`,
        `      ${randomKaomoji()}`,
        ``,
        `   ❀ ${rankText.padEnd(6)} › ${d.role}`,
        `   ❀ ${levelText.padEnd(6)} › ${d.level}`,
        `   ❀ ${limitText.padEnd(6)} › ${d.limit}`
    ].join('\n')

    for (const tag of showTags) {
        const menus = categories[tag]
        const total = menus.reduce(
            (sum, item) => sum + item.help.length,
            0
        )

        const categoryName = await trTag(
            formatTag(tag),
            lang
        )

        text += '\n\n'
        text += `   ✿ *${categoryName.toUpperCase()}* ⋯ ${total}\n`
        text += `   ───────────────\n`

        for (const item of menus) {
            for (const cmd of item.help) {
                // help bisa berisi placeholder {prefix}; ganti dengan prefix aktif chat.
                const bareCommand = String(cmd).split('{prefix}').join('').replace(/^[./#!$&+~^-]/, '')
                const shifted = item.prefix ? (String(cmd).split('{prefix}').join(usedPrefix)) : `${usedPrefix}${bareCommand}`
                text += `     ♡ ${shifted}${getBadge(item)}\n`
            }
        }
    }

    const detailMenuText = await tr(
        `Detail Menu • ${showTags.length} kategori ✨`,
        lang
    )

    const detailDescription = await tr(
        `Detail Menu • ${showTags.length} kategori`,
        lang
    )

    const quote = await tr(d.quote, lang)

    text += '\n\n'
    text += `     ⋆｡°✩ ${fontItalic(quote)} ✩°｡⋆`

    const thumb = await getLocalThumb()
    const highQualityThumbnail =
        await createHighQualityThumbnail(conn, thumb)

    const urlB = previewUrl()
    const invisible = '\u200B'.repeat(400)

    const hlmn = {
        key: {
            participant: '0@s.whatsapp.net'
        },
        message: {
            orderMessage: {
                itemCount: 99999999,
                surface: 99999999,
                message: detailMenuText,
                orderTitle: botName(),
                thumbnail: thumb,
                sellerJid: '0@s.whatsapp.net'
            }
        }
    }

    return conn.sendMessage(
        m.chat,
        {
            text: `${urlB}${invisible}\n\n${text}`,
            linkPreview: {
                'matched-text': urlB,
                matchedText: urlB,
                canonicalUrl: urlB,
                title: `❀ ${botName()} ❀`,
                description: detailDescription,
                previewType: 0,
                jpegThumbnail: thumb,
                highQualityThumbnail,
                thumbnailUrl: urlB,
                linkPreviewMetadata: {
                    linkMediaDuration: 0,
                    socialMediaPostType: 4
                }
            },
            favicon: {
                url: urlB
            }
        },
        {
            quoted: hlmn
        }
    )
}

// ============================================================
// HANDLER
// ============================================================

let handler = async (
    m,
    {
        conn,
        usedPrefix,
        command,
        text,
        isOwner
    }
) => {
    if (!global.db)
        global.db = { data: {} }

    const db = global.db.data

    if (!db.users)
        db.users = {}

    if (!db.settings)
        db.settings = {}

    if (!db.users[m.sender])
        db.users[m.sender] = {}

    if (!db.settings[conn.user.jid]) {
        db.settings[conn.user.jid] = {
            setmenu: 1
        }
    }

    const user = db.users[m.sender]
    const setting = db.settings[conn.user.jid]

    const menuStyle =
        Number(setting.setmenu || 1)

    const menuType =
        (text || '').trim().toLowerCase() ||
        'list'

    const {
        level = 0,
        exp = 0,
        role = 'Beginner',
        limit = 0,
        premiumTime = 0
    } = user

    const name =
        await conn.getName(m.sender)

    const {
        plugins,
        categories
    } = buildPluginCache()

    const categoryList =
        Object.keys(categories).sort()

    const totalCommands =
        plugins.reduce((a, p) => {
            if (!p.help) return a

            return a +
                (
                    Array.isArray(p.help)
                        ? p.help.length
                        : 1
                )
        }, 0)

    const xp =
        levelling.xpRange(level)

    const percent =
        Math.min(
            100,
            Math.floor(
                (exp /
                    Math.max(xp.max, 1)
                ) * 100
            )
        )

    const totalUsers =
        global.db?.data?.users
            ? Object.keys(
                global.db.data.users
            ).length
            : 0

    const totalChats =
        global.db?.data?.chats
            ? Object.keys(
                global.db.data.chats
            ).length
            : 0

    const d = {
        greeting: ucapan(),
        user: name,
        role,
        level,
        limit:
            isOwner || premiumTime > 0
                ? '∞'
                : String(limit),
        runtime: runtime(),
        commands: totalCommands,
        categories: categoryList.length,
        progress:
            progressBar(
                percent,
                menuStyle
            ),
        percent,
        quote: randomQuote(),
        totalUsers,
        totalChats
    }

    const sys = systemInfo()
    const thumb = await getThumbnail()

    const ctx = {
        d,
        sys,
        thumb,
        categories,
        categoryList,
        usedPrefix,
        command
    }

    let menuResult = null

    try {
        if (menuType === 'list') {
            if (menuStyle === 1)
                menuResult =
                    await sendStyle1(
                        conn,
                        m,
                        ctx
                    )
            else if (menuStyle === 2)
                menuResult =
                    await sendStyle2(
                        conn,
                        m,
                        ctx
                    )
            else if (menuStyle === 3)
                menuResult =
                    await sendStyle3(
                        conn,
                        m,
                        ctx
                    )
            else if (menuStyle === 4)
                menuResult =
                    await sendStyle4(
                        conn,
                        m,
                        ctx
                    )
            else
                menuResult =
                    await sendStyle1(
                        conn,
                        m,
                        ctx
                    )
        } else {
            const showTags =
                menuType === 'all'
                    ? categoryList
                    : categories[menuType]
                        ? [menuType]
                        : []

            if (!showTags.length) {
                const lang =
                    getChatLanguage(
                        m.chat
                    )

                const notFound =
                    await tr(
                        `❌ Menu ${text} tidak ditemukan.`,
                        lang
                    )

                return m.reply(notFound)
            }

            menuResult =
                await sendDetail(
                    conn,
                    m,
                    {
                        ...ctx,
                        showTags
                    }
                )
        }
    } catch (e) {
        console.error(
            '[menu] render error:',
            e
        )

        const lang =
            getChatLanguage(m.chat)

        const errorText =
            await tr(
                `❌ Menu error: ${e.message}`,
                lang
            )

        return m.reply(errorText)
    }

    return menuResult
}

// ============================================================
// CACHE REFRESH
// ============================================================

setInterval(() => {
    try {
        menuCache.clear()
    } catch {}
}, CACHE_REFRESH_MS)

// ============================================================
// HANDLER META
// ============================================================

// /menu memakai renderer utama Usanagi yang membangun kategori langsung dari
// plugin aktif. Renderer lama tetap tersedia melalui /help dan /perintah.
handler.help = [
    'help',
    'perintah'
]

handler.tags = ['main']

handler.command =
    /^(help|perintah)$/i

export default handler