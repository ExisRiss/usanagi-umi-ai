/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { trackQuestProgress } from '../../lib/rpg/awang-quest.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const LOCATIONS = ['🌲 Hutan Gelap', '🏔️ Gunung Es', '🏜️ Padang Pasir', '🌋 Gunung Berapi', '🏰 Kastil Tua', '🌊 Pantai Misterius']

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)

  if (user.rpg.health < 30) {
    return m.reply(`❤️ HP kamu terlalu rendah. Minimal *30 HP*, sekarang *${user.rpg.health}*. Heal dulu ya.`)
  }

  if (await enforceCooldown(m, 'adventure', 120_000)) return

  const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]

  await m.react('🗺️')
  await m.reply(`🗺️ Memasuki *${location}*...`)
  await new Promise((r) => setTimeout(r, 2500))

  const isWin = Math.random() < 0.6

  if (isWin) {
    const expGain = Math.floor(Math.random() * 2000) + 500
    const moneyGain = Math.floor(Math.random() * 10000) + 2000

    user.koin += moneyGain
    trackQuestProgress(user, 'earn', moneyGain)
    trackQuestProgress(user, 'adventure')
    saveUser(m.sender, user)

    await addExpWithLevelCheck(sock, m, user, expGain)

    return sendRpgCard(sock, m, {
      type: 'adventure',
      headerTitle: 'ADVENTURE',
      headerSubtitle: 'Perjalanan selesai',
      data: {
        title: 'VICTORY',
        subtitle: location.replace(/^[^\p{L}\p{N}]+/u, ''),
        result: 'Petualangan berhasil',
        location: location.replace(/^[^\p{L}\p{N}]+/u, ''),
        victory: true,
        stats: [
          { label: 'Coin', value: `+${rupiah(moneyGain)}`, color: '#f5c86b' },
          { label: 'EXP', value: `+${expGain.toLocaleString()}`, color: '#68d5ff' },
          { label: 'Stamina', value: '-15', color: '#ff7d92' },
        ],
      },
      body: `Adventure selesai di ${location.replace(/^[^\p{L}\p{N}]+/u, '')}.\nCoin +${rupiah(moneyGain)} · EXP +${expGain.toLocaleString()} · Stamina -15`,
    })
  }

  const healthLoss = Math.floor(Math.random() * 30) + 10
  user.rpg.health = Math.max(0, user.rpg.health - healthLoss)

  let msg = `☠️ *Diserang Monster*\n\n📍 ${location}\n\n❤️ HP: -${healthLoss} (Sisa: ${user.rpg.health})\n\n`

  if (user.rpg.health <= 0) {
    user.rpg.health = 0
    user.exp = Math.floor((user.exp || 0) / 2)
    msg += `💀 Kamu kalah. EXP berkurang 50%.`
  } else {
    msg += `Kamu berhasil kabur. Istirahat dulu untuk heal.`
  }

  saveUser(m.sender, user)
  return sendRpgCard(sock, m, {
    type: 'adventure',
    headerTitle: 'ADVENTURE',
    headerSubtitle: 'Hasil perjalanan',
    data: {
      title: user.rpg.health <= 0 ? 'DEFEAT' : 'ESCAPED',
      subtitle: location.replace(/^[^\p{L}\p{N}]+/u, ''),
      result: user.rpg.health <= 0 ? 'Kamu kalah' : 'Berhasil melarikan diri',
      location: location.replace(/^[^\p{L}\p{N}]+/u, ''),
      victory: false,
      stats: [
        { label: 'HP Lost', value: `-${healthLoss}`, color: '#ff7d92' },
        { label: 'HP Sisa', value: String(user.rpg.health), color: '#78e6b0' },
        ...(user.rpg.health <= 0 ? [{ label: 'EXP', value: '-50%', color: '#ff7d92' }] : []),
      ],
    },
    body: msg.replace(/^[^\n]+\n\n?/, '').trim(),
    mentions: [m.sender],
  })
}

handler.command = /^adventure$/i
handler.help = ['adventure', 'adv', 'petualangan']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Berpetualang untuk mendapat EXP dan hadiah'

export default handler
