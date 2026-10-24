
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const PET_TYPES = {
  cat: { name: '🐱 Kucing', baseStats: { attack: 5, defense: 3, luck: 5 }, evolve: 'lion' },
  dog: { name: '🐕 Anjing', baseStats: { attack: 8, defense: 5, luck: 2 }, evolve: 'wolf' },
  bird: { name: '🐦 Burung', baseStats: { attack: 4, defense: 2, luck: 8 }, evolve: 'phoenix' },
  fish: { name: '🐟 Ikan', baseStats: { attack: 2, defense: 2, luck: 10 }, evolve: 'dragon' },
  rabbit: { name: '🐰 Kelinci', baseStats: { attack: 3, defense: 4, luck: 6 }, evolve: 'thunderbunny' },
  lion: { name: '🦁 Singa', baseStats: { attack: 15, defense: 10, luck: 8 }, evolve: null },
  wolf: { name: '🐺 Serigala', baseStats: { attack: 18, defense: 12, luck: 5 }, evolve: null },
  phoenix: { name: '🔥 Phoenix', baseStats: { attack: 12, defense: 8, luck: 15 }, evolve: null },
  dragon: { name: '🐉 Naga', baseStats: { attack: 20, defense: 15, luck: 12 }, evolve: null },
  thunderbunny: { name: '⚡ Thunder Bunny', baseStats: { attack: 10, defense: 12, luck: 18 }, evolve: null },
}

const FOOD_ITEMS = {
  bread: { name: '🍞 Roti', hunger: 10, exp: 5 },
  fish: { name: '🐟 Ikan', hunger: 20, exp: 10 },
  meat: { name: '🍖 Daging', hunger: 30, exp: 15 },
  fruit: { name: '🍎 Buah', hunger: 15, exp: 8 },
}

