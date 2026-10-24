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

import os from "os";
import fs from "fs";

const pluginConfig = {
  name: "speedbot",
  alias: ["speed-bot", "serverinfo"],
  category: "tools",
  description: "Menampilkan statistik performa server bot",
  usage: ".speedbot",
  example: ".speedbot",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function formatBytes(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = Number(bytes) || 0;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index++;
  }
  return `${value.toFixed(index ? 2 : 0)} ${units[index]}`;
}

function runtime(seconds) {
  seconds = Math.floor(seconds);
  const d = Math.floor(seconds / 86400);
  seconds %= 86400;
  const h = Math.floor(seconds / 3600);
  seconds %= 3600;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${d}d ${h}h ${m}m ${s}s`;
}

async function handler(m) {
  const start = performance.now();
  const cpus = os.cpus();
  const memory = process.memoryUsage();
  let disk = null;

  try {
    if (typeof fs.statfsSync === "function") {
      const stat = fs.statfsSync(process.cwd());
      const total = stat.blocks * stat.bsize;
      const free = stat.bavail * stat.bsize;
      disk = { total, free, used: Math.max(0, total - free) };
    }
  } catch {}

  const ping = performance.now() - start;
  const load = os.loadavg?.() || [0, 0, 0];

  let text =
    `⚡ *ALZRISS SERVER STATUS*\n\n` +
    `🏓 Ping: *${ping.toFixed(2)} ms*\n` +
    `⏱️ Uptime: *${runtime(process.uptime())}*\n` +
    `🖥️ OS: *${os.type()} ${os.release()}*\n` +
    `🧠 CPU: *${cpus.length} core — ${cpus[0]?.model?.trim() || "Unknown"}*\n` +
    `📊 Load: *${load.map((n) => n.toFixed(2)).join(" / ")}*\n\n` +
    `💾 *RAM*\n` +
    `• Total: ${formatBytes(os.totalmem())}\n` +
    `• Free: ${formatBytes(os.freemem())}\n` +
    `• Bot RSS: ${formatBytes(memory.rss)}\n`;

  if (disk) {
    text +=
      `\n💿 *DISK*\n` +
      `• Total: ${formatBytes(disk.total)}\n` +
      `• Used: ${formatBytes(disk.used)}\n` +
      `• Free: ${formatBytes(disk.free)}\n`;
  }

  return m.reply(text.trim());
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["speedbot", "speed-bot", "serverinfo"]
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
__umiHandler.help = ["speedbot .speedbot"]
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
