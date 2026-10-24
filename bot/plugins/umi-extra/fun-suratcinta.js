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
  name: "suratcinta",
  alias: [],
  category: "fun",
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

async function handler(m, { text }) {
  if (!text) return m.reply('💌 Masukkan nama orang yang mau kamu kirimi surat cinta palsu.\n\nContoh: .suratcinta Hilman')

  const target = text
  const pembuka = [
    `Untukmu yang selalu hadir dalam lamunanku, ${target},`,
    `Dear ${target},`,
    `Kepada ${target} yang diam-diam kucintai,`,
    `Hai ${target}, bintang di langit malamku,`,
    `Wahai ${target}, pemilik senyum yang menghancurkan dompetku,`
  ]

  const isi = [
    `Setiap kali aku melihat status-mu, hatiku bergetar seperti sinyal WiFi tetangga.`,
    `Kau hadir dalam hidupku bagaikan notif Shopee di tengah malam, mengejutkan tapi bikin senang.`,
    `Aku tau kamu bukan SPBU, tapi kenapa kamu selalu ngisi hatiku?`,
    `Kalau cinta itu buta, maka aku sudah lama tersesat di labirin wajahmu.`,
    `Tanpamu hidupku seperti Indomie tanpa micin, hambar dan menyedihkan.`
  ]

  const penutup = [
    `Salam terhangat, dari seseorang yang bahkan kamu gak save nomornya.`,
    `Dari aku, yang hanya bisa memandangmu dari status WhatsApp.`,
    `Dengan penuh cinta palsu,`,
    `Yang mencintaimu dalam diam dan chat yang tak pernah kamu balas.`,
    `Sekian, sebelum kamu buang surat ini ke spam.`
  ]

  const surat = `${pick(pembuka)}\n\n${pick(isi)}\n\n${pick(penutup)}`
  m.reply(`💌 *Surat Cinta Palsu*\n\n${surat}`)
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["suratcinta"]
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
__umiHandler.help = ["suratcinta"]
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
