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
    name: 'ytsummarize',
    alias: ['ytsummary', 'summarizeyt', 'ringkasyt'],
    category: 'tools',
    description: 'Ringkasan video YouTube dengan AI',
    usage: '.ytsummarize <url>',
    example: '.ytsummarize https://youtu.be/xxxxx',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 3,
    isEnabled: true
}

async function handler(m, { sock }) {
    const url = m.args[0]
    
    if (!url) {
        return m.reply(`📺 *ʏᴛ sᴜᴍᴍᴀʀɪᴢᴇ*\n\n> Masukkan URL YouTube\n\n\`Contoh: ${m.prefix}ytsummarize https://youtu.be/xxxxx\``)
    }
    
    if (!url.match(/youtu\.?be/i)) {
        return m.reply(`❌ URL YouTube tidak valid!`)
    }
    
    m.react('⏳')
    await m.reply(`📺 Meringkas video...\n> _Proses ini memerlukan waktu ±25 detik_`)
    
    try {
        const res = await axios.get(`https://api.nekolabs.web.id/tools/yt-summarizer/v2?url=${encodeURIComponent(url)}&language=id`, {
            timeout: 180000
        })
        
        if (!res.data?.success || !res.data?.result?.content) {
            m.react('❌')
            return m.reply(`❌ Gagal meringkas video`)
        }
        
        const data = res.data.result
        const content = data.content
        const duration = Math.floor(data.video_duration / 60)
        const thumbnail = data.video_thumbnail_url
        
        m.react('✅')
        
        let caption = `📺 *ʏᴛ sᴜᴍᴍᴀʀɪᴢᴇ*\n\n`
        caption += `> ⏱️ Durasi: ${duration} menit\n`
        caption += `> 🆔 Video ID: ${data.video_id}\n\n`
        caption += `${content.substring(0, 3500)}${content.length > 3500 ? '\n\n...(terpotong)' : ''}`
        
        if (thumbnail) {
            await sock.sendMessage(m.chat, {
                image: { url: thumbnail },
                caption: caption
            }, { quoted: m })
        } else {
            await m.reply(caption)
        }
        
    } catch (error) {
        m.react('❌')
        m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ${error.message}`)
    }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["ytsummarize", "ytsummary", "summarizeyt", "ringkasyt"]
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
__umiHandler.help = ["ytsummarize .ytsummarize <url>"]
__umiHandler.tags = ["tools"]
__umiHandler.command = new RegExp(`^(${__umiCommands.map(value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`, 'i')
__umiHandler.owner = false
__umiHandler.premium = true
__umiHandler.group = false
__umiHandler.private = false
__umiHandler.admin = false
__umiHandler.botAdmin = false
__umiHandler.limit = false
__umiHandler.source = 'Usanagi Umi AI feature collection'
export default __umiHandler
