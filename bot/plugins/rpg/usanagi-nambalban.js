
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { trackQuestProgress } from '../../lib/rpg/awang-quest.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'nambalban', 150_000)) return

  const user = getUser(m.sender)
  const staminaCost = 14

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${user.rpg.stamina}*. Istirahat dulu ya.`)
  }

  user.rpg.stamina -= staminaCost
  await m.react('🛠️')
  await m.reply('🛠️ Mengecek ban bocor, ketemu paku menancap...')
  await new Promise((r) => setTimeout(r, 3000))

  const gacha = Math.random()

  if (gacha < 0.15) {
    const healthLoss = 15
    user.rpg.health = Math.max(0, user.rpg.health - healthLoss)
    saveUser(m.sender, user)
    await m.react('💥')
    return m.rpgResult(`💥 *Ban Meledak!*\n\n💔 HP: -${healthLoss}\n⚡ Stamina: -${staminaCost}\n💵 Pendapatan: 0`)
  }

  const earning = Math.floor(Math.random() * 20000) + 10000
  user.koin += earning
  trackQuestProgress(user, 'earn', earning)
  const expGain = Math.floor(earning / 25)
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, expGain)

  await m.react('✅')
  await m.rpgResult(`🛠️ *Hasil Tambal Ban*\n\n💵 Pendapatan: +${rupiah(earning)}\n📈 EXP: +${expGain}\n⚡ Stamina: -${staminaCost}`)
}

handler.command = /^nambalban$/i
handler.help = ['nambalban', 'tambal', 'bengkel']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Membuka jasa tambal ban'

export default handler
