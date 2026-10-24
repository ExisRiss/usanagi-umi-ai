
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { trackQuestProgress } from '../../lib/rpg/awang-quest.js'

const DROPS = [
  { item: 'botol', name: 'Botol', min: 1, max: 10 },
  { item: 'kaleng', name: 'Kaleng', min: 1, max: 8 },
  { item: 'kardus', name: 'Kardus', min: 1, max: 5 },
  { item: 'sampah', name: 'Sampah', min: 1, max: 15 },
  { item: 'koran', name: 'Koran', min: 0, max: 3 },
]

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'mulung', 300_000)) return

  const user = getUser(m.sender)
  const staminaCost = 15

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${user.rpg.stamina}*. Istirahat dulu ya.`)
  }

  user.rpg.stamina -= staminaCost

  await m.react('🗑️')
  await m.reply('🗑️ Mengorek tempat sampah, semoga dapat barang bagus...')
  await new Promise((r) => setTimeout(r, 3000))

  const results = []
  let moneyEarned = 0

  for (const drop of DROPS) {
    const qty = Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min
    if (qty > 0) {
      user.inventory[drop.item] = (user.inventory[drop.item] || 0) + qty
      results.push({ name: drop.name, qty })
      moneyEarned += qty * (Math.floor(Math.random() * 50) + 10)
    }
  }

  user.koin += moneyEarned
  trackQuestProgress(user, 'earn', moneyEarned)
  const expGain = Math.floor(Math.random() * 200) + 50
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, expGain)

  await m.react('✅')

  let txt = `🗑️ *Hasil Memulung*\n\n`
  for (const r of results) txt += `• ${r.name}: +${r.qty}\n`
  txt += `\nBarang langsung dijual ke pengepul.\n`
  txt += `💵 Hasil: +${rupiah(moneyEarned)}\n📈 EXP: +${expGain}\n⚡ Stamina: -${staminaCost}`

  await m.rpgResult(txt)
}

handler.command = /^mulung$/i
handler.help = ['mulung', 'scavenge', 'kumpulsampah']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Memulung untuk mengumpulkan barang bekas'

export default handler
