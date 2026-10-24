import { sendAutoAIReply } from './lib/auto-ai-reply.js'
import { handleAfkMessage } from './lib/afk.js';
import { isRealmAccessCommand } from './lib/realms/access.js';
import { runUnifiedCommand, awardMessageExp } from './lib/rpg/unified-runtime.js';
import { unifiedRpg } from './lib/rpg/unified-store.js';
import { withRealmGate } from './lib/realms/gate.js';
import { withMessageResponses, bindResponseMessage, maySuggestCommand } from './lib/command-response.js';
import { planAutoAI, shouldAutoAITrigger, isSelfAIRequest } from './lib/auto-ai.js';
import { schedulePluginCommand } from './lib/auto-ai-scheduler.js';
import { runWithBotConnection } from './lib/bot-connection-context.js';
import { smsg } from './lib/simple.js';
import { generateWAMessageFromContent, proto } from '@rexxhayanasi/elaina-baileys'
import { format } from 'util';
import { recordError } from './lib/error-hub.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs, { unwatchFile, watchFile } from 'fs';
import chalk from 'chalk';
import { createWelcomeCard } from './lib/welcome.js'
import {
  getAllOwnerNumbers,
  normalizeNumber as normalizeAccessNumber,
  resolveTargetPhoneNumber
} from './lib/awang-cekakses.js'
import { collectUserIdentityKeys, mergeUserIdentityRecords } from './lib/user-identity.js'
import { getActivePrefix } from './core/awang-prefix.js'
import { prefixStorageKey, isPluginDisabled } from './lib/bot-config.js'
import { limitsEnabled } from './lib/limit-mode.js'
import { canUseOwnerPlugin } from './lib/owner-policy.js'
import { isPremiumFeatureLocked, premiumOwnerContact } from './lib/premium-mode.js'
import {
  isGroupAdmin as resolveGroupAdmin,
  isBotAdmin as resolveBotGroupAdmin,
} from './lib/awang-aksesgrub.js'
import { parseCommandInput } from './lib/command-parser.js'
import { sendInteractive } from './lib/awang-tombol.js'
import {
  getSessionWelcomeTemplate,
  getSessionGoodbyeTemplate,
} from './lib/jadibot-group-welcome.js'

const isNumber = (x) => typeof x === 'number' && !isNaN(x);
const registrationCommands = new Set(['daftar', 'verify', 'reg', 'register']);

// Kalimat manusia untuk rencana berjadwal, dipakai kalau model tidak memberi kalimat.
function naturalScheduleNote(steps, prefix) {
    const label = step => `${prefix}${step.command}${step.args ? ' ' + step.args : ''}`;
    if (!steps.length) return '';
    const first = steps[0];
    const rest = steps.slice(1);
    const head = first.delayMs ? `nanti ${formatDelay(first.delayMs)} lagi tak ${first.command}` : `udah tak ${first.command}`;
    if (!rest.length) return `${head} ya`;
    return `${head}, terus ${rest.map(step => `${formatDelay(step.delayMs)} lagi tak ${step.command}`).join(', ')} ya`;
}

