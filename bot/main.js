import { initializeUnifiedRpg } from './lib/rpg/unified-runtime.js';
import fs from 'fs';
import { spawn } from 'child_process';
import { tmpdir } from 'os';
import { format } from 'util';
import { parentPort } from 'worker_threads';
import path, { join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { platform } from 'process';
import { createRequire } from 'module';

import chalk from 'chalk';
import pino from 'pino';
import syntaxerror from 'syntax-error';
import { Low, JSONFile } from 'lowdb';

import { makeWASocket, protoType, serialize } from './lib/simple.js';
import { installAutoTyping } from './lib/auto-typing.js';
import { installBotConfigAccessors, getMainBotConfig } from './lib/bot-config.js';
import { installRpgGlobals } from './lib/rpg/awang-rpg-globals.js';
import { installApiGlobals } from './lib/api-globals.js';
import { syncMainPrefix } from './core/awang-prefix.js';
import { getExplicitlyEnabledWelcomeGroups } from './core/awang-welcome.js';
import { startJadibotPlatformApi } from './lib/jadibot-platform-api.js';
import { startGameRoomNotifier } from './lib/game-room-notifier.js';
import { installAutoBackup, updateAutoBackupConnection } from './lib/auto-backup.js';
import { normalizePluginText, storedDefaultPrefix } from './core/awang-prefix-text.js';
import { startJadibotSessionCleaner } from './lib/jadibot-session-cleaner.js';
import { startVercelBackupScheduler } from './lib/vercel-backup-scheduler.js';
import { startBackupSystem } from './lib/backup/service.js';
import { startPlatform, stopPlatform } from './lib/platform/index.js';
import { readMainBotState, writeMainBotState, normalizeMainBotNumber } from './lib/main-bot-config.js';
import { applyMainBotSettingsAtBoot, syncMainBotSettingsProfile } from './lib/main-bot-settings.js';
import { installErrorHooks } from './lib/error-hub.js';
// Task90: handler event 'call' memanggil isAnticallActive() tetapi fungsinya
// belum pernah diimpor, sehingga setiap panggilan masuk memicu
// unhandledRejection "isAnticallActive is not defined" (~15 kali di log).
import { isAnticallActive } from './core/awang-call.js';
import {
    useMultiFileAuthState,
    initAuthCreds,
    Browsers,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    DisconnectReason
} from '@rexxhayanasi/elaina-baileys';

/* ============================================================
 * JADIBOT LIBRARY
 * ============================================================ */
import {
    startSubBot, stopSubBot, restoreSubBots, getSubBot,
    hasSubBot, getSubBots, getSubBotCount
} from './lib/jadibot.js';

/* ============================================================
 * GLOBAL PATH
 * ============================================================ */
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
    return rmPrefix
        ? (/file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL)
        : pathToFileURL(pathURL).toString();
};

global.__dirname = function dirname(pathURL) {
    return path.dirname(global.__filename(pathURL, true));
};

global.__require = function require(dir = import.meta.url) {
    return createRequire(dir);
};

const __dirname = global.__dirname(import.meta.url);

/* ============================================================
 * GLOBAL
 * ============================================================ */
global.opts = global.opts || {};
global.prefix = global.prefix || /^[./#!]/;
global.stopped = false;

/* ============================================================
 * PUSAT ERROR (log berkas + notifikasi Telegram)
 * Dipasang paling awal supaya error saat boot pun terlaporkan.
 * ============================================================ */
try {
    installErrorHooks();
    console.log(chalk.gray('🧯 Pusat error aktif: data/errors/*.jsonl + notifikasi Telegram.'));
} catch (error) {
    console.log(chalk.yellow('Pusat error gagal dipasang:'), error?.message);
}

/* ============================================================
 * CONFIG
 * ============================================================ */
try {
    if (fs.existsSync('./config.js')) {
        await import('./config.js');
        console.log('Config loaded');
    } else {
        console.log('config.js tidak ditemukan! Membuat default...');
        fs.writeFileSync('./config.js', `
global.owner = ['628xxx'];
global.anticall = true;
`);
    }
} catch (e) {
    console.log('Error loading config:', e.message);
}
installBotConfigAccessors();
// Prefix default pilihan owner (disimpan di data/prefix-settings.json) menang
// atas nilai bawaan config.js, supaya setelan tidak hilang saat restart.
const savedPrefix = storedDefaultPrefix();
if (savedPrefix) {
    if (!global.mainBot) global.mainBot = {};
    global.mainBot.defaultPrefix = savedPrefix;
}
if (syncMainPrefix(global.mainBot?.defaultPrefix, global.mainBot?.prefixRevision)) {
    console.log(`Prefix bot utama disinkronkan ke: ${global.mainBot.defaultPrefix}`);
}

/* ============================================================
 * BAILEYS PROTOTYPE
 * ============================================================ */
protoType();
serialize();

/* ============================================================
 * DATABASE
 * ============================================================ */
global.db = new Low(new JSONFile('database.json'));

global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) {
        return new Promise(resolve => {
            const timer = setInterval(async () => {
                if (!global.db.READ) {
                    clearInterval(timer);
                    resolve(global.db.data == null ? global.loadDatabase() : global.db.data);
                }
            }, 1000);
        });
    }

    if (global.db.data !== null) return;

    global.db.READ = true;
    await global.db.read().catch(console.error);
    global.db.READ = null;

    global.db.data = {
        users: {},
        chats: {},
        stats: {},
        msgs: {},
        sticker: {},
        settings: {},
        ...(global.db.data || {})
    };
};

await global.loadDatabase();

/* Setting bot utama (kalau owner sudah menyimpannya dari website) dimuat
 * setelah database siap supaya prefix, mode public/self, limit, AutoAI, dan
 * Only Group langsung konsisten sebelum socket WhatsApp dibuat. */
try {
    const bootMainBotSettings = await applyMainBotSettingsAtBoot();
    if (bootMainBotSettings) {
        console.log(chalk.gray(`[MAIN-BOT] Setting utama dimuat: ${bootMainBotSettings.botName} · prefix ${bootMainBotSettings.prefix}`));
    }
} catch (error) {
    console.log(chalk.yellow('[MAIN-BOT] Setting utama gagal dimuat:'), error?.message || error);
}

const unifiedRpgStore = initializeUnifiedRpg();

// /welcome on is stored in SQLite, whereas the long-running participant
// listener reads the established chat.welcome flag. Reconcile explicit modern
// settings at startup so an enabled Welcome can never appear active but fail
// to send when a member joins.
function syncEnabledWelcomeEvents() {
    const chats = global.db?.data?.chats;
    if (!chats) return 0;

    let synchronized = 0;
    try {
        for (const chatId of getExplicitlyEnabledWelcomeGroups()) {
            chats[chatId] ||= {};
            if (chats[chatId].welcome === true) continue;
            chats[chatId].welcome = true;
            synchronized += 1;
        }
    } catch (error) {
        console.error('Welcome event state tidak dapat disinkronkan:', error.message);
    }

    return synchronized;
}

