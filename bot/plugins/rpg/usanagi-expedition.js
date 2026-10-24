/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { formatTimer } from '../../lib/rpg/awang-format.js'
import { trackQuestProgress } from '../../lib/rpg/awang-quest.js'
import { sendRpgCard } from '../../lib/rpg/awang-ui.js'

const EXPEDITIONS = {
  forest: { name: '🌲 Hutan Laba-laba', duration: 1_800_000, rewards: ['wood', 'herb'], exp: 100, minLevel: 1 },
  cave: { name: '🏔️ Gua Kelelawar', duration: 3_600_000, rewards: ['iron', 'gold', 'gem'], exp: 200, minLevel: 5 },
  volcano: { name: '🌋 Gunung Naga', duration: 7_200_000, rewards: ['lava', 'dragonscale', 'titancore'], exp: 400, minLevel: 15 },
  ocean: { name: '🌊 Samudra Kraken', duration: 5_400_000, rewards: ['fish', 'pearl', 'seagem'], exp: 300, minLevel: 10 },
  ruins: { name: '🏛️ Reruntuhan Kuno', duration: 10_800_000, rewards: ['ancientcoin', 'relic', 'mysterybox'], exp: 600, minLevel: 20 },
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  const args = m.args || []
  const action = args[0]?.toLowerCase()
  const expType = args[1]?.toLowerCase()

  const maxExpeditions = Math.min(5, 1 + Math.floor(user.level / 10))

  if (!action || !['start', 'claim', 'status', 'list'].includes(action)) {
    let txt = `🗺️ *Markas Ekspedisi*\n\n`
    txt += `\`${m.prefix}expedition list\`\n`
    txt += `\`${m.prefix}expedition start <area>\`\n`
    txt += `\`${m.prefix}expedition status\`\n`
    txt += `\`${m.prefix}expedition claim\`\n\n`
    txt += `Kapasitas: ${user.rpg.expeditions.length}/${maxExpeditions}`
    return m.reply(txt)
  }

  if (action === 'list') {
    let txt = `📜 *Peta Ekspedisi*\n\n`
    for (const [key, exp] of Object.entries(EXPEDITIONS)) {
      const canGo = user.level >= exp.minLevel
      txt += `${exp.name} ${canGo ? '🔓' : '🔒'}\n`
      txt += `Waktu: ${formatTimer(exp.duration)} | EXP: ${exp.exp} | Min Lv.${exp.minLevel}\n`
      txt += `Loot: ${exp.rewards.join(', ')}\n→ \`${key}\`\n\n`
    }
    return m.reply(txt)
  }

  if (action === 'start') {
    if (user.rpg.expeditions.length >= maxExpeditions) {
      return m.reply(`Kapasitas ekspedisi penuh (${user.rpg.expeditions.length}/${maxExpeditions}).`)
    }

    if (!expType) return m.reply(`Pilih area tujuan. Contoh: \`${m.prefix}expedition start forest\``)

    const exp = EXPEDITIONS[expType]
    if (!exp) return m.reply(`Area *${expType}* tidak ada di peta.`)
    if (user.level < exp.minLevel) return m.reply(`Butuh Level ${exp.minLevel} untuk ekspedisi ini.`)

    user.rpg.expeditions.push({ type: expType, startedAt: Date.now(), duration: exp.duration })
    saveUser(m.sender, user)

    return m.reply(`🚀 *Ekspedisi Diberangkatkan*\n\nTujuan: ${exp.name}\nEstimasi: ${formatTimer(exp.duration)}\n\nAmbil hasilnya dengan \`${m.prefix}expedition claim\`.`)
  }

  if (action === 'status') {
    if (user.rpg.expeditions.length === 0) {
      return m.reply(`Belum ada ekspedisi berjalan.`)
    }

    let txt = `⏳ *Status Ekspedisi*\n\n`
    user.rpg.expeditions.forEach((exp, i) => {
      const expInfo = EXPEDITIONS[exp.type]
      const elapsed = Date.now() - exp.startedAt
      const remaining = Math.max(0, exp.duration - elapsed)
      const done = remaining <= 0
      txt += `Rombongan ${i + 1} → ${expInfo.name}\n${done ? '✅ Selesai, siap diklaim' : `🕒 Sisa ${formatTimer(remaining)}`}\n\n`
    })
    return m.reply(txt)
  }

  if (action === 'claim') {
    const completed = user.rpg.expeditions.filter((e) => Date.now() - e.startedAt >= e.duration)

    if (completed.length === 0) {
      return m.reply(`Belum ada ekspedisi yang selesai. Cek \`${m.prefix}expedition status\`.`)
    }

    let totalExp = 0
    const allRewards = []

    for (const exp of completed) {
      const expInfo = EXPEDITIONS[exp.type]
      totalExp += expInfo.exp

      for (const rewardItem of expInfo.rewards) {
        if (Math.random() > 0.4) {
          const qty = Math.floor(Math.random() * 5) + 1
          user.inventory[rewardItem] = (user.inventory[rewardItem] || 0) + qty
          allRewards.push(`${rewardItem} x${qty}`)
        }
      }
    }

    trackQuestProgress(user, 'expedition', completed.length)
    user.rpg.expeditions = user.rpg.expeditions.filter((e) => Date.now() - e.startedAt < e.duration)
    saveUser(m.sender, user)

    await addExpWithLevelCheck(sock, m, user, totalExp)

    await m.react('✅')
    const loot = allRewards.length > 0 ? allRewards.join(', ') : 'Tidak ada item kali ini'
    return sendRpgCard(sock, m, {
      type: 'expedition',
      headerTitle: 'EXPEDITION',
      headerSubtitle: 'Hasil ekspedisi',
      data: {
        title: 'EXPEDITION COMPLETE',
        subtitle: `${completed.length} rombongan kembali`,
        result: 'Ekspedisi selesai',
        victory: true,
        stats: [
          { label: 'EXP', value: `+${totalExp}`, color: '#68d5ff' },
          { label: 'Rombongan', value: String(completed.length), color: '#9b8cff' },
          { label: 'Loot', value: loot, color: '#78e6b0' },
        ],
      },
      body: `EXP +${totalExp} · Loot: ${loot}`,
    })
  }
}

handler.command = /^expedition$/i
handler.help = ['expedition', 'ekspedisi', 'explore']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Mengirim ekspedisi otomatis untuk mencari item'

export default handler
