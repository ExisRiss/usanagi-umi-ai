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


import axios from 'axios'
import * as cheerio from 'cheerio'

async function UhdpaperSearch(query) {
  try {
    const response = await axios.get(`https://www.uhdpaper.com/search?q=${encodeURIComponent(query)}&by-date=true&i=0`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    })
    const html = response.data
    const $ = cheerio.load(html)
    const results = []

    $('article.post-outer-container').each((_, element) => {
      const title = $(element).find('.snippet-title h2').text().trim()
      const imageUrl = $(element).find('.snippet-title img').attr('src')
      const resolution = $(element).find('.wp_box b').text().trim()
      const link = $(element).find('a').attr('href')

      if (title && imageUrl && resolution && link) {
        results.push({ title, imageUrl, resolution, link })
      }
    })

    return results
  } catch (error) {
    console.error('Error scraping UHDPaper:', error.message)
    return []
  }
}

const pluginConfig = {
  name: "uhdpaper",
  alias: [],
  category: "image",
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

async function handler(m, { sock, text, prefix, command }) {
    const conn = sock;
    const usedPrefix = prefix || m.prefix || ".";
  if (!text) throw `Contoh:\n${usedPrefix + command} naruto`

  let results = await UhdpaperSearch(text)
  if (results.length === 0) throw 'Wallpaper tidak ditemukan!'

  let list = results.map((v, i) => `*${i + 1}. ${v.title}*\n📏 *Resolusi:* ${v.resolution}\n🔗 ${v.link}`).join`\n\n`

  await conn.sendMessage(m.chat, { text: `*Hasil Pencarian UHDPaper: ${text}*\n\n${list}` }, { quoted: m })
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["uhdpaper"]
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
__umiHandler.help = ["uhdpaper"]
__umiHandler.tags = ["image"]
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