const synchronizedWelcomeEvents = syncEnabledWelcomeEvents();
if (synchronizedWelcomeEvents > 0) {
    console.log(`Welcome event disinkronkan untuk ${synchronizedWelcomeEvents} group.`);
}

/* ============================================================
 * DATABASE REPAIR
 * ============================================================ */
console.log('Repairing database...');
let repaired = 0;

for (const id in global.db.data.users) {
    const user = global.db.data.users[id];
    if (!user) continue;

    // Unified authority owns progression; never repair held identities through legacy aliases.
    if (!unifiedRpgStore) {
        if (!Number.isFinite(user.exp)) { user.exp = 0; repaired++; }
        if (!Number.isFinite(user.level)) { user.level = 0; repaired++; }
        if (!Number.isFinite(user.money)) { user.money = 0; repaired++; }
    }
    if (!Number.isFinite(user.limit)) { user.limit = 50; repaired++; }

    user.premiumTime ??= 0;
    if (!unifiedRpgStore) {
        user.lastclaim ??= 0;
        user.lastWarn ??= 0;
    }
}

console.log(`Repair selesai (${repaired} field diperbaiki)`);

/* ============================================================
 * MAIN AUTH
 * ============================================================ */
if (fs.existsSync('./sessions/creds.json')) {
    try {
        const creds = JSON.parse(fs.readFileSync('./sessions/creds.json', 'utf-8'));
        if (!creds?.registered) {
            console.log(chalk.yellow('Sesi belum terdaftar. Data sesi dipertahankan untuk melanjutkan pairing.'));
        }
    } catch (error) {
        // Jangan menghapus seluruh sesi dan signal keys. Simpan kredensial rusak
        // sebagai backup agar bot tidak tiba-tiba kehilangan sesi permanen.
        const backup = `./sessions/creds.corrupt-${Date.now()}.json`;
        try { fs.renameSync('./sessions/creds.json', backup); } catch {}
        console.error(chalk.red(`creds.json rusak dan dipindahkan ke ${backup}:`), error.message);
    }
}

const { state, saveCreds } = await useMultiFileAuthState('sessions');
const { version } = await fetchLatestBaileysVersion();

/* ============================================================
 * CONNECTION OPTIONS
 * ============================================================ */
const runtimePerformance = global.runtimePerformance || {};

const connectionOptions = {
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    version,
    logger: pino({ level: 'silent' }),
    browser: Browsers.ubuntu('Chrome'),
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    shouldSyncHistoryMessage: () => false,
    markOnlineOnConnect: true,
    connectTimeoutMs: Number(runtimePerformance.connectTimeoutMs) || 45000,
    keepAliveIntervalMs: Number(runtimePerformance.keepAliveIntervalMs) || 15000,
    retryRequestDelayMs: Number(runtimePerformance.retryRequestDelayMs) || 100,
    maxMsgRetryCount: Number(runtimePerformance.maxMessageRetries) || 10,
    defaultQueryTimeoutMs: 60000,
    printQRInTerminal: false
};

/* ============================================================
 * SETTING BOT UTAMA
 * ============================================================ */
// Bot utama bisa dimatikan total dari website. Kalau nonaktif, bot tidak
// mencoba menyambung, tidak memunculkan prompt pairing, dan tidak ikut
// reconnect berulang. Jadibot serta API platform tetap berjalan normal.
const mainBotState = readMainBotState();
global.mainBotEnabled = mainBotState.enabled;
if (mainBotState.pairingNumber) {
    // Dipakai requestPairing() supaya tidak perlu prompt manual.
    process.env.PAIRING_NUMBER = mainBotState.pairingNumber;
}
console.log(
    mainBotState.enabled
        ? chalk.green('⚙️ Bot utama: AKTIF')
        : chalk.yellow('⚙️ Bot utama: NONAKTIF (diatur dari website > halaman Bot Utama)')
);

/** Simpan nomor pairing yang dipakai saat bot utama menyambung. */
global.applyMainPairingNumber = function (number) {
    const clean = normalizeMainBotNumber(number);
    if (clean.length < 8 || clean.length > 15) {
        throw Object.assign(new Error('Nomor bot utama tidak valid.'), { status: 400 });
    }
    writeMainBotState({ pairingNumber: clean });
    process.env.PAIRING_NUMBER = clean;
    global.pairingUnavailable = false;
    global.pairingRequested = false;
    console.log(chalk.cyan(`🔐 Nomor bot utama disimpan (${clean.slice(0, 4)}…${clean.slice(-3)}). Menunggu pairing code...`));
    return clean;
};

/** Nyalakan/matikan bot utama tanpa restart panel. */
global.setMainBotEnabled = async function (enabled) {
    const next = Boolean(enabled);
    writeMainBotState({ enabled: next });
    global.mainBotEnabled = next;

    if (!next) {
        global.pairingUnavailable = true;
        global.pairingInputShown = false;
        global.mainPairingSocketReady = false;
        try { global.mainPairingReadline?.close(); } catch {}
        global.mainPairingReadline = null;
        clearReconnectState();
        try { await global.conn?.ws?.close(); } catch {}
        console.log(chalk.yellow('⚙️ Bot utama dimatikan. Jadibot & API platform tetap jalan.'));
        return { enabled: false };
    }

    global.pairingUnavailable = false;
    console.log(chalk.green('⚙️ Bot utama diaktifkan. Menyambung ulang...'));
    try { await global.reloadHandler(true); } catch (error) { console.log(chalk.red('Gagal mengaktifkan bot utama:'), error.message); }
    return { enabled: true };
};

/* ============================================================
 * MAIN CONNECTION
 * ============================================================ */
global.conn = installAutoTyping(makeWASocket(connectionOptions));
global.conn.botConfig = getMainBotConfig();
syncMainBotSettingsProfile(global.conn.botConfig);
global.conn.isJadibot = false;
startJadibotPlatformApi();
startGameRoomNotifier();
startVercelBackupScheduler();
// Sistem backup 10 menit + bot Telegram + REST API /api/backup-system.
startBackupSystem();
// Ekosistem multi-aplikasi: adapter Telegram + service bersama (RBAC, server,
// saham, RPG, media to-URL). Tidak membuat socket WhatsApp kedua dan tidak
// mengubah perilaku bot WhatsApp yang sudah berjalan.
startPlatform().catch(error => console.error('[PLATFORM] Gagal start:', error.message));
for (const signal of ['SIGTERM', 'SIGINT']) {
    process.on(signal, () => {
        stopPlatform().catch(() => {}).finally(() => process.exit(0));
    });
}
installAutoBackup(global.conn);
startJadibotSessionCleaner();

/* ============================================================
 * PAIRING FUNCTION
 * ============================================================ */
