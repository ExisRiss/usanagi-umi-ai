
import { parsePremiumDuration, premiumDurationHelp } from '../../lib/premium-duration.js'

const MAX_DATE_MS = 8_640_000_000_000_000

function phoneFromToken(token = '') {
  const number = String(token).replace(/\D/g, '')
  return number.length >= 8 && number.length <= 15 ? `${number}@s.whatsapp.net` : ''
}

function resolveTarget(m, args, ignoredIndex = -1) {
  if (m.quoted?.sender) return m.quoted.sender
  if (m.mentionedJid?.length) return m.mentionedJid[0]

  for (let index = 0; index < args.length; index++) {
    if (index === ignoredIndex) continue
    const jid = phoneFromToken(args[index])
    if (jid) return jid
  }
  return ''
}

function findDuration(args, hasMessageTarget) {
  // Format baru boleh ditempatkan sebelum atau sesudah target.
  for (let index = 0; index < args.length; index++) {
    const duration = parsePremiumDuration(args[index])
    if (duration) return { duration, index }
  }

  // Kompatibilitas format lama: addprem 30 @tag / reply (angka = hari).
  for (let index = 0; index < args.length; index++) {
    const token = String(args[index] || '')
    if (!/^\d+$/.test(token)) continue
    if (!hasMessageTarget && token.length >= 8) continue
    const duration = parsePremiumDuration(token, { allowLegacyDays: true })
    if (duration) return { duration, index }
  }

  // Kompatibilitas format target-dulu tanpa huruf: addprem 628xx 30.
  for (let index = 0; index < args.length; index++) {
    const token = String(args[index] || '')
    if (!/^\d{1,7}$/.test(token)) continue
    const duration = parsePremiumDuration(token, { allowLegacyDays: true })
    if (duration) return { duration, index }
  }

  return { duration: null, index: -1 }
}

function formatDateTime(milliseconds) {
  return new Date(milliseconds).toLocaleString('id-ID', {
    timeZone: 'Asia/Makassar',
    dateStyle: 'full',
    timeStyle: 'medium',
  })
}

async function saveDatabase() {
  if (typeof global.db?.saveDatabase === 'function') await global.db.saveDatabase()
  else if (typeof global.db?.write === 'function') await global.db.write()
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const deleting = /^(del|hapus|-)p(rem)?$/i.test(command)

  if (deleting) {
    const who = resolveTarget(m, args)
    if (!who) {
      throw `Gunakan ${usedPrefix}${command} <nomor/@tag>, atau reply pesan target.`
    }
    const user = global.db.data.users[who]
    if (!user) throw 'User tidak ditemukan di database.'
    user.premium = false
    user.premiumTime = 0
    user.isUnlimitedLimit = false
    await saveDatabase()
    return conn.sendMessage(m.chat, {
      text: `✅ Status Premium @${who.split('@')[0]} berhasil dihapus.`,
      mentions: [who],
    }, { quoted: m })
  }

  const hasMessageTarget = Boolean(m.quoted?.sender || m.mentionedJid?.length)
  const { duration, index: durationIndex } = findDuration(args, hasMessageTarget)
  if (!duration) throw premiumDurationHelp(usedPrefix, command)

  const who = resolveTarget(m, args, durationIndex)
  if (!who) throw premiumDurationHelp(usedPrefix, command)

  if (!global.db.data.users[who]) {
    let name = 'Unknown'
    try { name = await conn.getName(who) || name } catch {}
    global.db.data.users[who] = {
      name,
      limit: 10,
      exp: 0,
      level: 0,
      registered: false,
      premium: false,
      premiumTime: 0,
    }
  }

  const user = global.db.data.users[who]
  const now = Date.now()
  let expiration
  let practicallyPermanent = duration.permanent || duration.overflow

  if (practicallyPermanent) {
    expiration = MAX_DATE_MS
  } else {
    const currentExpiration = Number(user.premiumTime)
    const base = Number.isFinite(currentExpiration) && currentExpiration > now
      ? currentExpiration
      : now

    if (currentExpiration >= MAX_DATE_MS || duration.milliseconds > MAX_DATE_MS - base) {
      expiration = MAX_DATE_MS
      practicallyPermanent = true
    } else {
      expiration = base + duration.milliseconds
    }
  }

  user.premium = true
  user.premiumTime = expiration
  user.isUnlimitedLimit = true
  await saveDatabase()

  const durationText = duration.permanent ? 'Permanen' : duration.label
  const expirationText = practicallyPermanent
    ? 'Praktis Permanen (batas maksimum kalender sistem)'
    : `${formatDateTime(expiration)} WITA`
  const text = [
    '✅ *PREMIUM BERHASIL DITAMBAHKAN*',
    '',
    `👤 User: @${who.split('@')[0]}`,
    `⏳ Durasi diminta: *${durationText}*`,
    `🕒 Diproses: ${formatDateTime(now)} WITA`,
    `📅 Berakhir: ${expirationText}`,
    practicallyPermanent && !duration.permanent
      ? 'ℹ️ Durasi sangat besar otomatis disimpan sebagai Premium praktis permanen.'
      : '',
    '♾️ Limit penggunaan: Unlimited selama Premium aktif',
  ].filter(Boolean).join('\n')

  await conn.sendMessage(m.chat, { text, mentions: [who] }, { quoted: m })
}

handler.help = [
  'addprem <nomor/@tag> <durasi>',
  'addprem <durasi> (reply pesan)',
  'delprem <nomor/@tag/reply>',
]
handler.tags = ['owner']
handler.command = /^(add|tambah|\+|del|hapus|-)p(rem)?$/i
handler.owner = true

export default handler
