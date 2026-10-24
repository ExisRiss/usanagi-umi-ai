
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const DROPS = [
  { item: 'wood', chance: 70, name: 'Kayu', min: 2, max: 5 },
  { item: 'stick', chance: 50, name: 'Ranting', min: 1, max: 3 },
  { item: 'apple', chance: 20, name: 'Apel', min: 1, max: 2 },
  { item: 'rubber', chance: 10, name: 'Karet', min: 1, max: 1 },
]

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'woodcut', 60_000)) return

  const user = getUser(m.sender)
  const staminaCost = 15

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡ Stamina tidak cukup. Butuh *${staminaCost}*, sisa *${user.rpg.stamina}*. Istirahat dulu ya.`)
  }

  user.rpg.stamina -= staminaCost

  await m.react('🪓')
  await m.reply('🪓 Menebang pohon besar...')
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
    user.inventory.wood = (user.inventory.wood || 0) + 1
    results.push({ name: 'Kayu', qty: 1 })
  }

  const expGain = Math.floor(Math.random() * 200) + 50
  saveUser(m.sender, user)

  await addExpWithLevelCheck(sock, m, user, expGain)

  await m.react('✅')

  let txt = `🪓 *Pohon Tumbang!*\n\n`
  for (const r of results) txt += `• ${r.name}: +${r.qty}\n`
  txt += `\n📈 EXP: +${expGain}\n⚡ Stamina: -${staminaCost}`

  return sendRpgCard(sock, m, { type: 'woodcut', headerTitle: 'WOODCUT', headerSubtitle: 'Ancient Grove', data: { title: 'HARVEST COMPLETE', subtitle: 'Woodcut results', result: results.map((r) => `${r.name} +${r.qty}`).join(' · '), victory: true, stats: [...results.slice(0, 4).map((r) => ({ label: r.name, value: `+${r.qty}`, color: '#98d2b0' })), { label: 'EXP', value: `+${expGain}`, color: '#9bd8ea' }, { label: 'Stamina', value: `-${staminaCost}`, color: '#e0c17b' }].slice(0, 6) }, body: txt.replace(/\n/g, ' · ').replace(/• /g, '') })
}

handler.command = /^(woodcut|chop|nebang|kayu)$/i
handler.help = ['woodcut', 'chop', 'nebang', 'kayu']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Menebang pohon untuk mendapatkan kayu'

export default handler
