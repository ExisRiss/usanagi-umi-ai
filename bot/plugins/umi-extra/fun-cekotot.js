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
    name: 'cekotot',
    alias: ['ototcheck', 'cekmuscle'],
    category: 'fun',
    description: 'Cek seberapa berotot kamu (random)',
    usage: '.cekotot <nama>',
    example: '.cekotot Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const nama = m.text?.trim() || m.pushName || 'Kamu'
    const power = Math.floor(Math.random() * 100) + 1

    const bentukList = [
        'sixpack samar 😎',
        'berisi dan padat 💪',
        'atlet vibes 🏋️',
        'bodybuilder mode 🔥',
        'lean tapi kuat ⚡',
        'dad bod santai 😌',
        'tipis tapi effort 😅',
        'kenceng kayak batu 🗿'
    ]

    const roastList = [
        'ini otot apa bayangan? 😭',
        'tipis banget njir 🗿',
        'angin lewat langsung goyang 😅',
        'push up 1x udah capek 😭',
        'kayak belum unlock fitur 💀'
    ]

    const pujianList = [
        'gila ini sih tank 🔥',
        'sekali pukul KO 😎',
        'body idaman 😭',
        'auto jadi sigma 💪',
        'monster gym 🗿'
    ]

    const bentuk = bentukList[Math.floor(Math.random() * bentukList.length)]

    let komentar = ''
    if (power <= 30) {
        komentar = roastList[Math.floor(Math.random() * roastList.length)]
    } else if (power >= 80) {
        komentar = pujianList[Math.floor(Math.random() * pujianList.length)]
    } else {
        komentar = 'lumayan lah masih progress 👍'
    }

    // 🔥 BAR OTOT
    const bar = '💪' + '═'.repeat(Math.floor(power / 5)) + '🔥'

    let txt = `💪 *CEK OTOT*\n\n`
    txt += `> 👤 Nama: *${nama}*\n`
    txt += `> 📊 Power: *${power}%*\n`
    txt += `> 🏋️ Bentuk: *${bentuk}*\n`
    txt += `> ${bar}\n\n`
    txt += `> 💬 ${komentar}`

    await m.reply(txt)
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["cekotot", "ototcheck", "cekmuscle"]
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
__umiHandler.help = ["cekotot .cekotot <nama>"]
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
