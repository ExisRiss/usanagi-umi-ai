
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { enforceCooldown } from '../../lib/rpg/awang-cooldown.js'
import { rupiah } from '../../lib/rpg/awang-format.js'

const BREEDING_RESULTS = {
  'cat+cat': ['cat', 'cat', 'lion'],
  'dog+dog': ['dog', 'dog', 'wolf'],
  'cat+dog': ['cat', 'dog', 'rabbit'],
  'bird+bird': ['bird', 'bird', 'phoenix'],
  'fish+fish': ['fish', 'fish', 'dragon'],
  'rabbit+rabbit': ['rabbit', 'rabbit', 'thunderbunny'],
  'bird+cat': ['cat', 'bird', 'phoenix'],
  'dog+rabbit': ['dog', 'rabbit', 'wolf'],
  default: ['cat', 'dog', 'bird', 'fish', 'rabbit'],
}

const PET_NAMES = {
  cat: '🐱 Kucing',
  dog: '🐕 Anjing',
  bird: '🐦 Burung',
  fish: '🐟 Ikan',
  rabbit: '🐰 Kelinci',
  lion: '🦁 Singa',
  wolf: '🐺 Serigala',
  phoenix: '🔥 Phoenix',
  dragon: '🐉 Naga',
  thunderbunny: '⚡ Thunder Bunny',
}

const BREEDING_COST = 3000

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const targetJid = m.targetJid

  if (!targetJid) {
    return m.reply(
      `💕 *Peternakan & Kawin Silang*\n\n` +
        `\`${m.prefix}breeding @user\`\n\n` +
        `Syarat: kedua pet minimal Level 5, biaya ${rupiah(BREEDING_COST)}.`
    )
  }

  if (targetJid === m.sender) {
    return m.reply(`Tidak bisa breeding dengan diri sendiri.`)
  }

  const user = getUser(m.sender)

  if (!user.rpg.pet) {
    return m.reply(`Kamu belum punya peliharaan. Beli dulu di \`${m.prefix}petshop\`.`)
  }

  const partner = getUser(targetJid)
  if (!partner.rpg.pet) {
    return m.reply(`Target tidak punya peliharaan.`)
  }

  const myPet = user.rpg.pet
  const partnerPet = partner.rpg.pet

  if (myPet.level < 5) return m.reply(`Pet kamu masih Level ${myPet.level}, minimal Level 5.`)
  if (partnerPet.level < 5) return m.reply(`Pet target masih Level ${partnerPet.level}, minimal Level 5.`)

  if (user.koin < BREEDING_COST) {
    return m.reply(`Koin tidak cukup. Butuh ${rupiah(BREEDING_COST)}.`)
  }

  if (await enforceCooldown(m, 'breeding', 3600_000)) return

  user.koin -= BREEDING_COST

  await m.react('💕')
  await m.reply(`💕 ${PET_NAMES[myPet.type]} dan ${PET_NAMES[partnerPet.type]} sedang dipertemukan...`)
  await new Promise((r) => setTimeout(r, 4000))

  const breedKey = [myPet.type, partnerPet.type].sort().join('+')
  const possibleResults = BREEDING_RESULTS[breedKey] || BREEDING_RESULTS.default
  const resultPetType = possibleResults[Math.floor(Math.random() * possibleResults.length)]
  const isRare = ['lion', 'wolf', 'phoenix', 'dragon', 'thunderbunny'].includes(resultPetType)

  const newPet = {
    type: resultPetType,
    name: PET_NAMES[resultPetType]?.split(' ')[1] || 'Baby',
    level: 1,
    exp: 0,
    hunger: 100,
    birthDate: Date.now(),
  }

  user.rpg.petStorage.push(newPet)
  saveUser(m.sender, user)

  const expReward = isRare ? 500 : 200
  await addExpWithLevelCheck(sock, m, user, expReward)

  await m.react(isRare ? '🎉' : '✅')

  let txt = `🍼 *Kelahiran Baru!*\n\n`
  if (isRare) txt += `🎉 Keturunan langka!\n`
  txt += `Spesies: *${PET_NAMES[resultPetType]}*\n\n`
  txt += `EXP: +${expReward}\nBiaya: -${rupiah(BREEDING_COST)}\n\n`
  txt += `Disimpan di Pet Storage (total: ${user.rpg.petStorage.length} ekor).`

  return m.rpgResult(txt, { mentions: [m.sender, targetJid] })
}

handler.command = /^breeding$/i
handler.help = ['breeding', 'breed', 'kawin', 'petbreed']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.description = 'Breeding pet untuk mendapat pet baru'
handler.groupOnly = true

export default handler
