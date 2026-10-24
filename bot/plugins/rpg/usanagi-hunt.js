
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { trackQuestProgress } from '../../lib/rpg/awang-quest.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const ANIMALS = [
  { item: 'rabbit', chance: 40, name: 'Kelinci', exp: 60 },
  { item: 'deer', chance: 30, name: 'Rusa', exp: 120 },
  { item: 'boar', chance: 15, name: 'Babi Hutan', exp: 200 },
  { item: 'bear', chance: 10, name: 'Beruang', exp: 350 },
  { item: 'lion', chance: 4, name: 'Singa', exp: 600 },
  { item: 'dragon', chance: 1, name: 'Naga', exp: 1500 },
]

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'hunt', 90_000)) return

  const user = getUser(m.sender)
  const staminaCost = 20

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${user.rpg.stamina}*. Istirahat dulu ya.`)
  }

  user.rpg.stamina -= staminaCost

  await m.react('🏹')
  await m.reply('🏹 Mengendap-endap di hutan mencari buruan...')
  await new Promise((r) => setTimeout(r, 3500))

  const rand = Math.random() * 100
  let caught = ANIMALS[0]
  for (const animal of [...ANIMALS].sort((a, b) => a.chance - b.chance)) {
    if (rand <= animal.chance) {
      caught = animal
      break
    }
  }

  user.inventory[caught.item] = (user.inventory[caught.item] || 0) + 1
  trackQuestProgress(user, 'hunt')
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, caught.exp)

  return sendRpgCard(sock, m, {
    type: 'hunt',
    headerTitle: 'HUNT',
    headerSubtitle: 'Hasil buruan',
    data: {
      title: 'HUNT COMPLETE',
      subtitle: caught.name,
      result: 'Buruan berhasil',
      victory: true,
      enemy: caught.item,
      stats: [
        { label: 'Loot', value: caught.name, color: '#78e6b0' },
        { label: 'EXP', value: `+${caught.exp}`, color: '#9b8cff' },
        { label: 'Stamina', value: `-${staminaCost}`, color: '#ff7d92' },
      ],
    },
    body: `Loot: ${caught.name} · EXP +${caught.exp} · Stamina -${staminaCost}`,
  })
}

handler.command = /^hunt$/i
handler.help = ['hunt']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Berburu hewan liar di hutan'

export default handler
