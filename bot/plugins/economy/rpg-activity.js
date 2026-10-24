import crypto from 'node:crypto'
import { unifiedRpg } from '../../lib/rpg/unified-store.js'
/**
 * RPG Activity System - Work, Hunt, Mine, Farm, Daily
 * Sistem aktivitas RPG untuk earning balance
 * 
 * Commands:
 *   .daily        - Klaim hadiah harian
 *   .work / .kerja - Bekerja (cooldown 5 menit)
 *   .hunt / .berburu - Berburu monster (cooldown 10 menit)
 *   .mine / .tambang - Menambang mineral (cooldown 10 menit)
 *   .farm / .kebun  - Berkebun (cooldown 15 menit)
 *   .fish / .mancing - Memancing (cooldown 10 menit)
 *   .rob / .rampok  - Merampok user lain (cooldown 30 menit, risk!)
 *   .give / .tf    - Transfer balance ke user lain
 *   .leaderboard / .lb - Top balance
 *   .adventure / .petualangan - Petualangan (cooldown 20 menit)
 * 
 * By AlzRiss - Usanagi Umi AI (clean-room build)
 */

const COOLDOWNS = {
  daily: 24 * 60 * 60 * 1000,
  work: 5 * 60 * 1000,
  hunt: 10 * 60 * 1000,
  mine: 10 * 60 * 1000,
  farm: 15 * 60 * 1000,
  fish: 10 * 60 * 1000,
  rob: 30 * 60 * 1000,
  adventure: 20 * 60 * 1000
}

const JOBS = [
  { text: '🧑‍💻 Jadi programmer freelance', min: 500, max: 3000 },
  { text: '🚗 Jadi driver ojol', min: 300, max: 2000 },
  { text: '📦 Kurir paket', min: 400, max: 2500 },
  { text: '🍳 Masak di warteg', min: 200, max: 1500 },
  { text: '🎨 Desain grafis', min: 800, max: 4000 },
  { text: '📸 Fotografer event', min: 600, max: 3500 },
  { text: '🧹 Bersih-bersih kantor', min: 200, max: 1200 },
  { text: '📝 Nulis artikel', min: 400, max: 2800 },
  { text: '🎤 Jadi MC wedding', min: 1000, max: 5000 },
  { text: '🏋️ Jadi pelatih gym', min: 500, max: 3000 },
  { text: '🎪 Jualan di pasar malam', min: 300, max: 2200 },
  { text: '🎓 Les privat', min: 700, max: 3800 },
  { text: '🎵 Manggung di cafe', min: 800, max: 4500 },
  { text: '📱 Service HP', min: 500, max: 3200 },
  { text: '🌮 Jualan takoyaki', min: 400, max: 2600 },
]

const MONSTERS = [
  { name: 'Slime', emoji: '🟢', reward: [100, 500], xp: [5, 15], drop: '💧 Gelatin' },
  { name: 'Goblin', emoji: '👺', reward: [200, 800], xp: [10, 25], drop: '🪙 Koin Perak' },
  { name: 'Wolf', emoji: '🐺', reward: [300, 1000], xp: [15, 30], drop: '🦷 Taring' },
  { name: 'Orc', emoji: '👹', reward: [500, 1500], xp: [20, 40], drop: '🪓 Kapak Karat' },
  { name: 'Dragon', emoji: '🐉', reward: [1000, 5000], xp: [50, 100], drop: '💎 Dragon Stone' },
  { name: 'Phoenix', emoji: '🔥', reward: [2000, 8000], xp: [80, 150], drop: '🪶 Bulu Api' },
  { name: 'Demon Lord', emoji: '😈', reward: [5000, 15000], xp: [100, 250], drop: '👑 Mahkota Gelap' },
]

const MINERALS = [
  { name: 'Batu Bara', emoji: '⬛', reward: [50, 200], chance: 0.35 },
  { name: 'Besi', emoji: '🔩', reward: [100, 400], chance: 0.25 },
  { name: 'Emas', emoji: '🥇', reward: [300, 1000], chance: 0.15 },
  { name: 'Diamond', emoji: '💎', reward: [800, 3000], chance: 0.08 },
  { name: 'Emerald', emoji: '💚', reward: [500, 2000], chance: 0.10 },
  { name: 'Ruby', emoji: '❤️', reward: [600, 2500], chance: 0.07 },
]

