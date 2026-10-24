/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'

const CROPS = [
  { item: 'padi', name: 'Padi', chance: 90, min: 2, max: 8, price: 100 },
  { item: 'jagung', name: 'Jagung', chance: 70, min: 1, max: 5, price: 150 },
  { item: 'tomat', name: 'Tomat', chance: 50, min: 1, max: 4, price: 200 },
  { item: 'wortel', name: 'Wortel', chance: 40, min: 1, max: 3, price: 250 },
  { item: 'strawberry', name: 'Strawberry', chance: 20, min: 1, max: 2, price: 500 },
  { item: 'melon', name: 'Melon', chance: 10, min: 1, max: 1, price: 1000 },
]

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'berladang', 180_000)) return

  const user = getUser(m.sender)
  const staminaCost = 20

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${user.rpg.stamina}*. Istirahat dulu ya.`)
  }

  user.rpg.stamina -= staminaCost
  await m.react('🌾')
  await m.reply('🌾 Menyiapkan cangkul dan menyiram tanah...')
  await new Promise((r) => setTimeout(r, 3000))

  const results = []
  let totalValue = 0

  for (const crop of CROPS) {
    if (Math.random() * 100 <= crop.chance) {
      const qty = Math.floor(Math.random() * (crop.max - crop.min + 1)) + crop.min
      user.inventory[crop.item] = (user.inventory[crop.item] || 0) + qty
      const value = qty * crop.price
      totalValue += value
      results.push({ name: crop.name, qty, value })
    }
  }

  if (results.length === 0) {
    user.inventory.padi = (user.inventory.padi || 0) + 1
    results.push({ name: 'Padi', qty: 1, value: 100 })
    totalValue = 100
  }

  const expGain = Math.floor(totalValue / 10) + Math.floor(Math.random() * 100)
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, expGain)

  await m.react('✅')

  let txt = `🌾 *Hasil Panen*\n\n`
  for (const r of results) txt += `• ${r.name}: +${r.qty} (est. ${rupiah(r.value)})\n`
  txt += `\n💰 Total Estimasi: ${rupiah(totalValue)}\n📈 EXP: +${expGain}\n⚡ Stamina: -${staminaCost}\n\n`
  txt += `Jual hasil panen lewat \`${m.prefix}sellall\`.`

  await m.rpgResult(txt)
}

handler.command = /^berladang$/i
handler.help = ['berladang', 'berkebun']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Berladang untuk mendapat hasil panen'

export default handler
