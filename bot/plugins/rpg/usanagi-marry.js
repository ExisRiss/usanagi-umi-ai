
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { rupiah } from '../../lib/rpg/awang-format.js'

const MARRIAGE_COST = 50000

const handler = async (rawM, tools) => {
  const { m } = buildRpgContext(rawM, tools)
  const target = m.targetJid

  if (!target) {
    let txt = `💒 *Catatan Sipil RPG*\n\n`
    txt += `\`${m.prefix}marry @user\`\n\n`
    txt += `💍 Biaya: ${rupiah(MARRIAGE_COST)}\n(Pastikan target belum menikah.)`
    return m.reply(txt)
  }

  if (target === m.sender) {
    return m.reply(`Tidak bisa menikahi diri sendiri.`)
  }

  const user = getUser(m.sender)
  const partner = getUser(target)

  if (user.rpg.spouse) {
    return m.reply(`Kamu sudah menikah dengan @${user.rpg.spouse.split('@')[0]}. Cerai dulu lewat \`${m.prefix}divorce\`.`, {
      mentions: [user.rpg.spouse],
    })
  }

  if (partner.rpg.spouse) {
    return m.reply(`@${target.split('@')[0]} sudah menikah dengan orang lain.`, { mentions: [target] })
  }

  if (user.koin < MARRIAGE_COST) {
    return m.reply(`Koin tidak cukup. Biaya nikah ${rupiah(MARRIAGE_COST)}, koin kamu ${rupiah(user.koin)}.`)
  }

  user.koin -= MARRIAGE_COST
  user.rpg.spouse = target
  user.rpg.marriedAt = Date.now()
  partner.rpg.spouse = m.sender
  partner.rpg.marriedAt = Date.now()

  saveUser(m.sender, user)
  saveUser(target, partner)

  await m.react('💍')
  await m.reply(
    `💒 *Pengumuman Pernikahan*\n\n@${m.sender.split('@')[0]} 💖 @${target.split('@')[0]}\n\nResmi menjadi pasangan!\n💍 Biaya: -${rupiah(MARRIAGE_COST)}`,
    { mentions: [m.sender, target] }
  )
}

handler.command = /^marry$/i
handler.help = ['marry', 'nikah', 'wedding', 'propose']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.description = 'Menikahi player lain'
handler.groupOnly = true

export default handler
