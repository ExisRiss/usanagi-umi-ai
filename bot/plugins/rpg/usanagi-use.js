
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { rupiah, number } from '../../lib/rpg/awang-format.js'
import { setTimedBuff } from '../../lib/rpg/awang-buff.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  const args = m.args || []
  const itemKey = args[0]?.toLowerCase()

  if (!itemKey) {
    return m.reply(`🎒 *Use Item*\n\nContoh: \`${m.prefix}use potion\`\nCek inventory: \`${m.prefix}inventory\``)
  }

  const count = user.inventory[itemKey] || 0
  if (count <= 0) {
    return m.reply(`Kamu tidak punya item *${itemKey}*. Cek \`${m.prefix}inventory\`.`)
  }

  let msg = ''
  let expGained = 0

  switch (itemKey) {
    case 'potion':
    case 'healthpotion':
      if (user.rpg.health >= user.rpg.maxHealth) return m.reply(`Health kamu sudah penuh.`)
      user.rpg.health = Math.min(user.rpg.health + 50, user.rpg.maxHealth)
      user.inventory[itemKey]--
      msg = `Kamu minum *Health Potion*.\n❤️ Health sekarang: ${user.rpg.health}/${user.rpg.maxHealth}`
      break

    case 'mpotion':
    case 'manapotion':
      if (user.rpg.mana >= user.rpg.maxMana) return m.reply(`Mana kamu sudah penuh.`)
      user.rpg.mana = Math.min(user.rpg.mana + 50, user.rpg.maxMana)
      user.inventory[itemKey]--
      msg = `Kamu minum *Mana Potion*.\n💧 Mana sekarang: ${user.rpg.mana}/${user.rpg.maxMana}`
      break

    case 'stamina':
    case 'staminapotion':
      if (user.rpg.stamina >= user.rpg.maxStamina) return m.reply(`Stamina kamu sudah penuh.`)
      user.rpg.stamina = Math.min(user.rpg.stamina + 20, user.rpg.maxStamina)
      user.inventory[itemKey]--
      msg = `Kamu minum *Stamina Potion*.\n⚡ Stamina sekarang: ${user.rpg.stamina}/${user.rpg.maxStamina}`
      break

    case 'strengthpotion':
      setTimedBuff(user, 'attack', 20, 300_000)
      user.inventory[itemKey]--
      msg = `Kekuatan meningkat +20 ATK selama 5 menit.`
      break

    case 'defensepotion':
      setTimedBuff(user, 'defense', 15, 300_000)
      user.inventory[itemKey]--
      msg = `Pertahanan meningkat +15 DEF selama 5 menit.`
      break

    case 'luckpotion':
      setTimedBuff(user, 'luck', 30, 600_000)
      user.inventory[itemKey]--
      msg = `Keberuntungan meningkat +30 selama 10 menit.`
      break

    case 'exppotion':
      setTimedBuff(user, 'expPercent', 50, 900_000)
      user.inventory[itemKey]--
      msg = `Bonus EXP +50% aktif selama 15 menit.`
      break

    case 'elixir':
      if (user.rpg.health >= user.rpg.maxHealth && user.rpg.mana >= user.rpg.maxMana && user.rpg.stamina >= user.rpg.maxStamina) return m.reply(`Semua status kamu sudah penuh.`)
      user.rpg.health = user.rpg.maxHealth
      user.rpg.mana = user.rpg.maxMana
      user.rpg.stamina = user.rpg.maxStamina
      user.inventory[itemKey]--
      msg = `Kamu menggunakan *Elixir*. Semua status dipulihkan penuh.`
      break

    case 'antidote':
      user.inventory[itemKey]--
      msg = `Kamu menggunakan *Antidote*. Tidak ada efek negatif aktif yang tersisa.`
      break

    case 'herb':
      if (user.rpg.health >= user.rpg.maxHealth) return m.reply(`Health kamu sudah penuh.`)
      user.rpg.health = Math.min(user.rpg.health + 20, user.rpg.maxHealth)
      user.inventory[itemKey]--
      msg = `Kamu mengunyah *Herba*.\n❤️ Health sekarang: ${user.rpg.health}/${user.rpg.maxHealth}`
      break

    case 'leather':
      user.rpg.attack = (user.rpg.attack || 10) + 3
      user.inventory[itemKey]--
      msg = `Kamu memakai *Kulit* sebagai pelindung.\n⚔️ Attack: +3 (sekarang ${user.rpg.attack})`
      break

    case 'bowlramen':
      if (user.rpg.health >= user.rpg.maxHealth) return m.reply(`Health kamu sudah penuh.`)
      user.rpg.health = Math.min(user.rpg.health + 40, user.rpg.maxHealth)
      user.inventory[itemKey]--
      msg = `Kamu makan semangkuk *Ramen*.\n❤️ Health sekarang: ${user.rpg.health}/${user.rpg.maxHealth}`
      break

    case 'chakra':
      if (user.rpg.stamina >= user.rpg.maxStamina) return m.reply(`Stamina kamu sudah penuh.`)
      user.rpg.stamina = Math.min(user.rpg.stamina + 30, user.rpg.maxStamina)
      user.inventory[itemKey]--
      msg = `Kamu menyerap *Chakra*.\n⚡ Stamina sekarang: ${user.rpg.stamina}/${user.rpg.maxStamina}`
      break

    case 'kunai':
    case 'shuriken':
      user.rpg.attack = (user.rpg.attack || 10) + 2
      user.inventory[itemKey]--
      msg = `Kamu melengkapi diri dengan *${itemKey}*.\n⚔️ Attack: +2 (sekarang ${user.rpg.attack})`
      break

    case 'mysterybox': {
      user.inventory[itemKey]--
      const rewards = [
        { type: 'koin', min: 1000, max: 50000, icon: '💰' },
        { type: 'exp', min: 500, max: 5000, icon: '✨' },
        { type: 'potion', qty: [1, 3], icon: '🥤' },
        { type: 'diamond', qty: [1, 2], icon: '💠' },
      ]
      const pick = rewards[Math.floor(Math.random() * rewards.length)]
      if (pick.type === 'koin') {
        const amount = Math.floor(Math.random() * (pick.max - pick.min)) + pick.min
        user.koin += amount
        msg = `Mystery Box terbuka!\n${pick.icon} Koin: +${rupiah(amount)}`
      } else if (pick.type === 'exp') {
        expGained = Math.floor(Math.random() * (pick.max - pick.min)) + pick.min
        msg = `Mystery Box terbuka!\n${pick.icon} EXP: +${number(expGained)}`
      } else {
        const qty = Math.floor(Math.random() * (pick.qty[1] - pick.qty[0] + 1)) + pick.qty[0]
        user.inventory[pick.type] = (user.inventory[pick.type] || 0) + qty
        msg = `Mystery Box terbuka!\n${pick.icon} ${pick.type}: +${qty}`
      }
      break
    }

    case 'scroll': {
      user.inventory[itemKey]--
      const scrollRewards = [
        { type: 'koin', min: 2000, max: 10000, icon: '💰' },
        { type: 'exp', min: 1000, max: 8000, icon: '✨' },
      ]
      const pick = scrollRewards[Math.floor(Math.random() * scrollRewards.length)]
      if (pick.type === 'koin') {
        const amount = Math.floor(Math.random() * (pick.max - pick.min)) + pick.min
        user.koin += amount
        msg = `Scroll dibaca!\n${pick.icon} Koin: +${rupiah(amount)}`
      } else {
        expGained = Math.floor(Math.random() * (pick.max - pick.min)) + pick.min
        msg = `Scroll dibaca!\n${pick.icon} EXP: +${number(expGained)}`
      }
      break
    }

    case 'common':
    case 'uncommon':
    case 'mythic':
    case 'legendary': {
      user.inventory[itemKey]--
      const isLegendary = itemKey === 'legendary'
      const rewardMoney = Math.floor(Math.random() * (isLegendary ? 100000 : 10000)) + 1000
      expGained = Math.floor(Math.random() * (isLegendary ? 5000 : 500)) + 100
      user.koin += rewardMoney
      msg = `*${itemKey} Crate* terbuka!\n💰 Koin: +${rupiah(rewardMoney)}\n📈 EXP: +${number(expGained)}`
      break
    }

    default:
      return m.reply(`Item *${itemKey}* tidak bisa digunakan langsung.`)
  }

  if (user.inventory[itemKey] !== undefined && user.inventory[itemKey] <= 0) {
    delete user.inventory[itemKey]
  }

  saveUser(m.sender, user)

  if (expGained > 0) {
    await addExpWithLevelCheck(sock, m, user, expGained)
  }

  await m.rpgTextResult(msg)
}

handler.command = /^(use|pake|makan|open)$/i
handler.help = ['use', 'pake', 'makan', 'open']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Menggunakan item consumable atau membuka crate'

export default handler
