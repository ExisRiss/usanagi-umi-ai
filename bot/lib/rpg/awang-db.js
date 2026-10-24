/* By AlzRiss - Usanagi Umi AI */

import { unifiedRpg } from './unified-store.js'
const versions = new WeakMap()

import { getDb } from '../../core/awang-sqlite.js'

let schemaReady = false

function ensureSchema() {
  if (schemaReady) return
  const db = getDb()

  db.exec(`
    CREATE TABLE IF NOT EXISTS rpg_users (
      jid TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rpg_guilds (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rpg_cooldowns (
      jid TEXT NOT NULL,
      command TEXT NOT NULL,
      expiresAt INTEGER NOT NULL,
      PRIMARY KEY (jid, command)
    );
  `)

  schemaReady = true
}

function cleanJid(jid = '') {
  const store = unifiedRpg()
  if (store) {
    const key = store.identity(jid)
    if (!key) store.reject('Identitas RPG belum terverifikasi.')
    return key
  }
  return String(jid).split('@')[0]
}

function defaultUser(jid) {
  return {
    jid,
    koin: 0,
    exp: 0,
    level: 1,
    inventory: {},
    settings: {},
    rpg: {
      health: 100,
      maxHealth: 100,
      mana: 100,
      maxMana: 100,
      stamina: 100,
      maxStamina: 100,
      lastStaminaCheck: Date.now(),
      attack: 10,
      defense: 5,
      speed: 10,
      luck: 5,
      spouse: null,
      marriedAt: null,
      love: 0,
      guildId: null,
      pet: null,
      petStorage: [],
      enchants: {},
      expeditions: [],
      garden: { plots: [], maxPlots: 3 },
      dailyChallenge: null,
      buffs: {},
      stats: {
        actions: 0,
        hunt: 0,
        fishing: 0,
        mining: 0,
        farming: 0,
        battle: 0,
        training: 0,
        cooking: 0,
        crafting: 0,
        quests: 0,
        dungeon: 0,
        work: 0,
        crime: 0,
        lastResultMessageId: null,
      },
      lastDaily: 0,
      lastHourly: 0,
    },
    cooldowns: {},
    quest: {},
  }
}

function mergeDefaults(base, saved) {
  if (Array.isArray(base)) return Array.isArray(saved) ? saved : [...base]
  if (!base || typeof base !== 'object') return saved === undefined ? base : saved
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return { ...base }

  const result = { ...base }
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) continue
    result[key] = base[key] && typeof base[key] === 'object' && !Array.isArray(base[key])
      ? mergeDefaults(base[key], value)
      : value
  }
  return result
}

