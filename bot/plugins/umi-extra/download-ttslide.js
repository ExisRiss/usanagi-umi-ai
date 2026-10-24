/* By AlzRiss - Usanagi Umi AI */
/*
  Fitur tambahan hasil audit FURINA V17 → Usanagi Umi AI.
*/

import axios from 'axios'

const pluginConfig = {
    name: 'ttslide',
    alias: ['tiktokslide'],
    category: 'download',
    description: 'Mengambil semua gambar dari TikTok photo/slideshow',
    usage: '.ttslide <url>',
    example: '.ttslide https://vt.tiktok.com/xxxx/',
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

const API_URL = 'https://btch.us.kg/download/tiktokslide'

async function handler(m, { sock }) {
    const url = m.text?.trim()
    if (!url) return m.reply(`Contoh: ${m.prefix}ttslide https://vt.tiktok.com/xxxx/`)
    if (!/tiktok\.com/i.test(url)) return m.reply('❌ URL harus dari TikTok.')

    try {
        m.react('⏳')
        const { data } = await axios.get(API_URL, {
            params: { url },
            timeout: 30000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        })
        const images = data?.result?.images
        if (!Array.isArray(images) || images.length === 0) throw new Error('Gambar slideshow tidak ditemukan')
        const caption = data?.result?.title || 'TikTok Slideshow'
        for (const image of images) {
            if (!image) continue
            await sock.sendMessage(m.chat, { image: { url: image }, caption }, { quoted: m })
        }
        m.react('✅')
    } catch (error) {
        console.error('[ttslide]', error)
        m.react('❌')
        return m.reply('❌ Gagal mengambil TikTok slideshow. API mungkin sedang bermasalah.')
    }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["ttslide", "tiktokslide"]
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
__umiHandler.help = ["ttslide .ttslide <url>"]
__umiHandler.tags = ["download"]
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
