/* By AlzRiss - Usanagi Umi AI */

import { createCanvas, loadImage } from '@napi-rs/canvas'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import { sendInteractive } from '../awang-tombol.js'
import { settings } from '../../config/settings.js'
import { rupiah, number, formatRpgText } from './awang-format.js'
import { getUser, recordRpgActivity } from './awang-db.js'

const WIDTH = 1280
const HEIGHT = 860
const FONT = 'Arial'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const RPG_ASSET_DIR = path.join(__dirname, '../../assets/rpg/items')
const assetCache = new Map()
const cardResponseLedger = new WeakMap()

const FEATURE_OVERRIDES = {
  profile: { family: 'profile', scene: 'profile', palette: 'profile', asset: 'map', kicker: 'CHARACTER SHEET' },
  heal: { family: 'medical', scene: 'clinic', palette: 'clinic', asset: 'potion', kicker: 'RECOVERY CLINIC' },
  stamina: { family: 'training', scene: 'training', palette: 'work', asset: 'dumbbell', kicker: 'ENERGY STATUS' },
  meditation: { family: 'magic', scene: 'meditation', palette: 'astral', asset: 'book', kicker: 'FOCUS SESSION' },
  transfer: { family: 'finance', scene: 'bank', palette: 'bank', asset: 'coin', kicker: 'SECURE TRANSFER' },
  leveluprpg: { family: 'progression', scene: 'levelup', palette: 'levelup', asset: 'diamond', kicker: 'LEVEL ASCENSION' },
  weekly: { family: 'reward', scene: 'reward', palette: 'weekly', asset: 'chest', kicker: 'WEEKLY REWARD' },
  challenge: { family: 'combat', scene: 'battle', palette: 'battle', asset: 'shield', kicker: 'CHALLENGE MATCH' },
  crime: { family: 'risk', scene: 'risk', palette: 'risk', asset: 'map', kicker: 'RISK OPERATION' },
  rob: { family: 'risk', scene: 'risk', palette: 'risk', asset: 'coin', kicker: 'HEIST ATTEMPT' },
  steal: { family: 'risk', scene: 'risk', palette: 'risk', asset: 'bag', kicker: 'STEALTH RUN' },
  streamer: { family: 'stream', scene: 'stream', palette: 'stream', asset: 'coin', kicker: 'LIVE SESSION' },
  beg: { family: 'career', scene: 'work', palette: 'work', asset: 'coin', kicker: 'STREET HUSTLE' },
  nulis: { family: 'lore', scene: 'journal', palette: 'journal', asset: 'book', kicker: 'WRITING SESSION' },
  slot: { family: 'minigame', scene: 'slot', palette: 'gold', asset: 'slot', kicker: 'SLOT SPIN' },
  lottery: { family: 'minigame', scene: 'lottery', palette: 'gold', asset: 'chest', kicker: 'LOTTERY DRAW' },
  dice: { family: 'minigame', scene: 'dice', palette: 'gold', asset: 'dice', kicker: 'DICE TABLE' },
  buykoin: { family: 'finance', scene: 'bank', palette: 'bank', asset: 'coin', kicker: 'EXP TO COIN EXCHANGE' },
  use: { family: 'inventory', scene: 'inventory', palette: 'inventory', asset: 'bag', kicker: 'ITEM ACTION' },
  shop: { family: 'commerce', scene: 'shop', palette: 'shop', asset: 'potion', kicker: 'ITEM CATALOG' },
  inventory: { family: 'inventory', scene: 'inventory', palette: 'inventory', asset: 'bag', kicker: 'GEAR & RESOURCES' },
  training: { family: 'training', scene: 'training', palette: 'training', asset: 'dumbbell', kicker: 'STAT GROWTH' },
  battle: { family: 'combat', scene: 'battle', palette: 'battle', asset: 'sword', kicker: 'COMBAT STATUS' },
  boss: { family: 'combat', scene: 'boss', palette: 'boss', asset: 'sword', kicker: 'ELITE ENCOUNTER' },
  quest: { family: 'quest', scene: 'quest', palette: 'expedition', asset: 'scroll', kicker: 'MISSION BRIEF' },
  fishing: { family: 'fishing', scene: 'fishing', palette: 'fishing', asset: 'fish', kicker: 'CATCH REPORT' },
  mining: { family: 'mining', scene: 'mining', palette: 'mining', asset: 'ore', kicker: 'RESOURCE FIELD' },
  treasure: { family: 'treasure', scene: 'treasure', palette: 'reward', asset: 'chest', kicker: 'LOOT DISCOVERY' },
  guild: { family: 'guild', scene: 'guild', palette: 'party', asset: 'shield', kicker: 'GUILD STATUS' },
  pet: { family: 'pet', scene: 'pet', palette: 'pet', asset: 'pet', kicker: 'COMPANION STATUS' },
  petshop: { family: 'pet', scene: 'petshop', palette: 'pet', asset: 'pet', kicker: 'COMPANION MARKET' },
  garden: { family: 'farm', scene: 'garden', palette: 'farm', asset: 'flower', kicker: 'CROP STATUS' },
  cooking: { family: 'cooking', scene: 'cooking', palette: 'cream', asset: 'food', kicker: 'KITCHEN RESULT' },
  cook: { family: 'cooking', scene: 'cook', palette: 'cream', asset: 'food', kicker: 'MEAL RESULT' },
  alchemy: { family: 'alchemy', scene: 'alchemy', palette: 'astral', asset: 'potion', kicker: 'BREW RESULT' },
  blacksmith: { family: 'forge', scene: 'blacksmith', palette: 'ember', asset: 'hammer', kicker: 'FORGE RESULT' },
  craft: { family: 'craft', scene: 'craft', palette: 'ember', asset: 'hammer', kicker: 'CRAFT RESULT' },
  woodcut: { family: 'forest', scene: 'woodcut', palette: 'verdant', asset: 'hammer', kicker: 'FOREST HARVEST' },
  hunt: { family: 'forest', scene: 'hunt', palette: 'verdant', asset: 'sword', kicker: 'HUNT RESULT' },
  berburu: { family: 'forest', scene: 'berburu', palette: 'verdant', asset: 'sword', kicker: 'HUNT RESULT' },
  work: { family: 'career', scene: 'work', palette: 'work', asset: 'coin', kicker: 'CAREER RESULT' },
  daily: { family: 'reward', scene: 'daily', palette: 'daily', asset: 'coin', kicker: 'DAILY REWARD' },
  hourly: { family: 'reward', scene: 'hourly', palette: 'hourly', asset: 'coin', kicker: 'HOURLY REWARD' },
  leaderboard: { family: 'ranking', scene: 'leaderboard', palette: 'achievement', asset: 'shield', kicker: 'RANKING BOARD' },
  bank: { family: 'bank', scene: 'bank', palette: 'bank', asset: 'coin', kicker: 'FINANCE DESK' },
  market: { family: 'commerce', scene: 'market', palette: 'market', asset: 'coin', kicker: 'TRADE FLOOR' },
  auction: { family: 'commerce', scene: 'market', palette: 'market', asset: 'coin', kicker: 'AUCTION HOUSE' },
  bid: { family: 'commerce', scene: 'market', palette: 'market', asset: 'coin', kicker: 'LIVE BID' },
  house: { family: 'home', scene: 'house', palette: 'house', asset: 'house', kicker: 'HOME STATUS' },
  furnish: { family: 'home', scene: 'house', palette: 'house', asset: 'house', kicker: 'ROOM DESIGN' },
  worldmap: { family: 'exploration', scene: 'atlas', palette: 'atlas', asset: 'map', kicker: 'WORLD NAVIGATION' },
  scout: { family: 'exploration', scene: 'adventure', palette: 'verdant', asset: 'map', kicker: 'FIELD SCOUTING' },
  survey: { family: 'exploration', scene: 'atlas', palette: 'atlas', asset: 'map', kicker: 'CARTOGRAPHY' },
  landmark: { family: 'exploration', scene: 'ruins', palette: 'dusk', asset: 'map', kicker: 'LANDMARK DISCOVERY' },
  archaeology: { family: 'exploration', scene: 'ruins', palette: 'dusk', asset: 'map', kicker: 'ARCHAEOLOGY DIG' },
  voyage: { family: 'travel', scene: 'travel', palette: 'azure', asset: 'map', kicker: 'SEA ROUTE' },
  portal: { family: 'magic', scene: 'magic', palette: 'astral', asset: 'map', kicker: 'AETHER GATE' },
  dungeonrun: { family: 'dungeon', scene: 'dungeon', palette: 'dusk', asset: 'sword', kicker: 'ROOM RAID' },
  dungeonkey: { family: 'dungeon', scene: 'dungeon', palette: 'ember', asset: 'scroll', kicker: 'ACCESS KEY' },
  bossrush: { family: 'combat', scene: 'boss', palette: 'boss', asset: 'sword', kicker: 'ELITE SERIES' },
  gauntlet: { family: 'combat', scene: 'battle', palette: 'battle', asset: 'shield', kicker: 'SURVIVAL SERIES' },
  colosseum: { family: 'combat', scene: 'battle', palette: 'battle', asset: 'shield', kicker: 'RANKED ARENA' },
  arena: { family: 'combat', scene: 'battle', palette: 'battle', asset: 'shield', kicker: 'ARENA MATCH' },
  duel: { family: 'combat', scene: 'battle', palette: 'battle', asset: 'sword', kicker: 'PLAYER DUEL' },
  casino: { family: 'minigame', scene: 'casino', palette: 'gold', asset: 'slot', kicker: 'RISK TABLE' },
  coinflip: { family: 'minigame', scene: 'coinflip', palette: 'gold', asset: 'coin', kicker: 'COIN FLIP' },
  petarena: { family: 'pet', scene: 'pet', palette: 'pet', asset: 'pet', kicker: 'PET ARENA' },
  parkir: { family: 'vehicle', scene: 'parkir', palette: 'parking', asset: 'car', kicker: 'PARKING DISTRICT' },
  adventure: { family: 'exploration', scene: 'adventure', palette: 'verdant', asset: 'compass', kicker: 'ADVENTURE ROUTE' },
  profession: { family: 'career', scene: 'profile', palette: 'atlas', asset: 'map', kicker: 'CAREER PATH' },
}

const FEATURE_ALIASES = {
  atm: 'bank',
  author: 'nulis',
  pengarang: 'nulis',
  bag: 'inventory',
  inv: 'inventory',
  tas: 'inventory',
  beli: 'shop',
  jual: 'shop',
  toko: 'shop',
  store: 'shop',
  beg: 'beg',
  minta: 'beg',
  ngemis: 'beg',
  gembel: 'beg',
  cf: 'coinflip',
  flip: 'coinflip',
  toss: 'coinflip',
  cekstamina: 'stamina',
  energy: 'stamina',
  latihan: 'training',
  train: 'training',
  job: 'work',
  kerja: 'work',
  kayu: 'woodcut',
  chop: 'woodcut',
  nebang: 'woodcut',
  tambang: 'mining',
  mine: 'mining',
  mancing: 'fishing',
  rpgfish: 'fishing',
  nulis: 'nulis',
  rpgprofile: 'profile',
  rpgstat: 'profile',
  rpgstatus: 'profile',
  toprpg: 'leaderboard',
  rpgleader: 'leaderboard',
  gacha: 'lottery',
  spin: 'lottery',
  undian: 'lottery',
  slots: 'slot',
  mesin: 'slot',
  dadu: 'dice',
  roll: 'dice',
  peti: 'treasure',
  chest: 'treasure',
  openbox: 'treasure',
  makan: 'use',
  pake: 'use',
  open: 'use',
  cekstamina: 'stamina',
  tf: 'transfer',
  kirim: 'transfer',
  pay: 'transfer',
  vtuber: 'streamer',
  live: 'streamer',
  mencuri: 'steal',
  maling: 'rob',
  levelup: 'leveluprpg',
}

function featureProfile(featureKey, type = 'reward') {
  const rawKey = String(featureKey || type || 'reward').toLowerCase()
  const key = FEATURE_ALIASES[rawKey] || rawKey
  if (FEATURE_OVERRIDES[key]) return { key, ...FEATURE_OVERRIDES[key] }
  const groups = [
    { test: /(?:campfire|camp|rest|inn)/, family: 'rest', scene: key.includes('inn') ? 'inn' : 'camp', palette: key.includes('inn') ? 'inn' : 'camp', asset: key.includes('inn') ? 'house' : 'dumbbell', kicker: 'FIELD RECOVERY' },
    { test: /(?:ascension|tower)/, family: 'tower', scene: 'tower', palette: 'tower', asset: 'map', kicker: 'ASCENT CHALLENGE' },
    { test: /(?:bountyboard|bountyclaim|reputation)/, family: 'board', scene: 'board', palette: key === 'reputation' ? 'atlas' : 'board', asset: 'scroll', kicker: 'CONTRACT BOARD' },
    { test: /(?:trials|shrine|sanctuary)/, family: 'magic', scene: 'magic', palette: 'shrine', asset: 'scroll', kicker: 'ARCANE CHOICE' },
    { test: /(?:museum|collection|relic$)/, family: 'archive', scene: 'archive', palette: key === 'collection' ? 'cream' : key === 'relic' ? 'artifact' : 'museum', asset: key === 'relic' ? 'chest' : 'book', kicker: 'ARCHIVE HALL' },
    { test: /(?:blueprint|dismantle|refine|smelt|tannery|salvage|workshop|artifactforge|relicforge)/, family: 'forge', scene: 'forge', palette: 'ember', asset: 'hammer', kicker: 'CRAFTING FACILITY' },
    { test: /(?:baitshop)/, family: 'fishing', scene: 'fishing', palette: 'azure', asset: 'fish', kicker: 'FISHING PREP' },
    { test: /(?:trapcraft)/, family: 'hunt', scene: 'adventure', palette: 'verdant', asset: 'sword', kicker: 'HUNTER WORKSHOP' },
    { test: /(?:fertilizer|irrigate|mill)/, family: 'farm', scene: 'farm', palette: 'farm', asset: 'flower', kicker: 'FIELD SUPPORT' },
    { test: /(?:ranch|milk|shear)/, family: 'ranch', scene: 'ranch', palette: 'ranch', asset: 'food', kicker: 'LIVESTOCK ACTIVITY' },
    { test: /(?:tavern)/, family: 'tavern', scene: 'tavern', palette: 'tavern', asset: 'food', kicker: 'ADVENTURER TAVERN' },
    { test: /(?:library|study)/, family: 'library', scene: 'library', palette: 'library', asset: 'book', kicker: 'LORE & KNOWLEDGE' },
    { test: /(?:journal)/, family: 'journal', scene: 'journal', palette: 'journal', asset: 'book', kicker: 'TRAVEL RECORD' },
    { test: /(?:npc|talk|friendship|giftnpc)/, family: 'social', scene: 'npc', palette: key.includes('friend') || key.includes('gift') ? 'rose' : 'npc', asset: 'pet', kicker: 'SOCIAL ENCOUNTER' },
    { test: /(?:recruit|partytrain|party)/, family: 'party', scene: 'party', palette: key.includes('train') ? 'battle' : 'party', asset: 'shield', kicker: 'PARTY MANAGEMENT' },
    { test: /(?:petcare|petheal|petbond|pettalent|petskill|petarena|petshop|breeding)/, family: 'pet', scene: 'pet', palette: 'pet', asset: 'pet', kicker: 'COMPANION SYSTEM' },
    { test: /(?:season|weather)/, family: 'weather', scene: 'weather', palette: 'weather', asset: 'map', kicker: 'WORLD CLIMATE' },
    { test: /(?:eventboard|eventjoin|eventscore|eventredeem|festival)/, family: 'event', scene: key === 'eventboard' ? 'board' : 'festival', palette: key === 'eventboard' ? 'board' : 'festival', asset: 'chest', kicker: 'SEASONAL EVENT' },
    { test: /(?:achievement|codex|titles|milestone)/, family: 'progression', scene: key === 'codex' ? 'library' : 'leaderboard', palette: key === 'codex' ? 'codex' : 'achievement', asset: 'book', kicker: 'PROGRESSION HALL' },
    { test: /(?:merchantroute|tradehouse|market)/, family: 'commerce', scene: 'market', palette: 'market', asset: 'coin', kicker: 'TRADE FLOOR' },
    { test: /(?:loan|repay|insurance|bank)/, family: 'bank', scene: 'bank', palette: 'bank', asset: 'coin', kicker: 'FINANCE DESK' },
    { test: /(?:expeditionlog)/, family: 'expedition', scene: 'expedition', palette: 'expedition', asset: 'map', kicker: 'EXPEDITION LOG' },
    { test: /(?:outpost)/, family: 'outpost', scene: 'outpost', palette: 'outpost', asset: 'house', kicker: 'FRONTIER OUTPOST' },
    { test: /^(?:heal|stamina|meditation|training|study)$/, family: 'training', scene: 'training', palette: 'work', asset: key === 'heal' ? 'potion' : 'dumbbell', kicker: 'CHARACTER GROWTH' },
    { test: /(?:shop|merchant|market|auction|bid|trade|sell|buy|transfer|loan|repay|insurance|bank)/, family: 'commerce', scene: 'market', palette: 'market', asset: 'coin', kicker: 'ECONOMY HUB' },
    { test: /(?:craft|forge|smelt|refine|salvage|dismantle|tannery|mill|baitshop|trapcraft|fertilizer|irrigate|workshop|artifact|relic|enchant|blueprint)/, family: 'craft', scene: 'forge', palette: 'ember', asset: 'hammer', kicker: 'CRAFTING BENCH' },
    { test: /(?:fish|mancing|fishing|bait)/, family: 'fishing', scene: 'fishing', palette: 'fishing', asset: 'fish', kicker: 'AQUATIC ACTIVITY' },
    { test: /(?:mine|mining|ore|rock|coal)/, family: 'mining', scene: 'mining', palette: 'mining', asset: 'ore', kicker: 'MINING FIELD' },
    { test: /(?:hunt|berburu|mulung|nyapu|ngemis|ngamen|nambalban|kurir|ngojek|parkir|freelance|work|jualan)/, family: 'career', scene: 'work', palette: 'work', asset: 'coin', kicker: 'LIFE ACTIVITY' },
    { test: /(?:battle|boss|arena|duel|gauntlet|colosseum|trial)/, family: 'combat', scene: 'battle', palette: 'battle', asset: 'sword', kicker: 'COMBAT ACTIVITY' },
    { test: /(?:quest|bounty|mission)/, family: 'quest', scene: 'quest', palette: 'expedition', asset: 'scroll', kicker: 'MISSION BOARD' },
    { test: /(?:pet|breed|ranch|milk|shear)/, family: 'pet', scene: 'pet', palette: 'reward', asset: 'pet', kicker: 'COMPANION ACTIVITY' },
    { test: /(?:garden|farm|berladang|harvest)/, family: 'farm', scene: 'farm', palette: 'verdant', asset: 'flower', kicker: 'FIELD ACTIVITY' },
    { test: /(?:guild|party|recruit|friend|marry|divorce|gift|npc|talk)/, family: 'social', scene: 'party', palette: 'rose', asset: 'shield', kicker: 'SOCIAL ACTIVITY' },
    { test: /(?:house|furnish|inn|tavern)/, family: 'home', scene: 'house', palette: 'house', asset: 'house', kicker: 'LIFE HUB' },
    { test: /(?:map|scout|survey|voyage|portal|landmark|archaeology|expedition|adventure|journal|treasure)/, family: 'exploration', scene: 'adventure', palette: 'verdant', asset: 'map', kicker: 'WORLD ACTIVITY' },
    { test: /(?:weather|season|event|festival)/, family: 'world', scene: 'weather', palette: 'azure', asset: 'map', kicker: 'WORLD STATE' },
    { test: /(?:achievement|milestone|title|collection|codex|museum|leaderboard)/, family: 'progression', scene: 'leaderboard', palette: 'leaderboard', asset: 'book', kicker: 'PROGRESSION' },
  ]
  return { key, ...(groups.find((group) => group.test.test(key)) || { family: 'reward', scene: 'reward', palette: 'reward', asset: 'chest', kicker: 'RPG STATUS' }) }
}

function assetPath(name) {
  const safe = String(name || '').toLowerCase().replace(/[^a-z0-9_-]/g, '')
  return path.join(RPG_ASSET_DIR, `${safe}.svg`)
}

async function loadRpgAsset(name) {
  const key = String(name || '').toLowerCase()
  if (!key) return null
  if (assetCache.has(key)) return assetCache.get(key)
  const promise = (async () => {
    try {
      const file = assetPath(key)
      if (!(await fs.pathExists(file))) return null
      const buffer = await fs.readFile(file)
      return await loadImage(buffer)
    } catch {
      return null
    }
  })()
  assetCache.set(key, promise)
  return promise
}

function assetKeysFromData(profile, type, data = {}) {
  const keys = new Set()
  if (profile.asset) keys.add(profile.asset)
  const sceneAssets = {
    hunt: ['deer', 'rabbit', 'boar', 'fox'],
    berburu: ['deer', 'rabbit', 'boar', 'fox'],
    work: ['coin', 'bag'],
    fishing: ['fishingrod', 'fish'],
    mining: ['pickaxe', 'ore', 'rock'],
    farm: ['wheat', 'flower', 'food'],
    garden: ['wheat', 'flower', 'food'],
    woodcut: ['wood', 'axe'],
    battle: ['sword', 'shield', 'dragon', 'bear', 'lion'],
    boss: ['sword', 'shield'],
    shop: ['potion', 'sword', 'shield'],
    inventory: ['bag', 'potion', 'sword'],
    cooking: ['food', 'ramen', 'rice'],
    cook: ['food', 'ramen', 'rice'],
    craft: ['hammer', 'ore', 'sword'],
    blacksmith: ['hammer', 'sword', 'armor'],
    treasure: ['chest', 'gold', 'diamond'],
    pet: ['pet', 'egg', 'food'],
    petshop: ['pet', 'egg', 'food'],
    quest: ['scroll', 'map', 'chest'],
    adventure: ['map', 'compass', 'tent'],
    training: ['dumbbell', 'shield', 'potion', 'compass', 'coin'],
    slot: ['slot', 'coin', 'diamond', 'cherry', 'lemon', 'orange', 'grape', 'seven'],
    casino: ['slot', 'coin', 'diamond', 'cherry', 'lemon', 'orange', 'grape', 'seven'],
    coinflip: ['coin'],
    dice: ['dice', 'coin'],
    lottery: ['chest', 'diamond', 'coin'],
    parkir: ['car', 'parking', 'coin'],
    market: ['coin', 'potion', 'sword'],
    auction: ['coin', 'hammer', 'chest'],
    bid: ['coin', 'hammer', 'sword'],
    house: ['house', 'food', 'book'],
    furnish: ['house', 'food', 'book'],
    pet: ['pet', 'egg', 'food', 'rabbit', 'lion'],
    petshop: ['pet', 'egg', 'rabbit', 'lion'],
    petarena: ['pet', 'shield', 'sword'],
    battle: ['sword', 'shield', 'dragon', 'bear', 'lion'],
    duel: ['sword', 'shield', 'dragon', 'bear', 'lion'],
    arena: ['sword', 'shield'],
    challenge: ['shield', 'sword'],
    gauntlet: ['shield', 'sword'],
    colosseum: ['shield', 'sword'],
    forge: ['hammer', 'sword', 'armor'],
  }
  for (const asset of sceneAssets[type] || []) keys.add(asset)
  if (type === 'work') {
    const role = String(data.job || data.role || '').toLowerCase()
    if (/(dokter|doctor|medical|perawat)/.test(role)) keys.add('potion')
    else if (/(polisi|police)/.test(role)) keys.add('shield')
    else if (/(petani|farmer)/.test(role)) keys.add('wheat')
    else if (/(penambang|mining|miner)/.test(role)) keys.add('pickaxe')
    else if (/(nelayan|fisher|mancing)/.test(role)) keys.add('fishingrod')
    else if (/(koki|chef|cook)/.test(role)) keys.add('food')
    else if (/(blacksmith|pandai besi)/.test(role)) keys.add('hammer')
    else if (/(programmer|developer|coder)/.test(role)) keys.add('book')
  }
  const items = Array.isArray(data.items) ? data.items : []
  for (const item of items.slice(0, 7)) keys.add(inferItemAsset(item.key || item.name))
  for (const candidate of [data.itemKey, data.item, data.rewardItem, data.outputItem, data.enemy, data.opponent, data.foe, data.target, data.boss, data.loot]) {
    if (candidate) keys.add(inferItemAsset(candidate))
  }
  if (Array.isArray(data.targets)) {
    for (const target of data.targets.slice(0, 2)) keys.add(inferItemAsset(target?.key || target?.name || target))
  }
  if (type === 'dice') {
    const value=Math.max(1,Math.min(6,Number(data.value||data.roll||data.result||6)))
    keys.add(`dice${value}`)
  }
  if (type === 'hunt' || type === 'berburu') {
    for (const target of (Array.isArray(data.targets) ? data.targets.slice(0, 2) : [data.enemy || data.prey || data.target].filter(Boolean))) {
      keys.add(inferItemAsset(target?.key || target?.name || target))
    }
  }
  return [...keys].filter(Boolean).slice(0, 10)
}

function inferItemAsset(value) {
  const key = String(value || '').toLowerCase().replace(/\s+/g, '')
  const exact = {
    potion: 'potion', mpotion: 'mpotion', manapotion: 'mpotion', stamina: 'staminapotion', staminapotion: 'staminapotion', antidote: 'antidote', energydrink: 'staminapotion', strengthpotion: 'potion', healthpotion: 'potion', defensepotion: 'shield', luckpotion: 'potion', exppotion: 'elixir', elixir: 'elixir',
    common: 'crate', uncommon: 'crate', mythic: 'goldchest', legendary: 'diamondchest', woodenchest: 'chest', ironchest: 'goldchest', goldchest: 'goldchest', diamondchest: 'diamondchest', mysterybox: 'crate',
    rock: 'rock', coal: 'coal', iron: 'iron', gold: 'gold', diamond: 'diamond', emerald: 'emerald', steel: 'iron', refinedstone: 'rock',
    wood: 'wood', stick: 'wood', rubber: 'wood', herb: 'herb', leather: 'leather', wheat: 'wheat', rice: 'rice', egg: 'egg', meat: 'meat', flower: 'flower', mushroom: 'flower',
    trash: 'trash', fish: 'fish', prawn: 'prawn', octopus: 'octopus', shark: 'shark', whale: 'whale',
    rabbit: 'rabbit', deer: 'deer', boar: 'boar', bear: 'bear', lion: 'lion', dragon: 'dragon', fox: 'fox',
    demon: 'demon', demonlord: 'demon', undead: 'undead', undeadking: 'undead', kraken: 'kraken', titan: 'titan', volcanictitan: 'titan', frost: 'frost', frostqueen: 'frost', thunder: 'thunder', thundergod: 'thunder',
    dagingkelinci: 'rabbit', dagingrusa: 'deer', dagingbabi: 'boar', bulurubah: 'fox', cakarkberuang: 'bear', cakarberuang: 'bear', taring_singa: 'lion', taringsinga: 'lion',
    bread: 'food', fruit: 'food', carrot: 'food', tomato: 'food', corn: 'food', potato: 'food', strawberry: 'food', watermelon: 'food', pumpkin: 'food', padi: 'wheat', jagung: 'food', tomat: 'food', wortel: 'food', melon: 'food',
    kunai: 'kunai', shuriken: 'shuriken', chakra: 'diamond', scroll: 'scroll', bowlramen: 'ramen',
    pickaxe: 'pickaxe', fishingrod: 'fishingrod', rod: 'fishingrod', sword: 'sword', goldsword: 'sword', armor: 'armor', diamondarmor: 'armor', shield: 'shield', helmet: 'helmet', bow: 'bow', arrow: 'bow', axe: 'axe',
    pearl: 'pearl', key: 'key',
    bag: 'bag', inventory: 'bag', house: 'house', home: 'house', map: 'map', atlas: 'map', route: 'map', expedition: 'map',
  }
  if (exact[key]) return exact[key]
  if (/(potion|heal|elixir|obat|ramuan)/.test(key)) return 'potion'
  if (/(sword|pedang|katana|weapon|goldsword)/.test(key)) return 'sword'
  if (/(shield|perisai)/.test(key)) return 'shield'
  if (/(armor|armour|baju|helm|helmet|boots|sepatu|diamondarmor)/.test(key)) return 'armor'
  if (/(fish|prawn|octopus|shark|whale)/.test(key)) return key.includes('shark') ? 'shark' : key.includes('whale') ? 'whale' : key.includes('octopus') ? 'octopus' : key.includes('prawn') ? 'prawn' : 'fish'
  if (/(rabbit|deer|boar|bear|lion|dragon|fox|demon|undead|kraken|titan|frost|thunder)/.test(key)) return key.match(/rabbit|deer|boar|bear|lion|dragon|fox|demon|undead|kraken|titan|frost|thunder/)?.[0] || 'dragon'
  if (/(food|bread|rice|ramen|meat|fruit|meal|makanan|wheat|carrot|potato|strawberry|watermelon|apple|tomato|corn|pumpkin)/.test(key)) return 'food'
  if (/(chest|box|peti|mystery)/.test(key)) return 'chest'
  if (/(ore|iron|coal|rock|mineral|stone|diamond|emerald|steel|refinedstone)/.test(key)) return key.includes('diamond') ? 'diamond' : key.includes('emerald') ? 'emerald' : key.includes('coal') ? 'coal' : key.includes('iron') ? 'iron' : 'rock'
  if (/(coin|koin|money|cash|gold|currency)/.test(key)) return 'coin'
  if (/(scroll|blueprint|book|codex)/.test(key)) return 'scroll'
  if (/(bag|inventory|tas)/.test(key)) return 'bag'
  if (/(hammer|forge|tool|craft|kit|pickaxe|axe|fishingrod|rod|bow|arrow|kunai|shuriken)/.test(key)) return 'hammer'
  if (/(pet|egg|animal)/.test(key)) return 'pet'
  if (/(house|home|room)/.test(key)) return 'house'
  if (/(map|atlas|route|expedition)/.test(key)) return 'map'
  return 'diamond'
}

