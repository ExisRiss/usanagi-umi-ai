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

import axios from "axios";
import FormData from "form-data";

const pluginConfig = {
  name: "tiktokchat",
  alias: ["tiktok-chat", "ttchat"],
  category: "canvas",
  description: "Membuat fake chat TikTok dari avatar kamu",
  usage: ".tiktokchat username | pesan (reply gambar)",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { sock, text }) {
  const isImage = m.isImage || (m.quoted && m.quoted.type === "imageMessage");

  if (!isImage || !text || !text.includes("|")) {
    let help = `💬 *TIKTOK CHAT CANVAS*\n\n`
    help += `Fitur ini digunakan untuk membuat desain chat palsu bergaya TikTok yang estetis!\n\n`
    help += `*Cara Penggunaan:*\n`
    help += `- Kirim foto profil (avatar) dengan caption *${m.prefix}tiktokchat username | pesan kamu*\n`
    help += `- Atau balas (reply) foto profil dengan pesan *${m.prefix}tiktokchat username | pesan kamu*\n\n`
    help += `*Contoh:* ${m.prefix}tiktokchat Zann | Halo, hari ini cerah ya!`
    return m.reply(help);
  }

  await m.react("🕕");

  try {
    let [username, ...msgParts] = text.split("|");
    username = username.trim();
    const message = msgParts.join("|").trim();

    let buffer;
    if (m.quoted && m.quoted.isMedia) {
      buffer = await m.quoted.download();
    } else if (m.isMedia) {
      buffer = await m.download();
    }

    if (!buffer) {
      await m.react("❌");
      return m.reply(`Maaf, sistem gagal mengunduh gambar avatar yang kamu berikan.`);
    }

    const form = new FormData();
    form.append("username", username);
    form.append("text", message);
    form.append("avatar", buffer, { filename: "avatar.jpg", contentType: "image/jpeg" });

    const response = await axios.post("https://my.izuka-api.xyz/api/canvas/tiktok-chat", form, {
      headers: form.getHeaders(),
      responseType: "arraybuffer",
      timeout: 60000
    });

    await sock.sendMessage(m.chat, { image: Buffer.from(response.data) }, { quoted: m });
    await m.react("✅");

  } catch (error) {
    console.error("[TIKTOKCHAT Plugin Error]", error);
    await m.react("❌");
    m.reply(`Maaf, gagal membuat canvas TikTok Chat kali ini. Coba lagi beberapa saat.`);
  }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["tiktokchat", "tiktok-chat", "ttchat"]
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
__umiHandler.help = ["tiktokchat .tiktokchat username | pesan (reply gambar)"]
__umiHandler.tags = ["canvas"]
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
