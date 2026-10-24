/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { formatDuration } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const COOLDOWN = 3_600_000

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)

  const lastClaim = user.rpg.lastHourly || 0
  const now = Date.now()

  if (now - lastClaim < COOLDOWN) {
    const remaining = COOLDOWN - (now - lastClaim)
    return m.reply(`⏰ Jatah jam ini sudah diambil. Tunggu *${formatDuration(remaining)}* lagi.`)
  }

  const expReward = 200
  const moneyReward = 1000

  user.rpg.lastHourly = now
  user.koin += moneyReward
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, expReward)

  await m.react('⏰')
  return sendRpgCard(sock, m, {
    type: 'hourly',
    headerTitle: 'HOURLY REWARD',
    headerSubtitle: 'Hadiah per jam',
    data: {
      title: 'HOURLY CLAIMED',
      subtitle: 'Hadiah berhasil diambil',
      result: 'Reward diterima',
      victory: true,
      stats: [
        { label: 'Coin', value: `+${rupiah(moneyReward)}`, color: '#b68a35' },
        { label: 'EXP', value: `+${expReward}`, color: '#4d8fae' },
      ],
    },
    body: `Coin +${rupiah(moneyReward)} · EXP +${expReward}`,
  })
}

handler.command = /^hourly$/i
handler.help = ['hourly', 'jam', 'perjam']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Klaim hadiah setiap jam'

export default handler
