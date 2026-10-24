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

const pick = arr => arr[Math.floor(Math.random() * arr.length)]

const kataPutus = [
  ' Hubungan kalian telah berakhir.',
  ' Semoga kalian menemukan kebahagiaan masing-masing.',
  ' Semua ada masanya, tetap semangat ya.',
  ' Terima kasih atas cerita yang pernah kalian jalani.',
  ' Jangan sedih, mungkin ini memang yang terbaik.'
]

let handler = async (m, { conn }) => {
  let user = createUser(m.sender)

  if (!user.relationship.pasangan)
    return m.reply(' Kamu belum mempunyai pasangan.')

  let pasangan = user.relationship.pasangan
  let partner = createUser(pasangan)

  // Reset kedua belah pihak
  user.relationship = {
    pasangan: '',
    pending: '',
    dari: '',
    sejak: 0
  }

  // Hanya reset pasangan jika memang masih saling terhubung
  if (partner.relationship.pasangan === m.sender) {
    partner.relationship = {
      pasangan: '',
      pending: '',
      dari: '',
      sejak: 0
    }
  }

  conn.reply(
    m.chat,
    ` *KALIAN RESMI PUTUS!*\n\n` +
    `${tag(m.sender)}  ${tag(pasangan)}\n\n` +
    `${pick(kataPutus)}`,
    m,
    {
      mentions: [m.sender, pasangan]
    }
  )
}

handler.help = ['putus']
handler.tags = ['fun']
handler.command = /^putus$/i
handler.group = true

export default handler