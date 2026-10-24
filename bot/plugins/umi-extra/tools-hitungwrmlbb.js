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

const pluginConfig = {
  name: "hitungwrmlbb",
  alias: ["wrml", "wrmlbb", "winrate"],
  category: "tools",
  description: "Hitung kebutuhan win tanpa lose untuk mencapai target win rate di Mobile Legends.",
  usage: ".hitungwrmlbb <total_match> <wr_sekarang> <wr_target>",
  example: ".hitungwrmlbb 4242 22 88",
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock, args }) {
  if (args.length < 3) {
    return m.reply(
      `Halo *${m.pushName}* 👋\n\n` +
      `Untuk menghitung target Win Rate MLBB kamu, gunakan format:\n` +
      `- \`${m.prefix}hitungwrmlbb <total_match> <wr_sekarang> <wr_target>\`\n\n` +
      `Contoh:\n- \`${m.prefix}hitungwrmlbb 4242 22 88\``
    );
  }

  const [totalMatch, wrNow, wrTarget] = args;

  if (isNaN(totalMatch) || isNaN(wrNow) || isNaN(wrTarget)) {
    return m.reply("❌ Angka tidak valid. Pastikan semua yang dimasukkan adalah angka (tanpa %).\n\nContoh: `.hitungwrmlbb 4242 22 88`");
  }

  m.react("🕕");

  try {
    const apiUrl = `https://api.nexray.eu.cc/tools/winrate-mlbb?total_match=${totalMatch}&wr_now=${wrNow}&wr_target=${wrTarget}`;
    const res = await axios.get(apiUrl);
    const data = res.data;

    if (!data.status || !data.result) {
      await m.react("❌");
      return m.reply("⚠️ Gagal menghitung Win Rate. Pastikan angkanya masuk akal atau coba lagi nanti.");
    }

    let info = `🎮 *KALKULATOR WINRATE MLBB* 🎮\n\n`;
    info += `📊 Total Match: *${totalMatch}*\n`;
    info += `📉 WR Sekarang: *${wrNow}%*\n`;
    info += `📈 WR Target: *${wrTarget}%*\n\n`;
    info += `💡 *Hasil Analisa:*\n${data.result}`;

    await m.reply(info);
    m.react("✅");

  } catch (error) {
    console.error("[WR MLBB Error]", error);
    await m.react("❌");
    m.reply("😔 Terjadi kesalahan sistem saat menghitung Win Rate. Mohon coba lagi nanti.");
  }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["hitungwrmlbb", "wrml", "wrmlbb", "winrate"]
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
__umiHandler.help = ["hitungwrmlbb .hitungwrmlbb <total_match> <wr_sekarang> <wr_target>"]
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