const MAIN_PAIRING_SOCKET_WAIT_MS = 20000;
const MAIN_PAIRING_REQUEST_DELAY_MS = 2500;
const MAIN_PAIRING_REQUEST_COOLDOWN_MS = 45000;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

global.pairingRequested = false;
global.pairingInputShown = false;
global.mainPairingReadline = null;
// Di-set true kalau nomor pairing tidak bisa didapat sama sekali, supaya
// percobaan reconnect tidak menumpuk log error yang sama tanpa henti.
global.pairingUnavailable = false;
/**
 * Pairing hanya boleh dimulai oleh tindakan owner (tombol MINTA CODE di panel
 * atau menyimpan nomor baru). Sebelum Task90, socket tanpa sesi langsung
 * meminta kode sendiri: owner menghapus sesi, eh WhatsApp malah mengirim
 * permintaan pairing tanpa diminta. Semua jalur otomatis wajib cek flag ini.
 */
global.mainPairingExplicit = false;
// Kapan terakhir kode pairing diminta (ms). WhatsApp membatasi permintaan
// berulang, jadi ada jeda minimum antar percobaan.
let lastPairingCodeRequestAt = 0;

function normalizeMainPairingNumber(value) {
    let number = String(value || '').replace(/\D/g, '');
    if (number.startsWith('0')) number = `62${number.slice(1)}`;
    else if (number.startsWith('8')) number = `62${number}`;
    return number;
}

function mainPairingSocketUsable(conn = global.conn) {
    if (!conn || !global.mainPairingSocketReady) return false;
    const readyState = conn.ws?.readyState;
    // Baileys exposes a WHATWG/WebSocket ready state in current releases. Keep
    // compatibility with adapters that do not expose it but have emitted
    // `connecting`, then wait the guarded delay below before requesting a code.
    return readyState === undefined || readyState === 1 || readyState === 'open';
}

async function waitForMainPairingSocket(timeoutMs = MAIN_PAIRING_SOCKET_WAIT_MS) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        const conn = global.conn;
        if (mainPairingSocketUsable(conn)) return conn;
        await pause(250);
    }
    return null;
}

/* Dipakai tombol "MINTA CODE" di website. Permintaan manual tidak boleh
 * ditelan diam-diam oleh guard otomatis (cooldown/pairingUnavailable), karena
 * pemilik yang menekan tombol harus melihat kode atau alasan gagalnya. */
const MAIN_MANUAL_PAIRING_MIN_GAP_MS = 5000;

/* Terjemahkan error teknis Baileys/WhatsApp supaya halaman Bot Utama tidak
 * menampilkan istilah library, dan beri saran tindakan yang benar. */
function mainPairingFriendlyError(rawMessage) {
    const message = String(rawMessage || '').trim();
    if (/already pending/i.test(message)) return 'Kode pairing sebelumnya masih aktif di WhatsApp. Masukkan kode itu dulu, atau tunggu ±60 detik lalu minta kode lagi.';
    if (/rate-overlimit|rate.?limit|too many/i.test(message)) return 'WhatsApp membatasi permintaan kode (rate-overlimit). Tunggu ±10 menit sebelum minta kode lagi; jangan menekan tombol berulang.';
    if (/never answered the pairing request|timed?\s?out/i.test(message)) return 'WhatsApp belum menjawab permintaan kode. Tunggu 1–2 menit lalu coba MINTA CODE LAGI.';
    if (/connection failure|connection terminated|stream errored|connection closed|socket/i.test(message)) return 'Koneksi WhatsApp terputus saat pairing. Tekan HAPUS SESI BOT UTAMA, lalu MINTA CODE LAGI.';
    if (/logged\s?out|sesi telah logout/i.test(message)) return 'Sesi bot utama sudah logout. Tekan HAPUS SESI BOT UTAMA, lalu MINTA CODE LAGI.';
    return message || 'Pairing gagal. Coba lagi.';
}