function drawAsset(ctx, image, x, y, w, h) {
  if (!image) return false
  const ratio = Math.min(w / image.width, h / image.height)
  const dw = image.width * ratio
  const dh = image.height * ratio
  ctx.save()
  ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
  ctx.restore()
  return true
}


function drawAssetCover(ctx, image, x, y, w, h, radius = 0) {
  if (!image) return false
  const ratio = Math.max(w / image.width, h / image.height)
  const dw = image.width * ratio
  const dh = image.height * ratio
  ctx.save()
  ctx.beginPath()
  if (radius > 0) roundRect(ctx, x, y, w, h, radius, null)
  else ctx.rect(x, y, w, h)
  ctx.clip()
  ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
  ctx.restore()
  return true
}


const THEMES = {
  adventure: { bg: '#0f1013', surface: '#181a1f', raised: '#20232a', dark: '#0b0c0f', accent: '#b8a8ff', accent2: '#8fd7e8', soft: '#d4d7de', ink: '#f5f6f8', muted: '#9da3ad', glow: 'rgba(184,168,255,0.16)', success: '#8fd0b1', danger: '#e9a0b0', gold: '#e3c37a' },
  fishing: { bg: '#0d1114', surface: '#151b20', raised: '#1e272d', dark: '#090d10', accent: '#91d9ea', accent2: '#b6eef7', soft: '#d2dbe0', ink: '#f5f8fa', muted: '#9aa9b0', glow: 'rgba(145,217,234,0.17)', success: '#91d1b3', danger: '#e7a0ad', gold: '#e1c67e' },
  hunt: { bg: '#0e120f', surface: '#171d18', raised: '#222b23', dark: '#0a0e0b', accent: '#a8d39e', accent2: '#d2d8a2', soft: '#d5ddd4', ink: '#f4f7f3', muted: '#9eaa9f', glow: 'rgba(168,211,158,0.16)', success: '#9bd5b5', danger: '#e5a2a4', gold: '#ddc27c' },
  mining: { bg: '#101114', surface: '#191c21', raised: '#242930', dark: '#0b0d10', accent: '#b5c5e8', accent2: '#91ddd3', soft: '#d4d8df', ink: '#f5f6f8', muted: '#9da4ae', glow: 'rgba(145,221,211,0.16)', success: '#98d2b1', danger: '#e5a1aa', gold: '#e1c67f' },
  boss: { bg: '#130f12', surface: '#1d171b', raised: '#282026', dark: '#0d0a0d', accent: '#e0a5ba', accent2: '#c5a7ef', soft: '#ddd5da', ink: '#fff7fb', muted: '#a79ba3', glow: 'rgba(224,165,186,0.17)', success: '#9bd3b2', danger: '#f0a4b6', gold: '#e1c17b' },
  battle: { bg: '#111014', surface: '#1b1920', raised: '#25222d', dark: '#0b0a0e', accent: '#b9adf4', accent2: '#e1a6cf', soft: '#dcd8e2', ink: '#f9f7fb', muted: '#a49fac', glow: 'rgba(185,173,244,0.17)', success: '#98d2b0', danger: '#e8a2b5', gold: '#e1c27d' },
  shop: { bg: '#120f14', surface: '#1b1720', raised: '#26202c', dark: '#0c0a0f', accent: '#d0a9e8', accent2: '#91d7e7', soft: '#ddd5e2', ink: '#fff9ff', muted: '#a69ba9', glow: 'rgba(208,169,232,0.16)', success: '#98d2b0', danger: '#e6a2b5', gold: '#e1c27b' },
  leaderboard: { bg: '#12110e', surface: '#1c1a15', raised: '#28251d', dark: '#0c0b09', accent: '#e3c57c', accent2: '#b8c7ee', soft: '#dedbd2', ink: '#fffdf7', muted: '#a9a397', glow: 'rgba(227,197,124,0.16)', success: '#9bd2b0', danger: '#e7a1b3', gold: '#f0cc79' },
  inventory: { bg: '#0e1114', surface: '#171b20', raised: '#22282e', dark: '#090c0f', accent: '#9ed8e9', accent2: '#b5c4ef', soft: '#d4dbe0', ink: '#f7f9fa', muted: '#9da7af', glow: 'rgba(158,216,233,0.16)', success: '#98d2b0', danger: '#e6a1b2', gold: '#dfc17c' },
  profile: { bg: '#101014', surface: '#19191f', raised: '#24242d', dark: '#0b0b0f', accent: '#bdb0f4', accent2: '#9bd8ea', soft: '#d9d7e0', ink: '#faf9fc', muted: '#a09da9', glow: 'rgba(189,176,244,0.17)', success: '#98d2b0', danger: '#e6a1b3', gold: '#e1c27c' },
  reward: { bg: '#111013', surface: '#1a181e', raised: '#25222b', dark: '#0b0a0d', accent: '#c3a9ef', accent2: '#9adce9', soft: '#dad6e0', ink: '#fcfaff', muted: '#a29ca9', glow: 'rgba(195,169,239,0.17)', success: '#99d2b0', danger: '#e5a1b4', gold: '#e3c47d' },
  levelup: { bg: '#120f15', surface: '#1b1721', raised: '#27202f', dark: '#0c0a0f', accent: '#c7a7f3', accent2: '#9fe0ef', soft: '#ded8e4', ink: '#fffaff', muted: '#a59daa', glow: 'rgba(199,167,243,0.18)', success: '#9ad4b2', danger: '#e7a2b5', gold: '#e4c47d' },
  work: { bg: '#101113', surface: '#191b1f', raised: '#23262c', dark: '#0b0c0f', accent: '#aebfe3', accent2: '#a9c6e8', soft: '#d7dbe1', ink: '#f8f9fa', muted: '#9fa5ad', glow: 'rgba(174,191,227,0.16)', success: '#98d2b0', danger: '#e6a1b3', gold: '#dec17c' },
  daily: { bg: '#12110e', surface: '#1c1a16', raised: '#28251e', dark: '#0c0b09', accent: '#e0c17b', accent2: '#c0afe9', soft: '#ddd9d0', ink: '#fffdf8', muted: '#a59f94', glow: 'rgba(224,193,123,0.16)', success: '#98d2b0', danger: '#e6a1b3', gold: '#edcb7b' },
  hourly: { bg: '#0e1113', surface: '#171b1e', raised: '#22272b', dark: '#090c0e', accent: '#9ecfe0', accent2: '#b8b0ea', soft: '#d4d9dd', ink: '#f8fafb', muted: '#9da7ad', glow: 'rgba(158,207,224,0.16)', success: '#98d2b0', danger: '#e6a1b3', gold: '#dfc17c' },
  berburu: { bg: '#0e120f', surface: '#171c18', raised: '#222a23', dark: '#0a0e0b', accent: '#a7d19e', accent2: '#d4c98f', soft: '#d5ddd4', ink: '#f6f9f5', muted: '#9ea99f', glow: 'rgba(167,209,158,0.16)', success: '#98d2b0', danger: '#e5a1a3', gold: '#dfc27c' },
  expedition: { bg: '#0b0c10', surface: '#191c23', raised: '#242933', dark: '#0b0d10', accent: '#b3c1e7', accent2: '#9fd6e5', soft: '#d6dae1', ink: '#f7f8fb', muted: '#9fa6b1', glow: 'rgba(179,193,231,0.16)', success: '#98d2b0', danger: '#e6a1b3', gold: '#e0c27d' },
}

Object.assign(THEMES, {
  parking: { bg: '#0a1418', surface: '#11242b', raised: '#19323a', dark: '#071014', accent: '#71d2e5', accent2: '#f0b969', soft: '#dce8eb', ink: '#f8fcfd', muted: '#8fa9af', glow: 'rgba(113,210,229,0.19)', success: '#9fd5ad', danger: '#ee9f9f', gold: '#f0c873' },
  training: { bg: '#14120f', surface: '#211d18', raised: '#2d261e', dark: '#0b0907', accent: '#e7a969', accent2: '#9cc6e6', soft: '#e5e0d6', ink: '#fffaf1', muted: '#aaa092', glow: 'rgba(231,169,105,0.20)', success: '#9ed3af', danger: '#e9a5aa', gold: '#efc978' },
  atlas: { ...THEMES.leaderboard, bg: '#101720', surface: '#182330', raised: '#223142', dark: '#0a1016', accent: '#83c7e8', accent2: '#b5e4c7', soft: '#d7e4ec', ink: '#f7fbff', muted: '#93a6b5', glow: 'rgba(131,199,232,0.18)', success: '#8fd0ac', danger: '#e7a1ad', gold: '#e2c17b' },
  verdant: { ...THEMES.hunt, bg: '#0f1510', surface: '#172018', raised: '#233025', dark: '#091009', accent: '#9bcf82', accent2: '#d3d98c', soft: '#dbe3d2', ink: '#f5fbf1', muted: '#9caf9d', glow: 'rgba(155,207,130,0.18)', success: '#91d4ad', danger: '#e4a1a4', gold: '#e1c277' },
  azure: { ...THEMES.fishing, bg: '#0b151b', surface: '#11242d', raised: '#1a3440', dark: '#061014', accent: '#74d1ea', accent2: '#b3eef4', soft: '#d4e7eb', ink: '#f4fcff', muted: '#8fa9b4', glow: 'rgba(116,209,234,0.20)', success: '#8dd4b3', danger: '#e5a1ae', gold: '#dfc57c' },
  ember: { ...THEMES.boss, bg: '#170d0b', surface: '#271714', raised: '#39211c', dark: '#0e0706', accent: '#f08c63', accent2: '#f4bd75', soft: '#e3d7ce', ink: '#fff9f4', muted: '#b19a8c', glow: 'rgba(240,140,99,0.20)', success: '#9ad1a9', danger: '#f09aa4', gold: '#f0c16e' },
  dusk: { ...THEMES.expedition, bg: '#110e17', surface: '#1d1727', raised: '#2a2139', dark: '#09070e', accent: '#b8a0ec', accent2: '#8bb6d7', soft: '#dcd7e6', ink: '#faf8ff', muted: '#a69dac', glow: 'rgba(184,160,236,0.20)', success: '#98cfb1', danger: '#e5a2ba', gold: '#dfc27b' },
  astral: { ...THEMES.levelup, bg: '#0d0d1b', surface: '#17172b', raised: '#242541', dark: '#080811', accent: '#9e93f4', accent2: '#7dd8ee', soft: '#dcdded', ink: '#fbfaff', muted: '#9699b5', glow: 'rgba(158,147,244,0.21)', success: '#93d3ba', danger: '#e5a6bb', gold: '#dfc77e' },
  camp: { ...THEMES.work, bg: '#15100b', surface: '#241b12', raised: '#33271a', dark: '#0c0906', accent: '#e2ae67', accent2: '#d5c48d', soft: '#e6ddcf', ink: '#fff9ee', muted: '#b2a18d', glow: 'rgba(226,174,103,0.20)', success: '#9ed1a8', danger: '#e5a5aa', gold: '#edc975' },
  artifact: { ...THEMES.reward, bg: '#120e1a', surface: '#1d1730', raised: '#2a2043', dark: '#0b0712', accent: '#bd99f3', accent2: '#e4c57f', soft: '#e1dbe8', ink: '#fffaff', muted: '#a59caf', glow: 'rgba(189,153,243,0.20)', success: '#9bd1b0', danger: '#e5a3bb', gold: '#e8c77b' },
  museum: { ...THEMES.daily, bg: '#15120e', surface: '#241f18', raised: '#342c20', dark: '#0b0907', accent: '#d2b06f', accent2: '#c8b9a0', soft: '#e0d8ca', ink: '#fffdf7', muted: '#aa9f8e', glow: 'rgba(210,176,111,0.18)', success: '#9dceb0', danger: '#e2a7ac', gold: '#e8c87e' },
  tower: { ...THEMES.levelup, bg: '#10111b', surface: '#171b2b', raised: '#242b42', dark: '#080a11', accent: '#a7bdf1', accent2: '#d4a5e8', soft: '#dbe0ed', ink: '#f9fbff', muted: '#9aa8bc', glow: 'rgba(167,189,241,0.19)', success: '#9ed3b3', danger: '#e6a6ba', gold: '#e0c07a' },
  board: { ...THEMES.leaderboard, bg: '#131312', surface: '#211f1b', raised: '#302b24', dark: '#0a0a09', accent: '#d1b077', accent2: '#9fb3d8', soft: '#ddd8ce', ink: '#fffdf8', muted: '#aaa396', glow: 'rgba(209,176,119,0.17)', success: '#99cfac', danger: '#e4a3ae', gold: '#eccb7b' },
  workshop: { ...THEMES.work, bg: '#121313', surface: '#1d2020', raised: '#2a2e2d', dark: '#090a0a', accent: '#b6c5bf', accent2: '#d2a27e', soft: '#d9dfdd', ink: '#f8fbfa', muted: '#98a29f', glow: 'rgba(182,197,191,0.16)', success: '#98d0ad', danger: '#e5a5ad', gold: '#e0bf79' },
  farm: { ...THEMES.hunt, bg: '#10160f', surface: '#1a2417', raised: '#293821', dark: '#0a0f09', accent: '#9fca6d', accent2: '#d6c27d', soft: '#d9e2cc', ink: '#f7fbf1', muted: '#9cac92', glow: 'rgba(159,202,109,0.18)', success: '#84d39e', danger: '#e3a4a4', gold: '#e4c16f' },
  ranch: { ...THEMES.hunt, bg: '#15120e', surface: '#252018', raised: '#342a1e', dark: '#0b0906', accent: '#caa06c', accent2: '#b5d28d', soft: '#e4ddd1', ink: '#fffaf1', muted: '#ab9e8d', glow: 'rgba(202,160,108,0.17)', success: '#9dd1a9', danger: '#e5a4aa', gold: '#e5c67c' },
  cream: { ...THEMES.daily, bg: '#181512', surface: '#26211c', raised: '#352d25', dark: '#0c0a08', accent: '#dfc68f', accent2: '#e9dfcf', soft: '#eee8dd', ink: '#fffcf7', muted: '#b4aa9b', glow: 'rgba(223,198,143,0.16)', success: '#a0d2b0', danger: '#e6a5ab', gold: '#e7c77e' },
  inn: { ...THEMES.daily, bg: '#17110d', surface: '#251a13', raised: '#352419', dark: '#0c0806', accent: '#d89b63', accent2: '#dfcb9b', soft: '#e5d9ce', ink: '#fff9f2', muted: '#b19d8d', glow: 'rgba(216,155,99,0.18)', success: '#9dd0aa', danger: '#e4a3a9', gold: '#e5c176' },
  tavern: { ...THEMES.boss, bg: '#170e0c', surface: '#261716', raised: '#38211e', dark: '#0c0706', accent: '#e28b6f', accent2: '#d4b27d', soft: '#e0d5cc', ink: '#fff8f2', muted: '#b09b91', glow: 'rgba(226,139,111,0.18)', success: '#9bcfaa', danger: '#ef9da7', gold: '#e6c174' },
  library: { ...THEMES.profile, bg: '#11101a', surface: '#1d1a28', raised: '#2a2437', dark: '#090811', accent: '#b39de8', accent2: '#c9b69a', soft: '#dfd8e7', ink: '#fbfaff', muted: '#a29aaf', glow: 'rgba(179,157,232,0.19)', success: '#9dd1b2', danger: '#e5a4b8', gold: '#dfc47e' },
  journal: { ...THEMES.expedition, bg: '#16110f', surface: '#241c18', raised: '#332720', dark: '#0c0908', accent: '#c49a74', accent2: '#b9c5d5', soft: '#e4ddd5', ink: '#fffaf5', muted: '#b0a197', glow: 'rgba(196,154,116,0.17)', success: '#9ccfad', danger: '#e3a4ad', gold: '#e2c277' },
  npc: { ...THEMES.shop, bg: '#111218', surface: '#1b1e29', raised: '#282d3b', dark: '#090a10', accent: '#9baee9', accent2: '#8fd0d0', soft: '#d8dde8', ink: '#f8faff', muted: '#9ca5b6', glow: 'rgba(155,174,233,0.18)', success: '#96d1b1', danger: '#e5a2b5', gold: '#e0c27d' },
  rose: { ...THEMES.boss, bg: '#170d13', surface: '#26151f', raised: '#36202b', dark: '#0d070b', accent: '#e0a2bc', accent2: '#d7b0e4', soft: '#e5d9df', ink: '#fff8fc', muted: '#b39ba8', glow: 'rgba(224,162,188,0.19)', success: '#9cd1b0', danger: '#ef9eaf', gold: '#e3c07b' },
  party: { ...THEMES.adventure, bg: '#0e1416', surface: '#162024', raised: '#233137', dark: '#080d0f', accent: '#86c9c8', accent2: '#9fd4ed', soft: '#d4e0e2', ink: '#f7fcfc', muted: '#91a4a9', glow: 'rgba(134,201,200,0.18)', success: '#91d1af', danger: '#e4a3ad', gold: '#dfc17a' },
  pet: { ...THEMES.reward, bg: '#17111a', surface: '#231a29', raised: '#30233a', dark: '#0c080f', accent: '#d2a9ef', accent2: '#f0c2dc', soft: '#e4dce9', ink: '#fffaff', muted: '#ab9eb1', glow: 'rgba(210,169,239,0.18)', success: '#9bd2b4', danger: '#e5a5b8', gold: '#e2c37c' },
  weather: { ...THEMES.fishing, bg: '#0e1620', surface: '#172533', raised: '#213548', dark: '#080e14', accent: '#87cfe8', accent2: '#b8d9ef', soft: '#d7e3eb', ink: '#f7fbff', muted: '#94a8b8', glow: 'rgba(135,207,232,0.18)', success: '#9ad3b1', danger: '#e6a5b2', gold: '#e1c37b' },
  event: { ...THEMES.daily, bg: '#17110f', surface: '#261a16', raised: '#35231d', dark: '#0c0806', accent: '#e2b46c', accent2: '#e0a7cf', soft: '#e5ddd5', ink: '#fffaf6', muted: '#b09f93', glow: 'rgba(226,180,108,0.18)', success: '#9ad1ae', danger: '#e6a4b0', gold: '#eac879' },
  festival: { ...THEMES.boss, bg: '#160e15', surface: '#261726', raised: '#362136', dark: '#0c070c', accent: '#e0a0cf', accent2: '#89d9e1', soft: '#e2d9e3', ink: '#fff9ff', muted: '#af9daa', glow: 'rgba(224,160,207,0.19)', success: '#9ad2b1', danger: '#ec9faf', gold: '#e8c67a' },
  achievement: { ...THEMES.leaderboard, bg: '#11100d', surface: '#1d1b15', raised: '#2b261d', dark: '#0a0907', accent: '#e4c16f', accent2: '#b2c5e6', soft: '#dedad0', ink: '#fffdf7', muted: '#a7a094', glow: 'rgba(228,193,111,0.18)', success: '#99d0b0', danger: '#e6a4b0', gold: '#f1ce79' },
  codex: { ...THEMES.profile, bg: '#10101a', surface: '#1b1b2a', raised: '#29283c', dark: '#08080f', accent: '#9e9eea', accent2: '#d5b48f', soft: '#dbdceb', ink: '#fafaff', muted: '#9d9cad', glow: 'rgba(158,158,234,0.18)', success: '#98d2b0', danger: '#e5a4b7', gold: '#e0c17b' },
  market: { ...THEMES.shop, bg: '#17100d', surface: '#261914', raised: '#35231c', dark: '#0c0806', accent: '#da9a67', accent2: '#84c9cf', soft: '#e2d8d1', ink: '#fff9f3', muted: '#ad9b91', glow: 'rgba(218,154,103,0.18)', success: '#98d0aa', danger: '#e4a4ab', gold: '#e9c474' },
  bank: { ...THEMES.daily, bg: '#0f1414', surface: '#182020', raised: '#23302f', dark: '#080c0c', accent: '#86c7ad', accent2: '#9cc6e4', soft: '#d4e0dc', ink: '#f7fcfa', muted: '#92a39e', glow: 'rgba(134,199,173,0.18)', success: '#8fd3ad', danger: '#e5a5ad', gold: '#e1c47a' },
  house: { ...THEMES.work, bg: '#15120f', surface: '#231e18', raised: '#33291f', dark: '#0b0907', accent: '#c8a070', accent2: '#a8c7bf', soft: '#e2dbd3', ink: '#fffaf4', muted: '#ab9f93', glow: 'rgba(200,160,112,0.18)', success: '#98d1a8', danger: '#e3a3a9', gold: '#e7c67b' },
  expedition: { ...THEMES.expedition, bg: '#0c1017', surface: '#151d28', raised: '#202b39', dark: '#070b10', accent: '#91b4e0', accent2: '#8bd3d2', soft: '#d8e1ea', ink: '#f7fbff', muted: '#94a3b3', glow: 'rgba(145,180,224,0.19)', success: '#93d1b0', danger: '#e3a5b0', gold: '#dfc17b' },
  shrine: { ...THEMES.levelup, bg: '#100d18', surface: '#1a1527', raised: '#29203c', dark: '#09070e', accent: '#b296ef', accent2: '#7fd4eb', soft: '#dfd8e8', ink: '#faf8ff', muted: '#9e98b3', glow: 'rgba(178,150,239,0.20)', success: '#96d2b2', danger: '#e5a5b9', gold: '#e0c17b' },
  outpost: { ...THEMES.hunt, bg: '#10150f', surface: '#1b2418', raised: '#28341f', dark: '#080e08', accent: '#9fc86f', accent2: '#c3d9a2', soft: '#dbe4d1', ink: '#f7fcf2', muted: '#9eab93', glow: 'rgba(159,200,111,0.18)', success: '#93d1a7', danger: '#e3a5ab', gold: '#e1c27c' },
  clinic: { ...THEMES.fishing, bg: '#0f181b', surface: '#18282c', raised: '#22363b', dark: '#081011', accent: '#8fd6e5', accent2: '#d6ecec', soft: '#dcebed', ink: '#f8ffff', muted: '#94aab0', glow: 'rgba(143,214,229,0.18)', success: '#90d4ad', danger: '#e7a4ae', gold: '#e2c57b' },
  risk: { ...THEMES.boss, bg: '#160d16', surface: '#241521', raised: '#33202f', dark: '#09060b', accent: '#d887b4', accent2: '#9fb6e9', soft: '#e1d5df', ink: '#fff8fd', muted: '#a991a5', glow: 'rgba(216,135,180,0.19)', success: '#99d1ae', danger: '#ef8eaa', gold: '#e1c17b' },
  stream: { ...THEMES.pet, bg: '#120d1b', surface: '#1d1529', raised: '#2b1f3b', dark: '#09060f', accent: '#dca2eb', accent2: '#85d9ea', soft: '#e4dceb', ink: '#fffaff', muted: '#a497b1', glow: 'rgba(220,162,235,0.20)', success: '#9dd3b2', danger: '#e7a4b6', gold: '#e5c477' },
  gold: { ...THEMES.leaderboard, bg: '#17130b', surface: '#272015', raised: '#392d1c', dark: '#0d0a06', accent: '#e5bf63', accent2: '#b9d7eb', soft: '#e3ddd2', ink: '#fffdf7', muted: '#b0a48d', glow: 'rgba(229,191,99,0.20)', success: '#98d1ac', danger: '#e5a4aa', gold: '#f0d07a' },
})

const PALETTE_ALIASES = {
  ocean: 'azure', forest: 'verdant', forge: 'ember', ruins: 'dusk', magic: 'astral',
  event: 'event', achievement: 'achievement', codex: 'codex',
}


function themeFor(type, palette = null, featureKey = null) {
  const aliases = { training: 'work', bank: 'daily', quest: 'expedition' }
  const profile = featureProfile(featureKey || type, type)
  const paletteType = PALETTE_ALIASES[palette] || palette || profile.palette
  return THEMES[paletteType] || THEMES[type] || THEMES[aliases[type]] || THEMES.reward
}

function cleanText(value, fallback = '') {
  return String(value ?? fallback).replace(/[\r\n]+/g, ' ').trim()
}

function clampText(value, max = 30) {
  const text = cleanText(value)
  return text.length > max ? `${text.slice(0, Math.max(0, max - 1))}…` : text
}

function roundRect(ctx, x, y, w, h, r, fill, stroke = null, lineWidth = 1) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = lineWidth
    ctx.stroke()
  }
}

function raised(ctx, x, y, w, h, r, theme, depth = 10) {
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.48)'
  ctx.shadowBlur = depth * 1.45
  ctx.shadowOffsetX = depth * 0.7
  ctx.shadowOffsetY = depth * 0.72
  roundRect(ctx, x, y, w, h, r, theme.surface)
  ctx.restore()
  ctx.save()
  ctx.shadowColor = 'rgba(255,255,255,0.11)'
  ctx.shadowBlur = depth * 1.15
  ctx.shadowOffsetX = -depth * 0.58
  ctx.shadowOffsetY = -depth * 0.58
  roundRect(ctx, x, y, w, h, r, theme.surface)
  ctx.restore()
  roundRect(ctx, x, y, w, h, r, null, 'rgba(255,255,255,0.09)', 1)
}

function inset(ctx, x, y, w, h, r, theme, depth = 8) {
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.42)'
  ctx.shadowBlur = depth * 1.3
  ctx.shadowOffsetX = depth * 0.62
  ctx.shadowOffsetY = depth * 0.64
  roundRect(ctx, x, y, w, h, r, theme.dark)
  ctx.restore()
  ctx.save()
  ctx.shadowColor = 'rgba(255,255,255,0.10)'
  ctx.shadowBlur = depth * 1.1
  ctx.shadowOffsetX = -depth * 0.5
  ctx.shadowOffsetY = -depth * 0.5
  roundRect(ctx, x, y, w, h, r, theme.dark)
  ctx.restore()
  roundRect(ctx, x, y, w, h, r, null, 'rgba(255,255,255,0.07)', 1)
}

function text(ctx, value, x, y, size, color, weight = 'normal', align = 'left') {
  ctx.font = `${weight} ${size}px ${FONT}`
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(cleanText(value), x, y)
}

