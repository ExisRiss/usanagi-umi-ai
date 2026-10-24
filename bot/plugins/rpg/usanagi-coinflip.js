
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'

const handler = async (rawM, tools) => {
  const { m } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)

  const args = m.args || []
  const choice = args[0]?.toLowerCase()
  const bet = parseInt(args[1])

  if (!choice || !['heads', 'tails', 'h', 't'].includes(choice)) {
    return m.reply(`🪙 *Tebak Koin*\n\nPilih Heads atau Tails.\n\n\`${m.prefix}coinflip heads <taruhan>\`\n\`${m.prefix}coinflip tails <taruhan>\``)
  }

  if (!bet || bet < 1000) {
    return m.reply(`Minimal taruhan *Rp 1.000*.`)
  }

  if (user.koin < bet) {
    return m.reply(`Koin kamu cuma ${rupiah(user.koin)}, tidak cukup untuk taruhan ${rupiah(bet)}.`)
  }

  if (await enforceCooldown(m, 'coinflip', 10_000)) return

  user.koin -= bet

  const userChoice = choice === 'heads' || choice === 'h' ? 'heads' : 'tails'
  const result = Math.random() < 0.5 ? 'heads' : 'tails'
  const emoji = result === 'heads' ? '🦅' : '🪙'

  await m.react('🪙')
  await m.reply('🪙 Koin dilempar ke udara...')
  await new Promise((r) => setTimeout(r, 2500))

  const isWin = userChoice === result

  let txt = `Tebakan: *${userChoice.toUpperCase()}*\nHasil: *${result.toUpperCase()}* ${emoji}\n\n`

  if (isWin) {
    const winnings = bet * 2
    user.koin += winnings
    txt += `🎉 *Tebakan Benar!*\n💰 Cuan: +${rupiah(winnings)}`
  } else {
    txt += `😔 *Tebakan Salah*\n💸 Hilang: -${rupiah(bet)}`
  }

  saveUser(m.sender, user)
  await m.rpgResult(txt)
}

handler.command = /^(coinflip|cf|flip|toss)$/i
handler.help = ['coinflip', 'cf', 'flip', 'toss']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Berjudi tebak koin heads/tails'

export default handler
