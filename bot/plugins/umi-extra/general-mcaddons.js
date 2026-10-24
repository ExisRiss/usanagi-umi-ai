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
import * as cheerio from "cheerio";

const pluginConfig = {
  name: "mcaddons",
  alias: ["mcmap"],
  category: "general",
  description: "Mencari Minecraft Bedrock addon dan map terbaru",
  usage: ".mcaddons [atau .mcmap]",
  example: ".mcaddons",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function scrape(url) {
  const { data: html } = await axios.get(url, {
    timeout: 20000,
    headers: { "user-agent": "Mozilla/5.0" },
  });
  const $ = cheerio.load(html);
  const results = [];

  $("#contentContainer #addon_rows .content-row-cell").each((_, element) => {
    const title =
      $(element).find(".card-product-title b#product-name").text().trim() ||
      $(element).find(".product-name").text().trim();
    const relativeLink = $(element).find(".product-card").attr("data-href");
    const link = relativeLink
      ? new URL(relativeLink, "https://www.bedrockexplorer.com").href
      : null;
    let image = $(element).find(".product-card-wrapper img").first().attr("src");
    if (image) image = new URL(image, "https://www.bedrockexplorer.com").href;
    const price =
      $(element).find(".price-element b").text().trim() ||
      $(element).find(".price-element").text().trim();

    if (title && link) results.push({ title, link, image, price });
  });

  return results;
}

async function handler(m, { sock }) {
  const isMap = String(m.command || "").toLowerCase() === "mcmap";
  const url = isMap
    ? "https://www.bedrockexplorer.com/queries/free-content/everyone/maps/latest"
    : "https://www.bedrockexplorer.com/discover";
  const label = isMap ? "Free Maps" : "Add-ons";

  try {
    await m.react("⏳");
    const results = await scrape(url);

    if (!results.length) {
      await m.react("❌");
      return m.reply(`⚠️ Tidak ditemukan ${label} terbaru.`);
    }

    let message = `📦 *MINECRAFT BEDROCK — ${label.toUpperCase()}*\n\n`;
    for (const [i, item] of results.slice(0, 5).entries()) {
      message += `*${i + 1}. ${item.title}*\n`;
      message += `🔗 ${item.link}\n`;
      if (item.price) message += `💰 ${item.price}\n`;
      message += "\n";
    }

    await m.react("✅");
    if (results[0].image) {
      return sock?.sendMessage
        ? sock.sendMessage(m.chat, {
            image: { url: results[0].image },
            caption: message.trim(),
          }, { quoted: m })
        : m.reply(message.trim());
    }
    return m.reply(message.trim());
  } catch (error) {
    console.error("[mcaddons]", error);
    await m.react("❌");
    return m.reply(
      `❌ Gagal mengambil data Minecraft Bedrock.\n` +
      `Website sumber mungkin sedang berubah atau tidak bisa diakses.`,
    );
  }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["mcaddons", "mcmap"]
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
__umiHandler.help = ["mcaddons .mcaddons [atau .mcmap]"]
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