function glow(ctx, x, y, radius, color) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius)
  g.addColorStop(0, color)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
}

function line(ctx, x1, y1, x2, y2, color, width = 1) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function spark(ctx, x, y, r, color, alpha = 0.7) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  line(ctx, x - r, y, x + r, y, color, 2)
  line(ctx, x, y - r, x, y + r, color, 2)
  ctx.restore()
}

function badge(ctx, x, y, label, theme, accent = theme.accent) {
  const value = clampText(label, 15).toUpperCase()
  ctx.font = `bold 12px ${FONT}`
  const w = Math.max(92, ctx.measureText(value).width + 36)
  raised(ctx, x, y, w, 34, 17, theme, 5)
  ctx.fillStyle = accent
  ctx.beginPath()
  ctx.arc(x + 18, y + 17, 4, 0, Math.PI * 2)
  ctx.fill()
  text(ctx, value, x + 31, y + 21, 11, theme.soft, 'bold')
}

function grid(ctx, x, y, w, h, theme, step = 28) {
  ctx.save()
  ctx.globalAlpha = 0.12
  ctx.fillStyle = theme.soft
  for (let yy = y + 10; yy < y + h; yy += step) {
    for (let xx = x + 10; xx < x + w; xx += step) {
      ctx.beginPath()
      ctx.arc(xx, yy, 1, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  ctx.restore()
}

function sceneFrame(ctx, x, y, w, h, theme) {
  inset(ctx, x, y, w, h, 36, theme, 12)
  roundRect(ctx, x + 12, y + 12, w - 24, h - 24, 29, null, 'rgba(255,255,255,0.075)', 1)
}

function drawWater(ctx, x, y, w, h, theme) {
  const g = ctx.createLinearGradient(x, y, x, y + h)
  g.addColorStop(0, '#222d33')
  g.addColorStop(0.55, '#151f24')
  g.addColorStop(1, '#0a1115')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  for (let i = 0; i < 7; i++) {
    const yy = y + h * 0.54 + i * 34
    ctx.globalAlpha = 0.28 - i * 0.025
    ctx.strokeStyle = theme.accent2
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(x + 30, yy)
    ctx.quadraticCurveTo(x + w * 0.24, yy - 12, x + w * 0.45, yy)
    ctx.quadraticCurveTo(x + w * 0.68, yy + 12, x + w - 30, yy - 2)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

function drawCharacter(ctx, cx, cy, scale, theme, pose = 'idle') {
  const s = scale
  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(s, s)

  ctx.fillStyle = 'rgba(0,0,0,0.36)'
  ctx.beginPath()
  ctx.ellipse(0, 88, 54, 14, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#e5ad8a'
  ctx.beginPath()
  ctx.arc(0, -48, 27, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#302638'
  ctx.beginPath()
  ctx.arc(0, -57, 28, Math.PI * 1.05, Math.PI * 2.02)
  ctx.fill()
  ctx.fillStyle = '#241e2a'
  ctx.beginPath()
  ctx.arc(-18, -49, 9, 0, Math.PI * 2)
  ctx.fill()
  ctx.arc(18, -49, 9, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#f2d0a9'
  ctx.beginPath()
  ctx.arc(-9, -45, 2.5, 0, Math.PI * 2)
  ctx.arc(9, -45, 2.5, 0, Math.PI * 2)
  ctx.fill()

  const coat = pose === 'hunter' ? '#6d8c7b' : pose === 'miner' ? '#71839e' : pose === 'battle' ? '#7565a5' : '#7d70a5'
  const trim = pose === 'hunter' ? '#b7c9a5' : pose === 'miner' ? '#c2cbd9' : '#c6b8e8'
  roundRect(ctx, -31, -18, 62, 80, 20, coat)
  roundRect(ctx, -26, -10, 52, 67, 17, 'rgba(255,255,255,0.055)')
  ctx.fillStyle = trim
  ctx.fillRect(-4, -11, 8, 68)
  ctx.fillStyle = '#4b3c50'
  roundRect(ctx, -29, 42, 58, 10, 5, ctx.fillStyle)
  ctx.fillStyle = '#d5a37f'
  roundRect(ctx, -44, -6, 15, 52, 8, ctx.fillStyle)
  roundRect(ctx, 29, -6, 15, 52, 8, ctx.fillStyle)
  ctx.fillStyle = '#27212d'
  roundRect(ctx, -28, 57, 23, 48, 9, ctx.fillStyle)
  roundRect(ctx, 5, 57, 23, 48, 9, ctx.fillStyle)
  ctx.fillStyle = '#4f435a'
  roundRect(ctx, -31, 99, 29, 9, 5, ctx.fillStyle)
  roundRect(ctx, 2, 99, 29, 9, 5, ctx.fillStyle)

  if (pose === 'fishing') {
    ctx.strokeStyle = '#d8b487'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(28, -4)
    ctx.quadraticCurveTo(66, -26, 95, -66)
    ctx.stroke()
    ctx.strokeStyle = '#d6f4ff'
    ctx.lineWidth = 1.8
    ctx.beginPath()
    ctx.moveTo(95, -66)
    ctx.quadraticCurveTo(85, 18, 103, 72)
    ctx.stroke()
    ctx.fillStyle = theme.accent2
    ctx.beginPath()
    ctx.arc(103, 72, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#d5a37f'
    ctx.lineWidth = 7
    ctx.beginPath()
    ctx.moveTo(25, 4)
    ctx.lineTo(45, -8)
    ctx.stroke()
  } else if (pose === 'miner') {
    ctx.fillStyle = '#5f6d82'
    ctx.beginPath()
    ctx.arc(0, -65, 31, Math.PI, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#e4c37d'
    roundRect(ctx, -8, -78, 16, 8, 4, ctx.fillStyle)
    ctx.fillStyle = '#d9e5f1'
    ctx.beginPath()
    ctx.arc(0, -66, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#a98a65'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(24, 4)
    ctx.lineTo(69, -52)
    ctx.stroke()
    ctx.strokeStyle = '#c4ced9'
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.moveTo(48, -27)
    ctx.lineTo(76, -55)
    ctx.stroke()
  } else if (pose === 'hunter') {
    ctx.strokeStyle = '#b98e65'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.arc(47, 6, 44, -1.18, 1.18)
    ctx.stroke()
    ctx.strokeStyle = '#d5b187'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(42, -35)
    ctx.lineTo(49, 43)
    ctx.stroke()
    ctx.fillStyle = '#3d3431'
    roundRect(ctx, -43, -9, 10, 44, 5, ctx.fillStyle)
    ctx.strokeStyle = '#c8aa7b'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(-37, -6)
    ctx.lineTo(-37, 28)
    ctx.stroke()
  } else if (pose === 'battle') {
    ctx.fillStyle = '#6f7287'
    roundRect(ctx, -52, -2, 20, 54, 8, ctx.fillStyle)
    ctx.strokeStyle = '#dce6ef'
    ctx.lineWidth = 7
    ctx.beginPath()
    ctx.moveTo(29, -2)
    ctx.lineTo(79, -60)
    ctx.stroke()
    ctx.strokeStyle = '#8c6748'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(48, -23)
    ctx.lineTo(26, -3)
    ctx.stroke()
    ctx.fillStyle = '#d8c18a'
    ctx.beginPath()
    ctx.arc(-42, 24, 6, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawFish(ctx, x, y, scale, theme) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.fillStyle = theme.accent2
  ctx.beginPath()
  ctx.ellipse(0, 0, 32, 16, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(-27, 0)
  ctx.lineTo(-50, -18)
  ctx.lineTo(-50, 18)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#09212a'
  ctx.beginPath()
  ctx.arc(16, -3, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawTree(ctx, x, y, scale, theme) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.fillStyle = '#4a3328'
  roundRect(ctx, -10, 0, 20, 80, 8, ctx.fillStyle)
  ctx.fillStyle = theme.accent
  for (const p of [[0, -50, 42], [-30, -15, 34], [31, -18, 36], [0, 5, 44]]) {
    ctx.beginPath()
    ctx.arc(p[0], p[1], p[2], 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawStars(ctx, x, y, w, h, theme, count = 28) {
  ctx.save()
  for (let i = 0; i < count; i++) {
    const px = x + ((i * 83) % Math.max(1, Math.floor(w - 20))) + 10
    const py = y + ((i * 47) % Math.max(1, Math.floor(h * 0.58))) + 8
    const r = i % 5 === 0 ? 2 : 1
    ctx.fillStyle = i % 3 === 0 ? theme.accent2 : 'rgba(255,255,255,0.55)'
    ctx.globalAlpha = 0.35 + (i % 4) * 0.12
    ctx.beginPath()
    ctx.arc(px, py, r, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

function drawClouds(ctx, x, y, w, h) {
  ctx.save()
  ctx.fillStyle = 'rgba(235,240,245,0.06)'
  for (const c of [[0.18,0.2,110],[0.42,0.13,80],[0.75,0.25,125]]) {
    const cx=x+w*c[0], cy=y+h*c[1], r=c[2]
    ctx.beginPath()
    ctx.arc(cx-r*0.45,cy,r*0.38,0,Math.PI*2)
    ctx.arc(cx,cy-r*0.12,r*0.5,0,Math.PI*2)
    ctx.arc(cx+r*0.45,cy,r*0.34,0,Math.PI*2)
    ctx.fill()
  }
  ctx.restore()
}

function drawGroundPlants(ctx, x, y, w, h, theme, count = 12) {
  ctx.save()
  for (let i=0;i<count;i++) {
    const px=x+20+((i*71)%(Math.max(1,Math.floor(w-40))))
    const py=y+h*0.78+((i%3)*8)
    const s=10+(i%4)*4
    ctx.strokeStyle=i%2?theme.accent2:'rgba(190,205,190,0.48)'
    ctx.lineWidth=2
    for(let j=-1;j<=1;j++){
      ctx.beginPath();ctx.moveTo(px,py);ctx.quadraticCurveTo(px+j*s*0.5,py-s*0.8,px+j*s,py-s);ctx.stroke()
    }
  }
  ctx.restore()
}

function drawRunes(ctx, cx, cy, radius, theme, count=8) {
  ctx.save()
  ctx.strokeStyle='rgba(220,230,240,0.20)'
  ctx.lineWidth=2
  for(let i=0;i<count;i++){
    const a=(Math.PI*2*i)/count
    const x=cx+Math.cos(a)*radius, y=cy+Math.sin(a)*radius
    ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.stroke()
    line(ctx,x-5,y,x+5,y,theme.accent,1)
    line(ctx,x,y-5,x,y+5,theme.accent2,1)
  }
  ctx.restore()
}

function drawCrystalCluster(ctx, x, y, scale, colors) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale)
  for(const [dx,dy,s,c] of [[0,0,28,colors[0]],[-25,12,20,colors[1]],[24,15,22,colors[2]],[4,-24,18,colors[0]]]){
    ctx.fillStyle=c
    ctx.beginPath();ctx.moveTo(dx,dy-s);ctx.lineTo(dx+s*.55,dy-s*.15);ctx.lineTo(dx+s*.28,dy+s);ctx.lineTo(dx-s*.32,dy+s*.55);ctx.lineTo(dx-s*.48,dy-s*.2);ctx.closePath();ctx.fill()
    ctx.strokeStyle='rgba(255,255,255,0.35)';ctx.lineWidth=2;ctx.stroke()
  }
  ctx.restore()
}

function drawPotion(ctx,x,y,scale,color) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale)
  ctx.fillStyle='rgba(0,0,0,0.25)';ctx.beginPath();ctx.ellipse(0,30,25,7,0,0,Math.PI*2);ctx.fill()
  roundRect(ctx,-19,-18,38,48,12,color)
  roundRect(ctx,-10,-32,20,16,5,'#cbd2dc')
  roundRect(ctx,-7,-35,14,7,3,'#6e7682')
  ctx.fillStyle='rgba(255,255,255,0.26)';ctx.fillRect(-12,-7,6,26)
  ctx.restore()
}

function drawTreasureChest(ctx,x,y,scale,theme) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale)
  ctx.fillStyle='rgba(0,0,0,0.30)';ctx.beginPath();ctx.ellipse(0,36,64,12,0,0,Math.PI*2);ctx.fill()
  roundRect(ctx,-58,-8,116,48,12,'#735337')
  ctx.fillStyle='#9a7348';ctx.beginPath();ctx.arc(0,-8,58,Math.PI,Math.PI*2);ctx.fill()
  ctx.fillStyle=theme.gold;roundRect(ctx,-6,-3,12,38,5,ctx.fillStyle)
  roundRect(ctx,-48,10,96,6,3,'rgba(255,255,255,0.18)')
  ctx.restore()
}

function drawSword(ctx, x, y, scale, theme) {
  ctx.save();ctx.translate(x,y);ctx.rotate(-0.36);ctx.scale(scale,scale)
  ctx.fillStyle='rgba(0,0,0,0.26)';ctx.beginPath();ctx.ellipse(0,58,42,9,0,0,Math.PI*2);ctx.fill()
  ctx.fillStyle='#d8e4ef';ctx.beginPath();ctx.moveTo(0,-78);ctx.lineTo(13,8);ctx.lineTo(0,30);ctx.lineTo(-13,8);ctx.closePath();ctx.fill()
  ctx.strokeStyle='rgba(255,255,255,0.50)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-70);ctx.lineTo(3,5);ctx.stroke()
  ctx.strokeStyle=theme.gold;ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(-25,6);ctx.lineTo(25,6);ctx.stroke()
  roundRect(ctx,-8,10,16,48,6,'#6b4937')
  ctx.fillStyle=theme.gold;ctx.beginPath();ctx.arc(0,62,9,0,Math.PI*2);ctx.fill()
  ctx.restore()
}

function drawShield(ctx, x, y, scale, color) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale)
  ctx.fillStyle='rgba(0,0,0,0.25)';ctx.beginPath();ctx.ellipse(0,55,46,9,0,0,Math.PI*2);ctx.fill()
  const g=ctx.createLinearGradient(0,-48,0,48);g.addColorStop(0,color);g.addColorStop(1,'#4b5362')
  ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-52,-46);ctx.lineTo(52,-46);ctx.lineTo(48,10);ctx.quadraticCurveTo(42,53,0,70);ctx.quadraticCurveTo(-42,53,-48,10);ctx.closePath();ctx.fill()
  ctx.strokeStyle='rgba(255,255,255,0.34)';ctx.lineWidth=4;ctx.stroke()
  ctx.fillStyle='rgba(255,255,255,0.22)';ctx.beginPath();ctx.moveTo(0,-28);ctx.lineTo(26,-5);ctx.lineTo(0,26);ctx.lineTo(-26,-5);ctx.closePath();ctx.fill()
  ctx.restore()
}

function drawArmor(ctx, x, y, scale, theme) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale)
  ctx.fillStyle='rgba(0,0,0,0.26)';ctx.beginPath();ctx.ellipse(0,52,52,10,0,0,Math.PI*2);ctx.fill()
  ctx.fillStyle='#687386';roundRect(ctx,-40,-42,80,92,24,ctx.fillStyle)
  ctx.fillStyle=theme.accent2;roundRect(ctx,-30,-54,60,32,20,ctx.fillStyle)
  ctx.fillStyle='#8893a6';roundRect(ctx,-57,-28,20,60,9,ctx.fillStyle);roundRect(ctx,37,-28,20,60,9,ctx.fillStyle)
  ctx.fillStyle=theme.gold;roundRect(ctx,-6,-42,12,86,6,ctx.fillStyle)
  ctx.restore()
}

function drawFood(ctx, x, y, scale, theme) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale)
  ctx.fillStyle='rgba(0,0,0,0.24)';ctx.beginPath();ctx.ellipse(0,38,50,10,0,0,Math.PI*2);ctx.fill()
  ctx.fillStyle='#ece3d8';ctx.beginPath();ctx.ellipse(0,0,58,24,0,0,Math.PI*2);ctx.fill()
  ctx.fillStyle='#d7a66d';ctx.beginPath();ctx.ellipse(0,-8,35,17,-0.08,0,Math.PI*2);ctx.fill()
  ctx.fillStyle=theme.success;ctx.beginPath();ctx.arc(-12,-10,7,0,Math.PI*2);ctx.arc(8,-12,6,0,Math.PI*2);ctx.fill()
  ctx.strokeStyle='#c3b49f';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(48,-14);ctx.lineTo(62,-42);ctx.stroke()
  ctx.restore()
}

function drawOre(ctx, x, y, scale, theme) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale)
  ctx.fillStyle='rgba(0,0,0,0.25)';ctx.beginPath();ctx.ellipse(0,38,48,10,0,0,Math.PI*2);ctx.fill()
  drawCrystalCluster(ctx,0,0,1.25,[theme.accent2,theme.accent,theme.gold])
  ctx.restore()
}

function drawCoin(ctx, x, y, scale, theme) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale)
  ctx.fillStyle='rgba(0,0,0,0.22)';ctx.beginPath();ctx.ellipse(0,38,42,9,0,0,Math.PI*2);ctx.fill()
  const g=ctx.createRadialGradient(-8,-12,5,0,0,42);g.addColorStop(0,'#fff1ae');g.addColorStop(0.35,theme.gold);g.addColorStop(1,'#a77a27')
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,40,0,Math.PI*2);ctx.fill()
  ctx.strokeStyle='#fbe2a1';ctx.lineWidth=4;ctx.stroke()
  text(ctx,'Q',0,18,48,'#765221','bold','center')
  ctx.restore()
}

function drawBag(ctx, x, y, scale, theme) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale)
  ctx.fillStyle='rgba(0,0,0,0.24)';ctx.beginPath();ctx.ellipse(0,44,48,10,0,0,Math.PI*2);ctx.fill()
  roundRect(ctx,-44,-20,88,62,18,'#78634d')
  ctx.strokeStyle=theme.gold;ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,-16,27,Math.PI,Math.PI*2);ctx.stroke()
  ctx.fillStyle='#aa8e6c';roundRect(ctx,-26,-6,52,11,5,ctx.fillStyle)
  ctx.restore()
}

function drawHammer(ctx, x, y, scale, theme) {
  ctx.save();ctx.translate(x,y);ctx.rotate(-0.58);ctx.scale(scale,scale)
  ctx.fillStyle='rgba(0,0,0,0.25)';ctx.beginPath();ctx.ellipse(0,47,42,9,0,0,Math.PI*2);ctx.fill()
  roundRect(ctx,-8,-38,16,82,6,'#84593d')
  roundRect(ctx,-40,-55,80,28,9,'#6f7886')
  ctx.fillStyle=theme.gold;roundRect(ctx,-36,-51,26,20,5,ctx.fillStyle)
  ctx.restore()
}

function drawBook(ctx, x, y, scale, theme) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale)
  ctx.fillStyle='rgba(0,0,0,0.24)';ctx.beginPath();ctx.ellipse(0,46,44,9,0,0,Math.PI*2);ctx.fill()
  roundRect(ctx,-47,-42,42,84,8,'#74556f');roundRect(ctx,5,-42,42,84,8,'#5d4761')
  ctx.strokeStyle=theme.gold;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-36);ctx.lineTo(0,36);ctx.stroke()
  text(ctx,'Q',-24,18,26,'#f6e4a8','bold','center');text(ctx,'R',24,18,26,'#f6e4a8','bold','center')
  ctx.restore()
}

function drawHouseIcon(ctx, x, y, scale, theme) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale)
  ctx.fillStyle='rgba(0,0,0,0.24)';ctx.beginPath();ctx.ellipse(0,42,46,9,0,0,Math.PI*2);ctx.fill()
  ctx.fillStyle='#74513b';ctx.beginPath();ctx.moveTo(-50,-6);ctx.lineTo(0,-48);ctx.lineTo(50,-6);ctx.closePath();ctx.fill()
  roundRect(ctx,-40,-5,80,52,10,'#8b6a52');roundRect(ctx,-10,12,20,35,7,theme.gold)
  roundRect(ctx,-31,12,16,16,4,theme.accent2);roundRect(ctx,15,12,16,16,4,theme.accent2)
  ctx.restore()
}

function drawMapIcon(ctx, x, y, scale, theme) {
  ctx.save();ctx.translate(x,y);ctx.rotate(-0.05);ctx.scale(scale,scale)
  ctx.fillStyle='rgba(0,0,0,0.22)';ctx.beginPath();ctx.ellipse(0,40,46,9,0,0,Math.PI*2);ctx.fill()
  ctx.fillStyle='#d4c197';ctx.beginPath();ctx.moveTo(-46,-35);ctx.lineTo(-10,-45);ctx.lineTo(23,-34);ctx.lineTo(46,-45);ctx.lineTo(46,34);ctx.lineTo(10,44);ctx.lineTo(-23,33);ctx.lineTo(-46,43);ctx.closePath();ctx.fill()
  ctx.strokeStyle='#8a6e44';ctx.lineWidth=3;ctx.stroke()
  ctx.strokeStyle=theme.success;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-25,17);ctx.quadraticCurveTo(-4,-12,17,-2);ctx.quadraticCurveTo(30,6,35,-20);ctx.stroke()
  ctx.fillStyle='#b24e4e';ctx.beginPath();ctx.arc(18,-7,6,0,Math.PI*2);ctx.fill()
  ctx.restore()
}

function drawDumbbell(ctx, x, y, scale, theme) {
  ctx.save();ctx.translate(x,y);ctx.rotate(-0.12);ctx.scale(scale,scale)
  ctx.fillStyle='rgba(0,0,0,0.24)';ctx.beginPath();ctx.ellipse(0,30,62,9,0,0,Math.PI*2);ctx.fill()
  ctx.strokeStyle='#adb7c5';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(-34,0);ctx.lineTo(34,0);ctx.stroke()
  ctx.fillStyle=theme.accent;roundRect(ctx,-58,-22,18,44,7,ctx.fillStyle);roundRect(ctx,40,-22,18,44,7,ctx.fillStyle)
  ctx.fillStyle=theme.accent2;roundRect(ctx,-42,-16,12,32,5,ctx.fillStyle);roundRect(ctx,30,-16,12,32,5,ctx.fillStyle)
  ctx.restore()
}

function drawFallbackAsset(ctx, key, x, y, scale, theme) {
  const k=String(key||'').toLowerCase()
  if (k==='potion') return drawPotion(ctx,x,y,scale,theme.accent)
  if (k==='sword') return drawSword(ctx,x,y,scale,theme)
  if (k==='shield') return drawShield(ctx,x,y,scale,theme.accent2)
  if (k==='armor') return drawArmor(ctx,x,y,scale,theme)
  if (k==='food') return drawFood(ctx,x,y,scale,theme)
  if (k==='ore') return drawOre(ctx,x,y,scale,theme)
  if (k==='diamond') return drawCrystalCluster(ctx,x,y,scale*1.2,[theme.accent2,theme.accent,theme.gold])
  if (k==='coin') return drawCoin(ctx,x,y,scale,theme)
  if (k==='cherry') {
    ctx.save();ctx.translate(x,y);ctx.scale(scale,scale)
    ctx.strokeStyle='#6f9d52';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-6,-20);ctx.quadraticCurveTo(0,-44,18,-50);ctx.moveTo(6,-19);ctx.quadraticCurveTo(8,-38,-8,-50);ctx.stroke()
    ctx.fillStyle='#d84453';ctx.beginPath();ctx.arc(-20,14,24,0,Math.PI*2);ctx.arc(20,14,24,0,Math.PI*2);ctx.fill();ctx.restore();return true
  }
  if (k==='lemon') {
    ctx.save();ctx.translate(x,y);ctx.rotate(-0.32);ctx.scale(scale,scale);ctx.fillStyle='#f4d34f';ctx.strokeStyle='#9d7e27';ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(0,0,28,43,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();return true
  }
  if (k==='orange') {
    ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.fillStyle='#ee9c3d';ctx.strokeStyle='#a55a27';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,39,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();return true
  }
  if (k==='grape') {
    ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.fillStyle='#7b56b4';ctx.strokeStyle='#4e347d';ctx.lineWidth=3;[[0,-22],[19,-12],[-19,-10],[0,6],[20,10],[-20,11],[0,28]].forEach(([px,py])=>{ctx.beginPath();ctx.arc(px,py,14,0,Math.PI*2);ctx.fill();ctx.stroke()});ctx.restore();return true
  }
  if (k==='seven') {
    text(ctx,'7',x,y+38,92,theme.gold,'bold','center');return true
  }
  if (k==='chest') return drawTreasureChest(ctx,x,y,scale,theme)
  if (k==='bag') return drawBag(ctx,x,y,scale,theme)
  if (k==='hammer') return drawHammer(ctx,x,y,scale,theme)
  if (k==='book'||k==='scroll') return drawBook(ctx,x,y,scale,theme)
  if (k==='house') return drawHouseIcon(ctx,x,y,scale,theme)
  if (k==='map') return drawMapIcon(ctx,x,y,scale,theme)
  if (k==='dumbbell') return drawDumbbell(ctx,x,y,scale,theme)
  if (k==='slot') return drawSlotMachine(ctx,x,y,scale,theme)
  if (k==='dice') return drawDie(ctx,x,y,scale,theme)
  if (k==='car') return drawCar(ctx,x,y,scale,theme)
  if (k==='parking') return drawParkingSign(ctx,x,y,scale,theme)
  if (k==='compass') return drawCompass(ctx,x,y,scale,theme)
  if (k==='tent') return drawTent(ctx,x,y,scale,theme)
  if (k==='fish') return drawFish(ctx,x,y,scale,theme)
  if (k==='fox') return drawCharacter(ctx,x,y,scale,theme,'hunter')
  if (k==='demon') return drawCharacter(ctx,x,y,scale,theme,'battle')
  if (k==='undead') return drawCharacter(ctx,x,y,scale,theme,'battle')
  if (k==='kraken') return drawFish(ctx,x,y,scale,theme)
  if (k==='titan') return drawCharacter(ctx,x,y,scale,theme,'battle')
  if (k==='frost') return drawCharacter(ctx,x,y,scale,theme,'idle')
  if (k==='thunder') return drawCrystalCluster(ctx,x,y,scale,[theme.accent2,theme.accent,theme.gold])
  if (k==='flower') return drawGroundPlants(ctx,x-12,y+10,30,45,theme,5)
  if (k==='pet') return drawCharacter(ctx,x,y,scale,theme,'idle')
  return drawTreasureChest(ctx,x,y,scale,theme)
}

function slotSymbolAsset(value) {
  const raw = String(value || '').toLowerCase()
  if (raw.includes('💎') || raw.includes('diamond') || raw.includes('permata')) return 'diamond'
  if (raw.includes('🪙') || raw.includes('coin') || raw.includes('koin') || raw.includes('gold')) return 'coin'
  if (raw.includes('🗡️') || raw.includes('sword') || raw.includes('pedang')) return 'sword'
  if (raw.includes('🍒') || raw.includes('cherry')) return 'cherry'
  if (raw.includes('🍋') || raw.includes('lemon')) return 'lemon'
  if (raw.includes('🍊') || raw.includes('orange')) return 'orange'
  if (raw.includes('🍇') || raw.includes('grape')) return 'grape'
  if (raw.includes('7️⃣') || raw.includes('seven') || raw === '7') return 'seven'
  if (raw.includes('🛡️') || raw.includes('shield') || raw.includes('perisai')) return 'shield'
  return 'food'
}

