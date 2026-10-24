// plugins/magma-notif.js
// MAGMA Indonesia - Auto Notifikasi Erupsi
// Anti-Spam + Initial Sync + Persistent Auto Check
// ESM Plugin

'use strict';

import { magma } from '../../lib/magma.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================================
// KONFIGURASI
// =========================================

const CONFIG = {
    CHECK_INTERVAL: 15 * 60 * 1000,
    REALTIME_INTERVAL: 30 * 60 * 1000,

    DB_FILE: path.join(
        __dirname,
        '../data/magma-subscribers.json'
    ),

    MAX_AGE: 6 * 60 * 60 * 1000,

    COOLDOWN_PER_CHAT: 60 * 1000,
    COOLDOWN_PER_VOLCANO: 2 * 60 * 60 * 1000,

    MAX_BATCH_SIZE: 3,

    SEEN_HISTORY_SIZE: 2000,

    MIN_STATUS_LEVEL: 3,

    ENABLE_REALTIME_NOTIF: true,
    SEND_IMAGE: true,

    REALTIME_NOTIFY_ONLY_CHANGE: true
};

// =========================================
// DATABASE
// =========================================

function getDefaultDB() {
    return {
        chats: [],
        subscribers: {},
        seenEruptions: [],
        lastStatuses: {},
        lastNotifPerChat: {},
        lastNotifPerVolcano: {}
    };
}

function loadDB() {
    try {
        if (!fs.existsSync(CONFIG.DB_FILE)) {
            return getDefaultDB();
        }

        const data = JSON.parse(
            fs.readFileSync(CONFIG.DB_FILE, 'utf8')
        );

        // Migrasi database lama
        if (
            data.chats &&
            data.chats.length > 0 &&
            !data.subscribers
        ) {
            data.subscribers = {};

            for (const chatId of data.chats) {
                data.subscribers[chatId] = {
                    images: true,
                    joinedAt: new Date().toISOString()
                };
            }

            data.chats = [];
        }

        if (!data.subscribers) {
            data.subscribers = {};
        }

        if (!data.seenEruptions) {
            data.seenEruptions = [];
        }

        if (!data.lastStatuses) {
            data.lastStatuses = {};
        }

        if (!data.lastNotifPerChat) {
            data.lastNotifPerChat = {};
        }

        if (!data.lastNotifPerVolcano) {
            data.lastNotifPerVolcano = {};
        }

        return data;

    } catch (err) {
        console.error(
            '[MAGMA] Gagal load database:',
            err.message
        );

        return getDefaultDB();
    }
}

function saveDB(data) {
    try {
        const dir = path.dirname(
            CONFIG.DB_FILE
        );

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {
                recursive: true
            });
        }

        fs.writeFileSync(
            CONFIG.DB_FILE,
            JSON.stringify(data, null, 2)
        );

    } catch (err) {
        console.error(
            '[MAGMA] Gagal save database:',
            err.message
        );
    }
}

function getSubscribers(db) {
    return Object.keys(
        db.subscribers || {}
    );
}

function getSubscriberConfig(db, chatId) {
    return db.subscribers?.[chatId] || {
        images: true
    };
}

// =========================================
// INITIAL SYNC ERUPSI
// =========================================

async function syncInitialEruptions(db) {
    try {
        const result =
            await magma.getList(1);

        const eruptions =
            result.eruptions || [];

        let added = 0;

        for (const eruption of eruptions) {
            if (!eruption.id) continue;

            if (
                !db.seenEruptions.includes(
                    eruption.id
                )
            ) {
                db.seenEruptions.push(
                    eruption.id
                );

                added++;
            }
        }

        if (
            db.seenEruptions.length >
            CONFIG.SEEN_HISTORY_SIZE
        ) {
            db.seenEruptions =
                db.seenEruptions.slice(
                    -CONFIG.SEEN_HISTORY_SIZE
                );
        }

        console.log(
            `[MAGMA] Initial sync: ${added} data lama ditandai sebagai seen`
        );

        return true;

    } catch (err) {
        console.error(
            '[MAGMA] Initial sync eruption gagal:',
            err.message
        );

        return false;
    }
}

