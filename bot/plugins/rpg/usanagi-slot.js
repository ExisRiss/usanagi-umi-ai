
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣']
const WEIGHTS = [30, 25, 20, 15, 7, 3]

function spin() {
  const rand = Math.random() * 100
  let cumulative = 0
  for (let i = 0; i < SYMBOLS.length; i++) {
    cumulative += WEIGHTS[i]
    if (rand <= cumulative) return SYMBOLS[i]
  }
  return SYMBOLS[0]
}

const handler = async (rawM, tools) => {
  const { m } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)

  const bet = parseInt((m.args || [])[0])

  if (!bet || bet < 1000) {
    return m.reply(`Minimal taruhan *Rp 1.000*.\nContoh: \`${m.prefix}slot 5000\``)
  }

  if (user.koin < bet) {
    return m.reply(`Koin kamu cuma ${rupiah(user.koin)}, tidak cukup untuk taruhan ${rupiah(bet)}.`)
  }

  if (await enforceCooldown(m, 'slot', 10_000)) return

  user.koin -= bet

  const result = [spin(), spin(), spin()]

  await m.react('🎰')
  await m.reply('🎰 Tuas ditarik, mesin berputar...')
  await new Promise((r) => setTimeout(r, 2500))

  let multiplier = 0
  let winText = ''

  if (result[0] === result[1] && result[1] === result[2]) {
    if (result[0] === '7️⃣') {
      multiplier = 10
      winText = 'Jackpot 777! (10x lipat)'
    } else if (result[0] === '💎') {
      multiplier = 5
      winText = 'Triple Diamond! (5x lipat)'
    } else {
      multiplier = 3
      winText = 'Triple Combo! (3x lipat)'
    }
  } else if (result[0] === result[1] || result[1] === result[2] || result[0] === result[2]) {
    multiplier = 1.5
    winText = 'Double Match (1.5x lipat)'
  }

  const winnings = Math.floor(bet * multiplier)
  user.koin += winnings
  saveUser(m.sender, user)

  let txt = `🎰 *Hasil Slot*\n\n[ ${result[0]} | ${result[1]} | ${result[2]} ]\n\n`
  txt += multiplier > 0 ? `${winText}\n💰 Cair: +${rupiah(winnings)}` : `Zonk! Uang hangus.\n💸 Hilang: -${rupiah(bet)}`

  await m.rpgResult(txt, { rpgType: 'slot', rpgTitle: 'SLOT', rpgSubtitle: 'Spin Result', rpgData: { title: 'SLOT RESULT', reels: result, bet, multiplier, winnings, outcome: multiplier > 0 ? winText : 'Zonk — taruhan tidak menang' } })
}

handler.command = /^(slot|slots|mesin)$/i
handler.help = ['slot', 'slots', 'mesin']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Bermain mesin slot untuk berjudi'

export default handler