global.requestPairing = async function(options = {}) {
    const force = options === true || options?.force === true;
    if (!global.mainBotEnabled) return global.lastPairingCode || null;
    if (global.conn?.authState?.creds?.registered && !force) return null;
    if (force) {
        // Jeda kecil saja supaya tombol tidak menembak WhatsApp berulang kali.
        if (Date.now() - lastPairingCodeRequestAt < MAIN_MANUAL_PAIRING_MIN_GAP_MS) {
            return global.lastPairingCode || null;
        }
        global.pairingUnavailable = false;
        global.pairingRequested = false;
        global.pairingInputShown = false;
        global.lastPairingError = null;
    } else {
        if (global.pairingRequested || global.pairingInputShown) return null;
        if (global.pairingUnavailable) return null;
        if (Date.now() - lastPairingCodeRequestAt < MAIN_PAIRING_REQUEST_COOLDOWN_MS) return null;
        global.lastPairingError = null;
    }
    global.pairingInputShown = true;

    // Nomor bisa diberikan lewat environment PAIRING_NUMBER.
    //
    // Ini penting di panel: perintah start menjalankan bot sebagai job latar
    // pada shell non-interaktif, dan shell seperti itu memberikan /dev/null
    // sebagai stdin. Akibatnya prompt readline langsung menerima EOF dan
    // tertutup seketika, sehingga nomor yang diketik di konsol panel tidak
    // pernah sampai. Kalau nomornya sudah ada di env, tidak perlu prompt.
    const envPairingNumber = normalizeMainPairingNumber(process.env.PAIRING_NUMBER || '');
    const canPrompt = !envPairingNumber && process.stdin.readable !== false;

    let rl = null;
    let ask = null;
    if (canPrompt) {
        const readline = await import('node:readline');
        rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        global.mainPairingReadline = rl;
        ask = prompt => new Promise(resolve => {
            let settled = false;
            const onClose = () => done(null);
            const done = value => {
                if (settled) return;
                settled = true;
                rl.removeListener('close', onClose);
                resolve(value);
            };
            rl.once('close', onClose);
            rl.question(prompt, answer => done(answer));
        });
    }

    try {
        let phoneNumber = envPairingNumber;

        if (envPairingNumber) {
            // Nomor sengaja tidak dicetak ke log.
            console.log(chalk.cyan('🔐 Pairing: memakai nomor dari PAIRING_NUMBER.'));
        } else if (!canPrompt) {
            global.pairingUnavailable = true;
            console.log(chalk.red('❌ Pairing dilewati: stdin tidak bisa dibaca (bukan terminal).'));
            console.log(chalk.yellow('   Isi variabel PAIRING_NUMBER di panel (Startup → Variables),'));
            console.log(chalk.yellow('   atau jalankan bot di latar depan agar konsol panel bisa dipakai.'));
            console.log(chalk.yellow('   Bot tetap jalan tanpa WhatsApp sampai di-restart setelah diisi.'));
            throw new Error('Nomor pairing tidak tersedia (stdin tidak bisa dibaca).');
        } else {
            console.log(chalk.cyan('\n╭────────「 USANAGI UMI AI 」────────╮'));
            console.log(chalk.cyan('│  🔐 MANUAL PAIRING MODE'));
            console.log(chalk.cyan('│  Masukkan nomor internasional tanpa +'));
            console.log(chalk.cyan('╰─────────────────────────────╯'));

            // Retry only the manual input locally. This never repeats a pairing-code
            // request and keeps the entered number out of logs.
            while (!phoneNumber) {
                const answer = await ask(chalk.yellow('📱 Masukkan nomor WhatsApp: '));
                if (answer === null) throw new Error('Prompt pairing ditutup karena koneksi sedang dibuat ulang.');
                const candidate = normalizeMainPairingNumber(answer);
                if (candidate.length >= 8 && candidate.length <= 15) {
                    phoneNumber = candidate;
                } else {
                    console.log(chalk.yellow('⚠️ Nomor tidak valid. Gunakan format 628xxxxxxxxxx, lalu coba lagi.'));
                }
            }
        }

        // Socket bisa berganti tepat setelah sesi dihapus/di-reload (tombol HAPUS
        // SESI). Dulu kondisi itu langsung menggagalkan pairing walau hanya
        // transien, sehingga owner harus menekan tombol dua kali. Sekarang
        // tunggu socket baru dan ulangi pemeriksaan beberapa kali.
        let pairingConn = null;
        console.log(chalk.blue('\n⏳ Menyiapkan pairing code...'));
        for (let attempt = 0; attempt < 4 && !pairingConn; attempt += 1) {
            const candidate = await waitForMainPairingSocket(attempt === 0 ? MAIN_PAIRING_SOCKET_WAIT_MS : 15000);
            if (!candidate) break;
            await pause(MAIN_PAIRING_REQUEST_DELAY_MS);
            if (candidate === global.conn && mainPairingSocketUsable(candidate)) pairingConn = candidate;
        }
        if (!pairingConn) {
            throw new Error('Socket WhatsApp belum siap atau sedang berganti. Tunggu beberapa detik lalu minta kode lagi.');
        }

        global.pairingRequested = true;
        lastPairingCodeRequestAt = Date.now();
        const rawCode = await pairingConn.requestPairingCode(phoneNumber);
        const normalizedCode = String(rawCode || '').replace(/[^a-z0-9]/gi, '').toUpperCase();
        const code = normalizedCode.match(/.{1,4}/g)?.join('-') || normalizedCode;
        if (!code) throw new Error('Server WhatsApp tidak mengembalikan pairing code.');
        // Pairing code is intentionally printed only to the live Pterodactyl
        // console so the owner can enter it in WhatsApp; it is never persisted.
        console.log(`\nPAIRING CODE: ${code}\n`);
        // Disimpan hanya di memori (tidak ke berkas/log) supaya owner bisa
        // membacanya dari halaman Bot Utama tanpa membuka konsol panel.
        global.lastPairingCode = { code, at: Date.now() };
        global.lastPairingError = null;
        console.log(chalk.green('✅ Buka WhatsApp → Perangkat tertaut → Tautkan dengan nomor telepon.\n'));
        return global.lastPairingCode;
    } catch (error) {
        global.pairingRequested = false;
        const rawMessage = String(error?.message || 'Pairing gagal.');
        // Pesan teknis Baileys diterjemahkan supaya halaman Bot Utama tidak
        // menampilkan instruksi library (cancelPairingCode) ke owner.
        const friendly = mainPairingFriendlyError(rawMessage);
        global.lastPairingError = friendly;
        console.log(chalk.red('❌ Pairing belum berhasil:'), rawMessage);
        return null;
    } finally {
        global.pairingInputShown = false;
        if (rl) {
            if (global.mainPairingReadline === rl) global.mainPairingReadline = null;
            try { rl.close(); } catch {}
        }
    }
};

/* Permintaan pairing dari halaman Bot Utama di website.
 *
 * Bedanya dengan requestPairing(): permintaan ini manual (tombol owner),
 * jadi tidak boleh "diam saja" karena cooldown atau pairingUnavailable.
 * Kalau gagal, alasannya dilempar ke pemanggil supaya tampil di website. */
global.requestMainPairing = async function() {
    // Sampai di sini berarti owner memang meminta kode (tombol panel atau
    // nomor baru disimpan). Izinkan jalur pairing berjalan.
    global.mainPairingExplicit = true;
    if (!global.mainBotEnabled) {
        throw Object.assign(new Error('Bot utama sedang nonaktif. Aktifkan dulu lalu coba lagi.'), { status: 409 });
    }
    // Baileys menolak permintaan kedua selama kode sebelumnya masih pending.
    // Kalau kode lama masih muda, tampilkan kode itu lagi (masih berlaku di
    // WhatsApp) daripada melempar error teknis berbahasa Inggris ke website.
    const previous = global.lastPairingCode;
    if (previous?.code && Date.now() - previous.at < 75000) {
        global.lastPairingError = null;
        return { ...previous, reused: true };
    }
    if (global.conn?.authState?.creds?.registered) {
        throw Object.assign(new Error('Sesi bot utama masih tertaut. Hapus sesi dulu kalau ingin pairing nomor baru.'), { status: 409 });
    }
    global.pairingPending = true;
    try {
        global.lastPairingError = null;
        // Socket bisa "siap" di flag tapi ws-nya sudah tertutup (mis. setelah
        // RESET CONFIG). Coba tunggu dulu; kalau tetap tidak bisa dipakai,
        // paksa muat ulang handler sekali lalu tunggu lagi.
        let readyConn = await waitForMainPairingSocket(12000);
        if (!readyConn && typeof global.reloadHandler === 'function') {
            try { await global.reloadHandler(true) } catch {}
            readyConn = await waitForMainPairingSocket(20000);
        }
        if (!readyConn) {
            throw Object.assign(new Error(global.lastPairingError || 'Socket WhatsApp belum siap. Tunggu beberapa detik lalu coba lagi.'), { status: 503 });
        }
        const result = await global.requestPairing({ force: true });
        if (!result?.code) {
            throw Object.assign(new Error(global.lastPairingError || 'WhatsApp belum mengembalikan kode pairing. Coba lagi.'), { status: 502 });
        }
        return result;
    } finally {
        global.pairingPending = false;
    }
};

/* Hapus sesi WhatsApp bot utama (sessions/* di root) lalu siapkan socket baru.
 * Folder sessions/jadibot/<nomor> TIDAK disentuh — sesi jadibot tetap jalan. */
