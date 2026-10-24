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


/**
 * CR Ponta Sensei
 * CH https://whatsapp.com/channel/0029VbDBOXH11ulIKHVbmO0m
 * WEB https://codeteam.my.id
**/

import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

const ALL_CATEGORIES = [
  'afr','alb','ara','arm','aze','bas','bel','ben','bos','bre','bul','cat','chi','cro','cze','dan','dut','eng','est','fin','fre',
  'fri','gal','geo','ger','gre','hau','haw','heb','hun','ice','igb','ind','ins','iri','ita','jap','kaz','khm','kor','lat','lim',
  'lth','mac','mly','mao','ame','nep','nor','per','pol','por','rmn','rus','sco','ser','slk','sln','spa','swa','swe','tha','tur',
  'ukr','urd','vie','wel','yor','zul','myth','celm','egym','grem','neam','scam','romm','anci','enga','cela','gmca','grea','scaa',
  'roma','litk','bibl','indm','hist','lite','popu','theo','whim','fairy','goth','hb','hippy','kk','rap','trans','witch','wrest',
  'fntsy','fntsg','fntsm','fntso','fntsr','fntss','fntst','fntsx'
]

async function generateRandomName({
  gender = 'both',
  number = 2,
  surnameType = 'none', // none | random | custom
  customSurname = '',
  usage = []
} = {}) {
  const BASE_URL = 'https://www.behindthename.com/random/random.php'
  const params = new URLSearchParams({
    gender,
    number: number.toString(),
    sets: '1',
    showextra: 'yes',
    norare: 'yes',
    nodiminutives: 'yes',
    all: usage.length === 0 ? 'yes' : ''
  })
  if (surnameType === 'random') {
    params.set('randomsurname', 'yes')
  } else if (surnameType === 'custom' && customSurname) {
    params.set('surname', customSurname)
  }
  if (usage.length > 0) {
    usage.forEach(cat => {
      if (ALL_CATEGORIES.includes(cat)) {
        params.append(`usage_${cat}`, '1')
      }
    })
  }
  const url = `${BASE_URL}?${params.toString()}`
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  const html = await res.text()
  const $ = cheerio.load(html)
  const names = $('.random-results a').map((i, el) => $(el).text().trim()).get()
  return names
}

const pluginConfig = {
  name: "randomname",
  alias: [],
  category: "random",
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

async function handler(m, { text }) {
  if (!text) return m.reply('Format: randomname gender|kata|surname(optional)|kategori(optional)\nContoh: randomname cowok|3|random|eng,spa')

  let [genderRaw, kataRaw, surnameRaw, kategoriRaw] = text.split('|').map(v => v?.trim() || '')
  let gender = 'both'
  if (genderRaw) {
    if (['cowok', 'm', 'male'].includes(genderRaw.toLowerCase())) gender = 'm'
    else if (['cewek', 'f', 'female'].includes(genderRaw.toLowerCase())) gender = 'f'
    else gender = 'both'
  }
  let number = parseInt(kataRaw)
  if (isNaN(number) || number < 1 || number > 4) number = 2

  let surnameType = 'none'
  let customSurname = ''
  if (surnameRaw) {
    if (surnameRaw.toLowerCase() === 'random') surnameType = 'random'
    else if (surnameRaw !== '') {
      surnameType = 'custom'
      customSurname = surnameRaw
    }
  }

  let usage = []
  if (kategoriRaw) {
    usage = kategoriRaw.toLowerCase().split(',').map(k => k.trim()).filter(k => ALL_CATEGORIES.includes(k))
  }

  m.reply('Sedang mencari nama random, tunggu sebentar ya Senpai...')

  try {
    let names = await generateRandomName({
      gender,
      number,
      surnameType,
      customSurname,
      usage
    })
    if (!names.length) return m.reply('Gagal mendapatkan nama random, coba lagi ya Senpai.')

    let namaJadi = names.join(' ')

    let teks = `*Random Name Generator*\n`
    teks += `• Gender: ${gender === 'm' ? 'Cowok' : gender === 'f' ? 'Cewek' : 'Bebas'}\n`
    teks += `• Jumlah Kata: ${number}\n`
    teks += `• Surname: ${surnameType === 'random' ? 'Random' : (customSurname ? customSurname : 'Tidak ada')}\n`
    teks += `• Kategori: ${usage.length ? usage.join(', ') : 'Semua'}\n\n`
    teks += `*${namaJadi}*`

    m.reply(teks)
  } catch {
    m.reply('Terjadi kesalahan saat mengambil nama random, coba lagi nanti ya Senpai.')
  }
}

handler.register = true

/**
 * CR Ponta Sensei
 * CH https://whatsapp.com/channel/0029VbDBOXH11ulIKHVbmO0m
 * WEB https://codeteam.my.id
**/

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["randomname"]
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
__umiHandler.help = ["randomname"]
__umiHandler.tags = ["random"]
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
