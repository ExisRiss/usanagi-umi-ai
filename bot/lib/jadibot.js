import {
    readdirSync,
    existsSync,
    rmSync
} from 'fs';

import {
    join
} from 'path';

import pino from 'pino';

import {
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    DisconnectReason,
    Browsers
} from '@rexxhayanasi/elaina-baileys';

import {
    makeWASocket
} from './simple.js';
import { installAutoTyping } from './auto-typing.js';
import {
    loadJadibotConfig,
    runWithBotConfig
} from './bot-config.js';
import {
    noteSessionOnline,
    noteSessionOffline,
    noteSessionActivity,
    forgetSession,
    setSessionRemovalHook
} from './jadibot-session-cleaner.js';

const SESSIONS_DIR = './sessions/jadibot';

global.jadibotConns =
    global.jadibotConns || new Map();

// Per-session reconnect state survives a handler reload. It prevents stale
// socket events from replacing a newer, healthy Jadibot connection.
const jadibotReconnectTimers = globalThis.__usanagiJadibotReconnectTimers || new Map();
const jadibotReconnectAttempts = globalThis.__usanagiJadibotReconnectAttempts || new Map();
const jadibotConnectWatchdogs = globalThis.__usanagiJadibotConnectWatchdogs || new Map();
globalThis.__usanagiJadibotReconnectTimers = jadibotReconnectTimers;
globalThis.__usanagiJadibotReconnectAttempts = jadibotReconnectAttempts;
globalThis.__usanagiJadibotConnectWatchdogs = jadibotConnectWatchdogs;
const JADIBOT_CONNECT_TIMEOUT_MS = 45000;
const BAILEYS_VERSION_CACHE_MS = 6 * 60 * 60 * 1000;
let cachedBaileysVersion = null;
let cachedBaileysVersionExpires = 0;
let baileysVersionRequest = null;

async function getCachedBaileysVersion() {
    if (cachedBaileysVersion && cachedBaileysVersionExpires > Date.now()) return cachedBaileysVersion;
    if (baileysVersionRequest) return baileysVersionRequest;
    baileysVersionRequest = fetchLatestBaileysVersion()
        .then(({ version }) => {
            cachedBaileysVersion = version;
            cachedBaileysVersionExpires = Date.now() + BAILEYS_VERSION_CACHE_MS;
            return version;
        })
        .finally(() => { baileysVersionRequest = null; });
    return baileysVersionRequest;
}

setSessionRemovalHook(async number => {
    clearJadibotReconnect(number);
    clearJadibotWatchdog(number);
    const conn = global.jadibotConns.get(number);
    if (conn) {
        try { conn.ev?.removeAllListeners?.(); } catch {}
        try { conn.ws?.close?.(); } catch {}
        try { conn.end?.(); } catch {}
        global.jadibotConns.delete(number);
    }
});

function clearJadibotWatchdog(number) {
    const timer = jadibotConnectWatchdogs.get(number);
    if (timer) clearTimeout(timer);
    jadibotConnectWatchdogs.delete(number);
}

function clearJadibotReconnect(number, resetAttempts = true) {
    const timer = jadibotReconnectTimers.get(number);
    if (timer) clearTimeout(timer);
    jadibotReconnectTimers.delete(number);
    if (resetAttempts) jadibotReconnectAttempts.delete(number);
}

function scheduleJadibotReconnect({ number, sessionPath, mainConn }) {
    if (jadibotReconnectTimers.has(number)) return;
    const attempt = (jadibotReconnectAttempts.get(number) || 0) + 1;
    jadibotReconnectAttempts.set(number, attempt);
    const delay = Math.min(30000, 1200 * (2 ** Math.min(attempt - 1, 4))) + Math.floor(Math.random() * 350);
    const timer = setTimeout(async () => {
        jadibotReconnectTimers.delete(number);
        // A newer connection won the race while this timer waited.
        if (global.jadibotConns.has(number)) return;
        try {
            await connectSubBot({ number, sessionPath, mainConn, notifyChat: null, needsPairing: false });
        } catch {
            scheduleJadibotReconnect({ number, sessionPath, mainConn });
        }
    }, delay);
    jadibotReconnectTimers.set(number, timer);
}

