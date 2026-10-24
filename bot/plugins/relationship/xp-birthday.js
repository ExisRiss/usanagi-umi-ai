
import { calculateAge, formatBirthday, parseBirthday } from '../../lib/profile-data.js'

const handler = async (m) => {
  const db = global.db?.data?.users
  if (!db) return m.reply('❌ Database pengguna tidak ditemukan.')

  const target = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
  const user = db[target]
  const birthday = parseBirthday(user?.birthday)

  if (!birthday) {
    return m.reply(target === m.sender
      ? '❌ Kamu belum mengatur tanggal lahir. Gunakan .setbirthday DD-MM-YYYY.'
      : '❌ User belum mengatur tanggal lahir.')
  }

  const now = new Date()
  let next = new Date(now.getFullYear(), birthday.month - 1, birthday.day)
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (next < startToday) next = new Date(now.getFullYear() + 1, birthday.month - 1, birthday.day)
  const diff = Math.ceil((next - startToday) / 86400000)
  const isToday = now.getDate() === birthday.day && now.getMonth() + 1 === birthday.month
  const calculatedAge = calculateAge(birthday, now)
  const storedAge = Number(user.age)
  const age = calculatedAge !== null ? calculatedAge : (Number.isFinite(storedAge) && storedAge >= 0 ? storedAge : null)

  let text = `🎂 *BIRTHDAY INFO*\n\n`
  text += `👤 @${target.split('@')[0]}\n`
  text += `📅 ${formatBirthday(birthday)}\n`
  text += `🎂 Umur : ${age !== null ? `${age} tahun` : '-'}\n`
  text += isToday ? '🎉 HARI INI ULTAH!\n' : `⏳ ${diff} hari lagi\n`
  if (isToday) text += '\n🎊 HAPPY BIRTHDAY 🎊'

  await m.reply(text, { mentions: [target] })
}

handler.help = ['birthday', 'bday', 'ultah']
handler.tags = ['info', 'xp']
handler.command = /^(birthday|bday|ultah)$/i
handler.limit = false

export default handler
