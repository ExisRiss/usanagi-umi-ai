/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'

const ENCHANTABLE = {
  sword: { name: '⚔️ Pedang', stat: 'attack', bonus: 5, cost: 500, successRate: 70 },
  shield: { name: '🛡️ Perisai', stat: 'defense', bonus: 4, cost: 500, successRate: 70 },
  armor: { name: '🦺 Armor', stat: 'health', bonus: 20, cost: 800, successRate: 60 },
  helmet: { name: '⛑️ Helm', stat: 'defense', bonus: 3, cost: 400, successRate: 75 },
  bow: { name: '🏹 Busur', stat: 'attack', bonus: 4, cost: 450, successRate: 72 },
  goldsword: { name: '🗡️ Pedang Emas', stat: 'attack', bonus: 10, cost: 2000, successRate: 50 },
  diamondarmor: { name: '💎 Armor Berlian', stat: 'health', bonus: 50, cost: 5000, successRate: 40 },
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  const args = m.args || []
  const itemName = args[0]?.toLowerCase()

  if (!itemName) {
    let txt = `✨ *Enchant - Upgrade Equipment*\n\n`
    for (const [key, item] of Object.entries(ENCHANTABLE)) {
      const level = user.rpg.enchants[key] || 0
      txt += `${item.name} — Level ${level}/10\n`
      txt += `+${item.bonus} ${item.stat} | ${rupiah(item.cost)} | Rate ${item.successRate}%\n`
      txt += `→ \`${m.prefix}enchant ${key}\`\n\n`
    }
    return m.reply(txt)
  }

  const item = ENCHANTABLE[itemName]
  if (!item) {
    return m.reply(`Item tidak bisa di-enchant. Ketik \`${m.prefix}enchant\` untuk lihat daftar.`)
  }

  if ((user.inventory[itemName] || 0) < 1) {
    return m.reply(`Kamu tidak punya *${item.name}*.`)
  }

  const currentLevel = user.rpg.enchants[itemName] || 0
  if (currentLevel >= 10) {
    return m.reply(`*${item.name}* sudah level maksimum (10).`)
  }

  const cost = item.cost * (currentLevel + 1)
  if (user.koin < cost) {
    return m.reply(`Koin kurang. Butuh ${rupiah(cost)}, koin kamu ${rupiah(user.koin)}.`)
  }

  if (await enforceCooldown(m, 'enchant', 120_000)) return

  user.koin -= cost

  await m.react('✨')
  await m.reply(`✨ Meng-enchant *${item.name}*... Level ${currentLevel} → ${currentLevel + 1}`)
  await new Promise((r) => setTimeout(r, 2000))

  const adjustedRate = Math.max(20, item.successRate - currentLevel * 5)
  const isSuccess = Math.random() * 100 < adjustedRate

  if (isSuccess) {
    user.rpg.enchants[itemName] = currentLevel + 1
    user.rpg[item.stat] = (user.rpg[item.stat] || 0) + item.bonus
    saveUser(m.sender, user)

    await addExpWithLevelCheck(sock, m, user, 150)

    await m.react('🎉')
    return m.rpgResult(
      `🎉 *Enchant Berhasil*\n\n📦 ${item.name}\n📊 Level: ${currentLevel} → ${currentLevel + 1}\n💪 Bonus: +${item.bonus} ${item.stat}\n💰 Biaya: -${rupiah(cost)}\n✨ EXP: +150`
    )
  }

  saveUser(m.sender, user)

  await m.react('💔')
  return m.rpgResult(
    `💔 *Enchant Gagal*\n\n📦 ${item.name}\n📊 Level tetap: ${currentLevel}\n💰 Biaya hangus: -${rupiah(cost)}\n\n💡 Rate saat ini: ${adjustedRate}%`
  )
}

handler.command = /^enchant$/i
handler.help = ['enchant', 'upgrade', 'enhance', 'tingkatkan']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Upgrade equipment dengan enchantment'

export default handler
