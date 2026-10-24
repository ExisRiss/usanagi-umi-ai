import { getGroqSettings } from '../../lib/groq-client.js'
import { botInfoHtml, sendRichInfo } from '../../lib/rich-info-cards.js'

const handler = async (m, { conn, usedPrefix = '.' }) => {
  const config = conn.botConfig || m.botConfig || {}
  const seconds = Math.max(0,Math.floor(process.uptime()))
  const days = Math.floor(seconds/86400),hours=Math.floor(seconds%86400/3600),minutes=Math.floor(seconds%3600/60)
  const uptime = `${days ? days+'h ' : ''}${hours}j ${minutes}m ${seconds%60}d`
  const settings = global.db?.data?.settings?.[conn.user?.jid || conn.user?.id] || {}
  const groq = getGroqSettings()
  const info = {
    name: String(config.values?.botName || config.botName || global.namebot || 'Usanagi Umi AI'),
    type: config.type === 'jadibot' ? 'Sesi Jadibot' : 'Bot utama',
    mode: (typeof config.public === 'boolean' ? !config.public : Boolean(global.opts?.self)) ? 'Mode self' : 'Mode publik',
    uptime,
    plugins: Object.values(global.plugins || {}).filter(p=>typeof p === 'function' && p.command && !p.disabled).length,
    ai: groq.enabled && groq.configured && global.umiAutoAI?.enabled !== false && config.autoAIEnabled !== false && config.values?.autoAI?.enabled !== false,
    autoread: settings.autoread === true,
    version: String(global.version || 'Tidak tersedia'),
  }
  const fallback = `${info.name}\n${info.type} · ${info.mode}\nUptime proses: ${uptime}\nPlugin command: ${info.plugins}\nPrefix: ${usedPrefix}\nMenu: ${usedPrefix}menu`
  return sendRichInfo(conn,m,botInfoHtml(info,usedPrefix),'UMI · INFO BOT',fallback)
}
handler.help = ['statusbot', 'botinfo', 'infobot', 'runtime', 'alive']
handler.tags = ['info']
handler.command = /^(statusbot|botinfo|infobot|runtime|alive)$/i
handler.description = 'Kartu rich HTML informasi bot, runtime proses, prefix dan status sesi langsung di WhatsApp'
export default handler
