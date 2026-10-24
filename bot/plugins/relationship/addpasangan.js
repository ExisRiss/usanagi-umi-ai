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

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let user1 = null
  let user2 = null

  // Mention 2 orang
  if (m.mentionedJid.length >= 2) {
    user1 = m.mentionedJid[0]
    user2 = m.mentionedJid[1]
  }

  // Reply + nomor
  else if (m.quoted && text) {
    let nomor = text.replace(/[^0-9]/g, '')
    if (!nomor)
      return m.reply(
        `Contoh:\n${usedPrefix + command} @user1 @user2\n${usedPrefix + command} 628xxxx 628xxxx`
      )

    user1 = m.quoted.sender
    user2 = nomor + '@s.whatsapp.net'
  }

  // Dua nomor
  else if (text) {
    let nomor = text
      .split(/\s+/)
      .map(v => v.replace(/[^0-9]/g, ''))
      .filter(Boolean)

    if (nomor.length >= 2) {
      user1 = nomor[0] + '@s.whatsapp.net'
      user2 = nomor[1] + '@s.whatsapp.net'
    }
  }

  if (!user1 || !user2) {
    return m.reply(
`Contoh penggunaan:

${usedPrefix + command} @user1 @user2

${usedPrefix + command} 628xxxxxxxxxx 628xxxxxxxxxx

Atau reply salah satu user:

${usedPrefix + command} 628xxxxxxxxxx`
    )
  }

  if (user1 === user2)
    return m.reply('❌ Tidak bisa memasangkan user yang sama.')

  if (user1 === conn.user.jid || user2 === conn.user.jid)
    return m.reply('❌ Bot tidak bisa dijadikan pasangan.')

  let a = createUser(user1)
  let b = createUser(user2)

  // Putuskan pasangan lama user1
  if (a.relationship.pasangan) {
    let ex = createUser(a.relationship.pasangan)

    if (ex.relationship.pasangan === user1) {
      ex.relationship = {
        pasangan: '',
        pending: '',
        dari: '',
        sejak: 0
      }
    }
  }

  // Putuskan pasangan lama user2
  if (b.relationship.pasangan) {
    let ex = createUser(b.relationship.pasangan)

    if (ex.relationship.pasangan === user2) {
      ex.relationship = {
        pasangan: '',
        pending: '',
        dari: '',
        sejak: 0
      }
    }
  }

  const now = Date.now()

  a.relationship = {
    pasangan: user2,
    pending: '',
    dari: '',
    sejak: now
  }

  b.relationship = {
    pasangan: user1,
    pending: '',
    dari: '',
    sejak: now
  }

  conn.reply(
    m.chat,
`💖 *BERHASIL DIPASANGKAN*

${tag(user1)} ❤️ ${tag(user2)}

Mereka kini resmi menjadi pasangan.`,
    m,
    {
      mentions: [user1, user2]
    }
  )
}

handler.help = ['addpasangan']
handler.tags = ['owner']
handler.command = /^addpasangan$/i
handler.owner = true

export default handler