/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const RECIPES = {
  sword: { name: '⚔️ Iron Sword', materials: { iron: 5, coal: 3 }, result: 'sword', bonus: { attack: 10 } },
  armor: { name: '🛡️ Iron Armor', materials: { iron: 10, coal: 5 }, result: 'armor', bonus: { defense: 15 } },
  pickaxe: { name: '⛏️ Diamond Pickaxe', materials: { diamond: 3, iron: 2 }, result: 'pickaxe', bonus: { mining: 20 } },
  rod: { name: '🎣 Golden Rod', materials: { gold: 5, iron: 2 }, result: 'rod', bonus: { fishing: 20 } },
  potion: { name: '🥤 Health Potion', materials: { fish: 3, rabbit: 2 }, result: 'potion', qty: 2 },
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  const args = m.args || []
  const itemKey = args[0]?.toLowerCase()

  if (!itemKey) {
    let txt = `🛠️ *Daftar Resep Crafting*\n\n`
    for (const [key, recipe] of Object.entries(RECIPES)) {
      txt += `*${recipe.name}*\n`
      for (const [mat, qty] of Object.entries(recipe.materials)) {
        const userHas = user.inventory[mat] || 0
        txt += `${userHas >= qty ? '✅' : '❌'} ${mat}: ${userHas}/${qty}\n`
      }
      txt += `→ \`${m.prefix}craft ${key}\`\n\n`
    }
    return m.reply(txt)
  }

  const recipe = RECIPES[itemKey]
  if (!recipe) {
    return m.reply(`Resep *${itemKey}* tidak ditemukan. Ketik \`${m.prefix}craft\` untuk lihat daftar.`)
  }

  if (await enforceCooldown(m, 'craft', 30_000)) return

  const missing = []
  for (const [mat, qty] of Object.entries(recipe.materials)) {
    if ((user.inventory[mat] || 0) < qty) {
      missing.push(`${mat}: ${user.inventory[mat] || 0}/${qty}`)
    }
  }

  if (missing.length > 0) {
    return m.reply(`Bahan belum cukup untuk *${recipe.name}*:\n${missing.join('\n')}`)
  }

  await m.react('🛠️')
  await m.reply(`🛠️ Merakit *${recipe.name}*...`)
  await new Promise((r) => setTimeout(r, 2000))

  for (const [mat, qty] of Object.entries(recipe.materials)) {
    user.inventory[mat] -= qty
    if (user.inventory[mat] <= 0) delete user.inventory[mat]
  }

  const resultQty = recipe.qty || 1
  user.inventory[recipe.result] = (user.inventory[recipe.result] || 0) + resultQty

  if (recipe.bonus) {
    for (const [stat, value] of Object.entries(recipe.bonus)) {
      user.rpg[stat] = (user.rpg[stat] || 0) + value
    }
  }

  saveUser(m.sender, user)

  await m.react('✅')
  let txt = `🛠️ *Berhasil Dirakit*\n\n📦 ${recipe.name} x${resultQty}\n`
  if (recipe.bonus) {
    for (const [stat, value] of Object.entries(recipe.bonus)) {
      txt += `📈 ${stat}: +${value}\n`
    }
  }

  return sendRpgCard(sock, m, { type: 'craft', headerTitle: 'CRAFT', headerSubtitle: recipe.name, data: { title: 'CRAFT COMPLETE', subtitle: recipe.name, result: `x${resultQty}`, victory: true, stats: [{ label: 'Output', value: `x${resultQty}`, color: '#b9a6f2' }, ...Object.entries(recipe.bonus || {}).map(([stat, value]) => ({ label: stat.toUpperCase(), value: `+${value}`, color: '#9bd8ea' }))].slice(0, 6) }, body: txt.replace(/\n/g, ' · ').replace(/🛠️ /g, '') })
}

handler.command = /^craft$/i
handler.help = ['craft', 'buat', 'create']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Membuat item dari material'

export default handler
