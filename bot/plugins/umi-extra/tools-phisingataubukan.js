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

import axios from "axios";

const pluginConfig = {
  name: "phisingataubukan",
  alias: ["cekphising", "checkphishing", "webphishing"],
  category: "tools",
  description: "Cek apakah sebuah link URL merupakan web phising/berbahaya atau aman.",
  usage: ".phisingataubukan <url>",
  example: ".phisingataubukan https://google.com",
  cooldown: 10,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const url = m.text?.trim();

  if (!url) {
    return m.reply(
      `Halo *${m.pushName}* 👋\n\n` +
      `Silakan masukkan link URL yang ingin dicek keamanannya.\n\n` +
      `Contoh:\n- \`${m.prefix}phisingataubukan https://google.com\``
    );
  }

  m.react("🕕");

  try {
    const apiUrl = `https://api.nexray.eu.cc/tools/webphishing?url=${encodeURIComponent(url)}`;
    const res = await axios.get(apiUrl);
    const data = res.data;

    if (!data.status || !data.result) {
      await m.react("❌");
      return m.reply("⚠️ Gagal mengecek URL. Pastikan link yang dimasukkan valid atau coba lagi nanti.");
    }

    const { result } = data;
    
    let info = `🛡️ *HASIL SCAN URL* 🛡️\n\n`;
    info += `🔗 *URL:* ${result.scanned_url}\n`;
    info += `📊 *Status:* ${result.status_description}\n\n`;
    info += `*DETAIL SCAN:*\n`;
    info += `- Phising: ${result.is_phishing ? "🚨 Ya" : "✅ Tidak"}\n`;
    info += `- Mengandung Malware: ${result.contains_malware ? "🚨 Ya" : "✅ Tidak"}\n`;
    info += `- Membawa ke Situs Berbahaya: ${result.sends_to_harmful_sites ? "🚨 Ya" : "✅ Tidak"}\n`;
    info += `- Menginstal Software Jahat: ${result.installs_malicious_software ? "🚨 Ya" : "✅ Tidak"}\n`;
    info += `- Unduhan Tidak Wajar: ${result.uncommon_downloads ? "🚨 Ya" : "✅ Tidak"}\n\n`;
    info += `_Terakhir dipindai: ${new Date(result.last_modified).toLocaleString("id-ID")}_`;

    await m.reply(info);
    m.react("✅");

  } catch (error) {
    console.error("[Phishing Check Error]", error);
    await m.react("❌");
    m.reply("😔 Terjadi kesalahan sistem saat mengecek URL tersebut. Mohon coba lagi nanti.");
  }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["phisingataubukan", "cekphising", "checkphishing", "webphishing"]
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
__umiHandler.help = ["phisingataubukan .phisingataubukan <url>"]
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
