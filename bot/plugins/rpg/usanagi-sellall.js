
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'

const SELL_PRICES = {
  rock: 20, coal: 50, iron: 200, gold: 1000, diamond: 5000, emerald: 10000,
  trash: 10, fish: 100, prawn: 200, octopus: 500, shark: 2000, whale: 10000,
  wood: 30, stick: 15, apple: 50, rubber: 100,
  rabbit: 150, deer: 300, boar: 500, bear: 1000, lion: 2000, dragon: 10000,
  daging_kelinci: 100, daging_rusa: 250, daging_babi: 350, bulu_rubah: 500, cakar_beruang: 1500, taring_singa: 4000,
  botol: 15, kaleng: 20, kardus: 10, sampah: 5, koran: 10,
  carrot: 30, tomato: 30, corn: 40, potato: 30, strawberry: 50, watermelon: 80, pumpkin: 60,
}

const handler = async (rawM, tools) => {
  const { m } = buildRpgContext(rawM, tools)

  if (await enforceCooldown(m, 'sellall', 30_000)) return

  const user = getUser(m.sender)

  let totalEarned = 0
  const soldItems = []

  for (const [item, price] of Object.entries(SELL_PRICES)) {
    const qty = user.inventory[item] || 0
    if (qty > 0) {
      const earned = qty * price
      totalEarned += earned
      soldItems.push({ item, qty, earned })
      user.inventory[item] = 0
    }
  }

  if (soldItems.length === 0) {
    return m.reply(`Tidak ada item yang bisa dijual.`)
  }

  user.koin += totalEarned
  saveUser(m.sender, user)

  let txt = `💰 *Jual Semua Berhasil*\n\n`
  for (const s of soldItems.slice(0, 10)) {
    txt += `${s.item}: ${s.qty}x = ${rupiah(s.earned)}\n`
  }
  if (soldItems.length > 10) txt += `... dan ${soldItems.length - 10} item lainnya\n`
  txt += `\n💵 Total: ${rupiah(totalEarned)}`

  await m.reply(txt)
}

handler.command = /^sellall$/i
handler.help = ['sellall', 'jualsemua', 'quicksell']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Menjual semua item yang bisa dijual sekaligus'

export default handler
