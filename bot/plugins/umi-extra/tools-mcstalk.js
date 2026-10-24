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
  name: "mcstalk",
  alias: ["minecraftstalk", "stalkmc", "mcprofile"],
  category: "tools",
  description: "Stalk data profil / skin player Minecraft berdasarkan username",
  usage: ".mcstalk <username>",
  cooldown: 5,
  isEnabled: true,
}

// 🔑 API Key DashX
const DASHX_APIKEY = "DHX-5BF50D"

async function handler(m, extra) {
  const fullText = (m.text || m.body || "").trim()

  // Ambil username setelah command
  const username = fullText.replace(/^[\/.!#]?(mcstalk|minecraftstalk|stalkmc|mcprofile)\s*/i, "").trim()

  if (!username) {
    let guide = `🎮 *MINECRAFT STALKER*\n\n`
    guide += `📌 *Cara Pakai:*\n`
    guide += `• \`.mcstalk <username>\`\n\n`
    guide += `💡 *Contoh:* \`.mcstalk Notch\``
    return m.reply(guide)
  }

  try {
    const targetUrl = `https://api.dashx.dpdns.org/api/stalk/minecraft`

    const res = await axios.get(targetUrl, {
      params: {
        text: username,
        key: DASHX_APIKEY
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      timeout: 15000
    })

    const data = res?.data

    if (!data) {
      return m.reply("❌ *Gagal mendapatkan respons dari API DashX!*")
    }

    if (data.success === false || data.status === false) {
      return m.reply(`❌ *Gagal:* ${data.error || data.message || 'Player Minecraft tidak ditemukan atau API Key invalid.'}`)
    }

    const result = data.result || data.data || data

    let caption = `🎮 *MINECRAFT PLAYER PROFILE*\n\n`
    
    if (typeof result === 'object' && result !== null) {
      if (result.username || result.name) caption += `👤 *Username:* ${result.username || result.name}\n`
      if (result.uuid || result.id) caption += `🆔 *UUID:* \`${result.uuid || result.id}\`\n`
      if (result.skinUrl || result.skin) caption += `👕 *Skin URL:* ${result.skinUrl || result.skin}\n`
    } else {
      caption += `\`\`\`${JSON.stringify(result, null, 2)}\`\`\``
    }

    // Cek jika terdapat URL Skin/Avatar/Render player untuk dikirim sebagai gambar
    const skinPic = result.skinUrl || result.avatar || result.render || result.skin || result.image

    const conn = extra?.conn || extra?.client || extra?.sock || m?.conn || this

    if (skinPic && typeof skinPic === 'string' && skinPic.startsWith('http')) {
      return await conn.sendMessage(m.chat, { image: { url: skinPic }, caption }, { quoted: m })
    } else {
      return m.reply(caption)
    }

  } catch (error) {
    console.error("[MC Stalk Error]:", error?.message)
    const errDetail = error?.response?.data?.error || error?.response?.data?.message || error?.message || "Server Error"
    return m.reply(`❌ *Terjadi Kesalahan:* ${errDetail}`)
  }
}

async function before(m) {
  return true
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["mcstalk", "minecraftstalk", "stalkmc", "mcprofile"]
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
__umiHandler.help = ["mcstalk .mcstalk <username>"]
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
