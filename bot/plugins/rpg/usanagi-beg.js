/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'beg', 60_000)) return

  const user = getUser(m.sender)
  const staminaCost = 5

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${user.rpg.stamina}*.`)
  }

  user.rpg.stamina -= staminaCost
  await m.react('🤲')
  await m.reply('🤲 Meminta belas kasihan orang lewat...')
  await new Promise((r) => setTimeout(r, 2500))

  const earning = Math.floor(Math.random() * 5000) + 500
  user.koin += earning
  const expGain = Math.floor(earning / 15)
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, expGain)

  await m.react('✅')
  await m.rpgResult(`🤲 *Hasil Mengemis*\n\n💵 Pendapatan: +${rupiah(earning)}\n📈 EXP: +${expGain}\n⚡ Stamina: -${staminaCost}`)
}

handler.command = /^(beg|ngemis|minta)$/i
handler.help = ['beg', 'ngemis', 'minta']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Meminta sedekah di jalanan'

export default handler
