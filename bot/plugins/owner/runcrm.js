// plugins/runcrm.js
// Command: .runcrm
// Type: ESM Plugin

import { generateWAMessageFromContent } from '@rexxhayanasi/elaina-baileys'

const handler = async (m, {
    conn,
    text,
    usedPrefix,
    command,
    isOwner,
    isPemilik
}) => {

    // =========================
    // CEK OWNER / PEMILIK
    // =========================
    if (!isOwner && !isPemilik) {
        return m.reply(
            'fitur khusus owner/pemilik AlzRiss'
        )
    }

    // =========================
    // CLEAN RELAY CODE
    // =========================
    function rcCleanCode(t) {
        t = String(t || '').trim()

        t = t
            .replace(/^export\s+default\s+/i, '')
            .replace(/^module\.exports\s*=\s*/i, '')
            .trim()

        if (t.endsWith(';')) {
            t = t.slice(0, -1).trim()
        }

        return t
    }

    // =========================
    // PARSE RELAY FILE
    // =========================
    function rcParseRelayFile(t) {
        const clean = rcCleanCode(t)

        const json = JSON.parse(clean)

        const payload =
            json.payload ||
            json.message ||
            json.msg ||
            null

        if (!payload || typeof payload !== 'object') {
            throw new Error(
                'Payload relay tidak ditemukan.'
            )
        }

        return payload
    }

    // =========================
    // FIX INTERACTIVE MESSAGE
    // =========================
    function rcFixInteractiveMessage(payload) {
        if (!payload.interactiveMessage) {
            return payload
        }

        const msg = JSON.parse(
            JSON.stringify(payload)
        )

        const interactive =
            msg.interactiveMessage

        // body.footer -> footer
        if (
            interactive.body?.footer &&
            !interactive.footer
        ) {
            interactive.footer =
                interactive.body.footer

            delete interactive.body.footer
        }

        // body.nativeFlowMessage -> nativeFlowMessage
        if (
            interactive.body?.nativeFlowMessage &&
            !interactive.nativeFlowMessage
        ) {
            interactive.nativeFlowMessage =
                interactive.body.nativeFlowMessage

            delete interactive.body.nativeFlowMessage
        }

        // body.header -> header
        if (
            interactive.body?.header &&
            !interactive.header
        ) {
            interactive.header =
                interactive.body.header

            delete interactive.body.header
        }

        // Pastikan body object
        if (
            !interactive.body ||
            typeof interactive.body !== 'object'
        ) {
            interactive.body = {
                text: String(
                    interactive.body || ''
                )
            }
        }

        // Pastikan messageParamsJson
        if (
            !interactive.nativeFlowMessage
                ?.messageParamsJson
        ) {
            interactive.nativeFlowMessage = {
                ...(interactive.nativeFlowMessage || {}),
                messageParamsJson: '{}'
            }
        }

        // Fix buttonParamsJson
        if (
            Array.isArray(
                interactive.nativeFlowMessage?.buttons
            )
        ) {
            interactive.nativeFlowMessage.buttons =
                interactive.nativeFlowMessage.buttons.map(
                    button => {

                        if (
                            button.buttonParamsJson &&
                            typeof button.buttonParamsJson !== 'string'
                        ) {
                            button.buttonParamsJson =
                                JSON.stringify(
                                    button.buttonParamsJson
                                )
                        }

                        return button
                    }
                )
        }

        return msg
    }

    // =========================
    // WRAP INTERACTIVE
    // =========================
    function rcWrapInteractive(payload) {
        if (!payload.interactiveMessage) {
            return payload
        }

        return {
            viewOnceMessage: {
                message: {
                    interactiveMessage:
                        payload.interactiveMessage
                }
            }
        }
    }

    // =========================
    // RELAY CRM MESSAGE
    // =========================
    async function rcRelayCrmMessage(jid, payload) {

        const fixed =
            rcFixInteractiveMessage(payload)

        const wrapped =
            rcWrapInteractive(fixed)

        // Interactive message
        if (wrapped.viewOnceMessage) {

            const waMsg =
                generateWAMessageFromContent(
                    jid,
                    wrapped,
                    {
                        userJid:
                            conn.user?.id
                    }
                )

            await conn.relayMessage(
                jid,
                waMsg.message,
                {
                    messageId: waMsg.key.id
                }
            )

            return
        }

        // Message biasa
        await conn.relayMessage(
            jid,
            fixed,
            {}
        )
    }

    // =========================
    // MAIN
    // =========================
    try {

        let rcRaw =
            String(text || '').trim()

        // Kalau tidak ada text,
        // ambil file dari quoted/media target
        if (!rcRaw) {

            let rcTarget = null

            // Support resolveMediaTarget
            if (
                typeof m.resolveMediaTarget ===
                'function'
            ) {
                rcTarget =
                    m.resolveMediaTarget()
            }

            // Fallback ke quoted
            if (!rcTarget && m.quoted) {
                rcTarget = m.quoted
            }

            if (!rcTarget) {
                return m.reply(
                    `Reply file relay.js hasil dari *${usedPrefix}crm*, lalu kirim:\n` +
                    `*${usedPrefix}runcrm*`
                )
            }

            // Download file
            if (
                typeof rcTarget.download !==
                'function'
            ) {
                throw new Error(
                    'Target tidak memiliki fungsi download.'
                )
            }

            const rcBuf =
                await rcTarget.download()

            if (!rcBuf) {
                throw new Error(
                    'Gagal mengunduh file relay.js.'
                )
            }

            rcRaw =
                rcBuf.toString('utf8')
        }

        // =========================
        // PARSE
        // =========================
        const rcPayload =
            rcParseRelayFile(rcRaw)

        // =========================
        // RELAY
        // =========================
        await rcRelayCrmMessage(
            m.chat,
            rcPayload
        )

        // =========================
        // REACTION
        // =========================
        await conn.sendMessage(
            m.chat,
            {
                react: {
                    text: '✅',
                    key: m.key
                }
            }
        )

    } catch (e) {

        console.error(
            'RUNCRM ERROR:',
            e
        )

        // Support global sendAdminLog
        try {
            if (
                typeof global.sendAdminLog ===
                'function'
            ) {
                await global.sendAdminLog(
                    conn,
                    'runcrm',
                    m.sender?.split('@')[0] ||
                    m.sender,
                    e
                )
            }
        } catch {}

        return m.reply(
            '❌ Gagal menjalankan CRM.\n\n' +
            (e?.message || String(e))
        )
    }
}

// =========================
// PLUGIN CONFIG
// =========================

handler.help = ['runcrm']
handler.tags = ['owner']
handler.command = /^runcrm$/i
handler.owner = true

export default handler