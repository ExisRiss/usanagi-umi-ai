
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { trackQuestProgress } from '../../lib/rpg/awang-quest.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'gembel', 120_000)) return

  const user = getUser(m.sender)
  const staminaCost = 5

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${user.rpg.stamina}*.`)
  }

  user.rpg.stamina -= staminaCost
  await m.react('🤲')
  await m.reply('🤲 Menunggu ada dermawan lewat di perempatan...')
  await new Promise((r) => setTimeout(r, 3000))

  const gacha = Math.random()

  if (gacha < 0.3) {
    const heal = Math.floor(Math.random() * 20) + 10
    user.rpg.stamina = Math.min(user.rpg.maxStamina, user.rpg.stamina + heal)
    saveUser(m.sender, user)
    await m.react('🍱')
    return m.rpgResult(`🍱 Dikasih nasi bungkus oleh orang baik!\n💖 Stamina: +${heal}\n💵 Uang: 0`)
  }

  if (gacha > 0.9) {
    saveUser(m.sender, user)
    await m.react('💢')
    return m.rpgResult(`💢 Diusir dari lapak ngemis. Tidak dapat apa-apa.\n⚡ Stamina: -${staminaCost}`)
  }

  const earning = Math.floor(Math.random() * 3000) + 500
  user.koin += earning
  trackQuestProgress(user, 'earn', earning)
  const expGain = Math.floor(earning / 10)
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, expGain)

  await m.react('✅')
  await m.rpgResult(`🤲 *Hasil Hari Ini*\n\n💵 Pendapatan: +${rupiah(earning)}\n📈 EXP: +${expGain}\n⚡ Stamina: -${staminaCost}`)
}

handler.command = /^gembel$/i
handler.help = ['gembel']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Mengemis dengan peluang dapat nasi bungkus (tambah stamina)'

export default handler
