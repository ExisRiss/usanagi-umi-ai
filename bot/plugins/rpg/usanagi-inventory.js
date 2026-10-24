
import { getUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { CATEGORIES, getItemInfo } from '../../lib/rpg/awang-item.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)

  const items = []
  for (const categoryItems of Object.values(CATEGORIES)) {
    for (const [key, info] of Object.entries(categoryItems)) {
      const count = user.inventory[key] || 0
      if (count > 0) items.push({ key, name: info.name.replace(/^[^\p{L}\p{N}]+/u, ''), count })
    }
  }

  const knownItems = new Set(Object.values(CATEGORIES).flatMap((category) => Object.keys(category)))
  for (const [key, count] of Object.entries(user.inventory)) {
    if (count > 0 && !knownItems.has(key)) {
      const info = getItemInfo(key)
      items.push({ key, name: info.name.replace(/^[^\p{L}\p{N}]+/u, ''), count })
    }
  }

  const visibleItems = items.slice(0, 12)
  const body = items.length
    ? `${items.length > visibleItems.length ? `${items.length - visibleItems.length} item lainnya tidak ditampilkan di kartu.\n` : ''}Gunakan ${m.prefix}use <item> untuk memakai barang.`
    : 'Tas masih kosong. Coba mainkan fitur RPG lain untuk mendapatkan item.'

  return sendRpgCard(sock, m, {
    type: 'inventory',
    headerTitle: 'INVENTORY',
    headerSubtitle: `${items.length} item tersimpan`,
    data: {
      title: m.pushName || 'Player',
      name: m.pushName || 'Player',
      koin: user.koin,
      health: user.rpg.health,
      maxHealth: user.rpg.maxHealth,
      items: visibleItems,
    },
    body,
  })
}

handler.command = /^(inventory|inv|tas|bag)$/i
handler.help = ['inventory', 'inv', 'tas', 'bag']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Melihat isi inventory RPG'

export default handler
