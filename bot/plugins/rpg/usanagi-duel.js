/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const args = m.args || []

  const target = m.targetJid
  const bet = parseInt(args[1]) || 1000

  if (!target) {
    let txt = `⚔️ *Duel Taruhan*\n\n`
    txt += `Tantang pemain lain dengan uang taruhan.\n\n`
    txt += `\`${m.prefix}duel @user 5000\``
    return m.reply(txt)
  }

  if (target === m.sender) {
    return m.reply(`Tidak bisa duel dengan diri sendiri.`)
  }

  if (bet < 1000) {
    return m.reply(`Taruhan minimal Rp 1.000.`)
  }

  const player1 = getUser(m.sender)
  const player2 = getUser(target)

  if (player1.koin < bet) {
    return m.reply(`Koin kamu tidak cukup. Koin: ${rupiah(player1.koin)}.`)
  }

  if (player2.koin < bet) {
    return m.reply(`Koin lawan tidak cukup untuk taruhan ini.`)
  }

  if (player1.rpg.health < 30) {
    return m.reply(`❤️ HP kamu terlalu rendah untuk duel. Minimal *30 HP*, sekarang *${player1.rpg.health}*.`)
  }

  if (await enforceCooldown(m, 'duel', 120_000)) return

  await m.react('⚔️')
  await m.reply(
    `⚔️ *Duel Dimulai!*\n\n@${m.sender.split('@')[0]} menantang @${target.split('@')[0]}!\n💰 Taruhan: ${rupiah(bet * 2)}`,
    { mentions: [m.sender, target] }
  )
  await new Promise((r) => setTimeout(r, 2000))

  const p1Power = player1.level * 10 + Math.random() * 50
  const p2Power = player2.level * 10 + Math.random() * 50

  const winner = p1Power > p2Power ? m.sender : target
  const loser = winner === m.sender ? target : m.sender
  const winnerData = winner === m.sender ? player1 : player2
  const loserData = winner === m.sender ? player2 : player1

  winnerData.koin += bet
  loserData.koin -= bet
  loserData.rpg.health = Math.max(0, loserData.rpg.health - 20)

  saveUser(m.sender, player1)
  saveUser(target, player2)

  const expGain = 500
  const winnerM = { ...m, sender: winner }
  await addExpWithLevelCheck(sock, winnerM, winnerData, expGain)

  let txt = `⚔️ *Hasil Duel*\n\n`
  txt += `🏆 Pemenang: @${winner.split('@')[0]}\n`
  txt += `💀 Kalah: @${loser.split('@')[0]}\n\n`
  txt += `💰 Hadiah: +${rupiah(bet)}\n✨ EXP: +${expGain}`

  await m.rpgResult(txt, { mentions: [m.sender, target] })
}

handler.command = /^duel$/i
handler.help = ['duel']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.description = 'Duel PvP dengan taruhan koin'
handler.groupOnly = true

export default handler
