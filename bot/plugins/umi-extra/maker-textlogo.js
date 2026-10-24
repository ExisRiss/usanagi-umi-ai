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


let effects = [
  'snow3d','anonymhacker','aovwallpaper','avatarlolnew','beautifulflower',
  'birthdaycake','birthdayday','cartoongravity','codwarzone','cutegravity',
  'fpslogo','freefire','galaxybat','galaxystyle','galaxywallpaper','glittergold',
  'greenbush','greenneon','heartshaped','hologram3d','juventusshirt','lighttext',
  'logogaming','lolbanner','luxurygold','metallogo','mlwallpaper','multicolor3d',
  'noeltext','pubgmaskot','puppycute','realvintage','royaltext','silverplaybutton',
  'starsnight','textbyname','textcake','valorantbanner','watercolor','wetglass',
  'wooden3d','writegalaxy'
]

const pluginConfig = {
  name: "textlogo",
  alias: [],
  category: "maker",
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

async function handler(m, { sock, text, prefix, command }) {
    const conn = sock;
    const usedPrefix = prefix || m.prefix || ".";
  if (!text) {
    return m.reply(
`🖼️ *TEXT LOGO MAKER*

Contoh:
${usedPrefix + command} snow3d|Ryo Yamada

📜 *List Efek:*
${effects.map(v => '• ' + v).join('\n')}`
    )
  }

  let [effect, txt] = text.split('|')
  if (!effect || !txt) {
    return m.reply(`Gunakan format:\n${usedPrefix + command} efek|teks`)
  }

  effect = effect.toLowerCase().trim()
  txt = txt.trim()

  if (!effects.includes(effect)) {
    return m.reply(
`Efek tidak tersedia!

✨ *List Efek:*
${effects.map(v => '• ' + v).join('\n')}`
    )
  }

  await conn.sendMessage(m.chat, {
    react: { text: '🕒', key: m.key }
  })

  let url = `https://api.lolhuman.xyz/api/ephoto1/${effect}?apikey=YOUR_API_KEY'https://api.lolhuman.xyz']}&text=${encodeURIComponent(txt)}`

  await conn.sendFile(m.chat, url, 'textlogo.jpg', 'Done', m)
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["textlogo"]
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
__umiHandler.help = ["textlogo"]
__umiHandler.tags = ["maker"]
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
