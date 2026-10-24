/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'

const handler = async (rawM, tools) => {
  const { m } = buildRpgContext(rawM, tools)

  const user = getUser(m.sender)

  if (user.rpg.health >= user.rpg.maxHealth && user.rpg.stamina >= user.rpg.maxStamina) {
    return m.reply(`Badan kamu masih segar bugar, tidak perlu istirahat.`)
  }

  if (await enforceCooldown(m, 'heal', 600_000)) return

  await m.react('🛌')
  await m.reply('🛌 Tidur sebentar...')
  await new Promise((r) => setTimeout(r, 3000))

  const oldHealth = user.rpg.health
  const oldStamina = user.rpg.stamina

  user.rpg.health = Math.min(user.rpg.health + 30, user.rpg.maxHealth)
  user.rpg.stamina = Math.min(user.rpg.stamina + 50, user.rpg.maxStamina)
  saveUser(m.sender, user)

  let txt = `🛌 *Selesai Istirahat*\n\n`
  txt += `❤️ Health: ${oldHealth} → *${user.rpg.health}*\n`
  txt += `⚡ Stamina: ${oldStamina} → *${user.rpg.stamina}*\n\n`
  txt += `Butuh cepat? Beli potion di \`${m.prefix}shop\` lalu \`${m.prefix}use potion\`.`

  await m.rpgResult(txt)
}

handler.command = /^heal$/i
handler.help = ['heal', 'sembuh', 'recover']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Memulihkan HP dan stamina dengan istirahat gratis'

export default handler