// Jarak waktu untuk konfirmasi jadwal Auto-AI ("dalam 5 detik", "dalam 2 menit").
function formatDelay(ms) {
    const total = Math.max(0, Math.round(Number(ms || 0) / 1000));
    if (total < 60) return `${total} detik`;
    const minutes = Math.floor(total / 60);
    if (minutes < 60) return total % 60 ? `${minutes} menit ${total % 60} detik` : `${minutes} menit`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours} jam ${rest} menit` : `${hours} jam`;
}

function registrationRequiredMessage(usedPrefix) {
    const prefix = String(usedPrefix || '.');
    return [
        '╭─〔 REGISTRASI WAJIB 〕',
        '│',
        '│ Kamu harus daftar dulu sebelum',
        '│ menggunakan fitur bot ini.',
        '│',
        '├─ Cara daftar',
        `│ ${prefix}daftar Nama,Umur`,
        `│ Contoh: ${prefix}daftar Usanagi,17`,
        '│',
        '│ Setelah berhasil, semua fitur',
        '│ bot dapat digunakan.',
        '│',
        '│ By AlzRiss - Usanagi Umi AI',
        '╰────────────────',
    ].join('\n');
}

const cleanJid = jid => {
  if (!jid) return ''
  if (typeof jid !== 'string') jid = String(jid)

  return jid
    .replace(/:\d+@/g, '@')
    .replace('@lid', '@s.whatsapp.net')
}

const sameUser = (a, b) => {
  a = cleanJid(a).split('@')[0]
  b = cleanJid(b).split('@')[0]
  return a && b && a === b
}

const findParticipant = (participants = [], jid = '') => {
  jid = cleanJid(jid)

  return participants.find(v => {
    let ids = [
      v.id,
      v.jid,
      v.lid,
      v.phoneNumber
    ].filter(Boolean).map(cleanJid)

    return ids.some(x => sameUser(x, jid))
  }) || {}
}

/**
 * Resolves placeholders available in Welcome and Goodbye templates.
 * @deks intentionally keeps the spelling used by the command help; @desc
 * remains as a compatibility alias for templates that used it before.
 */
function renderGroupEventTemplate(template, {
  user,
  groupName,
  groupDesc,
  memberCount,
  botName,
  botNumber,
}) {
  const safeUser = cleanJid(user).split('@')[0] || 'user'
  const safeGroupName = String(groupName || 'Group')
  const safeGroupDesc = String(groupDesc || 'Tidak ada deskripsi grup')
  const safeMemberCount = String(Math.max(0, Number(memberCount) || 0))
  const safeBotName = String(botName || 'Usanagi Umi AI')
  const safeBotNumber = String(botNumber || '').replace(/\D/g, '')
  const groupInfo = `${safeGroupName}\n👥 Total member: ${safeMemberCount}`
  const botInfo = safeBotNumber
    ? `${safeBotName}\n📱 +${safeBotNumber}`
    : safeBotName

  return String(template || '')
    .replace(/@user\b/gi, `@${safeUser}`)
    .replace(/@subject\b/gi, safeGroupName)
    .replace(/@info\b/gi, groupInfo)
    .replace(/@bot\b/gi, botInfo)
    .replace(/@member\b/gi, safeMemberCount)
    .replace(/@deks\b/gi, safeGroupDesc)
    .replace(/@desc\b/gi, safeGroupDesc)
}

/**
 * Handle messages upsert
 * @param {import('baileys').BaileysEventMap<unknown>['messages.upsert']} groupsUpdate
 */
export async function handler(chatUpdate) {
    return runWithBotConnection(this, () => withMessageResponses(this, () => handleMessage.call(this, chatUpdate)));
}

async function handleMessage(chatUpdate) {
    const conn = this;
    // Task64: status ON/OFF limit harus terbaca juga di blok finally (blok try
    // punya scope sendiri, jadi `const limitsActive` di dalamnya tidak terlihat).
    let limitBilling = true;
	if (!chatUpdate) return;
	this.pushMessage(chatUpdate.messages).catch(console.error);
	let m = chatUpdate.messages[chatUpdate.messages.length - 1];
	if (!m) return;
	if (global.db.data == null) await global.loadDatabase();
	try {
	m = smsg(this, m) || m;
    if (m?.__autoAIHandled) return;
if (!m) return;
bindResponseMessage(m);
const botConfig = this.botConfig || {
    type: 'main', scope: 'main', defaultPrefix: global.mainBot?.defaultPrefix || '/', defaultLimit: 50,
    public: true, disabledPlugins: []
}

// ==================
// ❌ ANTI BUG
// ==================
if (m.chat === 'status@broadcast') return
if (!m.message) return
if (m.key.fromMe && !m.message) return
if (m.isBaileys) return

// ==================
// 👑 OWNER SYSTEM (WAJIB PALING ATAS)
// ==================
// WhatsApp dapat mengirim pengirim sebagai PN (@s.whatsapp.net) atau LID
// (@lid). Selalu selesaikan ke nomor telepon sebelum memeriksa akses owner.
const resolvedSenderNumber = await resolveTargetPhoneNumber(m.sender, this, m.chat).catch(() => '')
const lockedDeveloperNumbers = [
  normalizeAccessNumber(global.jadibotPlatform?.lockedOwnerNumber || 'OWNER_PHONE_PLACEHOLDER'),
  ...(global.owner || []).map(([id]) => normalizeAccessNumber(id))
].filter(Boolean)
const allOwnerNumbers = getAllOwnerNumbers(this)

const staticOwnerFallback = (global.owner || []).some(([id]) => sameUser(cleanJid(id), m.sender))
// Owner yang dipilih user memperoleh akses owner biasa. Akses rowner/developer
// tetap hanya untuk nomor permanen yang dikunci di config.js.
const isROwner = Boolean(
  m.fromMe ||
  (resolvedSenderNumber && lockedDeveloperNumbers.includes(resolvedSenderNumber)) ||
  staticOwnerFallback
)
const isOwner = Boolean(
  isROwner ||
  (resolvedSenderNumber && allOwnerNumbers.includes(resolvedSenderNumber))
)
const isMods = isOwner || global.mods?.some(v => m.sender.includes(v))

// ==================
// 🚫 USER BLACKLIST
// ==================
const blacklistUsers = global.db.data.blacklistUser || {}

const senderNumber = cleanJid(m.sender).split('@')[0]

const isBlacklistedUser = Object.keys(blacklistUsers).some(jid => {
    return cleanJid(jid).split('@')[0] === senderNumber
})

const blacklistCmd = /^(blacklist|delblacklist)$/i.test(
    typeof m.text === 'string'
        ? m.text.trim().replace(/^[.!#/$]/, '').split(/\s+/)[0]
        : ''
)

if (isBlacklistedUser && !isOwner && !blacklistCmd) {
    return
}

// ==================
// 📊 DATABASE INIT
// ==================
// Satukan record PN dan LID milik pengguna yang sama. Tanpa ini, pengguna
// dapat terdaftar di private chat tetapi terlihat belum terdaftar di grup.
const userIdentityKeys = collectUserIdentityKeys(m, resolvedSenderNumber)
const prefixKey = prefixStorageKey(this, m.chat)
const activePrefix = await getActivePrefix(prefixKey, botConfig.defaultPrefix)
// Activity clears AFK before private/premium/registration/only-group command gates.
// Do this before profile merging, so a stale PN/LID field cannot overwrite the status.
const afkNotify = (isOwner || m.fromMe || (botConfig.type === 'jadibot' ? botConfig.public !== false : global.db.data.settings?.[this.user.jid]?.public !== false)) && !isPluginDisabled(botConfig, '_system/_afk.js')
await handleAfkMessage(m, this, { prefix: activePrefix, aliases: userIdentityKeys, type: chatUpdate.type, notify: afkNotify })
const mergedUser = mergeUserIdentityRecords(global.db.data.users, userIdentityKeys)
global.db.data.users[m.sender] ||= mergedUser

global.db.data.chats[m.chat] ||= {}
global.db.data.blacklistUser = global.db.data.blacklistUser || {}

let userData = global.db.data.users[m.sender]

// Default field
// RPG defaults belong to the authority, not legacy initialization (including held LIDs).
if (!unifiedRpg()) {
    userData.exp ??= 0
    userData.level ??= 0
    userData.money ??= 0
    userData.lastclaim ??= 0
    userData.lastWarn ??= 0
}
// Nilai -1 adalah sentinel unlimited dan tidak pernah dipotong.
const configuredDefaultLimit = Number(botConfig.defaultLimit)
// Task64: tombol Limit ON/OFF di website + default_limit -1 mematikan seluruh
// penagihan limit, bukan hanya untuk pengguna baru.
const limitsActive = limitsEnabled(botConfig) && configuredDefaultLimit !== -1
limitBilling = limitsActive
userData.limit ??= configuredDefaultLimit === -1
    ? -1
    : Math.max(0, Number.isFinite(configuredDefaultLimit) ? configuredDefaultLimit : 0)
userData.premiumTime ??= 0
userData.registered ??= false
userData.regTime ??= -1
userData.age ??= -1

// Legacy repair must not write through authoritative/held RPG aliases.
if (!unifiedRpg()) {
    if (!Number.isFinite(userData.exp)) userData.exp = 0
    if (!Number.isFinite(userData.level)) userData.level = 0
    if (!Number.isFinite(userData.money)) userData.money = 0
}

if (!Number.isFinite(userData.limit))
    userData.limit = 50

// ==================
// 🧠 BASIC INFO
// ==================
const isGroup = m.key?.remoteJid?.endsWith('@g.us')

// ==================
// 💎 PREMIUM
// ==================
const isPrems = isOwner || userData.premiumTime > 0

// ==================
// 🚫 SKIP STATUS / STORY
// ==================
const isStatus = m.key?.remoteJid === 'status@broadcast' || m.key?.participant === 'status@broadcast'
if (isStatus) return

// ==================
// 🚫 PRIVATE CHAT
// ==================
const realmAccessCommand = isRealmAccessCommand(m.text, activePrefix)
const prefix = { test: text => String(text || '').startsWith(activePrefix) }

// AutoAI di chat pribadi: percakapan 1:1 tidak perlu mention seperti di grup.
const autoAIEnabledForBot = (cfg = {}) => {
  if (global.umiAutoAI?.enabled === false) return false
  if (cfg.autoAIEnabled === false) return false
  if (cfg.values?.autoAI?.enabled === false) return false
  return cfg.type === 'jadibot' ? cfg.values?.autoAI?.enabled !== false : true
}

if (!isGroup) {
  const body = typeof m.text === 'string' ? m.text.trim() : ''
  const hasPrefix = prefix.test(body)

  // Tanpa prefix: hanya lanjut kalau AutoAI memang aktif untuk bot ini
  // (atau sedang dalam balasan/mention yang sah).
  if (!hasPrefix && !autoAIEnabledForBot(botConfig) && !shouldAutoAITrigger(m, this, botConfig)) return

  // ambil command setelah prefix
  const cmd = hasPrefix ? body.slice(activePrefix.length).trim() : body

  // kalau cuma "." atau "!" dll → skip
  if (!cmd) return

  // Catatan: sebelumnya ada `return` diam-diam untuk semua non-premium di sini,
  // sehingga chat pribadi tidak pernah dibalas sama sekali (tanpa pesan apa pun).
  // Chat pribadi sekarang dilayani normal; plugin premium tetap dicek per-plugin.
}

// ==================
// 🚫 GC / PC ONLY
// ==================
if (global.opts?.gconly && !isGroup) return
if (global.opts?.pconly && isGroup) return

// ==================
// ⚙️ EXP LIMIT
// ==================
m.exp = 0;
m.limit = false;

		if (m.sender.endsWith('@broadcast') || m.sender.endsWith('@newsletter')) return;
		await (await import(`./lib/database.js?v=${Date.now()}`)).default(m, this);

		if (typeof m.text !== 'string') m.text = '';

	// Mode akses per-session Jadibot:
	// - onlyGroup: seluruh command ditolak di private chat.
	// - self: hanya owner session, developer terkunci, atau bot sendiri.
	// Bot utama juga menghormati Only Group bila owner mengaktifkannya dari web.
	if (botConfig.onlyGroup === true && !m.isGroup && !realmAccessCommand) return;
	const instancePublic = botConfig.type === 'jadibot' || botConfig.managedSettings === true
		? botConfig.public !== false
		: global.db.data.settings[this.user.jid].public
	if (!instancePublic && !m.fromMe && !isOwner) return;
if (m.isBaileys) return;
m.exp += Math.ceil(Math.random() * 10);

		let usedPrefix;
		// Resolve once per incoming message. Prefix changes are read directly from
		// SQLite, so setprefix takes effect on the very next message without adding
		// event listeners or retaining a stale global regex.

		let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender];

		const groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat).catch(() => ({})) : {}
        const participants = m.isGroup ?(groupMetadata.participants || []) : []
        
const botJid = cleanJid(this.user?.id || conn.user?.id)

const groupUser = m.isGroup
  ? findParticipant(participants, m.sender || m.key?.participant)
  : {}

const bot = m.isGroup
  ? findParticipant(participants, botJid)
  : {}

const isRAdmin = groupUser?.admin === 'superadmin'
let isAdmin = isRAdmin || groupUser?.admin === 'admin'
let isBotAdmin = ['admin', 'superadmin'].includes(bot?.admin)

// Recent WhatsApp group metadata can identify participants with a LID while
// the socket is identified by a phone JID (or the reverse). The legacy local
// lookup above then misses the bot even though it is an admin. Only when the
// fast lookup misses, use the LID-aware group access resolver as a fallback.
if (m.isGroup && (!isAdmin || !isBotAdmin)) {
  // Metadata is normally already enough. Bound the exceptional LID lookup so
  // a WhatsApp metadata delay never blocks a command indefinitely.
  const quickAccessCheck = task => new Promise(resolve => {
    const timer = setTimeout(() => resolve(false), 2200)
    Promise.resolve(task)
      .then(value => resolve(Boolean(value)))
      .catch(() => resolve(false))
      .finally(() => clearTimeout(timer))
  })
  const checks = []
  if (!isAdmin) {
    checks.push(quickAccessCheck(resolveGroupAdmin(conn, m.chat, m.sender || m.key?.participant, groupMetadata))
      .then(value => { isAdmin = value }))
  }
  if (!isBotAdmin) {
    checks.push(quickAccessCheck(resolveBotGroupAdmin(conn, m.chat, groupMetadata))
      .then(value => { isBotAdmin = value }))
  }
  await Promise.all(checks)
}
		
// ==================
//  ADMIN ONLY
// ==================
let chat = global.db.data.chats[m.chat]

// deteksi command dari awal
const isCmd = prefix.test(m.text || '')

if (m.isGroup && chat.adminOnly && !isAdmin && !isOwner && isCmd) {
  return m.reply('🚫 Fitur hanya untuk admin grup!')
}

        // Auto-AI chooses a command; the native dispatcher below remains the only executor.
        const selfAIRequest = isSelfAIRequest(m, botConfig);
        const aiPlan = await planAutoAI({
            m, conn: this, botConfig, activePrefix, bot, plugins: global.plugins,
            isROwner, isOwner, isMods, isAdmin, isBotAdmin, isPrems,
            userData: _user, chatData: chat,
            isCommandDisabled: (name, command) => isPluginDisabled(botConfig, name, command)
        });
        // Auto-AI bisa mengantrekan beberapa perintah sekaligus (mis. tutup grup
        // lalu buka 5 detik kemudian). Satu perintah tanpa jeda dijalankan oleh
        // dispatcher di bawah; sisanya diserahkan ke penjadwal.
        const aiSteps = Array.isArray(aiPlan.steps)
            ? aiPlan.steps
            : (aiPlan.kind === 'command' ? [{ command: aiPlan.command, args: aiPlan.args, plugin: aiPlan.plugin, delayMs: 0 }] : []);
        let aiDispatchPlan = null;
        if (aiSteps.length) {
            m.__autoAIHandled = true;
            const immediateIndex = aiSteps.findIndex(step => !step.delayMs);
            if (immediateIndex >= 0) aiDispatchPlan = aiSteps[immediateIndex];
            const scheduledSteps = aiSteps.filter((step, index) => index !== immediateIndex);
            if (scheduledSteps.length) {
                const gagal = [];
                for (const step of scheduledSteps) {
                    try {
                        schedulePluginCommand({
                            conn: this,
                            scope: botConfig.scope,
                            chat: m.chat,
                            sender: m.sender,
                            pushName: m.pushName,
                            isGroup: Boolean(m.isGroup),
                            prefix: activePrefix,
                            command: step.command,
                            args: step.args,
                            pluginName: step.plugin,
                            delayMs: step.delayMs,
                            isOwner,
                            isPrems,
                            botConfig,
                            bot,
                        });
                    } catch (error) {
                        gagal.push(`${activePrefix}${step.command}`);
                    }
                }
                // Balasan dibuat seperti obrolan biasa, bukan laporan sistem.
                const note = (aiPlan.note || '').trim() || naturalScheduleNote(scheduledSteps, activePrefix);
                m.__autoAIAnswer = gagal.length && !note
                    ? `yang tadi gagal tak jadwalin (${gagal.join(', ')}), coba lagi ya`
                    : note;
            }
        }
        const aiDispatchText = aiDispatchPlan ? `${activePrefix}${aiDispatchPlan.command}${aiDispatchPlan.args ? ' ' + aiDispatchPlan.args : ''}` : selfAIRequest ? '' : m.text;
        if (aiPlan.kind === 'answer') { m.__autoAIHandled = true; m.__autoAIAnswer = aiPlan.answer; m.__autoAIConversation = aiPlan.conversation; }
        if (aiDispatchPlan) {
            m.__autoAITargetPlugin = aiDispatchPlan.plugin;
        }

		// ============================================================
		// PLUGIN PATH CONTEXT
		// ============================================================
		// global.plugins dapat berisi key seperti:
		//   owner/help.js
		//   downloader/ytdl.js
		//   game/tetris.js
		// sehingga setiap plugin mendapatkan __dirname dan __filename
		// miliknya sendiri, bukan root folder plugins.
		const pluginsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), './plugins');

		const getPluginPath = (pluginName) => {
			const relativeName = String(pluginName || '').replace(/\\/g, '/').replace(/^\/+/, '');
			const filename = path.resolve(pluginsRoot, relativeName);

			// Prevent path traversal jika ada key plugin yang tidak valid.
			if (filename !== pluginsRoot && !filename.startsWith(pluginsRoot + path.sep)) {
				throw new Error(`Invalid plugin path: ${pluginName}`);
			}

			return {
				filename,
				dirname: path.dirname(filename),
				basename: path.basename(filename)
			};
		};

		const unknownHandlers = [];
		for (let name in global.plugins) {
    if (global.opts?.gconly && !isGroup) continue
    if (global.opts?.pconly && isGroup) continue
			let plugin = global.plugins[name];
			if (!plugin) continue;
			if (plugin.disabled) continue;
			// Website catalog plugins are loaded globally for hot reload, but may
			// execute only in Jadibot sessions that explicitly installed them.
			if (String(name).toLowerCase().startsWith('custom/')) {
				const allowed = Array.isArray(botConfig?.enabledCustomPlugins)
					? botConfig.enabledCustomPlugins.map(value => String(value).toLowerCase())
					: [];
				if (botConfig?.type !== 'jadibot' || !allowed.includes(String(name).toLowerCase())) continue;
			}
			if (isPluginDisabled(botConfig, name)) continue;
			let pluginPath;
			try {
				pluginPath = getPluginPath(name);
			} catch (e) {
				console.error(`Invalid plugin path '${name}':`, e.message);
				continue;
			}

			const __filename = pluginPath.filename;
			const __dirname = pluginPath.dirname;
			const pluginBasename = pluginPath.basename;
            // Suggestions are a final fallback, never a before-hook racing a reply.
            if (typeof plugin.unknownCommand === 'function') unknownHandlers.push(plugin);

			if (typeof plugin.all === 'function') {
				try {
					await runUnifiedCommand(`hook-all:${this.user?.id}:${m.chat}:${m.sender}:${m.key?.id || m.id}:${name}`, () => plugin.all.call(this, m, {
						chatUpdate,
						__dirname,
						__filename,
					}), this, m);
				} catch (e) {
					// if (typeof e === 'string') continue
					console.error(e);
					for (let [jid] of global.owner.filter(([number, _, isDeveloper]) => isDeveloper && number)) {
						let data = (await conn.onWhatsApp(jid))[0] || {};
						if (data.exists) m.reply(`*Plugin:* ${name}\n*Sender:* ${m.sender}\n*Chat:* ${m.chat}\n*Command:* ${m.text}\n\n\`\`\`${format(e)}\`\`\``.trim(), data.jid);
					}
				}
			}
			if (plugin.tags && plugin.tags.includes('admin')) {
				// global.dfail('restrict', m, this)
				continue;
			}
			const str2Regex = (str) => String(str).replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
			// customPrefix remains available for non-command hooks. Every regular
			// command must use this chat's single active prefix.
			const _prefix = plugin.customPrefix ?? activePrefix;
			const prefixList = Array.isArray(_prefix) ? _prefix : [_prefix];
			const matches = prefixList.map(p => {
				const re = p instanceof RegExp ? p : new RegExp(`^${str2Regex(p)}`)
				if (re.global || re.sticky) re.lastIndex = 0
				return [re.exec(aiDispatchText), re]
			})
			let match = matches.find(([result]) => result) || [null, null];
			if (typeof plugin.before === 'function') {
				if (
					await runUnifiedCommand(`hook-before:${this.user?.id}:${m.chat}:${m.sender}:${m.key?.id || m.id}:${name}`, () => plugin.before.call(this, m, {
						match,
						conn: this,
						participants,
						groupMetadata,
						user: groupUser ,
						bot,
						isROwner,
						isOwner,
						isRAdmin,
						isAdmin,
						isBotAdmin,
						isPrems,
						chatUpdate,
						__dirname,
						__filename,
					}), this, m)
				)
					continue;
			}
			if (typeof plugin !== 'function') continue;
            if (m.__autoAITargetPlugin && m.__autoAITargetPlugin !== name) continue;
			if ((usedPrefix = (match[0] || '')[0])) {
				const noPrefix = aiDispatchText.slice(usedPrefix.length);
				const parsedCommand = parseCommandInput(noPrefix);
				let command = parsedCommand.command;
				let args = parsedCommand.args;
				let _args = args;
				let text = parsedCommand.text;

                // Every imported Usanagi command also has a collision-free
                // namespace: .usanagi-<command>. Normal command names continue
                // to work when they do not collide with an existing plugin.
                const isUsanagiFile = pluginBasename.startsWith('usanagi-');
                if (command.startsWith('usanagi-')) {
                    if (!isUsanagiFile) continue;
                    command = command.slice('usanagi-'.length);
                }

				let fail = plugin.fail || global.dfail; // When failed
				let isAccept =
					plugin.command instanceof RegExp // RegExp Mode?
						? plugin.command.test(command)
						: Array.isArray(plugin.command) // Array?
							? plugin.command.some((cmd) =>
									cmd instanceof RegExp // RegExp in Array?
										? cmd.test(command)
										: cmd === command
								)
							: typeof plugin.command === 'string' // String?
								? plugin.command === command
								: false;

				if (!isAccept) continue;
                m.__commandRecognized = true; // Also suppress suggestions on denied/failed commands.
				if (isPluginDisabled(botConfig, name, command)) continue;

                // Registrasi bersifat wajib secara global. Hanya command daftar
                // yang dapat dipakai oleh user baru; owner/developer dan pesan
                // bot sendiri tidak dikunci agar administrasi tetap aman.
                const registrationRequired = botConfig?.registrationRequired !== false;
                const registered = _user?.registered === true;
                if (registrationRequired && !registered && !isOwner && !m.fromMe && !registrationCommands.has(command) && !(realmAccessCommand && name === 'rpg/realms.js')) {
                    if (!m.__registrationPrompted) {
                        m.__registrationPrompted = true;
                        await m.reply(registrationRequiredMessage(usedPrefix));
                    }
                    continue;
                }

                // Compatibility layer for plugins ported from Usanagi Umi AI. Usanagi
                // expects m.text to contain command arguments, while the Usanagi
                // runtime keeps the complete incoming text in m.text.
                const isUsanagiPlugin = pluginBasename.startsWith('usanagi-');
                let pluginMessage = m;
                if (isUsanagiPlugin) {
                    pluginMessage = Object.create(m);
                    Object.defineProperties(pluginMessage, {
                        text: { value: text, writable: true, enumerable: true, configurable: true },
                        args: { value: args, writable: true, enumerable: true, configurable: true },
                        command: { value: command, writable: true, enumerable: true, configurable: true },
                        raw: { value: m, enumerable: true, configurable: true },
                        botConfig: { value: botConfig, enumerable: true, configurable: true },
                        botScope: { value: botConfig.scope, enumerable: true, configurable: true },
                        prefixStorageKey: { value: prefixKey, enumerable: true, configurable: true },
                        currentMessage: { value: m.message, enumerable: true, configurable: true },
                        quotedMessage: { value: m.quoted || null, enumerable: true, configurable: true },
                        isSelf: { value: Boolean(m.fromMe), enumerable: true, configurable: true },
                        reply: {
                            value: (content, options = {}) => this.reply(
                                m.chat,
                                content,
                                options?.quoted === false ? null : m,
                                typeof options === 'object' ? options : {}
                            ),
                            enumerable: true,
                            configurable: true
                        }
                    });
                }

				m.plugin = name;
				if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
					let chat = global.db.data.chats[m.chat];
					let user = global.db.data.users[m.sender];
					if (pluginBasename != 'owner-unbanchat.js' && pluginBasename != 'owner-exec.js' && pluginBasename != 'owner-exec2.js' && pluginBasename != 'tools-delete.js' && chat?.isBanned) return; // Except this
					if (pluginBasename != 'owner-unbanuser.js' && user?.banned) return;
				}
				// Fitur yang menyentuh website/platform (boost saham, katalog
				// plugin, data lintas akun) tetap milik owner platform. Pemilik
				// sesi Jadibot tidak boleh memakainya walau punya akses penuh
				// ke fitur bot miliknya.
				if (plugin.platformOnly && botConfig?.type === 'jadibot' && !isROwner) {
					fail('platform', m, this);
					continue;
				}
				if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
					// Both Owner
					fail('owner', m, this);
					continue;
				}
                // Owner sesi Jadibot memakai seluruh fitur bot miliknya,
                // termasuk perintah rowner seperti .sitagrup / .kudeta.
                // Pengecualian hanya plugin di lib/owner-policy.js.
                const jadibotOwnerAllowed =
                    plugin.jadibotOwner === true && botConfig?.type === 'jadibot' && isOwner &&
                    !plugin.platformOnly;
                const jadibotOwnerFull = canUseOwnerPlugin(pluginBasename, {
                    isROwner,
                    isJadibot: botConfig?.type === 'jadibot',
                    isOwner,
                });
				if (plugin.rowner && !isROwner && !jadibotOwnerAllowed && !jadibotOwnerFull) {
					// Real Owner
					fail('rowner', m, this);
					continue;
				}
				if ((plugin.owner || plugin.ownerOnly) && !isOwner) {
					// Number Owner
					fail('owner', m, this);
					continue;
				}
				if (plugin.mods && !isMods) {
					// Moderator
					fail('mods', m, this);
					continue;
				}
				// Task75: mode premium dua lapis. Saklar platform (owner/developer)
				// dan saklar per bot + daftar fitur premium milik pemilik bot.
				// OFF di salah satu lapis = fitur premium (termasuk plugin bertanda
				// premium bawaan) terbuka untuk semua pengguna bot itu.
				if (!isPrems && isPremiumFeatureLocked(botConfig, {
					key: name,
					basename: pluginBasename,
					name: plugin.name || '',
					command,
					tags: Array.isArray(plugin.tags) ? plugin.tags : [],
				}, { builtinPremium: Boolean(plugin.premium || plugin.premiumOnly) })) {
					m.__premiumFeature = `${usedPrefix}${command}`;
					m.__premiumOwner = premiumOwnerContact(botConfig);
					fail('premium', m, this);
					continue;
				}
				if ((plugin.group || plugin.groupOnly) && !m.isGroup) {
					// Group Only
					fail('group', m, this);
					continue;
				} else if (plugin.botAdmin && !isBotAdmin) {
					// You Admin
					fail('botAdmin', m, this);
					continue;
				} else if (plugin.admin && !isAdmin) {
					// User Admin
					fail('admin', m, this);
					continue;
				}
				if ((plugin.private || plugin.privateOnly) && m.isGroup) {
					// Private Chat Only
					fail('private', m, this);
					continue;
				}
				if (plugin.register == true && _user.registered == false && !(realmAccessCommand && name === 'rpg/realms.js')) {
					// Butuh daftar?
					fail('unreg', m, this);
					continue;
				}
				m.isCommand = true;
				let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17; // XP Earning per command
				if (xp > 200)
					m.reply('Ngecit -_-'); // Hehehe
				else m.exp += xp;
                let pluginLimit = plugin.limit || 0;
                if (typeof pluginLimit === 'function') {
                    try {
                        const shouldCharge = await pluginLimit({
                            message: pluginMessage,
                            m: pluginMessage,
                            conn: this,
                            text,
                            args,
                            command,
                            usedPrefix
                        });
                        pluginLimit = shouldCharge ? 1 : 0;
                    } catch {
                        pluginLimit = 1;
                    }
                }
                pluginLimit = pluginLimit === true ? 1 : Number(pluginLimit) || 0;

                // Plugin Usanagi memakai kontrak m.limit.success()/fail(), sedangkan
                // runtime lama memakai m.limit sebagai angka. Berikan controller
                // kompatibel pada pesan turunan tanpa mengubah objek pesan asli.
                let limitCommitState = plugin.limitCommit === 'manual' ? 'pending' : 'automatic';
                if (isUsanagiPlugin) {
                    Object.defineProperty(pluginMessage, 'limit', {
                        value: {
                            active: pluginLimit > 0,
                            get state() { return limitCommitState; },
                            success() {
                                if (pluginLimit <= 0) return false;
                                limitCommitState = 'success';
                                return true;
                            },
                            fail() {
                                limitCommitState = 'failed';
                                return true;
                            }
                        },
                        writable: false,
                        enumerable: true,
                        configurable: true
                    });
                }

                const activeUserLimit = Number(global.db.data.users[m.sender].limit)
                const unlimitedLimit = activeUserLimit === -1 || global.db.data.users[m.sender].isUnlimitedLimit === true
                if (limitsActive && !isPrems && !unlimitedLimit && pluginLimit > 0 && activeUserLimit < pluginLimit) {
                    this.reply(m.chat, `[❗] Limit anda habis, silahkan beli melalui *${usedPrefix}buy limit*`, m);
                    continue;
                }
				if (plugin.level > _user.level) {
					this.reply(m.chat, `[💬] Diperlukan level ${plugin.level} untuk menggunakan perintah ini\n*Level mu:* ${_user.level} 📊`, m);
					continue; // If the level has not been reached
				}
				let extra = {
					match,
					usedPrefix,
					noPrefix,
					_args,
					args,
					command,
					text,
					conn: this,
                    rawConn: this,
                    botConfig,
                    botScope: botConfig.scope,
                    prefixStorageKey: prefixKey,
                    settings: (await import('./config/settings.js')).default,
					participants,
					groupMetadata,
					user: groupUser ,
					bot,
					isROwner,
					isOwner,
					isRAdmin,
					isAdmin,
					isBotAdmin,
					isPrems,
					chatUpdate,
					__dirname,
					__filename,
				};
				try {
                    
                    
                    if (aiDispatchPlan) {
                        m.text = aiDispatchText;
                        // WebMessageInfo mendefinisikan `mentionedJid` sebagai getter
                        // (hanya baca), sehingga assignment biasa melempar
                        // "Cannot set property mentionedJid ... which has only a getter"
                        // di ESM strict mode. Pasang sebagai properti milik objek.
                        const aiMentions = (Array.isArray(m.mentionedJid) ? m.mentionedJid : [])
                            .filter(jid => !aiPlan.botMentionIds.includes(String(jid).replace(/:\d+(?=@)/, '').split('@')[0]));
                        try {
                            Object.defineProperty(m, 'mentionedJid', { value: aiMentions, writable: true, configurable: true, enumerable: true });
                        } catch { }
                        const targetCommand=plugin.importAliasMap?.[aiDispatchPlan.command]||aiDispatchPlan.command.replace(/^(?:umi|ourin|usanagi)-/,'');
                        if (/^(?:kick|add|promote|demote|warn|ban|unban|block|unblock|blacklist)$/i.test(targetCommand) && m.quoted && (m.quoted.fromMe || aiPlan.botMentionIds.includes(String(m.quoted.sender || '').replace(/:\d+(?=@)/, '').split('@')[0]))) {
                            try { Object.defineProperty(m, 'quoted', { value: null, writable: true, configurable: true, enumerable: true }); } catch { }
                            if(isUsanagiPlugin)Object.defineProperty(pluginMessage,'quotedMessage',{value:null,writable:true,configurable:true});
                        }
                    }
                    const executePlugin = () => plugin.call(this, pluginMessage, extra);
                    const isRpgMutation = name.startsWith('rpg/') || (Array.isArray(plugin.tags) && plugin.tags.includes('rpg'));
                    const messageId = m.key?.id || m.id;
                    const pluginResult = await (unifiedRpg()
                      ? runUnifiedCommand(`${this.user?.id}:${m.chat}:${m.sender}:${messageId}:${name}:${command}`, executePlugin, this, pluginMessage)
                      : isRpgMutation ? withRealmGate(executePlugin) : executePlugin());
                    // Kirim audio setelah renderer menu selesai agar video/menu dan
                    // audio tampil berurutan pada pemanggilan yang sama.
                    if ((command === 'menu' || command === 'allmenu') && botConfig?.values?.brandingAssets?.menuAudioEnabled !== false) {
                        const configuredAudio = botConfig?.values?.brandingAssets?.menuAudio || './assets/audio/menu.mp3';
                        const menuAudio = path.isAbsolute(configuredAudio)
                            ? configuredAudio
                            : path.resolve(process.cwd(), configuredAudio);
                        if (fs.existsSync(menuAudio)) {
                            try {
                                const extension = path.extname(menuAudio).toLowerCase();
                                const mimetype = extension === '.ogg' || extension === '.opus'
                                    ? 'audio/ogg'
                                    : extension === '.m4a' || extension === '.mp4'
                                        ? 'audio/mp4'
                                        : 'audio/mpeg';
                                await this.sendMessage(
                                    m.chat,
                                    { audio: fs.readFileSync(menuAudio), mimetype, ptt: false },
                                    { quoted: m }
                                );
                            } catch (audioError) {
                                console.error('[menu-audio]', audioError?.message || audioError);
                            }
                        } else {
                            console.error('[menu-audio] File tidak ditemukan:', menuAudio);
                        }
                    }
                    const shouldCommitLimit = plugin.limitCommit === 'manual'
                        ? limitCommitState === 'success'
                        : pluginResult?.success !== false && limitCommitState !== 'failed';
                    if (limitsActive && !isPrems && pluginLimit > 0 && shouldCommitLimit) {
                        m.limit = m.limit || pluginLimit;
                    }
				} catch (e) {
					// Error occured
					m.error = e;
					console.error(e);
					if (e) {
						let text = format(e);
						// Kirim juga ke halaman Feedback di website supaya jejaknya tidak hilang
						// bersama log container. Dijalankan lebih dulu (tanpa menunggu) agar tidak
						// menahan balasan ke pengguna; laporan yang sama digabung dalam 10 menit.
						// Satu pintu: log berkas + notifikasi Telegram + laporan Feedback.
						recordError(e, {
							source: 'plugin',
							plugin: m.plugin,
							command,
							prefix: usedPrefix,
							args: Array.isArray(args) ? args : [],
							sender: m.sender,
							chat: m.chat,
							scope: botConfig?.scope,
							isGroup: /@g\.us$/i.test(String(m.chat || '')),
						}).catch(() => {});
						if (e.name)
							for (let [jid] of global.owner.filter(([number, _, isDeveloper]) => isDeveloper && number)) {
								let data = (await conn.onWhatsApp(jid))[0] || {};
								if (data.exists) {
                                    const errorReport = `*🗂️ Plugin:* ${m.plugin}\n*👤 Sender:* ${m.sender}\n*💬 Chat:* ${m.chat}\n*💻 Command:* ${usedPrefix}${command} ${args.join(' ')}\n📄 *Error Logs:*\n\n\`\`\`${text}\`\`\``.trim();
                                    // Jangan quote message user ke chat developer. Context quote dapat
                                    // membawa externalAdReply/URL serta karakter invisible dari pesan
                                    // asal ke laporan error.
                                    await this.sendMessage(data.jid, { text: errorReport });
                                }
							}
						m.reply(text);
					}
				} finally {
					// m.reply(util.format(_user))
					if (typeof plugin.after === 'function') {
						try {
							await runUnifiedCommand(`hook-after:${this.user?.id}:${m.chat}:${m.sender}:${m.key?.id || m.id}:${name}`, () => plugin.after.call(this, m, extra), this, m);
						} catch (e) {
							console.error(e);
						}
					}
					if (m.limit && limitsActive && !isPrems && Number(global.db.data.users[m.sender]?.limit) !== -1 && global.db.data.users[m.sender]?.isUnlimitedLimit !== true) m.reply(+m.limit + ' Limit terpakai ✔️');
				}
				break;
			}
		}
        if (m.__autoAIAnswer) await sendAutoAIReply(this, m, m.__autoAIAnswer);
        if (maySuggestCommand(m)) {
            for (const plugin of unknownHandlers) {
                if (!maySuggestCommand(m)) break;
                try {
                    await plugin.unknownCommand.call(this, m, {
                        usedPrefix: activePrefix, botConfig,
                        isCommandDisabled: (name, command) => isPluginDisabled(botConfig, name, command),
                    });
                } catch (error) { console.error('[command-suggestion]', error?.message || error); }
            }
        }
	} catch (e) {
		console.error(e);
	} finally {
		//console.log(global.db.data.users[m.sender])
		let user,
			stats = global.db.data.stats;
		if (m) {
			if (m.sender && (user = global.db.data.users[m.sender])) {

    // Repair data rusak
    if (!unifiedRpg() && !Number.isFinite(user.exp))
        user.exp = 0

    if (!Number.isFinite(user.limit))
        user.limit = 50

    const exp = Number(m.exp) || 0
    const cost = Number(m.limit)

    if (!await awardMessageExp(m.sender, exp, m.key?.id || m.id)) user.exp += exp

    const unlimitedLimit = Number(user.limit) === -1 || user.isUnlimitedLimit === true || !limitBilling
    if (!unlimitedLimit && Number.isFinite(cost) && cost > 0) {
        user.limit = Math.max(0, user.limit - cost)
    }
}

			let stat;
			if (m.plugin) {
				let now = Date.now();
				if (m.plugin in stats) {
					stat = stats[m.plugin];
					if (!isNumber(stat.total)) stat.total = 1;
					if (!isNumber(stat.success)) stat.success = m.error != null ? 0 : 1;
					if (!isNumber(stat.last)) stat.last = now;
					if (!isNumber(stat.lastSuccess)) stat.lastSuccess = m.error != null ? 0 : now;
				} else
					stat = stats[m.plugin] = {
						total: 1,
						success: m.error != null ? 0 : 1,
						last: now,
						lastSuccess: m.error != null ? 0 : now,
					};
				stat.total += 1;
				stat.last = now;
				if (m.error == null) {
					stat.success += 1;
					stat.lastSuccess = now;
				}
			}
		}

		try {
			await (await import(`./lib/print.js`)).default(m, this);
		} catch (e) {
			console.log(m, m.quoted, e);
		}
		if (global.db.data.settings[this.user.jid]?.autoread) await conn.readMessages([m.key]);
	}
}

