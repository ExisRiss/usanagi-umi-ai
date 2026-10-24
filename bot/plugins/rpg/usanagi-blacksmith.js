/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const RECIPES = {
  sword: { materials: { iron: 3, wood: 2 }, result: 'sword', name: '⚔️ Pedang Besi', exp: 200 },
  shield: { materials: { iron: 4, leather: 2 }, result: 'shield', name: '🛡️ Perisai Besi', exp: 250 },
  helmet: { materials: { iron: 2, leather: 1 }, result: 'helmet', name: '⛑️ Helm Besi', exp: 150 },
  armor: { materials: { iron: 5, leather: 3 }, result: 'armor', name: '🦺 Armor Besi', exp: 350 },
  axe: { materials: { iron: 2, wood: 3 }, result: 'axe', name: '🪓 Kapak Besi', exp: 180 },
  pickaxe: { materials: { iron: 3, wood: 2 }, result: 'pickaxe', name: '⛏️ Beliung', exp: 180 },
  bow: { materials: { wood: 4, string: 2 }, result: 'bow', name: '🏹 Busur', exp: 200 },
  arrow: { materials: { wood: 1, iron: 1 }, result: 'arrow', name: '🏹 Anak Panah x10', exp: 50, qty: 10 },
  goldsword: { materials: { gold: 5, diamond: 2, iron: 3 }, result: 'goldsword', name: '🗡️ Pedang Emas', exp: 500 },
  diamondarmor: { materials: { diamond: 8, iron: 5, leather: 3 }, result: 'diamondarmor', name: '💎 Armor Berlian', exp: 800 },
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  const args = m.args || []
  const itemName = args[0]?.toLowerCase()

  if (!itemName) {
    let txt = `🔨 *Pandai Besi*\n\n`
    for (const [key, recipe] of Object.entries(RECIPES)) {
      const mats = Object.entries(recipe.materials).map(([mat, qty]) => `${qty}x ${mat}`).join(', ')
      txt += `*${recipe.name}*\nBahan: ${mats} | EXP: +${recipe.exp}\n→ \`${m.prefix}blacksmith ${key}\`\n\n`
    }
    txt += `💡 Material bisa dicari lewat \`${m.prefix}mining\` atau \`${m.prefix}hunt\`.`
    return m.reply(txt)
  }

  const recipe = RECIPES[itemName]
  if (!recipe) {
    return m.reply(`Resep *${itemName}* tidak ditemukan. Ketik \`${m.prefix}blacksmith\` untuk lihat daftar.`)
  }

  if (await enforceCooldown(m, 'blacksmith', 120_000)) return

  const missing = []
  for (const [material, needed] of Object.entries(recipe.materials)) {
    const have = user.inventory[material] || 0
    if (have < needed) missing.push(`${material}: ${have}/${needed}`)
  }

  if (missing.length > 0) {
    return m.reply(`Bahan belum cukup untuk *${recipe.name}*:\n${missing.join('\n')}`)
  }

  await m.react('🔨')
  await m.reply(`🔨 Menempa *${recipe.name}*...`)
  await new Promise((r) => setTimeout(r, 4000))

  for (const [material, needed] of Object.entries(recipe.materials)) {
    user.inventory[material] -= needed
    if (user.inventory[material] <= 0) delete user.inventory[material]
  }

  const resultQty = recipe.qty || 1
  user.inventory[recipe.result] = (user.inventory[recipe.result] || 0) + resultQty
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, recipe.exp)

  await m.react('✅')
  return sendRpgCard(sock, m, { type: 'blacksmith', headerTitle: 'BLACKSMITH', headerSubtitle: recipe.name, data: { title: 'FORGE COMPLETE', subtitle: recipe.name, result: `+${resultQty} item`, victory: true, stats: [{ label: 'Output', value: `x${resultQty}`, color: '#e0c17b' }, { label: 'EXP', value: `+${recipe.exp}`, color: '#9bd8ea' }] }, body: `${recipe.name} x${resultQty} · EXP +${recipe.exp}` })
}

handler.command = /^blacksmith$/i
handler.help = ['blacksmith', 'tempa', 'forge', 'pandai']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Menempa senjata dan armor dari material'

export default handler
