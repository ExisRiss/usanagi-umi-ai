/* By AlzRiss - Usanagi Umi AI */

import { getUser, saveUser, checkCooldown, setCooldown } from './awang-db.js'
import { addExpWithLevelCheck } from './awang-level.js'
import { sendRpgCard } from './awang-ui.js'
import { number, rupiah } from './awang-format.js'

const REGIONS = {
  verdant: { name: 'Verdant Reach', scene: 'forest', palette: 'verdant', discoveries: ['Whispering Grove', 'Mossfall Creek', 'Sunroot Meadow', 'Ranger Post'] },
  azure: { name: 'Azure Coast', scene: 'ocean', palette: 'azure', discoveries: ['Coral Shelf', 'Moonlit Pier', 'Tideglass Bay', 'Sailor Shrine'] },
  ember: { name: 'Ember Vale', scene: 'forge', palette: 'ember', discoveries: ['Cinder Quarry', 'Ashen Road', 'Molten Bridge', 'Forge Hamlet'] },
  dusk: { name: 'Duskmoor', scene: 'ruins', palette: 'dusk', discoveries: ['Broken Obelisk', 'Sunken Gate', 'Grave Lantern', 'Night Archive'] },
  astral: { name: 'Astral Highlands', scene: 'magic', palette: 'astral', discoveries: ['Starfall Ridge', 'Aether Spring', 'Sky Ruins', 'Moon Observatory'] },
}

const NPCS = {
  mira: { name: 'Mira', role: 'Cartographer', palette: 'atlas' },
  orin: { name: 'Orin', role: 'Blacksmith', palette: 'ember' },
  selene: { name: 'Selene', role: 'Archivist', palette: 'astral' },
  brann: { name: 'Brann', role: 'Ranger', palette: 'verdant' },
  kaia: { name: 'Kaia', role: 'Sailor', palette: 'azure' },
}

const SEASONS = [
  { name: 'Springtide', bonus: 'Exploration finds +10%' },
  { name: 'Suncrest', bonus: 'Crafting costs -5%' },
  { name: 'Harvestfall', bonus: 'Food and farm rewards +10%' },
  { name: 'Frostveil', bonus: 'Dungeon loot +10%' },
]

const EVENTS = [
  { key: 'ruins', name: 'Ruins Relay', goal: 600, reward: 12000, item: 'relicshard' },
  { key: 'tide', name: 'Tidefront Rally', goal: 500, reward: 10000, item: 'pearl' },
  { key: 'forge', name: 'Forge Marathon', goal: 700, reward: 14000, item: 'steel' },
  { key: 'grove', name: 'Grove Expedition', goal: 550, reward: 11000, item: 'ancientwood' },
]

const MARKET_ITEMS = {
  wheat: 90,
  rice: 90,
  herb: 210,
  fish: 150,
  iron: 260,
  coal: 70,
  gold: 1100,
  diamond: 6200,
  leather: 90,
  wood: 85,
}

const CRAFT_RECIPES = {
  refine: { name: 'Refined Stone', materials: { rock: 4 }, output: { item: 'refinedstone', qty: 3 }, coins: 80 },
  smelt: { name: 'Steel Bar', materials: { iron: 3, coal: 2 }, output: { item: 'steel', qty: 1 }, coins: 180 },
  tannery: { name: 'Tanned Leather', materials: { leather: 3 }, output: { item: 'tannedleather', qty: 2 }, coins: 120 },
  mill: { name: 'Flour', materials: { wheat: 3 }, output: { item: 'flour', qty: 2 }, coins: 60 },
  baitshop: { name: 'Premium Bait', materials: { rice: 2, herb: 1 }, output: { item: 'bait', qty: 3 }, coins: 100 },
  trapcraft: { name: 'Hunter Trap', materials: { wood: 2, iron: 1 }, output: { item: 'trap', qty: 1 }, coins: 140 },
  fertilizer: { name: 'Fertilizer', materials: { herb: 2, trash: 1 }, output: { item: 'fertilizer', qty: 2 }, coins: 90 },
  salvage: { name: 'Salvage Kit', materials: { trash: 4, rock: 1 }, output: { item: 'salvagekit', qty: 1 }, coins: 70 },
  tradehouse: { name: 'Gold Exchange', materials: { iron: 5, coal: 2 }, output: { item: 'gold', qty: 1 }, coins: 120 },
}

const BLUEPRINTS = {
  relicframe: { name: 'Relic Frame', cost: 8000 },
  arcanecore: { name: 'Arcane Core', cost: 12000 },
  expeditionkit: { name: 'Expedition Kit', cost: 6000 },
  masterforge: { name: 'Master Forge', cost: 15000 },
}

const FEATURE_TITLES = {
  worldmap: ['ATLAS OF USANAGI', 'WORLD NAVIGATION', 'map', 'atlas'],
  scout: ['SCOUTING RUN', 'FIELD DISCOVERY', 'explore', 'verdant'],
  voyage: ['BLUEWATER VOYAGE', 'TRAVEL ROUTE', 'travel', 'azure'],
  campfire: ['CAMPFIRE REST', 'FIELD RECOVERY', 'camp', 'camp'],
  shrine: ['ANCIENT SHRINE', 'BLESSING CHOICE', 'choice', 'magic'],
  portal: ['AETHER PORTAL', 'INSTANT TRAVEL', 'portal', 'astral'],
  landmark: ['LANDMARK SEEKER', 'DISCOVERY LOG', 'ruins', 'dusk'],
  survey: ['CARTOGRAPHER SURVEY', 'MAPPING FIELDWORK', 'map', 'atlas'],
  archaeology: ['ARCHAEOLOGY DIG', 'RELIC HUNT', 'artifact', 'dusk'],
  museum: ['MUSEUM ARCHIVE', 'CURATION HALL', 'museum', 'atlas'],
  tower: ['SKY TOWER', 'ASCENT CHALLENGE', 'tower', 'astral'],
  ascension: ['TOWER ASCENSION', 'FLOOR BREAKER', 'tower', 'ember'],
  bossrush: ['BOSS RUSH', 'ELITE GAUNTLET', 'combat', 'battle'],
  gauntlet: ['IRON GAUNTLET', 'SURVIVAL SERIES', 'combat', 'dusk'],
  bountyboard: ['BOUNTY BOARD', 'ACTIVE CONTRACTS', 'board', 'atlas'],
  bountyclaim: ['BOUNTY CLAIM', 'CONTRACT PAYOUT', 'board', 'gold'],
  colosseum: ['ROYAL COLOSSEUM', 'RANKED CHALLENGE', 'combat', 'battle'],
  trials: ['TRIALS OF USANAGI', 'CHOOSE YOUR TRIAL', 'choice', 'magic'],
  dungeonkey: ['DUNGEON KEYWORK', 'FORGE ACCESS', 'forge', 'ember'],
  dungeonrun: ['DUNGEON RUN', 'ROOM-BY-ROOM RAID', 'dungeon', 'dusk'],
  blueprint: ['BLUEPRINT ARCHIVE', 'TECHNICAL SCHEMATICS', 'forge', 'atlas'],
  dismantle: ['DISMANTLE BENCH', 'RECLAIM MATERIALS', 'forge', 'ember'],
  refine: ['REFINERY', 'MATERIAL PURIFICATION', 'forge', 'mining'],
  smelt: ['STEEL FOUNDRY', 'HIGH-TEMPERATURE WORK', 'forge', 'ember'],
  tannery: ['LEATHERWORKS', 'CRAFTING HALL', 'workshop', 'verdant'],
  mill: ['WINDMILL WORKS', 'GRAIN PROCESSING', 'farm', 'verdant'],
  baitshop: ['BAIT WORKSHOP', 'FISHING PREP', 'ocean', 'azure'],
  trapcraft: ['TRAPMAKER', 'HUNTER WORKSHOP', 'hunt', 'verdant'],
  fertilizer: ['FERTILIZER LAB', 'SOIL ENHANCEMENT', 'farm', 'verdant'],
  irrigate: ['IRRIGATION STATION', 'GARDEN SUPPORT', 'farm', 'azure'],
  ranch: ['RANCH YARD', 'LIVESTOCK MANAGEMENT', 'ranch', 'verdant'],
  milk: ['MILKING HOUSE', 'DAILY HARVEST', 'ranch', 'cream'],
  shear: ['SHEARING YARD', 'WOOL HARVEST', 'ranch', 'verdant'],
  inn: ['TRAVELERS INN', 'RECOVERY ROOM', 'inn', 'cream'],
  tavern: ['ADVENTURER TAVERN', 'RUMOR BOARD', 'tavern', 'ember'],
  library: ['GRAND LIBRARY', 'LORE COLLECTION', 'library', 'astral'],
  study: ['STUDY CHAMBER', 'KNOWLEDGE TRAINING', 'library', 'astral'],
  journal: ['ADVENTURE JOURNAL', 'RECENT MEMORIES', 'journal', 'dusk'],
  npc: ['TOWN CONTACTS', 'KNOWN NPCS', 'npc', 'atlas'],
  talk: ['SOCIAL ENCOUNTER', 'CONVERSATION ROUTE', 'npc', 'atlas'],
  friendship: ['FRIENDSHIP LEDGER', 'RELATIONSHIP PROGRESS', 'npc', 'rose'],
  giftnpc: ['GIFT DELIVERY', 'RELATIONSHIP GIFTING', 'npc', 'rose'],
  recruit: ['COMPANION RECRUITMENT', 'PARTY ROSTER', 'party', 'atlas'],
  party: ['PARTY CAMP', 'COMPANION ROSTER', 'party', 'forest'],
  partytrain: ['PARTY TRAINING', 'TEAM PROGRESSION', 'party', 'battle'],
  petcare: ['PET CARE', 'COMPANION WELLNESS', 'pet', 'cream'],
  petheal: ['PET CLINIC', 'COMPANION RECOVERY', 'pet', 'cream'],
  petbond: ['PET BONDING', 'TRUST TRAINING', 'pet', 'rose'],
  pettalent: ['PET TALENTS', 'COMPANION SPECIALIZATION', 'pet', 'astral'],
  petskill: ['PET SKILL RUN', 'COMPANION ABILITY', 'pet', 'magic'],
  petarena: ['PET ARENA', 'COMPANION DUEL', 'pet', 'battle'],
  season: ['WORLD SEASON', 'CURRENT CLIMATE', 'weather', 'atlas'],
  eventboard: ['EVENT BOARD', 'WEEKLY FESTIVITIES', 'event', 'gold'],
  eventjoin: ['EVENT REGISTRATION', 'WEEKLY PARTICIPATION', 'event', 'festival'],
  eventscore: ['EVENT RUN', 'SCORE ATTEMPT', 'event', 'festival'],
  eventredeem: ['EVENT REWARD', 'PRIZE CLAIM', 'event', 'gold'],
  achievement: ['ACHIEVEMENT HALL', 'MILESTONE COLLECTION', 'achievement', 'gold'],
  codex: ['WORLD CODEX', 'DISCOVERY ARCHIVE', 'codex', 'astral'],
  titles: ['TITLE VAULT', 'HEROIC TITLES', 'achievement', 'gold'],
  reputation: ['REPUTATION BOARD', 'FACTION STANDING', 'board', 'atlas'],
  milestone: ['MILESTONE TRACKER', 'PROGRESSION CHECK', 'achievement', 'gold'],
  collection: ['COLLECTION ROOM', 'TROPHY DISPLAY', 'museum', 'cream'],
  auction: ['AUCTION HALL', 'LIMITED OFFERS', 'market', 'gold'],
  bid: ['AUCTION DUEL', 'BID CHALLENGE', 'market', 'battle'],
  market: ['TRAVELING MARKET', 'DYNAMIC PRICES', 'market', 'atlas'],
  merchantroute: ['MERCHANT ROUTE', 'TRADE EXPEDITION', 'market', 'ember'],
  loan: ['RPG CREDIT OFFICE', 'CAPITAL SERVICE', 'bank', 'atlas'],
  repay: ['DEBT SETTLEMENT', 'CREDIT CLEARANCE', 'bank', 'cream'],
  insurance: ['ADVENTURER INSURANCE', 'RISK PROTECTION', 'bank', 'azure'],
  tradehouse: ['TRADE HOUSE', 'RESOURCE EXCHANGE', 'market', 'gold'],
  salvage: ['SALVAGE YARD', 'RECOVERY WORKSHOP', 'workshop', 'mining'],
  workshop: ['WORKSHOP', 'CRAFTING FACILITY', 'workshop', 'ember'],
  furnish: ['HOUSE FURNISHING', 'ROOM CUSTOMIZATION', 'house', 'cream'],
  house: ['PLAYER HOUSE', 'HOME MANAGEMENT', 'house', 'verdant'],
  expeditionlog: ['EXPEDITION LOG', 'FIELD HISTORY', 'expedition', 'atlas'],
  weather: ['WORLD WEATHER', 'LIVE CONDITIONS', 'weather', 'azure'],
  festival: ['SEASONAL FESTIVAL', 'CELEBRATION CHOICE', 'festival', 'rose'],
  sanctuary: ['SANCTUARY', 'PERMANENT BLESSING', 'shrine', 'astral'],
  artifactforge: ['ARTIFACT FORGE', 'RELIC ASSEMBLY', 'artifact', 'ember'],
  relic: ['RELIC VAULT', 'ANCIENT EQUIPMENT', 'artifact', 'astral'],
  relicforge: ['RELIC FORGE', 'MYTHIC CREATION', 'artifact', 'ember'],
  outpost: ['FRONTIER OUTPOST', 'REGION FORTIFICATION', 'outpost', 'verdant'],
  profession: ['PROFESSION HALL', 'CAREER SPECIALIZATION', 'profession', 'atlas'],
}

