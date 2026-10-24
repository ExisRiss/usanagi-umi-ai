/* By AlzRiss - Usanagi Umi AI */

import { profilePhoto } from '../../lib/profile-photo.js'
import PhoneNumber from 'awesome-phonenumber'
import moment from 'moment-timezone'
import { isOwner as checkOwner, resolveTargetPhoneNumber } from '../../lib/awang-cekakses.js'
import { calculateAge, formatBirthday, parseBirthday } from '../../lib/profile-data.js'

const toNumber = (value, fallback = 0) => {
  const result = Number(value)
  return Number.isFinite(result) ? result : fallback
}

const handler = async (m, { conn, usedPrefix }) => {
  const requestedJid = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
  const resolvedNumber = await resolveTargetPhoneNumber(requestedJid, conn, m.chat).catch(() => '')
  const canonicalJid = resolvedNumber ? `${resolvedNumber}@s.whatsapp.net` : requestedJid
  const users = global.db.data.users || {}
  const user = users[requestedJid] || users[canonicalJid]

  if (!user) return m.reply('AlzRiss tidak menemukan user di database 🥜')

  if (!Number.isFinite(Number(user.limit))) user.limit = 0
  if (!Number.isFinite(Number(user.level))) user.level = 0
  if (!Number.isFinite(Number(user.exp))) user.exp = 0
  if (!Number.isFinite(Number(user.premiumTime))) user.premiumTime = 0

  const owner = await checkOwner(requestedJid, conn).catch(() => false)
  const name = user.registered && user.name ? user.name : await conn.getName(requestedJid)
  const rawNumber = resolvedNumber || requestedJid.split('@')[0].split(':')[0]
  let number = `+${rawNumber}`
  try { number = PhoneNumber('+' + rawNumber).getNumber('international') || number } catch {}

  const pp = await profilePhoto(conn, requestedJid)

  let bio
  try { bio = (await conn.fetchStatus(requestedJid))?.status || 'Tidak ada bio' }
  catch { bio = 'Tidak ada bio' }

  const week = moment().tz('Asia/Jakarta').format('dddd')
  const date = moment().tz('Asia/Jakarta').format('DD MMMM YYYY')
  const time = moment().tz('Asia/Jakarta').format('HH:mm:ss')

  const role = owner ? 'Owner' : (user.role || 'Peanut Beginner')
  const level = toNumber(user.level)
  const exp = toNumber(user.exp)
  const premiumTime = toNumber(user.premiumTime)
  const registered = Boolean(user.registered)
  const premium = owner || premiumTime > 0 ? 'Yes 🌟' : 'No 🥜'
  const limit = owner ? 'Unlimited' : String(toNumber(user.limit))

  // Umur registrasi tetap ditampilkan walaupun tanggal lahir belum diatur.
  const birthday = parseBirthday(user.birthday)
  const birthdayAge = calculateAge(birthday)
  const storedAge = toNumber(user.age, -1)
  const age = birthdayAge !== null ? birthdayAge : (storedAge >= 0 ? storedAge : null)
  const birthdayText = formatBirthday(birthday)

  const text = `
🍿 *AlzRiss Secret Profile*

🎀 *Nama* : ${name || 'User'}
🎂 *Umur* : ${age !== null ? `${age} tahun` : '-'}
🎉 *Birthday* : ${birthdayText}
💭 *Bio* : ${bio}

🧸 *Tag* : @${rawNumber}
📱 *Nomor* : ${number}

╭─⬣
│ 🏅 Role : ${role}
│ ✅ Terdaftar : ${registered ? 'Ya' : 'Belum'}
│ ⭐ Level : ${level}
│ ✨ Exp : ${exp}
│ 🎟️ Limit : ${limit}
│ 💎 Premium : ${premium}
╰────────────⬣

${birthday ? '' : `Atur tanggal lahir: ${usedPrefix}setbirthday DD-MM-YYYY\n`}
📅 ${week}, ${date}
⏰ ${time}

🥜 *Waku waku~*
`.trim()

  await conn.sendMessage(m.chat, {
    ...(pp ? { image: pp, caption: text } : { text }),
    mentions: [requestedJid]
  }, { quoted: m.raw || m })
}

handler.help = ['profile', 'profil', 'me', 'my']
handler.tags = ['info', 'xp']
handler.command = /^(profile|profil|me|my)$/i
handler.limit = false

export default handler
