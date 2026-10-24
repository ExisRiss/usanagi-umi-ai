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
    name: 'cekperforma',
    alias: ['performa', 'cekperf'],
    category: 'fun',
    description: 'Cek performa secara random (bercanda)',
    usage: '.cekperforma <nama>',
    example: '.cekperforma Budi',
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

    const durasi = Math.floor(Math.random() * 30) + 1 // menit
    const stamina = Math.floor(Math.random() * 100) + 1
    const skill = Math.floor(Math.random() * 100) + 1

    const efekList = [
        'getar dikit 😭',
        'mode santai 😌',
        'agresif 🔥',
        'auto aim 🗿',
        'combo cepat ⚡',
        'delay dikit 😅',
        'full fokus 😎',
        'mode barbar 💀'
    ]

    const roastList = [
        'baru mulai udah selesai 🗿',
        'speedrun any% 😭',
        'kayak iklan doang bentar 😅',
        'loading lama, selesai cepet 🗿',
        'timing nya... ya gitu lah 😭'
    ]

    const pujianList = [
        'tahan lama boss 🔥',
        'pro player 😎',
        'gak ada lawan 💀',
        'legendary performa 😭',
        'full combo tanpa miss 🗿'
    ]

    const efek = efekList[Math.floor(Math.random() * efekList.length)]

    let komentar = ''
    if (durasi <= 5) {
        komentar = roastList[Math.floor(Math.random() * roastList.length)]
    } else if (durasi >= 20) {
        komentar = pujianList[Math.floor(Math.random() * pujianList.length)]
    } else {
        komentar = 'standar aman 👍'
    }

    // 🔥 BAR VISUAL
    const bar = '⚡' + '═'.repeat(Math.floor(durasi / 2)) + '🔥'

    let txt = `⚡ *CEK PERFORMA*\n\n`
    txt += `> 👤 Nama: *${nama}*\n`
    txt += `> ⏱️ Durasi: *${durasi} menit*\n`
    txt += `> 🔋 Stamina: *${stamina}%*\n`
    txt += `> 🎯 Skill: *${skill}%*\n`
    txt += `> 💫 Efek: *${efek}*\n`
    txt += `> ${bar}\n\n`
    txt += `> 💬 ${komentar}`

    await m.reply(txt)
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["cekperforma", "performa", "cekperf"]
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
__umiHandler.help = ["cekperforma .cekperforma <nama>"]
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
