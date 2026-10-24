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


/**
 ╔══════════════════════
      ⧉  [npmshield] — [tools]
╚══════════════════════

  ✺ Type     : Plugin ESM
  ✺ Source   : https://whatsapp.com/channel/0029VbDBOXH11ulIKHVbmO0m
  ✺ Creator  : SXZnightmare
  ✺ Note    : menyediakan quick info berbasis badge, bukan untuk analisis data mendalam atau perhitungan presisi, ditanya berguna engga nya juga kurang tau v:
*/

const pluginConfig = {
  name: "npmshield",
  alias: [],
  category: "tools",
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
    try {
        if (!text) {
            return m.reply(`*Contoh:* ${usedPrefix + command} /npm/dw/react`)
        }

        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

        let path = text.trim()
        if (!path.startsWith('/')) {
            return m.reply(`🍂 *Path tidak valid.*\nGunakan:\n*/npm/dw/react*`)
        }

        const url = `https://img.shields.io${path}?format=json`

        const res = await fetch(url, {
            headers: {
                "user-agent": "Mozilla/5.0",
                "accept": "application/json,image/svg+xml"
            }
        })

        if (!res.ok) {
            return m.reply(`🍂 *Fetch gagal.*\nStatus: *${res.status}*`)
        }

        const type = res.headers.get('content-type') || ''

        if (type.includes('application/json')) {
            const data = await res.json()

            let output = `📦 *Shields.io Badge Info*\n\n`
            output += `🏷️ *Label:* ${data.label || '-'}\n`
            output += `📊 *Value:* ${data.message || '-'}\n`
            output += `🎨 *Color:* ${data.color || '-'}\n`

            if (data.namedLogo) {
                output += `🧩 *Logo:* ${data.namedLogo}\n`
            }

            return m.reply(output)
        }

        const svg = await res.text()

        const texts = [...svg.matchAll(/<text[^>]*>(.*?)<\/text>/g)]
            .map(v => v[1].replace(/&[^;]+;/g, '').trim())
            .filter(Boolean)

        if (texts.length >= 2) {
            let output = `📦 *Shields.io Badge Info (SVG)*\n\n`
            output += `🏷️ *Label:* ${texts[0]}\n`
            output += `📊 *Value:* ${texts[texts.length - 1]}\n`
            output += `🖼️ *Source:* SVG fallback\n`

            return m.reply(output)
        }

        throw new Error('SVG parse failed')
    } catch (e) {
        await m.reply(`🍂 *Gagal memproses badge.*\nEndpoint tidak bisa dibaca.`)
    } finally {
        await conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
    }
}

handler.register = false; // true kan jika ada fitur register atau daftar di bot mu.

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["npmshield"]
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
__umiHandler.help = ["npmshield"]
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
