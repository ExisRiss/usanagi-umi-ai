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


/*
Search Code 
Desk : Search code dari https://codeshare.cloudku.click
Type : Plugin ESM 
Source Scrape : https://whatsapp.com/channel/0029VbDBOXH11ulIKHVbmO0m
*/
import axios from 'axios'
import * as cheerio from 'cheerio'

async function scrapeCodeSearch(query) {
  const url = `https://codeshare.cloudku.click/?q=${encodeURIComponent(query)}`
  const res = await axios.get(url)
  const $ = cheerio.load(res.data)
  const results = []

  const cards = $('.snippet-card').toArray()

  for (const el of cards) {
    const card = $(el)
    const title = card.find('.card-title a').text().trim()
    const path = card.find('.card-title a').attr('href')
    const link = 'https://codeshare.cloudku.click' + path
    const author = card.find('.card-user .user-info').text().trim()
    const views = parseInt(card.find('.meta-item').first().text().replace(/\D/g, '')) || 0
    const languageIcon = card.find('.meta-item i').attr('class') || ''
    const language = languageIcon.split('-').pop().replace('plain', '') || 'unknown'

    results.push({ title, author, views, language, link })
  }

  return {
    status: 200,
    total: results.length,
    data: results
  }
}

const pluginConfig = {
  name: "searchcode",
  alias: [],
  category: "search",
  description: "Imported from Usanagi Umi AI V4.6",
  usage: "",
  example: "",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { text, prefix, command }) {
    const usedPrefix = prefix || m.prefix || ".";
  if (!text) throw `Contoh:\n${usedPrefix + command} downloader tiktok `

  let res = await scrapeCodeSearch(text)
  if (!res.data.length) throw 'Tidak ada hasil ditemukan.'

  let teks = res.data.slice(0, 5).map((v, i) => {
    return `*${i + 1}. ${v.title}*\n👤 ${v.author}\n💻 ${v.language}\n👁 ${v.views} views\n🔗 ${v.link}`
  }).join`\n\n`

  await m.reply(`🔍 Hasil pencarian untuk: *${text}*\n\n${teks}`)
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["searchcode"]
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
__umiHandler.help = ["searchcode"]
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
