/* By AlzRiss - Usanagi Umi AI */

import { calculateAge, formatBirthday, parseBirthday, serializeBirthday } from '../../lib/profile-data.js'

const handler = async (m, { text, usedPrefix, command }) => {
  const users = global.db?.data?.users
  if (!users) return m.reply('❌ Database pengguna tidak ditemukan.')

  if (!text) {
    return m.reply([
      '🎂 *ATUR TANGGAL LAHIR*',
      '',
      `Contoh: ${usedPrefix + command} 25-12-2005`,
      'Format lain yang didukung: 25/12/2005 atau 25 12 2005.',
      '',
      'Command yang sama dapat digunakan untuk mengubah tanggal lahir.'
    ].join('\n'))
  }

  const birthday = parseBirthday(text)
  if (!birthday) {
    return m.reply('❌ Tanggal tidak valid. Gunakan format DD-MM-YYYY, contoh 25-12-2005.')
  }

  const age = calculateAge(birthday)
  if (birthday.year && age === null) {
    return m.reply('❌ Tahun lahir tidak boleh berada di masa depan.')
  }

  if (!users[m.sender]) users[m.sender] = {}
  const user = users[m.sender]
  const changed = Boolean(user.birthday)
  user.birthday = serializeBirthday(birthday)
  if (age !== null) user.age = age

  // Persist langsung agar perubahan tidak hilang ketika bot reconnect.
  await global.db.write().catch(error => console.error('[BIRTHDAY SAVE]', error))

  await m.reply([
    `✅ Tanggal lahir berhasil ${changed ? 'diubah' : 'disimpan'}!`,
    `📅 ${formatBirthday(birthday)}`,
    `🎂 Umur: ${age !== null ? `${age} tahun` : `${Number(user.age) || '-'} tahun`}`,
    '',
    `Lihat profil dengan ${usedPrefix}me.`
  ].join('\n'))
}

handler.help = ['setbirthday DD-MM-YYYY', 'setlahir DD-MM-YYYY', 'setultah DD-MM-YYYY']
handler.tags = ['info', 'xp']
handler.command = /^(setbirthday|setlahir|setultah)$/i
handler.limit = false

export default handler