function armJadibotConnectWatchdog({ number, sessionPath, mainConn, subConn }) {
    clearJadibotWatchdog(number);
    const timer = setTimeout(() => {
        if (global.jadibotConns.get(number) !== subConn || subConn.__jadibotConnected) return;
        // A socket stuck in `connecting` cannot process commands. Retire only
        // this generation, then let the guarded reconnect queue create a new one.
        global.jadibotConns.delete(number);
        try { subConn.ev.removeAllListeners(); } catch {}
        try { subConn.ws?.close(); } catch {}
        noteSessionOffline(number);
        scheduleJadibotReconnect({ number, sessionPath, mainConn });
    }, JADIBOT_CONNECT_TIMEOUT_MS);
    jadibotConnectWatchdogs.set(number, timer);
}


/* ============================================================
 * NORMALIZE NOMOR
 * ============================================================ */

function normalizeNumber(rawNumber) {
    let number = String(rawNumber || '')
        .replace(/[^0-9]/g, '');

    if (number.startsWith('0')) {
        number =
            '62' + number.slice(1);
    }

    return number;
}


/* ============================================================
 * TRACK SENT MESSAGE
 * ============================================================ */

function trackSentMessages(conn) {
    conn.sentMessageIds =
        new Set();

    const originalSendMessage =
        conn.sendMessage.bind(conn);

    conn.sendMessage =
        async (...args) => {

            const result =
                await originalSendMessage(...args);

            if (result?.key?.id) {

                conn.sentMessageIds.add(
                    result.key.id
                );

                setTimeout(() => {

                    conn.sentMessageIds?.delete(
                        result.key.id
                    );

                }, 15000);
            }

            return result;
        };

    return conn;
}


/* ============================================================
 * BUILD SUB CONNECTION
 * ============================================================ */

async function buildSubConn(sessionPath) {

    const sessionNumber = normalizeNumber(join(sessionPath).split(/[\\/]/).filter(Boolean).at(-1));
    const botConfig = loadJadibotConfig(sessionNumber, sessionPath);
    const performance = botConfig.values.runtimePerformance || {};

    const {
        state,
        saveCreds
    } =
        await useMultiFileAuthState(
            sessionPath
        );

    const version =
        await getCachedBaileysVersion();

    const handlerModule =
        await import('../handler.js');


    const subConn =
        trackSentMessages(
            installAutoTyping(
                makeWASocket({

                version,

                logger:
                    pino({
                        level: 'silent'
                    }),

                printQRInTerminal:
                    false,

                browser:
                    Browsers.ubuntu('Edge'),

                auth: {

                    creds:
                        state.creds,

                    keys:
                        makeCacheableSignalKeyStore(
                            state.keys,

                            pino()
                                .child({
                                    level: 'silent',
                                    stream: 'store'
                                })
                        )
                },

                generateHighQualityLinkPreview:
                    true,

                connectTimeoutMs:
                    Number(performance.connectTimeoutMs) || 60000,

                defaultQueryTimeoutMs:
                    0,

                syncFullHistory:
                    false,

                shouldSyncHistoryMessage:
                    () => false,

                markOnlineOnConnect:
                    true,

                keepAliveIntervalMs:
                    Number(performance.keepAliveIntervalMs) || 30000,

                retryRequestDelayMs:
                    Number(performance.retryRequestDelayMs) || 250,

                maxMsgRetryCount:
                    Number(performance.maxMessageRetries) || 5,

                shouldIgnoreJid:
                    () => false
                })
            )
        );

    subConn.isJadibot = true;
    subConn.jadibotNumber = sessionNumber;
    subConn.botConfig = botConfig;
    const bindScoped = fn => (...args) =>
        runWithBotConfig(subConn, () => fn.apply(subConn, args));


    /* ========================================================
     * SIMPAN CREDENTIALS
     * ======================================================== */

    subConn.ev.on(
        'creds.update',
        saveCreds
    );


    /* ========================================================
     * HANDLER UTAMA
     * ======================================================== */

    if (
        typeof handlerModule.handler ===
        'function'
    ) {

        subConn.handler =
            bindScoped(handlerModule.handler);

        subConn.ev.on(
            'messages.upsert',
            subConn.handler
        );
    }


    /* ========================================================
     * GROUP PARTICIPANTS
     * ======================================================== */

    if (
        typeof handlerModule.participantsUpdate ===
        'function'
    ) {

        subConn.participantsUpdate =
            bindScoped(handlerModule.participantsUpdate);

        subConn.ev.on(
            'group-participants.update',
            subConn.participantsUpdate
        );
    }


    /* ========================================================
     * GROUP UPDATE
     * ======================================================== */

    if (
        typeof handlerModule.groupsUpdate ===
        'function'
    ) {

        subConn.groupsUpdate =
            bindScoped(handlerModule.groupsUpdate);

        subConn.ev.on(
            'groups.update',
            subConn.groupsUpdate
        );
    }


    /* ========================================================
     * DELETE MESSAGE
     * ======================================================== */

    if (
        typeof handlerModule.deleteUpdate ===
        'function'
    ) {

        subConn.onDelete =
            bindScoped(handlerModule.deleteUpdate);

        subConn.ev.on(
            'message.delete',
            subConn.onDelete
        );
    }


    /*
     * Simpan authState supaya
     * bisa dipakai di luar.
     */

    subConn.authState =
        state;

    subConn.saveCreds =
        saveCreds;


    return subConn;
}


