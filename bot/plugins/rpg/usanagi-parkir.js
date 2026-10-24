
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { trackQuestProgress } from '../../lib/rpg/awang-quest.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'parkir', 120_000)) return

  const user = getUser(m.sender)
  const staminaCost = 12

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${user.rpg.stamina}*. Istirahat dulu ya.`)
  }

  user.rpg.stamina -= staminaCost
  await m.react('🅿️')
  await m.reply('🅿️ Mulai narik uang parkir di minimarket...')
  await new Promise((r) => setTimeout(r, 3000))

  const gacha = Math.random()

  if (gacha < 0.1) {
    const denda = Math.floor(Math.random() * 5000) + 1000
    user.koin = Math.max(0, user.koin - denda)
    saveUser(m.sender, user)
    await m.react('🚨')
    return m.rpgResult(`🚨 *Razia Satpol PP!*\n\nUang recehanmu jatuh senilai ${rupiah(denda)}.\n⚡ Stamina: -${staminaCost}`, { rpgData: { title: 'PARKING PENALTY', result: 'Razia Satpol PP', victory: false, penalty: denda } })
  }

  if (gacha > 0.9) {
    const jackpot = Math.floor(Math.random() * 50000) + 20000
    user.koin += jackpot
  trackQuestProgress(user, 'earn', jackpot)
    const expGain = Math.floor(jackpot / 20)
    saveUser(m.sender, user)
    await addExpWithLevelCheck(sock, m, user, expGain)
    await m.react('🤑')
    return m.rpgResult(`🤑 *Jackpot!*\n\nDapat tips besar dari pengunjung.\n💵 Pendapatan: +${rupiah(jackpot)}\n📈 EXP: +${expGain}\n⚡ Stamina: -${staminaCost}`, { rpgData: { title: 'PARKING JACKPOT', result: 'Tips besar dari pengunjung', victory: true, earning: jackpot, expGain } })
  }

  const earning = Math.floor(Math.random() * 8000) + 2000
  user.koin += earning
  trackQuestProgress(user, 'earn', earning)
  const expGain = Math.floor(earning / 20)
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, expGain)

  await m.react('✅')
  await m.rpgResult(`🅿️ *Hasil Markir*\n\n💵 Pendapatan: +${rupiah(earning)}\n📈 EXP: +${expGain}\n⚡ Stamina: -${staminaCost}`, { rpgData: { title: 'PARKING SHIFT COMPLETE', result: 'Shift parkir selesai', victory: true, earning, expGain } })
}

handler.command = /^parkir$/i
handler.help = ['parkir', 'kangparkir', 'markir']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Jadi tukang parkir minimarket'

export default handler