global.resetMainBotSession = async function() {
    const sessionDir = path.join(process.cwd(), 'sessions');
    try { await global.conn?.ws?.close(); } catch {}
    const removed = [];
    try {
        for (const entry of fs.readdirSync(sessionDir, { withFileTypes: true })) {
            if (!entry.isFile()) continue;
            try { fs.unlinkSync(path.join(sessionDir, entry.name)); removed.push(entry.name); } catch {}
        }
    } catch {}
    // Creds di memori ikut direset: tanpa ini makeWASocket() berikutnya tetap
    // memakai creds lama yang masih "registered" sehingga pairing tidak muncul.
    try {
        const fresh = initAuthCreds();
        for (const key of Object.keys(state.creds)) delete state.creds[key];
        Object.assign(state.creds, fresh);
    } catch (error) {
        console.log(chalk.yellow('[MAIN-BOT] Gagal mereset creds di memori:'), error.message);
    }
    global.pairingRequested = false;
    global.pairingInputShown = false;
    global.pairingUnavailable = false;
    global.lastPairingCode = null;
    global.lastPairingError = null;
    lastPairingCodeRequestAt = 0;
    // Sesi dihapus bukan berarti minta kode baru. Pairing hanya dimulai lagi
    // kalau owner menekan MINTA CODE.
    global.mainPairingExplicit = false;
    console.log(chalk.yellow(`[MAIN-BOT] Sesi bot utama dihapus (${removed.length} berkas). Pairing ulang hanya berjalan setelah owner memintanya.`));
    return { removed: removed.length };
};

/* Hapus konfigurasi bot utama (.main-bot.env): nomor pairing & status on/off.
 * Setelah reset, bot utama aktif dan siap menerima nomor baru dari website. */
global.resetMainBotConfig = async function() {
    try { fs.rmSync(path.join(process.cwd(), '.main-bot.env'), { force: true }); } catch {}
    delete process.env.PAIRING_NUMBER;
    // Jangan paksa bot utama menyala: kalau owner sengaja mematikannya,
    // reset konfigurasi tidak boleh mengaktifkannya diam-diam.
    global.mainPairingExplicit = false;
    global.pairingRequested = false;
    global.pairingInputShown = false;
    global.pairingUnavailable = false;
    global.lastPairingCode = null;
    global.lastPairingError = null;
    lastPairingCodeRequestAt = 0;
    console.log(chalk.yellow('[MAIN-BOT] Konfigurasi bot utama direset: nomor pairing dihapus, status on/off tidak diubah.'));
    return { enabled: Boolean(global.mainBotEnabled), pairingNumber: '' };
};

/* ============================================================
 * DATABASE AUTO SAVE
 * ============================================================ */
if (global.db) {
    let dbWriteInProgress = false;

    // Menulis database setiap 2 detik membuat event loop tersendat ketika data
    // membesar. Simpan terjadwal dan cegah write yang saling tumpang tindih.
    setInterval(async () => {
        if (dbWriteInProgress || !global.db.data) return;
        dbWriteInProgress = true;
        try {
            await global.db.write();
        } catch (error) {
            console.error('[DATABASE SAVE]', error);
        } finally {
            dbWriteInProgress = false;
        }
    }, Number(runtimePerformance.dbSaveIntervalMs) || 30000);

    // Pembersihan file sementara tidak perlu menjalankan proses `find` tiap 2 detik.
    setInterval(() => {
        if (!(global.support || {}).find) return;
        const maxAge = String(Math.max(1, Number(runtimePerformance.tempMaxAgeMinutes) || 10));
        for (const filename of [tmpdir(), 'tmp']) {
            const child = spawn('find', [filename, '-amin', maxAge, '-type', 'f', '-delete'], {
                stdio: 'ignore'
            });
            child.unref();
        }
        // Task90: pembersih sebelumnya hanya menghapus BERKAS, sehingga folder
        // sementara yt-dlp (PyInstaller membongkar dirinya ke /tmp/_MEIxxxx,
        // ±60 MB tiap proses) menumpuk sampai disk penuh (ENOSPC) dan sesi
        // WhatsApp gagal disimpan. Bersihkan folder _MEI yang sudah tua.
        const meimei = spawn('find', [tmpdir(), '-maxdepth', '1', '-name', '_MEI*', '-type', 'd', '-mmin', '+30', '-exec', 'rm', '-rf', '{}', '+'], {
            stdio: 'ignore'
        });
        meimei.unref();
        // Folder kerja unduhan kita sendiri (usanagi-*, diag-*, recheck-*).
        const workDirs = spawn('find', [tmpdir(), '-maxdepth', '1', '-type', 'd', '-mmin', '+30', '-name', 'usanagi-*', '-exec', 'rm', '-rf', '{}', '+'], {
            stdio: 'ignore'
        });
        workDirs.unref();
    }, Number(runtimePerformance.tempCleanupIntervalMs) || 300000);
}

/* ============================================================
 * CHANNEL FOLLOW
 * ============================================================ */
const anu = [
    "120363427335271866@newsletter",
    "120363432093486679@newsletter"
];
let followed = true; //ubah ke false kalo mo auto foll berjalan

/* ============================================================
 * JADIBOT RESTORE
 * Main-bot authentication is optional for previously paired Jadibots. Restore
 * them independently so a main-bot re-pair never makes healthy sessions silent.
 * ============================================================ */
let jadibotRestored = false;
let jadibotRestoreInFlight = null;

async function restoreJadibotsIndependently() {
    if (jadibotRestored) return true;
    if (jadibotRestoreInFlight) return jadibotRestoreInFlight;

    jadibotRestoreInFlight = (async () => {
        try {
            await restoreSubBots(global.conn);
            jadibotRestored = true;
            return true;
        } catch {
            // Do not expose session identifiers in generic startup errors. A main
            // connection-open event can safely make a later restore attempt.
            console.error(chalk.red('[JADIBOT] Pemulihan sesi gagal; akan dicoba lagi saat koneksi utama tersedia.'));
            return false;
        } finally {
            jadibotRestoreInFlight = null;
        }
    })();

    return jadibotRestoreInFlight;
}

/* ============================================================
 * STABLE RECONNECT MANAGER
 * Mencegah reconnect bertumpuk yang membuat bot diam/menghilang.
 * ============================================================ */
let reconnectTimer = null;
let reconnectInProgress = false;
let reconnectAttempts = 0;
let lastConnectionUpdateAt = Date.now();

function getDisconnectCode(error) {
    return (
        error?.output?.statusCode ||
        error?.data?.statusCode ||
        error?.statusCode ||
        error?.cause?.output?.statusCode ||
        error?.cause?.statusCode ||
        null
    );
}

function clearReconnectState() {
    reconnectAttempts = 0;
    reconnectInProgress = false;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = null;
}