// =========================================
// INITIAL SYNC REALTIME
// =========================================

async function syncInitialRealtime(db) {
    try {
        const catalog =
            await magma.getVolcanoCatalog();

        if (
            !Array.isArray(catalog) ||
            catalog.length === 0
        ) {
            return false;
        }

        const codes = catalog
            .filter(v => v?.code)
            .map(v => v.code);

        if (codes.length === 0) {
            return false;
        }

        const statuses =
            await magma.fetchRealTimeStatuses(
                codes,
                {
                    concurrency: 2
                }
            );

        let synced = 0;

        for (const status of statuses || []) {
            if (!status?.code) continue;

            if (
                status.status !== undefined
            ) {
                db.lastStatuses[
                    status.code
                ] = status.status;

                synced++;
            }
        }

        console.log(
            `[MAGMA] Initial realtime sync: ${synced} status`
        );

        return true;

    } catch (err) {
        console.error(
            '[MAGMA] Initial realtime sync gagal:',
            err.message
        );

        return false;
    }
}

// =========================================
// ANTI-SPAM
// =========================================

function canNotifyChat(
    db,
    chatId,
    now = Date.now()
) {
    const lastNotif =
        db.lastNotifPerChat[
            chatId
        ] || 0;

    return (
        now - lastNotif >=
        CONFIG.COOLDOWN_PER_CHAT
    );
}

function canNotifyVolcano(
    db,
    volcanoName,
    now = Date.now()
) {
    const key = String(
        volcanoName || ''
    )
        .toLowerCase()
        .trim();

    if (!key) return true;

    const lastNotif =
        db.lastNotifPerVolcano[
            key
        ] || 0;

    return (
        now - lastNotif >=
        CONFIG.COOLDOWN_PER_VOLCANO
    );
}

function markChatNotified(
    db,
    chatId
) {
    db.lastNotifPerChat[
        chatId
    ] = Date.now();
}

function markVolcanoNotified(
    db,
    volcanoName
) {
    const key = String(
        volcanoName || ''
    )
        .toLowerCase()
        .trim();

    if (key) {
        db.lastNotifPerVolcano[
            key
        ] = Date.now();
    }
}

// =========================================
// DETEKSI ERUPSI
// =========================================

function isActualEruption(
    eruption
) {
    const desc = String(
        eruption.description || ''
    ).toLowerCase();

    return /erupsi|letusan|abu\s*vulkanik|lava|awan\s*panas|guguran/i.test(
        desc
    );
}

// =========================================
// FORMAT ERUPSI
// =========================================

function formatEruptionMessage(
    eruption
) {
    let msg = '';

    msg += `🌋 *ERUPSI GUNUNG API*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    msg += `⛰️ *Gunung:* ${
        eruption.volcanoName ||
        'Unknown'
    }\n`;

    if (eruption.localTime) {
        msg += `🕐 *Waktu:* ${
            eruption.localTime.replace(
                'T',
                ' '
            )
        } ${
            eruption.timezone ||
            'WIB'
        }\n`;
    }

    if (eruption.description) {
        msg += `\n📝 *Deskripsi:*\n`;
        msg += `${eruption.description}\n`;
    }

    if (eruption.recommendation) {
        msg += `\n⚠️ *Rekomendasi:*\n`;
        msg += `${eruption.recommendation}\n`;
    }

    if (eruption.detailUrl) {
        const fullUrl =
            eruption.detailUrl.startsWith(
                'http'
            )
                ? eruption.detailUrl
                : `https://magma.esdm.go.id${eruption.detailUrl}`;

        msg += `\n🔗 ${fullUrl}\n`;
    }

    msg += `\n_MAGMA ESDM Indonesia_`;

    return msg;
}

// =========================================
// FORMAT REALTIME
// =========================================

