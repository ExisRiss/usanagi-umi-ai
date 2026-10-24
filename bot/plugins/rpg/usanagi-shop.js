/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const ITEMS = {
  potion: { price: 500, type: 'buyable', name: '🥤 Health Potion' },
  mpotion: { price: 500, type: 'buyable', name: '🧪 Mana Potion' },
  stamina: { price: 1000, type: 'buyable', name: '⚡ Stamina Potion' },

  common: { price: 2000, type: 'buyable', name: '📦 Common Crate' },
  uncommon: { price: 10000, type: 'buyable', name: '🛍️ Uncommon Crate' },
  mythic: { price: 50000, type: 'buyable', name: '🎁 Mythic Crate' },
  legendary: { price: 200000, type: 'buyable', name: '💎 Legendary Crate' },

  wheat: { price: 50, type: 'buyable', name: '🌾 Gandum' },
  rice: { price: 50, type: 'buyable', name: '🍚 Beras' },
  egg: { price: 100, type: 'buyable', name: '🥚 Telur' },
  meat: { price: 300, type: 'buyable', name: '🥩 Daging' },
  herb: { price: 150, type: 'buyable', name: '🌿 Herba' },
  carrot: { price: 50, type: 'buyable', name: '🥕 Wortel' },
  potato: { price: 50, type: 'buyable', name: '🥔 Kentang' },
  strawberry: { price: 80, type: 'buyable', name: '🍓 Stroberi' },
  watermelon: { price: 100, type: 'buyable', name: '🍉 Semangka' },
  apple: { price: 50, type: 'buyable', name: '🍎 Apel' },

  rock: { price: 20, type: 'sellable', name: '🪨 Batu' },
  coal: { price: 50, type: 'sellable', name: '⚫ Batubara' },
  iron: { price: 200, type: 'sellable', name: '⛓️ Besi' },
  gold: { price: 1000, type: 'sellable', name: '🥇 Emas' },
  diamond: { price: 5000, type: 'sellable', name: '💠 Berlian' },
  emerald: { price: 10000, type: 'sellable', name: '💚 Emerald' },

  trash: { price: 10, type: 'sellable', name: '🗑️ Sampah' },
  fish: { price: 100, type: 'sellable', name: '🐟 Ikan' },
  prawn: { price: 200, type: 'sellable', name: '🦐 Udang' },
  octopus: { price: 500, type: 'sellable', name: '🐙 Gurita' },
  shark: { price: 2000, type: 'sellable', name: '🦈 Hiu' },
  whale: { price: 10000, type: 'sellable', name: '🐳 Paus' },

  leather: { price: 50, type: 'sellable', name: '👞 Kulit' },
  mysterybox: { price: 1500, type: 'sellable', name: '📦 Mystery Box' },
  kunai: { price: 100, type: 'sellable', name: '🗡️ Kunai' },
  shuriken: { price: 150, type: 'sellable', name: '⚔️ Shuriken' },
  chakra: { price: 500, type: 'sellable', name: '🌀 Chakra' },
  scroll: { price: 2000, type: 'sellable', name: '📜 Scroll Ninja' },
  bowlramen: { price: 800, type: 'sellable', name: '🍜 Ramen' },
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  const args = m.args || []
  const action = args[0]?.toLowerCase()

  if (!action || (action !== 'buy' && action !== 'sell')) {
    const items = Object.entries(ITEMS)
      .filter(([, item]) => item.type === 'buyable')
      .slice(0, 8)
      .map(([key, item]) => ({ key, name: item.name.replace(/^[^\p{L}\p{N}]+/u, ''), price: item.price }))
    return sendRpgCard(sock, m, {
      type: 'shop',
      headerTitle: 'RPG SHOP',
      headerSubtitle: `${items.length} item pilihan`,
      data: { title: 'TOKO RPG', name: 'Toko RPG', items },
      body: `Beli: ${m.prefix}shop buy <nama> <jumlah>\nJual: ${m.prefix}shop sell <nama> <jumlah>`,
    })
  }

  const itemKey = args[1]?.toLowerCase()
  const amount = args[2] === undefined ? 1 : Number(args[2])
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > 1000) {
    return m.reply('Jumlah harus bilangan bulat 1–1000.')
  }
  const item = ITEMS[itemKey]

  if (!itemKey || !item) {
    return m.reply(`Barang *${args[1] || 'itu'}* tidak ada di daftar. Cek \`${m.prefix}shop\` dulu ya.`)
  }

  if (action === 'buy') {
    if (item.type !== 'buyable') {
      return m.reply(`*${item.name}* cuma bisa dijual, bukan dibeli.`)
    }

    const totalCost = item.price * amount
    if (user.koin < totalCost) {
      return m.reply(`Koin kamu kurang. Butuh ${rupiah(totalCost)}, koin kamu ${rupiah(user.koin)}.`)
    }

    user.koin -= totalCost
    user.inventory[itemKey] = (user.inventory[itemKey] || 0) + amount
    saveUser(m.sender, user)

    return sendRpgCard(sock, m, {
      type: 'shop',
      headerTitle: 'RPG SHOP',
      headerSubtitle: 'Transaksi berhasil',
      data: { title: 'PURCHASE', name: item.name.replace(/^[^\p{L}\p{N}]+/u, ''), items: [{ key: itemKey, name: item.name.replace(/^[^\p{L}\p{N}]+/u, ''), price: totalCost, amount }] },
      body: `Berhasil membeli ${amount}x ${item.name.replace(/^[^\p{L}\p{N}]+/u, '')}. Total bayar ${rupiah(totalCost)}.`,
    })
  }

  if (action === 'sell') {
    if (item.type !== 'sellable') {
      return m.reply(`Toko tidak menerima *${item.name}*.`)
    }

    const stock = user.inventory[itemKey] || 0
    if (stock < amount) {
      return m.reply(`Kamu cuma punya *${stock}x ${item.name}*, tidak cukup untuk jual *${amount}*.`)
    }

    const totalProfit = item.price * amount
    user.inventory[itemKey] = stock - amount
    if (user.inventory[itemKey] <= 0) delete user.inventory[itemKey]
    user.koin += totalProfit
    saveUser(m.sender, user)

    return sendRpgCard(sock, m, {
      type: 'shop',
      headerTitle: 'RPG SHOP',
      headerSubtitle: 'Transaksi berhasil',
      data: { title: 'SALE', name: item.name.replace(/^[^\p{L}\p{N}]+/u, ''), items: [{ key: itemKey, name: item.name.replace(/^[^\p{L}\p{N}]+/u, ''), price: totalProfit, amount }] },
      body: `Berhasil menjual ${amount}x ${item.name.replace(/^[^\p{L}\p{N}]+/u, '')}. Total diterima ${rupiah(totalProfit)}.`,
    })
  }
}

handler.command = /^(shop|beli|jual|toko|store)$/i
handler.help = ['shop', 'beli', 'jual', 'toko', 'store']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Beli dan jual item RPG'

export default handler
