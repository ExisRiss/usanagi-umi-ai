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


import fetch from 'node-fetch'
import { load } from 'cheerio'

const pluginConfig = {
  name: "bmkggempa",
  alias: [],
  category: "info",
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

async function handler(m, { sock }) {
    const conn = sock;
  try {
    const res = await fetch('https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.xml')
    const xml = await res.text()

    const $ = load(xml, { xmlMode: true })
    const gempa = $('Infogempa gempa').first()

    const tanggal = gempa.find('Tanggal').text()
    const jam = gempa.find('Jam').text()
    const lintang = gempa.find('Lintang').text()
    const bujur = gempa.find('Bujur').text()
    const magnitude = gempa.find('Magnitude').text()
    const kedalaman = gempa.find('Kedalaman').text()
    const wilayah = gempa.find('Wilayah').text()
    const potensi = gempa.find('Potensi').text()
    const shakemap = gempa.find('Shakemap').text()

    let teks = `🌐 *Info Gempa Terkini - BMKG*\n\n`
    teks += `📅 *Tanggal:* ${tanggal}\n`
    teks += `🕒 *Jam:* ${jam} WIB\n`
    teks += `📍 *Lokasi:* ${lintang} - ${bujur} (${wilayah})\n`
    teks += `📏 *Magnitudo:* ${magnitude}\n`
    teks += `📉 *Kedalaman:* ${kedalaman}\n`
    teks += `🌊 *Potensi:* ${potensi || '—'}`

    const urlShakemap = `https://data.bmkg.go.id/DataMKG/TEWS/${shakemap}`
    await conn.sendFile(m.chat, urlShakemap, 'gempa.jpg', teks, m)
  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, '❌ Gagal mengambil data dari BMKG langsung.', m)
  }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["bmkggempa"]
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
__umiHandler.help = ["bmkggempa"]
__umiHandler.tags = ["info"]
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
