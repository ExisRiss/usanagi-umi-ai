/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { trackQuestProgress } from '../../lib/rpg/awang-quest.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const DROPS = [
  { item: 'rock', chance: 80, name: 'Batu', min: 2, max: 5 },
  { item: 'coal', chance: 50, name: 'Batubara', min: 1, max: 3 },
  { item: 'iron', chance: 30, name: 'Besi', min: 1, max: 2 },
  { item: 'gold', chance: 15, name: 'Emas', min: 1, max: 1 },
  { item: 'diamond', chance: 5, name: 'Berlian', min: 1, max: 1 },
  { item: 'emerald', chance: 2, name: 'Emerald', min: 1, max: 1 },
]

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'mining', 60_000)) return

  const user = getUser(m.sender)
  const staminaCost = 20

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${user.rpg.stamina}*. Istirahat dulu ya.`)
  }

  user.rpg.stamina -= staminaCost

  await m.react('⛏️')
  await m.reply('⛏️ Menambang di kedalaman gua...')
  await new Promise((r) => setTimeout(r, 3000))

  const results = []
  for (const drop of DROPS) {
    if (Math.random() * 100 <= drop.chance) {
      const qty = Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min
      user.inventory[drop.item] = (user.inventory[drop.item] || 0) + qty
      results.push({ name: drop.name, qty })
    }
  }

  if (results.length === 0) {
    user.inventory.rock = (user.inventory.rock || 0) + 1
    results.push({ name: 'Batu', qty: 1 })
  }

  const expGain = Math.floor(Math.random() * 500) + 100
  trackQuestProgress(user, 'mining')
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, expGain)

  await m.react('✅')

  const loot = results.map((r) => `${r.name} ×${r.qty}`).join(', ')
  return sendRpgCard(sock, m, {
    type: 'mining',
    headerTitle: 'MINING',
    headerSubtitle: 'Hasil tambang',
    data: {
      title: 'MINING COMPLETE',
      subtitle: loot,
      result: 'Berhasil menambang',
      items: results.map((item) => ({ key: item.name, name: item.name, amount: item.qty })),
      victory: true,
      stats: [
        { label: 'Loot', value: loot, color: '#78e6b0' },
        { label: 'EXP', value: `+${expGain}`, color: '#68d5ff' },
        { label: 'Stamina', value: `-${staminaCost}`, color: '#ff7d92' },
      ],
    },
    body: `Loot: ${loot} · EXP +${expGain} · Stamina -${staminaCost}`,
  })
}

handler.command = /^(mining|mine|tambang)$/i
handler.help = ['mining', 'mine', 'tambang']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Menambang untuk mendapatkan ores dan gems'

export default handler