/**
 * Handle groups participants update
 * @param {import('baileys').BaileysEventMap<unknown>['group-participants.update']} groupsUpdate
 */


const fixJid = async (conn, jid) => {
  jid = cleanJid(jid)

  try {
    const data = await conn.findUserId(jid)
    return cleanJid(data?.phoneNumber || data?.jid || jid)
  } catch {
    return jid
  }
}

const sendForceMention = async (
  conn,
  jid,
  text,
  mentions = [],
  quoted = null
) => {

  const msg = generateWAMessageFromContent(
    jid,
    {
      extendedTextMessage:
        proto.Message.ExtendedTextMessage.fromObject({
          text,
          contextInfo: {
            mentionedJid: mentions
          }
        })
    },
    quoted ? { quoted } : {}
  )

  return conn.relayMessage(
    jid,
    msg.message,
    {
      messageId: msg.key.id
    }
  )
}

export async function participantsUpdate({
  id,
  participants,
  action,
  simulate = false
}) {

  if (this.isInit && !simulate) return

  if (global.db.data == null)
    await global.loadDatabase()

  let chat = global.db.data.chats[id] || {}

  const groupMetadata =
    (this.chats[id] || {}).metadata ||
    await this.groupMetadata(id).catch(() => ({}))

  const defaultEventPrefix = this.botConfig?.defaultPrefix || global.mainBot?.defaultPrefix || '/'
  const eventPrefix = await getActivePrefix(
    prefixStorageKey(this, id),
    defaultEventPrefix
  ).catch(() => defaultEventPrefix)
  const eventButtons = [
    { label: 'INFO GRUP', command: `${eventPrefix}groupinfo` },
    { label: 'MENU BOT', command: `${eventPrefix}menu` },
    { label: 'PERATURAN', command: `${eventPrefix}peraturan` },
  ]

  switch (action) {

    case 'add': {

        global.db.data.blacklistUser ||= {}

        for (let user of participants) {

            const rawUser =
                user?.phoneNumber ||
                user?.id ||
                user

            const cleanUser = cleanJid(rawUser)
            const number = cleanUser.split('@')[0]

            const blacklisted =
                global.db.data.blacklistUser[cleanUser] ||
                global.db.data.blacklistUser[number] ||
                Object.keys(global.db.data.blacklistUser).some(jid => {
                    return cleanJid(jid).split('@')[0] === number
                })

            if (blacklisted) {

                console.log(
                    `[BLACKLIST] ${number} masuk ${id}, mengeluarkan user...`
                )

                try {
                    await this.groupParticipantsUpdate(
                        id,
                        [cleanUser],
                        'remove'
                    )
                } catch (e) {
                    console.error(
                        `[BLACKLIST] Gagal kick ${number}:`,
                        e
                    )
                }

                continue
            }
        }

        // lanjutkan welcome
        if (!chat.welcome) break

        for (let user of participants) {

            user = await fixJid(
                this,
                user?.phoneNumber ||
                user?.id ||
                user
            )

            // Jangan welcome user yang baru saja di-kick
            const number = cleanJid(user).split('@')[0]

            const blacklisted =
                Object.keys(global.db.data.blacklistUser || {})
                    .some(jid =>
                        cleanJid(jid).split('@')[0] === number
                    )

            if (blacklisted)
                continue

            const metadata = await this
                .groupMetadata(id)
                .catch(() => groupMetadata || {})

            const groupName =
                metadata.subject ||
                this.getName(id) ||
                'Group'

            const groupDesc =
                metadata.desc ||
                metadata.description ||
                'Tidak ada deskripsi grup'

            const totalMember =
                metadata.participants?.length || 0

            const memberCount = totalMember

            const sessionBrandingAssets = this.botConfig?.values?.brandingAssets || {}
            const welcomeBannerPath =
                sessionBrandingAssets.welcomeBanner ||
                sessionBrandingAssets.banner ||
                global.brandingAssets?.welcomeBanner ||
                global.brandingAssets?.banner ||
                './media/banner.jpg'

            let card
            if (fs.existsSync(welcomeBannerPath)) {
                card = fs.readFileSync(welcomeBannerPath)
            } else {
                const pp = await this
                    .profilePictureUrl(user, 'image')
                    .catch(() => null)

                card = await createWelcomeCard({
                    avatar: pp,
                    username: '@' + user.split('@')[0],
                    groupName,
                    memberCount,
                    type: 'welcome'
                })
            }

            const defaultWelcomeText = `╭─〔 👋 WELCOME 〕
│ Halo @user
│ Selamat datang di *@subject*
│
│ 🌸 Member ke-@member
│ 👥 Total member: @member
╰────────────────`
            // Jadibot templates must never read shared group/SQLite text.
            // Only the owning session can supply its custom text.
            const template = this.botConfig?.type === 'jadibot'
                ? (getSessionWelcomeTemplate(this, id) || defaultWelcomeText)
                : (chat.sWelcome || this.welcome || defaultWelcomeText)
            const botName = this.botConfig?.values?.namebot || global.namebot || 'Usanagi Umi AI'
            const botNumber = cleanJid(this.user?.id).split('@')[0]
            const text = renderGroupEventTemplate(template, {
                user,
                groupName,
                groupDesc,
                memberCount,
                botName,
                botNumber,
            })

            await sendInteractive(this, id, {
                title: '👋 WELCOME',
                subtitle: groupName,
                body: text,
                footer: `🤖 ${botName} • Welcome Group`,
                image: card,
                mentions: [user],
                buttons: eventButtons,
            })
        }

        break
    }

    case 'remove': {

        if (!chat.welcome) break

        for (let user of participants) {

            user = await fixJid(
                this,
                user?.phoneNumber ||
                user?.id ||
                user
            )

            const metadata = await this
                .groupMetadata(id)
                .catch(() => groupMetadata || {})

            const groupName =
                metadata.subject ||
                this.getName(id) ||
                'Group'

            const groupDesc =
                metadata.desc ||
                metadata.description ||
                'Tidak ada deskripsi grup'

            const totalMember =
                metadata.participants?.length || 0

            const memberCount =
                Math.max(totalMember - 1, 0)

            const sessionBrandingAssets = this.botConfig?.values?.brandingAssets || {}
            const goodbyeBannerPath =
                sessionBrandingAssets.goodbyeBanner ||
                global.brandingAssets?.goodbyeBanner ||
                global.brandingAssets?.banner ||
                './media/banner.jpg'

            let card
            if (fs.existsSync(goodbyeBannerPath)) {
                card = fs.readFileSync(goodbyeBannerPath)
            } else {
                const pp = await this
                    .profilePictureUrl(user, 'image')
                    .catch(() => null)

                card = await createWelcomeCard({
                    avatar: pp,
                    username: '@' + user.split('@')[0],
                    groupName,
                    memberCount,
                    type: 'goodbye'
                })
            }

            const defaultGoodbyeText = `╭─〔 👋 GOODBYE 〕
│ Sampai jumpa @user
│ Terima kasih sudah bersama
│ *@subject*
│
│ 👥 Sisa member: @member
╰────────────────`
            // Jadibot templates must never read shared group/SQLite text.
            // Only the owning session can supply its custom text.
            const template = this.botConfig?.type === 'jadibot'
                ? (getSessionGoodbyeTemplate(this, id) || defaultGoodbyeText)
                : (chat.sBye || this.bye || defaultGoodbyeText)
            const botName = this.botConfig?.values?.namebot || global.namebot || 'Usanagi Umi AI'
            const botNumber = cleanJid(this.user?.id).split('@')[0]
            const text = renderGroupEventTemplate(template, {
                user,
                groupName,
                groupDesc,
                memberCount,
                botName,
                botNumber,
            })

            await sendInteractive(this, id, {
                title: '👋 GOODBYE',
                subtitle: groupName,
                body: text,
                footer: `🤖 ${botName} • Goodbye Group`,
                image: card,
                mentions: [user],
                buttons: eventButtons,
            })
        }

        break
    }

    case 'promote':
    case 'demote':

      if (!chat.detect) break

      for (let user of participants) {

        user = await fixJid(
          this,
          user?.phoneNumber ||
          user?.id ||
          user
        )

        let text = (
          action === 'promote'
            ? chat.sPromote ||
              '@user sekarang admin'
            : chat.sDemote ||
              '@user bukan admin lagi'
        )
        .replace(
          /@user/g,
          '@' + user.split('@')[0]
        )

        await sendForceMention(
          this,
          id,
          text,
          [user]
        )
      }

      break
  }
}


