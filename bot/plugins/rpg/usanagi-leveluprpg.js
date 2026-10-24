
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'

const handler = async (rawM, tools) => {
  const { m } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  const args = m.args || []
  const sub = args[0]?.toLowerCase()

  if (sub === 'on') {
    user.settings.levelupNotif = true
    saveUser(m.sender, user)
    return m.reply(`✅ *Notifikasi Level Up RPG*\n\nStatus: ON\nKamu akan menerima notifikasi saat naik level.`)
  }

  if (sub === 'off') {
    user.settings.levelupNotif = false
    saveUser(m.sender, user)
    return m.reply(`❌ *Notifikasi Level Up RPG*\n\nStatus: OFF\nNotifikasi level up dinonaktifkan.`)
  }

  const status = user.settings.levelupNotif !== false ? 'ON' : 'OFF'
  return m.reply(
    `🔔 *Notifikasi Level Up RPG*\n\nStatus saat ini: ${status}\n\n\`${m.prefix}leveluprpg on\` - Aktifkan\n\`${m.prefix}leveluprpg off\` - Nonaktifkan`
  )
}

handler.command = /^leveluprpg$/i
handler.help = ['leveluprpg', 'lvluprpg', 'rpglevelup']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Toggle notifikasi level up RPG'

export default handler