function normalizeUser(user) {
  user.koin = Math.max(0, Number(user.koin) || 0)
  user.exp = Math.max(0, Number(user.exp) || 0)
  user.level = Math.max(1, Math.floor(Number(user.level) || 1))
  user.inventory = user.inventory && typeof user.inventory === 'object' ? user.inventory : {}
  user.quest = user.quest && typeof user.quest === 'object' ? user.quest : {}
  user.rpg = user.rpg && typeof user.rpg === 'object' ? user.rpg : {}
  for (const key of ['health', 'maxHealth', 'mana', 'maxMana', 'stamina', 'maxStamina', 'attack', 'defense', 'speed', 'luck']) {
    user.rpg[key] = Math.max(0, Number(user.rpg[key]) || 0)
  }
  user.rpg.maxHealth = Math.max(1, Number(user.rpg.maxHealth) || 100)
  user.rpg.maxMana = Math.max(1, Number(user.rpg.maxMana) || 100)
  user.rpg.maxStamina = Math.max(1, Number(user.rpg.maxStamina) || 100)
  user.rpg.health = Math.min(Math.max(0, Number(user.rpg.health) || 0), user.rpg.maxHealth)
  user.rpg.mana = Math.min(Math.max(0, Number(user.rpg.mana) || 0), user.rpg.maxMana)
  user.rpg.stamina = Math.min(Math.max(0, Number(user.rpg.stamina) || 0), user.rpg.maxStamina)
  user.rpg.level = Math.max(1, Math.floor(Number(user.rpg.level) || user.level || 1))
  user.rpg.garden = user.rpg.garden && typeof user.rpg.garden === 'object' ? user.rpg.garden : { plots: [], maxPlots: 3 }
  user.rpg.garden.plots = Array.isArray(user.rpg.garden.plots) ? user.rpg.garden.plots : []
  user.rpg.garden.maxPlots = Math.max(1, Number(user.rpg.garden.maxPlots) || 3)
  user.rpg.expeditions = Array.isArray(user.rpg.expeditions) ? user.rpg.expeditions : []
  user.rpg.petStorage = Array.isArray(user.rpg.petStorage) ? user.rpg.petStorage : []
  user.rpg.buffs = user.rpg.buffs && typeof user.rpg.buffs === 'object' ? user.rpg.buffs : {}
  user.rpg.stats = user.rpg.stats && typeof user.rpg.stats === 'object' ? user.rpg.stats : {}
  for (const key of ['actions', 'hunt', 'fishing', 'mining', 'farming', 'battle', 'training', 'cooking', 'crafting', 'quests', 'dungeon', 'work', 'crime']) {
    user.rpg.stats[key] = Math.max(0, Math.floor(Number(user.rpg.stats[key]) || 0))
  }
  user.rpg.stats.lastResultMessageId = user.rpg.stats.lastResultMessageId ? String(user.rpg.stats.lastResultMessageId) : null
  return user
}

const STAMINA_REGEN_PER_HOUR = 5

function applyPassiveStaminaRegen(user) {
  const lastCheck = user.rpg.lastStaminaCheck || Date.now()
  const now = Date.now()
  const hoursPassed = (now - lastCheck) / 3_600_000

  if (hoursPassed >= 1) {
    const regenAmount = Math.floor(hoursPassed * STAMINA_REGEN_PER_HOUR)
    if (regenAmount > 0 && user.rpg.stamina < user.rpg.maxStamina) {
      user.rpg.stamina = Math.min(user.rpg.maxStamina, user.rpg.stamina + regenAmount)
    }
    user.rpg.lastStaminaCheck = now
  }

  return user
}

function getUser(jid) {
  ensureSchema()
  const db = getDb()
  const key = cleanJid(jid)
  const store = unifiedRpg()
  if (store) {
    const saved = store.read(key)
    const user = normalizeUser(applyPassiveStaminaRegen(mergeDefaults(defaultUser(key), saved)))
    if (JSON.stringify(user) !== JSON.stringify(saved)) store.write(key, user, JSON.stringify(saved))
    versions.set(user, JSON.stringify(store.read(key)))
    return user
  }
  const row = db.prepare('SELECT data FROM rpg_users WHERE jid = ?').get(key)

  if (!row) {
    return defaultUser(key)
  }

  try {
    const saved = JSON.parse(row.data)
    const user = normalizeUser(applyPassiveStaminaRegen(mergeDefaults(defaultUser(key), saved)))
    const nextPayload = JSON.stringify(user)
    if (nextPayload !== row.data) {
      db.prepare('UPDATE rpg_users SET data = ? WHERE jid = ?').run(nextPayload, key)
    }
    return user
  } catch {
    return defaultUser(key)
  }
}

function saveUser(jid, userData) {
  ensureSchema()
  const db = getDb()
  const key = cleanJid(jid)
  const store = unifiedRpg()
  if (store) {
    const before = versions.get(userData)
    if (before) store.patch(key, JSON.parse(before), userData)
    else store.write(key, userData)
    versions.set(userData, JSON.stringify(userData))
    return
  }
  const payload = JSON.stringify(userData)

  db.prepare(
    `INSERT INTO rpg_users (jid, data) VALUES (?, ?)
     ON CONFLICT(jid) DO UPDATE SET data = excluded.data`
  ).run(key, payload)
}