/* ============================================================
 * CONNECT SUB BOT
 * ============================================================ */

async function connectSubBot({
    number,
    sessionPath,
    mainConn,
    notifyChat,
    needsPairing = false,
    onPairingCode = null,
    onPairingError = null
}) {

    /*
     * Kalau sudah ada koneksi lama,
     * tutup terlebih dahulu.
     */

    clearJadibotWatchdog(number);
    clearJadibotReconnect(number, false);

    const oldConn =
        global.jadibotConns.get(
            number
        );

    if (oldConn) {

        try {
            oldConn.ev.removeAllListeners();
        } catch {}

        try {
            oldConn.ws?.close();
        } catch {}

        global.jadibotConns.delete(
            number
        );
    }


    const subConn =
        await buildSubConn(
            sessionPath
        );


    // A map entry means a socket is being created; only an `open` event marks
    // it ready to answer messages. This keeps website status truthful.
    subConn.__jadibotConnected = false;
    global.jadibotConns.set(
        number,
        subConn
    );


    let pairingRequested =
        false;


    /* ========================================================
     * CONNECTION UPDATE
     * ======================================================== */

    subConn.ev.on(
        'connection.update',
        async update => {

            const {
                connection,
                lastDisconnect
            } = update;

            // Ignore delayed events from an older socket. Without this guard a
            // stale close can tear down a newer working Jadibot and make it look
            // delayed or non-responsive.
            if (global.jadibotConns.get(number) !== subConn) return;


            /* ================================================
             * CONNECTING
             * ================================================ */

            if (
                connection ===
                'connecting'
            ) {

                console.log(
                    `[JADIBOT] ${number} connecting...`
                );
            }


            /* ================================================
             * REQUEST PAIRING CODE
             * ================================================ */

            if (
                needsPairing &&
                !subConn.authState.creds.registered &&
                !pairingRequested
            ) {

                pairingRequested =
                    true;


                setTimeout(
                    async () => {

                        try {

                            let code =
                                await subConn.requestPairingCode(
                                    number
                                );


                            code =
                                code
                                    ?.match(
                                        /.{1,4}/g
                                    )
                                    ?.join('-') ||
                                code;


                            console.log(
                                `[JADIBOT] Pairing ${number}: ${code}`
                            );

                            if (typeof onPairingCode === 'function') {
                                await onPairingCode(code, subConn);
                            }


                            if (
                                notifyChat &&
                                mainConn
                            ) {

                                await mainConn
                                    .sendMessage(
                                        notifyChat,
                                        {
                                            text:
                                                `🔑 *KODE PAIRING JADIBOT*\n\n` +
                                                `Nomor: *${number}*\n\n` +
                                                `Kode:\n` +
                                                `*${code}*\n\n` +
                                                `Buka WhatsApp > Perangkat Tertaut > ` +
                                                `Tautkan dengan nomor telepon, ` +
                                                `lalu masukkan kode di atas.`
                                        }
                                    )
                                    .catch(() => {});
                            }

                        } catch (e) {

                            console.error(
                                `[JADIBOT] Gagal request pairing ${number}:`,
                                e
                            );

                            if (typeof onPairingError === 'function') {
                                try { await onPairingError(e, subConn); } catch {}
                            }


                            global.jadibotConns.delete(
                                number
                            );


                            try {

                                rmSync(
                                    sessionPath,
                                    {
                                        recursive:
                                            true,
                                        force:
                                            true
                                    }
                                );

                            } catch {}


                            if (
                                notifyChat &&
                                mainConn
                            ) {

                                await mainConn
                                    .sendMessage(
                                        notifyChat,
                                        {
                                            text:
                                                `❌ Gagal membuat kode pairing untuk *${number}*.\n` +
                                                `Silakan coba lagi.`
                                        }
                                    )
                                    .catch(() => {});
                            }
                        }

                    },
                    2500
                );
            }


            /* ================================================
             * OPEN
             * ================================================ */

            if (
                connection ===
                'open'
            ) {

                subConn.__jadibotConnected = true;
                clearJadibotWatchdog(number);
                clearJadibotReconnect(number);
                noteSessionOnline(number);
                global.jadibotConns.set(
                    number,
                    subConn
                );


                console.log(
                    `[JADIBOT] ${number} berhasil terhubung`
                );


                /*
                 * Hanya kirim notifikasi
                 * ketika proses pairing baru.
                 */

                if (
                    notifyChat &&
                    mainConn
                ) {

                    await mainConn
                        .sendMessage(
                            notifyChat,
                            {
                                text:
                                    `✅ *JADIBOT BERHASIL!*\n\n` +
                                    `Nomor *${number}* sekarang aktif sebagai sub-bot 🎉`
                            }
                        )
                        .catch(() => {});
                }
            }


            /* ================================================
             * CLOSE
             * ================================================ */

            if (
                connection ===
                'close'
            ) {

                subConn.__jadibotConnected = false;
                clearJadibotWatchdog(number);
                // Delete this generation before queueing a single reconnect.
                // The map identity guard above makes late close events harmless.
                global.jadibotConns.delete(number);

                const statusCode =
                    lastDisconnect
                        ?.error
                        ?.output
                        ?.statusCode ||
                    lastDisconnect
                        ?.error
                        ?.data
                        ?.statusCode ||
                    lastDisconnect
                        ?.error
                        ?.statusCode ||
                    lastDisconnect
                        ?.error
                        ?.cause
                        ?.output
                        ?.statusCode ||
                    lastDisconnect
                        ?.error
                        ?.cause
                        ?.statusCode;


                console.log(
                    `[JADIBOT] ${number} disconnected (${statusCode || 'unknown'})`
                );

                // Mulai hitung mundur pembersihan otomatis (15 menit).
                noteSessionOffline(number);


                global.jadibotConns.delete(
                    number
                );


                /* ============================================
                 * LOGGED OUT
                 * ============================================ */

                if (
                    statusCode ===
                    DisconnectReason.loggedOut
                ) {

                    try {

                        rmSync(
                            sessionPath,
                            {
                                recursive:
                                    true,
                                force:
                                    true
                            }
                        );

                    } catch {}

                    forgetSession(number);
                    rmSync(
                        join('sessions-backup', number),
                        {
                            recursive: true,
                            force: true
                        }
                    );


                    console.log(
                        `[JADIBOT] ${number} logout, session dihapus`
                    );


                    if (
                        notifyChat &&
                        mainConn
                    ) {

                        await mainConn
                            .sendMessage(
                                notifyChat,
                                {
                                    text:
                                        `🔌 Sub-bot *${number}* logout.\n` +
                                        `Session sudah dihapus.`
                                }
                            )
                            .catch(() => {});
                    }


                    return;
                }


                /* ============================================
                 * AUTO RECONNECT
                 * ============================================ */

                console.log(
                    `[JADIBOT] ${number} mencoba reconnect...`
                );

                scheduleJadibotReconnect({ number, sessionPath, mainConn });
            }
        }
    );


    armJadibotConnectWatchdog({ number, sessionPath, mainConn, subConn });
    return subConn;
}


