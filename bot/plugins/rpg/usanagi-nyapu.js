
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { trackQuestProgress } from '../../lib/rpg/awang-quest.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'nyapu', 120_000)) return

  const user = getUser(m.sender)
  const staminaCost = 10

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${user.rpg.stamina}*. Istirahat dulu ya.`)
  }

  user.rpg.stamina -= staminaCost
  await m.react('🧹')
  await m.reply('🧹 Menyapu jalan, membersihkan sampah...')
  await new Promise((r) => setTimeout(r, 3000))

  const gacha = Math.random()

  if (gacha < 0.1) {
    const goldFound = Math.floor(Math.random() * 50000) + 15000
    user.koin += goldFound
  trackQuestProgress(user, 'earn', goldFound)
    saveUser(m.sender, user)
    await m.react('💍')
    return m.rpgResult(`💍 *Nemu Cincin Emas Jatuh!*\n\nLangsung dijual.\n💵 Pendapatan: +${rupiah(goldFound)}\n⚡ Stamina: -${staminaCost}`)
  }

  const earning = Math.floor(Math.random() * 8000) + 3000
  user.koin += earning
  trackQuestProgress(user, 'earn', earning)
  const expGain = Math.floor(earning / 20)
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, expGain)

  await m.react('✅')
  await m.rpgResult(`🧹 *Selesai Beres-beres*\n\n💵 Gaji: +${rupiah(earning)}\n📈 EXP: +${expGain}\n⚡ Stamina: -${staminaCost}`)
}

handler.command = /^nyapu$/i
handler.help = ['nyapu', 'cleaning', 'bersih']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Menyapu jalan, siapa tahu menemukan barang jatuh'

export default handler
