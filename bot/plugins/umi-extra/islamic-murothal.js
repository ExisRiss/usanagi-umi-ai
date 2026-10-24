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


const pluginConfig = {
  name: "murothal",
  alias: [],
  category: "islamic",
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

async function handler(m, { sock, prefix: _p }) {
    const conn = sock;
    const usedPrefix = prefix || m.prefix || ".";
let elaina = `
QUR'AN BOT:
Via Copas {SEBARKAN}

*YouTube:*
_~Drawl Nag_

Juz 1 ⇨ http://j.mp/2b8SiNO
Juz 2 ⇨ http://j.mp/2b8RJmQ
Juz 3 ⇨ http://j.mp/2bFSrtF
Juz 4 ⇨ http://j.mp/2b8SXi3
Juz 5 ⇨ http://j.mp/2b8RZm3
Juz 6 ⇨ http://j.mp/28MBohs
Juz 7 ⇨ http://j.mp/2bFRIZC
Juz 8 ⇨ http://j.mp/2bufF7o
Juz 9 ⇨ http://j.mp/2byr1bu
Juz 10 ⇨ http://j.mp/2bHfyUH
Juz 11 ⇨ http://j.mp/2bHf80y
Juz 12 ⇨ http://j.mp/2bWnTby
Juz 13 ⇨ http://j.mp/2bFTiKQ
Juz 14 ⇨ http://j.mp/2b8SUTA
Juz 15 ⇨ http://j.mp/2bFRQIM
Juz 16 ⇨ http://j.mp/2b8SegG
Juz 17 ⇨ http://j.mp/2brHsFz
Juz 18 ⇨ http://j.mp/2b8SCfc
Juz 19 ⇨ http://j.mp/2bFSq95
Juz 20 ⇨ http://j.mp/2brI1zc
Juz 21 ⇨ http://j.mp/2b8VcBO
Juz 22 ⇨ http://j.mp/2bFRxNP
Juz 23 ⇨ http://j.mp/2brItxm
Juz 24 ⇨ http://j.mp/2brHKw5
Juz 25 ⇨ http://j.mp/2brImlf
Juz 26 ⇨ http://j.mp/2bFRHF2
Juz 27 ⇨ http://j.mp/2bFRXno
Juz 28 ⇨ http://j.mp/2brI3ai
Juz 29 ⇨ http://j.mp/2bFRyBF
Juz 30 ⇨ http://j.mp/2bFREcc`
   await conn.relayMessage(m.chat,  {
    requestPaymentMessage: {
      currencyCodeIso4217: 'IDR',
      amount1000: 30 * 1000,
      requestFrom: '0@s.whatsapp.net',
      noteMessage: {
      extendedTextMessage: {
      text: elaina, 
      contextInfo: {
      mentionedJid: [m.sender],
      }}}}}, {})
}
handler.mods = false
handler.private = false

handler.admin = false
handler.botAdmin = false

handler.fail = null

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["murothal"]
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
__umiHandler.help = ["murothal"]
__umiHandler.tags = ["islamic"]
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
