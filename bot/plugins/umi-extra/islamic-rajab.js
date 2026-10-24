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
  name: 'rajab',
  alias: ['bulanrajab', 'rajab'],
  category: 'religi',
  description: 'Informasi lengkap tentang Bulan Rajab (doa, amalan, keutamaan, dan peristiwa penting)',
  usage: '.rajab',
  example: '.rajab',
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

  // Perkiraan 1 Rajab 1448 H (berdasarkan kalender Hijriah)
  // 1 Rajab 1448 H jatuh sekitar 10 Desember 2026
  const targetDate = new Date('2026-12-10T00:00:00+07:00');
  const diffMs = targetDate - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let countdownText = '';
  let statusEmoji = '';
  let statusMessage = '';

  if (diffDays <= 0) {
    statusEmoji = '🌙';
    statusMessage = '✨ Bulan Rajab telah tiba! ✨';
    countdownText = '🌙 Bulan Allah yang penuh berkah!';
  } else {
    statusEmoji = '⏳';
    statusMessage = 'Menuju Bulan Rajab';
    countdownText = `${diffDays} hari lagi`;
  }

  const caption = `🕌 *BULAN RAJAB*
${statusEmoji} ${statusMessage}

📅 Tanggal: 1 Rajab 1448 H
🌙 Waktu: Awal bulan Rajab
📆 Perkiraan: ${targetDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
⏳ Countdown: ${countdownText}

✨ Keutamaan Bulan Rajab:
1. Bulan Allah (Syahrullah) yang dimuliakan
2. Salah satu dari 4 bulan haram (suci)
3. Pintu menuju Ramadhan (bulan persiapan)
4. Malam Isra Miraj terjadi di bulan ini
5. Doa-doa lebih mudah dikabulkan

📋 Amalan yang Dianjurkan:
• Puasa Sunnah (1 Rajab, 27 Rajab, atau senin-kamis)
• Perbanyak Istighfar (Sayyidul Istighfar)
• Membaca Doa Rajab
• Shalat Sunnah Rajab (12 rakaat)
• Bersedekah dan berbuat baik

🤲 Doa Rajab:
اَللَّهُمَّ بَارِكْ لَنَا فِيْ رَجَبٍ وَشَعْبَانَ وَبَلِّغْنَا رَمَضَانَ
Allahumma barik lana fi Rajaba wa Sya'bana wa ballighna Ramadhan.
Ya Allah, berkahilah kami di bulan Rajab dan Sya'ban, dan sampaikan kami ke bulan Ramadhan.

🌙 Peristiwa Penting di Bulan Rajab:
• 1 Rajab: Awal bulan Rajab
• 13 Rajab: Hari ulang tahun Ali bin Abi Thalib
• 27 Rajab: Isra Miraj Nabi Muhammad SAW

📚 Sumber: HR. Bukhari, Muslim, dan kitab-kitab fiqih

💗 By AlzRiss - Usanagi Umi AI • ${year}`;

  await m.reply(caption);
  await m.react('🕌');
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["rajab", "bulanrajab"]
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
__umiHandler.help = ["rajab .rajab"]
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
