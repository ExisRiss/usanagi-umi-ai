/* By AlzRiss - Usanagi Umi AI */

import { saveUser } from './awang-db.js'
import { getBuffValue } from './awang-buff.js'
import { renderRpgCard } from './awang-ui.js'

const EXP_PER_LEVEL = 10000

function calculateLevel(exp) {
  return Math.floor(exp / EXP_PER_LEVEL) + 1
}

function expForLevel(level) {
  return (level - 1) * EXP_PER_LEVEL
}

function getRole(level) {
  if (level >= 100) return 'Mythic'
  if (level >= 80) return 'Legend'
  if (level >= 60) return 'Epic'
  if (level >= 40) return 'Grandmaster'
  if (level >= 20) return 'Master'
  if (level >= 10) return 'Elite'
  return 'Warrior'
}

async function generateLevelUpCard(data) {
  return renderRpgCard('levelup', {
    title: 'LEVEL UP',
    subtitle: `Selamat, ${data.name || 'Player'}!`,
    result: `LEVEL ${data.level}`,
    level: data.level,
    currentXp: data.currentXp,
    requiredXp: data.requiredXp,
    victory: true,
    stats: [
      { label: 'Level', value: data.level, color: '#9b8cff' },
      { label: 'XP', value: `${Number(data.currentXp || 0).toLocaleString()} / ${Number(data.requiredXp || 0).toLocaleString()}`, color: '#68d5ff' },
    ],
  })
}

async function addExpWithLevelCheck(conn, m, user, expAmount) {
  if (!user.rpg) user.rpg = {}

  const oldExp = user.exp || 0
  const expMultiplier = 1 + getBuffValue(user, 'expPercent') / 100
  const appliedExp = Math.max(0, Math.floor((Number(expAmount) || 0) * expMultiplier))
  const newExp = Math.max(0, Math.min(9000000000, oldExp + appliedExp))
  user.exp = newExp

  const oldLevel = calculateLevel(oldExp)
  const newLevel = calculateLevel(newExp)

  if (newLevel <= oldLevel) {
    user.level = newLevel
    saveUser(m.sender, user)
    return { leveledUp: false, notified: false, oldLevel, newLevel: oldLevel }
  }

  user.level = newLevel
  user.rpg.level = newLevel
  user.rpg.maxHealth = 100 + (newLevel - 1) * 10
  user.rpg.maxMana = 100 + (newLevel - 1) * 5
  user.rpg.maxStamina = 100 + (newLevel - 1) * 5
  user.rpg.health = user.rpg.maxHealth
  user.rpg.mana = user.rpg.maxMana
  user.rpg.stamina = user.rpg.maxStamina

  saveUser(m.sender, user)

  if (user.settings?.levelupNotif === false) {
    return { leveledUp: true, notified: false, oldLevel, newLevel }
  }

  const role = getRole(newLevel)
  m.rpgLevelUpEvent = {
    oldLevel,
    newLevel,
    currentXp: newExp,
    requiredXp: expForLevel(newLevel + 1),
    appliedExp,
    role,
  }

  return { leveledUp: true, notified: false, oldLevel, newLevel, appliedExp }

}

export { calculateLevel, expForLevel, getRole, addExpWithLevelCheck, generateLevelUpCard, EXP_PER_LEVEL }

export default {
  calculateLevel,
  expForLevel,
  getRole,
  addExpWithLevelCheck,
  generateLevelUpCard,
  EXP_PER_LEVEL,
}