function scheduleReconnect(reason) {
    if (!global.mainBotEnabled) return;
    if (reconnectTimer || reconnectInProgress) return;
    reconnectAttempts += 1;
    const reconnectBase = Number(runtimePerformance.reconnectBaseDelayMs) || 750;
    const reconnectMax = Number(runtimePerformance.reconnectMaxDelayMs) || 15000;
    const base = Math.min(reconnectMax, reconnectBase * (2 ** Math.min(reconnectAttempts - 1, 4)));
    const delay = base + Math.floor(Math.random() * 350);
    console.log(chalk.yellow(`Mencoba reconnect dalam ${delay}ms (percobaan ${reconnectAttempts}, kode ${reason || '-'})...`));

    reconnectTimer = setTimeout(async () => {
        reconnectTimer = null;
        if (reconnectInProgress) return;
        reconnectInProgress = true;
        try {
            await global.reloadHandler(true);
        } catch (error) {
            console.error(chalk.red('Reconnect gagal:'), error);
            reconnectInProgress = false;
            scheduleReconnect(reason);
            return;
        }
        reconnectInProgress = false;
    }, delay);
}

/* ============================================================
 * CONNECTION UPDATE
 * ============================================================ */
async function connectionUpdate(update) {
    const { receivedPendingNotifications, connection, lastDisconnect, isOnline } = update;
    lastConnectionUpdateAt = Date.now();
    global.stopped = connection || global.stopped;

    if (connection === 'connecting') {
        // Pairing code only works while the WhatsApp socket is alive. Remember the
        // state so the startup prompt does not race a closed/reconnecting socket.
        global.mainPairingSocketReady = true;
        console.log(chalk.redBright('Mengaktifkan Bot, Mohon tunggu sebentar...'));
        if (!global.conn?.authState?.creds?.registered && !global.mainPairingExplicit) {
            console.log(chalk.yellow('Sesi bot utama belum tertaut. Pairing menunggu perintah owner (panel > MINTA CODE).'));
        } else if (global.mainPairingExplicit && !global.conn?.authState?.creds?.registered && !global.pairingRequested && !global.pairingInputShown) {
            setTimeout(() => requestMainPairingWhenSocketReady(), 1200);
        }
    } else if (connection === 'open') {
        console.log(chalk.green('Tersambung'));
        clearReconnectState();

        await restoreJadibotsIndependently();

        if (!followed) {
            followed = true;
            for (let id of anu) {
                try {
                    if (global.conn && typeof global.conn.newsletterFollow === 'function') {
                        await global.conn.newsletterFollow(id);
                        console.log(chalk.green(`Follow newsletter: ${id}`));
                    }
                } catch (e) {
                    console.log(chalk.red(`Gagal follow newsletter: ${e.message}`));
                }
            }
        }
    }

    if (isOnline === true) console.log(chalk.green('Status Aktif'));
    // Kode pairing hanya hidup sampai perangkat benar-benar tertaut.
    if (isOnline === true && global.lastPairingCode) global.lastPairingCode = null;
    else if (isOnline === false) console.log(chalk.red('Status Mati'));

    if (receivedPendingNotifications) console.log(chalk.yellow('Menunggu Pesan Baru'));

    if (connection === 'close') {
        // Event dari socket lama dapat muncul setelah socket baru aktif. Abaikan agar
        // koneksi baru tidak ikut ditutup oleh reconnect yang bertumpuk.
        if (this !== global.conn) return;

        const reason = getDisconnectCode(lastDisconnect?.error);
        console.log(chalk.red('Koneksi terputus:'), lastDisconnect?.error?.message || reason || 'Closed');
        global.mainPairingSocketReady = false;
        global.pairingRequested = false;
        global.pairingInputShown = false;
        try { global.mainPairingReadline?.close(); } catch {}
        global.mainPairingReadline = null;

        if (reason === DisconnectReason.loggedOut) {
            // Jangan menghapus sessions otomatis. Penghapusan otomatis membuat bot
            // terlihat menghilang dan memaksa pairing ulang tanpa persetujuan owner.
            console.log(chalk.red('Sesi telah logout. File sesi dipertahankan untuk diagnosis; pairing ulang diperlukan.'));
            return;
        }

        scheduleReconnect(reason);
    }

    if (global.db.data == null) await global.loadDatabase();
}

/* ============================================================
 * ERROR HANDLER
 * ============================================================ */
process.on('uncaughtException', console.error);

/* ============================================================
 * HANDLER
 * ============================================================ */
let isInit = true;
let handler = await import('./handler.js');

/* ============================================================
 * RELOAD HANDLER
 * ============================================================ */
global.reloadHandler = async function (restatConn) {
    try {
        const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error);
        if (Object.keys(Handler || {}).length) handler = Handler;
    } catch (e) {
        console.error(e);
    }

    if (restatConn) {
        const oldChats = global.conn.chats;
        try { global.conn.ws.close(); } catch {}
        global.conn.ev.removeAllListeners();
        global.conn = installAutoTyping(makeWASocket(connectionOptions, { chats: oldChats }));
        global.conn.botConfig = getMainBotConfig();
        global.conn.isJadibot = false;
        updateAutoBackupConnection(global.conn);
        isInit = true;
    }

    if (!isInit) {
        global.conn.ev.off('messages.upsert', global.conn.handler);
        global.conn.ev.off('group-participants.update', global.conn.participantsUpdate);
        global.conn.ev.off('groups.update', global.conn.groupsUpdate);
        global.conn.ev.off('message.delete', global.conn.onDelete);
        global.conn.ev.off('connection.update', global.conn.connectionUpdate);
        global.conn.ev.off('creds.update', global.conn.credsUpdate);
    }

    /* ====================================================
     * WELCOME
     * ==================================================== */
    global.conn.welcome = '✦━━━━━━[ WELCOME ]━━━━━━✦\n\n┏––––––━━━━━━━━•\n│⫹⫺ @subject\n┣━━━━━━━━┅┅┅\n│( 👋 Hallo @user)\n├[ INTRO ]—\n│ Nama: \n│ Umur: \n│ Gender:\n┗––––––━━┅┅┅\n\n––––––┅┅ DESCRIPTION ┅┅––––––\n@desc';
    global.conn.bye = '✦━━━━━━[ GOOD BYE ]━━━━━━✦\nSayonara @user 👋( ╹▽╹ )';
    global.conn.spromote = '@user sekarang admin!';
    global.conn.sdemote = '@user sekarang bukan admin!';
    global.conn.sDesc = 'Deskripsi telah diubah ke \n@desc';
    global.conn.sSubject = 'Judul grup telah diubah ke \n@subject';
    global.conn.sIcon = 'Icon grup telah diubah!';
    global.conn.sRevoke = 'Link group telah diubah ke \n@revoke';

    /* ====================================================
     * HANDLER BIND
     * ==================================================== */
    global.conn.handler = handler.handler.bind(global.conn);
    global.conn.participantsUpdate = handler.participantsUpdate.bind(global.conn);
    global.conn.groupsUpdate = handler.groupsUpdate.bind(global.conn);
    global.conn.onDelete = handler.deleteUpdate.bind(global.conn);
    global.conn.connectionUpdate = connectionUpdate.bind(global.conn);
    global.conn.credsUpdate = saveCreds.bind(global.conn);

    /* ====================================================
     * ANTICALL
     *
     * Status dibaca dari SATU sumber kebenaran yang sama dengan yang ditulis
     * perintah .anticall (core/awang-call.js -> SQLite anticall_status).
     * Sebelumnya handler ini membaca global.db.data.settings[...].anticall
     * yang tidak pernah diisi siapa pun, sehingga .anticall on melaporkan
     * "aktif" tetapi panggilan tidak pernah ditolak.
     * ==================================================== */
    global.conn.ev.on('call', async calls => {
        // Task90: fungsi ini dulu dipanggil tanpa pernah diimpor, sehingga setiap
        // panggilan masuk memicu unhandledRejection "isAnticallActive is not
        // defined" (~15 kali di log). Impor dinamis + try/catch menjaga event
        // 'call' tetap aman walau modul SQLite bermasalah saat boot.
        let anticall = false
        try {
            const callModule = await import('./core/awang-call.js')
            anticall = await callModule.isAnticallActive()
        } catch (error) {
            console.log(chalk.yellow('[ANTICALL] status tidak terbaca:'), error.message)
            return
        }
        if (!anticall) return;
        for (const call of calls) {
            const { id, from, status } = call;
            if (status === 'offer') {
                try {
                    await global.conn.rejectCall(id, from);
                    console.log('Menolak panggilan dari', from);
                } catch (e) {}
            }
        }
    });

    /* ====================================================
     * EVENTS
     * ==================================================== */
    global.conn.ev.on('messages.upsert', global.conn.handler);
    global.conn.ev.on('group-participants.update', global.conn.participantsUpdate);
    global.conn.ev.on('groups.update', global.conn.groupsUpdate);
    global.conn.ev.on('message.delete', global.conn.onDelete);
    global.conn.ev.on('connection.update', global.conn.connectionUpdate);
    global.conn.ev.on('creds.update', global.conn.credsUpdate);

    isInit = false;
    return true;
};