const FISH = [
  { name: 'Ikan Mas', emoji: '🐟', reward: [50, 200], weight: '0.5-2kg', chance: 0.30 },
  { name: 'Lele', emoji: '🐠', reward: [80, 300], weight: '1-3kg', chance: 0.25 },
  { name: 'Nila', emoji: '🐟', reward: [100, 400], weight: '0.5-1.5kg', chance: 0.20 },
  { name: 'Kakap', emoji: '🐟', reward: [200, 800], weight: '2-5kg', chance: 0.12 },
  { name: 'Tuna', emoji: '🐟', reward: [500, 2000], weight: '5-15kg', chance: 0.08 },
  { name: 'Hiu', emoji: '🦈', reward: [1000, 5000], weight: '20-50kg', chance: 0.04 },
  { name: 'Paus', emoji: '🐋', reward: [5000, 15000], weight: '100kg+', chance: 0.01 },
]

const CROPS = [
  { name: 'Padi', emoji: '🌾', reward: [100, 400], time: 'cepat' },
  { name: 'Jagung', emoji: '🌽', reward: [150, 500], time: 'sedang' },
  { name: 'Cabai', emoji: '🌶️', reward: [200, 700], time: 'sedang' },
  { name: 'Stroberi', emoji: '🍓', reward: [300, 1000], time: 'lama' },
  { name: 'Anggur', emoji: '🍇', reward: [500, 2000], time: 'lama' },
  { name: 'Durian', emoji: '🍈', reward: [1000, 4000], time: 'sangat lama' },
]

const ADVENTURES = [
  { name: 'Hutan Gelap', emoji: '🌲', desc: 'Eksplorasi hutan misterius', reward: [500, 3000], xp: [20, 60] },
  { name: 'Gua Kristal', emoji: '🏔️', desc: 'Gua penuh permata berkilau', reward: [800, 5000], xp: [30, 80] },
  { name: 'Kastil Terkutuk', emoji: '🏰', desc: 'Kastil angker peninggalan raja', reward: [1000, 7000], xp: [50, 120] },
  { name: 'Pulau Harta Karun', emoji: '🏝️', desc: 'Pulau tersembunyi di Samudra', reward: [2000, 10000], xp: [80, 200] },
  { name: 'Dungeon Abyss', emoji: '🕳️', desc: 'Dungeon level terdalam', reward: [5000, 20000], xp: [150, 400] },
]

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function pickWeighted(arr) {
  const r = Math.random()
  let cum = 0
  for (const item of arr) {
    cum += item.chance
    if (r <= cum) return item
  }
  return arr[arr.length - 1]
}

function fmtRp(n) { return Number(n).toLocaleString('id-ID') + ' koin' }
function fmtTime(ms) {
  const s = Math.ceil(ms / 1000)
  if (s < 60) return `${s} detik`
  const m = Math.ceil(s / 60)
  return `${m} menit`
}

function getUser(sender) {
  if (!global.db.data.users[sender]) {
    global.db.data.users[sender] = {
      balance: 0, exp: 0, level: 1, limit: 50,
      lastDaily: 0, lastWork: 0, lastHunt: 0, lastMine: 0,
      lastFarm: 0, lastFish: 0, lastRob: 0, lastAdventure: 0,
      inventory: []
    }
  }
  const u = global.db.data.users[sender]
  if (u.balance === undefined) u.balance = 0
  if (u.exp === undefined) u.exp = 0
  if (u.lastDaily === undefined) u.lastDaily = 0
  if (u.lastWork === undefined) u.lastWork = 0
  if (u.lastHunt === undefined) u.lastHunt = 0
  if (u.lastMine === undefined) u.lastMine = 0
  if (u.lastFarm === undefined) u.lastFarm = 0
  if (u.lastFish === undefined) u.lastFish = 0
  if (u.lastRob === undefined) u.lastRob = 0
  if (u.lastAdventure === undefined) u.lastAdventure = 0
  if (!u.__unifiedRpg && !Array.isArray(u.inventory)) u.inventory = []
  return u
}

