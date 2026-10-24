/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { number } from '../../lib/rpg/awang-format.js'

const EXP_PER_KOIN = 2

const handler = async (rawM, tools) => {
  const { m } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  const args = m.args || []
  const amountStr = args[0]

  if (!amountStr) {
    let txt = `💱 *Tukar EXP ke Koin*\n\n`
    txt += `Kurs: ${EXP_PER_KOIN} EXP = 1 Koin\n\n`
    txt += `EXP kamu: *${number(user.exp)}*\n`
    txt += `Koin kamu: *${number(user.koin)}*\n\n`
    txt += `Contoh: \`${m.prefix}buykoin 10000\``
    return m.reply(txt)
  }

  const koinAmount = amountStr === 'all' || amountStr === 'max' ? Math.floor(user.exp / EXP_PER_KOIN) : parseInt(amountStr)

  if (!koinAmount || koinAmount <= 0) {
    return m.reply(`Masukkan jumlah koin yang valid.`)
  }

  const expNeeded = koinAmount * EXP_PER_KOIN

  if (user.exp < expNeeded) {
    const maxPossible = Math.floor(user.exp / EXP_PER_KOIN)
    return m.reply(`EXP tidak cukup. Butuh ${number(expNeeded)}, punya ${number(user.exp)}.\nMaksimal bisa tukar: ${number(maxPossible)} koin.`)
  }

  user.exp -= expNeeded
  user.koin += koinAmount
  saveUser(m.sender, user)

  await m.react('💱')
  await m.reply(
    `💱 *Tukar Berhasil*\n\nEXP: -${number(expNeeded)}\nKoin: +${number(koinAmount)}\n\nSaldo sekarang: ${number(user.exp)} EXP, ${number(user.koin)} Koin`
  )
}

handler.command = /^buykoin$/i
handler.help = ['buykoin', 'belikoin', 'exptokoin']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Menukar EXP menjadi Koin'

export default handler