/* ============================================================
 * PLUGIN FOLDER
 * ============================================================ */
const pluginFolder = path.resolve(__dirname, 'plugins');
const pluginFilter = filename => /\.js$/i.test(filename) && !filename.startsWith('.');
global.plugins = {};
global.pluginsFolder = pluginFolder;

function getPluginFiles(dir, base = pluginFolder) {
    const result = [];
    if (!fs.existsSync(dir)) return result;

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith('.')) continue;

        const full = path.join(dir, entry.name);

        // Halzriss recurse ke dalam ./plugins dan subfoldernya.
        // node_modules/, lib/, root, dll tidak pernah disentuh.
        if (entry.isDirectory()) {
            result.push(...getPluginFiles(full, base));
            continue;
        }

        if (entry.isFile() && pluginFilter(entry.name)) {
            const key = path.relative(base, full).replace(/\\/g, '/');
            result.push({ file: full, key });
        }
    }

    return result;
}

function pluginKey(file) {
    return path.relative(pluginFolder, path.resolve(file)).replace(/\\/g, '/');
}

function validPluginFile(file) {
    const resolved = path.resolve(file);
    return resolved !== pluginFolder &&
        resolved.startsWith(pluginFolder + path.sep) &&
        pluginFilter(path.basename(resolved));
}

/* ============================================================
 * LOAD PLUGINS (RECURSIVE, PLUGINS ONLY)
 * ============================================================ */
async function filesInit() {
    try {
        if (!fs.existsSync(pluginFolder)) {
            fs.mkdirSync(pluginFolder, { recursive: true });
            console.log('Folder ./plugins dibuat.');
            return;
        }

        const pluginFiles = getPluginFiles(pluginFolder)
            .sort((a, b) => a.key.localeCompare(b.key));

        for (const { file, key } of pluginFiles) {
            try {
                const err = syntaxerror(fs.readFileSync(file), key, {
                    sourceType: 'module',
                    allowAwaitOutsideFunction: true
                });

                if (err) {
                    console.error(`Failed to load plugin ${key}: syntax error\n${format(err)}`);
                    continue;
                }

                const module = await import(`${pathToFileURL(file).href}?load=${Date.now()}`);
                global.plugins[key] = normalizePluginText(module.default || module);
            } catch (e) {
                console.error(`Failed to load plugin ${key}: ${e.message}`);
                delete global.plugins[key];
            }
        }

        global.plugins = Object.fromEntries(
            Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b))
        );

        console.log(`Successfully Loaded ${Object.keys(global.plugins).length} Plugins`);
    } catch (e) {
        console.error('Error loading plugins:', e);
    }
}

// Dua belas plugin di plugins/rpg/rpg-*.js memakai `global.rpg.emoticon`, tetapi
// fungsi itu tidak pernah didefinisikan di runtime ini — akibatnya `.bank` dan `.atm`
// gagal seketika dengan TypeError, sebelum satu baris pun kode plugin berjalan.
// Dipasang DI SINI, sebelum filesInit(), supaya sudah tersedia saat plugin dimuat.
installRpgGlobals();
// Puluhan plugin maker/ai/search/fun memakai `global.APIs.deline` / `.faa`.
// Tanpa ini, perintah seperti .cewekbrat gagal dengan TypeError sebelum jalan.
installApiGlobals();

await filesInit();

// Synchronize the Usanagi menu/catalog compatibility store without importing
// every plugin a second time (which would duplicate timers and side effects).
try {
    const { pluginStore: usanagiPluginStore } = await import('./core/awang-loader.js');
    usanagiPluginStore.clear();
    for (const [key, plugin] of Object.entries(global.plugins)) {
        if (typeof plugin !== 'function') continue;
        plugin.category ||= key.split('/')[0] || 'umum';
        usanagiPluginStore.set(key, plugin);
    }
} catch (error) {
    console.error('Usanagi plugin catalog compatibility failed:', error.message);
}

/* ============================================================
 * PLUGIN HOT RELOAD
 * ============================================================ */
async function reloadPluginFile(file) {
    const resolved = path.resolve(file);
    if (!validPluginFile(resolved)) return;
    if (!fs.existsSync(resolved)) return;

    const key = pluginKey(resolved);

    try {
        const err = syntaxerror(fs.readFileSync(resolved), key, {
            sourceType: 'module',
            allowAwaitOutsideFunction: true
        });

        if (err) {
            console.error(`syntax error '${key}'\n${format(err)}`);
            return;
        }

        const module = await import(`${pathToFileURL(resolved).href}?update=${Date.now()}`);
        global.plugins[key] = module.default || module;
        global.plugins = Object.fromEntries(
            Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b))
        );

        console.log(`reloaded plugin '${key}'`);
    } catch (e) {
        console.error(`error loading plugin '${key}'\n${format(e)}`);
    }
}