/**
 * Handle groups update
 * @param {import('baileys').BaileysEventMap<unknown>['groups.update']} groupsUpdate
 */
export async function groupsUpdate(groupsUpdate) {
	for (const groupUpdate of groupsUpdate) {
		const id = groupUpdate.id;
		if (!id) continue;
		let chats = global.db.data.chats[id],
			text = '';
		if (!chats?.detect) continue;
		if (groupUpdate.desc) text = (chats.sDesc || this.sDesc || conn.sDesc || '```Description has been changed to```\n@desc').replace('@desc', groupUpdate.desc);
		if (groupUpdate.subject) text = (chats.sSubject || this.sSubject || conn.sSubject || '```Subject has been changed to```\n@subject').replace('@subject', groupUpdate.subject);
		if (groupUpdate.icon) text = (chats.sIcon || this.sIcon || conn.sIcon || '```Icon has been changed to```').replace('@icon', groupUpdate.icon);
		if (groupUpdate.revoke) text = (chats.sRevoke || this.sRevoke || conn.sRevoke || '```Group link has been changed to```\n@revoke').replace('@revoke', groupUpdate.revoke);
		if (!text) continue;
		await this.sendMessage(id, { text, mentions: this.parseMention(text) });
	}
}

export async function deleteUpdate(message) {
	try {
		const { fromMe, id, participant } = message;
		if (fromMe) return;
		let msg = this.serializeM(this.loadMessage(id));
		if (!msg) return;
		let chat = global.db.data.chats[msg.chat];
		if (!chat.delete) return;
		await this.reply(
			msg.chat,
			`
Terdeteksi @${cleanJid(participant).split('@')[0]} telah menghapus pesan
Untuk mematikan fitur ini, ketik
*.enable delete*
`.trim(),
			msg,
			{
				mentions: [cleanJid(participant)],
			}
		);
		this.copyNForward(msg.chat, msg).catch((e) => console.log(e, msg));
	} catch (e) {
		console.error(e);
	}
}

