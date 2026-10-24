
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { formatDuration } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'

const COOLDOWN = 7 * 24 * 60 * 60 * 1000

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)

  const lastWeekly = user.cooldowns?.weekly || user.rpg.lastWeekly || 0
  const now = Date.now()

  if (now - lastWeekly < COOLDOWN) {
    const remaining = COOLDOWN - (now - lastWeekly)
    return m.reply(`🗓️ Jatah mingguan sudah diambil. Tunggu *${formatDuration(remaining)}* lagi.`)
  }

  const expReward = Math.floor(Math.random() * 20000) + 10000
  const moneyReward = Math.floor(Math.random() * 50000) + 30000
  const crateReward = Math.floor(Math.random() * 3) + 1

  user.koin += moneyReward
  user.inventory.uncommon = (user.inventory.uncommon || 0) + crateReward
  user.rpg.lastWeekly = now
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, expReward)

  let txt = `🗓️ *Hadiah Mingguan*\n\n`
  txt += `📈 EXP: +${expReward.toLocaleString('id-ID')}\n`
  txt += `💰 Koin: +${rupiah(moneyReward)}\n`
  txt += `🛍️ Uncommon Crate: +${crateReward}x\n\n`
  txt += `Simpan sebagian di bank ya (\`${m.prefix}bank\`).`

  await m.rpgTextResult(txt)
}

handler.command = /^weekly$/i
handler.help = ['weekly', 'mingguan']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Klaim hadiah mingguan (lebih besar dari daily)'

export default handler
