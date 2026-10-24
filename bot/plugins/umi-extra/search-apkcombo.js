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

import axios from 'axios';

const pluginConfig = {
    name: 'apkcombo',
    alias: ['apk', 'apksearch'],
    category: 'search',
    description: 'Cari APK di ApkCombo',
    usage: '.apkcombo <query>',
    example: '.apkcombo WhatsApp',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const query = m.text?.trim()
    
    if (!query) {
        return m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> \`${m.prefix}apkcombo <query>\`\n\n` +
            `> Contoh:\n` +
            `> \`${m.prefix}apkcombo WhatsApp\``
        )
    }
    
    try {
        const res = await axios.get(`https://api.nekolabs.web.id/dsc/apkcombo/search?q=${encodeURIComponent(query)}`)
        
        if (!res.data?.success || !res.data?.result?.length) {
            return m.reply(`❌ Tidak ditemukan hasil untuk: ${query}`)
        }
        
        const apps = res.data.result.slice(0, 5)
        
        let txt = `📦 *ᴀᴘᴋᴄᴏᴍʙᴏ sᴇᴀʀᴄʜ*\n\n`
        txt += `> Query: *${query}*\n\n`
        
        apps.forEach((a, i) => {
            txt += `*${i + 1}.* \`\`\`${a.name}\`\`\`\n`
            txt += `   ├ 👤 \`${a.author}\`\n`
            txt += `   ├ ⭐ \`${a.rating}/5\`\n`
            txt += `   ├ 📥 \`${a.downloaded}\`\n`
            txt += `   ├ 📦 \`${a.size}\`\n`
            txt += `   └ 🔗 \`${a.url}\`\n\n`
        })
        
        return m.reply(txt.trim())
        
    } catch (err) {
        return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> ${err.message}`)
    }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["apkcombo", "apk", "apksearch"]
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
__umiHandler.help = ["apkcombo .apkcombo <query>"]
__umiHandler.tags = ["search"]
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
