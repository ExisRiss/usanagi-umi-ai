/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'

const handler = async (rawM, tools) => {
  const { m } = buildRpgContext(rawM, tools)

  const user = getUser(m.sender)
  const { stamina, health, mana, maxStamina, maxHealth, maxMana } = user.rpg

  if (stamina >= maxStamina && health >= maxHealth && mana >= maxMana) {
    return m.reply(
      `💤 *Sudah Penuh*\n\n⚡ Stamina: ${stamina}/${maxStamina}\n❤️ Health: ${health}/${maxHealth}\n💙 Mana: ${mana}/${maxMana}\n\nKamu sudah dalam kondisi prima.`
    )
  }

  if (await enforceCooldown(m, 'meditation', 600_000)) return

  await m.react('💤')
  await m.reply('💤 Bermeditasi, memulihkan energi...')
  await new Promise((r) => setTimeout(r, 3000))

  const staminaRecovered = Math.min(maxStamina - stamina, 40 + Math.floor(Math.random() * 20))
  const healthRecovered = Math.min(maxHealth - health, 30 + Math.floor(Math.random() * 20))
  const manaRecovered = Math.min(maxMana - mana, 25 + Math.floor(Math.random() * 15))

  user.rpg.stamina = Math.min(maxStamina, stamina + staminaRecovered)
  user.rpg.health = Math.min(maxHealth, health + healthRecovered)
  user.rpg.mana = Math.min(maxMana, mana + manaRecovered)
  saveUser(m.sender, user)

  await m.react('✨')
  await m.rpgResult(
    `✨ *Istirahat Selesai*\n\n⚡ Stamina: +${staminaRecovered} (${user.rpg.stamina}/${maxStamina})\n❤️ Health: +${healthRecovered} (${user.rpg.health}/${maxHealth})\n💙 Mana: +${manaRecovered} (${user.rpg.mana}/${maxMana})`
  )
}

handler.command = /^meditation$/i
handler.help = ['meditation', 'rest', 'istirahat', 'tidur', 'sleep']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Bermeditasi untuk memulihkan HP, mana, dan stamina'

export default handler
