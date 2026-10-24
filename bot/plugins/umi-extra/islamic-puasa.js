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

import axios from 'axios';

const pluginConfig = {
  name: 'puasa',
  alias: ['puasasunnah', 'puasasenin', 'puasakamis', 'puasadawud'],
  category: 'religi',
  description: 'Panduan Puasa Sunnah Lengkap (Senin-Kamis, Dawud, Arafah, Asyura, dll)',
  usage: '.puasa <nama puasa>',
  example: '.puasa senin',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  isEnabled: true,
};

// Database Puasa Sunnah
const PUASA_DATABASE = {
  'senin': {
    nama: 'Puasa Senin',
    hari: 'Senin',
    arab: 'نَوَيْتُ صَوْمَ يَوْمِ الْاِثْنَيْنِ سُنَّةً لِلَّهِ تَعَالَى',
    latin: 'Nawaitu shauma yaumil itsnaini sunnatan lillahi ta\'ala',
    arti: 'Aku niat puasa sunnah hari Senin karena Allah Ta\'ala',
    keutamaan: 'Hari lahirnya Rasulullah SAW, dan diangkatnya amal perbuatan',
    sumber: 'HR. Muslim'
  },
  'kamis': {
    nama: 'Puasa Kamis',
    hari: 'Kamis',
    arab: 'نَوَيْتُ صَوْمَ يَوْمِ الْخَمِيْسِ سُنَّةً لِلَّهِ تَعَالَى',
    latin: 'Nawaitu shauma yaumil khamisi sunnatan lillahi ta\'ala',
    arti: 'Aku niat puasa sunnah hari Kamis karena Allah Ta\'ala',
    keutamaan: 'Hari diangkatnya amal perbuatan, dan hari dimana doa diijabah',
    sumber: 'HR. Muslim'
  },
  'dawud': {
    nama: 'Puasa Dawud',
    hari: 'Selang-seling (1 hari puasa, 1 hari tidak)',
    arab: 'نَوَيْتُ صَوْمَ دَاوُدَ سُنَّةً لِلَّهِ تَعَالَى',
    latin: 'Nawaitu shauma dawuda sunnatan lillahi ta\'ala',
    arti: 'Aku niat puasa sunnah Dawud karena Allah Ta\'ala',
    keutamaan: 'Puasa yang paling dicintai Allah, seperti puasa Nabi Dawud AS',
    sumber: 'HR. Bukhari'
  },
  'arafah': {
    nama: 'Puasa Arafah',
    hari: '9 Dzulhijjah',
    arab: 'نَوَيْتُ صَوْمَ عَرَفَةَ سُنَّةً لِلَّهِ تَعَالَى',
    latin: 'Nawaitu shauma arafata sunnatan lillahi ta\'ala',
    arti: 'Aku niat puasa sunnah Arafah karena Allah Ta\'ala',
    keutamaan: 'Menghapus dosa setahun yang lalu dan setahun yang akan datang',
    sumber: 'HR. Muslim'
  },
  'asyura': {
    nama: 'Puasa Asyura',
    hari: '10 Muharram',
    arab: 'نَوَيْتُ صَوْمَ عَاشُوْرَاءَ سُنَّةً لِلَّهِ تَعَالَى',
    latin: 'Nawaitu shauma \'asyuuraa-a sunnatan lillahi ta\'ala',
    arti: 'Aku niat puasa sunnah Asyura karena Allah Ta\'ala',
    keutamaan: 'Menghapus dosa setahun yang lalu',
    sumber: 'HR. Muslim'
  },
  "sya'ban": {
    nama: 'Puasa Sya\'ban',
    hari: 'Bulan Sya\'ban (perbanyak puasa)',
    arab: 'نَوَيْتُ صَوْمَ شَعْبَانَ سُنَّةً لِلَّهِ تَعَالَى',
    latin: 'Nawaitu shauma sya\'bana sunnatan lillahi ta\'ala',
    arti: 'Aku niat puasa sunnah Sya\'ban karena Allah Ta\'ala',
    keutamaan: 'Bulan yang sering dilupakan, pintu menuju Ramadhan',
    sumber: 'HR. Bukhari & Muslim'
  },
  'enam': {
    nama: 'Puasa 6 Hari Syawal',
    hari: '6 Hari di Bulan Syawal',
    arab: 'نَوَيْتُ صَوْمَ سِتَّةٍ مِنْ شَوَّالٍ سُنَّةً لِلَّهِ تَعَالَى',
    latin: 'Nawaitu shauma sittatin min syawwalin sunnatan lillahi ta\'ala',
    arti: 'Aku niat puasa sunnah 6 hari Syawal karena Allah Ta\'ala',
    keutamaan: 'Seperti puasa setahun penuh',
    sumber: 'HR. Muslim'
  },
  'senin kamis': {
    nama: 'Puasa Senin-Kamis',
    hari: 'Senin dan Kamis',
    arab: 'نَوَيْتُ صَوْمَ يَوْمِ الْاِثْنَيْنِ وَالْخَمِيْسِ سُنَّةً لِلَّهِ تَعَالَى',
    latin: 'Nawaitu shauma yaumil itsnaini wal khamisi sunnatan lillahi ta\'ala',
    arti: 'Aku niat puasa sunnah hari Senin dan Kamis karena Allah Ta\'ala',
    keutamaan: 'Menggabungkan keutamaan puasa Senin dan Kamis',
    sumber: 'HR. Muslim'
  },
  '3hari': {
    nama: 'Puasa 3 Hari Setiap Bulan (Ayyamul Bidh)',
    hari: '13, 14, 15 Hijriyah',
    arab: 'نَوَيْتُ صَوْمَ أَيَّامِ الْبِيْضِ سُنَّةً لِلَّهِ تَعَالَى',
    latin: 'Nawaitu shauma ayyamil bidhi sunnatan lillahi ta\'ala',
    arti: 'Aku niat puasa sunnah Ayyamul Bidh karena Allah Ta\'ala',
    keutamaan: 'Seperti puasa setahun penuh',
    sumber: 'HR. Bukhari & Muslim'
  }
};

