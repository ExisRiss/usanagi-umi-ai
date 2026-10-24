/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { ensureQuestCycle } from '../../lib/rpg/awang-quest.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const QUESTS = [
  { id: 'mining5', name: 'Penambang Pemula', desc: 'Mining 5 kali', target: 5, reward: { money: 10000, exp: 1000 } },
  { id: 'fishing5', name: 'Pemancing Handal', desc: 'Fishing 5 kali', target: 5, reward: { money: 8000, exp: 800 } },
  { id: 'adventure3', name: 'Petualang Sejati', desc: 'Adventure 3 kali', target: 3, reward: { money: 15000, exp: 1500 } },
  { id: 'work10', name: 'Pekerja Keras', desc: 'Work 10 kali', target: 10, reward: { money: 20000, exp: 2000 } },
  { id: 'hunt5', name: 'Pemburu Ulung', desc: 'Hunt 5 kali', target: 5, reward: { money: 12000, exp: 1200 } },
]

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  ensureQuestCycle(user)
  const args = m.args || []
  const sub = args[0]?.toLowerCase()

  if (sub === 'claim') {
    const questId = args[1]
    if (!questId || !user.quest[questId]) {
      return m.reply(`Misi itu tidak ada di daftar kamu.`)
    }

    const quest = QUESTS.find((q) => q.id === questId)
    if (!quest) return m.reply(`ID misi salah. Cek \`${m.prefix}quest\`.`)

    if (user.quest[questId].progress < quest.target) {
      return m.reply(`Misi belum selesai. Progress: ${user.quest[questId].progress}/${quest.target}.`)
    }

    if (user.quest[questId].claimed) {
      return m.reply(`Hadiah misi ini sudah diambil.`)
    }

    user.koin += quest.reward.money
    user.quest[questId].claimed = true
    saveUser(m.sender, user)

    await addExpWithLevelCheck(sock, m, user, quest.reward.exp)

    return sendRpgCard(sock, m, { type: 'quest', headerTitle: 'QUEST', headerSubtitle: 'Hadiah misi', data: { title: 'QUEST COMPLETE', subtitle: quest.name, questName: quest.name, result: 'Misi selesai', victory: true, stats: [{ label: 'Coin', value: `+${rupiah(quest.reward.money)}`, color: '#b88828' }, { label: 'EXP', value: `+${quest.reward.exp}`, color: '#7c8ed2' }] }, body: `${quest.name}\nCoin +${rupiah(quest.reward.money)} · EXP +${quest.reward.exp}` })
  }

  if (sub === 'take') {
    const questId = args[1]
    const quest = QUESTS.find((q) => q.id === questId)
    if (!quest) return m.reply(`Misi tidak ditemukan. Cek \`${m.prefix}quest\`.`)

    if (user.quest[questId]) {
      return m.reply(`Kamu sudah mengambil misi ini.`)
    }

    user.quest[questId] = { progress: 0, claimed: false, takenAt: Date.now() }
    saveUser(m.sender, user)

    return sendRpgCard(sock, m, { type: 'quest', headerTitle: 'QUEST', headerSubtitle: 'Misi baru', data: { title: 'QUEST ACCEPTED', subtitle: quest.name, questName: quest.name, result: quest.desc, victory: true, stats: [{ label: 'Coin', value: rupiah(quest.reward.money), color: '#b88828' }, { label: 'EXP', value: String(quest.reward.exp), color: '#7c8ed2' }] }, body: `${quest.name}\n${quest.desc}` })
  }

  let txt = `📌 *Papan Misi Harian*\n\n`

  for (const quest of QUESTS) {
    const userQuest = user.quest[quest.id]
    let status = '📜 Tersedia'
    if (userQuest) {
      if (userQuest.claimed) status = '✅ Selesai'
      else if (userQuest.progress >= quest.target) status = '🎁 Siap Diklaim'
      else status = `🏃 ${userQuest.progress}/${quest.target}`
    }

    txt += `🎯 *${quest.name}*\n${quest.desc}\nReward: ${rupiah(quest.reward.money)} + ${quest.reward.exp} EXP\nStatus: ${status}\n→ \`${m.prefix}quest take ${quest.id}\`\n\n`
  }

  txt += `Klaim dengan \`${m.prefix}quest claim <id>\`.`

  await m.reply(txt)
}

handler.command = /^quest$/i
handler.help = ['quest', 'misi', 'mission', 'bounty']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Mengambil quest untuk reward bonus'

export default handler
