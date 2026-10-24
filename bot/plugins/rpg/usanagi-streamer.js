/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { extendCooldown } from '../../lib/rpg/awang-db.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { trackQuestProgress } from '../../lib/rpg/awang-quest.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'streamer', 180_000)) return

  const user = getUser(m.sender)
  const staminaCost = 20

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${user.rpg.stamina}*.`)
  }

  user.rpg.stamina -= staminaCost
  await m.react('🎥')
  await m.reply('🎥 Live streaming dimulai...')
  await new Promise((r) => setTimeout(r, 3500))

  const gacha = Math.random()

  if (gacha < 0.15) {
    saveUser(m.sender, user)
    extendCooldown(m.sender, 'streamer', 300_000)

    await m.react('🚫')
    return m.rpgResult(`🚫 *Akun Di-banned Platform!*\n\nTidak dapat donasi apa-apa, kena penalti larangan streaming 5 menit ekstra.\n⚡ Stamina: -${staminaCost}`)
  }

  const earning = Math.floor(Math.random() * 30000) + 10000
  const saweranPaus = gacha > 0.85 ? Math.floor(Math.random() * 100000) + 50000 : 0
  const totalEarning = earning + saweranPaus

  user.koin += totalEarning
  trackQuestProgress(user, 'earn', totalEarning)
  const expGain = Math.floor(totalEarning / 30)
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, expGain)

  await m.react('✅')
  let txt = `🎥 *Live Streaming Selesai*\n\n💵 Pendapatan Iklan: +${rupiah(earning)}\n`
  if (saweranPaus > 0) txt += `🐳 Saweran Sultan: +${rupiah(saweranPaus)}\n`
  txt += `📈 EXP: +${expGain}\n⚡ Stamina: -${staminaCost}`

  await m.rpgResult(txt)
}

handler.command = /^(streamer|live|vtuber)$/i
handler.help = ['streamer', 'live', 'vtuber']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Live streaming untuk mendapat donasi (risiko dibanned)'

export default handler
