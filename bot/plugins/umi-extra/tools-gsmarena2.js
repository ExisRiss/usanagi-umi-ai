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


import axios from 'axios';
import * as cheerio from 'cheerio';

async function searchPhone(phoneName) {
  try {
    const searchUrl = `https://www.gsmarena.com/results.php3?sQuickSearch=yes&sName=${encodeURIComponent(phoneName)}`;
    const { data } = await axios.get(searchUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(data);
    const phoneLink = $('.makers ul li a').first().attr('href');
    return phoneLink ? `https://www.gsmarena.com/${phoneLink}` : null;
  } catch (error) {
    return null;
  }
}

async function getExchangeRates() {
  try {
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/EUR');
    return response.data.rates;
  } catch (error) {
    return null;
  }
}

async function scrapeAllSpecs(url) {
  try {
    const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const $ = cheerio.load(data);
    const specs = {};
    
    $('div#specs-list table').each((_, table) => {
      const category = $(table).find('th').text().trim();
      const specDetails = {};
      $(table).find('tr').each((_, row) => {
        const key = $(row).find('td.ttl').text().trim();
        const value = $(row).find('td.nfo').text().trim();
        if (key && value) specDetails[key] = value;
      });
      if (category && Object.keys(specDetails).length) specs[category] = specDetails;
    });

    const phoneName = $('h1').text().trim();
    const priceEur = specs['Misc']?.['Price'] || 'N/A';
    let prices = { EUR: priceEur };
    if (priceEur !== 'N/A' && priceEur.includes('EUR')) {
      const eurValue = parseFloat(priceEur.match(/[\d.]+/)[0]);
      const rates = await getExchangeRates();
      if (rates) {
        prices = {
          EUR: `${eurValue.toFixed(2)} EUR`,
          USD: (eurValue * rates.USD).toFixed(2) + ' USD',
          IDR: (eurValue * rates.IDR).toFixed(0) + ' IDR'
        };
      }
    }

    const imageUrl = $('.specs-photo-main img').attr('src') || 'N/A';

    return { phoneName, specs, prices, imageUrl };
  } catch (error) {
    return null;
  }
}

let handler = async (m, { sock, text }) => {
  if (!text) return m.reply('Mau Cari Hp Ap');
  
  m.reply('Search for HP Specifications...');
  
  const phoneUrl = await searchPhone(text);
  if (!phoneUrl) {
    return m.reply(`HP "${text}" tidak ditemukan!`);
  }

  const result = await scrapeAllSpecs(phoneUrl);
  if (!result) {
    return m.reply(`Gagal mendapatkan data untuk "${text}"`);
  }

  const { phoneName, specs, prices, imageUrl } = result;
  
  let specText = `${phoneName}\n`;
  
  if (prices) {
    specText += `\nHarga :\n`;
    Object.entries(prices).forEach(([currency, price]) => {
      specText += `- ${currency} : ${price}\n`;
    });
  }
  
  Object.entries(specs).forEach(([category, details]) => {
    specText += `\n${category} :\n`;
    Object.entries(details).forEach(([key, value]) => {
      specText += `- ${key} : ${value}\n`;
    });
  });
  
  if (imageUrl && imageUrl !== 'N/A') {
    await sock.sendMessage(m.chat, { image: { url: imageUrl }, caption: specText }, { quoted: m });
  } else {
    m.reply(specText);
  }
};



const pluginConfig = {
  name: 'gsmarena2',
  alias: ['gsmspek2', 'hpspek2'],
  category: 'tools',
  description: 'Pencarian spesifikasi HP GSM Arena (varian Usanagi Umi AI).',
  usage: '.gsmarena2 <nama hp>',
  example: '.gsmarena2 <nama hp>',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["gsmarena2", "gsmspek2", "hpspek2"]
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
__umiHandler.help = ["gsmarena2 .gsmarena2 <nama hp>"]
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
