/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { trackQuestProgress } from '../../lib/rpg/awang-quest.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'jualan', 180_000)) return

  const user = getUser(m.sender)
  const staminaCost = 18

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${user.rpg.stamina}*. Istirahat dulu ya.`)
  }

  user.rpg.stamina -= staminaCost
  await m.react('🛒')
  await m.reply('🛒 Berkeliling menawarkan dagangan...')
  await new Promise((r) => setTimeout(r, 3000))

  const gacha = Math.random()

  if (gacha < 0.2) {
    const rugi = Math.floor(Math.random() * 10000) + 5000
    user.koin = Math.max(0, user.koin - rugi)
    saveUser(m.sender, user)
    await m.react('🌧️')
    return m.rpgResult(`🌧️ *Dagangan Sepi*\n\nHujan deras, tidak ada yang beli.\nKerugian modal: -${rupiah(rugi)}\n⚡ Stamina: -${staminaCost}`)
  }

  if (gacha > 0.85) {
    const lakuKeras = Math.floor(Math.random() * 80000) + 40000
    user.koin += lakuKeras
  trackQuestProgress(user, 'earn', lakuKeras)
    const expGain = Math.floor(lakuKeras / 20)
    saveUser(m.sender, user)
    await addExpWithLevelCheck(sock, m, user, expGain)
    await m.react('🤑')
    return m.rpgResult(`🤑 *Diborong Habis!*\n\nRombongan mampir dan memborong semua dagangan.\n💵 Omzet: +${rupiah(lakuKeras)}\n📈 EXP: +${expGain}\n⚡ Stamina: -${staminaCost}`)
  }

  const earning = Math.floor(Math.random() * 25000) + 10000
  user.koin += earning
  trackQuestProgress(user, 'earn', earning)
  const expGain = Math.floor(earning / 20)
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, expGain)

  await m.react('✅')
  await m.rpgResult(`🛒 *Dagangan Laku*\n\n💵 Omzet: +${rupiah(earning)}\n📈 EXP: +${expGain}\n⚡ Stamina: -${staminaCost}`)
}

handler.command = /^jualan$/i
handler.help = ['jualan', 'dagang', 'pedagang']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Berdagang asongan keliling'

export default handler
