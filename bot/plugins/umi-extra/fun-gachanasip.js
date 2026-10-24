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
    name: "gachanasip",
    category: "fun",
    description: "Random nasip / hoki / keberuntungan buat user",
    usage: ".gachanasip",
    isEnabled: true
}

// List nasip / hoki / sial lucu
const nasipList = [
"Hari ini hoki banget, rezeki nyangkut di jalan 😎",
"Sedikit sial, hati-hati dengan benda tajam 🗡️",
"Nasip biasa aja, tapi senyummu manis ❤️",
"Rejeki datang tak terduga, siap-siap senyum 😏",
"Hari ini banyak godaan, tapi kamu kuat 💪",
"Nasip baik, kemungkinan dapat hadiah kecil 🎁",
"Sedikit sial, jangan lupa bawa payung ☂️",
"Nasip gokil! Orang jatuh cinta sama kamu hari ini 🥰",
"Peruntungan naik, tapi jangan sombong ya 😉",
"Nasip netral, santai aja dan nikmati hari 😎"
]

async function handler(m){
    const name = m.pushName || "Darling"
    const nasip = nasipList[Math.floor(Math.random()*nasipList.length)]

    const responses = [
`╭─〔 💖 ALZRISS GACHA NASIP 💖 〕─╮
│ Darling, nih nasipmu hari ini 😋
│
│ 👤 Player : *${name}*
│ 🍀 Nasip : *${nasip}*
│
│ Ara ara~ semoga harimu menyenangkan ❤️
╰────────────`,

`╔═══『 💞 NASIP GACHA 』═══╗
┃ Darling, yuk cek nasipmu!
┃
┃ 👤 Player : *${name}*
┃ 🌟 Nasip : *${nasip}*
┃
┃ Ara ara~ semoga hoki terus 😏
╚════════════════════╝`,

`┏━━━〔 💫 NASIPMU 〕━━━┓
┃
┃ 👤 Player : *${name}*
┃ 🎲 Nasip : *${nasip}*
┃
┃ Ara ara~ semoga rezeki & hoki selalu menyertaimu 🗿
┗━━━━━━━━━━━━━━━━━━┛`
    ]

    const reply = responses[Math.floor(Math.random()*responses.length)]
    await m.reply(reply)
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["gachanasip"]
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
__umiHandler.help = ["gachanasip .gachanasip"]
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
