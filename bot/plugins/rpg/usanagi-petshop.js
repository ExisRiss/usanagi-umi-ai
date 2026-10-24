/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const PETS_FOR_SALE = {
  cat: { name: '🐱 Kucing', price: 5000, desc: 'Luck tinggi, attack sedang' },
  dog: { name: '🐕 Anjing', price: 6000, desc: 'Attack tinggi, defense bagus' },
  bird: { name: '🐦 Burung', price: 4500, desc: 'Luck sangat tinggi' },
  fish: { name: '🐟 Ikan', price: 3000, desc: 'Murah, bawa keberuntungan' },
  rabbit: { name: '🐰 Kelinci', price: 5500, desc: 'Semua stats seimbang' },
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  const args = m.args || []
  const action = args[0]?.toLowerCase()
  const petKey = args[1]?.toLowerCase()

  if (action !== 'buy') {
    let txt = `🐾 *Toko Hewan Peliharaan*\n\n`
    for (const [key, pet] of Object.entries(PETS_FOR_SALE)) {
      txt += `${pet.name} — ${rupiah(pet.price)}\n${pet.desc}\n→ \`${m.prefix}petshop buy ${key}\`\n\n`
    }
    txt += `💰 Koin kamu: ${rupiah(user.koin)}`
    return m.reply(txt)
  }

  if (!petKey) return m.reply(`Contoh: \`${m.prefix}petshop buy cat\``)

  if (user.rpg.pet) {
    return m.reply(`Kamu sudah punya peliharaan. Coba \`${m.prefix}breeding\` untuk dapat pet baru.`)
  }

  const petToBuy = PETS_FOR_SALE[petKey]
  if (!petToBuy) return m.reply(`Hewan *${petKey}* tidak dijual. Cek \`${m.prefix}petshop\`.`)

  if (user.koin < petToBuy.price) {
    return m.reply(`Koin kurang. Butuh ${rupiah(petToBuy.price)}, koin kamu ${rupiah(user.koin)}.`)
  }

  user.koin -= petToBuy.price
  user.rpg.pet = {
    type: petKey,
    name: petToBuy.name.split(' ')[1] || 'My Pet',
    level: 1,
    exp: 0,
    hunger: 80,
    stats: null,
  }
  saveUser(m.sender, user)

  return sendRpgCard(sock, m, { type: 'petshop', headerTitle: 'PET SHOP', headerSubtitle: petToBuy.name, data: { title: 'ADOPTION COMPLETE', subtitle: petToBuy.name, result: petToBuy.name, victory: true, stats: [{ label: 'Cost', value: `-${rupiah(petToBuy.price)}`, color: '#e0c17b' }] }, body: `${petToBuy.name} diadopsi · Biaya -${rupiah(petToBuy.price)}` })
}

handler.command = /^petshop$/i
handler.help = ['petshop', 'tokopet', 'buypet', 'belipet']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Membeli pet dari toko'

export default handler
