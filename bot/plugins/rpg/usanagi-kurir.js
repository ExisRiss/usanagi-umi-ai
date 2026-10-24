
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { trackQuestProgress } from '../../lib/rpg/awang-quest.js'

const ITEMS = ['Dokumen', 'Baju Online', 'Skincare', 'Panci']

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'kurir', 120_000)) return

  const user = getUser(m.sender)
  const staminaCost = 15

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${user.rpg.stamina}*. Istirahat dulu ya.`)
  }

  user.rpg.stamina -= staminaCost
  await m.react('📦')
  await m.reply('📦 Mencari alamat pengiriman...')
  await new Promise((r) => setTimeout(r, 3000))

  const gacha = Math.random()

  if (gacha < 0.2) {
    const extraStamina = 10
    user.rpg.stamina = Math.max(0, user.rpg.stamina - extraStamina)
    const expGain = 500
    saveUser(m.sender, user)
    await addExpWithLevelCheck(sock, m, user, expGain)

    await m.react('🐕')
    return m.rpgResult(
      `🐕 *Dikejar Anjing!*\n\nPaket terpaksa dilempar ke pagar.\n⚡ Stamina tambahan: -${extraStamina}\n📈 EXP kompensasi: +${expGain}\n💵 Pendapatan: 0`
    )
  }

  const item = ITEMS[Math.floor(Math.random() * ITEMS.length)]
  const earning = Math.floor(Math.random() * 15000) + 5000
  const tips = gacha > 0.8 ? Math.floor(Math.random() * 10000) + 2000 : 0
  const totalEarning = earning + tips

  user.koin += totalEarning
  trackQuestProgress(user, 'earn', totalEarning)
  const expGain = Math.floor(totalEarning / 20)
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, expGain)

  await m.react('✅')
  let txt = `📦 *Paket Sampai*\n\nBarang: *${item}*\n💵 Ongkir: +${rupiah(earning)}\n`
  if (tips > 0) txt += `🎁 Tips: +${rupiah(tips)}\n`
  txt += `📈 EXP: +${expGain}\n⚡ Stamina: -${staminaCost}`

  await m.rpgResult(txt)
}

handler.command = /^kurir$/i
handler.help = ['kurir', 'antar', 'paket']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Mengantar paket, waspada anjing galak'

export default handler
