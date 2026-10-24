/* By AlzRiss - Usanagi Umi AI */

const QUEST_MAP = {
  mining: 'mining5',
  fishing: 'fishing5',
  adventure: 'adventure3',
  work: 'work10',
  hunt: 'hunt5',
}

function getTodayKey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
}

function ensureQuestCycle(user) {
  if (!user.quest || typeof user.quest !== 'object') user.quest = {}
  const today = getTodayKey()
  if (user.rpg?.questDate !== today) {
    user.quest = {}
    if (user.rpg) user.rpg.questDate = today
  }
}

function trackQuestProgress(user, activityType, amount = 0) {
  if (!user.rpg) user.rpg = {}
  ensureQuestCycle(user)

  const questId = QUEST_MAP[activityType]
  if (questId && user.quest[questId] && !user.quest[questId].claimed) {
    user.quest[questId].progress = Math.max(0, (user.quest[questId].progress || 0) + Math.max(1, Number(amount) || 1))
  }

  const challenge = user.rpg.dailyChallenge
  if (!challenge || challenge.date !== getTodayKey() || challenge.claimed) return

  const challengeTypeMap = {
    mining: 'mine',
    fishing: 'fish',
    harvest: 'harvest',
    craft: 'craft',
    expedition: 'expedition',
    kill: 'kill',
  }

  if (activityType === 'earn' && challenge.type === 'earn') {
    challenge.progress = Math.min(challenge.target, (challenge.progress || 0) + Math.max(0, Number(amount) || 0))
    return
  }

  if (challengeTypeMap[activityType] === challenge.type) {
    const increment = Math.max(1, Number(amount) || 1)
    challenge.progress = Math.min(challenge.target, (challenge.progress || 0) + increment)
  }
}

export { trackQuestProgress, ensureQuestCycle, getTodayKey }

export default { trackQuestProgress, ensureQuestCycle, getTodayKey }
