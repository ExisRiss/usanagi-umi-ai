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
  name: 'istighfar',
  alias: ['sayyidulistighfar', 'istighfar', 'sayyidul'],
  category: 'religi',
  description: 'Sayyidul Istighfar (Doa Istighfar Terbaik) lengkap Arab, Latin, Arti, dan Keutamaan',
  usage: '.istighfar',
  example: '.istighfar',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const caption = `🤲 *SAYYIDUL ISTIGHFAR*
Doa Istighfar Terbaik (Penghulu Istighfar)

📜 *Arab:*
اَللَّهُمَّ أَنْتَ رَبِّيْ لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِيْ وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوْذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ لَكَ بِذَنْبِيْ، فَاغْفِرْ لِيْ، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوْبَ إِلَّا أَنْتَ

🔤 *Latin:*
Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika mastatha'tu, a'udzu bika min syarri ma shana'tu, abu'u laka bini'matika 'alayya, wa abu'u laka bidzanbi, faghfir li, fa innahu la yaghfirudz dzunuba illa anta.

💡 *Artinya:*
Ya Allah, Engkau adalah Tuhanku, tidak ada Tuhan selain Engkau. Engkau telah menciptakanku dan aku adalah hamba-Mu. Aku akan setia pada perjanjian-Mu dan janji-Mu semampuku. Aku berlindung kepada-Mu dari kejahatan yang telah aku perbuat. Aku mengakui nikmat-Mu kepadaku, dan aku mengakui dosaku. Maka ampunilah aku, karena sesungguhnya tidak ada yang mengampuni dosa kecuali Engkau.

✨ *Keutamaan Sayyidul Istighfar:*

1. Doa istighfar terbaik yang diajarkan Rasulullah SAW
2. Dibaca pagi dan petang → dijamin masuk surga
3. Dosa diampuni meskipun sebanyak buih di lautan
4. Mendapat ketenangan hati dan perlindungan Allah
5. Dibaca 3x setelah sholat → diampuni dosanya

📖 *Rasulullah SAW bersabda:*
"Barang siapa membacanya dengan yakin di pagi hari, lalu meninggal pada hari itu, maka ia masuk surga. Dan barang siapa membacanya dengan yakin di malam hari, lalu meninggal pada malam itu, maka ia masuk surga." (HR. Bukhari)

📚 *Sumber:* HR. Bukhari (no. 6306)

💗 *By AlzRiss - Usanagi Umi AI* • ${new Date().getFullYear()}`;

  await m.reply(caption);
  await m.react('🤲');
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["istighfar", "sayyidulistighfar", "sayyidul"]
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
__umiHandler.help = ["istighfar .istighfar"]
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