const RPG_ACTIVITY_MAP = {
  hunt: 'hunt', berburu: 'hunt', hunting: 'hunt',
  fishing: 'fishing', mancing: 'fishing',
  mining: 'mining', tambang: 'mining',
  garden: 'farming', berladang: 'farming', farming: 'farming', harvest: 'farming',
  battle: 'battle', boss: 'battle', bossrush: 'battle', arena: 'battle', duel: 'battle', challenge: 'battle', gauntlet: 'battle', colosseum: 'battle',
  training: 'training', latihan: 'training',
  cooking: 'cooking', cook: 'cooking',
  alchemy: 'crafting', craft: 'crafting', blacksmith: 'crafting', enchant: 'crafting',
  quest: 'quests', bounty: 'quests', mission: 'quests',
  dungeonrun: 'dungeon',
  work: 'work', beg: 'work', ngemis: 'work', ngamen: 'work', mulung: 'work', nulis: 'work', nyapu: 'work', parkir: 'work', kurir: 'work', ngojek: 'work', freelance: 'work', jualan: 'work', streamer: 'work', rob: 'crime', steal: 'crime', maling: 'crime', crime: 'crime',
}

function recordRpgActivity(jid, user, command, messageId = '') {
  const key = RPG_ACTIVITY_MAP[String(command || '').toLowerCase()]
  if (!key || !messageId || !user) return false
  user.rpg = user.rpg && typeof user.rpg === 'object' ? user.rpg : {}
  user.rpg.stats = user.rpg.stats && typeof user.rpg.stats === 'object' ? user.rpg.stats : {}
  const stats = user.rpg.stats
  if (String(stats.lastResultMessageId || '') === String(messageId)) return false
  stats.actions = Math.max(0, Math.floor(Number(stats.actions) || 0)) + 1
  stats[key] = Math.max(0, Math.floor(Number(stats[key]) || 0)) + 1
  stats.lastResultMessageId = String(messageId)
  user.rpg.stats = stats
  saveUser(jid, user)
  return true
}

function getGuild(guildId) {
  ensureSchema()
  if (unifiedRpg()) return unifiedRpg().document('rpg_guilds', guildId)
  const db = getDb()
  const row = db.prepare('SELECT data FROM rpg_guilds WHERE id = ?').get(guildId)
  if (!row) return null
  try {
    return JSON.parse(row.data)
  } catch {
    return null
  }
}

function saveGuild(guildId, guildData) {
  ensureSchema()
  if (unifiedRpg()) return unifiedRpg().document('rpg_guilds', guildId, guildData)
  const db = getDb()
  const payload = JSON.stringify(guildData)
  db.prepare(
    `INSERT INTO rpg_guilds (id, data) VALUES (?, ?)
     ON CONFLICT(id) DO UPDATE SET data = excluded.data`
  ).run(guildId, payload)
}

function deleteGuild(guildId) {
  ensureSchema()
  if (unifiedRpg()) return unifiedRpg().document('rpg_guilds', guildId, null)
  const db = getDb()
  db.prepare('DELETE FROM rpg_guilds WHERE id = ?').run(guildId)
}

function getAllUsers() {
  ensureSchema()
  if (unifiedRpg()) return unifiedRpg().allUsers().map(user => normalizeUser(mergeDefaults(defaultUser(user.jid), user)))
  const db = getDb()
  return db.prepare('SELECT jid, data FROM rpg_users').all().map((row) => {
    try {
      return normalizeUser(mergeDefaults(defaultUser(row.jid), JSON.parse(row.data)))
    } catch {
      return null
    }
  }).filter(Boolean)
}

function cleanupExpiredCooldowns() {
  ensureSchema()
  return getDb().prepare('DELETE FROM rpg_cooldowns WHERE expiresAt <= ?').run(Date.now()).changes
}