function drawSlotMachine(ctx, x, y, scale, theme, reels = ['🍒','🍋','💎'], images = {}) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale)
  ctx.fillStyle='rgba(0,0,0,0.38)';ctx.beginPath();ctx.ellipse(0,140,128,20,0,0,Math.PI*2);ctx.fill()
  const machineImage = images.slot
  if (!drawAsset(ctx, machineImage, -126, -132, 252, 310)) {
    roundRect(ctx,-118,-120,236,260,28,'#31252e')
    roundRect(ctx,-96,-100,192,166,22,'#0b0b10')
    roundRect(ctx,-70,56,140,36,18,theme.gold)
    text(ctx,'SPIN',0,80,12,'#402d15','bold','center')
    ctx.strokeStyle='#9b7c4b';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(112,-72);ctx.lineTo(144,8);ctx.stroke()
    ctx.fillStyle='#d8a95a';ctx.beginPath();ctx.arc(146,14,16,0,Math.PI*2);ctx.fill()
  } else {
    ctx.fillStyle='rgba(5,7,12,0.76)'
    for(let i=0;i<3;i++) roundRect(ctx,-82+i*49,-82,44,132,10,ctx.fillStyle)
  }
  const values = Array.isArray(reels) && reels.length ? reels.slice(0,3) : ['🍒','🍋','💎']
  values.forEach((value,i)=>{
    const key = slotSymbolAsset(value)
    const image = images[key]
    const bx=-60+i*60
    if(!drawAsset(ctx,image,bx-20,-56,40,64)) drawFallbackAsset(ctx,key,bx,-24,.26,theme)
    text(ctx,String(value).replace(/^[^\p{L}\p{N}]+/u,'').slice(0,8).toUpperCase(),bx,28,9,theme.soft,'bold','center')
  })
  ctx.restore()
}

function drawDie(ctx, x, y, scale, theme, face = 6) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.rotate(-0.08)
  ctx.fillStyle='rgba(0,0,0,0.30)';ctx.beginPath();ctx.ellipse(0,76,70,13,0,0,Math.PI*2);ctx.fill()
  roundRect(ctx,-72,-72,144,144,26,'#ece7dc')
  roundRect(ctx,-58,-58,116,116,20,'#f7f3eb')
  const spots = face===1?[[0,0]]:face===2?[[-24,-24],[24,24]]:face===3?[[-24,-24],[0,0],[24,24]]:face===4?[[-24,-24],[24,-24],[-24,24],[24,24]]:face===5?[[-24,-24],[24,-24],[0,0],[-24,24],[24,24]]:[[-24,-24],[24,-24],[-24,0],[24,0],[-24,24],[24,24]]
  ctx.fillStyle=theme.accent
  spots.forEach(([px,py])=>{ctx.beginPath();ctx.arc(px,py,9,0,Math.PI*2);ctx.fill()})
  ctx.restore()
}

function drawCar(ctx, x, y, scale, theme) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale)
  ctx.fillStyle='rgba(0,0,0,0.36)';ctx.beginPath();ctx.ellipse(0,58,90,15,0,0,Math.PI*2);ctx.fill()
  ctx.fillStyle='#d8dce1';roundRect(ctx,-96,-18,192,54,18,ctx.fillStyle)
  ctx.fillStyle=theme.accent;roundRect(ctx,-76,-56,152,58,24,ctx.fillStyle)
  ctx.fillStyle='#15232b';roundRect(ctx,-58,-45,48,28,11,ctx.fillStyle);roundRect(ctx,12,-45,48,28,11,ctx.fillStyle)
  ctx.fillStyle=theme.accent2;ctx.beginPath();ctx.arc(-64,35,20,0,Math.PI*2);ctx.arc(64,35,20,0,Math.PI*2);ctx.fill()
  ctx.fillStyle='#20252a';ctx.beginPath();ctx.arc(-64,35,9,0,Math.PI*2);ctx.arc(64,35,9,0,Math.PI*2);ctx.fill()
  ctx.fillStyle=theme.gold;roundRect(ctx,-96,2,26,14,6,ctx.fillStyle);roundRect(ctx,70,2,26,14,6,ctx.fillStyle)
  ctx.restore()
}

function drawParkingSign(ctx, x, y, scale, theme) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale)
  ctx.fillStyle='rgba(0,0,0,0.28)';ctx.beginPath();ctx.ellipse(0,65,46,10,0,0,Math.PI*2);ctx.fill()
  ctx.strokeStyle='#7b6d5c';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(0,68);ctx.stroke()
  roundRect(ctx,-42,-76,84,70,12,theme.accent)
  text(ctx,'P',0,-27,46,'#ffffff','bold','center')
  ctx.fillStyle=theme.accent2;roundRect(ctx,-18,26,36,10,5,ctx.fillStyle)
  ctx.restore()
}

function drawCompass(ctx, x, y, scale, theme) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale)
  ctx.fillStyle='rgba(0,0,0,0.28)';ctx.beginPath();ctx.ellipse(0,58,48,10,0,0,Math.PI*2);ctx.fill()
  ctx.fillStyle='#d4c49b';ctx.beginPath();ctx.arc(0,0,52,0,Math.PI*2);ctx.fill()
  ctx.strokeStyle=theme.accent;ctx.lineWidth=5;ctx.stroke()
  ctx.fillStyle=theme.accent;ctx.beginPath();ctx.moveTo(0,-36);ctx.lineTo(12,16);ctx.lineTo(0,7);ctx.lineTo(-12,16);ctx.closePath();ctx.fill()
  ctx.fillStyle=theme.danger;ctx.beginPath();ctx.moveTo(0,36);ctx.lineTo(8,0);ctx.lineTo(0,8);ctx.lineTo(-8,0);ctx.closePath();ctx.fill()
  text(ctx,'N',0,-59,12,theme.ink,'bold','center')
  ctx.restore()
}

function drawTent(ctx, x, y, scale, theme) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale)
  ctx.fillStyle='rgba(0,0,0,0.30)';ctx.beginPath();ctx.ellipse(0,42,70,11,0,0,Math.PI*2);ctx.fill()
  ctx.fillStyle=theme.accent;ctx.beginPath();ctx.moveTo(-70,34);ctx.lineTo(0,-44);ctx.lineTo(70,34);ctx.closePath();ctx.fill()
  ctx.fillStyle=theme.surface;ctx.beginPath();ctx.moveTo(-48,30);ctx.lineTo(0,-28);ctx.lineTo(48,30);ctx.closePath();ctx.fill()
  ctx.fillStyle=theme.dark;ctx.beginPath();ctx.moveTo(-18,30);ctx.lineTo(0,-6);ctx.lineTo(18,30);ctx.closePath();ctx.fill()
  ctx.restore()
}

function drawHuntScene(ctx, x, y, w, h, theme, data = {}) {
  const g = ctx.createLinearGradient(x, y, x, y + h)
  g.addColorStop(0, '#1f3a25')
  g.addColorStop(0.42, '#17261a')
  g.addColorStop(1, '#090d0a')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  drawClouds(ctx, x, y, w, h)
  drawTree(ctx, x + 74, y + h * 0.58, 0.9, theme)
  drawTree(ctx, x + 162, y + h * 0.63, 0.56, theme)
  drawTree(ctx, x + w - 86, y + h * 0.56, 1.0, theme)
  drawTree(ctx, x + w - 176, y + h * 0.64, 0.60, theme)
  ctx.fillStyle = '#1d3220'
  ctx.beginPath()
  ctx.ellipse(x + w * 0.57, y + h * 0.76, w * 0.34, h * 0.14, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#4e3f2c'
  ctx.beginPath()
  ctx.moveTo(x + w * 0.16, y + h * 0.85)
  ctx.quadraticCurveTo(x + w * 0.52, y + h * 0.62, x + w * 0.89, y + h * 0.82)
  ctx.lineTo(x + w * 0.96, y + h)
  ctx.lineTo(x + w * 0.08, y + h)
  ctx.closePath()
  ctx.fill()
  const images = data.assetImages || {}
  const targetSource = Array.isArray(data.targets) ? data.targets : []
  const targetKeys = targetSource.length
    ? targetSource.slice(0, 2).map((item) => inferItemAsset(item.key || item.name || item))
    : data.enemy || data.prey || data.target
      ? [inferItemAsset(data.enemy || data.prey || data.target)]
      : ['deer', 'rabbit']
  targetKeys.forEach((key, i) => {
    const image = images[key]
    const cx = x + w * (0.68 + i * 0.13)
    const cy = y + h * (0.66 + i * 0.05)
    if (!drawAsset(ctx, image, cx - 46, cy - 44, 92, 88)) {
      drawFallbackAsset(ctx, key, cx, cy, 0.46, theme)
    }
    ctx.fillStyle = 'rgba(0,0,0,0.22)'
    ctx.beginPath()
    ctx.ellipse(cx, cy + 38, 40, 8, 0, 0, Math.PI * 2)
    ctx.fill()
  })
  drawCharacter(ctx, x + w * 0.36, y + h * 0.76, 0.92, theme, 'hunter')
  ctx.strokeStyle = 'rgba(210,224,198,0.42)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(x + w * 0.41, y + h * 0.62)
  ctx.lineTo(x + w * 0.66, y + h * 0.68)
  ctx.stroke()
  for (const [sx, sy] of [[0.21,0.38],[0.77,0.28],[0.57,0.48]]) spark(ctx, x + w * sx, y + h * sy, 4, theme.accent2, 0.35)
  text(ctx, 'WILD GROVE', x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, 'HUNTING GROUNDS', theme, theme.success)
}

function drawWorkScene(ctx, x, y, w, h, theme, data = {}) {
  const g = ctx.createLinearGradient(x, y, x, y + h)
  g.addColorStop(0, '#34404a')
  g.addColorStop(0.52, '#20272d')
  g.addColorStop(1, '#0b0f12')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  const images = data.assetImages || {}
  const role = String(data.job || data.role || '').trim()
  const roleKey = role.toLowerCase()
  const floorY = y + h * 0.70
  if (/(dokter|doctor|medical|perawat)/.test(roleKey)) {
    ctx.fillStyle = '#223238'
    ctx.fillRect(x + w * 0.11, y + h * 0.25, w * 0.78, h * 0.42)
    ctx.fillStyle = '#e7eef0'
    roundRect(ctx, x + w * 0.18, y + h * 0.34, w * 0.20, 110, 18, ctx.fillStyle)
    ctx.fillStyle = theme.success
    roundRect(ctx, x + w * 0.22, y + h * 0.38, w * 0.12, 16, 8, ctx.fillStyle)
    drawAsset(ctx, images.potion, x + w * 0.56, y + h * 0.34, 92, 120)
    text(ctx, 'MEDICAL WARD', x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  } else if (/(polisi|police)/.test(roleKey)) {
    ctx.fillStyle = '#182b37'
    ctx.fillRect(x + w * 0.13, y + h * 0.27, w * 0.74, h * 0.38)
    ctx.fillStyle = '#36566a'
    roundRect(ctx, x + w * 0.20, y + h * 0.36, w * 0.60, 88, 18, ctx.fillStyle)
    ctx.fillStyle = theme.accent2
    ctx.fillRect(x + w * 0.48, y + h * 0.40, w * 0.07, 42)
    drawAsset(ctx, images.shield, x + w * 0.64, y + h * 0.40, 86, 96)
    text(ctx, 'CITY POLICE', x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  } else if (/(petani|farmer)/.test(roleKey)) {
    ctx.fillStyle = '#4e3e2a'
    ctx.fillRect(x + w * 0.08, y + h * 0.48, w * 0.84, h * 0.24)
    for (let i = 0; i < 6; i++) {
      const px = x + w * (0.17 + i * 0.12)
      ctx.fillStyle = theme.success
      ctx.fillRect(px, y + h * 0.53, 6, 54)
      ctx.beginPath(); ctx.arc(px - 6, y + h * 0.54, 12, 0, Math.PI * 2); ctx.arc(px + 8, y + h * 0.58, 10, 0, Math.PI * 2); ctx.fill()
    }
    drawAsset(ctx, images.wheat, x + w * 0.66, y + h * 0.33, 96, 120)
    text(ctx, 'HARVEST FIELD', x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  } else if (/(penambang|mining|miner)/.test(roleKey)) {
    drawMiningScene(ctx, x, y, w, h, theme, data)
    return
  } else if (/(nelayan|fisher|mancing)/.test(roleKey)) {
    drawFishingScene(ctx, x, y, w, h, theme, data)
    return
  } else if (/(koki|chef|cook)/.test(roleKey)) {
    sceneBackdrop(ctx, x, y, w, h, theme, '#49372b', '#11100e')
    ctx.fillStyle = '#6b5038'
    roundRect(ctx, x + w * 0.13, y + h * 0.48, w * 0.74, 88, 18, ctx.fillStyle)
    for (const px of [0.25, 0.43, 0.61]) {
      ctx.fillStyle = '#2c2522'; ctx.beginPath(); ctx.arc(x + w * px, y + h * 0.52, 19, 0, Math.PI * 2); ctx.fill()
    }
    drawAsset(ctx, images.food, x + w * 0.62, y + h * 0.28, 110, 130)
    text(ctx, 'ADVENTURER KITCHEN', x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  } else if (/(blacksmith|pandai besi)/.test(roleKey)) {
    drawForgeScene(ctx, x, y, w, h, theme)
    return
  } else if (/(programmer|developer|coder)/.test(roleKey)) {
    sceneBackdrop(ctx, x, y, w, h, theme, '#1a2634', '#0b0e12')
    ctx.fillStyle = '#2b3946'
    roundRect(ctx, x + w * 0.16, y + h * 0.46, w * 0.68, 80, 18, ctx.fillStyle)
    ctx.fillStyle = '#7da4b9'
    roundRect(ctx, x + w * 0.30, y + h * 0.29, w * 0.40, 122, 14, ctx.fillStyle)
    ctx.fillStyle = '#11202b'
    roundRect(ctx, x + w * 0.33, y + h * 0.32, w * 0.34, 76, 10, ctx.fillStyle)
    drawAsset(ctx, images.book, x + w * 0.70, y + h * 0.31, 78, 96)
    text(ctx, 'CODE LAB', x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  } else {
    ctx.fillStyle = '#252c31'
    ctx.fillRect(x, floorY, w, h * 0.30)
    for (let i = 0; i < 4; i++) {
      const bx = x + w * (0.09 + i * 0.23)
      const bh = 150 + (i % 2) * 40
      ctx.fillStyle = i === 1 ? '#4a3b36' : '#333b42'
      roundRect(ctx, bx, floorY - bh, w * 0.16, bh, 16, ctx.fillStyle)
      ctx.fillStyle = theme.gold
      roundRect(ctx, bx + 18, floorY - bh + 26, w * 0.11, 42, 8, ctx.fillStyle)
    }
    text(ctx, 'CAREER DISTRICT', x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  }
  ctx.fillStyle = 'rgba(255,255,255,0.06)'
  ctx.fillRect(x, floorY, w, 6)
  drawCharacter(ctx, x + w * 0.36, y + h * 0.77, 0.90, theme, 'idle')
  const roleImage = images.potion || images.shield || images.wheat || images.food || images.hammer || images.book || images.coin || images.bag
  if (roleImage) drawAsset(ctx, roleImage, x + w * 0.66, y + h * 0.34, 84, 104)
  badge(ctx, x + 24, y + h - 50, 'WORK DISTRICT', theme, theme.gold)
}

function drawAdventureScene(ctx, x, y, w, h, theme, type = 'adventure', location = '', data = {}) {
  const sky = ctx.createLinearGradient(x,y,x,y+h)
  sky.addColorStop(0,'#1f2944');sky.addColorStop(0.5,'#3b4651');sky.addColorStop(1,'#151a20')
  ctx.fillStyle=sky;ctx.fillRect(x,y,w,h)
  glow(ctx,x+w*.75,y+h*.18,150,'rgba(255,224,156,.16)')
  ctx.fillStyle='rgba(245,233,191,.74)';ctx.beginPath();ctx.arc(x+w*.76,y+h*.18,28,0,Math.PI*2);ctx.fill()
  ctx.fillStyle='#25313a';ctx.beginPath();ctx.moveTo(x,y+h*.60);ctx.lineTo(x+w*.18,y+h*.39);ctx.lineTo(x+w*.34,y+h*.56);ctx.lineTo(x+w*.52,y+h*.34);ctx.lineTo(x+w*.70,y+h*.51);ctx.lineTo(x+w,y+h*.39);ctx.lineTo(x+w,y+h);ctx.lineTo(x,y+h);ctx.closePath();ctx.fill()
  ctx.fillStyle='#394d40';ctx.beginPath();ctx.moveTo(x,y+h*.74);ctx.quadraticCurveTo(x+w*.25,y+h*.62,x+w*.48,y+h*.73);ctx.quadraticCurveTo(x+w*.74,y+h*.84,x+w,y+h*.68);ctx.lineTo(x+w,y+h);ctx.lineTo(x,y+h);ctx.closePath();ctx.fill()
  ctx.fillStyle='#7b664c';ctx.beginPath();ctx.moveTo(x+w*.44,y+h);ctx.quadraticCurveTo(x+w*.47,y+h*.79,x+w*.58,y+h*.60);ctx.quadraticCurveTo(x+w*.63,y+h*.50,x+w*.68,y+h*.44);ctx.lineTo(x+w*.73,y+h*.48);ctx.quadraticCurveTo(x+w*.66,y+h*.62,x+w*.60,y+h*.72);ctx.quadraticCurveTo(x+w*.53,y+h*.82,x+w*.52,y+h);ctx.closePath();ctx.fill()
  for (const [tx,ty,sc] of [[.12,.66,.8],[.25,.73,.55],[.88,.64,.9],[.76,.72,.5]]) drawTree(ctx,x+w*tx,y+h*ty,sc,theme)
  const images = data.assetImages || {}
  if (!drawAsset(ctx,images.compass,x+w*.14,y+h*.18,96,96)) drawCompass(ctx,x+w*.19,y+h*.23,.85,theme)
  if (!drawAsset(ctx,images.map,x+w*.70,y+h*.20,112,98)) drawMapIcon(ctx,x+w*.75,y+h*.25,.65,theme)
  drawCharacter(ctx,x+w*.56,y+h*.76,0.72,theme,'hunter')
  ctx.strokeStyle='rgba(239,226,173,.52)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x+w*.56,y+h*.60,64,0,Math.PI*2);ctx.stroke()
  text(ctx,clampText(location||'UNMARKED FRONTIER',24).toUpperCase(),x+w*.50,y+42,12,theme.soft,'bold','center')
  badge(ctx,x+24,y+h-50,type==='hunt'?'HUNTING GROUNDS':'ADVENTURE ROUTE',theme,theme.accent2)
}

function drawFishingScene(ctx, x, y, w, h, theme, data = {}) {
  drawWater(ctx, x, y, w, h, theme)
  ctx.fillStyle = 'rgba(10,14,17,0.78)'
  ctx.beginPath()
  ctx.moveTo(x, y + h * 0.5)
  ctx.quadraticCurveTo(x + w * 0.25, y + h * 0.39, x + w * 0.48, y + h * 0.5)
  ctx.quadraticCurveTo(x + w * 0.74, y + h * 0.61, x + w, y + h * 0.48)
  ctx.lineTo(x + w, y + h * 0.54)
  ctx.quadraticCurveTo(x + w * 0.72, y + h * 0.67, x + w * 0.48, y + h * 0.57)
  ctx.quadraticCurveTo(x + w * 0.22, y + h * 0.46, x, y + h * 0.56)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#3d2e2a'
  roundRect(ctx, x + 28, y + h * 0.44, w * 0.38, 20, 10, ctx.fillStyle)
  ctx.fillStyle = '#5b4234'
  roundRect(ctx, x + 42, y + h * 0.34, 20, 100, 8, ctx.fillStyle)
  drawCharacter(ctx, x + w * 0.25, y + h * 0.62, 0.82, theme, 'fishing')
  for (let i=0;i<7;i++) {
    const bx=x+w*(0.54+(i%3)*0.12), by=y+h*(0.64+(i%4)*0.07)
    ctx.strokeStyle='rgba(215,246,255,0.32)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(bx,by,8+(i%3)*3,0,Math.PI*2);ctx.stroke()
  }
  const images = data.assetImages || {}
  if (!drawAsset(ctx, images.fish, x + w * 0.62, y + h * 0.56, 88, 70)) drawFish(ctx, x + w * 0.69, y + h * 0.68, 0.8, theme)
  if (!drawAsset(ctx, images.prawn || images.octopus, x + w * 0.49, y + h * 0.72, 62, 52)) drawFish(ctx, x + w * 0.55, y + h * 0.78, 0.45, theme)
  if (drawAsset(ctx, images.fishingrod, x + 30, y + h * 0.26, 90, 160)) {
    ctx.globalAlpha = 0.4
    ctx.strokeStyle = theme.soft
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(x + 102, y + h * 0.38); ctx.quadraticCurveTo(x + w * 0.33, y + h * 0.44, x + w * 0.47, y + h * 0.58); ctx.stroke()
    ctx.globalAlpha = 1
  }
  for (let i=0;i<8;i++) {
    ctx.fillStyle='rgba(220,248,255,0.34)';ctx.beginPath();ctx.arc(x+w*(0.07+i*0.12),y+h*(0.60+(i%2)*0.08),2+(i%3),0,Math.PI*2);ctx.fill()
  }
  glow(ctx, x + w * 0.82, y + h * 0.17, 120, 'rgba(120,228,255,0.17)')
  ctx.fillStyle = 'rgba(230,250,255,0.52)'
  ctx.beginPath()
  ctx.arc(x + w * 0.82, y + h * 0.17, 28, 0, Math.PI * 2)
  ctx.fill()
  text(ctx, 'RIVER OF AURORA', x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, 'FISHING', theme, theme.accent2)
}

function drawMiningScene(ctx, x, y, w, h, theme, data = {}) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h)
  g.addColorStop(0, '#2b2e36')
  g.addColorStop(0.55, '#1a1d23')
  g.addColorStop(1, '#0b0d11')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  ctx.fillStyle = 'rgba(8,10,13,0.74)'
  ctx.beginPath()
  ctx.moveTo(x, y + h)
  ctx.lineTo(x, y + h * 0.28)
  ctx.lineTo(x + w * 0.19, y + h * 0.1)
  ctx.lineTo(x + w * 0.36, y + h * 0.28)
  ctx.lineTo(x + w * 0.58, y + h * 0.12)
  ctx.lineTo(x + w, y + h * 0.3)
  ctx.lineTo(x + w, y + h)
  ctx.closePath()
  ctx.fill()
  for (const [cx, cy, c, s] of [[0.2, 0.72, theme.accent2, 36], [0.38, 0.61, theme.gold, 28], [0.68, 0.72, theme.success, 33], [0.82, 0.56, theme.accent, 25]]) {
    glow(ctx, x + w * cx, y + h * cy, 62, `${c}55`)
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.moveTo(x + w * cx, y + h * cy - s)
    ctx.lineTo(x + w * cx + s * 0.55, y + h * cy)
    ctx.lineTo(x + w * cx, y + h * cy + s)
    ctx.lineTo(x + w * cx - s * 0.55, y + h * cy)
    ctx.closePath()
    ctx.fill()
  }
  const images = data.assetImages || {}
  if (!drawAsset(ctx, images.ore || images.diamond, x + w * 0.14, y + h * 0.57, 116, 116)) drawCrystalCluster(ctx, x+w*0.22, y+h*0.68, 0.85, [theme.accent2,theme.accent,theme.gold])
  if (!drawAsset(ctx, images.rock, x + w * 0.68, y + h * 0.55, 110, 110)) drawCrystalCluster(ctx, x+w*0.78, y+h*0.63, 0.65, [theme.success,theme.accent2,theme.accent])
  drawCharacter(ctx, x + w * 0.48, y + h * 0.67, 0.9, theme, 'miner')
  drawAsset(ctx, images.pickaxe, x + w * 0.36, y + h * 0.52, 86, 106)
  ctx.fillStyle = 'rgba(255,239,173,0.72)'
  ctx.beginPath()
  ctx.arc(x + w * 0.48, y + h * 0.49, 12, 0, Math.PI * 2)
  ctx.fill()
  text(ctx, 'CRYSTAL CAVERN', x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, 'MINING', theme, theme.accent2)
}

function drawBossScene(ctx, x, y, w, h, theme, data = {}) {
  const g = ctx.createRadialGradient(x + w * 0.7, y + h * 0.4, 20, x + w * 0.7, y + h * 0.4, w * 0.72)
  g.addColorStop(0, '#3a2932')
  g.addColorStop(0.42, '#21191f')
  g.addColorStop(1, '#0b090c')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  glow(ctx, x + w * 0.72, y + h * 0.42, 190, theme.glow)
  drawRunes(ctx, x+w*0.72, y+h*0.56, 145, theme, 10)
  ctx.fillStyle = 'rgba(7,6,9,0.76)'
  ctx.beginPath()
  ctx.ellipse(x + w * 0.72, y + h * 0.56, 112, 132, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = theme.accent
  ctx.beginPath()
  ctx.arc(x + w * 0.67, y + h * 0.46, 10, 0, Math.PI * 2)
  ctx.arc(x + w * 0.79, y + h * 0.46, 10, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle='rgba(255,255,255,0.18)';ctx.lineWidth=5
  ctx.beginPath();ctx.moveTo(x+w*.62,y+h*.36);ctx.lineTo(x+w*.57,y+h*.24);ctx.lineTo(x+w*.68,y+h*.31);ctx.moveTo(x+w*.82,y+h*.31);ctx.lineTo(x+w*.93,y+h*.24);ctx.lineTo(x+w*.88,y+h*.36);ctx.stroke()
  ctx.strokeStyle = 'rgba(255,255,255,0.13)'
  ctx.lineWidth = 7
  ctx.beginPath()
  ctx.arc(x + w * 0.72, y + h * 0.49, 108, 0.08, Math.PI - 0.08)
  ctx.stroke()
  const images = data.assetImages || {}
  drawCharacter(ctx, x + w * 0.27, y + h * 0.68, 0.82, theme, 'battle')
  drawAsset(ctx, images.sword, x + w * 0.14, y + h * 0.54, 96, 120)
  const bossKey = inferItemAsset(data.enemy || data.boss || 'dragon')
  const bossImage = images[bossKey] || images.dragon || images.bear || images.lion
  if (!drawAsset(ctx, bossImage, x + w * 0.60, y + h * 0.32, 172, 206)) {
    drawFallbackAsset(ctx, bossKey, x + w * 0.70, y + h * 0.54, 0.72, theme)
  }
  spark(ctx, x + 90, y + 105, 10, theme.gold)
  spark(ctx, x + w - 80, y + 160, 7, theme.accent2)
  text(ctx, 'ANCIENT RAID', x + w * 0.7, y + 44, 12, theme.soft, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, 'BOSS RAID', theme, theme.danger)
}

function drawBattleScene(ctx, x, y, w, h, theme, data = {}) {
  const key = String(data.featureKey || 'battle').toLowerCase()
  const mode = key === 'duel' ? 'DUEL ARENA' : key === 'arena' || key === 'colosseum' ? 'GLADIATOR RING' : key === 'challenge' ? 'CHALLENGE GATE' : key === 'gauntlet' ? 'GAUNTLET RUN' : 'COMBAT ARENA'
  const g = ctx.createLinearGradient(x, y, x + w, y + h)
  g.addColorStop(0, key === 'duel' ? '#17141b' : '#1d1416')
  g.addColorStop(0.5, '#271b20')
  g.addColorStop(1, '#0a090c')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  const arenaY = y + h * 0.56
  ctx.fillStyle = '#3c3030'
  ctx.beginPath()
  ctx.ellipse(x + w * 0.5, arenaY + 86, w * 0.36, h * 0.13, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.14)'
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.ellipse(x + w * 0.5, arenaY + 86, w * 0.30, h * 0.085, 0, 0, Math.PI * 2)
  ctx.stroke()
  for (let i = 0; i < 6; i++) {
    const px = x + w * (0.12 + i * 0.15)
    ctx.fillStyle = i % 2 ? '#4d3032' : '#31262d'
    ctx.fillRect(px, y + h * 0.30, 8, h * 0.30)
  }
  const left = data.victory === false ? theme.danger : theme.accent2
  const right = data.victory === false ? theme.accent : theme.success
  glow(ctx, x + w * 0.31, y + h * 0.52, 120, `${left}33`)
  glow(ctx, x + w * 0.69, y + h * 0.52, 120, `${right}33`)
  drawCharacter(ctx, x + w * 0.31, y + h * 0.68, 0.78, theme, 'battle')
  const images = data.assetImages || {}
  const enemySource = data.enemy || data.opponent || data.foe || data.target
  if (enemySource) {
    const enemyKey = inferItemAsset(enemySource)
    const enemyImage = images[enemyKey] || images.dragon || images.bear || images.lion
    if (!drawAsset(ctx, enemyImage, x + w * 0.58, y + h * 0.42, 148, 180)) {
      drawCharacter(ctx, x + w * 0.69, y + h * 0.68, 0.78, theme, 'battle')
    }
  } else {
    drawCharacter(ctx, x + w * 0.69, y + h * 0.68, 0.78, theme, 'battle')
  }
  if (data.victory !== false) {
    if (!drawAsset(ctx, images.sword, x + w * 0.18, y + h * 0.48, 66, 92)) drawSword(ctx, x + w * 0.21, y + h * 0.55, 0.42, theme)
    if (!drawAsset(ctx, images.shield, x + w * 0.74, y + h * 0.51, 64, 82)) drawShield(ctx, x + w * 0.77, y + h * 0.56, 0.42, theme.accent2)
  }
  for (let i = 0; i < 8; i++) spark(ctx, x + w * (0.24 + i * 0.075), y + h * (0.40 + (i % 3) * 0.06), 4 + (i % 2) * 2, i % 2 ? theme.accent2 : theme.danger, 0.7)
  text(ctx, mode, x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, key === 'gauntlet' ? 'GAUNTLET' : key === 'duel' ? 'DUEL' : 'BATTLE', theme, theme.danger)
}

function drawShopScene(ctx, x, y, w, h, theme, data = {}) {
  const g=ctx.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#4a382b');g.addColorStop(.5,'#2f241e');g.addColorStop(1,'#120f0e');ctx.fillStyle=g;ctx.fillRect(x,y,w,h)
  ctx.fillStyle='#6b4a2f';ctx.fillRect(x,y+h*.26,w,h*.10)
  for(let i=0;i<5;i++){ctx.fillStyle=i%2?theme.accent:theme.gold;ctx.beginPath();ctx.arc(x+w*(.14+i*.18),y+h*.31,22,0,Math.PI*2);ctx.fill()}
  ctx.fillStyle='#7a5435';roundRect(ctx,x+w*.08,y+h*.42,w*.84,h*.22,18,ctx.fillStyle)
  ctx.fillStyle='#2f241c';roundRect(ctx,x+w*.13,y+h*.47,w*.74,h*.10,12,ctx.fillStyle)
  const images=data.assetImages||{}
  const items=(data.items||[]).slice(0,4)
  const defaults=[{key:'potion',name:'POTION'},{key:'sword',name:'SWORD'},{key:'shield',name:'SHIELD'},{key:'food',name:'FOOD'}]
  const displayItems=items.length?items:defaults
  for(let i=0;i<Math.min(4,displayItems.length);i++){
    const px=x+w*(.17+i*.22), py=y+h*.43
    const item=displayItems[i];const key=inferItemAsset(item?.key||item?.name||defaults[i].key)
    ctx.fillStyle=theme.gold;ctx.beginPath();ctx.ellipse(px,py+94,50,11,0,0,Math.PI*2);ctx.fill()
    if(!drawAsset(ctx,images[key],px-44,py-20,88,90)) drawFallbackAsset(ctx,key,px,py+22,.44,theme)
    text(ctx,clampText(item?.name||defaults[i].name,11),px,py+122,10,theme.soft,'bold','center')
  }
  drawCharacter(ctx,x+w*.50,y+h*.84,.52,theme,'idle')
  text(ctx,'MOONLIT MERCHANTS',x+w*.5,y+44,12,theme.soft,'bold','center')
  badge(ctx,x+24,y+h-50,'SHOP',theme,theme.gold)
}

function drawJobEnvironment(ctx, x, y, w, h, theme, job) {
  const key=String(job||'').toLowerCase()
  ctx.save()
  ctx.globalAlpha=0.78
  if(key==='medical'){
    ctx.fillStyle='rgba(220,235,240,0.12)';roundRect(ctx,x+18,y+h*.52,w*.34,h*.21,18,ctx.fillStyle)
    ctx.fillStyle='#d9e6ea';roundRect(ctx,x+36,y+h*.57,w*.24,h*.07,8,ctx.fillStyle)
    ctx.fillStyle='#81b6c5';roundRect(ctx,x+42,y+h*.48,w*.06,h*.19,9,ctx.fillStyle)
    ctx.strokeStyle=theme.accent2;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+w*.10,y+h*.49);ctx.lineTo(x+w*.30,y+h*.49);ctx.stroke()
    text(ctx,'CLINIC',x+w*.18,y+h*.76,10,theme.soft,'bold','center')
  }else if(key==='police'){
    ctx.fillStyle='rgba(91,112,154,0.26)';roundRect(ctx,x+18,y+h*.55,w*.38,h*.17,22,ctx.fillStyle)
    ctx.fillStyle='#6e83aa';roundRect(ctx,x+w*.08,y+h*.48,w*.20,h*.10,18,ctx.fillStyle)
    ctx.fillStyle='#273047';roundRect(ctx,x+w*.28,y+h*.50,w*.12,h*.08,10,ctx.fillStyle)
    ctx.fillStyle=theme.accent;ctx.fillRect(x+w*.22,y+h*.46,w*.07,6)
    ctx.fillStyle='#bfcde4';ctx.beginPath();ctx.arc(x+w*.11,y+h*.72,11,0,Math.PI*2);ctx.arc(x+w*.34,y+h*.72,11,0,Math.PI*2);ctx.fill()
    text(ctx,'PATROL',x+w*.21,y+h*.82,10,theme.soft,'bold','center')
  }else if(key==='farm'){
    for(let i=0;i<4;i++){ctx.strokeStyle=i%2?theme.success:theme.gold;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x+18,y+h*(.56+i*.065));ctx.quadraticCurveTo(x+w*.18,y+h*(.51+i*.065),x+w*.34,y+h*(.56+i*.065));ctx.stroke()}
    ctx.fillStyle='#8c6a43';roundRect(ctx,x+w*.04,y+h*.42,w*.18,h*.11,10,ctx.fillStyle)
    ctx.fillStyle='#c7a46c';ctx.beginPath();ctx.moveTo(x+w*.03,y+h*.42);ctx.lineTo(x+w*.13,y+h*.34);ctx.lineTo(x+w*.23,y+h*.42);ctx.closePath();ctx.fill()
    text(ctx,'FARMLAND',x+w*.18,y+h*.80,10,theme.soft,'bold','center')
  }else if(key==='mining'){
    ctx.fillStyle='#464d59';ctx.beginPath();ctx.moveTo(x+18,y+h*.72);ctx.lineTo(x+w*.08,y+h*.45);ctx.lineTo(x+w*.28,y+h*.40);ctx.lineTo(x+w*.36,y+h*.70);ctx.closePath();ctx.fill()
    drawCrystalCluster(ctx,x+w*.20,y+h*.58,.50,[theme.accent2,theme.accent,theme.gold])
    ctx.strokeStyle='#7c6a57';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(x+w*.10,y+h*.74);ctx.lineTo(x+w*.32,y+h*.74);ctx.stroke()
    text(ctx,'MINE SHAFT',x+w*.18,y+h*.82,10,theme.soft,'bold','center')
  }else if(key==='fishing'){
    drawWater(ctx,x,y+h*.48,w*.44,h*.34,theme)
    ctx.fillStyle='#5c4636';ctx.beginPath();ctx.moveTo(x+w*.04,y+h*.53);ctx.lineTo(x+w*.34,y+h*.53);ctx.lineTo(x+w*.28,y+h*.63);ctx.lineTo(x+w*.10,y+h*.63);ctx.closePath();ctx.fill()
    ctx.strokeStyle=theme.gold;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x+w*.16,y+h*.54);ctx.lineTo(x+w*.28,y+h*.37);ctx.stroke()
    text(ctx,'DOCK',x+w*.20,y+h*.79,10,theme.soft,'bold','center')
  }else if(key==='kitchen'){
    ctx.fillStyle='#5d4735';roundRect(ctx,x+18,y+h*.54,w*.34,h*.16,14,ctx.fillStyle)
    ctx.fillStyle='#a17b55';ctx.beginPath();ctx.arc(x+w*.18,y+h*.53,35,0,Math.PI*2);ctx.fill()
    ctx.fillStyle='#e0bc70';ctx.beginPath();ctx.arc(x+w*.18,y+h*.53,24,0,Math.PI*2);ctx.fill()
    ctx.strokeStyle='#b7a18a';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x+w*.30,y+h*.53);ctx.lineTo(x+w*.39,y+h*.45);ctx.stroke()
    text(ctx,'KITCHEN',x+w*.20,y+h*.80,10,theme.soft,'bold','center')
  }else if(key==='forge'){
    ctx.fillStyle='#4a4038';roundRect(ctx,x+18,y+h*.58,w*.32,h*.13,12,ctx.fillStyle)
    ctx.fillStyle='#23262c';roundRect(ctx,x+w*.08,y+h*.48,w*.16,h*.09,12,ctx.fillStyle)
    ctx.fillStyle=theme.gold;ctx.beginPath();ctx.arc(x+w*.16,y+h*.52,11,0,Math.PI*2);ctx.fill()
    glow(ctx,x+w*.34,y+h*.50,55,'rgba(255,151,91,.18)');spark(ctx,x+w*.34,y+h*.50,11,theme.gold,.90)
    text(ctx,'FORGE',x+w*.20,y+h*.80,10,theme.soft,'bold','center')
  }
  ctx.restore()
}

function drawProfileScene(ctx, x, y, w, h, theme, avatar, data = {}) {
  const job = String(data.jobTheme || data.job || '').toLowerCase()
  const g=ctx.createLinearGradient(x,y,x,y+h)
  const top=job==='medical'?'#29434a':job==='police'?'#29334b':job==='farm'?'#2e4430':job==='mining'?'#35383e':job==='fishing'?'#264752':job==='kitchen'?'#4b3a2a':job==='forge'?'#4b3028':'#30333b'
  g.addColorStop(0,top);g.addColorStop(.46,'#20262d');g.addColorStop(1,theme.bg);ctx.fillStyle=g;ctx.fillRect(x,y,w,h)
  drawJobEnvironment(ctx,x,y,w,h,theme,job)
  ctx.fillStyle='rgba(6,9,12,.44)';ctx.fillRect(x,y+h*.64,w,h*.36)
  for(let i=0;i<5;i++){
    const bx=x+w*(.10+i*.20), by=y+h*(.68+(i%2)*.05)
    line(ctx,bx,by,bx+w*.12,by,theme.soft,2)
  }
  const frameX=x+42, frameY=y+138, frameW=w-84, frameH=300
  raised(ctx,frameX,frameY,frameW,frameH,30,theme,13)
  inset(ctx,frameX+16,frameY+16,frameW-32,frameH-32,22,theme,7)
  const portraitX=x+w*.50, portraitY=frameY+146
  ctx.save();ctx.beginPath();ctx.rect(portraitX-86,frameY+32,172,218);ctx.clip()
  if(avatar){
    drawAssetCover(ctx,avatar,portraitX-86,frameY+32,172,218,24)
  }else{
    const av=ctx.createLinearGradient(portraitX-86,frameY+32,portraitX+86,frameY+250);av.addColorStop(0,theme.accent2);av.addColorStop(.48,theme.accent);av.addColorStop(1,theme.dark);ctx.fillStyle=av;ctx.fillRect(portraitX-86,frameY+32,172,218);drawCharacter(ctx,portraitX,frameY+220,.62,theme,'idle')
  }
  ctx.restore()
  roundRect(ctx,portraitX-86,frameY+32,172,218,24,null,'rgba(255,255,255,.18)',2)
  raised(ctx,x+68,frameY+258,w-136,42,21,theme,6)
  text(ctx,clampText(data.job||'UNASSIGNED',22).toUpperCase(),x+w*.5,frameY+285,11,theme.soft,'bold','center')
  ctx.fillStyle=theme.gold;ctx.beginPath();ctx.arc(x+w*.5,frameY+279,4,0,Math.PI*2);ctx.fill()
  const labels=[['HP',theme.success],['MANA',theme.accent2],['STA',theme.gold],['LV',theme.accent]]
  labels.forEach(([label,color],i)=>{
    const bx=x+38+i*100
    raised(ctx,bx,y+h-122,86,48,18,theme,5)
    text(ctx,label,bx+43,y+h-98,9,theme.muted,'bold','center')
    const value=label==='HP'?`${number(data.health??0)}/${number(data.maxHealth??0)}`:label==='MANA'?`${number(data.mana??0)}/${number(data.maxMana??0)}`:label==='STA'?`${number(data.stamina??0)}/${number(data.maxStamina??0)}`:number(data.level??0)
    text(ctx,clampText(value,12),bx+43,y+h-82,10,color,'bold','center')
  })
  text(ctx,'CHARACTER DOSSIER',x+w*.5,y+44,12,theme.soft,'bold','center')
  badge(ctx,x+24,y+h-50,'PROFILE',theme,theme.accent)
}


function drawInventoryScene(ctx, x, y, w, h, theme, data = {}) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h)
  g.addColorStop(0, '#303944')
  g.addColorStop(0.5, '#1a2028')
  g.addColorStop(1, '#080c10')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  raised(ctx, x + 42, y + 108, w - 84, 344, 34, theme, 12)
  inset(ctx, x + 66, y + 132, w - 132, 294, 26, theme, 8)
  const items = (data.items || []).slice(0, 6)
  const images = data.assetImages || {}
  for (let i = 0; i < 6; i++) {
    const col = i % 3
    const row = Math.floor(i / 3)
    const sx = x + 88 + col * 106
    const sy = y + 158 + row * 122
    inset(ctx, sx, sy, 88, 102, 18, theme, 5)
    const item = items[i]
    if (item) {
      const asset = images[inferItemAsset(item.key || item.name)]
      if (!drawAsset(ctx, asset, sx + 12, sy + 8, 64, 62)) {
        drawFallbackAsset(ctx, inferItemAsset(item.key || item.name), sx + 44, sy + 38, 0.36, theme)
      }
      text(ctx, `×${number(item.count || 0)}`, sx + 44, sy + 89, 12, theme.soft, 'bold', 'center')
    }
  }
  drawCharacter(ctx, x + w * 0.50, y + h * 0.86, 0.50, theme, 'idle')
  text(ctx, 'ADVENTURER INVENTORY', x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, 'INVENTORY', theme, theme.accent2)
}

function drawLeaderboardScene(ctx, x, y, w, h, theme) {
  const g = ctx.createLinearGradient(x, y, x, y + h)
  g.addColorStop(0, '#35312a')
  g.addColorStop(0.45, '#202126')
  g.addColorStop(1, '#0b0c10')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  glow(ctx, x + w * 0.5, y + h * 0.32, 180, theme.glow)
  const podiumY = y + h * 0.55
  const blocks = [
    { x: x + w * 0.24, h: 110, c: '#c6ced8', n: '02' },
    { x: x + w * 0.5, h: 145, c: theme.gold, n: '01' },
    { x: x + w * 0.76, h: 90, c: '#c99773', n: '03' },
  ]
  for (const b of blocks) {
    raised(ctx, b.x - 42, podiumY - b.h, 84, b.h, 18, theme, 9)
    inset(ctx, b.x - 25, podiumY - b.h + 18, 50, 50, 25, theme, 5)
    ctx.fillStyle = b.c
    ctx.beginPath()
    ctx.arc(b.x, podiumY - b.h + 43, 13, 0, Math.PI * 2)
    ctx.fill()
    text(ctx, b.n, b.x, podiumY + 28, 12, b.c, 'bold', 'center')
  }
  drawCharacter(ctx, x + w * 0.5, y + h * 0.49, 0.62, theme, 'idle')
  text(ctx, 'HALL OF HEROES', x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, 'LEADERBOARD', theme, theme.gold)
}

function drawRewardScene(ctx, x, y, w, h, theme, data = {}) {
  const g = ctx.createRadialGradient(x + w * 0.5, y + h * 0.4, 20, x + w * 0.5, y + h * 0.4, w * 0.7)
  g.addColorStop(0, '#332b3d')
  g.addColorStop(0.5, '#201c29')
  g.addColorStop(1, '#0b0a0e')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  glow(ctx, x + w * 0.5, y + h * 0.42, 190, theme.glow)
  raised(ctx, x + w * 0.22, y + h * 0.28, w * 0.56, h * 0.38, 36, theme, 14)
  inset(ctx, x + w * 0.29, y + h * 0.36, w * 0.42, h * 0.22, 26, theme, 8)
  for (let i = 0; i < 9; i++) {
    const a = (Math.PI * 2 * i) / 9
    const rx = x + w * 0.5 + Math.cos(a) * 145
    const ry = y + h * 0.47 + Math.sin(a) * 105
    spark(ctx, rx, ry, 5 + (i % 3) * 2, i % 2 ? theme.accent2 : theme.gold, 0.72)
  }
  const rewardCandidate = data.itemKey || data.item || data.rewardItem || data.outputItem
  if (rewardCandidate) {
    const key = inferItemAsset(rewardCandidate)
    const image = (data.assetImages || {})[key]
    if (!drawAsset(ctx, image, x + w * 0.40, y + h * 0.40, w * 0.20, h * 0.20)) drawFallbackAsset(ctx, key, x + w * 0.5, y + h * 0.50, 0.82, theme)
  } else {
    drawTreasureChest(ctx, x + w * 0.5, y + h * 0.54, 0.70, theme)
  }
  drawTreasureChest(ctx, x+w*.5, y+h*.72, rewardCandidate ? 0.42 : 0.30, theme)
  drawCharacter(ctx, x + w * 0.26, y + h * 0.81, 0.42, theme, 'idle')
  text(ctx, 'REWARD UNLOCKED', x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, 'REWARD', theme, theme.gold)
}

function drawLevelupScene(ctx, x, y, w, h, theme) {
  const g = ctx.createRadialGradient(x + w * 0.5, y + h * 0.45, 10, x + w * 0.5, y + h * 0.45, w * 0.72)
  g.addColorStop(0, '#3a3048')
  g.addColorStop(0.48, '#211d2d')
  g.addColorStop(1, '#0b090e')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  glow(ctx, x + w * 0.5, y + h * 0.42, 210, theme.glow)
  for (let i = 0; i < 12; i++) {
    const a = (Math.PI * 2 * i) / 12
    const rx = x + w * 0.5 + Math.cos(a) * 155
    const ry = y + h * 0.43 + Math.sin(a) * 125
    spark(ctx, rx, ry, 7, i % 2 ? theme.accent2 : theme.gold, 0.8)
  }
  raised(ctx, x + w * 0.28, y + h * 0.28, w * 0.44, h * 0.3, 32, theme, 14)
  inset(ctx, x + w * 0.33, y + h * 0.34, w * 0.34, h * 0.18, 24, theme, 8)
  text(ctx, 'LEVEL', x + w * 0.5, y + h * 0.43, 13, theme.soft, 'bold', 'center')
  text(ctx, 'UP', x + w * 0.5, y + h * 0.52, 42, theme.accent, 'bold', 'center')
  drawCharacter(ctx, x + w * 0.5, y + h * 0.82, 0.58, theme, 'battle')
  text(ctx, 'ASCENSION', x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, 'LEVEL UP', theme, theme.accent)
}

function drawExpeditionScene(ctx, x, y, w, h, theme) {
  drawAdventureScene(ctx, x, y, w, h, theme, 'adventure')
  ctx.fillStyle = 'rgba(18,20,28,0.86)'
  roundRect(ctx, x + w * 0.12, y + h * 0.22, w * 0.28, 70, 20, ctx.fillStyle)
  text(ctx, 'EXPEDITION', x + w * 0.26, y + h * 0.22 + 30, 12, theme.soft, 'bold', 'center')
  text(ctx, 'RETURNING', x + w * 0.26, y + h * 0.22 + 52, 10, theme.accent2, 'bold', 'center')
}

function drawGenericScene(ctx, x, y, w, h, theme, type, data = {}) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h)
  g.addColorStop(0, '#29272e')
  g.addColorStop(0.55, '#1d1e24')
  g.addColorStop(1, '#0b0c10')
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  grid(ctx, x, y, w, h, theme, 30)
  glow(ctx, x + w * 0.5, y + h * 0.4, 190, theme.glow)
  const profile = featureProfile(data.featureKey || type, type)
  const key = profile.asset || 'chest'
  const image = (data.assetImages || {})[key]
  if (!drawAsset(ctx, image, x + w * 0.30, y + h * 0.24, w * 0.40, h * 0.34)) drawFallbackAsset(ctx, key, x + w * 0.5, y + h * 0.43, 1.00, theme)
  drawCharacter(ctx, x + w * 0.5, y + h * 0.74, 0.60, theme, type === 'battle' ? 'battle' : 'idle')
  badge(ctx, x + 24, y + h - 50, type.toUpperCase(), theme)
}

