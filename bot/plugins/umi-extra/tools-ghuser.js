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

export const FEATURE_CREDIT = 'By AlzRiss - Usanagi Umi AI';


/**
 * Fitur    : GitHub Tools
 * Type     : Plugins ESM
 * Creator  : Hilman
 * Channel  : https://whatsapp.com/channel/0029VbDBOXH11ulIKHVbmO0m
 */

const pluginConfig = {
  name: "ghuser",
  alias: ["ghsearch", "ghgist"],
  category: "tools",
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

async function handler(m, { text, prefix, command }) {
    const usedPrefix = prefix || m.prefix || ".";
  if (!text) throw `${usedPrefix}${command} query`

  try {

    if (command === 'ghuser') {
      let res = await fetch(`https://api.github.com/users/${text}`)
      let json = await res.json()

      return m.reply(`👤 ${json.login}
📦 Repo: ${json.public_repos}
👥 Followers: ${json.followers}
🔗 ${json.html_url}`)
    }

    if (command === 'ghsearch') {
      let res = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(text)}`)
      let json = await res.json()

      let hasil = json.items.slice(0, 5).map(v => `
${v.full_name}
⭐ ${v.stargazers_count}
🔗 ${v.html_url}`).join('\n')

      return m.reply(hasil)
    }

    if (command === 'ghgist') {
      let url = text.trim()

      if (url.includes('gist.github.com')) {
        let id = url.split('/').pop()
        let res = await fetch(`https://api.github.com/gists/${id}`)
        let json = await res.json()

        for (let x in json.files) {
          let f = json.files[x]
          await m.reply('```' + f.content + '```')
        }

        return
      }

      if (url.includes('github.com')) {
        url = url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/')
      }

      let res = await fetch(url)
      let textFile = await res.text()

      return m.reply('```' + textFile + '```')
    }

  } catch {
    throw 'Error'
  }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["ghuser", "ghsearch", "ghgist"]
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
__umiHandler.help = ["ghuser"]
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
