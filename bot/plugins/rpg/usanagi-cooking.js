
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const RECIPES = {
  bread: { name: '🍞 Roti', materials: { wheat: 2 }, effect: { stamina: 10, health: 5 }, exp: 30 },
  friedrice: { name: '🍚 Nasi Goreng', materials: { rice: 2, egg: 1 }, effect: { stamina: 25, health: 15 }, exp: 60 },
  steak: { name: '🥩 Steak', materials: { meat: 2, herb: 1 }, effect: { stamina: 40, health: 30 }, exp: 100 },
  soup: { name: '🍲 Sup', materials: { carrot: 2, potato: 2, meat: 1 }, effect: { stamina: 35, health: 40 }, exp: 90 },
  sushi: { name: '🍣 Sushi', materials: { fish: 3, rice: 2 }, effect: { stamina: 30, health: 25 }, exp: 80 },
  cake: { name: '🍰 Kue', materials: { wheat: 3, egg: 2, strawberry: 2 }, effect: { stamina: 50, health: 20 }, exp: 120 },
  ramen: { name: '🍜 Ramen', materials: { wheat: 2, egg: 1, meat: 1, herb: 1 }, effect: { stamina: 45, health: 35 }, exp: 110 },
  pizza: { name: '🍕 Pizza', materials: { wheat: 3, tomato: 2, meat: 2 }, effect: { stamina: 60, health: 30 }, exp: 140 },
  smoothie: { name: '🥤 Smoothie', materials: { strawberry: 3, watermelon: 1 }, effect: { stamina: 30, mana: 20 }, exp: 70 },
  elixir_food: { name: '✨ Elixir Food', materials: { herb: 5, diamond: 1, gold: 2 }, effect: { stamina: 100, health: 100, mana: 50 }, exp: 300 },
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  const args = m.args || []
  const recipeName = args[0]?.toLowerCase()

  if (!recipeName) {
    let txt = `👨‍🍳 *Buku Resep Masakan*\n\n`
    for (const [key, recipe] of Object.entries(RECIPES)) {
      const mats = Object.entries(recipe.materials).map(([mat, qty]) => `${qty}x ${mat}`).join(', ')
      const effects = Object.entries(recipe.effect).map(([e, v]) => `+${v} ${e}`).join(', ')
      txt += `*${recipe.name}*\nBahan: ${mats}\nEfek: ${effects}\n→ \`${m.prefix}cooking ${key}\`\n\n`
    }
    return m.reply(txt)
  }

  const recipe = RECIPES[recipeName]
  if (!recipe) {
    return m.reply(`Resep *${recipeName}* tidak ditemukan. Ketik \`${m.prefix}cooking\` untuk lihat daftar.`)
  }

  const missing = []
  for (const [material, needed] of Object.entries(recipe.materials)) {
    const have = user.inventory[material] || 0
    if (have < needed) missing.push(`${material}: ${have}/${needed}`)
  }

  if (missing.length > 0) {
    return m.reply(`Bahan belum cukup untuk *${recipe.name}*:\n${missing.join('\n')}`)
  }

  if (await enforceCooldown(m, 'cooking', 60_000)) return

  await m.react('👨‍🍳')
  await m.reply(`👨‍🍳 Memasak *${recipe.name}*...`)
  await new Promise((r) => setTimeout(r, 3000))

  for (const [material, needed] of Object.entries(recipe.materials)) {
    user.inventory[material] -= needed
    if (user.inventory[material] <= 0) delete user.inventory[material]
  }

  const maxStamina = user.rpg.maxStamina
  const maxHealth = user.rpg.maxHealth
  const maxMana = user.rpg.maxMana

  if (recipe.effect.stamina) user.rpg.stamina = Math.min(maxStamina, user.rpg.stamina + recipe.effect.stamina)
  if (recipe.effect.health) user.rpg.health = Math.min(maxHealth, user.rpg.health + recipe.effect.health)
  if (recipe.effect.mana) user.rpg.mana = Math.min(maxMana, user.rpg.mana + recipe.effect.mana)

  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, recipe.exp)

  await m.react('✅')

  const effectTexts = Object.entries(recipe.effect).map(([e, v]) => `${e}: +${v}`).join('\n')

  return sendRpgCard(sock, m, { type: 'cooking', headerTitle: 'COOKING', headerSubtitle: recipe.name, data: { title: 'RECIPE COMPLETE', subtitle: recipe.name, result: effectTexts.replace(/\n/g, ' · '), victory: true, stats: [...Object.entries(recipe.effect).map(([e,v]) => ({ label: e.toUpperCase(), value: `+${v}`, color: '#e0c17b' })), { label: 'EXP', value: `+${recipe.exp}`, color: '#9bd8ea' }].slice(0, 6) }, body: `${recipe.name} · ${effectTexts.replace(/\n/g, ' · ')} · EXP +${recipe.exp}` })
}

handler.command = /^cooking$/i
handler.help = ['cooking', 'chef']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Memasak resep untuk stamina, HP, dan mana'

export default handler
