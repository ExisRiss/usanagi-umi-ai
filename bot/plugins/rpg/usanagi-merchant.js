
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { trackQuestProgress } from '../../lib/rpg/awang-quest.js'

const SHOP_ITEMS = {
  potion: { name: '🧪 Potion', buyPrice: 100, sellPrice: 50, desc: 'Pulihkan 50 HP' },
  manapotion: { name: '💙 Mana Potion', buyPrice: 150, sellPrice: 75, desc: 'Pulihkan 50 Mana' },
  antidote: { name: '💊 Antidote', buyPrice: 80, sellPrice: 40, desc: 'Sembuhkan racun' },
  bread: { name: '🍞 Roti', buyPrice: 30, sellPrice: 15, desc: 'Pulihkan 10 stamina' },
  energydrink: { name: '⚡ Energy Drink', buyPrice: 200, sellPrice: 100, desc: 'Pulihkan 50 stamina' },
  pickaxe: { name: '⛏️ Beliung', buyPrice: 500, sellPrice: 250, desc: 'Untuk mining' },
  fishingrod: { name: '🎣 Joran', buyPrice: 400, sellPrice: 200, desc: 'Untuk memancing' },
  wood: { name: '🪵 Kayu', buyPrice: 50, sellPrice: 25, desc: 'Material dasar' },
  iron: { name: '🔩 Besi', buyPrice: 80, sellPrice: 40, desc: 'Material logam' },
  leather: { name: '🧶 Kulit', buyPrice: 60, sellPrice: 30, desc: 'Material armor' },
  string: { name: '🧵 Benang', buyPrice: 40, sellPrice: 20, desc: 'Material busur' },
  herb: { name: '🌿 Herba', buyPrice: 70, sellPrice: 35, desc: 'Bahan alchemy' },
  gold: { name: '🪙 Emas', buyPrice: 500, sellPrice: 250, desc: 'Material langka' },
  diamond: { name: '💎 Berlian', buyPrice: 2000, sellPrice: 1000, desc: 'Material mewah' },
}

const handler = async (rawM, tools) => {
  const { m } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  const args = m.args || []
  const action = args[0]?.toLowerCase()
  const itemKey = args[1]?.toLowerCase()
  const qty = Math.max(1, parseInt(args[2]) || 1)

  if (!action || !['buy', 'sell', 'list'].includes(action)) {
    let txt = `🏪 *Merchant Shop*\n\n`
    txt += `\`${m.prefix}merchant list\`\n`
    txt += `\`${m.prefix}merchant buy <item> <qty>\`\n`
    txt += `\`${m.prefix}merchant sell <item> <qty>\`\n\n`
    txt += `💰 Koin: *${rupiah(user.koin)}*`
    return m.reply(txt)
  }

  if (action === 'list') {
    let txt = `🏪 *Daftar Item Merchant*\n\n`
    for (const [key, item] of Object.entries(SHOP_ITEMS)) {
      txt += `${item.name} (\`${key}\`)\n`
      txt += `Beli: ${rupiah(item.buyPrice)} | Jual: ${rupiah(item.sellPrice)}\n`
      txt += `${item.desc}\n\n`
    }
    return m.reply(txt)
  }

  if (action === 'buy') {
    if (!itemKey) return m.reply(`Contoh: \`${m.prefix}merchant buy potion 5\``)

    const item = SHOP_ITEMS[itemKey]
    if (!item) return m.reply(`Item tidak ditemukan. Ketik \`${m.prefix}merchant list\`.`)

    const totalCost = item.buyPrice * qty
    if (user.koin < totalCost) {
      return m.reply(`Koin kurang. Harga ${rupiah(totalCost)}, koin kamu ${rupiah(user.koin)}.`)
    }

    user.koin -= totalCost
    user.inventory[itemKey] = (user.inventory[itemKey] || 0) + qty
    saveUser(m.sender, user)

    return m.reply(`Berhasil beli *${item.name} x${qty}*.\nTotal: -${rupiah(totalCost)} | Sisa: ${rupiah(user.koin)}`)
  }

  if (action === 'sell') {
    if (!itemKey) return m.reply(`Contoh: \`${m.prefix}merchant sell iron 10\``)

    const item = SHOP_ITEMS[itemKey]
    if (!item) return m.reply(`Item tidak bisa dijual ke merchant.`)

    const have = user.inventory[itemKey] || 0
    if (have < qty) return m.reply(`Item kurang. Punya ${have}, mau jual ${qty}.`)

    const totalEarn = item.sellPrice * qty
    user.inventory[itemKey] -= qty
    if (user.inventory[itemKey] <= 0) delete user.inventory[itemKey]
    user.koin += totalEarn
  trackQuestProgress(user, 'earn', totalEarn)
    saveUser(m.sender, user)

    return m.reply(`Berhasil jual *${item.name} x${qty}*.\nTotal: +${rupiah(totalEarn)} | Saldo: ${rupiah(user.koin)}`)
  }
}

handler.command = /^merchant$/i
handler.help = ['merchant', 'npc']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Jual beli item ke NPC merchant'

export default handler