function drawTrainingScene(ctx, x, y, w, h, theme, data = {}) {
  const kind=String(data.trainingType||data.trainingStat||'attack').toLowerCase()
  const images=data.assetImages||{}
  const scene=ctx.createLinearGradient(x,y,x+w,y+h);scene.addColorStop(0,'#493523');scene.addColorStop(.52,'#271d17');scene.addColorStop(1,'#0d0c0b');ctx.fillStyle=scene;ctx.fillRect(x,y,w,h)
  ctx.fillStyle='rgba(222,170,103,.09)';ctx.fillRect(x,y+h*.58,w,h*.42)
  for(let i=0;i<6;i++){ctx.strokeStyle='rgba(230,218,191,.10)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x+w*(.10+i*.16),y+h*.58);ctx.lineTo(x+w*(.16+i*.16),y+h);ctx.stroke()}
  if(kind==='attack'){
    ctx.fillStyle='#6a4f39';roundRect(ctx,x+w*.68,y+h*.31,w*.20,h*.34,18,ctx.fillStyle)
    ctx.fillStyle='#4c382a';ctx.beginPath();ctx.arc(x+w*.78,y+h*.29,36,0,Math.PI*2);ctx.fill()
    if(!drawAsset(ctx,images.dumbbell,x+w*.13,y+h*.47,150,150)) drawDumbbell(ctx,x+w*.24,y+h*.66,.72,theme)
    text(ctx,'POWER DOJO',x+w*.5,y+44,12,theme.soft,'bold','center')
  }else if(kind==='defense'){
    ctx.fillStyle='#434d57';roundRect(ctx,x+w*.66,y+h*.29,w*.20,h*.36,16,ctx.fillStyle)
    if(!drawAsset(ctx,images.shield,x+w*.65,y+h*.31,138,150)) drawShield(ctx,x+w*.76,y+h*.45,.72,theme.accent2)
    text(ctx,'GUARDIAN HALL',x+w*.5,y+44,12,theme.soft,'bold','center')
  }else if(kind==='health'){
    sceneBackdrop(ctx,x,y,w,h,theme,'#354745','#0b0f10')
    ctx.fillStyle='#dbe8e5';roundRect(ctx,x+w*.61,y+h*.45,w*.25,50,12,ctx.fillStyle)
    if(images.potion) drawAsset(ctx,images.potion,x+w*.68,y+h*.24,82,100)
    ctx.fillStyle=theme.danger;roundRect(ctx,x+w*.66,y+h*.31,12,86,6,ctx.fillStyle);roundRect(ctx,x+w*.63,y+h*.35,72,12,6,ctx.fillStyle)
    drawCharacter(ctx,x+w*.28,y+h*.72,.80,theme,'idle')
    text(ctx,'VITALITY ROOM',x+w*.5,y+44,12,theme.soft,'bold','center')
  }else if(kind==='speed'){
    ctx.fillStyle='#27393f';roundRect(ctx,x+w*.10,y+h*.38,w*.80,h*.28,18,ctx.fillStyle)
    for(let i=0;i<7;i++) line(ctx,x+w*(.14+i*.11),y+h*.42,x+w*(.18+i*.11),y+h*.62,theme.accent2,3)
    drawCharacter(ctx,x+w*.52,y+h*.72,.76,theme,'battle')
    text(ctx,'VELOCITY TRACK',x+w*.5,y+44,12,theme.soft,'bold','center')
  }else{
    sceneBackdrop(ctx,x,y,w,h,theme,'#2b2539','#0b0911')
    drawStars(ctx,x,y,w,h,theme,22)
    if(!drawAsset(ctx,images.compass,x+w*.63,y+h*.26,108,108)) drawCompass(ctx,x+w*.72,y+h*.38,.72,theme)
    if(!drawAsset(ctx,images.coin,x+w*.16,y+h*.48,70,70)) drawCoin(ctx,x+w*.24,y+h*.55,.42,theme)
    drawCharacter(ctx,x+w*.48,y+h*.72,.76,theme,'idle')
    text(ctx,'FORTUNE CHAMBER',x+w*.5,y+44,12,theme.soft,'bold','center')
  }
  const label=kind.toUpperCase()
  badge(ctx,x+24,y+h-50,`${label} TRAINING`,theme,theme.accent)
}

function drawSlotScene(ctx,x,y,w,h,theme,data={}){
  sceneBackdrop(ctx,x,y,w,h,theme,'#332018','#0c0a08')
  glow(ctx,x+w*.5,y+h*.46,180,'rgba(246,201,111,.16)')
  drawSlotMachine(ctx,x+w*.50,y+h*.50,.94,theme,data.reels||['🍒','🍋','💎'],data.assetImages||{})
  text(ctx,'ROYAL REELS',x+w*.5,y+44,12,theme.soft,'bold','center')
  badge(ctx,x+24,y+h-50,'SLOT FLOOR',theme,theme.gold)
}

function drawCasinoScene(ctx,x,y,w,h,theme,data={}){
  sceneBackdrop(ctx,x,y,w,h,theme,'#27192b','#09070b')
  for(let i=0;i<6;i++){
    ctx.fillStyle=i%2?theme.accent:theme.gold;ctx.beginPath();ctx.arc(x+w*(.14+i*.15),y+h*.26+(i%2)*16,8,0,Math.PI*2);ctx.fill()
  }
  roundRect(ctx,x+w*.18,y+h*.40,w*.64,h*.27,26,'#17302a')
  ctx.fillStyle=theme.gold;ctx.beginPath();ctx.ellipse(x+w*.5,y+h*.54,128,54,0,0,Math.PI*2);ctx.fill()
  drawCoin(ctx,x+w*.42,y+h*.53,.44,theme);drawCoin(ctx,x+w*.58,y+h*.53,.44,theme)
  text(ctx,'HIGH STAKES TABLE',x+w*.5,y+44,12,theme.soft,'bold','center')
  badge(ctx,x+24,y+h-50,'CASINO',theme,theme.gold)
}

function drawCoinflipScene(ctx,x,y,w,h,theme,data={}){
  sceneBackdrop(ctx,x,y,w,h,theme,'#20202a','#0a0a0d')
  glow(ctx,x+w*.5,y+h*.45,170,theme.glow)
  const side=String(data.outcome||'HEADS').toUpperCase()
  drawCoin(ctx,x+w*.5,y+h*.49,.92,theme)
  text(ctx,side,x+w*.5,y+h*.68,18,theme.gold,'bold','center')
  text(ctx,'FORTUNE FLIP',x+w*.5,y+44,12,theme.soft,'bold','center')
  badge(ctx,x+24,y+h-50,'COIN FLIP',theme,theme.gold)
}

function drawDiceScene(ctx,x,y,w,h,theme,data={}){
  sceneBackdrop(ctx,x,y,w,h,theme,'#252029','#0a090c')
  glow(ctx,x+w*.5,y+h*.44,150,theme.glow)
  const value=Math.max(1,Math.min(6,Number(data.value||data.roll||data.result||6)))
  const images=data.assetImages||{}
  const dieImage=images[`dice${value}`] || images.dice
  if(!drawAsset(ctx,dieImage,x+w*.28,y+h*.24,w*.44,h*.40)) drawDie(ctx,x+w*.5,y+h*.47,.82,theme,value)
  text(ctx,`ROLL ${value}`,x+w*.5,y+h*.70,16,theme.accent2,'bold','center')
  text(ctx,'DICE TABLE',x+w*.5,y+44,12,theme.soft,'bold','center')
  badge(ctx,x+24,y+h-50,'DICE',theme,theme.accent)
}

function drawLotteryScene(ctx,x,y,w,h,theme,data={}){
  sceneBackdrop(ctx,x,y,w,h,theme,'#2c1e2c','#0b090d')
  const images=data.assetImages||{}
  const items=Array.isArray(data.items)?data.items.slice(0,4):[]
  if(items.length){
    const count=items.length
    items.forEach((item,i)=>{
      const px=count===1?x+w*.50:count===2?x+w*(.35+i*.30):x+w*(.22+i*.19)
      const key=inferItemAsset(item.key||item.name)
      if(!drawAsset(ctx,images[key],px-42,y+h*.39,84,84)) drawFallbackAsset(ctx,key,px,y+h*.48,.40,theme)
      text(ctx,clampText(item.name||key,12),px,y+h*.57,9,theme.soft,'bold','center')
      text(ctx,`×${number(item.amount||item.count||1)}`,px,y+h*.60,11,theme.gold,'bold','center')
    })
  }else{
    drawTreasureChest(ctx,x+w*.5,y+h*.56,.90,theme)
  }
  for(let i=0;i<8;i++) spark(ctx,x+w*(.18+i*.09),y+h*(.28+(i%2)*.07),6,i%2?theme.gold:theme.accent2,.72)
  text(ctx,'LUCKY DRAW',x+w*.5,y+44,12,theme.soft,'bold','center')
  badge(ctx,x+24,y+h-50,'LOTTERY',theme,theme.gold)
}

function drawParkingScene(ctx,x,y,w,h,theme,data={}){
  const g=ctx.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#1b3945');g.addColorStop(.55,'#16252b');g.addColorStop(1,'#0a1114');ctx.fillStyle=g;ctx.fillRect(x,y,w,h)
  ctx.fillStyle='#27343a';ctx.fillRect(x,y+h*.46,w,h*.54)
  for(let i=0;i<3;i++){
    const sx=x+w*(.10+i*.31)
    ctx.strokeStyle='rgba(235,239,232,.36)';ctx.lineWidth=5;ctx.strokeRect(sx,y+h*.56,w*.22,h*.26)
    text(ctx,`P-${i+1}`,sx+w*.11,y+h*.60,10,theme.soft,'bold','center')
  }
  const slotIndex=Math.max(0,Math.min(2,Number(data.slotIndex||1)-1))
  const cx=x+w*(.10+slotIndex*.31)+w*.11
  const images=data.assetImages||{}
  if(!drawAsset(ctx,images.car,cx-76,y+h*.56,152,104)) drawCar(ctx,cx,y+h*.69,.72,theme)
  if(!drawAsset(ctx,images.parking,x+w*.75,y+h*.23,108,132)) drawParkingSign(ctx,x+w*.82,y+h*.34,.72,theme)
  ctx.fillStyle='#e6dfc9';ctx.fillRect(x+w*.50,y+h*.49,4,18)
  ctx.fillStyle=theme.accent2;roundRect(ctx,x+w*.50,y+h*.25,w*.10,36,10,ctx.fillStyle)
  text(ctx,'P',x+w*.55,y+h*.275,16,'#0b1518','bold','center')
  if(data.earning||data.penalty){text(ctx,data.earning?`+${rupiah(data.earning)}`:`-${rupiah(data.penalty)}`,x+w*.50,y+h*.42,14,data.earning?theme.success:theme.danger,'bold','center')}
  text(ctx,'PARKING DISTRICT',x+w*.5,y+44,12,theme.soft,'bold','center')
  badge(ctx,x+24,y+h-50,'PARKING',theme,theme.accent)
}

function drawBankScene(ctx, x, y, w, h, theme, data = {}) {
  const g = ctx.createLinearGradient(x, y, x, y + h)
  g.addColorStop(0, theme.raised)
  g.addColorStop(1, theme.bg)
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  softOrb(ctx, x + w * 0.5, y + h * 0.32, 180, theme.gold, 0.12)
  raised(ctx, x + 68, y + 128, w - 136, 230, 36, theme, 13)
  inset(ctx, x + 102, y + 164, w - 204, 150, 28, theme, 8)
  ctx.fillStyle = theme.gold
  ctx.beginPath()
  ctx.arc(x + w * 0.5, y + 238, 42, 0, Math.PI * 2)
  ctx.fill()
  text(ctx, 'Q', x + w * 0.5, y + 253, 34, '#ffffff', 'bold', 'center')
  neumorphicChip(ctx, x + 76, y + 400, 150, 42, 'CASH', 'WALLET', theme, theme.success)
  neumorphicChip(ctx, x + w - 226, y + 400, 150, 42, 'BANK', 'VAULT', theme, theme.gold)
  const key = String(data.featureKey || 'bank').toLowerCase()
  const title = key === 'loan' ? 'ADVENTURE CREDIT DESK' : key === 'insurance' ? 'RISK COVERAGE DESK' : key === 'transfer' ? 'SECURE TRANSFER' : key === 'buykoin' ? 'EXCHANGE COUNTER' : 'RPG BANK'
  text(ctx, title, x + w * 0.5, y + 44, 12, theme.muted, 'bold', 'center')
  if (key === 'loan' || key === 'insurance' || key === 'transfer' || key === 'buykoin') drawCoin(ctx, x + w * 0.50, y + h * 0.70, 0.52, theme)
  badge(ctx, x + 24, y + h - 50, key === 'loan' ? 'LOAN' : key === 'insurance' ? 'INSURANCE' : key === 'transfer' ? 'TRANSFER' : 'BANK', theme, theme.gold)
}

function drawQuestScene(ctx, x, y, w, h, theme, data = {}) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h)
  g.addColorStop(0, theme.raised)
  g.addColorStop(0.5, theme.surface)
  g.addColorStop(1, theme.bg)
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
  softOrb(ctx, x + w * 0.5, y + h * 0.28, 190, theme.accent, 0.12)
  raised(ctx, x + 80, y + 120, w - 160, 290, 32, theme, 13)
  inset(ctx, x + 108, y + 148, w - 216, 234, 24, theme, 8)
  const images = data.assetImages || {}
  if (!drawAsset(ctx, images.scroll, x + w * 0.30, y + 168, w * 0.40, 150)) {
    ctx.fillStyle = theme.gold
    ctx.beginPath()
    ctx.moveTo(x + w * 0.5, y + 172)
    ctx.lineTo(x + w * 0.5 + 56, y + 208)
    ctx.lineTo(x + w * 0.5 + 38, y + 292)
    ctx.lineTo(x + w * 0.5, y + 320)
    ctx.lineTo(x + w * 0.5 - 38, y + 292)
    ctx.lineTo(x + w * 0.5 - 56, y + 208)
    ctx.closePath()
    ctx.fill()
    text(ctx, '!', x + w * 0.5, y + 275, 58, '#ffffff', 'bold', 'center')
  }
  if (data.questName) text(ctx, clampText(data.questName, 23), x + w * 0.5, y + 328, 12, theme.ink, 'bold', 'center')
  text(ctx, 'QUEST BOARD', x + w * 0.5, y + 44, 12, theme.muted, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, 'QUEST', theme, theme.accent)
}


