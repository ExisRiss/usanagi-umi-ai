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
  name: "applemaps",
  alias: ["maps", "applemap", "carilokasi"],
  category: "search",
  description: "Cari lokasi dan detail tempat menggunakan Apple Maps",
  usage: ".applemaps <nama_tempat/lokasi>",
  example: ".applemaps Indonesia",
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
    return m.reply(`⚠️ *Format Salah*\n\nPenggunaan:\n\`.applemaps <nama_tempat/lokasi>\`\n\nContoh:\n\`.applemaps Monas Jakarta\``);
  }

  const query = text.trim();
  const apiKey = "4ZtwE"; // API Key dari docs
  const apiUrl = `https://api.theresav.biz.id/search/applemaps?apikey=YOUR_API_KEY&q=${encodeURIComponent(query)}`;

  await m.react('⏳');

  try {
    const response = await fetch(apiUrl);
    const res = await response.json();

    if (!res.status || !res.result || !res.result.places || res.result.places.length === 0) {
      await m.react('❌');
      return m.reply(`❌ *Gagal:* Lokasi \`${query}\` tidak ditemukan.`);
    }

    // Mengambil data tempat pertama
    const place = res.result.places[0];

    // Format Kategori
    const categories = Array.isArray(place.categories) && place.categories.length > 0 
      ? place.categories.join(', ') 
      : '-';

    // Format Link Apple Maps & Google Maps berdasarkan Koordinat
    const appleMapsUrl = `https://maps.apple.com/?q=${encodeURIComponent(place.name)}&ll=${place.latitude},${place.longitude}`;
    const googleMapsUrl = `https://www.google.com/maps?q=${place.latitude},${place.longitude}`;

    const captionText = 
      `🗺️ *APPLE MAPS SEARCH RESULT* 🗺️\n\n` +
      `📍 *Nama Tempat:* ${place.name || query}\n` +
      `🏢 *Kategori:* ${categories}\n` +
      `🏠 *Alamat:* ${place.address || '-'}\n` +
      `🏙️ *Kota:* ${place.city || '-'}\n` +
      `🇮🇩 *Negara:* ${place.country || '-'}\n\n` +
      `🌐 *Koordinat:* \`${place.latitude}, ${place.longitude}\`\n\n` +
      `🔗 *Apple Maps:* ${appleMapsUrl}\n` +
      `🔗 *Google Maps:* ${googleMapsUrl}`;

    // Cek apakah ada foto lokasi
    const firstPhoto = Array.isArray(place.photos) && place.photos.length > 0 ? place.photos[0].url : null;

    if (firstPhoto) {
      await sock.sendMessage(m.chat, {
        image: { url: firstPhoto },
        caption: captionText
      }, { quoted: m });
    } else {
      await sock.sendMessage(m.chat, { text: captionText }, { quoted: m });
    }

    await m.react('✅');

  } catch (err) {
    console.error('[APPLE MAPS ERROR]', err);
    await m.react('❌');
    await m.reply(`❌ *Terjadi Kesalahan:* ${err.message}`);
  }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["applemaps", "maps", "applemap", "carilokasi"]
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
__umiHandler.help = ["applemaps .applemaps <nama_tempat/lokasi>"]
__umiHandler.tags = ["search"]
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
