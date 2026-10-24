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
import * as cheerio from 'cheerio';

const pluginConfig = {
  name: 'dongeng',
  alias: ['cerita', 'dongengku'],
  category: 'internet',
  description: 'Cari dan baca dongeng dari 1000dongeng.com',
  usage: '.dongeng <judul>',
  example: '.dongeng Pahlawan',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

const BASE_URL = 'https://www.1000dongeng.com/';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function getList() {
  const { data } = await axios.get(BASE_URL, { headers: { 'User-Agent': UA }, timeout: 20000 });
  const $ = cheerio.load(data);
  const posts = [];

  $('.post-outer').each((_, el) => {
    const titleEl = $(el).find('.post-title a, .entry-title a, h3 a').first();
    const title = titleEl.text().trim();
    const link = titleEl.attr('href');
    if (!title || !link) return;

    const author = $(el).find('.post-author .fn, .post-author a').first().text().trim() || 'Tidak diketahui';
    const date = $(el).find('.post-timestamp .published, .post-date, .date-outer').first().text().trim() || 'Tidak diketahui';
    let image = $(el).find('.post-thumbnail amp-img, .post-thumbnail img').first().attr('src');
    if (!image) image = $(el).find('img').first().attr('src');

    posts.push({ title, link, author, date, image });
  });

  return posts;
}

async function getStory(url) {
  const { data } = await axios.get(url, { headers: { 'User-Agent': UA }, timeout: 20000 });
  const $ = cheerio.load(data);
  const title = $('.post-title.entry-title, h1.post-title, .entry-title').first().text().trim() || 'Judul tidak tersedia';
  const author = $('.post-author .fn, .post-author a').first().text().trim() || 'Penulis tidak diketahui';

  let html = $('.post-body.entry-content, .post-body, .entry-content, .superarticle').first().html() || '';
  let content = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1')
    .replace(/<img\b[^>]*>/gi, '')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<p\b[^>]*>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { title, author, content: content || 'Konten tidak tersedia' };
}

async function handler(m) {
  const query = (m.args || []).join(' ').trim();
  if (!query) return m.reply(`📖 Masukkan judul dongeng.\n\nContoh: ${m.prefix}dongeng Pahlawan`);

  await m.react('⏳');
  try {
    const posts = await getList();
    const q = query.toLowerCase();
    const found = posts.find((item) => item.title?.toLowerCase().includes(q));

    if (!found) {
      await m.react('❌');
      const suggestions = posts
        .filter((item) => item.title?.toLowerCase().includes(q.slice(0, 3)))
        .slice(0, 3)
        .map((item) => `• ${item.title}`)
        .join('\n');
      return m.reply(`❌ Dongeng *${query}* tidak ditemukan.${suggestions ? `\n\n💡 Mungkin maksud kamu:\n${suggestions}` : ''}`);
    }

    const story = await getStory(found.link);
    const excerpt = story.content.slice(0, 2000);
    const caption = `📖 *Judul:* ${story.title}\n✍️ *Penulis:* ${story.author}\n\n📝 *Cerita:*\n${excerpt}${story.content.length > 2000 ? '\n\n... (cerita dipotong)' : ''}`;

    if (found.image) {
      try {
        await m.reply({ image: { url: found.image }, caption });
      } catch {
        await m.reply(caption);
      }
    } else {
      await m.reply(caption);
    }
    await m.react('✅');
  } catch (error) {
    console.error('[DONGENG]', error?.message || error);
    await m.react('❌');
    await m.reply('❌ Gagal mengambil dongeng. Coba lagi nanti.');
  }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["dongeng", "cerita", "dongengku"]
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
__umiHandler.help = ["dongeng .dongeng <judul>"]
__umiHandler.tags = ["internet"]
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