function drawAlchemyScene(ctx, x, y, w, h, theme) {
  const g = ctx.createLinearGradient(x, y, x + w, y + h)
  g.addColorStop(0, '#34313b'); g.addColorStop(0.55, '#211f27'); g.addColorStop(1, '#0b0c10')
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h)
  softOrb(ctx, x + w * .52, y + h * .32, 180, theme.accent, .16)
  raised(ctx, x + 70, y + 115, w - 140, 260, 34, theme, 12)
  inset(ctx, x + 96, y + 145, w - 192, 205, 28, theme, 8)
  drawPotion(ctx, x + w*.25, y+h*.48, .95, theme.accent)
  drawPotion(ctx, x + w*.50, y+h*.40, 1.15, theme.accent2)
  drawPotion(ctx, x + w*.75, y+h*.50, .82, theme.gold)
  for (let i=0;i<8;i++) spark(ctx, x+w*(.16+i*.1), y+h*(.68+(i%2)*.06), 4+(i%3)*2, i%2?theme.accent2:theme.accent, .65)
  text(ctx, 'ARCANE LABORATORY', x+w*.5, y+44, 12, theme.soft, 'bold', 'center')
  badge(ctx, x+24, y+h-50, 'ALCHEMY', theme, theme.accent)
}

function drawForgeScene(ctx, x, y, w, h, theme) {
  const g=ctx.createLinearGradient(x,y,x+w,y+h); g.addColorStop(0,'#383236');g.addColorStop(.55,'#211e21');g.addColorStop(1,'#0b0b0d');ctx.fillStyle=g;ctx.fillRect(x,y,w,h)
  glow(ctx,x+w*.5,y+h*.55,180,'rgba(255,151,91,.18)')
  raised(ctx,x+62,y+115,w-124,270,34,theme,12); inset(ctx,x+88,y+143,w-176,215,28,theme,8)
  ctx.fillStyle='#4a3a31'; roundRect(ctx,x+120,y+270,w-240,42,16,ctx.fillStyle)
  drawCharacter(ctx,x+w*.5,y+h*.69,.86,theme,'miner')
  ctx.strokeStyle='#e7d5bc';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(x+w*.64,y+h*.46);ctx.lineTo(x+w*.80,y+h*.27);ctx.stroke()
  glow(ctx,x+w*.8,y+h*.27,60,'rgba(255,184,117,.24)'); spark(ctx,x+w*.8,y+h*.27,13,theme.gold,.9)
  text(ctx,'ROYAL FORGE',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'BLACKSMITH',theme,theme.gold)
}

function drawCookingScene(ctx, x, y, w, h, theme, data = {}) {
  const g=ctx.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#34302a');g.addColorStop(.5,'#211e1b');g.addColorStop(1,'#0c0c0d');ctx.fillStyle=g;ctx.fillRect(x,y,w,h)
  softOrb(ctx,x+w*.5,y+h*.32,180,theme.gold,.14); raised(ctx,x+64,y+120,w-128,260,34,theme,12); inset(ctx,x+90,y+148,w-180,205,28,theme,8)
  ctx.fillStyle='#6f5137';roundRect(ctx,x+112,y+270,w-224,30,15,ctx.fillStyle)
  const images=data.assetImages||{}
  if(!drawAsset(ctx,images.food||images.ramen,x+w*.25-46,y+h*.39,92,88)) drawFood(ctx,x+w*.25,y+h*.48,.8,theme)
  if(!drawAsset(ctx,images.ramen||images.food,x+w*.75-46,y+h*.39,92,88)) drawFood(ctx,x+w*.75,y+h*.48,.8,theme)
  drawCharacter(ctx,x+w*.5,y+h*.70,.82,theme,'idle')
  for(let i=0;i<7;i++){ctx.fillStyle='rgba(245,245,245,.22)';ctx.beginPath();ctx.arc(x+w*.48+i*7,y+h*(.30-(i%3)*.025),3,0,Math.PI*2);ctx.fill()}
  text(ctx,'HEARTH & TABLE',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'COOKING',theme,theme.gold)
}

function drawGardenScene(ctx, x, y, w, h, theme, data = {}) {
  const g=ctx.createLinearGradient(x,y,x,y+h);g.addColorStop(0,'#30352f');g.addColorStop(.5,'#1d241e');g.addColorStop(1,'#0a0d0b');ctx.fillStyle=g;ctx.fillRect(x,y,w,h)
  drawClouds(ctx,x,y,w,h); drawStars(ctx,x,y,w,h,theme,16)
  ctx.fillStyle='#4d3d2c';roundRect(ctx,x+50,y+h*.55,w-100,h*.26,28,ctx.fillStyle)
  for(let i=0;i<12;i++){const px=x+90+(i%6)*72,py=y+h*.62+Math.floor(i/6)*65;ctx.fillStyle=i%3?theme.success:theme.accent2;ctx.beginPath();ctx.arc(px,py,12+(i%3)*4,0,Math.PI*2);ctx.fill();ctx.strokeStyle=theme.soft;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(px,py+8);ctx.lineTo(px-8,py+28);ctx.moveTo(px,py+8);ctx.lineTo(px+10,py+24);ctx.stroke()}
  const images=data.assetImages||{}
  for(let i=0;i<8;i++){
    const px=x+104+(i%4)*84, py=y+h*.64+Math.floor(i/4)*74
    if(!drawAsset(ctx,images.wheat||images.flower,px-22,py-24,44,48)) drawGroundPlants(ctx,px-16,py-18,32,38,theme,1)
  }
  drawCharacter(ctx,x+w*.76,y+h*.73,.64,theme,'idle');text(ctx,'MOONLIT GARDEN',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'GARDEN',theme,theme.success)
}

function drawPetScene(ctx, x, y, w, h, theme, data = {}) {
  const key = String(data.featureKey || 'pet').toLowerCase()
  const images = data.assetImages || {}
  if(key==='petshop'){
    sceneBackdrop(ctx,x,y,w,h,theme,'#2b3032','#0b0d0f')
    for(let i=0;i<3;i++){const bx=x+55+i*130;raised(ctx,bx,y+145,104,220,22,theme,8);inset(ctx,bx+12,y+165,80,116,18,theme,5);const asset=[images.rabbit,images.lion,images.pet][i];if(!drawAsset(ctx,asset,bx+18,y+175,68,90)) drawFallbackAsset(ctx,['rabbit','lion','pet'][i],bx+52,y+220,.45,theme);text(ctx,['BUDDY','GUARDIAN','MYTHIC'][i],bx+52,y+315,10,theme.ink,'bold','center')}
    drawCharacter(ctx,x+w*.50,y+h*.77,.46,theme,'idle')
    text(ctx,'COMPANION MARKET',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'PET SHOP',theme,theme.accent2)
    return
  }
  if(key==='petarena'){
    sceneBackdrop(ctx,x,y,w,h,theme,'#30262f','#0b090d');
    ctx.fillStyle='#493b42';ctx.beginPath();ctx.ellipse(x+w*.5,y+h*.58,w*.35,h*.16,0,0,Math.PI*2);ctx.fill();
    drawCharacter(ctx,x+w*.28,y+h*.73,.56,theme,'battle');drawCharacter(ctx,x+w*.72,y+h*.73,.56,theme,'battle');
    if(images.shield) drawAsset(ctx,images.shield,x+w*.42,y+h*.36,72,82);
    for(let i=0;i<8;i++) spark(ctx,x+w*(.22+i*.08),y+h*(.39+(i%2)*.07),5, i%2?theme.accent2:theme.gold,.70)
    text(ctx,'PET ARENA',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'PET ARENA',theme,theme.danger);
    return
  }
  const g=ctx.createRadialGradient(x+w*.5,y+h*.4,20,x+w*.5,y+h*.4,w*.7);g.addColorStop(0,'#343440');g.addColorStop(.55,'#211f29');g.addColorStop(1,'#0b0b0f');ctx.fillStyle=g;ctx.fillRect(x,y,w,h)
  softOrb(ctx,x+w*.5,y+h*.4,180,theme.accent2,.14);drawStars(ctx,x,y,w,h,theme,24)
  raised(ctx,x+72,y+118,w-144,290,36,theme,12);inset(ctx,x+96,y+146,w-192,236,28,theme,8)
  const px=x+w*.5,py=y+h*.53;ctx.fillStyle=theme.accent;ctx.beginPath();ctx.arc(px,py,72,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f4d8c2';ctx.beginPath();ctx.arc(px,py-12,42,0,Math.PI*2);ctx.fill();ctx.fillStyle='#25232c';ctx.beginPath();ctx.arc(px-16,py-18,5,0,Math.PI*2);ctx.arc(px+16,py-18,5,0,Math.PI*2);ctx.fill();ctx.fillStyle=theme.accent2;ctx.beginPath();ctx.moveTo(px-34,py-45);ctx.lineTo(px-52,py-76);ctx.lineTo(px-10,py-58);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(px+34,py-45);ctx.lineTo(px+52,py-76);ctx.lineTo(px+10,py-58);ctx.closePath();ctx.fill()
  text(ctx,'COMPANION SANCTUARY',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'PET',theme,theme.accent2)
}

function drawGuildScene(ctx, x, y, w, h, theme, data = {}) {
  const g=ctx.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#34312c');g.addColorStop(.5,'#201f1d');g.addColorStop(1,'#0b0c0e');ctx.fillStyle=g;ctx.fillRect(x,y,w,h)
  glow(ctx,x+w*.5,y+h*.34,190,'rgba(228,196,125,.16)');raised(ctx,x+72,y+115,w-144,300,38,theme,12);inset(ctx,x+96,y+145,w-192,238,30,theme,8)
  const images=data.assetImages||{}
  if(!drawAsset(ctx,images.shield,x+w*.5-64,y+h*.28,128,150)){
    ctx.fillStyle=theme.gold;ctx.beginPath();ctx.moveTo(x+w*.5,y+h*.27);ctx.lineTo(x+w*.65,y+h*.46);ctx.lineTo(x+w*.58,y+h*.66);ctx.lineTo(x+w*.42,y+h*.66);ctx.lineTo(x+w*.35,y+h*.46);ctx.closePath();ctx.fill()
  }
  if(data.guildName) text(ctx,clampText(data.guildName,22),x+w*.5,y+h*.76,12,theme.ink,'bold','center')
  text(ctx,'GUILD HALL',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'GUILD',theme,theme.gold)
}

function drawTreasureScene(ctx, x, y, w, h, theme) {
  const g=ctx.createRadialGradient(x+w*.5,y+h*.42,20,x+w*.5,y+h*.42,w*.75);g.addColorStop(0,'#403628');g.addColorStop(.5,'#211d18');g.addColorStop(1,'#090a0c');ctx.fillStyle=g;ctx.fillRect(x,y,w,h)
  drawStars(ctx,x,y,w,h,theme,30);glow(ctx,x+w*.5,y+h*.53,190,'rgba(242,207,121,.18)');drawTreasureChest(ctx,x+w*.5,y+h*.57,1.05,theme);drawCharacter(ctx,x+w*.5,y+h*.82,.48,theme,'idle');
  for(let i=0;i<10;i++)spark(ctx,x+w*(.18+i*.07),y+h*(.34+(i%4)*.05),4+(i%3)*2,theme.gold,.75)
  text(ctx,'ANCIENT TREASURE',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'TREASURE',theme,theme.gold)
}

function drawWoodcutScene(ctx, x, y, w, h, theme, data = {}) {
  const g=ctx.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#30362f');g.addColorStop(.5,'#1d251f');g.addColorStop(1,'#0a0e0b');ctx.fillStyle=g;ctx.fillRect(x,y,w,h)
  drawStars(ctx,x,y,w,h,theme,18);drawTree(ctx,x+w*.2,y+h*.52,.95,theme);drawTree(ctx,x+w*.78,y+h*.5,.9,theme);drawCharacter(ctx,x+w*.5,y+h*.72,.84,theme,'miner');
  const images=data.assetImages||{}
  if(!drawAsset(ctx,images.axe,x+w*.34,y+h*.48,78,108)) drawFallbackAsset(ctx,'axe',x+w*.38,y+h*.56,.5,theme)
  for(let i=0;i<8;i++)spark(ctx,x+w*(.38+i*.045),y+h*(.48+i*.025),4,theme.gold,.55)
  text(ctx,'ANCIENT GROVE',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'WOODCUT',theme,theme.success)
}


function sceneBackdrop(ctx, x, y, w, h, theme, top, bottom) {
  const g = ctx.createLinearGradient(x, y, x, y + h)
  g.addColorStop(0, top || theme.raised)
  g.addColorStop(0.55, theme.surface)
  g.addColorStop(1, bottom || theme.bg)
  ctx.fillStyle = g
  ctx.fillRect(x, y, w, h)
}

function drawAtlasScene(ctx, x, y, w, h, theme) {
  sceneBackdrop(ctx, x, y, w, h, theme, '#303344', '#0b0c11')
  glow(ctx, x + w * 0.5, y + h * 0.42, 210, theme.glow)
  ctx.strokeStyle = theme.accent2
  ctx.lineWidth = 3
  ctx.globalAlpha = 0.45
  for (let i = 0; i < 6; i++) {
    ctx.beginPath()
    ctx.arc(x + w * 0.5, y + h * 0.44, 42 + i * 34, -0.2, Math.PI * 1.45)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  ctx.fillStyle = theme.success
  ctx.beginPath()
  ctx.moveTo(x + w * 0.28, y + h * 0.58)
  ctx.quadraticCurveTo(x + w * 0.40, y + h * 0.36, x + w * 0.54, y + h * 0.56)
  ctx.quadraticCurveTo(x + w * 0.67, y + h * 0.38, x + w * 0.78, y + h * 0.61)
  ctx.lineTo(x + w * 0.70, y + h * 0.76)
  ctx.lineTo(x + w * 0.34, y + h * 0.76)
  ctx.closePath()
  ctx.globalAlpha = 0.5
  ctx.fill()
  ctx.globalAlpha = 1
  for (const [px, py] of [[.33,.60],[.5,.48],[.68,.60]]) {
    ctx.fillStyle = theme.gold
    ctx.beginPath(); ctx.arc(x + w * px, y + h * py, 9, 0, Math.PI * 2); ctx.fill()
  }
  text(ctx, 'WORLD ATLAS', x + w * 0.5, y + 44, 12, theme.soft, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, 'ATLAS', theme, theme.accent2)
}

function drawTravelScene(ctx, x, y, w, h, theme, mode = 'voyage') {
  const g = ctx.createLinearGradient(x, y, x, y + h)
  g.addColorStop(0, '#223849'); g.addColorStop(0.5, '#16232d'); g.addColorStop(1, '#091015')
  ctx.fillStyle = g; ctx.fillRect(x, y, w, h)
  drawClouds(ctx, x, y, w, h)
  drawWater(ctx, x, y + h * 0.20, w, h * 0.80, theme)
  ctx.fillStyle = '#5e4a3c'
  ctx.beginPath(); ctx.moveTo(x + w * .06, y + h * .52); ctx.lineTo(x + w * .30, y + h * .35); ctx.lineTo(x + w * .48, y + h * .53); ctx.lineTo(x + w * .20, y + h * .62); ctx.closePath(); ctx.fill()
  ctx.fillStyle = '#332a27'; roundRect(ctx, x + w * .42, y + h * .54, w * .26, 18, 9, ctx.fillStyle)
  ctx.fillStyle = theme.soft; ctx.beginPath(); ctx.moveTo(x+w*.52,y+h*.54);ctx.lineTo(x+w*.52,y+h*.34);ctx.lineTo(x+w*.62,y+h*.48);ctx.closePath();ctx.fill()
  ctx.fillStyle = theme.accent2; ctx.beginPath(); ctx.arc(x+w*.54,y+h*.34,5,0,Math.PI*2);ctx.fill()
  text(ctx, mode === 'portal' ? 'AETHER ROUTE' : 'BLUEWATER ROUTE', x + w * .5, y + 44, 12, theme.soft, 'bold', 'center')
  badge(ctx, x + 24, y + h - 50, mode === 'portal' ? 'PORTAL' : 'VOYAGE', theme, theme.accent2)
}

function drawCampScene(ctx, x, y, w, h, theme) {
  sceneBackdrop(ctx, x, y, w, h, theme, '#343129', '#0c0c0d')
  drawStars(ctx, x, y, w, h, theme, 34)
  ctx.fillStyle = '#423126'; ctx.beginPath();ctx.ellipse(x+w*.5,y+h*.73,w*.38,32,0,0,Math.PI*2);ctx.fill()
  for (const dx of [-42,-22,0,22,42]) {
    ctx.fillStyle = dx % 2 ? '#8d5d3b' : theme.gold
    ctx.beginPath();ctx.arc(x+w*.5+dx,y+h*.66-Math.abs(dx)*.12,9+Math.abs(dx)/8,0,Math.PI*2);ctx.fill()
  }
  ctx.strokeStyle = '#6e4a33'; ctx.lineWidth = 12; ctx.beginPath();ctx.moveTo(x+w*.5-68,y+h*.73);ctx.lineTo(x+w*.5+64,y+h*.73);ctx.stroke()
  drawCharacter(ctx, x + w * .5, y + h * .64, .66, theme, 'idle')
  glow(ctx, x+w*.5,y+h*.56,110,'rgba(255,174,81,.20)')
  text(ctx, 'CAMPFIRE HAVEN', x+w*.5, y+44, 12, theme.soft, 'bold','center'); badge(ctx,x+24,y+h-50,'RECOVERY',theme,theme.gold)
}

function drawMagicScene(ctx, x, y, w, h, theme) {
  sceneBackdrop(ctx, x, y, w, h, theme, '#302747', '#0a0911')
  drawStars(ctx, x, y, w, h, theme, 42)
  glow(ctx,x+w*.5,y+h*.47,190,theme.glow)
  drawRunes(ctx,x+w*.5,y+h*.47,122,theme,10)
  ctx.fillStyle='rgba(8,7,14,.82)';ctx.beginPath();ctx.moveTo(x+w*.5,y+h*.78);ctx.lineTo(x+w*.24,y+h*.74);ctx.lineTo(x+w*.36,y+h*.60);ctx.lineTo(x+w*.64,y+h*.60);ctx.lineTo(x+w*.76,y+h*.74);ctx.closePath();ctx.fill()
  ctx.fillStyle=theme.accent2;ctx.beginPath();ctx.moveTo(x+w*.5,y+h*.26);ctx.lineTo(x+w*.56,y+h*.43);ctx.lineTo(x+w*.5,y+h*.54);ctx.lineTo(x+w*.44,y+h*.43);ctx.closePath();ctx.fill()
  text(ctx,'ARCANE SHRINE',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'MAGIC',theme,theme.accent)
}

function drawRuinScene(ctx, x, y, w, h, theme) {
  sceneBackdrop(ctx, x, y, w, h, theme, '#2c2c36', '#0a0b10')
  drawStars(ctx,x,y,w,h,theme,24)
  for (const dx of [0,.24,.74,.94]) {
    ctx.fillStyle='#45464e'; roundRect(ctx,x+w*dx,y+h*.34,w*.10,h*.42,16,ctx.fillStyle)
    ctx.fillStyle='#2d2d34'; roundRect(ctx,x+w*dx+12,y+h*.37,w*.10-24,h*.39,10,ctx.fillStyle)
  }
  ctx.strokeStyle=theme.accent;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+w*.42,y+h*.63);ctx.lineTo(x+w*.5,y+h*.44);ctx.lineTo(x+w*.58,y+h*.63);ctx.stroke()
  drawCharacter(ctx,x+w*.5,y+h*.72,.72,theme,'idle')
  text(ctx,'DUSK RUINS',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'RUINS',theme,theme.accent)
}

function drawArchiveScene(ctx, x, y, w, h, theme, label='ARCHIVE') {
  sceneBackdrop(ctx,x,y,w,h,theme,'#39332a','#0b0b0e')
  const cols=4, rows=2
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) {
    const sx=x+70+c*82, sy=y+140+r*104
    raised(ctx,sx,sy,60,76,16,theme,5); inset(ctx,sx+12,sy+12,36,52,11,theme,3)
    ctx.fillStyle=[theme.gold,theme.accent,theme.accent2,theme.success][(r*cols+c)%4];ctx.fillRect(sx+22,sy+25,16,22)
  }
  drawTreasureChest(ctx,x+w*.5,y+h*.70,.65,theme)
  text(ctx,label,x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'ARCHIVE',theme,theme.gold)
}

function drawTowerScene(ctx,x,y,w,h,theme){
  sceneBackdrop(ctx,x,y,w,h,theme,'#2d3144','#090b12');drawStars(ctx,x,y,w,h,theme,30)
  for(let i=0;i<5;i++){const bx=x+w*.22+i*w*.11,by=y+h*(.68-i*.08);ctx.fillStyle='#4a4e61';ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+38,by-120-i*9);ctx.lineTo(bx+76,by);ctx.closePath();ctx.fill();ctx.fillStyle=theme.accent2;ctx.fillRect(bx+30,by-96-i*9,16,5)}
  ctx.fillStyle=theme.gold;ctx.beginPath();ctx.moveTo(x+w*.5,y+h*.17);ctx.lineTo(x+w*.56,y+h*.30);ctx.lineTo(x+w*.5,y+h*.41);ctx.lineTo(x+w*.44,y+h*.30);ctx.closePath();ctx.fill()
  text(ctx,'SKY TOWER',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'ASCENT',theme,theme.accent)
}

