
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { trackQuestProgress } from '../../lib/rpg/awang-quest.js'

const LOCATIONS = [
  { name: 'Perempatan Lampu Merah', min: 3000, max: 10000 },
  { name: 'Warung Kopi', min: 5000, max: 15000 },
  { name: 'Depan Minimarket', min: 4000, max: 12000 },
  { name: 'Kafe', min: 8000, max: 25000 },
  { name: 'Angkringan', min: 2000, max: 8000 },
]

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'ngamen', 120_000)) return

  const user = getUser(m.sender)
  const staminaCost = 10

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${user.rpg.stamina}*. Istirahat dulu ya.`)
  }

  user.rpg.stamina -= staminaCost
  await m.react('🎸')

  const loc = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
  const earning = Math.floor(Math.random() * (loc.max - loc.min + 1)) + loc.min

  await m.reply(`🎸 Ngamen di *${loc.name}*...`)
  await new Promise((r) => setTimeout(r, 3000))

  user.koin += earning
  trackQuestProgress(user, 'earn', earning)
  const expGain = Math.floor(earning / 20)
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, expGain)

  let txt = `🎸 *Hasil Ngamen*\n\n`
  txt += `Lokasi: *${loc.name}*\n`
  txt += `💵 Pendapatan: +${rupiah(earning)}\n📈 EXP: +${expGain}\n⚡ Stamina: -${staminaCost}`

  await m.rpgResult(txt)
}

handler.command = /^ngamen$/i
handler.help = ['ngamen', 'nyanyi', 'konser']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Ngamen di jalanan untuk mencari koin'

export default handler