global.dfail = (type, m, conn) => {
  let msg = {
    rowner: (m, conn) => conn.reply(m.chat, `Ara~ command ini hanya untuk developer bot`, m),

    owner: (m, conn) => conn.reply(m.chat, `Nee~ command ini khusus owner`, m),

    platform: (m, conn) => conn.reply(m.chat, `Ara~ fitur ini bagian dari website/platform, jadi hanya developer bot yang bisa memakai`, m),

    mods: (m, conn) => conn.reply(m.chat, `Hehe~ hanya moderator yang boleh pakai fitur ini`, m),

    premium: (m, conn) => {
      const feature = String(m.__premiumFeature || '').trim()
      const owner = String(m.__premiumOwner || '').replace(/\D/g, '')
      const lines = [
        '💎 *FITUR PREMIUM*',
        feature
          ? `Fitur *${feature}* hanya untuk pengguna premium di bot ini.`
          : 'Fitur ini khusus pengguna premium di bot ini.',
        owner
          ? `Mau akses? Hubungi owner bot: wa.me/${owner}`
          : 'Mau akses? Hubungi owner bot untuk aktivasi premium.',
        'Owner bot bisa mengatur daftar fitur premium lewat perintah *.premium*',
      ]
      return conn.reply(m.chat, lines.join('\n'), m)
    },

    group: (m, conn) => conn.reply(m.chat, `Ara~ command ini cuma bisa dipakai di grup`, m),

    private: (m, conn) => conn.reply(m.chat, `Nee~ command ini hanya bisa dipakai di chat pribadi`, m),

    admin: (m, conn) => conn.reply(m.chat, `Hehe~ hanya admin grup yang boleh pakai fitur ini`, m),

    botAdmin: (m, conn) => conn.reply(m.chat, `Ara~ jadikan aku admin dulu`, m),

    unreg: (m, conn) =>
      conn.reply(
        m.chat,
        `Ara~ kamu belum terdaftar.\nDaftar dulu ya kalau mau pakai fiturku~\n.daftar Nama.Umur`,
        m
      ),
  }[type]

  if (!msg) return
  return msg(m, conn)
}
let file = global.__filename(import.meta.url, true);
watchFile(file, async () => {
	unwatchFile(file);
	console.log(chalk.redBright("Update 'handler.js'"));
	if (global.reloadHandler) console.log(await global.reloadHandler());
});
