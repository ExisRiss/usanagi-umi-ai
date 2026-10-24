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

/*
Base : https://orshot.com
Author : ZennzXD
*/

import axios from 'axios';

const pluginConfig = {
    name: 'tweetss',
    alias: ['orshot', 'tweetimage', 'tweetimg'],
    category: 'tools',
    description: 'Membuat gambar screenshot aesthetic dari link postingan X (Twitter)',
    usage: '.tweetss <url tweet>',
    example: '.tweetss https://x.com/i/status/2026539641311199692',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
};

async function tweetss(tweetUrl) {
  const match = tweetUrl.match(/status\/(\d+)/);
  if (!match) throw new Error('masukin link yg benar');
  const tweetId = match[1];

  const payload = {
    templateSlug: 'tweet-image',
    modifications: {
      tweetUrl,
      tweetId
    },
    renderType: 'images',
    responseFormat: 'png',
    responseType: 'base64',
    userAPIKey: false
  };

  const { data } = await axios.post(
    'https://orshot.com/api/templates/make-playground-request',
    JSON.stringify(payload),
    {
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8',
        'Origin': 'https://orshot.com',
        'Referer': 'https://orshot.com/templates/tweet-image/generate',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) Chrome/107.0.0.0 Safari/537.36',
        'Accept': '*/*'
      }
    }
  );

  if (!data?.data?.content) {
    throw new Error('ga ada respon dari server orshot');
  }

  const base64Data = data.data.content.replace(/^data:image\/png;base64,/, '');
  return Buffer.from(base64Data, 'base64');
}

async function handler(m, { usedPrefix, prefix, command, text, sock, conn }) {
  const clientBot = sock || conn;

  if (!text || !text.trim().startsWith('http')) {
    if (typeof m.react === 'function') await m.react('❌');
    let warning = `❌ *Format Perintah Salah!*\n\n`;
    warning += `Silakan masukkan link postingan X (Twitter) yang ingin dijadikan gambar.\n\n`;
    warning += `📌 *Contoh Penggunaan:*\n`;
    warning += `> \`${prefix}${command} https://x.com/i/status/2026539641311199692\``;
    return await m.reply(warning);
  }

  if (typeof m.react === 'function') await m.react('⏳');

  try {
    const imgBuffer = await tweetss(text.trim());

    let caption = `🐦 *TWEET SHOT GENERATOR*\n────────────────────────────\n`;
    caption += `🔗 *Source:* ${text.trim()}\n`;
    caption += `👤 *Script by:* ZennzXD\n`;
    caption += `────────────────────────────`;

    await clientBot.sendMessage(
      m.chat,
      {
        image: imgBuffer,
        caption: caption
      },
      { quoted: m }
    );

    if (typeof m.react === 'function') await m.react('✅');

  } catch (error) {
    console.error('TweetSS Error:', error);
    if (typeof m.react === 'function') await m.react('❌');
    await m.reply('❌ *GAGAL MEMBUAT GAMBAR TWEET*\n\n> ' + (error.message || String(error)));
  }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["tweetss", "orshot", "tweetimage", "tweetimg"]
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
__umiHandler.help = ["tweetss .tweetss <url tweet>"]
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
