
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'crime', 300_000)) return

  const user = getUser(m.sender)

  await m.react('💣')
  await m.reply('💣 Memasang alat peretas di ATM seberang jalan...')
  await new Promise((r) => setTimeout(r, 2500))

  const isSuccess = Math.random() < 0.5

  if (isSuccess) {
    const stolen = Math.floor(Math.random() * 15000) + 5000
    const expGain = Math.floor(stolen / 20)

    user.koin += stolen
    saveUser(m.sender, user)
    await addExpWithLevelCheck(sock, m, user, expGain)

    return m.rpgResult(`💻 *Hacking Sukses!*\n\n💰 Hasil: +${rupiah(stolen)}\n📈 EXP: +${expGain}`)
  }

  const fine = Math.floor(Math.random() * 10000) + 5000
  const actualFine = Math.min(fine, user.koin)

  user.koin = Math.max(0, user.koin - actualFine)
  user.rpg.health = Math.max(0, user.rpg.health - 15)
  saveUser(m.sender, user)

  return m.rpgResult(`🚨 *Tertangkap Polisi!*\n\n💸 Denda: -${rupiah(actualFine)}\n🤕 HP: -15`)
}

handler.command = /^crime$/i
handler.help = ['crime', 'jahat']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Melakukan kejahatan membobol ATM (risiko tinggi)'

export default handler
