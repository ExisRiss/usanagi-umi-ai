
let handler = async (m, { text }) => {
  let jumlah = Number(text)

  if (!Number.isInteger(jumlah) || jumlah < -1 || jumlah > 100000) {
    return m.reply(`❌ Masukkan -1 (unlimited) atau angka 0-100000.\n\nContoh:\n.resetlimit -1`)
  }

  let users = global.db.data.users
  let total = 0

  for (let jid in users) {
    let user = users[jid]
    if (!user) continue

    user.limit = jumlah
    total++
  }

  m.reply(
`✅ *RESET LIMIT GLOBAL BERHASIL*

👥 Total user : *${total} user*
🎯 Limit baru : *${jumlah === -1 ? 'Unlimited (-1)' : jumlah}*`
  )
}

handler.help = ['resetlimit <jumlah>']
handler.tags = ['owner']
handler.command = /^resetlimit$/i
handler.owner = true

export default handler