function formatRealtimeStatusMessage(
    status
) {
    let msg = '';

    msg += `📊 *UPDATE STATUS GUNUNG API*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    msg += `⛰️ *${
        status.name ||
        status.code
    }*\n`;

    msg += `📈 *Status:* ${
        status.statusLabel ||
        'Unknown'
    }\n`;

    if (status.reportPeriod) {
        msg += `🕐 ${status.reportPeriod}\n`;
    }

    if (status.recommendation) {
        msg += `\n⚠️ *Rekomendasi:*\n`;
        msg += `${status.recommendation}\n`;
    }

    msg += `\n_MAGMA ESDM Indonesia_`;

    return msg;
}

// =========================================
// SEND NOTIFICATION
// =========================================

async function sendNotification(
    conn,
    chatId,
    text,
    imageUrl,
    sendImage
) {
    try {
        if (
            CONFIG.SEND_IMAGE &&
            sendImage &&
            imageUrl
        ) {
            const validImage =
                /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(
                    imageUrl
                ) ||
                imageUrl.includes(
                    'magma.esdm.go.id'
                );

            if (validImage) {
                await conn.sendMessage(
                    chatId,
                    {
                        image: {
                            url: imageUrl
                        },
                        caption: text
                    }
                );

                return true;
            }
        }

        await conn.sendMessage(
            chatId,
            {
                text
            }
        );

        return true;

    } catch (err) {
        console.error(
            `[MAGMA] Gagal kirim ke ${chatId}:`,
            err.message
        );

        try {
            await conn.sendMessage(
                chatId,
                {
                    text
                }
            );

            return true;

        } catch (e) {
            console.error(
                '[MAGMA] Fallback gagal:',
                e.message
            );

            return false;
        }
    }
}

// =========================================
// CEK ERUPSI
// =========================================

async function checkEruptions(
    conn
) {
    if (!conn) return;

    try {
        const db = loadDB();

        const subscribers =
            getSubscribers(db);

        if (
            subscribers.length === 0
        ) {
            return;
        }

        const result =
            await magma.getList(1);

        const eruptions =
            result.eruptions || [];

        if (
            eruptions.length === 0
        ) {
            return;
        }

        const now = Date.now();

        const newEruptions = [];

        for (const e of eruptions) {
            if (!e.id) continue;

            if (
                db.seenEruptions.includes(
                    e.id
                )
            ) {
                continue;
            }

            // Umur data
            if (e.localTime) {
                const erupTime =
                    new Date(
                        e.localTime +
                        '+07:00'
                    ).getTime();

                if (
                    !isNaN(erupTime) &&
                    now - erupTime >
                    CONFIG.MAX_AGE
                ) {
                    db.seenEruptions.push(
                        e.id
                    );

                    continue;
                }
            }

            // Bukan erupsi
            if (
                !isActualEruption(e)
            ) {
                db.seenEruptions.push(
                    e.id
                );

                continue;
            }

            // Cooldown gunung
            if (
                !canNotifyVolcano(
                    db,
                    e.volcanoName,
                    now
                )
            ) {
                console.log(
                    `[MAGMA] Skip ${e.volcanoName} - volcano cooldown`
                );

                db.seenEruptions.push(
                    e.id
                );

                continue;
            }

            newEruptions.push(e);

            db.seenEruptions.push(
                e.id
            );

            if (
                newEruptions.length >=
                CONFIG.MAX_BATCH_SIZE
            ) {
                break;
            }
        }

        // Trim history
        if (
            db.seenEruptions.length >
            CONFIG.SEEN_HISTORY_SIZE
        ) {
            db.seenEruptions =
                db.seenEruptions.slice(
                    -CONFIG.SEEN_HISTORY_SIZE
                );
        }

        if (
            newEruptions.length === 0
        ) {
            saveDB(db);
            return;
        }

        // Fetch detail
        let enriched =
            newEruptions;

        try {
            enriched =
                await magma.fetchDetails(
                    newEruptions,
                    {
                        concurrency: 2
                    }
                );

        } catch (err) {
            console.error(
                '[MAGMA] Enrich error:',
                err.message
            );
        }

        // Broadcast
        for (
            const eruption
            of enriched
        ) {
            const msg =
                formatEruptionMessage(
                    eruption
                );

            let sentCount = 0;

            for (
                const chatId
                of subscribers
            ) {
                if (
                    !canNotifyChat(
                        db,
                        chatId,
                        now
                    )
                ) {
                    console.log(
                        `[MAGMA] Skip ${chatId} - chat cooldown`
                    );

                    continue;
                }

                const subCfg =
                    getSubscriberConfig(
                        db,
                        chatId
                    );

                const ok =
                    await sendNotification(
                        conn,
                        chatId,
                        msg,
                        eruption.imageUrl,
                        subCfg.images !== false
                    );

                if (ok) {
                    markChatNotified(
                        db,
                        chatId
                    );

                    sentCount++;
                }

                await new Promise(
                    resolve =>
                        setTimeout(
                            resolve,
                            2000
                        )
                );
            }

            if (sentCount > 0) {
                markVolcanoNotified(
                    db,
                    eruption.volcanoName
                );

                console.log(
                    `[MAGMA] ${eruption.volcanoName} → ${sentCount} chat`
                );
            }
        }

        saveDB(db);

    } catch (err) {
        console.error(
            '[MAGMA] Error checkEruptions:',
            err.message
        );
    }
}

// =========================================
// CEK REALTIME
// =========================================

async function checkRealtimeStatus(
    conn
) {
    if (!CONFIG.ENABLE_REALTIME_NOTIF) {
        return;
    }

    if (!conn) return;

    try {
        const db = loadDB();

        const subscribers =
            getSubscribers(db);

        if (
            subscribers.length === 0
        ) {
            return;
        }

        const catalog =
            await magma.getVolcanoCatalog();

        const watchlist =
            catalog.filter(v =>
                v.status &&
                v.status >=
                CONFIG.MIN_STATUS_LEVEL
            );

        if (
            watchlist.length === 0
        ) {
            return;
        }

        console.log(
            `[MAGMA] Cek realtime ${watchlist.length} gunung`
        );

        const codes =
            watchlist
                .map(v => v.code)
                .filter(Boolean);

        const statuses =
            await magma.fetchRealTimeStatuses(
                codes,
                {
                    concurrency: 2
                }
            );

        for (
            const status
            of statuses || []
        ) {
            if (!status?.code) {
                continue;
            }

            const prevStatus =
                db.lastStatuses[
                    status.code
                ];

            const currentStatus =
                status.status;

            let shouldNotify = false;

            // Pertama kali:
            // hanya catat status.
            if (
                prevStatus === undefined
            ) {
                shouldNotify = false;
            }

            // Status naik
            else if (
                currentStatus >
                    prevStatus &&
                currentStatus >=
                    CONFIG.MIN_STATUS_LEVEL
            ) {
                shouldNotify = true;
            }

            if (shouldNotify) {
                if (
                    !canNotifyVolcano(
                        db,
                        status.name ||
                        status.code
                    )
                ) {
                    console.log(
                        `[MAGMA] Skip realtime ${status.name} - volcano cooldown`
                    );

                    db.lastStatuses[
                        status.code
                    ] = currentStatus;

                    continue;
                }

                const msg =
                    formatRealtimeStatusMessage(
                        status
                    );

                let sentCount = 0;

                for (
                    const chatId
                    of subscribers
                ) {
                    if (
                        !canNotifyChat(
                            db,
                            chatId
                        )
                    ) {
                        continue;
                    }

                    const subCfg =
                        getSubscriberConfig(
                            db,
                            chatId
                        );

                    const ok =
                        await sendNotification(
                            conn,
                            chatId,
                            msg,
                            status.visualPhoto ||
                            null,
                            subCfg.images !== false
                        );

                    if (ok) {
                        markChatNotified(
                            db,
                            chatId
                        );

                        sentCount++;
                    }

                    await new Promise(
                        resolve =>
                            setTimeout(
                                resolve,
                                2000
                            )
                    );
                }

                if (sentCount > 0) {
                    markVolcanoNotified(
                        db,
                        status.name ||
                        status.code
                    );

                    console.log(
                        `[MAGMA] Realtime ${status.name} naik ke ${currentStatus} → ${sentCount} chat`
                    );
                }
            }

            // Selalu update status terakhir
            db.lastStatuses[
                status.code
            ] = currentStatus;
        }

        // Batasi status history
        const statusKeys =
            Object.keys(
                db.lastStatuses
            );

        if (statusKeys.length > 200) {
            const toKeep =
                statusKeys.slice(-200);

            const newStatuses = {};

            for (
                const key
                of toKeep
            ) {
                newStatuses[key] =
                    db.lastStatuses[key];
            }

            db.lastStatuses =
                newStatuses;
        }

        saveDB(db);

    } catch (err) {
        console.error(
            '[MAGMA] Error checkRealtimeStatus:',
            err.message
        );
    }
}

// =========================================
// PERSISTENT AUTO CHECK
// =========================================

const MAGMA_STATE_KEY =
    '__ALZRISS_MAGMA_AUTO_CHECK__';

function getMagmaState() {
    if (
        !global[MAGMA_STATE_KEY]
    ) {
        global[MAGMA_STATE_KEY] = {
            started: false,
            conn: null,
            eruptionTimer: null,
            realtimeTimer: null,
            bootstrapTimer: null,
            initialTimer: null
        };
    }

    return global[
        MAGMA_STATE_KEY
    ];
}

function startAutoCheck(conn) {
    if (!conn) {
        return false;
    }

    const state =
        getMagmaState();

    // Kalau sudah aktif,
    // cukup update connection.
    if (state.started) {
        state.conn = conn;
        return true;
    }

    state.conn = conn;
    state.started = true;

    console.log(
        `[MAGMA] Auto-check aktif. ` +
        `Erupsi: ${
            CONFIG.CHECK_INTERVAL / 60000
        }m, ` +
        `Realtime: ${
            CONFIG.REALTIME_INTERVAL / 60000
        }m`
    );

    // =====================================
    // INITIAL CHECK
    // =====================================

    state.initialTimer =
        setTimeout(async () => {
            try {
                if (!state.conn) {
                    return;
                }

                await checkEruptions(
                    state.conn
                );

            } catch (err) {
                console.error(
                    '[MAGMA] Initial eruption check error:',
                    err.message
                );
            }

            try {
                if (!state.conn) {
                    return;
                }

                await checkRealtimeStatus(
                    state.conn
                );

            } catch (err) {
                console.error(
                    '[MAGMA] Initial realtime check error:',
                    err.message
                );
            }

            state.initialTimer = null;

        }, 60 * 1000);

    // =====================================
    // ERUPSI TIMER
    // =====================================

    state.eruptionTimer =
        setInterval(async () => {
            try {
                if (!state.conn) {
                    return;
                }

                await checkEruptions(
                    state.conn
                );

            } catch (err) {
                console.error(
                    '[MAGMA] Interval eruption error:',
                    err.message
                );
            }
        }, CONFIG.CHECK_INTERVAL);

    // =====================================
    // REALTIME TIMER
    // =====================================

    state.realtimeTimer =
        setInterval(async () => {
            try {
                if (!state.conn) {
                    return;
                }

                await checkRealtimeStatus(
                    state.conn
                );

            } catch (err) {
                console.error(
                    '[MAGMA] Interval realtime error:',
                    err.message
                );
            }
        }, CONFIG.REALTIME_INTERVAL);

    return true;
}

// =========================================
// AUTO BOOTSTRAP
// =========================================

function bootstrapMagma() {
    const state =
        getMagmaState();

    if (state.started) {
        return;
    }

    const conn =
        global.conn ||
        global.sock ||
        global.client ||
        global.connection;

    if (conn) {
        startAutoCheck(conn);

        return;
    }

    if (state.bootstrapTimer) {
        return;
    }

    console.log(
        '[MAGMA] Menunggu connection bot untuk auto-start...'
    );

    state.bootstrapTimer =
        setInterval(() => {
            try {
                const currentConn =
                    global.conn ||
                    global.sock ||
                    global.client ||
                    global.connection;

                if (!currentConn) {
                    return;
                }

                startAutoCheck(
                    currentConn
                );

                clearInterval(
                    state.bootstrapTimer
                );

                state.bootstrapTimer =
                    null;

            } catch (err) {
                console.error(
                    '[MAGMA] Bootstrap error:',
                    err.message
                );
            }
        }, 5000);
}

// Jalankan otomatis saat plugin diload.
bootstrapMagma();

// =========================================
// HANDLER
// =========================================

let handler = async (
    m,
    {
        conn,
        command,
        text,
        args
    }
) => {
    const db = loadDB();

    // Pastikan connection terbaru digunakan.
    startAutoCheck(conn);

    const chatId = m.chat;

    const subCfg =
        getSubscriberConfig(
            db,
            chatId
        );

    const isSubscribed =
        !!db.subscribers[
            chatId
        ];

    // =====================================
    // .magma on
    // =====================================

    if (
        command === 'magma' &&
        (
            text === 'on' ||
            text === 'subscribe'
        )
    ) {
        if (isSubscribed) {
            return m.reply(
                `✅ Chat ini sudah subscribe.\n\n` +
                `📊 *Konfigurasi:*\n` +
                `• Kirim gambar: ${
                    subCfg.images
                        ? '✅ On'
                        : '❌ Off'
                }\n\n` +
                `Gunakan *.magma image on/off* untuk ubah.`
            );
        }

        await m.reply(
            `⏳ Mengaktifkan notifikasi MAGMA...`
        );

        const eruptionSync =
            await syncInitialEruptions(
                db
            );

        await syncInitialRealtime(
            db
        );

        db.subscribers[
            chatId
        ] = {
            images: true,
            joinedAt:
                new Date().toISOString()
        };

        saveDB(db);

        return m.reply(
            `✅ *Berhasil subscribe!*\n\n` +
            `🔔 Notifikasi aktif untuk:\n` +
            `• Erupsi gunung api baru\n` +
            `• Kenaikan status gunung\n` +
            `• Foto erupsi (kalau tersedia)\n\n` +
            `🛡️ *Initial Sync:* ${
                eruptionSync
                    ? '✅ Aman'
                    : '⚠️ Gagal'
            }\n` +
            `🚫 Anti-spam: aktif\n\n` +
            `📌 Data erupsi/status yang sudah ada saat subscribe tidak akan dikirim ulang.\n\n` +
            `*Customize:*\n` +
            `• *.magma image on/off*\n\n` +
            `Gunakan *.magma off* untuk unsubscribe.`
        );
    }

    // =====================================
    // .magma image on/off
    // =====================================

    if (
        command === 'magma' &&
        args[0] === 'image'
    ) {
        if (!isSubscribed) {
            return m.reply(
                '❌ Subscribe dulu dengan *.magma on*'
            );
        }

        const mode =
            args[1]?.toLowerCase();

        if (
            mode !== 'on' &&
            mode !== 'off'
        ) {
            return m.reply(
                `❌ Format: *.magma image on* atau *.magma image off*`
            );
        }

        db.subscribers[
            chatId
        ].images =
            mode === 'on';

        saveDB(db);

        return m.reply(
            `${
                mode === 'on'
                    ? '✅'
                    : '❌'
            } *Kirim gambar ${
                mode === 'on'
                    ? 'diaktifkan'
                    : 'dimatikan'
            }.*`
        );
    }

    // =====================================
    // .magma off
    // =====================================

    if (
        command === 'magma' &&
        (
            text === 'off' ||
            text === 'unsubscribe'
        )
    ) {
        if (!isSubscribed) {
            return m.reply(
                '❌ Chat ini belum subscribe.'
            );
        }

        delete db.subscribers[
            chatId
        ];

        delete db.lastNotifPerChat[
            chatId
        ];

        saveDB(db);

        return m.reply(
            '❌ *Berhasil unsubscribe.*'
        );
    }

    // =====================================
    // .magma setting
    // =====================================

    if (
        command === 'magma' &&
        (
            text === 'setting' ||
            text === 'config' ||
            text === 'status'
        )
    ) {
        if (!isSubscribed) {
            return m.reply(
                '❌ Chat ini belum subscribe. Ketik *.magma on* dulu.'
            );
        }

        const totalSubs =
            getSubscribers(db).length;

        const lastNotif =
            db.lastNotifPerChat[
                chatId
            ];

        const lastNotifStr =
            lastNotif
                ? new Date(
                    lastNotif
                ).toLocaleString(
                    'id-ID'
                )
                : 'Belum pernah';

        return m.reply(
            `📊 *SETTING NOTIF MAGMA*\n` +
            `━━━━━━━━━━━━━━━━━━━━━━\n\n` +

            `*Chat ini:*\n` +
            `• Status: ✅ Subscribe\n` +
            `• Kirim gambar: ${
                subCfg.images
                    ? '✅ On'
                    : '❌ Off'
            }\n` +
            `• Notif terakhir: ${lastNotifStr}\n` +
            `• Sejak: ${
                subCfg.joinedAt?.slice(
                    0,
                    10
                ) || '-'
            }\n\n` +

            `*Global:*\n` +
            `• Total subscriber: ${totalSubs} chat\n` +
            `• Interval erupsi: ${
                CONFIG.CHECK_INTERVAL /
                60000
            } menit\n` +
            `• Interval realtime: ${
                CONFIG.REALTIME_INTERVAL /
                60000
            } menit\n` +
            `• Cooldown per chat: ${
                CONFIG.COOLDOWN_PER_CHAT /
                1000
            } detik\n` +
            `• Cooldown per gunung: ${
                CONFIG.COOLDOWN_PER_VOLCANO /
                60000
            } menit\n\n` +

            `🚫 *Anti-spam:* AKTIF\n` +
            `🔄 *Auto-check:* AKTIF`
        );
    }

    // =====================================
    // .magma sekarang
    // =====================================

    if (
        command === 'magma' &&
        (
            text === 'sekarang' ||
            text === 'now' ||
            text === 'cek'
        )
    ) {
        await m.reply(
            '🔍 Cek manual...'
        );

        await checkEruptions(
            conn
        );

        await m.reply(
            '✅ Selesai.'
        );

        return;
    }

    // =====================================
    // .magma list
    // =====================================

    if (
        command === 'magma' &&
        (
            text === 'list' ||
            text === 'terbaru'
        )
    ) {
        await m.react('⏳');

        try {
            const result =
                await magma.getList(1);

            const eruptions =
                result.eruptions || [];

            if (
                eruptions.length === 0
            ) {
                await m.react('❌');

                return m.reply(
                    '❌ Tidak ada data erupsi terbaru.'
                );
            }

            let msg =
                `🌋 *ERUPSI TERBARU*\n`;

            msg +=
                `━━━━━━━━━━━━━━━━━━━━━━\n\n`;

            for (
                let i = 0;
                i <
                Math.min(
                    eruptions.length,
                    5
                );
                i++
            ) {
                const e =
                    eruptions[i];

                msg +=
                    `*${i + 1}. ${
                        e.volcanoName
                    }*\n`;

                if (e.localTime) {
                    msg +=
                        `   🕐 ${
                            e.localTime.replace(
                                'T',
                                ' '
                            )
                        }\n`;
                }

                if (e.description) {
                    const desc =
                        e.description.length >
                        100
                            ? e.description.slice(
                                0,
                                100
                            ) + '...'
                            : e.description;

                    msg +=
                        `   📝 ${desc}\n`;
                }

                msg += '\n';
            }

            await m.reply(msg);
            await m.react('✅');

        } catch (err) {
            await m.react('❌');

            return m.reply(
                `❌ Error: ${err.message}`
            );
        }

        return;
    }

    // =====================================
    // .magma gunung <kode>
    // =====================================

    if (
        command === 'magma' &&
        args[0] === 'gunung' &&
        args[1]
    ) {
        await m.react('⏳');

        try {
            const code =
                args[1].toUpperCase();

            const status =
                await magma.getRealTimeStatus(
                    code
                );

            const msg =
                formatRealtimeStatusMessage(
                    status
                );

            if (
                status.visualPhoto &&
                subCfg.images
            ) {
                await conn.sendMessage(
                    m.chat,
                    {
                        image: {
                            url:
                                status.visualPhoto
                        },
                        caption: msg
                    },
                    {
                        quoted: m
                    }
                );

            } else {
                await m.reply(msg);
            }

            await m.react('✅');

        } catch (err) {
            await m.react('❌');

            return m.reply(
                `❌ Error: ${err.message}`
            );
        }

        return;
    }

    // =====================================
    // .magma catalog
    // =====================================

    if (
        command === 'magma' &&
        (
            text === 'catalog' ||
            text === 'katalog'
        )
    ) {
        await m.react('⏳');

        try {
            const catalog =
                await magma.getVolcanoCatalog();

            let msg =
                `🌋 *KATALOG GUNUNG API*\n`;

            msg +=
                `Total: ${catalog.length} gunung\n\n`;

            const byStatus = {
                1: [],
                2: [],
                3: [],
                4: []
            };

            for (const v of catalog) {
                if (
                    v.status &&
                    byStatus[v.status]
                ) {
                    byStatus[
                        v.status
                    ].push(v);
                }
            }

            const labels = {
                1: '🟢 Level I',
                2: '🟡 Level II',
                3: '🟠 Level III',
                4: '🔴 Level IV'
            };

            for (
                const [
                    level,
                    list
                ]
                of Object.entries(
                    byStatus
                )
            ) {
                if (
                    list.length === 0
                ) {
                    continue;
                }

                msg +=
                    `*${labels[level]}* (${list.length})\n`;

                for (
                    const v
                    of list
                ) {
                    msg +=
                        `  • ${v.name} (${v.code})\n`;
                }

                msg += '\n';
            }

            await m.reply(msg);
            await m.react('✅');

        } catch (err) {
            await m.react('❌');

            return m.reply(
                `❌ Error: ${err.message}`
            );
        }

        return;
    }

    // =====================================
    // HELP
    // =====================================

    if (
        command === 'magma' &&
        !text
    ) {
        return m.reply(
            `🌋 *MAGMA INDONESIA NOTIF*\n` +
            `━━━━━━━━━━━━━━━━━━━━━━\n\n` +

            `*Subscribe:*\n` +
            `• *.magma on* - Aktifkan notif\n` +
            `• *.magma off* - Matikan notif\n` +
            `• *.magma setting* - Lihat setting\n\n` +

            `*Customize:*\n` +
            `• *.magma image on/off* - Toggle foto\n\n` +

            `*Info:*\n` +
            `• *.magma list* - Erupsi terbaru\n` +
            `• *.magma catalog* - Semua gunung\n` +
            `• *.magma gunung <kode>* - Status gunung\n` +
            `• *.magma sekarang* - Cek manual\n\n` +

            `🛡️ *Initial Sync aktif*\n` +
            `🚫 Anti-spam aktif\n` +
            `🔄 Auto-check tetap aktif setelah restart`
        );
    }
};

// =========================================
// HANDLER CONFIG
// =========================================

handler.help = [
    'magma on',
    'magma off',
    'magma setting',
    'magma image on/off',
    'magma list',
    'magma catalog',
    'magma gunung <kode>',
    'magma sekarang'
];

handler.tags = [
    'notif',
    'info',
    'magma'
];

handler.command = /^magma$/i;
handler.admin = true;

export default handler;