async function handler(m, { sock, args, text, prefix }) {
  const p = prefix || '.';
  const query = text?.replace(new RegExp(`^\\${p}puasa\\s*`, 'i'), '').trim();

  if (!query) {
    let list = '🌙 *PUASA SUNNAH LENGKAP*\n\n';
    list += `Cara pakai: ${p}puasa <nama puasa>\n`;
    list += `Contoh: ${p}puasa senin\n\n`;
    list += '📋 Daftar Puasa Sunnah:\n';
    const keys = Object.keys(PUASA_DATABASE);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      list += `${i+1}. ${key.charAt(0).toUpperCase() + key.slice(1)}\n`;
    }
    list += `\n💗 By AlzRiss - Usanagi Umi AI • ${new Date().getFullYear()}`;
    return m.reply(list);
  }

  const puasaKey = query.toLowerCase();
  let puasa = PUASA_DATABASE[puasaKey];

  if (!puasa) {
    const match = Object.keys(PUASA_DATABASE).find(key => key.includes(puasaKey));
    if (match) {
      puasa = PUASA_DATABASE[match];
      const foundKey = match;
      const displayKey = foundKey.charAt(0).toUpperCase() + foundKey.slice(1);
      let caption = `🌙 *PUASA ${displayKey.toUpperCase()}*\n\n`;
      caption += `📌 Hari: ${puasa.hari}\n\n`;
      caption += `📜 Niat:\n${puasa.arab}\n\n`;
      caption += `🔤 Latin:\n${puasa.latin}\n\n`;
      caption += `💡 Artinya:\n${puasa.arti}\n\n`;
      caption += `✨ Keutamaan:\n${puasa.keutamaan}\n\n`;
      caption += `📚 Sumber: ${puasa.sumber}\n`;
      caption += `\n💗 By AlzRiss - Usanagi Umi AI • ${new Date().getFullYear()}`;
      return m.reply(caption);
    }
    return m.reply(`❌ Puasa "${query}" tidak ditemukan.\n\n📋 Ketik ${p}puasa untuk melihat daftar.`);
  }

  const displayKey = puasaKey.charAt(0).toUpperCase() + puasaKey.slice(1);
  let caption = `🌙 *PUASA ${displayKey.toUpperCase()}*\n\n`;
  caption += `📌 Hari: ${puasa.hari}\n\n`;
  caption += `📜 Niat:\n${puasa.arab}\n\n`;
  caption += `🔤 Latin:\n${puasa.latin}\n\n`;
  caption += `💡 Artinya:\n${puasa.arti}\n\n`;
  caption += `✨ Keutamaan:\n${puasa.keutamaan}\n\n`;
  caption += `📚 Sumber: ${puasa.sumber}\n`;
  caption += `\n💗 By AlzRiss - Usanagi Umi AI • ${new Date().getFullYear()}`;

  await m.reply(caption);
  await m.react('🌙');
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["puasa", "puasasunnah", "puasasenin", "puasakamis", "puasadawud"]
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
__umiHandler.help = ["puasa .puasa <nama puasa>"]
__umiHandler.tags = ["islamic"]
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
