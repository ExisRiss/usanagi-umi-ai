import { createHash } from 'crypto'
import moment from 'moment-timezone'
import { provisionTrading, tradingLine } from '../../lib/trading-provision.js'

let Reg = /^([\w\s]+)\s*[,.|:\/-]\s*(\d{1,3})$/i

let handler = async (m, { text, usedPrefix, command, conn }) => {
  if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
  let user = global.db.data.users[m.sender]
  let sn = createHash('md5').update(m.sender).digest('hex')

  if (user.registered) {
    return m.reply(`🍓 Kamu sudah terdaftar di Usanagi Umi AI\n\nKetik:\n${usedPrefix}unreg ${sn}`)
  }

  if (!Reg.test(text)) {
    return m.reply(`🍰 Format salah

Contoh:
${usedPrefix + command} usanagi,17

Gunakan format yang benar`)
  }

  let [_, name, ageStr] = text.match(Reg)
  name = name.trim()
  let age = parseInt(ageStr)

  if (!name || !age) return m.reply('🍓 Nama atau umur tidak valid')
  if (name.length > 100) return m.reply('🍰 Nama maksimal 100 karakter')
  if (age < 5 || age > 100) return m.reply('🍡 Umur harus 5 - 100')

  let d = new Date()
  let week = d.toLocaleDateString('id', { weekday: 'long' })
  let date = d.toLocaleDateString('id', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  let time = moment.tz('Asia/Jakarta').format('HH:mm:ss')

  user.name = name
  user.age = age
  user.regTime = +new Date()
  user.registered = true

  // Simpan segera agar status daftar tidak hilang ketika bot reconnect/crash
  // sebelum jadwal autosave database berikutnya.
  await global.db.write().catch(error => console.error('[REGISTER SAVE]', error))

  // Akun UMI TRADE ($AS) dibuat otomatis: username = nomor WhatsApp user.
  // Kalau server game sedang tidak bisa dihubungi, user tetap terdaftar dan
  // akun trading akan dibuat saat dia mengirim .trading.
  let tradingInfo = ''
  try {
    const trading = await provisionTrading(m.sender, { username: name, name })
    tradingInfo = tradingLine(trading)
  } catch (error) {
    console.error('[TRADING PROVISION]', error && error.message)
    tradingInfo = '💹 Akun trading menyusul — kirim .trading untuk membuatnya'
  }

  let caption = `
🍓 PENDAFTARAN BERHASIL 🍓

🍰 Nama : ${name}
🍡 Umur : ${age}
🍧 SN   : ${sn}

🍥 Tanggal : ${week}, ${date}
🧃 Waktu   : ${time}

✨ Data berhasil disimpan di Usanagi Umi AI
${tradingInfo ? '\n' + tradingInfo : ''}
`.trim()

  await conn.sendMessage(m.chat, {
    image: {
      url: 'https://raw.githubusercontent.com/hamm-r/uploader/main/1779255801770-854.jpg'
    },
    caption,
    footer: 'By AlzRiss - Usanagi Umi AI',

    optionText: 'Pilih Menu',
    optionTitle: 'Daftar',

    nativeFlow: [
      {
        text: 'Menu',
        sections: [
          {
            title: 'Main',
            rows: [
              {
                title: 'Menu Utama',
                id: '.menu'
              }
            ]
          }
        ]
      },
      {
        text: 'Copy SN',
        copy: sn
      }
    ]

  }, { quoted: m })
}

handler.help = ['daftar nama,umur']
handler.tags = ['main']
handler.command = /^(daftar|verify|reg(ister)?)$/i

export default handler