/* Dipakai base lama juga, tetapi path tetap dikunci ke ./plugins. */
global.reload = async (_ev, filename) => {
    if (!filename) return;

    const raw = filename.toString().replace(/\\/g, '/');
    const full = path.resolve(pluginFolder, raw);

    if (!validPluginFile(full)) return;
    if (fs.existsSync(full)) await reloadPluginFile(full);
    else {
        const key = pluginKey(full);
        delete global.plugins[key];
        console.log(`deleted plugin '${key}'`);
    }
};

/* ============================================================
 * WATCH ALL PLUGIN SUBFOLDERS
 * ============================================================ */
const pluginWatchers = new Map();

function collectPluginDirectories(dir, output = []) {
    if (!fs.existsSync(dir)) return output;

    output.push(dir);

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith('.')) continue;
        if (!entry.isDirectory()) continue;

        const child = path.join(dir, entry.name);
        collectPluginDirectories(child, output);
    }

    return output;
}

function watchPluginDirectories() {
    const dirs = collectPluginDirectories(pluginFolder);
    const active = new Set(dirs);

    // Hapus watcher untuk folder yang sudah tidak ada.
    for (const [dir, watcher] of pluginWatchers) {
        if (!active.has(dir) || !fs.existsSync(dir)) {
            try { watcher.close(); } catch {}
            pluginWatchers.delete(dir);
        }
    }

    for (const dir of dirs) {
        if (pluginWatchers.has(dir)) continue;

        try {
            const watcher = fs.watch(dir, async (_ev, filename) => {
                if (!filename) return;

                const name = filename.toString();
                if (name.startsWith('.')) return;

                const full = path.resolve(dir, name);

                // Folder baru -> pasang watcher untuk subfolder tersebut.
                if (fs.existsSync(full) && fs.statSync(full).isDirectory()) {
                    setTimeout(watchPluginDirectories, 200);
                    return;
                }

                if (!pluginFilter(name)) return;
                if (!validPluginFile(full)) return;

                if (fs.existsSync(full)) {
                    await reloadPluginFile(full);
                } else {
                    const key = pluginKey(full);
                    delete global.plugins[key];
                    console.log(`deleted plugin '${key}'`);
                }
            });

            pluginWatchers.set(dir, watcher);
        } catch (e) {
            console.error(`Failed watching plugin folder ${dir}: ${e.message}`);
        }
    }
}

watchPluginDirectories();

/* ============================================================
 * START HANDLER
 * ============================================================ */
await global.reloadHandler();

// Watchdog hanya aktif untuk sesi yang sudah terdaftar. Jika koneksi berhenti
// di fase connecting/close tanpa event lanjutan, reconnect dijadwalkan sekali.
setInterval(() => {
    const registered = Boolean(global.conn?.authState?.creds?.registered);
    const stale = Date.now() - lastConnectionUpdateAt > 60000;
    if (registered && global.stopped !== 'open' && stale) {
        scheduleReconnect('watchdog');
    }
}, 30000);

/* ============================================================
 * AUTO RESET LIMIT
 * ============================================================ */
console.log('Auto reset system aktif');

setInterval(async () => {
    if (!global.db?.data?.users) return;

    let now = new Date();
    let today = now.toLocaleDateString('id-ID', { timeZone: 'Asia/Jakarta' });
    let jam = now.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false });

    if (jam !== '00.00' && jam !== '00:00') return;
    if (global.db.data.lastReset === today) return;

    global.db.data.lastReset = today;
    let jumlah = 50;
    let users = global.db.data.users;
    let total = 0;

    for (let jid in users) {
        let user = users[jid];
        if (!user) continue;
        if (user.premium || user.premiumTime > 0) continue;

        if (!Number.isFinite(user.limit) || user.limit < jumlah) {
            user.limit = jumlah;
        }
        total++;
    }

    await global.db.write().catch(console.error);
    console.log(`[AUTO RESET LIMIT]\nReset : ${total}\nLimit : ${jumlah}`);
}, 60000);

/* ============================================================
 * QUICK TEST
 * ============================================================ */
async function _quickTest() {
    let test = await Promise.all([
        spawn('ffmpeg'),
        spawn('ffprobe'),
        spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
        spawn('convert'),
        spawn('magick'),
        spawn('gm'),
        spawn('find', ['--version'])
    ].map(p => {
        return Promise.race([
            new Promise(resolve => p.on('close', code => resolve(code !== 127))),
            new Promise(resolve => p.on('error', () => resolve(false)))
        ]);
    }));

    let [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
    global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find };
    Object.freeze(global.support);

    if (!global.support.ffmpeg) console.log('Install ffmpeg (pkg install ffmpeg)');
    if (global.support.ffmpeg && !global.support.ffmpegWebp) console.log('Stickers may not animated without libwebp');
    if (!global.support.convert && !global.support.magick && !global.support.gm) console.log('Install imagemagick (pkg install imagemagick)');
}

await _quickTest();
console.log('Quick Test Done');

/* ============================================================
 * READY
 * ============================================================ */
// Existing Jadibot sessions do not depend on the main bot being paired. Start
// their connections now; the in-flight guard avoids a duplicate later on open.
void restoreJadibotsIndependently();

function requestMainPairingWhenSocketReady(attempt = 0) {
    // Tanpa izin eksplisit, helper ini tidak boleh menghubungi WhatsApp.
    if (!global.mainPairingExplicit) return;
    if (global.conn?.authState?.creds?.registered || global.pairingRequested || global.pairingInputShown) return;
    if (global.mainPairingSocketReady) {
        global.requestPairing();
        return;
    }

    // Do not present a number prompt until Baileys has a live socket capable of
    // requesting a pairing code. This avoids the Pterodactyl "Connection Closed"
    // race during first boot.
    if (attempt >= 45) {
        console.log(chalk.yellow('Socket WhatsApp belum siap. Pairing akan dicoba lagi saat bot direstart.'));
        return;
    }
    setTimeout(() => requestMainPairingWhenSocketReady(attempt + 1), 1000);
}

if (global.mainBotEnabled && global.mainPairingExplicit && !global.conn.authState.creds.registered) {
    setTimeout(async () => {
        // The first Baileys connection can emit `connecting` before this file has
        // finished binding its handlers. Recreate it once after handlers exist so
        // pairing never waits forever on a missed initial event.
        if (!global.mainPairingSocketReady && !global.conn?.authState?.creds?.registered) {
            console.log(chalk.yellow('Menyiapkan ulang koneksi WhatsApp untuk pairing...'));
            try {
                await global.reloadHandler(true);
            } catch (error) {
                console.log(chalk.red('Gagal menyiapkan koneksi pairing:'), error.message);
            }
        }
        requestMainPairingWhenSocketReady();
    }, 250);
}

console.log(chalk.green('Bot siap digunakan!'));
console.log(chalk.yellow('Scan QR atau masukkan pairing code di WhatsApp'));