function applyLevelUp(pet, petInfo) {
  const expNeeded = pet.level * 100
  if (pet.exp < expNeeded) return null

  pet.level += 1
  pet.exp -= expNeeded
  pet.stats = pet.stats || { ...petInfo.baseStats }
  pet.stats.attack += 2
  pet.stats.defense += 1
  pet.stats.luck += 1
  return pet.level
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  const args = m.args || []
  const action = args[0]?.toLowerCase()

  if (!user.rpg.pet) {
    return m.reply(
      `Kamu belum punya peliharaan.\n\nCara dapat:\n🛒 Beli di \`${m.prefix}petshop\`\n💕 Dari \`${m.prefix}breeding\`\n🗡️ Drop dari boss`
    )
  }

  const pet = user.rpg.pet
  const petInfo = PET_TYPES[pet.type]

  if (!action || !['feed', 'train', 'status', 'rename', 'evolve'].includes(action)) {
    const hungerStatus = pet.hunger >= 70 ? '😊 Kenyang' : pet.hunger >= 40 ? '😐 Biasa' : '😰 Lapar'

    let txt = `🐾 *${pet.name}*\n\n`
    txt += `Spesies: ${petInfo.name}\n`
    txt += `Level: ${pet.level} | EXP: ${pet.exp}/${pet.level * 100}\n`
    txt += `Perut: ${pet.hunger}/100 (${hungerStatus})\n\n`
    txt += `⚔️ Attack: ${pet.stats?.attack || petInfo.baseStats.attack}\n`
    txt += `🛡️ Defense: ${pet.stats?.defense || petInfo.baseStats.defense}\n`
    txt += `🍀 Luck: ${pet.stats?.luck || petInfo.baseStats.luck}\n\n`
    txt += `\`${m.prefix}pet feed <makanan>\`\n\`${m.prefix}pet train\`\n\`${m.prefix}pet rename <nama>\`\n`
    if (petInfo.evolve) txt += `\`${m.prefix}pet evolve\`\n`

    return sendRpgCard(sock, m, { type: 'pet', headerTitle: 'PET', headerSubtitle: pet.name, data: { title: pet.name, subtitle: petInfo.name, result: `Level ${pet.level} · Hunger ${pet.hunger}/100`, victory: true, stats: [{ label: 'Attack', value: String(pet.stats?.attack ?? petInfo.baseStats.attack), color: '#b9a6f2' }, { label: 'Defense', value: String(pet.stats?.defense ?? petInfo.baseStats.defense), color: '#9bd8ea' }, { label: 'Luck', value: String(pet.stats?.luck ?? petInfo.baseStats.luck), color: '#e0c17b' }, { label: 'EXP', value: `${pet.exp}/${pet.level * 100}`, color: '#98d2b0' }] }, body: `Level ${pet.level} · Hunger ${pet.hunger}/100 · ${petInfo.name}` })
  }

  if (action === 'feed') {
    const foodKey = args[1]?.toLowerCase()

    if (!foodKey) {
      let txt = `🍖 *Beri Makan ${pet.name}*\n\n`
      for (const [key, food] of Object.entries(FOOD_ITEMS)) {
        const have = user.inventory[key] || 0
        txt += `${food.name} (Punya: ${have}x) — Kenyang +${food.hunger}, EXP +${food.exp}\n→ \`${m.prefix}pet feed ${key}\`\n\n`
      }
      return m.reply(txt)
    }

    const food = FOOD_ITEMS[foodKey]
    if (!food) return m.reply(`Makanan *${foodKey}* tidak dikenal.`)
    if ((user.inventory[foodKey] || 0) < 1) return m.reply(`Kamu tidak punya *${food.name}*.`)
    if (pet.hunger >= 100) return m.reply(`Perut ${pet.name} sudah penuh.`)

    user.inventory[foodKey]--
    if (user.inventory[foodKey] <= 0) delete user.inventory[foodKey]

    pet.hunger = Math.min(100, pet.hunger + food.hunger)
    pet.exp += food.exp

    const newLevel = applyLevelUp(pet, petInfo)
    saveUser(m.sender, user)

    let txt = `🍖 *${pet.name} Makan*\n\n${food.name}\nPerut: +${food.hunger} (${pet.hunger}/100)\n✨ EXP: +${food.exp}`
    if (newLevel) txt += `\n\n🎉 ${pet.name} naik ke Level ${newLevel}!`

    return sendRpgCard(sock, m, { type: 'pet', headerTitle: 'PET', headerSubtitle: pet.name, data: { title: 'FEED COMPLETE', subtitle: pet.name, result: `${food.name} · Hunger ${pet.hunger}/100`, victory: true, stats: [{ label: 'Hunger', value: `+${food.hunger}`, color: '#98d2b0' }, { label: 'EXP', value: `+${food.exp}`, color: '#9bd8ea' }, ...(newLevel ? [{ label: 'Level', value: String(newLevel), color: '#b9a6f2' }] : [])] }, body: `${food.name} · Hunger +${food.hunger} · EXP +${food.exp}${newLevel ? ` · Level ${newLevel}` : ''}` })
  }

  if (action === 'train') {
    if (pet.hunger < 20) {
      return m.reply(`${pet.name} sedang lapar, beri makan dulu sebelum latihan.`)
    }

    pet.hunger = Math.max(0, pet.hunger - 15)
    const expGain = 20 + Math.floor(Math.random() * 20)
    pet.exp += expGain

    const newLevel = applyLevelUp(pet, petInfo)
    saveUser(m.sender, user)

    let txt = `🏃 *${pet.name} Latihan*\n\n✨ EXP: +${expGain}\n😰 Lapar: -15`
    if (newLevel) txt += `\n\n🎉 ${pet.name} naik ke Level ${newLevel}!`

    return sendRpgCard(sock, m, { type: 'pet', headerTitle: 'PET TRAINING', headerSubtitle: pet.name, data: { title: 'TRAINING COMPLETE', subtitle: pet.name, result: `EXP +${expGain}`, victory: true, stats: [{ label: 'EXP', value: `+${expGain}`, color: '#9bd8ea' }, { label: 'Hunger', value: '-15', color: '#e0c17b' }, ...(newLevel ? [{ label: 'Level', value: String(newLevel), color: '#b9a6f2' }] : [])] }, body: `${pet.name} · EXP +${expGain} · Hunger -15${newLevel ? ` · Level ${newLevel}` : ''}` })
  }

  if (action === 'rename') {
    const newName = args.slice(1).join(' ')
    if (!newName || newName.length < 2 || newName.length > 15) {
      return m.reply(`Nama harus 2-15 karakter.`)
    }

    const oldName = pet.name
    pet.name = newName
    saveUser(m.sender, user)

    return m.reply(`Nama diubah dari *${oldName}* menjadi *${newName}*.`)
  }

  if (action === 'evolve') {
    if (!petInfo.evolve) {
      return m.reply(`${pet.name} sudah dalam bentuk evolusi terakhir.`)
    }

    if (pet.level < 10) {
      return m.reply(`${pet.name} masih Level ${pet.level}. Minimal Level 10 untuk evolusi.`)
    }

    const evolvedPet = PET_TYPES[petInfo.evolve]
    pet.type = petInfo.evolve
    pet.stats = { ...evolvedPet.baseStats }
    pet.level = 1
    pet.exp = 0
    saveUser(m.sender, user)

    return sendRpgCard(sock, m, { type: 'pet', headerTitle: 'PET EVOLUTION', headerSubtitle: pet.name, data: { title: 'EVOLUTION COMPLETE', subtitle: evolvedPet.name, result: `${pet.name} → ${evolvedPet.name}`, victory: true, stats: Object.entries(evolvedPet.baseStats).slice(0, 4).map(([label, value]) => ({ label: label.toUpperCase(), value: String(value), color: '#b9a6f2' })) }, body: `${pet.name} berevolusi menjadi ${evolvedPet.name}. Status di-reset.` })
  }
}

handler.command = /^pet$/i
handler.help = ['pet', 'mypet', 'hewanku', 'peliharaan']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Mengelola pet/hewan peliharaan'

export default handler