const FEATURES = Object.fromEntries(Object.entries(FEATURE_TITLES).map(([key, [title, subtitle, kind, palette]]) => [key, { key, title, subtitle, kind, palette }]))

for (const key of ['scout', 'landmark', 'survey']) FEATURES[key].mode = 'explore'
for (const key of ['worldmap', 'season', 'eventboard', 'npc', 'party', 'house', 'expeditionlog', 'journal', 'weather', 'codex', 'reputation', 'collection']) FEATURES[key].mode = 'info'
for (const key of ['voyage', 'portal']) FEATURES[key].mode = 'travel'
FEATURES.outpost.mode = 'outpost'
for (const key of ['campfire', 'inn', 'tavern', 'sanctuary']) FEATURES[key].mode = 'recovery'
for (const key of ['shrine', 'trials', 'festival']) FEATURES[key].mode = 'choice'
for (const key of ['archaeology']) FEATURES[key].mode = 'artifact'
for (const key of ['museum']) FEATURES[key].mode = 'museum'
for (const key of ['tower', 'ascension']) FEATURES[key].mode = 'tower'
for (const key of ['bossrush', 'gauntlet', 'colosseum', 'dungeonrun']) FEATURES[key].mode = 'combat'
FEATURES.dungeonkey.mode = 'dungeonkey'
for (const key of ['blueprint']) FEATURES[key].mode = 'blueprint'
for (const key of ['dismantle']) FEATURES[key].mode = 'dismantle'
for (const key of ['refine', 'smelt', 'tannery', 'mill', 'baitshop', 'trapcraft', 'fertilizer', 'tradehouse', 'salvage']) FEATURES[key].mode = 'craft'
FEATURES.irrigate.mode = 'irrigate'
FEATURES.ranch.mode = 'ranch'
for (const key of ['milk', 'shear']) FEATURES[key].mode = 'ranchoutput'
for (const key of ['library', 'study']) FEATURES[key].mode = 'knowledge'
FEATURES.talk.mode = 'talk'
FEATURES.friendship.mode = 'friendship'
FEATURES.giftnpc.mode = 'giftnpc'
FEATURES.recruit.mode = 'recruit'
FEATURES.partytrain.mode = 'partytrain'
for (const key of ['petcare', 'petheal', 'petbond', 'pettalent', 'petskill', 'petarena']) FEATURES[key].mode = 'pet'
FEATURES.eventjoin.mode = 'eventjoin'
FEATURES.eventscore.mode = 'eventscore'
FEATURES.eventredeem.mode = 'eventredeem'
for (const key of ['achievement', 'milestone']) FEATURES[key].mode = 'achievement'
FEATURES.auction.mode = 'auction'
FEATURES.bid.mode = 'bid'
FEATURES.market.mode = 'market'
FEATURES.merchantroute.mode = 'route'
FEATURES.loan.mode = 'loan'
FEATURES.repay.mode = 'repay'
FEATURES.insurance.mode = 'insurance'
FEATURES.workshop.mode = 'workshop'
FEATURES.furnish.mode = 'furnish'
FEATURES.bountyboard.mode = 'bountyboard'
FEATURES.bountyclaim.mode = 'bountyclaim'
FEATURES.artifactforge.mode = 'artifactforge'
FEATURES.relicforge.mode = 'relicforge'
FEATURES.relic.mode = 'relic'
FEATURES.titles.mode = 'titles'
FEATURES.milestone.mode = 'milestone'
FEATURES.ascension.mode = 'ascension'

FEATURES.blueprint.options = BLUEPRINTS
FEATURES.worldmap.regions = REGIONS
FEATURES.voyage.regions = REGIONS
FEATURES.portal.regions = REGIONS
FEATURES.outpost.regions = REGIONS
FEATURES.exploreRegions = ['verdant', 'azure', 'ember', 'dusk', 'astral']
FEATURES.archaeology.items = ['artifact_moss', 'artifact_tide', 'artifact_cinder', 'artifact_moon', 'artifact_star']
FEATURES.museum.items = FEATURES.archaeology.items
FEATURES.tower.base = 120
FEATURES.ascension.base = 180
FEATURES.bossrush.base = 160
FEATURES.gauntlet.base = 140
FEATURES.colosseum.base = 130
FEATURES.dungeonrun.base = 110
FEATURES.dungeonkey.recipe = { wood: 3, iron: 2, coal: 1 }
FEATURES.irrigate.cost = 8
FEATURES.ranch.animals = { cow: { name: 'Sapi', price: 2500, item: 'milk' }, sheep: { name: 'Domba', price: 2200, item: 'wool' }, chicken: { name: 'Ayam', price: 1600, item: 'egg' } }
FEATURES.milk.animal = 'cow'
FEATURES.shear.animal = 'sheep'
FEATURES.market.items = MARKET_ITEMS
FEATURES.merchantroute.routes = {
  coast: { name: 'Azure Coast', buy: 3500, min: 4200, max: 7200, risk: 0.18 },
  quarry: { name: 'Ember Quarry', buy: 4200, min: 5000, max: 8800, risk: 0.22 },
  grove: { name: 'Verdant Grove', buy: 3000, min: 3600, max: 6500, risk: 0.15 },
}
FEATURES.sanctuary.options = { attack: 'Might', defense: 'Ward', luck: 'Fortune' }
FEATURES.artifactforge.recipe = { relicshard: 5, refinedstone: 2, steel: 1 }
FEATURES.relicforge.recipe = { reliccore: 1, relicshard: 8, steel: 3 }
FEATURES.tradehouse.recipe = CRAFT_RECIPES.tradehouse.materials
FEATURES.bountyboard.targets = ['Verdant Wyrm', 'Cinder Revenant', 'Dusk Stalker', 'Tide Serpent', 'Astral Keeper']
FEATURES.profession.options = {
  doctor: { name: 'Dokter', theme: 'medical', stat: 'maxHealth', amount: 20, cost: 6500, description: 'Pemulihan dan ketahanan medis.' },
  police: { name: 'Polisi', theme: 'police', stat: 'defense', amount: 8, cost: 7000, description: 'Pertahanan dan keamanan kota.' },
  farmer: { name: 'Petani', theme: 'farm', stat: 'maxStamina', amount: 12, cost: 5500, description: 'Stamina dan hasil lahan.' },
  miner: { name: 'Penambang', theme: 'mining', stat: 'attack', amount: 6, cost: 7000, description: 'Kekuatan untuk eksplorasi tambang.' },
  fisher: { name: 'Nelayan', theme: 'fishing', stat: 'luck', amount: 6, cost: 6000, description: 'Peluang hasil laut lebih baik.' },
  cook: { name: 'Koki', theme: 'kitchen', stat: 'maxMana', amount: 15, cost: 6000, description: 'Energi pengolahan dan masakan.' },
  blacksmith: { name: 'Blacksmith', theme: 'forge', stat: 'defense', amount: 6, cost: 8000, description: 'Ketahanan dan spesialisasi bengkel.' },
}

function getWeekKey() {
  const now = new Date(Date.now() + 7 * 60 * 60 * 1000)
  const year = now.getUTCFullYear()
  const start = new Date(Date.UTC(year, 0, 1))
  const day = Math.floor((Date.UTC(year, now.getUTCMonth(), now.getUTCDate()) - start.getTime()) / 86_400_000)
  return `${year}-W${Math.floor((day + start.getUTCDay()) / 7) + 1}`
}

