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
    name: "gachatomboy",
    category: "fun",
    description: "Gacha char anime tomboy random 100+ karakter",
    usage: ".gachatomboy",
    isEnabled: true
}

// List char tomboy, bisa ditambah sesuka hati
const tomboyList = [
"Misaki Ayuzawa","Haruhi Fujioka","Ruka Sarashina","Hikari Hanazono",
"Ushio","Makoto Kino","Souta","Yuki Nagato","Shikimori","Uzaki Hana",
"Tsuki Uzaki","Nagatoro","Chika Fujiwara","Ai Hayasaka","Akane Kurokawa",
"Ruby Hoshino","Frieren","Akira Asai","Tomoko Kuroki","Menma","Izumi Mom",
"Yukino Yukinoshita","Rikka Takarada","Chisato Nishikigi","Takina Inoue",
"Vivy","Shiraori","Anisphia Wynn Palletia","Euphyllia Magenta"
]

async function handler(m){
    const name = m.pushName || "Darling"
    const char = tomboyList[Math.floor(Math.random()*tomboyList.length)]
    const love = Math.floor(Math.random()*101)

    const statusList = [
        "💖 Cinta Sejati",
        "💘 Pasangan Serasi",
        "💕 Jodoh Anime",
        "💞 Relationship Goals",
        "💓 Bucin Maksimal",
        "💔 Hubungan Toxic 🗿"
    ]

    const status = statusList[Math.floor(Math.random()*statusList.length)]

    const responses = [
`╔═══『 💍 *GACHA TOMBOY* 』═══╗
┃
┃ 👤 Suami : *${name}*
┃ 👰 Tomboy : *${char}*
┃
┃ 💖 Love Meter : *${love}%*
┃ 📊 Status : *${status}*
┃
┃ Omedetou atas pernikahan kalian!
┃ Semoga langgeng selamanya ❤️
┃
╚════════════════════╝`,

`┏━━━〔 👰 *TOMBOY FOUND* 〕━━━┓
┃
┃ 🎉 Selamat!!
┃
┃ 👤 *${name}*
┃ ❤️ *${char}*
┃
┃ 💘 Kecocokan : *${love}%*
┃ 📊 Status : *${status}*
┃
┃ Jangan disia-siakan ya 😏
┗━━━━━━━━━━━━━━━━━━┛`,

`╭────〔 💞 *MATCHMAKING TOMBOY* 〕────╮
│
│ 👤 Player : *${name}*
│ 💖 Tomboy : *${char}*
│
│ 💓 Love Level : *${love}%*
│ 📊 Status : *${status}*
│
│ Sistem telah menjodohkan kalian
│ secara random 🗿
│
╰────────────────────╯`
    ]

    const reply = responses[Math.floor(Math.random()*responses.length)]
    await m.reply(reply)
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["gachatomboy"]
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
__umiHandler.help = ["gachatomboy .gachatomboy"]
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
