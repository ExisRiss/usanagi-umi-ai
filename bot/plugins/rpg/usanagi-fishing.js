/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { trackQuestProgress } from '../../lib/rpg/awang-quest.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const DROPS = [
  { item: 'trash', chance: 20, name: 'Sampah', exp: 10 },
  { item: 'fish', chance: 50, name: 'Ikan', exp: 100 },
  { item: 'prawn', chance: 30, name: 'Udang', exp: 150 },
  { item: 'octopus', chance: 15, name: 'Gurita', exp: 300 },
  { item: 'shark', chance: 5, name: 'Hiu', exp: 800 },
  { item: 'whale', chance: 1, name: 'Paus', exp: 2000 },
]

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'fishing', 60_000)) return

  const user = getUser(m.sender)
  const staminaCost = 15

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${user.rpg.stamina}*. Istirahat dulu ya.`)
  }

  user.rpg.stamina -= staminaCost

  await m.react('🎣')
  await m.reply('🎣 Melempar kail ke air yang tenang...')
  await new Promise((r) => setTimeout(r, 4000))

  const rand = Math.random() * 100
  let caught = DROPS[0]
  for (const drop of [...DROPS].sort((a, b) => a.chance - b.chance)) {
    if (rand <= drop.chance) {
      caught = drop
      break
    }
  }

  user.inventory[caught.item] = (user.inventory[caught.item] || 0) + 1
  trackQuestProgress(user, 'fishing')
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, caught.exp)

  await m.react('✅')

  return sendRpgCard(sock, m, {
    type: 'fishing',
    headerTitle: 'FISHING',
    headerSubtitle: 'Hasil tangkapan',
    data: {
      title: 'CATCH COMPLETE',
      subtitle: caught.name,
      result: caught.item === 'trash' ? 'Tangkapan kurang beruntung' : 'Tangkapan berhasil',
      items: [{ key: caught.item, name: caught.name, amount: 1 }],
      victory: caught.item !== 'trash',
      stats: [
        { label: 'Loot', value: caught.name, color: caught.item === 'trash' ? '#a8b0bc' : '#68d5ff' },
        { label: 'EXP', value: `+${caught.exp}`, color: '#9b8cff' },
        { label: 'Stamina', value: `-${staminaCost}`, color: '#ff7d92' },
      ],
    },
    body: `Loot: ${caught.name} · EXP +${caught.exp} · Stamina -${staminaCost}`,
  })
}

handler.command = /^(fishing|rpgfish|mancing)$/i
handler.help = ['fishing', 'rpgfish', 'mancing']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Memancing untuk mendapatkan ikan (RPG)'

export default handler
