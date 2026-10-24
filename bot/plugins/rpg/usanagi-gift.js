
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'

const handler = async (rawM, tools) => {
  const { m } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)

  if (!user.rpg.spouse) {
    return m.reply(`Kamu belum menikah. Nikah dulu dengan \`${m.prefix}marry @user\`.`)
  }

  const args = m.args || []
  const itemKey = args[0]?.toLowerCase()
  const amount = parseInt(args[1]) || 1

  if (!itemKey) {
    return m.reply(`🎁 *Gift*\n\nContoh: \`${m.prefix}gift diamond 1\``)
  }

  if ((user.inventory[itemKey] || 0) < amount) {
    return m.reply(`Item *${itemKey}* kamu tidak cukup. Punya: ${user.inventory[itemKey] || 0}, butuh: ${amount}.`)
  }

  const spouseJid = user.rpg.spouse
  const partner = getUser(spouseJid)

  user.inventory[itemKey] -= amount
  if (user.inventory[itemKey] <= 0) delete user.inventory[itemKey]
  partner.inventory[itemKey] = (partner.inventory[itemKey] || 0) + amount

  user.rpg.love = (user.rpg.love || 0) + amount * 10
  partner.rpg.love = (partner.rpg.love || 0) + amount * 10

  saveUser(m.sender, user)
  saveUser(spouseJid, partner)

  await m.reply(`🎁 *Gift Terkirim*\n\n💝 Memberikan ${amount}x ${itemKey}\n👤 Untuk: @${spouseJid.split('@')[0]}\n💕 Love: +${amount * 10}`, {
    mentions: [spouseJid],
  })
}

handler.command = /^gift$/i
handler.help = ['gift', 'kasih', 'hadiah']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Memberi hadiah ke pasangan untuk meningkatkan love'

export default handler
