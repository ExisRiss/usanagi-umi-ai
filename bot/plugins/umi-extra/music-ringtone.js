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


// plugins/ringtone.js
// Ringtone Downloader
// API : https://anabot.my.id
// Author : Hilman

import fetch from "node-fetch"

const pluginConfig = {
  name: "ringtone",
  alias: [],
  category: "music",
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
  if (!text) throw `Contoh: ${usedPrefix + command} Iphone`

  await m.reply('✨cihuy otw cari ringtone...')

  try {
    const ringtoneBase = String(global.umiExtraAPI?.ringtoneBaseUrl || 'https://anabot.my.id/api/download/ringtone'); const ringtoneKey = String(global.umiExtraAPI?.ringtoneApiKey || 'freeApikey'); let url = `${ringtoneBase}?query=${encodeURIComponent(text)}&apikey=YOUR_API_KEY`
    let res = await fetch(url)
    let json = await res.json()

    if (!json.success || !json.data?.result?.length) 
      throw '❌ Ringtone tidak ditemukan.'

    let result = json.data.result

    for (let audio of result) {
      // kirim audio biasa 
      await conn.sendFile(
        m.chat,
        audio.audio,
        `${audio.title}.mpeg`,
        `🎵 *${audio.title}*`,
        m,
        false, 
        {
          mimetype: 'audio/mpeg'
        }
      )
      await new Promise(resolve => setTimeout(resolve, 1500)) // delay 1.5s biar ga spam
    }

  } catch (e) {
    console.error(e)
    m.reply('⚠️ Error: ' + e.message)
  }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["ringtone"]
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
__umiHandler.help = ["ringtone"]
__umiHandler.tags = ["music"]
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