function drawBoardScene(ctx,x,y,w,h,theme){
  sceneBackdrop(ctx,x,y,w,h,theme,'#3b3327','#0b0c0e');drawClouds(ctx,x,y,w,h)
  raised(ctx,x+74,y+110,w-148,320,32,theme,11);inset(ctx,x+104,y+140,w-208,262,24,theme,7)
  ctx.fillStyle='#89633f';roundRect(ctx,x+146,y+172,w-292,162,20,ctx.fillStyle)
  for(let i=0;i<4;i++){ctx.fillStyle=i%2?theme.accent2:theme.gold;roundRect(ctx,x+170,y+198+i*32,90+(i%3)*24,12,6,ctx.fillStyle)}
  ctx.fillStyle=theme.success;ctx.beginPath();ctx.arc(x+w*.74,y+h*.30,24,0,Math.PI*2);ctx.fill()
  text(ctx,'CONTRACT BOARD',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'BOUNTY',theme,theme.gold)
}

function drawDungeonScene(ctx,x,y,w,h,theme){
  sceneBackdrop(ctx,x,y,w,h,theme,'#25232d','#07080b');
  ctx.fillStyle='rgba(7,7,11,.74)';ctx.beginPath();ctx.moveTo(x,y+h);ctx.lineTo(x,y+h*.34);ctx.lineTo(x+w*.18,y+h*.18);ctx.lineTo(x+w*.35,y+h*.36);ctx.lineTo(x+w*.58,y+h*.14);ctx.lineTo(x+w,y+h*.31);ctx.lineTo(x+w,y+h);ctx.closePath();ctx.fill()
  drawRunes(ctx,x+w*.5,y+h*.48,150,theme,12);glow(ctx,x+w*.5,y+h*.48,150,'rgba(185,173,244,.16)')
  drawCharacter(ctx,x+w*.5,y+h*.72,.74,theme,'battle')
  text(ctx,'DUNGEON DEPTHS',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'DUNGEON',theme,theme.danger)
}

function drawFarmScene(ctx,x,y,w,h,theme){
  sceneBackdrop(ctx,x,y,w,h,theme,'#364036','#0b0f0b');drawClouds(ctx,x,y,w,h)
  ctx.fillStyle='#59452f';roundRect(ctx,x+44,y+h*.52,w-88,h*.27,26,ctx.fillStyle)
  for(let i=0;i<16;i++){const px=x+80+(i%8)*74,py=y+h*.60+Math.floor(i/8)*56;ctx.strokeStyle=theme.success;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(px,py+28);ctx.lineTo(px-8,py);ctx.moveTo(px,py+25);ctx.lineTo(px+10,py+5);ctx.stroke();ctx.fillStyle=theme.gold;ctx.beginPath();ctx.arc(px,py,7,0,Math.PI*2);ctx.fill()}
  drawCharacter(ctx,x+w*.76,y+h*.72,.62,theme,'idle');text(ctx,'HARVEST FIELDS',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'FARM',theme,theme.success)
}

function drawRanchScene(ctx,x,y,w,h,theme){
  sceneBackdrop(ctx,x,y,w,h,theme,'#3a362d','#0b0d0c');drawClouds(ctx,x,y,w,h)
  ctx.fillStyle='#72573e';ctx.fillRect(x+w*.16,y+h*.50,w*.68,8);ctx.fillRect(x+w*.18,y+h*.64,w*.64,8)
  for(let i=0;i<5;i++){ctx.fillStyle='#85694b';ctx.fillRect(x+w*(.20+i*.15),y+h*.44,7,h*.25)}
  ctx.fillStyle='#e9d4af';ctx.beginPath();ctx.ellipse(x+w*.52,y+h*.53,52,34,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#51443c';ctx.beginPath();ctx.arc(x+w*.57,y+h*.50,12,0,Math.PI*2);ctx.fill();ctx.fillStyle='#e9d4af';ctx.beginPath();ctx.arc(x+w*.62,y+h*.49,17,0,Math.PI*2);ctx.fill();
  text(ctx,'RANCH YARD',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'RANCH',theme,theme.success)
}

function drawTownScene(ctx,x,y,w,h,theme,label,accent=theme.gold){
  sceneBackdrop(ctx,x,y,w,h,theme,'#3b342c','#0b0c0e');
  for(let i=0;i<4;i++){const bx=x+46+i*w*.22,by=y+h*.72;ctx.fillStyle='#46382e';roundRect(ctx,bx,by-150-(i%2)*30,w*.17,150+(i%2)*30,18,ctx.fillStyle);ctx.fillStyle=theme.gold;ctx.beginPath();ctx.arc(bx+w*.085,by-94-(i%2)*30,16,0,Math.PI*2);ctx.fill()}
  ctx.fillStyle='#71533b';ctx.fillRect(x+w*.10,y+h*.76,w*.80,10)
  drawCharacter(ctx,x+w*.5,y+h*.72,.60,theme,'idle');text(ctx,label,x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,label.toUpperCase(),theme,accent)
}

function drawLibraryScene(ctx,x,y,w,h,theme){sceneBackdrop(ctx,x,y,w,h,theme,'#373042','#0b0b11');for(let i=0;i<5;i++){const bx=x+48+i*84;raised(ctx,bx,y+130,62,250,16,theme,6);for(let j=0;j<5;j++){ctx.fillStyle=[theme.accent,theme.gold,theme.success][(i+j)%3];roundRect(ctx,bx+12,y+160+j*36,38,8,4,ctx.fillStyle)}}drawStars(ctx,x,y,w,h,theme,18);text(ctx,'GRAND LIBRARY',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'LORE',theme,theme.accent)
}

function drawJournalScene(ctx,x,y,w,h,theme){sceneBackdrop(ctx,x,y,w,h,theme,'#38302d','#0c0c10');raised(ctx,x+88,y+118,w-176,310,28,theme,12);inset(ctx,x+114,y+146,w-228,252,20,theme,7);ctx.fillStyle='#7b634b';roundRect(ctx,x+w*.24,y+h*.28,w*.52,14,7,ctx.fillStyle);for(let i=0;i<7;i++){ctx.strokeStyle=i%2?theme.accent:theme.gold;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+w*.30,y+h*(.36+i*.045));ctx.lineTo(x+w*.70,y+h*(.36+i*.045));ctx.stroke()}text(ctx,'TRAVEL JOURNAL',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'JOURNAL',theme,theme.gold)
}

function drawPartyScene(ctx,x,y,w,h,theme){sceneBackdrop(ctx,x,y,w,h,theme,'#30373b','#0a0c0e');for(let i=0;i<3;i++){const cx=x+w*(.30+i*.20);raised(ctx,cx-54,y+h*.34,108,164,24,theme,8);drawCharacter(ctx,cx,y+h*.60,.47,theme,i===1?'battle':'idle')}text(ctx,'COMPANION PARTY',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'PARTY',theme,theme.accent2)
}

function drawWeatherScene(ctx,x,y,w,h,theme){sceneBackdrop(ctx,x,y,w,h,theme,'#294251','#0a1015');drawClouds(ctx,x,y,w,h);for(let i=0;i<18;i++){ctx.strokeStyle=theme.accent2;ctx.lineWidth=2;ctx.beginPath();const px=x+40+(i*71)%(w-80),py=y+h*.34+(i%6)*34;ctx.moveTo(px,py);ctx.lineTo(px-10,py+22);ctx.stroke()}glow(ctx,x+w*.68,y+h*.24,110,theme.glow);text(ctx,'WORLD WEATHER',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'CLIMATE',theme,theme.accent2)
}

function drawFestivalScene(ctx,x,y,w,h,theme){sceneBackdrop(ctx,x,y,w,h,theme,'#3a2932','#0b0a0e');for(let i=0;i<7;i++){const bx=x+w*(.13+i*.12);ctx.fillStyle=i%2?theme.accent2:theme.gold;ctx.beginPath();ctx.arc(bx,y+h*.30+(i%3)*22,9,0,Math.PI*2);ctx.fill();ctx.strokeStyle=theme.soft;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(bx,y+h*.30+(i%3)*22);ctx.lineTo(bx,y+h*.63);ctx.stroke()}for(let i=0;i<5;i++)spark(ctx,x+w*(.25+i*.12),y+h*.50,7,theme.accent,.7);text(ctx,'SEASONAL FESTIVAL',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'FESTIVAL',theme,theme.accent)
}

function drawMarketScene(ctx,x,y,w,h,theme,data={}){
  const key=String(data.featureKey||'market').toLowerCase()
  const isAuction=key==='auction'||key==='bid'
  sceneBackdrop(ctx,x,y,w,h,theme,isAuction?'#30251f':'#3a302d','#0b0c0e')
  const images=data.assetImages||{}
  const items=Array.isArray(data.items)?data.items.slice(0,3):[]
  if(isAuction){
    ctx.fillStyle='#624c39';roundRect(ctx,x+w*.10,y+h*.39,w*.80,h*.14,20,ctx.fillStyle)
    ctx.fillStyle='#2a2420';roundRect(ctx,x+w*.14,y+h*.46,w*.72,h*.20,18,ctx.fillStyle)
    const icon=images[key==='bid'?'sword':'hammer']
    if(icon) drawAsset(ctx,icon,x+w*.40,y+h*.43,92,92)
    else drawFallbackAsset(ctx,key==='bid'?'sword':'hammer',x+w*.46,y+h*.50,.58,theme)
    drawCoin(ctx,x+w*.71,y+h*.55,.38,theme)
    text(ctx,key==='bid'?'LIVE BID':'AUCTION HOUSE',x+w*.5,y+44,12,theme.soft,'bold','center')
    text(ctx,key==='bid'?'RAISE THE OFFER':'LOT GOES TO HIGHEST BIDDER',x+w*.5,y+h*.74,10,theme.muted,'bold','center')
    badge(ctx,x+24,y+h-50,key==='bid'?'BID FLOOR':'AUCTION',theme,theme.gold)
    return
  }
  const defaults=['coin','potion','sword']
  for(let i=0;i<3;i++){
    const bx=x+46+i*122
    raised(ctx,bx,y+130,100,248,22,theme,9)
    inset(ctx,bx+12,y+148,76,154,18,theme,6)
    const item=items[i]||null
    const itemKey=inferItemAsset(item?.key||item?.name||defaults[i])
    if(!drawAsset(ctx,images[itemKey],bx+18,y+166,64,118)) drawFallbackAsset(ctx,itemKey,bx+50,y+224,.52,theme)
    text(ctx,clampText(item?.name||['TRADE','GOODS','RELIC'][i],12),bx+14,y+330,11,theme.ink,'bold')
    if(item?.price) text(ctx,rupiah(item.price),bx+86,y+350,10,theme.gold,'bold','right')
    else text(ctx,'ACTIVE',bx+50,y+350,10,theme.muted,'bold','center')
  }
  drawCharacter(ctx,x+w*.78,y+h*.72,.55,theme,'idle')
  text(ctx,'TRAVELING MARKET',x+w*.5,y+44,12,theme.soft,'bold','center')
  badge(ctx,x+24,y+h-50,'MARKET',theme,theme.gold)
}

function drawHouseScene(ctx,x,y,w,h,theme,data={}){
  const key=String(data.featureKey||'house').toLowerCase()
  sceneBackdrop(ctx,x,y,w,h,theme,key==='furnish'?'#3a312c':'#34362f','#0b0d0c')
  if(key==='furnish'){
    ctx.fillStyle='#624a37';roundRect(ctx,x+w*.12,y+h*.48,w*.76,h*.28,20,ctx.fillStyle)
    ctx.fillStyle='#a07b57';roundRect(ctx,x+w*.20,y+h*.42,w*.24,h*.16,16,ctx.fillStyle)
    ctx.fillStyle='#6e8b8c';roundRect(ctx,x+w*.56,y+h*.42,w*.22,h*.16,16,ctx.fillStyle)
    if(!drawAsset(ctx,(data.assetImages||{}).house,x+w*.73,y+h*.22,84,92)) drawHouseIcon(ctx,x+w*.76,y+h*.31,.55,theme)
    drawFood(ctx,x+w*.32,y+h*.62,.55,theme)
    drawBook(ctx,x+w*.63,y+h*.62,.50,theme)
    drawCharacter(ctx,x+w*.47,y+h*.72,.50,theme,'idle')
    text(ctx,'ROOM DESIGN STUDIO',x+w*.5,y+44,12,theme.soft,'bold','center')
    badge(ctx,x+24,y+h-50,'FURNISH',theme,theme.accent)
    return
  }
  ctx.fillStyle='#68543e';ctx.beginPath();ctx.moveTo(x+w*.21,y+h*.55);ctx.lineTo(x+w*.5,y+h*.30);ctx.lineTo(x+w*.79,y+h*.55);ctx.closePath();ctx.fill();roundRect(ctx,x+w*.27,y+h*.53,w*.46,h*.24,16,'#4e4035')
  ctx.fillStyle=theme.gold;roundRect(ctx,x+w*.46,y+h*.61,w*.08,h*.16,8,ctx.fillStyle);ctx.fillStyle=theme.accent2;roundRect(ctx,x+w*.33,y+h*.59,w*.10,h*.08,8,ctx.fillStyle);roundRect(ctx,x+w*.57,y+h*.59,w*.10,h*.08,8,ctx.fillStyle)
  text(ctx,'PLAYER HOUSE',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'HOME',theme,theme.gold)
}

function drawOutpostScene(ctx,x,y,w,h,theme){sceneBackdrop(ctx,x,y,w,h,theme,'#303a2f','#090c09');ctx.fillStyle='#4f5a49';roundRect(ctx,x+w*.29,y+h*.40,w*.42,h*.25,18,ctx.fillStyle);ctx.fillStyle='#a88b58';ctx.beginPath();ctx.moveTo(x+w*.28,y+h*.40);ctx.lineTo(x+w*.50,y+h*.25);ctx.lineTo(x+w*.72,y+h*.40);ctx.closePath();ctx.fill();for(let i=0;i<3;i++){ctx.strokeStyle=theme.accent2;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+w*(.34+i*.12),y+h*.38);ctx.lineTo(x+w*(.34+i*.12),y+h*.68);ctx.stroke()}drawCharacter(ctx,x+w*.50,y+h*.72,.55,theme,'hunter');text(ctx,'FRONTIER OUTPOST',x+w*.5,y+44,12,theme.soft,'bold','center');badge(ctx,x+24,y+h-50,'OUTPOST',theme,theme.success)
}

function drawClinicScene(ctx,x,y,w,h,theme){
  sceneBackdrop(ctx,x,y,w,h,theme,'#33484b','#090f11')
  raised(ctx,x+58,y+h*.36,w*.62,h*.24,28,theme,9)
  ctx.fillStyle='#dfe7e7';roundRect(ctx,x+82,y+h*.42,w*.42,h*.10,14,ctx.fillStyle)
  ctx.fillStyle=theme.accent2;roundRect(ctx,x+92,y+h*.33,18,h*.28,8,ctx.fillStyle)
  ctx.strokeStyle=theme.accent2;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x+w*.12,y+h*.28);ctx.lineTo(x+w*.12,y+h*.45);ctx.lineTo(x+w*.22,y+h*.45);ctx.lineTo(x+w*.25,y+h*.37);ctx.lineTo(x+w*.28,y+h*.45);ctx.lineTo(x+w*.36,y+h*.45);ctx.lineTo(x+w*.36,y+h*.28);ctx.stroke()
  drawPotion(ctx,x+w*.77,y+h*.55,.60,theme.accent)
  text(ctx,'RPG CLINIC',x+w*.5,y+44,12,theme.soft,'bold','center')
  badge(ctx,x+24,y+h-50,'CLINIC',theme,theme.success)
}

function drawRiskScene(ctx,x,y,w,h,theme){
  sceneBackdrop(ctx,x,y,w,h,theme,'#231a22','#08070b')
  ctx.fillStyle='#141017';roundRect(ctx,x+w*.10,y+h*.36,w*.80,h*.40,28,ctx.fillStyle)
  ctx.fillStyle='#2b2330';roundRect(ctx,x+w*.16,y+h*.48,w*.22,h*.12,12,ctx.fillStyle);roundRect(ctx,x+w*.62,y+h*.42,w*.20,h*.18,12,ctx.fillStyle)
  ctx.strokeStyle=theme.danger;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x+w*.15,y+h*.32);ctx.lineTo(x+w*.85,y+h*.70);ctx.moveTo(x+w*.85,y+h*.32);ctx.lineTo(x+w*.15,y+h*.70);ctx.stroke()
  drawBag(ctx,x+w*.50,y+h*.61,.72,theme)
  drawCharacter(ctx,x+w*.27,y+h*.76,.42,theme,'idle')
  drawCharacter(ctx,x+w*.73,y+h*.76,.42,theme,'battle')
  spark(ctx,x+w*.50,y+h*.31,10,theme.gold,.7)
  text(ctx,'NIGHT OPERATION',x+w*.5,y+44,12,theme.soft,'bold','center')
  badge(ctx,x+24,y+h-50,'RISK',theme,theme.danger)
}

function drawMeditationScene(ctx,x,y,w,h,theme){
  sceneBackdrop(ctx,x,y,w,h,theme,'#17162a','#080812')
  drawStars(ctx,x,y,w,h,theme,30)
  glow(ctx,x+w*.5,y+h*.45,120,theme.glow)
  drawRunes(ctx,x+w*.5,y+h*.49,120,theme,10)
  drawCharacter(ctx,x+w*.5,y+h*.69,.60,theme,'idle')
  ctx.strokeStyle=theme.accent2;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x+w*.5,y+h*.48,150,0,Math.PI*2);ctx.stroke()
  text(ctx,'FOCUS CHAMBER',x+w*.5,y+44,12,theme.soft,'bold','center')
  badge(ctx,x+24,y+h-50,'MEDITATION',theme,theme.accent)
}

function drawStreamScene(ctx,x,y,w,h,theme){
  sceneBackdrop(ctx,x,y,w,h,theme,'#1e1629','#09070e')
  ctx.fillStyle='rgba(225,166,207,.12)';roundRect(ctx,x+w*.18,y+h*.24,w*.64,h*.42,26,ctx.fillStyle)
  ctx.strokeStyle=theme.accent2;ctx.lineWidth=4;ctx.beginPath();ctx.arc(x+w*.5,y+h*.44,86,0,Math.PI*2);ctx.stroke()
  ctx.fillStyle='#2a2435';roundRect(ctx,x+w*.43,y+h*.38,w*.14,h*.12,16,ctx.fillStyle)
  drawCharacter(ctx,x+w*.5,y+h*.72,.62,theme,'idle')
  for(let i=0;i<3;i++){ctx.fillStyle=i===1?theme.gold:theme.accent;ctx.beginPath();ctx.arc(x+w*(.28+i*.22),y+h*.28,7,0,Math.PI*2);ctx.fill()}
  text(ctx,'LIVE STUDIO',x+w*.5,y+44,12,theme.soft,'bold','center')
  badge(ctx,x+24,y+h-50,'LIVE',theme,theme.accent2)
}

function drawFeatureIdentity(ctx, x, y, w, h, theme, data = {}) {
  const profile = featureProfile(data.featureKey || data.visualKind || data.type || 'reward', data.type || 'reward')
  const images = data.assetImages || {}
  const icon = images[profile.asset]
  const plateW = Math.min(230, w - 36)
  const plateX = x + w - plateW - 20
  const plateY = y + h - 112
  raised(ctx, plateX, plateY, plateW, 66, 22, theme, 8)
  inset(ctx, plateX + 9, plateY + 9, 48, 48, 16, theme, 4)
  if (!drawAsset(ctx, icon, plateX + 12, plateY + 12, 42, 42)) {
    drawFallbackAsset(ctx, profile.asset, plateX + 33, plateY + 33, 0.27, theme)
  }
  text(ctx, profile.kicker, plateX + 70, plateY + 28, 10, theme.muted, 'bold')
  text(ctx, clampText(data.featureLabel || profile.key.replace(/[-_]/g, ' '), 22).toUpperCase(), plateX + 70, plateY + 48, 13, theme.ink, 'bold')
}

function drawScene(ctx, type, x, y, w, h, theme, avatar, data = {}) {
  const profile = featureProfile(data.featureKey || type, type)
  const sceneType = profile.scene || type
  ctx.save()
  if (sceneType === 'atlas') drawAtlasScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'travel') drawTravelScene(ctx, x, y, w, h, theme, profile.key === 'portal' ? 'portal' : 'voyage')
  else if (sceneType === 'camp') drawCampScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'magic') drawMagicScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'ruins') drawRuinScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'archive') drawArchiveScene(ctx, x, y, w, h, theme, profile.kicker)
  else if (sceneType === 'tower') drawTowerScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'board') drawBoardScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'dungeon') drawDungeonScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'forge' || sceneType === 'workshop') drawForgeScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'farm') drawFarmScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'ranch') drawRanchScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'inn') drawTownScene(ctx, x, y, w, h, theme, 'TRAVELERS INN')
  else if (sceneType === 'tavern') drawTownScene(ctx, x, y, w, h, theme, 'ADVENTURER TAVERN', theme.danger)
  else if (sceneType === 'library') drawLibraryScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'journal') drawJournalScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'npc') drawTownScene(ctx, x, y, w, h, theme, 'NPC DISTRICT', theme.accent2)
  else if (sceneType === 'party') drawPartyScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'pet' || sceneType === 'petshop') drawPetScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'weather') drawWeatherScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'event' || sceneType === 'festival') drawFestivalScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'market') drawMarketScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'bank') drawBankScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'house') drawHouseScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'expedition') drawExpeditionScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'shrine') drawMagicScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'outpost') drawOutpostScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'clinic') drawClinicScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'risk') drawRiskScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'meditation') drawMeditationScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'stream') drawStreamScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'hunt' || sceneType === 'berburu') drawHuntScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'work') drawWorkScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'adventure') drawAdventureScene(ctx, x, y, w, h, theme, 'adventure', data.location || '', data)
  else if (sceneType === 'slot') drawSlotScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'casino') drawCasinoScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'coinflip') drawCoinflipScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'dice') drawDiceScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'lottery') drawLotteryScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'parkir') drawParkingScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'fishing') drawFishingScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'mining') drawMiningScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'boss') drawBossScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'battle') drawBattleScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'shop') drawShopScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'profile') drawProfileScene(ctx, x, y, w, h, theme, avatar, data)
  else if (sceneType === 'inventory') drawInventoryScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'leaderboard') drawLeaderboardScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'reward') drawRewardScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'levelup') drawLevelupScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'daily' || sceneType === 'hourly') drawRewardScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'training') drawTrainingScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'quest') drawQuestScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'alchemy') drawAlchemyScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'blacksmith' || sceneType === 'craft') drawForgeScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'cook' || sceneType === 'cooking') drawCookingScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'garden') drawGardenScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'guild') drawGuildScene(ctx, x, y, w, h, theme, data)
  else if (sceneType === 'treasure') drawTreasureScene(ctx, x, y, w, h, theme)
  else if (sceneType === 'woodcut') drawWoodcutScene(ctx, x, y, w, h, theme, data)
  else drawGenericScene(ctx, x, y, w, h, theme, sceneType, data)
  ctx.restore()
}

function softOrb(ctx, x, y, radius, color, alpha = 0.14) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius)
  const hex = String(color).replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16) || 0
  const gg = parseInt(hex.slice(2, 4), 16) || 0
  const b = parseInt(hex.slice(4, 6), 16) || 0
  g.addColorStop(0, `rgba(${r},${gg},${b},${alpha})`)
  g.addColorStop(0.55, `rgba(${r},${gg},${b},${alpha * 0.35})`)
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
}

function neumorphicChip(ctx, x, y, w, h, label, value, theme, accent = theme.accent) {
  raised(ctx, x, y, w, h, h / 2, theme, 6)
  inset(ctx, x + 8, y + 8, w - 16, h - 16, (h - 16) / 2, theme, 3)
  ctx.fillStyle = accent
  ctx.beginPath()
  ctx.arc(x + 24, y + h / 2, 5, 0, Math.PI * 2)
  ctx.fill()
  text(ctx, String(label).toUpperCase(), x + 38, y + 22, 9, theme.muted, 'bold')
  text(ctx, value, x + w - 18, y + 23, 12, theme.ink, 'bold', 'right')
}

