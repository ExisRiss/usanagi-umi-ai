const createUser = (jid) => {
  const users = global.db.data.users

  if (!users[jid]) users[jid] = {}

  if (!users[jid].relationship) {
    users[jid].relationship = {
      pasangan: '',
      pending: '',
      dari: '',
      sejak: 0
    }
  }

  return users[jid]
}

const tag = jid => '@' + jid.split('@')[0]

function formatDuration(ms) {
  if (!ms || ms < 1000) return 'Baru jadian 💖'

  const hari = Math.floor(ms / 86400000)
  const jam = Math.floor(ms % 86400000 / 3600000)
  const menit = Math.floor(ms % 3600000 / 60000)

  let hasil = []

  if (hari) hasil.push(`${hari} Hari`)
  if (jam) hasil.push(`${jam} Jam`)
  if (menit) hasil.push(`${menit} Menit`)

  return hasil.join(' ')
}

let handler = async (m, { conn }) => {
  let user = createUser(m.sender)

  if (!user.relationship.pasangan)
    return m.reply('💔 Kamu belum mempunyai pasangan.')

  let pasangan = user.relationship.pasangan
  let partner = createUser(pasangan)

  // Sinkronisasi database
  if (partner.relationship.pasangan !== m.sender) {
    user.relationship = {
      pasangan: '',
      pending: '',
      dari: '',
      sejak: 0
    }

    return m.reply(
      '❌ Hubungan sudah tidak valid.\n' +
      'Data pasangan berhasil disinkronkan.'
    )
  }

  let durasi = formatDuration(
    Date.now() - (user.relationship.sejak || Date.now())
  )

  conn.reply(
    m.chat,
`╭──〔 💖 PASANGANKU 〕
│
├ 👤 Kamu
│ ${tag(m.sender)}
│
├ ❤️ Pasangan
│ ${tag(pasangan)}
│
├ ⏳ Durasi
│ ${durasi}
│
╰────────────`,
    m,
    {
      mentions: [m.sender, pasangan]
    }
  )
}

handler.help = ['pasanganku', 'pacarku']
handler.tags = ['fun']
handler.command = /^(pasanganku|pacarku)$/i
handler.group = true

export default handler