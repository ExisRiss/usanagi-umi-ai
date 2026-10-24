/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { trackQuestProgress } from '../../lib/rpg/awang-quest.js'

const ORDERS = [
  { type: '🍔 Antar Makanan', distance: '2km', min: 5000, max: 15000 },
  { type: '👤 Antar Orang', distance: '5km', min: 10000, max: 25000 },
  { type: '📦 Antar Paket', distance: '3km', min: 8000, max: 20000 },
  { type: '🛒 Belanja', distance: '4km', min: 12000, max: 30000 },
  { type: '👥 Antar Jarak Jauh', distance: '10km', min: 20000, max: 50000 },
]

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'ngojek', 120_000)) return

  const user = getUser(m.sender)
  const staminaCost = 15

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${user.rpg.stamina}*. Istirahat dulu ya.`)
  }

  user.rpg.stamina -= staminaCost
  await m.react('🏍️')

  const order = ORDERS[Math.floor(Math.random() * ORDERS.length)]
  const earning = Math.floor(Math.random() * (order.max - order.min + 1)) + order.min
  const tips = Math.random() > 0.7 ? Math.floor(Math.random() * 5000) + 1000 : 0
  const totalEarning = earning + tips

  await m.reply(`🏍️ Ada orderan *${order.type}* sejauh *${order.distance}*, gas!`)
  await new Promise((r) => setTimeout(r, 3000))

  user.koin += totalEarning
  trackQuestProgress(user, 'earn', totalEarning)
  const expGain = Math.floor(totalEarning / 20)
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, expGain)

  let txt = `🏍️ *Orderan Selesai*\n\n`
  txt += `Tipe: *${order.type}*\n`
  txt += `💵 Tarif: +${rupiah(earning)}\n`
  if (tips > 0) txt += `🎁 Tips: +${rupiah(tips)}\n`
  txt += `📈 EXP: +${expGain}\n⚡ Stamina: -${staminaCost}`

  await m.rpgResult(txt)
}

handler.command = /^ngojek$/i
handler.help = ['ngojek', 'ojek', 'ojol']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Narik ojek online untuk mendapat uang'

export default handler