function miniIcon(ctx, x, y, type, theme, accent = theme.accent) {
  inset(ctx, x, y, 46, 46, 15, theme, 4)
  ctx.strokeStyle = accent
  ctx.fillStyle = accent
  ctx.lineWidth = 3
  if (type === 'hp') { ctx.beginPath(); ctx.moveTo(x+23,y+34); ctx.bezierCurveTo(x+2,y+22,x+8,y+9,x+19,y+15); ctx.bezierCurveTo(x+23,y+7,x+38,y+12,x+23,y+34); ctx.fill() }
  else if (type === 'mana') { ctx.beginPath(); ctx.moveTo(x+23,y+8); ctx.lineTo(x+34,y+23); ctx.lineTo(x+23,y+38); ctx.lineTo(x+12,y+23); ctx.closePath(); ctx.stroke() }
  else if (type === 'stamina') { ctx.beginPath(); ctx.moveTo(x+26,y+7); ctx.lineTo(x+16,y+23); ctx.lineTo(x+24,y+23); ctx.lineTo(x+20,y+39); ctx.lineTo(x+32,y+20); ctx.lineTo(x+24,y+20); ctx.closePath(); ctx.fill() }
  else { ctx.beginPath(); ctx.arc(x+23,y+23,12,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.arc(x+23,y+23,4,0,Math.PI*2); ctx.fill() }
}

function progress(ctx, x, y, w, h, value, color, theme) {
  const p = Math.max(0, Math.min(1, Number(value) || 0))
  inset(ctx, x, y, w, h, h / 2, theme, 5)
  if (!p) return
  const g = ctx.createLinearGradient(x, y, x + w, y)
  g.addColorStop(0, color)
  g.addColorStop(1, theme.accent2)
  roundRect(ctx, x + 4, y + 4, Math.max(h - 8, (w - 8) * p), h - 8, (h - 8) / 2, g)
  ctx.save()
  ctx.globalAlpha = 0.28
  roundRect(ctx, x + 7, y + 6, Math.max(8, (w - 14) * p), 3, 2, '#ffffff')
  ctx.restore()
}

function fitFontSize(ctx, value, maxWidth, maxSize = 19, minSize = 10, weight = 'bold') {
  const normalized = cleanText(value)
  for (let size = maxSize; size >= minSize; size -= 1) {
    ctx.font = `${weight} ${size}px ${FONT}`
    if (ctx.measureText(normalized).width <= maxWidth) return size
  }
  return minSize
}

function statTile(ctx, x, y, w, h, label, value, color, theme) {
  raised(ctx, x, y, w, h, Math.min(22, h * 0.42), theme, 8)
  inset(ctx, x + 10, y + 10, w - 20, h - 20, Math.min(16, h * 0.30), theme, 4)
  ctx.fillStyle = color
  ctx.beginPath();ctx.arc(x + 26, y + Math.min(26, h * 0.42), 4, 0, Math.PI * 2);ctx.fill()
  const labelText = String(label).toUpperCase()
  const labelSize = fitFontSize(ctx, labelText, w - 64, h < 60 ? 9 : 10, 8, 'bold')
  const labelY = y + Math.min(30, Math.max(18, h * 0.38))
  text(ctx, labelText, x + 40, labelY, labelSize, theme.soft, 'bold')
  const valueText = cleanText(value)
  const maxLines = h >= 68 ? 2 : 1
  const lines = wrapTextLines(ctx, valueText, w - 36, h < 60 ? 15 : 19, 10, 'bold', maxLines)
  const valueSize = lines.size
  const lineGap = Math.max(14, valueSize - 1)
  const totalHeight = lines.lines.length * lineGap
  const valueStartY = y + h - Math.max(10, (h - totalHeight) / 2)
  lines.lines.forEach((lineText, i) => text(ctx, lineText, x + 18, valueStartY + i * lineGap, valueSize, color, 'bold'))
}

function wrapTextLines(ctx, value, maxWidth, maxSize = 18, minSize = 10, weight = 'bold', maxLines = 2) {
  const source = cleanText(value)
  for (let size = maxSize; size >= minSize; size -= 1) {
    ctx.font = `${weight} ${size}px ${FONT}`
    if (ctx.measureText(source).width <= maxWidth) return { size, lines: [source] }
  }
  const words = source.split(/\s+/).filter(Boolean)
  const lines=[]
  let current=''
  ctx.font=`${weight} ${minSize}px ${FONT}`
  for (const word of words) {
    const next=current?`${current} ${word}`:word
    if (ctx.measureText(next).width <= maxWidth) current=next
    else if (current) { lines.push(current); current=word }
    else lines.push(word.slice(0, Math.max(1, Math.floor(maxWidth / Math.max(1, ctx.measureText('M').width)))) + '…')
    if (lines.length >= maxLines) break
  }
  if (current && lines.length < maxLines) lines.push(current)
  if (lines.length > maxLines) lines.length=maxLines
  if (source && lines.length) {
    const joined=lines.join(' ')
    if (joined.length < source.length) {
      let last=lines[lines.length-1]
      while (ctx.measureText(`${last}…`).width > maxWidth && last.length > 1) last=last.slice(0,-1)
      lines[lines.length-1]=`${last}…`
    }
  }
  return { size:minSize, lines: lines.length ? lines : [''] }
}

function section(ctx, label, x, y, theme) {
  ctx.fillStyle = theme.accent
  ctx.beginPath()
  ctx.arc(x + 3, y - 4, 3, 0, Math.PI * 2)
  ctx.fill()
  text(ctx, clampText(label, 28).toUpperCase(), x + 14, y, 11, theme.soft, 'bold')
}

function topBrand(ctx, theme, title, subtitle, kicker = 'RPG WORLD') {
  text(ctx, 'USANAGI RPG', 58, 48, 13, theme.soft, 'bold')
  text(ctx, clampText(title, 25), 58, 88, 37, theme.ink, 'bold')
  if (subtitle) text(ctx, clampText(subtitle, 46), 60, 116, 14, theme.soft)
  raised(ctx, WIDTH - 210, 32, 150, 42, 21, theme, 7)
  text(ctx, clampText(kicker || 'RPG WORLD', 19).toUpperCase(), WIDTH - 135, 58, 9, theme.soft, 'bold', 'center')
}

function footer(ctx, theme) {
  text(ctx, clampText(settings.botName || 'Usanagi Umi AI', 20), WIDTH - 58, HEIGHT - 26, 11, theme.soft, 'bold', 'right')
}

async function loadOptionalImage(source) {
  if (!source) return null
  try {
    if (Buffer.isBuffer(source)) return await loadImage(source)
    const response = await fetch(String(source), { signal: AbortSignal.timeout(5000) })
    if (!response.ok) return null
    return await loadImage(Buffer.from(await response.arrayBuffer()))
  } catch {
    return null
  }
}

async function renderRpgCard(type, data = {}) {
  const featureKey = String(data.featureKey || type || 'reward').toLowerCase()
  const profile = featureProfile(featureKey, type)
  const resolvedType = profile.scene || type
  const theme = themeFor(resolvedType, data.palette || profile.palette, featureKey)
  const assetImages = {}
  for (const asset of assetKeysFromData(profile, resolvedType, data)) assetImages[asset] = await loadRpgAsset(asset)
  const renderData = { ...data, featureKey, featureLabel: data.featureLabel || profile.kicker, assetImages }
  const canvas = createCanvas(WIDTH, HEIGHT)
  const ctx = canvas.getContext('2d')
  const bg = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT)
  bg.addColorStop(0, theme.bg)
  bg.addColorStop(0.5, theme.surface)
  bg.addColorStop(1, theme.bg)
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  glow(ctx, WIDTH - 80, 60, 260, theme.glow)
  glow(ctx, 70, HEIGHT - 30, 230, theme.glow)
  topBrand(ctx, theme, renderData.title || type.toUpperCase(), renderData.subtitle || '', renderData.featureLabel || profile.kicker)

  const artX = 54
  const artY = 148
  const artW = 470
  const artH = 642
  const panelX = 552
  const panelY = 148
  const panelW = 674
  const panelH = 642
  const avatar = resolvedType === 'profile' ? await loadOptionalImage(renderData.avatarUrl) : null

  drawScene(ctx, resolvedType, artX, artY, artW, artH, theme, avatar, renderData)
  roundRect(ctx, artX, artY, artW, artH, 38, null, 'rgba(255,255,255,0.08)', 1)
  raised(ctx, panelX, panelY, panelW, panelH, 38, theme, 14)
  inset(ctx, panelX + 14, panelY + 14, panelW - 28, panelH - 28, 30, theme, 7)

  if (resolvedType === 'profile') {
    const profileName = clampText(renderData.name || 'Player', 23)
    text(ctx, profileName, panelX + 38, panelY + 52, fitFontSize(ctx, profileName, 360, 26, 17, 'bold'), theme.ink, 'bold')
    text(ctx, clampText(renderData.role || 'Warrior', 20), panelX + 38, panelY + 78, 12, theme.accent, 'bold')
    const levelValue=number(renderData.level ?? 0)
    text(ctx, `LV ${levelValue}`, panelX + panelW - 38, panelY + 52, 14, theme.soft, 'bold', 'right')
    text(ctx, `XP ${number(renderData.exp ?? 0)}`, panelX + panelW - 38, panelY + 76, 10, theme.muted, 'bold', 'right')
    section(ctx, 'Core Progress', panelX + 38, panelY + 112, theme)
    const core=[['LEVEL',levelValue,theme.accent],['COIN',rupiah(renderData.koin ?? 0),theme.gold],['STATUS',renderData.status || 'ONLINE',theme.success]]
    core.forEach(([label,val,color],i)=>statTile(ctx,panelX+38+i*192,panelY+126,176,72,label,String(val),color,theme))
    section(ctx, 'Resources', panelX + 38, panelY + 224, theme)
    const bars=[['HP',renderData.health,renderData.maxHealth,theme.success],['MANA',renderData.mana,renderData.maxMana,theme.accent2],['STAMINA',renderData.stamina,renderData.maxStamina,theme.gold]]
    let by=panelY+246
    for(const [label,current,max,color] of bars){
      const cur=Number(current??0),cap=Math.max(1,Number(max??0))
      text(ctx,label,panelX+38,by,10,theme.soft,'bold');text(ctx,`${number(cur)} / ${number(cap)}`,panelX+panelW-38,by,10,theme.soft,'bold','right')
      progress(ctx,panelX+38,by+10,panelW-76,16,cur/cap,color,theme);by+=44
    }
    section(ctx, 'Attributes', panelX + 38, panelY + 382, theme)
    const attrs=[['ATK',renderData.attack,theme.accent],['DEF',renderData.defense,theme.accent2],['SPD',renderData.speed,theme.success],['LUCK',renderData.luck,theme.gold]]
    attrs.forEach(([label,value,color],i)=>{const col=i%2,row=Math.floor(i/2);statTile(ctx,panelX+38+col*296,panelY+394+row*60,276,52,label,number(value??0),color,theme)})
    section(ctx, 'Activity Record', panelX + 38, panelY + 526, theme)
    const activity=renderData.activityStats||{}
    const activityRows=[['Hunt',activity.hunt],['Fishing',activity.fishing],['Mining',activity.mining],['Farming',activity.farming],['Battle',activity.battle],['Training',activity.training],['Crafting',activity.crafting],['Work',activity.work],['Crime',activity.crime]]
    activityRows.forEach(([label,value],i)=>{const col=i%3,row=Math.floor(i/3);text(ctx,label.toUpperCase(),panelX+38+col*190,panelY+548+row*16,8,theme.muted,'bold');text(ctx,number(value||0),panelX+38+col*190,panelY+562+row*16,10,theme.ink,'bold')})
  } else if (resolvedType === 'training') {
    text(ctx, clampText(renderData.trainingName || renderData.title || 'Training Complete', 28), panelX + 38, panelY + 55, fitFontSize(ctx, renderData.trainingName || renderData.title || 'Training Complete', 380, 25, 15, 'bold'), theme.ink, 'bold')
    const kind=String(renderData.trainingType||renderData.trainingStat||'attack').toUpperCase()
    text(ctx, kind, panelX + 38, panelY + 82, 12, theme.accent, 'bold')
    statTile(ctx,panelX+38,panelY+112,276,82,'Before',number(renderData.before??0),theme.muted,theme)
    statTile(ctx,panelX+334,panelY+112,276,82,'After',number(renderData.after??0),theme.success,theme)
    section(ctx,'Session Result',panelX+38,panelY+226,theme)
    statTile(ctx,panelX+38,panelY+244,176,78,'Gain',`+${number(renderData.gain??0)}`,theme.accent,theme)
    statTile(ctx,panelX+230,panelY+244,176,78,'Stamina',`-${number(renderData.staminaCost??0)}`,theme.gold,theme)
    statTile(ctx,panelX+422,panelY+244,188,78,'EXP',`+${number(renderData.expGain??0)}`,theme.accent2,theme)
    section(ctx,'Current Status',panelX+38,panelY+344,theme)
    if(renderData.coreStats){
      const now=[['LV',renderData.coreStats.level,theme.accent],['COIN',rupiah(renderData.coreStats.koin||0),theme.gold],['HP',`${number(renderData.coreStats.health||0)}/${number(renderData.coreStats.maxHealth||0)}`,theme.success],['STA',`${number(renderData.coreStats.stamina||0)}/${number(renderData.coreStats.maxStamina||0)}`,theme.accent2]]
      now.forEach(([label,val,color],i)=>neumorphicChip(ctx,panelX+38+i*144,panelY+360,i===3?138:132,40,label,String(val),theme,color))
    }
  } else if (resolvedType === 'slot') {
    text(ctx,'SLOT RESULT',panelX+38,panelY+55,25,theme.ink,'bold')
    text(ctx,clampText(renderData.outcome || renderData.result || 'Spin complete',36),panelX+38,panelY+82,12,renderData.winnings?theme.success:theme.danger,'bold')
    const reels=Array.isArray(renderData.reels)?renderData.reels:['🍒','🍋','💎']
    reels.slice(0,3).forEach((value,i)=>{
      const bx=panelX+38+i*190
      raised(ctx,bx,panelY+116,170,124,24,theme,8);inset(ctx,bx+12,panelY+128,146,100,18,theme,5)
      const key=slotSymbolAsset(value)
      const asset=(renderData.assetImages||{})[key]
      if(!drawAsset(ctx,asset,bx+52,panelY+138,68,62)) drawFallbackAsset(ctx,key,bx+85,panelY+171,.28,theme)
      text(ctx,String(value).replace(/^[^\p{L}\p{N}]+/u,'').slice(0,10).toUpperCase(),bx+85,panelY+208,9,theme.soft,'bold','center')
    })
    statTile(ctx,panelX+38,panelY+262,276,82,'Bet',rupiah(renderData.bet||0),theme.gold,theme)
    statTile(ctx,panelX+334,panelY+262,276,82,'Payout',rupiah(renderData.winnings||0),theme.success,theme)
    statTile(ctx,panelX+38,panelY+360,276,82,'Multiplier',`${renderData.multiplier||0}x`,theme.accent,theme)
    if(renderData.coreStats) statTile(ctx,panelX+334,panelY+360,276,82,'Coin',rupiah(renderData.coreStats.koin||0),theme.gold,theme)
    section(ctx,'Machine Status',panelX+38,panelY+464,theme)
    text(ctx,renderData.winnings?'WIN STATE':'NO WIN',panelX+38,panelY+490,16,renderData.winnings?theme.success:theme.muted,'bold')
  } else if (resolvedType === 'parkir') {
    text(ctx,'PARKING RESULT',panelX+38,panelY+55,25,theme.ink,'bold')
    text(ctx,clampText(renderData.status||'Parking shift complete',38),panelX+38,panelY+82,12,renderData.earning?theme.success:theme.danger,'bold')
    statTile(ctx,panelX+38,panelY+116,276,82,'Earning',`+${rupiah(renderData.earning||0)}`,theme.success,theme)
    statTile(ctx,panelX+334,panelY+116,276,82,'Penalty',renderData.penalty?`-${rupiah(renderData.penalty)}`:'Rp 0',theme.danger,theme)
    statTile(ctx,panelX+38,panelY+216,276,82,'Stamina',`-${number(renderData.staminaCost||0)}`,theme.gold,theme)
    statTile(ctx,panelX+334,panelY+216,276,82,'EXP',`+${number(renderData.expGain||0)}`,theme.accent2,theme)
    if(renderData.coreStats){section(ctx,'Current Status',panelX+38,panelY+318,theme);statTile(ctx,panelX+38,panelY+338,276,78,'Coin',rupiah(renderData.coreStats.koin||0),theme.gold,theme);statTile(ctx,panelX+334,panelY+338,276,78,'STA',`${number(renderData.coreStats.stamina||0)}/${number(renderData.coreStats.maxStamina||0)}`,theme.accent2,theme)}
  } else if (resolvedType === 'adventure') {
    const location=clampText(renderData.location||'Unmarked Frontier',30)
    text(ctx,'ADVENTURE ROUTE',panelX+38,panelY+55,25,theme.ink,'bold')
    text(ctx,location,panelX+38,panelY+82,13,theme.accent2,'bold')
    const route=[['DESTINATION',location,theme.accent],['REWARD',renderData.reward || renderData.koin ? `+${rupiah(renderData.koin||renderData.reward||0)}` : 'Discovery',theme.gold],['STATUS',renderData.status||'COMPLETE',theme.success]]
    route.forEach(([label,val,color],i)=>statTile(ctx,panelX+38+i*192,panelY+112,176,78,label,String(val),color,theme))
    if(renderData.coreStats){
      section(ctx,'Traveler Status',panelX+38,panelY+226,theme)
      statTile(ctx,panelX+38,panelY+244,176,78,'Level',number(renderData.coreStats.level||0),theme.accent,theme)
      statTile(ctx,panelX+230,panelY+244,176,78,'Coin',rupiah(renderData.coreStats.koin||0),theme.gold,theme)
      statTile(ctx,panelX+422,panelY+244,188,78,'Stamina',`${number(renderData.coreStats.stamina||0)}/${number(renderData.coreStats.maxStamina||0)}`,theme.accent2,theme)
    }
    if(renderData.reward || renderData.location){
      section(ctx,'Journey Note',panelX+38,panelY+350,theme)
      raised(ctx,panelX+38,panelY+370,572,104,22,theme,7)
      text(ctx,clampText(renderData.body||renderData.subtitle||`Reached ${location}`,62),panelX+58,panelY+405,13,theme.soft)
      text(ctx,'ROUTE SECURED',panelX+58,panelY+434,10,theme.success,'bold')
    }
  } else if (resolvedType === 'inventory') {
    text(ctx, clampText(renderData.name || 'Player', 24), panelX + 38, panelY + 58, fitFontSize(ctx, cleanText(renderData.name || 'Player'), 330, 27, 15, 'bold'), theme.ink, 'bold')
    text(ctx, 'ITEM STORAGE', panelX + 38, panelY + 84, 13, theme.accent, 'bold')
    statTile(ctx, panelX + 38, panelY + 108, 280, 78, 'Coin', rupiah(renderData.koin || 0), theme.gold, theme)
    statTile(ctx, panelX + 330, panelY + 108, 280, 78, 'HP', `${number(renderData.health || 0)}/${number(renderData.maxHealth || 0)}`, theme.success, theme)
    section(ctx, 'Items', panelX + 38, panelY + 224, theme)
    const items = (renderData.items || []).slice(0, 7)
    let iy = panelY + 244
    for (const item of items) {
      raised(ctx, panelX + 38, iy, 572, 50, 18, theme, 7)
      inset(ctx, panelX + 49, iy + 10, 32, 30, 11, theme, 4)
      const itemKey = inferItemAsset(item.key || item.name)
      const itemAsset = (renderData.assetImages || {})[itemKey]
      if (!drawAsset(ctx, itemAsset, panelX + 53, iy + 11, 24, 28)) drawFallbackAsset(ctx, itemKey, panelX + 65, iy + 25, 0.18, theme)
      text(ctx, clampText(item.name, 32), panelX + 98, iy + 31, 14, theme.ink, 'bold')
      text(ctx, `×${number(item.count || 0)}`, panelX + 588, iy + 31, 14, theme.accent2, 'bold', 'right')
      iy += 55
    }
    if (!items.length) text(ctx, 'Inventory masih kosong', panelX + panelW / 2, panelY + 355, 16, theme.soft, 'bold', 'center')
  } else if (resolvedType === 'leaderboard') {
    text(ctx, clampText(renderData.category || 'RPG Ranking', 28), panelX + 38, panelY + 58, fitFontSize(ctx, cleanText(renderData.category || 'RPG Ranking'), 350, 27, 15, 'bold'), theme.ink, 'bold')
    text(ctx, 'SEASON RANKING', panelX + 38, panelY + 84, 13, theme.accent, 'bold')
    const players = (renderData.players || []).slice(0, 7)
    let ly = panelY + 114
    for (const [index, player] of players.entries()) {
      const rank = index + 1
      const top = rank <= 3
      raised(ctx, panelX + 38, ly, 572, 56, 18, theme, top ? 9 : 6)
      const color = rank === 1 ? theme.gold : rank === 2 ? '#d4dbe4' : rank === 3 ? '#d3a77f' : theme.soft
      inset(ctx, panelX + 49, ly + 9, 38, 38, 15, theme, 4)
      text(ctx, String(rank).padStart(2, '0'), panelX + 68, ly + 34, 11, color, 'bold', 'center')
      text(ctx, clampText(player.name, 25), panelX + 105, ly + 34, 15, theme.ink, top ? 'bold' : 'normal')
      text(ctx, clampText(player.value, 18), panelX + 588, ly + 34, 14, top ? color : theme.accent2, 'bold', 'right')
      ly += 64
    }
  } else if (resolvedType === 'boss' || resolvedType === 'battle') {
    text(ctx, clampText(renderData.name || 'Boss', 25), panelX + 38, panelY + 58, fitFontSize(ctx, cleanText(renderData.name || 'Boss'), 330, 27, 15, 'bold'), theme.ink, 'bold')
    text(ctx, clampText(renderData.status || '', 34), panelX + 38, panelY + 84, 14, renderData.victory ? theme.success : theme.danger, 'bold')
    statTile(ctx, panelX + 38, panelY + 108, 176, 76, 'Damage', number(renderData.damage || 0), theme.danger, theme)
    statTile(ctx, panelX + 230, panelY + 108, 176, 76, 'Round', number(renderData.round || 0), theme.accent2, theme)
    statTile(ctx, panelX + 422, panelY + 108, 188, 76, 'EXP', `+${number(renderData.exp || 0)}`, theme.accent, theme)
    section(ctx, 'Boss Health', panelX + 38, panelY + 226, theme)
    text(ctx, `${number(renderData.hp || 0)} / ${number(renderData.maxHp || 0)}`, panelX + panelW - 38, panelY + 226, 11, theme.soft, 'bold', 'right')
    progress(ctx, panelX + 38, panelY + 244, panelW - 76, 22, Number(renderData.hp || 0) / Math.max(1, Number(renderData.maxHp || 0)), theme.danger, theme)
    section(ctx, 'Rewards', panelX + 38, panelY + 320, theme)
    statTile(ctx, panelX + 38, panelY + 342, 276, 82, 'EXP', `+${number(renderData.exp || 0)}`, theme.accent2, theme)
    statTile(ctx, panelX + 334, panelY + 342, 276, 82, 'Coin', `+${rupiah(renderData.koin || 0)}`, theme.gold, theme)
    if (renderData.loot) {
      section(ctx, 'Loot', panelX + 38, panelY + 460, theme)
      raised(ctx, panelX + 38, panelY + 480, 572, 58, 18, theme, 6)
      text(ctx, clampText(renderData.loot, 48), panelX + 58, panelY + 516, 15, theme.soft, 'bold')
    }
  } else if (resolvedType === 'shop') {
    text(ctx, clampText(renderData.name || 'RPG Shop', 30), panelX + 38, panelY + 58, 27, theme.ink, 'bold')
    text(ctx, 'ITEM CATALOG', panelX + 38, panelY + 84, 13, theme.accent, 'bold')
    const items = (renderData.items || []).slice(0, 6)
    let sy = panelY + 112
    for (const item of items) {
      raised(ctx, panelX + 38, sy, 572, 62, 19, theme, 7)
      inset(ctx, panelX + 50, sy + 11, 40, 40, 14, theme, 5)
      const shopItemKey = inferItemAsset(item.key || item.name)
      const shopItemAsset = (renderData.assetImages || {})[shopItemKey]
      if (!drawAsset(ctx, shopItemAsset, panelX + 55, sy + 13, 30, 36)) drawFallbackAsset(ctx, shopItemKey, panelX + 70, sy + 31, 0.22, theme)
      text(ctx, clampText(item.name, 30), panelX + 106, sy + 28, 14, theme.ink, 'bold')
      text(ctx, rupiah(item.price || 0), panelX + 588, sy + 39, 14, theme.gold, 'bold', 'right')
      sy += 69
    }
  } else {
    const result=cleanText(renderData.result||renderData.title||'RPG Result')
    text(ctx,clampText(result,48),panelX+38,panelY+58,fitFontSize(ctx,result,500,28,14,'bold'),renderData.victory===false?theme.danger:theme.success,'bold')
    const sub=cleanText(renderData.location||renderData.subtitle||'')
    if(sub) text(ctx,clampText(sub,50),panelX+38,panelY+86,14,theme.soft)
    const stats=Array.isArray(renderData.stats)?renderData.stats.filter(Boolean).slice(0,6):[]
    let cursorY=panelY+112
    if(stats.length){
      section(ctx,'Result Details',panelX+38,cursorY+2,theme);cursorY+=22
      stats.forEach((stat,i)=>{const col=i%2,row=Math.floor(i/2);statTile(ctx,panelX+38+col*296,cursorY+row*88,276,72,stat.label,String(stat.value),stat.color||theme.accent,theme)})
      cursorY+=Math.ceil(stats.length/2)*88+12
    }
    if(renderData.coreStats){
      section(ctx,'Current Status',panelX+38,cursorY,theme);cursorY+=16
      const now=[['LV',renderData.coreStats.level,theme.accent],['COIN',rupiah(renderData.coreStats.koin||0),theme.gold],['HP',`${number(renderData.coreStats.health||0)}/${number(renderData.coreStats.maxHealth||0)}`,theme.success],['STA',`${number(renderData.coreStats.stamina||0)}/${number(renderData.coreStats.maxStamina||0)}`,theme.accent2]]
      now.forEach(([label,val,color],i)=>neumorphicChip(ctx,panelX+38+i*144,cursorY, i===3?138:132,40,label,String(val),theme,color))
      cursorY+=56
    }
    if(renderData.activityStats){
      section(ctx,'Activity Record',panelX+38,cursorY,theme);cursorY+=14
      const rows=[['Hunt',renderData.activityStats.hunt],['Fish',renderData.activityStats.fishing],['Mine',renderData.activityStats.mining],['Farm',renderData.activityStats.farming],['Battle',renderData.activityStats.battle],['Training',renderData.activityStats.training]]
      rows.forEach(([label,val],i)=>{const col=i%3,row=Math.floor(i/3);text(ctx,label.toUpperCase(),panelX+38+col*190,cursorY+row*28,8,theme.muted,'bold');text(ctx,number(val||0),panelX+38+col*190,cursorY+row*28+14,11,theme.ink,'bold')})
    } else if(renderData.location){
      section(ctx,'Location',panelX+38,cursorY,theme);text(ctx,clampText(renderData.location,48),panelX+38,cursorY+28,15,theme.ink,'bold')
    }
  }

  footer(ctx, theme)
  const output = canvas.toBuffer('image/png')
  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  if (!Buffer.isBuffer(output) || output.length < 256 || !output.subarray(0, 8).equals(pngSignature)) throw new Error('Invalid RPG image output')
  return output
}

function communityButtons() {
  const buttons = []
  const channelUrl = cleanText(settings.links?.channelLink)
  const groupUrl = cleanText(settings.links?.groupLink)
  if (groupUrl) buttons.push({ type: 'url', label: 'GROUP USANAGI', url: groupUrl })
  if (channelUrl) buttons.push({ type: 'url', label: 'SALURAN INFO', url: channelUrl })
  return buttons
}

async function sendRpgCard(conn, m, options = {}) {
  const rawBody = formatRpgText(String(options.body || options.caption || ''))
  const featureKey = String(options.featureKey || m.rpgFeatureKey || options.type || 'reward').toLowerCase()
  const explicitData = options.data || {}
  const shouldSnapshotSender = featureKey !== 'profile' && options.snapshotStats !== false
  let snapshot = {}
  if (shouldSnapshotSender) {
    try {
      const user = getUser(m.sender)
      recordRpgActivity(m.sender, user, featureKey, m.raw?.key?.id || '')
      snapshot = {
        coreStats: {
          level: user.level, exp: user.exp, koin: user.koin, health: user.rpg.health, maxHealth: user.rpg.maxHealth,
          mana: user.rpg.mana, maxMana: user.rpg.maxMana, stamina: user.rpg.stamina, maxStamina: user.rpg.maxStamina,
          attack: user.rpg.attack, defense: user.rpg.defense, speed: user.rpg.speed, luck: user.rpg.luck,
        },
        activityStats: { ...(user.rpg.stats || {}) },
      }
    } catch {
      snapshot = {}
    }
  }
  const levelUp = m.rpgLevelUpEvent || null
  if (levelUp) {
    const levelLine = `• Level naik: ${levelUp.oldLevel} → ${levelUp.newLevel} (${levelUp.role})`
    if (!rawBody.toLowerCase().includes('level naik')) {
      options.body = rawBody ? `${rawBody}\n${levelLine}` : levelLine
    }
  }
  const cardData = { ...explicitData, ...snapshot, featureKey }
  if (levelUp) {
    cardData.levelUp = { ...levelUp }
  }
  const finalBody = formatRpgText(String(options.body || options.caption || ''))
  const responseKey = `${featureKey}|${cleanText(options.headerTitle || '')}|${finalBody}`
  const ledger = cardResponseLedger.get(m) || new Set()
  if (ledger.has(responseKey)) {
    m.rpgLevelUpEvent = null
    return null
  }
  ledger.add(responseKey)
  if (ledger.size > 12) ledger.delete(ledger.values().next().value)
  cardResponseLedger.set(m, ledger)
  m.rpgLevelUpEvent = null
  const fallbackText = finalBody || cleanText(options.headerSubtitle || options.headerTitle || 'RPG selesai.')
  let image
  try {
    image = await renderRpgCard(options.type || 'reward', cardData)
  } catch {
    return conn.sendMessage(m.chat, { text: fallbackText }, { quoted: m.raw })
  }
  const customButtons = Array.isArray(options.buttons) ? options.buttons : []
  const buttons = [...customButtons, ...communityButtons()].slice(0, 3)
  const body = finalBody ? `${finalBody}\n` : ''
  const footerText = cleanText(options.footer || settings.footerText || settings.botName).slice(0, 60)
  const quickButtons = buttons.filter((button) => button.type !== 'url')
  const urlButtons = buttons.filter((button) => button.type === 'url')
  return sendInteractive(conn, m.chat, {
    title: cleanText(options.headerTitle || 'USANAGI RPG'),
    subtitle: cleanText(options.headerSubtitle || cardData.subtitle || ''),
    body,
    footer: footerText,
    image,
    buttons: quickButtons,
    urlButtons,
    mentions: options.mentions || [],
  }, { quoted: Object.prototype.hasOwnProperty.call(options, 'quoted') ? options.quoted : m.raw })
}

export { renderRpgCard, sendRpgCard, clampText }

export default { renderRpgCard, sendRpgCard, clampText }
