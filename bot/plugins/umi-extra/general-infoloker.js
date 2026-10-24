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


import * as cheerio from 'cheerio'
import fetch from 'node-fetch'

const pluginConfig = {
  name: "infoloker",
  alias: [],
  category: "general",
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

async function handler(m, { sock, args, prefix, text, command }) {
    const conn = sock;
    const usedPrefix = prefix || m.prefix || ".";
    if (!text) return m.reply("Input query\nExample: .infoloker programmer")
    await m.reply('⏳ Sedang mengambil data, mohon tunggu...')
    try {
        let res = await infoloker(text);
        res = res.slice(0, 11);
        let teks = res.map((item, index) => {
            return `
🔍 *[ RESULT ${index + 1} ]*
📰 *Title:* ${item.job || 'Tidak diketahui'}
🏢 *Perusahaan:* ${item.perusahaan || 'Tidak diketahui'}
📍 *Daerah:* ${item.daerah || 'Tidak diketahui'}
🔗 *Link Detail:* ${item.link_Detail || 'Tidak diketahui'}
⬆️ *Upload:* ${item.upload || 'Tidak diketahui'}
`;
        }).filter(v => v).join("\n\n________________________\n\n");
        await m.reply(teks)
    } catch (e) {
        await m.reply('❌ Data tidak dapat diambil. Coba lagi nanti.')
    }
};
handler.register = true

/* New Line */
async function infoloker(query) {
    const url = `https://www.jobstreet.co.id/id/job-search/${query}-jobs/`;
    const response = await fetch(url);
    const html = await response.text();

    const $ = cheerio.load(html);
    const format = [];

    $('article').each((a, article) => {
        const job = $(article).find('h1 a div').text();
        const perusahaan = $(article).find('span').eq(0).text();
        const daerah = $(article).find('span span').text();
        const link_Detail = 'https://www.jobstreet.co.id' + $(article).find('h1 a').attr('href');
        const upload = $(article).find('div > time > span').text();

        format.push({ job, perusahaan, daerah, upload, link_Detail });
    });

    return format;
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["infoloker"]
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
__umiHandler.help = ["infoloker"]
__umiHandler.tags = ["general"]
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
