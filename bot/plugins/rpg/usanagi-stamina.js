/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { rupiah } from '../../lib/rpg/awang-format.js'

const REGEN_PER_HOUR = 5

function createStaminaBar(current, max) {
  const filled = Math.round((current / max) * 10)
  return '█'.repeat(filled) + '░'.repeat(10 - filled)
}

const handler = async (rawM, tools) => {
  const { m } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)

  const args = m.args || []
  const subCmd = args[0]?.toLowerCase()

  if (subCmd === 'isi' || subCmd === 'restore' || subCmd === 'heal') {
    const potionCost = 5000

    if (user.rpg.stamina >= user.rpg.maxStamina) {
      saveUser(m.sender, user)
      return m.reply(`⚡ Stamina kamu sudah penuh.`)
    }

    if (user.koin < potionCost) {
      saveUser(m.sender, user)
      return m.reply(`Koin tidak cukup. Biaya: ${rupiah(potionCost)}, koin kamu: ${rupiah(user.koin)}.`)
    }

    user.koin -= potionCost
    const restored = user.rpg.maxStamina - user.rpg.stamina
    user.rpg.stamina = user.rpg.maxStamina
    saveUser(m.sender, user)

    await m.react('⚡')
    return m.reply(`⚡ *Stamina Diisi*\n\n+${restored} stamina | -${rupiah(potionCost)}\nSekarang: ${user.rpg.stamina}/${user.rpg.maxStamina}`)
  }

  saveUser(m.sender, user)
  const bar = createStaminaBar(user.rpg.stamina, user.rpg.maxStamina)

  let txt = `⚡ *Status Stamina*\n\n`
  txt += `${user.rpg.stamina}/${user.rpg.maxStamina}\n[${bar}]\n\n`
  txt += `Isi stamina: \`${m.prefix}stamina isi\` (Rp 5.000)\n`
  txt += `Stamina pulih pasif seiring waktu (+${REGEN_PER_HOUR}/jam).`

  await m.reply(txt)
}

handler.command = /^(stamina|energy|cekstamina)$/i
handler.help = ['stamina', 'energy', 'cekstamina']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Cek dan memulihkan stamina'

export default handler
