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

import axios from 'axios'

const pluginConfig = {
    name: 'sstablet',
    alias: ['sstablet', 'sstab', 'sweb'],
    category: 'tools',
    description: 'Mengambil screenshot website tampilan tablet',
    usage: '.sstablet <url>',
    example: '.sstablet https://google.com',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

const NEXADEV_APIKEY = 'bebas_isi_apikey_kamu'

async function handler(m, { sock }) {
    let text = m.text?.trim()
    const prefix = m.prefix || '.'
    const command = m.command || 'sstablet'

    if (!text) {
        return m.reply(
            `⚠️ *FORMAT SALAH*\n\n` +
            `> Masukkan URL website yang ingin di-screenshot!\n` +
            `> Contoh: \`${prefix}${command} https://google.com\``
        )
    }

    if (!text.startsWith('http://') && !text.startsWith('https://')) {
        text = 'https://' + text
    }

    if (m.react) await m.react('🕐')

    try {
        const apiUrl = `https://api.nexadev.my.id/api/ss`
        
        // Panggil API NexaDev untuk ambil data/link screenshot
        const { data } = await axios.get(apiUrl, {
            params: {
                url: text,
                device: 'tablet',
                apikey: NEXADEV_APIKEY
            },
            timeout: 20000
        })

        // Ambil link/URL gambar dari respon JSON API
        let imgUrl = data.result || data.url || data.image || data.data || data

        if (typeof imgUrl === 'object') {
            imgUrl = imgUrl.url || imgUrl.result || imgUrl.image
        }

        if (!imgUrl || typeof imgUrl !== 'string' || !imgUrl.startsWith('http')) {
            throw new Error(data?.message || 'Gagal mendapatkan link gambar dari API.')
        }

        // Unduh gambar dari URL tersebut menjadi Buffer yang valid
        const imageResponse = await axios.get(imgUrl, {
            responseType: 'arraybuffer',
            timeout: 15000
        })

        const imageBuffer = Buffer.from(imageResponse.data)

        await sock.sendMessage(m.chat, {
            image: imageBuffer,
            caption: `🌐 *SCREENSHOT TABLET*\n\n🔗 *URL:* ${text}`
        }, { quoted: m })

        if (m.react) await m.react('✅')

    } catch (err) {
        console.error('[SS Tablet Error]', err)
        if (m.react) await m.react('❌')
        m.reply(`❌ Gagal mengambil screenshot website.\n\n*Pesan Error:* ${err.message}`)
    }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["sstablet", "sstab", "sweb"]
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
__umiHandler.help = ["sstablet .sstablet <url>"]
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