/* ============================================================
 * START SUB BOT
 * ============================================================ */

export async function startSubBot(
    m,
    mainConn,
    rawNumber
) {

    const number =
        normalizeNumber(
            rawNumber
        );


    if (
        !number ||
        number.length < 7 ||
        number.length > 15
    ) {

        return m.reply(
            `❌ *Format nomor salah!*\n\n` +
            `Contoh:\n` +
            `*.jadibot 628123456789*`
        );
    }


    if (
        global.jadibotConns.has(
            number
        )
    ) {

        return m.reply(
            `⚠️ Nomor *${number}* sudah menjadi sub-bot.`
        );
    }


    const sessionPath =
        join(
            SESSIONS_DIR,
            number
        );

    noteSessionActivity(number);


    await m.reply(
        `⏳ *Membuat sesi jadibot...*\n\n` +
        `Nomor: *${number}*\n\n` +
        `Tunggu sebentar sampai kode pairing dikirim.`
    );


    try {

        await connectSubBot({
            number,
            sessionPath,
            mainConn,
            notifyChat:
                m.chat,
            needsPairing:
                true
        });

    } catch (e) {

        console.error(
            `[JADIBOT] Start ${number} gagal:`,
            e
        );


        global.jadibotConns.delete(
            number
        );


        try {

            rmSync(
                sessionPath,
                {
                    recursive:
                        true,
                    force:
                        true
                }
            );

        } catch {}


        return m.reply(
            `❌ Gagal membuat sesi jadibot.\n\n` +
            `Error: ${e.message || e}`
        );
    }
}


