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

import axios from 'axios';

const pluginConfig = {
  name: 'tahlil',
  alias: ['tahlilan', 'doatahlil', 'tahlil'],
  category: 'religi',
  description: 'Panduan Tahlil Lengkap (Doa, Bacaan, dan Tata Cara)',
  usage: '.tahlil',
  example: '.tahlil',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const caption = `🤲 *PANDUAN TAHLIL LENGKAP*
Bacaan Tahlil untuk mendoakan orang yang telah meninggal

📋 *SUSUNAN TAHLIL:*

1️⃣ *Bacaan Surat Al-Fatihah*
بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
الرَّحْمَٰنِ الرَّحِيمِ
مَالِكِ يَوْمِ الدِّينِ
إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ
اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ
صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ
غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ

📌 Dilanjutkan dengan:
لِإِلٰـهِ حَاضِرِيْ هٰذَا الْمَجْلِسِ وَاِلٰى جَمِيْعِ الْمُسْلِمِيْنَ وَالْمُسْلِمَاتِ وَالْمُؤْمِنِيْنَ وَالْمُؤْمِنَاتِ الْأَحْيَاءِ مِنْهُمْ وَالْأَمْوَاتِ
(Lafalkan dengan niat menghadiahkan kepada yang hadir dan semua muslim)

2️⃣ *Surat Al-Ikhlas 3x*
قُلْ هُوَ اللَّهُ أَحَدٌ
اللَّهُ الصَّمَدُ
لَمْ يَلِدْ وَلَمْ يُولَدْ
وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ

3️⃣ *Surat Al-Falaq 1x*
قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ
مِنْ شَرِّ مَا خَلَقَ
وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ
وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ
وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ

4️⃣ *Surat An-Nas 1x*
قُلْ أَعُوذُ بِرَبِّ النَّاسِ
مَلِكِ النَّاسِ
إِلَٰهِ النَّاسِ
مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ
الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ
مِنَ الْجِنَّةِ وَالنَّاسِ

5️⃣ *Bacaan Tahlil & Istighfar*
لَا إِلَٰهَ إِلَّا اللَّهُ (3x)
أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ (3x)

6️⃣ *Bacaan Tahlil Inti*
لَا إِلَٰهَ إِلَّا اللَّهُ (100x atau 33x)

7️⃣ *Doa Tahlil*
اَللَّهُمَّ اغْفِرْ لِلْمُسْلِمِيْنَ وَالْمُسْلِمَاتِ
وَالْمُؤْمِنِيْنَ وَالْمُؤْمِنَاتِ
الْأَحْيَاءِ مِنْهُمْ وَالْأَمْوَاتِ
إِنَّكَ سَمِيعٌ قَرِيبٌ مُجِيبُ الدَّعَوَاتِ

8️⃣ *Penutup*
سُبْحَانَ رَبِّكَ رَبِّ الْعِزَّةِ عَمَّا يَصِفُونَ
وَسَلَامٌ عَلَى الْمُرْسَلِينَ
وَالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ

📖 *Keutamaan Tahlil:*
• Mendoakan orang yang telah meninggal
• Mendapat pahala dari Allah
• Menghidupkan sunnah
• Mendekatkan diri kepada Allah

📚 *Sumber:* Kitab-kitab Fiqih & Ulama Nusantara

💗 *By AlzRiss - Usanagi Umi AI* • ${new Date().getFullYear()}`;

  await m.reply(caption);
  await m.react('🤲');
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["tahlil", "tahlilan", "doatahlil"]
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
__umiHandler.help = ["tahlil .tahlil"]
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
