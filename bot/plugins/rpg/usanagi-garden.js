
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { trackQuestProgress } from '../../lib/rpg/awang-quest.js'
import { formatTimer } from '../../lib/rpg/awang-format.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const CROPS = {
  carrot: { name: '🥕 Wortel', growTime: 300_000, exp: 50, sellPrice: 30, seedPrice: 10 },
  tomato: { name: '🍅 Tomat', growTime: 600_000, exp: 80, sellPrice: 50, seedPrice: 20 },
  corn: { name: '🌽 Jagung', growTime: 900_000, exp: 120, sellPrice: 80, seedPrice: 35 },
  potato: { name: '🥔 Kentang', growTime: 1_200_000, exp: 150, sellPrice: 100, seedPrice: 45 },
  strawberry: { name: '🍓 Stroberi', growTime: 1_800_000, exp: 200, sellPrice: 150, seedPrice: 60 },
  watermelon: { name: '🍉 Semangka', growTime: 3_600_000, exp: 350, sellPrice: 300, seedPrice: 100 },
  pumpkin: { name: '🎃 Labu', growTime: 7_200_000, exp: 500, sellPrice: 500, seedPrice: 150 },
  herb: { name: '🌿 Herba', growTime: 1_500_000, exp: 180, sellPrice: 120, seedPrice: 50 },
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  const args = m.args || []
  const action = args[0]?.toLowerCase()
  const cropName = args[1]?.toLowerCase()

  if (!action || !['plant', 'harvest', 'status', 'buy'].includes(action)) {
    let txt = `🌻 *Kebun Pribadi*\n\n`
    txt += `\`${m.prefix}garden status\`\n\`${m.prefix}garden buy <tanaman> <jumlah>\`\n`
    txt += `\`${m.prefix}garden plant <tanaman>\`\n\`${m.prefix}garden harvest\`\n\n`
    txt += `*Daftar Bibit:*\n`
    for (const [key, crop] of Object.entries(CROPS)) {
      txt += `${crop.name} — ${formatTimer(crop.growTime)} | ${rupiah(crop.seedPrice)}/bibit\n`
    }
    return m.reply(txt)
  }

  if (action === 'status') {
    const garden = user.rpg.garden
    let txt = `🚜 *Status Kebun*\n\nKapasitas: ${garden.plots.length}/${garden.maxPlots}\n\n`

    if (garden.plots.length === 0) {
      txt += `Kebun masih kosong. Tanam bibit dengan \`${m.prefix}garden plant <nama>\`.`
    } else {
      garden.plots.forEach((plot, i) => {
        const crop = CROPS[plot.crop]
        const remaining = Math.max(0, crop.growTime - (Date.now() - plot.plantedAt))
        txt += `Plot ${i + 1}: ${crop.name} — ${remaining <= 0 ? '✨ Siap panen' : `⏳ ${formatTimer(remaining)}`}\n`
      })
    }
    return m.reply(txt)
  }

  if (action === 'buy') {
    if (!cropName) return m.reply(`Contoh: \`${m.prefix}garden buy carrot 5\``)

    const crop = CROPS[cropName]
    if (!crop) return m.reply(`Bibit *${cropName}* tidak dijual. Cek \`${m.prefix}garden\`.`)

    const qty = Math.max(1, parseInt(args[2]) || 1)
    const totalCost = crop.seedPrice * qty

    if (user.koin < totalCost) {
      return m.reply(`Koin kurang. Butuh ${rupiah(totalCost)}, koin kamu ${rupiah(user.koin)}.`)
    }

    user.koin -= totalCost
    const seedKey = `${cropName}seed`
    user.inventory[seedKey] = (user.inventory[seedKey] || 0) + qty
    saveUser(m.sender, user)

    return m.reply(`🛒 Beli *${qty}x Bibit ${crop.name}*.\nTotal: ${rupiah(totalCost)}\n\nTanam dengan \`${m.prefix}garden plant ${cropName}\`.`)
  }

  if (action === 'plant') {
    if (!cropName) return m.reply(`Contoh: \`${m.prefix}garden plant carrot\``)

    const crop = CROPS[cropName]
    if (!crop) return m.reply(`Tanaman *${cropName}* tidak dikenal.`)

    if (user.rpg.garden.plots.length >= user.rpg.garden.maxPlots) {
      return m.reply(`Lahan sudah penuh. Panen dulu untuk kosongkan slot.`)
    }

    const seedKey = `${cropName}seed`
    if ((user.inventory[seedKey] || 0) < 1) {
      return m.reply(`Kamu tidak punya bibit *${crop.name}*. Beli dulu: \`${m.prefix}garden buy ${cropName}\`.`)
    }

    user.inventory[seedKey]--
    if (user.inventory[seedKey] <= 0) delete user.inventory[seedKey]

    user.rpg.garden.plots.push({ crop: cropName, plantedAt: Date.now() })
    saveUser(m.sender, user)

    return m.reply(`🌱 Bibit *${crop.name}* ditanam. Tunggu *${formatTimer(crop.growTime)}* untuk panen.`)
  }

  if (action === 'harvest') {
    const garden = user.rpg.garden
    const readyPlots = garden.plots.filter((p) => Date.now() - p.plantedAt >= CROPS[p.crop].growTime)

    if (readyPlots.length === 0) {
      return m.reply(`Belum ada yang matang. Cek \`${m.prefix}garden status\`.`)
    }

    let totalExp = 0
    const harvestedItems = []

    for (const plot of readyPlots) {
      const crop = CROPS[plot.crop]
      const qty = Math.floor(Math.random() * 3) + 2
      user.inventory[plot.crop] = (user.inventory[plot.crop] || 0) + qty
      totalExp += crop.exp
      harvestedItems.push(`${crop.name} x${qty}`)
      if (plot.crop === 'herb' && Math.random() < 0.35) {
        const bonus = Math.random() < 0.5 ? 'flower' : 'mushroom'
        user.inventory[bonus] = (user.inventory[bonus] || 0) + 1
        harvestedItems.push(`${bonus === 'flower' ? '🌸 Bunga' : '🍄 Jamur'} x1`)
      }
      trackQuestProgress(user, 'harvest')
    }

    garden.plots = garden.plots.filter((p) => Date.now() - p.plantedAt < CROPS[p.crop].growTime)
    saveUser(m.sender, user)

    await addExpWithLevelCheck(sock, m, user, totalExp)

    await m.react('✅')
    return sendRpgCard(sock, m, { type: 'garden', headerTitle: 'GARDEN', headerSubtitle: 'Harvest complete', data: { title: 'HARVEST COMPLETE', subtitle: `${harvestedItems.length} hasil`, result: harvestedItems.join(' · '), victory: true, stats: [{ label: 'Yield', value: String(harvestedItems.length), color: '#98d2b0' }, { label: 'EXP', value: `+${totalExp}`, color: '#9bd8ea' }] }, body: `${harvestedItems.join(' · ')} · EXP +${totalExp}` })
  }
}

handler.command = /^garden$/i
handler.help = ['garden', 'kebun', 'farm', 'tanam']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Berkebun dan memanen tanaman'

export default handler
