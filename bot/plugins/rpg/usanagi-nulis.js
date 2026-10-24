/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { trackQuestProgress } from '../../lib/rpg/awang-quest.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'nulis', 120_000)) return

  const user = getUser(m.sender)
  const staminaCost = 10

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${user.rpg.stamina}*. Istirahat dulu ya.`)
  }

  user.rpg.stamina -= staminaCost
  await m.react('📝')
  await m.reply('📝 Merangkai kata demi kata...')
  await new Promise((r) => setTimeout(r, 3000))

  const gacha = Math.random()

  if (gacha < 0.15) {
    saveUser(m.sender, user)
    await m.react('🚮')
    return m.rpgResult(`Naskah ditolak penerbit. Royalti: 0.\n⚡ Stamina: -${staminaCost}`)
  }

  if (gacha > 0.9) {
    const viralRoyalti = Math.floor(Math.random() * 60000) + 30000
    user.koin += viralRoyalti
  trackQuestProgress(user, 'earn', viralRoyalti)
    const expGain = Math.floor(viralRoyalti / 20)
    saveUser(m.sender, user)
    await addExpWithLevelCheck(sock, m, user, expGain)

    await m.react('🌟')
    return m.rpgResult(
      `🌟 *Ceritamu Viral!*\n\nJadi best seller.\n💵 Royalti: +${rupiah(viralRoyalti)}\n📈 EXP: +${expGain}\n⚡ Stamina: -${staminaCost}`
    )
  }

  const earning = Math.floor(Math.random() * 15000) + 5000
  user.koin += earning
  trackQuestProgress(user, 'earn', earning)
  const expGain = Math.floor(earning / 20)
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, expGain)

  await m.react('✅')
  await m.rpgResult(`📝 *Royalti Cair*\n\n💵 Pendapatan: +${rupiah(earning)}\n📈 EXP: +${expGain}\n⚡ Stamina: -${staminaCost}`)
}

handler.command = /^(author|pengarang)$/i
handler.help = ['author', 'pengarang']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Menulis cerpen atau artikel untuk dapat royalti'

export default handler
