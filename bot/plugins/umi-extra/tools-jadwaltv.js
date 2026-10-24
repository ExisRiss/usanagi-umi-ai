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


import fs from 'fs'
import axios from 'axios'
import * as cheerio from 'cheerio'

const pluginConfig = {
  name: "jadwaltv",
  alias: [],
  category: "tools",
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
	if (!text) throw 'Input Query'
	let res = await jadwalTV(text)
	let txt = res.result.map((v) => `[${v.jam.replace('WIB', ' WIB')}] ${v.acara}`).join`\n`
	m.reply(`Jadwal TV ${res.channel}\n\n${txt}`)
}

async function jadwalTV(name) {
	let list = JSON.parse(fs.readFileSync('../../src/jadwaltv.json', 'utf-8'))
	let data = list.find((v) => (new RegExp(name, 'gi')).test(v.channel)), result = []
	if (!data) throw 'List Channel Yg Tersedia:\n\n' + list.map(v => v.channel).sort().join('\n')
	let html = (await axios.get(`https://www.jadwaltv.net/${data.isPay ? 'jadwal-pay-tv/' : ''}${data.value}`)).data
	let $ = cheerio.load(html)
	$('div > table.table').find('tbody > tr').slice(1).each(function () {
		let jam = $(this).find('td').eq(0).text()
		let acara = $(this).find('td').eq(1).text()
		if (!/Jadwal TV/gi.test(acara) && !/Acara/gi.test(acara)) result.push({ jam, acara })
	})
	return { channel: data.channel.toUpperCase(), result }
}
/*
async function listJadwalTV() {
	let html = (await axios.get('https://www.jadwaltv.net/jadwal-pay-tv')).data
	let $ = cheerio.load(html), result = []
	$('#channelPayTVDropdown.dropdown > option').get().map((v) => {
		let name = $(v).text().toLowerCase()
		result.push({ value: $(v).val(), channel: name, isPay: true })
	})
	return [
		{ value: 'channel/antv', channel: 'antv', isPay: false },
		{ value: 'channel/gtv', channel: 'gtv', isPay: false },
		{ value: 'channel/indosiar', channel: 'indosiar', isPay: false },
		{ value: 'channel/inewstv', channel: 'inews tv', isPay: false },
		{ value: 'channel/kompastv', channel: 'kompas tv', isPay: false },
		{ value: 'channel/metrotv', channel: 'metro tv', isPay: false },
		{ value: 'channel/mnctv', channel: 'mnctv', isPay: false },
		{ value: 'channel/nettv', channel: 'net tv', isPay: false },
		{ value: 'channel/ochannel', channel: 'ochannel', isPay: false },
		{ value: 'channel/rcti', channel: 'rcti', isPay: false },
		{ value: 'channel/rtv', channel: 'rtv', isPay: false },
		{ value: 'channel/sctv', channel: 'sctv', isPay: false },
		{ value: 'channel/trans7', channel: 'trans7', isPay: false },
		{ value: 'channel/transtv', channel: 'transtv', isPay: false },
		{ value: 'channel/tvone', channel: 'tvone', isPay: false },
		{ value: 'channel/tvri', channel: 'tvri', isPay: false },
		...result
	]
}
*/

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["jadwaltv"]
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
__umiHandler.help = ["jadwaltv"]
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
