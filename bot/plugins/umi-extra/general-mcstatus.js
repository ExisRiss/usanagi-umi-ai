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
  name: "mcstatus",
  alias: ["mcstat"],
  category: "general",
  description: "Mengecek status server Minecraft Java",
  usage: ".mcstatus <ip/domain[:port]>",
  example: ".mcstatus play.example.net",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const address = (m.args || []).join(" ").trim();
  if (!address) {
    return m.reply(
      `🎮 *MINECRAFT SERVER STATUS*\n\n` +
      `Masukkan IP/domain server Minecraft Java.\n\n` +
      `Contoh:\n${m.prefix}mcstatus play.example.net\n` +
      `${m.prefix}mcstat play.example.net:25565`,
    );
  }

  try {
    const url = `https://api.mcsrvstat.us/3/${encodeURIComponent(address)}`;
    const { data } = await axios.get(url, { timeout: 15000 });

    if (!data?.online) {
      return m.reply(`❌ Server *${address}* sedang offline atau tidak ditemukan.`);
    }

    const host = data.hostname || address;
    const port = data.port || 25565;
    const version = data.version || "Tidak diketahui";
    const online = data.players?.online ?? 0;
    const max = data.players?.max ?? 0;
    const motd = Array.isArray(data.motd?.clean)
      ? data.motd.clean.join(" ").trim()
      : String(data.motd?.clean || "").trim();

    let text =
      `🎮 *MINECRAFT SERVER STATUS*\n\n` +
      `🌐 Host: *${host}*\n` +
      `🔌 Port: *${port}*\n` +
      `🛠️ Version: *${version}*\n` +
      `👥 Players: *${online}/${max}*\n` +
      `🟢 Status: *Online*`;

    if (motd) text += `\n📝 MOTD: ${motd}`;

    if (data.players?.list?.length) {
      const players = data.players.list.slice(0, 10).map((p) => p.name).join(", ");
      text += `\n👤 Online: ${players}${data.players.list.length > 10 ? "..." : ""}`;
    }

    return m.reply(text);
  } catch (error) {
    console.error("[mcstatus]", error);
    return m.reply(
      `❌ Gagal mengecek server.\n\n` +
      `Pastikan IP/domain benar dan coba lagi beberapa saat.`,
    );
  }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["mcstatus", "mcstat"]
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
__umiHandler.help = ["mcstatus .mcstatus <ip/domain[:port]>"]
__umiHandler.tags = ["general"]
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
