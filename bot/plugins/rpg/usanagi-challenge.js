
import { getUser, saveUser } from '../../lib/rpg/awang-db.js'
import { buildRpgContext } from '../../lib/rpg/awang-context.js'
import { addExpWithLevelCheck } from '../../lib/rpg/awang-level.js'
import { rupiah } from '../../lib/rpg/awang-format.js'
import { getTodayKey } from '../../lib/rpg/awang-quest.js'

const CHALLENGES = [
  { name: '⚔️ Kalahkan 5 Monster', type: 'kill', target: 5, reward: { gold: 500, exp: 200 } },
  { name: '🎣 Tangkap 3 Ikan', type: 'fish', target: 3, reward: { gold: 300, exp: 150 } },
  { name: '⛏️ Tambang 10 Ore', type: 'mine', target: 10, reward: { gold: 400, exp: 180 } },
  { name: '🌱 Panen 5 Hasil Kebun', type: 'harvest', target: 5, reward: { gold: 350, exp: 160 } },
  { name: '🧪 Racik 3 Potion', type: 'craft', target: 3, reward: { gold: 450, exp: 190 } },
  { name: '💰 Kumpulkan 1000 Koin', type: 'earn', target: 1000, reward: { gold: 500, exp: 250 } },
  { name: '🗺️ Selesaikan 2 Ekspedisi', type: 'expedition', target: 2, reward: { gold: 600, exp: 300 } },
]

function getNewDailyChallenge() {
  return {
    ...CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)],
    progress: 0,
    date: getTodayKey(),
    claimed: false,
  }
}

const handler = async (rawM, tools) => {
  const { m, sock } = buildRpgContext(rawM, tools)
  const user = getUser(m.sender)
  const today = getTodayKey()

  if (!user.rpg.dailyChallenge || user.rpg.dailyChallenge.date !== today) {
    user.rpg.dailyChallenge = getNewDailyChallenge()
    saveUser(m.sender, user)
  }

  const challenge = user.rpg.dailyChallenge
  const isComplete = challenge.progress >= challenge.target
  const args = m.args || []
  const action = args[0]?.toLowerCase()

  if (action === 'claim') {
    if (!isComplete) {
      return m.reply(`Tantangan belum selesai. Progress: ${challenge.progress}/${challenge.target}.`)
    }

    if (challenge.claimed) {
      return m.reply(`Hadiah hari ini sudah diambil. Tunggu tantangan besok.`)
    }

    user.koin += challenge.reward.gold
    challenge.claimed = true
    saveUser(m.sender, user)

    await addExpWithLevelCheck(sock, m, user, challenge.reward.exp)

    await m.react('🎉')
    return m.rpgTextResult(`🎉 *Tantangan Selesai!*\n\n💰 Koin: +${rupiah(challenge.reward.gold)}\n✨ EXP: +${challenge.reward.exp}\n\nTantangan baru besok!`)
  }

  let txt = `📋 *Tantangan Harian*\n\n`
  txt += `🎯 ${challenge.name}\n📊 Progress: ${challenge.progress}/${challenge.target}\n`
  txt += `Status: ${isComplete ? '✅ Bisa diklaim' : '⏳ Sedang dikerjakan'}\n\n`
  txt += `🎁 Hadiah: ${rupiah(challenge.reward.gold)} + ${challenge.reward.exp} EXP\n\n`

  if (isComplete && !challenge.claimed) {
    txt += `Ketik \`${m.prefix}challenge claim\` untuk klaim.`
  } else if (challenge.claimed) {
    txt += `Sudah diklaim. Misi baru besok.`
  } else {
    txt += `Selesaikan misi untuk klaim hadiah.`
  }

  return m.reply(txt)
}

handler.command = /^challenge$/i
handler.help = ['challenge', 'dailychallenge', 'tantangan']
handler.tags = ['rpg']
handler.category = 'rpg'
handler.groupOnly = true
handler.description = 'Tantangan harian untuk hadiah spesial'

export default handler
