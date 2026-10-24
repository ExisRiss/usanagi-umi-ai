/* By AlzRiss - Usanagi Umi AI */
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

const pluginConfig = {
  name: "debiner",
  alias: ["bintotext", "bin2teks", "decodebiner"],
  category: "tools",
  description: "Mengubah kode binary menjadi teks",
  usage: ".debiner <binary>",
  example: ".debiner 01001000 01100101",
  isOwner: false, isPremium: false, isGroup: false, isPrivate: false,
  cooldown: 2, energi: 0, isEnabled: true,
};

async function handler(m) {
  const input = String(m.args?.join(" ") || m.text || "").trim();
  if (!input) return m.reply(`📝 *DECODE BINARY*\n\nContoh: ${m.prefix}debiner 01001000 01100101`);
  const parts = input.split(/\s+/);
  if (parts.some(v => !/^[01]+$/.test(v))) {
    return m.reply("❌ Binary hanya boleh berisi 0 dan 1, dipisahkan spasi.");
  }
  try {
    const text = parts.map(v => String.fromCodePoint(parseInt(v, 2))).join("");
    await m.react?.("📝");
    return m.reply(`📝 *DECODE BINARY*\n\nInput:\n\`${input.slice(0, 500)}\`\n\nOutput:\n${text}`);
  } catch (e) {
    return m.reply(`❌ Binary tidak valid: ${e.message}`);
  }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["debiner", "bintotext", "bin2teks", "decodebiner"]
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
__umiHandler.help = ["debiner .debiner <binary>"]
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
