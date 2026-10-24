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
  name: 'nisfusyaban',
  alias: ['nisfu', 'malamnisfu', 'syaban'],
  category: 'religi',
  description: 'Informasi lengkap tentang Malam Nisfu Syaban (doa, amalan, keutamaan)',
  usage: '.nisfusyaban',
  example: '.nisfusyaban',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const now = new Date();
  const year = now.getFullYear();

  // Perkiraan tanggal Nisfu Syaban (2027)
  const targetDate = new Date('2027-02-13T00:00:00+07:00');
  const diffMs = targetDate - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let countdownText = '';
  let statusEmoji = '';
  let statusMessage = '';

  if (diffDays <= 0) {
    statusEmoji = '🌙';
    statusMessage = '✨ Malam Nisfu Syaban telah tiba! ✨';
    countdownText = '🌙 Malam penuh ampunan dan rahmat Allah!';
  } else {
    statusEmoji = '⏳';
    statusMessage = 'Menuju Malam Nisfu Syaban';
    countdownText = `${diffDays} hari lagi`;
  }

  const caption = `🕌 *MALAM NISFU SYABAN*
${statusEmoji} ${statusMessage}

📅 Tanggal: 15 Syaban 1448 H
🌙 Waktu: Malam hari (ba'da Maghrib)
📆 Perkiraan: ${targetDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
⏳ Countdown: ${countdownText}

✨ Keutamaan Malam Nisfu Syaban:
1. Malam penuh ampunan dari Allah SWT
2. Allah mencatat takdir setahun ke depan
3. Pintu rahmat dan maghfirah dibuka lebar
4. Doa-doa dikabulkan oleh Allah
5. Dibebaskannya hamba dari api neraka

🤲 Amalan yang Dianjurkan:
• Membaca Surah Yasin 3x (niat panjang umur, rezeki, iman)
• Shalat Sunnah (minimal 2 rakaat)
• Perbanyak Istighfar dan Doa
• Membaca Doa Nisfu Syaban
• Bersedekah dan berbuat baik

📖 Doa Nisfu Syaban:
اَللَّهُمَّ يَا ذَا الْمَنِّ وَلَا يُمَنُّ عَلَيْهِ، يَا ذَا الْجَلَالِ وَالْإِكْرَامِ، يَا ذَا الطَّوْلِ وَالْإِنْعَامِ، لَا إِلَٰهَ إِلَّا أَنْتَ، ظَهْرَ اللَّاجِئِينَ، وَجَارَ الْمُسْتَجِيرِينَ، وَأَمَانَ الْخَائِفِينَ...

📚 Sumber: HR. Ibnu Majah, Al-Baihaqi
💗 By AlzRiss - Usanagi Umi AI • ${year}`;

  await m.reply(caption);
  await m.react('🕌');
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["nisfusyaban", "nisfu", "malamnisfu", "syaban"]
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
__umiHandler.help = ["nisfusyaban .nisfusyaban"]
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
