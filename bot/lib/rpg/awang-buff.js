/* By AlzRiss - Usanagi Umi AI */

function getActiveBuffs(user) {
  if (!user.rpg) user.rpg = {}
  if (!user.rpg.buffs || typeof user.rpg.buffs !== 'object') user.rpg.buffs = {}
  const now = Date.now()
  for (const [key, buff] of Object.entries(user.rpg.buffs)) {
    if (!buff || Number(buff.expiresAt) <= now) delete user.rpg.buffs[key]
  }
  return user.rpg.buffs
}

function getBuffValue(user, key) {
  const buff = getActiveBuffs(user)[key]
  return buff ? Number(buff.value) || 0 : 0
}

function setTimedBuff(user, key, value, durationMs) {
  const buffs = getActiveBuffs(user)
  buffs[key] = { value: Number(value) || 0, expiresAt: Date.now() + Math.max(1, Number(durationMs) || 1) }
  return buffs[key]
}

export { getActiveBuffs, getBuffValue, setTimedBuff }

export default { getActiveBuffs, getBuffValue, setTimedBuff }
