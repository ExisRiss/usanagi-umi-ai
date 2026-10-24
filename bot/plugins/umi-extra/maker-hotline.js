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

export const FEATURE_CREDIT = 'By AlzRiss - Usanagi Umi AI';


import axios from "axios";

const pluginConfig = {
  name: "hotline",
  alias: [],
  category: "maker",
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

const handler = async (m, { conn, usedPrefix, command }) => {
    await m.react("🕐");

    const raw = (m.text || '').slice((usedPrefix + command).length).trim();

    if (!raw)
        return m.reply(
            `Format:\n${usedPrefix + command} teks atas|teks bawah\n\nContoh:\n${usedPrefix + command} p|salam`
        );

    if (!raw.includes("|"))
        return m.reply(
            `Gunakan pemisah |\n\nContoh:\n${usedPrefix + command} hello|world`
        );

    const [text1Raw, text2Raw] = raw.split("|");

    const imgUrl =
        `https://api.cuki.biz.id/api/canvas/meme/hotline` +
        `?apikey=YOUR_API_KEY&text1=${encodeURIComponent(text1Raw.trim())}` +
        `&text2=${encodeURIComponent(text2Raw.trim())}`;

    try {
        const res = await axios.get(imgUrl, { responseType: "arraybuffer" });

        await conn.sendFile(
            m.chat,
            res.data,
            "hotline.png",
            "🖼️ Hotline Meme",
            m
        );

        await m.react("✅");
    } catch (e) {
        console.error("❌ hotline error:", e);
        await m.react("❌");
        m.reply(`*ERROR:* ${e.message}`);
    }
};

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["hotline"]
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
__umiHandler.help = ["hotline"]
__umiHandler.tags = ["maker"]
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
