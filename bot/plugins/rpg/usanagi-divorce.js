/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { rupiah } from '../../lib/rpg/awang-format.js'

const DIVORCE_COST = 25000

const handler = async (rawM, tools) => {
  const { m } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)

  if (!user.rpg.spouse) {
    return m.reply(`Kamu belum menikah. Cari pasangan dulu lewat \`${m.prefix}marry @user\`.`)
  }

  if (user.koin < DIVORCE_COST) {
    return m.reply(`Biaya cerai ${rupiah(DIVORCE_COST)}, koin kamu ${rupiah(user.koin)}.`)
  }

  const spouseJid = user.rpg.spouse
  const partner = getUser(spouseJid)

  user.koin -= DIVORCE_COST
  user.rpg.spouse = null
  user.rpg.marriedAt = null

  partner.rpg.spouse = null
  partner.rpg.marriedAt = null

  saveUser(m.sender, user)
  saveUser(spouseJid, partner)

  await m.react('💔')
  await m.reply(
    `⛈️ *Perceraian Resmi*\n\n@${m.sender.split('@')[0]} dan @${spouseJid.split('@')[0]} kini bercerai.\n💸 Biaya: -${rupiah(DIVORCE_COST)}`,
    { mentions: [m.sender, spouseJid] }
  )
}

handler.command = /^divorce$/i
handler.help = ['divorce', 'cerai', 'pisah']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Bercerai dari pasangan'

export default handler
