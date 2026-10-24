// plugins/tools/crm2.js
// CRM2 / CRM2-SNIPP
// ESM Plugin - Usanagi Umi AI

import {
    generateWAMessageFromContent,
    jidNormalizedUser
} from '@rexxhayanasi/elaina-baileys'

let handler = async (m, {
    conn,
    isOwner,
    isPemilik,
    usedPrefix,
    command,
    args,
    sender
}) => {
    const sendReply = async text => {
        return conn.sendMessage(
            m.chat,
            { text: String(text) },
            { quoted: m }
        )
    }

    if (!isOwner && !isPemilik) {
        return sendReply(
            'Ehh ini khusus owner/pemilik aja lho~ 🌸 yamete kudasai (≧◡≦)'
        )
    }

    const rawQuoted =
        m.quoted?.message ||
        m.msg?.contextInfo?.quotedMessage ||
        m.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
        (m.quoted?.mtype
            ? { [m.quoted.mtype]: m.quoted }
            : null)

    if (!rawQuoted) {
        return sendReply(
            `❌ Reply pesan yang mau di-relay dulu, lalu ketik *${usedPrefix + command}*`
        )
    }

    function unwrap(content) {
        if (!content || typeof content !== 'object') {
            return content
        }

        if (content.ephemeralMessage?.message) {
            return unwrap(content.ephemeralMessage.message)
        }

        if (content.viewOnceMessage?.message) {
            return unwrap(content.viewOnceMessage.message)
        }

        if (content.viewOnceMessageV2?.message) {
            return unwrap(content.viewOnceMessageV2.message)
        }

        if (content.viewOnceMessageV2Extension?.message) {
            return unwrap(
                content.viewOnceMessageV2Extension.message
            )
        }

        if (content.documentWithCaptionMessage?.message) {
            return unwrap(
                content.documentWithCaptionMessage.message
            )
        }

        return content
    }

    function normalizeForRelay(rawContent) {
        const content = unwrap(rawContent)

        if (typeof content?.conversation === 'string') {
            const {
                conversation,
                ...rest
            } = content

            return {
                ...rest,
                extendedTextMessage: {
                    text: conversation
                }
            }
        }

        return content
    }

    function toJsLiteral(
        value,
        indent = 2,
        seen = new WeakSet(),
        depth = 0
    ) {
        if (value === null) return 'null'
        if (value === undefined) return 'undefined'

        if (typeof value === 'string') {
            return JSON.stringify(value)
        }

        if (
            typeof value === 'number' ||
            typeof value === 'boolean'
        ) {
            return String(value)
        }

        if (typeof value === 'bigint') {
            return value.toString()
        }

        if (
            Buffer.isBuffer(value) ||
            value instanceof Uint8Array
        ) {
            return JSON.stringify(
                Buffer.from(value).toString('base64')
            )
        }

        if (typeof value !== 'object') {
            return JSON.stringify(value)
        }

        if (depth > 40) {
            return '"[MaxDepth]"'
        }

        if (seen.has(value)) {
            return '"[Circular]"'
        }

        seen.add(value)

        const pad = ' '.repeat(indent)
        const padClose = ' '.repeat(
            Math.max(indent - 2, 0)
        )

        let result

        if (Array.isArray(value)) {
            if (!value.length) {
                result = '[]'
            } else {
                const items = value.map(v =>
                    pad +
                    toJsLiteral(
                        v,
                        indent + 2,
                        seen,
                        depth + 1
                    )
                )

                result =
                    `[\n${items.join(',\n')}\n${padClose}]`
            }
        } else {
            const keys = Object.keys(value).filter(
                key =>
                    typeof value[key] !== 'function' &&
                    value[key] !== undefined
            )

            if (!keys.length) {
                result = '{}'
            } else {
                const lines = keys.map(key => {
                    const keyStr =
                        /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)
                            ? key
                            : JSON.stringify(key)

                    return `${pad}${keyStr}: ${toJsLiteral(
                        value[key],
                        indent + 2,
                        seen,
                        depth + 1
                    )}`
                })

                result =
                    `{\n${lines.join(',\n')}\n${padClose}}`
            }
        }

        seen.delete(value)

        return result
    }

    const FRAMEWORK_DECORATED_KEYS = new Set([
        'mtype',
        'id',
        'chat',
        'isBaileys',
        'sender',
        'fromMe',
        'mentionedJid',
        'fakeObj',
        'delete',
        'copyNForward',
        'download',
        'key',
        'participant',
        'text',
        'body',
        'name',
        'pushName',
        'viewonce',
        'download1'
    ])

    function stripFrameworkProps(content) {
        if (!content || typeof content !== 'object') {
            return content
        }

        const output = {}

        for (const key of Object.keys(content)) {
            if (FRAMEWORK_DECORATED_KEYS.has(key)) {
                continue
            }

            if (typeof content[key] === 'function') {
                continue
            }

            output[key] = content[key]
        }

        return output
    }

    function buildReadableSendCode(content) {
        try {
            const clean = stripFrameworkProps(content)

            return `=> conn.relayMessage(
  m.chat,
  ${toJsLiteral(clean)},
  {}
)`
        } catch (error) {
            return `// Gagal generate relay_code: ${error?.message || error}`
        }
    }

    function typeNameFromContent(content) {
        const clean = stripFrameworkProps(content)

        const key =
            Object.keys(clean)[0] ||
            'UnknownMessage'

        return (
            key.charAt(0).toUpperCase() +
            key.slice(1)
        )
    }

    function makeCodeBlocks(code) {
        const blocks = []

        const regex =
            /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`|\b(?:const|let|var|function|return|class|static|new|async|await|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|import|export|from|default|extends|typeof|instanceof|in|of|delete|void|yield)\b|\b(?:true|false|null|undefined)\b|\b\d+(?:\.\d+)?\b)/g

        let lastIndex = 0
        let match

        while ((match = regex.exec(code)) !== null) {
            if (match.index > lastIndex) {
                blocks.push({
                    highlightType: 0,
                    codeContent: code.slice(
                        lastIndex,
                        match.index
                    )
                })
            }

            const token = match[0]

            let highlightType = 0

            if (
                /^(const|let|var|function|return|class|static|new|async|await|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|import|export|from|default|extends|typeof|instanceof|in|of|delete|void|yield)$/
                    .test(token)
            ) {
                highlightType = 1
            } else if (
                /^(true|false|null|undefined)$/.test(token)
            ) {
                highlightType = 2
            } else if (/^\d/.test(token)) {
                highlightType = 2
            } else if (/^['"`]/.test(token)) {
                highlightType = 3
            } else if (
                /^\/\//.test(token) ||
                /^\/\*/.test(token)
            ) {
                highlightType = 4
            }

            blocks.push({
                highlightType,
                codeContent: token
            })

            lastIndex = regex.lastIndex
        }

        if (lastIndex < code.length) {
            blocks.push({
                highlightType: 0,
                codeContent: code.slice(lastIndex)
            })
        }

        return blocks
    }

    async function sendSnippet(rawQuotedObj) {
        const code =
            buildReadableSendCode(rawQuotedObj)

        await conn.relayMessage(
            m.chat,
            {
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2,

                    botMetadata: {
                        messageDisclaimerText: '',
                        botResponseId:
                            '58fdc76c-f202-47a9-90d2-b089eac0ad2c',

                        verificationMetadata: {
                            proofs: [
                                {
                                    version: 1,
                                    useCase: 1,

                                    signature:
                                        'TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LVZlcmlmaWNhdGlvblNpZ25hdHVyZS5NZXRhZGF0YVhh6xH/dtA3Ag==',

                                    certificateChain: [
                                        'TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGH//zGpMImJh+iCc4A8KygG7r/xPdBGhrA6N0AvS8W5lck74PnLbHPY1k0Wc4ftBCswft7oHCfrCRKVgQBravQ2eyGrcksQUcrVwcp1DcsICX38+a323RnkJkl2J4qG1C2rGc+jg939PmKLhOOJG8cTh+0z1MpDXRiYj//NgkU0GBo3kv5hXXOZX33g1eQUZ9hTxlzWOOh7BRAIBHFHZIr0hohDvnpfgMADM1li3XIXFYlthNQUavirx/qUKx5iuJChV6LihLTfiVEVu3xABWDnuCGXhNaYBzYJZ1ia8T9ar5BHBT4EFCxuDj+qON7mV7bSJ6weZhmFX8FuKiCjeW4gJds24dPrdFBShOilZrcgJCMFdnctpQ1gSePHzQGIBCCPRzvxFhQksUmoPhg8bo9XU43+s5aCT/y38Swx1WWQjYORVnf8KPaBaohk6AAtoLxclC25nnRrdIdxza1Fi9fNG06OyZKf7F42k0pKH/mU9pzHkBUMIQ43xaFLY634VdJMCPmoTFgwDnuhRgTDS+aI7vtbOsPtCIkhR6R9E4u2wI9gd0bM4krsRKqEU8Jc/KD/4pfCEzuzTXOgJYWO+4hUebAg7XWr2F+LQYkOLG+OEhrEgq1GCsXcp9jH4V7NDoPMuBUH9MVk5CCvWnPtdw9rQKg8eRqeTNQtZIGYCKUzrehLEfE9Zz4UwVspnlnct4shtbHowNDMlBK4hq+/4Vt8GofGmkNFkOnZMD++1O4Ay1AmTlIZZPCSJxT4OLfTBhxPfREyFf7oRcChQo9aXiBKSUjo5UkD9lUojFxfpVZ+bl2CH8RV9b483Byk25vTqG1kg9GETqX/V5K1',
                                        'TklYRUwuTWVzc2FnZUJ1aWxkZXJWNC43LUNlcnRpZmljYXRlQ2hhaW4uTWV0YWRhdGFB+1trZnswR8m/c3Wcd0nxfYuZIyqLuWFIOOSUGu2/C7qVLRzuYaMM83KrQa+QipOAauPXOZr9WpCw6N3mB3FX/C6KcYu7flpq4S116PpzDDN5BNgPhmQVqMJ6skTr/vBknVfuznE2FVc0oJYASwjJEpC1UP5GqZbq7xxzmPCuQUlM4kpSpiGKEdG8cZOrDVXDW22ZZ3eZfWzZBxkhW8sZvn7Pv6FVaPwVPPWQfETOKH68iPGgzY21wY7fZ4JNJfBCsXrx8HgBiZ+C4/m0eU7QOQoM0TkO3++L4Y5CGj+R8zRHkv1cnU1H2aeGqlglLH6ceAasnPDtc3gvNyVJF+lSh6V7cX2MkhdXakrK7SPigS5HITqDi5W6c9OwVUsJ4eAug8iyOgjD0qmoXZWijBIg7daBdOAew0akxDKm8F6U9N38I8SuvHrre6iiBK7+06ngtWB5d4phwc/xWhpdHsmwUQOakr8XRTocdDL/oQTUoDII5sFD3Wv+yrazeUtyx7Sq+28yKRL+FtjpPFibF8AuDW6HeyjORNdiirnJztVD8fFXs/d96GlMIvgiFYsCxGCUlQv998bYfwZ85s/PE00JwE3j2w7wRN9T+vgnGVfISy6I7vtbOsPtCIkhR6R9E4u2wI9gd0bM4krsRKqEU8Jc/KD/4pfCEzuzTXOgJYWO+4hUebAg7XWr2F+LQYkOLG+OEhrEgq1GCsXcp9jH4V7NDoPMuBUH9MVk5CCvWnPtdw9rQKg8eRqeTNQtZIGYCKUzrehLEfE9Zz4UwVspnlnct4shtbHowNDMlBK4hq+/4Vt8GofGmkNFkOnZMD++1O4Ay1AmTlIZZPCSJxT4OLfTBhxPfREyFf7oRcChQo9aXiBKSUjo5UkD9lUojFxfpVZ+bl2CH8RV9b483Byk25vTqG1kg9GETqX/V5K1'
                                    ]
                                }
                            ]
                        }
                    }
                },

                botForwardedMessage: {
                    message: {
                        richResponseMessage: {
                            submessages: [
                                {
                                    messageType: 2,
                                    messageText:
                                        'Berikut kode relay-nya. Klik tombol "Lihat kode", lalu ikon Salin untuk menyalin kodenya.'
                                },
                                {
                                    messageType: 5,
                                    codeMetadata: {
                                        codeLanguage:
                                            'javascript',
                                        codeBlocks:
                                            makeCodeBlocks(code)
                                    }
                                }
                            ],

                            contextInfo: {
                                forwardingScore: 1,
                                isForwarded: true,

                                forwardedAiBotMessageInfo: {
                                    botJid: '0@bot'
                                },

                                forwardOrigin: 4
                            }
                        }
                    }
                }
            },
            {}
        )
    }

    try {
        const unwrapped = unwrap(rawQuoted)

        if (
            !unwrapped ||
            typeof unwrapped !== 'object' ||
            !Object.keys(unwrapped).length
        ) {
            return sendReply(
                '❌ Jenis pesan ini belum didukung untuk di-relay.'
            )
        }

        const relayContent =
            normalizeForRelay(rawQuoted)

        const botJid = conn.user?.id
            ? jidNormalizedUser(conn.user.id)
            : sender

        const relayMsg =
            generateWAMessageFromContent(
                m.chat,
                relayContent,
                {
                    userJid: botJid,
                    quoted: m
                }
            )

        await conn.relayMessage(
            relayMsg.key.remoteJid,
            relayMsg.message,
            {
                messageId: relayMsg.key.id
            }
        )

        const isSnippet =
            command
                ?.toLowerCase()
                .includes('snipp') ||
            args?.some(x =>
                String(x)
                    .toLowerCase()
                    .includes('snipp')
            )

        if (isSnippet) {
            try {
                await sendSnippet(unwrapped)
            } catch (error) {
                return sendReply(
                    `⚠️ Gagal kirim snippet: ${error?.message || error}`
                )
            }

            return
        }

        const typeName =
            typeNameFromContent(unwrapped)

        const filename =
            `${typeName}.js`

        const codeContent =
            buildReadableSendCode(unwrapped)

        await conn.sendMessage(
            m.chat,
            {
                document: Buffer.from(
                    codeContent,
                    'utf-8'
                ),
                fileName: filename,
                mimetype: 'text/javascript',
                caption: `📄 ${filename}`
            },
            {
                quoted: m
            }
        )

        await conn.sendMessage(
            m.chat,
            {
                react: {
                    text: '✅',
                    key: m.key
                }
            }
        )

    } catch (error) {
        console.error(
            'CRM2 ERROR:',
            error
        )

        return sendReply(
            '❌ Gagal membuat CRM.\n\n' +
            (error?.message || error)
        )
    }
}

handler.help = [
    'crm2',
    'crm-snipp'
]

handler.tags = [
    'owner'
]

handler.command = [
    'crm2',
    'crm-snipp'
]

handler.owner = true

export default handler