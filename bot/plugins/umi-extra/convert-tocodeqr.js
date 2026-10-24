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
  name: "tocodeqr",
  alias: ["qrurl", "linktoqr"],
  category: "tools",
  description: "Convert link menjadi QR Code",
  usage: ".tocodeqr <link>",
  example: ".tocodeqr https://youtube.com",
  cooldown: 3,
  energi: 0,
  isOwner: false,
  isGroup: false,
  isPrivate: false,
  isPremium: false,
  isEnabled: true,
};

async function handler(m, { sock }) {

  const text = m.args[0]

  if (!text) {
    return m.reply(
`🌸 *ALZRISS QR GENERATOR*

Konichiwa darling ${m.pushName || ""} ✨

Gunakan seperti ini yaa :

.tocodeqr https://example.com

AlzRiss akan mengubah link itu
menjadi QR Code yang bisa discan 😋`
    )
  }

  try {

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(text)}`

    await sock.sendMessage(m.chat, {
      image: { url: qrUrl },
      caption:
`💗 *ALZRISS QR CODE*

🔗 Link :
${text}

✨ Scan QR ini untuk membuka link nya yaa darling`
    }, { quoted: m })

  } catch (err) {

    m.reply(
`❌ *ERROR*

AlzRiss gagal membuat QR Code 😢

${err.message}`
    )

  }

}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["tocodeqr", "qrurl", "linktoqr"]
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
__umiHandler.help = ["tocodeqr .tocodeqr <link>"]
__umiHandler.tags = ["convert"]
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