/* ============================================================
 * API / WEBSITE HELPERS
 * ============================================================ */

export async function startSubBotForApi(rawNumber, mainConn = global.conn) {
    const number = normalizeNumber(rawNumber);
    if (!number || number.length < 7 || number.length > 15) {
        throw new Error('Format nomor WhatsApp tidak valid.');
    }
    if (global.jadibotConns.has(number)) {
        return { number, status: 'connected', code: null };
    }

    noteSessionActivity(number);
    const sessionPath = join(SESSIONS_DIR, number);
    let resolveCode;
    let rejectCode;
    const codePromise = new Promise((resolve, reject) => {
        resolveCode = resolve;
        rejectCode = reject;
    });
    const timeout = setTimeout(() => rejectCode(new Error('Timeout menunggu pairing code WhatsApp.')), 40000);

    try {
        await connectSubBot({
            number,
            sessionPath,
            mainConn,
            notifyChat: null,
            needsPairing: true,
            onPairingCode: code => resolveCode(code),
            onPairingError: error => rejectCode(error),
        });
        const code = await codePromise;
        return { number, status: 'pending', code };
    } finally {
        clearTimeout(timeout);
    }
}

export async function disconnectSubBot(rawNumber, { deleteSession = false } = {}) {
    const number = normalizeNumber(rawNumber);
    clearJadibotWatchdog(number);
    clearJadibotReconnect(number);
    const subConn = global.jadibotConns.get(number);
    if (subConn) {
        try { subConn.ev.removeAllListeners(); } catch {}
        try { subConn.ws?.close(); } catch {}
        try { subConn.end?.(); } catch {}
        global.jadibotConns.delete(number);
    }
    if (deleteSession) {
        try { rmSync(join(SESSIONS_DIR, number), { recursive: true, force: true }); } catch {}
        try { rmSync(join('sessions-backup', number), { recursive: true, force: true }); } catch {}
        forgetSession(number);
    } else {
        noteSessionOffline(number);
    }
    return Boolean(subConn || existsSync(join(SESSIONS_DIR, number)));
}

