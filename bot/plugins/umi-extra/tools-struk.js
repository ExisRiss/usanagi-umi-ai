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
    name: 'struk',
    alias: ['printstruk', 'buatstruk', 'pdfstruk'],
    category: 'tools',
    description: 'Membuat struk belanja simpel (Nama Store, No Telp, Produk, Jumlah, Harga, Tanggal)',
    usage: '.struk <Nama Store> | <No Telp> | <Produk> | <Jumlah> | <Harga>',
    example: '.struk Toko Berkah | 08123456789 | Kopi Susu | 2 | 5000',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
};

function rupiah(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

function waktuSekarang() {
  const parts = new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date());

  const get = (type) => parts.find((part) => part.type === type)?.value;
  return `${get("day")}-${get("month")}-${get("year")} ${get("hour")}:${get("minute")}`;
}

async function handler(m, { usedPrefix, prefix, command, text, sock, conn }) {
  const clientBot = sock || conn;

  // Validasi jika perintah diketik kosong
  if (!text || text.trim().length === 0) {
    if (typeof m.react === 'function') await m.react('❌');
    let warning = `❌ *Format Perintah Salah!*\n\n`;
    warning += `Gunakan format di bawah ini:\n\n`;
    warning += `📌 *Tanpa Custom Toko:*\n`;
    warning += `> \`${prefix}${command} Nama Produk | Jumlah | Harga\`\n\n`;
    warning += `📌 *Dengan Custom Toko:*\n`;
    warning += `> \`${prefix}${command} Nama Store | No Telp | Nama Produk | Jumlah | Harga\``;
    return await m.reply(warning);
  }

  if (typeof m.react === 'function') await m.react('⏳');

  try {
    let storeInfo = {
      nama: "KARIS JAYA SHOP",
      telp: "0812345678"
    };

    let items = [];
    const parts = text.split('|').map(p => p.trim());

    // Cek apakah user menginput custom store (minimal 5 bagian: Store, Telp, Produk, Jumlah, Harga)
    if (parts.length >= 5) {
      storeInfo.nama = parts[0];
      storeInfo.telp = parts[1];
      items.push({
        nama: parts[2],
        qty: Number(parts[3]) || 1,
        harga: Number(parts[4]) || 0,
        subtotal: (Number(parts[3]) || 1) * (Number(parts[4]) || 0)
      });
    } else if (parts.length >= 3) {
      // Format simple (hanya Produk, Jumlah, Harga)
      items.push({
        nama: parts[0],
        qty: Number(parts[1]) || 1,
        harga: Number(parts[2]) || 0,
        subtotal: (Number(parts[1]) || 1) * (Number(parts[2]) || 0)
      });
    } else {
      throw new Error("Format kurang lengkap! Gunakan: Nama Produk | Jumlah | Harga");
    }

    const tanggalStr = waktuSekarang();
    const totalQty = items.reduce((a, b) => a + b.qty, 0);
    const subTotal = items.reduce((a, b) => a + b.subtotal, 0);

    let struk = "```\n";
    struk += "================================\n";
    struk += `         ${storeInfo.nama.substring(0, 22).padEnd(22, ' ')}        \n`;
    struk += `      Telp: ${storeInfo.telp.substring(0, 16).padEnd(16, ' ')}          \n`;
    struk += "================================\n";
    struk += `Tanggal : ${tanggalStr}\n`;
    struk += "================================\n";

    items.forEach((item, i) => {
      struk += `${i + 1}. ${item.nama}\n`;
      struk += `   Jumlah : ${item.qty}\n`;
      struk += `   Harga  : ${rupiah(item.harga)}\n`;
      struk += `   Subtotal: ${rupiah(item.subtotal)}\n`;
    });

    struk += "================================\n";
    struk += `TOTAL     : ${rupiah(subTotal)}\n`;
    struk += "================================\n";
    struk += "     Terimakasih & Selamat      \n";
    struk += "          Berbelanja            \n";
    struk += "================================\n";
    struk += "```";

    await clientBot.sendMessage(
      m.chat,
      { text: struk },
      { quoted: m }
    );

    if (typeof m.react === 'function') await m.react('✅');

  } catch (error) {
    console.error('Struk Error:', error);
    if (typeof m.react === 'function') await m.react('❌');
    await m.reply('❌ *GAGAL*\n\n> ' + (error.message || String(error)));
  }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["struk", "printstruk", "buatstruk", "pdfstruk"]
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
__umiHandler.help = ["struk .struk <Nama Store> | <No Telp> | <Produk> | <Jumlah> | <Harga>"]
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