function addDrop(user, label) {
  if (!user.__unifiedRpg) { if (!Array.isArray(user.inventory)) user.inventory = []; user.inventory.push(label); return }
  const ids = { 'Batu Bara': 'coal', Besi: 'iron', Diamond: 'diamond', Emerald: 'emerald' }
  const key = ids[label] || 'legacy_' + crypto.createHash('sha256').update(String(label)).digest('hex').slice(0,16)
  user.inventory[key] = (user.inventory[key] || 0) + 1
}

function addExp(user, amount) {
  if (user.__unifiedRpg) { const before = user.level; user.exp += amount; return user.level > before }
  user.exp = (user.exp || 0) + amount
  // Auto level up
  const nextLevel = (user.level || 1) * 100
  if (user.exp >= nextLevel) {
    user.exp -= nextLevel
    user.level = (user.level || 1) + 1
    return true // leveled up
  }
  return false
}

const handler = async (m, { conn, command, usedPrefix, text }) => {
  const cmd = command.toLowerCase()
  const sender = m.sender
  const user = getUser(sender)
  const now = Date.now()

  // === DAILY ===
  if (cmd === 'daily' || cmd === 'claimdaily') {
    if (now - (user.lastDaily || 0) < COOLDOWNS.daily) {
      const remaining = COOLDOWNS.daily - (now - user.lastDaily)
      return m.reply(`⏰ Daily sudah diklaim! Tunggu *${fmtTime(remaining)}* lagi.`)
    }
    
    const streak = user.dailyStreak || 0
    const baseReward = 1000
    const streakBonus = Math.min(streak, 7) * 200
    const levelBonus = (user.level || 1) * 50
    const total = baseReward + streakBonus + levelBonus
    
    user.balance = (user.balance || 0) + total
    const previousDaily = user.lastDaily || 0
    user.lastDaily = now
    user.dailyStreak = (now - previousDaily < 48 * 60 * 60 * 1000) ? streak + 1 : 1
    
    const leveled = addExp(user, 20)
    
    let txt = `╔══ *🎁 DAILY REWARD* ══╗\n\n`
    txt += `💰 Base: ${fmtRp(baseReward)}\n`
    txt += `🔥 Streak (${user.dailyStreak} hari): +${fmtRp(streakBonus)}\n`
    txt += `⭐ Level ${(user.level || 1)}: +${fmtRp(levelBonus)}\n`
    txt += `━━━━━━━━━━━━━━━━\n`
    txt += `💎 Total: *${fmtRp(total)}*\n`
    txt += `💰 Balance: ${fmtRp(user.balance)}\n`
    if (leveled) txt += `\n🎉 *LEVEL UP! Level ${user.level}!*\n`
    txt += `\n╚═══════════════╝`
    
    return m.reply(txt)
  }

  // === WORK ===
  if (cmd === 'work' || cmd === 'kerja') {
    if (now - (user.lastWork || 0) < COOLDOWNS.work) {
      const remaining = COOLDOWNS.work - (now - user.lastWork)
      return m.reply(`⏰ Istirahat dulu! Tunggu *${fmtTime(remaining)}* lagi.`)
    }
    
    const job = pick(JOBS)
    const earned = rand(job.min, job.max)
    const levelBonus = Math.floor(earned * 0.1 * (user.level || 1))
    const total = earned + levelBonus
    
    user.balance = (user.balance || 0) + total
    user.lastWork = now
    const leveled = addExp(user, rand(5, 15))
    
    let txt = `${job.text}\n\n`
    txt += `💰 Earned: *${fmtRp(total)}*`
    if (levelBonus > 0) txt += ` (+${fmtRp(levelBonus)} level bonus)`
    txt += `\n💼 Balance: ${fmtRp(user.balance)}`
    if (leveled) txt += `\n🎉 *LEVEL UP! Level ${user.level}!*`
    
    return m.reply(txt)
  }

  // === HUNT ===
  if (cmd === 'hunt' || cmd === 'berburu') {
    if (now - (user.lastHunt || 0) < COOLDOWNS.hunt) {
      const remaining = COOLDOWNS.hunt - (now - user.lastHunt)
      return m.reply(`⏰ Stamina habis! Tunggu *${fmtTime(remaining)}* lagi.`)
    }
    
    const monster = pick(MONSTERS)
    const reward = rand(monster.reward[0], monster.reward[1])
    const xp = rand(monster.xp[0], monster.xp[1])
    
    // 15% chance to fail
    if (Math.random() < 0.15) {
      user.lastHunt = now
      addExp(user, Math.floor(xp * 0.3))
      return m.reply(`${monster.emoji} *${monster.name}* menyerang balik!\n💀 Kamu kalah dan harus kabur.\n⚡ +${Math.floor(xp * 0.3)} XP (pengalaman bertahan)`)
    }
    
    user.balance = (user.balance || 0) + reward
    user.lastHunt = now
    addDrop(user, monster.drop)
    const leveled = addExp(user, xp)
    
    let txt = `⚔️ *BERBURU BERHASIL!*\n\n`
    txt += `${monster.emoji} Musuh: *${monster.name}*\n`
    txt += `💰 Reward: *${fmtRp(reward)}*\n`
    txt += `📦 Drop: ${monster.drop}\n`
    txt += `⚡ XP: +${xp}\n`
    txt += `💰 Balance: ${fmtRp(user.balance)}`
    if (leveled) txt += `\n🎉 *LEVEL UP! Level ${user.level}!*`
    
    return m.reply(txt)
  }

  // === MINE ===
  if (cmd === 'mine' || cmd === 'tambang' || cmd === 'menambang') {
    if (now - (user.lastMine || 0) < COOLDOWNS.mine) {
      const remaining = COOLDOWNS.mine - (now - user.lastMine)
      return m.reply(`⏰ Capek menambang! Tunggu *${fmtTime(remaining)}* lagi.`)
    }
    
    const mineral = pickWeighted(MINERALS)
    const reward = rand(mineral.reward[0], mineral.reward[1])
    const levelBonus = Math.floor(reward * 0.05 * (user.level || 1))
    const total = reward + levelBonus
    
    user.balance = (user.balance || 0) + total
    user.lastMine = now
    addDrop(user, mineral.name)
    const leveled = addExp(user, rand(8, 20))
    
    let txt = `⛏️ *MENAMBANG*\n\n`
    txt += `${mineral.emoji} Kamu menemukan: *${mineral.name}*\n`
    txt += `💰 Reward: *${fmtRp(total)}*\n`
    txt += `💰 Balance: ${fmtRp(user.balance)}`
    if (leveled) txt += `\n🎉 *LEVEL UP! Level ${user.level}!*`
    
    return m.reply(txt)
  }

  // === FARM ===
  if (cmd === 'farm' || cmd === 'kebun' || cmd === 'berkebun') {
    if (now - (user.lastFarm || 0) < COOLDOWNS.farm) {
      const remaining = COOLDOWNS.farm - (now - user.lastFarm)
      return m.reply(`⏰ Tanaman belum panen! Tunggu *${fmtTime(remaining)}* lagi.`)
    }
    
    const crop = pick(CROPS)
    const reward = rand(crop.reward[0], crop.reward[1])
    const levelBonus = Math.floor(reward * 0.08 * (user.level || 1))
    const total = reward + levelBonus
    
    user.balance = (user.balance || 0) + total
    user.lastFarm = now
    addDrop(user, crop.name)
    const leveled = addExp(user, rand(10, 25))
    
    let txt = `🌾 *PANEN BERHASIL!*\n\n`
    txt += `${crop.emoji} Panen: *${crop.name}*\n`
    txt += `⏱️ Waktu: ${crop.time}\n`
    txt += `💰 Reward: *${fmtRp(total)}*\n`
    txt += `💰 Balance: ${fmtRp(user.balance)}`
    if (leveled) txt += `\n🎉 *LEVEL UP! Level ${user.level}!*`
    
    return m.reply(txt)
  }

  // === FISH ===
  if (cmd === 'fish' || cmd === 'mancing' || cmd === 'memancing') {
    if (now - (user.lastFish || 0) < COOLDOWNS.fish) {
      const remaining = COOLDOWNS.fish - (now - user.lastFish)
      return m.reply(`⏰ Kail masih dijemur! Tunggu *${fmtTime(remaining)}* lagi.`)
    }
    
    const fish = pickWeighted(FISH)
    const reward = rand(fish.reward[0], fish.reward[1])
    
    user.balance = (user.balance || 0) + reward
    user.lastFish = now
    addDrop(user, `${fish.name} (${fish.weight})`)
    const leveled = addExp(user, rand(5, 18))
    
    let txt = `🎣 *MEMANCING*\n\n`
    txt += `${fish.emoji} Kamu mendapat: *${fish.name}*\n`
    txt += `⚖️ Berat: ${fish.weight}\n`
    txt += `💰 Reward: *${fmtRp(reward)}*\n`
    txt += `💰 Balance: ${fmtRp(user.balance)}`
    if (leveled) txt += `\n🎉 *LEVEL UP! Level ${user.level}!*`
    
    return m.reply(txt)
  }

  // === ROB ===
  if (cmd === 'rob' || cmd === 'rampok') {
    if (now - (user.lastRob || 0) < COOLDOWNS.rob) {
      const remaining = COOLDOWNS.rob - (now - user.lastRob)
      return m.reply(`⏰ Polisi masih patroli! Tunggu *${fmtTime(remaining)}* lagi.`)
    }
    
    // Need target
    const target = m.mentionedJid?.[0]
    if (!target) return m.reply(`Format: *${usedPrefix}rob @user*\n⚠️ Merampok berisiko!`)
    if (target === sender || (unifiedRpg() && unifiedRpg().identity(target) === unifiedRpg().identity(sender))) return m.reply('❌ Tidak bisa merampok diri sendiri!')
    
    const targetUser = getUser(target)
    const targetBalance = targetUser.balance || 0
    
    if (targetBalance < 100) return m.reply('❌ Target terlalu miskin untuk dirampok!')
    
    user.lastRob = now
    
    // 40% chance to fail (get caught)
    if (Math.random() < 0.4) {
      const fine = rand(500, 2000)
      user.balance = Math.max(0, (user.balance || 0) - fine)
      return m.reply(`🚔 *KAMU KETAHUAN!*\n\nPolisi menangkapmu!\n💸 Denda: *${fmtRp(fine)}*\n💰 Balance: ${fmtRp(user.balance)}`)
    }
    
    // Success: take 10-30% of target's balance
    const percent = rand(10, 30) / 100
    const stolen = Math.min(Math.floor(targetBalance * percent), 10000)
    
    user.balance = (user.balance || 0) + stolen
    targetUser.balance = Math.max(0, targetBalance - stolen)
    addExp(user, rand(10, 30))
    
    let txt = `🦹 *MERAMPOK BERHASIL!*\n\n`
    txt += `👤 Target: @${target.split('@')[0]}\n`
    txt += `💰 Didapat: *${fmtRp(stolen)}*\n`
    txt += `💰 Balance: ${fmtRp(user.balance)}\n`
    txt += `\n⚠️ Jangan ketahuan polisi!`
    
    return m.reply(txt, null, { mentions: [target] })
  }

  // === ADVENTURE ===
  if (cmd === 'adventure' || cmd === 'petualangan') {
    if (now - (user.lastAdventure || 0) < COOLDOWNS.adventure) {
      const remaining = COOLDOWNS.adventure - (now - user.lastAdventure)
      return m.reply(`⏰ Butuh istirahat! Tunggu *${fmtTime(remaining)}* lagi.`)
    }
    
    const adv = pick(ADVENTURES)
    
    // 20% chance to fail
    if (Math.random() < 0.2) {
      user.lastAdventure = now
      addExp(user, 10)
      return m.reply(`${adv.emoji} *${adv.name}*\n\n💀 Petualangan gagal! Kamu terjebak dan harus kabur.\n⚡ +10 XP\n💰 Balance: ${fmtRp(user.balance || 0)}`)
    }
    
    const reward = rand(adv.reward[0], adv.reward[1])
    const xp = rand(adv.xp[0], adv.xp[1])
    const levelBonus = Math.floor(reward * 0.1 * (user.level || 1))
    const total = reward + levelBonus
    
    user.balance = (user.balance || 0) + total
    user.lastAdventure = now
    const leveled = addExp(user, xp)
    
    let txt = `${adv.emoji} *PETUALANGAN!*\n\n`
    txt += `📍 ${adv.name}\n${adv.desc}\n\n`
    txt += `💰 Reward: *${fmtRp(total)}*\n`
    txt += `⚡ XP: +${xp}\n`
    txt += `💰 Balance: ${fmtRp(user.balance)}`
    if (leveled) txt += `\n🎉 *LEVEL UP! Level ${user.level}!*`
    
    return m.reply(txt)
  }

  // === GIVE / TRANSFER ===
  if (cmd === 'give' || cmd === 'tf' || cmd === 'transfer') {
    const target = m.mentionedJid?.[0]
    if (!target) return m.reply(`Format: *${usedPrefix}give @user <jumlah>*`)
    if (target === sender || (unifiedRpg() && unifiedRpg().identity(target) === unifiedRpg().identity(sender))) return m.reply('❌ Tidak bisa transfer ke diri sendiri!')
    
    const amountText = String(text || '').trim().split(/\s+/).filter(x => !/^@\d+$/.test(x)).join(' ')
    const amount = /^\d+$/.test(amountText) ? Number(amountText) : NaN
    if (!Number.isSafeInteger(amount) || amount <= 0) return m.reply('❌ Jumlah tidak valid!')
    
    if ((user.balance || 0) < amount) return m.reply(`❌ Saldo tidak cukup! Balance: ${fmtRp(user.balance || 0)}`)
    
    const targetUser = getUser(target)
    user.balance -= amount
    targetUser.balance = (targetUser.balance || 0) + amount
    
    return m.reply(`✅ Transfer berhasil!\n💸 ${fmtRp(amount)} → @${target.split('@')[0]}\n💰 Balance kamu: ${fmtRp(user.balance)}`, null, { mentions: [target] })
  }

  // === LEADERBOARD ===
  if (cmd === 'leaderboard' || cmd === 'lb' || cmd === 'top') {
    const users = global.db.data.users || {}
    const seen = new Set()
    const sorted = Object.entries(users)
      .filter(([jid]) => { const id = unifiedRpg() ? unifiedRpg().identity(jid) : jid; if (!id || seen.has(id) || !/@(s\.whatsapp\.net|lid)$/.test(jid)) return false; seen.add(id); return true })
      .map(([jid, u]) => ({ jid, balance: u.balance || 0, level: u.level || 1 }))
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 10)
    
    if (!sorted.length) return m.reply('📊 Belum ada data user.')
    
    let txt = '╔══ *🏆 LEADERBOARD* ══╗\n\n'
    const medals = ['🥇', '🥈', '🥉']
    
    sorted.forEach((u, i) => {
      const medal = medals[i] || `${i + 1}.`
      const isYou = u.jid === sender ? ' ⬅️' : ''
      txt += `${medal} @${u.jid.split('@')[0]}\n   💰 ${fmtRp(u.balance)} | ⭐ Lv.${u.level}${isYou}\n\n`
    })
    
    txt += '╚═══════════════╝'
    
    return m.reply(txt, null, { mentions: sorted.map(u => u.jid) })
  }
}

handler.help = [
  'daily', 'work', 'hunt', 'mine', 'farm', 'fish', 'rob',
  'adventure', 'give @user <jumlah>', 'leaderboard'
]
handler.tags = ['rpg']
handler.command = /^(daily|claimdaily|work|kerja|hunt|berburu|mine|tambang|menambang|farm|kebun|berkebun|fish|mancing|memancing|rob|rampok|adventure|petualangan|give|tf|transfer|leaderboard|lb|top)$/i
handler.limit = false

export default handler