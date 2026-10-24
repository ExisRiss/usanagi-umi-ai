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
    name: 'randomtag',
    alias: ['rtag'],
    category: 'group',
    description: 'Tag member random di group',
    usage: '.randomtag',
    example: '.randomtag',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 5,
    isEnabled: true
}

async function handler(m, { sock }) {

    const group = await sock.groupMetadata(m.chat)
    const members = group.participants
        .map(v => v.id)
        .filter(v => v !== sock.user.id)

    if (members.length === 0) {
        return m.reply(`Hmm... sepertinya tidak ada member yang bisa aku pilih darling.`)
    }

    const random = members[Math.floor(Math.random() * members.length)]

    const teks = `🎲 *ALZRISS RANDOM SELECT*

Ara ara~

Hari ini aku memilih seseorang secara acak di group ini...

✨ Target terpilih adalah...

💗 @${random.split('@')[0]}

Jangan kaget ya darling~
Sepertinya kamu sedang diperhatikan olehku 👀`

    await sock.sendMessage(m.chat, {
        text: teks,
        mentions: [random]
    }, { quoted: m.raw })
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["randomtag", "rtag"]
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
__umiHandler.help = ["randomtag .randomtag"]
__umiHandler.tags = ["fun"]
__umiHandler.command = new RegExp(`^(${__umiCommands.map(value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`, 'i')
__umiHandler.owner = false
__umiHandler.premium = false
__umiHandler.group = true
__umiHandler.private = false
__umiHandler.admin = false
__umiHandler.botAdmin = false
__umiHandler.limit = false
__umiHandler.source = 'Usanagi Umi AI feature collection'
export default __umiHandler
