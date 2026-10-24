/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah, number } from '../../lib/rpg/awang-format.js'
import { trackQuestProgress } from '../../lib/rpg/awang-quest.js'
import { getBuffValue } from '../../lib/rpg/awang-buff.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const BOSSES = [
  { name: '🐉 Elder Dragon', hp: 500, attack: 50, minLevel: 10, exp: 2000, gold: 5000, drops: ['dragonscale', 'dragonbone'] },
  { name: '👹 Demon Lord', hp: 400, attack: 60, minLevel: 15, exp: 2500, gold: 7000, drops: ['demonsoul', 'cursedgem'] },
  { name: '🧟 Undead King', hp: 350, attack: 45, minLevel: 8, exp: 1500, gold: 4000, drops: ['soulstone', 'ancientbone'] },
  { name: '🦑 Kraken', hp: 600, attack: 40, minLevel: 12, exp: 2200, gold: 6000, drops: ['krakententacle', 'seagem'] },
  { name: '🌋 Volcanic Titan', hp: 700, attack: 55, minLevel: 20, exp: 3000, gold: 10000, drops: ['titancore', 'lava'] },
  { name: '❄️ Frost Queen', hp: 450, attack: 50, minLevel: 18, exp: 2800, gold: 8000, drops: ['frostheart', 'icecrown'] },
  { name: '⚡ Thunder God', hp: 550, attack: 65, minLevel: 25, exp: 4000, gold: 15000, drops: ['thunderstone', 'divinecore'] },
]

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)

  const availableBosses = BOSSES.filter((b) => user.level >= b.minLevel)

  if (availableBosses.length === 0) {
    const lowestBoss = BOSSES.reduce((a, b) => (a.minLevel < b.minLevel ? a : b))
    return m.reply(
      `Level kamu masih terlalu rendah untuk Raid Boss.\n\nLevel sekarang: *${user.level}*\nMinimal dibutuhkan: *${lowestBoss.minLevel}*\n\n💡 Farming EXP dulu lewat \`${m.prefix}mining\` atau \`${m.prefix}fishing\`.`
    )
  }

  const staminaCost = 50
  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${user.rpg.stamina}*.`)
  }

  if (await enforceCooldown(m, 'boss', 600_000)) return

  user.rpg.stamina -= staminaCost
  const boss = availableBosses[Math.floor(Math.random() * availableBosses.length)]
  const cleanBossName = boss.name.replace(/^[^\p{L}\p{N}]+/u, '')

  await m.react('⚔️')
  await m.reply(`Boss ${cleanBossName} muncul. Pertarungan dimulai...`)
  await new Promise((r) => setTimeout(r, 2500))

  const userAttack = user.rpg.attack + user.level * 3 + getBuffValue(user, 'attack')
  const userDefense = user.rpg.defense + user.level * 2 + getBuffValue(user, 'defense')
  const userMaxHp = user.rpg.maxHealth

  let userHp = user.rpg.health
  let bossHp = boss.hp
  let round = 0
  const battleLog = []

  while (userHp > 0 && bossHp > 0 && round < 15) {
    round++

    const playerDmg = Math.max(10, userAttack + Math.floor(Math.random() * 20) - 5)
    const isCrit = Math.random() > 0.9
    const finalDmg = isCrit ? playerDmg * 2 : playerDmg
    bossHp -= finalDmg
    battleLog.push(isCrit ? `💥 Critical Hit! -${finalDmg} HP` : `⚔️ Kamu menyerang: -${finalDmg} HP`)

    if (bossHp <= 0) break

    const bossDmg = Math.max(10, boss.attack - userDefense + Math.floor(Math.random() * 15))
    userHp -= bossDmg
    battleLog.push(`👹 Boss menyerang balik: -${bossDmg} HP`)
  }

  await m.reply(`⚔️ *Pertarungan Sengit*\n\n${battleLog.slice(-6).join('\n')}`)
  await new Promise((r) => setTimeout(r, 1500))

  const isWin = bossHp <= 0

  if (isWin) {
    const expReward = boss.exp + Math.floor(Math.random() * 500)
    const goldReward = boss.gold + Math.floor(Math.random() * 2000)

    user.koin += goldReward

    const droppedItems = []
    for (const drop of boss.drops) {
      if (Math.random() > 0.5) {
        const qty = Math.floor(Math.random() * 3) + 1
        user.inventory[drop] = (user.inventory[drop] || 0) + qty
        droppedItems.push(`${drop} x${qty}`)
      }
    }

    user.rpg.health = Math.max(1, Math.min(userMaxHp, userHp))
    trackQuestProgress(user, 'kill')
    trackQuestProgress(user, 'earn', goldReward)
    saveUser(m.sender, user)
    await addExpWithLevelCheck(sock, m, user, expReward)

      await m.react('🏆')
    return sendRpgCard(sock, m, {
      type: 'boss',
      headerTitle: 'RAID BOSS',
      headerSubtitle: 'Pertarungan selesai',
      data: {
        title: 'VICTORY',
        subtitle: cleanBossName,
        name: cleanBossName,
        boss: cleanBossName,
        status: 'Boss berhasil dikalahkan',
        victory: true,
        damage: Math.max(0, boss.hp - Math.max(0, bossHp)),
        round,
        hp: Math.max(0, userHp),
        maxHp: userMaxHp,
        exp: expReward,
        koin: goldReward,
        loot: droppedItems.length ? droppedItems.join(', ') : 'Tidak ada loot tambahan',
      },
      body: `Boss ${cleanBossName} dikalahkan. EXP +${number(expReward)} · Coin +${rupiah(goldReward)} · HP ${Math.max(0, userHp)}/${userMaxHp}`,
    })
  }

  const goldLoss = Math.floor(user.koin * 0.15)
  user.koin = Math.max(0, user.koin - goldLoss)
  user.rpg.health = Math.max(1, user.rpg.health - 50)
  saveUser(m.sender, user)

  await m.react('💀')
  return sendRpgCard(sock, m, {
    type: 'boss',
    headerTitle: 'RAID BOSS',
    headerSubtitle: 'Pertarungan selesai',
    data: {
      title: 'DEFEAT',
      subtitle: cleanBossName,
      name: cleanBossName,
      boss: cleanBossName,
      status: 'Boss masih bertahan',
      victory: false,
      damage: Math.max(0, boss.hp - Math.max(0, bossHp)),
      round,
      hp: user.rpg.health,
      maxHp: userMaxHp,
      exp: 0,
      koin: 0,
      loot: `Coin -${rupiah(goldLoss)} · HP -50`,
    },
    body: `Kalah dari ${cleanBossName}. Coin -${rupiah(goldLoss)} · HP -50. Tingkatkan level dan senjata dulu.`,
  })
}

handler.command = /^boss$/i
handler.help = ['boss', 'raidboss', 'bigboss']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Melawan boss untuk hadiah besar'

export default handler
