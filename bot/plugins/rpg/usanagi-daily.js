/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { formatDuration } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const COOLDOWN = 86_400_000

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)

  const lastClaim = user.rpg.lastDaily || 0
  const now = Date.now()

  if (now - lastClaim < COOLDOWN) {
    const remaining = COOLDOWN - (now - lastClaim)
    return m.reply(`🎁 Jatah harian sudah diambil. Tunggu *${formatDuration(remaining)}* lagi.`)
  }

  const expReward = 1000
  const moneyReward = 5000

  user.rpg.lastDaily = now
  user.koin += moneyReward
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, expReward)

  await m.react('🎁')
  return sendRpgCard(sock, m, {
    type: 'daily',
    headerTitle: 'DAILY REWARD',
    headerSubtitle: 'Hadiah harian',
    data: {
      title: 'DAILY CLAIMED',
      subtitle: 'Hadiah berhasil diambil',
      result: 'Reward diterima',
      victory: true,
      stats: [
        { label: 'Coin', value: `+${rupiah(moneyReward)}`, color: '#b88828' },
        { label: 'EXP', value: `+${expReward}`, color: '#8e77ca' },
      ],
    },
    body: `Coin +${rupiah(moneyReward)} · EXP +${expReward}`,
  })
}

handler.command = /^daily$/i
handler.help = ['daily', 'harian', 'claim']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Klaim hadiah harian'

export default handler
