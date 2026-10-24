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

const pluginConfig = {
  name: "halah",
  alias: ["hilih"],
  category: "fun",
  description: "Ubah teks ke gaya Halah/Hilih",
  usage: ".halah <teks> / .hilih <teks>",
  example: ".halah congratulations",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
}

function gayaHalah(text) {
  if (/cangratalataans|laval|rala|raward|samakan|sarang|barantaraksa|nashakaga chasata/i.test(text)) return null
  return text.replace(/[aeou]/gi, "a").replace(/congratulations/gi, "cangratalataans").replace(/you/gi, "yaa").replace(/level/gi, "laval").replace(/role/gi, "rala").replace(/reward/gi, "raward").replace(/semakin/gi, "samakan").replace(/sering/gi, "sarang").replace(/berinteraksi/gi, "barantaraksa").replace(/dengan/gi, "dangan").replace(/nishikigi chisato/gi, "nashakaga chasata").replace(/money/gi, "manay")
}
function gayaHilih(text) {
  if (/cingritilitiins|livil|rili|riwird|simikin|siring|birintiriksi|nishikigi chisiti/i.test(text)) return null
  return text.replace(/[aeou]/gi, "i").replace(/congratulations/gi, "cingritilitiins").replace(/you/gi, "yii").replace(/level/gi, "livil").replace(/role/gi, "rili").replace(/reward/gi, "riwird").replace(/semakin/gi, "simikin").replace(/sering/gi, "siring").replace(/berinteraksi/gi, "birintiriksi").replace(/dengan/gi, "dingin").replace(/nishikigi chisato/gi, "nishikigi chisiti").replace(/money/gi, "miniy")
}

async function handler(m) {
  const text = m.text?.trim() || ""
  if (!text) return m.reply(`🔁 Kirim teks setelah \`${m.prefix}${m.command}\` atau reply ke pesan teks.`)
  const out = m.command === "hilih" ? gayaHilih(text) : gayaHalah(text)
  if (!out) return m.reply("🚫 Teks ini sudah pernah diubah sebelumnya.")
  return m.reply(out)
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["halah", "hilih"]
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
__umiHandler.help = ["halah .halah <teks> / .hilih <teks>"]
__umiHandler.tags = ["fun"]
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
