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


import fetch from 'node-fetch';

const pluginConfig = {
  name: "lupakan",
  alias: [],
  category: "fun",
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

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const quotes = [
    'Masa lalu adalah pelajaran, bukan penjara. Biarkan dirimu terbang lebih tinggi.',
    'Setiap hari adalah kesempatan baru untuk menjadi versi terbaik dari dirimu.',
    'Jangan biarkan kemarin mengambil terlalu banyak dari hari ini.',
    'Lupakan apa yang tidak bisa diubah, fokus pada apa yang bisa kamu lakukan sekarang.',
    'Kehidupan terlalu singkat untuk menyimpan dendam dan penyesalan.',
    'Masa depan menunggu mereka yang berani meninggalkan masa lalu.',
    'Kesalahan adalah guru terbaik, bukan musuh. Belajar dan lanjutkan.',
    'Kamu tidak bisa mengubah masa lalu, tapi kamu bisa membentuk masa depan.',
    'Setiap detik adalah kesempatan untuk memulai ulang.',
    'Lepaskan beban masa lalu dan rasakan kebebasan sejati.',
    'Hidup dimulai ketika kamu berhenti memikirkan apa yang seharusnya terjadi.',
    'Masa lalu tidak mendefinisikan siapa kamu, pilihan hari ini yang melakukannya.',
    'Jangan terjebak dalam cerita lama, tulis cerita baru yang lebih indah.',
    'Keberanian bukan tidak takut, tapi melangkah maju meski takut.',
    'Setiap orang berhak mendapatkan kesempatan kedua, termasuk dirimu sendiri.'
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  const message = `— lupakan masa lalu —

❀ motivasi :
${randomQuote}

Ingat, kamu lebih kuat dari yang kamu pikirkan. Masa depan penuh dengan kemungkinan tak terbatas! 💪✨`;

  await conn.sendMessage(m.chat, { text: message }, { quoted: m });
};

handler.register = true;

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["lupakan"]
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
__umiHandler.help = ["lupakan"]
__umiHandler.tags = ["fun"]
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
