/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { trackQuestProgress } from '../../lib/rpg/awang-quest.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const opponentJid = m.targetJid

  if (!opponentJid) {
    let txt = `⚔️ *Arena Gladiator*\n\n`
    txt += `Tantang pemain lain untuk duel.\n\n`
    txt += `\`${m.prefix}arena @user\` atau reply pesan mereka dengan \`${m.prefix}arena\`\n\n`
    txt += `⚠️ Jika kalah, 20% koin kamu akan hilang.`
    return m.reply(txt)
  }

  if (opponentJid === m.sender) {
    return m.reply(`Tidak bisa menantang diri sendiri.`)
  }

  if (await enforceCooldown(m, 'arena', 180_000)) return

  const user = getUser(m.sender)
  const opponent = getUser(opponentJid)

  const myHealth = user.rpg.health
  const myAttack = user.rpg.attack + user.level * 2
  const myDefense = user.rpg.defense + user.level

  const oppHealth = opponent.rpg.health
  const oppAttack = opponent.rpg.attack + opponent.level * 2
  const oppDefense = opponent.rpg.defense + opponent.level

  await m.react('⚔️')
  await m.reply(`⚔️ *Pertarungan Dimulai!*\n\n@${m.sender.split('@')[0]} vs @${opponentJid.split('@')[0]}`, {
    mentions: [m.sender, opponentJid],
  })
  await new Promise((r) => setTimeout(r, 2000))

  let myHp = myHealth
  let oppHp = oppHealth
  let round = 0
  const battleLog = []

  while (myHp > 0 && oppHp > 0 && round < 10) {
    round++

    const myDmg = Math.max(5, myAttack - oppDefense + Math.floor(Math.random() * 10))
    oppHp -= myDmg
    battleLog.push(`🔥 Kamu menyerang: -${myDmg} HP`)

    if (oppHp <= 0) break

    const oppDmg = Math.max(5, oppAttack - myDefense + Math.floor(Math.random() * 10))
    myHp -= oppDmg
    battleLog.push(`💢 Lawan membalas: -${oppDmg} HP`)
  }

  const isWin = myHp > oppHp || (myHp === oppHp && myHealth >= oppHealth)

  if (isWin) {
    const expReward = 300 + opponent.level * 50
    const goldReward = Math.floor(opponent.koin * 0.1)

    user.koin += goldReward
    opponent.koin = Math.max(0, opponent.koin - goldReward)
    user.rpg.health = Math.max(1, Math.min(user.rpg.maxHealth, myHp))
    opponent.rpg.health = Math.max(1, Math.min(opponent.rpg.maxHealth, oppHp))
    trackQuestProgress(user, 'kill')
    trackQuestProgress(user, 'earn', goldReward)

    saveUser(m.sender, user)
    saveUser(opponentJid, opponent)

    await addExpWithLevelCheck(sock, m, user, expReward)
    await m.react('🏆')
    return sendRpgCard(sock, m, {
      type: 'battle',
      headerTitle: 'ARENA',
      headerSubtitle: 'PvP result',
      data: {
        title: 'VICTORY',
        subtitle: `${m.pushName || 'Player'} vs @${opponentJid.split('@')[0]}`,
        name: `@${opponentJid.split('@')[0]}`,
        status: 'Kamu memenangkan pertarungan',
        victory: true,
        damage: Math.max(0, oppHealth - Math.max(0, oppHp)),
        round,
        hp: Math.max(0, myHp),
        maxHp: myHealth,
        exp: expReward,
        koin: goldReward,
        loot: `Koin jarahan +${rupiah(goldReward)}`,
      },
      body: `Menang melawan @${opponentJid.split('@')[0]}. EXP +${expReward} · Koin +${rupiah(goldReward)}.`,
      mentions: [m.sender, opponentJid],
    })
  }

  const goldLoss = Math.floor(user.koin * 0.2)
  user.koin = Math.max(0, user.koin - goldLoss)
  user.rpg.health = Math.max(1, Math.min(user.rpg.maxHealth, myHp))
  opponent.rpg.health = Math.max(1, Math.min(opponent.rpg.maxHealth, oppHp))
  saveUser(m.sender, user)
  saveUser(opponentJid, opponent)

  await m.react('💀')
  return sendRpgCard(sock, m, {
    type: 'battle',
    headerTitle: 'ARENA',
    headerSubtitle: 'PvP result',
    data: {
      title: 'DEFEAT',
      subtitle: `${m.pushName || 'Player'} vs @${opponentJid.split('@')[0]}`,
      name: `@${opponentJid.split('@')[0]}`,
      status: 'Kamu kalah dalam pertarungan',
      victory: false,
      damage: Math.max(0, oppHealth - Math.max(0, oppHp)),
      round,
      hp: Math.max(0, myHp),
      maxHp: myHealth,
      exp: 0,
      koin: 0,
      loot: `Koin hilang -${rupiah(goldLoss)}`,
    },
    body: `Kalah melawan @${opponentJid.split('@')[0]}. Koin -${rupiah(goldLoss)}.`,
    mentions: [m.sender, opponentJid],
  })
}

handler.command = /^arena$/i
handler.help = ['arena', 'pvp', 'battle', 'fight']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.description = 'Bertarung PvP di arena'
handler.groupOnly = true

export default handler
