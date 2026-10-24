/*
╔══════════════════════════════════════════════╗
║        ⚡  𝑨𝑳𝒁𝑹𝑰𝑺𝑺 𝑴𝑫  ⚡                     ║
╚══════════════════════════════════════════════╝

╭───────────「 ✦ 𝑰𝑵𝑭𝑶 𝑨𝑳𝒁𝑹𝑰𝑺𝑺 ✦ 」───────────╮
│ 👤 Developer : 𝑨𝒍𝒛𝑹𝒊𝒔𝒔
│ 📢 Saluran   : https://whatsapp.com/channel/0029VbDBOXH11ulIKHVbmO0m
│ ⚙️ Engine    : Baileys Multi-Device
╰──────────────────────────────────────────────╯

              「 ⚡ 𝑨𝑳𝒁𝑹𝑰𝑺𝑺 𝑴𝑫 ⚡ 」
*/

export const FEATURE_CREDIT = 'By AlzRiss - Usanagi Umi AI';


/**
 ╔══════════════════════
      ⧉  [readqr] — [tools]
╚══════════════════════

  ✺ Type     : Plugin ESM
  ✺ Source   : https://whatsapp.com/channel/0029VbDBOXH11ulIKHVbmO0m
  ✺ Creator  : SXZnightmare
  ✺ Note    : gunain untuk membaca atau decode QR code langsung dari gambar, buat uji coba pake fitur qrcode lalu readqr juga bisa, tq to Zenz telah mencari web atau api nya ygy
*/

const pluginConfig = {
  name: "readqr",
  alias: [],
  category: "tools",
  description: "Imported from Usanagi Umi AI V4.6",
  usage: "",
  example: "",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock, prefix, command }) {
    const conn = sock;
    const usedPrefix = prefix || m.prefix || ".";
    try {
        let q = m.quoted ? m.quoted : m;
        let mime = (q.msg || q).mimetype || "";
        if (!mime.startsWith("image/")) {
            return m.reply(`*Reply atau kirim gambar QR Code*\n*Contoh: ${usedPrefix + command}*`);
        }

        await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

        let buffer = await q.download();
        let form = new FormData();
        form.append("file", new Blob([buffer]), "qrcode.png");

        let res = await fetch("https://api.qrserver.com/v1/read-qr-code/", {
            method: "POST",
            body: form
        });

        let json = await res.json();
        let result = json?.[0]?.symbol?.[0];

        if (!result || result.error || !result.data) {
            return m.reply(`🍂 *Gagal membaca QR Code.*\nPastikan gambar jelas dan tidak blur.`);
        }

        let output = `
📷 *QR Code Berhasil Dibaca*
━━━━━━━━━━━━━━
📄 *Isi QR:*
${result.data}
━━━━━━━━━━━━━━
        `.trim();

        await m.reply(output);
    } catch (e) {
        await m.reply(`🍂 *Terjadi kesalahan saat memproses QR Code.*`);
    } finally {
        await conn.sendMessage(m.chat, { react: { text: "", key: m.key } });
    }
};

handler.register = false; // true kan jika ada fitur register atau daftar di bot mu.

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["readqr"]
const __umiOriginalHandler = handler
const __umiHandler = async function (m, context = {}) {
  const adapted = Object.create(m)
  Object.defineProperties(adapted, {
    text: { value: String(context.text || ''), writable: true, configurable: true },
    args: { value: context.args || [], writable: true, configurable: true },
    command: { value: String(context.command || '').toLowerCase(), writable: true, configurable: true },
    prefix: { value: context.usedPrefix || '.', writable: true, configurable: true },
    isOwner: { value: Boolean(context.isOwner), writable: true, configurable: true },
    isPremium: { value: Boolean(context.isPrems), writable: true, configurable: true },
    isAdmin: { value: Boolean(context.isAdmin), writable: true, configurable: true },
    isBotAdmin: { value: Boolean(context.isBotAdmin), writable: true, configurable: true }
  })
  return __umiOriginalHandler.call(this, adapted, {
    ...context,
    sock: context.conn,
    conn: context.conn,
    text: String(context.text || ''),
    query: String(context.text || ''),
    args: context.args || [],
    command: String(context.command || '').toLowerCase(),
    prefix: context.usedPrefix || '.',
    usedPrefix: context.usedPrefix || '.',
    db: global.db
  })
}
__umiHandler.help = ["readqr"]
__umiHandler.tags = ["tools"]
__umiHandler.command = new RegExp(`^(${__umiCommands.map(value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`, 'i')
__umiHandler.owner = false
__umiHandler.premium = false
__umiHandler.group = false
__umiHandler.private = false
__umiHandler.admin = false
__umiHandler.botAdmin = false
__umiHandler.limit = false
__umiHandler.source = 'Usanagi Umi AI feature collection'
export default __umiHandler
