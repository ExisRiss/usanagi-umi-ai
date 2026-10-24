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

const kataTerima = [
  '💖 Akhirnya cinta kalian bersatu!',
  '🥰 Selamat! Semoga hubungan kalian langgeng.',
  '🎉 Ciee... resmi jadian nih!',
  '❤️ Semoga selalu saling menjaga satu sama lain.',
  '💕 Selamat atas hubungan barunya!'
]

let handler = async (m, { conn }) => {
  let user = createUser(m.sender)

  if (!user.relationship.dari)
    return m.reply('❌ Tidak ada yang sedang menembak kamu.')

  let penembak = user.relationship.dari
  let target = createUser(penembak)

  if (user.relationship.pasangan)
    return m.reply('💔 Kamu sudah mempunyai pasangan.')

  if (target.relationship.pasangan)
    return m.reply('💔 Dia sudah mempunyai pasangan.')

  const now = Date.now()

  user.relationship = {
    pasangan: penembak,
    pending: '',
    dari: '',
    sejak: now
  }

  target.relationship = {
    pasangan: m.sender,
    pending: '',
    dari: '',
    sejak: now
  }

  conn.reply(
    m.chat,
    `🎉 *RESMI JADIAN!*\n\n` +
    `${tag(m.sender)} ❤️ ${tag(penembak)}\n\n` +
    `${pick(kataTerima)}`,
    m,
    {
      mentions: [m.sender, penembak]
    }
  )
}

handler.help = ['terima']
handler.tags = ['fun']
handler.command = /^terima$/i
handler.group = true

export default handler