export async function restartSubBot(rawNumber, mainConn = global.conn) {
    const number = normalizeNumber(rawNumber);
    const sessionPath = join(SESSIONS_DIR, number);
    if (!existsSync(join(sessionPath, 'creds.json'))) throw new Error('Session belum memiliki kredensial terdaftar.');
    noteSessionActivity(number);
    await disconnectSubBot(number, { deleteSession: false });
    const conn = await connectSubBot({ number, sessionPath, mainConn, notifyChat: null, needsPairing: false });
    return conn;
}

/* ============================================================
 * STOP SUB BOT
 * ============================================================ */

export async function stopSubBot(rawNumber) {
    const number = normalizeNumber(rawNumber);
    const stopped = await disconnectSubBot(number, { deleteSession: true });
    if (stopped) console.log(`[JADIBOT] ${number} dihentikan`);
    return stopped;
}


/* ============================================================
 * RESTORE SUB BOT
 * ============================================================ */

export async function restoreSubBots(
    mainConn
) {

    if (
        !existsSync(
            SESSIONS_DIR
        )
    ) {

        return;
    }


    const folders =
        readdirSync(
            SESSIONS_DIR,
            {
                withFileTypes:
                    true
            }
        )
            .filter(
                d =>
                    d.isDirectory()
            );


    if (
        !folders.length
    ) {

        console.log(
            '[JADIBOT] Tidak ada session untuk direstore.'
        );

        return;
    }


    console.log(
        `[JADIBOT] Menemukan ${folders.length} session.`
    );


    for (
        const folder
        of folders
    ) {

        const number =
            folder.name;


        const sessionPath =
            join(
                SESSIONS_DIR,
                number
            );


        const credsFile =
            join(
                sessionPath,
                'creds.json'
            );


        if (
            !existsSync(
                credsFile
            )
        ) {

            console.log(
                `[JADIBOT] Skip ${number}, creds.json tidak ada.`
            );

            continue;
        }


        /*
         * Jangan restore dua kali.
         */

        if (
            global.jadibotConns.has(
                number
            )
        ) {

            continue;
        }


        try {

            await connectSubBot({
                number,
                sessionPath,
                mainConn,
                notifyChat:
                    null,
                needsPairing:
                    false
            });


            console.log(
                `[JADIBOT] Restore session ${number}`
            );

        } catch (e) {

            console.error(
                `[JADIBOT] Gagal restore ${number}:`,
                e
            );
            // A transient version/network failure during boot must not leave a
            // stored session permanently silent until the next container restart.
            scheduleJadibotReconnect({ number, sessionPath, mainConn });
        }


        /*
         * Jeda antar koneksi.
         */

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    350
                )
        );
    }
}


/* ============================================================
 * GET SUB BOT
 * ============================================================ */

export function getSubBot(
    rawNumber
) {

    const number =
        normalizeNumber(
            rawNumber
        );

    return global.jadibotConns.get(
        number
    );
}


/* ============================================================
 * CEK SUB BOT
 * ============================================================ */

export function hasSubBot(
    rawNumber
) {

    const number =
        normalizeNumber(
            rawNumber
        );

    return Boolean(global.jadibotConns.get(number)?.__jadibotConnected);
}


/* ============================================================
 * LIST SUB BOT
 * ============================================================ */

export function getSubBots() {

    return Array.from(
        global.jadibotConns.entries()
    );
}


/* ============================================================
 * JUMLAH SUB BOT
 * ============================================================ */

export function getSubBotCount() {

    return global.jadibotConns.size;
}