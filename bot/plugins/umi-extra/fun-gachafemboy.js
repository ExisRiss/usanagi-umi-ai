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

const pluginConfig = {
    name: "gachafemboy",
    category: "fun",
    description: "Gacha femboy anime random",
    usage: ".gachafemboy",
    cooldown: 3,
    isEnabled: true
}

const femboyList = [

"Astolfo",
"Felix Argyle",
"Hideri Kanzaki",
"Ruka Urushibara",
"Gasper Vladi",
"Saika Totsuka",
"Nagisa Shiota",
"Chihiro Fujisaki",
"Ritsu Sohma",
"Kurapika",
"Haku",
"AlzRiss Tempest",
"Hideyoshi Kinoshita",
"Tetra",
"Juuzou Suzuya",
"Armin Arlert",
"Kalluto Zoldyck",
"Alluka Zoldyck",
"Gowther",
"Mare Bello Fiore",
"Bridget",
"Venti",
"Lyney",
"Xingqiu",
"Shun Kaidou",
"Kazuto Kirigaya (GGO Avatar)",
"Chihiro Fujisaki",
"Hideyoshi",
"Saika Totsuka",
"Felix Argyle",
"Astolfo Rider",
"Gasper Vladi",
"Haku (Naruto)",
"Nagisa Shiota",
"AlzRiss Human Form"

]

async function handler(m){

const name = m.pushName || "Darling"
const femboy = femboyList[Math.floor(Math.random()*femboyList.length)]
const love = Math.floor(Math.random()*101)

const statusList = [
"💖 Terpesona",
"💘 Bikin Bingung Gender",
"💕 Imut Banget",
"💞 Terlalu Cantik",
"🔥 Femboy Idaman",
"😳 Kamu Tertipu"
]

const status = statusList[Math.floor(Math.random()*statusList.length)]

const responses = [

`╔═══『 🌸 *GACHA FEMBOY* 』═══╗
┃
┃ 👤 Player : *${name}*
┃ 🎀 Femboy : *${femboy}*
┃
┃ 💖 Love Meter : *${love}%*
┃ 📊 Status : *${status}*
┃
┃ Selamat kamu dapat
┃ femboy anime 😳
┃
╚════════════════════╝`,

`┏━━━〔 🎀 *FEMBOY FOUND* 〕━━━┓
┃
┃ 👤 *${name}*
┃ 💕 *${femboy}*
┃
┃ 💘 Kecocokan : *${love}%*
┃ 📊 Status : *${status}*
┃
┃ Cantik... eh cowok 🗿
┃
┗━━━━━━━━━━━━━━━━━━┛`,

`╭────〔 🌸 *TRAP DETECTED* 〕────╮
│
│ 👤 Player : *${name}*
│ 🎀 Character : *${femboy}*
│
│ 💓 Love Level : *${love}%*
│ 📊 Status : *${status}*
│
│ Hati-hati...
│ bisa bikin bingung 😏
│
╰──────────────────────╯`,

`╔═══〔 🤨 *WARNING* 〕═══╗
║
║ 👤 Player : *${name}*
║ 🎀 Character : *${femboy}*
║
║ 💖 Love : *${love}%*
║
║ 🤨 Kamu gak belok
║ nanti nya kan?
║
║ 🗿 Semoga masih
║ lurus ya bro...
║
╚════════════════════╝`

]

const reply = responses[Math.floor(Math.random()*responses.length)]

await m.reply(reply)

}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["gachafemboy"]
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
__umiHandler.help = ["gachafemboy .gachafemboy"]
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
