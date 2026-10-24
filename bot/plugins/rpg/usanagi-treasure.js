
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const CHEST_TYPES = {
  woodenchest: { name: 'Wooden Chest', minGold: 50, maxGold: 200, expRange: [30, 80], rarity: 'common' },
  ironchest: { name: 'Iron Chest', minGold: 150, maxGold: 500, expRange: [80, 150], rarity: 'uncommon' },
  goldchest: { name: 'Gold Chest', minGold: 400, maxGold: 1200, expRange: [150, 300], rarity: 'rare' },
  diamondchest: { name: 'Diamond Chest', minGold: 1000, maxGold: 3000, expRange: [300, 600], rarity: 'epic' },
  mysterybox: { name: 'Mystery Box', minGold: 500, maxGold: 5000, expRange: [200, 800], rarity: 'legendary' },
}

const LOOT_TABLE = {
  common: [
    { item: 'wood', qty: [3, 8], chance: 40 },
    { item: 'iron', qty: [1, 4], chance: 30 },
    { item: 'herb', qty: [2, 5], chance: 25 },
    { item: 'potion', qty: [1, 2], chance: 20 },
  ],
  uncommon: [
    { item: 'iron', qty: [3, 7], chance: 40 },
    { item: 'gold', qty: [1, 3], chance: 25 },
    { item: 'leather', qty: [2, 5], chance: 30 },
    { item: 'potion', qty: [2, 4], chance: 35 },
  ],
  rare: [
    { item: 'gold', qty: [2, 5], chance: 45 },
    { item: 'diamond', qty: [1, 2], chance: 20 },
    { item: 'manapotion', qty: [1, 3], chance: 30 },
    { item: 'strengthpotion', qty: [1, 1], chance: 15 },
  ],
  epic: [
    { item: 'diamond', qty: [2, 4], chance: 40 },
    { item: 'gold', qty: [5, 10], chance: 50 },
    { item: 'elixir', qty: [1, 1], chance: 15 },
    { item: 'dragonscale', qty: [1, 2], chance: 10 },
  ],
  legendary: [
    { item: 'diamond', qty: [3, 8], chance: 50 },
    { item: 'titancore', qty: [1, 2], chance: 20 },
    { item: 'divinecore', qty: [1, 1], chance: 10 },
    { item: 'elixir', qty: [1, 3], chance: 25 },
    { item: 'goldsword', qty: [1, 1], chance: 5 },
  ],
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  const chestType = (m.args || [])[0]?.toLowerCase()

  const availableChests = Object.entries(CHEST_TYPES).filter(([key]) => (user.inventory[key] || 0) > 0)

  if (!chestType) {
    let txt = `🎁 *Gudang Harta Karun*\n\n`

    if (availableChests.length === 0) {
      txt += `Kamu belum punya peti harta.\n\nCara dapat peti:\n`
      txt += `⚔️ Eksplorasi \`${m.prefix}adventure\`\n👹 Bunuh boss\n🗓️ Selesaikan \`${m.prefix}daily\`/\`${m.prefix}weekly\`\n🛒 Beli di \`${m.prefix}shop\``
    } else {
      for (const [key, chest] of availableChests) {
        txt += `📦 ${chest.name}: *${user.inventory[key]}x* → \`${m.prefix}treasure ${key}\`\n`
      }
    }
    return m.reply(txt)
  }

  const chest = CHEST_TYPES[chestType]
  if (!chest) return m.reply(`Peti *${chestType}* tidak ada.`)
  if ((user.inventory[chestType] || 0) < 1) return m.reply(`Peti *${chest.name}* kamu kosong.`)

  if (await enforceCooldown(m, 'treasure', 30_000)) return

  user.inventory[chestType]--
  if (user.inventory[chestType] <= 0) delete user.inventory[chestType]

  await m.react('🎁')
  await m.reply(`🔓 Membuka *${chest.name}*...`)
  await new Promise((r) => setTimeout(r, 2500))

  const goldReward = Math.floor(Math.random() * (chest.maxGold - chest.minGold)) + chest.minGold
  const expReward = Math.floor(Math.random() * (chest.expRange[1] - chest.expRange[0])) + chest.expRange[0]

  user.koin += goldReward

  const droppedItems = []
  const lootPool = LOOT_TABLE[chest.rarity] || LOOT_TABLE.common

  for (const loot of lootPool) {
    if (Math.random() * 100 < loot.chance) {
      const qty = Math.floor(Math.random() * (loot.qty[1] - loot.qty[0] + 1)) + loot.qty[0]
      user.inventory[loot.item] = (user.inventory[loot.item] || 0) + qty
      droppedItems.push(`${loot.item} x${qty}`)
    }
  }

  saveUser(m.sender, user)
  await addExpWithLevelCheck(sock, m, user, expReward)

  await m.react('✅')

  let txt = `💥 *Peti Terbuka!*\n\n💰 Emas: +${rupiah(goldReward)}\n✨ EXP: +${expReward}\n`
  if (droppedItems.length > 0) {
    txt += `🎒 Loot: ${droppedItems.join(', ')}`
  } else {
    txt += `🎒 Tidak ada loot tambahan.`
  }

  return sendRpgCard(sock, m, { type: 'treasure', headerTitle: 'TREASURE', headerSubtitle: chest.name, data: { title: 'CHEST OPENED', subtitle: chest.name, result: droppedItems.length ? droppedItems.join(' · ') : 'Tidak ada loot tambahan', victory: true, stats: [{ label: 'Gold', value: `+${rupiah(goldReward)}`, color: '#e3c47d' }, { label: 'EXP', value: `+${expReward}`, color: '#9adce9' }, { label: 'Loot', value: String(droppedItems.length), color: '#b9a6ef' }] }, body: `Gold +${rupiah(goldReward)} · EXP +${expReward}${droppedItems.length ? ` · Loot ${droppedItems.join(', ')}` : ''}` })
}

handler.command = /^(treasure|chest|peti|openbox)$/i
handler.help = ['treasure', 'chest', 'peti', 'openbox']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Membuka treasure chest untuk hadiah acak'

export default handler
