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
export const FEATURE_CREDIT = 'By AlzRiss - Usanagi Umi AI';
const pluginConfig = {
    name: 'bitly',
    alias: ['shortlink', 'shorturl'],
    category: 'tools',
    description: 'Shorten URL dengan Bitly',
    usage: '.bitly <url>',
    example: '.bitly https://google.com',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const url = m.args[0]
    
    if (!url) {
        return m.reply(`🔗 *ʙɪᴛʟʏ sʜᴏʀᴛʟɪɴᴋ*\n\n> Masukkan URL\n\n\`Contoh: ${m.prefix}bitly https://google.com\``)
    }
    
    if (!url.match(/^https?:\/\//i)) {
        return m.reply(`❌ URL tidak valid! Harus dimulai dengan http:// atau https://`)
    }
    
    m.react('🔗')
    
    try {
        const res = await axios.get(`https://api.nekolabs.web.id/tools/shortlink/bitly?url=${encodeURIComponent(url)}`, {
            timeout: 30000
        })
        
        if (!res.data?.success || !res.data?.result) {
            m.react('❌')
            return m.reply(`❌ Gagal memperpendek URL`)
        }
        
        const shortUrl = res.data.result
        
        m.react('✅')
        
        await sock.sendMessage(m.chat, {
            text: `🔗 *ʙɪᴛʟʏ sʜᴏʀᴛʟɪɴᴋ*\n\n> *Original:* ${url.substring(0, 50)}${url.length > 50 ? '...' : ''}\n> *Short:* ${shortUrl}`,
            contextInfo: {
                externalAdReply: {
                    title: 'Bitly Shortlink',
                    body: shortUrl,
                    sourceUrl: shortUrl,
                    mediaType: 1
                }
            }
        }, { quoted: m })
        
        await sock.sendMessage(m.chat, {
            text: shortUrl,
            interactiveMessage: {
                body: { text: `🔗 *ʙɪᴛʟʏ sʜᴏʀᴛʟɪɴᴋ*\n\n${shortUrl}` },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: 'cta_copy',
                            buttonParamsJson: JSON.stringify({
                                display_text: '📋 Copy Link',
                                copy_code: shortUrl
                            })
                        }
                    ]
                }
            }
        })
        
    } catch (error) {
        m.react('❌')
        m.reply(`❌ *ᴇʀʀᴏʀ*\n\n> ${error.message}`)
    }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["bitly", "shortlink", "shorturl"]
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
__umiHandler.help = ["bitly .bitly <url>"]
__umiHandler.tags = ["tools"]
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