function getSeason() {
  const month = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jakarta', month: 'numeric' }).format(new Date()))
  return SEASONS[Math.floor((month - 1) / 3) % SEASONS.length]
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function ensureWorld(user) {
  const current = user.rpg.world && typeof user.rpg.world === 'object' ? user.rpg.world : {}
  user.rpg.world = current
  current.region = REGIONS[current.region] ? current.region : 'verdant'
  current.discoveries = current.discoveries && typeof current.discoveries === 'object' ? current.discoveries : {}
  current.artifacts = current.artifacts && typeof current.artifacts === 'object' ? current.artifacts : {}
  current.npcs = current.npcs && typeof current.npcs === 'object' ? current.npcs : {}
  current.reputation = current.reputation && typeof current.reputation === 'object' ? current.reputation : { adventurers: 0, merchants: 0, scholars: 0, rangers: 0 }
  current.skills = current.skills && typeof current.skills === 'object' ? current.skills : { wisdom: 0, crafting: 0, scouting: 0 }
  current.house = current.house && typeof current.house === 'object' ? current.house : { level: 1, comfort: 0, rooms: [] }
  current.workshop = current.workshop && typeof current.workshop === 'object' ? current.workshop : { level: 1 }
  current.ranch = current.ranch && typeof current.ranch === 'object' ? current.ranch : { livestock: {}, lastMilk: 0, lastShear: 0 }
  current.party = Array.isArray(current.party) ? current.party : []
  current.partyExp = Math.max(0, Number(current.partyExp) || 0)
  current.journal = Array.isArray(current.journal) ? current.journal.slice(-30) : []
  current.titles = Array.isArray(current.titles) ? current.titles : []
  current.equippedTitle = current.equippedTitle || null
  current.profession = current.profession && typeof current.profession === 'object' ? current.profession : null
  current.relics = current.relics && typeof current.relics === 'object' ? current.relics : {}
  current.equippedRelic = current.equippedRelic || null
  current.blueprints = current.blueprints && typeof current.blueprints === 'object' ? current.blueprints : {}
  current.bounty = current.bounty && typeof current.bounty === 'object' ? current.bounty : null
  current.towerFloor = Math.max(0, Number(current.towerFloor) || 0)
  current.dungeonKeys = Math.max(0, Number(current.dungeonKeys) || 0)
  current.dungeonClears = Math.max(0, Number(current.dungeonClears) || 0)
  current.bossWins = Math.max(0, Number(current.bossWins) || 0)
  current.event = current.event && typeof current.event === 'object' ? current.event : {}
  current.loan = Math.max(0, Number(current.loan) || 0)
  current.loanIssuedAt = Number(current.loanIssuedAt) || 0
  current.insurance = current.insurance && typeof current.insurance === 'object' ? current.insurance : { until: 0, limit: 0, used: false }
  current.weather = current.weather && typeof current.weather === 'object' ? current.weather : { name: 'Clear', until: 0 }
  current.sanctuary = current.sanctuary && typeof current.sanctuary === 'object' ? current.sanctuary : { level: 0, blessing: null }
  current.outposts = current.outposts && typeof current.outposts === 'object' ? current.outposts : {}
  current.marketSeed = Number(current.marketSeed) || 0
  current.auction = current.auction && typeof current.auction === 'object' ? current.auction : { week: '', offers: [] }
  current.event.week = current.event.week || ''
  return current
}

function logWorld(world, text) {
  world.journal.push({ at: Date.now(), text: String(text) })
  world.journal = world.journal.slice(-30)
}

function normalizeCost(cost, world) {
  const workshopDiscount = world?.workshop?.level ? Math.min(0.25, (world.workshop.level - 1) * 0.03) : 0
  return Math.max(0, Math.floor(Number(cost || 0) * (1 - workshopDiscount)))
}

function checkAndSetCooldown(jid, key, duration) {
  if (!duration) return { ok: true, remaining: 0 }
  const status = checkCooldown(jid, key)
  if (status.onCooldown) return { ok: false, remaining: status.remaining }
  return { ok: true, remaining: 0, commit() { setCooldown(jid, key, duration) } }
}

function hasMaterials(user, materials) {
  return Object.entries(materials || {}).every(([item, qty]) => (Number(user.inventory[item]) || 0) >= qty)
}

function consumeMaterials(user, materials) {
  for (const [item, qty] of Object.entries(materials || {})) {
    user.inventory[item] = Math.max(0, (Number(user.inventory[item]) || 0) - qty)
    if (user.inventory[item] <= 0) delete user.inventory[item]
  }
}

async function grant(user, m, sock, reward = {}) {
  const given = []
  if (Number(reward.koin) > 0) {
    const amount = Math.floor(reward.koin)
    user.koin += amount
    given.push(`💰 +${rupiah(amount)}`)
  }
  if (Number(reward.exp) > 0) {
    const amount = Math.floor(reward.exp)
    await addExpWithLevelCheck(sock, m, user, amount)
    given.push(`✨ +${number(amount)} EXP`)
  }
  for (const [item, qty] of Object.entries(reward.items || {})) {
    const amount = Math.max(0, Math.floor(Number(qty) || 0))
    if (!amount) continue
    user.inventory[item] = (user.inventory[item] || 0) + amount
    given.push(`📦 ${item} x${number(amount)}`)
  }
  if (reward.stat) {
    const key = reward.stat.key
    const amount = Math.max(0, Math.floor(Number(reward.stat.amount) || 0))
    user.rpg[key] = Math.max(0, Number(user.rpg[key]) || 0) + amount
    given.push(`⬆️ ${key.toUpperCase()} +${number(amount)}`)
  }
  return given
}

function regionInfo(world) {
  return REGIONS[world.region] || REGIONS.verdant
}

function currentWeather(world) {
  if (!world.weather || world.weather.until <= Date.now()) {
    const items = [
      { name: 'Clear', boost: 0 },
      { name: 'Rainfall', boost: 10 },
      { name: 'Strong Wind', boost: 5 },
      { name: 'Mist', boost: 8 },
      { name: 'Aurora', boost: 15 },
    ]
    const w = pick(items)
    world.weather = { name: w.name, boost: w.boost, until: Date.now() + 30 * 60_000 }
  }
  return world.weather
}

function eventForWeek() {
  const events = EVENTS
  const index = Math.abs([...getWeekKey()].reduce((n, c) => n + c.charCodeAt(0), 0)) % events.length
  return events[index]
}

function eventState(world) {
  const week = getWeekKey()
  const base = eventForWeek()
  if (world.event.week !== week) {
    world.event = { week, key: base.key, joined: false, score: 0, actions: 0, redeemed: false }
  }
  return { state: world.event, def: base }
}

function statSummary(user, world) {
  const region = regionInfo(world)
  return [
    { label: 'Level', value: number(user.level), color: '#b9a6f2' },
    { label: 'Koin', value: rupiah(user.koin), color: '#e0c17b' },
    { label: 'Stamina', value: `${number(user.rpg.stamina)}/${number(user.rpg.maxStamina)}`, color: '#8fd7e8' },
    { label: 'Region', value: region.name, color: '#9bd8b0' },
  ]
}

async function card(m, sock, config, data, body, extra = {}) {
  return sendRpgCard(sock, m, {
    type: 'world',
    headerTitle: config.title,
    headerSubtitle: config.subtitle,
    data: {
      ...data,
      palette: config.palette,
      visualKind: config.kind,
    },
    body,
    ...extra,
  })
}

async function runWorldFeature(m, sock, key) {
  const config = FEATURES[key]
  if (!config) return m.reply('Fitur RPG tidak tersedia.')
  const user = getUser(m.sender)
  const world = ensureWorld(user)
  const args = m.args || []
  const action = String(args[0] || '').toLowerCase()
  const cooldown = checkAndSetCooldown(m.sender, key, 90_000)

  if (config.mode === 'info') {
    let result = ''
    if (key === 'worldmap') result = `${regionInfo(world).name} · ${Object.keys(world.discoveries).length} titik ditemukan`
    else if (key === 'season') { const season = getSeason(); result = `${season.name} · ${season.bonus}` }
    else if (key === 'eventboard') { const { def } = eventState(world); result = `${def.name} · Target ${number(def.goal)} skor` }
    else if (key === 'npc') result = `${Object.keys(NPCS).length} NPC tersedia · ${Object.keys(world.npcs).filter((name) => world.npcs[name]?.affinity > 0).length} punya hubungan`
    else if (key === 'party') result = `${world.party.length}/3 anggota · ${number(world.partyExp)} EXP tim`
    else if (key === 'house') result = `Level ${world.house.level} · Comfort ${world.house.comfort} · ${world.house.rooms.length} ruang`
    else if (key === 'expeditionlog') result = `${world.dungeonClears} dungeon clear · ${world.bossWins} boss win · ${Object.keys(world.discoveries).length} discovery`
    else if (key === 'journal') result = `${world.journal.length} catatan perjalanan tersimpan`
    else if (key === 'weather') { const w = currentWeather(world); result = `${w.name} · bonus eksplorasi ${w.boost}%` }
    else if (key === 'codex') result = `${Object.keys(world.discoveries).length} lokasi · ${Object.keys(world.artifacts).length} artefak`
    else if (key === 'titles') result = `${world.titles.length} title terbuka · aktif ${world.equippedTitle || 'tanpa title'}`
    else if (key === 'reputation') result = `Adventurers ${world.reputation.adventurers} · Merchants ${world.reputation.merchants} · Scholars ${world.reputation.scholars}`
    else if (key === 'milestone') result = `Tower ${world.towerFloor} · Boss ${world.bossWins} · Discovery ${Object.keys(world.discoveries).length}`
    else if (key === 'collection') result = `Artifacts ${Object.keys(world.artifacts).length} · Relics ${Object.keys(world.relics).length} · Pet ${user.rpg.petStorage.length + (user.rpg.pet ? 1 : 0)}`
    cooldown.commit()
    saveUser(m.sender, user)
    if (key === 'worldmap') {
      return card(m, sock, config, { title: 'WORLD ATLAS', subtitle: regionInfo(world).name, result, location: regionInfo(world).name, stats: statSummary(user, world) }, `Gunakan ${m.prefix}voyage <region> untuk berpindah wilayah.`)
    }
    if (key === 'journal') {
      const recent = world.journal.slice(-6).map((entry) => entry.text).join(' · ') || 'Belum ada catatan.'
      return card(m, sock, config, { title: 'ADVENTURE LOG', subtitle: 'Recent memories', result: recent, stats: statSummary(user, world) }, recent)
    }
    if (key === 'relic') {
      const list = Object.entries(world.relics).map(([name, level]) => `${name} Lv.${level}`).join(' · ') || 'Belum ada relic.'
      return card(m, sock, config, { title: 'RELIC VAULT', subtitle: 'Ancient equipment', result: list, stats: statSummary(user, world) }, `Equip: ${m.prefix}relic equip <nama>`)
    }
    return card(m, sock, config, { title: config.title, subtitle: config.subtitle, result, stats: statSummary(user, world) }, result)
  }

  if (!cooldown.ok) return m.reply(`⏳ Tunggu *${Math.ceil(cooldown.remaining / 1000)} detik* sebelum memakai ${m.prefix}${key} lagi.`)

  if (config.mode === 'explore') {
    const region = regionInfo(world)
    const weather = currentWeather(world)
    if (key === 'scout') {
      if (user.rpg.stamina < 8) return m.reply(`⚡ Stamina tidak cukup. Butuh 8.`)
      const nearby = pick(region.discoveries)
      const clue = pick(['Jejak monster terlihat.', 'Ada jalur tersembunyi di dekat sini.', 'Suara air mengarah ke area yang belum dipetakan.', 'Bekas perkemahan menunjukkan ada petualang lain.'])
      user.rpg.stamina -= 8
      world.skills.scouting += 2
      if (world.bounty) world.bounty.progress = Math.min(world.bounty.target, world.bounty.progress + 1)
      const reward = await grant(user, m, sock, { koin: rand(120, 320), exp: rand(120, 220) })
      cooldown.commit()
      logWorld(world, `Scout di sekitar ${nearby} · ${clue}`)
      saveUser(m.sender, user)
      return card(m, sock, config, { title: 'SCOUTING REPORT', subtitle: region.name, result: nearby, location: region.name, victory: true, stats: [{ label: 'Clue', value: clue, color: '#c7a7f3' }, { label: 'Scouting', value: '+2', color: '#98d2b0' }, { label: 'Stamina', value: '-8', color: '#e7a0b0' }] }, `${clue} · ${reward.join(' · ')}`)
    }
    if (key === 'survey') {
      if (user.rpg.stamina < 18) return m.reply(`⚡ Stamina tidak cukup. Butuh 18.`)
      user.rpg.stamina -= 18
      const discoveries = [...new Set([pick(region.discoveries), pick(region.discoveries)])]
      discoveries.forEach((location) => { world.discoveries[location] = (world.discoveries[location] || 0) + 1 })
      world.skills.scouting += 3
      const reward = await grant(user, m, sock, { koin: rand(450, 850), exp: rand(300, 520), items: { map_fragment: 1 } })
      cooldown.commit()
      logWorld(world, `Survey wilayah ${region.name}`)
      saveUser(m.sender, user)
      return card(m, sock, config, { title: 'SURVEY COMPLETE', subtitle: region.name, result: discoveries.join(' · '), location: region.name, victory: true, stats: [{ label: 'Mapped', value: `${discoveries.length} lokasi`, color: '#9bd8ea' }, { label: 'Scouting', value: '+3', color: '#98d2b0' }, { label: 'Stamina', value: '-18', color: '#e7a0b0' }] }, `${discoveries.join(', ')} · ${reward.join(' · ')}`)
    }
    if (user.rpg.stamina < 12) return m.reply(`⚡ Stamina tidak cukup. Butuh 12.`)
    const location = pick(region.discoveries)
    const existed = world.discoveries[location]
    user.rpg.stamina -= 12
    world.discoveries[location] = (world.discoveries[location] || 0) + 1
    world.skills.scouting += 1
    if (world.bounty) world.bounty.progress = Math.min(world.bounty.target, world.bounty.progress + 1)
    const lootItem = pick({ verdant: ['herb', 'wood', 'leather'], azure: ['fish', 'prawn', 'pearl'], ember: ['coal', 'iron', 'steel'], dusk: ['relicshard', 'refinedstone', 'ancientdust'], astral: ['moonstone', 'starfragment', 'relicshard'] }[world.region])
    const coin = rand(240, 700) + Math.floor(weather.boost * 5)
    const exp = rand(110, 280)
    const reward = await grant(user, m, sock, { koin: coin, exp, items: { [lootItem]: 1 } })
    cooldown.commit()
    logWorld(world, `Menemukan ${location} di ${region.name}`)
    saveUser(m.sender, user)
    return card(m, sock, config, { title: existed ? 'RETURN TO LANDMARK' : 'NEW DISCOVERY', subtitle: location, result: `${location} · ${region.name}`, location: region.name, victory: true, stats: [{ label: 'Koin', value: `+${rupiah(coin)}`, color: '#e0c17b' }, { label: 'EXP', value: `+${number(exp)}`, color: '#9bd8ea' }, { label: 'Loot', value: lootItem, color: '#98d2b0' }, { label: 'Stamina', value: '-12', color: '#e7a0b0' }] }, `${reward.join(' · ')} · ${location}`)
  }

  if (config.mode === 'travel') {
    const target = action || 'verdant'
    const region = REGIONS[target]
    if (!region) return m.reply(`Wilayah: ${Object.keys(REGIONS).join(', ')}`)
    const already = target === world.region
    if (already) return m.reply(`Kamu sudah berada di *${region.name}*.`)
    if (key === 'portal') {
      const coinCost = world.outposts[target] ? 2200 : 3600
      if (user.koin < coinCost) return m.reply(`Butuh ${rupiah(coinCost)} untuk membuka portal ke ${region.name}.`)
      user.koin -= coinCost
      world.region = target
      world.skills.wisdom += 1
      world.reputation.scholars += 1
      cooldown.commit()
      logWorld(world, `Portal menuju ${region.name}`)
      saveUser(m.sender, user)
      return card(m, sock, config, { title: 'PORTAL ARRIVAL', subtitle: region.name, result: 'Instant travel', location: region.name, victory: true, stats: [{ label: 'Travel', value: region.name, color: '#c7a7f3' }, { label: 'Cost', value: `-${rupiah(coinCost)}`, color: '#e0c17b' }, { label: 'Stamina', value: '0', color: '#98d2b0' }] }, `Portal aktif. Kamu langsung tiba di ${region.name}.`)
    }
    const hasOutpost = Boolean(world.outposts[target])
    const coinCost = hasOutpost ? 500 : 1200
    if (user.koin < coinCost || user.rpg.stamina < 10) return m.reply(`Butuh ${rupiah(coinCost)} dan 10 stamina.`)
    user.koin -= coinCost
    user.rpg.stamina -= 10
    world.region = target
    world.reputation.adventurers += 1
    cooldown.commit()
    logWorld(world, `Berpindah ke ${region.name}`)
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'JOURNEY COMPLETE', subtitle: region.name, result: region.name, location: region.name, victory: true, stats: [{ label: 'Travel', value: region.name, color: '#9bd8ea' }, { label: 'Cost', value: `-${rupiah(coinCost)}`, color: '#e0c17b' }, { label: 'Stamina', value: '-10', color: '#e7a0b0' }] }, `Sekarang kamu berada di ${region.name}.`)
  }

  if (config.mode === 'outpost') {
    const target = action || world.region
    const region = REGIONS[target]
    if (!region) return m.reply(`Wilayah: ${Object.keys(REGIONS).join(', ')}`)
    if (target === world.region) return m.reply(`Outpost harus dibangun di luar wilayah aktif.`)
    if (world.outposts[target]) return m.reply(`Outpost ${region.name} sudah dibangun.`)
    const cost = 6500
    if (user.koin < cost || user.rpg.stamina < 12) return m.reply(`Butuh ${rupiah(cost)} dan 12 stamina.`)
    user.koin -= cost
    user.rpg.stamina -= 12
    world.outposts[target] = { builtAt: Date.now(), level: 1 }
    world.reputation.adventurers += 3
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'OUTPOST ESTABLISHED', subtitle: region.name, result: 'Travel cost reduced', victory: true, stats: [{ label: 'Region', value: region.name, color: '#9bd8ea' }, { label: 'Cost', value: `-${rupiah(cost)}`, color: '#e0c17b' }, { label: 'Travel', value: 'Rp 500 base cost', color: '#98d2b0' }] }, `Outpost aktif di ${region.name}.`)
  }

  if (config.mode === 'recovery') {
    if (key === 'campfire') {
      if ((user.inventory.wood || 0) < 2 && user.koin < 250) return m.reply(`Butuh 2 wood atau Rp 250.`)
      if ((user.inventory.wood || 0) >= 2) consumeMaterials(user, { wood: 2 })
      else user.koin -= 250
      user.rpg.health = Math.min(user.rpg.maxHealth, user.rpg.health + 30)
      user.rpg.stamina = Math.min(user.rpg.maxStamina, user.rpg.stamina + 35)
      cooldown.commit()
      saveUser(m.sender, user)
      return card(m, sock, config, { title: 'REST COMPLETE', subtitle: 'Campfire', result: 'Health dan stamina dipulihkan', victory: true, stats: [{ label: 'HP', value: '+30', color: '#98d2b0' }, { label: 'Stamina', value: '+35', color: '#9bd8ea' }] }, 'Api unggun berhasil menyiapkan tubuh untuk perjalanan berikutnya.')
    }
    if (key === 'inn') {
      const cost = 900
      if (user.koin < cost) return m.reply(`Butuh ${rupiah(cost)} untuk menginap.`)
      user.koin -= cost
      user.rpg.health = user.rpg.maxHealth
      user.rpg.mana = user.rpg.maxMana
      user.rpg.stamina = user.rpg.maxStamina
      cooldown.commit()
      saveUser(m.sender, user)
      return card(m, sock, config, { title: 'FULL REST', subtitle: 'Traveler\'s Inn', result: 'Semua resource pulih penuh', victory: true, stats: [{ label: 'Cost', value: `-${rupiah(cost)}`, color: '#e0c17b' }, { label: 'HP', value: 'FULL', color: '#98d2b0' }, { label: 'Mana', value: 'FULL', color: '#9bd8ea' }, { label: 'Stamina', value: 'FULL', color: '#c7a7f3' }] }, 'Kamar siap. Kamu bisa melanjutkan perjalanan.')
    }
    if (key === 'tavern') {
      if (user.koin < 500) return m.reply(`Butuh ${rupiah(500)} untuk menghabiskan malam di tavern.`)
      user.koin -= 500
      const lore = pick(['Mira melihat badai di utara.', 'Orin sedang mencari besi langka.', 'Selene mendengar legenda relic kuno.', 'Brann melihat jejak monster di hutan.', 'Kaia membawa kabar dari Azure Coast.'])
      user.rpg.stamina = Math.min(user.rpg.maxStamina, user.rpg.stamina + 15)
      user.rpg.mana = Math.min(user.rpg.maxMana, user.rpg.mana + 10)
      world.reputation.merchants += 1
      logWorld(world, lore)
      cooldown.commit()
      saveUser(m.sender, user)
      return card(m, sock, config, { title: 'TAVERN RUMOR', subtitle: 'Information gained', result: lore, stats: [{ label: 'Stamina', value: '+15', color: '#9bd8ea' }, { label: 'Mana', value: '+10', color: '#c7a7f3' }, { label: 'Merchant Rep', value: `+1`, color: '#e0c17b' }] }, lore)
    }
    if (key === 'sanctuary') {
      const option = action || 'attack'
      if (!FEATURES.sanctuary.options[option]) return m.reply(`Pilih: attack, defense, luck.`)
      const cost = 1800 + world.sanctuary.level * 900
      if (user.koin < cost) return m.reply(`Butuh ${rupiah(cost)}.`)
      user.koin -= cost
      world.sanctuary.level += 1
      world.sanctuary.blessing = option
      const statKey = option === 'attack' ? 'attack' : option === 'defense' ? 'defense' : 'luck'
      user.rpg[statKey] += 2
      cooldown.commit()
      saveUser(m.sender, user)
      return card(m, sock, config, { title: 'BLESSING AWAKENED', subtitle: FEATURE_TITLES.sanctuary[0], result: `${FEATURES.sanctuary.options[option]} Level ${world.sanctuary.level}`, victory: true, stats: [{ label: 'Blessing', value: FEATURES.sanctuary.options[option], color: '#c7a7f3' }, { label: 'Stat', value: `${statKey.toUpperCase()} +2`, color: '#98d2b0' }, { label: 'Cost', value: `-${rupiah(cost)}`, color: '#e0c17b' }] }, `${FEATURES.sanctuary.options[option]} meningkat ke level ${world.sanctuary.level}.`)
    }
  }

  if (config.mode === 'choice') {
    if (!action) return m.reply(`Pilih opsi: 1, 2, atau 3.`)
    if (!['1', '2', '3'].includes(action)) return m.reply(`Opsi hanya 1, 2, atau 3.`)
    if (user.rpg.stamina < 10) return m.reply(`Butuh 10 stamina.`)
    user.rpg.stamina -= 10
    const choices = key === 'shrine'
      ? [{ name: 'Might', stat: 'attack', amount: 3, chance: 0.72 }, { name: 'Ward', stat: 'defense', amount: 3, chance: 0.78 }, { name: 'Fortune', stat: 'luck', amount: 4, chance: 0.62 }]
      : key === 'trials'
        ? [{ name: 'Blade Trial', stat: 'attack', amount: 2, chance: 0.75 }, { name: 'Guard Trial', stat: 'defense', amount: 2, chance: 0.75 }, { name: 'Swift Trial', stat: 'speed', amount: 2, chance: 0.72 }]
        : [{ name: 'Festival Cookoff', stat: 'health', amount: 5, chance: 0.84 }, { name: 'Parade Sprint', stat: 'speed', amount: 2, chance: 0.78 }, { name: 'Lantern Puzzle', stat: 'luck', amount: 3, chance: 0.68 }]
    const chosen = choices[Number(action) - 1]
    const success = Math.random() < Math.min(0.94, chosen.chance + (world.skills.wisdom || 0) * 0.002)
    let rewards = []
    if (success) {
      rewards = await grant(user, m, sock, { koin: rand(350, 900), exp: rand(140, 320), stat: { key: chosen.stat, amount: chosen.amount } })
      if (key === 'trials') world.reputation.adventurers += 2
      if (key === 'festival') world.reputation.merchants += 2
    } else {
      user.rpg.health = Math.max(1, user.rpg.health - 12)
      rewards = ['🤕 Trial failed · HP -12']
    }
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: success ? 'CHOICE RESOLVED' : 'CHOICE FAILED', subtitle: chosen.name, result: success ? 'Choice rewarded' : 'The odds turned against you', victory: success, stats: rewards.slice(0, 4).map((value, i) => ({ label: `Result ${i + 1}`, value: value.replace(/^[^ ]+\s*/, ''), color: success ? '#98d2b0' : '#e7a0b0' })) }, rewards.join(' · '))
  }

  if (config.mode === 'artifact') {
    if (user.rpg.stamina < 18) return m.reply(`Butuh 18 stamina.`)
    user.rpg.stamina -= 18
    const item = pick(FEATURES.archaeology.items)
    user.inventory[item] = (user.inventory[item] || 0) + 1
    world.artifacts[item] = (world.artifacts[item] || 0) + 1
    world.reputation.scholars += 2
    const expGain = rand(220, 420)
    const rewards = await grant(user, m, sock, { exp: expGain, koin: rand(500, 1200), items: { relicshard: Math.random() < 0.4 ? 1 : 0 } })
    cooldown.commit()
    logWorld(world, `Menggali ${item}`)
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'DIG COMPLETE', subtitle: 'Ancient find', result: item, victory: true, stats: [{ label: 'Artifact', value: item, color: '#c7a7f3' }, { label: 'EXP', value: `+${number(expGain)}`, color: '#9bd8ea' }, { label: 'Stamina', value: '-18', color: '#e7a0b0' }] }, `${item} ditemukan · ${rewards.join(' · ')}`)
  }

  if (config.mode === 'museum') {
    const item = action && FEATURES.museum.items.includes(action) ? action : Object.keys(world.artifacts).find((name) => (world.artifacts[name] || 0) > 0 && (user.inventory[name] || 0) > 0)
    if (!item) return m.reply(`Belum ada artefak untuk disumbangkan. Gunakan ${m.prefix}archaeology dulu.`)
    if ((user.inventory[item] || 0) < 1) return m.reply(`Kamu tidak punya ${item}.`)
    user.inventory[item] -= 1
    if (user.inventory[item] <= 0) delete user.inventory[item]
    world.reputation.scholars += 5
    const rewards = await grant(user, m, sock, { koin: 900, exp: 350 })
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'ARCHIVE DONATION', subtitle: item, result: 'Artefact preserved', victory: true, stats: [{ label: 'Artifact', value: item, color: '#c7a7f3' }, { label: 'Scholar Rep', value: '+5', color: '#9bd8ea' }, { label: 'Reward', value: rewards[0] || '+coins', color: '#e0c17b' }] }, `${item} disimpan dalam museum · ${rewards.join(' · ')}`)
  }

  if (config.mode === 'tower') {
    if (user.rpg.health < 28 || user.rpg.stamina < 18) return m.reply(`Butuh minimal 28 HP dan 18 stamina.`)
    user.rpg.stamina -= 18
    const nextFloor = world.towerFloor + 1
    const enemyPower = (config.base || 120) + nextFloor * (key === 'ascension' ? 25 : 12)
    const playerPower = user.level * 16 + user.rpg.attack * 3 + user.rpg.defense + user.rpg.speed + rand(15, 70)
    const success = playerPower >= enemyPower || Math.random() < 0.18
    if (success) {
      world.towerFloor = nextFloor
      const rewards = await grant(user, m, sock, { koin: 800 + nextFloor * 180, exp: 500 + nextFloor * 90, items: nextFloor % 5 === 0 ? { relicshard: 1 } : {} })
      if (nextFloor >= 10 && !world.titles.includes('Towerbreaker')) world.titles.push('Towerbreaker')
      cooldown.commit()
      saveUser(m.sender, user)
      return card(m, sock, config, { title: 'ASCENT SUCCESS', subtitle: `Floor ${nextFloor}`, result: `Floor ${nextFloor} cleared`, victory: true, stats: [{ label: 'Floor', value: number(nextFloor), color: '#c7a7f3' }, { label: 'Enemy', value: number(enemyPower), color: '#e7a0b0' }, { label: 'Power', value: number(playerPower), color: '#98d2b0' }, { label: 'Reward', value: rewards[0] || '+coins', color: '#e0c17b' }] }, `Tower naik ke Floor ${nextFloor} · ${rewards.join(' · ')}`)
    }
    const damage = rand(18, 34)
    user.rpg.health = Math.max(1, user.rpg.health - damage)
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'ASCENT FAILED', subtitle: `Floor ${nextFloor}`, result: 'Tower forced you back', victory: false, stats: [{ label: 'Enemy Power', value: number(enemyPower), color: '#e7a0b0' }, { label: 'Your Power', value: number(playerPower), color: '#c7a7f3' }, { label: 'HP Loss', value: `-${damage}`, color: '#e7a0b0' }] }, `Pertempuran gagal. HP -${damage}.`)
  }

  if (config.mode === 'ascension') {
    if (user.level < 20) return m.reply(`Butuh Level 20 untuk melakukan ascension.`)
    const cost = 20000 + world.towerFloor * 500
    if (user.koin < cost || world.towerFloor < 10) return m.reply(`Butuh Tower Floor 10 dan ${rupiah(cost)}.`)
    user.koin -= cost
    world.towerFloor = 0
    user.rpg.attack += 5
    user.rpg.defense += 5
    user.rpg.maxHealth += 20
    user.rpg.health = user.rpg.maxHealth
    if (!world.titles.includes('Ascendant')) world.titles.push('Ascendant')
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'ASCENSION COMPLETE', subtitle: 'Permanent progression', result: 'Ascendant unlocked', victory: true, stats: [{ label: 'ATK', value: '+5', color: '#e7a0b0' }, { label: 'DEF', value: '+5', color: '#9bd8ea' }, { label: 'MAX HP', value: '+20', color: '#98d2b0' }, { label: 'Tower', value: 'RESET', color: '#c7a7f3' }] }, `Ascension berhasil. Tower kembali ke 0, bonus permanen diterapkan.`)
  }

  if (config.mode === 'combat') {
    if (user.rpg.health < 35 || user.rpg.stamina < 20) return m.reply(`Butuh minimal 35 HP dan 20 stamina.`)
    user.rpg.stamina -= 20
    const rounds = key === 'dungeonrun' ? 4 : key === 'bossrush' ? 3 : key === 'gauntlet' ? 5 : 2
    let victories = 0
    let damageTaken = 0
    const drops = {}
    for (let i = 0; i < rounds; i++) {
      const enemy = (config.base || 130) + i * 35 + user.level * 4
      const power = user.level * 14 + user.rpg.attack * 3 + user.rpg.defense + rand(0, 75)
      if (power >= enemy || Math.random() < 0.2) {
        victories += 1
        const drop = pick(key === 'dungeonrun' ? ['iron', 'relicshard', 'gold', 'refinedstone'] : ['coal', 'iron', 'relicshard', 'diamond'])
        drops[drop] = (drops[drop] || 0) + (drop === 'relicshard' ? 1 : rand(1, 2))
      } else {
        const dmg = rand(10, 24)
        damageTaken += dmg
        user.rpg.health = Math.max(1, user.rpg.health - dmg)
      }
    }
    if (world.bounty) world.bounty.progress = Math.min(world.bounty.target, world.bounty.progress + victories)
    const success = victories >= Math.ceil(rounds * 0.6)
    if (key === 'dungeonrun' && success) world.dungeonClears += 1
    if (key !== 'dungeonrun' && success) world.bossWins += 1
    const reward = success ? { koin: 1000 + victories * 550, exp: 650 + victories * 180, items: drops } : { koin: 250 + victories * 120, exp: 200 + victories * 60, items: drops }
    const rewards = await grant(user, m, sock, reward)
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: success ? 'COMBAT CLEARED' : 'COMBAT SURVIVED', subtitle: `${victories}/${rounds} rounds`, result: success ? 'Run complete' : 'Retreat successful', victory: success, stats: [{ label: 'Rounds', value: `${victories}/${rounds}`, color: success ? '#98d2b0' : '#e0c17b' }, { label: 'Damage', value: `-${damageTaken}`, color: '#e7a0b0' }, { label: 'EXP', value: rewards.find((v) => v.includes('EXP'))?.replace('✨ ', '') || '+EXP', color: '#9bd8ea' }, { label: 'Loot', value: Object.keys(drops).slice(0, 2).join(', ') || 'None', color: '#c7a7f3' }] }, `${rewards.join(' · ')}`)
  }

  if (config.mode === 'dungeonkey') {
    if (!hasMaterials(user, config.recipe)) return m.reply(`Resep kunci: ${Object.entries(config.recipe).map(([i, q]) => `${i} x${q}`).join(', ')}`)
    consumeMaterials(user, config.recipe)
    user.rpg.world.dungeonKeys += 1
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'KEY FORGED', subtitle: 'Dungeon Access', result: `Dungeon Key x${world.dungeonKeys}`, victory: true, stats: [{ label: 'Keys', value: number(world.dungeonKeys), color: '#c7a7f3' }, { label: 'Material', value: 'Consumed', color: '#e7a0b0' }] }, `Kunci dungeon tersedia: ${world.dungeonKeys}.`)
  }

  if (config.mode === 'blueprint') {
    if (!action || !config.options[action]) return m.reply(`Blueprint: ${Object.keys(config.options).join(', ')}`)
    if (world.blueprints[action]) return m.reply(`Blueprint *${config.options[action].name}* sudah kamu miliki.`)
    const cost = config.options[action].cost
    if (user.koin < cost) return m.reply(`Butuh ${rupiah(cost)}.`)
    user.koin -= cost
    world.blueprints[action] = true
    world.skills.crafting += 2
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'BLUEPRINT ACQUIRED', subtitle: config.options[action].name, result: 'New recipe unlocked', victory: true, stats: [{ label: 'Blueprint', value: config.options[action].name, color: '#c7a7f3' }, { label: 'Cost', value: `-${rupiah(cost)}`, color: '#e0c17b' }, { label: 'Crafting', value: '+2', color: '#98d2b0' }] }, `${config.options[action].name} tersimpan di arsip blueprint.`)
  }

  if (config.mode === 'dismantle') {
    const item = action
    const qty = Math.max(1, Math.min(10, Number(args[1]) || 1))
    const outputs = { kunai: { iron: 1, wood: 1 }, shuriken: { iron: 2 }, scroll: { paper: 1, relicshard: 0.3 }, tannedleather: { leather: 2 }, steel: { iron: 2, coal: 1 } }
    const output = outputs[item]
    if (!output) return m.reply(`Item yang bisa dibongkar: ${Object.keys(outputs).join(', ')}`)
    if ((user.inventory[item] || 0) < qty) return m.reply(`Item *${item}* tidak cukup.`)
    consumeMaterials(user, { [item]: qty })
    const items = {}
    for (const [name, amount] of Object.entries(output)) items[name] = Math.floor(amount * qty)
    const rewards = await grant(user, m, sock, { items, exp: 40 * qty })
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'DISMANTLE COMPLETE', subtitle: item, result: `${item} x${qty} recycled`, victory: true, stats: [{ label: 'Input', value: `${qty}x ${item}`, color: '#e7a0b0' }, { label: 'Output', value: Object.keys(items).join(', '), color: '#98d2b0' }, { label: 'EXP', value: `+${40 * qty}`, color: '#9bd8ea' }] }, rewards.join(' · '))
  }

  if (config.mode === 'craft') {
    const recipe = CRAFT_RECIPES[key]
    if (!recipe) return m.reply('Resep tidak tersedia.')
    if (config.key === 'artifactforge' && !world.blueprints.relicframe) return m.reply(`Butuh blueprint *relicframe*.`)
    const qty = Math.max(1, Math.min(5, Number(args[0]) || 1))
    const materials = Object.fromEntries(Object.entries(recipe.materials).map(([item, count]) => [item, count * qty]))
    const coinCost = normalizeCost(recipe.coins * qty, world)
    if (!hasMaterials(user, materials)) return m.reply(`Material kurang: ${Object.entries(materials).map(([i, q]) => `${i} x${q}`).join(', ')}`)
    if (user.koin < coinCost) return m.reply(`Butuh ${rupiah(coinCost)}.`)
    consumeMaterials(user, materials)
    user.koin -= coinCost
    user.inventory[recipe.output.item] = (user.inventory[recipe.output.item] || 0) + recipe.output.qty * qty
    user.rpg.world.skills.crafting += qty
    const rewards = await grant(user, m, sock, { exp: 80 * qty })
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'CRAFT COMPLETE', subtitle: recipe.name, result: `${recipe.output.item} x${recipe.output.qty * qty}`, victory: true, stats: [{ label: 'Output', value: `${recipe.output.qty * qty}x ${recipe.output.item}`, color: '#98d2b0' }, { label: 'Cost', value: `-${rupiah(coinCost)}`, color: '#e0c17b' }, { label: 'EXP', value: `+${80 * qty}`, color: '#9bd8ea' }] }, `${recipe.name} dibuat · ${rewards.join(' · ')}`)
  }

  if (config.mode === 'irrigate') {
    if (user.rpg.stamina < FEATURES.irrigate.cost) return m.reply(`Butuh ${FEATURES.irrigate.cost} stamina.`)
    user.rpg.stamina -= FEATURES.irrigate.cost
    world.gardenBoostUntil = Date.now() + 3 * 60 * 60_000
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'IRRIGATION ACTIVE', subtitle: 'Garden support', result: 'Growth time -20% selama 3 jam', victory: true, stats: [{ label: 'Stamina', value: `-${FEATURES.irrigate.cost}`, color: '#e7a0b0' }, { label: 'Growth', value: '-20%', color: '#98d2b0' }, { label: 'Duration', value: '3 jam', color: '#9bd8ea' }] }, `Kebun akan tumbuh lebih cepat selama 3 jam.`)
  }

  if (config.mode === 'ranch') {
    const animals = FEATURES.ranch.animals
    if (!action) return m.reply(Object.entries(animals).map(([id, a]) => `${id}: ${rupiah(a.price)} · punya ${(world.ranch.livestock[id] || 0)}`).join('\n'))
    const animal = animals[action]
    if (!animal) return m.reply(`Hewan: ${Object.keys(animals).join(', ')}`)
    if ((world.ranch.livestock[action] || 0) >= 5) return m.reply(`Maksimal 5 ${animal.name}.`)
    if (user.koin < animal.price) return m.reply(`Butuh ${rupiah(animal.price)}.`)
    user.koin -= animal.price
    world.ranch.livestock[action] = (world.ranch.livestock[action] || 0) + 1
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'LIVESTOCK ADDED', subtitle: animal.name, result: `${animal.name} x${world.ranch.livestock[action]}`, victory: true, stats: [{ label: 'Cost', value: `-${rupiah(animal.price)}`, color: '#e0c17b' }, { label: 'Stock', value: number(world.ranch.livestock[action]), color: '#98d2b0' }] }, `${animal.name} sekarang ada ${world.ranch.livestock[action]}.`)
  }

  if (config.mode === 'ranchoutput') {
    const animal = FEATURES[key].animal
    const stock = world.ranch.livestock[animal] || 0
    if (stock < 1) return m.reply(`Butuh ${FEATURES.ranch.animals[animal].name}. Beli lewat ${m.prefix}ranch ${animal}.`)
    const field = key === 'milk' ? 'lastMilk' : 'lastShear'
    if (world.ranch[field] && Date.now() - world.ranch[field] < 6 * 60 * 60_000) return m.reply(`Produksi ${key} belum siap.`)
    world.ranch[field] = Date.now()
    const outputItem = key === 'milk' ? 'milk' : 'wool'
    const qty = rand(2, 5) * stock
    user.inventory[outputItem] = (user.inventory[outputItem] || 0) + qty
    const rewards = await grant(user, m, sock, { exp: 120 + stock * 30, koin: 250 + stock * 50 })
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'HARVEST READY', subtitle: FEATURES.ranch.animals[animal].name, result: `${outputItem} x${qty}`, victory: true, stats: [{ label: 'Yield', value: `${qty}x ${outputItem}`, color: '#98d2b0' }, { label: 'EXP', value: rewards.find((r) => r.includes('EXP'))?.replace('✨ ', '') || '+EXP', color: '#9bd8ea' }, { label: 'Livestock', value: number(stock), color: '#e0c17b' }] }, `${outputItem} +${qty} · ${rewards.join(' · ')}`)
  }

  if (config.mode === 'knowledge') {
    if (key === 'library') {
      const cost = 1200
      if (user.koin < cost) return m.reply(`Butuh ${rupiah(cost)}.`)
      user.koin -= cost
      world.reputation.scholars += 3
      world.skills.wisdom += 2
      const rewards = await grant(user, m, sock, { exp: 450 })
      cooldown.commit()
      saveUser(m.sender, user)
      return card(m, sock, config, { title: 'LORE ACQUIRED', subtitle: 'Grand Library', result: 'Wisdom +2 · Scholar Rep +3', victory: true, stats: [{ label: 'Wisdom', value: '+2', color: '#c7a7f3' }, { label: 'Scholar Rep', value: '+3', color: '#9bd8ea' }, { label: 'EXP', value: rewards.find((r) => r.includes('EXP'))?.replace('✨ ', '') || '+EXP', color: '#98d2b0' }] }, `Arsip baru terbaca · ${rewards.join(' · ')}`)
    }
    const cost = 700 + world.skills.wisdom * 35
    if (user.koin < cost || user.rpg.stamina < 8) return m.reply(`Butuh ${rupiah(cost)} dan 8 stamina.`)
    user.koin -= cost
    user.rpg.stamina -= 8
    world.skills.wisdom += 1
    const rewards = await grant(user, m, sock, { exp: 300 + world.skills.wisdom * 10 })
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'STUDY COMPLETE', subtitle: 'Knowledge training', result: `Wisdom ${world.skills.wisdom}`, victory: true, stats: [{ label: 'Wisdom', value: number(world.skills.wisdom), color: '#c7a7f3' }, { label: 'Cost', value: `-${rupiah(cost)}`, color: '#e0c17b' }, { label: 'Stamina', value: '-8', color: '#e7a0b0' }] }, `Belajar berhasil · ${rewards.join(' · ')}`)
  }

  if (key === 'bountyboard') {
    if (world.bounty && !world.bounty.claimed) return m.reply(`Bounty aktif: *${world.bounty.name}* · ${world.bounty.progress}/${world.bounty.target}.`)
    const target = pick(FEATURES.bountyboard.targets)
    const targetCount = rand(3, 7)
    world.bounty = { name: target, progress: 0, target: targetCount, reward: 2500 + targetCount * 700, exp: 500 + targetCount * 120, claimed: false }
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'BOUNTY ACCEPTED', subtitle: target, result: `Target ${targetCount}`, victory: true, stats: [{ label: 'Target', value: target, color: '#e7a0b0' }, { label: 'Progress', value: `0/${targetCount}`, color: '#9bd8ea' }, { label: 'Reward', value: rupiah(world.bounty.reward), color: '#e0c17b' }] }, `Lakukan ${m.prefix}scout, ${m.prefix}dungeonrun, atau ${m.prefix}bossrush untuk mengisi progress.`)
  }

  if (key === 'bountyclaim') {
    if (!world.bounty || world.bounty.claimed) return m.reply(`Belum ada bounty aktif. Gunakan ${m.prefix}bountyboard.`)
    if (world.bounty.progress < world.bounty.target) return m.reply(`Progress ${world.bounty.progress}/${world.bounty.target}.`)
    const reward = { koin: world.bounty.reward, exp: world.bounty.exp }
    world.bounty.claimed = true
    const rewards = await grant(user, m, sock, reward)
    world.reputation.adventurers += 4
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'BOUNTY PAID', subtitle: world.bounty.name, result: 'Contract completed', victory: true, stats: [{ label: 'Koin', value: `+${rupiah(reward.koin)}`, color: '#e0c17b' }, { label: 'EXP', value: `+${number(reward.exp)}`, color: '#9bd8ea' }, { label: 'Rep', value: '+4', color: '#98d2b0' }] }, rewards.join(' · '))
  }

  if (key === 'talk') {
    const npcKey = action || 'mira'
    const npc = NPCS[npcKey]
    if (!npc) return m.reply(`NPC: ${Object.keys(NPCS).join(', ')}`)
    if (user.rpg.stamina < 5) return m.reply(`Butuh 5 stamina.`)
    user.rpg.stamina -= 5
    const state = world.npcs[npcKey] || { affinity: 0, gifts: 0, recruited: false }
    const gain = rand(1, 3)
    state.affinity += gain
    world.npcs[npcKey] = state
    const reward = await grant(user, m, sock, { exp: 180, koin: rand(100, 300) })
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'CONVERSATION', subtitle: `${npc.name} · ${npc.role}`, result: `Affinity +${gain}`, victory: true, stats: [{ label: 'Affinity', value: number(state.affinity), color: '#f0a4b6' }, { label: 'EXP', value: '+180', color: '#9bd8ea' }, { label: 'Stamina', value: '-5', color: '#e7a0b0' }] }, `${npc.name}: “Perjalananmu mulai dikenal.” · ${reward.join(' · ')}`)
  }

  if (key === 'friendship') {
    const entries = Object.entries(NPCS).map(([id, npc]) => ({ id, npc, state: world.npcs[id] || { affinity: 0, gifts: 0, recruited: false } })).sort((a, b) => b.state.affinity - a.state.affinity)
    const top = entries[0]
    if (!top) return m.reply('Belum ada hubungan NPC.')
    let changed = false
    if (top.state.affinity >= 30 && !world.titles.includes(`${top.npc.name} Ally`)) {
      world.titles.push(`${top.npc.name} Ally`)
      changed = true
    }
    if (changed) saveUser(m.sender, user)
    return card(m, sock, config, { title: 'FRIENDSHIP LEDGER', subtitle: top.npc.name, result: `${top.npc.name} · Affinity ${top.state.affinity}`, stats: entries.slice(0, 4).map((entry) => ({ label: entry.npc.name, value: number(entry.state.affinity), color: '#f0a4b6' })) }, entries.slice(0, 5).map((entry) => `${entry.npc.name}: ${entry.state.affinity}`).join(' · '))
  }

  if (key === 'giftnpc') {
    const npcKey = action || 'mira'
    const item = String(args[1] || '').toLowerCase()
    const npc = NPCS[npcKey]
    if (!npc) return m.reply(`NPC: ${Object.keys(NPCS).join(', ')}`)
    if (!item) return m.reply(`Contoh: ${m.prefix}giftnpc mira herb`)
    if ((user.inventory[item] || 0) < 1) return m.reply(`Kamu tidak punya ${item}.`)
    consumeMaterials(user, { [item]: 1 })
    const state = world.npcs[npcKey] || { affinity: 0, gifts: 0, recruited: false }
    state.affinity += 5
    state.gifts += 1
    world.npcs[npcKey] = state
    const reward = await grant(user, m, sock, { exp: 220 })
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'GIFT ACCEPTED', subtitle: npc.name, result: `${item} · Affinity +5`, victory: true, stats: [{ label: 'Affinity', value: number(state.affinity), color: '#f0a4b6' }, { label: 'Gifts', value: number(state.gifts), color: '#c7a7f3' }, { label: 'EXP', value: '+220', color: '#9bd8ea' }] }, `${npc.name} menerima ${item} · ${reward.join(' · ')}`)
  }

  if (key === 'recruit') {
    const npcKey = action || 'mira'
    const npc = NPCS[npcKey]
    if (!npc) return m.reply(`NPC: ${Object.keys(NPCS).join(', ')}`)
    const state = world.npcs[npcKey] || { affinity: 0, gifts: 0, recruited: false }
    if (state.affinity < 30) return m.reply(`${npc.name} butuh Affinity 30. Saat ini ${state.affinity}.`)
    if (state.recruited) return m.reply(`${npc.name} sudah ada di party.`)
    if (world.party.length >= 3) return m.reply(`Party penuh. Maksimal 3 companion.`)
    state.recruited = true
    world.npcs[npcKey] = state
    world.party.push(npcKey)
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'COMPANION RECRUITED', subtitle: npc.name, result: `${npc.name} bergabung ke party`, victory: true, stats: [{ label: 'Role', value: npc.role, color: '#9bd8ea' }, { label: 'Affinity', value: number(state.affinity), color: '#f0a4b6' }, { label: 'Party', value: `${world.party.length}/3`, color: '#98d2b0' }] }, `${npc.name} sekarang menjadi companion aktif.`)
  }

  if (key === 'partytrain') {
    if (world.party.length === 0) return m.reply(`Belum punya companion. Naikkan affinity lalu gunakan ${m.prefix}recruit.`)
    if (user.koin < 1200 || user.rpg.stamina < 12) return m.reply(`Butuh ${rupiah(1200)} dan 12 stamina.`)
    user.koin -= 1200
    user.rpg.stamina -= 12
    world.partyExp += 250
    world.reputation.adventurers += 2
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'TEAM TRAINING', subtitle: `${world.party.length} companion`, result: `Party EXP ${world.partyExp}`, victory: true, stats: [{ label: 'Party EXP', value: '+250', color: '#98d2b0' }, { label: 'Cost', value: `-${rupiah(1200)}`, color: '#e0c17b' }, { label: 'Stamina', value: '-12', color: '#e7a0b0' }] }, `Party mendapat latihan baru. Total Party EXP ${world.partyExp}.`)
  }

  if (config.mode === 'pet') {
    const pet = user.rpg.pet
    if (!pet) return m.reply(`Kamu belum punya pet. Gunakan ${m.prefix}petshop.`)
    pet.stats = pet.stats || { attack: 10, defense: 6, luck: 5 }
    pet.bond = Math.max(0, Number(pet.bond) || 0)
    pet.hp = Math.max(1, Number(pet.hp) || 100)
    pet.maxHp = Math.max(100, Number(pet.maxHp) || 100)
    if (key === 'petcare') {
      const food = action || ['fish', 'meat', 'bread', 'fruit'].find((name) => (user.inventory[name] || 0) > 0)
      if (!food || (user.inventory[food] || 0) < 1) return m.reply(`Butuh fish, meat, bread, atau fruit.`)
      consumeMaterials(user, { [food]: 1 })
      pet.hunger = Math.min(100, (pet.hunger || 0) + 22)
      pet.bond += 2
      cooldown.commit()
      saveUser(m.sender, user)
      return card(m, sock, config, { title: 'PET CARE COMPLETE', subtitle: pet.name, result: `Hunger ${pet.hunger}/100 · Bond ${pet.bond}`, victory: true, stats: [{ label: 'Food', value: food, color: '#e0c17b' }, { label: 'Bond', value: '+2', color: '#f0a4b6' }, { label: 'Hunger', value: number(pet.hunger), color: '#98d2b0' }] }, `${pet.name} dirawat dengan ${food}.`)
    }
    if (key === 'petheal') {
      const cost = 700
      if (user.koin < cost || pet.hp >= pet.maxHp) return m.reply(`Butuh ${rupiah(cost)} dan pet harus terluka.`)
      user.koin -= cost
      pet.hp = pet.maxHp
      cooldown.commit()
      saveUser(m.sender, user)
      return card(m, sock, config, { title: 'PET RECOVERED', subtitle: pet.name, result: `${pet.hp}/${pet.maxHp} HP`, victory: true, stats: [{ label: 'Pet HP', value: 'FULL', color: '#98d2b0' }, { label: 'Cost', value: `-${rupiah(cost)}`, color: '#e0c17b' }] }, `${pet.name} pulih sepenuhnya.`)
    }
    if (key === 'petbond') {
      if (user.rpg.stamina < 6) return m.reply(`Butuh 6 stamina.`)
      user.rpg.stamina -= 6
      pet.bond += rand(2, 4)
      const rewards = await grant(user, m, sock, { exp: 180 })
      cooldown.commit()
      saveUser(m.sender, user)
      return card(m, sock, config, { title: 'BOND TRAINING', subtitle: pet.name, result: `Bond ${pet.bond}`, victory: true, stats: [{ label: 'Bond', value: number(pet.bond), color: '#f0a4b6' }, { label: 'Stamina', value: '-6', color: '#e7a0b0' }, { label: 'EXP', value: '+180', color: '#9bd8ea' }] }, `Ikatan dengan ${pet.name} menguat · ${rewards.join(' · ')}`)
    }
    if (key === 'pettalent') {
      const stat = ['attack', 'defense', 'luck'].includes(action) ? action : 'attack'
      if (pet.bond < 10) return m.reply(`Butuh Bond 10. Sekarang ${pet.bond}.`)
      pet.bond -= 10
      pet.stats[stat] += 2
      cooldown.commit()
      saveUser(m.sender, user)
      return card(m, sock, config, { title: 'TALENT UPGRADED', subtitle: pet.name, result: `${stat.toUpperCase()} +2`, victory: true, stats: [{ label: 'Talent', value: stat.toUpperCase(), color: '#c7a7f3' }, { label: 'Stat', value: '+2', color: '#98d2b0' }, { label: 'Bond', value: '-10', color: '#f0a4b6' }] }, `${pet.name} mengembangkan talent ${stat}.`)
    }
    if (key === 'petskill') {
      if (user.rpg.stamina < 10) return m.reply(`Butuh 10 stamina.`)
      user.rpg.stamina -= 10
      const score = pet.stats.attack + pet.stats.luck * 2 + rand(0, 25)
      const reward = { koin: 300 + score * 4, exp: 180 + score * 3, items: score > 70 ? { petshard: 1 } : {} }
      const rewards = await grant(user, m, sock, reward)
      pet.exp = (pet.exp || 0) + 20
      cooldown.commit()
      saveUser(m.sender, user)
      return card(m, sock, config, { title: 'PET SKILL SUCCESS', subtitle: pet.name, result: `Skill score ${score}`, victory: true, stats: [{ label: 'Score', value: number(score), color: '#c7a7f3' }, { label: 'Koin', value: `+${rupiah(reward.koin)}`, color: '#e0c17b' }, { label: 'Stamina', value: '-10', color: '#e7a0b0' }] }, rewards.join(' · '))
    }
    if (key === 'petarena') {
      if (user.rpg.stamina < 16 || pet.hp < 25) return m.reply(`Butuh 16 stamina dan 25 pet HP.`)
      user.rpg.stamina -= 16
      const enemy = rand(35, 110)
      const score = pet.stats.attack * 2 + pet.stats.defense + pet.stats.luck + rand(0, 45)
      const win = score >= enemy
      if (win) {
        const rewards = await grant(user, m, sock, { koin: 1000, exp: 320, items: { petshard: Math.random() < 0.3 ? 1 : 0 } })
        cooldown.commit()
        saveUser(m.sender, user)
        return card(m, sock, config, { title: 'PET ARENA WIN', subtitle: pet.name, result: `Score ${score} vs ${enemy}`, victory: true, stats: [{ label: 'Pet', value: pet.name, color: '#c7a7f3' }, { label: 'Score', value: number(score), color: '#98d2b0' }, { label: 'Reward', value: rewards.find((r) => r.includes('Koin')) || '+koin', color: '#e0c17b' }] }, rewards.join(' · '))
      }
      pet.hp = Math.max(1, pet.hp - rand(15, 30))
      cooldown.commit()
      saveUser(m.sender, user)
      return card(m, sock, config, { title: 'PET ARENA LOSS', subtitle: pet.name, result: `Score ${score} vs ${enemy}`, victory: false, stats: [{ label: 'Pet HP', value: number(pet.hp), color: '#e7a0b0' }, { label: 'Score', value: number(score), color: '#c7a7f3' }] }, `${pet.name} kalah dan kehilangan pet HP.`)
    }
  }

  if (config.mode === 'eventjoin') {
    const { state, def } = eventState(world)
    if (state.joined) return m.reply(`Kamu sudah terdaftar di ${def.name}.`)
    state.joined = true
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'EVENT JOINED', subtitle: def.name, result: 'Registration complete', victory: true, stats: [{ label: 'Goal', value: number(def.goal), color: '#e0c17b' }, { label: 'Score', value: '0', color: '#9bd8ea' }] }, `Kamu terdaftar di event ${def.name}.`)
  }

  if (config.mode === 'eventscore') {
    const { state, def } = eventState(world)
    if (!state.joined) return m.reply(`Gunakan ${m.prefix}eventjoin dulu.`)
    if (state.actions >= 5) return m.reply(`Batas 5 percobaan event minggu ini sudah tercapai.`)
    if (user.rpg.stamina < 14) return m.reply(`Butuh 14 stamina.`)
    user.rpg.stamina -= 14
    const weather = currentWeather(world)
    const score = rand(70, 170) + user.level * 3 + (weather.boost || 0)
    state.score += score
    state.actions += 1
    const rewards = await grant(user, m, sock, { exp: 120 + Math.floor(score / 2), koin: 250 + Math.floor(score * 2) })
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'EVENT SCORE', subtitle: def.name, result: `+${score} score`, victory: true, stats: [{ label: 'Score', value: `+${score}`, color: '#e0c17b' }, { label: 'Total', value: number(state.score), color: '#9bd8ea' }, { label: 'Attempts', value: `${state.actions}/5`, color: '#c7a7f3' }] }, rewards.join(' · '))
  }

  if (config.mode === 'eventredeem') {
    const { state, def } = eventState(world)
    if (!state.joined) return m.reply(`Belum ikut event.`)
    if (state.redeemed) return m.reply(`Hadiah event sudah diambil.`)
    if (state.score < 100) return m.reply(`Minimal 100 score. Saat ini ${state.score}.`)
    const scale = state.score >= def.goal ? 2 : 1
    state.redeemed = true
    const rewards = await grant(user, m, sock, { koin: def.reward * scale, exp: 500 * scale, items: { [def.item]: scale } })
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'EVENT REWARD', subtitle: def.name, result: `Reward x${scale}`, victory: true, stats: [{ label: 'Score', value: number(state.score), color: '#e0c17b' }, { label: 'Koin', value: `+${rupiah(def.reward * scale)}`, color: '#98d2b0' }, { label: 'Item', value: `${def.item} x${scale}`, color: '#c7a7f3' }] }, rewards.join(' · '))
  }

  if (config.mode === 'titles') {
    const title = action ? world.titles.find((name) => name.toLowerCase() === action) : null
    if (!title) return card(m, sock, config, { title: 'TITLE VAULT', subtitle: 'Unlocked titles', result: world.titles.join(' · ') || 'Belum ada title', stats: statSummary(user, world) }, `Equip: ${m.prefix}titles <nama>` )
    world.equippedTitle = title
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'TITLE EQUIPPED', subtitle: title, result: title, victory: true, stats: [{ label: 'Active', value: title, color: '#e0c17b' }, { label: 'Unlocked', value: number(world.titles.length), color: '#c7a7f3' }] }, `Title aktif: ${title}.` )
  }

  if (config.mode === 'milestone') {
    const milestoneDefs = {
      level10: { name: 'Veteran', metric: user.level, target: 10, reward: { koin: 5000, exp: 500 } },
      coin50k: { name: 'Treasurer', metric: user.koin, target: 50000, reward: { koin: 6000, exp: 450 } },
      house20: { name: 'Homebuilder', metric: world.house.comfort, target: 20, reward: { koin: 7000, exp: 600 } },
      region5: { name: 'Worldwalker', metric: Object.keys(world.discoveries).length, target: 5, reward: { koin: 7500, exp: 700 } },
    }
    if (!action || !milestoneDefs[action]) return m.reply(Object.entries(milestoneDefs).map(([id, def]) => `${id}: ${def.metric}/${def.target} · ${def.name}`).join('\n') + `\n\nKlaim: ${m.prefix}milestone <id>` )
    world.milestoneClaims = world.milestoneClaims && typeof world.milestoneClaims === 'object' ? world.milestoneClaims : {}
    const def = milestoneDefs[action]
    if (world.milestoneClaims[action]) return m.reply(`Milestone ${def.name} sudah diklaim.`)
    if (def.metric < def.target) return m.reply(`${def.name}: ${def.metric}/${def.target}.`)
    world.milestoneClaims[action] = true
    if (!world.titles.includes(def.name)) world.titles.push(def.name)
    const rewards = await grant(user, m, sock, def.reward)
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'MILESTONE COMPLETE', subtitle: def.name, result: 'Progression unlocked', victory: true, stats: [{ label: 'Progress', value: `${def.metric}/${def.target}`, color: '#98d2b0' }, { label: 'Title', value: def.name, color: '#e0c17b' }] }, rewards.join(' · '))
  }

  if (config.mode === 'achievement') {
    const metrics = {
      scout10: Object.keys(world.discoveries).length,
      tower5: world.towerFloor,
      boss5: world.bossWins,
      dungeon3: world.dungeonClears,
      craft10: world.skills.crafting,
      wisdom10: world.skills.wisdom,
      friend30: Object.values(world.npcs).some((value) => (value?.affinity || 0) >= 30) ? 30 : 0,
    }
    const defs = {
      scout10: { name: 'Pathfinder', target: 10, metric: metrics.scout10, reward: { koin: 7000, exp: 900 } },
      tower5: { name: 'Sky Climber', target: 5, metric: metrics.tower5, reward: { koin: 6000, exp: 850 } },
      boss5: { name: 'Bossbreaker', target: 5, metric: metrics.boss5, reward: { koin: 8500, exp: 1100 } },
      dungeon3: { name: 'Dungeon Walker', target: 3, metric: metrics.dungeon3, reward: { koin: 5000, exp: 700 } },
      craft10: { name: 'Master Crafter', target: 10, metric: metrics.craft10, reward: { koin: 5000, exp: 900 } },
      wisdom10: { name: 'Lorekeeper', target: 10, metric: metrics.wisdom10, reward: { koin: 5000, exp: 800 } },
      friend30: { name: 'Trusted Ally', target: 30, metric: metrics.friend30, reward: { koin: 5000, exp: 800 } },
    }
    const id = action
    if (!id || !defs[id]) return m.reply(Object.entries(defs).map(([name, def]) => `${name}: ${def.metric}/${def.target} · ${def.name}`).join('\n') + `\n\nKlaim: ${m.prefix}${key} <id>`)
    const def = defs[id]
    world.claimed = world.claimed && typeof world.claimed === 'object' ? world.claimed : {}
    if (world.claimed[id]) return m.reply(`Achievement *${def.name}* sudah diklaim.`)
    if (def.metric < def.target) return m.reply(`${def.name}: ${def.metric}/${def.target}.`)
    world.claimed[id] = true
    const rewards = await grant(user, m, sock, def.reward)
    if (!world.titles.includes(def.name)) world.titles.push(def.name)
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'ACHIEVEMENT CLAIMED', subtitle: def.name, result: 'Milestone unlocked', victory: true, stats: [{ label: 'Progress', value: `${def.metric}/${def.target}`, color: '#98d2b0' }, { label: 'Title', value: def.name, color: '#c7a7f3' }, { label: 'Reward', value: rewards[0] || '+reward', color: '#e0c17b' }] }, rewards.join(' · '))
  }

  if (config.mode === 'auction') {
    const week = getWeekKey()
    if (world.auction.week !== week) {
      world.auction = { week, offers: ['steel', 'diamond', 'relicshard'].map((item, i) => ({ id: i + 1, item, qty: i + 1, price: 2500 + i * 4500, sold: false })) }
    }
    if (action === 'buy') {
      const id = Number(args[1])
      const offer = world.auction.offers.find((entry) => entry.id === id && !entry.sold)
      if (!offer) return m.reply(`Lot tidak tersedia.`)
      if (user.koin < offer.price) return m.reply(`Butuh ${rupiah(offer.price)}.`)
      user.koin -= offer.price
      user.inventory[offer.item] = (user.inventory[offer.item] || 0) + offer.qty
      offer.sold = true
      cooldown.commit()
      saveUser(m.sender, user)
      return card(m, sock, config, { title: 'AUCTION PURCHASE', subtitle: `Lot #${offer.id}`, result: `${offer.item} x${offer.qty}`, victory: true, stats: [{ label: 'Lot', value: number(offer.id), color: '#c7a7f3' }, { label: 'Cost', value: `-${rupiah(offer.price)}`, color: '#e0c17b' }, { label: 'Item', value: `${offer.item} x${offer.qty}`, color: '#98d2b0' }] }, `Berhasil membeli lot #${offer.id}.`)
    }
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'AUCTION HALL', subtitle: 'Weekly offers', result: world.auction.offers.filter((offer) => !offer.sold).map((offer) => `#${offer.id} ${offer.item} x${offer.qty} · ${rupiah(offer.price)}`).join(' | ') || 'Tidak ada lot', stats: statSummary(user, world) }, `Beli: ${m.prefix}auction buy <id>`)
  }

  if (config.mode === 'bid') {
    const bidAmount = Math.max(0, Number(args[1]) || 0)
    if (!bidAmount) return m.reply(`Contoh: ${m.prefix}bid 5000`)
    if (user.koin < bidAmount) return m.reply(`Koin tidak cukup.`)
    const rival = rand(0, Math.max(2000, Math.floor(bidAmount * 1.25)))
    user.koin -= bidAmount
    if (bidAmount >= rival) {
      user.inventory.relicshard = (user.inventory.relicshard || 0) + 1
      const rewards = await grant(user, m, sock, { exp: 300 })
      cooldown.commit()
      saveUser(m.sender, user)
      return card(m, sock, config, { title: 'BID WON', subtitle: 'Auction Duel', result: `Bid ${rupiah(bidAmount)} vs ${rupiah(rival)}`, victory: true, stats: [{ label: 'Your Bid', value: rupiah(bidAmount), color: '#e0c17b' }, { label: 'Rival', value: rupiah(rival), color: '#e7a0b0' }, { label: 'Prize', value: 'relicshard x1', color: '#c7a7f3' }] }, `Kamu memenangkan lelang · ${rewards.join(' · ')}`)
    }
    const refund = Math.floor(bidAmount * 0.45)
    user.koin += refund
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'BID LOST', subtitle: 'Auction Duel', result: `Bid ${rupiah(bidAmount)} vs ${rupiah(rival)}`, victory: false, stats: [{ label: 'Bid', value: rupiah(bidAmount), color: '#e7a0b0' }, { label: 'Rival', value: rupiah(rival), color: '#c7a7f3' }, { label: 'Refund', value: rupiah(refund), color: '#e0c17b' }] }, `Lelang kalah. Sebagian bid dikembalikan.`)
  }

  if (config.mode === 'market') {
    const sellMode = action === 'sell'
    const item = sellMode ? String(args[1] || '').toLowerCase() : action
    const qty = Math.max(1, Math.min(20, Number(sellMode ? args[2] : args[1]) || 1))
    const base = MARKET_ITEMS[item]
    if (!item || !base) return card(m, sock, config, { title: 'MARKET QUOTE', subtitle: 'Dynamic prices', result: Object.entries(MARKET_ITEMS).map(([name, value]) => `${name} ${rupiah(value)}`).join(' · '), stats: statSummary(user, world) }, `Beli: ${m.prefix}market <item> <jumlah> · Jual: ${m.prefix}market sell <item> <jumlah>`)
    const daySeed = Math.floor(Date.now() / 86_400_000)
    const factor = 0.85 + (((daySeed % 17) + item.length * 3) % 20) / 100
    const price = Math.max(1, Math.floor(base * factor))
    if (sellMode) {
      if ((user.inventory[item] || 0) < qty) return m.reply(`Stok ${item} tidak cukup.`)
      consumeMaterials(user, { [item]: qty })
      const income = Math.floor(price * 0.75 * qty)
      user.koin += income
      cooldown.commit()
      saveUser(m.sender, user)
      return card(m, sock, config, { title: 'MARKET SALE', subtitle: item, result: `+${rupiah(income)}`, victory: true, stats: [{ label: 'Qty', value: number(qty), color: '#9bd8ea' }, { label: 'Unit', value: rupiah(price), color: '#e0c17b' }, { label: 'Income', value: `+${rupiah(income)}`, color: '#98d2b0' }] }, `Harga pasar ${rupiah(price)} · spread pasar diterapkan.`)
    }
    const total = price * qty
    if (user.koin < total) return m.reply(`Butuh ${rupiah(total)}.`)
    user.koin -= total
    user.inventory[item] = (user.inventory[item] || 0) + qty
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'MARKET PURCHASE', subtitle: item, result: `${item} x${qty}`, victory: true, stats: [{ label: 'Unit', value: rupiah(price), color: '#e0c17b' }, { label: 'Qty', value: number(qty), color: '#9bd8ea' }, { label: 'Cost', value: `-${rupiah(total)}`, color: '#e7a0b0' }] }, `Barang masuk inventory.`)
  }

  if (config.mode === 'route') {
    const route = FEATURES.merchantroute.routes[action || 'coast']
    if (!route) return m.reply(`Route: ${Object.keys(FEATURES.merchantroute.routes).join(', ')}`)
    if (user.koin < route.buy || user.rpg.stamina < 16) return m.reply(`Butuh ${rupiah(route.buy)} dan 16 stamina.`)
    user.koin -= route.buy
    user.rpg.stamina -= 16
    const hit = Math.random() >= route.risk
    const value = hit ? rand(route.min, route.max) : rand(Math.floor(route.buy * 0.25), Math.floor(route.buy * 0.65))
    user.koin += value
    const exp = hit ? 420 : 180
    const rewards = await grant(user, m, sock, { exp })
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: hit ? 'TRADE ROUTE PROFIT' : 'TRADE ROUTE LOSS', subtitle: route.name, result: hit ? `Net +${rupiah(value - route.buy)}` : `Loss ${rupiah(route.buy - value)}`, victory: hit, stats: [{ label: 'Investment', value: rupiah(route.buy), color: '#e0c17b' }, { label: 'Return', value: rupiah(value), color: hit ? '#98d2b0' : '#e7a0b0' }, { label: 'Risk', value: `${Math.round(route.risk * 100)}%`, color: '#c7a7f3' }, { label: 'EXP', value: `+${exp}`, color: '#9bd8ea' }] }, rewards.join(' · '))
  }

  if (config.mode === 'loan') {
    const amount = action === 'all' ? user.level * 15000 : Number(action)
    if (world.loan > 0) return m.reply(`Kamu masih punya hutang ${rupiah(world.loan)}. Lunasi dulu.`)
    const maxLoan = 10000 + user.level * 15000
    if (!amount || amount < 1000 || amount > maxLoan) return m.reply(`Pinjaman 1.000-${rupiah(maxLoan)}.`)
    const debt = Math.floor(amount * 1.12)
    world.loan = debt
    world.loanIssuedAt = Date.now()
    user.koin += amount
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'CREDIT APPROVED', subtitle: 'RPG Credit Office', result: `Cash +${rupiah(amount)}`, victory: true, stats: [{ label: 'Cash', value: `+${rupiah(amount)}`, color: '#98d2b0' }, { label: 'Debt', value: rupiah(debt), color: '#e7a0b0' }, { label: 'Rate', value: '12%', color: '#e0c17b' }] }, `Hutang tercatat ${rupiah(debt)}. Lunasi dengan ${m.prefix}repay all.`)
  }

  if (config.mode === 'repay') {
    if (world.loan <= 0) return m.reply(`Tidak ada hutang aktif.`)
    const amount = action === 'all' ? world.loan : Math.min(world.loan, Number(action) || 0)
    if (!amount || user.koin < amount) return m.reply(`Masukkan nominal yang tersedia.`)
    user.koin -= amount
    world.loan -= amount
    if (world.loan <= 0) world.loan = 0
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: world.loan ? 'PARTIAL REPAYMENT' : 'DEBT CLEARED', subtitle: 'Credit settlement', result: rupiah(world.loan), victory: !world.loan, stats: [{ label: 'Paid', value: `-${rupiah(amount)}`, color: '#e0c17b' }, { label: 'Remaining', value: rupiah(world.loan), color: world.loan ? '#e7a0b0' : '#98d2b0' }] }, world.loan ? `Sisa hutang ${rupiah(world.loan)}.` : 'Semua hutang telah dilunasi.')
  }

  if (config.mode === 'insurance') {
    const cost = 3500
    if (world.insurance.until > Date.now()) return m.reply(`Asuransi masih aktif hingga ${new Date(world.insurance.until).toLocaleString('id-ID')}.`)
    if (user.koin < cost) return m.reply(`Butuh ${rupiah(cost)}.`)
    user.koin -= cost
    world.insurance = { until: Date.now() + 24 * 60 * 60_000, limit: 10000, used: false }
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'INSURANCE ACTIVE', subtitle: 'Risk protection', result: 'Coverage 24 jam', victory: true, stats: [{ label: 'Premium', value: `-${rupiah(cost)}`, color: '#e0c17b' }, { label: 'Coverage', value: rupiah(10000), color: '#98d2b0' }, { label: 'Duration', value: '24 jam', color: '#9bd8ea' }] }, 'Perlindungan aktif terhadap satu kerugian rampokan hingga Rp 10.000.')
  }

  if (key === 'workshop') {
    if (!action) return card(m, sock, config, { title: 'WORKSHOP STATUS', subtitle: 'Crafting facility', result: `Level ${world.workshop.level} · Craft discount ${Math.min(25, (world.workshop.level - 1) * 3)}%`, stats: statSummary(user, world) }, `Upgrade: ${m.prefix}workshop upgrade`)
    if (action !== 'upgrade') return m.reply(`Gunakan ${m.prefix}workshop upgrade.`)
    const cost = 7000 + (world.workshop.level - 1) * 4500
    if (user.koin < cost) return m.reply(`Butuh ${rupiah(cost)}.`)
    user.koin -= cost
    world.workshop.level += 1
    world.skills.crafting += 3
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'WORKSHOP UPGRADED', subtitle: `Level ${world.workshop.level}`, result: `Craft discount ${Math.min(25, (world.workshop.level - 1) * 3)}%`, victory: true, stats: [{ label: 'Level', value: number(world.workshop.level), color: '#c7a7f3' }, { label: 'Cost', value: `-${rupiah(cost)}`, color: '#e0c17b' }, { label: 'Crafting', value: '+3', color: '#98d2b0' }] }, `Workshop sekarang level ${world.workshop.level}.`)
  }

  if (config.mode === 'furnish') {
    const rooms = { study: { cost: 4500, comfort: 8 }, forge: { cost: 6500, comfort: 10 }, garden: { cost: 4000, comfort: 7 }, trophy: { cost: 8000, comfort: 12 } }
    if (!action || !rooms[action]) return m.reply(`Ruang: ${Object.keys(rooms).join(', ')}`)
    if (world.house.rooms.includes(action)) return m.reply(`Ruang ${action} sudah ada.`)
    const room = rooms[action]
    if (user.koin < room.cost) return m.reply(`Butuh ${rupiah(room.cost)}.`)
    user.koin -= room.cost
    world.house.rooms.push(action)
    world.house.comfort += room.comfort
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'ROOM ADDED', subtitle: action, result: `Comfort ${world.house.comfort}`, victory: true, stats: [{ label: 'Room', value: action, color: '#c7a7f3' }, { label: 'Comfort', value: `+${room.comfort}`, color: '#98d2b0' }, { label: 'Cost', value: `-${rupiah(room.cost)}`, color: '#e0c17b' }] }, `${action} ditambahkan ke rumah.`)
  }

  if (key === 'artifactforge') {
    if (!world.blueprints.relicframe) return m.reply(`Butuh blueprint *relicframe*. Gunakan ${m.prefix}blueprint relicframe.`)
    if (!hasMaterials(user, FEATURES.artifactforge.recipe)) return m.reply(`Butuh ${Object.entries(FEATURES.artifactforge.recipe).map(([i, q]) => `${i} x${q}`).join(', ')}.`)
    consumeMaterials(user, FEATURES.artifactforge.recipe)
    user.inventory.reliccore = (user.inventory.reliccore || 0) + 1
    world.relics['reliccore'] = 1
    world.reputation.scholars += 4
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'ARTIFACT ASSEMBLED', subtitle: 'Relic Core', result: 'Relic Core x1', victory: true, stats: [{ label: 'Core', value: 'reliccore', color: '#c7a7f3' }, { label: 'Scholar Rep', value: '+4', color: '#9bd8ea' }] }, 'Artefact fragments berhasil dirakit menjadi Relic Core.')
  }

  if (config.mode === 'profession') {
    const options = FEATURES.profession.options
    if (!action || !options[action]) {
      return card(m, sock, config, {
        title: 'PROFESSION HALL', subtitle: 'Career specialization', result: world.profession?.name || 'Belum memilih profesi', stats: Object.entries(options).slice(0, 6).map(([id, option]) => ({ label: option.name, value: rupiah(option.cost), color: option.theme === 'medical' ? '#91d9ea' : option.theme === 'police' ? '#b9adf4' : option.theme === 'farm' ? '#98d2b0' : option.theme === 'mining' ? '#b5c5e8' : option.theme === 'fishing' ? '#91d9ea' : option.theme === 'kitchen' ? '#e1c27d' : '#e0a5ba' }))
      }, `Pilih: ${Object.entries(options).map(([id, option]) => `${id} (${rupiah(option.cost)})`).join(' · ')}`)
    }
    const selected = options[action]
    if (world.profession?.key === action) return m.reply(`Profesi ${selected.name} sudah aktif.`)
    if (user.koin < selected.cost) return m.reply(`Butuh ${rupiah(selected.cost)}.`)
    if (world.profession?.stat) {
      user.rpg[world.profession.stat] = Math.max(world.profession.stat.startsWith('max') ? 1 : 0, (Number(user.rpg[world.profession.stat]) || 0) - Number(world.profession.amount || 0))
      if (world.profession.stat === 'maxHealth' && user.rpg.health > user.rpg.maxHealth) user.rpg.health = user.rpg.maxHealth
      if (world.profession.stat === 'maxMana' && user.rpg.mana > user.rpg.maxMana) user.rpg.mana = user.rpg.maxMana
      if (world.profession.stat === 'maxStamina' && user.rpg.stamina > user.rpg.maxStamina) user.rpg.stamina = user.rpg.maxStamina
    }
    user.koin -= selected.cost
    user.rpg[selected.stat] = (Number(user.rpg[selected.stat]) || 0) + selected.amount
    if (selected.stat === 'maxHealth') user.rpg.health = Math.min(user.rpg.maxHealth, user.rpg.health + selected.amount)
    if (selected.stat === 'maxMana') user.rpg.mana = Math.min(user.rpg.maxMana, user.rpg.mana + selected.amount)
    if (selected.stat === 'maxStamina') user.rpg.stamina = Math.min(user.rpg.maxStamina, user.rpg.stamina + selected.amount)
    world.profession = { key: action, name: selected.name, theme: selected.theme, stat: selected.stat, amount: selected.amount, description: selected.description, changedAt: Date.now() }
    world.skills.crafting += action === 'blacksmith' ? 2 : action === 'cook' ? 1 : 0
    world.reputation.adventurers += 2
    cooldown.commit()
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'PROFESSION EQUIPPED', subtitle: selected.name, result: selected.description, victory: true, job: selected.name, jobTheme: selected.theme, stats: [{ label: 'Profession', value: selected.name, color: '#c7a7f3' }, { label: 'Bonus', value: `${selected.stat.toUpperCase()} +${number(selected.amount)}`, color: '#98d2b0' }, { label: 'Cost', value: `-${rupiah(selected.cost)}`, color: '#e0c17b' }] }, `${selected.name} aktif. Bonus ${selected.stat.toUpperCase()} +${selected.amount}.`)
  }

  if (config.mode === 'relic') {
    const equipAction = action === 'equip' ? String(args.slice(1).join(' ') || '').toLowerCase() : ''
    if (action === 'equip' && equipAction) {
      const match = Object.keys(world.relics).find((name) => name.toLowerCase() === equipAction)
      if (!match) return m.reply(`Relic belum tersedia.`)
      world.equippedRelic = match
      const bonuses = { Starheart: ['attack', 8], Duskveil: ['defense', 8], Tidecaller: ['mana', 20], Cinderbrand: ['speed', 8], 'Verdant Crown': ['luck', 8] }
      const [stat, amount] = bonuses[match] || ['luck', 5]
      world.relicApplied = world.relicApplied || {}
      if (!world.relicApplied[match]) {
        user.rpg[stat] += amount
        world.relicApplied[match] = true
      }
      cooldown.commit()
      saveUser(m.sender, user)
      return card(m, sock, config, { title: 'RELIC EQUIPPED', subtitle: match, result: `${stat.toUpperCase()} +${amount}`, victory: true, stats: [{ label: 'Relic', value: match, color: '#c7a7f3' }, { label: 'Bonus', value: `${stat.toUpperCase()} +${amount}`, color: '#98d2b0' }] }, `${match} terpasang.`)
    }
    return card(m, sock, config, { title: 'RELIC VAULT', subtitle: 'Ancient equipment', result: Object.keys(world.relics).join(' · ') || 'Belum ada relic', stats: statSummary(user, world) }, `Equip: ${m.prefix}relic equip <nama>`)
  }

  if (key === 'relicforge') {
    if (!world.blueprints.arcanecore || !world.relics.reliccore) return m.reply(`Butuh blueprint *arcanecore* dan Relic Core.`)
    if (!hasMaterials(user, FEATURES.relicforge.recipe)) return m.reply(`Butuh ${Object.entries(FEATURES.relicforge.recipe).map(([i, q]) => `${i} x${q}`).join(', ')}.`)
    consumeMaterials(user, FEATURES.relicforge.recipe)
    const relicName = pick(['Starheart', 'Duskveil', 'Tidecaller', 'Cinderbrand', 'Verdant Crown'])
    delete world.relics.reliccore
    world.relics[relicName] = 1
    user.inventory[relicName.toLowerCase()] = (user.inventory[relicName.toLowerCase()] || 0) + 1
    const rewards = await grant(user, m, sock, { exp: 1200, koin: 6000 })
    saveUser(m.sender, user)
    return card(m, sock, config, { title: 'MYTHIC RELIC FORGED', subtitle: relicName, result: relicName, victory: true, stats: [{ label: 'Relic', value: relicName, color: '#c7a7f3' }, { label: 'EXP', value: '+1200', color: '#9bd8ea' }, { label: 'Koin', value: '+Rp 6.000', color: '#e0c17b' }] }, `${relicName} tercipta · ${rewards.join(' · ')}`)
  }

  return m.reply(`Gunakan ${m.prefix}${key} untuk membuka fitur ini.`)
}

export { FEATURES, REGIONS, runWorldFeature, ensureWorld, getSeason }
export default { FEATURES, REGIONS, runWorldFeature, ensureWorld, getSeason }
