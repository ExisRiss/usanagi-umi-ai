
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'

const TARGETS = [
  { name: 'Petani Lengah', difficulty: 1, minGold: 50, maxGold: 150, catchChance: 10 },
  { name: 'Pedagang Keliling', difficulty: 2, minGold: 100, maxGold: 300, catchChance: 20 },
  { name: 'Penyihir Tua', difficulty: 3, minGold: 200, maxGold: 500, catchChance: 30 },
  { name: 'Ksatria Kerajaan', difficulty: 4, minGold: 300, maxGold: 800, catchChance: 40 },
  { name: 'Bangsawan Sombong', difficulty: 5, minGold: 500, maxGold: 1500, catchChance: 50 },
  { name: 'Raja Tiran', difficulty: 6, minGold: 1000, maxGold: 3000, catchChance: 60 },
]

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'steal', 300_000)) return

  const user = getUser(m.sender)
  const staminaCost = 15

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${user.rpg.stamina}*.`)
  }

  user.rpg.stamina -= staminaCost

  const userLevel = user.level || 1
  const availableTargets = TARGETS.filter((t) => userLevel >= t.difficulty * 3)

  if (availableTargets.length === 0) {
    saveUser(m.sender, user)
    return m.reply(`Level kamu masih terlalu rendah (Level ${userLevel}). Target termudah butuh minimal *Level 3*.`)
  }

  const target = availableTargets[Math.floor(Math.random() * availableTargets.length)]

  await m.react('🥷')
  await m.reply(`🥷 Mengendap-endap menuju rumah *${target.name}*...`)
  await new Promise((r) => setTimeout(r, 2500))

  const luckBonus = (user.rpg.luck || 5) * 2
  const adjustedCatchChance = Math.max(5, target.catchChance - luckBonus)
  const isCaught = Math.random() * 100 < adjustedCatchChance

  if (isCaught) {
    const goldLoss = Math.floor(user.koin * 0.1)
    const healthLoss = 10 + target.difficulty * 5

    user.koin = Math.max(0, user.koin - goldLoss)
    user.rpg.health = Math.max(1, user.rpg.health - healthLoss)
    saveUser(m.sender, user)

    await m.react('💀')
    return m.rpgResult(
      `💀 *Ketahuan!*\n\n${target.name} terbangun dan menghajarmu!\n\n💸 Kehilangan: -${rupiah(goldLoss)}\n❤️ HP: -${healthLoss}\n⚡ Stamina: -${staminaCost}\n\nTips: perbesar stat Luck agar tidak mudah ketahuan.`
    )
  }

  const goldStolen = Math.floor(Math.random() * (target.maxGold - target.minGold)) + target.minGold
  const expReward = 50 + target.difficulty * 30

  user.koin += goldStolen

  let bonusText = ''
  if (Math.random() > 0.7) {
    const items = ['potion', 'key', 'gem', 'ring']
    const item = items[Math.floor(Math.random() * items.length)]
    user.inventory[item] = (user.inventory[item] || 0) + 1
    bonusText = `\n📦 Bonus jarahan: ${item} x1`
  }

  saveUser(m.sender, user)
  await addExpWithLevelCheck(sock, m, user, expReward)

  await m.react('💰')
  await m.rpgResult(
    `💰 *Berhasil!*\n\nBerhasil menjarah rumah ${target.name} tanpa ketahuan!\n\n💵 Emas: +${rupiah(goldStolen)}\n✨ EXP: +${expReward}${bonusText}\n⚡ Stamina: -${staminaCost}`
  )
}

handler.command = /^(steal|mencuri)$/i
handler.help = ['steal', 'mencuri']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Mencuri dari NPC untuk gold'

export default handler
