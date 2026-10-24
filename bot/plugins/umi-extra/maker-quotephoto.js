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

import fetch from 'node-fetch';

const pluginConfig = {
  name: "quotephoto",
  alias: ["qphoto", "quotepic", "katatutur", "picturequote"],
  category: "maker",
  description: "Buat gambar kata-kata quote estetik di atas kertas",
  usage: ".quotephoto teks|author",
  example: ".quotephoto Jangan ragu untuk memulai hal baru|Geto",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock, text }) {
  if (!text) {
    return m.reply(`⚠️ *Format Salah*\n\nPenggunaan:\n\`.quotephoto teks|author\`\n\nContoh:\n\`.quotephoto Jangan ragu untuk memulai hal baru|Geto\``);
  }

  // Parse argumen teks dan author (pemisah menggunakan "|")
  let [teksInput, authorInput] = text.split('|').map(v => v ? v.trim() : '');

  if (!teksInput) {
    return m.reply(`⚠️ Masukkan teks quote yang ingin dibuat!\n\nContoh:\n\`.quotephoto Tetap semangat meskipun lelah|Geto\``);
  }

  // Jika author tidak diisi, otomatis menggunakan pushname / nama pengirim
  const authorName = authorInput || m.pushName || 'Anonymous';
  const apiKey = "4ZtwE";
  const apiUrl = `https://api.theresav.biz.id/canvas/reminder?teks=${encodeURIComponent(teksInput)}&author=${encodeURIComponent(authorName)}&apikey=YOUR_API_KEY`

  await m.react('⏳');

  try {
    const response = await fetch(apiUrl);
    const contentType = response.headers.get('content-type') || '';

    // Jika API langsung mengembalikan gambar (Buffer)
    if (contentType.includes('image')) {
      const imageBuffer = await response.buffer();
      await sock.sendMessage(m.chat, {
        image: imageBuffer,
        caption: `✨ *Quote Photo Generated!*`
      }, { quoted: m });
      await m.react('✅');
      return;
    }

    // Jika API mengembalikan JSON
    const resJson = await response.json();
    if (resJson.status && resJson.result) {
      const imageUrl = typeof resJson.result === 'string' ? resJson.result : resJson.result.url;
      await sock.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: `✨ *Quote Photo Generated!*`
      }, { quoted: m });
      await m.react('✅');
    } else {
      await m.react('❌');
      m.reply(`❌ *Gagal generate:* ${resJson.message || 'Terjadi kesalahan pada server API.'}`);
    }

  } catch (err) {
    console.error('[QUOTE PHOTO ERROR]', err);
    await m.react('❌');
    await m.reply(`❌ *Terjadi Kesalahan:* ${err.message}`);
  }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["quotephoto", "qphoto", "quotepic", "katatutur", "picturequote"]
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
__umiHandler.help = ["quotephoto .quotephoto teks|author"]
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
