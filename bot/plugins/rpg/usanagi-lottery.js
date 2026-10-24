import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'

const GACHA_POOL = [
  { item: 'trash', name: 'Sampah', chance: 30, rarity: 'common' },
  { item: 'wood', name: 'Kayu Bakar', chance: 20, qty: [3, 8], rarity: 'common' },
  { item: 'iron', name: 'Besi Bekas', chance: 15, qty: [2, 5], rarity: 'common' },
  { item: 'gold', name: 'Emas Batangan', chance: 10, qty: [1, 3], rarity: 'uncommon' },
  { item: 'potion', name: 'Ramuan Sakti', chance: 8, qty: [1, 3], rarity: 'uncommon' },
  { item: 'diamond', name: 'Berlian Murni', chance: 5, qty: [1, 2], rarity: 'rare' },
  { item: 'goldchest', name: 'Peti Emas', chance: 3, qty: [1, 1], rarity: 'rare' },
  { item: 'diamondchest', name: 'Peti Berlian', chance: 1.5, qty: [1, 1], rarity: 'epic' },
  { item: 'mysterybox', name: 'Kotak Misteri', chance: 0.8, qty: [1, 1], rarity: 'epic' },
  { item: 'goldsword', name: 'Pedang Emas', chance: 0.3, qty: [1, 1], rarity: 'legendary' },
  { item: 'diamondarmor', name: 'Zirah Berlian', chance: 0.2, qty: [1, 1], rarity: 'legendary' },
  { item: 'divinecore', name: 'Inti Dewa', chance: 0.1, qty: [1, 1], rarity: 'mythic' },
]

const RARITY_ICON = { common: '⚪', uncommon: '🟢', rare: '🔵', epic: '🟣', legendary: '🟡', mythic: '🔴' }
const EXP_BY_RARITY = { common: 10, uncommon: 30, rare: 80, epic: 150, legendary: 300, mythic: 500 }
const GACHA_COST = 500

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)

  const pulls = Math.min(10, Math.max(1, parseInt((m.args || [])[0]) || 1))
  const totalCost = GACHA_COST * pulls

  if (user.koin < totalCost) {
    return m.reply(`💸 Koin kurang. Harga: ${rupiah(GACHA_COST)}/tarikan, total: ${rupiah(totalCost)} (${pulls}x). Koin kamu: ${rupiah(user.koin)}.`)
  }

  if (await enforceCooldown(m, 'lottery', 30_000)) return

  user.koin -= totalCost

  await m.react('🎰')
  await m.reply(`🎁 Menarik *${pulls}x* hadiah gacha...`)
  await new Promise((r) => setTimeout(r, 2500))

  const results = []
  let totalExp = 0

  for (let i = 0; i < pulls; i++) {
    const roll = Math.random() * 100
    let cumulative = 0
    let result = GACHA_POOL[0]

    for (const item of GACHA_POOL) {
      cumulative += item.chance
      if (roll <= cumulative) {
        result = item
        break
      }
    }

    if (result.item !== 'trash') {
      const qty = result.qty ? Math.floor(Math.random() * (result.qty[1] - result.qty[0] + 1)) + result.qty[0] : 1
      user.inventory[result.item] = (user.inventory[result.item] || 0) + qty
      results.push({ ...result, finalQty: qty })
      totalExp += EXP_BY_RARITY[result.rarity] || 10
    } else {
      results.push({ ...result, finalQty: 0 })
    }
  }

  saveUser(m.sender, user)
  await addExpWithLevelCheck(sock, m, user, totalExp)

  const grouped = {}
  for (const r of results) {
    if (!grouped[r.item]) grouped[r.item] = { ...r, count: 0, totalQty: 0 }
    grouped[r.item].count++
    grouped[r.item].totalQty += r.finalQty
  }

  let txt = `🎉 *Hasil Gacha*\n\n`
  txt += `Tarik ${pulls}x | Biaya: ${rupiah(totalCost)}\n\n`

  let hasRare = false
  let hasLegendary = false

  for (const item of Object.values(grouped)) {
    const icon = RARITY_ICON[item.rarity] || '⚪'
    txt += item.item === 'trash' ? `${icon} ${item.name} (x${item.count})\n` : `${icon} ${item.name} x${item.totalQty}\n`

    if (['epic', 'legendary', 'mythic'].includes(item.rarity)) hasRare = true
    if (['legendary', 'mythic'].includes(item.rarity)) hasLegendary = true
  }

  txt += `\n📈 Bonus EXP: +${totalExp}\n`

  if (hasLegendary) txt += `\n🌟 Dapat item legendary!`
  else if (hasRare) txt += `\n✨ Dapat barang langka.`
  else txt += `\n🥲 Kebanyakan barang biasa.`

  await m.react(hasLegendary ? '🌟' : hasRare ? '🎉' : '✅')
  await m.rpgResult(txt, { rpgType: 'lottery', rpgTitle: 'LOTTERY', rpgSubtitle: `${pulls}x Draw`, rpgData: { title: 'LOTTERY RESULT', items: Object.values(grouped).slice(0, 6).map((item) => ({ key: item.item, name: item.name.replace(/^[^\p{L}\p{N}]+/u, ''), amount: item.totalQty || item.count })), pulls, totalCost, totalExp } })
}

handler.command = /^(lottery|gacha|spin|undian)$/i
handler.help = ['lottery', 'gacha', 'spin', 'undian']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Gacha untuk mendapatkan hadiah acak'

export default handler