function getAllGuilds() {
  ensureSchema()
  if (unifiedRpg()) return unifiedRpg().documents('rpg_guilds')
  const db = getDb()
  const rows = db.prepare('SELECT data FROM rpg_guilds').all()
  return rows
    .map((r) => {
      try {
        return JSON.parse(r.data)
      } catch {
        return null
      }
    })
    .filter(Boolean)
}

function findGuildByName(name) {
  return getAllGuilds().find((g) => g.name.toLowerCase() === String(name).toLowerCase()) || null
}

function checkCooldown(jid, commandName) {
  ensureSchema()
  const db = getDb()
  const key = cleanJid(jid)
  const store = unifiedRpg()
  if (store) {
    const legacy = db.prepare('SELECT expiresAt FROM rpg_cooldowns WHERE jid=? AND command=?').get(key, commandName)?.expiresAt || 0
    const expires = Math.max(legacy, Number(store.read(key).cooldowns?.[commandName]) || 0)
    const remaining = Math.max(0, expires - Date.now())
    return { onCooldown: remaining > 0, remaining }
  }
  const row = db
    .prepare('SELECT expiresAt FROM rpg_cooldowns WHERE jid = ? AND command = ?')
    .get(key, commandName)

  if (!row) return { onCooldown: false, remaining: 0 }

  const now = Date.now()
  if (row.expiresAt <= now) {
    db.prepare('DELETE FROM rpg_cooldowns WHERE jid = ? AND command = ?').run(key, commandName)
    return { onCooldown: false, remaining: 0 }
  }

  return { onCooldown: true, remaining: row.expiresAt - now }
}

function setCooldown(jid, commandName, durationMs) {
  ensureSchema()
  const db = getDb()
  const key = cleanJid(jid)
  const expiresAt = Date.now() + durationMs
  const store = unifiedRpg()
  if (store) {
    const user = store.read(key); user.cooldowns = user.cooldowns || {}
    Object.defineProperty(user.cooldowns, commandName, { value: expiresAt, enumerable: true, configurable: true, writable: true })
    store.write(key, user); return
  }

  db.prepare(
    `INSERT INTO rpg_cooldowns (jid, command, expiresAt) VALUES (?, ?, ?)
     ON CONFLICT(jid, command) DO UPDATE SET expiresAt = excluded.expiresAt`
  ).run(key, commandName, expiresAt)
}

function extendCooldown(jid, commandName, extraMs) {
  const current = checkCooldown(jid, commandName)
  const base = current.onCooldown ? Date.now() + current.remaining : Date.now()
  ensureSchema()
  const db = getDb()
  const key = cleanJid(jid)
  const expiresAt = base + extraMs
  const store = unifiedRpg()
  if (store) {
    const user = store.read(key); user.cooldowns = user.cooldowns || {}
    Object.defineProperty(user.cooldowns, commandName, { value: expiresAt, enumerable: true, configurable: true, writable: true })
    store.write(key, user); return
  }

  db.prepare(
    `INSERT INTO rpg_cooldowns (jid, command, expiresAt) VALUES (?, ?, ?)
     ON CONFLICT(jid, command) DO UPDATE SET expiresAt = excluded.expiresAt`
  ).run(key, commandName, expiresAt)
}

export {
  getUser,
  saveUser,
  getGuild,
  saveGuild,
  deleteGuild,
  getAllUsers,
  getAllGuilds,
  cleanupExpiredCooldowns,
  findGuildByName,
  checkCooldown,
  setCooldown,
  extendCooldown,
  cleanJid,
  recordRpgActivity,
}

export default {
  getUser,
  saveUser,
  getGuild,
  saveGuild,
  deleteGuild,
  getAllUsers,
  getAllGuilds,
  cleanupExpiredCooldowns,
  findGuildByName,
  checkCooldown,
  setCooldown,
  extendCooldown,
  cleanJid,
  recordRpgActivity,
}
