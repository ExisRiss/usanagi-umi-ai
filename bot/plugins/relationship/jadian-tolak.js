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

const kataTolak = [
  '💔 Maaf... sepertinya kita cukup jadi teman saja.',
  '🥲 Jangan menyerah, mungkin jodohmu bukan dia.',
  '😔 Yahh... cintamu belum diterima.',
  '💙 Tetap semangat ya, masih banyak yang lain.',
  '🌹 Terima kasih sudah berani mengungkapkan perasaanmu.'
]

let handler = async (m, { conn }) => {
  let user = createUser(m.sender)

  if (!user.relationship.dari)
    return m.reply('❌ Tidak ada yang sedang menembak kamu.')

  let penembak = user.relationship.dari
  let target = createUser(penembak)

  user.relationship.dari = ''

  if (
    target.relationship.pending &&
    target.relationship.pending === m.sender
  ) {
    target.relationship.pending = ''
  }

  conn.reply(
    m.chat,
    `💔 *TEMBAKAN DITOLAK!*\n\n` +
    `${tag(m.sender)} menolak perasaan ${tag(penembak)}.\n\n` +
    `${pick(kataTolak)}`,
    m,
    {
      mentions: [m.sender, penembak]
    }
  )
}

handler.help = ['tolak']
handler.tags = ['fun']
handler.command = /^tolak$/i
handler.group = true

export default handler