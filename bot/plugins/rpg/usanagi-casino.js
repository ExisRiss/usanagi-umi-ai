/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'

const handler = async (rawM, tools) => {
  const { m } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  const args = m.args || []

  let bet = args[0]

  if (!bet) {
    let txt = `🎰 *Kasino*\n\n`
    txt += `Cara taruhan: \`${m.prefix}casino <jumlah>\`\n\n`
    txt += `Contoh:\n\`${m.prefix}casino 10000\`\n\`${m.prefix}casino all\``
    return m.reply(txt)
  }

  bet = /^all$/i.test(bet) ? user.koin : parseInt(bet)

  if (isNaN(bet) || bet < 1000) {
    return m.reply(`Minimal taruhan *Rp 1.000*.`)
  }

  if (bet > user.koin) {
    return m.reply(`Uang kamu cuma ${rupiah(user.koin)}, tidak cukup untuk taruhan ${rupiah(bet)}.`)
  }

  if (await enforceCooldown(m, 'casino', 10_000)) return

  await m.react('🎰')
  await m.reply('🎲 Bandar mengocok dadu dan memutar roda...')
  await new Promise((r) => setTimeout(r, 2500))

  const playerScore = Math.floor(Math.random() * 100)
  const botScore = Math.floor(Math.random() * 100)

  let result, emoji, moneyChange

  if (playerScore > botScore) {
    result = 'Menang!'
    emoji = '🎉'
    moneyChange = bet
    user.koin += bet
  } else if (playerScore < botScore) {
    result = 'Kalah!'
    emoji = '💸'
    moneyChange = -bet
    user.koin -= bet
  } else {
    result = 'Seri'
    emoji = '🤝'
    moneyChange = 0
  }

  saveUser(m.sender, user)
  await m.react(emoji)

  let txt = `🎰 *Hasil Kasino*\n\n`
  txt += `Poin Kamu: *${playerScore}* | Poin Bandar: *${botScore}*\n\n`
  txt += `Hasil: ${emoji} *${result}*\n`
  txt += moneyChange !== 0 ? `Uang: *${moneyChange > 0 ? '+' : ''}${rupiah(moneyChange)}*\n\n` : `Uang kembali (balik modal)\n\n`
  txt += `Sisa saldo: ${rupiah(user.koin)}`

  await m.rpgResult(txt, { rpgType: 'casino', rpgTitle: 'CASINO', rpgSubtitle: 'Risk Table', rpgData: { title: 'CASINO RESULT', playerScore, botScore, moneyChange, outcome: result } })
}

handler.command = /^casino$/i
handler.help = ['casino', 'judi', 'gamble']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Bermain kasino untuk berjudi'

export default handler
