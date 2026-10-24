/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'

const DICE_EMOJI = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']

const handler = async (rawM, tools) => {
  const { m } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)

  const args = m.args || []
  const guess = parseInt(args[0])
  const bet = parseInt(args[1])

  if (!guess || guess < 1 || guess > 6) {
    return m.reply(`🎲 *Tebak Dadu*\n\nTebak angka 1-6.\n\n\`${m.prefix}dice <angka> <taruhan>\`\n\nContoh: \`${m.prefix}dice 6 5000\``)
  }

  if (!bet || bet < 1000) {
    return m.reply(`Minimal taruhan *Rp 1.000*.`)
  }

  if (user.koin < bet) {
    return m.reply(`Koin kamu cuma ${rupiah(user.koin)}, tidak cukup untuk taruhan ${rupiah(bet)}.`)
  }

  if (await enforceCooldown(m, 'dice', 15_000)) return

  user.koin -= bet

  await m.react('🎲')
  await m.reply('🎲 Dadu dikocok...')
  await new Promise((r) => setTimeout(r, 2500))

  const result = Math.floor(Math.random() * 6) + 1
  const isWin = guess === result

  let txt = `Tebakan: *${guess}*\nHasil: *${result}* ${DICE_EMOJI[result - 1]}\n\n`

  if (isWin) {
    const winnings = bet * 5
    user.koin += winnings
    txt += `🎉 *Tebakan Tepat!*\n💰 Uang berlipat 5x: +${rupiah(winnings)}`
  } else {
    txt += `😔 *Tebakan Salah*\n💸 Hilang: -${rupiah(bet)}`
  }

  saveUser(m.sender, user)
  await m.rpgResult(txt)
}

handler.command = /^(dice|dadu|roll)$/i
handler.help = ['dice', 'dadu', 'roll']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Menebak mata dadu untuk berjudi'

export default handler
