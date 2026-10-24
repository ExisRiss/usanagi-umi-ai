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
  name: 'wattpadsearch',
  alias: ['wattpad'],
  category: 'search',
  description: 'Mencari cerita Wattpad',
  usage: '.wattpadsearch <query>',
  example: '.wattpadsearch cinta',
  cooldown: 8,
  energi: 1,
  isEnabled: true,
};

function compactNumber(value) {
  const n = Number(value || 0);
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
}

async function handler(m, { text }) {
  const query = (text || '').trim();
  if (!query) return m.reply(`📖 *ᴡᴀᴛᴛᴘᴀᴅ sᴇᴀʀᴄʜ*\n\nContoh: ${m.prefix}wattpadsearch cinta`);

  if (m.react) await m.react('📖');
  try {
    const { data } = await axios.get(
      `https://api.lolhuman.xyz/api/wattpadsearch?apikey=YOUR_API_KEY&query=${encodeURIComponent(query)}`,
      { timeout: 30000 }
    );

    if (data?.status !== 200 || !Array.isArray(data?.result) || !data.result.length) {
      throw new Error('Cerita tidak ditemukan');
    }

    const rows = data.result.slice(0, 5).map((s, i) =>
      `${i + 1}. *${s.title || '-'}*\n` +
      `   ✍️ ${s.author || '-'} | 👁️ ${compactNumber(s.readCount)} | ⭐ ${compactNumber(s.voteCount)}\n` +
      `   📝 ${(s.description || '-').slice(0, 100)}${(s.description || '').length > 100 ? '...' : ''}\n` +
      `${s.url ? `   🔗 ${s.url}\n` : ''}`
    ).join('\n');

    if (m.react) await m.react('✅');
    return m.reply(`📖 *ᴡᴀᴛᴛᴘᴀᴅ sᴇᴀʀᴄʜ*\n\n> Query: *${query}*\n━━━━━━━━━━━━━━━\n\n${rows}`.trim());
  } catch (e) {
    if (m.react) await m.react('❌');
    return m.reply(`❌ *Wattpad Search gagal:* ${String(e.message).slice(0, 160)}`);
  }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["wattpadsearch", "wattpad"]
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
__umiHandler.help = ["wattpadsearch .wattpadsearch <query>"]
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
