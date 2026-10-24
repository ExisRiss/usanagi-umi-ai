/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { trackQuestProgress } from '../../lib/rpg/awang-quest.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const POTIONS = {
  healthpotion: { name: '❤️ Health Potion', materials: { herb: 3 }, effect: 'Pulihkan 50 HP', exp: 80, result: 'healthpotion' },
  manapotion: { name: '💙 Mana Potion', materials: { herb: 2, flower: 1 }, effect: 'Pulihkan 50 Mana', exp: 90, result: 'manapotion' },
  staminapotion: { name: '⚡ Stamina Potion', materials: { herb: 2, mushroom: 1 }, effect: 'Pulihkan 30 Stamina', exp: 100, result: 'staminapotion' },
  strengthpotion: { name: '💪 Strength Potion', materials: { herb: 3, dragonscale: 1 }, effect: '+20 ATK (5 menit)', exp: 200, result: 'strengthpotion' },
  defensepotion: { name: '🛡️ Defense Potion', materials: { herb: 3, iron: 2 }, effect: '+15 DEF (5 menit)', exp: 180, result: 'defensepotion' },
  luckpotion: { name: '🍀 Luck Potion', materials: { herb: 5, diamond: 1 }, effect: '+30% Drop Rate (10 menit)', exp: 300, result: 'luckpotion' },
  exppotion: { name: '✨ EXP Potion', materials: { herb: 4, gold: 2 }, effect: '+50% EXP (15 menit)', exp: 250, result: 'exppotion' },
  antidote: { name: '💊 Antidote', materials: { herb: 2 }, effect: 'Sembuhkan racun', exp: 50, result: 'antidote' },
  elixir: { name: '🧪 Elixir', materials: { herb: 10, diamond: 2, gold: 5 }, effect: 'Pulihkan semua stats', exp: 500, result: 'elixir' },
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  const args = m.args || []
  const potionName = args[0]?.toLowerCase()

  if (!potionName) {
    let txt = `🧪 *Buku Resep Alchemy*\n\n`
    for (const [key, pot] of Object.entries(POTIONS)) {
      const mats = Object.entries(pot.materials).map(([mat, qty]) => `${qty}x ${mat}`).join(', ')
      txt += `*${pot.name}*\nBahan: ${mats}\nEfek: ${pot.effect}\n→ \`${m.prefix}alchemy ${key}\`\n\n`
    }
    txt += `💡 Herba bisa didapat dari \`${m.prefix}garden\`.`
    return m.reply(txt)
  }

  const potion = POTIONS[potionName]
  if (!potion) {
    return m.reply(`Resep *${potionName}* tidak ditemukan. Ketik \`${m.prefix}alchemy\` untuk lihat daftar.`)
  }

  if (await enforceCooldown(m, 'alchemy', 60_000)) return

  const missing = []
  for (const [material, needed] of Object.entries(potion.materials)) {
    const have = user.inventory[material] || 0
    if (have < needed) missing.push(`${material}: ${have}/${needed}`)
  }

  if (missing.length > 0) {
    return m.reply(`Bahan belum cukup untuk *${potion.name}*:\n${missing.join('\n')}`)
  }

  await m.react('🧪')
  await m.reply(`🧪 Meracik *${potion.name}*...`)
  await new Promise((r) => setTimeout(r, 3000))

  for (const [material, needed] of Object.entries(potion.materials)) {
    user.inventory[material] -= needed
    if (user.inventory[material] <= 0) delete user.inventory[material]
  }

  user.inventory[potion.result] = (user.inventory[potion.result] || 0) + 1
  trackQuestProgress(user, 'craft')
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, potion.exp)

  await m.react('✅')
  return sendRpgCard(sock, m, { type: 'alchemy', headerTitle: 'ALCHEMY', headerSubtitle: potion.name, data: { title: 'BREW COMPLETE', subtitle: potion.name, result: potion.effect, victory: true, stats: [{ label: 'Potion', value: potion.name, color: '#b9a6f2' }, { label: 'EXP', value: `+${potion.exp}`, color: '#9bd8ea' }] }, body: `${potion.name} · ${potion.effect} · EXP +${potion.exp}` })
}

handler.command = /^alchemy$/i
handler.help = ['alchemy', 'potion', 'brew', 'ramuan']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Membuat potion dan ramuan dari herba'

export default handler
