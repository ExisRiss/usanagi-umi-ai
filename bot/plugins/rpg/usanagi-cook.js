
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const RECIPES = {
  fish_soup: { name: '🍲 Sup Ikan', materials: { fish: 2 }, heal: 30 },
  grilled_meat: { name: '🍖 Daging Panggang', materials: { rabbit: 1, wood: 1 }, heal: 40 },
  apple_pie: { name: '🥧 Pie Apel', materials: { apple: 3 }, heal: 25 },
  steak: { name: '🥩 Steak', materials: { boar: 1, coal: 1 }, heal: 60 },
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)

  if (user.rpg.health >= user.rpg.maxHealth) {
    return m.reply(`HP kamu sudah penuh, tidak perlu masak dulu.`)
  }

  let cooked = null
  for (const [key, recipe] of Object.entries(RECIPES)) {
    const canCook = Object.entries(recipe.materials).every(([mat, qty]) => (user.inventory[mat] || 0) >= qty)
    if (canCook) {
      cooked = { key, ...recipe }
      break
    }
  }

  if (!cooked) {
    let txt = `🍳 *Dapur*\n\n`
    for (const [, recipe] of Object.entries(RECIPES)) {
      txt += `*${recipe.name}* — Heal +${recipe.heal} HP\n`
      for (const [mat, qty] of Object.entries(recipe.materials)) {
        const has = user.inventory[mat] || 0
        txt += `${has >= qty ? '✅' : '❌'} ${mat}: ${has}/${qty}\n`
      }
      txt += `\n`
    }
    txt += `Bot otomatis memasak resep pertama yang bahannya cukup.`
    return m.reply(txt)
  }

  if (await enforceCooldown(m, 'cook', 60_000)) return

  for (const [mat, qty] of Object.entries(cooked.materials)) {
    user.inventory[mat] -= qty
    if (user.inventory[mat] <= 0) delete user.inventory[mat]
  }

  await m.react('🍳')
  await m.reply(`🍳 Memasak *${cooked.name}*...`)
  await new Promise((r) => setTimeout(r, 3000))

  const oldHealth = user.rpg.health
  user.rpg.health = Math.min(user.rpg.health + cooked.heal, user.rpg.maxHealth)
  saveUser(m.sender, user)

  await m.react('✅')
  return sendRpgCard(sock, m, { type: 'cook', headerTitle: 'COOK', headerSubtitle: cooked.name, data: { title: 'MEAL READY', subtitle: cooked.name, result: `HP ${oldHealth} → ${user.rpg.health}`, victory: true, stats: [{ label: 'HP', value: `+${Math.max(0, user.rpg.health - oldHealth)}`, color: '#98d2b0' }] }, body: `${cooked.name} · HP ${oldHealth} → ${user.rpg.health}` })
}

handler.command = /^cook$/i
handler.help = ['cook', 'masak']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Memasak makanan otomatis untuk menambah health'

export default handler
